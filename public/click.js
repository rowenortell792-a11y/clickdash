// GGC World - click.js
// Master Dashboard Telemetry, Matrix Router, and Vault Bridge (Governed)

// Dynamically target the backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export const initDashboard = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const data = await response.json();
        
        // Audit: Verify the system is running on your frequency
        console.log(`[WISE_LEAF_LOOP] CONNECTION_VERIFIED: ${data.matrix_constant}`);

        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.innerText = `SYSTEM_GOVERNED: ${data.matrix_constant}`;
        }
    } catch (error) {
        console.error("[CRITICAL] MATRIX_UNREACHABLE_OR_NON_COMPLIANT");
    }
};

// Vault Bridge: Request Stripe Terminal / Payment Connection Token on demand
export const fetchVaultToken = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/vault/connection_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log(`[VAULT_BRIDGE] Connection token secured.`);
        return data.secret;
    } catch (error) {
        console.error("[CRITICAL] VAULT_TOKEN_FAILURE: Unable to reach vault rails.");
    }
};

document.addEventListener("DOMContentLoaded", initDashboard);
