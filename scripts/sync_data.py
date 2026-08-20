#!/usr/bin/env python3
"""
sync_data.py — Pokémon Sleep 資料同步腳本
=========================================
功能：從官方資料來源（Serebii.net / RaenonX / Google Sheets）爬取並更新本地 JSON 資料，
      並可選擇性將最新資料寫回用戶的 Google Sheets。

使用方式（本地）：
  pip install requests beautifulsoup4 lxml
  python scripts/sync_data.py

使用方式（GitHub Actions）：
  由 .github/workflows/update-data.yml 自動呼叫

環境變數：
  SYNC_TYPE  - full | pokemon_only | recipes_only（預設 full）
  GCP_SA_KEY - (選填) Google Service Account JSON 字串，用於寫入用戶 Google Sheet
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
DATA_JSON    = REPO_ROOT / 'data' / 'data.json'
RECIPES_JSON = REPO_ROOT / 'data' / 'recipes.json'

# ── 資料來源 ──────────────────────────────────────────────
SEREBII_SLEEP_BASE = 'https://www.serebii.net/pokemonsleep/pokemon/'
SEREBII_ING_BASE   = 'https://www.serebii.net/pokemonsleep/ingredients/'
SEREBII_ICON_BASE  = 'https://www.serebii.net/pokemonsleep/pokemon/icon/'

RAENONX_BASE       = 'https://pks.raenonx.cc/'

# 來源 Google Sheet CSV
GSHEETS_POKEMON_CSV = os.environ.get(
    'GSHEETS_POKEMON_CSV',
    'https://docs.google.com/spreadsheets/d/1JkV2QxGGFDBzUfDxfOhTD3hrJJzu9qCS4A6c_HicIDc/export?format=csv&gid=87785598'
)

# 用戶目標 Google Sheet ID (如果設定了 GCP_SA_KEY，同步時會順便寫回此 Sheet)
TARGET_USER_GSHEET_ID = os.environ.get(
    'TARGET_USER_GSHEET_ID',
    '1BD05wG8Gy3EUNzhg5mtErllr-Rkv20iFGsZ8kNsuUJ0'
)

# ── 特殊形態圖示對應表 ────────────────────────────────────
# Pokémon Sleep 遊戲內部使用非標準 ID（7xxx / 8xxx / 9xxx）
# Serebii 的圖示檔案名稱與遊戲 ID 完全不同，需要手動對應驗證。
# 若無對應圖示（如官方尚未發布），則不提供假圖片，一律回傳空字串以隱藏。
SPECIAL_ICON_MAP = {
    # 節日形態 (9xxx)
    '9001': SEREBII_ICON_BASE + '025-halloween.png',        # 皮卡丘（萬聖節）
    '9002': SEREBII_ICON_BASE + '025-holiday.png',          # 皮卡丘（佳節）
    # '9003': 船長皮卡丘 Serebii 目前無專屬圖示，故回傳空字串不顯示
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
    特殊 ID（7xxx/8xxx/9xxx）需存在於 SPECIAL_ICON_MAP 方可回傳網址，
    若未在對應表中（尚未找到正確認可圖片），則回傳空字串 `""` 以避免顯示錯誤圖片。
    一般 ID (<1000) 則依照 formatted_no 直接拼接。
    """
    pid_str = str(pid)
    if pid_str in SPECIAL_ICON_MAP:
        return SPECIAL_ICON_MAP[pid_str]
    if pid >= 1000:
        return ''
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


