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
          const isFinal = p.is_final === '〇' || p.is_final === 'O' || p.is_final === 'o' || p.is_final === true || p.is_final === '1';
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

    function sortableTh(col, label, cls) {
      const parsed = parseTableSort(currentSort);
      const on = parsed.col === col;
      const arrow = on ? (parsed.dir === 'desc' ? '▼' : '▲') : '';
      const aria = on ? (parsed.dir === 'desc' ? 'descending' : 'ascending') : 'none';
      return `<th class="${cls} th-sortable" data-sort="${col}" aria-sort="${aria}">${label}${arrow ? `<span class="sort-arrow" aria-hidden="true">${arrow}</span>` : ''}</th>`;
    }

    function renderUI() {
      if (!contentArea) return;
      try {
        if (typeof updateActiveFilterBadge === 'function') updateActiveFilterBadge();
        const filtered = sortPokemonList(filterData(), currentSort);
        const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
        const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
        if (countBadge) countBadge.textContent = isEN ? `${filtered.length} ${t('pokedex.count_label', 'Pokémon')}` : `共 ${filtered.length} 隻寶可夢`;

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
          window.__renderInPlaceError('content-area', '圖鑑畫面渲染異常', err);
        }
      }
    }

    function renderGrid(data) {
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

      contentArea.innerHTML = `
        <div class="pokemon-grid">
          ${data.map(p => {
            const iconUrl = getIconUrl(p);
            const pkmName = isEN ? (p.name_en || p.name_cn) : (p.name_cn || p.name_en);
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
                ${iconUrl ? `<img class="pokemon-icon" src="${iconUrl}" alt="${pkmName}" loading="lazy" onerror="this.style.display='none';" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}">` : ''}
                <div class="card-title-group" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}">
                  <div class="pokemon-no">No.${p.formatted_no}</div>
                  <div class="pokemon-name" style="white-space:nowrap;">${pkmName}</div>
                  ${!isEN && p.name_en ? `<div class="pokemon-name-en" style="white-space:nowrap;">${p.name_en}</div>` : ''}
                </div>
                <div class="card-header-ingredients">
                  ${p.ingredients ? p.ingredients.map((ing, i) => {
                    const ingName = (ing.name && window.I18N) ? window.I18N.getIngredientName(ing.name) : (ing.name || '');
                    return ing.name ? `
                    <div class="card-header-ing-row" title="${ingName}">
                      ${ing.icon ? `<img class="card-header-ing-icon" src="${ing.icon}" alt="${ingName}" loading="lazy" onerror="this.style.display='none';">` : ''}
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
                    ${berry && berry.icon ? `<img src="${berry.icon}" alt="${berryName}" class="card-berry-icon" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;" loading="lazy" onerror="this.style.display='none';">` : `<span class="berry-name-text">${berryName}</span>`}
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
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
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
                ${sortableTh('no', t('th.icon', '圖示'), 'th-icon')}
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
                const pkmName = isEN ? (p.name_en || p.name_cn) : (p.name_cn || p.name_en);
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
                    ${iconUrl ? `<img src="${iconUrl}" width="34" height="34" class="table-icon" alt="${pkmName}" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}" loading="lazy" onerror="this.style.display='none';" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;">` : ''}
                  </td>
                  <td class="td-name pokemon-name-cell" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}">${pkmName}</td>
                  <td class="td-berry">${berry.icon ? `<img src="${berry.icon}" width="22" height="22" class="table-berry-icon" alt="${berryName}" title="${berryName}" loading="lazy" onerror="this.style.display='none';">` : `<span class="berry-name-text">${berryName}</span>`}</td>
                  <td class="td-spec" style="text-align:center;">${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(p.specialty, 20) : `<span class="box-spec-tag ${specClass}">${specName}</span>`}</td>
                  <td class="td-carry">${p.carry || '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[0] ? `<div class="ing-cell">${p.ingredients[0].icon ? `<img class="ing-icon" src="${p.ingredients[0].icon}" alt="${window.I18N ? window.I18N.getIngredientName(p.ingredients[0].name) : p.ingredients[0].name}" loading="lazy" title="${window.I18N ? window.I18N.getIngredientName(p.ingredients[0].name) : p.ingredients[0].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[0],0)}</div>` : '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[1] ? `<div class="ing-cell">${p.ingredients[1].icon ? `<img class="ing-icon" src="${p.ingredients[1].icon}" alt="${window.I18N ? window.I18N.getIngredientName(p.ingredients[1].name) : p.ingredients[1].name}" loading="lazy" title="${window.I18N ? window.I18N.getIngredientName(p.ingredients[1].name) : p.ingredients[1].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[1],1)}</div>` : '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[2] ? `<div class="ing-cell">${p.ingredients[2].icon ? `<img class="ing-icon" src="${p.ingredients[2].icon}" alt="${window.I18N ? window.I18N.getIngredientName(p.ingredients[2].name) : p.ingredients[2].name}" loading="lazy" title="${window.I18N ? window.I18N.getIngredientName(p.ingredients[2].name) : p.ingredients[2].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[2],2)}</div>` : '--'}</td>
                  <td class="td-rate">${p.ingredient_rate || '--'}</td>
                  <td class="td-rate">${p.skill_rate || '--'}</td>
                  <td class="td-interval">${formatHelpInterval(p.interval)}</td>
                  <td class="td-skill">${renderSkillWithTooltip(p.main_skill, p)}</td>
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

    function initSkillTooltips() {
      let isRecentTouch = false;
      let touchResetTimer = null;
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;
      let didHandleTouchTap = false;

      // 1. 觸控開始 (Capture 捕獲：若點選外部立即關閉浮窗，並記錄觸控起點)
      const onTouchStart = (e) => {
        isRecentTouch = true;
        didHandleTouchTap = false;
        if (touchResetTimer) clearTimeout(touchResetTimer);
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
        }

        // 若當前有任何浮窗顯示中，檢查觸控目標是否在浮窗或觸發按鈕內
        if (isAnyFloatingTooltipVisible()) {
          const target = e.target;
          const isInsideTooltip = target && target.closest && target.closest(
            '.global-skill-tooltip, .pokedex-energy-help-bubble, .ladder-energy-help-bubble, .ladder-skill-tooltip-bubble, .island-sleep-hover-tooltip, .ladder-node-tooltip'
          );
          const isTriggerBtn = target && target.closest && target.closest(
            '.pot-expansion-help-btn, .pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn, .special-skill-badge, .ladder-node'
          );
          // 若點選的是其他任何非浮窗且非觸發按鈕的區域，立即關閉浮窗
          if (!isInsideTooltip && !isTriggerBtn) {
            dismissAllFloatingTooltips();
          }
        }
      };

      let _lastTouchStartEvt = null;
      const origOnTouchStart = onTouchStart;
      const dedupTouchStart = (e) => {
        if (e && e === _lastTouchStartEvt) return;
        _lastTouchStartEvt = e;
        origOnTouchStart(e);
      };
      document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
      window.addEventListener('touchstart', dedupTouchStart, { capture: true, passive: true });

      // 2. 觸控釋放 (輕觸手勢開關浮窗)
      document.addEventListener('touchend', (e) => {
        if (touchResetTimer) clearTimeout(touchResetTimer);
        touchResetTimer = setTimeout(() => {
          isRecentTouch = false;
        }, 350);

        if (e.changedTouches && e.changedTouches[0]) {
          const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
          const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
          const dt = Date.now() - touchStartTime;

          // 輕觸手勢判定 (位移極小且釋放迅速，代表點選觸發)
          if (dx < 10 && dy < 10 && dt < 450) {
            const ladderNode = e.target.closest('.ladder-node');
            if (ladderNode) {
              if (e.target.closest('.ladder-node-tooltip')) {
                return;
              }
              didHandleTouchTap = true;
              if (e.cancelable) e.preventDefault();
              const wasActive = ladderNode.classList.contains('tooltip-active');
              dismissAllFloatingTooltips();
              if (!wasActive) {
                ladderNode.classList.add('tooltip-active');
                markLadderGroupSelected(ladderNode);
                const trackRow = ladderNode.closest('.ladder-track-row, .ladder-tail-track-row');
                if (trackRow) trackRow.classList.add('has-active-tooltip');
                hasAnyFloatingTooltipOpen = true;
                if (typeof window !== 'undefined') window._hasAnyFloatingTooltipOpen = true;
              }
              return;
            }

            const badge = e.target.closest('.special-skill-badge');
            if (badge) {
              didHandleTouchTap = true;
              if (e.cancelable) e.preventDefault();
              const skillName = badge.dataset.skill || '';
              const detail = badge.dataset.skillDetail || badge.getAttribute('title') || badge.dataset.nativeTitle || '';
              if (!detail) return;
              const titleName = (typeof window !== 'undefined' && window.I18N) ? window.I18N.getMainSkillName(skillName) : skillName;
              toggleGlobalTooltip(badge, titleName, detail);
              return;
            }

            const helpBtn = e.target.closest('.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn') || e.target.closest('.pot-expansion-help-btn');
            if (helpBtn) {
              didHandleTouchTap = true;
              if (e.cancelable) e.preventDefault();
              const help = getHelpButtonData(helpBtn);
              if (help) {
                toggleGlobalTooltip(helpBtn, help.title, help.body);
              }
              return;
            }
          }
        }
      }, { passive: false });

      document.addEventListener('touchcancel', () => {
        if (touchResetTimer) clearTimeout(touchResetTimer);
        touchResetTimer = setTimeout(() => {
          isRecentTouch = false;
        }, 350);
      }, { passive: true });

      // 3. 滑鼠懸停 (Desktop Web 瞬時響應，無任何動畫延遲)
      document.addEventListener('mouseover', (e) => {
        if (isRecentTouch) return;

        const badge = e.target.closest('.special-skill-badge');
        if (badge) {
          const skillName = badge.dataset.skill || '';
          const detail = badge.dataset.skillDetail || badge.getAttribute('title') || badge.dataset.nativeTitle || '';
          if (!detail) return;
          const titleName = (typeof window !== 'undefined' && window.I18N) ? window.I18N.getMainSkillName(skillName) : skillName;
          showGlobalTooltip(badge, titleName, detail);
          return;
        }

        const helpBtn = e.target.closest('.ladder-formula-help-btn, .ladder-help-icon-btn, .pokedex-formula-help-btn') || e.target.closest('.pot-expansion-help-btn');
        if (helpBtn) {
          const help = getHelpButtonData(helpBtn);
          if (help) {
            showGlobalTooltip(helpBtn, help.title, help.body);
          }
        }
      });

      document.addEventListener('mouseout', (e) => {
        if (isRecentTouch || isTooltipPinned) return;
        const badge = e.target.closest('.special-skill-badge');
        const helpBtn = e.target.closest('.pot-expansion-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn, .pokedex-formula-help-btn');
        if (badge || helpBtn) {
          hideGlobalTooltip();
        }
      });

      // 4. 點擊事件 (Desktop 點擊固定/切換與 Mobile 備援點選)
      document.addEventListener('click', (e) => {
        if (didHandleTouchTap) {
          didHandleTouchTap = false;
          return;
        }

        const ladderNode = e.target.closest('.ladder-node');
        if (ladderNode) {
          if (e.target.closest('.ladder-node-tooltip')) {
            return;
          }
          e.stopPropagation();
          const wasActive = ladderNode.classList.contains('tooltip-active');
          dismissAllFloatingTooltips();
          if (!wasActive) {
            ladderNode.classList.add('tooltip-active');
            markLadderGroupSelected(ladderNode);
            const trackRow = ladderNode.closest('.ladder-track-row, .ladder-tail-track-row');
            if (trackRow) trackRow.classList.add('has-active-tooltip');
            hasAnyFloatingTooltipOpen = true;
            if (typeof window !== 'undefined') window._hasAnyFloatingTooltipOpen = true;
          }
          return;
        }

        const badge = e.target.closest('.special-skill-badge');
        if (badge) {
          e.stopPropagation();
          const skillName = badge.dataset.skill || '';
          const detail = badge.dataset.skillDetail || badge.getAttribute('title') || badge.dataset.nativeTitle || '';
          if (!detail) return;
          const titleName = (typeof window !== 'undefined' && window.I18N) ? window.I18N.getMainSkillName(skillName) : skillName;
          toggleGlobalTooltip(badge, titleName, detail);
          return;
        }

        const helpBtn = e.target.closest('.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn') || e.target.closest('.pot-expansion-help-btn');
        if (helpBtn) {
          if (helpBtn.classList.contains('pot-expansion-help-btn')) {
            e.stopPropagation();
            const help = getHelpButtonData(helpBtn);
            if (help) {
              toggleGlobalTooltip(helpBtn, help.title, help.body);
            }
            return;
          }
          // 若有自帶 onclick，由自身控制，不執行外部關閉
          return;
        }

        // 點擊懸浮窗本體不關閉
        if (e.target.closest && e.target.closest('.global-skill-tooltip, .pokedex-energy-help-bubble, .ladder-energy-help-bubble, .ladder-skill-tooltip-bubble, .island-sleep-hover-tooltip, .ladder-node-tooltip')) {
          return;
        }

        // 點擊其他任何非浮窗區域一律關閉所有懸浮說明
        dismissAllFloatingTooltips();
      });

      // 5. 頁面或任何容器滾動時即時關閉所有浮窗 (若當前無開啟中的浮窗則極速跳過，避免滾動開銷與 Forced Reflow)
      let _lastScrollEvt = null;
      const onScrollDismiss = (e) => {
        if (e && e === _lastScrollEvt) return;
        _lastScrollEvt = e;
        if (!currentGlobalTooltipAnchor) {
          if (!hasAnyFloatingTooltipOpen && !(typeof window !== 'undefined' && window._hasAnyFloatingTooltipOpen) && !isAnyFloatingTooltipVisible()) return;
        }
        dismissAllFloatingTooltips();
      };

      document.addEventListener('scroll', onScrollDismiss, { capture: true, passive: true });
      window.addEventListener('scroll', onScrollDismiss, { capture: true, passive: true });
      window.addEventListener('wheel', onScrollDismiss, { capture: true, passive: true });

      // 6. 手指滑動位移時關閉所有浮窗 (H5 App 移動超過 3px 即判定為滑動瀏覽，立即關閉浮窗)
      let _lastTouchMoveEvt = null;
      const onTouchMove = (e) => {
        if (e && e === _lastTouchMoveEvt) return;
        _lastTouchMoveEvt = e;
        if (!currentGlobalTooltipAnchor) {
          if (!hasAnyFloatingTooltipOpen && !(typeof window !== 'undefined' && window._hasAnyFloatingTooltipOpen) && !isAnyFloatingTooltipVisible()) return;
        }
        if (e.touches && e.touches[0]) {
          const dx = Math.abs(e.touches[0].clientX - touchStartX);
          const dy = Math.abs(e.touches[0].clientY - touchStartY);
          if (dx > 3 || dy > 3 || (dx > 10 || dy > 10)) {
            dismissAllFloatingTooltips();
          }
        }
      };

      document.addEventListener('touchmove', onTouchMove, { capture: true, passive: true });
      window.addEventListener('touchmove', onTouchMove, { capture: true, passive: true });
    }

    function initBackToTop() {
      let btn = document.getElementById('back-to-top-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'back-to-top-btn';
        btn.className = 'back-to-top-btn';
        btn.setAttribute('aria-label', window.I18N ? window.I18N.t('common.back_to_top', '回到頂部') : '回到頂部');
        btn.setAttribute('title', window.I18N ? window.I18N.t('common.back_to_top', '回到頂部') : '回到頂部');
        btn.setAttribute('data-i18n-title', 'common.back_to_top');
        btn.setAttribute('data-i18n-aria', 'common.back_to_top');
        btn.innerHTML = `
          <svg class="back-to-top-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5"></path>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        `;
        document.body.appendChild(btn);
      }

      function updateBackToTopVisibility() {
        if (!btn) return;
        const scrollY = window.pageYOffset || (document.documentElement ? document.documentElement.scrollTop : 0) || (document.body ? document.body.scrollTop : 0) || 0;
        const docHeight = Math.max(
          document.body ? document.body.scrollHeight : 0,
          document.documentElement ? document.documentElement.scrollHeight : 0,
          document.body ? document.body.offsetHeight : 0,
          document.documentElement ? document.documentElement.offsetHeight : 0
        );
        const winHeight = window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : 0) || 0;

        // 判定內容高度是否明顯超過螢幕視窗（至少多出 150px），且向下滑動超過 280px
        const isLongContent = docHeight > winHeight + 150;
        const shouldShow = isLongContent && scrollY > 280;

        if (shouldShow) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }

        // 行動端 H5 避讓檢測：若右下有篩選按鈕 (FAB)，自動向上避讓 138px，防止互相覆蓋
        const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
        if (isMobileH5) {
          const fabPkm = document.getElementById('sidebar-bookmark-handle');
          const fabRecipe = document.getElementById('recipe-sidebar-bookmark-handle');
          const fabLadder = document.getElementById('ladder-sidebar-bookmark-handle');

          const isFabVisible = (el) => {
            if (!el) return false;
            if (el.style.display === 'none') return false;
            if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
              try {
                const s = window.getComputedStyle(el);
                return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
              } catch (e) { return true; }
            }
            return true;
          };

          if (isFabVisible(fabPkm) || isFabVisible(fabRecipe) || isFabVisible(fabLadder)) {
            btn.classList.add('has-filter-fab');
          } else {
            btn.classList.remove('has-filter-fab');
          }
        }
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          window.scrollTo(0, 0);
        }
        if (document.documentElement) {
          try { document.documentElement.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) {}
        }
        if (document.body) {
          try { document.body.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) {}
        }
      });

      let backToTopRafId = null;
      function requestUpdateBackToTopVisibility() {
        if (backToTopRafId) return;
        backToTopRafId = (typeof requestAnimationFrame === 'function')
          ? requestAnimationFrame(() => {
              backToTopRafId = null;
              updateBackToTopVisibility();
            })
          : setTimeout(() => {
              backToTopRafId = null;
              updateBackToTopVisibility();
            }, 16);
      }

      window.addEventListener('scroll', requestUpdateBackToTopVisibility, { passive: true });
      window.addEventListener('resize', requestUpdateBackToTopVisibility, { passive: true });

      window.updateBackToTopVisibility = updateBackToTopVisibility;
      PokemonApp.updateBackToTopVisibility = updateBackToTopVisibility;
      updateBackToTopVisibility();
    }

    // 原生 App 風格下拉刷新指示器 (Native App Pull-to-Refresh Controller)
    function initPullToRefresh() {
      if (typeof document === 'undefined') return;
      let ptrEl = document.getElementById('pull-to-refresh-indicator');
      if (!ptrEl) {
        ptrEl = document.createElement('div');
        ptrEl.id = 'pull-to-refresh-indicator';
        ptrEl.className = 'ptr-indicator';
        ptrEl.setAttribute('aria-hidden', 'true');
        ptrEl.innerHTML = `
          <div class="ptr-inner">
            <svg class="ptr-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6"></path>
              <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
          </div>
        `;
        if (document.body) {
          document.body.appendChild(ptrEl);
        }
      }

      let touchStartY = 0;
      let touchStartX = 0;
      let isTracking = false;
      let isRefreshing = false;
      let currentPull = 0;
      const PULL_THRESHOLD = 64;
      const MAX_PULL = 84;

      function getActiveScrollTop() {
        const winScroll = window.pageYOffset || (document.documentElement ? document.documentElement.scrollTop : 0) || (document.body ? document.body.scrollTop : 0) || 0;
        if (winScroll > 0) return winScroll;

        // 若當前在特定 tab 且內部表格/容器有滾動，檢查該滾動容器
        const activeTableContainer = document.querySelector('.mobile-h5-app.pokemon-active .pokemon-table-container, .mobile-h5-app.pokemon-active .table-container');
        if (activeTableContainer && activeTableContainer.scrollTop > 0) {
          return activeTableContainer.scrollTop;
        }

        const activePanel = document.querySelector('.mobile-h5-app .view-panel:not([style*="display: none"]):not([style*="display:none"])');
        if (activePanel && activePanel.scrollTop > 0) {
          return activePanel.scrollTop;
        }
        return 0;
      }

      function updatePtrUI(dist) {
        if (!ptrEl) return;
        if (dist <= 0) {
          ptrEl.style.transform = 'translate(-50%, -64px)';
          ptrEl.style.opacity = '0';
          ptrEl.classList.remove('ptr-active');
          const icon = ptrEl.querySelector('.ptr-icon');
          if (icon) icon.style.transform = 'rotate(0deg)';
          return;
        }

        ptrEl.classList.add('ptr-active');
        const progress = Math.min(1, dist / PULL_THRESHOLD);
        ptrEl.style.opacity = `${Math.min(1, progress * 1.3)}`;
        ptrEl.style.transform = `translate(-50%, ${dist - 44}px) scale(${0.72 + progress * 0.28})`;
        const icon = ptrEl.querySelector('.ptr-icon');
        if (icon) {
          icon.style.transform = `rotate(${progress * 280}deg)`;
        }
      }

      function isModalOrDrawerActive() {
        if (typeof document === 'undefined') return false;
        if (document.body && document.body.classList) {
          if (document.body.classList.contains('overlay-open') || document.body.classList.contains('modal-open') || document.body.classList.contains('pokedex-modal-open')) {
            return true;
          }
        }
        if (typeof window.isAnyOverlayOpen === 'function' && window.isAnyOverlayOpen()) return true;
        const pokedexModal = document.getElementById('pokedex-detail-modal');
        if (pokedexModal && (pokedexModal.style.display === 'flex' || pokedexModal.style.display === 'block')) {
          return true;
        }
        const activeModal = document.querySelector('.sidebar-backdrop.active, .modal-overlay.active, .subskill-sheet-modal.active, .appraisal-modal-overlay.active, .appraisal-modal-backdrop, .pokedex-modal-backdrop:not([style*="display: none"]):not([style*="display:none"]), #settings-modal:not([style*="display: none"]):not([style*="display:none"]), #box-edit-modal:not([style*="display: none"]):not([style*="display:none"]), #ladder-recipe-modal:not([style*="display: none"]):not([style*="display:none"]), #box-guide-lightbox-modal:not([style*="display: none"]):not([style*="display:none"])');
        if (activeModal) return true;
        if (document.querySelector('#pokemon-filter-sidebar:not(.collapsed), #recipe-filter-sidebar:not(.collapsed), #ladder-filter-sidebar:not(.collapsed), .ladder-fixed-sidebar:not(.collapsed)')) return true;
        return false;
      }

      document.addEventListener('touchstart', (e) => {
        if (isRefreshing || !e.touches || !e.touches[0]) return;
        if (isModalOrDrawerActive()) {
          isTracking = false;
          touchStartY = e.touches[0].clientY;
          touchStartX = e.touches[0].clientX;
          return;
        }
        // 嚴格判定：只有在最頂部時才允許判斷觸發下拉刷新
        if (getActiveScrollTop() > 2) {
          isTracking = false;
          return;
        }

        // 避免在開啟的側邊欄、彈窗、懸浮按鈕或導覽列內誤觸發全頁下拉刷新
        const target = e.target;
        if (target && target.closest && target.closest(
          '.sidebar-bookmark-handle, .sidebar-fab-btn, .box-fab-container, .box-fab-btn, ' +
          '.bottom-dock, .mobile-bottom-dock, .bottom-dock-nav, .dock-item, ' +
          '.app-header, .mobile-app-header, ' +
          '#pokedex-detail-modal, .pokedex-modal-backdrop, .pokedex-modal-dialog, .pokedex-modal-body, ' +
          '.pokemon-filter-sidebar, .recipe-filter-sidebar, .box-filter-sidebar, .ladder-fixed-sidebar, ' +
          '.sidebar-backdrop, .modal-overlay, .subskill-sheet-modal, .appraisal-modal-overlay, .appraisal-modal-backdrop, ' +
          '#settings-modal, #box-edit-modal, #box-delete-confirm-modal, #ladder-recipe-modal, #box-guide-lightbox-modal, .box-guide-lightbox-backdrop'
        )) {
          isTracking = false;
          return;
        }

        isTracking = true;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        currentPull = 0;
        ptrEl.classList.remove('ptr-refreshing');
        ptrEl.style.transition = 'none';
      }, { passive: true });

      document.addEventListener('touchmove', (e) => {
        if (!isTracking || isRefreshing || !e.touches || !e.touches[0]) return;
        const targetEl = e.target;
        if (targetEl && targetEl.closest && targetEl.closest(
          '.sidebar-bookmark-handle, .sidebar-fab-btn, .box-fab-container, .box-fab-btn, ' +
          '.bottom-dock, .mobile-bottom-dock, .bottom-dock-nav, .dock-item, ' +
          '.app-header, .mobile-app-header'
        )) {
          isTracking = false;
          if (currentPull > 0) {
            currentPull = 0;
            updatePtrUI(0);
          }
          return;
        }
        if (isModalOrDrawerActive()) {
          isTracking = false;
          if (currentPull > 0) {
            currentPull = 0;
            updatePtrUI(0);
          }
          const t = e.target;
          const scrollable = t && t.closest ? t.closest('.sidebar-scrollable-content, .pokedex-modal-body, .box-modal-body, .settings-modal-body, .ladder-recipe-modal-body, .appraisal-modal-body, .box-guide-lightbox-dialog') : null;
          if (!scrollable || scrollable.scrollTop <= 0) {
            if (e.touches[0].clientY > touchStartY && e.cancelable) {
              e.preventDefault();
            }
          }
          return;
        }
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = currentY - touchStartY;
        const deltaX = currentX - touchStartX;

        // 若為向上滑動或橫向左右滑動，立即取消並還原
        if (deltaY <= 0 || Math.abs(deltaX) > deltaY) {
          if (currentPull > 0) {
            currentPull = 0;
            updatePtrUI(0);
          }
          return;
        }

        // 再次確認是否仍在最頂部
        if (getActiveScrollTop() > 2) {
          isTracking = false;
          currentPull = 0;
          updatePtrUI(0);
          return;
        }

        // 阻尼係數計算下拉位移
        currentPull = Math.min(MAX_PULL, Math.pow(deltaY, 0.8) * 1.8);
        updatePtrUI(currentPull);
      }, { passive: false });

      document.addEventListener('touchend', () => {
        if (!isTracking || isRefreshing) return;
        isTracking = false;

        if (currentPull >= PULL_THRESHOLD) {
          // 達到下拉刷新閥值：鎖定展示旋轉動畫並執行刷新
          isRefreshing = true;
          ptrEl.classList.add('ptr-refreshing');
          ptrEl.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
          ptrEl.style.transform = `translate(-50%, ${PULL_THRESHOLD - 36}px)`;

          setTimeout(() => {
            try {
              window.location.reload();
            } catch (err) {
              window.location.href = window.location.href;
            }
          }, 550);
        } else {
          // 未達閥值：平滑彈回頂部隱藏
          ptrEl.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
          updatePtrUI(0);
        }
        currentPull = 0;
      }, { passive: true });

      window.initPullToRefresh = initPullToRefresh;
      PokemonApp.initPullToRefresh = initPullToRefresh;
    }

    initSkillTooltips();
    initBackToTop();
    initPullToRefresh();
    PokemonApp.initBackToTop = initBackToTop;
    PokemonApp.initPullToRefresh = initPullToRefresh;
  });
}

/* ═════════════════════════════════════════════════════════════════════════
   圖鑑寶可夢懸浮窗：自訂副技能評測、六維強度評分與食材加成算法展示
   (Pokédex Detail & Appraisal Modal with Real-time Ingredient Breakdown)
   ═════════════════════════════════════════════════════════════════════════ */

const POKEDEX_MODAL_NATURES = [
  { name: '坦率', name_en: 'Hardy', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '孤僻', name_en: 'Lonely', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'speed', debuffType: 'energy' },
  { name: '勇敢', name_en: 'Brave', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'speed', debuffType: 'exp' },
  { name: '固執', name_en: 'Adamant', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'speed', debuffType: 'ingredient' },
  { name: '頑皮', name_en: 'Naughty', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'speed', debuffType: 'skill' },
  { name: '大膽', name_en: 'Bold', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'energy', debuffType: 'speed' },
  { name: '淘氣', name_en: 'Impish', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'energy', debuffType: 'ingredient' },
  { name: '樂天', name_en: 'Lax', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'energy', debuffType: 'skill' },
  { name: '內斂', name_en: 'Modest', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'ingredient', debuffType: 'speed' },
  { name: '慢吞吞', name_en: 'Mild', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'ingredient', debuffType: 'energy' },
  { name: '冷靜', name_en: 'Quiet', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'ingredient', debuffType: 'exp' },
  { name: '馬虎', name_en: 'Rash', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'ingredient', debuffType: 'skill' },
  { name: '溫和', name_en: 'Calm', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'skill', debuffType: 'speed' },
  { name: '溫燥', name_en: 'Gentle', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'skill', debuffType: 'energy' },
  { name: '慎重', name_en: 'Careful', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'skill', debuffType: 'ingredient' },
  { name: '浮躁', name_en: 'Sassy', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'skill', debuffType: 'exp' },
  { name: '膽小', name_en: 'Timid', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'exp', debuffType: 'speed' },
  { name: '爽朗', name_en: 'Jolly', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'exp', debuffType: 'ingredient' },
  { name: '急躁', name_en: 'Hasty', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'exp', debuffType: 'energy' },
  { name: '天真', name_en: 'Naive', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'exp', debuffType: 'skill' },
  { name: '害羞', name_en: 'Bashful', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '認真', name_en: 'Docile', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '勤奮', name_en: 'Serious', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '沉著', name_en: 'Quirky', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' }
];

const POKEDEX_MODAL_SUBSKILLS = [
  // 金色技能 (Tier 1 Gold)
  { name: '樹果數量S', name_en: 'Berry Finding S', tier: 'gold', desc: '幫忙時發現的樹果數量增加1個' },
  { name: '幫手獎勵', name_en: 'Helping Bonus', tier: 'gold', desc: '隊伍全員的幫忙時間縮短5%' },
  { name: '睡眠EXP獎勵', name_en: 'Sleep EXP Bonus', tier: 'gold', desc: '睡眠研究獲得的EXP提升14%' },
  { name: '活力回復獎勵', name_en: 'Energy Recovery Bonus', tier: 'gold', desc: '隊伍全員睡眠活力回復量提升14%' },
  { name: '夢之碎片獎勵', name_en: 'Dream Shard Bonus', tier: 'gold', desc: '睡眠研究獲得的夢之碎片增加6%' },
  { name: '研究EXP獎勵', name_en: 'Research EXP Bonus', tier: 'gold', desc: '睡眠研究獲得的研究EXP增加6%' },
  { name: '技能等級提升M', name_en: 'Skill Level Up M', tier: 'gold', desc: '主技能等級提升2級' },
  // 藍色技能 (Tier 2 Silver/Blue)
  { name: '幫忙速度M', name_en: 'Helping Speed M', tier: 'blue', desc: '幫忙時間縮短14%' },
  { name: '食材機率提升M', name_en: 'Ingredient Finder M', tier: 'blue', desc: '發現食材的機率大幅提升 (+36%)' },
  { name: '技能機率提升M', name_en: 'Skill Trigger M', tier: 'blue', desc: '發動主技能的機率大幅提升' },
  { name: '技能等級提升S', name_en: 'Skill Level Up S', tier: 'blue', desc: '主技能等級提升1級' },
  { name: '持有上限提升L', name_en: 'Inventory Up L', tier: 'blue', desc: '最大持有數量增加18' },
  { name: '持有上限提升M', name_en: 'Inventory Up M', tier: 'blue', desc: '最大持有數量增加12' },
  // 白色技能 (Tier 3 White)
  { name: '幫忙速度S', name_en: 'Helping Speed S', tier: 'white', desc: '幫忙時間縮短7%' },
  { name: '食材機率提升S', name_en: 'Ingredient Finder S', tier: 'white', desc: '發現食材的機率小幅提升 (+18%)' },
  { name: '技能機率提升S', name_en: 'Skill Trigger S', tier: 'white', desc: '發動主技能的機率小幅提升' },
  { name: '持有上限提升S', name_en: 'Inventory Up S', tier: 'white', desc: '最大持有數量增加6' },
  { name: '活力回復提升S', name_en: 'Energy Recovery Up S', tier: 'white', desc: '自身的活力回復量提升' }
];

let pokedexModalState = {
  pkmId: null,
  pkm: null,
  level: 30,
  nature: '坦率',
  subskills: ['', '', '', '', ''],
  skillLevel: 1,
  ribbon: 0,
  ingSlots: [0, 0, 0] // 0, 1, 2 indices in pkm.ingredients
};
let pokedexActiveSubskillSlot = 1;
let pokedexSubskillPaletteExpanded = false;
