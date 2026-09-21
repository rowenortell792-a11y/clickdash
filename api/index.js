/**
 * GGC ClickDash pulse — Vercel serverless handler.
 * Restored on GGC-DAILY-5X-001 (2026-09-21).
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
    status: "edge-live",
    governance: "CITADEL_DAWN_PULSE",
    matrix_constant: "5X·1.500",
    frequency: "5X · 1.500",
    silverUmbrella: "raised-declared",
    purpleGate: "sealed-declared",
    motherbot: {
      host: "clickdash-motherbot-v1-production-89e2.up.railway.app",
      heartbeat: "dark",
      note: "DNS resolves; HTTP 404 on /, /health, /api, /status",
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