def sync_to_user_google_sheet(data: list) -> bool:
    """
    若設定了 GCP_SA_KEY (Google Service Account JSON Key)，
    可將最新寶可夢資料同步寫回用戶的 Google Sheet
    """
    sa_json = os.environ.get('GCP_SA_KEY') or os.environ.get('GSHEETS_SERVICE_ACCOUNT_JSON')
    if not sa_json:
        log.info('💡 未設定 GCP_SA_KEY，跳過寫入用戶 Google Sheet。')
        log.info('   (若需寫回你的 Google Sheet，可在 GitHub Secrets 設定 GCP_SA_KEY)')
        return True

    try:
        gspread = try_import('gspread')
        if not gspread:
            log.warning('⚠️ 需要安裝 gspread 以寫入 Google Sheet: pip install gspread google-auth')
            return False
        
        from google.oauth2.service_account import Credentials
        creds_dict = json.loads(sa_json)
        scopes = ['https://www.googleapis.com/auth/spreadsheets']
        creds = Credentials.from_service_account_info(creds_dict, scopes=scopes)
        client = gspread.authorize(creds)
        
        sheet = client.open_by_key(TARGET_USER_GSHEET_ID).sheet1
        
        headers = ['id', 'formatted_no', 'name_cn', 'name_en', 'type', 'specialty', 'carry', 'ingredient_rate', 'skill_rate', 'interval', 'main_skill', 'icon_url']
        rows = [headers]
        for item in data:
            rows.append([str(item.get(k, '')) for k in headers])
            
        sheet.clear()
        sheet.update('A1', rows)
        log.info(f'✅ 已成功將最新資料寫回至 Google Sheet ({TARGET_USER_GSHEET_ID})')
        return True
    except Exception as e:
        log.error(f'❌ 寫入 Google Sheet 失敗: {e}')
        return False


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
            # 新增寶可夢
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
            
        # 同步更新至用戶的 Google Sheet (如果有設定 GCP_SA_KEY)
        sync_to_user_google_sheet(current)
        return True

    except Exception as e:
        log.error(f'❌ 同步寶可夢資料失敗：{e}')
        return False


