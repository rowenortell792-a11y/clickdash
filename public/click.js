// click.js
// GGC / ClickDash Sovereign Ingress Engine
// Master Archive Edition — November 14, 2026
// Domain: clickdash.net only

import express from "express";
import crypto from "crypto";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import net from "net";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MASTER ARCHIVE CONSTANTS
// ============================================
const SYSTEM = {
  name: "Global Grid Core",
  version: "V5.0",
  platform: "ClickDash",
  domain: "clickdash.net",
  node: "ThinkPad T490s Genesis Node",
  guardian: "Motherbot CF-003",
  ingress: "click.js",
  language: "PA Language",
  router: "Gridlock"
};

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// IN-MEMORY STORES (swap to Redis + Postgres later)
// ============================================
const sessions = new Map();
const anomalies = [];
const SERVICE_TIMEOUT = 800;

// Authorized users (Master Archive)
const AUTHORIZED_USERS = {
  "architect@ggc.core": {
    passwordHash: "sovereign",
    role: "ARCHITECT",
    tier: "T9",
    name: "Nortell Luwayne Rowe"
  },
  "meechie@lcmt.tgb": {
    passwordHash: "vice",
    role: "VICE_PRESIDENT",
    tier: "T6",
    name: "LCMT Meechie"
  }
};

// ============================================
// HEALTH PROBE
// ============================================
function probeService(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(false);
      }
    }, SERVICE_TIMEOUT);

    socket.connect(port, host, () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        resolve(true);
      }
    });

    socket.on("error", () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    });
  });
}

// ============================================
// SYSTEM STATUS (Master Archive aware)
// ============================================
app.get("/api/system/status", async (req, res) => {
  const [motherbot, gridlock, prodigy] = await Promise.all([
    probeService("127.0.0.1", 4001),
    probeService("127.0.0.1", 4002),
    probeService("127.0.0.1", 4003)
  ]);

  const allOnline = motherbot && gridlock && prodigy;
  const anyOnline = motherbot || gridlock || prodigy;

  res.json({
    system: SYSTEM,
    status: allOnline ? "ONLINE" : anyOnline ? "DEGRADED" : "OFFLINE",
    registry: "VERIFIED",
    services: {
      motherbot: motherbot ? "CONNECTED" : "UNREACHABLE",
      gridlock: gridlock ? "ACTIVE" : "UNREACHABLE",
      prodigy_os: prodigy ? "ONLINE" : "UNREACHABLE"
    },
    node: SYSTEM.node,
    guardian: SYSTEM.guardian,
    timestamp: Date.now()
  });
});

// ============================================
// PURPLE GATE (PGE)
// ============================================
app.post("/api/pge/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials for Purple Gate entry" });
  }

  const user = AUTHORIZED_USERS[email.toLowerCase()];
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: "Unauthorized — Purple Gate remains sealed" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 1000 * 60 * 60 * 8;

  sessions.set(token, {
    email: email.toLowerCase(),
    role: user.role,
    tier: user.tier,
    name: user.name,
    expires
  });

  res.json({
    status: "AUTHENTICATED",
    entry_status: "VERIFIED",
    token,
    role: user.role,
    tier: user.tier,
    name: user.name,
    message: "Purple Gate unlocked. Welcome to the Citadel grid."
  });
});

app.get("/api/pge/session", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.query.token;
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ status: "UNAUTHENTICATED" });
  }

  const session = sessions.get(token);
  if (Date.now() > session.expires) {
    sessions.delete(token);
    return res.status(401).json({ status: "SESSION_EXPIRED" });
  }

  res.json({
    status: "ACTIVE",
    email: session.email,
    role: session.role,
    tier: session.tier,
    name: session.name,
    expires: session.expires
  });
});

app.post("/api/pge/logout", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.body.token;
  if (token) sessions.delete(token);
  res.json({ status: "LOGGED_OUT" });
});

app.get("/api/pge/status", (req, res) => {
  res.json({
    gateway: "PURPLE_GATE",
    state: "READY",
    auth_required: true,
    platform: SYSTEM.platform,
    domain: SYSTEM.domain
  });
});

// ============================================
// GAIA ANOMALY ENGINE
// ============================================
app.get("/api/gaia/anomalies", (req, res) => {
  res.json({
    anomalies: anomalies.slice().reverse(),
    total: anomalies.length
  });
});

app.post("/api/gaia/sighting", (req, res) => {
  const { anomaly_id, anomaly_type, threat_level = "BALANCING", location_grid } = req.body || {};

  if (!anomaly_id || !anomaly_type) {
    return res.status(400).json({ error: "anomaly_id and anomaly_type required" });
  }

  const record = {
    anomaly_id,
    anomaly_type,
    threat_level,
    location_grid: location_grid || null,
    sequence_count: anomalies.length + 1,
    last_detected: new Date().toISOString()
  };

  anomalies.push(record);
  broadcast("gaia_anomaly", record);

  res.json({
    status: "ANOMALY_LOGGED",
    record
  });
});

// ============================================
// SSE FABRIC
// ============================================
const sseClients = new Set();

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

app.get("/api/tacticore/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    res.write(`event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ============================================
// MASTER ARCHIVE ENDPOINT
// ============================================
app.get("/api/archive/status", (req, res) => {
  res.json({
    archive: "Master Project Archive",
    edition: "November 14, 2026",
    principle: "We build. We own. We legacy.",
    base: "Milwaukee, Wisconsin",
    domain: "clickdash.net",
    infrastructure: "Global Grid Core V5.0",
    platform: "ClickDash",
    node: SYSTEM.node,
    guardian: SYSTEM.guardian
  });
});

// ============================================
// ROOT
// ============================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "hub.html"));
});

// ============================================
// START
// ============================================
app.listen(PORT, () => {
  console.log(`\n[GGC] ClickDash Sovereign Ingress Engine`);
  console.log(`[GGC] Version          : ${SYSTEM.version}`);
  console.log(`[GGC] Domain           : ${SYSTEM.domain}`);
  console.log(`[GGC] Node             : ${SYSTEM.node}`);
  console.log(`[GGC] Guardian         : ${SYSTEM.guardian}`);
  console.log(`[GGC] Listening on     : ${PORT}`);
  console.log(`[GGC] Purple Gate      : READY`);
  console.log(`[GGC] Gaia Engine      : ACTIVE`);
  console.log(`[GGC] Archive          : LOCKED\n`);
});

export default app;