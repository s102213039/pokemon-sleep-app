import urllib.request
import sys
import csv
import io
import json
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import pokemon_sleep_sync as sync

url = 'https://docs.google.com/spreadsheets/d/1JkV2QxGGFDBzUfDxfOhTD3hrJJzu9qCS4A6c_HicIDc/export?format=csv&gid=87785598'
req = urllib.request.urlopen(url)
content = req.read().decode('utf-8')
rows_ref = list(csv.reader(io.StringIO(content)))

pokemons = []

# Chinese ingredient name -> Serebii icon filename
INGREDIENT_ICON_MAP = {
    # Exact names verified from the Google Sheet missing list
    "粗枝大蔥": "largeleek",
    "品鮮蘑菇": "tastymushroom",
    "特選蛋": "fancyegg",
    "窩心洋芋": "softpotato",
    "特選蘋果": "fancyapple",
    "火辣香草": "fieryherb",
    "豆製肉": "beansausage",
    "哞哞鮮奶": "moomoomilk",
    "甜甜蜜": "honey",
    "純粹油": "pureoil",
    "溫暖生薑": "warmingginger",
    "好眠番茄": "snoozytomato",
    "放鬆可可": "soothingcacao",
    "美味尾巴": "slowpoketail",
    "萌綠大豆": "greengrasssoybeans",
    "萌綠玉米": "greengrasscorn",
    "醒腦咖啡豆": "rousingcoffee",
    "沉甸甸南瓜": "plumppumpkin",
    "嫩亮酪梨": "glossyavocado",
    # Alternate / legacy translations
    "大蔥大人": "largeleek",
    "美夢蘑菇": "tastymushroom",
    "高級蛋": "fancyegg",
    "穩心洋芋": "softpotato",
    "高級蘋果": "fancyapple",
    "辛辣香草": "fieryherb",
    "豆腸": "beansausage",
    "哞哞牛奶": "moomoomilk",
    "醇香牛奶": "moomoomilk",
    "蜂蜜": "honey",
    "香醇橄欖油": "pureoil",
    "暖暖薑": "warmingginger",
    "甜甜可可": "soothingcacao",
    "呆呆獸尾巴": "slowpoketail",
    "青草大豆": "greengrasssoybeans",
    "青草嫩玉米": "greengrasscorn",
    "提神咖啡": "rousingcoffee",
    "豐滿南瓜": "plumppumpkin",
    "潤澤酪梨": "glossyavocado",
}

def get_ing_icon(name):
    key = INGREDIENT_ICON_MAP.get(name, '')
    if key:
        return f"https://www.serebii.net/pokemonsleep/ingredients/{key}.png"
    return ""

def format_pct_fixed(val):
    if not val:
        return ""
    val_raw_str = str(val).strip()
    val_str = val_raw_str.replace('%', '').strip()
    if val_str == '--' or not val_str:
        return ""
    try:
        float_val = float(val_str)
        if '%' not in val_raw_str and float_val <= 1.0:
            float_val = float_val * 100.0
        return f"{float_val:.2f}%"
    except ValueError:
        return val

for idx, r in enumerate(rows_ref):
    if idx < 3 or not r or len(r) < 8:
        continue
    no_val = r[sync.REF_MAPPING['No.']]
    name_cn = r[sync.REF_MAPPING['寶可夢']].strip() if len(r) > sync.REF_MAPPING['寶可夢'] else ""
    if not name_cn:
        continue
    no = sync.clean_no(no_val)

    name_jp = r[3].strip() if len(r) > 3 else ""
    name_en = r[4].strip() if len(r) > 4 else ""
    sleep_type = r[6].strip() if len(r) > 6 else ""
    type_attr = r[7].strip() if len(r) > 7 else ""
    specialty = sync.clean_val(r[sync.REF_MAPPING['得意']])
    carry = sync.clean_val(r[sync.REF_MAPPING['持有']])

    ing1 = sync.clean_val(r[sync.REF_MAPPING['食材1']])
    ing1_c1 = sync.clean_val(r[sync.REF_MAPPING['1']])
    ing1_c30 = sync.clean_val(r[sync.REF_MAPPING['30_1']])
    ing1_c60 = sync.clean_val(r[sync.REF_MAPPING['60_1']])

    ing2 = sync.clean_val(r[sync.REF_MAPPING['食材2']])
    ing2_c30 = sync.clean_val(r[sync.REF_MAPPING['30_2']])
    ing2_c60 = sync.clean_val(r[sync.REF_MAPPING['60_2']])

    ing3 = sync.clean_val(r[sync.REF_MAPPING['食材3']])
    ing3_c60 = sync.clean_val(r[sync.REF_MAPPING['60_3']])

    ing_rate = format_pct_fixed(r[sync.REF_MAPPING['食材率']])
    skill_rate = format_pct_fixed(r[sync.REF_MAPPING['技能率']])

    seconds_val = r[sync.REF_MAPPING['間隔'] - 1] if len(r) > (sync.REF_MAPPING['間隔'] - 1) else ""
    interval = sync.format_interval_str(seconds_val)

    main_skill = sync.clean_val(r[sync.REF_MAPPING['主技能']])
    evo_req = sync.clean_val(r[sync.REF_MAPPING['進化需求']])
    is_final = sync.clean_val(r[sync.REF_MAPPING['最終']])

    icon_no = sync.format_no(no)
    icon_url = f"https://www.serebii.net/pokemonsleep/pokemon/icon/{icon_no}.png"

    # Build ingredients list - only include non-empty ones
    ingredients = []
    if ing1:
        ingredients.append({"name": ing1, "icon": get_ing_icon(ing1), "l1": ing1_c1, "l30": ing1_c30, "l60": ing1_c60})
    if ing2:
        ingredients.append({"name": ing2, "icon": get_ing_icon(ing2), "l30": ing2_c30, "l60": ing2_c60})
    if ing3:
        ingredients.append({"name": ing3, "icon": get_ing_icon(ing3), "l60": ing3_c60})

    entry = {
        "id": no,
        "formatted_no": sync.format_no(no),
        "name_cn": name_cn,
        "name_en": name_en,
        "name_jp": name_jp,
        "type": type_attr,
        "specialty": specialty,
        "sleep_type": sleep_type,
        "carry": carry,
        "ingredient_rate": ing_rate,
        "skill_rate": skill_rate,
        "interval": interval,
        "main_skill": main_skill,
        "evo_req": evo_req,
        "is_final": is_final,
        "icon_url": icon_url,
        "ingredients": ingredients
    }
    pokemons.append(entry)

target_dir = os.path.dirname(os.path.abspath(__file__))
out_file = os.path.join(target_dir, "data.json")

with open(out_file, "w", encoding="utf-8") as f:
    json.dump(pokemons, f, ensure_ascii=False, indent=2)

print(f"Successfully exported {len(pokemons)} pokemons to {out_file}")

# Report icon coverage
with_icon = sum(1 for p in pokemons for ing in p['ingredients'] if ing['icon'])
total = sum(len(p['ingredients']) for p in pokemons)
missing = set(ing['name'] for p in pokemons for ing in p['ingredients'] if not ing['icon'])
print(f"Ingredient icon coverage: {with_icon}/{total}")
if missing:
    print(f"Still missing icons for: {missing}")
