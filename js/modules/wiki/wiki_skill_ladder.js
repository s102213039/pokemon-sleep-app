  // =========================================================================
  // 主技能天梯邏輯與控制器 (Main Skill Ladder Controller)
  // =========================================================================

  let skillLadderSearchQuery = '';
  let skillLadderTop15Only = true;
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
