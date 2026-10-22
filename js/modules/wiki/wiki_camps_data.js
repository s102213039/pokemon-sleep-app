
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const shardsLabel = isEN ? 'Dream Shards: ' : '夢之碎片：';
    const expLabel = isEN ? 'Research EXP: ' : '研究EXP：';
    const candyLabel = isEN ? 'Candy: ' : '糖果數量：';

    const tip = document.createElement('div');
    tip.id = 'island-sleep-popover';
    tip.className = 'island-sleep-hover-tooltip';
    tip.innerHTML = `
      <div class="island-sleep-tip-line">${shardsLabel}${style.shards}</div>
      <div class="island-sleep-tip-line">${expLabel}${style.exp}</div>
      <div class="island-sleep-tip-line">${candyLabel}${style.candy}</div>
    `;

    document.body.appendChild(tip);

    if (anchorEl && typeof anchorEl.getBoundingClientRect === 'function') {
      const rect = anchorEl.getBoundingClientRect();
      const tipRect = tip.getBoundingClientRect();
      let top = rect.top - tipRect.height - 8;
      let left = rect.left + (rect.width / 2) - (tipRect.width / 2);

      if (top < 8) {
        top = rect.bottom + 8;
      }
      const winWidth = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1024;
      const winHeight = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 768;
      if (left < 10) left = 10;
      if (left + tipRect.width > winWidth - 10) {
        left = winWidth - tipRect.width - 10;
      }
      if (top + tipRect.height > winHeight - 8) {
        top = winHeight - tipRect.height - 8;
      }

      tip.style.top = `${Math.round(top)}px`;
      tip.style.left = `${Math.round(left)}px`;
    }
  }

  // --- 8. 7大研究島嶼營地與EX專家模式資料庫 (Research Camps & EX Mode DB) ---
  const ISLANDS_DATA = [
    {
      id: "greengrass",
      name: "萌綠之島",
      name_en: "Greengrass Isle",
      image: "https://www.serebii.net/pokemonsleep/locations/greengrassisle.jpg",
      imageScene: "assets/islands/hd/greengrass.jpg",
      badgeColor: "#22c55e",
      unlockGoal: 0,
      unlockGoalText: "初始營地 (0種睡姿)",
      unlockGoalText_en: "Starting Camp (0 Styles)",
      snorlaxMultiplier: "1.0x",
      berriesMode: "random",
      berriesDesc: "每週自18種樹果中隨機指定3種",
      berriesDesc_en: "Random 3 Berries chosen weekly from all 18 types",
      favoriteBerries: [],
      favoriteTypes: [],
      hasExpertMode: true,
      expertMode: {
        name: "萌綠之島 EX模式",
        name_en: "Greengrass Isle EX",
        unlockReq: "萌綠之島卡比獸達到 [大師 18]",
        unlockReq_en: "Reach Snorlax Master 18 on Greengrass Isle",
        ticketReq: "進入需消耗 [EX券] 1張 (普通兌換所200點/進階兌換所100點, 背包上限持有2張)",
        ticketReq_en: "Requires 1 EX Pass (200 Sleep Pts normal / 100 Sleep Pts premium, max hold 2)",
        berryRule: "1種主樹果 + 2種副樹果 (每週隨機輪替)",
        berryRule_en: "1 Primary Berry + 2 Secondary Berries (Rotates weekly)",
        bonus: "收集主樹果的寶可夢享有幫忙間隔大幅縮短加成",
        bonus_en: "Pokemon collecting Primary Berry gain massive helping speed boost",
        penalty: "未收集當週指定喜愛樹果的寶可夢受到幫忙間隔延長 (+15%) 減速懲罰",
        penalty_en: "Pokemon without favored berries suffer +15% interval delay penalty",
        campReward: "累積獨立的 [EX營地加成], 不消耗也不疊加一般營地加成",
        campReward_en: "Accumulates independent EX Area Bonus, separate from normal area bonus",
        rewards: "異色寶可夢 (Shiny) 出現機率顯著提升, 獲得大量研究EXP與夢之碎片與糖果, 開放專屬高難度每週任務",
        rewards_en: "Higher Shiny rate, massive Research EXP, Dream Shards, Candies, and exclusive weekly missions",
        snorlaxEnergyTiers: [
          { rank: "Basic 1", energy: 0 },
          { rank: "Great 1", energy: 309675 },
          { rank: "Ultra 1", energy: 997610 },
          { rank: "Master 1", energy: 2014314 },
          { rank: "Master 5", energy: 3057187 },
          { rank: "Master 10", energy: 4778794 },
          { rank: "Master 15", energy: 7152862 },
          { rank: "Master 20", energy: 10981171 }
        ]
      },
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 23385 },
        { rank: "Ultra 1", energy: 79197 },
        { rank: "Master 1", energy: 187832 },
        { rank: "Master 5", energy: 321146 },
        { rank: "Master 10", energy: 532707 },
        { rank: "Master 15", energy: 1199506 },
        { rank: "Master 20", energy: 3245795 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "920,000"
              },
              {
                      "count": 5,
                      "power": "2,060,000"
              },
              {
                      "count": 6,
                      "power": "4,500,000"
              },
              {
                      "count": 7,
                      "power": "8,320,000"
              },
              {
                      "count": 8,
                      "power": "19,500,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "妙蛙種子", name_en: "Bulbasaur", type: "草", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "妙蛙草", name_en: "Ivysaur", type: "草", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "妙蛙花", name_en: "Venusaur", type: "草", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "綠毛蟲", name_en: "Caterpie", type: "蟲", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "鐵甲蛹", name_en: "Metapod", type: "蟲", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "巴大蝶", name_en: "Butterfree", type: "蟲", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "阿柏蛇", name_en: "Ekans", type: "毒", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "阿柏怪", name_en: "Arbok", type: "毒", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "可達鴨", name_en: "Psyduck", type: "水", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "猴怪", name_en: "Mankey", type: "格鬥", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "火爆猴", name_en: "Primeape", type: "格鬥", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "喇叭芽", name_en: "Bellsprout", type: "草", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "口呆花", name_en: "Weepinbell", type: "草", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Ultra 2" },
          { name: "大食花", name_en: "Victreebel", type: "草", s1: "Master 2", s2: "Master 6", s3: "-", s4: "Master 7" },
          { name: "鬼斯", name_en: "Gastly", type: "幽靈", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "-" },
          { name: "鬼斯通", name_en: "Haunter", type: "幽靈", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "-" },
          { name: "凱羅斯", name_en: "Pinsir", type: "蟲", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "菊草葉", name_en: "Chikorita", type: "草", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "月桂葉", name_en: "Bayleef", type: "草", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "大竺葵", name_en: "Meganium", type: "草", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "烏波 (帕底亞的樣子)", name_en: "Paldean Wooper", type: "毒", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Master 1" },
          { name: "月亮伊布", name_en: "Umbreon", type: "惡", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "黑暗鴉", name_en: "Murkrow", type: "惡", s1: "Ultra 1", s2: "Ultra 5", s3: "-", s4: "Master 1" },
          { name: "壺壺", name_en: "Shuckle", type: "蟲", s1: "Master 4", s2: "Master 8", s3: "-", s4: "Master 9" },
          { name: "赫拉克羅斯", name_en: "Heracross", type: "蟲", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "狃拉", name_en: "Sneasel", type: "惡", s1: "Ultra 1", s2: "Ultra 5", s3: "-", s4: "Master 1" },
          { name: "信使鳥", name_en: "Delibird", type: "飛行", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "戴魯比", name_en: "Houndour", type: "惡", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "木守宮", name_en: "Treecko", type: "草", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "森林蜥蜴", name_en: "Grovyle", type: "草", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "蜥蜴王", name_en: "Sceptile", type: "草", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "過動猿", name_en: "Vigoroth", type: "一般", s1: "Great 3", s2: "Ultra 2", s3: "-", s4: "Ultra 3" },
          { name: "溶食獸", name_en: "Gulpin", type: "毒", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "吞食獸", name_en: "Swalot", type: "毒", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Ultra 2" },
          { name: "怨影娃娃", name_en: "Shuppet", type: "幽靈", s1: "Great 1", s2: "Great 5", s3: "-", s4: "-" },
          { name: "詛咒娃娃", name_en: "Banette", type: "幽靈", s1: "Ultra 5", s2: "Master 4", s3: "-", s4: "Master 5" },
          { name: "阿勃梭魯", name_en: "Absol", type: "惡", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "拉帝亞斯", name_en: "Latias", type: "龍", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "拉帝歐斯", name_en: "Latios", type: "龍", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "飄飄球", name_en: "Drifloon", type: "幽靈", s1: "Great 3", s2: "Ultra 2", s3: "-", s4: "-" },
          { name: "烏鴉頭頭", name_en: "Honchkrow", type: "惡", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "花岩怪", name_en: "Spiritomb", type: "惡", s1: "Master 4", s2: "Master 8", s3: "-", s4: "Master 9" },
          { name: "不良蛙", name_en: "Croagunk", type: "毒", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "毒骷蛙", name_en: "Toxicroak", type: "毒", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Ultra 2" },
          { name: "瑪狃拉", name_en: "Weavile", type: "惡", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "葉伊布", name_en: "Leafeon", type: "草", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "南瓜精", name_en: "Pumpkaboo", type: "幽靈", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Master 1" },
          { name: "南瓜怪人", name_en: "Gourgeist", type: "幽靈", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "嗡蝠", name_en: "Noibat", type: "龍", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "音波龍", name_en: "Noivern", type: "龍", s1: "Ultra 4", s2: "Master 3", s3: "-", s4: "Master 4" },
          { name: "謎擬Q", name_en: "Mimikyu", type: "幽靈", s1: "Master 2", s2: "Master 6", s3: "-", s4: "Master 7" },
          { name: "老翁龍", name_en: "Drampa", type: "龍", s1: "Master 4", s2: "Master 8", s3: "-", s4: "Master 9" },
          { name: "顫弦蠑螈 (高調的樣子)", name_en: "Toxtricity Amped Form", type: "毒", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "顫弦蠑螈 (低調的樣子)", name_en: "Toxtricity Low Key Form", type: "毒", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "新葉喵", name_en: "Sprigatito", type: "草", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "蒂蕾喵", name_en: "Floragato", type: "草", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "魔幻假面喵", name_en: "Meowscarada", type: "惡", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "土王", name_en: "Clodsire", type: "毒", s1: "Master 2", s2: "Master 6", s3: "-", s4: "Master 7" },
          { name: "哎呀球菇", name_en: "Foongus", type: "毒", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "敗露球菇", name_en: "Amoonguss", type: "毒", s1: "Ultra 4", s2: "Master 2", s3: "-", s4: "Master 1" },
        ],
        snoozing: [
          { name: "小火龍", name_en: "Charmander", type: "火", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "火恐龍", name_en: "Charmeleon", type: "火", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "噴火龍", name_en: "Charizard", type: "火", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "小拉達", name_en: "Rattata", type: "一般", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "拉達", name_en: "Raticate", type: "一般", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "皮卡丘", name_en: "Pikachu", type: "電", s1: "Basic 3", s2: "Great 2", s3: "-", s4: "Great 3" },
          { name: "雷丘", name_en: "Raichu", type: "電", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "Master 9" },
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Master 3", s2: "Master 7", s3: "-", s4: "Master 8" },
          { name: "六尾", name_en: "Vulpix", type: "火", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Master 1" },
          { name: "九尾", name_en: "Ninetales", type: "火", s1: "Master 1", s2: "Master 5", s3: "-", s4: "Master 6" },
          { name: "胖丁", name_en: "Jigglypuff", type: "妖精", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Great 4" },
          { name: "胖可丁", name_en: "Wigglytuff", type: "妖精", s1: "Master 2", s2: "Master 6", s3: "-", s4: "Master 7" },
          { name: "地鼠", name_en: "Diglett", type: "地面", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "-" },
          { name: "三地鼠", name_en: "Dugtrio", type: "地面", s1: "Great 5", s2: "Ultra 4", s3: "-", s4: "-" },
          { name: "喵喵", name_en: "Meowth", type: "一般", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 2" },
          { name: "貓老大", name_en: "Persian", type: "一般", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "卡蒂狗", name_en: "Growlithe", type: "火", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "呆呆獸", name_en: "Slowpoke", type: "水", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Ultra 1" },
          { name: "呆殼獸", name_en: "Slowbro", type: "水", s1: "Ultra 1", s2: "Ultra 5", s3: "-", s4: "Master 1" },
          { name: "吉利蛋", name_en: "Chansey", type: "一般", s1: "Ultra 5", s2: "Master 4", s3: "-", s4: "Master 5" },
          { name: "袋獸", name_en: "Kangaskhan", type: "一般", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Ultra 5" },
          { name: "伊布", name_en: "Eevee", type: "一般", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Great 4" },
          { name: "雷伊布", name_en: "Jolteon", type: "電", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "火伊布", name_en: "Flareon", type: "火", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "火球鼠", name_en: "Cyndaquil", type: "火", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "火岩鼠", name_en: "Quilava", type: "火", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "火爆獸", name_en: "Typhlosion", type: "火", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "波克基古", name_en: "Togetic", type: "妖精", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "天然雀", name_en: "Natu", type: "超能力", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "天然鳥", name_en: "Xatu", type: "超能力", s1: "Ultra 4", s2: "Master 3", s3: "-", s4: "Master 4" },
          { name: "咩利羊", name_en: "Mareep", type: "電", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "茸茸羊", name_en: "Flaaffy", type: "電", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Ultra 2" },
          { name: "太陽伊布", name_en: "Espeon", type: "超能力", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "果然翁", name_en: "Wobbuffet", type: "超能力", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Ultra 1" },
          { name: "幸福蛋", name_en: "Blissey", type: "一般", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "雷公", name_en: "Raikou", type: "電", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "炎帝", name_en: "Entei", type: "火", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "火稚雞", name_en: "Torchic", type: "火", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "懶人獺", name_en: "Slakoth", type: "一般", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Ultra 1" },
          { name: "請假王", name_en: "Slaking", type: "一般", s1: "Master 7", s2: "Master 11", s3: "Master 17", s4: "Master 12" },
          { name: "正電拍拍", name_en: "Plusle", type: "電", s1: "Ultra 5", s2: "Master 4", s3: "-", s4: "Master 5" },
          { name: "負電拍拍", name_en: "Minun", type: "電", s1: "Ultra 5", s2: "Master 4", s3: "-", s4: "Master 5" },
          { name: "波克基斯", name_en: "Togekiss", type: "妖精", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "Master 11" },
          { name: "克雷色利亞", name_en: "Cresselia", type: "超能力", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "食夢夢", name_en: "Munna", type: "超能力", s1: "Great 1", s2: "Great 5", s3: "-", s4: "-" },
          { name: "夢夢蝕", name_en: "Musharna", type: "超能力", s1: "Master 7", s2: "Master 11", s3: "-", s4: "-" },
          { name: "仙子伊布", name_en: "Sylveon", type: "妖精", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "Master 8" },
          { name: "咚咚鼠", name_en: "Dedenne", type: "電", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "萌虻", name_en: "Cutiefly", type: "妖精", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "蝶結萌虻", name_en: "Ribombee", type: "妖精", s1: "Ultra 4", s2: "Master 3", s3: "-", s4: "Master 4" },
          { name: "花療環環", name_en: "Comfey", type: "妖精", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "呆火鱷", name_en: "Fuecoco", type: "火", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "布撥", name_en: "Pawmi", type: "電", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "小鍛匠", name_en: "Tinkatink", type: "妖精", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "巧鍛匠", name_en: "Tinkatuff", type: "妖精", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "巨鍛匠", name_en: "Tinkaton", type: "妖精", s1: "Master 7", s2: "Master 11", s3: "-", s4: "-" },
          { name: "超夢", name_en: "Mewtwo", type: "超能力", s1: "Master 10", s2: "Master 14", s3: "Master 20", s4: "-" },
        ],
        slumbering: [
          { name: "傑尼龜", name_en: "Squirtle", type: "水", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "卡咪龜", name_en: "Wartortle", type: "水", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "水箭龜", name_en: "Blastoise", type: "水", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "穿山鼠", name_en: "Sandshrew", type: "地面", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "穿山王", name_en: "Sandslash", type: "地面", s1: "Ultra 4", s2: "Master 3", s3: "-", s4: "Master 4" },
          { name: "小拳石", name_en: "Geodude", type: "岩石", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "隆隆石", name_en: "Graveler", type: "岩石", s1: "Great 3", s2: "Ultra 2", s3: "-", s4: "Ultra 3" },
          { name: "小磁怪", name_en: "Magnemite", type: "鋼", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "-" },
          { name: "三合一磁怪", name_en: "Magneton", type: "鋼", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "-" },
          { name: "嘟嘟", name_en: "Doduo", type: "飛行", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "嘟嘟利", name_en: "Dodrio", type: "飛行", s1: "Great 5", s2: "Ultra 4", s3: "-", s4: "Ultra 5" },
          { name: "卡拉卡拉", name_en: "Cubone", type: "地面", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "嘎啦嘎啦", name_en: "Marowak", type: "地面", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Ultra 2" },
          { name: "水伊布", name_en: "Vaporeon", type: "水", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "小鋸鱷", name_en: "Totodile", type: "水", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "藍鱷", name_en: "Croconaw", type: "水", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "大力鱷", name_en: "Feraligatr", type: "水", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "皮丘", name_en: "Pichu", type: "電", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Ultra 1" },
          { name: "寶寶丁", name_en: "Igglybuff", type: "妖精", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "波克比", name_en: "Togepi", type: "妖精", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "樹才怪", name_en: "Sudowoodo", type: "岩石", s1: "Basic 3", s2: "Great 2", s3: "-", s4: "Ultra 1" },
          { name: "烏波", name_en: "Wooper", type: "水", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "沼王", name_en: "Quagsire", type: "水", s1: "Master 1", s2: "Master 5", s3: "-", s4: "Master 6" },
          { name: "水君", name_en: "Suicune", type: "水", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "幼基拉斯", name_en: "Larvitar", type: "岩石", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Great 4" },
          { name: "力壯雞", name_en: "Combusken", type: "格鬥", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "火焰雞", name_en: "Blaziken", type: "格鬥", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "水躍魚", name_en: "Mudkip", type: "水", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "沼躍魚", name_en: "Marshtomp", type: "地面", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "巨沼怪", name_en: "Swampert", type: "地面", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "大嘴娃", name_en: "Mawile", type: "鋼", s1: "Master 3", s2: "Master 7", s3: "-", s4: "Master 8" },
          { name: "青綿鳥", name_en: "Swablu", type: "飛行", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "小果然", name_en: "Wynaut", type: "超能力", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "海豹球", name_en: "Spheal", type: "冰", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "盆才怪", name_en: "Bonsly", type: "岩石", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "小福蛋", name_en: "Happiny", type: "一般", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "利歐路", name_en: "Riolu", type: "格鬥", s1: "Basic 3", s2: "Great 2", s3: "-", s4: "Great 3" },
          { name: "自爆磁怪", name_en: "Magnezone", type: "鋼", s1: "Master 7", s2: "Master 11", s3: "Master 17", s4: "-" },
          { name: "冰伊布", name_en: "Glaceon", type: "冰", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "毛頭小鷹", name_en: "Rufflet", type: "飛行", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "勇士雄鷹", name_en: "Braviary", type: "飛行", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "寶寶暴龍", name_en: "Tyrunt", type: "岩石", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "怪顎龍", name_en: "Tyrantrum", type: "岩石", s1: "Master 7", s2: "Master 11", s3: "-", s4: "-" },
          { name: "托戈德瑪爾", name_en: "Togedemaru", type: "鋼", s1: "Master 4", s2: "Master 8", s3: "-", s4: "Master 9" },
          { name: "古月鳥", name_en: "Cramorant", type: "飛行", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "毒電嬰", name_en: "Toxel", type: "毒", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "潤水鴨", name_en: "Quaxly", type: "水", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "走鯨", name_en: "Cetoddle", type: "冰", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Master 1" },
        ],
      }
    },
    {
      id: "cyan",
      name: "天青沙灘",
      name_en: "Cyan Beach",
      image: "https://www.serebii.net/pokemonsleep/locations/cyanbeach.jpg",
      imageScene: "assets/islands/hd/cyan.jpg",
      badgeColor: "#06b6d4",
      unlockGoal: 20,
      unlockGoalText: "登錄 20 種睡姿",
      unlockGoalText_en: "20 Sleep Styles",
      snorlaxMultiplier: "1.25x",
      berriesMode: "fixed",
      favoriteBerries: ["橙橙果","椰木果","桃桃果"],
      favoriteTypes: ["水","飛行","妖精"],
      hasExpertMode: true,
      expertMode: {
        name: "天青沙灘 EX模式",
        name_en: "Cyan Beach EX",
        unlockReq: "萌綠之島與天青沙灘卡比獸皆達到 [大師 18]",
        unlockReq_en: "Reach Master 18 on both Greengrass Isle and Cyan Beach",
        ticketReq: "進入需消耗 [EX券] 1張",
        ticketReq_en: "Requires 1 EX Pass",
        berryRule: "1種主樹果自 (水/飛行/妖精) 中指定1種, 副樹果自其餘17種中隨機指定2種",
        berryRule_en: "1 Primary Berry from Water/Flying/Fairy, 2 Secondary Berries from remaining 17 types",
        bonus: "主樹果幫手速度大幅縮短, 水君 (Suicune) 與小鍛匠家族遭遇率大幅提升",
        bonus_en: "Primary Berry speed boost, significantly boosted Suicune and Tinkatink spawn rates",
        penalty: "非指定喜愛樹果寶可夢幫忙間隔延長 (+15%) 懲罰",
        penalty_en: "Pokemon without favored berries suffer +15% interval delay penalty",
        campReward: "累積獨立的 [EX營地加成]",
        campReward_en: "Accumulates independent EX Area Bonus",
        rewards: "高額研究EXP與夢之碎片與糖果, 異色率提升, EX專屬每週任務",
        rewards_en: "Massive Research EXP, Dream Shards, Candies, higher Shiny rates, and exclusive weekly missions",
        snorlaxEnergyTiers: [
          { rank: "Basic 1", energy: 0 },
          { rank: "Great 1", energy: 309675 },
          { rank: "Ultra 1", energy: 1037612 },
          { rank: "Master 1", energy: 2194292 },
          { rank: "Master 5", energy: 3489192 },
          { rank: "Master 10", energy: 5609891 },
          { rank: "Master 15", energy: 7802011 },
          { rank: "Master 20", energy: 14780152 }
        ]
      },
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 36164 },
        { rank: "Ultra 1", energy: 122474 },
        { rank: "Master 1", energy: 256544 },
        { rank: "Master 5", energy: 420363 },
        { rank: "Master 10", energy: 735875 },
        { rank: "Master 15", energy: 1379432 },
        { rank: "Master 20", energy: 3732664 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "1,150,000"
              },
              {
                      "count": 5,
                      "power": "2,570,000"
              },
              {
                      "count": 6,
                      "power": "5,620,000"
              },
              {
                      "count": 7,
                      "power": "10,400,000"
              },
              {
                      "count": 8,
                      "power": "24,400,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "綠毛蟲", name_en: "Caterpie", type: "蟲", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "可達鴨", name_en: "Psyduck", type: "水", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "喇叭芽", name_en: "Bellsprout", type: "草", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "凱羅斯", name_en: "Pinsir", type: "蟲", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Ultra 4" },
          { name: "壺壺", name_en: "Shuckle", type: "蟲", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "赫拉克羅斯", name_en: "Heracross", type: "蟲", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Ultra 4" },
          { name: "木守宮", name_en: "Treecko", type: "草", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "森林蜥蜴", name_en: "Grovyle", type: "草", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Ultra 4" },
          { name: "蜥蜴王", name_en: "Sceptile", type: "草", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "Master 9" },
          { name: "溶食獸", name_en: "Gulpin", type: "毒", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "不良蛙", name_en: "Croagunk", type: "毒", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "毒骷蛙", name_en: "Toxicroak", type: "毒", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Great 4" },
          { name: "骨紋巨聲鱷", name_en: "Skeledirge", type: "幽靈", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "Master 9" },
        ],
        snoozing: [
          { name: "皮卡丘", name_en: "Pikachu", type: "電", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Great 1" },
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 6" },
          { name: "胖丁", name_en: "Jigglypuff", type: "妖精", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "胖可丁", name_en: "Wigglytuff", type: "妖精", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "呆呆獸", name_en: "Slowpoke", type: "水", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Ultra 1" },
          { name: "呆殼獸", name_en: "Slowbro", type: "水", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "袋獸", name_en: "Kangaskhan", type: "一般", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Master 1" },
          { name: "魔牆人偶", name_en: "Mr. Mime", type: "超能力", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Master 1" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "伊布", name_en: "Eevee", type: "一般", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "呆呆王", name_en: "Slowking", type: "水", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "萌虻", name_en: "Cutiefly", type: "妖精", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "蝶結萌虻", name_en: "Ribombee", type: "妖精", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "花療環環", name_en: "Comfey", type: "妖精", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Master 1" },
          { name: "呆火鱷", name_en: "Fuecoco", type: "火", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Ultra 1" },
          { name: "炙燙鱷", name_en: "Crocalor", type: "火", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Master 1" },
          { name: "小鍛匠", name_en: "Tinkatink", type: "妖精", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "巧鍛匠", name_en: "Tinkatuff", type: "妖精", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Master 1" },
          { name: "巨鍛匠", name_en: "Tinkaton", type: "妖精", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "-" },
        ],
        slumbering: [
          { name: "傑尼龜", name_en: "Squirtle", type: "水", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "卡咪龜", name_en: "Wartortle", type: "水", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "水箭龜", name_en: "Blastoise", type: "水", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "哥達鴨", name_en: "Golduck", type: "水", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "水伊布", name_en: "Vaporeon", type: "水", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "小鋸鱷", name_en: "Totodile", type: "水", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "藍鱷", name_en: "Croconaw", type: "水", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "大力鱷", name_en: "Feraligatr", type: "水", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Ultra 1" },
          { name: "寶寶丁", name_en: "Igglybuff", type: "妖精", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "樹才怪", name_en: "Sudowoodo", type: "岩石", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Ultra 1" },
          { name: "烏波", name_en: "Wooper", type: "水", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Ultra 1" },
          { name: "沼王", name_en: "Quagsire", type: "水", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "水君", name_en: "Suicune", type: "水", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "-" },
          { name: "盆才怪", name_en: "Bonsly", type: "岩石", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "魔尼尼", name_en: "Mime Jr.", type: "超能力", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Ultra 1" },
          { name: "毛頭小鷹", name_en: "Rufflet", type: "飛行", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "古月鳥", name_en: "Cramorant", type: "飛行", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
        ],
      }
    },
    {
      id: "taupe",
      name: "灰褐洞窟",
      name_en: "Taupe Hollow",
      image: "https://www.serebii.net/pokemonsleep/locations/taupehollow.jpg",
      imageScene: "assets/islands/hd/taupe.jpg",
      badgeColor: "#f97316",
      unlockGoal: 70,
      unlockGoalText: "登錄 70 種睡姿",
      unlockGoalText_en: "70 Sleep Styles",
      snorlaxMultiplier: "1.55x",
      berriesMode: "fixed",
      favoriteBerries: ["蘋野果","勿花果","文柚果"],
      favoriteTypes: ["火","地面","岩石"],
      hasExpertMode: false,
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 51635 },
        { rank: "Ultra 1", energy: 174869 },
        { rank: "Master 1", energy: 366295 },
        { rank: "Master 5", energy: 600197 },
        { rank: "Master 10", energy: 1050688 },
        { rank: "Master 15", energy: 1776213 },
        { rank: "Master 20", energy: 4219534 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "1,430,000"
              },
              {
                      "count": 5,
                      "power": "3,190,000"
              },
              {
                      "count": 6,
                      "power": "6,980,000"
              },
              {
                      "count": 7,
                      "power": "12,900,000"
              },
              {
                      "count": 8,
                      "power": "30,200,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "鬼斯", name_en: "Gastly", type: "幽靈", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "-" },
          { name: "鬼斯通", name_en: "Haunter", type: "幽靈", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "-" },
          { name: "耿鬼", name_en: "Gengar", type: "幽靈", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "烏波 (帕底亞的樣子)", name_en: "Paldean Wooper", type: "毒", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "月亮伊布", name_en: "Umbreon", type: "惡", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "壺壺", name_en: "Shuckle", type: "蟲", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "戴魯比", name_en: "Houndour", type: "惡", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "黑魯加", name_en: "Houndoom", type: "惡", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Ultra 1" },
          { name: "班基拉斯", name_en: "Tyranitar", type: "惡", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "Master 11" },
          { name: "勾魂眼", name_en: "Sableye", type: "惡", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "嗡蝠", name_en: "Noibat", type: "龍", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 1" },
          { name: "音波龍", name_en: "Noivern", type: "龍", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Master 1" },
          { name: "骨紋巨聲鱷", name_en: "Skeledirge", type: "幽靈", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "Master 8" },
          { name: "土王", name_en: "Clodsire", type: "毒", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
        ],
        snoozing: [
          { name: "小火龍", name_en: "Charmander", type: "火", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "火恐龍", name_en: "Charmeleon", type: "火", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Great 5" },
          { name: "噴火龍", name_en: "Charizard", type: "火", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 6" },
          { name: "六尾", name_en: "Vulpix", type: "火", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Master 1" },
          { name: "九尾", name_en: "Ninetales", type: "火", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 6" },
          { name: "地鼠", name_en: "Diglett", type: "地面", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "-" },
          { name: "三地鼠", name_en: "Dugtrio", type: "地面", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "-" },
          { name: "卡蒂狗", name_en: "Growlithe", type: "火", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "風速狗", name_en: "Arcanine", type: "火", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "火伊布", name_en: "Flareon", type: "火", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "火球鼠", name_en: "Cyndaquil", type: "火", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "火岩鼠", name_en: "Quilava", type: "火", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Great 5" },
          { name: "火爆獸", name_en: "Typhlosion", type: "火", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "炎帝", name_en: "Entei", type: "火", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "-" },
          { name: "呆火鱷", name_en: "Fuecoco", type: "火", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Ultra 1" },
          { name: "炙燙鱷", name_en: "Crocalor", type: "火", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Master 1" },
        ],
        slumbering: [
          { name: "穿山鼠", name_en: "Sandshrew", type: "地面", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 1" },
          { name: "穿山王", name_en: "Sandslash", type: "地面", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Master 1" },
          { name: "小拳石", name_en: "Geodude", type: "岩石", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Great 1" },
          { name: "隆隆石", name_en: "Graveler", type: "岩石", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Ultra 1" },
          { name: "隆隆岩", name_en: "Golem", type: "岩石", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "大岩蛇", name_en: "Onix", type: "岩石", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "-" },
          { name: "卡拉卡拉", name_en: "Cubone", type: "地面", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Great 1" },
          { name: "嘎啦嘎啦", name_en: "Marowak", type: "地面", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Ultra 1" },
          { name: "大綱蛇", name_en: "Steelix", type: "鋼", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "-" },
          { name: "幼基拉斯", name_en: "Larvitar", type: "岩石", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Great 1" },
          { name: "沙基拉斯", name_en: "Pupitar", type: "岩石", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "水躍魚", name_en: "Mudkip", type: "水", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 2" },
          { name: "沼躍魚", name_en: "Marshtomp", type: "地面", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "巨沼怪", name_en: "Swampert", type: "地面", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "Master 8" },
          { name: "大顎蟻", name_en: "Trapinch", type: "地面", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "超音波幼蟲", name_en: "Vibrava", type: "地面", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Ultra 4" },
          { name: "沙漠蜻蜓", name_en: "Flygon", type: "地面", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "Master 11" },
          { name: "利歐路", name_en: "Riolu", type: "格鬥", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "寶寶暴龍", name_en: "Tyrunt", type: "岩石", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Ultra 1" },
          { name: "怪顎龍", name_en: "Tyrantrum", type: "岩石", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "-" },
        ],
      }
    },
    {
      id: "snowdrop",
      name: "白花雪原",
      name_en: "Snowdrop Tundra",
      image: "https://www.serebii.net/pokemonsleep/locations/snowdroptundra.jpg",
      imageScene: "assets/islands/hd/snowdrop.jpg",
      badgeColor: "#38bdf8",
      unlockGoal: 150,
      unlockGoalText: "登錄 150 種睡姿",
      unlockGoalText_en: "150 Sleep Styles",
      snorlaxMultiplier: "2.0x",
      berriesMode: "fixed",
      favoriteBerries: ["柿仔果","生薑果","芭拉果"],
      favoriteTypes: ["一般","冰","惡"],
      hasExpertMode: false,
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 78645 },
        { rank: "Ultra 1", energy: 266344 },
        { rank: "Master 1", energy: 557907 },
        { rank: "Master 5", energy: 914159 },
        { rank: "Master 10", energy: 1600296 },
        { rank: "Master 15", energy: 2705329 },
        { rank: "Master 20", energy: 4706403 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "1,840,000"
              },
              {
                      "count": 5,
                      "power": "4,120,000"
              },
              {
                      "count": 6,
                      "power": "9,000,000"
              },
              {
                      "count": 7,
                      "power": "16,640,000"
              },
              {
                      "count": 8,
                      "power": "39,000,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "猴怪", name_en: "Mankey", type: "格鬥", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "火爆猴", name_en: "Primeape", type: "格鬥", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Ultra 1" },
          { name: "黑暗鴉", name_en: "Murkrow", type: "惡", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "狃拉", name_en: "Sneasel", type: "惡", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "信使鳥", name_en: "Delibird", type: "飛行", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "過動猿", name_en: "Vigoroth", type: "一般", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Ultra 1" },
          { name: "溶食獸", name_en: "Gulpin", type: "毒", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Great 1" },
          { name: "吞食獸", name_en: "Swalot", type: "毒", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Ultra 1" },
          { name: "七夕青鳥", name_en: "Altaria", type: "龍", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "阿勃梭魯", name_en: "Absol", type: "惡", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "烏鴉頭頭", name_en: "Honchkrow", type: "惡", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "花岩怪", name_en: "Spiritomb", type: "惡", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "瑪狃拉", name_en: "Weavile", type: "惡", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
        ],
        snoozing: [
          { name: "小拉達", name_en: "Rattata", type: "一般", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "拉達", name_en: "Raticate", type: "一般", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Great 4" },
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 6" },
          { name: "吉利蛋", name_en: "Chansey", type: "一般", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Ultra 5" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Basic 5", s2: "Great 4", s3: "-", s4: "Great 5" },
          { name: "咩利羊", name_en: "Mareep", type: "電", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "茸茸羊", name_en: "Flaaffy", type: "電", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 2" },
          { name: "電龍", name_en: "Ampharos", type: "電", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "幸福蛋", name_en: "Blissey", type: "一般", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "懶人獺", name_en: "Slakoth", type: "一般", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Ultra 1" },
          { name: "請假王", name_en: "Slaking", type: "一般", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "克雷色利亞", name_en: "Cresselia", type: "超能力", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "-" },
          { name: "布撥", name_en: "Pawmi", type: "電", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "布土撥", name_en: "Pawmo", type: "電", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "巴布土撥", name_en: "Pawmot", type: "電", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "Master 9" },
        ],
        slumbering: [
          { name: "六尾 (阿羅拉的樣子)", name_en: "Alolan Vulpix", type: "冰", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 2" },
          { name: "九尾 (阿羅拉的樣子)", name_en: "Alolan Ninetales", type: "冰", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Ultra 1" },
          { name: "青綿鳥", name_en: "Swablu", type: "飛行", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "海豹球", name_en: "Spheal", type: "冰", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "海魔獅", name_en: "Sealeo", type: "冰", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Ultra 1" },
          { name: "帝牙海獅", name_en: "Walrein", type: "冰", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "小福蛋", name_en: "Happiny", type: "一般", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "利歐路", name_en: "Riolu", type: "格鬥", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "路卡利歐", name_en: "Lucario", type: "格鬥", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "雪笠怪", name_en: "Snover", type: "冰", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Ultra 1" },
          { name: "暴雪王", name_en: "Abomasnow", type: "冰", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "-" },
          { name: "冰伊布", name_en: "Glaceon", type: "冰", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "古月鳥", name_en: "Cramorant", type: "飛行", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "走鯨", name_en: "Cetoddle", type: "冰", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Master 1" },
          { name: "浩大鯨", name_en: "Cetitan", type: "冰", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "-" },
        ],
      }
    },
    {
      id: "lapis",
      name: "寶藍湖畔",
      name_en: "Lapis Lakeside",
      image: "https://www.serebii.net/pokemonsleep/locations/lapislakeside.jpg",
      imageScene: "assets/islands/hd/lapis.jpg",
      badgeColor: "#10b981",
      unlockGoal: 240,
      unlockGoalText: "登錄 240 種睡姿",
      unlockGoalText_en: "240 Sleep Styles",
      snorlaxMultiplier: "2.65x",
      berriesMode: "fixed",
      favoriteBerries: ["榴石果","櫻子果","芒念果"],
      favoriteTypes: ["草","格鬥","超能"],
      hasExpertMode: false,
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 97031 },
        { rank: "Ultra 1", energy: 328610 },
        { rank: "Master 1", energy: 675330 },
        { rank: "Master 5", energy: 1075709 },
        { rank: "Master 10", energy: 1825483 },
        { rank: "Master 15", energy: 2925574 },
        { rank: "Master 20", energy: 5193272 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "2,440,000"
              },
              {
                      "count": 5,
                      "power": "5,460,000"
              },
              {
                      "count": 6,
                      "power": "11,920,000"
              },
              {
                      "count": 7,
                      "power": "22,040,000"
              },
              {
                      "count": 8,
                      "power": "51,670,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "妙蛙種子", name_en: "Bulbasaur", type: "草", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "妙蛙草", name_en: "Ivysaur", type: "草", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Ultra 1" },
          { name: "妙蛙花", name_en: "Venusaur", type: "草", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "喇叭芽", name_en: "Bellsprout", type: "草", s1: "Basic 1", s2: "Basic 1", s3: "Basic 5", s4: "Great 1" },
          { name: "口呆花", name_en: "Weepinbell", type: "草", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "大食花", name_en: "Victreebel", type: "草", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "迷你龍", name_en: "Dratini", type: "龍", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Ultra 1" },
          { name: "哈克龍", name_en: "Dragonair", type: "龍", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Master 1" },
          { name: "快龍", name_en: "Dragonite", type: "龍", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "Master 11" },
          { name: "菊草葉", name_en: "Chikorita", type: "草", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "月桂葉", name_en: "Bayleef", type: "草", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "大竺葵", name_en: "Meganium", type: "草", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "木守宮", name_en: "Treecko", type: "草", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "森林蜥蜴", name_en: "Grovyle", type: "草", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "蜥蜴王", name_en: "Sceptile", type: "草", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "拉帝亞斯", name_en: "Latias", type: "龍", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "-" },
          { name: "拉帝歐斯", name_en: "Latios", type: "龍", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "-" },
          { name: "葉伊布", name_en: "Leafeon", type: "草", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "老翁龍", name_en: "Drampa", type: "龍", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "新葉喵", name_en: "Sprigatito", type: "草", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Ultra 1" },
          { name: "蒂蕾喵", name_en: "Floragato", type: "草", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Master 1" },
          { name: "魔幻假面喵", name_en: "Meowscarada", type: "惡", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "哎呀球菇", name_en: "Foongus", type: "毒", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "敗露球菇", name_en: "Amoonguss", type: "毒", s1: "Great 3", s2: "Ultra 2", s3: "Master 1", s4: "Great 3" },
        ],
        snoozing: [
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 6" },
          { name: "喵喵", name_en: "Meowth", type: "一般", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "貓老大", name_en: "Persian", type: "一般", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Ultra 1" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Great 4" },
          { name: "波克基古", name_en: "Togetic", type: "妖精", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "天然雀", name_en: "Natu", type: "超能力", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "太陽伊布", name_en: "Espeon", type: "超能力", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "果然翁", name_en: "Wobbuffet", type: "超能力", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Ultra 1" },
          { name: "火稚雞", name_en: "Torchic", type: "火", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "拉魯拉絲", name_en: "Ralts", type: "超能力", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "奇鲁莉安", name_en: "Kirlia", type: "超能力", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Ultra 1" },
          { name: "沙奈朵", name_en: "Gardevoir", type: "超能力", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "克雷色利亞", name_en: "Cresselia", type: "超能力", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "-" },
          { name: "食夢夢", name_en: "Munna", type: "超能力", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "-" },
          { name: "夢夢蝕", name_en: "Musharna", type: "超能力", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "-" },
          { name: "咚咚鼠", name_en: "Dedenne", type: "電", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
        ],
        slumbering: [
          { name: "嘟嘟", name_en: "Doduo", type: "飛行", s1: "Basic 1", s2: "Basic 1", s3: "Basic 5", s4: "Great 1" },
          { name: "嘟嘟利", name_en: "Dodrio", type: "飛行", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Great 4" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Ultra 1" },
          { name: "波克比", name_en: "Togepi", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Basic 5", s4: "Great 1" },
          { name: "水君", name_en: "Suicune", type: "水", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "-" },
          { name: "力壯雞", name_en: "Combusken", type: "格鬥", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "火焰雞", name_en: "Blaziken", type: "格鬥", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "小果然", name_en: "Wynaut", type: "超能力", s1: "Basic 1", s2: "Basic 1", s3: "Basic 5", s4: "Great 1" },
          { name: "艾路雷朵", name_en: "Gallade", type: "格鬥", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "Master 8" },
          { name: "童偶熊", name_en: "Stufful", type: "格鬥", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Ultra 1" },
          { name: "穿著熊", name_en: "Bewear", type: "格鬥", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Master 6" },
          { name: "潤水鴨", name_en: "Quaxly", type: "水", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Ultra 1" },
          { name: "湧躍鴨", name_en: "Quaxwell", type: "水", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Master 1" },
          { name: "狂歡浪舞鴨", name_en: "Quaquaval", type: "格鬥", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
        ],
      }
    },
    {
      id: "powerplant",
      name: "黃金舊發電廠",
      name_en: "Old Gold Power Plant",
      image: "https://www.serebii.net/pokemonsleep/locations/oldgoldpowerplant.jpg",
      imageScene: "assets/islands/hd/oldgold.jpg",
      badgeColor: "#a855f7",
      unlockGoal: 340,
      unlockGoalText: "登錄 340 種睡姿",
      unlockGoalText_en: "340 Sleep Styles",
      snorlaxMultiplier: "3.4x",
      berriesMode: "fixed",
      favoriteBerries: ["異奇果","檬果","靛莓果"],
      favoriteTypes: ["電","幽靈","鋼"],
      hasExpertMode: false,
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 151061 },
        { rank: "Ultra 1", energy: 511595 },
        { rank: "Master 1", energy: 1038306 },
        { rank: "Master 5", energy: 1582395 },
        { rank: "Master 10", energy: 2476059 },
        { rank: "Master 15", energy: 3744954 },
        { rank: "Master 20", energy: 6674166 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "3,130,000"
              },
              {
                      "count": 5,
                      "power": "7,000,000"
              },
              {
                      "count": 6,
                      "power": "15,300,000"
              },
              {
                      "count": 7,
                      "power": "28,290,000"
              },
              {
                      "count": 8,
                      "power": "66,300,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "綠毛蟲", name_en: "Caterpie", type: "蟲", s1: "Basic 1", s2: "Basic 1", s3: "Basic 4", s4: "Great 1" },
          { name: "鐵甲蛹", name_en: "Metapod", type: "蟲", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "巴大蝶", name_en: "Butterfree", type: "蟲", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "鬼斯", name_en: "Gastly", type: "幽靈", s1: "Basic 1", s2: "Basic 1", s3: "Basic 4", s4: "-" },
          { name: "鬼斯通", name_en: "Haunter", type: "幽靈", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "-" },
          { name: "耿鬼", name_en: "Gengar", type: "幽靈", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "黑暗鴉", name_en: "Murkrow", type: "惡", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Great 4" },
          { name: "怨影娃娃", name_en: "Shuppet", type: "幽靈", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "-" },
          { name: "詛咒娃娃", name_en: "Banette", type: "幽靈", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Master 1" },
          { name: "飄飄球", name_en: "Drifloon", type: "幽靈", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "-" },
          { name: "隨風球", name_en: "Drifblim", type: "幽靈", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "-" },
          { name: "烏鴉頭頭", name_en: "Honchkrow", type: "惡", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "南瓜精", name_en: "Pumpkaboo", type: "幽靈", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Master 1" },
          { name: "南瓜怪人", name_en: "Gourgeist", type: "幽靈", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "強顎雞母蟲", name_en: "Grubbin", type: "蟲", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "蟲電寶", name_en: "Charjabug", type: "蟲", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "鍬農炮蟲", name_en: "Vikavolt", type: "蟲", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "Master 9" },
          { name: "謎擬Q", name_en: "Mimikyu", type: "幽靈", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Ultra 5" },
        ],
        snoozing: [
          { name: "皮卡丘", name_en: "Pikachu", type: "電", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "雷丘", name_en: "Raichu", type: "電", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 6" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Basic 3", s2: "Great 2", s3: "Great 3", s4: "Great 3" },
          { name: "雷伊布", name_en: "Jolteon", type: "電", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "雷公", name_en: "Raikou", type: "電", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "-" },
          { name: "正電拍拍", name_en: "Plusle", type: "電", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "負電拍拍", name_en: "Minun", type: "電", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "小貓怪", name_en: "Shinx", type: "電", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "勒克貓", name_en: "Luxio", type: "電", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "倫琴貓", name_en: "Luxray", type: "電", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "咚咚鼠", name_en: "Dedenne", type: "電", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Ultra 1" },
          { name: "布撥", name_en: "Pawmi", type: "電", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Basic 4" },
          { name: "布土撥", name_en: "Pawmo", type: "電", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Great 5" },
          { name: "巴布土撥", name_en: "Pawmot", type: "電", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "小鍛匠", name_en: "Tinkatink", type: "妖精", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "巧鍛匠", name_en: "Tinkatuff", type: "妖精", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Master 1" },
          { name: "巨鍛匠", name_en: "Tinkaton", type: "妖精", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "-" },
        ],
        slumbering: [
          { name: "小磁怪", name_en: "Magnemite", type: "鋼", s1: "Basic 1", s2: "Basic 1", s3: "Basic 4", s4: "-" },
          { name: "三合一磁怪", name_en: "Magneton", type: "鋼", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "-" },
          { name: "皮丘", name_en: "Pichu", type: "電", s1: "Basic 1", s2: "Basic 1", s3: "Basic 4", s4: "Great 1" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Basic 5", s4: "Ultra 1" },
          { name: "大綱蛇", name_en: "Steelix", type: "鋼", s1: "Ultra 4", s2: "Master 3", s3: "-", s4: "-" },
          { name: "大嘴娃", name_en: "Mawile", type: "鋼", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "可可多拉", name_en: "Aron", type: "鋼", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "可多拉", name_en: "Lairon", type: "鋼", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "波士可多拉", name_en: "Aggron", type: "鋼", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "Master 8" },
          { name: "自爆磁怪", name_en: "Magnezone", type: "鋼", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "-" },
          { name: "托戈德瑪爾", name_en: "Togedemaru", type: "鋼", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "毒電嬰", name_en: "Toxel", type: "毒", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Basic 4" },
        ],
      }
    },
    {
      id: "amber",
      name: "琥褐溪谷",
      name_en: "Amber Canyon",
      image: "https://www.serebii.net/pokemonsleep/locations/ambercanyon.jpg",
      imageScene: "assets/islands/hd/amber.jpg",
      badgeColor: "#d97706",
      unlockGoal: 450,
      unlockGoalText: "登錄 450 種睡姿",
      unlockGoalText_en: "450 Sleep Styles",
      snorlaxMultiplier: "4.2x",
      berriesMode: "fixed",
      favoriteBerries: ["零餘果","木子果","巧可果"],
      favoriteTypes: ["毒","蟲","龍"],
      hasExpertMode: false,
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 198585 },
        { rank: "Ultra 1", energy: 654607 },
        { rank: "Master 1", energy: 1325740 },
        { rank: "Master 5", energy: 2015408 },
        { rank: "Master 10", energy: 3179971 },
        { rank: "Master 15", energy: 4815792 },
        { rank: "Master 20", energy: 8528976 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "3,860,000"
              },
              {
                      "count": 5,
                      "power": "8,650,000"
              },
              {
                      "count": 6,
                      "power": "18,900,000"
              },
              {
                      "count": 7,
                      "power": "34,940,000"
              },
              {
                      "count": 8,
                      "power": "81,900,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "阿柏蛇", name_en: "Ekans", type: "毒", s1: "Basic 1", s2: "Basic 1", s3: "Basic 3", s4: "Great 1" },
          { name: "阿柏怪", name_en: "Arbok", type: "毒", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Ultra 1" },
          { name: "凱羅斯", name_en: "Pinsir", type: "蟲", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Ultra 1" },
          { name: "赫拉克羅斯", name_en: "Heracross", type: "蟲", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Ultra 1" },
          { name: "寶貝龍", name_en: "Bagon", type: "龍", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "甲殼龍", name_en: "Shelgon", type: "龍", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Great 5" },
          { name: "暴飛龍", name_en: "Salamence", type: "龍", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "Master 11" },
          { name: "拉帝亞斯", name_en: "Latias", type: "龍", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "-" },
          { name: "拉帝歐斯", name_en: "Latios", type: "龍", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "-" },
          { name: "花岩怪", name_en: "Spiritomb", type: "惡", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "石居蟹", name_en: "Dwebble", type: "蟲", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "岩殿居蟹", name_en: "Crustle", type: "蟲", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "嗡蝠", name_en: "Noibat", type: "龍", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "音波龍", name_en: "Noivern", type: "龍", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Master 1" },
          { name: "老翁龍", name_en: "Drampa", type: "龍", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "顫弦蠑螈 (高調的樣子)", name_en: "Toxtricity Amped Form", type: "毒", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "顫弦蠑螈 (低調的樣子)", name_en: "Toxtricity Low Key Form", type: "毒", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "哎呀球菇", name_en: "Foongus", type: "毒", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "敗露球菇", name_en: "Amoonguss", type: "毒", s1: "Great 1", s2: "Great 5", s3: "Master 4", s4: "Great 1" },
        ],
        snoozing: [
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Master 1" },
          { name: "六尾", name_en: "Vulpix", type: "火", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Ultra 1" },
          { name: "九尾", name_en: "Ninetales", type: "火", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Master 1" },
          { name: "吉利蛋", name_en: "Chansey", type: "一般", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Master 1" },
          { name: "伊布", name_en: "Eevee", type: "一般", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "天然雀", name_en: "Natu", type: "超能力", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "天然鳥", name_en: "Xatu", type: "超能力", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "幸福蛋", name_en: "Blissey", type: "一般", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "炎帝", name_en: "Entei", type: "火", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "-" },
          { name: "正電拍拍", name_en: "Plusle", type: "電", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "負電拍拍", name_en: "Minun", type: "電", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
        ],
        slumbering: [
          { name: "穿山鼠", name_en: "Sandshrew", type: "地面", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "穿山王", name_en: "Sandslash", type: "地面", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Master 1" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Basic 4", s4: "Great 1" },
          { name: "幼基拉斯", name_en: "Larvitar", type: "岩石", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "大嘴娃", name_en: "Mawile", type: "鋼", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Ultra 5" },
          { name: "大顎蟻", name_en: "Trapinch", type: "地面", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "超音波幼蟲", name_en: "Vibrava", type: "地面", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Great 5" },
          { name: "沙漠蜻蜓", name_en: "Flygon", type: "地面", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "小福蛋", name_en: "Happiny", type: "一般", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "毛頭小鷹", name_en: "Rufflet", type: "飛行", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "勇士雄鷹", name_en: "Braviary", type: "飛行", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "寶寶暴龍", name_en: "Tyrunt", type: "岩石", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Ultra 1" },
          { name: "怪顎龍", name_en: "Tyrantrum", type: "岩石", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "-" },
          { name: "托戈德瑪爾", name_en: "Togedemaru", type: "鋼", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "毒電嬰", name_en: "Toxel", type: "毒", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
        ],
      }
    }
  ];

  const STORAGE_KEY_ISLAND_ID = 'pksleep_active_island_id';
  const STORAGE_KEY_ISLAND_EXPERT = 'pksleep_active_island_expert';
  const STORAGE_KEY_ISLAND_SLEEP_TYPE = 'pksleep_active_island_sleep_type';

