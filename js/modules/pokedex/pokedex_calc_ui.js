function formatPokedexIntervalDiff(diffSec) {
  if (diffSec === 0) return { text: '(+0s)', cls: 'diff-zero' };
  const absSec = Math.abs(diffSec);
  const m = Math.floor(absSec / 60);
  const s = absSec % 60;
  const timeStr = m > 0 ? `${m}:${s < 10 ? '0' : ''}${s}` : `${s}s`;
  if (diffSec < 0) {
    return { text: `(-${timeStr})`, cls: 'diff-pos' };
  } else {
    return { text: `(+${timeStr})`, cls: 'diff-neg' };
  }
}

function renderPokedexIntervalValue(f, pkm) {
  if (!f) return formatHelpInterval(pkm ? pkm.interval : 0);
  const mainVal = formatHelpInterval(f.effectiveIntervalSec);
  const diff = formatPokedexIntervalDiff(f.diffSec);
  return `${mainVal}<span class="header-stat-diff ${diff.cls}">${diff.text}</span>`;
}

function renderPokedexCarryValue(f, pkm) {
  if (!f) {
    const baseC = pkm ? (pkm.carry || pkm.carryCapacity || '--') : '--';
    return `${baseC}`;
  }
  const diffVal = f.diffCarry;
  let diffCls = 'diff-zero';
  let diffSign = '+';
  if (diffVal > 0) {
    diffCls = 'diff-pos';
    diffSign = '+';
  } else if (diffVal < 0) {
    diffCls = 'diff-neg';
    diffSign = '';
  }
  return `${f.effectiveCarry}<span class="header-stat-diff ${diffCls}">(${diffSign}${diffVal})</span>`;
}

function formatRateWithTens(val) {
  if (typeof val !== 'number' || isNaN(val)) return '--';
  const parts = val.toFixed(2).split('.');
  // When integer part is single-digit (e.g. 2.10%), pad with a figure space (\u2007)
  // instead of '0', leaving a visual empty space of exact digit width for vertical % alignment.
  const intPart = parts[0].length < 2 ? '\u2007' + parts[0] : parts[0];
  return `${intPart}.${parts[1]}%`;
}

function renderPokedexIngRateValue(f, pkm) {
  if (!f || typeof f.finalIngRate !== 'number') {
    if (!pkm || !pkm.ingredient_rate) return '--';
    const num = parseFloat(pkm.ingredient_rate);
    return isNaN(num) ? pkm.ingredient_rate : formatRateWithTens(num);
  }
  const diffVal = f.diffIngRate;
  let diffCls = 'diff-zero';
  let diffSign = '+';
  if (diffVal > 0.001) {
    diffCls = 'diff-pos';
    diffSign = '+';
  } else if (diffVal < -0.001) {
    diffCls = 'diff-neg';
    diffSign = '';
  }
  return `${formatRateWithTens(f.finalIngRate)}<span class="header-stat-diff ${diffCls}">(${diffSign}${diffVal.toFixed(2)}%)</span>`;
}

function renderPokedexSkillRateValue(f, pkm) {
  if (!f || typeof f.finalSkillRate !== 'number') {
    if (!pkm || !pkm.skill_rate) return '--';
    const num = parseFloat(pkm.skill_rate);
    return isNaN(num) ? pkm.skill_rate : formatRateWithTens(num);
  }
  const diffVal = f.diffSkillRate;
  let diffCls = 'diff-zero';
  let diffSign = '+';
  if (diffVal > 0.001) {
    diffCls = 'diff-pos';
    diffSign = '+';
  } else if (diffVal < -0.001) {
    diffCls = 'diff-neg';
    diffSign = '';
  }
  return `${formatRateWithTens(f.finalSkillRate)}<span class="header-stat-diff ${diffCls}">(${diffSign}${diffVal.toFixed(2)}%)</span>`;
}

