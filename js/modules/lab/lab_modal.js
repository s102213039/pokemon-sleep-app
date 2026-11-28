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
    const SIX_DIM_META = getSixDimMeta();
    const displayName = window.I18N?.getPokemonName?.(pkmData) ?? (pkmData.name_cn || pkmData.name_en || '');
    const natDisplayName = window.I18N?.getNatureName?.(natureName) ?? natureName;

    // 遊戲同款性格展示排版 (In-Game Style Nature Display)
    const natureObj = NATURE_DATA.find(function(n) { return n.name === natureName || n.name_en === natureName; });
    let natureEffectHtml = '';
    if (isMint) {
      natureEffectHtml = `
        <div class="nature-effects-group">
          <div class="nature-effect-neutral nature-effect-mint">
            ${window.I18N?.t?.('lab.t_nature_mint_neutral') ?? 'lab.t_nature_mint_neutral'}
          </div>
        </div>
      `;
    } else if (natureObj && natureObj.buff && natureObj.buff !== '無增減') {
      const buffLabel = (window.I18N?.field?.(natureObj, 'buff') ?? (natureObj.buff || '')).replace(/[▲▼]/g, '').trim();
      const debuffLabel = (window.I18N?.field?.(natureObj, 'debuff') ?? (natureObj.debuff || '')).replace(/[▲▼]/g, '').trim();
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
            ${window.I18N?.t?.('lab.t_nature_neutral') ?? 'lab.t_nature_neutral'}
          </div>
        </div>
      `;
    }

    const berry = (typeof window.getPokemonBerry === 'function') 
      ? window.getPokemonBerry(pkmData) 
      : (pkmData.berry || { name: '', icon: '' });
    const berryName = window.I18N?.getBerryName?.(berry.name) ?? (berry.name || '--');

    // 專長型態 (不展示「專長」二字，僅展示 食材型 / 技能型 / 樹果型，無外框)
    let specTypeLabel = window.I18N?.t?.('lab.t_spec_ing') ?? 'lab.t_spec_ing';
    let specClass = 'spec-ingredient';
    if (pkmData.specialty && (pkmData.specialty.includes('樹果') || pkmData.specialty === 'Berries')) {
      specClass = 'spec-berry';
      specTypeLabel = window.I18N?.t?.('lab.t_spec_berry') ?? 'lab.t_spec_berry';
    } else if (pkmData.specialty && (pkmData.specialty.includes('技能') || pkmData.specialty === 'Skills')) {
      specClass = 'spec-skill';
      specTypeLabel = window.I18N?.t?.('lab.t_spec_skill') ?? 'lab.t_spec_skill';
    } else if (pkmData.specialty && (pkmData.specialty.includes('全能') || pkmData.specialty.includes('全部') || pkmData.specialty === 'All-Rounder' || pkmData.specialty.toLowerCase() === 'all')) {
      specClass = 'spec-all';
      specTypeLabel = window.I18N?.t?.('lab.t_spec_all') ?? 'lab.t_spec_all';
    }

    let summaryNote = pkmOrBoxItem.summaryNote || '';
    if (!summaryNote || summaryNote.includes('質變躍升') || summaryNote.includes('建議優先升至') || summaryNote.includes('未達')) {
      summaryNote = generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, evaluation);
    }

    // 主技能資訊 (Main Skill & Level)
    const rawMainSkill = (pkmData && pkmData.main_skill) || (pkmData && pkmData.skill && pkmData.skill.name) || pkmOrBoxItem.main_skill || '';
    const mainSkillName = rawMainSkill ? (window.I18N?.getMainSkillName?.(rawMainSkill) ?? rawMainSkill) : (window.I18N?.t?.('lab.t_main_skill') ?? 'lab.t_main_skill');
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
      const lockTitleSuffix = !isUnlocked ? (window.I18N?.t?.('lab.t_ing_locked') ?? 'lab.t_ing_locked') : '';

      if (!ingName || ingName === '--') {
        return `
          <div class="appraisal-ing-chip is-empty${lockClass}">
            <span class="appraisal-ing-chip-empty">--</span>
          </div>
        `;
      }
      const displayName = window.I18N?.getIngredientName?.(ingName) ?? ingName;
      const iconUrl = (window.I18N && typeof window.I18N.getIngredientIcon === 'function')
        ? window.I18N.getIngredientIcon(ingName)
        : '';
      const count = getIngCountFromBase(pkmData, idx, ingName);
      return `
        <div class="appraisal-ing-chip${lockClass}" title="${escapeHtml(displayName)}${lockTitleSuffix}">
          ${iconUrl ? `<img src="${iconUrl}" class="appraisal-ing-chip-icon" width="20" height="20" loading="lazy" decoding="async" alt="${escapeHtml(displayName)}">` : ''}
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

    const modalRenderCtx = {
      pkmOrBoxItem, pkmData, currentLv, nickname, displayName, natDisplayName,
      natureEffectHtml, berry, berryName, specClass, specTypeLabel, summaryNote,
      mainSkillName, skillLvl, ingChipsHtml, formulaData, evaluation, radarSVG,
      subskills, ribbonLevel
    };
    if (isMobileH5) {
      modal.className = 'box-modal-backdrop modal-overlay appraisal-modal-backdrop mobile-modal-backdrop';
      modal.innerHTML = renderAppraisalMobileSheetHtml(modalRenderCtx);
    } else {
      modal.className = 'appraisal-modal-backdrop';
      modal.innerHTML = renderAppraisalDesktopModalHtml(modalRenderCtx);
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
