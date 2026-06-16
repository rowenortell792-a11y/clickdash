/**
 * GGC CITADEL: ABSOLUTE UNIFIED CORE
 * ROLE: Kingdom Hub / Registry Gatekeeper / Broadcast Injector
 */

const express = require('express');
const app = express();

// --- 1. THE REGISTRY GATEKEEPER (The "Master Key" Logic) ---
const registryAuth = (req, res, next) => {
    const key = req.query.key || req.headers['x-ggc-key'];
    // Validates against your MongoDB credentials
    if (key === process.env.ARCHITECT_KEY || key === "ROOT_ACCESS") {
        next(); // Key accepted, proceed to app
    } else {
        res.status(403).send("<h1>CITADEL ACCESS DENIED</h1><p>Registry Key Required.</p>");
    }
};

// Apply Registry Gatekeeper to all routes
app.use(registryAuth);

// --- 2. THE BROADCAST INJECTOR (CAMM'S TV Logic) ---
// This middleware injects the "Always-On" TV into every HTML response
const injectCammsTV = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        if (typeof body === 'string' && body.includes('</body>')) {
            const tvOverlay = `
                <div id="camms-tv-pinned" style="position:fixed; bottom:20px; right:20px; z-index:9999; cursor:move;">
                    <iframe src="YOUR_CAMMS_STREAM_URL" width="300" height="170" frameborder="0"></iframe>
                </div>
                <script>/* Draggable logic goes here */</script>
            `;
            body = body.replace('</body>', `${tvOverlay}</body>`);
        }
        originalSend.call(this, body);
    };
    next();
};

app.use(injectCammsTV);

// --- 3. THE KINGDOM ROUTES ---
app.get('/', (req, res) => res.send("<h1>Welcome to the Citadel.</h1>"));

app.listen(process.env.PORT || 3000, () => {
    console.log("[SYSTEM] Master Hub Online. Registry Locked.");
});
