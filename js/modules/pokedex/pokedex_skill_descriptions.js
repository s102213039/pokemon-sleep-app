/* ─── 特殊主技能官方詳細說明字典 (Special Main Skill Official In-Game Descriptions) ─ */
const SPECIAL_SKILL_DETAILS = {
  // === 真正複合主技能 (True Composite Skills) ===
  '健美': {
    'zh-TW': '同時發動「食材獲取S」與「料理成功S」兩種效果：隨機獲得多個食材（4~11個），並提升下次料理漂亮成功（大成功）的機率（+1%~+5%）。',
    'en-US': 'Combines Ingredient Magnet S and Tasty Chance S: gets 4~11 random ingredients and raises Extra Tasty rate of the next dish (+1%~+5%).'
  },
  '健美（料理輔助S）': {
    'zh-TW': '同時發動「食材獲取S」與「料理成功S」兩種效果：隨機獲得多個食材（4~11個），並提升下次料理漂亮成功（大成功）的機率（+1%~+5%）。',
    'en-US': 'Combines Ingredient Magnet S and Tasty Chance S: gets 4~11 random ingredients and raises Extra Tasty rate of the next dish (+1%~+5%).'
  },
  '健美 (料理輔助S)': {
    'zh-TW': '同時發動「食材獲取S」與「料理成功S」兩種效果：隨機獲得多個食材（4~11個），並提升下次料理漂亮成功（大成功）的機率（+1%~+5%）。',
    'en-US': 'Combines Ingredient Magnet S and Tasty Chance S: gets 4~11 random ingredients and raises Extra Tasty rate of the next dish (+1%~+5%).'
  },
  '魔法火焰': {
    'zh-TW': '同時發動「料理強化S」與「料理成功S」兩種效果：擴大下次料理時鍋子的容量上限（7~31個），並提升下次料理漂亮成功（大成功）的機率（+1%~+5%）。已提升的機率在料理漂亮成功或移動營地後重置。',
    'en-US': 'Combines Cooking Power-Up S and Tasty Chance S: expands cooking pot size (+7~31) and raises Extra Tasty rate of the next dish (+1%~+5%). Rate resets upon Extra Tasty or changing campsites.'
  },
  '魔法火焰（料理躍進S）': {
    'zh-TW': '同時發動「料理強化S」與「料理成功S」兩種效果：擴大下次料理時鍋子的容量上限（7~31個），並提升下次料理漂亮成功（大成功）的機率（+1%~+5%）。已提升的機率在料理漂亮成功或移動營地後重置。',
    'en-US': 'Combines Cooking Power-Up S and Tasty Chance S: expands cooking pot size (+7~31) and raises Extra Tasty rate of the next dish (+1%~+5%). Rate resets upon Extra Tasty or changing campsites.'
  },
  '魔法火焰 (料理躍進S)': {
    'zh-TW': '同時發動「料理強化S」與「料理成功S」兩種效果：擴大下次料理時鍋子的容量上限（7~31個），並提升下次料理漂亮成功（大成功）的機率（+1%~+5%）。已提升的機率在料理漂亮成功或移動營地後重置。',
    'en-US': 'Combines Cooking Power-Up S and Tasty Chance S: expands cooking pot size (+7~31) and raises Extra Tasty rate of the next dish (+1%~+5%). Rate resets upon Extra Tasty or changing campsites.'
  },
  '月光': {
    'zh-TW': '讓自己回復活力（12~43點）；若發生「漂亮成功」時，額外隨機讓隊伍中的 1 隻寶可夢回復活力（6~22點）。',
    'en-US': 'Restores energy to self (12~43 pts). On Extra Tasty triggers, also restores energy to a random teammate (6~22 pts).'
  },
  '月光（活力充填S）': {
    'zh-TW': '讓自己回復活力（12~43點）；若發生「漂亮成功」時，額外隨機讓隊伍中的 1 隻寶可夢回復活力（6~22點）。',
    'en-US': 'Restores energy to self (12~43 pts). On Extra Tasty triggers, also restores energy to a random teammate (6~22 pts).'
  },
  '月光 (活力充填S)': {
    'zh-TW': '讓自己回復活力（12~43點）；若發生「漂亮成功」時，額外隨機讓隊伍中的 1 隻寶可夢回復活力（6~22點）。',
    'en-US': 'Restores energy to self (12~43 pts). On Extra Tasty triggers, also restores energy to a random teammate (6~22 pts).'
  },
  '月光（活力填充S）': {
    'zh-TW': '讓自己回復活力（12~43點）；若發生「漂亮成功」時，額外隨機讓隊伍中的 1 隻寶可夢回復活力（6~22點）。',
    'en-US': 'Restores energy to self (12~43 pts). On Extra Tasty triggers, also restores energy to a random teammate (6~22 pts).'
  },
  '月光 (活力填充S)': {
    'zh-TW': '讓自己回復活力（12~43點）；若發生「漂亮成功」時，額外隨機讓隊伍中的 1 隻寶可夢回復活力（6~22點）。',
    'en-US': 'Restores energy to self (12~43 pts). On Extra Tasty triggers, also restores energy to a random teammate (6~22 pts).'
  },
  '樹果汁': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（5~18點），同時有機會額外獲得可讓單隻寶可夢回復 20 活力的「樹果汁」道具（最多持有 5 個）。',
    'en-US': 'Restores energy to all teammates (5~18 pts), with a chance to obtain Berry Juice items (restores 20 energy, max 5).'
  },
  '樹果汁（活力全體療癒S）': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（5~18點），同時有機會額外獲得可讓單隻寶可夢回復 20 活力的「樹果汁」道具（最多持有 5 個）。',
    'en-US': 'Restores energy to all teammates (5~18 pts), with a chance to obtain Berry Juice items (restores 20 energy, max 5).'
  },
  '樹果汁 (活力全體療癒S)': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（5~18點），同時有機會額外獲得可讓單隻寶可夢回復 20 活力的「樹果汁」道具（最多持有 5 個）。',
    'en-US': 'Restores energy to all teammates (5~18 pts), with a chance to obtain Berry Juice items (restores 20 energy, max 5).'
  },

  // === 專屬命名與變體主技能 (Named Variant Skills) ===
  '正電': {
    'zh-TW': '隨機獲得食材（5~18個）；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，則發動時額外獲得 6~14 個食材。',
    'en-US': 'Randomly obtains 5~18 ingredients. Obtains +6~14 bonus ingredients if teammates have Plus or Minus skills.'
  },
  '正電（食材獲取S）': {
    'zh-TW': '隨機獲得食材（5~18個）；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，則發動時額外獲得 6~14 個食材。',
    'en-US': 'Randomly obtains 5~18 ingredients. Obtains +6~14 bonus ingredients if teammates have Plus or Minus skills.'
  },
  '正電 (食材獲取S)': {
    'zh-TW': '隨機獲得食材（5~18個）；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，則發動時額外獲得 6~14 個食材。',
    'en-US': 'Randomly obtains 5~18 ingredients. Obtains +6~14 bonus ingredients if teammates have Plus or Minus skills.'
  },
  '負電': {
    'zh-TW': '擴大下次料理時鍋子的容量上限（5~24個）；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，發動時額外隨機讓隊伍中 1 隻寶可夢回復活力（8~35點）。',
    'en-US': 'Expands cooking pot size (+5~24). If teammates have Plus or Minus, also restores 8~35 energy to a random teammate.'
  },
  '負電（料理強化S）': {
    'zh-TW': '擴大下次料理時鍋子的容量上限（5~24個）；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，發動時額外隨機讓隊伍中 1 隻寶可夢回復活力（8~35點）。',
    'en-US': 'Expands cooking pot size (+5~24). If teammates have Plus or Minus, also restores 8~35 energy to a random teammate.'
  },
  '負電 (料理強化S)': {
    'zh-TW': '擴大下次料理時鍋子的容量上限（5~24個）；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，發動時額外隨機讓隊伍中 1 隻寶可夢回復活力（8~35點）。',
    'en-US': 'Expands cooking pot size (+5~24). If teammates have Plus or Minus, also restores 8~35 energy to a random teammate.'
  },
  '禮物': {
    'zh-TW': '隨機獲得食材（4~17個）；有時除了食材之外，還會額外隨機獲得隊伍中 1 隻寶可夢的 4 顆糖果。',
    'en-US': 'Randomly obtains 4~17 ingredients, and occasionally grants 4 candies for a random team member.'
  },
  '禮物（食材獲取S）': {
    'zh-TW': '隨機獲得食材（4~17個）；有時除了食材之外，還會額外隨機獲得隊伍中 1 隻寶可夢的 4 顆糖果。',
    'en-US': 'Randomly obtains 4~17 ingredients, and occasionally grants 4 candies for a random team member.'
  },
  '禮物 (食材獲取S)': {
    'zh-TW': '隨機獲得食材（4~17個）；有時除了食材之外，還會額外隨機獲得隊伍中 1 隻寶可夢的 4 顆糖果。',
    'en-US': 'Randomly obtains 4~17 ingredients, and occasionally grants 4 candies for a random team member.'
  },
  '食材精選S': {
    'zh-TW': '從發動寶可夢專屬的特定食材候選池中，隨機獲得其中 1 種食材（單一食材獲取量為 5~18 個）。',
    'en-US': 'Gets 1 ingredient type exclusively from this Pokémon\'s specific candidate pool (5~18 of a single ingredient).'
  },
  '超幸運': {
    'zh-TW': '從特定食材 (咖啡豆、大豆、豆肉、蘑菇) 中隨機獲得 1 種食材 (5~18個); 少數情況下暴擊獲得大量夢之碎片代替食材 (暴擊時最高達 20,000 碎片)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Coffee, Soybean, Sausage, Mushroom; 5~18 items); rarely crits for massive Dream Shards instead (up to 20,000).'
  },
  '超幸運（食材精選S）': {
    'zh-TW': '從特定食材 (咖啡豆、大豆、豆肉、蘑菇) 中隨機獲得 1 種食材 (5~18個); 少數情況下暴擊獲得大量夢之碎片代替食材 (暴擊時最高達 20,000 碎片)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Coffee, Soybean, Sausage, Mushroom; 5~18 items); rarely crits for massive Dream Shards instead (up to 20,000).'
  },
  '超幸運 (食材精選S)': {
    'zh-TW': '從特定食材 (咖啡豆、大豆、豆肉、蘑菇) 中隨機獲得 1 種食材 (5~18個); 少數情況下暴擊獲得大量夢之碎片代替食材 (暴擊時最高達 20,000 碎片)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Coffee, Soybean, Sausage, Mushroom; 5~18 items); rarely crits for massive Dream Shards instead (up to 20,000).'
  },
  '怪力鉗': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力钳': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力鉗（食材精選S）': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力鉗 (食材精選S)': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力钳（食材精選S）': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力钳 (食材精選S)': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '新月祈禱': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（3~11點），並額外獲得隊伍中所有寶可夢撿來的樹果（超能力屬性隊員越多，樹果數量越多）。',
    'en-US': 'Restores energy to all teammates (3~11 pts) and gathers berries from them (more berries with more Psychic types).'
  },
  '新月祈禱（活力全體療癒S）': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（3~11點），並額外獲得隊伍中所有寶可夢撿來的樹果（超能力屬性隊員越多，樹果數量越多）。',
    'en-US': 'Restores energy to all teammates (3~11 pts) and gathers berries from them (more berries with more Psychic types).'
  },
  '新月祈禱 (活力全體療癒S)': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（3~11點），並額外獲得隊伍中所有寶可夢撿來的樹果（超能力屬性隊員越多，樹果數量越多）。',
    'en-US': 'Restores energy to all teammates (3~11 pts) and gathers berries from them (more berries with more Psychic types).'
  },
  '治癒波動': {
    'zh-TW': '隨機讓隊伍中的 2 隻寶可夢回復活力（6~22點），並讓牠們立刻完成 1~4 次幫忙（若隊伍中有拉帝歐斯，立即幫忙次數增加）。',
    'en-US': 'Restores energy to 2 teammates (6~22 pts) and instantly performs 1~4 helps (more helps if Latios is on team).'
  },
  '治癒波動（活力療癒S）': {
    'zh-TW': '隨機讓隊伍中的 2 隻寶可夢回復活力（6~22點），並讓牠們立刻完成 1~4 次幫忙（若隊伍中有拉帝歐斯，立即幫忙次數增加）。',
    'en-US': 'Restores energy to 2 teammates (6~22 pts) and instantly performs 1~4 helps (more helps if Latios is on team).'
  },
  '治癒波動 (活力療癒S)': {
    'zh-TW': '隨機讓隊伍中的 2 隻寶可夢回復活力（6~22點），並讓牠們立刻完成 1~4 次幫忙（若隊伍中有拉帝歐斯，立即幫忙次數增加）。',
    'en-US': 'Restores energy to 2 teammates (6~22 pts) and instantly performs 1~4 helps (more helps if Latios is on team).'
  },
  '蹭蹭臉頰': {
    'zh-TW': '隨機讓隊伍中的 1 隻寶可夢回復活力（9~35點）；幸運時該寶可夢還會獲得「主技能發動獎勵」，可額外多發動 1 次主技能。',
    'en-US': 'Restores energy to a teammate (9~35 pts); when lucky, grants a bonus main skill trigger to that Pokémon.'
  },
  '蹭蹭臉頰（活力療癒S）': {
    'zh-TW': '隨機讓隊伍中的 1 隻寶可夢回復活力（9~35點）；幸運時該寶可夢還會獲得「主技能發動獎勵」，可額外多發動 1 次主技能。',
    'en-US': 'Restores energy to a teammate (9~35 pts); when lucky, grants a bonus main skill trigger to that Pokémon.'
  },
  '蹭蹭臉頰 (活力療癒S)': {
    'zh-TW': '隨機讓隊伍中的 1 隻寶可夢回復活力（9~35點）；幸運時該寶可夢還會獲得「主技能發動獎勵」，可額外多發動 1 次主技能。',
    'en-US': 'Restores energy to a teammate (9~35 pts); when lucky, grants a bonus main skill trigger to that Pokémon.'
  },
  '蓄力': {
    'zh-TW': '隨機發動「蓄積」或「噴放」；連續蓄積次數越多，噴放時為卡比獸增加的能量就越多（最高達 90,940 能量）。',
    'en-US': 'Stockpiles or spits energy; more consecutive stockpiles result in greater Snorlax Strength gained (up to 90,940).'
  },
  '蓄力（能量填充S）': {
    'zh-TW': '隨機發動「蓄積」或「噴放」；連續蓄積次數越多，噴放時為卡比獸增加的能量就越多（最高達 90,940 能量）。',
    'en-US': 'Stockpiles or spits energy; more consecutive stockpiles result in greater Snorlax Strength gained (up to 90,940).'
  },
  '蓄力 (能量填充S)': {
    'zh-TW': '隨機發動「蓄積」或「噴放」；連續蓄積次數越多，噴放時為卡比獸增加的能量就越多（最高達 90,940 能量）。',
    'en-US': 'Stockpiles or spits energy; more consecutive stockpiles result in greater Snorlax Strength gained (up to 90,940).'
  },
  '夢魘': {
    'zh-TW': '固定增加大量卡比獸能量（2,640~18,515能量）；發動時會降低隊伍中「惡屬性以外」寶可夢的活力 12 點。',
    'en-US': 'Significantly increases Snorlax Strength (2,640~18,515), but reduces energy of non-Dark type teammates by 12.'
  },
  '夢魘（能量填充M）': {
    'zh-TW': '固定增加大量卡比獸能量（2,640~18,515能量）；發動時會降低隊伍中「惡屬性以外」寶可夢的活力 12 點。',
    'en-US': 'Significantly increases Snorlax Strength (2,640~18,515), but reduces energy of non-Dark type teammates by 12.'
  },
  '夢魘 (能量填充M)': {
    'zh-TW': '固定增加大量卡比獸能量（2,640~18,515能量）；發動時會降低隊伍中「惡屬性以外」寶可夢的活力 12 點。',
    'en-US': 'Significantly increases Snorlax Strength (2,640~18,515), but reduces energy of non-Dark type teammates by 12.'
  },
  '精神擊破': {
    'zh-TW': '增加卡比獸能量（2,640~13,638點），並在營地展開「樹果領域」，期間透過芒芒果（超能力屬性）獲得的能量提升。',
    'en-US': 'Increases Strength (2,640~13,638) and deploys a Berry Field, boosting energy gained from Mago Berries.'
  },
  '精神擊破（樹果領域）': {
    'zh-TW': '增加卡比獸能量（2,640~13,638點），並在營地展開「樹果領域」，期間透過芒芒果（超能力屬性）獲得的能量提升。',
    'en-US': 'Increases Strength (2,640~13,638) and deploys a Berry Field, boosting energy gained from Mago Berries.'
  },
  '精神擊破 (樹果領域)': {
    'zh-TW': '增加卡比獸能量（2,640~13,638點），並在營地展開「樹果領域」，期間透過芒芒果（超能力屬性）獲得的能量提升。',
    'en-US': 'Increases Strength (2,640~13,638) and deploys a Berry Field, boosting energy gained from Mago Berries.'
  },
  '流星群': {
    'zh-TW': '獲得自己以及隊伍中寶可夢撿來的樹果（12~48顆，龍屬性隊員越多數量越多；若隊伍中有拉帝亞斯數量進一步增加）。',
    'en-US': 'Gathers berries from self and teammates (12~48 berries; scales with Dragon types, increased if Latias is in party).'
  },
  '流星群（樹果遽增）': {
    'zh-TW': '獲得自己以及隊伍中寶可夢撿來的樹果（12~48顆，龍屬性隊員越多數量越多；若隊伍中有拉帝亞斯數量進一步增加）。',
    'en-US': 'Gathers berries from self and teammates (12~48 berries; scales with Dragon types, increased if Latias is in party).'
  },
  '流星群 (樹果遽增)': {
    'zh-TW': '獲得自己以及隊伍中寶可夢撿來的樹果（12~48顆，龍屬性隊員越多數量越多；若隊伍中有拉帝亞斯數量進一步增加）。',
    'en-US': 'Gathers berries from self and teammates (12~48 berries; scales with Dragon types, increased if Latias is in party).'
  },
  '畫皮': {
    'zh-TW': '獲得一定數量的樹果（8~21顆），並額外獲得隊伍中寶可夢撿來的樹果；少數情況下會發生「漂亮成功」獲得 3 倍樹果。',
    'en-US': 'Gathers berries from self and teammates (8~21 berries); rarely triggers Extra Tasty for 3x berries.'
  },
  '畫皮（樹果遽增）': {
    'zh-TW': '獲得一定數量的樹果（8~21顆），並額外獲得隊伍中寶可夢撿來的樹果；少數情況下會發生「漂亮成功」獲得 3 倍樹果。',
    'en-US': 'Gathers berries from self and teammates (8~21 berries); rarely triggers Extra Tasty for 3x berries.'
  },
  '畫皮 (樹果遽增)': {
    'zh-TW': '獲得一定數量的樹果（8~21顆），並額外獲得隊伍中寶可夢撿來的樹果；少數情況下會發生「漂亮成功」獲得 3 倍樹果。',
    'en-US': 'Gathers berries from self and teammates (8~21 berries); rarely triggers Extra Tasty for 3x berries.'
  },
  '樹果遽增?': {
    'zh-TW': '揮舞巨錘爆發產出自身大量樹果。',
    'en-US': 'Swings a massive hammer to burst a large amount of own berries.'
  },
  '波導彈': {
    'zh-TW': '獲得夢之碎片（240~2,500個），並同時增加卡比獸能量（200~2,042點）。',
    'en-US': 'Gathers 240~2,500 Dream Shards while simultaneously increasing Snorlax Strength by 200~2,042.'
  },
  '波導彈（夢之碎片獲取S）': {
    'zh-TW': '獲得夢之碎片（240~2,500個），並同時增加卡比獸能量（200~2,042點）。',
    'en-US': 'Gathers 240~2,500 Dream Shards while simultaneously increasing Snorlax Strength by 200~2,042.'
  },
  '波導彈 (夢之碎片獲取S)': {
    'zh-TW': '獲得夢之碎片（240~2,500個），並同時增加卡比獸能量（200~2,042點）。',
    'en-US': 'Gathers 240~2,500 Dream Shards while simultaneously increasing Snorlax Strength by 200~2,042.'
  },
  '幫手加速（電）': {
    'zh-TW': '立即獲得隊伍中所有電屬性幫手寶可夢數次幫忙產出（隊伍中電屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Electric helpers on the team (scales with number of distinct Electric species).'
  },
  '幫手加速 (電)': {
    'zh-TW': '立即獲得隊伍中所有電屬性幫手寶可夢數次幫忙產出（隊伍中電屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Electric helpers on the team (scales with number of distinct Electric species).'
  },
  '幫手加速（火）': {
    'zh-TW': '立即獲得隊伍中所有火屬性幫手寶可夢數次幫忙產出（隊伍中火屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Fire helpers on the team (scales with number of distinct Fire species).'
  },
  '幫手加速 (火)': {
    'zh-TW': '立即獲得隊伍中所有火屬性幫手寶可夢數次幫忙產出（隊伍中火屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Fire helpers on the team (scales with number of distinct Fire species).'
  },
  '幫手加速（水）': {
    'zh-TW': '立即獲得隊伍中所有水屬性幫手寶可夢數次幫忙產出（隊伍中水屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Water helpers on the team (scales with number of distinct Water species).'
  },
  '幫手加速 (水)': {
    'zh-TW': '立即獲得隊伍中所有水屬性幫手寶可夢數次幫忙產出（隊伍中水屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Water helpers on the team (scales with number of distinct Water species).'
  },
  '十項全能': {
    'zh-TW': '發動設置的主技能效果，並額外獲得隊伍中 1 隻寶可夢的糖果；可使用「靈感種子」自由切換學習到的主技能。',
    'en-US': 'Triggers equipped main skill and grants candy for a teammate; customizable via Inspiration Seeds.'
  },
  '十項全能（揮指）[可替換]': {
    'zh-TW': '發動設置的主技能效果，並額外獲得隊伍中 1 隻寶可夢的糖果；可使用「靈感種子」自由切換學習到的主技能。',
    'en-US': 'Triggers equipped main skill and grants candy for a teammate; customizable via Inspiration Seeds.'
  },
  '十項全能 (揮指) [可替換]': {
    'zh-TW': '發動設置的主技能效果，並額外獲得隊伍中 1 隻寶可夢的糖果；可使用「靈感種子」自由切換學習到的主技能。',
    'en-US': 'Triggers equipped main skill and grants candy for a teammate; customizable via Inspiration Seeds.'
  },
  '模仿': {
    'zh-TW': '隨機複製並發動隊伍中 1 隻隊友的主技能。',
    'en-US': 'Copies and triggers the main skill used by a random teammate.'
  },
  '模仿（技能複製）': {
    'zh-TW': '隨機複製並發動隊伍中 1 隻隊友的主技能。',
    'en-US': 'Copies and triggers the main skill used by a random teammate.'
  },
  '模仿 (技能複製)': {
    'zh-TW': '隨機複製並發動隊伍中 1 隻隊友的主技能。',
    'en-US': 'Copies and triggers the main skill used by a random teammate.'
  },
  '變身': {
    'zh-TW': '變身為隊友並隨機複製其技能產出與幫忙效果。',
    'en-US': 'Transforms into a teammate, copying its skill and helping effects.'
  },
  '變身（技能複製）': {
    'zh-TW': '變身為隊友並隨機複製其技能產出與幫忙效果。',
    'en-US': 'Transforms into a teammate, copying its skill and helping effects.'
  },
  '變身 (技能複製)': {
    'zh-TW': '變身為隊友並隨機複製其技能產出與幫忙效果。',
    'en-US': 'Transforms into a teammate, copying its skill and helping effects.'
  }
};

