// local-core.js
// Initialize a local JSON ledger system

const ledger = [];

// Function to add an entry into the ledger
function addToLedger(entry) {
    ledger.push(entry);
    console.log('Ledger updated:', ledger);
}

// Function to retrieve the full ledger
function getLedger() {
    return ledger;
}

module.exports = {
    addToLedger,
    getLedger
};