require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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
    res.status(200).json({
        layer: "LAYER 3: THE SERVER",
        engine: "clickdash-core",
        status: "OPERATIONAL",
        operator: systemConfig.operator,
        linkedWorkspace: systemConfig.workspaceId ? "SECURED" : "UNLINKED",
        version: "1.0.5"
    });
});

app.post('/api/bridge', (req, res) => {
    console.log('📥 Data received at Clickdash Bridge:', req.body);
    res.status(200).json({ status: "Connection Verified" });
});

// ==================== 3. FRONTEND UI ROUTING ====================
app.get('/dashboard', (req, res) => {
    // Looks for your dashboard file in the public directory
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
