  function renderWikiLayout(container) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
    const isLadderOpen = typeof window.getSidebarSavedState === 'function' ? window.getSidebarSavedState('pksleep_ladder_sidebar_open', true) : true;
    const initialLadderCollapsed = isMobileH5 ? 'collapsed' : (isLadderOpen ? '' : 'collapsed');
    const isSkillLadderOpen = typeof window.getSidebarSavedState === 'function' ? window.getSidebarSavedState('pksleep_skill_ladder_sidebar_open', true) : true;
    const initialSkillLadderCollapsed = isMobileH5 ? 'collapsed' : (isSkillLadderOpen ? '' : 'collapsed');
    const isWikiMainActive = !!(container && (
      (container.style && container.style.display !== 'none' && !container.hidden) ||
      (typeof document !== 'undefined' && document.getElementById && document.getElementById('tab-wiki') && document.getElementById('tab-wiki').classList && document.getElementById('tab-wiki').classList.contains('active')) ||
      (!container.style && (!document.getElementById || !document.getElementById('tab-wiki')))
    ));
    const gameCfg = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
                    (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
    const caps = (typeof _getWikiCaps === 'function') ? _getWikiCaps() : (gameCfg && typeof gameCfg.getCaps === 'function' ? gameCfg.getCaps() : { POKEMON_LEVEL_CAP: 70, THEORETICAL_MAX_LEVEL: 100 });
    const sleepExpTargetLevels = (gameCfg && typeof gameCfg.getSleepExpTargetLevels === 'function')
      ? gameCfg.getSleepExpTargetLevels()
      : Array.from(new Set([30, 50, 60, caps.POKEMON_LEVEL_CAP, 80, caps.THEORETICAL_MAX_LEVEL].filter(Boolean))).sort((a, b) => a - b);

    container.innerHTML = `
      <!-- 天梯頂級料理食材高亮懸浮按鈕 (FAB) -->
      <button type="button" id="ladder-recipe-highlight-fab" class="ladder-recipe-highlight-fab ${ladderHighlightRecipe ? 'has-active' : ''}" onclick="window.WikiDB.openLadderRecipeModal()" title="${_tWiki('選取料理高亮食材', 'Highlight by Top Recipe')}" aria-label="${_tWiki('選取料理高亮食材', 'Highlight by Top Recipe')}" style="${(isWikiMainActive && currentWikiSubTab === 'ingredients') ? 'display:flex;' : 'display:none;'}">
        <span class="recipe-fab-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 11h18a1 1 0 0 1 1 1v2a7 7 0 0 1-14 0v-2"></path>
            <path d="M7 11V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5"></path>
            <line x1="12" y1="2" x2="12" y2="4"></line>
          </svg>
        </span>
        <span id="ladder-recipe-fab-badge" class="ladder-recipe-fab-badge" style="${ladderHighlightRecipe ? 'display:flex;' : 'display:none;'}">✓</span>
      </button>

      <!-- 天梯頂級料理食材高亮彈窗 (Modal) -->
      <div id="ladder-recipe-modal" class="ladder-recipe-modal" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="ladder-recipe-modal-title">
        <div class="ladder-recipe-modal-backdrop" onclick="window.WikiDB.closeLadderRecipeModal()"></div>
        <div class="ladder-recipe-modal-dialog">
          <div class="ladder-recipe-modal-header">
            <div class="ladder-recipe-modal-title-group">
              <div class="ladder-recipe-modal-title-row">
                <h3 id="ladder-recipe-modal-title" class="ladder-recipe-modal-title">${_tWiki('選取料理高亮食材', 'Highlight Ingredients by Recipe')}</h3>
                <label class="ladder-multi-select-label" for="ladder-recipe-multi-toggle">
                  <span class="ladder-multi-select-text">${_tWiki('多選', 'Multi')}</span>
                  <div class="sidebar-switch-wrapper">
                    <input type="checkbox" id="ladder-recipe-multi-toggle" class="switch-checkbox" ${ladderRecipeMultiSelect ? 'checked' : ''} onchange="window.WikiDB.toggleLadderRecipeMultiSelect(this.checked)">
                    <span class="switch-slider"></span>
                  </div>
                </label>
              </div>
              <p class="ladder-recipe-modal-subtitle">${_tWiki('各前10高分料理，標記所需食材', 'Top 10 High Score Recipes, Mark Ingredients')}</p>
            </div>
            <div class="ladder-recipe-modal-actions">
              <button type="button" class="ladder-recipe-header-clear-btn" onclick="window.WikiDB.clearLadderHighlightRecipe()" title="${_tWiki('清除選取', 'Clear Selection')}">${_tWiki('清除', 'Clear')}</button>
              <button type="button" class="ladder-recipe-modal-close" onclick="window.WikiDB.closeLadderRecipeModal()" aria-label="${_tWiki('關閉', 'Close')}">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="ladder-recipe-cat-bar">
            <!-- Dynamically populated on open -->
          </div>
          <div class="ladder-recipe-modal-body">
            <!-- Dynamically populated on open -->
          </div>
        </div>
      </div>

      ${isMobileH5 ? `
        <!-- 右下懸浮天梯篩選按鈕 (與圖鑑/料理完全一致的 FAB 結構) -->
        <button type="button" id="ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle sidebar-fab-btn ${currentWikiSubTab === 'ingredients' ? '' : 'drawer-open'}" onclick="window.WikiDB.openLadderSidebar()" title="${_tWiki('展開天梯篩選器', 'Filter')}" aria-label="${_tWiki('展開天梯篩選器', 'Filter')}" style="${currentWikiSubTab === 'ingredients' ? 'display:flex;' : 'display:none;'}">
          <span class="bookmark-icon">
            <svg class="fab-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </span>
          <span id="ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
        </button>

        ${typeof renderSkillLadderMobileHandle === 'function' ? renderSkillLadderMobileHandle(currentWikiSubTab, isEN) : ''}
      ` : ''}

      <!-- 天梯專屬側邊篩選器 (Mobile: 抽屜式 / Desktop: 左側滑動) -->
      <aside id="ladder-filter-sidebar" class="pokemon-filter-sidebar ladder-fixed-sidebar ${initialLadderCollapsed}" style="${currentWikiSubTab === 'ingredients' ? 'display:flex;' : 'display:none;'}" aria-label="${_tWiki('篩選器', 'Filter')}">
        ${!isMobileH5 ? `
          <!-- 側邊欄垂直中央書籤標籤 (Desktop: 抽屜把手，展開時自動隱藏，收合時展示) -->
          <button type="button" id="ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle" onclick="window.WikiDB.toggleLadderSidebar(true)" title="${_tWiki('展開天梯篩選側邊欄', 'Expand Filter')}" aria-label="${_tWiki('展開天梯篩選側邊欄', 'Expand Filter')}">
            <span class="bookmark-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
            </span>
            <span class="bookmark-text">${_tWiki('篩選', 'Filter')}</span>
            <span class="bookmark-arrow">◀</span>
            <span id="ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
          </button>
        ` : ''}

        <div class="sidebar-header">
          <button type="button" id="ladder-sidebar-close-btn" class="sidebar-close-btn" onclick="window.WikiDB.toggleLadderSidebar(false)" title="${_tWiki('收合側邊欄', 'Collapse Filter')}" aria-label="${_tWiki('收合側邊欄', 'Collapse Filter')}">◀</button>
          <div class="sidebar-title-group" style="display:flex;align-items:center;gap:6px;">
            <span class="sidebar-title">${_tWiki('篩選器', 'Filter')}</span>
            <button type="button" class="pokedex-formula-help-btn ladder-formula-help-btn" onclick="window.WikiDB.toggleLadderEnergyHelp(event)" title="${_tWiki('基準：Lv.60 滿活力 (0.45x)', 'Baseline: Lv.60 Ideal Energy (0.45x)')}" aria-label="Ladder Energy Info">?</button>
          </div>
          <button type="button" id="ladder-reset-all-btn" class="sidebar-reset-btn" onclick="window.WikiDB.resetLadderFilters()" title="${_tWiki('重設所有條件', 'Reset Filters')}">${_tWiki('重設', 'Reset')}</button>

          <!-- 天梯基準滿活力浮窗 (Toast-style Popover) -->
          <div id="ladder-energy-help-popover" class="ladder-energy-help-popover" style="display:none;" role="tooltip">
            <div class="pokedex-energy-help-backdrop" onclick="window.WikiDB.closeLadderEnergyHelp(event)"></div>
            <div class="pokedex-energy-help-bubble ladder-energy-help-bubble">
              <div class="energy-help-title font-bold">${_tWiki('天梯基準：Lv.60 滿活力', 'Baseline: Lv.60 Ideal Energy')}</div>
              <div class="energy-help-body">
                ${_tWiki(
                  '以 Lv.60 滿活力理想狀態 (活力 ≥ 80%，間隔 0.45x) 試算單日產能。',
                  'Calculated at Lv.60 under ideal energy (≥80%, 0.45x interval) for daily yield.'
                )}
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-scrollable-content">
          <!-- 1. 搜尋寶可夢 -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tWiki('搜尋寶可夢', 'Search Pokémon')}</span>
              <button type="button" id="ladder-search-clear-btn" class="sidebar-section-clear-btn" style="${ladderSearchQuery ? 'display:inline-block;' : 'display:none;'}" onclick="window.WikiDB.clearLadderSearch()">${_tWiki('清空', 'Clear')}</button>
            </div>
            <div class="sidebar-search-box" style="margin-top: 4px;">
              <span class="sidebar-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"></circle>
                  <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                </svg>
              </span>
              <input type="text" id="ladder-pkm-search-input" class="sidebar-search-input" placeholder="${_tWiki('搜尋寶可夢名稱...', 'Search Pokémon...')}" value="${ladderSearchQuery}" oninput="window.WikiDB.onLadderSearch(this.value)">
            </div>
          </div>

          <!-- 2. 天梯軌道排序 (Track Sorting) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tWiki('天梯軌道排序', 'Track Sorting')}</span>
              <label class="ladder-top15-switch-label" title="${_tWiki('預設開啟前15名排行', 'Show Top 15 Only')}">
                <input type="checkbox" id="ladder-top15-switch" class="ladder-switch-input" ${ladderTop15Only ? 'checked' : ''} onchange="window.WikiDB.toggleLadderTop15(this.checked)">
                <span class="ladder-switch-slider"></span>
                <span class="ladder-switch-text">${_tWiki('前15名', 'Top 15')}</span>
              </label>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${ladderSortOrder === 'ENERGY_ASC' ? 'active' : ''}" data-sort-order="ENERGY_ASC" onclick="window.WikiDB.setLadderSortOrder('ENERGY_ASC')">${_tWiki('能量：低到高', 'Energy: Asc')}</button>
              <button type="button" class="tag-btn ${ladderSortOrder === 'ENERGY_DESC' ? 'active' : ''}" data-sort-order="ENERGY_DESC" onclick="window.WikiDB.setLadderSortOrder('ENERGY_DESC')">${_tWiki('能量：高到低', 'Energy: Desc')}</button>
              <button type="button" class="tag-btn ${ladderSortOrder === 'YIELD_DESC' ? 'active' : ''}" data-sort-order="YIELD_DESC" onclick="window.WikiDB.setLadderSortOrder('YIELD_DESC')">${_tWiki('產量：多到少', 'Yield: Desc')}</button>
              <button type="button" class="tag-btn ${ladderSortOrder === 'DEMAND_DESC' ? 'active' : ''}" data-sort-order="DEMAND_DESC" onclick="window.WikiDB.setLadderSortOrder('DEMAND_DESC')">${_tWiki('大菜需求：多到少', 'Demand: Desc')}</button>
            </div>
          </div>

          <!-- 3. 產量與供餐梯隊 (Supply Tier) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tWiki('產量供餐梯隊', 'Supply Tier')}</span>
              <label class="ladder-top15-switch-label" title="${_tWiki('僅顯示最終進化（稀有食材不足 2 種時自動補入未進化）', 'Show Final Evolution Only (rare ingredients <2 final evos auto-include pre-evos)')}">
                <input type="checkbox" id="ladder-final-only-switch" class="ladder-switch-input" ${(typeof getLadderFinalOnly === 'function' ? getLadderFinalOnly() : true) ? 'checked' : ''} onchange="window.WikiDB.toggleLadderFinalOnly(this.checked)">
                <span class="ladder-switch-slider"></span>
                <span class="ladder-switch-text">${_tWiki('最終進化', 'Final Evo')}</span>
              </label>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'ALL' ? 'active' : ''}" data-supply-filter="ALL" onclick="window.WikiDB.setLadderSupplyFilter('ALL')">${_tWiki('全部', 'All')}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'TOP' ? 'active' : ''}" data-supply-filter="TOP" onclick="window.WikiDB.setLadderSupplyFilter('TOP')">${_tWiki('前五名', 'Top 5')}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'MEALS_3' ? 'active' : ''}" data-supply-filter="MEALS_3" onclick="window.WikiDB.setLadderSupplyFilter('MEALS_3')">${_tWiki('滿載 3 餐', '3 Meals')}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'MEALS_2' ? 'active' : ''}" data-supply-filter="MEALS_2" onclick="window.WikiDB.setLadderSupplyFilter('MEALS_2')">${_tWiki('充足 2 餐', '2 Meals')}</button>
            </div>
          </div>

          <!-- 4. 食材組合型態 (Recipe Structure) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tWiki('食材組合型態', 'Recipe Structure')}</span>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'ALL' ? 'active' : ''}" data-recipe-filter="ALL" onclick="window.WikiDB.setLadderRecipeFilter('ALL')">${_tWiki('全部', 'All')}</button>
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'AAA' ? 'active' : ''}" data-recipe-filter="AAA" onclick="window.WikiDB.setLadderRecipeFilter('AAA')">${_tWiki('純種 AAA', 'Pure AAA')}</button>
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'ABB' ? 'active' : ''}" data-recipe-filter="ABB" onclick="window.WikiDB.setLadderRecipeFilter('ABB')">${_tWiki('雙食材 ABB', 'Dual ABB')}</button>
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'AXX' ? 'active' : ''}" data-recipe-filter="AXX" onclick="window.WikiDB.setLadderRecipeFilter('AXX')">${_tWiki('混搭 AXX', 'Mix AXX')}</button>
            </div>
          </div>

          <!-- 5. 寶可夢專長分類 (Specialty Type) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tWiki('寶可夢專長', 'Specialty Type')}</span>
              <div class="ladder-switch-with-help">
                <label class="ladder-top15-switch-label" title="${_tWiki('所有專長皆以 1.0 倍發動機率為基準\n請用技能機率M/S與技能機率▲模擬補正', 'All specialties use a 1.0x trigger baseline\nUse Skill Trigger M/S and Skill Chance ▲ to simulate boosts')}">
                  <input type="checkbox" id="ladder-skill-draw-toggle" class="ladder-switch-input" ${isLadderSkillDrawExpected ? 'checked' : ''} onchange="window.WikiDB.toggleLadderSkillDrawExpected(this.checked)">
                  <span class="ladder-switch-slider"></span>
                  <span class="ladder-switch-text">${_tWiki('食材精選', 'Ingr. Draw')}</span>
                </label>
                <button type="button" class="ladder-help-icon-btn" onclick="window.WikiDB.openSkillDrawHelpModal(event)" title="${_tWiki('所有專長皆以 1.0 倍發動機率為基準\n請用技能機率M/S與技能機率▲模擬補正', 'All specialties use a 1.0x trigger baseline\nUse Skill Trigger M/S and Skill Chance ▲ to simulate boosts')}" aria-label="${_tWiki('技能說明', 'Skill Help')}">?</button>
                <!-- 食材精選S 說明提示框 (點選?展示，格式與樣式與網頁版本滑鼠懸停框一致) -->
                <div id="ladder-skill-help-modal" class="ladder-skill-tooltip-popover" style="display:none;" role="tooltip">
                  <div class="ladder-skill-tooltip-backdrop" onclick="window.WikiDB.closeSkillDrawHelpModal()"></div>
                  <div class="ladder-skill-tooltip-bubble">
                    <div class="ladder-skill-tooltip-line">${_tWiki('所有專長皆以 1.0 倍發動機率為基準', 'All specialties use a 1.0x trigger baseline')}</div>
                    <div class="ladder-skill-tooltip-line">${_tWiki('請用技能機率M/S與技能機率▲模擬補正', 'Use Skill Trigger M/S and Skill Chance ▲ to simulate boosts')}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'ALL' ? 'active' : ''}" data-specialty-filter="ALL" onclick="window.WikiDB.setLadderSpecialtyFilter('ALL')">${_tWiki('全部', 'All')}</button>
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'INGREDIENT' ? 'active' : ''}" data-specialty-filter="INGREDIENT" onclick="window.WikiDB.setLadderSpecialtyFilter('INGREDIENT')">${_tWiki('食材型', 'Ingredient')}</button>
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'BERRY' ? 'active' : ''}" data-specialty-filter="BERRY" onclick="window.WikiDB.setLadderSpecialtyFilter('BERRY')">${_tWiki('樹果型', 'Berry')}</button>
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'SKILL' ? 'active' : ''}" data-specialty-filter="SKILL" onclick="window.WikiDB.setLadderSpecialtyFilter('SKILL')">${_tWiki('技能型', 'Skill')}</button>
            </div>
          </div>


          <!-- 6. 副技能補正模擬 (Sub-Skill Boost Simulation) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tWiki('副技能補正模擬', 'Sub-Skills')}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${isLadderIngM ? 'active' : ''}" id="ladder-ing-m-toggle" data-subskill-boost="ING_M" onclick="window.WikiDB.toggleLadderSubskill('ING_M')">${_tWiki('食材機率M', 'Ing Finder M')}</button>
              <button type="button" class="tag-btn ${isLadderIngS ? 'active' : ''}" id="ladder-ing-s-toggle" data-subskill-boost="ING_S" onclick="window.WikiDB.toggleLadderSubskill('ING_S')">${_tWiki('食材機率S', 'Ing Finder S')}</button>
              <button type="button" class="tag-btn ${isLadderSpeedM ? 'active' : ''}" id="ladder-speed-m-toggle" data-subskill-boost="SPEED_M" onclick="window.WikiDB.toggleLadderSubskill('SPEED_M')">${_tWiki('幫忙速度M', 'Speed M')}</button>
              <button type="button" class="tag-btn ${isLadderSpeedS ? 'active' : ''}" id="ladder-speed-s-toggle" data-subskill-boost="SPEED_S" onclick="window.WikiDB.toggleLadderSubskill('SPEED_S')">${_tWiki('幫忙速度S', 'Speed S')}</button>
              <button type="button" class="tag-btn ${isLadderSkillM ? 'active' : ''}" id="ladder-skill-m-toggle" data-subskill-boost="SKILL_M" onclick="window.WikiDB.toggleLadderSubskill('SKILL_M')">${_tWiki('技能機率M', 'Skill M')}</button>
              <button type="button" class="tag-btn ${isLadderSkillS ? 'active' : ''}" id="ladder-skill-s-toggle" data-subskill-boost="SKILL_S" onclick="window.WikiDB.toggleLadderSubskill('SKILL_S')">${_tWiki('技能機率S', 'Skill S')}</button>
            </div>
          </div>

          <!-- 7. 性格補正模擬 (Nature Boost Simulation - 單選) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tWiki('性格補正模擬', 'Nature Boost')}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${ladderNatureIng ? 'active' : ''}" data-nature-filter="ING" onclick="window.WikiDB.toggleLadderNatureFilter('ING')">${_tWiki('食材機率▲', 'Ing Rate ▲')}</button>
              <button type="button" class="tag-btn ${ladderNatureSpeed ? 'active' : ''}" data-nature-filter="SPEED" onclick="window.WikiDB.toggleLadderNatureFilter('SPEED')">${_tWiki('幫忙速度▲', 'Speed ▲')}</button>
              <button type="button" class="tag-btn ${ladderNatureSkill ? 'active' : ''}" data-nature-filter="SKILL" onclick="window.WikiDB.toggleLadderNatureFilter('SKILL')">${_tWiki('技能機率▲', 'Skill ▲')}</button>
            </div>
          </div>
        </div>
      </aside>

      ${typeof renderSkillLadderSidebar === 'function' ? renderSkillLadderSidebar(initialSkillLadderCollapsed, isEN, currentWikiSubTab) : ''}

      <div class="wiki-main-container">
        <!-- 二級子分頁導航 (Sub-tabs) - 精簡無大標題橫幅 -->
        <div class="wiki-subnav-bar">
          <div class="wiki-subnav-tabs" role="tablist">
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'skills' ? 'active' : ''}" data-subtab="skills" onclick="window.WikiDB.switchSubTab('skills')">${isMobileH5 ? _tWiki('主技能', 'Skills') : _tWiki('主技能數值庫', 'Main Skills')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'subskills' ? 'active' : ''}" data-subtab="subskills" onclick="window.WikiDB.switchSubTab('subskills')">${isMobileH5 ? _tWiki('副技性格', 'Subskills') : _tWiki('副技能與性格指南', 'Sub-Skills')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'ingredients' ? 'active' : ''}" data-subtab="ingredients" onclick="window.WikiDB.switchSubTab('ingredients')">${isMobileH5 ? _tWiki('食材天梯', 'Ing. Ladder') : _tWiki('食材產量天梯榜', 'Ing. Ladder')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'skills_ladder' ? 'active' : ''}" data-subtab="skills_ladder" onclick="window.WikiDB.switchSubTab('skills_ladder')">${isMobileH5 ? _tWiki('技能天梯', 'Skill Ladder') : _tWiki('主技能天梯榜', 'Skill Ladder')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'values' ? 'active' : ''}" data-subtab="values" onclick="window.WikiDB.switchSubTab('values')">${isMobileH5 ? _tWiki('能量速查', 'Values') : _tWiki('樹果與食材能量', 'Berry & Ings')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'ratings' ? 'active' : ''}" data-subtab="ratings" onclick="window.WikiDB.switchSubTab('ratings')">${isMobileH5 ? _tWiki('培育指南', 'Guide') : _tWiki('培育與評級指南', 'Guide')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'islands' ? 'active' : ''}" data-subtab="islands" onclick="window.WikiDB.switchSubTab('islands')">${isMobileH5 ? _tWiki('島嶼營地', 'Islands') : _tWiki('島嶼營地與EX模式', 'Camps & EX')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'items' ? 'active' : ''}" data-subtab="items" onclick="window.WikiDB.switchSubTab('items')">${_tWiki('道具百科', 'Items')}</button>
          </div>
        </div>

        <!-- 子分頁 1：主技能數值庫 (Main Skills) -->
        <div id="wiki-subpanel-skills" class="wiki-subpanel ${currentWikiSubTab === 'skills' ? 'active' : ''}" style="${currentWikiSubTab === 'skills' ? '' : 'display:none;'}">
          <div class="wiki-control-bar">
            <div class="wiki-filter-pills">
              <span class="wiki-pill-label">${_tWiki('技能類型：', 'Category:')}</span>
              <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'all' ? 'active' : ''}" data-skill-cat="all" onclick="window.WikiDB.filterSkills('all')">${_tWiki('全部技能', 'All')} (${MAIN_SKILLS_DATA.length})</button>
              <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'energy' ? 'active' : ''}" data-skill-cat="energy" onclick="window.WikiDB.filterSkills('energy')">${_tWiki('能量系', 'Strength')}</button>
              <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'energy_heal' ? 'active' : ''}" data-skill-cat="energy_heal" onclick="window.WikiDB.filterSkills('energy_heal')">${_tWiki('活力系', 'Recovery')}</button>
              <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'ingredient' ? 'active' : ''}" data-skill-cat="ingredient" onclick="window.WikiDB.filterSkills('ingredient')">${_tWiki('食材與料理', 'Ingredients')}</button>
              <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'special' ? 'active' : ''}" data-skill-cat="special" onclick="window.WikiDB.filterSkills('special')">${_tWiki('神獸與特殊專屬', 'Special')}</button>
              <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'shards' ? 'active' : ''}" data-skill-cat="shards" onclick="window.WikiDB.filterSkills('shards')">${_tWiki('夢之碎片', 'Shards')}</button>
            </div>
          </div>

          <div id="wiki-skills-grid" class="wiki-skills-grid">
            ${renderSkillsCards(MAIN_SKILLS_DATA)}
          </div>
        </div>

        <!-- 子分頁 2：副技能與性格指南 (Sub-Skills & Natures) -->
        <div id="wiki-subpanel-subskills" class="wiki-subpanel ${currentWikiSubTab === 'subskills' ? 'active' : ''}" style="${currentWikiSubTab === 'subskills' ? '' : 'display:none;'}">
          <!-- 主技能發動機率矩陣速查表 -->
          <div class="wiki-card wiki-card-trigger-matrix">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${_tWiki('主技能發動機率矩陣', 'Trigger Chance Matrix')}</h3>
            </div>
            <div class="wiki-rule-banner">
              ${_tWiki(
                '<strong>公式</strong>: <code>(1 + 副技能提升%) × 性格倍率 = 最終發動總倍率</code>',
                '<strong>Formula</strong>: <code>(1 + Sub-Skill %) × Nature Multiplier = Final Multiplier</code>'
              )}
            </div>

            <!-- 速查對照表 -->
            <div class="wiki-table-wrapper" style="margin-top: 10px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th style="text-align: center;">${_tWiki('副技能組合', 'Sub-Skills')}</th>
                    <th style="text-align: center;">${_tWiki('性格', 'Nature')}</th>
                    <th class="col-hide-mobile" style="text-align: center;">${_tWiki('乘算計算式', 'Formula')}</th>
                    <th style="text-align: center;">${_tWiki('總倍率', 'Multiplier')}</th>
                    <th class="col-hide-mobile" style="text-align: center;">${_tWiki('發動強度評級', 'Tier')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${TRIGGER_CHANCE_MATRIX.map(row => {
                    const gradeStr = row.grade || '';
                    const tierClass = gradeStr.startsWith('SSS') ? 'tier-sss'
                      : gradeStr.startsWith('SS') ? 'tier-ss'
                      : gradeStr.startsWith('S') ? 'tier-s'
                      : gradeStr.startsWith('A') ? 'tier-a'
                      : gradeStr.startsWith('B') ? 'tier-b'
                      : gradeStr.startsWith('C') ? 'tier-c'
                      : gradeStr.startsWith('D') ? 'tier-d'
                      : gradeStr.startsWith('E') ? 'tier-e'
                      : 'tier-baseline';
                    return `
                    <tr>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 3px; flex-wrap: nowrap; white-space: nowrap;">
                          ${row.subskills && row.subskills.length > 0 
                            ? row.subskills.map(s => {
                                const sName = _tWiki(
                                  s.name.replace('技能機率提升', '機率提升'),
                                  s.name.includes('M') ? 'Trigger M' : 'Trigger S'
                                );
                                return `<span class="wiki-skill-badge skill-badge-${s.color}" style="white-space: nowrap;">${sName}</span>`;
                              }).join('') 
                            : `<span class="text-muted font-bold" style="font-size: 13px;">-</span>`}
                        </div>
                      </td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        ${row.natureBadge === 'up' 
                          ? `<span class="matrix-rate-up">${_tWiki('▲ 上升', '▲ Up')}</span>` 
                          : (row.natureBadge === 'down' 
                            ? `<span class="matrix-rate-down">${_tWiki('▼ 下降', '▼ Down')}</span>` 
                            : `<span class="text-muted font-bold" style="font-size: 13px;" data-symbol="-">-</span>`)}
                      </td>
                      <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><code class="matrix-calc-code">${row.calc}</code></td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        <span class="text-accent font-bold" style="font-size: 13px;">x${row.multiplier.toFixed(3)}</span>
                      </td>
                      <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><span class="wiki-tier-badge ${tierClass}">${_tWiki(row.grade, row.grade_en || row.grade)}</span></td>
                    </tr>
                  `;}).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 幫忙速度極限與計算機制指南 (Helping Speed Limits & Mechanics) -->
          <div class="wiki-card wiki-card-speed-guide" style="margin-top: 20px;">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${_tWiki('幫忙速度極限與計算機制指南', 'Helping Speed Limits & Calculation Mechanics Guide')}</h3>
            </div>
            
            <!-- 幫忙速度核心機制重點說明 (無外框直接展示, 文字極簡化) -->
            <div class="wiki-speed-summary-points">
              <div class="summary-point-line">
                <span class="point-prefix">1.</span>
                <span class="point-title">${_tWiki('副技能上限35%:', 'Sub-Skills 35% Cap:')}</span>
                <span class="point-desc">${_tWiki('副技能合計縮短上限為35%,溢出無效.', 'Combined reduction capped at 35%, excess is ignored.')}</span>
              </div>
              <div class="summary-point-line">
                <span class="point-prefix">2.</span>
                <span class="point-title">${_tWiki('性格獨立乘區:', 'Independent Nature:')}</span>
                <span class="point-desc">${_tWiki('直接與副技能相乘,不受35%上限約束.', 'Multiplies after sub-skills, exempt from 35% cap.')}</span>
              </div>
              <div class="summary-point-line">
                <span class="point-prefix">3.</span>
                <span class="point-title">${_tWiki('產能換算:', 'Output Conversion:')}</span>
                <span class="point-desc">${_tWiki('產能為時間倒數,間隔58.5%等同產能提升70.94%.', 'Output is inverse of time. 58.5% interval equals +70.94% output.')}</span>
              </div>
            </div>

            <!-- 速查對照表 (Quick-Lookup Table) -->
            <div class="wiki-table-wrapper" style="margin-top: 10px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th style="text-align: center;">${_tWiki('副技能組合', 'Sub-Skills')}</th>
                    <th style="text-align: center;">${_tWiki('性格', 'Nature')}</th>
                    <th class="col-hide-mobile" style="text-align: center;">${_tWiki('計算式', 'Formula')}</th>
                    <th style="text-align: center;">${_tWiki('幫忙間隔', 'Interval Ratio')}</th>
                    <th style="text-align: center;">${_tWiki('產能提升', 'Output Boost')}</th>
                    <th class="col-hide-mobile" style="text-align: center;">${_tWiki('強度評級', 'Tier')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${HELPING_SPEED_MATRIX.map(row => {
                    const gradeStr = row.grade || '';
                    const tierClass = gradeStr.startsWith('SSS') ? 'tier-sss'
                      : gradeStr.startsWith('SS') ? 'tier-ss'
                      : gradeStr.startsWith('S') ? 'tier-s'
                      : gradeStr.startsWith('A') ? 'tier-a'
                      : gradeStr.startsWith('B') ? 'tier-b'
                      : gradeStr.startsWith('C') ? 'tier-c'
                      : gradeStr.startsWith('D') ? 'tier-d'
                      : 'tier-baseline';
                    const isBoostPositive = row.outputMultiplier >= 1.0;
                    return `
                    <tr>
                      <td style="vertical-align: middle; text-align: center;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 3px; flex-wrap: wrap;">
                          ${row.subskills && row.subskills.length > 0 
                            ? row.subskills.map(s => {
                                const sName = _tWiki(s.name, s.name_en || s.name);
                                return `<span class="wiki-skill-badge skill-badge-${s.color}" style="white-space: nowrap;">${sName}</span>`;
                              }).join('') 
                            : `<span class="text-muted font-bold" style="font-size: 13px;">-</span>`}
                        </div>
                      </td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        ${row.natureBadge === 'up' 
                          ? `<span class="matrix-rate-up">${_tWiki('▲ 上升', '▲ Up')}</span>` 
                          : (row.natureBadge === 'down' 
                            ? `<span class="matrix-rate-down">${_tWiki('▼ 下降', '▼ Down')}</span>` 
                            : `<span class="text-muted font-bold" style="font-size: 13px;" data-symbol="-">-</span>`)}
                      </td>
                      <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><code class="matrix-calc-code">${row.calc}</code></td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        <span class="font-bold text-accent" style="font-size: 13.5px;">${row.intervalRatio}x</span>
                      </td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        <span class="${isBoostPositive ? 'matrix-pct-up' : 'matrix-pct-down'} font-bold" style="font-size: 13px;">${row.outputBoostDisplay}</span>
                      </td>
                      <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><span class="wiki-tier-badge ${tierClass}">${_tWiki(row.grade, row.grade_en || row.grade)}</span></td>
                    </tr>
                  `;}).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 睡飽飽獎章加成指南 (Good-Night Ribbon Quick Guide) -->
          <div class="wiki-card wiki-card-ribbon-guide" style="margin-top: 16px;">
            <div class="wiki-card-header" style="margin-bottom: 8px;">
              <h3 class="wiki-card-title">${_tWiki('睡飽飽獎章加成指南', 'Good-Night Ribbon Guide')}</h3>
            </div>

            <div class="ribbon-compact-tiers">
              <div class="ribbon-compact-chip chip-bronze">
                <span class="chip-tier-tag" style="display:flex;align-items:center;gap:4px;">
                  <img src="${base}assets/ribbons/ribbon_lv1.png" style="width:18px;height:18px;object-fit:contain;" alt="" />
                  200h
                </span>
                <span class="chip-effect-text">+1 ${_tWiki('持有上限', 'Carry')}</span>
              </div>
              <div class="ribbon-compact-chip chip-silver">
                <span class="chip-tier-tag" style="display:flex;align-items:center;gap:4px;">
                  <img src="${base}assets/ribbons/ribbon_lv2.png" style="width:18px;height:18px;object-fit:contain;" alt="" />
                  500h
                </span>
                <span class="chip-effect-text">+2 ${_tWiki('持有', 'Carry')}, ${_tWiki('幫速', 'Speed')} -5% / -11%</span>
              </div>
              <div class="ribbon-compact-chip chip-gold">
                <span class="chip-tier-tag" style="display:flex;align-items:center;gap:4px;">
                  <img src="${base}assets/ribbons/ribbon_lv3.png" style="width:18px;height:18px;object-fit:contain;" alt="" />
                  1,000h
                </span>
                <span class="chip-effect-text">+3 ${_tWiki('持有上限', 'Carry')}</span>
              </div>
              <div class="ribbon-compact-chip chip-platinum">
                <span class="chip-tier-tag" style="display:flex;align-items:center;gap:4px;">
                  <img src="${base}assets/ribbons/ribbon_lv4.png" style="width:18px;height:18px;object-fit:contain;" alt="" />
                  2,000h
                </span>
                <span class="chip-effect-text">+2 ${_tWiki('持有', 'Carry')}, ${_tWiki('幫速', 'Speed')} -12% / -25%</span>
              </div>
            </div>

            <div class="ribbon-compact-notes">
              <div class="compact-note-line">
                <span class="compact-note-label">${_tWiki('核心規則:', 'Core Rule:')}</span>
                <span class="compact-note-text">${_tWiki('僅未完全進化寶可夢享有幫速縮短(最高 -25%), 與性格/副技能獨立相乘, 不受 35% 上限限制.', 'Speed boost applies only to unevolved Pokemon (up to -25%), compounding independently with Nature & Subskills.')}</span>
              </div>
              <div class="compact-note-line">
                <span class="compact-note-label">${_tWiki('經典案例:', 'Classic Case:')}</span>
                <span class="compact-note-text">${_tWiki('吉利蛋 vs 幸福蛋: 吉利蛋(能再進化 1 次)滿 2000h 幫速縮短 12% 至 <strong>2904 秒</strong>, 反超幸福蛋(3100 秒).', 'Chansey vs Blissey: Chansey (1 evo left, base 3,300s) reaches <strong>2,904s</strong> (-12%) at 2,000h, surpassing Blissey (3,100s).')}</span>
              </div>
            </div>
          </div>

          <!-- 副技能完整階級與數值說明表格 -->
          <div class="wiki-card wiki-card-subskills-overview" style="margin-top: 20px;">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${_tWiki('副技能階級與數值總覽', 'Sub-Skills Overview')}</h3>
            </div>
            <div class="wiki-table-wrapper" style="margin-top: 10px;">
              <table class="wiki-data-table wiki-subskills-table">
                <thead>
                  <tr>
                    <th class="col-subskills-tags" style="text-align: center;">${_tWiki('技能標籤', 'Skills')}</th>
                    <th class="col-subskills-effect">${_tWiki('詳細效果說明', 'Effect')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${SUB_SKILLS_DATA.map(row => `
                    <tr>
                      <td class="col-subskills-tags" style="vertical-align: middle; text-align: center;">
                        <div class="wiki-subskill-tags-col">
                          ${row.skills.map(s => renderSkillBadge(s)).join('')}
                        </div>
                      </td>
                      <td class="col-subskills-effect text-secondary" style="vertical-align: middle;">${_tWiki(row.desc, row.desc_en || row.desc)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 性格五維加成倍率表 -->
          <div class="wiki-card wiki-card-natures-table" style="margin-top: 20px;">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${_tWiki('性格五維屬性倍率表', 'Nature Modifiers')}</h3>
            </div>
            <div class="wiki-table-wrapper" style="margin-top: 10px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th style="text-align: center;">${_tWiki('屬性項目', 'Stat')}</th>
                    <th style="text-align: center;">${_tWiki('▲ 性格', '▲ Up')}</th>
                    <th style="text-align: center;">${_tWiki('▼ 性格', '▼ Down')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${NATURES_EFFECT_DATA.map(row => `
                    <tr>
                      <td class="font-bold text-accent" style="vertical-align: middle; text-align: center; white-space: nowrap;">${_tWiki(row.stat, row.stat_en || row.stat)}</td>
                      <td class="text-success font-bold" style="vertical-align: middle; text-align: center; white-space: nowrap;">${_tWiki(row.up, row.up_en || row.up)}</td>
                      <td class="text-danger font-bold" style="vertical-align: middle; text-align: center; white-space: nowrap;">${_tWiki(row.down, row.down_en || row.down)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 子分頁 3：食材產量天梯榜 (Ingredient Yield Ladder) -->
        <div id="wiki-subpanel-ingredients" class="wiki-subpanel ${currentWikiSubTab === 'ingredients' ? 'active' : ''}" style="${currentWikiSubTab === 'ingredients' ? '' : 'display:none;'}">
          <!-- 橫向視覺天梯座標圖 (預設顯示) -->
          <div id="wiki-ingredient-ladder-coordinate">
            ${renderCoordinateLadder()}
          </div>
        </div>

        <!-- 子分頁：主技能天梯榜 (Skill Proc Ladder) -->
        <div id="wiki-subpanel-skills_ladder" class="wiki-subpanel ${currentWikiSubTab === 'skills_ladder' ? 'active' : ''}" style="${currentWikiSubTab === 'skills_ladder' ? '' : 'display:none;'}">
          <!-- 橫向視覺技能天梯座標圖 -->
          <div id="wiki-skill-ladder-coordinate">
            ${typeof renderSkillCoordinateLadder === 'function' ? renderSkillCoordinateLadder() : ''}
          </div>
        </div>

        <!-- 子分頁 4：樹果與食材基礎能量 (Berry & Ingredient Values) -->
        <div id="wiki-subpanel-values" class="wiki-subpanel ${currentWikiSubTab === 'values' ? 'active' : ''}" style="${currentWikiSubTab === 'values' ? '' : 'display:none;'}">
          ${renderValuesBoard()}
        </div>

        <!-- 子分頁 5: 培育與評級指南 (Ratings & Growth) -->
        <div id="wiki-subpanel-ratings" class="wiki-subpanel ${currentWikiSubTab === 'ratings' ? 'active' : ''}" style="${currentWikiSubTab === 'ratings' ? '' : 'display:none;'}">
          <!-- 區塊 1: 核心養成週期指引 -->
          <div class="wiki-section-heading">
            <h3 class="wiki-section-title">${_tWiki('新手與進階養成核心週期指引', 'Growth & Investment Guide')}</h3>
            <p class="wiki-section-subtitle">${_tWiki('掌握前期突破門檻,活力常駐加成與種子珍稀資源的養成核心思維.', 'Key milestones, energy management, and seed mechanics for early to late-game development.')}</p>
          </div>
          <div class="wiki-card wiki-strategy-card">
            <div class="wiki-strategy-grid">
              <div class="strategy-item strategy-early">
                <div class="strategy-header">
                  <span class="strategy-badge badge-early">${_tWiki('前期目標', 'Early Goal')}</span>
                  <span class="strategy-title">${_tWiki('優先放置在 <span class="text-accent font-bold">Lv.30</span>', 'Prioritize <span class="text-accent font-bold">Lv.30</span>')}</span>
                </div>
                <div class="strategy-desc">${_tWiki('先看性格與 <span class="text-success font-bold">Lv.10</span> &amp; <span class="text-success font-bold">Lv.25</span> 副技能,無課/微課約養成 <span class="text-warning font-bold">2~4個月</span>即可解鎖<span class="text-accent font-bold">第2種食材</span>,成為中流砥柱.', 'Focus on nature and <span class="text-success font-bold">Lv.10</span> &amp; <span class="text-success font-bold">Lv.25</span> sub-skills. Takes <span class="text-warning font-bold">~2-4 months</span> for free/light players to unlock <span class="text-accent font-bold">2nd ingredient slot</span>, becoming core pillars.')}</div>
              </div>
              <div class="strategy-item strategy-late">
                <div class="strategy-header">
                  <span class="strategy-badge badge-late">${_tWiki('後期投資', 'Late Game')}</span>
                  <span class="strategy-title">${_tWiki('慎選投入 <span class="text-accent font-bold">Lv.50~60</span>', 'Carefully Invest in <span class="text-accent font-bold">Lv.50~60</span>')}</span>
                </div>
                <div class="strategy-desc">${_tWiki('確認副技能與性格皆達畢業級再投入大量糖果與<span class="text-warning font-bold">金種子</span>(約需 <span class="text-warning font-bold">5~10個月</span>養成時間).', 'Ensure sub-skills and nature reach graduation tier before heavily investing candies and <span class="text-warning font-bold">Main Skill Seeds</span> (<span class="text-warning font-bold">~5-10 months</span>).')}</div>
              </div>
              <div class="strategy-item strategy-energy">
                <div class="strategy-header">
                  <span class="strategy-badge badge-energy">${_tWiki('活力核心', 'Energy Core')}</span>
                  <span class="strategy-title">${_tWiki('優先養成一隻主力補師', 'Raise One Dedicated Healer First')}</span>
                </div>
                <div class="strategy-desc">${_tWiki('全體活力維持在 <span class="text-success font-bold">80%以上</span>可享受 <span class="text-accent font-bold">約2.22倍 (間隔 0.45x)</span> 幫忙速度!建議先練:<span class="text-warning font-bold">胖可丁</span>,<span class="text-warning font-bold">仙子伊布</span>,<span class="text-warning font-bold">沙奈朵</span>,<span class="text-warning font-bold">巴布土撥</span>或<span class="text-warning font-bold">土台龜</span>.', 'Maintaining team energy <span class="text-success font-bold">&gt; 80%</span> grants <span class="text-accent font-bold">~2.22x speed (interval 0.45x)</span>! Recommended healers: <span class="text-warning font-bold">Wigglytuff</span>, <span class="text-warning font-bold">Sylveon</span>, <span class="text-warning font-bold">Gardevoir</span>, <span class="text-warning font-bold">Pawmot</span>, or <span class="text-warning font-bold">Torterra</span>.')}</div>
              </div>
              <div class="strategy-item strategy-seeds">
                <div class="strategy-header">
                  <span class="strategy-badge badge-seeds">${_tWiki('種子機制', 'Seed Rules')}</span>
                  <span class="strategy-title">${_tWiki('主技能與副技能種子規則', 'Main &amp; Sub Skill Seed Rules')}</span>
                </div>
                <div class="strategy-desc">${_tWiki('每次進化<span class="text-success font-bold">主技能+1</span>.副技能不能同時存在相同名稱技能(如已有S與M,則S無法再升階為M).', 'Each evolution grants <span class="text-success font-bold">Main Skill Lv.+1</span>. Duplicate sub-skills cannot coexist (if S and M already exist, S cannot upgrade to M).')}</div>
              </div>
            </div>
          </div>

          <!-- 區塊 2: 三大專長畢業評級榜 -->
          <div class="wiki-section-heading" style="margin-top: 24px;">
            <h3 class="wiki-section-title">${_tWiki('三大專長畢業評級指南', 'Graduation Tier Guide')}</h3>
            <p class="wiki-section-subtitle">${_tWiki('樹果,食材,技能三大專長的頂級副技能與黃金性格搭配方向.', 'Optimal sub-skill and nature combinations for Berry, Ingredient, and Skill specialists.')}</p>
          </div>
          <div class="wiki-ratings-container">
            ${renderRatingCard(RATINGS_GUIDE_DATA.berry)}
            ${renderRatingCard(RATINGS_GUIDE_DATA.ingredient)}
            ${renderRatingCard(RATINGS_GUIDE_DATA.skill)}
          </div>

          <!-- 區塊 3: 睡眠天數升級試算器 -->
          <div class="wiki-section-heading" style="margin-top: 24px;">
            <h3 class="wiki-section-title">${_tWiki('寶可夢睡眠升級天數計算器', 'Sleep EXP Calculator')}</h3>
            <p class="wiki-section-subtitle">${_tWiki('依據每日睡滿100分(100 EXP基礎),計算從目前等級升至目標等級所需睡眠天數與經驗值.', 'Based on 100 daily sleep score (100 base EXP), calculates required sleep days and EXP from current to target level.')}</p>
          </div>
          <div class="wiki-card wiki-calc-card">
            <div class="calc-inputs-row">
              <div class="calc-form-col">
                <div class="calc-form-row calc-form-row-levels">
                  <div class="calc-field-group calc-field-cur">
                    <label class="calc-label" for="calc-sleep-cur-lv">${_tWiki('目前等級:', 'Current:')}</label>
                    <input type="number" id="calc-sleep-cur-lv" class="calc-input-num" value="1" min="1" max="${caps.THEORETICAL_MAX_LEVEL - 1}" inputmode="numeric" pattern="[0-9]*" autocomplete="off" onfocus="this.select()" onclick="this.select()" oninput="window.WikiDB.recalcSleepDays()" onchange="window.WikiDB.recalcSleepDays()">
                  </div>

                  <div class="calc-field-group calc-field-target">
                    <label class="calc-label" for="calc-sleep-target-lv">${_tWiki('目標等級:', 'Target:')}</label>
                    <select id="calc-sleep-target-lv" class="calc-select" onchange="window.WikiDB.recalcSleepDays()">
                      ${sleepExpTargetLevels.map(lv => `<option value="${lv}">Lv.${lv}</option>`).join('')}
                    </select>
                  </div>
                </div>

                <div class="calc-form-row calc-form-row-boosts">
                  <div class="calc-field-group calc-field-switch">
                    <label class="calc-switch-label">
                      <input type="checkbox" id="calc-sleep-exp-subskill" class="switch-checkbox" onchange="window.WikiDB.recalcSleepDays()">
                      <span class="switch-slider"></span>
                      <span class="switch-text">${_tWiki('睡眠EXP獎勵 (+14%)', 'Sleep EXP (+14%)')}</span>
                    </label>
                  </div>

                  <div class="calc-field-group calc-field-nature">
                    <select id="calc-sleep-nature-select" class="calc-select" onchange="window.WikiDB.recalcSleepDays()">
                      <option value="1.0">${_tWiki('性格無EXP修正', 'Neutral EXP')}</option>
                      <option value="1.18">${_tWiki('性格EXP▲ (+18%)', 'EXP Up ▲ (+18%)')}</option>
                      <option value="0.82">${_tWiki('性格EXP▼ (-18%)', 'EXP Down ▼ (-18%)')}</option>
                    </select>
                  </div>

                  <div class="calc-field-group calc-field-exptype">
                    <select id="calc-sleep-exp-type" class="calc-select" onchange="window.WikiDB.recalcSleepDays()">
                      <option value="1.0">${_tWiki('一般 (1.0倍)', 'Normal EXP (1.0x)')}</option>
                      <option value="1.5">${_tWiki('準神 (1.5倍)', 'Pseudo-Legendary (1.5x)')}</option>
                      <option value="1.8">${_tWiki('神獸 (1.8倍)', 'Legendary (1.8x)')}</option>
                      <option value="2.2">${_tWiki('幻之寶可夢 (2.2倍)', 'Mythical (2.2x)')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="calc-result-box">
                <div class="calc-result-label">${_tWiki('預估所需睡眠天數', 'Estimated Days')}</div>
                <div id="calc-sleep-days-result" class="calc-result-val">${_tWiki('120 天', '120 Days')}</div>
                <div id="calc-sleep-exp-result" class="calc-result-badge">${_tWiki('約需 11,992 EXP', 'Approx. 11,992 EXP')}</div>
                <div id="calc-sleep-candies-result" class="calc-result-candies">${_tWiki('約需 480 顆糖果 (每顆 25 EXP)', 'Approx. 480 Candies (25 EXP/ea)')}</div>
              </div>
            </div>

            <!-- 基準天數對照表 -->
            <div class="wiki-table-wrapper" style="margin-top: 14px;">
              <table class="wiki-data-table milestone-table">
                <thead>
                  <tr>
                    <th class="col-milestone-lv">${_tWiki('目標等級', 'Target Level')}</th>
                    <th class="col-milestone-exp">${_tWiki('所需EXP', 'Required EXP')}</th>
                    <th class="col-milestone-days">${_tWiki('每天滿睡', 'Daily Full Sleep')}</th>
                    <th class="col-milestone-note">${_tWiki('里程碑', 'Milestone')}</th>
                  </tr>
                </thead>
                <tbody>
                  ${SLEEP_DAYS_BASELINE.map(row => {
                    const milestoneColor = row.level === 10 ? 'milestone-cyan'
                      : row.level === 25 ? 'milestone-purple'
                      : row.level === 30 ? 'milestone-green'
                      : row.level === 50 ? 'milestone-amber'
                      : row.level === 60 ? 'milestone-pink'
                      : row.level === caps.POKEMON_LEVEL_CAP ? 'milestone-purple'
                      : 'milestone-cyan';
                    const rawNote = _tWiki(row.note, row.note_en || row.note);
                    const formattedNote = rawNote
                      .replace(/(第[一二三四五12345][個个]副技能|第[一二三123][種种]食材|1st sub-skill|2nd sub-skill|3rd sub-skill|4th sub-skill|5th sub-skill|2nd ingredient slot|3rd ingredient slot)/g, '<span class="text-accent font-bold">$1</span>');
                    return `
                    <tr>
                      <td class="col-milestone-lv" style="vertical-align: middle;"><span class="milestone-badge ${milestoneColor}">Lv.${row.level}</span></td>
                      <td class="col-milestone-exp font-bold" style="vertical-align: middle;">${row.totalExp.toLocaleString()}</td>
                      <td class="col-milestone-days text-success font-bold" style="vertical-align: middle;">${row.days} ${_tWiki('天', 'Days')}</td>
                      <td class="col-milestone-note text-secondary" style="vertical-align: middle;">${formattedNote}</td>
                    </tr>
                  `;}).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 子分頁 6: 島嶼營地與EX專家模式 (Research Camps & EX Mode) -->
        <div id="wiki-subpanel-islands" class="wiki-subpanel ${currentWikiSubTab === 'islands' ? 'active' : ''}" style="${currentWikiSubTab === 'islands' ? '' : 'display:none;'}">
          ${renderIslandsSubpanel()}
        </div>

        <!-- 子分頁 7: 道具百科 (Items Encyclopedia) -->
        <div id="wiki-subpanel-items" class="wiki-subpanel ${currentWikiSubTab === 'items' ? 'active' : ''}" style="${currentWikiSubTab === 'items' ? '' : 'display:none;'}">
          ${renderItemsSubpanel()}
        </div>
      </div>

      <!-- 遮罩層 (Backdrop for Mobile Drawer - 阻斷點擊穿透) -->
      <div id="ladder-sidebar-backdrop" class="sidebar-backdrop" onclick="event.preventDefault(); event.stopPropagation(); window.WikiDB.closeLadderSidebar()" ontouchend="event.preventDefault(); event.stopPropagation(); window.WikiDB.closeLadderSidebar()" ontouchstart="event.stopPropagation()"></div>
      <div id="skill-ladder-sidebar-backdrop" class="sidebar-backdrop" onclick="event.preventDefault(); event.stopPropagation(); window.WikiDB.closeSkillLadderSidebar()" ontouchend="event.preventDefault(); event.stopPropagation(); window.WikiDB.closeSkillLadderSidebar()" ontouchstart="event.stopPropagation()"></div>
    `;

    if (typeof window.pruneOverlayDuplicates === 'function') {
      window.pruneOverlayDuplicates([
        'ladder-recipe-modal',
        'ladder-filter-sidebar',
        'ladder-sidebar-backdrop',
        'ladder-sidebar-bookmark-handle',
        'ladder-recipe-highlight-fab',
        'skill-ladder-filter-sidebar',
        'skill-ladder-sidebar-backdrop',
        'skill-ladder-sidebar-bookmark-handle',
        'wiki-item-detail-modal'
      ]);
    }

    try {
      initCalcCustomSelects();
      if (typeof bindWikiFloatingFabs === 'function') bindWikiFloatingFabs();
    } catch (e) {}
  }

  function handleLadderGroupHover(e) {
    const target = e.target.closest('[data-pkm-group]');
    if (!target) return;
    const groupName = target.getAttribute('data-pkm-group');
    if (!groupName) return;
    const skillLadder = target.closest('.wiki-skill-coordinate-ladder');
    if (skillLadder) {
      const siblings = skillLadder.querySelectorAll(`[data-pkm-group="${groupName}"]`);
      siblings.forEach(el => el.classList.add('group-hover-active'));
      return;
    }
    const row = target.closest('.ladder-track-row, .ladder-tail-track-row');
    if (!row) return;
    const siblings = row.querySelectorAll(`[data-pkm-group="${groupName}"]`);
    siblings.forEach(el => el.classList.add('group-hover-active'));
  }

  function handleLadderGroupHoverOut(e) {
    const target = e.target.closest('[data-pkm-group]');
    if (!target) return;
    const groupName = target.getAttribute('data-pkm-group');
    if (!groupName) return;
    const skillLadder = target.closest('.wiki-skill-coordinate-ladder');
    if (skillLadder) {
      const siblings = skillLadder.querySelectorAll(`[data-pkm-group="${groupName}"]`);
      siblings.forEach(el => el.classList.remove('group-hover-active'));
      return;
    }
    const row = target.closest('.ladder-track-row, .ladder-tail-track-row');
    if (!row) return;
    const siblings = row.querySelectorAll(`[data-pkm-group="${groupName}"]`);
    siblings.forEach(el => el.classList.remove('group-hover-active'));
  }

  // 導出全局命名空間與公共函數 (支援 window.WikiDB 及 window 全域名稱)
  const WikiDBExport = {
    MAIN_SKILLS_DATA,
    SUB_SKILLS_DATA,
    TRIGGER_CHANCE_MATRIX,
    HELPING_SPEED_MATRIX,
    NATURES_EFFECT_DATA,
    RATINGS_GUIDE_DATA,
    SLEEP_DAYS_BASELINE,
    BERRY_VALUES_DATA,
    INGREDIENT_VALUES_DATA,
    LV60_COORDINATE_LADDER_DATA,
    LV60_INGREDIENTS_LADDER,
    mergeRecipeCodes,
    matchesLadderRecipeFilter,
    matchesLadderSearch,
    init: initWikiModule,
    renderWikiLayout: renderWikiLayout,
    switchSubTab: switchWikiSubTab,
    switchWikiSubTab: switchWikiSubTab,
    getCurrentSubTab: getCurrentSubTab,
    getCurrentSkillsCategory: () => currentSkillsCategory,
    switchLadderView: switchLadderView,
    filterSkills: filterWikiSkills,
    filterWikiSkills: filterWikiSkills,
    filterIngredients: filterWikiIngredients,
    filterWikiIngredients: filterWikiIngredients,
    switchStack: switchChargeStock,
    switchChargeStock: switchChargeStock,
    switchBoost: switchHelperBoost,
    switchHelperBoost: switchHelperBoost,
    toggleDetail: toggleDetailTable,
    toggleDetailTable: toggleDetailTable,
    updateBerryLevel: updateBerryLevel,
    updateBerryIsland: updateBerryIsland,
    toggleBerryFavorite: toggleBerryFavorite,
    toggleFavorite: toggleBerryFavorite,
    toggleLadderTop15: toggleLadderTop15,
    getLadderTop15Only: getLadderTop15Only,
    toggleLadderFinalOnly: typeof toggleLadderFinalOnly === 'function' ? toggleLadderFinalOnly : null,
    getLadderFinalOnly: typeof getLadderFinalOnly === 'function' ? getLadderFinalOnly : null,
    buildDynamicIngredientLadder: typeof buildDynamicIngredientLadder === 'function' ? buildDynamicIngredientLadder : null,
    getActiveCoordinateLadderData: typeof getActiveCoordinateLadderData === 'function' ? getActiveCoordinateLadderData : null,
    getDynamicTopRecipeForIngredient: typeof getDynamicTopRecipeForIngredient === 'function' ? getDynamicTopRecipeForIngredient : null,
    invalidateDynamicLadderCache: typeof invalidateDynamicLadderCache === 'function' ? invalidateDynamicLadderCache : null,
    toggleLadderIngM: toggleLadderIngM,
    toggleLadderIngS: toggleLadderIngS,
    toggleLadderSpeedM: toggleLadderSpeedM,
    toggleLadderSpeedS: toggleLadderSpeedS,
    toggleLadderSkillM: toggleLadderSkillM,
    toggleLadderSkillS: toggleLadderSkillS,
    toggleLadderSubskill: toggleLadderSubskill,
    toggleLadderNatureIng: toggleLadderNatureIng,
    toggleLadderNatureSpeed: toggleLadderNatureSpeed,
    toggleLadderNatureFilter: toggleLadderNatureFilter,
    getLadderNature: getLadderNature,
    setLadderNature: setLadderNature,
    toggleLadderRecipeMultiSelect: toggleLadderRecipeMultiSelect,
    onLadderSearch: onLadderSearch,
    clearLadderSearch: clearLadderSearch,
    setLadderSupplyFilter: setLadderSupplyFilter,
    setLadderRecipeFilter: setLadderRecipeFilter,
    setLadderSpecialtyFilter: setLadderSpecialtyFilter,
    toggleLadderSkillDrawExpected: toggleLadderSkillDrawExpected,
    getLadderSkillDrawExpected: getLadderSkillDrawExpected,
    getPokemonSkillDrawBonus: getPokemonSkillDrawBonus,
    hasPokemonIngSelectSkill: hasPokemonIngSelectSkill,
    INGREDIENT_DRAW_SKILL_EXPECTATIONS: INGREDIENT_DRAW_SKILL_EXPECTATIONS,
    setLadderSortOrder: setLadderSortOrder,
    getLadderSortOrder: getLadderSortOrder,
    resetLadderFilters: resetLadderFilters,
    refreshCoordinateLadder: refreshCoordinateLadder,
    renderCoordinateLadder: renderCoordinateLadder,
    handleLadderGroupHover: handleLadderGroupHover,
    handleLadderGroupHoverOut: handleLadderGroupHoverOut,
    recalcTriggerChance: recalcTriggerChance,
    recalcSleepDays: recalcSleepDays,
    initCalcCustomSelects: initCalcCustomSelects,
    openLadderSidebar: openLadderSidebar,
    closeLadderSidebar: closeLadderSidebar,
    toggleLadderSidebar: toggleLadderSidebar,
    openIngredientRankingModal: openIngredientRankingModal,
    closeIngredientRankingModal: closeIngredientRankingModal,
    updateLadderActiveFilterBadge: updateLadderActiveFilterBadge,
    toggleSkillCard: toggleSkillCard,
    toggleSkillStepper: toggleSkillStepper,
    TOP_RECIPES_FOR_INGREDIENTS: TOP_RECIPES_FOR_INGREDIENTS,
    getPokemonLadderSpecialty: getPokemonLadderSpecialty,
    ISLANDS_DATA: ISLANDS_DATA,
    SLEEP_STYLE_GOALS_DATA: SLEEP_STYLE_GOALS_DATA,
    selectIsland: selectIsland,
    toggleIslandExpertMode: toggleIslandExpertMode,
    filterIslandSleepType: filterIslandSleepType,
    renderIslandsSubpanel: renderIslandsSubpanel,
    getCurrentIslandId: () => currentIslandId,
    getIsExpertModeActive: () => isExpertModeActive,
    getCurrentIslandSleepType: () => currentIslandSleepType,
    getIslandPokemonDexOrder: getIslandPokemonDexOrder,
    getIslandPokemonDexCode: getIslandPokemonDexCode,
    getPokemonAvatarUrl: getPokemonAvatarUrl,
    sortIslandSpawns: sortIslandSpawns,
    getIslandSpawnsSort: getIslandSpawnsSort,
    getSnorlaxRankScore: getSnorlaxRankScore,
    TOP_7_RECIPES_HIGHLIGHT: TOP_7_RECIPES_HIGHLIGHT, TOP_10_RECIPES_HIGHLIGHT: TOP_7_RECIPES_HIGHLIGHT,
    TOP_RECIPES_BY_CATEGORY: TOP_RECIPES_BY_CATEGORY, recomputeTopRecipesByCategory: recomputeTopRecipesByCategory, getLadderDishIcon: getLadderDishIcon, getActiveHighlightRecipes: getActiveHighlightRecipes,
    openLadderRecipeModal: openLadderRecipeModal,
    closeLadderRecipeModal: closeLadderRecipeModal,
    openSkillDrawHelpModal: openSkillDrawHelpModal,
    closeSkillDrawHelpModal: closeSkillDrawHelpModal,
    selectLadderHighlightRecipe: selectLadderHighlightRecipe,
    clearLadderHighlightRecipe: clearLadderHighlightRecipe,
    switchLadderRecipeCategory: switchLadderRecipeCategory,
    getLadderRecipeCategory: () => ladderRecipeCategory,
    getLadderHighlightRecipe: () => ladderHighlightRecipe,
    toggleLadderEnergyHelp: toggleLadderEnergyHelp,
    closeLadderEnergyHelp: closeLadderEnergyHelp,
    toggleIslandLegendaryOnly: toggleIslandLegendaryOnly,
    getSavedIslandLegendaryOnly: getSavedIslandLegendaryOnly,
    getIsIslandLegendaryOnly: () => isIslandLegendaryOnly,
    getSleepStyleData: getSleepStyleData,
    toggleIslandSleepRewards: toggleIslandSleepRewards,
    getSavedIslandSleepRewards: getSavedIslandSleepRewards,
    getIsIslandSleepRewardsVisible: () => isIslandSleepRewardsVisible,
    showSleepStylePopover: showSleepStylePopover,
    closeSleepStylePopover: closeSleepStylePopover,
    formatSnorlaxRankBadge: formatSnorlaxRankBadge,
    filterItemsByCategory: filterItemsByCategory,
    handleItemsSearch: handleItemsSearch,
    clearItemsSearch: clearItemsSearch,
    resetItemsFilters: resetItemsFilters,
    filterItems: filterItems,
    searchItems: searchItems,
    renderItemsSubpanel: renderItemsSubpanel,
    renderFilteredItemsGrid: renderFilteredItemsGrid,
    getItemsCategory: () => currentItemsCategory,
    getItemsSearchQuery: () => currentItemsSearchQuery,
    openItemDetailModal: openItemDetailModal,
    closeItemDetailModal: closeItemDetailModal,
    navigateToPokemonDex: navigateToPokemonDex
  };

  if (typeof attachSkillLadderExports === 'function') {
    attachSkillLadderExports(WikiDBExport, window);
  }
  if (typeof attachIslandSleepTrackerExports === 'function') {
    attachIslandSleepTrackerExports(WikiDBExport, window);
  }

  window.WikiDB = WikiDBExport;
  window.filterItemsByCategory = filterItemsByCategory;
  window.handleItemsSearch = handleItemsSearch;
  window.clearItemsSearch = clearItemsSearch;
  window.resetItemsFilters = resetItemsFilters;
  window.filterItems = filterItems;
  window.searchItems = searchItems;
  window.renderItemsSubpanel = renderItemsSubpanel;
  window.openItemDetailModal = openItemDetailModal;
  window.closeItemDetailModal = closeItemDetailModal;
  window.navigateToPokemonDex = navigateToPokemonDex;
  window.formatSnorlaxRankBadge = formatSnorlaxRankBadge;

  // 同步掛載至 window 根層級以防止任何命名空間呼叫錯誤
  Object.assign(window, {
    switchWikiSubTab, getCurrentSubTab, getCurrentIslandId: () => currentIslandId,
    getIsExpertModeActive: () => isExpertModeActive, getCurrentIslandSleepType: () => currentIslandSleepType,
    sortIslandSpawns, getIslandSpawnsSort, toggleIslandLegendaryOnly, getSavedIslandLegendaryOnly,
    toggleLadderSidebar, toggleLadderEnergyHelp, closeLadderEnergyHelp, closeSleepStylePopover,
    switchLadderView, filterWikiSkills, filterWikiIngredients, switchChargeStock, switchHelperBoost,
    toggleDetailTable, toggleSkillCard, toggleSkillStepper, updateBerryLevel, updateBerryIsland,
    toggleBerryFavorite, toggleLadderTop15, getLadderTop15Only, toggleLadderIngM, toggleLadderIngS,
    toggleLadderSpeedM, toggleLadderSpeedS, toggleLadderSkillM, toggleLadderSkillS, toggleLadderSubskill,
    toggleLadderNatureIng, toggleLadderNatureSpeed, toggleLadderNatureFilter, toggleLadderRecipeMultiSelect,
    getLadderNature, setLadderNature, onLadderSearch, clearLadderSearch, setLadderSupplyFilter,
    setLadderRecipeFilter, setLadderSpecialtyFilter, toggleLadderSkillDrawExpected, getLadderSkillDrawExpected,
    getPokemonSkillDrawBonus, hasPokemonIngSelectSkill, INGREDIENT_DRAW_SKILL_EXPECTATIONS, setLadderSortOrder, getLadderSortOrder,
    resetLadderFilters, refreshCoordinateLadder, renderCoordinateLadder, handleLadderGroupHover,
    handleLadderGroupHoverOut, recalcTriggerChance, recalcSleepDays, initCalcCustomSelects,
    openLadderSidebar, closeLadderSidebar, openIngredientRankingModal, closeIngredientRankingModal,
    updateLadderActiveFilterBadge, HELPING_SPEED_MATRIX, selectIsland, toggleIslandExpertMode,
    filterIslandSleepType, renderIslandsSubpanel, TOP_7_RECIPES_HIGHLIGHT, TOP_10_RECIPES_HIGHLIGHT: TOP_7_RECIPES_HIGHLIGHT, TOP_RECIPES_BY_CATEGORY, recomputeTopRecipesByCategory,
    openLadderRecipeModal, closeLadderRecipeModal, openSkillDrawHelpModal, closeSkillDrawHelpModal,
    selectLadderHighlightRecipe, clearLadderHighlightRecipe, switchLadderRecipeCategory,
    getLadderRecipeCategory: () => ladderRecipeCategory, getLadderHighlightRecipe: () => ladderHighlightRecipe
  });

  // 當 DOM 準備完成時自動初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWikiModule);
  } else {
    initWikiModule();
  }

})();
