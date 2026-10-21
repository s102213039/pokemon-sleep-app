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

function getPokedexMainSkillYield(mainSkillName, skillLevel, dailyTriggers, isEN) {
  const s = mainSkillName || '';
  const lvl = parseInt(skillLevel, 10) || 1;
  const lvlIdx = Math.max(0, lvl - 1);
  let label = isEN ? 'Main Skill' : (s || '主技能');
  let singleVal = 0;
  let singleText = '';
  let valueText = '';
  let dailyTotal = 0;

  // 1. 健美（料理輔助S）
  if (s.includes('健美') || s.includes('料理輔助') || s.includes('Bulk Up') || s.includes('Cooking Support')) {
    const ingTable = [6, 8, 11, 14, 17, 21, 24];
    const tastyTable = [1, 2, 2, 3, 3, 4, 5];
    const ingVal = ingTable[Math.min(lvlIdx, ingTable.length - 1)];
    const tastyVal = tastyTable[Math.min(lvlIdx, tastyTable.length - 1)];
    const dailyIng = dailyTriggers * ingVal;
    const dailyTasty = dailyTriggers * tastyVal;
    dailyTotal = dailyIng;
    label = isEN ? 'Bulk Up (Cooking Support S)' : '健美（料理輔助S）';
    valueText = isEN 
      ? `+${dailyIng.toFixed(1)} ings & +${dailyTasty.toFixed(1)}% Tasty` 
      : `+${dailyIng.toFixed(1)} 顆食材 & +${dailyTasty.toFixed(1)}% 大成功率`;
    singleText = isEN 
      ? `single: ${ingVal} ings, +${tastyVal}% Tasty` 
      : `單次: ${ingVal} 顆食材, +${tastyVal}% 大成功率`;
  }
  // 2. 正電（食材獲取S）
  else if (s.includes('正電') || s.includes('Plus')) {
    const table = [5, 7, 9, 12, 14, 16, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Plus (Magnet S)' : '正電（食材獲取S）';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'extra ings' : '顆額外食材'}`;
    singleText = `${isEN ? 'base' : '單次基準'} ${singleVal} ${isEN ? 'ings (+teammate bonus)' : '顆 (+同伴加成)'}`;
  }
  // 3. 禮物（食材獲取S）
  else if (s.includes('禮物') || s.includes('Present')) {
    const table = [4, 6, 8, 11, 13, 15, 17];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Present (Magnet S)' : '禮物（食材獲取S）';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'extra ings' : '顆額外食材'}`;
    singleText = `${isEN ? 'base' : '單次基準'} ${singleVal} ${isEN ? 'ings (+candy chance)' : '顆 (+機率糖果)'}`;
  }
  // 4. 食材獲取S
  else if (s.includes('食材獲取') || s.includes('Ingredient Magnet')) {
    const table = [6, 8, 11, 14, 17, 21, 24];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Magnet S' : (s.includes('（') ? s : '食材獲取S');
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'extra ings' : '顆額外食材'}`;
    singleText = `${isEN ? 'yield' : '單次'} ${singleVal} ${isEN ? 'ings' : '顆'}`;
  }
  // 5. 怪力鉗（食材精選S）
  else if (s.includes('怪力鉗') || s.includes('怪力钳') || s.includes('Hyper Cutter')) {
    const table = [5, 6, 8, 11, 13, 16, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Hyper Cutter (Draw S)' : '怪力鉗（食材精選S）';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'selected ings' : '顆專屬食材'}`;
    singleText = `${isEN ? 'base' : '單次基準'} ${singleVal} ${isEN ? 'ings (crit 2x)' : '顆 (暴擊2倍)'}`;
  }
  // 6. 超幸運（食材精選S）
  else if (s.includes('超幸運') || s.includes('Super Luck')) {
    const table = [5, 6, 8, 11, 13, 16, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Super Luck (Draw S)' : '超幸運（食材精選S）';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'selected ings' : '顆專屬食材'}`;
    singleText = `${isEN ? 'base' : '單次基準'} ${singleVal} ${isEN ? 'ings (crit Shards)' : '顆 (暴擊碎片)'}`;
  }
  // 7. 食材精選S
  else if (s.includes('食材精選') || s.includes('Ingredient Draw')) {
    const table = [5, 6, 8, 11, 13, 16, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Draw S' : (s.includes('（') ? s : '食材精選S');
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'selected ings' : '顆專屬食材'}`;
    singleText = `${isEN ? 'yield' : '單次'} ${singleVal} ${isEN ? 'ings' : '顆'}`;
  }
  // 8. 精神擊破（樹果領域）
  else if (s.includes('精神擊破') || s.includes('Psystrike')) {
    const table = [2640, 3753, 5178, 7149, 9870, 13638, 18515];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Psystrike (Berry Field)' : '精神擊破（樹果領域）';
    valueText = `+${Math.round(dailyTotal).toLocaleString()} ${isEN ? 'Strength + Berry Field' : '點能量 + 樹果領域'}`;
    singleText = `${isEN ? 'base' : '單次'} ${singleVal.toLocaleString()} ${isEN ? 'Str + Field' : '能量 + 領域'}`;
  }
  // 9. 能量填充M
  else if (s.includes('能量填充M') || s.includes('Charge Str. M') || s.includes('Charge Strength M') || s.includes('夢魘') || s.includes('Bad Dreams')) {
    const isBadDreams = s.includes('夢魘') || s.includes('Bad Dreams');
    const table = isBadDreams ? [2640, 3753, 5178, 7149, 9870, 13638, 18515] : [880, 1251, 1726, 2383, 3290, 4546, 6409];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? (isBadDreams ? 'Bad Dreams M' : 'Charge Str. M') : (s.includes('（') ? s : '能量填充M');
    valueText = `+${Math.round(dailyTotal).toLocaleString()} ${isEN ? 'Strength' : '點能量'}`;
    singleText = `${isEN ? 'base' : '單次'} ${singleVal.toLocaleString()} ${isEN ? 'Str' : '能量'}`;
  }
  // 10. 能量填充S
  else if (s.includes('能量填充S') || s.includes('Charge Str. S') || s.includes('Charge Strength S')) {
    if (s.includes('隨機') || s.includes('Random')) {
      const table = [500, 712, 982, 1354, 1870, 2583, 4015];
      singleVal = table[Math.min(lvlIdx, table.length - 1)];
      dailyTotal = dailyTriggers * singleVal;
      label = isEN ? 'Charge Str. S (Random)' : '能量填充S（隨機）';
      valueText = `+${Math.round(dailyTotal).toLocaleString()} ${isEN ? 'Strength (Avg)' : '點能量 (均值)'}`;
      singleText = `${isEN ? 'avg' : '單次均值'} ${singleVal.toLocaleString()} ${isEN ? 'Str' : '能量'}`;
    } else if (s.includes('蓄力') || s.includes('Stockpile')) {
      const table = [600, 853, 1177, 1625, 2243, 3099, 4502];
      singleVal = table[Math.min(lvlIdx, table.length - 1)];
      dailyTotal = dailyTriggers * singleVal;
      label = isEN ? 'Stockpile' : '蓄力（能量填充S）';
      valueText = `+${Math.round(dailyTotal).toLocaleString()} ${isEN ? 'Base Strength' : '點基準能量'}`;
      singleText = `${isEN ? 'base' : '單次蓄力'} ${singleVal.toLocaleString()} ${isEN ? 'Str' : '能量'}`;
    } else {
      const table = [400, 569, 785, 1083, 1496, 2066, 3212];
      singleVal = table[Math.min(lvlIdx, table.length - 1)];
      dailyTotal = dailyTriggers * singleVal;
      label = isEN ? 'Charge Str. S' : (s.includes('（') ? s : '能量填充S');
      valueText = `+${Math.round(dailyTotal).toLocaleString()} ${isEN ? 'Strength' : '點能量'}`;
      singleText = `${isEN ? 'base' : '單次'} ${singleVal.toLocaleString()} ${isEN ? 'Str' : '能量'}`;
    }
  }
  // 11. 新月祈禱（活力全體療癒S）
  else if (s.includes('新月祈禱') || s.includes('Lunar Prayer')) {
    const table = [3, 4, 5, 7, 9, 11];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Lunar Prayer' : '新月祈禱（活力全體療癒S）';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Team Energy + Berries' : '點全員活力 + 樹果'}`;
    singleText = `${isEN ? 'single' : '單次'} ${singleVal} ${isEN ? 'pts (+Psychic team berries)' : '點 (+超能力樹果)'}`;
  }
  // 12. 樹果汁（活力全體療癒S）
  else if (s.includes('樹果汁') || s.includes('Berry Juice')) {
    const table = [5, 7, 9, 11, 15, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Berry Juice (E4E S)' : '樹果汁（活力全體療癒S）';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Team Energy' : '點全員活力'}`;
    singleText = `${isEN ? 'single' : '單次全員'} ${singleVal} ${isEN ? 'pts (+item chance)' : '點 (+機率產樹果汁)'}`;
  }
  // 13. 活力全體療癒S
  else if (s.includes('活力全體療癒') || s.includes('Energy for Everyone')) {
    const table = [5, 7, 9, 11, 15, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'E4E S' : (s.includes('（') ? s : '活力全體療癒S');
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Team Energy' : '點全員活力'}`;
    singleText = `${isEN ? 'heal' : '單次'} ${singleVal} ${isEN ? 'pts' : '點'}`;
  }
  // 14. 月光（活力充填S）
  else if (s.includes('月光') || s.includes('Moonlight')) {
    const table = [12, 16, 21, 26, 33, 43];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Moonlight (Charge Energy S)' : '月光（活力充填S）';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Self Energy' : '點自身活力'}`;
    singleText = `${isEN ? 'single' : '單次自身'} ${singleVal} ${isEN ? 'pts (+ally on Tasty)' : '點 (大成功額外補隊友)'}`;
  }
  // 15. 活力充填S
  else if (s.includes('活力充填') || s.includes('活力填充') || s.includes('Charge Energy')) {
    const table = [12, 16, 21, 26, 33, 43];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Charge Energy S' : (s.includes('（') ? s : '活力充填S');
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Self Energy' : '點自身活力'}`;
    singleText = `${isEN ? 'heal' : '單次'} ${singleVal} ${isEN ? 'pts' : '點'}`;
  }
  // 16. 治癒波動（活力療癒S）
  else if (s.includes('治癒波動') || s.includes('Heal Pulse')) {
    const table = [6, 8, 11, 14, 18, 22];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal * 2;
    label = isEN ? 'Heal Pulse (Cheer S)' : '治癒波動（活力療癒S）';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Energy (2 Allies)' : '點隊友活力 (2隻)'}`;
    singleText = `${isEN ? 'single: ' : '單次: 各'}${singleVal} ${isEN ? 'pts to 2 allies' : '點 (共2隻)'}`;
  }
  // 17. 蹭蹭臉頰（活力療癒S）
  else if (s.includes('蹭蹭臉頰') || s.includes('Nuzzle')) {
    const table = [9, 12, 16, 20, 26, 35];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Nuzzle (Cheer S)' : '蹭蹭臉頰（活力療癒S）';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Ally Energy' : '點隊友活力'}`;
    singleText = `${isEN ? 'single' : '單次'} ${singleVal} ${isEN ? 'pts (+bonus proc chance)' : '點 (+機率追加發動)'}`;
  }
  // 18. 活力療癒S
  else if (s.includes('活力療癒') || s.includes('Energizing Cheer')) {
    const table = [12, 15, 20, 25, 33, 44];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Energizing Cheer S' : (s.includes('（') ? s : '活力療癒S');
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Ally Energy' : '點隊友活力'}`;
    singleText = `${isEN ? 'heal' : '單次'} ${singleVal} ${isEN ? 'pts' : '點'}`;
  }
  // 19. 幫手加速
  else if (s.includes('幫手加速') || s.includes('Helper Boost')) {
    const table = [6, 7, 8, 9, 10, 11];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Helper Boost' : (s.includes('（') ? s : '幫手加速');
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Team Helps' : '次全員幫忙'}`;
    singleText = `${isEN ? 'max' : '單次最高'} ${singleVal} ${isEN ? 'helps' : '次'}`;
  }
  // 20. 幫手支援S
  else if (s.includes('幫手支援') || s.includes('Extra Helpful')) {
    const table = [6, 7, 8, 9, 10, 11, 12];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Extra Helpful S' : '幫手支援S';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Ally Helps' : '次隊友幫忙'}`;
    singleText = `${isEN ? 'yield' : '單次'} ${singleVal} ${isEN ? 'helps' : '次'}`;
  }
  // 21. 樹果遽增 (excluding 精神擊破)
  else if (s.includes('樹果遽增') || s.includes('Berry Burst') || s.includes('流星群') || s.includes('畫皮')) {
    const isMimikyu = s.includes('畫皮') || s.includes('Disguise');
    const table = isMimikyu ? [12, 18, 23, 29, 35, 41] : [15, 22, 29, 36, 43, 50];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Berry Burst' : (s.includes('（') ? s : '樹果遽增');
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Extra Berries' : '顆額外樹果'}`;
    singleText = `${isEN ? 'approx' : '單次約'} ${singleVal} ${isEN ? 'berries' : '顆'}`;
  }
  // 22. 波導彈（夢之碎片獲取S）
  else if (s.includes('波導彈') || s.includes('Aura Sphere')) {
    const shardTable = [240, 340, 480, 670, 920, 1260, 1800, 2500];
    const strTable = [200, 280, 396, 552, 758, 1038, 1482, 2042];
    const singleShard = shardTable[Math.min(lvlIdx, shardTable.length - 1)];
    const singleStr = strTable[Math.min(lvlIdx, strTable.length - 1)];
    const dailyShard = dailyTriggers * singleShard;
    const dailyStr = dailyTriggers * singleStr;
    dailyTotal = dailyShard;
    label = isEN ? 'Aura Sphere (Shards S)' : '波導彈（夢之碎片獲取S）';
    valueText = isEN 
      ? `+${Math.round(dailyShard).toLocaleString()} shards & +${Math.round(dailyStr).toLocaleString()} Str` 
      : `+${Math.round(dailyShard).toLocaleString()} 碎片 & +${Math.round(dailyStr).toLocaleString()} 能量`;
    singleText = isEN 
      ? `single: ${singleShard.toLocaleString()} shards, +${singleStr.toLocaleString()} Str` 
      : `單次: ${singleShard.toLocaleString()} 碎片, +${singleStr.toLocaleString()} 能量`;
  }
  // 23. 夢之碎片獲取S
  else if (s.includes('夢之碎片') || s.includes('Dream Shard')) {
    if (s.includes('隨機') || s.includes('Random')) {
      const table = [300, 425, 600, 838, 1150, 1575, 2250, 2875];
      singleVal = table[Math.min(lvlIdx, table.length - 1)];
      dailyTotal = dailyTriggers * singleVal;
      label = isEN ? 'Dream Shards (Random)' : '夢之碎片獲取S（隨機）';
      valueText = `+${Math.round(dailyTotal).toLocaleString()} ${isEN ? 'Shards (Avg)' : '個夢之碎片 (均值)'}`;
      singleText = `${isEN ? 'avg' : '單次均值'} ${singleVal.toLocaleString()}`;
    } else {
      const table = [240, 340, 480, 670, 920, 1260, 1800, 2500];
      singleVal = table[Math.min(lvlIdx, table.length - 1)];
      dailyTotal = dailyTriggers * singleVal;
      label = isEN ? 'Dream Shards S' : (s.includes('（') ? s : '夢之碎片獲取S');
      valueText = `+${Math.round(dailyTotal).toLocaleString()} ${isEN ? 'Dream Shards' : '個夢之碎片'}`;
      singleText = `${isEN ? 'yield' : '單次'} ${singleVal.toLocaleString()} ${isEN ? 'shards' : '碎片'}`;
    }
  }
  // 24. 負電（料理強化S）
  else if (s.includes('負電') || s.includes('Minus')) {
    const table = [5, 7, 9, 12, 16, 20, 24];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Minus (Cooking Power Up S)' : '負電（料理強化S）';
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Pot Space' : '鍋子容量'}`;
    singleText = `${isEN ? 'single' : '單次'} +${singleVal} ${isEN ? 'cap (+energy heal)' : '容量 (+同伴回復)'}`;
  }
  // 25. 料理強化S
  else if (s.includes('料理強化') || s.includes('Cooking Power Up')) {
    const table = [7, 10, 12, 17, 22, 27, 31];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Cooking Power Up S' : (s.includes('（') ? s : '料理強化S');
    valueText = `+${dailyTotal.toFixed(1)} ${isEN ? 'Pot Space' : '鍋子容量'}`;
    singleText = `${isEN ? 'boost' : '單次'} +${singleVal} ${isEN ? 'capacity' : '容量'}`;
  }
  // 26. 料理成功S (not including 健美)
  else if (s.includes('料理成功') || s.includes('Tasty Chance')) {
    const table = [4, 5, 6, 7, 8, 10];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isEN ? 'Tasty Chance S' : (s.includes('（') ? s : '料理成功S');
    valueText = `+${dailyTotal.toFixed(1)}% ${isEN ? 'Tasty Chance' : '大成功機率'}`;
    singleText = `${isEN ? 'boost' : '單次'} +${singleVal}%`;
  }
  // 27. 揮指 / 模仿 / 變身 / 十項全能
  else if (s.includes('揮指') || s.includes('Metronome') || s.includes('模仿') || s.includes('變身') || s.includes('十項全能')) {
    singleVal = 1;
    dailyTotal = dailyTriggers;
    label = isEN ? 'Metronome' : (s.includes('變身') ? '變身' : (s.includes('模仿') ? '模仿' : '揮指'));
    valueText = isEN ? 'Random / Mimic Skill Effect' : '隨機/複製發動各類主技能';
    singleText = isEN ? 'variable' : '隨機觸發';
  } else if (s) {
    singleVal = 1;
    dailyTotal = dailyTriggers;
    label = s;
    valueText = isEN ? `~${dailyTriggers.toFixed(2)} triggers / day` : `單日約 ${dailyTriggers.toFixed(2)} 次發動`;
    singleText = isEN ? 'skill proc' : '主技能發動';
  }

  const mainSkillDesc = typeof getSkillDescription === 'function' ? getSkillDescription(s, isEN) : '';

  return {
    mainSkillExtraDaily: dailyTotal,
    mainSkillLabel: `${label} (Lv.${lvl})`,
    mainSkillValueText: valueText,
    mainSkillSingleText: singleText,
    mainSkillDesc: mainSkillDesc
  };
}

