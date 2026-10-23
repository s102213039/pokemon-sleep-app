  function getAllTargetRecipes() {
    if (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__) && window.__RECIPES_CACHE__.length > 0) {
      return window.__RECIPES_CACHE__;
    }
    if (typeof window !== 'undefined' && Array.isArray(window.allRecipes) && window.allRecipes.length > 0) {
      return window.allRecipes;
    }
    return TARGET_TOP_RECIPES;
  }

  function findTargetRecipe(name) {
    if (!name) return TARGET_TOP_RECIPES[0];
    const list = getAllTargetRecipes();
    const found = list.find(r => (r.name_cn === name || r.name === name || r.name_en === name)) ||
           TARGET_TOP_RECIPES.find(r => (r.name_cn === name || r.name === name || r.name_en === name)) ||
           list[0] || TARGET_TOP_RECIPES[0];
    if (found && !found.icon) {
      const topMatch = (typeof window !== 'undefined' && Array.isArray(window.ALL_TOP_CATEGORY_RECIPES))
        ? window.ALL_TOP_CATEGORY_RECIPES.find(r => r.name_cn === (found.name_cn || found.name) || r.name_en === (found.name_en || found.name))
        : null;
      if (topMatch && topMatch.icon) {
        found.icon = topMatch.icon;
        if (!found.category) found.category = topMatch.category;
        if (!found.pot_size) found.pot_size = topMatch.pot_size;
      } else if (found.name_en) {
        const slug = found.name_en.toLowerCase().replace(/[^a-z0-9]/g, '');
        found.icon = 'https://www.serebii.net/pokemonsleep/meals/' + slug + '.png';
      }
    }
    return found;
  }

  const _sigRecipeRecCache = Object.create(null);

  function getSignatureRecipeRecommendations(ingredients, isEN) {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) return '';
    const normIngs = Array.from(new Set(
      ingredients.map(function(item) {
        if (!item) return '';
        const raw = typeof item === 'string' ? item : (item.name || '');
        return normalizeIngName(raw);
      }).filter(Boolean)
    ));

    if (normIngs.length === 0) return '';

    const pool = (typeof window !== 'undefined' && window.ALL_TOP_CATEGORY_RECIPES && window.ALL_TOP_CATEGORY_RECIPES.length > 0)
      ? window.ALL_TOP_CATEGORY_RECIPES
      : (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__) && window.__RECIPES_CACHE__.length > 0)
        ? window.__RECIPES_CACHE__
        : TARGET_TOP_RECIPES;

    const cacheKey = (isEN ? '1:' : '0:') + pool.length + ':' + normIngs.join('|');
    const cachedRec = _sigRecipeRecCache[cacheKey];
    if (cachedRec !== undefined) return cachedRec;

    const scored = pool.map(function(recipe) {
      if (!recipe || !recipe.ingredients) return null;
      let matchCount = 0;
      let matchRequired = 0;
      recipe.ingredients.forEach(function(ing) {
        const normRecipeIng = normalizeIngName(ing.name || ing);
        if (normIngs.indexOf(normRecipeIng) !== -1) {
          matchCount++;
          matchRequired += (ing.count || 0);
        }
      });
      if (matchCount === 0) return null;

      const hasTail = normIngs.indexOf('美味尾巴') !== -1;
      const recipeHasTail = recipe.ingredients.some(function(i) { return (i.name || '').includes('尾巴'); });
      const tailBonus = (hasTail && recipeHasTail) ? 20000 : 0;
      const multiMatchBonus = (matchCount - 1) * 9000;
      const score = (recipe.base_energy || 0) + multiMatchBonus + (matchRequired * 40) + tailBonus;

      return {
        name_cn: recipe.name_cn,
        name_en: recipe.name_en,
        matchCount: matchCount,
        score: score
      };
    }).filter(Boolean).sort(function(a, b) {
      return b.score - a.score;
    });

    if (scored.length === 0) {
      _sigRecipeRecCache[cacheKey] = '';
      return '';
    }

    const top1 = scored[0];
    const top2 = scored.length > 1 ? scored[1] : null;

    let res = '';
    if (top2 && top2.name_cn !== top1.name_cn) {
      res = isEN
        ? `Target recipes: prime pipeline for "${top1.name_en}" & "${top2.name_en}".`
        : `直通頂尖料理『${top1.name_cn}』與『${top2.name_cn}』關鍵供料。`;
    } else {
      res = isEN
        ? `Target recipe: prime pipeline for "${top1.name_en}".`
        : `直通頂尖料理『${top1.name_cn}』關鍵供料。`;
    }
    _sigRecipeRecCache[cacheKey] = res;
    return res;
  }

  /* ─── 智能深度簡評生成引擎 (Intelligent Appraisal Summary Engine) ─── */
  function generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, evaluation) {
    if (!pkmData) return '';
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const specialty = pkmData.specialty || '';
    const isBerry = specialty.includes('樹果') || specialty === 'Berries';
    const isIng = specialty.includes('食材') || specialty === 'Ingredients';
    const isSkill = specialty.includes('技能') || specialty === 'Skills';
    const mainSkill = pkmData.main_skill || '';
    const currentGrade = (evaluation && evaluation.current && evaluation.current.grade) || (evaluation && evaluation.grade) || 'B';
    const currentScore = (evaluation && evaluation.current && evaluation.current.compositeScore) || (evaluation && evaluation.compositeScore) || 50;

    const subskillArr = Array.isArray(subskills) ? subskills.map(function(s) { return typeof s === 'string' ? s : (s ? s.name : ''); }) : [];
    const slotLevels = [10, 25, 50, 70, 80];
    const activeSubskills = [];
    const futureSubskills = [];
    slotLevels.forEach(function(lv, idx) {
      const sk = subskillArr[idx];
      if (!sk) return;
      if (currentLv >= lv) {
        activeSubskills.push({ name: sk, level: lv });
      } else {
        futureSubskills.push({ name: sk, level: lv });
      }
    });

    const activeNames = activeSubskills.map(function(s) { return s.name; });

    const isMint = !!(pkmData && (pkmData.cleanseMint || pkmData.mint));
    const natureObj = NATURE_DATA.find(function(n) { return n.name === natureName || n.name_en === natureName; });
    const buff = isMint ? 'none' : (natureObj ? natureObj.buffType : 'none');
    const debuff = isMint ? 'none' : (natureObj ? natureObj.debuffType : 'none');

    // 特殊角色識別
    const isSlowpoke = isSlowpokeFamily(pkmData);
    const isBerryBurst = isBerryBurstSkillSpecialist(pkmData);
    const isHealer = isHealerSkillSpecialist(pkmData);
    const isHelperBoost = isHelperBoostSkillSpecialist(pkmData);
    const isChargeStrength = isChargeStrengthSkillSpecialist(pkmData);
    const isPotExpander = isPotExpanderSkillSpecialist(pkmData);
    const isExtraTasty = isExtraTastySkillSpecialist(pkmData);
    const isDreamShard = isDreamShardSkillSpecialist(pkmData);
    const isIngSkill = isIngredientSkillSpecialist(pkmData);
    const isMetronome = isMetronomeSkillSpecialist(pkmData);
    const isLegendary = isLegendaryPokemon(pkmData);

    // 關鍵副技能持有檢測
    const hasBFS_active = activeNames.indexOf('樹果數量S') !== -1 || activeNames.indexOf('Berry Finding S') !== -1;
    const hasBFS_future = futureSubskills.find(function(s) { return s.name === '樹果數量S' || s.name === 'Berry Finding S'; });

    const hasHB_active = activeNames.indexOf('幫手獎勵') !== -1 || activeNames.indexOf('Helping Bonus') !== -1;

    const hasIngM_active = activeNames.indexOf('食材機率提升M') !== -1 || activeNames.indexOf('Ingredient Finder M') !== -1;
    const hasIngS_active = activeNames.indexOf('食材機率提升S') !== -1 || activeNames.indexOf('Ingredient Finder S') !== -1;
    const hasIngM_future = futureSubskills.find(function(s) { return s.name === '食材機率提升M' || s.name === 'Ingredient Finder M'; });

    const hasSkillM_active = activeNames.indexOf('技能機率提升M') !== -1 || activeNames.indexOf('Skill Trigger M') !== -1;
    const hasSkillS_active = activeNames.indexOf('技能機率提升S') !== -1 || activeNames.indexOf('Skill Trigger S') !== -1;
    const hasSkillM_future = futureSubskills.find(function(s) { return s.name === '技能機率提升M' || s.name === 'Skill Trigger M'; });

    const hasSpeedM_active = activeNames.indexOf('幫忙速度M') !== -1 || activeNames.indexOf('Helping Speed M') !== -1;

    const hasInv_active = activeNames.some(function(s) { return s.indexOf('持有上限') !== -1 || s.indexOf('Inventory Up') !== -1; });

    // 食材組合分析
    let ingArr = (ingredients || []).map(function(item) {
      if (!item) return '';
      return typeof item === 'string' ? item : (item.name || '');
    }).filter(Boolean);
    if (ingArr.length === 0 && pkmData && pkmData.ingredients) {
      ingArr = pkmData.ingredients.map(function(i) {
        return typeof i === 'string' ? i : (i.name || '');
      }).filter(Boolean);
    }
    if (ingArr.length === 0 && pkmData && (pkmData.ing1 || pkmData.ing2 || pkmData.ing3)) {
      ingArr = [pkmData.ing1, pkmData.ing2, pkmData.ing3].filter(Boolean);
    }

    const isAAA = ingArr.length >= 3 && ingArr[0] === ingArr[1] && ingArr[1] === ingArr[2];
    const isABB = ingArr.length >= 3 && ingArr[0] !== ingArr[1] && ingArr[1] === ingArr[2];
    const isABC = ingArr.length >= 3 && ingArr[0] !== ingArr[1] && ingArr[1] !== ingArr[2] && ingArr[0] !== ingArr[2];
    const hasTailLv30 = ingArr.length >= 2 && (ingArr[1] === '美味尾巴' || (ingArr[1] && ingArr[1].indexOf('尾巴') !== -1) || (ingArr[1] && ingArr[1].toLowerCase().indexOf('tail') !== -1));

    // 1. 呆呆獸家族 (核心戰略使命：解鎖美味尾巴)
    if (isSlowpoke) {
      if (hasTailLv30) {
        return isEN
          ? 'Strategic Unlock Specialist: Lv.30 unlocks "Slowpoke Tail", fulfilling the primary strategic mission of unlocking the highest-energy ingredient in Pokémon Sleep! Direct pipeline for "Slowpoke Tail Pepper Salad" & "Grilled Tail Curry".'
          : '戰略解鎖專門手：Lv.30 精準解鎖「美味尾巴」，圓滿達成全遊戲最高能量食材之戰略開圖使命！直通頂尖料理『呆呆獸尾巴的胡椒沙拉』與『炙燒尾肉咖哩』關鍵供料，解鎖後可常駐作為後備庫存手。';
      } else {
        return isEN
          ? 'Fatal Strategic Flaw: Lv.30 fails to roll "Slowpoke Tail", missing the essential strategic unlock value of the Slowpoke family.'
          : '戰略定位失職：Lv.30 未能開出「美味尾巴」，喪失了呆呆獸家族核心戰略開圖價值，建議作為過渡替補或換糖。';
      }
    }

    // 2. 樹果型專精分析
    if (isBerry) {
      if (hasBFS_active) {
        if (hasHB_active || hasSpeedM_active || buff === 'speed' || debuff === 'ingredient') {
          return isEN
            ? 'Top-Tier Berry Cannon! "Berry Finding S" combined with excellent Speed boosts produces 3 berries per help cycle, serving as the ultimate Snorlax energy engine.'
            : '天花板級樹果砲台！解鎖第一神技「樹果數量S（樹果S）」配合極致幫忙速度加成，單次幫忙穩定產出 3 顆樹果，卡比獸能量滾雪球的最強主力。';
        } else {
          return isEN
            ? 'Core Berry Anchor: Unlocked God-tier "Berry Finding S", providing +1 berry per cycle and delivering strong, reliable island pushing power.'
            : '畢業級樹果主力：已解鎖第一核心神技「樹果數量S（樹果S）」，單次產果直接 +1，具備極強的島嶼推分實力。';
        }
      } else if (hasBFS_future) {
        return isEN
          ? `High Potential Seed: "Berry Finding S" unlocks at Lv.${hasBFS_future.level}. Recommended to prioritize training to unlock this game-changing leap in berry output!`
          : `未來潛力股：核心神技「樹果數量S（樹果S）」將於 Lv.${hasBFS_future.level} 解鎖，建議作為重點種子培育，解鎖後產能將迎來決定性質變！`;
      } else {
        if (hasHB_active && (hasSpeedM_active || buff === 'speed')) {
          return isEN
            ? 'High-Speed Auxiliary: Lacks "Berry Finding S", but extreme speed kit (Helping Bonus + Speed buffs) makes it a valuable team accelerator and transitional anchor.'
            : '極限速攻流：雖缺乏「樹果數量S」，但憑藉「幫手獎勵 + 幫忙速度加成」大幅縮短全員幫忙間隔，適合作為優質團隊加速掛件與過渡主力。';
        } else if (debuff === 'speed') {
          return isEN
            ? 'Severely Handicapped: Speed Down nature directly cripples help cycles. Combined with no BFS, output is too low for competitive island production.'
            : '致命減速：性格減幫忙速度（-7.5%）拖慢節奏，且未持有「樹果數量S」，產能難以支撐島嶼進度。';
        } else {
          return isEN
            ? 'Transitional Berry Specialist: Lacks core "Berry Finding S", capping output at 2 berries per help. Suitable as an early island transitional placeholder.'
            : '過渡型樹果手：缺乏核心神技「樹果數量S」，單次僅能產出 2 顆樹果，產能上限受限，適合作為島嶼前期拓荒過渡。';
        }
      }
    }

    // 3. 技能型專精分析 (全面精細化劃分各大戰略流派)
    if (isSkill) {
      // 3.1 樹果遽增型 (Berry Burst: 謎擬Q, 蜥蜴王, 烈焰猴, 勇士雄鷹, 拉帝歐斯)
      if (isBerryBurst) {
        if (hasBFS_active) {
          if (hasSkillM_active || buff === 'skill') {
            return isEN
              ? 'Top-Tier Berry Burst Cannon! "Berry Burst" combined with "Berry Finding S" yields double help berries and triggers explosive team berry surges (Mimikyu doubles on Great Success!). An apex island pusher for active collectors; 1.4x boosted during Buncha Berries events.'
              : '天花板級樹果爆發砲台！「樹果遽增」主技能與「樹果數量S」完美結合，單次幫忙穩定產出加倍樹果，技能觸發更能引爆全隊巨額樹果能量（謎擬Q大成功翻倍爆發更強）！在喜愛樹果島嶼或樹果週（1.4倍加成）為頂尖衝分主力，勤勞收包可享極限產能。';
          }
          return isEN
            ? 'Berry Burst Pusher: Equipped with "Berry Finding S" for high baseline berry generation, synergizing with Berry Burst procs for strong island push power. Regular collection recommended.'
            : '樹果遽增推進主力：具備「樹果數量S」大幅提升常態樹果產量，配合主技能隨機爆發隊友樹果，具備極佳的推分爆發力。建議勤勞收包並搭配主技能種子或技能機率副技能。';
        }
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'High-Frequency Berry Burst Core: Excellent main skill trigger rate triggers frequent berry surges directly into Snorlax. Unlocking BFS or leveling main skill offers enormous burst potential (1.4x during Berry Weeks).'
            : '高頻樹果遽增核心：主技能發動率卓越，能頻繁為卡比獸爆發樹果能量；若未來能解鎖樹果數量S或配合樹果週活動（1.4倍加成），將具備天花板級爆發上限！';
        }
        return isEN
          ? 'Berry Burst Specialist: Main skill "Berry Burst" provides instant team berry surges. Prioritize skill seeds and skill trigger subskills for maximum efficiency.'
          : '樹果遽增技能型：主技能為「樹果遽增」，能瞬間爆發樹果能量，建議搭配主技能種子或技能機率副技能以提升發動次數。';
      }

      // 3.2 活力全體療癒補師 (Healers: 沙奈朵, 仙子伊布, 胖可丁, 巴布土撥, 克雷色利亞, 壺壺)
      if (isHealer) {
        if (debuff === 'skill') {
          return isEN
            ? 'Fatal Healer Flaw: Main Skill Trigger Down nature (-20%) cripples daily activation rate, failing to maintain team energy above the 80% speed threshold.'
            : '致命硬傷：補師性格為減少主技能機率（-20%），全天期望回能次數嚴重不足，難以維持全隊 80% 以上極限活力運轉。';
        }
        if (hasSkillM_active && (buff === 'skill' || hasSpeedM_active || hasHB_active)) {
          const extraNote = hasBFS_active ? (isEN ? ' (Note: BFS accelerates bag overflow; clear inventory before sleep to prevent blocked procs).' : '（注意：持有樹果S易過早滿包，睡前務必清空背包避免阻斷技能判定）。') : '';
          return isEN
            ? `Top-tier Team Healer Engine! High trigger rate guarantees 4-6 procs daily, locking the team at high energy for 2.2x maximum helping speed.${extraNote}`
            : `頂尖隊伍回能引擎！雙重技能發動機率加成，全天期望觸發 4~6 次以上，能牢牢鎖定全隊高活力上限，享受 2.2 倍極限幫忙速！${extraNote}`;
        }
        if (!hasSkillM_active && !hasSkillS_active && buff !== 'skill') {
          if (hasSkillM_future) {
            return isEN
              ? `Promising Healer: Core "Skill Trigger M" unlocks at Lv.${hasSkillM_future.level}. Prioritize leveling to establish reliable team energy coverage.`
              : `潛力補師：關鍵「技能機率提升M」將於 Lv.${hasSkillM_future.level} 解鎖，建議優先培育升級以構築全隊回能防線。`;
          }
          return isEN
            ? 'Insufficient Trigger Rate: Lacks active Skill Trigger subskills or nature boost; healing frequency is too low to sustain all-day team vitality.'
            : '發動期望不足：缺乏主技能機率提升副技能或性格加成，發動頻率偏低，無法勝任穩定維持全隊活力的隊伍核心基石。';
        }
        return isEN
          ? 'Qualified Team Healer: Decent trigger rate for stable energy support, helping the team maintain high daytime work efficiency.'
          : '及格團隊補師：具備穩健的發動頻率，能提供基礎活力續航，協助隊伍維持日間高水準工作效率。';
      }

      // 3.3 傳說神獸幫手加速型 (Helper Boost: 雷公, 炎帝, 水君, 風速狗, 雷伊布, 艾路雷朵)
      if (isHelperBoost) {
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'Mono-Type Team Amplifier: "Helper Boost" triggers instant team-wide production cycles, scaling higher with more unique same-type team members! Prioritizes Skill Triggers and Helping Bonus to avoid self-bag overflow, while teammates carry BFS to massively amplify output.'
            : '同屬性純色隊終極放大器！主技能「幫手加速」單次發動可引爆全隊即時產出，隊伍中同屬性不同種類寶可夢越多倍率越高。神獸本體首重技能機率與持有上限防溢滿，而將樹果數量S交由「隊友」攜帶以最大化技能爆發收益！';
        }
        return isEN
          ? 'Mono-Type Helper Specialist: "Helper Boost" triggers instant multi-helps for all same-type members. Skill trigger subskills and Main Skill Seeds are primary priorities.'
          : '同屬性純色隊發動機：主技能「幫手加速」能帶動同屬性隊員進行多次額外幫忙。基礎發動率偏低（約2%），極度依賴技能機率副技能與主技能種子投入。';
      }

      // 3.4 單體充能直傷型 (Charge Strength S/M: 電龍, 太陽伊布, 哥達鴨, 樹才怪, 隨風球, 音波龍, 達克萊伊)
      if (isChargeStrength) {
        if (hasBFS_active) {
          if (hasSkillM_active || buff === 'skill') {
            return isEN
              ? 'Top-Tier Hybrid Charge Cannon! Unlocks the "Charge Strength + Berry Finding S" dual-track form. On favorite berry islands (e.g. Ampharos at Power Plant, Espeon at Lakeside, Golduck at Beach), active collectors achieve the ultimate theoretical energy ceiling (thousands in direct skill strength + double island berries)! Collect regularly to prevent bag overflow.'
              : '頂級雙修能量砲台！解鎖「能量填充 + 樹果數量S」雙修形態。在對應喜好樹果島嶼上（如電龍在發電廠、太陽伊布在湖畔、哥達鴨在海灘），為勤勞收包玩家提供極限級總能量期望（單次直傷數千 + 每次雙倍島嶼樹果）！放置時需注意及時清包以防滿包阻斷技能判定。';
          }
          return isEN
            ? 'Hybrid Charge Producer: "Berry Finding S" provides high-value island berry yield alongside steady Charge Strength direct energy. High-frequency collection is recommended to prevent Sneaky Snacking from halting skill checks.'
            : '雙修型單兵直傷手：持有「樹果數量S」提供可觀樹果副產能，配合主技能能量填充提供穩定分數進帳，建議高頻收包以防滿包偷吃阻斷技能。';
        }
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'High-Yield Energy Cannon: Leverages frequent "Charge Strength" activations for heavy single-target Snorlax point generation.'
            : '強力單兵能量砲台：倚賴「能量填充」提供高額直傷分數，發動機率加成顯著，具備極佳的單兵獨立產分戰鬥力。';
        }
        return isEN
          ? 'Charge Strength Specialist: Provides steady direct Snorlax energy, depending primarily on skill trigger rate and main skill level.'
          : '單兵能量手：主技能為直接提升卡比獸能量，依賴主技能等級與發動頻率支撐產能。';
      }

      // 3.5 傳說/幻之寶可夢專屬機制 (超夢, 夢幻, 達克萊伊, 克雷色利亞)
      if (isLegendary) {
        if (mainSkill.includes('精神擊破') || mainSkill.includes('樹果領域')) {
          return isEN
            ? 'Legendary Berry Field Engine! Signature move "Psystrike" deploys a Berry Field, massively multiplying specific berry yields for team-wide strategic breakthroughs.'
            : '傳說樹果領域核心！專屬主技能「精神擊破」能展開樹果領域，全面提升特定屬性樹果能量，為全隊帶來跨維度的戰略爆發！';
        }
        if (mainSkill.includes('十項全能') || mainSkill.includes('揮指')) {
          return isEN
            ? 'Mythical All-Rounder! Signature move "Decathlon" draws from an unpredictable repertoire of master skills, serving as an adaptable wildcard.'
            : '幻之十項全能戰術手！專屬主技能「十項全能」技能池深不可測，為全隊提供極具彈性的戰術補強與意外上限。';
        }
        if (mainSkill.includes('夢魘')) {
          return isEN
            ? 'Mythical Dark Charge Burst! Signature move "Bad Dreams" unleashes massive direct energy points with outstanding base speed.'
            : '幻之惡系直傷爆發手！專屬主技能「夢魘」單次提供巨額卡比獸直傷能量，基礎速度快，為頂級獨立產分戰力。';
        }
      }

      // 3.6 料理美味度/大成功型 (Extra Tasty: 咚咚鼠, 海豹球佳節)
      if (isExtraTasty) {
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'Premier Extra Tasty Specialist: High trigger rate stacks dish crit probability rapidly, tailor-made for exploding weekend master dishes with multi-hundred-thousand point bursts! Strictly avoid BFS to protect skill procs.'
            : '料理大成功爆擊手：主技能「料理成功S」能不斷疊加下次料理的大成功機率，專為每週衝擊大師高階時引爆週末大餐（數十萬能量爆擊）的終極戰術組件！首重技能機率與持有上限，嚴禁樹果S阻斷判定。';
        }
        return isEN
          ? 'Tactical Extra Tasty Specialist: Stacks dish critical success chance to prepare for explosive cooking scores during event weeks.'
          : '料理大成功戰術手：疊加料理美味機率，專為週末大餐爆擊儲備機率，建議提高技能機率與持有上限。';
      }

      // 3.7 料理擴鍋型 (Pot Expanders: 自爆磁怪, 火伊布, 冰伊布, 負電拍拍, 顫弦蠑螈)
      if (isPotExpander) {
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'Premier Pot Expander: High main skill trigger rate expands pot size rapidly, tailor-made for breaking cooking limits on weekends!'
            : '極品戰術擴鍋手：具備優秀的主技能發動加成，能高頻擴充鍋子容量，專為週末衝擊頂級極限大菜（突破鍋子上限）而生！';
        }
        return isEN
          ? 'Tactical Pot Specialist: Main skill "Cooking Power Up S" expands pot capacity for preparing high-tier recipes during event weeks.'
          : '戰術擴鍋專門：主技能「料理強化S」能擴充鍋容量，適合週末囤積鍋空間以衝擊極限大型食譜。';
      }

      // 3.8 夢之碎片型 (Dream Shards: 路卡利歐, 喵喵, 貓老大, 勾魂眼, 吞食獸)
      if (isDreamShard) {
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'Premier Dream Shard Harvester: High trigger rate paired with Dream Shard subskills yields massive currency during Good Sleep Days and Candy Boost weeks!'
            : '夢之碎片頂級收割手：高頻發動夢之碎片主技能，在好眠日活動與糖果強化週是不可或缺的頂尖資金農夫！';
        }
        return isEN
          ? 'Dream Shard Specialist: Main skill provides direct Dream Shards, crucial for sustaining high late-game candy power-up costs.'
          : '夢之碎片專門手：主技能為直接獲取夢之碎片，為後期高昂的寶可夢升級糖果消耗提供資金支持。';
      }

      // 3.9 食材獲取/精選型技能寵 (Ingredient Draw: 水伊布, 伊布, 毒電嬰, 正電拍拍, 穿山王, 摔角鷹人, 赫拉克羅斯)
      if (isIngSkill) {
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'Rapid Stockpile Emergency Support: High trigger rate pours abundant random ingredients into inventory, instantly curing recipe ingredient shortages!'
            : '應急食材爆發中樞：高額技能發動率能瞬間填補龐大食材庫存，化解高階料理缺料危機，是食材告急時的最佳急救隊員！';
        }
        return isEN
          ? 'Ingredient Draw Specialist: Main skill fetches bonus random ingredients to support daily kitchen consumption.'
          : '應急食材補給手：主技能為獲取額外隨機食材，能輔助日常烹飪食材供給。';
      }

      // 3.10 隨機揮指型 (Metronome: 波克基斯, 波克比, 夢幻)
      if (isMetronome) {
        return isEN
          ? 'Wildcard Metronome Specialist: Triggers unpredictable random skills across the game, delivering high excitement and unexpected score leaps.'
          : '隨機揮指戰術手：能隨機發動全遊戲主技能，具備極高趣味性與意外上限，在日常探索中常有驚喜表現。';
      }

      if (debuff === 'skill') {
        return isEN
          ? 'Fatal Specialty Flaw: Nature reduces Main Skill Trigger (-20%), severely crippling core activation frequency.'
          : '致命缺陷：性格減少主技能發動機率（-20%），嚴重閹割核心發動頻率，不符技能型定位。';
      }
      if (hasSkillM_active || buff === 'skill') {
        if (hasSkillM_future) {
          return isEN
            ? `Specialized Skill Anchor: Strong active skill trigger frequency, with further performance leaps upon reaching Lv.${hasSkillM_future.level}.`
            : `專精技能主力：當前技能發動表現活躍，且後續 Lv.${hasSkillM_future.level} 仍有技能提升空間，戰術運轉流暢。`;
        }
        return isEN
          ? 'Specialized Skill Anchor: Excellent skill trigger bonuses ensure high activation frequency for stable specialty performance.'
          : '專精技能主力：優質的技能機率加成確保了穩定的觸發頻率，能充分發揮技能專長優勢。';
      }
      if (hasSkillM_future) {
        return isEN
          ? `Future Skill Prospect: Core "Skill Trigger M" unlocks at Lv.${hasSkillM_future.level}. Prioritize leveling to unleash true skill potential.`
          : `潛力技能手：關鍵「技能機率提升M」將於 Lv.${hasSkillM_future.level} 解鎖，建議優先培育升級以釋放核心潛力。`;
      }
      return isEN
        ? 'Standard Skill Specialist: Baseline skill trigger rate; suitable as a situational support or transitional pick.'
        : '常規技能手：技能觸發率處於基準線，適合作為特定情境替補或過渡成員。';
    }

    // 4. 食材型專精分析 (嚴禁混入技能型要求)
    if (isIng) {
      if (debuff === 'ingredient') {
        return isEN
          ? 'Fatal Specialty Flaw: Nature reduces Ingredient Finding (-20%), causing frequent berry dilution and unstable cooking supply. Not recommended for major investment.'
          : '致命短板：性格減少食材發現率（-20%），產出頻繁被樹果稀釋，極難穩定供應主力食譜所需食材，不建議投入過多資源。';
      }

      const recipeSynergy = getSignatureRecipeRecommendations(ingArr, isEN);
      const recipePhrase = recipeSynergy ? ` ${recipeSynergy}` : '';

      let ingSpreadDesc = '';
      if (isAAA) {
        ingSpreadDesc = isEN ? ' Features pure mono-ingredient (AAA) spread for maximum focused output.' : '搭配極品純色 AAA 食材配置，特定食材產量高度集中。';
      } else if (isABB) {
        ingSpreadDesc = isEN ? ' Features strong ABB dual spread, excelling in mid-to-late advanced ingredient yield.' : '搭配強勢 ABB 雙色配置，二階與三階食材量產能力卓越。';
      } else if (isABC) {
        ingSpreadDesc = isEN ? ' Split ABC spread dilutes single ingredient yield.' : '三色 ABC 雜色配置略微稀釋單項食材產量。';
      }

      if (hasIngM_active || buff === 'ingredient') {
        if (hasBFS_active) {
          if (hasInv_active) {
            return isEN
              ? `Top Hybrid Specialist: Active "Ingredient Finder M" backed by BFS and Inventory Up provides exceptional food yields with massive bonus berries.${recipePhrase}`
              : `極品雙修食材手！食材機率大幅提升搭配「樹果數量S」與「持有上限提升」，食材爆發力極強且兼顧頂級樹果副產能！${recipePhrase}`;
          } else {
            return isEN
              ? `High-Burst Hybrid: Excellent ingredient rate and BFS provide huge dual yield, but inventory caps fast overnight—collect regularly.${recipePhrase}`
              : `高爆發雙修型：食材機率優異並持有「樹果數量S」，但缺乏持有上限容易在睡眠期間提早滿包阻斷產料，建議勤勞收成。${recipePhrase}`;
          }
        }

        return isEN
          ? `Premier Kitchen Anchor! High ingredient finding rate ensures abundant cooking supply for top recipes.${recipePhrase}${ingSpreadDesc}`
          : `頂級食材供應中樞！高額食材發現率確保了穩定龐大的料理供應，做大菜的最佳後勤基石。${recipePhrase}${ingSpreadDesc}`;
      }

      if (!hasIngM_active && !hasIngS_active && buff !== 'ingredient') {
        if (hasIngM_future) {
          return isEN
            ? `Future Ingredient Prospect: Core "Ingredient Finder M" unlocks at Lv.${hasIngM_future.level}. Prioritize leveling to establish reliable kitchen supply.${recipePhrase}`
            : `潛力食材手：關鍵「食材機率提升M」將於 Lv.${hasIngM_future.level} 解鎖，建議優先培育升級以構築主力供貨能力。${recipePhrase}`;
        }
        if (hasSpeedM_active || buff === 'speed' || hasHB_active) {
          return isEN
            ? `Speed-Driven Producer: Lacks direct ingredient finder boost, but high helping speed compensates to provide acceptable general output.${recipePhrase}`
            : `幫速彌補型：雖缺乏直接食材機率提升，但憑藉優良的幫忙速度維持了合格的基礎供貨，適合作為實用過渡。${recipePhrase}`;
        }
        return isEN
          ? `Lacks Ingredient Output: Missing ingredient finder and speed boosts; yields are insufficient to sustain demanding high-tier dishes.${recipePhrase}`
          : `缺乏食材爆發力：前中期未持有食材機率加成或顯著幫速，產量難以滿足高階大型料理（如彈跳咖哩烏龍麵、大塊滿滿熱水沙拉等頂級大菜）的消耗需求。${recipePhrase}`;
      }

      return isEN
        ? `Solid Ingredient Provider: Steady supply for regular meals, serving reliably in daily cooking rotations.${recipePhrase}${ingSpreadDesc}`
        : `穩健食材供應手：供貨節奏穩定，足以勝任日常食譜輪替與食材儲備。${recipePhrase}${ingSpreadDesc}`;
    }

    return isEN
      ? `${currentGrade} Grade (${currentScore} pts) - Reliable team member with balanced baseline performance.`
      : `${currentGrade} 級（${currentScore}分）- 基礎素質均衡，適合作為隊伍實用成員。`;
  }

  /* ─── 對外入口：雙軌評級與里程碑評定 (Dual-Track Appraisal API) ─────── */
  const _evalPokemonCache = Object.create(null);
  let _evalPokemonCacheCount = 0;

  function evaluatePokemon(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, cleanseMint) {
    if (!pkmData) return null;
    currentLv = parseInt(currentLv, 10) || 30;
    const isMint = !!(cleanseMint || (pkmData && (pkmData.cleanseMint || pkmData.mint)));
    const langKey = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function')
      ? window.I18N.getLanguage()
      : 'zh-TW';
    const pkmIdentity = (pkmData.id || '') + ':' + (pkmData.name_cn || pkmData.name_en || pkmData.name || '') + ':' + (pkmData.specialty || '') + ':' + (pkmData.base_frequency || pkmData.frequency || '') + ':' + (pkmData.is_final || '') + ':' + (pkmData.main_skill || '') + ':' + (pkmData.ingredient_rate || '') + ':' + (pkmData.skill_rate || '');
    const subsKey = Array.isArray(subskills) ? subskills.join('|') : '';
    const ingsKey = Array.isArray(ingredients)
      ? ingredients.map(function (x) { return typeof x === 'string' ? x : ((x && x.name) ? (x.name + ':' + (x.count || x.l1 || '')) : ''); }).join('|')
      : '';
    const cacheKey = pkmIdentity + '@' + currentLv + '@' + (natureName || '') + '@' + subsKey + '@' + ingsKey + '@' + (ribbonLevel || 0) + '@' + (skillLevel || '') + '@' + (isMint ? 1 : 0) + '@' + langKey;

    if (_evalPokemonCache[cacheKey]) {
      return Object.assign({}, _evalPokemonCache[cacheKey]);
    }

    const targetPkm = Object.assign({}, pkmData, { cleanseMint: isMint });

    const currentEval = evaluateSingle(targetPkm, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, false, isMint);
    if (!currentEval) return null;

    const potentialEval = evaluateSingle(targetPkm, 100, natureName, subskills, ingredients, ribbonLevel, skillLevel, true, isMint);
    const milestones = calculateMilestoneProjections(targetPkm, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval);

    if (currentEval.diagnostics) {
      currentEval.diagnostics.milestones = milestones;
    }

    const intelligentSummary = generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval);

    const result = Object.assign({}, currentEval, {
      current: currentEval,
      potential: potentialEval,
      currentScore: currentEval.compositeScore,
      currentGrade: currentEval.grade,
      potentialScore: potentialEval ? potentialEval.compositeScore : currentEval.compositeScore,
      potentialGrade: potentialEval ? potentialEval.grade : currentEval.grade,
      milestones: milestones,
      milestoneNote: milestones.length > 0 ? milestones[0].text : '',
      summaryNote: intelligentSummary,
      intelligentSummary: intelligentSummary
    });

    if (_evalPokemonCacheCount > 2500) {
      for (const k in _evalPokemonCache) delete _evalPokemonCache[k];
      _evalPokemonCacheCount = 0;
    }
    _evalPokemonCache[cacheKey] = result;
    _evalPokemonCacheCount++;

    return Object.assign({}, result);
  }

  /* ─── 升級成本精算 ─────────────────────────────────────── */
  const _milestoneCostCache = Object.create(null);

  function calculateMilestoneCost(fromLv, targetLv, nature) {
    if (fromLv >= targetLv) {
      return { exp: 0, candies: 0, shards: 0, handyCandyS: 0, handyCandyM: 0 };
    }

    const expMod = (nature && nature.buffType === 'exp') ? 'up' : ((nature && nature.debuffType === 'exp') ? 'down' : 'neutral');
    const costKey = fromLv + ':' + targetLv + ':' + expMod;
    const cachedCost = _milestoneCostCache[costKey];
    if (cachedCost) return cachedCost;

    const startExp = EXP_MILESTONES[fromLv] || (fromLv * 100);
    const endExp = EXP_MILESTONES[targetLv] || (targetLv * 500);
    let expDiff = Math.max(endExp - startExp, 0);

    if (expMod === 'up') {
      expDiff = Math.round(expDiff * 0.82);
    } else if (expMod === 'down') {
      expDiff = Math.round(expDiff * 1.18);
    }

    const candiesNeeded = Math.ceil(expDiff / 25);
    const startShards = SHARD_MILESTONES[fromLv] || (fromLv * 80);
    const endShards = SHARD_MILESTONES[targetLv] || (targetLv * 1200);
    const shardsNeeded = Math.max(endShards - startShards, 0);

    const res = {
      exp: expDiff,
      candies: candiesNeeded,
      shards: shardsNeeded,
      handyCandyS: Math.ceil(candiesNeeded / 3),
      handyCandyM: Math.ceil(candiesNeeded / 20)
    };
    _milestoneCostCache[costKey] = res;
    return res;
  }

  /* ─── 原生 SVG 六維雷達圖生成器 (完美對稱正規六邊形 + 頂點直接標註分數) ───────────────────────── */
  function renderRadarChartSVG(scores, width, height) {
    width = width || 360;
    height = height || 270;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCompact = width <= 250;
    const SIX_DIM_META = getSixDimMeta(isEN);
    const cx = width / 2;
    const cy = (height / 2) + 1;
    const marginY = isCompact ? 22 : 28;
    const marginX = isCompact ? 36 : 46;
    const r = Math.min((width - marginX * 2) / 2, (height - marginY * 2) / 2);

    const scoreKeys = ['berry', 'ingredient', 'skill', 'speed', 'growth', 'roi'];
    const angles = SIX_DIM_META.map(function (m) { return m.angle; });

    // 生成 5 圈同心正六角形網格
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const gridPolygons = gridLevels.map(function (level) {
      const pts = angles.map(function (a) {
        const x = cx + (r * level) * Math.cos(a);
        const y = cy + (r * level) * Math.sin(a);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
      return '<polygon points="' + pts + '" fill="' + (level === 1.0 ? 'rgba(255,255,255,0.02)' : 'none') + '" stroke="rgba(255,255,255,0.09)" stroke-width="' + (level === 1.0 ? '1.5' : '1') + '" stroke-dasharray="' + (level === 1.0 ? 'none' : '2,2') + '" />';
    }).join('');

    // 生成 6 條徑向軸線
    const radialAxes = angles.map(function (a) {
      const x2 = cx + r * Math.cos(a);
      const y2 = cy + r * Math.sin(a);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="rgba(255,255,255,0.12)" stroke-width="1" />';
    }).join('');

    // 計算資料多邊形座標
    const dataPoints = scoreKeys.map(function (k, i) {
      const score = Math.max(scores[k] || 20, 10);
      const radius = (score / 100) * r;
      const x = cx + radius * Math.cos(angles[i]);
      const y = cy + radius * Math.sin(angles[i]);
      return { x: x, y: y, score: score, key: k, meta: SIX_DIM_META[i] };
    });

    const dataPolygonPoints = dataPoints.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');

    // 頂點標籤與數值 (維度名稱 + 評分標題直接整合在頂點)
    const labelsAndDots = dataPoints.map(function (p, i) {
      let lx = cx;
      let ly = cy;
      let textAnchor = 'middle';
      const sideOffset = isCompact ? 6 : 8;

      if (i === 0) { // Top (樹果產能)
        lx = cx;
        ly = cy - r - (isCompact ? 16 : 19);
        textAnchor = 'middle';
      } else if (i === 1) { // Top-Right (食材產能)
        lx = cx + r * Math.cos(angles[i]) + sideOffset;
        ly = cy + r * Math.sin(angles[i]) - (isCompact ? 5 : 7);
        textAnchor = 'start';
      } else if (i === 2) { // Bottom-Right (技能強度)
        lx = cx + r * Math.cos(angles[i]) + sideOffset;
        ly = cy + r * Math.sin(angles[i]) + (isCompact ? 3 : 5);
        textAnchor = 'start';
      } else if (i === 3) { // Bottom (幫忙速度)
        lx = cx;
        ly = cy + r + (isCompact ? 13 : 15);
        textAnchor = 'middle';
      } else if (i === 4) { // Bottom-Left (後期成長)
        lx = cx + r * Math.cos(angles[i]) - sideOffset;
        ly = cy + r * Math.sin(angles[i]) + (isCompact ? 3 : 5);
        textAnchor = 'end';
      } else if (i === 5) { // Top-Left (資源效益)
        lx = cx + r * Math.cos(angles[i]) - sideOffset;
        ly = cy + r * Math.sin(angles[i]) - (isCompact ? 5 : 7);
        textAnchor = 'end';
      }

      const dotR = isCompact ? '3.5' : '4.8';
      const labelFontSize = isCompact ? '10' : '13';
      const scoreFontSize = isCompact ? '9.5' : '12';
      const scoreDy = isCompact ? '11.5' : '14';

      return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + dotR + '" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />' +
             '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + textAnchor + '" class="radar-label">' +
             '<tspan x="' + lx.toFixed(1) + '" dy="' + (i === 0 ? '-2' : '0') + '" fill="var(--text-primary)" font-size="' + labelFontSize + '" font-weight="700">' + p.meta.label + '</tspan>' +
             '<tspan x="' + lx.toFixed(1) + '" dy="' + scoreDy + '" fill="#38bdf8" font-size="' + scoreFontSize + '" font-weight="800">' + p.score + (isEN ? ' pts' : ' 分') + '</tspan>' +
             '</text>';
    }).join('');

    return '<svg viewBox="0 0 ' + width + ' ' + height + '" class="radar-svg-chart" width="100%" height="100%" style="display:block; margin:0 auto;" xmlns="http://www.w3.org/2000/svg">' +
           '<defs><linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
           '<stop offset="0%" stop-color="rgba(56, 189, 248, 0.45)" />' +
           '<stop offset="100%" stop-color="rgba(234, 179, 8, 0.35)" />' +
           '</linearGradient></defs>' +
           gridPolygons + radialAxes +
           '<polygon points="' + dataPolygonPoints + '" fill="url(#radarFillGradient)" stroke="#38bdf8" stroke-width="2.5" />' +
           labelsAndDots +
           '</svg>';
  }

