#!/bin/bash
# ASCEND_MONITOR.SH: Resonance Diagnostic Probe (Production Grade)
# Purpose: Verify heartbeat, frequency alignment, and registry connectivity for clickdash.net

set -e

# Target Endpoint Setup
ENDPOINT_URL="${MOTHERBOT_URL:-https://clickdash.net-motherbot-v1.up.railway.app/api/status}"
FREQUENCY_HEADER="5X-1.500"

run_resonance_check() {
  echo "📡 [GGC_DNA_INIT] Initiating Resonance Probe against ${ENDPOINT_URL}..."

  # 1. Ping the MotherBot Registry with Frequency Lock Header
  HTTP_RESPONSE=$(curl -s -o /tmp/probe_body.json -w "%{http_code}" \
    -H "x-ggc-frequency: ${FREQUENCY_HEADER}" \
    --max-time 10 \
    "${ENDPOINT_URL}" || echo "000")

  # 2. Verify Constitutional Alignment & Frequency Handshake
  if [ "$HTTP_RESPONSE" -eq 200 ]; then
    echo "✅ [SUCCESS] Resonance Locked: Citadel Core is reachable (HTTP 200)."
    echo "🧬 [DNA_VERIFY] ASCEND_MONITOR.SH heartbeat active."
    if [ -f /tmp/probe_body.json ]; then
      echo "📊 [TELEMETRY_RESPONSE]: $(cat /tmp/probe_body.json)"
      rm -f /tmp/probe_body.json
    fi
  else
    echo "❌ [CRITICAL] Resonance Mismatch: Registry unreachable or Frequency rejected (HTTP Status: ${HTTP_RESPONSE})."
    rm -f /tmp/probe_body.json 2>/dev/null
    exit 1
  fi
}

# 3. Handle Command-Line Arguments & Self-Execution Loops Safely
case "$1" in
  --verify-pulse)
    echo "⚡ [PULSE_VERIFY] Executing direct pulse verification sequence..."
    run_resonance_check
    ;;
  *)
    run_resonance_check
    ;;
esac

echo "=================================================="
echo " [ASCEND_MONITOR] Probe complete. Pulse synchronized."
echo "=================================================="
