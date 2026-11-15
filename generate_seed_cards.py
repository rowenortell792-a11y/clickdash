# Copyright (c) 2026 GGC Universe LLC. All rights reserved.
# generate_seed_cards.py
# Seed Card Forge — Generates unique cryptographic access keys

import psycopg2
import secrets
import csv
import os

DB_CONNECTION = os.getenv("DATABASE_URL", "postgresql://ggc:ggc@localhost:5432/ggc_telemetry")

TIERS = {
    "INITIATE": 700,
    "CREATOR": 250,
    "ARCHITECT": 50
}

def generate_code(tier):
    return f"GGC-{tier}-{secrets.token_hex(4).upper()}"

def forge_cards():
    print("[FORGE] Initiating Seed Card generation...")
    generated_cards = []

    for tier, count in TIERS.items():
        for _ in range(count):
            code = generate_code(tier)
            generated_cards.append((code, tier))
    
    csv_filename = "GGC_Seed_Cards_Batch_01.csv"
    with open(csv_filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Card Code", "Tier Level", "Claimed Status"])
        for code, tier in generated_cards:
            writer.writerow([code, tier, "FALSE"])
    
    print(f"[FORGE] {len(generated_cards)} cards forged and saved to {csv_filename}")

    try:
        conn = psycopg2.connect(DB_CONNECTION)
        cursor = conn.cursor()
        
        insert_query = "INSERT INTO seed_cards (card_code, tier_level) VALUES (%s, %s) ON CONFLICT (card_code) DO NOTHING"
        cursor.executemany(insert_query, generated_cards)
        
        conn.commit()
        print(f"[FORGE] {cursor.rowcount} cards successfully injected into PostgreSQL.")
        
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"[FORGE] Database Error: {e}")

if __name__ == "__main__":
    forge_cards()