function getIngCountFromBase(basePkm, slotIdx, ingName) {
  if (!basePkm || !basePkm.ingredients) {
    return slotIdx === 0 ? 1 : (slotIdx === 1 ? 2 : 4);
  }
  const found = basePkm.ingredients.find(function(ig) { return ig.name === ingName; });
  if (found) {
    if (slotIdx === 0 && found.l1 !== undefined) return parseInt(found.l1, 10);
    if (slotIdx === 1 && found.l30 !== undefined) return parseInt(found.l30, 10);
    if (slotIdx === 2 && found.l60 !== undefined) return parseInt(found.l60, 10);
    if (typeof found.count === 'number') return found.count;
  }
  const slotIng = basePkm.ingredients[slotIdx];
  if (slotIng) {
    if (slotIdx === 0 && slotIng.l1 !== undefined) return parseInt(slotIng.l1, 10);
    if (slotIdx === 1 && slotIng.l30 !== undefined) return parseInt(slotIng.l30, 10);
    if (slotIdx === 2 && slotIng.l60 !== undefined) return parseInt(slotIng.l60, 10);
    if (typeof slotIng.count === 'number') return slotIng.count;
  }
  return slotIdx === 0 ? 1 : (slotIdx === 1 ? 2 : 4);
}

function calculatePokedexIngredientFormulas(customState) {
  const _pokedexStatsCache = calculatePokedexIngredientFormulas._cache || (calculatePokedexIngredientFormulas._cache = new Map());
  const state = customState || pokedexModalState;
  const pkm = (state && state.pkm) || pokedexModalState.pkm;
  if (!pkm) return null;

  const currentLevel = (state && state.level != null) ? state.level : pokedexModalState.level;
  const currentNature = (state && state.nature != null) ? state.nature : pokedexModalState.nature;
  const subskills = (state && state.subskills != null) ? state.subskills : pokedexModalState.subskills;
  const ribbon = (state && state.ribbon != null) ? state.ribbon : pokedexModalState.ribbon;
  const skillLevel = (state && state.skillLevel != null) ? state.skillLevel : pokedexModalState.skillLevel;
  const ingSlots = (state && state.ingSlots != null) ? state.ingSlots : pokedexModalState.ingSlots;
  const customIngredients = (state && (state.customIngredients || state.ingredients)) ? (state.customIngredients || state.ingredients) : null;

  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
  const isCleanseMintFlag = !!(state && (state.cleanseMint || state.mint || (pkm && (pkm.cleanseMint || pkm.mint))));
  const pkmKey = pkm.id || pkm.formatted_no || pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || '';
  const subKey = Array.isArray(subskills) ? subskills.map(s => typeof s === 'string' ? s : (s && s.name ? s.name : '')).join(',') : '';
  const ingSlotKey = customIngredients
    ? 'cust:' + customIngredients.map(c => typeof c === 'string' ? c : (c && c.name ? c.name : '')).join(',')
    : 'slots:' + (Array.isArray(ingSlots) ? ingSlots.join(',') : '');
  const pkmIngBaseKey = Array.isArray(pkm.ingredients) ? pkm.ingredients.map(i => `${i.name}:${i.l1 || ''}/${i.l30 || ''}/${i.l60 || ''}`).join(';') : '';
  const statsCacheKey = `${isEN ? 'en' : 'zh'}|${pkmKey}|${pkm.interval || ''}|${pkm.ingredient_rate || ''}|${pkm.skill_rate || ''}|${pkm.carry || pkm.carryCapacity || ''}|${pkm.main_skill || ''}|${pkm.specialty || ''}|${pkm.is_final || ''}|${pkmIngBaseKey}|${currentLevel}|${currentNature}|${isCleanseMintFlag ? 1 : 0}|${ribbon}|${skillLevel}|${subKey}|${ingSlotKey}`;

  if (_pokedexStatsCache.has(statsCacheKey)) {
    return _pokedexStatsCache.get(statsCacheKey);
  }

  // 1. 基礎數值
  const baseIngRate = parseFloat(pkm.ingredient_rate || '0') || 20.0;
  const baseSkillRate = parseFloat(pkm.skill_rate || '0') || 2.0;
  const baseIntervalSec = parsePokedexIntervalToSec(pkm.interval);

  // 2. 副技能加成判定 (Lv.10, Lv.25, Lv.50, Lv.70, Lv.80)
  const slotLevels = [10, 25, 50, 70, 80];
  let subskillIngBonus = 0;
  let subskillSpeedBonus = 0;
  let subskillSkillBonus = 0;
  const activeSubskillNames = [];

  subskills.forEach((s, idx) => {
    const sName = (typeof s === 'string') ? s : (s && s.name ? s.name : '');
    if (!sName) return;
    const isUnlocked = currentLevel >= slotLevels[idx];
    if (isUnlocked) {
      activeSubskillNames.push(sName);
      if (sName === '食材機率提升M' || sName.includes('Ingredient Finder M')) subskillIngBonus += 36;
      if (sName === '食材機率提升S' || sName.includes('Ingredient Finder S')) subskillIngBonus += 18;
      if (sName === '幫忙速度M' || sName.includes('Helping Speed M')) subskillSpeedBonus += 14;
      if (sName === '幫忙速度S' || sName.includes('Helping Speed S')) subskillSpeedBonus += 7;
      if (sName === '幫手獎勵' || sName.includes('Helping Bonus')) subskillSpeedBonus += 5;
      if (sName === '技能機率提升M' || sName.includes('Skill Trigger M')) subskillSkillBonus += 36;
      if (sName === '技能機率提升S' || sName.includes('Skill Trigger S')) subskillSkillBonus += 18;
    }
  });

  // 3. 性格修正
  const isCleanseMint = !!(state && (state.cleanseMint || state.mint || (pkm && (pkm.cleanseMint || pkm.mint))));
  const natureObj = POKEDEX_MODAL_NATURES.find(n => n.name === currentNature || n.name_en === currentNature) || { buffType: 'none', debuffType: 'none' };
  let natureIngMult = 1.0;
  let natureSpeedMult = 1.0;
  let natureSkillMult = 1.0;

  if (!isCleanseMint) {
    if (natureObj.buffType === 'ingredient') natureIngMult = 1.20;
    else if (natureObj.debuffType === 'ingredient') natureIngMult = 0.80;

    if (natureObj.buffType === 'speed') natureSpeedMult = 0.90;
    else if (natureObj.debuffType === 'speed') natureSpeedMult = 1.075;

    if (natureObj.buffType === 'skill') natureSkillMult = 1.20;
    else if (natureObj.debuffType === 'skill') natureSkillMult = 0.80;
  }

  // 4. 最終食材發動率
  const finalIngRate = baseIngRate * (1 + subskillIngBonus / 100) * natureIngMult;

  // 5. 幫忙速度與每日幫忙次數
  const levelSpeedDiscount = (currentLevel - 1) * 0.002;
  const speedReduction = Math.min(0.35, subskillSpeedBonus / 100);

  let ribbonDiscount = 0;
  if (ribbon > 0 && window.AppraisalLab && typeof window.AppraisalLab.getRibbonBonus === 'function') {
    const remEvos = window.AppraisalLab.getRemainingEvolutions(pkm);
    const rBonus = window.AppraisalLab.getRibbonBonus(ribbon, remEvos);
    ribbonDiscount = rBonus.speedDiscount || 0;
  }

  const effectiveIntervalSec = Math.max(600, Math.round(baseIntervalSec * (1 - levelSpeedDiscount) * (1 - speedReduction) * natureSpeedMult * (1 - ribbonDiscount)));
  const ENERGY_INTERVAL_MULT = 0.45;
  const BASE_CALC_SECONDS = 43200; // 12 小時日間活躍基準 (12 hours = 43200s)
  const idealIntervalSec = Math.round(effectiveIntervalSec * ENERGY_INTERVAL_MULT * 10) / 10;
  const dailyHelps = BASE_CALC_SECONDS / (effectiveIntervalSec * ENERGY_INTERVAL_MULT);
  const dailyIngDrops = dailyHelps * (finalIngRate / 100);

  // 6. 樹果產量與單日能量 (12h) 精算
  const berryObj = (typeof getPokemonBerry === 'function') ? getPokemonBerry(pkm) : { name: '', icon: '' };
  const berryName = isEN ? (window.I18N ? window.I18N.getBerryName(berryObj.name) : berryObj.name) : berryObj.name;
  const berryRawName = berryObj.name || '';
  const berryIcon = berryObj.icon || '';
  const berryBaseEnergy = getBerryBaseEnergy(berryRawName || pkm.type);
  const singleBerryEnergy = calculateSingleBerryEnergy(berryBaseEnergy, currentLevel);

  const isBerrySpec = !!(pkm.specialty && (pkm.specialty.includes('樹果') || pkm.specialty === 'Berries' || pkm.specialty === 'berry'));
  const baseBerryCount = isBerrySpec ? 2 : 1;
  const hasBFS = activeSubskillNames.some(s => s === '樹果數量S' || s.includes('Berry Finding'));
  const berriesPerHelp = baseBerryCount + (hasBFS ? 1 : 0);

  const dailyBerryHelps = Math.max(0, dailyHelps - dailyIngDrops);
  const dailyBerryCount = dailyBerryHelps * berriesPerHelp;
  const dailyBerryEnergy = Math.round(dailyBerryCount * singleBerryEnergy);
  const dailyBerryEnergyFav = dailyBerryEnergy * 2;

  // 7. 各槽位食材掉落計算
  const ingredientsList = pkm.ingredients || [];
  let unlockedSlotCount = 1;
  if (currentLevel >= 60) unlockedSlotCount = 3;
  else if (currentLevel >= 30) unlockedSlotCount = 2;

  const activeIngredientDetails = [];
  const summaryYieldMap = new Map();

  for (let s = 0; s < unlockedSlotCount; s++) {
    let ingData = null;
    let count = 1;
    if (customIngredients && customIngredients[s]) {
      const cItem = customIngredients[s];
      const cName = (typeof cItem === 'string') ? cItem : (cItem.name || '');
      const found = ingredientsList.find(i => i.name === cName || i.name_en === cName);
      if (found) {
        ingData = found;
      } else {
        const icon = (window.I18N && typeof window.I18N.getIngredientIcon === 'function') ? window.I18N.getIngredientIcon(cName) : '';
        ingData = { name: cName, icon: icon };
      }
      count = getIngCountFromBase(pkm, s, ingData.name);
    } else {
      const ingChoiceIdx = ingSlots[s] || 0;
      ingData = ingredientsList[ingChoiceIdx] || ingredientsList[0] || { name: '甜甜蜜', icon: '' };
      if (s === 0) count = parseInt(ingData.l1 || 1, 10);
      else if (s === 1) count = parseInt(ingData.l30 || ingData.l1 || 1, 10);
      else if (s === 2) count = parseInt(ingData.l60 || ingData.l30 || ingData.l1 || 1, 10);
    }

    const ingName = isEN ? (window.I18N ? window.I18N.getIngredientName(ingData.name) : ingData.name) : ingData.name;
    const ingDailyCount = (dailyIngDrops * (count / unlockedSlotCount));

    activeIngredientDetails.push({
      slot: s + 1,
      name: ingName,
      rawName: ingData.name,
      icon: ingData.icon || '',
      count: count,
      dailyYield: ingDailyCount
    });

    const prev = summaryYieldMap.get(ingData.name) || { name: ingName, icon: ingData.icon || '', daily: 0 };
    prev.daily += ingDailyCount;
    summaryYieldMap.set(ingData.name, prev);
  }

  let totalDailyIngredients = 0;
  summaryYieldMap.forEach(item => {
    totalDailyIngredients += item.daily;
  });

  // 8. 持有上限計算 (基礎持有 + 副技能 + 睡飽飽獎章)
  const baseCarry = parseInt(pkm.carry || pkm.carryCapacity || '0', 10) || 0;
  let subskillCarryBonus = 0;
  subskills.forEach((s, idx) => {
    const sName = (typeof s === 'string') ? s : (s && s.name ? s.name : '');
    if (!sName) return;
    const isUnlocked = currentLevel >= slotLevels[idx];
    if (isUnlocked) {
      if (sName === '持有上限提升L' || sName.includes('Inventory Up L')) subskillCarryBonus += 18;
      else if (sName === '持有上限提升M' || sName.includes('Inventory Up M')) subskillCarryBonus += 12;
      else if (sName === '持有上限提升S' || sName.includes('Inventory Up S')) subskillCarryBonus += 6;
    }
  });

  let ribbonCarryBonus = 0;
  if (ribbon > 0 && window.AppraisalLab && typeof window.AppraisalLab.getRibbonBonus === 'function') {
    const remEvos = window.AppraisalLab.getRemainingEvolutions(pkm);
    const rBonus = window.AppraisalLab.getRibbonBonus(ribbon, remEvos);
    ribbonCarryBonus = rBonus.carry || 0;
  }

  const effectiveCarry = baseCarry + subskillCarryBonus + ribbonCarryBonus;
  const diffCarry = effectiveCarry - baseCarry;

  // 9. 主技能附加期望 (全主技能全量精算支援)
  const finalSkillRate = baseSkillRate * (1 + subskillSkillBonus / 100) * natureSkillMult;
  const dailyTriggers = dailyHelps * (finalSkillRate / 100);

  const diffIngRate = finalIngRate - baseIngRate;
  const diffSkillRate = finalSkillRate - baseSkillRate;
  const diffSec = effectiveIntervalSec - baseIntervalSec;

  const skillYield = getPokedexMainSkillYield(pkm.main_skill, skillLevel, dailyTriggers, isEN);
  const mainSkillExtraDaily = skillYield.mainSkillExtraDaily;
  const mainSkillLabel = skillYield.mainSkillLabel;
  const mainSkillValueText = skillYield.mainSkillValueText;
  const mainSkillSingleText = skillYield.mainSkillSingleText;
  const mainSkillDesc = skillYield.mainSkillDesc;

  const resultObj = {
    baseCarry,
    subskillCarryBonus,
    ribbonCarryBonus,
    effectiveCarry,
    diffCarry,
    diffIngRate,
    diffSkillRate,
    diffSec,
    baseIngRate,
    subskillIngBonus,
    natureIngMult,
    cleanseMint: isCleanseMint,
    finalIngRate,
    baseIntervalSec,
    effectiveIntervalSec,
    energyIntervalMult: ENERGY_INTERVAL_MULT,
    baseCalcSeconds: BASE_CALC_SECONDS,
    idealIntervalSec,
    dailyHelps,
    dailyIngDrops,
    berryName,
    berryRawName,
    berryIcon,
    berryBaseEnergy,
    singleBerryEnergy,
    isBerrySpec,
    baseBerryCount,
    hasBFS,
    berriesPerHelp,
    dailyBerryHelps,
    dailyBerryCount,
    dailyBerryEnergy,
    dailyBerryEnergyFav,
    unlockedSlotCount,
    activeIngredientDetails,
    summaryYieldList: Array.from(summaryYieldMap.values()),
    totalDailyIngredients,
    mainSkillExtraDaily,
    mainSkillLabel,
    mainSkillValueText,
    mainSkillSingleText,
    mainSkillDesc,
    dailyTriggers,
    baseSkillRate,
    subskillSkillBonus,
    natureSkillMult,
    finalSkillRate,
    levelSpeedDiscount,
    subskillSpeedBonus,
    natureSpeedMult,
    ribbonDiscount
  };
  if (_pokedexStatsCache.size > 500) {
    _pokedexStatsCache.clear();
  }
  _pokedexStatsCache.set(statsCacheKey, resultObj);
  return resultObj;
}

