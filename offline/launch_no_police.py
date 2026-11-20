#!/usr/bin/env python3
"""Blacktop launcher that auto-disables police at startup (CDP automation)."""
import subprocess, sys, time, json, os, urllib.request, threading, signal

ROOT = os.path.dirname(os.path.abspath(__file__))
GAME_DIR = os.path.join(ROOT, "game")
PROFILE = os.path.join(ROOT, "profile-police-off")
PORT = 8877
DBG = 9301

def find_free_port(start):
    import socket
    p = start
    while p < start + 50:
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", p)) != 0:
                return p
        p += 1
    return start

PORT = find_free_port(PORT)
DBG = find_free_port(DBG)

server = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT),
                           "--bind", "127.0.0.1", "--directory", GAME_DIR],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)

browser = subprocess.Popen([
    "chromium",
    f"--user-data-dir={PROFILE}",
    "--no-first-run", "--no-default-browser-check", "--disable-session-crashed-bubble",
    f"--remote-debugging-port={DBG}",
    "--start-maximized",
    f"--app=http://127.0.0.1:{PORT}/index.html",
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def cleanup(*_):
    try: browser.terminate()
    except Exception: pass
    try: server.terminate()
    except Exception: pass

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

# Connect CDP
ws_url = None
for _ in range(40):
    try:
        tabs = json.loads(urllib.request.urlopen(f"http://127.0.0.1:{DBG}/json", timeout=2).read())
        pages = [t for t in tabs if t.get("type") == "page" and "index.html" in t.get("url", "")]
        if pages:
            ws_url = pages[0]["webSocketDebuggerUrl"]
            break
    except Exception:
        pass
    time.sleep(0.5)

if not ws_url:
    print("No se pudo conectar al juego; se deja abierto sin automatizar.", flush=True)
    browser.wait()
    cleanup()
    sys.exit(0)

import websocket

class CDP:
    def __init__(self, url):
        self.ws = websocket.create_connection(url, timeout=60)
        self._id = 0; self._p = {}; self._l = threading.Lock()
        threading.Thread(target=self._r, daemon=True).start()
    def _r(self):
        while True:
            try: m = json.loads(self.ws.recv())
            except Exception: break
            if "id" in m:
                with self._l: e = self._p.pop(m["id"], None)
                if e: e[1] = m; e[0].set()
    def call(self, method, params=None, timeout=30):
        self._id += 1; i = self._id; e = [threading.Event(), None]
        with self._l: self._p[i] = e
        self.ws.send(json.dumps({"id": i, "method": method, "params": params or {}}))
        e[0].wait(timeout); r = e[1]
        if r is None: raise TimeoutError(method)
        if "error" in r: raise Exception(r["error"])
        return r.get("result", {})

c = CDP(ws_url)
c.call("Runtime.enable"); c.call("Page.enable")

# Wait for Unity instance
ready = False
for _ in range(120):
    try:
        r = c.call("Runtime.evaluate", {"expression": "!!window.unityInstance", "returnByValue": True})
        if r.get("result", {}).get("value"):
            ready = True
            break
    except Exception:
        pass
    time.sleep(0.5)

print("Unity listo:", ready, flush=True)
time.sleep(4)

def viewport():
    r = c.call("Runtime.evaluate", {"expression": "JSON.stringify({w:innerWidth,h:innerHeight})", "returnByValue": True})
    v = json.loads(r.get("result", {}).get("value", "{}"))
    return v.get("w", 1280), v.get("h", 657)

def click(fx, fy):
    w, h = viewport()
    x, y = int(fx * w), int(fy * h)
    c.call("Input.dispatchMouseEvent", {"type": "mouseMoved", "x": x, "y": y, "buttons": 0})
    time.sleep(0.12)
    c.call("Input.dispatchMouseEvent", {"type": "mousePressed", "x": x, "y": y, "button": "left", "buttons": 1, "clickCount": 1})
    time.sleep(0.07)
    c.call("Input.dispatchMouseEvent", {"type": "mouseReleased", "x": x, "y": y, "button": "left", "buttons": 0, "clickCount": 1})

try:
    # 1. dismiss controls overlay
    click(0.805, 0.183); time.sleep(3)
    # 2. pause
    click(0.898, 0.399); time.sleep(2.5)
    # 3. settings gear
    click(0.594, 0.849); time.sleep(2.5)
    # 4. toggle "Desactivar policia"
    click(0.301, 0.399); time.sleep(1.0)
    # 5. green Ok
    click(0.500, 0.849); time.sleep(2.0)
    # 6. continue
    click(0.500, 0.441); time.sleep(1.0)
    print("Policía desactivada (toggle aplicado).", flush=True)
except Exception as e:
    print("Automatización parcial:", e, flush=True)

browser.wait()
cleanup()