#!/usr/bin/env python3
"""Blacktop Police Chase — Cross-platform launcher (normal offline mode)."""
import os, sys, subprocess, time, signal, socket

ROOT = os.path.dirname(os.path.abspath(__file__))
GAME_DIR = os.path.join(ROOT, "game")

def find_free_port(start=8877):
    p = start
    while p < start + 50:
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", p)) != 0:
                return p
        p += 1
    return start

PORT = find_free_port()

# Start HTTP server
server = subprocess.Popen([
    sys.executable, "-m", "http.server", str(PORT),
    "--bind", "127.0.0.1", "--directory", GAME_DIR
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

time.sleep(1)

def cleanup(*_):
    try: server.terminate()
    except Exception: pass
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

# Try Chromium/Chrome in --app mode (kiosk/fullscreen)
browsers = [
    ("chromium", ["--user-data-dir={}/profile-chromium".format(ROOT),
                  "--no-first-run", "--no-default-browser-check",
                  "--disable-session-crashed-bubble",
                  "--start-fullscreen", "--app=http://127.0.0.1:{}/index.html".format(PORT)]),
    ("chrome",   ["--user-data-dir={}/profile-chrome".format(ROOT),
                  "--no-first-run", "--no-default-browser-check",
                  "--disable-session-crashed-bubble",
                  "--start-fullscreen", "--app=http://127.0.0.1:{}/index.html".format(PORT)]),
]

browser = None
for name, args in browsers:
    try:
        browser = subprocess.Popen([name] + args,
                                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"[launcher] Usando {name} (PID {browser.pid})")
        break
    except FileNotFoundError:
        continue

if browser is None:
    print("[launcher] No se encontró Chromium/Chrome, abriendo en navegador predeterminado...")
    import webbrowser
    webbrowser.open("http://127.0.0.1:{}/index.html".format(PORT))
    try:
        server.wait()
    except KeyboardInterrupt:
        pass
    cleanup()

try:
    browser.wait()
finally:
    cleanup()