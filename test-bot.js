require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

if (!process.env.DISCORD_TOKEN) {
    console.error("❌ Error: DISCORD_TOKEN is missing from your .env file!");
    process.exit(1);
}

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

client.once('ready', () => {
    console.log('🤖 [SUCCESS] GGC Sovereign Agent is online and broadcasting!');
    process.exit(0); // Exit safely once verified
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("❌ Login failed. Check your token or Network status:", err.message);
});
