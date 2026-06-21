from flask import Flask, request
from config import ARCHITECT_KEY
import json
from datetime import datetime

app = Flask(__name__)

def update_sovereign_ledger(visitor_key):
    """Logs the portal entry to your GGC Master State."""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "action": "PORTAL_ACCESS_GRANTED",
        "origin": "GGC_UNIVERSE",
        "key_hash": hash(visitor_key) # Simple obfuscation for ledger privacy
    }
    with open('ggc_ledger.json', 'w') as f:
        json.dump(log_entry, f)

@app.route('/portal')
def citadel_portal():
    key = request.args.get('key')
    if key != ARCHITECT_KEY:
        return "Access Denied: Unrecognized Frequency", 403
    
    # Trigger Sovereign Sync
    update_sovereign_ledger(key)
    
    return "Citadel Active: Welcome to the Trigga Nordy Network // STATE_LOCKED"

if __name__ == '__main__':
    app.run(port=8080)
