require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. DISCORD BOT "THE AGENT" WAKE-UP
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

// Basic command to test the bot
client.on('messageCreate', (message) => {
    if (message.content === '!pulse') {
        message.reply('📡 Clickdash.io System: Active. PA Bridge: Stable.');
    }
});

client.login(process.env.DISCORD_TOKEN);

// 3. SERVER ROUTES (THE GRID)
app.get('/', (req, res) => {
    res.send('Clickdash.io Engine is Running.');
});

// This is the "Bridge" we talked about
app.post('/api/bridge', (req, res) => {
    console.log('📥 Data received at Clickdash.io Bridge:', req.body);
    res.status(200).json({ status: "Connection Verified" });
});

// 4. START THE ENGINE
app.listen(PORT, () => {
    console.log(`🚀 Clickdash Engine live on port ${PORT}`);
});
