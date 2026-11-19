"""
Dynamic Lv.60 Ingredient Ladder Static Generator (scripts/build_ingredient_ladder.py)
====================================================================================
Pure Python stdlib generator with 100% deterministic parity to
js/modules/wiki/wiki_ladder_builder.js.

Reads data/data.json (single source of truth), computes Lv.60 Ideal Energy (0.45x)
24h daily ingredient yields across all tracks (including automatic discovery of
any 21st+ new ingredients), and idempotently writes:
  - data/ladder_lv60.json
  - js/data/ladder_data.js

Invoked automatically by scripts/sync_all.py and .github/workflows/sync.yml.
"""

import json
import math
import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_JSON_PATH = os.path.join(ROOT_DIR, 'data', 'data.json')
LADDER_JSON_PATH = os.path.join(ROOT_DIR, 'data', 'ladder_lv60.json')
LADDER_JS_PATH = os.path.join(ROOT_DIR, 'js', 'data', 'ladder_data.js')

CANONICAL_INGREDIENT_META = [
    {'id': 'apple', 'name': '特選蘋果', 'enName': 'Fancy Apple', 'energy': 90, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png'},
    {'id': 'milk', 'name': '哞哞鮮奶', 'enName': 'Moomoo Milk', 'energy': 98, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png'},
    {'id': 'soybeans', 'name': '萌綠大豆', 'enName': 'Greengrass Soybeans', 'energy': 100, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png'},
    {'id': 'honey', 'name': '甜甜蜜', 'enName': 'Honey', 'energy': 101, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/honey.png'},
    {'id': 'sausage', 'name': '豆製肉', 'enName': 'Bean Sausage', 'energy': 103, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png'},
    {'id': 'ginger', 'name': '暖暖薑', 'enName': 'Warming Ginger', 'energy': 109, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png'},
    {'id': 'tomato', 'name': '好眠番茄', 'enName': 'Snoozy Tomato', 'energy': 110, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png'},
    {'id': 'snackablenuts', 'name': '一口堅果', 'enName': 'Snackable Nuts', 'energy': 112, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/snackablenuts.png'},
    {'id': 'egg', 'name': '特選蛋', 'enName': 'Fancy Egg', 'energy': 115, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png'},
    {'id': 'oil', 'name': '純粹油', 'enName': 'Pure Oil', 'energy': 121, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png'},
    {'id': 'potato', 'name': '窩心洋芋', 'enName': 'Soft Potato', 'energy': 124, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png'},
    {'id': 'herb', 'name': '火辣香草', 'enName': 'Fiery Herb', 'energy': 130, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png'},
    {'id': 'corn', 'name': '萌綠玉米', 'enName': 'Greengrass Corn', 'energy': 140, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png'},
    {'id': 'cacao', 'name': '放鬆可可', 'enName': 'Soothing Cacao', 'energy': 151, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png'},
    {'id': 'coffee', 'name': '醒腦咖啡豆', 'enName': 'Rousing Coffee', 'energy': 153, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png'},
    {'id': 'glossyavocado', 'name': '嫩亮酪梨', 'enName': 'Glossy Avocado', 'energy': 162, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png'},
    {'id': 'mushroom', 'name': '品鮮蘑菇', 'enName': 'Tasty Mushroom', 'energy': 167, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png'},
    {'id': 'leek', 'name': '粗枝大蔥', 'enName': 'Large Leek', 'energy': 185, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png'},
    {'id': 'pumpkin', 'name': '沉甸甸南瓜', 'enName': 'Plump Pumpkin', 'energy': 250, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png'},
    {'id': 'tail', 'name': '美味尾巴', 'enName': 'Slowpoke Tail', 'energy': 342, 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png'},
]


def js_round(x):
    """Exact JavaScript Math.round() semantics (round half toward +infinity)."""
    return int(math.floor(x + 0.5))


def parse_interval_sec(raw):
    if isinstance(raw, (int, float)) and math.isfinite(raw) and raw > 0:
        return int(raw)
    if not raw:
        return 0
    parts = [p.strip() for p in str(raw).strip().split(':')]
    try:
        nums = [int(p) for p in parts]
    except ValueError:
        return 0
    if len(nums) == 3:
        return nums[0] * 3600 + nums[1] * 60 + nums[2]
    if len(nums) == 2:
        return nums[0] * 60 + nums[1]
    return nums[0] if nums else 0


def parse_ing_rate(raw):
    if raw is None or raw == '':
        return 0.0
    if isinstance(raw, (int, float)):
        if not math.isfinite(raw) or raw <= 0:
            return 0.0
        return float(raw) if raw <= 1 else float(raw) / 100.0
    s = str(raw).strip()
    try:
        num = float(s.replace('%', ''))
    except ValueError:
        return 0.0
    if not math.isfinite(num) or num <= 0:
        return 0.0
    return (num / 100.0) if ('%' in s or num > 1) else num


def normalize_icon_stem(url):
    if not url:
        return ''
    clean = str(url).split('?')[0].split('#')[0]
    parts = clean.split('/')
    return (parts[-1] if parts else '').lower()


def derive_new_ingredient_id(name, icon_url, used_ids):
    base = ''
    stem = re.sub(r'\.(png|jpg|jpeg|webp|svg)$', '', normalize_icon_stem(icon_url), flags=re.IGNORECASE)
    if stem and re.match(r'^[a-z0-9_-]+$', stem):
        base = re.sub(r'[^a-z0-9_]', '', stem)
    if not base:
        base = re.sub(r'^_+|_+$', '', re.sub(r'[^a-z0-9]+', '_', str(name or 'ingredient').lower())) or 'custom_ing'
    cand = base
    suffix = 2
    while cand in used_ids:
        cand = f'{base}_{suffix}'
        suffix += 1
    return cand


def normalize_specialty(raw):
    s = str(raw or '').strip()
    if not s:
        return '食材'
    if '全部' in s or '全能' in s or s in ('All', 'All-Rounder'):
        return '全部'
    if '樹果' in s or s in ('Berries', 'Berry'):
        return '樹果'
    if '技能' in s or s in ('Skills', 'Skill'):
        return '技能'
    if '食材' in s or s in ('Ingredients', 'Ingredient'):
        return '食材'
    return s


def is_final_evo(p):
    if not p:
        return False
    v = p.get('is_final')
    return v in ('〇', True, 'true', 'O', 1)


def _num(v):
    if v is None or v == '':
        return 0
    try:
        return float(v)
    except (ValueError, TypeError):
        return 0


def build_dynamic_ingredient_ladder(pokemon_list, final_only=True, min_final_safety_floor=2):
    meta_by_name = {}
    used_ids = set()
    ordered_tracks = []

    for m in CANONICAL_INGREDIENT_META:
        tm = dict(m)
        meta_by_name[tm['name']] = tm
        used_ids.add(tm['id'])
        ordered_tracks.append(tm)

    for p in pokemon_list:
        if not p or not isinstance(p.get('ingredients'), list):
            continue
        for ing in p['ingredients']:
            if not ing or not ing.get('name') or ing['name'] in meta_by_name:
                continue
            derived_id = derive_new_ingredient_id(ing['name'], ing.get('icon', ''), used_ids)
            en_name = re.sub(r'\b\w', lambda m: m.group(0).upper(), derived_id.replace('_', ' '))
            tm = {
                'id': derived_id,
                'name': ing['name'],
                'enName': en_name,
                'energy': 115,
                'icon': ing.get('icon', '')
            }
            meta_by_name[ing['name']] = tm
            used_ids.add(derived_id)
            ordered_tracks.append(tm)

    # Deduplicate same-ID same-icon body-size variants (e.g., Gourgeist sizes)
    # and consolidate the 8 Eeveelutions into 伊布家族（8種進化）
    eeveelution_names = {'水伊布', '雷伊布', '火伊布', '太陽伊布', '月亮伊布', '葉伊布', '冰伊布', '仙子伊布'}
    dedupe_buckets = {}
    bucket_order = []
    for raw_idx, p in enumerate(pokemon_list):
        if not p or not isinstance(p.get('ingredients'), list) or len(p['ingredients']) == 0:
            continue
        base_interval_sec = parse_interval_sec(p.get('interval') or p.get('help_interval') or p.get('frequency'))
        ing_rate = parse_ing_rate(p.get('ingredient_rate') if 'ingredient_rate' in p else p.get('ingredientRate'))
        if base_interval_sec <= 0 or ing_rate <= 0:
            continue

        icon_stem = normalize_icon_stem(p.get('icon_url') or p.get('icon') or '')
        fin = is_final_evo(p)
        raw_cn = p.get('name_cn') or p.get('name') or ''
        is_eevee_fam = fin and raw_cn in eeveelution_names
        key = 'eevee_family_8' if is_eevee_fam else f"{p.get('id', raw_idx)}|{icon_stem}|{'1' if fin else '0'}"

        effective_sec = max(600, js_round(base_interval_sec * 0.882))
        ideal_sec = effective_sec * 0.45
        ing_helps_per_day = (86400.0 / ideal_sec) * ing_rate

        if key not in dedupe_buckets:
            dedupe_buckets[key] = []
            bucket_order.append(key)
        dedupe_buckets[key].append({
            'p': p,
            'raw_idx': raw_idx,
            'is_final': fin,
            'ing_helps_per_day': ing_helps_per_day,
            'is_eevee_fam': is_eevee_fam
        })

    selected_pokemon = []
    for key in bucket_order:
        group = dedupe_buckets[key]
        if key == 'eevee_family_8' and len(group) > 1:
            group.sort(key=lambda x: (-x['ing_helps_per_day'], x['raw_idx']))
            selected_pokemon.append({
                **group[0],
                'display_name': '伊布家族（8種進化）',
                'display_name_en': 'Eevee Evolutions (8 Forms)',
                'override_icon': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133.png',
                'override_num_id': 133,
                'note_suffix': ' (8種進化產量皆相同)'
            })
            continue
        if len(group) == 1:
            g0 = group[0]
            selected_pokemon.append({
                **g0,
                'display_name': g0['p'].get('name_cn') or g0['p'].get('name') or '',
                'display_name_en': g0['p'].get('name_en') or ''
            })
            continue
        group.sort(key=lambda x: (-x['ing_helps_per_day'], x['raw_idx']))
        best = group[0]
        raw_name = best['p'].get('name_cn') or best['p'].get('name') or ''
        base_cn = re.sub(r'\s*[（\(][^）\)]+[）\)]\s*$', '', raw_name).strip()
        all_same_base = bool(base_cn) and all(
            re.sub(r'\s*[（\(][^）\)]+[）\)]\s*$', '', (g['p'].get('name_cn') or g['p'].get('name') or '')).strip() == base_cn
            for g in group
        )
        raw_en = best['p'].get('name_en') or ''
        base_en = re.sub(r'\s*\([^)]+\)\s*$', '', raw_en).strip()
        selected_pokemon.append({
            **best,
            'display_name': base_cn if all_same_base else raw_name,
            'display_name_en': (base_en if (all_same_base and base_en) else raw_en)
        })

    track_entries_map = {t['name']: [] for t in ordered_tracks}

    for item in selected_pokemon:
        p = item['p']
        ing_helps_per_day = item['ing_helps_per_day']
        ings = p['ingredients']
        ing_a = ings[0] if len(ings) > 0 else None
        ing_b = ings[1] if len(ings) > 1 else None
        ing_c = ings[2] if len(ings) > 2 else None
        spec = normalize_specialty(p.get('specialty'))
        formatted_no = p.get('formatted_no') or ''
        icon_url = item.get('override_icon') or p.get('icon_url') or p.get('icon') or (
            f'https://www.serebii.net/pokemonsleep/pokemon/icon/{formatted_no}.png' if formatted_no else ''
        )
        if 'override_num_id' in item:
            num_id = item['override_num_id']
        else:
            try:
                num_id = int(str(p.get('id') or '99999'))
            except ValueError:
                num_id = 99999
        note_suffix = item.get('note_suffix', '')

        def push_entry(ing_name, raw_variants):
            if ing_name not in track_entries_map:
                return
            kept = []
            seen_counts = set()
            for v in raw_variants:
                if not v or v['count'] <= 0:
                    continue
                if v['count'] in seen_counts:
                    continue
                seen_counts.add(v['count'])
                if note_suffix:
                    v = {**v, 'note': v['note'] + note_suffix}
                kept.append(v)
            if not kept:
                return
            kept.sort(key=lambda x: -x['count'])
            top_var = kept[0]
            track_entries_map[ing_name].append({
                'name': item['display_name'],
                'name_en': item['display_name_en'],
                '_num_id': num_id,
                'isFinal': item['is_final'],
                'specialty': spec,
                'icon': icon_url,
                'recipe': top_var['recipe'],
                'count': top_var['count'],
                'note': top_var['note'],
                'variants': kept
            })

        if ing_a and ing_a.get('name'):
            l1 = _num(ing_a.get('l1'))
            l30 = _num(ing_a.get('l30'))
            l60 = _num(ing_a.get('l60'))
            aname = ing_a['name']
            push_entry(aname, [
                {'recipe': 'AAA', 'count': js_round(ing_helps_per_day * (l1 + l30 + l60) / 3.0), 'note': f'AAA {aname} 純種產出'},
                {'recipe': 'ABA', 'count': js_round(ing_helps_per_day * (l1 + l60) / 3.0), 'note': f'ABA 雙{aname} 產出'},
                {'recipe': 'AAX', 'count': js_round(ing_helps_per_day * (l1 + l30) / 3.0), 'note': f'AAX 雙{aname} 產出', 'origRecipes': ['AAB', 'AAC']},
                {'recipe': 'ABX', 'count': js_round(ing_helps_per_day * l1 / 3.0), 'note': f'ABX 單{aname} 混產', 'origRecipes': ['ABB', 'ABC']},
            ])

        if ing_b and ing_b.get('name') and (not ing_a or ing_b['name'] != ing_a.get('name')):
            l30 = _num(ing_b.get('l30'))
            l60 = _num(ing_b.get('l60'))
            bname = ing_b['name']
            push_entry(bname, [
                {'recipe': 'ABB', 'count': js_round(ing_helps_per_day * (l30 + l60) / 3.0), 'note': f'ABB {bname} 主力產出'},
                {'recipe': 'AAB', 'count': js_round(ing_helps_per_day * l60 / 3.0), 'note': f'AAB {bname} 後期主力'},
                {'recipe': 'ABX', 'count': js_round(ing_helps_per_day * l30 / 3.0), 'note': f'ABX {bname} 兼顧', 'origRecipes': ['ABA', 'ABC']},
            ])

        if ing_c and ing_c.get('name') and (not ing_a or ing_c['name'] != ing_a.get('name')) and (not ing_b or ing_c['name'] != ing_b.get('name')):
            l60 = _num(ing_c.get('l60'))
            cname = ing_c['name']
            push_entry(cname, [
                {'recipe': 'XXC', 'count': js_round(ing_helps_per_day * l60 / 3.0), 'note': f'XXC 單{cname} 補足', 'origRecipes': ['AAC', 'ABC']},
            ])

    ordered_tracks.sort(key=lambda t: (1 if t['id'] == 'tail' else 0, t['energy']))

    result = []
    for meta in ordered_tracks:
        all_entries = track_entries_map.get(meta['name'], [])
        if final_only:
            finals = [e for e in all_entries if e['isFinal']]
            chosen = finals if len(finals) >= min_final_safety_floor else list(all_entries)
        else:
            chosen = list(all_entries)

        chosen.sort(key=lambda e: (-e['count'], -(1 if e['isFinal'] else 0), e['_num_id']))
        max_count = chosen[0]['count'] if chosen else 0

        clean_pokemon = []
        for entry in chosen:
            is_top = max_count > 0 and entry['count'] == max_count
            clean_variants = []
            for v_idx, v in enumerate(entry['variants']):
                out_v = {'recipe': v['recipe'], 'count': v['count'], 'note': v['note']}
                if is_top and v_idx == 0:
                    out_v['isTop'] = True
                if 'origRecipes' in v:
                    out_v['origRecipes'] = list(v['origRecipes'])
                clean_variants.append(out_v)
            out_entry = {
                'name': entry['name'],
                'specialty': entry['specialty'],
                'icon': entry['icon'],
                'recipe': entry['recipe'],
                'count': entry['count'],
                'note': entry['note'],
                'isTop': is_top,
                'isFinal': entry['isFinal'],
                'variants': clean_variants
            }
            if entry.get('name_en'):
                out_entry['name_en'] = entry['name_en']
            clean_pokemon.append(out_entry)

        track_obj = {
            'id': meta['id'],
            'name': meta['name'],
            'enName': meta['enName'],
            'energy': meta['energy'],
            'icon': meta['icon'],
            'pokemon': clean_pokemon
        }
        if meta['id'] == 'tail':
            track_obj['isSpecialScale'] = True
        result.append(track_obj)

    return result


def write_if_changed(filepath, content):
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            if f.read() == content:
                return False
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True


def regenerate_ladder_files():
    with open(DATA_JSON_PATH, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    pokemon_list = raw_data if isinstance(raw_data, list) else raw_data.get('pokemon', [])
    tracks = build_dynamic_ingredient_ladder(pokemon_list, final_only=True, min_final_safety_floor=2)

    json_str = json.dumps(tracks, ensure_ascii=False, indent=2)
    json_changed = write_if_changed(LADDER_JSON_PATH, json_str + '\n')

    js_header = (
        "/**\n"
        " * js/data/ladder_data.js - Pokémon Sleep Lv.60 Ingredient Ladder Master Data\n"
        " * Auto-generated from data/data.json (Lv.60 Ideal Energy 0.45x unified baseline).\n"
        " */\n\n"
        "(function (global) {\n"
        "  'use strict';\n\n"
        "  const LV60_COORDINATE_LADDER_DATA = "
    )
    js_footer = (
        ";\n"
        "  // 舊版清單資料\n\n"
        "  if (typeof module !== 'undefined' && module.exports) {\n"
        "    module.exports = LV60_COORDINATE_LADDER_DATA;\n"
        "  }\n"
        "  if (typeof global !== 'undefined') {\n"
        "    global.LV60_COORDINATE_LADDER_DATA = LV60_COORDINATE_LADDER_DATA;\n"
        "  }\n"
        "})(typeof window !== 'undefined' ? window : this);\n"
    )
    js_changed = write_if_changed(LADDER_JS_PATH, js_header + json_str + js_footer)

    total_entries = sum(len(t['pokemon']) for t in tracks)
    print(
        f"[build_ingredient_ladder] {len(tracks)} tracks, {total_entries} Pokemon entries "
        f"(json_updated={json_changed}, js_updated={js_changed})"
    )
    return tracks


if __name__ == '__main__':
    regenerate_ladder_files()
