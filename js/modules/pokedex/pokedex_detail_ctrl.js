const _FALLBACK_POKEDEX_CTRL_CAPS = /* @GAME_CONFIG_FALLBACK_START */ {"POKEMON_LEVEL_CAP":70,"RECIPE_LEVEL_CAP":70,"THEORETICAL_MAX_LEVEL":100,"ISLAND_BONUS_CAP":95,"ISLAND_BONUS_STEP":5,"RECIPE_MAX_BONUS_PCT":258,"SUBSKILL_UNLOCK_LEVELS":[10,25,50,70,80]} /* @GAME_CONFIG_FALLBACK_END */;

function _getPokedexCtrlCaps() {
  const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
             (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
  return (gc && typeof gc.getCaps === 'function') ? gc.getCaps() : _FALLBACK_POKEDEX_CTRL_CAPS;
}

function getMainSkillMaxLevel(mainSkillName) {
  if (typeof window !== 'undefined' && typeof window.getMainSkillMaxLevel === 'function' && window.getMainSkillMaxLevel !== getMainSkillMaxLevel) {
    return window.getMainSkillMaxLevel(mainSkillName);
  }
  if (typeof window !== 'undefined' && window.UserBox && typeof window.UserBox.getMainSkillMaxLevel === 'function') {
    return window.UserBox.getMainSkillMaxLevel(mainSkillName);
  }
  if (!mainSkillName || typeof mainSkillName !== 'string') {
    return 6;
  }
  const clean = mainSkillName.trim();
  if (clean.includes('夢之碎片') || clean.includes('波導彈') || clean.includes('Dream Shard') || clean.includes('Aura Sphere')) {
    return 8;
  }
  if (
    clean.includes('能量填充') || clean.includes('能量充填') || clean.includes('Charge Strength') || clean.includes('蓄力') || clean.includes('夢魘') ||
    clean.includes('食材獲取') || clean.includes('食材精選') || clean.includes('Ingredient') || clean.includes('怪力鉗') || clean.includes('怪力钳') || clean.includes('超幸運') || clean.includes('正電') || clean.includes('禮物') ||
    clean.includes('料理強化') || clean.includes('料理等級') || clean.includes('Cooking Power') || clean.includes('負電') || clean.includes('魔法火焰') || clean.includes('Mystical Fire') || clean.includes('料理躍進') || clean.includes('料理輔助') || clean.includes('健美') || clean.includes('Bulk Up') ||
    clean.includes('揮指') || clean.includes('技能複製') || clean.includes('十項全能') || clean.includes('All-Rounder') || clean.includes('Metronome') || clean.includes('Skill Copy') || clean.includes('變身') || clean.includes('模仿') ||
    clean.includes('幫手支援') || clean.includes('Extra Helpful') || clean.includes('Helper Support')
  ) {
    return 7;
  }
  if (typeof window !== 'undefined' && window.MAIN_SKILLS_DATA) {
    const sData = window.MAIN_SKILLS_DATA[clean] || (Array.isArray(window.MAIN_SKILLS_DATA) ? window.MAIN_SKILLS_DATA.find(s => s && s.name === clean) : null);
    if (sData) {
      if (sData.levels && (sData.levels['8'] || sData.levels[8])) return 8;
      if (sData.levels && (sData.levels['7'] || sData.levels[7])) return 7;
      if (sData.maxLevel) return sData.maxLevel;
    }
  }
  return 6;
}

function getPokedexMainSkillMaxLvl(skillName) {
  return getMainSkillMaxLevel(skillName);
}

if (typeof window !== 'undefined') {
  if (!window.getMainSkillMaxLevel) window.getMainSkillMaxLevel = getMainSkillMaxLevel;
  window.getPokedexMainSkillMaxLvl = getPokedexMainSkillMaxLvl;
}

function parsePokedexIntervalToSec(intervalStr) {
  if (!intervalStr || intervalStr === '--') return 3600;
  const parts = intervalStr.split(':').map(n => parseInt(n, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseInt(intervalStr, 10) || 3600;
}

function openPokemonDetailModal(pokemonIdOrObject) {
  const pokemons = PokemonApp.allPokemons || window.allPokemons || [];
  let pkm = null;
  if (pokemonIdOrObject && typeof pokemonIdOrObject === 'object') {
    pkm = pokemonIdOrObject.id ? pokemonIdOrObject : null;
  }
  if (!pkm) {
    pkm = pokemons.find(p => p.name_cn === pokemonIdOrObject || p.name_en === pokemonIdOrObject) ||
          pokemons.find(p => String(p.id) === String(pokemonIdOrObject) || p.formatted_no === pokemonIdOrObject);
  }
  if (!pkm) return;

  const minEvoLvl = getPokedexMinEvolutionLevel(pkm);
  pokedexModalState.pkmId = pkm.id;
  pokedexModalState.pkm = pkm;
  pokedexModalState.level = Math.max(minEvoLvl, 30);
  pokedexModalState.skillLevel = 1;
  pokedexModalState.ribbon = 0;
  pokedexModalState.ingSlots = [0, 0, 0];

  // 根據專長給予智慧推薦性格，副技能一開始預設不選取 (留空)
  const spec = pkm.specialty || '';
  if (spec.includes('食材') || spec === 'Ingredients') {
    pokedexModalState.nature = '冷靜';
  } else if (spec.includes('樹果') || spec === 'Berries') {
    pokedexModalState.nature = '固執';
  } else {
    pokedexModalState.nature = '自大';
  }
  pokedexModalState.subskills = ['', '', '', '', ''];
  pokedexActiveSubskillSlot = 1;
  pokedexSubskillPaletteExpanded = false;

  let modalEl = document.getElementById('pokedex-detail-modal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'pokedex-detail-modal';
    modalEl.className = 'pokedex-modal-backdrop';
    document.body.appendChild(modalEl);
  }

  prepareOverlayOpen(modalEl);
  modalEl.style.display = 'flex';
  try {
    document.body.style.overflow = 'hidden';
    if (document.body && document.body.classList) {
      document.body.classList.add('pokedex-modal-open');
    }
    if (typeof portalMobileOverlays === 'function') portalMobileOverlays(modalEl);
  } catch (e) {}

  renderPokedexDetailModalContent();
}


function prepareOverlayOpen(el) {
  if (!el) return;
  el.__closeGen = (el.__closeGen || 0) + 1;
  if (el.classList && el.classList.remove) el.classList.remove('overlay-closing');
}

function animateOverlayClose(el, done) {
  const finishNow = () => {
    if (el && el.classList && el.classList.remove) el.classList.remove('overlay-closing');
    if (el && el.style) el.style.display = 'none';
    if (typeof done === 'function') done();
  };
  if (!el || !el.style) {
    if (typeof done === 'function') done();
    return;
  }
  if (typeof el.addEventListener !== 'function') {
    finishNow();
    return;
  }
  const gen = (el.__closeGen || 0) + 1;
  el.__closeGen = gen;
  if (el.classList && el.classList.add) el.classList.add('overlay-closing');
  let finished = false;
  const finish = () => {
    if (finished || el.__closeGen !== gen) return;
    finished = true;
    finishNow();
  };
  const onEnd = (ev) => {
    const name = ev && ev.animationName;
    if (name !== 'overlayFadeOut' && name !== 'overlayDialogOut' && name !== 'overlaySheetOut') return;
    el.removeEventListener('animationend', onEnd);
    finish();
  };
  el.addEventListener('animationend', onEnd);
  setTimeout(finish, 420);
}

if (typeof window !== 'undefined') {
  window.prepareOverlayOpen = prepareOverlayOpen;
  window.animateOverlayClose = animateOverlayClose;
}

function closePokemonDetailModal() {
  dismissAllFloatingTooltips();
  const modalEl = document.getElementById('pokedex-detail-modal');
  if (modalEl) {
    const cleanup = () => {
      try {
        document.body.style.overflow = '';
        if (document.body && document.body.classList) {
          document.body.classList.remove('pokedex-modal-open');
        }
        if (typeof syncOverlayOpenState === 'function') syncOverlayOpenState();
      } catch (e) {}
    };
    animateOverlayClose(modalEl, cleanup);
  }
}

function updateSliderProgressFill(lvl) {
  const fillBar = document.getElementById('pokedex-slider-fill-bar');
  if (fillBar) {
    const caps = _getPokedexCtrlCaps();
    const maxLv = caps.THEORETICAL_MAX_LEVEL || 100;
    const percent = Math.min(100, Math.max(0, ((lvl - 1) / (maxLv - 1)) * 100));
    fillBar.style.width = `${percent.toFixed(2)}%`;
  }
}

function applyPokedexGodPreset() {
  const pkm = pokedexModalState.pkm;
  if (!pkm) return;
  const spec = pkm.specialty || '';
  const minEvoLvl = getPokedexMinEvolutionLevel(pkm);
  pokedexModalState.level = Math.max(minEvoLvl, 60);
  pokedexModalState.ribbon = 4;
  pokedexModalState.skillLevel = getPokedexMainSkillMaxLvl(pkm.main_skill);
  pokedexModalState.ingSlots = [0, 0, 0];

  if (spec.includes('食材') || spec === 'Ingredients') {
    pokedexModalState.nature = '冷靜';
    pokedexModalState.subskills = ['食材機率提升M', '幫手獎勵', '食材機率提升S', '幫忙速度M', '持有上限提升L'];
  } else if (spec.includes('樹果') || spec === 'Berries') {
    pokedexModalState.nature = '固執';
    pokedexModalState.subskills = ['樹果數量S', '幫手獎勵', '幫忙速度M', '幫忙速度S', '持有上限提升L'];
  } else if (isBerryBurstSkillSpecialist(pkm)) {
    // 樹果遽增型：完美結合樹果數量S與主技能爆發
    pokedexModalState.nature = '慎重';
    pokedexModalState.subskills = ['樹果數量S', '技能機率提升M', '幫手獎勵', '幫忙速度M', '持有上限提升L'];
  } else {
    // 技能型：全數回歸社群正統無爭議之「純技能高頻極致發動」神配
    // 避免任何樹果S加速塞包導致滿包（偷吃樹果）阻斷主技能判定
    pokedexModalState.nature = '慎重'; // 主技能機率▲ (+20%), 食材機率▼ (-20% 降低塞包風險，全力保障主技能判定)
    pokedexModalState.subskills = ['技能機率提升M', '幫手獎勵', '技能機率提升S', '幫忙速度M', '持有上限提升L'];
  }
  pokedexActiveSubskillSlot = 1;

  const slider = document.getElementById('pokedex-level-slider');
  const valText = document.getElementById('pokedex-level-val-text');
  if (slider) slider.value = pokedexModalState.level;
  if (valText) valText.textContent = pokedexModalState.level;
  updateSliderProgressFill(pokedexModalState.level);

  const natureSelect = document.getElementById('pokedex-poke-nature');
  if (natureSelect) natureSelect.value = pokedexModalState.nature;

  const skillSelect = document.getElementById('pokedex-poke-skill-level');
  if (skillSelect) skillSelect.value = pokedexModalState.skillLevel;

  const ribbonSelect = document.getElementById('pokedex-poke-ribbon');
  if (ribbonSelect) ribbonSelect.value = pokedexModalState.ribbon;

  syncPokedexCustomSelects();
  renderPokedexIngredientStrip();
  updatePokedexSubskillUI();
  updatePokedexModalAppraisalLive();
}

function syncPokedexCustomSelects() {
  ['pokedex-poke-skill-level', 'pokedex-poke-nature', 'pokedex-poke-ribbon'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el._customized) {
      el.dispatchEvent(new Event('sync-ui'));
    }
  });
}

function flashSliderLockedWall() {
  const lockedZone = document.getElementById('pokedex-slider-locked-zone');
  if (lockedZone) {
    lockedZone.classList.remove('locked-bounce');
    void lockedZone.offsetWidth;
    lockedZone.classList.add('locked-bounce');
  }
}

function applyPokedexResetPreset() {
  const minEvoLvl = getPokedexMinEvolutionLevel(pokedexModalState.pkm);
  pokedexModalState.level = Math.max(minEvoLvl, 30);
  pokedexModalState.nature = '坦率';
  pokedexModalState.subskills = ['', '', '', '', ''];
  pokedexModalState.skillLevel = 1;
  pokedexModalState.ribbon = 0;
  pokedexModalState.ingSlots = [0, 0, 0];
  pokedexActiveSubskillSlot = 1;

  const caps = _getPokedexCtrlCaps();
  const capLv = caps.POKEMON_LEVEL_CAP || 70;
  const maxLv = caps.THEORETICAL_MAX_LEVEL || 100;

  const slider = document.getElementById('pokedex-level-slider');
  const valText = document.getElementById('pokedex-level-val-text');
  const unreleasedTag = document.getElementById('pokedex-level-unreleased-tag');
  if (slider) {
    slider.min = 1;
    slider.max = maxLv;
    slider.value = pokedexModalState.level;
  }
  if (valText) valText.textContent = pokedexModalState.level;
  updateSliderProgressFill(pokedexModalState.level);
  if (unreleasedTag) {
    if (pokedexModalState.level > capLv) { // default: pokedexModalState.level > 70
      unreleasedTag.classList.remove('hidden');
    } else {
      unreleasedTag.classList.add('hidden');
    }
  }

  const natureSelect = document.getElementById('pokedex-poke-nature');
  if (natureSelect) natureSelect.value = pokedexModalState.nature;

  const skillSelect = document.getElementById('pokedex-poke-skill-level');
  if (skillSelect) skillSelect.value = pokedexModalState.skillLevel;

  const ribbonSelect = document.getElementById('pokedex-poke-ribbon');
  if (ribbonSelect) ribbonSelect.value = pokedexModalState.ribbon;

  syncPokedexCustomSelects();
  renderPokedexIngredientStrip();
  updatePokedexSubskillUI();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalLevel(val) {
  const caps = _getPokedexCtrlCaps();
  const capLv = caps.POKEMON_LEVEL_CAP || 70;
  const maxLv = caps.THEORETICAL_MAX_LEVEL || 100;
  const minEvoLvl = getPokedexMinEvolutionLevel(pokedexModalState.pkm);
  let parsed = parseInt(val, 10);
  if (isNaN(parsed)) parsed = minEvoLvl;
  let clamped = false;
  if (parsed < minEvoLvl) {
    parsed = minEvoLvl;
    clamped = true;
  } else if (parsed > maxLv) {
    parsed = maxLv;
  }
  pokedexModalState.level = parsed;

  const slider = document.getElementById('pokedex-level-slider');
  const valText = document.getElementById('pokedex-level-val-text');
  const unreleasedTag = document.getElementById('pokedex-level-unreleased-tag');
  if (slider) {
    if (slider.min != 1) slider.min = 1;
    if (slider.max != maxLv) slider.max = maxLv;
    if (parseInt(slider.value, 10) < minEvoLvl) {
      slider.value = minEvoLvl;
    } else if (slider.value != pokedexModalState.level) {
      slider.value = pokedexModalState.level;
    }
    if (clamped) {
      flashSliderLockedWall();
    }
  }
  if (valText) valText.textContent = pokedexModalState.level;
  updateSliderProgressFill(pokedexModalState.level);
  if (unreleasedTag) {
    if (pokedexModalState.level > capLv) { // default: pokedexModalState.level > 70
      unreleasedTag.classList.remove('hidden');
    } else {
      unreleasedTag.classList.add('hidden');
    }
  }
  const pins = document.querySelectorAll('#pokedex-track-pins-bar .pokedex-track-pin-btn');
  pins.forEach(pin => {
    const pinLv = parseInt(pin.getAttribute('data-pin-lv'), 10);
    if (pinLv === pokedexModalState.level) pin.classList.add('active');
    else pin.classList.remove('active');
  });
  renderPokedexIngredientStrip();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalNature(val) {
  pokedexModalState.nature = val || '坦率';
  const natureSelect = document.getElementById('pokedex-poke-nature');
  if (natureSelect && natureSelect.value !== pokedexModalState.nature) natureSelect.value = pokedexModalState.nature;
  syncPokedexCustomSelects();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalSubskill(idx, val) {
  pokedexModalState.subskills[idx] = val || '';
  updatePokedexSubskillUI();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalSkillLevel(val) {
  pokedexModalState.skillLevel = parseInt(val, 10) || 1;
  const skillSelect = document.getElementById('pokedex-poke-skill-level');
  if (skillSelect && skillSelect.value != pokedexModalState.skillLevel) skillSelect.value = pokedexModalState.skillLevel;
  syncPokedexCustomSelects();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalRibbon(val) {
  pokedexModalState.ribbon = parseInt(val, 10) || 0;
  const ribbonSelect = document.getElementById('pokedex-poke-ribbon');
  if (ribbonSelect && ribbonSelect.value != pokedexModalState.ribbon) ribbonSelect.value = pokedexModalState.ribbon;
  syncPokedexCustomSelects();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalIng(slotIdx, val) {
  pokedexModalState.ingSlots[slotIdx] = parseInt(val, 10) || 0;
  renderPokedexIngredientStrip();
  updatePokedexModalAppraisalLive();
}

function selectPokedexSubskillSlot(slotNum) {
  pokedexActiveSubskillSlot = parseInt(slotNum, 10) || 1;
  updatePokedexSubskillUI();
}

function choosePokedexSubskill(skName) {
  if (!skName) return;

  const targetSlotIdx = pokedexActiveSubskillSlot - 1;
  const existingSlotIdx = pokedexModalState.subskills.indexOf(skName);

  if (existingSlotIdx === targetSlotIdx) {
    // Already in target slot: clicking it again clears the slot
    pokedexModalState.subskills[targetSlotIdx] = '';
  } else if (existingSlotIdx !== -1) {
    // Currently in another slot: swap with current skill in target slot
    const currentInTarget = pokedexModalState.subskills[targetSlotIdx] || '';
    pokedexModalState.subskills[existingSlotIdx] = currentInTarget;
    pokedexModalState.subskills[targetSlotIdx] = skName;
  } else {
    // Fresh assignment
    pokedexModalState.subskills[targetSlotIdx] = skName;
  }

  if (pokedexModalState.subskills[targetSlotIdx]) {
    let nextEmpty = -1;
    for (let s = 1; s <= 5; s++) {
      if (!pokedexModalState.subskills[s - 1]) {
        nextEmpty = s;
        break;
      }
    }
    if (nextEmpty !== -1) {
      pokedexActiveSubskillSlot = nextEmpty;
    } else if (pokedexActiveSubskillSlot < 5) {
      pokedexActiveSubskillSlot += 1;
    } else {
      pokedexActiveSubskillSlot = 1;
    }
  }

  updatePokedexSubskillUI();
  updatePokedexModalAppraisalLive();
}

function clearAllPokedexSubskills() {
  pokedexModalState.subskills = ['', '', '', '', ''];
  pokedexActiveSubskillSlot = 1;
  updatePokedexSubskillUI();
  updatePokedexModalAppraisalLive();
}

function togglePokedexSubskillPalette() {
  pokedexSubskillPaletteExpanded = !pokedexSubskillPaletteExpanded;
  const palette = document.getElementById('pokedex-subskill-palette');
  const btn = document.getElementById('pokedex-subskill-toggle-btn');
  if (palette) {
    if (pokedexSubskillPaletteExpanded) {
      palette.classList.add('palette-expanded');
    } else {
      palette.classList.remove('palette-expanded');
    }
  }
  if (btn) {
    const textSpan = (typeof btn.querySelector === 'function') ? btn.querySelector('.pokedex-subskill-toggle-text') : null;
    const label = pokedexSubskillPaletteExpanded
      ? (window.I18N?.t?.('dex.ui_collapse_subskills') ?? 'dex.ui_collapse_subskills')
      : (window.I18N?.t?.('dex.ui_expand_subskills') ?? 'dex.ui_expand_subskills');
    if (textSpan) textSpan.textContent = label;
    else btn.textContent = label;
    if (pokedexSubskillPaletteExpanded) {
      btn.classList.add('is-expanded');
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          if (typeof btn.scrollIntoView === 'function') {
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      }
    } else {
      btn.classList.remove('is-expanded');
    }
  }
}

function renderPokedexIngredientStrip() {
  const container = document.getElementById('pokedex-ing-strip');
  if (!container) return;
  const pkm = pokedexModalState.pkm;
  if (!pkm) {
    container.innerHTML = '<span class="box-ing-placeholder-slot">--</span>';
    return;
  }

  const ingList = (pkm.ingredients && pkm.ingredients.length > 0)
    ? pkm.ingredients
    : [{ name: '特選蘋果' }, { name: '暖暖薑' }, { name: '美味尾巴' }];

  const ingA = ingList[0] || { name: '特選蘋果' };
  const ingB = ingList[1] || ingA;
  const ingC = ingList[2] || ingB || ingA;

  const rawLv30 = [ingA, ingB];
  const uniqueLv30 = Array.from(new Set(rawLv30.map(i => i.name))).map(n => rawLv30.find(i => i.name === n));

  const rawLv60 = [ingA, ingB, ingC];
  const uniqueLv60 = Array.from(new Set(rawLv60.map(i => i.name))).map(n => rawLv60.find(i => i.name === n));

  const slots = [
    { level: 1, allowed: [ingA], slotIdx: 0, tag: 'Lv.1' },
    { level: 30, allowed: uniqueLv30, slotIdx: 1, tag: 'Lv.30' },
    { level: 60, allowed: uniqueLv60, slotIdx: 2, tag: 'Lv.60' }
  ];

  container.innerHTML = slots.map((slot, sIdx) => {
    const isUnlocked = pokedexModalState.level >= slot.level;
    const currentOptIdx = pokedexModalState.ingSlots[slot.slotIdx] || 0;

    const optButtons = slot.allowed.map((ing, optIdx) => {
      const isSelected = currentOptIdx === optIdx;
      const ingDisplayName = window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
      const rawIconUrl = ing.icon || (window.I18N && window.I18N.getIngredientIcon(ing.name)) || '';
      const iconUrl = (typeof window.mapExternalToLocalAsset === 'function' ? window.mapExternalToLocalAsset(rawIconUrl) : rawIconUrl) || rawIconUrl;
      return `
        <button type="button" class="box-ing-opt-btn ${isSelected ? 'active' : ''}" data-slot-idx="${slot.slotIdx}" data-opt-idx="${optIdx}" title="${escapeHtml(ingDisplayName)}" aria-label="${escapeHtml(ingDisplayName)}" onclick="window.PokemonApp.setPokedexModalIng(${slot.slotIdx}, ${optIdx})">
          <img src="${iconUrl}" class="box-ing-opt-icon" width="20" height="20" alt="${escapeHtml(ingDisplayName)}" loading="lazy" decoding="async">
        </button>
      `;
    }).join('');

    return `
      <div class="box-ing-slot-group ${isUnlocked ? '' : 'slot-locked'}" style="${isUnlocked ? '' : 'opacity:0.6;'}">
        <span class="box-ing-lvl-tag">${slot.tag}</span>
        <div class="box-ing-options-list">${optButtons}</div>
      </div>
      ${sIdx < 2 ? '<span class="box-ing-slot-sep">|</span>' : ''}
    `;
  }).join('');
}

function updatePokedexSubskillUI() {
  const tr = (k, params) => (window.I18N && typeof window.I18N.t === 'function') ? window.I18N.t(k, params) : k;
  const subskills = pokedexModalState.subskills;
  const currentLevel = pokedexModalState.level;
  const caps = _getPokedexCtrlCaps();
  const capLv = caps.POKEMON_LEVEL_CAP || 70;
  const slotLevels = [10, 25, 50, 70, 80];

  // 1. 更新 5 個插槽按鈕
  const slotContainer = document.getElementById('pokedex-subskill-slots-row');
  if (slotContainer) {
    slotContainer.innerHTML = slotLevels.map((lvl, idx) => {
      const slotNum = idx + 1;
      const isActive = slotNum === pokedexActiveSubskillSlot;
      const skName = subskills[idx] || '';
      const isLevelReached = currentLevel >= lvl;
      const isUnreleasedSlot = lvl > capLv; // default: lvl > 70
      const isEffectActive = isLevelReached;

      let badgeHtml = '';
      if (!skName) {
        if (isLevelReached) {
          badgeHtml = `<span class="slot-val-badge slot-val-empty">${tr('dex.ui_slot_empty')}</span>`;
        } else {
          badgeHtml = `<span class="slot-val-badge slot-val-empty">${tr('dex.ui_slot_locked')}</span>`;
        }
      } else {
        const skObj = POKEDEX_MODAL_SUBSKILLS.find(s => s.name === skName);
        const tier = skObj ? skObj.tier : 'white';
        const skLabel = (window.I18N && typeof window.I18N.getSubSkillName === 'function')
          ? window.I18N.getSubSkillName(skName)
          : (skObj ? (window.I18N?.pick?.({ 'zh-TW': skName, 'en-US': skObj.name_en }) ?? skName) : skName);
        const inactiveCls = !isEffectActive ? 'pill-inactive' : '';
        badgeHtml = `<span class="slot-val-badge box-subskill-pill subskill-${tier} ${inactiveCls}">${escapeHtml(skLabel)}</span>`;
      }

      let statusTagHtml = '';
      if (!isLevelReached) {
        if (skName) {
          statusTagHtml = `<span class="slot-unreleased-tag slot-tag-inactive">${tr('dex.ui_slot_inactive')}</span>`;
        } else {
          statusTagHtml = `<span class="slot-unreleased-tag slot-tag-under-lvl">${tr('dex.ui_slot_level_low')}</span>`;
        }
      }

      const buttonClasses = ['box-subskill-slot-btn'];
      if (isActive) buttonClasses.push('active');
      if (!isLevelReached) buttonClasses.push('slot-under-lvl');
      if (skName && !isEffectActive) buttonClasses.push('slot-effect-inactive');

      let tooltipText = `Lv.${lvl}`;
      if (!isLevelReached) {
        tooltipText = `Lv.${lvl} (${tr('dex.ui_slot_requires_lv', { level: lvl })})`;
      } else if (isUnreleasedSlot) {
        tooltipText = `Lv.${lvl} (${tr('dex.ui_slot_sim_lv')})`;
      }

      return `
        <button type="button" class="${buttonClasses.join(' ')}" data-slot="${slotNum}" onclick="window.PokemonApp.selectPokedexSubskillSlot(${slotNum})" title="${tooltipText}">
          <span class="slot-lvl-header">Lv.${lvl} ${statusTagHtml}</span>
          ${badgeHtml}
        </button>
      `;
    }).join('');
  }

  // 2. 獲取已被選取的副技能
  const usedSkills = new Set();
  subskills.forEach(s => { if (s) usedSkills.add(s); });

  // 3. 更新平鋪選擇盤
  ['gold', 'blue', 'white'].forEach(tier => {
    const chipContainer = document.getElementById(`pokedex-subskill-chips-${tier}`);
    if (!chipContainer) return;

    const skillsInTier = POKEDEX_MODAL_SUBSKILLS.filter(s => s.tier === tier);
    chipContainer.innerHTML = skillsInTier.map(sk => {
      const skDisplayName = (window.I18N && typeof window.I18N.getSubSkillName === 'function')
        ? window.I18N.getSubSkillName(sk.name)
        : (window.I18N?.pick?.({ 'zh-TW': sk.name, 'en-US': sk.name_en }) ?? sk.name);
      const isUsed = usedSkills.has(sk.name);
      return `
        <button type="button" class="box-subskill-chip subskill-${tier} ${isUsed ? 'in-use' : ''}" data-name="${escapeHtml(sk.name)}" onclick="window.PokemonApp.choosePokedexSubskill('${escapeHtml(sk.name)}')" title="${escapeHtml(skDisplayName)}${isUsed ? tr('dex.ui_subskill_selected') : ''}">
          <span>${escapeHtml(skDisplayName)}</span>
          ${isUsed ? '<span style="font-size:10px;opacity:0.8;margin-left:2px;">[✓]</span>' : ''}
        </button>
      `;
    }).join('');
  });

  // 4. 更新展開/收合按鈕狀態與樣式
  const toggleBtn = document.getElementById('pokedex-subskill-toggle-btn');
  if (toggleBtn) {
    const textSpan = (typeof toggleBtn.querySelector === 'function') ? toggleBtn.querySelector('.pokedex-subskill-toggle-text') : null;
    const label = pokedexSubskillPaletteExpanded ? tr('dex.ui_collapse_subskills') : tr('dex.ui_expand_subskills');
    if (textSpan) textSpan.textContent = label;
    else toggleBtn.textContent = label;
    if (pokedexSubskillPaletteExpanded) {
      toggleBtn.classList.add('is-expanded');
    } else {
      toggleBtn.classList.remove('is-expanded');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getMainSkillMaxLevel,
    getPokedexMainSkillMaxLvl,
    getPokemonEvolutionFamily: typeof getPokemonEvolutionFamily !== 'undefined' ? getPokemonEvolutionFamily : undefined,
    formatPokemonEvoReq: typeof formatPokemonEvoReq !== 'undefined' ? formatPokemonEvoReq : undefined,
    renderPokedexEvolutionTreeHTML: typeof renderPokedexEvolutionTreeHTML !== 'undefined' ? renderPokedexEvolutionTreeHTML : undefined
  };
}