# ══════════════════════════════════════════════════════════
# 2. 食譜資料同步
# ══════════════════════════════════════════════════════════
ING_MAP = {
    'fancyapple': {'name': '特選蘋果', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png'},
    'moomoomilk': {'name': '哞哞鮮奶', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png'},
    'greengrasssoybeans': {'name': '萌綠大豆', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png'},
    'honey': {'name': '甜甜蜜', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/honey.png'},
    'beansausage': {'name': '豆製肉', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png'},
    'warmingginger': {'name': '暖暖薑', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png'},
    'snoozytomato': {'name': '好眠番茄', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png'},
    'fancyegg': {'name': '特選蛋', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png'},
    'pureoil': {'name': '純粹油', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png'},
    'softpotato': {'name': '窩心洋芋', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png'},
    'fieryherb': {'name': '火辣香草', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png'},
    'soothingcacao': {'name': '放鬆可可', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png'},
    'tastymushroom': {'name': '品鮮蘑菇', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png'},
    'largeleek': {'name': '粗枝大蔥', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png'},
    'slowpoketail': {'name': '美味尾巴', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png'},
    'greengrasscorn': {'name': '萌綠玉米', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png'},
    'rousingcoffee': {'name': '醒腦咖啡豆', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png'},
    'glossyavocado': {'name': '嫩亮酪梨', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png'},
    'plumppumpkin': {'name': '沉甸甸南瓜', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png'}
}

NAME_CN_MAP = {
    'fancy apple curry': '特選蘋果咖哩',
    'grilled tail curry': '炙烤尾巴咖哩',
    'solar power tomato curry': '太陽之力番茄咖哩',
    'dream eater butter curry': '絕對睡眠奶油咖哩',
    'spicy leek curry': '辣味蔥勁十足咖哩',
    'spore mushroom curry': '蘑菇孢子咖哩',
    'egg bomb curry': '親子愛咖哩',
    'hearty cheeseburger curry': '健美起司堡咖哩',
    'soft potato chowder': '馬鈴薯蘑菇濃湯',
    'simple chowder': '樸實馬鈴薯濃湯',
    'beanburger curry': '豆腸咖哩堡',
    'mild honey curry': '溫和蜂蜜咖哩',
    'ninja curry': '忍者咖哩',
    'drought katsu curry': '酥脆炸豬排咖哩',
    'melty omelette curry': '熔岩蛋包咖哩',
    'bulk up bean curry': '吃飽飽起司肉醬咖哩',
    'limber corn stew': '柔嫩玉米濃湯',
    'inferno corn keema curry': '煉獄玉米乾咖哩',
    'dizzy punch spicy curry': '迷昏香味咖哩',
    'hidden power perk-up stew': '覺醒力量醒腦燉湯',
    'cut sukiyaki curry': '一字斬壽喜燒咖哩',
    'role play pumpkaboo stew': '扮演南瓜濃湯',
    'overgrow avocado gratin': '茂盛焗烤酪梨',
    'greengrass curry bun': '萌綠咖哩麵包',
    'bounce curry udon': '彈跳咖哩烏龍麵',
    'slowpoke tail pepper salad': '呆呆獸尾巴的胡椒沙拉',
    'spore mushroom salad': '蘑菇孢子沙拉',
    'snow cloak caesar salad': '雪隱凱薩沙拉',
    'gluttony potato salad': '貪吃鬼洋芋沙拉',
    'water veil tofu salad': '水幕豆腐沙拉',
    'superpower extreme salad': '超能力極限沙拉',
    'bean ham salad': '豆火腿沙拉',
    'snoozy tomato salad': '好眠番茄沙拉',
    'moomoo caprese salad': '莫札瑞拉起司沙拉',
    'contrary chocolate meat salad': '唱反調可可肉沙拉',
    'overheat ginger salad': '過熱沙拉',
    'fancy apple salad': '特選蘋果沙拉',
    'immunity leek salad': '免疫大蔥沙拉',
    'dazzling apple cheese salad': '蘋果起司沙拉',
    'ninja salad': '忍者沙拉',
    'heat wave tofu salad': '熱風豆腐沙拉',
    'greengrass salad': '萌綠沙拉',
    'calm mind fruit salad': '冥想香甜沙拉',
    'fury attack corn salad': '亂擊玉米沙拉',
    'cross chop salad': '十字切碎丁沙拉',
    'defiant coffee-dressed salad': '不服輸咖啡風味沙拉',
    'petal blizzard layered salad': '落英繽紛含羞草蛋沙拉',
    'apple acid yogurt-dressed salad': '蘋果酸優格風味沙拉',
    'luscious avocado salad': '碎裂酪梨沙拉',
    'bulldoze guacamole and chips': '重踏酪梨醬薯片',
    'scald chunky salad': '熱水溫沙拉',
    'fluffy sweet potatoes': '軟綿烤地瓜',
    'steadfast ginger cookies': '不屈生薑餅乾',
    'fancy apple juice': '特選蘋果汁',
    'craft soda pop': '手作勁爽汽水',
    'ember ginger tea': '火花生薑茶',
    "jigglypuff's fruity flan": '胖丁水果布丁',
    'lovelykisssmoothie': '迷人果昔',
    'lovely kiss smoothie': '迷人果昔',
    'lucky chant apple pie': '幸運祈願蘋果派',
    "neroli's restorative tea": '奈羅利恢復茶',
    'sweet scent chocolate cake': '甜香可可蛋糕',
    'warm moomoo milk': '溫熱哞哞鮮奶',
    'cloud nine soy cake': '無關天氣大豆蛋糕',
    'hustle protein smoothie': '活力蛋白質果昔',
    'stalwart vegetable juice': '堅毅蔬菜汁',
    'big malasada': '馬拉薩達',
    'huge power soy donuts': '大力士大豆甜甜圈',
    'explosion popcorn': '大爆炸爆米花',
    'teatime corn scones': '午茶玉米司康',
    'petal dance chocolate tart': '花瓣舞可可塔',
    'flower gift macarons': '花之禮馬卡龍',
    'early bird coffee jelly': '早起咖啡凍',
    'zing zap spiced cola': '麻麻刺刺香料可樂',
    'mold breaker corn tiramisu': '破格玉米提拉米蘇',
    'clodsire eclair': '土王閃電泡芙',
    'scary face pancakes': '心跳加速鬼面鬆餅',
    'leaf tornado smoothie': '青草攪拌器果昔',
    'honey gather chocolate waffles': '採蜜可可鬆餅'
}

def _get_bonus_pct(pot_size: int) -> int:
    if pot_size <= 10:
        return 19
    elif pot_size <= 15:
        return 20
    elif pot_size <= 20:
        return 21
    elif pot_size <= 30:
        return 25
    elif pot_size <= 45:
        return 35
    elif pot_size <= 60:
        return 48
    elif pot_size <= 75:
        return 61
    else:
        return 78

def sync_recipes_data() -> bool:
    """
    從 Serebii 官方食譜頁面爬取並更新 recipes.json，確保食材配方與能量 100% 正確。
    """
    import urllib.request
    import re

    log.info('正在從 Serebii.net 同步官方食譜資料庫...')
    url = 'https://www.serebii.net/pokemonsleep/dishes.shtml'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', errors='ignore')

        curry_part = html[html.find('<h2>List of Curry</h2>'):html.find('<h2>List of Salads</h2>')]
        salad_part = html[html.find('<h2>List of Salads</h2>'):html.find('<h2>List of Desserts</h2>')]
        dessert_part = html[html.find('<h2>List of Desserts</h2>'):]

        categories = [('咖哩', curry_part), ('沙拉', salad_part), ('甜點', dessert_part)]
        all_dishes = []

        for cat_name, part in categories:
            rows = re.findall(
                r'<tr>\s*<td class=\"cen\"><a href=\"(/pokemonsleep/dishes/[^\"]+)\"><img src=\"([^\"]+)\"[^>]*>(?:</a>)?\s*</td>\s*<td class=\"fooinfo\"><a href=\"[^\"]+\"><u>([^<]+)</u></a></td>\s*<td class=\"fooinfo\">([^<]*)</td>\s*<td class=\"fooinfo\">(.*?)</td>\s*</tr>',
                part,
                re.DOTALL
            )
            for link, icon, name_en, desc, ings_html in rows:
                if 'mixed' in link:
                    continue
                name_en_clean = name_en.strip()
                norm_key = name_en_clean.lower()
                name_cn = NAME_CN_MAP.get(norm_key, name_en_clean)

                ings = []
                ing_matches = re.findall(r'/pokemonsleep/ingredients/([a-z0-9_]+)\.shtml[^>]*>[^<]+</a>\s*\*\s*(\d+)', ings_html)
                for ing_slug, count_str in ing_matches:
                    count = int(count_str)
                    info = ING_MAP.get(ing_slug, {'name': ing_slug, 'icon': f'https://www.serebii.net/pokemonsleep/ingredients/{ing_slug}.png'})
                    ings.append({'name': info['name'], 'count': count, 'icon': info['icon']})

                pot_size = sum(i['count'] for i in ings)
                bonus_pct = _get_bonus_pct(pot_size)

                # Fetch base energy
                detail_url = 'https://www.serebii.net' + link
                base_energy = 0
                try:
                    dreq = urllib.request.Request(detail_url, headers={'User-Agent': 'Mozilla/5.0'})
                    dhtml = urllib.request.urlopen(dreq, timeout=10).read().decode('utf-8', errors='ignore')
                    m = re.search(r'<td class=\"fooinfo\">\s*Level 1\s*</td>\s*<td class=\"fooinfo\">\s*0\s*</td>\s*<td class=\"fooinfo\">\s*([0-9,]+)\s*</td>', dhtml)
                    if m:
                        base_energy = int(m.group(1).replace(',', ''))
                    else:
                        m2 = re.search(r'Separate Base Power\s*</td>\s*<td class=\"fooinfo\"[^>]*>\s*([0-9,]+)\s*</td>', dhtml)
                        if m2:
                            base_energy = int(m2.group(1).replace(',', ''))
                except Exception as e:
                    log.warning(f'無法獲取 {name_en_clean} 的基礎能量: {e}')

                icon_url = 'https://www.serebii.net' + icon if not icon.startswith('http') else icon

                all_dishes.append({
                    'name_cn': name_cn,
                    'name_en': name_en_clean,
                    'category': cat_name,
                    'pot_size': pot_size,
                    'base_energy': base_energy,
                    'bonus_pct': bonus_pct,
                    'icon': icon_url,
                    'ingredients': ings
                })

        if len(all_dishes) > 0:
            save_json(RECIPES_JSON, all_dishes)
            log.info(f'✅ 成功同步 {len(all_dishes)} 道食譜至 recipes.json')
            return True
        else:
            log.error('❌ 未獲取到任何食譜')
            return False

    except Exception as e:
        log.error(f'❌ 同步食譜資料失敗：{e}')
        return False


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

    if sync_type in ('full', 'news_only'):
        try:
            import build_news
            log.info('--- 開始同步官方新聞與更新 ---')
            build_news.main()
            log.info('✅ 官方新聞與更新同步完成')
        except Exception as e:
            log.error(f'❌ 同步官方新聞失敗：{e}')

    if success:
        log.info('=== 同步完成 ✅ ===')
    else:
        log.warning('=== 同步部分失敗，請檢查上方錯誤訊息 ===')
        sys.exit(1)


if __name__ == '__main__':
    main()
