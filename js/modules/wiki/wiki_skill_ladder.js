  // =========================================================================
  // 主技能天梯邏輯與控制器 (Main Skill Ladder Controller)
  // =========================================================================

  let skillLadderSearchQuery = '';
  let skillLadderTop15Only = true;
  let skillLadderFinalOnly = false;
  let skillLadderSortOrder = 'DEFAULT';
  let skillLadderSpecialtyFilter = 'ALL';
  let isSkillLadderSpeedM = false;
  let isSkillLadderSpeedS = false;
  let isSkillLadderSkillM = false;
  let isSkillLadderSkillS = false;
  let skillLadderNatureSpeed = false;
  let skillLadderNatureSkill = false;

  function parseIntervalToSec(intervalStr) {
    if (!intervalStr) return 3600;
    const str = String(intervalStr).trim();
    if (str.includes(':')) {
      const parts = str.split(':').map(n => parseInt(n, 10));
      if (parts.length === 3 && parts.every(n => !isNaN(n) && n >= 0)) {
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
      } else if (parts.length === 2 && parts.every(n => !isNaN(n) && n >= 0)) {
        return (parts[0] * 60) + parts[1];
      }
      return 3600;
    }
    const num = parseFloat(str);
    return (!isNaN(num) && Number.isFinite(num)) ? num : 3600;
  }

  function getPokemonSkillLadderProcs(pkm) {
    if (!pkm) return null;
    const rawInterval = pkm.interval || pkm.help_interval || pkm.frequency || '';
    const baseIntervalSec = parseIntervalToSec(rawInterval);
    const speedDiscount = 0.118;
    const speedReduction = Math.min(0.35, (isSkillLadderSpeedM ? 0.14 : 0) + (isSkillLadderSpeedS ? 0.07 : 0));
    const natureSpeedMult = skillLadderNatureSpeed ? 0.90 : 1.0;
    const effectiveIntervalSec = Math.max(600, Math.round(baseIntervalSec * (1 - speedDiscount) * (1 - speedReduction) * natureSpeedMult));
    const idealIntervalSec = effectiveIntervalSec * 0.45;
    const helps12h = 43200 / idealIntervalSec;

    let baseRate = 0.03;
    const rawRate = pkm.skill_rate || pkm.skillRate;
    if (rawRate !== undefined && rawRate !== null) {
      let parsedRate;
      if (typeof rawRate === 'number') {
        parsedRate = rawRate <= 1 ? rawRate : rawRate / 100;
      } else {
        const strRate = String(rawRate).trim();
        if (strRate.includes('%')) {
          parsedRate = parseFloat(strRate) / 100;
        } else {
          const val = parseFloat(strRate);
          parsedRate = (!isNaN(val) && val <= 1) ? val : val / 100;
        }
      }
      if (!isNaN(parsedRate) && Number.isFinite(parsedRate) && parsedRate > 0) {
        baseRate = Math.min(1.0, parsedRate);
      }
    }
    const subskillRateBonus = (isSkillLadderSkillM ? 0.36 : 0) + (isSkillLadderSkillS ? 0.18 : 0);
    const natureSkillMult = skillLadderNatureSkill ? 1.20 : 1.0;
    const finalSkillRate = baseRate * (1 + subskillRateBonus) * natureSkillMult;
    const procs = helps12h * finalSkillRate;

    const mainSkill = pkm.main_skill || pkm.mainSkill || pkm.skill || '';

    return {
      procs,
      helps12h,
      effectiveIntervalSec,
      idealIntervalSec,
      baseSkillRate: baseRate,
      finalSkillRate,
      mainSkill
    };
  }

  function getAllSkillPokemonList() {
    if (typeof window !== 'undefined') {
      if (window.PokemonApp && Array.isArray(window.PokemonApp.allPokemons) && window.PokemonApp.allPokemons.length > 0) {
        return window.PokemonApp.allPokemons;
      }
      if (Array.isArray(window.allPokemons) && window.allPokemons.length > 0) {
        return window.allPokemons;
      }
      if (Array.isArray(window.allPokemon) && window.allPokemon.length > 0) {
        return window.allPokemon;
      }
    }
    return POKEMON_SKILLS_BASELINE_DATA;
  }

  function handleSkillLadderSubTabSwitch(targetTab, isWikiMainActive, isMobileH5) {
    const sidebar = document.getElementById('skill-ladder-filter-sidebar');
    const handles = document.querySelectorAll('#skill-ladder-sidebar-bookmark-handle');
    const backdrop = document.getElementById('skill-ladder-sidebar-backdrop');

    if (sidebar) {
      if (isWikiMainActive && targetTab === 'skills_ladder') {
        sidebar.style.display = 'flex';
        const isOpen = typeof window.getSidebarSavedState === 'function' ? window.getSidebarSavedState('pksleep_skill_ladder_sidebar_open', true) : true;
        if (isOpen && !isMobileH5 && window.innerWidth > 1024) {
          sidebar.classList.remove('collapsed');
        } else {
          sidebar.classList.add('collapsed');
          if (backdrop) backdrop.classList.remove('active');
        }
      } else {
        sidebar.style.display = 'none';
        sidebar.classList.add('collapsed');
        if (backdrop) backdrop.classList.remove('active');
      }
    }

    if (handles && handles.length > 0) {
      handles.forEach(handle => {
        if (isWikiMainActive && targetTab === 'skills_ladder') {
          const isCollapsed = sidebar ? sidebar.classList.contains('collapsed') : true;
          if (isCollapsed) {
            handle.classList.remove('drawer-open');
            handle.style.display = 'flex';
            handle.style.opacity = '1';
            handle.style.pointerEvents = 'auto';
            handle.style.visibility = 'visible';
          } else {
            handle.classList.add('drawer-open');
            handle.style.display = 'none';
            handle.style.opacity = '0';
            handle.style.pointerEvents = 'none';
            handle.style.visibility = 'hidden';
          }
        } else {
          handle.classList.add('drawer-open');
          handle.style.display = 'none';
          handle.style.opacity = '0';
          handle.style.pointerEvents = 'none';
        }
      });
      if (isWikiMainActive && targetTab === 'skills_ladder') {
        updateSkillLadderActiveFilterBadge();
      }
    }

    if (targetTab === 'skills_ladder') {
      try {
        if (typeof refreshSkillCoordinateLadder === 'function') {
          refreshSkillCoordinateLadder();
        }
      } catch (e) {}
    }
  }

  function getSkillLadderSearchQuery() {
    return skillLadderSearchQuery;
  }

  function setSkillLadderSearchQuery(val) {
    onSkillLadderSearch(val);
  }

  function onSkillLadderSearch(val) {
    skillLadderSearchQuery = (val || '').trim();
    const clearBtns = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('#skill-ladder-search-clear-btn')
      : [];
    clearBtns.forEach(b => {
      b.style.display = skillLadderSearchQuery ? 'inline-block' : 'none';
    });
    refreshSkillCoordinateLadder();
  }

  function clearSkillLadderSearch() {
    skillLadderSearchQuery = '';
    const inputs = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('#skill-ladder-pkm-search-input')
      : [];
    inputs.forEach(input => { input.value = ''; });
    const singleInput = (typeof document !== 'undefined' && typeof document.getElementById === 'function')
      ? document.getElementById('skill-ladder-pkm-search-input')
      : null;
    if (singleInput) singleInput.value = '';

    const clearBtns = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('#skill-ladder-search-clear-btn')
      : [];
    clearBtns.forEach(b => { b.style.display = 'none'; });
    refreshSkillCoordinateLadder();
  }

  function toggleSkillLadderTop15(enabled) {
    skillLadderTop15Only = enabled !== undefined ? !!enabled : !skillLadderTop15Only;
    const switches = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('#skill-ladder-top15-switch')
      : [];
    switches.forEach(s => { s.checked = skillLadderTop15Only; });
    refreshSkillCoordinateLadder();
  }

  function getSkillLadderTop15Only() {
    return skillLadderTop15Only;
  }

  function isPokemonSkillLadderFinalEvo(p) {
    if (!p) return false;
    const raw = p.is_final !== undefined && p.is_final !== null ? p.is_final : p.isFinal;
    if (raw === '〇' || raw === 'O' || raw === 'o' || raw === true || raw === '1' || raw === 1) return true;
    const base = (typeof POKEMON_SKILLS_BASELINE_DATA !== 'undefined' && Array.isArray(POKEMON_SKILLS_BASELINE_DATA))
      ? POKEMON_SKILLS_BASELINE_DATA.find(item => (item.id && String(item.id) === String(p.id)) || (item.name_cn && item.name_cn === (p.name_cn || p.name)))
      : null;
    if (base && (base.is_final === '〇' || base.is_final === 'O' || base.is_final === 'o' || base.is_final === true || base.is_final === '1')) {
      return true;
    }
    return false;
  }

  function toggleSkillLadderFinalOnly(enabled) {
    skillLadderFinalOnly = enabled !== undefined ? !!enabled : !skillLadderFinalOnly;
    const switches = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('#skill-ladder-final-only-switch')
      : [];
    switches.forEach(s => { s.checked = skillLadderFinalOnly; });
    refreshSkillCoordinateLadder();
  }

  function getSkillLadderFinalOnly() {
    return skillLadderFinalOnly;
  }

  function setSkillLadderSortOrder(order) {
    skillLadderSortOrder = order || 'DEFAULT';
    const btns = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('[data-skill-sort-order]')
      : [];
    btns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-skill-sort-order') === skillLadderSortOrder);
    });
    refreshSkillCoordinateLadder();
  }

  function getSkillLadderSortOrder() {
    return skillLadderSortOrder;
  }

  function setSkillLadderSpecialtyFilter(spec) {
    skillLadderSpecialtyFilter = spec || 'ALL';
    const btns = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('[data-skill-specialty-filter]')
      : [];
    btns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-skill-specialty-filter') === skillLadderSpecialtyFilter);
    });
    refreshSkillCoordinateLadder();
  }

  function getSkillLadderSpecialtyFilter() {
    return skillLadderSpecialtyFilter;
  }

  function toggleSkillLadderSubskill(key) {
    if (key === 'SPEED_M') isSkillLadderSpeedM = !isSkillLadderSpeedM;
    else if (key === 'SPEED_S') isSkillLadderSpeedS = !isSkillLadderSpeedS;
    else if (key === 'SKILL_M') isSkillLadderSkillM = !isSkillLadderSkillM;
    else if (key === 'SKILL_S') isSkillLadderSkillS = !isSkillLadderSkillS;
    syncSkillLadderSidebarButtons();
    refreshSkillCoordinateLadder();
  }

  function toggleSkillLadderNatureFilter(key) {
    if (key === 'SPEED') {
      skillLadderNatureSpeed = !skillLadderNatureSpeed;
      if (skillLadderNatureSpeed) skillLadderNatureSkill = false;
    } else if (key === 'SKILL') {
      skillLadderNatureSkill = !skillLadderNatureSkill;
      if (skillLadderNatureSkill) skillLadderNatureSpeed = false;
    }
    syncSkillLadderSidebarButtons();
    refreshSkillCoordinateLadder();
  }

  function getSkillLadderNature() {
    if (skillLadderNatureSpeed) return 'SPEED';
    if (skillLadderNatureSkill) return 'SKILL';
    return 'NONE';
  }

  function syncSkillLadderSidebarButtons() {
    const flags = {
      SPEED_M: isSkillLadderSpeedM,
      SPEED_S: isSkillLadderSpeedS,
      SKILL_M: isSkillLadderSkillM,
      SKILL_S: isSkillLadderSkillS
    };
    const subBtns = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('[data-skill-subskill-boost]')
      : [];
    subBtns.forEach(btn => {
      const k = btn.getAttribute('data-skill-subskill-boost');
      btn.classList.toggle('active', !!flags[k]);
    });

    const natBtns = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('[data-skill-nature-filter]')
      : [];
    natBtns.forEach(btn => {
      const k = btn.getAttribute('data-skill-nature-filter');
      const active = (k === 'SPEED' && skillLadderNatureSpeed) || (k === 'SKILL' && skillLadderNatureSkill);
      btn.classList.toggle('active', !!active);
    });
  }

  function resetSkillLadderFilters() {
    skillLadderSearchQuery = '';
    skillLadderTop15Only = true;
    skillLadderFinalOnly = false;
    skillLadderSortOrder = 'DEFAULT';
    skillLadderSpecialtyFilter = 'ALL';
    isSkillLadderSpeedM = false;
    isSkillLadderSpeedS = false;
    isSkillLadderSkillM = false;
    isSkillLadderSkillS = false;
    skillLadderNatureSpeed = false;
    skillLadderNatureSkill = false;

    const inputs = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('#skill-ladder-pkm-search-input')
      : [];
    inputs.forEach(input => { input.value = ''; });
    const singleInput = (typeof document !== 'undefined' && typeof document.getElementById === 'function')
      ? document.getElementById('skill-ladder-pkm-search-input')
      : null;
    if (singleInput) singleInput.value = '';

    const clearBtns = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('#skill-ladder-search-clear-btn')
      : [];
    clearBtns.forEach(b => { b.style.display = 'none'; });

    const switches = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('#skill-ladder-top15-switch')
      : [];
    switches.forEach(s => { s.checked = true; });

    const finalSwitches = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('#skill-ladder-final-only-switch')
      : [];
    finalSwitches.forEach(s => { s.checked = false; });

    const sortBtns = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('[data-skill-sort-order]')
      : [];
    sortBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-skill-sort-order') === 'DEFAULT'));

    const specBtns = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('[data-skill-specialty-filter]')
      : [];
    specBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-skill-specialty-filter') === 'ALL'));

    syncSkillLadderSidebarButtons();
    updateSkillLadderActiveFilterBadge();
    refreshSkillCoordinateLadder();
  }

  function updateSkillLadderActiveFilterBadge() {
    let count = 0;
    if (skillLadderSearchQuery && skillLadderSearchQuery.trim()) count++;
    if (skillLadderSpecialtyFilter && skillLadderSpecialtyFilter !== 'ALL') count++;
    if (skillLadderSortOrder && skillLadderSortOrder !== 'DEFAULT') count++;
    if (!skillLadderTop15Only) count++;
    if (skillLadderFinalOnly) count++;
    if (isSkillLadderSpeedM || isSkillLadderSpeedS || isSkillLadderSkillM || isSkillLadderSkillS) count++;
    if (skillLadderNatureSpeed || skillLadderNatureSkill) count++;

    const badges = (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function')
      ? document.querySelectorAll('#skill-ladder-sidebar-bookmark-badge')
      : [];
    if (badges && badges.length > 0) {
      badges.forEach(badge => {
        if (count > 0) {
          badge.textContent = count;
          badge.style.display = 'inline-flex';
        } else {
          badge.style.display = 'none';
        }
      });
    } else {
      const badge = (typeof document !== 'undefined' && typeof document.getElementById === 'function')
        ? document.getElementById('skill-ladder-sidebar-bookmark-badge')
        : null;
      if (badge) {
        if (count > 0) {
          badge.textContent = count;
          badge.style.display = 'inline-flex';
        } else {
          badge.style.display = 'none';
        }
      }
    }
  }

  function openSkillLadderSidebar() {
    toggleSkillLadderSidebar(true);
  }

  function closeSkillLadderSidebar() {
    toggleSkillLadderSidebar(false);
  }

  function toggleSkillLadderSidebar(forceOpen) {
    const sidebar = document.getElementById('skill-ladder-filter-sidebar');
    const handles = document.querySelectorAll('#skill-ladder-sidebar-bookmark-handle');
    const backdrop = document.getElementById('skill-ladder-sidebar-backdrop');
    if (!sidebar) return;

    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    let open;
    if (typeof forceOpen === 'boolean') {
      open = forceOpen;
    } else {
      open = sidebar.classList.contains('collapsed');
    }

    if (open) {
      sidebar.classList.remove('collapsed');
      if (backdrop) backdrop.classList.add('active');
      if (handles && handles.length > 0) {
        handles.forEach(handle => {
          if (isMobileH5) {
            handle.classList.add('drawer-open');
          } else {
            handle.classList.add('drawer-open');
            handle.style.display = 'none';
          }
        });
      }
      if (typeof window.saveSidebarState === 'function') {
        window.saveSidebarState('pksleep_skill_ladder_sidebar_open', true);
      }
    } else {
      sidebar.classList.add('collapsed');
      if (backdrop) backdrop.classList.remove('active');
      if (handles && handles.length > 0) {
        handles.forEach(handle => {
          handle.classList.remove('drawer-open');
          handle.style.display = 'flex';
          handle.style.opacity = '1';
          handle.style.pointerEvents = 'auto';
          handle.style.visibility = 'visible';
        });
      }
      if (typeof window.saveSidebarState === 'function') {
        window.saveSidebarState('pksleep_skill_ladder_sidebar_open', false);
      }
    }
    updateSkillLadderActiveFilterBadge();
  }

  function toggleSkillLadderEnergyHelp(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const popover = document.getElementById('skill-ladder-energy-help-popover');
    if (!popover) return;
    const isVisible = popover.style.display !== 'none';
    popover.style.display = isVisible ? 'none' : 'block';
  }

  function closeSkillLadderEnergyHelp(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const popover = document.getElementById('skill-ladder-energy-help-popover');
    if (popover) popover.style.display = 'none';
  }

  function openSkillRankingModal(trackId) {
    if (!trackId) return;
    const isEN = typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function' && window.I18N.getLanguage() === 'en-US';
    const trackDef = (typeof SKILL_TRACK_DEFINITIONS !== 'undefined' && Array.isArray(SKILL_TRACK_DEFINITIONS))
      ? SKILL_TRACK_DEFINITIONS.find(t => t.id === trackId)
      : null;
    if (!trackDef) return;

    const trackName = isEN ? trackDef.name_en : trackDef.name;
    const trackDesc = isEN ? trackDef.desc_en : trackDef.desc;
    const allPkm = getAllSkillPokemonList();

    const matchingPokemon = allPkm.filter(p => {
      if (!p || isExcludedSkill(p.main_skill)) return false;
      const tracks = getSkillTracks(p.main_skill);
      if (!tracks.includes(trackId)) return false;

      if (skillLadderFinalOnly && !isPokemonSkillLadderFinalEvo(p)) return false;

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

    const rankingList = matchingPokemon.map(p => {
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
        name: p.name_cn || p.name,
        pkmDisplayName,
        iconUrl,
        procs: calcRes.procs,
        displayProcs: calcRes.procs.toFixed(2),
        finalRatePct: (calcRes.finalSkillRate * 100).toFixed(2),
        helpsDisplay: (calcRes.helps12h != null ? calcRes.helps12h : (43200 / calcRes.idealIntervalSec)).toFixed(1),
        specKey,
        specDisplay,
        skillDisplayName
      };
    }).filter(Boolean);

    rankingList.sort((a, b) => b.procs - a.procs);

    let currentDenseRank = 0;
    let lastProcsStr = null;
    const rankedList = rankingList.map(item => {
      if (lastProcsStr === null || item.displayProcs !== lastProcsStr) {
        currentDenseRank++;
        lastProcsStr = item.displayProcs;
      }
      return {
        ...item,
        rank: currentDenseRank
      };
    });

    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return rankedList;

    let modal = document.getElementById('wiki-skill-ranking-modal');
    if (!modal && typeof document.createElement === 'function') {
      modal = document.createElement('div');
      modal.id = 'wiki-skill-ranking-modal';
      modal.className = 'ing-rank-modal-overlay modal-overlay';
      if (document.body && typeof document.body.appendChild === 'function') {
        document.body.appendChild(modal);
      }
    }
    if (!modal) return rankedList;

    const esc = typeof escapeHtml === 'function' ? escapeHtml : function (s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };

    const itemsHTML = rankedList.length === 0 ? `
      <div class="ing-rank-empty">
        <p>${isEN ? 'No Pokémon matched current skill ladder filter conditions.' : '當前篩選條件下查無符合之寶可夢。'}</p>
      </div>
    ` : `
      <div class="ing-rank-list">
        ${rankedList.map(item => {
          const rank = item.rank;
          const rankClass = rank === 1 ? 'rank-1' : (rank === 2 ? 'rank-2' : (rank === 3 ? 'rank-3' : 'rank-other'));
          return `
            <div class="ing-rank-card ${rankClass}" title="${esc(item.pkmDisplayName)} (${esc(item.skillDisplayName)}) · ${item.displayProcs} ${isEN ? 'procs/12h' : '次/12h'}">
              <div class="ing-rank-left">
                <div class="ing-rank-num ${rankClass}">
                  #${rank}
                </div>
                <div class="ing-rank-avatar-box ${rankClass}">
                  <img src="${item.iconUrl}" class="ing-rank-avatar-img" alt="${esc(item.pkmDisplayName)}" loading="lazy">
                </div>
                <div class="skill-rank-meta-col" style="display:flex;flex-direction:column;gap:1px;min-width:0;">
                  <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                    <span class="font-bold text-primary" style="font-size:12.5px;">${esc(item.pkmDisplayName)}</span>
                    <span class="node-specialty-tag specialty-${item.specKey}" style="font-size:9.5px;padding:1px 5px;border-radius:4px;background:rgba(255,255,255,0.08);color:var(--accent-color, #38bdf8);">${esc(item.specDisplay)}</span>
                  </div>
                  <span class="text-secondary" style="font-size:10.5px;">${esc(item.skillDisplayName)}</span>
                </div>
              </div>
              <div class="ing-rank-right">
                <span class="ing-rank-yield-line"><span class="ing-rank-yield-num">${item.displayProcs}</span><span class="ing-rank-yield-unit">${isEN ? ' /12h' : ' 次/12h'}</span></span>
                <span class="ing-rank-split-line" style="font-size:10px;color:var(--text-muted);" title="${isEN ? 'Final Skill Rate / 12h Helps' : '最終技能機率 / 日間 12h 幫忙次數'}">
                  ${item.finalRatePct}% · ${item.helpsDisplay}${isEN ? 'h' : '次'}
                </span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    modal.innerHTML = `
      <div class="ing-rank-dialog" onclick="event.stopPropagation()">
        <div class="ing-rank-header">
          <div class="ing-rank-title-group">
            <div class="ing-rank-header-text">
              <div class="ing-rank-header-title">
                <span class="skill-track-name-tag" style="background:${trackDef.bgColor}; color:${trackDef.color}; border: 1px solid ${trackDef.color}40; max-width:none; font-size:12.5px; padding:3px 10px;">
                  ${esc(trackName)}
                </span>
              </div>
              <div class="ing-rank-header-sub">
                <span>${esc(trackDesc)} · ${isEN ? 'Lv.60 Ideal Energy (0.45x)' : 'Lv.60 滿活力 (0.45x)'} · ${rankedList.length} ${isEN ? 'Pokémon' : '隻寶可夢'}</span>
              </div>
            </div>
          </div>
          <button type="button" class="ing-rank-close-btn" onclick="window.WikiDB.closeSkillRankingModal()" title="${isEN ? 'Close' : '關閉'}" aria-label="Close">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="ing-rank-body">
          ${itemsHTML}
        </div>
      </div>
    `;

    if (typeof window !== 'undefined' && typeof window.prepareOverlayOpen === 'function') {
      window.prepareOverlayOpen(modal);
    }
    modal.style.display = 'flex';
    modal.onclick = closeSkillRankingModal;

    if (typeof document.addEventListener === 'function') {
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          closeSkillRankingModal();
          if (typeof document.removeEventListener === 'function') {
            document.removeEventListener('keydown', handleEsc);
          }
        }
      };
      document.addEventListener('keydown', handleEsc);
    }
    return rankedList;
  }

  function closeSkillRankingModal() {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    const modal = document.getElementById('wiki-skill-ranking-modal');
    if (!modal) return;
    const wipe = () => { modal.innerHTML = ''; };
    if (typeof window !== 'undefined' && typeof window.animateOverlayClose === 'function') {
      window.animateOverlayClose(modal, wipe);
    } else {
      modal.style.display = 'none';
      wipe();
    }
  }
