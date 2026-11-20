#!/usr/bin/env bash
# BLACKTOP: POLICE CHASE — instalador de un solo comando (juego original, offline).
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/gaboexperimetos-ui/blak--top-police-chase-/main/install.sh | bash
set -euo pipefail

REPO="gaboexperimetos-ui/blak--top-police-chase-"
BRANCH="main"
DEST="${BLACKTOP_DIR:-$HOME/BlacktopPoliceChase}"
PORT="${PORT:-3000}"

say() { printf '\033[1;32m%s\033[0m\n' "$*"; }
err() { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }

command -v node >/dev/null 2>&1 || { err "Falta Node.js (>= 16). Instálalo y vuelve a ejecutar."; exit 1; }
command -v curl >/dev/null 2>&1 || { err "Falta curl."; exit 1; }
command -v tar  >/dev/null 2>&1 || { err "Falta tar."; exit 1; }

say "Descargando BLACKTOP: POLICE CHASE..."
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
curl -fsSL "https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH" \
  | tar -xz -C "$TMP" --strip-components=1
trap - EXIT

if [ -d "$DEST" ]; then
  say "Actualizando $DEST (se conservan archivos ajenos al juego)..."
else
  mkdir -p "$DEST"
fi
cp -a "$TMP"/. "$DEST"/
rm -rf "$TMP"

say "Listo. Carpeta: $DEST"
say "Servidor: http://localhost:$PORT  (Ctrl+C para salir)"
cd "$DEST"
PORT="$PORT" exec node server.js
