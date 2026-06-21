#!/bin/bash
# ASCEND_MONITOR.SH: Resonance Diagnostic Probe
# Purpose: Verify heartbeat and registry alignment

echo "📡 [GGC_DNA_INIT] Initiating Resonance Probe..."

# 1. Ping the MotherBot Registry
REGISTRY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://clickdash-motherbot-v1.up.railway.app/health)

# 2. Verify Constitutional Alignment
if [ "$REGISTRY_STATUS" -eq 200 ]; then
    echo "✅ [SUCCESS] Resonance Locked: Citadel Core is reachable."
    echo "🧬 [DNA_VERIFY] ASCEND_MONITOR.SH heartbeat active."
else
    echo "❌ [CRITICAL] Resonance Mismatch: Registry unreachable."
    exit 1
fi

# 3. Final Handshake Verification
./ascend_monitor.sh --verify-pulse
