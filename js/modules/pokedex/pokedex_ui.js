    function filterData() {
      return allPokemons.filter(p => {
        if (selectedTypes.size > 0 && !selectedTypes.has(p.type)) return false;

        // 類型篩選 (樹果、食材、技能；若都沒選則展示全部；夢幻 specialty === '全部' 在任何選取下均展示)
        if (selectedSpecialties.size > 0) {
          const isMewAll = p.specialty === '全部' || p.specialty === 'ALL';
          if (!isMewAll && !selectedSpecialties.has(p.specialty)) return false;
        }

        // 僅最終進化篩選 (Only Final Evolution)
        if (onlyFinal) {
          const isFinal = (typeof isFinalEvolution === 'function')
            ? isFinalEvolution(p)
            : (p.is_final === '〇' || p.is_final === 'O' || p.is_final === 'o' || p.is_final === true || p.is_final === '1');
          if (!isFinal) return false;
        }

        // 樹果細節篩選 (多選)
        if (selectedBerries.size > 0) {
          const berryName = TYPE_TO_BERRY[p.type];
          if (!berryName || !selectedBerries.has(berryName)) return false;
        }

        // 食材細節篩選 (若開啟「僅初始食材」則只比對 Lv.1 初始食材 p.ingredients[0]，否則比對任意食材)
        if (selectedIngredients.size > 0) {
          if (onlyInitialIng) {
            const initialIng = p.ingredients && p.ingredients[0] && p.ingredients[0].name ? p.ingredients[0].name : '';
            if (!initialIng || !selectedIngredients.has(initialIng)) return false;
          } else {
            const hasIng = p.ingredients && p.ingredients.some(ing => ing.name && selectedIngredients.has(ing.name));
            if (!hasIng) return false;
          }
        }

        // 技能細節篩選 (多選，支援基礎技能與複合技能自動關聯)
        if (selectedSkills.size > 0) {
          let hasMatchedSkill = false;
          for (const targetSkill of selectedSkills) {
            if (matchesSkill(p.main_skill, targetSkill)) {
              hasMatchedSkill = true;
              break;
            }
          }
          if (!hasMatchedSkill) return false;
        }

        if (currentSearch) {
          if (!matchesPokemonSearch(p, currentSearch)) return false;
        }
        return true;
      });
    }

    function renderDualSortArrowSvg(state) {
      const up = (state === 'asc' || state === 'newest') ? 'filled' : 'hollow';
      const dn = (state === 'desc' || state === 'newest') ? 'filled' : 'hollow';
      return `<svg class="sort-dual-svg" data-sort-state="${state}" viewBox="0 0 12 16" width="12" height="16" aria-hidden="true"><path class="sort-tri-up ${up}" d="M6 1.5L10.5 6.8H1.5Z"/><path class="sort-tri-down ${dn}" d="M6 14.5L10.5 9.2H1.5Z"/></svg>`;
    }

    function sortableTh(col, label, cls) {
      const parsed = parseTableSort(currentSort);
      const on = parsed.col === col;
      let arrow = '', aria = 'none', titleTip = '', sortState = 'none';
      if (on) {
        if (parsed.dir === 'newest') {
          sortState = 'newest'; arrow = window.I18N?.t?.('dex.ui_sort_new_tag') ?? ' (新)'; aria = 'other';
          titleTip = window.I18N?.t?.('dex.ui_sort_tip_newest') ?? 'dex.ui_sort_tip_newest';
        } else if (parsed.dir === 'desc') {
          sortState = 'desc'; arrow = '▼'; aria = 'descending';
          titleTip = window.I18N?.t?.('dex.ui_sort_tip_desc') ?? 'dex.ui_sort_tip_desc';
        } else {
          sortState = 'asc'; arrow = '▲'; aria = 'ascending';
          titleTip = window.I18N?.t?.('dex.ui_sort_tip_asc') ?? 'dex.ui_sort_tip_asc';
        }
      }
      if (cls === 'th-icon') {
        const iconAriaLabel = titleTip || (window.I18N?.t?.('th.icon') ?? 'Icon');
        return `<th class="${cls} th-sortable" data-sort="${col}" aria-sort="${aria}" aria-label="${iconAriaLabel}" ${titleTip ? `title="${titleTip}"` : ''}><span class="sort-arrow sort-arrow-dual" aria-hidden="true">${renderDualSortArrowSvg(sortState)}</span></th>`;
      }
      return `<th class="${cls} th-sortable" data-sort="${col}" aria-sort="${aria}" ${titleTip ? `title="${titleTip}"` : ''}>${label}${arrow ? `<span class="sort-arrow" aria-hidden="true">${arrow}</span>` : ''}</th>`;
    }

    function renderUI() {
      if (!contentArea) return;
      try {
        if (typeof updateActiveFilterBadge === 'function') updateActiveFilterBadge();
        const filtered = sortPokemonList(filterData(), currentSort);
        const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
        if (countBadge) countBadge.textContent = window.I18N?.t?.('dex.ui_count_fmt', { count: filtered.length }) ?? String(filtered.length);

        if (filtered.length === 0) {
          contentArea.innerHTML = `<div style="text-align:center; padding: 60px; color: var(--text-muted); font-size: 16px;">${t('pokedex.no_results', '查無符合條件的寶可夢')}</div>`;
          return;
        }

        const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
        if (isMobileH5) {
          viewMode = 'table';
        }

        if (viewMode === 'grid') renderGrid(filtered);
        else renderTable(filtered);
      } catch (err) {
        console.error('Error in renderUI:', err);
        if (typeof window.__renderInPlaceError === 'function') {
          window.__renderInPlaceError('content-area', window.I18N?.t?.('dex.ui_render_error') ?? 'dex.ui_render_error', err);
        }
      }
    }

    function renderGrid(data) {
      const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

      contentArea.innerHTML = `
        <div class="pokemon-grid">
          ${data.map(p => {
            const iconUrl = getIconUrl(p);
            const pkmName = window.I18N?.getPokemonName?.(p) ?? (p.name_cn || p.name_en || '');
            const specName = window.I18N ? window.I18N.getSpecialtyName(p.specialty) : (p.specialty || '--');
            let specClass = 'spec-ingredient';
            const rawSpec = p.specialty || '';
            if (rawSpec.includes('樹果') || rawSpec === 'Berries') {
              specClass = 'spec-berry';
            } else if (rawSpec.includes('技能') || rawSpec === 'Skills') {
              specClass = 'spec-skill';
            } else if (rawSpec.includes('全能') || rawSpec.includes('全部') || rawSpec === 'All-Rounder' || rawSpec.toLowerCase() === 'all') {
              specClass = 'spec-all';
            }
            const berry = getPokemonBerry(p);
            const berryName = window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--');

            return `
            <div class="pokemon-card">
              <div class="card-header">
                ${iconUrl ? `<img class="pokemon-icon" src="${iconUrl}" width="44" height="44" alt="${pkmName}" loading="lazy" decoding="async" onerror="handlePokemonIconError(this)" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}">` : ''}
                <div class="card-title-group" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}">
                  <div class="pokemon-no">No.${p.formatted_no}</div>
                  <div class="pokemon-name" style="white-space:nowrap;">${pkmName}</div>
                  ${p.name_en && pkmName !== p.name_en ? `<div class="pokemon-name-en" style="white-space:nowrap;">${p.name_en}</div>` : ''}
                </div>
                <div class="card-header-ingredients">
                  ${p.ingredients ? p.ingredients.map((ing, i) => {
                    const ingName = (ing.name && window.I18N) ? window.I18N.getIngredientName(ing.name) : (ing.name || '');
                    return ing.name ? `
                    <div class="card-header-ing-row" title="${ingName}">
                      ${ing.icon ? `<img class="card-header-ing-icon" src="${ing.icon}" width="15" height="15" alt="${ingName}" loading="lazy" decoding="async" onerror="this.style.display='none';">` : ''}
                      ${ingQtyBadges(ing, i)}
                    </div>
                  ` : '';
                  }).join('') : ''}
                </div>
              </div>
              <div class="card-stats">
                <div class="stat-item">
                  <span class="stat-label">${t('th.berry', '樹果')}</span>
                  <span class="stat-value" title="${berryName}">
                    ${berry && berry.icon ? `<img src="${berry.icon}" width="20" height="20" alt="${berryName}" class="card-berry-icon" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;" loading="lazy" decoding="async" onerror="this.style.display='none';">` : `<span class="berry-name-text">${berryName}</span>`}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">${t('th.specialty', '得意')}</span>
                  <span class="stat-value" style="white-space:nowrap;">${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(p.specialty, 20) : `<span class="box-spec-tag ${specClass}">${specName}</span>`}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">${t('th.carry', '持有')}</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.carry || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">${t('th.ingredient_rate', '食材率')}</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.ingredient_rate || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">${t('th.skill_rate', '技能率')}</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.skill_rate || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">${t('th.interval', '幫忙間隔')}</span>
                  <span class="stat-value" style="white-space:nowrap;">${formatHelpInterval(p.interval)}</span>
                </div>
              </div>
              <div class="card-skill-footer">
                <span class="card-skill-label">${t('th.main_skill', '主技能')}</span>
                <span class="card-skill-value">${renderSkillWithTooltip(p.main_skill, p)}</span>
              </div>
            </div>
          `}).join('')}
          <div class="table-bottom-spacer" aria-hidden="true"></div>
        </div>
      `;
    }

    function renderTable(data) {
      const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
      const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
      const isShowNo = (typeof PokemonApp !== 'undefined' && PokemonApp.showNo) || (typeof showNo !== 'undefined' && showNo) || false;

      const ing1Label = isMobileH5 ? t('th.ing1_mobile', '食1') : t('th.ing1', '食材1');
      const ing2Label = isMobileH5 ? t('th.ing2_mobile', '食2') : t('th.ing2', '食材2');
      const ing3Label = isMobileH5 ? t('th.ing3_mobile', '食3') : t('th.ing3', '食材3');

      contentArea.innerHTML = `
        <div class="table-container">
          <table class="pokemon-table ${isShowNo ? '' : 'hide-no'}">
            <thead>
              <tr>
                ${isShowNo ? sortableTh('no', 'No.', 'th-no') : ''}
                ${sortableTh('no', '', 'th-icon')}
                <th class="th-name">${t('th.name', '寶可夢')}</th>
                <th class="th-berry">${t('th.berry', '樹果')}</th>
                <th class="th-spec">${t('th.specialty', '得意')}</th>
                ${sortableTh('carry', t('th.carry', '持有'), 'th-carry')}
                <th class="th-ing">${ing1Label}</th>
                <th class="th-ing">${ing2Label}</th>
                <th class="th-ing">${ing3Label}</th>
                ${sortableTh('ingredientRate', t('th.ingredient_rate', '食材率'), 'th-rate')}
                ${sortableTh('skillRate', t('th.skill_rate', '技能率'), 'th-rate')}
                ${sortableTh('interval', t('th.interval', '幫忙間隔'), 'th-interval')}
                <th class="th-skill">${t('th.main_skill', '主技能')}</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(p => {
                const iconUrl = getIconUrl(p);
                const pkmName = window.I18N?.getPokemonName?.(p) ?? (p.name_cn || p.name_en || '');
                const specName = window.I18N ? window.I18N.getSpecialtyName(p.specialty) : (p.specialty || '--');
                let specClass = 'spec-ingredient';
                const rawSpec = p.specialty || '';
                if (rawSpec.includes('樹果') || rawSpec === 'Berries') {
                  specClass = 'spec-berry';
                } else if (rawSpec.includes('技能') || rawSpec === 'Skills') {
                  specClass = 'spec-skill';
                } else if (rawSpec.includes('全能') || rawSpec.includes('全部') || rawSpec === 'All-Rounder' || rawSpec.toLowerCase() === 'all') {
                  specClass = 'spec-all';
                }
                const berry = getPokemonBerry(p);
                const berryName = window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--');

                return `
                <tr>
                  ${isShowNo ? `<td class="td-no">${p.formatted_no}</td>` : ''}
                  <td class="td-icon">
                    ${iconUrl ? `<img src="${iconUrl}" width="34" height="34" class="table-icon" alt="${pkmName}" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}" loading="lazy" decoding="async" onerror="handlePokemonIconError(this)" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;">` : ''}
                  </td>
                  <td class="td-name pokemon-name-cell" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}">${pkmName}</td>
                  <td class="td-berry">${berry.icon ? `<img src="${berry.icon}" width="22" height="22" class="table-berry-icon" alt="${berryName}" title="${berryName}" loading="lazy" decoding="async" onerror="this.style.display='none';">` : `<span class="berry-name-text">${berryName}</span>`}</td>
                  <td class="td-spec" style="text-align:center;">${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(p.specialty, 20) : `<span class="box-spec-tag ${specClass}">${specName}</span>`}</td>
                  <td class="td-carry">${p.carry || '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[0] ? `<div class="ing-cell">${p.ingredients[0].icon ? `<img class="ing-icon" width="22" height="22" src="${p.ingredients[0].icon}" alt="${window.I18N ? window.I18N.getIngredientName(p.ingredients[0].name) : p.ingredients[0].name}" loading="lazy" decoding="async" title="${window.I18N ? window.I18N.getIngredientName(p.ingredients[0].name) : p.ingredients[0].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[0],0)}</div>` : '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[1] ? `<div class="ing-cell">${p.ingredients[1].icon ? `<img class="ing-icon" width="22" height="22" src="${p.ingredients[1].icon}" alt="${window.I18N ? window.I18N.getIngredientName(p.ingredients[1].name) : p.ingredients[1].name}" loading="lazy" decoding="async" title="${window.I18N ? window.I18N.getIngredientName(p.ingredients[1].name) : p.ingredients[1].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[1],1)}</div>` : '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[2] ? `<div class="ing-cell">${p.ingredients[2].icon ? `<img class="ing-icon" width="22" height="22" src="${p.ingredients[2].icon}" alt="${window.I18N ? window.I18N.getIngredientName(p.ingredients[2].name) : p.ingredients[2].name}" loading="lazy" decoding="async" title="${window.I18N ? window.I18N.getIngredientName(p.ingredients[2].name) : p.ingredients[2].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[2],2)}</div>` : '--'}</td>
                  <td class="td-rate">${p.ingredient_rate || '--'}</td>
                  <td class="td-rate">${p.skill_rate || '--'}</td>
                  <td class="td-interval">${formatHelpInterval(p.interval)}</td>
                  <td class="td-skill">${renderSkillWithTooltip(p.main_skill, p, { compactTable: true })}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
          <div class="table-bottom-spacer" aria-hidden="true"></div>
        </div>
      `;
    }

    PokemonApp.render = function() {
      if (typeof renderTypeButtons === 'function') renderTypeButtons();
      if (typeof renderSpecialtyButtons === 'function') renderSpecialtyButtons();
      if (typeof renderBerryButtons === 'function') renderBerryButtons();
      if (typeof renderIngredientButtons === 'function') renderIngredientButtons();
      if (typeof renderSkillButtons === 'function') renderSkillButtons();
      if (typeof renderUI === 'function') renderUI();
    };

    initSkillTooltips();
    initBackToTop();
    initPullToRefresh();
    PokemonApp.initBackToTop = initBackToTop;
    PokemonApp.initPullToRefresh = initPullToRefresh;
    PokemonApp.cancelPullToRefresh = window.cancelPullToRefresh;
  });
}
