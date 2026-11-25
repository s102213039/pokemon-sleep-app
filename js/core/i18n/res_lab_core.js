  // ─── 深度研究室核心與對比/培育模組字串資源 (Lab Core, Compare & Growth) ───
  registerResources({
    // lab_main.js
    'lab.c_loading_pokedex': ['載入圖鑑資料中...', 'Loading Pokédex data...'],
    'lab.c_no_pokemon_box': ['倉庫中尚無寶可夢', 'No Pokémon in Box'],
    'lab.c_register_first_desc': ['請先在【寶可夢倉庫】新增登錄寶可夢後，再來進行深度評測！', 'Please register Pokémon in the Box tab first, then evaluate them here!'],
    'lab.c_go_to_box': ['前往寶可夢倉庫', 'Go to Box'],
    'lab.c_subtab_team': ['幫手組隊', 'Team'],
    'lab.c_subtab_compare': ['寶可夢對比', 'Compare'],
    'lab.c_subtab_growth': ['培育精算', 'Growth'],

    // lab_milestone.js
    'lab.c_slowpoke_tail': ['美味尾巴', 'Slowpoke Tail'],
    'lab.c_lv_unlock': ['Lv.{lv} 解鎖', 'Lv.{lv} Unlock'],
    'lab.c_milestone_grade_leap': [
      '建議優先升至 Lv.{lv} 解鎖「{skill}」，評級將由 {curGrade} 級（{curScore}分）跨階躍升至 {projGrade} 級（{projScore}分）！',
      "Recommended to prioritize Lv.{lv} to unlock '{skill}': rating leaps from {curGrade} ({curScore} pts) to {projGrade} ({projScore} pts)!"
    ],
    'lab.c_milestone_score_leap': [
      '建議培育至 Lv.{lv} 解鎖核心「{skill}」，綜合能力將由 {curScore} 分實質提升至 {projScore} 分。',
      "Recommended to train to Lv.{lv} to unlock core '{skill}': overall score increases from {curScore} pts to {projScore} pts."
    ],

    // lab_editor.js
    'lab.c_pkm_updated': ['寶可夢數值已成功更新！', 'Pokémon updated successfully!'],
    'lab.c_no_matching_pkm': ['找不到符合之寶可夢', 'No matching Pokémon'],
    'lab.c_pokemon_a': ['選手 A', 'Pokémon A'],
    'lab.c_pokemon_b': ['選手 B', 'Pokémon B'],

    // lab_engine.js
    'lab.c_grade_b_plain': ['實用良品 (Solid Choice)', 'Solid Choice'],
    'lab.c_grade_sss': ['神級天花板 (Apex God)', 'Apex God'],
    'lab.c_grade_ss': ['極品畢業 (Mythic Tier)', 'Mythic Tier'],
    'lab.c_grade_s': ['頂級戰力 (Top Tier)', 'Top Tier'],
    'lab.c_grade_a': ['強力主力 (Strong Pick)', 'Strong Pick'],
    'lab.c_grade_b': ['[✓] 實用良品 (Solid Choice)', '[✓] Solid Choice'],
    'lab.c_grade_c': ['[~] 過渡可用 (Usable)', '[~] Usable'],
    'lab.c_grade_d': ['[-] 換糖回收 (Recycle)', '[-] Recycle'],
    'lab.c_pro_bfs_berry_burst': [
      '完美契合「樹果遽增」機制！具備「樹果數量S」能在常態幫忙中額外產出樹果，同時透過主技能引爆全隊樹果能量，為島嶼衝分第一梯隊打手！（勤勞清包收益最大化）',
      'Perfectly synergizes with "Berry Burst"! "Berry Finding S" increases base helps by +1 berry while main skill unleashes massive team berry bursts, forming an elite island pusher (maximize yields via regular collection).'
    ],
    'lab.c_con_bfs_helper_boost': [
      '[!] 傳說神獸「幫手加速」基礎機率極低（約2%），持有「樹果數量S」會迅速塞滿背包並阻斷主技能判定，嚴重排擠關鍵技能機率與持有上限。',
      '[!] Helper Boost base proc rate is extremely low (~2%); "Berry Finding S" causes rapid bag overflow and blocks main skill checks, crowding out trigger subskills.'
    ],
    'lab.c_con_bfs_healer': [
      '[!] 活力療癒補師首重全隊活力維持，「樹果數量S」會大幅加速滿包並阻斷主技能判定（尤其睡眠過夜期間），需高頻清包。',
      '[!] Healer relies on all-day skill procs; "Berry Finding S" causes rapid bag overflow and blocks healing procs (especially overnight).'
    ],
    'lab.c_pro_bfs_charge_slaking': [
      '具備「樹果數量S」解鎖高額樹果副輸出，兼顧單兵直傷與產果（需留意及時清包避免阻斷主技能判定）。',
      'Equipped with "Berry Finding S" for high-strength hybrid berry output (ensure frequent collection to avoid bag overflow blocking skill procs).'
    ],
    'lab.c_con_bfs_tactical_skill': [
      '[!] 純戰術型技能寶可夢持有上限較低，擁有「樹果數量S」容易過早滿包限制主技能判定。',
      '[!] Tactical skill specialist; "Berry Finding S" causes early bag overflow and blocks main skill checks.'
    ],
    'lab.c_pro_bfs_ing_with_carry': [
      '具備「樹果數量S」並搭配「持有上限提升」，兼顧穩定副產能且不易過早滿包。',
      'Features "Berry Finding S" backed by Inventory Up, providing bonus berry value without hurting ingredient capacity.'
    ],
    'lab.c_con_bfs_ing_no_carry': [
      '[-] 食材型持有「樹果數量S」但缺乏「持有上限提升」，易在離線期間快速滿包並提前進入偷吃樹果狀態阻斷產料。',
      '[-] "Berry Finding S" on ingredient specialist without Inventory Up causes rapid overflow, blocking ingredient drops during sleep.'
    ],
    'lab.c_pro_bfs_generic': [
      '擁有已解鎖神技「樹果數量S」，樹果產能躍升 +1 個。',
      'Equipped with active God-tier sub-skill "Berry Finding S", +1 berry per help.'
    ],
    'lab.c_pro_berry_extreme_speed': [
      '具備「幫手獎勵 + 幫忙速度M + 加幫速性格」之極限幫速配置，成功特例躋身主力行列！',
      'Features extreme speed kit (Helping Bonus + Helping Speed M + Speed Up Nature), qualifying as a viable core support.'
    ],
    'lab.c_con_berry_no_bfs': [
      '[-] 樹果型專長未激活「樹果數量S」，核心產能與頂標差距明顯，上限封頂於過渡可用（最高B級）。',
      '[-] Berry specialist without active "Berry Finding S", production ceiling is capped below top tier.'
    ],
    'lab.c_pro_slowpoke_tail': [
      'Lv.30 解鎖遊戲最頂級食材「美味尾巴」，達成呆呆獸家族首要戰略解鎖使命！',
      'Lv.30 unlocks the most valuable ingredient "Slowpoke Tail", fulfilling primary strategic unlock mission!'
    ],
    'lab.c_con_slowpoke_no_tail': [
      '[-] 致命失職：Lv.30 未出「美味尾巴」，喪失呆呆獸家族核心戰略解鎖價值。',
      '[-] Lv.30 does NOT yield "Slowpoke Tail", failing its core strategic unlock role.'
    ],
    'lab.c_con_healer_skill_down': [
      '[-] 致命缺陷：補師性格為減主技能發動率（-20%），全天期望回能嚴重不足，無法勝任隊伍基石。',
      '[-] Critical flaw: Healer has Main Skill Trigger Down nature, failing to sustain team energy.'
    ],
    'lab.c_con_healer_no_trigger': [
      '[!] 缺乏任何主技能發動率副技能或性格加成，發動期望偏低，無法穩定維持全隊活力。',
      '[!] Lacks any active Skill Trigger subskills or nature boost; healing frequency is too low for reliable team recovery.'
    ],
    'lab.c_pro_ing_m': [
      '具備已解鎖「食材機率提升M」，大幅提升料理食材供貨穩定度。',
      'Features active "Ingredient Finder M", greatly stabilizing ingredient supply.'
    ],
    'lab.c_pro_skill_m_spec': [
      '擁有已解鎖「技能機率提升M」，主技能發動頻率顯著提高。',
      'Features active "Skill Trigger M", significantly raising main skill activation frequency.'
    ],
    'lab.c_pro_skill_m_ing': [
      '具備已解鎖「技能機率提升M」，輔助觸發食材獲取主技能，提供額外料理補給。',
      'Unlocked "Skill Trigger M" synergizes with ingredient-fetching main skill for bonus food supplies.'
    ],
    'lab.c_pro_helping_bonus': [
      '具備已解鎖全隊頂級光環「幫手獎勵」，全員幫忙時間縮短 5%（相當於全隊淨產能大幅提升）。',
      'Features active top-tier team aura "Helping Bonus", reducing team helping time by 5%.'
    ],
    'lab.c_pro_helping_speed_m': [
      '擁有已解鎖「幫忙速度M」，自身幫忙間隔縮短 14%。',
      'Features active "Helping Speed M", shortening self helping interval by 14%.'
    ],
    'lab.c_pro_high_skill_lv': [
      '主技能等級達到 Lv.{lv}，技能單次發動效益已達極限。',
      'High Main Skill Level (Lv.{lv}), maximizing main skill trigger output.'
    ],
    'lab.c_pro_adamant_berry': [
      '性格「固執」為樹果型第一神性格（幫忙速度▲ +10%，食材發現率▼ 進一步轉化樹果產量）。',
      'Nature "Adamant" is the #1 God nature for Berry specialists (Speed of Help ▲ +10%, Ingredient Finding ▼ converts help cycles directly into berry output).'
    ],
    'lab.c_pro_nature_speed_up': [
      '性格「{nature}」帶來幫忙速度▲ (+10%)，強化所有產出判定。',
      'Nature "{nature}" provides Speed of Help ▲ (+10%), boosting all production.'
    ],
    'lab.c_con_nature_speed_down': [
      '[-] 性格「{nature}」幫忙速度▼ (-7.5%)，對全方位產出有顯著負面影響。',
      '[-] Nature "{nature}" reduces Speed of Help ▼ (-7.5%), severely impacting output.'
    ],
    'lab.c_pro_nature_ing_up': [
      '性格「{nature}」完美契合食材型專長 (食材發現率▲ +20%)。',
      'Nature "{nature}" perfectly synergizes with Ingredient specialty (Ingredient Finder ▲ +20%).'
    ],
    'lab.c_con_nature_ing_down': [
      '[-] 致命缺陷：性格「{nature}」導致食材發現率▼ (-20%)，產料嚴重不足，建議換糖回收。',
      '[-] Nature "{nature}" reduces Ingredient Finding ▼ (-20%), severely weakening specialty advantage (disqualification flaw).'
    ],
    'lab.c_pro_nature_skill_up': [
      '性格「{nature}」完美契合技能型專長 (主技能發動率▲ +20%)。',
      'Nature "{nature}" perfectly matches Skill specialty (Main Skill Trigger ▲ +20%).'
    ],
    'lab.c_con_nature_skill_down': [
      '[-] 致命缺陷：性格「{nature}」導致主技能發動率▼ (-20%)，嚴重閹割核心發動頻率。',
      '[-] Nature "{nature}" reduces Main Skill Trigger ▼ (-20%), severely crippling skill output.'
    ],
    'lab.c_pro_cleanse_mint': [
      '已使用淨白薄荷：原性格「{nature}」個性效果已被中和消除。',
      'Cleanse Mint used: original nature "{nature}" neutralized to standard baseline.'
    ],
    'lab.c_pro_ribbon_speed': [
      '[睡飽飽獎章 Lv.{lv}] 幫忙間隔縮短 {pct}，持有上限增加 {carry}。',
      '[Ribbon Lv.{lv}] Helping interval shortened by {pct}, carry capacity increased by {carry}.'
    ],
    'lab.c_pro_ribbon_carry_final': [
      '[睡飽飽獎章 Lv.{lv}] 持有上限增加 {carry}（最終形態/無進化型態無速度縮短）。',
      '[Ribbon Lv.{lv}] Carry capacity increased by {carry} (fully evolved/single-stage, no speed reduction).'
    ],
    'lab.c_pro_ribbon_carry': [
      '[睡飽飽獎章 Lv.{lv}] 持有上限增加 {carry}。',
      '[Ribbon Lv.{lv}] Carry capacity increased by {carry}.'
    ],
    'lab.c_pro_ing_aaa': [
      '具備極品純色 AAA 食材配置，特定食材產量高度集中，為頂級食材專精配置。',
      'Pure mono-ingredient (AAA) configuration, maximizing targeted ingredient yield for top recipes.'
    ],
    'lab.c_pro_ing_abb': [
      '具備強勢 ABB 雙色食材配置，二階與三階食材量產能力卓越。',
      'Dual-ingredient (ABB) configuration, excellent mid-to-late game specialized output.'
    ],
    'lab.c_con_ing_abc': [
      '[-] 三格食材分散 (ABC 雜菜配置)，產出種類嚴重稀釋難以穩定供應主力食譜，評級上限受限於A級。',
      '[-] Split-ingredient (ABC) configuration, recipe ingredient dilution caps overall potential.'
    ],
    'lab.c_pro_inventory_up': [
      '具備已解鎖「持有上限提升」，大幅延長離線/睡眠產出時間，避免背包溢滿阻斷食材與技能。',
      'Active Inventory Up subskill prevents overnight inventory capping, sustaining ingredient and skill production.'
    ],
    'lab.c_pro_berry_burst_no_bfs': [
      '樹果遽增戰略型：主技能發動直接為卡比獸爆發樹果能量（並隨機獲取隊友樹果）；果實纍纍樹果週享有 1.4 倍加成！',
      'Berry Burst Specialist: Main skill detonates instant berry energy for Snorlax (and copies teammate berries); 1.4x boosted during Buncha Berries events.'
    ],
    'lab.c_pro_charge_no_bfs': [
      '高頻單兵充能直傷：正統純技能流派，全天穩定發動能量填充，無背包過早滿包阻斷技能之顧慮。',
      'High-Frequency Direct Charge: Pure skill build consistently fires Charge Strength throughout the day without inventory overflow risks.'
    ],
    'lab.c_pro_legendary': [
      '傳說/幻之寶可夢專屬機制：素質基礎高，在特定同屬性純色隊或領域戰術中具備無可替代的戰略地位。',
      'Legendary / Mythical Pokemon with signature mechanics, high base helping output and indispensable mono-type or domain tactical value.'
    ],
    'lab.c_pro_extra_tasty': [
      '料理大成功戰術手：疊加料理美味機率，專為週末大餐爆擊（數十萬能量突破）而生的高階戰術組件。',
      'Extra Tasty Specialist: Stacks dish critical success chance, tailor-made for exploding weekend master recipes.'
    ],
    'lab.c_pro_pot_expander': [
      '料理擴鍋戰術手：突破鍋子容量上限，烹調極限大菜（如彈跳咖哩烏龍麵、採蜜巧克力格子鬆餅等大型食譜）不可或缺的擴容手。',
      'Cooking Power Up Specialist: Expands pot capacity to cook limit-breaking high-tier recipes.'
    ],
    'lab.c_pro_dream_shard': [
      '夢之碎片收割手：高效獲取夢之碎片，為糖果強化週與後期高昂養成成本提供源源不絕的資金。',
      'Dream Shard Farmer: High shard acquisition yield, essential for Candy Boost weeks and late-game leveling.'
    ],
    'lab.c_pro_ing_skill': [
      '應急食材庫存手：能高頻補充隨機食材庫存，化解大菜料理缺料危機。',
      'Ingredient Stockpile Specialist: Rapidly restocks ingredient inventory to resolve cooking shortages.'
    ],
    'lab.c_pro_metronome': [
      '隨機揮指戰術手：能隨機發動全遊戲主技能，具備極高趣味性與驚喜爆發上限。',
      'Metronome Specialist: Triggers unpredictable random skills with unmatched fun and high lucky ceilings.'
    ],
    'lab.c_pro_basic_fallback': [
      '數值平庸，適合作為過渡期日常隊伍替補成員。',
      'Basic stats, suitable as a temporary placeholder.'
    ],

    // lab_compare.js
    'lab.c_fmt_min_sec': ['{m}分{s}秒', '{m}m {s}s'],
    'lab.c_fmt_min_only': ['{m}分', '{m}m'],
    'lab.c_cmp_register_first': ['請先在寶可夢倉庫新增寶可夢後再來對比！', 'Please register Pokémon in Box first'],
    'lab.c_cmp_player_label': ['選手 {letter}', 'Player {letter}'],
    'lab.c_cmp_unit_ing_day': ['顆/日', 'items/day'],
    'lab.c_cmp_pick_player': ['挑選選手 {letter}', 'Pick Player {letter}'],
    'lab.c_cmp_tap_pick': ['點選挑選', 'Tap to pick'],
    'lab.c_cmp_remove': ['移除', 'Remove'],
    'lab.c_cmp_tap_change': ['點選更換', 'Tap to change'],
    'lab.c_cmp_selected_hint': [
      '已選 {n}/{max} 位選手，點選卡片可更換寶可夢（最多3位，不可重複選擇同一隻）',
      'Selected {n}/{max}. Tap a slot to change Pokémon (max 3, no duplicates).'
    ],
    'lab.c_cmp_clear_all': ['清空對比', 'Clear All'],
    'lab.c_cmp_box_lv': ['各自等級', 'Box Lv'],
    'lab.c_cmp_box_lv_title': ['使用每隻寶可夢各自倉儲等級', "Use each Pokemon's box level"],
    'lab.c_cmp_desc_cap': ['目前遊戲等級上限', 'Current in-game maximum level cap'],
    'lab.c_cmp_desc_lv30': ['解鎖第2食材', 'Unlocks 2nd ingredient'],
    'lab.c_cmp_desc_lv50': ['解鎖第3副技能', 'Unlocks 3rd sub-skill'],
    'lab.c_cmp_desc_lv60_cap': ['解鎖第3食材 / 目前遊戲等級上限', 'Unlocks 3rd ingredient & Current in-game maximum level cap'],
    'lab.c_cmp_desc_lv60': ['解鎖第3食材', 'Unlocks 3rd ingredient'],
    'lab.c_cmp_desc_lv80': ['解鎖第4副技能 (模擬)', 'Unlocks 4th sub-skill (Sim)'],
    'lab.c_cmp_desc_max': ['五階滿等畢業 (全開模擬)', 'Max level graduation with all 5 sub-skills'],
    'lab.c_cmp_desc_sim': ['模擬等級', 'Simulation Level'],
    'lab.c_cmp_desc_milestone': ['里程碑等級', 'Milestone'],
    'lab.c_cmp_bench_title': ['Lv.{lv}：{desc}', 'Lv.{lv}: {desc}'],
    'lab.c_cmp_benchmark_label': ['基準等級:', 'Benchmark Level:'],
    'lab.c_cmp_energy_title': ['每日預估總能量比較', 'Daily Total Energy Output'],
    'lab.c_cmp_energy_empty': ['請在上方挑選至少 2 位選手進行每日預估總能量比較', 'Select at least 2 Pokémon above to compare estimated daily energy output.'],
    'lab.c_cmp_ing_title': ['每日食材產量比較', 'Daily Ingredient Yield Comparison'],
    'lab.c_cmp_ing_empty': ['請在上方挑選至少 2 位選手進行每日食材產量比較', 'Select at least 2 Pokémon above to compare ingredient yields.'],
    'lab.c_cmp_skills_title': ['技能發動與幫手效能對照', 'Skill Procs, Speed & Specs'],
    'lab.c_cmp_skills_empty': ['請在上方挑選至少 2 位選手進行技能發動與幫手效能對照', 'Select at least 2 Pokémon above to compare skill procs and helper speed.'],
    'lab.c_cmp_tie': ['持平', 'Tie'],
    'lab.c_cmp_leads': ['領先', 'Leads'],
    'lab.c_cmp_total_energy': ['每日總能量產出', 'Est. Total Energy'],
    'lab.c_cmp_berry_power': ['樹果強度能量', 'Berry Power'],
    'lab.c_cmp_ing_power': ['食材產出能量', 'Ingredient Power'],
    'lab.c_cmp_skill_procs_day': ['主技能期望次數', 'Skill Procs / Day'],
    'lab.c_cmp_val_per_day': ['{v} 次/日', '{v} /day'],
    'lab.c_cmp_val_helps_day': ['{v} 次', '{v} /day'],
    'lab.c_cmp_val_procs_day': ['~{v} 次', '~{v} /day'],
    'lab.c_cmp_help_interval': ['幫手週期間隔', 'Help Interval'],
    'lab.c_cmp_composite_tier': ['綜合戰力評價', 'Composite Tier'],
    'lab.c_cmp_pts_unit': ['分', ' pts'],
    'lab.c_cmp_sixdim_title': ['六維綜合戰力評定對照', '6-Dimension Evaluation Matrix'],
    'lab.c_cmp_berry_energy': ['樹果能量', 'Berry Energy'],
    'lab.c_cmp_ing_energy': ['食材能量', 'Ingredient Energy'],
    'lab.c_cmp_skill_energy': ['主技能能量', 'Skill Energy (Est)'],
    'lab.c_cmp_subskill_locked_title': ['當前等級未解鎖', 'Locked at this level'],
    'lab.c_cmp_subskill_locked_tag': [' [鎖]', ' [Locked]'],
    'lab.c_cmp_nature_build': ['性格配置', 'Nature'],
    'lab.c_cmp_minted': ['(薄荷中和)', '(Minted)'],
    'lab.c_cmp_build_title': ['副技能與性格配置橫向對照', 'Subskills & Nature Build Matchup'],
    'lab.c_cmp_no_ing_unlocked': ['目前均無解鎖之食材', 'No ingredients unlocked yet'],
    'lab.c_cmp_exclusive': ['獨佔', 'Exclusive'],
    'lab.c_cmp_per_ing_caption': ['各食材總和產量對照（不同食材獨立比較）：', 'Per-ingredient total yield (each ingredient compared separately):'],
    'lab.c_cmp_level': ['等級', 'Level'],
    'lab.c_cmp_help_period': ['幫手週期', 'Help Interval'],
    'lab.c_cmp_daily_helps': ['每日幫手次數', 'Daily Helps'],
    'lab.c_cmp_ing_rate': ['食材掉落率', 'Ingredient Rate'],
    'lab.c_cmp_berries_day': ['每日樹果數量', 'Berries / Day'],
    'lab.c_cmp_energy_berry': ['單顆樹果能量', 'Energy / Berry'],
    'lab.c_cmp_main_skill': ['主技能', 'Main Skill'],
    'lab.c_cmp_skill_proc_rate': ['技能發動率', 'Skill Proc Rate'],
    'lab.c_cmp_skill_procs_day_row': ['技能每日發動次數', 'Skill Procs / Day'],
    'lab.c_cmp_avg_proc_interval': ['技能平均發動間隔', 'Avg Proc Interval'],
    'lab.c_cmp_hours': ['{v} 小時', '{v} h'],
    'lab.c_cmp_skill_energy_day': ['主技能每日能量', 'Skill Energy / Day'],
    'lab.c_cmp_nature': ['性格', 'Nature'],
    'lab.c_cmp_mint_suffix': [' (薄荷)', ' (Mint)'],
    'lab.c_cmp_verdict_energy': ['【{player}】每日總能量最高 ({val})，適合衝島嶼分數。', '{player} has the highest daily energy ({val}).'],
    'lab.c_cmp_verdict_ing': ['【{player}】食材產量最高 ({val} {unit})，適合支撐大鍋料理。', '{player} yields the most ingredients ({val} {unit}).'],
    'lab.c_cmp_verdict_skill': ['【{player}】主技能發動最頻繁 (約 {val} 次/日)。', '{player} procs its main skill most often (~{val}/day).'],
    'lab.c_cmp_verdict_sep': ['', ' '],
    'lab.c_cmp_verdict_even': ['所選寶可夢各項表現旗鼓相當，可依營地喜愛樹果與預備料理自行調配。', 'All selected Pokémon are evenly matched.'],
    'lab.c_cmp_verdict_title': ['深度研究室對比結論與培育建議', 'Research Lab Comparative Verdict & Advice'],

    // lab_growth.js
    'lab.c_growth_none': ['無', 'None'],
    'lab.c_growth_no_skill_data': ['暫無主技能資訊。', 'No main skill data.'],
    'lab.c_growth_main_skill': ['主技能', 'Main Skill'],
    'lab.c_growth_roi_debuff': [
      '性格減主技能發動機率，嚴重壓低發動期望值，強烈不建議投資金種子。',
      'Skill Trigger Down nature severely cripples activation frequency. Gold seed investment is not recommended.'
    ],
    'lab.c_growth_roi_healer_s': [
      '極品高頻補師！滿級主技能單次回復全隊18點活力，全天維持極速產能，值得最高優先級投資金種子。',
      'Elite team healer with high proc frequency! Maxing main skill sustains full team energy throughout the day.'
    ],
    'lab.c_growth_roi_healer_a': [
      '隊伍核心補師，升滿主技能能大幅提升全隊續航力，投資性價比極高。',
      'Core team healer. High investment value to maintain team energy stability.'
    ],
    'lab.c_growth_roi_skill_s': [
      '極限發動率頂級技能手！副技能與性格高度契合，滿等主技能產能爆發極高，強烈推薦投資。',
      'Top-tier skill specialist with extreme trigger rates! Gold seeds unleash maximum potential.'
    ],
    'lab.c_growth_roi_skill_a': [
      '具備良好技能加成，作為主力隊員時投資金種子效益顯著。',
      'Solid skill specialist. Recommended investment if this Pokemon is a key roster member.'
    ],
    'lab.c_growth_roi_skill_b': [
      '發動頻率普通，建議優先將金種子保留給核心補師或頂級神獸。',
      'Moderate trigger rate. Consider investing only after core healers are maxed.'
    ],
    'lab.c_growth_roi_high_impact': [
      '實用戰術型技能，在主力隊伍成型後可酌量升級，優先級次於技能專長型。',
      'Support utility skill. Can be upgraded if resources permit, but lower priority than skill specialists.'
    ],
    'lab.c_growth_roi_other': [
      '非技能專長個體，主技能升級收益有限，建議保留金種子給專長寶可夢。',
      'Berry/Ingredient specialist. Skill leveling grants marginal returns; save seeds for dedicated specialists.'
    ],
    'lab.c_growth_curve_pseudo': ['準神 (1.5倍)', 'Pseudo-Legendary (1.5x)'],
    'lab.c_growth_curve_legendary': ['神獸 (1.8倍)', 'Legendary (1.8x)'],
    'lab.c_growth_curve_mythical': ['特殊神獸 (3.0倍)', 'Mythical/Special (3.0x)'],
    'lab.c_growth_curve_standard': ['一般 (1.0倍)', 'Standard (1.0x)'],
    'lab.c_growth_exp_up': ['經驗提升 (+18%)', 'EXP Up (+18%)'],
    'lab.c_growth_exp_down': ['經驗下降 (-18%)', 'EXP Down (-18%)'],
    'lab.c_growth_exp_neutral': ['無修正', 'Neutral'],
    'lab.c_growth_change_pkm': ['更換寶可夢', 'Change Pokémon'],
    'lab.c_growth_calc_title': ['培育升級消耗精算', 'Level & Resource Calculator'],
    'lab.c_growth_from_level': ['起始等級', 'Current Level'],
    'lab.c_growth_target_level': ['目標等級', 'Target Level'],
    'lab.c_growth_req_candies': ['所需寶可夢糖果', 'Required Candies'],
    'lab.c_growth_exp_per_candy': ['({exp} EXP/顆)', '({exp} EXP/ea)'],
    'lab.c_growth_req_shards': ['所需夢之碎片', 'Required Dream Shards'],
    'lab.c_growth_req_exp': ['所需經驗值累計 (EXP)', 'Cumulative Experience'],
    'lab.c_growth_handy_s': ['萬能糖果 S (+3)', 'Handy Candy S (+3)'],
    'lab.c_growth_handy_m': ['萬能糖果 M (+20)', 'Handy Candy M (+20)'],
    'lab.c_growth_handy_l': ['萬能糖果 L (+100)', 'Handy Candy L (+100)'],
    'lab.c_growth_pcs': ['{count} 顆', '{count} pcs'],
    'lab.c_growth_seed_roi_title': ['技能種子投資效益精算', 'Skill Seeds ROI & Upgrade Analysis'],
    'lab.c_growth_sub_seed': ['銀色技能種子', 'Sub Skill Seed'],
    'lab.c_growth_sub_seed_badge': ['副技能升階', 'Sub-Skills'],
    'lab.c_growth_no_sub_upgrades': [
      '無可使用銀色技能種子之副技能（已達上限或無階梯技能）',
      'No eligible sub-skills for Sub Skill Seed (already max tier or no ladder skills).'
    ],
    'lab.c_growth_main_seed': ['金色技能種子', 'Main Skill Seed'],
    'lab.c_growth_main_seed_badge': ['主技能突破', 'Main Skill'],
    'lab.c_growth_roi_rating': ['性價比評級：{grade}', 'ROI Rating: {grade}'],
    'lab.c_growth_cur_to_max': ['當前等級 -> 上限', 'Current Level -> Max'],
    'lab.c_growth_seeds_needed': ['升滿所需金種子', 'Seeds Needed to Max'],
    'lab.c_growth_seeds_unit': ['{count} 顆', '{count} Seeds']
  });
