#!/usr/bin/env python3
"""
sync_data.py — Pokémon Sleep 資料同步腳本
=========================================
功能：從官方資料來源（Serebii.net / RaenonX）爬取並更新本地 JSON 資料

使用方式（本地）：
  pip install requests beautifulsoup4 lxml
  python scripts/sync_data.py

使用方式（GitHub Actions）：
  由 .github/workflows/update-data.yml 自動呼叫

環境變數：
  SYNC_TYPE  - full | pokemon_only | recipes_only（預設 full）

注意：本腳本以「驗證更新」為主，若抓取失敗會保留現有 JSON 不做修改
"""

import os
import sys
import json
import time
import logging
from pathlib import Path
from typing import Optional

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger(__name__)

# ── 路徑設定 ──────────────────────────────────────────────
REPO_ROOT    = Path(__file__).parent.parent
DATA_JSON    = REPO_ROOT / 'data.json'
RECIPES_JSON = REPO_ROOT / 'recipes.json'

# ── 資料來源 ──────────────────────────────────────────────
# 1. 寶可夢資料：Serebii.net Pokémon Sleep 頁面
SEREBII_SLEEP_BASE = 'https://www.serebii.net/pokemonsleep/pokemon/'
SEREBII_ING_BASE   = 'https://www.serebii.net/pokemonsleep/ingredients/'
SEREBII_ICON_BASE  = 'https://www.serebii.net/pokemonsleep/pokemon/icon/'

# 2. 食譜資料：RaenonX API（可從瀏覽器開發者工具找到 API endpoint）
#    或 Google Sheets 公開 CSV
RAENONX_BASE       = 'https://pks.raenonx.cc/'

# 3. Google Sheets 公開 CSV（替代方案）
#    格式：File > Share > Publish to web > CSV
GSHEETS_POKEMON_CSV = os.environ.get(
    'GSHEETS_POKEMON_CSV',
    'https://docs.google.com/spreadsheets/d/1JkV2QxGGFDBzUfDxfOhTD3hrJJzu9qCS4A6c_HicIDc/export?format=csv&gid=87785598'
)

# ── 特殊形態圖示對應表 ────────────────────────────────────
# Pokémon Sleep 遊戲內部使用非標準 ID（7xxx / 8xxx / 9xxx）
# Serebii 的圖示檔案名稱與遊戲 ID 完全不同，需要手動對應。
# 已透過 HTTP HEAD 請求驗證所有 URL 均回傳 200。
SPECIAL_ICON_MAP = {
    # 節日形態 (9xxx)
    '9001': SEREBII_ICON_BASE + '025-halloween.png',        # 皮卡丘（萬聖節）
    '9002': SEREBII_ICON_BASE + '025-holiday.png',          # 皮卡丘（佳節）
    '9003': SEREBII_ICON_BASE + '025.png',                  # 皮卡丘（船長）- 暫用一般版
    '9004': SEREBII_ICON_BASE + '133-holiday.png',          # 伊布（佳節）
    '9005': SEREBII_ICON_BASE + '133-halloween.png',        # 伊布（萬聖節）
    '9006': SEREBII_ICON_BASE + '363-holiday.png',          # 海豹球（佳節）
    # 地區形態 (7xxx)
    '7006': SEREBII_ICON_BASE + '037-alolanvulpix.png',     # 六尾（阿羅拉）
    '7007': SEREBII_ICON_BASE + '038-alolanninetales.png',  # 九尾（阿羅拉）
    '7054': SEREBII_ICON_BASE + '194-paldeanwooper.png',    # 烏波（帕底亞）
    # 特殊形態 (8xxx)
    '8001': SEREBII_ICON_BASE + '849-toxtricitylowkeyform.png',  # 顫弦蠑螈（低調）
}


