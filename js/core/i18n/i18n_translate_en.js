  const _dynTextEnCache = Object.create(null);
  let _dynTextEnCacheCount = 0;

  function _translateDynamicToEn(text) {
    if (!text || typeof text !== 'string') return text;
    if (text.length <= 500 && _dynTextEnCache[text] !== undefined) {
      return _dynTextEnCache[text];
    }

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
      .replace(/在\s*\u{2B50}?\s*(.+?)\s*會出現的營地使用薰香\s*，?\s*與牠相遇吧！?/gu, 'Use incenses at areas where $1 appears to encounter them!')
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
      .replace(/【\s*自第\s*(\d+)\s*(?:time\(s\)|次)\s*(?:好眠日|Good Sleep Day)\s*起\s*】/gi, '[From Good Sleep Day #$1]')
      .replace(/【\s*自第\s*(\d+)\s*(?:time\(s\)|次)\s*(?:新月日|New Moon Day)\s*起\s*】/gi, '[From New Moon Day #$1]')
      .replace(/滿月之日/g, 'Full Moon Day')
      .replace(/滿月/g, 'Full Moon')
      .replace(/好眠日/g, 'Good Sleep Day')
      .replace(/新月日/g, 'New Moon Day')
      .replace(/夏日嘉年華/g, 'Summer Festival')
      .replace(/（\s*漂亮成功時為\s*(\d+(\.\d+)?)倍[,，]\s*在週日漂亮成功時為\s*(\d+(\.\d+)?)倍\s*）/g, '($1x on Extra Tasty, $3x on Sunday Extra Tasty)')
      .replace(/漂亮成功時為\s*(\d+(\.\d+)?)倍/gi, '$1x on Extra Tasty')
      .replace(/在週日漂亮成功時為\s*(\d+(\.\d+)?)倍/gi, '$1x on Sunday Extra Tasty')
      .replace(/料理的最終能量[為會變成]*\s*(\d+(\.\d+)?)倍/gi, 'Final Cooking Energy: $1x')
      .replace(/透過料理可獲得的\s*能量會變成\s*(\d+(?:\.\d+)?)\s*倍\s*[。.]?/g, 'Dish energy gained will be multiplied by $1x.')
      .replace(/透過主技能獲得的食材數量變成\s*(\d+(?:\.\d+)?)\s*倍\s*[。.]?/g, 'Ingredients obtained via Main Skills will be multiplied by $1x.')
      .replace(/製作食譜裡含有\s*[「"]?(.+?)[」"]?\s*的料理時[,，]\s*從食譜指定的食材份量獲得的能量會變成\s*(\d+(?:\.\d+)?)\s*倍\s*[。.]?/g, 'Dishes using "$1" gain $2x energy from recipe-specified ingredient amounts.')
      .replace(/透過含有\s*[「"]?(.+?)[」"]?\s*的料理可獲得的能量倍率會根據\s*製作的料理和\s*[「"]?(.+?)[」"]?\s*的使用數量\s*而不同\s*[。.]?/g, 'The energy multiplier for dishes with "$1" varies by dish and quantity used.')
      .replace(/超過料理所需數量而額外加入的\s*[「"]?(.+?)[」"]?\s*能量變成\s*(\d+(?:\.\d+)?)\s*倍\s*[。.]?/g, 'Extra "$1" added beyond recipe requirements gain $2x energy.')
      .replace(/顯示於食譜一覽的料理能量變成\s*(\d+(?:\.\d+)?)\s*倍\s*[。.]?/g, 'Dish energy shown in the Recipe List becomes $1x.')
      .replace(/顯示於食譜一覽的料理能量倍率不變\s*[。.]?/g, 'Dish energy multipliers shown in the Recipe List remain unchanged.')
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
      .replace(/夢之碎片增量週同樂包\s*([SML])\s*vol\.?(\d+)/gi, 'Dream Shard Bonus Week Bundle $1 Vol.$2')
      .replace(/大餐週滿足包\s*([SML])\s*vol\.?(\d+)/gi, 'Feast Week Value Bundle $1 Vol.$2')
      .replace(/備料週滿足包\s*([SML])\s*vol\.?(\d+)/gi, 'Prep Week Value Bundle $1 Vol.$2')
      .replace(/萬聖節2026歡慶包\s*([SML])/gi, 'Halloween 2026 Celebration Bundle $1')
      .replace(/萬聖節(\d{4})歡慶包/gi, 'Halloween $1 Celebration Bundle')
      .replace(/萬聖節(\d{4})/gi, 'Halloween $1')
      .replace(/萬聖節/g, 'Halloween')
      .replace(/「(.+?)限定包\s*([SML])」/gi, '"$1 Limited Bundle $2" ')
      .replace(/「(.+?)限定包」/gi, '"$1 Limited Bundle" ')
      .replace(/「(.+?)同樂包\s*([SML])」/gi, '"$1 Celebration Bundle $2" ')
      .replace(/「(.+?)同樂包」/gi, '"$1 Celebration Bundle" ')
      .replace(/「(.+?)紀念包\s*([SML])」/gi, '"$1 Commemorative Bundle $2" ')
      .replace(/[（\(]\s*(\d[\d,，]*)\s*(?:鑽石|Diamonds)\s*[）\)]/gi, (match, p1) => ` (${p1.replace(/，/g, ',')} Diamonds)`)
      .replace(/（限購\s*(\d+)\s*次）/g, '(Limit: $1)')
      .replace(/介紹\s*[:：]\s*《Pokémon Sleep》將配合「好眠日」推出/g, 'Details: Special bundle available in Pokémon Sleep for Good Sleep Day')
      .replace(/介紹\s*[:：]/g, 'Details: ')
      .replace(/主技能種子\s*[（\(](.+?)[）\)]/g, 'Main Skill Seed ($1)');

    // 7. 官方公告、更新與異常通知
    res = res
      .replace(/《Pokémon Sleep》將配合\s*[「"]?(.+?)[」"]?\s*推出\s*[「"]?(.+?)[」"]?\s*[（\(]\s*S,\s*M,\s*L\s*[）\)]\s*[！:]?/g, 'Pokémon Sleep will release "$2" (S, M, L) for "$1"!')
      .replace(/【預告】新食材[,，]\s*新食譜[,，]\s*睡姿圖鑑目標和新企畫確定登場\s*[！:]?/g, '[Preview] New Ingredient, New Recipes, Sleep Style Dex Goal & New Event Confirmed!')
      .replace(/新的睡姿圖鑑目標\s*[（\(]\s*(\d+)\s*種\s*[）\)]/g, 'New Sleep Style Dex Goal ($1 styles)')
      .replace(/會用到\s*(.+?)\s*的\s*(\d+)\s*種食譜/g, '$2 new recipes using $1')
      .replace(/食材\s*[「"]\s*(.+?)\s*[」"]/g, 'Ingredient "$1"')
      .replace(/關於\s*Ver\.?\s*([\d\.]+)\s*的更新內容/gi, 'Ver.$1 Update Details')
      .replace(/詳情請參閱官方公告內容與說明/g, 'Please check the official announcement for full details.')
      .replace(/異常問題修復通知/g, 'Bug Fix Notice')
      .replace(/異常問題通知/g, 'Issue Notice')
      .replace(/錯誤代碼\s*[「"]?(\d+)[」"]?/g, 'Error Code "$1"')
      .replace(/[\u{2728}\s]*新增功能/gu, 'New Features')
      .replace(/[\u{2696}\u{FE0F}\s]*平衡調整與技能變更/gu, 'Balance Adjustments & Skill Changes')
      .replace(/[\u{1F41B}\s]*異常問題修復/gu, 'Bug Fixes')
      .replace(/調整與幻之寶可夢的相遇方式[；;]?\s*關於至今為止在(?:新月日|New Moon Day)出現的幻之寶可夢[,，]?\s*今後玩家將能在不同活動分別遇見特定的幻之寶可夢\s*[。.]?/g, 'Adjusted Mythical Pokémon encounters: Mythical Pokémon that previously appeared on New Moon Day will now appear in dedicated events.')
      .replace(/準備新活動[,，\s]*新企畫/g, 'Preparing new events and campaigns').replace(/食材和食譜/g, 'Ingredients & Recipes')
      .replace(/來什麼都吃光光[！:]?\s*大餐週\s*vol\.?(\d+)/gi, 'Eat Everything! Feast Week Vol.$1')
      .replace(/備料週\s*vol\.?(\d+)/gi, 'Prep Week Vol.$1')
      .replace(/(?:不僅如此[,，]\s*還)?可以使用期間限定的\s*[「"]?\s*迷你糖果增強\s*[」"]?\s*[。.]?/g, 'Limited-time "Mini Candy Boost" will be available.')
      .replace(/迷你糖果增強/g, 'Mini Candy Boost')
      .replace(/糖果倍增研究/g, 'Candy Boost Research')
      .replace(/有著特別裝扮的寶可夢/g, 'Special costume Pokémon')
      .replace(/寶藍Lapis Lakeside/g, 'Lapis Lakeside')
      .replace(/波導彈/g, 'Aura Sphere')
      .replace(/夢之碎片獲取\s*([SM])/g, 'Dream Shard Magnet $1')
      .replace(/夢之碎片獲取/g, 'Dream Shard Magnet');

    // 8. 替換道具名稱 (糖果, 薰香, 夢之塊, 沙布蕾)
    for (let i = 0; i < ITEM_NAMES_EN_ENTRIES.length; i++) {
      const [cn, item] = ITEM_NAMES_EN_ENTRIES[i];
      if (res.includes(cn)) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }

    // 9. 替換食材與島嶼名稱
    for (let i = 0; i < INGREDIENT_NAMES_EN_ENTRIES.length; i++) {
      const [cn, item] = INGREDIENT_NAMES_EN_ENTRIES[i];
      if (res.includes(cn)) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }
    for (let i = 0; i < ISLAND_NAMES_EN_ENTRIES.length; i++) {
      const [cn, item] = ISLAND_NAMES_EN_ENTRIES[i];
      if (res.includes(cn)) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }

    // 10. 替換寶可夢名稱 (由長至短依序取代，避免前綴衝突)
    for (let i = 0; i < SORTED_POKEMON_NAMES_KEYS.length; i++) {
      const cn = SORTED_POKEMON_NAMES_KEYS[i];
      if (res.includes(cn)) {
        res = res.replaceAll(cn, POKEMON_NAMES[cn]);
      }
    }

    // 11. 消除 "Pokémon的Item" -> "Pokémon Item" 與屬性括號
    res = res
      .replace(/的\s*(Candy|Incense|Biscuit|Seed|Block|Shard|Cluster)/gi, ' $1')
      .replace(/（(.+?)屬性）/g, ' ($1 Type)')
      .replace(/\((.+?)屬性\)/g, ' ($1 Type)');

    for (let i = 0; i < TYPE_NAMES_EN_ENTRIES.length; i++) {
      const [cn, item] = TYPE_NAMES_EN_ENTRIES[i];
      if (res.includes(cn)) {
        res = res.replaceAll(cn + ' Type', item['en-US'] + ' Type');
        res = res.replaceAll(cn + '屬性的Candy', item['en-US'] + '-Type Candy ');
        res = res.replaceAll(cn + '屬性糖果', item['en-US'] + '-Type Candy ');
        res = res.replaceAll(cn + '屬性', item['en-US'] + ' Type');
        res = res.replaceAll(cn + '屬性的幫手寶可夢', item['en-US'] + '-type Helper Pokémon');
        res = res.replaceAll(cn + '屬性的寶可夢', item['en-US'] + '-type Pokémon');
      }
    }
    res = res
      .replace(/([A-Za-z]+)\s*Type\s*的\s*(?:幫手寶可夢|Helper Pokémon)/gi, '$1-type Helper Pokémon')
      .replace(/([A-Za-z]+)\s*Type\s*的\s*Pokémon/gi, '$1-type Pokémon')
      .replace(/([A-Za-z]+)-Type Candy\s*([SML])\b/g, '$1-Type Candy $2');

    // 12. 天梯點評與剩餘常用片語
    res = res
      .replace(/([\u{1F451}]?\s*)TOP 1 AAA\s*(.+?)\s*產量之王/gu, '$1TOP 1 AAA $2 Production King')
      .replace(/([\u{1F451}]?\s*)TOP 1\s*(.+?)\s*產量之王/gu, '$1TOP 1 $2 Production King')
      .replace(/AAA\s*(.+?)\s*專精產出/g, 'AAA $1 Specialized Output')
      .replace(/AAA\s*(.+?)\s*純種產出/g, 'AAA $1 Pure Output')
      .replace(/ABB\s*(.+?)\s*主力產出/g, 'ABB $1 Main Output')
      .replace(/AAA\s*(.+?)\s*兼顧/g, 'AAA $1 Flex Output')
      .replace(/AAC\s*雙(.+?)\s*二階解鎖/g, 'AAC Dual $1 Lv.30 Unlock')
      .replace(/AAC\s*(.+?)\s*解鎖/g, 'AAC $1 Lv.30 Unlock')
      .replace(/ABA\s*雙(.+?)\s*產出/g, 'ABA Dual $1 Output')
      .replace(/AAX\s*雙(.+?)\s*產出/g, 'AAX Dual $1 Output')
      .replace(/ABX\s*單(.+?)\s*混產/g, 'ABX Single $1 Mixed Output')
      .replace(/ABB\s*單(.+?)\s*混產/g, 'ABB Single $1 Mixed Output')
      .replace(/AAB\s*(.+?)\s*後期主力/g, 'AAB $1 Late-Game Main')
      .replace(/XXC\s*單(.+?)\s*補足/g, 'XXC Single $1 Supplement')
      .replace(/產量之王/g, 'Production King')
      .replace(/專精產出/g, 'Specialized Output')
      .replace(/純種產出/g, 'Pure Output')
      .replace(/主力產出/g, 'Main Output')
      .replace(/後期主力/g, 'Late-Game Main')
      .replace(/兼顧/g, 'Flex Output')
      .replace(/二階解鎖/g, 'Lv.30 Unlock')
      .replace(/解鎖/g, 'Unlock')
      .replace(/混產/g, 'Mixed Output')
      .replace(/補足/g, 'Supplement')
      .replace(/[（\(]體型日產\s*(\d+)~(\d+)\s*顆[）\)]/g, '(Sizes: $1~$2/day)')
      .replace(/[（\(]體型日產\s*(\d+)\s*顆[）\)]/g, '(Sizes: $1/day)')
      .replace(/[（\(]8種進化產量皆相同[）\)]/g, '(All 8 Evolutions Equal)')
      .replace(/顆\/天/g, '/day')
      .replace(/顆/g, 'items')
      .replace(/餐\/天/g, 'meals/day')
      .replace(/鑽石/g, 'Diamonds')
      .replace(/咖哩[,，\s]*濃湯/g, 'Curries/Stews')
      .replace(/沙拉/g, 'Salads')
      .replace(/甜點[,，\s]*飲料/g, 'Desserts/Drinks')
      .replace(/^(?:通知)$/g, 'Notice')
      .replace(/^(?:活動)$/g, 'Event')
      .replace(/^(?:企劃)$/g, 'Campaign')
      .replace(/^(?:更新通知)$/g, 'Update')
      .replace(/^(?:異常問題)$/g, 'Issue')
      .replace(/以及/g, 'and')
      .replace(/等\s*能夠培育/g, 'and other items to raise')
      .replace(/的道具\s*。?/g, 'items.')
      .replace(/「\s*/g, '"')
      .replace(/\s*」/g, '"');

    const out = res.trim();
    if (text.length <= 500) {
      if (_dynTextEnCacheCount > 3000) {
        for (const k in _dynTextEnCache) delete _dynTextEnCache[k];
        _dynTextEnCacheCount = 0;
      }
      _dynTextEnCache[text] = out;
      _dynTextEnCacheCount++;
    }
    return out;
  }
