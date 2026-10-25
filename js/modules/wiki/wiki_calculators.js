  function openIngredientRankingModal(ingId) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const mult = getLadderMultiplier();
    const ingData = LV60_COORDINATE_LADDER_DATA.find(i => i.id === ingId);
    if (!ingData) return;

    // 若當前有高亮料理，且點選的食材非該料理所需食材，則禁止開啟與選取
    const activeRecipes = getActiveHighlightRecipes();
    if (activeRecipes.length) {
      const isRecipeIng = activeRecipes.some(rec => rec.ingredients && rec.ingredients.some(i => i.name === ingData.name || (i.name === '美味尾巴' && ingId === 'tail') || (i.name === 'Slowpoke Tail' && ingId === 'tail')));
      if (!isRecipeIng) return;
    }

    const ingName = isEN ? ((window.I18N && window.I18N.getIngredientName(ingData.name)) || ingData.name) : ingData.name;
    const dishInfo = TOP_RECIPES_FOR_INGREDIENTS[ingId] || { name: isEN ? 'Key Dish' : '核心大菜', name_en: 'Key Dish', need: 20 };
    const dishName = isEN ? (dishInfo.name_en || dishInfo.name) : dishInfo.name;
    const dishIcon = dishInfo.icon || getLadderDishIcon(dishInfo.name);

    // 依當前篩選條件收集並計算所有寶可夢產量排名
    let rankingList = [];
    let modalTop5Threshold = 0;
    if (ladderSupplyFilter === 'TOP') {
      const allMaxCounts = ingData.pokemon.map(pkm => {
        const pkmBonus = getPokemonSkillDrawBonus(pkm.name, ingData.id, ingData.name);
        return Math.max(...(pkm.variants || [{ count: pkm.count }]).map(v => Math.round(v.count * mult) + pkmBonus));
      });
      const distinctCounts = [...new Set(allMaxCounts)].sort((a, b) => b - a);
      modalTop5Threshold = distinctCounts[Math.min(4, distinctCounts.length - 1)] || 0;
    }

    ingData.pokemon.forEach((p, pIdx) => {
      const pkmSpec = getPokemonLadderSpecialty(p.name);
      if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return;
      if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return;
      if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return;

      const skillBonus = getPokemonSkillDrawBonus(p.name, ingData.id, ingData.name);

      let variants = (p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }]).filter(v => matchesLadderRecipeFilter(v, ladderRecipeFilter));

      if (ladderSupplyFilter === 'TOP') {
        const pkmMaxCount = Math.max(...(p.variants || [{ count: p.count }]).map(v => Math.round(v.count * mult) + skillBonus));
        if (pkmMaxCount < modalTop5Threshold) return;
        variants = variants.slice(0, 1);
      } else if (ladderSupplyFilter === 'MEALS_3') {
        variants = variants.filter(v => Math.round(v.count * mult) + skillBonus >= dishInfo.need * 3);
      } else if (ladderSupplyFilter === 'MEALS_2') {
        variants = variants.filter(v => Math.round(v.count * mult) + skillBonus >= dishInfo.need * 2);
      }

      if (ladderSearchQuery) {
        if (!matchesLadderSearch(p.name, p.name_en, ladderSearchQuery)) return;
      }

      variants.forEach(v => {
        const dropCount = Math.round(v.count * mult);
        const totalCount = dropCount + skillBonus;
        rankingList.push({
          name: p.name,
          name_en: p.name_en,
          icon: p.icon,
          recipe: v.recipe,
          count: totalCount,
          dropCount: dropCount,
          skillBonus: skillBonus,
          rawCount: v.count,
          isTop: v.isTop || (p.isTop && v.recipe === p.recipe),
          specialty: pkmSpec,
          note: v.note
        });
      });
    });

    // 依產量由大到小排序
    rankingList.sort((a, b) => b.count - a.count);

    // 密集群組名次演算法 (Dense Ranking)：同產量者並列相同名次，後續名次緊接遞增不跳號
    let currentDenseRank = 0;
    let lastYieldCount = null;
    const rankedList = rankingList.map((item) => {
      if (lastYieldCount === null || item.count < lastYieldCount) {
        currentDenseRank++;
        lastYieldCount = item.count;
      }
      return {
        ...item,
        rank: currentDenseRank
      };
    });

    let modal = document.getElementById('wiki-ingredient-ranking-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'wiki-ingredient-ranking-modal';
      modal.className = 'ing-rank-modal-overlay modal-overlay';
      document.body.appendChild(modal);
    }

    const itemsHTML = rankedList.length === 0 ? `
      <div class="ing-rank-empty">
        <p>${isEN ? 'No Pokémon matched current ladder filter conditions.' : '當前篩選條件下查無符合之寶可夢。'}</p>
      </div>
    ` : `
      <div class="ing-rank-list">
        ${rankedList.map((item) => {
          const rank = item.rank;
          const rankClass = rank === 1 ? 'rank-1' : (rank === 2 ? 'rank-2' : (rank === 3 ? 'rank-3' : 'rank-other'));
          const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(item.name)) || item.name) : item.name;

          return `
            <div class="ing-rank-card ${rankClass}" title="${pkmDisplayName} (${item.recipe}) · ${item.count} ${isEN ? '/day' : '顆/天'}">
              <div class="ing-rank-left">
                <div class="ing-rank-num ${rankClass}">
                  ${rank === 1 ? '\u{1F947}' : (rank === 2 ? '\u{1F948}' : (rank === 3 ? '\u{1F949}' : `#${rank}`))}
                </div>
                <div class="ing-rank-avatar-box ${rankClass}">
                  <img src="${item.icon}" class="ing-rank-avatar-img" alt="${pkmDisplayName}" loading="lazy">
                </div>
                <span class="node-recipe-tag-inline recipe-tag-${item.recipe.toLowerCase()}">${item.recipe}</span>
              </div>
              <div class="ing-rank-right">
                <span class="ing-rank-yield-line"><span class="ing-rank-yield-num">${item.count}</span><span class="ing-rank-yield-unit">${isEN ? ' /day' : ' 顆/天'}</span></span>
                ${item.skillBonus > 0 ? `
                  <span class="ing-rank-split-line" title="${isEN ? 'Drop: ' + item.dropCount + ' + Skill: ' + item.skillBonus : '食材掉落: ' + item.dropCount + ' + 技能獲取: ' + item.skillBonus}">
                    <span class="split-drop">${item.dropCount}</span>+<span class="split-skill">${item.skillBonus}</span>
                  </span>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    modal.innerHTML = `
      <div class="ing-rank-dialog" onclick="event.stopPropagation()">
        <div class="ing-rank-header">
          <div class="ing-rank-title-group">
            <img src="${ingData.icon}" class="ing-rank-header-icon" alt="${ingName}">
            <div class="ing-rank-header-text">
              <div class="ing-rank-header-title">${ingName} <span class="ing-rank-header-energy">[${isEN ? 'Energy' : '能量'} ${ingData.energy || ''}]</span></div>
              <div class="ing-rank-header-sub">${dishIcon ? `<img src="${dishIcon}" class="tooltip-dish-icon" alt="" loading="lazy">` : ''}<span>${isEN ? 'Key Dish:' : '核心大菜：'} ${dishName} (${dishInfo.need}${isEN ? '/meal' : '顆/餐'}) · ${isEN ? 'Ideal Energy (0.45x)' : '滿活力 (0.45x)'} · ${rankingList.length} ${isEN ? 'Pokémon' : '隻寶可夢'}</span></div>
            </div>
          </div>
          <button type="button" class="ing-rank-close-btn" onclick="window.WikiDB.closeIngredientRankingModal()" title="${isEN ? 'Close' : '關閉'}" aria-label="Close">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="ing-rank-body">
          ${itemsHTML}
        </div>
      </div>
    `;

    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    modal.style.display = 'flex';
    modal.onclick = closeIngredientRankingModal;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeIngredientRankingModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  function closeIngredientRankingModal() {
    const modal = document.getElementById('wiki-ingredient-ranking-modal');
    if (!modal) return;
    const wipe = () => { modal.innerHTML = ''; };
    if (typeof window.animateOverlayClose === 'function') {
      window.animateOverlayClose(modal, wipe);
    } else {
      modal.style.display = 'none';
      wipe();
    }
  }

  // 4. 切換蓄力次數 (0 ~ 10)
  function switchChargeStock(stackNum) {
    stackNum = parseInt(stackNum, 10) || 0;
    const chips = document.querySelectorAll('[data-stack-target]');
    chips.forEach(c => {
      if (parseInt(c.getAttribute('data-stack-target'), 10) === stackNum) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    const chargeSkill = MAIN_SKILLS_DATA.find(s => s.id === 'charge_stock_s');
    if (chargeSkill && chargeSkill.matrix && chargeSkill.matrix[stackNum]) {
      const vals = chargeSkill.matrix[stackNum].vals;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      const unit = isEN ? 'Strength' : '能量';

      // 更新 Hero 雙核心看板
      const heroBase = document.getElementById('hero-base-charge_stock_s');
      const heroMax = document.getElementById('hero-max-charge_stock_s');
      if (heroBase) heroBase.textContent = `${vals[0].toLocaleString()} ${unit}`;
      if (heroMax) heroMax.textContent = `${vals[6].toLocaleString()} ${unit}`;

      // 更新 Stepper 階梯列表
      const stepper = document.getElementById('skill-stepper-charge_stock_s');
      if (stepper) {
        stepper.innerHTML = vals.map((v, i) => {
          const lv = i + 1;
          const isMax = lv === 7;
          return `
            <div class="skill-step-item ${isMax ? 'item-max' : ''}">
              <span class="step-tag-badge">Lv.${lv}</span>
              <span class="step-val-text">${v.toLocaleString()} ${unit}</span>
            </div>
          `;
        }).join('');
      }

      // 保留舊版相容性容器更新 (若有)
      const dynamicContainer = document.getElementById('charge-stock-dynamic-levels');
      if (dynamicContainer) {
        dynamicContainer.innerHTML = vals.map((v, i) => `
          <div class="skill-level-chip ${stackNum === 10 ? 'highlight-gold' : 'highlight-blue'}">
            <span class="level-tag">Lv.${i + 1}</span>
            <span class="level-val">${v.toLocaleString()} ${isEN ? 'Strength' : '能量'}</span>
          </div>
        `).join('');
      }
    }
  }

  // 5. 切換幫手加速同屬種類數 (0 ~ 5)
  function switchHelperBoost(kindNum) {
    kindNum = parseInt(kindNum, 10) || 0;
    const chips = document.querySelectorAll('[data-boost-kind]');
    chips.forEach(c => {
      if (parseInt(c.getAttribute('data-boost-kind'), 10) === kindNum) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    const boostSkill = MAIN_SKILLS_DATA.find(s => s.id === 'helper_boost_type');
    if (boostSkill && boostSkill.matrix && boostSkill.matrix[kindNum]) {
      const vals = boostSkill.matrix[kindNum].vals;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      const unit = isEN ? 'Helps' : '次幫忙';

      // 更新 Hero 雙核心看板
      const heroBase = document.getElementById('hero-base-helper_boost_type');
      const heroMax = document.getElementById('hero-max-helper_boost_type');
      if (heroBase) heroBase.textContent = `${vals[0]} ${unit}`;
      if (heroMax) heroMax.textContent = `${vals[5]} ${unit}`;

      // 更新 Stepper 階梯列表
      const stepper = document.getElementById('skill-stepper-helper_boost_type');
      if (stepper) {
        stepper.innerHTML = vals.map((v, i) => {
          const lv = i + 1;
          const isMax = lv === 6;
          return `
            <div class="skill-step-item ${isMax ? 'item-max' : ''}">
              <span class="step-tag-badge">Lv.${lv}</span>
              <span class="step-val-text">${v} ${unit}</span>
            </div>
          `;
        }).join('');
      }

      // 保留舊版相容性容器更新 (若有)
      const dynamicContainer = document.getElementById('helper-boost-dynamic-levels');
      if (dynamicContainer) {
        dynamicContainer.innerHTML = vals.map((v, i) => `
          <div class="skill-level-chip highlight-blue">
            <span class="level-tag">Lv.${i + 1}</span>
            <span class="level-val">${v} ${isEN ? 'Helps' : '次幫忙'}</span>
          </div>
        `).join('');
      }
    }
  }

  // 5.0 方案 C: 點擊卡片展開 / 收合主技能各等級階梯清單
  function toggleSkillCard(cardEl, skillId, event) {
    if (event) {
      const target = event.target;
      // 避免點擊互動式按鈕、晶片、對照表或展開/收合子按鈕時觸發卡片折疊
      if (target && target.closest && target.closest('button, a, input, select, .wiki-table-wrapper, .stack-chip-btn, .wiki-toggle-detail-btn')) {
        return;
      }
    }
    const card = cardEl || document.getElementById(`skill-card-${skillId}`);
    if (!card) return;
    card.classList.toggle('is-expanded');
  }

  function toggleSkillStepper(skillId) {
    const card = document.getElementById(`skill-card-${skillId}`);
    if (card) {
      card.classList.toggle('is-expanded');
    }
  }

  // 5.1 樹果能量動態等級 (Lv.1 ~ Lv.70)、島嶼加成 (0% ~ 85%) 與 順果 2x 計算 (持久化保存)
  const STORAGE_KEY_BERRY_LEVEL = 'pksleep_wiki_berry_level';
  const STORAGE_KEY_BERRY_ISLAND = 'pksleep_wiki_berry_island';

  let currentBerryLevel = 1;
  let currentIslandBonus = 0;
  let isFavoriteBerry2x = false;

  function loadPersistedBerrySettings() {
    try {
      if (typeof localStorage === 'undefined') return;
      const savedLv = localStorage.getItem(STORAGE_KEY_BERRY_LEVEL);
      if (savedLv !== null) {
        const parsedLv = parseInt(savedLv, 10);
        if (!isNaN(parsedLv) && parsedLv >= 1 && parsedLv <= 70) {
          currentBerryLevel = parsedLv;
        }
      }
      const savedIsland = localStorage.getItem(STORAGE_KEY_BERRY_ISLAND);
      if (savedIsland !== null) {
        const parsedIsland = parseInt(savedIsland, 10);
        if (!isNaN(parsedIsland) && parsedIsland >= 0 && parsedIsland <= 85) {
          currentIslandBonus = parsedIsland;
        }
      }
    } catch (e) {
      console.warn('Failed to load persisted berry settings from localStorage:', e);
    }
  }

  // 初始載入持久化設定
  loadPersistedBerrySettings();

  function calcBerryEnergy(base, lv, islandBonus, isFav) {
    const baseAtLv = Math.round(Math.max(base + (lv - 1), base * Math.pow(1.025, lv - 1)));
    const islandFactor = 1 + ((parseInt(islandBonus, 10) || 0) / 100);
    const favFactor = isFav ? 2 : 1;
    return Math.round(baseAtLv * islandFactor * favFactor);
  }

  function updateBerryLevel(val) {
    currentBerryLevel = Math.min(Math.max(parseInt(val, 10) || 1, 1), 70);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BERRY_LEVEL, currentBerryLevel.toString());
      }
    } catch (e) {}
    const displayEl = document.getElementById('berry-level-display');
    if (displayEl) displayEl.textContent = `Lv. ${currentBerryLevel}`;
    const sliderEl = document.getElementById('berry-level-slider');
    if (sliderEl && parseInt(sliderEl.value, 10) !== currentBerryLevel) {
      sliderEl.value = currentBerryLevel;
    }
    refreshBerryNodes();
  }

  function updateBerryIsland(val) {
    currentIslandBonus = Math.min(Math.max(parseInt(val, 10) || 0, 0), 85);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BERRY_ISLAND, currentIslandBonus.toString());
      }
    } catch (e) {}
    const displayEl = document.getElementById('berry-island-display');
    if (displayEl) displayEl.textContent = `+${currentIslandBonus}%`;
    const sliderEl = document.getElementById('berry-island-slider');
    if (sliderEl && parseInt(sliderEl.value, 10) !== currentIslandBonus) {
      sliderEl.value = currentIslandBonus;
    }
    refreshBerryNodes();
  }

  function toggleBerryFavorite(checked) {
    isFavoriteBerry2x = !!checked;
    refreshBerryNodes();
  }

  function refreshBerryNodes() {
    const grid = document.getElementById('values-berry-grid');
    if (!grid) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    grid.innerHTML = BERRY_VALUES_DATA.map(b => {
      const energy1x = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, false);
      const energy2x = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, true);
      const bName = isEN ? (window.I18N.getBerryName(b.name) || b.name) : b.name;
      const bType = isEN ? (window.I18N.getTypeName(b.type) || b.type) : b.type;
      const bonusStr = currentIslandBonus > 0 ? (isEN ? ` +${currentIslandBonus}% Island` : ` +${currentIslandBonus}%島嶼`) : '';
      return `
        <div class="value-compact-node" title="${bName} (${bType}) - Lv.${currentBerryLevel}${bonusStr} | ${isEN ? 'Base' : '基礎'}: ${energy1x} / ${isEN ? 'Fav 2x' : '順果 2x'}: ${energy2x}">
          <img src="${b.icon}" class="value-compact-icon" alt="${bName}">
          <span class="value-compact-energy berry-val" title="${isEN ? 'Base Energy (1x)' : '基礎能量 (1x)'}"><span class="energy-multiplier-prefix">1x</span> ${energy1x}</span>
          <span class="value-compact-energy berry-val-fav" title="${isEN ? 'Favorite Berry (2x)' : '順果 2x 能量'}"><span class="energy-multiplier-prefix">2x</span> ${energy2x}</span>
        </div>
      `;
    }).join('');
  }

  // 6. 展開/收合詳細對照表
  function toggleDetailTable(targetId) {
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const isHidden = targetEl.style.display === 'none' || targetEl.style.display === '' || window.getComputedStyle(targetEl).display === 'none';
      targetEl.style.setProperty('display', isHidden ? 'block' : 'none', 'important');
    }
  }

  // 7. 主技能發動機率計算機重新計算
  function recalcTriggerChance() {
    const subskillSelect = document.getElementById('calc-subskill-select');
    const natureSelect   = document.getElementById('calc-nature-select');
    const resultVal      = document.getElementById('calc-result-val');
    const resultBadge    = document.getElementById('calc-result-badge');

    if (!subskillSelect || !natureSelect || !resultVal || !resultBadge) return;

    const subskillBonus = parseFloat(subskillSelect.value) || 0;
    const natureMult    = parseFloat(natureSelect.value) || 1.0;
    const totalMult     = (1 + subskillBonus) * natureMult;

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    resultVal.textContent = totalMult.toFixed(3) + (isEN ? 'x' : ' 倍');

    let grade = isEN ? 'A (Good)' : 'A (良好)';
    let gradeCls = 'grade-a';

    if (totalMult >= 1.8) {
      grade = isEN ? 'SSS (God Tier Max)' : 'SSS (頂級發動極限)';
      gradeCls = 'grade-sss';
    } else if (totalMult >= 1.6) {
      grade = isEN ? 'SS (Excellent Max)' : 'SS (優秀極限)';
      gradeCls = 'grade-ss';
    } else if (totalMult >= 1.5) {
      grade = isEN ? 'S (Dual Sub-Skills Very High)' : 'S (雙副技極高)';
      gradeCls = 'grade-s';
    } else if (totalMult >= 1.35) {
      grade = isEN ? 'A (Single STM Neutral Nature)' : 'A (單STM無性格)';
      gradeCls = 'grade-a';
    } else if (totalMult >= 1.15) {
      grade = isEN ? 'B (Moderate Boost)' : 'B (微幅加成)';
      gradeCls = 'grade-b';
    } else if (totalMult >= 1.0) {
      grade = isEN ? 'C (Baseline)' : 'C (基準線附近)';
      gradeCls = 'grade-c';
    } else if (totalMult >= 0.9) {
      grade = isEN ? 'D (Impacted by Nature Down)' : 'D (受性格下修影響)';
      gradeCls = 'grade-d';
    } else {
      grade = isEN ? 'E (Severely Hindered)' : 'E (嚴重受阻)';
      gradeCls = 'grade-e';
    }

    resultBadge.className = `calc-result-badge ${gradeCls}`;
    resultBadge.textContent = grade;
  }

  // 8. 升級睡眠天數計算機重新計算 (Official Pokemon Sleep EXP Table Lv.1~80)
  function recalcSleepDays() {
    const curLvInput    = document.getElementById('calc-sleep-cur-lv');
    const targetLvInput = document.getElementById('calc-sleep-target-lv');
    const expSubskill   = document.getElementById('calc-sleep-exp-subskill');
    const natureSelect  = document.getElementById('calc-sleep-nature-select');
    const daysResult    = document.getElementById('calc-sleep-days-result');
    const expResult     = document.getElementById('calc-sleep-exp-result');
    const candiesResult = document.getElementById('calc-sleep-candies-result');

    if (!curLvInput || !targetLvInput || !daysResult || !expResult) return;

    // 官方 Pokemon Sleep 各等級累積所需 EXP 資料庫 (Lv.1 ~ Lv.80)
    // 依據 WikiWiki 與 RaenonX 實測解包正本
    const cumulativeExp = [
      0,     0,     54,    125,   233,   361,   525,   727,   971,   1245,  1560,
      1905,  2281,  2688,  3107,  3536,  3976,  4430,  4899,  5382,  5879,
      6394,  6931,  7489,  8068,  8668,  9290,  9933,  10598, 11284, 11992,
      12721, 13469, 14235, 15020, 15823, 16644, 17483, 18340, 19215, 20108,
      21018, 21946, 22891, 23854, 24834, 25831, 26846, 27878, 28927, 29993,
      31355, 32917, 34664, 36610, 38805, 41084, 43488, 46021, 48687, 51493,
      54358, 57280, 60257, 63286, 66363, 69458, 72574, 75718, 78907, 82162,
      85492, 88902, 92402, 96002, 99712, 103542, 107502, 111602, 115852, 120262
    ];

    let cur = parseInt(curLvInput.value, 10) || 1;
    let target = parseInt(targetLvInput.value, 10) || 30;

    if (cur < 1) cur = 1;
    if (cur > 99) cur = 99;
    if (target < 2) target = 30;
    if (target > 100) target = 100;

    function getCumulativeExpAt(lv) {
      if (lv <= 80) return cumulativeExp[lv] || 0;
      const exp80 = cumulativeExp[80] || 120262;
      return Math.round(exp80 + ((lv - 80) / 20) * (215000 - exp80));
    }

    // 經驗值類型: 600型 1.0 / 900型(準神) 1.5 / 1080型(神獸) 1.8 / 1320型(幻) 2.2
    // ponytail: 累計值乘倍率四捨五入, 與 Pokebip/WikiWiki 實表誤差 <=1 EXP; 要逐點精準需內嵌三張實表
    const expTypeSelect = document.getElementById('calc-sleep-exp-type');
    const expTypeMult = parseFloat(expTypeSelect ? expTypeSelect.value : 1.0) || 1.0;
    const curExp = Math.round(getCumulativeExpAt(cur) * expTypeMult);
    const targetExp = Math.round(getCumulativeExpAt(target) * expTypeMult);
    const baseExpNeeded = Math.max(0, targetExp - curExp);

    let dailyExp = 100;
    if (expSubskill && expSubskill.checked) dailyExp *= 1.14;
    const natureFactor = parseFloat(natureSelect ? natureSelect.value : 1.0) || 1.0;
    dailyExp *= natureFactor;

    const daysNeeded = baseExpNeeded > 0 ? Math.ceil(baseExpNeeded / dailyExp) : 0;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // 糖果換算 (Candy calculation):
    // 基礎 1 顆 25 EXP; 性格修正: +18% -> 30 EXP (25*1.18=29.5->30), -18% -> 21 EXP (25*0.82=20.5->21)
    const expPerCandy = Math.round(25 * natureFactor);
    const candiesNeeded = baseExpNeeded > 0 ? Math.ceil(baseExpNeeded / expPerCandy) : 0;

    if (baseExpNeeded === 0) {
      daysResult.textContent = isEN ? '0 Days' : '0 天';
      expResult.textContent = isEN ? 'Target Level Already Reached' : '已達目標等級, 無需額外 EXP';
      if (candiesResult) {
        candiesResult.textContent = isEN ? '0 Candies Needed' : '無需額外糖果';
      }
    } else {
      daysResult.textContent = daysNeeded.toLocaleString() + (isEN ? ' Days' : ' 天');
      expResult.textContent = isEN 
        ? `Approx. ${baseExpNeeded.toLocaleString()} EXP` 
        : `約需 ${baseExpNeeded.toLocaleString()} EXP`;
      if (candiesResult) {
        candiesResult.textContent = isEN
          ? `Approx. ${candiesNeeded.toLocaleString()} Candies (${expPerCandy} EXP/ea)`
          : `約需 ${candiesNeeded.toLocaleString()} 顆糖果 (每顆 ${expPerCandy} EXP)`;
      }
    }
  }

  // 9. 初始化升級天數計算機自訂下拉選單
  function initCalcCustomSelects() {
    if (typeof window === 'undefined' || typeof window.setupCustomSelect !== 'function') return;
    const targetSelect = document.getElementById('calc-sleep-target-lv');
    const natureSelect = document.getElementById('calc-sleep-nature-select');
    if (targetSelect && !targetSelect._customized) {
      window.setupCustomSelect(targetSelect);
    }
    if (natureSelect && !natureSelect._customized) {
      window.setupCustomSelect(natureSelect);
    }
    const expTypeSelect = document.getElementById('calc-sleep-exp-type');
    if (expTypeSelect && !expTypeSelect._customized) {
      window.setupCustomSelect(expTypeSelect);
    }
  }

  // --- 綁定直接節點事件 (Direct DOM Event Listeners) ---
  function bindAllEvents() {
    // 1. 綁定二級子分頁切換按鈕
    document.querySelectorAll('.wiki-subtab-btn').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const tab = this.getAttribute('data-subtab');
        switchWikiSubTab(tab);
      };
    });

    // 2. 綁定技能類型篩選按鈕
    document.querySelectorAll('[data-skill-cat]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const cat = this.getAttribute('data-skill-cat');
        filterWikiSkills(cat);
      };
    });

    // 3. 綁定食材天梯篩選按鈕
    document.querySelectorAll('[data-ing-filter]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const ing = this.getAttribute('data-ing-filter');
        filterWikiIngredients(ing);
      };
    });

    // 4. 綁定蓄力次數快速切換按鈕
    document.querySelectorAll('[data-stack-target]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const num = parseInt(this.getAttribute('data-stack-target'), 10) || 0;
        switchChargeStock(num);
      };
    });

    // 5. 綁定幫手加速種類快速切換按鈕
    document.querySelectorAll('[data-boost-kind]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const num = parseInt(this.getAttribute('data-boost-kind'), 10) || 0;
        switchHelperBoost(num);
      };
    });

    // 6. 綁定展開/收合詳細對照表
    document.querySelectorAll('[data-toggle-target]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const targetId = this.getAttribute('data-toggle-target');
        toggleDetailTable(targetId);
      };
    });

    // 7. 綁定主技能發動機率計算機表單
    const subskillSelect = document.getElementById('calc-subskill-select');
    if (subskillSelect) {
      subskillSelect.onchange = recalcTriggerChance;
      subskillSelect.addEventListener('change', recalcTriggerChance);
    }

    const natureSelect = document.getElementById('calc-nature-select');
    if (natureSelect) {
      natureSelect.onchange = recalcTriggerChance;
      natureSelect.addEventListener('change', recalcTriggerChance);
    }

    // 8. 綁定睡眠天數升級計算器表單
    const curLvInput = document.getElementById('calc-sleep-cur-lv');
    if (curLvInput) {
      curLvInput.oninput = recalcSleepDays;
      curLvInput.onchange = recalcSleepDays;
      curLvInput.addEventListener('focus', function () {
        if (typeof this.select === 'function') this.select();
      });
      curLvInput.addEventListener('click', function () {
        if (typeof this.select === 'function') this.select();
      });
    }

    const targetLvInput = document.getElementById('calc-sleep-target-lv');
    if (targetLvInput) {
      targetLvInput.oninput = recalcSleepDays;
      targetLvInput.onchange = recalcSleepDays;
    }

    const expSubskill = document.getElementById('calc-sleep-exp-subskill');
    if (expSubskill) {
      expSubskill.onchange = recalcSleepDays;
    }

    const sleepNatureSelect = document.getElementById('calc-sleep-nature-select');
    if (sleepNatureSelect) {
      sleepNatureSelect.onchange = recalcSleepDays;
    }

    // 9. 綁定天梯篩選側邊欄手勢右滑關閉 (Swipe Right to Close)
    const ladderSidebar = document.getElementById('ladder-filter-sidebar');
    if (ladderSidebar) {
      if (typeof window.bindSidebarSwipeRightToClose === 'function') {
        window.bindSidebarSwipeRightToClose(ladderSidebar, () => closeLadderSidebar());
      } else {
        let startX = 0, startY = 0, startTime = 0;
        ladderSidebar.addEventListener('touchstart', (e) => {
          if (!e.touches || !e.touches[0]) return;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          startTime = Date.now();
        }, { passive: true });
        ladderSidebar.addEventListener('touchend', (e) => {
          if (!e.changedTouches || !e.changedTouches[0]) return;
          const diffX = e.changedTouches[0].clientX - startX;
          const diffY = e.changedTouches[0].clientY - startY;
          const elapsed = Date.now() - startTime;
          if (diffX > 35 && (diffX > Math.abs(diffY) * 1.05 || (elapsed < 350 && diffX > 25))) {
            if (!ladderSidebar.classList.contains('collapsed')) {
              closeLadderSidebar();
            }
          }
        }, { passive: true });
      }
    }
  }

  // --- 全域事件委託備援 (Global Event Delegation Fallback) ---
  let isDelegationBound = false;
  function bindGlobalDelegationFallback() {
    if (isDelegationBound) return;
    isDelegationBound = true;

    document.addEventListener('click', (e) => {
      const subtabBtn = e.target.closest('.wiki-subtab-btn');
      if (subtabBtn) {
        switchWikiSubTab(subtabBtn.getAttribute('data-subtab'));
        return;
      }

      const skillPillBtn = e.target.closest('[data-skill-cat]');
      if (skillPillBtn) {
        filterWikiSkills(skillPillBtn.getAttribute('data-skill-cat'));
        return;
      }

      const ingPillBtn = e.target.closest('[data-ing-filter]');
      if (ingPillBtn) {
        filterWikiIngredients(ingPillBtn.getAttribute('data-ing-filter'));
        return;
      }

      const stackChipBtn = e.target.closest('[data-stack-target]');
      if (stackChipBtn) {
        switchChargeStock(parseInt(stackChipBtn.getAttribute('data-stack-target'), 10) || 0);
        return;
      }

      const ladderViewBtn = e.target.closest('[data-ladder-view]');
      if (ladderViewBtn) {
        switchLadderView(ladderViewBtn.getAttribute('data-ladder-view'));
        return;
      }

      const boostKindBtn = e.target.closest('[data-boost-kind]');
      if (boostKindBtn) {
        switchHelperBoost(parseInt(boostKindBtn.getAttribute('data-boost-kind'), 10) || 0);
        return;
      }

      const toggleBtn = e.target.closest('[data-toggle-target]');
      if (toggleBtn) {
        toggleDetailTable(toggleBtn.getAttribute('data-toggle-target'));
        return;
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target && (e.target.id === 'calc-subskill-select' || e.target.id === 'calc-nature-select')) {
        recalcTriggerChance();
      }
      if (e.target && (e.target.id === 'calc-sleep-exp-subskill' || e.target.id === 'calc-sleep-incense' || e.target.id === 'calc-sleep-nature-select')) {
        recalcSleepDays();
      }
      if (e.target && e.target.id === 'berry-favorite-toggle') {
        toggleBerryFavorite(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-ing-m-toggle') {
        toggleLadderIngM(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-skill-draw-toggle') {
        toggleLadderSkillDrawExpected(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-speed-m-toggle') {
        toggleLadderSpeedM(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-nature-ing-toggle') {
        toggleLadderNatureIng(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-nature-speed-toggle') {
        toggleLadderNatureSpeed(e.target.checked);
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target && (e.target.id === 'calc-sleep-cur-lv' || e.target.id === 'calc-sleep-target-lv')) {
        recalcSleepDays();
      }
      if (e.target && e.target.id === 'berry-level-slider') {
        updateBerryLevel(e.target.value);
      }
      if (e.target && e.target.id === 'berry-island-slider') {
        updateBerryIsland(e.target.value);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSleepStylePopover();
      }
    });
  }
