  // =========================================================================
  // 主技能天梯渲染與視圖 (Main Skill Ladder View & Renderers)
  // =========================================================================

  const _escapeHtml = typeof escapeHtml === 'function' ? escapeHtml : function (str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  function renderSkillCoordinateLadder() {
    const allPkm = getAllSkillPokemonList();

    let globalMinProcs = Infinity;
    let globalMaxProcs = -Infinity;
    const processedTracks = SKILL_TRACK_DEFINITIONS.map(track => {
      const trackId = track.id;
      const trackName = window.I18N?.t?.(track.nameKey) ?? (window.I18N?.field?.(track, 'name') ?? (track.name_cn || track.name || ''));
      const trackDesc = window.I18N?.t?.(track.descKey) ?? (window.I18N?.field?.(track, 'desc') ?? (track.desc_cn || track.desc || ''));

      const matchingPokemon = allPkm.filter(p => {
        if (!p || isExcludedSkill(p.main_skill)) return false;
        const tracks = getSkillTracks(p.main_skill);
        if (!tracks.includes(trackId)) return false;

        if (typeof skillLadderFinalOnly !== 'undefined' && skillLadderFinalOnly && typeof isPokemonSkillLadderFinalEvo === 'function' && !isPokemonSkillLadderFinalEvo(p)) return false;

        const spec = p.specialty || '';
        if (skillLadderSpecialtyFilter === 'SKILL' && !spec.includes('技能') && spec !== 'Skills' && spec !== 'Skill') return false;
        if (skillLadderSpecialtyFilter === 'BERRY' && !spec.includes('樹果') && spec !== 'Berries' && spec !== 'Berry') return false;
        if (skillLadderSpecialtyFilter === 'INGREDIENT' && !spec.includes('食材') && spec !== 'Ingredients' && spec !== 'Ingredient') return false;

        if (skillLadderSearchQuery) {
          const q = skillLadderSearchQuery.toLowerCase().trim();
          let matched = false;
          if (typeof matchesLadderSearch === 'function') {
            matched = matchesLadderSearch(p.name_cn || p.name, p.name_en, q);
          }
          if (!matched) {
            const nCn = (p.name_cn || p.name || '').toLowerCase();
            const nEn = (p.name_en || '').toLowerCase();
            const nJp = (p.name_jp || '').toLowerCase();
            const pId = String(p.id || '');
            const pNo = String(p.formatted_no || '');
            const isNum = (/^\d+$/).test(q);
            const numMatch = isNum && (parseInt(pId, 10) === parseInt(q, 10) || pId === q || pNo === q || pNo === q.padStart(3, '0') || pId.padStart(3, '0') === q.padStart(3, '0'));
            const nSimp = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.toSimplified === 'function' && p.name_cn)
              ? window.I18N.toSimplified(p.name_cn).toLowerCase()
              : '';
            matched = nCn.includes(q) || nEn.includes(q) || (nJp && nJp.includes(q)) || (nSimp && nSimp.includes(q)) || !!numMatch;
          }
          if (!matched) return false;
        }
        return true;
      });

      const nodes = matchingPokemon.map(p => {
        const calcRes = getPokemonSkillLadderProcs(p);
        if (!calcRes) return null;

        const specStr = p.specialty || '技能';
        const specKey = (specStr.includes('樹果') || specStr === 'Berries') ? 'berry'
          : (specStr.includes('食材') || specStr === 'Ingredients') ? 'ingredient'
          : 'skill';
        const specDisplay = (specKey === 'berry')
          ? (window.I18N?.t?.('wiki.ldr_spec_berries') ?? '樹果型')
          : (specKey === 'ingredient')
            ? (window.I18N?.t?.('wiki.ldr_spec_ingredients') ?? '食材型')
            : (window.I18N?.t?.('wiki.ldr_spec_skills') ?? '技能型');

        const pkmDisplayName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getPokemonName === 'function')
          ? window.I18N.getPokemonName(p.name_cn || p.name)
          : (window.I18N?.field?.(p, 'name') ?? (p.name_cn || p.name || p.name_en || ''));
        const skillName = p.main_skill || '';
        const skillDisplayName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getMainSkillName === 'function')
          ? window.I18N.getMainSkillName(skillName)
          : skillName;
        const subInfo = typeof getSkillSubCategoryInfo === 'function'
          ? getSkillSubCategoryInfo(skillName, trackId)
          : { subKey: '', subLabel: '', fullLabel: skillDisplayName };
        const skillFullDisplay = typeof sanitizeSkillFullLabel === 'function'
          ? sanitizeSkillFullLabel(subInfo.fullLabel || skillDisplayName)
          : (subInfo.fullLabel || skillDisplayName);
        const iconUrl = p.icon_url || (p.formatted_no ? 'https://www.serebii.net/pokemonsleep/pokemon/icon/' + p.formatted_no + '.png' : '');

        return {
          p,
          procs: calcRes.procs,
          displayCount: calcRes.procs.toFixed(2),
          calcRes,
          pkmDisplayName,
          specialtyKey: specKey,
          specialtyDisplay: specDisplay,
          skillName,
          skillDisplayName,
          skillFullDisplay,
          subKey: subInfo.subKey,
          subLabel: subInfo.subLabel,
          iconUrl,
          isTopNode: false
        };
      }).filter(Boolean);

      nodes.sort((a, b) => b.procs - a.procs);
      if (nodes.length > 0) nodes[0].isTopNode = true;

      let visibleNodes = nodes;
      if (skillLadderTop15Only && visibleNodes.length > 10) {
        visibleNodes = visibleNodes.slice(0, 10);
      }

      visibleNodes.forEach(n => {
        if (n.procs < globalMinProcs) globalMinProcs = n.procs;
        if (n.procs > globalMaxProcs) globalMaxProcs = n.procs;
      });

      const trackMaxProcs = visibleNodes.length > 0 ? visibleNodes[0].procs : 0;

      return {
        track,
        trackId,
        trackName,
        trackDesc,
        nodes: visibleNodes,
        totalCount: nodes.length,
        trackMaxProcs,
        isTrackEmpty: visibleNodes.length === 0
      };
    });

    if (skillLadderSortOrder === 'PROCS_DESC') {
      processedTracks.sort((a, b) => b.trackMaxProcs - a.trackMaxProcs);
    } else if (skillLadderSortOrder === 'COUNT_DESC') {
      processedTracks.sort((a, b) => b.nodes.length - a.nodes.length);
    }

    // 每條軌道獨立排列：依次數由低到高等距分布於整條橫向天梯 (右側為次數最多)，
    // 不共用橫座標、不顯示次數/12h 標尺，避免低次數技能擠成一團。
    function getRankPosPct(idx, total) {
      if (total <= 1) return 50;
      const lo = 3;
      const hi = 97;
      return lo + ((total - 1 - idx) / (total - 1)) * (hi - lo);
    }

    return `
      <div class="wiki-coordinate-ladder-wrapper">
        <div class="wiki-coordinate-ladder wiki-skill-coordinate-ladder"
             onmouseover="window.WikiDB && window.WikiDB.handleLadderGroupHover && window.WikiDB.handleLadderGroupHover(event)"
             onmouseout="window.WikiDB && window.WikiDB.handleLadderGroupHoverOut && window.WikiDB.handleLadderGroupHoverOut(event)">
          ${processedTracks.map(({ track, trackName, trackDesc, nodes, isTrackEmpty }, trackIdx) => {
            const isTopTrack = trackIdx < 4;
            const popupDirectionClass = isTopTrack ? 'popup-down' : 'popup-up';

            return `
              <div class="ladder-track-row ${isTrackEmpty ? 'ladder-track-empty' : ''} ${isTopTrack ? 'ladder-track-top' : ''}" data-skill-track="${track.id}">
                <div class="ladder-track-header skill-ladder-track-header clickable-skill-header"
                     onclick="if(window.WikiSkillLadder&&typeof window.WikiSkillLadder.openCategoryModal==='function'){window.WikiSkillLadder.openCategoryModal('${_escapeHtml(track.id)}');}else if(window.WikiDB&&typeof window.WikiDB.openSkillRankingModal==='function'){window.WikiDB.openSkillRankingModal('${_escapeHtml(track.id)}');}"
                     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();if(window.WikiSkillLadder&&typeof window.WikiSkillLadder.openCategoryModal==='function'){window.WikiSkillLadder.openCategoryModal('${_escapeHtml(track.id)}');}else if(window.WikiDB&&typeof window.WikiDB.openSkillRankingModal==='function'){window.WikiDB.openSkillRankingModal('${_escapeHtml(track.id)}');}}"
                     role="button"
                     tabindex="0"
                     title="${_escapeHtml(trackName)} · ${_escapeHtml(trackDesc)} · ${window.I18N?.t?.('wiki.ldr_click_view_procs_rank') ?? '點擊查看發動次數排名'}">
                  <span class="skill-track-name-tag" style="color:${track.color};">
                    ${_escapeHtml(trackName)}
                  </span>
                  <span class="skill-track-count-tag text-secondary" style="display:none;">${nodes.length} ${window.I18N?.t?.('wiki.ldr_species_unit') ?? '種'}</span>
                </div>

                <div class="ladder-track-canvas">
                  <div class="ladder-track-line" style="left: 0; right: 0;"></div>

                  <div class="ladder-nodes-container" data-boundary-protection="clamp(12px, calc(100% - 12px))">
                    ${nodes.map((node, nodeIdx) => {
                      const basePosPct = getRankPosPct(nodeIdx, nodes.length);
                      const alignClass = basePosPct > 60 ? 'align-right' : (basePosPct < 40 ? 'align-left' : 'align-center');
                      const leftStyle = `clamp(20px, ${basePosPct.toFixed(2)}%, calc(100% - 20px))`;
                      const zIndex = node.isTopNode ? 50 : Math.max(40 - nodeIdx, 5);

                      const roundedIdealSec = Math.round(node.calcRes.idealIntervalSec);
                      const idealMin = Math.floor(roundedIdealSec / 60);
                      const idealSec = roundedIdealSec % 60;
                      const helpsDisplay = (node.calcRes.helps12h != null ? node.calcRes.helps12h : (43200 / node.calcRes.idealIntervalSec)).toFixed(1);

                      return `
                        <div class="ladder-node ${node.isTopNode ? 'node-top1' : ''} ${alignClass} ${popupDirectionClass} "
                             data-specialty="specialty-${node.specialtyKey}"
                             data-pkm="${_escapeHtml(node.p.name_cn || node.p.name)}"
                             data-pkm-group="pkm-${node.p.id}"
                             data-pkm-id="${node.p.id}"
                             style="left: ${leftStyle}; z-index: ${zIndex};">
                          <div class="node-avatar-wrapper">
                            <img src="${node.iconUrl}" class="node-avatar-img" alt="${_escapeHtml(node.pkmDisplayName)}" loading="lazy" decoding="async">
                          </div>
                          <div class="node-count-badge" title="${window.I18N?.t?.('wiki.ldr_12h_expected_triggers') ?? '日間 12h 預估發動次數：'}${node.displayCount}">
                            ${node.displayCount}
                          </div>

                          <div class="ladder-node-tooltip">
                            <div class="tooltip-yield-breakdown">
                              <div class="breakdown-row">
                                <span class="breakdown-label">${window.I18N?.t?.('wiki.ldr_main_skill_label') ?? '主技能：'}</span>
                                <span class="breakdown-val font-bold text-primary">${_escapeHtml(node.skillFullDisplay || node.skillDisplayName)}</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${window.I18N?.t?.('wiki.ldr_base_rate_label') ?? '基礎機率：'}</span>
                                <span class="breakdown-val">${(node.calcRes.baseSkillRate * 100).toFixed(2)}%</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${window.I18N?.t?.('wiki.ldr_final_rate_label') ?? '最終機率：'}</span>
                                <span class="breakdown-val text-accent font-bold">${(node.calcRes.finalSkillRate * 100).toFixed(2)}%</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${window.I18N?.t?.('wiki.ldr_ideal_interval_label') ?? '滿活力間隔 (0.45x)：'}</span>
                                <span class="breakdown-val">${idealMin}${window.I18N?.t?.('wiki.ldr_min_unit') ?? '分'}${String(idealSec).padStart(2, '0')}${window.I18N?.t?.('wiki.ldr_sec_unit') ?? '秒'}</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${window.I18N?.t?.('wiki.ldr_est_helps_12h_label') ?? '日間 12h 總幫忙次數：'}</span>
                                <span class="breakdown-val">${helpsDisplay} ${window.I18N?.t?.('wiki.ldr_helps_unit') ?? '次'}</span>
                              </div>
                            </div>
                            <div class="tooltip-detail" style="margin-top: 6px; text-align: center;">
                              <span class="text-success font-bold" style="font-size: 13.5px; letter-spacing: 0.3px;">${node.displayCount} ${window.I18N?.t?.('wiki.ldr_procs_12h_unit') ?? '次/12h'}</span>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function refreshSkillCoordinateLadder() {
    const container = document.getElementById('wiki-skill-ladder-coordinate');
    if (container) {
      container.innerHTML = renderSkillCoordinateLadder();
    }
    updateSkillLadderActiveFilterBadge();
  }

  function renderSkillLadderMobileHandle(currentWikiSubTab) {
    const isActive = currentWikiSubTab === 'skills_ladder';
    const fabLabel = window.I18N?.t?.('wiki.ldr_expand_skill_filter_fab') ?? '展開技能天梯篩選器';
    return `
      <!-- 右下懸浮技能天梯篩選按鈕 (Mobile FAB) -->
      <button type="button" id="skill-ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle sidebar-fab-btn ${isActive ? '' : 'drawer-open'}" onclick="window.WikiDB.openSkillLadderSidebar()" title="${fabLabel}" aria-label="${fabLabel}" style="${isActive ? 'display:flex;' : 'display:none;'}">
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
        <span id="skill-ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
      </button>
    `;
  }

  function renderSkillLadderSidebar(initialSkillLadderCollapsed, _legacyLangArg, subTab) {
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const currentSubTab = subTab || (typeof currentWikiSubTab !== 'undefined' ? currentWikiSubTab : (typeof window !== 'undefined' && typeof window.getCurrentSubTab === 'function' ? window.getCurrentSubTab() : 'skills_ladder'));
    const filterTitle = window.I18N?.t?.('wiki.ldr_filter_title') ?? '篩選器';
    const expandTitle = window.I18N?.t?.('wiki.ldr_expand_skill_sidebar') ?? '展開技能天梯篩選側邊欄';
    const collapseTitle = window.I18N?.t?.('wiki.ldr_collapse_sidebar') ?? '收合側邊欄';
    return `
      <aside id="skill-ladder-filter-sidebar" class="pokemon-filter-sidebar ladder-fixed-sidebar ${initialSkillLadderCollapsed}" style="${currentSubTab === 'skills_ladder' ? 'display:flex;' : 'display:none;'}" aria-label="${filterTitle}">
        ${!isMobileH5 ? `
          <button type="button" id="skill-ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle" onclick="window.WikiDB.toggleSkillLadderSidebar(true)" title="${expandTitle}" aria-label="${expandTitle}">
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
            <span class="bookmark-text">${window.I18N?.t?.('wiki.ldr_filter_bookmark') ?? '篩選'}</span>
            <span class="bookmark-arrow">◀</span>
            <span id="skill-ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
          </button>
        ` : ''}

        <div class="sidebar-header">
          <button type="button" id="skill-ladder-sidebar-close-btn" class="sidebar-close-btn" onclick="window.WikiDB.toggleSkillLadderSidebar(false)" title="${collapseTitle}" aria-label="${collapseTitle}">◀</button>
          <div class="sidebar-title-group" style="display:flex;align-items:center;gap:6px;">
            <span class="sidebar-title">${filterTitle}</span>
            <button type="button" class="pokedex-formula-help-btn ladder-formula-help-btn" onclick="window.WikiDB.toggleSkillLadderEnergyHelp(event)" title="${window.I18N?.t?.('wiki.ldr_skill_baseline_tooltip') ?? '基準：Lv.60 滿活力 (0.45x) 12小時'}" aria-label="Skill Ladder Energy Info">?</button>
          </div>
          <button type="button" id="skill-ladder-reset-all-btn" class="sidebar-reset-btn" onclick="window.WikiDB.resetSkillLadderFilters()" title="${window.I18N?.t?.('wiki.ldr_reset_all_title') ?? '重設所有條件'}">${window.I18N?.t?.('wiki.ldr_reset') ?? '重設'}</button>

          <div id="skill-ladder-energy-help-popover" class="ladder-energy-help-popover" style="display:none;" role="tooltip">
            <div class="pokedex-energy-help-backdrop" onclick="window.WikiDB.closeSkillLadderEnergyHelp(event)"></div>
            <div class="pokedex-energy-help-bubble ladder-energy-help-bubble">
              <div class="energy-help-title font-bold">${window.I18N?.t?.('wiki.ldr_skill_help_title') ?? '天梯基準：Lv.60 滿活力 (12h)'}</div>
              <div class="energy-help-body">
                ${window.I18N?.t?.('wiki.ldr_skill_help_body') ?? '以 Lv.60 滿活力理想狀態 (活力 ≥ 80%，間隔 0.45x) 試算日間 12 小時主技能發動次數：43200 / (有效間隔 * 0.45) * 最終技能機率。'}
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-scrollable-content">
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ldr_search_pokemon') ?? '搜尋寶可夢'}</span>
              <button type="button" id="skill-ladder-search-clear-btn" class="sidebar-section-clear-btn" style="${(typeof getSkillLadderSearchQuery === 'function' && getSkillLadderSearchQuery()) ? 'display:inline-block;' : 'display:none;'}" onclick="window.WikiDB.clearSkillLadderSearch()">${window.I18N?.t?.('wiki.ldr_clear_input') ?? '清空'}</button>
            </div>
            <div class="sidebar-search-box" style="margin-top: 4px;">
              <span class="sidebar-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"></circle>
                  <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                </svg>
              </span>
              <input type="text" id="skill-ladder-pkm-search-input" class="sidebar-search-input" placeholder="${window.I18N?.t?.('wiki.ldr_search_placeholder') ?? '搜尋寶可夢名稱...'}" value="${(typeof getSkillLadderSearchQuery === 'function' ? getSkillLadderSearchQuery() : '')}" oninput="window.WikiDB.onSkillLadderSearch(this.value)">
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ldr_track_sorting') ?? '天梯軌道排序'}</span>
              <label class="ladder-top15-switch-label" title="${window.I18N?.t?.('wiki.ldr_top10_tooltip') ?? '預設開啟前10名排行'}">
                <input type="checkbox" id="skill-ladder-top15-switch" class="ladder-switch-input" ${(typeof getSkillLadderTop15Only === 'function' ? getSkillLadderTop15Only() : true) ? 'checked' : ''} onchange="window.WikiDB.toggleSkillLadderTop15(this.checked)">
                <span class="ladder-switch-slider"></span>
                <span class="ladder-switch-text">${window.I18N?.t?.('wiki.ldr_top10') ?? '前10名'}</span>
              </label>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'DEFAULT') ? 'active' : ''}" data-skill-sort-order="DEFAULT" onclick="window.WikiDB.setSkillLadderSortOrder('DEFAULT')">${window.I18N?.t?.('wiki.ldr_sort_default') ?? '預設分類'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'PROCS_DESC') ? 'active' : ''}" data-skill-sort-order="PROCS_DESC" onclick="window.WikiDB.setSkillLadderSortOrder('PROCS_DESC')">${window.I18N?.t?.('wiki.ldr_sort_procs_desc') ?? '次數：多到少'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'COUNT_DESC') ? 'active' : ''}" data-skill-sort-order="COUNT_DESC" onclick="window.WikiDB.setSkillLadderSortOrder('COUNT_DESC')">${window.I18N?.t?.('wiki.ldr_sort_count_desc') ?? '數量：多到少'}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ldr_specialty_type') ?? '寶可夢專長'}</span>
              <label class="ladder-top15-switch-label" title="${window.I18N?.t?.('wiki.ldr_final_evo_tooltip') ?? '僅保留最終進化寶可夢'}">
                <input type="checkbox" id="skill-ladder-final-only-switch" class="ladder-switch-input" ${(typeof getSkillLadderFinalOnly === 'function' ? getSkillLadderFinalOnly() : true) ? 'checked' : ''} onchange="window.WikiDB.toggleSkillLadderFinalOnly(this.checked)">
                <span class="ladder-switch-slider"></span>
                <span class="ladder-switch-text">${window.I18N?.t?.('wiki.ldr_final_evo') ?? '最終進化'}</span>
              </label>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'ALL') ? 'active' : ''}" data-skill-specialty-filter="ALL" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('ALL')">${window.I18N?.t?.('wiki.ldr_all') ?? '全部'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'SKILL') ? 'active' : ''}" data-skill-specialty-filter="SKILL" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('SKILL')">${window.I18N?.t?.('wiki.ldr_spec_skill_short') ?? '技能型'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'BERRY') ? 'active' : ''}" data-skill-specialty-filter="BERRY" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('BERRY')">${window.I18N?.t?.('wiki.ldr_spec_berry_short') ?? '樹果型'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'INGREDIENT') ? 'active' : ''}" data-skill-specialty-filter="INGREDIENT" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('INGREDIENT')">${window.I18N?.t?.('wiki.ldr_spec_ing_short') ?? '食材型'}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ldr_subskills_sim') ?? '副技能補正模擬'}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${typeof isSkillLadderSpeedM !== 'undefined' && isSkillLadderSpeedM ? 'active' : ''}" id="skill-ladder-speed-m-toggle" data-skill-subskill-boost="SPEED_M" onclick="window.WikiDB.toggleSkillLadderSubskill('SPEED_M')">${window.I18N?.t?.('wiki.ldr_speed_m') ?? '幫忙速度M'}</button>
              <button type="button" class="tag-btn ${typeof isSkillLadderSpeedS !== 'undefined' && isSkillLadderSpeedS ? 'active' : ''}" id="skill-ladder-speed-s-toggle" data-skill-subskill-boost="SPEED_S" onclick="window.WikiDB.toggleSkillLadderSubskill('SPEED_S')">${window.I18N?.t?.('wiki.ldr_speed_s') ?? '幫忙速度S'}</button>
              <button type="button" class="tag-btn ${typeof isSkillLadderSkillM !== 'undefined' && isSkillLadderSkillM ? 'active' : ''}" id="skill-ladder-skill-m-toggle" data-skill-subskill-boost="SKILL_M" onclick="window.WikiDB.toggleSkillLadderSubskill('SKILL_M')">${window.I18N?.t?.('wiki.ldr_skill_m') ?? '技能機率M'}</button>
              <button type="button" class="tag-btn ${typeof isSkillLadderSkillS !== 'undefined' && isSkillLadderSkillS ? 'active' : ''}" id="skill-ladder-skill-s-toggle" data-skill-subskill-boost="SKILL_S" onclick="window.WikiDB.toggleSkillLadderSubskill('SKILL_S')">${window.I18N?.t?.('wiki.ldr_skill_s') ?? '技能機率S'}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${window.I18N?.t?.('wiki.ldr_nature_sim') ?? '性格補正模擬'}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${(typeof getSkillLadderNature === 'function' && getSkillLadderNature() === 'SPEED') ? 'active' : ''}" data-skill-nature-filter="SPEED" onclick="window.WikiDB.toggleSkillLadderNatureFilter('SPEED')">${window.I18N?.t?.('wiki.ldr_nature_speed') ?? '幫忙速度▲'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderNature === 'function' && getSkillLadderNature() === 'SKILL') ? 'active' : ''}" data-skill-nature-filter="SKILL" onclick="window.WikiDB.toggleSkillLadderNatureFilter('SKILL')">${window.I18N?.t?.('wiki.ldr_nature_skill') ?? '技能機率▲'}</button>
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  function attachSkillLadderExports(wikiExport, targetWindow) {
    const methods = {
      toggleSkillLadderSidebar: toggleSkillLadderSidebar,
      openSkillLadderSidebar: openSkillLadderSidebar,
      closeSkillLadderSidebar: closeSkillLadderSidebar,
      toggleSkillLadderEnergyHelp: toggleSkillLadderEnergyHelp,
      closeSkillLadderEnergyHelp: closeSkillLadderEnergyHelp,
      resetSkillLadderFilters: resetSkillLadderFilters,
      onSkillLadderSearch: onSkillLadderSearch,
      setSkillLadderSearchQuery: setSkillLadderSearchQuery,
      getSkillLadderSearchQuery: getSkillLadderSearchQuery,
      clearSkillLadderSearch: clearSkillLadderSearch,
      toggleSkillLadderTop15: toggleSkillLadderTop15,
      getSkillLadderTop15Only: getSkillLadderTop15Only,
      toggleSkillLadderFinalOnly: typeof toggleSkillLadderFinalOnly === 'function' ? toggleSkillLadderFinalOnly : null,
      getSkillLadderFinalOnly: typeof getSkillLadderFinalOnly === 'function' ? getSkillLadderFinalOnly : null,
      isPokemonSkillLadderFinalEvo: typeof isPokemonSkillLadderFinalEvo === 'function' ? isPokemonSkillLadderFinalEvo : null,
      openSkillRankingModal: typeof openSkillRankingModal === 'function' ? openSkillRankingModal : null,
      openSkillLadderCategoryModal: typeof openSkillLadderCategoryModal === 'function' ? openSkillLadderCategoryModal : (typeof openSkillRankingModal === 'function' ? openSkillRankingModal : null),
      openCategoryModal: typeof openSkillLadderCategoryModal === 'function' ? openSkillLadderCategoryModal : (typeof openSkillRankingModal === 'function' ? openSkillRankingModal : null),
      closeSkillRankingModal: typeof closeSkillRankingModal === 'function' ? closeSkillRankingModal : null,
      setSkillLadderSortOrder: setSkillLadderSortOrder,
      getSkillLadderSortOrder: getSkillLadderSortOrder,
      setSkillLadderSpecialtyFilter: setSkillLadderSpecialtyFilter,
      getSkillLadderSpecialtyFilter: getSkillLadderSpecialtyFilter,
      toggleSkillLadderSubskill: toggleSkillLadderSubskill,
      toggleSkillLadderNatureFilter: toggleSkillLadderNatureFilter,
      getSkillLadderNature: getSkillLadderNature,
      refreshSkillCoordinateLadder: refreshSkillCoordinateLadder,
      renderSkillCoordinateLadder: renderSkillCoordinateLadder,
      updateSkillLadderActiveFilterBadge: updateSkillLadderActiveFilterBadge,
      POKEMON_SKILLS_BASELINE_DATA: typeof POKEMON_SKILLS_BASELINE_DATA !== 'undefined' ? POKEMON_SKILLS_BASELINE_DATA : [],
      SKILL_TRACK_DEFINITIONS: typeof SKILL_TRACK_DEFINITIONS !== 'undefined' ? SKILL_TRACK_DEFINITIONS : [],
      COMPOSITE_SKILL_TRACKS: typeof COMPOSITE_SKILL_TRACKS !== 'undefined' ? COMPOSITE_SKILL_TRACKS : {},
      getPokemonSkillLadderProcs: typeof getPokemonSkillLadderProcs === 'function' ? getPokemonSkillLadderProcs : null,
      isExcludedSkill: typeof isExcludedSkill === 'function' ? isExcludedSkill : null,
      getSkillTracks: typeof getSkillTracks === 'function' ? getSkillTracks : null,
      getSkillSubCategoryInfo: typeof getSkillSubCategoryInfo === 'function' ? getSkillSubCategoryInfo : null,
      getSkillLadderSpecialtyIcon: typeof getSkillLadderSpecialtyIcon === 'function' ? getSkillLadderSpecialtyIcon : null
    };

    if (wikiExport && typeof wikiExport === 'object') {
      Object.assign(wikiExport, methods);
    }
    if (targetWindow && typeof targetWindow === 'object') {
      Object.assign(targetWindow, methods);
    }
  }