def get_icon_url(pid: int, formatted_no: str) -> str:
    """依據寶可夢 ID 回傳正確的 Serebii 圖示 URL。
    特殊 ID（7xxx/8xxx/9xxx）使用 SPECIAL_ICON_MAP，
    一般 ID 則依照 formatted_no 直接拼接。
    """
    pid_str = str(pid)
    if pid_str in SPECIAL_ICON_MAP:
        return SPECIAL_ICON_MAP[pid_str]
    return SEREBII_ICON_BASE + formatted_no + '.png'


def load_json(path: Path) -> list:
    """讀取現有 JSON 檔案"""
    if not path.exists():
        log.warning(f'{path.name} 不存在')
        return []
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(path: Path, data: list):
    """儲存 JSON 檔案"""
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    log.info(f'✅ 已儲存 {path.name}（{len(data)} 筆）')


def try_import(module_name: str):
    """嘗試 import 模組，失敗則返回 None"""
    try:
        return __import__(module_name)
    except ImportError:
        return None


# ══════════════════════════════════════════════════════════
# 1. 寶可夢資料同步
# ══════════════════════════════════════════════════════════
def sync_pokemon_data() -> bool:
    """
    同步寶可夢資料。
    主要邏輯：對比現有 data.json 的 ID 清單，
    嘗試補充新增寶可夢（只新增，不覆蓋現有資料）。
    """
    requests = try_import('requests')
    if not requests:
        log.error('請先安裝 requests: pip install requests')
        return False

    current = load_json(DATA_JSON)
    existing_ids = {p.get('id') for p in current if p.get('id')}
    log.info(f'現有寶可夢數量：{len(current)}')

    # 嘗試從 Google Sheets CSV 取得最新清單
    try:
        import csv
        import io
        resp = requests.get(GSHEETS_POKEMON_CSV, timeout=30)
        resp.raise_for_status()
        reader = csv.DictReader(io.StringIO(resp.text))
        new_count = 0
        for row in reader:
            pid = row.get('id') or row.get('ID') or row.get('No.')
            if not pid:
                continue
            try:
                pid = int(pid)
            except ValueError:
                continue
            if pid in existing_ids:
                continue
            # 新增寶可夢（欄位請依照你的 Google Sheets 結構調整）
            new_entry = {
                'id':             pid,
                'formatted_no':   str(pid).zfill(4),
                'name_cn':        row.get('name_cn', row.get('中文名', '')),
                'name_en':        row.get('name_en', row.get('英文名', '')),
                'name_jp':        row.get('name_jp', ''),
                'type':           row.get('type', row.get('屬性', '')),
                'specialty':      row.get('specialty', row.get('得意', '')),
                'carry':          row.get('carry', row.get('持有', '')),
                'ingredient_rate':row.get('ingredient_rate', ''),
                'skill_rate':     row.get('skill_rate', ''),
                'interval':       row.get('interval', ''),
                'main_skill':     row.get('main_skill', ''),
                'icon_url':       get_icon_url(pid, str(pid).zfill(4) if pid < 1000 else str(pid)),
                'ingredients':    []  # 需另行補充食材資料
            }
            current.append(new_entry)
            existing_ids.add(pid)
            new_count += 1
            log.info(f'  新增寶可夢：#{pid} {new_entry["name_cn"]}')

        if new_count > 0:
            current.sort(key=lambda p: p.get('id', 9999))
            save_json(DATA_JSON, current)
            log.info(f'✅ 新增 {new_count} 隻寶可夢')
        else:
            log.info('✅ 寶可夢資料無需更新')
        return True

    except Exception as e:
        log.error(f'❌ 同步寶可夢資料失敗：{e}')
        return False


