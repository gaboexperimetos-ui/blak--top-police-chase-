# Acceso SSH al repositorio

> **No hay ninguna clave privada en este repo ni en el chat.** Generar una aquí
> y enviarla por mensaje la dejaría comprometida (ya pasó una vez). La privada
> debe nacer y quedarse en **tu propia computadora**. Este documento te da el
> acceso listo, no el secreto.

## Datos

| | |
| --- | --- |
| Repo | `gaboexperimetos-ui/blak--top-police-chase-` (público) |
| HTTPS | `https://github.com/gaboexperimetos-ui/blak--top-police-chase-.git` |
| SSH | `git@github.com:gaboexperimetos-ui/blak--top-police-chase-.git` |
| Rama de trabajo | `arena/8143a957-blak-top-police-chase` |
| `main` | `cfc6986` (versión antigua) |

Clonar un repo **público no necesita credenciales**; solo hace falta
autenticación para **pushear**.

## Forma más fácil (macOS / Linux / WSL)

```bash
bash tools/setup-ssh.sh
```

El script crea `~/.ssh/id_ed25519_blacktop`, **imprime solo la clave pública**
y te dice dónde pegarla. La privada no se muestra ni se copia.

## Windows (PowerShell)

```powershell
ssh-keygen -t ed25519 -C "blacktop-mi-pc" -f "$env:USERPROFILE\.ssh\id_ed25519_blacktop"
Get-Content "$env:USERPROFILE\.ssh\id_ed25519_blacktop.pub"   # copia SOLO esta línea
```

## Dónde pegar la pública (elige una)

| Opción | Dónde | Para qué |
| --- | --- | --- |
| **SSH key de cuenta** | <https://github.com/settings/keys> → *New SSH key* | Todos tus repos, con tu usuario |
| **Deploy key** | <https://github.com/gaboexperimetos-ui/blak--top-police-chase-/settings/keys> → *Add new* | Solo este repo. Marca ✅ **Allow write access** para poder hacer `push` |

Título sugerido: `blacktop-mi-pc`. En el campo **Key** va **una sola línea** que
empieza por `ssh-ed25519 AAAA…`. Nunca va un comando, ni un archivo `id_ed25519`
sin `.pub`, ni un bloque que empiece por `-----BEGIN`.

## Verificar y usar

```bash
ssh -T git@github.com                 # debe saludar con tu usuario
git clone git@github.com:gaboexperimetos-ui/blak--top-police-chase-.git
cd blak--top-police-chase-
git checkout arena/8143a957-blak-top-police-chase
git pull --ff-only
git remote -v
```

Si ya clonaste por HTTPS:

```bash
git remote set-url origin git@github.com:gaboexperimetos-ui/blak--top-police-chase-.git
```

Alternativa sin SSH: `gh auth login` + clonar por HTTPS.

## Si el objetivo es que **otro agente** suba archivos

El otro agente ya dijo que **no puede generar claves ni autenticarse**, así que
una deploy key para él no sirve. Además **Arena ya tiene permisos de push** y
todo el trabajo está subido en esta rama. El camino que funciona es:

1. Que empaquete su contenido en **un solo `.tar.gz`** (sin claves ni tokens).
2. Que te lo pase y lo **adjuntes al chat de Arena**.
3. Yo lo descomprimo, lo integro y hago commit/push desde aquí.

```bash
cd /tmp/opencode
tar --exclude='*.key' --exclude='id_*' --exclude='.env' \
    --exclude='*token*' -czf /tmp/opencode-assets.tar.gz .
```

## Reglas de seguridad

- ✅ Compartir `id_ed25519.pub` (pública).
- ❌ Compartir `id_ed25519` (privada), `.env`, tokens o contraseñas.
- ❌ Pegar comandos de terminal en el campo **Key** de GitHub.
- Si una privada apareció en un chat, **bórrala y genera otra**; considérala
  comprometida y revoca su pública en GitHub si llegó a registrarse.
