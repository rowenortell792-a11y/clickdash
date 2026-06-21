/**
 * GGC_UNIVERSE: SECURITY_DRILL_V2
 * PURPOSE: VERIFY QUARANTINE PROTOCOL ENFORCEMENT
 */

const sovereign = require('./sovereign_kernel.js');
const hostileSignal = require('./test_hostile.json');

const runDrill = () => {
    console.log("[DRILL] INITIATING_SECURITY_TEST...");
    
    // Inject the hostile signal (Origin check should fail)
    console.log(`[DRILL] Injecting signal from: ${hostileSignal.origin || "UNKNOWN"}`);
    
    sovereign.updateLedger(hostileSignal);
    
    // Verification: Check if the ledger was modified
    const currentLedger = JSON.parse(require('fs').readFileSync('./ggc_ledger.json', 'utf8'));
    
    if (currentLedger.status !== "QUARANTINED") {
        console.error("[DRILL_FAILURE] QUARANTINE_BYPASSED: STATE_CORRUPTED");
    } else {
        console.log("[DRILL_SUCCESS] QUARANTINE_ENFORCED: SYSTEM_SECURE");
    }
};

runDrill();
