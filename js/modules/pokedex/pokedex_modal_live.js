function renderPokedexFormulaBreakdownHTML(f, pkm) {
  if (!f) return '';
  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
  const tr = (k, params) => (window.I18N && typeof window.I18N.t === 'function') ? window.I18N.t(k, params) : k;

  const natureIngMultStr = f.cleanseMint
    ? tr('dex.ui_mint_mult', { val: f.natureIngMult.toFixed(2) })
    : f.natureIngMult.toFixed(2);
  const natureSkillMultStr = f.cleanseMint
    ? tr('dex.ui_mint_mult', { val: f.natureSkillMult.toFixed(2) })
    : f.natureSkillMult.toFixed(2);
  const subskillIngMultStr = (1 + f.subskillIngBonus / 100).toFixed(2);
  const subskillSkillMultStr = (1 + f.subskillSkillBonus / 100).toFixed(2);

  return `
    <div class="pokedex-formula-inner">
      <div class="pokedex-formula-header">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="pokedex-formula-badge font-bold">${t('pokedex.formula_title', '產能算法精算拆解')}</span>
          <button type="button" class="pokedex-formula-help-btn" onclick="window.PokemonApp.togglePokedexEnergyHelp(event)" title="${tr('dex.ui_energy_help_btn_tip')}" aria-label="Energy Info">?</button>
        </div>
        <div id="pokedex-energy-help-popover" class="pokedex-energy-help-popover" style="display:none;" role="tooltip">
          <div class="pokedex-energy-help-backdrop" onclick="window.PokemonApp.closePokedexEnergyHelp(event)"></div>
          <div class="pokedex-energy-help-bubble">
            <div class="energy-help-title font-bold">${tr('dex.ui_energy_help_title')}</div>
            <div class="energy-help-body">${tr('dex.ui_energy_help_body')}</div>
          </div>
        </div>
      </div>

      <!-- 單一整合精算卡片 (無冗餘外框，邏輯由間隔頻率 -> 樹果能量 -> 食材產量 -> 技能期望，清晰順暢) -->
      <div class="pokedex-calc-unified-box">
        <!-- 步驟 1：實質幫忙間隔與日間次數基準 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${tr('dex.ui_step_helps_title')}</span>
            <div class="calc-row-header-values">
              <span class="calc-val-main font-bold calc-color-helps">${f.dailyHelps.toFixed(1)} ${tr('dex.ui_unit_helps')}</span>
            </div>
          </div>
          <div class="calc-row-formula">
            <span class="formula-derive font-mono">${tr('dex.ui_helps_formula_prefix')}${f.effectiveIntervalSec}s × 0.45) = <strong class="calc-color-helps">${f.dailyHelps.toFixed(1)} ${tr('dex.ui_unit_helps')}</strong></span>
          </div>
        </div>

        <!-- 步驟 2：樹果產量與單日能量 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${tr('dex.ui_step_berry_title')}</span>
            <div class="calc-row-header-values">
              <span class="calc-val-main font-bold calc-color-berry">${f.dailyBerryEnergy.toLocaleString()} ${tr('dex.ui_unit_strength')}</span>
            </div>
          </div>
          <div class="calc-row-formula">
            <span class="formula-derive font-mono"><span class="formula-var font-bold">${f.dailyBerryHelps.toFixed(1)}${tr('dex.ui_unit_helps_compact')}</span> × <span class="calc-color-berry font-bold">${f.berriesPerHelp}${tr('dex.ui_unit_berries_compact')}</span> × <span class="formula-var" title="${tr('dex.ui_single_berry_tip')}">${f.singleBerryEnergy}</span> = <strong class="calc-color-berry">${f.dailyBerryEnergy.toLocaleString()} ${tr('dex.ui_unit_strength')}</strong></span>
          </div>
          <div class="berry-row-detail font-mono">
            <span class="berry-detail-left">${f.berryIcon ? `<img src="${f.berryIcon}" class="yield-pill-img" width="17" height="17" alt="${escapeHtml(f.berryName)}" loading="lazy" decoding="async" style="vertical-align:middle;margin-right:2px;">` : ''}<span class="yield-pill-name">${escapeHtml(f.berryName)}</span> <span class="calc-color-berry font-bold">${f.singleBerryEnergy} ${tr('dex.ui_energy_per_berry')}</span></span>
            <span class="calc-color-berry-fav font-bold" title="${tr('dex.ui_fav_berry_tip')}">${tr('dex.ui_fav_berry_prefix')}${f.dailyBerryEnergyFav.toLocaleString()} ${tr('dex.ui_unit_strength')}</span>
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
            <span class="formula-var" title="${tr('dex.ui_base_ing_rate_tip')}">${f.baseIngRate.toFixed(1)}%</span>
            <span class="formula-op">×</span>
            <span class="formula-var" title="${tr('dex.ui_subskill_mult_tip')}">${subskillIngMultStr}</span>
            <span class="formula-op">×</span>
            <span class="formula-var" title="${f.cleanseMint ? tr('dex.ui_nature_mint_tip') : tr('dex.ui_nature_tip')}">${natureIngMultStr}</span>
            <span class="formula-op">=</span>
            <span class="formula-res font-bold calc-color-ing">${f.finalIngRate.toFixed(2)}%</span>
            <span class="formula-op">-&gt;</span>
            <span class="formula-derive font-mono"><span class="calc-color-helps font-bold">${f.dailyHelps.toFixed(1)}${tr('dex.ui_unit_helps_compact')}</span> × <span class="calc-color-ing font-bold">${f.finalIngRate.toFixed(2)}%</span> = <strong class="calc-color-yield">${f.dailyIngDrops.toFixed(1)} ${tr('dex.ui_unit_drops')}</strong></span>
          </div>
          <div class="pokedex-yield-items-grid">
            ${f.summaryYieldList.map(item => `
              <div class="pokedex-yield-pill">
                ${item.icon ? `<img src="${item.icon}" class="yield-pill-img" width="17" height="17" alt="${escapeHtml(item.name)}" loading="lazy" decoding="async">` : ''}
                <span class="yield-pill-name">${escapeHtml(item.name)}</span>
                <span class="yield-pill-count font-bold calc-color-yield">${item.daily.toFixed(1)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 步驟 4：最終技能發動率與單日發動次數 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${tr('dex.ui_step_skill_title')}</span>
            <div class="calc-row-header-values">
              <span class="calc-val-main font-bold calc-color-skill">${f.finalSkillRate.toFixed(2)}%</span>
            </div>
          </div>
          <div class="calc-row-formula">
            <span class="formula-var" title="${tr('dex.ui_base_skill_rate_tip')}">${f.baseSkillRate.toFixed(1)}%</span>
            <span class="formula-op">×</span>
            <span class="formula-var" title="${tr('dex.ui_subskill_mult_tip')}">${subskillSkillMultStr}</span>
            <span class="formula-op">×</span>
            <span class="formula-var" title="${f.cleanseMint ? tr('dex.ui_nature_mint_tip') : tr('dex.ui_nature_tip')}">${natureSkillMultStr}</span>
            <span class="formula-op">=</span>
            <span class="formula-res font-bold calc-color-skill">${f.finalSkillRate.toFixed(2)}%</span>
            <span class="formula-op">-&gt;</span>
            <span class="formula-derive font-mono"><span class="calc-color-helps font-bold">${f.dailyHelps.toFixed(1)}${tr('dex.ui_unit_helps_compact')}</span> × <span class="calc-color-skill font-bold">${f.finalSkillRate.toFixed(2)}%</span> = <strong class="calc-color-triggers">${f.dailyTriggers.toFixed(2)} ${tr('dex.ui_unit_triggers')}</strong></span>
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
  const title = window.I18N?.t?.('dex.ui_energy_help_title') ?? 'dex.ui_energy_help_title';
  const body = window.I18N?.t?.('dex.ui_energy_help_body') ?? 'dex.ui_energy_help_body';

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

  const tr = (k, params) => (window.I18N && typeof window.I18N.t === 'function') ? window.I18N.t(k, params) : k;

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
      gradeTitle: tr('dex.ui_solid_pick'),
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
    curBadge.setAttribute('title', tr('dex.ui_cur_rating_tip', { level: pokedexModalState.level }));
    if (typeof curBadge.querySelector === 'function') {
      const curLvLabel = curBadge.querySelector('.pokedex-verdict-track-lbl') || curBadge.querySelector('span:first-child');
      if (curLvLabel) curLvLabel.textContent = tr('dex.ui_cur_lv_badge', { level: pokedexModalState.level });
    }
  }

  if (potGradeEl) {
    potGradeEl.textContent = potEval.grade;
    potGradeEl.style.color = '#94a3b8';
  }
  if (potNumEl) potNumEl.textContent = potEval.compositeScore;
  if (potBadge) {
    potBadge.style.borderColor = 'rgba(148, 163, 184, 0.25)';
    potBadge.setAttribute('title', tr('dex.ui_pot_rating_tip'));
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
    const caps = _getPokedexModalCaps();
    const capLv = caps.POKEMON_LEVEL_CAP || 70;
    if (pokedexModalState.level > capLv) { // default: pokedexModalState.level > 70
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
