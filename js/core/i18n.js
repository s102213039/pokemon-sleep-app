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
      'pokedex.search_placeholder': '搜尋寶可夢名稱 (中/英/日) 或 No. 編號...',
      'pokedex.filter_bookmark': '篩選',
      'pokedex.filter_sidebar_title': '圖鑑篩選器',
      'pokedex.reset_all': '全部重設',
      'pokedex.only_final': '👑 僅最終進化',
      'pokedex.only_initial_ing': '🥗 僅初始食材',
      'pokedex.specialty_title': '專長類型',
      'pokedex.berry_title': '樹果類型',
      'pokedex.ingredient_title': '出產食材',
      'pokedex.skill_title': '主技能',
      'pokedex.clear': '清空',
      'pokedex.view_cards': '🎴 卡片',
      'pokedex.view_table': '📊 表格',
      'pokedex.sort_id_asc': '🔢 全國圖鑑編號 (正序)',
      'pokedex.sort_id_desc': '🔢 全國圖鑑編號 (倒序)',
      'pokedex.sort_carry_desc': '🎒 攜帶上限 (高到低)',
      'pokedex.sort_ingredient_desc': '🥩 食材機率 (高到低)',
      'pokedex.sort_skill_desc': '⚡ 技能發動率 (高到低)',
      'pokedex.sort_interval_asc': '⏱️ 幫忙間隔 (快到慢)',
      'pokedex.loading': '資料載入中，請稍候...',
      'pokedex.no_results': '沒有符合篩選條件的寶可夢',
      'pokedex.no_results_desc': '找不到符合條件的寶可夢，請調整篩選條件或重置搜尋。',
      'pokedex.count_label': '隻寶可夢',

      // Table Headers & Card Labels
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

      'card.type': '屬性',
      'card.specialty': '得意',
      'card.carry': '持有',
      'card.ing_rate': '食材率',
      'card.skill_rate': '技能率',
      'card.interval': '幫忙',
      'card.skill': '主技能',

      // Specialties
      'spec.berry': '樹果',
      'spec.ingredient': '食材',
      'spec.skill': '技能',
      'spec.all': '全能',

      // Recipes Panel
      'recipe.search_placeholder': '搜尋食譜名稱 (中/英) 或食材關鍵字...',
      'recipe.view_cards': '🎴 卡片',
      'recipe.view_table': '📊 表格',
      'recipe.sort_energy_desc': '食譜能量 ↓（高→低）',
      'recipe.sort_energy_asc': '食譜能量 ↑（低→高）',
      'recipe.sort_pot_asc': '鍋子容量 ↑（小→大）',
      'recipe.sort_pot_desc': '鍋子容量 ↓（大→小）',
      'recipe.sort_bonus_desc': '食材加成 ↓（高→低）',
      'recipe.sort_name_asc': '名稱排序',
      'recipe.category_label': '料理種類',
      'recipe.bonus_label': '最低食譜加成',
      'recipe.pot_label': '最低鍋子容量',
      'recipe.all': '全部',
      'recipe.cat_curry': '🍛 咖哩/濃湯',
      'recipe.cat_salad': '🥗 沙拉',
      'recipe.cat_dessert': '🍰 點心/飲料',
      'recipe.slider_level': '📖 食譜等級',
      'recipe.slider_level_desc': '等級加成非線性，Lv.70 最高可達 +258%',
      'recipe.slider_island': '🏝️ 島嶼能量加成',
      'recipe.slider_island_desc': '0%→85%，每格 +5%（×1.00 ～ ×1.85）',
      'recipe.slider_event': '🎉 活動能量加成',
      'recipe.slider_event_desc': '1.00x→2.50x，每格 +0.25x（活動限定倍率）',
      'recipe.tasty_toggle': '漂亮成功分數',
      'recipe.filter_included': '🟢 包含食材篩選',
      'recipe.filter_excluded': '🔴 排除食材篩選',
      'recipe.match_any': '含任一',
      'recipe.match_all': '全部符合',
      'recipe.clear_all': '全部清除',
      'recipe.clear_excluded': '清除排除',
      'recipe.included_hint': '點擊食材圖示，只顯示<strong>包含</strong>該食材的食譜',
      'recipe.excluded_hint': '點擊食材圖示，<strong>隱藏</strong>包含該食材的食譜（與「包含食材」互斥）',
      'recipe.count_badge': '道食譜',
      'recipe.th_dish': '料理名稱',
      'recipe.th_category': '種類',
      'recipe.th_pot': '鍋子容量',
      'recipe.th_ingredients': '食材需求',
      'recipe.th_base_energy': '基礎能量',
      'recipe.th_bonus': '加成',
      'recipe.th_final_energy': '預估能量',

      // Wiki Panel
      'wiki.title': '📚 數據百科與攻略知識庫',
      'wiki.tab_skills': '⚡ 主技能數值庫',
      'wiki.tab_subskills': '🧩 副技能與性格指南',
      'wiki.tab_ratings': '🎓 培育與評級指南',
      'wiki.tab_ladder': '🥗 Lv.60 食材天梯榜',
      'wiki.tab_values': '🫐 樹果與食材能量',
      'wiki.skill_type_label': '技能類型：',
      'wiki.skill_all': '全部技能 (22)',
      'wiki.skill_energy': '⚡ 能量系',
      'wiki.skill_energy_heal': '💖 活力系',
      'wiki.skill_ingredient': '🥗 食材與料理',
      'wiki.skill_special': '👑 神獸與特殊專屬',
      'wiki.skill_shards': '💎 夢之碎片',
      'ladder.search_placeholder': '跨軌道搜尋寶可夢...',
      'ladder.filter_all': '全部',
      'ladder.filter_aaa': '👑 僅看 AAA',
      'ladder.filter_top': '🥈 僅看 TOP 1-2',
      'ladder.ing_m_toggle': '🥩 食材機率M (+36%)',
      'ladder.speed_m_toggle': '⚡ 幫速M (+16.3%)',

      // Box & Appraisal
      'box.title': '📦 我的寶可夢倉庫 & 截圖智能辨識',
      'box.desc': '支援上傳遊戲截圖自動辨識等級、食材組合、副技能與性格，亦可隨時手動錄入與編輯。',
      'box.appraisal_lab_btn': '🔮 深度評測室',
      'box.manual_add': '➕ 手動新增寶可夢',
      'box.export': '💾 匯出備份',
      'box.import': '📥 匯入還原',
      'box.dropzone_title': '點擊或多選/批次拖曳「寶可夢資料截圖」至此，或直接按 Ctrl+V / Cmd+V 貼上',
      'box.dropzone_sub': '自動批次辨識：寶可夢名稱 · 等級 · Lv.1/30/60 食材組合 · 5 格副技能 · 性格加成 · 智能防重保護',
      'box.search_placeholder': '搜尋倉庫寶可夢名稱、暱稱、性格、副技能...',
      'box.sort_pr_desc': '👑 PR 評分由高到低',
      'box.sort_created_desc': '📅 最近加入',
      'box.sort_level_desc': '⚡ 等級由高到低',
      'box.sort_level_asc': '🌱 等級由低到高',
      'box.sort_pr_asc': '📉 PR 評分由低到高',
      'box.sort_id_asc': '🔢 全國圖鑑編號',
      'box.view_cards': '🎴 卡片',
      'box.view_table': '📊 表格',
      'box.empty_title': '您的寶可夢倉庫目前是空的',
      'box.empty_desc': '請拖曳截圖至上方辨識區，或點擊「手動新增」開始記錄！',
      'appraisal.title': '🔮 寶可夢生涯診斷評測報告書',
      'appraisal.radar_berry': '樹果產能',
      'appraisal.radar_ing': '食材產能',
      'appraisal.radar_skill': '技能強度',
      'appraisal.radar_speed': '幫忙速度',
      'appraisal.radar_growth': '後期成長',
      'appraisal.radar_roi': '資源效益',

      // News & Timeline
      'news.title': '📰 最新活動與官方更新公告',
      'news.timeline_title': '⏰ 官方活動日程時間軸',
      'news.search_placeholder': '搜尋公告標題、關鍵字、寶可夢...',
      'news.cat_all': '全部公告',
      'news.cat_event': '活動預告',
      'news.cat_maintenance': '系統維護',
      'news.cat_update': '遊戲更新',
      'news.cat_bundle': '禮包資訊',
      'news.source_hint': '🤖 由 AI 自動提煉核心亮點 · 來源：'
    },

    'en-US': {
      // App Branding & Navigation
      'brand.title': 'Pokémon Sleep Database',
      'brand.subtitle': 'Comprehensive Stats, Rates, Ingredients & Pokedex',
      'nav.pokemon': '⚡ Dex',
      'nav.recipes': '🍲 Dishes',
      'nav.wiki': '📚 Wiki',
      'nav.box': '📦 Box',
      'nav.news': '📰 News',
      'nav.sync': '🔄 Sync',
      'nav.settings': '⚙️ Settings',

      // Settings Modal
      'settings.title': '⚙️ System Settings',
      'settings.theme_section': '🎨 Theme',
      'settings.theme_desc': 'Select from 2 Dark and 2 Light themes tailored for any lighting condition.',
      'settings.theme_midnight': '🌌 Midnight Navy (Dark)',
      'settings.theme_onyx': '🌑 Onyx Black (OLED Dark)',
      'settings.theme_dawn': '☀️ Dawn Amber (Warm Light)',
      'settings.theme_emerald': '🍃 Emerald Forest (Fresh Light)',
      'settings.lang_section': '🌐 Language',
      'settings.lang_desc': 'Switch interface display language.',
      'settings.lang_zh': '繁體中文 (Traditional Chinese)',
      'settings.lang_en': 'English (US)',
      'settings.sync_section': '🔄 GitHub Actions Sync',
      'settings.sync_desc': 'Configure a GitHub PAT with workflow scope to trigger automatic live updates.',
      'settings.save': '💾 Save Settings',
      'settings.close': 'Close',

      // Search & Filters (Pokedex)
      'pokedex.search_placeholder': 'Search Pokémon by name, No. (e.g. 0001), type, ingredient...',
      'pokedex.filter_bookmark': 'Filters',
      'pokedex.filter_sidebar_title': 'Filters',
      'pokedex.reset_all': 'Reset',
      'pokedex.only_final': '👑 Final EVO Only',
      'pokedex.only_initial_ing': '🥗 Lv.1 Ing. Only',
      'pokedex.specialty_title': 'Specialty',
      'pokedex.berry_title': 'Berries',
      'pokedex.ingredient_title': 'Ingredients',
      'pokedex.skill_title': 'Main Skills',
      'pokedex.clear': 'Clear',
      'pokedex.view_cards': '🎴 Cards',
      'pokedex.view_table': '📊 Table',
      'pokedex.sort_id_asc': '🔢 No. (Asc)',
      'pokedex.sort_id_desc': '🔢 No. (Desc)',
      'pokedex.sort_carry_desc': '🎒 Carry (Desc)',
      'pokedex.sort_ingredient_desc': '🥩 Ing. Rate (Desc)',
      'pokedex.sort_skill_desc': '⚡ Skill Rate (Desc)',
      'pokedex.sort_interval_asc': '⏱️ Frequency (Fast)',
      'pokedex.loading': 'Loading Pokémon data...',
      'pokedex.no_results': 'No Pokémon Found',
      'pokedex.no_results_desc': 'Please adjust your search criteria or reset filters.',
      'pokedex.count_label': 'Pokémon',

      // Table Headers & Card Labels
      'th.icon': 'Icon',
      'th.name': 'Name',
      'th.type': 'Type',
      'th.specialty': 'Spec',
      'th.interval': 'Freq',
      'th.carry': 'Carry',
      'th.friendship': 'FP',
      'th.ingredient_rate': 'Ing. Rate',
      'th.skill_rate': 'Skill Rate',
      'th.berry': 'Berry',
      'th.main_skill': 'Main Skill',
      'th.ing1': 'Ing 1',
      'th.ing2': 'Ing 2',
      'th.ing3': 'Ing 3',
      'th.ingredients': 'Ings',
      'th.actions': 'Action',

      'card.type': 'Type',
      'card.specialty': 'Spec',
      'card.carry': 'Carry',
      'card.ing_rate': 'Ing. Rate',
      'card.skill_rate': 'Skill Rate',
      'card.interval': 'Freq',
      'card.skill': 'Main Skill',

      // Specialties
      'spec.berry': 'Berries',
      'spec.ingredient': 'Ingredients',
      'spec.skill': 'Skills',
      'spec.all': 'All-Rounder',

      // Recipes Panel
      'recipe.search_placeholder': 'Search dish by name or ingredient...',
      'recipe.view_cards': '🎴 Cards',
      'recipe.view_table': '📊 Table',
      'recipe.sort_energy_desc': '⚡ Energy (Desc)',
      'recipe.sort_energy_asc': '⚡ Energy (Asc)',
      'recipe.sort_pot_asc': '🍲 Pot Size (Asc)',
      'recipe.sort_pot_desc': '🍲 Pot Size (Desc)',
      'recipe.sort_bonus_desc': '🥩 Bonus % (Desc)',
      'recipe.sort_name_asc': '🔤 Name',
      'recipe.category_label': 'Category',
      'recipe.bonus_label': 'Min Bonus',
      'recipe.pot_label': 'Min Pot Size',
      'recipe.all': 'All',
      'recipe.cat_curry': '🍛 Curry',
      'recipe.cat_salad': '🥗 Salad',
      'recipe.cat_dessert': '🍰 Dessert',
      'recipe.slider_level': '📖 Recipe Level',
      'recipe.slider_level_desc': 'Non-linear bonus, up to +258% at Lv.70',
      'recipe.slider_island': '🏝️ Island Bonus',
      'recipe.slider_island_desc': '0% to 85% (+5% step, ×1.00 ~ ×1.85)',
      'recipe.slider_event': '🎉 Event Bonus',
      'recipe.slider_event_desc': '1.00x to 2.50x (+0.25x step)',
      'recipe.tasty_toggle': '✨ Extra Tasty',
      'recipe.filter_included': '🟢 Include Ingredients',
      'recipe.filter_excluded': '🔴 Exclude Ingredients',
      'recipe.match_any': 'Match Any',
      'recipe.match_all': 'Match All',
      'recipe.clear_all': 'Clear All',
      'recipe.clear_excluded': 'Clear Excluded',
      'recipe.included_hint': 'Click ingredient to show dishes containing it',
      'recipe.excluded_hint': 'Click ingredient to hide dishes containing it',
      'recipe.count_badge': 'Dishes',
      'recipe.th_dish': 'Dish',
      'recipe.th_category': 'Category',
      'recipe.th_pot': 'Pot Size',
      'recipe.th_ingredients': 'Ingredients',
      'recipe.th_base_energy': 'Base Energy',
      'recipe.th_bonus': 'Bonus',
      'recipe.th_final_energy': 'Est. Energy',

      // Wiki Panel
      'wiki.title': '📚 Strategy & Encyclopedia Knowledge Base',
      'wiki.tab_skills': '⚡ Main Skills',
      'wiki.tab_subskills': '🧩 Sub-Skills & Natures',
      'wiki.tab_ratings': '🎓 Tier Lists',
      'wiki.tab_ladder': '🥗 Ing. Ladder',
      'wiki.tab_values': '🫐 Base Power',
      'wiki.skill_type_label': 'Category:',
      'wiki.skill_all': 'All (22)',
      'wiki.skill_energy': '⚡ Charge Energy',
      'wiki.skill_energy_heal': '💖 Energy Recovery',
      'wiki.skill_ingredient': '🥗 Ingredients & Pot',
      'wiki.skill_special': '👑 Specials & Boosts',
      'wiki.skill_shards': '💎 Dream Shards',
      'ladder.search_placeholder': 'Search Pokémon across tracks...',
      'ladder.filter_all': 'All',
      'ladder.filter_aaa': '👑 AAA Mono',
      'ladder.filter_top': '🥈 TOP 1-2',
      'ladder.ing_m_toggle': '🥩 Ing. Finder M (+36%)',
      'ladder.speed_m_toggle': '⚡ Helping Speed M (+16.3%)',

      // Box & Appraisal
      'box.title': '📦 My Pokémon Box & Smart OCR Scanner',
      'box.desc': 'Batch auto-recognize Level, Ingredients, Sub-skills, and Nature from screenshots or manual entry.',
      'box.appraisal_lab_btn': '🔮 Appraisal Lab',
      'box.manual_add': '➕ Add Pokémon',
      'box.export': '💾 Export',
      'box.import': '📥 Import',
      'box.dropzone_title': 'Click or batch drag & drop screenshots here, or paste with Ctrl+V / Cmd+V',
      'box.dropzone_sub': 'Auto-detect: Name · Level · Lv.1/30/60 Ingredients · 5 Sub-skills · Nature · Deduplication',
      'box.search_placeholder': 'Search box Pokémon by name, nickname, nature, sub-skill...',
      'box.sort_pr_desc': '👑 PR Rank (High to Low)',
      'box.sort_created_desc': '📅 Recently Added',
      'box.sort_level_desc': '⚡ Level (High to Low)',
      'box.sort_level_asc': '🌱 Level (Low to High)',
      'box.sort_pr_asc': '📉 PR Rank (Low to High)',
      'box.sort_id_asc': '🔢 Pokedex No.',
      'box.view_cards': '🎴 Cards',
      'box.view_table': '📊 Table',
      'box.empty_title': 'Your Pokémon Box is empty',
      'box.empty_desc': 'Drag & drop screenshots above or click "Add Pokémon" to get started.',
      'appraisal.title': '🔮 Pokémon Career Appraisal Report',
      'appraisal.radar_berry': 'Berry Output',
      'appraisal.radar_ing': 'Ingredient Output',
      'appraisal.radar_skill': 'Skill Power',
      'appraisal.radar_speed': 'Helping Speed',
      'appraisal.radar_growth': 'Late Game',
      'appraisal.radar_roi': 'Resource ROI',

      // News & Timeline
      'news.title': '📰 Latest Events & Official News',
      'news.timeline_title': '⏰ Official Event Schedule Timeline',
      'news.search_placeholder': 'Search news by title, keyword, Pokémon...',
      'news.cat_all': 'All',
      'news.cat_event': 'Events',
      'news.cat_maintenance': 'Maintenance',
      'news.cat_update': 'Updates',
      'news.cat_bundle': 'Bundles',
      'news.source_hint': '🤖 Summarized by AI · Source: '
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

  // 食材名稱對照 (19 種官方食材)
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

  // 樹果名稱對照 (18 種官方樹果)
  const BERRY_NAMES = {
    '蘋野果': { 'zh-TW': '蘋野果', 'en-US': 'Leppa Berry' },
    '橙橙果': { 'zh-TW': '橙橙果', 'en-US': 'Oran Berry' },
    '零餘果': { 'zh-TW': '零餘果', 'en-US': 'Chesto Berry' },
    '木子果': { 'zh-TW': '木子果', 'en-US': 'Lum Berry' },
    '文柚果': { 'zh-TW': '文柚果', 'en-US': 'Sitrus Berry' },
    '柿仔果': { 'zh-TW': '柿仔果', 'en-US': 'Persim Berry' },
    '櫻子果': { 'zh-TW': '櫻子果', 'en-US': 'Cheri Berry' },
    '佩利果': { 'zh-TW': '佩利果', 'en-US': 'Pecha Berry' },
    '生薑果': { 'zh-TW': '生薑果', 'en-US': 'Rawst Berry' },
    '異奇果': { 'zh-TW': '異奇果', 'en-US': 'Iapapa Berry' },
    '芒芒果': { 'zh-TW': '芒芒果', 'en-US': 'Mago Berry' },
    '芭亞果': { 'zh-TW': '芭亞果', 'en-US': 'Aguav Berry' },
    '椰木果': { 'zh-TW': '椰木果', 'en-US': 'Wiki Berry' },
    '文達果': { 'zh-TW': '文達果', 'en-US': 'Belue Berry' },
    '番荔果': { 'zh-TW': '番荔果', 'en-US': 'Yache Berry' },
    '哈密果': { 'zh-TW': '哈密果', 'en-US': 'Grepa Berry' },
    '巧可果': { 'zh-TW': '巧可果', 'en-US': 'Bluk Berry' },
    '墨莓果': { 'zh-TW': '墨莓果', 'en-US': 'Razz Berry' }
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

  // 主技能官方英中對照
  const MAIN_SKILL_NAMES = {
    '能量填充S (固定值)': { 'zh-TW': '能量填充S (固定值)', 'en-US': 'Charge Strength S (Fixed)' },
    '能量填充S (隨機/變動值)': { 'zh-TW': '能量填充S (隨機/變動值)', 'en-US': 'Charge Strength S (Random)' },
    '能量填充S': { 'zh-TW': '能量填充S', 'en-US': 'Charge Strength S' },
    '能量填充M (固定值)': { 'zh-TW': '能量填充M (固定值)', 'en-US': 'Charge Strength M (Fixed)' },
    '能量填充M': { 'zh-TW': '能量填充M', 'en-US': 'Charge Strength M' },
    '蓄力 (能量填充S)': { 'zh-TW': '蓄力 (能量填充S)', 'en-US': 'Stockpile (Charge Strength S)' },
    '蓄力': { 'zh-TW': '蓄力', 'en-US': 'Stockpile' },
    '夢魘 (能量填充M)': { 'zh-TW': '夢魘 (能量填充M)', 'en-US': 'Nightmare (Charge Strength M)' },
    '夢魘': { 'zh-TW': '夢魘', 'en-US': 'Nightmare' },
    '食材獲取S': { 'zh-TW': '食材獲取S', 'en-US': 'Ingredient Magnet S' },
    '食材獲取M': { 'zh-TW': '食材獲取M', 'en-US': 'Ingredient Magnet M' },
    '料理成功率提升S': { 'zh-TW': '料理成功率提升S', 'en-US': 'Extra Tasty S' },
    '料理擴大S': { 'zh-TW': '料理擴大S', 'en-US': 'Cooking Power Up S' },
    '幫手獎勵': { 'zh-TW': '幫手獎勵', 'en-US': 'Helping Bonus' },
    '幫手支援S': { 'zh-TW': '幫手支援S', 'en-US': 'Helper Boost S' },
    '全體能量回復S': { 'zh-TW': '全體能量回復S', 'en-US': 'Energy for Everyone S' },
    '活力療癒S': { 'zh-TW': '活力療癒S', 'en-US': 'Energy Cheer S' },
    '自體活力回復S': { 'zh-TW': '自體活力回復S', 'en-US': 'Charge Energy S' },
    '活力充沛S': { 'zh-TW': '活力充沛S', 'en-US': 'Energizing Cheer S' },
    '夢之碎片獲取S': { 'zh-TW': '夢之碎片獲取S', 'en-US': 'Dream Shard Magnet S' },
    '夢之碎片獲取S（隨機）': { 'zh-TW': '夢之碎片獲取S（隨機）', 'en-US': 'Dream Shard Magnet S (Random)' },
    '揮指': { 'zh-TW': '揮指', 'en-US': 'Metronome' },
    '變身': { 'zh-TW': '變身', 'en-US': 'Transform' },
    '傳說降臨（雷公）': { 'zh-TW': '傳說降臨（雷公）', 'en-US': 'Raikou Helper Boost' },
    '傳說降臨（炎帝）': { 'zh-TW': '傳說降臨（炎帝）', 'en-US': 'Entei Helper Boost' },
    '傳說降臨（水君）': { 'zh-TW': '傳說降臨（水君）', 'en-US': 'Suicune Helper Boost' },
    '雷公幫手支援': { 'zh-TW': '雷公幫手支援', 'en-US': 'Raikou Helper Boost' },
    '炎帝幫手支援': { 'zh-TW': '炎帝幫手支援', 'en-US': 'Entei Helper Boost' },
    '水君幫手支援': { 'zh-TW': '水君幫手支援', 'en-US': 'Suicune Helper Boost' },
    '達克萊伊專屬': { 'zh-TW': '達克萊伊專屬', 'en-US': 'Darkrai Nightmare' },
    '變身（隨機技能）': { 'zh-TW': '變身（隨機技能）', 'en-US': 'Transform (Random)' },
    '揮指（隨機技能）': { 'zh-TW': '揮指（隨機技能）', 'en-US': 'Metronome (Random)' },
    '月光': { 'zh-TW': '月光', 'en-US': 'Moonlight' },
    '電光一閃': { 'zh-TW': '電光一閃', 'en-US': 'Quick Attack' },
    '精神強念': { 'zh-TW': '精神強念', 'en-US': 'Psychic' },
    '晨光': { 'zh-TW': '晨光', 'en-US': 'Morning Sun' }
  };

  // 副技能官方英中對照
  const SUBSKILL_NAMES = {
    '樹果數量S': { 'zh-TW': '樹果數量S', 'en-US': 'Berry Finding S' },
    '幫手獎勵': { 'zh-TW': '幫手獎勵', 'en-US': 'Helping Bonus' },
    '睡眠EXP提升': { 'zh-TW': '睡眠EXP提升', 'en-US': 'Sleep EXP Bonus' },
    '研究EXP提升': { 'zh-TW': '研究EXP提升', 'en-US': 'Research EXP Bonus' },
    '夢之碎片獎勵': { 'zh-TW': '夢之碎片獎勵', 'en-US': 'Dream Shard Bonus' },
    '活力回復獎勵': { 'zh-TW': '活力回復獎勵', 'en-US': 'Energy Recovery Bonus' },
    '幫手速度M': { 'zh-TW': '幫手速度M', 'en-US': 'Helping Speed M' },
    '幫手速度S': { 'zh-TW': '幫手速度S', 'en-US': 'Helping Speed S' },
    '食材機率提升M': { 'zh-TW': '食材機率提升M', 'en-US': 'Ingredient Finder M' },
    '食材機率提升S': { 'zh-TW': '食材機率提升S', 'en-US': 'Ingredient Finder S' },
    '技能發動率提升M': { 'zh-TW': '技能發動率提升M', 'en-US': 'Skill Trigger M' },
    '技能發動率提升S': { 'zh-TW': '技能發動率提升S', 'en-US': 'Skill Trigger S' },
    '技能等級提升M': { 'zh-TW': '技能等級提升M', 'en-US': 'Skill Level Up M' },
    '技能等級提升S': { 'zh-TW': '技能等級提升S', 'en-US': 'Skill Level Up S' },
    '持有上限提升L': { 'zh-TW': '持有上限提升L', 'en-US': 'Inventory Up L' },
    '持有上限提升M': { 'zh-TW': '持有上限提升M', 'en-US': 'Inventory Up M' },
    '持有上限提升S': { 'zh-TW': '持有上限提升S', 'en-US': 'Inventory Up S' }
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
      if (window.NewsApp && typeof window.NewsApp.render === 'function') {
        window.NewsApp.render();
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

  function getBerryName(berry) {
    if (!berry) return '';
    const item = BERRY_NAMES[berry];
    return item ? (item[currentLang] || berry) : berry;
  }

  function getNatureName(nat) {
    if (!nat) return '';
    const item = NATURE_NAMES[nat];
    return item ? (item[currentLang] || nat) : nat;
  }

  function getMainSkillName(skill) {
    if (!skill) return '';
    const item = MAIN_SKILL_NAMES[skill];
    return item ? (item[currentLang] || skill) : skill;
  }

  function getSubSkillName(subskill) {
    if (!subskill) return '';
    const item = SUBSKILL_NAMES[subskill];
    return item ? (item[currentLang] || subskill) : subskill;
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
    getBerryName,
    getNatureName,
    getMainSkillName,
    getSubSkillName,
    updatePageTranslations,
    DICTIONARY,
    TYPE_NAMES,
    SPECIALTY_NAMES,
    INGREDIENT_NAMES,
    BERRY_NAMES,
    NATURE_NAMES,
    MAIN_SKILL_NAMES,
    SUBSKILL_NAMES
  };

  if (typeof window !== 'undefined') {
    window.I18N = I18NExport;
    window.t = t;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18NExport;
  }
})();

