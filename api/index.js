require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve your dashboard files out of the public folder
app.use(express.static(path.join(__dirname, '../public')));

// 2. DISCORD BOT "THE AGENT" WAKE-UP
if (process.env.DISCORD_TOKEN) {
    const client = new Client({ 
        intents: [
            GatewayIntentBits.Guilds, 
            GatewayIntentBits.GuildMessages, 
            GatewayIntentBits.MessageContent 
        ] 
    });

    client.once('ready', () => {
        console.log('🤖 GGC Sovereign Agent is ONLINE and synced to Clickdash.io');
    });

    client.on('messageCreate', (message) => {
        if (message.content === '!pulse') {
            message.reply('📡 Clickdash.io System: Active. PA Bridge: Stable.');
        }
    });

    client.login(process.env.DISCORD_TOKEN).catch(err => {
        console.error('Discord Agent connection delayed:', err.message);
    });
}

// 3. SERVER ROUTES (THE GRID)
app.get('/api/status', (req, res) => {
    res.status(200).json({ 
        status: "online", 
        platform: "ClickDash Engine", 
        layer: "LAYER 3" 
    });
});

app.post('/api/bridge', (req, res) => {
    console.log('📥 Data received at Clickdash.io Bridge:', req.body);
    res.status(200).json({ status: "Connection Verified" });
});

// UI Redirects
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('*', (req, res) => {
    res.redirect('/dashboard');
});

// Export for Vercel Serverless Architecture
module.exports = app;
