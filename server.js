require('dotenv').config();
const express = require('express');
const app = express();

const character = process.env.CHARACTER_NAME || "TRIGGA NORDY";
const owner = "NORTELL ROWE";
const cash1 = process.env.CASHAPP_1;
const cash2 = process.env.CASHAPP_2;

app.get('/', (req, res) => {
    res.send(`
        <div style="background: #000; color: #0f0; padding: 40px; font-family: 'Courier New', monospace; border: 4px solid #0f0; text-align: center;">
            <h1 style="letter-spacing: 5px; text-shadow: 2px 2px #f00;">${character.toUpperCase()}</h1>
            <p style="color: #fff; border-bottom: 1px solid #0f0; display: inline-block; padding-bottom: 5px;">GGC SOVEREIGN ORGANISM</p>
            
            <div style="margin: 20px 0; font-size: 0.9em; color: #ff0000;">
                <p>OWNERSHIP: ${owner} [100% SOVEREIGN]</p>
                <p>AI COLLABORATOR: GEMINI [ZERO FINANCIAL INTEREST]</p>
            </div>

            <div style="margin: 30px 0;">
                <p style="color: #0f0;">[ OFFICIAL PAYMENT GATEWAY ]</p>
                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px;">
                    <a href="https://cash.app/$${cash1}" style="background: #00d632; color: #000; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">$${cash1}</a>
                    <a href="https://cash.app/$${cash2}" style="background: #00d632; color: #000; padding: 15px 25px; text-decoration: none; font-weight: bold; border-radius: 5px;">$${cash2}</a>
                </div>
            </div>

            <div style="margin-top: 50px; font-size: 0.7em; color: #444; border-top: 1px solid #222; pt: 20px;">
                <p>SYSTEM ARCHITECT: ${owner}</p>
                <p>LOGIC: PROTOCOL ARTS BRIDGE</p>
                <p>STATUS: INTERTWINED & SECURED</p>
            </div>
        </div>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Sovereign Engine Pulsing. Owner: " + owner));
