  // 渲染橫向視覺座標天梯圖 (支援多型態並列節點、同組跨度連接線、大菜供應能力評定、動態自適應最大刻度、美味尾巴獨立分離)
  function renderCoordinateLadder(ladderData) {
    const data = ladderData || LV60_COORDINATE_LADDER_DATA || [];
    const mult = getLadderMultiplier();
    const skillTrigMult = getLadderSkillTriggerMultiplier();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const langKey = (window.I18N && typeof window.I18N.getLanguage === 'function') ? window.I18N.getLanguage() : (isEN ? 'en-US' : 'zh-TW');
    const isDefaultData = (!ladderData || ladderData === LV60_COORDINATE_LADDER_DATA);
    const cacheKey = isDefaultData ? [
      langKey,
      mult.toFixed(6),
      skillTrigMult.toFixed(6),
      isLadderSkillDrawExpected ? 1 : 0,
      ladderTop15Only ? 1 : 0,
      ladderSortOrder,
      ladderSupplyFilter,
      ladderRecipeFilter,
      ladderSpecialtyFilter,
      ladderSearchQuery,
      ladderRecipeMultiSelect ? 1 : 0,
      ladderHighlightRecipe || '',
      Array.isArray(ladderHighlightRecipes) ? ladderHighlightRecipes.join(',') : '',
      (typeof window !== 'undefined' && window.allPokemon && window.allPokemon.length) || 0
    ].join('|') : '';

    if (cacheKey && _coordLadderRenderCache.key === cacheKey && _coordLadderRenderCache.html) {
      return _coordLadderRenderCache.html;
    }
    
    const highlightState = buildHighlightIngState();
    const activeHighlightRecipes = highlightState.recipes;
    const highlightedIngMap = activeHighlightRecipes.length ? highlightState.map : null;
    const highlightMarks = highlightState.marks;
    const activeHighlightRecipe = activeHighlightRecipes[0] || null;

    // 分離 18 種常規食材與 1 種獨立美味尾巴
    const mainTracks = data.filter(ing => ing.id !== 'tail');
    const tailIng = data.find(ing => ing.id === 'tail');

    const isUnfilteredDefault = (ladderSpecialtyFilter === 'ALL' && ladderRecipeFilter === 'ALL' && ladderSupplyFilter === 'ALL' && !ladderSearchQuery);

    // 1. 預先過濾各常規食材軌道之寶可夢與變體，並計算目前篩選下的全局最高產量
    let globalMaxCount = 20;
    const processedMainTracks = mainTracks.map(ing => {
      const dishInfo = TOP_RECIPES_FOR_INGREDIENTS[ing.id] || { name: isEN ? 'High Tier Dish' : '高階料理', name_en: 'High Tier Dish', need: 20, type: isEN ? 'Dish' : '料理', secondary: '' };
      const dishName = isEN ? (dishInfo.name_en || dishInfo.name) : dishInfo.name;
      const ingName = isEN ? (window.I18N.getIngredientName(ing.name) || ing.name) : ing.name;
      const minDefaultThreshold = isUnfilteredDefault ? 30 : (DEFAULT_LADDER_MIN_THRESHOLDS[ing.id] || 20);

      const reqMarks = highlightMarks.get(ing.name) || [];
      const reqCount = highlightedIngMap ? highlightedIngMap.get(ing.name) : null;
      const isHighlighted = reqMarks.length > 0;
      const isDimmed = highlightedIngMap && !isHighlighted;
      const targetDishNeed = (isHighlighted && reqCount) ? reqCount : dishInfo.need;
      const targetDishName = isHighlighted
        ? (activeHighlightRecipes.length > 1
          ? (isEN ? `${activeHighlightRecipes.length} recipes` : `${activeHighlightRecipes.length} 道料理`)
          : (isEN ? (activeHighlightRecipe.name_en || activeHighlightRecipe.name_cn) : activeHighlightRecipe.name_cn))
        : dishName;
      const targetDishIcon = isHighlighted
        ? (activeHighlightRecipes.length > 1
          ? (activeHighlightRecipes[0] ? (activeHighlightRecipes[0].icon || getLadderDishIcon(activeHighlightRecipes[0].name_cn)) : '')
          : (activeHighlightRecipe ? (activeHighlightRecipe.icon || getLadderDishIcon(activeHighlightRecipe.name_cn)) : ''))
        : (dishInfo.icon || getLadderDishIcon(dishInfo.name));

      // 若為 TOP 篩選，於軌道外層一次性預先計算 top5Threshold，消除 O(P^2) 重複掃描
      let trackTop5Threshold = 0;
      if (ladderSupplyFilter === 'TOP') {
        const allMaxCounts = ing.pokemon.map(pkm => {
          const pkmBonus = getPokemonSkillDrawBonus(pkm.name, ing.id, ing.name);
          return Math.max(...(pkm.variants || [{ count: pkm.count }]).map(v => Math.round(v.count * mult) + pkmBonus));
        });
        const distinctCounts = [...new Set(allMaxCounts)].sort((a, b) => b - a);
        trackTop5Threshold = distinctCounts[Math.min(4, distinctCounts.length - 1)] || 0;
      }

      // 取得該軌道符合篩選之寶可夢與型態變體
      const filteredPokemonList = ing.pokemon.map((p, pIdx) => {
        const pkmSpec = getPokemonLadderSpecialty(p.name);
        if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return null;
        if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return null;
        if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return null;

        // 搜尋關鍵字過濾
        if (ladderSearchQuery) {
          if (!matchesLadderSearch(p.name, p.name_en, ladderSearchQuery)) return null;
        }

        const skillBonus = getPokemonSkillDrawBonus(p.name, ing.id, ing.name);

        let variants = p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }];

        // 全部展示狀態下僅展示產量 >= 30 的主力型態變體；有具體篩選條件時則完整展示 (< 30 也展示)
        variants = variants.filter(v => (Math.round(v.count * mult) + skillBonus) >= minDefaultThreshold);

        variants = variants.filter(v => matchesLadderRecipeFilter(v, ladderRecipeFilter));

        if (ladderSupplyFilter === 'TOP') {
          // 前五名：保留該軌道排名前 5 (Top 1 ~ Top 5) 的寶可夢梯隊，且只展示其最高產量變體
          const pkmMaxCount = Math.max(...(p.variants || [{ count: p.count }]).map(v => Math.round(v.count * mult) + skillBonus));
          if (pkmMaxCount < trackTop5Threshold) return null;
          variants = variants.slice(0, 1);
        } else if (ladderSupplyFilter === 'MEALS_3') {
          // 滿載 3 餐：日產量 >= 當前料理 3 餐所需總量 (選定料理時以選定料理需求計算)
          variants = variants.filter(v => {
            const scaled = Math.round(v.count * mult) + skillBonus;
            return scaled >= targetDishNeed * 3;
          });
        } else if (ladderSupplyFilter === 'MEALS_2') {
          // 充足 2 餐：日產量 >= 當前料理 2 餐所需總量 (選定料理時以選定料理需求計算)
          variants = variants.filter(v => {
            const scaled = Math.round(v.count * mult) + skillBonus;
            return scaled >= targetDishNeed * 2;
          });
        }

        if (variants.length === 0) return null;

        variants.forEach(v => {
          const scaled = Math.round(v.count * mult) + skillBonus;
          if (scaled > globalMaxCount) globalMaxCount = scaled;
        });

        return { ...p, variants };
      }).filter(Boolean);

      return {
        ing,
        dishInfo,
        dishName,
        targetDishNeed,
        targetDishName,
        targetDishIcon,
        isHighlighted,
        isDimmed,
        reqCount,
        reqMarks,
        ingName,
        filteredPokemonList,
        isTrackEmpty: filteredPokemonList.length === 0
      };
    });

    // 依天梯軌道排序選項排序 processedMainTracks (Track Sorting)
    processedMainTracks.sort((a, b) => {
      if (ladderSortOrder === 'ENERGY_DESC') {
        return (b.ing.energy || 0) - (a.ing.energy || 0);
      } else if (ladderSortOrder === 'YIELD_DESC') {
        const getTrackMax = (track) => {
          if (track.filteredPokemonList && track.filteredPokemonList.length > 0) {
            let m = 0;
            track.filteredPokemonList.forEach(p => {
              const skillBonus = getPokemonSkillDrawBonus(p.name, track.ing.id, track.ing.name);
              p.variants.forEach(v => {
                const scaled = Math.round(v.count * mult) + skillBonus;
                if (scaled > m) m = scaled;
              });
            });
            return m;
          }
          let m = 0;
          if (track.ing && track.ing.pokemon) {
            track.ing.pokemon.forEach(p => {
              const skillBonus = getPokemonSkillDrawBonus(p.name, track.ing.id, track.ing.name);
              (p.variants || [{ count: p.count }]).forEach(v => {
                const scaled = (v.count || 0) + skillBonus;
                if (scaled > m) m = scaled;
              });
            });
          }
          return m * 0.001;
        };
        const maxA = getTrackMax(a);
        const maxB = getTrackMax(b);
        if (maxB !== maxA) return maxB - maxA;
        return (b.ing.energy || 0) - (a.ing.energy || 0);
      } else if (ladderSortOrder === 'DEMAND_DESC') {
        const needA = (a.dishInfo && a.dishInfo.need) || 0;
        const needB = (b.dishInfo && b.dishInfo.need) || 0;
        if (needB !== needA) return needB - needA;
        return (b.ing.energy || 0) - (a.ing.energy || 0);
      } else {
        // 預設 ENERGY_ASC：食材能量由低到高
        return (a.ing.energy || 0) - (b.ing.energy || 0);
      }
    });

    // 若有選取高分料理高亮，將符合該料理的食材軌道優先置頂，並依需求量由多到少排序
    if (highlightedIngMap) {
      processedMainTracks.sort((a, b) => {
        const aReq = highlightedIngMap.has(a.ing.name);
        const bReq = highlightedIngMap.has(b.ing.name);
        if (aReq && !bReq) return -1;
        if (!aReq && bReq) return 1;
        if (aReq && bReq) {
          return (highlightedIngMap.get(b.ing.name) || 0) - (highlightedIngMap.get(a.ing.name) || 0);
        }
        return 0;
      });
    }

    // 2. 動態設定最高與最低刻度 (全部展示時自 30 起標，有篩選時動態支援低於 30 之刻度)
    let globalMinCount = 100;
    processedMainTracks.forEach(t => {
      t.filteredPokemonList.forEach(p => {
        const skillBonus = getPokemonSkillDrawBonus(p.name, t.ing.id, t.ing.name);
        p.variants.forEach(v => {
          const scaled = Math.round(v.count * mult) + skillBonus;
          if (scaled < globalMinCount) globalMinCount = scaled;
        });
      });
    });

    let minVal = 30;
    if (!isUnfilteredDefault && globalMinCount < 30) {
      minVal = Math.max(0, Math.floor(globalMinCount / 10) * 10);
      if (minVal > 20) minVal = 20;
    }
    let maxVal = Math.ceil((globalMaxCount + 1) / 10) * 10;
    if (maxVal <= minVal) maxVal = minVal + 10; // 最低跨度至少 10

    // 若有選取料理，計算該料理所有食材之最大三餐及格線需求 (3 Meals Max Target)
    // 若當前範圍數量不足以把及格線畫上，則將最大及格線當作最大展示數量，務必展示出及格線
    let maxPassingTarget = 0;
    activeHighlightRecipes.forEach(rec => {
      (rec.ingredients || []).forEach(item => {
        if (item.name !== '美味尾巴' && item.name !== 'Slowpoke Tail') {
          const target = (item.count || 0) * 3;
          if (target > maxPassingTarget) maxPassingTarget = target;
        }
      });
    });
    if (maxPassingTarget > maxVal) {
      maxVal = Math.ceil(maxPassingTarget / 10) * 10;
    }

    // 動態計算刻度步長 step
    const span = maxVal - minVal;
    let step = 10;
    if (span > 120) {
      step = 20;
    } else if (span > 80) {
      step = 10;
    } else {
      step = 10;
    }

    let ticks = [];
    for (let t = minVal; t <= maxVal; t += step) {
      ticks.push(t);
    }
    if (ticks[ticks.length - 1] < maxVal) {
      ticks.push(maxVal);
    }

    function getPosPct(val) {
      const clamped = Math.min(Math.max(val, minVal), maxVal);
      return ((clamped - minVal) / (maxVal - minVal) * 100).toFixed(2);
    }

    const renderedHtml = `
      <div class="wiki-coordinate-ladder-wrapper">
        <div class="wiki-coordinate-ladder" onmouseover="window.WikiDB.handleLadderGroupHover(event)" onmouseout="window.WikiDB.handleLadderGroupHoverOut(event)">
          ${activeHighlightRecipes.length ? `
            <div class="ladder-recipe-banner ${activeHighlightRecipes.length > 1 ? 'ladder-recipe-banner-multi' : ''}">
              <div class="ladder-recipe-banner-recipes">
                ${activeHighlightRecipes.map((rec, idx) => {
                  const style = getRecipeMarkStyle(idx);
                  const recName = isEN ? rec.name_en : rec.name_cn;
                  return `
                    <div class="ladder-recipe-banner-recipe-chip" title="${recName}">
                      ${activeHighlightRecipes.length > 1 ? `<span class="ladder-recipe-banner-recipe-dot" style="background:${style.color}"></span>` : ''}
                      <img src="${rec.icon}" class="ladder-recipe-banner-icon" alt="${recName}">
                    </div>
                  `;
                }).join('')}
              </div>
              <button type="button" class="ladder-recipe-banner-clear-btn" onclick="window.WikiDB.clearLadderHighlightRecipe()" title="${isEN ? 'Clear recipe highlight' : '清除料理高亮'}" aria-label="${isEN ? 'Clear' : '清除'}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ` : ''}

          <!-- 頂部刻度標尺 (自 20 起標至動態最高值 ${maxVal}) -->
          <div class="ladder-ruler-header">
            <div class="ladder-ruler-spacer"></div>
            <div class="ladder-ruler-scale">
              ${ticks.map(t => `
                <div class="ladder-ruler-tick" style="left: ${getPosPct(t)}%;">
                  <span class="tick-label">${t}</span>
                  <div class="tick-line"></div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 常規食材軌道 (18種食材，依篩選動態縮放) -->
          ${processedMainTracks.map(({ ing, dishInfo, dishName, targetDishNeed, targetDishName, targetDishIcon, isHighlighted, isDimmed, reqCount, reqMarks, ingName, filteredPokemonList, isTrackEmpty }, trackIdx) => {
            // 計算該軌道最低產量起點，用於畫出前方點狀前導虛線
            let minTrackCount = maxVal;
            filteredPokemonList.forEach(p => {
              const skillBonus = getPokemonSkillDrawBonus(p.name, ing.id, ing.name);
              p.variants.forEach(v => {
                const scaled = Math.round(v.count * mult) + skillBonus;
                if (scaled < minTrackCount) minTrackCount = scaled;
              });
            });
            if (minTrackCount > maxVal) minTrackCount = minVal;
            const leadPct = getPosPct(minTrackCount);
            const isTopTrack = trackIdx < 5;
            const popupDirectionClass = isTopTrack ? 'popup-down' : 'popup-up';

            // 先計算該軌道最高產量 (Track Max Yield)
            let trackMaxYield = 0;
            filteredPokemonList.forEach(p => {
              const skillBonus = getPokemonSkillDrawBonus(p.name, ing.id, ing.name);
              p.variants.forEach(v => {
                const scaled = Math.round(v.count * mult) + skillBonus;
                if (scaled > trackMaxYield) trackMaxYield = scaled;
              });
            });

            let trackNodes = [];
            filteredPokemonList.forEach((p, pIdx) => {
              const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(p.name)) || p.name) : p.name;
              const skillBonus = getPokemonSkillDrawBonus(p.name, ing.id, ing.name);
              p.variants.forEach((v, vIdx) => {
                const dropCount = Math.round(v.count * mult);
                const scaledCount = dropCount + skillBonus;
                const isTopNode = (scaledCount === trackMaxYield && scaledCount > 0) || v.isTop || (p.isTop && v.recipe === p.recipe);
                const zIndex = isTopNode ? 45 : Math.max(35 - pIdx * 3 - vIdx, 5);
                trackNodes.push({
                  p,
                  pIdx,
                  pkmDisplayName,
                  v,
                  vIdx,
                  dropCount,
                  skillBonus,
                  scaledCount,
                  isTopNode,
                  zIndex
                });
              });
            });

            // 預設或開啟前15名篩選：僅保留產量前 15 名的節點（大幅削減 70% DOM 節點，徹底消除卡頓）
            if (ladderTop15Only && trackNodes.length > 15) {
              trackNodes.sort((a, b) => b.scaledCount - a.scaledCount);
              trackNodes = trackNodes.slice(0, 15);
            }

            const visiblePkmGroupNames = new Set(trackNodes.map(n => n.p.name));
            const highlightClass = isHighlighted ? 'ladder-track-highlighted' : (isDimmed ? 'ladder-track-dimmed' : '');
            const passingTargets = (reqMarks || []).map(m => ({ ...m, target: m.count * 3 }));

            return `
            <div class="ladder-track-row ${isTrackEmpty ? 'ladder-track-empty' : ''} ${isTopTrack ? 'ladder-track-top' : ''} ${highlightClass}" data-ladder-ing="${ing.id}">
              <div class="ladder-track-header ${isDimmed ? 'ladder-track-disabled-header' : 'clickable-ing-header'}" 
                   ${isDimmed ? 'tabindex="-1"' : `onclick="window.WikiDB.openIngredientRankingModal('${ing.id}')" role="button" tabindex="0"`} 
                   title="${ingName} (${isEN ? 'Base Energy' : '基礎能量'} ${ing.energy}) · ${isHighlighted ? (isEN ? 'Selected Dish: ' : '選定料理: ') + targetDishName + ` (${targetDishNeed}${isEN ? '/meal' : '顆/餐'})` : (isDimmed ? (isEN ? 'Not in current recipe' : '非此料理所需食材') : (isEN ? 'Key Dish: ' : '核心大菜: ') + dishName)} · ${isEN ? 'Click to view rankings' : '點擊查看產量排名'}">
                <div class="ladder-track-ing-main">
                  <img src="${ing.icon}" class="ladder-ing-icon" alt="${ingName}">
                </div>
              </div>

              <div class="ladder-track-canvas">
                <div class="ladder-grid-lines">
                  ${ticks.map(t => `<div class="ladder-grid-line" style="left: ${getPosPct(t)}%;"></div>`).join('')}
                </div>

                <!-- 前導點狀虛線 (20 ~ 最低產量) 與 實體軌道線 (最低產量 ~ 終點) -->
                <div class="ladder-track-lead-line" style="left: 0; width: ${leadPct}%;"></div>
                <div class="ladder-track-line" style="left: ${leadPct}%; right: 0;"></div>

                <!-- 跨度連接線容器 -->
                <div class="ladder-spans-container">
                  ${filteredPokemonList.map(p => {
                    if (ladderTop15Only && !visiblePkmGroupNames.has(p.name)) return '';
                    const pkmNodes = trackNodes.filter(n => n.p.name === p.name);
                    if (pkmNodes.length < 2) return '';
                    const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(p.name)) || p.name) : p.name;
                    const scaledCounts = pkmNodes.map(n => n.scaledCount);
                    const minCount = Math.min(...scaledCounts);
                    const maxCount = Math.max(...scaledCounts);
                    const minPct = parseFloat(getPosPct(minCount));
                    const maxPct = parseFloat(getPosPct(maxCount));
                    const widthPct = Math.max(0.5, (maxPct - minPct)).toFixed(2);
                    return `
                      <div class="ladder-span-bar" 
                           data-pkm-group="${p.name}" 
                           style="left: ${minPct}%; width: ${widthPct}%;"
                           title="${pkmDisplayName} ${isEN ? 'Range: ' : '配方跨度: '}${minCount} ~ ${maxCount} ${isEN ? '/day' : '顆/天'}">
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- 寶可夢型態節點容器 (Nodes Container) -->
                <div class="ladder-nodes-container">
                  ${(() => {
                    // 依據 scaledCount 分組以計算重疊節點之水平偏移量 (Cluster Stagger Offset)
                    const countGroups = {};
                    trackNodes.forEach(node => {
                      if (!countGroups[node.scaledCount]) countGroups[node.scaledCount] = [];
                      countGroups[node.scaledCount].push(node);
                    });

                    return trackNodes.map(node => {
                      const group = countGroups[node.scaledCount];
                      const groupSize = group.length;
                      const itemIdx = group.indexOf(node);
                      
                      let offsetPx = 0;
                      if (groupSize > 1) {
                        const staggerStep = groupSize >= 6 ? 14 : 18;
                        offsetPx = Math.round((itemIdx - (groupSize - 1) / 2) * staggerStep);
                      }

                      // 料理供應能力試算 (若有選取料理則依選定料理單餐需求計算，否則依核心大菜計算)
                      const mealsPerDay = (node.scaledCount / targetDishNeed).toFixed(1);
                      let dishTag = '';
                      let dishBadgeClass = '';
                      if (mealsPerDay >= 3.0) {
                        dishTag = isEN ? `Full 3 Meals (${mealsPerDay} meals/day)` : `滿載 3 餐大菜 (${mealsPerDay} 餐/天)`;
                        dishBadgeClass = 'dish-badge-full';
                      } else if (mealsPerDay >= 1.8) {
                        dishTag = isEN ? `Solid 2 Meals (${mealsPerDay} meals/day)` : `充足供應 2 餐大菜 (${mealsPerDay} 餐/天)`;
                        dishBadgeClass = 'dish-badge-high';
                      } else {
                        dishTag = isEN ? `Auxiliary Support (${mealsPerDay} meals/day)` : `輔助支援 (${mealsPerDay} 餐/天)`;
                        dishBadgeClass = 'dish-badge-assist';
                      }

                      const basePosPct = parseFloat(getPosPct(node.scaledCount));
                      const alignClass = basePosPct > 60 ? 'align-right' : (basePosPct < 40 ? 'align-left' : 'align-center');
                      const leftStyle = offsetPx === 0 ? `${basePosPct}%` : `calc(${basePosPct}% + ${offsetPx}px)`;
                      const hasSkillDraw = node.skillBonus > 0;
                      const dishLabel = isHighlighted ? (isEN ? 'Selected Dish: ' : '選定料理: ') : (isEN ? 'Key Dish: ' : '核心大菜: ');

                      return `
                        <div class="ladder-node ${node.isTopNode ? 'node-top1' : ''} ${hasSkillDraw ? 'node-has-skill-draw' : ''} ${alignClass} ${popupDirectionClass} recipe-${node.v.recipe.toLowerCase()} ${groupSize > 1 ? 'node-in-cluster' : ''}" 
                             data-pkm-group="${node.p.name}"
                             data-pkm="${node.p.name}" 
                             data-recipe="${node.v.recipe}"
                             style="left: ${leftStyle}; z-index: ${node.zIndex};">
                          <div class="node-avatar-wrapper">
                            <img src="${node.p.icon}" class="node-avatar-img" alt="${node.pkmDisplayName}" loading="lazy" decoding="async">
                          </div>
                          <div class="node-count-badge ${hasSkillDraw ? 'badge-skill-draw' : ''}" ${hasSkillDraw ? `title="${isEN ? 'Base Drop: ' + node.dropCount + ' + Ingr. Selection Lv.7: ' + node.skillBonus : '常規食材掉落: ' + node.dropCount + ' + 食材精選S Lv.7: ' + node.skillBonus}"` : ''}>
                            ${node.scaledCount}
                          </div>
                          
                          <div class="ladder-node-tooltip">
                            <div class="tooltip-title">${node.isTopNode ? (isEN ? 'Top 1 Yield ' : '產量 TOP 1 ') : ''}${node.pkmDisplayName} <span class="node-recipe-tag-inline recipe-tag-${node.v.recipe.toLowerCase()}">${node.v.recipe}</span></div>
                            <div class="tooltip-detail">${isEN ? 'Est. Daily Output: ' : '預估總日產：'}<span class="text-success font-bold">${node.scaledCount} ${isEN ? '/day' : '顆/天'}</span></div>
                            
                            ${hasSkillDraw ? `
                              <!-- 食材掉落與技能獲取雙區塊拆解 -->
                              <div class="tooltip-yield-breakdown">
                                <div class="breakdown-row">
                                  <span class="breakdown-label">${isEN ? 'Ingredient Drop:' : '常規食材掉落：'}</span>
                                  <span class="breakdown-val">${node.dropCount} ${isEN ? 'items' : '顆'}</span>
                                </div>
                                <div class="breakdown-row breakdown-skill">
                                  <span class="breakdown-label">${isEN ? 'Ingr. Selection S (Lv.7):' : '食材精選S 獲取 (Lv.7)：'}</span>
                                  <span class="breakdown-val">+${node.skillBonus} ${isEN ? 'items' : '顆'}</span>
                                </div>
                              </div>
                            ` : ''}

                            <!-- 料理供貨能力指標 (動態對應選定料理，以料理圖示代替名稱) -->
                            <div class="tooltip-dish-box">
                              <div class="tooltip-dish-title">${dishLabel}${targetDishIcon ? `<img src="${targetDishIcon}" class="tooltip-dish-icon" alt="${escapeHtml(targetDishName)}" title="${escapeHtml(targetDishName)}" loading="lazy">` : `<span class="text-white font-bold">${targetDishName}</span>`} (${targetDishNeed}${isEN ? '/meal' : '顆/餐'})</div>
                              <div class="tooltip-dish-badge ${dishBadgeClass}">${dishTag}</div>
                            </div>

                            <div class="tooltip-note">${formatLadderNote(node.v.note || '', isEN)}</div>
                          </div>
                        </div>
                      `;
                    }).join('');
                  })()}
                </div>

                <!-- 三餐及格線 (3 Meals Passing Line) - 置於節點容器後，確保不被覆蓋 -->
                ${passingTargets.map(m => `
                  <div class="ladder-passing-line-container" style="left: ${getPosPct(m.target)}%; --ladder-passing-line-color: ${m.color}; --ladder-passing-line-glow: ${m.color};" title="${isEN ? '3 Meals Target: ' : '三餐及格線: '}${m.target} ${isEN ? 'items' : '顆'}">
                    <div class="ladder-passing-line"></div>
                    <div class="ladder-passing-badge" style="color:${m.color};border-color:${m.color}">
                      <span class="ladder-passing-num">${m.target}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
          }).join('')}

          <!-- 獨立美味尾巴專屬天梯小看板 (0 ~ 20 獨立刻度，支援高亮與及格線) -->
          ${tailIng ? (() => {
            const tailReqMarks = highlightMarks.get('美味尾巴') || highlightMarks.get('Slowpoke Tail') || [];
            const tailReqCount = highlightedIngMap ? (highlightedIngMap.get('美味尾巴') || highlightedIngMap.get('Slowpoke Tail')) : null;
            const isTailHighlighted = tailReqMarks.length > 0;
            const isTailDimmed = highlightedIngMap && !isTailHighlighted;
            const tailPassingTargets = tailReqMarks.map(m => ({ ...m, target: m.count * 3 }));
            const tailThreeMealsTarget = isTailHighlighted ? Math.max(...tailPassingTargets.map(m => m.target)) : null;

            let tailMax = 20;
            if (isTailHighlighted && tailThreeMealsTarget > tailMax) {
              tailMax = Math.ceil(tailThreeMealsTarget / 5) * 5;
            }
            const tailStep = tailMax > 30 ? 10 : 5;
            const tailTicks = [];
            for (let t = 0; t <= tailMax; t += tailStep) {
              tailTicks.push(t);
            }
            if (tailTicks[tailTicks.length - 1] < tailMax) {
              tailTicks.push(tailMax);
            }
            function getTailPct(val) {
              const clamped = Math.min(Math.max(val, 0), tailMax);
              return ((clamped / tailMax) * 100).toFixed(2);
            }
            const tailDishInfo = TOP_RECIPES_FOR_INGREDIENTS.tail || { need: 10 };
            let tailTop5Threshold = 0;
            if (ladderSupplyFilter === 'TOP') {
              const allMaxCounts = tailIng.pokemon.map(pkm => Math.max(...(pkm.variants || [{ count: pkm.count }]).map(v => v.count)));
              const distinctCounts = [...new Set(allMaxCounts)].sort((a, b) => b - a);
              tailTop5Threshold = distinctCounts[Math.min(4, distinctCounts.length - 1)] || 0;
            }
            const filteredTailPkm = tailIng.pokemon.map((p, pIdx) => {
              const pkmSpec = getPokemonLadderSpecialty(p.name);
              if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return null;
              if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return null;
              if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return null;

              if (ladderSearchQuery) {
                if (!matchesLadderSearch(p.name, p.name_en, ladderSearchQuery)) return null;
              }

              let variants = p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }];
              variants = variants.filter(v => matchesLadderRecipeFilter(v, ladderRecipeFilter));

              if (ladderSupplyFilter === 'TOP') {
                const pkmMaxCount = Math.max(...(p.variants || [{ count: p.count }]).map(v => v.count));
                if (pkmMaxCount < tailTop5Threshold) return null;
                variants = variants.slice(0, 1);
              } else if (ladderSupplyFilter === 'MEALS_3') {
                variants = variants.filter(v => Math.round(v.count * mult) >= tailDishInfo.need * 3);
              } else if (ladderSupplyFilter === 'MEALS_2') {
                variants = variants.filter(v => Math.round(v.count * mult) >= tailDishInfo.need * 2);
              }

              if (variants.length === 0) return null;
              return { ...p, variants };
            }).filter(Boolean);

            const isTailEmpty = filteredTailPkm.length === 0;

            return `
              <div class="ladder-tail-standalone-container ${isTailDimmed ? 'ladder-track-dimmed' : ''}">
                <div class="ladder-tail-standalone-box">
                  <div class="ladder-tail-ruler">
                    <div class="ladder-tail-ruler-spacer"></div>
                    <div class="ladder-tail-ruler-scale">
                      ${tailTicks.map(t => `
                        <div class="ladder-tail-tick" style="left: ${getTailPct(t)}%;">
                          <span class="tick-label">${t}</span>
                          <div class="tick-line"></div>
                        </div>
                      `).join('')}
                    </div>
                  </div>

                  <div class="ladder-tail-track-row ${isTailEmpty ? 'ladder-track-empty' : ''} ${isTailDimmed ? 'ladder-track-dimmed' : (isTailHighlighted ? 'ladder-track-highlighted' : '')}" data-ladder-ing="tail">
                    <div class="ladder-track-header ${isTailDimmed ? 'ladder-track-disabled-header' : 'clickable-ing-header'}" 
                         ${isTailDimmed ? 'tabindex="-1"' : `onclick="window.WikiDB.openIngredientRankingModal('tail')" role="button" tabindex="0"`} 
                         title="${isEN ? 'Slowpoke Tail' : '美味尾巴'} · ${isTailDimmed ? (isEN ? 'Not required for this recipe' : '非此料理所需食材') : (isEN ? 'Click to view rankings' : '點擊查看產量排名')}">
                      <img src="${tailIng.icon}" class="ladder-ing-icon" alt="${isEN ? 'Slowpoke Tail' : '美味尾巴'}">
                    </div>

                    <div class="ladder-tail-canvas">
                      <div class="ladder-grid-lines">
                        ${tailTicks.map(t => `<div class="ladder-grid-line" style="left: ${getTailPct(t)}%;"></div>`).join('')}
                      </div>

                      <div class="ladder-spans-container">
                        ${filteredTailPkm.map(p => {
                          if (p.variants.length < 2) return '';
                          const scaledCounts = p.variants.map(v => Math.round(v.count * mult));
                          const minC = Math.min(...scaledCounts);
                          const maxC = Math.max(...scaledCounts);
                          const minPct = parseFloat(getTailPct(minC));
                          const maxPct = parseFloat(getTailPct(maxC));
                          const widthPct = Math.max(maxPct - minPct, 1.5).toFixed(2);
                          return `<div class="ladder-pkm-span-line" data-pkm-group="${p.name}" style="left: ${minPct}%; width: ${widthPct}%;"></div>`;
                        }).join('')}
                      </div>

                      <div class="ladder-nodes-container">
                        ${(() => {
                          // 先計算美味尾巴最高產量 (Tail Track Max Yield)
                          let tailMaxYield = 0;
                          filteredTailPkm.forEach(p => {
                            p.variants.forEach(v => {
                              const scaled = Math.round(v.count * mult);
                              if (scaled > tailMaxYield) tailMaxYield = scaled;
                            });
                          });

                          const tailTrackNodes = [];
                          filteredTailPkm.forEach((p, pIdx) => {
                            const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(p.name)) || p.name) : p.name;
                            p.variants.forEach((v, vIdx) => {
                              const scaledCount = Math.round(v.count * mult);
                              const isTopNode = (scaledCount === tailMaxYield && scaledCount > 0) || v.isTop || (p.isTop && v.recipe === p.recipe);
                              const zIndex = isTopNode ? 45 : Math.max(35 - pIdx * 3 - vIdx, 5);
                              tailTrackNodes.push({
                                p,
                                pIdx,
                                pkmDisplayName,
                                v,
                                vIdx,
                                scaledCount,
                                isTopNode,
                                zIndex
                              });
                            });
                          });

                          const tailCountGroups = {};
                          tailTrackNodes.forEach(node => {
                            if (!tailCountGroups[node.scaledCount]) tailCountGroups[node.scaledCount] = [];
                            tailCountGroups[node.scaledCount].push(node);
                          });

                          return tailTrackNodes.map(node => {
                            const group = tailCountGroups[node.scaledCount];
                            const groupSize = group.length;
                            const itemIdx = group.indexOf(node);
                            
                            let offsetPx = 0;
                            if (groupSize > 1) {
                              const staggerStep = groupSize >= 6 ? 14 : 18;
                              offsetPx = Math.round((itemIdx - (groupSize - 1) / 2) * staggerStep);
                            }

                            const baseTailPosPct = parseFloat(getTailPct(node.scaledCount));
                            const tailAlignClass = baseTailPosPct > 55 ? 'align-right' : (baseTailPosPct < 25 ? 'align-left' : 'align-center');
                            const leftStyle = offsetPx === 0 ? `${baseTailPosPct}%` : `calc(${baseTailPosPct}% + ${offsetPx}px)`;

                            return `
                              <div class="ladder-node ${node.isTopNode ? 'node-top1' : ''} ${tailAlignClass} recipe-${node.v.recipe.toLowerCase()} ${groupSize > 1 ? 'node-in-cluster' : ''}" 
                                   data-pkm-group="${node.p.name}"
                                   data-pkm="${node.p.name}" 
                                   data-recipe="${node.v.recipe}"
                                   style="left: ${leftStyle}; z-index: ${node.zIndex};">
                                <div class="node-avatar-wrapper">
                                  <img src="${node.p.icon}" class="node-avatar-img" alt="${node.pkmDisplayName}">
                                </div>
                                <div class="node-count-badge">${node.scaledCount}</div>
                                <div class="ladder-node-tooltip">
                                  <div class="tooltip-title">${node.isTopNode ? (isEN ? 'Top 1 Yield ' : '產量 TOP 1 ') : ''}${node.pkmDisplayName} <span class="node-recipe-tag-inline recipe-tag-${node.v.recipe.toLowerCase()}">${node.v.recipe}</span></div>
                                  <div class="tooltip-detail">${isEN ? 'Est. Daily Output: ' : '預估日產：'}<span class="text-success font-bold">${node.scaledCount} ${isEN ? '/day' : '顆/天'}</span></div>
                                  <div class="tooltip-note">${formatLadderNote(node.v.note || '', isEN)}</div>
                                </div>
                              </div>
                            `;
                          }).join('');
                        })()}
                      </div>

                      <!-- 尾巴三餐及格線 - 置於節點容器後，確保不被覆蓋 -->
                      ${tailPassingTargets.map(m => `
                        <div class="ladder-passing-line-container" style="left: ${getTailPct(m.target)}%; --ladder-passing-line-color: ${m.color}; --ladder-passing-line-glow: ${m.color};" title="${isEN ? '3 Meals Target: ' : '三餐及格線: '}${m.target} ${isEN ? 'items' : '顆'}">
                          <div class="ladder-passing-line"></div>
                          <div class="ladder-passing-badge" style="color:${m.fg};border-color:${m.color}">
                            <span class="ladder-passing-num">${m.target}</span>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            `;
          })() : ''}
        </div>
      </div>
    `;
    if (cacheKey) {
      _coordLadderRenderCache = { key: cacheKey, html: renderedHtml };
    }
    return renderedHtml;
  }

