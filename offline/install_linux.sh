#!/usr/bin/env bash
# Instala los accesos directos de "app de escritorio" para Blacktop Police Chase (Linux)
# Uso: ./install_linux.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/256x256/apps"
BIN_DIR="$HOME/.local/bin"

mkdir -p "$DESKTOP_DIR" "$ICON_DIR" "$BIN_DIR"

# Copiar icono
cp "$ROOT/icon.png" "$ICON_DIR/blacktop-police-chase.png"

# --- 1. App normal (offline, fullscreen) ---
cat > "$DESKTOP_DIR/blacktop-police-chase.desktop" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Blacktop Police Chase
GenericName=Juego de coches y policías
Comment=Juega 100% offline, sin anuncios, pantalla completa
Exec=$ROOT/launch.sh
Icon=blacktop-police-chase
Terminal=false
Categories=Game;
Keywords=blacktop;police;chase;poki;coches;offline;
StartupNotify=true
StartupWMClass=chromium
EOF

# --- 2. App sin policía ---
cat > "$DESKTOP_DIR/blacktop-police-chase-no-police.desktop" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Blacktop Police Chase (Sin Policía)
GenericName=Juego de coches — modo libre
Comment=Modo offline con policía desactivada automáticamente
Exec=$ROOT/launch_no_police.py
Icon=blacktop-police-chase
Terminal=false
Categories=Game;
StartupNotify=true
StartupWMClass=chromium
EOF

# --- 3. App con MOD (selector de policía/tráfico) ---
cat > "$DESKTOP_DIR/blacktop-police-chase-mod.desktop" <<EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Blacktop Police Chase (MOD)
GenericName=Juego de coches — selector de dificultad
Comment=Modo offline con menú para elegir nivel de policía y tráfico
Exec=$ROOT/mod_launcher.py
Icon=blacktop-police-chase
Terminal=false
Categories=Game;
StartupNotify=true
StartupWMClass=chromium
EOF

# Wrappers en ~/.local/bin para acceso desde terminal
cat > "$BIN_DIR/blacktop" <<EOF
#!/usr/bin/env bash
exec "$ROOT/launch.sh"
EOF
chmod +x "$BIN_DIR/blacktop"

cat > "$BIN_DIR/blacktop-no-police" <<EOF
#!/usr/bin/env bash
exec "$ROOT/launch_no_police.py"
EOF
chmod +x "$BIN_DIR/blacktop-no-police"

cat > "$BIN_DIR/blacktop-mod" <<EOF
#!/usr/bin/env bash
exec "$ROOT/mod_launcher.py"
EOF
chmod +x "$BIN_DIR/blacktop-mod"

# Actualizar bases de datos de escritorio
update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
gtk-update-icon-cache -f -t "$HOME/.local/share/icons/hicolor" 2>/dev/null || true

echo "✅ Instalado. Busca en tu menú de aplicaciones:"
echo "   • Blacktop Police Chase"
echo "   • Blacktop Police Chase (Sin Policía)"
echo "   • Blacktop Police Chase (MOD)"
echo ""
echo "También puedes lanzar desde terminal: blacktop | blacktop-no-police | blacktop-mod"