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
