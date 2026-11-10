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
    const isEN = typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function' && window.I18N.getLanguage() === 'en-US';
    const allPkm = getAllSkillPokemonList();

    let globalMaxProcs = 4.0;
    const processedTracks = SKILL_TRACK_DEFINITIONS.map(track => {
      const trackId = track.id;
      const trackName = isEN ? track.name_en : track.name;
      const trackDesc = isEN ? track.desc_en : track.desc;

      const matchingPokemon = allPkm.filter(p => {
        if (!p || isExcludedSkill(p.main_skill)) return false;
        const tracks = getSkillTracks(p.main_skill);
        if (!tracks.includes(trackId)) return false;

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
            matched = nCn.includes(q) || nEn.includes(q) || (nJp && nJp.includes(q)) || !!numMatch;
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
        const specDisplay = isEN
          ? (specKey === 'berry' ? 'Berries' : specKey === 'ingredient' ? 'Ingredients' : 'Skills')
          : (specKey === 'berry' ? '樹果型' : specKey === 'ingredient' ? '食材型' : '技能型');

        const pkmDisplayName = isEN ? ((typeof window !== 'undefined' && window.I18N && typeof window.I18N.getPokemonName === 'function' && window.I18N.getPokemonName(p.name_cn || p.name)) || p.name_en || p.name_cn) : (p.name_cn || p.name);
        const skillName = p.main_skill || '';
        const skillDisplayName = isEN ? ((typeof window !== 'undefined' && window.I18N && typeof window.I18N.getMainSkillName === 'function' && window.I18N.getMainSkillName(skillName)) || skillName) : skillName;
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
          iconUrl,
          isTopNode: false
        };
      }).filter(Boolean);

      nodes.sort((a, b) => b.procs - a.procs);
      if (nodes.length > 0) nodes[0].isTopNode = true;

      let visibleNodes = nodes;
      if (skillLadderTop15Only && visibleNodes.length > 15) {
        visibleNodes = visibleNodes.slice(0, 15);
      }

      visibleNodes.forEach(n => {
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

    const minVal = 0;
    const maxVal = Math.max(4, Math.ceil(globalMaxProcs * 1.05));
    const step = maxVal > 14 ? 2 : 1;
    const ticks = [];
    for (let t = minVal; t <= maxVal; t += step) ticks.push(t);
    if (ticks[ticks.length - 1] < maxVal) ticks.push(maxVal);

    function getPosPct(val) {
      const clamped = Math.min(Math.max(val, minVal), maxVal);
      return (((clamped - minVal) / (maxVal - minVal)) * 100).toFixed(2);
    }

    return `
      <div class="wiki-coordinate-ladder-wrapper">
        <div class="wiki-coordinate-ladder">
          <div class="ladder-ruler-header">
            <div class="ladder-ruler-spacer">
              <span class="text-secondary font-bold" style="font-size: 11px; letter-spacing: 0.5px;">${isEN ? 'Procs/12h' : '發動次數/12h'}</span>
            </div>
            <div class="ladder-ruler-scale">
              ${ticks.map(t => `
                <div class="ladder-ruler-tick" style="left: ${getPosPct(t)}%;">
                  <span class="tick-label">${t}</span>
                  <div class="tick-line"></div>
                </div>
              `).join('')}
            </div>
          </div>

          ${processedTracks.map(({ track, trackName, trackDesc, nodes, isTrackEmpty }, trackIdx) => {
            const isTopTrack = trackIdx < 4;
            const popupDirectionClass = isTopTrack ? 'popup-down' : 'popup-up';

            let minTrackCount = maxVal;
            nodes.forEach(n => {
              if (n.procs < minTrackCount) minTrackCount = n.procs;
            });
            if (minTrackCount >= maxVal || isTrackEmpty) minTrackCount = minVal;
            const leadPct = getPosPct(minTrackCount);

            const clusters = [];
            let currentCluster = [];
            nodes.forEach(n => {
              if (currentCluster.length === 0) {
                currentCluster.push(n);
              } else {
                const head = currentCluster[0];
                const prev = currentCluster[currentCluster.length - 1];
                if (Math.abs(prev.procs - n.procs) <= 0.12 && Math.abs(head.procs - n.procs) <= 0.25) {
                  currentCluster.push(n);
                } else {
                  clusters.push(currentCluster);
                  currentCluster = [n];
                }
              }
            });
            if (currentCluster.length > 0) clusters.push(currentCluster);

            const nodeClusterMap = new Map();
            clusters.forEach(cluster => {
              cluster.forEach((nodeItem, cIdx) => {
                nodeClusterMap.set(nodeItem, {
                  groupSize: cluster.length,
                  itemIdx: cIdx
                });
              });
            });

            return `
              <div class="ladder-track-row ${isTrackEmpty ? 'ladder-track-empty' : ''} ${isTopTrack ? 'ladder-track-top' : ''}" data-skill-track="${track.id}">
                <div class="ladder-track-header" title="${_escapeHtml(trackName)} · ${_escapeHtml(trackDesc)}">
                  <div class="ladder-track-ing-main skill-track-icon-main" style="display:flex;align-items:center;justify-content:center;">
                    <span class="skill-track-icon-wrapper" style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:${track.bgColor};color:${track.color};">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                        ${track.svgPath}
                      </svg>
                    </span>
                  </div>
                  <div class="skill-track-header-title-box" style="margin-left: 8px; overflow: hidden;">
                    <span class="font-bold text-primary" style="font-size: 13px; display: block; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${_escapeHtml(trackName)}</span>
                    <span class="text-secondary" style="font-size: 11px; display: block; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${nodes.length} ${isEN ? 'species' : '種寶可夢'}</span>
                  </div>
                </div>

                <div class="ladder-track-canvas">
                  <div class="ladder-grid-lines">
                    ${ticks.map(t => `<div class="ladder-grid-line" style="left: ${getPosPct(t)}%;"></div>`).join('')}
                  </div>
                  <div class="ladder-track-lead-line" style="left: 0; width: ${leadPct}%;"></div>
                  <div class="ladder-track-line" style="left: ${leadPct}%; right: 0;"></div>

                  <div class="ladder-nodes-container">
                    ${nodes.map((node, nodeIdx) => {
                      const clusterInfo = nodeClusterMap.get(node) || { groupSize: 1, itemIdx: 0 };
                      const groupSize = clusterInfo.groupSize;
                      const itemIdx = clusterInfo.itemIdx;

                      let offsetPx = 0;
                      if (groupSize > 1) {
                        const staggerStep = groupSize >= 6 ? 12 : (groupSize >= 4 ? 15 : 18);
                        // nodes is sorted descending, so itemIdx = 0 has highest procs and shifts right (+),
                        // while itemIdx = groupSize - 1 has lowest procs and shifts left (-)
                        offsetPx = Math.round(((groupSize - 1) / 2 - itemIdx) * staggerStep);
                      }

                      const basePosPct = parseFloat(getPosPct(node.procs));
                      const alignClass = basePosPct > 60 ? 'align-right' : (basePosPct < 40 ? 'align-left' : 'align-center');
                      const leftStyle = offsetPx === 0
                        ? `clamp(12px, ${basePosPct}%, calc(100% - 12px))`
                        : `clamp(12px, calc(${basePosPct}% + ${offsetPx}px), calc(100% - 12px))`;
                      const zIndex = node.isTopNode ? 50 : Math.max(40 - nodeIdx, 5);

                      const idealMin = Math.floor(node.calcRes.idealIntervalSec / 60);
                      const idealSec = Math.round(node.calcRes.idealIntervalSec % 60);

                      return `
                        <div class="ladder-node ${node.isTopNode ? 'node-top1' : ''} ${alignClass} ${popupDirectionClass} ${groupSize > 1 ? 'node-in-cluster' : ''}"
                             data-pkm="${_escapeHtml(node.p.name_cn || node.p.name)}"
                             style="left: ${leftStyle}; z-index: ${zIndex};">
                          <div class="node-avatar-wrapper">
                            <img src="${node.iconUrl}" class="node-avatar-img" alt="${_escapeHtml(node.pkmDisplayName)}" loading="lazy" decoding="async">
                          </div>
                          <div class="node-count-badge" title="${isEN ? '12h Expected Triggers: ' : '日間 12h 預估發動次數：'}${node.displayCount}">
                            ${node.displayCount}
                          </div>

                          <div class="ladder-node-tooltip">
                            <div class="tooltip-title">
                              ${node.isTopNode ? (isEN ? 'Top 1 ' : 'TOP 1 ') : ''}${_escapeHtml(node.pkmDisplayName)}
                              <span class="node-specialty-tag specialty-${node.specialtyKey}" style="margin-left: 6px; font-size: 10px; padding: 1px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: var(--accent-color, #38bdf8);">${node.specialtyDisplay}</span>
                            </div>
                            <div class="tooltip-detail">
                              ${isEN ? 'Est. 12h Triggers: ' : '預估 12h 發動：'}
                              <span class="text-success font-bold">${node.displayCount} ${isEN ? 'procs/12h' : '次/12h'}</span>
                            </div>
                            <div class="tooltip-yield-breakdown">
                              <div class="breakdown-row">
                                <span class="breakdown-label">${isEN ? 'Main Skill:' : '主技能：'}</span>
                                <span class="breakdown-val font-bold text-primary">${_escapeHtml(node.skillDisplayName)}</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${isEN ? 'Base Rate:' : '基礎機率：'}</span>
                                <span class="breakdown-val">${(node.calcRes.baseSkillRate * 100).toFixed(2)}%</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${isEN ? 'Final Rate:' : '最終機率：'}</span>
                                <span class="breakdown-val text-accent font-bold">${(node.calcRes.finalSkillRate * 100).toFixed(2)}%</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${isEN ? 'Ideal Interval (0.45x):' : '滿活力間隔 (0.45x)：'}</span>
                                <span class="breakdown-val">${idealMin}${isEN ? 'm ' : '分'}${idealSec}${isEN ? 's' : '秒'}</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${isEN ? 'Est. Helps (12h):' : '日間 12h 總幫忙次數：'}</span>
                                <span class="breakdown-val">${(43200 / node.calcRes.idealIntervalSec).toFixed(1)} ${isEN ? 'helps' : '次'}</span>
                              </div>
                            </div>
                            <div class="tooltip-note" style="margin-top: 6px; font-size: 11px; line-height: 1.4; color: var(--text-secondary);">
                              ${isEN ? 'Formula: 43200 / (effectiveInterval * 0.45) * finalSkillRate' : '計算公式：43200 / (有效間隔 * 0.45) * 最終技能機率'}
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

  function renderSkillLadderMobileHandle(currentWikiSubTab, isEN) {
    return `
      <!-- 右下懸浮技能天梯篩選按鈕 (Mobile FAB) -->
      <button type="button" id="skill-ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle sidebar-fab-btn" onclick="window.WikiDB.openSkillLadderSidebar()" title="${isEN ? 'Filter' : '展開技能天梯篩選器'}" aria-label="${isEN ? 'Filter' : '展開技能天梯篩選器'}" style="${currentWikiSubTab === 'skills_ladder' ? 'display:flex;' : 'display:none;'}">
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

  function renderSkillLadderSidebar(initialSkillLadderCollapsed, isEN, subTab) {
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const currentSubTab = subTab || (typeof currentWikiSubTab !== 'undefined' ? currentWikiSubTab : (typeof window !== 'undefined' && typeof window.getCurrentSubTab === 'function' ? window.getCurrentSubTab() : 'skills_ladder'));
    return `
      <aside id="skill-ladder-filter-sidebar" class="pokemon-filter-sidebar ladder-fixed-sidebar ${initialSkillLadderCollapsed}" style="${currentSubTab === 'skills_ladder' ? 'display:flex;' : 'display:none;'}" aria-label="${isEN ? 'Skill Filters' : '技能天梯篩選器'}">
        ${!isMobileH5 ? `
          <button type="button" id="skill-ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle" onclick="window.WikiDB.toggleSkillLadderSidebar(true)" title="${isEN ? 'Expand Filter' : '展開技能天梯篩選側邊欄'}" aria-label="${isEN ? 'Expand Filter' : '展開技能天梯篩選側邊欄'}">
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
            <span class="bookmark-text">${isEN ? 'Filter' : '篩選'}</span>
            <span class="bookmark-arrow">◀</span>
            <span id="skill-ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
          </button>
        ` : ''}

        <div class="sidebar-header">
          <button type="button" id="skill-ladder-sidebar-close-btn" class="sidebar-close-btn" onclick="window.WikiDB.toggleSkillLadderSidebar(false)" title="${isEN ? 'Collapse Filter' : '收合側邊欄'}" aria-label="${isEN ? 'Collapse Filter' : '收合側邊欄'}">◀</button>
          <div class="sidebar-title-group" style="display:flex;align-items:center;gap:6px;">
            <span class="sidebar-title">${isEN ? 'Skill Filters' : '技能天梯篩選器'}</span>
            <button type="button" class="pokedex-formula-help-btn ladder-formula-help-btn" onclick="window.WikiDB.toggleSkillLadderEnergyHelp(event)" title="${isEN ? 'Baseline: Lv.60 Ideal Energy (0.45x) 12h' : '基準：Lv.60 滿活力 (0.45x) 12小時'}" aria-label="Skill Ladder Energy Info">?</button>
          </div>
          <button type="button" id="skill-ladder-reset-all-btn" class="sidebar-reset-btn" onclick="window.WikiDB.resetSkillLadderFilters()" title="${isEN ? 'Reset Filters' : '重設所有條件'}">${isEN ? 'Reset' : '全部重設'}</button>

          <div id="skill-ladder-energy-help-popover" class="ladder-energy-help-popover" style="display:none;" role="tooltip">
            <div class="pokedex-energy-help-backdrop" onclick="window.WikiDB.closeSkillLadderEnergyHelp(event)"></div>
            <div class="pokedex-energy-help-bubble ladder-energy-help-bubble">
              <div class="energy-help-title font-bold">${isEN ? 'Baseline: Lv.60 Ideal Energy (12h)' : '天梯基準：Lv.60 滿活力 (12h)'}</div>
              <div class="energy-help-body">
                ${isEN
                  ? 'Calculated at Lv.60 under ideal energy (≥80%, 0.45x interval) for daytime 12-hour procs: 43200 / (effectiveInterval * 0.45) * finalSkillRate.'
                  : '以 Lv.60 滿活力理想狀態 (活力 ≥ 80%，間隔 0.45x) 試算日間 12 小時主技能發動次數：43200 / (有效間隔 * 0.45) * 最終技能機率。'}
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-scrollable-content">
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Search Pokémon' : '搜尋寶可夢'}</span>
              <button type="button" id="skill-ladder-search-clear-btn" class="sidebar-section-clear-btn" style="${(typeof getSkillLadderSearchQuery === 'function' && getSkillLadderSearchQuery()) ? 'display:inline-block;' : 'display:none;'}" onclick="window.WikiDB.clearSkillLadderSearch()">${isEN ? 'Clear' : '清空'}</button>
            </div>
            <div class="sidebar-search-box" style="margin-top: 4px;">
              <span class="sidebar-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"></circle>
                  <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                </svg>
              </span>
              <input type="text" id="skill-ladder-pkm-search-input" class="sidebar-search-input" placeholder="${isEN ? 'Search Pokémon...' : '搜尋寶可夢名稱...'}" value="${(typeof getSkillLadderSearchQuery === 'function' ? getSkillLadderSearchQuery() : '')}" oninput="window.WikiDB.onSkillLadderSearch(this.value)">
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Track Sorting' : '天梯軌道排序'}</span>
              <label class="ladder-top15-switch-label" title="${isEN ? 'Show Top 15 Only' : '預設開啟前15名排行'}">
                <input type="checkbox" id="skill-ladder-top15-switch" class="ladder-switch-input" ${(typeof getSkillLadderTop15Only === 'function' ? getSkillLadderTop15Only() : true) ? 'checked' : ''} onchange="window.WikiDB.toggleSkillLadderTop15(this.checked)">
                <span class="ladder-switch-slider"></span>
                <span class="ladder-switch-text">${isEN ? 'Top 15' : '前15名'}</span>
              </label>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'DEFAULT') ? 'active' : ''}" data-skill-sort-order="DEFAULT" onclick="window.WikiDB.setSkillLadderSortOrder('DEFAULT')">${isEN ? 'Default' : '預設分類'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'PROCS_DESC') ? 'active' : ''}" data-skill-sort-order="PROCS_DESC" onclick="window.WikiDB.setSkillLadderSortOrder('PROCS_DESC')">${isEN ? 'Procs: High-Low' : '次數：多到少'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'COUNT_DESC') ? 'active' : ''}" data-skill-sort-order="COUNT_DESC" onclick="window.WikiDB.setSkillLadderSortOrder('COUNT_DESC')">${isEN ? 'Species: High-Low' : '數量：多到少'}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Specialty Type' : '寶可夢專長'}</span>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'ALL') ? 'active' : ''}" data-skill-specialty-filter="ALL" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('ALL')">${isEN ? 'All' : '全部'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'SKILL') ? 'active' : ''}" data-skill-specialty-filter="SKILL" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('SKILL')">${isEN ? 'Skill' : '技能型'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'BERRY') ? 'active' : ''}" data-skill-specialty-filter="BERRY" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('BERRY')">${isEN ? 'Berry' : '樹果型'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'INGREDIENT') ? 'active' : ''}" data-skill-specialty-filter="INGREDIENT" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('INGREDIENT')">${isEN ? 'Ingredient' : '食材型'}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Sub-Skills' : '副技能補正模擬'}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${typeof isSkillLadderSpeedM !== 'undefined' && isSkillLadderSpeedM ? 'active' : ''}" id="skill-ladder-speed-m-toggle" data-skill-subskill-boost="SPEED_M" onclick="window.WikiDB.toggleSkillLadderSubskill('SPEED_M')">${isEN ? 'Help Speed M' : '幫忙速度M'}</button>
              <button type="button" class="tag-btn ${typeof isSkillLadderSpeedS !== 'undefined' && isSkillLadderSpeedS ? 'active' : ''}" id="skill-ladder-speed-s-toggle" data-skill-subskill-boost="SPEED_S" onclick="window.WikiDB.toggleSkillLadderSubskill('SPEED_S')">${isEN ? 'Help Speed S' : '幫忙速度S'}</button>
              <button type="button" class="tag-btn ${typeof isSkillLadderSkillM !== 'undefined' && isSkillLadderSkillM ? 'active' : ''}" id="skill-ladder-skill-m-toggle" data-skill-subskill-boost="SKILL_M" onclick="window.WikiDB.toggleSkillLadderSubskill('SKILL_M')">${isEN ? 'Skill Trigger M' : '技能機率M'}</button>
              <button type="button" class="tag-btn ${typeof isSkillLadderSkillS !== 'undefined' && isSkillLadderSkillS ? 'active' : ''}" id="skill-ladder-skill-s-toggle" data-skill-subskill-boost="SKILL_S" onclick="window.WikiDB.toggleSkillLadderSubskill('SKILL_S')">${isEN ? 'Skill Trigger S' : '技能機率S'}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Nature Boost' : '性格補正模擬'}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${(typeof getSkillLadderNature === 'function' && getSkillLadderNature() === 'SPEED') ? 'active' : ''}" data-skill-nature-filter="SPEED" onclick="window.WikiDB.toggleSkillLadderNatureFilter('SPEED')">${isEN ? 'Help Speed ▲' : '幫忙速度▲'}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderNature === 'function' && getSkillLadderNature() === 'SKILL') ? 'active' : ''}" data-skill-nature-filter="SKILL" onclick="window.WikiDB.toggleSkillLadderNatureFilter('SKILL')">${isEN ? 'Skill Chance ▲' : '技能機率▲'}</button>
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
      getSkillTracks: typeof getSkillTracks === 'function' ? getSkillTracks : null
    };

    if (wikiExport && typeof wikiExport === 'object') {
      Object.assign(wikiExport, methods);
    }
    if (targetWindow && typeof targetWindow === 'object') {
      Object.assign(targetWindow, methods);
    }
  }