function formatPokedexIntervalDiff(diffSec) {
  if (diffSec === 0) return { text: '(+0s)', cls: 'diff-zero' };
  const absSec = Math.abs(diffSec);
  const m = Math.floor(absSec / 60);
  const s = absSec % 60;
  const timeStr = m > 0 ? `${m}:${s < 10 ? '0' : ''}${s}` : `${s}s`;
  if (diffSec < 0) {
    return { text: `(-${timeStr})`, cls: 'diff-pos' };
  } else {
    return { text: `(+${timeStr})`, cls: 'diff-neg' };
  }
}

function renderPokedexIntervalValue(f, pkm) {
  if (!f) return formatHelpInterval(pkm ? pkm.interval : 0);
  const mainVal = formatHelpInterval(f.effectiveIntervalSec);
  const diff = formatPokedexIntervalDiff(f.diffSec);
  return `${mainVal}<span class="header-stat-diff ${diff.cls}">${diff.text}</span>`;
}

function renderPokedexCarryValue(f, pkm) {
  if (!f) {
    const baseC = pkm ? (pkm.carry || pkm.carryCapacity || '--') : '--';
    return `${baseC}`;
  }
  const diffVal = f.diffCarry;
  let diffCls = 'diff-zero';
  let diffSign = '+';
  if (diffVal > 0) {
    diffCls = 'diff-pos';
    diffSign = '+';
  } else if (diffVal < 0) {
    diffCls = 'diff-neg';
    diffSign = '';
  }
  return `${f.effectiveCarry}<span class="header-stat-diff ${diffCls}">(${diffSign}${diffVal})</span>`;
}

