function getPokedexMainSkillMaxLvl(skillName) {
  if (!skillName) return 6;
  if (skillName.includes('能量充填') || skillName.includes('Charge Strength')) return 7;
  if (skillName.includes('食材獲取') || skillName.includes('Ingredient Magnet')) return 7;
  if (skillName.includes('食材精選') || skillName.includes('Ingredient Draw')) return 7;
  if (skillName.includes('夢之碎片') || skillName.includes('Dream Shard')) return 7;
  if (skillName.includes('料理等級') || skillName.includes('Cooking Power')) return 7;
  return 6;
}

function parsePokedexIntervalToSec(intervalStr) {
  if (!intervalStr || intervalStr === '--') return 3600;
  const parts = intervalStr.split(':').map(n => parseInt(n, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseInt(intervalStr, 10) || 3600;
}

function formatPokedexIntervalSec(totalSec) {
  if (!totalSec || totalSec <= 0) return '00:00';
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function openPokemonDetailModal(pokemonIdOrObject) {
  const pokemons = PokemonApp.allPokemons || window.allPokemons || [];
  let pkm = null;
  if (pokemonIdOrObject && typeof pokemonIdOrObject === 'object') {
    pkm = pokemonIdOrObject.id ? pokemonIdOrObject : null;
  }
  if (!pkm) {
    pkm = pokemons.find(p => String(p.id) === String(pokemonIdOrObject) || p.formatted_no === pokemonIdOrObject || p.name_cn === pokemonIdOrObject || p.name_en === pokemonIdOrObject);
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
    const percent = Math.min(100, Math.max(0, ((lvl - 1) / 99) * 100));
    fillBar.style.width = `${percent.toFixed(2)}%`;
  }
}

// 1. 樹果遽增型 (Berry Burst Specialists): 主技能為樹果遽增/畫皮/流星群，天然以產果為核心
function isBerryBurstSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('樹果遽增') || skill.includes('Berry Burst') || skill.includes('畫皮') || skill.includes('流星群')) return true;
  const burstNames = ['木守宮', '森林蜥蜴', '蜥蜴王', '小火焰猴', '猛火猴', '烈焰猴', '毛頭小鷹', '勇士雄鷹', '謎擬Q', '拉帝歐斯',
                      'Treecko', 'Grovyle', 'Sceptile', 'Chimchar', 'Monferno', 'Infernape', 'Rufflet', 'Braviary', 'Mimikyu', 'Latios'];
  return burstNames.some(b => name.includes(b));
}

function isBfsSkillSpecialist(pkm) {
  return isBerryBurstSkillSpecialist(pkm);
}

function isHealerSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('活力全體療癒') || skill.includes('Energy for Everyone') || skill.includes('新月祈禱') || skill.includes('樹果汁') || skill.includes('治癒波動') || skill.includes('活力療癒') || skill.includes('活力氣場') || skill.includes('Energizing Cheer')) return true;
  const healerNames = ['沙奈朵', '仙子伊布', '胖可丁', '巴布土撥', '拉魯拉絲', '奇鲁莉安', '寶寶丁', '胖丁', '布撥', '布土撥', '克雷色利亞', '壺壺', '拉帝亞斯', '托戈德瑪爾',
                       'Gardevoir', 'Sylveon', 'Wigglytuff', 'Pawmot', 'Ralts', 'Kirlia', 'Igglybuff', 'Jigglypuff', 'Pawmi', 'Pawmo', 'Cresselia', 'Shuckle', 'Latias', 'Togedemaru'];
  return healerNames.some(h => name.includes(h));
}

function isHelperBoostSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('幫手加速') || skill.includes('幫手支援') || skill.includes('Helper Boost') || skill.includes('Extra Helpful')) return true;
  const beastNames = ['雷公', '炎帝', '水君', '風速狗', '卡蒂狗', '雷伊布', '艾路雷朵',
                      'Raikou', 'Entei', 'Suicune', 'Arcanine', 'Growlithe', 'Jolteon', 'Gallade'];
  return beastNames.some(b => name.includes(b));
}

function isChargeStrengthSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('能量填充') || skill.includes('Charge Strength') || skill.includes('蓄力') || skill.includes('夢魘')) return true;
  const chargeNames = ['電龍', '咩利羊', '茸茸羊', '太陽伊布', '可達鴨', '哥達鴨', '樹才怪', '盆才怪', '隨風球', '飄飄球', '音波龍', '嗡蝠', '達克萊伊',
                       'Ampharos', 'Mareep', 'Flaaffy', 'Espeon', 'Psyduck', 'Golduck', 'Sudowoodo', 'Bonsly', 'Drifblim', 'Drifloon', 'Noivern', 'Noibat', 'Darkrai'];
  return chargeNames.some(c => name.includes(c));
}

function isPotExpanderSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('料理強化') || skill.includes('Cooking Power') || skill.includes('負電')) return true;
  const potNames = ['小磁怪', '三合一磁怪', '自爆磁怪', '火伊布', '冰伊布', '負電拍拍', '顫弦蠑螈',
                    'Magnemite', 'Magneton', 'Magnezone', 'Flareon', 'Glaceon', 'Minun', 'Toxtricity'];
  return potNames.some(p => name.includes(p));
}

function isExtraTastySkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('料理成功') || skill.includes('美味大成功') || skill.includes('Extra Tasty') || skill.includes('Tasty Chance')) return true;
  const tastyNames = ['咚咚鼠', '海豹球（佳節）', '古月鳥', 'Dedenne', 'Spheal (Holiday)', 'Cramorant'];
  return tastyNames.some(t => name.includes(t));
}

function isDreamShardSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('夢之碎片') || skill.includes('Dream Shard') || skill.includes('波導彈')) return true;
  const shardNames = ['利歐路', '路卡利歐', '喵喵', '貓老大', '勾魂眼', '溶食獸', '吞食獸',
                      'Riolu', 'Lucario', 'Meowth', 'Persian', 'Sableye', 'Gulpin', 'Swalot'];
  return shardNames.some(s => name.includes(s));
}

function isIngredientSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('食材獲取') || skill.includes('食材精選') || skill.includes('正電') || skill.includes('怪力鉗') || skill.includes('超幸運') || skill.includes('健美') || skill.includes('禮物')) return true;
  const ingNames = ['水伊布', '伊布', '毒電嬰', '正電拍拍', '穿山鼠', '穿山王', '石居蟹', '岩殿居蟹', '摔角鷹人', '赫拉克羅斯', '黑暗鴉', '烏鴉頭頭',
                    'Vaporeon', 'Eevee', 'Toxel', 'Plusle', 'Sandshrew', 'Sandslash', 'Dwebble', 'Crustle', 'Hawlucha', 'Heracross', 'Murkrow', 'Honchkrow'];
  return ingNames.some(i => name.includes(i));
}

function isMetronomeSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('揮指') || skill.includes('十項全能') || skill.includes('Metronome')) return true;
  const metronomeNames = ['波克比', '波克基古', '波克基斯', '夢幻', '皮寶寶', 'Togepi', 'Togetic', 'Togekiss', 'Mew', 'Cleffa'];
  return metronomeNames.some(m => name.includes(m));
}

function isLegendaryPokemon(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('精神擊破') || skill.includes('十項全能') || skill.includes('新月祈禱') || skill.includes('流星群') || skill.includes('夢魘')) return true;
  const legendaryNames = ['雷公', '炎帝', '水君', '超夢', '夢幻', '克雷色利亞', '達克萊伊', '拉帝歐斯', '拉帝亞斯',
                          'Raikou', 'Entei', 'Suicune', 'Mewtwo', 'Mew', 'Cresselia', 'Darkrai', 'Latios', 'Latias'];
  return legendaryNames.some(l => name.includes(l));
}

function isSlowpokeFamily(pkm) {
  if (!pkm) return false;
  const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
  return ['呆呆獸', '呆殼獸', '呆呆王', 'Slowpoke', 'Slowbro', 'Slowking'].some(s => name.includes(s));
}

