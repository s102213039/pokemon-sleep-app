  // --- 7.5. 全睡姿獲取研究點數與夢之碎片資料庫 (Sleep Styles EXP & Shards DB) ---
  const SLEEP_STYLES_DATA = {};

  let dynamicSleepStyles = null;
  const CACHE_KEY_SLEEP_STYLES_JSON = 'pksleep_cache_sleep_styles_json';

  function notifySleepStylesUpdated() {
    try {
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('sleep-styles-updated'));
      }
    } catch (e) {}
  }

  function loadDynamicSleepStyles() {
    // 1. 優先讀取本機快取 (LocalStorage 同步快取路徑 + IndexedDB 非同步快取)，達成 0ms 瞬時載入與零額外下載
    let hasSyncCache = false;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cachedRaw = window.localStorage.getItem(CACHE_KEY_SLEEP_STYLES_JSON);
        if (cachedRaw) {
          const parsedSync = JSON.parse(cachedRaw);
          if (parsedSync && parsedSync.byName) {
            dynamicSleepStyles = parsedSync.byName;
            _sleepStyleCacheHasDyn = false;
            hasSyncCache = true;
          }
        }
      }
    } catch (e) {}

    (async () => {
      try {
        if (typeof window !== 'undefined' && !hasSyncCache && window.DataCacheManager && typeof window.DataCacheManager.getCachedJsonAsync === 'function') {
          const parsed = await window.DataCacheManager.getCachedJsonAsync(CACHE_KEY_SLEEP_STYLES_JSON);
          if (parsed && parsed.byName) {
            const prevJson = dynamicSleepStyles ? JSON.stringify(dynamicSleepStyles) : '';
            const nextJson = JSON.stringify(parsed.byName);
            dynamicSleepStyles = parsed.byName;
            _sleepStyleCacheHasDyn = false;
            if (prevJson !== nextJson) {
              notifySleepStylesUpdated();
            }
          }
        }
      } catch (e) {}

      if (typeof fetch === 'undefined') return;
      const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
      const candidates = [
        `${base}data/sleep_styles.json`,
        `data/sleep_styles.json`,
        `../data/sleep_styles.json`,
        `${base}sleep_styles.json`,
        `sleep_styles.json`,
        `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/sleep_styles.json`
      ];

      let remoteHash = '';
      if (typeof window !== 'undefined' && window.DataCacheManager && typeof window.DataCacheManager.checkFileNeedsUpdate === 'function') {
        try {
          const check = await window.DataCacheManager.checkFileNeedsUpdate('sleep_styles.json', CACHE_KEY_SLEEP_STYLES_JSON, true);
          remoteHash = check.remoteHash || '';
          if (dynamicSleepStyles && Object.keys(dynamicSleepStyles).length >= 250 && !check.needsUpdate) {
            return;
          }
        } catch (e) {}
      }

      for (const url of candidates) {
        try {
          const res = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' });
          if (res && res.ok) {
            const rawText = await res.text();
            const data = JSON.parse(rawText);
            if (data && data.byName && Object.keys(data.byName).length >= 250) {
              const prevJson = dynamicSleepStyles ? JSON.stringify(dynamicSleepStyles) : '';
              const nextJson = JSON.stringify(data.byName);
              dynamicSleepStyles = data.byName;
              _sleepStyleCacheHasDyn = false;
              if (prevJson !== nextJson) {
                notifySleepStylesUpdated();
              }
              try {
                if (typeof window !== 'undefined' && window.DataCacheManager && typeof window.DataCacheManager.saveCachedJson === 'function') {
                  window.DataCacheManager.saveCachedJson(CACHE_KEY_SLEEP_STYLES_JSON, 'sleep_styles.json', data, remoteHash);
                } else if (typeof window !== 'undefined' && window.localStorage) {
                  window.localStorage.setItem(CACHE_KEY_SLEEP_STYLES_JSON, rawText);
                }
                if (typeof window !== 'undefined' && window.DataCacheManager && typeof window.DataCacheManager.markFileUpdated === 'function') {
                  window.DataCacheManager.markFileUpdated('sleep_styles.json', remoteHash);
                }
              } catch (e) {}
              break;
            }
          }
        } catch (e) {}
      }
    })();
  }
  loadDynamicSleepStyles();

  const _sleepStyleCache = Object.create(null);
  let _sleepStyleCacheHasDyn = false;

  function getSleepStyleData(pkmName, star) {
    if (!pkmName || !star) return null;
    const hasDyn = !!dynamicSleepStyles;
    if (hasDyn !== _sleepStyleCacheHasDyn) {
      for (const k in _sleepStyleCache) delete _sleepStyleCache[k];
      _sleepStyleCacheHasDyn = hasDyn;
    }
    const cacheKey = pkmName + ':' + star;
    const cached = _sleepStyleCache[cacheKey];
    if (cached !== undefined) return cached;

    const nameStr = String(pkmName);
    const cleanName = nameStr.replace(/（/g, '(').replace(/）/g, ')').trim();
    const fullWidthName = nameStr.replace(/\(/g, '（').replace(/\)/g, '）').trim();
    const db = dynamicSleepStyles || {};

    let entry = db[nameStr] || SLEEP_STYLES_DATA[nameStr] ||
                db[cleanName] || SLEEP_STYLES_DATA[cleanName] ||
                db[fullWidthName] || SLEEP_STYLES_DATA[fullWidthName];

    if (!entry && cleanName.includes('(')) {
      const base = cleanName.split('(')[0].trim();
      entry = db[base] || SLEEP_STYLES_DATA[base];
    }
    let res = null;
    if (entry && entry[star]) {
      const raw = entry[star];
      if (Array.isArray(raw)) {
        res = {
          star: Number(star),
          name: raw[0],
          name_en: raw[1],
          exp: raw[2],
          shards: raw[3],
          candy: raw[4],
          name_jp: raw[5] || ''
        };
      } else if (typeof raw === 'object') {
        res = {
          star: Number(star),
          name: raw.name || '',
          name_en: raw.name_en || '',
          exp: raw.exp || 0,
          shards: raw.shards || 0,
          candy: raw.candy || 0,
          name_jp: raw.name_jp || ''
        };
      }
    }
    _sleepStyleCache[cacheKey] = res;
    return res;
  }

  const _rankBadgeCache = Object.create(null);

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('appLanguageChanged', () => {
      for (const k in _rankBadgeCache) delete _rankBadgeCache[k];
    });
  }

  function formatSnorlaxRankBadge(rankStr) {
    const localeTag = window.I18N?.t?.('wiki.ui_locale_tag') ?? 'tw';
    const cacheKey = localeTag + ':' + (rankStr || '-');
    const cached = _rankBadgeCache[cacheKey];
    if (cached !== undefined) return cached;

    if (!rankStr || rankStr === '-') {
      const dashTitle = window.I18N?.t?.('wiki.ui_rank_unavailable') ?? '未出現';
      const dashHtml = `<span class="rank-badge rank-dash" title="${dashTitle}">-</span>`;
      _rankBadgeCache[cacheKey] = dashHtml;
      return dashHtml;
    }
    const parts = rankStr.trim().split(/\s+/);
    const tier = (parts[0] || '').toLowerCase();
    const num = parts[1] || '';
    const rankKeyMap = {
      basic: 'wiki.ui_rank_basic',
      great: 'wiki.ui_rank_great',
      ultra: 'wiki.ui_rank_ultra',
      master: 'wiki.ui_rank_master'
    };
    const tierKey = rankKeyMap[tier];
    const rawTierTitle = tierKey ? window.I18N?.t?.(tierKey, { num }) : rankStr;
    const tierTitle = (typeof rawTierTitle === 'string' ? rawTierTitle : String(rankStr)).trim();

    let ballSvg = '';
    if (tier === 'basic') {
      ballSvg = `<svg class="pokeball-svg ball-basic" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#ffffff" stroke="#334155" stroke-width="1.2"/><path d="M 1,8 A 7,7 0 0,1 15,8 Z" fill="#ef4444"/><line x1="1" y1="8" x2="15" y2="8" stroke="#334155" stroke-width="1.2"/><circle cx="8" cy="8" r="2.2" fill="#ffffff" stroke="#334155" stroke-width="1.2"/><circle cx="8" cy="8" r="0.8" fill="#334155"/></svg>`;
    } else if (tier === 'great') {
      ballSvg = `<svg class="pokeball-svg ball-great" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#ffffff" stroke="#1e3a8a" stroke-width="1.2"/><path d="M 1,8 A 7,7 0 0,1 15,8 Z" fill="#2563eb"/><path d="M 2.6,5.2 A 7,7 0 0,1 5.2,2.6 L 5.8,5.8 Z" fill="#ef4444"/><path d="M 13.4,5.2 A 7,7 0 0,0 10.8,2.6 L 10.2,5.8 Z" fill="#ef4444"/><line x1="1" y1="8" x2="15" y2="8" stroke="#1e3a8a" stroke-width="1.2"/><circle cx="8" cy="8" r="2.2" fill="#ffffff" stroke="#1e3a8a" stroke-width="1.2"/><circle cx="8" cy="8" r="0.8" fill="#1e3a8a"/></svg>`;
    } else if (tier === 'ultra') {
      ballSvg = `<svg class="pokeball-svg ball-ultra" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/><path d="M 1,8 A 7,7 0 0,1 15,8 Z" fill="#1e293b"/><path d="M 3.2,7.5 L 4.4,2.2 L 5.8,2.4 L 4.8,7.5 Z" fill="#facc15"/><path d="M 12.8,7.5 L 11.6,2.2 L 10.2,2.4 L 11.2,7.5 Z" fill="#facc15"/><line x1="1" y1="8" x2="15" y2="8" stroke="#0f172a" stroke-width="1.2"/><circle cx="8" cy="8" r="2.2" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/><circle cx="8" cy="8" r="0.8" fill="#0f172a"/></svg>`;
    } else if (tier === 'master') {
      ballSvg = `<svg class="pokeball-svg ball-master" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#ffffff" stroke="#4c1d95" stroke-width="1.2"/><path d="M 1,8 A 7,7 0 0,1 15,8 Z" fill="#7e22ce"/><circle cx="4.5" cy="4.5" r="1.6" fill="#ec4899"/><circle cx="11.5" cy="4.5" r="1.6" fill="#ec4899"/><path d="M 6.8,3.2 L 7.2,4.8 L 8,4 L 8.8,4.8 L 9.2,3.2" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="8" x2="15" y2="8" stroke="#4c1d95" stroke-width="1.2"/><circle cx="8" cy="8" r="2.2" fill="#ffffff" stroke="#4c1d95" stroke-width="1.2"/><circle cx="8" cy="8" r="0.8" fill="#4c1d95"/></svg>`;
    } else {
      const rawHtml = `<span class="rank-badge">${rankStr}</span>`;
      _rankBadgeCache[cacheKey] = rawHtml;
      return rawHtml;
    }

    const html = `
      <span class="rank-badge rank-${tier}" title="${tierTitle}">
        ${ballSvg}
        <span class="rank-num">${num}</span>
      </span>
    `;
    _rankBadgeCache[cacheKey] = html;
    return html;
  }

  function closeSleepStylePopover() {
    const pop = document.getElementById('island-sleep-popover');
    if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
    const backdrop = document.getElementById('island-sleep-popover-backdrop');
    if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
  }

  function showSleepStylePopover(pkmName, star, rankStr, anchorEl, event) {
    if (event && event.stopPropagation) event.stopPropagation();
    closeSleepStylePopover();

    const style = getSleepStyleData(pkmName, star);
    if (!style) return;

    if (!anchorEl && event && event.target) {
      anchorEl = event.target.closest('.island-sleep-cell-wrap') || event.target;
    } else if (anchorEl && anchorEl.target) {
      event = anchorEl;
      anchorEl = event.target.closest('.island-sleep-cell-wrap') || event.target;
    }

    const shardsLabel = window.I18N?.t?.('wiki.ui_sleep_shards_lbl') ?? '夢之碎片: ';
    const expLabel = window.I18N?.t?.('wiki.ui_sleep_exp_lbl') ?? '研究EXP: ';
    const candyLabel = window.I18N?.t?.('wiki.ui_sleep_candy_lbl') ?? '糖果數量: ';

    const tip = document.createElement('div');
    tip.id = 'island-sleep-popover';
    tip.className = 'island-sleep-hover-tooltip';
    tip.innerHTML = `
      <div class="island-sleep-tip-line">${shardsLabel}${style.shards}</div>
      <div class="island-sleep-tip-line">${expLabel}${style.exp}</div>
      <div class="island-sleep-tip-line">${candyLabel}${style.candy}</div>
    `;

    document.body.appendChild(tip);

    if (anchorEl && typeof anchorEl.getBoundingClientRect === 'function') {
      const rect = anchorEl.getBoundingClientRect();
      const tipRect = tip.getBoundingClientRect();
      let top = rect.top - tipRect.height - 8;
      let left = rect.left + (rect.width / 2) - (tipRect.width / 2);

      if (top < 8) {
        top = rect.bottom + 8;
      }
      const winWidth = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1024;
      const winHeight = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 768;
      if (left < 10) left = 10;
      if (left + tipRect.width > winWidth - 10) {
        left = winWidth - tipRect.width - 10;
      }
      if (top + tipRect.height > winHeight - 8) {
        top = winHeight - tipRect.height - 8;
      }

      tip.style.top = `${Math.round(top)}px`;
      tip.style.left = `${Math.round(left)}px`;
    }
  }
