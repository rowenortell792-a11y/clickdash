const express = require('express');
const path = require('path');
const app = express();

// Middleware to serve static files from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// 1. DASHBOARD ROUTE - Serves your main dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// 2. DEFAULT ROUTE - Redirects the main site to the dashboard
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// 3. API STATUS ROUTE - Keeps your "Engine" functionality alive
app.get('/api/status', (req, res) => {
    res.status(200).json({
        layer: "THE SERVER",
        engine: "actual-click-dash",
        status: "OPERATIONAL"
    });
});

// Fallback for everything else
app.get('*', (req, res) => {
    res.redirect('/dashboard');
});

module.exports = app;
