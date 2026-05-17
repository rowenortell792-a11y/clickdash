// GGC World - click.js
// Master Dashboard Telemetry and Matrix Router

console.log("Initializing click.js Core Telemetry...");

// This reads the backend URL directly from your setup
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://YOUR-RAILWAY-URL-HERE.up.railway.app'; // You will swap this link once Railway is live

export const initDashboard = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/simulation/status`);
        const data = await response.json();
        console.log("Wise Leaf Loop Connection established:", data);
        
        // Update dashboard UI elements if they exist
        const statusEl = document.getElementById('system-status');
        if (statusEl) statusEl.innerText = `System: ${data.status} (${data.branding})`;
    } catch (error) {
        console.error("CRITICAL ERROR: Matrix network link failed.", error);
    }
};

// Auto-fire telemetry on page load
document.addEventListener("DOMContentLoaded", initDashboard);
