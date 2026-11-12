#!/usr/bin/env bash
# =============================================================================
# CREAR ACCESO SSH AL REPO  ·  Ejecútalo en TU PROPIA COMPUTADORA
#
#   bash tools/setup-ssh.sh
#
# La clave PRIVADA se crea y se queda en tu máquina (~/.ssh). Este script
# NUNCA la muestra, NUNCA la envía y NUNCA la sube a ningún sitio.
# Lo único que imprime es la clave PÚBLICA, que sí es segura de copiar.
#
# ⚠️  Nunca pegues una clave privada en un chat, en un issue ni en el repo.
# =============================================================================
set -euo pipefail

REPO_SSH="git@github.com:gaboexperimetos-ui/blak--top-police-chase-.git"
BRANCH="arena/8143a957-blak-top-police-chase"
KEY="$HOME/.ssh/id_ed25519_blacktop"

echo "Repo : gaboexperimetos-ui/blak--top-police-chase-"
echo "Rama : $BRANCH"
echo "Clave: $KEY  (privada, se queda aquí)"
echo

mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

if [ -f "$KEY" ]; then
  echo "Ya existe una clave en $KEY; se reutiliza (no se genera otra)."
else
  echo "Generando par ed25519..."
  ssh-keygen -t ed25519 -C "blacktop-$(whoami)@$(hostname)" -f "$KEY"
fi
chmod 600 "$KEY"
chmod 644 "$KEY.pub"

echo
echo "===================================================================="
echo " CLAVE PÚBLICA — copia SOLO esta línea y pégala en GitHub"
echo "===================================================================="
cat "$KEY.pub"
echo "===================================================================="
echo
echo "Dónde pegarla (elige UNA):"
echo "  · Tu cuenta, para todos tus repos:"
echo "      https://github.com/settings/keys  →  New SSH key"
echo "  · Solo este repo (deploy key), marca ✅ Allow write access:"
echo "      https://github.com/gaboexperimetos-ui/blak--top-police-chase-/settings/keys"
echo
echo "Título sugerido: blacktop-mi-pc"
echo
echo "Después prueba y configura el remoto:"
echo "  ssh -T git@github.com"
echo "  git remote set-url origin $REPO_SSH"
echo "  git checkout $BRANCH"
echo "  git pull --ff-only"
echo
echo "Si no quieres SSH, HTTPS también funciona (con gh auth login):"
echo "  git clone https://github.com/gaboexperimetos-ui/blak--top-police-chase-.git"
echo
echo "RECUERDA: el archivo $KEY NO se comparte con nadie."
