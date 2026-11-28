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

  function renderGreengrassBerrySelect(idx, currentBerryName) {
    const berriesList = _getLabBerryValuesData();
    const currentCid = _resolveLabBerryCanonicalId(currentBerryName);
    const optionsHtml = berriesList.map(b => {
      const bDisp = window.I18N?.getBerryName?.(b.name) ?? b.name;
      const tDisp = window.I18N?.getTypeName?.(b.type) ?? b.type;
      const isSel = (currentCid && b.id === currentCid) || b.name === currentBerryName ? 'selected' : '';
      return `<option value="${escapeHtml(b.name)}" ${isSel}>${escapeHtml(bDisp)} (${tDisp})</option>`;
    }).join('');

    const bObj = _findLabBerryData(currentBerryName) || berriesList[0];

    return `
      <div class="lab-greengrass-berry-item">
        ${bObj && bObj.icon ? `<img src="${bObj.icon}" class="lab-berry-mini-icon" width="18" height="18" loading="lazy" decoding="async" alt="Berry">` : ''}
        <select class="lab-select lab-berry-select" onchange="window.AppraisalLab.setGreengrassBerry(${idx}, this.value)">
          ${optionsHtml}
        </select>
      </div>
    `;
  }

  /* ─── 幫手組隊 HTML 產生器 (Team Builder View Renderer) ──────────────── */
  function renderTeamBuilderView(userBox, pokemons) {
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
      const islName = window.I18N?.getIslandName?.(isl.name) ?? (window.I18N?.field?.(isl, 'name') || isl.name);
      return `
        <button type="button" class="lab-island-circle-btn ${isActive ? 'active' : ''}" style="${islImgUrl ? `background-image:url('${islImgUrl}');` : `background-color:${isl.color};`}${isActive ? `border-color:${isl.color};box-shadow:0 0 10px ${isl.color}99;` : ''}" onclick="window.AppraisalLab.setTeamIsland('${isl.id}')" title="${escapeHtml(islName)}">
          <span class="sr-only">${escapeHtml(islName)}</span>
        </button>
      `;
    }).join('');

    const favoredBerriesHtml = favBerries.map(bName => {
      const bObj = _findLabBerryData(bName) || {};
      const canonicalName = bObj.name || bName;
      const bDisplayName = window.I18N?.getBerryName?.(canonicalName) ?? canonicalName;
      return `
        <span class="lab-favored-berry-icon-wrap" title="${escapeHtml(bDisplayName)}">
          ${bObj.icon ? `<img src="${bObj.icon}" class="lab-favored-berry-img" width="22" height="22" loading="lazy" decoding="async" alt="${escapeHtml(bDisplayName)}">` : ''}
        </span>
      `;
    }).join('');

    const greengrassConfigHtml = isGreengrass ? `
      <div class="lab-greengrass-berries-config">
        <div class="lab-greengrass-berries-head">
          <div style="display:flex;flex-direction:column;gap:1px;">
            <span style="font-size:11.5px;font-weight:700;color:#22c55e;">${window.I18N?.t?.('lab.t_gg_berries_title') ?? 'lab.t_gg_berries_title'}</span>
            <span style="font-size:10.5px;color:var(--text-muted);">${window.I18N?.t?.('lab.t_gg_berries_sub') ?? 'lab.t_gg_berries_sub'}</span>
          </div>
          <div class="lab-greengrass-actions" style="display:flex;gap:5px;align-items:center;">
            <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.rerollGreengrassBerries(false)" style="font-size:10.5px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;" title="${window.I18N?.t?.('lab.t_reroll_title') ?? 'lab.t_reroll_title'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>${window.I18N?.t?.('lab.t_reroll_btn') ?? 'lab.t_reroll_btn'}</span>
            </button>
            <button type="button" class="box-btn box-btn-primary" onclick="window.AppraisalLab.rerollGreengrassBerries(true)" style="font-size:10.5px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;" title="${window.I18N?.t?.('lab.t_roll_build_title') ?? 'lab.t_roll_build_title'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>${window.I18N?.t?.('lab.t_roll_build_btn') ?? 'lab.t_roll_build_btn'}</span>
            </button>
          </div>
        </div>
        <div class="lab-greengrass-selects-row">
          ${[0, 1, 2].map(idx => renderGreengrassBerrySelect(idx, (labState.greengrassBerries && labState.greengrassBerries[idx]) || ['桃桃果', '橙橙果', '櫻子果'][idx])).join('')}
        </div>
      </div>
    ` : '';

    const targetRecipe = findTargetRecipe(labState.targetRecipeName);
    const targetRecipeDisplayName = window.I18N?.getRecipeName?.(targetRecipe) ?? (targetRecipe.name_cn || targetRecipe.name || '');
    const rawCat = targetRecipe.category || '咖哩';
    const catLower = rawCat.toLowerCase();
    const catKey = (catLower.includes('沙拉') || catLower.includes('salad'))
      ? 'lab.t_cook_salad'
      : ((catLower.includes('甜') || catLower.includes('點心') || catLower.includes('dessert') || catLower.includes('飲料') || catLower.includes('drink'))
          ? 'lab.t_cook_dessert'
          : 'lab.t_cook_curry');
    const targetRecipeCategory = window.I18N?.t?.(catKey) ?? catKey;
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
          ? `<span class="lab-pot-feasibility feasible">[OK] ${window.I18N?.t?.('lab.t_pot_ok') ?? 'lab.t_pot_ok'} (${targetPotReq}/${effectivePotSize})</span>`
          : `<span class="lab-pot-feasibility deficit">[!] ${window.I18N?.t?.('lab.t_pot_short') ?? 'lab.t_pot_short'} (${targetPotReq}/${effectivePotSize})</span>`)
      : '';

    const potControlHtml = `
      <div class="lab-team-config-group lab-pot-config-group">
        <span class="lab-team-config-label">${window.I18N?.t?.('lab.t_pot_size_label') ?? 'lab.t_pot_size_label'}</span>
        <div class="lab-pot-stepper-wrap">
          <button type="button" class="lab-pot-step-btn" onclick="window.AppraisalLab.stepPotSize(-3)" title="${window.I18N?.t?.('lab.t_pot_dec_title') ?? 'lab.t_pot_dec_title'}">-</button>
          <span class="lab-pot-size-display" title="${window.I18N?.t?.('lab.t_pot_base_title', { size: basePotSize }) ?? 'lab.t_pot_base_title'}">${basePotSize}</span>
          <button type="button" class="lab-pot-step-btn" onclick="window.AppraisalLab.stepPotSize(3)" title="${window.I18N?.t?.('lab.t_pot_inc_title') ?? 'lab.t_pot_inc_title'}">+</button>
        </div>
        <div class="lab-pot-modifiers">
          <button type="button" class="lab-pot-toggle-btn ${labState.sundayPotExpansion ? 'active' : ''}" onclick="window.AppraisalLab.toggleSundayPotExpansion()" title="${window.I18N?.t?.('lab.t_pot_sunday_title') ?? 'lab.t_pot_sunday_title'}">
            ${window.I18N?.t?.('lab.t_pot_sunday_btn') ?? 'lab.t_pot_sunday_btn'}
          </button>
          <button type="button" class="lab-pot-toggle-btn ${labState.goodCampTicket ? 'active' : ''}" onclick="window.AppraisalLab.toggleGoodCampTicket()" title="${window.I18N?.t?.('lab.t_pot_camp_title') ?? 'lab.t_pot_camp_title'}">
            ${window.I18N?.t?.('lab.t_pot_camp_btn') ?? 'lab.t_pot_camp_btn'}
          </button>
        </div>
        <div class="lab-effective-pot-wrap">
          <span class="lab-effective-pot-label">${window.I18N?.t?.('lab.t_pot_effective_label') ?? 'lab.t_pot_effective_label'} <strong class="lab-effective-pot-num">${effectivePotSize}</strong></span>
          ${potFeasibilityBadge}
        </div>
      </div>
    `;

    const teamVariablesBarHtml = `
      <div class="lab-team-config-col lab-team-config-panel">
        <div class="lab-team-config-group">
          <span class="lab-team-config-label">${window.I18N?.t?.('lab.t_team_focus_label') ?? 'lab.t_team_focus_label'}</span>
          <div class="lab-team-pills">
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'balanced' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('balanced')">${window.I18N?.t?.('lab.t_strat_balanced') ?? 'lab.t_strat_balanced'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'berries' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('berries')">${window.I18N?.t?.('lab.t_pill_berries') ?? 'lab.t_pill_berries'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'ingredients' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('ingredients')">${window.I18N?.t?.('lab.t_pill_ingredients') ?? 'lab.t_pill_ingredients'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'skills' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('skills')">${window.I18N?.t?.('lab.t_pill_skills') ?? 'lab.t_pill_skills'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'recipe' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('recipe')">${window.I18N?.t?.('lab.t_pill_recipe') ?? 'lab.t_pill_recipe'}</button>
          </div>
        </div>

        ${isTargetRecipeStrategy ? `
          <div class="lab-team-config-group lab-target-recipe-config-group">
            <span class="lab-team-config-label">${window.I18N?.t?.('lab.t_target_dish_label') ?? 'lab.t_target_dish_label'}</span>
            <div class="lab-target-recipe-chip" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" title="${escapeHtml(targetRecipeDisplayName)} (${window.I18N?.t?.('lab.t_click_to_change') ?? 'lab.t_click_to_change'})">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-target-recipe-chip-icon" width="26" height="26" loading="lazy" decoding="async" alt="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <span class="lab-target-recipe-chip-badge">${escapeHtml(targetRecipeCategory)}</span>
              <span class="lab-target-recipe-chip-btn">${window.I18N?.t?.('lab.t_change') ?? 'lab.t_change'}</span>
            </div>
          </div>
        ` : `
          <div class="lab-team-config-group">
            <span class="lab-team-config-label">${window.I18N?.t?.('lab.t_cooking_goal_label') ?? 'lab.t_cooking_goal_label'}</span>
            <div class="lab-team-pills">
              <button type="button" class="lab-team-pill ${labState.cookingType === 'curry' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('curry')">${window.I18N?.t?.('lab.t_cook_curry') ?? 'lab.t_cook_curry'}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'salad' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('salad')">${window.I18N?.t?.('lab.t_cook_salad') ?? 'lab.t_cook_salad'}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'dessert' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('dessert')">${window.I18N?.t?.('lab.t_cook_dessert') ?? 'lab.t_cook_dessert'}</button>
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
        <span class="lab-team-aura-chip chip-helping" title="${window.I18N?.t?.('lab.t_aura_helping_title', { pct: simulation.helpingBonusCount * 5 }) ?? 'lab.t_aura_helping_title'}">
          <strong>${window.I18N?.t?.('lab.t_aura_helping') ?? 'lab.t_aura_helping'}</strong> x${simulation.helpingBonusCount} (+${simulation.helpingBonusCount * 5}%)
        </span>
      `);
    }
    if (simulation.energyRecoveryBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-energy" title="${window.I18N?.t?.('lab.t_aura_energy_title', { pct: simulation.energyRecoveryBonusCount * 14 }) ?? 'lab.t_aura_energy_title'}">
          <strong>${window.I18N?.t?.('lab.t_aura_energy') ?? 'lab.t_aura_energy'}</strong> x${simulation.energyRecoveryBonusCount} (+${simulation.energyRecoveryBonusCount * 14}%)
        </span>
      `);
    }
    if (simulation.sleepExpBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-sleepexp" title="${window.I18N?.t?.('lab.t_aura_sleepexp_title', { pct: simulation.sleepExpBonusCount * 14 }) ?? 'lab.t_aura_sleepexp_title'}">
          <strong>${window.I18N?.t?.('lab.t_aura_sleepexp') ?? 'lab.t_aura_sleepexp'}</strong> x${simulation.sleepExpBonusCount} (+${simulation.sleepExpBonusCount * 14}%)
        </span>
      `);
    }
    if (simulation.researchExpBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-researchexp" title="${window.I18N?.t?.('lab.t_aura_researchexp_title', { pct: simulation.researchExpBonusCount * 6 }) ?? 'lab.t_aura_researchexp_title'}">
          <strong>${window.I18N?.t?.('lab.t_aura_researchexp') ?? 'lab.t_aura_researchexp'}</strong> x${simulation.researchExpBonusCount} (+${simulation.researchExpBonusCount * 6}%)
        </span>
      `);
    }
    if (simulation.dreamShardBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-dreamshard" title="${window.I18N?.t?.('lab.t_aura_dreamshard_title', { pct: simulation.dreamShardBonusCount * 6 }) ?? 'lab.t_aura_dreamshard_title'}">
          <strong>${window.I18N?.t?.('lab.t_aura_dreamshard') ?? 'lab.t_aura_dreamshard'}</strong> x${simulation.dreamShardBonusCount} (+${simulation.dreamShardBonusCount * 6}%)
        </span>
      `);
    }

    const teamAurasBarHtml = `
      <div class="lab-team-auras-col lab-team-auras-bar">
        <div class="lab-team-auras-label">
          <span>${window.I18N?.t?.('lab.t_auras_bar_label') ?? 'lab.t_auras_bar_label'}</span>
        </div>
        <div class="lab-team-auras-chips">
          ${activeAuraChips.length > 0 ? activeAuraChips.join('') : `<span class="lab-team-aura-chip empty">${window.I18N?.t?.('lab.t_auras_empty') ?? 'lab.t_auras_empty'}</span>`}
        </div>
      </div>
    `;

    // ─── 隊伍 5 個隊員卡片 (Pokémon Sleep App Style Compact 100% Width Rows) ─
    const slotsHtml = [0, 1, 2, 3, 4].map(idx => {
      const item = teamItems[idx];
      if (!item) {
        return `
          <div class="lab-team-slot-card lab-team-slot-empty" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })" title="${window.I18N?.t?.('lab.t_slot_empty_title') ?? 'lab.t_slot_empty_title'}">
            <div class="lab-slot-empty-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span class="lab-slot-empty-text">${window.I18N?.t?.('lab.t_slot_empty_text') ?? 'lab.t_slot_empty_text'}</span>
            </div>
          </div>
        `;
      }

      const base = findBasePkm(item.pokemonId || item.name);
      const displayName = window.I18N?.getPokemonName?.(base || item.name) ?? (item.name || (base ? (base.name_cn || base.name_en) : ''));
      const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
      const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
      const berryDisp = window.I18N?.getBerryName?.(berry.name || '') ?? (berry.name || '');
      const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
      const specialtyIconHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 15) : '';
      const rawSkill = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
      const skillName = rawSkill ? (window.I18N?.getMainSkillName?.(rawSkill) ?? rawSkill) : (window.I18N?.t?.('lab.t_skill_short') ?? 'lab.t_skill_short');
      const skillLv = item.skillLevel || item.mainSkillLevel || 1;
      const natureDisplayName = window.I18N?.getNatureName?.(item.nature) ?? item.nature;
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
            const iDisp = window.I18N?.getIngredientName?.(iName) ?? iName;
            const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
            return `
              <div class="lab-slot-ing-chip ${!s.unlocked ? 'is-locked' : ''}" title="Lv.${s.req}: ${escapeHtml(iDisp)}${!s.unlocked ? (window.I18N?.t?.('lab.t_locked_paren') ?? 'lab.t_locked_paren') : ''}">
                ${icon ? `<img src="${icon}" class="lab-slot-ing-icon" width="20" height="20" loading="lazy" decoding="async" alt="${escapeHtml(iDisp)}">` : `<span style="font-size:9px;color:var(--text-muted);">-</span>`}
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
          const sDisp = window.I18N?.getSubSkillName?.(a.name) ?? a.name;
          return `
            <div class="lab-slot-aura-badge aura-active" title="Lv.${a.req} ${escapeHtml(sDisp)} · ${window.I18N?.t?.('lab.t_aura_team_shared') ?? 'lab.t_aura_team_shared'}">
              <span class="aura-name">${escapeHtml(sDisp)}</span>
            </div>
          `;
        }).join('');
      } else if (lockedAuras.length > 0) {
        aurasHtml = lockedAuras.map(a => {
          const sDisp = window.I18N?.getSubSkillName?.(a.name) ?? a.name;
          return `
            <div class="lab-slot-aura-badge aura-locked" title="Lv.${a.req} ${escapeHtml(sDisp)} (${window.I18N?.t?.('lab.t_aura_locked_until', { lv: a.req }) ?? 'lab.t_aura_locked_until'})">
              <span class="aura-name">${escapeHtml(sDisp)}</span>
              <span class="aura-tag">Lv.${a.req}</span>
            </div>
          `;
        }).join('');
      } else {
        aurasHtml = `
          <div class="lab-slot-aura-badge aura-none" title="${window.I18N?.t?.('lab.t_solo_spec_title') ?? 'lab.t_solo_spec_title'}">
            <span class="aura-name">${window.I18N?.t?.('lab.t_solo_spec') ?? 'lab.t_solo_spec'}</span>
          </div>
        `;
      }

      return `
        <div class="lab-team-slot-card">
          <div class="lab-slot-main-row">
            <div class="lab-slot-identity-group">
              <div class="lab-slot-avatar-wrap">
                <img src="${avatarUrl}" class="lab-slot-avatar-img" width="36" height="36" alt="${escapeHtml(displayName)}" loading="lazy" decoding="async">
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
                    ${berry.icon ? `<img src="${berry.icon}" class="lab-slot-berry-icon" width="15" height="15" loading="lazy" decoding="async" alt="Berry">` : ''}
                    ${isFav ? `<span class="lab-slot-fav-badge">2x</span>` : ''}
                  </div>
                  <span class="lab-slot-nature-name">${escapeHtml(natureDisplayName)}${(item.cleanseMint || item.mint) ? ` (${window.I18N?.t?.('lab.t_mint_short') ?? 'lab.t_mint_short'})` : ''}</span>
                </div>
              </div>
            </div>
            <button type="button" class="box-btn box-btn-secondary lab-slot-replace-top-btn" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })">
              ${window.I18N?.t?.('lab.t_replace') ?? 'lab.t_replace'}
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
              ${simSlot ? `<span class="lab-slot-berry-pts" title="${window.I18N?.t?.('lab.t_daily_berry_energy_title') ?? 'lab.t_daily_berry_energy_title'}">${simSlot.dailyBerryEnergy.toLocaleString()} <span style="font-size:9px;color:var(--text-muted);">${window.I18N?.t?.('lab.t_energy_pts') ?? 'lab.t_energy_pts'}</span></span>` : ''}
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
      const iDisplayName = window.I18N?.getIngredientName?.(iName) ?? iName;
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
        <div style="display:inline-flex;align-items:center;gap:3px;background:${chipBg};border:${chipBorder};border-radius:4px;padding:${chipPadding};font-size:10.5px;" title="${escapeHtml(iDisplayName)}${isSurplusDaily ? (window.I18N?.t?.('lab.t_ing_surplus_paren') ?? 'lab.t_ing_surplus_paren') : (isCookMatch ? (window.I18N?.t?.('lab.t_ing_synergy_paren') ?? 'lab.t_ing_synergy_paren') : '')}">
          ${iconUrl ? `<img src="${iconUrl}" width="16" height="16" loading="lazy" decoding="async" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(iDisplayName)}">` : ''}
          <span style="color:${numColor};font-weight:700;">x${count}</span>
        </div>
      `;
    }).join('');

    // ─── 目標料理食材供需看板 (緊湊多欄 Grid 卡片矩陣) ────────────────────
    let supplyDemandBoardHtml = '';
    if (targetAnalysis && Array.isArray(targetAnalysis.items)) {
      const itemsHtml = targetAnalysis.items.map(item => {
        const iDisplayName = window.I18N?.getIngredientName?.(item.name) ?? item.name;
        const iconUrl = item.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(item.name) : '');
        const isSurplus = item.diff >= 0;
        const diffText = isSurplus
          ? `+${item.diff} ${window.I18N?.t?.('lab.t_supply_surplus') ?? 'lab.t_supply_surplus'}`
          : `${item.diff} ${window.I18N?.t?.('lab.t_supply_deficit') ?? 'lab.t_supply_deficit'}`;
        const diffClass = isSurplus ? 'lab-supply-surplus' : 'lab-supply-deficit';
        const barPct = Math.min(100, Math.max(0, item.fulfillmentPct));
        const barColor = item.fulfillmentPct >= 100 ? '#22c55e' : (item.fulfillmentPct >= 60 ? 'var(--accent-color, #38bdf8)' : '#f59e0b');

        return `
          <div class="lab-supply-row">
            <div class="lab-supply-row-top">
              <div class="lab-supply-col-ing">
                ${iconUrl ? `<img src="${iconUrl}" class="lab-supply-ing-icon" width="18" height="18" loading="lazy" decoding="async" alt="${escapeHtml(iDisplayName)}">` : ''}
                <span class="lab-supply-ing-name">${escapeHtml(iDisplayName)}</span>
              </div>
              <div class="lab-supply-col-diff">
                <span class="lab-supply-diff-badge ${diffClass}">${diffText}</span>
              </div>
            </div>
            <div class="lab-supply-row-mid">
              <span title="${window.I18N?.t?.('lab.t_supply_meal_title') ?? 'lab.t_supply_meal_title'}">${window.I18N?.t?.('lab.t_supply_meal_lbl') ?? 'lab.t_supply_meal_lbl'} <strong>x${item.perMeal}</strong></span>
              <span class="lab-supply-mid-sep">·</span>
              <span title="${window.I18N?.t?.('lab.t_supply_daily_title') ?? 'lab.t_supply_daily_title'}">${window.I18N?.t?.('lab.t_supply_daily_lbl') ?? 'lab.t_supply_daily_lbl'} <strong>x${item.dailyDemand}</strong></span>
              <span class="lab-supply-mid-sep">·</span>
              <span title="${window.I18N?.t?.('lab.t_supply_yield_title') ?? 'lab.t_supply_yield_title'}">${window.I18N?.t?.('lab.t_supply_yield_lbl') ?? 'lab.t_supply_yield_lbl'} <strong style="color:#22c55e;">x${item.teamYield}</strong></span>
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
        ? `<span class="lab-supply-overall-badge satisfied">[OK] ${window.I18N?.t?.('lab.t_supply_satisfied') ?? 'lab.t_supply_satisfied'}</span>`
        : `<span class="lab-supply-overall-badge pending">${window.I18N?.t?.('lab.t_supply_overall', { pct: targetAnalysis.overallFulfillmentPct }) ?? 'lab.t_supply_overall'}</span>`;

      supplyDemandBoardHtml = `
        <div class="lab-recipe-supply-board" id="lab-team-recipe-supply-demand">
          <div class="lab-supply-board-header">
            <div class="lab-supply-board-title-group">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-supply-dish-icon" width="44" height="44" loading="lazy" decoding="async" alt="${escapeHtml(targetRecipeDisplayName)}" title="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <div>
                <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                  <span class="sr-only">${escapeHtml(targetRecipeDisplayName)}</span>
                  <span class="lab-supply-dish-badge">${escapeHtml(targetRecipeCategory)}</span>
                  ${targetRecipe.pot_size ? `<span class="lab-supply-dish-meta">${targetRecipe.pot_size} ${window.I18N?.t?.('lab.t_supply_pots_meta') ?? 'lab.t_supply_pots_meta'}</span>` : ''}
                  ${targetRecipe.base_energy ? `<span class="lab-supply-dish-meta">${targetRecipe.base_energy.toLocaleString()} ${window.I18N?.t?.('lab.t_supply_base_energy_meta') ?? 'lab.t_supply_base_energy_meta'}</span>` : ''}
                </div>
                <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">
                  ${window.I18N?.t?.('lab.t_supply_board_sub') ?? 'lab.t_supply_board_sub'}
                </div>
              </div>
            </div>
            <div class="lab-supply-board-actions">
              ${overallStatusBadge}
              <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" style="font-size:10.5px;padding:3px 8px;display:inline-flex;align-items:center;gap:3px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>${window.I18N?.t?.('lab.t_change_recipe_btn') ?? 'lab.t_change_recipe_btn'}</span>
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

    const islandNameDisplay = window.I18N?.getIslandName?.(island.name) ?? (window.I18N?.field?.(island, 'name') || island.name);

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
            <span class="lab-favored-label">${window.I18N?.t?.('lab.t_favored_berries_lbl') ?? 'lab.t_favored_berries_lbl'}</span>
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
              <span class="lab-metric-title" style="font-size:11.5px;font-weight:700;color:var(--text-muted);">${window.I18N?.t?.('lab.t_est_daily_total') ?? 'lab.t_est_daily_total'}</span>
              <span class="lab-projected-rank-badge" title="${window.I18N?.t?.('lab.t_projected_rank_title') ?? 'lab.t_projected_rank_title'}">
                ${window.I18N?.t?.('lab.t_projected_rank_lbl') ?? 'lab.t_projected_rank_lbl'}<strong>${simulation.projectedSundayRank}</strong>
              </span>
            </div>
            <div class="lab-metric-value">${simulation.totalDailyEnergy.toLocaleString()} <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${window.I18N?.t?.('lab.t_pts_per_day') ?? 'lab.t_pts_per_day'}</span></div>
            <div class="lab-metric-breakdown-chips">
              <span class="breakdown-chip chip-berry">${window.I18N?.t?.('lab.t_chip_berry') ?? 'lab.t_chip_berry'}${simulation.totalDailyBerryEnergy.toLocaleString()}</span>
              <span class="breakdown-chip chip-cooking">${window.I18N?.t?.('lab.t_chip_cooking') ?? 'lab.t_chip_cooking'}${simulation.dailyCookingEnergy.toLocaleString()}</span>
              <span class="breakdown-chip chip-skill">${window.I18N?.t?.('lab.t_chip_skill') ?? 'lab.t_chip_skill'}${simulation.dailySkillEnergy.toLocaleString()}</span>
            </div>
            <div class="lab-metric-sub">
              ${window.I18N?.t?.('lab.t_metric_sub', { islandName: islandNameDisplay }) ?? 'lab.t_metric_sub'}
            </div>
          </div>

          <div class="lab-metric-card">
            <div style="font-size:11.5px;font-weight:700;color:var(--text-muted);">${window.I18N?.t?.('lab.t_est_daily_ings') ?? 'lab.t_est_daily_ings'}</div>
            <div class="lab-metric-value" style="color:#22c55e;">${simulation.totalDailyIngredientsCount} <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${window.I18N?.t?.('lab.t_items_per_day') ?? 'lab.t_items_per_day'}</span></div>
            <div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:2px;">
              ${topIngsHtml || `<span style="font-size:10.5px;color:var(--text-muted);">${window.I18N?.t?.('lab.t_no_ings_yet') ?? 'lab.t_no_ings_yet'}</span>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }
