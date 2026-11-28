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

  let _wikiModuleInitialized = false;

  // --- 初始化 Wiki 模組 ---
  function initWikiModule() {
    _wikiModuleInitialized = true;
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

    const alreadyRendered = !!(wikiContainer.dataset && wikiContainer.dataset.wikiInitDone === '1' && document.getElementById('wiki-subpanel-skills'));
    if (!alreadyRendered) {
      if (wikiContainer.dataset) wikiContainer.dataset.wikiInitDone = '1';
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
    } else {
      bindWikiFloatingFabs();
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
      if (ladderCanvas && !ladderCanvas.innerHTML) refreshCoordinateLadder();
    } catch (e) {}
    try {
      const berryCanvas = document.getElementById('berry-energy-grid') || document.getElementById('berry-ladder-canvas');
      if (berryCanvas && !berryCanvas.innerHTML) refreshBerryNodes();
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
            const tag = `<img src="${icon}" class="ladder-note-ing-icon" alt="${displayName}" title="${displayName}" width="16" height="16" loading="lazy" decoding="async">`;
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

  function _renderWikiRatingsBody(caps, sleepExpTargetLevels) {
    return `
          <!-- 區塊 1: 核心養成週期指引 -->
          <div class="wiki-section-heading">
            <h3 class="wiki-section-title">${window.I18N?.t?.('wiki.ui_growth_title') ?? '新手與進階養成核心週期指引'}</h3>
            <p class="wiki-section-subtitle">${window.I18N?.t?.('wiki.ui_growth_sub') ?? '掌握前期突破門檻,活力常駐加成與種子珍稀資源的養成核心思維.'}</p>
          </div>
          <div class="wiki-card wiki-strategy-card">
            <div class="wiki-strategy-grid">
              <div class="strategy-item strategy-early">
                <div class="strategy-header">
                  <span class="strategy-badge badge-early">${window.I18N?.t?.('wiki.ui_early_badge') ?? '前期目標'}</span>
                  <span class="strategy-title">${window.I18N?.t?.('wiki.ui_early_title') ?? '優先放置在 <span class="text-accent font-bold">Lv.30</span>'}</span>
                </div>
                <div class="strategy-desc">${window.I18N?.t?.('wiki.ui_early_desc') ?? '先看性格與 <span class="text-success font-bold">Lv.10</span> &amp; <span class="text-success font-bold">Lv.25</span> 副技能,無課/微課約養成 <span class="text-warning font-bold">2~4個月</span>即可解鎖<span class="text-accent font-bold">第2種食材</span>,成為中流砥柱.'}</div>
              </div>
              <div class="strategy-item strategy-late">
                <div class="strategy-header">
                  <span class="strategy-badge badge-late">${window.I18N?.t?.('wiki.ui_late_badge') ?? '後期投資'}</span>
                  <span class="strategy-title">${window.I18N?.t?.('wiki.ui_late_title') ?? '慎選投入 <span class="text-accent font-bold">Lv.50~60</span>'}</span>
                </div>
                <div class="strategy-desc">${window.I18N?.t?.('wiki.ui_late_desc') ?? '確認副技能與性格皆達畢業級再投入大量糖果與<span class="text-warning font-bold">金種子</span>(約需 <span class="text-warning font-bold">5~10個月</span>養成時間).'}</div>
              </div>
              <div class="strategy-item strategy-energy">
                <div class="strategy-header">
                  <span class="strategy-badge badge-energy">${window.I18N?.t?.('wiki.ui_energy_badge') ?? '活力核心'}</span>
                  <span class="strategy-title">${window.I18N?.t?.('wiki.ui_energy_title') ?? '優先養成一隻主力補師'}</span>
                </div>
                <div class="strategy-desc">${window.I18N?.t?.('wiki.ui_energy_desc') ?? '全體活力維持在 <span class="text-success font-bold">80%以上</span>可享受 <span class="text-accent font-bold">約2.22倍 (間隔 0.45x)</span> 幫忙速度!建議先練:<span class="text-warning font-bold">胖可丁</span>,<span class="text-warning font-bold">仙子伊布</span>,<span class="text-warning font-bold">沙奈朵</span>,<span class="text-warning font-bold">巴布土撥</span>或<span class="text-warning font-bold">土台龜</span>.'}</div>
              </div>
              <div class="strategy-item strategy-seeds">
                <div class="strategy-header">
                  <span class="strategy-badge badge-seeds">${window.I18N?.t?.('wiki.ui_seeds_badge') ?? '種子機制'}</span>
                  <span class="strategy-title">${window.I18N?.t?.('wiki.ui_seeds_title') ?? '主技能與副技能種子規則'}</span>
                </div>
                <div class="strategy-desc">${window.I18N?.t?.('wiki.ui_seeds_desc') ?? '每次進化<span class="text-success font-bold">主技能+1</span>.副技能不能同時存在相同名稱技能(如已有S與M,則S無法再升階為M).'}</div>
              </div>
            </div>
          </div>

          <!-- 區塊 2: 三大專長畢業評級榜 -->
          <div class="wiki-section-heading" style="margin-top: 24px;">
            <h3 class="wiki-section-title">${window.I18N?.t?.('wiki.ui_grad_title') ?? '三大專長畢業評級指南'}</h3>
            <p class="wiki-section-subtitle">${window.I18N?.t?.('wiki.ui_grad_sub') ?? '樹果,食材,技能三大專長的頂級副技能與黃金性格搭配方向.'}</p>
          </div>
          <div class="wiki-ratings-container">
            ${renderRatingCard(RATINGS_GUIDE_DATA.berry)}
            ${renderRatingCard(RATINGS_GUIDE_DATA.ingredient)}
            ${renderRatingCard(RATINGS_GUIDE_DATA.skill)}
          </div>

          <!-- 區塊 3: 睡眠天數升級試算器 -->
          <div class="wiki-section-heading" style="margin-top: 24px;">
            <h3 class="wiki-section-title">${window.I18N?.t?.('wiki.ui_sleep_calc_title') ?? '寶可夢睡眠升級天數計算器'}</h3>
            <p class="wiki-section-subtitle">${window.I18N?.t?.('wiki.ui_sleep_calc_sub') ?? '依據每日睡滿100分(100 EXP基礎),計算從目前等級升至目標等級所需睡眠天數與經驗值.'}</p>
          </div>
          <div class="wiki-card wiki-calc-card">
            <div class="calc-inputs-row">
              <div class="calc-form-col">
                <div class="calc-form-row calc-form-row-levels">
                  <div class="calc-field-group calc-field-cur">
                    <label class="calc-label" for="calc-sleep-cur-lv">${window.I18N?.t?.('wiki.ui_cur_lv_lbl') ?? '目前等級:'}</label>
                    <input type="number" id="calc-sleep-cur-lv" class="calc-input-num" value="1" min="1" max="${caps.THEORETICAL_MAX_LEVEL - 1}" inputmode="numeric" pattern="[0-9]*" autocomplete="off" onfocus="this.select()" onclick="this.select()" oninput="window.WikiDB.onSleepCurLvInput()" onchange="window.WikiDB.onSleepCurLvInput()">
                  </div>

                  <div class="calc-field-group calc-field-target">
                    <label class="calc-label" for="calc-sleep-target-lv">${window.I18N?.t?.('wiki.ui_target_lv_lbl') ?? '目標等級:'}</label>
                    <select id="calc-sleep-target-lv" class="calc-select" onchange="window.WikiDB.recalcSleepDays()">
                      ${sleepExpTargetLevels.map(lv => `<option value="${lv}">Lv.${lv}</option>`).join('')}
                    </select>
                  </div>
                </div>

                <div class="calc-form-row calc-form-row-boosts">
                  <div class="calc-field-group calc-field-switch">
                    <label class="calc-switch-label">
                      <input type="checkbox" id="calc-sleep-exp-subskill" class="switch-checkbox" onchange="window.WikiDB.recalcSleepDays()">
                      <span class="switch-slider"></span>
                      <span class="switch-text">${window.I18N?.t?.('wiki.ui_sleep_exp_sub') ?? '睡眠EXP獎勵 (+14%)'}</span>
                    </label>
                  </div>

                  <div class="calc-field-group calc-field-nature">
                    <select id="calc-sleep-nature-select" class="calc-select" onchange="window.WikiDB.recalcSleepDays()">
                      <option value="1.0">${window.I18N?.t?.('wiki.ui_exp_neutral') ?? '性格無EXP修正'}</option>
                      <option value="1.18">${window.I18N?.t?.('wiki.ui_exp_up') ?? '性格EXP▲ (+18%)'}</option>
                      <option value="0.82">${window.I18N?.t?.('wiki.ui_exp_down') ?? '性格EXP▼ (-18%)'}</option>
                    </select>
                  </div>

                  <div class="calc-field-group calc-field-exptype">
                    <select id="calc-sleep-exp-type" class="calc-select" onchange="window.WikiDB.recalcSleepDays()">
                      <option value="1.0">${window.I18N?.t?.('wiki.ui_exp_type_10') ?? '一般 (1.0倍)'}</option>
                      <option value="1.5">${window.I18N?.t?.('wiki.ui_exp_type_15') ?? '準神 (1.5倍)'}</option>
                      <option value="1.8">${window.I18N?.t?.('wiki.ui_exp_type_18') ?? '神獸 (1.8倍)'}</option>
                      <option value="2.2">${window.I18N?.t?.('wiki.ui_exp_type_22') ?? '幻之寶可夢 (2.2倍)'}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="calc-result-box">
                <div class="calc-result-label">${window.I18N?.t?.('wiki.ui_est_days_lbl') ?? '預估所需睡眠天數'}</div>
                <div id="calc-sleep-days-result" class="calc-result-val">${window.I18N?.t?.('wiki.ui_default_days') ?? '120 天'}</div>
                <div id="calc-sleep-exp-result" class="calc-result-badge">${window.I18N?.t?.('wiki.ui_default_exp') ?? '約需 11,992 EXP'}</div>
                <div id="calc-sleep-candies-result" class="calc-result-candies">${window.I18N?.t?.('wiki.ui_default_candies') ?? '約需 480 顆糖果 (每顆 25 EXP)'}</div>
              </div>
            </div>

            <!-- 基準天數對照表 -->
            <div class="wiki-table-wrapper" style="margin-top: 14px;">
              <table class="wiki-data-table milestone-table">
                <thead>
                  <tr>
                    <th class="col-milestone-lv">${window.I18N?.t?.('wiki.ui_target_lv_th') ?? '目標'}</th>
                    <th class="col-milestone-exp">${window.I18N?.t?.('wiki.ui_req_exp_th') ?? 'EXP'}</th>
                    <th class="col-milestone-days">${window.I18N?.t?.('wiki.ui_daily_sleep_th') ?? '天數'}</th>
                    <th class="col-milestone-note">${window.I18N?.t?.('wiki.ui_milestone_th') ?? '解鎖'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${SLEEP_DAYS_BASELINE.map(row => {
                    const milestoneColor = row.level === 10 ? 'milestone-cyan'
                      : row.level === 25 ? 'milestone-purple'
                      : row.level === 30 ? 'milestone-green'
                      : row.level === 50 ? 'milestone-amber'
                      : row.level === 60 ? 'milestone-pink'
                      : row.level === caps.POKEMON_LEVEL_CAP ? 'milestone-purple'
                      : 'milestone-cyan';
                    const rawNote = window.I18N?.field?.(row, 'note') ?? row.note;
                    const formattedNote = rawNote
                      .replace(/(第[一二三四五12345][個个]?副技能|第[一二三123][種种]?食材|1st Sub-skill|2nd Sub-skill|3rd Sub-skill|4th Sub-skill|5th Sub-skill|2nd Ing\.|3rd Ing\.)/g, '<span class="text-accent font-bold">$1</span>');
                    return `
                    <tr>
                      <td class="col-milestone-lv" style="vertical-align: middle;"><span class="milestone-badge ${milestoneColor}">Lv.${row.level}</span></td>
                      <td class="col-milestone-exp font-bold" style="vertical-align: middle;">${row.totalExp.toLocaleString()}</td>
                      <td class="col-milestone-days text-success font-bold" style="vertical-align: middle;">${row.days} ${window.I18N?.t?.('wiki.ui_days_unit') ?? '天'}</td>
                      <td class="col-milestone-note text-secondary" style="vertical-align: middle;">${formattedNote}</td>
                    </tr>
                  `;}).join('')}
                </tbody>
              </table>
            </div>
          </div>
    `;
  }

