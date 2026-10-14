/**
 * js/data/items.js - Pokémon Sleep Items Master Data
 * Master dataset containing 36 essential items across 4 categories (evolution, training, biscuit, supply).
 */
(function () {
  'use strict';

  const ITEMS_DATA = [
  {
    "id": "thunder_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "雷之石",
      "zh-CN": "雷之石",
      "en-US": "Thunder Stone"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/thunderstone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。上面有著閃電形狀的花紋。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。上面有着闪电形状的花纹。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. It has a distinct thunderbolt pattern."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "26",
      "135",
      "462",
      "738"
    ]
  },
  {
    "id": "fire_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "火之石",
      "zh-CN": "火之石",
      "en-US": "Fire Stone"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/firestone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。澄黃色的核心彷彿有火焰在燃燒。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。澄黄色的核心仿佛有火焰在燃烧。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. The core glows with fiery warmth."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "38",
      "59",
      "136"
    ]
  },
  {
    "id": "water_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "水之石",
      "zh-CN": "水之石",
      "en-US": "Water Stone"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/waterstone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。澄澈如水的藍色石面上閃爍著粼粼波光。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。澄澈如水的蓝色石面上闪烁着粼粼波光。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. It is the clear blue of a pristine pool."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "134"
    ]
  },
  {
    "id": "leaf_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "葉之石",
      "zh-CN": "叶之石",
      "en-US": "Leaf Stone"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/leafstone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。上面有著植物葉片形狀的奇特花紋。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。上面有着植物叶片形状的奇特花纹。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. It has an unmistakable leaf pattern."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "71",
      "470"
    ]
  },
  {
    "id": "moon_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "月之石",
      "zh-CN": "月之石",
      "en-US": "Moon Stone"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/moonstone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。黑夜般漆黑的石身彷彿映照著月光。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。黑夜般漆黑的石身仿佛映照着月光。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. It is as dark as the night sky."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "36",
      "40",
      "518"
    ]
  },
  {
    "id": "sun_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "太陽之石",
      "zh-CN": "太阳之石",
      "en-US": "Sun Stone"
    },
    "icon_url": "https://www.serebii.net/itemdex/sprites/sunstone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。赤紅如驕陽般的石體散發著溫暖。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。赤红如骄阳般的石体散发着温暖。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. It burns as red as the evening sun."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "預備收錄道具"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "预备收录道具"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Prospective Item"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "ice_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "冰之石",
      "zh-CN": "冰之石",
      "en-US": "Ice Stone"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/icestone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。上面有著雪花般晶瑩剔透的花紋。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。上面有着雪花般晶莹剔透的花纹。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. It has an unmistakable snowflake pattern."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "471",
      "975",
      "7007"
    ]
  },
  {
    "id": "shiny_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "光之石",
      "zh-CN": "光之石",
      "en-US": "Shiny Stone"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/shinystone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。石身散發著如日光般耀眼奪目的光輝。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。石身散发着如日光般耀眼夺目的光辉。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. It shines with a dazzling light."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "468"
    ]
  },
  {
    "id": "dusk_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "暗之石",
      "zh-CN": "暗之石",
      "en-US": "Dusk Stone"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/duskstone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。漆黑如墨的石面隱隱散發著幽暗深邃的氣息。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。漆黑如墨的石面隐隐散发着幽暗深邃的气息。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. It holds shadows as dark as night."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "430"
    ]
  },
  {
    "id": "dawn_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "覺醒之石",
      "zh-CN": "觉醒之石",
      "en-US": "Dawn Stone"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/dawnstone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。澄澈如眼眸般閃爍著晶亮明淨的光澤。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。澄澈如眼眸般闪烁着晶亮明净的光泽。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. It sparkles like a pair of eyes."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "475"
    ]
  },
  {
    "id": "oval_stone",
    "category": "evolution",
    "name": {
      "zh-TW": "渾圓之石",
      "zh-CN": "浑圆之石",
      "en-US": "Oval Stone"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/ovalstone.png",
    "description": {
      "zh-TW": "能使特定寶可夢進化的神奇石頭。形狀圓潤滑溜，宛如一顆小蛋。",
      "zh-CN": "能使特定宝可梦进化的神奇石头。形状圆润滑溜，宛如一颗小蛋。",
      "en-US": "A peculiar stone that can make certain species of Pokémon evolve. It is as round as an egg."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "113"
    ]
  },
  {
    "id": "linking_cord",
    "category": "evolution",
    "name": {
      "zh-TW": "聯繫繩",
      "zh-CN": "联系绳",
      "en-US": "Linking Cord"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/linkingcord.png",
    "description": {
      "zh-TW": "散發出不可思議能量的繩子。能讓某些因通訊交換而進化的寶可夢完成進化。",
      "zh-CN": "散发出不可思议能量的绳子。能让某些因通讯交换而进化的宝可梦完成进化。",
      "en-US": "A string exuding a mysterious energy. It can induce evolution in certain Pokémon that normally evolve via trading."
    },
    "effects": {
      "zh-TW": "代替通訊交換，能使特定寶可夢進化的道具。",
      "zh-CN": "代替通讯交换，能使特定宝可梦进化的道具。",
      "en-US": "Replaces trade evolution, allowing certain Pokémon to evolve."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "好友研究親密度等級達成",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "好友研究亲密度等级达成",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Research Community Closeness Rewards",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "76",
      "94",
      "199",
      "208",
      "711"
    ]
  },
  {
    "id": "metal_coat",
    "category": "evolution",
    "name": {
      "zh-TW": "金屬膜",
      "zh-CN": "金属膜",
      "en-US": "Metal Coat"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/metalcoat.png",
    "description": {
      "zh-TW": "特殊的金屬質地薄膜。能使特定寶可夢完成鋼屬性進化。",
      "zh-CN": "特殊的金属质地薄膜。能使特定宝可梦完成钢属性进化。",
      "en-US": "A special metallic film. It can induce evolution in certain Pokémon."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "208"
    ]
  },
  {
    "id": "kings_rock",
    "category": "evolution",
    "name": {
      "zh-TW": "王者之證",
      "zh-CN": "王者之证",
      "en-US": "King's Rock"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/king'srock.png",
    "description": {
      "zh-TW": "王冠形狀的石頭。能使特定寶可夢進化的珍貴道具。",
      "zh-CN": "王冠形状的石头。能使特定宝可梦进化的珍贵道具。",
      "en-US": "A stone shaped like a crown. A precious item that can make certain Pokémon evolve."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "199"
    ]
  },
  {
    "id": "up_grade",
    "category": "evolution",
    "name": {
      "zh-TW": "升級資料",
      "zh-CN": "升级数据",
      "en-US": "Upgrade"
    },
    "icon_url": "https://www.serebii.net/itemdex/sprites/upgrade.png",
    "description": {
      "zh-TW": "裝滿了各種各樣資訊的透明裝置。能使特定寶可夢進化。",
      "zh-CN": "装满了各种各样信息的透明装置。能使特定宝可梦进化。",
      "en-US": "A transparent device containing all sorts of data. It can induce evolution in certain Pokémon."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "預備收錄道具"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "预备收录道具"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Prospective Item"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "razor_claw",
    "category": "evolution",
    "name": {
      "zh-TW": "銳利之爪",
      "zh-CN": "锐利之爪",
      "en-US": "Razor Claw"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/razorclaw.png",
    "description": {
      "zh-TW": "尖銳鋒利的鉤爪。在夜晚能使特定寶可夢進化的神奇道具。",
      "zh-CN": "尖锐锋利的钩爪。在夜晚能使特定宝可梦进化的神奇道具。",
      "en-US": "A sharply hooked claw. A peculiar item that can make certain Pokémon evolve at night."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具（夜間 18:00~06:00）。",
      "zh-CN": "能使特定宝可梦进化的道具（夜间 18:00~06:00）。",
      "en-US": "Can be used to evolve certain Pokémon (Nighttime 18:00-06:00)."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Event Missions"
      ]
    },
    "pokemon_ids": [
      "461"
    ]
  },
  {
    "id": "dragon_scale",
    "category": "evolution",
    "name": {
      "zh-TW": "龍之鱗片",
      "zh-CN": "龙之鳞片",
      "en-US": "Dragon Scale"
    },
    "icon_url": "https://www.serebii.net/itemdex/sprites/dragonscale.png",
    "description": {
      "zh-TW": "質地堅硬的龍之鱗片。能使特定寶可夢進化的珍貴道具。",
      "zh-CN": "质地坚硬的龙之鳞片。能使特定宝可梦进化的珍贵道具。",
      "en-US": "A tough and hard scale from a Dragon-type Pokémon. A precious item that can induce evolution."
    },
    "effects": {
      "zh-TW": "能使特定寶可夢進化的道具。",
      "zh-CN": "能使特定宝可梦进化的道具。",
      "en-US": "Can be used to evolve certain Pokémon."
    },
    "sleep_points": {
      "regular": 1400,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,400pt)",
        "預備收錄道具"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,400pt)",
        "预备收录道具"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,400pt)",
        "Prospective Item"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "handy_candy_s",
    "category": "training",
    "name": {
      "zh-TW": "萬能糖果S",
      "zh-CN": "万能糖果S",
      "en-US": "Handy Candy S"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/handycandys.png",
    "description": {
      "zh-TW": "裝有不可思議糖果的小包裝。使用後可轉換為指定寶可夢的專屬糖果 3 顆。",
      "zh-CN": "装有不可思议糖果的小包装。使用后可转换为指定宝可梦的专属糖果 3 颗。",
      "en-US": "A handy bag containing mysterious candy. Can be converted into 3 candies of any chosen Pokémon."
    },
    "effects": {
      "zh-TW": "轉換為指定寶可夢的專屬糖果 3 顆。",
      "zh-CN": "转换为指定宝可梦的专属糖果 3 颗。",
      "en-US": "Converts into 3 candies for a Pokémon of your choice."
    },
    "sleep_points": {
      "regular": 160,
      "premium": 160,
      "limit_regular": "每月 30 個",
      "limit_premium": "每月 20 個"
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (160pt)",
        "高級睡眠點數交換所 (160pt)",
        "每週任務達成"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (160pt)",
        "高级睡眠点数交换所 (160pt)",
        "每周任务达成"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (160pt)",
        "Premium Sleep Point Exchange (160pt)",
        "Weekly Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "handy_candy_m",
    "category": "training",
    "name": {
      "zh-TW": "萬能糖果M",
      "zh-CN": "万能糖果M",
      "en-US": "Handy Candy M"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/handycandym.png",
    "description": {
      "zh-TW": "裝有不可思議糖果的中包裝。使用後可轉換為指定寶可夢的專屬糖果 20 顆。",
      "zh-CN": "装有不可思议糖果的中包装。使用后可转换为指定宝可梦的专属糖果 20 颗。",
      "en-US": "A handy bag containing mysterious candy. Can be converted into 20 candies of any chosen Pokémon."
    },
    "effects": {
      "zh-TW": "轉換為指定寶可夢的專屬糖果 20 顆。",
      "zh-CN": "转换为指定宝可梦的专属糖果 20 颗。",
      "en-US": "Converts into 20 candies for a Pokémon of your choice."
    },
    "sleep_points": {
      "regular": null,
      "premium": 500,
      "limit_regular": null,
      "limit_premium": "每月 3 個"
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "高級睡眠點數交換所 (500pt)",
        "達成特定睡眠研究成就",
        "月費特點任務"
      ],
      "zh-CN": [
        "高级睡眠点数交换所 (500pt)",
        "达成特定睡眠研究成就",
        "月费特点任务"
      ],
      "en-US": [
        "Premium Sleep Point Exchange (500pt)",
        "Sleep Research Achievements",
        "Pass Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "handy_candy_l",
    "category": "training",
    "name": {
      "zh-TW": "萬能糖果L",
      "zh-CN": "万能糖果L",
      "en-US": "Handy Candy L"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/handycandyl.png",
    "description": {
      "zh-TW": "裝有不可思議糖果的大包裝。使用後可轉換為指定寶可夢的專屬糖果 100 顆。",
      "zh-CN": "装有不可思议糖果的大包装。使用后可转换为指定宝可梦的专属糖果 100 颗。",
      "en-US": "A handy large bag containing mysterious candy. Can be converted into 100 candies of any chosen Pokémon."
    },
    "effects": {
      "zh-TW": "轉換為指定寶可夢的專屬糖果 100 顆。",
      "zh-CN": "转换为指定宝可梦的专属糖果 100 颗。",
      "en-US": "Converts into 100 candies for a Pokémon of your choice."
    },
    "sleep_points": {
      "regular": null,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "特別大型研究成就達成",
        "重大週年紀念特典"
      ],
      "zh-CN": [
        "特别大型研究成就达成",
        "重大周年纪念特典"
      ],
      "en-US": [
        "Major Milestone Research Achievements",
        "Anniversary Special Events"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "dream_cluster_s",
    "category": "training",
    "name": {
      "zh-TW": "夢之塊S",
      "zh-CN": "梦之块S",
      "en-US": "Dream Cluster S"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/dreamclusters.png",
    "description": {
      "zh-TW": "凝聚了夢想力量的小結晶。使用後可碎裂獲得夢之碎片，獲得數量依研究等級提升。",
      "zh-CN": "凝聚了梦想力量的小结晶。使用后可碎裂获得梦之碎片，获得数量依研究等级提升。",
      "en-US": "A small cluster of dream power. Shatters to yield Dream Shards, scaling with your Research Rank."
    },
    "effects": {
      "zh-TW": "碎裂獲得少量夢之碎片（獲得量依研究等級提升）。",
      "zh-CN": "碎裂获得少量梦之碎片（获得量依研究等级提升）。",
      "en-US": "Breaks to grant Dream Shards, scaling with Research Rank."
    },
    "sleep_points": {
      "regular": 120,
      "premium": 120,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (120pt)",
        "高級睡眠點數交換所 (120pt)",
        "每週任務達成"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (120pt)",
        "高级睡眠点数交换所 (120pt)",
        "每周任务达成"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (120pt)",
        "Premium Sleep Point Exchange (120pt)",
        "Weekly Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "dream_cluster_m",
    "category": "training",
    "name": {
      "zh-TW": "夢之塊M",
      "zh-CN": "梦之块M",
      "en-US": "Dream Cluster M"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/dreamclusterm.png",
    "description": {
      "zh-TW": "凝聚了夢想力量的中結晶。使用後可碎裂獲得大量夢之碎片（約 S 級 6 倍）。",
      "zh-CN": "凝聚了梦想力量的中结晶。使用后可碎裂获得大量梦之碎片（约 S 级 6 倍）。",
      "en-US": "A medium cluster of dream power. Shatters to yield a large amount of Dream Shards (about 6x of S)."
    },
    "effects": {
      "zh-TW": "碎裂獲得大量夢之碎片（約 S 級 6 倍，依研究等級提升）。",
      "zh-CN": "碎裂获得大量梦之碎片（约 S 级 6 倍，依研究等级提升）。",
      "en-US": "Breaks to grant a large amount of Dream Shards (about 6x S size)."
    },
    "sleep_points": {
      "regular": null,
      "premium": 700,
      "limit_regular": null,
      "limit_premium": "每月 2 個"
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "高級睡眠點數交換所 (700pt)",
        "研究等級突破獎勵",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "高级睡眠点数交换所 (700pt)",
        "研究等级突破奖励",
        "活动挑战报酬"
      ],
      "en-US": [
        "Premium Sleep Point Exchange (700pt)",
        "Rank Milestone Rewards",
        "Event Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "dream_cluster_l",
    "category": "training",
    "name": {
      "zh-TW": "夢之塊L",
      "zh-CN": "梦之块L",
      "en-US": "Dream Cluster L"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/dreamclusterl.png",
    "description": {
      "zh-TW": "凝聚了夢想力量的大結晶。使用後可碎裂獲得極大量夢之碎片（約 S 級 30 倍）。",
      "zh-CN": "凝聚了梦想力量的大结晶。使用后可碎裂获得极大量梦之碎片（约 S 级 30 倍）。",
      "en-US": "A large cluster of dream power. Shatters to yield an immense amount of Dream Shards (about 30x of S)."
    },
    "effects": {
      "zh-TW": "碎裂獲得極大量夢之碎片（約 S 級 30 倍，依研究等級提升）。",
      "zh-CN": "碎裂获得极大量梦之碎片（约 S 级 30 倍，依研究等级提升）。",
      "en-US": "Breaks to grant an immense amount of Dream Shards (about 30x S size)."
    },
    "sleep_points": {
      "regular": null,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "通行證持續訂閱特典",
        "大型活動限定報酬"
      ],
      "zh-CN": [
        "通行证持续订阅特典",
        "大型活动限定报酬"
      ],
      "en-US": [
        "Pass Continuous Renewal Perks",
        "Major Event Rewards"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "main_skill_seed",
    "category": "training",
    "name": {
      "zh-TW": "主技能種子",
      "zh-CN": "主技能种子",
      "en-US": "Main Skill Seed"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/mainskillseed.png",
    "description": {
      "zh-TW": "蘊藏著神秘力量的種子。使寶可夢的主技能等級提升 1 級（不超過上限）。",
      "zh-CN": "蕴藏着神秘力量的种子。使宝可梦的主技能等级提升 1 级（不超过上限）。",
      "en-US": "A seed holding mysterious power. Raises a Pokémon’s Main Skill Level by 1 (up to the skill limit)."
    },
    "effects": {
      "zh-TW": "使寶可夢的主技能等級提升 1 級（不超過等級上限）。",
      "zh-CN": "使宝可梦的主技能等级提升 1 级（不超过等级上限）。",
      "en-US": "Raises a Pokémon’s Main Skill Level by 1."
    },
    "sleep_points": {
      "regular": null,
      "premium": 1800,
      "limit_regular": null,
      "limit_premium": "每月 1 個"
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "高級睡眠點數交換所 (1,800pt)",
        "達成特定睡眠研究成就",
        "高級通行證特點"
      ],
      "zh-CN": [
        "高级睡眠点数交换所 (1,800pt)",
        "达成特定睡眠研究成就",
        "高级通行证特点"
      ],
      "en-US": [
        "Premium Sleep Point Exchange (1,800pt)",
        "Sleep Research Achievements",
        "Premium Pass Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "sub_skill_seed",
    "category": "training",
    "name": {
      "zh-TW": "副技能種子",
      "zh-CN": "副技能种子",
      "en-US": "Sub Skill Seed"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/subskillseed.png",
    "description": {
      "zh-TW": "蘊藏著奇特潛能的種子。隨機將寶可夢 1 個已解鎖的白階或藍階副技能提升 1 階。",
      "zh-CN": "蕴藏着奇特潜能的种子。随机将宝可梦 1 个已解锁的白阶或蓝阶副技能提升 1 阶。",
      "en-US": "A seed with unique potential. Randomly upgrades one unlocked White or Blue sub skill by one tier."
    },
    "effects": {
      "zh-TW": "隨機將 1 個已解鎖的白階或藍階副技能提升 1 階。",
      "zh-CN": "随机将 1 个已解锁的白阶或蓝阶副技能提升 1 阶。",
      "en-US": "Upgrades one unlocked White or Blue sub skill to the next tier."
    },
    "sleep_points": {
      "regular": null,
      "premium": 1400,
      "limit_regular": null,
      "limit_premium": "每月 1 個"
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "高級睡眠點數交換所 (1,400pt)",
        "達成特定睡眠研究成就",
        "高級通行證特點"
      ],
      "zh-CN": [
        "高级睡眠点数交换所 (1,400pt)",
        "达成特定睡眠研究成就",
        "高级通行证特点"
      ],
      "en-US": [
        "Premium Sleep Point Exchange (1,400pt)",
        "Sleep Research Achievements",
        "Premium Pass Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "cleanse_mint",
    "category": "training",
    "name": {
      "zh-TW": "淨白薄荷",
      "zh-CN": "净白薄荷",
      "en-US": "Cleanse Mint"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/neutralizingmint.png",
    "description": {
      "zh-TW": "具有中和特質的珍貴薄荷。使用後可永久消除性格優劣修正，保留性格名稱但效果回歸 1.0x 中性平衡。",
      "zh-CN": "具有中和特质的珍贵薄荷。使用后可永久消除性格优劣修正，保留性格名称但效果回归 1.0x 中性平衡。",
      "en-US": "A precious mint with neutralizing properties. Permanently removes nature positive/negative stat modifiers while preserving nature name."
    },
    "effects": {
      "zh-TW": "永久消除性格優劣修正，數值倍率回歸 1.0x 中性平衡。",
      "zh-CN": "永久消除性格优劣修正，数值倍率回归 1.0x 中性平衡。",
      "en-US": "Neutralizes all nature stat bonuses and penalties to 1.0x."
    },
    "sleep_points": {
      "regular": null,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "2週年紀念特別研究任務",
        "限定花之種子挑戰活動"
      ],
      "zh-CN": [
        "2周年纪念特别研究任务",
        "限定花之种子挑战活动"
      ],
      "en-US": [
        "2nd Anniversary Special Missions",
        "Event Flower Seed Challenges"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "poke_biscuit",
    "category": "biscuit",
    "name": {
      "zh-TW": "寶可沙布蕾",
      "zh-CN": "宝可沙布蕾",
      "en-US": "Poké Biscuit"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/pokebiscuit.png",
    "description": {
      "zh-TW": "在點心時間餵食寶可夢的沙布蕾。能使寶可夢的友好度增加 1 點。",
      "zh-CN": "在点心时间喂食宝可梦的沙布蕾。能使宝可梦的友好度增加 1 点。",
      "en-US": "A biscuit fed to Pokémon during snack time. Raises a Pokémon’s friendship by 1 point."
    },
    "effects": {
      "zh-TW": "點心時間餵食，寶可夢友好度 +1 點。",
      "zh-CN": "点心时间喂食，宝可梦友好度 +1 点。",
      "en-US": "Raises friendship by 1 point during snack time."
    },
    "sleep_points": {
      "regular": 150,
      "premium": 100,
      "limit_regular": "每月 30 個",
      "limit_premium": "每月 10 個"
    },
    "diamonds": 60,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (150pt)",
        "高級睡眠點數交換所 (100pt)",
        "鑽石商店 (60鑽石)"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (150pt)",
        "高级睡眠点数交换所 (100pt)",
        "钻石商店 (60钻石)"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (150pt)",
        "Premium Sleep Point Exchange (100pt)",
        "Diamond Shop (60 Diamonds)"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "great_biscuit",
    "category": "biscuit",
    "name": {
      "zh-TW": "超級沙布蕾",
      "zh-CN": "超级沙布蕾",
      "en-US": "Great Biscuit"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/greatbiscuit.png",
    "description": {
      "zh-TW": "比普通沙布蕾更美味的點心。能使寶可夢的友好度增加 3 點。",
      "zh-CN": "比普通沙布蕾更美味的点心。能使宝可梦的友好度增加 3 点。",
      "en-US": "A tastier biscuit than a regular one. Raises friendship by 3 points during snack time."
    },
    "effects": {
      "zh-TW": "點心時間餵食，寶可夢友好度 +3 點。",
      "zh-CN": "点心时间喂食，宝可梦友好度 +3 点。",
      "en-US": "Raises friendship by 3 points during snack time."
    },
    "sleep_points": {
      "regular": null,
      "premium": 400,
      "limit_regular": null,
      "limit_premium": "每月 3 個"
    },
    "diamonds": 200,
    "acquisition": {
      "zh-TW": [
        "高級睡眠點數交換所 (400pt)",
        "鑽石商店 (200鑽石)",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "高级睡眠点数交换所 (400pt)",
        "钻石商店 (200钻石)",
        "活动挑战报酬"
      ],
      "en-US": [
        "Premium Sleep Point Exchange (400pt)",
        "Diamond Shop (200 Diamonds)",
        "Event Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "ultra_biscuit",
    "category": "biscuit",
    "name": {
      "zh-TW": "高級沙布蕾",
      "zh-CN": "高级沙布蕾",
      "en-US": "Ultra Biscuit"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/ultrabiscuit.png",
    "description": {
      "zh-TW": "非常高等級的美味沙布蕾。能使寶可夢的友好度大幅增加 5 點。",
      "zh-CN": "非常高等级的美味沙布蕾。能使宝可梦的友好度大幅增加 5 点。",
      "en-US": "A very high grade biscuit. Greatly raises friendship by 5 points during snack time."
    },
    "effects": {
      "zh-TW": "點心時間餵食，寶可夢友好度 +5 點。",
      "zh-CN": "点心时间喂食，宝可梦友好度 +5 点。",
      "en-US": "Raises friendship by 5 points during snack time."
    },
    "sleep_points": {
      "regular": null,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "特別研究任務達成",
        "限定活動挑戰報酬"
      ],
      "zh-CN": [
        "特别研究任务达成",
        "限定活动挑战报酬"
      ],
      "en-US": [
        "Special Research Missions",
        "Limited Event Rewards"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "master_biscuit",
    "category": "biscuit",
    "name": {
      "zh-TW": "大師沙布蕾",
      "zh-CN": "大师沙布蕾",
      "en-US": "Master Biscuit"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/masterbiscuit.png",
    "description": {
      "zh-TW": "最高等級的終極沙布蕾。點心時間餵食，友好度條直接全滿，必定收服成為夥伴。",
      "zh-CN": "最高等级的终极沙布蕾。点心时间喂食，友好度条直接全满，必定收服成为伙伴。",
      "en-US": "The ultimate biscuit. Instantly fills the friendship meter to maximum, guaranteeing friendship."
    },
    "effects": {
      "zh-TW": "點心時間餵食，友好度條直接全滿必定收服。",
      "zh-CN": "点心时间喂食，友好度条直接全满必定收服。",
      "en-US": "Instantly maxes friendship points to catch any Pokémon."
    },
    "sleep_points": {
      "regular": 4000,
      "premium": null,
      "limit_regular": "每月 1 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (4,000pt)",
        "特大慶典活動特典"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (4,000pt)",
        "特大庆典活动特典"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (4,000pt)",
        "Major Celebration Event Perks"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "energy_pillow",
    "category": "supply",
    "name": {
      "zh-TW": "活力枕頭",
      "zh-CN": "活力枕头",
      "en-US": "Energy Pillow"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/energypillow.png",
    "description": {
      "zh-TW": "蓬鬆柔軟的特製枕頭。使用後立即為指定的 1 隻幫手寶可夢回復 50 點活力。",
      "zh-CN": "蓬松柔软的特制枕头。使用后立即为指定的 1 只帮手宝可梦回复 50 点活力。",
      "en-US": "A plush pillow. Instantly restores 50 Energy to one chosen helper Pokémon."
    },
    "effects": {
      "zh-TW": "立即為指定 1 隻幫手寶可夢回復 50 點活力。",
      "zh-CN": "立即为指定 1 只帮手宝可梦回复 50 点活力。",
      "en-US": "Instantly restores 50 Energy to one selected Pokémon."
    },
    "sleep_points": {
      "regular": 240,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": 60,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (240pt)",
        "鑽石商店 (60鑽石)",
        "每週任務達成"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (240pt)",
        "钻石商店 (60钻石)",
        "每周任务达成"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (240pt)",
        "Diamond Shop (60 Diamonds)",
        "Weekly Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "helper_whistle",
    "category": "supply",
    "name": {
      "zh-TW": "幫手哨子",
      "zh-CN": "帮手哨子",
      "en-US": "Helper Whistle"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/helperwhistle.png",
    "description": {
      "zh-TW": "聲音清脆嘹亮的哨子。吹響後隊伍全員立即產出相當於 3 小時（4 次幫忙）的樹果與食材。",
      "zh-CN": "声音清脆嘹亮的哨子。吹响后队伍全员立即产出相当于 3 小时（4 次帮忙）的树果与食材。",
      "en-US": "A crisp whistle. Instantly gathers 3 hours worth of berries and ingredients from all team members."
    },
    "effects": {
      "zh-TW": "隊伍全員立即產出相當於 3 小時（4 次幫忙）的樹果與食材。",
      "zh-CN": "队伍全员立即产出相当于 3 小时（4 次帮忙）的树果与食材。",
      "en-US": "Instantly gathers 3 hours worth of helps from your helper team."
    },
    "sleep_points": {
      "regular": 800,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": 200,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (800pt)",
        "鑽石商店 (200鑽石)",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (800pt)",
        "钻石商店 (200钻石)",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (800pt)",
        "Diamond Shop (200 Diamonds)",
        "Event Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "good_camp_ticket",
    "category": "supply",
    "name": {
      "zh-TW": "好露營券",
      "zh-CN": "好露营券",
      "en-US": "Good Camp Ticket"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/goodcampticket.png",
    "description": {
      "zh-TW": "租借好露營組合 7 天的票券。鍋容量 +50%、幫手速度 +20%、每天早晨額外吸引 1 隻貪吃寶可夢。",
      "zh-CN": "租借好露营组合 7 天的票券。锅容量 +50%、帮手速度 +20%、每天早晨额外吸引 1 只贪吃宝可梦。",
      "en-US": "Rents a Good Camp Set for 7 days: pot capacity +50%, help speed +20%, and an extra hungry Pokémon every morning."
    },
    "effects": {
      "zh-TW": "租借好露營組合 7 天：鍋容量 +50%、幫手速度 +20%、多 1 隻貪吃寶可夢。",
      "zh-CN": "租借好露营组合 7 天：锅容量 +50%、帮手速度 +20%、多 1 只贪吃宝可梦。",
      "en-US": "Rents Good Camp Set for 7 days: pot +50%, speed +20%, extra hungry Pokémon."
    },
    "sleep_points": {
      "regular": null,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": 500,
    "acquisition": {
      "zh-TW": [
        "鑽石商店 (500鑽石)",
        "高級通行證每月續訂特典"
      ],
      "zh-CN": [
        "钻石商店 (500钻石)",
        "高级通行证每月续订特典"
      ],
      "en-US": [
        "Diamond Shop (500 Diamonds)",
        "Premium Pass Monthly Renewal Perk"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "ingredient_ticket_s",
    "category": "supply",
    "name": {
      "zh-TW": "食材券S",
      "zh-CN": "食材券S",
      "en-US": "Ingredient Ticket S"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/ingredienttickets.png",
    "description": {
      "zh-TW": "可隨機獲得食材的票券。使用後隨機獲得 10 個已在圖鑑中解鎖的料理食材。",
      "zh-CN": "可随机获得食材的票券。使用后随机获得 10 个已在图鉴中解锁的料理食材。",
      "en-US": "A ticket that provides ingredients. Grants 10 random ingredients unlocked in your Sleep dex."
    },
    "effects": {
      "zh-TW": "隨機獲得 10 個已在圖鑑中解鎖的料理食材。",
      "zh-CN": "随机获得 10 个已在图鉴中解锁的料理食材。",
      "en-US": "Grants 10 random unlocked cooking ingredients."
    },
    "sleep_points": {
      "regular": 200,
      "premium": null,
      "limit_regular": "每月 10 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (200pt)",
        "每週任務達成",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (200pt)",
        "每周任务达成",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (200pt)",
        "Weekly Missions",
        "Event Rewards"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "ingredient_ticket_m",
    "category": "supply",
    "name": {
      "zh-TW": "食材券M",
      "zh-CN": "食材券M",
      "en-US": "Ingredient Ticket M"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/ingredientticketm.png",
    "description": {
      "zh-TW": "可隨機獲得較多食材的票券。使用後隨機獲得 30 個已在圖鑑中解鎖的料理食材。",
      "zh-CN": "可随机获得较多食材的票券。使用后随机获得 30 个已在图鉴中解锁的料理食材。",
      "en-US": "A ticket that provides more ingredients. Grants 30 random ingredients unlocked in your Sleep dex."
    },
    "effects": {
      "zh-TW": "隨機獲得 30 個已在圖鑑中解鎖的料理食材。",
      "zh-CN": "随机获得 30 个已在图鉴中解锁的料理食材。",
      "en-US": "Grants 30 random unlocked cooking ingredients."
    },
    "sleep_points": {
      "regular": 500,
      "premium": null,
      "limit_regular": "每月 5 個",
      "limit_premium": null
    },
    "diamonds": null,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (500pt)",
        "達成特定睡眠研究成就",
        "活動挑戰報酬"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (500pt)",
        "达成特定睡眠研究成就",
        "活动挑战报酬"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (500pt)",
        "Sleep Research Achievements",
        "Event Rewards"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "e_zzz_travel_ticket",
    "category": "supply",
    "name": {
      "zh-TW": "午睡放鬆券",
      "zh-CN": "午睡放松券",
      "en-US": "E-Zzz Travel Ticket"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/e-zzztravelticket.png",
    "description": {
      "zh-TW": "能轉移營地島嶼的特別票券。在週中立即遷移至其他島嶼營地，卡比獸能量重設並重新抽取喜愛樹果。",
      "zh-CN": "能转移营地岛屿的特别票券。在周中立即迁移至其他岛屿营地，卡比兽能量重设并重新抽取喜爱树果。",
      "en-US": "A ticket to change research sites. Move to another island mid-week; resets Snorlax energy and berry preferences."
    },
    "effects": {
      "zh-TW": "週中立即遷移至其他島嶼營地，重設卡比獸能量與喜愛樹果。",
      "zh-CN": "周中立即迁移至其他岛屿营地，重设卡比兽能量与喜爱树果。",
      "en-US": "Relocates camp to another island mid-week, resetting Snorlax strength."
    },
    "sleep_points": {
      "regular": 100,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": 150,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (100pt)",
        "鑽石商店 (150鑽石)"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (100pt)",
        "钻石商店 (150钻石)"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (100pt)",
        "Diamond Shop (150 Diamonds)"
      ]
    },
    "pokemon_ids": []
  }
];

  if (typeof window !== 'undefined') {
    window.ITEMS_DATA = ITEMS_DATA;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITEMS_DATA;
  }
})();
