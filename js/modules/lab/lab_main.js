  function renderAppraisalLabContainer(targetElement) {
    if (!targetElement) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isMobileH5 = typeof document !== 'undefined' && (
      (typeof document.querySelector === 'function' && !!document.querySelector('.mobile-h5-app')) ||
      (document.body && document.body.classList && typeof document.body.classList.contains === 'function' && document.body.classList.contains('mobile-h5-app'))
    );
    const showControls = labState.editMode;

    const pokemons = window.allPokemons || (window.PokemonApp && (window.PokemonApp.allPokemons || (typeof window.PokemonApp.getPokemons === 'function' && window.PokemonApp.getPokemons()))) || [];
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    
    if (pokemons.length === 0) {
      targetElement.innerHTML = `<div style="padding:20px;text-align:center;color:#94a3b8;">${isEN ? 'Loading Pokédex data...' : '載入圖鑑資料中...'}</div>`;
      return;
    }

    if (userBox.length === 0) {
      targetElement.innerHTML = `
        <div class="lab-box-empty-container" style="padding:48px 20px;text-align:center;color:var(--text-muted);">
          <div style="font-size:32px;margin-bottom:12px;opacity:0.8;">[!]</div>
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
            ${isEN ? 'No Pokémon in Box' : '倉庫中尚無寶可夢'}
          </div>
          <div style="font-size:13px;color:var(--text-secondary);max-width:320px;margin:0 auto 18px;line-height:1.5;">
            ${isEN ? 'Please register Pokémon in the Box tab first, then evaluate them here!' : '請先在【寶可夢倉庫】新增登錄寶可夢後，再來進行深度評測！'}
          </div>
          <button type="button" class="btn-primary" onclick="if(window.switchMainTab)window.switchMainTab('box');" style="padding:8px 20px;border-radius:8px;font-size:13px;cursor:pointer;">
            ${isEN ? 'Go to Box' : '前往寶可夢倉庫'}
          </button>
        </div>
      `;
      return;
    }

    // 若尚未選中任何倉庫寶可夢，或選中的寶可夢已不存在，預設載入倉庫列表中第一隻寶可夢（依當前排序與篩選順序）
    const displayBoxList = (window.UserBox && typeof window.UserBox.getFilteredBox === 'function')
      ? window.UserBox.getFilteredBox()
      : userBox;
    const activeList = displayBoxList.length > 0 ? displayBoxList : userBox;

    if ((!labState.selectedBoxUid || !userBox.some(function (p) { return p.uid === labState.selectedBoxUid; })) && activeList.length > 0) {
      loadBoxItem(activeList[0]);
    }

    const currentPkm = findBasePkm(labState.selectedPkmId) || pokemons[0];
    // Spec icon helper reference for subviews: getSpecialtyIconHtml(currentPkm.specialty, 16)

    // Auto populate team if empty
    if (labState.teamSlots.every(s => !s) && userBox.length > 0) {
      autoOptimizeTeam(false);
    }

    targetElement.innerHTML = `
      <div class="appraisal-lab-seamless-view">
        ${!labState.editMode ? `
        <!-- 深度研究室 頂部子分頁導航 (Subnav Bar) -->
        <div class="lab-subnav-bar">
          <button type="button" class="lab-subtab-btn ${labState.currentSubTab === 'team' ? 'active' : ''}" onclick="window.AppraisalLab.switchSubTab('team')">
            <span class="lab-subtab-title">${isEN ? 'Team Builder' : '幫手組隊'}</span>
          </button>
          <button type="button" class="lab-subtab-btn ${labState.currentSubTab === 'compare' ? 'active' : ''}" onclick="window.AppraisalLab.switchSubTab('compare')">
            <span class="lab-subtab-title">${isEN ? 'Pokémon Comparison' : '寶可夢對比'}</span>
          </button>
        </div>
        ` : ''}

        <!-- 1. 幫手組隊子面板 (Team Builder & Simulator) -->
        <div id="lab-subpanel-team" class="lab-subpanel" style="${labState.currentSubTab === 'team' && !labState.editMode ? '' : 'display:none;'}">
          ${renderTeamBuilderView(userBox, pokemons, isEN, isMobileH5)}
        </div>

        <!-- 2. 寶可夢對比子面板 (Side-by-Side Comparison) -->
        <div id="lab-subpanel-compare" class="lab-subpanel" style="${labState.currentSubTab === 'compare' ? '' : 'display:none;'}">
          ${renderComparisonView(userBox, pokemons, isEN, isMobileH5)}
        </div>
      </div>
    `;

    if (labState.editMode) {
      if (typeof window !== 'undefined' && typeof window.setupCustomSelect === 'function') {
        ['lab-nature-select', 'lab-ribbon-select', 'lab-mainskill-select'].forEach(id => {
          const el = targetElement.querySelector('#' + id);
          if (el && !el._customized) {
            window.setupCustomSelect(el);
          }
        });
      }
      initLabPokemonCombobox(pokemons, currentPkm);
    }
  }

  function onPkmChange(pkmId) {
    labState.selectedPkmId = pkmId;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onLevelChange(val, isLiveDragging = false) {
    labState.level = Math.max(1, Math.min(100, parseInt(val, 10) || 1));
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    const numInput = document.getElementById('lab-level-num-input');
    if (numInput && numInput.value != labState.level) {
      numInput.value = labState.level;
    }
    const slider = document.getElementById('lab-level-slider');
    if (slider && slider.value != labState.level) {
      slider.value = labState.level;
    }
    if (!isLiveDragging) {
      updateLabUI();
    }
  }

  function onNatureChange(nature) {
    labState.nature = nature;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onRibbonChange(val) {
    labState.ribbon = parseInt(val, 10) || 0;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onSubskillChange(idx, val) {
    labState.subskills[idx] = val;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function updateLabUI() {
    const container = document.getElementById('appraisal-lab-container');
    if (container) {
      renderAppraisalLabContainer(container);
    }
  }

  /* ─── 全域導出 ─────────────────────────────────────────── */
  window.AppraisalLab = {
    isBerryBurstSkillSpecialist: isBerryBurstSkillSpecialist,
    isBfsSkillSpecialist: isBfsSkillSpecialist,
    isHealerSkillSpecialist: isHealerSkillSpecialist,
    isHelperBoostSkillSpecialist: isHelperBoostSkillSpecialist,
    isChargeStrengthSkillSpecialist: isChargeStrengthSkillSpecialist,
    isPotExpanderSkillSpecialist: isPotExpanderSkillSpecialist,
    isExtraTastySkillSpecialist: isExtraTastySkillSpecialist,
    isDreamShardSkillSpecialist: isDreamShardSkillSpecialist,
    isIngredientSkillSpecialist: isIngredientSkillSpecialist,
    isMetronomeSkillSpecialist: isMetronomeSkillSpecialist,
    isLegendaryPokemon: isLegendaryPokemon,
    isSlowpokeFamily: isSlowpokeFamily,
    isSlakingFamily: isSlakingFamily,
    evaluateSingle: evaluateSingle,
    calculateMilestoneProjections: calculateMilestoneProjections,
    evaluatePokemon: evaluatePokemon,
    generateSummary: generateIntelligentSummary,
    generateIntelligentSummary: generateIntelligentSummary,
    getSignatureRecipeRecommendations: getSignatureRecipeRecommendations,
    getRemainingEvolutions: getRemainingEvolutions,
    getRibbonBonus: getRibbonBonus,
    getEffectiveSkillLevel: getEffectiveSkillLevel,
    getPokemonEvolutionStage: getPokemonEvolutionStage,
    getSubskillLevelBonus: getSubskillLevelBonus,
    getMainSkillMaxLevel: getMainSkillMaxLevel,
    renderRadarChartSVG: renderRadarChartSVG,
    calculateMilestoneCost: calculateMilestoneCost,
    openModal: openAppraisalModal,
    closeModal: closeAppraisalModal,
    openCurrentEditModal: openCurrentEditModal,
    reopenAfterEdit: reopenAfterEdit,
    calculatePokemonComparisonPerformance: calculatePokemonComparisonPerformance,
    renderLab: renderAppraisalLabContainer,
    getSkillTier: getSkillTier,
    loadBoxItem: loadBoxItem,
    onBoxItemSelect: onBoxItemSelect,
    resetToBoxOriginal: resetToBoxOriginal,
    enterEditMode: enterEditMode,
    cancelEditMode: cancelEditMode,
    saveEditMode: saveEditMode,
    onNicknameChange: onNicknameChange,
    onIngredientChange: onIngredientChange,
    onSkillLevelChange: onSkillLevelChange,
    clearAllSubskills: clearAllSubskills,
    selectSubskillSlot: selectSubskillSlot,
    onSubskillSlotSelect: selectSubskillSlot,
    onSubskillChipSelect: onSubskillChipSelect,
    onPkmChange: onPkmChange,
    onLevelChange: onLevelChange,
    onNatureChange: onNatureChange,
    onRibbonChange: onRibbonChange,
    onSubskillChange: onSubskillChange,
    switchSubTab: switchSubTab,
    setTeamIsland: setTeamIsland,
    setTeamSlot: setTeamSlot,
    clearTeamSlot: clearTeamSlot,
    clearAllTeamSlots: clearAllTeamSlots,
    autoOptimizeTeam: autoOptimizeTeam,
    setTeamStrategy: setTeamStrategy,
    setCookingType: setCookingType,
    setTargetRecipe: setTargetRecipe,
    rerollGreengrassBerries: rerollGreengrassBerries,
    getAllTargetRecipes: getAllTargetRecipes,
    findTargetRecipe: findTargetRecipe,
    setGreengrassBerry: setGreengrassBerry,
    setCompareSlot: setCompareSlot,
    clearCompareSlot: clearCompareSlot,
    swapCompareSlots: swapCompareSlots,
    setCompareBenchmarkLevel: setCompareBenchmarkLevel,
    openPicker: openLabPicker,
    closePicker: closeLabPicker,
    onPickerSelect: onPickerSelect,
    onRecipePickerSelect: onRecipePickerSelect,
    simulateTeamPerformance: simulateTeamPerformance,
    toggleLab: function () {
      const container = document.getElementById('appraisal-lab-container');
      if (container) {
        const isHidden = container.style.display === 'none' || getComputedStyle(container).display === 'none';
        const willOpen = isHidden;
        if (typeof window.switchBoxSubtab === 'function') {
          window.switchBoxSubtab(willOpen ? 'lab' : 'list');
        } else {
          container.style.display = willOpen ? 'block' : 'none';
          if (willOpen) {
            renderAppraisalLabContainer(container);
          }
        }
      }
    }
  };

  // 全域別名
  window.openAppraisalModal = openAppraisalModal;
  window.closeAppraisalModal = closeAppraisalModal;
  window.openCurrentEditModal = openCurrentEditModal;

})();