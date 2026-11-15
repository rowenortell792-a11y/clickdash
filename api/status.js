// api/status.js — GGC System Status API
import express from "express";
const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    system: "Global Grid Core",
    version: "V5.0",
    platform: "ClickDash",
    domain: "clickdash.net",
    node: "ThinkPad T490s Genesis Node",
    status: "ONLINE",
    timestamp: Date.now()
  });
});

export default router;
