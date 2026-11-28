const _FALLBACK_POKEDEX_MODAL_CAPS = /* @GAME_CONFIG_FALLBACK_START */ {"POKEMON_LEVEL_CAP":70,"RECIPE_LEVEL_CAP":70,"THEORETICAL_MAX_LEVEL":100,"ISLAND_BONUS_CAP":95,"ISLAND_BONUS_STEP":5,"RECIPE_MAX_BONUS_PCT":258,"SUBSKILL_UNLOCK_LEVELS":[10,25,50,70,80]} /* @GAME_CONFIG_FALLBACK_END */;

function _getPokedexModalCaps() {
  const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
             (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
  return (gc && typeof gc.getCaps === 'function') ? gc.getCaps() : _FALLBACK_POKEDEX_MODAL_CAPS;
}

function renderPokedexDetailModalContent() {
  const modalEl = document.getElementById('pokedex-detail-modal');
  if (!modalEl) return;
  const pkm = pokedexModalState.pkm;
  if (!pkm) return;

  const modalCaps = _getPokedexModalCaps();
  const capLv = modalCaps.POKEMON_LEVEL_CAP || 70;
  const maxLv = modalCaps.THEORETICAL_MAX_LEVEL || 100;

  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
  const tr = (k, params) => (window.I18N && typeof window.I18N.t === 'function') ? window.I18N.t(k, params) : k;

  const pkmName = window.I18N?.getPokemonName?.(pkm) ?? (pkm.name_cn || pkm.name_en || '');
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
      gradeTitle: tr('dex.ui_solid_pick'),
      gradeColor: '#10b981',
      scores: { berry: 60, ingredient: 70, skill: 65, speed: 65, growth: 60, roi: 65 }
    };
  }

  const formulaData = calculatePokedexIngredientFormulas();
  const maxSkillLvl = getPokedexMainSkillMaxLvl(pkm.main_skill);
  const minEvoLvl = getPokedexMinEvolutionLevel(pkm);
  const modalSkillDesc = typeof getSkillDescription === 'function' ? getSkillDescription(pkm.main_skill) : '';

  modalEl.innerHTML = `
    <div class="pokedex-modal-backdrop-dismiss" onclick="window.PokemonApp.closePokemonDetailModal()"></div>
    <div class="box-modal-dialog pokedex-modal-dialog mobile-box-sheet bottom-sheet mobile-modal-sheet" role="dialog" aria-modal="true">
      <!-- 頂部標題列 (編號與進化石/樹果/專長並列於首行、名稱獨佔次行防重疊、單行水平基礎數值) -->
      <div class="box-modal-header pokedex-modal-header">
        <div class="pokedex-modal-header-main">
          <div class="box-modal-title pokedex-modal-title">
            ${iconUrl ? `<img src="${iconUrl}" class="pokedex-header-avatar" width="50" height="50" alt="${escapeHtml(pkmName)}" loading="lazy" decoding="async" onerror="handlePokemonIconError(this)">` : ''}
            <div class="pokedex-header-info">
              <div class="pokedex-header-top-row">
                <span class="pokedex-header-no">No.${pkm.formatted_no || ''}</span>
                <div class="pokedex-header-tags pokedex-header-berry-spec-group">
                  ${renderPokedexEvoItemChipsHTML(pkm)}
                  <span class="pokedex-tag pokedex-tag-berry" title="${escapeHtml(berryName)}">
                    ${berry.icon ? `<img src="${berry.icon}" class="pokedex-berry-icon-img" width="22" height="22" alt="${escapeHtml(berryName)}" title="${escapeHtml(berryName)}" loading="lazy" decoding="async">` : ''}
                  </span>
                  ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkm.specialty, 20, 'pokedex-tag pokedex-tag-spec') : `<span class="pokedex-tag pokedex-tag-spec ${specClass}">${escapeHtml(specName)}</span>`}
                </div>
              </div>
              <div class="pokedex-header-name-row">
                <span class="pokedex-header-pkm-name font-bold">${escapeHtml(pkmName)}</span>
              </div>
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
            <div class="pokedex-header-verdict-badge current-track" id="pokedex-header-verdict-badge" style="border-color: ${(evaluation.current || evaluation).gradeColor};" title="${tr('dex.ui_cur_rating_tip', { level: pokedexModalState.level })}">
              <span class="pokedex-verdict-track-lbl" style="font-size:10px;color:#94a3b8;line-height:1;">${tr('dex.ui_cur_lv_badge', { level: pokedexModalState.level })}</span>
              <span class="verdict-grade pokedex-header-grade-text" id="pokedex-header-verdict-grade" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:14px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
              <span class="pokedex-header-score-text" style="font-size:11px;"><span class="verdict-num font-bold" id="pokedex-header-verdict-num">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
            </div>
            <!-- 滿級潛力 (次要，小一點，上下並行在下方，一般較不明顯的顏色，不要高亮) -->
            <div class="pokedex-header-verdict-badge potential-track" id="pokedex-header-potential-badge" title="${tr('dex.ui_pot_rating_tip')}">
              <span class="pokedex-verdict-track-lbl" style="font-size:9px;color:#64748b;line-height:1;">${tr('dex.ui_pot_badge')}</span>
              <span class="verdict-potential-grade pokedex-header-grade-text" id="pokedex-header-potential-grade" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
              <span class="pokedex-header-score-text" style="font-size:10px;color:#94a3b8;"><span class="verdict-potential-num" id="pokedex-header-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
            </div>
          </div>
          <button type="button" class="box-modal-close pokedex-modal-close-btn" onclick="window.PokemonApp.closePokemonDetailModal()" aria-label="${tr('dex.ui_close')}"><svg class="pokedex-close-x-svg" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg></button>
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

        <!-- 右欄：表單控制項 (進化家族樹、等級軌道圖釘、食材平鋪、主技能一行展示、性格、睡飽飽獎章、副技能) -->
        <div class="pokedex-modal-col pokedex-right-col box-modal-form">
          <div class="box-form-grid pokedex-controls-container">
            <!-- 0. 互動式進化家族樹與條件跳轉 -->
            <div class="box-form-group box-full-width pokedex-evo-tree-group">
              ${typeof renderPokedexEvolutionTreeHTML === 'function' ? renderPokedexEvolutionTreeHTML(pkm) : ''}
            </div>

            <!-- 1. 等級軌道錨定滑桿 + 畢業神配置與重置預設快捷按鈕 -->
            <div class="box-form-group box-full-width pokedex-level-ctrl-group">
              <div class="pokedex-level-header-row">
                <div class="pokedex-level-header-left">
                  <label class="box-form-label" for="pokedex-level-slider" style="margin-bottom:0;">${t('pokedex.level_slider', '等級設定')} (<span class="pokedex-val-badge font-bold" id="pokedex-level-val-badge">Lv. <span id="pokedex-level-val-text">${pokedexModalState.level}</span><span id="pokedex-level-unreleased-tag" class="pokedex-unreleased-pill ${pokedexModalState.level > capLv ? '' : 'hidden'}">${t('pokedex.unreleased', '尚未開放')}</span></span>)</label>
                  <button type="button" class="pokedex-btn-preset preset-god" onclick="window.PokemonApp.applyPokedexGodPreset()" title="${t('pokedex.preset_god', '畢業神配置')}">${t('pokedex.preset_god', '畢業神配置')}</button>
                </div>
                <div class="pokedex-level-header-right">
                  <button type="button" class="pokedex-header-reset-btn pokedex-btn-preset preset-reset" onclick="window.PokemonApp.applyPokedexResetPreset()" title="${t('pokedex.preset_reset', '重置預設')}">[↺] ${t('pokedex.preset_reset', '重置預設')}</button>
                </div>
              </div>
              <div class="pokedex-anchored-slider-wrap">
                <div class="pokedex-slider-track-wrap">
                  <div class="pokedex-slider-track-bar">
                    <div class="pokedex-slider-fill-bar" id="pokedex-slider-fill-bar" style="width: ${((pokedexModalState.level - 1) / (maxLv - 1) * 100).toFixed(2)}%;"></div>
                    ${minEvoLvl > 1 ? `
                      <div class="pokedex-slider-locked-zone" id="pokedex-slider-locked-zone" style="width: ${((minEvoLvl - 1) / (maxLv - 1) * 100).toFixed(2)}%;" title="${tr('dex.ui_locked_evo_tip', { level: minEvoLvl })}">
                        <span class="pokedex-slider-locked-edge"></span>
                      </div>
                    ` : ''}
                  </div>
                  <input type="range" id="pokedex-level-slider" min="1" max="${maxLv}" value="${pokedexModalState.level}" class="pokedex-slider ${minEvoLvl > 1 ? 'has-locked-zone' : ''}" oninput="window.PokemonApp.setPokedexModalLevel(this.value)">
                </div>
                <div class="pokedex-track-pins-bar" id="pokedex-track-pins-bar">
                  ${(() => {
                    const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) || (typeof window !== 'undefined' && window.GAME_CONFIG);
                    const allMilestones = (gc && typeof gc.getAllPokedexPinMilestones === 'function')
                      ? gc.getAllPokedexPinMilestones()
                      : Array.from(new Set([10, 25, 30, 50, 60, ...(modalCaps.SUBSKILL_UNLOCK_LEVELS || [10, 25, 50, 70, 80]), capLv, maxLv])).sort((a, b) => a - b);
                    // 紅色不可滑動區間（低於最低進化等級）不展示快捷等級圖釘，亦不額外插入重疊門檻圖釘
                    const pins = allMilestones.filter(lv => lv >= minEvoLvl);
                    const unlockNotes = {
                      10: tr('dex.ui_pin_sub1'),
                      25: tr('dex.ui_pin_sub2'),
                      30: tr('dex.ui_pin_ing2'),
                      50: tr('dex.ui_pin_sub3'),
                      60: tr('dex.ui_pin_ing3'),
                      80: tr('dex.ui_pin_sub4'),
                      [maxLv]: tr('dex.ui_pin_max')
                    };
                    if (capLv !== 60) {
                      unlockNotes[capLv] = tr('dex.ui_pin_cap');
                    } else {
                      unlockNotes[60] = tr('dex.ui_pin_ing3_cap');
                    }
                    return pins.map(lv => {
                      const pct = ((lv - 1) / (maxLv - 1)) * 100;
                      const isUnreleased = lv > capLv;
                      const isCap = lv === capLv;
                      const isActive = pokedexModalState.level === lv;
                      const classes = ['pokedex-track-pin-btn', 'pin-milestone'];
                      if (isActive) classes.push('active');
                      if (isCap) classes.push('pin-cap');
                      if (isUnreleased) classes.push('pin-unreleased');

                      let tooltip = `Lv.${lv}`;
                      if (isCap && capLv !== 60) {
                        tooltip += ` (${tr('dex.ui_pin_cap')})`;
                      } else if (unlockNotes[lv]) {
                        tooltip += ` (${unlockNotes[lv]})`;
                      } else if (isUnreleased) {
                        tooltip = `Lv.${lv} (${tr('dex.ui_pin_unreleased')})`;
                      } else if (isCap) {
                        tooltip = `Lv.${lv} (${tr('dex.ui_pin_cap')})`;
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
                <span id="pokedex-poke-main-skill-name" class="box-mainskill-name-badge" title="${escapeHtml(modalSkillDesc)}">${escapeHtml((typeof window !== 'undefined' && window.I18N && typeof window.I18N.getMainSkillName === 'function') ? window.I18N.getMainSkillName(pkm.main_skill || '--') : (typeof stripSpecialSkillParens === 'function' ? stripSpecialSkillParens(pkm.main_skill || '--') : (pkm.main_skill || '--')))}</span>
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
                    const buffLabel = window.I18N?.pick?.({ 'zh-TW': n.buff, 'en-US': n.buff_en || n.buff }) ?? n.buff;
                    const debuffLabel = n.debuff ? (window.I18N?.pick?.({ 'zh-TW': n.debuff, 'en-US': n.debuff_en || n.debuff }) ?? n.debuff) : '';
                    return `<option value="${n.name}" ${pokedexModalState.nature === n.name ? 'selected' : ''}>${natDisplayName} (${buffLabel}${debuffLabel ? ' / ' + debuffLabel : ''})</option>`;
                  }).join('')}
                </select>
              </div>
            </div>

            <!-- 6. 副技能配置：單行 5 階插槽 + 平鋪副技能選擇盤 (清空全部按鈕) -->
            <div class="box-form-group box-full-width">
              <div class="pokedex-subskill-header-row" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:nowrap;">
                <label class="box-form-label">${t('box.modal_poke_subskills', '副技能配置')}</label>
                <button type="button" id="pokedex-subskill-clear-all-btn" class="box-subskill-clear-btn" onclick="window.PokemonApp.clearAllPokedexSubskills()" title="${t('box.modal_clear_all_subskills', '清空全部副技能')}">${t('box.modal_clear_all_subskills', '清空全部')}</button>
              </div>

              <!-- 單行 5 階插槽列 -->
              <div class="box-subskill-slots-row" id="pokedex-subskill-slots-row"></div>

              <!-- H5 App 專用展開/隱藏切換按鈕 (佔滿版寬，網頁版維持默認顯示且不展示按鈕) -->
              <button type="button" id="pokedex-subskill-toggle-btn" class="pokedex-subskill-toggle-btn ${pokedexSubskillPaletteExpanded ? 'is-expanded' : ''}" onclick="window.PokemonApp.togglePokedexSubskillPalette()">
                <span class="pokedex-subskill-toggle-text">${pokedexSubskillPaletteExpanded ? tr('dex.ui_collapse_subskills') : tr('dex.ui_expand_subskills')}</span>
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
PokemonApp.getPokemonEvolutionFamily = getPokemonEvolutionFamily;
PokemonApp.formatPokemonEvoReq = formatPokemonEvoReq;
PokemonApp.renderPokedexEvolutionTreeHTML = renderPokedexEvolutionTreeHTML;

if (typeof window !== 'undefined') {
  window.openPokemonDetailModal = openPokemonDetailModal;
  window.closePokemonDetailModal = closePokemonDetailModal;
  window.getPokedexMinEvolutionLevel = getPokedexMinEvolutionLevel;
  window.renderPokedexEvoGuardBadgeHTML = renderPokedexEvoGuardBadgeHTML;
  window.getPokemonEvolutionItems = getPokemonEvolutionItems;
  window.renderPokedexEvoItemChipsHTML = renderPokedexEvoItemChipsHTML;
  window.getPokemonEvolutionFamily = getPokemonEvolutionFamily;
  window.formatPokemonEvoReq = formatPokemonEvoReq;
  window.renderPokedexEvolutionTreeHTML = renderPokedexEvolutionTreeHTML;
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
    getPokemonEvolutionFamily,
    formatPokemonEvoReq,
    renderPokedexEvolutionTreeHTML,
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
