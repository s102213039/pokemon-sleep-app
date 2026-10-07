#!/usr/bin/env python3
import os
import json
import time
from rapidocr_onnxruntime import RapidOCR

TELEGRAM_DIR = '/Users/yanli/Downloads/Telegram Lite'
GT_PATH = 'scratch/telegram_lite_parsed_perfect_109.json'

with open(GT_PATH, 'r', encoding='utf-8') as f:
    gt_list = json.load(f)

engine = RapidOCR()
results = {}

print(f'Extracting raw OCR text for {len(gt_list)} screenshots...')
t0 = time.time()
for idx, gt in enumerate(gt_list):
    photo_name = gt['photo']
    photo_path = os.path.join(TELEGRAM_DIR, photo_name)
    if not os.path.exists(photo_path):
        continue
    
    ocr_res, elapse = engine(photo_path)
    lines = [item[1] for item in ocr_res] if ocr_res else []
    results[photo_name] = lines

    if (idx + 1) % 25 == 0 or idx == len(gt_list) - 1:
        print(f'[{idx+1}/{len(gt_list)}] extracted in {time.time()-t0:.1f}s...')

with open('scratch/raw_rapidocr_109.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print('Saved raw texts to scratch/raw_rapidocr_109.json')
