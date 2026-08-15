#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pokemon Sleep Deep News Fetcher & AI Comprehensive Summarizer
爬取官方繁體中文網站最新公告，並深度提煉：
- 舉辦時間 / 銷售時間 / 維護時間
- 料理倍率 (1.25x/1.5x/2.5x/3.75x)、睡意之力、睡眠EXP等全方位倍率
- 機率提升寶可夢（大幅 / 中幅 / 小幅）
- 各島嶼/營地專屬出現寶可夢列表
- 商城禮包與道具點數包完整內容、售價與限購
- 版本更新、新功能與寶可夢主技能平衡調整
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

def deep_ai_extract_sections(category, title, clean_text):
    """
    深度 AI 結構化萃取引擎：
    從官方文章解析各個專業維度
    """
    sections = []
    text_blocks = clean_text.split('\n')

    # 1. ⏰ 時間期程與營地 (Schedule & Camps)
    schedule_items = []
    # 舉辦期間 / 任務期間 / 銷售期間 / 發放期間 / 開始出現的時間
    periods = re.findall(r'((?:舉辦期間|任務期間|銷售期間|發放期間|維護期間|實施時間|測量時間|開始出現的時間)[：:\s]*[^\n]+(?:\n[・\-\s]*\d{1,2}/\d{1,2}[^\n]+)*)', clean_text)
    for p in periods:
        p_clean = ' '.join(p.split())
        p_clean = re.sub(r'^[【\s]*', '', p_clean)
        p_clean = re.sub(r'[】\s]*・\s*', '：', p_clean)
        if len(p_clean) > 5 and not any(p_clean in s for s in schedule_items):
            schedule_items.append(p_clean)

    camps_match = re.search(r'【?\s*活動營地\s*】?[：:\s]*([^\n]+)', clean_text) or re.search(r'出現的營地\s*([^\n]+)', clean_text)
    if camps_match:
        camps_str = camps_match.group(1).strip()
        if not any(camps_str in s for s in schedule_items):
            schedule_items.append(f"【適用營地】{camps_str}")

    if schedule_items:
        sections.append({
            "key": "schedule",
            "title": "⏰ 活動時間與營地",
            "icon": "⏰",
            "items": schedule_items[:4]
        })

    # 1.5 🦄 新登場寶可夢專屬資訊 (New Debut Pokemon)
    debut_match = re.search(r'能新遇見的寶可夢\s*(.*?)(?:敬請期待|注意事項|$)', clean_text, re.DOTALL)
    if debut_match:
        debut_block = debut_match.group(1)
        debut_pokes = [re.sub(r'^[・\-\*]\s*', '', l).strip() for l in debut_block.split('\n') if l.strip() and not l.strip().startswith('※') and not l.strip().startswith('能新遇見')]
        sleep_types = re.findall(r'([^：:\n]+[：:](?:安然入睡|深灰入睡|半夢半醒|淺灰入睡)[^\n]*)', clean_text)
        debut_items = []
        if debut_pokes:
            debut_items.append(f"✨ 登場寶可夢：{'、'.join(debut_pokes[:6])}")
        if sleep_types:
            debut_items.append(f"💤 睡眠類型：{' · '.join(sleep_types[:4])}")
        if debut_items:
            sections.append({
                "key": "debut",
                "title": "🦄 新登場寶可夢情報",
                "icon": "🦄",
                "items": debut_items
            })

    # 2. ⚡ 核心獎勵與倍率加成 (Bonus & Multipliers)
    bonus_items = []
    # 料理倍率
    food_matches = re.findall(r'([^\n]*料理[^\n]*倍[^\n]*)', clean_text)
    for m in food_matches:
        m_clean = re.sub(r'^[・\-\*]\s*', '', m).strip()
        if len(m_clean) > 5 and m_clean not in bonus_items:
            bonus_items.append(f"🍲 {m_clean}")

    # 睡意之力
    drowsy_matches = re.findall(r'([^\n]*睡意之[力量][^\n]*倍[^\n]*)', clean_text)
    for m in drowsy_matches:
        m_clean = re.sub(r'^[・\-\*]\s*', '', m).strip()
        if len(m_clean) > 4 and m_clean not in bonus_items:
            bonus_items.append(f"🌕 {m_clean}")

    # 貪吃 / 睡眠EXP / 糖果 / 睡眠點數
    for keyword, emoji, prefix in [
        ('貪吃', '😋', '點心時間：'),
        ('睡眠EXP', '💤', '經驗提升：'),
        ('糖果', '🍬', '糖果加成：'),
        ('紅利睡眠點數', '🎁', '睡眠點數：')
    ]:
        for line in text_blocks:
            if keyword in line and len(line.strip()) < 80:
                line_clean = re.sub(r'^[・\-\*]\s*', '', line).strip()
                item_str = f"{emoji} {line_clean}"
                if item_str not in bonus_items and not any(line_clean in b for b in bonus_items):
                    bonus_items.append(item_str)
                    break

    if bonus_items:
        sections.append({
            "key": "bonus",
            "title": "⚡ 核心獎勵與倍率加成",
            "icon": "⚡",
            "items": bonus_items[:6]
        })

    # 3. 🌟 機率提升寶可夢 (Rate-up Pokemon Breakdown)
    rateup_items = []
    rateup_match = re.search(r'機率提升\s*(.*?)(?:各營地能遇見的寶可夢|各項目詳情|注意事項|$)', clean_text, re.DOTALL)
    if rateup_match:
        rateup_block = rateup_match.group(1)
        rates = re.findall(r'【\s*([^】]+機率[^】]*|機率[^】]+)\s*】\s*([^\n【]+)', rateup_block)
        for r_title, r_pokes in rates:
            pokes_clean = '、'.join([p.strip() for p in re.split(r'[,、\s]+', r_pokes.strip()) if p.strip()])
            if pokes_clean:
                rateup_items.append(f"【{r_title.strip()}】{pokes_clean}")

    if rateup_items:
        sections.append({
            "key": "rateup",
            "title": "🌟 機率提升寶可夢",
            "icon": "🌟",
            "items": rateup_items
        })

    # 4. 🏝️ 各島嶼/營地專屬出現寶可夢 (Island Breakdown)
    island_items = []
    islands_match = re.search(r'各營地能遇見的寶可夢\s*(.*?)(?:各項目詳情|注意事項|商品詳情|$)', clean_text, re.DOTALL)
    if islands_match:
        island_block = islands_match.group(1)
        islands = re.findall(r'【\s*([^】]+(?:島|灘|窟|原|畔|廠|谷|EX)[^】]*)\s*】\s*([^\n【]+)', island_block)
        for island_name, pokes in islands:
            pokes_clean = '、'.join([p.strip() for p in re.split(r'[,、\s]+', pokes.strip()) if p.strip()])
            if pokes_clean and len(pokes_clean) > 2:
                island_items.append(f"🏝️ {island_name.strip()}：{pokes_clean}")

    if island_items:
        sections.append({
            "key": "islands",
            "title": "🏝️ 各營地出現寶可夢一覽",
            "icon": "🏝️",
            "items": island_items[:8]
        })

    # 5. 🛍️ 商城禮包與道具包詳情 (Shop Packs & Bundles)
    pack_items = []
    pack_matches = re.findall(r'(「[^」]+包[^」]*」[^\n]*)\s*(.*?)(?=(?:「[^」]+包|※僅限|注意事項|$))', clean_text, re.DOTALL)
    for p_name, p_content in pack_matches:
        p_name_clean = p_name.strip()
        # 提取道具清單
        lines = [re.sub(r'^[・\-\*]\s*', '', l).strip() for l in p_content.strip().split('\n') if l.strip() and not l.strip().startswith('※') and not l.strip().startswith('商品')]
        # 提取限購
        limit_match = re.search(r'※僅限購買\s*(\d+次)', p_content)
        limit_str = f"（限購 {limit_match.group(1)}）" if limit_match else ""
        if lines:
            details_str = '、'.join(lines[:6])
            pack_items.append(f"🛍️ {p_name_clean} {limit_str}：{details_str}")

    if pack_items:
        sections.append({
            "key": "shop",
            "title": "🛍️ 禮包與商城道具包一覽",
            "icon": "🛍️",
            "items": pack_items[:6]
        })

    # 6. ⚙️ 版本更新與技能調整 (Version Updates & Adjustments)
    update_items = []
    for section_kw, s_title, s_icon in [
        ('新功能', '✨ 新增功能', '✨'),
        ('平衡調整', '⚖️ 平衡調整與技能變更', '⚖️'),
        ('問題修正', '🐛 異常問題修復', '🐛')
    ]:
        match = re.search(rf'{section_kw}\s*(.*?)(?=(?:平衡調整|新功能|其他|問題修正|異常|$))', clean_text, re.DOTALL)
        if match:
            u_lines = [re.sub(r'^[・\-\*]\s*', '', l).strip() for l in match.group(1).split('\n') if len(l.strip()) > 3 and not l.strip().startswith('※')]
            if u_lines:
                update_items.append(f"{s_icon} {s_title}：{'；'.join(u_lines[:4])}")

    if update_items:
        sections.append({
            "key": "updates",
            "title": "⚙️ 更新與平衡調整內容",
            "icon": "⚙️",
            "items": update_items
        })

    # 7. 如果沒有萃取到任何特定區塊，生成通用亮點
    if not sections:
        general_highlights = []
        for line in text_blocks:
            if len(line) > 10 and (any(k in line for k in ['登場', '提升', '獲得', '效果', '新增', '特別']) or line.startswith('・')):
                clean_l = re.sub(r'^[・\-\*]\s*', '', line).strip()
                if clean_l not in general_highlights:
                    general_highlights.append(clean_l)
            if len(general_highlights) >= 4:
                break
        if general_highlights:
            sections.append({
                "key": "general",
                "title": "💡 核心重點摘要",
                "icon": "💡",
                "items": general_highlights
            })

    # 精準 Overview 提煉
    overview = ""
    meaningful_lines = [l.strip() for l in text_blocks if len(l.strip()) > 15 and not l.strip().startswith('【') and not l.strip().startswith('・') and not l.strip().startswith('http') and 'Pokémon Sleep' not in l[:15]]
    if meaningful_lines:
        overview = meaningful_lines[0]
        if len(overview) > 130:
            overview = overview[:125] + "..."
    else:
        overview = f"《Pokémon Sleep》官方最新發布「{title}」，包含最新活動、倍率加成與豐富內容。"

    # 扁平化 highlights 以相容現有精簡清單
    flat_highlights = []
    for s in sections:
        for it in s['items'][:2]:
            if len(flat_highlights) < 5 and it not in flat_highlights:
                flat_highlights.append(it)

    if not flat_highlights:
        fallback_item = f"📌 {title}"
        flat_highlights = [fallback_item, "💡 詳情請參閱官方公告內容與說明"]
        if not sections:
            sections.append({
                "key": "general",
                "title": "💡 核心重點摘要",
                "icon": "💡",
                "items": flat_highlights
            })

    return {
        "overview": overview,
        "highlights": flat_highlights,
        "sections": sections
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

    title_match = re.search(r'<h1[^>]*class=\"[^\"]*header_4__h1[^\"]*\"[^>]*>(.*?)</h1>', html, re.DOTALL) or \
                  re.search(r'<title>(.*?)(?:&#8211;|-|《|\s*Pokémon)', html, re.DOTALL) or \
                  re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    title = title_match.group(1).strip() if title_match else ""
    title = re.sub(r'<[^>]+>', '', title).strip().replace('&#8211;', '-')

    cat_match = re.search(r'<div class=\"header_4__category\"[^>]*>.*?<a[^>]*>(.*?)</a>', html, re.DOTALL) or \
                re.search(r'class=\"[^\"]*category[^\"]*\"[^>]*>(.*?)<', html)
    category = cat_match.group(1).strip() if cat_match else "通知"
    category = re.sub(r'<[^>]+>', '', category).strip()

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

    article_match = re.search(r'<article[^>]*>(.*?)</article>', html, re.DOTALL) or \
                    re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
    raw_html = article_match.group(1) if article_match else html
    clean_text = clean_html_text(raw_html)

    if title and clean_text.startswith(title):
        clean_text = clean_text[len(title):].strip()

    # 深度 AI 結構化總結
    ai_result = deep_ai_extract_sections(category, title, clean_text)
    badge_key, badge_label, badge_color = determine_badge_type(category, title)

    # 擷取文章預覽（前 360 字）
    preview = clean_text[:360].strip() + ("..." if len(clean_text) > 360 else "")

    return {
        "id": re.sub(r'[^a-zA-Z0-9]', '', url.split('/')[-2] or 'news'),
        "url": url,
        "date": formatted_date,
        "category": category,
        "badge_key": badge_key,
        "badge_label": badge_label,
        "badge_color": badge_color,
        "title": title,
        "overview": ai_result["overview"],
        "highlights": ai_result["highlights"],
        "sections": ai_result["sections"],
        "content_preview": preview
    }

def main():
    print("=" * 60)
    print("  Starting Pokemon Sleep News & Deep AI Summarizer")
    print("=" * 60)

    urls = extract_news_links(max_pages=5)
    if not urls:
        print("  [!] No news URLs found.")
        return

    articles = []
    for idx, u in enumerate(urls, 1):
        print(f"  [{idx}/{len(urls)}] Parsing & AI Deep Extraction: {u}")
        data = parse_article(u)
        if data and data.get('title'):
            articles.append(data)

    articles.sort(key=lambda x: x.get('date', ''), reverse=True)

    print(f"\n[+] Successfully parsed and generated deep summaries for {len(articles)} news items.")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f"[+] Written to {OUTPUT_FILE} ({os.path.getsize(OUTPUT_FILE)} bytes)")
    print("=" * 60)

if __name__ == '__main__':
    main()