// === 標準基礎主技能說明 (Standard Base Skills) ===
const BASE_SKILL_DETAILS = {
  '能量填充S': {
    'zh-TW': '增加卡比獸的能量（固定數值 400~3,212 點）。',
    'en-US': 'Adds a fixed amount of Snorlax Strength (400~3,212 pts).'
  },
  '能量填充S（隨機）': {
    'zh-TW': '隨機增加卡比獸能量（在最小 200 ~ 最大 6,424 區間浮動）。',
    'en-US': 'Adds random Snorlax Strength within a range (200~6,424 pts).'
  },
  '能量填充S (隨機)': {
    'zh-TW': '隨機增加卡比獸能量（在最小 200 ~ 最大 6,424 區間浮動）。',
    'en-US': 'Adds random Snorlax Strength within a range (200~6,424 pts).'
  },
  '能量填充M': {
    'zh-TW': '大量增加卡比獸的能量（固定數值 880~6,409 點）。',
    'en-US': 'Adds a large fixed amount of Snorlax Strength (880~6,409 pts).'
  },
  '食材獲取S': {
    'zh-TW': '隨機獲得已解鎖的食材（全圖鑑已解鎖食材隨機抽選 6~24 個）。',
    'en-US': 'Gets a random assortment of all unlocked ingredients (6~24 ingredients).'
  },
  '料理強化S': {
    'zh-TW': '擴大下次料理時鍋子的容量上限（7~31個，最高累計至 200 個）。',
    'en-US': 'Expands pot capacity for next meal (+7~31, stacks up to 200 max).'
  },
  '料理成功S': {
    'zh-TW': '提升下次料理漂亮成功（大成功）機率（+4%~10%，最高累計至 70%，大成功後重設）。',
    'en-US': 'Raises Extra Tasty rate (+4%~10%, stacks up to 70% until Extra Tasty triggers).'
  },
  '活力充填S': {
    'zh-TW': '讓自身回復活力（12~43點）。',
    'en-US': 'Restores energy to self (12~43 pts).'
  },
  '活力填充S': {
    'zh-TW': '讓自身回復活力（12~43點）。',
    'en-US': 'Restores energy to self (12~43 pts).'
  },
  '活力療癒S': {
    'zh-TW': '隨機讓隊伍中的 1 隻隊友回復活力（12~44點，大幅優先鎖定當前活力最低的隊友）。',
    'en-US': 'Restores 12~44 energy to 1 random teammate (strongly favors lowest energy teammate).'
  },
  '活力全體療癒S': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（5~18點）。',
    'en-US': 'Restores energy to all teammates (5~18 pts).'
  },
  '幫手支援S': {
    'zh-TW': '隨機讓隊伍中的 1 隻隊友立刻完成 6~12 次幫忙。',
    'en-US': 'Instantly gets 6~12 helps from a random teammate.'
  },
  '幫手加速': {
    'zh-TW': '隊伍中同屬性寶可夢立刻完成數次幫忙（同屬性不同種類越多越強，最高 11 次）。',
    'en-US': 'All same-type allies instantly perform helps (scales with unique species, up to 11 helps).'
  },
  '樹果遽增': {
    'zh-TW': '獲得自身產出的樹果（11~30顆），並額外獲得隊友撿來的樹果（1~5顆）。',
    'en-US': 'Gathers extra berries from user (11~30) and allies (1~5).'
  },
  '夢之碎片獲取S': {
    'zh-TW': '獲得夢之碎片（固定數值 240~2,500 個）。',
    'en-US': 'Obtains a fixed amount of Dream Shards (240~2,500 shards).'
  },
  '夢之碎片獲取S（隨機）': {
    'zh-TW': '隨機獲得夢之碎片（在最小 120 ~ 最大 4,600 區間浮動）。',
    'en-US': 'Obtains random Dream Shards within a range (120~4,600 shards).'
  },
  '夢之碎片獲取S (隨機)': {
    'zh-TW': '隨機獲得夢之碎片（在最小 120 ~ 最大 4,600 區間浮動）。',
    'en-US': 'Obtains random Dream Shards within a range (120~4,600 shards).'
  },
  '揮指': {
    'zh-TW': '從主技能庫中隨機抽選 1 種發動。',
    'en-US': 'Randomly triggers a main skill from the game\'s pool.'
  }
};

function getSkillDescription(skillName) {
  if (!skillName) return '';
  const s = skillName;
  const raw = SPECIAL_SKILL_DETAILS[s] ||
              SPECIAL_SKILL_DETAILS[s.replace(/\(/g, '（').replace(/\)/g, '）')] ||
              SPECIAL_SKILL_DETAILS[s.replace(/（/g, '(').replace(/）/g, ')')] ||
              BASE_SKILL_DETAILS[s] ||
              BASE_SKILL_DETAILS[s.replace(/\(/g, '（').replace(/\)/g, '）')] ||
              BASE_SKILL_DETAILS[s.replace(/（/g, '(').replace(/）/g, ')')];
  if (!raw) return '';
  if (typeof raw === 'object') {
    return (typeof window !== 'undefined' && window.I18N && typeof window.I18N.pick === 'function')
      ? window.I18N.pick(raw)
      : (raw['zh-TW'] || '');
  }
  return (typeof window !== 'undefined' && window.I18N && typeof window.I18N.text === 'function')
    ? window.I18N.text(raw)
    : raw;
}
