import os

# GGC_UNIVERSE_CONFIG
# These are loaded from the Railway environment memory
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
ARCHITECT_KEY = os.getenv("ARCHITECT_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

# Verification check for internal diagnostics
if not ARCHITECT_KEY:
    print("❌ [CRITICAL] ARCHITECT_KEY not found in environment memory.")
