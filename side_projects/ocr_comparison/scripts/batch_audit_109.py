#!/usr/bin/env python3
import os
import json
import time
import re
from rapidocr_onnxruntime import RapidOCR

TELEGRAM_DIR = '/Users/yanli/Downloads/Telegram Lite'
GT_PATH = 'scratch/telegram_lite_parsed_perfect_109.json'
DB_PATH = 'scratch/z87569650_db_live.json'
PKM_DATA_PATH = 'data/data.json'

with open(GT_PATH, 'r', encoding='utf-8') as f:
    gt_list = json.load(f)

with open(DB_PATH, 'r', encoding='utf-8') as f:
    db_list = json.load(f)

with open(PKM_DATA_PATH, 'r', encoding='utf-8') as f:
    pkm_data = json.load(f)

pkm_names = [p['name_cn'] for p in pkm_data if 'name_cn' in p]

# Nature data
NATURES = [
    '認真', '坦率', '浮躁', '害羞', '頑皮',
    '孤僻', '勇敢', '固執', '怕寂寞',
    '大膽', '悠閒', '淘氣', '樂天',
    '內斂', '慢吞吞', '冷靜', '溫和',
    '溫順', '慎重', '自大', '膽小',
    '急躁', '爽朗', '天真', '馬虎'
]

# Standard subskills
SUBSKILLS = [
    '樹果數量S', '幫手獎勵', '幫忙速度M', '幫忙速度S',
    '食材機率提升M', '食材機率提升S', '持有上限提升L', '持有上限提升M', '持有上限提升S',
    '技能機率提升M', '技能機率提升S', '技能等級提升M', '技能等級提升S',
    '睡眠EXP獎勵', '研究EXP獎勵', '活力回復獎勵', '夢之碎片獎勵'
]

def parse_rapid_text(lines_text):
    full_text = '\n'.join(lines_text)
    
    # 1. Level & Name
    detected_name = None
    detected_level = None
    
    for line in lines_text:
        # Match Lv. XX Name
        lv_match = re.search(r'Lv\.?\s*(\d+)\s*([^\d\s\n]+)', line)
        if lv_match:
            detected_level = int(lv_match.group(1))
            cand_name = lv_match.group(2).strip()
            # Clean and find closest canonical pokemon
            for p_name in pkm_names:
                if p_name in cand_name or cand_name in p_name:
                    detected_name = p_name
                    break
            if not detected_name:
                detected_name = cand_name
            break

    if not detected_name:
        for p_name in pkm_names:
            if p_name in full_text:
                detected_name = p_name
                break

    if not detected_level:
        lv_match = re.search(r'Lv\.?\s*(\d+)', full_text)
        if lv_match:
            detected_level = int(lv_match.group(1))

    # 2. Main skill level
    detected_skill_level = 1
    # Look for Lv. X near main skill
    ms_lv_match = re.search(r'(?:能量填充|食材獲取|料理強化|活力療癒|幫手加速|怪力鉗|揮指|料理輔助|夢之碎片|居合斬|健美|波導彈|精神擊破)[^\n]*\s*Lv\.?\s*(\d+)', full_text)
    if ms_lv_match:
        detected_skill_level = int(ms_lv_match.group(1))
    else:
        # Check isolated Lv. X after 主技能
        lines = lines_text
        for i, l in enumerate(lines):
            if '主技能' in l:
                # check next 4 lines
                for next_l in lines[i:i+5]:
                    lv_m = re.search(r'Lv\.?\s*(\d+)', next_l)
                    if lv_m:
                        detected_skill_level = int(lv_m.group(1))
                        break
                break

    # 3. Nature
    detected_nature = None
    for line in lines_text:
        for nat in NATURES:
            if nat in line:
                detected_nature = nat
                break
        if detected_nature:
            break

    # 4. Subskills (5 slots in order of appearance)
    detected_subskills = []
    for line in lines_text:
        for sub in SUBSKILLS:
            if sub in line and sub not in detected_subskills:
                detected_subskills.append(sub)
                break
        if len(detected_subskills) == 5:
            break

    return {
        'name': detected_name,
        'level': detected_level,
        'skillLevel': detected_skill_level,
        'nature': detected_nature,
        'subskills': detected_subskills
    }

