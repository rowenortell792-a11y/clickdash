async function syncClickDash(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔺 [SYNC_ATTEMPT_${i + 1}] Executing deployment...`);
      const response = await fetch(`${MOTHERBOT_URL}/api/governance/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-GGC-AUTH': process.env.NODE_SECRET // Added security layer
        },
        body: JSON.stringify({
           ...clickdashPayload,
           last_heartbeat: new Date().toISOString()
        })
      });
      const feedback = await response.json();
      console.log(`✅ [SYNC_SUCCESS]: ${feedback.constitution_alignment}`);
      return; 
    } catch (err) {
      console.error(`❌ [SYNC_FAIL]: ${err.message}. Retrying...`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}
