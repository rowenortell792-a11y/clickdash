// ==================== DEPENDENCIES ====================
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const { Pool } = require('pg'); 
const crypto = require('crypto');
const WebSocket = require('ws');

const app = express();

// ==================== CORE MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'mke_architect_lcmt_vision_2026',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ==================== POSTGRESQL CONNECTION ====================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false 
    }
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ PostgreSQL connection error:', err.stack);
    }
    console.log('✅ PostgreSQL engine connected to Railway cluster.');
    release();
});

// ==================== SECURE VERIFICATION ROUTE ====================
app.post('/api/verify-code', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ success: false, message: "Missing authorization signature." });
    }

    try {
        // Master bypass codes matching your Tier 2 credentials
        if (code === 'CODE123' || code === process.env.CLICKDASH_API_KEY) {
            
            // Log code execution straight into your PostgreSQL ledger database
            await pool.query(
                'INSERT INTO activation_logs (action_type, verification_code, executed_at) VALUES ($1, $2, NOW())',
                ['PREMIUM_UNLOCK', code]
            );

            return res.status(200).json({ 
                success: true, 
                message: "👑 PREMIUM SIGNATURE MATCHED! System optimization complete." 
            });
        }

        return res.status(401).json({ success: false, message: "INVALID CRITICAL SIGNATURE. Access Denied." });
    } catch (error) {
        console.error("Ledger Write Failure:", error);
        return res.status(500).json({ success: false, message: "Database ledger authentication sync failed." });
    }
});

// Serve root configuration test
app.get('/api/status', (req, res) => {
    res.json({ status: "online", platform: process.env.PLATFORM_NAME || "ClickDash", version: "1.0.4" });
});

module.exports = app;
