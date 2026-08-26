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
      'brand.app_title': '寶可夢資料庫',
      'brand.subtitle': '機率、食材與屬性完整線上檢索',
      'nav.pokemon': '⚡ 寶可夢圖鑑',
      'nav.recipes': '🍲 料理食譜',
      'nav.wiki': '📚 數據百科',
      'nav.box': '📦 寶可夢倉庫',
      'nav.news': '📰 最新公告',
      'nav.sync': '🔄 同步資料',
      'nav.settings': '⚙️ 設定',
      'dock.pokemon': '圖鑑',
      'dock.recipes': '料理',
      'dock.wiki': '百科',
      'dock.box': '盒子',
      'dock.news': '最新',
      'nav.switch_desktop': '切換至桌面完整版',
      'nav.desktop_label': '桌面版',
      'nav.switch_to_mobile': '📱 行動版',
      'nav.switch_to_desktop': '💻 桌面版',

      // Settings Modal
      'settings.title': '系統設定',
      'settings.theme_section': '外觀主題',
      'settings.theme_desc': '提供 2 組深色與 2 組明亮主題，適配各種光線環境。',
      'settings.theme_midnight': '深邃夜空',
      'settings.theme_midnight_sub': '科技深藍黑 · 霓虹青紫點綴',
      'settings.theme_onyx': '曜石暗影',
      'settings.theme_onyx_sub': 'OLED 純粹黑 · 琥珀流金點綴',
      'settings.theme_dawn': '晨曦暖陽',
      'settings.theme_dawn_sub': '溫潤奶油白 · 蔚藍暖陽點綴',
      'settings.theme_emerald': '萌綠森林',
      'settings.theme_emerald_sub': '清新薄荷白 · 翠綠草木點綴',
      'settings.theme_active': '✓ 使用中',
      'settings.lang_section': '介面語言',
      'settings.lang_desc': '切換全站介面文字與寶可夢資料顯示語系。',
      'settings.lang_zh': '繁體中文',
      'settings.lang_en': 'English',
      'settings.sync_section': '資料同步',
      'settings.sync_desc': '設定具有 workflow 權限的 GitHub PAT Token 觸發線上自動抓取。',
      'settings.pat_label': 'GitHub PAT Token（儲存於本地 LocalStorage，不會上傳）',
      'settings.pat_link': '點此建立 GitHub PAT（勾選 workflow 權限）',
      'settings.save': '儲存設定',
      'settings.close': '關閉',

      // Search & Filters (Pokedex)
      'pokedex.search_placeholder': '搜尋寶可夢名稱 (中/英/日) 或 No. 編號...',
      'pokedex.filter_bookmark': '篩選',
      'pokedex.filter_sidebar_title': '圖鑑篩選器',
      'pokedex.reset_all': '全部重設',
      'pokedex.only_final': '👑 僅最終進化',
      'pokedex.only_initial_ing': '🥗 僅初始食材',
      'pokedex.show_no': '顯示編號',
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
      'pokedex.ref_data': '📊 參考資料來源',
      'pokedex.target_sheet': '📋 目標試算表',

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
      'th.ing1': '食1',
      'th.ing2': '食2',
      'th.ing3': '食3',
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
      'recipe.filter_bookmark': '篩選',
      'recipe.filter_sidebar_title': '食譜篩選器',
      'recipe.calc_settings': '📊 能量試算設定',
      'recipe.all_categories': '全部種類',
      'recipe.category_label': '料理種類',
      'recipe.bonus_label': '最低食譜加成',
      'recipe.pot_label': '最低鍋子容量',
      'recipe.all': '全部',
      'recipe.pot_15': '≥ 15（初始）',
      'recipe.pot_100': '≥ 100（頂級）',
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
      'recipe.excluded_warn': '點選食材後，含該食材的食譜將被隱藏',
      'recipe.stats_tip': '💡 食材加成為每道食譜的<strong>固定數值</strong>；等級、島嶼與活動加成乘算於最終能量',
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
      'wiki.subtab_skills': '⚡ 主技能數值庫',
      'wiki.subtab_subskills': '🧩 副技能與性格指南',
      'wiki.subtab_ratings': '🎓 培育與評級指南',
      'wiki.subtab_ingredients': '🥗 食材產量天梯榜',
      'wiki.subtab_values': '🫐 樹果與食材能量',
      'wiki.tab_skills': '⚡ 主技能數值庫',
      'wiki.tab_subskills': '🧩 副技能與性格指南',
      'wiki.tab_ratings': '🎓 培育與評級指南',
      'wiki.tab_ladder': '🥗 食材產量天梯榜',
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
      'box.banner_title': '📦 我的寶可夢倉庫 & 截圖智能辨識',
      'box.banner_desc': '支援上傳遊戲截圖自動辨識等級、食材組合、副技能與性格，亦可隨時手動錄入與編輯。',
      'box.appraisal_lab_btn': '🔮 深度評測室',
      'box.appraisal_lab': '🔮 深度評測室',
      'box.manual_add': '➕ 手動新增寶可夢',
      'box.add_pokemon': '➕ 手動新增寶可夢',
      'box.export': '💾 匯出備份',
      'box.export_backup': '💾 匯出備份',
      'box.import': '📥 匯入還原',
      'box.import_backup': '📥 匯入還原',
      'box.dropzone_title': '點擊或多選/批次拖曳「寶可夢資料截圖」至此，或直接按 Ctrl+V / Cmd+V 貼上',
      'box.dropzone_sub': '自動批次辨識：寶可夢名稱 · 等級 · Lv.1/30/60 食材組合 · 5 格副技能 · 性格加成 · 智能防重保護',
      'box.search_placeholder': '搜尋倉庫寶可夢名稱、暱稱、性格、副技能...',
      'box.sort_pr_desc': '👑 PR 評分由高到低',
      'box.sort_created_desc': '📅 最近加入',
      'box.sort_recent': '📅 最近加入',
      'box.sort_level_desc': '⚡ 等級由高到低',
      'box.sort_level_asc': '🌱 等級由低到高',
      'box.sort_pr_asc': '📉 PR 評分由低到高',
      'box.sort_id_asc': '🔢 全國圖鑑編號',
      'box.sort_dex_asc': '🔢 全國圖鑑編號',
      'box.view_cards': '🎴 卡片',
      'box.view_table': '📊 表格',
      'box.empty_title': '您的寶可夢倉庫目前是空的',
      'box.empty_desc': '請拖曳截圖至上方辨識區，或點擊「手動新增」開始記錄！',
      'box.modal_title': '📸 截圖辨識確認入庫',
      'box.modal_poke_name': '寶可夢名稱',
      'box.modal_poke_level': '等級',
      'box.modal_poke_nickname': '自訂暱稱',
      'box.modal_nickname_placeholder': '例如：首隻樹果S神坦...',
      'box.modal_search_placeholder': '中文 / 英文 / 編號',
      'box.modal_clear_all_subskills': '✕ 清空全部',
      'box.modal_clear_active_subskill': '✕ 清空全部',
      'box.modal_ing_lv1': 'Lv.1',
      'box.modal_ing_lv30': 'Lv.30',
      'box.modal_ing_lv60': 'Lv.60',
      'box.modal_gold_skills': '🌟 金色頂級技能',
      'box.modal_blue_skills': '🔷 藍色高階技能',
      'box.modal_white_skills': '⚪ 白色基礎技能',
      'box.modal_poke_ing': '🍲 食材組合',
      'box.modal_poke_nature': '🧠 性格',
      'box.modal_poke_subskills': '⚡ 副技能配置',
      'box.modal_cancel': '取消',
      'box.modal_save': '💾 確認儲存入庫',
      'appraisal.title': '🔮 寶可夢生涯診斷評測報告書',
      'appraisal.radar_berry': '樹果產能',
      'appraisal.radar_ing': '食材產能',
      'appraisal.radar_skill': '技能強度',
      'appraisal.radar_speed': '幫忙速度',
      'appraisal.radar_growth': '後期成長',
      'appraisal.radar_roi': '資源效益',

      // Footer
      'footer.copyright': 'Pokémon Sleep 寶可夢資料庫 &copy; 2026 · <a href="https://github.com/s102213039/pokemon-sleep-app" target="_blank">GitHub 原始碼</a> · Powered by <a href="https://www.serebii.net/" target="_blank">Serebii.net</a>',
      'footer.sync_note': '🔄 同步功能透過 GitHub Actions 執行，點擊「同步資料」後約需 60-120 秒生效。需先在「⚙️ 設定」中填入 GitHub PAT Token。',

      // News & Timeline
      'news.title': '📰 最新活動與官方更新公告',
      'news.timeline_title': '⏰ 官方活動日程時間軸',
      'news.search_placeholder': '搜尋公告標題、關鍵字、寶可夢...',
      'news.cat_all': '全部公告',
      'news.cat_event': '活動預告',
      'news.cat_maintenance': '系統維護',
      'news.cat_update': '遊戲更新',
      'news.cat_bundle': '禮包資訊',
      'news.source_hint': '🤖 由 AI 自動提煉核心亮點 · 來源：',
      'news.source_full_hint': '🤖 由 AI 自動提煉核心亮點 · 來源：<a href="https://www.pokemonsleep.net/zh/news/" target="_blank" rel="noopener noreferrer">Pokémon Sleep 繁體中文官方網站</a>'
    },

    'en-US': {
      // App Branding & Navigation
      'brand.title': 'Pokémon Sleep Database',
      'brand.app_title': 'Pokémon Database',
      'brand.subtitle': 'Comprehensive Stats, Rates, Ingredients & Pokedex',
      'nav.pokemon': '⚡ Dex',
      'nav.recipes': '🍲 Dishes',
      'nav.wiki': '📚 Wiki',
      'nav.box': '📦 Box',
      'nav.news': '📰 News',
      'nav.sync': '🔄 Sync',
      'nav.settings': '⚙️ Settings',
      'dock.pokemon': 'Dex',
      'dock.recipes': 'Cook',
      'dock.wiki': 'Wiki',
      'dock.box': 'Box',
      'dock.news': 'News',
      'nav.switch_desktop': 'Switch to Desktop Version',
      'nav.desktop_label': 'Desktop',
      'nav.switch_to_mobile': '📱 Mobile',
      'nav.switch_to_desktop': '💻 Desktop',

      // Settings Modal
      'settings.title': 'Settings',
      'settings.theme_section': 'Theme',
      'settings.theme_desc': 'Select from 2 Dark and 2 Light themes tailored for any lighting condition.',
      'settings.theme_midnight': 'Midnight Navy',
      'settings.theme_midnight_sub': 'Deep Navy & Cyan · Neon Accents',
      'settings.theme_onyx': 'Onyx Black',
      'settings.theme_onyx_sub': 'Pure OLED Black · Amber Gold Accents',
      'settings.theme_dawn': 'Dawn Amber',
      'settings.theme_dawn_sub': 'Warm Cream White · Cyan Sun Accents',
      'settings.theme_emerald': 'Emerald Forest',
      'settings.theme_emerald_sub': 'Fresh Mint White · Forest Green Accents',
      'settings.theme_active': '✓ Active',
      'settings.lang_section': 'Language',
      'settings.lang_desc': 'Switch interface display language.',
      'settings.lang_zh': '繁體中文 (Traditional Chinese)',
      'settings.lang_en': 'English (US)',
      'settings.sync_section': 'Data Sync',
      'settings.sync_desc': 'Configure a GitHub PAT with workflow scope to trigger automatic live updates.',
      'settings.pat_label': 'GitHub PAT Token (Stored locally in LocalStorage, never uploaded)',
      'settings.pat_link': 'Click to create GitHub PAT (select workflow scope)',
      'settings.save': 'Save Settings',
      'settings.close': 'Close',

      // Search & Filters (Pokedex)
      'pokedex.search_placeholder': 'Search Pokémon by name, No. (e.g. 0001), type, ingredient...',
      'pokedex.filter_bookmark': 'Filters',
      'pokedex.filter_sidebar_title': 'Filters',
      'pokedex.reset_all': 'Reset',
      'pokedex.only_final': '👑 Only Final Evo',
      'pokedex.only_initial_ing': '🥗 Ing.1 only',
      'pokedex.show_no': 'Show No.',
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
      'pokedex.ref_data': '📊 Reference Data',
      'pokedex.target_sheet': '📋 Target Sheet',

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
      'th.ing1': 'Ing1',
      'th.ing2': 'Ing2',
      'th.ing3': 'Ing3',
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
      'recipe.filter_bookmark': 'Filter',
      'recipe.filter_sidebar_title': 'Recipe Filters',
      'recipe.calc_settings': '📊 Energy Simulation',
      'recipe.all_categories': 'All Types',
      'recipe.category_label': 'Category',
      'recipe.bonus_label': 'Min Bonus',
      'recipe.pot_label': 'Min Pot Size',
      'recipe.all': 'All',
      'recipe.pot_15': '≥ 15 (Initial)',
      'recipe.pot_100': '≥ 100 (Max)',
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
      'recipe.excluded_warn': 'Dishes with selected ingredients will be hidden',
      'recipe.stats_tip': '💡 Recipe bonus is a fixed value per recipe; Level, island, and event bonuses multiply final energy',
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
      'wiki.subtab_skills': '⚡ Main Skills DB',
      'wiki.subtab_subskills': '🧩 Sub-Skills & Natures',
      'wiki.subtab_ratings': '🎓 Growth & Tier Guide',
      'wiki.subtab_ingredients': '🥗 Ingredient Yield Ladder',
      'wiki.subtab_values': '🫐 Berry & Ing. Values',
      'wiki.tab_skills': '⚡ Main Skills DB',
      'wiki.tab_subskills': '🧩 Sub-Skills & Natures',
      'wiki.tab_ratings': '🎓 Growth & Tier Guide',
      'wiki.tab_ladder': '🥗 Ingredient Yield Ladder',
      'wiki.tab_values': '🫐 Berry & Ing. Values',
      'wiki.skill_type_label': 'Category:',
      'wiki.skill_all': 'All Skills (22)',
      'wiki.skill_energy': '⚡ Strength',
      'wiki.skill_energy_heal': '💖 Energy Recovery',
      'wiki.skill_ingredient': '🥗 Ingredients',
      'wiki.skill_special': '👑 Legend & Special',
      'wiki.skill_shards': '💎 Dream Shards',
      'ladder.search_placeholder': 'Search Pokémon across tracks...',
      'ladder.filter_all': 'All',
      'ladder.filter_aaa': '👑 AAA Only',
      'ladder.filter_top': '🥈 TOP 1-2 Only',
      'ladder.ing_m_toggle': '🥩 Ing. Finder M (+36%)',
      'ladder.speed_m_toggle': '⚡ Helping Speed M (+16.3%)',

      // Box & Appraisal
      'box.title': '📦 My Pokémon Box & Smart OCR Scanner',
      'box.desc': 'Batch auto-recognize Level, Ingredients, Sub-skills, and Nature from screenshots or manual entry.',
      'box.banner_title': '📦 My Pokémon Box & OCR Scanner',
      'box.banner_desc': 'Batch auto-recognize Level, Ingredients, Sub-skills, and Nature from screenshots or manual entry.',
      'box.appraisal_lab_btn': '🔮 Appraisal Lab',
      'box.appraisal_lab': '🔮 Appraisal Lab',
      'box.manual_add': '➕ Add Pokémon',
      'box.add_pokemon': '➕ Add Pokémon',
      'box.export': '💾 Export',
      'box.export_backup': '💾 Export JSON',
      'box.import': '📥 Import',
      'box.import_backup': '📥 Import JSON',
      'box.dropzone_title': 'Click or batch drag & drop screenshots here, or paste with Ctrl+V / Cmd+V',
      'box.dropzone_sub': 'Auto-detect: Name · Level · Lv.1/30/60 Ingredients · 5 Sub-skills · Nature · Deduplication',
      'box.search_placeholder': 'Search box Pokémon by name, nickname, nature, sub-skill...',
      'box.sort_pr_desc': '👑 PR Rank (High to Low)',
      'box.sort_created_desc': '📅 Recently Added',
      'box.sort_recent': '📅 Recently Added',
      'box.sort_level_desc': '⚡ Level (High to Low)',
      'box.sort_level_asc': '🌱 Level (Low to High)',
      'box.sort_pr_asc': '📉 PR Rank (Low to High)',
      'box.sort_id_asc': '🔢 Pokedex No.',
      'box.sort_dex_asc': '🔢 Pokedex No.',
      'box.view_cards': '🎴 Cards',
      'box.view_table': '📊 Table',
      'box.empty_title': 'Your Pokémon Box is empty',
      'box.empty_desc': 'Drag & drop screenshots above or click "Add Pokémon" to get started.',
      'box.modal_title': '📸 OCR Review & Confirm Entry',
      'box.modal_poke_name': 'Pokémon',
      'box.modal_poke_level': 'Level',
      'box.modal_poke_nickname': 'Nickname',
      'box.modal_nickname_placeholder': 'e.g., BFS God Tank...',
      'box.modal_search_placeholder': 'Name / No.',
      'box.modal_clear_all_subskills': '✕ Clear All',
      'box.modal_clear_active_subskill': '✕ Clear All',
      'box.modal_ing_lv1': 'Lv.1',
      'box.modal_ing_lv30': 'Lv.30',
      'box.modal_ing_lv60': 'Lv.60',
      'box.modal_gold_skills': '🌟 Gold Sub-Skills',
      'box.modal_blue_skills': '🔷 Blue Sub-Skills',
      'box.modal_white_skills': '⚪ White Sub-Skills',
      'box.modal_poke_ing': '🍲 Ingredients',
      'box.modal_poke_nature': '🧠 Nature',
      'box.modal_poke_subskills': '⚡ Sub-Skills',
      'box.modal_cancel': 'Cancel',
      'box.modal_save': '💾 Save Pokémon',
      'appraisal.title': '🔮 Pokémon Career Appraisal Report',
      'appraisal.radar_berry': 'Berry Output',
      'appraisal.radar_ing': 'Ingredient Output',
      'appraisal.radar_skill': 'Skill Power',
      'appraisal.radar_speed': 'Helping Speed',
      'appraisal.radar_growth': 'Late Growth',
      'appraisal.radar_roi': 'Resource ROI',

      // Footer
      'footer.copyright': 'Pokémon Sleep Database &copy; 2026 · <a href="https://github.com/s102213039/pokemon-sleep-app" target="_blank">GitHub Source</a> · Powered by <a href="https://www.serebii.net/" target="_blank">Serebii.net</a>',
      'footer.sync_note': '🔄 Sync is executed via GitHub Actions. Takes 60-120s after clicking. Requires GitHub PAT Token in Settings.',

      // News & Timeline
      'news.title': '📰 Latest Events & Official News',
      'news.timeline_title': '⏰ Official Event Schedule Timeline',
      'news.search_placeholder': 'Search news titles, keywords, Pokémon...',
      'news.cat_all': 'All News',
      'news.cat_event': 'Events',
      'news.cat_maintenance': 'Maintenance',
      'news.cat_update': 'Game Updates',
      'news.cat_bundle': 'Bundles & Packs',
      'news.source_hint': '🤖 AI Summarized Highlights · Source: ',
      'news.source_full_hint': '🤖 AI Summarized Highlights · Source: <a href="https://www.pokemonsleep.net/en/news/" target="_blank" rel="noopener noreferrer">Pokémon Sleep Official Website</a>'
    }
  };

  // 屬性名稱官方英中對照
  const TYPE_NAMES = {
    '一般': { 'zh-TW': '一般', 'en-US': 'Normal' },
    '火': { 'zh-TW': '火', 'en-US': 'Fire' },
    '水': { 'zh-TW': '水', 'en-US': 'Water' },
    '電': { 'zh-TW': '電', 'en-US': 'Electric' },
    '草': { 'zh-TW': '草', 'en-US': 'Grass' },
    '冰': { 'zh-TW': '冰', 'en-US': 'Ice' },
    '格鬥': { 'zh-TW': '格鬥', 'en-US': 'Fighting' },
    '毒': { 'zh-TW': '毒', 'en-US': 'Poison' },
    '地面': { 'zh-TW': '地面', 'en-US': 'Ground' },
    '飛行': { 'zh-TW': '飛行', 'en-US': 'Flying' },
    '超能力': { 'zh-TW': '超能力', 'en-US': 'Psychic' },
    '超能': { 'zh-TW': '超能', 'en-US': 'Psychic' },
    '蟲': { 'zh-TW': '蟲', 'en-US': 'Bug' },
    '岩石': { 'zh-TW': '岩石', 'en-US': 'Rock' },
    '幽靈': { 'zh-TW': '幽靈', 'en-US': 'Ghost' },
    '龍': { 'zh-TW': '龍', 'en-US': 'Dragon' },
    '惡': { 'zh-TW': '惡', 'en-US': 'Dark' },
    '鋼': { 'zh-TW': '鋼', 'en-US': 'Steel' },
    '妖精': { 'zh-TW': '妖精', 'en-US': 'Fairy' }
  };

  // 專長類型官方英中對照
  const SPECIALTY_NAMES = {
    '樹果': { 'zh-TW': '樹果', 'en-US': 'Berries' },
    '樹果型': { 'zh-TW': '樹果型', 'en-US': 'Berries' },
    '食材': { 'zh-TW': '食材', 'en-US': 'Ingredients' },
    '食材型': { 'zh-TW': '食材型', 'en-US': 'Ingredients' },
    '技能': { 'zh-TW': '技能', 'en-US': 'Skills' },
    '技能型': { 'zh-TW': '技能型', 'en-US': 'Skills' },
    '全能': { 'zh-TW': '全能', 'en-US': 'All-Rounder' },
    '全部': { 'zh-TW': '全部', 'en-US': 'All-Rounder' }
  };

  // 食材名稱官方英中對照 (19種食材全收錄)
  const INGREDIENT_NAMES = {
    '特選蘋果': { 'zh-TW': '特選蘋果', 'en-US': 'Fancy Apple' },
    '哞哞鮮奶': { 'zh-TW': '哞哞鮮奶', 'en-US': 'Moomoo Milk' },
    '純粹鮮奶': { 'zh-TW': '純粹鮮奶', 'en-US': 'Moomoo Milk' },
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

  // 樹果名稱官方英中對照 (18種屬性樹果全收錄)
  const BERRY_NAMES = {
    '藍異果': { 'zh-TW': '藍異果', 'en-US': 'Pamtre Berry' },
    '木子果': { 'zh-TW': '木子果', 'en-US': 'Lum Berry' },
    '椰木果': { 'zh-TW': '椰木果', 'en-US': 'Pamtre Berry' },
    '異奇果': { 'zh-TW': '異奇果', 'en-US': 'Grepa Berry' },
    '檬果': { 'zh-TW': '檬果', 'en-US': 'Bluk Berry' },
    '桃桃果': { 'zh-TW': '桃桃果', 'en-US': 'Pecha Berry' },
    '芒念果': { 'zh-TW': '芒念果', 'en-US': 'Mago Berry' },
    '芒芒果': { 'zh-TW': '芒芒果', 'en-US': 'Mago Berry' },
    '蘋野果': { 'zh-TW': '蘋野果', 'en-US': 'Leppa Berry' },
    '櫻子果': { 'zh-TW': '櫻子果', 'en-US': 'Cheri Berry' },
    '柿仔果': { 'zh-TW': '柿仔果', 'en-US': 'Persim Berry' },
    '勿花果': { 'zh-TW': '勿花果', 'en-US': 'Figy Berry' },
    '文柚果': { 'zh-TW': '文柚果', 'en-US': 'Sitrus Berry' },
    '榴石果': { 'zh-TW': '榴石果', 'en-US': 'Durin Berry' },
    '橙橙果': { 'zh-TW': '橙橙果', 'en-US': 'Oran Berry' },
    '芭拉果': { 'zh-TW': '芭拉果', 'en-US': 'Wiki Berry' },
    '零餘果': { 'zh-TW': '零餘果', 'en-US': 'Chesto Berry' },
    '生薑果': { 'zh-TW': '生薑果', 'en-US': 'Rawst Berry' },
    '靛莓果': { 'zh-TW': '靛莓果', 'en-US': 'Belue Berry' },
    '巧可果': { 'zh-TW': '巧可果', 'en-US': 'Yache Berry' },
    '番荔果': { 'zh-TW': '番荔果', 'en-US': 'Magost Berry' }
  };

  // 性格名稱官方英中對照 (25種全收錄)
  const NATURE_NAMES = {
    '固執': { 'zh-TW': '固執', 'en-US': 'Adamant' },
    '勇敢': { 'zh-TW': '勇敢', 'en-US': 'Brave' },
    '怕寂寞': { 'zh-TW': '怕寂寞', 'en-US': 'Lonely' },
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

  // 主技能官方英中對照 (包含基礎名稱、變體招式與神獸專屬 - 嚴格遵照官方 Sleep 英文命名)
  const MAIN_SKILL_NAMES = {
    // 基礎主技能系列
    '能量填充S': { 'zh-TW': '能量填充S', 'en-US': 'Charge Strength S' },
    '能量填充S (固定)': { 'zh-TW': '能量填充S (固定)', 'en-US': 'Charge Strength S (Fixed)' },
    '能量填充S（固定）': { 'zh-TW': '能量填充S（固定）', 'en-US': 'Charge Strength S (Fixed)' },
    '能量填充S (固定值)': { 'zh-TW': '能量填充S (固定值)', 'en-US': 'Charge Strength S (Fixed)' },
    '能量填充S (隨機/變動值)': { 'zh-TW': '能量填充S (隨機/變動值)', 'en-US': 'Charge Strength S (Random)' },
    '能量填充S (隨機)': { 'zh-TW': '能量填充S (隨機)', 'en-US': 'Charge Strength S (Random)' },
    '能量填充S（隨機）': { 'zh-TW': '能量填充S（隨機）', 'en-US': 'Charge Strength S (Random)' },
    '能量填充M': { 'zh-TW': '能量填充M', 'en-US': 'Charge Strength M' },
    '能量填充M (固定)': { 'zh-TW': '能量填充M (固定)', 'en-US': 'Charge Strength M (Fixed)' },
    '能量填充M（固定）': { 'zh-TW': '能量填充M（固定）', 'en-US': 'Charge Strength M (Fixed)' },
    '能量填充M (固定值)': { 'zh-TW': '能量填充M (固定值)', 'en-US': 'Charge Strength M (Fixed)' },
    
    '食材獲取S': { 'zh-TW': '食材獲取S', 'en-US': 'Ingredient Magnet S' },
    '食材獲取M': { 'zh-TW': '食材獲取M', 'en-US': 'Ingredient Magnet M' },
    '食材精選S': { 'zh-TW': '食材精選S', 'en-US': 'Ingredient Selection S' },
    '食材隨機S': { 'zh-TW': '食材隨機S', 'en-US': 'Random Ingredients S' },
    
    '料理強化S': { 'zh-TW': '料理強化S', 'en-US': 'Cooking Power-Up S' },
    '料理強化S (擴充鍋子容量)': { 'zh-TW': '料理強化S (擴充鍋子容量)', 'en-US': 'Cooking Power-Up S' },
    '料理擴大S': { 'zh-TW': '料理擴大S', 'en-US': 'Cooking Power-Up S' },
    '料理成功S': { 'zh-TW': '料理成功S', 'en-US': 'Tasty Chance S' },
    '料理成功S (漂亮成功率提升)': { 'zh-TW': '料理成功S (漂亮成功率提升)', 'en-US': 'Tasty Chance S' },
    '料理成功率提升S': { 'zh-TW': '料理成功率提升S', 'en-US': 'Tasty Chance S' },
    
    '活力填充S': { 'zh-TW': '活力填充S', 'en-US': 'Charge Energy S' },
    '活力充填S': { 'zh-TW': '活力充填S', 'en-US': 'Charge Energy S' },
    '自體活力回復S': { 'zh-TW': '自體活力回復S', 'en-US': 'Charge Energy S' },
    '活力療癒S': { 'zh-TW': '活力療癒S', 'en-US': 'Energizing Cheer S' },
    '活力充沛S': { 'zh-TW': '活力充沛S', 'en-US': 'Energizing Cheer S' },
    '活力全體療癒S': { 'zh-TW': '活力全體療癒S', 'en-US': 'Energy for Everyone S' },
    '全體療癒S': { 'zh-TW': '全體療癒S', 'en-US': 'Energy for Everyone S' },
    '全體能量回復S': { 'zh-TW': '全體能量回復S', 'en-US': 'Energy for Everyone S' },
    
    '幫手支援S': { 'zh-TW': '幫手支援S', 'en-US': 'Extra Helpful S' },
    '幫手加速': { 'zh-TW': '幫手加速', 'en-US': 'Helper Boost' },
    '幫手加速 (屬性) (神獸專屬)': { 'zh-TW': '幫手加速 (屬性) (神獸專屬)', 'en-US': 'Helper Boost' },
    '幫手加速（屬性）（神獸專屬）': { 'zh-TW': '幫手加速（屬性）（神獸專屬）', 'en-US': 'Helper Boost' },
    '幫手加速（電）': { 'zh-TW': '幫手加速（電）', 'en-US': 'Helper Boost (Electric)' },
    '幫手加速 (電)': { 'zh-TW': '幫手加速 (電)', 'en-US': 'Helper Boost (Electric)' },
    '幫手加速（火）': { 'zh-TW': '幫手加速（火）', 'en-US': 'Helper Boost (Fire)' },
    '幫手加速 (火)': { 'zh-TW': '幫手加速 (火)', 'en-US': 'Helper Boost (Fire)' },
    '幫手加速（水）': { 'zh-TW': '幫手加速（水）', 'en-US': 'Helper Boost (Water)' },
    '幫手加速 (水)': { 'zh-TW': '幫手加速 (水)', 'en-US': 'Helper Boost (Water)' },
    '雷公幫手支援': { 'zh-TW': '雷公幫手支援', 'en-US': 'Raikou Helper Boost' },
    '炎帝幫手支援': { 'zh-TW': '炎帝幫手支援', 'en-US': 'Entei Helper Boost' },
    '水君幫手支援': { 'zh-TW': '水君幫手支援', 'en-US': 'Suicune Helper Boost' },
    '傳說降臨（雷公）': { 'zh-TW': '傳說降臨（雷公）', 'en-US': 'Raikou Helper Boost' },
    '傳說降臨（炎帝）': { 'zh-TW': '傳說降臨（炎帝）', 'en-US': 'Entei Helper Boost' },
    '傳說降臨（水君）': { 'zh-TW': '傳說降臨（水君）', 'en-US': 'Suicune Helper Boost' },
    
    '樹果遽增': { 'zh-TW': '樹果遽增', 'en-US': 'Berry Burst' },
    '樹果擴增': { 'zh-TW': '樹果擴增', 'en-US': 'Berry Burst' },
    '樹果領域': { 'zh-TW': '樹果領域', 'en-US': 'Berry Field' },
    '精神擊破（樹果領域）': { 'zh-TW': '精神擊破（樹果領域）', 'en-US': 'Psystrike (Berry Field)' },
    '精神擊破 (樹果領域)': { 'zh-TW': '精神擊破 (樹果領域)', 'en-US': 'Psystrike (Berry Field)' },
    '流星群（樹果遽增）': { 'zh-TW': '流星群（樹果遽增）', 'en-US': 'Draco Meteor (Berry Burst)' },
    '流星群 (樹果遽增)': { 'zh-TW': '流星群 (樹果遽增)', 'en-US': 'Draco Meteor (Berry Burst)' },
    '畫皮（樹果遽增）': { 'zh-TW': '畫皮（樹果遽增）', 'en-US': 'Disguise (Berry Burst)' },
    '畫皮 (樹果遽增)': { 'zh-TW': '畫皮 (樹果遽增)', 'en-US': 'Disguise (Berry Burst)' },
    
    '夢之碎片獲取S': { 'zh-TW': '夢之碎片獲取S', 'en-US': 'Dream Shard Magnet S' },
    '碎片獲取S': { 'zh-TW': '碎片獲取S', 'en-US': 'Dream Shard Magnet S' },
    '夢之碎片獲取S (固定)': { 'zh-TW': '夢之碎片獲取S (固定)', 'en-US': 'Dream Shard Magnet S (Fixed)' },
    '夢之碎片獲取S（固定）': { 'zh-TW': '夢之碎片獲取S（固定）', 'en-US': 'Dream Shard Magnet S (Fixed)' },
    '夢之碎片獲取S (固定值)': { 'zh-TW': '夢之碎片獲取S (固定值)', 'en-US': 'Dream Shard Magnet S (Fixed)' },
    '夢之碎片獲取S (隨機)': { 'zh-TW': '夢之碎片獲取S (隨機)', 'en-US': 'Dream Shard Magnet S (Random)' },
    '夢之碎片獲取S（隨機）': { 'zh-TW': '夢之碎片獲取S（隨機）', 'en-US': 'Dream Shard Magnet S (Random)' },
    '夢之碎片獲取S (隨機/變動值)': { 'zh-TW': '夢之碎片獲取S (隨機/變動值)', 'en-US': 'Dream Shard Magnet S (Random)' },
    '波導彈（夢之碎片獲取S）': { 'zh-TW': '波導彈（夢之碎片獲取S）', 'en-US': 'Aura Sphere (Dream Shard Magnet S)' },
    '波導彈 (夢之碎片獲取S)': { 'zh-TW': '波導彈 (夢之碎片獲取S)', 'en-US': 'Aura Sphere (Dream Shard Magnet S)' },
    
    '揮指': { 'zh-TW': '揮指', 'en-US': 'Metronome' },
    '揮指（隨機技能）': { 'zh-TW': '揮指（隨機技能）', 'en-US': 'Metronome (Random)' },
    '揮指 (隨機技能)': { 'zh-TW': '揮指 (隨機技能)', 'en-US': 'Metronome (Random)' },
    '十項全能（揮指）[可替換]': { 'zh-TW': '十項全能（揮指）[可替換]', 'en-US': 'All-Rounder (Metronome) [Customizable]' },
    '十項全能 (揮指) [可替換]': { 'zh-TW': '十項全能 (揮指) [可替換]', 'en-US': 'All-Rounder (Metronome) [Customizable]' },
    
    '變身': { 'zh-TW': '變身', 'en-US': 'Transform' },
    '技能複製': { 'zh-TW': '技能複製', 'en-US': 'Skill Copy' },
    '變身（技能複製）': { 'zh-TW': '變身（技能複製）', 'en-US': 'Transform (Skill Copy)' },
    '模仿': { 'zh-TW': '模仿', 'en-US': 'Mimic' },
    '模仿（技能複製）': { 'zh-TW': '模仿（技能複製）', 'en-US': 'Mimic (Skill Copy)' },
    '模仿 (技能複製)': { 'zh-TW': '模仿 (技能複製)', 'en-US': 'Mimic (Skill Copy)' },
    
    '月光': { 'zh-TW': '月光', 'en-US': 'Moonlight' },
    '月光（活力填充S）': { 'zh-TW': '月光（活力填充S）', 'en-US': 'Moonlight (Charge Energy S)' },
    '月光 (活力填充S)': { 'zh-TW': '月光 (活力填充S)', 'en-US': 'Moonlight (Charge Energy S)' },
    '新月祈禱（活力全體療癒S）': { 'zh-TW': '新月祈禱（活力全體療癒S）', 'en-US': 'Lunar Prayer (Energy for Everyone S)' },
    '新月祈禱 (活力全體療癒S)': { 'zh-TW': '新月祈禱 (活力全體療癒S)', 'en-US': 'Lunar Prayer (Energy for Everyone S)' },
    
    '蓄力': { 'zh-TW': '蓄力', 'en-US': 'Stockpile' },
    '蓄力（能量填充S）': { 'zh-TW': '蓄力（能量填充S）', 'en-US': 'Stockpile (Charge Strength S)' },
    '蓄力 (能量填充S)': { 'zh-TW': '蓄力 (能量填充S)', 'en-US': 'Stockpile (Charge Strength S)' },
    
    '夢魘': { 'zh-TW': '夢魘', 'en-US': 'Bad Dreams' },
    '夢魘（能量填充M）': { 'zh-TW': '夢魘（能量填充M）', 'en-US': 'Bad Dreams (Charge Strength M)' },
    '夢魘 (能量填充M)': { 'zh-TW': '夢魘 (能量填充M)', 'en-US': 'Bad Dreams (Charge Strength M)' },
    '達克萊伊專屬': { 'zh-TW': '達克萊伊專屬', 'en-US': 'Darkrai Nightmare' },
    
    '健美（料理輔助S）': { 'zh-TW': '健美（料理輔助S）', 'en-US': 'Bulk Up (Cooking Assist S)' },
    '健美 (料理輔助S)': { 'zh-TW': '健美 (料理輔助S)', 'en-US': 'Bulk Up (Cooking Assist S)' },
    '樹果汁（活力全體療癒S）': { 'zh-TW': '樹果汁（活力全體療癒S）', 'en-US': 'Berry Juice (Energy for Everyone S)' },
    '樹果汁 (活力全體療癒S)': { 'zh-TW': '樹果汁 (活力全體療癒S)', 'en-US': 'Berry Juice (Energy for Everyone S)' },
    '禮物（食材獲取S）': { 'zh-TW': '禮物（食材獲取S）', 'en-US': 'Present (Ingredient Magnet S)' },
    '禮物 (食材獲取S)': { 'zh-TW': '禮物 (食材獲取S)', 'en-US': 'Present (Ingredient Magnet S)' },
    '食材精選S': { 'zh-TW': '食材精選S', 'en-US': 'Ingr. Select S' },
    '怪力鉗（食材精選S）': { 'zh-TW': '怪力鉗（食材精選S）', 'en-US': 'Hyper Cutter (Ingr. Select S)' },
    '怪力鉗 (食材精選S)': { 'zh-TW': '怪力鉗 (食材精選S)', 'en-US': 'Hyper Cutter (Ingr. Select S)' },
    '怪力钳（食材精選S）': { 'zh-TW': '怪力钳（食材精選S）', 'en-US': 'Hyper Cutter (Ingr. Select S)' },
    '怪力钳 (食材精選S)': { 'zh-TW': '怪力钳 (食材精選S)', 'en-US': 'Hyper Cutter (Ingr. Select S)' },
    '超幸運（食材精選S）': { 'zh-TW': '超幸運（食材精選S）', 'en-US': 'Super Luck (Ingr. Select S)' },
    '超幸運 (食材精選S)': { 'zh-TW': '超幸運 (食材精選S)', 'en-US': 'Super Luck (Ingr. Select S)' },
    '正電（食材獲取S）': { 'zh-TW': '正電（食材獲取S）', 'en-US': 'Plus (Ingredient Magnet S)' },
    '正電 (食材獲取S)': { 'zh-TW': '正電 (食材獲取S)', 'en-US': 'Plus (Ingredient Magnet S)' },
    '負電（料理強化S）': { 'zh-TW': '負電（料理強化S）', 'en-US': 'Minus (Cooking Power-Up S)' },
    '負電 (料理強化S)': { 'zh-TW': '負電 (料理強化S)', 'en-US': 'Minus (Cooking Power-Up S)' },
    '治癒波動（活力療癒S）': { 'zh-TW': '治癒波動（活力療癒S）', 'en-US': 'Heal Pulse (Energizing Cheer S)' },
    '治癒波動 (活力療癒S)': { 'zh-TW': '治癒波動 (活力療癒S)', 'en-US': 'Heal Pulse (Energizing Cheer S)' },
    '蹭蹭臉頰（活力療癒S）': { 'zh-TW': '蹭蹭臉頰（活力療癒S）', 'en-US': 'Nuzzle (Energizing Cheer S)' },
    '蹭蹭臉頰 (活力療癒S)': { 'zh-TW': '蹭蹭臉頰 (活力療癒S)', 'en-US': 'Nuzzle (Energizing Cheer S)' },
    
    '電光一閃': { 'zh-TW': '電光一閃', 'en-US': 'Quick Attack' },
    '精神強念': { 'zh-TW': '精神強念', 'en-US': 'Psychic' },
    '晨光': { 'zh-TW': '晨光', 'en-US': 'Morning Sun' }
  };

  // 副技能官方英中對照
  const SUBSKILL_NAMES = {
    '樹果數量S': { 'zh-TW': '樹果數量S', 'en-US': 'Berry Finding S' },
    '幫手獎勵': { 'zh-TW': '幫手獎勵', 'en-US': 'Helping Bonus' },
    '睡眠EXP提升': { 'zh-TW': '睡眠EXP提升', 'en-US': 'Sleep EXP Bonus' },
    '睡眠EXP獎勵': { 'zh-TW': '睡眠EXP獎勵', 'en-US': 'Sleep EXP Bonus' },
    '研究EXP提升': { 'zh-TW': '研究EXP提升', 'en-US': 'Research EXP Bonus' },
    '研究EXP獎勵': { 'zh-TW': '研究EXP獎勵', 'en-US': 'Research EXP Bonus' },
    '夢之碎片獎勵': { 'zh-TW': '夢之碎片獎勵', 'en-US': 'Dream Shard Bonus' },
    '活力回復獎勵': { 'zh-TW': '活力回復獎勵', 'en-US': 'Energy Recovery Bonus' },
    '幫手速度M': { 'zh-TW': '幫手速度M', 'en-US': 'Helping Speed M' },
    '幫忙速度M': { 'zh-TW': '幫忙速度M', 'en-US': 'Helping Speed M' },
    '幫手速度S': { 'zh-TW': '幫手速度S', 'en-US': 'Helping Speed S' },
    '幫忙速度S': { 'zh-TW': '幫忙速度S', 'en-US': 'Helping Speed S' },
    '食材機率提升M': { 'zh-TW': '食材機率提升M', 'en-US': 'Ingredient Finder M' },
    '食材機率提升S': { 'zh-TW': '食材機率提升S', 'en-US': 'Ingredient Finder S' },
    '技能發動率提升M': { 'zh-TW': '技能發動率提升M', 'en-US': 'Skill Trigger M' },
    '技能發動率提升S': { 'zh-TW': '技能發動率提升S', 'en-US': 'Skill Trigger S' },
    '技能機率提升M': { 'zh-TW': '技能機率提升M', 'en-US': 'Skill Trigger M' },
    '技能機率提升S': { 'zh-TW': '技能機率提升S', 'en-US': 'Skill Trigger S' },
    '技能機率M': { 'zh-TW': '技能機率M', 'en-US': 'Skill Trigger M' },
    '技能機率S': { 'zh-TW': '技能機率S', 'en-US': 'Skill Trigger S' },
    '技能等級提升M': { 'zh-TW': '技能等級提升M', 'en-US': 'Skill Level Up M' },
    '技能等級提升S': { 'zh-TW': '技能等級提升S', 'en-US': 'Skill Level Up S' },
    '持有上限提升L': { 'zh-TW': '持有上限提升L', 'en-US': 'Inventory Up L' },
    '持有上限提升M': { 'zh-TW': '持有上限提升M', 'en-US': 'Inventory Up M' },
    '持有上限提升S': { 'zh-TW': '持有上限提升S', 'en-US': 'Inventory Up S' },
    '持有上限提升 L': { 'zh-TW': '持有上限提升 L', 'en-US': 'Inventory Up L' },
    '持有上限提升 M': { 'zh-TW': '持有上限提升 M', 'en-US': 'Inventory Up M' },
    '持有上限提升 S': { 'zh-TW': '持有上限提升 S', 'en-US': 'Inventory Up S' },
    '最大持有上限提升L': { 'zh-TW': '最大持有上限提升L', 'en-US': 'Inventory Up L' },
    '最大持有上限提升M': { 'zh-TW': '最大持有上限提升M', 'en-US': 'Inventory Up M' },
    '最大持有上限提升S': { 'zh-TW': '最大持有上限提升S', 'en-US': 'Inventory Up S' },
    '活力回復提升S': { 'zh-TW': '活力回復提升S', 'en-US': 'Energy Recovery Up S' }
  };

  // 道具名稱官方英中對照
  const ITEM_NAMES = {
    '寶可沙布蕾': { 'zh-TW': '寶可沙布蕾', 'en-US': 'Poké Biscuit' },
    '超級沙布蕾': { 'zh-TW': '超級沙布蕾', 'en-US': 'Great Biscuit' },
    '高級沙布蕾': { 'zh-TW': '高級沙布蕾', 'en-US': 'Ultra Biscuit' },
    '大師沙布蕾': { 'zh-TW': '大師沙布蕾', 'en-US': 'Master Biscuit' },
    '主技能種子': { 'zh-TW': '主技能種子', 'en-US': 'Main Skill Seed' },
    '副技能種子': { 'zh-TW': '副技能種子', 'en-US': 'Sub Skill Seed' },
    '萬能糖果S': { 'zh-TW': '萬能糖果S', 'en-US': 'Handy Candy S' },
    '萬能糖果M': { 'zh-TW': '萬能糖果M', 'en-US': 'Handy Candy M' },
    '萬能糖果L': { 'zh-TW': '萬能糖果L', 'en-US': 'Handy Candy L' },
    '萬能糖果': { 'zh-TW': '萬能糖果', 'en-US': 'Handy Candy' },
    '夢之塊S': { 'zh-TW': '夢之塊S', 'en-US': 'Dream Cluster S' },
    '夢之塊M': { 'zh-TW': '夢之塊M', 'en-US': 'Dream Cluster M' },
    '夢之塊L': { 'zh-TW': '夢之塊L', 'en-US': 'Dream Cluster L' },
    '夢之塊': { 'zh-TW': '夢之塊', 'en-US': 'Dream Cluster' },
    '夢之碎片': { 'zh-TW': '夢之碎片', 'en-US': 'Dream Shards' },
    '友好薰香': { 'zh-TW': '友好薰香', 'en-US': 'Friend Incense' },
    '成長薰香': { 'zh-TW': '成長薰香', 'en-US': 'Growth Incense' },
    '幸運薰香': { 'zh-TW': '幸運薰香', 'en-US': 'Luck Incense' },
    '專注薰香': { 'zh-TW': '專注薰香', 'en-US': 'Focus Incense' },
    '通透薰香': { 'zh-TW': '通透薰香', 'en-US': 'Pure Incense' },
    '回復薰香': { 'zh-TW': '回復薰香', 'en-US': 'Recovery Incense' },
    '專用薰香': { 'zh-TW': '專用薰香', 'en-US': 'Specific Incense' },
    '薰香': { 'zh-TW': '薰香', 'en-US': 'Incense' },
    '糖果': { 'zh-TW': '糖果', 'en-US': 'Candy' },
    '鑽石': { 'zh-TW': '鑽石', 'en-US': 'Diamonds' },
    '睡眠點數': { 'zh-TW': '睡眠點數', 'en-US': 'Sleep Points' },
    '幫手哨子': { 'zh-TW': '幫手哨子', 'en-US': 'Helper Whistle' },
    '好的營地套票': { 'zh-TW': '好的營地套票', 'en-US': 'Good Camp Ticket' },
    '露營券': { 'zh-TW': '露營券', 'en-US': 'Good Camp Ticket' },
    '能量枕頭': { 'zh-TW': '能量枕頭', 'en-US': 'Energy Pillow' },
    '寶可夢的糖果': { 'zh-TW': '寶可夢的糖果', 'en-US': 'Pokémon Candy' },
    '寶可夢糖果': { 'zh-TW': '寶可夢糖果', 'en-US': 'Pokémon Candy' }
  };

  // 島嶼與營地名稱官方英中對照
  const ISLAND_NAMES = {
    '萌綠之島': { 'zh-TW': '萌綠之島', 'en-US': 'Greengrass Isle' },
    '萌綠之島EX': { 'zh-TW': '萌綠之島EX', 'en-US': 'Greengrass Isle EX' },
    '天青沙灘': { 'zh-TW': '天青沙灘', 'en-US': 'Cyan Beach' },
    '天青沙灘EX': { 'zh-TW': '天青沙灘EX', 'en-US': 'Cyan Beach EX' },
    '灰褐洞窟': { 'zh-TW': '灰褐洞窟', 'en-US': 'Taupe Hollow' },
    '白花雪原': { 'zh-TW': '白花雪原', 'en-US': 'Snowdrop Tundra' },
    '寶藍湖畔': { 'zh-TW': '寶藍湖畔', 'en-US': 'Lapis Lakeside' },
    '黃金舊發電廠': { 'zh-TW': '黃金舊發電廠', 'en-US': 'Old Gold Power Plant' },
    '琥褐溪谷': { 'zh-TW': '琥褐溪谷', 'en-US': 'Amber Canyon' }
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

    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', currentLang === 'zh-TW' ? 'zh-Hant' : 'en');
      document.documentElement.setAttribute('data-lang', currentLang === 'zh-TW' ? 'zh' : 'en');
      const onReady = () => {
        updatePageTranslations();
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
      } else {
        onReady();
      }
    }
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
      document.documentElement.setAttribute('data-lang', lang === 'zh-TW' ? 'zh' : 'en');
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
      if (window.WikiDB && typeof window.WikiDB.renderWikiLayout === 'function') {
        const wikiPanel = document.getElementById('panel-wiki');
        if (wikiPanel) {
          window.WikiDB.renderWikiLayout(wikiPanel);
          // 重新渲染後執行必要的計算
          if (typeof window.WikiDB.recalcTriggerChance === 'function') window.WikiDB.recalcTriggerChance();
          if (typeof window.WikiDB.recalcSleepDays === 'function') window.WikiDB.recalcSleepDays();
          if (typeof window.WikiDB.refreshCoordinateLadder === 'function') window.WikiDB.refreshCoordinateLadder();
        }
      } else if (window.WikiDB && typeof window.WikiDB.init === 'function') {
        window.WikiDB.init();
      }
      if (window.PokemonBoxApp && typeof window.PokemonBoxApp.renderBox === 'function') {
        window.PokemonBoxApp.renderBox();
      }
      if (window.NewsApp && typeof window.NewsApp.render === 'function') {
        window.NewsApp.render();
      }
      if (window.AppraisalLab && typeof window.AppraisalLab.renderLab === 'function') {
        const labCont = document.getElementById('appraisal-lab-container');
        if (labCont) window.AppraisalLab.renderLab(labCont);
      }
      if (typeof CustomEvent !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('appLanguageChanged', { detail: { lang: currentLang } }));
      }
    }
  }

  // ─── 🛡️ 全域正規化與多層級容錯查找引擎 (Universal Normalization Engine) ───
  function normalizeSearchKey(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .trim()
      .replace(/（/g, '(')
      .replace(/）/g, ')')
      .replace(/【/g, '[')
      .replace(/】/g, ']')
      .replace(/：/g, ':')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\[\s+/g, '[')
      .replace(/\s+\]/g, ']')
      .replace(/恢復/g, '回復')
      .replace(/恢/g, '回')
      .replace(/\s+/g, ' ');
  }

  function lookupBilingualDict(dict, query, lang = currentLang) {
    if (!query || !dict) return null;
    const str = String(query).trim();
    if (!str) return '';

    // Level 1: 直接精確命中 (Direct Fast Match)
    if (dict[str]) {
      const val = dict[str];
      return typeof val === 'object' ? (val[lang] || val['en-US'] || str) : val;
    }

    // Level 2: 標點符號與括號正規化比對 (Normalized Match)
    const normTarget = normalizeSearchKey(str);
    for (const key in dict) {
      if (normalizeSearchKey(key) === normTarget) {
        const val = dict[key];
        return typeof val === 'object' ? (val[lang] || val['en-US'] || str) : val;
      }
    }

    // Level 3: 緊湊無視空格比對 (Compact Match without Whitespace)
    const compactTarget = str.replace(/\s+/g, '').replace(/（/g, '(').replace(/）/g, ')').replace(/恢/g, '回');
    for (const key in dict) {
      const compactKey = key.replace(/\s+/g, '').replace(/（/g, '(').replace(/）/g, ')').replace(/恢/g, '回');
      if (compactKey === compactTarget) {
        const val = dict[key];
        return typeof val === 'object' ? (val[lang] || val['en-US'] || str) : val;
      }
    }

    return null;
  }

  function t(key, fallback = '') {
    const dict = DICTIONARY[currentLang] || DICTIONARY[DEFAULT_LANG];
    return dict[key] || fallback || key;
  }

  function getTypeName(type) {
    if (!type) return '';
    return lookupBilingualDict(TYPE_NAMES, type) || type;
  }

  const TYPE_SVG_PATHS = {
    bug: '<path clip-rule="evenodd" d="m342.198.501279c.373-.5317158 1.105-.660937 1.637-.288625l36.354 25.455546c.532.3723.661 1.1051.289 1.6368l-50.599 72.2623c24.599 7.8587 41.358 16.3357 41.358 16.3357s-40.964 70.462-110.443 70.462-118.85-65.672-118.85-65.672 17.506-11.172 43.456-20.7539l-55.5-66.1415c-.417-.4973-.352-1.2386.145-1.6558l33.997-28.52715c.498-.41723 1.239-.35238 1.656.14487l70.272 83.74688c6.017-.6806 12.147-1.061 18.333-1.061 8.891 0 17.771.6759 26.44 1.8229zm13.746 189.200721c18.541-13.242 46.597-47.804 46.597-47.804s71.664 56.79 71.664 177.206c0 120.415-123.896 192.888-123.896 192.888s-59.195-59.781-73.727-135.562c-14.531-75.781 21.496-159.927 21.496-159.927s39.324-13.559 57.866-26.801zm-199.683 0c-18.541-13.242-46.597-47.804-46.597-47.804s-71.664 56.79-71.664 177.206c0 120.415 123.896 192.888 123.896 192.888s59.195-59.781 73.727-135.562c14.531-75.781-21.496-159.927-21.496-159.927s-39.324-13.559-57.866-26.801z" fill="currentColor" fill-rule="evenodd"/>',
    dark: '<path fill-rule="evenodd" clip-rule="evenodd" d="M229.379 452.85C239.106 454.339 249.068 455.111 259.212 455.111C367.214 455.111 454.767 367.558 454.767 259.556C454.767 151.553 367.214 64 259.212 64C251.966 64 244.811 64.3941 237.77 65.1621C291.345 105.751 326.767 176.062 326.767 256C326.767 340.04 287.616 413.44 229.379 452.85ZM255.656 512C397.041 512 511.656 397.385 511.656 256C511.656 114.615 397.041 0 255.656 0C114.271 0 -0.34375 114.615 -0.34375 256C-0.34375 397.385 114.271 512 255.656 512Z" fill="currentColor"/>',
    dragon: '<path fill-rule="evenodd" clip-rule="evenodd" d="M280.702 254.881C284.172 252.765 287.116 248.331 289.49 243.403C320.735 256.173 342.692 286.349 342.692 321.54C342.692 368.29 303.942 406.189 256.142 406.189C236.52 406.189 218.423 399.802 203.906 389.039C199.144 386.784 195.226 384.618 192.02 382.845C187.047 380.096 183.786 378.293 181.744 378.575C175.775 379.398 177.508 384.89 179.083 389.879C180.152 393.268 181.149 396.425 179.606 397.727C177.992 399.091 172.764 394.106 166.655 388.282C158.339 380.353 148.391 370.868 143.7 373.717C139.991 375.97 143.592 382.081 148 389.561L148.327 390.116C150.189 393.278 152.347 396.498 154.316 399.436C158.319 405.407 161.543 410.219 159.93 411.033C157.98 412.017 144.394 402.847 132.945 390.116C128.526 385.203 124.246 379.877 120.268 374.928L120.268 374.927C111.561 364.093 104.307 355.068 100.235 356.137C95.3365 357.423 99.0421 367.527 104.487 377.25C107.033 381.797 110.028 386.427 112.621 390.436L112.621 390.437C116.654 396.671 119.715 401.402 118.605 401.984C117.107 402.767 103.926 389.914 94.9734 373.717C89.6559 364.096 85.1909 353.464 81.5761 344.857C77.656 335.522 74.7359 328.569 72.8131 327.869C66.1325 325.438 66.1325 339.059 68.8119 358.718C69.1614 361.283 69.6819 363.973 70.3228 366.712C96.307 450.785 176.128 512 270.567 512C386.084 512 479.728 420.412 479.728 307.432C479.728 199.9 394.899 111.747 287.12 103.494C287.256 98.4284 289.9 88.383 289.9 88.383C289.9 88.383 308.927 42.3472 309.933 32.5099C309.999 31.857 310.078 31.1475 310.163 30.3919C311.348 19.7629 313.553 0 296.551 0C287.471 0 283.249 6.75464 278.42 14.4799L278.42 14.48C276.566 17.4457 274.622 20.5545 272.28 23.479C255.412 44.5436 227.048 70.8488 210.965 84.8631C176.971 114.484 143.619 138.828 124.167 153.026L124.167 153.026L124.166 153.027C115.319 159.484 109.348 163.843 107.5 165.644C93.574 179.22 43.6418 269.286 43.6418 269.286C43.6418 269.286 27.4943 298.182 33.2338 304.043C38.9733 309.903 52.8141 308.56 52.8141 308.56C52.8141 308.56 238.755 265.903 255.402 262.539C259.884 261.633 263.048 261.11 265.477 260.709C272.072 259.62 273.256 259.424 280.702 254.881ZM149.235 200.064C139.254 209.551 122.701 232.196 122.701 232.196C122.701 232.196 153.465 234.091 170.408 217.986C187.352 201.88 183.47 174.433 183.47 174.433C183.47 174.433 159.215 190.577 149.235 200.064Z" fill="currentColor"/>',
    electric: '<path fill-rule="evenodd" clip-rule="evenodd" d="M152.56 0.583659C152.461 0.29796 152.674 0 152.976 0H332.805C332.998 0 333.169 0.125587 333.226 0.309782L415.824 267.171C415.911 267.454 415.7 267.741 415.403 267.741H295.684C295.538 267.741 295.433 267.88 295.473 268.021L364.135 509.726C364.269 510.195 363.654 510.501 363.361 510.111L96.5295 155.267C96.3115 154.977 96.5184 154.563 96.881 154.563H205.536C205.687 154.563 205.793 154.414 205.743 154.271L152.56 0.583659Z" fill="currentColor"/>',
    fairy: '<path fill-rule="evenodd" clip-rule="evenodd" d="M102.726 405.978L184.848 382.166L255.778 511.857C255.871 512.025 256.112 512.025 256.204 511.857L327.134 382.166L409.257 405.978C409.441 406.031 409.612 405.86 409.557 405.676L385.741 325.179L511.856 256.204C512.025 256.112 512.025 255.871 511.857 255.779L384.702 186.235L409.557 102.225C409.612 102.041 409.441 101.87 409.257 101.923L325.208 126.294L256.204 0.126188C256.112 -0.0420597 255.871 -0.0420644 255.779 0.126184L186.775 126.294L102.726 101.923C102.542 101.87 102.371 102.041 102.426 102.225L127.281 186.235L0.126188 255.779C-0.0420597 255.871 -0.0420644 256.112 0.126184 256.204L126.241 325.179L102.426 405.676C102.371 405.86 102.542 406.031 102.726 405.978ZM166.452 256.876L224.631 288.695L256.45 346.873C256.542 347.042 256.784 347.042 256.876 346.873L288.695 288.695L346.873 256.876C347.041 256.784 347.041 256.542 346.873 256.45L288.695 224.631L256.876 166.453C256.784 166.284 256.542 166.284 256.45 166.453L224.631 224.631L166.452 256.45C166.284 256.542 166.284 256.784 166.452 256.876Z" fill="currentColor"/>',
    fighting: '<path fill-rule="evenodd" clip-rule="evenodd" d="M88.2336 42.5656C94.4299 18.1014 116.593 0 142.983 0C162.778 0 180.195 10.1847 190.279 25.6H206.792C217.051 15.0716 231.384 8.53333 247.245 8.53333C270.499 8.53333 290.471 22.5882 299.129 42.6667H312.954C321.617 37.2585 331.853 34.1333 342.818 34.1333C366.073 34.1333 386.044 48.1882 394.702 68.2667H432.297C432.618 68.2667 432.919 68.3532 433.178 68.5041C434.895 68.347 436.634 68.2667 438.391 68.2667C469.582 68.2667 494.866 93.5514 494.866 124.742V294.086L494.867 294.4L494.866 294.714V297.153C494.866 298.186 494.838 299.215 494.782 300.239C491.384 417.717 385.749 512 255.933 512C123.974 512 17 414.577 17 294.4C17 236.391 41.9249 183.683 82.5535 144.675C82.4522 201.228 83.4074 259.694 87.8107 258.691C99.6011 256.003 90.3891 80.8395 88.2336 42.5656Z" fill="currentColor"/>',
    fire: '<path fill-rule="evenodd" clip-rule="evenodd" d="M352.258 395.394C358.584 372.263 346.305 324.71 346.305 324.71C346.305 324.71 337.399 363.449 323.483 377.767C311.611 389.98 297.066 398.451 276.206 400.677C293.261 392.393 304.99 375.12 304.99 355.155C304.99 327.129 281.878 304.409 253.368 304.409C224.858 304.409 201.745 327.129 201.745 355.155C201.745 362.809 203.47 370.068 206.557 376.576C188.725 362.37 185.921 339.594 185.921 339.594C185.921 339.594 166.009 422.264 220.875 461.152C275.74 500.04 383.219 466.614 383.219 466.614C383.219 466.614 229.41 574.837 115.436 457.05C17.2568 355.584 89.8111 222.003 89.8111 222.003C89.8111 222.003 86.6777 234.395 86.6777 248.78C86.6777 263.165 94.477 274.11 94.477 274.11C94.477 274.11 117.742 225.071 135.848 205.128C152.984 186.254 174.465 170.946 193.019 157.724C207.301 147.546 219.849 138.604 227.343 130.223C268.62 84.0687 243.311 0 243.311 0C243.311 0 289.841 41.02 302.831 93.9978C307.783 114.192 304.597 137.169 301.749 157.716C297.125 191.072 293.388 218.025 326.793 216.276C380.775 213.449 333.866 130.223 333.866 130.223C333.866 130.223 456.318 194.583 447.17 307.145C438.021 419.707 313.324 445.297 313.324 445.297C313.324 445.297 345.931 418.525 352.258 395.394Z" fill="currentColor"/>',
    flying: '<path fill-rule="evenodd" clip-rule="evenodd" d="M178.712 477.733C253.715 477.733 317.927 436.048 344.436 376.956C344.76 376.235 238.007 404.699 241.411 394.637C242.931 390.144 308.371 366.238 356.048 338.354C383.451 322.327 396.07 288.4 396.07 288.4C396.07 288.4 349.903 310.815 326.564 316.501C279.532 327.961 238.131 326.727 238.131 325.533C238.131 322.951 306.876 309.889 402.424 251.664C447.367 224.277 459.574 177.103 459.574 177.103C459.574 177.103 410.163 206.535 380.293 216.252C309.457 239.295 244.815 246.239 244.815 243.121C244.815 236.445 301.702 220.802 362.016 191.577C393.376 176.382 420.535 156.53 452.008 134.453C503.506 98.332 511.999 34 511.999 34C511.999 34 461.207 66.7601 436.42 77.6394C334.141 122.531 243.829 146.079 178.712 151.177C80.416 158.873 0 227.456 0 316.501C0 405.547 80.0119 477.733 178.712 477.733Z" fill="currentColor"/>',
    ghost: '<path fill-rule="evenodd" clip-rule="evenodd" d="M368.952 510.227C322.769 512.591 269.896 512.591 251.928 510.227C111.77 491.788 0 389.313 0 250.8C0 112.287 114.615 0 256 0C397.385 0 512 112.287 512 250.8C512 315.221 487.207 373.969 446.46 418.387C435.395 430.448 450.577 438.908 466.002 447.504C481.13 455.935 496.492 464.496 487.564 476.712C477.726 490.173 424.392 507.389 368.952 510.227ZM220 219.45C220 241.092 202.091 258.637 180 258.637C157.909 258.637 140 241.092 140 219.45C140 204.935 148.055 192.264 160.024 185.491C160.713 204.362 176.229 219.449 195.269 219.449H220C220 219.449 220 219.45 220 219.45ZM343.976 185.491C343.287 204.362 327.771 219.449 308.731 219.449H284C284 219.449 284 219.45 284 219.45C284 241.092 301.909 258.637 324 258.637C346.091 258.637 364 241.092 364 219.45C364 204.935 355.945 192.264 343.976 185.491Z" fill="currentColor"/>',
    grass: '<path clip-rule="evenodd" d="m97.4121 440.649c-1.7574-1.653-3.4954-3.338-5.2132-5.056-90.68455-90.684-90.68453-237.713 0-328.397 90.6841-90.6849 379.6401-96.7516 379.6401-96.7516s39.442 334.4646-51.242 425.1486c-80.54 80.54-205.522 89.55-296.005 27.031l72.908-89.471 116.55-25.163-95.139-9.511 60.462-61.562 68.824-15.077-54.422-16.117 54.422-98.176-77.41 86.828-29.893-42.183 10.523 69.648-53.917 60.782-24.993-76.9v102.268z" fill="currentColor" fill-rule="evenodd"/>',
    ground: '<path fill-rule="evenodd" clip-rule="evenodd" d="M112.764 439.754C112.625 439.754 112.528 439.617 112.574 439.486L243.289 70.134C243.318 70.0537 243.394 70 243.479 70H383.021C383.106 70 383.183 70.0541 383.211 70.1349L511.987 439.487C512.032 439.618 511.935 439.754 511.797 439.754H116.692H112.764ZM0.201306 441.199C0.0609122 441.199 -0.0362852 441.059 0.0129607 440.928L97.3526 181.056C97.3821 180.977 97.4571 180.925 97.541 180.925H182.118C182.258 180.925 182.355 181.064 182.307 181.195L88.1823 441.067C88.1535 441.146 88.0779 441.199 87.9932 441.199H0.201306Z" fill="currentColor"/>',
    ice: '<path fill-rule="evenodd" clip-rule="evenodd" d="M384.304 39.0418L385.879 177.392L265.209 235.319L263.721 104.69L384.304 39.0418Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M505.269 257.047L385.814 325.374L266.288 256.939L385.752 194.187L505.269 257.047Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M245.04 257.047L125.585 325.374L6.05861 256.939L125.523 194.187L245.04 257.047Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M124.243 38.4753L248.229 99.881L245.059 233.697L127.993 175.719L124.243 38.4753Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M387.678 473.525L263.692 412.119L266.862 278.302L383.928 336.281L387.678 473.525Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M128.525 474.77L126.949 336.42L247.62 278.493L249.108 409.121L128.525 474.77Z" fill="currentColor"/>',
    normal: '<path fill-rule="evenodd" clip-rule="evenodd" d="M481 256C481 380.264 380.264 481 256 481C131.736 481 31 380.264 31 256C31 131.736 131.736 31 256 31C380.264 31 481 131.736 481 256ZM384.571 256C384.571 327.008 327.008 384.571 256 384.571C184.992 384.571 127.429 327.008 127.429 256C127.429 184.992 184.992 127.429 256 127.429C327.008 127.429 384.571 184.992 384.571 256Z" fill="currentColor"/>',
    poison: '<path fill-rule="evenodd" clip-rule="evenodd" d="M427.821 393.449C479.524 352.108 512 292.376 512 225.95C512 101.161 397.385 0 256 0C114.615 0 0 101.161 0 225.95C0 289.978 30.1737 347.786 78.6553 388.901C75.7171 399.046 74.1052 410.081 74.1052 421.62C74.1052 471.535 104.267 512 141.474 512C165.65 512 186.852 494.915 198.737 469.254C210.622 494.915 231.824 512 256 512C278.038 512 297.604 497.804 309.895 475.857C322.186 497.804 341.752 512 363.789 512C400.996 512 431.158 471.535 431.158 421.62C431.158 411.784 429.986 402.314 427.821 393.449ZM404.211 230.431C404.211 293.785 336.346 345.144 252.632 345.144C168.917 345.144 101.053 293.785 101.053 230.431C101.053 167.077 168.917 115.718 252.632 115.718C336.346 115.718 404.211 167.077 404.211 230.431Z" fill="currentColor"/>',
    psychic: '<path fill-rule="evenodd" clip-rule="evenodd" d="M455.925 425.184C455.925 425.184 391.365 476.963 262.893 455.536C165.423 439.279 113.437 331.833 113.437 274.079C113.437 137.149 214.783 105.988 283.3 105.988C351.816 105.988 396.513 172.788 396.513 224.508C396.513 276.228 359.933 321.466 303.006 321.466C246.08 321.466 229.22 281.501 229.22 244.758C229.22 208.016 258.947 195.071 286.058 195.071C313.169 195.071 322.452 218.217 322.452 238.11C322.452 258.004 307.017 265.128 294.143 265.128C281.269 265.128 279.996 258.633 275.069 251.807C270.141 244.982 281.353 219.146 262.893 219.146C244.433 219.146 240.992 248.847 240.992 248.847C240.992 248.847 247.722 306.18 303.006 305.191C358.291 304.201 384.518 261.461 376.896 219.146C369.274 176.83 328.207 131.865 256.133 140.951C184.059 150.037 154.632 222.861 167.603 300.685C180.574 378.51 273.807 423.602 347.112 407.379C420.418 391.156 493.429 338.086 493.429 203.533C493.429 68.9789 376.896 -11.9002 237.941 1.42913C98.9859 14.7584 12.729 136.242 18.2502 282.207C23.7714 428.172 162.275 507.669 279.394 511.766C396.513 515.864 468.312 448.067 468.312 448.067C468.312 448.067 484.459 433.668 478.128 422.424C471.798 411.18 455.925 425.184 455.925 425.184Z" fill="currentColor"/>',
    rock: '<path fill-rule="evenodd" clip-rule="evenodd" d="M395.138 244.757C395.109 244.717 395.097 244.667 395.105 244.618L427.769 54.1518C427.784 54.0641 427.861 54 427.949 54H438.287C438.367 54 438.437 54.0517 438.461 54.1277L512.051 287.131C512.074 287.203 512.049 287.283 511.989 287.33L457.73 329.693C457.649 329.756 457.532 329.74 457.471 329.657L395.138 244.757ZM-1 371.022C-1 371.101 -0.949204 371.171 -0.874109 371.196L110.975 407.767C111.029 407.785 111.089 407.776 111.136 407.744L361.145 235.144C361.187 235.115 361.215 235.07 361.222 235.02L388.032 55.1284C388.049 55.018 387.963 54.9188 387.852 54.9188H166.406C166.351 54.9188 166.3 54.943 166.265 54.9849L-0.957974 256.714C-0.98514 256.747 -1 256.788 -1 256.831V371.022ZM157.583 417.085L279.776 457.112C279.831 457.13 279.892 457.121 279.939 457.087L425.418 352.734C425.499 352.677 425.519 352.566 425.464 352.484L370.928 271.329C370.871 271.244 370.757 271.222 370.673 271.28L157.583 417.085Z" fill="currentColor"/>',
    steel: '<path fill-rule="evenodd" clip-rule="evenodd" d="M0.0511107 254.527C-0.0170046 254.411 -0.0170388 254.267 0.0510196 254.15L128.795 34.1843C128.862 34.0702 128.985 34 129.117 34H384.294C384.427 34 384.55 34.0708 384.617 34.1859L511.949 254.152C512.016 254.267 512.016 254.41 511.949 254.525L384.617 474.244C384.55 474.359 384.427 474.43 384.294 474.43H129.117C128.985 474.43 128.862 474.36 128.795 474.246L0.0511107 254.527ZM374.617 254.215C374.617 319.703 321.528 372.792 256.04 372.792C190.552 372.792 137.463 319.703 137.463 254.215C137.463 188.726 190.552 135.638 256.04 135.638C321.528 135.638 374.617 188.726 374.617 254.215Z" fill="currentColor"/>',
    water: '<path fill-rule="evenodd" clip-rule="evenodd" d="M422.172 346.515C422.172 437.897 347.813 511.977 256.086 511.977C164.359 511.977 90 437.897 90 346.515C90 257.639 247.102 13.5479 255.718 0.22781C255.915 -0.0759384 256.258 -0.0759358 256.454 0.227813C265.07 13.5479 422.172 257.639 422.172 346.515ZM228.4 458.931C144.12 440.49 158.542 347.13 158.542 347.13C158.542 347.13 181.556 403.488 237.405 421.744C293.253 439.999 360.745 413.225 360.745 413.225C360.745 413.225 312.68 477.371 228.4 458.931Z" fill="currentColor"/>'
  };

  const TYPE_CANONICAL_MAP = {
    '草': 'grass', 'grass': 'grass',
    '火': 'fire', 'fire': 'fire',
    '水': 'water', 'water': 'water',
    '電': 'electric', 'electric': 'electric',
    '冰': 'ice', 'ice': 'ice',
    '格鬥': 'fighting', '鬥': 'fighting', 'fighting': 'fighting',
    '毒': 'poison', 'poison': 'poison',
    '地面': 'ground', '地': 'ground', 'ground': 'ground',
    '飛行': 'flying', '飛': 'flying', 'flying': 'flying',
    '超能力': 'psychic', '超': 'psychic', '超能': 'psychic', 'psychic': 'psychic',
    '蟲': 'bug', 'bug': 'bug',
    '岩石': 'rock', '岩': 'rock', 'rock': 'rock',
    '幽靈': 'ghost', '鬼': 'ghost', 'ghost': 'ghost',
    '龍': 'dragon', 'dragon': 'dragon',
    '惡': 'dark', 'dark': 'dark',
    '鋼': 'steel', 'steel': 'steel',
    '妖精': 'fairy', '妖': 'fairy', 'fairy': 'fairy',
    '一般': 'normal', 'normal': 'normal'
  };

  function safeEscape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const TYPE_COLOR_HEX = {
    grass: '#4ad071',
    fire: '#fb6c6c',
    water: '#76befe',
    electric: '#ffd833',
    bug: '#92dc3d',
    normal: '#a8a878',
    poison: '#aa45a0',
    fighting: '#c03028',
    ground: '#e0c068',
    rock: '#b8a038',
    psychic: '#f85888',
    ice: '#7cd8c1',
    dragon: '#7038f8',
    ghost: '#70559b',
    dark: '#705848',
    steel: '#b8b8d0',
    fairy: '#f49ba8',
    flying: '#a890f0'
  };

  function getTypeIconSvg(type, size = 16) {
    if (!type) return '';
    const rawType = String(type).trim();
    const key = TYPE_CANONICAL_MAP[rawType] || TYPE_CANONICAL_MAP[rawType.toLowerCase()] || 'normal';
    const pathContent = TYPE_SVG_PATHS[key] || TYPE_SVG_PATHS['normal'];
    const typeDisplayName = getTypeName(rawType);
    const colorHex = TYPE_COLOR_HEX[key] || '#a8a878';
    return `<svg class="pkm-type-icon type-${key}" viewBox="0 0 512 512" width="${size}" height="${size}" aria-label="${safeEscape(typeDisplayName)}" title="${safeEscape(typeDisplayName)}" style="fill: var(--type-${rawType}, ${colorHex}); color: var(--type-${rawType}, ${colorHex});">${pathContent}</svg>`;
  }

  function getSpecialtyName(spec) {
    if (!spec) return '';
    return lookupBilingualDict(SPECIALTY_NAMES, spec) || spec;
  }

  const INGREDIENT_ICONS = {
    '特選蘋果': 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png',
    'Fancy Apple': 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png',
    'apple': 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png',
    '哞哞鮮奶': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png',
    '窩心牛奶': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png',
    'Moomoo Milk': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png',
    'milk': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png',
    '萌綠大豆': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png',
    'Greengrass Soybeans': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png',
    'soybeans': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png',
    '甜甜蜜': 'https://www.serebii.net/pokemonsleep/ingredients/honey.png',
    'Honey': 'https://www.serebii.net/pokemonsleep/ingredients/honey.png',
    'honey': 'https://www.serebii.net/pokemonsleep/ingredients/honey.png',
    '豆製肉': 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png',
    'Bean Sausage': 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png',
    'sausage': 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png',
    '暖暖薑': 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png',
    'Warming Ginger': 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png',
    'ginger': 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png',
    '好眠番茄': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png',
    '熟透番茄': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png',
    'Snoozy Tomato': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png',
    'tomato': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png',
    '特選蛋': 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png',
    'Fancy Egg': 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png',
    'egg': 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png',
    '純粹油': 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png',
    'Pure Oil': 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png',
    'oil': 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png',
    '窩心洋芋': 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png',
    'Soft Potato': 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png',
    'potato': 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png',
    '火辣香草': 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png',
    'Fiery Herb': 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png',
    'herb': 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png',
    '萌綠玉米': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png',
    'Greengrass Corn': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png',
    'corn': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png',
    '放鬆可可': 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png',
    'Soothing Cacao': 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png',
    'cacao': 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png',
    '醒腦咖啡豆': 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png',
    'Rousing Coffee': 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png',
    'coffee': 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png',
    '嫩亮酪梨': 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png',
    'Glossy Avocado': 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png',
    'glossyavocado': 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png',
    '品鮮蘑菇': 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png',
    'Tasty Mushroom': 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png',
    'mushroom': 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png',
    '粗枝大蔥': 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png',
    'Large Leek': 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png',
    'leek': 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png',
    '沉甸甸南瓜': 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png',
    'Plump Pumpkin': 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png',
    'pumpkin': 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png',
    '美味尾巴': 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png',
    'Slowpoke Tail': 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png',
    'tail': 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png'
  };

  function getIngredientIcon(ing) {
    if (!ing) return '';
    return INGREDIENT_ICONS[ing] || '';
  }

  function getIngredientName(ing) {
    if (!ing) return '';
    return lookupBilingualDict(INGREDIENT_NAMES, ing) || ing;
  }

  function getBerryName(berry) {
    if (!berry) return '';
    return lookupBilingualDict(BERRY_NAMES, berry) || berry;
  }

  function getNatureName(nat) {
    if (!nat) return '';
    return lookupBilingualDict(NATURE_NAMES, nat) || nat;
  }

  function getMainSkillName(skill) {
    if (!skill) return '';
    const res = lookupBilingualDict(MAIN_SKILL_NAMES, skill);
    if (res) return res;

    // 支援複合型括號變體 (例如：能量填充S (隨機))
    const trimmed = String(skill).trim();
    const parenMatch = trimmed.match(/^(.+?)\s*([(\[（【].+[)\]）】])$/);
    if (parenMatch) {
      const baseSkill = getMainSkillName(parenMatch[1]);
      const suffix = translateDynamicText(parenMatch[2]);
      return `${baseSkill} ${suffix}`;
    }
    return trimmed;
  }

  const POKEMON_NAMES = {"妙蛙種子":"Bulbasaur","妙蛙草":"Ivysaur","妙蛙花":"Venusaur","小火龍":"Charmander","火恐龍":"Charmeleon","噴火龍":"Charizard","傑尼龜":"Squirtle","卡咪龜":"Wartortle","水箭龜":"Blastoise","綠毛蟲":"Caterpie","鐵甲蛹":"Metapod","巴大蝶":"Butterfree","小拉達":"Rattata","拉達":"Raticate","阿柏蛇":"Ekans","阿柏怪":"Arbok","皮丘":"Pichu","皮卡丘":"Pikachu","皮卡丘（萬聖節）":"Pikachu (Halloween)","皮卡丘（佳節）":"Pikachu (Holiday)","皮卡丘（船長）":"Pikachu (Captain)","雷丘":"Raichu","穿山鼠":"Sandshrew","穿山王":"Sandslash","皮寶寶":"Cleffa","皮皮":"Clefairy","皮可西":"Clefable","六尾":"Vulpix","六尾（阿羅拉的樣子）":"Vulpix (Alolan Form)","九尾":"Ninetales","九尾（阿羅拉的樣子）":"Ninetales (Alolan Form)","寶寶丁":"Igglybuff","胖丁":"Jigglypuff","胖可丁":"Wigglytuff","地鼠":"Diglett","三地鼠":"Dugtrio","喵喵":"Meowth","貓老大":"Persian","可達鴨":"Psyduck","哥達鴨":"Golduck","猴怪":"Mankey","火爆猴":"Primeape","卡蒂狗":"Growlithe","風速狗":"Arcanine","喇叭芽":"Bellsprout","口呆花":"Weepinbell","大食花":"Victreebel","小拳石":"Geodude","隆隆石":"Graveler","隆隆岩":"Golem","呆呆獸":"Slowpoke","呆殼獸":"Slowbro","呆呆王":"Slowking","小磁怪":"Magnemite","三合一磁怪":"Magneton","自爆磁怪":"Magnezone","大蔥鴨":"Farfetch'd","嘟嘟":"Doduo","嘟嘟利":"Dodrio","鬼斯":"Gastly","鬼斯通":"Haunter","耿鬼":"Gengar","大岩蛇":"Onix","大綱蛇":"Steelix","卡拉卡拉":"Cubone","嘎啦嘎啦":"Marowak","小福蛋":"Happiny","吉利蛋":"Chansey","幸福蛋":"Blissey","袋獸":"Kangaskhan","魔尼尼":"Mime Jr.","魔牆人偶":"Mr. Mime","凱羅斯":"Pinsir","百變怪":"Ditto","伊布":"Eevee","伊布（佳節）":"Eevee (Holiday)","伊布（萬聖節）":"Eevee (Halloween)","水伊布":"Vaporeon","雷伊布":"Jolteon","火伊布":"Flareon","太陽伊布":"Espeon","月亮伊布":"Umbreon","葉伊布":"Leafeon","冰伊布":"Glaceon","仙子伊布":"Sylveon","迷你龍":"Dratini","哈克龍":"Dragonair","快龍":"Dragonite","超夢":"Mewtwo","夢幻":"Mew","菊草葉":"Chikorita","月桂葉":"Bayleef","大竺葵":"Meganium","火球鼠":"Cyndaquil","火岩鼠":"Quilava","火爆獸":"Typhlosion","小鋸鱷":"Totodile","藍鱷":"Croconaw","大力鱷":"Feraligatr","波克比":"Togepi","波克基古":"Togetic","波克基斯":"Togekiss","天然雀":"Natu","天然鳥":"Xatu","咩利羊":"Mareep","茸茸羊":"Flaaffy","電龍":"Ampharos","盆才怪":"Bonsly","樹才怪":"Sudowoodo","烏波":"Wooper","烏波（阿羅拉的樣子）":"Wooper (Paldea Form)","沼王":"Quagsire","土王":"Clodsire","黑暗鴉":"Murkrow","烏鴉頭頭":"Honchkrow","小果然":"Wynaut","果然翁":"Wobbuffet","壺壺":"Shuckle","赫拉克羅斯":"Heracross","狃拉":"Sneasel","瑪狃拉":"Weavile","信使鳥":"Delibird","戴魯比":"Houndour","黑魯加":"Houndoom","雷公":"Raikou","炎帝":"Entei","水君":"Suicune","幼基拉斯":"Larvitar","沙基拉斯":"Pupitar","班基拉斯":"Tyranitar","木守宮":"Treecko","森林蜥蜴":"Grovyle","蜥蜴王":"Sceptile","火稚雞":"Torchic","力壯雞":"Combusken","火焰雞":"Blaziken","水躍魚":"Mudkip","沼躍魚":"Marshtomp","巨沼怪":"Swampert","拉魯拉絲":"Ralts","奇鲁莉安":"Kirlia","沙奈朵":"Gardevoir","艾路雷朵":"Gallade","懶人獺":"Slakoth","過動猿":"Vigoroth","請假王":"Slaking","勾魂眼":"Sableye","大嘴娃":"Mawile","可可多拉":"Aron","可多拉":"Lairon","波士可多拉":"Aggron","正電拍拍":"Plusle","負電拍拍":"Minun","溶食獸":"Gulpin","吞食獸":"Swalot","大顎蟻":"Trapinch","超音波幼蟲":"Vibrava","沙漠蜻蜓":"Flygon","青綿鳥":"Swablu","七夕青鳥":"Altaria","怨影娃娃":"Shuppet","詛咒娃娃":"Banette","阿勃梭魯":"Absol","海豹球":"Spheal","海豹球（佳節）":"Spheal (Holiday)","海魔獅":"Sealeo","帝牙海獅":"Walrein","寶貝龍":"Bagon","甲殼龍":"Shelgon","暴飛龍":"Salamence","拉帝亞斯":"Latias","拉帝歐斯":"Latios","草苗龜":"Turtwig","樹林龜":"Grotle","土台龜":"Torterra","小火焰猴":"Chimchar","猛火猴":"Monferno","烈焰猴":"Infernape","波加曼":"Piplup","波皇子":"Prinplup","帝王拿波":"Empoleon","小貓怪":"Shinx","勒克貓":"Luxio","倫琴貓":"Luxray","飄飄球":"Drifloon","隨風球":"Drifblim","花岩怪":"Spiritomb","利歐路":"Riolu","路卡利歐":"Lucario","不良蛙":"Croagunk","毒骷蛙":"Toxicroak","雪笠怪":"Snover","暴雪王":"Abomasnow","克雷色利亞":"Cresselia","達克萊伊":"Darkrai","食夢夢":"Munna","夢夢蝕":"Musharna","石居蟹":"Dwebble","岩殿居蟹":"Crustle","毛頭小鷹":"Rufflet","勇士雄鷹":"Braviary","寶寶暴龍":"Tyrunt","怪顎龍":"Tyrantrum","摔角鷹人":"Hawlucha","咚咚鼠":"Dedenne","南瓜精 (小顆種)":"Pumpkaboo (Small Variety)","南瓜精 (中顆種)":"Pumpkaboo (Medium Variety)","南瓜精 (大顆種)":"Pumpkaboo (Large Variety)","南瓜精 (巨顆種)":"Pumpkaboo (Jumbo Variety)","南瓜怪人 (小顆種)":"Gourgeist (Small Variety)","南瓜怪人 (中顆種)":"Gourgeist (Medium Variety)","南瓜怪人 (大顆種)":"Gourgeist (Large Variety)","南瓜怪人 (巨顆種)":"Gourgeist (Jumbo Variety)","嗡蝠":"Noibat","音波龍":"Noivern","強顎雞母蟲":"Grubbin","蟲電寶":"Charjabug","鍬農炮蟲":"Vikavolt","萌虻":"Cutiefly","蝶結萌虻":"Ribombee","童偶熊":"Stufful","穿著熊":"Bewear","花療環環":"Comfey","托戈德瑪爾":"Togedemaru","謎擬Q":"Mimikyu","老翁龍":"Drampa","古月鳥":"Cramorant","毒電嬰":"Toxel","顫弦蠑螈（高調的樣子）":"Toxtricity (Amped Form)","顫弦蠑螈（低調的樣子）":"Toxtricity (Low Key Form)","新葉喵":"Sprigatito","蒂蕾喵":"Floragato","魔幻假面喵":"Meowscarada","呆火鱷":"Fuecoco","炙燙鱷":"Crocalor","骨紋巨聲鱷":"Skeledirge","潤水鴨":"Quaxly","湧躍鴨":"Quaxwell","狂歡浪舞鴨":"Quaquaval","布撥":"Pawmi","布土撥":"Pawmo","巴布土撥":"Pawmot","小鍛匠":"Tinkatink","巧鍛匠":"Tinkatuff","巨鍛匠":"Tinkaton","走鯨":"Cetoddle","浩大鯨":"Cetitan"};

  function getPokemonName(name) {
    if (!name) return '';
    if (typeof name === 'object') {
      return currentLang === 'en-US' ? (name.name_en || name.name_cn || name.name) : (name.name_cn || name.name_en || name.name);
    }
    const str = String(name).trim();
    if (currentLang !== 'en-US') return str;

    // Level 1 & 2 & 3 字典比對
    const direct = lookupBilingualDict(POKEMON_NAMES, str, 'en-US');
    if (direct) return direct;

    // Level 4: 支援括號後綴（如 毒骷蛙 (ABB)、皮卡丘（萬聖節）等）
    const parenMatch = str.match(/^(.+?)\s*([(\[（【].+[)\]）】])$/);
    if (parenMatch) {
      const baseName = getPokemonName(parenMatch[1]);
      const suffix = translateDynamicText(parenMatch[2]);
      return `${baseName} ${suffix}`;
    }

    // Level 5: 搜尋全域陣列備援
    if (typeof window !== 'undefined' && Array.isArray(window.allPokemons)) {
      const found = window.allPokemons.find(p => p.name_cn === str || p.name === str || normalizeSearchKey(p.name_cn) === normalizeSearchKey(str));
      if (found && found.name_en) return found.name_en;
    }

    return str;
  }

  function getSubSkillName(subskill) {
    if (!subskill) return '';
    const res = lookupBilingualDict(SUBSKILL_NAMES, subskill);
    return res || String(subskill).trim();
  }

  function translateDynamicText(text) {
    if (!text || typeof text !== 'string') return text;
    if (currentLang !== 'en-US') return text;

    let res = text;

    // 1. 基礎標點符號與排程標頭
    res = res
      .replace(/：/g, ': ')
      .replace(/、/g, ', ')
      .replace(/～/g, ' ~ ')
      .replace(/〜/g, ' ~ ')
      .replace(/！\s*[:：]?/g, ': ')
      .replace(/\s+/g, ' ');

    // 2. 整段公告與活動機制 (最高優先級，避免子詞先被替換)
    res = res
      .replace(/準備新活動[,，\s]*新企畫；[「"]?([^；]+?)[」"]?；追加新的EX營地；EX模式將於\s*([\d/:\s]+)\s*新增[「"]?([^」]+)[」"]?\s*。?/g, 'Preparing new event: "$1", EX Mode will add "$3" starting $2.')
      .replace(/(?:的)?長期開發計畫.+?能獲得包含.+?各種道具\s*。?\s*；?/g, 'Long-term development plan allowing players to obtain various items including Main Skill Seeds.；')
      .replace(/本企畫為期一週[，,]\s*在這特別的期間[，,]\s*給卡比獸吃的料理必定會是[「"]?([^」"]+)[」"]?[,，]\s*且(?:料理的最終能量[為會變成]*|Final Cooking Energy:\s*)(\d+(\.\d+)?)倍?\s*[！:]?/g, 'During this 1-week event, Snorlax requested dishes are guaranteed to be $1, and final Cooking Energy will be boosted to $2x!')
      .replace(/給卡比獸吃的料理必定會是[「"]?([^」"]+)[」"]?[,，]\s*且料理的最終能量[為會變成]*\s*(\d+(\.\d+)?)倍\s*[！:]?/g, 'Snorlax requested dishes are guaranteed to be $1, with Cooking Energy boosted to $2x!')
      .replace(/(?:在活動期間|在Event Period:)\s*[,，]?\s*不只是\s*(.+?)\s*會有特別亮眼的表現[,，]\s*幻之寶可夢\s*(.+?)\s*似乎也對\s*(.+?)\s*很感興趣[！:]?/g, 'During the event period, $1 will shine, and Mythical Pokémon $2 seems interested in $3!')
      .replace(/藉由精神擊破（樹果領域）展開「樹果領域」的期間，透過芒芒果（超能力屬性）獲得的能量會提升。/g, 'While Berry Field is active via Psystrike (Berry Field), energy gained from Mago Berries (Psychic Type) will increase.')
      .replace(/※「樹果領域」一旦展開，就會在移動營地前持續發揮效果。即使將超夢從幫手隊伍移除，「樹果領域」的效果也不會消失。/g, '※Once active, Berry Field remains effective until moving to a new camp, even if Mewtwo is removed from the team.')
      .replace(/※每次主技能發動時，「樹果領域」的效果都會疊加，直到達到上限為止。/g, '※Each time the Main Skill triggers, Berry Field effect stacks until reaching the maximum cap.')
      .replace(/變更部分幫手寶可夢的主技能\s*。?；\s*([^；]+)；（變更前）([^；]+)；（變更後）\s*([^；]+)/g, 'Adjusted Main Skill for $1: (Before) $2 -> (After) $3')
      .replace(/變更部分(?:幫手寶可夢|Helper Pokémon)的主技能\s*。?/g, 'Adjusted Main Skills for select Helper Pokémon.')
      .replace(/（變更前）/g, '(Before) ')
      .replace(/（變更後）/g, '(After) ')
      .replace(/【歡慶[:！]?\s*3週年紀念資訊[①➀]】關於特別合作企畫/g, '【3rd Anniversary Celebration Info ①】Special Collaboration Event')
      .replace(/《Pokémon Sleep》將在\s*2026年8月\s*舉辦特別合作企畫\s*。?/g, 'Pokémon Sleep will hold a Special Collaboration Event in August 2026.')
      .replace(/「?新月日限定包\s*vol\.?(\d+)」?/gi, '"New Moon Day Limited Bundle Vol.$1" ')
      .replace(/「?新月日限定包」?正適合本次活動.+?歡迎選購\s*。?\s*[:：]?/g, '"New Moon Day Limited Bundle" is filled with items to befriend Pokémon: ')
      .replace(/在新月日期間.+?變得友好吧！?/g, 'During New Moon Day, give biscuits to hungry Pokémon to become friends!')
      .replace(/本商品裡裝有\s*專門迎接\s*(.+?)\s*成為夥伴並且培育牠的道具\s*，?\s*歡迎選購\s*。?/g, 'Contains items tailored for befriending and raising $1.')
      .replace(/商品裡裝有\s*「?\s*(.+?)\s*」?\s*等\s*能夠培育\s*(.+?)\s*的道具\s*。?/g, 'Contains $1 and other items to raise $2.')
      .replace(/(?:本?商品裡裝有|內含)\s*(.+?)\s*等?\s*(?:能夠|專門)?(?:迎接|培育|強化)?.*?(?:成為夥伴並且培育牠的道具|的道具)?\s*[,，。]?\s*歡迎選購。?/g, 'Contains $1 and other helpful items to raise your Pokémon.')
      .replace(/在\s*⭐?\s*(.+?)\s*會出現的營地使用薰香\s*，?\s*與牠相遇吧！?/g, 'Use incenses at areas where $1 appears to encounter them!')
      .replace(/發放期間登入遊戲的玩家\s*。?/g, 'Applicable to all players who log in during the event period.')
      .replace(/(?:此外[,，]\s*在EX模式下[,，]\s*)?遇見寶可夢睡姿所需的(?:睡意之力|Drowsy Power)會大幅增加.+?(?:糖果|Candy)[」"]?\s*。?/g, 'In EX mode, required Drowsy Power increases significantly, but grants more Research EXP, Dream Shards, and Pokémon Candies.')
      .replace(/消耗[「"]?(?:夢之碎片|Dream Shards)[」"]?並放入\s*(\d+)個\s*持有的寶可夢的?(?:Candy|糖果)[,，]\s*就能隨機獲得\s*(\d+)種?[「"]?(?:屬性糖果|屬性Candy)M×1[」"]?\s*。?/g, 'Consume Dream Shards and $1 Pokémon Candies to randomly obtain $2x Type Candy M.')
      .replace(/※此道具與[「"]?(?:寶可夢的糖果|寶可夢 Candy)[」"]?相同.+?也可使用\s*。?/g, '※Similar to Pokémon Candy, this item can also be used on different forms and special costume Pokémon.')
      .replace(/各寶可夢專用的全新[「"]?(?:主技能種子|Main Skill Seed)[」"]?將自\s*([\d/:\s]+)\s*起登場\s*。?/g, 'New Pokémon-specific Main Skill Seeds will debut starting $1.')
      .replace(/各寶可夢專用的新[「"]?(?:主技能種子|Main Skill Seed)[」"]?/g, 'New Pokémon-specific Main Skill Seeds')
      .replace(/此外[，,]\s*自下週起全新的[「"]?(?:主技能種子|Main Skill Seed)[」"]?將會登場\s*。?/g, 'Brand new Main Skill Seeds will debut next week.');

    // 3. 排程與時間標籤
    res = res
      .replace(/舉辦期間\s*[:：]?\s*/gi, 'Event Period: ')
      .replace(/銷售期間\s*[:：]?\s*/gi, 'Sale Period: ')
      .replace(/活動期間\s*[:：]?\s*/gi, 'Event Period: ')
      .replace(/任務期間\s*[:：]?\s*/gi, 'Mission Period: ')
      .replace(/發放期間\s*[:：]?\s*/gi, 'Distribution Period: ')
      .replace(/維護期間\s*[:：]?\s*/gi, 'Maintenance Period: ')
      .replace(/實施時間\s*[:：]?\s*/gi, 'Implementation Time: ')
      .replace(/測量時間\s*[:：]?\s*/gi, 'Tracking Time: ')
      .replace(/開始出現的時間\s*[:：]?\s*/gi, 'Debut Time: ')
      .replace(/【適用營地】[・\s]*使用(?:薰香|Incense)[,，]\s*與牠相遇吧！?/gi, '【Applicable Areas】 Use incenses at applicable areas to encounter them!')
      .replace(/【適用營地】[・\s]*所有營地/gi, '【Applicable Areas】 All Areas')
      .replace(/【適用營地】[・\s]*/gi, '【Applicable Areas】 ')
      .replace(/【注意事項】[・\s]*/gi, '【Important Notes】 ')
      .replace(/\(週一\)/g, '(Mon)')
      .replace(/\(週二\)/g, '(Tue)')
      .replace(/\(週三\)/g, '(Wed)')
      .replace(/\(週四\)/g, '(Thu)')
      .replace(/\(週五\)/g, '(Fri)')
      .replace(/\(週六\)/g, '(Sat)')
      .replace(/\(週日\)/g, '(Sun)');

    // 4. 機率提升標籤與睡眠類型
    res = res
      .replace(/【機率大幅提升】/g, '【Major Rate-Up】 ')
      .replace(/【機率中幅提升】/g, '【Medium Rate-Up】 ')
      .replace(/【機率小幅提升】/g, '【Minor Rate-Up】 ')
      .replace(/登場寶可夢\s*[:：]?\s*/g, 'Debut Pokémon: ')
      .replace(/能新遇見的寶可夢\s*[:：]?\s*/g, 'New Debut Pokémon: ')
      .replace(/睡眠類型\s*[:：]?\s*/g, 'Sleep Type: ')
      .replace(/安然入睡/g, 'Dozing')
      .replace(/淺[淺灰]入睡/g, 'Snoozing')
      .replace(/深[深灰]入睡/g, 'Slumbering')
      .replace(/半夢半醒/g, 'Balanced');

    // 5. 好眠日、料理倍率、貪吃與活動機制
    res = res
      .replace(/睡意之力\s*[:：]?\s*(\d+(\.\d+)?)倍/gi, 'Drowsy Power: $1x')
      .replace(/睡意之力的倍率/g, 'Drowsy Power Multiplier')
      .replace(/睡意之力/g, 'Drowsy Power')
      .replace(/在好眠日的[「"]?[^」"]+[」"]?生效的[「"]?(?:Drowsy Power Multiplier|Drowsy Power的倍率|睡意之力的倍率)[」"]?[,，]?\s*將會根據\s*[^是]+是週幾而有所變化\s*。?/g, 'The Drowsy Power multiplier on Full Moon Day varies depending on the day of the week.')
      .replace(/■[「"]?[^」"]+[」"]?的[「"]?(?:Drowsy Power|睡意之力)[」"]?倍率/g, '■ Full Moon Day Drowsy Power Multiplier')
      .replace(/※不論.+?皆為\s*1\.5倍\s*。?/g, '※Regardless of the day of the week, the Drowsy Power multiplier on other event days is 1.5x.')
      .replace(/滿月之日/g, 'Full Moon Day')
      .replace(/滿月/g, 'Full Moon')
      .replace(/新月日/g, 'New Moon Day')
      .replace(/夏日嘉年華/g, 'Summer Festival')
      .replace(/（\s*漂亮成功時為\s*(\d+(\.\d+)?)倍[,，]\s*在週日漂亮成功時為\s*(\d+(\.\d+)?)倍\s*）/g, '($1x on Extra Tasty, $3x on Sunday Extra Tasty)')
      .replace(/漂亮成功時為\s*(\d+(\.\d+)?)倍/gi, '$1x on Extra Tasty')
      .replace(/在週日漂亮成功時為\s*(\d+(\.\d+)?)倍/gi, '$1x on Sunday Extra Tasty')
      .replace(/料理的最終能量[為會變成]*\s*(\d+(\.\d+)?)倍/gi, 'Final Cooking Energy: $1x')
      .replace(/(?:不僅如此[,，]?\s*)?在當天第1次的點心時間[,，]?\s*必定有\s*(\d+)\s*隻寶可夢會處於貪吃狀態\s*。?/g, 'At least $1 Pokémon is guaranteed to be Hungry during the first snack time each day.')
      .replace(/必定有\s*(\d+)\s*隻寶可夢會處於貪吃狀態/g, '$1 Pokémon is guaranteed to be Hungry')
      .replace(/處於貪吃狀態/g, 'Hungry')
      .replace(/幫手寶可夢的(?:睡眠EXP|Sleep EXP)\s*[:：]?\s*(\d+(\.\d+)?)倍/gi, 'Helper Pokémon Sleep EXP: $1x')
      .replace(/幫手寶可夢/g, 'Helper Pokémon')
      .replace(/睡眠EXP/g, 'Sleep EXP')
      .replace(/研究EXP/g, 'Research EXP');

    // 6. 商城禮包與道具名稱
    res = res
      .replace(/「好眠日限定包\s*vol\.?(\d+)」/gi, '"Good Sleep Day Bundle Vol.$1" ')
      .replace(/「新月日限定包\s*vol\.?(\d+)」/gi, '"New Moon Day Limited Bundle Vol.$1" ')
      .replace(/「寶可夢培育包\s*[（\(](.+?)[）\)]\s*vol\.?(\d+)」/gi, '"Pokémon Growth Bundle ($1) Vol.$2" ')
      .replace(/「合作紀念包\s*([SML])」/gi, '"Collaboration Commemorative Bundle $1" ')
      .replace(/「合作紀念包」/gi, '"Collaboration Commemorative Bundle\" ')
      .replace(/「夏日嘉年華2026同樂包\s*([SML])」/gi, '"Summer Festival 2026 Celebration Bundle $1" ')
      .replace(/「夏日嘉年華2026同樂包」/gi, '"Summer Festival 2026 Celebration Bundle" ')
      .replace(/「(.+?)限定包\s*([SML])」/gi, '"$1 Limited Bundle $2" ')
      .replace(/「(.+?)限定包」/g, '"$1 Limited Bundle" ')
      .replace(/「(.+?)同樂包\s*([SML])」/gi, '"$1 Celebration Bundle $2" ')
      .replace(/「(.+?)同樂包」/g, '"$1 Celebration Bundle" ')
      .replace(/「(.+?)紀念包\s*([SML])」/gi, '"$1 Commemorative Bundle $2" ')
      .replace(/「(.+?)紀念包」/g, '"$1 Commemorative Bundle" ')
      .replace(/（(\d+[\d,]*)\s*(?:鑽石|Diamonds)）/gi, ' ($1 Diamonds)')
      .replace(/\((\d+[\d,]*)\s*(?:鑽石|Diamonds)\)/gi, ' ($1 Diamonds)')
      .replace(/（限購\s*(\d+)\s*次）/g, '(Limit: $1)')
      .replace(/介紹\s*[:：]\s*《Pokémon Sleep》將配合「好眠日」推出/g, 'Details: Special bundle available in Pokémon Sleep for Good Sleep Day')
      .replace(/介紹\s*[:：]/g, 'Details: ')
      .replace(/主技能種子\s*[（\(](.+?)[）\)]/g, 'Main Skill Seed ($1)');

    // 7. 官方公告、更新與異常通知
    res = res
      .replace(/關於\s*Ver\.?\s*([\d\.]+)\s*的更新內容/gi, 'Ver.$1 Update Details')
      .replace(/詳情請參閱官方公告內容與說明/g, 'Please check the official announcement for full details.')
      .replace(/異常問題修復通知/g, 'Bug Fix Notice')
      .replace(/異常問題通知/g, 'Issue Notice')
      .replace(/錯誤代碼\s*[「"]?(\d+)[」"]?/g, 'Error Code "$1"')
      .replace(/✨\s*新增功能/g, 'New Features')
      .replace(/⚖️\s*平衡調整與技能變更/g, 'Balance Adjustments & Skill Changes')
      .replace(/🐛\s*異常問題修復/g, 'Bug Fixes')
      .replace(/波導彈/g, 'Aura Sphere')
      .replace(/夢之碎片獲取/g, 'Dream Shard Magnet ');

    // 8. 替換道具名稱 (糖果, 薰香, 夢之塊, 沙布蕾)
    for (const [cn, item] of Object.entries(ITEM_NAMES)) {
      if (item['en-US']) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }

    // 9. 替換食材與島嶼名稱
    for (const [cn, item] of Object.entries(INGREDIENT_NAMES)) {
      if (item['en-US']) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }
    for (const [cn, item] of Object.entries(ISLAND_NAMES)) {
      if (item['en-US']) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }

    // 10. 替換 247 隻寶可夢名稱 (由長至短依序取代，避免前綴衝突)
    const sortedPkmNames = Object.keys(POKEMON_NAMES).sort((a, b) => b.length - a.length);
    for (const cn of sortedPkmNames) {
      const en = POKEMON_NAMES[cn];
      if (en) {
        res = res.replaceAll(cn, en);
      }
    }

    // 11. 消除 "Pokémon的Item" -> "Pokémon Item" 與屬性括號
    res = res
      .replace(/的\s*(Candy|Incense|Biscuit|Seed|Block|Shard|Cluster)/gi, ' $1')
      .replace(/（(.+?)屬性）/g, ' ($1 Type)')
      .replace(/\((.+?)屬性\)/g, ' ($1 Type)');

    for (const [cn, item] of Object.entries(TYPE_NAMES)) {
      if (item['en-US']) {
        res = res.replaceAll(cn + ' Type', item['en-US'] + ' Type');
        res = res.replaceAll(cn + '屬性', item['en-US'] + ' Type');
        res = res.replaceAll(cn + '屬性的幫手寶可夢', item['en-US'] + '-type Helper Pokémon');
        res = res.replaceAll(cn + '屬性的寶可夢', item['en-US'] + '-type Pokémon');
      }
    }
    res = res.replace(/([A-Za-z]+)\s*Type\s*的\s*(?:幫手寶可夢|Helper Pokémon)/gi, '$1-type Helper Pokémon');
    res = res.replace(/([A-Za-z]+)\s*Type\s*的\s*Pokémon/gi, '$1-type Pokémon');

    // 12. 天梯點評與剩餘常用片語
    res = res
      .replace(/👑\s*TOP 1 AAA\s*(.+?)\s*產量之王/g, '👑 TOP 1 AAA $1 Production King')
      .replace(/👑\s*TOP 1\s*(.+?)\s*產量之王/g, '👑 TOP 1 $1 Production King')
      .replace(/AAA\s*(.+?)\s*專精產出/g, 'AAA $1 Specialized Output')
      .replace(/ABB\s*(.+?)\s*主力產出/g, 'ABB $1 Main Output')
      .replace(/AAA\s*(.+?)\s*兼顧/g, 'AAA $1 Flex Output')
      .replace(/AAC\s*雙(.+?)\s*二階解鎖/g, 'AAC Dual $1 Lv.30 Unlock')
      .replace(/AAC\s*(.+?)\s*解鎖/g, 'AAC $1 Lv.30 Unlock')
      .replace(/ABB\s*單(.+?)\s*混產/g, 'ABB Single $1 Mixed Output')
      .replace(/產量之王/g, 'Production King')
      .replace(/專精產出/g, 'Specialized Output')
      .replace(/主力產出/g, 'Main Output')
      .replace(/兼顧/g, 'Flex Output')
      .replace(/二階解鎖/g, 'Lv.30 Unlock')
      .replace(/解鎖/g, 'Unlock')
      .replace(/混產/g, 'Mixed Output')
      .replace(/顆\/天/g, '/day')
      .replace(/顆/g, 'items')
      .replace(/餐\/天/g, 'meals/day')
      .replace(/鑽石/g, 'Diamonds')
      .replace(/咖哩[,，\s]*濃湯/g, 'Curries/Stews')
      .replace(/沙拉/g, 'Salads')
      .replace(/甜點[,，\s]*飲料/g, 'Desserts/Drinks')
      .replace(/以及/g, 'and')
      .replace(/等\s*能夠培育/g, 'and other items to raise')
      .replace(/的道具\s*。?/g, 'items.')
      .replace(/「\s*/g, '"')
      .replace(/\s*」/g, '"');

    return res.trim();
  }

  function updatePageTranslations() {
    if (typeof document === 'undefined') return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key, el.textContent);
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        el.innerHTML = t(key, el.innerHTML);
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

    if (typeof Event !== 'undefined') {
      document.querySelectorAll('select').forEach(sel => {
        try { sel.dispatchEvent(new Event('sync-ui')); } catch (e) {}
      });
    }
  }

  initLanguage();

  function shortenSkillName(name) {
    if (!name) return '';
    return name
      .replace(/\bIngredient\b/g, 'Ingr.')
      .replace(/\bIngredients\b/g, 'Ingr.')
      .replace(/\bStrength\b/g, 'Str.')
      .replace(/\bEveryone\b/g, 'All')
      .replace(/\bElectric\b/g, 'Elec.')
      .replace(/\[Customizable\]/g, '[Custom]');
  }

  function getShortMainSkillName(skill) {
    const full = getMainSkillName(skill);
    return currentLang === 'en-US' ? shortenSkillName(full) : full;
  }

  function getItemName(item) {
    if (!item) return '';
    const it = ITEM_NAMES[item];
    return it ? (it[currentLang] || item) : item;
  }

  function getIslandName(island) {
    if (!island) return '';
    const isl = ISLAND_NAMES[island];
    return isl ? (isl[currentLang] || island) : island;
  }

  const I18NExport = {
    t,
    getLanguage,
    setLanguage,
    getTypeName,
    getTypeIconSvg,
    TYPE_SVG_PATHS,
    TYPE_CANONICAL_MAP,
    getSpecialtyName,
    getIngredientName,
    getIngredientIcon,
    getBerryName,
    getNatureName,
    getPokemonName,
    getMainSkillName,
    getShortMainSkillName,
    shortenSkillName,
    getSubSkillName,
    translateDynamicText,
    getItemName,
    getIslandName,
    updatePageTranslations,
    DICTIONARY,
    POKEMON_NAMES,
    TYPE_NAMES,
    SPECIALTY_NAMES,
    INGREDIENT_NAMES,
    INGREDIENT_ICONS,
    BERRY_NAMES,
    NATURE_NAMES,
    MAIN_SKILL_NAMES,
    SUBSKILL_NAMES,
    ITEM_NAMES,
    ISLAND_NAMES
  };

  if (typeof window !== 'undefined') {
    window.I18N = I18NExport;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18NExport;
  }
})();
