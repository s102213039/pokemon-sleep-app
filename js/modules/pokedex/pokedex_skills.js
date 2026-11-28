/* --- 樹果基礎能量對照表與單顆能量成長公式 --- */
const BERRY_BASE_ENERGY_MAP = {
  // 飛行: 椰木果 / Pamtre (24)
  '椰木果': 24, 'Pamtre': 24, 'pamtre': 24,
  // 蟲: 木子果 / 芭亞果 / Lum (24)
  '木子果': 24, '芭亞果': 24, 'Lum': 24, 'lum': 24,
  // 電: 異奇果 / Grepa (25)
  '異奇果': 25, 'Grepa': 25, 'grepa': 25,
  // 幽靈: 檬果 / Bluk (26)
  '檬果': 26, 'Bluk': 26, 'bluk': 26,
  // 妖精: 桃桃果 / Pecha (26)
  '桃桃果': 26, 'Pecha': 26, 'pecha': 26,
  // 超能力: 芒念果 / Mago (26)
  '芒念果': 26, 'Mago': 26, 'mago': 26,
  // 火: 蘋野果 / Leppa (27)
  '蘋野果': 27, 'Leppa': 27, 'leppa': 27,
  // 格鬥: 櫻子果 / Cheri (27)
  '櫻子果': 27, 'Cheri': 27, 'cheri': 27,
  // 一般: 柿仔果 / Persim (28)
  '柿仔果': 28, 'Persim': 28, 'persim': 28,
  // 地面: 勿花果 / Figy (29)
  '勿花果': 29, 'Figy': 29, 'figy': 29,
  // 岩石: 文柚果 / Sitrus (30)
  '文柚果': 30, 'Sitrus': 30, 'sitrus': 30,
  // 草: 榴石果 / 墨莓果 / Durin (30)
  '榴石果': 30, '墨莓果': 30, 'Durin': 30, 'durin': 30,
  // 水: 橙橙果 / Oran (31)
  '橙橙果': 31, 'Oran': 31, 'oran': 31,
  // 惡: 芭拉果 / 威嘻果 / Wiki (31)
  '芭拉果': 31, '威嘻果': 31, 'Wiki': 31, 'wiki': 31,
  // 毒: 零餘果 / Chesto (32)
  '零餘果': 32, 'Chesto': 32, 'chesto': 32,
  // 冰: 生薑果 / 羅子果 / Rawst (32)
  '生薑果': 32, '羅子果': 32, 'Rawst': 32, 'rawst': 32,
  // 鋼: 靛莓果 / 刺角果 / Belue (33)
  '靛莓果': 33, '刺角果': 33, 'Belue': 33, 'belue': 33,
  // 龍: 巧可果 / 亞雪果 / Yache (35)
  '巧可果': 35, '亞雪果': 35, 'Yache': 35, 'yache': 35
};

