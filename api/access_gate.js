// Copyright (c) 2026 GGC Universe LLC. All rights reserved.
// api/access_gate.js
// GGC Universe — Seed Card & Tier Gate Middleware

const TIER_LEVELS = {
    "INITIATE": 1,
    "CREATOR": 2,
    "ARCHITECT": 3
};

/**
 * Middleware to enforce tier access on sovereign routes.
 * Usage: router.get('/api/tacticore/ai', requireTier('ARCHITECT'), (req, res) => {...})
 */
export function requireTier(requiredTierName) {
    return (req, res, next) => {
        const user = req.user; // Populated by session/auth middleware
        
        if (!user) {
            return res.status(401).json({ error: "Unauthorized. No session found at the Purple Gate." });
        }

        const userLevel = TIER_LEVELS[user.tier_level] || 0;
        const requiredLevel = TIER_LEVELS[requiredTierName] || 99;

        if (userLevel >= requiredLevel) {
            next();
        } else {
            return res.status(403).json({ 
                error: "Access Denied // Tier Restriction", 
                message: `Requires ${requiredTierName} tier. Current tier: ${user.tier_level}. Please redeem a Seed Card.`
            });
        }
    };
}
