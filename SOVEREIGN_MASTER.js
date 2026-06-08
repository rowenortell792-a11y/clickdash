/**
 * GGC CITADEL: ABSOLUTE UNIFIED CORE + STUDY CONSOLE
 * CONSTITUTION: WP-2026-MKE-NORT-001
 * STATUS: FULL INTEGRATION
 */

const express = require('express');
const fs = require('fs'); // Added for Data Sovereignty
const app = express();

app.use(express.urlencoded({ extended: true }));

// --- AUTHORIZER (The Authority Riser) ---
const authorizer = {
    registry: { "MAMA_2026_KEY": "Family_Alpha", "BRO_2026_KEY": "Family_Beta", "ARCHITECT_KEY": "Root_Access" },
    verify: (t) => (authorizer.registry[t] ? { granted: true, id: authorizer.registry[t] } : { granted: false })
};

// --- STUDY CONSOLE ORGAN ---
app.get('/log', (req, res) => {
    const auth = authorizer.verify(req.query.key);
    if (auth.id === "Root_Access") {
        res.send(`
            <html><body style="background:#000; color:#0f0; font-family:monospace;">
            <h1>ARCHITECT STUDY CONSOLE</h1>
            <form action="/submit-log" method="POST">
                <input type="hidden" name="key" value="${req.query.key}">
                Subject: <input type="text" name="subject"><br>
                Hours: <input type="number" name="hours"><br>
                <button type="submit">Log Session</button>
            </form></body></html>
        `);
    } else {
        res.send("ACCESS DENIED: Architect Only.");
    }
});

// --- DATA SOVEREIGNTY (Saving the logs) ---
app.post('/submit-log', (req, res) => {
    const { subject, hours, key } = req.body;
    if (authorizer.verify(key).id === "Root_Access") {
        const entry = `[${new Date().toISOString()}] Subject: ${subject} | Hours: ${hours}\n`;
        fs.appendFileSync('study_log.txt', entry); // Saves to your server's drive
        res.send("<h1>Session Logged.</h1><a href='/log?key=${key}'>Back to Console</a>");
    } else {
        res.send("Unauthorized.");
    }
});

// --- LISTENER ---
app.listen(process.env.PORT || 3000, () => {
    console.log("[SYSTEM] Citadel Online. Pulse: SH_SYNC_ACTIVE.");
});
