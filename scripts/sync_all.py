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
WEBAPP_DIR = os.path.dirname(BASE_DIR)
SYNC_SCRIPT = os.path.join(BASE_DIR, 'pokemon_sleep_sync.py')
DATA_BUILDER = os.path.join(BASE_DIR, 'build_webapp_data.py')
RECIPE_SYNC = os.path.join(BASE_DIR, 'sync_data.py')
NEWS_BUILDER = os.path.join(BASE_DIR, 'build_news.py')
LADDER_BUILDER = os.path.join(BASE_DIR, 'build_ingredient_ladder.py')
MANIFEST_BUILDER = os.path.join(BASE_DIR, 'generate_manifest.py')

# Token loaded from environment variable GH_PAT or local config file (never hardcoded)
GH_TOKEN = os.environ.get('GH_PAT', '')
if not GH_TOKEN:
    config_path = os.path.join(WEBAPP_DIR, '.gh_token')
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            GH_TOKEN = f.read().strip()
GH_USERNAME = "s102213039"
GH_REPO = "pokemon-sleep-app"


def log(msg):
    print(f"[SYNC] {msg}", flush=True)

def step1_sync_google_sheet():
    log("Step 1: Syncing reference -> target Google Sheet...")
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
    log("Step 2: Rebuilding webapp data.json, recipes.json, news.json, ladder_lv60.json & manifest.json...")
    res1 = subprocess.run([sys.executable, DATA_BUILDER], cwd=BASE_DIR, capture_output=False)
    res2 = subprocess.run([sys.executable, RECIPE_SYNC], cwd=BASE_DIR, capture_output=False)
    res3 = subprocess.run([sys.executable, NEWS_BUILDER], cwd=BASE_DIR, capture_output=False)
    res_ladder = subprocess.run([sys.executable, LADDER_BUILDER], cwd=BASE_DIR, capture_output=False)
    res4 = subprocess.run([sys.executable, MANIFEST_BUILDER], cwd=BASE_DIR, capture_output=False)
    if res1.returncode == 0 and res2.returncode == 0 and res3.returncode == 0 and res_ladder.returncode == 0 and res4.returncode == 0:
        log("Step 2 Done: data.json, recipes.json, news.json, ladder_lv60.json & manifest.json rebuilt!")
    else:
        log(f"Step 2 Warning: data.json ({res1.returncode}), recipes.json ({res2.returncode}), news.json ({res3.returncode}), ladder ({res_ladder.returncode}), manifest.json ({res4.returncode})")

def step3_push_to_github():
    log("Step 3: Pushing updated site to GitHub Pages...")
    token = GH_TOKEN
    if not token:
        log("Step 3 Warning: No GH_TOKEN found, skipping manual push step in local runner.")
        return

    try:
        # 安全防護：僅針對特定資料更新檔案執行 git add，絕不使用全域盲目 git add .
        target_files = [
            "data/data.json",
            "data/recipes.json",
            "data/news.json",
            "data/ladder_lv60.json",
            "js/data/ladder_data.js",
            "data/manifest.json"
        ]
        existing_targets = [f for f in target_files if os.path.exists(os.path.join(WEBAPP_DIR, f))]
        if existing_targets:
            subprocess.run(["git", "add", "--"] + existing_targets, cwd=WEBAPP_DIR, check=True)

        subprocess.run(
            ["git", "commit", "-m", "Sync: Update Pokemon Sleep data & recipes"],
            cwd=WEBAPP_DIR,
            capture_output=True
        )

        # 安全防護：使用短暫認證 (ephemeral auth) 執行推送，絕不將 PAT 寫入本機 .git/config，且嚴禁 --force
        push_cmd = [
            "git",
            "push",
            f"https://x-access-token:{token}@github.com/{GH_USERNAME}/{GH_REPO}.git",
            "HEAD:main"
        ]
        push_res = subprocess.run(
            push_cmd,
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
