  function initCategoryTags() {
    if (!newsCategoryContainer) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';
    const labels = {
      ALL: isEN ? 'All' : (isCN ? '全部消息' : '全部消息'),
      event: isEN ? 'Events' : (isCN ? '活动企划' : '活動企劃'),
      update: isEN ? 'Updates' : (isCN ? '版本更新' : '版本更新'),
      maintenance: isEN ? 'Maintenance' : (isCN ? '维护公告' : '維護公告'),
      notice: isEN ? 'Notices' : (isCN ? '重要通知' : '重要通知')
    };

    // 計算各分類數量 (單次遍歷 O(N))
    const counts = { ALL: allNews.length, event: 0, update: 0, maintenance: 0, notice: 0 };
    for (let i = 0; i < allNews.length; i++) {
      const bk = allNews[i].badge_key;
      if (bk && counts[bk] !== undefined) counts[bk]++;
    }

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
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';

    // 隱藏統計數量列
    if (newsCountBadge) {
      newsCountBadge.style.display = 'none';
    }

    if (filtered.length === 0) {
      newsListContainer.innerHTML = `
        <div class="empty-state" style="padding: 50px 20px; text-align: center;">
          <div style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">${isEN ? 'No matching news or updates found' : (isCN ? '找不到符合的新闻或公告' : '找不到符合的新聞或公告')}</div>
          <div style="font-size: 13px; color: var(--text-muted);">${isEN ? 'Try different keywords or switch to the "All" category.' : (isCN ? '请尝试更换搜索关键字，或切换至“全部消息”分类。' : '請嘗試更換搜尋關鍵字，或切換至「全部消息」分類。')}</div>
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
            <span class="news-debut-label">${isEN ? 'Debut: ' : (isCN ? '新登场：' : '新登場：')}</span>
            <div class="news-poke-pill-group">
              ${item.debut_pokemon.map(p => {
                let pName = (isEN && window.I18N && typeof window.I18N.getPokemonName === 'function') ? window.I18N.getPokemonName(p) : p;
                if (isCN && window.I18N && typeof window.I18N.toSimplified === 'function') pName = window.I18N.toSimplified(pName);
                return `<span class="news-poke-pill-new">${escapeHtml(pName)}</span>`;
              }).join('')}
            </div>
          </div>
        `;
      } else if (item.featured_pokemon && item.featured_pokemon.length > 0 && item.badge_key === 'event') {
        debutBannerHTML = `
          <div class="news-featured-banner">
            <span class="news-featured-label">${isEN ? 'Focus: ' : (isCN ? '焦点：' : '焦點：')}</span>
            <div class="news-poke-pill-group">
              ${item.featured_pokemon.map(p => {
                let pName = (isEN && window.I18N && typeof window.I18N.getPokemonName === 'function') ? window.I18N.getPokemonName(p) : p;
                if (isCN && window.I18N && typeof window.I18N.toSimplified === 'function') pName = window.I18N.toSimplified(pName);
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
                if (isCN && window.I18N && typeof window.I18N.toSimplified === 'function') {
                  secTitle = window.I18N.toSimplified(secTitle);
                }
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
        event: isEN ? 'Event' : (isCN ? '活动企划' : '活動企劃'),
        update: isEN ? 'Update' : (isCN ? '版本更新' : '版本更新'),
        maintenance: isEN ? 'Maintenance' : (isCN ? '维护公告' : '維護公告'),
        notice: isEN ? 'Notice' : (isCN ? '重要通知' : '重要通知')
      };

      let displayTitle = isEN ? (item.title_en || item.title) : item.title;
      let displayOverview = isEN ? (item.overview_en || item.overview) : item.overview;
      if (isCN && window.I18N && typeof window.I18N.toSimplified === 'function') {
        displayTitle = window.I18N.toSimplified(displayTitle);
        displayOverview = window.I18N.toSimplified(displayOverview);
      }

      const isEvent = item.badge_key === 'event' || (item.title && (item.title.includes('活動') || item.title.includes('企畫') || item.title.includes('企劃') || item.title.includes('快照') || item.title.includes('新月日') || item.title.includes('好眠日') || item.title.includes('秘境') || item.title.includes('超夢') || item.title.includes('夢幻') || item.title.includes('任務')));
      const isPack = (item.title && (item.title.includes('包') || item.title.includes('限定包') || item.title.includes('培育包') || item.title.includes('同樂包') || item.title.includes('紀念包')));
      const schedule = (isEvent || isPack) ? extractEventSchedule(item) : null;

      let timeStatus = null; // 'expired' | 'ongoing' | 'upcoming'
      if (schedule) {
        const now = new Date();
        if (now > schedule.endDate) {
          timeStatus = 'expired';
        } else if (now < schedule.startDate) {
          timeStatus = 'upcoming';
        } else {
          timeStatus = 'ongoing';
        }
      }

      let statusBadgeHTML = '';
      if (timeStatus === 'expired') {
        statusBadgeHTML = `<span class="news-status-badge status-expired">${isEN ? 'EXPIRED' : (isCN ? '已结束' : '已結束')}</span>`;
      } else if (timeStatus === 'ongoing') {
        statusBadgeHTML = `<span class="news-status-badge status-ongoing">${isEN ? 'ONGOING' : (isCN ? '进行中' : '進行中')}</span>`;
      } else if (timeStatus === 'upcoming') {
        statusBadgeHTML = `<span class="news-status-badge status-upcoming">${isEN ? 'UPCOMING' : (isCN ? '即将开始' : '即將開始')}</span>`;
      }

      const badgeLabelText = categoryLabels[item.badge_key] || (isCN && window.I18N && typeof window.I18N.toSimplified === 'function' ? window.I18N.toSimplified(item.badge_label || item.category) : (item.badge_label || item.category)) || (isEN ? 'Notice' : '公告');

      return `
        <article class="news-card news-accordion-card ${isExpanded ? 'expanded' : ''} ${isLatest ? 'news-card-featured' : ''} ${timeStatus === 'expired' ? 'is-expired' : ''}" id="news-${item.id}" data-id="${item.id}">
          <div class="news-card-header-meta">
            <div class="news-meta-left">
              <span class="news-date-badge">${item.date}</span>
              <span class="news-badge news-badge-${item.badge_key || 'notice'}" style="--badge-color:${item.badge_color || '#8b5cf6'};">
                ${badgeLabelText}
              </span>
              ${statusBadgeHTML}
              ${isLatest ? '<span class="news-latest-tag">NEW</span>' : ''}
            </div>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-official-link-btn" onclick="event.stopPropagation()">
              <span>${isEN ? 'Official ↗' : (isCN ? '官方原文 ↗' : '官方原文 ↗')}</span>
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
    '拉碧絲湖畔': 'Lapis Lakeside',
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

  const ISLAND_MAP_ENTRIES = Object.entries(ISLAND_MAP);
  const GAME_ITEM_ENTRIES = Object.entries(GAME_ITEM_TRANSLATIONS);
  let _sortedNewsPkmNames = null;

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
    const isCN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'zh-CN';
    let processed = String(text);

    // 移除所有 Emoji 字符
    processed = processed.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '').trim();

    if (isCN && window.I18N && typeof window.I18N.toSimplified === 'function') {
      processed = window.I18N.toSimplified(processed);
    }

    if (isEN) {
      // 0. 優先調用中央 I18N 動態翻譯引擎 (單一來源規範)
      if (window.I18N && typeof window.I18N.translateDynamicText === 'function') {
        processed = window.I18N.translateDynamicText(processed);
      }

      // 1. 執行語句與通用模式替換
      for (let i = 0; i < GAME_PHRASE_RULES.length; i++) {
        processed = processed.replace(GAME_PHRASE_RULES[i][0], GAME_PHRASE_RULES[i][1]);
      }

      // 2. 翻譯營地 / 島嶼名稱
      for (let i = 0; i < ISLAND_MAP_ENTRIES.length; i++) {
        const cn = ISLAND_MAP_ENTRIES[i][0];
        if (processed.includes(cn)) {
          processed = processed.replaceAll(cn, ISLAND_MAP_ENTRIES[i][1]);
        }
      }

      // 3. 翻譯遊戲道具與單位
      for (let i = 0; i < GAME_ITEM_ENTRIES.length; i++) {
        const cn = GAME_ITEM_ENTRIES[i][0];
        if (processed.includes(cn)) {
          processed = processed.replaceAll(cn, GAME_ITEM_ENTRIES[i][1]);
        }
      }

      // 4. 翻譯寶可夢名稱 (長度由長至短依序取代，避免部分覆蓋)
      if (window.I18N && window.I18N.POKEMON_NAMES) {
        if (!_sortedNewsPkmNames) {
          _sortedNewsPkmNames = Object.keys(window.I18N.POKEMON_NAMES).sort((a, b) => b.length - a.length);
        }
        const pkmMap = window.I18N.POKEMON_NAMES;
        for (let i = 0; i < _sortedNewsPkmNames.length; i++) {
          const cn = _sortedNewsPkmNames[i];
          if (processed.includes(cn)) {
            processed = processed.replaceAll(cn, pkmMap[cn]);
          }
        }
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
      if (formatted.includes(displayName)) {
        formatted = formatted.replaceAll(displayName, `<span class="hl-poke-new">${displayName}</span>`);
      }
    });

    // 3. 焦點 / 機率提升寶可夢高亮（無 Emoji）
    const featList = item.featured_pokemon || [];
    featList.forEach(name => {
      if (!name || debutList.includes(name)) return;
      const displayName = (isEN && window.I18N && typeof window.I18N.getPokemonName === 'function') ? window.I18N.getPokemonName(name) : name;
      if (formatted.includes(displayName)) {
        formatted = formatted.replaceAll(displayName, `<span class="hl-poke-feat">${displayName}</span>`);
      }
    });

    // 4. 關鍵倍率與數值高亮 (如 1.25倍, 2.5x, +1,000pt, 1,200鑽石, 3,000鑽石, 250鑽石, 1,200 Diamonds)
    formatted = formatted.replace(/([1-4](?:\.\d+)?(?:倍|x)|\+\d{1,3}(?:[,，]\d{3})*pt|(?:\d{1,3}(?:[,，]\d{3})+|\d+)\s*(?:鑽石|Diamonds))/gi, '<span class="hl-mult">$1</span>');

    // 5. 島嶼 / 營地名稱高亮 (無 Emoji)
    formatted = formatted.replace(/(Greengrass Isle EX|Greengrass Isle|Cyan Beach EX|Cyan Beach|Taupe Hollow|Snowdrop Tundra|Lapis Lakeside|Old Gold Power Plant|Amber Canyon|萌綠之島EX|天青沙灘EX|萌綠之島|天青沙灘|灰褐洞窟|白花雪原|拉碧絲湖畔|寶藍湖畔|黃金舊發電廠|琥褐溪谷)/g, '<span class="hl-island">$1</span>');

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
