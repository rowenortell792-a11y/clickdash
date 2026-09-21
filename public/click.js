// GGC World - click.js
// Same-origin pulse against /api. Do not read process.env in the browser.

export const initDashboard = async () => {
  const statusEl = document.getElementById("status");
  try {
    const response = await fetch("/api", { cache: "no-store" });
    const data = await response.json();
    if (statusEl) {
      statusEl.innerText = `PULSE: ${data.governance || data.status} · ${data.frequency || ""}`.trim();
    }
    const userEl = document.getElementById("user");
    if (userEl) userEl.innerText = "CITADEL";
  } catch {
    if (statusEl) statusEl.innerText = "EDGE LIVE · MOTHERBOT DARK";
  }
};

document.addEventListener("DOMContentLoaded", initDashboard);
