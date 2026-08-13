"""
Pokemon Sleep 全同步腳本 sync_all.py
---
執行後會自動：
1. 從參考表抓取最新數據
2. 寫入目標 Google Sheet (1BD05wG8Gy3EUNzhg5mtErllr-Rkv20iFGsZ8kNsuUJ0)
3. 重新產生 webapp/data.json 與 recipes.json
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

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEBAPP_DIR = BASE_DIR
SYNC_SCRIPT = os.path.join(BASE_DIR, 'pokemon_sleep_sync.py')
DATA_BUILDER = os.path.join(BASE_DIR, 'build_webapp_data.py')
RECIPE_SYNC = os.path.join(BASE_DIR, 'scripts', 'sync_data.py')

# Token loaded from environment variable GH_PAT or local config file (never hardcoded)
GH_TOKEN = os.environ.get('GH_PAT', '')
if not GH_TOKEN:
    config_path = os.path.join(BASE_DIR, '.gh_token')
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
        cwd=BASE_DIR,
        capture_output=False
    )
    if res.returncode == 0:
        log("Step 1 Done: Google Sheet sync complete!")
    else:
        log(f"Step 1 Warning: Google Sheet sync exited with code {res.returncode}")

def step2_rebuild_webapp_data():
    log("Step 2: Rebuilding webapp data.json & recipes.json...")
    res1 = subprocess.run([sys.executable, DATA_BUILDER], cwd=BASE_DIR, capture_output=False)
    res2 = subprocess.run([sys.executable, RECIPE_SYNC], cwd=BASE_DIR, capture_output=False)
    if res1.returncode == 0 and res2.returncode == 0:
        log("Step 2 Done: data.json & recipes.json rebuilt!")
    else:
        log(f"Step 2 Warning: data.json ({res1.returncode}), recipes.json ({res2.returncode})")

def step3_push_to_github():
    log("Step 3: Pushing updated site to GitHub Pages...")
    token = GH_TOKEN
    if not token:
        log("Step 3 Warning: No GH_TOKEN found, skipping manual push step in local runner.")
        return

    remote_url = f"https://x-access-token:{token}@github.com/{GH_USERNAME}/{GH_REPO}.git"

    try:
        subprocess.run(["git", "remote", "remove", "origin"], cwd=WEBAPP_DIR, capture_output=True)
        subprocess.run(["git", "remote", "add", "origin", remote_url], cwd=WEBAPP_DIR, check=True)
        subprocess.run(["git", "add", "."], cwd=WEBAPP_DIR, check=True)
        subprocess.run(
            ["git", "commit", "-m", "Sync: Update Pokémon Sleep data & recipes"],
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
