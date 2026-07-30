"""
Pokemon Sleep 全同步腳本 sync_all.py
---
執行後會自動：
1. 從參考表抓取最新數據
2. 寫入目標 Google Sheet (1BD05wG8Gy3EUNzhg5mtErllr-Rkv20iFGsZ8kNsuUJ0)
3. 重新產生 webapp/data.json
4. 推送到 GitHub Pages (s102213039.github.io/pokemon-sleep-app)
"""
import sys
import os
import subprocess
import shutil
import json
import urllib.request
import csv
import io

sys.path.append(r'c:\Users\chiu\.gemini\antigravity\scratch\google_sheets_sync')
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

WEBAPP_DIR = r'c:\Users\chiu\.gemini\antigravity\scratch\pokemon_sleep_webapp'
SYNC_SCRIPT = r'c:\Users\chiu\.gemini\antigravity\scratch\google_sheets_sync\pokemon_sleep_sync.py'
DATA_BUILDER = r'C:\Users\chiu\.gemini\antigravity\brain\0f55996c-1979-483f-b841-b662ec74dce3\scratch\build_webapp_data.py'
# Token loaded from environment variable GH_PAT or local config file (never hardcoded)
GH_TOKEN = os.environ.get('GH_PAT', '')
if not GH_TOKEN:
    config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.gh_token')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            GH_TOKEN = f.read().strip()
GH_USERNAME = "s102213039"
GH_REPO = "pokemon-sleep-app"


def log(msg):
    print(f"[SYNC] {msg}", flush=True)

def step1_sync_google_sheet():
    log("Step 1: Syncing reference → target Google Sheet...")
    res = subprocess.run(
        [sys.executable, SYNC_SCRIPT],
        cwd=r'c:\Users\chiu\.gemini\antigravity\scratch\google_sheets_sync',
        capture_output=False
    )
    if res.returncode == 0:
        log("Step 1 Done: Google Sheet sync complete!")
    else:
        log(f"Step 1 Warning: Google Sheet sync exited with code {res.returncode}")

def step2_rebuild_webapp_data():
    log("Step 2: Rebuilding webapp data.json from reference sheet...")
    res = subprocess.run(
        [sys.executable, DATA_BUILDER],
        cwd=r'c:\Users\chiu\.gemini\antigravity\scratch\google_sheets_sync',
        capture_output=False
    )
    if res.returncode == 0:
        log("Step 2 Done: data.json rebuilt!")
    else:
        log(f"Step 2 Failed: data.json rebuild exited with code {res.returncode}")

def step3_push_to_github():
    log("Step 3: Pushing updated site to GitHub Pages...")
    token = GH_TOKEN
    remote_url = f"https://x-access-token:{token}@github.com/{GH_USERNAME}/{GH_REPO}.git"

    try:
        subprocess.run(["git", "remote", "remove", "origin"], cwd=WEBAPP_DIR, capture_output=True)
        subprocess.run(["git", "remote", "add", "origin", remote_url], cwd=WEBAPP_DIR, check=True)
        subprocess.run(["git", "add", "."], cwd=WEBAPP_DIR, check=True)
        subprocess.run(
            ["git", "commit", "-m", "Sync: Update Pokémon Sleep data"],
            cwd=WEBAPP_DIR,
            capture_output=True
        )
        push_res = subprocess.run(
            ["git", "push", "-u", "origin", "main", "--force"],
            cwd=WEBAPP_DIR,
            capture_output=True,
            text=True
        )
        if push_res.returncode == 0:
            log(f"Step 3 Done: Pushed to https://github.com/{GH_USERNAME}/{GH_REPO}")
            log(f"Live URL: https://{GH_USERNAME}.github.io/{GH_REPO}/")
        else:
            log(f"Step 3 Failed: {push_res.stderr}")
    except Exception as e:
        log(f"Step 3 Error: {e}")

if __name__ == "__main__":
    log("=== POKEMON SLEEP FULL SYNC STARTING ===")
    step1_sync_google_sheet()
    step2_rebuild_webapp_data()
    step3_push_to_github()
    log("=== ALL DONE! ===")
