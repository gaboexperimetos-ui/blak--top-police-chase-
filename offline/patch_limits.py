#!/usr/bin/env python3
"""Patch Blacktop maxPolice/maxTraffic inside Build.data (UnityPy, verified layout)."""
import UnityPy, struct, sys, argparse, os

PATH_ID = 55552  # CarSpawner MonoBehaviour

def _body_offset(raw):
    off = 12 + 1
    off = (off + 3) & ~3
    off += 12
    nlen = struct.unpack_from("<i", raw, off)[0]
    off += 4 + nlen
    return (off + 3) & ~3

def locate_limits(raw):
    b = _body_offset(raw)
    for pos in range(b, len(raw) - 16, 4):
        if abs(struct.unpack_from("<f", raw, pos)[0] - 1.0) < 1e-6:
            v = [struct.unpack_from("<f", raw, pos + 4 * i)[0] for i in range(4)]
            if abs(v[1] - 8.0) < 1e-3 and abs(v[2] - 0.35) < 1e-2 and abs(v[3] - 4.0) < 1e-3:
                return pos - 24
    return None

def _obj(env):
    for o in env.objects:
        if o.type.name == "MonoBehaviour" and o.path_id == PATH_ID:
            return o
    return None

def read_limits(path):
    env = UnityPy.load(path)
    raw = bytearray(_obj(env).get_raw_data())
    ioff = locate_limits(raw)
    if ioff is None:
        raise RuntimeError("bloque de límites no encontrado")
    return struct.unpack_from("<6i", raw, ioff)

def apply_limits(src_orig, dst, police=None, traffic=None):
    env = UnityPy.load(src_orig)
    obj = _obj(env)
    raw = bytearray(obj.get_raw_data())
    ioff = locate_limits(raw)
    if ioff is None:
        raise RuntimeError("bloque de límites no encontrado")
    before = struct.unpack_from("<6i", raw, ioff)
    if traffic is not None:
        for k in (0, 1, 2):
            struct.pack_into("<i", raw, ioff + 4 * k, int(traffic))
    if police is not None:
        for k in (3, 4):
            struct.pack_into("<i", raw, ioff + 4 * k, int(police))
    obj.set_raw_data(bytes(raw))
    data = env.file.save()
    with open(dst, "wb") as f:
        f.write(data if isinstance(data, (bytes, bytearray)) else bytes(data))
    return before, struct.unpack_from("<6i", raw, ioff)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("orig"); ap.add_argument("dst")
    ap.add_argument("--police", type=int); ap.add_argument("--traffic", type=int)
    a = ap.parse_args()
    before, after = apply_limits(a.orig, a.dst, a.police, a.traffic)
    print("before:", before, "-> after:", after)