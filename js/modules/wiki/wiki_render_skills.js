  const _WIKI_RENDER_FALLBACK_CAPS = /* @GAME_CONFIG_FALLBACK_START */ {"POKEMON_LEVEL_CAP":70,"RECIPE_LEVEL_CAP":70,"THEORETICAL_MAX_LEVEL":100,"ISLAND_BONUS_CAP":95,"ISLAND_BONUS_STEP":5,"RECIPE_MAX_BONUS_PCT":258,"SUBSKILL_UNLOCK_LEVELS":[10,25,50,70,80]} /* @GAME_CONFIG_FALLBACK_END */;

  // 渲染樹果與食材基礎能量看板 (極簡無名無滾輪 18 格全展開版 + 等級滑桿、島嶼加成與順果 2x 開關)
  function renderValuesBoard() {
    const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
               (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
    const caps = typeof _getWikiCaps === 'function' ? _getWikiCaps() : ((gc && gc.getCaps) ? gc.getCaps() : _WIKI_RENDER_FALLBACK_CAPS);
    const pokeCap = caps.POKEMON_LEVEL_CAP || _WIKI_RENDER_FALLBACK_CAPS.POKEMON_LEVEL_CAP;
    const islandCap = caps.ISLAND_BONUS_CAP !== undefined ? caps.ISLAND_BONUS_CAP : _WIKI_RENDER_FALLBACK_CAPS.ISLAND_BONUS_CAP;
    const islandStep = caps.ISLAND_BONUS_STEP || _WIKI_RENDER_FALLBACK_CAPS.ISLAND_BONUS_STEP;
    const sortedBerries = (gc && typeof gc.sortBerriesByEnergyAsc === 'function')
      ? gc.sortBerriesByEnergyAsc(BERRY_VALUES_DATA, b => b.id || b.name)
      : BERRY_VALUES_DATA;
    const sortedIngredients = (gc && typeof gc.sortIngredientsByEnergyAsc === 'function')
      ? gc.sortIngredientsByEnergyAsc(INGREDIENT_VALUES_DATA, ing => ing.name || ing.id)
      : INGREDIENT_VALUES_DATA;
    currentBerryLevel = Math.min(Math.max(currentBerryLevel || 1, 1), pokeCap);
    currentIslandBonus = Math.min(Math.max(currentIslandBonus || 0, 0), islandCap);
    return `
      <div class="values-horizontal-container">
        <!-- 區塊 1：樹果基礎能量庫 (Lv.1 ~ Lv.${pokeCap} + 島嶼加成 0~${islandCap}% 動態試算 + 雙行 1x/2x 展示) -->
        <div class="values-horizontal-section">
          <div class="values-section-header">
            <div class="values-section-title-group">
              <span class="values-section-badge berry-badge">${_tWiki('樹果能量庫', 'Berry Power')}</span>
            </div>

            <!-- 等級滑桿與島嶼加成控制器 -->
            <div class="berry-calc-controls">
              <!-- 寶可夢等級滑桿 (1 ~ ${pokeCap}) -->
              <div class="berry-control-group">
                <label for="berry-level-slider" class="berry-control-label">
                  ${_tWiki('等級：', 'Level:')}<span id="berry-level-display" class="berry-level-tag">Lv. ${currentBerryLevel}</span>
                </label>
                <input type="range" id="berry-level-slider" min="1" max="${pokeCap}" value="${currentBerryLevel}" step="1" class="berry-slider" oninput="window.WikiDB.updateBerryLevel(this.value)">
              </div>

              <!-- 島嶼加成滑桿 (0% ~ ${islandCap}%) -->
              <div class="berry-control-group">
                <label for="berry-island-slider" class="berry-control-label">
                  ${_tWiki('島嶼加成：', 'Island Bonus:')}<span id="berry-island-display" class="berry-island-tag">+${currentIslandBonus}%</span>
                </label>
                <input type="range" id="berry-island-slider" min="0" max="${islandCap}" value="${currentIslandBonus}" step="${islandStep}" class="berry-slider island-slider" oninput="window.WikiDB.updateBerryIsland(this.value)">
              </div>
            </div>
          </div>

          <div id="values-berry-grid" class="values-compact-grid values-berry-grid">
            ${sortedBerries.map(b => {
              const energy1x = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, false);
              const energy2x = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, true);
              const bName = (window.I18N && typeof window.I18N.getBerryName === 'function')
                ? (window.I18N.getBerryName(b.name) || _tWiki(b.name, b.name))
                : _tWiki(b.name, b.name);
              const bType = (window.I18N && typeof window.I18N.getTypeName === 'function')
                ? (window.I18N.getTypeName(b.type) || _tWiki(b.type, b.type))
                : _tWiki(b.type, b.type);
              const bonusStr = currentIslandBonus > 0 ? _tWiki(` +${currentIslandBonus}%島嶼`, ` +${currentIslandBonus}% Island`) : '';
              return `
                <div class="value-compact-node" title="${bName} (${bType}) - Lv.${currentBerryLevel}${bonusStr} | ${_tWiki('基礎', 'Base')}: ${energy1x} / ${_tWiki('順果 2x', 'Fav 2x')}: ${energy2x}">
                  <img src="${b.icon}" class="value-compact-icon" alt="${bName}">
                  <span class="value-compact-energy berry-val" title="${_tWiki('基礎能量 (1x)', 'Base Energy (1x)')}"><span class="energy-multiplier-prefix">1x</span> ${energy1x}</span>
                  <span class="value-compact-energy berry-val-fav" title="${_tWiki('順果 2x 能量', 'Favorite Berry (2x)')}"><span class="energy-multiplier-prefix">2x</span> ${energy2x}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 區塊 2：食材基礎庫 (90 ~ 342) -->
        <div class="values-horizontal-section" style="margin-top: 8px;">
          <div class="values-section-header">
            <div class="values-section-title-group">
              <span class="values-section-badge ing-badge">${_tWiki('食材基礎庫', 'Ingredient Base Values')}</span>
            </div>
          </div>

          <div class="values-compact-grid values-ing-grid">
            ${sortedIngredients.map(ing => {
              const ingName = (window.I18N && typeof window.I18N.getIngredientName === 'function')
                ? (window.I18N.getIngredientName(ing.name) || _tWiki(ing.name, ing.enName || ing.name))
                : _tWiki(ing.name, ing.enName || ing.name);
              const ingIcon = (typeof window !== 'undefined' && typeof window.mapExternalToLocalAsset === 'function' && ing.icon && ing.icon.startsWith('assets/'))
                ? (window.mapExternalToLocalAsset(ing.icon) || ing.icon)
                : ing.icon;
              return `
              <div class="value-compact-node ${ing.id === 'tail' ? 'value-tail-highlight' : ''}" title="${ingName} - ${_tWiki('基礎能量', 'Base Energy')} ${ing.energy}">
                <img src="${ingIcon}" class="value-compact-icon" alt="${ingName}">
                <span class="value-compact-energy ing-val">${ing.energy}</span>
              </div>
            `;}).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 渲染食材天梯榜卡片 (舊版清單檢視)
  // 渲染食材天梯榜卡片 (舊版清單檢視)
  function renderIngredientLadders(ladders) {
    const mult = getLadderMultiplier();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    return ladders.map(ing => {
      const ingName = (window.I18N && typeof window.I18N.getIngredientName === 'function')
        ? (window.I18N.getIngredientName(ing.name) || _tWiki(ing.name, ing.name))
        : _tWiki(ing.name, ing.name);
      const dishInfo = (typeof getDynamicTopRecipeForIngredient === 'function')
        ? getDynamicTopRecipeForIngredient(ing.id, ing.name)
        : (TOP_RECIPES_FOR_INGREDIENTS[ing.id] || { need: 20 });
      
      let filteredTiers = ing.tiers.filter((t, tIdx) => {
        const pkmSpec = getPokemonLadderSpecialty(t.name);
        if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return false;
        if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return false;
        if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return false;

        if (!matchesLadderRecipeFilter(t, ladderRecipeFilter)) return false;

        if (ladderSearchQuery) {
          if (!matchesLadderSearch(t.name, t.name_en, ladderSearchQuery)) return false;
        }

        const rawCountNum = parseFloat(t.rawCount !== undefined ? t.rawCount : (String(t.count).replace(/[^\d.]/g, '') || t.count)) || 0;
        const skillBonus = getPokemonSkillDrawBonus(t.name, ing.id, ing.name);
        const scaledCount = Math.round(rawCountNum * mult) + skillBonus;
        if (ladderSupplyFilter === 'TOP' && tIdx >= 5) return false;
        if (ladderSupplyFilter === 'MEALS_3' && scaledCount < dishInfo.need * 3) return false;
        if (ladderSupplyFilter === 'MEALS_2' && scaledCount < dishInfo.need * 2) return false;

        return true;
      });

      if (ladderTop15Only && filteredTiers.length > 15) {
        filteredTiers = filteredTiers.slice(0, 15);
      }

      const maxDailyBase = filteredTiers.length > 0 ? Math.max(...filteredTiers.map(t => {
        const rawCountNum = parseFloat(t.rawCount !== undefined ? t.rawCount : (String(t.count).replace(/[^\d.]/g, '') || t.count)) || 0;
        const skillBonus = getPokemonSkillDrawBonus(t.name, ing.id, ing.name);
        return rawCountNum * mult + skillBonus;
      })) : 0;
      const scaledMax = maxDailyBase.toFixed(1);

      return `
      <div class="ladder-card ${filteredTiers.length === 0 ? 'ladder-track-empty' : ''}" data-ladder-ing="${ing.id}">
        <div class="ladder-header">
          <div class="ladder-title-group">
            <img src="${(typeof window.mapExternalToLocalAsset === 'function' ? window.mapExternalToLocalAsset(ing.icon) : ing.icon) || ing.icon}" class="ladder-icon" alt="${ingName}">
            <h4 class="ladder-name">${ingName}</h4>
          </div>
          <span class="ladder-max-badge">${filteredTiers.length > 0 ? _tWiki('最高日產 ~ ', 'Max Daily ~ ') + scaledMax + _tWiki('顆/天', '/day') : _tWiki('無符合', 'No Match')}</span>
        </div>

        <div class="ladder-tiers-list">
          ${filteredTiers.length === 0 ? `<div class="text-muted" style="padding: 12px; text-align: center; font-size: 12px;">${_tWiki('無符合篩選條件之寶可夢', 'No matching Pokémon')}</div>` : filteredTiers.map(t => {
            const rawName = t.name || '';
            const translatedPkm = (window.I18N && typeof window.I18N.getPokemonName === 'function')
              ? (window.I18N.getPokemonName(rawName) || _tWiki(rawName, t.name_en || rawName))
              : _tWiki(rawName, t.name_en || rawName);
            const pkmDisplayName = `${translatedPkm} (${t.recipe || 'AAA'})`;
            const noteText = formatLadderNote(t.note || '', isEN);
            const rawCountNum = parseFloat(t.rawCount !== undefined ? t.rawCount : (String(t.count).replace(/[^\d.]/g, '') || t.count)) || 0;
            const skillBonus = getPokemonSkillDrawBonus(t.name, ing.id, ing.name);
            const dropCount = (rawCountNum * mult).toFixed(1);
            const totalCount = (parseFloat(dropCount) + skillBonus).toFixed(1);
            const displayCount = skillBonus > 0
              ? `${totalCount} ${_tWiki('顆/天', '/day')} <span class="ladder-split-text" style="font-size: 11px; color: #f59e0b; font-weight: normal; margin-left: 4px;">(${dropCount} + ${skillBonus})</span>`
              : `${dropCount} ${_tWiki('顆/天', '/day')}`;

            return `
            <div class="ladder-tier-row">
              <div class="ladder-tier-info">
                <span class="ladder-pkm-name font-bold">${pkmDisplayName}</span>
                <span class="ladder-count text-accent font-bold">${displayCount}</span>
              </div>
              <div class="ladder-progress-bar">
                <div class="ladder-progress-fill" style="width: ${t.rate}%"></div>
              </div>
              <div class="ladder-note text-muted">${noteText}</div>
            </div>
          `;}).join('')}
        </div>
      </div>
    `;}).join('');
  }

  // 方案 C: 渲染技能「精華單行速查 (Lv.1 -> Lv.Max)」與「縱向階梯清單（隨卡片點擊展開/收合）」
  function renderSkillHeroAndStepper(skillId, levelsData, unitLabel, maxLv = 7) {
    if (!levelsData || levelsData.length === 0) return '';

    const actualMaxLv = levelsData.length;
    const baseVal = levelsData[0];
    const maxVal = levelsData[actualMaxLv - 1];

    return `
      <!-- 精華單行速查 (無外框、無emoji、單行極簡展示) -->
      <div class="skill-hero-summary single-line">
        <span class="hero-stat-item">
          <span class="hero-lv-label">Lv.1</span>
          <span class="hero-val-text" id="hero-base-${skillId}">${baseVal}</span>
        </span>
        <span class="hero-arrow-icon">&rarr;</span>
        <span class="hero-stat-item item-max">
          <span class="hero-lv-label tag-max">Lv.${actualMaxLv}</span>
          <span class="hero-val-text val-max" id="hero-max-${skillId}">${maxVal}</span>
        </span>
      </div>

      <!-- 展開後的縱向階梯列表 (隨卡片 .is-expanded 狀態展開/收合) -->
      <div id="skill-stepper-${skillId}" class="skill-stepper-list">
        ${levelsData.map((val, idx) => {
          const lv = idx + 1;
          const isMax = lv === actualMaxLv;
          return `
            <div class="skill-step-item ${isMax ? 'item-max' : ''}">
              <span class="step-tag-badge">Lv.${lv}</span>
              <span class="step-val-text">${val}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // 渲染技能卡片 (方案 C: 精華看板 + 點擊卡片展開/收合階梯)
  function renderSkillsCards(skills) {
    const catNameMap = {
      energy: _tWiki('能量系', 'Strength'),
      energy_heal: _tWiki('活力系', 'Energy Heal'),
      ingredient: _tWiki('食材與料理', 'Ingredients'),
      special: _tWiki('神獸與特殊專屬', 'Special/Legend'),
      shards: _tWiki('夢之碎片', 'Dream Shards')
    };

    return skills.map(skill => {
      let valuesHtml = '';
      const rawSkillName = skill.name || skill.id;
      let skillName = (window.I18N && typeof window.I18N.getMainSkillName === 'function')
        ? (window.I18N.getMainSkillName(rawSkillName) || _tWiki(rawSkillName, skill.name_en || rawSkillName))
        : _tWiki(rawSkillName, skill.name_en || rawSkillName);
      if (window.I18N && typeof window.I18N.getLanguage === 'function' && window.I18N.getLanguage() === 'en-US') {
        skillName = skillName.replace(/[（\(]\s*屬性\s*[）\)]/g, '(Type)');
      }
      const catLabel = catNameMap[skill.category] || _tWiki(skill.catName, skill.catName_en || skill.catName);
      const unitLabel = _tWiki(
        skill.unit,
        skill.unit_en || (skill.unit.includes('能量') ? ' Strength' : (skill.unit.includes('食材') ? ' Ingredients' : (skill.unit.includes('次') ? ' Helps' : (skill.unit.includes('點') ? ' Energy' : skill.unit))))
      );

      if (skill.hasStackMatrix) {
        const sampleStrings = skill.matrix[10].vals.map(v => `${v.toLocaleString()} ${unitLabel}`);
        valuesHtml = `
          <div class="skill-interactive-section">
            <div class="stack-selector-row">
              <span class="stack-selector-label">${_tWiki('蓄力次數切換：', 'Stack Count:')}</span>
              <div class="stack-chips-group" id="charge-stack-chips">
                ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => `
                  <button type="button" class="stack-chip-btn ${s === 10 ? 'active' : ''}" data-stack-target="${s}" onclick="window.WikiDB.switchStack(${s})">${s}${_tWiki('次', 'x')}</button>
                `).join('')}
              </div>
            </div>

            ${renderSkillHeroAndStepper(skill.id, sampleStrings, unitLabel, 7)}

            <!-- 展開完整對照表按鈕 -->
            <div style="margin-top: 8px;">
              <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="charge-matrix-table" onclick="window.WikiDB.toggleDetail('charge-matrix-table')">
                ${_tWiki('展開 / 收合完整 0~10 次蓄力數值表', 'Toggle 0~10 Stack Value Matrix')}
              </button>
            </div>

            <div id="charge-matrix-table" class="wiki-table-wrapper" style="display: none; margin-top: 6px;">
              <table class="wiki-mini-table">
                <thead>
                  <tr>
                    <th>${_tWiki('蓄力', 'Stacks')}</th>
                    ${[1, 2, 3, 4, 5, 6, 7].map(lv => `<th>Lv.${lv}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${skill.matrix.map(m => `
                    <tr class="${m.stacks === 10 ? 'row-highlight' : ''}">
                      <td class="font-bold text-accent">${m.stacks}${_tWiki('次', 'x')}</td>
                      ${m.vals.map(v => `<td>${v.toLocaleString()}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (skill.hasTypeKindsMatrix) {
        const sampleStrings = skill.matrix[5].vals.map(v => `${v} ${_tWiki('次幫忙', 'Helps')}`);
        valuesHtml = `
          <div class="skill-interactive-section">
            <div class="stack-selector-row">
              <span class="stack-selector-label">${_tWiki('同屬性種類數：', 'Same-type Species:')}</span>
              <div class="stack-chips-group" id="helper-boost-chips">
                ${[0, 1, 2, 3, 4, 5].map(k => `
                  <button type="button" class="stack-chip-btn ${k === 5 ? 'active' : ''}" data-boost-kind="${k}" onclick="window.WikiDB.switchBoost(${k})">${k} ${_tWiki('種類', 'Types')}</button>
                `).join('')}
              </div>
            </div>

            ${renderSkillHeroAndStepper(skill.id, sampleStrings, unitLabel, 6)}

            <!-- 展開完整對照表按鈕 -->
            <div style="margin-top: 8px;">
              <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="helper-boost-table" onclick="window.WikiDB.toggleDetail('helper-boost-table')">
                ${_tWiki('展開 / 收合完整 0~5 種類對照表', 'Toggle 0~5 Types Comparison Table')}
              </button>
            </div>

            <div id="helper-boost-table" class="wiki-table-wrapper" style="display: none; margin-top: 8px;">
              <table class="wiki-mini-table">
                <thead>
                  <tr>
                    <th>${_tWiki('同屬種類', 'Same-Type')}</th>
                    ${[1, 2, 3, 4, 5, 6].map(lv => `<th>Lv.${lv}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${skill.matrix.map(m => `
                    <tr class="${(m.kinds === '5 種類' || m.kinds_en === '5 Species') ? 'row-highlight' : ''}">
                      <td class="font-bold text-accent">${_tWiki(m.kinds, m.kinds_en || m.kinds)}</td>
                      ${m.vals.map(v => `<td>${v} ${_tWiki('次', 'Helps')}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (skill.hasMoonlightChips) {
        const mlStrings = skill.selfValues.map((v, i) => _tWiki(`自${v}+他${skill.teamValues[i]}${unitLabel.trim()}`, `Self ${v}+Ally ${skill.teamValues[i]}${unitLabel.trim()}`));
        valuesHtml = renderSkillHeroAndStepper(skill.id, mlStrings, unitLabel, 6);
      } else if (skill.hasLunarPrayerMatrix) {
        const lpStrings = skill.healValues.map((v, i) => {
          const formula = skill.berryFormulas ? skill.berryFormulas[i] : ["14+2n", "19+3n", "24+4n", "29+5n", "30+7n", "32+9n"][i];
          return _tWiki(`全隊${v}點+${formula}`, `All ${v}+${formula}`);
        });
        valuesHtml = `
          ${renderSkillHeroAndStepper(skill.id, lpStrings, unitLabel, 6)}

          <!-- 展開完整 1~5 種類隊友樹果對照表按鈕 -->
          <div style="margin-top: 6px;">
            <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="lunar-prayer-table" onclick="window.WikiDB.toggleDetail('lunar-prayer-table')">
              ${_tWiki('展開 / 收合 1~5 種類隊友樹果表', 'Toggle 1~5 Species Berry Table')}
            </button>
          </div>

          <div id="lunar-prayer-table" class="wiki-table-wrapper" style="display: none; margin-top: 6px;">
            <table class="wiki-mini-table">
              <thead>
                <tr>
                  <th style="white-space: nowrap;">${_tWiki('種類', 'Species')}</th>
                  ${[1, 2, 3, 4, 5, 6].map(lv => `<th>Lv.${lv}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${skill.berryMatrix.map((m, idx) => `
                  <tr class="${idx === 4 ? 'row-highlight' : ''}">
                    <td class="font-bold text-accent" style="white-space: nowrap;">${_tWiki(m.kinds, m.kinds_en || m.kinds)}</td>
                    ${m.vals.map(v => `<td style="font-size: 10.5px; white-space: nowrap;">${v}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (skill.hasIngredientDrawMatrix) {
        const ingStrings = skill.values.map(v => `${v}${unitLabel.trim()}`);
        valuesHtml = `
          ${renderSkillHeroAndStepper(skill.id, ingStrings, unitLabel, skill.maxLevel || 7)}

          <!-- 展開各寶可夢專屬食材池對照表按鈕 -->
          <div style="margin-top: 6px;">
            <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="ing-draw-matrix-table" onclick="window.WikiDB.toggleDetail('ing-draw-matrix-table')">
              ${_tWiki('展開 / 收合 各寶可夢「專屬食材池」對照表', 'Toggle Candidate Ingredient Pools per Pokémon')}
            </button>
          </div>

          <div id="ing-draw-matrix-table" class="wiki-table-wrapper" style="display: none; margin-top: 6px;">
            <table class="wiki-mini-table">
              <thead>
                <tr>
                  <th style="width: 44px; text-align: center;">${_tWiki('寶可夢', 'Pokémon')}</th>
                  <th>${_tWiki('主技能型態', 'Skill Variant')}</th>
                  <th style="text-align: center;">${_tWiki('專屬食材候選池 (3~4種)', 'Candidate Ingredients (3~4)')}</th>
                </tr>
              </thead>
              <tbody>
                ${INGREDIENT_DRAW_POKEMONS.map(p => `
                  <tr>
                    <td style="text-align: center; padding: 5px 4px;">
                      <img src="${p.icon}" width="34" height="34" style="object-fit: contain; vertical-align: middle;" alt="${_tWiki(p.name, p.name_en || p.name)}" title="${_tWiki(p.family || p.name, p.family_en || p.name_en || p.name)}">
                    </td>
                    <td style="text-align: center; padding: 5px 6px;">
                      <span class="wiki-skill-badge skill-badge-blue">${_tWiki(p.skill, p.skill_en || p.skill)}</span>
                      ${(p.id === 430 || p.id === 303) ? `<div style="font-size: 9.5px; color: var(--color-note-highlight, #d97706); margin-top: 3px; line-height: 1.2;">${_tWiki(p.extraEffect, p.extraEffect_en || p.extraEffect)}</div>` : ''}
                    </td>
                    <td style="text-align: center; padding: 5px 4px;">
                      <div style="display: inline-flex; align-items: center; gap: 4px; justify-content: center; flex-direction: row; flex-wrap: nowrap;">
                        ${p.ingredients.map(ig => `
                          <div class="wiki-ing-badge" title="${_tWiki(ig.name, ig.name_en || ig.name)}" style="display: inline-flex; align-items: center; justify-content: center; background: transparent; border: none; padding: 0; cursor: help;">
                            <img src="${ig.icon}" width="24" height="24" alt="${_tWiki(ig.name, ig.name_en || ig.name)}" style="object-fit: contain; vertical-align: middle;">
                          </div>
                        `).join('')}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (skill.hasDualValues) {
        const dualStrings = skill.selfValues.map((v, i) => `${v}+${skill.teamValues[i]}*4`);
        valuesHtml = renderSkillHeroAndStepper(skill.id, dualStrings, unitLabel, skill.selfValues.length);
      } else if (skill.ranges) {
        const rangeStrings = skill.ranges.map(r => `${r.min.toLocaleString()}~${r.max.toLocaleString()}${unitLabel.trim()}`);
        valuesHtml = renderSkillHeroAndStepper(skill.id, rangeStrings, unitLabel, skill.ranges.length);
      } else if (skill.values) {
        const valStrings = skill.values.map(v => `${typeof v === 'number' ? v.toLocaleString() : v}${unitLabel.trim()}`);
        valuesHtml = renderSkillHeroAndStepper(skill.id, valStrings, unitLabel, skill.values.length);
      } else {
        valuesHtml = `<div class="skill-level-chip"><span class="level-val">${unitLabel}</span></div>`;
      }

      const skillDesc = _tWiki(skill.desc, skill.desc_en || skill.desc);
      const specialNote = skill.specialNote ? _tWiki(skill.specialNote, skill.specialNote_en || skill.specialNote) : null;
      const penaltyNote = skill.penaltyNote ? _tWiki(skill.penaltyNote, skill.penaltyNote_en || skill.penaltyNote) : null;

      const isVisible = currentSkillsCategory === 'all' || skill.category === currentSkillsCategory;
      return `
        <div class="wiki-skill-card clickable-card" id="skill-card-${skill.id}" data-category="${skill.category}" style="display: ${isVisible ? 'flex' : 'none'} !important;" onclick="window.WikiDB.toggleSkillCard(this, '${skill.id}', event)">
          <div class="skill-card-top">
            <div class="skill-title-badges">
              <h4 class="skill-name-text">${skillName}</h4>
              <span class="skill-cat-tag cat-${skill.category}">${catLabel}</span>
            </div>
            <div class="skill-top-right">
              <span class="skill-max-lv-badge">${_tWiki('上限 Lv.', 'Max Lv.')}${skill.maxLevel}</span>
              <span class="skill-card-chevron">▾</span>
            </div>
          </div>

          <p class="skill-desc-text">
            ${skillDesc}
            ${specialNote ? `<span class="skill-note-inline">${specialNote}</span>` : ''}
            ${penaltyNote ? `<span class="skill-penalty-inline">${penaltyNote}</span>` : ''}
          </p>

          <div class="skill-values-container">
            ${valuesHtml}
          </div>
        </div>
      `;
    }).join('');
  }