function isSlakingFamily(pkm) {
  if (!pkm) return false;
  const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
  return ['請假王', '過動猿', '懶人獺', 'Slaking', 'Vigoroth', 'Slakoth'].some(s => name.includes(s));
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

  const slider = document.getElementById('pokedex-level-slider');
  const valText = document.getElementById('pokedex-level-val-text');
  const unreleasedTag = document.getElementById('pokedex-level-unreleased-tag');
  if (slider) {
    slider.min = 1;
    slider.max = 100;
    slider.value = pokedexModalState.level;
  }
  if (valText) valText.textContent = pokedexModalState.level;
  updateSliderProgressFill(pokedexModalState.level);
  if (unreleasedTag) {
    if (pokedexModalState.level > 60) {
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
  const minEvoLvl = getPokedexMinEvolutionLevel(pokedexModalState.pkm);
  let parsed = parseInt(val, 10);
  if (isNaN(parsed)) parsed = minEvoLvl;
  let clamped = false;
  if (parsed < minEvoLvl) {
    parsed = minEvoLvl;
    clamped = true;
  } else if (parsed > 100) {
    parsed = 100;
  }
  pokedexModalState.level = parsed;

  const slider = document.getElementById('pokedex-level-slider');
  const valText = document.getElementById('pokedex-level-val-text');
  const unreleasedTag = document.getElementById('pokedex-level-unreleased-tag');
  if (slider) {
    if (slider.min != 1) slider.min = 1;
    if (slider.max != 100) slider.max = 100;
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
    if (pokedexModalState.level > 60) {
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
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  if (palette) {
    if (pokedexSubskillPaletteExpanded) {
      palette.classList.add('palette-expanded');
    } else {
      palette.classList.remove('palette-expanded');
    }
  }
  if (btn) {
    const textSpan = (typeof btn.querySelector === 'function') ? btn.querySelector('.pokedex-subskill-toggle-text') : null;
    const label = pokedexSubskillPaletteExpanded ? (isEN ? 'Collapse Subskills' : '副技能收合') : (isEN ? 'Expand Subskills' : '副技能展開');
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
      const iconUrl = ing.icon || (window.I18N && window.I18N.getIngredientIcon(ing.name)) || '';
      return `
        <button type="button" class="box-ing-opt-btn ${isSelected ? 'active' : ''}" data-slot-idx="${slot.slotIdx}" data-opt-idx="${optIdx}" title="${escapeHtml(ingDisplayName)}" aria-label="${escapeHtml(ingDisplayName)}" onclick="window.PokemonApp.setPokedexModalIng(${slot.slotIdx}, ${optIdx})">
          <img src="${iconUrl}" class="box-ing-opt-icon" alt="${escapeHtml(ingDisplayName)}" loading="lazy">
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
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  const subskills = pokedexModalState.subskills;
  const currentLevel = pokedexModalState.level;
  const slotLevels = [10, 25, 50, 70, 80];

  // 1. 更新 5 個插槽按鈕
  const slotContainer = document.getElementById('pokedex-subskill-slots-row');
  if (slotContainer) {
    slotContainer.innerHTML = slotLevels.map((lvl, idx) => {
      const slotNum = idx + 1;
      const isActive = slotNum === pokedexActiveSubskillSlot;
      const skName = subskills[idx] || '';
      const isLevelReached = currentLevel >= lvl;
      const isUnreleasedSlot = lvl > 60;
      const isEffectActive = isLevelReached;

      let badgeHtml = '';
      if (!skName) {
        if (isLevelReached) {
          badgeHtml = `<span class="slot-val-badge slot-val-empty">${isEN ? '-- Empty --' : '-- 未配置 --'}</span>`;
        } else {
          badgeHtml = `<span class="slot-val-badge slot-val-empty">${isEN ? '-- Locked --' : '-- 未解鎖 --'}</span>`;
        }
      } else {
        const skObj = POKEDEX_MODAL_SUBSKILLS.find(s => s.name === skName);
        const tier = skObj ? skObj.tier : 'white';
        const skLabel = isEN ? (skObj ? skObj.name_en : skName) : skName;
        const inactiveCls = !isEffectActive ? 'pill-inactive' : '';
        badgeHtml = `<span class="slot-val-badge box-subskill-pill subskill-${tier} ${inactiveCls}">${escapeHtml(skLabel)}</span>`;
      }

      let statusTagHtml = '';
      if (!isLevelReached) {
        if (skName) {
          statusTagHtml = `<span class="slot-unreleased-tag slot-tag-inactive">${isEN ? 'Inactive' : '效果尚未生效'}</span>`;
        } else {
          statusTagHtml = `<span class="slot-unreleased-tag slot-tag-under-lvl">${isEN ? 'Level Low' : '等級不足'}</span>`;
        }
      }

      const buttonClasses = ['box-subskill-slot-btn'];
      if (isActive) buttonClasses.push('active');
      if (!isLevelReached) buttonClasses.push('slot-under-lvl');
      if (skName && !isEffectActive) buttonClasses.push('slot-effect-inactive');

      let tooltipText = `Lv.${lvl}`;
      if (!isLevelReached) {
        tooltipText = `Lv.${lvl} (${isEN ? `Requires Lv.${lvl}` : `等級不足：需達 Lv.${lvl} 方可生效`})`;
      } else if (isUnreleasedSlot) {
        tooltipText = `Lv.${lvl} (${isEN ? 'Simulation Level' : '模擬等級'})`;
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
      const skDisplayName = isEN ? sk.name_en : sk.name;
      const isUsed = usedSkills.has(sk.name);
      return `
        <button type="button" class="box-subskill-chip subskill-${tier} ${isUsed ? 'in-use' : ''}" data-name="${escapeHtml(sk.name)}" onclick="window.PokemonApp.choosePokedexSubskill('${escapeHtml(sk.name)}')" title="${escapeHtml(skDisplayName)}${isUsed ? (isEN ? ' (Selected)' : '（已選用）') : ''}">
          <span>${escapeHtml(skDisplayName)}</span>
          ${isUsed ? '<span style="font-size:10px;opacity:0.8;margin-left:2px;">✓</span>' : ''}
        </button>
      `;
    }).join('');
  });

  // 4. 更新展開/收合按鈕狀態與樣式
  const toggleBtn = document.getElementById('pokedex-subskill-toggle-btn');
  if (toggleBtn) {
    const textSpan = (typeof toggleBtn.querySelector === 'function') ? toggleBtn.querySelector('.pokedex-subskill-toggle-text') : null;
    const label = pokedexSubskillPaletteExpanded ? (isEN ? 'Collapse Subskills' : '副技能收合') : (isEN ? 'Expand Subskills' : '副技能展開');
    if (textSpan) textSpan.textContent = label;
    else toggleBtn.textContent = label;
    if (pokedexSubskillPaletteExpanded) {
      toggleBtn.classList.add('is-expanded');
    } else {
      toggleBtn.classList.remove('is-expanded');
    }
  }
}

