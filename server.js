// ========== PA LANGUAGE ENGINE ==========
const WebSocket = require('ws'); // If not installed: npm install ws

// In-memory pulse (starts neutral)
let globalPulse = 50;
let eventHistory = [];

// Event weights (positive = +pulse, negative = -pulse)
const eventWeights = {
    'LINK_SHORTENED': 2,
    'POST_CREATED': 3,
    'PREMIUM_PURCHASED': 10,
    'GAME_WON': 5,
    'REFUND_ISSUED': -8,
    'USER_BANNED': -5,
    'COMMENT_REMOVED': -2,
    'SUPPORT_GIVEN': 4
};

// Emit an event from any app
function emitPAEvent(eventType, source, userId, metadata = {}) {
    const weight = eventWeights[eventType] || 0;
    const oldPulse = globalPulse;
    globalPulse = Math.min(100, Math.max(0, globalPulse + weight));
    
    const eventRecord = {
        eventType,
        source,
        userId,
        metadata,
        weight,
        oldPulse,
        newPulse: globalPulse,
        timestamp: new Date()
    };
    eventHistory.unshift(eventRecord);
    if (eventHistory.length > 1000) eventHistory.pop();
    
    // Save to MongoDB
    db.collection('pa_events').insertOne(eventRecord);
    
    // Broadcast to all connected WebSocket clients
    broadcastToAll({ type: 'pulse_update', pulse: globalPulse, lastEvent: eventType });
    
    return globalPulse;
}

// WebSocket broadcast helper
function broadcastToAll(data) {
    if (wss && wss.clients) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
}

// Setup WebSocket server
let wss;
if (!wss) {
    const server = require('http').createServer(app);
    wss = new WebSocket.Server({ server });
    wss.on('connection', (ws) => {
        ws.send(JSON.stringify({ type: 'pulse_update', pulse: globalPulse }));
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message);
                if (data.event) {
                    const userId = ws.userId; // Set from your auth middleware
                    emitPAEvent(data.event, data.source, userId, data.metadata);
                }
            } catch(e) {}
        });
    });
    // Attach to your existing server (if you already have an HTTP server)
    // If you're using app.listen, you need to wrap it.
}