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

    const islandPillsHtml = LAB_ISLANDS.map(isl => {
      const isActive = labState.teamIslandId === isl.id;
      return `
        <button type="button" class="lab-island-pill ${isActive ? 'active' : ''}" style="${isActive ? `border-color:${isl.color};color:${isl.color};` : ''}" onclick="window.AppraisalLab.setTeamIsland('${isl.id}')">
          <span class="lab-island-dot" style="width:8px;height:8px;border-radius:50%;background:${isl.color};display:inline-block;"></span>
          <span>${isEN ? (isl.name_en || isl.name) : isl.name}</span>
        </button>
      `;
    }).join('');

    const favoredBerriesHtml = favBerries.map(bName => {
      const bObj = BERRY_VALUES_DATA.find(b => b.name === bName) || {};
      const bDisplayName = isEN ? (window.I18N && window.I18N.getBerryName ? window.I18N.getBerryName(bName) : bName) : bName;
      return `
        <span class="lab-island-berry-tag" title="${escapeHtml(bDisplayName)}">
          ${bObj.icon ? `<img src="${bObj.icon}" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(bDisplayName)}">` : ''}
          <span>${escapeHtml(bDisplayName)}</span>
        </span>
      `;
    }).join('');

    const greengrassConfigHtml = isGreengrass ? `
      <div class="lab-greengrass-berries-config">
        <div class="lab-greengrass-berries-head">
          <div style="display:flex;flex-direction:column;gap:2px;">
            <span style="font-size:12px;font-weight:700;color:#22c55e;">[#] ${isEN ? 'Greengrass Favored Berries (Customizable):' : '萌綠之島本週喜愛樹果 (可自由自選):'}</span>
            <span style="font-size:11px;color:var(--text-muted);">${isEN ? 'Select 3 favored berries for this week (2x energy boost)' : '自選本週 3 種喜愛樹果，產能與推薦即時享有 2x 能量加成'}</span>
          </div>
          <div class="lab-greengrass-actions" style="display:flex;gap:6px;align-items:center;">
            <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.rerollGreengrassBerries(false)" style="font-size:11px;padding:3px 8px;display:inline-flex;align-items:center;gap:3px;" title="${isEN ? 'Reroll 3 random berries from 18' : '從 18 種樹果隨機刷新 3 種'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>${isEN ? 'Random Reroll' : '隨機擲骰'}</span>
            </button>
            <button type="button" class="box-btn box-btn-primary" onclick="window.AppraisalLab.rerollGreengrassBerries(true)" style="font-size:11px;padding:3px 8px;display:inline-flex;align-items:center;gap:3px;" title="${isEN ? 'Reroll 3 random berries and immediately auto-optimize team' : '隨機抽出 3 種樹果並立即自動推薦最佳陣容'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
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
      <div class="lab-team-config-panel">
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
            <div class="lab-target-recipe-chip" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" title="${isEN ? 'Click to change target recipe' : '點擊切換目標料理'}">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-target-recipe-chip-icon" alt="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <span class="lab-target-recipe-chip-name">${escapeHtml(targetRecipeDisplayName)}</span>
              <span class="lab-target-recipe-chip-badge">${escapeHtml(targetRecipeCategory)}</span>
              <span class="lab-target-recipe-chip-btn">${isEN ? 'Change' : '切換'}</span>
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

    const slotsHtml = [0, 1, 2, 3, 4].map(idx => {
      const item = teamItems[idx];
      if (!item) {
        return `
          <div class="lab-team-slot-card lab-team-slot-empty" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })" title="${isEN ? 'Click to select team member' : '點擊挑選隊員'}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);margin-bottom:4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);">${isEN ? `Slot ${idx + 1}` : `隊員 ${idx + 1}`}</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">${isEN ? 'Empty Slot' : '空缺位 · 點擊挑選'}</div>
          </div>
        `;
      }

      const base = findBasePkm(item.pokemonId || item.name);
      const displayName = isEN ? (base ? (base.name_en || base.name_cn) : item.name) : (item.name || (base ? base.name_cn : ''));
      const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
      const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
      const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
      const specialtyIconHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 16) : '';
      const rawSkill = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
      const skillName = rawSkill ? (window.I18N ? window.I18N.getMainSkillName(rawSkill) : rawSkill) : (isEN ? 'Skill' : '技能');
      const skillLv = item.skillLevel || item.mainSkillLevel || 1;
      const natureDisplayName = window.I18N ? window.I18N.getNatureName(item.nature) : item.nature;
      const subs = Array.isArray(item.subskills) ? item.subskills : [];
      const simSlot = simulation.slotResults[idx];

      return `
        <div class="lab-team-slot-card">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:10.5px;font-weight:800;color:var(--text-muted);">${isEN ? `SLOT ${idx + 1}` : `隊員 ${idx + 1}`}</span>
            <button type="button" class="lab-slot-remove-btn" onclick="window.AppraisalLab.clearTeamSlot(${idx})" title="${isEN ? 'Remove from team' : '從隊伍移除'}" style="background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:12px;padding:0 2px;">
              [X]
            </button>
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            <div style="position:relative;flex-shrink:0;">
              <img src="${avatarUrl}" style="width:42px;height:42px;object-fit:contain;" alt="${escapeHtml(displayName)}" loading="lazy">
              <span style="position:absolute;bottom:-3px;right:-3px;background:#0f172a;border:1px solid #334155;border-radius:4px;padding:0 3px;font-size:9.5px;font-weight:800;color:#94a3b8;">Lv.${item.level || 1}</span>
            </div>
            <div style="min-width:0;flex:1;">
              <div style="font-size:12.5px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${escapeHtml(displayName)}
              </div>
              ${item.nickname ? `<div style="font-size:10.5px;color:var(--accent-color,#38bdf8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">(${escapeHtml(item.nickname)})</div>` : ''}
              <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
                ${specialtyIconHtml}
                ${berry.icon ? `<img src="${berry.icon}" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;" alt="Berry">` : ''}
                ${isFav ? `<span style="background:rgba(234,179,8,0.2);color:#facc15;padding:0 3px;border-radius:3px;font-weight:800;font-size:9.5px;">2x 喜愛</span>` : ''}
              </div>
            </div>
          </div>

          <div style="font-size:11px;color:var(--text-secondary);display:flex;flex-direction:column;gap:2px;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-weight:700;">${isEN ? 'Skill:' : '技能:'}</span>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;">${escapeHtml(skillName)}</span>
              <span style="background:rgba(56,189,248,0.15);color:var(--accent-color,#38bdf8);padding:0 3px;border-radius:3px;font-size:9.5px;font-weight:700;">Lv.${skillLv}</span>
            </div>
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-weight:700;">${isEN ? 'Nat:' : '性格:'}</span>
              <span>${escapeHtml(natureDisplayName)}${(item.cleanseMint || item.mint) ? ' <span class="nature-mint-tag">' + (isEN ? 'Mint' : '使用淨白薄荷消除個性效果') + '</span>' : ''}</span>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:3px;">
            ${[0, 1, 2, 3, 4].map(sIdx => {
              const lvReq = [10, 25, 50, 70, 80][sIdx];
              const isUnlocked = (item.level || 1) >= lvReq;
              const sName = subs[sIdx] || '';
              if (!sName) return '';
              const tier = getSkillTier(sName);
              const sDisplayName = window.I18N ? window.I18N.getSubSkillName(sName) : sName;
              return `
                <div class="box-subskill-pill subskill-${tier} ${!isUnlocked ? 'subskill-locked' : ''}" style="font-size:10px;padding:1px 4px;margin:0;line-height:1.2;" title="Lv.${lvReq} ${escapeHtml(sDisplayName)}${!isUnlocked ? (isEN ? ' (Locked)' : ' (未解鎖)') : ''}">
                  <span style="font-size:8.5px;color:var(--text-muted);margin-right:2px;">${lvReq}</span>
                  <span class="subskill-name">${escapeHtml(sDisplayName)}</span>
                </div>
              `;
            }).join('')}
          </div>

          ${simSlot ? `
            <div style="margin-top:auto;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);font-size:10.5px;color:var(--text-muted);display:flex;justify-content:space-between;">
              <span>${isEN ? 'Daily Berry:' : '每日樹果:'}</span>
              <strong style="color:#facc15;">${simSlot.dailyBerryEnergy.toLocaleString()}</strong>
            </div>
          ` : ''}

          <button type="button" class="box-btn box-btn-secondary" style="font-size:11px;padding:3px 6px;margin-top:2px;" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })">
            ${isEN ? 'Replace' : '更換'}
          </button>
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
        <div style="display:inline-flex;align-items:center;gap:3px;background:${isCookMatch ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)'};border:1px solid ${isCookMatch ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.08)'};border-radius:5px;padding:2px 5px;font-size:11px;" title="${escapeHtml(iDisplayName)}${isCookMatch ? (isEN ? ' (Cooking Matched)' : ' (料理契合)') : ''}">
          ${iconUrl ? `<img src="${iconUrl}" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(iDisplayName)}">` : ''}
          <span style="color:${isCookMatch ? '#38bdf8' : '#e2e8f0'};font-weight:700;">x${count}</span>
          ${isCookMatch ? `<span style="font-size:8.5px;color:#38bdf8;font-weight:800;">${isEN ? 'FIT' : '契合'}</span>` : ''}
        </div>
      `;
    }).join('');

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
            <div class="lab-supply-col-ing">
              ${iconUrl ? `<img src="${iconUrl}" class="lab-supply-ing-icon" alt="${escapeHtml(iDisplayName)}">` : ''}
              <span class="lab-supply-ing-name">${escapeHtml(iDisplayName)}</span>
            </div>
            <div class="lab-supply-col-demand" title="${isEN ? 'Single meal requirement' : '單餐需求'}">
              <span class="lab-supply-label">${isEN ? 'Per Meal:' : '每餐:'}</span>
              <strong style="color:var(--text-primary);">x${item.perMeal}</strong>
            </div>
            <div class="lab-supply-col-daily" title="${isEN ? 'Daily 3-meal total demand' : '每日 3 餐總需求'}">
              <span class="lab-supply-label">${isEN ? 'Daily Demand:' : '日需(3餐):'}</span>
              <strong style="color:var(--text-secondary);">x${item.dailyDemand}</strong>
            </div>
            <div class="lab-supply-col-yield" title="${isEN ? 'Team estimated daily harvest' : '隊伍每日預估產出'}">
              <span class="lab-supply-label">${isEN ? 'Team Yield:' : '隊伍日產:'}</span>
              <strong style="color:#22c55e;">x${item.teamYield}</strong>
            </div>
            <div class="lab-supply-col-diff">
              <span class="lab-supply-diff-badge ${diffClass}">${diffText}</span>
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
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-supply-dish-icon" alt="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <span class="lab-supply-dish-name">${escapeHtml(targetRecipeDisplayName)}</span>
                  <span class="lab-supply-dish-badge">${escapeHtml(targetRecipeCategory)}</span>
                  ${targetRecipe.pot_size ? `<span class="lab-supply-dish-meta">${targetRecipe.pot_size} ${isEN ? 'Pots' : '格鍋容量'}</span>` : ''}
                  ${targetRecipe.base_energy ? `<span class="lab-supply-dish-meta">${targetRecipe.base_energy.toLocaleString()} ${isEN ? 'Base Energy' : '基礎能量'}</span>` : ''}
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                  ${isEN ? 'Target Recipe Ingredient Supply vs Daily Demand Dashboard (3 Meals/Day)' : '目標料理食材供需看板 · 精算每日 3 餐食材缺口與隊伍自給自足率'}
                </div>
              </div>
            </div>
            <div class="lab-supply-board-actions">
              ${overallStatusBadge}
              <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" style="font-size:11px;padding:4px 10px;display:inline-flex;align-items:center;gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
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
        <div class="lab-island-selector">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-right:4px;">${isEN ? 'Camp:' : '研究營地:'}</div>
          ${islandPillsHtml}
        </div>

        ${teamVariablesBarHtml}

        ${greengrassConfigHtml}

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">${isEN ? 'Favored Berries (2x Power):' : '喜愛樹果 (2x 能量):'}</span>
            ${favoredBerriesHtml}
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button type="button" class="box-btn box-btn-primary" onclick="window.AppraisalLab.autoOptimizeTeam(true)" style="font-size:12px;padding:5px 12px;display:inline-flex;align-items:center;gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>${isEN ? 'Auto-Optimize Team' : '一鍵推薦最佳陣容'}</span>
            </button>
            <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.clearAllTeamSlots()" style="font-size:12px;padding:5px 12px;display:inline-flex;align-items:center;gap:4px;">
              <span>[X]</span>
              <span>${isEN ? 'Clear Team' : '清空隊伍'}</span>
            </button>
          </div>
        </div>

        <div class="lab-team-grid">
          ${slotsHtml}
        </div>

        ${supplyDemandBoardHtml}

        <div class="lab-team-metrics-grid">
          <div class="lab-metric-card">
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);">${isEN ? 'Estimated Daily Total Energy' : '預估每日能量總產出'}</div>
            <div class="lab-metric-value">${simulation.totalDailyBerryEnergy.toLocaleString()} <span style="font-size:13px;font-weight:600;color:var(--text-muted);">${isEN ? 'pts/day' : '能量/日'}</span></div>
            <div class="lab-metric-sub">
              ${isEN ? `Calculated based on ${island.name_en || island.name} 2x berry energy bonus, helping speed, and subskill multipliers.` : `依據【${island.name}】喜愛樹果 2 倍能量加成、幫手速度與副技能協同倍率精確計算。`}
            </div>
          </div>

          <div class="lab-metric-card">
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);">${isEN ? 'Daily Ingredients Harvest' : '預估每日食材總產量'}</div>
            <div class="lab-metric-value" style="color:#22c55e;">${simulation.totalDailyIngredientsCount} <span style="font-size:13px;font-weight:600;color:var(--text-muted);">${isEN ? 'items/day' : '個/日'}</span></div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:2px;">
              ${topIngsHtml || `<span style="font-size:11px;color:var(--text-muted);">${isEN ? 'No ingredients yet' : '尚無食材產出'}</span>`}
            </div>
          </div>

          <div class="lab-metric-card">
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);">${isEN ? 'Skills & Team Auras' : '主技能與隊伍光環協同'}</div>
            <div style="font-size:13px;color:var(--text-primary);display:flex;flex-direction:column;gap:4px;margin-top:2px;">
              <div>${isEN ? 'Main Skill Procs:' : '主技能總發動預估:'} <strong style="color:var(--accent-color,#38bdf8);">${simulation.totalDailySkillProcs} ${isEN ? 'times/day' : '次/日'}</strong></div>
              <div>${isEN ? 'Helping Bonus:' : '幫手獎勵光環:'} <strong style="color:#facc15;">${simulation.helpingBonusCount} ${isEN ? 'layers' : '層'} (+${simulation.helpingBonusCount * 5}% ${isEN ? 'Speed' : '全隊幫速'})</strong></div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.3;">
                ${simulation.hasHealer ? `<span style="color:#22c55e;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>${isEN ? 'Team has dedicated healer: High energy (>80%) grants 2.2x speed boost!' : '隊內具備常駐補師：預估常駐高活力 (>80%)，享有 2.2x 最大幫速加速！'}</span>` : `<span style="color:#94a3b8;">[!] ${isEN ? 'No healer in team: Daytime energy decay applies (~1.6x speed baseline).' : '隊內無常駐補師：預估日間活力衰減 (約 1.6x 基準幫速)。'}</span>`}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
