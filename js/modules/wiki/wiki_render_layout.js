  // --- Wiki 主框架與側邊欄 HTML 殼層建構器 ---
  function _buildWikiLayoutHtml(ctx) {
    const {
      isMobileH5,
      isWikiMainActive,
      initialLadderCollapsed,
      initialSkillLadderCollapsed,
      caps,
      sleepExpTargetLevels,
      shouldRenderSubpanel,
      renderSkillsBody,
      renderSubskillsBody
    } = ctx;
    return `
      <!-- 天梯頂級料理食材高亮懸浮按鈕 (FAB) -->
      <button type="button" id="ladder-recipe-highlight-fab" class="ladder-recipe-highlight-fab ${ladderHighlightRecipe ? 'has-active' : ''}" onclick="window.WikiDB.openLadderRecipeModal()" title="${window.I18N?.t?.('wiki.ui_highlight_recipe') ?? '選取料理高亮食材'}" aria-label="${window.I18N?.t?.('wiki.ui_highlight_recipe') ?? '選取料理高亮食材'}" style="${(ctx.isWikiMainActive && currentWikiSubTab === 'ingredients') ? 'display:flex;' : 'display:none;'}">
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
                <h3 id="ladder-recipe-modal-title" class="ladder-recipe-modal-title">${window.I18N?.t?.('wiki.ui_highlight_recipe_modal') ?? '選取料理高亮食材'}</h3>
                <label class="ladder-multi-select-label" for="ladder-recipe-multi-toggle">
                  <span class="ladder-multi-select-text">${window.I18N?.t?.('wiki.ui_multi_select') ?? '多選'}</span>
                  <div class="sidebar-switch-wrapper">
                    <input type="checkbox" id="ladder-recipe-multi-toggle" class="switch-checkbox" ${ladderRecipeMultiSelect ? 'checked' : ''} onchange="window.WikiDB.toggleLadderRecipeMultiSelect(this.checked)">
                    <span class="switch-slider"></span>
                  </div>
                </label>
              </div>
              <p class="ladder-recipe-modal-subtitle">${window.I18N?.t?.('wiki.ui_highlight_recipe_sub') ?? '各前10高分料理，標記所需食材'}</p>
            </div>
            <div class="ladder-recipe-modal-actions">
              <button type="button" class="ladder-recipe-header-clear-btn" onclick="window.WikiDB.clearLadderHighlightRecipe()" title="${window.I18N?.t?.('wiki.ui_clear_selection') ?? '清除選取'}">${window.I18N?.t?.('wiki.ui_clear_btn') ?? '清除'}</button>
              <button type="button" class="ladder-recipe-modal-close" onclick="window.WikiDB.closeLadderRecipeModal()" aria-label="${window.I18N?.t?.('wiki.ui_close') ?? '關閉'}">
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

      ${ctx.isMobileH5 ? `
        <!-- 右下懸浮天梯篩選按鈕 (與圖鑑/料理完全一致的 FAB 結構) -->
        <button type="button" id="ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle sidebar-fab-btn ${currentWikiSubTab === 'ingredients' ? '' : 'drawer-open'}" onclick="window.WikiDB.openLadderSidebar()" title="${window.I18N?.t?.('wiki.ui_open_ladder_filter') ?? '展開天梯篩選器'}" aria-label="${window.I18N?.t?.('wiki.ui_open_ladder_filter') ?? '展開天梯篩選器'}" style="${currentWikiSubTab === 'ingredients' ? 'display:flex;' : 'display:none;'}">
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

        ${typeof renderSkillLadderMobileHandle === 'function' ? renderSkillLadderMobileHandle(currentWikiSubTab) : ''}
      ` : ''}

      <!-- 天梯專屬側邊篩選器 (Mobile: 抽屜式 / Desktop: 左側滑動) -->
      <aside id="ladder-filter-sidebar" class="pokemon-filter-sidebar ladder-fixed-sidebar ${ctx.initialLadderCollapsed}" style="${currentWikiSubTab === 'ingredients' ? 'display:flex;' : 'display:none;'}" aria-label="${window.I18N?.t?.('wiki.ui_filter_label') ?? '篩選器'}">
        ${!ctx.isMobileH5 ? `
          <!-- 側邊欄垂直中央書籤標籤 (Desktop: 抽屜把手，展開時自動隱藏，收合時展示) -->
          <button type="button" id="ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle" onclick="window.WikiDB.toggleLadderSidebar(true)" title="${window.I18N?.t?.('wiki.ui_expand_ladder_sidebar') ?? '展開天梯篩選側邊欄'}" aria-label="${window.I18N?.t?.('wiki.ui_expand_ladder_sidebar') ?? '展開天梯篩選側邊欄'}">
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
            <span class="bookmark-text">${window.I18N?.t?.('wiki.ui_filter_short') ?? '篩選'}</span>
            <span class="bookmark-arrow">◀</span>
            <span id="ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
          </button>
        ` : ''}

        <div class="sidebar-header">
          <button type="button" id="ladder-sidebar-close-btn" class="sidebar-close-btn" onclick="window.WikiDB.toggleLadderSidebar(false)" title="${window.I18N?.t?.('wiki.ui_collapse_sidebar') ?? '收合側邊欄'}" aria-label="${window.I18N?.t?.('wiki.ui_collapse_sidebar') ?? '收合側邊欄'}">◀</button>
          <div class="sidebar-title-group" style="display:flex;align-items:center;gap:6px;">
            <span class="sidebar-title">${window.I18N?.t?.('wiki.ui_filter_label') ?? '篩選器'}</span>
            <button type="button" class="pokedex-formula-help-btn ladder-formula-help-btn" onclick="window.WikiDB.toggleLadderEnergyHelp(event)" title="${window.I18N?.t?.('wiki.ui_ladder_baseline_title') ?? '基準：Lv.60 滿活力 (0.45x)'}" aria-label="Ladder Energy Info">?</button>
          </div>
          <button type="button" id="ladder-reset-all-btn" class="sidebar-reset-btn" onclick="window.WikiDB.resetLadderFilters()" title="${window.I18N?.t?.('wiki.ui_reset_filters_title') ?? '重設所有條件'}">${window.I18N?.t?.('wiki.ui_reset') ?? '重設'}</button>

          <!-- 天梯基準滿活力浮窗 (Toast-style Popover) -->
          <div id="ladder-energy-help-popover" class="ladder-energy-help-popover" style="display:none;" role="tooltip">
            <div class="pokedex-energy-help-backdrop" onclick="window.WikiDB.closeLadderEnergyHelp(event)"></div>
            <div class="pokedex-energy-help-bubble ladder-energy-help-bubble">
              <div class="energy-help-title font-bold">${window.I18N?.t?.('wiki.ui_ladder_energy_help_title') ?? '天梯基準：Lv.60 滿活力'}</div>
              <div class="energy-help-body">
                ${window.I18N?.t?.('wiki.ui_ladder_energy_help_body') ?? '以 Lv.60 滿活力理想狀態 (活力 ≥ 80%，間隔 0.45x) 試算單日產能。'}
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-scrollable-content">
          <!-- 1. 搜尋寶可夢 -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ui_search_pkm') ?? '搜尋寶可夢'}</span>
              <button type="button" id="ladder-search-clear-btn" class="sidebar-section-clear-btn" style="${ladderSearchQuery ? 'display:inline-block;' : 'display:none;'}" onclick="window.WikiDB.clearLadderSearch()">${window.I18N?.t?.('wiki.ui_clear') ?? '清空'}</button>
            </div>
            <div class="sidebar-search-box" style="margin-top: 4px;">
              <span class="sidebar-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"></circle>
                  <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                </svg>
              </span>
              <input type="text" id="ladder-pkm-search-input" class="sidebar-search-input" placeholder="${window.I18N?.t?.('wiki.ui_search_pkm_ph') ?? '搜尋寶可夢名稱...'}" value="${ladderSearchQuery}" oninput="window.WikiDB.onLadderSearchInput(this.value)">
            </div>
          </div>

          <!-- 2. 天梯軌道排序 (Track Sorting) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ui_track_sorting') ?? '天梯軌道排序'}</span>
              <label class="ladder-top15-switch-label" title="${window.I18N?.t?.('wiki.ui_top15_title') ?? '預設開啟前15名排行'}">
                <input type="checkbox" id="ladder-top15-switch" class="ladder-switch-input" ${ladderTop15Only ? 'checked' : ''} onchange="window.WikiDB.toggleLadderTop15(this.checked)">
                <span class="ladder-switch-slider"></span>
                <span class="ladder-switch-text">${window.I18N?.t?.('wiki.ui_top15') ?? '前15名'}</span>
              </label>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${ladderSortOrder === 'ENERGY_ASC' ? 'active' : ''}" data-sort-order="ENERGY_ASC" onclick="window.WikiDB.setLadderSortOrder('ENERGY_ASC')">${window.I18N?.t?.('wiki.ui_sort_energy_asc') ?? '能量：低到高'}</button>
              <button type="button" class="tag-btn ${ladderSortOrder === 'ENERGY_DESC' ? 'active' : ''}" data-sort-order="ENERGY_DESC" onclick="window.WikiDB.setLadderSortOrder('ENERGY_DESC')">${window.I18N?.t?.('wiki.ui_sort_energy_desc') ?? '能量：高到低'}</button>
              <button type="button" class="tag-btn ${ladderSortOrder === 'YIELD_DESC' ? 'active' : ''}" data-sort-order="YIELD_DESC" onclick="window.WikiDB.setLadderSortOrder('YIELD_DESC')">${window.I18N?.t?.('wiki.ui_sort_yield_desc') ?? '產量：多到少'}</button>
              <button type="button" class="tag-btn ${ladderSortOrder === 'DEMAND_DESC' ? 'active' : ''}" data-sort-order="DEMAND_DESC" onclick="window.WikiDB.setLadderSortOrder('DEMAND_DESC')">${window.I18N?.t?.('wiki.ui_sort_demand_desc') ?? '大菜需求：多到少'}</button>
            </div>
          </div>

          <!-- 3. 產量與供餐梯隊 (Supply Tier) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ui_supply_tier') ?? '產量供餐梯隊'}</span>
              <label class="ladder-top15-switch-label" title="${window.I18N?.t?.('wiki.ui_final_evo_title') ?? '僅顯示最終進化（稀有食材不足 2 種時自動補入未進化）'}">
                <input type="checkbox" id="ladder-final-only-switch" class="ladder-switch-input" ${(typeof getLadderFinalOnly === 'function' ? getLadderFinalOnly() : true) ? 'checked' : ''} onchange="window.WikiDB.toggleLadderFinalOnly(this.checked)">
                <span class="ladder-switch-slider"></span>
                <span class="ladder-switch-text">${window.I18N?.t?.('wiki.ui_final_evo') ?? '最終進化'}</span>
              </label>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'ALL' ? 'active' : ''}" data-supply-filter="ALL" onclick="window.WikiDB.setLadderSupplyFilter('ALL')">${window.I18N?.t?.('wiki.ui_all') ?? '全部'}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'TOP' ? 'active' : ''}" data-supply-filter="TOP" onclick="window.WikiDB.setLadderSupplyFilter('TOP')">${window.I18N?.t?.('wiki.ui_top5') ?? '前五名'}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'MEALS_3' ? 'active' : ''}" data-supply-filter="MEALS_3" onclick="window.WikiDB.setLadderSupplyFilter('MEALS_3')">${window.I18N?.t?.('wiki.ui_meals_3') ?? '滿載 3 餐'}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'MEALS_2' ? 'active' : ''}" data-supply-filter="MEALS_2" onclick="window.WikiDB.setLadderSupplyFilter('MEALS_2')">${window.I18N?.t?.('wiki.ui_meals_2') ?? '充足 2 餐'}</button>
            </div>
          </div>

          <!-- 4. 食材組合型態 (Recipe Structure) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ui_recipe_structure') ?? '食材組合型態'}</span>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'ALL' ? 'active' : ''}" data-recipe-filter="ALL" onclick="window.WikiDB.setLadderRecipeFilter('ALL')">${window.I18N?.t?.('wiki.ui_all') ?? '全部'}</button>
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'AAA' ? 'active' : ''}" data-recipe-filter="AAA" onclick="window.WikiDB.setLadderRecipeFilter('AAA')">${window.I18N?.t?.('wiki.ui_recipe_aaa') ?? '純種 AAA'}</button>
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'ABB' ? 'active' : ''}" data-recipe-filter="ABB" onclick="window.WikiDB.setLadderRecipeFilter('ABB')">${window.I18N?.t?.('wiki.ui_recipe_abb') ?? '雙食材 ABB'}</button>
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'AXX' ? 'active' : ''}" data-recipe-filter="AXX" onclick="window.WikiDB.setLadderRecipeFilter('AXX')">${window.I18N?.t?.('wiki.ui_recipe_axx') ?? '混搭 AXX'}</button>
            </div>
          </div>

          <!-- 5. 寶可夢專長分類 (Specialty Type) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ui_specialty_type') ?? '寶可夢專長'}</span>
              <div class="ladder-switch-with-help">
                <label class="ladder-top15-switch-label" title="${window.I18N?.t?.('wiki.ui_ing_draw_tooltip') ?? '所有專長皆以 1.0 倍發動機率為基準\n請用技能機率M/S與技能機率▲模擬補正'}">
                  <input type="checkbox" id="ladder-skill-draw-toggle" class="ladder-switch-input" ${isLadderSkillDrawExpected ? 'checked' : ''} onchange="window.WikiDB.toggleLadderSkillDrawExpected(this.checked)">
                  <span class="ladder-switch-slider"></span>
                  <span class="ladder-switch-text">${window.I18N?.t?.('wiki.ui_ing_draw') ?? '食材精選'}</span>
                </label>
                <button type="button" class="ladder-help-icon-btn" onclick="window.WikiDB.openSkillDrawHelpModal(event)" title="${window.I18N?.t?.('wiki.ui_ing_draw_tooltip') ?? '所有專長皆以 1.0 倍發動機率為基準\n請用技能機率M/S與技能機率▲模擬補正'}" aria-label="${window.I18N?.t?.('wiki.ui_skill_help') ?? '技能說明'}">?</button>
                <!-- 食材精選S 說明提示框 (點選?展示，格式與樣式與網頁版本滑鼠懸停框一致) -->
                <div id="ladder-skill-help-modal" class="ladder-skill-tooltip-popover" style="display:none;" role="tooltip">
                  <div class="ladder-skill-tooltip-backdrop" onclick="window.WikiDB.closeSkillDrawHelpModal()"></div>
                  <div class="ladder-skill-tooltip-bubble">
                    <div class="ladder-skill-tooltip-line">${window.I18N?.t?.('wiki.ui_ing_draw_line1') ?? '所有專長皆以 1.0 倍發動機率為基準'}</div>
                    <div class="ladder-skill-tooltip-line">${window.I18N?.t?.('wiki.ui_ing_draw_line2') ?? '請用技能機率M/S與技能機率▲模擬補正'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'ALL' ? 'active' : ''}" data-specialty-filter="ALL" onclick="window.WikiDB.setLadderSpecialtyFilter('ALL')">${window.I18N?.t?.('wiki.ui_all') ?? '全部'}</button>
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'INGREDIENT' ? 'active' : ''}" data-specialty-filter="INGREDIENT" onclick="window.WikiDB.setLadderSpecialtyFilter('INGREDIENT')">${window.I18N?.t?.('wiki.ui_spec_ing') ?? '食材型'}</button>
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'BERRY' ? 'active' : ''}" data-specialty-filter="BERRY" onclick="window.WikiDB.setLadderSpecialtyFilter('BERRY')">${window.I18N?.t?.('wiki.ui_spec_berry') ?? '樹果型'}</button>
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'SKILL' ? 'active' : ''}" data-specialty-filter="SKILL" onclick="window.WikiDB.setLadderSpecialtyFilter('SKILL')">${window.I18N?.t?.('wiki.ui_spec_skill') ?? '技能型'}</button>
            </div>
          </div>


          <!-- 6. 副技能補正模擬 (Sub-Skill Boost Simulation) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ui_subskill_boost') ?? '副技能補正模擬'}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${isLadderIngM ? 'active' : ''}" id="ladder-ing-m-toggle" data-subskill-boost="ING_M" onclick="window.WikiDB.toggleLadderSubskill('ING_M')">${window.I18N?.t?.('wiki.ui_sub_ing_m') ?? '食材機率M'}</button>
              <button type="button" class="tag-btn ${isLadderIngS ? 'active' : ''}" id="ladder-ing-s-toggle" data-subskill-boost="ING_S" onclick="window.WikiDB.toggleLadderSubskill('ING_S')">${window.I18N?.t?.('wiki.ui_sub_ing_s') ?? '食材機率S'}</button>
              <button type="button" class="tag-btn ${isLadderSpeedM ? 'active' : ''}" id="ladder-speed-m-toggle" data-subskill-boost="SPEED_M" onclick="window.WikiDB.toggleLadderSubskill('SPEED_M')">${window.I18N?.t?.('wiki.ui_sub_spd_m') ?? '幫忙速度M'}</button>
              <button type="button" class="tag-btn ${isLadderSpeedS ? 'active' : ''}" id="ladder-speed-s-toggle" data-subskill-boost="SPEED_S" onclick="window.WikiDB.toggleLadderSubskill('SPEED_S')">${window.I18N?.t?.('wiki.ui_sub_spd_s') ?? '幫忙速度S'}</button>
              <button type="button" class="tag-btn ${isLadderSkillM ? 'active' : ''}" id="ladder-skill-m-toggle" data-subskill-boost="SKILL_M" onclick="window.WikiDB.toggleLadderSubskill('SKILL_M')">${window.I18N?.t?.('wiki.ui_sub_skl_m') ?? '技能機率M'}</button>
              <button type="button" class="tag-btn ${isLadderSkillS ? 'active' : ''}" id="ladder-skill-s-toggle" data-subskill-boost="SKILL_S" onclick="window.WikiDB.toggleLadderSubskill('SKILL_S')">${window.I18N?.t?.('wiki.ui_sub_skl_s') ?? '技能機率S'}</button>
            </div>
          </div>

          <!-- 7. 性格補正模擬 (Nature Boost Simulation - 單選) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ui_nature_boost') ?? '性格補正模擬'}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${ladderNatureIng ? 'active' : ''}" data-nature-filter="ING" onclick="window.WikiDB.toggleLadderNatureFilter('ING')">${window.I18N?.t?.('wiki.ui_nat_ing') ?? '食材機率▲'}</button>
              <button type="button" class="tag-btn ${ladderNatureSpeed ? 'active' : ''}" data-nature-filter="SPEED" onclick="window.WikiDB.toggleLadderNatureFilter('SPEED')">${window.I18N?.t?.('wiki.ui_nat_spd') ?? '幫忙速度▲'}</button>
              <button type="button" class="tag-btn ${ladderNatureSkill ? 'active' : ''}" data-nature-filter="SKILL" onclick="window.WikiDB.toggleLadderNatureFilter('SKILL')">${window.I18N?.t?.('wiki.ui_nat_skl') ?? '技能機率▲'}</button>
            </div>
          </div>
        </div>
      </aside>

      ${typeof renderSkillLadderSidebar === 'function' ? renderSkillLadderSidebar(initialSkillLadderCollapsed, undefined, currentWikiSubTab) : ''}

      <div class="wiki-main-container">
        <!-- 二級子分頁導航 (Sub-tabs) - 精簡無大標題橫幅 -->
        <div class="wiki-subnav-bar">
          <div class="wiki-subnav-tabs" role="tablist">
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'skills' ? 'active' : ''}" data-subtab="skills" onclick="window.WikiDB.switchSubTab('skills')">${window.I18N?.t?.(isMobileH5 ? 'wiki.ui_tab_skills_m' : 'wiki.ui_tab_skills') ?? '主技能數值庫'}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'subskills' ? 'active' : ''}" data-subtab="subskills" onclick="window.WikiDB.switchSubTab('subskills')">${window.I18N?.t?.(isMobileH5 ? 'wiki.ui_tab_subskills_m' : 'wiki.ui_tab_subskills') ?? '副技能與性格指南'}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'ingredients' ? 'active' : ''}" data-subtab="ingredients" onclick="window.WikiDB.switchSubTab('ingredients')">${window.I18N?.t?.(isMobileH5 ? 'wiki.ui_tab_ing_m' : 'wiki.ui_tab_ing') ?? '食材產量天梯榜'}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'skills_ladder' ? 'active' : ''}" data-subtab="skills_ladder" onclick="window.WikiDB.switchSubTab('skills_ladder')">${window.I18N?.t?.(isMobileH5 ? 'wiki.ui_tab_skl_m' : 'wiki.ui_tab_skl') ?? '主技能天梯榜'}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'values' ? 'active' : ''}" data-subtab="values" onclick="window.WikiDB.switchSubTab('values')">${window.I18N?.t?.(isMobileH5 ? 'wiki.ui_tab_values_m' : 'wiki.ui_tab_values') ?? '樹果與食材能量'}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'ratings' ? 'active' : ''}" data-subtab="ratings" onclick="window.WikiDB.switchSubTab('ratings')">${window.I18N?.t?.(isMobileH5 ? 'wiki.ui_tab_ratings_m' : 'wiki.ui_tab_ratings') ?? '培育與評級指南'}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'islands' ? 'active' : ''}" data-subtab="islands" onclick="window.WikiDB.switchSubTab('islands')">${window.I18N?.t?.(isMobileH5 ? 'wiki.ui_tab_islands_m' : 'wiki.ui_tab_islands') ?? '島嶼營地與EX模式'}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'items' ? 'active' : ''}" data-subtab="items" onclick="window.WikiDB.switchSubTab('items')">${window.I18N?.t?.('wiki.ui_tab_items') ?? '道具百科'}</button>
          </div>
        </div>

        <!-- 子分頁 1：主技能數值庫 (Main Skills) -->
        <div id="wiki-subpanel-skills" class="wiki-subpanel ${currentWikiSubTab === 'skills' ? 'active' : ''}" style="${currentWikiSubTab === 'skills' ? '' : 'display:none;'}"${ctx.shouldRenderSubpanel('skills') ? '' : ' data-wiki-pending="1"'}>
          ${ctx.shouldRenderSubpanel('skills') ? ctx.renderSkillsBody() : ''}
        </div>

        <!-- 子分頁 2：副技能與性格指南 (Sub-Skills & Natures) -->
        <div id="wiki-subpanel-subskills" class="wiki-subpanel ${currentWikiSubTab === 'subskills' ? 'active' : ''}" style="${currentWikiSubTab === 'subskills' ? '' : 'display:none;'}"${ctx.shouldRenderSubpanel('subskills') ? '' : ' data-wiki-pending="1"'}>
          ${ctx.shouldRenderSubpanel('subskills') ? ctx.renderSubskillsBody() : ''}
        </div>

        <!-- 子分頁 3：食材產量天梯榜 (Ingredient Yield Ladder) -->
        <div id="wiki-subpanel-ingredients" class="wiki-subpanel ${currentWikiSubTab === 'ingredients' ? 'active' : ''}" style="${currentWikiSubTab === 'ingredients' ? '' : 'display:none;'}"${ctx.shouldRenderSubpanel('ingredients') ? '' : ' data-wiki-pending="1"'}>
          <!-- 橫向視覺天梯座標圖 (預設顯示) -->
          ${ctx.shouldRenderSubpanel('ingredients') ? `<div id="wiki-ingredient-ladder-coordinate">${renderCoordinateLadder()}</div>` : ''}
        </div>

        <!-- 子分頁：主技能天梯榜 (Skill Proc Ladder) -->
        <div id="wiki-subpanel-skills_ladder" class="wiki-subpanel ${currentWikiSubTab === 'skills_ladder' ? 'active' : ''}" style="${currentWikiSubTab === 'skills_ladder' ? '' : 'display:none;'}"${ctx.shouldRenderSubpanel('skills_ladder') ? '' : ' data-wiki-pending="1"'}>
          <!-- 橫向視覺技能天梯座標圖 -->
          ${ctx.shouldRenderSubpanel('skills_ladder') ? `<div id="wiki-skill-ladder-coordinate">${typeof renderSkillCoordinateLadder === 'function' ? renderSkillCoordinateLadder() : ''}</div>` : ''}
        </div>

        <!-- 子分頁 4：樹果與食材基礎能量 (Berry & Ingredient Values) -->
        <div id="wiki-subpanel-values" class="wiki-subpanel ${currentWikiSubTab === 'values' ? 'active' : ''}" style="${currentWikiSubTab === 'values' ? '' : 'display:none;'}"${ctx.shouldRenderSubpanel('values') ? '' : ' data-wiki-pending="1"'}>
          ${ctx.shouldRenderSubpanel('values') ? renderValuesBoard() : ''}
        </div>

        <!-- 子分頁 5: 培育與評級指南 (Ratings & Growth) -->
        <div id="wiki-subpanel-ratings" class="wiki-subpanel ${currentWikiSubTab === 'ratings' ? 'active' : ''}" style="${currentWikiSubTab === 'ratings' ? '' : 'display:none;'}"${ctx.shouldRenderSubpanel('ratings') ? '' : ' data-wiki-pending="1"'}>
          ${ctx.shouldRenderSubpanel('ratings') ? _renderWikiRatingsBody(ctx.caps, ctx.sleepExpTargetLevels) : ''}
        </div>

        <!-- 子分頁 6: 島嶼營地與EX專家模式 (Research Camps & EX Mode) -->
        <div id="wiki-subpanel-islands" class="wiki-subpanel ${currentWikiSubTab === 'islands' ? 'active' : ''}" style="${currentWikiSubTab === 'islands' ? '' : 'display:none;'}"${ctx.shouldRenderSubpanel('islands') ? '' : ' data-wiki-pending="1"'}>
          ${ctx.shouldRenderSubpanel('islands') ? renderIslandsSubpanel() : ''}
        </div>

        <!-- 子分頁 7: 道具百科 (Items Encyclopedia) -->
        <div id="wiki-subpanel-items" class="wiki-subpanel ${currentWikiSubTab === 'items' ? 'active' : ''}" style="${currentWikiSubTab === 'items' ? '' : 'display:none;'}"${ctx.shouldRenderSubpanel('items') ? '' : ' data-wiki-pending="1"'}>
          ${ctx.shouldRenderSubpanel('items') ? renderItemsSubpanel() : ''}
        </div>
      </div>

      <!-- 遮罩層 (Backdrop for Mobile Drawer - 阻斷點擊穿透) -->
      <div id="ladder-sidebar-backdrop" class="sidebar-backdrop" onclick="event.preventDefault(); event.stopPropagation(); window.WikiDB.closeLadderSidebar()" ontouchend="event.preventDefault(); event.stopPropagation(); window.WikiDB.closeLadderSidebar()" ontouchstart="event.stopPropagation()"></div>
      <div id="skill-ladder-sidebar-backdrop" class="sidebar-backdrop" onclick="event.preventDefault(); event.stopPropagation(); window.WikiDB.closeSkillLadderSidebar()" ontouchend="event.preventDefault(); event.stopPropagation(); window.WikiDB.closeSkillLadderSidebar()" ontouchstart="event.stopPropagation()"></div>
    `;
  }
