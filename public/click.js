// Copyright (c) 2026 GGC Universe LLC. All rights reserved.
// click.js — Master Sovereign Ingress, Hardware, Crypto, CRM & Routing Engine
// Host: ThinkPad T490s Genesis Node | Domain: clickdash.net

import express from "express";
import crypto from "crypto";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import net from "net";
import pg from "pg";

const { Pool } = pg;

// ============================================
// IMPORT MODULAR API SUB-ROUTES
// ============================================
import commerceRouter from "./api/commerce.js";
import cammTvRouter from "./api/camm_tv.js";
import statusRouter from "./api/status.js";
import seedCardsRouter from "./api/seed_cards_router.js";
import studioPipelineRouter from "./api/studio_pipeline.js";
import leakedFireRouter from "./api/leaked_fire_router.js";       // Vault & Audio Distribution
import tokenLedgerRouter from "./api/token_ledger.js";         // 3-6-9 Crypto Ledger
import userRegistryRouter from "./api/user_registry.js";       // CRM & User Management
import linkVibeRouter from "./api/link_vibe_router.js";         // Link Vibe Session Engine

// ============================================
// IMPORT SOVEREIGN ENGINES & BRIDGES
// ============================================
import { calculateHarmonicResonance } from "./api/frequency_engine.js";
import { getBareMetalTelemetry } from "./api/prodigy_hardware_bridge.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Connection Pool (T490s Local Iron - Sector Tanks)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://ggc:ggc@localhost:5432/ggc_telemetry"
});

// ============================================
// MASTER ARCHIVE CONSTANTS (V6.0-SOVEREIGN)
// ============================================
const SYSTEM = {
  name: "Global Grid Core Universe",
  version: "V6.0-SOVEREIGN",
  platform: "ClickDash / Prodigy OS",
  domain: "clickdash.net",
  node: "ThinkPad T490s Genesis Node",
  guardian: "Motherbot CF-003",
  ingress: "click.js",
  language: "PA Language",
  router: "Gridlock",
  ideology: "3-6-9 Harmonic Law"
};

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ============================================
// IN-MEMORY STORES & AUTHORIZED NODES
// ============================================
const sessions = new Map();
const anomalies = [];
const SERVICE_TIMEOUT = 800;

const AUTHORIZED_USERS = {
  "architect@ggc.core": {
    passwordHash: "sovereign",
    role: "ARCHITECT",
    tier: "ARCHITECT",
    name: "Nortell Luwayne Rowe"
  },
  "meechie@lcmt.tgb": {
    passwordHash: "vice",
    role: "CHIEF_OPERATING_OFFICER",
    tier: "CREATOR",
    name: "Lcmt Meechie"
  }
};

// ============================================
// MOUNT ALL MODULAR API ROUTES & SUB-SYSTEMS
// ============================================
app.use(commerceRouter);
app.use(cammTvRouter);
app.use(statusRouter);
app.use(seedCardsRouter);
app.use(studioPipelineRouter);
app.use(leakedFireRouter);
app.use(tokenLedgerRouter);
app.use(userRegistryRouter);
app.use(linkVibeRouter);

// ============================================
// PRODIGY OS & BARE-METAL TELEMETRY ENDPOINT
// ============================================
app.get("/api/prodigy/telemetry", (req, res) => {
    const telemetry = getBareMetalTelemetry();
    res.json({
        system: SYSTEM,
        status: "OPTIMIZED",
        hardware: telemetry
    });
});

// ============================================
// 3-6-9 FREQUENCY VALIDATION ENDPOINT
// ============================================
app.post("/api/frequency/verify", (req, res) => {
    const { frequency } = req.body || {};
    if (!frequency) return res.status(400).json({ error: "Frequency value required" });

    const harmonicResult = calculateHarmonicResonance(Number(frequency));
    res.json({
        success: true,
        ideology: "3-6-9 Vortex Mechanics",
        analysis: harmonicResult
    });
});

// ============================================
// HEALTH PROBE & SYSTEM STATUS
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

app.get("/api/system/status", async (req, res) => {
  const [motherbot, gridlock, prodigy] = await Promise.all([
    probeService("127.0.0.1", 4001),
    probeService("127.0.0.1", 4002),
    probeService("127.0.0.1", 4003)
  ]);

  const allOnline = motherbot && gridlock && prodigy;

  res.json({
    system: SYSTEM,
    status: allOnline ? "ONLINE" : "DEGRADED",
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
// PURPLE GATE (PGE) AUTHENTICATION
// ============================================
app.post("/api/pge/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

  const user = AUTHORIZED_USERS[email.toLowerCase()];
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: "Unauthorized — Purple Gate sealed" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 1000 * 60 * 60 * 8;

  sessions.set(token, { email: email.toLowerCase(), role: user.role, tier: user.tier, name: user.name, expires });

  res.json({
    status: "AUTHENTICATED",
    token,
    role: user.role,
    tier: user.tier,
    name: user.name,
    message: "Purple Gate unlocked. Welcome to the Citadel."
  });
});

// ============================================
// ROOT & START LISTENER
// ============================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "hub.html"));
});

app.listen(PORT, () => {
  console.log(`\n[GGC] Master Sovereign Ingress & Routing Engine`);
  console.log(`[GGC] Version          : ${SYSTEM.version}`);
  console.log(`[GGC] Domain           : ${SYSTEM.domain}`);
  console.log(`[GGC] Node             : ${SYSTEM.node}`);
  console.log(`[GGC] Ideology         : ${SYSTEM.ideology}`);
  console.log(`[GGC] Listening on     : ${PORT}`);
  console.log(`[GGC] Modules Bound    : Commerce, CAMM's TV, Status, Seed Cards, Studio Pipeline, Leaked Fire, Token Ledger, User CRM, Link Vibe, 3-6-9 Engine\n`);
});

export default app;
