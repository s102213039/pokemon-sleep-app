function renderPokedexDetailModalContent() {
  const modalEl = document.getElementById('pokedex-detail-modal');
  if (!modalEl) return;
  const pkm = pokedexModalState.pkm;
  if (!pkm) return;

  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

  const pkmName = isEN ? (pkm.name_en || pkm.name_cn) : (pkm.name_cn || pkm.name_en);
  const specName = window.I18N ? window.I18N.getSpecialtyName(pkm.specialty) : pkm.specialty;
  const berry = (typeof getPokemonBerry === 'function') ? getPokemonBerry(pkm) : { name: '', icon: '' };
  const berryName = window.I18N ? window.I18N.getBerryName(berry.name) : berry.name;
  const iconUrl = (typeof getIconUrl === 'function') ? getIconUrl(pkm) : (pkm.icon_url || '');

  let specClass = 'spec-ingredient';
  if (pkm.specialty && (pkm.specialty.includes('樹果') || pkm.specialty === 'Berries')) {
    specClass = 'spec-berry';
  } else if (pkm.specialty && (pkm.specialty.includes('技能') || pkm.specialty === 'Skills')) {
    specClass = 'spec-skill';
  } else if (pkm.specialty && (pkm.specialty.includes('全能') || pkm.specialty.includes('全部') || pkm.specialty === 'All-Rounder' || pkm.specialty.toLowerCase() === 'all')) {
    specClass = 'spec-all';
  }

  // 6D 評估計算
  const chosenIngs = (pkm.ingredients || []).map((ing, i) => {
    const selIdx = pokedexModalState.ingSlots[i] || 0;
    return (pkm.ingredients && pkm.ingredients[selIdx]) ? pkm.ingredients[selIdx].name : (ing.name || '');
  });

  let evaluation = null;
  if (window.AppraisalLab && typeof window.AppraisalLab.evaluatePokemon === 'function') {
    evaluation = window.AppraisalLab.evaluatePokemon(pkm, pokedexModalState.level, pokedexModalState.nature, pokedexModalState.subskills, chosenIngs, pokedexModalState.ribbon, pokedexModalState.skillLevel);
  }

  if (!evaluation) {
    evaluation = {
      compositeScore: 75,
      grade: 'A',
      gradeTitle: isEN ? 'Solid Pick' : '實用良品 (Solid Pick)',
      gradeColor: '#10b981',
      scores: { berry: 60, ingredient: 70, skill: 65, speed: 65, growth: 60, roi: 65 }
    };
  }

  const formulaData = calculatePokedexIngredientFormulas();
  const maxSkillLvl = getPokedexMainSkillMaxLvl(pkm.main_skill);
  const minEvoLvl = getPokedexMinEvolutionLevel(pkm);
  const modalSkillDesc = typeof getSkillDescription === 'function' ? getSkillDescription(pkm.main_skill, isEN) : '';

  modalEl.innerHTML = `
    <div class="pokedex-modal-backdrop-dismiss" onclick="window.PokemonApp.closePokemonDetailModal()"></div>
    <div class="box-modal-dialog pokedex-modal-dialog mobile-box-sheet bottom-sheet mobile-modal-sheet" role="dialog" aria-modal="true">
      <div class="sheet-drag-handle"></div>
      <!-- 頂部標題列 (樹果與類型上下展示、單行水平基礎數值、右上角重置預設) -->
      <div class="box-modal-header pokedex-modal-header">
        <div class="pokedex-modal-header-main">
          <div class="box-modal-title pokedex-modal-title">
            ${iconUrl ? `<img src="${iconUrl}" class="pokedex-header-avatar" alt="${escapeHtml(pkmName)}" loading="lazy">` : ''}
            <div class="pokedex-header-info">
              <div class="pokedex-header-no">No.${pkm.formatted_no || ''}</div>
              <div class="pokedex-header-name-row">
                <span class="pokedex-header-pkm-name font-bold">${escapeHtml(pkmName)}</span>
                ${renderPokedexEvoItemChipsHTML(pkm)}
              </div>
            </div>
            <div class="pokedex-header-tags pokedex-header-berry-spec-group">
              <span class="pokedex-tag pokedex-tag-berry" title="${escapeHtml(berryName)}">
                ${berry.icon ? `<img src="${berry.icon}" class="pokedex-berry-icon-img" alt="${escapeHtml(berryName)}" title="${escapeHtml(berryName)}" loading="lazy">` : ''}
              </span>
              ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkm.specialty, 20, 'pokedex-tag pokedex-tag-spec') : `<span class="pokedex-tag pokedex-tag-spec ${specClass}">${escapeHtml(specName)}</span>`}
            </div>
          </div>

          <!-- 基礎數值雙欄縱向列 (左欄：幫忙間隔 & 持有；右欄：食材率 & 技能率，附帶括號基準差值) -->
          <div class="pokedex-header-stats-row pokedex-header-stats-dual">
            <div class="pokedex-header-stat-col">
              <div class="pokedex-header-stat-item">
                <span class="header-stat-k">${t('th.interval', '幫忙間隔')}</span>
                <span class="header-stat-v font-bold" id="pokedex-stat-interval">${renderPokedexIntervalValue(formulaData, pkm)}</span>
              </div>
              <div class="pokedex-header-stat-item">
                <span class="header-stat-k">${t('th.carry', '持有')}</span>
                <span class="header-stat-v font-bold" id="pokedex-stat-carry">${renderPokedexCarryValue(formulaData, pkm)}</span>
              </div>
            </div>
            <div class="pokedex-header-stat-col">
              <div class="pokedex-header-stat-item">
                <span class="header-stat-k">${t('th.ingredient_rate', '食材率')}</span>
                <span class="header-stat-v font-bold" id="pokedex-stat-ingredient-rate">${renderPokedexIngRateValue(formulaData, pkm)}</span>
              </div>
              <div class="pokedex-header-stat-item">
                <span class="header-stat-k">${t('th.skill_rate', '技能率')}</span>
                <span class="header-stat-v font-bold" id="pokedex-stat-skill-rate">${renderPokedexSkillRateValue(formulaData, pkm)}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pokedex-header-actions" style="display:flex;align-items:center;gap:10px;">
          <div class="pokedex-dual-verdict-column" style="display:flex;flex-direction:column;gap:3px;align-items:flex-end;">
            <!-- 當前實力 (主要，清晰亮眼) -->
            <div class="pokedex-header-verdict-badge current-track" id="pokedex-header-verdict-badge" style="border-color: ${(evaluation.current || evaluation).gradeColor};" title="${isEN ? `Current Level Rating (Lv.${pokedexModalState.level})` : `當前實力評級 (Lv.${pokedexModalState.level})`}">
              <span class="pokedex-verdict-track-lbl" style="font-size:10px;color:#94a3b8;line-height:1;">${isEN ? `Lv.${pokedexModalState.level}` : `當前 Lv.${pokedexModalState.level}`}</span>
              <span class="verdict-grade pokedex-header-grade-text" id="pokedex-header-verdict-grade" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:14px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
              <span class="pokedex-header-score-text" style="font-size:11px;"><span class="verdict-num font-bold" id="pokedex-header-verdict-num">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
            </div>
            <!-- 滿級潛力 (次要，小一點，上下並行在下方，一般較不明顯的顏色，不要高亮) -->
            <div class="pokedex-header-verdict-badge potential-track" id="pokedex-header-potential-badge" title="${isEN ? 'Max Potential Rating (Lv.100)' : '畢業潛力評級 (Lv.100)'}">
              <span class="pokedex-verdict-track-lbl" style="font-size:9px;color:#64748b;line-height:1;">${isEN ? 'Lv.100 Pot' : '滿級潛力'}</span>
              <span class="verdict-potential-grade pokedex-header-grade-text" id="pokedex-header-potential-grade" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
              <span class="pokedex-header-score-text" style="font-size:10px;color:#94a3b8;"><span class="verdict-potential-num" id="pokedex-header-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
            </div>
          </div>
          <button type="button" class="box-modal-close pokedex-modal-close-btn" onclick="window.PokemonApp.closePokemonDetailModal()" aria-label="${isEN ? 'Close' : '關閉'}">✕</button>
        </div>
      </div>

      <!-- 彈窗內容主體 (雙欄/響應式) -->
      <div class="box-modal-body pokedex-modal-body">
        <!-- 左欄：食材產能算法拆解與最佳配置指南 (空間最大化，單一整合外框) -->
        <div class="pokedex-modal-col pokedex-left-col">
          <!-- 食材產能算法拆解與最佳配置 (單一整合卡片) -->
          <div class="pokedex-calc-formula-card" id="pokedex-calc-formula-container">
            ${renderPokedexFormulaBreakdownHTML(formulaData, pkm)}
          </div>
        </div>

        <!-- 右欄：表單控制項 (等級軌道圖釘、食材平鋪、主技能一行展示、性格、睡飽飽獎章、副技能) -->
        <div class="pokedex-modal-col pokedex-right-col box-modal-form">
          <div class="box-form-grid pokedex-controls-container">
            <!-- 1. 等級軌道錨定滑桿 + 畢業神配置與重置預設快捷按鈕 -->
            <div class="box-form-group box-full-width pokedex-level-ctrl-group">
              <div class="pokedex-level-header-row">
                <div class="pokedex-level-header-left">
                  <label class="box-form-label" for="pokedex-level-slider" style="margin-bottom:0;">${t('pokedex.level_slider', '等級設定')} (<span class="pokedex-val-badge font-bold" id="pokedex-level-val-badge">Lv. <span id="pokedex-level-val-text">${pokedexModalState.level}</span><span id="pokedex-level-unreleased-tag" class="pokedex-unreleased-pill ${pokedexModalState.level > 70 ? '' : 'hidden'}">${t('pokedex.unreleased', '尚未開放')}</span></span>)</label>
                  <button type="button" class="pokedex-btn-preset preset-god" onclick="window.PokemonApp.applyPokedexGodPreset()" title="${t('pokedex.preset_god', '畢業神配置')}">${t('pokedex.preset_god', '畢業神配置')}</button>
                </div>
                <div class="pokedex-level-header-right">
                  <button type="button" class="pokedex-header-reset-btn pokedex-btn-preset preset-reset" onclick="window.PokemonApp.applyPokedexResetPreset()" title="${t('pokedex.preset_reset', '重置預設')}">[↺] ${t('pokedex.preset_reset', '重置預設')}</button>
                </div>
              </div>
              <div class="pokedex-anchored-slider-wrap">
                <div class="pokedex-slider-track-wrap">
                  <div class="pokedex-slider-track-bar">
                    <div class="pokedex-slider-fill-bar" id="pokedex-slider-fill-bar" style="width: ${((pokedexModalState.level - 1) / 99 * 100).toFixed(2)}%;"></div>
                    ${minEvoLvl > 1 ? `
                      <div class="pokedex-slider-locked-zone" id="pokedex-slider-locked-zone" style="width: ${((minEvoLvl - 1) / 99 * 100).toFixed(2)}%;" title="${isEN ? `Locked: Below min evolution Lv.${minEvoLvl}` : `不可滑動區間：低於最低進化等級 Lv.${minEvoLvl}`}">
                        <span class="pokedex-slider-locked-edge"></span>
                      </div>
                    ` : ''}
                  </div>
                  <input type="range" id="pokedex-level-slider" min="1" max="100" value="${pokedexModalState.level}" class="pokedex-slider ${minEvoLvl > 1 ? 'has-locked-zone' : ''}" oninput="window.PokemonApp.setPokedexModalLevel(this.value)">
                </div>
                <div class="pokedex-track-pins-bar" id="pokedex-track-pins-bar">
                  ${(() => {
                    const allMilestones = [10, 25, 30, 50, 60, 70, 80, 100];
                    // 紅色不可滑動區間（低於最低進化等級）不展示快捷等級圖釘，亦不額外插入重疊門檻圖釘
                    const pins = allMilestones.filter(lv => lv >= minEvoLvl);
                    const unlockNotes = {
                      10: isEN ? '1st Sub-Skill' : '解鎖第1副技能',
                      25: isEN ? '2nd Sub-Skill' : '解鎖第2副技能',
                      30: isEN ? '2nd Ingredient' : '解鎖第2食材',
                      50: isEN ? '3rd Sub-Skill' : '解鎖第3副技能',
                      60: isEN ? '3rd Ingredient' : '解鎖第3食材',
                      70: isEN ? 'Current Level Cap' : '目前等級上限',
                      80: isEN ? '4th Sub-Skill / Sim' : '解鎖第4副技能 / 模擬',
                      100: isEN ? '5th Sub-Skill / Max' : '五階滿等畢業 / 模擬'
                    };
                    return pins.map(lv => {
                      const pct = ((lv - 1) / 99) * 100;
                      const isReleasedMilestone = [10, 25, 30, 50, 60, 70].includes(lv);
                      const isUnreleased = lv > 70;
                      const isCap = lv === 70;
                      const isActive = pokedexModalState.level === lv;
                      const classes = ['pokedex-track-pin-btn', 'pin-milestone'];
                      if (isActive) classes.push('active');
                      if (isCap) classes.push('pin-cap');
                      if (isUnreleased) classes.push('pin-unreleased');

                      let tooltip = `Lv.${lv}`;
                      if (unlockNotes[lv]) {
                        tooltip += ` (${unlockNotes[lv]})`;
                      } else if (isUnreleased) {
                        tooltip = `Lv.${lv} (${isEN ? 'Unreleased in game / Simulation only' : '遊戲尚未開放 / 模擬'})`;
                      } else if (isCap) {
                        tooltip = `Lv.${lv} (${isEN ? 'Current Level Cap' : '目前等級上限'})`;
                      }

                      return `
                        <button type="button" class="${classes.join(' ')}" data-pin-lv="${lv}" style="left: ${pct.toFixed(2)}%;" onclick="window.PokemonApp.setPokedexModalLevel(${lv})" title="${tooltip}">
                          <span class="track-pin-tick"></span>
                          <span class="track-pin-label">${lv}</span>
                        </button>
                      `;
                    }).join('');
                  })()}
                </div>
              </div>
            </div>

            <!-- 2. 食材組合平鋪選擇器 -->
            <div class="box-form-group box-full-width box-form-row-inline pokedex-ing-row">
              <label class="box-form-label box-form-inline-label">${t('box.modal_poke_ing', '食材組合')}</label>
              <div class="box-ing-strip" id="pokedex-ing-strip"></div>
            </div>

            <!-- 3. 主技能與睡飽飽獎章並列行 (主技能無外框、選單貼近標題、睡飽飽獎章移至主技能右側) -->
            <div class="box-form-group box-full-width box-form-row-inline box-mainskill-row pokedex-mainskill-ribbon-row">
              <div class="pokedex-inline-unit pokedex-mainskill-unit">
                <label class="box-form-label box-form-inline-label" for="pokedex-poke-skill-level">${t('box.modal_main_skill_short', '主技能')}</label>
                <span id="pokedex-poke-main-skill-name" class="box-mainskill-name-badge" title="${escapeHtml(modalSkillDesc)}">${escapeHtml(pkm.main_skill || '--')}</span>
                <div class="box-mainskill-select-wrap">
                  <select id="pokedex-poke-skill-level" class="box-form-select box-mainskill-select pokedex-custom-select" onchange="window.PokemonApp.setPokedexModalSkillLevel(this.value)">
                    ${Array.from({ length: maxSkillLvl }, (_, i) => i + 1).map(lvl => `
                      <option value="${lvl}" ${pokedexModalState.skillLevel === lvl ? 'selected' : ''}>Lv. ${lvl}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="pokedex-inline-unit pokedex-ribbon-unit">
                <label class="box-form-label box-form-inline-label" for="pokedex-poke-ribbon">${t('box.modal_poke_ribbon', '睡飽飽獎章')}</label>
                <div class="box-form-inline-control">
                  <select id="pokedex-poke-ribbon" class="box-form-select pokedex-custom-select" onchange="window.PokemonApp.setPokedexModalRibbon(this.value)">
                    ${renderPokedexRibbonOptionsHTML(pkm, pokedexModalState.ribbon)}
                  </select>
                </div>
              </div>
            </div>

            <!-- 4. 性格選單 -->
            <div class="box-form-group box-full-width box-form-row-inline pokedex-nature-row">
              <label class="box-form-label box-form-inline-label" for="pokedex-poke-nature">${t('box.modal_poke_nature', '性格')}</label>
              <div class="box-form-inline-control">
                <select id="pokedex-poke-nature" class="box-form-select pokedex-custom-select" onchange="window.PokemonApp.setPokedexModalNature(this.value)">
                  ${POKEDEX_MODAL_NATURES.map(n => {
                    const natDisplayName = (window.I18N && typeof window.I18N.getNatureName === 'function') ? window.I18N.getNatureName(n.name) : n.name;
                    const buffLabel = isEN ? (n.buff_en || n.buff) : n.buff;
                    const debuffLabel = isEN ? (n.debuff_en || n.debuff) : n.debuff;
                    return `<option value="${n.name}" ${pokedexModalState.nature === n.name ? 'selected' : ''}>${natDisplayName} (${buffLabel}${debuffLabel ? ' / ' + debuffLabel : ' (Neutral)'})</option>`;
                  }).join('')}
                </select>
              </div>
            </div>

            <!-- 6. 副技能配置：單行 5 階插槽 + 平鋪副技能選擇盤 (清空全部按鈕) -->
            <div class="box-form-group box-full-width">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <label class="box-form-label">${t('box.modal_poke_subskills', '副技能配置')}</label>
                <button type="button" id="pokedex-subskill-clear-all-btn" class="box-subskill-clear-btn" onclick="window.PokemonApp.clearAllPokedexSubskills()" title="${t('box.modal_clear_all_subskills', '清空全部副技能')}">${t('box.modal_clear_all_subskills', '清空全部')}</button>
              </div>

              <!-- 單行 5 階插槽列 -->
              <div class="box-subskill-slots-row" id="pokedex-subskill-slots-row"></div>

              <!-- H5 App 專用展開/隱藏切換按鈕 (佔滿版寬，網頁版維持默認顯示且不展示按鈕) -->
              <button type="button" id="pokedex-subskill-toggle-btn" class="pokedex-subskill-toggle-btn ${pokedexSubskillPaletteExpanded ? 'is-expanded' : ''}" onclick="window.PokemonApp.togglePokedexSubskillPalette()">
                <span class="pokedex-subskill-toggle-text">${pokedexSubskillPaletteExpanded ? (isEN ? 'Collapse Subskills' : '副技能收合') : (isEN ? 'Expand Subskills' : '副技能展開')}</span>
              </button>

              <!-- 平鋪副技能選擇盤 -->
              <div class="box-subskill-palette ${pokedexSubskillPaletteExpanded ? 'palette-expanded' : ''}" id="pokedex-subskill-palette">
                <div class="subskill-tier-section">
                  <div class="subskill-tier-label gold-label">${t('box.modal_gold_skills', '金色頂級技能')}</div>
                  <div class="subskill-chips-row" id="pokedex-subskill-chips-gold"></div>
                </div>
                <div class="subskill-tier-section">
                  <div class="subskill-tier-label blue-label">${t('box.modal_blue_skills', '藍色高階技能')}</div>
                  <div class="subskill-chips-row" id="pokedex-subskill-chips-blue"></div>
                </div>
                <div class="subskill-tier-section">
                  <div class="subskill-tier-label white-label">${t('box.modal_white_skills', '白色基礎技能')}</div>
                  <div class="subskill-chips-row" id="pokedex-subskill-chips-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 移動端/H5 App專用：策略指南 (全寬置底，僅在移動端/H5 App展示) -->
        <div class="pokedex-strategy-mobile-wrap box-full-width" id="pokedex-strategy-mobile-container">
          ${renderPokedexStrategyCardHTML(pkm)}
        </div>
      </div>
    </div>
  `;

  // 初始化食材平鋪選擇器與副技能插槽選擇盤
  renderPokedexIngredientStrip();
  updatePokedexSubskillUI();

  // 初始化自訂下拉選單 (主技能等級、性格、睡飽飽獎章)
  ['pokedex-poke-skill-level', 'pokedex-poke-nature', 'pokedex-poke-ribbon'].forEach(id => {
    const el = document.getElementById(id);
    if (el && typeof window.setupCustomSelect === 'function' && !el._customized) {
      window.setupCustomSelect(el);
    }
  });
}

function renderPokedexFormulaBreakdownHTML(f, pkm) {
  if (!f) return '';
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

  const natureIngMultStr = f.cleanseMint 
    ? (isEN ? `${f.natureIngMult.toFixed(2)} (Mint)` : `${f.natureIngMult.toFixed(2)} (薄荷)`)
    : f.natureIngMult.toFixed(2);
  const natureSkillMultStr = f.cleanseMint 
    ? (isEN ? `${f.natureSkillMult.toFixed(2)} (Mint)` : `${f.natureSkillMult.toFixed(2)} (薄荷)`)
    : f.natureSkillMult.toFixed(2);
  const subskillIngMultStr = (1 + f.subskillIngBonus / 100).toFixed(2);
  const subskillSkillMultStr = (1 + f.subskillSkillBonus / 100).toFixed(2);

  return `
    <div class="pokedex-formula-inner">
      <div class="pokedex-formula-header">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="pokedex-formula-badge font-bold">${t('pokedex.formula_title', '產能算法精算拆解')}</span>
          <button type="button" class="pokedex-formula-help-btn" onclick="window.PokemonApp.togglePokedexEnergyHelp(event)" title="${isEN ? 'Ideal Energy (>=80%) & 12h Daytime Baseline' : '滿活力 (活力≥80%) 幫忙間隔 0.45x 與 12 小時基準說明'}" aria-label="Energy Info">?</button>
        </div>
        <div id="pokedex-energy-help-popover" class="pokedex-energy-help-popover" style="display:none;" role="tooltip">
          <div class="pokedex-energy-help-backdrop" onclick="window.PokemonApp.closePokedexEnergyHelp(event)"></div>
          <div class="pokedex-energy-help-bubble">
            <div class="energy-help-title font-bold">${isEN ? 'Ideal Energy (0.45x) & 12h Daytime Baseline' : '理想活力 0.45x 與 12 小時基準說明'}</div>
            <div class="energy-help-body">
              ${isEN
                ? 'Under ideal energy (≥80%), helping interval is reduced to <span class="text-accent font-bold">0.45x</span> (~<span class="text-accent font-bold">2.22x yield</span>).<br>Calculation adopts a <span class="text-accent font-bold">12 hours (43200s)</span> daytime active baseline: general players have 12-16 hours waking time, and Pokémon sleep requires ~8.5h, so 12h represents realistic daytime active output without non-active sleep downtime.'
                : '活力 ≥ 80% 理想狀態下，幫忙間隔縮短為 <span class="text-accent font-bold">0.45 倍</span>（產能約 <span class="text-accent font-bold">2.22 倍</span>）。<br>此處算法採用 <span class="text-accent font-bold">12 小時 (43200秒)</span> 日間活躍基準：一般用戶非睡眠時間約 12-16 小時，且寶可夢睡飽需 8.5 小時，扣除夜間睡眠，以 12 小時試算最符合日間實際產能期望。'}
            </div>
          </div>
        </div>
      </div>

      <!-- 單一整合精算卡片 (無冗餘外框，邏輯由間隔頻率 -> 樹果能量 -> 食材產量 -> 技能期望，清晰順暢) -->
      <div class="pokedex-calc-unified-box">
        <!-- 步驟 1：實質幫忙間隔與日間次數基準 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${isEN ? 'Helping Speed & Active Helps (12h)' : '實質幫忙間隔與日間次數 (12h)'}</span>
            <div class="calc-row-header-values">
              <span class="calc-val-main font-bold calc-color-helps">${f.dailyHelps.toFixed(1)} ${isEN ? 'helps' : '次'}</span>
            </div>
          </div>
          <div class="calc-row-formula">
            <span class="formula-derive font-mono">${isEN ? '43200s (12h) ÷ (' : '43200秒 (12h) ÷ ('}${f.effectiveIntervalSec}s × 0.45) = <strong class="calc-color-helps">${f.dailyHelps.toFixed(1)} ${isEN ? 'helps' : '次'}</strong></span>
          </div>
        </div>

        <!-- 步驟 2：樹果產量與單日能量 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${isEN ? 'Berry Yield & Energy (12h)' : '樹果產量與單日能量 (12h)'}</span>
            <div class="calc-row-header-values">
              <span class="calc-val-main font-bold calc-color-berry">${f.dailyBerryEnergy.toLocaleString()} ${isEN ? 'Strength' : '能量'}</span>
            </div>
          </div>
          <div class="calc-row-formula">
            <span class="formula-derive font-mono"><span class="formula-var font-bold">${f.dailyBerryHelps.toFixed(1)}${isEN ? ' helps' : '次'}</span> × <span class="calc-color-berry font-bold">${f.berriesPerHelp}${isEN ? ' berries' : '顆'}</span> × <span class="formula-var" title="${isEN ? 'Single Berry Energy' : '單顆能量'}">${f.singleBerryEnergy}</span> = <strong class="calc-color-berry">${f.dailyBerryEnergy.toLocaleString()} ${isEN ? 'Strength' : '能量'}</strong></span>
          </div>
          <div class="berry-row-detail font-mono">
            <span class="berry-detail-left">${f.berryIcon ? `<img src="${f.berryIcon}" class="yield-pill-img" alt="${escapeHtml(f.berryName)}" loading="lazy" style="vertical-align:middle;margin-right:2px;">` : ''}<span class="yield-pill-name">${escapeHtml(f.berryName)}</span> <span class="calc-color-berry font-bold">${f.singleBerryEnergy} ${isEN ? 'energy/ea' : '能量/顆'}</span></span>
            <span class="calc-color-berry-fav font-bold" title="${isEN ? 'Favorite Berry (2x Energy)' : '順果 (喜好樹果 2x 能量)'}">${isEN ? 'Fav ' : '順果 '}${f.dailyBerryEnergyFav.toLocaleString()} ${isEN ? 'Strength' : '能量'}</span>
          </div>
        </div>

        <!-- 步驟 3：最終食材發動率與單日掉落產量 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${t('pokedex.final_ing_rate', '最終食材發動率')}</span>
            <div class="calc-row-header-values">
              <span class="calc-val-main font-bold calc-color-ing">${f.finalIngRate.toFixed(2)}%</span>
            </div>
          </div>
          <div class="calc-row-formula">
            <span class="formula-var" title="${isEN ? 'Base Rate' : '基礎食材機率'}">${f.baseIngRate.toFixed(1)}%</span>
            <span class="formula-op">×</span>
            <span class="formula-var" title="${isEN ? 'Subskills' : '副技能加成'}">${subskillIngMultStr}</span>
            <span class="formula-op">×</span>
            <span class="formula-var" title="${isEN ? (f.cleanseMint ? 'Nature (Cleanse Mint used)' : 'Nature') : (f.cleanseMint ? '性格修正（使用淨白薄荷消除個性效果）' : '性格修正')}">${natureIngMultStr}</span>
            <span class="formula-op">=</span>
            <span class="formula-res font-bold calc-color-ing">${f.finalIngRate.toFixed(2)}%</span>
            <span class="formula-op">➜</span>
            <span class="formula-derive font-mono"><span class="calc-color-helps font-bold">${f.dailyHelps.toFixed(1)}${isEN ? ' helps' : '次'}</span> × <span class="calc-color-ing font-bold">${f.finalIngRate.toFixed(2)}%</span> = <strong class="calc-color-yield">${f.dailyIngDrops.toFixed(1)} ${isEN ? 'drops' : '次掉落'}</strong></span>
          </div>
          <div class="pokedex-yield-items-grid">
            ${f.summaryYieldList.map(item => `
              <div class="pokedex-yield-pill">
                ${item.icon ? `<img src="${item.icon}" class="yield-pill-img" alt="${escapeHtml(item.name)}" loading="lazy">` : ''}
                <span class="yield-pill-name">${escapeHtml(item.name)}</span>
                <span class="yield-pill-count font-bold calc-color-yield">${item.daily.toFixed(1)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 步驟 4：最終技能發動率與單日發動次數 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${isEN ? 'Final Skill Trigger Rate' : '最終技能發動率'}</span>
            <div class="calc-row-header-values">
              <span class="calc-val-main font-bold calc-color-skill">${f.finalSkillRate.toFixed(2)}%</span>
            </div>
          </div>
          <div class="calc-row-formula">
            <span class="formula-var" title="${isEN ? 'Base Skill Rate' : '基礎技能機率'}">${f.baseSkillRate.toFixed(1)}%</span>
            <span class="formula-op">×</span>
            <span class="formula-var" title="${isEN ? 'Subskills' : '副技能加成'}">${subskillSkillMultStr}</span>
            <span class="formula-op">×</span>
            <span class="formula-var" title="${isEN ? (f.cleanseMint ? 'Nature (Cleanse Mint used)' : 'Nature') : (f.cleanseMint ? '性格修正（使用淨白薄荷消除個性效果）' : '性格修正')}">${natureSkillMultStr}</span>
            <span class="formula-op">=</span>
            <span class="formula-res font-bold calc-color-skill">${f.finalSkillRate.toFixed(2)}%</span>
            <span class="formula-op">➜</span>
            <span class="formula-derive font-mono"><span class="calc-color-helps font-bold">${f.dailyHelps.toFixed(1)}${isEN ? ' helps' : '次'}</span> × <span class="calc-color-skill font-bold">${f.finalSkillRate.toFixed(2)}%</span> = <strong class="calc-color-triggers">${f.dailyTriggers.toFixed(2)} ${isEN ? 'triggers' : '次'}</strong></span>
          </div>
          ${f.mainSkillLabel ? `
            <div class="calc-row-subskill-extra">
              <span class="badge-skill-extra">${escapeHtml(f.mainSkillLabel)}</span>
              <span class="text-skill-extra font-bold text-success">${escapeHtml(f.mainSkillValueText || `+${f.mainSkillExtraDaily.toFixed(1)}`)}</span>
              ${f.mainSkillSingleText ? `<span class="text-skill-single font-mono text-muted">(${escapeHtml(f.mainSkillSingleText)})</span>` : ''}
            </div>
            ${f.mainSkillDesc ? `
              <div class="calc-row-skill-desc text-muted" style="margin-top: 4px; font-size: 11.5px; line-height: 1.4;">${escapeHtml(f.mainSkillDesc)}</div>
            ` : ''}
          ` : ''}
        </div>

        <!-- 桌面端專屬：最佳配置指南 (收納於同一個外框內，增加到下一行) -->
        <div class="pokedex-strategy-desktop-wrap" id="pokedex-strategy-desktop-container">
          ${renderPokedexStrategyCardHTML(pkm)}
        </div>
      </div>
    </div>
  `;
}

function togglePokedexEnergyHelp(event) {
  if (event) {
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
    if (typeof event.preventDefault === 'function') event.preventDefault();
  }
  const popover = document.getElementById('pokedex-energy-help-popover');
  if (popover) popover.style.display = 'none';
  const modalEl = document.getElementById('pokedex-detail-modal');
  const btn = (event && (event.currentTarget || event.target)) || (modalEl ? modalEl.querySelector('.pokedex-formula-help-btn') : (typeof document.querySelector === 'function' ? document.querySelector('.pokedex-formula-help-btn') : null));
  const lang = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function') ? window.I18N.getLanguage() : 'zh-TW';
  const isEN = lang === 'en-US';
  const isCN = lang === 'zh-CN';
  const title = isEN ? 'Ideal Energy (0.45x) & 12h Daytime Baseline' : (isCN ? '理想活力 0.45x 与 12 小时基准说明' : '理想活力 0.45x 與 12 小時基準說明');
  const body = isEN
    ? 'Under ideal energy (≥80%), helping interval is reduced to <span class="text-accent font-bold">0.45x</span> (~<span class="text-accent font-bold">2.22x yield</span>).<br>Calculation adopts a <span class="text-accent font-bold">12 hours (43200s)</span> daytime active baseline: general players have 12-16 hours waking time, and Pokémon sleep requires ~8.5h, so 12h represents realistic daytime active output without non-active sleep downtime.'
    : (isCN
      ? '活力 ≥ 80% 理想状态下，帮忙间隔缩短为 <span class="text-accent font-bold">0.45 倍</span>（产能约 <span class="text-accent font-bold">2.22 倍</span>）。<br>此处算法采用 <span class="text-accent font-bold">12 小时 (43200秒)</span> 日间活跃基准：一般用户非睡眠时间约 12-16 小时，且宝可梦睡饱需 8.5 小时，扣除夜间睡眠，以 12 小时试算最符合日间实际产能期望。'
      : '活力 ≥ 80% 理想狀態下，幫忙間隔縮短為 <span class="text-accent font-bold">0.45 倍</span>（產能約 <span class="text-accent font-bold">2.22 倍</span>）。<br>此處算法採用 <span class="text-accent font-bold">12 小時 (43200秒)</span> 日間活躍基準：一般用戶非睡眠時間約 12-16 小時，且寶可夢睡飽需 8.5 小時，扣除夜間睡眠，以 12 小時試算最符合日間實際產能期望。');

  if (PokemonApp && typeof PokemonApp.toggleGlobalTooltip === 'function') {
    PokemonApp.toggleGlobalTooltip(btn, title, body);
  }
}

function closePokedexEnergyHelp(event) {
  if (event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  }
  const popover = document.getElementById('pokedex-energy-help-popover');
  if (popover) popover.style.display = 'none';
  if (PokemonApp && typeof PokemonApp.hideGlobalTooltip === 'function') {
    PokemonApp.hideGlobalTooltip();
  }
}

function updatePokedexModalAppraisalLive() {
  const pkm = pokedexModalState.pkm;
  if (!pkm) return;

  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

  // 1. 重新計算評估
  const chosenIngs = (pkm.ingredients || []).map((ing, i) => {
    const selIdx = pokedexModalState.ingSlots[i] || 0;
    return (pkm.ingredients && pkm.ingredients[selIdx]) ? pkm.ingredients[selIdx].name : (ing.name || '');
  });

  let evaluation = null;
  if (window.AppraisalLab && typeof window.AppraisalLab.evaluatePokemon === 'function') {
    evaluation = window.AppraisalLab.evaluatePokemon(pkm, pokedexModalState.level, pokedexModalState.nature, pokedexModalState.subskills, chosenIngs, pokedexModalState.ribbon, pokedexModalState.skillLevel);
  }
  if (!evaluation) {
    evaluation = {
      compositeScore: 75,
      grade: 'A',
      gradeTitle: isEN ? 'Solid Pick' : '實用良品 (Solid Pick)',
      gradeColor: '#10b981',
      scores: { berry: 60, ingredient: 70, skill: 65, speed: 65, growth: 60, roi: 65 }
    };
  }

  // 2. 更新評估 UI (頂部右側雙軌徽章)
  const curBadge = document.getElementById('pokedex-header-verdict-badge');
  const potBadge = document.getElementById('pokedex-header-potential-badge');
  const curGradeEl = document.getElementById('pokedex-header-verdict-grade') || (curBadge && curBadge.querySelector('.verdict-grade'));
  const curNumEl = document.getElementById('pokedex-header-verdict-num') || (curBadge && curBadge.querySelector('.verdict-num'));
  const potGradeEl = document.getElementById('pokedex-header-potential-grade') || (potBadge && potBadge.querySelector('.verdict-potential-grade'));
  const potNumEl = document.getElementById('pokedex-header-potential-num') || (potBadge && potBadge.querySelector('.verdict-potential-num'));

  const curEval = evaluation.current || evaluation;
  const potEval = evaluation.potential || evaluation;

  if (curGradeEl) {
    curGradeEl.textContent = curEval.grade;
    curGradeEl.style.color = curEval.gradeColor;
  }
  if (curNumEl) curNumEl.textContent = curEval.compositeScore;
  if (curBadge) {
    curBadge.style.borderColor = curEval.gradeColor;
    curBadge.setAttribute('title', isEN ? `Current Level Rating (Lv.${pokedexModalState.level})` : `當前實力評級 (Lv.${pokedexModalState.level})`);
    if (typeof curBadge.querySelector === 'function') {
      const curLvLabel = curBadge.querySelector('.pokedex-verdict-track-lbl') || curBadge.querySelector('span:first-child');
      if (curLvLabel) curLvLabel.textContent = isEN ? `Lv.${pokedexModalState.level}` : `當前 Lv.${pokedexModalState.level}`;
    }
  }

  if (potGradeEl) {
    potGradeEl.textContent = potEval.grade;
    potGradeEl.style.color = '#94a3b8';
  }
  if (potNumEl) potNumEl.textContent = potEval.compositeScore;
  if (potBadge) {
    potBadge.style.borderColor = 'rgba(148, 163, 184, 0.25)';
    potBadge.setAttribute('title', isEN ? 'Max Potential Rating (Lv.100)' : '畢業潛力評級 (Lv.100)');
  }

  // 3. 更新食材產能算法拆解卡片與動態數值 (幫忙間隔、持有、食材率、技能率)
  const formulaData = calculatePokedexIngredientFormulas();
  const formulaContainer = document.getElementById('pokedex-calc-formula-container');
  if (formulaContainer && formulaData) {
    formulaContainer.innerHTML = renderPokedexFormulaBreakdownHTML(formulaData, pkm);
  }

  // 更新最佳配置指南卡片 (同時支援桌面端與移動端容器)
  const deskStrategyContainer = document.getElementById('pokedex-strategy-desktop-container');
  if (deskStrategyContainer) {
    deskStrategyContainer.innerHTML = renderPokedexStrategyCardHTML(pkm);
  }
  const mobStrategyContainer = document.getElementById('pokedex-strategy-mobile-container');
  if (mobStrategyContainer) {
    mobStrategyContainer.innerHTML = renderPokedexStrategyCardHTML(pkm);
  }

  const intervalEl = document.getElementById('pokedex-stat-interval');
  if (intervalEl && formulaData) {
    intervalEl.innerHTML = renderPokedexIntervalValue(formulaData, pkm);
  }

  const carryEl = document.getElementById('pokedex-stat-carry');
  if (carryEl && formulaData) {
    carryEl.innerHTML = renderPokedexCarryValue(formulaData, pkm);
  }

  const ingRateEl = document.getElementById('pokedex-stat-ingredient-rate');
  if (ingRateEl && formulaData && typeof formulaData.finalIngRate === 'number') {
    ingRateEl.innerHTML = renderPokedexIngRateValue(formulaData, pkm);
  }

  const skillRateEl = document.getElementById('pokedex-stat-skill-rate');
  if (skillRateEl && formulaData && typeof formulaData.finalSkillRate === 'number') {
    skillRateEl.innerHTML = renderPokedexSkillRateValue(formulaData, pkm);
  }

  // 5. 更新等級數值標籤與重點圖釘狀態
  const pokedexModalEl = document.getElementById('pokedex-detail-modal');
  const valText = document.getElementById('pokedex-level-val-text');
  if (valText) {
    valText.textContent = pokedexModalState.level;
  } else {
    const levelBadge = (pokedexModalEl && typeof pokedexModalEl.querySelector === 'function')
      ? pokedexModalEl.querySelector('.pokedex-val-badge')
      : (typeof document.querySelector === 'function' ? document.querySelector('.pokedex-val-badge') : null);
    if (levelBadge) levelBadge.textContent = `Lv. ${pokedexModalState.level}`;
  }
  const unreleasedTag = document.getElementById('pokedex-level-unreleased-tag');
  if (unreleasedTag) {
    if (pokedexModalState.level > 70) {
      unreleasedTag.classList.remove('hidden');
    } else {
      unreleasedTag.classList.add('hidden');
    }
  }

  const evoGuardContainer = document.getElementById('pokedex-evo-guard-container');
  if (evoGuardContainer) {
    evoGuardContainer.innerHTML = '';
  }

  const levelCtrlGroup = (pokedexModalEl && typeof pokedexModalEl.querySelector === 'function')
    ? pokedexModalEl.querySelector('.pokedex-level-ctrl-group')
    : (typeof document.querySelector === 'function' ? document.querySelector('.pokedex-level-ctrl-group') : null);
  if (levelCtrlGroup) {
    levelCtrlGroup.classList.remove('has-evo-warning');
  }

  const trackPinBtns = (pokedexModalEl && typeof pokedexModalEl.querySelectorAll === 'function')
    ? pokedexModalEl.querySelectorAll('.pokedex-track-pin-btn')
    : (typeof document.querySelectorAll === 'function' ? document.querySelectorAll('.pokedex-track-pin-btn') : []);
  trackPinBtns.forEach(btn => {
    const titleVal = btn.getAttribute('title') || '';
    const pinLv = parseInt(btn.getAttribute('data-pin-lv') || titleVal.replace(/[^0-9]/g, ''), 10);
    btn.classList.toggle('active', pinLv === pokedexModalState.level);
  });
  const levelPinBtns = (pokedexModalEl && typeof pokedexModalEl.querySelectorAll === 'function')
    ? pokedexModalEl.querySelectorAll('.pokedex-level-pin-btn')
    : (typeof document.querySelectorAll === 'function' ? document.querySelectorAll('.pokedex-level-pin-btn') : []);
  levelPinBtns.forEach(btn => {
    const pinLv = parseInt(btn.textContent, 10);
    btn.classList.toggle('active', pinLv === pokedexModalState.level);
  });

  // 動態同步更新副技能狀態標籤與未生效標記
  updatePokedexSubskillUI();

  // 更新食材插槽解鎖標籤
  const ingSlotBoxes = (pokedexModalEl && typeof pokedexModalEl.querySelectorAll === 'function')
    ? pokedexModalEl.querySelectorAll('.pokedex-ing-slot-box')
    : (typeof document.querySelectorAll === 'function' ? document.querySelectorAll('.pokedex-ing-slot-box') : []);
  ingSlotBoxes.forEach((boxEl, sIdx) => {
    const reqLv = sIdx === 0 ? 1 : (sIdx === 1 ? 30 : 60);
    const isUnlocked = pokedexModalState.level >= reqLv;
    boxEl.classList.toggle('slot-active', isUnlocked);
    boxEl.classList.toggle('slot-locked', !isUnlocked);
  });
}

// 導出至 PokemonApp 與 全域 window
PokemonApp.openPokemonDetailModal = openPokemonDetailModal;
PokemonApp.closePokemonDetailModal = closePokemonDetailModal;
PokemonApp.applyPokedexGodPreset = applyPokedexGodPreset;
PokemonApp.applyPokedexResetPreset = applyPokedexResetPreset;
PokemonApp.setPokedexModalLevel = setPokedexModalLevel;
PokemonApp.setPokedexModalNature = setPokedexModalNature;
PokemonApp.setPokedexModalSubskill = setPokedexModalSubskill;
PokemonApp.setPokedexModalSkillLevel = setPokedexModalSkillLevel;
PokemonApp.setPokedexModalRibbon = setPokedexModalRibbon;
PokemonApp.setPokedexModalIng = setPokedexModalIng;
PokemonApp.selectPokedexSubskillSlot = selectPokedexSubskillSlot;
PokemonApp.choosePokedexSubskill = choosePokedexSubskill;
PokemonApp.clearAllPokedexSubskills = clearAllPokedexSubskills;
PokemonApp.renderPokedexIngredientStrip = renderPokedexIngredientStrip;
PokemonApp.updatePokedexSubskillUI = updatePokedexSubskillUI;
PokemonApp.calculatePokedexIngredientFormulas = calculatePokedexIngredientFormulas;
PokemonApp.getIngCountFromBase = getIngCountFromBase;
PokemonApp.getBerryBaseEnergy = getBerryBaseEnergy;
PokemonApp.calculateSingleBerryEnergy = calculateSingleBerryEnergy;
PokemonApp.BERRY_BASE_ENERGY_MAP = BERRY_BASE_ENERGY_MAP;
PokemonApp.getPokedexMinEvolutionLevel = getPokedexMinEvolutionLevel;
PokemonApp.renderPokedexEvoGuardBadgeHTML = renderPokedexEvoGuardBadgeHTML;
PokemonApp.renderPokedexRibbonOptionsHTML = renderPokedexRibbonOptionsHTML;
PokemonApp.isBfsSkillSpecialist = isBfsSkillSpecialist;
PokemonApp.isHealerSkillSpecialist = isHealerSkillSpecialist;
PokemonApp.isHelperBoostSkillSpecialist = isHelperBoostSkillSpecialist;
PokemonApp.isBerryBurstSkillSpecialist = isBerryBurstSkillSpecialist;
PokemonApp.isHealerSkillSpecialist = isHealerSkillSpecialist;
PokemonApp.isHelperBoostSkillSpecialist = isHelperBoostSkillSpecialist;
PokemonApp.isChargeStrengthSkillSpecialist = isChargeStrengthSkillSpecialist;
PokemonApp.isPotExpanderSkillSpecialist = isPotExpanderSkillSpecialist;
PokemonApp.isExtraTastySkillSpecialist = isExtraTastySkillSpecialist;
PokemonApp.isDreamShardSkillSpecialist = isDreamShardSkillSpecialist;
PokemonApp.isIngredientSkillSpecialist = isIngredientSkillSpecialist;
PokemonApp.isMetronomeSkillSpecialist = isMetronomeSkillSpecialist;
PokemonApp.isLegendaryPokemon = isLegendaryPokemon;
PokemonApp.isSlowpokeFamily = isSlowpokeFamily;
PokemonApp.isSlakingFamily = isSlakingFamily;
PokemonApp.renderPokedexStrategyCardHTML = renderPokedexStrategyCardHTML;
PokemonApp.flashSliderLockedWall = flashSliderLockedWall;
PokemonApp.togglePokedexSubskillPalette = togglePokedexSubskillPalette;
PokemonApp.togglePokedexEnergyHelp = togglePokedexEnergyHelp;
PokemonApp.closePokedexEnergyHelp = closePokedexEnergyHelp;
PokemonApp.renderPokedexFormulaBreakdownHTML = renderPokedexFormulaBreakdownHTML;
PokemonApp.showGlobalTooltip = showGlobalTooltip;
PokemonApp.hideGlobalTooltip = hideGlobalTooltip;
PokemonApp.toggleGlobalTooltip = toggleGlobalTooltip;
PokemonApp.isAnyFloatingTooltipVisible = isAnyFloatingTooltipVisible;
PokemonApp.dismissAllFloatingTooltips = dismissAllFloatingTooltips;
PokemonApp.renderPokedexIntervalValue = renderPokedexIntervalValue;
PokemonApp.renderPokedexCarryValue = renderPokedexCarryValue;
PokemonApp.renderPokedexIngRateValue = renderPokedexIngRateValue;
PokemonApp.renderPokedexSkillRateValue = renderPokedexSkillRateValue;
PokemonApp.getPokedexModalState = () => pokedexModalState;
PokemonApp.setPokedexModalState = (newState) => { pokedexModalState = Object.assign(pokedexModalState, newState); return pokedexModalState; };
Object.defineProperty(PokemonApp, 'pokedexModalState', {
  get() { return pokedexModalState; },
  set(val) { pokedexModalState = val; },
  configurable: true,
  enumerable: true
});
PokemonApp.getPokedexMainSkillYield = getPokedexMainSkillYield;
PokemonApp.getSkillDescription = getSkillDescription;
PokemonApp.BASE_SKILL_DETAILS = BASE_SKILL_DETAILS;
PokemonApp.getPokemonEvolutionItems = getPokemonEvolutionItems;
PokemonApp.renderPokedexEvoItemChipsHTML = renderPokedexEvoItemChipsHTML;

if (typeof window !== 'undefined') {
  window.openPokemonDetailModal = openPokemonDetailModal;
  window.closePokemonDetailModal = closePokemonDetailModal;
  window.getPokedexMinEvolutionLevel = getPokedexMinEvolutionLevel;
  window.renderPokedexEvoGuardBadgeHTML = renderPokedexEvoGuardBadgeHTML;
  window.getPokemonEvolutionItems = getPokemonEvolutionItems;
  window.renderPokedexEvoItemChipsHTML = renderPokedexEvoItemChipsHTML;
  window.renderPokedexRibbonOptionsHTML = renderPokedexRibbonOptionsHTML;
  window.renderPokedexStrategyCardHTML = renderPokedexStrategyCardHTML;
  window.isBerryBurstSkillSpecialist = isBerryBurstSkillSpecialist;
  window.isBfsSkillSpecialist = isBfsSkillSpecialist;
  window.isHealerSkillSpecialist = isHealerSkillSpecialist;
  window.isHelperBoostSkillSpecialist = isHelperBoostSkillSpecialist;
  window.isChargeStrengthSkillSpecialist = isChargeStrengthSkillSpecialist;
  window.isPotExpanderSkillSpecialist = isPotExpanderSkillSpecialist;
  window.isExtraTastySkillSpecialist = isExtraTastySkillSpecialist;
  window.isDreamShardSkillSpecialist = isDreamShardSkillSpecialist;
  window.isIngredientSkillSpecialist = isIngredientSkillSpecialist;
  window.isMetronomeSkillSpecialist = isMetronomeSkillSpecialist;
  window.isLegendaryPokemon = isLegendaryPokemon;
  window.isSlowpokeFamily = isSlowpokeFamily;
  window.isSlakingFamily = isSlakingFamily;
  window.getPokedexMainSkillYield = getPokedexMainSkillYield;
  window.getIngCountFromBase = getIngCountFromBase;
  window.renderPokedexFormulaBreakdownHTML = renderPokedexFormulaBreakdownHTML;
  window.togglePokedexSubskillPalette = togglePokedexSubskillPalette;
  window.togglePokedexEnergyHelp = togglePokedexEnergyHelp;
  window.closePokedexEnergyHelp = closePokedexEnergyHelp;
  window.showGlobalTooltip = showGlobalTooltip;
  window.hideGlobalTooltip = hideGlobalTooltip;
  window.toggleGlobalTooltip = toggleGlobalTooltip;
  window.dismissAllFloatingTooltips = dismissAllFloatingTooltips;
  window.getSkillDescription = getSkillDescription;
  window.BASE_SKILL_DETAILS = BASE_SKILL_DETAILS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getItemIcon: (p) => getIconUrl(p),
    getItemId: (p) => String(p.id || p.formatted_no || ''),
    getItemFormattedNo: (p) => p.formatted_no || '',
    getItemNameCN: (p) => (p.name && p.name.cn) || p.name_cn || '',
    getItemNameEN: (p) => (p.name && p.name.en) || p.name_en || '',
    getItemNameJP: (p) => (p.name && p.name.jp) || p.name_jp || '',
    getItemCarry: (p) => getItemCarry(p),
    getItemIngredientRate: (p) => getItemIngredientRate(p),
    getItemSkillRate: (p) => getItemSkillRate(p),
    getItemHelpInterval: (p) => getItemHelpInterval(p),
    DEFAULT_SVG_ICON,
    PokemonApp,
    getPokedexMinEvolutionLevel,
    renderPokedexEvoGuardBadgeHTML,
    getPokemonEvolutionItems,
    renderPokedexEvoItemChipsHTML,
    BASE_SKILLS,
    COMPOSITE_SKILL_MAP,
    SPECIAL_SKILL_DETAILS,
    BASE_SKILL_DETAILS,
    getSkillDescription,
    getBerryBaseEnergy,
    calculateSingleBerryEnergy,
    BERRY_BASE_ENERGY_MAP,
    matchesSkill,
    renderSkillWithTooltip,
    initBackToTop: (typeof PokemonApp !== 'undefined' && PokemonApp.initBackToTop) ? PokemonApp.initBackToTop : undefined,
    updateBackToTopVisibility: (typeof PokemonApp !== 'undefined' && PokemonApp.updateBackToTopVisibility) ? PokemonApp.updateBackToTopVisibility : undefined,
    initPullToRefresh: (typeof PokemonApp !== 'undefined' && PokemonApp.initPullToRefresh) ? PokemonApp.initPullToRefresh : undefined,
    bindBackdropDismiss,
    bindSidebarSwipeRightToClose,
    toggleSidebar,
    isAnyFloatingTooltipVisible,
    getHelpButtonData,
    dismissAllFloatingTooltips,
    getItemNo,
    sortPokemonList,
    parseTableSort,
    nextColumnSort,
    SORT_GETTERS,
    SORT_DEFAULT_DIR
  };
}
