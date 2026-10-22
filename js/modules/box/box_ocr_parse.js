    const clean = normalizeOcrText(text);


    // 1. 等級預先萃取 (優先從頂部資訊卡辨識，避開主技能等級如 Lv.7)
    let level = 30;
    const mainSkillIdx = text.indexOf('健美') !== -1 ? text.indexOf('健美') : (text.indexOf('料理') !== -1 ? text.indexOf('料理') : -1);
    const headerPart = mainSkillIdx > 0 ? text.substring(0, mainSkillIdx) : text;
    const mHeader = headerPart.match(/Lv\.?\s*(\d{1,2})/i) || headerPart.match(/LV\s*(\d{1,2})/i) || normalizeOcrText(headerPart).match(/Lv\.?(\d{1,2})/i);
    if (mHeader) {
      const parsedLvl = parseInt(mHeader[1], 10);
      if (parsedLvl >= 1 && parsedLvl <= 75) level = parsedLvl;
    } else {
      const mAny = text.match(/Lv\.?\s*(\d{1,2})/i) || normalizeOcrText(text).match(/Lv\.?(\d{1,2})/i);
      if (mAny) {
        const parsedLvl = parseInt(mAny[1], 10);
        if (parsedLvl >= 1 && parsedLvl <= 75) level = parsedLvl;
      }
    }

    // 2. 寶可夢名稱智能交叉比對 (主技能唯一性 + 名稱子字串 / 混淆字修正 + 進化階段權重)
    let bestPkm = null;
    let maxScore = -1;

    for (const p of allPokemons) {
      let score = 0;
      const cleanName = normalizeOcrText(p.name_cn || '');
      const cleanMainSkill = normalizeOcrText(p.main_skill || '');

      // 名稱完整符合
      if (clean.includes(cleanName)) {
        score += 200 + cleanName.length * 20;
      } else {
        // 名稱子字串比對 (>= 2 字)
        for (let len = cleanName.length - 1; len >= 2; len--) {
          for (let i = 0; i <= cleanName.length - len; i++) {
            const sub = cleanName.substr(i, len);
            if (clean.includes(sub)) {
              score += len * 35;
              break;
            }
          }
        }
        let common = 0;
        for (const char of cleanName) {
          if (clean.includes(char)) common++;
        }
        if (common >= 1) score += common * 15;
      }

      // 主技能交叉驗證 (排除同名或誤判，如赫拉克羅斯專屬之「健美（料理輔助S）」)
      if (cleanMainSkill) {
        const skillBase = cleanMainSkill.split('(')[0];
        const skillSub = cleanMainSkill.includes('(') ? cleanMainSkill.split('(')[1].replace(')', '') : '';
        if (clean.includes(cleanMainSkill)) {
          score += 120;
        } else if (skillBase && skillBase.length >= 2 && clean.includes(skillBase)) {
          score += 70;
        }
        if (skillSub && clean.includes(skillSub)) {
          score += 50;
        }
      }

      // 專長專門比對 (樹果、食材、技能)
      if (p.specialty) {
        if (clean.includes(p.specialty)) score += 25;
      }

      // 進化階段優先權 (當等級 >= 25 且為最終進化，給予適當權重以避免降級為基礎階)
      if (level >= 25 && p.is_final === '〇') {
        score += 15;
      }

      if (score > maxScore) {
        maxScore = score;
        bestPkm = p;
      }
    }

    // 2.5 主技能等級萃取 (通用文字掃描引擎，支援全螢幕文字或 Composite 切片文字)
    let skillLevel = null;
    let foundSkillLevel = false;
    const maxAllowedSkillLvl = bestPkm && bestPkm.main_skill ? getMainSkillMaxLevel(bestPkm.main_skill) : 8;

    // 通用等級正則表達式與副技能/食材里程碑排除規則
    const msLevelRegex = /(?:Lv\.?|LV|tv\.?|1v\.?|lv\.?|iv\.?|v\.?|y\.?|等級|等|Level)\s*([1-8])\b/i;
    const milestoneLvRegex = /Lv\.?\s*(?:10|25|30|50|60|70|75|80|100)\b/i;

    // A. 優先檢查 [MAINSKILL_LV] 專屬等級標籤 (若有)
    const msLvSectionMatch = text.match(/\[MAINSKILL_LV\]([\s\S]*?)(?=\n\s*\[[A-Z0-9_:]+\]|$)/i) || text.match(/\[MAINSKILL_LV\]([\s\S]*?)(?:\[|$)/i);
    if (msLvSectionMatch) {
      const msLvText = msLvSectionMatch[1];
      const mLvl = msLvText.match(msLevelRegex) || msLvText.match(/(?:^|\D)([1-8])(?:\D|$)/);
      if (mLvl) {
        const parsedLvl = parseInt(mLvl[1], 10);
        if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
          skillLevel = parsedLvl;
          foundSkillLevel = true;
        }
      }
    }

    // B. 檢查 [MAINSKILL] 切片標籤區塊 (支援水平切片文字)
    if (!foundSkillLevel) {
      const msSectionMatch = text.match(/\[MAINSKILL\]([\s\S]*?)(?=\n\s*\[[A-Z0-9_:]+\]|$)/i) || text.match(/\[MAINSKILL\]([\s\S]*?)(?:\[|$)/i);
      if (msSectionMatch) {
        const msText = msSectionMatch[1];
        const msLines = msText.split('\n').map(l => l.trim()).filter(Boolean);
        for (let idx = 0; idx < msLines.length; idx++) {
          const line = msLines[idx];
          const normLine = normalizeOcrText(line);
          // 排除說明中的數量 (如 8個、5點、200能量)
          if (line.match(/\d+\s*(?:個|點|能量|點數)/) && !msLevelRegex.test(line)) continue;

          const mLvl = line.match(msLevelRegex) || normLine.match(/Lv\.?([1-8])$/i) || line.match(/(?:[SML\)\]]|\b)\s*([1-8])$/);
          if (mLvl) {
            const parsedLvl = parseInt(mLvl[1], 10);
            if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
              skillLevel = parsedLvl;
              foundSkillLevel = true;
              break;
            }
          }
        }
        // 切片區塊內換行兜底 (純數字 1-8 單獨一行)
        if (!foundSkillLevel) {
          for (const line of msLines) {
            const mNum = line.match(/^\s*([1-8])\s*$/);
            if (mNum) {
              const parsedLvl = parseInt(mNum[1], 10);
              if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
                skillLevel = parsedLvl;
                foundSkillLevel = true;
                break;
              }
            }
          }
        }
      }
    }

    // C. 通用全文本語意掃描引擎 (支援整張截圖 OCR 文字，無像素座標硬編碼)
    if (!foundSkillLevel) {
      const allOcrLines = text.split('\n');
      const mainSkillKeywords = ['料理', '食材', '能量', '活力', '幫手', '金幣', '碎片', '揮指', '健美', '填充', '怪力', '療癒', '磁鐵', '下一次', '卡比獸', '增加', '獲得', 'skill', 'Skill'];
      if (bestPkm && bestPkm.main_skill) {
        const ms = bestPkm.main_skill;
        mainSkillKeywords.push(ms);
        mainSkillKeywords.push(ms.replace(/[SML]$/i, ''));
        if (ms.includes('(')) mainSkillKeywords.push(ms.split('(')[0]);
        if (ms.includes('（')) mainSkillKeywords.push(ms.split('（')[0]);
      }

      // 階段 1：掃描包含主技能語意關鍵字之行，及其上下相鄰行 (處理 OCR 斷行或位移)
      for (let i = 0; i < allOcrLines.length; i++) {
        const line = allOcrLines[i];
        const normLine = normalizeOcrText(line);
        if (normLine.includes('SP') || (bestPkm && normLine.includes(bestPkm.name_cn))) continue;
        if (normLine.includes('持有上限') || normLine.includes('幫忙間隔') || normLine.includes('性格')) continue;
        if (milestoneLvRegex.test(normLine)) continue;

        const hasKeyword = mainSkillKeywords.some(kw => kw && (line.includes(kw) || normLine.includes(kw)));
        if (hasKeyword) {
          // 先查同本行 (排除技能說明內數量干擾)
          if (!line.match(/\d+\s*(?:個|點|能量|點數)/) || msLevelRegex.test(line)) {
            let mLvl = line.match(msLevelRegex) || normLine.match(/Lv\.?([1-8])$/i) || line.match(/(?:[SML\)\]]|\b)\s*([1-8])$/);
            if (mLvl) {
              const parsedLvl = parseInt(mLvl[1], 10);
              if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
                skillLevel = parsedLvl;
                foundSkillLevel = true;
                break;
              }
            }
          }

          // 同行若無等級，檢查前後相鄰窗口 [i-2 .. i+2] 行 (OCR 常常把技能名放一行、Lv. X 放下一行或隔行)
          for (const offset of [1, -1, 2, -2]) {
            const idx = i + offset;
            if (idx >= 0 && idx < allOcrLines.length) {
              const adjLine = allOcrLines[idx];
              const adjNorm = normalizeOcrText(adjLine);
              if (adjNorm.includes('SP') || milestoneLvRegex.test(adjNorm)) continue;
              if (bestPkm && adjNorm.includes(bestPkm.name_cn)) continue;
              if (adjNorm.includes('持有上限') || adjNorm.includes('幫忙間隔') || adjNorm.includes('性格')) continue;
              if (adjLine.match(/\d+\s*(?:個|點|能量|點數)/) && !msLevelRegex.test(adjLine)) continue;

              const mAdj = adjLine.match(msLevelRegex) || adjNorm.match(/Lv\.?([1-8])$/i) || adjLine.match(/^\s*([1-8])\s*$/);
              if (mAdj) {
                const parsedLvl = parseInt(mAdj[1], 10);
                if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
                  skillLevel = parsedLvl;
                  foundSkillLevel = true;
                  break;
                }
              }
            }
          }
          if (foundSkillLevel) break;
        }
      }

      // 階段 2：全文過濾兜底 (避開寶可夢自身等級、SP、持有上限、副技能/食材里程碑等級與說明數量)
      if (!foundSkillLevel) {
        for (const line of allOcrLines) {
          const normLine = normalizeOcrText(line);
          if (normLine.includes('SP') || (bestPkm && normLine.includes(bestPkm.name_cn))) continue;
          if (normLine.includes('持有上限') || normLine.includes('幫忙間隔') || normLine.includes('性格')) continue;
          if (milestoneLvRegex.test(normLine)) continue;
          if (level && line.includes(String(level))) continue;
          if (line.match(/\d+\s*(?:個|點|能量|點數)/) && !msLevelRegex.test(line)) continue;

          const mLvl = line.match(msLevelRegex) || normLine.match(/Lv\.?([1-8])$/i);
          if (mLvl) {
            const parsedLvl = parseInt(mLvl[1], 10);
            if (parsedLvl >= 1 && parsedLvl <= maxAllowedSkillLvl) {
              skillLevel = parsedLvl;
              foundSkillLevel = true;
              break;
            }
          }
        }
      }
    }

    // 2.6 持有上限萃取 (從 CARRY_NUM 區域取得，例如「21個」)
    let ocrCarry = null;
    const mCarry = text.match(/持有上限\s*(\d{1,2})\s*個?/) || 
                   text.match(/(\d{1,2})\s*個/) || 
                   normalizeOcrText(text).match(/持有上限(\d{1,2})/) ||
                   normalizeOcrText(text).match(/(\d{1,2})個/);
    if (mCarry) {
      const parsedCarry = parseInt(mCarry[1], 10);
      if (parsedCarry >= 5 && parsedCarry <= 120) {
        ocrCarry = parsedCarry;
      }
    }

    // 3. 性格辨識 (名稱膠囊 + 屬性增減雙向演繹對照 + 薄荷中和偵測)
    const isMintOrNeutral = clean.includes('沒有性格') || clean.includes('没有性格') || clean.includes('特色') || clean.includes('带载') || clean.includes('帶來');
    let nature = '坦率';
    let nameMatched = false;
    let cleanseMint = false;

    const neutralNatures = ['害羞', '認真', '勤奮', '浮躁', '坦率'];

    // 優先在「性格」前後特定行或區域中尋找性格名稱，或在全文中尋找完整的2字性格名稱
    const natureLine = (typeof allOcrLines !== 'undefined' && Array.isArray(allOcrLines)) ? (allOcrLines.find(l => l.includes('性格')) || '') : '';
    const natureSearchTarget = natureLine ? normalizeOcrText(natureLine) : clean;

    let matchedNatureObj = null;
    for (const n of NATURE_DATA) {
      if (natureSearchTarget.includes(n.name)) {
        matchedNatureObj = n;
        break;
      }
    }
    // 若在性格行未精確找到，再搜尋全文 (避開單字誤判)
    if (!matchedNatureObj) {
      for (const n of NATURE_DATA) {
        if (clean.includes(n.name)) {
          matchedNatureObj = n;
          break;
        }
      }
    }

    if (matchedNatureObj) {
      nature = matchedNatureObj.name;
      nameMatched = true;
      if (isMintOrNeutral) {
        if (neutralNatures.includes(matchedNatureObj.name)) {
          cleanseMint = false;
        } else {
          // 非中性性格（如「慎重」、「爽朗」）且文字顯示「沒有性格帶來的特色」：使用淨白薄荷消除個性效果，保留原性格名稱
          cleanseMint = true;
        }
      }
    } else if (isMintOrNeutral) {
      // 找不到明確性格名稱但有「沒有性格帶來的特色」：預設中性「坦率」
      nature = '坦率';
      cleanseMint = false;
      nameMatched = true;
    } else if (!nameMatched) {
      function getStatType(str) {
        if (str.includes('提升') || str.match(/[SML]$/i)) return null;
        if (str.includes('食材發現率') || str.includes('食材發現') || str.includes('僵材') || str.includes('僵堵')) return 'ingredient';
        if (str.includes('主技能發動機率') || str.includes('主技能發動') || str.includes('主技能')) return 'skill';
        if (str.includes('活力回復量') || str.includes('活力回復') || str.includes('活力') || str.includes('洗衣')) return 'energy';
        if (str.includes('EXP獲得量') || str.includes('EXP獲得') || str.includes('EXP') || str.includes('交得')) return 'exp';
        if (str.includes('幫忙速度') || str.includes('忙速度') || str.includes('幫速') || str.includes('圭尺')) return 'speed';
        return null;
      }

      const allLines = text.split('\n').map(normalizeOcrText).filter(Boolean);
      const natureLines = allLines.slice(-6); // 取底部性格卡相關行
      let buffStat = null;
      let debuffStat = null;

      for (const line of natureLines) {
        const st = getStatType(line);
        if (!st) continue;
        if (!buffStat) {
          buffStat = st;
        } else if (!debuffStat && st !== buffStat) {
          debuffStat = st;
        }
      }

      if (buffStat && debuffStat) {
        const match = NATURE_DATA.find(n => n.buffType === buffStat && n.debuffType === debuffStat);
        if (match) nature = match.name;
      }
    }

    // 4. 副技能 5 個插槽精準提取 (支援區塊分段與階層式色彩比對)
    const subskills = [];
    const used = new Set();

    const slotHeaderRegex = /(?:===|\[)SLOT([1-5])(?::([a-z]+))?(?:===|\])/i;
    if (slotHeaderRegex.test(text)) {
      const sections = text.split(/(?=(?:===|\[)SLOT[1-5])/i);
      for (const sec of sections) {
        const m = sec.match(slotHeaderRegex);
        if (m) {
          const slotIdx = parseInt(m[1], 10) - 1;
          const tier = m[2] ? m[2].toLowerCase() : (meta && meta.slotTiers ? meta.slotTiers[slotIdx] : null);
          const secText = sec.replace(slotHeaderRegex, '').trim();
          const matched = matchSubskillTextWithTier(normalizeOcrText(secText), tier);
          if (matched && !used.has(matched)) {
            subskills[slotIdx] = matched;
            used.add(matched);
          }
        }
      }
    }

    if (subskills.filter(Boolean).length < 5) {
      function matchLineToSubskill(line) {
        if (!line) return null;
        if (line.includes('回復量') || line.includes('發現率') || line.includes('獲得量') || line.includes('發動機率')) return null;
        if (line.includes('隨機') || line.includes('效果') || line.includes('移動') || line.includes('每29分') || line.includes('不僅如此')) return null;
        if (line.includes('能量') || line.includes('回復活力') || line.includes('點數') || line.includes('增加') || line.includes('成功')) return null;
        if (/^Lv\.?\s*\d+$/i.test(line) || /^LV\s*\d+$/i.test(line)) return null;

        const c = normalizeOcrText(line)
          .replace(/[5$]/g, 'S')
          .replace(/知$/g, 'M')
          .replace(/W$/g, 'M')
          .replace(/!/g, '');

        let best = null;
        let maxS = -1;

        for (const sk of SUBSKILLS_DATA) {
          let s = 0;
          const cleanSk = normalizeOcrText(sk.name);
          if (c.includes(cleanSk)) {
            s = 100;
          } else {
            const lastChar = cleanSk.slice(-1);
            const baseSk = cleanSk.slice(0, -1);
            if (c.includes(baseSk)) {
              s = 65;
              if (c.includes(lastChar)) s += 30;
            } else {
              let overlap = 0;
              for (const char of cleanSk) {
                if (c.includes(char)) overlap++;
              }
              if (overlap >= 3) {
                s = overlap * 15;
                if (c.includes(lastChar)) s += 15;
              }
            }
          }
          if (s > maxS) {
            maxS = s;
            best = sk.name;
          }
        }
        return maxS >= 50 ? best : null;
      }

      const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
      const existing = new Set(subskills.filter(Boolean));
      const extractedList = [];

      for (const line of rawLines) {
        if (line.includes('健美') || line.includes('料理輔助')) continue;
        if ((line.includes('持有上限') && !line.includes('提升')) || line.includes('料理漂亮') || line.includes('持續到')) continue;
        if (line.includes('SP') || (line.includes('個') && !line.includes('提升'))) continue;

        const matched = matchLineToSubskill(line);
        if (matched && !existing.has(matched)) {
          extractedList.push(matched);
          existing.add(matched);
        }
      }

      let extractIdx = 0;
      for (let i = 0; i < 5; i++) {
        if (!subskills[i] && extractIdx < extractedList.length) {
          subskills[i] = extractedList[extractIdx++];
        }
      }
    }

    const finalSubskills = subskills.filter(Boolean);

    // 依據持有上限反推睡飽飽獎章
    const deducedRibbon = deduceRibbonFromCarry(bestPkm, level, finalSubskills, ocrCarry);

    // 5. 解鎖食材組合 (結合合法食材庫與色彩採樣距離)
    let ing1 = '';
    let ing2 = '';
    let ing3 = '';

    if (bestPkm && bestPkm.ingredients && bestPkm.ingredients.length > 0) {
      const ings = bestPkm.ingredients;
      const ingA = ings[0].name;
      const ingB = ings[1] ? ings[1].name : ingA;
      const ingC = ings[2] ? ings[2].name : ingB;

      ing1 = ingA; // Lv.1 固定第一種食材

      if (rgbSlots && rgbSlots.length >= 3 && rgbSlots[0] && rgbSlots[1] && rgbSlots[2]) {
        const c1 = rgbSlots[0];
        const c2 = rgbSlots[1];
        const c3 = rgbSlots[2];

        // Lv.30: 判斷 Slot 2 與 Slot 1 色彩距離
        const dist12 = Math.sqrt(
          Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2)
        );
        if (dist12 > 25 && ingB !== ingA) {
          ing2 = ingB;
        } else {
          ing2 = ingA;
        }

        // Lv.60: 判斷 Slot 3
        const dist13 = Math.sqrt(
          Math.pow(c1.r - c3.r, 2) + Math.pow(c1.g - c3.g, 2) + Math.pow(c1.b - c3.b, 2)
        );
        if (dist13 < 30) {
          ing3 = ingA;
        } else {
          const dist23 = Math.sqrt(
            Math.pow(c2.r - c3.r, 2) + Math.pow(c2.g - c3.g, 2) + Math.pow(c2.b - c3.b, 2)
          );
          if (dist23 < 30 && ing2 === ingB) {
            ing3 = ingB;
          } else if (ings.length > 2) {
            ing3 = ingC;
          } else {
            ing3 = ingB;
          }
        }
      } else {
        ing2 = ingB;
        ing3 = ingA;
      }
    }

    return {
      name: bestPkm ? bestPkm.name_cn : (allPokemons[0] ? allPokemons[0].name_cn : ''),
      pokemonId: bestPkm ? bestPkm.id : (allPokemons[0] ? allPokemons[0].id : ''),
      type: bestPkm ? bestPkm.type : (allPokemons[0] ? allPokemons[0].type : ''),
      specialty: bestPkm ? bestPkm.specialty : (allPokemons[0] ? allPokemons[0].specialty : ''),
      level,
      skillLevel: foundSkillLevel ? skillLevel : getEffectiveSkillLevel({ level, subskills: finalSubskills }, bestPkm),
      ribbon: deducedRibbon,
      nature,
      cleanseMint: !!cleanseMint,
      subskills: finalSubskills,
      ing1,
      ing2,
      ing3
    };
  }

  const TESSERACT_CDN_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

  async function ensureTesseractLoaded() {
    if (typeof window !== 'undefined' && window.Tesseract) {
      return true;
    }
    if (typeof window !== 'undefined' && window.DOMUtils && typeof window.DOMUtils.loadScriptOnce === 'function') {
      await window.DOMUtils.loadScriptOnce(TESSERACT_CDN_URL);
    }
    return !!(typeof window !== 'undefined' && window.Tesseract);
  }

  async function parsePokemonScreenshot(imageSrc) {
    let worker = null;
    try {
      await ensureTesseractLoaded();
      if (window.Tesseract) {
        worker = await window.Tesseract.createWorker('chi_tra+eng');
      }
      const res = await parsePokemonScreenshotWithWorker(imageSrc, worker);
      if (worker) await worker.terminate();
      return res;
    } catch (e) {
      if (worker) try { await worker.terminate(); } catch (err) {}
      throw e;
    }
  }

  async function parsePokemonScreenshotWithWorker(imageSrc, worker) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        let result = {
          name: '',
          level: 30,
          skillLevel: 1,
          ribbon: 0,
          nature: '固執',
          ing1: '',
          ing2: '',
          ing3: '',
          subskills: []
        };

        try {
          if (typeof window !== 'undefined' && window.OcrAiEngine && typeof window.OcrAiEngine.recognize === 'function' && window.OcrAiEngine.isLoaded && window.OcrAiEngine.isLoaded()) {
            try {
              const aiRet = await window.OcrAiEngine.recognize(img);
              if (aiRet && aiRet.text) {
                result = parsePokemonFromOcr(aiRet.text, [], allPokemonsRef, null);
              }
            } catch (aiErr) {
              console.warn('[AI OCR Error, falling back to standard OCR]:', aiErr);
            }
          }

          if (!result.name && worker) {
            let compositeCanvas = null;
            let rgbSlots = [];
            let meta = null;
            if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
              try {
                const prep = buildOcrCompositeCanvas(img);
                compositeCanvas = prep.compositeCanvas;
                rgbSlots = prep.rgbSlots;
                meta = prep.meta;
              } catch (prepErr) {
                console.warn('[OCR Preprocess Warning]:', prepErr);
              }
            }

            const targetSource = compositeCanvas || img;
            const ret = await worker.recognize(targetSource);
            const text = ret.data.text || '';

            result = parsePokemonFromOcr(text, rgbSlots, allPokemonsRef, meta);
          }
        } catch (ocrErr) {
          console.warn('[OCR Engine Warning]:', ocrErr);
        }

        // 預設填補
        if (!result.name && allPokemonsRef.length > 0) {
          result.name = allPokemonsRef[0].name_cn;
          result.pokemonId = allPokemonsRef[0].id;
          result.type = allPokemonsRef[0].type;
          result.specialty = allPokemonsRef[0].specialty;
        }

        resolve(result);
      };
      img.onerror = () => {
        resolve({
          name: allPokemonsRef[0] ? allPokemonsRef[0].name_cn : '',
          level: 30,
          skillLevel: 1,
          ribbon: 0,
          nature: '固執',
          subskills: [],
          ing1: '',
          ing2: '',
          ing3: ''
        });
      };
      img.src = imageSrc;
    });
  }

  /* ─── 浮動 Toast 系統 ─────────────────────────────────────── */