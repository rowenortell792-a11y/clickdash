const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the 'public' folder (one level up from /api)
app.use(express.static(path.join(__dirname, '../public')));

// 1. DASHBOARD & ADMIN
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/dashboard.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, '../public/admin.html')));

// 2. UNIVERSAL BOT HOOKS
app.get('/api/bot/motherbot', (req, res) => {
    res.json({ bot: "MotherBot", status: "Active" });
});

app.get('/api/bot/serverbot', (req, res) => {
    res.json({ bot: "ServerBot", status: "Operational" });
});

// 3. VAULT / TERMINAL ROUTE
app.post('/api/vault/connection_token', async (req, res) => {
    try {
        const connectionToken = await stripe.terminal.connectionTokens.create();
        res.json({ secret: connectionToken.secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. STATUS & REDIRECTS
app.get('/api/status', (req, res) => {
    res.status(200).json({ message: "Clickdash Engine Active" });
});

app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('*', (req, res) => res.redirect('/dashboard'));

module.exports = app;
