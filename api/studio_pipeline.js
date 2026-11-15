// Copyright (c) 2026 GGC Universe LLC. All rights reserved.
// api/studio_pipeline.js
// ClickDash Studio — Scene Routing & AI Orchestration

import express from "express";
import pg from "pg";

const { Pool } = pg;
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://ggc:ggc@localhost:5432/ggc_telemetry"
});

// ============================================
// 1. CREATE A SCENE (Queue for Production)
// ============================================
router.post("/api/studio/scenes", async (req, res) => {
    const { title, characterId, scriptPrompt } = req.body || {};

    if (!title || !characterId || !scriptPrompt) {
        return res.status(400).json({ error: "Missing required scene parameters (title, characterId, scriptPrompt)." });
    }

    try {
        // Verify character exists in the Sector Tanks
        const charCheck = await pool.query("SELECT * FROM characters WHERE character_id = $1", [characterId]);
        if (charCheck.rows.length === 0) {
            return res.status(404).json({ error: "Character ID not found in the Matrix." });
        }

        // Insert scene into production queue
        const result = await pool.query(
            `INSERT INTO production_queue (title, character_id, script_prompt, status) 
             VALUES ($1, $2, $3, 'PENDING') RETURNING scene_id, created_at`,
            [title, characterId, scriptPrompt]
        );

        const scene = result.rows[0];

        console.log(`[STUDIO] Scene #${scene.scene_id} queued for character ${characterId}. Awaiting T490 Render.`);

        res.json({
            success: true,
            message: "Scene queued for production.",
            sceneId: scene.scene_id,
            status: "PENDING",
            createdAt: scene.created_at
        });

    } catch (err) {
        console.error("[STUDIO] Pipeline Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ============================================
// 2. GET PRODUCTION STATUS
// ============================================
router.get("/api/studio/scenes/:sceneId", async (req, res) => {
    const { sceneId } = req.params;

    try {
        const result = await pool.query("SELECT * FROM production_queue WHERE scene_id = $1", [sceneId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Scene not found." });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error("[STUDIO] Status Check Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
