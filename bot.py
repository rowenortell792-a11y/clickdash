import discord
from discord.ext import commands
import requests
from config import DISCORD_TOKEN, ARCHITECT_KEY, GPC_IDENTITY

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.command()
async def turnoff(ctx):
    # 1. Notify the Citadel before shutdown
    try:
        # Pushing a final "SHUTDOWN_INITIATED" state to the GGC Ledger
        # Assuming your kernel has a listener endpoint
        requests.post("https://clickdash.net/api/ledger/lock", json={
            "status": "SHUTDOWN_INITIATED",
            "gpc_id": GPC_IDENTITY,
            "key": ARCHITECT_KEY
        })
        await ctx.send("🛡️ Citadel state locked. Sovereign Agent going offline.")
    except Exception as e:
        await ctx.send(f"⚠️ Shutdown failed: {str(e)}")
        
    await bot.close()

bot.run(DISCORD_TOKEN)
