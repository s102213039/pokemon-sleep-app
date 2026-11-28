  // --- 綁定直接節點事件 (Direct DOM Event Listeners) ---
  function bindAllEvents() {
    // 1. 綁定二級子分頁切換按鈕
    document.querySelectorAll('.wiki-subtab-btn').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const tab = this.getAttribute('data-subtab');
        switchWikiSubTab(tab);
      };
    });

    // 2. 綁定技能類型篩選按鈕
    document.querySelectorAll('[data-skill-cat]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const cat = this.getAttribute('data-skill-cat');
        filterWikiSkills(cat);
      };
    });

    // 3. 綁定食材天梯篩選按鈕
    document.querySelectorAll('[data-ing-filter]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const ing = this.getAttribute('data-ing-filter');
        filterWikiIngredients(ing);
      };
    });

    // 4. 綁定蓄力次數快速切換按鈕
    document.querySelectorAll('[data-stack-target]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const num = parseInt(this.getAttribute('data-stack-target'), 10) || 0;
        switchChargeStock(num);
      };
    });

    // 5. 綁定幫手加速種類快速切換按鈕
    document.querySelectorAll('[data-boost-kind]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const num = parseInt(this.getAttribute('data-boost-kind'), 10) || 0;
        switchHelperBoost(num);
      };
    });

    // 6. 綁定展開/收合詳細對照表
    document.querySelectorAll('[data-toggle-target]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const targetId = this.getAttribute('data-toggle-target');
        toggleDetailTable(targetId);
      };
    });

    // 7. 綁定主技能發動機率計算機表單
    const subskillSelect = document.getElementById('calc-subskill-select');
    if (subskillSelect) {
      subskillSelect.onchange = recalcTriggerChance;
      subskillSelect.addEventListener('change', recalcTriggerChance);
    }

    const natureSelect = document.getElementById('calc-nature-select');
    if (natureSelect) {
      natureSelect.onchange = recalcTriggerChance;
      natureSelect.addEventListener('change', recalcTriggerChance);
    }

    // 8. 綁定睡眠天數升級計算器表單
    const curLvInput = document.getElementById('calc-sleep-cur-lv');
    if (curLvInput) {
      curLvInput.oninput = handleSleepCurLvInput;
      curLvInput.onchange = handleSleepCurLvInput;
      curLvInput.addEventListener('focus', function () {
        if (typeof this.select === 'function') this.select();
      });
      curLvInput.addEventListener('click', function () {
        if (typeof this.select === 'function') this.select();
      });
    }

    const targetLvInput = document.getElementById('calc-sleep-target-lv');
    if (targetLvInput) {
      targetLvInput.oninput = recalcSleepDays;
      targetLvInput.onchange = recalcSleepDays;
    }

    const expSubskill = document.getElementById('calc-sleep-exp-subskill');
    if (expSubskill) {
      expSubskill.onchange = recalcSleepDays;
    }

    const sleepNatureSelect = document.getElementById('calc-sleep-nature-select');
    if (sleepNatureSelect) {
      sleepNatureSelect.onchange = recalcSleepDays;
    }

    // 9. 綁定天梯篩選側邊欄手勢右滑關閉 (Swipe Right to Close)
    const ladderSidebar = document.getElementById('ladder-filter-sidebar');
    if (ladderSidebar) {
      if (typeof window.bindSidebarSwipeRightToClose === 'function') {
        window.bindSidebarSwipeRightToClose(ladderSidebar, () => closeLadderSidebar());
      } else {
        let startX = 0, startY = 0, startTime = 0;
        ladderSidebar.addEventListener('touchstart', (e) => {
          if (!e.touches || !e.touches[0]) return;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          startTime = Date.now();
        }, { passive: true });
        ladderSidebar.addEventListener('touchend', (e) => {
          if (!e.changedTouches || !e.changedTouches[0]) return;
          const diffX = e.changedTouches[0].clientX - startX;
          const diffY = e.changedTouches[0].clientY - startY;
          const elapsed = Date.now() - startTime;
          if (diffX > 35 && (diffX > Math.abs(diffY) * 1.05 || (elapsed < 350 && diffX > 25))) {
            if (!ladderSidebar.classList.contains('collapsed')) {
              closeLadderSidebar();
            }
          }
        }, { passive: true });
      }
    }

    const skillLadderSidebar = document.getElementById('skill-ladder-filter-sidebar');
    if (skillLadderSidebar && typeof window.bindSidebarSwipeRightToClose === 'function') {
      window.bindSidebarSwipeRightToClose(skillLadderSidebar, () => {
        if (window.WikiSkillLadder && typeof window.WikiSkillLadder.closeSidebar === 'function') {
          window.WikiSkillLadder.closeSidebar();
        } else if (typeof window.closeSkillLadderSidebar === 'function') {
          window.closeSkillLadderSidebar();
        }
      });
    }
  }

  // --- 全域事件委託備援 (Global Event Delegation Fallback) ---
  let isDelegationBound = false;
  function bindGlobalDelegationFallback() {
    if (isDelegationBound) return;
    isDelegationBound = true;

    document.addEventListener('click', (e) => {
      const subtabBtn = e.target.closest('.wiki-subtab-btn');
      if (subtabBtn) {
        switchWikiSubTab(subtabBtn.getAttribute('data-subtab'));
        return;
      }

      const skillPillBtn = e.target.closest('[data-skill-cat]');
      if (skillPillBtn) {
        filterWikiSkills(skillPillBtn.getAttribute('data-skill-cat'));
        return;
      }

      const ingPillBtn = e.target.closest('[data-ing-filter]');
      if (ingPillBtn) {
        filterWikiIngredients(ingPillBtn.getAttribute('data-ing-filter'));
        return;
      }

      const stackChipBtn = e.target.closest('[data-stack-target]');
      if (stackChipBtn) {
        switchChargeStock(parseInt(stackChipBtn.getAttribute('data-stack-target'), 10) || 0);
        return;
      }

      const ladderViewBtn = e.target.closest('[data-ladder-view]');
      if (ladderViewBtn) {
        switchLadderView(ladderViewBtn.getAttribute('data-ladder-view'));
        return;
      }

      const boostKindBtn = e.target.closest('[data-boost-kind]');
      if (boostKindBtn) {
        switchHelperBoost(parseInt(boostKindBtn.getAttribute('data-boost-kind'), 10) || 0);
        return;
      }

      const toggleBtn = e.target.closest('[data-toggle-target]');
      if (toggleBtn) {
        toggleDetailTable(toggleBtn.getAttribute('data-toggle-target'));
        return;
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target && (e.target.id === 'calc-subskill-select' || e.target.id === 'calc-nature-select')) {
        recalcTriggerChance();
      }
      if (e.target && (e.target.id === 'calc-sleep-exp-subskill' || e.target.id === 'calc-sleep-incense' || e.target.id === 'calc-sleep-nature-select')) {
        recalcSleepDays();
      }
      if (e.target && e.target.id === 'berry-favorite-toggle') {
        toggleBerryFavorite(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-ing-m-toggle') {
        toggleLadderIngM(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-skill-draw-toggle') {
        toggleLadderSkillDrawExpected(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-speed-m-toggle') {
        toggleLadderSpeedM(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-nature-ing-toggle') {
        toggleLadderNatureIng(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-nature-speed-toggle') {
        toggleLadderNatureSpeed(e.target.checked);
      }
    });

    let _berrySliderRafId = null;
    let _pendingBerryLevelVal = null;
    let _pendingBerryIslandVal = null;

    function flushBerrySliderRaf() {
      _berrySliderRafId = null;
      if (_pendingBerryLevelVal !== null) {
        const val = _pendingBerryLevelVal;
        _pendingBerryLevelVal = null;
        updateBerryLevel(val);
      }
      if (_pendingBerryIslandVal !== null) {
        const val = _pendingBerryIslandVal;
        _pendingBerryIslandVal = null;
        updateBerryIsland(val);
      }
    }

    function scheduleBerrySliderRaf() {
      if (_berrySliderRafId !== null) return;
      const raf = (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function')
        ? window.requestAnimationFrame.bind(window)
        : (fn) => setTimeout(fn, 0);
      _berrySliderRafId = raf(flushBerrySliderRaf);
    }

    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'calc-sleep-cur-lv') {
        handleSleepCurLvInput();
      } else if (e.target && e.target.id === 'calc-sleep-target-lv') {
        recalcSleepDays();
      }
      if (e.target && e.target.id === 'berry-level-slider') {
        const displayEl = document.getElementById('berry-level-display');
        if (displayEl) displayEl.textContent = `Lv. ${parseInt(e.target.value, 10) || 1}`;
        _pendingBerryLevelVal = e.target.value;
        scheduleBerrySliderRaf();
      }
      if (e.target && e.target.id === 'berry-island-slider') {
        const displayEl = document.getElementById('berry-island-display');
        if (displayEl) displayEl.textContent = `+${parseInt(e.target.value, 10) || 0}%`;
        _pendingBerryIslandVal = e.target.value;
        scheduleBerrySliderRaf();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSleepStylePopover();
      }
    });
  }
