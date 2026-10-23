  function renderGreengrassBerrySelect(idx, currentBerryName, isEN) {
    const optionsHtml = BERRY_VALUES_DATA.map(b => {
      const bDisp = isEN ? (window.I18N && window.I18N.getBerryName ? window.I18N.getBerryName(b.name) : b.name) : b.name;
      const tDisp = window.I18N ? window.I18N.getTypeName(b.type) : b.type;
      const isSel = b.name === currentBerryName ? 'selected' : '';
      return `<option value="${escapeHtml(b.name)}" ${isSel}>${escapeHtml(bDisp)} (${tDisp})</option>`;
    }).join('');

    const bObj = BERRY_VALUES_DATA.find(b => b.name === currentBerryName) || BERRY_VALUES_DATA[0];

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
      const islName = isEN ? (isl.name_en || isl.name) : isl.name;
      return `
        <button type="button" class="lab-island-circle-btn ${isActive ? 'active' : ''}" style="${islImgUrl ? `background-image:url('${islImgUrl}');` : `background-color:${isl.color};`}${isActive ? `border-color:${isl.color};box-shadow:0 0 10px ${isl.color}99;` : ''}" onclick="window.AppraisalLab.setTeamIsland('${isl.id}')" title="${escapeHtml(islName)}">
          <span class="sr-only">${escapeHtml(islName)}</span>
        </button>
      `;
    }).join('');

    const favoredBerriesHtml = favBerries.map(bName => {
      const bObj = BERRY_VALUES_DATA.find(b => b.name === bName) || {};
      const bDisplayName = isEN ? (window.I18N && window.I18N.getBerryName ? window.I18N.getBerryName(bName) : bName) : bName;
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
            <span style="font-size:11.5px;font-weight:700;color:#22c55e;">${isEN ? 'Greengrass Favored Berries (Customizable):' : '萌綠之島本週喜愛樹果 (可自由自選):'}</span>
            <span style="font-size:10.5px;color:var(--text-muted);">${isEN ? 'Select 3 favored berries for this week (2x energy boost)' : '自選本週 3 種喜愛樹果，產能與推薦即時享有 2x 能量加成'}</span>
          </div>
          <div class="lab-greengrass-actions" style="display:flex;gap:5px;align-items:center;">
            <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.rerollGreengrassBerries(false)" style="font-size:10.5px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;" title="${isEN ? 'Reroll 3 random berries from 18' : '從 18 種樹果隨機刷新 3 種'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>${isEN ? 'Random Reroll' : '隨機擲骰'}</span>
            </button>
            <button type="button" class="box-btn box-btn-primary" onclick="window.AppraisalLab.rerollGreengrassBerries(true)" style="font-size:10.5px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;" title="${isEN ? 'Reroll 3 random berries and immediately auto-optimize team' : '隨機抽出 3 種樹果並立即自動推薦最佳陣容'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>${isEN ? 'Roll & Build' : '擲骰並自動配隊'}</span>
            </button>
          </div>
        </div>
        <div class="lab-greengrass-selects-row">
          ${[0, 1, 2].map(idx => renderGreengrassBerrySelect(idx, (labState.greengrassBerries && labState.greengrassBerries[idx]) || ['桃桃果', '橙橙果', '櫻子果'][idx], isEN)).join('')}
        </div>
      </div>
    ` : '';

    const targetRecipe = findTargetRecipe(labState.targetRecipeName);
    const targetRecipeDisplayName = isEN ? (targetRecipe.name_en || targetRecipe.name_cn) : (targetRecipe.name_cn || targetRecipe.name);
    const targetRecipeCategory = isEN
      ? (targetRecipe.category || 'Curry')
      : (targetRecipe.category || '咖哩');
    const isTargetRecipeStrategy = labState.teamStrategy === 'recipe';

    const teamVariablesBarHtml = `
      <div class="lab-team-config-col lab-team-config-panel">
        <div class="lab-team-config-group">
          <span class="lab-team-config-label">${isEN ? 'Team Focus:' : '隊伍類型:'}</span>
          <div class="lab-team-pills">
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'balanced' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('balanced')">${isEN ? 'Balanced' : '綜合隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'berries' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('berries')">${isEN ? 'Berries' : '樹果隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'ingredients' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('ingredients')">${isEN ? 'Ingredients' : '食材隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'skills' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('skills')">${isEN ? 'Skills' : '技能隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'recipe' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('recipe')">${isEN ? 'Target Recipe' : '目標料理'}</button>
          </div>
        </div>

        ${isTargetRecipeStrategy ? `
          <div class="lab-team-config-group lab-target-recipe-config-group">
            <span class="lab-team-config-label">${isEN ? 'Target Dish:' : '目標料理:'}</span>
            <div class="lab-target-recipe-chip" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" title="${escapeHtml(targetRecipeDisplayName)} (${isEN ? 'Click to change' : '點擊更換'})">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-target-recipe-chip-icon" alt="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <span class="lab-target-recipe-chip-badge">${escapeHtml(targetRecipeCategory)}</span>
              <span class="lab-target-recipe-chip-btn">${isEN ? 'Change' : '更換'}</span>
            </div>
          </div>
        ` : `
          <div class="lab-team-config-group">
            <span class="lab-team-config-label">${isEN ? 'Cooking Goal:' : '料理種類:'}</span>
            <div class="lab-team-pills">
              <button type="button" class="lab-team-pill ${labState.cookingType === 'curry' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('curry')">${isEN ? 'Curry/Stew' : '咖哩/濃湯'}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'salad' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('salad')">${isEN ? 'Salad' : '沙拉'}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'dessert' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('dessert')">${isEN ? 'Dessert/Drinks' : '點心/飲料'}</button>
            </div>
          </div>
        `}
      </div>
    `;

    // ─── 全隊生效光環彙總列 (Team Shared Bonuses Summary Bar - Zero Glyphs/Icons) ─────────────
    const activeAuraChips = [];
    if (simulation.helpingBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-helping" title="${isEN ? 'Team Helping Speed +' + (simulation.helpingBonusCount * 5) + '%' : '全體幫手速度 +' + (simulation.helpingBonusCount * 5) + '%'}">
          <strong>${isEN ? 'Helping Bonus' : '幫手獎勵'}</strong> x${simulation.helpingBonusCount} (+${simulation.helpingBonusCount * 5}%)
        </span>
      `);
    }
    if (simulation.energyRecoveryBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-energy" title="${isEN ? 'Team Energy Recovery +' + (simulation.energyRecoveryBonusCount * 14) + '%' : '全體睡眠活力回復 +' + (simulation.energyRecoveryBonusCount * 14) + '%'}">
          <strong>${isEN ? 'Energy Recovery' : '活力回復獎勵'}</strong> x${simulation.energyRecoveryBonusCount} (+${simulation.energyRecoveryBonusCount * 14}%)
        </span>
      `);
    }
    if (simulation.sleepExpBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-sleepexp" title="${isEN ? 'Team Sleep EXP +' + (simulation.sleepExpBonusCount * 14) + '%' : '全體睡眠EXP +' + (simulation.sleepExpBonusCount * 14) + '%'}">
          <strong>${isEN ? 'Sleep EXP' : '睡眠EXP獎勵'}</strong> x${simulation.sleepExpBonusCount} (+${simulation.sleepExpBonusCount * 14}%)
        </span>
      `);
    }
    if (simulation.researchExpBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-researchexp" title="${isEN ? 'Research EXP +' + (simulation.researchExpBonusCount * 6) + '%' : '研究EXP +' + (simulation.researchExpBonusCount * 6) + '%'}">
          <strong>${isEN ? 'Research EXP' : '研究EXP獎勵'}</strong> x${simulation.researchExpBonusCount} (+${simulation.researchExpBonusCount * 6}%)
        </span>
      `);
    }
    if (simulation.dreamShardBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-dreamshard" title="${isEN ? 'Dream Shards +' + (simulation.dreamShardBonusCount * 6) + '%' : '夢之碎片 +' + (simulation.dreamShardBonusCount * 6) + '%'}">
          <strong>${isEN ? 'Dream Shard' : '夢之碎片獎勵'}</strong> x${simulation.dreamShardBonusCount} (+${simulation.dreamShardBonusCount * 6}%)
        </span>
      `);
    }

    const teamAurasBarHtml = `
      <div class="lab-team-auras-col lab-team-auras-bar">
        <div class="lab-team-auras-label">
          <span>${isEN ? 'Team Shared Bonuses:' : '隊伍全體光環彙總:'}</span>
        </div>
        <div class="lab-team-auras-chips">
          ${activeAuraChips.length > 0 ? activeAuraChips.join('') : `<span class="lab-team-aura-chip empty">${isEN ? 'No team bonuses active (personal builds)' : '目前隊內無全體加成光環 (個人特化陣容)'}</span>`}
        </div>
      </div>
    `;

    // ─── 隊伍 5 個隊員卡片 (Pokémon Sleep App Style Compact 100% Width Rows) ─
    const slotsHtml = [0, 1, 2, 3, 4].map(idx => {
      const item = teamItems[idx];
      if (!item) {
        return `
          <div class="lab-team-slot-card lab-team-slot-empty" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })" title="${isEN ? 'Click to select team member' : '點擊挑選隊員'}">
            <div class="lab-slot-empty-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span class="lab-slot-empty-text">${isEN ? 'Select Team Member' : '點擊挑選隊員'}</span>
            </div>
          </div>
        `;
      }

      const base = findBasePkm(item.pokemonId || item.name);
      const displayName = isEN ? (base ? (base.name_en || base.name_cn) : item.name) : (item.name || (base ? base.name_cn : ''));
      const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
      const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
      const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
      const specialtyIconHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 15) : '';
      const rawSkill = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
      const skillName = rawSkill ? (window.I18N ? window.I18N.getMainSkillName(rawSkill) : rawSkill) : (isEN ? 'Skill' : '技能');
      const skillLv = item.skillLevel || item.mainSkillLevel || 1;
      const natureDisplayName = window.I18N ? window.I18N.getNatureName(item.nature) : item.nature;
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
            const iDisp = window.I18N ? window.I18N.getIngredientName(iName) : iName;
            const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
            return `
              <div class="lab-slot-ing-chip ${!s.unlocked ? 'is-locked' : ''}" title="Lv.${s.req}: ${escapeHtml(iDisp)}${!s.unlocked ? (isEN ? ' (Locked)' : ' (未解鎖)') : ''}">
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
          const sDisp = window.I18N ? window.I18N.getSubSkillName(a.name) : a.name;
          return `
            <div class="lab-slot-aura-badge aura-active" title="Lv.${a.req} ${escapeHtml(sDisp)} · ${isEN ? 'Team Shared Bonus' : '全體隊伍加成'}">
              <span class="aura-name">${escapeHtml(sDisp)}</span>
            </div>
          `;
        }).join('');
      } else if (lockedAuras.length > 0) {
        aurasHtml = lockedAuras.map(a => {
          const sDisp = window.I18N ? window.I18N.getSubSkillName(a.name) : a.name;
          return `
            <div class="lab-slot-aura-badge aura-locked" title="Lv.${a.req} ${escapeHtml(sDisp)} (${isEN ? 'Locked until Lv.' + a.req : '未解鎖 · Lv.' + a.req})">
              <span class="aura-name">${escapeHtml(sDisp)}</span>
              <span class="aura-tag">Lv.${a.req}</span>
            </div>
          `;
        }).join('');
      } else {
        aurasHtml = `
          <div class="lab-slot-aura-badge aura-none" title="${isEN ? 'Individual Specialist: Subskills focus on personal performance rather than whole team' : '個人特化專精：副技能均為個人加成，無全隊光環'}">
            <span class="aura-name">${isEN ? 'Solo Specialist' : '個人專精'}</span>
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
                <span class="lab-slot-name">${escapeHtml(displayName)}</span>
                ${item.nickname ? `<span class="lab-slot-nickname">(${escapeHtml(item.nickname)})</span>` : ''}
              </div>
            </div>
            <button type="button" class="box-btn box-btn-secondary lab-slot-replace-top-btn" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })">
              ${isEN ? 'Replace' : '更換'}
            </button>
          </div>

          <div class="lab-slot-spec-row">
            <div class="lab-slot-spec-left">
              ${specialtyIconHtml}
              <div class="lab-slot-berry-wrap ${isFav ? 'favored' : ''}" title="${escapeHtml(berry.name || '')}${isFav ? ' (2x)' : ''}">
                ${berry.icon ? `<img src="${berry.icon}" class="lab-slot-berry-icon" alt="Berry">` : ''}
                ${isFav ? `<span class="lab-slot-fav-badge">2x</span>` : ''}
              </div>
            </div>
            <div class="lab-slot-ings-right">
              ${ingStripHtml}
            </div>
          </div>

          <div class="lab-slot-bottom-row">
            <div class="lab-slot-bottom-left">
              <span class="lab-slot-skill-name">${escapeHtml(skillName)} <strong class="lab-slot-skill-lv">Lv.${skillLv}</strong></span>
              <span class="lab-slot-mid-sep">·</span>
              <span class="lab-slot-nature-name">${escapeHtml(natureDisplayName)}${(item.cleanseMint || item.mint) ? ' (' + (isEN ? 'Mint' : '薄荷') + ')' : ''}</span>
            </div>
            <div class="lab-slot-bottom-right">
              ${aurasHtml}
              ${simSlot ? `<span class="lab-slot-berry-pts" title="${isEN ? 'Daily berry energy' : '每日樹果能量'}">${simSlot.dailyBerryEnergy.toLocaleString()} <span style="font-size:9px;color:var(--text-muted);">${isEN ? 'pts' : '能量'}</span></span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const ingEntries = Object.entries(simulation.ingredientsMap);
    ingEntries.sort((a, b) => b[1] - a[1]);
    const keyIngs = COOKING_CATEGORY_KEY_INGREDIENTS[labState.cookingType] || [];
    const topIngsHtml = ingEntries.slice(0, 8).map(([iName, count]) => {
      const iDisplayName = window.I18N ? window.I18N.getIngredientName(iName) : iName;
      const iconUrl = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
      const isCookMatch = keyIngs.includes(iName);
      return `
        <div style="display:inline-flex;align-items:center;gap:3px;background:${isCookMatch ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)'};border:1px solid ${isCookMatch ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.08)'};border-radius:4px;padding:1px 5px;font-size:10.5px;" title="${escapeHtml(iDisplayName)}${isCookMatch ? (isEN ? ' (Cooking Matched)' : ' (料理契合)') : ''}">
          ${iconUrl ? `<img src="${iconUrl}" style="width:13px;height:13px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(iDisplayName)}">` : ''}
          <span style="color:${isCookMatch ? '#38bdf8' : '#e2e8f0'};font-weight:700;">x${count}</span>
          ${isCookMatch ? `<span style="font-size:8px;color:#38bdf8;font-weight:800;">${isEN ? 'FIT' : '契合'}</span>` : ''}
        </div>
      `;
    }).join('');

    // ─── 目標料理食材供需看板 (緊湊多欄 Grid 卡片矩陣) ────────────────────
    const targetAnalysis = simulation.targetRecipeAnalysis;
    let supplyDemandBoardHtml = '';
    if (targetAnalysis && Array.isArray(targetAnalysis.items)) {
      const itemsHtml = targetAnalysis.items.map(item => {
        const iDisplayName = window.I18N ? window.I18N.getIngredientName(item.name) : item.name;
        const iconUrl = item.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(item.name) : '');
        const isSurplus = item.diff >= 0;
        const diffText = isSurplus ? `+${item.diff} ${isEN ? 'Surplus' : '充裕'}` : `${item.diff} ${isEN ? 'Deficit' : '缺口'}`;
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
              <span title="${isEN ? 'Single meal requirement' : '單餐需求'}">${isEN ? 'Meal:' : '每餐:'} <strong>x${item.perMeal}</strong></span>
              <span class="lab-supply-mid-sep">·</span>
              <span title="${isEN ? 'Daily 3-meal total demand' : '每日 3 餐總需求'}">${isEN ? 'Daily:' : '日需:'} <strong>x${item.dailyDemand}</strong></span>
              <span class="lab-supply-mid-sep">·</span>
              <span title="${isEN ? 'Team estimated daily harvest' : '隊伍每日預估產出'}">${isEN ? 'Yield:' : '日產:'} <strong style="color:#22c55e;">x${item.teamYield}</strong></span>
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
        ? `<span class="lab-supply-overall-badge satisfied">[✓] ${isEN ? '100% Self-Sufficient' : '100% 達成 · 可完全自給自足'}</span>`
        : `<span class="lab-supply-overall-badge pending">${isEN ? `Overall: ${targetAnalysis.overallFulfillmentPct}%` : `全體達成率: ${targetAnalysis.overallFulfillmentPct}%`}</span>`;

      supplyDemandBoardHtml = `
        <div class="lab-recipe-supply-board" id="lab-team-recipe-supply-demand">
          <div class="lab-supply-board-header">
            <div class="lab-supply-board-title-group">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-supply-dish-icon" alt="${escapeHtml(targetRecipeDisplayName)}" title="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <div>
                <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                  <span class="sr-only">${escapeHtml(targetRecipeDisplayName)}</span>
                  <span class="lab-supply-dish-badge">${escapeHtml(targetRecipeCategory)}</span>
                  ${targetRecipe.pot_size ? `<span class="lab-supply-dish-meta">${targetRecipe.pot_size} ${isEN ? 'Pots' : '格鍋容量'}</span>` : ''}
                  ${targetRecipe.base_energy ? `<span class="lab-supply-dish-meta">${targetRecipe.base_energy.toLocaleString()} ${isEN ? 'Base Energy' : '基礎能量'}</span>` : ''}
                </div>
                <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">
                  ${isEN ? 'Target Recipe Ingredient Supply vs Daily Demand Dashboard (3 Meals/Day)' : '目標料理食材供需看板 · 精算每日 3 餐食材缺口與隊伍自給自足率'}
                </div>
              </div>
            </div>
            <div class="lab-supply-board-actions">
              ${overallStatusBadge}
              <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" style="font-size:10.5px;padding:3px 8px;display:inline-flex;align-items:center;gap:3px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>${isEN ? 'Change Recipe' : '更換目標料理'}</span>
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
            <span class="lab-favored-label">${isEN ? 'Favored Berries (2x Power):' : '喜愛樹果 (2x 能量):'}</span>
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
          <div class="lab-metric-card">
            <div style="font-size:11.5px;font-weight:700;color:var(--text-muted);">${isEN ? 'Estimated Daily Total Energy' : '預估每日能量總產出'}</div>
            <div class="lab-metric-value">${simulation.totalDailyBerryEnergy.toLocaleString()} <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${isEN ? 'pts/day' : '能量/日'}</span></div>
            <div class="lab-metric-sub">
              ${isEN ? `Calculated based on ${island.name_en || island.name} 2x berry energy bonus, helping speed, and subskill multipliers.` : `依據【${island.name}】喜愛樹果 2 倍能量加成、幫手速度與副技能協同倍率精確計算。`}
            </div>
          </div>

          <div class="lab-metric-card">
            <div style="font-size:11.5px;font-weight:700;color:var(--text-muted);">${isEN ? 'Daily Ingredients Harvest' : '預估每日食材總產量'}</div>
            <div class="lab-metric-value" style="color:#22c55e;">${simulation.totalDailyIngredientsCount} <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${isEN ? 'items/day' : '個/日'}</span></div>
            <div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:2px;">
              ${topIngsHtml || `<span style="font-size:10.5px;color:var(--text-muted);">${isEN ? 'No ingredients yet' : '尚無食材產出'}</span>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }
