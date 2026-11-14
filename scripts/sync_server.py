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
import re

PORT = 18765
SYNC_SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sync_all.py')
SYNC_TOKEN = os.environ.get('SYNC_SERVER_TOKEN', 'pkmsleep-local-sync-token')

ALLOWED_ORIGIN_REGEX = re.compile(r'^https?://(localhost|127\.0\.0\.1)(:\d+)?$')

class SyncHandler(http.server.BaseHTTPRequestHandler):
    def get_validated_origin(self):
        origin = self.headers.get('Origin')
        if not origin:
            return None
        if ALLOWED_ORIGIN_REGEX.match(origin):
            return origin
        return False

    def is_authenticated(self):
        token = self.headers.get('X-Sync-Token', '')
        if not token:
            auth_header = self.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header[7:].strip()
        return token == SYNC_TOKEN

    def send_cors_headers(self, origin):
        if origin:
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')

    def do_OPTIONS(self):
        origin = self.get_validated_origin()
        if origin is False:
            self.send_response(403)
            self.end_headers()
            return

        self.send_response(200)
        self.send_cors_headers(origin)
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Sync-Token, Authorization')
        self.end_headers()

    def do_POST(self):
        origin = self.get_validated_origin()
        if origin is False:
            self.send_response(403)
            self.end_headers()
            return

        if self.path == '/sync':
            if not self.is_authenticated():
                self.send_response(401)
                self.send_header('Content-Type', 'application/json')
                self.send_cors_headers(origin)
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Unauthorized: valid auth token required"}).encode())
                return

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers(origin)
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
        origin = self.get_validated_origin()
        if origin is False:
            self.send_response(403)
            self.end_headers()
            return

        if self.path == '/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_cors_headers(origin)
            self.end_headers()
            self.wfile.write(json.dumps({"status": "running", "message": "Sync server is running"}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"[SyncServer] {format % args}", flush=True)

if __name__ == '__main__':
    with http.server.HTTPServer(('localhost', PORT), SyncHandler) as httpd:
        print(f"[SyncServer] Pokemon Sleep Sync Server running on http://localhost:{PORT}")
        print(f"[SyncServer] Keep this window open and click the Sync button in the webapp.")
        httpd.serve_forever()
