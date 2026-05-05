// ========== DEPENDENCIES ==========
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const mongoose = require('mongoose');
const crypto = require('crypto');
const WebSocket = require('ws'); // npm install ws if missing

const app = express();

// ========== MONGODB CONNECTION ==========
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clickdash', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const db = mongoose.connection.db; // for direct collection access

// ========== MODELS ==========
const UserSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    username: String,
    avatar: String,
    orbsBalance: { type: Number, default: 0 },
    memberSince: { type: String, default: () => new Date().toLocaleDateString() },
    systemStatus: { type: String, default: "ALPHA-PRODIGY" },
    lastActive: { type: Date, default: Date.now },
    plan: { type: String, default: "unlimited" }  // you as admin
});
const User = mongoose.model('User', UserSchema);

const LinkSchema = new mongoose.Schema({
    shortCode: { type: String, required: true, unique: true },
    longUrl: { type: String, required: true },
    userId: { type: String, default: null },
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const Link = mongoose.model('Link', LinkSchema);

// ========== DISCORD AUTH ==========
passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL || 'https://clickdash.io/auth/discord/callback',
    scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ discordId: profile.id });
        if (!user) {
            user = new User({
                discordId: profile.id,
                username: profile.username,
                avatar: profile.avatar,
                memberSince: new Date().toLocaleDateString()
            });
            await user.save();
        } else {
            user.lastActive = new Date();
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.discordId));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findOne({ discordId: id });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

// ========== PA LANGUAGE ENGINE ==========
let globalPulse = 50;
let eventHistory = [];
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

function broadcastToAll(data) {
    if (wss && wss.clients) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
}

async function emitPAEvent(eventType, source, userId, metadata = {}) {
    const weight = eventWeights[eventType] || 0;
    const oldPulse = globalPulse;
    globalPulse = Math.min(100, Math.max(0, globalPulse + weight));
    
    const eventRecord = { eventType, source, userId, metadata, weight, oldPulse, newPulse: globalPulse, timestamp: new Date() };
    eventHistory.unshift(eventRecord);
    if (eventHistory.length > 1000) eventHistory.pop();
    
    try {
        await db.collection('pa_events').insertOne(eventRecord);
    } catch (err) { console.error('PA event save error:', err); }
    
    broadcastToAll({ type: 'pulse_update', pulse: globalPulse, lastEvent: eventType });
    return globalPulse;
}

// ========== ROUTES ==========
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/',
    successRedirect: '/dashboard'
}));

app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ error: 'Not authenticated' });
}

app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/dashboard.html');
});

app.get('/api/me', ensureAuthenticated, async (req, res) => {
    res.json(req.user);
});

// Get user's links
app.get('/api/links', ensureAuthenticated, async (req, res) => {
    const links = await Link.find({ userId: req.user.discordId }).sort({ createdAt: -1 });
    res.json(links);
});

// Shorten link (with PA event)
app.post('/api/shorten', ensureAuthenticated, async (req, res) => {
    const { longUrl, customSlug } = req.body;
    if (!longUrl) return res.status(400).json({ error: 'URL required' });
    
    let shortCode = customSlug || Math.random().toString(36).substring(2, 8);
    let existing = await Link.findOne({ shortCode });
    while (existing && customSlug) {
        shortCode = Math.random().toString(36).substring(2, 8);
        existing = await Link.findOne({ shortCode });
    }
    if (existing && !customSlug) {
        shortCode = shortCode + Math.floor(Math.random() * 100);
    }
    
    const newLink = new Link({ shortCode, longUrl, userId: req.user.discordId });
    await newLink.save();
    
    // Emit PA event
    await emitPAEvent('LINK_SHORTENED', 'clickdash', req.user.discordId, { shortCode });
    
    res.json({ shortUrl: `https://clickdash.io/${shortCode}`, shortCode });
});

// Redirect short links
app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    if (shortCode === 'favicon.ico') return res.status(204);
    const link = await Link.findOne({ shortCode });
    if (link) {
        link.clicks += 1;
        await link.save();
        return res.redirect(link.longUrl);
    }
    res.status(404).send('Link not found');
});

// Battle report endpoint
app.get('/api/pa/report', ensureAuthenticated, async (req, res) => {
    try {
        const positive = await db.collection('pa_events').countDocuments({ weight: { $gt: 0 } });
        const negative = await db.collection('pa_events').countDocuments({ weight: { $lt: 0 } });
        const recent = await db.collection('pa_events').find().sort({ timestamp: -1 }).limit(20).toArray();
        res.json({
            pulse: globalPulse,
            positive,
            negative,
            ratio: (positive / (positive + negative || 1)).toFixed(2),
            recent
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pricing routes
app.get('/api/pricing', async (req, res) => {
    const pricing = await db.collection('settings').findOne({ key: 'pricing' });
    res.json(pricing?.value || { slug: 19, premium: 49 });
});

app.post('/api/admin/pricing', ensureAuthenticated, async (req, res) => {
    if (req.user.plan !== 'unlimited') return res.status(403).send('Not admin');
    await db.collection('settings').updateOne(
        { key: 'pricing' },
        { $set: { value: req.body.prices } },
        { upsert: true }
    );
    res.send('Pricing updated');
});

// ========== START SERVER WITH WEBSOCKET ==========
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`ClickDash + PA Language running on port ${PORT}`);
});

// Attach WebSocket to the same HTTP server
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws, req) => {
    ws.send(JSON.stringify({ type: 'pulse_update', pulse: globalPulse }));
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            if (data.event && data.userId) {
                await emitPAEvent(data.event, data.source, data.userId, data.metadata);
            }
        } catch (err) { console.error('WS message error:', err); }
    });
});