// Remove the Railway reference entirely
const BACKEND_URL = 'http://localhost:3000/api/sovereign'; 

export const initDashboard = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/status`);
        const data = await response.json();
        console.log("[WISE_LEAF_LOOP] CONNECTION_VERIFIED");
        
        // Ensure UI elements reflect the sovereign state
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.innerText = 'SYSTEM: SOVEREIGN_LOCKED';
    } catch (error) {
        console.error("[CRITICAL] MATRIX_UNREACHABLE: SOVEREIGN_KERNEL_OFFLINE");
    }
};