function formatRateWithTens(val) {
  if (typeof val !== 'number' || isNaN(val)) return '--';
  const parts = val.toFixed(2).split('.');
  // When integer part is single-digit (e.g. 2.10%), pad with a figure space (\u2007)
  // instead of '0', leaving a visual empty space of exact digit width for vertical % alignment.
  const intPart = parts[0].length < 2 ? '\u2007' + parts[0] : parts[0];
  return `${intPart}.${parts[1]}%`;
}

function renderPokedexIngRateValue(f, pkm) {
  if (!f || typeof f.finalIngRate !== 'number') {
    if (!pkm || !pkm.ingredient_rate) return '--';
    const num = parseFloat(pkm.ingredient_rate);
    return isNaN(num) ? pkm.ingredient_rate : formatRateWithTens(num);
  }
  const diffVal = f.diffIngRate;
  let diffCls = 'diff-zero';
  let diffSign = '+';
  if (diffVal > 0.001) {
    diffCls = 'diff-pos';
    diffSign = '+';
  } else if (diffVal < -0.001) {
    diffCls = 'diff-neg';
    diffSign = '';
  }
  return `${formatRateWithTens(f.finalIngRate)}<span class="header-stat-diff ${diffCls}">(${diffSign}${diffVal.toFixed(2)}%)</span>`;
}

