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
  if (skill.includes('活力全體療癒') || skill.includes('Energy for Everyone') || skill.includes('新月祈禱') || skill.includes('樹果汁') || skill.includes('治癒波動') || skill.includes('蹭蹭臉頰') || skill.includes('活力療癒') || skill.includes('活力氣場') || skill.includes('Energizing Cheer')) return true;
  const healerNames = ['沙奈朵', '仙子伊布', '胖可丁', '巴布土撥', '拉魯拉絲', '奇鲁莉安', '寶寶丁', '胖丁', '布撥', '布土撥', '克雷色利亞', '壺壺', '拉帝亞斯', '托戈德瑪爾', '帕奇利茲',
                       'Gardevoir', 'Sylveon', 'Wigglytuff', 'Pawmot', 'Ralts', 'Kirlia', 'Igglybuff', 'Jigglypuff', 'Pawmi', 'Pawmo', 'Cresselia', 'Shuckle', 'Latias', 'Togedemaru', 'Pachirisu'];
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
  if (skill.includes('料理強化') || skill.includes('Cooking Power') || skill.includes('負電') || skill.includes('魔法火焰') || skill.includes('Mystical Fire')) return true;
  const potNames = ['小磁怪', '三合一磁怪', '自爆磁怪', '火伊布', '冰伊布', '負電拍拍', '顫弦蠑螈', '夢妖魔',
                    'Magnemite', 'Magneton', 'Magnezone', 'Flareon', 'Glaceon', 'Minun', 'Toxtricity', 'Mismagius'];
  return potNames.some(p => name.includes(p));
}

function isExtraTastySkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('料理成功') || skill.includes('美味大成功') || skill.includes('Extra Tasty') || skill.includes('Tasty Chance') || skill.includes('魔法火焰') || skill.includes('Mystical Fire') || skill.includes('健美') || skill.includes('Bulk Up')) return true;
  const tastyNames = ['咚咚鼠', '海豹球（佳節）', '古月鳥', '夢妖魔', '赫拉克羅斯', 'Dedenne', 'Spheal (Holiday)', 'Cramorant', 'Mismagius', 'Heracross'];
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
    const label = pokedexSubskillPaletteExpanded ? _tDex('副技能收合', 'Collapse Subskills') : _tDex('副技能展開', 'Expand Subskills');
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
          badgeHtml = `<span class="slot-val-badge slot-val-empty">${_tDex('-- 未配置 --', '-- Empty --')}</span>`;
        } else {
          badgeHtml = `<span class="slot-val-badge slot-val-empty">${_tDex('-- 未解鎖 --', '-- Locked --')}</span>`;
        }
      } else {
        const skObj = POKEDEX_MODAL_SUBSKILLS.find(s => s.name === skName);
        const tier = skObj ? skObj.tier : 'white';
        const skLabel = isEN
          ? (skObj ? skObj.name_en : skName)
          : _tDex((window.I18N && typeof window.I18N.getSubSkillName === 'function') ? window.I18N.getSubSkillName(skName) : skName, skObj ? skObj.name_en : skName);
        const inactiveCls = !isEffectActive ? 'pill-inactive' : '';
        badgeHtml = `<span class="slot-val-badge box-subskill-pill subskill-${tier} ${inactiveCls}">${escapeHtml(skLabel)}</span>`;
      }

      let statusTagHtml = '';
      if (!isLevelReached) {
        if (skName) {
          statusTagHtml = `<span class="slot-unreleased-tag slot-tag-inactive">${_tDex('效果尚未生效', 'Inactive')}</span>`;
        } else {
          statusTagHtml = `<span class="slot-unreleased-tag slot-tag-under-lvl">${_tDex('等級不足', 'Level Low')}</span>`;
        }
      }

      const buttonClasses = ['box-subskill-slot-btn'];
      if (isActive) buttonClasses.push('active');
      if (!isLevelReached) buttonClasses.push('slot-under-lvl');
      if (skName && !isEffectActive) buttonClasses.push('slot-effect-inactive');

      let tooltipText = `Lv.${lvl}`;
      if (!isLevelReached) {
        tooltipText = `Lv.${lvl} (${_tDex(`等級不足：需達 Lv.${lvl} 方可生效`, `Requires Lv.${lvl}`)})`;
      } else if (isUnreleasedSlot) {
        tooltipText = `Lv.${lvl} (${_tDex('模擬等級', 'Simulation Level')})`;
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
      const skDisplayName = isEN
        ? sk.name_en
        : _tDex((window.I18N && typeof window.I18N.getSubSkillName === 'function') ? window.I18N.getSubSkillName(sk.name) : sk.name, sk.name_en);
      const isUsed = usedSkills.has(sk.name);
      return `
        <button type="button" class="box-subskill-chip subskill-${tier} ${isUsed ? 'in-use' : ''}" data-name="${escapeHtml(sk.name)}" onclick="window.PokemonApp.choosePokedexSubskill('${escapeHtml(sk.name)}')" title="${escapeHtml(skDisplayName)}${isUsed ? _tDex('（已選用）', ' (Selected)') : ''}">
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
    const label = pokedexSubskillPaletteExpanded ? _tDex('副技能收合', 'Collapse Subskills') : _tDex('副技能展開', 'Expand Subskills');
    if (textSpan) textSpan.textContent = label;
    else toggleBtn.textContent = label;
    if (pokedexSubskillPaletteExpanded) {
      toggleBtn.classList.add('is-expanded');
    } else {
      toggleBtn.classList.remove('is-expanded');
    }
  }
}

function formatPokemonEvoReq(evoReq, isEN, isCN) {
  if (!evoReq || typeof evoReq !== 'string') return '';
  let text = evoReq.trim();
  if (isEN) {
    const itemMap = [
      ['雷之石', 'Thunder Stone'], ['火之石', 'Fire Stone'], ['水之石', 'Water Stone'],
      ['葉之石', 'Leaf Stone'], ['月之石', 'Moon Stone'], ['太陽之石', 'Sun Stone'], ['日之石', 'Sun Stone'],
      ['冰之石', 'Ice Stone'], ['光之石', 'Shiny Stone'], ['暗之石', 'Dusk Stone'],
      ['覺醒之石', 'Dawn Stone'], ['渾圓之石', 'Oval Stone'], ['聯繫繩', 'Linking Cord'],
      ['金屬膜', 'Metal Coat'], ['王者之證', "King's Rock"], ['銳利之爪', 'Razor Claw']
    ];
    itemMap.forEach(([zh, en]) => { text = text.split(zh).join(en); });
    text = text.replace(/睡\s*(\d+)\s*小時/g, 'Sleep $1h')
               .replace(/(\d+)\s*糖/g, '$1 Candies')
               .replace(/，EXP\s*需求\s*([\d.]+)\s*倍/g, '')
               .replace(/雄性/g, 'Male')
               .replace(/指定性格/g, 'Nature')
               .replace(/Lv(\d+)/g, 'Lv.$1');
    return text;
  }
  text = text.replace(/，EXP\s*需求\s*([\d.]+)\s*倍/g, '').replace(/Lv(\d+)/g, 'Lv.$1');
  if (isCN && typeof window !== 'undefined' && window.I18N && typeof window.I18N.toSimplified === 'function') {
    return window.I18N.toSimplified(text);
  }
  return text;
}

function getPokemonEvolutionFamily(pkmOrId, allList) {
  const all = Array.isArray(allList) && allList.length > 0
    ? allList
    : ((typeof PokemonApp !== 'undefined' && Array.isArray(PokemonApp.allPokemons) && PokemonApp.allPokemons.length > 0)
      ? PokemonApp.allPokemons
      : ((typeof window !== 'undefined' && Array.isArray(window.allPokemons)) ? window.allPokemons : []));
  if (!pkmOrId) return [];
  const pkm = (typeof pkmOrId === 'object' && pkmOrId.id)
    ? pkmOrId
    : (all.find(p => p.name_cn === pkmOrId || p.name_en === pkmOrId) ||
       all.find(p => String(p.id) === String(pkmOrId) || p.formatted_no === pkmOrId));
  if (!pkm) return [];
  if (!all || all.length === 0) return [[pkm]];

  const byCn = (cn) => all.find(x => x && x.name_cn === cn);
  const byId = (id) => all.find(x => x && String(x.id) === String(id));
  const idStr = String(pkm.id || '');
  const cn = pkm.name_cn || '';

  if (['9001', '9002', '9004', '9005', '9006', '9007'].includes(idStr)) return [[pkm]];
  if (['37', '38'].includes(idStr)) return [[byId('37')], [byId('38')]].filter(s => s[0]);
  if (['7006', '7007'].includes(idStr)) return [[byId('7006')], [byId('7007')]].filter(s => s[0]);
  if (['58', '59'].includes(idStr)) return [[byId('58')], [byId('59')]].filter(s => s[0]);
  if (['7013', '7014'].includes(idStr)) return [[byId('7013')], [byId('7014')]].filter(s => s[0]);
  if (['194', '195'].includes(idStr)) return [[byId('194')], [byId('195')]].filter(s => s[0]);
  if (['7054', '980'].includes(idStr)) {
    const s1 = byId('7054');
    const s2Raw = byId('980');
    const s2 = s2Raw ? Object.assign({}, s2Raw, { evo_req: s2Raw.evo_req || 'Lv.15 + 40 糖' }) : null;
    return [s1 ? [s1] : [], s2 ? [s2] : []].filter(s => s.length > 0);
  }
  if (['133', '134', '135', '136', '196', '197', '470', '471', '700'].includes(idStr)) {
    const s1 = byId('133');
    const s2 = ['134', '135', '136', '196', '197', '470', '471', '700'].map(byId).filter(Boolean);
    return [s1 ? [s1] : [], s2].filter(s => s.length > 0);
  }
  if (['79', '80', '199'].includes(idStr)) {
    const s1 = byId('79');
    const s2 = ['80', '199'].map(byId).filter(Boolean);
    return [s1 ? [s1] : [], s2].filter(s => s.length > 0);
  }
  if (['280', '281', '282', '475'].includes(idStr)) {
    const s1 = byId('280');
    const s2 = byId('281');
    const s3 = ['282', '475'].map(byId).filter(Boolean);
    return [s1 ? [s1] : [], s2 ? [s2] : [], s3].filter(s => s.length > 0);
  }
  if (['848', '849', '8001'].includes(idStr)) {
    const s1 = byId('848');
    const s2 = ['849', '8001'].map(byId).filter(Boolean);
    return [s1 ? [s1] : [], s2].filter(s => s.length > 0);
  }
  if (cn.startsWith('南瓜精') || cn.startsWith('南瓜怪人')) {
    const m = cn.match(/\((.+?)\)/);
    const suffix = m ? ' (' + m[1] + ')' : '';
    const s1 = byCn('南瓜精' + suffix);
    const s2 = byCn('南瓜怪人' + suffix);
    return (s1 && s2) ? [[s1], [s2]] : [[pkm]];
  }

  const clean = all.filter(x => x && !['9001', '9002', '9004', '9005', '9006', '9007'].includes(String(x.id)));
  const idx = clean.findIndex(x => x.name_cn === pkm.name_cn && String(x.id) === idStr);
  if (idx === -1) return [[pkm]];
  if (!pkm.evo_req && pkm.is_final === '〇') return [[pkm]];

  let start = idx;
  while (start > 0 && clean[start].evo_req) start--;
  const stages = [[clean[start]]];
  let cur = start + 1;
  while (cur < clean.length && clean[cur].evo_req) {
    stages.push([clean[cur]]);
    if (clean[cur].is_final === '〇') break;
    cur++;
  }
  return stages;
}

function renderPokedexEvolutionTreeHTML(pkm) {
  if (!pkm) return '';
  const lang = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function')
    ? window.I18N.getLanguage()
    : 'zh-TW';
  const isEN = lang === 'en-US';
  const isCN = lang === 'zh-CN';
  const t = (k, def) => (typeof window !== 'undefined' && window.I18N && typeof window.I18N.t === 'function') ? window.I18N.t(k, def) : def;
  const stages = getPokemonEvolutionFamily(pkm);
  if (!stages || stages.length === 0) return '';

  const totalMembers = stages.reduce((acc, s) => acc + s.length, 0);
  const hasBranch = stages.some(s => s.length > 1);
  let stageBadgeText = '';
  if (stages.length === 1 && totalMembers === 1) {
    stageBadgeText = t('pokedex.evo_single_stage', isEN ? 'Single Stage (No Evolution)' : (isCN ? '无进化形态（单一阶段）' : '無進化形態（單一階段）'));
  } else if (hasBranch) {
    stageBadgeText = t('pokedex.evo_branch_stage', isEN ? `${stages.length}-Stage Branching Evolution` : (isCN ? `${stages.length} 阶分支进化链` : `${stages.length} 階分支進化鏈`));
  } else {
    stageBadgeText = isEN ? `${stages.length}-Stage Evolution Chain` : (isCN ? `${stages.length} 阶进化链` : `${stages.length} 階進化鏈`);
  }

  const stagesHtml = stages.map((stageNodes, sIdx) => {
    const nodesHtml = stageNodes.map(node => {
      const isCurrent = (node.name_cn && pkm.name_cn)
        ? (node.name_cn === pkm.name_cn && String(node.id) === String(pkm.id))
        : (String(node.id) === String(pkm.id));
      const nodeName = isEN
        ? (node.name_en || node.name_cn)
        : (isCN && window.I18N && typeof window.I18N.toSimplified === 'function' ? window.I18N.toSimplified(node.name_cn || node.name_en) : (node.name_cn || node.name_en));
      const rawIcon = (typeof getIconUrl === 'function') ? getIconUrl(node) : (node.icon_url || node.icon || '');
      const iconSrc = (typeof window !== 'undefined' && typeof window.mapExternalToLocalAsset === 'function')
        ? (window.mapExternalToLocalAsset(rawIcon) || rawIcon)
        : rawIcon;
      const reqStr = sIdx > 0 ? formatPokemonEvoReq(node.evo_req, isEN, isCN) : '';
      const targetKey = (String(node.id) === '710' || String(node.id) === '711') ? (node.name_cn || node.id) : (node.id || node.name_cn);
      const safeKey = String(targetKey).replace(/'/g, "\\'");
      const clickAttr = isCurrent ? '' : `onclick="window.PokemonApp.openPokemonDetailModal('${safeKey}')"`;
      const tipText = isCurrent
        ? (isEN ? `Current: ${nodeName}` : (isCN ? `当前检视：${nodeName}` : `當前檢視：${nodeName}`))
        : (isEN ? `Click to switch to ${nodeName}` : (isCN ? `点击切换至 ${nodeName}` : `點擊切換至 ${nodeName}`));

      return `
        <button type="button" class="pokedex-evo-node-btn ${isCurrent ? 'is-current' : ''}" data-evo-pkm-id="${escapeHtml(String(node.id || ''))}" data-evo-pkm-name="${escapeHtml(node.name_cn || '')}" ${clickAttr} title="${escapeHtml(tipText)}">
          ${reqStr ? `<span class="pokedex-evo-req-pill">${escapeHtml(reqStr)}</span>` : ''}
          <div class="pokedex-evo-node-main">
            ${iconSrc ? `<img src="${iconSrc}" class="pokedex-evo-node-icon" alt="${escapeHtml(nodeName)}" loading="lazy" onerror="handlePokemonIconError(this)">` : ''}
            <div class="pokedex-evo-node-meta">
              <span class="pokedex-evo-node-no">#${escapeHtml(String(node.formatted_no || node.id || ''))}</span>
              <span class="pokedex-evo-node-name font-bold">${escapeHtml(nodeName)}</span>
            </div>
          </div>
        </button>
      `;
    }).join('');

    const arrowHtml = sIdx > 0
      ? `<div class="pokedex-evo-stage-arrow" aria-hidden="true">-&gt;</div>`
      : '';

    return `
      ${arrowHtml}
      <div class="pokedex-evo-stage-col ${stageNodes.length > 1 ? 'is-branch-col' : ''}" data-stage-idx="${sIdx + 1}">
        ${nodesHtml}
      </div>
    `;
  }).join('');

  return `
    <div class="pokedex-evo-tree-section" id="pokedex-evo-tree-section">
      <div class="pokedex-evo-tree-header">
        <span class="box-form-label" style="margin-bottom:0;">${t('pokedex.evo_family_title', isEN ? 'Evolution Family & Conditions' : (isCN ? '进化家族与条件' : '進化家族與條件'))}</span>
        <span class="pokedex-evo-stage-badge">${escapeHtml(stageBadgeText)}</span>
      </div>
      <div class="pokedex-evo-tree-track ${hasBranch ? 'has-branch' : ''}">
        ${stagesHtml}
      </div>
    </div>
  `;
}

if (typeof window !== 'undefined') {
  window.getPokemonEvolutionFamily = getPokemonEvolutionFamily;
  window.formatPokemonEvoReq = formatPokemonEvoReq;
  window.renderPokedexEvolutionTreeHTML = renderPokedexEvolutionTreeHTML;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getMainSkillMaxLevel,
    getPokedexMainSkillMaxLvl,
    getPokemonEvolutionFamily,
    formatPokemonEvoReq,
    renderPokedexEvolutionTreeHTML
  };
}

