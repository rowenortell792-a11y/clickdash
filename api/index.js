const express = require('express');
const path = require('path');
// This connects the bot to your core logic file
const click = require('./click.js'); 
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

// 1. DASHBOARD & ADMIN
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));

// 2. UNIVERSAL BOT HOOKS
// MotherBot reads the core telemetry from your click.js file
app.get('/api/bot/motherbot', (req, res) => {
    res.json({ 
        bot: "MotherBot", 
        status: "Active", 
        telemetry: typeof click.getStatus === 'function' ? click.getStatus() : "Live" 
    });
});

// ServerBot handles the infrastructure status
app.get('/api/bot/serverbot', (req, res) => {
    res.json({ 
        bot: "ServerBot", 
        status: "Operational", 
        environment: "Production",
        domain: "clickdash.net" 
    });
});

// 3. STATUS & REDIRECTS
app.get('/api/status', (req, res) => {
    res.status(200).json({ message: "Clickdash Engine Active", version: "1.0.0" });
});

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('*', (req, res) => res.redirect('/dashboard'));

module.exports = app;
