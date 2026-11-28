  function getIslandFavoredBerries(islandId) {
    const island = LAB_ISLANDS.find(i => i.id === islandId) || LAB_ISLANDS[0];
    if (island.id === 'greengrass' && Array.isArray(labState.greengrassBerries) && labState.greengrassBerries.length === 3) {
      return labState.greengrassBerries;
    }
    return island.berries || [];
  }

  function getIslandFavoredTypes(islandId) {
    const island = LAB_ISLANDS.find(i => i.id === islandId) || LAB_ISLANDS[0];
    if (island.id === 'greengrass' && Array.isArray(labState.greengrassBerries) && labState.greengrassBerries.length === 3) {
      return labState.greengrassBerries.map(bName => {
        const found = _findLabBerryData(bName);
        if (!found || !found.type) return '';
        return found.type === '超能' ? '超能力' : found.type;
      }).filter(Boolean);
    }
    return (island.types || []).map(t => (t === '超能' ? '超能力' : t));
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const sIsland = localStorage.getItem('pksleep_lab_team_island');
      if (sIsland && LAB_ISLANDS.some(i => i.id === sIsland)) labState.teamIslandId = sIsland;
      const sSlots = JSON.parse(localStorage.getItem('pksleep_lab_team_slots') || 'null');
      if (Array.isArray(sSlots) && sSlots.length === 5) labState.teamSlots = sSlots;
      const sStrategy = localStorage.getItem('pksleep_lab_team_strategy');
      if (['balanced', 'berries', 'ingredients', 'skills', 'recipe'].includes(sStrategy)) labState.teamStrategy = sStrategy;
      const sCooking = localStorage.getItem('pksleep_lab_cooking_type');
      if (['curry', 'salad', 'dessert'].includes(sCooking)) labState.cookingType = sCooking;
      const sTargetRecipe = localStorage.getItem('pksleep_lab_target_recipe');
      if (sTargetRecipe) labState.targetRecipeName = sTargetRecipe;
      const sGgBerries = JSON.parse(localStorage.getItem('pksleep_lab_greengrass_berries') || 'null');
      if (Array.isArray(sGgBerries) && sGgBerries.length === 3) {
        const defaultGg = ['桃桃果', '橙橙果', '櫻子果', '椰木果', '木子果', '異奇果'];
        const canonicalized = sGgBerries.map(b => (_findLabBerryData(b) || {}).name || null);
        const usedSet = new Set(canonicalized.filter(Boolean));
        labState.greengrassBerries = canonicalized.map((name, idx) => {
          if (name) return name;
          const fb = defaultGg.find(cand => !usedSet.has(cand)) || defaultGg[idx % defaultGg.length];
          usedSet.add(fb);
          return fb;
        });
      }
      const sCompareSlots = JSON.parse(localStorage.getItem('pksleep_lab_compare_slots') || 'null');
      if (Array.isArray(sCompareSlots) && sCompareSlots.length > 0) {
        labState.compareSlots = [sCompareSlots[0] || null, sCompareSlots[1] || null, sCompareSlots[2] || null];
      } else {
        const sCompare = JSON.parse(localStorage.getItem('pksleep_lab_compare_uids') || 'null');
        if (sCompare) {
          labState.compareSlots = [sCompare.a || null, sCompare.b || null, sCompare.c || null];
        }
      }
      const sBench = localStorage.getItem('pksleep_lab_compare_benchmark');
      if (['box', '30', '50', '60', '100'].includes(String(sBench))) {
        labState.compareBenchmarkLevel = (sBench === 'box' ? 'box' : parseInt(sBench, 10));
      }
    }
  } catch (e) {}

  let _basePkmListRef = null;
  let _basePkmListLen = 0;
  let _basePkmIndex = null;

  function findBasePkm(idOrName) {
    const list = (typeof window !== 'undefined' && (window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons))) || [];
    if (!idOrName) return list[0] || null;
    if (_basePkmListRef !== list || _basePkmListLen !== list.length || !_basePkmIndex) {
      _basePkmListRef = list;
      _basePkmListLen = list.length;
      _basePkmIndex = Object.create(null);
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        if (!p) continue;
        if (p.id !== undefined && _basePkmIndex[p.id] === undefined) _basePkmIndex[p.id] = p;
        if (p.name_cn && _basePkmIndex[p.name_cn] === undefined) _basePkmIndex[p.name_cn] = p;
        if (p.name_en && _basePkmIndex[p.name_en] === undefined) _basePkmIndex[p.name_en] = p;
      }
    }
    return _basePkmIndex[idOrName] || list.find(p => p.id === idOrName || p.name_cn === idOrName || p.name_en === idOrName) || list[0] || null;
  }

  function loadBoxItem(item) {
    if (!item) return;
    const pokemons = window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons) || [];
    const pkm = pokemons.find(function (p) { return p.id === item.pokemonId || p.name_cn === item.name; }) || pokemons[0];

    labState.selectedBoxUid = item.uid;
    labState.selectedPkmId = pkm ? pkm.id : '1';
    labState.level = item.level || 30;
    labState.nature = item.nature || '坦率';

    const rawSubs = Array.isArray(item.subskills) ? item.subskills.slice(0, 5) : [];
    while (rawSubs.length < 5) rawSubs.push('');
    labState.subskills = rawSubs;

    const baseIngs = (pkm && pkm.ingredients) ? pkm.ingredients : [];
    const ing1 = item.ing1 || (baseIngs[0] ? baseIngs[0].name : '');
    const ing2 = item.ing2 || (baseIngs[1] ? baseIngs[1].name : ing1);
    const ing3 = item.ing3 || (baseIngs[2] ? baseIngs[2].name : ing2);
    labState.ingredients = [ing1, ing2, ing3].filter(Boolean);

    labState.ribbon = parseInt(item.ribbon, 10) || 0;
    labState.nickname = item.nickname || '';
    labState.cleanseMint = !!(item.cleanseMint || item.mint);
    labState.skillLevel = item.skillLevel || item.mainSkillLevel || 1;
    labState.isCustomized = false;
    labState.editMode = false;
    labState.editBackup = null;
    labState.activeSubskillSlot = 1;
  }

  function onBoxItemSelect(uid) {
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    if (!uid) {
      labState.selectedBoxUid = '';
      labState.nickname = '';
      labState.cleanseMint = false;
      labState.isCustomized = false;
      labState.editMode = false;
      labState.editBackup = null;
      labState.activeSubskillSlot = 1;
      updateLabUI();
      return;
    }
    const item = userBox.find(function (p) { return p.uid === uid; });
    if (item) {
      loadBoxItem(item);
      labState.editMode = false;
      labState.editBackup = null;
      labState.activeSubskillSlot = 1;
      updateLabUI();
    }
  }

  function resetToBoxOriginal() {
    if (!labState.selectedBoxUid) return;
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    const item = userBox.find(function (p) { return p.uid === labState.selectedBoxUid; });
    if (item) {
      loadBoxItem(item);
    }
  }

  function enterEditMode() {
    labState.currentSubTab = 'single';
    labState.editBackup = {
      selectedPkmId: labState.selectedPkmId,
      nickname: labState.nickname,
      level: labState.level,
      nature: labState.nature,
      ribbon: labState.ribbon,
      skillLevel: labState.skillLevel,
      ingredients: (labState.ingredients || []).slice(),
      subskills: (labState.subskills || []).slice()
    };
    labState.editMode = true;
    labState.activeSubskillSlot = 1;
    updateLabUI();
  }

  function cancelEditMode() {
    if (labState.editBackup) {
      if (labState.editBackup.selectedPkmId) {
        labState.selectedPkmId = labState.editBackup.selectedPkmId;
      }
      labState.nickname = labState.editBackup.nickname;
      labState.level = labState.editBackup.level;
      labState.nature = labState.editBackup.nature;
      labState.ribbon = labState.editBackup.ribbon;
      labState.skillLevel = labState.editBackup.skillLevel;
      labState.ingredients = (labState.editBackup.ingredients || []).slice();
      labState.subskills = (labState.editBackup.subskills || []).slice();
      labState.editBackup = null;
    } else {
      resetToBoxOriginal();
    }
    labState.editMode = false;
    labState.activeSubskillSlot = 1;
    updateLabUI();
  }

  function saveEditMode() {
    const levelInp = document.getElementById('lab-level-num-input');
    if (levelInp) {
      const lv = parseInt(levelInp.value, 10);
      if (lv >= 1 && lv <= 100) labState.level = lv;
    }
    const nickInp = document.getElementById('lab-nickname-input');
    if (nickInp) {
      labState.nickname = nickInp.value.trim();
    }
    const natureSel = document.getElementById('lab-nature-select');
    if (natureSel && natureSel.value) {
      labState.nature = natureSel.value;
    }
    const ribbonSel = document.getElementById('lab-ribbon-select');
    if (ribbonSel && ribbonSel.value != null) {
      labState.ribbon = parseInt(ribbonSel.value, 10) || 0;
    }
    const skillSel = document.getElementById('lab-mainskill-select');
    if (skillSel && skillSel.value) {
      labState.skillLevel = parseInt(skillSel.value, 10) || 1;
    }

    if (!labState.selectedBoxUid) {
      labState.editMode = false;
      labState.editBackup = null;
      updateLabUI();
      return;
    }
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') 
      ? window.UserBox.getUserBox() 
      : [];
    const item = userBox.find(function (p) { return p.uid === labState.selectedBoxUid; });
    if (item) {
      if (labState.selectedPkmId) {
        item.pokemonId = labState.selectedPkmId;
        const pokemons = window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons) || [];
        const pObj = pokemons.find(p => p.id === labState.selectedPkmId);
        if (pObj) {
          item.name = pObj.name_cn;
        }
      }
      item.level = labState.level;
      item.nature = labState.nature;
      item.subskills = labState.subskills.slice();
      item.ribbon = labState.ribbon;
      item.nickname = (labState.nickname || '').trim();
      if (labState.ingredients[0]) item.ing1 = labState.ingredients[0];
      if (labState.ingredients[1]) item.ing2 = labState.ingredients[1];
      if (labState.ingredients[2]) item.ing3 = labState.ingredients[2];
      if (labState.skillLevel != null) {
        item.skillLevel = labState.skillLevel;
        item.mainSkillLevel = labState.skillLevel;
      }

      if (window.UserBox && typeof window.UserBox.setUserBox === 'function') {
        window.UserBox.setUserBox(userBox);
      }
      labState.editMode = false;
      labState.editBackup = null;
      labState.isCustomized = false;
      updateLabUI();
      if (typeof window.showToast === 'function') {
        window.showToast(window.I18N?.t?.('lab.c_pkm_updated') ?? 'lab.c_pkm_updated');
      }
    }
  }

  function selectSubskillSlot(slotNum) {
    labState.activeSubskillSlot = Math.max(1, Math.min(5, parseInt(slotNum, 10) || 1));
    updateLabUI();
  }

  function onSubskillChipSelect(skName) {
    if (!skName) return;
    const currentSlotIdx = Math.max(0, Math.min(4, (labState.activeSubskillSlot || 1) - 1));
    const usedIdx = labState.subskills.indexOf(skName);
    if (usedIdx !== -1 && usedIdx !== currentSlotIdx) {
      return;
    }
    labState.subskills[currentSlotIdx] = skName;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    let nextEmptySlot = -1;
    for (let s = 1; s <= 5; s++) {
      if (!labState.subskills[s - 1]) {
        nextEmptySlot = s;
        break;
      }
    }
    if (nextEmptySlot !== -1) {
      labState.activeSubskillSlot = nextEmptySlot;
    } else if (labState.activeSubskillSlot < 5) {
      labState.activeSubskillSlot += 1;
    } else {
      labState.activeSubskillSlot = 1;
    }
    updateLabUI();
  }

  function onNicknameChange(val) {
    labState.nickname = val || '';
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    const nickEl = document.getElementById('lab-pkm-identity-nick');
    if (nickEl) {
      const trimmed = (val || '').trim();
      if (trimmed) {
        nickEl.textContent = `(${trimmed})`;
        nickEl.style.display = '';
      } else {
        nickEl.textContent = '';
        nickEl.style.display = 'none';
      }
    }
  }

  function onIngredientChange(slotIdx, val) {
    labState.ingredients[slotIdx] = val;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onSkillLevelChange(val) {
    labState.skillLevel = parseInt(val, 10) || 1;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function clearAllSubskills() {
    labState.subskills = ['', '', '', '', ''];
    labState.activeSubskillSlot = 1;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function initLabPokemonCombobox(pokemons, currentPkm) {
    const searchInput = document.getElementById('lab-poke-search');
    const dropdown = document.getElementById('lab-pkm-dropdown');
    const toggleBtn = document.getElementById('lab-pkm-dropdown-toggle');
    if (!searchInput || !dropdown) return;

    function renderDropdown(filterText = '') {
      const q = (filterText || '').trim().toLowerCase();
      let matched = [];
      if (!q) {
        matched = pokemons.slice();
      } else {
        matched = pokemons.filter(p => {
          if (typeof window.matchesPokemonSearch === 'function') {
            return window.matchesPokemonSearch(p, q);
          }
          const cn = (p.name_cn || '').toLowerCase();
          const en = (p.name_en || '').toLowerCase();
          const no = String(p.formatted_no || p.id || '');
          return cn.includes(q) || en.includes(q) || no.includes(q);
        });
      }

      if (matched.length === 0) {
        dropdown.innerHTML = `<div class="text-muted" style="padding: 12px; text-align: center; font-size: 12px;">${window.I18N?.t?.('lab.c_no_matching_pkm') ?? 'No matching Pokémon'}</div>`;
        dropdown.style.display = 'block';
        return;
      }

      dropdown.innerHTML = matched.map(p => {
        const pkmDisplayName = window.I18N?.getPokemonName?.(p) ?? (window.I18N?.field?.(p, 'name') || p.name_cn || p.name_en || '');
        const isSelected = p.id === currentPkm.id;
        const avatarUrl = p.icon_url || p.icon || (p.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png` : '') || 'assets/placeholder.svg';
        return `
          <div class="box-pkm-dropdown-item ${isSelected ? 'active' : ''}" data-id="${p.id}" data-name="${escapeHtml(p.name_cn)}" style="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;">
            <img src="${avatarUrl}" class="box-pkm-dropdown-avatar" width="28" height="28" style="width:28px;height:28px;object-fit:contain;" alt="${escapeHtml(pkmDisplayName)}" loading="lazy" decoding="async">
            <div class="box-pkm-dropdown-info" style="display:flex;flex-direction:column;">
              <span style="font-size:12px;font-weight:700;color:var(--text-primary);">No.${p.formatted_no || p.id} ${pkmDisplayName}</span>
            </div>
          </div>
        `;
      }).join('');

      dropdown.querySelectorAll('.box-pkm-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = item.getAttribute('data-id');
          dropdown.style.display = 'none';
          onPkmChange(pId);
        });
      });

      dropdown.style.display = 'block';
    }

    searchInput.addEventListener('input', () => {
      renderDropdown(searchInput.value);
    });

    searchInput.addEventListener('focus', () => {
      renderDropdown(searchInput.value);
    });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown.style.display === 'block') {
          dropdown.style.display = 'none';
        } else {
          renderDropdown('');
        }
      });
    }
  }
