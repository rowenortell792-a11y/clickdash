// --- CITADEL CONSTITUTIONAL GOVERNANCE ---
const GOVERNANCE = {
    PUBLIC_MASK: "open",
    FAMILY_FREQUENCY: "restricted",
    BUSINESS_LANE: "audited"
};

app.get('/ingress', (req, res) => {
    const lane = req.query.lane; // e.g., ?lane=family or ?lane=business
    const key = req.query.key;

    // RULE 1: PUBLIC MASK IS ALWAYS OPEN
    if (!lane || lane === GOVERNANCE.PUBLIC_MASK) {
        return res.send("Welcome to the public portal. Access the Citadel via official channels.");
    }

    // RULE 2: FAMILY FREQUENCY (The Free Zone)
    if (lane === GOVERNANCE.FAMILY_FREQUENCY) {
        if (authorizer.verify(key).granted) {
            return res.send("Welcome, Kin. You are inside the Sovereign Zone.");
        }
        return res.status(401).send("Unauthorized family attempt.");
    }

    // RULE 3: BUSINESS LANE (The Audited Zone)
    if (lane === GOVERNANCE.BUSINESS_LANE) {
        console.log(`[AUDIT] Business lane access by: ${req.ip}`);
        // Business lanes require higher security checks
        return res.send("Business portal active. Activity being audited.");
    }
});