function renderPokedexSkillRateValue(f, pkm) {
  if (!f || typeof f.finalSkillRate !== 'number') {
    if (!pkm || !pkm.skill_rate) return '--';
    const num = parseFloat(pkm.skill_rate);
    return isNaN(num) ? pkm.skill_rate : formatRateWithTens(num);
  }
  const diffVal = f.diffSkillRate;
  let diffCls = 'diff-zero';
  let diffSign = '+';
  if (diffVal > 0.001) {
    diffCls = 'diff-pos';
    diffSign = '+';
  } else if (diffVal < -0.001) {
    diffCls = 'diff-neg';
    diffSign = '';
  }
  return `${formatRateWithTens(f.finalSkillRate)}<span class="header-stat-diff ${diffCls}">(${diffSign}${diffVal.toFixed(2)}%)</span>`;
}

const STAGE3_INHERITED_MIN_LEVELS = {
  '土王': 15, 'Clodsire': 15,
  '大食花': 16, 'Victreebel': 16,
  '隆隆岩': 19, 'Golem': 19,
  '自爆磁怪': 23, 'Magnezone': 23,
  '耿鬼': 19, 'Gengar': 19,
  '艾路雷朵': 15, 'Gallade': 15,
  '鍬農炮蟲': 15, 'Vikavolt': 15,
  '巴布土撥': 14, 'Pawmot': 14
};

