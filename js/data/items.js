/**
 * js/data/items.js - Pokémon Sleep Items & Incense Master Data
 * Master dataset containing 118 items across 6 categories.
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
    "id": "growth_incense",
    "category": "functional_incense",
    "name": {
      "zh-TW": "成長薰香",
      "zh-CN": "成长熏香",
      "en-US": "Growth Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/growthincense.png",
    "description": {
      "zh-TW": "散發出助長身心氣味的薰香。就寢前設置，於次日睡眠研究時幫手寶可夢能獲得的 EXP 提升為 2 倍。",
      "zh-CN": "散发出助长身心气味的熏香。就寝前设置，于次日睡眠研究时帮手宝可梦能获得的 EXP 提升为 2 倍。",
      "en-US": "Incense that promotes growth. If set before sleeping, doubles the EXP gained by helper Pokémon during the next sleep research."
    },
    "effects": {
      "zh-TW": "睡眠研究時，幫手寶可夢獲得的 EXP 提升為 2 倍。",
      "zh-CN": "睡眠研究时，帮手宝可梦获得的 EXP 提升为 2 倍。",
      "en-US": "Doubles the EXP gained by helper Pokémon during sleep research."
    },
    "sleep_points": {
      "regular": 1500,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": 150,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,500pt)",
        "鑽石商店 (150鑽石)",
        "活動挑戰任務"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,500pt)",
        "钻石商店 (150钻石)",
        "活动挑战任务"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,500pt)",
        "Diamond Shop (150 Diamonds)",
        "Event Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "luck_incense",
    "category": "functional_incense",
    "name": {
      "zh-TW": "幸運薰香",
      "zh-CN": "幸运熏香",
      "en-US": "Luck Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/luckincense.png",
    "description": {
      "zh-TW": "散發出招來幸運氣味的薰香。就寢前設置，於次日睡眠研究時獲得的夢之碎片增加為 2 倍。",
      "zh-CN": "散发出招来幸运气味的熏香。就寝前设置，于次日睡眠研究时获得的梦之碎片增加为 2 倍。",
      "en-US": "Incense that brings good fortune. If set before sleeping, doubles the Dream Shards gained during the next sleep research."
    },
    "effects": {
      "zh-TW": "睡眠研究時，獲得的夢之碎片增加為 2 倍。",
      "zh-CN": "睡眠研究时，获得的梦之碎片增加为 2 倍。",
      "en-US": "Doubles the Dream Shards gained during sleep research."
    },
    "sleep_points": {
      "regular": 1500,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": 150,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,500pt)",
        "鑽石商店 (150鑽石)",
        "活動挑戰任務"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,500pt)",
        "钻石商店 (150钻石)",
        "活动挑战任务"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,500pt)",
        "Diamond Shop (150 Diamonds)",
        "Event Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "focus_incense",
    "category": "functional_incense",
    "name": {
      "zh-TW": "專注薰香",
      "zh-CN": "专注熏香",
      "en-US": "Focus Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/focusincense.png",
    "description": {
      "zh-TW": "散發出凝聚精神氣味的薰香。就寢前設置，於次日睡眠研究時獲得的研究 EXP 增加為 2 倍。",
      "zh-CN": "散发出凝聚精神气味的熏香。就寝前设置，于次日睡眠研究时获得的研究 EXP 增加为 2 倍。",
      "en-US": "Incense that aids concentration. If set before sleeping, doubles the Research EXP gained during the next sleep research."
    },
    "effects": {
      "zh-TW": "睡眠研究時，獲得的研究 EXP 增加為 2 倍。",
      "zh-CN": "睡眠研究时，获得的研究 EXP 增加为 2 倍。",
      "en-US": "Doubles the Research EXP gained during sleep research."
    },
    "sleep_points": {
      "regular": 1500,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": 150,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,500pt)",
        "鑽石商店 (150鑽石)",
        "活動挑戰任務"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,500pt)",
        "钻石商店 (150钻石)",
        "活动挑战任务"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,500pt)",
        "Diamond Shop (150 Diamonds)",
        "Event Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "friend_incense",
    "category": "functional_incense",
    "name": {
      "zh-TW": "友好薰香",
      "zh-CN": "友好熏香",
      "en-US": "Friend Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/friendincense.png",
    "description": {
      "zh-TW": "散發出拉近心靈氣味的薰香。就寢前設置，於次日睡眠研究點心時間必定有 1 隻以上的寶可夢進入「貪吃」狀態。",
      "zh-CN": "散发出拉近心灵气味的熏香。就寝前设置，于次日睡眠研究点心时间必定有 1 只以上的宝可梦进入“贪吃”状态。",
      "en-US": "Incense that fosters bonds. If set before sleeping, guarantees at least one Pokémon will be hungry during snack time."
    },
    "effects": {
      "zh-TW": "點心時間必定有 1 隻以上的寶可夢進入「貪吃」狀態。",
      "zh-CN": "点心时间必定有 1 只以上的宝可梦进入“贪吃”状态。",
      "en-US": "Guarantees at least one Pokémon will be hungry during snack time."
    },
    "sleep_points": {
      "regular": 1800,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": 150,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (1,800pt)",
        "鑽石商店 (150鑽石)",
        "活動挑戰任務"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (1,800pt)",
        "钻石商店 (150钻石)",
        "活动挑战任务"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (1,800pt)",
        "Diamond Shop (150 Diamonds)",
        "Event Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "recovery_incense",
    "category": "functional_incense",
    "name": {
      "zh-TW": "回復薰香",
      "zh-CN": "回复熏香",
      "en-US": "Recovery Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/recoveryincense.png",
    "description": {
      "zh-TW": "散發出舒緩身心氣味的薰香。就寢前設置，於次日睡眠研究時幫手寶可夢回復的活力增加為 2 倍。",
      "zh-CN": "散发出舒缓身心气味的熏香。就寝前设置，于次日睡眠研究时帮手宝可梦回复的活力增加为 2 倍。",
      "en-US": "Incense with a soothing scent. If set before sleeping, doubles the Energy recovered by helper Pokémon."
    },
    "effects": {
      "zh-TW": "睡眠研究時，幫手寶可夢回復的活力增加為 2 倍。",
      "zh-CN": "睡眠研究时，帮手宝可梦回复的活力增加为 2 倍。",
      "en-US": "Doubles the Energy recovered by helper Pokémon during sleep research."
    },
    "sleep_points": {
      "regular": 800,
      "premium": null,
      "limit_regular": null,
      "limit_premium": null
    },
    "diamonds": 100,
    "acquisition": {
      "zh-TW": [
        "一般睡眠點數交換所 (800pt)",
        "鑽石商店 (100鑽石)",
        "活動挑戰任務"
      ],
      "zh-CN": [
        "一般睡眠点数交换所 (800pt)",
        "钻石商店 (100钻石)",
        "活动挑战任务"
      ],
      "en-US": [
        "Regular Sleep Point Exchange (800pt)",
        "Diamond Shop (100 Diamonds)",
        "Event Missions"
      ]
    },
    "pokemon_ids": []
  },
  {
    "id": "pure_incense",
    "category": "functional_incense",
    "name": {
      "zh-TW": "通透薰香",
      "zh-CN": "通透熏香",
      "en-US": "Pure Incense"
    },
    "icon_url": "https://www.serebii.net/itemdex/sprites/pureincense.png",
    "description": {
      "zh-TW": "散發出淨化周遭氣息的清澈薰香。能淨化營地周遭氣息，大幅提高罕見睡姿與稀有寶可夢吸引機率。",
      "zh-CN": "散发出净化周遭气息的清澈熏香。能净化营地周遭气息，大幅提高罕见睡姿与稀有宝可梦吸引机率。",
      "en-US": "Incense that purifies the camp atmosphere, boosting appearances of rare sleep styles and rare Pokémon."
    },
    "effects": {
      "zh-TW": "淨化營地周遭氣息，大幅提高罕見睡姿與稀有寶可夢吸引機率。",
      "zh-CN": "净化营地周遭气息，大幅提高罕见睡姿与稀有宝可梦吸引机率。",
      "en-US": "Purifies camp air and boosts chances of encountering rare Pokémon and sleep styles."
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
        "限定活動報酬"
      ],
      "zh-CN": [
        "特别研究任务达成",
        "限定活动报酬"
      ],
      "en-US": [
        "Special Research Missions",
        "Limited Event Rewards"
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
  },
  {
    "id": "incense_bulbasaur",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "妙蛙種子薰香",
      "zh-CN": "妙蛙种子熏香",
      "en-US": "Bulbasaur Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/bulbasaurincense.png",
    "description": {
      "zh-TW": "散發出妙蛙種子喜愛香氣的薰香。在進行睡眠研究時設置，妙蛙種子必定會現身。",
      "zh-CN": "散发出妙蛙种子喜爱香气的熏香。在进行睡眠研究时设置，妙蛙种子必定会现身。",
      "en-US": "Incense with an aroma that Bulbasaur loves. If set before sleeping, a Bulbasaur is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引妙蛙種子出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引妙蛙种子出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Bulbasaur appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "1"
    ]
  },
  {
    "id": "incense_charmander",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "小火龍薰香",
      "zh-CN": "小火龙熏香",
      "en-US": "Charmander Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/charmanderincense.png",
    "description": {
      "zh-TW": "散發出小火龍喜愛香氣的薰香。在進行睡眠研究時設置，小火龍必定會現身。",
      "zh-CN": "散发出小火龙喜爱香气的熏香。在进行睡眠研究时设置，小火龙必定会现身。",
      "en-US": "Incense with an aroma that Charmander loves. If set before sleeping, a Charmander is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引小火龍出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引小火龙出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Charmander appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "4"
    ]
  },
  {
    "id": "incense_squirtle",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "傑尼龜薰香",
      "zh-CN": "杰尼龟熏香",
      "en-US": "Squirtle Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/squirtleincense.png",
    "description": {
      "zh-TW": "散發出傑尼龜喜愛香氣的薰香。在進行睡眠研究時設置，傑尼龜必定會現身。",
      "zh-CN": "散发出杰尼龟喜爱香气的熏香。在进行睡眠研究时设置，杰尼龟必定会现身。",
      "en-US": "Incense with an aroma that Squirtle loves. If set before sleeping, a Squirtle is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引傑尼龜出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引杰尼龟出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Squirtle appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "7"
    ]
  },
  {
    "id": "incense_pichu",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "皮丘薰香",
      "zh-CN": "皮丘熏香",
      "en-US": "Pichu Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/pichuincense.png",
    "description": {
      "zh-TW": "散發出皮丘喜愛香氣的薰香。在進行睡眠研究時設置，皮丘必定會現身。",
      "zh-CN": "散发出皮丘喜爱香气的熏香。在进行睡眠研究时设置，皮丘必定会现身。",
      "en-US": "Incense with an aroma that Pichu loves. If set before sleeping, a Pichu is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引皮丘出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引皮丘出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Pichu appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "172"
    ]
  },
  {
    "id": "incense_sandshrew",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "穿山鼠薰香",
      "zh-CN": "穿山鼠熏香",
      "en-US": "Sandshrew Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/sandshrewincense.png",
    "description": {
      "zh-TW": "散發出穿山鼠喜愛香氣的薰香。在進行睡眠研究時設置，穿山鼠必定會現身。",
      "zh-CN": "散发出穿山鼠喜爱香气的熏香。在进行睡眠研究时设置，穿山鼠必定会现身。",
      "en-US": "Incense with an aroma that Sandshrew loves. If set before sleeping, a Sandshrew is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引穿山鼠出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引穿山鼠出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Sandshrew appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "27"
    ]
  },
  {
    "id": "incense_vulpix",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "六尾薰香",
      "zh-CN": "六尾熏香",
      "en-US": "Vulpix Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/vulpixincense.png",
    "description": {
      "zh-TW": "散發出六尾喜愛香氣的薰香。在進行睡眠研究時設置，六尾必定會現身。",
      "zh-CN": "散发出六尾喜爱香气的熏香。在进行睡眠研究时设置，六尾必定会现身。",
      "en-US": "Incense with an aroma that Vulpix loves. If set before sleeping, a Vulpix is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引六尾出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引六尾出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Vulpix appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "37"
    ]
  },
  {
    "id": "incense_jigglypuff",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "胖丁薰香",
      "zh-CN": "胖丁熏香",
      "en-US": "Jigglypuff Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/jigglypuffincense.png",
    "description": {
      "zh-TW": "散發出胖丁喜愛香氣的薰香。在進行睡眠研究時設置，胖丁必定會現身。",
      "zh-CN": "散发出胖丁喜爱香气的熏香。在进行睡眠研究时设置，胖丁必定会现身。",
      "en-US": "Incense with an aroma that Jigglypuff loves. If set before sleeping, a Jigglypuff is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引胖丁出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引胖丁出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Jigglypuff appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "39"
    ]
  },
  {
    "id": "incense_growlithe",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "卡蒂狗薰香",
      "zh-CN": "卡蒂狗熏香",
      "en-US": "Growlithe Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/growlitheincense.png",
    "description": {
      "zh-TW": "散發出卡蒂狗喜愛香氣的薰香。在進行睡眠研究時設置，卡蒂狗必定會現身。",
      "zh-CN": "散发出卡蒂狗喜爱香气的熏香。在进行睡眠研究时设置，卡蒂狗必定会现身。",
      "en-US": "Incense with an aroma that Growlithe loves. If set before sleeping, a Growlithe is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引卡蒂狗出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引卡蒂狗出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Growlithe appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "58"
    ]
  },
  {
    "id": "incense_slowpoke",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "呆呆獸薰香",
      "zh-CN": "呆呆兽熏香",
      "en-US": "Slowpoke Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/slowpokeincense.png",
    "description": {
      "zh-TW": "散發出呆呆獸喜愛香氣的薰香。在進行睡眠研究時設置，呆呆獸必定會現身。",
      "zh-CN": "散发出呆呆兽喜爱香气的熏香。在进行睡眠研究时设置，呆呆兽必定会现身。",
      "en-US": "Incense with an aroma that Slowpoke loves. If set before sleeping, a Slowpoke is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引呆呆獸出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引呆呆兽出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Slowpoke appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "79"
    ]
  },
  {
    "id": "incense_gastly",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "鬼斯薰香",
      "zh-CN": "鬼斯熏香",
      "en-US": "Gastly Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/gastlyincense.png",
    "description": {
      "zh-TW": "散發出鬼斯喜愛香氣的薰香。在進行睡眠研究時設置，鬼斯必定會現身。",
      "zh-CN": "散发出鬼斯喜爱香气的熏香。在进行睡眠研究时设置，鬼斯必定会现身。",
      "en-US": "Incense with an aroma that Gastly loves. If set before sleeping, a Gastly is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引鬼斯出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引鬼斯出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Gastly appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "92"
    ]
  },
  {
    "id": "incense_happiny",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "小福蛋薰香",
      "zh-CN": "小福蛋熏香",
      "en-US": "Happiny Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/happinyincense.png",
    "description": {
      "zh-TW": "散發出小福蛋喜愛香氣的薰香。在進行睡眠研究時設置，小福蛋必定會現身。",
      "zh-CN": "散发出小福蛋喜爱香气的熏香。在进行睡眠研究时设置，小福蛋必定会现身。",
      "en-US": "Incense with an aroma that Happiny loves. If set before sleeping, a Happiny is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引小福蛋出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引小福蛋出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Happiny appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "440"
    ]
  },
  {
    "id": "incense_chansey",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "吉利蛋薰香",
      "zh-CN": "吉利蛋熏香",
      "en-US": "Chansey Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/chanseyincense.png",
    "description": {
      "zh-TW": "散發出吉利蛋喜愛香氣的薰香。在進行睡眠研究時設置，吉利蛋必定會現身。",
      "zh-CN": "散发出吉利蛋喜爱香气的熏香。在进行睡眠研究时设置，吉利蛋必定会现身。",
      "en-US": "Incense with an aroma that Chansey loves. If set before sleeping, a Chansey is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引吉利蛋出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引吉利蛋出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Chansey appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "113"
    ]
  },
  {
    "id": "incense_mimejr",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "魔尼尼薰香",
      "zh-CN": "魔尼尼熏香",
      "en-US": "Mime Jr. Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/mimejrincense.png",
    "description": {
      "zh-TW": "散發出魔尼尼喜愛香氣的薰香。在進行睡眠研究時設置，魔尼尼必定會現身。",
      "zh-CN": "散发出魔尼尼喜爱香气的熏香。在进行睡眠研究时设置，魔尼尼必定会现身。",
      "en-US": "Incense with an aroma that Mime Jr. loves. If set before sleeping, a Mime Jr. is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引魔尼尼出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引魔尼尼出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Mime Jr. appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "439"
    ]
  },
  {
    "id": "incense_pinsir",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "凱羅斯薰香",
      "zh-CN": "凯罗斯熏香",
      "en-US": "Pinsir Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/pinsirincense.png",
    "description": {
      "zh-TW": "散發出凱羅斯喜愛香氣的薰香。在進行睡眠研究時設置，凱羅斯必定會現身。",
      "zh-CN": "散发出凯罗斯喜爱香气的熏香。在进行睡眠研究时设置，凯罗斯必定会现身。",
      "en-US": "Incense with an aroma that Pinsir loves. If set before sleeping, a Pinsir is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引凱羅斯出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引凯罗斯出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Pinsir appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "127"
    ]
  },
  {
    "id": "incense_ditto",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "百變怪薰香",
      "zh-CN": "百变怪熏香",
      "en-US": "Ditto Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/dittoincense.png",
    "description": {
      "zh-TW": "散發出百變怪喜愛香氣的薰香。在進行睡眠研究時設置，百變怪必定會現身。",
      "zh-CN": "散发出百变怪喜爱香气的熏香。在进行睡眠研究时设置，百变怪必定会现身。",
      "en-US": "Incense with an aroma that Ditto loves. If set before sleeping, a Ditto is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引百變怪出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引百变怪出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Ditto appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "132"
    ]
  },
  {
    "id": "incense_eevee",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "伊布薰香",
      "zh-CN": "伊布熏香",
      "en-US": "Eevee Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/eeveeincense.png",
    "description": {
      "zh-TW": "散發出伊布喜愛香氣的薰香。在進行睡眠研究時設置，伊布必定會現身。",
      "zh-CN": "散发出伊布喜爱香气的熏香。在进行睡眠研究时设置，伊布必定会现身。",
      "en-US": "Incense with an aroma that Eevee loves. If set before sleeping, a Eevee is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引伊布出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引伊布出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Eevee appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "133"
    ]
  },
  {
    "id": "incense_sylveon",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "仙子伊布薰香",
      "zh-CN": "仙子伊布熏香",
      "en-US": "Sylveon Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/sylveonincense.png",
    "description": {
      "zh-TW": "散發出仙子伊布喜愛香氣的薰香。在進行睡眠研究時設置，仙子伊布必定會現身。",
      "zh-CN": "散发出仙子伊布喜爱香气的熏香。在进行睡眠研究时设置，仙子伊布必定会现身。",
      "en-US": "Incense with an aroma that Sylveon loves. If set before sleeping, a Sylveon is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引仙子伊布出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引仙子伊布出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Sylveon appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "700"
    ]
  },
  {
    "id": "incense_dratini",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "迷你龍薰香",
      "zh-CN": "迷你龙熏香",
      "en-US": "Dratini Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/dratiniincense.png",
    "description": {
      "zh-TW": "散發出迷你龍喜愛香氣的薰香。在進行睡眠研究時設置，迷你龍必定會現身。",
      "zh-CN": "散发出迷你龙喜爱香气的熏香。在进行睡眠研究时设置，迷你龙必定会现身。",
      "en-US": "Incense with an aroma that Dratini loves. If set before sleeping, a Dratini is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引迷你龍出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引迷你龙出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Dratini appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "147"
    ]
  },
  {
    "id": "incense_mewtwo",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "超夢薰香",
      "zh-CN": "超梦熏香",
      "en-US": "Mewtwo Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/mewtwoincense.png",
    "description": {
      "zh-TW": "散發出超夢喜愛香氣的薰香。在進行睡眠研究時設置，超夢必定會現身。",
      "zh-CN": "散发出超梦喜爱香气的熏香。在进行睡眠研究时设置，超梦必定会现身。",
      "en-US": "Incense with an aroma that Mewtwo loves. If set before sleeping, a Mewtwo is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引超夢出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引超梦出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Mewtwo appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "150"
    ]
  },
  {
    "id": "incense_chikorita",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "菊草葉薰香",
      "zh-CN": "菊草叶熏香",
      "en-US": "Chikorita Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/chikoritaincense.png",
    "description": {
      "zh-TW": "散發出菊草葉喜愛香氣的薰香。在進行睡眠研究時設置，菊草葉必定會現身。",
      "zh-CN": "散发出菊草叶喜爱香气的熏香。在进行睡眠研究时设置，菊草叶必定会现身。",
      "en-US": "Incense with an aroma that Chikorita loves. If set before sleeping, a Chikorita is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引菊草葉出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引菊草叶出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Chikorita appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "152"
    ]
  },
  {
    "id": "incense_cyndaquil",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "火球鼠薰香",
      "zh-CN": "火球鼠熏香",
      "en-US": "Cyndaquil Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/cyndaquilincense.png",
    "description": {
      "zh-TW": "散發出火球鼠喜愛香氣的薰香。在進行睡眠研究時設置，火球鼠必定會現身。",
      "zh-CN": "散发出火球鼠喜爱香气的熏香。在进行睡眠研究时设置，火球鼠必定会现身。",
      "en-US": "Incense with an aroma that Cyndaquil loves. If set before sleeping, a Cyndaquil is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引火球鼠出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引火球鼠出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Cyndaquil appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "155"
    ]
  },
  {
    "id": "incense_totodile",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "小鋸鱷薰香",
      "zh-CN": "小锯鳄熏香",
      "en-US": "Totodile Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/totodileincense.png",
    "description": {
      "zh-TW": "散發出小鋸鱷喜愛香氣的薰香。在進行睡眠研究時設置，小鋸鱷必定會現身。",
      "zh-CN": "散发出小锯鳄喜爱香气的熏香。在进行睡眠研究时设置，小锯鳄必定会现身。",
      "en-US": "Incense with an aroma that Totodile loves. If set before sleeping, a Totodile is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引小鋸鱷出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引小锯鳄出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Totodile appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "158"
    ]
  },
  {
    "id": "incense_natu",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "天然雀薰香",
      "zh-CN": "天然雀熏香",
      "en-US": "Natu Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/natuincense.png",
    "description": {
      "zh-TW": "散發出天然雀喜愛香氣的薰香。在進行睡眠研究時設置，天然雀必定會現身。",
      "zh-CN": "散发出天然雀喜爱香气的熏香。在进行睡眠研究时设置，天然雀必定会现身。",
      "en-US": "Incense with an aroma that Natu loves. If set before sleeping, a Natu is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引天然雀出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引天然雀出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Natu appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "177"
    ]
  },
  {
    "id": "incense_mareep",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "咩利羊薰香",
      "zh-CN": "咩利羊熏香",
      "en-US": "Mareep Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/mareepincense.png",
    "description": {
      "zh-TW": "散發出咩利羊喜愛香氣的薰香。在進行睡眠研究時設置，咩利羊必定會現身。",
      "zh-CN": "散发出咩利羊喜爱香气的熏香。在进行睡眠研究时设置，咩利羊必定会现身。",
      "en-US": "Incense with an aroma that Mareep loves. If set before sleeping, a Mareep is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引咩利羊出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引咩利羊出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Mareep appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "179"
    ]
  },
  {
    "id": "incense_wooper",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "烏波薰香",
      "zh-CN": "乌波熏香",
      "en-US": "Wooper Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/wooperincense.png",
    "description": {
      "zh-TW": "散發出烏波喜愛香氣的薰香。在進行睡眠研究時設置，烏波必定會現身。",
      "zh-CN": "散发出乌波喜爱香气的熏香。在进行睡眠研究时设置，乌波必定会现身。",
      "en-US": "Incense with an aroma that Wooper loves. If set before sleeping, a Wooper is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引烏波出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引乌波出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Wooper appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "194"
    ]
  },
  {
    "id": "incense_murkrow",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "黑暗鴉薰香",
      "zh-CN": "黑暗鸦熏香",
      "en-US": "Murkrow Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/murkrowincense.png",
    "description": {
      "zh-TW": "散發出黑暗鴉喜愛香氣的薰香。在進行睡眠研究時設置，黑暗鴉必定會現身。",
      "zh-CN": "散发出黑暗鸦喜爱香气的熏香。在进行睡眠研究时设置，黑暗鸦必定会现身。",
      "en-US": "Incense with an aroma that Murkrow loves. If set before sleeping, a Murkrow is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引黑暗鴉出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引黑暗鸦出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Murkrow appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "198"
    ]
  },
  {
    "id": "incense_wynaut",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "小果然薰香",
      "zh-CN": "小果然熏香",
      "en-US": "Wynaut Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/wynautincense.png",
    "description": {
      "zh-TW": "散發出小果然喜愛香氣的薰香。在進行睡眠研究時設置，小果然必定會現身。",
      "zh-CN": "散发出小果然喜爱香气的熏香。在进行睡眠研究时设置，小果然必定会现身。",
      "en-US": "Incense with an aroma that Wynaut loves. If set before sleeping, a Wynaut is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引小果然出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引小果然出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Wynaut appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "360"
    ]
  },
  {
    "id": "incense_shuckle",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "壺壺薰香",
      "zh-CN": "壶壶熏香",
      "en-US": "Shuckle Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/shuckleincense.png",
    "description": {
      "zh-TW": "散發出壺壺喜愛香氣的薰香。在進行睡眠研究時設置，壺壺必定會現身。",
      "zh-CN": "散发出壶壶喜爱香气的熏香。在进行睡眠研究时设置，壶壶必定会现身。",
      "en-US": "Incense with an aroma that Shuckle loves. If set before sleeping, a Shuckle is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引壺壺出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引壶壶出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Shuckle appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "213"
    ]
  },
  {
    "id": "incense_heracross",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "赫拉克羅斯薰香",
      "zh-CN": "赫拉克罗斯熏香",
      "en-US": "Heracross Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/heracrossincense.png",
    "description": {
      "zh-TW": "散發出赫拉克羅斯喜愛香氣的薰香。在進行睡眠研究時設置，赫拉克羅斯必定會現身。",
      "zh-CN": "散发出赫拉克罗斯喜爱香气的熏香。在进行睡眠研究时设置，赫拉克罗斯必定会现身。",
      "en-US": "Incense with an aroma that Heracross loves. If set before sleeping, a Heracross is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引赫拉克羅斯出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引赫拉克罗斯出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Heracross appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "214"
    ]
  },
  {
    "id": "incense_raikou",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "雷公薰香",
      "zh-CN": "雷公熏香",
      "en-US": "Raikou Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/raikouincense.png",
    "description": {
      "zh-TW": "散發出雷公喜愛香氣的薰香。在進行睡眠研究時設置，雷公必定會現身。",
      "zh-CN": "散发出雷公喜爱香气的熏香。在进行睡眠研究时设置，雷公必定会现身。",
      "en-US": "Incense with an aroma that Raikou loves. If set before sleeping, a Raikou is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引雷公出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引雷公出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Raikou appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "243"
    ]
  },
  {
    "id": "incense_entei",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "炎帝薰香",
      "zh-CN": "炎帝熏香",
      "en-US": "Entei Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/enteiincense.png",
    "description": {
      "zh-TW": "散發出炎帝喜愛香氣的薰香。在進行睡眠研究時設置，炎帝必定會現身。",
      "zh-CN": "散发出炎帝喜爱香气的熏香。在进行睡眠研究时设置，炎帝必定会现身。",
      "en-US": "Incense with an aroma that Entei loves. If set before sleeping, a Entei is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引炎帝出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引炎帝出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Entei appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "244"
    ]
  },
  {
    "id": "incense_suicune",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "水君薰香",
      "zh-CN": "水君熏香",
      "en-US": "Suicune Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/suicuneincense.png",
    "description": {
      "zh-TW": "散發出水君喜愛香氣的薰香。在進行睡眠研究時設置，水君必定會現身。",
      "zh-CN": "散发出水君喜爱香气的熏香。在进行睡眠研究时设置，水君必定会现身。",
      "en-US": "Incense with an aroma that Suicune loves. If set before sleeping, a Suicune is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引水君出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引水君出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Suicune appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "245"
    ]
  },
  {
    "id": "incense_treecko",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "木守宮薰香",
      "zh-CN": "木守宫熏香",
      "en-US": "Treecko Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/treeckoincense.png",
    "description": {
      "zh-TW": "散發出木守宮喜愛香氣的薰香。在進行睡眠研究時設置，木守宮必定會現身。",
      "zh-CN": "散发出木守宫喜爱香气的熏香。在进行睡眠研究时设置，木守宫必定会现身。",
      "en-US": "Incense with an aroma that Treecko loves. If set before sleeping, a Treecko is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引木守宮出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引木守宫出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Treecko appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "252"
    ]
  },
  {
    "id": "incense_torchic",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "火稚雞薰香",
      "zh-CN": "火稚鸡熏香",
      "en-US": "Torchic Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/torchicincense.png",
    "description": {
      "zh-TW": "散發出火稚雞喜愛香氣的薰香。在進行睡眠研究時設置，火稚雞必定會現身。",
      "zh-CN": "散发出火稚鸡喜爱香气的熏香。在进行睡眠研究时设置，火稚鸡必定会现身。",
      "en-US": "Incense with an aroma that Torchic loves. If set before sleeping, a Torchic is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引火稚雞出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引火稚鸡出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Torchic appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "255"
    ]
  },
  {
    "id": "incense_mudkip",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "水躍魚薰香",
      "zh-CN": "水跃鱼熏香",
      "en-US": "Mudkip Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/mudkipincense.png",
    "description": {
      "zh-TW": "散發出水躍魚喜愛香氣的薰香。在進行睡眠研究時設置，水躍魚必定會現身。",
      "zh-CN": "散发出水跃鱼喜爱香气的熏香。在进行睡眠研究时设置，水跃鱼必定会现身。",
      "en-US": "Incense with an aroma that Mudkip loves. If set before sleeping, a Mudkip is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引水躍魚出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引水跃鱼出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Mudkip appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "258"
    ]
  },
  {
    "id": "incense_ralts",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "拉魯拉絲薰香",
      "zh-CN": "拉鲁拉丝熏香",
      "en-US": "Ralts Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/raltsincense.png",
    "description": {
      "zh-TW": "散發出拉魯拉絲喜愛香氣的薰香。在進行睡眠研究時設置，拉魯拉絲必定會現身。",
      "zh-CN": "散发出拉鲁拉丝喜爱香气的熏香。在进行睡眠研究时设置，拉鲁拉丝必定会现身。",
      "en-US": "Incense with an aroma that Ralts loves. If set before sleeping, a Ralts is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引拉魯拉絲出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引拉鲁拉丝出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Ralts appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "280"
    ]
  },
  {
    "id": "incense_mawile",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "大嘴娃薰香",
      "zh-CN": "大嘴娃熏香",
      "en-US": "Mawile Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/mawileincense.png",
    "description": {
      "zh-TW": "散發出大嘴娃喜愛香氣的薰香。在進行睡眠研究時設置，大嘴娃必定會現身。",
      "zh-CN": "散发出大嘴娃喜爱香气的熏香。在进行睡眠研究时设置，大嘴娃必定会现身。",
      "en-US": "Incense with an aroma that Mawile loves. If set before sleeping, a Mawile is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引大嘴娃出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引大嘴娃出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Mawile appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "303"
    ]
  },
  {
    "id": "incense_aron",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "可可多拉薰香",
      "zh-CN": "可可多拉熏香",
      "en-US": "Aron Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/aronincense.png",
    "description": {
      "zh-TW": "散發出可可多拉喜愛香氣的薰香。在進行睡眠研究時設置，可可多拉必定會現身。",
      "zh-CN": "散发出可可多拉喜爱香气的熏香。在进行睡眠研究时设置，可可多拉必定会现身。",
      "en-US": "Incense with an aroma that Aron loves. If set before sleeping, a Aron is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引可可多拉出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引可可多拉出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Aron appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "304"
    ]
  },
  {
    "id": "incense_plusle",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "正電拍拍薰香",
      "zh-CN": "正电拍拍熏香",
      "en-US": "Plusle Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/plusleincense.png",
    "description": {
      "zh-TW": "散發出正電拍拍喜愛香氣的薰香。在進行睡眠研究時設置，正電拍拍必定會現身。",
      "zh-CN": "散发出正电拍拍喜爱香气的熏香。在进行睡眠研究时设置，正电拍拍必定会现身。",
      "en-US": "Incense with an aroma that Plusle loves. If set before sleeping, a Plusle is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引正電拍拍出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引正电拍拍出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Plusle appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "311"
    ]
  },
  {
    "id": "incense_minun",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "負電拍拍薰香",
      "zh-CN": "负电拍拍熏香",
      "en-US": "Minun Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/minunincense.png",
    "description": {
      "zh-TW": "散發出負電拍拍喜愛香氣的薰香。在進行睡眠研究時設置，負電拍拍必定會現身。",
      "zh-CN": "散发出负电拍拍喜爱香气的熏香。在进行睡眠研究时设置，负电拍拍必定会现身。",
      "en-US": "Incense with an aroma that Minun loves. If set before sleeping, a Minun is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引負電拍拍出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引负电拍拍出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Minun appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "312"
    ]
  },
  {
    "id": "incense_trapinch",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "大顎蟻薰香",
      "zh-CN": "大颚蚁熏香",
      "en-US": "Trapinch Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/trapinchincense.png",
    "description": {
      "zh-TW": "散發出大顎蟻喜愛香氣的薰香。在進行睡眠研究時設置，大顎蟻必定會現身。",
      "zh-CN": "散发出大颚蚁喜爱香气的熏香。在进行睡眠研究时设置，大颚蚁必定会现身。",
      "en-US": "Incense with an aroma that Trapinch loves. If set before sleeping, a Trapinch is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引大顎蟻出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引大颚蚁出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Trapinch appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "328"
    ]
  },
  {
    "id": "incense_shuppet",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "怨影娃娃薰香",
      "zh-CN": "怨影娃娃熏香",
      "en-US": "Shuppet Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/shuppetincense.png",
    "description": {
      "zh-TW": "散發出怨影娃娃喜愛香氣的薰香。在進行睡眠研究時設置，怨影娃娃必定會現身。",
      "zh-CN": "散发出怨影娃娃喜爱香气的熏香。在进行睡眠研究时设置，怨影娃娃必定会现身。",
      "en-US": "Incense with an aroma that Shuppet loves. If set before sleeping, a Shuppet is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引怨影娃娃出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引怨影娃娃出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Shuppet appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "353"
    ]
  },
  {
    "id": "incense_absol",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "阿勃梭魯薰香",
      "zh-CN": "阿勃梭鲁熏香",
      "en-US": "Absol Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/absolincense.png",
    "description": {
      "zh-TW": "散發出阿勃梭魯喜愛香氣的薰香。在進行睡眠研究時設置，阿勃梭魯必定會現身。",
      "zh-CN": "散发出阿勃梭鲁喜爱香气的熏香。在进行睡眠研究时设置，阿勃梭鲁必定会现身。",
      "en-US": "Incense with an aroma that Absol loves. If set before sleeping, a Absol is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引阿勃梭魯出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引阿勃梭鲁出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Absol appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "359"
    ]
  },
  {
    "id": "incense_bagon",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "寶貝龍薰香",
      "zh-CN": "宝贝龙熏香",
      "en-US": "Bagon Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/bagonincense.png",
    "description": {
      "zh-TW": "散發出寶貝龍喜愛香氣的薰香。在進行睡眠研究時設置，寶貝龍必定會現身。",
      "zh-CN": "散发出宝贝龙喜爱香气的熏香。在进行睡眠研究时设置，宝贝龙必定会现身。",
      "en-US": "Incense with an aroma that Bagon loves. If set before sleeping, a Bagon is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引寶貝龍出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引宝贝龙出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Bagon appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "371"
    ]
  },
  {
    "id": "incense_latias",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "拉帝亞斯薰香",
      "zh-CN": "拉帝亚斯熏香",
      "en-US": "Latias Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/latiasincense.png",
    "description": {
      "zh-TW": "散發出拉帝亞斯喜愛香氣的薰香。在進行睡眠研究時設置，拉帝亞斯必定會現身。",
      "zh-CN": "散发出拉帝亚斯喜爱香气的熏香。在进行睡眠研究时设置，拉帝亚斯必定会现身。",
      "en-US": "Incense with an aroma that Latias loves. If set before sleeping, a Latias is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引拉帝亞斯出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引拉帝亚斯出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Latias appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "380"
    ]
  },
  {
    "id": "incense_latios",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "拉帝歐斯薰香",
      "zh-CN": "拉帝欧斯熏香",
      "en-US": "Latios Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/latiosincense.png",
    "description": {
      "zh-TW": "散發出拉帝歐斯喜愛香氣的薰香。在進行睡眠研究時設置，拉帝歐斯必定會現身。",
      "zh-CN": "散发出拉帝欧斯喜爱香气的熏香。在进行睡眠研究时设置，拉帝欧斯必定会现身。",
      "en-US": "Incense with an aroma that Latios loves. If set before sleeping, a Latios is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引拉帝歐斯出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引拉帝欧斯出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Latios appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "381"
    ]
  },
  {
    "id": "incense_turtwig",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "草苗龜薰香",
      "zh-CN": "草苗龟熏香",
      "en-US": "Turtwig Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/turtwigincense.png",
    "description": {
      "zh-TW": "散發出草苗龜喜愛香氣的薰香。在進行睡眠研究時設置，草苗龜必定會現身。",
      "zh-CN": "散发出草苗龟喜爱香气的熏香。在进行睡眠研究时设置，草苗龟必定会现身。",
      "en-US": "Incense with an aroma that Turtwig loves. If set before sleeping, a Turtwig is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引草苗龜出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引草苗龟出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Turtwig appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "387"
    ]
  },
  {
    "id": "incense_chimchar",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "小火焰猴薰香",
      "zh-CN": "小火焰猴熏香",
      "en-US": "Chimchar Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/chimcharincense.png",
    "description": {
      "zh-TW": "散發出小火焰猴喜愛香氣的薰香。在進行睡眠研究時設置，小火焰猴必定會現身。",
      "zh-CN": "散发出小火焰猴喜爱香气的熏香。在进行睡眠研究时设置，小火焰猴必定会现身。",
      "en-US": "Incense with an aroma that Chimchar loves. If set before sleeping, a Chimchar is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引小火焰猴出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引小火焰猴出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Chimchar appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "390"
    ]
  },
  {
    "id": "incense_piplup",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "波加曼薰香",
      "zh-CN": "波加曼熏香",
      "en-US": "Piplup Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/piplupincense.png",
    "description": {
      "zh-TW": "散發出波加曼喜愛香氣的薰香。在進行睡眠研究時設置，波加曼必定會現身。",
      "zh-CN": "散发出波加曼喜爱香气的熏香。在进行睡眠研究时设置，波加曼必定会现身。",
      "en-US": "Incense with an aroma that Piplup loves. If set before sleeping, a Piplup is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引波加曼出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引波加曼出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Piplup appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "393"
    ]
  },
  {
    "id": "incense_shinx",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "小貓怪薰香",
      "zh-CN": "小猫怪熏香",
      "en-US": "Shinx Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/shinxincense.png",
    "description": {
      "zh-TW": "散發出小貓怪喜愛香氣的薰香。在進行睡眠研究時設置，小貓怪必定會現身。",
      "zh-CN": "散发出小猫怪喜爱香气的熏香。在进行睡眠研究时设置，小猫怪必定会现身。",
      "en-US": "Incense with an aroma that Shinx loves. If set before sleeping, a Shinx is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引小貓怪出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引小猫怪出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Shinx appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "403"
    ]
  },
  {
    "id": "incense_drifloon",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "飄飄球薰香",
      "zh-CN": "飘飘球熏香",
      "en-US": "Drifloon Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/drifloonincense.png",
    "description": {
      "zh-TW": "散發出飄飄球喜愛香氣的薰香。在進行睡眠研究時設置，飄飄球必定會現身。",
      "zh-CN": "散发出飘飘球喜爱香气的熏香。在进行睡眠研究时设置，飘飘球必定会现身。",
      "en-US": "Incense with an aroma that Drifloon loves. If set before sleeping, a Drifloon is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引飄飄球出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引飘飘球出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Drifloon appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "425"
    ]
  },
  {
    "id": "incense_spiritomb",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "花岩怪薰香",
      "zh-CN": "花岩怪熏香",
      "en-US": "Spiritomb Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/spiritombincense.png",
    "description": {
      "zh-TW": "散發出花岩怪喜愛香氣的薰香。在進行睡眠研究時設置，花岩怪必定會現身。",
      "zh-CN": "散发出花岩怪喜爱香气的熏香。在进行睡眠研究时设置，花岩怪必定会现身。",
      "en-US": "Incense with an aroma that Spiritomb loves. If set before sleeping, a Spiritomb is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引花岩怪出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引花岩怪出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Spiritomb appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "442"
    ]
  },
  {
    "id": "incense_cresselia",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "克雷色利亞薰香",
      "zh-CN": "克雷色利亚熏香",
      "en-US": "Cresselia Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/cresseliaincense.png",
    "description": {
      "zh-TW": "散發出克雷色利亞喜愛香氣的薰香。在進行睡眠研究時設置，克雷色利亞必定會現身。",
      "zh-CN": "散发出克雷色利亚喜爱香气的熏香。在进行睡眠研究时设置，克雷色利亚必定会现身。",
      "en-US": "Incense with an aroma that Cresselia loves. If set before sleeping, a Cresselia is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引克雷色利亞出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引克雷色利亚出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Cresselia appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "488"
    ]
  },
  {
    "id": "incense_munna",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "食夢夢薰香",
      "zh-CN": "食梦梦熏香",
      "en-US": "Munna Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/munnaincense.png",
    "description": {
      "zh-TW": "散發出食夢夢喜愛香氣的薰香。在進行睡眠研究時設置，食夢夢必定會現身。",
      "zh-CN": "散发出食梦梦喜爱香气的熏香。在进行睡眠研究时设置，食梦梦必定会现身。",
      "en-US": "Incense with an aroma that Munna loves. If set before sleeping, a Munna is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引食夢夢出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引食梦梦出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Munna appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "517"
    ]
  },
  {
    "id": "incense_dwebble",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "石居蟹薰香",
      "zh-CN": "石居蟹熏香",
      "en-US": "Dwebble Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/dwebbleincense.png",
    "description": {
      "zh-TW": "散發出石居蟹喜愛香氣的薰香。在進行睡眠研究時設置，石居蟹必定會現身。",
      "zh-CN": "散发出石居蟹喜爱香气的熏香。在进行睡眠研究时设置，石居蟹必定会现身。",
      "en-US": "Incense with an aroma that Dwebble loves. If set before sleeping, a Dwebble is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引石居蟹出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引石居蟹出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Dwebble appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "557"
    ]
  },
  {
    "id": "incense_foongus",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "哎呀球菇薰香",
      "zh-CN": "哎呀球菇熏香",
      "en-US": "Foongus Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/foongusincense.png",
    "description": {
      "zh-TW": "散發出哎呀球菇喜愛香氣的薰香。在進行睡眠研究時設置，哎呀球菇必定會現身。",
      "zh-CN": "散发出哎呀球菇喜爱香气的熏香。在进行睡眠研究时设置，哎呀球菇必定会现身。",
      "en-US": "Incense with an aroma that Foongus loves. If set before sleeping, a Foongus is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引哎呀球菇出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引哎呀球菇出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Foongus appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "590"
    ]
  },
  {
    "id": "incense_rufflet",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "毛頭小鷹薰香",
      "zh-CN": "毛头小鹰熏香",
      "en-US": "Rufflet Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/ruffletincense.png",
    "description": {
      "zh-TW": "散發出毛頭小鷹喜愛香氣的薰香。在進行睡眠研究時設置，毛頭小鷹必定會現身。",
      "zh-CN": "散发出毛头小鹰喜爱香气的熏香。在进行睡眠研究时设置，毛头小鹰必定会现身。",
      "en-US": "Incense with an aroma that Rufflet loves. If set before sleeping, a Rufflet is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引毛頭小鷹出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引毛头小鹰出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Rufflet appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "627"
    ]
  },
  {
    "id": "incense_tyrunt",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "寶寶暴龍薰香",
      "zh-CN": "宝宝暴龙熏香",
      "en-US": "Tyrunt Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/tyruntincense.png",
    "description": {
      "zh-TW": "散發出寶寶暴龍喜愛香氣的薰香。在進行睡眠研究時設置，寶寶暴龍必定會現身。",
      "zh-CN": "散发出宝宝暴龙喜爱香气的熏香。在进行睡眠研究时设置，宝宝暴龙必定会现身。",
      "en-US": "Incense with an aroma that Tyrunt loves. If set before sleeping, a Tyrunt is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引寶寶暴龍出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引宝宝暴龙出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Tyrunt appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "696"
    ]
  },
  {
    "id": "incense_hawlucha",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "摔角鷹人薰香",
      "zh-CN": "摔角鹰人熏香",
      "en-US": "Hawlucha Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/hawluchaincense.png",
    "description": {
      "zh-TW": "散發出摔角鷹人喜愛香氣的薰香。在進行睡眠研究時設置，摔角鷹人必定會現身。",
      "zh-CN": "散发出摔角鹰人喜爱香气的熏香。在进行睡眠研究时设置，摔角鹰人必定会现身。",
      "en-US": "Incense with an aroma that Hawlucha loves. If set before sleeping, a Hawlucha is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引摔角鷹人出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引摔角鹰人出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Hawlucha appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "701"
    ]
  },
  {
    "id": "incense_dedenne",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "咚咚鼠薰香",
      "zh-CN": "咚咚鼠熏香",
      "en-US": "Dedenne Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/dedenneincense.png",
    "description": {
      "zh-TW": "散發出咚咚鼠喜愛香氣的薰香。在進行睡眠研究時設置，咚咚鼠必定會現身。",
      "zh-CN": "散发出咚咚鼠喜爱香气的熏香。在进行睡眠研究时设置，咚咚鼠必定会现身。",
      "en-US": "Incense with an aroma that Dedenne loves. If set before sleeping, a Dedenne is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引咚咚鼠出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引咚咚鼠出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Dedenne appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "702"
    ]
  },
  {
    "id": "incense_noibat",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "嗡蝠薰香",
      "zh-CN": "嗡蝠熏香",
      "en-US": "Noibat Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/noibatincense.png",
    "description": {
      "zh-TW": "散發出嗡蝠喜愛香氣的薰香。在進行睡眠研究時設置，嗡蝠必定會現身。",
      "zh-CN": "散发出嗡蝠喜爱香气的熏香。在进行睡眠研究时设置，嗡蝠必定会现身。",
      "en-US": "Incense with an aroma that Noibat loves. If set before sleeping, a Noibat is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引嗡蝠出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引嗡蝠出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Noibat appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "714"
    ]
  },
  {
    "id": "incense_grubbin",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "強顎雞母蟲薰香",
      "zh-CN": "强颚鸡母虫熏香",
      "en-US": "Grubbin Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/grubbinincense.png",
    "description": {
      "zh-TW": "散發出強顎雞母蟲喜愛香氣的薰香。在進行睡眠研究時設置，強顎雞母蟲必定會現身。",
      "zh-CN": "散发出强颚鸡母虫喜爱香气的熏香。在进行睡眠研究时设置，强颚鸡母虫必定会现身。",
      "en-US": "Incense with an aroma that Grubbin loves. If set before sleeping, a Grubbin is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引強顎雞母蟲出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引强颚鸡母虫出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Grubbin appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "736"
    ]
  },
  {
    "id": "incense_cutiefly",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "萌虻薰香",
      "zh-CN": "萌虻熏香",
      "en-US": "Cutiefly Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/cutieflyincense.png",
    "description": {
      "zh-TW": "散發出萌虻喜愛香氣的薰香。在進行睡眠研究時設置，萌虻必定會現身。",
      "zh-CN": "散发出萌虻喜爱香气的熏香。在进行睡眠研究时设置，萌虻必定会现身。",
      "en-US": "Incense with an aroma that Cutiefly loves. If set before sleeping, a Cutiefly is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引萌虻出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引萌虻出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Cutiefly appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "742"
    ]
  },
  {
    "id": "incense_stufful",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "童偶熊薰香",
      "zh-CN": "童偶熊熏香",
      "en-US": "Stufful Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/stuffulincense.png",
    "description": {
      "zh-TW": "散發出童偶熊喜愛香氣的薰香。在進行睡眠研究時設置，童偶熊必定會現身。",
      "zh-CN": "散发出童偶熊喜爱香气的熏香。在进行睡眠研究时设置，童偶熊必定会现身。",
      "en-US": "Incense with an aroma that Stufful loves. If set before sleeping, a Stufful is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引童偶熊出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引童偶熊出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Stufful appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "759"
    ]
  },
  {
    "id": "incense_comfey",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "花療環環薰香",
      "zh-CN": "花疗环环熏香",
      "en-US": "Comfey Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/comfeyincense.png",
    "description": {
      "zh-TW": "散發出花療環環喜愛香氣的薰香。在進行睡眠研究時設置，花療環環必定會現身。",
      "zh-CN": "散发出花疗环环喜爱香气的熏香。在进行睡眠研究时设置，花疗环环必定会现身。",
      "en-US": "Incense with an aroma that Comfey loves. If set before sleeping, a Comfey is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引花療環環出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引花疗环环出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Comfey appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "764"
    ]
  },
  {
    "id": "incense_togedemaru",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "托戈德瑪爾薰香",
      "zh-CN": "托戈德玛尔熏香",
      "en-US": "Togedemaru Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/togedemaruincense.png",
    "description": {
      "zh-TW": "散發出托戈德瑪爾喜愛香氣的薰香。在進行睡眠研究時設置，托戈德瑪爾必定會現身。",
      "zh-CN": "散发出托戈德玛尔喜爱香气的熏香。在进行睡眠研究时设置，托戈德玛尔必定会现身。",
      "en-US": "Incense with an aroma that Togedemaru loves. If set before sleeping, a Togedemaru is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引托戈德瑪爾出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引托戈德玛尔出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Togedemaru appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "777"
    ]
  },
  {
    "id": "incense_mimikyu",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "謎擬Q薰香",
      "zh-CN": "谜拟Q熏香",
      "en-US": "Mimikyu Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/mimikyuincense.png",
    "description": {
      "zh-TW": "散發出謎擬Q喜愛香氣的薰香。在進行睡眠研究時設置，謎擬Q必定會現身。",
      "zh-CN": "散发出谜拟Q喜爱香气的熏香。在进行睡眠研究时设置，谜拟Q必定会现身。",
      "en-US": "Incense with an aroma that Mimikyu loves. If set before sleeping, a Mimikyu is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引謎擬Q出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引谜拟Q出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Mimikyu appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "778"
    ]
  },
  {
    "id": "incense_drampa",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "老翁龍薰香",
      "zh-CN": "老翁龙熏香",
      "en-US": "Drampa Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/drampaincense.png",
    "description": {
      "zh-TW": "散發出老翁龍喜愛香氣的薰香。在進行睡眠研究時設置，老翁龍必定會現身。",
      "zh-CN": "散发出老翁龙喜爱香气的熏香。在进行睡眠研究时设置，老翁龙必定会现身。",
      "en-US": "Incense with an aroma that Drampa loves. If set before sleeping, a Drampa is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引老翁龍出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引老翁龙出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Drampa appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "780"
    ]
  },
  {
    "id": "incense_cramorant",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "古月鳥薰香",
      "zh-CN": "古月鸟熏香",
      "en-US": "Cramorant Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/cramorantincense.png",
    "description": {
      "zh-TW": "散發出古月鳥喜愛香氣的薰香。在進行睡眠研究時設置，古月鳥必定會現身。",
      "zh-CN": "散发出古月鸟喜爱香气的熏香。在进行睡眠研究时设置，古月鸟必定会现身。",
      "en-US": "Incense with an aroma that Cramorant loves. If set before sleeping, a Cramorant is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引古月鳥出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引古月鸟出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Cramorant appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "845"
    ]
  },
  {
    "id": "incense_toxel",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "毒電嬰薰香",
      "zh-CN": "毒电婴熏香",
      "en-US": "Toxel Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/toxelincense.png",
    "description": {
      "zh-TW": "散發出毒電嬰喜愛香氣的薰香。在進行睡眠研究時設置，毒電嬰必定會現身。",
      "zh-CN": "散发出毒电婴喜爱香气的熏香。在进行睡眠研究时设置，毒电婴必定会现身。",
      "en-US": "Incense with an aroma that Toxel loves. If set before sleeping, a Toxel is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引毒電嬰出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引毒电婴出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Toxel appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "848"
    ]
  },
  {
    "id": "incense_sprigatito",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "新葉喵薰香",
      "zh-CN": "新叶喵熏香",
      "en-US": "Sprigatito Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/sprigatitoincense.png",
    "description": {
      "zh-TW": "散發出新葉喵喜愛香氣的薰香。在進行睡眠研究時設置，新葉喵必定會現身。",
      "zh-CN": "散发出新叶喵喜爱香气的熏香。在进行睡眠研究时设置，新叶喵必定会现身。",
      "en-US": "Incense with an aroma that Sprigatito loves. If set before sleeping, a Sprigatito is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引新葉喵出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引新叶喵出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Sprigatito appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "906"
    ]
  },
  {
    "id": "incense_fuecoco",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "呆火鱷薰香",
      "zh-CN": "呆火鳄熏香",
      "en-US": "Fuecoco Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/fuecocoincense.png",
    "description": {
      "zh-TW": "散發出呆火鱷喜愛香氣的薰香。在進行睡眠研究時設置，呆火鱷必定會現身。",
      "zh-CN": "散发出呆火鳄喜爱香气的熏香。在进行睡眠研究时设置，呆火鳄必定会现身。",
      "en-US": "Incense with an aroma that Fuecoco loves. If set before sleeping, a Fuecoco is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引呆火鱷出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引呆火鳄出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Fuecoco appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "909"
    ]
  },
  {
    "id": "incense_quaxly",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "潤水鴨薰香",
      "zh-CN": "润水鸭熏香",
      "en-US": "Quaxly Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/quaxlyincense.png",
    "description": {
      "zh-TW": "散發出潤水鴨喜愛香氣的薰香。在進行睡眠研究時設置，潤水鴨必定會現身。",
      "zh-CN": "散发出润水鸭喜爱香气的熏香。在进行睡眠研究时设置，润水鸭必定会现身。",
      "en-US": "Incense with an aroma that Quaxly loves. If set before sleeping, a Quaxly is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引潤水鴨出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引润水鸭出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Quaxly appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "912"
    ]
  },
  {
    "id": "incense_pawmi",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "布撥薰香",
      "zh-CN": "布拨熏香",
      "en-US": "Pawmi Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/pawmiincense.png",
    "description": {
      "zh-TW": "散發出布撥喜愛香氣的薰香。在進行睡眠研究時設置，布撥必定會現身。",
      "zh-CN": "散发出布拨喜爱香气的熏香。在进行睡眠研究时设置，布拨必定会现身。",
      "en-US": "Incense with an aroma that Pawmi loves. If set before sleeping, a Pawmi is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引布撥出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引布拨出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Pawmi appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "921"
    ]
  },
  {
    "id": "incense_tinkatink",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "小鍛匠薰香",
      "zh-CN": "小锻匠熏香",
      "en-US": "Tinkatink Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/tinkatinkincense.png",
    "description": {
      "zh-TW": "散發出小鍛匠喜愛香氣的薰香。在進行睡眠研究時設置，小鍛匠必定會現身。",
      "zh-CN": "散发出小锻匠喜爱香气的熏香。在进行睡眠研究时设置，小锻匠必定会现身。",
      "en-US": "Incense with an aroma that Tinkatink loves. If set before sleeping, a Tinkatink is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引小鍛匠出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引小锻匠出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Tinkatink appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "957"
    ]
  },
  {
    "id": "incense_cetoddle",
    "category": "pokemon_incense",
    "name": {
      "zh-TW": "走鯨薰香",
      "zh-CN": "走鲸熏香",
      "en-US": "Cetoddle Incense"
    },
    "icon_url": "https://www.serebii.net/pokemonsleep/items/cetoddleincense.png",
    "description": {
      "zh-TW": "散發出走鯨喜愛香氣的薰香。在進行睡眠研究時設置，走鯨必定會現身。",
      "zh-CN": "散发出走鲸喜爱香气的熏香。在进行睡眠研究时设置，走鲸必定会现身。",
      "en-US": "Incense with an aroma that Cetoddle loves. If set before sleeping, a Cetoddle is guaranteed to appear during sleep research."
    },
    "effects": {
      "zh-TW": "就寢前設置，於次日睡眠研究時必定吸引走鯨出現，且點心時間必定處於「貪吃」狀態。",
      "zh-CN": "就寝前设置，于次日睡眠研究时必定吸引走鲸出现，且点心时间必定处于“贪吃”状态。",
      "en-US": "Guarantees a Cetoddle appears during the next sleep research and causes it to be hungry during snack time."
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
        "每週研究任務達成",
        "活動限定挑戰任務",
        "特定寶可夢培育禮包"
      ],
      "zh-CN": [
        "每周研究任务达成",
        "活动限定挑战任务",
        "特定宝可梦培育礼包"
      ],
      "en-US": [
        "Weekly Research Missions",
        "Event Limited Challenges",
        "Species Bundles"
      ]
    },
    "pokemon_ids": [
      "974"
    ]
  }
];

  if (typeof window !== 'undefined') {
    window.ITEMS_DATA = ITEMS_DATA;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITEMS_DATA;
  }
})();
