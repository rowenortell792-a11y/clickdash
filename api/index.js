/**
 * GGC ClickDash pulse — Vercel serverless handler.
 * Restored on GGC-DAILY-5X-001 (2026-09-21).
 * Confirmed healthy on GGC-DAILY-5X-001 (2026-09-23).
 * The prior Express server.listen() binary caused FUNCTION_INVOCATION_FAILED.
 */
module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const payload = {
    automationId: "GGC-DAILY-5X-001",
    domain: "clickdash.net",
    node: "edge",
    status: "issue_reported",
    governance: "CITADEL_DAWN_PULSE",
    matrix_constant: "5X·1.500",
    frequency: "5X · 1.500",
    lastPulse: "2026-09-23T12:05:00Z",
    meshHealthPct: 88,
    silverUmbrella: "raised-declared",
    purpleGate: "sealed-declared",
    familyRegistry: "conceptually-locked",
    motherbot: {
      host: "clickdash-motherbot-v1-production-89e2.up.railway.app",
      heartbeat: "dark",
      note: "DNS resolves; Railway station 404 on / and /health — train has not arrived",
    },
    architect: "Nortell Luwayne Rowe",
    issuedBy: "Grok node · Citadel Triangle",
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url || "/api",
  };

  res.statusCode = 200;
  res.end(JSON.stringify(payload));
};
