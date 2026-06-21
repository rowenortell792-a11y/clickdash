# config.py - Upgraded for GPC Sovereignty
import os

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
ARCHITECT_KEY = os.getenv("ARCHITECT_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

# Added GPC_IDENTITY for personal/portal sovereign tracking
GPC_IDENTITY = os.getenv("GPC_IDENTITY", "UNASSIGNED_SOVEREIGN_NODE")

if not GPC_IDENTITY or GPC_IDENTITY == "UNASSIGNED_SOVEREIGN_NODE":
    print("⚠️ [WARNING] GPC_IDENTITY not set. Asset may be untracked.")
