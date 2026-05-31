const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../public')));

// 1. DASHBOARD & ADMIN
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));

// 2. UNIVERSAL BOT HOOKS (The "Bot Infrastructure")
// This allows you to ping/control your bots from any domain
app.get('/api/bot/motherbot', (req, res) => {
    res.json({ bot: "MotherBot", status: "Active", commandCenter: "https://clickdash.net/admin-dashboard" });
});

app.get('/api/bot/serverbot', (req, res) => {
    res.json({ bot: "ServerBot", status: "Operational", host: "Clickdash.net" });
});

// 3. STATUS & REDIRECTS
app.get('/api/status', (req, res) => {
    res.status(200).json({ message: "Clickdash Engine Active", version: "1.0.0" });
});

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('*', (req, res) => res.redirect('/dashboard'));

module.exports = app;