function renderPokedexRibbonOptionsHTML(pkm, currentRibbon) {
  let remainingEvos = 0;
  if (pkm) {
    if (typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRemainingEvolutions === 'function') {
      remainingEvos = window.AppraisalLab.getRemainingEvolutions(pkm);
    } else {
      const isFinal = (typeof isFinalEvolution === 'function')
        ? isFinalEvolution(pkm)
        : (pkm.is_final === '〇' || pkm.is_final === 'O' || pkm.is_final === 'o' || pkm.is_final === true || pkm.is_final === '1');
      remainingEvos = isFinal ? 0 : 1;
    }
  }

  const tr = (k) => window.I18N?.t?.(k) ?? k;
  const currentVal = parseInt(currentRibbon, 10) || 0;
  let opt2Text = '';
  const opt3Text = tr('dex.ui_ribbon_lv3');
  let opt4Text = '';

  if (!pkm) {
    opt2Text = tr('dex.ui_ribbon_lv2_generic');
    opt4Text = tr('dex.ui_ribbon_lv4_generic');
  } else if (remainingEvos === 2) {
    opt2Text = tr('dex.ui_ribbon_lv2_evo2');
    opt4Text = tr('dex.ui_ribbon_lv4_evo2');
  } else if (remainingEvos === 1) {
    opt2Text = tr('dex.ui_ribbon_lv2_evo1');
    opt4Text = tr('dex.ui_ribbon_lv4_evo1');
  } else {
    opt2Text = tr('dex.ui_ribbon_lv2_evo0');
    opt4Text = tr('dex.ui_ribbon_lv4_evo0');
  }

  const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : (typeof window !== 'undefined' && window.location && window.location.pathname.includes('/app/') ? '../' : '');
  const optionsData = [
    { val: 0, text: tr('dex.ui_ribbon_lv0'), icon: '' },
    { val: 1, text: tr('dex.ui_ribbon_lv1'), icon: `${base}assets/ribbons/ribbon_lv1.png` },
    { val: 2, text: opt2Text, icon: `${base}assets/ribbons/ribbon_lv2.png` },
    { val: 3, text: opt3Text, icon: `${base}assets/ribbons/ribbon_lv3.png` },
    { val: 4, text: opt4Text, icon: `${base}assets/ribbons/ribbon_lv4.png` }
  ];

  return optionsData.map(o => `
    <option value="${o.val}" ${o.icon ? `data-icon="${o.icon}"` : ''} ${o.val === currentVal ? 'selected' : ''}>${escapeHtml(o.text)}</option>
  `).join('');
}

