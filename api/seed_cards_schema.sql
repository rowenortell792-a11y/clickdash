-- Copyright (c) 2026 GGC Universe LLC. All rights reserved.
-- api/seed_cards_schema.sql

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    tier_level VARCHAR(20) DEFAULT 'INITIATE',
    token_balance INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seed_cards (
    id SERIAL PRIMARY KEY,
    card_code VARCHAR(50) UNIQUE NOT NULL,
    tier_level VARCHAR(20) NOT NULL,
    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_by_user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_seed_cards_code ON seed_cards(card_code);
