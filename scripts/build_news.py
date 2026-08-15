#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pokemon Sleep News Fetcher & AI Summarizer
爬取官方繁體中文網站最新公告，並提煉 AI 智能總結與結構化要點
"""

import urllib.request
import urllib.parse
import re
import json
import os
import sys
from datetime import datetime

BASE_URL = "https://www.pokemonsleep.net"
NEWS_LIST_URL = f"{BASE_URL}/zh/news/page/"
OUTPUT_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "news.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8"
}

def fetch_url(url, timeout=12):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  [ERROR] Failed to fetch {url}: {e}", file=sys.stderr)
        return None

def clean_html_text(html_content):
    if not html_content:
        return ""
    text = re.sub(r'<br\s*/?>', '\n', html_content, flags=re.IGNORECASE)
    text = re.sub(r'</p>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</li>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'</h1>|</h2>|</h3>|</h4>', '\n\n', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&#39;', "'").replace('&#8211;', '-')
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    result = []
    prev_empty = False
    for line in lines:
        if line:
            result.append(line)
            prev_empty = False
        elif not prev_empty:
            result.append('')
            prev_empty = True
    return '\n'.join(result).strip()

def extract_news_links(max_pages=5):
    news_urls = []
    print(f"[*] Fetching news list (up to {max_pages} pages)...")
    for page in range(1, max_pages + 1):
        url = f"{NEWS_LIST_URL}{page}/" if page > 1 else f"{BASE_URL}/zh/news/"
        html = fetch_url(url)
        if not html:
            continue
        links = re.findall(r'href=\"(https://www.pokemonsleep.net/zh/news/[a-zA-Z0-9]+/)\"', html)
        for link in links:
            if link not in news_urls and link != f"{BASE_URL}/zh/news/":
                news_urls.append(link)
    print(f"  [+] Found {len(news_urls)} unique news articles.")
    return news_urls

def generate_ai_summary(category, title, clean_text):
    highlights = []
    overview = ""

    # 1. 萃取日期 / 時間
    time_matches = re.findall(r'(\d{1,2}/\d{1,2}\s*\([^)]+\)\s*\d{1,2}:\d{2}\s*～\s*\d{1,2}/\d{1,2}\s*\([^)]+\)\s*\d{1,2}:\d{2})', clean_text)
    if time_matches:
        highlights.append(f"⏰ 活動時間：{time_matches[0]}")
    else:
        date_range = re.findall(r'(\d{1,2}月\d{1,2}日[^\n～]*～[^\n]*)', clean_text)
        if date_range:
            highlights.append(f"⏰ 期間：{date_range[0]}")

    # 2. 寶可夢名單萃取
    pokemon_mentions = []
    for p in ['小鍛匠', '巧鍛匠', '巨鍛匠', '皮卡丘', '呆呆獸', '伊布', '耿鬼', '夢幻', '炎帝', '雷公', '水君', '超夢', '迷你龍', '幼基拉斯', '拉魯拉絲', '咚咚鼠', '卡比獸', '胖丁', '波克比']:
        if p in clean_text or p in title:
            pokemon_mentions.append(p)
    if pokemon_mentions:
        unique_p = list(dict.fromkeys(pokemon_mentions))
        highlights.append(f"✨ 焦點寶可夢：{'、'.join(unique_p)} 出現機率提升 / 新登場")

    # 3. 特殊效果與獎勵
    effects = []
    if '貪吃' in clean_text:
        effects.append("每日第1次點心時間必定有寶可夢處於「貪吃」狀態")
    if '睡意力量' in clean_text or '睡眠力量' in clean_text:
        m = re.search(r'睡意力量[^\n]*([1-4](?:\.\d+)?倍)', clean_text)
        if m:
            effects.append(f"睡意力量提升為 {m.group(1)}")
        else:
            effects.append("睡意力量倍率加成")
    if '睡眠EXP' in clean_text:
        effects.append("寶可夢睡眠EXP獲取量增加")
    if '糖果' in clean_text and ('2倍' in clean_text or '3倍' in clean_text or '獲得' in clean_text):
        effects.append("研究獲得糖果數量增加")
    if '主技能種子' in clean_text or '薰香' in clean_text or '限定包' in clean_text:
        effects.append("包含專屬薰香、主技能種子或超值限定培育道具")
    if '維護' in title or '維護' in category or '更新' in title:
        effects.append("伺服器維護及版本功能優化、BUG 修復與平衡調整")

    for eff in effects[:2]:
        if not any(eff in h for h in highlights):
            highlights.append(f"🎁 核心效果：{eff}")

    # 4. 生成精簡概覽 (Overview)
    # 過濾掉開頭的元數據行
    lines = [l.strip() for l in clean_text.split('\n') if len(l.strip()) > 15 and not l.strip().startswith('【') and not l.strip().startswith('・') and not l.strip().startswith('http') and 'Pokémon Sleep' not in l[:20]]
    if lines:
        overview = lines[0]
        if len(overview) > 110:
            overview = overview[:105] + "..."
    else:
        overview = f"《Pokémon Sleep》官方最新發布「{title}」，敬請各位研究者留意最新情報與調整內容。"

    if len(highlights) < 2:
        if '包' in title:
            highlights.append("🛍️ 禮包內容：提供豐富的寶可夢培育與睡眠研究支援道具")
        elif '好眠日' in title:
            highlights.append("🌕 好眠日特別加成：滿月日睡意力量大幅提升")
        else:
            highlights.append("📌 注意事項：詳情以遊戲內實際營地與公告為準")

    return {
        "overview": overview,
        "highlights": highlights[:4]
    }

def determine_badge_type(category, title):
    cat_str = f"{category} {title}".lower()
    if '活動' in cat_str or '企畫' in cat_str or '企劃' in cat_str or '好眠日' in cat_str or 'event' in cat_str:
        return 'event', '🏆 活動企劃', '#f59e0b'
    elif '更新' in cat_str or 'version' in cat_str or 'ver.' in cat_str:
        return 'update', '⚙️ 版本更新', '#3b82f6'
    elif '維護' in cat_str or 'maintenance' in cat_str:
        return 'maintenance', '🔧 維護公告', '#ef4444'
    else:
        return 'notice', '📢 重要通知', '#8b5cf6'

def parse_article(url):
    html = fetch_url(url)
    if not html:
        return None

    # 提取標題
    title_match = re.search(r'<h1[^>]*class=\"[^\"]*header_4__h1[^\"]*\"[^>]*>(.*?)</h1>', html, re.DOTALL) or \
                  re.search(r'<title>(.*?)(?:&#8211;|-|《|\s*Pokémon)', html, re.DOTALL) or \
                  re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    title = title_match.group(1).strip() if title_match else ""
    title = re.sub(r'<[^>]+>', '', title).strip().replace('&#8211;', '-')

    # 提取分類
    cat_match = re.search(r'<div class=\"header_4__category\"[^>]*>.*?<a[^>]*>(.*?)</a>', html, re.DOTALL) or \
                re.search(r'class=\"[^\"]*category[^\"]*\"[^>]*>(.*?)<', html)
    category = cat_match.group(1).strip() if cat_match else "通知"
    category = re.sub(r'<[^>]+>', '', category).strip()

    # 提取日期
    date_match = re.search(r'<time[^>]*>(\d{4}[./]\d{1,2}[./]\d{1,2})</time>', html) or \
                 re.search(r'class=\"header_4__date\"[^>]*>.*?(\d{4}[./]\d{1,2}[./]\d{1,2})', html, re.DOTALL)
    if date_match:
        raw_date = date_match.group(1).replace('.', '/').replace('-', '/')
        try:
            parts = [int(p) for p in raw_date.split('/')]
            formatted_date = f"{parts[0]:04d}-{parts[1]:02d}-{parts[2]:02d}"
        except Exception:
            formatted_date = raw_date
    else:
        formatted_date = datetime.now().strftime("%Y-%m-%d")

    # 提取內文
    article_match = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL) or \
                    re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
    raw_html = article_match.group(1) if article_match else html
    clean_text = clean_html_text(raw_html)

    # 移除標題重複
    if title and clean_text.startswith(title):
        clean_text = clean_text[len(title):].strip()

    # AI 智能總結
    ai_summary = generate_ai_summary(category, title, clean_text)
    badge_key, badge_label, badge_color = determine_badge_type(category, title)

    # 擷取文章預覽（前 320 字）
    preview = clean_text[:320].strip() + ("..." if len(clean_text) > 320 else "")

    return {
        "id": re.sub(r'[^a-zA-Z0-9]', '', url.split('/')[-2] or 'news'),
        "url": url,
        "date": formatted_date,
        "category": category,
        "badge_key": badge_key,
        "badge_label": badge_label,
        "badge_color": badge_color,
        "title": title,
        "overview": ai_summary["overview"],
        "highlights": ai_summary["highlights"],
        "content_preview": preview
    }

def main():
    print("=" * 60)
    print("  Starting Pokemon Sleep News & AI Summary Generator")
    print("=" * 60)

    urls = extract_news_links(max_pages=5)
    if not urls:
        print("  [!] No news URLs found.")
        return

    articles = []
    for idx, u in enumerate(urls, 1):
        print(f"  [{idx}/{len(urls)}] Parsing: {u}")
        data = parse_article(u)
        if data and data.get('title'):
            articles.append(data)

    # 依日期由新至舊排序
    articles.sort(key=lambda x: x.get('date', ''), reverse=True)

    print(f"\n[+] Successfully parsed and summarized {len(articles)} news items.")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f"[+] Written to {OUTPUT_FILE} ({os.path.getsize(OUTPUT_FILE)} bytes)")
    print("=" * 60)

if __name__ == '__main__':
    main()
