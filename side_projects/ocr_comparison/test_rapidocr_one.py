from rapidocr_onnxruntime import RapidOCR
import time

sample_path = '/Users/yanli/Downloads/Telegram Lite/photo_100_2026-09-30_19-52-23.jpg'
print('Testing RapidOCR (Umi-OCR engine) on:', sample_path)

start = time.time()
engine = RapidOCR()
result, elapse = engine(sample_path)
total_time = (time.time() - start) * 1000

print(f'RapidOCR completed in {total_time:.1f} ms (OCR core elapsed: {elapse})')
print('Recognized lines count:', len(result) if result else 0)
print('Text output preview:')
if result:
    for item in result[:25]:
        box, text, score = item
        print(f'[{score:.2f}] {text}')
