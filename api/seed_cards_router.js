// Copyright (c) 2026 GGC Universe LLC. All rights reserved.
// api/seed_cards_router.js
// GGC Universe — Seed Card Redemption API Route

import express from "express";
import pg from "pg";

const { Pool } = pg;
const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://ggc:ggc@localhost:5432/ggc_telemetry"
});

// ============================================
// REDEEM SEED CARD ENDPOINT
// ============================================
router.post("/api/commerce/redeem", async (req, res) => {
    const { cardCode, userId } = req.body || {};

    if (!cardCode || !userId) {
        return res.status(400).json({ error: "cardCode and userId required" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Verify card exists and is unclaimed
        const cardQuery = await client.query(
            "SELECT * FROM seed_cards WHERE card_code = $1 AND is_claimed = FALSE",
            [cardCode.trim().toUpperCase()]
        );

        if (cardQuery.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Invalid or already claimed Seed Card." });
        }

        const card = cardQuery.rows[0];

        // 2. Mark card as claimed
        await client.query(
            "UPDATE seed_cards SET is_claimed = TRUE, claimed_by_user_id = $1 WHERE id = $2",
            [userId, card.id]
        );

        // 3. Upgrade user tier
        const userUpdate = await client.query(
            "UPDATE users SET tier_level = $1 WHERE id = $2 RETURNING id, email, tier_level",
            [card.tier_level, userId]
        );

        await client.query("COMMIT");

        console.log(`[COMMERCE] User ${userId} successfully redeemed Seed Card ${cardCode} for Tier ${card.tier_level}`);

        res.json({
            success: true,
            message: "Seed Card Redeemed Successfully",
            newTier: card.tier_level,
            user: userUpdate.rows[0]
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("[COMMERCE] Redemption Error:", err);
        res.status(500).json({ error: "Internal Server Error during card redemption" });
    } finally {
        client.release();
    }
});

export default router;
