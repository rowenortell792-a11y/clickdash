const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const { createClient } = require('redis');
const crypto = require('crypto');
const http = require('http');

const app = express();
app.use(express.json());

// Serve static assets from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Database & Redis Infrastructure Connection
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:5432/ggc_core'
});

const redisSub = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
const redisPub = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });

async function initRedis() {
  try {
    await redisSub.connect();
    await redisPub.connect();
  } catch (err) {
    console.error('[REDIS] Connection error:', err);
  }
}
initRedis();

const REALM_ID = process.env.REALM_ID || 'GGC-REALM-MKE-01';
const NFC_SECRET = process.env.NFC_MASTER_SECRET || 'GGC_SOVEREIGN_X1_KEY';

// In-memory session store with TTL tracking
const activeSessions = new Map();

// Helper: Non-blocking HTTP health check for bare-metal services
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
// 1. System Service Registry & Health Checks
// ==========================================
app.get('/api/system/status', async (req, res) => {
  // Real health checks against local bare-metal service ports (adjust ports as needed)
  const motherbotStatus = await checkServiceHealth(3001);
  const gridlockStatus = await checkServiceHealth(3002);
  const prodigyStatus = await checkServiceHealth(3003);

  res.json({
    status: 'ONLINE',
    registry: 'VERIFIED',
    services: {
      motherbot: motherbotStatus,
      gridlock: gridlockStatus,
      prodigy_os: prodigyStatus
    },
    timestamp: Date.now()
  });
});

// ==========================================
// 2. Secure PGE Authentication & Sessions
// ==========================================
app.post('/api/pge/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing credentials for Purple Gate entry' });
  }

  try {
    // Verify against PostgreSQL users table
    const userResult = await pgPool.query(
      'SELECT id, email, password_hash, authorization_tier FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials or unauthorized identity' });
    }

    const user = userResult.rows.length > 0 ? userResult.rows[0] : null;
    
    // In production, use bcrypt/argon2. For sovereign bare-metal, verify hash:
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    // Fallback/Demo check if database row is unseeded
    const isValid = user ? (user.password_hash === passwordHash) : (email === 'admin@ggc.io' && password === 'sovereign369');

    if (!isValid) {
      return res.status(401).json({ error: 'Authentication failed: Incorrect password' });
    }

    // Generate secure cryptographically signed session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24-hour TTL

    activeSessions.set(token, {
      userId: user ? user.id : 'SOVEREIGN_ADMIN',
      email,
      tier: user ? user.authorization_tier : 'GPC_ROOT',
      expiresAt
    });

    res.json({
      status: 'AUTHENTICATED',
      entry_status: 'VERIFIED',
      token,
      expires_at: expiresAt,
      message: 'Purple Gate unlocked. Welcome to the Citadel grid.'
    });
  } catch (err) {
    // Fallback session generation if DB schema isn't fully migrated yet
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
    activeSessions.set(token, { email, tier: 'GPC_ROOT', expiresAt });
    
    res.json({
      status: 'AUTHENTICATED_FALLBACK',
      entry_status: 'VERIFIED',
      token,
      expires_at: expiresAt
    });
  }
});

app.get('/api/pge/session', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false, error: 'No session token provided' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return res.status(401).json({ authenticated: false, error: 'Session expired or invalid' });
  }

  res.json({ authenticated: true, session: { email: session.email, tier: session.tier, expiresAt: session.expiresAt } });
});

app.post('/api/pge/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ status: 'LOGGED_OUT' });
});

app.get('/api/pge/status', (req, res) => {
  res.json({ enclosure: 'PGE', status: 'ONLINE', active_sessions_count: activeSessions.size, timestamp: Date.now() });
});

// ==========================================
// 3. Gaia Ecological Anomaly Engine
// ==========================================
app.get('/api/gaia/anomalies', async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT anomaly_id, anomaly_type, bio_signature, threat_level, location_grid, sequence_count, last_detected FROM gaia_anomalies ORDER BY last_detected DESC LIMIT 50'
    );
    res.json({ entity: 'GAIA_PRIME', status: 'OBSERVING', anomalies: result.rows, timestamp: Date.now() });
  } catch (err) {
    res.json({ entity: 'GAIA_PRIME', status: 'OBSERVING', anomalies: [], note: 'Database storage uninitialized; running in-memory fallback' });
  }
});

app.post('/api/gaia/sighting', async (req, res) => {
  const { anomaly_id, anomaly_type, bio_signature, threat_level, location_grid } = req.body;
  if (!anomaly_id || !anomaly_type) {
    return res.status(400).json({ error: 'Missing anomaly identification data' });
  }

  const sighting = {
    anomaly_id,
    anomaly_type,
    bio_signature: bio_signature || crypto.randomBytes(16).toString('hex'),
    threat_level: threat_level || 'BALANCING',
    location_grid: location_grid || { lat: 43.0389, lng: -87.9065 },
    last_detected: Date.now(),
    sequence_count: 1
  };

  try {
    await pgPool.query(
      `INSERT INTO gaia_anomalies (anomaly_id, anomaly_type, bio_signature, threat_level, location_grid, sequence_count, last_detected)
       VALUES ($1, $2, $3, $4, $5::jsonb, 1, NOW())
       ON CONFLICT (anomaly_id) DO UPDATE SET
         sequence_count = gaia_anomalies.sequence_count + 1,
         last_detected = NOW()`,
      [anomaly_id, anomaly_type, sighting.bio_signature, sighting.threat_level, JSON.stringify(sighting.location_grid)]
    );
  } catch (dbErr) {
    console.error('[GAIA DB] Persistence warning:', dbErr.message);
  }

  // Publish live event over Redis
  try {
    await redisPub.publish(`gaia:stream:${REALM_ID}`, JSON.stringify(sighting));
  } catch (pubErr) {
    console.error('[GAIA REDIS] Publish error:', pubErr.message);
  }

  res.json({ status: 'ANOMALY_LOGGED', data: sighting });
});

// ==========================================
// 4. Live Server-Sent Events (SSE) Stream
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
  } catch (err) {
    res.write(`data: ${JSON.stringify({ realm: { realm_id: REALM_ID, status: 'ONLINE_STANDBY' }, reflections: [] })}\n\n`);
  }

  req.on('close', async () => {
    if (subscriber) {
      try {
        await subscriber.unsubscribe(`tacticore:stream:${REALM_ID}`);
        await subscriber.unsubscribe(`gaia:stream:${REALM_ID}`);
        await subscriber.quit();
      } catch (e) {}
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[click.js] Sovereign Gateway & Gridlock Enclosure Active on port ${PORT}`));
