import discord
from discord.ext import commands
from config import DISCORD_TOKEN

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.command()
async def turnoff(ctx):
    # Logic to handle bot commands
    await ctx.send("Citadel shutting down...")

bot.run(DISCORD_TOKEN)
