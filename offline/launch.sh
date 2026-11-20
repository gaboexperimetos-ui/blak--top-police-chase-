#!/usr/bin/env bash
# Blacktop Police Chase — 100% offline launcher (Unity WebGL via local HTTP server)
ROOT="$(cd "$(dirname "$0")" && pwd)"
GAME_DIR="$ROOT/game"
PORT=8877

# Pick a free port (avoid clashing with other local services)
for p in 8877 8878 8879 8881 8882 8883 8884 8885; do
  if ! (exec 3<>/dev/tcp/127.0.0.1/$p) 2>/dev/null; then PORT=$p; break; fi
  exec 3<&- 2>/dev/null
done

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$GAME_DIR" >/tmp/blacktop_server.log 2>&1 &
SERVER_PID=$!
sleep 1

cleanup() { kill "$SERVER_PID" 2>/dev/null; }
trap cleanup EXIT INT TERM

if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  zenity --error --text="No se pudo iniciar el servidor local del juego. Ver /tmp/blacktop_server.log" 2>/dev/null
  exit 1
fi

"$ROOT/open_browser.sh" "http://127.0.0.1:$PORT/index.html" "$ROOT"

cleanup