require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

if (!process.env.DISCORD_TOKEN) {
    console.error("❌ Error: DISCORD_TOKEN is missing!");
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
    // Removed process.exit(0) to keep the agent alive for grid listening
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Bridge discord activity to the Grid
    if (message.content.startsWith('!status')) {
        console.log(`[AGENT] Heartbeat check requested by ${message.author.username}`);
        message.reply('📡 Sovereign Node pulse: SYNCHRONIZED');
    }
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error("❌ Login failed:", err.message);
});
