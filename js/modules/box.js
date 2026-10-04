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
        bookmarkHandle.style.opacity = '1';
        bookmarkHandle.style.pointerEvents = 'auto';
        bookmarkHandle.style.display = 'flex';
        bookmarkHandle.style.visibility = 'visible';
      }
      if (typeof window !== 'undefined' && typeof window.setSidebarSavedState === 'function') {
        window.setSidebarSavedState('pksleep_box_sidebar_open', false);
      }
    } else {
      if (typeof window !== 'undefined' && typeof window.portalMobileOverlays === 'function') {
        window.portalMobileOverlays(sidebar);
      }
      sidebar.classList.remove('collapsed');
      const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
      const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 1024;
      if ((isMobileH5 || isSmallScreen) && backdrop) {
        backdrop.classList.add('active');
      }
      if (bookmarkHandle) {
        bookmarkHandle.classList.add('drawer-open');
        bookmarkHandle.setAttribute('aria-expanded', 'true');
        bookmarkHandle.title = '收合篩選側邊欄';
        bookmarkHandle.style.opacity = '0';
        bookmarkHandle.style.pointerEvents = 'none';
        bookmarkHandle.style.display = 'none';
        bookmarkHandle.style.visibility = 'hidden';
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
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

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
  function loadUserBox() {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        userBox = JSON.parse(raw);
        if (!Array.isArray(userBox)) userBox = [];
      } else {
        userBox = [];
      }
    } catch (e) {
      console.error('Failed to load user box:', e);
      userBox = [];
    }
  }

  function saveUserBox() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userBox));
    } catch (e) {
      console.error('Failed to save user box:', e);
    }
    if (typeof window !== 'undefined' && window.CloudSync && typeof window.CloudSync.pushCloudBox === 'function') {
      window.CloudSync.pushCloudBox(userBox);
    }
  }

  /* ─── 獲取寶可夢基礎資訊 ─────────────────────────────────── */
  function findPokemonBase(idOrName) {
    if (!allPokemonsRef || allPokemonsRef.length === 0) return null;
    return allPokemonsRef.find(p => 
      String(p.id) === String(idOrName) ||
      p.formatted_no === String(idOrName) ||
      (p.name && (p.name.cn === idOrName || p.name.en === idOrName || p.name.jp === idOrName)) ||
      p.name_cn === idOrName ||
      p.name_en === idOrName
    ) || null;
  }

  /* ─── RaenonX 級潛力 PR 評分演算法 (含核心及格線快速檢驗與 Lv.70/80 覆蓋) ─── */
  function calculatePokemonPR(pkm, baseData = null) {
    const base = baseData || findPokemonBase(pkm.pokemonId || pkm.name);
    const specialty = (base && base.specialty) || pkm.specialty || '樹果';
    const nature = pkm.nature || '坦率';
    const subskills = pkm.subskills || [];

    const natureObj = NATURE_DATA.find(n => n.name === nature) || { buffType: 'none', debuffType: 'none' };
    const buff = natureObj.buffType;
    const debuff = natureObj.debuffType;
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';

    // 前三格核心技能 (Lv.10, Lv.25, Lv.50)
    const earlySubskills = subskills.slice(0, 3);

    // ─── 階段 1：核心及格線快速判定 (Fast-Exit Baseline Filter) ───
    let passedBaseline = true;
    let baselineFailReason = '';

    if (specialty === '樹果') {
      const hasEarlyBFS = earlySubskills.includes('樹果數量S');
      const hasEarlyHB = earlySubskills.includes('幫手獎勵');
      const hasEarlySpeedM = earlySubskills.includes('幫忙速度M');
      const isSpeedDown = debuff === 'speed';
      const isSpeedUp = buff === 'speed';

      if (isSpeedDown && !hasEarlyBFS && !hasEarlyHB) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Speed down nature without BFS / HB to compensate' : '性格減慢幫忙速度，未達樹果手及格線（且前三格無樹果S/幫手獎勵補救）';
      } else if (!hasEarlyBFS && !hasEarlyHB && !hasEarlySpeedM && !isSpeedUp) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Lacks BFS or speed boost in first 3 slots' : '前三格缺乏樹果S/速度加成，未達樹果手及格線';
      }
    } else if (specialty === '食材') {
      const hasEarlyIngM = earlySubskills.includes('食材機率提升M');
      const hasEarlyIngS = earlySubskills.includes('食材機率提升S');
      const hasEarlyHB = earlySubskills.includes('幫手獎勵');
      const isIngDown = debuff === 'ingredient';
      const isIngUp = buff === 'ingredient';

      if (isIngDown && !hasEarlyIngM) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Ingredient down nature without Ingredient Finder M' : '性格減少食材機率，未達食材手及格線';
      } else if (!hasEarlyIngM && !hasEarlyIngS && !hasEarlyHB && !isIngUp) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Lacks ingredient finder boost in first 3 slots' : '缺乏食材機率加成，未達食材手及格線';
      }
    } else { // 技能型
      const hasEarlySkillM = earlySubskills.includes('技能機率提升M');
      const hasEarlySkillS = earlySubskills.includes('技能機率提升S');
      const hasEarlySkillLvlM = earlySubskills.includes('技能等級提升M');
      const hasEarlyHB = earlySubskills.includes('幫手獎勵');
      const isSkillDown = debuff === 'skill';
      const isSkillUp = buff === 'skill';

      if (isSkillDown && !hasEarlySkillM) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Skill down nature without Skill Trigger M' : '性格減少主技能機率，未達技能手及格線';
      } else if (!hasEarlySkillM && !hasEarlySkillS && !hasEarlySkillLvlM && !hasEarlyHB && !isSkillUp) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Lacks skill trigger boost in first 3 slots' : '缺乏技能發動率加成，未達技能手及格線';
      }
    }

    // 若未通過及格線：快速出口 (Fast-Exit) 歸類為 B/C 級，免去多餘高階比對
    if (!passedBaseline) {
      let failScore = 15;
      if (earlySubskills.length > 0) failScore += 10;
      let pr = Math.min(42, Math.max(12, failScore));
      return {
        pr,
        tier: pr >= 30 ? 'B' : 'C',
        tierBadgeClass: pr >= 30 ? 'pr-tier-b' : 'pr-tier-c',
        summaryNote: `[!] ${baselineFailReason}`,
        score: failScore
      };
    }

    // ─── 階段 2：及格線以上的高階精確評分 (覆蓋 Lv.10, 25, 50, 70, 80) ───
    let score = 0;
    const highlights = [];

    // 1. 性格評分
    if (specialty === '樹果') {
      if (buff === 'speed') { score += 25; highlights.push(isEN ? 'Speed ▲' : '幫忙速度▲'); }
      if (debuff === 'speed') { score -= 25; }
      if (debuff === 'ingredient') { score += 12; highlights.push(isEN ? 'Ing. ▼ (Pure Berry)' : '食材▼ (樹果極限流)'); }
      if (buff === 'ingredient') { score -= 6; }
    } else if (specialty === '食材') {
      if (buff === 'ingredient') { score += 28; highlights.push(isEN ? 'Ing. Rate ▲' : '食材機率▲'); }
      if (debuff === 'ingredient') { score -= 28; }
      if (buff === 'speed') { score += 16; highlights.push(isEN ? 'Speed ▲' : '幫忙速度▲'); }
      if (debuff === 'speed') { score -= 16; }
    } else { // 技能
      if (buff === 'skill') { score += 30; highlights.push(isEN ? 'Skill Trigger ▲' : '主技能機率▲'); }
      if (debuff === 'skill') { score -= 30; }
      if (buff === 'speed') { score += 15; highlights.push(isEN ? 'Speed ▲' : '幫忙速度▲'); }
      if (debuff === 'speed') { score -= 15; }
    }

    // 2. 5 格副技能解鎖權重 (Lv.10: 30%, Lv.25: 30%, Lv.50: 20%, Lv.70: 12%, Lv.80: 8%)
    const slotWeights = [0.30, 0.30, 0.20, 0.12, 0.08];
    const lvlLabels = [10, 25, 50, 70, 80];

    subskills.forEach((skName, idx) => {
      const w = slotWeights[idx] || 0.08;
      const lvl = lvlLabels[idx] || 10;
      let skScore = 0;

      if (skName === '樹果數量S') {
        skScore = specialty === '樹果' ? 100 : 40;
        highlights.push(isEN ? `Lv.${lvl} BFS` : `Lv.${lvl} 樹果S`);
      } else if (skName === '幫手獎勵') {
        skScore = 65;
        highlights.push(isEN ? `Lv.${lvl} Helping Bonus` : `Lv.${lvl} 幫手獎勵`);
      } else if (skName === '食材機率提升M') {
        skScore = specialty === '食材' ? 85 : 20;
        if (specialty === '食材') highlights.push(isEN ? `Lv.${lvl} Ing. Finder M` : `Lv.${lvl} 食材機率M`);
      } else if (skName === '食材機率提升S') {
        skScore = specialty === '食材' ? 45 : 10;
      } else if (skName === '技能機率提升M') {
        skScore = specialty === '技能' ? 85 : 20;
        if (specialty === '技能') highlights.push(isEN ? `Lv.${lvl} Skill Trigger M` : `Lv.${lvl} 技能機率M`);
      } else if (skName === '技能機率提升S') {
        skScore = specialty === '技能' ? 45 : 10;
      } else if (skName === '技能等級提升M') {
        skScore = specialty === '技能' ? 60 : 15;
        if (specialty === '技能') highlights.push(isEN ? `Lv.${lvl} Skill Level M` : `Lv.${lvl} 技能等級M`);
      } else if (skName === '技能等級提升S') {
        skScore = specialty === '技能' ? 30 : 10;
      } else if (skName === '幫忙速度M') {
        skScore = 50;
        highlights.push(isEN ? `Lv.${lvl} Speed M` : `Lv.${lvl} 幫忙速度M`);
      } else if (skName === '幫忙速度S') {
        skScore = 25;
      } else if (skName === '持有上限提升L') {
        skScore = specialty === '食材' ? 40 : 20;
      } else if (skName === '持有上限提升M') {
        skScore = specialty === '食材' ? 26 : 14;
      } else if (skName === '持有上限提升S') {
        skScore = specialty === '食材' ? 14 : 7;
      } else if (skName === '睡眠EXP獎勵' || skName === '活力回復獎勵') {
        skScore = 18;
      } else {
        skScore = 8;
      }

      score += skScore * w;
    });

    // 睡飽飽獎章加成 (Good-Night Ribbon Bonus)
    const ribbonLvl = parseInt(pkm.ribbon, 10) || 0;
    if (ribbonLvl > 0) {
      const remainingEvos = typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRemainingEvolutions === 'function'
        ? window.AppraisalLab.getRemainingEvolutions(base)
        : 1;
      const ribbonBonus = typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRibbonBonus === 'function'
        ? window.AppraisalLab.getRibbonBonus(ribbonLvl, remainingEvos)
        : { carry: 8, speedDiscount: 0.12 };
      
      if (ribbonBonus.speedDiscount > 0) {
        score += Math.round(ribbonBonus.speedDiscount * 25);
        highlights.push(isEN ? `Ribbon -${Math.round(ribbonBonus.speedDiscount * 100)}% Speed` : `獎章幫速 -${Math.round(ribbonBonus.speedDiscount * 100)}%`);
      } else {
        score += ribbonBonus.carry * 0.8;
        highlights.push(isEN ? `Ribbon +${ribbonBonus.carry} Carry` : `獎章持有 +${ribbonBonus.carry}`);
      }
    }

    // 3. 正規化至 PR 百分位數 [50 ~ 100] (及格線以上個體)
    const minPassBenchmark = 10;
    const maxBenchmark = 75;
    let pr = 50 + Math.round(((score - minPassBenchmark) / (maxBenchmark - minPassBenchmark)) * 50);
    pr = Math.min(100, Math.max(50, pr));

    // 評級判定
    let tier = 'A';
    let tierBadgeClass = 'pr-tier-a';

    if (pr >= 90) {
      tier = 'S+';
      tierBadgeClass = 'pr-tier-splus';
    } else if (pr >= 75) {
      tier = 'S';
      tierBadgeClass = 'pr-tier-s';
    }

    // 4. AppraisalLab 雙軌評分與升級里程碑整合 (Dual-Track Rating & Milestone Projection)
    const lab = (typeof window !== 'undefined' && window.AppraisalLab) || (typeof AppraisalLab !== 'undefined' ? AppraisalLab : null);
    let currentGrade = tier;
    let currentScore = pr;
    let potentialGrade = tier;
    let potentialScore = pr;
    let currentTierBadgeClass = tierBadgeClass;
    let potentialTierBadgeClass = tierBadgeClass;
    let milestones = [];
    let milestoneNote = '';

    const gradeToBadgeClass = {
      'SSS': 'pr-tier-sss',
      'SS': 'pr-tier-ss',
      'S': 'pr-tier-s',
      'A': 'pr-tier-a',
      'B': 'pr-tier-b',
      'C': 'pr-tier-c',
      'D': 'pr-tier-d'
    };

    let appResult = null;
    if (lab && typeof lab.evaluatePokemon === 'function' && base) {
      const currentLv = parseInt(pkm.level, 10) || 30;
      const subArr = pkm.subskills || [];
      const ingArr = [pkm.ing1, pkm.ing2, pkm.ing3].filter(Boolean);
      const ribLvl = parseInt(pkm.ribbon, 10) || 0;
      const skLvl = getEffectiveSkillLevel(pkm, base);
      appResult = lab.evaluatePokemon(base, currentLv, pkm.nature, subArr, ingArr, ribLvl, skLvl);
      if (appResult) {
        currentGrade = (appResult.current && appResult.current.grade) || appResult.grade;
        currentScore = (appResult.current && appResult.current.compositeScore) || appResult.compositeScore;
        potentialGrade = (appResult.potential && appResult.potential.grade) || appResult.grade;
        potentialScore = (appResult.potential && appResult.potential.compositeScore) || appResult.compositeScore;
        currentTierBadgeClass = gradeToBadgeClass[currentGrade] || 'pr-tier-b';
        potentialTierBadgeClass = gradeToBadgeClass[potentialGrade] || 'pr-tier-b';
        milestones = appResult.milestones || [];
        if (milestones.length > 0) {
          milestoneNote = milestones[0].text;
        }
      }
    }

    let summaryNote = '';
    if (appResult && (appResult.intelligentSummary || appResult.summaryNote)) {
      summaryNote = appResult.intelligentSummary || appResult.summaryNote;
    } else if (milestoneNote) {
      summaryNote = milestoneNote;
    } else if (highlights.length > 0) {
      summaryNote = highlights.slice(0, 3).join(' · ');
    } else {
      summaryNote = isEN ? 'Solid baseline starter' : '及格主力，基礎能力扎實';
    }

    return {
      pr,
      tier,
      tierBadgeClass,
      currentGrade,
      currentScore,
      potentialGrade,
      potentialScore,
      currentTierBadgeClass,
      potentialTierBadgeClass,
      milestones,
      milestoneNote,
      summaryNote,
      highlights,
      score: Math.round(score * 10) / 10
    };
  }

  /* ─── 渲染倉庫清單 ─────────────────────────────────────── */
  function getFilteredBox() {
    const typeToBerry = getTypeToBerry();

    return userBox.filter(p => {
      const base = findPokemonBase(p.pokemonId || p.name);
      const pType = (base && base.type) || p.type || '';
      const pSpec = (base && base.specialty) || p.specialty || '';

      if (selectedType !== 'ALL' && pType !== selectedType) return false;
      if (selectedSpecialty !== 'ALL' && pSpec !== selectedSpecialty) return false;

      // 1. 專長類型多選篩選
      if (boxSelectedSpecialties.size > 0) {
        const isMewAll = pSpec === '全部' || pSpec === 'ALL';
        if (!isMewAll && !boxSelectedSpecialties.has(pSpec)) return false;
      }

      // 2. 僅最終進化篩選
      if (boxOnlyFinal) {
        const isFinal = (base && (base.is_final === '〇' || base.is_final === 'O' || base.is_final === 'o' || base.is_final === true || base.is_final === '1')) ||
          p.is_final === true || p.is_final === '〇';
        if (!isFinal) return false;
      }

      // 3. 樹果細節篩選 (多選)
      if (boxSelectedBerries.size > 0) {
        const berryName = typeToBerry[pType];
        if (!berryName || !boxSelectedBerries.has(berryName)) return false;
      }

      // 4. 食材細節篩選 (若開啟「僅初始食材」則只比對 Lv.1 食材，否則比對該寶可夢擁有的任何食材)
      if (boxSelectedIngredients.size > 0) {
        const initialIng = p.ing1 || (Array.isArray(p.ingredients) && p.ingredients[0] && (p.ingredients[0].name || p.ingredients[0])) ||
          (base && base.ingredients && base.ingredients[0] && base.ingredients[0].name) || '';

        if (boxOnlyInitialIng) {
          if (!initialIng || !boxSelectedIngredients.has(initialIng)) return false;
        } else {
          const itemIngs = [];
          if (p.ing1) itemIngs.push(p.ing1);
          if (p.ing2) itemIngs.push(p.ing2);
          if (p.ing3) itemIngs.push(p.ing3);
          if (itemIngs.length === 0 && Array.isArray(p.ingredients)) {
            p.ingredients.forEach(i => {
              const name = (typeof i === 'object' && i) ? i.name : i;
              if (name) itemIngs.push(name);
            });
          }
          if (itemIngs.length === 0 && base && Array.isArray(base.ingredients)) {
            base.ingredients.forEach(i => {
              const name = (typeof i === 'object' && i) ? i.name : i;
              if (name) itemIngs.push(name);
            });
          }
          const hasIng = itemIngs.some(ing => boxSelectedIngredients.has(ing));
          if (!hasIng) return false;
        }
      }

      // 5. 技能細節篩選 (多選，支援基礎技能與複合技能自動關聯)
      if (boxSelectedSkills.size > 0) {
        const mainSkill = p.main_skill || (base && base.main_skill) || '';
        let hasMatchedSkill = false;
        for (const targetSkill of boxSelectedSkills) {
          if (checkMatchesSkill(mainSkill, targetSkill)) {
            hasMatchedSkill = true;
            break;
          }
        }
        if (!hasMatchedSkill) return false;
      }

      // 6. 搜尋文字 (中/英/暱稱/性格/副技能/圖鑑編號)
      if (currentSearch) {
        const q = currentSearch.toLowerCase().trim();
        const nameCN = (p.name || (base && base.name_cn) || '').toLowerCase();
        const nameEN = ((base && base.name_en) || '').toLowerCase();
        const nickname = (p.nickname || '').toLowerCase();
        const natureName = (p.nature || '').toLowerCase();
        const subskillStr = (p.subskills || []).join(' ').toLowerCase();
        const dexNo = String(p.pokemonId || (base && base.id) || (base && base.formatted_no) || '').toLowerCase();

        if (!nameCN.includes(q) && !nameEN.includes(q) && !nickname.includes(q) && !natureName.includes(q) && !subskillStr.includes(q) && !dexNo.includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const getPkmDexId = (p) => {
        if (!p) return 99999;
        const base = findPokemonBase(p.pokemonId || p.name);
        if (base) {
          if (base.formatted_no && !isNaN(parseInt(base.formatted_no, 10))) {
            return parseInt(base.formatted_no, 10);
          }
          if (base.id && !isNaN(parseInt(base.id, 10))) {
            return parseInt(base.id, 10);
          }
        }
        if (p.pokemonId && !isNaN(parseInt(p.pokemonId, 10))) {
          return parseInt(p.pokemonId, 10);
        }
        return 99999;
      };

      if (sortBy === 'level-desc') return (b.level || 1) - (a.level || 1);
      if (sortBy === 'level-asc') return (a.level || 1) - (b.level || 1);
      if (sortBy === 'id-desc' || sortBy === 'dex-desc') {
        const idA = getPkmDexId(a);
        const idB = getPkmDexId(b);
        if (idA !== idB) return idB - idA;
        return (b.level || 1) - (a.level || 1);
      }
      if (sortBy === 'created-asc') return (a.createdAt || 0) - (b.createdAt || 0);
      if (sortBy === 'created-desc') return (b.createdAt || 0) - (a.createdAt || 0);
      // Default: 'id-asc' / 'dex-asc' (編號由低到高)
      const idA = getPkmDexId(a);
      const idB = getPkmDexId(b);
      if (idA !== idB) return idA - idB;
      return (b.level || 1) - (a.level || 1);
    });
  }

  let boxUserForcedGuideVisible = false;

  function syncBoxVisibility() {
    if (typeof document === 'undefined') return;
    const hasItems = userBox && userBox.length > 0;
    const dropzone = document.getElementById('box-dropzone');
    const guideCard = document.getElementById('box-screenshot-guide-card');
    const searchFilterRow = typeof document.querySelector === 'function' ? document.querySelector('.search-filter-row') : null;
    const toolbarControlRow = typeof document.querySelector === 'function' ? document.querySelector('.box-toolbar-control-row') : null;
    const toggleGuideBtn = document.getElementById('box-toggle-guide-btn');
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // On desktop, dropzone is div.box-dropzone; on mobile H5, it is button.box-fab-scan
    const isDesktopDropzone = dropzone && !dropzone.classList.contains('box-fab-btn');

    if (hasItems) {
      const showGuide = boxUserForcedGuideVisible;
      if (isDesktopDropzone) {
        dropzone.style.display = showGuide ? '' : 'none';
      }
      if (guideCard) {
        guideCard.style.display = showGuide ? '' : 'none';
      }
      if (toggleGuideBtn) {
        toggleGuideBtn.style.display = '';
        toggleGuideBtn.textContent = showGuide
          ? (isEN ? 'Hide Guide' : '收合指引')
          : (isEN ? 'Screenshot Guide' : '截圖拖曳與指引');
      }
      if (searchFilterRow) searchFilterRow.style.display = '';
      if (toolbarControlRow) toolbarControlRow.style.display = '';
    } else {
      boxUserForcedGuideVisible = false;
      if (isDesktopDropzone) {
        dropzone.style.display = '';
      }
      if (guideCard) {
        guideCard.style.display = '';
      }
      if (toggleGuideBtn) {
        toggleGuideBtn.style.display = 'none';
      }
      if (searchFilterRow) searchFilterRow.style.display = 'none';
      if (toolbarControlRow) toolbarControlRow.style.display = 'none';
    }
  }

  function renderBox() {
    syncBoxVisibility();
    updateBoxActiveFilterBadge();
    const container = document.getElementById('box-content-area');
    if (!container) return;

    try {
      const filtered = getFilteredBox();
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

      if (filtered.length === 0) {
        if (userBox.length === 0) {
          container.innerHTML = `
            <div class="box-simple-empty-state">
              <p class="box-simple-empty-title">${isEN ? 'No Pokémon recorded yet' : '目前尚未登錄任何寶可夢'}</p>
              <p class="box-simple-empty-hint">${isEN ? 'Tap the "Scan OCR" or "Add Pokémon" button at the bottom right to start building your team!' : '請點擊右下角的「截圖辨識」或「手動新增」按鈕開始建立你的幫手隊伍！'}</p>
            </div>
          `;
        } else {
          container.innerHTML = `
            <div class="box-simple-empty-state">
              <p class="box-simple-empty-title">${isEN ? 'No Pokémon matched the filter' : '查無符合條件的寶可夢'}</p>
              <p class="box-simple-empty-hint">${isEN ? 'Try searching different keywords or clearing filters.' : '請嘗試更換搜尋關鍵字或清空篩選條件。'}</p>
            </div>
          `;
        }
        return;
      }

      const isMobileH5 = typeof document !== 'undefined' && (!!document.querySelector('.mobile-h5-app') || (document.body && document.body.classList.contains('mobile-h5-app')));
      if (isMobileH5 || boxViewMode === 'table') {
        renderBoxTable(filtered, container);
      } else {
        renderBoxGrid(filtered, container);
      }
    } catch (err) {
      console.error('Error rendering Box:', err);
      if (typeof window.__renderInPlaceError === 'function') {
        window.__renderInPlaceError('box-content-area', '寶可夢倉庫渲染異常', err);
      }
    }
  }

  function getIngCountFromBase(basePkm, slotIdx, ingName) {
    if (!basePkm || !basePkm.ingredients) {
      return slotIdx === 0 ? 1 : (slotIdx === 1 ? 2 : 4);
    }
    const found = basePkm.ingredients.find(ig => ig.name === ingName);
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

  function renderBoxCardIngSlot(ingName, arg2, arg3, arg4, arg5) {
    let basePkm = arg2;
    let slotIdx = 0;
    let currentLv = undefined;

    if (typeof arg2 === 'string' && typeof arg3 === 'object') {
      basePkm = arg3;
      slotIdx = typeof arg4 === 'number' ? arg4 : 0;
      currentLv = typeof arg5 === 'number' ? arg5 : undefined;
    } else if (typeof arg3 === 'number') {
      basePkm = arg2;
      slotIdx = arg3;
      currentLv = typeof arg4 === 'number' ? arg4 : undefined;
    } else if (typeof arg2 === 'object' && typeof arg3 === 'undefined') {
      basePkm = arg2;
      slotIdx = 0;
    }

    const unlockLv = slotIdx === 0 ? 1 : (slotIdx === 1 ? 30 : 60);
    const isUnlocked = currentLv === undefined || currentLv >= unlockLv;
    const lockClass = !isUnlocked ? ' ing-locked' : '';
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    if (!ingName || ingName === '--') {
      return `
        <div class="box-ing-chip is-empty${lockClass}">
          <span class="box-ing-chip-empty">--</span>
        </div>
      `;
    }
    const displayName = window.I18N ? window.I18N.getIngredientName(ingName) : ingName;
    const iconUrl = (window.I18N && typeof window.I18N.getIngredientIcon === 'function') 
      ? window.I18N.getIngredientIcon(ingName) 
      : '';
    const count = getIngCountFromBase(basePkm, slotIdx, ingName);
    const lockTitleSuffix = !isUnlocked ? (isEN ? ' (Locked)' : ' (未開放)') : '';

    return `
      <div class="box-ing-chip${lockClass}" title="${escapeHtml(displayName)}${lockTitleSuffix}">
        ${iconUrl ? `<img src="${iconUrl}" class="box-ing-chip-icon" alt="${escapeHtml(displayName)}">` : ''}
      </div>
    `;
  }

  function renderBoxTableIngCell(ingName, basePkm, slotIdx, currentLv) {
    const unlockLv = slotIdx === 0 ? 1 : (slotIdx === 1 ? 30 : 60);
    const isUnlocked = currentLv === undefined || currentLv >= unlockLv;
    const lockClass = !isUnlocked ? ' ing-locked' : '';
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    if (!ingName || ingName === '--') {
      return `<td><span class="text-muted${lockClass}" style="font-size:11px;">--</span></td>`;
    }
    const displayName = window.I18N ? window.I18N.getIngredientName(ingName) : ingName;
    const iconUrl = (window.I18N && typeof window.I18N.getIngredientIcon === 'function') 
      ? window.I18N.getIngredientIcon(ingName) 
      : '';
    const count = getIngCountFromBase(basePkm, slotIdx, ingName);
    const lockTitleSuffix = !isUnlocked ? (isEN ? ' (Locked)' : ' (未開放)') : '';

    return `
      <td class="td-ing" title="${escapeHtml(displayName)}${lockTitleSuffix}">
        <div class="ing-cell${lockClass}">
          ${iconUrl ? `<img src="${iconUrl}" class="ing-icon" alt="${escapeHtml(displayName)}">` : ''}
        </div>
      </td>
    `;
  }

  function renderBoxGrid(list, container) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    container.innerHTML = `
      <div class="box-grid">
        ${list.map(p => {
          const base = findPokemonBase(p.pokemonId || p.name);
          const iconUrl = (base && window.getItemIcon) ? window.getItemIcon(base) : (base ? base.icon : '');
          const natureObj = NATURE_DATA.find(n => n.name === p.nature);
          const prInfo = calculatePokemonPR(p, base);
          const pkmDisplayName = isEN ? (base ? (base.name_en || base.name_cn) : p.name) : (p.name || (base ? base.name_cn : '未知'));
          const specName = window.I18N ? window.I18N.getSpecialtyName((base && base.specialty) || p.specialty || '--') : ((base && base.specialty) || p.specialty || '--');
          let specClass = 'spec-ingredient';
          const rawSpec = (base && base.specialty) || p.specialty || '';
          if (rawSpec.includes('樹果') || rawSpec === 'Berries') {
            specClass = 'spec-berry';
          } else if (rawSpec.includes('技能') || rawSpec === 'Skills') {
            specClass = 'spec-skill';
          }
          const natureDisplayName = window.I18N ? window.I18N.getNatureName(p.nature) : p.nature;
          const berry = (window.getPokemonBerry && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : null);
          const berryName = berry ? (window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--')) : '';

          return `
            <div class="box-card" data-uid="${p.uid}">
              <div class="box-card-header">
                <div class="box-card-img-wrap">
                  ${iconUrl ? `<img src="${iconUrl}" alt="${pkmDisplayName}" class="box-card-icon" onerror="this.style.display='none';">` : ''}
                </div>
                <div class="box-card-info">
                  <div class="box-card-name-row">
                    ${boxShowNo ? `<span class="box-card-dex-no" style="font-size:11px;color:var(--text-muted);font-weight:600;margin-right:2px;">No.${base ? (base.formatted_no || base.id) : (p.pokemonId || '')}</span>` : ''}
                    <span class="box-card-name">${escapeHtml(pkmDisplayName)}</span>
                    <span class="box-card-level">Lv.${p.level || 1}</span>
                    <div class="box-card-actions">
                      <button type="button" class="box-action-btn btn-appraise" data-uid="${p.uid}" title="${isEN ? 'Appraisal Report' : '深度診斷報告書與六維雷達圖'}">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                      <button type="button" class="box-action-btn btn-edit" data-uid="${p.uid}" title="${isEN ? 'Edit' : '編輯寶可夢'}">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button type="button" class="box-action-btn btn-delete" data-uid="${p.uid}" title="${isEN ? 'Delete' : '刪除寶可夢'}">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  ${p.nickname ? `<div class="box-card-nickname">${escapeHtml(p.nickname)}</div>` : ''}
                  <div class="box-card-tags">
                    ${berry && berry.icon ? `
                    <span class="pkm-berry-icon-wrapper" title="${berryName}">
                      <img src="${berry.icon}" alt="${berryName}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;">
                    </span>` : ''}
                    ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(base ? base.specialty : p.specialty, 18) : `<span class="box-spec-tag ${specClass}">${specName}</span>`}
                    ${p.ribbon ? `
                      <span class="box-ribbon-tag" title="${isEN ? `Good-Night Ribbon Tier ${p.ribbon}` : `睡飽飽獎章`}">
                        <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${p.ribbon}.png" class="box-ribbon-icon" alt="Ribbon" />
                      </span>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- 食材插槽組合 (精簡單行3個食材並行展示，未解鎖插槽半透明) -->
              <div class="box-card-section box-card-section-ing">
                <div class="box-ing-parallel-row">
                  <span class="box-ing-row-label">${isEN ? 'Ingredients:' : '食材：'}</span>
                  <div class="box-ing-chips-grid">
                    ${renderBoxCardIngSlot(p.ing1, base, 0, p.level || 1)}
                    ${renderBoxCardIngSlot(p.ing2, base, 1, p.level || 1)}
                    ${renderBoxCardIngSlot(p.ing3, base, 2, p.level || 1)}
                  </div>
                </div>
              </div>

              <!-- 副技能清單 (2+2+1 遊戲同款排列，無前置等級標籤，按解鎖狀態呈現) -->
              <div class="box-card-section">
                <div class="box-section-title">${isEN ? 'Sub-Skills' : '副技能組合'}</div>
                <div class="box-subskills-grid">
                  ${[10, 25, 50, 70, 80].map((lv, i) => {
                    const skName = (p.subskills || [])[i];
                    const sk = SUBSKILLS_DATA.find(s => s.name === skName);
                    const tier = sk ? sk.tier : 'empty';
                    const displaySkName = skName ? (window.I18N ? window.I18N.getSubSkillName(skName) : skName) : '--';
                    const isUnlocked = (p.level || 1) >= lv;
                    const lockClass = !isUnlocked ? 'subskill-locked' : '';
                    const titleText = sk 
                      ? (isEN ? `${sk.name_en || sk.name} (Lv.${lv}${!isUnlocked ? ' - Locked' : ''}): ${sk.desc_en || sk.desc}` : `${sk.name} (Lv.${lv}${!isUnlocked ? '未解鎖' : ''}): ${sk.desc}`)
                      : (isEN ? `Slot ${i + 1} (Lv.${lv})` : `第 ${i + 1} 欄位 (Lv.${lv})`);
                    return `
                      <div class="box-subskill-pill subskill-${tier} ${lockClass}" title="${escapeHtml(titleText)}">
                        <span class="subskill-name">${escapeHtml(displaySkName)}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- 性格與修正 (同一行展示，無外框) -->
              <div class="box-card-footer">
                <div class="box-nature-single-row">
                  <span class="box-nature-label">${isEN ? 'Nature:' : '性格：'}</span>
                  <span class="box-nature-name font-bold">${escapeHtml(natureDisplayName || (isEN ? 'Hardy' : '坦率'))}</span>
                  ${natureObj && natureObj.buff ? `
                    <span class="box-nature-effects">
                      ${natureObj.buff !== '無增減' ? `
                        <span class="nature-buff">▲▲ ${isEN ? (natureObj.buff_en || natureObj.buff) : natureObj.buff}</span>
                        <span class="nature-debuff">▼▼ ${isEN ? (natureObj.debuff_en || natureObj.debuff) : natureObj.debuff}</span>
                      ` : `<span class="nature-neutral">${isEN ? 'Neutral' : '無修正'}</span>`}
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    bindCardActions(container);
  }

  function renderBoxTable(list, container) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

    container.innerHTML = `
      <div class="table-container">
        <table class="pokemon-table box-table">
          <thead>
            <tr>
              <th class="th-icon" style="text-align:center;">${t('th.icon', '圖示')}</th>
              <th style="text-align:center;">${t('th.level', '等級')}</th>
              <th style="text-align:center;">${isEN ? 'Name / Nickname' : '寶可夢 / 暱稱'}</th>
              <th class="th-spec" style="text-align:center;">${t('th.specialty', '得意')}</th>
              <th style="text-align:center;">${t('th.berry', '樹果')}</th>
              <th style="text-align:center;">${isEN ? 'Ing 1' : '食1'}</th>
              <th style="text-align:center;">${isEN ? 'Ing 2' : '食2'}</th>
              <th style="text-align:center;">${isEN ? 'Ing 3' : '食3'}</th>
              <th style="text-align:center;">${t('th.actions', '操作')}</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(p => {
              const base = findPokemonBase(p.pokemonId || p.name);
              const iconUrl = (base && window.getItemIcon) ? window.getItemIcon(base) : (base ? base.icon : '');
              const pkmDisplayName = isEN ? (base ? (base.name_en || base.name_cn) : p.name) : (p.name || (base ? base.name_cn : '未知'));
              const specName = window.I18N ? window.I18N.getSpecialtyName((base && base.specialty) || p.specialty || '--') : ((base && base.specialty) || p.specialty || '--');
              let specClass = 'spec-ingredient';
              const rawSpec = (base && base.specialty) || p.specialty || '';
              if (rawSpec.includes('樹果') || rawSpec === 'Berries') {
                specClass = 'spec-berry';
              } else if (rawSpec.includes('技能') || rawSpec === 'Skills') {
                specClass = 'spec-skill';
              }
              const berry = (window.getPokemonBerry && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : null);
              const berryName = berry ? (window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--')) : '';

              return `
                <tr data-uid="${p.uid}">
                  <td class="td-icon" style="text-align:center;">
                    <div class="table-icon-wrapper" style="margin:0 auto;width:34px;height:34px;">
                      ${iconUrl ? `<img src="${iconUrl}" alt="${pkmDisplayName}" class="table-icon" onerror="this.style.display='none';">` : ''}
                    </div>
                  </td>
                  <td style="text-align:center;">
                    <span class="box-table-lvl" style="font-weight:700;">Lv.${p.level || 1}</span>
                  </td>
                  <td style="text-align:center;">
                    <div class="table-name-cn" style="display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap;text-align:center;">
                      ${boxShowNo ? `<span class="box-card-dex-no" style="font-size:11px;color:var(--text-muted);font-weight:600;">No.${base ? (base.formatted_no || base.id) : (p.pokemonId || '')}</span>` : ''}
                      <span style="font-weight:600;">${escapeHtml(pkmDisplayName)}</span>
                    </div>
                    ${p.nickname ? `<div style="font-size:11px;color:var(--accent-color);text-align:center;">${escapeHtml(p.nickname)}</div>` : ''}
                  </td>
                  <td class="td-spec" style="text-align:center;">
                    ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(base ? base.specialty : p.specialty, 20) : `<span class="box-spec-tag ${specClass}">${specName}</span>`}
                  </td>
                  <td style="text-align:center;">
                    ${berry && berry.icon ? `<img src="${berry.icon}" width="22" height="22" class="table-berry-icon" alt="${berryName}" title="${berryName}">` : `<span class="berry-name-text">${berryName || '--'}</span>`}
                  </td>
                  ${renderBoxTableIngCell(p.ing1, base, 0, p.level || 1)}
                  ${renderBoxTableIngCell(p.ing2, base, 1, p.level || 1)}
                  ${renderBoxTableIngCell(p.ing3, base, 2, p.level || 1)}
                  <td style="text-align:center;">
                    <div style="display:flex;gap:6px;justify-content:center;align-items:center;">
                      ${!isMobileH5 ? `
                        <button type="button" class="box-action-btn btn-appraise" data-uid="${p.uid}" title="${isEN ? 'Appraisal Report' : '深度診斷報告'}">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                          </svg>
                        </button>
                        <button type="button" class="box-action-btn btn-edit" data-uid="${p.uid}" title="${isEN ? 'Edit' : '編輯'}">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      ` : ''}
                      <button type="button" class="box-action-btn btn-delete" data-uid="${p.uid}" title="${isEN ? 'Delete' : '刪除'}">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindCardActions(container);
  }

  /* ─── 二次確認刪除彈窗 (Delete Confirmation Modal) ─── */
  function openDeleteConfirmModal(item) {
    if (!item) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const base = findPokemonBase(item.pokemonId || item.name);
    const pkmName = isEN ? (base ? (base.name_en || base.name_cn) : item.name) : (item.name || (base ? base.name_cn : '未知'));
    const displayName = item.nickname ? `${pkmName} (${item.nickname})` : pkmName;
    const iconUrl = (base && window.getItemIcon) ? window.getItemIcon(base) : (base ? base.icon : '');

    let modal = document.getElementById('box-delete-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'box-delete-confirm-modal';
      modal.className = 'box-modal-backdrop modal-overlay';
      modal.style.zIndex = '10050';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="box-modal-dialog" style="max-width:360px;width:90%;border-radius:16px;padding:22px 20px;text-align:center;box-sizing:border-box;margin:auto;background:var(--bg-card-solid);border:1px solid var(--border-color);box-shadow:var(--shadow-lg);">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(239, 68, 68, 0.15);border:1.5px solid rgba(239, 68, 68, 0.35);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#ef4444;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>
        <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
          ${isEN ? 'Delete Pokémon?' : '確認刪除寶可夢？'}
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:8px 0 14px;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid var(--border-color-subtle, rgba(255,255,255,0.08));">
          ${iconUrl ? `<img src="${iconUrl}" width="32" height="32" style="border-radius:4px;object-fit:contain;" alt="">` : ''}
          <div style="text-align:left;">
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);">${escapeHtml(displayName)}</div>
            <div style="font-size:11px;color:var(--text-muted);font-weight:600;">Lv.${item.level || 1}</div>
          </div>
        </div>
        <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.5;margin:0 0 20px;">
          ${isEN 
            ? 'Are you sure you want to delete this Pokémon from your Box? This action cannot be undone.' 
            : '確定要將此隻寶可夢從倉庫中永久刪除嗎？刪除後將無法還原。'}
        </p>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button type="button" id="box-delete-cancel-btn" style="flex:1;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:600;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-secondary);cursor:pointer;">
            ${isEN ? 'Cancel' : '取消'}
          </button>
          <button type="button" id="box-delete-confirm-btn" style="flex:1;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:700;background:#ef4444;border:none;color:#ffffff;cursor:pointer;">
            ${isEN ? 'Confirm Delete' : '確認刪除'}
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.body.classList.add('modal-open');

    function closeModal() {
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }

    const cancelBtn = modal.querySelector('#box-delete-cancel-btn');
    if (cancelBtn) cancelBtn.onclick = closeModal;

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    const confirmBtn = modal.querySelector('#box-delete-confirm-btn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        userBox = userBox.filter(p => p.uid !== item.uid);
        saveUserBox();
        renderBox();
        closeModal();
        if (typeof showToast === 'function') {
          showToast(isEN ? `Deleted ${displayName}` : `已刪除「${displayName}」`);
        }
      };
    }
  }
  if (typeof window !== 'undefined') {
    window.openDeleteConfirmModal = openDeleteConfirmModal;
  }

  function bindCardActions(container) {
    container.querySelectorAll('.btn-appraise').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uid = btn.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item && window.AppraisalLab) {
          const base = findPokemonBase(item.pokemonId || item.name);
          const prInfo = calculatePokemonPR(item, base);
          window.AppraisalLab.openModal({
            pkm: base,
            level: item.level || 30,
            nature: item.nature || '坦率',
            subskills: item.subskills || [],
            ingredients: [item.ing1, item.ing2, item.ing3],
            ribbon: item.ribbon || 0,
            nickname: item.nickname || '',
            summaryNote: (prInfo && prInfo.summaryNote) || '',
            rawItem: item
          });
        }
      });
    });

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uid = btn.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item) openBoxEditModal(item);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uid = btn.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item) {
          openDeleteConfirmModal(item);
        }
      });
    });

    // 點擊表格整行開啟寶可夢深度診斷評測彈窗
    container.querySelectorAll('.box-table tbody tr[data-uid]').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', (e) => {
        if (e.target.closest('.box-action-btn') || e.target.closest('button')) return;
        const uid = row.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item && window.AppraisalLab) {
          if (typeof window.AppraisalLab.loadBoxItem === 'function') {
            window.AppraisalLab.loadBoxItem(item);
          }
          const base = findPokemonBase(item.pokemonId || item.name);
          const prInfo = calculatePokemonPR(item, base);
          window.AppraisalLab.openModal({
            pkm: base,
            level: item.level || 30,
            nature: item.nature || '坦率',
            subskills: item.subskills || [],
            ingredients: [item.ing1, item.ing2, item.ing3],
            ribbon: item.ribbon || 0,
            nickname: item.nickname || '',
            summaryNote: (prInfo && prInfo.summaryNote) || '',
            rawItem: item
          });
        }
      });
    });

    // 點擊卡片開啟寶可夢深度診斷評測彈窗
    container.querySelectorAll('.box-card[data-uid]').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('.box-card-actions') || e.target.closest('button')) return;
        const uid = card.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item && window.AppraisalLab) {
          if (typeof window.AppraisalLab.loadBoxItem === 'function') {
            window.AppraisalLab.loadBoxItem(item);
          }
          const base = findPokemonBase(item.pokemonId || item.name);
          const prInfo = calculatePokemonPR(item, base);
          window.AppraisalLab.openModal({
            pkm: base,
            level: item.level || 30,
            nature: item.nature || '坦率',
            subskills: item.subskills || [],
            ingredients: [item.ing1, item.ing2, item.ing3],
            ribbon: item.ribbon || 0,
            nickname: item.nickname || '',
            summaryNote: (prInfo && prInfo.summaryNote) || '',
            rawItem: item
          });
        }
      });
    });
  }

  /* ─── 視覺化確認與編輯彈窗 ───────────────────────────────── */
  let activeSubskillSlot = 1; // 1 to 5

  /* ─── 睡飽飽獎章動態效果選單更新 (依據寶可夢進化形態不同動態調整) ── */
  function updateRibbonSelectOptions(p) {
    const ribbonSelect = document.getElementById('modal-poke-ribbon');
    if (!ribbonSelect) return;

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // 計算剩餘進化次數
    let remainingEvos = 0;
    if (p) {
      if (typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRemainingEvolutions === 'function') {
        remainingEvos = window.AppraisalLab.getRemainingEvolutions(p);
      } else {
        const isFinal = p.is_final === '〇' || p.is_final === 'O' || p.is_final === 'o' || p.is_final === true || p.is_final === '1';
        remainingEvos = isFinal ? 0 : 1;
      }
    }

    // 記住當前選取值
    const currentVal = ribbonSelect.value || '0';

    const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
    let opt2Text = '';
    let opt3Text = isEN ? '1000 hrs (+6 Carry Limit)' : '1000 小時 (+6 持有上限)';
    let opt4Text = '';

    if (!p) {
      // 未選擇寶可夢時的通用預設文案
      opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed Boost)' : '500 小時 (+3 持有上限 · 幫速加成)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Max Speed Boost)' : '2000 小時 (+8 持有上限 · 幫速最大加成)';
    } else if (remainingEvos === 2) {
      // 尚可進化 2 次 (例如：小火龍、小貓怪、皮丘)
      opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed -11%)' : '500 小時 (+3 持有上限 · 幫速加成 -11%)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Speed -25%)' : '2000 小時 (+8 持有上限 · 幫速最大加成 -25%)';
    } else if (remainingEvos === 1) {
      // 尚可進化 1 次 (例如：火恐龍、勒克貓、皮卡丘、伊布)
      opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed -5%)' : '500 小時 (+3 持有上限 · 幫速加成 -5%)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Speed -12%)' : '2000 小時 (+8 持有上限 · 幫速最大加成 -12%)';
    } else {
      // 最終進化形或無法進化的寶可夢 (例如：噴火龍、倫琴貓、凱羅斯) -> 無幫速加成
      opt2Text = isEN ? '500 hrs (+3 Carry Limit)' : '500 小時 (+3 持有上限)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit)' : '2000 小時 (+8 持有上限)';
    }

    const optionsData = [
      { val: '0', text: isEN ? 'None (0h)' : '未佩戴 (0h)', icon: '' },
      { val: '1', text: isEN ? '200 hrs (+1 Carry Limit)' : '200 小時 (+1 持有上限)', icon: `${base}assets/ribbons/ribbon_lv1.png` },
      { val: '2', text: opt2Text, icon: `${base}assets/ribbons/ribbon_lv2.png` },
      { val: '3', text: opt3Text, icon: `${base}assets/ribbons/ribbon_lv3.png` },
      { val: '4', text: opt4Text, icon: `${base}assets/ribbons/ribbon_lv4.png` }
    ];

    ribbonSelect.innerHTML = optionsData.map(o => `
      <option value="${o.val}" ${o.icon ? `data-icon="${o.icon}"` : ''} ${o.val === currentVal ? 'selected' : ''}>${o.text}</option>
    `).join('');

    ribbonSelect.value = currentVal;

    // 同步自訂下拉元件
    if (typeof window.setupCustomSelect === 'function' && !ribbonSelect._customized) {
      window.setupCustomSelect(ribbonSelect);
    } else if (ribbonSelect._customized) {
      ribbonSelect.dispatchEvent(new Event('sync-ui'));
    }
  }

  /* ─── 取得主技能的最大等級上限 (6 / 7 / 8) ─────────────────── */
  function getMainSkillMaxLevel(name) {
    if (!name) return 7;
    const clean = String(name).trim();

    // 1. 夢之碎片系列（夢之碎片獲取S、波導彈）：官方上限 Lv. 8
    if (clean.includes('夢之碎片') || clean.includes('波導彈') || clean.includes('Dream Shard') || clean.includes('Aura Sphere')) {
      return 8;
    }

    // 2. 能量填充 / 蓄力 / 夢魘 系列：官方上限 Lv. 7
    if (clean.includes('能量填充') || clean.includes('Charge Strength') || clean.includes('蓄力') || clean.includes('夢魘')) {
      return 7;
    }

    // 3. 食材系列（獲取、精選、怪力鉗、超幸運、正電、禮物）：官方上限 Lv. 7
    if (clean.includes('食材獲取') || clean.includes('食材精選') || clean.includes('Ingredient') || clean.includes('怪力钳') || clean.includes('超幸運') || clean.includes('正電') || clean.includes('禮物')) {
      return 7;
    }

    // 4. 料理鍋系列：料理強化為 Lv. 7，料理成功為 Lv. 6
    if (clean.includes('料理強化') || clean.includes('Cooking Power') || clean.includes('負電')) {
      return 7;
    }
    if (clean.includes('料理成功') || clean.includes('Extra Tasty')) {
      return 6;
    }

    // 5. 幫手系列：幫手支援為 Lv. 7，幫手加速（屬性）為 Lv. 6
    if (clean.includes('幫手支援') || clean.includes('Helper Support')) {
      return 7;
    }
    if (clean.includes('幫手加速') || clean.includes('Helper Boost')) {
      return 6;
    }

    // 6. 樹果遽增系列 / 領域系列：官方上限 Lv. 6
    if (clean.includes('樹果遽增') || clean.includes('Berry Burst') || clean.includes('畫皮') || clean.includes('流星群') || clean.includes('精神擊破') || clean.includes('樹果領域') || clean.includes('Psystrike')) {
      return 6;
    }

    // 7. 活力恢復系列（全體療癒、活力療癒、活力填充/充填、月光、新月祈禱、蹭蹭臉頰、治癒波動、樹果汁）：官方上限 Lv. 6
    if (clean.includes('活力') || clean.includes('療癒') || clean.includes('充填') || clean.includes('月光') || clean.includes('新月祈禱') || clean.includes('蹭蹭臉頰') || clean.includes('治癒波動') || clean.includes('樹果汁') || clean.includes('Energizing Cheer') || clean.includes('Energy for Everyone') || clean.includes('Charge Energy')) {
      return 6;
    }

    // 8. 料理輔助 / 揮指 / 變身 / 模仿：官方上限 Lv. 7
    if (clean.includes('料理輔助') || clean.includes('健美') || clean.includes('Bulk Up') || clean.includes('揮指') || clean.includes('十項全能') || clean.includes('Metronome') || clean.includes('變身') || clean.includes('模仿') || clean.includes('Transform') || clean.includes('Mimic')) {
      return 7;
    }

    // 9. 從 window.WikiDB 動態比對
    if (typeof window !== 'undefined' && window.WikiDB && Array.isArray(window.WikiDB.MAIN_SKILLS_DATA)) {
      const norm = clean.replace(/[（(].*?[）)]/, '').replace(/\s+/g, '');
      const found = window.WikiDB.MAIN_SKILLS_DATA.find(s => s.name.replace(/[（(].*?[）)]/, '').replace(/\s+/g, '') === norm);
      if (found && found.maxLevel) return found.maxLevel;
    }

    return 7;
  }

  /* ─── 最終階段 3 階進化形態清單 (進化兩次，基礎主技能 +2) ─────── */
  const STAGE3_FINAL_NAMES = new Set([
    '妙蛙花', '噴火龍', '水箭龜', '巴大蝶', '雷丘', '皮可西', '胖可丁',
    '大食花', '隆隆岩', '耿鬼', '自爆磁怪', '幸福蛋', '波克基斯', '電龍',
    '快龍', '火爆獸', '大力鱷', '班基拉斯', '蜥蜴王', '火焰雞', '巨沼怪',
    '沙奈朵', '艾路雷朵', '請假王', '波士可多拉', '沙漠蜻蜓', '帝牙海獅',
    '暴飛龍', '土台龜', '烈焰猴', '帝王拿波', '倫琴貓', '鍬農炮蟲',
    '魔幻假面喵', '骨紋巨聲鱷', '狂歡浪舞鴨', '巴布土撥', '巨鍛匠',
    'Venusaur', 'Charizard', 'Blastoise', 'Butterfree', 'Raichu', 'Clefable', 'Wigglytuff',
    'Victreebel', 'Golem', 'Gengar', 'Magnezone', 'Blissey', 'Togekiss', 'Ampharos',
    'Dragonite', 'Typhlosion', 'Feraligatr', 'Tyranitar', 'Sceptile', 'Blaziken', 'Swampert',
    'Gardevoir', 'Gallade', 'Slaking', 'Aggron', 'Flygon', 'Walrein',
    'Salamence', 'Torterra', 'Infernape', 'Empoleon', 'Luxray', 'Vikavolt',
    'Meowscarada', 'Skeledirge', 'Quaquaval', 'Pawmot', 'Tinkaton'
  ]);

  /* ─── 取得寶可夢的進化階段 (1 基礎 / 2 一階進化 / 3 二階最終進化) ─── */
  function getPokemonEvolutionStage(pkm) {
    if (!pkm) return 1;
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || (pkm.name && pkm.name.en) || '';
    if (STAGE3_FINAL_NAMES.has(name)) return 3;
    if (pkm.evo_req && String(pkm.evo_req).trim()) {
      return 2;
    }
    return 1;
  }

  /* ─── 取得已解鎖副技能的主技能等級加成 (技能等級提升S/M) ────────── */
  function getSubskillLevelBonus(subskills, currentLv) {
    if (!Array.isArray(subskills) || subskills.length === 0) return 0;
    const thresholds = [10, 25, 50, 70, 80];
    let bonus = 0;
    subskills.forEach((sub, idx) => {
      const unlockLv = thresholds[idx] || 100;
      if ((currentLv || 1) >= unlockLv) {
        const name = typeof sub === 'string' ? sub : (sub && (sub.name || sub.name_cn) ? (sub.name || sub.name_cn) : '');
        if (name.includes('技能等級提升M') || name.includes('Skill Level Up M')) {
          bonus += 2;
        } else if (name.includes('技能等級提升S') || name.includes('Skill Level Up S')) {
          bonus += 1;
        }
      }
    });
    return bonus;
  }

  /* ─── 計算實際有效主技能等級 (結合進化次數基礎、副技能解鎖加成與自訂上限) ── */
  function getEffectiveSkillLevel(pkmOrBoxItem, basePkm) {
    const pkm = pkmOrBoxItem || {};
    const base = basePkm || (typeof findPokemonBase === 'function' ? findPokemonBase(pkm.name || pkm.name_cn || pkm.pokemonId) : null) || pkm;
    const currentLv = parseInt(pkm.level, 10) || 30;
    const stage = getPokemonEvolutionStage(base);
    const subskills = pkm.subskills || [];
    const subBonus = getSubskillLevelBonus(subskills, currentLv);
    const naturalLvl = stage + subBonus;

    const savedLvl = parseInt(pkm.skillLevel || pkm.skill_level || (pkm.rawItem && pkm.rawItem.skillLevel), 10);
    let effective = (!isNaN(savedLvl) && savedLvl > 0) ? savedLvl : naturalLvl;

    const maxLvl = base && base.main_skill ? getMainSkillMaxLevel(base.main_skill) : 8;
    return Math.min(maxLvl, Math.max(1, effective));
  }

  /* ─── 主技能展示與等級更新 (動態依技能上限調整 Lv.1 ~ Lv.max) ─── */
  function updateModalMainSkill(p, targetLevel = null) {
    const skillEl = document.getElementById('modal-poke-main-skill-name');
    const skillLevelSelect = document.getElementById('modal-poke-skill-level');

    const skillName = p ? (p.main_skill || '--') : '--';
    if (skillEl) {
      const displaySkillName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getSkillName === 'function') 
        ? window.I18N.getSkillName(skillName) 
        : skillName;
      skillEl.textContent = displaySkillName;
      skillEl.setAttribute('title', skillName);
    }

    if (skillLevelSelect) {
      const maxLvl = p && p.main_skill ? getMainSkillMaxLevel(p.main_skill) : 7;
      let desiredLvl;
      if (targetLevel != null) {
        desiredLvl = parseInt(targetLevel, 10);
      } else {
        const cur = parseInt(skillLevelSelect.value, 10);
        if (!isNaN(cur) && cur > 0) {
          desiredLvl = cur;
        } else if (p) {
          desiredLvl = getEffectiveSkillLevel({ level: 30, subskills: [] }, p);
        } else {
          desiredLvl = 1;
        }
      }
      const clampedLvl = Math.max(1, Math.min(maxLvl, desiredLvl));

      // 動態更新下拉選單選項至該主技能之最大上限 (Lv.1 ~ Lv.maxLvl)
      const options = [];
      for (let i = 1; i <= maxLvl; i++) {
        options.push(`<option value="${i}" ${i === clampedLvl ? 'selected' : ''}>Lv. ${i}</option>`);
      }
      skillLevelSelect.innerHTML = options.join('');
      skillLevelSelect.value = String(clampedLvl);

      // 同步自訂下拉元件
      if (typeof window !== 'undefined' && typeof window.setupCustomSelect === 'function' && !skillLevelSelect._customized) {
        window.setupCustomSelect(skillLevelSelect);
      } else if (skillLevelSelect._customized) {
        skillLevelSelect.dispatchEvent(new Event('sync-ui'));
      }
    }
  }

  /* ─── 寶可夢名稱 Combobox 搜尋選擇器 ───────────────────────── */
  function initPokemonCombobox(existingItem = null) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const searchInput = document.getElementById('modal-poke-search');
    const nameHidden = document.getElementById('modal-poke-name');
    const dropdown = document.getElementById('box-pkm-dropdown');
    const toggleBtn = document.getElementById('box-pkm-dropdown-toggle');
    if (!searchInput || !nameHidden || !dropdown) return;

    const CHEVRON_ICON = `<svg viewBox="0 0 12 8" width="8" height="5"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1 1.5L6 6.5L11 1.5"/></svg>`;
    const CLEAR_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    function syncToggleBtnIcon() {
      if (!toggleBtn) return;
      const hasText = !!(searchInput.value && searchInput.value.trim().length > 0);
      if (hasText) {
        toggleBtn.innerHTML = CLEAR_ICON;
        toggleBtn.title = isEN ? 'Clear selection' : '清除已選寶可夢';
        toggleBtn.setAttribute('aria-label', isEN ? 'Clear selection' : '清除已選寶可夢');
      } else {
        toggleBtn.innerHTML = CHEVRON_ICON;
        toggleBtn.title = isEN ? 'Expand list' : '展開寶可夢列表';
        toggleBtn.setAttribute('aria-label', isEN ? 'Expand list' : '展開寶可夢列表');
      }
    }

    const initialPkm = existingItem
      ? allPokemonsRef.find(p => p.id === existingItem.pokemonId || p.name_cn === existingItem.name)
      : null;

    function renderDropdown(filterText = '') {
      const q = (filterText || '').trim().toLowerCase();
      let matchedItems = [];

      const numMatch = q.match(/^(?:#|no\.?\s*)?(\d+)$/i);
      const isNumQuery = !!numMatch;
      const qDigits = numMatch ? numMatch[1] : '';
      const qNoZero = qDigits.replace(/^0+/, '');

      if (!q) {
        matchedItems = allPokemonsRef.slice();
      } else if (isNumQuery && qDigits) {
        // 純數字編號智能查找：只要編號有任何符合 (包含 formatted_no, id, 無前導零) 全部列出
        allPokemonsRef.forEach(p => {
          const fNo = String(p.formatted_no || '');
          const idStr = String(p.id || '');
          const cleanNo = fNo.replace(/^0+/, '');
          const pad4 = fNo.padStart(4, '0');

          let rank = 0;
          if (idStr === qDigits || cleanNo === qDigits || (qNoZero && cleanNo === qNoZero) || fNo === qDigits || pad4 === qDigits) {
            rank = 1; // 完全精確比對，最優先展示
          } else if ((qNoZero && cleanNo.startsWith(qNoZero)) || cleanNo.startsWith(qDigits) || fNo.startsWith(qDigits)) {
            rank = 2; // 前綴符合 (例如輸入 40 時，400, 403, 404, 405 優先展示)
          } else if (fNo.includes(qDigits) || idStr.includes(qDigits) || cleanNo.includes(qDigits) || pad4.includes(qDigits) || (qNoZero && idStr.includes(qNoZero))) {
            rank = 3; // 包含符合 (例如輸入 40 時，140, 240, 340 也列出供挑選)
          } else if (typeof window.matchesPokemonSearch === 'function' && window.matchesPokemonSearch(p, q)) {
            rank = 4; // 名稱或同音錯字符合
          }

          if (rank > 0) {
            matchedItems.push({ p, rank });
          }
        });

        matchedItems.sort((a, b) => {
          if (a.rank !== b.rank) return a.rank - b.rank;
          const noA = parseInt(a.p.id || a.p.formatted_no, 10) || 0;
          const noB = parseInt(b.p.id || b.p.formatted_no, 10) || 0;
          return noA - noB;
        });

        matchedItems = matchedItems.map(item => item.p);
      } else {
        matchedItems = allPokemonsRef.filter(p => {
          if (typeof window.matchesPokemonSearch === 'function') {
            return window.matchesPokemonSearch(p, q);
          }
          const cn = (p.name_cn || '').toLowerCase();
          const en = (p.name_en || '').toLowerCase();
          return cn.includes(q) || en.includes(q);
        });
      }

      renderFilteredItems(matchedItems);
    }

    if (typeof window !== 'undefined') {
      window._boxRenderDropdown = renderDropdown;
    }

    function renderFilteredItems(items) {
      if (items.length === 0) {
        dropdown.innerHTML = `<div class="text-muted" style="padding: 12px; text-align: center; font-size: 12px;">${isEN ? 'No matching Pokémon' : '找不到符合之寶可夢'}</div>`;
        dropdown.style.display = 'block';
        return;
      }

      dropdown.innerHTML = items.map(p => {
        const pkmDisplayName = isEN ? (p.name_en || p.name_cn) : p.name_cn;
        const isSelected = nameHidden.value === p.name_cn;
        const avatarUrl = p.icon_url || p.icon || (p.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png` : '') || 'assets/placeholder.svg';

        return `
          <div class="box-pkm-dropdown-item ${isSelected ? 'active' : ''}" data-id="${p.id}" data-name="${escapeHtml(p.name_cn)}">
            <img src="${avatarUrl}" class="box-pkm-dropdown-avatar" alt="${escapeHtml(pkmDisplayName)}" loading="lazy" onerror="this.src='https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png'">
            <div class="box-pkm-dropdown-info">
              <div class="box-pkm-dropdown-name">
                <span>No.${p.formatted_no} ${escapeHtml(pkmDisplayName)}</span>
              </div>
            </div>
            ${isSelected ? '<span style="color:var(--accent-blue);font-weight:bold;font-size:12px;">✓</span>' : ''}
          </div>
        `;
      }).join('');

      dropdown.querySelectorAll('.box-pkm-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const pName = item.getAttribute('data-name');
          const found = allPokemonsRef.find(p => p.name_cn === pName);
          if (found) {
            selectPokemonInCombobox(found, true);
          }
        });
      });

      dropdown.style.display = 'block';
    }

    const POKEBALL_PLACEHOLDER_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='18' fill='%23334155' stroke='%2364748b' stroke-width='2'/><path d='M2 20h36' stroke='%2364748b' stroke-width='2'/><circle cx='20' cy='20' r='6' fill='%231e293b' stroke='%2364748b' stroke-width='2'/><circle cx='20' cy='20' r='2.5' fill='%2394a3b8'/></svg>";

    function updateSelectedPokemonAvatar(p) {
      const avatarImg = document.getElementById('modal-poke-selected-avatar');
      if (!avatarImg) return;
      if (p) {
        const avatarUrl = p.icon_url || p.icon || (p.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png` : '') || POKEBALL_PLACEHOLDER_SVG;
        avatarImg.src = avatarUrl;
        avatarImg.alt = p.name_cn || 'Pokémon';
        avatarImg.onerror = () => {
          avatarImg.src = POKEBALL_PLACEHOLDER_SVG;
        };
      } else {
        avatarImg.src = POKEBALL_PLACEHOLDER_SVG;
        avatarImg.alt = 'Pokémon';
      }
    }

    function selectPokemonInCombobox(p, userChanged = false, existing = null) {
      if (!p) return;
      nameHidden.value = p.name_cn;
      const pkmDisplayName = isEN ? (p.name_en || p.name_cn) : p.name_cn;
      searchInput.value = `No.${p.formatted_no} ${pkmDisplayName}`;
      dropdown.style.display = 'none';
      updateSelectedPokemonAvatar(p);
      syncToggleBtnIcon();
      renderTiledIngredientPickers(p, existing);
      let defLvl = null;
      if (existing && existing.skillLevel != null) {
        defLvl = getEffectiveSkillLevel(existing, p);
      } else if (p) {
        const currentLevelInput = document.getElementById('modal-poke-level');
        const curLv = parseInt(currentLevelInput ? currentLevelInput.value : '', 10) || 30;
        defLvl = getEffectiveSkillLevel({ level: curLv, subskills: [] }, p);
      }
      updateRibbonSelectOptions(p);
      updateModalMainSkill(p, defLvl);
    }

    if (initialPkm) {
      selectPokemonInCombobox(initialPkm, false, existingItem);
    } else {
      nameHidden.value = '';
      searchInput.value = '';
      updateSelectedPokemonAvatar(null);
      syncToggleBtnIcon();
      renderTiledIngredientPickers(null, null);
      updateRibbonSelectOptions(null);
      updateModalMainSkill(null);
    }

    searchInput.onfocus = () => {
      renderDropdown(searchInput.value.replace(/^No\.\d+\s*/, ''));
    };

    searchInput.oninput = () => {
      syncToggleBtnIcon();
      if (!searchInput.value.trim()) {
        nameHidden.value = '';
        updateSelectedPokemonAvatar(null);
        renderTiledIngredientPickers(null, null);
        updateRibbonSelectOptions(null);
        updateModalMainSkill(null);
      }
      renderDropdown(searchInput.value);
    };

    if (toggleBtn) {
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        const hasText = !!(searchInput.value && searchInput.value.trim().length > 0);
        if (hasText) {
          searchInput.value = '';
          nameHidden.value = '';
          updateSelectedPokemonAvatar(null);
          syncToggleBtnIcon();
          renderTiledIngredientPickers(null, null);
          updateRibbonSelectOptions(null);
          updateModalMainSkill(null);
          renderDropdown('');
          searchInput.focus();
        } else {
          if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
          } else {
            renderDropdown('');
            searchInput.focus();
          }
        }
      };
    }

    // 點擊外面關閉下拉選單
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#box-pkm-combobox')) {
        dropdown.style.display = 'none';
      }
    });
  }

  /* ─── 解鎖食材組合平鋪選擇器 (符合官方解鎖規則：Lv.1=A, Lv.30=A/B, Lv.60=A/B/C) ── */
  function renderTiledIngredientPickers(basePkm, existingItem = null) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const slots = [
      { key: 'ing1', level: 1, containerId: 'modal-ing-options-1' },
      { key: 'ing2', level: 30, containerId: 'modal-ing-options-2' },
      { key: 'ing3', level: 60, containerId: 'modal-ing-options-3' }
    ];

    if (!basePkm) {
      slots.forEach(slot => {
        const hiddenInput = document.getElementById(`modal-${slot.key}`);
        const container = document.getElementById(slot.containerId);
        if (hiddenInput) hiddenInput.value = '';
        if (container) container.innerHTML = `<span class="box-ing-placeholder-slot">--</span>`;
      });
      return;
    }

    const ingList = (basePkm && basePkm.ingredients && basePkm.ingredients.length > 0)
      ? basePkm.ingredients
      : [{ name: '特選蘋果' }, { name: '暖暖薑' }, { name: '美味尾巴' }];

    const ingA = ingList[0] || { name: '特選蘋果' };
    const ingB = ingList[1] || ingA;
    const ingC = ingList[2] || ingB || ingA;

    // 依照遊戲規則建立各等級可選食材庫
    const rawLv30 = [ingA, ingB];
    const uniqueLv30 = Array.from(new Set(rawLv30.map(i => i.name))).map(n => rawLv30.find(i => i.name === n));

    const rawLv60 = [ingA, ingB, ingC];
    const uniqueLv60 = Array.from(new Set(rawLv60.map(i => i.name))).map(n => rawLv60.find(i => i.name === n));

    const slotConfigs = [
      {
        key: 'ing1',
        level: 1,
        containerId: 'modal-ing-options-1',
        allowed: [ingA],
        defaultVal: (existingItem && existingItem.ing1) || ingA.name // 預設食材 A
      },
      {
        key: 'ing2',
        level: 30,
        containerId: 'modal-ing-options-2',
        allowed: uniqueLv30,
        defaultVal: (existingItem && existingItem.ing2) || ingA.name // 預設食材 A
      },
      {
        key: 'ing3',
        level: 60,
        containerId: 'modal-ing-options-3',
        allowed: uniqueLv60,
        defaultVal: (existingItem && existingItem.ing3) || ingA.name // 預設食材 A
      }
    ];

    slotConfigs.forEach(slot => {
      const hiddenInput = document.getElementById(`modal-${slot.key}`);
      const container = document.getElementById(slot.containerId);
      if (!hiddenInput || !container) return;

      // 檢查 defaultVal 是否在允許列表中
      const isDefaultValid = slot.allowed.some(i => i.name === slot.defaultVal);
      hiddenInput.value = isDefaultValid ? slot.defaultVal : slot.allowed[0].name;

      container.innerHTML = slot.allowed.map(ing => {
        const isSelected = hiddenInput.value === ing.name;
        const ingDisplayName = window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
        const iconUrl = ing.icon || (window.I18N && window.I18N.getIngredientIcon(ing.name)) || '';

        return `
          <button type="button" class="box-ing-opt-btn ${isSelected ? 'active' : ''}" data-slot="${slot.key}" data-ing="${escapeHtml(ing.name)}" title="${escapeHtml(ingDisplayName)}" aria-label="${escapeHtml(ingDisplayName)}">
            <img src="${iconUrl}" class="box-ing-opt-icon" alt="${escapeHtml(ingDisplayName)}" loading="lazy">
          </button>
        `;
      }).join('');

      container.querySelectorAll('.box-ing-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const ingName = btn.getAttribute('data-ing');
          hiddenInput.value = ingName;
          container.querySelectorAll('.box-ing-opt-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    });
  }

  /* ─── 單行 5 階副技能插槽 + 平鋪副技能選擇盤 ──────────────────── */
  function initSubskillFlowPicker(initialSubskills = []) {
    activeSubskillSlot = 1;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    for (let slot = 1; slot <= 5; slot++) {
      const hiddenInput = document.getElementById(`modal-subskill-${slot}`);
      if (hiddenInput) {
        hiddenInput.value = (initialSubskills && initialSubskills[slot - 1]) || '';
      }
    }

    function updateSubskillUI() {
      // 1. 更新 5 個插槽按鈕
      const slotBtns = document.querySelectorAll('.box-subskill-slot-btn');
      slotBtns.forEach(btn => {
        const slot = parseInt(btn.getAttribute('data-slot'), 10);
        const hiddenInput = document.getElementById(`modal-subskill-${slot}`);
        const curVal = hiddenInput ? hiddenInput.value : '';
        const valBadge = btn.querySelector('.slot-val-badge');

        if (slot === activeSubskillSlot) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }

        if (valBadge) {
          if (!curVal) {
            valBadge.className = 'slot-val-badge slot-val-empty';
            valBadge.textContent = isEN ? '-- None --' : '-- 未解鎖 --';
          } else {
            const sk = SUBSKILLS_DATA.find(s => s.name === curVal);
            const tier = sk ? sk.tier : 'white';
            const skDisplayName = window.I18N ? window.I18N.getSubSkillName(curVal) : curVal;
            valBadge.className = `slot-val-badge box-subskill-pill subskill-${tier}`;
            valBadge.textContent = skDisplayName;
          }
        }
      });

      // 2. 獲取所有目前已被使用的副技能
      const usedSkills = new Set();
      for (let slot = 1; slot <= 5; slot++) {
        const input = document.getElementById(`modal-subskill-${slot}`);
        if (input && input.value) usedSkills.add(input.value);
      }

      // 3. 渲染平鋪副技能晶片
      ['gold', 'blue', 'white'].forEach(tier => {
        const container = document.getElementById(`subskill-chips-${tier}`);
        if (!container) return;

        const skillsInTier = SUBSKILLS_DATA.filter(s => s.tier === tier);
        container.innerHTML = skillsInTier.map(sk => {
          const skDisplayName = window.I18N ? window.I18N.getSubSkillName(sk.name) : sk.name;
          const isUsed = usedSkills.has(sk.name);
          return `
            <button type="button" class="box-subskill-chip subskill-${tier} ${isUsed ? 'in-use' : ''}" data-name="${escapeHtml(sk.name)}" ${isUsed ? 'disabled' : ''} title="${escapeHtml(skDisplayName)}${isUsed ? (isEN ? ' (Already Selected)' : '（已選用）') : ''}">
              <span>${escapeHtml(skDisplayName)}</span>
              ${isUsed ? '<span style="font-size:10px;opacity:0.8;">✓</span>' : ''}
            </button>
          `;
        }).join('');

        container.querySelectorAll('.box-subskill-chip').forEach(chip => {
          chip.addEventListener('click', (e) => {
            e.preventDefault();
            if (chip.disabled || chip.classList.contains('in-use')) return;
            const skName = chip.getAttribute('data-name');
            const targetInput = document.getElementById(`modal-subskill-${activeSubskillSlot}`);
            if (targetInput) {
              targetInput.value = skName;
            }
            // 自動推進到下一個未選取的插槽
            let nextEmptySlot = -1;
            for (let s = 1; s <= 5; s++) {
              const inp = document.getElementById(`modal-subskill-${s}`);
              if (inp && !inp.value) {
                nextEmptySlot = s;
                break;
              }
            }
            if (nextEmptySlot !== -1) {
              activeSubskillSlot = nextEmptySlot;
            } else if (activeSubskillSlot < 5) {
              activeSubskillSlot += 1;
            } else {
              activeSubskillSlot = 1;
            }
            updateSubskillUI();
          });
        });
      });
    }

    // 綁定插槽按鈕點擊
    document.querySelectorAll('.box-subskill-slot-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const slot = parseInt(btn.getAttribute('data-slot'), 10);
        activeSubskillSlot = slot;
        updateSubskillUI();
      };
    });

    // 綁定清空全部副技能按鈕
    const clearBtn = document.getElementById('box-subskill-clear-all-btn') || document.getElementById('box-subskill-clear-active-btn');
    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.preventDefault();
        for (let slot = 1; slot <= 5; slot++) {
          const targetInput = document.getElementById(`modal-subskill-${slot}`);
          if (targetInput) {
            targetInput.value = '';
          }
        }
        activeSubskillSlot = 1;
        updateSubskillUI();
      };
    }

    updateSubskillUI();
  }

  /* ─── 開啟編輯/新增彈窗 ─────────────────────────────────── */
  function openBoxEditModal(existingItem = null, screenshotSrc = null) {
    const modal = document.getElementById('box-edit-modal');
    if (!modal) return;

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isEdit = !!existingItem;
    const titleEl = document.getElementById('box-modal-title');
    if (titleEl) {
      titleEl.textContent = isEdit 
        ? (isEN ? 'Edit Pokémon' : '編輯寶可夢') 
        : (screenshotSrc ? (isEN ? 'Confirm OCR Entry' : '截圖辨識確認入庫') : (isEN ? 'Add Pokémon' : '手動新增寶可夢'));
    }

    // 填寫預設值
    const form = document.getElementById('box-edit-form');
    if (!form) return;

    form.setAttribute('data-editing-uid', isEdit ? existingItem.uid : '');

    // 截圖預覽區
    const previewContainer = document.getElementById('box-modal-screenshot-preview');
    if (previewContainer) {
      if (screenshotSrc) {
        previewContainer.innerHTML = `
          <div class="box-screenshot-preview-wrap">
            <span class="box-screenshot-preview-tag">${isEN ? 'Original Screenshot' : '原始截圖對照'}</span>
            <img src="${screenshotSrc}" alt="Screenshot" class="box-screenshot-img">
          </div>
        `;
        previewContainer.style.display = 'block';
      } else {
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'none';
      }
    }

    // 1. 初始化寶可夢 Combobox 搜尋選擇器
    initPokemonCombobox(existingItem);

    // 2. 等級 (手動新增不給預設值)
    const levelInput = document.getElementById('modal-poke-level');
    if (levelInput) levelInput.value = existingItem ? (existingItem.level || '') : '';

    // 3. 暱稱
    const nickInput = document.getElementById('modal-poke-nickname');
    if (nickInput) nickInput.value = existingItem ? (existingItem.nickname || '') : '';

    // 4. 性格選單
    const natureSelect = document.getElementById('modal-poke-nature');
    if (natureSelect) {
      natureSelect.innerHTML = NATURE_DATA.map(n => {
        const natDisplayName = window.I18N ? window.I18N.getNatureName(n.name) : n.name;
        const buffLabel = isEN ? (n.buff_en || n.buff) : n.buff;
        const debuffLabel = isEN ? (n.debuff_en || n.debuff) : n.debuff;
        return `
        <option value="${n.name}" ${existingItem && existingItem.nature === n.name ? 'selected' : (n.name === '固執' && !existingItem ? 'selected' : '')}>
          ${natDisplayName} (${buffLabel}${debuffLabel ? ' / ' + debuffLabel : ''})
        </option>
      `;}).join('');

      if (typeof window.setupCustomSelect === 'function' && !natureSelect._customized) {
        window.setupCustomSelect(natureSelect);
      } else if (natureSelect._customized) {
        natureSelect.dispatchEvent(new Event('sync-ui'));
      }
    }

    // 4.5 睡飽飽獎章選單 (依據選取寶可夢更新動態文案)
    const currentSelectedPkm = existingItem 
      ? allPokemonsRef.find(p => p.id === existingItem.pokemonId || p.name_cn === existingItem.name) 
      : null;
    const ribbonSelect = document.getElementById('modal-poke-ribbon');
    if (ribbonSelect) {
      ribbonSelect.value = String(existingItem && existingItem.ribbon != null ? existingItem.ribbon : '0');
      updateRibbonSelectOptions(currentSelectedPkm);
      if (typeof window.setupCustomSelect === 'function' && !ribbonSelect._customized) {
        window.setupCustomSelect(ribbonSelect);
      } else if (ribbonSelect._customized) {
        ribbonSelect.dispatchEvent(new Event('sync-ui'));
      }
    }

    // 4.6 主技能展示與技能等級選單 (依據該主技能上限動態生成 Lv.1 ~ Lv.max)
    let initialSkillLevel;
    if (existingItem) {
      initialSkillLevel = getEffectiveSkillLevel(existingItem, currentSelectedPkm);
    } else if (currentSelectedPkm) {
      initialSkillLevel = getEffectiveSkillLevel({ level: 30, subskills: [] }, currentSelectedPkm);
    } else {
      initialSkillLevel = 1;
    }
    updateModalMainSkill(currentSelectedPkm, initialSkillLevel);

    // 5. 初始化副技能單行插槽 + 選擇盤
    initSubskillFlowPicker(existingItem ? existingItem.subskills : []);

    const dialog = modal.querySelector ? modal.querySelector('.box-modal-dialog') : null;
    if (dialog && dialog.classList) {
      if (screenshotSrc) {
        dialog.classList.add('has-screenshot');
      } else {
        dialog.classList.remove('has-screenshot');
      }
    }

    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    modal.style.display = 'flex';
    if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
  }

  function closeBoxEditModal() {
    const modal = document.getElementById('box-edit-modal');
    if (!modal) return;
    const done = () => {
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
      const dialog = modal.querySelector ? modal.querySelector('.box-modal-dialog') : null;
      if (dialog && dialog.classList) dialog.classList.remove('has-screenshot');
      if (window.AppraisalLab && typeof window.AppraisalLab.reopenAfterEdit === 'function') {
        window.AppraisalLab.reopenAfterEdit();
      }
    };
    if (typeof window.animateOverlayClose === 'function') window.animateOverlayClose(modal, done);
    else { modal.style.display = 'none'; done(); }
  }

  /* ─── 儲存編輯表單 ─────────────────────────────────────── */
  function handleFormSave(e) {
    e.preventDefault();
    const form = document.getElementById('box-edit-form');
    if (!form) return;

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const editingUid = form.getAttribute('data-editing-uid');
    const nameSelect = document.getElementById('modal-poke-name');
    const levelInput = document.getElementById('modal-poke-level');
    const nickInput = document.getElementById('modal-poke-nickname');
    const natureSelect = document.getElementById('modal-poke-nature');
    const ribbonSelect = document.getElementById('modal-poke-ribbon');
    const skillLevelSelect = document.getElementById('modal-poke-skill-level');
    const ing1Select = document.getElementById('modal-ing1');
    const ing2Select = document.getElementById('modal-ing2');
    const ing3Select = document.getElementById('modal-ing3');

    const pokeName = nameSelect ? nameSelect.value : '';
    if (!pokeName) {
      alert(isEN ? 'Please select a Pokémon.' : '請選擇寶可夢！');
      document.getElementById('modal-poke-search')?.focus();
      return;
    }

    const parsedLevel = parseInt(levelInput ? levelInput.value : '', 10);
    if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 100) {
      alert(isEN ? 'Please enter a valid level (1 ~ 100).' : '請輸入有效的等級 (1 ~ 100)！');
      levelInput?.focus();
      return;
    }

    const base = findPokemonBase(pokeName);
    const maxSkillLvl = base && base.main_skill ? getMainSkillMaxLevel(base.main_skill) : 8;
    const rawSkillLevel = skillLevelSelect ? (parseInt(skillLevelSelect.value, 10) || 1) : 1;

    const subskills = [];
    for (let slot = 1; slot <= 5; slot++) {
      const s = document.getElementById(`modal-subskill-${slot}`);
      if (s && s.value) subskills.push(s.value);
    }

    const effectiveFromForm = getEffectiveSkillLevel({
      level: parsedLevel,
      skillLevel: rawSkillLevel,
      subskills: subskills
    }, base);
    const parsedSkillLevel = Math.max(1, Math.min(maxSkillLvl, effectiveFromForm));

    const ribbonVal = ribbonSelect ? (parseInt(ribbonSelect.value, 10) || 0) : 0;

    const itemData = {
      uid: editingUid || ('pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
      pokemonId: base ? base.id : '',
      name: pokeName,
      type: base ? base.type : '一般',
      specialty: base ? base.specialty : '樹果',
      level: parsedLevel,
      skillLevel: parsedSkillLevel,
      nickname: nickInput ? nickInput.value.trim() : '',
      nature: natureSelect ? natureSelect.value : '坦率',
      ribbon: ribbonVal,
      ing1: ing1Select ? ing1Select.value : '',
      ing2: ing2Select ? ing2Select.value : '',
      ing3: ing3Select ? ing3Select.value : '',
      subskills: subskills,
      createdAt: editingUid ? (userBox.find(p => p.uid === editingUid)?.createdAt || Date.now()) : Date.now()
    };

    if (editingUid) {
      const idx = userBox.findIndex(p => p.uid === editingUid);
      if (idx !== -1) userBox[idx] = itemData;
    } else {
      userBox.unshift(itemData);
    }

    saveUserBox();
    closeBoxEditModal();
    renderBox();
  }

  /* ─── 截圖智能分析與 OCR 引擎 (支援單圖與多圖連續批次辨識) ───────────────────────── */
  function makePokemonFingerprint(p) {
    if (!p) return '';
    const sks = (p.subskills || []).slice().sort().join(',');
    return `${p.name || p.pokemonId || ''}_Lv${p.level || 1}_${p.nature || ''}_${sks}_${p.ing1 || ''}_${p.ing2 || ''}_${p.ing3 || ''}`;
  }

  async function handleScreenshotFiles(files) {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(f => f && f.type && f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('請上傳圖片檔案 (PNG, JPG, WebP)！');
      return;
    }

    const scannerStatus = document.getElementById('box-scanner-status');

    // 1. 單張截圖流程 (保留單張確認彈窗)
    if (imageFiles.length === 1) {
      const file = imageFiles[0];
      if (scannerStatus) {
        scannerStatus.style.display = 'flex';
        scannerStatus.innerHTML = `<span>正在智能解析截圖中，請稍候...</span>`;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const imgSrc = e.target.result;
        try {
          const parsedData = await parsePokemonScreenshot(imgSrc);
          if (scannerStatus) scannerStatus.style.display = 'none';
          openBoxEditModal(parsedData, imgSrc);
        } catch (err) {
          console.error('Screenshot parse failed:', err);
          if (scannerStatus) scannerStatus.style.display = 'none';
          openBoxEditModal(null, imgSrc);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // 2. 多圖批次辨識入庫流程 (Batch OCR Multi-Import & Smart Deduplication)
    const total = imageFiles.length;
    let importedCount = 0;
    let duplicateCount = 0;
    const importedNames = [];

    // 建立既有特徵指紋集合
    const existingFingerprints = new Set(userBox.map(makePokemonFingerprint));

    if (scannerStatus) {
      scannerStatus.style.display = 'flex';
      scannerStatus.innerHTML = `
        <div class="batch-ocr-progress-card">
          <div class="batch-ocr-header">
            <span class="batch-ocr-title">批次智能辨識入庫中...</span>
            <span id="batch-ocr-counter" class="batch-ocr-counter">0 / ${total}</span>
          </div>
          <div class="batch-ocr-bar-bg">
            <div id="batch-ocr-bar-fill" class="batch-ocr-bar-fill" style="width: 0%;"></div>
          </div>
          <div id="batch-ocr-status-text" class="batch-ocr-status-text">初始化 OCR 引擎中...</div>
        </div>
      `;
    }

    let sharedWorker = null;
    try {
      if (window.Tesseract) {
        sharedWorker = await window.Tesseract.createWorker('chi_tra+eng');
      }
    } catch (e) {
      console.warn('Could not initialize shared Tesseract worker:', e);
    }

    for (let i = 0; i < total; i++) {
      const file = imageFiles[i];
      const statusText = document.getElementById('batch-ocr-status-text');
      const counterEl = document.getElementById('batch-ocr-counter');
      const barFill = document.getElementById('batch-ocr-bar-fill');

      if (statusText) statusText.textContent = `正在辨識：${file.name} (${i + 1}/${total})...`;
      if (counterEl) counterEl.textContent = `${i + 1} / ${total}`;
      if (barFill) barFill.style.width = `${Math.round(((i + 1) / total) * 100)}%`;

      try {
        const imgSrc = await readFileAsDataURL(file);
        const parsed = await parsePokemonScreenshotWithWorker(imgSrc, sharedWorker);

        // 防重保護檢測
        const fp = makePokemonFingerprint(parsed);
        if (existingFingerprints.has(fp)) {
          duplicateCount++;
        } else {
          existingFingerprints.add(fp);
          parsed.uid = 'pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
          parsed.createdAt = Date.now();
          userBox.push(parsed);
          importedCount++;
          importedNames.push(parsed.name || '寶可夢');
        }
      } catch (err) {
        console.error(`Error parsing file ${file.name}:`, err);
      }
    }

    if (sharedWorker) {
      try {
        await sharedWorker.terminate();
      } catch (e) {}
    }

    if (scannerStatus) {
      scannerStatus.style.display = 'none';
    }

    if (importedCount > 0) {
      saveUserBox();
      renderBox();
    }

    // 彈出 Toast 通知
    showBoxToast(
      '批次辨識入庫完成！',
      `成功入庫 ${importedCount} 隻寶可夢${duplicateCount > 0 ? ` (已略過 ${duplicateCount} 隻重複截圖)` : ''}${importedNames.length > 0 ? `：${importedNames.slice(0, 5).join('、')}${importedNames.length > 5 ? ' 等' : ''}` : ''}。`,
      importedCount > 0 ? 'success' : 'info'
    );
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ─── 圖像預處理與多錨點 OCR 複合畫布建立 ─────────────────── */
  const GOLD_SKILLS = new Set(SUBSKILLS_DATA.filter(s => s.tier === 'gold').map(s => s.name));
  const BLUE_SKILLS = new Set(SUBSKILLS_DATA.filter(s => s.tier === 'blue').map(s => s.name));
  const WHITE_SKILLS = new Set(SUBSKILLS_DATA.filter(s => s.tier === 'white').map(s => s.name));

  const OCR_CONFUSION_MAP = [
    ['士王', '土王'],
    ['大和室英', '大竺葵'],
    ['大和室', '大竺葵'],
    ['和室英', '大竺葵'],
    ['大符英', '大竺葵'],
    ['!焰欽', '烈焰猴'],
    ['焰欽', '烈焰猴'],
    ['其拉克羅斯', '赫拉克羅斯'],
    ['其拉克', '赫拉克羅斯'],
    ['拉克羅斯', '赫拉克羅斯'],
    ['峽龍', '噴火龍'],
    ['峽', '噴'],
    ['!布土撥', '巴布土撥'],
    ['布土撥', '巴布土撥'],
    ['繞花', '妙蛙花'],
    ['箭傾', '水箭龜'],
    ['箭龜', '水箭龜'],
    ['呆殼鄙', '呆殼獸'],
    ['殼鄙', '殼獸'],
    ['語14', '雷丘'],
    ['2大蝶', '巴大蝶'],
    ['虧龍', '快龍'],
    ['隆岩', '隆隆岩'],
    ['農炮蟲', '鍬農炮蟲'],
    ['著熊', '穿著熊'],
    ['結萌蛇', '蝶結萌虻'],
    ['士可多拉', '波士可多拉'],
    ['食花', '大食花'],
    ['大鯨', '浩大鯨'],
    ['歡浪舞鴨', '狂歡浪舞鴨'],
    ['!炮猴', '投擲猴'],
    ['牙海猴', '帝牙海獅'],
    ['蔥鴨', '大蔥鴨'],
    ['克基斯', '波克基斯'],
    ['蜴王', '蜥蜴王'],
    ['波龍', '三首惡龍'],
    ['柏怪', '阿柏怪'],
    ['瓜怪人', '南瓜怪人'],
    ['紋巨聲鱷', '骨紋巨聲鱷'],
    ['基拉斯', '班基拉斯'],
    ['福蛋', '幸福蛋'],
    ['咚鼠', '咚咚鼠'],
    ['琴貓', '向尾喵'],
    ['勃梭魯', '阿勃梭魯']
  ];

  function buildOcrCompositeCanvas(img) {
    const w = img.naturalWidth || img.width || 591;
    const h = img.naturalHeight || img.height || 1280;

    // 1. 採樣食材像素色彩 (Slot 1, Slot 2, Slot 3)
    let rgbSlots = [
      { r: 240, g: 200, b: 140 },
      { r: 180, g: 105, b: 48 },
      { r: 250, g: 220, b: 160 }
    ];
    let meta = {
      slotTiers: ['white', 'white', 'white', 'white', 'white'],
      cardBotY: Math.round(h * 0.5234)
    };

    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
      return { compositeCanvas: null, rgbSlots, meta };
    }

    let sampleCanvas = null;
    let sCtx = null;
    try {
      sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = w;
      sampleCanvas.height = h;
      sCtx = sampleCanvas.getContext('2d');
      sCtx.drawImage(img, 0, 0, w, h);

      // 動態偵測白色卡片頂部邊界 (cardTop)
      let cardTop = Math.round(h * 0.05);
      try {
        for (let y = Math.round(h * 0.02); y < Math.round(h * 0.16); y++) {
          const rowData = sCtx.getImageData(Math.round(w * 0.3), y, Math.round(w * 0.4), 1).data;
          let whiteCount = 0;
          const total = rowData.length / 4;
          for (let i = 0; i < rowData.length; i += 4) {
            if (rowData[i] > 230 && rowData[i + 1] > 230 && rowData[i + 2] > 220) whiteCount++;
          }
          if (whiteCount / total > 0.70) {
            cardTop = y;
            break;
          }
        }
      } catch (e) {}
      meta.cardTop = cardTop;

      // 食材色彩取樣 (Slot 1, 2, 3，依據 cardTop 動態計算)
      const ingBaseY = cardTop + Math.round(h * (140 / 1280));
      const ingSlotCoords = [
        { x: Math.round(w * (265 / 591)), y: ingBaseY },
        { x: Math.round(w * (370 / 591)), y: ingBaseY },
        { x: Math.round(w * (475 / 591)), y: ingBaseY }
      ];
      const boxW = Math.max(5, Math.round(w * (60 / 591)));
      const boxH = Math.max(5, Math.round(h * (60 / 1280)));

      rgbSlots = ingSlotCoords.map(coord => {
        try {
          const patch = sCtx.getImageData(Math.max(0, coord.x), Math.max(0, coord.y), boxW, boxH).data;
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          for (let i = 0; i < patch.length; i += 4) {
            const r = patch[i], g = patch[i + 1], b = patch[i + 2];
            const diff = Math.abs(r - 254) + Math.abs(g - 253) + Math.abs(b - 235);
            if (diff > 35) {
              sumR += r; sumG += g; sumB += b; count++;
            }
          }
          return count > 0 ? { r: sumR / count, g: sumG / count, b: sumB / count } : { r: 200, g: 200, b: 200 };
        } catch (e) {
          return { r: 200, g: 200, b: 200 };
        }
      });

      // 動態黃色邊界偵測 (動態適應主技能說明長度導致之卡片高度拉伸)
      const scanStartY = Math.round(h * 0.49);
      const scanEndY = Math.round(h * 0.58);
      const scanStartX = Math.round(w * 0.34);
      const scanEndX = Math.round(w * 0.51);
      const scanW = scanEndX - scanStartX;

      for (let y = scanStartY; y < scanEndY; y++) {
        const rowData = sCtx.getImageData(scanStartX, y, scanW, 1).data;
        let yellowCount = 0;
        const total = rowData.length / 4;
        for (let i = 0; i < rowData.length; i += 4) {
          const r = rowData[i], g = rowData[i + 1], b = rowData[i + 2];
          if (r > 180 && g > 130 && g < 220 && b < 120 && (r - b > 70)) {
            yellowCount++;
          }
        }
        if (yellowCount / total > 0.50) {
          meta.cardBotY = y;
          break;
        }
      }
    } catch (e) {}

    // 副技能按鈕座標計算
    const cardBotY = meta.cardBotY;
    const r1_y = cardBotY + Math.round(h * (36 / 1280));
    const r2_y = cardBotY + Math.round(h * (131 / 1280));
    const r3_y = cardBotY + Math.round(h * (226 / 1280));
    const btn_h = Math.round(h * (60 / 1280));
    const btn_w = Math.round(w * (240 / 591));
    const col1_x = Math.round(w * (40 / 591));
    const col2_x = Math.round(w * (310 / 591));

    const slotCoords = [
      { x: col1_x, y: r1_y, w: btn_w, h: btn_h },
      { x: col2_x, y: r1_y, w: btn_w, h: btn_h },
      { x: col1_x, y: r2_y, w: btn_w, h: btn_h },
      { x: col2_x, y: r2_y, w: btn_w, h: btn_h },
      { x: col1_x, y: r3_y, w: btn_w, h: btn_h }
    ];

    // 色階分區與按鈕階層辨別 (金色、藍色、白色)
    const slotTiers = [];
    if (sCtx) {
      for (const slot of slotCoords) {
        try {
          const sampleY0 = slot.y + Math.round(slot.h * 0.55);
          const sampleH = Math.round(slot.h * 0.30);
          const sampleX0 = slot.x + Math.round(slot.w * 0.10);
          const sampleW = Math.round(slot.w * 0.80);
          const patch = sCtx.getImageData(sampleX0, sampleY0, sampleW, sampleH).data;

          let sumR = 0, sumG = 0, sumB = 0, bgCount = 0;
          for (let i = 0; i < patch.length; i += 4) {
            const r = patch[i], g = patch[i + 1], b = patch[i + 2];
            const gray = r * 0.299 + g * 0.587 + b * 0.114;
            if (gray > 130) {
              sumR += r; sumG += g; sumB += b; bgCount++;
            }
          }
          if (bgCount > 0) {
            const meanR = sumR / bgCount;
            const meanB = sumB / bgCount;
            if (meanR - meanB > 22) slotTiers.push('gold');
            else if (meanB - meanR > 5) slotTiers.push('blue');
            else slotTiers.push('white');
          } else {
            slotTiers.push('white');
          }
        } catch (e) {
          slotTiers.push('white');
        }
      }
      meta.slotTiers = slotTiers;
    }

    function cropAndEnhance(sx, sy, sw, sh, scale = 2.5, mode = 'binarize', threshold = 135) {
      const c = document.createElement('canvas');
      const dw = Math.max(10, Math.round(sw * scale));
      const dh = Math.max(10, Math.round(sh * scale));
      c.width = dw;
      c.height = dh;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

      try {
        const imgData = ctx.getImageData(0, 0, dw, dh);
        const d = imgData.data;

        if (mode === 'red_channel') {
          for (let i = 0; i < d.length; i += 4) {
            const v = d[i] < 180 ? 0 : 255;
            d[i] = v; d[i + 1] = v; d[i + 2] = v;
          }
        } else if (mode === 'blue_channel') {
          for (let i = 0; i < d.length; i += 4) {
            const v = d[i + 2] < 150 ? 0 : 255;
            d[i] = v; d[i + 1] = v; d[i + 2] = v;
          }
        } else if (mode === 'binarize') {
          for (let i = 0; i < d.length; i += 4) {
            const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
            const v = gray < threshold ? 0 : 255;
            d[i] = v; d[i + 1] = v; d[i + 2] = v;
          }
        } else if (mode === 'contrast') {
          const factor = 2.5;
          for (let i = 0; i < d.length; i += 4) {
            const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
            const cVal = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
            d[i] = cVal; d[i + 1] = cVal; d[i + 2] = cVal;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}

      return c;
    }

    // 副技能裁切：避開左上角鎖頭徽章，非破壞性內縮保留文字完整
    function cropSubskillSlotSafe(slot, tier) {
      let hasLock = false;
      if (sCtx) {
        try {
          const lockW = Math.round(slot.w * 0.30);
          const lockH = Math.round(slot.h * 0.35);
          const lockPatch = sCtx.getImageData(slot.x, slot.y, lockW, lockH).data;
          let minVal = 255;
          for (let i = 0; i < lockPatch.length; i += 4) {
            const g = lockPatch[i] * 0.299 + lockPatch[i + 1] * 0.587 + lockPatch[i + 2] * 0.114;
            if (g < minVal) minVal = g;
          }
          if (minVal < 100) hasLock = true;
        } catch (e) {}
      }

      let sx, sy, sw, sh;
      if (hasLock) {
        sx = slot.x + Math.round(slot.w * 0.12);
        sy = slot.y + Math.round(slot.h * 0.30);
        sw = Math.round(slot.w * 0.80);
        sh = Math.round(slot.h * 0.45);
      } else {
        sx = slot.x + Math.round(slot.w * 0.08);
        sy = slot.y + Math.round(slot.h * 0.15);
        sw = Math.round(slot.w * 0.84);
        sh = Math.round(slot.h * 0.70);
      }

      const mode = tier === 'gold' ? 'blue_channel' : 'red_channel';
      return cropAndEnhance(sx, sy, sw, sh, 2.5, mode);
    }

    // 各個錨點視圖切片 (以 cardTop 及 cardBotY 為核心動態位移，徹底告別死板固定座標)
    const cardTop = meta.cardTop || Math.round(h * 0.05);
    const nameY = cardTop + Math.round(h * (48 / 1280));
    const nameH = Math.round(h * (52 / 1280));

    const binLv = cropAndEnhance(Math.round(w * (90 / 591)), nameY, Math.round(w * (125 / 591)), nameH, 3.0, 'red_channel');
    const binName = cropAndEnhance(Math.round(w * (150 / 591)), nameY, Math.round(w * (300 / 591)), nameH, 2.5, 'contrast');
    const specialty = cropAndEnhance(Math.round(w * (40 / 591)), cardTop + Math.round(h * (125 / 1280)), Math.round(w * (180 / 591)), Math.round(h * (50 / 1280)), 2.0, 'binarize', 135);
    const carryNum = cropAndEnhance(Math.round(w * (200 / 591)), cardTop + Math.round(h * (290 / 1280)), Math.round(w * (320 / 591)), Math.round(h * (55 / 1280)), 2.0, 'binarize', 135);
    // 主技能區域通用水平切片 (寬鬆覆蓋 0.28h ~ 0.58h 主技能卡片橫帶，徹底涵蓋任何機型或位移)
    const msY = meta.cardTop ? Math.max(0, meta.cardTop + Math.round(h * (300 / 1280))) : Math.round(h * 0.28);
    const msH = Math.round(h * 0.28);
    const msX = Math.round(w * 0.04);
    const msW = Math.round(w * 0.92);
    const mainSkill = cropAndEnhance(msX, msY, msW, msH, 2.0, 'contrast');

    const slotCanvases = slotCoords.map((coord, idx) => {
      const tier = meta.slotTiers[idx] || 'white';
      return {
        name: `SLOT${idx + 1}:${tier}`,
        canvas: cropSubskillSlotSafe(coord, tier)
      };
    });

    const natureY = cardBotY + Math.round(h * (300 / 1280));
    const natureH = Math.round(h * (90 / 1280));
    const safeNatureY = Math.min(h - natureH - 4, Math.max(0, natureY));
    const nature = cropAndEnhance(Math.round(w * (40 / 591)), safeNatureY, Math.round(w * (510 / 591)), natureH, 2.0, 'contrast');

    const parts = [
      { name: 'NAME', canvas: binName },
      { name: 'BIN_LV', canvas: binLv },
      { name: 'SPECIALTY', canvas: specialty },
      { name: 'CARRY_NUM', canvas: carryNum },
      { name: 'MAINSKILL', canvas: mainSkill },
      ...slotCanvases,
      { name: 'NATURE', canvas: nature }
    ].filter(p => !!p.canvas);

    const padding = 28;
    const headerHeight = 22;
    const totalH = parts.reduce((acc, p) => acc + p.canvas.height + headerHeight + padding, padding);
    const maxW = Math.max(...parts.map(p => p.canvas.width), 500);

    const compCanvas = document.createElement('canvas');
    compCanvas.width = maxW + 40;
    compCanvas.height = totalH;
    const compCtx = compCanvas.getContext('2d');
    compCtx.fillStyle = '#ffffff';
    compCtx.fillRect(0, 0, compCanvas.width, compCanvas.height);
    compCtx.font = 'bold 16px monospace';
    compCtx.fillStyle = '#000000';

    let curY = padding;
    for (const part of parts) {
      compCtx.fillText(`[${part.name}]`, 20, curY + 16);
      curY += headerHeight;
      compCtx.drawImage(part.canvas, 20, curY);
      curY += part.canvas.height + padding;
    }

    return { compositeCanvas: compCanvas, rgbSlots, meta };
  }

  /* ─── 依據持有上限反推睡飽飽獎章 (Carry to Good-Night Ribbon Deduction) ─── */
  function deduceRibbonFromCarry(pkm, currentLvl, subskillsList, carryVal) {
    if (!pkm || carryVal == null || isNaN(carryVal)) return 0;
    const baseCarry = parseInt(pkm.carry, 10) || 20;

    // 副技能解鎖等級門檻：Lv.10, Lv.25, Lv.50, Lv.70, Lv.80
    const unlockThresholds = [10, 25, 50, 70, 80];
    let subskillCarryBonus = 0;
    const actualLvl = parseInt(currentLvl, 10) || 1;

    for (let i = 0; i < (subskillsList || []).length; i++) {
      const reqLvl = unlockThresholds[i] || 80;
      if (actualLvl >= reqLvl) {
        const skName = subskillsList[i];
        if (skName === '持有上限提升S') subskillCarryBonus += 6;
        else if (skName === '持有上限提升M') subskillCarryBonus += 12;
        else if (skName === '持有上限提升L') subskillCarryBonus += 18;
      }
    }

    const diff = carryVal - baseCarry - subskillCarryBonus;
    if (diff >= 8) return 4;
    if (diff >= 6) return 3;
    if (diff >= 3) return 2;
    if (diff >= 1) return 1;
    return 0;
  }

  /* ─── 多錨點智能 OCR 解析核心 ─────────────────────────────── */
  function normalizeOcrText(txt) {
    if (!txt) return '';
    let str = txt
      .replace(/\s+/g, '')
      .replace(/[（(]/g, '(')
      .replace(/[）)]/g, ')')
      .replace(/提昇/g, '提升')
      .replace(/機傘/g, '機率')
      .replace(/革忙/g, '幫忙')
      .replace(/事忙/g, '幫忙')
      .replace(/[5$]/g, 'S')
      .replace(/知$/g, 'M')
      .replace(/W$/g, 'M');

    for (const [bad, good] of OCR_CONFUSION_MAP) {
      if (str.includes(bad)) {
        str = str.replace(new RegExp(bad, 'g'), good);
      }
    }
    return str;
  }

  function matchSubskillTextWithTier(clean, tier) {
    const candidates = tier === 'gold' ? GOLD_SKILLS : (tier === 'blue' ? BLUE_SKILLS : (tier === 'white' ? WHITE_SKILLS : null));
    const pool = candidates ? Array.from(candidates) : SUBSKILLS_DATA.map(s => s.name);

    for (const sk of pool) {
      if (clean.includes(sk)) return sk;
    }

    let bestSk = null;
    let bestScore = -1;
    for (const sk of pool) {
      let score = 0;
      if (clean.includes('樹果') && sk.includes('樹果')) score += 50;
      if (clean.includes('幫手') && sk.includes('幫手')) score += 50;
      if (clean.includes('睡眠') && sk.includes('睡眠')) score += 50;
      if (clean.includes('活力') && sk.includes('活力')) score += 50;
      if ((clean.includes('夢之') || clean.includes('碎片')) && sk.includes('夢之碎片')) score += 60;
      if (clean.includes('研究') && sk.includes('研究')) score += 50;
      if (clean.includes('技能等級') && sk.includes('技能等級')) score += 50;
      if (clean.includes('幫忙速度') && sk.includes('幫忙速度')) score += 50;
      if (clean.includes('食材機率') && sk.includes('食材機率')) score += 50;
      if (clean.includes('技能機率') && sk.includes('技能機率')) score += 50;
      if (clean.includes('持有上限') && sk.includes('持有上限')) score += 50;

      let common = 0;
      for (const c of sk) {
        if (clean.includes(c)) common++;
      }
      score += common * 10;
      if (score > bestScore) {
        bestScore = score;
        bestSk = sk;
      }
    }
    return bestScore >= 20 ? bestSk : pool[0];
  }

  function parsePokemonFromOcr(text, rgbSlots, allPokemons, meta) {
    const clean = normalizeOcrText(text);


    // 1. 等級預先萃取 (優先從頂部資訊卡辨識，避開主技能等級如 Lv.7)
    let level = 30;
    const mainSkillIdx = text.indexOf('健美') !== -1 ? text.indexOf('健美') : (text.indexOf('料理') !== -1 ? text.indexOf('料理') : -1);
    const headerPart = mainSkillIdx > 0 ? text.substring(0, mainSkillIdx) : text;
    const mHeader = headerPart.match(/Lv\.?\s*(\d{1,2})/i) || headerPart.match(/LV\s*(\d{1,2})/i) || normalizeOcrText(headerPart).match(/Lv\.?(\d{1,2})/i);
    if (mHeader) {
      const parsedLvl = parseInt(mHeader[1], 10);
      if (parsedLvl >= 1 && parsedLvl <= 75) level = parsedLvl;
    } else {
      const mAny = text.match(/Lv\.?\s*(\d{1,2})/i) || normalizeOcrText(text).match(/Lv\.?(\d{1,2})/i);
      if (mAny) {
        const parsedLvl = parseInt(mAny[1], 10);
        if (parsedLvl >= 1 && parsedLvl <= 75) level = parsedLvl;
      }
    }

    // 2. 寶可夢名稱智能交叉比對 (主技能唯一性 + 名稱子字串 / 混淆字修正 + 進化階段權重)
    let bestPkm = null;
    let maxScore = -1;

    for (const p of allPokemons) {
      let score = 0;
      const cleanName = normalizeOcrText(p.name_cn || '');
      const cleanMainSkill = normalizeOcrText(p.main_skill || '');

      // 名稱完整符合
      if (clean.includes(cleanName)) {
        score += 200 + cleanName.length * 20;
      } else {
        // 名稱子字串比對 (>= 2 字)
        for (let len = cleanName.length - 1; len >= 2; len--) {
          for (let i = 0; i <= cleanName.length - len; i++) {
            const sub = cleanName.substr(i, len);
            if (clean.includes(sub)) {
              score += len * 35;
              break;
            }
          }
        }
        let common = 0;
        for (const char of cleanName) {
          if (clean.includes(char)) common++;
        }
        if (common >= 1) score += common * 15;
      }

      // 主技能交叉驗證 (排除同名或誤判，如赫拉克羅斯專屬之「健美（料理輔助S）」)
      if (cleanMainSkill) {
        const skillBase = cleanMainSkill.split('(')[0];
        const skillSub = cleanMainSkill.includes('(') ? cleanMainSkill.split('(')[1].replace(')', '') : '';
        if (clean.includes(cleanMainSkill)) {
          score += 120;
        } else if (skillBase && skillBase.length >= 2 && clean.includes(skillBase)) {
          score += 70;
        }
        if (skillSub && clean.includes(skillSub)) {
          score += 50;
        }
      }

      // 專長專門比對 (樹果、食材、技能)
      if (p.specialty) {
        if (clean.includes(p.specialty)) score += 25;
      }

      // 進化階段優先權 (當等級 >= 25 且為最終進化，給予適當權重以避免降級為基礎階)
      if (level >= 25 && p.is_final === '〇') {
        score += 15;
      }

      if (score > maxScore) {
        maxScore = score;
        bestPkm = p;
      }
    }

    // 2.5 主技能等級萃取 (通用文字掃描引擎，支援全螢幕文字或 Composite 切片文字)
    let skillLevel = null;
    let foundSkillLevel = false;
    const maxAllowedSkillLvl = bestPkm && bestPkm.main_skill ? getMainSkillMaxLevel(bestPkm.main_skill) : 8;

    // 通用等級正則表達式與副技能/食材里程碑排除規則
    const msLevelRegex = /(?:Lv\.?|LV|tv\.?|1v\.?|lv\.?|iv\.?|v\.?|y\.?|等級|等|Level)\s*([1-8])\b/i;
    const milestoneLvRegex = /Lv\.?\s*(?:10|25|30|50|60|70|75|80|100)\b/i;

    // A. 優先檢查 [MAINSKILL_LV] 專屬等級標籤 (若有)
    const msLvSectionMatch = text.match(/\[MAINSKILL_LV\]([\s\S]*?)(?=\n\s*\[[A-Z0-9_:]+\]|$)/i) || text.match(/\[MAINSKILL_LV\]([\s\S]*?)(?:\[|$)/i);
    if (msLvSectionMatch) {
      const msLvText = msLvSectionMatch[1];
      const mLvl = msLvText.match(msLevelRegex) || msLvText.match(/(?:^|\D)([1-8])(?:\D|$)/);
      if (mLvl) {
        const parsedLvl = parseInt(mLvl[1], 10);
        if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
          skillLevel = parsedLvl;
          foundSkillLevel = true;
        }
      }
    }

    // B. 檢查 [MAINSKILL] 切片標籤區塊 (支援水平切片文字)
    if (!foundSkillLevel) {
      const msSectionMatch = text.match(/\[MAINSKILL\]([\s\S]*?)(?=\n\s*\[[A-Z0-9_:]+\]|$)/i) || text.match(/\[MAINSKILL\]([\s\S]*?)(?:\[|$)/i);
      if (msSectionMatch) {
        const msText = msSectionMatch[1];
        const msLines = msText.split('\n').map(l => l.trim()).filter(Boolean);
        for (let idx = 0; idx < msLines.length; idx++) {
          const line = msLines[idx];
          const normLine = normalizeOcrText(line);
          // 排除說明中的數量 (如 8個、5點、200能量)
          if (line.match(/\d+\s*(?:個|點|能量|點數)/) && !msLevelRegex.test(line)) continue;

          const mLvl = line.match(msLevelRegex) || normLine.match(/Lv\.?([1-8])$/i) || line.match(/(?:[SML\)\]]|\b)\s*([1-8])$/);
          if (mLvl) {
            const parsedLvl = parseInt(mLvl[1], 10);
            if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
              skillLevel = parsedLvl;
              foundSkillLevel = true;
              break;
            }
          }
        }
        // 切片區塊內換行兜底 (純數字 1-8 單獨一行)
        if (!foundSkillLevel) {
          for (const line of msLines) {
            const mNum = line.match(/^\s*([1-8])\s*$/);
            if (mNum) {
              const parsedLvl = parseInt(mNum[1], 10);
              if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
                skillLevel = parsedLvl;
                foundSkillLevel = true;
                break;
              }
            }
          }
        }
      }
    }

    // C. 通用全文本語意掃描引擎 (支援整張截圖 OCR 文字，無像素座標硬編碼)
    if (!foundSkillLevel) {
      const allOcrLines = text.split('\n');
      const mainSkillKeywords = ['料理', '食材', '能量', '活力', '幫手', '金幣', '碎片', '揮指', '健美', '填充', '怪力', '療癒', '磁鐵', '下一次', '卡比獸', '增加', '獲得', 'skill', 'Skill'];
      if (bestPkm && bestPkm.main_skill) {
        const ms = bestPkm.main_skill;
        mainSkillKeywords.push(ms);
        mainSkillKeywords.push(ms.replace(/[SML]$/i, ''));
        if (ms.includes('(')) mainSkillKeywords.push(ms.split('(')[0]);
        if (ms.includes('（')) mainSkillKeywords.push(ms.split('（')[0]);
      }

      // 階段 1：掃描包含主技能語意關鍵字之行，及其上下相鄰行 (處理 OCR 斷行或位移)
      for (let i = 0; i < allOcrLines.length; i++) {
        const line = allOcrLines[i];
        const normLine = normalizeOcrText(line);
        if (normLine.includes('SP') || (bestPkm && normLine.includes(bestPkm.name_cn))) continue;
        if (normLine.includes('持有上限') || normLine.includes('幫忙間隔') || normLine.includes('性格')) continue;
        if (milestoneLvRegex.test(normLine)) continue;

        const hasKeyword = mainSkillKeywords.some(kw => kw && (line.includes(kw) || normLine.includes(kw)));
        if (hasKeyword) {
          // 先查同本行 (排除技能說明內數量干擾)
          if (!line.match(/\d+\s*(?:個|點|能量|點數)/) || msLevelRegex.test(line)) {
            let mLvl = line.match(msLevelRegex) || normLine.match(/Lv\.?([1-8])$/i) || line.match(/(?:[SML\)\]]|\b)\s*([1-8])$/);
            if (mLvl) {
              const parsedLvl = parseInt(mLvl[1], 10);
              if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
                skillLevel = parsedLvl;
                foundSkillLevel = true;
                break;
              }
            }
          }

          // 同行若無等級，檢查前後相鄰窗口 [i-2 .. i+2] 行 (OCR 常常把技能名放一行、Lv. X 放下一行或隔行)
          for (const offset of [1, -1, 2, -2]) {
            const idx = i + offset;
            if (idx >= 0 && idx < allOcrLines.length) {
              const adjLine = allOcrLines[idx];
              const adjNorm = normalizeOcrText(adjLine);
              if (adjNorm.includes('SP') || milestoneLvRegex.test(adjNorm)) continue;
              if (bestPkm && adjNorm.includes(bestPkm.name_cn)) continue;
              if (adjNorm.includes('持有上限') || adjNorm.includes('幫忙間隔') || adjNorm.includes('性格')) continue;
              if (adjLine.match(/\d+\s*(?:個|點|能量|點數)/) && !msLevelRegex.test(adjLine)) continue;

              const mAdj = adjLine.match(msLevelRegex) || adjNorm.match(/Lv\.?([1-8])$/i) || adjLine.match(/^\s*([1-8])\s*$/);
              if (mAdj) {
                const parsedLvl = parseInt(mAdj[1], 10);
                if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
                  skillLevel = parsedLvl;
                  foundSkillLevel = true;
                  break;
                }
              }
            }
          }
          if (foundSkillLevel) break;
        }
      }

      // 階段 2：全文過濾兜底 (避開寶可夢自身等級、SP、持有上限、副技能/食材里程碑等級與說明數量)
      if (!foundSkillLevel) {
        for (const line of allOcrLines) {
          const normLine = normalizeOcrText(line);
          if (normLine.includes('SP') || (bestPkm && normLine.includes(bestPkm.name_cn))) continue;
          if (normLine.includes('持有上限') || normLine.includes('幫忙間隔') || normLine.includes('性格')) continue;
          if (milestoneLvRegex.test(normLine)) continue;
          if (level && line.includes(String(level))) continue;
          if (line.match(/\d+\s*(?:個|點|能量|點數)/) && !msLevelRegex.test(line)) continue;

          const mLvl = line.match(msLevelRegex) || normLine.match(/Lv\.?([1-8])$/i);
          if (mLvl) {
            const parsedLvl = parseInt(mLvl[1], 10);
            if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
              skillLevel = parsedLvl;
              foundSkillLevel = true;
              break;
            }
          }
        }
      }
    }

    // 2.6 持有上限萃取 (從 CARRY_NUM 區域取得，例如「21個」)
    let ocrCarry = null;
    const mCarry = text.match(/持有上限\s*(\d{1,2})\s*個?/) || 
                   text.match(/(\d{1,2})\s*個/) || 
                   normalizeOcrText(text).match(/持有上限(\d{1,2})/) ||
                   normalizeOcrText(text).match(/(\d{1,2})個/);
    if (mCarry) {
      const parsedCarry = parseInt(mCarry[1], 10);
      if (parsedCarry >= 5 && parsedCarry <= 120) {
        ocrCarry = parsedCarry;
      }
    }

    // 3. 性格辨識 (名稱膠囊 + 屬性增減雙向演繹對照)
    let nature = '慎重';
    let nameMatched = false;
    for (const n of NATURE_DATA) {
      if (clean.includes(n.name)) {
        nature = n.name;
        nameMatched = true;
        break;
      }
    }

    if (!nameMatched) {
      function getStatType(str) {
        if (str.includes('提升') || str.match(/[SML]$/i)) return null;
        if (str.includes('食材發現率') || str.includes('食材發現') || str.includes('僵材') || str.includes('僵堵')) return 'ingredient';
        if (str.includes('主技能發動機率') || str.includes('主技能發動') || str.includes('主技能')) return 'skill';
        if (str.includes('活力回復量') || str.includes('活力回復') || str.includes('活力') || str.includes('洗衣')) return 'energy';
        if (str.includes('EXP獲得量') || str.includes('EXP獲得') || str.includes('EXP') || str.includes('交得')) return 'exp';
        if (str.includes('幫忙速度') || str.includes('幫速') || str.includes('圭尺')) return 'speed';
        return null;
      }

      const allLines = text.split('\n').map(normalizeOcrText).filter(Boolean);
      const natureLines = allLines.slice(-6); // 取底部性格卡相關行
      let buffStat = null;
      let debuffStat = null;

      for (const line of natureLines) {
        const st = getStatType(line);
        if (!st) continue;
        if (!buffStat) {
          buffStat = st;
        } else if (!debuffStat && st !== buffStat) {
          debuffStat = st;
        }
      }

      if (buffStat && debuffStat) {
        const match = NATURE_DATA.find(n => n.buffType === buffStat && n.debuffType === debuffStat);
        if (match) nature = match.name;
      } else if (clean.includes('沒有性格') || clean.includes('特色')) {
        for (const n of ['害羞', '認真', '勤奮', '浮躁', '坦率']) {
          if (clean.includes(n)) {
            nature = n;
            break;
          }
        }
        if (!nature) nature = '坦率';
      }
    }

    // 4. 副技能 5 個插槽精準提取 (支援區塊分段與階層式色彩比對)
    const subskills = [];
    const used = new Set();

    const slotHeaderRegex = /(?:===|\[)SLOT([1-5])(?::([a-z]+))?(?:===|\])/i;
    if (slotHeaderRegex.test(text)) {
      const sections = text.split(/(?=(?:===|\[)SLOT[1-5])/i);
      for (const sec of sections) {
        const m = sec.match(slotHeaderRegex);
        if (m) {
          const slotIdx = parseInt(m[1], 10) - 1;
          const tier = m[2] ? m[2].toLowerCase() : (meta && meta.slotTiers ? meta.slotTiers[slotIdx] : null);
          const secText = sec.replace(slotHeaderRegex, '').trim();
          const matched = matchSubskillTextWithTier(normalizeOcrText(secText), tier);
          if (matched && !used.has(matched)) {
            subskills[slotIdx] = matched;
            used.add(matched);
          }
        }
      }
    }

    if (subskills.filter(Boolean).length < 5) {
      function matchLineToSubskill(line) {
        const c = normalizeOcrText(line)
          .replace(/[5$]/g, 'S')
          .replace(/知$/g, 'M')
          .replace(/W$/g, 'M')
          .replace(/!/g, '');

        let best = null;
        let maxS = -1;

        for (const sk of SUBSKILLS_DATA) {
          let s = 0;
          const cleanSk = normalizeOcrText(sk.name);
          if (c.includes(cleanSk)) {
            s = 100;
          } else {
            const lastChar = cleanSk.slice(-1);
            const baseSk = cleanSk.slice(0, -1);
            if (c.includes(baseSk)) {
              s = 65;
              if (c.includes(lastChar)) s += 30;
            } else {
              let overlap = 0;
              for (const char of cleanSk) {
                if (c.includes(char)) overlap++;
              }
              if (overlap >= 2) {
                s = overlap * 15;
                if (c.includes(lastChar)) s += 10;
              }
            }
          }
          if (s > maxS) {
            maxS = s;
            best = sk.name;
          }
        }
        return maxS >= 40 ? best : null;
      }

      const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const existing = new Set(subskills.filter(Boolean));
      const extractedList = [];

      for (const line of rawLines) {
        if (line.includes('隨機') || line.includes('效果') || line.includes('移動') || line.includes('每29分')) continue;
        if (line.includes('發動機率') || line.includes('發現率') || line.includes('食材發現')) continue;
        if (line.includes('健美') || line.includes('料理輔助')) continue;
        if ((line.includes('持有上限') && !line.includes('提升')) || line.includes('料理漂亮') || line.includes('成功') || line.includes('持續到')) continue;
        if (line.includes('SP') || (line.includes('個') && !line.includes('提升'))) continue;

        const matched = matchLineToSubskill(line);
        if (matched && !existing.has(matched)) {
          extractedList.push(matched);
          existing.add(matched);
        }
      }

      let extractIdx = 0;
      for (let i = 0; i < 5; i++) {
        if (!subskills[i] && extractIdx < extractedList.length) {
          subskills[i] = extractedList[extractIdx++];
        }
      }
    }

    const finalSubskills = subskills.filter(Boolean);

    // 依據持有上限反推睡飽飽獎章
    const deducedRibbon = deduceRibbonFromCarry(bestPkm, level, finalSubskills, ocrCarry);

    // 5. 解鎖食材組合 (結合合法食材庫與色彩採樣距離)
    let ing1 = '';
    let ing2 = '';
    let ing3 = '';

    if (bestPkm && bestPkm.ingredients && bestPkm.ingredients.length > 0) {
      const ings = bestPkm.ingredients;
      const ingA = ings[0].name;
      const ingB = ings[1] ? ings[1].name : ingA;
      const ingC = ings[2] ? ings[2].name : ingB;

      ing1 = ingA; // Lv.1 固定第一種食材

      if (rgbSlots && rgbSlots.length >= 3 && rgbSlots[0] && rgbSlots[1] && rgbSlots[2]) {
        const c1 = rgbSlots[0];
        const c2 = rgbSlots[1];
        const c3 = rgbSlots[2];

        // Lv.30: 判斷 Slot 2 與 Slot 1 色彩距離
        const dist12 = Math.sqrt(
          Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2)
        );
        if (dist12 > 25 && ingB !== ingA) {
          ing2 = ingB;
        } else {
          ing2 = ingA;
        }

        // Lv.60: 判斷 Slot 3
        const dist13 = Math.sqrt(
          Math.pow(c1.r - c3.r, 2) + Math.pow(c1.g - c3.g, 2) + Math.pow(c1.b - c3.b, 2)
        );
        if (dist13 < 30) {
          ing3 = ingA;
        } else {
          const dist23 = Math.sqrt(
            Math.pow(c2.r - c3.r, 2) + Math.pow(c2.g - c3.g, 2) + Math.pow(c2.b - c3.b, 2)
          );
          if (dist23 < 30 && ing2 === ingB) {
            ing3 = ingB;
          } else if (ings.length > 2) {
            ing3 = ingC;
          } else {
            ing3 = ingB;
          }
        }
      } else {
        ing2 = ingB;
        ing3 = ingA;
      }
    }

    return {
      name: bestPkm ? bestPkm.name_cn : (allPokemons[0] ? allPokemons[0].name_cn : ''),
      pokemonId: bestPkm ? bestPkm.id : (allPokemons[0] ? allPokemons[0].id : ''),
      type: bestPkm ? bestPkm.type : (allPokemons[0] ? allPokemons[0].type : ''),
      specialty: bestPkm ? bestPkm.specialty : (allPokemons[0] ? allPokemons[0].specialty : ''),
      level,
      skillLevel: foundSkillLevel ? skillLevel : getEffectiveSkillLevel({ level, subskills: finalSubskills }, bestPkm),
      ribbon: deducedRibbon,
      nature,
      subskills: finalSubskills,
      ing1,
      ing2,
      ing3
    };
  }

  async function parsePokemonScreenshot(imageSrc) {
    let worker = null;
    try {
      if (window.Tesseract) {
        worker = await window.Tesseract.createWorker('chi_tra+eng');
      }
      const res = await parsePokemonScreenshotWithWorker(imageSrc, worker);
      if (worker) await worker.terminate();
      return res;
    } catch (e) {
      if (worker) try { await worker.terminate(); } catch (err) {}
      throw e;
    }
  }

  async function parsePokemonScreenshotWithWorker(imageSrc, worker) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        let result = {
          name: '',
          level: 30,
          skillLevel: 1,
          ribbon: 0,
          nature: '固執',
          ing1: '',
          ing2: '',
          ing3: '',
          subskills: []
        };

        try {
          if (worker) {
            let compositeCanvas = null;
            let rgbSlots = [];
            let meta = null;
            if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
              try {
                const prep = buildOcrCompositeCanvas(img);
                compositeCanvas = prep.compositeCanvas;
                rgbSlots = prep.rgbSlots;
                meta = prep.meta;
              } catch (prepErr) {
                console.warn('[OCR Preprocess Warning]:', prepErr);
              }
            }

            const targetSource = compositeCanvas || img;
            const ret = await worker.recognize(targetSource);
            const text = ret.data.text || '';

            result = parsePokemonFromOcr(text, rgbSlots, allPokemonsRef, meta);
          }
        } catch (ocrErr) {
          console.warn('[OCR Engine Warning]:', ocrErr);
        }

        // 預設填補
        if (!result.name && allPokemonsRef.length > 0) {
          result.name = allPokemonsRef[0].name_cn;
          result.pokemonId = allPokemonsRef[0].id;
          result.type = allPokemonsRef[0].type;
          result.specialty = allPokemonsRef[0].specialty;
        }

        resolve(result);
      };
      img.onerror = () => {
        resolve({
          name: allPokemonsRef[0] ? allPokemonsRef[0].name_cn : '',
          level: 30,
          skillLevel: 1,
          ribbon: 0,
          nature: '固執',
          subskills: [],
          ing1: '',
          ing2: '',
          ing3: ''
        });
      };
      img.src = imageSrc;
    });
  }

  /* ─── 浮動 Toast 系統 ─────────────────────────────────────── */
  function showBoxToast(title, message, type = 'success') {
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      return window.showToast(title, message, type);
    }
    let container = document.getElementById('box-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'box-toast-container';
      container.className = 'box-toast-container';
      if (document.body) {
        document.body.appendChild(container);
      }
    }

    const toast = document.createElement('div');
    toast.className = `box-toast-item toast-${type}`;
    toast.innerHTML = `
      <div class="box-toast-icon">[i]</div>
      <div class="box-toast-body">
        <div class="box-toast-title">${escapeHtml(title)}</div>
        <div class="box-toast-msg">${escapeHtml(message)}</div>
      </div>
      <button type="button" class="box-toast-close" onclick="this.parentElement && this.parentElement.remove()">✕</button>
    `;

    if (container && typeof container.appendChild === 'function') {
      container.appendChild(toast);
    }

    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.classList.add('toast-fadeout');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
    return toast;
  }

  /* ─── 備份匯出與匯入 ─────────────────────────────────────── */
  function exportBoxJSON() {
    if (userBox.length === 0) {
      showBoxToast('匯出提醒', '倉庫內目前沒有任何寶可夢可匯出！', 'warning');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userBox, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pokemon_sleep_box_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function importBoxJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          if (confirm(`確定要匯入 ${imported.length} 隻寶可夢嗎？（將合併至現有倉庫）`)) {
            const existingUids = new Set(userBox.map(p => p.uid));
            imported.forEach(item => {
              if (!item.uid || existingUids.has(item.uid)) {
                item.uid = 'pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
              }
              userBox.push(item);
            });
            saveUserBox();
            renderBox();
            showBoxToast('匯入成功', `成功匯入 ${imported.length} 隻寶可夢！`, 'success');
          }
        } else {
          showBoxToast('匯入失敗', '匯入檔案格式錯誤，請確認為正確的 JSON 備份檔！', 'warning');
        }
      } catch (err) {
        showBoxToast('解析失敗', '解析 JSON 備份檔案失敗：' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  /* ─── XSS 防護 ───────────────────────────────────────── */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─── 初始化事件監聽器 ───────────────────────────────────── */
  let boxEventsInitialized = false;
  function initBoxEvents() {
    loadUserBox();
    initBoxFilters();
    if (boxEventsInitialized) return;
    boxEventsInitialized = true;

    // 1. 拖曳上傳與截圖掃描
    const dropzone = document.getElementById('box-dropzone');
    const fileInput = document.getElementById('box-file-input');
    const manualBtn = document.getElementById('box-manual-add-btn');
    const exportBtn = document.getElementById('box-export-btn');
    const importInput = document.getElementById('box-import-input');

    const settingsExportBtn = document.getElementById('settings-export-box-btn');
    const settingsImportInput = document.getElementById('settings-import-box-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        handleScreenshotFiles(e.target.files);
        fileInput.value = '';
      });

      // 拖曳事件
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleScreenshotFiles(e.dataTransfer.files);
        }
      });
    }

    const uploadBtn = document.getElementById('box-upload-btn');
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
    }

    const toggleGuideBtn = document.getElementById('box-toggle-guide-btn');
    if (toggleGuideBtn) {
      toggleGuideBtn.addEventListener('click', () => {
        boxUserForcedGuideVisible = !boxUserForcedGuideVisible;
        syncBoxVisibility();
      });
    }

    // 全域剪貼簿貼上監聽 (Ctrl+V / Cmd+V 支援單張或多張截圖連續入庫)
    window.addEventListener('paste', (e) => {
      const panelBox = document.getElementById('panel-box');
      if (panelBox && panelBox.style.display !== 'none') {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        const imageBlobs = [];
        for (let index in items) {
          const item = items[index];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            imageBlobs.push(item.getAsFile());
          }
        }
        if (imageBlobs.length > 0) {
          handleScreenshotFiles(imageBlobs);
        }
      }
    });

    // 1.5 標準截圖指引卡片與 Lightbox 大圖彈窗
    const guideToggleBtn = document.getElementById('box-guide-toggle-btn');
    const guideBody = document.getElementById('box-guide-body');
    const guideThumbWrap = document.getElementById('box-guide-thumb-wrap');
    const guideLightbox = document.getElementById('box-guide-lightbox-modal');
    const guideLightboxClose = document.getElementById('box-guide-lightbox-close');

    if (guideToggleBtn && guideBody) {
      guideToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isCollapsed = guideBody.style.display === 'none';
        guideBody.style.display = isCollapsed ? 'flex' : 'none';
        guideToggleBtn.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
        const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
        guideToggleBtn.textContent = isCollapsed 
          ? (isEN ? 'Collapse' : '收合說明') 
          : (isEN ? 'Expand Guide' : '展開說明');
      });
    }

    if (guideThumbWrap && guideLightbox) {
      guideThumbWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(guideLightbox);
        guideLightbox.style.display = 'flex'; if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(guideLightbox);
      });
    }

    if (guideLightboxClose && guideLightbox) {
      guideLightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.animateOverlayClose === 'function') window.animateOverlayClose(guideLightbox, () => { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); });
        else { guideLightbox.style.display = 'none'; if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); }
      });
    }

    if (guideLightbox) {
      guideLightbox.addEventListener('click', (e) => {
        if (e.target === guideLightbox) {
          if (typeof window.animateOverlayClose === 'function') window.animateOverlayClose(guideLightbox, () => { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); });
        else { guideLightbox.style.display = 'none'; if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); }
        }
      });
    }

    if (manualBtn) {
      manualBtn.addEventListener('click', () => openBoxEditModal());
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportBoxJSON);
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBoxJSON(e.target.files[0]);
          importInput.value = '';
        }
      });
    }

    if (settingsExportBtn) {
      settingsExportBtn.addEventListener('click', exportBoxJSON);
    }

    if (settingsImportInput) {
      settingsImportInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBoxJSON(e.target.files[0]);
          settingsImportInput.value = '';
        }
      });
    }

    // 2. 編輯彈窗表單監聽
    const form = document.getElementById('box-edit-form');
    if (form) form.addEventListener('submit', handleFormSave);

    const closeBtn = document.getElementById('box-modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeBoxEditModal);

    const cancelBtn = document.getElementById('box-modal-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeBoxEditModal);

    const modal = document.getElementById('box-edit-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBoxEditModal();
      });
    }

    // 3. 倉庫搜尋與一鍵清空
    const searchInput = document.getElementById('box-search-input');
    const boxSearchClear = document.getElementById('box-search-clear');

    function updateBoxClearBtn() {
      if (!searchInput) return;
      if (typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
        window.updateSearchInputHighlight(searchInput, boxSearchClear);
      } else if (boxSearchClear) {
        boxSearchClear.style.display = searchInput.value.trim() ? 'flex' : 'none';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        updateBoxClearBtn();
        renderBox();
      });

      if (boxSearchClear) {
        boxSearchClear.addEventListener('click', () => {
          searchInput.value = '';
          currentSearch = '';
          updateBoxClearBtn();
          searchInput.focus();
          renderBox();
        });
      }
    }

    const sortSelect = document.getElementById('box-sort-select');
    if (sortSelect) {
      if (typeof window.setupCustomSelect === 'function') {
        window.setupCustomSelect(sortSelect);
      }
      sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderBox();
      });
    }

    // 4. 視圖切換
    const toggleGridBtn = document.getElementById('box-toggle-grid');
    const toggleTableBtn = document.getElementById('box-toggle-table');
    if (toggleGridBtn && toggleTableBtn) {
      toggleGridBtn.addEventListener('click', () => {
        boxViewMode = 'grid';
        toggleGridBtn.classList.add('active');
        toggleTableBtn.classList.remove('active');
        renderBox();
      });
      toggleTableBtn.addEventListener('click', () => {
        boxViewMode = 'table';
        toggleTableBtn.classList.add('active');
        toggleGridBtn.classList.remove('active');
        renderBox();
      });
    }

    // 5. 頂部 Segmented 子分頁切換 (寶可夢倉庫 vs 深度評測室)
    const subtabList = document.getElementById('box-subtab-list');
    const subtabLab = document.getElementById('box-subtab-lab');

    if (subtabList) subtabList.addEventListener('click', () => switchBoxSubtab('list'));
    if (subtabLab) subtabLab.addEventListener('click', () => switchBoxSubtab('lab'));

    try {
      const initialSubtab = getSavedBoxSubtab();
      if (initialSubtab === 'lab') {
        switchBoxSubtab('lab');
      }
    } catch (e) {}

    // 6. 雲端同步監聽與回調綁定 (Supabase CloudSync)
    if (typeof window !== 'undefined' && window.CloudSync) {
      let lastReceivedBoxHash = '';
      window.CloudSync.onRemoteUpdate((remoteBox) => {
        const newHash = JSON.stringify(remoteBox || []);
        let currentLocalHash = '';
        try {
          currentLocalHash = localStorage.getItem(STORAGE_KEY) || '[]';
        } catch (e) {}

        // 若雲端推送的內容與目前本地完全一樣，或與上次接收的完全一樣，直接略過，不重複渲染亦不彈出 Toast
        if (newHash === currentLocalHash || newHash === lastReceivedBoxHash) {
          return;
        }
        lastReceivedBoxHash = newHash;

        userBox = Array.isArray(remoteBox) ? remoteBox : [];
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userBox));
          }
        } catch (e) {}
        renderBox();
        if (window.AppraisalLab && typeof window.AppraisalLab.updateBoxItems === 'function') {
          window.AppraisalLab.updateBoxItems();
        }
        showBoxToast('雲端同步成功', '已從其他裝置即時同步最新寶可夢倉庫資料！', 'success');
      });

      window.CloudSync.onAuthStateChange(() => {
        loadUserBox();
        renderBox();
        if (window.AppraisalLab && typeof window.AppraisalLab.updateBoxItems === 'function') {
          window.AppraisalLab.updateBoxItems();
        }
      });
    }

    const cloudSyncBtns = document.querySelectorAll('.box-btn-cloud-sync, #box-cloud-sync-btn');
    cloudSyncBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.CloudSync && typeof window.CloudSync.openAuthModal === 'function') {
          window.CloudSync.openAuthModal();
        }
      });
    });
  }

  const STORAGE_KEY_BOX_SUBTAB = 'pksleep_active_box_subtab';
  const VALID_BOX_SUBTABS = ['list', 'lab'];

  function getSavedBoxSubtab() {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.hash) {
        const rawHash = window.location.hash.replace(/^#/, '');
        const parts = rawHash.split(/[/_?]/);
        if (parts[0] === 'box') {
          if (parts[1] === 'lab') return 'lab';
          return 'list';
        }
      }
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        const saved = storage.getItem(STORAGE_KEY_BOX_SUBTAB);
        if (VALID_BOX_SUBTABS.includes(saved)) {
          return saved;
        }
      }
    } catch (e) {}
    return 'list';
  }

  function switchBoxSubtab(tab) {
    if (!VALID_BOX_SUBTABS.includes(tab)) tab = 'list';
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        storage.setItem(STORAGE_KEY_BOX_SUBTAB, tab);
      }
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const curHash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
        const mainPart = curHash.split(/[/_?]/)[0];
        if (mainPart === 'box' || !mainPart) {
          window.history.replaceState(null, '', tab === 'list' ? '#box' : '#box/' + tab);
        }
      }
    } catch (e) {}

    const subtabList = document.getElementById('box-subtab-list');
    const subtabLab = document.getElementById('box-subtab-lab');
    const subpanelList = document.getElementById('box-subpanel-list');
    const subpanelLab = document.getElementById('box-subpanel-lab');
    const fabContainer = document.getElementById('box-fab-container');
    const desktopLabBtn = document.getElementById('box-appraisal-lab-btn');
    const panelBox = document.getElementById('panel-box');

    if (tab === 'lab') {
      if (document.body) document.body.classList.add('box-lab-active');
      if (panelBox) panelBox.classList.add('box-lab-active');
      if (subtabLab) subtabLab.classList.add('active');
      if (subtabList) subtabList.classList.remove('active');
      if (subpanelList) subpanelList.style.display = 'none';
      if (subpanelLab) subpanelLab.style.display = 'block';
      if (fabContainer && fabContainer.style) {
        fabContainer.style.display = 'none';
        if (typeof fabContainer.style.setProperty === 'function') {
          fabContainer.style.setProperty('display', 'none', 'important');
        }
      }
      if (desktopLabBtn) desktopLabBtn.classList.add('active');
      const boxSidebar = document.getElementById('box-filter-sidebar');
      const boxBookmarkHandle = document.getElementById('box-sidebar-bookmark-handle');
      const boxBackdrop = document.getElementById('box-sidebar-backdrop');
      if (boxSidebar) {
        boxSidebar.style.display = 'none';
        boxSidebar.classList.add('collapsed');
      }
      if (boxBookmarkHandle && boxBookmarkHandle.style) {
        boxBookmarkHandle.style.display = 'none';
        boxBookmarkHandle.style.opacity = '0';
        boxBookmarkHandle.style.pointerEvents = 'none';
        boxBookmarkHandle.style.visibility = 'hidden';
        if (typeof boxBookmarkHandle.style.setProperty === 'function') {
          boxBookmarkHandle.style.setProperty('display', 'none', 'important');
        }
      }
      document.querySelectorAll('#panel-box .sidebar-fab-btn, #panel-box .sidebar-bookmark-handle, #panel-box .box-fab-container').forEach(el => {
        if (el && el.style) {
          el.style.display = 'none';
          if (typeof el.style.setProperty === 'function') {
            el.style.setProperty('display', 'none', 'important');
          }
        }
      });
      if (boxBackdrop) boxBackdrop.classList.remove('active');
      const labContainer = document.getElementById('appraisal-lab-container');
      if (labContainer) {
        labContainer.style.display = 'block';
        if (window.AppraisalLab && typeof window.AppraisalLab.renderLab === 'function') {
          window.AppraisalLab.renderLab(labContainer);
        }
      }
    } else {
      if (document.body) document.body.classList.remove('box-lab-active');
      if (panelBox) panelBox.classList.remove('box-lab-active');
      if (subtabList) subtabList.classList.add('active');
      if (subtabLab) subtabLab.classList.remove('active');
      if (subpanelList) subpanelList.style.display = 'block';
      if (subpanelLab) subpanelLab.style.display = 'none';
      if (fabContainer && fabContainer.style) {
        if (typeof fabContainer.style.removeProperty === 'function') {
          fabContainer.style.removeProperty('display');
        }
        fabContainer.style.display = 'flex';
      }
      document.querySelectorAll('#panel-box .box-fab-container').forEach(el => {
        if (el && el.style && typeof el.style.removeProperty === 'function') {
          el.style.removeProperty('display');
        }
      });
      if (desktopLabBtn) desktopLabBtn.classList.remove('active');
      const boxSidebar = document.getElementById('box-filter-sidebar');
      const boxBookmarkHandle = document.getElementById('box-sidebar-bookmark-handle');
      if (boxSidebar) {
        boxSidebar.style.display = 'flex';
      }
      if (boxBookmarkHandle && boxBookmarkHandle.style) {
        if (typeof boxBookmarkHandle.style.removeProperty === 'function') {
          boxBookmarkHandle.style.removeProperty('display');
        }
        const isCollapsed = boxSidebar ? boxSidebar.classList.contains('collapsed') : true;
        if (isCollapsed) {
          boxBookmarkHandle.classList.remove('drawer-open');
          boxBookmarkHandle.style.display = 'flex';
          boxBookmarkHandle.style.opacity = '1';
          boxBookmarkHandle.style.pointerEvents = 'auto';
          boxBookmarkHandle.style.visibility = 'visible';
        }
      }
      document.querySelectorAll('#panel-box .sidebar-fab-btn, #panel-box .sidebar-bookmark-handle').forEach(el => {
        if (el && el.style && typeof el.style.removeProperty === 'function') {
          el.style.removeProperty('display');
        }
      });
      const labContainer = document.getElementById('appraisal-lab-container');
      if (labContainer && !subpanelLab) {
        labContainer.style.display = 'none';
      }
      renderBox();
    }
  }

  if (typeof window !== 'undefined') {
    window.switchBoxSubtab = switchBoxSubtab;
    window.getCurrentBoxSubtab = getSavedBoxSubtab;
    window.initUserBox = function (pokemons) {
      allPokemonsRef = pokemons || [];
      initBoxEvents();
      initBoxFilters();
      const initialSubtab = getSavedBoxSubtab();
      if (initialSubtab === 'lab') {
        switchBoxSubtab('lab');
      } else {
        renderBox();
      }
    };

    const NATURE_DICT = {};
    NATURE_DATA.forEach(n => { NATURE_DICT[n.name] = n; });

    window.PokemonBoxApp = {
      getUserBox: () => userBox,
      setUserBox: (box) => { userBox = box; saveUserBox(); renderBox(); },
      renderBox: renderBox,
      syncBoxVisibility,
      setBoxUserForcedGuideVisible: (v) => { boxUserForcedGuideVisible = v; },
      renderBoxGrid,
      renderBoxCardIngSlot,
      getIngCountFromBase,
      getCurrentSubTab: getSavedBoxSubtab,
      switchSubTab: switchBoxSubtab,
      calculatePokemonPR,
      getMainSkillMaxLevel,
      getEffectiveSkillLevel,
      getPokemonEvolutionStage,
      getSubskillLevelBonus,
      updateRibbonSelectOptions,
      updateModalMainSkill,
      deduceRibbonFromCarry,
      initPokemonCombobox,
      openBoxEditModal,
      closeBoxEditModal,
      setAllPokemons: (p) => { allPokemonsRef = p || []; },
      buildOcrCompositeCanvas,
      parsePokemonFromOcr,
      parsePokemonScreenshotWithWorker,
      NATURE_DATA,
      NATURE_DICT,
      SUBSKILLS_DATA,
      getFilteredBox,
      initBoxFilters,
      toggleBoxSidebar,
      resetBoxFilters,
      getBoxFilterState,
      setBoxFilterState
    };
    window.UserBox = window.PokemonBoxApp;
  }

  if (typeof module !== 'undefined' && module.exports) {
    const NATURE_DICT = {};
    NATURE_DATA.forEach(n => { NATURE_DICT[n.name] = n; });
    module.exports = {
      PokemonBoxApp: typeof window !== 'undefined' ? window.PokemonBoxApp : {
        getUserBox: () => userBox,
        setUserBox: (box) => { userBox = box; saveUserBox(); renderBox(); },
        renderBox: renderBox,
        syncBoxVisibility,
        setBoxUserForcedGuideVisible: (v) => { boxUserForcedGuideVisible = v; },
        renderBoxGrid,
        renderBoxCardIngSlot,
        getIngCountFromBase,
        calculatePokemonPR,
        getMainSkillMaxLevel,
        getEffectiveSkillLevel,
        getPokemonEvolutionStage,
        getSubskillLevelBonus,
        updateRibbonSelectOptions,
        updateModalMainSkill,
        deduceRibbonFromCarry,
        initPokemonCombobox,
        setAllPokemons: (p) => { allPokemonsRef = p || []; },
        buildOcrCompositeCanvas,
        parsePokemonFromOcr,
        parsePokemonScreenshotWithWorker,
        NATURE_DATA,
        NATURE_DICT,
        SUBSKILLS_DATA,
        getFilteredBox,
        initBoxFilters,
        toggleBoxSidebar,
        resetBoxFilters,
        getBoxFilterState,
        setBoxFilterState
      },
      getUserBox: () => userBox,
      setUserBox: (box) => { userBox = Array.isArray(box) ? box : []; },
      renderBox: renderBox,
      syncBoxVisibility,
      setBoxUserForcedGuideVisible: (v) => { boxUserForcedGuideVisible = v; },
      renderBoxGrid,
      renderBoxCardIngSlot,
      getIngCountFromBase,
      calculatePokemonPR,
      getMainSkillMaxLevel,
      getEffectiveSkillLevel,
      getPokemonEvolutionStage,
      getSubskillLevelBonus,
      updateRibbonSelectOptions,
      updateModalMainSkill,
      deduceRibbonFromCarry,
      initPokemonCombobox,
      setAllPokemons: (p) => { allPokemonsRef = p || []; },
      buildOcrCompositeCanvas,
      parsePokemonFromOcr,
      parsePokemonScreenshotWithWorker,
      NATURE_DATA,
      NATURE_DICT,
      SUBSKILLS_DATA,
      getFilteredBox,
      initBoxFilters,
      toggleBoxSidebar,
      resetBoxFilters,
      getBoxFilterState,
      setBoxFilterState
    };
  }
})();
