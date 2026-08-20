"""
sync_server.py - Local server for Pokemon Sleep Sync Button
Run: python sync_server.py
Then open the webapp and click Sync!
"""
import http.server
import json
import subprocess
import sys
import threading
import os

PORT = 18765
SYNC_SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sync_all.py')

class SyncHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/sync':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            def run_sync():
                print("[SyncServer] Starting sync...", flush=True)
                subprocess.run([sys.executable, SYNC_SCRIPT], cwd=os.path.dirname(SYNC_SCRIPT))
                print("[SyncServer] Sync complete!", flush=True)

            t = threading.Thread(target=run_sync)
            t.daemon = True
            t.start()

            self.wfile.write(json.dumps({"status": "started", "message": "同步已啟動！約需 30-60 秒完成。"}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "running", "message": "Sync server is running"}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"[SyncServer] {format % args}", flush=True)

if __name__ == '__main__':
    with http.server.HTTPServer(('localhost', PORT), SyncHandler) as httpd:
        print(f"[SyncServer] Pokémon Sleep Sync Server running on http://localhost:{PORT}")
        print(f"[SyncServer] Keep this window open and click the Sync button in the webapp.")
        httpd.serve_forever()
