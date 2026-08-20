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
    { key: 'ALL', label: '全部消息', emoji: '📰' },
    { key: 'event', label: '活動企劃', emoji: '🏆' },
    { key: 'update', label: '版本更新', emoji: '⚙️' },
    { key: 'maintenance', label: '維護公告', emoji: '🔧' },
    { key: 'notice', label: '重要通知', emoji: '📢' }
  ];

  /* ─── 載入新聞資料 ───────────────────────────────────── */
  async function loadNews() {
    try {
      let res;
      try {
        res = await fetch(`data/news.json?t=${Date.now()}`, { cache: 'no-store' });
      } catch (e) {}
      if (!res || !res.ok) {
        res = await fetch(`news.json?t=${Date.now()}`, { cache: 'no-store' });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      allNews = await res.json();
      renderEventTimeline();
      initCategoryTags();
      initSearch();
      renderNews();
    } catch (err) {
      console.error('Failed to load news.json:', err);
      if (newsListContainer) {
        newsListContainer.innerHTML = `
          <div class="empty-state" style="padding: 40px 20px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 12px;">⚠️</div>
            <div style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">新聞資料載入中或暫時無法讀取</div>
            <div style="font-size: 13px; color: var(--text-muted);">請稍後重整頁面，或點擊頂部「同步資料」更新最新官方新聞。</div>
          </div>
        `;
      }
    }
  }

  /* ─── 📅 官方活動與禮包甘特圖時程 (Gantt Schedule Timeline) ─── */
  function extractEventSchedule(item) {
    let text = '';
    if (item.sections) {
      const s = item.sections.find(sec => sec.key === 'schedule' || sec.key === 'shop');
      if (s && s.items) text = s.items.join(' ');
    }
    if (!text && item.highlights) text = item.highlights.join(' ');
    if (!text) text = item.content_preview || '';

    const m = text.match(/(?:2026\/)?(\d{1,2})\/(\d{1,2})(?:\s*\([^\)]+\))?\s*(?:(\d{1,2}):(\d{2}))?\s*～\s*(?:2026\/)?(\d{1,2})\/(\d{1,2})(?:\s*\([^\)]+\))?\s*(?:(\d{1,2}):(\d{2}))?/);
    if (m) {
      const startM = parseInt(m[1], 10), startD = parseInt(m[2], 10), startH = m[3] ? m[3].padStart(2, '0') : '04';
      const endM = parseInt(m[5], 10), endD = parseInt(m[6], 10), endH = m[7] ? m[7].padStart(2, '0') : '03';
      return {
        startMonth: startM,
        startDay: startD,
        startHour: startH,
        endMonth: endM,
        endDay: endD,
        endHour: endH,
        startStr: `${String(startM).padStart(2, '0')}-${String(startD).padStart(2, '0')} ${startH}`,
        endStr: `${String(endM).padStart(2, '0')}-${String(endD).padStart(2, '0')} ${endH}`,
        startDate: new Date(2026, startM - 1, startD, parseInt(startH, 10)),
        endDate: new Date(2026, endM - 1, endD, parseInt(endH, 10))
      };
    }
    return null;
  }

  function parseEventTimeline(items) {
    const newsList = items || allNews;
    const ganttItems = [];
    const baseStart = new Date(2026, 7, 7, 0, 0, 0); // 8月7日
    const totalDays = 27;

    newsList.forEach(item => {
      const isEvent = item.badge_key === 'event' || (item.title && item.title.includes('活動')) || (item.title && item.title.includes('企畫'));
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

      let cleanTitle = item.title
        .replace(/【[^】]+】/g, '')
        .replace(/「|」/g, '')
        .replace(/介紹$/g, '')
        .replace(/資訊$/g, '')
        .trim();

      let typeLabel = '活動列表';
      let typeClass = 'gantt-bar-event';
      if (item.title.includes('培育包')) {
        typeLabel = '培育包';
        typeClass = 'gantt-bar-pack';
      } else if (isPack) {
        typeLabel = '活動禮包';
        typeClass = 'gantt-bar-pack';
      }

      ganttItems.push({
        id: item.id,
        title: cleanTitle,
        fullTitle: item.title,
        typeLabel,
        typeClass,
        startStr: schedule.startStr,
        endStr: schedule.endStr,
        startCol,
        spanCols,
        startDate: schedule.startDate,
        endDate: schedule.endDate
      });
    });

    return ganttItems.sort((a, b) => {
      if (a.typeClass !== b.typeClass) {
        return a.typeClass === 'gantt-bar-event' ? -1 : 1;
      }
      return a.startDate - b.startDate;
    });
  }

  function renderEventTimeline() {
    if (!newsTimelineContainer) return;
    const ganttData = parseEventTimeline(allNews);
    if (ganttData.length === 0) {
      newsTimelineContainer.style.display = 'none';
      return;
    }

    newsTimelineContainer.style.display = 'block';

    // 建立 8/7 ~ 9/2 共 27 天的日期標題
    const dayCols = [];
    const todayIndex = 10; // 8/16 (從 8/7 起算第 10 天)

    for (let d = 7; d <= 31; d++) {
      const dateObj = new Date(2026, 7, d);
      const dayOfWeek = dateObj.getDay(); // 0: Sun, 6: Sat
      const isToday = d === 16;
      let dayClass = 'gantt-day-normal';
      if (dayOfWeek === 6) dayClass = 'gantt-day-sat';
      else if (dayOfWeek === 0) dayClass = 'gantt-day-sun';
      if (isToday) dayClass += ' gantt-day-today';

      dayCols.push({
        label: String(d).padStart(2, '0'),
        month: '2026-08',
        dayClass,
        isToday
      });
    }
    // 9/1, 9/2
    [1, 2].forEach(d => {
      const dateObj = new Date(2026, 8, d);
      const dayOfWeek = dateObj.getDay();
      let dayClass = 'gantt-day-normal';
      if (dayOfWeek === 6) dayClass = 'gantt-day-sat';
      else if (dayOfWeek === 0) dayClass = 'gantt-day-sun';
      dayCols.push({
        label: String(d).padStart(2, '0'),
        month: '2026-09',
        dayClass,
        isToday: false
      });
    });

    newsTimelineContainer.innerHTML = `
      <div class="gantt-wrapper">
        <div class="gantt-top-bar">
          <div class="gantt-title-row">
            <span class="gantt-icon">📅</span>
            <span class="gantt-title">活動與禮包時程</span>
            <div class="gantt-legend">
              <span class="gantt-legend-item"><span class="gantt-dot dot-event"></span> 活動列表</span>
              <span class="gantt-legend-item"><span class="gantt-dot dot-pack"></span> 活動禮包 / 培育包</span>
            </div>
          </div>
          <div class="gantt-hint">💡 點擊任一時程條可快速定位完整公告</div>
        </div>

        <div class="gantt-scroll-container">
          <div class="gantt-chart-grid">
            <!-- 1. 月份標題列 -->
            <div class="gantt-month-row">
              <div class="gantt-month-label" style="grid-column: 1 / span 25;">2026-08</div>
              <div class="gantt-month-label" style="grid-column: 26 / span 2;">2026-09</div>
            </div>

            <!-- 2. 日期刻度列 -->
            <div class="gantt-days-row">
              ${dayCols.map((dc, i) => `
                <div class="gantt-day-cell ${dc.dayClass}" title="${dc.month}-${dc.label}${dc.isToday ? ' (今日)' : ''}">
                  ${dc.label}
                </div>
              `).join('')}
            </div>

            <!-- 3. 今日垂直指示線 -->
            <div class="gantt-today-line" style="grid-column: ${todayIndex};" title="今日 (8/16)"></div>

            <!-- 4. 時程長條 Bars -->
            <div class="gantt-bars-container">
              ${ganttData.map(item => `
                <div class="gantt-bar-row">
                  <div class="gantt-bar ${item.typeClass}"
                       style="grid-column: ${item.startCol} / span ${item.spanCols};"
                       data-event-id="${item.id}"
                       title="${escapeHtml(item.fullTitle)} (${item.startStr} ~ ${item.endStr})">
                    <div class="gantt-bar-time">${item.startStr} ~ ${item.endStr} <span class="gantt-badge">${item.typeLabel}</span></div>
                    <div class="gantt-bar-name">${escapeHtml(item.title)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // 點擊甘特圖時程條跳轉至新聞
    newsTimelineContainer.querySelectorAll('.gantt-bar').forEach(bar => {
      bar.addEventListener('click', () => {
        const evId = bar.getAttribute('data-event-id');
        const targetItem = allNews.find(n => n.id === evId);
        if (targetItem) {
          if (newsSearchInput) {
            newsSearchInput.value = targetItem.title;
            if (newsSearchClear) newsSearchClear.style.display = 'flex';
          }
          searchQuery = targetItem.title.toLowerCase();
          currentCategory = 'ALL';
          if (newsCategoryContainer) {
            newsCategoryContainer.querySelectorAll('.news-tag-btn').forEach(b => {
              b.classList.toggle('active', b.getAttribute('data-cat') === 'ALL');
            });
          }
          renderNews();
          const el = document.getElementById(`news-${evId}`) || newsListContainer;
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
          <span>${cat.emoji} ${labels[cat.key] || cat.label}</span>
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
    if (!newsSearchClear || !newsSearchInput) return;
    newsSearchClear.style.display = newsSearchInput.value.trim() ? 'flex' : 'none';
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
    return allNews.filter(item => {
      // 1. 分類過濾
      if (currentCategory !== 'ALL' && item.badge_key !== currentCategory) {
        return false;
      }
      // 2. 關鍵字搜尋（標題、簡述、重點項目、預覽）
      if (searchQuery) {
        const titleMatch = (item.title || '').toLowerCase().includes(searchQuery);
        const overviewMatch = (item.overview || '').toLowerCase().includes(searchQuery);
        const highlightsMatch = (item.highlights || []).some(h => h.toLowerCase().includes(searchQuery));
        const dateMatch = (item.date || '').includes(searchQuery);
        if (!titleMatch && !overviewMatch && !highlightsMatch && !dateMatch) {
          return false;
        }
      }
      return true;
    });
  }

  /* ─── 渲染新聞列表 ───────────────────────────────────── */
  function renderNews() {
    if (!newsListContainer) return;
    const filtered = getFilteredNews();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // 更新統計數量徽章
    if (newsCountBadge) {
      newsCountBadge.innerHTML = isEN
        ? `Showing <strong>${filtered.length}</strong> / ${allNews.length} news items`
        : `顯示 <strong>${filtered.length}</strong> / ${allNews.length} 則最新消息`;
    }

    if (filtered.length === 0) {
      newsListContainer.innerHTML = `
        <div class="empty-state" style="padding: 50px 20px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
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
            <span class="news-debut-label">${isEN ? '🦄 New Pokémon Debut: ' : '🦄 新登場寶可夢：'}</span>
            <div class="news-poke-pill-group">
              ${item.debut_pokemon.map(p => `<span class="news-poke-pill-new">✨ ${escapeHtml(p)}</span>`).join('')}
            </div>
          </div>
        `;
      } else if (item.featured_pokemon && item.featured_pokemon.length > 0 && item.badge_key === 'event') {
        debutBannerHTML = `
          <div class="news-featured-banner">
            <span class="news-featured-label">${isEN ? '⭐ Featured Pokémon: ' : '⭐ 焦點寶可夢：'}</span>
            <div class="news-poke-pill-group">
              ${item.featured_pokemon.map(p => `<span class="news-poke-pill-featured">🔥 ${escapeHtml(p)}</span>`).join('')}
            </div>
          </div>
        `;
      }

      // 渲染多維度 AI 智能摘要區塊 (Sections)
      let aiSectionsHTML = '';
      if (item.sections && item.sections.length > 0) {
        aiSectionsHTML = `
          <div class="news-ai-dashboard">
            <div class="news-ai-dashboard-header">
              <span class="news-ai-sparkle">🤖</span>
              <span class="news-ai-dashboard-title">${isEN ? 'AI Key Highlights & Insights' : 'AI 智能深度重點整理'}</span>
            </div>
            <div class="news-ai-sections-grid">
              ${item.sections.map(sec => `
                <div class="news-ai-section-box news-sec-${sec.key || 'general'}">
                  <div class="news-ai-section-title">
                    <span>${sec.icon || '📌'}</span>
                    <span>${sec.title}</span>
                  </div>
                  <ul class="news-ai-section-list">
                    ${sec.items.map(it => `<li>${formatAiListItem(it, item)}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (item.highlights && item.highlights.length > 0) {
        aiSectionsHTML = `
          <div class="news-ai-highlights">
            <div class="news-ai-title">
              <span class="news-ai-sparkle">🤖</span>
              <span>${isEN ? 'AI Key Highlights' : 'AI 智能重點萃取'}</span>
            </div>
            <ul class="news-ai-list">
              ${item.highlights.map(h => `<li>${formatAiListItem(h, item)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      const previewHTML = item.content_preview
        ? `
          <div id="preview-${item.id}" class="news-preview-collapse ${isExpanded ? 'expanded' : ''}">
            <div class="news-preview-content">${escapeHtml(item.content_preview).replace(/\n/g, '<br>')}</div>
          </div>
        `
        : '';

      const categoryLabels = {
        event: isEN ? 'Event' : '活動企劃',
        update: isEN ? 'Update' : '版本更新',
        maintenance: isEN ? 'Maintenance' : '維護公告',
        notice: isEN ? 'Notice' : '重要通知'
      };

      return `
        <article class="news-card ${isLatest ? 'news-card-featured' : ''}" data-id="${item.id}">
          <div class="news-card-header">
            <div class="news-meta-left">
              <span class="news-date-badge">📅 ${item.date}</span>
              <span class="news-badge news-badge-${item.badge_key || 'notice'}" style="--badge-color:${item.badge_color || '#8b5cf6'};">
                ${categoryLabels[item.badge_key] || item.badge_label || item.category || (isEN ? 'Notice' : '📢 公告')}
              </span>
              ${isLatest ? '<span class="news-latest-tag">NEW 🔥</span>' : ''}
            </div>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-source-link" title="${isEN ? 'Official Post' : '前往官方公告原文'}">
              <span>${isEN ? 'Official Post' : '官方原文'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>

          <h3 class="news-card-title">
            <a href="${item.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>
          </h3>

          ${debutBannerHTML}

          <p class="news-overview-text">${escapeHtml(item.overview || '')}</p>

          ${aiSectionsHTML}

          ${previewHTML}

          <div class="news-card-footer">
            ${item.content_preview ? `
              <button type="button" class="news-expand-btn ${isExpanded ? 'expanded' : ''}" data-target="${item.id}">
                <span>${isExpanded ? (isEN ? 'Collapse Preview' : '收起預覽') : (isEN ? '📖 Preview Content' : '📖 查看原文預覽')}</span>
                <span class="news-expand-arrow">${isExpanded ? '▲' : '▼'}</span>
              </button>
            ` : '<span></span>'}
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-read-more-btn">
              <span>${isEN ? 'Official Post ↗' : '完整官方公告 ↗'}</span>
            </a>
          </div>
        </article>
      `;
    }).join('');

    // 綁定展開 / 收合按鈕事件
    newsListContainer.querySelectorAll('.news-expand-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-target');
        const previewEl = document.getElementById(`preview-${id}`);
        if (!previewEl) return;

        if (expandedMap.has(id)) {
          expandedMap.delete(id);
          previewEl.classList.remove('expanded');
          btn.classList.remove('expanded');
          btn.querySelector('span:first-child').textContent = isEN ? '📖 Preview Content' : '📖 查看原文預覽';
          btn.querySelector('.news-expand-arrow').textContent = '▼';
        } else {
          expandedMap.add(id);
          previewEl.classList.add('expanded');
          btn.classList.add('expanded');
          btn.querySelector('span:first-child').textContent = isEN ? 'Collapse Preview' : '收起預覽';
          btn.querySelector('.news-expand-arrow').textContent = '▲';
        }
      });
    });
  }

  /* ─── 關鍵字高亮格式化 ─────────────────────────────────── */
  function formatAiListItem(text, item) {
    if (!text) return '';
    let formatted = escapeHtml(text);

    // 1. 機率分級標題高亮（中幅提升通常為新登場焦點）
    formatted = formatted.replace(/【\s*機率中幅提升\s*】/g, '<span class="hl-rateup-mid">【機率中幅提升 🔥 新登場/焦點】</span>');
    formatted = formatted.replace(/【\s*機率大幅提升\s*】/g, '<span class="hl-rateup-large">【機率大幅提升 🌟 超絕UP】</span>');
    formatted = formatted.replace(/【\s*機率小幅提升\s*】/g, '<span class="hl-rateup-small">【機率小幅提升】</span>');
    formatted = formatted.replace(/【\s*新登場\s*】/g, '<span class="hl-rateup-mid">【新登場 ✨】</span>');

    // 2. 新登場 / 機率中幅提升寶可夢高亮（粉紅微光發光標籤）
    const debutList = item.debut_pokemon || [];
    debutList.forEach(name => {
      if (!name) return;
      const re = new RegExp(escapeRegExp(name), 'g');
      formatted = formatted.replace(re, `<span class="hl-poke-new">✨ ${name}</span>`);
    });

    // 3. 焦點 / 機率提升寶可夢高亮（金黃微光標籤）
    const featList = item.featured_pokemon || [];
    featList.forEach(name => {
      if (!name || debutList.includes(name)) return;
      const re = new RegExp(escapeRegExp(name), 'g');
      formatted = formatted.replace(re, `<span class="hl-poke-feat">⭐ ${name}</span>`);
    });

    // 4. 關鍵倍率與數值高亮 (如 1.25倍、2.5倍、3.75倍、2倍、3倍、+1,000pt、250鑽石)
    formatted = formatted.replace(/([1-4](?:\.\d+)?倍|\+\d{1,3}(?:,\d{3})*pt|\d+鑽石)/g, '<span class="hl-mult">$1</span>');

    // 5. 島嶼 / 營地名稱高亮
    formatted = formatted.replace(/(萌綠之島EX|天青沙灘EX|萌綠之島|天青沙灘|灰褐洞窟|白花雪原|寶藍湖畔|黃金舊發電廠|琥褐溪谷)/g, '<span class="hl-island">🏝️ $1</span>');

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