function getPokedexMinEvolutionLevel(pkm) {
  if (!pkm) return 1;
  const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || (pkm.name && pkm.name.en) || '';
  if (STAGE3_INHERITED_MIN_LEVELS[name]) {
    return STAGE3_INHERITED_MIN_LEVELS[name];
  }
  if (!pkm.evo_req) return 1;
  const match = pkm.evo_req.match(/Lv\.?\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10) || 1;
  }
  return 1;
}

// Canonical evolution items definitions for Pokedex modal linkage
const POKEDEX_EVO_ITEM_DEFINITIONS = [
  { id: 'thunder_stone', name_tw: '雷之石', name_cn: '雷之石', name_en: 'Thunder Stone', icon: 'https://www.serebii.net/pokemonsleep/items/thunderstone.png' },
  { id: 'fire_stone',    name_tw: '火之石', name_cn: '火之石', name_en: 'Fire Stone',    icon: 'https://www.serebii.net/pokemonsleep/items/firestone.png' },
  { id: 'water_stone',   name_tw: '水之石', name_cn: '水之石', name_en: 'Water Stone',   icon: 'https://www.serebii.net/pokemonsleep/items/waterstone.png' },
  { id: 'leaf_stone',    name_tw: '葉之石', name_cn: '叶之石', name_en: 'Leaf Stone',    icon: 'https://www.serebii.net/pokemonsleep/items/leafstone.png' },
  { id: 'moon_stone',    name_tw: '月之石', name_cn: '月之石', name_en: 'Moon Stone',    icon: 'https://www.serebii.net/pokemonsleep/items/moonstone.png' },
  { id: 'sun_stone',     name_tw: '太陽之石', name_cn: '太阳之石', name_en: 'Sun Stone', icon: 'https://www.serebii.net/itemdex/sprites/sunstone.png' },
  { id: 'ice_stone',     name_tw: '冰之石', name_cn: '冰之石', name_en: 'Ice Stone',     icon: 'https://www.serebii.net/pokemonsleep/items/icestone.png' },
  { id: 'shiny_stone',   name_tw: '光之石', name_cn: '光之石', name_en: 'Shiny Stone',   icon: 'https://www.serebii.net/pokemonsleep/items/shinystone.png' },
  { id: 'dusk_stone',    name_tw: '暗之石', name_cn: '暗之石', name_en: 'Dusk Stone',    icon: 'https://www.serebii.net/pokemonsleep/items/duskstone.png' },
  { id: 'dawn_stone',    name_tw: '覺醒之石', name_cn: '觉醒之石', name_en: 'Dawn Stone', icon: 'https://www.serebii.net/pokemonsleep/items/dawnstone.png' },
  { id: 'oval_stone',    name_tw: '渾圓之石', name_cn: '浑圆之石', name_en: 'Oval Stone', icon: 'https://www.serebii.net/pokemonsleep/items/ovalstone.png' },
  { id: 'linking_cord',  name_tw: '聯繫繩', name_cn: '联系绳', name_en: 'Linking Cord',  icon: 'https://www.serebii.net/pokemonsleep/items/linkingcord.png' },
  { id: 'metal_coat',    name_tw: '金屬膜', name_cn: '金属膜', name_en: 'Metal Coat',    icon: 'https://www.serebii.net/pokemonsleep/items/metalcoat.png' },
  { id: 'kings_rock',    name_tw: '王者之證', name_cn: '王者之证', name_en: "King's Rock", icon: "https://www.serebii.net/pokemonsleep/items/king'srock.png" },
  { id: 'up_grade',      name_tw: '升級資料', name_cn: '升级数据', name_en: 'Upgrade',   icon: 'https://www.serebii.net/itemdex/sprites/upgrade.png' },
  { id: 'razor_claw',    name_tw: '銳利之爪', name_cn: '锐利之爪', name_en: 'Razor Claw', icon: 'https://www.serebii.net/pokemonsleep/items/razorclaw.png' },
  { id: 'dragon_scale',  name_tw: '龍之鱗片', name_cn: '龙之鳞片', name_en: 'Dragon Scale', icon: 'https://www.serebii.net/itemdex/sprites/dragonscale.png' }
];

function getPokemonEvolutionItems(pkm) {
  if (!pkm || !pkm.evo_req || typeof pkm.evo_req !== 'string') return [];
  const req = pkm.evo_req;
  const matched = [];

  for (let i = 0; i < POKEDEX_EVO_ITEM_DEFINITIONS.length; i++) {
    const def = POKEDEX_EVO_ITEM_DEFINITIONS[i];
    if (
      req.includes(def.name_tw) ||
      req.includes(def.name_cn) ||
      req.toLowerCase().includes(def.name_en.toLowerCase())
    ) {
      let displayName = def.name_tw;
      if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getItemName === 'function') {
        displayName = window.I18N.getItemName(def.id) || def.name_tw;
      }
      let iconUrl = def.icon;
      if (typeof window !== 'undefined' && Array.isArray(window.ITEMS_DATA)) {
        const itemRecord = window.ITEMS_DATA.find(x => x.id === def.id);
        if (itemRecord && itemRecord.icon_url) {
          iconUrl = itemRecord.icon_url;
        }
      }
      matched.push({
        id: def.id,
        name: displayName,
        icon_url: iconUrl
      });
    }
  }
  return matched;
}