def main():
    print('Initializing RapidOCR engine...')
    engine = RapidOCR()
    print(f'Starting full audit of {len(gt_list)} screenshots in Telegram Lite...')

    start_total = time.time()
    audit_results = []
    
    total_imgs = len(gt_list)
    correct_name = 0
    correct_level = 0
    correct_skill_level = 0
    correct_nature = 0
    correct_subskills_count = 0
    total_subskills_count = 0
    perfect_count = 0

    for idx, gt in enumerate(gt_list):
        photo_name = gt['photo']
        photo_path = os.path.join(TELEGRAM_DIR, photo_name)
        if not os.path.exists(photo_path):
            print(f'[{idx+1}/{total_imgs}] Missing image: {photo_name}')
            continue

        t0 = time.time()
        ocr_res, elapse = engine(photo_path)
        t_el = (time.time() - t0) * 1000

        lines_text = [item[1] for item in ocr_res] if ocr_res else []
        parsed = parse_rapid_text(lines_text)

        # Evaluate against GT
        name_ok = (parsed['name'] == gt['name'])
        level_ok = (parsed['level'] == gt['level'])
        skill_lv_ok = (parsed['skillLevel'] == gt.get('skillLevel', 1))
        nature_ok = (parsed['nature'] == gt['nature'])
        
        gt_subs = gt.get('subskills', [])
        ocr_subs = parsed['subskills']
        
        sub_correct = sum(1 for s in gt_subs if s in ocr_subs)
        total_subskills_count += len(gt_subs)
        correct_subskills_count += sub_correct

        if name_ok: correct_name += 1
        if level_ok: correct_level += 1
        if skill_lv_ok: correct_skill_level += 1
        if nature_ok: correct_nature += 1

        is_perfect = (name_ok and level_ok and skill_lv_ok and nature_ok and sub_correct == len(gt_subs))
        if is_perfect: perfect_count += 1

        audit_results.append({
            'photo': photo_name,
            'latency_ms': round(t_el, 1),
            'gt': gt,
            'ocr': parsed,
            'checks': {
                'name': name_ok,
                'level': level_ok,
                'skillLevel': skill_lv_ok,
                'nature': nature_ok,
                'subskills_matched': f'{sub_correct}/{len(gt_subs)}',
                'is_perfect': is_perfect
            }
        })

        if (idx + 1) % 15 == 0 or idx == total_imgs - 1:
            print(f'Processed [{idx+1}/{total_imgs}] photos in {time.time()-start_total:.1f}s...')

    total_time = time.time() - start_total
    print('\n======================================================')
    print('         FULL 109 SCREENSHOTS AUDIT SUMMARY           ')
    print('======================================================')
    print(f'Total Screenshots : {total_imgs}')
    print(f'Total Time        : {total_time:.2f}s (Avg {total_time*1000/total_imgs:.1f} ms/img)')
    print(f'Name Accuracy     : {correct_name}/{total_imgs} ({correct_name*100/total_imgs:.1f}%)')
    print(f'Level Accuracy    : {correct_level}/{total_imgs} ({correct_level*100/total_imgs:.1f}%)')
    print(f'Skill Lv Accuracy : {correct_skill_level}/{total_imgs} ({correct_skill_level*100/total_imgs:.1f}%)')
    print(f'Nature Accuracy   : {correct_nature}/{total_imgs} ({correct_nature*100/total_imgs:.1f}%)')
    print(f'Subskills Recall  : {correct_subskills_count}/{total_subskills_count} ({correct_subskills_count*100/total_subskills_count:.1f}%)')
    print(f'Perfect Card Rate : {perfect_count}/{total_imgs} ({perfect_count*100/total_imgs:.1f}%)')
    print('======================================================')

    # Save to JSON
    with open('scratch/audit_109_full_ocr_results.json', 'w', encoding='utf-8') as f:
        json.dump(audit_results, f, ensure_ascii=False, indent=2)

    print('Results saved to scratch/audit_109_full_ocr_results.json')

if __name__ == '__main__':
    main()
