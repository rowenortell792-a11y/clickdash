// GGC World - click.js
// Master Dashboard Telemetry and Matrix Router (Governed)

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

document.addEventListener("DOMContentLoaded", initDashboard);
