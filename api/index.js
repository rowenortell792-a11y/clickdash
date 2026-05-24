require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 💾 LINKING SOURCE A: LOCAL INFRASTRUCTURE LEDGER
// Going up one directory to pull the root ledger system
const { getLocalCore, updateLedger } = require('../local-core');

const app = express();

// ==================== 1. SYSTEM MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets safely
app.use(express.static(path.join(__dirname, '../public')));

// Pulling Core Environment Signatures
const systemConfig = {
    workspaceId: process.env.WORKSPACE_ID || 'Offline',
    operator: process.env.CHARACTER_NAME || 'Sovereign Core'
};

// ==================== 2. SERVERLESS STATUS ROUTES ====================
app.get('/api/status', (req, res) => {
    // Read the current state of our sovereign ledger
    const currentLedger = getLocalCore();

    res.status(200).json({
        layer: "LAYER 3: THE SERVER",
        engine: "clickdash-core",
        status: "OPERATIONAL",
        operator: systemConfig.operator,
        linkedWorkspace: systemConfig.workspaceId ? "SECURED" : "UNLINKED",
        version: "1.1.0",
        ledger_sync: currentLedger.infrastructure.gridlock_sync
    });
});

// 📡 THE LIVE INFRASTRUCTURE BRIDGE
app.post('/api/bridge', (req, res) => {
    console.log('📥 Data received at Clickdash Bridge:', req.body);
    
    try {
        const { targetSection, updateData } = req.body;

        // If a pulse comes in to rotate money or advance hardware phases:
        if (targetSection && updateData) {
            const updatedLedger = updateLedger(targetSection, updateData);
            return res.status(200).json({
                status: "Ledger Synchronized",
                msg: "Wise Leaf Loop Consensus Reached",
                current: updatedLedger[targetSection]
            });
        }

        // Standard connection check fallback
        res.status(200).json({ status: "Connection Verified", system: "Idle" });

    } catch (err) {
        console.error('❌ Bridge sync error:', err.message);
        res.status(500).json({ error: "Infrastructure Handshake Failed" });
    }
});

// ==================== 3. FRONTEND UI ROUTING ====================
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Auto-fallback home route
app.get('*', (req, res) => {
    res.json({ 
        message: "Clickdash Engine Active", 
        statusCheck: "/api/status" 
    });
});

// Export for Vercel Serverless Architecture
module.exports = app;
