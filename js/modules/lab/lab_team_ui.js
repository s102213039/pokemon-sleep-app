  function setPotSize(size) {
    const val = parseInt(size, 10);
    if (!isNaN(val)) {
      labState.potSize = Math.max(15, Math.min(100, val));
      if (typeof updateLabUI === 'function') updateLabUI();
    }
  }

  function stepPotSize(delta) {
    const cur = labState.potSize || 57;
    const next = Math.max(15, Math.min(100, cur + delta));
    labState.potSize = next;
    if (typeof updateLabUI === 'function') updateLabUI();
  }

  function toggleSundayPotExpansion() {
    labState.sundayPotExpansion = !labState.sundayPotExpansion;
    if (typeof updateLabUI === 'function') updateLabUI();
  }

  function toggleGoodCampTicket() {
    labState.goodCampTicket = !labState.goodCampTicket;
    if (typeof updateLabUI === 'function') updateLabUI();
  }

  if (typeof window !== 'undefined') {
    window.setPotSize = setPotSize;
    window.stepPotSize = stepPotSize;
    window.toggleSundayPotExpansion = toggleSundayPotExpansion;
    window.toggleGoodCampTicket = toggleGoodCampTicket;

    let _appraisalLabRef = window.AppraisalLab || {};
    try {
      Object.defineProperty(window, 'AppraisalLab', {
        configurable: true,
        enumerable: true,
        get: function () {
          return _appraisalLabRef;
        },
        set: function (newVal) {
          _appraisalLabRef = newVal;
          if (_appraisalLabRef && typeof _appraisalLabRef === 'object') {
            _appraisalLabRef.setPotSize = setPotSize;
            _appraisalLabRef.stepPotSize = stepPotSize;
            _appraisalLabRef.toggleSundayPotExpansion = toggleSundayPotExpansion;
            _appraisalLabRef.toggleGoodCampTicket = toggleGoodCampTicket;
            if (typeof calculateProjectedSnorlaxRank === 'function') {
              _appraisalLabRef.calculateProjectedSnorlaxRank = calculateProjectedSnorlaxRank;
            }
            if (typeof ISLAND_SNORLAX_THRESHOLDS !== 'undefined') {
              _appraisalLabRef.ISLAND_SNORLAX_THRESHOLDS = ISLAND_SNORLAX_THRESHOLDS;
            }
          }
        }
      });
    } catch (e) {}

    if (_appraisalLabRef && typeof _appraisalLabRef === 'object') {
      _appraisalLabRef.setPotSize = setPotSize;
      _appraisalLabRef.stepPotSize = stepPotSize;
      _appraisalLabRef.toggleSundayPotExpansion = toggleSundayPotExpansion;
      _appraisalLabRef.toggleGoodCampTicket = toggleGoodCampTicket;
      if (typeof calculateProjectedSnorlaxRank === 'function') {
        _appraisalLabRef.calculateProjectedSnorlaxRank = calculateProjectedSnorlaxRank;
      }
      if (typeof ISLAND_SNORLAX_THRESHOLDS !== 'undefined') {
        _appraisalLabRef.ISLAND_SNORLAX_THRESHOLDS = ISLAND_SNORLAX_THRESHOLDS;
      }
    }
  }

  function renderGreengrassBerrySelect(idx, currentBerryName, isEN) {
    const berriesList = _getLabBerryValuesData();
    const currentCid = _resolveLabBerryCanonicalId(currentBerryName);
    const optionsHtml = berriesList.map(b => {
      const bDisp = (window.I18N && window.I18N.getBerryName) ? window.I18N.getBerryName(b.name) : _tLabStr(b.name);
      const tDisp = window.I18N ? window.I18N.getTypeName(b.type) : _tLabStr(b.type);
      const isSel = (currentCid && b.id === currentCid) || b.name === currentBerryName ? 'selected' : '';
      return `<option value="${escapeHtml(b.name)}" ${isSel}>${escapeHtml(bDisp)} (${tDisp})</option>`;
    }).join('');

    const bObj = _findLabBerryData(currentBerryName) || berriesList[0];

    return `
      <div class="lab-greengrass-berry-item">
        ${bObj && bObj.icon ? `<img src="${bObj.icon}" class="lab-berry-mini-icon" alt="Berry">` : ''}
        <select class="lab-select lab-berry-select" onchange="window.AppraisalLab.setGreengrassBerry(${idx}, this.value)">
          ${optionsHtml}
        </select>
      </div>
    `;
  }

  /* ─── 幫手組隊 HTML 產生器 (Team Builder View Renderer) ──────────────── */
  function renderTeamBuilderView(userBox, pokemons, isEN, isMobileH5) {
    const island = LAB_ISLANDS.find(i => i.id === labState.teamIslandId) || LAB_ISLANDS[0];
    const favBerries = getIslandFavoredBerries(labState.teamIslandId);
    const favTypes = getIslandFavoredTypes(labState.teamIslandId);
    const isGreengrass = labState.teamIslandId === 'greengrass';

    while (labState.teamSlots.length < 5) labState.teamSlots.push(null);
    if (labState.teamSlots.length > 5) labState.teamSlots = labState.teamSlots.slice(0, 5);

    const teamItems = labState.teamSlots.map(uid => uid ? userBox.find(p => p.uid === uid) : null);
    const simulation = simulateTeamPerformance(teamItems, labState.teamIslandId);

    const basePath = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) || '';
    const islandPillsHtml = LAB_ISLANDS.map(isl => {
      const isActive = labState.teamIslandId === isl.id;
      const islImgUrl = isl.image ? (basePath + isl.image) : '';
      const islName = _tLab(isl.name, isl.name_en || isl.name, isEN);
      return `
        <button type="button" class="lab-island-circle-btn ${isActive ? 'active' : ''}" style="${islImgUrl ? `background-image:url('${islImgUrl}');` : `background-color:${isl.color};`}${isActive ? `border-color:${isl.color};box-shadow:0 0 10px ${isl.color}99;` : ''}" onclick="window.AppraisalLab.setTeamIsland('${isl.id}')" title="${escapeHtml(islName)}">
          <span class="sr-only">${escapeHtml(islName)}</span>
        </button>
      `;
    }).join('');

    const favoredBerriesHtml = favBerries.map(bName => {
      const bObj = _findLabBerryData(bName) || {};
      const canonicalName = bObj.name || bName;
      const bDisplayName = (window.I18N && window.I18N.getBerryName) ? window.I18N.getBerryName(canonicalName) : _tLabStr(canonicalName);
      return `
        <span class="lab-favored-berry-icon-wrap" title="${escapeHtml(bDisplayName)}">
          ${bObj.icon ? `<img src="${bObj.icon}" class="lab-favored-berry-img" alt="${escapeHtml(bDisplayName)}">` : ''}
        </span>
      `;
    }).join('');

    const greengrassConfigHtml = isGreengrass ? `
      <div class="lab-greengrass-berries-config">
        <div class="lab-greengrass-berries-head">
          <div style="display:flex;flex-direction:column;gap:1px;">
            <span style="font-size:11.5px;font-weight:700;color:#22c55e;">${_tLab('萌綠之島本週喜愛樹果 (可自由自選):', 'Greengrass Favored Berries (Customizable):', isEN)}</span>
            <span style="font-size:10.5px;color:var(--text-muted);">${_tLab('自選本週 3 種喜愛樹果，產能與推薦即時享有 2x 能量加成', 'Select 3 favored berries for this week (2x energy boost)', isEN)}</span>
          </div>
          <div class="lab-greengrass-actions" style="display:flex;gap:5px;align-items:center;">
            <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.rerollGreengrassBerries(false)" style="font-size:10.5px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;" title="${_tLab('從 18 種樹果隨機刷新 3 種', 'Reroll 3 random berries from 18', isEN)}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>${_tLab('隨機擲骰', 'Random Reroll', isEN)}</span>
            </button>
            <button type="button" class="box-btn box-btn-primary" onclick="window.AppraisalLab.rerollGreengrassBerries(true)" style="font-size:10.5px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;" title="${_tLab('隨機抽出 3 種樹果並立即自動推薦最佳陣容', 'Reroll 3 random berries and immediately auto-optimize team', isEN)}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>${_tLab('擲骰並自動配隊', 'Roll & Build', isEN)}</span>
            </button>
          </div>
        </div>
        <div class="lab-greengrass-selects-row">
          ${[0, 1, 2].map(idx => renderGreengrassBerrySelect(idx, (labState.greengrassBerries && labState.greengrassBerries[idx]) || ['桃桃果', '橙橙果', '櫻子果'][idx], isEN)).join('')}
        </div>
      </div>
    ` : '';

    const targetRecipe = findTargetRecipe(labState.targetRecipeName);
    const targetRecipeDisplayName = (window.I18N && typeof window.I18N.getRecipeName === 'function')
      ? window.I18N.getRecipeName(targetRecipe)
      : _tLab(targetRecipe.name_cn || targetRecipe.name, targetRecipe.name_en || targetRecipe.name_cn, isEN);
    const rawCat = targetRecipe.category || '咖哩';
    const catLower = rawCat.toLowerCase();
    const catEn = (catLower.includes('沙拉') || catLower.includes('salad'))
      ? 'Salad'
      : ((catLower.includes('甜') || catLower.includes('點心') || catLower.includes('dessert') || catLower.includes('飲料') || catLower.includes('drink'))
          ? 'Dessert'
          : 'Curry');
    const targetRecipeCategory = _tLab(rawCat, catEn, isEN);
    const isTargetRecipeStrategy = labState.teamStrategy === 'recipe';

    // ─── 料理鍋容量與加成 (Pot Size Controls & Modifiers) ─────────
    labState.potSize = labState.potSize || 57;
    labState.sundayPotExpansion = Boolean(labState.sundayPotExpansion);
    labState.goodCampTicket = Boolean(labState.goodCampTicket);

    const basePotSize = labState.potSize;
    let potMultiplier = 1.0;
    if (labState.goodCampTicket) potMultiplier *= 1.5;
    if (labState.sundayPotExpansion) potMultiplier *= 2.0;
    const effectivePotSize = Math.floor(basePotSize * potMultiplier);

    const targetPotReq = (targetRecipe && targetRecipe.pot_size) || 0;
    const isPotFeasible = targetPotReq > 0 ? (effectivePotSize >= targetPotReq) : true;
    const potFeasibilityBadge = targetPotReq > 0
      ? (isPotFeasible
          ? `<span class="lab-pot-feasibility feasible">[OK] ${_tLab('容量充裕', 'Capacity OK', isEN)} (${targetPotReq}/${effectivePotSize})</span>`
          : `<span class="lab-pot-feasibility deficit">[!] ${_tLab('鍋容量不足', 'Pot Short', isEN)} (${targetPotReq}/${effectivePotSize})</span>`)
      : '';

    const potControlHtml = `
      <div class="lab-team-config-group lab-pot-config-group">
        <span class="lab-team-config-label">${_tLab('鍋子容量:', 'Pot Size:', isEN)}</span>
        <div class="lab-pot-stepper-wrap">
          <button type="button" class="lab-pot-step-btn" onclick="window.AppraisalLab.stepPotSize(-3)" title="${_tLab('鍋容量 -3', 'Decrease Pot Size by 3', isEN)}">-</button>
          <span class="lab-pot-size-display" title="${_tLab('基礎鍋容量: ' + basePotSize, 'Base Pot Size: ' + basePotSize, isEN)}">${basePotSize}</span>
          <button type="button" class="lab-pot-step-btn" onclick="window.AppraisalLab.stepPotSize(3)" title="${_tLab('鍋容量 +3', 'Increase Pot Size by 3', isEN)}">+</button>
        </div>
        <div class="lab-pot-modifiers">
          <button type="button" class="lab-pot-toggle-btn ${labState.sundayPotExpansion ? 'active' : ''}" onclick="window.AppraisalLab.toggleSundayPotExpansion()" title="${_tLab('週日特別擴鍋：料理鍋容量 2 倍', 'Sunday Pot Expansion: 2x Pot Capacity', isEN)}">
            ${_tLab('週日2倍', 'Sunday 2x', isEN)}
          </button>
          <button type="button" class="lab-pot-toggle-btn ${labState.goodCampTicket ? 'active' : ''}" onclick="window.AppraisalLab.toggleGoodCampTicket()" title="${_tLab('好露營券：料理鍋容量 +50%', 'Good Camp Ticket: +50% Pot Capacity', isEN)}">
            ${_tLab('好露營券(+50%)', 'Camp +50%', isEN)}
          </button>
        </div>
        <div class="lab-effective-pot-wrap">
          <span class="lab-effective-pot-label">${_tLab('實際容納:', 'Effective:', isEN)} <strong class="lab-effective-pot-num">${effectivePotSize}</strong></span>
          ${potFeasibilityBadge}
        </div>
      </div>
    `;

    const teamVariablesBarHtml = `
      <div class="lab-team-config-col lab-team-config-panel">
        <div class="lab-team-config-group">
          <span class="lab-team-config-label">${_tLab('隊伍類型:', 'Team Focus:', isEN)}</span>
          <div class="lab-team-pills">
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'balanced' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('balanced')">${_tLab('綜合隊', 'Balanced', isEN)}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'berries' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('berries')">${_tLab('樹果隊', 'Berries', isEN)}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'ingredients' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('ingredients')">${_tLab('食材隊', 'Ingredients', isEN)}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'skills' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('skills')">${_tLab('技能隊', 'Skills', isEN)}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'recipe' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('recipe')">${_tLab('目標料理', 'Target Recipe', isEN)}</button>
          </div>
        </div>

        ${isTargetRecipeStrategy ? `
          <div class="lab-team-config-group lab-target-recipe-config-group">
            <span class="lab-team-config-label">${_tLab('目標料理:', 'Target Dish:', isEN)}</span>
            <div class="lab-target-recipe-chip" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" title="${escapeHtml(targetRecipeDisplayName)} (${_tLab('點擊更換', 'Click to change', isEN)})">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-target-recipe-chip-icon" alt="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <span class="lab-target-recipe-chip-badge">${escapeHtml(targetRecipeCategory)}</span>
              <span class="lab-target-recipe-chip-btn">${_tLab('更換', 'Change', isEN)}</span>
            </div>
          </div>
        ` : `
          <div class="lab-team-config-group">
            <span class="lab-team-config-label">${_tLab('料理種類:', 'Cooking Goal:', isEN)}</span>
            <div class="lab-team-pills">
              <button type="button" class="lab-team-pill ${labState.cookingType === 'curry' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('curry')">${_tLab('咖哩/濃湯', 'Curry', isEN)}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'salad' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('salad')">${_tLab('沙拉', 'Salad', isEN)}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'dessert' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('dessert')">${_tLab('點心/飲料', 'Dessert', isEN)}</button>
            </div>
          </div>
        `}

        ${potControlHtml}
      </div>
    `;

    // ─── 全隊生效光環彙總列 (Team Shared Bonuses Summary Bar - Zero Glyphs/Icons) ─────────────
    const activeAuraChips = [];
    if (simulation.helpingBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-helping" title="${_tLab('全體幫手速度 +' + (simulation.helpingBonusCount * 5) + '%', 'Team Helping Speed +' + (simulation.helpingBonusCount * 5) + '%', isEN)}">
          <strong>${_tLab('幫手獎勵', 'Helping Bonus', isEN)}</strong> x${simulation.helpingBonusCount} (+${simulation.helpingBonusCount * 5}%)
        </span>
      `);
    }
    if (simulation.energyRecoveryBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-energy" title="${_tLab('全體睡眠活力回復 +' + (simulation.energyRecoveryBonusCount * 14) + '%', 'Team Energy Recovery +' + (simulation.energyRecoveryBonusCount * 14) + '%', isEN)}">
          <strong>${_tLab('活力回復獎勵', 'Energy Recovery', isEN)}</strong> x${simulation.energyRecoveryBonusCount} (+${simulation.energyRecoveryBonusCount * 14}%)
        </span>
      `);
    }
    if (simulation.sleepExpBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-sleepexp" title="${_tLab('全體睡眠EXP +' + (simulation.sleepExpBonusCount * 14) + '%', 'Team Sleep EXP +' + (simulation.sleepExpBonusCount * 14) + '%', isEN)}">
          <strong>${_tLab('睡眠EXP獎勵', 'Sleep EXP', isEN)}</strong> x${simulation.sleepExpBonusCount} (+${simulation.sleepExpBonusCount * 14}%)
        </span>
      `);
    }
    if (simulation.researchExpBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-researchexp" title="${_tLab('研究EXP +' + (simulation.researchExpBonusCount * 6) + '%', 'Research EXP +' + (simulation.researchExpBonusCount * 6) + '%', isEN)}">
          <strong>${_tLab('研究EXP獎勵', 'Research EXP', isEN)}</strong> x${simulation.researchExpBonusCount} (+${simulation.researchExpBonusCount * 6}%)
        </span>
      `);
    }
    if (simulation.dreamShardBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-dreamshard" title="${_tLab('夢之碎片 +' + (simulation.dreamShardBonusCount * 6) + '%', 'Dream Shards +' + (simulation.dreamShardBonusCount * 6) + '%', isEN)}">
          <strong>${_tLab('夢之碎片獎勵', 'Dream Shard', isEN)}</strong> x${simulation.dreamShardBonusCount} (+${simulation.dreamShardBonusCount * 6}%)
        </span>
      `);
    }

    const teamAurasBarHtml = `
      <div class="lab-team-auras-col lab-team-auras-bar">
        <div class="lab-team-auras-label">
          <span>${_tLab('隊伍全體光環彙總:', 'Team Shared Bonuses:', isEN)}</span>
        </div>
        <div class="lab-team-auras-chips">
          ${activeAuraChips.length > 0 ? activeAuraChips.join('') : `<span class="lab-team-aura-chip empty">${_tLab('目前隊內無全體加成光環 (個人特化陣容)', 'No team bonuses active (personal builds)', isEN)}</span>`}
        </div>
      </div>
    `;

    // ─── 隊伍 5 個隊員卡片 (Pokémon Sleep App Style Compact 100% Width Rows) ─
    const slotsHtml = [0, 1, 2, 3, 4].map(idx => {
      const item = teamItems[idx];
      if (!item) {
        return `
          <div class="lab-team-slot-card lab-team-slot-empty" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })" title="${_tLab('點擊挑選隊員', 'Click to select team member', isEN)}">
            <div class="lab-slot-empty-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span class="lab-slot-empty-text">${_tLab('點擊挑選隊員', 'Select Team Member', isEN)}</span>
            </div>
          </div>
        `;
      }

      const base = findBasePkm(item.pokemonId || item.name);
      const displayName = (window.I18N && typeof window.I18N.getPokemonName === 'function')
        ? window.I18N.getPokemonName(base || item.name)
        : _tLab(item.name || (base ? base.name_cn : ''), base ? (base.name_en || base.name_cn) : item.name, isEN);
      const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
      const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
      const berryDisp = (window.I18N && typeof window.I18N.getBerryName === 'function') ? window.I18N.getBerryName(berry.name || '') : _tLabStr(berry.name || '');
      const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
      const specialtyIconHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 15) : '';
      const rawSkill = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
      const skillName = rawSkill ? (window.I18N ? window.I18N.getMainSkillName(rawSkill) : _tLabStr(rawSkill)) : _tLab('技能', 'Skill', isEN);
      const skillLv = item.skillLevel || item.mainSkillLevel || 1;
      const natureDisplayName = window.I18N ? window.I18N.getNatureName(item.nature) : _tLabStr(item.nature);
      const simSlot = simulation.slotResults[idx];
      const itemLv = item.level || 1;

      // 3 食材槽呈現 (無等級標籤、無外框、靠右展示)
      const ing1 = item.ing1 || (base && base.ingredients && base.ingredients[0] ? base.ingredients[0].name : '');
      const ing2 = item.ing2 || (base && base.ingredients && base.ingredients[1] ? base.ingredients[1].name : '');
      const ing3 = item.ing3 || (base && base.ingredients && base.ingredients[2] ? base.ingredients[2].name : '');
      const ingSlots = [
        { name: ing1, req: 1, unlocked: true },
        { name: ing2, req: 30, unlocked: itemLv >= 30 },
        { name: ing3, req: 60, unlocked: itemLv >= 60 }
      ];

      const ingStripHtml = `
        <div class="lab-slot-ing-strip">
          ${ingSlots.map(s => {
            const iName = s.name || '--';
            const iDisp = window.I18N ? window.I18N.getIngredientName(iName) : _tLabStr(iName);
            const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
            return `
              <div class="lab-slot-ing-chip ${!s.unlocked ? 'is-locked' : ''}" title="Lv.${s.req}: ${escapeHtml(iDisp)}${!s.unlocked ? _tLab(' (未解鎖)', ' (Locked)', isEN) : ''}">
                ${icon ? `<img src="${icon}" class="lab-slot-ing-icon" alt="${escapeHtml(iDisp)}">` : `<span style="font-size:9px;color:var(--text-muted);">-</span>`}
              </div>
            `;
          }).join('')}
        </div>
      `;

      // 僅展示影響全隊之副技能 (全體加成光環: 幫手獎勵/活力回復獎勵/睡眠EXP獎勵/研究EXP獎勵/夢之碎片獎勵)
      const subs = Array.isArray(item.subskills) ? item.subskills : [];
      const lvReqs = [10, 25, 50, 70, 80];
      const activeAuras = [];
      const lockedAuras = [];

      subs.forEach((sName, sIdx) => {
        if (!sName) return;
        const req = lvReqs[sIdx] || 10;
        const isUnlocked = itemLv >= req;
        const isTeamSub = (
          sName === '幫手獎勵' || sName === 'Helping Bonus' ||
          sName === '睡眠EXP獎勵' || sName === 'Sleep EXP Bonus' ||
          sName === '活力回復獎勵' || sName === '能量回復獎勵' || sName === 'Energy Recovery Bonus' ||
          sName === '研究EXP獎勵' || sName === 'Research EXP Bonus' ||
          sName === '夢之碎片獎勵' || sName === 'Dream Shard Bonus'
        );

        if (isTeamSub) {
          const auraObj = { name: sName, req, sIdx };
          if (isUnlocked) {
            activeAuras.push(auraObj);
          } else {
            lockedAuras.push(auraObj);
          }
        }
      });

      let aurasHtml = '';
      if (activeAuras.length > 0) {
        aurasHtml = activeAuras.map(a => {
          const sDisp = window.I18N ? window.I18N.getSubSkillName(a.name) : _tLabStr(a.name);
          return `
            <div class="lab-slot-aura-badge aura-active" title="Lv.${a.req} ${escapeHtml(sDisp)} · ${_tLab('全體隊伍加成', 'Team Shared Bonus', isEN)}">
              <span class="aura-name">${escapeHtml(sDisp)}</span>
            </div>
          `;
        }).join('');
      } else if (lockedAuras.length > 0) {
        aurasHtml = lockedAuras.map(a => {
          const sDisp = window.I18N ? window.I18N.getSubSkillName(a.name) : _tLabStr(a.name);
          return `
            <div class="lab-slot-aura-badge aura-locked" title="Lv.${a.req} ${escapeHtml(sDisp)} (${_tLab('未解鎖 · Lv.' + a.req, 'Locked until Lv.' + a.req, isEN)})">
              <span class="aura-name">${escapeHtml(sDisp)}</span>
              <span class="aura-tag">Lv.${a.req}</span>
            </div>
          `;
        }).join('');
      } else {
        aurasHtml = `
          <div class="lab-slot-aura-badge aura-none" title="${_tLab('個人特化專精：副技能均為個人加成，無全隊光環', 'Individual Specialist: Subskills focus on personal performance rather than whole team', isEN)}">
            <span class="aura-name">${_tLab('個人專精', 'Solo Specialist', isEN)}</span>
          </div>
        `;
      }

      return `
        <div class="lab-team-slot-card">
          <div class="lab-slot-main-row">
            <div class="lab-slot-identity-group">
              <div class="lab-slot-avatar-wrap">
                <img src="${avatarUrl}" class="lab-slot-avatar-img" alt="${escapeHtml(displayName)}" loading="lazy">
                <span class="lab-slot-lv-badge">Lv.${item.level || 1}</span>
              </div>
              <div class="lab-slot-name-col">
                <div class="lab-slot-name-row">
                  <span class="lab-slot-name">${escapeHtml(displayName)}</span>
                  ${item.nickname ? `<span class="lab-slot-nickname">(${escapeHtml(item.nickname)})</span>` : ''}
                </div>
                <div class="lab-slot-spec-left">
                  ${specialtyIconHtml}
                  <div class="lab-slot-berry-wrap ${isFav ? 'favored' : ''}" title="${escapeHtml(berryDisp)}${isFav ? ' (2x)' : ''}">
                    ${berry.icon ? `<img src="${berry.icon}" class="lab-slot-berry-icon" alt="Berry">` : ''}
                    ${isFav ? `<span class="lab-slot-fav-badge">2x</span>` : ''}
                  </div>
                  <span class="lab-slot-nature-name">${escapeHtml(natureDisplayName)}${(item.cleanseMint || item.mint) ? ' (' + _tLab('薄荷', 'Mint', isEN) + ')' : ''}</span>
                </div>
              </div>
            </div>
            <button type="button" class="box-btn box-btn-secondary lab-slot-replace-top-btn" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })">
              ${_tLab('更換', 'Replace', isEN)}
            </button>
          </div>

          <div class="lab-slot-spec-row">
            <div class="lab-slot-ings-right">
              ${ingStripHtml}
            </div>
          </div>

          <div class="lab-slot-bottom-row">
            <div class="lab-slot-bottom-left">
              <span class="lab-slot-skill-name">${escapeHtml(skillName)} <strong class="lab-slot-skill-lv">Lv.${skillLv}</strong></span>
              ${aurasHtml}
            </div>
            <div class="lab-slot-bottom-right">
              ${simSlot ? `<span class="lab-slot-berry-pts" title="${_tLab('每日樹果能量', 'Daily berry energy', isEN)}">${simSlot.dailyBerryEnergy.toLocaleString()} <span style="font-size:9px;color:var(--text-muted);">${_tLab('能量', 'pts', isEN)}</span></span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const ingEntries = Object.entries(simulation.ingredientsMap);
    ingEntries.sort((a, b) => b[1] - a[1]);
    const keyIngs = COOKING_CATEGORY_KEY_INGREDIENTS[labState.cookingType] || [];
    const targetAnalysis = simulation.targetRecipeAnalysis;
    const topIngsHtml = ingEntries.slice(0, 8).map(([iName, count]) => {
      const iDisplayName = window.I18N ? window.I18N.getIngredientName(iName) : _tLabStr(iName);
      const iconUrl = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
      
      const targetItem = targetAnalysis && Array.isArray(targetAnalysis.items)
        ? targetAnalysis.items.find(it => it.name === iName || (window.I18N && window.I18N.getIngredientName(it.name) === iName))
        : null;
      const isTargetIng = !!targetItem;
      const isSurplusDaily = targetItem ? (targetItem.diff >= 0 || targetItem.fulfillmentPct >= 100) : false;
      const isCategoryKey = keyIngs.includes(iName);
      const isCookMatch = isTargetIng || isSurplusDaily || isCategoryKey;

      const chipBorder = isSurplusDaily
        ? '1px solid #22c55e'
        : (isCookMatch ? '1px solid var(--accent-color, #38bdf8)' : 'none');
      const chipBg = isSurplusDaily
        ? 'rgba(34, 197, 94, 0.12)'
        : (isCookMatch ? 'rgba(56, 189, 248, 0.12)' : 'transparent');
      const chipPadding = (isSurplusDaily || isCookMatch) ? '1px 5px' : '0 2px';
      const numColor = isSurplusDaily
        ? '#4ade80'
        : (isCookMatch ? '#38bdf8' : '#e2e8f0');

      return `
        <div style="display:inline-flex;align-items:center;gap:3px;background:${chipBg};border:${chipBorder};border-radius:4px;padding:${chipPadding};font-size:10.5px;" title="${escapeHtml(iDisplayName)}${isSurplusDaily ? _tLab(' (三餐自給充裕)', ' (Daily Self-Sufficient)', isEN) : (isCookMatch ? _tLab(' (料理契合)', ' (Recipe Synergy)', isEN) : '')}">
          ${iconUrl ? `<img src="${iconUrl}" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(iDisplayName)}">` : ''}
          <span style="color:${numColor};font-weight:700;">x${count}</span>
        </div>
      `;
    }).join('');

    // ─── 目標料理食材供需看板 (緊湊多欄 Grid 卡片矩陣) ────────────────────
    let supplyDemandBoardHtml = '';
    if (targetAnalysis && Array.isArray(targetAnalysis.items)) {
      const itemsHtml = targetAnalysis.items.map(item => {
        const iDisplayName = window.I18N ? window.I18N.getIngredientName(item.name) : _tLabStr(item.name);
        const iconUrl = item.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(item.name) : '');
        const isSurplus = item.diff >= 0;
        const diffText = isSurplus ? `+${item.diff} ${_tLab('充裕', 'Surplus', isEN)}` : `${item.diff} ${_tLab('缺口', 'Deficit', isEN)}`;
        const diffClass = isSurplus ? 'lab-supply-surplus' : 'lab-supply-deficit';
        const barPct = Math.min(100, Math.max(0, item.fulfillmentPct));
        const barColor = item.fulfillmentPct >= 100 ? '#22c55e' : (item.fulfillmentPct >= 60 ? 'var(--accent-color, #38bdf8)' : '#f59e0b');

        return `
          <div class="lab-supply-row">
            <div class="lab-supply-row-top">
              <div class="lab-supply-col-ing">
                ${iconUrl ? `<img src="${iconUrl}" class="lab-supply-ing-icon" alt="${escapeHtml(iDisplayName)}">` : ''}
                <span class="lab-supply-ing-name">${escapeHtml(iDisplayName)}</span>
              </div>
              <div class="lab-supply-col-diff">
                <span class="lab-supply-diff-badge ${diffClass}">${diffText}</span>
              </div>
            </div>
            <div class="lab-supply-row-mid">
              <span title="${_tLab('單餐需求', 'Single meal requirement', isEN)}">${_tLab('每餐:', 'Meal:', isEN)} <strong>x${item.perMeal}</strong></span>
              <span class="lab-supply-mid-sep">·</span>
              <span title="${_tLab('每日 3 餐總需求', 'Daily 3-meal total demand', isEN)}">${_tLab('日需:', 'Daily:', isEN)} <strong>x${item.dailyDemand}</strong></span>
              <span class="lab-supply-mid-sep">·</span>
              <span title="${_tLab('隊伍每日預估產出', 'Team estimated daily harvest', isEN)}">${_tLab('日產:', 'Yield:', isEN)} <strong style="color:#22c55e;">x${item.teamYield}</strong></span>
            </div>
            <div class="lab-supply-col-progress">
              <div class="lab-supply-progress-bar-bg">
                <div class="lab-supply-progress-bar-fill" style="width:${barPct}%;background:${barColor};"></div>
              </div>
              <span class="lab-supply-progress-pct" style="color:${barColor};">${item.fulfillmentPct}%</span>
            </div>
          </div>
        `;
      }).join('');

      const overallStatusBadge = targetAnalysis.isFullySatisfied
        ? `<span class="lab-supply-overall-badge satisfied">[OK] ${_tLab('100% 達成 · 可完全自給自足', '100% Self-Sufficient', isEN)}</span>`
        : `<span class="lab-supply-overall-badge pending">${_tLab(`全體達成率: ${targetAnalysis.overallFulfillmentPct}%`, `Overall: ${targetAnalysis.overallFulfillmentPct}%`, isEN)}</span>`;

      supplyDemandBoardHtml = `
        <div class="lab-recipe-supply-board" id="lab-team-recipe-supply-demand">
          <div class="lab-supply-board-header">
            <div class="lab-supply-board-title-group">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-supply-dish-icon" alt="${escapeHtml(targetRecipeDisplayName)}" title="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <div>
                <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                  <span class="sr-only">${escapeHtml(targetRecipeDisplayName)}</span>
                  <span class="lab-supply-dish-badge">${escapeHtml(targetRecipeCategory)}</span>
                  ${targetRecipe.pot_size ? `<span class="lab-supply-dish-meta">${targetRecipe.pot_size} ${_tLab('格鍋容量', 'Pots', isEN)}</span>` : ''}
                  ${targetRecipe.base_energy ? `<span class="lab-supply-dish-meta">${targetRecipe.base_energy.toLocaleString()} ${_tLab('基礎能量', 'Base Energy', isEN)}</span>` : ''}
                </div>
                <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">
                  ${_tLab('目標料理食材供需看板 · 精算每日 3 餐食材缺口與隊伍自給自足率', 'Target Recipe Ingredient Supply vs Daily Demand Dashboard (3 Meals/Day)', isEN)}
                </div>
              </div>
            </div>
            <div class="lab-supply-board-actions">
              ${overallStatusBadge}
              <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" style="font-size:10.5px;padding:3px 8px;display:inline-flex;align-items:center;gap:3px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>${_tLab('更換目標料理', 'Change Recipe', isEN)}</span>
              </button>
            </div>
          </div>
          <div class="lab-supply-table-wrapper">
            <div class="lab-supply-items-list">
              ${itemsHtml}
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="lab-team-view-container">
        <div class="lab-island-config-row">
          <div class="lab-island-selector-col">
            <div class="lab-island-circles-row">
              ${islandPillsHtml}
            </div>
          </div>
          ${teamVariablesBarHtml}
        </div>

        ${greengrassConfigHtml}

        <div class="lab-favored-auras-row">
          <div class="lab-favored-berries-col">
            <span class="lab-favored-label">${_tLab('喜愛樹果 (2x 能量):', 'Favored Berries (2x Power):', isEN)}</span>
            <div class="lab-favored-berries-list">
              ${favoredBerriesHtml}
            </div>
          </div>
          ${teamAurasBarHtml}
        </div>

        <div class="lab-team-grid">
          ${slotsHtml}
        </div>

        ${supplyDemandBoardHtml}

        <div class="lab-team-metrics-grid">
          <div class="lab-metric-card lab-metric-headline-card">
            <div class="lab-metric-headline-top" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:4px;">
              <span class="lab-metric-title" style="font-size:11.5px;font-weight:700;color:var(--text-muted);">${_tLab('預估每日能量總產出', 'Estimated Daily Total Energy', isEN)}</span>
              <span class="lab-projected-rank-badge" title="${_tLab('依據每日產能 x7 預估週日卡比獸可達階級', 'Estimated Sunday Snorlax Rank at 7x Daily Energy', isEN)}">
                ${_tLab('預估週日卡比獸階級: ', 'Projected Sunday Snorlax Rank: ', isEN)}<strong>${simulation.projectedSundayRank}</strong>
              </span>
            </div>
            <div class="lab-metric-value">${simulation.totalDailyEnergy.toLocaleString()} <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${_tLab('能量/日', 'pts/day', isEN)}</span></div>
            <div class="lab-metric-breakdown-chips">
              <span class="breakdown-chip chip-berry">${_tLab('樹果: ', 'Berry: ', isEN)}${simulation.totalDailyBerryEnergy.toLocaleString()}</span>
              <span class="breakdown-chip chip-cooking">${_tLab('料理 (3餐): ', 'Cooking (3 meals): ', isEN)}${simulation.dailyCookingEnergy.toLocaleString()}</span>
              <span class="breakdown-chip chip-skill">${_tLab('技能: ', 'Skill: ', isEN)}${simulation.dailySkillEnergy.toLocaleString()}</span>
            </div>
            <div class="lab-metric-sub">
              ${_tLab(`依據【${island.name}】喜愛樹果加成、每日 3 餐料理產能與主技能發動綜合精算。`, `Comprehensive simulation based on ${island.name_en || island.name} 2x berry power, 3-meal cooking synergy, and direct skill triggers.`, isEN)}
            </div>
          </div>

          <div class="lab-metric-card">
            <div style="font-size:11.5px;font-weight:700;color:var(--text-muted);">${_tLab('預估每日食材總產量', 'Daily Ingredients Harvest', isEN)}</div>
            <div class="lab-metric-value" style="color:#22c55e;">${simulation.totalDailyIngredientsCount} <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${_tLab('個/日', 'items/day', isEN)}</span></div>
            <div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:2px;">
              ${topIngsHtml || `<span style="font-size:10.5px;color:var(--text-muted);">${_tLab('尚無食材產出', 'No ingredients yet', isEN)}</span>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }
