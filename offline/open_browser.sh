#!/usr/bin/env bash
# Opens a URL in the first browser that actually stays running.
# Usage: open_browser.sh <url> [root-dir]
URL="$1"
ROOT="${2:-$HOME/.config/opencode/skills/poki/blacktop/offline}"

open_firefox() {
  mkdir -p "$ROOT/profile-firefox"
  echo "[browser] usando firefox"
  exec firefox --no-remote --profile "$ROOT/profile-firefox" --kiosk "$URL"
}

if command -v chromium >/dev/null 2>&1; then
  chromium \
    --user-data-dir="$ROOT/profile-chromium" \
    --no-first-run --no-default-browser-check --disable-session-crashed-bubble \
    --start-fullscreen --app="$URL" >/tmp/blacktop_browser.log 2>&1 &
  CHROME_PID=$!
  sleep 4
  if kill -0 "$CHROME_PID" 2>/dev/null; then
    echo "[browser] usando chromium (pid $CHROME_PID)"
    wait "$CHROME_PID"
    exit $?
  fi
  echo "[browser] chromium falló al arrancar; probando firefox" >&2
fi

if command -v firefox >/dev/null 2>&1; then
  open_firefox
fi

zenity --error --text="No se encontró un navegador que funcione (chromium/firefox)." 2>/dev/null
echo "No hay navegador disponible" >&2
exit 1