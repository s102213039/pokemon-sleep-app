  // 獨立美味尾巴專屬天梯子渲染器 (Standalone Slowpoke Tail Ladder Sub-Renderer)
  function renderTailStandaloneLadder(tailIng, highlightMarks, highlightedIngMap, mult) {
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
            const tailDishInfo = (typeof getDynamicTopRecipeForIngredient === 'function')
              ? getDynamicTopRecipeForIngredient('tail', (tailIng && tailIng.name) || '美味尾巴')
              : (TOP_RECIPES_FOR_INGREDIENTS.tail || { need: 10 });
            let tailTop5Threshold = 0;
            if (ladderSupplyFilter === 'TOP') {
              const allMaxCounts = tailIng.pokemon.map(pkm => Math.max(...(pkm.variants || [{ count: pkm.count }]).map(v => v.count)));
              const distinctCounts = [...new Set(allMaxCounts)].sort((a, b) => b - a);
              tailTop5Threshold = distinctCounts[Math.min(4, distinctCounts.length - 1)] || 0;
            }
            const filteredTailPkm = tailIng.pokemon.map((p, pIdx) => {
              const pkmSpec = p.specialty || getPokemonLadderSpecialty(p.name);
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
                         ${isTailDimmed ? 'tabindex="-1"' : `onclick="window.WikiDB.openIngredientRankingModal('tail')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();window.WikiDB.openIngredientRankingModal('tail');}" role="button" tabindex="0"`} 
                         title="${window.I18N?.t?.('wiki.ldr_slowpoke_tail') ?? '美味尾巴'} · ${isTailDimmed ? (window.I18N?.t?.('wiki.ldr_not_required_for_recipe') ?? '非此料理所需食材') : (window.I18N?.t?.('wiki.ldr_click_view_yield_rank') ?? '點擊查看產量排名')}">
                      <img src="${tailIng.icon}" class="ladder-ing-icon" alt="${window.I18N?.t?.('wiki.ldr_slowpoke_tail') ?? '美味尾巴'}" width="24" height="24" decoding="async">
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
                            const pkmDisplayName = (window.I18N && typeof window.I18N.getPokemonName === 'function')
                              ? (window.I18N.getPokemonName(p.name) || (window.I18N?.field?.(p, 'name') ?? p.name))
                              : (window.I18N?.field?.(p, 'name') ?? (p.name_en || p.name));
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

                          const distinctTailYields = [...new Set(tailTrackNodes.map(n => n.scaledCount))].sort((a, b) => b - a);
                          const tailTop3Threshold = distinctTailYields.length > 0 ? distinctTailYields[Math.min(2, distinctTailYields.length - 1)] : Infinity;

                          return tailTrackNodes.map(node => {
                            const group = tailCountGroups[node.scaledCount];
                            const groupSize = group.length;
                            const itemIdx = group.indexOf(node);
                            const baseTailPosPct = parseFloat(getTailPct(node.scaledCount));

                            let offsetPx = 0;
                            if (groupSize > 1) {
                              const staggerStep = groupSize >= 6 ? 14 : 18;
                              if (baseTailPosPct <= 4) {
                                offsetPx = Math.round(itemIdx * staggerStep);
                              } else if (baseTailPosPct >= 96) {
                                offsetPx = Math.round((itemIdx - (groupSize - 1)) * staggerStep);
                              } else {
                                offsetPx = Math.round((itemIdx - (groupSize - 1) / 2) * staggerStep);
                              }
                            }

                            const tailAlignClass = baseTailPosPct > 55 ? 'align-right' : (baseTailPosPct < 25 ? 'align-left' : 'align-center');
                            const rawTailPosExpr = offsetPx === 0 ? `${baseTailPosPct}%` : `calc(${baseTailPosPct}% + ${offsetPx}px)`;
                            const leftStyle = `clamp(12px, ${rawTailPosExpr}, calc(100% - 12px))`;
                            const isTop3 = node.scaledCount > 0 && node.scaledCount >= tailTop3Threshold;
                            const hasIngSelectSkill = (typeof hasPokemonIngSelectSkill === 'function') && hasPokemonIngSelectSkill(node.p.name);
                            const showCountBadge = isTop3 || hasIngSelectSkill;

                            return `
                              <div class="ladder-node ${node.isTopNode ? 'node-top1' : ''} ${hasIngSelectSkill ? 'node-has-ing-select' : ''} ${tailAlignClass} recipe-${node.v.recipe.toLowerCase()} ${groupSize > 1 ? 'node-in-cluster' : ''}" 
                                   data-pkm-group="${node.p.name}"
                                   data-pkm="${node.p.name}" 
                                   data-recipe="${node.v.recipe}"
                                   style="left: ${leftStyle}; z-index: ${node.zIndex};">
                                <div class="node-avatar-wrapper">
                                  <img src="${node.p.icon}" class="node-avatar-img" alt="${node.pkmDisplayName}" width="22" height="22" loading="lazy" decoding="async">
                                </div>
                                ${showCountBadge ? `
                                  <div class="node-count-badge ${hasIngSelectSkill ? 'badge-ing-select' : ''}" ${hasIngSelectSkill ? `title="${window.I18N?.t?.('wiki.ldr_ing_select_pkm_title') ?? '食材精選類技能寶可夢'}"` : ''}>${node.scaledCount}</div>
                                ` : ''}
                                <div class="ladder-node-tooltip">
                                  <div class="tooltip-title">${node.isTopNode ? (window.I18N?.t?.('wiki.ldr_top1_yield') ?? '產量 TOP 1 ') : ''}${node.pkmDisplayName} <span class="node-recipe-tag-inline recipe-tag-${node.v.recipe.toLowerCase()}">${node.v.recipe}</span></div>
                                  <div class="tooltip-detail">${window.I18N?.t?.('wiki.ldr_est_daily_output') ?? '預估日產：'}<span class="text-success font-bold">${node.scaledCount} ${window.I18N?.t?.('wiki.ldr_per_day') ?? '顆/天'}</span></div>
                                  <div class="tooltip-note">${formatLadderNote(node.v.note || '')}</div>
                                </div>
                              </div>
                            `;
                          }).join('');
                        })()}
                      </div>

                      <!-- 尾巴三餐及格線 - 置於節點容器後，確保不被覆蓋 -->
                      ${tailPassingTargets.map(m => {
                        const pctStr = getTailPct(m.target);
                        const pctNum = parseFloat(pctStr);
                        const edgeCls = pctNum >= 96 ? 'passing-edge-right' : (pctNum <= 4 ? 'passing-edge-left' : '');
                        return `
                        <div class="ladder-passing-line-container ${edgeCls}" style="left: ${pctStr}%; --ladder-passing-line-color: ${m.color}; --ladder-passing-line-glow: ${m.color}; --ladder-passing-color-dark: ${m.color}; --ladder-passing-color-light: ${m.fg};" title="${window.I18N?.t?.('wiki.ldr_3meals_target') ?? '三餐及格線: '}${m.target} ${window.I18N?.t?.('wiki.ldr_items_unit') ?? '顆'}">
                          <div class="ladder-passing-line"></div>
                          <div class="ladder-passing-badge">
                            <span class="ladder-passing-num">${m.target}</span>
                          </div>
                        </div>
                      `;
                      }).join('')}
                    </div>
                  </div>
                </div>
              </div>
            `;
  }
