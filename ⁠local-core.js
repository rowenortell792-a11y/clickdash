// 🗄️ GGC MULTI-SOURCE INFRASTRUCTURE: SOURCE A (LOCAL CORE)
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'ggc_ledger.json');

// Initialize the local ledger if it doesn't exist
if (!fs.existsSync(DATA_PATH)) {
    const genesisSchema = {
        meta: { name: "GGC Sovereign Organism Ledger", initialized: new Date().toISOString() },
        infrastructure: { status: "ONLINE", gridlock_sync: "ACTIVE" },
        phase_1_prototypes: { tactics_core: "SEED", prodigy_controller: "STEALTH", aura_frame: "BLUEPRINT" },
        phase_2_revenue: { lacarta_apparel: { balance: 0, portal: "SHOPIFY" }, wave_bible: { sales: 0 } },
        bot_hierarchy: { mother_bot: "STANDBY", father_bot: "STANDBY" }
    };
    fs.writeFileSync(DATA_PATH, JSON.stringify(genesisSchema, null, 4));
    console.log("💾 [LOCAL CORE] Genesis Ledger created successfully at ggc_ledger.json");
}

// Function to read local state
function getLocalCore() {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

// Function to update local state (The Money Train Rotation)
function updateLedger(section, data) {
    const currentCore = getLocalCore();
    currentCore[section] = { ...currentCore[section], ...data };
    fs.writeFileSync(DATA_PATH, JSON.stringify(currentCore, null, 4));
    console.log(`📡 [WISE LEAF LOOP] Local consensus updated for section: ${section}`);
    return currentCore;
}

module.exports = { getLocalCore, updateLedger };
