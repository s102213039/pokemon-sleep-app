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
              <span class="values-section-badge berry-badge">${window.I18N?.t?.('wiki.ui_berry_power') ?? '樹果能量庫'}</span>
            </div>

            <!-- 等級滑桿與島嶼加成控制器 -->
            <div class="berry-calc-controls">
              <!-- 寶可夢等級滑桿 (1 ~ ${pokeCap}) -->
              <div class="berry-control-group">
                <label for="berry-level-slider" class="berry-control-label">
                  ${window.I18N?.t?.('wiki.ui_level_colon') ?? '等級：'}<span id="berry-level-display" class="berry-level-tag">Lv. ${currentBerryLevel}</span>
                </label>
                <input type="range" id="berry-level-slider" min="1" max="${pokeCap}" value="${currentBerryLevel}" step="1" class="berry-slider" oninput="window.WikiDB.updateBerryLevel(this.value)">
              </div>

              <!-- 島嶼加成滑桿 (0% ~ ${islandCap}%) -->
              <div class="berry-control-group">
                <label for="berry-island-slider" class="berry-control-label">
                  ${window.I18N?.t?.('wiki.ui_island_bonus_colon') ?? '島嶼加成：'}<span id="berry-island-display" class="berry-island-tag">+${currentIslandBonus}%</span>
                </label>
                <input type="range" id="berry-island-slider" min="0" max="${islandCap}" value="${currentIslandBonus}" step="${islandStep}" class="berry-slider island-slider" oninput="window.WikiDB.updateBerryIsland(this.value)">
              </div>
            </div>
          </div>

          <div id="values-berry-grid" class="values-compact-grid values-berry-grid">
            ${sortedBerries.map(b => {
              const energy1x = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, false);
              const energy2x = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, true);
              const bName = window.I18N?.getBerryName?.(b.name) || (window.I18N?.text?.(b.name) ?? b.name);
              const bType = window.I18N?.getTypeName?.(b.type) || (window.I18N?.text?.(b.type) ?? b.type);
              const bonusStr = currentIslandBonus > 0 ? (window.I18N?.t?.('wiki.ui_island_bonus_inline', { bonus: currentIslandBonus }) ?? ` +${currentIslandBonus}%島嶼`) : '';
              return `
                <div class="value-compact-node" title="${bName} (${bType}) - Lv.${currentBerryLevel}${bonusStr} | ${window.I18N?.t?.('wiki.ui_base_label') ?? '基礎'}: ${energy1x} / ${window.I18N?.t?.('wiki.ui_fav_2x') ?? '順果 2x'}: ${energy2x}">
                  <img src="${b.icon}" class="value-compact-icon" alt="${bName}">
                  <span class="value-compact-energy berry-val" title="${window.I18N?.t?.('wiki.ui_base_energy_1x') ?? '基礎能量 (1x)'}"><span class="energy-multiplier-prefix">1x</span> ${energy1x}</span>
                  <span class="value-compact-energy berry-val-fav" title="${window.I18N?.t?.('wiki.ui_fav_energy_2x') ?? '順果 2x 能量'}"><span class="energy-multiplier-prefix">2x</span> ${energy2x}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 區塊 2：食材基礎庫 (90 ~ 342) -->
        <div class="values-horizontal-section" style="margin-top: 8px;">
          <div class="values-section-header">
            <div class="values-section-title-group">
              <span class="values-section-badge ing-badge">${window.I18N?.t?.('wiki.ui_ing_base_values') ?? '食材基礎庫'}</span>
            </div>
          </div>

          <div class="values-compact-grid values-ing-grid">
            ${sortedIngredients.map(ing => {
              const ingName = window.I18N?.getIngredientName?.(ing.name) || (window.I18N?.pick?.({ 'zh-TW': ing.name, 'en-US': ing.enName || ing.name }) ?? ing.name);
              const ingIcon = (typeof window !== 'undefined' && typeof window.mapExternalToLocalAsset === 'function' && ing.icon && ing.icon.startsWith('assets/'))
                ? (window.mapExternalToLocalAsset(ing.icon) || ing.icon)
                : ing.icon;
              return `
              <div class="value-compact-node ${ing.id === 'tail' ? 'value-tail-highlight' : ''}" title="${ingName} - ${window.I18N?.t?.('wiki.ui_base_energy') ?? '基礎能量'} ${ing.energy}">
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
  function renderIngredientLadders(ladders) {
    const mult = getLadderMultiplier();
    const perDayText = window.I18N?.t?.('wiki.ui_per_day') ?? '顆/天';
    return ladders.map(ing => {
      const ingName = window.I18N?.getIngredientName?.(ing.name) || (window.I18N?.text?.(ing.name) ?? ing.name);
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
          <span class="ladder-max-badge">${filteredTiers.length > 0 ? (window.I18N?.t?.('wiki.ui_max_daily_prefix') ?? '最高日產 ~ ') + scaledMax + perDayText : (window.I18N?.t?.('wiki.ui_no_match') ?? '無符合')}</span>
        </div>

        <div class="ladder-tiers-list">
          ${filteredTiers.length === 0 ? `<div class="text-muted" style="padding: 12px; text-align: center; font-size: 12px;">${window.I18N?.t?.('wiki.ui_no_matching_pkm') ?? '無符合篩選條件之寶可夢'}</div>` : filteredTiers.map(t => {
            const rawName = t.name || '';
            const translatedPkm = window.I18N?.getPokemonName?.(rawName) || (window.I18N?.field?.(t, 'name') ?? rawName);
            const pkmDisplayName = `${translatedPkm} (${t.recipe || 'AAA'})`;
            const noteText = formatLadderNote(t.note || '');
            const rawCountNum = parseFloat(t.rawCount !== undefined ? t.rawCount : (String(t.count).replace(/[^\d.]/g, '') || t.count)) || 0;
            const skillBonus = getPokemonSkillDrawBonus(t.name, ing.id, ing.name);
            const dropCount = (rawCountNum * mult).toFixed(1);
            const totalCount = (parseFloat(dropCount) + skillBonus).toFixed(1);
            const displayCount = skillBonus > 0
              ? `${totalCount} ${perDayText} <span class="ladder-split-text" style="font-size: 11px; color: #f59e0b; font-weight: normal; margin-left: 4px;">(${dropCount} + ${skillBonus})</span>`
              : `${dropCount} ${perDayText}`;

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
      energy: window.I18N?.t?.('wiki.ui_cat_energy') ?? '能量系',
      energy_heal: window.I18N?.t?.('wiki.ui_cat_energy_heal') ?? '活力系',
      ingredient: window.I18N?.t?.('wiki.ui_cat_ingredient') ?? '食材與料理',
      special: window.I18N?.t?.('wiki.ui_cat_special') ?? '神獸與特殊專屬',
      shards: window.I18N?.t?.('wiki.ui_cat_shards') ?? '夢之碎片'
    };
    const typeParen = window.I18N?.t?.('wiki.ui_type_paren') ?? '（屬性）';
    const timesSuffix = window.I18N?.t?.('wiki.ui_times_suffix') ?? '次';
    const helpsUnit = window.I18N?.t?.('wiki.ui_helps_unit') ?? '次幫忙';
    const helpsShort = window.I18N?.t?.('wiki.ui_helps_short') ?? '次';

    return skills.map(skill => {
      let valuesHtml = '';
      const rawSkillName = skill.name || skill.id;
      let skillName = window.I18N?.getMainSkillName?.(rawSkillName) || (window.I18N?.field?.(skill, 'name') ?? rawSkillName);
      skillName = skillName.replace(/[（\(]\s*(?:屬性|属性)\s*[）\)]/g, typeParen);
      const catLabel = catNameMap[skill.category] || (window.I18N?.field?.(skill, 'catName') ?? skill.catName);
      const unitLabel = skill.unit_en
        ? (window.I18N?.field?.(skill, 'unit') ?? skill.unit)
        : (skill.unit.includes('能量') ? (window.I18N?.t?.('wiki.ui_unit_strength') ?? skill.unit)
          : skill.unit.includes('食材') ? (window.I18N?.t?.('wiki.ui_unit_ingredients') ?? skill.unit)
          : skill.unit.includes('次') ? (window.I18N?.t?.('wiki.ui_unit_helps') ?? skill.unit)
          : skill.unit === ' 點' ? (window.I18N?.t?.('wiki.ui_unit_points') ?? skill.unit)
          : skill.unit.includes('點') ? (window.I18N?.t?.('wiki.ui_unit_energy') ?? skill.unit)
          : (window.I18N?.text?.(skill.unit) ?? skill.unit));

      if (skill.hasStackMatrix) {
        const sampleStrings = skill.matrix[10].vals.map(v => `${v.toLocaleString()} ${unitLabel}`);
        valuesHtml = `
          <div class="skill-interactive-section">
            <div class="stack-selector-row">
              <span class="stack-selector-label">${window.I18N?.t?.('wiki.ui_stack_count_label') ?? '蓄力次數切換：'}</span>
              <div class="stack-chips-group" id="charge-stack-chips">
                ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => `
                  <button type="button" class="stack-chip-btn ${s === 10 ? 'active' : ''}" data-stack-target="${s}" onclick="window.WikiDB.switchStack(${s})">${s}${timesSuffix}</button>
                `).join('')}
              </div>
            </div>

            ${renderSkillHeroAndStepper(skill.id, sampleStrings, unitLabel, 7)}

            <!-- 展開完整對照表按鈕 -->
            <div style="margin-top: 8px;">
              <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="charge-matrix-table" onclick="window.WikiDB.toggleDetail('charge-matrix-table')">
                ${window.I18N?.t?.('wiki.ui_toggle_stack_matrix') ?? '展開 / 收合完整 0~10 次蓄力數值表'}
              </button>
            </div>

            <div id="charge-matrix-table" class="wiki-table-wrapper" style="display: none; margin-top: 6px;">
              <table class="wiki-mini-table">
                <thead>
                  <tr>
                    <th>${window.I18N?.t?.('wiki.ui_stacks_th') ?? '蓄力'}</th>
                    ${[1, 2, 3, 4, 5, 6, 7].map(lv => `<th>Lv.${lv}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${skill.matrix.map(m => `
                    <tr class="${m.stacks === 10 ? 'row-highlight' : ''}">
                      <td class="font-bold text-accent">${m.stacks}${timesSuffix}</td>
                      ${m.vals.map(v => `<td>${v.toLocaleString()}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (skill.hasTypeKindsMatrix) {
        const sampleStrings = skill.matrix[5].vals.map(v => `${v} ${helpsUnit}`);
        valuesHtml = `
          <div class="skill-interactive-section">
            <div class="stack-selector-row">
              <span class="stack-selector-label">${window.I18N?.t?.('wiki.ui_same_type_label') ?? '同屬性種類數：'}</span>
              <div class="stack-chips-group" id="helper-boost-chips">
                ${[0, 1, 2, 3, 4, 5].map(k => `
                  <button type="button" class="stack-chip-btn ${k === 5 ? 'active' : ''}" data-boost-kind="${k}" onclick="window.WikiDB.switchBoost(${k})">${k} ${window.I18N?.t?.('wiki.ui_types_unit') ?? '種類'}</button>
                `).join('')}
              </div>
            </div>

            ${renderSkillHeroAndStepper(skill.id, sampleStrings, unitLabel, 6)}

            <!-- 展開完整對照表按鈕 -->
            <div style="margin-top: 8px;">
              <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="helper-boost-table" onclick="window.WikiDB.toggleDetail('helper-boost-table')">
                ${window.I18N?.t?.('wiki.ui_toggle_boost_matrix') ?? '展開 / 收合完整 0~5 種類對照表'}
              </button>
            </div>

            <div id="helper-boost-table" class="wiki-table-wrapper" style="display: none; margin-top: 8px;">
              <table class="wiki-mini-table">
                <thead>
                  <tr>
                    <th>${window.I18N?.t?.('wiki.ui_same_type_th') ?? '同屬種類'}</th>
                    ${[1, 2, 3, 4, 5, 6].map(lv => `<th>Lv.${lv}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${skill.matrix.map(m => `
                    <tr class="${(m.kinds === '5 種類' || m.kinds_en === '5 Species') ? 'row-highlight' : ''}">
                      <td class="font-bold text-accent">${window.I18N?.field?.(m, 'kinds') ?? m.kinds}</td>
                      ${m.vals.map(v => `<td>${v} ${helpsShort}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (skill.hasMoonlightChips) {
        const mlStrings = skill.selfValues.map((v, i) =>
          window.I18N?.t?.('wiki.ui_moonlight_fmt', { self: v, team: skill.teamValues[i], unit: unitLabel.trim() })
          ?? `自${v}+他${skill.teamValues[i]}${unitLabel.trim()}`
        );
        valuesHtml = renderSkillHeroAndStepper(skill.id, mlStrings, unitLabel, 6);
      } else if (skill.hasLunarPrayerMatrix) {
        const lpStrings = skill.healValues.map((v, i) => {
          const formula = skill.berryFormulas ? skill.berryFormulas[i] : ["14+2n", "19+3n", "24+4n", "29+5n", "30+7n", "32+9n"][i];
          return window.I18N?.t?.('wiki.ui_lunar_fmt', { val: v, formula }) ?? `全隊${v}點+${formula}`;
        });
        valuesHtml = `
          ${renderSkillHeroAndStepper(skill.id, lpStrings, unitLabel, 6)}

          <!-- 展開完整 1~5 種類隊友樹果對照表按鈕 -->
          <div style="margin-top: 6px;">
            <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="lunar-prayer-table" onclick="window.WikiDB.toggleDetail('lunar-prayer-table')">
              ${window.I18N?.t?.('wiki.ui_toggle_lunar_table') ?? '展開 / 收合 1~5 種類隊友樹果表'}
            </button>
          </div>

          <div id="lunar-prayer-table" class="wiki-table-wrapper" style="display: none; margin-top: 6px;">
            <table class="wiki-mini-table">
              <thead>
                <tr>
                  <th style="white-space: nowrap;">${window.I18N?.t?.('wiki.ui_species_th') ?? '種類'}</th>
                  ${[1, 2, 3, 4, 5, 6].map(lv => `<th>Lv.${lv}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${skill.berryMatrix.map((m, idx) => `
                  <tr class="${idx === 4 ? 'row-highlight' : ''}">
                    <td class="font-bold text-accent" style="white-space: nowrap;">${window.I18N?.field?.(m, 'kinds') ?? m.kinds}</td>
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
              ${window.I18N?.t?.('wiki.ui_toggle_ing_draw') ?? '展開 / 收合 各寶可夢「專屬食材池」對照表'}
            </button>
          </div>

          <div id="ing-draw-matrix-table" class="wiki-table-wrapper" style="display: none; margin-top: 6px;">
            <table class="wiki-mini-table">
              <thead>
                <tr>
                  <th style="width: 44px; text-align: center;">${window.I18N?.t?.('wiki.ui_pkm_proper') ?? '寶可夢'}</th>
                  <th>${window.I18N?.t?.('wiki.ui_skill_variant_th') ?? '主技能型態'}</th>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_candidate_ings_th') ?? '專屬食材候選池 (3~4種)'}</th>
                </tr>
              </thead>
              <tbody>
                ${INGREDIENT_DRAW_POKEMONS.map(p => {
                  const pName = window.I18N?.getPokemonName?.(p.name) || (window.I18N?.field?.(p, 'name') ?? p.name);
                  const pTitle = p.family
                    ? (window.I18N?.field?.(p, 'family') ?? p.family)
                    : pName;
                  const pSkill = window.I18N?.field?.(p, 'skill') ?? p.skill;
                  const pExtra = (p.id === 430 || p.id === 303) ? (window.I18N?.field?.(p, 'extraEffect') ?? p.extraEffect) : '';
                  return `
                  <tr>
                    <td style="text-align: center; padding: 5px 4px;">
                      <img src="${p.icon}" width="34" height="34" style="object-fit: contain; vertical-align: middle;" alt="${pName}" title="${pTitle}">
                    </td>
                    <td style="text-align: center; padding: 5px 6px;">
                      <span class="wiki-skill-badge skill-badge-blue">${pSkill}</span>
                      ${pExtra ? `<div style="font-size: 9.5px; color: var(--color-note-highlight, #d97706); margin-top: 3px; line-height: 1.2;">${pExtra}</div>` : ''}
                    </td>
                    <td style="text-align: center; padding: 5px 4px;">
                      <div style="display: inline-flex; align-items: center; gap: 4px; justify-content: center; flex-direction: row; flex-wrap: nowrap;">
                        ${p.ingredients.map(ig => {
                          const igName = window.I18N?.getIngredientName?.(ig.name) || (window.I18N?.field?.(ig, 'name') ?? ig.name);
                          return `
                          <div class="wiki-ing-badge" title="${igName}" style="display: inline-flex; align-items: center; justify-content: center; background: transparent; border: none; padding: 0; cursor: help;">
                            <img src="${ig.icon}" width="24" height="24" alt="${igName}" style="object-fit: contain; vertical-align: middle;">
                          </div>
                        `;}).join('')}
                      </div>
                    </td>
                  </tr>
                `;})}
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

      const skillDesc = window.I18N?.field?.(skill, 'desc') ?? skill.desc;
      const specialNote = skill.specialNote ? (window.I18N?.field?.(skill, 'specialNote') ?? skill.specialNote) : null;
      const penaltyNote = skill.penaltyNote ? (window.I18N?.field?.(skill, 'penaltyNote') ?? skill.penaltyNote) : null;

      const isVisible = currentSkillsCategory === 'all' || skill.category === currentSkillsCategory;
      return `
        <div class="wiki-skill-card clickable-card" id="skill-card-${skill.id}" data-category="${skill.category}" style="display: ${isVisible ? 'flex' : 'none'} !important;" onclick="window.WikiDB.toggleSkillCard(this, '${skill.id}', event)">
          <div class="skill-card-top">
            <div class="skill-title-badges">
              <h4 class="skill-name-text">${skillName}</h4>
              <span class="skill-cat-tag cat-${skill.category}">${catLabel}</span>
            </div>
            <div class="skill-top-right">
              <span class="skill-max-lv-badge">${window.I18N?.t?.('wiki.ui_max_lv_prefix') ?? '上限 Lv.'}${skill.maxLevel}</span>
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
