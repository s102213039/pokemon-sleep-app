  function bindWikiFloatingFabs() {
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    if (!isMobileH5 || typeof window.makeFloatingDraggable !== 'function') return;
    const ladderFab = document.getElementById('ladder-sidebar-bookmark-handle-fab') || document.getElementById('ladder-sidebar-bookmark-handle');
    if (ladderFab && !ladderFab._hasDraggable) {
      ladderFab._hasDraggable = true;
      window.makeFloatingDraggable(ladderFab, () => openLadderSidebar());
    }
    const skillLadderFab = document.getElementById('skill-ladder-sidebar-bookmark-handle');
    if (skillLadderFab && !skillLadderFab._hasDraggable) {
      skillLadderFab._hasDraggable = true;
      window.makeFloatingDraggable(skillLadderFab, () => {
        if (typeof openSkillLadderSidebar === 'function') openSkillLadderSidebar();
        else if (window.WikiDB && typeof window.WikiDB.openSkillLadderSidebar === 'function') window.WikiDB.openSkillLadderSidebar();
      });
    }
  }

  // --- 初始化 Wiki 模組 ---
  function initWikiModule() {
    loadPersistedBerrySettings();
    currentWikiSubTab = getSavedWikiSubTab();
    currentSkillsCategory = getSavedSkillsCategory();
    currentIslandId = getSavedIslandId();
    isExpertModeActive = getSavedIslandExpertMode();
    currentIslandSleepType = getSavedIslandSleepType();
    isIslandLegendaryOnly = getSavedIslandLegendaryOnly();
    isIslandSleepRewardsVisible = getSavedIslandSleepRewards();
    const wikiContainer = document.getElementById('panel-wiki');
    if (!wikiContainer) return;

    try {
      renderWikiLayout(wikiContainer);
      bindWikiFloatingFabs();
    } catch (e) {
      console.error('Error rendering Wiki layout:', e);
      if (typeof window.__renderInPlaceError === 'function') {
        window.__renderInPlaceError('panel-wiki', window.I18N?.t?.('wiki.ui_layout_error') ?? '數據百科佈局渲染異常', e);
      }
    }

    try {
      bindAllEvents();
      bindGlobalDelegationFallback();
    } catch (e) {
      console.error('Error binding Wiki events:', e);
    }

    try { switchWikiSubTab(currentWikiSubTab); } catch (e) {}
    try {
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeParam = urlParams.get('recipe');
        if (recipeParam) {
          selectLadderHighlightRecipe(decodeURIComponent(recipeParam));
        }
      }
    } catch (e) {}
    try { recalcTriggerChance(); } catch (e) {}
    try { recalcSleepDays(); } catch (e) {}
    try {
      const ladderCanvas = document.getElementById('wiki-ingredient-ladder-coordinate') || document.getElementById('ladder-coordinate-canvas');
      if (!ladderCanvas || !ladderCanvas.innerHTML) refreshCoordinateLadder();
    } catch (e) {}
    try {
      const berryCanvas = document.getElementById('berry-energy-grid') || document.getElementById('berry-ladder-canvas');
      if (!berryCanvas || !berryCanvas.innerHTML) refreshBerryNodes();
    } catch (e) {}
  }

  // 渲染副技能標籤
  function renderSkillBadge(skill) {
    if (!skill || !skill.name || skill.name === '-') return '<span class="text-muted">-</span>';
    const displayName = window.I18N?.getSubSkillName?.(skill.name) || (window.I18N?.text?.(skill.name) ?? skill.name);
    const cls = skill.color ? `skill-badge-${skill.color}` : '';
    const statusNote = skill.status === 'unreleased'
      ? ` <span class="badge-unreleased">(${window.I18N?.t?.('wiki.ui_unreleased') ?? '未開放'})</span>`
      : '';
    return `<span class="wiki-skill-badge ${cls}">${displayName}${statusNote}</span>`;
  }

  // 獲取副技能遊戲品階顏色 (Gold / Blue / White)
  function getSubSkillBadgeColor(rawName) {
    if (!rawName) return 'white';
    const name = rawName.replace(/\s+/g, '');
    if (name.includes('樹果數量') || name.includes('树果数量') || name.includes('幫手獎勵') || name.includes('帮手奖励') || name.includes('技能等級提升M') || name.includes('技能等级提升M') ||
        name.includes('睡眠EXP') || name.includes('睡眠EXP獎勵') || name.includes('睡眠EXP奖励') || name.includes('活力恢復') || name.includes('活力恢复') ||
        name.includes('研究EXP') || name.includes('夢之碎片') || name.includes('梦之碎片') ||
        name.toLowerCase().includes('berryfinding') || name.toLowerCase().includes('helpingbonus') ||
        name.toLowerCase().includes('skilllevelupm') || name.toLowerCase().includes('sleepexp') ||
        name.toLowerCase().includes('energyrecovery') || name.toLowerCase().includes('researchexp') ||
        name.toLowerCase().includes('dreamshard')) {
      return 'gold';
    }
    if (name.endsWith('M') || name.endsWith('L') || name.includes('M/L') || name.includes('技能等級提升S') || name.includes('技能等级提升S') ||
        name.toLowerCase().includes('finderm') || name.toLowerCase().includes('speedm') || 
        name.toLowerCase().includes('triggerm') || name.toLowerCase().includes('inventoryupm') ||
        name.toLowerCase().includes('inventoryupl') || name.toLowerCase().includes('inventoryupm/l') ||
        name.toLowerCase().includes('skilllevelups') || name.includes('持有上限') || name.toLowerCase().includes('inventory')) {
      return 'blue';
    }
    return 'white';
  }

  // 渲染副技能徽章 (支援複合格式 如 "樹果數量S + 持有上限")
  function renderRatingSubskillBadge(rawName, rawNameEn) {
    if (!rawName) return '';
    const text = window.I18N?.field?.({ name: rawName, name_en: rawNameEn }, 'name')
      || window.I18N?.getSubSkillName?.(rawName)
      || rawName;
    if (text.includes('+')) {
      const parts = text.split('+').map(p => p.trim());
      return parts.map(part => {
        const color = getSubSkillBadgeColor(part);
        return `<span class="wiki-skill-badge skill-badge-${color}">${part}</span>`;
      }).join(' <span class="text-secondary font-bold" style="font-size: 11px;">+</span> ');
    }
    const color = getSubSkillBadgeColor(text);
    return `<span class="wiki-skill-badge skill-badge-${color}">${text}</span>`;
  }

  // 渲染性格推薦標籤 (高亮 ▲ 與 ▼ 符號)
  function renderRatingNatureBadge(natureName) {
    if (!natureName) return '';
    let html = natureName;
    html = html.replace(/▲/g, '<span class="matrix-rate-up font-bold" style="font-size: 13px; margin: 0 1px;">▲</span>');
    html = html.replace(/▼/g, '<span class="matrix-rate-down font-bold" style="font-size: 13px; margin: 0 1px;">▼</span>');
    return `<span class="rating-nature-title font-bold text-white">${html}</span>`;
  }

  // 培育指南詳細說明文字色彩強化
  function formatRatingDetail(detail) {
    if (!detail) return '';
    let res = detail;
    // 正向加成數值 (如 +36%, +18%, +1, +2)
    res = res.replace(/(\+\d+(?:\.\d+)?%?)/g, '<span class="text-success font-bold">$1</span>');
    // 時間縮短/減項 (如 -14%, -7%, -5%)
    res = res.replace(/(-\d+(?:\.\d+)?%)/g, '<span class="text-accent font-bold">$1</span>');
    // 關鍵專有名詞加亮
    res = res.replace(/(翻倍|畢業核心|毕业核心|靈魂性格|灵魂性格|金種子|金种子|銀種子|银种子)/g, '<span class="text-warning font-bold">$1</span>');
    res = res.replace(/(doubles|graduation core|essential graduation core|Prime nature|Sub Skill Seed|Main Skill Seed)/g, '<span class="text-warning font-bold">$1</span>');
    // 箭頭高亮
    res = res.replace(/▲/g, '<span class="matrix-rate-up font-bold">▲</span>');
    res = res.replace(/▼/g, '<span class="matrix-rate-down font-bold">▼</span>');
    return res;
  }

  // 渲染專長評級卡片
  function renderRatingCard(data) {
    const badgeText = window.I18N?.field?.(data, 'badge') || window.I18N?.field?.(data, 'title') || data.badge || data.title || '';
    const specText = window.I18N?.field?.(data, 'spec') ?? (data.spec || '');
    const desc = window.I18N?.field?.(data, 'desc') ?? (data.desc || '');
    const type = data.type || 'berry';
    const themeColor = type === 'berry' ? '#f59e0b' : (type === 'ingredient' ? '#06b6d4' : '#a855f7');

    return `
      <div class="wiki-card wiki-rating-card rating-card-${type}">
        <div class="wiki-card-header">
          <h3 class="wiki-card-title rating-card-header-title" style="margin: 0;">
            <span class="rating-specialty-badge specialty-${type}">${badgeText}</span>
            <span class="rating-specialty-desc">${specText}</span>
          </h3>
        </div>
        <p class="wiki-card-desc" style="margin-top: 6px;">${desc}</p>
        
        <div class="rating-subsections">
          <div class="rating-col">
            <h4 class="rating-col-title" style="color: ${themeColor};">${window.I18N?.t?.('wiki.ui_rating_subskill_priority') ?? '副技能推薦梯度'}</h4>
            <div class="rating-list">
              ${data.subskills.map(s => {
                const sDetail = window.I18N?.field?.(s, 'detail') ?? (s.detail || '');
                return `
                <div class="rating-item">
                  <span class="rating-item-badge">${renderRatingSubskillBadge(s.name, s.name_en)}</span><span class="rating-item-colon">:</span><span class="rating-item-detail text-secondary">${formatRatingDetail(sDetail)}</span>
                </div>
              `;}).join('')}
            </div>
          </div>

          <div class="rating-col">
            <h4 class="rating-col-title" style="color: ${themeColor};">${window.I18N?.t?.('wiki.ui_rating_nature_priority') ?? '性格推薦梯度'}</h4>
            <div class="rating-list">
              ${data.natures.map(n => {
                const nName = window.I18N?.field?.(n, 'name') || window.I18N?.getNatureName?.(n.name) || n.name || '';
                const nDetail = window.I18N?.field?.(n, 'detail') ?? (n.detail || '');
                return `
                <div class="rating-item">
                  <span class="rating-item-badge">${renderRatingNatureBadge(nName)}</span><span class="rating-item-colon">:</span><span class="rating-item-detail text-secondary">${formatRatingDetail(nDetail)}</span>
                </div>
              `;}).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const LADDER_NOTE_ING_LIST = [
    '特選蘋果', 'Fancy Apple', '哞哞鮮奶', 'Moomoo Milk', '萌綠大豆', 'Greengrass Soybeans',
    '甜甜蜜', 'Honey', '豆製肉', 'Bean Sausage', '暖暖薑', 'Warming Ginger',
    '好眠番茄', '熟透番茄', 'Snoozy Tomato', '一口堅果', 'Snackable Nuts', '特選蛋', 'Fancy Egg', '純粹油', 'Pure Oil',
    '窩心洋芋', 'Soft Potato', '火辣香草', 'Fiery Herb', '萌綠玉米', 'Greengrass Corn',
    '放鬆可可', 'Soothing Cacao', '醒腦咖啡豆', 'Rousing Coffee', '嫩亮酪梨', 'Glossy Avocado',
    '品鮮蘑菇', 'Tasty Mushroom', '粗枝大蔥', 'Large Leek', '沉甸甸南瓜', 'Plump Pumpkin',
    '美味尾巴', 'Slowpoke Tail'
  ];
  const _ladderNoteCache = Object.create(null);

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('appLanguageChanged', () => {
      for (const k in _ladderNoteCache) delete _ladderNoteCache[k];
    });
  }

  function formatLadderNote(note) {
    if (!note) return '';
    const localeKey = window.I18N?.t?.('wiki.ui_locale_tag') ?? 'tw';
    const cacheKey = localeKey + ':' + note;
    const cached = _ladderNoteCache[cacheKey];
    if (cached !== undefined) return cached;

    let translated = window.I18N?.text?.(note) ?? window.I18N?.translateDynamicText?.(note) ?? note;

    if (window.I18N && typeof window.I18N.getIngredientIcon === 'function') {
      for (let i = 0; i < LADDER_NOTE_ING_LIST.length; i++) {
        const ingName = LADDER_NOTE_ING_LIST[i];
        const localizedIng = window.I18N?.text?.(ingName) ?? ingName;
        const matchToken = translated.includes(localizedIng) ? localizedIng : (translated.includes(ingName) ? ingName : '');
        if (matchToken) {
          const icon = window.I18N.getIngredientIcon(ingName);
          if (icon) {
            const displayName = window.I18N?.getIngredientName?.(ingName) ?? ingName;
            const tag = `<img src="${icon}" class="ladder-note-ing-icon" alt="${displayName}" title="${displayName}">`;
            translated = translated.split(matchToken).join(tag);
          }
        }
      }
    }
    _ladderNoteCache[cacheKey] = translated;
    return translated;
  }

  const DEFAULT_LADDER_MIN_THRESHOLDS = {
    coffee: 20,
    apple: 20,
    ginger: 20,
    milk: 20,
    honey: 20,
    sausage: 20,
    potato: 20,
    tomato: 20,
    corn: 20,
    egg: 20,
    soybeans: 20,
    oil: 20,
    leek: 20,
    mushroom: 20,
    cacao: 20,
    herb: 20,
    glossyavocado: 20,
    snackablenuts: 20,
    pumpkin: 20,
    tail: 1
  };

  let _coordLadderRenderCache = { key: '', html: '' };

