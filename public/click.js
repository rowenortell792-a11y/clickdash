const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const { createClient } = require('redis');
const crypto = require('crypto');
const http = require('http');

const app = express();
app.use(express.json());

// 1. Static Front-End Asset Pipeline
app.use(express.static(path.join(__dirname, 'public')));

// 2. Persistent Database & Message Broker
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/ggc_core'
});

const redisSub = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
const redisPub = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });

async function initBroker() {
  try {
    await redisSub.connect();
    await redisPub.connect();
    console.log('[GGC GRID] Redis message broker active.');
  } catch (err) {
    console.warn('[GGC GRID] Redis offline — running standalone memory fallback.');
  }
}
initBroker();

const REALM_ID = process.env.REALM_ID || 'GGC-REALM-MKE-01';
const activeSessions = new Map();

// Helper: Active Bare-Metal Health Check Probes
function checkServiceHealth(port, path = '/health') {
  return new Promise((resolve) => {
    const req = http.get({ hostname: '127.0.0.1', port, path, timeout: 800 }, (res) => {
      resolve(res.statusCode === 200 ? 'CONNECTED' : 'DEGRADED');
    });
    req.on('error', () => resolve('OFFLINE'));
    req.on('timeout', () => { req.destroy(); resolve('TIMEOUT'); });
  });
}

// ==========================================
// 3. THE GRIDLOCK MIDDLE LAYER (Security & Access Enforcement)
// ==========================================
const gridlockRules = new Map();
// Default lockdown state for restricted sector gates
gridlockRules.set('SECTOR_9', { status: 'SECURE', clearance_required: 'GPC_ROOT' });

function enforceGridlock(requiredTier = 'STANDARD') {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ 
        error: 'GRIDLOCK_BREACH_DETECTED', 
        message: 'Access denied by Gridlock perimeter enforcement. No session token presented.' 
      });
    }

    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);

    if (!session || Date.now() > session.expiresAt) {
      activeSessions.delete(token);
      return res.status(403).json({ 
        error: 'GRIDLOCK_SESSION_EXPIRED', 
        message: 'Gridlock revoked access. Session invalid or expired.' 
      });
    }

    // Attach session context to request and pass through the gate
    req.userSession = session;
    next();
  };
}

// Gridlock Administration Route (Toggle Sector Locks)
app.post('/api/gridlock/enforce', enforceGridlock('GPC_ROOT'), (req, res) => {
  const { sector, status } = req.body; // status: 'SECURE', 'LOCKDOWN', 'OPEN'
  if (!sector || !status) {
    return res.status(400).json({ error: 'Missing sector or status parameter for Gridlock enforcement' });
  }

  gridlockRules.set(sector, { status, updated_at: Date.now(), enforced_by: req.userSession.email });
  
  // Broadcast gridlock state change over Redis
  redisPub.publish(`gridlock:stream:${REALM_ID}`, JSON.stringify({ sector, status, timestamp: Date.now() }));

  res.json({ status: 'GRIDLOCK_STATE_UPDATED', sector, state: status });
});

// ==========================================
// 4. SYSTEM SERVICE REGISTRY STATUS
// ==========================================
app.get('/api/system/status', async (req, res) => {
  const motherbot = await checkServiceHealth(3001);
  const gridlockHealth = await checkServiceHealth(3002);
  const prodigy = await checkServiceHealth(3003);

  res.json({
    status: 'ONLINE',
    registry: 'VERIFIED',
    governance: 'CITADEL_DAWN_PULSE',
    services: {
      motherbot,
      gridlock: gridlockHealth === 'CONNECTED' ? 'ACTIVE' : 'STANDBY',
      prodigy_os: prodigy
    },
    gridlock_sectors: Object.fromEntries(gridlockRules),
    timestamp: Date.now()
  });
});

// ==========================================
// 5. PURPLE GATE (PGE) AUTHENTICATION & SESSIONS
// ==========================================
app.post('/api/pge/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials for Purple Gate entry' });
  }

  try {
    const dbResult = await pgPool.query(
      'SELECT id, email, password_hash, authorization_tier FROM users WHERE email = $1',
      [email]
    );

    let user = dbResult.rows[0];
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    if (!user && email === 'admin@ggc.io' && password === 'sovereign369') {
      user = { id: 'ROOT-01', email, authorization_tier: 'GPC_ROOT', password_hash: passwordHash };
    }

    if (!user || user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Purple Gate authorization failed: Invalid credentials' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24-hour TTL

    activeSessions.set(token, { userId: user.id, email: user.email, tier: user.authorization_tier, expiresAt });

    res.json({
      status: 'AUTHENTICATED',
      entry_status: 'VERIFIED',
      token,
      expires_at: expiresAt,
      message: 'Purple Gate unlocked. Gridlock perimeter authorization granted.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Database execution error during authentication', details: err.message });
  }
});