function renderPokedexEvoItemChipsHTML(pkm) {
  const items = getPokemonEvolutionItems(pkm);
  if (!items || items.length === 0) return '';
  const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage && window.I18N.getLanguage() === 'en-US';

  return items.map(item => {
    const tip = isEN
      ? `Evolution Item: ${item.name} (Click for encyclopedia details)`
      : `進化道具：${item.name}（點擊查看百科詳情）`;
    return `<button type="button" class="pokedex-evo-item-btn" data-evo-item-id="${item.id}" onclick="window.WikiDB && typeof window.WikiDB.openItemDetailModal === 'function' ? window.WikiDB.openItemDetailModal('${item.id}') : (window.openItemDetailModal && window.openItemDetailModal('${item.id}'))" title="${escapeHtml(tip)}" aria-label="${escapeHtml(tip)}">${item.icon_url ? `<img src="${item.icon_url}" class="pokedex-evo-item-icon" alt="${escapeHtml(item.name)}" loading="lazy">` : ''}<span class="pokedex-evo-item-name font-bold">${escapeHtml(item.name)}</span></button>`;
  }).join('');
}

function renderPokedexEvoGuardBadgeHTML(pkm, level) {
  const minLv = getPokedexMinEvolutionLevel(pkm);
  if (minLv <= 1) return '';
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
  const currentLevel = parseInt(level, 10) || 1;
  const isBelow = currentLevel < minLv;
  if (isBelow) {
    const tipTpl = t('pokedex.evo_guard_tip_below', '此形態最低進化等級為 Lv.{0}，點擊可快速調整至門檻等級');
    const tip = tipTpl.replace('{0}', minLv);
    const label = t('pokedex.evo_guard_below', '進化門檻 Lv.');
    return `<button type="button" class="pokedex-evo-guard-badge evo-warning" onclick="window.PokemonApp.setPokedexModalLevel(${minLv})" title="${tip}">[!] ${label}${minLv}</button>`;
  } else {
    const tipTpl = t('pokedex.evo_guard_tip_met', '已達此形態最低進化門檻 (Lv.{0}+)');
    const tip = tipTpl.replace('{0}', minLv);
    const label = t('pokedex.evo_guard_met', '已達門檻 Lv.');
    return `<span class="pokedex-evo-guard-badge evo-passed" title="${tip}">[✓] ${label}${minLv}+</span>`;
  }
}

function renderPokedexRibbonOptionsHTML(pkm, currentRibbon) {
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  let remainingEvos = 0;
  if (pkm) {
    if (typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRemainingEvolutions === 'function') {
      remainingEvos = window.AppraisalLab.getRemainingEvolutions(pkm);
    } else {
      const isFinal = pkm.is_final === '〇' || pkm.is_final === 'O' || pkm.is_final === 'o' || pkm.is_final === true || pkm.is_final === '1';
      remainingEvos = isFinal ? 0 : 1;
    }
  }

  const currentVal = parseInt(currentRibbon, 10) || 0;
  let opt2Text = '';
  let opt3Text = isEN ? '+6 Carry Limit' : '+6 持有上限';
  let opt4Text = '';

  if (!pkm) {
    opt2Text = isEN ? '+3 Carry Limit · Speed Boost' : '+3 持有上限 · 幫速加成';
    opt4Text = isEN ? '+8 Carry Limit · Max Speed Boost' : '+8 持有上限 · 幫速最大加成';
  } else if (remainingEvos === 2) {
    opt2Text = isEN ? '+3 Carry Limit · Speed -11%' : '+3 持有上限 · 幫速加成 -11%';
    opt4Text = isEN ? '+8 Carry Limit · Speed -25%' : '+8 持有上限 · 幫速最大加成 -25%';
  } else if (remainingEvos === 1) {
    opt2Text = isEN ? '+3 Carry Limit · Speed -5%' : '+3 持有上限 · 幫速加成 -5%';
    opt4Text = isEN ? '+8 Carry Limit · Speed -12%' : '+8 持有上限 · 幫速最大加成 -12%';
  } else {
    opt2Text = isEN ? '+3 Carry Limit' : '+3 持有上限';
    opt4Text = isEN ? '+8 Carry Limit' : '+8 持有上限';
  }

  const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : (typeof window !== 'undefined' && window.location && window.location.pathname.includes('/app/') ? '../' : '');
  const optionsData = [
    { val: 0, text: isEN ? 'None' : '未佩戴', icon: '' },
    { val: 1, text: isEN ? '+1 Carry Limit' : '+1 持有上限', icon: `${base}assets/ribbons/ribbon_lv1.png` },
    { val: 2, text: opt2Text, icon: `${base}assets/ribbons/ribbon_lv2.png` },
    { val: 3, text: opt3Text, icon: `${base}assets/ribbons/ribbon_lv3.png` },
    { val: 4, text: opt4Text, icon: `${base}assets/ribbons/ribbon_lv4.png` }
  ];

  return optionsData.map(o => `
    <option value="${o.val}" ${o.icon ? `data-icon="${o.icon}"` : ''} ${o.val === currentVal ? 'selected' : ''}>${escapeHtml(o.text)}</option>
  `).join('');
}

