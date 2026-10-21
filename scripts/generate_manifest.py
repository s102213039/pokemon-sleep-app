"""
Pokemon Sleep Data Version Manifest Generator (generate_manifest.py)
--------------------------------------------------------------------
Scans all JSON data files in data/ and computes deterministic SHA-256
content hashes, byte sizes, and record counts into data/manifest.json.
Used by frontend DataCacheManager to determine whether local cached data
is already up-to-date without downloading full JSON payloads.
"""

import os
import json
import hashlib
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DATA_DIR = os.path.join(ROOT_DIR, 'data')
MANIFEST_PATH = os.path.join(DATA_DIR, 'manifest.json')

TARGET_FILES = [
    'data.json',
    'recipes.json',
    'news.json',
    'sleep_styles.json',
    'items.json',
    'special_icons.json',
    'ladder_lv60.json'
]


def compute_file_entry(filepath):
    with open(filepath, 'rb') as f:
        raw_bytes = f.read()
    sha256_hash = hashlib.sha256(raw_bytes).hexdigest()[:16]
    size = len(raw_bytes)
    count = 0
    try:
        parsed = json.loads(raw_bytes.decode('utf-8'))
        if isinstance(parsed, list):
            count = len(parsed)
        elif isinstance(parsed, dict):
            if 'byName' in parsed and isinstance(parsed['byName'], dict):
                count = len(parsed['byName'])
            else:
                count = len(parsed)
    except Exception:
        count = 0

    return {
        'hash': sha256_hash,
        'size': size,
        'count': count
    }


def generate_manifest():
    files_meta = {}
    combined_hashes = []

    for filename in TARGET_FILES:
        fpath = os.path.join(DATA_DIR, filename)
        if os.path.exists(fpath):
            entry = compute_file_entry(fpath)
            files_meta[filename] = entry
            combined_hashes.append(f"{filename}:{entry['hash']}")

    overall_hash = hashlib.sha256('|'.join(combined_hashes).encode('utf-8')).hexdigest()[:16]

    existing_manifest = None
    if os.path.exists(MANIFEST_PATH):
        try:
            with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
                existing_manifest = json.load(f)
        except Exception:
            existing_manifest = None

    if existing_manifest and existing_manifest.get('manifestHash') == overall_hash:
        updated_at = existing_manifest.get('updatedAt', datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'))
    else:
        updated_at = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

    manifest = {
        'version': 1,
        'manifestHash': overall_hash,
        'updatedAt': updated_at,
        'files': files_meta
    }

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write('\n')

    print(f"[Manifest] Generated {MANIFEST_PATH} (hash={overall_hash}, files={len(files_meta)})")
    return manifest


if __name__ == '__main__':
    generate_manifest()
