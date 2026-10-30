#!/bin/bash
# ASCEND_MONITOR.SH: Resonance Diagnostic Probe (100% Bare-Metal)
# Purpose: Verify heartbeat & frequency alignment directly on local Linux infrastructure

set -e

# Point directly to local MotherBot engine (localhost or Tailscale IP)
TARGET_HOST="${MOTHERBOT_HOST:-127.0.0.1}"
TARGET_PORT="${MOTHERBOT_PORT:-3000}"
ENDPOINT_URL="http://${TARGET_HOST}:${TARGET_PORT}/api/status"
FREQUENCY_HEADER="5X-1.500"

run_resonance_check() {
  echo "📡 [GGC_DNA_INIT] Probing local bare-metal node at ${ENDPOINT_URL}..."

  # 1. Direct local curl with Frequency Lock Header
  HTTP_RESPONSE=$(curl -s -o /tmp/probe_body.json -w "%{http_code}" \
    -H "x-ggc-frequency: ${FREQUENCY_HEADER}" \
    --max-time 5 \
    "${ENDPOINT_URL}" || echo "000")

  # 2. Verify local service response
  if [ "$HTTP_RESPONSE" -eq 200 ]; then
    echo "✅ [SUCCESS] Local Citadel Core reachable (HTTP 200)."
    echo "🧬 [DNA_VERIFY] ASCEND_MONITOR.SH heartbeat active on native hardware."
    if [ -f /tmp/probe_body.json ]; then
      echo "📊 [TELEMETRY_RESPONSE]: $(cat /tmp/probe_body.json)"
      rm -f /tmp/probe_body.json
    fi
  else
    echo "❌ [CRITICAL] Core unreachable on local node (HTTP Status: ${HTTP_RESPONSE})."
    echo "💡 Ensure motherbot service is active locally: sudo systemctl status motherbot.service"
    rm -f /tmp/probe_body.json 2>/dev/null
    exit 1
  fi
}

case "$1" in
  --verify-pulse)
    run_resonance_check
    ;;
  *)
    run_resonance_check
    ;;
esac

echo "=================================================="
echo " [ASCEND_MONITOR] Native probe complete."
echo "=================================================="
