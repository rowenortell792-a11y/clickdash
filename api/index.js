const express = require('express');
const path = require('path');
const app = express();

// 1. Point to the public folder correctly for Vercel's structure
app.use(express.static(path.join(__dirname, '../public')));

// 2. Route to serve the dashboard directly
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// 3. Main route redirects everyone to the dashboard
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// 4. API status check remains functional
app.get('/api/status', (req, res) => {
    res.status(200).json({
        message: "Clickdash Engine Active",
        statusCheck: "/api/status"
    });
});

// 5. Catch-all for any other routes
app.get('*', (req, res) => {
    res.redirect('/dashboard');
});

module.exports = app;
