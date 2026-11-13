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

  var _tSkillLadder = (typeof window !== 'undefined' && window.WikiSkillLadder && typeof window.WikiSkillLadder._tSkillLadder === 'function')
    ? window.WikiSkillLadder._tSkillLadder
    : function (zhTw, en) {
        if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function') {
          const lang = window.I18N.getLanguage();
          if (lang === 'en-US') return en !== undefined ? en : zhTw;
          if (lang === 'zh-CN' && typeof window.I18N.toSimplified === 'function') return window.I18N.toSimplified(zhTw);
        }
        return zhTw;
      };

  function renderSkillCoordinateLadder() {
    const isEN = typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function' && window.I18N.getLanguage() === 'en-US';
    const allPkm = getAllSkillPokemonList();

    let globalMinProcs = Infinity;
    let globalMaxProcs = -Infinity;
    const processedTracks = SKILL_TRACK_DEFINITIONS.map(track => {
      const trackId = track.id;
      const trackName = _tSkillLadder(track.name_cn || track.name, track.name_en);
      const trackDesc = _tSkillLadder(track.desc_cn || track.desc, track.desc_en);

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
          ? _tSkillLadder('樹果型', 'Berries')
          : (specKey === 'ingredient')
            ? _tSkillLadder('食材型', 'Ingredients')
            : _tSkillLadder('技能型', 'Skills');

        const pkmDisplayName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getPokemonName === 'function')
          ? window.I18N.getPokemonName(p.name_cn || p.name)
          : (isEN ? (p.name_en || p.name_cn || p.name) : (p.name_cn || p.name));
        const skillName = p.main_skill || '';
        const skillDisplayName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getMainSkillName === 'function')
          ? window.I18N.getMainSkillName(skillName)
          : skillName;
        const subInfo = typeof getSkillSubCategoryInfo === 'function'
          ? getSkillSubCategoryInfo(skillName, trackId, isEN)
          : { subKey: '', subLabel: '', fullLabel: skillDisplayName };
        let skillFullDisplay = subInfo.fullLabel || skillDisplayName;
        if (skillFullDisplay) {
          skillFullDisplay = skillFullDisplay
            .replace(/(?:[（\(]\s*隨機\s*[）\)])(?:\s*[（\(]\s*隨機\s*[）\)])+/g, '（隨機）')
            .replace(/(?:[（\(]\s*Random\s*[）\)])(?:\s*[（\(]\s*Random\s*[）\)])+/gi, isEN ? '(Random)' : '（Random）')
            .replace(/(?:[（\(]\s*固定\s*[）\)])(?:\s*[（\(]\s*固定\s*[）\)])+/g, '（固定）')
            .replace(/(?:[（\(]\s*Fixed\s*[）\)])(?:\s*[（\(]\s*Fixed\s*[）\)])+/gi, isEN ? '(Fixed)' : '（Fixed）')
            .replace(/[（\(]\s*([^）\(\)\s]+(?:\s+[^）\(\)\s]+)*)\s*[）\)](?:\s*[（\(]\s*\1\s*[）\)])+/gi, (m, p1) => isEN ? `(${p1})` : `（${p1}）`);
        }
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
      if (skillLadderTop15Only && visibleNodes.length > 15) {
        visibleNodes = visibleNodes.slice(0, 15);
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

    let minVal = 0;
    let maxVal = 4;
    if (globalMinProcs !== Infinity && globalMaxProcs !== -Infinity) {
      if (Math.abs(globalMaxProcs - globalMinProcs) < 0.01) {
        minVal = Math.max(0, Number((globalMinProcs - 0.5).toFixed(2)));
        maxVal = Number((globalMaxProcs + 0.5).toFixed(2));
      } else {
        minVal = Number(globalMinProcs.toFixed(2));
        maxVal = Number(globalMaxProcs.toFixed(2));
      }
    }

    const range = maxVal - minVal;
    const ticks = [minVal];
    if (range > 0.05) {
      const step = range > 10 ? 2 : (range > 3.5 ? 1 : 0.5);
      const minGap = range * 0.08;
      let cand = Math.ceil(minVal / step) * step;
      while (cand < maxVal) {
        const cleanCand = Number(cand.toFixed(2));
        if ((cleanCand - minVal) >= minGap && (maxVal - cleanCand) >= minGap) {
          ticks.push(cleanCand);
        }
        cand += step;
      }
      ticks.push(maxVal);
    } else {
      ticks.push(maxVal);
    }

    function getPosPct(val) {
      if (maxVal <= minVal) return '0.00';
      const clamped = Math.min(Math.max(val, minVal), maxVal);
      return (((clamped - minVal) / (maxVal - minVal)) * 100).toFixed(2);
    }

    return `
      <div class="wiki-coordinate-ladder-wrapper">
        <div class="wiki-coordinate-ladder wiki-skill-coordinate-ladder"
             onmouseover="window.WikiDB && window.WikiDB.handleLadderGroupHover && window.WikiDB.handleLadderGroupHover(event)"
             onmouseout="window.WikiDB && window.WikiDB.handleLadderGroupHoverOut && window.WikiDB.handleLadderGroupHoverOut(event)">
          <div class="ladder-ruler-header">
            <div class="ladder-ruler-spacer skill-ladder-ruler-spacer">
              <span class="text-secondary font-bold skill-ruler-label" style="font-size: 11px; letter-spacing: 0.5px;">${_tSkillLadder('次數/12h', 'Procs/12h')}</span>
            </div>
            <div class="ladder-ruler-scale">
              ${ticks.map(t => `
                <div class="ladder-ruler-tick" style="left: ${getPosPct(t)}%;">
                  <span class="tick-label">${typeof t === 'number' ? (Number.isInteger(t) ? t : Number(t.toFixed(2))) : t}</span>
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
                if (Math.abs(prev.procs - n.procs) <= 0.30 && Math.abs(head.procs - n.procs) <= 0.65) {
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
                <div class="ladder-track-header skill-ladder-track-header clickable-skill-header"
                     onclick="if(window.WikiSkillLadder&&typeof window.WikiSkillLadder.openCategoryModal==='function'){window.WikiSkillLadder.openCategoryModal('${_escapeHtml(track.id)}');}else if(window.WikiDB&&typeof window.WikiDB.openSkillRankingModal==='function'){window.WikiDB.openSkillRankingModal('${_escapeHtml(track.id)}');}"
                     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();if(window.WikiSkillLadder&&typeof window.WikiSkillLadder.openCategoryModal==='function'){window.WikiSkillLadder.openCategoryModal('${_escapeHtml(track.id)}');}else if(window.WikiDB&&typeof window.WikiDB.openSkillRankingModal==='function'){window.WikiDB.openSkillRankingModal('${_escapeHtml(track.id)}');}}"
                     role="button"
                     tabindex="0"
                     title="${_escapeHtml(trackName)} · ${_escapeHtml(trackDesc)} · ${_tSkillLadder('點擊查看發動次數排名', 'Click to view rankings')}">
                  <span class="skill-track-name-tag" style="color:${track.color};">
                    ${_escapeHtml(trackName)}
                  </span>
                  <span class="skill-track-count-tag text-secondary" style="display:none;">${nodes.length} ${_tSkillLadder('種', 'species')}</span>
                </div>

                <div class="ladder-track-canvas">
                  <div class="ladder-grid-lines">
                    ${ticks.map(t => `<div class="ladder-grid-line" style="left: ${getPosPct(t)}%;"></div>`).join('')}
                  </div>
                  <div class="ladder-track-lead-line" style="left: 0; width: ${leadPct}%;"></div>
                  <div class="ladder-track-line" style="left: ${leadPct}%; right: 0;"></div>

                  <div class="ladder-nodes-container" data-boundary-protection="clamp(12px, calc(100% - 12px))">
                    ${nodes.map((node, nodeIdx) => {
                      const clusterInfo = nodeClusterMap.get(node) || { groupSize: 1, itemIdx: 0 };
                      const groupSize = clusterInfo.groupSize;
                      const itemIdx = clusterInfo.itemIdx;

                      let offsetPx = 0;
                      if (groupSize > 1) {
                        const staggerStep = groupSize >= 7 ? 30 : (groupSize >= 4 ? 36 : 42);
                        // nodes is sorted descending, so itemIdx = 0 has highest procs and shifts right (+),
                        // while itemIdx = groupSize - 1 has lowest procs and shifts left (-)
                        offsetPx = Math.round(((groupSize - 1) / 2 - itemIdx) * staggerStep);
                      }

                      const basePosPct = parseFloat(getPosPct(node.procs));
                      const alignClass = basePosPct > 60 ? 'align-right' : (basePosPct < 40 ? 'align-left' : 'align-center');
                      const leftStyle = offsetPx === 0
                        ? `clamp(20px, ${basePosPct}%, calc(100% - 20px))`
                        : `clamp(20px, calc(${basePosPct}% + ${offsetPx}px), calc(100% - 20px))`;
                      const zIndex = node.isTopNode ? 50 : Math.max(40 - nodeIdx, 5);

                      const roundedIdealSec = Math.round(node.calcRes.idealIntervalSec);
                      const idealMin = Math.floor(roundedIdealSec / 60);
                      const idealSec = roundedIdealSec % 60;
                      const helpsDisplay = (node.calcRes.helps12h != null ? node.calcRes.helps12h : (43200 / node.calcRes.idealIntervalSec)).toFixed(1);

                      return `
                        <div class="ladder-node ${node.isTopNode ? 'node-top1' : ''} ${alignClass} ${popupDirectionClass} ${groupSize > 1 ? 'node-in-cluster' : ''}"
                             data-specialty="specialty-${node.specialtyKey}"
                             data-pkm="${_escapeHtml(node.p.name_cn || node.p.name)}"
                             data-pkm-group="pkm-${node.p.id}"
                             data-pkm-id="${node.p.id}"
                             style="left: ${leftStyle}; z-index: ${zIndex};">
                          <div class="node-avatar-wrapper">
                            <img src="${node.iconUrl}" class="node-avatar-img" alt="${_escapeHtml(node.pkmDisplayName)}" loading="lazy" decoding="async">
                          </div>
                          <div class="node-count-badge" title="${_tSkillLadder('日間 12h 預估發動次數：', '12h Expected Triggers: ')}${node.displayCount}">
                            ${node.displayCount}
                          </div>

                          <div class="ladder-node-tooltip">
                            <div class="tooltip-yield-breakdown">
                              <div class="breakdown-row">
                                <span class="breakdown-label">${_tSkillLadder('主技能：', 'Main Skill:')}</span>
                                <span class="breakdown-val font-bold text-primary">${_escapeHtml(node.skillFullDisplay || node.skillDisplayName)}</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${_tSkillLadder('基礎機率：', 'Base Rate:')}</span>
                                <span class="breakdown-val">${(node.calcRes.baseSkillRate * 100).toFixed(2)}%</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${_tSkillLadder('最終機率：', 'Final Rate:')}</span>
                                <span class="breakdown-val text-accent font-bold">${(node.calcRes.finalSkillRate * 100).toFixed(2)}%</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${_tSkillLadder('滿活力間隔 (0.45x)：', 'Ideal Interval (0.45x):')}</span>
                                <span class="breakdown-val">${idealMin}${_tSkillLadder('分', 'm ')}${String(idealSec).padStart(2, '0')}${_tSkillLadder('秒', 's')}</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">${_tSkillLadder('日間 12h 總幫忙次數：', 'Est. Helps (12h):')}</span>
                                <span class="breakdown-val">${helpsDisplay} ${_tSkillLadder('次', 'helps')}</span>
                              </div>
                            </div>
                            <div class="tooltip-detail" style="margin-top: 6px; text-align: center;">
                              <span class="text-success font-bold" style="font-size: 13.5px; letter-spacing: 0.3px;">${node.displayCount} ${_tSkillLadder('次/12h', 'procs/12h')}</span>
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
      <button type="button" id="skill-ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle sidebar-fab-btn" onclick="window.WikiDB.openSkillLadderSidebar()" title="${_tSkillLadder('展開技能天梯篩選器', 'Filter')}" aria-label="${_tSkillLadder('展開技能天梯篩選器', 'Filter')}" style="${currentWikiSubTab === 'skills_ladder' ? 'display:flex;' : 'display:none;'}">
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
      <aside id="skill-ladder-filter-sidebar" class="pokemon-filter-sidebar ladder-fixed-sidebar ${initialSkillLadderCollapsed}" style="${currentSubTab === 'skills_ladder' ? 'display:flex;' : 'display:none;'}" aria-label="${_tSkillLadder('技能天梯篩選器', 'Skill Filters')}">
        ${!isMobileH5 ? `
          <button type="button" id="skill-ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle" onclick="window.WikiDB.toggleSkillLadderSidebar(true)" title="${_tSkillLadder('展開技能天梯篩選側邊欄', 'Expand Filter')}" aria-label="${_tSkillLadder('展開技能天梯篩選側邊欄', 'Expand Filter')}">
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
            <span class="bookmark-text">${_tSkillLadder('篩選', 'Filter')}</span>
            <span class="bookmark-arrow">◀</span>
            <span id="skill-ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
          </button>
        ` : ''}

        <div class="sidebar-header">
          <button type="button" id="skill-ladder-sidebar-close-btn" class="sidebar-close-btn" onclick="window.WikiDB.toggleSkillLadderSidebar(false)" title="${_tSkillLadder('收合側邊欄', 'Collapse Filter')}" aria-label="${_tSkillLadder('收合側邊欄', 'Collapse Filter')}">◀</button>
          <div class="sidebar-title-group" style="display:flex;align-items:center;gap:6px;">
            <span class="sidebar-title">${_tSkillLadder('技能天梯篩選器', 'Skill Filters')}</span>
            <button type="button" class="pokedex-formula-help-btn ladder-formula-help-btn" onclick="window.WikiDB.toggleSkillLadderEnergyHelp(event)" title="${_tSkillLadder('基準：Lv.60 滿活力 (0.45x) 12小時', 'Baseline: Lv.60 Ideal Energy (0.45x) 12h')}" aria-label="Skill Ladder Energy Info">?</button>
          </div>
          <button type="button" id="skill-ladder-reset-all-btn" class="sidebar-reset-btn" onclick="window.WikiDB.resetSkillLadderFilters()" title="${_tSkillLadder('重設所有條件', 'Reset Filters')}">${_tSkillLadder('全部重設', 'Reset')}</button>

          <div id="skill-ladder-energy-help-popover" class="ladder-energy-help-popover" style="display:none;" role="tooltip">
            <div class="pokedex-energy-help-backdrop" onclick="window.WikiDB.closeSkillLadderEnergyHelp(event)"></div>
            <div class="pokedex-energy-help-bubble ladder-energy-help-bubble">
              <div class="energy-help-title font-bold">${_tSkillLadder('天梯基準：Lv.60 滿活力 (12h)', 'Baseline: Lv.60 Ideal Energy (12h)')}</div>
              <div class="energy-help-body">
                ${_tSkillLadder(
                  '以 Lv.60 滿活力理想狀態 (活力 ≥ 80%，間隔 0.45x) 試算日間 12 小時主技能發動次數：43200 / (有效間隔 * 0.45) * 最終技能機率。',
                  'Calculated at Lv.60 under ideal energy (≥80%, 0.45x interval) for daytime 12-hour procs: 43200 / (effectiveInterval * 0.45) * finalSkillRate.'
                )}
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-scrollable-content">
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tSkillLadder('搜尋寶可夢', 'Search Pokémon')}</span>
              <button type="button" id="skill-ladder-search-clear-btn" class="sidebar-section-clear-btn" style="${(typeof getSkillLadderSearchQuery === 'function' && getSkillLadderSearchQuery()) ? 'display:inline-block;' : 'display:none;'}" onclick="window.WikiDB.clearSkillLadderSearch()">${_tSkillLadder('清空', 'Clear')}</button>
            </div>
            <div class="sidebar-search-box" style="margin-top: 4px;">
              <span class="sidebar-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"></circle>
                  <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                </svg>
              </span>
              <input type="text" id="skill-ladder-pkm-search-input" class="sidebar-search-input" placeholder="${_tSkillLadder('搜尋寶可夢名稱...', 'Search Pokémon...')}" value="${(typeof getSkillLadderSearchQuery === 'function' ? getSkillLadderSearchQuery() : '')}" oninput="window.WikiDB.onSkillLadderSearch(this.value)">
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tSkillLadder('天梯軌道排序', 'Track Sorting')}</span>
              <label class="ladder-top15-switch-label" title="${_tSkillLadder('預設開啟前15名排行', 'Show Top 15 Only')}">
                <input type="checkbox" id="skill-ladder-top15-switch" class="ladder-switch-input" ${(typeof getSkillLadderTop15Only === 'function' ? getSkillLadderTop15Only() : true) ? 'checked' : ''} onchange="window.WikiDB.toggleSkillLadderTop15(this.checked)">
                <span class="ladder-switch-slider"></span>
                <span class="ladder-switch-text">${_tSkillLadder('前15名', 'Top 15')}</span>
              </label>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'DEFAULT') ? 'active' : ''}" data-skill-sort-order="DEFAULT" onclick="window.WikiDB.setSkillLadderSortOrder('DEFAULT')">${_tSkillLadder('預設分類', 'Default')}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'PROCS_DESC') ? 'active' : ''}" data-skill-sort-order="PROCS_DESC" onclick="window.WikiDB.setSkillLadderSortOrder('PROCS_DESC')">${_tSkillLadder('次數：多到少', 'Procs: High-Low')}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'COUNT_DESC') ? 'active' : ''}" data-skill-sort-order="COUNT_DESC" onclick="window.WikiDB.setSkillLadderSortOrder('COUNT_DESC')">${_tSkillLadder('數量：多到少', 'Species: High-Low')}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tSkillLadder('寶可夢專長', 'Specialty Type')}</span>
              <label class="ladder-top15-switch-label" title="${_tSkillLadder('僅保留最終進化寶可夢', 'Show Final Evolution Only')}">
                <input type="checkbox" id="skill-ladder-final-only-switch" class="ladder-switch-input" ${(typeof getSkillLadderFinalOnly === 'function' ? getSkillLadderFinalOnly() : true) ? 'checked' : ''} onchange="window.WikiDB.toggleSkillLadderFinalOnly(this.checked)">
                <span class="ladder-switch-slider"></span>
                <span class="ladder-switch-text">${_tSkillLadder('最終進化', 'Final Evo')}</span>
              </label>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'ALL') ? 'active' : ''}" data-skill-specialty-filter="ALL" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('ALL')">${_tSkillLadder('全部', 'All')}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'SKILL') ? 'active' : ''}" data-skill-specialty-filter="SKILL" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('SKILL')">${_tSkillLadder('技能型', 'Skill')}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'BERRY') ? 'active' : ''}" data-skill-specialty-filter="BERRY" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('BERRY')">${_tSkillLadder('樹果型', 'Berry')}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'INGREDIENT') ? 'active' : ''}" data-skill-specialty-filter="INGREDIENT" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('INGREDIENT')">${_tSkillLadder('食材型', 'Ingredient')}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tSkillLadder('副技能補正模擬', 'Sub-Skills')}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${typeof isSkillLadderSpeedM !== 'undefined' && isSkillLadderSpeedM ? 'active' : ''}" id="skill-ladder-speed-m-toggle" data-skill-subskill-boost="SPEED_M" onclick="window.WikiDB.toggleSkillLadderSubskill('SPEED_M')">${_tSkillLadder('幫忙速度M', 'Help Speed M')}</button>
              <button type="button" class="tag-btn ${typeof isSkillLadderSpeedS !== 'undefined' && isSkillLadderSpeedS ? 'active' : ''}" id="skill-ladder-speed-s-toggle" data-skill-subskill-boost="SPEED_S" onclick="window.WikiDB.toggleSkillLadderSubskill('SPEED_S')">${_tSkillLadder('幫忙速度S', 'Help Speed S')}</button>
              <button type="button" class="tag-btn ${typeof isSkillLadderSkillM !== 'undefined' && isSkillLadderSkillM ? 'active' : ''}" id="skill-ladder-skill-m-toggle" data-skill-subskill-boost="SKILL_M" onclick="window.WikiDB.toggleSkillLadderSubskill('SKILL_M')">${_tSkillLadder('技能機率M', 'Skill Trigger M')}</button>
              <button type="button" class="tag-btn ${typeof isSkillLadderSkillS !== 'undefined' && isSkillLadderSkillS ? 'active' : ''}" id="skill-ladder-skill-s-toggle" data-skill-subskill-boost="SKILL_S" onclick="window.WikiDB.toggleSkillLadderSubskill('SKILL_S')">${_tSkillLadder('技能機率S', 'Skill Trigger S')}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${_tSkillLadder('性格補正模擬', 'Nature Boost')}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${(typeof getSkillLadderNature === 'function' && getSkillLadderNature() === 'SPEED') ? 'active' : ''}" data-skill-nature-filter="SPEED" onclick="window.WikiDB.toggleSkillLadderNatureFilter('SPEED')">${_tSkillLadder('幫忙速度▲', 'Help Speed ▲')}</button>
              <button type="button" class="tag-btn ${(typeof getSkillLadderNature === 'function' && getSkillLadderNature() === 'SKILL') ? 'active' : ''}" data-skill-nature-filter="SKILL" onclick="window.WikiDB.toggleSkillLadderNatureFilter('SKILL')">${_tSkillLadder('技能機率▲', 'Skill Chance ▲')}</button>
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  function attachSkillLadderExports(wikiExport, targetWindow) {
    const methods = {
      _tSkillLadder: _tSkillLadder,
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
