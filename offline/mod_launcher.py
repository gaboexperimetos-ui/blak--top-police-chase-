#!/usr/bin/env python3
"""Blacktop Police Chase — MOD launcher.

Lets you choose how many police cars can chase you (and traffic density),
patches Build.data, then starts the offline game.
"""
import os, sys, subprocess, shutil, struct, argparse, json

ROOT = os.path.dirname(os.path.abspath(__file__))
GAME_DIR = os.path.join(ROOT, "game")
DATA = os.path.join(GAME_DIR, "Build", "Build.data")
DATA_ORIG = os.path.join(GAME_DIR, "Build", "Build.data.orig")
PATH_ID = 55552

MAX_POLICE = 512

PRESETS = [
    ("Fácil",           3,  10, "3 policías, poco tráfico"),
    ("Normal",          5,  30, "5 policías, tráfico normal"),
    ("Difícil",         8,  40, "8 policías, más tráfico"),
    ("Extremo",        12,  50, "12 policías"),
    ("Salvaje",        24,  50, "24 policías (pesado)"),
    ("Apocalipsis",    48,  60, "48 policías (muy pesado)"),
    ("Tormenta",       96,  60, "96 policías (pool 157)"),
    ("Infierno",      192,  60, "192 policías (pool 253)"),
    ("Apocalipsis 512", 512, 60, "512 policías (pool 573, muy pesado)"),
]


def body_offset(raw):
    off = 12 + 1
    off = (off + 3) & ~3
    off += 12
    nlen = struct.unpack_from("<i", raw, off)[0]
    off += 4 + nlen
    return (off + 3) & ~3


def locate_limits(raw):
    b = body_offset(raw)
    for pos in range(b, len(raw) - 16, 4):
        if abs(struct.unpack_from("<f", raw, pos)[0] - 1.0) < 1e-6:
            v = [struct.unpack_from("<f", raw, pos + 4 * i)[0] for i in range(4)]
            if abs(v[1] - 8.0) < 1e-3 and abs(v[2] - 0.35) < 1e-2 and abs(v[3] - 4.0) < 1e-3:
                return pos - 24
    return None


def apply_limits(police, traffic):
    """Patch Build.data. Reusa el parche actual si ya tiene otras cosas aplicadas.

    Antes se reconstruía siempre desde Build.data.orig, lo que pisaba cualquier
    parche previo y ademas inflaba el archivo. Ahora, si Build.data ya existe y
    tiene el bloque de límites, se modifica en el sitio; solo se cae al `.orig`
    la primera vez.
    """
    import UnityPy

    if not os.path.exists(DATA):
        if not os.path.exists(DATA_ORIG):
            raise RuntimeError("No hay Build.data ni Build.data.orig")
        shutil.copyfile(DATA_ORIG, DATA)

    env = UnityPy.load(DATA)
    obj = None
    for o in env.objects:
        if o.type.name == "MonoBehaviour" and o.path_id == PATH_ID:
            obj = o
            break
    if obj is None:
        raise RuntimeError("CarSpawner no encontrado en Build.data")

    raw = bytearray(obj.get_raw_data())
    ioff = locate_limits(raw)
    if ioff is None:
        raise RuntimeError("No se pudo ubicar el bloque maxPolice/maxTraffic")

    old = [struct.unpack_from("<i", raw, ioff + 4 * i)[0] for i in range(6)]
    for i in (0, 1, 2):
        struct.pack_into("<i", raw, ioff + 4 * i, int(traffic))
    for i in (3, 4):
        struct.pack_into("<i", raw, ioff + 4 * i, int(police))

    obj.set_raw_data(bytes(raw))
    data = env.file.save()
    with open(DATA, "wb") as f:
        f.write(data if isinstance(data, (bytes, bytearray)) else bytes(data))

    write_pool_info(police, traffic)
    return old[4], old[1]


def write_pool_info(police, traffic):
    """Deja escrito el pool que el juego va a crear al arrancar.

    El juego construye la lista de vehiculos al cargar la escena con
    maxPolice + maxTraffic + 1 (los cops + el trafico + el jugador). Ese es el
    techo real: si la escena se cargo con 48 cops, pedir 512 en el panel no
    materializa mas de ~68. El panel lee este archivo para avisar y limitar.
    """
    path = os.path.join(GAME_DIR, "pool.json")
    try:
        with open(path, "w") as f:
            json.dump({"pool": int(police) + int(traffic) + 1,
                       "police": int(police), "traffic": int(traffic)}, f)
    except Exception:
        pass


def ask_choice():
    opts = []
    for name, pol, traf, desc in PRESETS:
        opts += [name, desc]
    opts += ["Personalizado", "Elegir números exactos"]

    try:
        out = subprocess.run(
            ["zenity", "--list", "--title=Blacktop Police Chase — MOD",
             "--text=Elegí cuántos policías y cuánto tráfico querés:",
             "--column=Modo", "--column=Detalle",
             "--height=320", "--width=560", *opts],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
    except subprocess.CalledProcessError:
        sys.exit(0)

    if not out:
        sys.exit(0)

    if out == "Personalizado":
        try:
            res = subprocess.run(
                ["zenity", "--forms", "--title=Blacktop — Personalizado",
                 "--text=Ajustá los límites (policías 1-512, tráfico 0-80):",
                 "--add-entry=Policías", "--add-entry=Tráfico"],
                capture_output=True, text=True, check=True,
            ).stdout.strip()
        except subprocess.CalledProcessError:
            sys.exit(0)
        parts = res.split("|")
        try:
            police = max(1, min(MAX_POLICE, int(parts[0])))
            traffic = max(0, min(80, int(parts[1])))
        except Exception:
            subprocess.run(["zenity", "--error", "--text=Números inválidos."])
            sys.exit(1)
        return police, traffic, "personalizado"

    for name, pol, traf, desc in PRESETS:
        if name == out:
            return pol, traf, name
    sys.exit(0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--police", type=int)
    ap.add_argument("--traffic", type=int)
    ap.add_argument("--no-play", action="store_true")
    a = ap.parse_args()

    if a.police is not None:
        police = max(1, min(MAX_POLICE, a.police))
        traffic = 30 if a.traffic is None else max(0, min(80, a.traffic))
        label = f"police={police} traffic={traffic}"
    else:
        police, traffic, label = ask_choice()

    old_police, old_traffic = apply_limits(police, traffic)
    print(f"[mod] {label}: policía {old_police}->{police} | tráfico {old_traffic}->{traffic}", flush=True)

    if a.no_play:
        return

    subprocess.run([os.path.join(ROOT, "launch.sh")])


if __name__ == "__main__":
    main()