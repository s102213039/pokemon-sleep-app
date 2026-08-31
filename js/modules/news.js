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
  async function loadNews() {
    try {
      const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
      const t = Date.now();
      const candidates = [
        `${base}data/news.json?t=${t}`,
        `data/news.json?t=${t}`,
        `../data/news.json?t=${t}`,
        `${base}news.json?t=${t}`,
        `news.json?t=${t}`,
        `../news.json?t=${t}`
      ];
      const uniqueUrls = Array.from(new Set(candidates.filter(Boolean)));

      let res = null;
      let lastErr = null;
      for (const url of uniqueUrls) {
        try {
          const attempt = await fetch(url, { cache: 'no-store' });
          if (attempt && attempt.ok) {
            res = attempt;
            break;
          }
        } catch (e) {
          lastErr = e;
        }
      }
      if (!res || !res.ok) {
        throw lastErr || new Error(`HTTP ${res ? res.status : 'Fetch Failed'}`);
      }
      allNews = await res.json();
      renderEventTimeline();
      initCategoryTags();
      initSearch();
      renderNews();
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

  /* ─── 📅 官方活動與禮包甘特圖時程 (Gantt Schedule Timeline) ─── */
  function extractEventSchedule(item) {
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
      return {
        startStr,
        endStr,
        startDate: earliestStart,
        endDate: latestEnd
      };
    }
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

      // 🌈 每個活動各自獨立的專屬色塊貫穿背景 (Head-Body-Foot 嚴格分段連續效果)
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
      selectedEventsHTML = selectedDateEvents.map(ev => `
        <div class="news-cal-event-item cat-${ev.eventCat}" data-event-id="${ev.id}" data-event-title="${escapeHtml(ev.title)}" title="${isEN ? 'Click to search this event' : '點擊直接搜尋此活動'}">
          <div class="news-cal-event-left">
            <span class="news-cal-event-badge badge-${ev.eventCat}" style="border-left: 3px solid ${ev.typeColor};">${ev.typeLabel}</span>
            <span class="news-cal-event-name">${escapeHtml(ev.title)}</span>
          </div>
          <span class="news-cal-event-time">${ev.startStr} ~ ${ev.endStr}</span>
        </div>
      `).join('');
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

        <div class="news-calendar-events-box">
          <div class="news-cal-box-title-row">
            <div class="news-cal-box-title-left">
              <span class="news-cal-box-heading">${selectedDateStr} ${isEN ? 'Active Events' : '進行中的活動與禮包'}</span>
              <span class="news-cal-box-count">${selectedDateEvents.length} ${isEN ? 'items' : '項'}</span>
            </div>
            <button type="button" class="news-cal-filter-ongoing-btn ${filterOnlyOngoing ? 'active' : ''}" title="${isEN ? 'Filter card list below to currently ongoing events' : '在下方卡片列表展示所有正在進行的活動'}">
              ${filterOnlyOngoing ? (isEN ? '✕ Reset Cards' : '✕ 還原全部卡片') : (isEN ? 'Show in Cards' : '在下方展示進行中活動')}
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
  function initCategoryTags() {
    if (!newsCategoryContainer) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const labels = {
      ALL: isEN ? 'All' : '全部消息',
      event: isEN ? 'Events' : '活動企劃',
      update: isEN ? 'Updates' : '版本更新',
      maintenance: isEN ? 'Maintenance' : '維護公告',
      notice: isEN ? 'Notices' : '重要通知'
    };

    // 計算各分類數量
    const counts = { ALL: allNews.length };
    CATEGORY_MAP.slice(1).forEach(cat => {
      counts[cat.key] = allNews.filter(n => n.badge_key === cat.key).length;
    });

    newsCategoryContainer.innerHTML = CATEGORY_MAP.map(cat => {
      const active = cat.key === currentCategory ? 'active' : '';
      const count = counts[cat.key] || 0;
      return `
        <button type="button" class="news-tag-btn ${active}" data-cat="${cat.key}">
          <span>${labels[cat.key] || cat.label}</span>
          <span class="news-tag-count">${count}</span>
        </button>
      `;
    }).join('');

    if (!newsCategoryContainer._hasListener) {
      newsCategoryContainer._hasListener = true;
      newsCategoryContainer.addEventListener('click', e => {
        const btn = e.target.closest('.news-tag-btn');
        if (btn) {
          currentCategory = btn.getAttribute('data-cat');
          newsCategoryContainer.querySelectorAll('.news-tag-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderNews();
        }
      });
    }
  }

  /* ─── 初始化搜尋功能與一鍵清空 ─────────────────────────── */
  function updateClearBtn() {
    if (!newsSearchInput) return;
    if (typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
      window.updateSearchInputHighlight(newsSearchInput, newsSearchClear);
    } else if (newsSearchClear) {
      newsSearchClear.style.display = newsSearchInput.value.trim() ? 'flex' : 'none';
    }
  }

  function initSearch() {
    if (!newsSearchInput) return;

    newsSearchInput.addEventListener('input', e => {
      searchQuery = e.target.value.trim().toLowerCase();
      updateClearBtn();
      renderNews();
    });

    if (newsSearchClear) {
      newsSearchClear.addEventListener('click', () => {
        newsSearchInput.value = '';
        searchQuery = '';
        updateClearBtn();
        newsSearchInput.focus();
        renderNews();
      });
    }
  }

  /* ─── 篩選新聞清單 ───────────────────────────────────── */
  function getFilteredNews() {
    const ganttData = parseEventTimeline(allNews);
    const selectedDayStart = new Date(calCurrentYear, calCurrentMonth, calSelectedDay, 0, 0, 0);
    const selectedDayEnd = new Date(calCurrentYear, calCurrentMonth, calSelectedDay, 23, 59, 59);
    const ongoingEventIds = new Set(
      ganttData.filter(ev => ev.startDate <= selectedDayEnd && ev.endDate >= selectedDayStart).map(ev => ev.id)
    );

    return allNews.filter(item => {
      // 0. 若啟用了「只在下方展示進行中活動」
      if (filterOnlyOngoing && !ongoingEventIds.has(item.id)) {
        return false;
      }
      // 1. 分類過濾
      if (currentCategory !== 'ALL' && item.badge_key !== currentCategory) {
        return false;
      }
      // 2. 關鍵字搜尋（標題、英文標題、簡述、重點項目、預覽、日期）
      if (searchQuery) {
        const titleMatch = (item.title || '').toLowerCase().includes(searchQuery);
        const titleEnMatch = (item.title_en || '').toLowerCase().includes(searchQuery);
        const overviewMatch = (item.overview || '').toLowerCase().includes(searchQuery);
        const highlightsMatch = (item.highlights || []).some(h => h.toLowerCase().includes(searchQuery));
        const dateMatch = (item.date || '').includes(searchQuery);
        const contentMatch = (item.content_preview || '').toLowerCase().includes(searchQuery);
        if (!titleMatch && !titleEnMatch && !overviewMatch && !highlightsMatch && !dateMatch && !contentMatch) {
          return false;
        }
      }
      return true;
    });
  }

  /* ─── 渲染新聞列表 (折疊式 Accordion 卡片) ─────────────── */
  function renderNews() {
    if (!newsListContainer) return;
    const filtered = getFilteredNews();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // 隱藏統計數量列
    if (newsCountBadge) {
      newsCountBadge.style.display = 'none';
    }

    if (filtered.length === 0) {
      newsListContainer.innerHTML = `
        <div class="empty-state" style="padding: 50px 20px; text-align: center;">
          <div style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">${isEN ? 'No matching news or updates found' : '找不到符合的新聞或公告'}</div>
          <div style="font-size: 13px; color: var(--text-muted);">${isEN ? 'Try different keywords or switch to the "All" category.' : '請嘗試更換搜尋關鍵字，或切換至「全部消息」分類。'}</div>
        </div>
      `;
      return;
    }

    newsListContainer.innerHTML = filtered.map((item, index) => {
      const isExpanded = expandedMap.has(item.id);
      const isLatest = index === 0 && currentCategory === 'ALL' && !searchQuery;

      // 新登場寶可夢 / 焦點寶可夢頂部橫條
      let debutBannerHTML = '';
      if (item.debut_pokemon && item.debut_pokemon.length > 0) {
        debutBannerHTML = `
          <div class="news-debut-banner">
            <span class="news-debut-label">${isEN ? 'Debut: ' : '新登場：'}</span>
            <div class="news-poke-pill-group">
              ${item.debut_pokemon.map(p => {
                const pName = (isEN && window.I18N && typeof window.I18N.getPokemonName === 'function') ? window.I18N.getPokemonName(p) : p;
                return `<span class="news-poke-pill-new">${escapeHtml(pName)}</span>`;
              }).join('')}
            </div>
          </div>
        `;
      } else if (item.featured_pokemon && item.featured_pokemon.length > 0 && item.badge_key === 'event') {
        debutBannerHTML = `
          <div class="news-featured-banner">
            <span class="news-featured-label">${isEN ? 'Focus: ' : '焦點：'}</span>
            <div class="news-poke-pill-group">
              ${item.featured_pokemon.map(p => {
                const pName = (isEN && window.I18N && typeof window.I18N.getPokemonName === 'function') ? window.I18N.getPokemonName(p) : p;
                return `<span class="news-poke-pill-featured">${escapeHtml(pName)}</span>`;
              }).join('')}
            </div>
          </div>
        `;
      }

      // 渲染多維度 AI 智能摘要區塊 (Sections - 極簡純淨無邊框排版)
      let aiSectionsHTML = '';
      if (item.sections && item.sections.length > 0) {
        aiSectionsHTML = `
          <div class="news-ai-dashboard">
            <div class="news-ai-sections-grid">
              ${item.sections.map(sec => {
                let secTitle = isEN ? (sec.title_en || sec.title) : sec.title;
                const secItems = isEN && sec.items_en ? sec.items_en : sec.items;
                const cleanTitle = (secTitle || '').replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+/u, '').replace(/^[^\w\u4e00-\u9fa5\s]+/, '').trim();
                return `
                <div class="news-ai-section-box news-sec-${sec.key || 'general'}">
                  <div class="news-ai-section-title">
                    <span>${escapeHtml(cleanTitle)}</span>
                  </div>
                  <ul class="news-ai-section-list">
                    ${secItems.map(it => `<li>${formatAiListItem(it, item)}</li>`).join('')}
                  </ul>
                </div>
              `;}).join('')}
            </div>
          </div>
        `;
      } else if (item.highlights && item.highlights.length > 0) {
        const highlightsList = isEN && item.highlights_en ? item.highlights_en : item.highlights;
        aiSectionsHTML = `
          <div class="news-ai-highlights">
            <ul class="news-ai-list">
              ${highlightsList.map(h => `<li>${formatAiListItem(h, item)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      const categoryLabels = {
        event: isEN ? 'Event' : '活動企劃',
        update: isEN ? 'Update' : '版本更新',
        maintenance: isEN ? 'Maintenance' : '維護公告',
        notice: isEN ? 'Notice' : '重要通知'
      };

      const displayTitle = isEN ? (item.title_en || item.title) : item.title;
      const displayOverview = isEN ? (item.overview_en || item.overview) : item.overview;

      return `
        <article class="news-card news-accordion-card ${isExpanded ? 'expanded' : ''} ${isLatest ? 'news-card-featured' : ''}" id="news-${item.id}" data-id="${item.id}">
          <div class="news-card-header-meta">
            <div class="news-meta-left">
              <span class="news-date-badge">${item.date}</span>
              <span class="news-badge news-badge-${item.badge_key || 'notice'}" style="--badge-color:${item.badge_color || '#8b5cf6'};">
                ${categoryLabels[item.badge_key] || item.badge_label || item.category || (isEN ? 'Notice' : '公告')}
              </span>
              ${isLatest ? '<span class="news-latest-tag">NEW</span>' : ''}
            </div>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-official-link-btn" onclick="event.stopPropagation()">
              <span>${isEN ? 'Official ↗' : '官方原文 ↗'}</span>
            </a>
          </div>

          <h3 class="news-card-title">
            <span>${escapeHtml(displayTitle)}</span>
          </h3>

          ${debutBannerHTML}

          <p class="news-overview-text">${escapeHtml(displayOverview || '')}</p>

          <div class="news-accordion-body">
            ${aiSectionsHTML}
          </div>
        </article>
      `;
    }).join('');

    // 點選整個卡片直接展開與隱藏
    newsListContainer.querySelectorAll('.news-accordion-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('a') || e.target.closest('button')) {
          return;
        }
        const id = card.getAttribute('data-id');
        if (expandedMap.has(id)) {
          expandedMap.delete(id);
          card.classList.remove('expanded');
        } else {
          expandedMap.add(id);
          card.classList.add('expanded');
        }
      });
    });
  }

  /* ─── 關鍵字高亮格式化 ─────────────────────────────────── */
  const ISLAND_MAP = {
    '萌綠之島EX': 'Greengrass Isle EX',
    '萌綠之島': 'Greengrass Isle',
    '天青沙灘EX': 'Cyan Beach EX',
    '天青沙灘': 'Cyan Beach',
    '灰褐洞窟': 'Taupe Hollow',
    '白花雪原': 'Snowdrop Tundra',
    '寶藍湖畔': 'Lapis Lakeside',
    '黃金舊發電廠': 'Old Gold Power Plant',
    '琥褐溪谷': 'Amber Canyon'
  };

  const GAME_ITEM_TRANSLATIONS = {
    '寶可沙布蕾': 'Poké Biscuit',
    '超級沙布蕾': 'Great Biscuit',
    '高級沙布蕾': 'Ultra Biscuit',
    '大師沙布蕾': 'Master Biscuit',
    '主技能種子': 'Main Skill Seed',
    '副技能種子': 'Sub Skill Seed',
    '萬能糖果S': 'Handy Candy S',
    '萬能糖果M': 'Handy Candy M',
    '萬能糖果L': 'Handy Candy L',
    '萬能糖果': 'Handy Candy',
    '夢之塊S': 'Dream Cluster S',
    '夢之塊M': 'Dream Cluster M',
    '夢之塊L': 'Dream Cluster L',
    '夢之塊': 'Dream Cluster',
    '友好薰香': 'Friend Incense',
    '專用薰香': 'Specific Incense',
    '鑽石': 'Diamonds',
    '睡眠點數': 'Sleep Points',
    '幫手哨子': 'Helper Whistle',
    '好的營地套票': 'Good Camp Ticket',
    '露營券': 'Good Camp Ticket',
    '能量枕頭': 'Energy Pillow',
    '寶可夢的糖果': 'Pokémon Candy',
    '寶可夢糖果': 'Pokémon Candy',
    '睡意之力': 'Drowsy Power',
    '睡眠經驗值': 'Sleep EXP',
    '睡眠EXP': 'Sleep EXP',
    '幫忙速度': 'Helping Speed',
    '主技能發動機率': 'Main Skill Trigger Rate',
    '技能機率': 'Skill Trigger Rate',
    '食材發現率': 'Ingredient Finding Rate',
    '食材機率': 'Ingredient Rate',
    '料理能量': 'Cooking Strength',
    '料理效果': 'Cooking Bonus'
  };

  const GAME_PHRASE_RULES = [
    // 禮包名稱模式
    [/「(.+?)同樂包([SML])?」/g, '"$1 Celebration Bundle$2"'],
    [/「(.+?)培育包([SML])?」/g, '"$1 Growth Bundle$2"'],
    [/「(.+?)紀念包([SML])?」/g, '"$1 Commemorative Bundle$2"'],
    [/「(.+?)限定包([SML])?」/g, '"$1 Limited Bundle$2"'],
    [/「(.+?)包([SML])?」/g, '"$1 Pack$2"'],
    [/夏日嘉年華(\d*)/g, 'Summer Festival $1'],
    [/嘉年華(\d*)/g, 'Festival $1'],
    [/週年紀念/g, 'Anniversary '],
    [/電屬性/g, 'Electric Type '],
    [/水屬性/g, 'Water Type '],
    [/火屬性/g, 'Fire Type '],
    [/草屬性/g, 'Grass Type '],
    [/滿月/g, 'Good Sleep Day '],
    [/萬聖節/g, 'Halloween '],
    [/佳節/g, 'Holiday '],
    [/新年/g, 'New Year '],
    [/第(\d+)回/g, 'Vol. $1'],

    // 禮包文案與活動說明
    [/本商品裡裝有\s*專門迎接\s*(.+?)\s*成為夥伴並且培育牠的道具\s*，?\s*歡迎選購。?/g, 'Contains special items to help you befriend and raise $1.'],
    [/在\s*(.+?)\s*會出現的營地使用薰香，與牠相遇吧！?/g, 'Use incense in areas where $1 appears to encounter it!'],
    [/銷售期間\s*:\s*|販售期間\s*:\s*|活動期間\s*:\s*/g, 'Sale Period: '],
    [/限購(\d+)個|限購(\d+)次/g, 'Limit: $1 per user'],

    // 糖果與特殊形態通用說明
    [/※此道具與「寶可夢的糖果」相同，對道具名稱中所標示的寶可夢的不同樣子，以及(.+?)等有著特別裝扮的寶可夢也可使用。?/g, '※This item functions the same as Pokémon Candy and can also be used on different forms and special costume Pokémon (such as $1).'],

    // 更新與功能公告
    [/新增功能\s*:\s*|新增機能\s*:\s*/g, 'New Feature: '],
    [/問題修正\s*:\s*|異常修復\s*:\s*/g, 'Bug Fixes: '],
    [/平衡調整\s*:\s*/g, 'Balance Adjustments: '],
    [/的長期開發計畫/g, 'Ongoing long-term development roadmap'],
    [/透過此功能，玩家將\s*能獲得包含主技能種子在內的各種道具\s*。?/g, 'Through this feature, players will be able to obtain various items including Main Skill Seeds.'],
    [/此外，自下週起全新的「主技能種子」將會登場。?/g, 'In addition, brand-new Main Skill Seeds will debut starting next week.'],
    [/各寶可夢專用的新「主技能種子」/g, 'New Pokémon-specific Main Skill Seeds'],
    [/各寶可夢專用的全新「主技能種子」將自\s*(.+?)\s*起登場。?/g, 'Brand-new Pokémon-specific Main Skill Seeds will debut starting $1.'],
    [/的薰香/g, ' Incense'],
    [/的糖果/g, ' Candy']
  ];

  /* ─── 關鍵字高亮與雙語格式化 ─────────────────────────────────── */
  function formatAiListItem(text, item) {
    if (!text) return '';
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
    let processed = String(text);

    // 移除所有 Emoji 字符
    processed = processed.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}✨🔥⭐🛍️⏰⚡🏝️💡⚙️🍬🦄📢📌📅🔍🏖️🤖]/gu, '').trim();

    if (isEN) {
      // 0. 優先調用中央 I18N 動態翻譯引擎 (單一來源規範)
      if (window.I18N && typeof window.I18N.translateDynamicText === 'function') {
        processed = window.I18N.translateDynamicText(processed);
      }

      // 1. 執行語句與通用模式替換
      GAME_PHRASE_RULES.forEach(([regex, repl]) => {
        processed = processed.replace(regex, repl);
      });

      // 2. 翻譯營地 / 島嶼名稱
      Object.keys(ISLAND_MAP).forEach(cn => {
        if (processed.includes(cn)) {
          processed = processed.replaceAll(cn, ISLAND_MAP[cn]);
        }
      });

      // 3. 翻譯遊戲道具與單位
      Object.keys(GAME_ITEM_TRANSLATIONS).forEach(cn => {
        if (processed.includes(cn)) {
          processed = processed.replaceAll(cn, GAME_ITEM_TRANSLATIONS[cn]);
        }
      });

      // 4. 翻譯寶可夢名稱 (長度由長至短依序取代，避免部分覆蓋)
      if (window.I18N && window.I18N.POKEMON_NAMES) {
        const pkmNames = Object.keys(window.I18N.POKEMON_NAMES).sort((a, b) => b.length - a.length);
        pkmNames.forEach(cn => {
          if (processed.includes(cn)) {
            processed = processed.replaceAll(cn, window.I18N.POKEMON_NAMES[cn]);
          }
        });
      }

      // 5. 標點符號與常見標籤規格化 (無 Emoji)
      processed = processed
        .replaceAll('、', ', ')
        .replaceAll('：', ': ')
        .replaceAll('；', '; ')
        .replaceAll('【機率中幅提升】', '【Greater Appearance Rate】')
        .replaceAll('【機率大幅提升】', '【Significantly Greater Appearance Rate】')
        .replaceAll('【機率小幅提升】', '【Slightly Greater Appearance Rate】')
        .replaceAll('【新登場】', '【New Debut】')
        .replaceAll('【各營地出現寶可夢一覽】', '【Featured Pokémon by Area】')
        .replaceAll('【活動時間】', '【Event Period】')
        .replaceAll('【活動營地】', '【Event Areas】')
        .replaceAll('【特別任務】', '【Special Missions】')
        .replaceAll('【活動禮包】', '【Event Bundles】')
        .replaceAll('【禮包內容】', '【Bundle Contents】')
        .replaceAll('【販售期間】', '【Sale Period】')
        .replaceAll('【注意事項】', '【Important Notes】')
        .replaceAll('【平衡調整】', '【Balance Adjustments】')
        .replaceAll('【機能追加】', '【New Features】')
        .replaceAll('【異常修復】', '【Bug Fixes】')
        .replaceAll('【更新維護】', '【Maintenance】')
        .replaceAll('【限定任務】', '【Limited-Time Missions】');
    }

    let formatted = escapeHtml(processed);

    // 1. 機率分級標題高亮 (無 Emoji)
    formatted = formatted.replace(/【\s*(?:機率中幅提升|Greater Appearance Rate)(?:\s*新登場\/焦點)?\s*】/g, '<span class="hl-rateup-mid">【' + (isEN ? 'Greater Appearance Rate' : '機率中幅提升 新登場/焦點') + '】</span>');
    formatted = formatted.replace(/【\s*(?:機率大幅提升|Significantly Greater Appearance Rate)(?:\s*超絕UP)?\s*】/g, '<span class="hl-rateup-large">【' + (isEN ? 'Significantly Greater Appearance Rate' : '機率大幅提升 超絕UP') + '】</span>');
    formatted = formatted.replace(/【\s*(?:機率小幅提升|Slightly Greater Appearance Rate)\s*】/g, '<span class="hl-rateup-small">【' + (isEN ? 'Slightly Greater Appearance Rate' : '機率小幅提升') + '】</span>');
    formatted = formatted.replace(/【\s*(?:新登場|New Debut)\s*】/g, '<span class="hl-rateup-mid">【' + (isEN ? 'New Debut' : '新登場') + '】</span>');

    // 2. 新登場 / 機率中幅提升寶可夢高亮（無 Emoji）
    const debutList = item.debut_pokemon || [];
    debutList.forEach(name => {
      if (!name) return;
      const displayName = (isEN && window.I18N && typeof window.I18N.getPokemonName === 'function') ? window.I18N.getPokemonName(name) : name;
      const re = new RegExp(escapeRegExp(displayName), 'g');
      formatted = formatted.replace(re, `<span class="hl-poke-new">${displayName}</span>`);
    });

    // 3. 焦點 / 機率提升寶可夢高亮（無 Emoji）
    const featList = item.featured_pokemon || [];
    featList.forEach(name => {
      if (!name || debutList.includes(name)) return;
      const displayName = (isEN && window.I18N && typeof window.I18N.getPokemonName === 'function') ? window.I18N.getPokemonName(name) : name;
      const re = new RegExp(escapeRegExp(displayName), 'g');
      formatted = formatted.replace(re, `<span class="hl-poke-feat">${displayName}</span>`);
    });

    // 4. 關鍵倍率與數值高亮 (如 1.25倍, 2.5x, +1,000pt, 1,200鑽石, 3,000鑽石, 250鑽石, 1,200 Diamonds)
    formatted = formatted.replace(/([1-4](?:\.\d+)?(?:倍|x)|\+\d{1,3}(?:[,，]\d{3})*pt|(?:\d{1,3}(?:[,，]\d{3})+|\d+)\s*(?:鑽石|Diamonds))/gi, '<span class="hl-mult">$1</span>');

    // 5. 島嶼 / 營地名稱高亮 (無 Emoji)
    formatted = formatted.replace(/(Greengrass Isle EX|Greengrass Isle|Cyan Beach EX|Cyan Beach|Taupe Hollow|Snowdrop Tundra|Lapis Lakeside|Old Gold Power Plant|Amber Canyon|萌綠之島EX|天青沙灘EX|萌綠之島|天青沙灘|灰褐洞窟|白花雪原|寶藍湖畔|黃金舊發電廠|琥褐溪谷)/g, '<span class="hl-island">$1</span>');

    return formatted;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ─── XSS 防護 ───────────────────────────────────────── */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 初始化載入新聞
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadNews);
    } else {
      loadNews();
    }
  }

  // 暴露全域刷新介面（如從同步完成後觸發）
  if (typeof window !== 'undefined') {
    window.refreshNews = loadNews;
    window.PokemonNewsApp = {
      loadNews,
      parseEventTimeline
    };
    window.NewsApp = {
      render: function() {
        initCategoryTags();
        renderNews();
        renderEventTimeline();
      }
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PokemonNewsApp: typeof window !== 'undefined' ? window.PokemonNewsApp : { parseEventTimeline },
      parseEventTimeline
    };
  }
})();
