#!/usr/bin/env python3
import sys
import json
import time
import os
from rapidocr_onnxruntime import RapidOCR

def run_rapidocr(image_paths):
    engine = RapidOCR()
    results = {}

    for img_path in image_paths:
        if not os.path.exists(img_path):
            results[img_path] = {'error': 'File not found'}
            continue

        start = time.time()
        ocr_result, elapse = engine(img_path)
        latency = (time.time() - start) * 1000

        lines = []
        raw_text_parts = []
        if ocr_result:
            for item in ocr_result:
                box, text, score = item
                lines.append({
                    'box': box,
                    'text': text,
                    'score': float(score)
                })
                raw_text_parts.append(text)

        results[img_path] = {
            'latency_ms': round(latency, 2),
            'raw_text': '\n'.join(raw_text_parts),
            'lines_count': len(lines),
            'lines': lines
        }

    return results

if __name__ == '__main__':
    if len(sys.argv) > 1:
        # Pass JSON array of paths via arg or stdin
        input_data = sys.argv[1]
        if os.path.isfile(input_data):
            with open(input_data, 'r', encoding='utf-8') as f:
                paths = json.load(f)
        else:
            paths = json.loads(input_data)
    else:
        paths = json.load(sys.stdin)

    out = run_rapidocr(paths)
    print(json.dumps(out, ensure_ascii=False))