# ══════════════════════════════════════════════════════════
# 2. 食譜資料同步
# ══════════════════════════════════════════════════════════
def sync_recipes_data() -> bool:
    """
    同步食譜資料。
    主要邏輯：對比現有 recipes.json 的食譜名稱，
    嘗試從 RaenonX 或 Serebii 補充新增食譜。
    """
    requests = try_import('requests')
    if not requests:
        log.error('請先安裝 requests: pip install requests')
        return False

    current = load_json(RECIPES_JSON)
    existing_names = {r.get('name_en', '').lower() for r in current if r.get('name_en')}
    log.info(f'現有食譜數量：{len(current)}')

    # 嘗試從 RaenonX JSON API 取得食譜清單
    # 注意：raenonx.cc 的 API 端點需從 Network 面板取得最新 URL
    raenonx_api_endpoints = [
        'https://pks.raenonx.cc/api/v2/meal?lang=zh',
        'https://pks.raenonx.cc/api/meal?lang=zh',
    ]

    for endpoint in raenonx_api_endpoints:
        try:
            headers = {'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0'}
            resp = requests.get(endpoint, headers=headers, timeout=20)
            if resp.status_code != 200:
                continue
            data = resp.json()
            meals = data if isinstance(data, list) else data.get('data', data.get('meals', []))
            if not meals:
                continue
            log.info(f'從 {endpoint} 取得 {len(meals)} 道食譜')
            new_count = 0
            for meal in meals:
                name_en = (meal.get('name', {}).get('en') or meal.get('nameEn') or '').lower()
                if name_en in existing_names:
                    continue
                # 新增食譜（欄位依 API 實際結構調整）
                new_recipe = {
                    'name_cn':     meal.get('name', {}).get('zh') or meal.get('nameCn', ''),
                    'name_en':     meal.get('name', {}).get('en') or meal.get('nameEn', ''),
                    'category':    _map_category(meal.get('type', '')),
                    'bonus_pct':   meal.get('ingredientMultiplier') or meal.get('bonus', 19),
                    'pot_size':    meal.get('potCapacity') or meal.get('potSize', 15),
                    'base_energy': meal.get('basePotPower') or meal.get('baseEnergy', 0),
                    'icon':        meal.get('imageUrl') or meal.get('icon', ''),
                    'ingredients': _parse_ingredients(meal),
                }
                current.append(new_recipe)
                existing_names.add(name_en)
                new_count += 1
                log.info(f"  新增食譜：{new_recipe['name_cn']} ({new_recipe['name_en']})")

            if new_count > 0:
                save_json(RECIPES_JSON, current)
                log.info(f'✅ 新增 {new_count} 道食譜')
            else:
                log.info('✅ 食譜資料無需更新')
            return True

        except Exception as e:
            log.warning(f'  {endpoint} 失敗：{e}')
            continue

    log.warning('⚠️  無法從 RaenonX 取得食譜資料，保留現有 recipes.json')
    return False


def _map_category(api_type: str) -> str:
    """API 食譜類型 → 中文分類"""
    m = {'CURRY': '咖哩', 'SALAD': '沙拉', 'DESSERT': '甜點',
         'curry': '咖哩', 'salad': '沙拉', 'dessert': '甜點',
         '咖哩': '咖哩', '沙拉': '沙拉', '甜點': '甜點'}
    return m.get(api_type, '咖哩')


def _parse_ingredients(meal: dict) -> list:
    """解析食材列表"""
    ings = meal.get('ingredients') or meal.get('items') or []
    result = []
    for ing in ings:
        if isinstance(ing, dict):
            result.append({
                'name':  ing.get('name', {}).get('zh') or ing.get('name', '') if isinstance(ing.get('name'), dict) else ing.get('name', ''),
                'count': ing.get('count', ing.get('quantity', 1)),
                'icon':  ing.get('imageUrl') or ing.get('icon', '')
            })
    return result


# ══════════════════════════════════════════════════════════
# 主程式
# ══════════════════════════════════════════════════════════
def main():
    sync_type = os.environ.get('SYNC_TYPE', 'full').lower()
    log.info(f'=== Pokémon Sleep 資料同步 ({sync_type}) ===')

    success = True
    if sync_type in ('full', 'pokemon_only'):
        if not sync_pokemon_data():
            success = False

    if sync_type in ('full', 'recipes_only'):
        if not sync_recipes_data():
            success = False

    if success:
        log.info('=== 同步完成 ✅ ===')
    else:
        log.warning('=== 同步部分失敗，請檢查上方錯誤訊息 ===')
        sys.exit(1)


if __name__ == '__main__':
    main()
