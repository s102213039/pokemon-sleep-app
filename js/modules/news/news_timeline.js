/**
 * Pokemon Sleep - 最新更新與新聞 (News & Updates Module)
 * 載入官方繁體中文新聞、AI 智能總結、分類篩選與即時搜尋
 */

(function () {
  'use strict';

  let allNews = [];
  let currentCategory = 'ALL';
  let searchQuery = '';
  const expandedMap = new Set();

  // DOM 元素
  const newsCategoryContainer = typeof document !== 'undefined' ? document.getElementById('news-category-tags') : null;
  const newsSearchInput       = typeof document !== 'undefined' ? document.getElementById('news-search-input') : null;
  const newsSearchClear       = typeof document !== 'undefined' ? document.getElementById('news-search-clear') : null;
  const newsCountBadge        = typeof document !== 'undefined' ? document.getElementById('news-count-badge') : null;
  const newsListContainer     = typeof document !== 'undefined' ? document.getElementById('news-list-container') : null;
  const newsTimelineContainer = typeof document !== 'undefined' ? document.getElementById('news-event-timeline') : null;

  const CATEGORY_MAP = [
    { key: 'ALL', label: '全部消息' },
    { key: 'event', label: '活動企劃' },
    { key: 'update', label: '版本更新' },
    { key: 'maintenance', label: '維護公告' },
    { key: 'notice', label: '重要通知' }
  ];

  /* ─── 載入新聞資料 ───────────────────────────────────── */
  const CACHE_KEY_NEWS_JSON = 'pksleep_cache_news_json';

  function scheduleDynamicNewsSync() {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    // 網頁載入執行時，透過輕量級 manifest.json 檢查雜湊是否有更新
    setTimeout(async () => {
      try {
        let remoteHash = '';
        if (window.DataCacheManager && typeof window.DataCacheManager.checkFileNeedsUpdate === 'function') {
          const check = await window.DataCacheManager.checkFileNeedsUpdate('news.json', CACHE_KEY_NEWS_JSON, false);
          if (!check.needsUpdate && Array.isArray(allNews) && allNews.length > 0) {
            return;
          }
          remoteHash = check.remoteHash || '';
        }

        const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
        const liveUrl = `${base}data/news.json?v=${remoteHash || Date.now()}`;
        let res = await fetch(liveUrl, { cache: 'no-cache' }).catch(() => null);
        if (!res || !res.ok) {
          const fallbackRawUrl = `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/news.json?t=${Date.now()}`;
          res = await fetch(fallbackRawUrl, { cache: 'no-store' });
        }
        if (!res || !res.ok) return;
        const rawText = await res.text();
        const freshData = JSON.parse(rawText);
        if (Array.isArray(freshData) && freshData.length > 0) {
          if (window.DataCacheManager) {
            window.DataCacheManager.saveCachedJson(CACHE_KEY_NEWS_JSON, 'news.json', rawText, remoteHash);
          } else if (window.localStorage) {
            try {
              window.localStorage.setItem(CACHE_KEY_NEWS_JSON, rawText);
            } catch (e) {}
          }
          const currentIds = new Set(allNews.map(n => n.id));
          const hasUpdate = freshData.length !== allNews.length || freshData.some(n => !currentIds.has(n.id));
          if (hasUpdate) {
            allNews = freshData;
            renderEventTimeline();
            initCategoryTags();
            renderNews();
            console.log('[News Engine] 動態連線取得最新官方公告完成，已自動更新至最新資料 (' + freshData.length + ' 筆)');
          }
        }
      } catch (e) {}
    }, 1500);
  }

  async function loadNews() {
    try {
      // 1. 優先自本機快取瞬間載入 (Cache-First 0ms 秒開：IndexedDB / LocalStorage)
      try {
        if (typeof window !== 'undefined') {
          let cachedData = null;
          if (window.DataCacheManager && typeof window.DataCacheManager.getCachedJsonAsync === 'function') {
            cachedData = await window.DataCacheManager.getCachedJsonAsync(CACHE_KEY_NEWS_JSON);
          } else if (window.localStorage) {
            const cachedText = window.localStorage.getItem(CACHE_KEY_NEWS_JSON);
            if (cachedText) cachedData = JSON.parse(cachedText);
          }
          if (Array.isArray(cachedData) && cachedData.length > 0) {
            allNews = cachedData;
            renderEventTimeline();
            initCategoryTags();
            initSearch();
            renderNews();
            scheduleDynamicNewsSync();
            return;
          }
        }
      } catch (cacheReadErr) {}

      const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
      const defaultCandidates = [
        `${base}data/news.json`,
        `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/news.json`,
        `data/news.json`,
        `../data/news.json`,
        `${base}news.json`,
        `news.json`,
        `../news.json`
      ];
      const cleanUrls = Array.from(new Set(defaultCandidates.filter(Boolean).map(u => u.split('?')[0])));

      const maxAttempts = 3;
      let res = null;
      let lastErr = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const uniqueUrls = attempt === 1 ? cleanUrls : cleanUrls.map(u => `${u}?t=${Date.now()}`);

        for (const url of uniqueUrls) {
          try {
            const attemptRes = await fetch(url, { cache: attempt === 1 ? 'default' : 'no-store' });
            if (attemptRes && attemptRes.ok) {
              res = attemptRes;
              break;
            }
          } catch (e) {
            lastErr = e;
          }
        }
        if (res && res.ok) break;

        // 若前次嘗試未成功，短暫退避等待後重試 (平滑跨過 GitHub Pages 部署瞬間)
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, attempt * 600));
        }
      }

      if (!res || !res.ok) {
        // 若網路請求失敗，嘗試自本機快取 (IndexedDB / LocalStorage) 離線載入
        try {
          if (typeof window !== 'undefined') {
            let cachedData = null;
            if (window.DataCacheManager && typeof window.DataCacheManager.getCachedJsonAsync === 'function') {
              cachedData = await window.DataCacheManager.getCachedJsonAsync(CACHE_KEY_NEWS_JSON);
            } else if (window.localStorage) {
              const cachedText = window.localStorage.getItem(CACHE_KEY_NEWS_JSON);
              if (cachedText) cachedData = JSON.parse(cachedText);
            }
            if (Array.isArray(cachedData) && cachedData.length > 0) {
              console.warn('[News Engine] 網路請求暫時失敗，已自動自本機離線快取載入 news.json (' + cachedData.length + ' 筆公告)');
              allNews = cachedData;
              renderEventTimeline();
              initCategoryTags();
              initSearch();
              renderNews();
              scheduleDynamicNewsSync();
              return;
            }
          }
        } catch (cacheErr) {
          console.warn('[News Engine] 讀取離線快取失敗:', cacheErr);
        }
        throw lastErr || new Error(`HTTP ${res ? res.status : 'Fetch Failed'}`);
      }

      const text = await res.text();
      allNews = JSON.parse(text);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem(CACHE_KEY_NEWS_JSON, text);
          } catch (e) {}
        }
        if (typeof window !== 'undefined' && window.DataCacheManager) {
          window.DataCacheManager.saveCachedJson(CACHE_KEY_NEWS_JSON, 'news.json', allNews);
        }
      } catch (e) {}
      renderEventTimeline();
      initCategoryTags();
      initSearch();
      renderNews();
      scheduleDynamicNewsSync();
    } catch (err) {
      console.error('Failed to load news.json:', err);
      if (typeof window.__renderInPlaceError === 'function') {
        window.__renderInPlaceError('news-list-container', '最新新聞與公告載入失敗 (news.json)', err);
      } else if (newsListContainer) {
        newsListContainer.innerHTML = `
          <div class="empty-state" style="padding: 40px 20px; text-align: center;">
            <div style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">新聞資料載入失敗：${err.message}</div>
            <div style="font-size: 13px; color: var(--text-muted);">請稍後重整頁面，或點擊頂部「同步資料」更新最新官方新聞。</div>
          </div>
        `;
      }
    }
  }

  /* ─── 官方活動與禮包甘特圖時程 (Gantt Schedule Timeline) ─── */
  function extractEventSchedule(item) {
    if (!item) return null;
    if (item._cachedSchedule !== undefined) return item._cachedSchedule;
    let texts = [];
    if (item.sections) {
      item.sections.forEach(sec => {
        if (sec.items) texts.push(...sec.items);
      });
    }
    if (item.highlights) texts.push(...item.highlights);
    if (item.content_preview) texts.push(item.content_preview);
    const combinedText = texts.join(' ');

    const regex = /(?:(\d{4})\/)?(\d{1,2})\/(\d{1,2})(?:\s*\([^\)]+\))?\s*(?:(\d{1,2}):(\d{2}))?\s*[～~-]\s*(?:(\d{4})\/)?(\d{1,2})\/(\d{1,2})(?:\s*\([^\)]+\))?\s*(?:(\d{1,2}):(\d{2}))?/g;
    let match;
    let earliestStart = null;
    let latestEnd = null;
    let startStr = '', endStr = '';

    const defaultYear = item.date ? parseInt(item.date.split('/')[0] || item.date.split('-')[0], 10) : _today.getFullYear();

    while ((match = regex.exec(combinedText)) !== null) {
      const sYear = match[1] ? parseInt(match[1], 10) : defaultYear;
      const sMonth = parseInt(match[2], 10);
      const sDay = parseInt(match[3], 10);
      const sHour = match[4] ? parseInt(match[4], 10) : 4;

      const eYear = match[6] ? parseInt(match[6], 10) : (match[1] ? parseInt(match[1], 10) : defaultYear);
      const eMonth = parseInt(match[7], 10);
      const eDay = parseInt(match[8], 10);
      const eHour = match[9] ? parseInt(match[9], 10) : 3;

      const sDate = new Date(sYear, sMonth - 1, sDay, sHour);
      const eDate = new Date(eYear, eMonth - 1, eDay, eHour);

      if (!earliestStart || sDate < earliestStart) {
        earliestStart = sDate;
        startStr = `${String(sMonth).padStart(2, '0')}/${String(sDay).padStart(2, '0')}`;
      }
      if (!latestEnd || eDate > latestEnd) {
        latestEnd = eDate;
        endStr = `${String(eMonth).padStart(2, '0')}/${String(eDay).padStart(2, '0')}`;
      }
    }

    if (earliestStart && latestEnd) {
      item._cachedSchedule = {
        startStr,
        endStr,
        startDate: earliestStart,
        endDate: latestEnd
      };
      return item._cachedSchedule;
    }
    item._cachedSchedule = null;
    return null;
  }

  function parseEventTimeline(items) {
    const newsList = items || allNews;
    const ganttItems = [];
    // 動態計算當月的起始日與天數 (不再寫死)
    const baseStart = new Date(calCurrentYear, calCurrentMonth, 1, 0, 0, 0);
    const totalDays = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();

    newsList.forEach(item => {
      const isEvent = item.badge_key === 'event' || (item.title && (item.title.includes('活動') || item.title.includes('企畫') || item.title.includes('企劃') || item.title.includes('快照') || item.title.includes('新月日') || item.title.includes('好眠日') || item.title.includes('秘境') || item.title.includes('超夢') || item.title.includes('夢幻') || item.title.includes('任務')));
      const isPack = (item.title && (item.title.includes('包') || item.title.includes('限定包') || item.title.includes('培育包') || item.title.includes('同樂包') || item.title.includes('紀念包')));

      if (!isEvent && !isPack) return;

      const schedule = extractEventSchedule(item);
      if (!schedule) return;

      const diffStartMs = schedule.startDate.getTime() - baseStart.getTime();
      const diffEndMs = schedule.endDate.getTime() - baseStart.getTime();

      let startCol = Math.floor(diffStartMs / (1000 * 60 * 60 * 24)) + 1;
      let endCol = Math.floor(diffEndMs / (1000 * 60 * 60 * 24)) + 1;

      startCol = Math.max(1, Math.min(totalDays, startCol));
      endCol = Math.max(startCol, Math.min(totalDays, endCol));
      const spanCols = Math.max(1, endCol - startCol + 1);

      const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
      let rawTitle = (isEN && item.title_en) ? item.title_en : item.title;
      let cleanTitle = rawTitle
        .replace(/【[^】]+】|\[[^\]]+\]/g, '')
        .replace(/「|」/g, '')
        .replace(/介紹$/g, '')
        .replace(/資訊$/g, '')
        .trim();

      let eventCat = 'event';
      let typeLabel = isEN ? 'Special Event' : '活動企劃';
      let typeClass = 'gantt-bar-event';
      let typeColor = '#f97316'; // 暖陽落日橘 (Warm Coral)

      const titleLower = (item.title + ' ' + (item.title_en || '')).toLowerCase();
      if (titleLower.includes('快照') || titleLower.includes('snapshot')) {
        eventCat = 'snapshot';
        typeLabel = isPack ? (isEN ? 'Snapshot Pack' : '快照同樂包') : (isEN ? 'Miracle Snapshot' : '奇跡快照');
        typeClass = isPack ? 'gantt-bar-pack' : 'gantt-bar-event';
        typeColor = '#38bdf8'; // 亮天藍 (Sky Blue)
      } else if (titleLower.includes('超夢') || titleLower.includes('mewtwo') || titleLower.includes('秘境')) {
        eventCat = 'mewtwo';
        typeLabel = isEN ? 'Mewtwo Research' : '超夢秘境研究';
        typeClass = 'gantt-bar-event';
        typeColor = '#a855f7'; // 霓虹亮紫
      } else if (titleLower.includes('好眠日限定包')) {
        eventCat = 'good-sleep';
        typeLabel = isEN ? 'Good Sleep Pack' : '好眠限定包';
        typeClass = 'gantt-bar-pack';
        typeColor = '#f59e0b'; // 滿月曜石琥珀金
      } else if (titleLower.includes('好眠日') || titleLower.includes('good sleep')) {
        eventCat = 'good-sleep';
        typeLabel = isEN ? 'Good Sleep Day' : '好眠日';
        typeClass = 'gantt-bar-event';
        typeColor = '#eab308'; // 陽光純金黃
      } else if (titleLower.includes('新月日限定包')) {
        eventCat = 'new-moon';
        typeLabel = isEN ? 'New Moon Pack' : '新月限定包';
        typeClass = 'gantt-bar-pack';
        typeColor = '#a855f7'; // 霓虹亮紫
      } else if (titleLower.includes('新月日') || titleLower.includes('new moon')) {
        eventCat = 'new-moon';
        typeLabel = isEN ? 'New Moon Day' : '新月日';
        typeClass = 'gantt-bar-event';
        typeColor = '#6366f1'; // 宇宙深靛藍
      } else if (titleLower.includes('30週年') || titleLower.includes('30th')) {
        eventCat = 'pack-bundle';
        typeLabel = isEN ? '30th Anniv Pack' : '30週年紀念包';
        typeClass = 'gantt-bar-pack';
        typeColor = '#f43f5e'; // 慶典緋紅
      } else if (titleLower.includes('合作紀念包')) {
        eventCat = 'collab';
        typeLabel = isEN ? 'Collab Pack' : '合作紀念包';
        typeClass = 'gantt-bar-pack';
        typeColor = '#0284c7'; // 晴空海藍
      } else if (titleLower.includes('合作') || titleLower.includes('collab') || titleLower.includes('動畫')) {
        eventCat = 'collab';
        typeLabel = isEN ? 'Collab Event' : '合作特企';
        typeClass = 'gantt-bar-event';
        typeColor = '#ec4899'; // 洋紅亮粉
      } else if (titleLower.includes('小鍛匠')) {
        eventCat = 'pack-growth';
        typeLabel = isEN ? 'Tinkatink Pack' : '小鍛匠培育包';
        typeClass = 'gantt-bar-pack';
        typeColor = '#14b8a6'; // 薄荷青碧
      } else if (titleLower.includes('摔角鷹人')) {
        eventCat = 'pack-growth';
        typeLabel = isEN ? 'Hawlucha Pack' : '摔角鷹人培育包';
        typeClass = 'gantt-bar-pack';
        typeColor = '#10b981'; // 翡翠翠綠
      } else if (titleLower.includes('培育包') || titleLower.includes('growth')) {
        eventCat = 'pack-growth';
        typeLabel = isEN ? 'Growth Pack' : '培育包';
        typeClass = 'gantt-bar-pack';
        typeColor = '#10b981'; // 翡翠翠綠
      } else if (titleLower.includes('同樂包')) {
        eventCat = 'pack-bundle';
        typeLabel = isEN ? 'Festival Bundle' : '同樂包';
        typeClass = 'gantt-bar-pack';
        typeColor = '#06b6d4'; // 加勒比天青
      } else if (titleLower.includes('嘉年華') || titleLower.includes('festival') || titleLower.includes('夏日') || titleLower.includes('慶典')) {
        eventCat = isPack ? 'pack-bundle' : 'festival';
        typeLabel = isPack ? (isEN ? 'Event Bundle' : '活動禮包') : (isEN ? 'Summer Carnival' : '夏日嘉年華');
        typeClass = isPack ? 'gantt-bar-pack' : 'gantt-bar-event';
        typeColor = isPack ? '#06b6d4' : '#f97316'; // 暖陽落日橘
      } else if (isPack || titleLower.includes('包') || titleLower.includes('bundle') || titleLower.includes('pack')) {
        eventCat = 'pack-bundle';
        typeLabel = isEN ? 'Event Bundle' : '活動禮包';
        typeClass = 'gantt-bar-pack';
        typeColor = '#0284c7'; // 晴空海藍
      } else if (item.badge_key === 'update' || titleLower.includes('更新') || titleLower.includes('維護')) {
        eventCat = 'update';
        typeLabel = isEN ? 'Update' : '版本更新';
        typeClass = 'gantt-bar-event';
        typeColor = '#f43f5e'; // 薔薇亮紅
      } else {
        eventCat = 'event';
        typeLabel = isEN ? 'Special Event' : '活動企劃';
        typeClass = 'gantt-bar-event';
        typeColor = '#d946ef'; // 炫彩紫羅蘭
      }

      ganttItems.push({
        id: item.id,
        title: cleanTitle,
        fullTitle: rawTitle,
        eventCat,
        typeLabel,
        typeClass,
        typeColor,
        startStr: schedule.startStr,
        endStr: schedule.endStr,
        startCol,
        spanCols,
        startDate: schedule.startDate,
        endDate: schedule.endDate
      });
    });

    return ganttItems.sort((a, b) => {
      const priorityOrder = { 'snapshot': 1, 'mewtwo': 2, 'good-sleep': 3, 'festival': 4, 'collab': 5, 'new-moon': 6, 'event': 7, 'pack-growth': 8, 'pack-bundle': 9, 'update': 10 };
      const pa = priorityOrder[a.eventCat] || 99;
      const pb = priorityOrder[b.eventCat] || 99;
      if (pa !== pb) return pa - pb;
      return a.startDate - b.startDate;
    });
  }

  const _today = new Date();
  let calCurrentYear = _today.getFullYear();
  let calCurrentMonth = _today.getMonth(); // 0-indexed
  let calSelectedDay = _today.getDate();
  let filterOnlyOngoing = false; // 是否在下方卡片列表只展示進行中的活動

  function renderEventTimeline() {
    if (!newsTimelineContainer) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';
    const ganttData = parseEventTimeline(allNews);
    if (ganttData.length === 0) {
      newsTimelineContainer.style.display = 'none';
      return;
    }

    newsTimelineContainer.style.display = 'block';

    // 智能多軌道分配 (0, 1, 2, 3, 4)，保證跨日活動在相同的水平軌道上連續貫穿
    const trackEndTimes = [];
    ganttData.forEach(ev => {
      let assignedTrack = -1;
      for (let i = 0; i < trackEndTimes.length; i++) {
        if (trackEndTimes[i] < ev.startDate.getTime()) {
          assignedTrack = i;
          trackEndTimes[i] = ev.endDate.getTime();
          break;
        }
      }
      if (assignedTrack === -1) {
        assignedTrack = trackEndTimes.length;
        trackEndTimes.push(ev.endDate.getTime());
      }
      ev.trackIndex = assignedTrack;
    });

    const monthNames = isEN
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      : ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'];
    const monthTitle = isEN ? `${monthNames[calCurrentMonth]} ${calCurrentYear}` : `${calCurrentYear} 年 ${monthNames[calCurrentMonth]}`;
    const weekdayLabels = isEN ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['日', '一', '二', '三', '四', '五', '六'];

    const firstDayWeekday = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
    const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();

    // 建立日曆網格
    const dayCellsHTML = [];
    for (let i = 0; i < firstDayWeekday; i++) {
      dayCellsHTML.push('<div class="news-cal-day-cell empty"></div>');
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(calCurrentYear, calCurrentMonth, d);
      const dayOfWeek = dateObj.getDay(); // 0: Sun, 6: Sat
      const dayStart = new Date(calCurrentYear, calCurrentMonth, d, 0, 0, 0);
      const dayEnd = new Date(calCurrentYear, calCurrentMonth, d, 23, 59, 59);
      const activeEvents = ganttData.filter(ev => ev.startDate <= dayEnd && ev.endDate >= dayStart)
                                    .sort((a, b) => (a.trackIndex || 0) - (b.trackIndex || 0));
      const isToday = (calCurrentYear === _today.getFullYear() && calCurrentMonth === _today.getMonth() && d === _today.getDate());
      const isSelected = (d === calSelectedDay);

      // 每個活動各自獨立的專屬色塊貫穿背景 (Head-Body-Foot 嚴格分段連續效果)
      let bgBandsHTML = '';
      if (activeEvents.length > 0) {
        const trackMap = {};
        activeEvents.forEach(ev => {
          trackMap[ev.trackIndex] = ev;
        });

        const bands = [];
        const maxDayTrack = Math.max(...activeEvents.map(e => e.trackIndex || 0));
        const limitTracks = Math.max(1, Math.min(3, maxDayTrack + 1));

        for (let t = 0; t < limitTracks; t++) {
          const ev = trackMap[t];
          if (!ev) {
            bands.push('<div class="news-cal-bg-band band-empty"></div>');
            continue;
          }

          const prevDayEnd = new Date(calCurrentYear, calCurrentMonth, d - 1, 23, 59, 59);
          const nextDayStart = new Date(calCurrentYear, calCurrentMonth, d + 1, 0, 0, 0);

          // 是否與同一週前一天連續 (同橫列左側連接)
          const hasLeft = (dayOfWeek > 0) && (d > 1) && (ev.startDate <= prevDayEnd);
          // 是否與同一週後一天連續 (同橫列右側連接)
          const hasRight = (dayOfWeek < 6) && (d < daysInMonth) && (ev.endDate >= nextDayStart);

          let segType = 'body';
          if (!hasLeft && !hasRight) {
            segType = 'single'; // 單日活動：四角圓角
          } else if (!hasLeft && hasRight) {
            segType = 'head'; // 活動開頭 (或換行開頭)：左上左下圓角，右側直角 100% 填滿
          } else if (hasLeft && hasRight) {
            segType = 'body'; // 活動中間：全部直角，左右 100% 填滿
          } else if (hasLeft && !hasRight) {
            segType = 'foot'; // 活動結尾 (或換行結尾)：右上右下圓角，左側直角 100% 填滿
          }

          bands.push(`
            <div class="news-cal-bg-band band-${segType}" 
                 style="background-color: ${ev.typeColor};"
                 title="${escapeHtml(ev.title)} (${ev.typeLabel})"></div>
          `);
        }

        bgBandsHTML = `<div class="news-cal-bg-bands">${bands.join('')}</div>`;
      }

      dayCellsHTML.push(`
        <div class="news-cal-day-cell ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${activeEvents.length > 0 ? 'has-events' : ''}" data-day="${d}">
          ${bgBandsHTML}
          <span class="news-cal-day-num">${d}</span>
        </div>
      `);
    }

    // 計算當前選取日期的活動
    const selectedDayStart = new Date(calCurrentYear, calCurrentMonth, calSelectedDay, 0, 0, 0);
    const selectedDayEnd = new Date(calCurrentYear, calCurrentMonth, calSelectedDay, 23, 59, 59);
    const selectedDateEvents = ganttData.filter(ev => ev.startDate <= selectedDayEnd && ev.endDate >= selectedDayStart);

    let selectedEventsHTML = '';
    if (selectedDateEvents.length > 0) {
      selectedEventsHTML = selectedDateEvents.map(ev => {
        let evStatus = '';
        if (_today > ev.endDate) {
          evStatus = `<span class="news-cal-status-tag status-expired">${isEN ? 'Ended' : '已結束'}</span>`;
        } else if (_today >= ev.startDate && _today <= ev.endDate) {
          evStatus = `<span class="news-cal-status-tag status-ongoing">${isEN ? 'Ongoing' : '進行中'}</span>`;
        } else {
          evStatus = `<span class="news-cal-status-tag status-upcoming">${isEN ? 'Upcoming' : '即將開始'}</span>`;
        }
        return `
        <div class="news-cal-event-item cat-${ev.eventCat} ${_today > ev.endDate ? 'is-expired' : ''}" data-event-id="${ev.id}" data-event-title="${escapeHtml(ev.title)}" title="${isEN ? 'Click to search this event' : '點擊直接搜尋此活動'}">
          <div class="news-cal-event-left">
            <span class="news-cal-event-badge badge-${ev.eventCat}" style="border-left: 3px solid ${ev.typeColor};">${ev.typeLabel}</span>
            <span class="news-cal-event-name">${escapeHtml(ev.title)}</span>
            ${evStatus}
          </div>
          <span class="news-cal-event-time">${ev.startStr} ~ ${ev.endStr}</span>
        </div>
      `;}).join('');
    } else {
      selectedEventsHTML = `
        <div class="news-cal-empty-hint">
          ${isEN ? 'No active events or bundles on this date' : '當日暫無進行中的特殊活動或禮包'}
        </div>
      `;
    }

    const isTodaySelected = (calCurrentYear === _today.getFullYear() && calCurrentMonth === _today.getMonth() && calSelectedDay === _today.getDate());
    const selectedDateStr = isEN
      ? `${monthNames[calCurrentMonth]} ${calSelectedDay}${isTodaySelected ? ' (Today)' : ''}`
      : `${calCurrentMonth + 1}月${calSelectedDay}日${isTodaySelected ? ' (今日)' : ''}`;

    newsTimelineContainer.innerHTML = `
      <div class="news-calendar-wrapper">
        <div class="news-calendar-cal-col">
          <div class="news-calendar-top-bar">
            <div class="news-calendar-title-group">
              <span>${isEN ? 'Event Calendar' : '活動日曆'}</span>
              <span class="news-calendar-month-text">(${monthTitle})</span>
            </div>
            <div class="news-calendar-nav-group">
              <button type="button" class="news-calendar-nav-btn prev-btn" title="${isEN ? 'Previous Month' : '上個月'}">◀</button>
              <button type="button" class="news-calendar-nav-btn today-btn" title="${isEN ? 'Return to Today' : '今日'}">${isEN ? 'Today' : '今日'}</button>
              <button type="button" class="news-calendar-nav-btn next-btn" title="${isEN ? 'Next Month' : '下個月'}">▶</button>
            </div>
          </div>

          <div class="news-calendar-weekdays">
            ${weekdayLabels.map((w, idx) => `<div class="news-calendar-weekday ${idx === 0 ? 'sun' : idx === 6 ? 'sat' : ''}">${w}</div>`).join('')}
          </div>

          <div class="news-calendar-grid">
            ${dayCellsHTML.join('')}
          </div>
        </div>

        <div class="news-calendar-events-box">
          <div class="news-cal-box-title-row">
            <div class="news-cal-box-title-left">
              <span class="news-cal-box-heading">${selectedDateStr} ${isEN ? 'Active Events' : (isCN ? '进行中的活动与礼包' : '進行中的活動與禮包')}</span>
              <span class="news-cal-box-count">${selectedDateEvents.length} ${isEN ? 'items' : (isCN ? '项' : '項')}</span>
            </div>
            <button type="button" class="news-cal-filter-ongoing-btn ${filterOnlyOngoing ? 'active' : ''}" title="${isEN ? 'Filter card list below to currently ongoing events' : (isCN ? '在下方卡片列表展示所有正在进行的活动' : '在下方卡片列表展示所有正在進行的活動')}">
              ${filterOnlyOngoing ? (isEN ? '✕ Reset Cards' : (isCN ? '✕ 还原全部卡片' : '✕ 還原全部卡片')) : (isEN ? 'Show in Cards' : (isCN ? '在下方展示进行中活动' : '在下方展示進行中活動'))}
            </button>
          </div>
          <div class="news-cal-events-scroll-list">
            ${selectedEventsHTML}
          </div>
        </div>
      </div>
    `;

    // 綁定日曆切換與點選事件
    const prevBtn = newsTimelineContainer.querySelector('.prev-btn');
    const nextBtn = newsTimelineContainer.querySelector('.next-btn');
    const todayBtn = newsTimelineContainer.querySelector('.today-btn');
    const filterOngoingBtn = newsTimelineContainer.querySelector('.news-cal-filter-ongoing-btn');

    if (filterOngoingBtn) {
      filterOngoingBtn.addEventListener('click', () => {
        filterOnlyOngoing = !filterOnlyOngoing;
        if (filterOnlyOngoing) {
          // 展開當日進行中活動卡片
          const selectedDayStart = new Date(calCurrentYear, calCurrentMonth, calSelectedDay, 0, 0, 0);
          const selectedDayEnd = new Date(calCurrentYear, calCurrentMonth, calSelectedDay, 23, 59, 59);
          const activeIds = ganttData.filter(ev => ev.startDate <= selectedDayEnd && ev.endDate >= selectedDayStart).map(e => e.id);
          activeIds.forEach(id => expandedMap.add(id));
        }
        renderNews();
        renderEventTimeline();
        if (filterOnlyOngoing && newsListContainer) {
          newsListContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (calCurrentMonth > 0) calCurrentMonth--;
        else { calCurrentYear--; calCurrentMonth = 11; }
        calSelectedDay = 1;
        renderEventTimeline();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (calCurrentMonth < 11) calCurrentMonth++;
        else { calCurrentYear++; calCurrentMonth = 0; }
        calSelectedDay = 1;
        renderEventTimeline();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        calCurrentYear = _today.getFullYear();
        calCurrentMonth = _today.getMonth();
        calSelectedDay = _today.getDate();
        renderEventTimeline();
      });
    }

    // 點擊日期格子切換選取日
    newsTimelineContainer.querySelectorAll('.news-cal-day-cell:not(.empty)').forEach(cell => {
      cell.addEventListener('click', () => {
        const day = parseInt(cell.getAttribute('data-day'), 10);
        if (day) {
          calSelectedDay = day;
          if (filterOnlyOngoing) {
            renderNews();
          }
          renderEventTimeline();
        }
      });
    });

    // 點擊活動項目：直接在搜尋框輸入該活動名稱並進行搜尋過濾
    newsTimelineContainer.querySelectorAll('.news-cal-event-item').forEach(item => {
      item.addEventListener('click', () => {
        const evId = item.getAttribute('data-event-id');
        const evTitle = item.getAttribute('data-event-title') || '';
        const targetItem = allNews.find(n => n.id === evId);
        const searchWord = evTitle || (targetItem ? targetItem.title : '');

        // 1. 填入搜尋關鍵字
        if (newsSearchInput) {
          newsSearchInput.value = searchWord;
          searchQuery = searchWord.trim().toLowerCase();
          updateClearBtn();
        }

        // 2. 切換分類至全部 (ALL) 確保搜尋完整覆蓋
        currentCategory = 'ALL';
        if (newsCategoryContainer) {
          newsCategoryContainer.querySelectorAll('.news-tag-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-cat') === 'ALL');
          });
        }

        // 3. 展開該活動卡片並渲染搜尋結果
        if (evId) {
          expandedMap.add(evId);
        }
        filterOnlyOngoing = false;
        renderNews();
        renderEventTimeline();

        // 4. 平滑滾動至搜尋結果新聞卡片
        setTimeout(() => {
          const el = document.getElementById(`news-${evId}`) || newsSearchInput;
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (el.classList) {
              el.classList.add('news-card-highlight-flash');
              setTimeout(() => el.classList.remove('news-card-highlight-flash'), 1800);
            }
          }
        }, 80);
      });
    });
  }

  /* ─── 初始化分類標籤 ─────────────────────────────────── */