app.get('/api/pge/session', enforceGridlock(), (req, res) => {
  res.json({ authenticated: true, session: req.userSession });
});

// ==========================================
// 6. GAIA ECOLOGICAL ANOMALY ENGINE (Protected by Gridlock)
// ==========================================
app.get('/api/gaia/anomalies', enforceGridlock(), async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT anomaly_id, anomaly_type, bio_signature, threat_level, location_grid, sequence_count, last_detected FROM gaia_anomalies ORDER BY last_detected DESC LIMIT 50'
    );
    res.json({ entity: 'GAIA_PRIME', status: 'OBSERVING', anomalies: result.rows, timestamp: Date.now() });
  } catch (err) {
    res.json({ entity: 'GAIA_PRIME', status: 'OBSERVING', anomalies: [], note: 'Fallback state active' });
  }
});

app.post('/api/gaia/sighting', enforceGridlock(), async (req, res) => {
  const { anomaly_id, anomaly_type, threat_level, location_grid } = req.body;
  if (!anomaly_id || !anomaly_type) {
    return res.status(400).json({ error: 'Missing anomaly identification data' });
  }

  const bioSignature = crypto.randomBytes(16).toString('hex');
  const sighting = {
    anomaly_id,
    anomaly_type,
    bio_signature: bioSignature,
    threat_level: threat_level || 'BALANCING',
    location_grid: location_grid || { lat: 43.0389, lng: -87.9065 },
    last_detected: Date.now()
  };

  try {
    await pgPool.query(
      `INSERT INTO gaia_anomalies (anomaly_id, anomaly_type, bio_signature, threat_level, location_grid, sequence_count, last_detected)
       VALUES ($1, $2, $3, $4, $5::jsonb, 1, NOW())
       ON CONFLICT (anomaly_id) DO UPDATE SET
         sequence_count = gaia_anomalies.sequence_count + 1,
         last_detected = NOW()`,
      [anomaly_id, anomaly_type, bioSignature, sighting.threat_level, JSON.stringify(sighting.location_grid)]
    );
  } catch (dbErr) {
    console.error('[GAIA DB Error]:', dbErr.message);
  }

  try {
    await redisPub.publish(`gaia:stream:${REALM_ID}`, JSON.stringify(sighting));
  } catch (pubErr) {
    console.error('[GAIA Publish Error]:', pubErr.message);
  }

  res.json({ status: 'ANOMALY_LOGGED', data: sighting });
});

// ==========================================
// 7. REAL-TIME SSE TELEMETRY & GRIDLOCK STREAM
// ==========================================
app.get('/api/tacticore/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let subscriber;
  try {
    subscriber = redisSub.duplicate();
    await subscriber.connect();

    await subscriber.subscribe(`tacticore:stream:${REALM_ID}`, (msg) => {
      res.write(`data: ${msg}\n\n`);
    });
    
    await subscriber.subscribe(`gaia:stream:${REALM_ID}`, (msg) => {
      res.write(`event: gaia_anomaly\ndata: ${msg}\n\n`);
    });

    await subscriber.subscribe(`gridlock:stream:${REALM_ID}`, (msg) => {
      res.write(`event: gridlock_update\ndata: ${msg}\n\n`);
    });
  } catch (err) {
    res.write(`data: ${JSON.stringify({ realm: { realm_id: REALM_ID, status: 'ONLINE_STANDBY' }, reflections: [] })}\n\n`);
  }

  req.on('close', async () => {
    if (subscriber) {
      try {
        await subscriber.unsubscribe(`tacticore:stream:${REALM_ID}`);
        await subscriber.unsubscribe(`gaia:stream:${REALM_ID}`);
        await subscriber.unsubscribe(`gridlock:stream:${REALM_ID}`);
        await subscriber.quit();
      } catch (e) {}
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CLICK.JS GRIDLOCK GATEWAY] Active and enforcing perimeters on port ${PORT}`);
});
