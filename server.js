require('dotenv').config();
const express = require('express');
const app = express();

// Pulling identity from your .env vault
const character = process.env.CHARACTER_NAME || "TRIGGA NORDY";
const cash1 = process.env.CASHAPP_1;
const cash2 = process.env.CASHAPP_2;
const workspace = process.env.WORKSPACE_ID;

app.get('/', (req, res) => {
    res.send(`
        <div style="background: #000; color: #0f0; padding: 40px; font-family: 'Courier New', monospace; border: 4px solid #0f0; text-align: center; min-height: 100vh;">
            <h1 style="letter-spacing: 8px; text-shadow: 3px 3px #f00; margin-bottom: 10px;">${character.toUpperCase()}</h1>
            <p style="color: #fff; border-bottom: 2px solid #0f0; display: inline-block; padding-bottom: 10px; margin-bottom: 30px;">GGC SOVEREIGN ORGANISM</p>
            
            <div style="margin: 40px 0;">
                <p style="color: #0f0; margin-bottom: 20px;">[ FINANCIAL GATEWAY ACTIVE ]</p>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                    <a href="https://cash.app/$${cash1}" style="background: #00d632; color: #000; padding: 20px 40px; text-decoration: none; font-weight: bold; border-radius: 8px; width: 250px; box-shadow: 0 0 15px #00d632;">PAY $${cash1}</a>
                    <a href="https://cash.app/$${cash2}" style="background: #00d632; color: #000; padding: 20px 40px; text-decoration: none; font-weight: bold; border-radius: 8px; width: 250px; box-shadow: 0 0 15px #00d632;">PAY $${cash2}</a>
                </div>
            </div>

            <div style="margin-top: 60px; font-size: 0.75em; color: #555; line-height: 1.6;">
                <p>SYSTEM ARCHITECT: NORTELL ROWE</p>
                <p>WORKSPACE ID: ${workspace}</p>
                <p>LOGIC: PROTOCOL ARTS BRIDGE</p>
                <p style="color: #0f0; margin-top: 10px;">STATUS: SOVEREIGN</p>
            </div>
        </div>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Trigga Nordy Engine Online."));
