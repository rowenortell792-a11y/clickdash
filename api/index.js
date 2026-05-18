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
// Essential for reading JSON payloads sent from your game frontend client
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'socreign_core_secret_xyz',
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

// ==================== SECURE CODE VERIFICATION ROUTER ====================
app.post('/api/verify-code', (req, res) => {
    const { code } = req.body;
    
    // Server-side master activation keys (completely safe from the browser)
    const VALID_CODES = {
        "CODE123": true,
        "GOLD789": true,
        "PREMIUM456": true
    };

    if (!code) {
        return res.status(400).json({ success: false, message: "Missing code signature." });
    }

    if (VALID_CODES[code.toUpperCase()]) {
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
