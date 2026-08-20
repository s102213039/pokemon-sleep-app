/**
 * Pokémon Sleep SPA - Bilingual Internationalization (i18n) Engine
 * Supports Traditional Chinese (zh-TW) & English (en-US)
 */

(function () {
  'use strict';

  const STORAGE_KEY_LANG = 'user_lang';
  const DEFAULT_LANG = 'zh-TW';

  const DICTIONARY = {
    'zh-TW': {
      // App Branding & Navigation
      'brand.title': 'Pokémon Sleep 資料庫',
      'brand.subtitle': '機率、食材與屬性完整線上檢索',
      'nav.pokemon': '⚡ 寶可夢圖鑑',
      'nav.recipes': '🍲 料理食譜',
      'nav.wiki': '📚 數據百科',
      'nav.box': '📦 寶可夢倉庫',
      'nav.news': '📰 最新公告',
      'nav.sync': '🔄 同步資料',
      'nav.settings': '⚙️ 設定',

      // Settings Modal
      'settings.title': '⚙️ 系統設定 (System Settings)',
      'settings.theme_section': '🎨 外觀主題風格',
      'settings.theme_desc': '提供 2 組深色與 2 組明亮主題，適配各種光線環境。',
      'settings.theme_midnight': '🌌 深邃夜空 (Midnight Navy)',
      'settings.theme_onyx': '🌑 曜石暗影 (Onyx Black)',
      'settings.theme_dawn': '☀️ 晨曦暖陽 (Dawn Amber)',
      'settings.theme_emerald': '🍃 萌綠森林 (Emerald Forest)',
      'settings.lang_section': '🌐 介面語言 (Language)',
      'settings.lang_desc': '切換全站介面文字與寶可夢資料顯示語系。',
      'settings.lang_zh': '繁體中文 (Traditional Chinese)',
      'settings.lang_en': 'English (US)',
      'settings.sync_section': '🔄 GitHub Actions 資料同步',
      'settings.sync_desc': '設定具有 workflow 權限的 GitHub PAT Token 觸發線上自動抓取。',
      'settings.save': '💾 儲存設定',
      'settings.close': '關閉',

      // Search & Filters (Pokedex)
      'pokedex.search_placeholder': '搜尋寶可夢名稱、編號 (如 0001)、屬性、食材...',
      'pokedex.filter_title': '篩選與過濾',
      'pokedex.type_label': '屬性篩選',
      'pokedex.specialty_label': '專長類型',
      'pokedex.berry_label': '樹果類型',
      'pokedex.ingredient_label': '出產食材',
      'pokedex.skill_label': '主技能',
      'pokedex.only_final': '🌟 僅看最終進化型態',
      'pokedex.view_grid': '🎴 卡片檢視',
      'pokedex.view_table': '📊 表格檢視',
      'pokedex.sort_id_asc': '🔢 全國圖鑑編號 (正序)',
      'pokedex.sort_id_desc': '🔢 全國圖鑑編號 (倒序)',
      'pokedex.sort_carry_desc': '🎒 攜帶上限 (高到低)',
      'pokedex.sort_ingredient_desc': '🥩 食材機率 (高到低)',
      'pokedex.sort_skill_desc': '⚡ 技能發動率 (高到低)',
      'pokedex.sort_interval_asc': '⏱️ 幫忙間隔 (快到慢)',

      // Table Headers
      'th.icon': '圖示',
      'th.name': '寶可夢',
      'th.type': '屬性',
      'th.specialty': '得意',
      'th.interval': '幫忙間隔',
      'th.carry': '持有',
      'th.friendship': '友情點數',
      'th.ingredient_rate': '食材率',
      'th.skill_rate': '技能率',
      'th.berry': '樹果',
      'th.main_skill': '主技能',
      'th.ing1': '食材1',
      'th.ing2': '食材2',
      'th.ing3': '食材3',
      'th.ingredients': '食材',
      'th.actions': '操作',

      // Specialties
      'spec.berry': '樹果',
      'spec.ingredient': '食材',
      'spec.skill': '技能',
      'spec.all': '全能',

      // Recipes Panel
      'recipe.title': '🍲 料理食譜大全與鍋子計算機',
      'recipe.subtitle': '精確計算食材搭配、等級加成、島嶼倍率與爆擊能量。',
      'recipe.tab_all': '全部料理',
      'recipe.tab_curry': '🍛 咖哩/濃湯',
      'recipe.tab_salad': '🥗 沙拉',
      'recipe.tab_dessert': '🍰 點心/飲料',
      'recipe.pot_size': '鍋子容量上限',
      'recipe.island_bonus': '島嶼產地加成',
      'recipe.recipe_level': '料理等級 (Lv.1~60)',
      'recipe.tasty_mult': '美味爆擊 (Tasty)',
      'recipe.tasty_normal': '一般成功 (1.0x)',
      'recipe.tasty_crit': '週日大成功 (3.0x)',

      // Wiki Panel
      'wiki.title': '📚 數據百科與攻略知識庫',
      'wiki.tab_skills': '⚡ 主技能數值庫',
      'wiki.tab_subskills': '🧩 副技能與性格指南',
      'wiki.tab_ratings': '🎓 培育與評級指南',
      'wiki.tab_ladder': '🥗 Lv.60 食材天梯榜',
      'wiki.tab_values': '🫐 樹果與食材能量',
      'ladder.search_placeholder': '跨軌道搜尋寶可夢...',
      'ladder.filter_all': '全部',
      'ladder.filter_aaa': '👑 僅看 AAA',
      'ladder.filter_top': '🥈 僅看 TOP 1-2',
      'ladder.ing_m_toggle': '🥩 食材機率M (+36%)',
      'ladder.speed_m_toggle': '⚡ 幫速M (+16.3%)',

      // Box & Appraisal
      'box.title': '📦 我的寶可夢倉庫 & 截圖智能辨識',
      'box.appraisal_lab_btn': '🔮 深度評測室',
      'box.manual_add': '➕ 手動新增寶可夢',
      'box.export': '💾 匯出備份',
      'box.import': '📥 匯入還原',
      'box.dropzone_title': '點擊或多選/批次拖曳「寶可夢資料截圖」至此，或直接按 Ctrl+V / Cmd+V 貼上',
      'box.dropzone_sub': '自動批次辨識：寶可夢名稱 · 等級 · Lv.1/30/60 食材組合 · 5 格副技能 · 性格加成 · 智能防重保護',
      'appraisal.title': '🔮 寶可夢生涯診斷評測報告書',
      'appraisal.radar_berry': '樹果產能',
      'appraisal.radar_ing': '食材產能',
      'appraisal.radar_skill': '技能強度',
      'appraisal.radar_speed': '幫忙速度',
      'appraisal.radar_growth': '後期成長',
      'appraisal.radar_roi': '資源效益',

      // News & Timeline
      'news.title': '📰 最新活動與官方更新公告',
      'news.timeline_title': '⏰ 官方活動日程時間軸'
    },

    'en-US': {
      // App Branding & Navigation
      'brand.title': 'Pokémon Sleep Database',
      'brand.subtitle': 'Comprehensive Stats, Rates, Ingredients & Pokedex',
      'nav.pokemon': '⚡ Pokédex',
      'nav.recipes': '🍲 Recipes',
      'nav.wiki': '📚 Wiki & Guide',
      'nav.box': '📦 Pokémon Box',
      'nav.news': '📰 News & Events',
      'nav.sync': '🔄 Sync Data',
      'nav.settings': '⚙️ Settings',

      // Settings Modal
      'settings.title': '⚙️ System Settings',
      'settings.theme_section': '🎨 Appearance Theme',
      'settings.theme_desc': 'Choose from 2 Dark and 2 Light themes tailored for any lighting condition.',
      'settings.theme_midnight': '🌌 Midnight Navy (Dark)',
      'settings.theme_onyx': '🌑 Onyx Black (OLED Dark)',
      'settings.theme_dawn': '☀️ Dawn Amber (Warm Light)',
      'settings.theme_emerald': '🍃 Emerald Forest (Fresh Light)',
      'settings.lang_section': '🌐 Interface Language',
      'settings.lang_desc': 'Switch the display language for all interface text and data.',
      'settings.lang_zh': '繁體中文 (Traditional Chinese)',
      'settings.lang_en': 'English (US)',
      'settings.sync_section': '🔄 GitHub Actions Sync',
      'settings.sync_desc': 'Configure a GitHub PAT with workflow scope to trigger automatic live updates.',
      'settings.save': '💾 Save Settings',
      'settings.close': 'Close',

      // Search & Filters (Pokedex)
      'pokedex.search_placeholder': 'Search Pokémon by name, No. (e.g. 0001), type, ingredient...',
      'pokedex.filter_title': 'Filters & Criteria',
      'pokedex.type_label': 'Pokémon Type',
      'pokedex.specialty_label': 'Specialty',
      'pokedex.berry_label': 'Berry Type',
      'pokedex.ingredient_label': 'Ingredients',
      'pokedex.skill_label': 'Main Skill',
      'pokedex.only_final': '🌟 Final Evolutions Only',
      'pokedex.view_grid': '🎴 Card View',
      'pokedex.view_table': '📊 Table View',
      'pokedex.sort_id_asc': '🔢 Pokedex No. (Asc)',
      'pokedex.sort_id_desc': '🔢 Pokedex No. (Desc)',
      'pokedex.sort_carry_desc': '🎒 Carry Limit (High to Low)',
      'pokedex.sort_ingredient_desc': '🥩 Ingredient Rate (High to Low)',
      'pokedex.sort_skill_desc': '⚡ Skill Trigger Rate (High to Low)',
      'pokedex.sort_interval_asc': '⏱️ Frequency (Fast to Slow)',

      // Table Headers
      'th.icon': 'Icon',
      'th.name': 'Pokémon',
      'th.type': 'Type',
      'th.specialty': 'Specialty',
      'th.interval': 'Frequency',
      'th.carry': 'Carry',
      'th.friendship': 'Friendship',
      'th.ingredient_rate': 'Ing. Rate',
      'th.skill_rate': 'Skill Rate',
      'th.berry': 'Berry',
      'th.main_skill': 'Main Skill',
      'th.ing1': 'Ing 1',
      'th.ing2': 'Ing 2',
      'th.ing3': 'Ing 3',
      'th.ingredients': 'Ingredients',
      'th.actions': 'Actions',

      // Specialties
      'spec.berry': 'Berries',
      'spec.ingredient': 'Ingredients',
      'spec.skill': 'Skills',
      'spec.all': 'All-Rounder',

      // Recipes Panel
      'recipe.title': '🍲 Recipe Compendium & Pot Calculator',
      'recipe.subtitle': 'Calculate ingredient formulas, level multipliers, island bonuses & extra tasty power.',
      'recipe.tab_all': 'All Dishes',
      'recipe.tab_curry': '🍛 Curries & Stews',
      'recipe.tab_salad': '🥗 Salads',
      'recipe.tab_dessert': '🍰 Desserts & Drinks',
      'recipe.pot_size': 'Pot Size Limit',
      'recipe.island_bonus': 'Island Bonus',
      'recipe.recipe_level': 'Recipe Level (Lv.1~60)',
      'recipe.tasty_mult': 'Extra Tasty Multiplier',
      'recipe.tasty_normal': 'Normal Success (1.0x)',
      'recipe.tasty_crit': 'Sunday Critical (3.0x)',

      // Wiki Panel
      'wiki.title': '📚 Strategy & Encyclopedia Knowledge Base',
      'wiki.tab_skills': '⚡ Main Skills Matrix',
      'wiki.tab_subskills': '🧩 Sub-Skills & Natures',
      'wiki.tab_ratings': '🎓 Tier Lists & Guide',
      'wiki.tab_ladder': '🥗 Lv.60 Ingredients Ladder',
      'wiki.tab_values': '🫐 Berry & Ingredient Values',
      'ladder.search_placeholder': 'Search Pokémon across tracks...',
      'ladder.filter_all': 'All',
      'ladder.filter_aaa': '👑 AAA Mono Only',
      'ladder.filter_top': '🥈 TOP 1-2 Only',
      'ladder.ing_m_toggle': '🥩 Ing. Finder M (+36%)',
      'ladder.speed_m_toggle': '⚡ Helping Speed M (+16.3%)',

      // Box & Appraisal
      'box.title': '📦 My Pokémon Box & Smart OCR Scanner',
      'box.appraisal_lab_btn': '🔮 Appraisal Lab',
      'box.manual_add': '➕ Add Pokémon Manually',
      'box.export': '💾 Export Backup',
      'box.import': '📥 Import Backup',
      'box.dropzone_title': 'Click or batch drag & drop Pokémon screenshots here, or paste with Ctrl+V / Cmd+V',
      'box.dropzone_sub': 'Batch auto-recognition: Name · Level · Lv.1/30/60 Ingredients · 5 Sub-skills · Nature · Smart Deduplication',
      'appraisal.title': '🔮 Deep Dive Pokémon Appraisal Report',
      'appraisal.radar_berry': 'Berry Output',
      'appraisal.radar_ing': 'Ingredient Output',
      'appraisal.radar_skill': 'Skill Potency',
      'appraisal.radar_speed': 'Helping Speed',
      'appraisal.radar_growth': 'Late-Game Scaling',
      'appraisal.radar_roi': 'Resource ROI',

      // News & Timeline
      'news.title': '📰 Latest Events & Official News',
      'news.timeline_title': '⏰ Official Event Schedule Timeline'
    }
  };

  // 屬性名稱對照
  const TYPE_NAMES = {
    '一般': { 'zh-TW': '一般', 'en-US': 'Normal' },
    '草': { 'zh-TW': '草', 'en-US': 'Grass' },
    '火': { 'zh-TW': '火', 'en-US': 'Fire' },
    '水': { 'zh-TW': '水', 'en-US': 'Water' },
    '電': { 'zh-TW': '電', 'en-US': 'Electric' },
    '冰': { 'zh-TW': '冰', 'en-US': 'Ice' },
    '格鬥': { 'zh-TW': '格鬥', 'en-US': 'Fighting' },
    '毒': { 'zh-TW': '毒', 'en-US': 'Poison' },
    '地面': { 'zh-TW': '地面', 'en-US': 'Ground' },
    '飛行': { 'zh-TW': '飛行', 'en-US': 'Flying' },
    '超能力': { 'zh-TW': '超能力', 'en-US': 'Psychic' },
    '蟲': { 'zh-TW': '蟲', 'en-US': 'Bug' },
    '岩石': { 'zh-TW': '岩石', 'en-US': 'Rock' },
    '幽靈': { 'zh-TW': '幽靈', 'en-US': 'Ghost' },
    '龍': { 'zh-TW': '龍', 'en-US': 'Dragon' },
    '惡': { 'zh-TW': '惡', 'en-US': 'Dark' },
    '鋼': { 'zh-TW': '鋼', 'en-US': 'Steel' },
    '妖精': { 'zh-TW': '妖精', 'en-US': 'Fairy' }
  };

  // 專長名稱對照
  const SPECIALTY_NAMES = {
    '樹果': { 'zh-TW': '樹果', 'en-US': 'Berries' },
    '食材': { 'zh-TW': '食材', 'en-US': 'Ingredients' },
    '技能': { 'zh-TW': '技能', 'en-US': 'Skills' },
    '全能': { 'zh-TW': '全能', 'en-US': 'All-Rounder' }
  };

  // 食材名稱對照
  const INGREDIENT_NAMES = {
    '特選蘋果': { 'zh-TW': '特選蘋果', 'en-US': 'Fancy Apple' },
    '哞哞鮮奶': { 'zh-TW': '哞哞鮮奶', 'en-US': 'Moomoo Milk' },
    '萌綠大豆': { 'zh-TW': '萌綠大豆', 'en-US': 'Greengrass Soybeans' },
    '甜甜蜜': { 'zh-TW': '甜甜蜜', 'en-US': 'Honey' },
    '豆製肉': { 'zh-TW': '豆製肉', 'en-US': 'Bean Sausage' },
    '暖暖薑': { 'zh-TW': '暖暖薑', 'en-US': 'Warming Ginger' },
    '好眠番茄': { 'zh-TW': '好眠番茄', 'en-US': 'Snoozy Tomato' },
    '特選蛋': { 'zh-TW': '特選蛋', 'en-US': 'Fancy Egg' },
    '純粹油': { 'zh-TW': '純粹油', 'en-US': 'Pure Oil' },
    '窩心洋芋': { 'zh-TW': '窩心洋芋', 'en-US': 'Soft Potato' },
    '火辣香草': { 'zh-TW': '火辣香草', 'en-US': 'Fiery Herb' },
    '萌綠玉米': { 'zh-TW': '萌綠玉米', 'en-US': 'Greengrass Corn' },
    '放鬆可可': { 'zh-TW': '放鬆可可', 'en-US': 'Soothing Cacao' },
    '醒腦咖啡豆': { 'zh-TW': '醒腦咖啡豆', 'en-US': 'Rousing Coffee' },
    '嫩亮酪梨': { 'zh-TW': '嫩亮酪梨', 'en-US': 'Glossy Avocado' },
    '品鮮蘑菇': { 'zh-TW': '品鮮蘑菇', 'en-US': 'Tasty Mushroom' },
    '粗枝大蔥': { 'zh-TW': '粗枝大蔥', 'en-US': 'Large Leek' },
    '沉甸甸南瓜': { 'zh-TW': '沉甸甸南瓜', 'en-US': 'Plump Pumpkin' },
    '美味尾巴': { 'zh-TW': '美味尾巴', 'en-US': 'Slowpoke Tail' }
  };

  // 性格名稱對照 (25 種官方性格)
  const NATURE_NAMES = {
    '固執': { 'zh-TW': '固執', 'en-US': 'Adamant' },
    '怕寂寞': { 'zh-TW': '怕寂寞', 'en-US': 'Lonely' },
    '勇敢': { 'zh-TW': '勇敢', 'en-US': 'Brave' },
    '頑皮': { 'zh-TW': '頑皮', 'en-US': 'Naughty' },
    '大膽': { 'zh-TW': '大膽', 'en-US': 'Bold' },
    '淘氣': { 'zh-TW': '淘氣', 'en-US': 'Impish' },
    '悠閒': { 'zh-TW': '悠閒', 'en-US': 'Relaxed' },
    '樂天': { 'zh-TW': '樂天', 'en-US': 'Lax' },
    '內斂': { 'zh-TW': '內斂', 'en-US': 'Modest' },
    '慢吞吞': { 'zh-TW': '慢吞吞', 'en-US': 'Mild' },
    '冷靜': { 'zh-TW': '冷靜', 'en-US': 'Quiet' },
    '馬虎': { 'zh-TW': '馬虎', 'en-US': 'Rash' },
    '溫和': { 'zh-TW': '溫和', 'en-US': 'Calm' },
    '溫順': { 'zh-TW': '溫順', 'en-US': 'Gentle' },
    '慎重': { 'zh-TW': '慎重', 'en-US': 'Careful' },
    '自大': { 'zh-TW': '自大', 'en-US': 'Sassy' },
    '膽小': { 'zh-TW': '膽小', 'en-US': 'Timid' },
    '急躁': { 'zh-TW': '急躁', 'en-US': 'Hasty' },
    '爽朗': { 'zh-TW': '爽朗', 'en-US': 'Jolly' },
    '天真': { 'zh-TW': '天真', 'en-US': 'Naive' },
    '坦率': { 'zh-TW': '坦率', 'en-US': 'Hardy' },
    '認真': { 'zh-TW': '認真', 'en-US': 'Docile' },
    '害羞': { 'zh-TW': '害羞', 'en-US': 'Bashful' },
    '浮躁': { 'zh-TW': '浮躁', 'en-US': 'Quirky' },
    '勤奮': { 'zh-TW': '勤奮', 'en-US': 'Serious' }
  };

  // 當前語言狀態
  let currentLang = DEFAULT_LANG;

  function initLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && (saved === 'zh-TW' || saved === 'en-US')) {
        currentLang = saved;
      }
    } catch (e) {}
  }

  function getLanguage() {
    return currentLang;
  }

  function setLanguage(lang) {
    if (lang !== 'zh-TW' && lang !== 'en-US') return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {}

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', lang === 'zh-TW' ? 'zh-Hant' : 'en');
      updatePageTranslations();
    }

    // 通知各模組刷新
    if (typeof window !== 'undefined') {
      if (window.PokemonApp && typeof window.PokemonApp.render === 'function') {
        window.PokemonApp.render();
      }
      if (window.RecipesApp && typeof window.RecipesApp.render === 'function') {
        window.RecipesApp.render();
      }
      if (window.WikiDB && typeof window.WikiDB.refreshCoordinateLadder === 'function') {
        window.WikiDB.refreshCoordinateLadder();
      }
      if (window.PokemonBoxApp && typeof window.PokemonBoxApp.renderBox === 'function') {
        window.PokemonBoxApp.renderBox();
      }
    }
  }

  function t(key, fallback = '') {
    const dict = DICTIONARY[currentLang] || DICTIONARY[DEFAULT_LANG];
    return dict[key] || fallback || key;
  }

  function getTypeName(type) {
    if (!type) return '';
    const item = TYPE_NAMES[type];
    return item ? (item[currentLang] || type) : type;
  }

  function getSpecialtyName(spec) {
    if (!spec) return '';
    const item = SPECIALTY_NAMES[spec];
    return item ? (item[currentLang] || spec) : spec;
  }

  function getIngredientName(ing) {
    if (!ing) return '';
    const item = INGREDIENT_NAMES[ing];
    return item ? (item[currentLang] || ing) : ing;
  }

  function getNatureName(nat) {
    if (!nat) return '';
    const item = NATURE_NAMES[nat];
    return item ? (item[currentLang] || nat) : nat;
  }

  function updatePageTranslations() {
    if (typeof document === 'undefined') return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key, el.textContent);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', t(key, el.getAttribute('placeholder')));
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', t(key, el.getAttribute('title')));
      }
    });
  }

  initLanguage();

  const I18NExport = {
    t,
    getLanguage,
    setLanguage,
    getTypeName,
    getSpecialtyName,
    getIngredientName,
    getNatureName,
    updatePageTranslations,
    DICTIONARY,
    TYPE_NAMES,
    SPECIALTY_NAMES,
    INGREDIENT_NAMES,
    NATURE_NAMES
  };

  if (typeof window !== 'undefined') {
    window.I18N = I18NExport;
    window.t = t;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18NExport;
  }
})();
