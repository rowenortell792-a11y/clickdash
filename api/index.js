const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

// 1. DASHBOARD & ADMIN
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));

// 2. UNIVERSAL BOT HOOKS
app.get('/api/bot/motherbot', (req, res) => {
    res.json({ bot: "MotherBot", status: "Active", note: "Telemetry managed by client-side click.js" });
});

app.get('/api/bot/serverbot', (req, res) => {
    res.json({ bot: "ServerBot", status: "Operational", environment: "Production" });
});

// 3. STATUS & REDIRECTS
app.get('/api/status', (req, res) => {
    res.status(200).json({ message: "Clickdash Engine Active" });
});

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('*', (req, res) => res.redirect('/dashboard'));

module.exports = app;
