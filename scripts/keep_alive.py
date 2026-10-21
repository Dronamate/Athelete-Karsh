"""
DronaMate - Render Live Backend Keep-Alive Script
Pings https://athelete-karsh.onrender.com every 10 minutes to prevent the free instance from sleeping.
Run: uv run scripts/keep_alive.py
"""

import time
import datetime
import urllib.request
import ssl

BACKEND_PING_URL = "https://athelete-karsh.onrender.com/api/sports/"
INTERVAL_SECONDS = 600  # 10 minutes (Render sleeps after 15 minutes of inactivity)

def ping():
    ctx = ssl.create_default_context()
    req = urllib.request.Request(
        BACKEND_PING_URL,
        headers={"User-Agent": "DronaMate-KeepAlive-Bot/1.0"}
    )
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        with urllib.request.urlopen(req, timeout=60, context=ctx) as resp:
            print(f"[{now}] Ping OK! Status: {resp.status} - Render backend is awake and healthy.")
    except urllib.error.HTTPError as e:
        print(f"[{now}] Ping responded with HTTP {e.code} - Server is awake.")
    except Exception as e:
        print(f"[{now}] Ping warning: {e}")

def main():
    print(f"Starting DronaMate Render Keep-Alive monitor for: {BACKEND_PING_URL}")
    print(f"Pinging every {INTERVAL_SECONDS // 60} minutes. Press Ctrl+C to stop.\n")
    
    # Immediate first ping
    ping()
    
    while True:
        try:
            time.sleep(INTERVAL_SECONDS)
            ping()
        except KeyboardInterrupt:
            print("\nKeep-alive monitor stopped.")
            break

if __name__ == "__main__":
    main()
