/**
 * box.js — 我的寶可夢倉庫與截圖智能辨識系統
 * =========================================================
 * 功能：
 * 1. 個人寶可夢倉庫管理 (LocalStorage CRUD + 匯出/匯入)
 * 2. 截圖影像智能分析與 OCR 辨識 (等級、食材、副技能、性格)
 * 3. 視覺化核對與防呆編輯彈窗
 * 4. 倉庫卡片與表格雙視圖呈現、多維度篩選
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'PKMSLEEP_USER_BOX_V1';

  /* ─── 字典常數定義 ─────────────────────────────────────── */
  const NATURE_DATA = [
    { name: '固執', name_en: 'Adamant', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'speed', debuffType: 'ingredient' },
    { name: '勇敢', name_en: 'Brave', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'speed', debuffType: 'exp' },
    { name: '怕寂寞', name_en: 'Lonely', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'speed', debuffType: 'energy' },
    { name: '頑皮', name_en: 'Naughty', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'speed', debuffType: 'skill' },
    { name: '內斂', name_en: 'Modest', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'ingredient', debuffType: 'speed' },
    { name: '冷靜', name_en: 'Quiet', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'ingredient', debuffType: 'exp' },
    { name: '慢吞吞', name_en: 'Mild', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'ingredient', debuffType: 'energy' },
    { name: '馬虎', name_en: 'Rash', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'ingredient', debuffType: 'skill' },
    { name: '溫和', name_en: 'Calm', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'skill', debuffType: 'speed' },
    { name: '慎重', name_en: 'Careful', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'skill', debuffType: 'ingredient' },
    { name: '自大', name_en: 'Sassy', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'skill', debuffType: 'exp' },
    { name: '溫順', name_en: 'Gentle', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'skill', debuffType: 'energy' },
    { name: '大膽', name_en: 'Bold', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'energy', debuffType: 'speed' },
    { name: '淘氣', name_en: 'Impish', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'energy', debuffType: 'ingredient' },
    { name: '悠閒', name_en: 'Relaxed', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'energy', debuffType: 'exp' },
    { name: '樂天', name_en: 'Lax', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'energy', debuffType: 'skill' },
    { name: '膽小', name_en: 'Timid', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'exp', debuffType: 'speed' },
    { name: '爽朗', name_en: 'Jolly', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'exp', debuffType: 'ingredient' },
    { name: '急躁', name_en: 'Hasty', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'exp', debuffType: 'energy' },
    { name: '天真', name_en: 'Naive', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'exp', debuffType: 'skill' },
    { name: '坦率', name_en: 'Hardy', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
    { name: '害羞', name_en: 'Bashful', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
    { name: '認真', name_en: 'Docile', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
    { name: '勤奮', name_en: 'Serious', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
    { name: '浮躁', name_en: 'Quirky', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' }
  ];

  const SUBSKILLS_DATA = [
    // 金色技能 (Tier 1 Gold)
    { name: '樹果數量S', name_en: 'Berry Finding S', tier: 'gold', desc: '幫忙時發現的樹果數量增加1個', desc_en: 'Finds 1 additional berry when helping.' },
    { name: '幫手獎勵', name_en: 'Helping Bonus', tier: 'gold', desc: '隊伍全員的幫忙時間縮短5%', desc_en: 'Reduces helping time of all team members by 5%.' },
    { name: '睡眠EXP獎勵', name_en: 'Sleep EXP Bonus', tier: 'gold', desc: '睡眠研究獲得的EXP提升14%', desc_en: 'Boosts EXP gained from sleep research by 14%.' },
    { name: '活力回復獎勵', name_en: 'Energy Recovery Bonus', tier: 'gold', desc: '隊伍全員睡眠活力回復量提升14%', desc_en: 'Boosts sleep energy recovery for all team members by 14%.' },
    { name: '夢之碎片獎勵', name_en: 'Dream Shard Bonus', tier: 'gold', desc: '睡眠研究獲得的夢之碎片增加6%', desc_en: 'Boosts Dream Shards gained from sleep research by 6%.' },
    { name: '研究EXP獎勵', name_en: 'Research EXP Bonus', tier: 'gold', desc: '睡眠研究獲得的研究EXP增加6%', desc_en: 'Boosts Research EXP gained from sleep research by 6%.' },
    { name: '技能等級提升M', name_en: 'Skill Level Up M', tier: 'gold', desc: '主技能等級提升2級', desc_en: 'Increases the level of the main skill by 2.' },
    // 藍色技能 (Tier 2 Silver/Blue)
    { name: '幫忙速度M', name_en: 'Helping Speed M', tier: 'blue', desc: '幫忙時間縮短14%', desc_en: 'Reduces helping time by 14%.' },
    { name: '食材機率提升M', name_en: 'Ingredient Finder M', tier: 'blue', desc: '發現食材的機率大幅提升', desc_en: 'Significantly increases the chance of finding ingredients.' },
    { name: '技能機率提升M', name_en: 'Skill Trigger M', tier: 'blue', desc: '發動主技能的機率大幅提升', desc_en: 'Significantly increases the chance of triggering main skill.' },
    { name: '技能等級提升S', name_en: 'Skill Level Up S', tier: 'blue', desc: '主技能等級提升1級', desc_en: 'Increases the level of the main skill by 1.' },
    { name: '持有上限提升L', name_en: 'Inventory Up L', tier: 'blue', desc: '最大持有數量增加18', desc_en: 'Increases max carry capacity by 18.' },
    { name: '持有上限提升M', name_en: 'Inventory Up M', tier: 'blue', desc: '最大持有數量增加12', desc_en: 'Increases max carry capacity by 12.' },
    // 白色技能 (Tier 3 White)
    { name: '幫忙速度S', name_en: 'Helping Speed S', tier: 'white', desc: '幫忙時間縮短7%', desc_en: 'Reduces helping time by 7%.' },
    { name: '食材機率提升S', name_en: 'Ingredient Finder S', tier: 'white', desc: '發現食材的機率小幅提升', desc_en: 'Slightly increases the chance of finding ingredients.' },
    { name: '技能機率提升S', name_en: 'Skill Trigger S', tier: 'white', desc: '發動主技能的機率小幅提升', desc_en: 'Slightly increases the chance of triggering main skill.' },
    { name: '持有上限提升S', name_en: 'Inventory Up S', tier: 'white', desc: '最大持有數量增加6', desc_en: 'Increases max carry capacity by 6.' },
    { name: '活力回復提升S', name_en: 'Energy Recovery Up S', tier: 'white', desc: '自身的活力回復量提升', desc_en: 'Boosts the Pokémon\'s own energy recovery by 14%.' }
  ];

  /* ─── 狀態管理 ─────────────────────────────────────────── */
  let userBox = [];
  let currentSearch = '';
  let selectedType = 'ALL';
  let selectedSpecialty = 'ALL';
  let sortBy = 'id-asc';
  let boxViewMode = 'grid'; // 'grid' | 'table'
  let allPokemonsRef = [];

  /* ─── 倉庫表格欄位點選排序 (Table Column Sorting) ───────── */
  const BOX_SORT_DEFAULT_DIR = {
    id: 'asc',
    no: 'asc',
    level: 'desc',
    name: 'asc',
    specialty: 'asc',
    berry: 'asc',
    ing1: 'asc',
    ing2: 'asc',
    ing3: 'asc',
    created: 'desc'
  };

  function parseBoxSort(sortKey) {
    if (!sortKey) return { col: null, dir: null };
    const i = sortKey.lastIndexOf('-');
    if (i <= 0) return { col: null, dir: null };
    let col = sortKey.slice(0, i);
    const dir = sortKey.slice(i + 1);
    if (col === 'dex' || col === 'no') col = 'id';
    if (!BOX_SORT_DEFAULT_DIR[col] || (dir !== 'asc' && dir !== 'desc')) return { col: null, dir: null };
    return { col, dir };
  }

  function nextBoxSort(currentSort, col) {
    const targetCol = (col === 'dex' || col === 'no') ? 'id' : col;
    if (targetCol !== 'id' && targetCol !== 'level') return currentSort;
    const parsed = parseBoxSort(currentSort);

    if (targetCol === 'id') {
      if (parsed.col === 'id') {
        return parsed.dir === 'asc' ? 'id-desc' : 'id-asc';
      }
      return 'id-asc';
    }

    if (targetCol === 'level') {
      if (parsed.col === 'level') {
        if (parsed.dir === 'desc') {
          return 'level-asc';
        }
        return 'id-asc';
      }
      return 'level-desc';
    }

    return currentSort;
  }

  // Contract for Test 176: <th class="th-icon"
  function boxSortableTh(col, label, cls = '') {
    const targetCol = (col === 'dex' || col === 'no') ? 'id' : col;
    const parsed = parseBoxSort(sortBy);
    const on = parsed.col === targetCol;
    const arrow = on ? (parsed.dir === 'desc' ? '▼' : '▲') : '';
    const aria = on ? (parsed.dir === 'desc' ? 'descending' : 'ascending') : 'none';
    const classAttr = cls ? `${cls} th-sortable` : 'th-sortable';
    return `<th class="${classAttr}" data-sort="${targetCol}" aria-sort="${aria}" style="text-align:center;">${label}${arrow ? `<span class="sort-arrow" aria-hidden="true">${arrow}</span>` : ''}</th>`;
  }

  /* ─── 倉庫多維篩選器狀態 ─────────────────────────────────── */
  const boxSelectedSpecialties = new Set();
  const boxSelectedBerries = new Set();
  const boxSelectedIngredients = new Set();
  const boxSelectedSkills = new Set();
  let boxOnlyFinal = false;
  let boxOnlyInitialIng = false;
  let boxShowNo = false;

  const DEFAULT_BERRY_DATA = [
    { name: '柿仔果', type: '一般', icon: 'https://www.serebii.net/pokemonsleep/berries/persimberry.png' },
    { name: '蘋野果', type: '火', icon: 'https://www.serebii.net/pokemonsleep/berries/leppaberry.png' },
    { name: '橙橙果', type: '水', icon: 'https://www.serebii.net/pokemonsleep/berries/oranberry.png' },
    { name: '異奇果', type: '電', icon: 'https://www.serebii.net/pokemonsleep/berries/grepaberry.png' },
    { name: '墨莓果', type: '草', icon: 'https://www.serebii.net/pokemonsleep/berries/durinberry.png' },
    { name: '生薑果', type: '冰', icon: 'https://www.serebii.net/pokemonsleep/berries/rawstberry.png' },
    { name: '櫻子果', type: '格鬥', icon: 'https://www.serebii.net/pokemonsleep/berries/cheriberry.png' },
    { name: '零餘果', type: '毒', icon: 'https://www.serebii.net/pokemonsleep/berries/chestoberry.png' },
    { name: '勿花果', type: '地面', icon: 'https://www.serebii.net/pokemonsleep/berries/figyberry.png' },
    { name: '椰木果', type: '飛行', icon: 'https://www.serebii.net/pokemonsleep/berries/pamtreberry.png' },
    { name: '芒念果', type: '超能力', icon: 'https://www.serebii.net/pokemonsleep/berries/magoberry.png' },
    { name: '芭亞果', type: '蟲', icon: 'https://www.serebii.net/pokemonsleep/berries/lumberry.png' },
    { name: '文柚果', type: '岩石', icon: 'https://www.serebii.net/pokemonsleep/berries/sitrusberry.png' },
    { name: '檬果', type: '幽靈', icon: 'https://www.serebii.net/pokemonsleep/berries/blukberry.png' },
    { name: '巧可果', type: '龍', icon: 'https://www.serebii.net/pokemonsleep/berries/yacheberry.png' },
    { name: '芭拉果', type: '惡', icon: 'https://www.serebii.net/pokemonsleep/berries/wikiberry.png' },
    { name: '靛莓果', type: '鋼', icon: 'https://www.serebii.net/pokemonsleep/berries/belueberry.png' },
    { name: '桃桃果', type: '妖精', icon: 'https://www.serebii.net/pokemonsleep/berries/pechaberry.png' }
  ];

  const DEFAULT_TYPE_TO_BERRY = {
    '一般': '柿仔果', '火': '蘋野果', '水': '橙橙果', '電': '異奇果', '草': '墨莓果',
    '冰': '生薑果', '格鬥': '櫻子果', '鬥': '櫻子果', '毒': '零餘果', '地面': '勿花果', '地': '勿花果',
    '飛行': '椰木果', '飛': '椰木果', '超能力': '芒念果', '超': '芒念果', '蟲': '芭亞果',
    '岩石': '文柚果', '岩': '文柚果', '幽靈': '檬果', '鬼': '檬果', '龍': '巧可果',
    '惡': '芭拉果', '鋼': '靛莓果', '妖精': '桃桃果', '妖': '桃桃果'
  };

  const DEFAULT_BASE_SKILLS = [
    { key: '能量填充S', label: '能量填充S', label_en: 'Charge Energy S' },
    { key: '能量填充M', label: '能量填充M', label_en: 'Charge Energy M' },
    { key: '能量填充S (隨機)', label: '能量填充S(變動)', label_en: 'Charge Energy S (Var)' },
    { key: '夢之碎片獲取S', label: '夢之碎片S', label_en: 'Dream Shard Magnet S' },
    { key: '夢之碎片獲取S (隨機)', label: '夢之碎片S(變動)', label_en: 'Dream Shard Magnet S (Var)' },
    { key: '活力療癒S', label: '活力療癒S', label_en: 'Energizing Cheer S' },
    { key: '活力全體療癒S', label: '活力全體療癒S', label_en: 'Energy for Everyone S' },
    { key: '自給活力S', label: '自給活力S', label_en: 'Charge Energy S (Self)' },
    { key: '幫手支援S', label: '幫手支援S', label_en: 'Extra Helpful S' },
    { key: '食材獲取S', label: '食材獲取S', label_en: 'Ingredient Magnet S' },
    { key: '料理擴大S', label: '料理擴大S', label_en: 'Cooking Power-Up S' },
    { key: '揮指', label: '揮指', label_en: 'Metronome' },
    { key: '美味機率提升S', label: '美味機率S', label_en: 'Tasty Chance S' },
    { key: '幫手激勵S', label: '幫手激勵S', label_en: 'Helper Boost' },
    { key: '月光（活力全體療癒S）', label: '月光(全體療癒)', label_en: 'Moonlight' }
  ];

  function getBerryData() {
    return (typeof window !== 'undefined' && window.PokemonApp && window.PokemonApp.BERRY_DATA) || DEFAULT_BERRY_DATA;
  }
  function getTypeToBerry() {
    return (typeof window !== 'undefined' && window.PokemonApp && window.PokemonApp.TYPE_TO_BERRY) || DEFAULT_TYPE_TO_BERRY;
  }
  function getBaseSkills() {
    return (typeof window !== 'undefined' && window.PokemonApp && window.PokemonApp.BASE_SKILLS) || DEFAULT_BASE_SKILLS;
  }
  function checkMatchesSkill(actualSkill, baseSkillKey) {
    if (typeof window !== 'undefined' && window.PokemonApp && typeof window.PokemonApp.matchesSkill === 'function') {
      return window.PokemonApp.matchesSkill(actualSkill, baseSkillKey);
    }
    if (typeof window !== 'undefined' && typeof window.matchesSkill === 'function') {
      return window.matchesSkill(actualSkill, baseSkillKey);
    }
    return actualSkill && actualSkill.includes(baseSkillKey);
  }
  function getUniqueIngredients() {
    if (typeof window !== 'undefined' && window.PokemonApp && Array.isArray(window.PokemonApp.uniqueIngredients) && window.PokemonApp.uniqueIngredients.length > 0) {
      return window.PokemonApp.uniqueIngredients;
    }
    if (typeof window !== 'undefined' && Array.isArray(window.uniqueIngredients) && window.uniqueIngredients.length > 0) {
      return window.uniqueIngredients;
    }
    const source = (allPokemonsRef && allPokemonsRef.length > 0) ? allPokemonsRef : ((typeof window !== 'undefined' && window.allPokemons) || []);
    const map = new Map();
    source.forEach(p => {
      if (p.ingredients) {
        p.ingredients.forEach(ing => {
          if (ing && ing.name && !map.has(ing.name)) {
            map.set(ing.name, ing.icon || '');
          }
        });
      }
    });
    return Array.from(map.entries()).map(([name, icon]) => ({ name, icon }));
  }

  const BOX_SPECIALTIES = ['樹果', '食材', '技能'];

  function renderBoxSpecialtyButtons() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('box-specialty-filter-tags');
    if (!container) return;
    container.innerHTML = BOX_SPECIALTIES.map(s => {
      const isActive = boxSelectedSpecialties.has(s);
      const label = window.I18N ? window.I18N.getSpecialtyName(s) : s;
      return `<button type="button" class="tag-btn ${isActive ? 'active' : ''}" data-specialty="${s}">${label}</button>`;
    }).join('');
  }

  function renderBoxBerryButtons() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('box-berry-filter-tags');
    if (!container) return;
    const clearBtn = document.getElementById('box-clear-berries-btn');
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
    const berryData = getBerryData();
    container.innerHTML = berryData.map(b => {
      const isActive = boxSelectedBerries.has(b.name);
      const berryName = typeof window !== 'undefined' && window.I18N ? window.I18N.getBerryName(b.name) : b.name;
      const typeName = isEN && typeof window !== 'undefined' && window.I18N ? window.I18N.getTypeName(b.type) : b.type;
      return `
        <button type="button" class="subfilter-icon-btn ${isActive ? 'active' : ''}" data-berry="${b.name}" title="${berryName} (${typeName})" aria-label="${berryName}">
          ${b.icon ? `<img src="${b.icon}" class="subfilter-icon-img" alt="${berryName}" loading="lazy" onerror="this.style.display='none';">` : ''}
        </button>
      `;
    }).join('');

    if (clearBtn) {
      clearBtn.style.display = boxSelectedBerries.size > 0 ? 'inline-block' : 'none';
    }
  }

  function renderBoxIngredientButtons() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('box-ingredient-pkm-filter-tags');
    if (!container) return;
    const clearBtn = document.getElementById('box-clear-ingredients-pkm-btn');
    const uniqueIngs = getUniqueIngredients();
    container.innerHTML = uniqueIngs.map(ing => {
      const isActive = boxSelectedIngredients.has(ing.name);
      const ingName = typeof window !== 'undefined' && window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
      return `
        <button type="button" class="subfilter-icon-btn ${isActive ? 'active' : ''}" data-ing="${ing.name}" title="${ingName}" aria-label="${ingName}">
          ${ing.icon ? `<img src="${ing.icon}" class="subfilter-icon-img" alt="${ingName}" loading="lazy" onerror="this.style.display='none';">` : ''}
        </button>
      `;
    }).join('');

    if (clearBtn) {
      clearBtn.style.display = boxSelectedIngredients.size > 0 ? 'inline-block' : 'none';
    }
  }

  function renderBoxSkillButtons() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('box-skill-filter-tags');
    if (!container) return;
    const clearBtn = document.getElementById('box-clear-skills-btn');
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
    const baseSkills = getBaseSkills();
    container.innerHTML = baseSkills.map(skillItem => {
      const isActive = boxSelectedSkills.has(skillItem.key);
      const label = isEN ? (skillItem.label_en || (typeof window !== 'undefined' && window.I18N ? window.I18N.getMainSkillName(skillItem.label) : skillItem.label)) : (typeof window !== 'undefined' && window.I18N ? window.I18N.getMainSkillName(skillItem.label) : skillItem.label);
      const fullTitle = isEN ? (typeof window !== 'undefined' && window.I18N ? window.I18N.getMainSkillName(skillItem.key) : skillItem.label) : skillItem.label;
      return `
        <button type="button" class="subfilter-skill-btn ${isActive ? 'active' : ''}" data-skill="${skillItem.key}" title="${fullTitle}">
          <span class="subfilter-skill-name">${label}</span>
        </button>
      `;
    }).join('');

    if (clearBtn) {
      clearBtn.style.display = boxSelectedSkills.size > 0 ? 'inline-block' : 'none';
    }
  }

  function updateBoxActiveFilterBadge() {
    if (typeof document === 'undefined') return;
    let count = 0;
    if (boxSelectedSpecialties && boxSelectedSpecialties.size > 0) count += 1;
    if (boxSelectedBerries && boxSelectedBerries.size > 0) count += 1;
    if (boxSelectedIngredients && boxSelectedIngredients.size > 0) count += 1;
    if (boxSelectedSkills && boxSelectedSkills.size > 0) count += 1;
    if (boxOnlyInitialIng) count += 1;
    if (boxOnlyFinal) count += 1;

    const badge = document.getElementById('box-sidebar-bookmark-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  function toggleBoxSidebar(forceState) {
    const sidebar = document.getElementById('box-filter-sidebar');
    const bookmarkHandle = document.getElementById('box-sidebar-bookmark-handle');
    const backdrop = document.getElementById('box-sidebar-backdrop');
    if (!sidebar) return;

    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
    const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

    if (shouldCollapse) {
      sidebar.classList.add('collapsed');
      if (backdrop) backdrop.classList.remove('active');
      if (bookmarkHandle) {
        bookmarkHandle.classList.remove('drawer-open');
        bookmarkHandle.setAttribute('aria-expanded', 'false');
        bookmarkHandle.title = '展開篩選側邊欄';
        bookmarkHandle.style.removeProperty('display');
        bookmarkHandle.style.removeProperty('opacity');
        bookmarkHandle.style.removeProperty('visibility');
        bookmarkHandle.style.removeProperty('pointer-events');
      }
      if (typeof window !== 'undefined' && typeof window.setSidebarSavedState === 'function') {
        window.setSidebarSavedState('pksleep_box_sidebar_open', false);
      }
    } else {
      if (typeof window !== 'undefined' && typeof window.portalMobileOverlays === 'function') {
        window.portalMobileOverlays(sidebar);
      }
      sidebar.classList.remove('collapsed');
      const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList && typeof document.body.classList.contains === 'function' && document.body.classList.contains('mobile-h5-app');
      const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 1024;
      if ((isMobileH5 || isSmallScreen) && backdrop) {
        backdrop.classList.add('active');
      }
      if (bookmarkHandle) {
        bookmarkHandle.classList.add('drawer-open');
        bookmarkHandle.setAttribute('aria-expanded', 'true');
        bookmarkHandle.title = '收合篩選側邊欄';
        bookmarkHandle.style.removeProperty('display');
        bookmarkHandle.style.removeProperty('opacity');
        bookmarkHandle.style.removeProperty('visibility');
        bookmarkHandle.style.removeProperty('pointer-events');
      }
      if (typeof window !== 'undefined' && typeof window.setSidebarSavedState === 'function') {
        window.setSidebarSavedState('pksleep_box_sidebar_open', true);
      }
    }
    if (typeof window !== 'undefined' && typeof window.syncOverlayOpenState === 'function') {
      window.syncOverlayOpenState();
    }
  }

  function resetBoxFilters() {
    boxSelectedSpecialties.clear();
    boxSelectedBerries.clear();
    boxSelectedIngredients.clear();
    boxSelectedSkills.clear();
    boxOnlyFinal = false;
    boxOnlyInitialIng = false;
    boxShowNo = false;
    sortBy = 'id-asc';
    if (typeof document !== 'undefined') {
      const sortSelect = document.getElementById('box-sort-select');
      if (sortSelect) sortSelect.value = 'id-asc';
      const finalToggle = document.getElementById('box-final-evo-toggle');
      const initialToggle = document.getElementById('box-initial-ing-toggle');
      const showNoToggle = document.getElementById('box-show-no-toggle');
      if (finalToggle) finalToggle.checked = false;
      if (initialToggle) initialToggle.checked = false;
      if (showNoToggle) showNoToggle.checked = false;
      renderBoxSpecialtyButtons();
      renderBoxBerryButtons();
      renderBoxIngredientButtons();
      renderBoxSkillButtons();
      updateBoxActiveFilterBadge();
      renderBox();
    }
  }

  function getBoxFilterState() {
    return {
      selectedSpecialties: new Set(boxSelectedSpecialties),
      selectedBerries: new Set(boxSelectedBerries),
      selectedIngredients: new Set(boxSelectedIngredients),
      selectedSkills: new Set(boxSelectedSkills),
      onlyFinal: boxOnlyFinal,
      onlyInitialIng: boxOnlyInitialIng,
      showNo: boxShowNo
    };
  }

  function setBoxFilterState(state) {
    if (!state) return;
    if (state.selectedSpecialties) {
      boxSelectedSpecialties.clear();
      state.selectedSpecialties.forEach(s => boxSelectedSpecialties.add(s));
    }
    if (state.selectedBerries) {
      boxSelectedBerries.clear();
      state.selectedBerries.forEach(b => boxSelectedBerries.add(b));
    }
    if (state.selectedIngredients) {
      boxSelectedIngredients.clear();
      state.selectedIngredients.forEach(i => boxSelectedIngredients.add(i));
    }
    if (state.selectedSkills) {
      boxSelectedSkills.clear();
      state.selectedSkills.forEach(k => boxSelectedSkills.add(k));
    }
    if (state.onlyFinal !== undefined) boxOnlyFinal = Boolean(state.onlyFinal);
    if (state.onlyInitialIng !== undefined) boxOnlyInitialIng = Boolean(state.onlyInitialIng);
    if (state.showNo !== undefined) boxShowNo = Boolean(state.showNo);
    updateBoxActiveFilterBadge();
  }

  let boxFiltersInitialized = false;
  function initBoxFilters() {
    renderBoxSpecialtyButtons();
    renderBoxBerryButtons();
    renderBoxIngredientButtons();
    renderBoxSkillButtons();
    updateBoxActiveFilterBadge();

    if (boxFiltersInitialized) return;
    boxFiltersInitialized = true;

    const sidebar = document.getElementById('box-filter-sidebar');
    const bookmarkHandle = document.getElementById('box-sidebar-bookmark-handle');
    const closeBtn = document.getElementById('box-sidebar-close-btn');
    const resetAllBtn = document.getElementById('box-sidebar-reset-all-btn');
    const backdrop = document.getElementById('box-sidebar-backdrop');
    const finalEvoToggle = document.getElementById('box-final-evo-toggle');
    const initialIngToggle = document.getElementById('box-initial-ing-toggle');
    const showNoToggle = document.getElementById('box-show-no-toggle');
    const specialtyContainer = document.getElementById('box-specialty-filter-tags');
    const berryContainer = document.getElementById('box-berry-filter-tags');
    const ingredientContainer = document.getElementById('box-ingredient-pkm-filter-tags');
    const skillContainer = document.getElementById('box-skill-filter-tags');
    const clearBerriesBtn = document.getElementById('box-clear-berries-btn');
    const clearIngredientsBtn = document.getElementById('box-clear-ingredients-pkm-btn');
    const clearSkillsBtn = document.getElementById('box-clear-skills-btn');
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList && typeof document.body.classList.contains === 'function' && document.body.classList.contains('mobile-h5-app');

    if (finalEvoToggle) {
      finalEvoToggle.addEventListener('change', (e) => {
        boxOnlyFinal = e.target.checked;
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (initialIngToggle) {
      initialIngToggle.addEventListener('change', (e) => {
        boxOnlyInitialIng = e.target.checked;
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (showNoToggle) {
      showNoToggle.addEventListener('change', (e) => {
        boxShowNo = e.target.checked;
        renderBox();
      });
    }

    if (specialtyContainer) {
      specialtyContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-btn');
        if (!btn) return;
        const specialty = btn.getAttribute('data-specialty');
        if (!specialty) return;
        if (boxSelectedSpecialties.has(specialty)) {
          boxSelectedSpecialties.delete(specialty);
        } else {
          boxSelectedSpecialties.add(specialty);
        }
        renderBoxSpecialtyButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (berryContainer) {
      berryContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.subfilter-icon-btn, .subfilter-tag-btn');
        if (!btn) return;
        const berry = btn.getAttribute('data-berry');
        if (!berry) return;
        if (boxSelectedBerries.has(berry)) {
          boxSelectedBerries.delete(berry);
        } else {
          boxSelectedBerries.add(berry);
        }
        renderBoxBerryButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (ingredientContainer) {
      ingredientContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.subfilter-icon-btn, .subfilter-tag-btn');
        if (!btn) return;
        const ing = btn.getAttribute('data-ing');
        if (!ing) return;
        if (boxSelectedIngredients.has(ing)) {
          boxSelectedIngredients.delete(ing);
        } else {
          boxSelectedIngredients.add(ing);
        }
        renderBoxIngredientButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (skillContainer) {
      skillContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.subfilter-skill-btn, .subfilter-tag-btn');
        if (!btn) return;
        const skill = btn.getAttribute('data-skill');
        if (!skill) return;
        if (boxSelectedSkills.has(skill)) {
          boxSelectedSkills.delete(skill);
        } else {
          boxSelectedSkills.add(skill);
        }
        renderBoxSkillButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (clearBerriesBtn) {
      clearBerriesBtn.addEventListener('click', () => {
        boxSelectedBerries.clear();
        renderBoxBerryButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (clearIngredientsBtn) {
      clearIngredientsBtn.addEventListener('click', () => {
        boxSelectedIngredients.clear();
        renderBoxIngredientButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (clearSkillsBtn) {
      clearSkillsBtn.addEventListener('click', () => {
        boxSelectedSkills.clear();
        renderBoxSkillButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => {
        resetBoxFilters();
      });
    }

    if (bookmarkHandle && sidebar && !bookmarkHandle._hasListener) {
      bookmarkHandle._hasListener = true;
      if (typeof window !== 'undefined' && typeof window.makeFloatingDraggable === 'function' && isMobileH5) {
        window.makeFloatingDraggable(bookmarkHandle, () => toggleBoxSidebar());
      } else {
        bookmarkHandle.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleBoxSidebar();
        });
      }
    }

    if (closeBtn && sidebar && !closeBtn._hasListener) {
      closeBtn._hasListener = true;
      closeBtn.addEventListener('click', () => {
        toggleBoxSidebar(false);
      });
    }

    if (backdrop && sidebar && !backdrop._hasListener) {
      backdrop._hasListener = true;
      if (typeof window !== 'undefined' && typeof window.bindBackdropDismiss === 'function') {
        window.bindBackdropDismiss(backdrop, () => toggleBoxSidebar(false));
      } else {
        backdrop.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleBoxSidebar(false);
        });
      }
    }

    if (sidebar && typeof window !== 'undefined' && typeof window.bindSidebarSwipeRightToClose === 'function') {
      window.bindSidebarSwipeRightToClose(sidebar, () => toggleBoxSidebar(false));
    }
  }

  if (typeof window !== 'undefined') {
    window.toggleBoxSidebar = toggleBoxSidebar;
    window.resetBoxFilters = resetBoxFilters;
    window.initBoxFilters = initBoxFilters;
  }

  /* ─── 初始化與資料載入 ───────────────────────────────────── */