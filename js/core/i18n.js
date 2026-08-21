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
      'settings.theme_midnight_sub': '科技深藍黑 · 霓虹青紫點綴',
      'settings.theme_onyx': '🌑 曜石暗影 (Onyx Black)',
      'settings.theme_onyx_sub': 'OLED 純粹黑 · 琥珀流金點綴',
      'settings.theme_dawn': '☀️ 晨曦暖陽 (Dawn Amber)',
      'settings.theme_dawn_sub': '溫潤奶油白 · 蔚藍暖陽點綴',
      'settings.theme_emerald': '🍃 萌綠森林 (Emerald Forest)',
      'settings.theme_emerald_sub': '清新薄荷白 · 翠綠草木點綴',
      'settings.theme_active': '✓ 使用中',
      'settings.lang_section': '🌐 介面語言 (Language)',
      'settings.lang_desc': '切換全站介面文字與寶可夢資料顯示語系。',
      'settings.lang_zh': '繁體中文 (Traditional Chinese)',
      'settings.lang_en': 'English (US)',
      'settings.sync_section': '🔄 GitHub Actions 資料同步',
      'settings.sync_desc': '設定具有 workflow 權限的 GitHub PAT Token 觸發線上自動抓取。',
      'settings.pat_label': 'GitHub PAT Token（儲存於本地 LocalStorage，不會上傳）',
      'settings.pat_link': '💡 點此建立 GitHub PAT（勾選 workflow 權限）',
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
      'wiki.subtab_ingredients': '🥗 Lv.60 食材天梯榜',
      'wiki.subtab_values': '🫐 樹果與食材能量',
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
      'box.modal_poke_level': '等級 (Lv.1 ~ 80)',
      'box.modal_poke_nickname': '自訂暱稱 (選填)',
      'box.modal_nickname_placeholder': '例如：首隻樹果S神坦、全蘋果隊長...',
      'box.modal_poke_ing': '🍲 解鎖食材組合 (Lv.1 / Lv.30 / Lv.60)',
      'box.modal_poke_nature': '🧠 性格 (Nature)',
      'box.modal_poke_subskills': '⚡ 副技能配置 (Lv.10 ~ 80)',
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
      'settings.theme_midnight_sub': 'Deep Navy & Cyan · Neon Accents',
      'settings.theme_onyx': '🌑 Onyx Black (OLED Dark)',
      'settings.theme_onyx_sub': 'Pure OLED Black · Amber Gold Accents',
      'settings.theme_dawn': '☀️ Dawn Amber (Warm Light)',
      'settings.theme_dawn_sub': 'Warm Cream White · Cyan Sun Accents',
      'settings.theme_emerald': '🍃 Emerald Forest (Fresh Light)',
      'settings.theme_emerald_sub': 'Fresh Mint White · Forest Green Accents',
      'settings.theme_active': '✓ Active',
      'settings.lang_section': '🌐 Language',
      'settings.lang_desc': 'Switch interface display language.',
      'settings.lang_zh': '繁體中文 (Traditional Chinese)',
      'settings.lang_en': 'English (US)',
      'settings.sync_section': '🔄 GitHub Actions Sync',
      'settings.sync_desc': 'Configure a GitHub PAT with workflow scope to trigger automatic live updates.',
      'settings.pat_label': 'GitHub PAT Token (Stored locally in LocalStorage, never uploaded)',
      'settings.pat_link': '💡 Click to create GitHub PAT (select workflow scope)',
      'settings.save': '💾 Save Settings',
      'settings.close': 'Close',

      // Search & Filters (Pokedex)
      'pokedex.search_placeholder': 'Search Pokémon by name, No. (e.g. 0001), type, ingredient...',
      'pokedex.filter_bookmark': 'Filters',
      'pokedex.filter_sidebar_title': 'Filters',
      'pokedex.reset_all': 'Reset',
      'pokedex.only_final': '👑 Only Final Evo',
      'pokedex.only_initial_ing': '🥗 Ing.1 only',
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
      'wiki.subtab_ingredients': '🥗 Lv.60 Ingredient Ladder',
      'wiki.subtab_values': '🫐 Berry & Ing. Values',
      'wiki.tab_skills': '⚡ Main Skills DB',
      'wiki.tab_subskills': '🧩 Sub-Skills & Natures',
      'wiki.tab_ratings': '🎓 Growth & Tier Guide',
      'wiki.tab_ladder': '🥗 Lv.60 Ingredient Ladder',
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
      'box.modal_poke_name': 'Pokémon Species',
      'box.modal_poke_level': 'Level (Lv.1 ~ 80)',
      'box.modal_poke_nickname': 'Custom Nickname (Optional)',
      'box.modal_nickname_placeholder': 'e.g., BFS God Tank, Triple Apple...',
      'box.modal_poke_ing': '🍲 Ingredients (Lv.1 / Lv.30 / Lv.60)',
      'box.modal_poke_nature': '🧠 Nature',
      'box.modal_poke_subskills': '⚡ Sub-Skills Config (Lv.10 ~ 80)',
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
    '能量填充S (固定值)': { 'zh-TW': '能量填充S (固定值)', 'en-US': 'Charge Strength S (Fixed)' },
    '能量填充S (隨機/變動值)': { 'zh-TW': '能量填充S (隨機/變動值)', 'en-US': 'Charge Strength S (Random)' },
    '能量填充S (隨機)': { 'zh-TW': '能量填充S (隨機)', 'en-US': 'Charge Strength S (Random)' },
    '能量填充S（隨機）': { 'zh-TW': '能量填充S（隨機）', 'en-US': 'Charge Strength S (Random)' },
    '能量填充M': { 'zh-TW': '能量填充M', 'en-US': 'Charge Strength M' },
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
    '夢之碎片獲取S (固定值)': { 'zh-TW': '夢之碎片獲取S (固定值)', 'en-US': 'Dream Shard Magnet S (Fixed)' },
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
    '變身 (技能複製)': { 'zh-TW': '變身 (技能複製)', 'en-US': 'Transform (Skill Copy)' },
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
    '怪力钳（食材精選S）': { 'zh-TW': '怪力钳（食材精選S）', 'en-US': 'Hyper Cutter (Ingredient Magnet S)' },
    '怪力钳 (食材精選S)': { 'zh-TW': '怪力钳 (食材精選S)', 'en-US': 'Hyper Cutter (Ingredient Magnet S)' },
    '超幸運（食材精選S）': { 'zh-TW': '超幸運（食材精選S）', 'en-US': 'Super Luck (Ingredient Magnet S)' },
    '超幸運 (食材精選S)': { 'zh-TW': '超幸運 (食材精選S)', 'en-US': 'Super Luck (Ingredient Magnet S)' },
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

  function getSpecialtyName(spec) {
    if (!spec) return '';
    return lookupBilingualDict(SPECIALTY_NAMES, spec) || spec;
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

    // 1. 標點與空格規範
    res = res
      .replace(/：/g, ': ')
      .replace(/、/g, ', ')
      .replace(/～/g, ' ~ ')
      .replace(/〜/g, ' ~ ')
      .replace(/\s+/g, ' ');

    // 2. 營地與活動排程語句
    res = res
      .replace(/舉辦期間\s*[:：]?\s*/gi, 'Event Period: ')
      .replace(/銷售期間\s*[:：]?\s*/gi, 'Sale Period: ')
      .replace(/活動期間\s*[:：]?\s*/gi, 'Event Period: ')
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

    // 3. 好眠日與睡意之力活動規則
    res = res
      .replace(/睡意之力\s*[:：]?\s*(\d+(\.\d+)?)倍/gi, 'Drowsy Power: $1x')
      .replace(/睡意之力的倍率/g, 'Drowsy Power Multiplier')
      .replace(/睡意之力/g, 'Drowsy Power')
      .replace(/在好眠日的[「"]?[^」"]+[」"]?生效的[「"]?(?:Drowsy Power Multiplier|Drowsy Power的倍率|睡意之力的倍率)[」"]?[,，]\s*將會根據\s*[^是]+是週幾而有所變化\s*。?/g, 'The Drowsy Power multiplier on Full Moon Day varies depending on the day of the week.')
      .replace(/■[「"]?[^」"]+[」"]?的[「"]?(?:Drowsy Power|睡意之力)[」"]?倍率/g, '■ Full Moon Day Drowsy Power Multiplier')
      .replace(/※不論.+?皆為\s*1\.5倍\s*。?/g, '※Regardless of the day of the week, the Drowsy Power multiplier on other event days is 1.5x.')
      .replace(/滿月之日/g, 'Full Moon Day')
      .replace(/滿月/g, 'Full Moon');

    // 4. 商城禮包與同樂包
    res = res
      .replace(/「好眠日限定包\s*vol\.?(\d+)」/gi, '"Good Sleep Day Bundle Vol.$1" ')
      .replace(/「(.+?)限定包」/g, '"$1 Limited Bundle" ')
      .replace(/「(.+?)同樂包」/g, '"$1 Celebration Bundle" ')
      .replace(/！\s*:\s*/g, ': ')
      .replace(/（(\d+[\d,]*)\s*(?:鑽石|Diamonds)）/gi, ' ($1 Diamonds)')
      .replace(/\((\d+[\d,]*)\s*(?:鑽石|Diamonds)\)/gi, ' ($1 Diamonds)')
      .replace(/介紹\s*[:：]\s*《Pokémon Sleep》將配合「好眠日」推出/g, 'Details: Special bundle available in Pokémon Sleep for Good Sleep Day')
      .replace(/介紹\s*[:：]/g, 'Details: ')
      .replace(/專門迎接\s*⭐?\s*(.+?)\s*成為夥伴並且培育牠的道具\s*，?\s*歡迎選購。?/g, 'Items tailored for befriending and raising $1.')
      .replace(/在\s*⭐?\s*(.+?)\s*會出現的營地使用薰香\s*，?\s*與牠相遇吧！?/g, 'Use incenses at areas where $1 appears to encounter them!');

    // 5. 替換全域道具名稱
    for (const [cn, item] of Object.entries(ITEM_NAMES)) {
      if (item['en-US']) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }

    // 6. 替換全域食材名稱
    for (const [cn, item] of Object.entries(INGREDIENT_NAMES)) {
      if (item['en-US']) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }

    // 7. 替換全域島嶼與營地名稱
    for (const [cn, item] of Object.entries(ISLAND_NAMES)) {
      if (item['en-US']) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }

    // 8. 替換天梯與點評用語
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
      .replace(/鑽石/g, 'Diamonds');

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

    document.querySelectorAll('select').forEach(sel => {
      sel.dispatchEvent(new Event('sync-ui'));
    });
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
    getSpecialtyName,
    getIngredientName,
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