function renderPokedexStrategyCardHTML(pkm) {
  if (!pkm) return '';

  const tr = (k) => window.I18N?.t?.(k) ?? k;
  const subName = (k) => window.I18N?.getSubSkillName?.(k) ?? k;
  const specialty = pkm.specialty || '';
  let roleTitle = '';
  let coreSkill = '';
  let coreTier = 'gold';
  let recommendedSubs = [];
  let recommendedNatures = '';

  if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
    roleTitle = tr('dex.ui_strat_berry_title');
    coreSkill = subName('樹果數量S');
    coreTier = 'gold';
    recommendedSubs = ['樹果數量S', '幫手獎勵', '幫忙速度M', '幫忙速度S', '持有上限提升L'].map(subName);
    recommendedNatures = tr('dex.ui_strat_berry_nature');
  } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
    roleTitle = tr('dex.ui_strat_ing_title');
    coreSkill = subName('食材機率提升M');
    coreTier = 'blue';
    recommendedSubs = ['幫手獎勵', '食材機率提升M', '食材機率提升S', '幫忙速度M', '幫忙速度S', '持有上限提升L'].map(subName);
    recommendedNatures = tr('dex.ui_strat_ing_nature');
  } else {
    const isBerryBurst = isBerryBurstSkillSpecialist(pkm);
    const isHealer = isHealerSkillSpecialist(pkm);
    const isHelper = isHelperBoostSkillSpecialist(pkm);
    const isCharge = isChargeStrengthSkillSpecialist(pkm);

    if (isBerryBurst) {
      roleTitle = tr('dex.ui_strat_burst_title');
      coreSkill = [subName('樹果數量S'), subName('技能機率提升M')];
      coreTier = 'gold';
      recommendedSubs = ['樹果數量S', '技能機率提升M', '幫手獎勵', '幫忙速度M', '持有上限提升L', '技能機率提升S'].map(subName);
      recommendedNatures = tr('dex.ui_strat_burst_nature');
    } else if (isHealer) {
      roleTitle = tr('dex.ui_strat_healer_title');
      coreSkill = subName('技能機率提升M');
      coreTier = 'blue';
      recommendedSubs = ['技能機率提升M', '幫手獎勵', '技能機率提升S', '幫忙速度M', '幫忙速度S', '持有上限提升L'].map(subName);
      recommendedNatures = tr('dex.ui_strat_healer_nature');
    } else if (isHelper) {
      roleTitle = tr('dex.ui_strat_helper_title');
      coreSkill = subName('技能機率提升M');
      coreTier = 'blue';
      recommendedSubs = ['技能機率提升M', '幫手獎勵', '技能機率提升S', '持有上限提升L', '幫忙速度M', '持有上限提升M'].map(subName);
      recommendedNatures = tr('dex.ui_strat_helper_nature');
    } else if (isCharge) {
      roleTitle = tr('dex.ui_strat_charge_title');
      coreSkill = subName('技能機率提升M');
      coreTier = 'blue';
      recommendedSubs = ['技能機率提升M', '幫手獎勵', '技能機率提升S', '幫忙速度M', '持有上限提升L', '樹果數量S'].map(subName);
      recommendedNatures = tr('dex.ui_strat_charge_nature');
    } else {
      roleTitle = tr('dex.ui_strat_tactical_title');
      coreSkill = subName('技能機率提升M');
      coreTier = 'blue';
      recommendedSubs = ['幫手獎勵', '技能機率提升M', '技能機率提升S', '幫忙速度M', '幫忙速度S', '持有上限提升L'].map(subName);
      recommendedNatures = tr('dex.ui_strat_tactical_nature');
    }
  }

  const getSubskillTier = (name) => {
    const sk = POKEDEX_MODAL_SUBSKILLS.find(item =>
      item.name === name ||
      item.name_en === name ||
      (typeof window !== 'undefined' && window.I18N && typeof window.I18N.toSimplified === 'function' && window.I18N.toSimplified(item.name) === name)
    );
    return sk ? sk.tier : 'white';
  };

  const coreChipsHtml = Array.isArray(coreSkill)
    ? coreSkill.map(sk => `<span class="strategy-chip subskill-${getSubskillTier(sk)} strategy-core-chip">${escapeHtml(sk)}</span>`).join(' ')
    : `<span class="strategy-chip subskill-${coreTier} strategy-core-chip">${escapeHtml(coreSkill)}</span>`;

  return `
    <div class="pokedex-strategy-card">
      <div class="strategy-card-title pokedex-formula-badge font-bold">${roleTitle}</div>
      <div class="strategy-details-grid">
        <div class="strategy-item strategy-item-core">
          <span class="strategy-k strategy-core-k">${tr('dex.ui_strat_core_skill')}：</span>
          ${coreChipsHtml}
        </div>
        <div class="strategy-item">
          <span class="strategy-k">${tr('dex.ui_strat_recommended')}：</span>
          <div class="strategy-chips-wrap">
            ${recommendedSubs.map(s => `<span class="strategy-chip subskill-${getSubskillTier(s)}">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
        <div class="strategy-item">
          <span class="strategy-k">${tr('dex.ui_strat_best_nature')}：</span>
          <span class="strategy-v text-accent">${recommendedNatures}</span>
        </div>
      </div>
    </div>
  `;
}
