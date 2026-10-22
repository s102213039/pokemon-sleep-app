  function getIngCountFromBase(basePkm, slotIdx, ingName) {
    if (!basePkm || !basePkm.ingredients) {
      return slotIdx === 0 ? 1 : (slotIdx === 1 ? 2 : 4);
    }
    const found = basePkm.ingredients.find(function(ig) { return ig.name === ingName; });
    if (found) {
      if (slotIdx === 0 && found.l1 !== undefined) return parseInt(found.l1, 10);
      if (slotIdx === 1 && found.l30 !== undefined) return parseInt(found.l30, 10);
      if (slotIdx === 2 && found.l60 !== undefined) return parseInt(found.l60, 10);
      if (typeof found.count === 'number') return found.count;
    }
    const slotIng = basePkm.ingredients[slotIdx];
    if (slotIng) {
      if (slotIdx === 0 && slotIng.l1 !== undefined) return parseInt(slotIng.l1, 10);
      if (slotIdx === 1 && slotIng.l30 !== undefined) return parseInt(slotIng.l30, 10);
      if (slotIdx === 2 && slotIng.l60 !== undefined) return parseInt(slotIng.l60, 10);
      if (typeof slotIng.count === 'number') return slotIng.count;
    }
    return slotIdx === 0 ? 1 : (slotIdx === 1 ? 2 : 4);
  }

  /* ─── 副技能分級判斷 ───────────────────────────────────── */
  const GOLD_SUBSKILLS = new Set(['幫手獎勵', '樹果數量S', '技能等級提升M', '夢之碎片獎勵', '睡眠EXP獎勵', '研究EXP獎勵', '活力回復獎勵']);
  const BLUE_SUBSKILLS = new Set(['幫忙速度M', '食材機率提升M', '技能機率提升M', '技能等級提升S', '持有上限提升L', '持有上限提升M']);

  const DEFAULT_SUBSKILLS_DATA = [
    { name: '樹果數量S', tier: 'gold' },
    { name: '幫手獎勵', tier: 'gold' },
    { name: '睡眠EXP獎勵', tier: 'gold' },
    { name: '活力回復獎勵', tier: 'gold' },
    { name: '夢之碎片獎勵', tier: 'gold' },
    { name: '研究EXP獎勵', tier: 'gold' },
    { name: '技能等級提升M', tier: 'gold' },
    { name: '幫忙速度M', tier: 'blue' },
    { name: '食材機率提升M', tier: 'blue' },
    { name: '技能機率提升M', tier: 'blue' },
    { name: '技能等級提升S', tier: 'blue' },
    { name: '持有上限提升L', tier: 'blue' },
    { name: '持有上限提升M', tier: 'blue' },
    { name: '幫忙速度S', tier: 'white' },
    { name: '食材機率提升S', tier: 'white' },
    { name: '技能機率提升S', tier: 'white' },
    { name: '持有上限提升S', tier: 'white' },
    { name: '活力回復提升S', tier: 'white' }
  ];

  function getSkillTier(sName) {
    if (!sName) return 'white';
    if (GOLD_SUBSKILLS.has(sName)) return 'gold';
    if (BLUE_SUBSKILLS.has(sName)) return 'blue';
    const subskillPool = (typeof window !== 'undefined' && ((window.UserBox && window.UserBox.SUBSKILLS_DATA) || (window.PokemonBoxApp && window.PokemonBoxApp.SUBSKILLS_DATA))) || DEFAULT_SUBSKILLS_DATA;
    const found = subskillPool.find(function (s) { return s.name === sName; });
    if (found && found.tier) return found.tier;
    return 'white';
  }

  /* ─── 診斷報告書彈窗管理 ───────────────────────────────── */
  function openAppraisalModal(pkmOrBoxItem) {
    if (!pkmOrBoxItem) return;
    if (window.AppraisalLab) {
      window.AppraisalLab._currentBoxItem = (pkmOrBoxItem && pkmOrBoxItem.rawItem) ? pkmOrBoxItem.rawItem : (pkmOrBoxItem && pkmOrBoxItem.uid ? pkmOrBoxItem : null);
    }
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    let pkmData = null;
    let currentLv = pkmOrBoxItem.level || 30;
    let natureName = pkmOrBoxItem.nature || '坦率';
    let subskills = pkmOrBoxItem.subskills || [];
    let ingredients = pkmOrBoxItem.ingredients || [];
    let ribbonLevel = parseInt(pkmOrBoxItem.ribbon, 10) || 0;

    if (pkmOrBoxItem.pkm) {
      pkmData = pkmOrBoxItem.pkm;
    } else if (pkmOrBoxItem.name_cn) {
      pkmData = pkmOrBoxItem;
    } else if (window.allPokemons) {
      pkmData = window.allPokemons.find(function(p) { return p.name_cn === pkmOrBoxItem.name || p.id === pkmOrBoxItem.pkmId; });
    }

    let skillLevel = getEffectiveSkillLevel(pkmOrBoxItem, pkmData);
    const nickname = (pkmOrBoxItem.nickname || '').trim();
    const isMint = !!(pkmOrBoxItem.cleanseMint || pkmOrBoxItem.mint || (pkmOrBoxItem.rawItem && (pkmOrBoxItem.rawItem.cleanseMint || pkmOrBoxItem.rawItem.mint)) || (pkmData && (pkmData.cleanseMint || pkmData.mint)));
    const targetPkmData = Object.assign({}, pkmData, { cleanseMint: isMint });

    const evaluation = evaluatePokemon(targetPkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, isMint);
    if (!evaluation) return;

    let modal = document.getElementById('modal-appraisal-report');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-appraisal-report';
      modal.className = 'appraisal-modal-backdrop';
      document.body.appendChild(modal);
    }

    const radarSVG = renderRadarChartSVG(evaluation.scores, 360, 270);
    const SIX_DIM_META = getSixDimMeta(isEN);
    const displayName = isEN ? (pkmData.name_en || pkmData.name_cn) : (pkmData.name_cn || pkmData.name_en);
    const natDisplayName = window.I18N ? window.I18N.getNatureName(natureName) : natureName;

    // 遊戲同款性格展示排版 (In-Game Style Nature Display)
    const natureObj = NATURE_DATA.find(function(n) { return n.name === natureName || n.name_en === natureName; });
    let natureEffectHtml = '';
    if (isMint) {
      natureEffectHtml = `
        <div class="nature-effects-group">
          <div class="nature-effect-neutral nature-effect-mint">
            ${isEN ? 'Has no distinctive personality traits (Cleanse Mint used)' : '沒有性格帶來的特色（使用淨白薄荷消除個性效果）'}
          </div>
        </div>
      `;
    } else if (natureObj && natureObj.buff && natureObj.buff !== '無增減') {
      const rawBuff = isEN ? (natureObj.buff_en || natureObj.buff) : natureObj.buff;
      const rawDebuff = isEN ? (natureObj.debuff_en || natureObj.debuff) : natureObj.debuff;
      const buffLabel = rawBuff.replace(/[▲▼]/g, '').trim();
      const debuffLabel = rawDebuff.replace(/[▲▼]/g, '').trim();
      natureEffectHtml = `
        <div class="nature-effects-group">
          <div class="nature-effect-row nature-buff-row">
            <span class="nature-effect-label">${escapeHtml(buffLabel)}</span>
            <span class="nature-arrows-up">▲▲</span>
          </div>
          <div class="nature-effect-row nature-debuff-row">
            <span class="nature-effect-label">${escapeHtml(debuffLabel)}</span>
            <span class="nature-arrows-down">▼▼</span>
          </div>
        </div>
      `;
    } else {
      natureEffectHtml = `
        <div class="nature-effects-group">
          <div class="nature-effect-neutral">
            ${isEN ? 'Has no distinctive personality traits' : '沒有性格帶來的特色（無影響）'}
          </div>
        </div>
      `;
    }

    const berry = (typeof window.getPokemonBerry === 'function') 
      ? window.getPokemonBerry(pkmData) 
      : (pkmData.berry || { name: '', icon: '' });
    const berryName = window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--');

    // 專長型態 (不展示「專長」二字，僅展示 食材型 / 技能型 / 樹果型，無外框)
    let specTypeLabel = isEN ? 'Ingredient' : '食材型';
    let specClass = 'spec-ingredient';
    if (pkmData.specialty && (pkmData.specialty.includes('樹果') || pkmData.specialty === 'Berries')) {
      specClass = 'spec-berry';
      specTypeLabel = isEN ? 'Berries' : '樹果型';
    } else if (pkmData.specialty && (pkmData.specialty.includes('技能') || pkmData.specialty === 'Skills')) {
      specClass = 'spec-skill';
      specTypeLabel = isEN ? 'Skills' : '技能型';
    } else if (pkmData.specialty && (pkmData.specialty.includes('全能') || pkmData.specialty.includes('全部') || pkmData.specialty === 'All-Rounder' || pkmData.specialty.toLowerCase() === 'all')) {
      specClass = 'spec-all';
      specTypeLabel = isEN ? 'All-Rounder' : '全能型';
    }

    let summaryNote = pkmOrBoxItem.summaryNote || '';
    if (!summaryNote || summaryNote.includes('質變躍升') || summaryNote.includes('建議優先升至') || summaryNote.includes('未達')) {
      summaryNote = generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, evaluation);
    }

    // 主技能資訊 (Main Skill & Level)
    const rawMainSkill = (pkmData && pkmData.main_skill) || (pkmData && pkmData.skill && pkmData.skill.name) || pkmOrBoxItem.main_skill || '';
    const mainSkillName = rawMainSkill ? (window.I18N ? window.I18N.getMainSkillName(rawMainSkill) : rawMainSkill) : (isEN ? 'Main Skill' : '主技能');
    const skillLvl = skillLevel || 1;

    // 食材組合資訊 (Ingredients & Quantity, 3 Slots with Level Unlock)
    const ingSlotNames = [
      (ingredients && ingredients[0]) ? (typeof ingredients[0] === 'string' ? ingredients[0] : ingredients[0].name) : (pkmOrBoxItem.ing1 || (pkmData && pkmData.ingredients && pkmData.ingredients[0] ? pkmData.ingredients[0].name : '')),
      (ingredients && ingredients[1]) ? (typeof ingredients[1] === 'string' ? ingredients[1] : ingredients[1].name) : (pkmOrBoxItem.ing2 || (pkmData && pkmData.ingredients && pkmData.ingredients[1] ? pkmData.ingredients[1].name : '')),
      (ingredients && ingredients[2]) ? (typeof ingredients[2] === 'string' ? ingredients[2] : ingredients[2].name) : (pkmOrBoxItem.ing3 || (pkmData && pkmData.ingredients && pkmData.ingredients[2] ? pkmData.ingredients[2].name : ''))
    ];

    const ingChipsHtml = [0, 1, 2].map(function(idx) {
      const unlockLv = idx === 0 ? 1 : (idx === 1 ? 30 : 60);
      const isUnlocked = currentLv >= unlockLv;
      const lockClass = !isUnlocked ? ' ing-locked' : '';
      const ingName = ingSlotNames[idx];
      const lockTitleSuffix = !isUnlocked ? (isEN ? ' (Locked)' : ' (未開放)') : '';

      if (!ingName || ingName === '--') {
        return `
          <div class="appraisal-ing-chip is-empty${lockClass}">
            <span class="appraisal-ing-chip-empty">--</span>
          </div>
        `;
      }
      const displayName = window.I18N ? window.I18N.getIngredientName(ingName) : ingName;
      const iconUrl = (window.I18N && typeof window.I18N.getIngredientIcon === 'function')
        ? window.I18N.getIngredientIcon(ingName)
        : '';
      const count = getIngCountFromBase(pkmData, idx, ingName);
      return `
        <div class="appraisal-ing-chip${lockClass}" title="${escapeHtml(displayName)}${lockTitleSuffix}">
          ${iconUrl ? `<img src="${iconUrl}" class="appraisal-ing-chip-icon" alt="${escapeHtml(displayName)}">` : ''}
        </div>
      `;
    }).join('');

    const formulaData = (window.PokemonApp && typeof window.PokemonApp.calculatePokedexIngredientFormulas === 'function')
      ? window.PokemonApp.calculatePokedexIngredientFormulas({
          pkm: pkmData,
          level: currentLv,
          nature: natureName,
          subskills: subskills,
          ingredients: ingSlotNames,
          ribbon: ribbonLevel,
          skillLevel: skillLevel,
          cleanseMint: isMint
        })
      : null;

    const isMobileH5 = typeof document !== 'undefined' && (
      (document.body && document.body.classList && document.body.classList.contains('mobile-h5-app')) ||
      (typeof document.querySelector === 'function' && !!document.querySelector('.mobile-h5-app')) ||
      (typeof window !== 'undefined' && (window.IS_MOBILE_H5 || (window.location && window.location.pathname && window.location.pathname.includes('/app/'))))
    );

    if (isMobileH5) {
      modal.className = 'box-modal-backdrop modal-overlay appraisal-modal-backdrop mobile-modal-backdrop';
      modal.innerHTML = `
        <div class="box-modal-dialog mobile-box-sheet bottom-sheet mobile-modal-sheet" role="dialog" aria-modal="true">
          <div class="sheet-drag-handle"></div>
          <div class="box-modal-header">
            <button type="button" class="box-modal-header-cancel" onclick="window.AppraisalLab.closeModal()">${isEN ? 'Close' : '關閉'}</button>
            <!-- 雙軌綜合評級徽章 (居中置於標題原位) -->
            <div class="appraisal-dual-verdict-column">
              <div class="pokedex-header-verdict-badge current-track" style="border-color: ${(evaluation.current || evaluation).gradeColor};">
                <span class="pokedex-verdict-track-lbl" style="font-size:9.5px;color:#94a3b8;line-height:1;">${isEN ? 'Current' : '當前'}</span>
                <span class="verdict-grade pokedex-header-grade-text" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:13px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
                <span class="pokedex-header-score-text" style="font-size:10px;"><span class="verdict-num font-bold">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
              </div>
              <div class="pokedex-header-verdict-badge potential-track">
                <span class="pokedex-verdict-track-lbl" style="font-size:8.5px;color:#64748b;line-height:1;">${isEN ? 'Max Lv' : '滿級'}</span>
                <span class="verdict-potential-grade pokedex-header-grade-text" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
                <span class="pokedex-header-score-text" style="font-size:9.5px;color:#94a3b8;"><span class="verdict-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
              </div>
            </div>
            ${pkmOrBoxItem && (pkmOrBoxItem.rawItem || pkmOrBoxItem.uid) ? `
              <button type="button" class="box-modal-header-confirm" onclick="window.AppraisalLab.openCurrentEditModal()">${isEN ? 'Edit' : '編輯'}</button>
            ` : `<span style="width:36px;"></span>`}
          </div>

          <div class="box-modal-body appraisal-modal-sheet-body">
            <!-- 寶可夢核心建構資訊 (純淨無外框容器，依據 Single Frame 原則) -->
            <div class="appraisal-h5-header-summary">
              <div class="appraisal-h5-profile-row" style="display:flex;align-items:center;gap:10px;">
                <div class="appraisal-h5-avatar-wrap">
                  <img src="${pkmData.icon_url}" class="appraisal-avatar-img" alt="${displayName}">
                  <span class="appraisal-level-badge">Lv. ${currentLv}</span>
                </div>
                <div class="appraisal-h5-info-col">
                  <!-- Row 1: 寶可夢名稱 + 稱號 + 樹果 + 專長 + 睡飽飽獎章 -->
                  <div class="appraisal-h5-name-row" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span class="appraisal-h5-pkm-name font-bold">${displayName}</span>
                    ${nickname ? `<span class="appraisal-h5-nick">(${escapeHtml(nickname)})</span>` : ''}
                    <span class="appraisal-berry-tag" style="display:inline-flex;align-items:center;background:transparent;border:none;padding:0;" title="${escapeHtml(berryName)}">
                      ${berry.icon ? `<img src="${berry.icon}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(berryName)}">` : ''}
                    </span>
                    ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkmData.specialty, 18, 'appraisal-spec-icon-wrap') : `<span class="appraisal-spec-tag ${specClass}">${specTypeLabel}</span>`}
                    ${ribbonLevel > 0 ? `
                      <div class="appraisal-ribbon-badge" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;font-size:10.5px;font-weight:700;">
                        <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${ribbonLevel}.png" style="width:14px;height:14px;object-fit:contain;" alt="Ribbon" />
                        <span>+${evaluation.ribbonBonus.carry} ${isEN ? 'Carry' : '持有'}${evaluation.ribbonBonus.speedDiscount > 0 ? ` · ${isEN ? '-' + Math.round(evaluation.ribbonBonus.speedDiscount * 100) + '% Spd' : '幫速 -' + Math.round(evaluation.ribbonBonus.speedDiscount * 100) + '%'}` : ''}</span>
                      </div>
                    ` : ''}
                  </div>
                  <!-- Row 2: 主技能與三階段食材插槽整合成同一行 (位於頭像旁第二行) -->
                  <div class="appraisal-h5-subinfo-row" style="display:flex;align-items:center;gap:8px;margin-top:3px;flex-wrap:wrap;">
                    <div class="appraisal-mainskill-row" style="display:inline-flex;align-items:center;gap:4px;padding:0;margin:0;">
                      <span class="appraisal-mainskill-name" style="font-size:12px;font-weight:700;color:var(--text-primary);">${escapeHtml(mainSkillName)}</span>
                      <span class="appraisal-mainskill-level" style="font-size:11px;font-weight:700;color:var(--accent-blue, #38bdf8);background:rgba(56,189,248,0.12);padding:1px 5px;border-radius:4px;border:1px solid rgba(56,189,248,0.25);">Lv.${skillLvl}</span>
                    </div>
                    <div class="appraisal-ing-parallel-row" style="display:inline-flex;align-items:center;gap:4px;padding:0;margin:0;">
                      <div class="appraisal-ing-chips-grid" style="display:inline-flex;gap:4px;align-items:center;">
                        ${ingChipsHtml}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 性格展示 (遊戲同款卡片) -->
              <div class="appraisal-config-section" style="margin-top:2px;display:flex;justify-content:center;width:100%;">
                <div class="appraisal-nature-game-card">
                  <div class="nature-pill-capsule">
                    <span class="nature-capsule-tag">${isEN ? 'Nature' : '性格'}</span>
                    <span class="nature-capsule-name">${escapeHtml(natDisplayName)}</span>
                  </div>
                  ${natureEffectHtml}
                </div>
              </div>

              <!-- 基礎數值雙欄縱向列 (幫忙間隔/持有/食材率/技能率，佔位寬度契合副技能網格) -->
              <div class="appraisal-config-section appraisal-stats-section" style="margin-top:4px;width:100%;">
                <div class="pokedex-header-stats-row pokedex-header-stats-dual appraisal-header-stats-dual">
                  <div class="pokedex-header-stat-col">
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${isEN ? 'Frequency' : '幫忙間隔'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-interval-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIntervalValue === 'function') ? window.PokemonApp.renderPokedexIntervalValue(formulaData, pkmData) : '--'}</span>
                    </div>
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${isEN ? 'Carry' : '持有'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-carry-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexCarryValue === 'function') ? window.PokemonApp.renderPokedexCarryValue(formulaData, pkmData) : '--'}</span>
                    </div>
                  </div>
                  <div class="pokedex-header-stat-col">
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${isEN ? 'Ing Rate' : '食材率'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-ingredient-rate-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIngRateValue === 'function') ? window.PokemonApp.renderPokedexIngRateValue(formulaData, pkmData) : '--'}</span>
                    </div>
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${isEN ? 'Skill Rate' : '技能率'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-skill-rate-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexSkillRateValue === 'function') ? window.PokemonApp.renderPokedexSkillRateValue(formulaData, pkmData) : '--'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 副技能清單 (2+2+1 排列) -->
              <div class="appraisal-config-section" style="margin-top:6px;width:100%;">
                <div class="appraisal-subskills-grid">
                  ${[10, 25, 50, 70, 80].map(function(lv, idx) {
                    const rawName = subskills && subskills[idx] ? (typeof subskills[idx] === 'string' ? subskills[idx] : subskills[idx].name) : '';
                    const sName = rawName ? (window.I18N ? window.I18N.getSubSkillName(rawName) : rawName) : '--';
                    const tier = getSkillTier(rawName);
                    const isUnlocked = currentLv >= lv;
                    const lockClass = !isUnlocked ? 'subskill-locked' : '';
                    const titleText = rawName 
                      ? (isEN ? `${sName} (Lv.${lv}${!isUnlocked ? ' - Locked' : ''})` : `${sName} (Lv.${lv}${!isUnlocked ? '未解鎖' : ''})`)
                      : (isEN ? `Lv.${lv} Slot` : `Lv.${lv} 欄位`);
                    return `
                      <div class="appraisal-subskill-pill subskill-${tier} ${lockClass}" title="${escapeHtml(titleText)}">
                        <span class="subskill-name">${escapeHtml(sName)}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- 食材與技能產能算法精算拆解 (純展示無調整組件) -->
            ${(formulaData && window.PokemonApp && typeof window.PokemonApp.renderPokedexFormulaBreakdownHTML === 'function') ? `
              <div class="appraisal-calc-mobile-wrap" style="margin-top:8px;width:100%;">
                <div class="pokedex-calc-formula-card">
                  ${window.PokemonApp.renderPokedexFormulaBreakdownHTML(formulaData, pkmData)}
                </div>
              </div>
            ` : ''}

            <!-- 雷達圖與六維能量條 -->
            <div class="appraisal-chart-flex" style="margin-top:4px;">
              <div class="appraisal-radar-wrapper" style="width:100%;max-width:340px;height:255px;margin:0 auto;">
                ${renderRadarChartSVG(evaluation.scores, 340, 255)}
              </div>
            </div>

            <!-- 專長深度點評與優缺點 -->
            <div class="appraisal-analysis-card" style="margin-top:6px;">
              <h4 class="appraisal-section-heading">${isEN ? 'Specialty, Nature & Sub-Skill Synergy Analysis' : '專長與性格副技能協同點評'}</h4>
              <div class="appraisal-pros-list">
                ${evaluation.pros.map(function(p) { return `<div class="appraisal-pro-item">${p}</div>`; }).join('')}
              </div>
              ${evaluation.cons.length > 0 ? `
                <div class="appraisal-cons-list">
                  ${evaluation.cons.map(function(c) { return `<div class="appraisal-con-item">${c}</div>`; }).join('')}
                </div>
              ` : ''}
            </div>

            <!-- 智能簡評欄 (嵌入式膠囊標籤) -->
            <div class="appraisal-summary-bar">
              <span class="appraisal-summary-label">${isEN ? 'Appraisal Note' : '智能簡評'}</span>
              <span class="appraisal-summary-text">${escapeHtml(summaryNote)}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      modal.className = 'appraisal-modal-backdrop';
      modal.innerHTML = `
        <div class="appraisal-modal-container">
          <!-- 頂部標題列 (高度加寬，垂直置中，整合雙軌評級與極簡關閉鈕) -->
          <div class="appraisal-modal-header">
            <div class="appraisal-header-title-group">
              <span class="appraisal-modal-badge">${isEN ? 'Diagnostic Report' : '深度能力診斷報告'}</span>
              <h2 class="appraisal-pokemon-title">
                ${nickname ? `<span class="appraisal-pokemon-nickname">${escapeHtml(nickname)}</span> <span class="appraisal-pokemon-base-name" style="font-size:0.85em;color:var(--text-secondary);font-weight:normal;">(${displayName})</span>` : displayName}
              </h2>
            </div>

            <div class="appraisal-header-actions">
              <!-- 雙軌綜合評級徽章 (對齊圖鑑彈窗風格，垂直置中，當前亮眼 + 滿級低調) -->
              <div class="appraisal-dual-verdict-column">
                <!-- 當前實力 (Current Level Rating) -->
                <div class="pokedex-header-verdict-badge current-track" style="border-color: ${(evaluation.current || evaluation).gradeColor};" title="${isEN ? `Current Level Rating (Lv.${currentLv})` : `當前實力評級 (Lv.${currentLv})`}">
                  <span class="pokedex-verdict-track-lbl" style="font-size:10px;color:#94a3b8;line-height:1;">${isEN ? 'Current' : '當前'}</span>
                  <span class="verdict-grade pokedex-header-grade-text" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:14px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
                  <span class="pokedex-header-score-text" style="font-size:11px;"><span class="verdict-num font-bold">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
                </div>
                <!-- 滿級潛力 (Max Potential Rating) -->
                <div class="pokedex-header-verdict-badge potential-track" title="${isEN ? 'Max Potential Rating (Lv.100)' : '畢業潛力評級 (Lv.100)'}">
                  <span class="pokedex-verdict-track-lbl" style="font-size:9px;color:#64748b;line-height:1;">${isEN ? 'Max Lv' : '滿級'}</span>
                  <span class="verdict-potential-grade pokedex-header-grade-text" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
                  <span class="pokedex-header-score-text" style="font-size:10px;color:#94a3b8;"><span class="verdict-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
                </div>
              </div>

              <!-- 編輯按鈕 (若來自倉庫) -->
              ${pkmOrBoxItem && (pkmOrBoxItem.rawItem || pkmOrBoxItem.uid) ? `
                <button type="button" class="appraisal-edit-btn" onclick="window.AppraisalLab.openCurrentEditModal()" title="${isEN ? 'Edit Pokémon Stats' : '編輯寶可夢數值'}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  <span>${isEN ? 'Edit' : '編輯數值'}</span>
                </button>
              ` : ''}

              <!-- 極簡關閉按鈕 -->
              <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closeModal()" title="${isEN ? 'Close' : '關閉'}" aria-label="${isEN ? 'Close' : '關閉'}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- 報告核心主體 (精簡三欄排版，徹底去除多餘巢狀容器外框) -->
          <div class="appraisal-modal-body">
            <!-- 左欄：寶可夢基本卡片與配置 (純淨無外框容器) -->
            <div class="appraisal-left-col">
              <div class="appraisal-profile-card">
                <div class="appraisal-avatar-wrapper">
                  <img src="${pkmData.icon_url}" class="appraisal-avatar-img" alt="${displayName}">
                  <span class="appraisal-level-badge">Lv. ${currentLv}</span>
                </div>
                
                <!-- 樹果與專長 + 睡飽飽獎章 (與 H5 版本同排並行) -->
                <div class="appraisal-specialty-row" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;flex-wrap:wrap;">
                  <span class="appraisal-berry-tag" style="display:inline-flex;align-items:center;background:transparent;border:none;padding:0;" title="${escapeHtml(berryName)}">
                    ${berry.icon ? `<img src="${berry.icon}" style="width:22px;height:22px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(berryName)}">` : ''}
                  </span>
                  ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkmData.specialty, 22, 'appraisal-spec-icon-wrap') : `<span class="appraisal-spec-tag ${specClass}">${specTypeLabel}</span>`}
                  ${ribbonLevel > 0 ? `
                    <div class="appraisal-ribbon-badge" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;font-size:11.5px;font-weight:700;">
                      <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${ribbonLevel}.png" style="width:16px;height:16px;object-fit:contain;" alt="Ribbon" />
                      <span>+${evaluation.ribbonBonus.carry} ${isEN ? 'Carry' : '持有'}${evaluation.ribbonBonus.speedDiscount > 0 ? ` · ${isEN ? '-' + Math.round(evaluation.ribbonBonus.speedDiscount * 100) + '% Spd' : '幫速 -' + Math.round(evaluation.ribbonBonus.speedDiscount * 100) + '%'}` : ''}</span>
                    </div>
                  ` : ''}
                </div>

                <!-- 主技能名稱與等級 (Appraisal Main Skill) -->
                <div class="appraisal-mainskill-row">
                  <span class="appraisal-mainskill-label">${isEN ? 'Main Skill:' : '主技能：'}</span>
                  <span class="appraisal-mainskill-name">${escapeHtml(mainSkillName)}</span>
                  <span class="appraisal-mainskill-level">Lv.${skillLvl}</span>
                </div>

                <!-- 食材三階插槽組合 (Appraisal Ingredients, 尚未開放插槽半透明) -->
                <div class="appraisal-ing-parallel-row">
                  <span class="appraisal-ing-row-label">${isEN ? 'Ingredients:' : '食材：'}</span>
                  <div class="appraisal-ing-chips-grid">
                    ${ingChipsHtml}
                  </div>
                </div>

                <!-- 遊戲同款性格展示 (膠囊外框 + 性格標籤 + 右側上下條目，純淨無外框容器) -->
                <div class="appraisal-config-section" style="margin-top:12px;display:flex;justify-content:center;">
                  <div class="appraisal-nature-game-card">
                    <div class="nature-pill-capsule">
                      <span class="nature-capsule-tag">${isEN ? 'Nature' : '性格'}</span>
                      <span class="nature-capsule-name">${escapeHtml(natDisplayName)}</span>
                    </div>
                    ${natureEffectHtml}
                  </div>
                </div>

                <!-- 副技能清單 (2+2+1 遊戲同款外框顏色與排列，無多餘標題) -->
                <div class="appraisal-config-section" style="margin-top:10px;">
                  <div class="appraisal-subskills-grid">
                    ${[10, 25, 50, 70, 80].map(function(lv, idx) {
                      const rawName = subskills && subskills[idx] ? (typeof subskills[idx] === 'string' ? subskills[idx] : subskills[idx].name) : '';
                      const sName = rawName ? (window.I18N ? window.I18N.getSubSkillName(rawName) : rawName) : '--';
                      const tier = getSkillTier(rawName);
                      const isUnlocked = currentLv >= lv;
                      const lockClass = !isUnlocked ? 'subskill-locked' : '';
                      const titleText = rawName 
                        ? (isEN ? `${sName} (Lv.${lv}${!isUnlocked ? ' - Locked' : ''})` : `${sName} (Lv.${lv}${!isUnlocked ? '未解鎖' : ''})`)
                        : (isEN ? `Lv.${lv} Slot` : `Lv.${lv} 欄位`);
                      return `
                        <div class="appraisal-subskill-pill subskill-${tier} ${lockClass}" title="${escapeHtml(titleText)}">
                          <span class="subskill-name">${escapeHtml(sName)}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

                <!-- 基礎數值雙欄縱向列 (移動至副技能網格下方，緊湊整潔無溢出) -->
                <div class="appraisal-config-section appraisal-stats-section" style="margin-top:12px;width:100%;">
                  <div class="pokedex-header-stats-row pokedex-header-stats-dual appraisal-header-stats-dual">
                    <div class="pokedex-header-stat-col">
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${isEN ? 'Frequency' : '幫忙間隔'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-interval">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIntervalValue === 'function') ? window.PokemonApp.renderPokedexIntervalValue(formulaData, pkmData) : '--'}</span>
                      </div>
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${isEN ? 'Carry' : '持有'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-carry">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexCarryValue === 'function') ? window.PokemonApp.renderPokedexCarryValue(formulaData, pkmData) : '--'}</span>
                      </div>
                    </div>
                    <div class="pokedex-header-stat-col">
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${isEN ? 'Ing Rate' : '食材率'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-ingredient-rate">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIngRateValue === 'function') ? window.PokemonApp.renderPokedexIngRateValue(formulaData, pkmData) : '--'}</span>
                      </div>
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${isEN ? 'Skill Rate' : '技能率'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-skill-rate">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexSkillRateValue === 'function') ? window.PokemonApp.renderPokedexSkillRateValue(formulaData, pkmData) : '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 中欄：食材與技能產能算法精算拆解 (純展示無調整組件，空間最大化單一整合外框) -->
            <div class="appraisal-calc-col">
              <div class="pokedex-calc-formula-card" id="appraisal-calc-formula-container">
                ${(formulaData && window.PokemonApp && typeof window.PokemonApp.renderPokedexFormulaBreakdownHTML === 'function')
                  ? window.PokemonApp.renderPokedexFormulaBreakdownHTML(formulaData, pkmData)
                  : ''}
              </div>
            </div>

          <!-- 右欄：雷達圖 + 智能簡評 + 專長深度點評 (純淨無外框容器) -->
          <div class="appraisal-right-col">
            <div class="appraisal-desktop-content-grid">
              <!-- 頂部：雷達圖區塊 (自適應置中，無冗餘標題) -->
              <div class="appraisal-radar-block">
                <div class="appraisal-radar-wrapper">
                  ${radarSVG}
                </div>
              </div>

              <!-- 中部：PR 智能簡評欄 (嵌入式膠囊標籤，不佔用內容展示空間) -->
              <div class="appraisal-summary-bar">
                <span class="appraisal-summary-label">${isEN ? 'Appraisal Note' : '智能簡評'}</span>
                <span class="appraisal-summary-text">${escapeHtml(summaryNote)}</span>
              </div>

              <!-- 下方：專長深度點評與優缺點 (在智能簡評下方，同樣長度) -->
              <div class="appraisal-analysis-card">
                <h4 class="appraisal-section-heading">${isEN ? 'Specialty & Synergy Analysis' : '專長與性格副技能協同點評'}</h4>
                <div class="appraisal-pros-list">
                  ${evaluation.pros.map(function(p) { return `<div class="appraisal-pro-item">${p}</div>`; }).join('')}
                </div>
                ${evaluation.cons.length > 0 ? `
                  <div class="appraisal-cons-list">
                    ${evaluation.cons.map(function(c) { return `<div class="appraisal-con-item">${c}</div>`; }).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    if (modal.style && typeof modal.style.removeProperty === 'function') {
      modal.style.removeProperty('display');
    }
    modal.style.display = 'flex';
    if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
    document.body.style.overflow = 'hidden';

    // 點選遮罩外部關閉與 Escape 鍵關閉
    modal.onclick = function(e) {
      if (e.target === modal) {
        closeAppraisalModal();
      }
    };
    if (modal._onKeydown && typeof window.removeEventListener === 'function') {
      window.removeEventListener('keydown', modal._onKeydown);
    }
    modal._onKeydown = function(e) {
      if (e.key === 'Escape') {
        closeAppraisalModal();
      }
    };
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', modal._onKeydown);
    }
  }

  function openCurrentEditModal() {
    const item = window.AppraisalLab ? window.AppraisalLab._currentBoxItem : null;
    const modal = document.getElementById('modal-appraisal-report');
    if (modal) {
      if (modal._onKeydown && typeof window.removeEventListener === 'function') {
        window.removeEventListener('keydown', modal._onKeydown);
      }
      modal._onKeydown = null;
      if (modal.classList) modal.classList.remove('overlay-closing');
      if (modal.style) {
        if (typeof modal.style.setProperty === 'function') modal.style.setProperty('display', 'none', 'important');
        else modal.style.display = 'none';
      }
    }
    if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
    document.body.style.overflow = '';
    if (!item) return;
    if (window.UserBox && typeof window.UserBox.openBoxEditModal === 'function') {
      const fresh = (typeof window.UserBox.getUserBox === 'function' && window.UserBox.getUserBox().find(p => p.uid === item.uid)) || item;
      if (window.AppraisalLab) window.AppraisalLab._reopenUid = item.uid;
      window.UserBox.openBoxEditModal(fresh);
    }
  }

  function reopenAfterEdit() {
    const lab = window.AppraisalLab;
    if (!lab || !lab._reopenUid) return;
    const uid = lab._reopenUid;
    lab._reopenUid = null;
    const box = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    const item = box.find(p => p.uid === uid);
    if (!item) return;
    const pokemons = window.allPokemons || [];
    const base = findBasePkm(item.pokemonId || item.name) || pokemons.find(p => p.name_cn === item.name);
    openAppraisalModal({
      pkm: base,
      level: item.level || 30,
      nature: item.nature || '坦率',
      subskills: item.subskills || [],
      ingredients: [item.ing1, item.ing2, item.ing3],
      ribbon: item.ribbon || 0,
      nickname: item.nickname || '',
      skillLevel: item.skillLevel || 1,
      rawItem: item
    });
  }

  function closeAppraisalModal() {
    const modal = document.getElementById('modal-appraisal-report');
    if (!modal) return;
    if (modal._onKeydown) {
      if (typeof window.removeEventListener === 'function') {
        window.removeEventListener('keydown', modal._onKeydown);
      }
      modal._onKeydown = null;
    }
    const done = () => {
      if (modal && modal.style) {
        if (typeof modal.style.setProperty === 'function') modal.style.setProperty('display', 'none', 'important');
        else modal.style.display = 'none';
      }
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
      document.body.style.overflow = '';
    };
    if (typeof window.animateOverlayClose === 'function') {
      window.animateOverlayClose(modal, done);
    } else {
      done();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── 獨立模擬評測實驗室 (Appraisal Lab & Box Linkage) ───────────────── */
  const BERRY_VALUES_DATA = [
    { id: 'pamtre', name: '椰木果', type: '飛行', energy: 24, icon: 'https://www.serebii.net/pokemonsleep/berries/pamtreberry.png' },
    { id: 'lum',    name: '木子果', type: '蟲',   energy: 24, icon: 'https://www.serebii.net/pokemonsleep/berries/lumberry.png' },
    { id: 'grepa',  name: '異奇果', type: '電',   energy: 25, icon: 'https://www.serebii.net/pokemonsleep/berries/grepaberry.png' },
    { id: 'bluk',   name: '檬果',   type: '幽靈', energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/blukberry.png' },
    { id: 'pecha',  name: '桃桃果', type: '妖精', energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/pechaberry.png' },
    { id: 'mago',   name: '芒念果', type: '超能', energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/magoberry.png' },
    { id: 'leppa',  name: '蘋野果', type: '火',   energy: 27, icon: 'https://www.serebii.net/pokemonsleep/berries/leppaberry.png' },
    { id: 'cheri',  name: '櫻子果', type: '格鬥', energy: 27, icon: 'https://www.serebii.net/pokemonsleep/berries/cheriberry.png' },
    { id: 'persim', name: '柿仔果', type: '一般', energy: 28, icon: 'https://www.serebii.net/pokemonsleep/berries/persimberry.png' },
    { id: 'figy',   name: '勿花果', type: '地面', energy: 29, icon: 'https://www.serebii.net/pokemonsleep/berries/figyberry.png' },
    { id: 'sitrus', name: '文柚果', type: '岩石', energy: 30, icon: 'https://www.serebii.net/pokemonsleep/berries/sitrusberry.png' },
    { id: 'durin',  name: '榴石果', type: '草',   energy: 30, icon: 'https://www.serebii.net/pokemonsleep/berries/durinberry.png' },
    { id: 'oran',   name: '橙橙果', type: '水',   energy: 31, icon: 'https://www.serebii.net/pokemonsleep/berries/oranberry.png' },
    { id: 'wiki',   name: '芭拉果', type: '惡',   energy: 31, icon: 'https://www.serebii.net/pokemonsleep/berries/wikiberry.png' },
    { id: 'chesto', name: '零餘果', type: '毒',   energy: 32, icon: 'https://www.serebii.net/pokemonsleep/berries/chestoberry.png' },
    { id: 'rawst',  name: '生薑果', type: '冰',   energy: 32, icon: 'https://www.serebii.net/pokemonsleep/berries/rawstberry.png' },
    { id: 'belue',  name: '靛莓果', type: '鋼',   energy: 33, icon: 'https://www.serebii.net/pokemonsleep/berries/belueberry.png' },
    { id: 'yache',  name: '巧可果', type: '龍',   energy: 35, icon: 'https://www.serebii.net/pokemonsleep/berries/yacheberry.png' }
  ];

  const INGREDIENTS_ENERGY_MAP = {
    '特選蘋果': 90, 'Fancy Apple': 90,
    '哞哞鮮奶': 98, 'Moomoo Milk': 98,
    '萌綠大豆': 100, 'Greengrass Soybeans': 100,
    '甜甜蜜': 101, 'Honey': 101,
    '豆製肉': 103, 'Bean Sausage': 103,
    '暖暖薑': 109, 'Warming Ginger': 109,
    '好眠番茄': 110, 'Snoozy Tomato': 110,
    '特選蛋': 115, 'Fancy Egg': 115,
    '純粹油': 121, 'Pure Oil': 121,
    '窩心洋芋': 124, 'Soft Potato': 124,
    '火辣香草': 130, 'Fiery Herb': 130,
    '萌綠玉米': 140, 'Greengrass Corn': 140,
    '放鬆可可': 151, 'Soothing Cacao': 151,
    '醒腦咖啡豆': 153, 'Rousing Coffee': 153,
    '嫩亮酪梨': 162, 'Glossy Avocado': 162,
    '品鮮蘑菇': 167, 'Tasty Mushroom': 167,
    '粗枝大蔥': 185, 'Large Leek': 185,
    '沉甸甸南瓜': 250, 'Plump Pumpkin': 250,
    '美味尾巴': 342, 'Slowpoke Tail': 342
  };

  const LAB_ISLANDS = [
    {
      id: 'greengrass',
      name: '萌綠之島',
      name_en: 'Greengrass Isle',
      color: '#22c55e',
      image: 'assets/islands/hd/greengrass.jpg',
      berries: ['桃桃果', '橙橙果', '櫻子果'],
      types: ['妖精', '水', '格鬥'],
      desc: '初始營地 · 自由全屬性'
    },
    {
      id: 'cyan',
      name: '天青沙灘',
      name_en: 'Cyan Beach',
      color: '#06b6d4',
      image: 'assets/islands/hd/cyan.jpg',
      berries: ['橙橙果', '椰木果', '桃桃果'],
      types: ['水', '飛行', '妖精'],
      desc: '喜愛樹果：水、飛行、妖精 (2x 能量)'
    },
    {
      id: 'taupe',
      name: '灰褐洞窟',
      name_en: 'Taupe Hollow',
      color: '#f97316',
      image: 'assets/islands/hd/taupe.jpg',
      berries: ['蘋野果', '勿花果', '文柚果'],
      types: ['火', '地面', '岩石'],
      desc: '喜愛樹果：火、地面、岩石 (2x 能量)'
    },
    {
      id: 'snowdrop',
      name: '白林原野',
      name_en: 'Snowdrop Tundra',
      color: '#38bdf8',
      image: 'assets/islands/hd/snowdrop.jpg',
      berries: ['柿仔果', '生薑果', '芭拉果'],
      types: ['一般', '冰', '惡'],
      desc: '喜愛樹果：一般、冰、惡 (2x 能量)'
    },
    {
      id: 'lapis',
      name: '拉碧絲湖畔',
      name_en: 'Lapis Lakeside',
      color: '#a855f7',
      image: 'assets/islands/hd/lapis.jpg',
      berries: ['榴石果', '芒念果', '櫻子果'],
      types: ['草', '超能', '格鬥'],
      desc: '喜愛樹果：草、超能、格鬥 (2x 能量)'
    },
    {
      id: 'powerplant',
      name: '發電廠',
      name_en: 'Old Gold Power Plant',
      color: '#eab308',
      image: 'assets/islands/hd/oldgold.jpg',
      berries: ['異奇果', '靛莓果', '檬果'],
      types: ['電', '鋼', '幽靈'],
      desc: '喜愛樹果：電、鋼、幽靈 (2x 能量)'
    }
  ];

  let labState = {
    currentSubTab: 'team',
    teamIslandId: 'greengrass',
    teamSlots: [null, null, null, null, null],
    teamStrategy: 'balanced', // 'balanced' | 'berries' | 'ingredients' | 'skills' | 'recipe'
    cookingType: 'curry',     // 'curry' | 'salad' | 'dessert'
    targetRecipeName: '彈跳咖哩烏龍麵',
    greengrassBerries: ['桃桃果', '橙橙果', '櫻子果'],
    compareSlots: [null, null, null],
    compareBenchmarkLevel: 'box', // 'box' | 30 | 50 | 60 | 100
    selectedBoxUid: '',
    selectedPkmId: '1',
    level: 30,
    nature: '固執',
    subskills: ['樹果數量S', '幫忙速度M', '食材機率提升M', '', ''],
    ingredients: [],
    ribbon: 0,
    nickname: '',
    skillLevel: 1,
    isCustomized: false,
    editMode: false,
    editBackup: null,
    activeSubskillSlot: 1
  };

  Object.defineProperty(labState, 'compareUidA', {
    get: function() { return (this.compareSlots && this.compareSlots[0]) || null; },
    set: function(v) { if (!Array.isArray(this.compareSlots)) this.compareSlots = [null, null, null]; this.compareSlots[0] = v || null; },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(labState, 'compareUidB', {
    get: function() { return (this.compareSlots && this.compareSlots[1]) || null; },
    set: function(v) { if (!Array.isArray(this.compareSlots)) this.compareSlots = [null, null, null]; this.compareSlots[1] = v || null; },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(labState, 'compareUidC', {
    get: function() { return (this.compareSlots && this.compareSlots[2]) || null; },
    set: function(v) { if (!Array.isArray(this.compareSlots)) this.compareSlots = [null, null, null]; this.compareSlots[2] = v || null; },
    configurable: true,
    enumerable: true
  });

  const COOKING_CATEGORY_KEY_INGREDIENTS = {
    curry: ['豆製肉', '好眠番茄', '暖暖薑', '火辣香草', '萌綠玉米', '粗枝大蔥', '品鮮蘑菇', '特選蛋', '美味尾巴', 'Bean Sausage', 'Snoozy Tomato', 'Warming Ginger', 'Fiery Herb', 'Greengrass Corn', 'Large Leek', 'Tasty Mushroom', 'Fancy Egg', 'Slowpoke Tail'],
    salad: ['純粹油', '好眠番茄', '特選蘋果', '放鬆可可', '窩心洋芋', '萌綠大豆', '萌綠玉米', '嫩亮酪梨', '粗枝大蔥', 'Pure Oil', 'Snoozy Tomato', 'Fancy Apple', 'Soothing Cacao', 'Soft Potato', 'Greengrass Soybeans', 'Greengrass Corn', 'Glossy Avocado', 'Large Leek'],
    dessert: ['甜甜蜜', '特選蘋果', '哞哞鮮奶', '放鬆可可', '特選蛋', '醒腦咖啡豆', '暖暖薑', '沉甸甸南瓜', 'Honey', 'Fancy Apple', 'Moomoo Milk', 'Soothing Cacao', 'Fancy Egg', 'Rousing Coffee', 'Warming Ginger', 'Plump Pumpkin']
  };

