# portal.py - Integrating GPC check
@app.route('/portal')
def citadel_portal():
    key = request.args.get('key')
    gpc_id = request.headers.get('X-GPC-IDENTITY') # Pass this from the client
    
    if key != ARCHITECT_KEY:
        return "Access Denied", 403
    
    # Now you know exactly who/what is accessing the portal
    print(f"[AUTH] Sovereign Identity Authenticated: {gpc_id}")
    return "Citadel Active"
