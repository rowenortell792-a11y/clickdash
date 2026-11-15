-- Copyright (c) 2026 GGC Universe LLC. All rights reserved.
-- api/studio_schema.sql

CREATE TABLE IF NOT EXISTS characters (
    character_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    origin_sector VARCHAR(50), -- e.g., 'Shadow Kin', 'Northtellu'
    core_traits TEXT,
    visual_prompt_base TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS production_queue (
    scene_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    character_id VARCHAR(50) REFERENCES characters(character_id),
    script_prompt TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, RENDERING, COMPLETED, FAILED
    output_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prod_queue_status ON production_queue(status);
