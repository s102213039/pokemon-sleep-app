  registerResources({
    // ─── 六維雷達圖元資料 (lab_specialists.js) ───
    'lab.t_dim_berry_lbl': ['樹果產能', 'Berry Output'],
    'lab.t_dim_berry_desc': ['單日樹果總能量潛力 (含樹果S、專長與幫速)', 'Total daily berry energy potential (BFS, specialty & speed)'],
    'lab.t_dim_ing_lbl': ['食材產能', 'Ingredient Output'],
    'lab.t_dim_ing_desc': ['食材獲取期望與解鎖組合協同效應', 'Ingredient drop rate and recipe combo synergies'],
    'lab.t_dim_skill_lbl': ['技能強度', 'Skill Power'],
    'lab.t_dim_skill_desc': ['主技能觸發頻率、等級加成與爆發收益', 'Main skill trigger rate and value scaling'],
    'lab.t_dim_speed_lbl': ['幫忙速度', 'Helping Speed'],
    'lab.t_dim_speed_desc': ['整體幫忙頻率 (基礎間隔、幫速SM、幫獎與性格)', 'Overall helping frequency (base interval, sub-skills & nature)'],
    'lab.t_dim_growth_lbl': ['後期成長', 'Late Growth'],
    'lab.t_dim_growth_desc': ['Lv.50/70/80 後期技能與第三食材爆發潛能', 'Lv.50/70/80 late skill and ingredient scaling potential'],
    'lab.t_dim_roi_lbl': ['資源效益', 'Resource ROI'],
    'lab.t_dim_roi_desc': ['成型週期、前中期戰力解鎖速度與糖果回報率', 'Early/mid power unlock and candy investment efficiency'],

    // ─── 診斷報告彈窗 (lab_modal.js) ───
    'lab.t_nature_mint_neutral': ['沒有性格帶來的特色（使用淨白薄荷消除個性效果）', 'Has no distinctive personality traits (Cleanse Mint used)'],
    'lab.t_nature_neutral': ['沒有性格帶來的特色（無影響）', 'Has no distinctive personality traits'],
    'lab.t_spec_ing': ['食材型', 'Ingredient'],
    'lab.t_spec_berry': ['樹果型', 'Berries'],
    'lab.t_spec_skill': ['技能型', 'Skills'],
    'lab.t_spec_all': ['全能型', 'All-Rounder'],
    'lab.t_main_skill': ['主技能', 'Main Skill'],
    'lab.t_ing_locked': [' (未開放)', ' (Locked)'],
    'lab.t_close': ['關閉', 'Close'],
    'lab.t_track_current': ['當前', 'Current'],
    'lab.t_track_max_lv': ['滿級', 'Max Lv'],
    'lab.t_edit': ['編輯', 'Edit'],
    'lab.t_carry': ['持有', 'Carry'],
    'lab.t_ribbon_spd': ['幫速 -{pct}%', '-{pct}% Spd'],
    'lab.t_nature': ['性格', 'Nature'],
    'lab.t_frequency': ['幫忙間隔', 'Frequency'],
    'lab.t_ing_rate': ['食材率', 'Ing %'],
    'lab.t_skill_rate': ['技能率', 'Skill %'],
    'lab.t_subskill_title_unlocked': ['{name} (Lv.{lv})', '{name} (Lv.{lv})'],
    'lab.t_subskill_title_locked': ['{name} (Lv.{lv}未解鎖)', '{name} (Lv.{lv} - Locked)'],
    'lab.t_subskill_slot': ['Lv.{lv} 欄位', 'Lv.{lv} Slot'],
    'lab.t_synergy_heading_mobile': ['專長與性格副技能協同點評', 'Specialty, Nature & Sub-Skill Synergy Analysis'],
    'lab.t_synergy_heading': ['專長與性格副技能協同點評', 'Specialty & Synergy Analysis'],
    'lab.t_summary_label': ['智能簡評', 'Appraisal Note'],
    'lab.t_modal_badge': ['深度能力診斷報告', 'Diagnostic Report'],
    'lab.t_current_rating_title': ['當前實力評級 (Lv.{lv})', 'Current Level Rating (Lv.{lv})'],
    'lab.t_max_rating_title': ['畢業潛力評級 (Lv.100)', 'Max Potential Rating (Lv.100)'],
    'lab.t_edit_stats_title': ['編輯寶可夢數值', 'Edit Pokémon Stats'],
    'lab.t_edit_stats': ['編輯數值', 'Edit'],
    'lab.t_main_skill_colon': ['主技能：', 'Main Skill:'],
    'lab.t_ingredients_colon': ['食材：', 'Ingredients:'],

    // ─── 智能深度簡評與雷達圖 (lab_summary.js) ───
    'lab.t_recipe_quote': ['『{name}』', '"{name}"'],
    'lab.t_sig_recipes_two': ['直通頂尖料理 {chip1} 與 {chip2} 關鍵供料。', 'Target recipes: prime pipeline for {chip1} & {chip2}.'],
    'lab.t_sig_recipes_one': ['直通頂尖料理 {chip1} 關鍵供料。', 'Target recipe: prime pipeline for {chip1}.'],
    'lab.t_pts_unit': [' 分', ' pts'],
    'lab.t_sum_slowpoke_ok': [
      '戰略解鎖專門手：Lv.30 精準解鎖「美味尾巴」，圓滿達成全遊戲最高能量食材之戰略開圖使命！直通頂尖料理 {chip1} 與 {chip2} 關鍵供料，解鎖後可常駐作為後備庫存手。',
      'Strategic Unlock Specialist: Lv.30 unlocks "Slowpoke Tail", fulfilling the primary strategic mission of unlocking the highest-energy ingredient in Pokémon Sleep! Direct pipeline for {chip1} & {chip2}.'
    ],
    'lab.t_sum_slowpoke_fail': [
      '戰略定位失職：Lv.30 未能開出「美味尾巴」，喪失了呆呆獸家族核心戰略開圖價值，建議作為過渡替補或換糖。',
      'Fatal Strategic Flaw: Lv.30 fails to roll "Slowpoke Tail", missing the essential strategic unlock value of the Slowpoke family.'
    ],
    'lab.t_sum_berry_top': [
      '天花板級樹果砲台！解鎖第一神技「樹果數量S（樹果S）」配合極致幫忙速度加成，單次幫忙穩定產出 3 顆樹果，卡比獸能量滾雪球的最強主力。',
      'Top-Tier Berry Cannon! "Berry Finding S" combined with excellent Speed boosts produces 3 berries per help cycle, serving as the ultimate Snorlax energy engine.'
    ],
    'lab.t_sum_berry_bfs': [
      '畢業級樹果主力：已解鎖第一核心神技「樹果數量S（樹果S）」，單次產果直接 +1，具備極強的島嶼推分實力。',
      'Core Berry Anchor: Unlocked God-tier "Berry Finding S", providing +1 berry per cycle and delivering strong, reliable island pushing power.'
    ],
    'lab.t_sum_berry_future_bfs': [
      '未來潛力股：核心神技「樹果數量S（樹果S）」將於 Lv.{lv} 解鎖，建議作為重點種子培育，解鎖後產能將迎來決定性質變！',
      'High Potential Seed: "Berry Finding S" unlocks at Lv.{lv}. Recommended to prioritize training to unlock this game-changing leap in berry output!'
    ],
    'lab.t_sum_berry_speed': [
      '極限速攻流：雖缺乏「樹果數量S」，但憑藉「幫手獎勵 + 幫忙速度加成」大幅縮短全員幫忙間隔，適合作為優質團隊加速掛件與過渡主力。',
      'High-Speed Auxiliary: Lacks "Berry Finding S", but extreme speed kit (Helping Bonus + Speed buffs) makes it a valuable team accelerator and transitional anchor.'
    ],
    'lab.t_sum_berry_slow': [
      '致命減速：性格減幫忙速度（-7.5%）拖慢節奏，且未持有「樹果數量S」，產能難以支撐島嶼進度。',
      'Severely Handicapped: Speed Down nature directly cripples help cycles. Combined with no BFS, output is too low for competitive island production.'
    ],
    'lab.t_sum_berry_trans': [
      '過渡型樹果手：缺乏核心神技「樹果數量S」，單次僅能產出 2 顆樹果，產能上限受限，適合作為島嶼前期拓荒過渡。',
      'Transitional Berry Specialist: Lacks core "Berry Finding S", capping output at 2 berries per help. Suitable as an early island transitional placeholder.'
    ],
    'lab.t_sum_burst_top': [
      '天花板級樹果爆發砲台！「樹果遽增」主技能與「樹果數量S」完美結合，單次幫忙穩定產出加倍樹果，技能觸發更能引爆全隊巨額樹果能量（謎擬Q大成功翻倍爆發更強）！在喜愛樹果島嶼或樹果週（1.4倍加成）為頂尖衝分主力，勤勞收包可享極限產能。',
      'Top-Tier Berry Burst Cannon! "Berry Burst" combined with "Berry Finding S" yields double help berries and triggers explosive team berry surges (Mimikyu doubles on Great Success!). An apex island pusher for active collectors; 1.4x boosted during Buncha Berries events.'
    ],
    'lab.t_sum_burst_bfs': [
      '樹果遽增推進主力：具備「樹果數量S」大幅提升常態樹果產量，配合主技能隨機爆發隊友樹果，具備極佳的推分爆發力。建議勤勞收包並搭配主技能種子或技能機率副技能。',
      'Berry Burst Pusher: Equipped with "Berry Finding S" for high baseline berry generation, synergizing with Berry Burst procs for strong island push power. Regular collection recommended.'
    ],
    'lab.t_sum_burst_freq': [
      '高頻樹果遽增核心：主技能發動率卓越，能頻繁為卡比獸爆發樹果能量；若未來能解鎖樹果數量S或配合樹果週活動（1.4倍加成），將具備天花板級爆發上限！',
      'High-Frequency Berry Burst Core: Excellent main skill trigger rate triggers frequent berry surges directly into Snorlax. Unlocking BFS or leveling main skill offers enormous burst potential (1.4x during Berry Weeks).'
    ],
    'lab.t_sum_burst_base': [
      '樹果遽增技能型：主技能為「樹果遽增」，能瞬間爆發樹果能量，建議搭配主技能種子或技能機率副技能以提升發動次數。',
      'Berry Burst Specialist: Main skill "Berry Burst" provides instant team berry surges. Prioritize skill seeds and skill trigger subskills for maximum efficiency.'
    ],
    'lab.t_sum_healer_bad': [
      '致命硬傷：補師性格為減少主技能機率（-20%），全天期望回能次數嚴重不足，難以維持全隊 80% 以上極限活力運轉。',
      'Fatal Healer Flaw: Main Skill Trigger Down nature (-20%) cripples daily activation rate, failing to maintain team energy above the 80% speed threshold.'
    ],
    'lab.t_sum_healer_bfs_note': [
      '（注意：持有樹果S易過早滿包，睡前務必清空背包避免阻斷技能判定）。',
      ' (Note: BFS accelerates bag overflow; clear inventory before sleep to prevent blocked procs).'
    ],
    'lab.t_sum_healer_top': [
      '頂尖隊伍回能引擎！雙重技能發動機率加成，全天期望觸發 4~6 次以上，能牢牢鎖定全隊高活力上限，享受 2.2 倍極限幫忙速！{extraNote}',
      'Top-tier Team Healer Engine! High trigger rate guarantees 4-6 procs daily, locking the team at high energy for 2.2x maximum helping speed.{extraNote}'
    ],
    'lab.t_sum_healer_future': [
      '潛力補師：關鍵「技能機率提升M」將於 Lv.{lv} 解鎖，建議優先培育升級以構築全隊回能防線。',
      'Promising Healer: Core "Skill Trigger M" unlocks at Lv.{lv}. Prioritize leveling to establish reliable team energy coverage.'
    ],
    'lab.t_sum_healer_low': [
      '發動期望不足：缺乏主技能機率提升副技能或性格加成，發動頻率偏低，無法勝任穩定維持全隊活力的隊伍核心基石。',
      'Insufficient Trigger Rate: Lacks active Skill Trigger subskills or nature boost; healing frequency is too low to sustain all-day team vitality.'
    ],
    'lab.t_sum_healer_ok': [
      '及格團隊補師：具備穩健的發動頻率，能提供基礎活力續航，協助隊伍維持日間高水準工作效率。',
      'Qualified Team Healer: Decent trigger rate for stable energy support, helping the team maintain high daytime work efficiency.'
    ],
    'lab.t_sum_helper_top': [
      '同屬性純色隊終極放大器！主技能「幫手加速」單次發動可引爆全隊即時產出，隊伍中同屬性不同種類寶可夢越多倍率越高。神獸本體首重技能機率與持有上限防溢滿，而將樹果數量S交由「隊友」攜帶以最大化技能爆發收益！',
      'Mono-Type Team Amplifier: "Helper Boost" triggers instant team-wide production cycles, scaling higher with more unique same-type team members! Prioritizes Skill Triggers and Helping Bonus to avoid self-bag overflow, while teammates carry BFS to massively amplify output.'
    ],
    'lab.t_sum_helper_base': [
      '同屬性純色隊發動機：主技能「幫手加速」能帶動同屬性隊員進行多次額外幫忙。基礎發動率偏低（約2%），極度依賴技能機率副技能與主技能種子投入。',
      'Mono-Type Helper Specialist: "Helper Boost" triggers instant multi-helps for all same-type members. Skill trigger subskills and Main Skill Seeds are primary priorities.'
    ],
    'lab.t_sum_charge_hybrid_top': [
      '頂級雙修能量砲台！解鎖「能量填充 + 樹果數量S」雙修形態。在對應喜好樹果島嶼上（如電龍在發電廠、太陽伊布在湖畔、哥達鴨在海灘），為勤勞收包玩家提供極限級總能量期望（單次直傷數千 + 每次雙倍島嶼樹果）！放置時需注意及時清包以防滿包阻斷技能判定。',
      'Top-Tier Hybrid Charge Cannon! Unlocks the "Charge Strength + Berry Finding S" dual-track form. On favorite berry islands (e.g. Ampharos at Power Plant, Espeon at Lakeside, Golduck at Beach), active collectors achieve the ultimate theoretical energy ceiling (thousands in direct skill strength + double island berries)! Collect regularly to prevent bag overflow.'
    ],
    'lab.t_sum_charge_hybrid': [
      '雙修型單兵直傷手：持有「樹果數量S」提供可觀樹果副產能，配合主技能能量填充提供穩定分數進帳，建議高頻收包以防滿包偷吃阻斷技能。',
      'Hybrid Charge Producer: "Berry Finding S" provides high-value island berry yield alongside steady Charge Strength direct energy. High-frequency collection is recommended to prevent Sneaky Snacking from halting skill checks.'
    ],
    'lab.t_sum_charge_freq': [
      '強力單兵能量砲台：倚賴「能量填充」提供高額直傷分數，發動機率加成顯著，具備極佳的單兵獨立產分戰鬥力。',
      'High-Yield Energy Cannon: Leverages frequent "Charge Strength" activations for heavy single-target Snorlax point generation.'
    ],
    'lab.t_sum_charge_base': [
      '單兵能量手：主技能為直接提升卡比獸能量，依賴主技能等級與發動頻率支撐產能。',
      'Charge Strength Specialist: Provides steady direct Snorlax energy, depending primarily on skill trigger rate and main skill level.'
    ],
    'lab.t_sum_leg_psystrike': [
      '傳說樹果領域核心！專屬主技能「精神擊破」能展開樹果領域，全面提升特定屬性樹果能量，為全隊帶來跨維度的戰略爆發！',
      'Legendary Berry Field Engine! Signature move "Psystrike" deploys a Berry Field, massively multiplying specific berry yields for team-wide strategic breakthroughs.'
    ],
    'lab.t_sum_leg_decathlon': [
      '幻之十項全能戰術手！專屬主技能「十項全能」技能池深不可測，為全隊提供極具彈性的戰術補強與意外上限。',
      'Mythical All-Rounder! Signature move "Decathlon" draws from an unpredictable repertoire of master skills, serving as an adaptable wildcard.'
    ],
    'lab.t_sum_leg_dark': [
      '幻之惡系直傷爆發手！專屬主技能「夢魘」單次提供巨額卡比獸直傷能量，基礎速度快，為頂級獨立產分戰力。',
      'Mythical Dark Charge Burst! Signature move "Bad Dreams" unleashes massive direct energy points with outstanding base speed.'
    ],
    'lab.t_sum_tasty_top': [
      '料理大成功爆擊手：主技能「料理成功S」能不斷疊加下次料理的大成功機率，專為每週衝擊大師高階時引爆週末大餐（數十萬能量爆擊）的終極戰術組件！首重技能機率與持有上限，嚴禁樹果S阻斷判定。',
      'Premier Extra Tasty Specialist: High trigger rate stacks dish crit probability rapidly, tailor-made for exploding weekend master dishes with multi-hundred-thousand point bursts! Strictly avoid BFS to protect skill procs.'
    ],
    'lab.t_sum_tasty_base': [
      '料理大成功戰術手：疊加料理美味機率，專為週末大餐爆擊儲備機率，建議提高技能機率與持有上限。',
      'Tactical Extra Tasty Specialist: Stacks dish critical success chance to prepare for explosive cooking scores during event weeks.'
    ],
    'lab.t_sum_pot_top': [
      '極品戰術擴鍋手：具備優秀的主技能發動加成，能高頻擴充鍋子容量，專為週末衝擊頂級極限大菜（突破鍋子上限）而生！',
      'Premier Pot Expander: High main skill trigger rate expands pot size rapidly, tailor-made for breaking cooking limits on weekends!'
    ],
    'lab.t_sum_pot_base': [
      '戰術擴鍋專門：主技能「料理強化S」能擴充鍋容量，適合週末囤積鍋空間以衝擊極限大型食譜。',
      'Tactical Pot Specialist: Main skill "Cooking Power Up S" expands pot capacity for preparing high-tier recipes during event weeks.'
    ],
    'lab.t_sum_shard_top': [
      '夢之碎片頂級收割手：高頻發動夢之碎片主技能，在好眠日活動與糖果強化週是不可或缺的頂尖資金農夫！',
      'Premier Dream Shard Harvester: High trigger rate paired with Dream Shard subskills yields massive currency during Good Sleep Days and Candy Boost weeks!'
    ],
    'lab.t_sum_shard_base': [
      '夢之碎片專門手：主技能為直接獲取夢之碎片，為後期高昂的寶可夢升級糖果消耗提供資金支持。',
      'Dream Shard Specialist: Main skill provides direct Dream Shards, crucial for sustaining high late-game candy power-up costs.'
    ],
    'lab.t_sum_ingskill_top': [
      '應急食材爆發中樞：高額技能發動率能瞬間填補龐大食材庫存，化解高階料理缺料危機，是食材告急時的最佳急救隊員！',
      'Rapid Stockpile Emergency Support: High trigger rate pours abundant random ingredients into inventory, instantly curing recipe ingredient shortages!'
    ],
    'lab.t_sum_ingskill_base': [
      '應急食材補給手：主技能為獲取額外隨機食材，能輔助日常烹飪食材供給。',
      'Ingredient Draw Specialist: Main skill fetches bonus random ingredients to support daily kitchen consumption.'
    ],
    'lab.t_sum_metronome': [
      '隨機揮指戰術手：能隨機發動全遊戲主技能，具備極高趣味性與意外上限，在日常探索中常有驚喜表現。',
      'Wildcard Metronome Specialist: Triggers unpredictable random skills across the game, delivering high excitement and unexpected score leaps.'
    ],
    'lab.t_sum_skill_bad': [
      '致命缺陷：性格減少主技能發動機率（-20%），嚴重閹割核心發動頻率，不符技能型定位。',
      'Fatal Specialty Flaw: Nature reduces Main Skill Trigger (-20%), severely crippling core activation frequency.'
    ],
    'lab.t_sum_skill_anchor_future': [
      '專精技能主力：當前技能發動表現活躍，且後續 Lv.{lv} 仍有技能提升空間，戰術運轉流暢。',
      'Specialized Skill Anchor: Strong active skill trigger frequency, with further performance leaps upon reaching Lv.{lv}.'
    ],
    'lab.t_sum_skill_anchor': [
      '專精技能主力：優質的技能機率加成確保了穩定的觸發頻率，能充分發揮技能專長優勢。',
      'Specialized Skill Anchor: Excellent skill trigger bonuses ensure high activation frequency for stable specialty performance.'
    ],
    'lab.t_sum_skill_future': [
      '潛力技能手：關鍵「技能機率提升M」將於 Lv.{lv} 解鎖，建議優先培育升級以釋放核心潛力。',
      'Future Skill Prospect: Core "Skill Trigger M" unlocks at Lv.{lv}. Prioritize leveling to unleash true skill potential.'
    ],
    'lab.t_sum_skill_base': [
      '常規技能手：技能觸發率處於基準線，適合作為特定情境替補或過渡成員。',
      'Standard Skill Specialist: Baseline skill trigger rate; suitable as a situational support or transitional pick.'
    ],
    'lab.t_sum_ing_bad': [
      '致命短板：性格減少食材發現率（-20%），產出頻繁被樹果稀釋，極難穩定供應主力食譜所需食材，不建議投入過多資源。',
      'Fatal Specialty Flaw: Nature reduces Ingredient Finding (-20%), causing frequent berry dilution and unstable cooking supply. Not recommended for major investment.'
    ],
    'lab.t_sum_ing_aaa': [
      '搭配極品純色 AAA 食材配置，特定食材產量高度集中。',
      ' Features pure mono-ingredient (AAA) spread for maximum focused output.'
    ],
    'lab.t_sum_ing_abb': [
      '搭配強勢 ABB 雙色配置，二階與三階食材量產能力卓越。',
      ' Features strong ABB dual spread, excelling in mid-to-late advanced ingredient yield.'
    ],
    'lab.t_sum_ing_abc': [
      '三色 ABC 雜色配置略微稀釋單項食材產量。',
      ' Split ABC spread dilutes single ingredient yield.'
    ],
    'lab.t_sum_ing_hybrid_inv': [
      '極品雙修食材手！食材機率大幅提升搭配「樹果數量S」與「持有上限提升」，食材爆發力極強且兼顧頂級樹果副產能！{recipePhrase}',
      'Top Hybrid Specialist: Active "Ingredient Finder M" backed by BFS and Inventory Up provides exceptional food yields with massive bonus berries.{recipePhrase}'
    ],
    'lab.t_sum_ing_hybrid_noinv': [
      '高爆發雙修型：食材機率優異並持有「樹果數量S」，但缺乏持有上限容易在睡眠期間提早滿包阻斷產料，建議勤勞收成。{recipePhrase}',
      'High-Burst Hybrid: Excellent ingredient rate and BFS provide huge dual yield, but inventory caps fast overnight—collect regularly.{recipePhrase}'
    ],
    'lab.t_sum_ing_top': [
      '頂級食材供應中樞！高額食材發現率確保了穩定龐大的料理供應，做大菜的最佳後勤基石。{recipePhrase}{ingSpreadDesc}',
      'Premier Kitchen Anchor! High ingredient finding rate ensures abundant cooking supply for top recipes.{recipePhrase}{ingSpreadDesc}'
    ],
    'lab.t_sum_ing_future': [
      '潛力食材手：關鍵「食材機率提升M」將於 Lv.{lv} 解鎖，建議優先培育升級以構築主力供貨能力。{recipePhrase}',
      'Future Ingredient Prospect: Core "Ingredient Finder M" unlocks at Lv.{lv}. Prioritize leveling to establish reliable kitchen supply.{recipePhrase}'
    ],
    'lab.t_sum_ing_speed': [
      '幫速彌補型：雖缺乏直接食材機率提升，但憑藉優良的幫忙速度維持了合格的基礎供貨，適合作為實用過渡。{recipePhrase}',
      'Speed-Driven Producer: Lacks direct ingredient finder boost, but high helping speed compensates to provide acceptable general output.{recipePhrase}'
    ],
    'lab.t_sum_ing_low': [
      '缺乏食材爆發力：前中期未持有食材機率加成或顯著幫速，產量難以滿足高階大型料理（如彈跳咖哩烏龍麵、大塊滿滿熱水沙拉等頂級大菜）的消耗需求。{recipePhrase}',
      'Lacks Ingredient Output: Missing ingredient finder and speed boosts; yields are insufficient to sustain demanding high-tier dishes.{recipePhrase}'
    ],
    'lab.t_sum_ing_solid': [
      '穩健食材供應手：供貨節奏穩定，足以勝任日常食譜輪替與食材儲備。{recipePhrase}{ingSpreadDesc}',
      'Solid Ingredient Provider: Steady supply for regular meals, serving reliably in daily cooking rotations.{recipePhrase}{ingSpreadDesc}'
    ],
    'lab.t_sum_fallback': [
      '{grade} 級（{score}分）- 基礎素質均衡，適合作為隊伍實用成員。',
      '{grade} Grade ({score} pts) - Reliable team member with balanced baseline performance.'
    ],

    // ─── 隊伍模擬與最佳化 (lab_team_calc.js) ───
    'lab.t_rank_basic': ['普通 {n}', 'Basic {n}'],
    'lab.t_rank_great': ['進階 {n}', 'Great {n}'],
    'lab.t_rank_ultra': ['超級 {n}', 'Ultra {n}'],
    'lab.t_rank_master': ['大師 {n}', 'Master {n}'],
    'lab.t_toast_opt_recipe': [
      '已自動為【{islandName}】依目標料理【{recipeName}】配置單日覆蓋最佳食材陣容！',
      'Team optimized for target recipe: {recipeName} on {islandName} (Daily Coverage)!'
    ],
    'lab.t_toast_opt_strat': [
      '已自動為【{islandName}】推薦【{stratName}】（料理目標：{cookName}）！',
      'Team optimized: {stratName} on {islandName} ({cookName})!'
    ],
    'lab.t_strat_balanced': ['綜合隊', 'Balanced'],
    'lab.t_strat_berries': ['樹果隊', 'Berry-Focused'],
    'lab.t_strat_ingredients': ['食材隊', 'Ingredient-Focused'],
    'lab.t_strat_skills': ['技能隊', 'Skill-Focused'],
    'lab.t_cook_curry': ['咖哩/濃湯', 'Curry'],
    'lab.t_cook_salad': ['沙拉', 'Salad'],
    'lab.t_cook_dessert': ['點心/飲料', 'Dessert'],
    'lab.t_list_sep': ['、', ', '],
    'lab.t_toast_reroll_gg': [
      '萌綠之島喜愛樹果已隨機刷新：{berries}！',
      'Greengrass favored berries rerolled: {berries}'
    ],

    // ─── 挑選彈窗 (lab_team_picker.js) ───
    'lab.t_toast_dup_compare': ['該寶可夢已在對比選手名單中，無法重複選擇！', 'This Pokémon is already selected in comparison!'],
    'lab.t_picker_no_recipe': ['未找到符合條件的料理', 'No matching recipes found'],
    'lab.t_pots_unit': ['格', ' Pots'],
    'lab.t_current_badge': ['當前', 'Current'],
    'lab.t_all': ['全部', 'All'],
    'lab.t_all_ings': ['全部食材', 'All Ingredients'],
    'lab.t_all_berries': ['全部樹果', 'All Berries'],
    'lab.t_picker_recipe_title': ['挑選目標料理', 'Select Target Recipe'],
    'lab.t_dishes_unit': ['道料理', 'Dishes'],
    'lab.t_picker_recipe_search_ph': ['搜尋料理名稱或所需食材...', 'Search recipe name or ingredient...'],
    'lab.t_ingr_colon': ['食材:', 'Ingr:'],
    'lab.t_picker_title_team': ['挑選隊員 (隊員槽位 {slot})', 'Select Member for Slot {slot}'],
    'lab.t_picker_title_growth': ['挑選培育精算對象', 'Select Pokémon for Growth & Seeds Calculation'],
    'lab.t_picker_title_compare': ['挑選選手 {letter}', 'Select Pokémon for Player {letter}'],
    'lab.t_picker_no_pkm': ['倉庫中未找到符合條件的寶可夢', 'No matching Pokémon found in Box'],
    'lab.t_locked_paren': [' (未解鎖)', ' (Locked)'],
    'lab.t_already_compare_title': ['已在對比選手中', 'Already in comparison'],
    'lab.t_in_compare_badge': ['已在對比中', 'In Comparison'],
    'lab.t_picker_pkm_search_ph': ['搜尋寶可夢暱稱或編號...', 'Search nickname or Dex No...'],
    'lab.t_filter_fav': ['喜愛樹果', 'Favored'],
    'lab.t_filter_berries': ['樹果型', 'Berries'],
    'lab.t_filter_ings': ['食材型', 'Ingredients'],
    'lab.t_filter_skills': ['技能型', 'Skills'],
    'lab.t_berry_colon': ['樹果:', 'Berry:'],

    // ─── 幫手組隊 UI (lab_team_ui.js) ───
    'lab.t_gg_berries_title': ['萌綠之島本週喜愛樹果 (可自由自選):', 'Greengrass Favored Berries (Customizable):'],
    'lab.t_gg_berries_sub': ['自選本週 3 種喜愛樹果，產能與推薦即時享有 2x 能量加成', 'Select 3 favored berries for this week (2x energy boost)'],
    'lab.t_reroll_title': ['從 18 種樹果隨機刷新 3 種', 'Reroll 3 random berries from 18'],
    'lab.t_reroll_btn': ['隨機擲骰', 'Random Reroll'],
    'lab.t_roll_build_title': ['隨機抽出 3 種樹果並立即自動推薦最佳陣容', 'Reroll 3 random berries and immediately auto-optimize team'],
    'lab.t_roll_build_btn': ['擲骰並自動配隊', 'Roll & Build'],
    'lab.t_pot_ok': ['容量充裕', 'Capacity OK'],
    'lab.t_pot_short': ['鍋容量不足', 'Pot Short'],
    'lab.t_pot_size_label': ['鍋子容量:', 'Pot Size:'],
    'lab.t_pot_dec_title': ['鍋容量 -3', 'Decrease Pot Size by 3'],
    'lab.t_pot_base_title': ['基礎鍋容量: {size}', 'Base Pot Size: {size}'],
    'lab.t_pot_inc_title': ['鍋容量 +3', 'Increase Pot Size by 3'],
    'lab.t_pot_sunday_title': ['週日特別擴鍋：料理鍋容量 2 倍', 'Sunday Pot Expansion: 2x Pot Capacity'],
    'lab.t_pot_sunday_btn': ['週日2倍', 'Sunday 2x'],
    'lab.t_pot_camp_title': ['好露營券：料理鍋容量 +50%', 'Good Camp Ticket: +50% Pot Capacity'],
    'lab.t_pot_camp_btn': ['好露營券(+50%)', 'Camp +50%'],
    'lab.t_pot_effective_label': ['實際容納:', 'Effective:'],
    'lab.t_team_focus_label': ['隊伍類型:', 'Team Focus:'],
    'lab.t_pill_berries': ['樹果隊', 'Berries'],
    'lab.t_pill_ingredients': ['食材隊', 'Ingredients'],
    'lab.t_pill_skills': ['技能隊', 'Skills'],
    'lab.t_pill_recipe': ['目標料理', 'Target Recipe'],
    'lab.t_target_dish_label': ['目標料理:', 'Target Dish:'],
    'lab.t_click_to_change': ['點擊更換', 'Click to change'],
    'lab.t_change': ['更換', 'Change'],
    'lab.t_cooking_goal_label': ['料理種類:', 'Cooking Goal:'],
    'lab.t_aura_helping_title': ['全體幫手速度 +{pct}%', 'Team Helping Speed +{pct}%'],
    'lab.t_aura_helping': ['幫手獎勵', 'Helping Bonus'],
    'lab.t_aura_energy_title': ['全體睡眠活力回復 +{pct}%', 'Team Energy Recovery +{pct}%'],
    'lab.t_aura_energy': ['活力回復獎勵', 'Energy Recovery'],
    'lab.t_aura_sleepexp_title': ['全體睡眠EXP +{pct}%', 'Team Sleep EXP +{pct}%'],
    'lab.t_aura_sleepexp': ['睡眠EXP獎勵', 'Sleep EXP'],
    'lab.t_aura_researchexp_title': ['研究EXP +{pct}%', 'Research EXP +{pct}%'],
    'lab.t_aura_researchexp': ['研究EXP獎勵', 'Research EXP'],
    'lab.t_aura_dreamshard_title': ['夢之碎片 +{pct}%', 'Dream Shards +{pct}%'],
    'lab.t_aura_dreamshard': ['夢之碎片獎勵', 'Dream Shard'],
    'lab.t_auras_bar_label': ['隊伍全體光環彙總:', 'Team Shared Bonuses:'],
    'lab.t_auras_empty': ['目前隊內無全體加成光環 (個人特化陣容)', 'No team bonuses active (personal builds)'],
    'lab.t_slot_empty_title': ['點擊挑選隊員', 'Click to select team member'],
    'lab.t_slot_empty_text': ['點擊挑選隊員', 'Select Team Member'],
    'lab.t_skill_short': ['技能', 'Skill'],
    'lab.t_aura_team_shared': ['全體隊伍加成', 'Team Shared Bonus'],
    'lab.t_aura_locked_until': ['未解鎖 · Lv.{lv}', 'Locked until Lv.{lv}'],
    'lab.t_solo_spec_title': ['個人特化專精：副技能均為個人加成，無全隊光環', 'Individual Specialist: Subskills focus on personal performance rather than whole team'],
    'lab.t_solo_spec': ['個人專精', 'Solo Specialist'],
    'lab.t_mint_short': ['薄荷', 'Mint'],
    'lab.t_replace': ['更換', 'Replace'],
    'lab.t_daily_berry_energy_title': ['每日樹果能量', 'Daily berry energy'],
    'lab.t_energy_pts': ['能量', 'pts'],
    'lab.t_ing_surplus_paren': [' (三餐自給充裕)', ' (Daily Self-Sufficient)'],
    'lab.t_ing_synergy_paren': [' (料理契合)', ' (Recipe Synergy)'],
    'lab.t_supply_surplus': ['充裕', 'Surplus'],
    'lab.t_supply_deficit': ['缺口', 'Deficit'],
    'lab.t_supply_meal_title': ['單餐需求', 'Single meal requirement'],
    'lab.t_supply_meal_lbl': ['每餐:', 'Meal:'],
    'lab.t_supply_daily_title': ['每日 3 餐總需求', 'Daily 3-meal total demand'],
    'lab.t_supply_daily_lbl': ['日需:', 'Daily:'],
    'lab.t_supply_yield_title': ['隊伍每日預估產出', 'Team estimated daily harvest'],
    'lab.t_supply_yield_lbl': ['日產:', 'Yield:'],
    'lab.t_supply_satisfied': ['100% 達成 · 可完全自給自足', '100% Self-Sufficient'],
    'lab.t_supply_overall': ['全體達成率: {pct}%', 'Overall: {pct}%'],
    'lab.t_supply_pots_meta': ['格鍋容量', 'Pots'],
    'lab.t_supply_base_energy_meta': ['基礎能量', 'Base Energy'],
    'lab.t_supply_board_sub': ['目標料理食材供需看板 · 精算每日 3 餐食材缺口與隊伍自給自足率', 'Target Recipe Ingredient Supply vs Daily Demand Dashboard (3 Meals/Day)'],
    'lab.t_change_recipe_btn': ['更換目標料理', 'Change Recipe'],
    'lab.t_favored_berries_lbl': ['喜愛樹果 (2x 能量):', 'Favored Berries (2x Power):'],
    'lab.t_est_daily_total': ['預估每日能量總產出', 'Estimated Daily Total Energy'],
    'lab.t_projected_rank_title': ['依據每日產能 x7 預估週日卡比獸可達階級', 'Estimated Sunday Snorlax Rank at 7x Daily Energy'],
    'lab.t_projected_rank_lbl': ['預估週日卡比獸階級: ', 'Projected Sunday Snorlax Rank: '],
    'lab.t_pts_per_day': ['能量/日', 'pts/day'],
    'lab.t_chip_berry': ['樹果: ', 'Berry: '],
    'lab.t_chip_cooking': ['料理 (3餐): ', 'Cooking (3 meals): '],
    'lab.t_chip_skill': ['技能: ', 'Skill: '],
    'lab.t_metric_sub': [
      '依據【{islandName}】喜愛樹果加成、每日 3 餐料理產能與主技能發動綜合精算。',
      'Comprehensive simulation based on {islandName} 2x berry power, 3-meal cooking synergy, and direct skill triggers.'
    ],
    'lab.t_est_daily_ings': ['預估每日食材總產量', 'Daily Ingredients Harvest'],
    'lab.t_items_per_day': ['個/日', 'items/day'],
    'lab.t_no_ings_yet': ['尚無食材產出', 'No ingredients yet']
  });