function getBerryBaseEnergy(nameOrType) {
  if (!nameOrType) return 26;
  const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
             (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
  if (gc && typeof gc.getBerryBaseEnergy === 'function') {
    const e = gc.getBerryBaseEnergy(nameOrType);
    if (typeof e === 'number' && Number.isFinite(e)) return e;
  }
  if (BERRY_BASE_ENERGY_MAP[nameOrType]) return BERRY_BASE_ENERGY_MAP[nameOrType];
  const bName = TYPE_TO_BERRY[nameOrType];
  if (bName && BERRY_BASE_ENERGY_MAP[bName]) return BERRY_BASE_ENERGY_MAP[bName];
  return 26;
}

function calculateSingleBerryEnergy(baseEnergy, level) {
  const lv = Math.max(1, parseInt(level, 10) || 1);
  const base = Math.max(20, parseInt(baseEnergy, 10) || 26);
  return Math.round(Math.max(base + (lv - 1), base * Math.pow(1.025, lv - 1)));
}

if (typeof window !== 'undefined') {
  window.getBerryBaseEnergy = getBerryBaseEnergy;
  window.calculateSingleBerryEnergy = calculateSingleBerryEnergy;
}

/* ─── 基礎主技能與複合/專屬技能映射系統 ─────────── */
const BASE_SKILLS = [
  { key: '食材獲取S', label: '食材獲取S', label_en: 'Ingr. Mag. S' },
  { key: '食材精選S', label: '食材精選S', label_en: 'Ingr. Select S' },
  { key: '活力全體療癒S', label: '全體療癒S', label_en: 'Energy All S' },
  { key: '活力療癒S', label: '活力療癒S', label_en: 'Energy Cheer S' },
  { key: '活力填充S', label: '活力填充S', label_en: 'Charge Ene. S' },
  { key: '能量填充M', label: '能量填充M', label_en: 'Charge Str. M' },
  { key: '能量填充S', label: '能量填充S', label_en: 'Charge Str. S' },
  { key: '料理強化S', label: '料理強化S', label_en: 'Cook Power S' },
  { key: '料理成功S', label: '料理成功S', label_en: 'Tasty Chance S' },
  { key: '幫手支援S', label: '幫手支援S', label_en: 'Extra Help S' },
  { key: '幫手加速', label: '幫手加速', label_en: 'Helper Boost' },
  { key: '樹果遽增', label: '樹果遽增', label_en: 'Berry Burst' },
  { key: '夢之碎片獲取S', label: '夢碎獲取S', label_en: 'Dream Shard S' },
  { key: '揮指', label: '揮指', label_en: 'Metronome' },
  { key: '技能複製', label: '技能複製', label_en: 'Skill Copy' }
];

const SPECIAL_SKILL_PREFIXES_ZH = [
  '魔法火焰', '健美', '怪力鉗', '怪力钳', '超幸運', '新月祈禱', '月光', '樹果汁',
  '正電', '負電', '禮物', '治癒波動', '蹭蹭臉頰', '蓄力', '夢魘',
  '精神擊破', '流星群', '畫皮', '波導彈', '十項全能', '模仿', '變身'
];

const SPECIAL_SKILL_PREFIXES_EN = [
  'Mystical Fire', 'Bulk Up', 'Hyper Cutter', 'Super Luck', 'Lunar Prayer', 'Moonlight', 'Berry Juice',
  'Plus', 'Minus', 'Present', 'Heal Pulse', 'Nuzzle', 'Stockpile', 'Bad Dreams',
  'Psystrike', 'Draco Meteor', 'Disguise', 'Aura Sphere', 'All-Rounder', 'Mimic', 'Transform'
];

function stripSpecialSkillParens(skillStr) {
  if (!skillStr) return '';
  const s = String(skillStr).trim().replace('怪力钳', '怪力鉗');
  for (let i = 0; i < SPECIAL_SKILL_PREFIXES_ZH.length; i++) {
    const pre = SPECIAL_SKILL_PREFIXES_ZH[i];
    if (s === pre || s.startsWith(pre + '（') || s.startsWith(pre + ' (') || s.startsWith(pre + '(') || s.startsWith(pre + '[')) {
      return pre === '怪力钳' ? '怪力鉗' : pre;
    }
  }
  for (let i = 0; i < SPECIAL_SKILL_PREFIXES_EN.length; i++) {
    const pre = SPECIAL_SKILL_PREFIXES_EN[i];
    if (s.toLowerCase() === pre.toLowerCase() || s.toLowerCase().startsWith(pre.toLowerCase() + ' (') || s.toLowerCase().startsWith(pre.toLowerCase() + '(') || s.toLowerCase().startsWith(pre.toLowerCase() + ' [')) {
      return pre;
    }
  }
  return s;
}

if (typeof window !== 'undefined') {
  window.stripSpecialSkillParens = stripSpecialSkillParens;
}

const COMPOSITE_SKILL_MAP = {
  // === 真正複合主技能 (True Composite Skills) ===
  // 健美：料理成功S (大成功機率提升) + 食材獲取S (隨機獲得食材) (赫拉克羅斯)
  '健美': ['料理成功S', '食材獲取S'],
  '健美（料理輔助S）': ['料理成功S', '食材獲取S'],
  '健美 (料理輔助S)': ['料理成功S', '食材獲取S'],
  
  // 魔法火焰：料理強化S (擴大鍋容量) + 料理成功S (大成功機率提升) (夢妖魔)
  '魔法火焰': ['料理強化S', '料理成功S'],
  '魔法火焰（料理躍進S）': ['料理強化S', '料理成功S'],
  '魔法火焰 (料理躍進S)': ['料理強化S', '料理成功S'],
  
  // 月光：活力填充S (自身活力) + 大成功時活力療癒S (隊友活力) (月亮伊布)
  '月光': ['活力填充S', '活力療癒S'],
  '月光（活力填充S）': ['活力填充S', '活力療癒S'],
  '月光（活力充填S）': ['活力填充S', '活力療癒S'],
  
  // 樹果汁：活力全體療癒S (全員活力) + 樹果汁道具活力療癒S (單隻活力) (壺壺)
  '樹果汁': ['活力全體療癒S', '活力療癒S'],
  '樹果汁（活力全體療癒S）': ['活力全體療癒S', '活力療癒S'],
  
  // === 專屬命名與變體主技能 (Named Variant Skills) ===
  // 食材獲取系列
  '正電': ['食材獲取S'],
  '正電（食材獲取S）': ['食材獲取S'],
  '禮物': ['食材獲取S'],
  '禮物（食材獲取S）': ['食材獲取S'],
  
  // 料理強化系列
  '負電': ['料理強化S'],
  '負電（料理強化S）': ['料理強化S'],
  
  // 食材精選系列
  '超幸運': ['食材精選S'],
  '超幸運（食材精選S）': ['食材精選S'],
  '超幸運 (食材精選S)': ['食材精選S'],
  '怪力鉗': ['食材精選S'],
  '怪力钳': ['食材精選S'],
  '怪力鉗（食材精選S）': ['食材精選S'],
  '怪力鉗 (食材精選S)': ['食材精選S'],
  '怪力钳（食材精選S）': ['食材精選S'],
  '怪力钳 (食材精選S)': ['食材精選S'],
  
  // 活力療癒系列
  '新月祈禱': ['活力全體療癒S'],
  '新月祈禱（活力全體療癒S）': ['活力全體療癒S'],
  '治癒波動': ['活力療癒S'],
  '治癒波動（活力療癒S）': ['活力療癒S'],
  '蹭蹭臉頰': ['活力療癒S'],
  '蹭蹭臉頰（活力療癒S）': ['活力療癒S'],
  
  // 能量填充系列
  '蓄力': ['能量填充S'],
  '蓄力（能量填充S）': ['能量填充S'],
  '能量填充S（隨機）': ['能量填充S'],
  '夢魘': ['能量填充M'],
  '夢魘（能量填充M）': ['能量填充M'],
  
  // 樹果遽增系列
  '精神擊破': ['樹果遽增'],
  '精神擊破（樹果領域）': ['樹果遽增'],
  '流星群': ['樹果遽增'],
  '流星群（樹果遽增）': ['樹果遽增'],
  '畫皮': ['樹果遽增'],
  '畫皮（樹果遽增）': ['樹果遽增'],
  '樹果遽增?': ['樹果遽增'],
  
  // 夢之碎片系列
  '波導彈': ['夢之碎片獲取S'],
  '波導彈（夢之碎片獲取S）': ['夢之碎片獲取S'],
  '夢之碎片獲取S（隨機）': ['夢之碎片獲取S'],
  
  // 幫手加速系列
  '幫手加速（電）': ['幫手加速'],
  '幫手加速（火）': ['幫手加速'],
  '幫手加速（水）': ['幫手加速'],
  
  // 揮指 / 技能複製系列
  '十項全能': ['揮指'],
  '十項全能（揮指）[可替換]': ['揮指'],
  '模仿': ['技能複製'],
  '模仿（技能複製）': ['技能複製'],
  '變身': ['技能複製'],
  '變身（技能複製）': ['技能複製']
};

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function shortenSkillName(name) {
  if (!name) return '';
  return name
    .replace(/\bIngredient\b/g, 'Ingr.')
    .replace(/\bIngredients\b/g, 'Ingr.')
    .replace(/\bStrength\b/g, 'Str.')
    .replace(/\bEveryone\b/g, 'All')
    .replace(/\bElectric\b/g, 'Elec.')
    .replace(/\[Customizable\]/g, '[Custom]');
}

function formatSkillNameHtml(displayName) {
  if (!displayName) return '';
  // 先將特殊主技能的括號去除，再處理基礎技能格式
  let cleaned = stripSpecialSkillParens(displayName)
    .replace(/\s*[\[\(](可替換|Customizable|Custom)[\]\)]/gi, '')
    .replace(/活力全體療癒S/g, '全體療癒S')
    .replace(/活力全体疗愈S/g, '全体疗愈S')
    .replace(/夢之碎片/g, '夢碎')
    .replace(/梦之碎片/g, '梦碎')
    .replace(/\(Energy for Everyone S\)/gi, '(Energy All S)')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();

  if (!/[A-Za-z]{2,}/.test(cleaned)) {
    const out = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.text === 'function')
      ? window.I18N.text(cleaned)
      : cleaned;
    return `<span class="skill-single-line">${escapeHtml(out)}</span>`;
  }

  // 縮短英文主技能名稱（例如 Ingredient -> Ingr., Strength -> Str., Everyone -> All 等）
  const shortName = shortenSkillName(cleaned);

  // 1. 如果有括號或括弧拆為兩行
  const parenMatch = shortName.match(/^(.+?)\s*([(\[].+[)\]])$/);
  if (parenMatch) {
    const mainPart = parenMatch[1].trim();
    const subPart = parenMatch[2].trim();
    return `<span class="skill-line-1">${escapeHtml(mainPart)}</span><span class="skill-line-2">${escapeHtml(subPart)}</span>`;
  }

  // 2. 標準主技能單行完整展示
  return `<span class="skill-single-line">${escapeHtml(shortName)}</span>`;
}

