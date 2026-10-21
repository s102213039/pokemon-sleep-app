  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ─── 圖像預處理與多錨點 OCR 複合畫布建立 ─────────────────── */
  const GOLD_SKILLS = new Set(SUBSKILLS_DATA.filter(s => s.tier === 'gold').map(s => s.name));
  const BLUE_SKILLS = new Set(SUBSKILLS_DATA.filter(s => s.tier === 'blue').map(s => s.name));
  const WHITE_SKILLS = new Set(SUBSKILLS_DATA.filter(s => s.tier === 'white').map(s => s.name));

  const OCR_CONFUSION_MAP = [
    ['士王', '土王'],
    ['大和室英', '大竺葵'],
    ['大和室', '大竺葵'],
    ['和室英', '大竺葵'],
    ['大符英', '大竺葵'],
    ['!焰欽', '烈焰猴'],
    ['焰欽', '烈焰猴'],
    ['其拉克羅斯', '赫拉克羅斯'],
    ['其拉克', '赫拉克羅斯'],
    ['峽龍', '噴火龍'],
    ['峽', '噴'],
    ['!布土撥', '巴布土撥'],
    ['繞花', '妙蛙花'],
    ['箭傾', '水箭龜'],
    ['呆殼鄙', '呆殼獸'],
    ['殼鄙', '殼獸'],
    ['語14', '雷丘'],
    ['2大蝶', '巴大蝶'],
    ['虧龍', '快龍'],
    ['結萌蛇', '蝶結萌虻'],
    ['!炮猴', '投擲猴'],
    ['牙海猴', '帝牙海獅'],
    ['勃梭魯', '阿勃梭魯'],
    ['敗露菇', '敗露球菇'],
    ['哎呀菇', '哎呀球菇'],
    ['夢萝触', '夢夢蝕'],
    ['梦萝触', '夢夢蝕'],
    ['怪龍', '怪顎龍'],
    ['偏琴', '倫琴貓'],
    ['狂浪舞鸭', '狂歡浪舞鴨'],
    ['狂浪舞鴨', '狂歡浪舞鴨'],
    ['温和', '溫和'],
    ['顽皮', '頑皮'],
    ['温顺', '溫順'],
    ['内敛', '內斂'],
    ['认真', '認真'],
    ['冷静', '冷靜'],
    ['大胆', '大膽'],
    ['大瞻', '大膽'],
    ['悠间', '悠閒'],
    ['悠闲', '悠閒'],
    ['淘气', '淘氣'],
    ['乐天', '樂天'],
    ['马虎', '馬虎'],
    ['胆小', '膽小'],
    ['脍小', '膽小'],
    ['固执', '固執']
  ];

  function buildOcrCompositeCanvas(img) {
    const w = img.naturalWidth || img.width || 591;
    const h = img.naturalHeight || img.height || 1280;

    // 1. 採樣食材像素色彩 (Slot 1, Slot 2, Slot 3)
    let rgbSlots = [
      { r: 240, g: 200, b: 140 },
      { r: 180, g: 105, b: 48 },
      { r: 250, g: 220, b: 160 }
    ];
    let meta = {
      slotTiers: ['white', 'white', 'white', 'white', 'white'],
      cardBotY: Math.round(h * 0.5234)
    };

    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
      return { compositeCanvas: null, rgbSlots, meta };
    }

    let sampleCanvas = null;
    let sCtx = null;
    try {
      sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = w;
      sampleCanvas.height = h;
      sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true }) || sampleCanvas.getContext('2d');
      sCtx.drawImage(img, 0, 0, w, h);

      // 動態偵測白色卡片頂部邊界 (cardTop) - 單次批次讀取像素區塊取代逐列 getImageData
      let cardTop = Math.round(h * 0.05);
      try {
        const topScanStartY = Math.round(h * 0.02);
        const topScanEndY = Math.round(h * 0.16);
        const topScanH = Math.max(1, topScanEndY - topScanStartY);
        const topScanX = Math.round(w * 0.3);
        const topScanW = Math.max(1, Math.round(w * 0.4));
        const topBulkData = sCtx.getImageData(topScanX, topScanStartY, topScanW, topScanH).data;
        const topRowStride = topScanW * 4;
        for (let row = 0; row < topScanH; row++) {
          const rowOffset = row * topRowStride;
          const rowEnd = Math.min(rowOffset + topRowStride, topBulkData.length);
          if (rowEnd <= rowOffset) break;
          let whiteCount = 0;
          const total = (rowEnd - rowOffset) >> 2;
          for (let i = rowOffset; i < rowEnd; i += 4) {
            if (topBulkData[i] > 230 && topBulkData[i + 1] > 230 && topBulkData[i + 2] > 220) whiteCount++;
          }
          if (total > 0 && whiteCount / total > 0.70) {
            cardTop = topScanStartY + row;
            break;
          }
        }
      } catch (e) {}
      meta.cardTop = cardTop;

      // 食材色彩取樣 (Slot 1, 2, 3，依據 cardTop 動態計算)
      const ingBaseY = cardTop + Math.round(h * (140 / 1280));
      const ingSlotCoords = [
        { x: Math.round(w * (265 / 591)), y: ingBaseY },
        { x: Math.round(w * (370 / 591)), y: ingBaseY },
        { x: Math.round(w * (475 / 591)), y: ingBaseY }
      ];
      const boxW = Math.max(5, Math.round(w * (60 / 591)));
      const boxH = Math.max(5, Math.round(h * (60 / 1280)));

      rgbSlots = ingSlotCoords.map(coord => {
        try {
          const patch = sCtx.getImageData(Math.max(0, coord.x), Math.max(0, coord.y), boxW, boxH).data;
          let sumR = 0, sumG = 0, sumB = 0, count = 0;
          for (let i = 0; i < patch.length; i += 4) {
            const r = patch[i], g = patch[i + 1], b = patch[i + 2];
            const diff = Math.abs(r - 254) + Math.abs(g - 253) + Math.abs(b - 235);
            if (diff > 35) {
              sumR += r; sumG += g; sumB += b; count++;
            }
          }
          return count > 0 ? { r: sumR / count, g: sumG / count, b: sumB / count } : { r: 200, g: 200, b: 200 };
        } catch (e) {
          return { r: 200, g: 200, b: 200 };
        }
      });

      // 動態黃色邊界偵測 (單次批次讀取像素區塊取代逐列 getImageData)
      const scanStartY = Math.round(h * 0.49);
      const scanEndY = Math.round(h * 0.58);
      const scanH = Math.max(1, scanEndY - scanStartY);
      const scanStartX = Math.round(w * 0.34);
      const scanEndX = Math.round(w * 0.51);
      const scanW = Math.max(1, scanEndX - scanStartX);

      const botBulkData = sCtx.getImageData(scanStartX, scanStartY, scanW, scanH).data;
      const botRowStride = scanW * 4;
      for (let row = 0; row < scanH; row++) {
        const rowOffset = row * botRowStride;
        const rowEnd = Math.min(rowOffset + botRowStride, botBulkData.length);
        if (rowEnd <= rowOffset) break;
        let yellowCount = 0;
        const total = (rowEnd - rowOffset) >> 2;
        for (let i = rowOffset; i < rowEnd; i += 4) {
          const r = botBulkData[i], g = botBulkData[i + 1], b = botBulkData[i + 2];
          if (r > 180 && g > 130 && g < 220 && b < 120 && (r - b > 70)) {
            yellowCount++;
          }
        }
        if (total > 0 && yellowCount / total > 0.50) {
          meta.cardBotY = scanStartY + row;
          break;
        }
      }
    } catch (e) {}

    // 副技能按鈕座標計算
    const cardBotY = meta.cardBotY;
    const r1_y = cardBotY + Math.round(h * (36 / 1280));
    const r2_y = cardBotY + Math.round(h * (131 / 1280));
    const r3_y = cardBotY + Math.round(h * (226 / 1280));
    const btn_h = Math.round(h * (60 / 1280));
    const btn_w = Math.round(w * (240 / 591));
    const col1_x = Math.round(w * (40 / 591));
    const col2_x = Math.round(w * (310 / 591));

    const slotCoords = [
      { x: col1_x, y: r1_y, w: btn_w, h: btn_h },
      { x: col2_x, y: r1_y, w: btn_w, h: btn_h },
      { x: col1_x, y: r2_y, w: btn_w, h: btn_h },
      { x: col2_x, y: r2_y, w: btn_w, h: btn_h },
      { x: col1_x, y: r3_y, w: btn_w, h: btn_h }
    ];

    // 色階分區與按鈕階層辨別 (金色、藍色、白色)
    const slotTiers = [];
    if (sCtx) {
      for (const slot of slotCoords) {
        try {
          const sampleY0 = slot.y + Math.round(slot.h * 0.55);
          const sampleH = Math.round(slot.h * 0.30);
          const sampleX0 = slot.x + Math.round(slot.w * 0.10);
          const sampleW = Math.round(slot.w * 0.80);
          const patch = sCtx.getImageData(sampleX0, sampleY0, sampleW, sampleH).data;

          let sumR = 0, sumG = 0, sumB = 0, bgCount = 0;
          for (let i = 0; i < patch.length; i += 4) {
            const r = patch[i], g = patch[i + 1], b = patch[i + 2];
            const gray = r * 0.299 + g * 0.587 + b * 0.114;
            if (gray > 130) {
              sumR += r; sumG += g; sumB += b; bgCount++;
            }
          }
          if (bgCount > 0) {
            const meanR = sumR / bgCount;
            const meanB = sumB / bgCount;
            if (meanR - meanB > 22) slotTiers.push('gold');
            else if (meanB - meanR > 5) slotTiers.push('blue');
            else slotTiers.push('white');
          } else {
            slotTiers.push('white');
          }
        } catch (e) {
          slotTiers.push('white');
        }
      }
      meta.slotTiers = slotTiers;
    }

    function cropAndEnhance(sx, sy, sw, sh, scale = 2.5, mode = 'binarize', threshold = 135) {
      const c = document.createElement('canvas');
      const dw = Math.max(10, Math.round(sw * scale));
      const dh = Math.max(10, Math.round(sh * scale));
      c.width = dw;
      c.height = dh;
      const ctx = c.getContext('2d', { willReadFrequently: true }) || c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

      try {
        const imgData = ctx.getImageData(0, 0, dw, dh);
        const d = imgData.data;

        if (mode === 'red_channel') {
          for (let i = 0; i < d.length; i += 4) {
            const v = d[i] < 180 ? 0 : 255;
            d[i] = v; d[i + 1] = v; d[i + 2] = v;
          }
        } else if (mode === 'blue_channel') {
          for (let i = 0; i < d.length; i += 4) {
            const v = d[i + 2] < 150 ? 0 : 255;
            d[i] = v; d[i + 1] = v; d[i + 2] = v;
          }
        } else if (mode === 'binarize') {
          for (let i = 0; i < d.length; i += 4) {
            const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
            const v = gray < threshold ? 0 : 255;
            d[i] = v; d[i + 1] = v; d[i + 2] = v;
          }
        } else if (mode === 'contrast') {
          const factor = 2.5;
          for (let i = 0; i < d.length; i += 4) {
            const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
            const cVal = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
            d[i] = cVal; d[i + 1] = cVal; d[i + 2] = cVal;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}

      return c;
    }

    // 副技能裁切：避開左上角鎖頭徽章，非破壞性內縮保留文字完整
    function cropSubskillSlotSafe(slot, tier) {
      let hasLock = false;
      if (sCtx) {
        try {
          const lockW = Math.round(slot.w * 0.30);
          const lockH = Math.round(slot.h * 0.35);
          const lockPatch = sCtx.getImageData(slot.x, slot.y, lockW, lockH).data;
          let minVal = 255;
          for (let i = 0; i < lockPatch.length; i += 4) {
            const g = lockPatch[i] * 0.299 + lockPatch[i + 1] * 0.587 + lockPatch[i + 2] * 0.114;
            if (g < minVal) minVal = g;
          }
          if (minVal < 100) hasLock = true;
        } catch (e) {}
      }

      let sx, sy, sw, sh;
      if (hasLock) {
        sx = slot.x + Math.round(slot.w * 0.12);
        sy = slot.y + Math.round(slot.h * 0.30);
        sw = Math.round(slot.w * 0.80);
        sh = Math.round(slot.h * 0.45);
      } else {
        sx = slot.x + Math.round(slot.w * 0.08);
        sy = slot.y + Math.round(slot.h * 0.15);
        sw = Math.round(slot.w * 0.84);
        sh = Math.round(slot.h * 0.70);
      }

      const mode = tier === 'gold' ? 'blue_channel' : 'red_channel';
      return cropAndEnhance(sx, sy, sw, sh, 2.5, mode);
    }

    // 各個錨點視圖切片 (以 cardTop 及 cardBotY 為核心動態位移，徹底告別死板固定座標)
    const cardTop = meta.cardTop || Math.round(h * 0.05);
    const nameY = cardTop + Math.round(h * (48 / 1280));
    const nameH = Math.round(h * (52 / 1280));

    const binLv = cropAndEnhance(Math.round(w * (90 / 591)), nameY, Math.round(w * (125 / 591)), nameH, 3.0, 'red_channel');
    const binName = cropAndEnhance(Math.round(w * (150 / 591)), nameY, Math.round(w * (300 / 591)), nameH, 2.5, 'contrast');
    const specialty = cropAndEnhance(Math.round(w * (40 / 591)), cardTop + Math.round(h * (125 / 1280)), Math.round(w * (180 / 591)), Math.round(h * (50 / 1280)), 2.0, 'binarize', 135);
    const carryNum = cropAndEnhance(Math.round(w * (200 / 591)), cardTop + Math.round(h * (290 / 1280)), Math.round(w * (320 / 591)), Math.round(h * (55 / 1280)), 2.0, 'binarize', 135);
    // 主技能區域通用水平切片 (寬鬆覆蓋 0.28h ~ 0.58h 主技能卡片橫帶，徹底涵蓋任何機型或位移)
    const msY = meta.cardTop ? Math.max(0, meta.cardTop + Math.round(h * (300 / 1280))) : Math.round(h * 0.28);
    const msH = Math.round(h * 0.28);
    const msX = Math.round(w * 0.04);
    const msW = Math.round(w * 0.92);
    const mainSkill = cropAndEnhance(msX, msY, msW, msH, 2.0, 'contrast');

    const slotCanvases = slotCoords.map((coord, idx) => {
      const tier = meta.slotTiers[idx] || 'white';
      return {
        name: `SLOT${idx + 1}:${tier}`,
        canvas: cropSubskillSlotSafe(coord, tier)
      };
    });

    const natureY = cardBotY + Math.round(h * (300 / 1280));
    const natureH = Math.round(h * (90 / 1280));
    const safeNatureY = Math.min(h - natureH - 4, Math.max(0, natureY));
    const nature = cropAndEnhance(Math.round(w * (40 / 591)), safeNatureY, Math.round(w * (510 / 591)), natureH, 2.0, 'contrast');

    const parts = [
      { name: 'NAME', canvas: binName },
      { name: 'BIN_LV', canvas: binLv },
      { name: 'SPECIALTY', canvas: specialty },
      { name: 'CARRY_NUM', canvas: carryNum },
      { name: 'MAINSKILL', canvas: mainSkill },
      ...slotCanvases,
      { name: 'NATURE', canvas: nature }
    ].filter(p => !!p.canvas);

    const padding = 28;
    const headerHeight = 22;
    const totalH = parts.reduce((acc, p) => acc + p.canvas.height + headerHeight + padding, padding);
    const maxW = Math.max(...parts.map(p => p.canvas.width), 500);

    const compCanvas = document.createElement('canvas');
    compCanvas.width = maxW + 40;
    compCanvas.height = totalH;
    const compCtx = compCanvas.getContext('2d');
    compCtx.fillStyle = '#ffffff';
    compCtx.fillRect(0, 0, compCanvas.width, compCanvas.height);
    compCtx.font = 'bold 16px monospace';
    compCtx.fillStyle = '#000000';

    let curY = padding;
    for (const part of parts) {
      compCtx.fillText(`[${part.name}]`, 20, curY + 16);
      curY += headerHeight;
      compCtx.drawImage(part.canvas, 20, curY);
      curY += part.canvas.height + padding;
      part.canvas.width = 0;
      part.canvas.height = 0;
    }
    if (sampleCanvas) {
      sampleCanvas.width = 0;
      sampleCanvas.height = 0;
    }

    return { compositeCanvas: compCanvas, rgbSlots, meta };
  }

  /* ─── 依據持有上限反推睡飽飽獎章 (Carry to Good-Night Ribbon Deduction) ─── */
  function deduceRibbonFromCarry(pkm, currentLvl, subskillsList, carryVal) {
    if (!pkm || carryVal == null || isNaN(carryVal)) return 0;
    const baseCarry = parseInt(pkm.carry, 10) || 20;

    // 副技能解鎖等級門檻：Lv.10, Lv.25, Lv.50, Lv.70, Lv.80
    const unlockThresholds = [10, 25, 50, 70, 80];
    let subskillCarryBonus = 0;
    const actualLvl = parseInt(currentLvl, 10) || 1;

    for (let i = 0; i < (subskillsList || []).length; i++) {
      const reqLvl = unlockThresholds[i] || 80;
      if (actualLvl >= reqLvl) {
        const skName = subskillsList[i];
        if (skName === '持有上限提升S') subskillCarryBonus += 6;
        else if (skName === '持有上限提升M') subskillCarryBonus += 12;
        else if (skName === '持有上限提升L') subskillCarryBonus += 18;
      }
    }

    const diff = carryVal - baseCarry - subskillCarryBonus;
    if (diff >= 8) return 4;
    if (diff >= 6) return 3;
    if (diff >= 3) return 2;
    if (diff >= 1) return 1;
    return 0;
  }

  /* ─── 多錨點智能 OCR 解析核心 ─────────────────────────────── */
  function normalizeOcrText(txt) {
    if (!txt) return '';
    let str = txt
      .replace(/\s+/g, '')
      .replace(/[（(]/g, '(')
      .replace(/[）)]/g, ')')
      .replace(/提昇/g, '提升')
      .replace(/機傘/g, '機率')
      .replace(/革忙/g, '幫忙')
      .replace(/事忙/g, '幫忙')
      .replace(/紫忙/g, '幫忙')
      .replace(/类动/g, '獎勵')
      .replace(/奖励/g, '獎勵')
      .replace(/树果/g, '樹果')
      .replace(/数量/g, '數量')
      .replace(/等级/g, '等級')
      .replace(/[5$]/g, 'S')
      .replace(/知$/g, 'M')
      .replace(/W$/g, 'M');

    for (const [bad, good] of OCR_CONFUSION_MAP) {
      if (str.includes(bad)) {
        str = str.replaceAll(bad, good);
      }
    }
    return str;
  }

  function matchSubskillTextWithTier(clean, tier) {
    const candidates = tier === 'gold' ? GOLD_SKILLS : (tier === 'blue' ? BLUE_SKILLS : (tier === 'white' ? WHITE_SKILLS : null));
    const pool = candidates ? Array.from(candidates) : SUBSKILLS_DATA.map(s => s.name);

    for (const sk of pool) {
      if (clean.includes(sk)) return sk;
    }

    let bestSk = null;
    let bestScore = -1;
    for (const sk of pool) {
      let score = 0;
      if (clean.includes('樹果') && sk.includes('樹果')) score += 50;
      if (clean.includes('幫手') && sk.includes('幫手')) score += 50;
      if (clean.includes('睡眠') && sk.includes('睡眠')) score += 50;
      if (clean.includes('活力') && sk.includes('活力')) score += 50;
      if ((clean.includes('夢之') || clean.includes('碎片')) && sk.includes('夢之碎片')) score += 60;
      if (clean.includes('研究') && sk.includes('研究')) score += 50;
      if (clean.includes('技能等級') && sk.includes('技能等級')) score += 50;
      if (clean.includes('幫忙速度') && sk.includes('幫忙速度')) score += 50;
      if (clean.includes('食材機率') && sk.includes('食材機率')) score += 50;
      if (clean.includes('技能機率') && sk.includes('技能機率')) score += 50;
      if (clean.includes('持有上限') && sk.includes('持有上限')) score += 50;

      let common = 0;
      for (const c of sk) {
        if (clean.includes(c)) common++;
      }
      score += common * 10;
      if (score > bestScore) {
        bestScore = score;
        bestSk = sk;
      }
    }
    return bestScore >= 20 ? bestSk : pool[0];
  }

  function parsePokemonFromOcr(text, rgbSlots, allPokemons, meta) {
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