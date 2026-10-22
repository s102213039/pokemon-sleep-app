  function getLadderMultiplier() {
    let mult = 1.0;
    // 副技能加成：食材機率 (M: +36%, S: +18%)
    let ingRateBoost = 0;
    if (isLadderIngM) ingRateBoost += 0.36;
    if (isLadderIngS) ingRateBoost += 0.18;
    if (ingRateBoost > 0) mult *= (1.0 + ingRateBoost);

    // 副技能加成：幫忙速度 (M: -14% 間隔, S: -7% 間隔)
    let speedReduction = 0;
    if (isLadderSpeedM) speedReduction += 0.14;
    if (isLadderSpeedS) speedReduction += 0.07;
    if (speedReduction > 0) mult *= (1.0 / (1.0 - speedReduction));

    // 性格加成：單選；未選視為無修正
    if (getLadderNature() !== 'NONE') {
      if (ladderNatureIng) mult *= 1.20;
      if (ladderNatureSpeed) mult *= (1.0 / 0.90);
    }

    return mult;
  }

  function getLadderSkillTriggerMultiplier() {
    let m = 1.0;
    let boost = 0;
    if (isLadderSkillM) boost += 0.36;
    if (isLadderSkillS) boost += 0.18;
    if (boost > 0) m *= (1.0 + boost);
    if (getLadderNature() !== 'NONE' && ladderNatureSkill) m *= 1.20;
    return m;
  }

  function toggleLadderIngM(checked) {
    isLadderIngM = (checked === undefined) ? !isLadderIngM : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderIngS(checked) {
    isLadderIngS = (checked === undefined) ? !isLadderIngS : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderSpeedM(checked) {
    isLadderSpeedM = (checked === undefined) ? !isLadderSpeedM : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderSpeedS(checked) {
    isLadderSpeedS = (checked === undefined) ? !isLadderSpeedS : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderSkillM(checked) {
    isLadderSkillM = (checked === undefined) ? !isLadderSkillM : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderSkillS(checked) {
    isLadderSkillS = (checked === undefined) ? !isLadderSkillS : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderSubskill(key) {
    if (key === 'ING_M') isLadderIngM = !isLadderIngM;
    else if (key === 'ING_S') isLadderIngS = !isLadderIngS;
    else if (key === 'SPEED_M') isLadderSpeedM = !isLadderSpeedM;
    else if (key === 'SPEED_S') isLadderSpeedS = !isLadderSpeedS;
    else if (key === 'SKILL_M') isLadderSkillM = !isLadderSkillM;
    else if (key === 'SKILL_S') isLadderSkillS = !isLadderSkillS;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function syncLadderSubskillButtons() {
    const flags = {
      ING_M: isLadderIngM,
      ING_S: isLadderIngS,
      SPEED_M: isLadderSpeedM,
      SPEED_S: isLadderSpeedS,
      SKILL_M: isLadderSkillM,
      SKILL_S: isLadderSkillS
    };
    const ladderSidebar = document.getElementById('ladder-filter-sidebar') || document;
    const boostBtns = (typeof ladderSidebar.querySelectorAll === 'function') ? ladderSidebar.querySelectorAll('[data-subskill-boost]') : document.querySelectorAll('[data-subskill-boost]');
    boostBtns.forEach(btn => {
      const key = btn.getAttribute('data-subskill-boost');
      btn.classList.toggle('active', !!flags[key]);
    });
  }

  function getLadderNature() {
    const selected = [];
    if (ladderNatureIng) selected.push('ING');
    if (ladderNatureSpeed) selected.push('SPEED');
    if (ladderNatureSkill) selected.push('SKILL');
    if (selected.length === 0 || selected.length === 3) return 'NONE';
    if (selected.length === 1) return selected[0];
    return 'MIXED';
  }

  function syncLadderNatureButtons() {
    ladderNature = getLadderNature();
    const ladderSidebar = document.getElementById('ladder-filter-sidebar') || document;
    const natureBtns = (typeof ladderSidebar.querySelectorAll === 'function') ? ladderSidebar.querySelectorAll('[data-nature-filter]') : document.querySelectorAll('[data-nature-filter]');
    natureBtns.forEach(btn => {
      const key = btn.getAttribute('data-nature-filter');
      const on = (key === 'ING' && ladderNatureIng) || (key === 'SPEED' && ladderNatureSpeed) || (key === 'SKILL' && ladderNatureSkill);
      btn.classList.toggle('active', on);
    });
  }

  function setLadderNature(natureType) {
    ladderNatureIng = natureType === 'ING';
    ladderNatureSpeed = natureType === 'SPEED';
    ladderNatureSkill = natureType === 'SKILL';
    if (natureType !== 'ING' && natureType !== 'SPEED' && natureType !== 'SKILL') {
      ladderNatureIng = false;
      ladderNatureSpeed = false;
      ladderNatureSkill = false;
    }
    syncLadderNatureButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderNatureFilter(type) {
    const currentlyOn =
      (type === 'ING' && ladderNatureIng) ||
      (type === 'SPEED' && ladderNatureSpeed) ||
      (type === 'SKILL' && ladderNatureSkill);
    ladderNatureIng = false;
    ladderNatureSpeed = false;
    ladderNatureSkill = false;
    if (!currentlyOn) {
      if (type === 'ING') ladderNatureIng = true;
      else if (type === 'SPEED') ladderNatureSpeed = true;
      else if (type === 'SKILL') ladderNatureSkill = true;
    }
    syncLadderNatureButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderNatureIng(checked) {
    const on = !!checked;
    ladderNatureIng = on;
    if (on) {
      ladderNatureSpeed = false;
      ladderNatureSkill = false;
    }
    syncLadderNatureButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderNatureSpeed(checked) {
    const on = !!checked;
    ladderNatureSpeed = on;
    if (on) {
      ladderNatureIng = false;
      ladderNatureSkill = false;
    }
    syncLadderNatureButtons();
    refreshCoordinateLadder();
  }

  function onLadderSearch(val) {
    ladderSearchQuery = (val || '').trim();
    const input = document.getElementById('ladder-pkm-search-input');
    const clearBtn = document.getElementById('ladder-search-clear-btn');
    if (input && typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
      window.updateSearchInputHighlight(input, clearBtn);
    } else if (clearBtn) {
      clearBtn.style.display = ladderSearchQuery ? 'flex' : 'none';
    }
    applyLadderFiltersInPlace();
  }

  function clearLadderSearch() {
    ladderSearchQuery = '';
    const input = document.getElementById('ladder-pkm-search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('ladder-search-clear-btn');
    if (input && typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
      window.updateSearchInputHighlight(input, clearBtn);
    } else if (clearBtn) {
      clearBtn.style.display = 'none';
    }
    applyLadderFiltersInPlace();
  }

  function setLadderSupplyFilter(filterType) {
    ladderSupplyFilter = filterType || 'ALL';
    document.querySelectorAll('[data-supply-filter]').forEach(btn => {
      if (btn.getAttribute('data-supply-filter') === ladderSupplyFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    refreshCoordinateLadder();
  }

  function setLadderRecipeFilter(filterType) {
    ladderRecipeFilter = filterType || 'ALL';
    document.querySelectorAll('[data-recipe-filter]').forEach(btn => {
      if (btn.getAttribute('data-recipe-filter') === ladderRecipeFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    refreshCoordinateLadder();
  }

  function setLadderSpecialtyFilter(filterType) {
    ladderSpecialtyFilter = filterType || 'ALL';
    document.querySelectorAll('[data-specialty-filter]').forEach(btn => {
      if (btn.getAttribute('data-specialty-filter') === ladderSpecialtyFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    refreshCoordinateLadder();
  }

  function setLadderSortOrder(sortOrder) {
    ladderSortOrder = sortOrder || 'ENERGY_ASC';
    document.querySelectorAll('[data-sort-order]').forEach(btn => {
      if (btn.getAttribute('data-sort-order') === ladderSortOrder) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    refreshCoordinateLadder();
  }

  function getLadderSortOrder() {
    return ladderSortOrder;
  }

  function resetLadderFilters() {
    ladderSearchQuery = '';
    const searchInput = document.getElementById('ladder-pkm-search-input');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('ladder-search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    ladderSortOrder = 'ENERGY_ASC';
    document.querySelectorAll('[data-sort-order]').forEach(btn => {
      if (btn.getAttribute('data-sort-order') === 'ENERGY_ASC') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    ladderSupplyFilter = 'ALL';
    document.querySelectorAll('[data-supply-filter]').forEach(btn => {
      if (btn.getAttribute('data-supply-filter') === 'ALL') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    ladderRecipeFilter = 'ALL';
    document.querySelectorAll('[data-recipe-filter]').forEach(btn => {
      if (btn.getAttribute('data-recipe-filter') === 'ALL') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    ladderSpecialtyFilter = 'ALL';
    document.querySelectorAll('[data-specialty-filter]').forEach(btn => {
      if (btn.getAttribute('data-specialty-filter') === 'ALL') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    switchLadderView('coordinate');

    ladderNatureIng = false;
    ladderNatureSpeed = false;
    ladderNatureSkill = false;
    syncLadderNatureButtons();

    isLadderIngM = false;
    isLadderIngS = false;
    isLadderSpeedM = false;
    isLadderSpeedS = false;
    isLadderSkillM = false;
    isLadderSkillS = false;
    syncLadderSubskillButtons();
    isLadderSkillDrawExpected = false;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_ladder_skill_draw', 'false');
      }
    } catch (e) {}
    ladderTop15Only = true;

    const top15 = document.getElementById('ladder-top15-switch');
    if (top15) top15.checked = true;
    const skillDraw = document.getElementById('ladder-skill-draw-toggle');
    if (skillDraw) skillDraw.checked = false;
    const ingM = document.getElementById('ladder-ing-m-toggle');
    if (ingM) ingM.checked = false;
    const ingS = document.getElementById('ladder-ing-s-toggle');
    if (ingS) ingS.checked = false;
    const speedM = document.getElementById('ladder-speed-m-toggle');
    if (speedM) speedM.checked = false;
    const speedS = document.getElementById('ladder-speed-s-toggle');
    if (speedS) speedS.checked = false;

    refreshCoordinateLadder();
  }

  function applyLadderFiltersInPlace() {
    const q = ladderSearchQuery.toLowerCase();
    const ladderPanel = document.getElementById('wiki-subpanel-ladder') || document.getElementById('panel-wiki') || document;
    const nodes = (typeof ladderPanel.querySelectorAll === 'function') ? ladderPanel.querySelectorAll('.ladder-node') : document.querySelectorAll('.ladder-node');
    const spans = (typeof ladderPanel.querySelectorAll === 'function') ? ladderPanel.querySelectorAll('.ladder-pkm-span-line') : document.querySelectorAll('.ladder-pkm-span-line');

    if (!q) {
      nodes.forEach(n => {
        n.classList.remove('ladder-node-dimmed', 'ladder-node-spotlight');
      });
      spans.forEach(s => {
        s.classList.remove('ladder-span-dimmed', 'ladder-span-spotlight');
      });
      return;
    }

    nodes.forEach(n => {
      const pkmName = n.getAttribute('data-pkm') || '';
      if (matchesLadderSearch(pkmName, '', q)) {
        n.classList.remove('ladder-node-dimmed');
        n.classList.add('ladder-node-spotlight');
      } else {
        n.classList.remove('ladder-node-spotlight');
        n.classList.add('ladder-node-dimmed');
      }
    });

    spans.forEach(s => {
      const pkmGroup = s.getAttribute('data-pkm-group') || '';
      if (matchesLadderSearch(pkmGroup, '', q)) {
        s.classList.remove('ladder-span-dimmed');
        s.classList.add('ladder-span-spotlight');
      } else {
        s.classList.remove('ladder-span-spotlight');
        s.classList.add('ladder-span-dimmed');
      }
    });
  }

  function updateLadderActiveFilterBadge() {
    const badge = document.getElementById('ladder-sidebar-bookmark-badge');
    let count = 0;
    if (ladderSearchQuery && ladderSearchQuery.trim()) count++;
    if (ladderSupplyFilter && ladderSupplyFilter !== 'ALL') count++;
    if (ladderRecipeFilter && ladderRecipeFilter !== 'ALL') count++;
    if (ladderSpecialtyFilter && ladderSpecialtyFilter !== 'ALL') count++;
    if (ladderSortOrder && ladderSortOrder !== 'ENERGY_ASC') count++;
    if (isLadderIngM || isLadderIngS || isLadderSpeedM || isLadderSpeedS || isLadderSkillM || isLadderSkillS) count++;
    if (ladderNature && ladderNature !== 'NONE') count++;
    if (isLadderSkillDrawExpected) count++;

    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  function refreshCoordinateLadder() {
    const container = document.getElementById('wiki-ingredient-ladder-coordinate');
    if (container) {
      container.innerHTML = renderCoordinateLadder(LV60_COORDINATE_LADDER_DATA);
      if (ladderSearchQuery) {
        applyLadderFiltersInPlace();
      }
    }
    updateLadderActiveFilterBadge();
  }

  // 3.1 切換天梯圖呈現模式 (相容性函式)
  function switchLadderView(mode) {
    const coordContainer = document.getElementById('wiki-ingredient-ladder-coordinate');
    if (coordContainer) coordContainer.style.setProperty('display', 'block', 'important');
  }

  // 3.2 點選食材圖示開啟單一食材產量排名浮窗 (Ingredient Output Ranking Modal)
