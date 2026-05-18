// ==================== DEPENDENCIES ====================
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const mongoose = require('mongoose');
const crypto = require('crypto');
const WebSocket = require('ws');

const app = express();

// ==================== CORE MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'sovereign_core_secret_xyz',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// ==================== MONGODB CONNECTION ====================
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clickdash', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const db = mongoose.connection.db;

// ==================== MODELS ====================
const UserSchema = new mongoose.Schema({
    discordId: { type: String, required: true },
    username: String,
    avatar: String,
    orbsBalance: { type: Number, default: 0 },
    memberSince: { type: String, default: () => new Date().toISOString().split('T')[0] },
    systemStatus: { type: String, default: "ALPHA_USER" },
    lastActive: { type: Date, default: Date.now },
    plan: { type: String, default: "unlimited" }
});

const User = mongoose.model('User', UserSchema);

// ==================== SECURE CODE VERIFICATION & TELEMETRY ====================
app.post('/api/verify-code', (req, res) => {
    const { code } = req.body;
    
    const VALID_CODES = {
        "CODE123": true,
        "GOLD789": true,
        "PREMIUM456": true
    };

    if (!code) {
        return res.status(400).json({ success: false, message: "Missing code signature." });
    }

    if (VALID_CODES[code.toUpperCase()]) {
        // Line-of-sight telemetry payload forwarded to Layer 4 Mother Bot on Railway
        fetch('https://clickdash-motherbot-v1.up.railway.app/api/automation/trigger', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CLICKDASH_API_KEY}`
            },
            body: JSON.stringify({
                event: "PREMIUM_ACTIVATION",
                timestamp: new Date().toISOString(),
                identity: req.body.username || "UNKNOWN_PLAYER",
                signature: code.toUpperCase()
            })
        }).catch(err => console.error("Mother Bot Handshake Deferred:", err.message));

        return res.status(200).json({ 
            success: true, 
            message: "PREMIUM SIGNATURE MATCHED! System optimization complete." 
        });
    } else {
        return res.status(401).json({ 
            success: false, 
            message: "Verification mismatch. Code signature not found." 
        });
    }
});

// ==================== SYSTEM STATUS ROUTE ====================
app.get('/api/status', (req, res) => {
    res.status(200).json({
        status: "ONLINE",
        layer: 3,
        engine: "Vercel Core Engine",
        database: mongoose.connection.readyState === 1 ? "CONNECTED" : "DISCONNECTED"
    });
});

// ==================== VERCEL EXPORT SERVERLESS HANDLER ====================
module.exports = app;