const SUPER_LUCK_INGS = [
  { name: '醒腦咖啡豆', name_en: 'Rousing Coffee', icon: 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png' },
  { name: '萌綠大豆', name_en: 'Greengrass Soybeans', icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png' },
  { name: '豆製肉', name_en: 'Bean Sausage', icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' },
  { name: '品鮮蘑菇', name_en: 'Tasty Mushroom', icon: 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png' }
];

const HYPER_CUTTER_INGS = [
  { name: '窩心洋芋', name_en: 'Soft Potato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' },
  { name: '純粹油', name_en: 'Pure Oil', icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
  { name: '萌綠玉米', name_en: 'Greengrass Corn', icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
  { name: '好眠番茄', name_en: 'Snoozy Tomato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' }
];

function formatCompactTableSkillName(name) {
  if (!name) return '';
  return String(name)
    .replace(/能量填充S\s*[\(（]\s*(?:隨機(?:\/變動值)?|随机(?:\/变动值)?)\s*[\)）]/g, '隨機能量S')
    .replace(/(?:夢之碎片獲取S|夢碎獲取S|梦之碎片获取S|梦碎获取S)\s*[\(（]\s*(?:隨機(?:\/變動值)?|随机(?:\/变动值)?)\s*[\)）]/g, '隨機夢碎S')
    .replace(/Charge\s+(?:Strength|Str\.)\s+S\s*\(Random\)/gi, 'Rand. Charge S')
    .replace(/Dream\s+Shard\s+Magnet\s+S\s*\(Random\)/gi, 'Rand. Shard S');
}

function renderSkillWithTooltip(skillName, pkm, opts) {
  if (!skillName) return '--';
  const compactTable = !!(opts && opts.compactTable);
  const i18n = (typeof window !== 'undefined' && window.I18N) ? window.I18N : null;
  const rawDisplayName = i18n ? i18n.getMainSkillName(skillName) : skillName;
  const baseDisplayName = stripSpecialSkillParens(rawDisplayName);
  const displayName = compactTable ? formatCompactTableSkillName(baseDisplayName) : baseDisplayName;
  const strippedKey = stripSpecialSkillParens(skillName);
  const rawDetail = SPECIAL_SKILL_DETAILS[skillName] ||
                    SPECIAL_SKILL_DETAILS[strippedKey] ||
                    SPECIAL_SKILL_DETAILS[skillName.replace(/\(/g, '（').replace(/\)/g, '）')] ||
                    SPECIAL_SKILL_DETAILS[skillName.replace(/（/g, '(').replace(/）/g, ')')];
  let detail = '';
  if (rawDetail) {
    if (typeof rawDetail === 'object') {
      detail = (i18n && typeof i18n.pick === 'function') ? i18n.pick(rawDetail) : (rawDetail['zh-TW'] || '');
    } else {
      detail = (i18n && typeof i18n.text === 'function') ? i18n.text(rawDetail) : rawDetail;
    }
  }

  let plainTitle = detail;
  // 針對特定寶可夢的「食材精選S」系列（含超幸運、怪力鉗），精簡直接顯示該寶可夢專屬食材池（單行純圖標，無冗長換行）
  if (skillName && (skillName.includes('食材精選') || skillName.includes('超幸運') || skillName.includes('怪力'))) {
    let targetIngs = [];
    const isSuperLuck = skillName.includes('超幸運');
    const isHyperCutter = skillName.includes('怪力');

    if (isSuperLuck) {
      targetIngs = SUPER_LUCK_INGS;
    } else if (isHyperCutter) {
      targetIngs = HYPER_CUTTER_INGS;
    } else if (pkm && pkm.ingredients && pkm.ingredients.length > 0) {
      const seen = new Set();
      pkm.ingredients.forEach(ig => {
        if (ig.name && !seen.has(ig.name)) {
          seen.add(ig.name);
          targetIngs.push(ig);
        }
      });
    }

    if (targetIngs.length > 0) {
      const separator = i18n?.t?.('dex.ui_list_sep_html') ?? '<span class="skill-tooltip-sep">、</span>';
      const ingIconsHtml = targetIngs.map(ig => {
        const ingName = i18n ? (i18n.getIngredientName(ig.name) || ig.name) : ig.name;
        const icon = ig.icon || (i18n && i18n.getIngredientIcon(ig.name)) || '';
        return icon ? `<img src="${icon}" class="skill-tooltip-inline-ing" width="24" height="24" loading="lazy" decoding="async" alt="${ingName}" title="${ingName}">` : '';
      }).filter(Boolean).join(separator);

      const plainSep = i18n?.t?.('dex.ui_list_sep') ?? '、';
      const ingNamesPlain = targetIngs.map(ig => i18n ? (i18n.getIngredientName(ig.name) || ig.name) : ig.name).join(plainSep);

      const prefix = i18n?.t?.('dex.ui_draws_prefix') ?? 'dex.ui_draws_prefix';
      if (isSuperLuck) {
        const critText = i18n?.t?.('dex.ui_super_luck_crit') ?? 'dex.ui_super_luck_crit';
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span></span><div style="font-size:11.5px;color:var(--accent-color,#f59e0b);margin-top:3px;line-height:1.35;font-weight:500;">${critText}</div>`;
        plainTitle = i18n?.t?.('dex.ui_draws_with_crit', { ings: ingNamesPlain, crit: critText }) ?? 'dex.ui_draws_with_crit';
      } else if (isHyperCutter) {
        const critText = i18n?.t?.('dex.ui_hyper_cutter_crit') ?? 'dex.ui_hyper_cutter_crit';
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span></span><div style="font-size:11.5px;color:var(--accent-color,#f59e0b);margin-top:3px;line-height:1.35;font-weight:500;">${critText}</div>`;
        plainTitle = i18n?.t?.('dex.ui_draws_with_crit', { ings: ingNamesPlain, crit: critText }) ?? 'dex.ui_draws_with_crit';
      } else {
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span></span>`;
        plainTitle = i18n?.t?.('dex.ui_draws_plain', { ings: ingNamesPlain }) ?? 'dex.ui_draws_plain';
      }
    }
  }

  const contentHtml = formatSkillNameHtml(displayName);
  const cleanSkillKey = stripSpecialSkillParens(skillName || '')
    .replace(/\s*[\[\(](可替換|Customizable|Custom)[\]\)]/gi, '')
    .replace(/活力全體療癒S/g, '全體療癒S')
    .replace(/活力全体疗愈S/g, '全体疗愈S')
    .replace(/夢之碎片/g, '夢碎')
    .replace(/梦之碎片/g, '梦碎')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();

  // 僅針對特殊/變體/複合主技能展示標籤與詳細說明，純基礎主技能（如能量填充S）保持純文字不展示說明
  if (detail) {
    return `<span class="special-skill-badge" role="button" tabindex="0" data-skill="${escapeHtml(cleanSkillKey)}" data-skill-detail="${escapeHtml(detail)}" title="${escapeHtml(plainTitle || detail)}"><span class="skill-name-text">${contentHtml}</span></span>`;
  }
  if (/[A-Za-z]{2,}/.test(displayName)) {
    return `<span class="main-skill-text">${contentHtml}</span>`;
  }
  let cleaned = stripSpecialSkillParens(displayName)
    .replace(/\s*[\[\(](可替換|Customizable|Custom)[\]\)]/gi, '')
    .replace(/活力全體療癒S/g, '全體療癒S')
    .replace(/活力全体疗愈S/g, '全体疗愈S')
    .replace(/夢之碎片/g, '夢碎')
    .replace(/梦之碎片/g, '梦碎')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();
  const out = (i18n && typeof i18n.text === 'function') ? i18n.text(cleaned) : cleaned;
  return escapeHtml(out);
}

function matchesSkill(pokemonSkill, targetBaseSkill) {
  if (!pokemonSkill || !targetBaseSkill) return false;
  if (pokemonSkill === targetBaseSkill) return true;
  const cleanP = stripSpecialSkillParens(pokemonSkill);
  const cleanT = stripSpecialSkillParens(targetBaseSkill);
  if (cleanP === cleanT) return true;
  const mapped = COMPOSITE_SKILL_MAP[pokemonSkill] || COMPOSITE_SKILL_MAP[cleanP];
  if (mapped && (mapped.includes(targetBaseSkill) || mapped.includes(cleanT))) return true;
  return false;
}
