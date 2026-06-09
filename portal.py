from flask import Flask, request, redirect
from config import ARCHITECT_KEY

app = Flask(__name__)

@app.route('/portal')
def citadel_portal():
    key = request.args.get('key')
    if key != ARCHITECT_KEY:
        return "Access Denied", 403
    
    # This logs the visit via your UTM tags from your dashboard
    return "Citadel Active: Welcome to the Trigga Nordy Network"

if __name__ == '__main__':
    app.run(port=8080)