function renderPokedexStrategyCardHTML(pkm) {
  if (!pkm) return '';
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

  const specialty = pkm.specialty || '';
  let roleTitle = '';
  let roleDesc = '';
  let coreSkill = '';
  let coreSkillDesc = '';
  let coreTier = 'gold';
  let recommendedSubs = [];
  let recommendedNatures = '';

  if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
    roleTitle = isEN ? 'Berry Specialist' : '樹果高速量產定位';
    roleDesc = isEN
      ? 'Primary scoring relies on high-speed berry output into Snorlax.'
      : '主要戰力仰賴高頻樹果產出累積能量，樹果數量與速度為絕對核心。';
    coreSkill = isEN ? 'Berry Finding S' : '樹果數量S';
    coreTier = 'gold';
    recommendedSubs = isEN
      ? ['Berry Finding S', 'Helping Bonus', 'Helping Speed M', 'Helping Speed S', 'Inventory Up L']
      : ['樹果數量S', '幫手獎勵', '幫忙速度M', '幫忙速度S', '持有上限提升L'];
    recommendedNatures = isEN ? 'Speed UP (Adamant / Brave / Naughty / Lonely)' : '幫忙速度提升 (固執 / 勇敢 / 頑皮 / 怕寂寞，固執降食材首選)';
  } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
    roleTitle = isEN ? 'Ingredient Supplier' : '料理食材專精供貨';
    roleDesc = isEN
      ? 'Supplies vital recipe ingredients consistently to sustain high-pot dishes.'
      : '專注於高階料理食譜所需食材之穩定產出，食材機率與背包上限至關重要。';
    coreSkill = isEN ? 'Ingredient Finder M' : '食材機率提升M';
    coreTier = 'blue';
    recommendedSubs = isEN
      ? ['Helping Bonus', 'Ingredient Finder M', 'Ingredient Finder S', 'Helping Speed M', 'Helping Speed S', 'Inventory Up L']
      : ['幫手獎勵', '食材機率提升M', '食材機率提升S', '幫忙速度M', '幫忙速度S', '持有上限提升L'];
    recommendedNatures = isEN ? 'Ingredient UP (Quiet / Modest / Mild / Rash)' : '食材發現率提升 (冷靜 / 內斂 / 慢吞吞 / 溫和)';
  } else {
    const isBerryBurst = isBerryBurstSkillSpecialist(pkm);
    const isHealer = isHealerSkillSpecialist(pkm);
    const isHelper = isHelperBoostSkillSpecialist(pkm);
    const isCharge = isChargeStrengthSkillSpecialist(pkm);

    if (isBerryBurst) {
      roleTitle = isEN ? 'Berry Burst Hybrid Cannon' : '樹果遽增爆發定位';
      roleDesc = isEN
        ? 'Main skill directly bursts berries for Snorlax. Synergizes exceptionally well with Berry Finding S for massive dual-yield berry output.'
        : '專長雖為技能型，但主技能能直接引爆海量樹果（含隊友樹果與大成功翻倍）。樹果數量S與技能機率雙修能達成天花板級產能，樹果週活動享有 1.4 倍加成。';
      coreSkill = isEN ? ['Berry Finding S', 'Skill Trigger M'] : ['樹果數量S', '技能機率提升M'];
      coreTier = 'gold';
      recommendedSubs = isEN
        ? ['Berry Finding S', 'Skill Trigger M', 'Helping Bonus', 'Helping Speed M', 'Inventory Up L', 'Skill Trigger S']
        : ['樹果數量S', '技能機率提升M', '幫手獎勵', '幫忙速度M', '持有上限提升L', '技能機率提升S'];
      recommendedNatures = isEN ? 'Skill UP or Speed UP (Careful / Adamant / Brave / Sassy)' : '主技能或幫速提升 (慎重 / 固執 / 勇敢 / 自大)';
    } else if (isHealer) {
      roleTitle = isEN ? 'All-Day Team Healer Core' : '全隊活力療癒核心定位';
      roleDesc = isEN
        ? 'Maintains team energy >80% for maximum 2.2x speed. Focuses purely on skill procs; avoids Berry Finding S which causes early bag overflow and blocks healing procs.'
        : '維持全員高活力以常駐最高幫忙速。專精雙技能機率提升，避免「樹果數量S」加速滿包導致無法觸發療癒技能。';
      coreSkill = isEN ? 'Skill Trigger M' : '技能機率提升M';
      coreTier = 'blue';
      recommendedSubs = isEN
        ? ['Skill Trigger M', 'Helping Bonus', 'Skill Trigger S', 'Helping Speed M', 'Helping Speed S', 'Inventory Up L']
        : ['技能機率提升M', '幫手獎勵', '技能機率提升S', '幫忙速度M', '幫忙速度S', '持有上限提升L'];
      recommendedNatures = isEN ? 'Main Skill UP (Careful / Sassy / Calm / Gentle)' : '主技能機率提升 (慎重 / 自大 / 溫和 / 浮躁，慎重降食材最優)';
    } else if (isHelper) {
      roleTitle = isEN ? 'Legendary Helper Boost Core' : '傳說幫手加速核心定位';
      roleDesc = isEN
        ? 'Triggers multi-help procs across the entire team. Base skill rate is extremely low (~2%); strictly prioritizes skill triggers & inventory capacity, strictly avoiding BFS bag overflow.'
        : '引爆全隊多次幫忙以收穫巨額能量。基礎技能率極低（約2%），首重雙技能機率與持有上限防溢滿，嚴格避免「樹果數量S」加速滿包阻斷技能發動。';
      coreSkill = isEN ? 'Skill Trigger M' : '技能機率提升M';
      coreTier = 'blue';
      recommendedSubs = isEN
        ? ['Skill Trigger M', 'Helping Bonus', 'Skill Trigger S', 'Inventory Up L', 'Helping Speed M', 'Inventory Up M']
        : ['技能機率提升M', '幫手獎勵', '技能機率提升S', '持有上限提升L', '幫忙速度M', '持有上限提升M'];
      recommendedNatures = isEN ? 'Main Skill UP (Careful / Sassy / Calm / Gentle)' : '主技能機率提升 (慎重 / 自大 / 溫和 / 浮躁，慎重降食材最優)';
    } else if (isCharge) {
      roleTitle = isEN ? 'High-Frequency Direct Charge Power' : '高頻單體充能直傷定位';
      roleDesc = isEN
        ? 'Delivers massive direct Snorlax Strength via Charge Strength M. Maximizing skill triggers is the undisputed standard; active players can also opt for BFS hybrid variant.'
        : '依賴「能量填充M」單次提供極高直傷能量。標準神配首選雙技機極致發動；勤勞收包玩家亦可選擇樹果S雙修分支。';
      coreSkill = isEN ? 'Skill Trigger M' : '技能機率提升M';
      coreTier = 'blue';
      recommendedSubs = isEN
        ? ['Skill Trigger M', 'Helping Bonus', 'Skill Trigger S', 'Helping Speed M', 'Inventory Up L', 'Berry Finding S']
        : ['技能機率提升M', '幫手獎勵', '技能機率提升S', '幫忙速度M', '持有上限提升L', '樹果數量S'];
      recommendedNatures = isEN ? 'Main Skill UP (Careful / Sassy / Calm / Gentle)' : '主技能機率提升 (慎重 / 自大 / 溫和 / 浮躁，慎重降食材最優)';
    } else {
      roleTitle = isEN ? 'Pure Tactical Skill Specialist' : '高頻純戰術技能輔助定位';
      roleDesc = isEN
        ? 'Relies on maximum skill activation frequency; strictly avoids Berry Finding S to prevent early bag overflow from blocking procs.'
        : '極度依賴高頻主技能發動，需避免背包過快塞滿（嚴格忌諱樹果S），優先追求技能機率與持有上限。';
      coreSkill = isEN ? 'Skill Trigger M' : '技能機率提升M';
      coreTier = 'blue';
      recommendedSubs = isEN
        ? ['Helping Bonus', 'Skill Trigger M', 'Skill Trigger S', 'Helping Speed M', 'Helping Speed S', 'Inventory Up L']
        : ['幫手獎勵', '技能機率提升M', '技能機率提升S', '幫忙速度M', '幫忙速度S', '持有上限提升L'];
      recommendedNatures = isEN ? 'Main Skill UP (Sassy / Calm / Careful / Gentle)' : '主技能機率提升 (自大 / 慎重 / 溫和 / 浮躁)';
    }
  }

  const getSubskillTier = (name) => {
    const sk = POKEDEX_MODAL_SUBSKILLS.find(item => item.name === name || item.name_en === name);
    return sk ? sk.tier : 'white';
  };

  const coreChipsHtml = Array.isArray(coreSkill)
    ? coreSkill.map(sk => `<span class="strategy-chip subskill-${getSubskillTier(sk)} strategy-core-chip">${escapeHtml(sk)}</span>`).join(' ')
    : `<span class="strategy-chip subskill-${coreTier} strategy-core-chip">${escapeHtml(coreSkill)}</span>`;

  return `
    <div class="pokedex-strategy-card">
      <div class="strategy-card-title pokedex-formula-badge font-bold">${roleTitle}</div>
      <div class="strategy-details-grid">
        <div class="strategy-item strategy-item-core">
          <span class="strategy-k strategy-core-k">${isEN ? 'Core Skill' : '核心神技'}：</span>
          ${coreChipsHtml}
        </div>
        <div class="strategy-item">
          <span class="strategy-k">${isEN ? 'Recommended' : '推薦副技'}：</span>
          <div class="strategy-chips-wrap">
            ${recommendedSubs.map(s => `<span class="strategy-chip subskill-${getSubskillTier(s)}">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
        <div class="strategy-item">
          <span class="strategy-k">${isEN ? 'Best Nature' : '契合性格'}：</span>
          <span class="strategy-v text-accent">${recommendedNatures}</span>
        </div>
      </div>
    </div>
  `;
}
