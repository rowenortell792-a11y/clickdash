// index.js (Root Folder) — Main Express Server for T490s Genesis Node
import express from "express";
import cammTvRouter from "./api/camm_tv.js";
import commerceRouter from "./api/commerce.js";
import statusRouter from "./api/status.js";

const app = express();
app.use(express.json());

// Serve static frontend files from public/
app.use(express.static("public"));

// Mount modular API routers
app.use("/api/camm", cammTvRouter);       // Handles /api/camm/view
app.use("/api/commerce", commerceRouter); // Handles POS, inventory, login, rollup
app.use("/api/status", statusRouter);     // Handles health checks

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[GGC CORE] Sovereign server active on port ${PORT} (ThinkPad T490s Iron)`);
});
