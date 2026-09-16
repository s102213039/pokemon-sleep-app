const GH_OWNER    = 's102213039';
const GH_REPO     = 'pokemon-sleep-app';
const GH_WORKFLOW = 'sync.yml';
const GH_API_BASE = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`;
const GH_PAT_KEY  = 'pksleep_gh_pat';

const DEFAULT_SVG_ICON = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%2338bdf8"/></svg>';

const SPECIAL_ICON_MAP = {
  '9001': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png',
  '9002': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png',
  '9003': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png',
  '9004': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png',
  '9005': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png',
  '9006': 'https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png',
  '7006': 'https://www.serebii.net/pokemonsleep/pokemon/icon/037-alolanvulpix.png',
  '7007': 'https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png',
  '7054': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '8001': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png',
  '皮卡丘（萬聖節）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png',
  '皮卡丘（佳節）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png',
  '皮卡丘（船長）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png',
  '六尾（阿羅拉的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/037-alolanvulpix.png',
  '六尾（阿羅拉）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/037-alolanvulpix.png',
  '九尾（阿羅拉的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png',
  '九尾（阿羅拉）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png',
  '伊布（佳節）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png',
  '伊布（萬聖節）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png',
  '烏波（阿羅拉的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '烏波（帕底亞的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '烏波（帕底亞）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '海豹球（佳節）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png',
  '顫弦蠑螈（低調的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png',
  '顫弦蠑螈（低調）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png'
};

function getIconUrl(p) {
  if (!p) return DEFAULT_SVG_ICON;
  const idStr = String(p.id || p.formatted_no || '');
  if (SPECIAL_ICON_MAP[idStr]) return SPECIAL_ICON_MAP[idStr];
  if (p.name_cn && SPECIAL_ICON_MAP[p.name_cn]) return SPECIAL_ICON_MAP[p.name_cn];
  if (p.icon && typeof p.icon === 'string' && p.icon.trim() !== '') return p.icon;
  if (p.icon_url && typeof p.icon_url === 'string' && p.icon_url.trim() !== '') return p.icon_url;
  if (p.formatted_no) return `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png`;
  return DEFAULT_SVG_ICON;
}

function getItemHelpInterval(p) {
  if (!p) return 0;
  if (typeof p.helpInterval === 'number') return p.helpInterval;
  if (typeof p.interval === 'number') return p.interval;
  const val = p.interval || p.helpInterval;
  if (typeof val === 'string') {
    const parts = val.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatHelpInterval(val) {
  if (!val || val === '--') return '--';
  if (typeof val === 'number') {
    const totalMin = Math.floor(val / 60);
    const sec = Math.floor(val % 60);
    return `${String(totalMin).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === '--') return '--';
    const parts = trimmed.split(':').map(Number);
    if (parts.length === 3) {
      const totalMin = (isNaN(parts[0]) ? 0 : parts[0]) * 60 + (isNaN(parts[1]) ? 0 : parts[1]);
      const sec = isNaN(parts[2]) ? 0 : parts[2];
      return `${String(totalMin).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
    if (parts.length === 2) {
      return trimmed;
    }
  }
  return String(val);
}

function getItemIngredientRate(p) {
  if (!p) return 0;
  if (typeof p.ingredientRate === 'number') return p.ingredientRate;
  if (typeof p.ingredient_rate === 'number') return p.ingredient_rate;
  const parsed = parseFloat(p.ingredient_rate || p.ingredientRate || '0');
  return isNaN(parsed) ? 0 : parsed;
}

function getItemCarry(p) {
  if (!p) return 0;
  if (typeof p.carryCapacity === 'number') return p.carryCapacity;
  if (typeof p.carry === 'number') return p.carry;
  const parsed = parseInt(p.carry || p.carryCapacity || '0', 10);
  return isNaN(parsed) ? 0 : parsed;
}

function getItemSkillRate(p) {
  if (!p) return 0;
  if (typeof p.skillRate === 'number') return p.skillRate;
  if (typeof p.skill_rate === 'number') return p.skill_rate;
  const parsed = parseFloat(p.skill_rate || p.skillRate || '0');
  return isNaN(parsed) ? 0 : parsed;
}

const SORT_GETTERS = {
  carry: getItemCarry,
  ingredientRate: getItemIngredientRate,
  skillRate: getItemSkillRate,
  interval: getItemHelpInterval
};
const SORT_DEFAULT_DIR = { carry: 'desc', ingredientRate: 'desc', skillRate: 'desc', interval: 'asc' };

function parseTableSort(sortKey) {
  if (!sortKey) return { col: null, dir: null };
  const i = sortKey.lastIndexOf('-');
  if (i <= 0) return { col: null, dir: null };
  const col = sortKey.slice(0, i);
  const dir = sortKey.slice(i + 1);
  if (!SORT_GETTERS[col] || (dir !== 'asc' && dir !== 'desc')) return { col: null, dir: null };
  return { col, dir };
}

function nextColumnSort(currentSort, col) {
  if (!SORT_DEFAULT_DIR[col]) return currentSort;
  const parsed = parseTableSort(currentSort);
  if (parsed.col === col) return `${col}-${parsed.dir === 'desc' ? 'asc' : 'desc'}`;
  return `${col}-${SORT_DEFAULT_DIR[col]}`;
}

function sortPokemonList(list, sortKey) {
  const out = [...(list || [])];
  const { col, dir } = parseTableSort(sortKey);
  const getter = col && SORT_GETTERS[col];
  if (!getter) return out;
  const mul = dir === 'desc' ? -1 : 1;
  out.sort((a, b) => (getter(a) - getter(b)) * mul);
  return out;
}

/* ─── 🎛️ 懸浮按鈕觸控 / 滑鼠平滑拖曳控制器 (Draggable FAB Controller) ─── */
function makeFloatingDraggable(el, onClick) {
  if (!el || el._hasDragInit) return;
  el._hasDragInit = true;

  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;
  let isDragging = false;
  let isPointerDown = false;
  let pointerId = null;
  let suppressClickUntil = 0;

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    isPointerDown = true;
    isDragging = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;

    const rect = el.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    el.style.transition = 'none';

    try {
      if (el.setPointerCapture && pointerId !== null) {
        el.setPointerCapture(pointerId);
      }
    } catch (_) {}

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!isPointerDown) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Use 6px threshold to begin dragging
    if (!isDragging && Math.hypot(dx, dy) > 6) {
      isDragging = true;
      el.style.cursor = 'grabbing';
    }

    if (isDragging) {
      if (e.cancelable) e.preventDefault();
      const btnW = el.offsetWidth || 50;
      const btnH = el.offsetHeight || 50;
      const minX = 8;
      const maxX = window.innerWidth - btnW - 8;
      const minY = 50;
      const maxY = window.innerHeight - 68 - btnH;

      let newLeft = Math.max(minX, Math.min(maxX, initialLeft + dx));
      let newTop = Math.max(minY, Math.min(maxY, initialTop + dy));

      el.style.setProperty('left', `${newLeft}px`, 'important');
      el.style.setProperty('top', `${newTop}px`, 'important');
      el.style.setProperty('right', 'auto', 'important');
      el.style.setProperty('bottom', 'auto', 'important');
    }
  }

  function onPointerUp(e) {
    if (!isPointerDown) return;
    isPointerDown = false;

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    try {
      if (el.releasePointerCapture && pointerId !== null) {
        el.releasePointerCapture(pointerId);
      }
    } catch (_) {}

    el.style.cursor = 'grab';

    if (isDragging) {
      isDragging = false;
      suppressClickUntil = Date.now() + 400; // Suppress any synthetic click generated by drag release

      // 左右側邊緣智慧磁吸吸附 (Magnetic edge snapping to left or right)
      const screenW = window.innerWidth;
      const btnW = el.offsetWidth || 50;
      const minX = 14;
      const maxX = screenW - btnW - 14;
      const midX = screenW / 2;
      const curLeft = el.getBoundingClientRect().left;

      const snapLeft = (curLeft + btnW / 2 < midX) ? minX : maxX;

      el.style.transition = 'left 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), transform 0.15s ease';
      el.style.setProperty('left', `${snapLeft}px`, 'important');
    } else {
      el.style.transition = 'transform 0.15s ease';
    }
  }

  el.addEventListener('pointerdown', onPointerDown);

  el.addEventListener('click', (e) => {
    if (Date.now() < suppressClickUntil) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (typeof onClick === 'function') {
      onClick(e);
    }
  });
}

if (typeof window !== 'undefined') {
  window.makeFloatingDraggable = makeFloatingDraggable;
}

function ingQtyBadges(ing, idx) {
  if (!ing) return '';
  const qtys = [];
  if (idx === 0) {
    if (ing.l1)  qtys.push(ing.l1);
    if (ing.l30) qtys.push(ing.l30);
    if (ing.l60) qtys.push(ing.l60);
  } else if (idx === 1) {
    if (ing.l30) qtys.push(ing.l30);
    if (ing.l60) qtys.push(ing.l60);
  } else {
    if (ing.l60) qtys.push(ing.l60);
  }
  const ingDisplayName = (ing.name && window.I18N) ? window.I18N.getIngredientName(ing.name) : (ing.name || '');
  return `<span class="ing-qty-group" title="${ingDisplayName}">${qtys.map(q => `<span class="ing-qty">${q}</span>`).join('<span class="ing-arrow">→</span>')}</span>`;
}

/* ─── 🫐 樹果與屬性對應字典 (Berry & Type Mapping) ───────── */
const BERRY_DATA = [
  { name: '柿仔果', type: '一般',   icon: 'https://www.serebii.net/pokemonsleep/berries/persimberry.png' },
  { name: '蘋野果', type: '火',     icon: 'https://www.serebii.net/pokemonsleep/berries/leppaberry.png' },
  { name: '橙橙果', type: '水',     icon: 'https://www.serebii.net/pokemonsleep/berries/oranberry.png' },
  { name: '異奇果', type: '電',     icon: 'https://www.serebii.net/pokemonsleep/berries/grepaberry.png' },
  { name: '墨莓果', type: '草',     icon: 'https://www.serebii.net/pokemonsleep/berries/durinberry.png' },
  { name: '生薑果', type: '冰',     icon: 'https://www.serebii.net/pokemonsleep/berries/rawstberry.png' },
  { name: '櫻子果', type: '格鬥',   icon: 'https://www.serebii.net/pokemonsleep/berries/cheriberry.png' },
  { name: '零餘果', type: '毒',     icon: 'https://www.serebii.net/pokemonsleep/berries/chestoberry.png' },
  { name: '勿花果', type: '地面',   icon: 'https://www.serebii.net/pokemonsleep/berries/figyberry.png' },
  { name: '椰木果', type: '飛行',   icon: 'https://www.serebii.net/pokemonsleep/berries/pamtreberry.png' },
  { name: '芒念果', type: '超能力', icon: 'https://www.serebii.net/pokemonsleep/berries/magoberry.png' },
  { name: '芭亞果', type: '蟲',     icon: 'https://www.serebii.net/pokemonsleep/berries/lumberry.png' },
  { name: '文柚果', type: '岩石',   icon: 'https://www.serebii.net/pokemonsleep/berries/sitrusberry.png' },
  { name: '檬果',   type: '幽靈',   icon: 'https://www.serebii.net/pokemonsleep/berries/blukberry.png' },
  { name: '巧可果', type: '龍',     icon: 'https://www.serebii.net/pokemonsleep/berries/yacheberry.png' },
  { name: '芭拉果', type: '惡',     icon: 'https://www.serebii.net/pokemonsleep/berries/wikiberry.png' },
  { name: '靛莓果', type: '鋼',     icon: 'https://www.serebii.net/pokemonsleep/berries/belueberry.png' },
  { name: '桃桃果', type: '妖精',   icon: 'https://www.serebii.net/pokemonsleep/berries/pechaberry.png' }
];

const TYPE_TO_BERRY = {};
BERRY_DATA.forEach(b => {
  TYPE_TO_BERRY[b.type] = b.name;
});
// 屬性名稱相容簡稱映射
TYPE_TO_BERRY['妖'] = '桃桃果';
TYPE_TO_BERRY['妖精'] = '桃桃果';
TYPE_TO_BERRY['鬥'] = '櫻子果';
TYPE_TO_BERRY['格鬥'] = '櫻子果';
TYPE_TO_BERRY['地'] = '勿花果';
TYPE_TO_BERRY['地面'] = '勿花果';
TYPE_TO_BERRY['岩'] = '文柚果';
TYPE_TO_BERRY['岩石'] = '文柚果';
TYPE_TO_BERRY['鬼'] = '檬果';
TYPE_TO_BERRY['幽靈'] = '檬果';
TYPE_TO_BERRY['超'] = '芒念果';
TYPE_TO_BERRY['超能力'] = '芒念果';
TYPE_TO_BERRY['飛'] = '椰木果';
TYPE_TO_BERRY['飛行'] = '椰木果';

const BERRY_ICON_MAP = {};
BERRY_DATA.forEach(b => {
  BERRY_ICON_MAP[b.name] = b.icon;
  if (b.type) {
    BERRY_ICON_MAP[b.type] = b.icon;
  }
});
BERRY_ICON_MAP['妖'] = 'https://www.serebii.net/pokemonsleep/berries/pechaberry.png';
BERRY_ICON_MAP['鬥'] = 'https://www.serebii.net/pokemonsleep/berries/cheriberry.png';
BERRY_ICON_MAP['地'] = 'https://www.serebii.net/pokemonsleep/berries/figyberry.png';
BERRY_ICON_MAP['岩'] = 'https://www.serebii.net/pokemonsleep/berries/sitrusberry.png';
BERRY_ICON_MAP['鬼'] = 'https://www.serebii.net/pokemonsleep/berries/blukberry.png';
BERRY_ICON_MAP['超'] = 'https://www.serebii.net/pokemonsleep/berries/magoberry.png';
BERRY_ICON_MAP['飛'] = 'https://www.serebii.net/pokemonsleep/berries/pamtreberry.png';

function getPokemonBerry(p) {
  if (!p) return { name: '', icon: '' };
  const berryName = TYPE_TO_BERRY[p.type] || (p.berry && p.berry.name) || '';
  const berryIcon = BERRY_ICON_MAP[berryName] || BERRY_ICON_MAP[p.type] || (p.berry && p.berry.icon) || '';
  return { name: berryName, icon: berryIcon };
}
if (typeof window !== 'undefined') {
  window.getPokemonBerry = getPokemonBerry;
}

/* ─── ⚡ 基礎主技能與複合/專屬技能映射系統 ─────────── */
const BASE_SKILLS = [
  { key: '食材獲取S', label: '食材獲取S', label_en: 'Ingr. Mag. S', icon: '🍎' },
  { key: '食材精選S', label: '食材精選S', label_en: 'Ingr. Select S', icon: '🥗' },
  { key: '活力全體療癒S', label: '全體療癒S', label_en: 'Energy All S', icon: '💚' },
  { key: '活力療癒S', label: '活力療癒S', label_en: 'Energy Cheer S', icon: '💖' },
  { key: '活力填充S', label: '活力填充S', label_en: 'Charge Ene. S', icon: '🔋' },
  { key: '能量填充M', label: '能量填充M', label_en: 'Charge Str. M', icon: '⚡' },
  { key: '能量填充S', label: '能量填充S', label_en: 'Charge Str. S', icon: '⚡' },
  { key: '料理強化S', label: '料理強化S', label_en: 'Cook Power S', icon: '🍲' },
  { key: '料理成功S', label: '料理成功S', label_en: 'Tasty Chance S', icon: '✨' },
  { key: '幫手支援S', label: '幫手支援S', label_en: 'Extra Help S', icon: '🤝' },
  { key: '幫手加速', label: '幫手加速', label_en: 'Helper Boost', icon: '🚀' },
  { key: '樹果遽增', label: '樹果遽增', label_en: 'Berry Burst', icon: '🫐' },
  { key: '夢之碎片獲取S', label: '夢碎獲取S', label_en: 'Dream Shard S', icon: '💎' },
  { key: '揮指', label: '揮指', label_en: 'Metronome', icon: '🎲' },
  { key: '技能複製', label: '技能複製', label_en: 'Skill Copy', icon: '🎭' }
];

const COMPOSITE_SKILL_MAP = {
  // === 真正複合主技能 (True Composite Skills) ===
  // 健美：料理成功S (大成功機率提升) + 食材獲取S (隨機獲得食材) (赫拉克羅斯)
  '健美（料理輔助S）': ['料理成功S', '食材獲取S'],
  
  // 月光：活力填充S (自身活力) + 大成功時活力療癒S (隊友活力) (月亮伊布)
  '月光（活力填充S）': ['活力填充S', '活力療癒S'],
  
  // 樹果汁：活力全體療癒S (全員活力) + 樹果汁道具活力療癒S (單隻活力) (壺壺)
  '樹果汁（活力全體療癒S）': ['活力全體療癒S', '活力療癒S'],
  
  // === 專屬命名與變體主技能 (Named Variant Skills) ===
  // 食材獲取系列
  '正電（食材獲取S）': ['食材獲取S'],
  '禮物（食材獲取S）': ['食材獲取S'],
  
  // 料理強化系列
  '負電（料理強化S）': ['料理強化S'],
  
  // 食材精選系列
  '超幸運（食材精選S）': ['食材精選S'],
  '超幸運 (食材精選S)': ['食材精選S'],
  '怪力鉗（食材精選S）': ['食材精選S'],
  '怪力鉗 (食材精選S)': ['食材精選S'],
  '怪力钳（食材精選S）': ['食材精選S'],
  '怪力钳 (食材精選S)': ['食材精選S'],
  
  // 活力療癒系列
  '新月祈禱（活力全體療癒S）': ['活力全體療癒S'],
  '治癒波動（活力療癒S）': ['活力療癒S'],
  '蹭蹭臉頰（活力療癒S）': ['活力療癒S'],
  
  // 能量填充系列
  '蓄力（能量填充S）': ['能量填充S'],
  '能量填充S（隨機）': ['能量填充S'],
  '夢魘（能量填充M）': ['能量填充M'],
  
  // 樹果遽增系列
  '精神擊破（樹果領域）': ['樹果遽增'],
  '流星群（樹果遽增）': ['樹果遽增'],
  '畫皮（樹果遽增）': ['樹果遽增'],
  '樹果遽增?': ['樹果遽增'],
  
  // 夢之碎片系列
  '波導彈（夢之碎片獲取S）': ['夢之碎片獲取S'],
  '夢之碎片獲取S（隨機）': ['夢之碎片獲取S'],
  
  // 幫手加速系列
  '幫手加速（電）': ['幫手加速'],
  '幫手加速（火）': ['幫手加速'],
  '幫手加速（水）': ['幫手加速'],
  
  // 揮指 / 技能複製系列
  '十項全能（揮指）[可替換]': ['揮指'],
  '模仿（技能複製）': ['技能複製'],
  '變身（技能複製）': ['技能複製']
};

/* ─── 📖 特殊主技能官方詳細說明字典 (Special Main Skill Official In-Game Descriptions) ─ */
const SPECIAL_SKILL_DETAILS = {
  // 🌟 真正複合主技能 (True Composite Skills)
  '健美（料理輔助S）': {
    'zh-TW': '隨機獲得多個食材，並提升下次料理漂亮成功（大成功）的機率。',
    'en-US': 'Randomly get multiple ingredients, and increases the chance of an Extra Tasty dish next cook.'
  },
  '月光（活力填充S）': {
    'zh-TW': '讓自己回復活力；若發生「漂亮成功」時，額外隨機讓隊伍中的 1 隻寶可夢稍微回復活力。',
    'en-US': 'Restores energy to self. On Extra Tasty triggers, also restores energy to a random teammate.'
  },
  '樹果汁（活力全體療癒S）': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力，同時有機會額外獲得可讓單隻寶可夢回復 20 活力的「樹果汁」道具（最多持有 5 個）。',
    'en-US': 'Restores energy to all teammates, with a chance to obtain Berry Juice items (restores 20 energy, max 5).'
  },

  // 🏷️ 專屬命名與變體主技能 (Named Variant Skills)
  '正電（食材獲取S）': {
    'zh-TW': '隨機獲得食材；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，則發動時額外獲得更多食材。',
    'en-US': 'Randomly obtains ingredients. Obtains even more if teammates have Plus or Minus skills.'
  },
  '負電（料理強化S）': {
    'zh-TW': '擴大下次料理時鍋子的容量上限；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，發動時額外隨機讓隊伍中 1 隻寶可夢回復活力。',
    'en-US': 'Expands cooking pot size. If teammates have Plus or Minus, also restores energy to a random teammate.'
  },
  '禮物（食材獲取S）': {
    'zh-TW': '隨機獲得多個食材；有時除了食材之外，還會額外隨機獲得隊伍中 1 隻寶可夢的糖果。',
    'en-US': 'Randomly obtains ingredients, and occasionally grants candies for a random team member.'
  },
  '食材精選S': {
    'zh-TW': '從特定食材中隨機獲得 1 種食材（單一食材獲取量為 5~18 個）。',
    'en-US': 'Gets 1 ingredient type from specific selection (5~18 of a single ingredient).'
  },
  '超幸運（食材精選S）': {
    'zh-TW': '從特定食材 (咖啡豆、大豆、豆肉、蘑菇) 中隨機獲得 1 種食材 (5~18個); 少數情況下暴擊獲得大量夢之碎片代替食材 (暴擊時最高達 20,000 碎片).',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Coffee, Soybean, Sausage, Mushroom; 5~18 items); rarely crits for massive Dream Shards instead (up to 20,000).'
  },
  '超幸運 (食材精選S)': {
    'zh-TW': '從特定食材 (咖啡豆、大豆、豆肉、蘑菇) 中隨機獲得 1 種食材 (5~18個); 少數情況下暴擊獲得大量夢之碎片代替食材 (暴擊時最高達 20,000 碎片).',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Coffee, Soybean, Sausage, Mushroom; 5~18 items); rarely crits for massive Dream Shards instead (up to 20,000).'
  },
  '怪力鉗（食材精選S）': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個).',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力鉗 (食材精選S)': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個).',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力钳（食材精選S）': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個).',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力钳 (食材精選S)': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個).',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '新月祈禱（活力全體療癒S）': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力，並額外獲得隊伍中所有寶可夢撿來的樹果（超能力屬性隊員越多，樹果數量越多）。',
    'en-US': 'Restores energy to all teammates and gathers berries from them (more berries with more Psychic types).'
  },
  '治癒波動（活力療癒S）': {
    'zh-TW': '隨機讓隊伍中的 2 隻寶可夢回復活力，並讓牠們立刻完成一定次數的幫忙（若隊伍中有拉帝歐斯，立即幫忙次數增加）。',
    'en-US': 'Restores energy to 2 teammates and instantly performs helps (more helps if Latios is on team).'
  },
  '蹭蹭臉頰（活力療癒S）': {
    'zh-TW': '隨機讓隊伍中的 1 隻寶可夢回復活力；幸運時該寶可夢還會獲得「主技能發動獎勵」，可額外多發動 1 次主技能。',
    'en-US': 'Restores energy to a teammate; when lucky, grants a bonus main skill trigger to that Pokémon.'
  },
  '蓄力（能量填充S）': {
    'zh-TW': '隨機發動「蓄積」或「噴放」；連續蓄積次數越多，噴放時為卡比獸增加的能量就越多（最高達 90,940 能量）。',
    'en-US': 'Stockpiles or spits energy; more consecutive stockpiles result in greater Snorlax Strength gained (up to 90,940).'
  },
  '夢魘（能量填充M）': {
    'zh-TW': '固定增加大量卡比獸能量（最高達 18,515 能量）；發動時會降低隊伍中「惡屬性以外」寶可夢的活力 12 點。',
    'en-US': 'Significantly increases Snorlax Strength (up to 18,515), but reduces energy of non-Dark type teammates by 12.'
  },
  '精神擊破（樹果領域）': {
    'zh-TW': '增加卡比獸能量，並在營地展開「樹果領域」，期間透過芒芒果（超能力屬性）獲得的能量提升。',
    'en-US': 'Increases Strength and deploys a Berry Field, boosting energy gained from Mago Berries.'
  },
  '流星群（樹果遽增）': {
    'zh-TW': '獲得自己以及隊伍中寶可夢撿來的樹果（龍屬性隊員越多數量越多；若隊伍中有拉帝亞斯數量進一步增加）。',
    'en-US': 'Gathers berries from self and teammates (scaled with Dragon types, increased if Latias is in party).'
  },
  '畫皮（樹果遽增）': {
    'zh-TW': '獲得一定數量的樹果，並額外獲得隊伍中寶可夢撿來的樹果；少數情況下會發生「漂亮成功」獲得大量樹果。',
    'en-US': 'Gathers berries from self and teammates; rarely triggers Extra Tasty for a massive berry burst.'
  },
  '樹果遽增?': {
    'zh-TW': '揮舞巨錘爆發產出自身大量樹果。',
    'en-US': 'Swings a massive hammer to burst a large amount of own berries.'
  },
  '波導彈（夢之碎片獲取S）': {
    'zh-TW': '獲得夢之碎片，並同時增加卡比獸的能量。',
    'en-US': 'Gathers Dream Shards while simultaneously increasing Snorlax Strength.'
  },
  '幫手加速（電）': {
    'zh-TW': '立即獲得隊伍中所有電屬性幫手寶可夢數次幫忙產出（隊伍中電屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Electric helpers on the team (scales with number of distinct Electric species).'
  },
  '幫手加速（火）': {
    'zh-TW': '立即獲得隊伍中所有火屬性幫手寶可夢數次幫忙產出（隊伍中火屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Fire helpers on the team (scales with number of distinct Fire species).'
  },
  '幫手加速（水）': {
    'zh-TW': '立即獲得隊伍中所有水屬性幫手寶可夢數次幫忙產出（隊伍中水屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Water helpers on the team (scales with number of distinct Water species).'
  },
  '十項全能（揮指）[可替換]': {
    'zh-TW': '發動設置的主技能效果，並額外獲得隊伍中 1 隻寶可夢的糖果；可使用「靈感種子」自由切換學習到的主技能。',
    'en-US': 'Triggers equipped main skill and grants candy for a teammate; customizable via Inspiration Seeds.'
  },
  '模仿（技能複製）': {
    'zh-TW': '複製並發動隊伍中前一位幫手寶可夢所發動的主技能。',
    'en-US': 'Copies and triggers the main skill used by the preceding teammate.'
  },
  '變身（技能複製）': {
    'zh-TW': '變身為隊友並複製其技能產出與幫忙效果。',
    'en-US': 'Transforms into a teammate, copying its skill and helping effects.'
  }
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

function formatSkillNameHtml(displayName, isEN) {
  if (!displayName) return '';
  // 移除 [可替換] / [Customizable] / [Custom]，並將所有全形 （） 統一轉為半形 ()
  // 簡短化：活力全體療癒S -> 全體療癒S，夢之碎片 -> 夢碎
  let cleaned = displayName
    .replace(/\s*[\[\(](可替換|Customizable|Custom)[\]\)]/gi, '')
    .replace(/活力全體療癒S/g, '全體療癒S')
    .replace(/夢之碎片/g, '夢碎')
    .replace(/\(Energy for Everyone S\)/gi, '(Energy All S)')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();

  if (!isEN) {
    return `<span class="skill-single-line">${escapeHtml(cleaned)}</span>`;
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

function renderSkillWithTooltip(skillName, pkm) {
  if (!skillName) return '--';
  const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
  const displayName = (typeof window !== 'undefined' && window.I18N) ? window.I18N.getMainSkillName(skillName) : skillName;
  const rawDetail = SPECIAL_SKILL_DETAILS[skillName] || 
                    SPECIAL_SKILL_DETAILS[skillName.replace(/\(/g, '（').replace(/\)/g, '）')] ||
                    SPECIAL_SKILL_DETAILS[skillName.replace(/（/g, '(').replace(/）/g, ')')];
  let detail = rawDetail ? (typeof rawDetail === 'object' ? (rawDetail[isEN ? 'en-US' : 'zh-TW'] || rawDetail['zh-TW']) : rawDetail) : '';

  let plainTitle = detail;
  // 針對特定寶可夢的「食材精選S」系列，精簡直接顯示該寶可夢專屬食材池（單行純圖標，無冗長換行）
  if (skillName && skillName.includes('食材精選')) {
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
      const separator = isEN ? '<span class="skill-tooltip-sep">, </span>' : '<span class="skill-tooltip-sep">、</span>';
      const ingIconsHtml = targetIngs.map(ig => {
        const ingName = (typeof window !== 'undefined' && window.I18N) ? (window.I18N.getIngredientName(ig.name) || ig.name) : ig.name;
        const icon = ig.icon || (typeof window !== 'undefined' && window.I18N && window.I18N.getIngredientIcon(ig.name)) || '';
        return icon ? `<img src="${icon}" class="skill-tooltip-inline-ing" alt="${ingName}" title="${ingName}">` : '';
      }).filter(Boolean).join(separator);

      const ingNamesPlain = targetIngs.map(ig => (typeof window !== 'undefined' && window.I18N) ? (window.I18N.getIngredientName(ig.name) || ig.name) : ig.name).join(isEN ? ', ' : '、');

      const prefix = isEN ? 'Draws: ' : '可精選食材: ';
      if (isSuperLuck) {
        const critText = isEN 
          ? 'Crit effect: Rarely crits for massive Dream Shards instead of ingredients (up to 20,000 shards)!' 
          : '暴擊效果: 少數情況下暴擊獲得大量夢之碎片代替食材 (暴擊時最高達 20,000 碎片)!';
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span></span><div style="font-size:11.5px;color:var(--accent-color,#f59e0b);margin-top:3px;line-height:1.35;font-weight:500;">${critText}</div>`;
        plainTitle = isEN 
          ? `Draws: ${ingNamesPlain}. ${critText}` 
          : `可精選食材: ${ingNamesPlain}. ${critText}`;
      } else if (isHyperCutter) {
        const critText = isEN 
          ? 'Crit effect: Extra Tasty crits to grant 2x ingredients (up to 36 items)!' 
          : '暴擊效果: 漂亮成功 (大成功/暴擊) 時食材產出翻倍 (2 倍, 最高達 36 個)!';
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span></span><div style="font-size:11.5px;color:var(--accent-color,#f59e0b);margin-top:3px;line-height:1.35;font-weight:500;">${critText}</div>`;
        plainTitle = isEN 
          ? `Draws: ${ingNamesPlain}. ${critText}` 
          : `可精選食材: ${ingNamesPlain}. ${critText}`;
      } else {
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span></span>`;
        plainTitle = isEN ? `Draws: ${ingNamesPlain}` : `可精選食材: ${ingNamesPlain}`;
      }
    }
  }
  
  const contentHtml = formatSkillNameHtml(displayName, isEN);
  const cleanSkillKey = (skillName || '')
    .replace(/\s*[\[\(](可替換|Customizable|Custom)[\]\)]/gi, '')
    .replace(/活力全體療癒S/g, '全體療癒S')
    .replace(/夢之碎片/g, '夢碎')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();

  // 僅針對特殊/變體/複合主技能展示標籤與詳細說明，純基礎主技能（如能量填充S）保持純文字不展示說明
  if (detail) {
    return `<span class="special-skill-badge" data-skill="${escapeHtml(cleanSkillKey)}" data-skill-detail="${escapeHtml(detail)}" title="${escapeHtml(plainTitle || detail)}"><span class="skill-name-text">${contentHtml}</span></span>`;
  }
  if (isEN) {
    return `<span class="main-skill-text">${contentHtml}</span>`;
  }
  let cleaned = displayName
    .replace(/\s*[\[\(](可替換|Customizable|Custom)[\]\)]/gi, '')
    .replace(/活力全體療癒S/g, '全體療癒S')
    .replace(/夢之碎片/g, '夢碎')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();
  return escapeHtml(cleaned);
}

function matchesSkill(pokemonSkill, targetBaseSkill) {
  if (!pokemonSkill) return false;
  if (pokemonSkill === targetBaseSkill) return true;
  const mapped = COMPOSITE_SKILL_MAP[pokemonSkill];
  if (mapped && mapped.includes(targetBaseSkill)) return true;
  return false;
}

/* ─── 🔍 智慧寬鬆搜尋引擎 (Phonetic Pinyin / Subsequence / Typo-tolerant Fuzzy Search) ─── */
const PINYIN_TABLE = [
  ['a', '啊阿'],
  ['ai', '艾愛矮哀埃礙癌呆'],
  ['an', '安暗按案岸'],
  ['ang', '昂'],
  ['ao', '奧熬襖傲敖'],
  ['ba', '巴拔把吧霸八罷扒靶疤爸叭'],
  ['bai', '白百擺敗拜柏'],
  ['ban', '班般搬板版半伴辦'],
  ['bang', '幫榜膀棒邦'],
  ['bao', '包寶保報爆暴抱飽胞薄豹寶寶'],
  ['bei', '北被備背貝悲杯倍碑輩'],
  ['ben', '本奔苯笨'],
  ['beng', '崩蹦繃'],
  ['bi', '比必皮閉壁幣避碧筆鼻彼畢匕'],
  ['bian', '邊變編扁遍便辯變'],
  ['biao', '標表飆鏢'],
  ['bie', '別鱉憋'],
  ['bin', '賓濱彬冰'],
  ['bing', '冰兵並病柄餅'],
  ['bo', '波播撥伯薄泊勃駁脖渤'],
  ['bu', '布不步部補捕怖埠哺簿'],
  ['cai', '才采彩菜裁財材'],
  ['cao', '草操槽曹'],
  ['chan', '產單纏禪顫懺'],
  ['chang', '長常場唱廠昌暢倡嘗'],
  ['chao', '超潮朝炒巢抄'],
  ['chen', '陳晨沉趁辰臣'],
  ['cheng', '城成承程盛稱撐誠呈懲'],
  ['chong', '蟲重沖充崇寵'],
  ['chou', '愁抽臭仇醜籌綢'],
  ['chu', '初出除處觸楚儲畜廚'],
  ['chuan', '穿船川傳串喘'],
  ['chui', '吹垂槌'],
  ['chun', '春純春唇蠢'],
  ['ci', '刺次磁詞慈此辭賜雌瓷'],
  ['cong', '蔥從聰叢匆'],
  ['cui', '翠催脆摧'],
  ['cun', '村存寸'],
  ['cuo', '錯措撮'],
  ['da', '大達搭答打塔'],
  ['dai', '呆帶待袋代貸戴怠逮'],
  ['dan', '蛋單但擔淡丹彈膽誕'],
  ['dang', '當擋黨盪蕩檔'],
  ['dao', '刀導島倒道盜稻到'],
  ['de', '德得的地'],
  ['deng', '燈等登鄧鄧'],
  ['di', '低地第底弟帝敵笛遞滴蒂提'],
  ['dian', '電點店顛典甸墊殿典顛'],
  ['diao', '雕吊釣掉調雕'],
  ['die', '蝶跌疊碟爹諜'],
  ['ding', '丁定頂訂盯釘鼎'],
  ['dong', '咚東冬動洞棟凍懂動'],
  ['dou', '豆都斗逗兜陡'],
  ['du', '嘟讀度獨毒都杜肚渡督堵睹'],
  ['duan', '段短斷鍛緞'],
  ['dui', '隊對堆'],
  ['dun', '盾頓噸頓敦鈍蹲'],
  ['duo', '朵舵多墮躲惰奪剁哆墮'],
  ['e', '顎惡額鵝俄餓鵝俄厄鱷'],
  ['en', '恩'],
  ['er', '爾耳兒二而貳餌'],
  ['fa', '發法伐罰乏'],
  ['fan', '反犯范凡繁泛翻煩販'],
  ['fang', '方房防放訪芳仿仿'],
  ['fei', '飛非肥費廢菲匪沸'],
  ['fen', '分份紛粉奮憤糞忿酚'],
  ['feng', '風峰封豐瘋鋒奉逢鳳蜂'],
  ['fu', '福負服副復富父婦符扶伏浮幅輔覆腐蝠'],
  ['ga', '嘎咖尬噶'],
  ['gai', '該改概蓋鈣'],
  ['gan', '乾甘敢趕感竿肝幹'],
  ['gang', '鋼綱岡崗剛港扛缸釭'],
  ['gao', '高告搞稿膏羔'],
  ['ge', '哥格各歌割閣隔個革葛戈'],
  ['geng', '耿梗更耕庚'],
  ['gong', '公工共功攻宮供恭拱貢弓'],
  ['gou', '勾狗購溝夠構鉤構'],
  ['gu', '古骨谷孤鼓故固古顧姑咕辜'],
  ['gua', '瓜掛刮寡'],
  ['guai', '怪拐乖'],
  ['guan', '關管觀官館冠罐貫慣'],
  ['guang', '光廣逛'],
  ['gui', '鬼龜規貴歸軌桂跪硅櫃瑰'],
  ['guo', '果過國郭鍋裹果'],
  ['ha', '哈蛤'],
  ['hai', '海害孩還骸'],
  ['han', '含漢韓汗喊寒涵旱撼'],
  ['hao', '浩耗好好號豪毫壕濠'],
  ['he', '河合何和盒赫褐鶴核荷喝賀涸'],
  ['hei', '黑嘿'],
  ['hong', '紅轟烘弘虹宏鴻洪'],
  ['hou', '猴侯喉厚後吼猴'],
  ['hu', '壺湖呼護互弧胡虎忽蝴乎核琥'],
  ['hua', '花華滑化話畫劃'],
  ['huan', '歡環緩換幻患還煥荒喚'],
  ['huang', '黃皇晃慌荒謊煌簧皇'],
  ['hui', '灰揮回會毀繪慧恢輝惠悔晦徽'],
  ['hun', '魂混昏婚葷'],
  ['huo', '火夥伙獲惑活或貨霍獲火焰'],
  ['ji', '基吉擊機雞積極集計記季技既際濟寂祭幾己寄繼紀擠脊棘姬緝嫉畸稽飢肌'],
  ['jia', '加假甲家夾佳駕架稼價嘉枷夾'],
  ['jian', '箭劍健件見間建鑑漸剪檢減堅尖兼監煎揀艱'],
  ['jiang', '匠江將姜獎講降醬僵殭薑僵'],
  ['jiao', '交角焦郊腳覺校叫教膠矯澆狡繳'],
  ['jie', '傑結截節接街階介借解姐捷潔竭藉'],
  ['jin', '金今進近僅斤緊勁錦巾禁晉筋浸'],
  ['jing', '精經晶驚井景警鏡競境京敬淨靜睛莖荊鯨'],
  ['jiu', '九酒久救舊就究糾救韭糾'],
  ['ju', '巨劇具聚局居橘懼拒矩沮據桔駒拘舉鋸菊'],
  ['juan', '卷圈捐倦絹眷'],
  ['jue', '決絕覺掘爵嚼訣'],
  ['jun', '君軍均菌俊郡駿鈞'],
  ['ka', '卡咖咯佧喀卡'],
  ['kai', '凱開慨楷鎧'],
  ['kan', '看砍刊勘坎檻'],
  ['kang', '康抗慷炕糠'],
  ['ke', '可克客刻科課顆渴殼柯瞌苛顆克'],
  ['kong', '恐空孔控'],
  ['kou', '口扣寇叩'],
  ['ku', '苦哭庫酷窟骷'],
  ['kua', '跨夸垮誇'],
  ['kuai', '快筷塊會膾'],
  ['kuan', '寬款'],
  ['kuang', '況狂曠框礦筐'],
  ['kui', '虧愧奎葵魁饋匱'],
  ['kun', '困昆捆坤'],
  ['kuo', '闊擴括廓'],
  ['la', '拉辣蠟喇落拉啦落臘'],
  ['lai', '萊來賴萊賴賚'],
  ['lan', '藍蘭覽懶爛欄籃攬藍覽纜'],
  ['lang', '狼浪郎朗廊莨'],
  ['lao', '老勞落牢撈酪姥'],
  ['le', '勒樂了肋'],
  ['lei', '雷磊累蕾擂類淚羸'],
  ['li', '利力立例麗李離理歷莉裡厘黎粒璃哩笠靂栗勵歷'],
  ['lian', '連聯練臉鍊憐鏈蓮聯鐮廉'],
  ['liang', '亮量輛良涼樑梁兩糧'],
  ['liao', '療料瞭僚廖撩寥燎'],
  ['lie', '烈列裂劣獵咧'],
  ['lin', '林臨鱗林麟淋吝嶙磷'],
  ['ling', '令另領零鈴靈凌玲齡陵菱令'],
  ['liu', '六流留柳溜瘤硫餾榴'],
  ['long', '龍隆籠聾弄隴瓏瀧籠'],
  ['lou', '樓漏陋摟簍'],
  ['lu', '路陸錄鹿露魯盧爐魯碌路蘆賂鲁'],
  ['lun', '輪論倫崙輪輪倫'],
  ['luo', '羅洛落絡螺裸邏落'],
  ['lv', '綠律旅率屢鋁履濾綠'],
  ['ma', '嗎媽馬麻碼瑪罵麻瑪'],
  ['mai', '買賣邁麥脈埋'],
  ['man', '滿慢曼漫瞞蠻蔓饅'],
  ['mang', '芒忙盲莽茫'],
  ['mao', '貓毛矛帽茂冒貌錨毛'],
  ['me', '麼'],
  ['mei', '沒每妹美枚妹梅媒眉魅昧'],
  ['men', '門們悶捫'],
  ['meng', '夢蒙猛萌盟懵濛朦虻'],
  ['mi', '迷咪米密蜜祕祕咪秘謎'],
  ['mian', '面免綿棉緬免眠免面'],
  ['miao', '妙秒苗描喵瞄渺眇苗'],
  ['min', '敏民敏皿憫憫'],
  ['ming', '明名命鳴冥銘'],
  ['mo', '魔磨摸模膜末莫墨默漠陌抹歿沫模'],
  ['mou', '謀某牟眸'],
  ['mu', '木目母墓幕幕睦穆募牧'],
  ['na', '拿那納娜哪鈉鈉'],
  ['nai', '奈耐奶奶乃奈奈'],
  ['nan', '南難男喃'],
  ['nao', '腦鬧惱鬧'],
  ['ne', '呢哪'],
  ['nei', '內餒'],
  ['nen', '嫩'],
  ['neng', '能'],
  ['ni', '泥你擬逆匿尼泥倪旎膩'],
  ['nian', '年念黏碾念'],
  ['niao', '鳥尿蔦'],
  ['nie', '聶捏涅鎳'],
  ['ning', '寧凝檸擰嚀'],
  ['niu', '牛扭紐鈕狃'],
  ['nong', '農濃弄農儂'],
  ['nu', '怒奴努弩'],
  ['nv', '女奴'],
  ['nuan', '暖'],
  ['nuo', '挪諾懦糯'],
  ['ou', '歐偶嘔歐鷗藕'],
  ['pa', '怕爬趴啪耙'],
  ['pai', '拍排牌派拍'],
  ['pan', '盤判盼叛潘畔'],
  ['pang', '胖旁膀磅仿'],
  ['pao', '炮跑泡袍砲'],
  ['pei', '配陪培培佩沛賠呸'],
  ['pen', '噴盆盼判噴'],
  ['peng', '朋碰澎彭蓬膨棚棚'],
  ['pi', '皮批披疲匹屁痞霹匹皮'],
  ['pian', '片篇便偏片'],
  ['piao', '票漂飄嫖瓢飄'],
  ['pin', '品貧拼頻貧'],
  ['ping', '平瓶評屏萍憑萍'],
  ['po', '破婆魄頗迫坡珀破'],
  ['pou', '剖'],
  ['pu', '普撲鋪僕蒲埔瀑葡鋪譜'],
  ['qi', '七奇旗起其期氣器妻齊汽漆欺戚騎乞歧泣琪'],
  ['qian', '前千牽遷千鉛潛錢乾淺欠簽'],
  ['qiang', '強槍牆腔強搶薔鏘彊'],
  ['qiao', '巧橋悄敲巧雀殼俏殼鍬僑鞘巧'],
  ['qie', '切茄且妾怯'],
  ['qin', '琴親勤禽侵琴寢欽芹琴'],
  ['qing', '青晴清情輕傾頃慶請蜻清'],
  ['qiu', '丘秋求球仇囚鰍酋蚯鍬'],
  ['qu', '去區取曲趣屈趨驅蛆軀'],
  ['quan', '全拳泉權券勸犬圈拳'],
  ['que', '確卻雀缺瘸雀鵲'],
  ['qun', '群裙群'],
  ['ran', '然燃染然'],
  ['rang', '讓嚷壤讓'],
  ['rao', '繞擾饒'],
  ['re', '熱惹'],
  ['ren', '人人認任忍刃仁韌任'],
  ['ri', '日'],
  ['rong', '蓉絨榮容融溶茸蠑榕戎'],
  ['rou', '肉柔揉揉'],
  ['ru', '如入汝乳儒辱褥'],
  ['ruan', '軟阮'],
  ['rui', '瑞銳蕊芮'],
  ['run', '潤閏潤'],
  ['ruo', '弱若若'],
  ['sa', '撒薩灑'],
  ['sai', '賽塞腮塞'],
  ['san', '三散散傘參'],
  ['sang', '桑喪嗓'],
  ['se', '色色澀瑟嗇'],
  ['sen', '森森'],
  ['seng', '僧'],
  ['sha', '沙殺砂紗傻廈煞鯊沙'],
  ['shan', '山珊扇善單閃衫珊膳煽訕'],
  ['shang', '上商傷賞尚裳晌'],
  ['shao', '少燒稍哨勺紹燒'],
  ['she', '蛇射設捨舌奢社涉攝捨'],
  ['shen', '身深神什甚申伸審滲慎腎神'],
  ['sheng', '聲生升勝繩聖盛牲笙省聖'],
  ['shi', '食石時十實識始使市是事示視式室試世勢士獅師詩失施濕拾蝕矢誓屎飾史逝釋'],
  ['shou', '手首守受授壽瘦獸獸'],
  ['shu', '鼠屬署書樹數術輸叔殊熟暑舒束述蜀梳贖梳'],
  ['shua', '刷耍'],
  ['shuai', '摔率帥衰'],
  ['shuan', '栓拴栓'],
  ['shuang', '雙霜爽雙'],
  ['shui', '水睡稅水'],
  ['shun', '順瞬吮'],
  ['shuo', '說爍朔碩'],
  ['si', '斯思絲司私死四寺似肆撕飼斯'],
  ['song', '松送宋誦聳鬆頌'],
  ['sou', '搜艘嗽颼'],
  ['su', '速素宿塑俗肅蘇訴溯縮訴速'],
  ['suan', '算酸蒜'],
  ['sui', '隨歲碎遂隧隨穗'],
  ['sun', '孫損筍筍'],
  ['suo', '所鎖索梭縮瑣娑梭'],
  ['ta', '他她它踏塔塌獺塔獺'],
  ['tai', '太泰胎台苔態抬臺泰'],
  ['tan', '談探坦炭攤灘潭壇貪檀痰'],
  ['tang', '堂唐糖湯躺燙趟堂塘搪'],
  ['tao', '桃逃淘陶套討濤討桃'],
  ['te', '特忒'],
  ['teng', '騰疼藤謄'],
  ['ti', '體題踢提替涕剃惕梯啼蹄蒂'],
  ['tian', '天田甜添填田舔恬天'],
  ['tiao', '條跳挑調挑'],
  ['tie', '鐵貼帖鐵'],
  ['ting', '聽庭停廳挺廷蜓婷霆'],
  ['tong', '同童通痛銅桐桶統彤筒瞳同'],
  ['tou', '頭投偷透頭'],
  ['tu', '土圖兔途吐突徒塗凸土'],
  ['tuan', '團團揣'],
  ['tui', '推退腿褪'],
  ['tun', '吞屯臀囤吞'],
  ['tuo', '托脫妥駝鴕唾托拖托陀陀'],
  ['wa', '蛙娃哇挖瓦窪媧襪蛙'],
  ['wai', '外歪'],
  ['wan', '萬玩完晚碗彎宛挽腕頑蔓萬'],
  ['wang', '王望往網亡妄忘旺網王'],
  ['wei', '尾為位微危味未微委衛唯偉圍違唯維畏胃緯偽威'],
  ['wen', '文問聞紋溫穩吻蚊紊玟紋'],
  ['weng', '翁甕嗡'],
  ['wo', '我窩握臥窩握渦'],
  ['wu', '無五物舞物屋武午舞誤悟伍污霧烏巫侮鳥務'],
  ['xi', '西希西夕析吸息洗細喜稀戲繫息惜隙吸蟋膝席稀習蜥'],
  ['xia', '夏下峽蝦瞎嚇俠匣轄'],
  ['xian', '仙先線現限鮮險顯縣掀閑閒咸弦銜餡纖腺憲仙'],
  ['xiang', '相象向像想鄉香響享降箱祥翔巷鑲項'],
  ['xiao', '小消笑效校銷囂嘯霄宵蕭硝曉梟小'],
  ['xie', '些寫謝鞋協邪血寫洩屑斜歇諧謝蟹'],
  ['xin', '新心辛信新薪芯馨欣信'],
  ['xing', '行性形星幸型醒興杏腥杏幸'],
  ['xiong', '胸雄熊兇兄兇熊雄'],
  ['xiu', '休秀修袖羞臭宿鏽'],
  ['xu', '許需須序虛續緒蓄敘徐婿徐'],
  ['xuan', '玄選旋宣懸炫旋眩絃選'],
  ['xue', '雪穴學靴血削學雪'],
  ['xun', '尋訓訊迅循旬熏詢尋'],
  ['ya', '牙押崖涯雅牙啞壓芽鴨訝蚜亞雅鴉'],
  ['yan', '炎焰眼岩言顏研演驗厭演宴嚴煙艷鹽延沿雁燕鹽眼岩'],
  ['yang', '樣羊楊洋揚漾仰養氧陽央秧樣'],
  ['yao', '要腰搖藥咬遙耀妖窯謠搖曜鑰'],
  ['ye', '葉頁夜野也業爺液冶咽夜葉'],
  ['yi', '伊依一衣醫異易意義益譯億役抑翼議疑怡姨乙亦屹移儀宜遺倚矣抑藝裔蟻蜴'],
  ['yin', '音陰引印隱銀因飲引音殷吟寅蔭'],
  ['ying', '影應英映硬嬰鷹迎盈熒螢櫻贏營穎鷹嬰'],
  ['yo', '喲'],
  ['yong', '勇泳永用湧詠蛹擁庸臃湧勇'],
  ['you', '幼友有由右遊又油優誘幽悠郵尤游'],
  ['yu', '魚雨語玉育遇魚羽於預域余宇郁域娛遇羽鬱魚禦語怨'],
  ['yuan', '螈原圓源園員遠院願元援淵袁冤緣員猿螈'],
  ['yue', '月岳越躍悅約樂閱鑰躍月'],
  ['yun', '運雲勻允暈韻孕運勻員'],
  ['za', '雜砸咋'],
  ['zai', '在再載災仔栽哉'],
  ['zan', '讚暫贊簪'],
  ['zang', '髒藏葬'],
  ['zao', '早造藻燥噪糟棗造'],
  ['ze', '則責擇澤嘖'],
  ['zei', '賊'],
  ['zen', '怎'],
  ['zeng', '增贈憎'],
  ['zha', '炸扎查榨閘詐眨'],
  ['zhai', '宅摘窄債寨齋'],
  ['zhan', '顫站戰佔斬展沾粘詹盞戰氈顫'],
  ['zhang', '張章丈掌長障帳脹彰'],
  ['zhao', '沼照找爪兆趙召沼招罩肇'],
  ['zhe', '這著遮折者蜇哲蔗者著'],
  ['zhen', '真陣針震鎮診枕針甄震'],
  ['zheng', '正爭整政證征蒸掙睜正'],
  ['zhi', '智隻指枝支知製直值質執治志制至址紙植殖脂蜘織稚炙'],
  ['zhong', '種中鐘重終眾忠腫衷踵種'],
  ['zhou', '周洲舟咒晝宙粥皺軸咒'],
  ['zhu', '竹主著住助注珠株諸祝豬煮逐燭築著竺'],
  ['zhua', '抓爪'],
  ['zhuai', '拽'],
  ['zhuan', '專轉傳磚撰賺轉'],
  ['zhuang', '壯裝撞莊狀妝幢壯'],
  ['zhui', '追錐墜綴贅'],
  ['zhun', '準准'],
  ['zhuo', '著捉桌卓濁酌琢灼啄著'],
  ['zi', '子紫字自姿咨資仔滋諮姊子'],
  ['zong', '總棕宗縱縱鬃縱'],
  ['zou', '走奏揍走'],
  ['zu', '組族足阻租卒祖足詛'],
  ['zuan', '鑽纂'],
  ['zui', '嘴最罪醉嘴'],
  ['zun', '尊遵'],
  ['zuo', '做作坐座左昨佐琢']
];

const CHAR_TO_PINYIN = {};
for (let i = 0; i < PINYIN_TABLE.length; i++) {
  const py = PINYIN_TABLE[i][0];
  const chars = PINYIN_TABLE[i][1];
  for (let j = 0; j < chars.length; j++) {
    CHAR_TO_PINYIN[chars[j]] = py;
  }
}

function toPinyin(str) {
  if (!str) return '';
  let res = '';
  for (let i = 0; i < str.length; i++) {
    res += CHAR_TO_PINYIN[str[i]] || str[i];
  }
  return res;
}

function levenshteinDistance(s1, s2) {
  if (s1 === s2) return 0;
  if (!s1) return s2.length;
  if (!s2) return s1.length;
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function isSubsequence(sub, str) {
  if (!sub || !str) return false;
  let i = 0, j = 0;
  while (i < sub.length && j < str.length) {
    if (sub[i] === str[j]) i++;
    j++;
  }
  return i === sub.length;
}

function matchesPokemonSearch(p, query) {
  if (!query) return true;
  const q = String(query).trim().toLowerCase();
  if (!q) return true;

  const qClean = q.replace(/[\s\-_（）\(\)\.\'’]/g, '');

  // 1. 純數字編號邏輯 (完全精確比對編號，嚴禁寬鬆模糊匹配)
  const isNumeric = /^#?\d+$/.test(qClean);
  if (isNumeric) {
    const qNum = qClean.replace(/^#/, '').replace(/^0+/, '');
    const idStr = String(p.id || '');
    const fNo = String(p.formatted_no || '');
    const fNoNum = fNo.replace(/^0+/, '');
    return (
      qClean === idStr ||
      qClean === `#${fNo}` ||
      qClean === fNo ||
      (qNum !== '' && (idStr === qNum || fNoNum === qNum))
    );
  }

  // 2. 文字精確比對
  const nameCN = String((p.name && p.name.cn) || p.name_cn || '').toLowerCase();
  const nameEN = String((p.name && p.name.en) || p.name_en || '').toLowerCase();
  const nameJP = String((p.name && p.name.jp) || p.name_jp || '').toLowerCase();
  const nameCNClean = nameCN.replace(/[\s\-_（）\(\)\.\'’]/g, '');
  const nameENClean = nameEN.replace(/[\s\-_（）\(\)\.\'’]/g, '');
  const nameJPClean = nameJP.replace(/[\s\-_（）\(\)\.\'’]/g, '');

  if (
    nameCN.includes(q) || nameEN.includes(q) || nameJP.includes(q) ||
    nameCNClean.includes(qClean) || nameENClean.includes(qClean) || nameJPClean.includes(qClean)
  ) {
    return true;
  }

  // 3. 中文拼音 / 同音字寬鬆比對 (解決「一步」、「依布」、「皮卡秋」免選字輸入)
  if (!p._pinyin) {
    p._pinyin = toPinyin(nameCNClean);
  }
  const qPinyin = toPinyin(qClean);
  if (qPinyin && p._pinyin && p._pinyin.includes(qPinyin)) {
    return true;
  }

  // 4. 中文子序列匹配 (例如「妙花」匹配「妙蛙花」、「南瓜人」匹配「南瓜怪人」)
  if (qClean.length >= 2 && isSubsequence(qClean, nameCNClean)) {
    return true;
  }

  // 5. 中文字元編輯距離 (單字打錯，長度 >= 3 容許 1 個錯字)
  if (qClean.length >= 3) {
    if (Math.abs(qClean.length - nameCNClean.length) <= 1) {
      if (levenshteinDistance(qClean, nameCNClean) <= 1) return true;
    }
    if (nameCNClean.length > qClean.length) {
      for (let i = 0; i <= nameCNClean.length - qClean.length; i++) {
        const sub = nameCNClean.slice(i, i + qClean.length);
        if (levenshteinDistance(qClean, sub) <= 1) return true;
      }
    }
  }

  // 6. 英文拼字錯誤 / 模糊比對 (例如 eeve, pikachuu, blastose, charzard)
  if (/^[a-z\s\-_'\.]+$/i.test(q)) {
    if (qClean.length >= 4 && isSubsequence(qClean, nameENClean)) {
      return true;
    }
    if (qClean.length >= 4) {
      const maxDist = qClean.length >= 7 ? 2 : 1;
      if (Math.abs(qClean.length - nameENClean.length) <= maxDist) {
        if (levenshteinDistance(qClean, nameENClean) <= maxDist) return true;
      }
      const enWords = nameEN.split(/[\s\-_（）\(\)\.\'’]+/).filter(Boolean);
      for (let w = 0; w < enWords.length; w++) {
        const word = enWords[w];
        if (Math.abs(qClean.length - word.length) <= maxDist) {
          if (levenshteinDistance(qClean, word) <= maxDist) return true;
        }
      }
    }
  }

  return false;
}

const PokemonApp = {
  allPokemons: [],
  currentSearch: '',
  onlyFinal: true,
  onlyInitialIng: false,
  showNo: false,
  selectedTypes: new Set(),
  selectedSpecialties: new Set(),
  selectedBerries: new Set(),
  selectedIngredients: new Set(),
  selectedSkills: new Set(),
  currentSort: 'no-asc',
  viewMode: 'table',

  init(data) {
    this.allPokemons = data || [];
    this.currentSearch = '';
    this.onlyFinal = true;
    this.onlyInitialIng = false;
    this.showNo = false;
    this.selectedTypes = new Set();
    this.selectedSpecialties = new Set();
    this.selectedBerries = new Set();
    this.selectedIngredients = new Set();
    this.selectedSkills = new Set();
    this.currentSort = 'no-asc';
    this.viewMode = 'table';
  },
};

if (typeof window !== 'undefined') {
  window.PokemonApp = PokemonApp;
  window.renderSkillWithTooltip = renderSkillWithTooltip;
  window.formatHelpInterval = formatHelpInterval;
  window.matchesPokemonSearch = matchesPokemonSearch;
  window.toPinyin = toPinyin;
}
PokemonApp.renderSkillWithTooltip = renderSkillWithTooltip;
PokemonApp.formatHelpInterval = formatHelpInterval;
PokemonApp.matchesPokemonSearch = matchesPokemonSearch;
PokemonApp.toPinyin = toPinyin;
PokemonApp.levenshteinDistance = levenshteinDistance;
PokemonApp.isSubsequence = isSubsequence;

Object.assign(PokemonApp, {
  filterData() {
    return this.allPokemons.filter(p => {
      const pType = p.type || '';
      const pSpec = p.specialty || '';
      if (this.selectedTypes.size > 0 && !this.selectedTypes.has('ALL') && !this.selectedTypes.has(pType)) return false;

      // 類型篩選 (樹果、食材、技能；若都沒選則展示全部；夢幻 specialty === '全部' 在任何選取下均展示)
      if (this.selectedSpecialties && this.selectedSpecialties.size > 0 && !this.selectedSpecialties.has('ALL')) {
        const isMewAll = pSpec === '全部' || pSpec === 'ALL';
        if (!isMewAll && !this.selectedSpecialties.has(pSpec)) return false;
      }

      // 👑 僅最終進化篩選 (Only Final Evolution)
      if (this.onlyFinal) {
        const isFinal = p.is_final === '〇' || p.is_final === 'O' || p.is_final === 'o' || p.is_final === true || p.is_final === '1';
        if (!isFinal) return false;
      }

      // 樹果細節篩選
      if (this.selectedBerries && this.selectedBerries.size > 0) {
        const berryName = TYPE_TO_BERRY[pType];
        if (!berryName || !this.selectedBerries.has(berryName)) return false;
      }

      // 食材細節篩選 (若開啟「僅初始食材」則只比對 Lv.1 初始食材 p.ingredients[0]，否則比對任意食材)
      if (this.selectedIngredients && this.selectedIngredients.size > 0) {
        if (this.onlyInitialIng) {
          const initialIng = p.ingredients && p.ingredients[0] && p.ingredients[0].name ? p.ingredients[0].name : '';
          if (!initialIng || !this.selectedIngredients.has(initialIng)) return false;
        } else {
          const hasIng = p.ingredients && p.ingredients.some(ing => ing.name && this.selectedIngredients.has(ing.name));
          if (!hasIng) return false;
        }
      }

      // 技能細節篩選 (支援基礎技能與複合技能自動關聯)
      if (this.selectedSkills && this.selectedSkills.size > 0) {
        let hasMatchedSkill = false;
        for (const targetSkill of this.selectedSkills) {
          if (matchesSkill(p.main_skill, targetSkill)) {
            hasMatchedSkill = true;
            break;
          }
        }
        if (!hasMatchedSkill) return false;
      }

      if (this.currentSearch) {
        if (!matchesPokemonSearch(p, this.currentSearch)) return false;
      }
      return true;
    });
  },

  sortData(data) {
    return sortPokemonList(data || this.filterData(), this.currentSort);
  },

  toggleColumnSort(col) {
    this.currentSort = nextColumnSort(this.currentSort, col);
    return this.currentSort;
  },

  render() {
    const filtered = this.filterData();
    return this.sortData(filtered);
  }
});

// 🛑 遮罩層專屬事件消費器 (Backdrop Event Consumer - 徹底阻斷穿透至底層元件)
function bindBackdropDismiss(backdropEl, closeFn) {
  if (!backdropEl || backdropEl._hasDismissBound) return;
  backdropEl._hasDismissBound = true;

  backdropEl.addEventListener('touchstart', (e) => {
    e.stopPropagation();
  }, { passive: false });

  backdropEl.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeFn();
  }, { passive: false });

  backdropEl.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeFn();
  });
}

// 📱 手勢右滑收合控制 (Swipe Right to Close Sidebar Helper - 支援全組件區域右滑且不干擾點選與滑桿)
function bindSidebarSwipeRightToClose(sidebarEl, closeFn) {
  if (!sidebarEl || sidebarEl._hasSwipeRightListener) return;
  sidebarEl._hasSwipeRightListener = true;

  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isIgnored = false;

  sidebarEl.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches[0]) return;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
    isIgnored = false;

    const target = e.target;
    // 僅排除水平滑桿本體操作（防止拖動數值滑桿時誤觸收合）
    if (target && target.tagName === 'INPUT' && (target.type === 'range' || target.classList.contains('rf-slider'))) {
      isIgnored = true;
      return;
    }

    // 若觸控點在右側邊緣滾動條區域（距右邊框 24px 內），視為滾動條操作，不觸發收合
    const sidebarRect = sidebarEl.getBoundingClientRect ? sidebarEl.getBoundingClientRect() : { right: 1000 };
    if (touch.clientX > sidebarRect.right - 24) {
      isIgnored = true;
      return;
    }
  }, { passive: true });

  sidebarEl.addEventListener('touchmove', (e) => {
    if (isIgnored || !e.touches || !e.touches[0]) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // 若主要為縱向上下滑動瀏覽列表（縱向位移大於橫向且 > 8px），立即忽略本輪收合手勢，保證正常縱向滾動流暢
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      isIgnored = true;
    }
  }, { passive: false });

  sidebarEl.addEventListener('touchend', (e) => {
    if (isIgnored || !e.changedTouches || !e.changedTouches[0]) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;
    const elapsed = Date.now() - startTime;

    // 判定向右橫向滑動收合（位移 >= 45px、橫向位移大於縱向位移的 1.2 倍、時間 < 800ms）
    if (diffX >= 45 && diffX > Math.abs(diffY) * 1.2 && elapsed < 800) {
      if (!sidebarEl.classList.contains('collapsed')) {
        closeFn();
      }
    }
  }, { passive: true });
}

function toggleSidebar(forceState) {
  if (typeof PokemonApp !== 'undefined' && typeof PokemonApp.toggleSidebar === 'function' && PokemonApp.toggleSidebar !== toggleSidebar) {
    return PokemonApp.toggleSidebar(forceState);
  }
  const sidebar = (typeof document !== 'undefined') ? document.getElementById('pokemon-filter-sidebar') : null;
  const bookmarkHandle = (typeof document !== 'undefined') ? document.getElementById('sidebar-bookmark-handle') : null;
  const backdrop = (typeof document !== 'undefined') ? document.getElementById('sidebar-backdrop') : null;
  if (!sidebar) return;
  const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
  const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

  if (shouldCollapse) {
    sidebar.classList.add('collapsed');
    if (backdrop) backdrop.classList.remove('active');
    if (bookmarkHandle) {
      bookmarkHandle.classList.remove('drawer-open');
      bookmarkHandle.setAttribute('aria-expanded', 'false');
      bookmarkHandle.title = '展開篩選側邊欄';
      bookmarkHandle.style.opacity = '1';
      bookmarkHandle.style.pointerEvents = 'auto';
      bookmarkHandle.style.display = 'flex';
      bookmarkHandle.style.visibility = 'visible';
    }
    if (typeof setSidebarSavedState === 'function') {
      setSidebarSavedState('pksleep_dex_sidebar_open', false);
    }
  } else {
    sidebar.classList.remove('collapsed');
    if (typeof window !== 'undefined' && window.innerWidth <= 1024 && backdrop) {
      backdrop.classList.add('active');
    }
    if (bookmarkHandle) {
      bookmarkHandle.classList.add('drawer-open');
      bookmarkHandle.setAttribute('aria-expanded', 'true');
      bookmarkHandle.title = '收合篩選側邊欄';
      bookmarkHandle.style.opacity = '0';
      bookmarkHandle.style.pointerEvents = 'none';
      bookmarkHandle.style.display = 'none';
      bookmarkHandle.style.visibility = 'hidden';
    }
    if (typeof setSidebarSavedState === 'function') {
      setSidebarSavedState('pksleep_dex_sidebar_open', true);
    }
  }
}

if (typeof window !== 'undefined') {
  window.bindBackdropDismiss = bindBackdropDismiss;
  window.bindSidebarSwipeRightToClose = bindSidebarSwipeRightToClose;
  window.toggleSidebar = toggleSidebar;
}
PokemonApp.bindBackdropDismiss = bindBackdropDismiss;
PokemonApp.bindSidebarSwipeRightToClose = bindSidebarSwipeRightToClose;
PokemonApp.toggleSidebar = toggleSidebar;

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    let allPokemons = [];
    let currentSearch = '';
    const finalEvoToggle = document.getElementById('final-evo-toggle');
    let onlyFinal = finalEvoToggle ? finalEvoToggle.checked : true;
    const initialIngToggle = document.getElementById('initial-ing-toggle');
    let onlyInitialIng = initialIngToggle ? initialIngToggle.checked : false;
    const showNoToggle = document.getElementById('show-no-toggle');
    let showNo = showNoToggle ? showNoToggle.checked : false;
    PokemonApp.showNo = showNo;
    const selectedTypes = new Set();
    const selectedSpecialties = new Set();
    const selectedBerries = new Set();
    const selectedIngredients = new Set();
    const selectedSkills = new Set();
    let viewMode = 'table';
    let currentSort = 'no-asc';

    const searchInput = document.getElementById('search-input');
    const typeFilterContainer = document.getElementById('type-filter-tags');
    const specialtyFilterContainer = document.getElementById('specialty-filter-tags');

    const subfilterBerryGroup = document.getElementById('subfilter-berry-group');
    const subfilterIngredientGroup = document.getElementById('subfilter-ingredient-group');
    const subfilterSkillGroup = document.getElementById('subfilter-skill-group');

    const berryFilterContainer = document.getElementById('berry-filter-tags');
    const ingredientFilterContainer = document.getElementById('ingredient-pkm-filter-tags');
    const skillFilterContainer = document.getElementById('skill-filter-tags');

    const clearBerriesBtn = document.getElementById('clear-berries-btn');
    const clearIngredientsBtn = document.getElementById('clear-ingredients-pkm-btn');
    const clearSkillsBtn = document.getElementById('clear-skills-btn');

    const countBadge = document.getElementById('count-badge');
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
      contentArea.addEventListener('click', (e) => {
        const th = e.target.closest('th[data-sort]');
        if (!th) return;
        currentSort = nextColumnSort(currentSort, th.dataset.sort);
        PokemonApp.currentSort = currentSort;
        renderUI();
      });
    }
    const toggleGridBtn = document.getElementById('toggle-grid');
    const toggleTableBtn = document.getElementById('toggle-table');
    const syncBtn = document.getElementById('sync-btn');
    const syncStatus = document.getElementById('sync-status');

    let ghPat = localStorage.getItem(GH_PAT_KEY) || '';

    /* ─── 🎨 主題與外觀系統 (Theme System - 4 Themes × 2 Normal/Inverted = 8 Themes) ─── */
    const STORAGE_KEY_THEME = 'user_theme';
    const STORAGE_KEY_THEME_INVERT = 'user_theme_inverted';
    let currentTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'midnight';
    let isThemeInverted = localStorage.getItem(STORAGE_KEY_THEME_INVERT) === 'true';
    
    function applyTheme(theme, inverted) {
      if (!['midnight', 'onyx', 'dawn', 'emerald'].includes(theme)) {
        theme = 'midnight';
      }
      currentTheme = theme;
      if (typeof inverted === 'boolean') {
        isThemeInverted = inverted;
      }
      document.documentElement.setAttribute('data-theme', theme);
      if (isThemeInverted) {
        document.documentElement.setAttribute('data-theme-inverted', 'true');
      } else {
        document.documentElement.removeAttribute('data-theme-inverted');
      }
      try {
        localStorage.setItem(STORAGE_KEY_THEME, theme);
        localStorage.setItem(STORAGE_KEY_THEME_INVERT, isThemeInverted ? 'true' : 'false');
      } catch (e) {}

      // 更新彈窗內的選中卡片
      document.querySelectorAll('.theme-card-btn').forEach(btn => {
        if (btn.getAttribute('data-theme-val') === theme) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // 更新反色開關狀態
      const invertSwitch = document.getElementById('theme-invert-switch');
      const appInvertSwitch = document.getElementById('app-theme-invert-switch');
      if (invertSwitch) invertSwitch.checked = isThemeInverted;
      if (appInvertSwitch) appInvertSwitch.checked = isThemeInverted;
    }

    // 初始化主題
    applyTheme(currentTheme, isThemeInverted);
    PokemonApp.applyTheme = applyTheme;
    PokemonApp.getCurrentTheme = () => currentTheme;
    PokemonApp.isThemeInverted = () => isThemeInverted;

    // 綁定主題卡片點擊
    document.querySelectorAll('.theme-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const themeVal = btn.getAttribute('data-theme-val');
        if (themeVal) {
          applyTheme(themeVal, isThemeInverted);
        }
      });
    });

    // 綁定反色開關
    ['theme-invert-switch', 'app-theme-invert-switch'].forEach(id => {
      const sw = document.getElementById(id);
      if (sw) {
        sw.addEventListener('change', (e) => {
          applyTheme(currentTheme, e.target.checked);
        });
      }
    });

    /* ─── 🌐 語言系統 (Language System) ─── */
    function updateLangButtons() {
      const currentLang = window.I18N ? window.I18N.getLanguage() : 'zh-TW';
      document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang-val') === currentLang) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const langVal = btn.getAttribute('data-lang-val');
        if (langVal && window.I18N) {
          window.I18N.setLanguage(langVal);
          updateLangButtons();
        }
      });
    });

    updateLangButtons();

    /* ─── ⚙️ 設定彈窗控制 ─── */
    const syncConfigBtn    = document.getElementById('sync-config-btn');
    const settingsModal    = document.getElementById('settings-modal');
    const settingsCloseBtn = document.getElementById('settings-modal-close-btn');
    const ghPatInput       = document.getElementById('gh-pat-input');
    const savePatBtn       = document.getElementById('save-pat-btn');

    if (syncConfigBtn && settingsModal) {
      syncConfigBtn.addEventListener('click', () => {
        if (ghPatInput) ghPatInput.value = ghPat || '';
        applyTheme(currentTheme);
        updateLangButtons();
        settingsModal.style.display = 'flex';
      });

      if (settingsCloseBtn) {
        settingsCloseBtn.addEventListener('click', () => {
          settingsModal.style.display = 'none';
        });
      }

      if (savePatBtn) {
        savePatBtn.addEventListener('click', () => {
          const val = ghPatInput ? ghPatInput.value.trim() : '';
          if (val) {
            ghPat = val;
            localStorage.setItem(GH_PAT_KEY, val);
            settingsModal.style.display = 'none';
            if (syncStatus) syncStatus.innerHTML = `<span style="color:#4ade80;">✅ PAT Token 已儲存！現在可以點擊同步資料。</span>`;
          } else {
            settingsModal.style.display = 'none';
          }
        });
      }

      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.style.display = 'none';
      });
    }

    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        if (!ghPat) {
          if (syncStatus) {
            syncStatus.innerHTML = `
              <span style="color:#fbbf24;">⚠️ 尚未設定 GitHub PAT Token。</span><br>
              請先點擊 <strong>⚙️ 設定</strong> 並填入你的 GitHub PAT。
            `;
          }
          return;
        }

        syncBtn.disabled = true;
        syncBtn.textContent = '⏳ 觸發同步中...';
        if (syncStatus) syncStatus.textContent = '';

        try {
          const res = await fetch(
            `${GH_API_BASE}/actions/workflows/${GH_WORKFLOW}/dispatches`,
            {
              method: 'POST',
              headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${ghPat}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ref: 'main' })
            }
          );

          if (res.status === 204) {
            if (syncStatus) {
              syncStatus.innerHTML = `
                <span style="color:#4ade80;">✅ GitHub Actions 同步已觸發！</span><br>
                <span style="font-size:12px;color:#94a3b8;">約 60-120 秒後資料更新至 GitHub Pages。
                  <a href="https://github.com/${GH_OWNER}/${GH_REPO}/actions" target="_blank"
                    style="color:#38bdf8;">查看進度 ↗</a>
                </span>
              `;
            }
            setTimeout(() => location.reload(), 90000);
          } else if (res.status === 401 || res.status === 403) {
            if (syncStatus) syncStatus.innerHTML = `<span style="color:#ef4444;">❌ PAT Token 無效或權限不足，請重新設定。</span>`;
          } else {
            const body = await res.text();
            if (syncStatus) syncStatus.innerHTML = `<span style="color:#fbbf24;">⚠️ 回應 ${res.status}：${body.slice(0, 120)}</span>`;
          }
        } catch (e) {
          if (syncStatus) syncStatus.innerHTML = `<span style="color:#ef4444;">❌ 網路錯誤：${e.message}</span>`;
        } finally {
          syncBtn.disabled = false;
          syncBtn.textContent = '🔄 同步資料';
        }
      });
    }

    window.getItemIcon = getIconUrl;

    function initSpaTabs() {
      const tabPokemon = document.getElementById('tab-pokemon');
      const tabRecipes = document.getElementById('tab-recipes');
      const tabWiki    = document.getElementById('tab-wiki');
      const tabBox     = document.getElementById('tab-box');
      const tabNews    = document.getElementById('tab-news');
      const panelPokemon = document.getElementById('panel-pokemon');
      const panelRecipes = document.getElementById('panel-recipes');
      const panelWiki    = document.getElementById('panel-wiki');
      const panelBox     = document.getElementById('panel-box');
      const panelNews    = document.getElementById('panel-news');

      if (!tabPokemon || !tabRecipes || !panelPokemon || !panelRecipes) return;

      /* ─── 💾 側邊欄展開/收合狀態持久化管理 (僅限桌面版，H5/移動端一律預設收合且不套用暫時記憶) ─── */
      function getSidebarSavedState(key, defaultOpen = true) {
        const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
        const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 1024;
        if (isMobileH5 || isSmallScreen) {
          return false; // H5 移動端切換 tab 或載入時一律保持收合，不受到暫時狀態保存影響
        }
        try {
          const saved = sessionStorage.getItem(key);
          if (saved !== null) return saved === 'true';
        } catch (e) {}
        return defaultOpen;
      }

      function setSidebarSavedState(key, isOpen) {
        const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
        const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 1024;
        if (isMobileH5 || isSmallScreen) {
          return; // H5 移動端不寫入持久化開啟狀態
        }
        try {
          sessionStorage.setItem(key, isOpen ? 'true' : 'false');
        } catch (e) {}
      }

      window.getSidebarSavedState = getSidebarSavedState;
      window.setSidebarSavedState = setSidebarSavedState;

      function getStorage() {
        try {
          if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
          if (typeof localStorage !== 'undefined') return localStorage;
        } catch (e) {}
        return null;
      }

      const STORAGE_KEY_MAIN_TAB = 'pksleep_active_main_tab';
      const VALID_MAIN_TABS = ['pokemon', 'recipes', 'wiki', 'box', 'news'];
      const VALID_WIKI_SUBTABS = ['skills', 'subskills', 'ingredients', 'values', 'ratings', 'islands'];
      const VALID_BOX_SUBTABS = ['list', 'lab'];

      function switchMainTab(target) {
        if (target === 'pokedex') target = 'pokemon';
        if (!VALID_MAIN_TABS.includes(target)) target = 'pokemon';
        try {
          const storage = getStorage();
          if (storage) {
            storage.setItem(STORAGE_KEY_MAIN_TAB, target);
          }
        } catch (e) {}

        if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
          window.scrollTo(0, 0);
        }

        // 移除所有 tab active 狀態
        [tabPokemon, tabRecipes, tabWiki, tabBox, tabNews].forEach(t => t && t.classList.remove('active'));
        // 隱藏所有 panels
        [panelPokemon, panelRecipes, panelWiki, panelBox, panelNews].forEach(p => p && (p.style.display = 'none'));

        const filterSidebar = document.getElementById('pokemon-filter-sidebar');
        const bookmarkHandle = document.getElementById('sidebar-bookmark-handle');
        const backdrop = document.getElementById('sidebar-backdrop');
        const recipeSidebar = document.getElementById('recipe-filter-sidebar');
        const recipeBookmarkHandle = document.getElementById('recipe-sidebar-bookmark-handle');
        const recipeBackdrop = document.getElementById('recipe-sidebar-backdrop');
        const ladderSidebar = document.getElementById('ladder-filter-sidebar');
        const ladderBackdrop = document.getElementById('ladder-sidebar-backdrop');
        const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

        // 隱藏非當前分頁的側邊欄 DOM（不覆寫其內部 collapsed 記憶狀態）
        if (target !== 'recipes') {
          if (recipeBookmarkHandle) recipeBookmarkHandle.style.display = 'none';
          if (recipeSidebar) recipeSidebar.style.display = 'none';
          if (recipeBackdrop) recipeBackdrop.classList.remove('active');
        }

        if (target !== 'pokemon') {
          if (isMobileH5) document.body.classList.remove('pokemon-active');
          if (bookmarkHandle) bookmarkHandle.style.display = 'none';
          if (filterSidebar) filterSidebar.style.display = 'none';
          if (backdrop) backdrop.classList.remove('active');
        }

        if (target !== 'wiki') {
          document.body.classList.remove('ladder-active');
          document.body.classList.remove('values-active');
          const curLadderHandle = document.getElementById('ladder-sidebar-bookmark-handle');
          if (curLadderHandle && curLadderHandle.style) {
            curLadderHandle.style.display = 'none';
            if (typeof curLadderHandle.style.setProperty === 'function') curLadderHandle.style.setProperty('display', 'none', 'important');
          }
          if (ladderSidebar && ladderSidebar.style) {
            ladderSidebar.style.display = 'none';
            if (typeof ladderSidebar.style.setProperty === 'function') ladderSidebar.style.setProperty('display', 'none', 'important');
          }
          if (ladderBackdrop) ladderBackdrop.classList.remove('active');
          const curLadderRecipeFab = document.getElementById('ladder-recipe-highlight-fab');
          if (curLadderRecipeFab && curLadderRecipeFab.style) {
            curLadderRecipeFab.style.display = 'none';
            if (typeof curLadderRecipeFab.style.setProperty === 'function') curLadderRecipeFab.style.setProperty('display', 'none', 'important');
          }
          if (panelWiki && panelWiki.style) {
            panelWiki.style.display = 'none';
            if (typeof panelWiki.style.setProperty === 'function') panelWiki.style.setProperty('display', 'none', 'important');
          }
          if (window.WikiDB && typeof window.WikiDB.closeLadderRecipeModal === 'function') {
            window.WikiDB.closeLadderRecipeModal();
          }
        }

        if (target === 'news' && panelNews && tabNews) {
          tabNews.classList.add('active');
          panelNews.style.display = 'block';
          if (window.NewsApp && typeof window.NewsApp.render === 'function') {
            try { window.NewsApp.render(); } catch (e) {}
          }
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#news');
          }
        } else if (target === 'box' && panelBox && tabBox) {
          tabBox.classList.add('active');
          panelBox.style.display = 'block';
          let boxSubtab = 'list';
          try {
            const storage = getStorage();
            const saved = storage ? storage.getItem('pksleep_active_box_subtab') : null;
            if (saved === 'list' || saved === 'lab') {
              boxSubtab = saved;
            }
          } catch (e) {}
          if (typeof window.switchBoxSubtab === 'function') {
            try { window.switchBoxSubtab(boxSubtab); } catch (e) {}
          } else if (window.PokemonBoxApp && typeof window.PokemonBoxApp.renderBox === 'function') {
            try { window.PokemonBoxApp.renderBox(); } catch (e) {}
          }
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', boxSubtab === 'list' ? '#box' : `#box/${boxSubtab}`);
          }
        } else if (target === 'wiki' && panelWiki && tabWiki) {
          tabWiki.classList.add('active');
          if (panelWiki.style && typeof panelWiki.style.removeProperty === 'function') panelWiki.style.removeProperty('display');
          panelWiki.style.display = 'block';
          if (window.WikiDB && typeof window.WikiDB.init === 'function') {
            try { window.WikiDB.init(); } catch (e) { console.error('WikiDB.init error:', e); }
          }
          let wikiSubTab = 'skills';
          try {
            const storage = getStorage();
            const saved = storage ? storage.getItem('pksleep_active_wiki_subtab') : null;
            if (saved && VALID_WIKI_SUBTABS.includes(saved)) {
              wikiSubTab = saved;
            }
          } catch (e) {}
          if (window.WikiDB && typeof window.WikiDB.switchSubTab === 'function') {
            try { window.WikiDB.switchSubTab(wikiSubTab); } catch (e) {}
          }
          const isIng = wikiSubTab === 'ingredients';
          const isVal = wikiSubTab === 'values';
          if (isMobileH5) {
            if (isIng) {
              document.body.classList.add('ladder-active');
            } else {
              document.body.classList.remove('ladder-active');
            }
            if (isVal) {
              document.body.classList.add('values-active');
            } else {
              document.body.classList.remove('values-active');
            }
          }
          if (ladderSidebar) {
            if (isIng) {
              ladderSidebar.style.display = 'flex';
              const isLadderOpen = getSidebarSavedState('pksleep_ladder_sidebar_open', true);
              if (isLadderOpen && !isMobileH5 && window.innerWidth > 1024) {
                ladderSidebar.classList.remove('collapsed');
              } else {
                ladderSidebar.classList.add('collapsed');
                if (ladderBackdrop) ladderBackdrop.classList.remove('active');
              }
            } else {
              ladderSidebar.style.display = 'none';
              ladderSidebar.classList.add('collapsed');
              if (ladderBackdrop) ladderBackdrop.classList.remove('active');
            }
          }
          const curLadderHandle = document.getElementById('ladder-sidebar-bookmark-handle');
          if (curLadderHandle) {
            const isCollapsed = ladderSidebar ? ladderSidebar.classList.contains('collapsed') : true;
            if (isIng && isCollapsed) {
              curLadderHandle.classList.remove('drawer-open');
              if (curLadderHandle.style && typeof curLadderHandle.style.removeProperty === 'function') curLadderHandle.style.removeProperty('display');
              curLadderHandle.style.display = 'flex';
              curLadderHandle.style.opacity = '1';
              curLadderHandle.style.pointerEvents = 'auto';
              curLadderHandle.style.visibility = 'visible';
            } else {
              if (isIng && !isCollapsed) curLadderHandle.classList.add('drawer-open');
              curLadderHandle.style.display = 'none';
              curLadderHandle.style.opacity = '0';
              curLadderHandle.style.pointerEvents = 'none';
              curLadderHandle.style.visibility = 'hidden';
            }
          }

          const curLadderRecipeFab = document.getElementById('ladder-recipe-highlight-fab');
          if (curLadderRecipeFab) {
            if (curLadderRecipeFab.style && typeof curLadderRecipeFab.style.removeProperty === 'function') curLadderRecipeFab.style.removeProperty('display');
            curLadderRecipeFab.style.display = (wikiSubTab === 'ingredients') ? 'flex' : 'none';
          }

          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', wikiSubTab === 'skills' ? '#wiki' : `#wiki/${wikiSubTab}`);
          }
        } else if (target === 'recipes' && panelRecipes && tabRecipes) {
          tabRecipes.classList.add('active');
          panelRecipes.style.display = 'block';
          if (recipeSidebar) {
            recipeSidebar.style.display = 'flex';
            const isRecipeOpen = getSidebarSavedState('pksleep_recipe_sidebar_open', true);
            if (isRecipeOpen && !isMobileH5 && window.innerWidth > 1024) {
              recipeSidebar.classList.remove('collapsed');
            } else {
              recipeSidebar.classList.add('collapsed');
              if (recipeBackdrop) recipeBackdrop.classList.remove('active');
            }
          }
          if (recipeBookmarkHandle) {
            const isCollapsed = recipeSidebar ? recipeSidebar.classList.contains('collapsed') : false;
            if (isCollapsed) {
              recipeBookmarkHandle.classList.remove('drawer-open');
              recipeBookmarkHandle.style.display = 'flex';
              recipeBookmarkHandle.style.opacity = '1';
              recipeBookmarkHandle.style.pointerEvents = 'auto';
              recipeBookmarkHandle.style.visibility = 'visible';
            } else {
              recipeBookmarkHandle.classList.add('drawer-open');
              recipeBookmarkHandle.style.display = 'none';
              recipeBookmarkHandle.style.opacity = '0';
              recipeBookmarkHandle.style.pointerEvents = 'none';
              recipeBookmarkHandle.style.visibility = 'hidden';
            }
          }
          if (window.RecipesApp && typeof window.RecipesApp.render === 'function') {
            try { window.RecipesApp.render(); } catch (e) {}
          }
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#recipes');
          }
        } else {
          if (isMobileH5) document.body.classList.add('pokemon-active');
          tabPokemon.classList.add('active');
          panelPokemon.style.display = 'block';
          if (filterSidebar) {
            filterSidebar.style.display = 'flex';
            const isDexOpen = getSidebarSavedState('pksleep_dex_sidebar_open', true);
            if (isDexOpen && !isMobileH5 && window.innerWidth > 1024) {
              filterSidebar.classList.remove('collapsed');
            } else {
              filterSidebar.classList.add('collapsed');
              if (backdrop) backdrop.classList.remove('active');
            }
          }
          if (bookmarkHandle) {
            const isCollapsed = filterSidebar ? filterSidebar.classList.contains('collapsed') : false;
            if (isCollapsed) {
              bookmarkHandle.classList.remove('drawer-open');
              bookmarkHandle.style.display = 'flex';
              bookmarkHandle.style.opacity = '1';
              bookmarkHandle.style.pointerEvents = 'auto';
              bookmarkHandle.style.visibility = 'visible';
            } else {
              bookmarkHandle.classList.add('drawer-open');
              bookmarkHandle.style.display = 'none';
              bookmarkHandle.style.opacity = '0';
              bookmarkHandle.style.pointerEvents = 'none';
              bookmarkHandle.style.visibility = 'hidden';
            }
          }
          if (window.PokemonApp && typeof window.PokemonApp.render === 'function') {
            try { window.PokemonApp.render(); } catch (e) {}
          }
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#pokemon');
          }
        }

        if (typeof window.updateBackToTopVisibility === 'function') {
          window.updateBackToTopVisibility();
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(window.updateBackToTopVisibility);
          }
        }
      }

      window.switchMainTab = switchMainTab;

      tabPokemon.addEventListener('click', () => switchMainTab('pokemon'));
      tabRecipes.addEventListener('click', () => switchMainTab('recipes'));
      if (tabWiki) tabWiki.addEventListener('click', () => switchMainTab('wiki'));
      if (tabBox) tabBox.addEventListener('click', () => switchMainTab('box'));
      if (tabNews) tabNews.addEventListener('click', () => switchMainTab('news'));

      // 監聽網址 hash 變更 (SPA 路由)
      window.addEventListener('hashchange', () => {
        const rawHash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
        const parts = rawHash.split(/[/_?]/);
        let main = parts[0];
        if (main === 'pokedex') main = 'pokemon';
        const sub = parts[1];
        if (VALID_MAIN_TABS.includes(main)) {
          const storage = getStorage();
          if (storage) {
            if (main === 'wiki' && sub && VALID_WIKI_SUBTABS.includes(sub)) {
              try { storage.setItem('pksleep_active_wiki_subtab', sub); } catch (e) {}
            } else if (main === 'box' && sub && VALID_BOX_SUBTABS.includes(sub)) {
              try { storage.setItem('pksleep_active_box_subtab', sub); } catch (e) {}
            }
          }
          switchMainTab(main);
        }
      });

      // 依網址 hash 或 localStorage 載入預設 tab 與子 tab
      const rawHash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
      const parts = rawHash.split(/[/_?]/);
      let mainFromHash = parts[0];
      if (mainFromHash === 'pokedex') mainFromHash = 'pokemon';
      const subFromHash = parts[1];

      let savedMainTab = null;
      try {
        const storage = getStorage();
        if (storage) savedMainTab = storage.getItem(STORAGE_KEY_MAIN_TAB);
      } catch (e) {}

      const initialTab = (VALID_MAIN_TABS.includes(mainFromHash) ? mainFromHash : null)
        || (VALID_MAIN_TABS.includes(savedMainTab) ? savedMainTab : null)
        || 'pokemon';

      const storage = getStorage();
      if (storage) {
        if (initialTab === 'wiki' && subFromHash && VALID_WIKI_SUBTABS.includes(subFromHash)) {
          try { storage.setItem('pksleep_active_wiki_subtab', subFromHash); } catch (e) {}
        } else if (initialTab === 'box' && subFromHash && VALID_BOX_SUBTABS.includes(subFromHash)) {
          try { storage.setItem('pksleep_active_box_subtab', subFromHash); } catch (e) {}
        }
      }

      switchMainTab(initialTab);
    }

    initSpaTabs();

    const CACHE_KEY_DATA_JSON = 'pksleep_cache_data_json';
    const CACHE_KEY_DATA_JSON_TIME = 'pksleep_cache_data_json_time';

    const fetchDataWithFallback = async (...customUrls) => {
      const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
      const defaultCandidates = [
        `${base}data/data.json`,
        `data/data.json`,
        `../data/data.json`,
        `${base}data.json`,
        `data.json`,
        `../data.json`
      ];
      const rawUrls = customUrls.length > 0 ? customUrls : defaultCandidates;
      const cleanUrls = Array.from(new Set(rawUrls.filter(Boolean).map(u => u.split('?')[0])));

      const maxAttempts = 3;
      let lastErr = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const t = Date.now();
        const uniqueUrls = cleanUrls.map(u => `${u}?t=${t}`);

        for (const url of uniqueUrls) {
          try {
            const res = await fetch(url, { cache: 'no-store' });
            if (res && res.ok) {
              const text = await res.text();
              const parsed = JSON.parse(text);
              try {
                if (typeof window !== 'undefined' && window.localStorage) {
                  window.localStorage.setItem(CACHE_KEY_DATA_JSON, text);
                  window.localStorage.setItem(CACHE_KEY_DATA_JSON_TIME, String(Date.now()));
                }
              } catch (e) {}
              return parsed;
            }
          } catch (e) {
            lastErr = e;
          }
        }

        // 若前次嘗試未成功，短暫退避等待後重試 (平滑跨過 GitHub Pages 部署瞬間)
        if (attempt < maxAttempts) {
          await new Promise(r => setTimeout(r, attempt * 600));
        }
      }

      // 若所有網路請求重試皆失敗，嘗試自 LocalStorage 離線快取載入
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const cachedText = window.localStorage.getItem(CACHE_KEY_DATA_JSON);
          if (cachedText) {
            const cachedData = JSON.parse(cachedText);
            if (Array.isArray(cachedData) && cachedData.length > 0) {
              console.warn('[Data Engine] 網路請求暫時失敗，已自動自本機離線快取載入 data.json (' + cachedData.length + ' 筆資料)');
              // 背景排程於 6 秒後靜默嘗試重新請求最新資料以刷新快取
              setTimeout(() => {
                fetchDataWithFallback().then(freshData => {
                  if (Array.isArray(freshData) && freshData.length > 0) {
                    allPokemons = freshData;
                    window.allPokemons = freshData;
                  }
                }).catch(() => {});
              }, 6000);
              return cachedData;
            }
          }
        }
      } catch (cacheErr) {
        console.warn('[Data Engine] 讀取離線快取失敗:', cacheErr);
      }

      throw lastErr || new Error('Failed to load data.json from candidate paths: ' + cleanUrls.join(', '));
    };

    fetchDataWithFallback(
      (typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '') + `data/data.json?t=${Date.now()}`,
      `data/data.json?t=${Date.now()}`,
      `../data/data.json?t=${Date.now()}`,
      `data.json?t=${Date.now()}`
    )
      .then(data => {
        allPokemons = data;
        window.allPokemons = data;
        PokemonApp.init(data);
        initFilters();
        renderUI();
        if (window.initUserBox) {
          window.initUserBox(data);
        }
      })
      .catch(err => {
        console.error('Error loading data.json:', err);
        if (typeof window.__renderInPlaceError === 'function') {
          window.__renderInPlaceError('content-area', '寶可夢資料庫載入失敗 (data.json)', err);
        } else if (contentArea) {
          contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">載入 data.json 失敗：${err.message}</div>`;
        }
      });

    const types = ['ALL', '一般', '格鬥', '飛行', '毒', '地面', '岩石', '蟲', '幽靈', '鋼', '火', '水', '草', '電', '超能力', '冰', '龍', '惡', '妖精'];
    const specialties = ['樹果', '食材', '技能'];
    let uniqueIngredients = [];
    let baseSkillCounts = {};

    function renderTypeButtons() {
      if (!typeFilterContainer) return;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      typeFilterContainer.innerHTML = types.map(t => {
        const isActive = t === 'ALL' ? selectedTypes.size === 0 : selectedTypes.has(t);
        const label = t === 'ALL' ? (isEN ? 'All Types' : '全部屬性') : (isEN && window.I18N ? window.I18N.getTypeName(t) : t);
        return `<button type="button" class="tag-btn ${isActive ? 'active' : ''}" data-type="${t}">${label}</button>`;
      }).join('');
    }

    function renderSpecialtyButtons() {
      if (!specialtyFilterContainer) return;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      specialtyFilterContainer.innerHTML = specialties.map(s => {
        const isActive = selectedSpecialties.has(s);
        const label = window.I18N ? window.I18N.getSpecialtyName(s) : s;
        return `<button type="button" class="tag-btn ${isActive ? 'active' : ''}" data-specialty="${s}">${label}</button>`;
      }).join('');
    }

    function renderBerryButtons() {
      if (!berryFilterContainer) return;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      berryFilterContainer.innerHTML = BERRY_DATA.map(b => {
        const isActive = selectedBerries.has(b.name);
        const berryName = window.I18N ? window.I18N.getBerryName(b.name) : b.name;
        const typeName = isEN && window.I18N ? window.I18N.getTypeName(b.type) : b.type;
        return `
          <button type="button" class="subfilter-icon-btn ${isActive ? 'active' : ''}" data-berry="${b.name}" title="${berryName} (${typeName})" aria-label="${berryName}">
            ${b.icon ? `<img src="${b.icon}" class="subfilter-icon-img" alt="${berryName}" loading="lazy" onerror="this.style.display='none';">` : '🫐'}
          </button>
        `;
      }).join('');

      if (clearBerriesBtn) {
        clearBerriesBtn.style.display = selectedBerries.size > 0 ? 'inline-block' : 'none';
      }
    }

    function renderIngredientButtons() {
      if (!ingredientFilterContainer) return;
      ingredientFilterContainer.innerHTML = uniqueIngredients.map(ing => {
        const isActive = selectedIngredients.has(ing.name);
        const ingName = window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
        return `
          <button type="button" class="subfilter-icon-btn ${isActive ? 'active' : ''}" data-ing="${ing.name}" title="${ingName}" aria-label="${ingName}">
            ${ing.icon ? `<img src="${ing.icon}" class="subfilter-icon-img" alt="${ingName}" loading="lazy" onerror="this.style.display='none';">` : '🥗'}
          </button>
        `;
      }).join('');

      if (clearIngredientsBtn) {
        clearIngredientsBtn.style.display = selectedIngredients.size > 0 ? 'inline-block' : 'none';
      }
    }

    function renderSkillButtons() {
      if (!skillFilterContainer) return;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      skillFilterContainer.innerHTML = BASE_SKILLS.map(skillItem => {
        const isActive = selectedSkills.has(skillItem.key);
        const label = isEN ? (skillItem.label_en || (window.I18N ? window.I18N.getMainSkillName(skillItem.label) : skillItem.label)) : (window.I18N ? window.I18N.getMainSkillName(skillItem.label) : skillItem.label);
        const fullTitle = isEN ? (window.I18N ? window.I18N.getMainSkillName(skillItem.key) : skillItem.label) : skillItem.label;
        return `
          <button type="button" class="subfilter-skill-btn ${isActive ? 'active' : ''}" data-skill="${skillItem.key}" title="${fullTitle}">
            <span class="subfilter-skill-name">${label}</span>
          </button>
        `;
      }).join('');

      if (clearSkillsBtn) {
        clearSkillsBtn.style.display = selectedSkills.size > 0 ? 'inline-block' : 'none';
      }
    }

    function updateSubfilterVisibility() {
      if (subfilterBerryGroup) subfilterBerryGroup.style.display = 'flex';
      if (subfilterIngredientGroup) subfilterIngredientGroup.style.display = 'flex';
      if (subfilterSkillGroup) subfilterSkillGroup.style.display = 'flex';
    }

    function initFilters() {
      // 從資料庫動態收集所有食材與其圖示
      const uniqueIngredientsMap = new Map();
      allPokemons.forEach(p => {
        if (p.ingredients) {
          p.ingredients.forEach(ing => {
            if (ing.name && !uniqueIngredientsMap.has(ing.name)) {
              uniqueIngredientsMap.set(ing.name, ing.icon || '');
            }
          });
        }
      });
      uniqueIngredients = Array.from(uniqueIngredientsMap.entries()).map(([name, icon]) => ({ name, icon }));

      // 計算 15 種基礎主技能對應的寶可夢數量（含複合技能與專屬變體技能）
      BASE_SKILLS.forEach(b => {
        baseSkillCounts[b.key] = allPokemons.filter(p => matchesSkill(p.main_skill, b.key)).length;
      });

      renderTypeButtons();
      renderSpecialtyButtons();
      renderBerryButtons();
      renderIngredientButtons();
      renderSkillButtons();
      updateSubfilterVisibility();

      if (typeFilterContainer) {
        typeFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.tag-btn');
          if (!btn) return;
          const type = btn.getAttribute('data-type');
          if (type === 'ALL') {
            selectedTypes.clear();
          } else {
            if (selectedTypes.has(type)) {
              selectedTypes.delete(type);
            } else {
              selectedTypes.add(type);
            }
          }
          renderTypeButtons();
          renderUI();
        });
      }

      specialtyFilterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-btn');
        if (!btn) return;
        const specialty = btn.getAttribute('data-specialty');
        if (!specialty) return;
        if (selectedSpecialties.has(specialty)) {
          selectedSpecialties.delete(specialty);
        } else {
          selectedSpecialties.add(specialty);
        }
        renderSpecialtyButtons();
        updateSubfilterVisibility();
        renderUI();
      });

      // 樹果細節點擊
      if (berryFilterContainer) {
        berryFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.subfilter-icon-btn, .subfilter-tag-btn');
          if (!btn) return;
          const berry = btn.getAttribute('data-berry');
          if (!berry) return;
          if (selectedBerries.has(berry)) {
            selectedBerries.delete(berry);
          } else {
            selectedBerries.add(berry);
          }
          renderBerryButtons();
          renderUI();
        });
      }

      // 食材細節點擊
      if (ingredientFilterContainer) {
        ingredientFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.subfilter-icon-btn, .subfilter-tag-btn');
          if (!btn) return;
          const ing = btn.getAttribute('data-ing');
          if (!ing) return;
          if (selectedIngredients.has(ing)) {
            selectedIngredients.delete(ing);
          } else {
            selectedIngredients.add(ing);
          }
          renderIngredientButtons();
          renderUI();
        });
      }

      // 技能細節點擊
      if (skillFilterContainer) {
        skillFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.subfilter-skill-btn, .subfilter-tag-btn');
          if (!btn) return;
          const skill = btn.getAttribute('data-skill');
          if (!skill) return;
          if (selectedSkills.has(skill)) {
            selectedSkills.delete(skill);
          } else {
            selectedSkills.add(skill);
          }
          renderSkillButtons();
          renderUI();
        });
      }

      // 清空按鈕
      if (clearBerriesBtn) {
        clearBerriesBtn.addEventListener('click', () => {
          selectedBerries.clear();
          renderBerryButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      if (clearIngredientsBtn) {
        clearIngredientsBtn.addEventListener('click', () => {
          selectedIngredients.clear();
          renderIngredientButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      if (clearSkillsBtn) {
        clearSkillsBtn.addEventListener('click', () => {
          selectedSkills.clear();
          renderSkillButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      // 側邊欄「全部重設」按鈕
      const sidebarResetAllBtn = document.getElementById('sidebar-reset-all-btn');
      if (sidebarResetAllBtn) {
        sidebarResetAllBtn.addEventListener('click', () => {
          selectedSpecialties.clear();
          selectedBerries.clear();
          selectedIngredients.clear();
          selectedSkills.clear();
          if (showNoToggle) showNoToggle.checked = false;
          showNo = false;
          PokemonApp.showNo = false;
          renderSpecialtyButtons();
          renderBerryButtons();
          renderIngredientButtons();
          renderSkillButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      const pokemonSearchClear = document.getElementById('pokemon-search-clear');
      if (searchInput) {
        const updatePkmClear = () => {
          if (typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
            window.updateSearchInputHighlight(searchInput, pokemonSearchClear);
          } else if (pokemonSearchClear) {
            pokemonSearchClear.style.display = searchInput.value.trim() ? 'flex' : 'none';
          }
        };

        searchInput.addEventListener('input', (e) => {
          currentSearch = e.target.value.trim().toLowerCase();
          updatePkmClear();
          renderUI();
        });

        if (pokemonSearchClear) {
          pokemonSearchClear.addEventListener('click', () => {
            searchInput.value = '';
            currentSearch = '';
            updatePkmClear();
            searchInput.focus();
            renderUI();
          });
        }
      }

      if (toggleGridBtn) {
        toggleGridBtn.addEventListener('click', () => {
          viewMode = 'grid';
          toggleGridBtn.classList.add('active');
          if (toggleTableBtn) toggleTableBtn.classList.remove('active');
          renderUI();
        });
      }

      if (toggleTableBtn) {
        toggleTableBtn.addEventListener('click', () => {
          viewMode = 'table';
          toggleTableBtn.classList.add('active');
          if (toggleGridBtn) toggleGridBtn.classList.remove('active');
          renderUI();
        });
      }

      if (finalEvoToggle) {
        finalEvoToggle.addEventListener('change', (e) => {
          onlyFinal = e.target.checked;
          PokemonApp.onlyFinal = onlyFinal;
          renderUI();
        });
      }

      if (initialIngToggle) {
        initialIngToggle.addEventListener('change', (e) => {
          onlyInitialIng = e.target.checked;
          PokemonApp.onlyInitialIng = onlyInitialIng;
          renderUI();
        });
      }

      if (showNoToggle) {
        showNoToggle.addEventListener('change', (e) => {
          showNo = e.target.checked;
          PokemonApp.showNo = showNo;
          renderUI();
        });
      }

      // ⬅️ 左側抽屜式側邊欄展開與收合控制 (Left Sliding Sidebar Controller)
      const sidebar = document.getElementById('pokemon-filter-sidebar');
      const bookmarkHandle = document.getElementById('sidebar-bookmark-handle');
      const closeBtn = document.getElementById('sidebar-close-btn');
      const backdrop = document.getElementById('sidebar-backdrop');
      const bookmarkBadge = document.getElementById('sidebar-bookmark-badge');

      function updateActiveFilterBadge() {
        let count = 0;
        if (selectedSpecialties && selectedSpecialties.size > 0) count += 1;
        if (selectedBerries && selectedBerries.size > 0) count += 1;
        if (selectedIngredients && selectedIngredients.size > 0) count += 1;
        if (selectedSkills && selectedSkills.size > 0) count += 1;
        if (onlyInitialIng) count += 1;
        
        if (bookmarkBadge) {
          if (count > 0) {
            bookmarkBadge.textContent = count;
            bookmarkBadge.style.display = 'inline-flex';
          } else {
            bookmarkBadge.style.display = 'none';
          }
        }
      }

      const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

      function toggleSidebar(forceState) {
        if (!sidebar) return;
        const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
        const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

        if (shouldCollapse) {
          sidebar.classList.add('collapsed');
          if (backdrop) backdrop.classList.remove('active');
          if (bookmarkHandle) {
            bookmarkHandle.classList.remove('drawer-open');
            bookmarkHandle.setAttribute('aria-expanded', 'false');
            bookmarkHandle.title = '展開篩選側邊欄';
            bookmarkHandle.style.opacity = '1';
            bookmarkHandle.style.pointerEvents = 'auto';
            bookmarkHandle.style.display = 'flex';
            bookmarkHandle.style.visibility = 'visible';
          }
          setSidebarSavedState('pksleep_dex_sidebar_open', false);
        } else {
          sidebar.classList.remove('collapsed');
          if (window.innerWidth <= 1024 && backdrop) {
            backdrop.classList.add('active');
          }
          if (bookmarkHandle) {
            bookmarkHandle.classList.add('drawer-open');
            bookmarkHandle.setAttribute('aria-expanded', 'true');
            bookmarkHandle.title = '收合篩選側邊欄';
            bookmarkHandle.style.opacity = '0';
            bookmarkHandle.style.pointerEvents = 'none';
            bookmarkHandle.style.display = 'none';
            bookmarkHandle.style.visibility = 'hidden';
          }
          setSidebarSavedState('pksleep_dex_sidebar_open', true);
        }
      }
      window.toggleSidebar = toggleSidebar;
      PokemonApp.toggleSidebar = toggleSidebar;

      // 依暫存狀態初始化側邊欄展開/收合
      const initialDexOpen = getSidebarSavedState('pksleep_dex_sidebar_open', true);
      if (sidebar) {
        if (initialDexOpen) {
          sidebar.classList.remove('collapsed');
          if (bookmarkHandle) {
            bookmarkHandle.classList.add('drawer-open');
            bookmarkHandle.setAttribute('aria-expanded', 'true');
            bookmarkHandle.style.display = 'none';
            bookmarkHandle.style.opacity = '0';
            bookmarkHandle.style.pointerEvents = 'none';
            bookmarkHandle.style.visibility = 'hidden';
          }
        } else {
          sidebar.classList.add('collapsed');
          if (bookmarkHandle) {
            bookmarkHandle.classList.remove('drawer-open');
            bookmarkHandle.setAttribute('aria-expanded', 'false');
            bookmarkHandle.style.display = 'flex';
            bookmarkHandle.style.opacity = '1';
            bookmarkHandle.style.pointerEvents = 'auto';
            bookmarkHandle.style.visibility = 'visible';
          }
        }
      }

      if (bookmarkHandle) {
        if (typeof makeFloatingDraggable === 'function' && isMobileH5) {
          makeFloatingDraggable(bookmarkHandle, () => toggleSidebar());
        } else {
          bookmarkHandle.addEventListener('click', () => toggleSidebar());
        }
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', () => toggleSidebar(false));
      }

      // 🛑 遮罩層專屬事件消費器 (Backdrop Event Consumer - 徹底阻斷穿透至底層元件)
      function bindBackdropDismiss(backdropEl, closeFn) {
        if (!backdropEl || backdropEl._hasDismissBound) return;
        backdropEl._hasDismissBound = true;

        backdropEl.addEventListener('touchstart', (e) => {
          e.stopPropagation();
        }, { passive: false });

        backdropEl.addEventListener('touchend', (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeFn();
        }, { passive: false });

        backdropEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeFn();
        });
      }
      window.bindBackdropDismiss = bindBackdropDismiss;

      if (backdrop) {
        bindBackdropDismiss(backdrop, () => toggleSidebar(false));
      }

      // 📱 手勢右滑收合控制 (Swipe Right to Close Sidebar Helper - 支援全組件區域右滑且不干擾點選與滑桿)
      function bindSidebarSwipeRightToClose(sidebarEl, closeFn) {
        if (!sidebarEl || sidebarEl._hasSwipeRightListener) return;
        sidebarEl._hasSwipeRightListener = true;

        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let isIgnored = false;

        sidebarEl.addEventListener('touchstart', (e) => {
          if (!e.touches || !e.touches[0]) return;
          const touch = e.touches[0];
          startX = touch.clientX;
          startY = touch.clientY;
          startTime = Date.now();
          isIgnored = false;

          const target = e.target;
          // 僅排除水平滑桿本體操作（防止拖動數值滑桿時誤觸收合）
          if (target && target.tagName === 'INPUT' && (target.type === 'range' || target.classList.contains('rf-slider'))) {
            isIgnored = true;
            return;
          }

          // 若觸控點在右側邊緣滾動條區域（距右邊框 24px 內），視為滾動條操作，不觸發收合
          const sidebarRect = sidebarEl.getBoundingClientRect();
          if (touch.clientX > sidebarRect.right - 24) {
            isIgnored = true;
            return;
          }
        }, { passive: true });

        sidebarEl.addEventListener('touchmove', (e) => {
          if (isIgnored || !e.touches || !e.touches[0]) return;
          const currentX = e.touches[0].clientX;
          const currentY = e.touches[0].clientY;
          const deltaX = currentX - startX;
          const deltaY = currentY - startY;

          // 若主要為縱向上下滑動瀏覽列表（縱向位移大於橫向且 > 8px），立即忽略本輪收合手勢，保證正常縱向滾動流暢
          if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
            isIgnored = true;
          }
        }, { passive: true });

        sidebarEl.addEventListener('touchend', (e) => {
          if (isIgnored || !e.changedTouches || !e.changedTouches[0]) return;
          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;
          const diffX = endX - startX;
          const diffY = endY - startY;
          const elapsed = Date.now() - startTime;

          // 判定向右橫向滑動收合（位移 >= 45px、橫向位移大於縱向位移的 1.2 倍、時間 < 800ms）
          if (diffX >= 45 && diffX > Math.abs(diffY) * 1.2 && elapsed < 800) {
            if (!sidebarEl.classList.contains('collapsed')) {
              closeFn();
            }
          }
        }, { passive: true });
      }
      window.bindSidebarSwipeRightToClose = bindSidebarSwipeRightToClose;

      if (sidebar) {
        bindSidebarSwipeRightToClose(sidebar, () => toggleSidebar(false));
      }

      // 🌐 全域防護：點擊遮罩層 (sidebar-backdrop) 時優雅收合側邊欄並消費事件
      document.addEventListener('touchend', (e) => {
        const target = e.target;
        if (target && target.classList && target.classList.contains('sidebar-backdrop')) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof window.toggleRecipeSidebar === 'function') {
            window.toggleRecipeSidebar(false);
          }
          if (typeof window.closeLadderSidebar === 'function') {
            window.closeLadderSidebar();
          }
          if (typeof window.toggleSidebar === 'function') {
            window.toggleSidebar(false);
          }
          document.querySelectorAll('.pokemon-filter-sidebar, .recipe-filter-sidebar, .ladder-fixed-sidebar').forEach(sb => {
            sb.classList.add('collapsed');
          });
          document.querySelectorAll('.sidebar-backdrop').forEach(bd => bd.classList.remove('active'));
          const f1 = document.getElementById('sidebar-bookmark-handle');
          const f2 = document.getElementById('recipe-sidebar-bookmark-handle');
          const f3 = document.getElementById('ladder-sidebar-bookmark-handle');
          [f1, f2, f3].forEach(f => {
            if (f) {
              f.style.opacity = '1';
              f.style.pointerEvents = 'auto';
              f.style.display = 'flex';
              f.style.visibility = 'visible';
            }
          });
        }
      }, { passive: false });

      window.updateActiveFilterBadge = updateActiveFilterBadge;
    }

    function filterData() {
      return allPokemons.filter(p => {
        if (selectedTypes.size > 0 && !selectedTypes.has(p.type)) return false;

        // 類型篩選 (樹果、食材、技能；若都沒選則展示全部；夢幻 specialty === '全部' 在任何選取下均展示)
        if (selectedSpecialties.size > 0) {
          const isMewAll = p.specialty === '全部' || p.specialty === 'ALL';
          if (!isMewAll && !selectedSpecialties.has(p.specialty)) return false;
        }

        // 👑 僅最終進化篩選 (Only Final Evolution)
        if (onlyFinal) {
          const isFinal = p.is_final === '〇' || p.is_final === 'O' || p.is_final === 'o' || p.is_final === true || p.is_final === '1';
          if (!isFinal) return false;
        }

        // 樹果細節篩選 (多選)
        if (selectedBerries.size > 0) {
          const berryName = TYPE_TO_BERRY[p.type];
          if (!berryName || !selectedBerries.has(berryName)) return false;
        }

        // 食材細節篩選 (若開啟「僅初始食材」則只比對 Lv.1 初始食材 p.ingredients[0]，否則比對任意食材)
        if (selectedIngredients.size > 0) {
          if (onlyInitialIng) {
            const initialIng = p.ingredients && p.ingredients[0] && p.ingredients[0].name ? p.ingredients[0].name : '';
            if (!initialIng || !selectedIngredients.has(initialIng)) return false;
          } else {
            const hasIng = p.ingredients && p.ingredients.some(ing => ing.name && selectedIngredients.has(ing.name));
            if (!hasIng) return false;
          }
        }

        // 技能細節篩選 (多選，支援基礎技能與複合技能自動關聯)
        if (selectedSkills.size > 0) {
          let hasMatchedSkill = false;
          for (const targetSkill of selectedSkills) {
            if (matchesSkill(p.main_skill, targetSkill)) {
              hasMatchedSkill = true;
              break;
            }
          }
          if (!hasMatchedSkill) return false;
        }

        if (currentSearch) {
          if (!matchesPokemonSearch(p, currentSearch)) return false;
        }
        return true;
      });
    }

    function sortableTh(col, label, cls) {
      const parsed = parseTableSort(currentSort);
      const on = parsed.col === col;
      const arrow = on ? (parsed.dir === 'desc' ? '▼' : '▲') : '';
      const aria = on ? (parsed.dir === 'desc' ? 'descending' : 'ascending') : 'none';
      return `<th class="${cls} th-sortable" data-sort="${col}" aria-sort="${aria}">${label}${arrow ? `<span class="sort-arrow" aria-hidden="true">${arrow}</span>` : ''}</th>`;
    }

    function renderUI() {
      if (!contentArea) return;
      try {
        if (typeof updateActiveFilterBadge === 'function') updateActiveFilterBadge();
        const filtered = sortPokemonList(filterData(), currentSort);
        const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
        const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
        if (countBadge) countBadge.textContent = isEN ? `${filtered.length} ${t('pokedex.count_label', 'Pokémon')}` : `共 ${filtered.length} 隻寶可夢`;

        if (filtered.length === 0) {
          contentArea.innerHTML = `<div style="text-align:center; padding: 60px; color: var(--text-muted); font-size: 16px;">${t('pokedex.no_results', '查無符合條件的寶可夢')}</div>`;
          return;
        }

        const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
        if (isMobileH5) {
          viewMode = 'table';
        }

        if (viewMode === 'grid') renderGrid(filtered);
        else renderTable(filtered);
      } catch (err) {
        console.error('Error in renderUI:', err);
        if (typeof window.__renderInPlaceError === 'function') {
          window.__renderInPlaceError('content-area', '圖鑑畫面渲染異常', err);
        }
      }
    }

    function renderGrid(data) {
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

      contentArea.innerHTML = `
        <div class="pokemon-grid">
          ${data.map(p => {
            const iconUrl = getIconUrl(p);
            const pkmName = isEN ? (p.name_en || p.name_cn) : (p.name_cn || p.name_en);
            const specName = window.I18N ? window.I18N.getSpecialtyName(p.specialty) : (p.specialty || '--');
            const berry = getPokemonBerry(p);
            const berryName = window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--');

            return `
            <div class="pokemon-card">
              <div class="card-header">
                ${iconUrl ? `<img class="pokemon-icon" src="${iconUrl}" alt="${pkmName}" loading="lazy" onerror="this.style.display='none';" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}">` : ''}
                <div class="card-title-group" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}">
                  <div class="pokemon-no">No.${p.formatted_no}</div>
                  <div class="pokemon-name" style="white-space:nowrap;">${pkmName}</div>
                  ${!isEN && p.name_en ? `<div class="pokemon-name-en" style="white-space:nowrap;">${p.name_en}</div>` : ''}
                </div>
                <div class="card-header-ingredients">
                  ${p.ingredients ? p.ingredients.map((ing, i) => {
                    const ingName = (ing.name && window.I18N) ? window.I18N.getIngredientName(ing.name) : (ing.name || '');
                    return ing.name ? `
                    <div class="card-header-ing-row" title="${ingName}">
                      ${ing.icon ? `<img class="card-header-ing-icon" src="${ing.icon}" alt="${ingName}" loading="lazy" onerror="this.style.display='none';">` : ''}
                      ${ingQtyBadges(ing, i)}
                    </div>
                  ` : '';
                  }).join('') : ''}
                </div>
              </div>
              <div class="card-stats">
                <div class="stat-item">
                  <span class="stat-label">${t('th.berry', '樹果')}</span>
                  <span class="stat-value" title="${berryName}">
                    ${berry && berry.icon ? `<img src="${berry.icon}" alt="${berryName}" class="card-berry-icon" style="width:20px;height:20px;object-fit:contain;vertical-align:middle;" loading="lazy" onerror="this.style.display='none';">` : `<span class="berry-name-text">${berryName}</span>`}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">${t('th.specialty', '得意')}</span>
                  <span class="stat-value" style="white-space:nowrap;">${specName}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">${t('th.carry', '持有')}</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.carry || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">${t('th.ingredient_rate', '食材率')}</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.ingredient_rate || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">${t('th.skill_rate', '技能率')}</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.skill_rate || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">${t('th.interval', '幫忙間隔')}</span>
                  <span class="stat-value" style="white-space:nowrap;">${formatHelpInterval(p.interval)}</span>
                </div>
              </div>
              <div class="card-skill-footer">
                <span class="card-skill-label">⚡ ${t('th.main_skill', '主技能')}</span>
                <span class="card-skill-value">${renderSkillWithTooltip(p.main_skill, p)}</span>
              </div>
            </div>
          `}).join('')}
        </div>
      `;
    }

    function renderTable(data) {
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
      const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
      const isShowNo = (typeof PokemonApp !== 'undefined' && PokemonApp.showNo) || (typeof showNo !== 'undefined' && showNo) || false;

      const ing1Label = isMobileH5 ? t('th.ing1_mobile', '食1') : t('th.ing1', '食材1');
      const ing2Label = isMobileH5 ? t('th.ing2_mobile', '食2') : t('th.ing2', '食材2');
      const ing3Label = isMobileH5 ? t('th.ing3_mobile', '食3') : t('th.ing3', '食材3');

      contentArea.innerHTML = `
        <div class="table-container">
          <table class="pokemon-table ${isShowNo ? '' : 'hide-no'}">
            <thead>
              <tr>
                ${isShowNo ? '<th class="th-no">No.</th>' : ''}
                <th class="th-icon">${t('th.icon', '圖示')}</th>
                <th class="th-name">${t('th.name', '寶可夢')}</th>
                <th class="th-berry">${t('th.berry', '樹果')}</th>
                <th class="th-spec">${t('th.specialty', '得意')}</th>
                ${sortableTh('carry', t('th.carry', '持有'), 'th-carry')}
                <th class="th-ing">${ing1Label}</th>
                <th class="th-ing">${ing2Label}</th>
                <th class="th-ing">${ing3Label}</th>
                ${sortableTh('ingredientRate', t('th.ingredient_rate', '食材率'), 'th-rate')}
                ${sortableTh('skillRate', t('th.skill_rate', '技能率'), 'th-rate')}
                ${sortableTh('interval', t('th.interval', '幫忙間隔'), 'th-interval')}
                <th class="th-skill">${t('th.main_skill', '主技能')}</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(p => {
                const iconUrl = getIconUrl(p);
                const pkmName = isEN ? (p.name_en || p.name_cn) : (p.name_cn || p.name_en);
                const specName = window.I18N ? window.I18N.getSpecialtyName(p.specialty) : (p.specialty || '--');
                const berry = getPokemonBerry(p);
                const berryName = window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--');

                return `
                <tr>
                  ${isShowNo ? `<td class="td-no">${p.formatted_no}</td>` : ''}
                  <td class="td-icon">
                    ${iconUrl ? `<img src="${iconUrl}" width="34" height="34" class="table-icon" alt="${pkmName}" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}" loading="lazy" onerror="this.style.display='none';" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;">` : ''}
                  </td>
                  <td class="td-name pokemon-name-cell" onclick="window.PokemonApp.openPokemonDetailModal('${p.id}')" style="cursor:pointer;" title="${window.I18N ? window.I18N.t('pokedex.click_appraise', '點擊查看詳細資訊與強度評測') : '點擊查看詳細資訊與強度評測'}">${pkmName}</td>
                  <td class="td-berry">${berry.icon ? `<img src="${berry.icon}" width="22" height="22" class="table-berry-icon" alt="${berryName}" title="${berryName}" loading="lazy" onerror="this.style.display='none';">` : `<span class="berry-name-text">${berryName}</span>`}</td>
                  <td class="td-spec">${specName}</td>
                  <td class="td-carry">${p.carry || '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[0] ? `<div class="ing-cell">${p.ingredients[0].icon ? `<img class="ing-icon" src="${p.ingredients[0].icon}" alt="${window.I18N ? window.I18N.getIngredientName(p.ingredients[0].name) : p.ingredients[0].name}" loading="lazy" title="${window.I18N ? window.I18N.getIngredientName(p.ingredients[0].name) : p.ingredients[0].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[0],0)}</div>` : '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[1] ? `<div class="ing-cell">${p.ingredients[1].icon ? `<img class="ing-icon" src="${p.ingredients[1].icon}" alt="${window.I18N ? window.I18N.getIngredientName(p.ingredients[1].name) : p.ingredients[1].name}" loading="lazy" title="${window.I18N ? window.I18N.getIngredientName(p.ingredients[1].name) : p.ingredients[1].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[1],1)}</div>` : '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[2] ? `<div class="ing-cell">${p.ingredients[2].icon ? `<img class="ing-icon" src="${p.ingredients[2].icon}" alt="${window.I18N ? window.I18N.getIngredientName(p.ingredients[2].name) : p.ingredients[2].name}" loading="lazy" title="${window.I18N ? window.I18N.getIngredientName(p.ingredients[2].name) : p.ingredients[2].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[2],2)}</div>` : '--'}</td>
                  <td class="td-rate">${p.ingredient_rate || '--'}</td>
                  <td class="td-rate">${p.skill_rate || '--'}</td>
                  <td class="td-interval">${formatHelpInterval(p.interval)}</td>
                  <td class="td-skill">${renderSkillWithTooltip(p.main_skill, p)}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    PokemonApp.render = function() {
      if (typeof renderTypeButtons === 'function') renderTypeButtons();
      if (typeof renderSpecialtyButtons === 'function') renderSpecialtyButtons();
      if (typeof renderBerryButtons === 'function') renderBerryButtons();
      if (typeof renderIngredientButtons === 'function') renderIngredientButtons();
      if (typeof renderSkillButtons === 'function') renderSkillButtons();
      if (typeof renderUI === 'function') renderUI();
    };

    function initSkillTooltips() {
      let tooltipEl = document.getElementById('global-skill-tooltip');
      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'global-skill-tooltip';
        tooltipEl.className = 'global-skill-tooltip';
        document.body.appendChild(tooltipEl);
      }

      document.addEventListener('mouseover', (e) => {
        const badge = e.target.closest('.special-skill-badge');
        if (badge && tooltipEl) {
          const skillName = badge.dataset.skill || '';
          const detail = badge.dataset.skillDetail || badge.getAttribute('title') || '';
          if (!detail) return;

          // Temporarily suppress native browser title to avoid tiny double tooltip
          badge.dataset.nativeTitle = badge.getAttribute('title') || '';
          badge.removeAttribute('title');

          const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
          const titleName = (typeof window !== 'undefined' && window.I18N) ? window.I18N.getMainSkillName(skillName) : skillName;

          tooltipEl.innerHTML = `
            <div class="tooltip-header">
              <strong class="tooltip-title">${titleName}</strong>
            </div>
            <div class="tooltip-body">${detail}</div>
          `;
          tooltipEl.style.display = 'block';

          const rect = badge.getBoundingClientRect();
          const tooltipRect = tooltipEl.getBoundingClientRect();

          let top = rect.top - tooltipRect.height - 10;
          let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

          if (top < 10) {
            top = rect.bottom + 10;
          }
          if (left < 14) left = 14;
          if (left + tooltipRect.width > window.innerWidth - 14) {
            left = window.innerWidth - tooltipRect.width - 14;
          }

          tooltipEl.style.top = `${top}px`;
          tooltipEl.style.left = `${left}px`;
          tooltipEl.classList.add('visible');
        }
      });

      document.addEventListener('mouseout', (e) => {
        const badge = e.target.closest('.special-skill-badge');
        if (badge && tooltipEl) {
          if (badge.dataset.nativeTitle) {
            badge.setAttribute('title', badge.dataset.nativeTitle);
          }
          tooltipEl.classList.remove('visible');
          tooltipEl.style.display = 'none';
        }
      });
    }

    function initBackToTop() {
      let btn = document.getElementById('back-to-top-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'back-to-top-btn';
        btn.className = 'back-to-top-btn';
        btn.setAttribute('aria-label', window.I18N ? window.I18N.t('common.back_to_top', '回到頂部') : '回到頂部');
        btn.setAttribute('title', window.I18N ? window.I18N.t('common.back_to_top', '回到頂部') : '回到頂部');
        btn.setAttribute('data-i18n-title', 'common.back_to_top');
        btn.setAttribute('data-i18n-aria', 'common.back_to_top');
        btn.innerHTML = `
          <svg class="back-to-top-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5"></path>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        `;
        document.body.appendChild(btn);
      }

      function updateBackToTopVisibility() {
        if (!btn) return;
        const scrollY = window.pageYOffset || (document.documentElement ? document.documentElement.scrollTop : 0) || (document.body ? document.body.scrollTop : 0) || 0;
        const docHeight = Math.max(
          document.body ? document.body.scrollHeight : 0,
          document.documentElement ? document.documentElement.scrollHeight : 0,
          document.body ? document.body.offsetHeight : 0,
          document.documentElement ? document.documentElement.offsetHeight : 0
        );
        const winHeight = window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : 0) || 0;

        // 判定內容高度是否明顯超過螢幕視窗（至少多出 150px），且向下滑動超過 280px
        const isLongContent = docHeight > winHeight + 150;
        const shouldShow = isLongContent && scrollY > 280;

        if (shouldShow) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }

        // 行動端 H5 避讓檢測：若右下有篩選按鈕 (FAB)，自動向上避讓 138px，防止互相覆蓋
        const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
        if (isMobileH5) {
          const fabPkm = document.getElementById('sidebar-bookmark-handle');
          const fabRecipe = document.getElementById('recipe-sidebar-bookmark-handle');
          const fabLadder = document.getElementById('ladder-sidebar-bookmark-handle');

          const isFabVisible = (el) => {
            if (!el) return false;
            if (el.style.display === 'none') return false;
            if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
              try {
                const s = window.getComputedStyle(el);
                return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
              } catch (e) { return true; }
            }
            return true;
          };

          if (isFabVisible(fabPkm) || isFabVisible(fabRecipe) || isFabVisible(fabLadder)) {
            btn.classList.add('has-filter-fab');
          } else {
            btn.classList.remove('has-filter-fab');
          }
        }
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          window.scrollTo(0, 0);
        }
        if (document.documentElement) {
          try { document.documentElement.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) {}
        }
        if (document.body) {
          try { document.body.scrollTo({ top: 0, behavior: 'smooth' }); } catch (err) {}
        }
      });

      window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
      window.addEventListener('resize', updateBackToTopVisibility, { passive: true });

      window.updateBackToTopVisibility = updateBackToTopVisibility;
      PokemonApp.updateBackToTopVisibility = updateBackToTopVisibility;
      updateBackToTopVisibility();
    }

    // 🔄 原生 App 風格下拉刷新指示器 (Native App Pull-to-Refresh Controller)
    function initPullToRefresh() {
      if (typeof document === 'undefined') return;
      let ptrEl = document.getElementById('pull-to-refresh-indicator');
      if (!ptrEl) {
        ptrEl = document.createElement('div');
        ptrEl.id = 'pull-to-refresh-indicator';
        ptrEl.className = 'ptr-indicator';
        ptrEl.setAttribute('aria-hidden', 'true');
        ptrEl.innerHTML = `
          <div class="ptr-inner">
            <svg class="ptr-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6"></path>
              <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
            </svg>
          </div>
        `;
        if (document.body) {
          document.body.appendChild(ptrEl);
        }
      }

      let touchStartY = 0;
      let touchStartX = 0;
      let isTracking = false;
      let isRefreshing = false;
      let currentPull = 0;
      const PULL_THRESHOLD = 64;
      const MAX_PULL = 84;

      function getActiveScrollTop() {
        const winScroll = window.pageYOffset || (document.documentElement ? document.documentElement.scrollTop : 0) || (document.body ? document.body.scrollTop : 0) || 0;
        if (winScroll > 0) return winScroll;

        // 若當前在特定 tab 且內部表格/容器有滾動，檢查該滾動容器
        const activeTableContainer = document.querySelector('.mobile-h5-app.pokemon-active .pokemon-table-container, .mobile-h5-app.pokemon-active .table-container');
        if (activeTableContainer && activeTableContainer.scrollTop > 0) {
          return activeTableContainer.scrollTop;
        }

        const activePanel = document.querySelector('.mobile-h5-app .view-panel:not([style*="display: none"]):not([style*="display:none"])');
        if (activePanel && activePanel.scrollTop > 0) {
          return activePanel.scrollTop;
        }
        return 0;
      }

      function updatePtrUI(dist) {
        if (!ptrEl) return;
        if (dist <= 0) {
          ptrEl.style.transform = 'translate(-50%, -64px)';
          ptrEl.style.opacity = '0';
          ptrEl.classList.remove('ptr-active');
          const icon = ptrEl.querySelector('.ptr-icon');
          if (icon) icon.style.transform = 'rotate(0deg)';
          return;
        }

        ptrEl.classList.add('ptr-active');
        const progress = Math.min(1, dist / PULL_THRESHOLD);
        ptrEl.style.opacity = `${Math.min(1, progress * 1.3)}`;
        ptrEl.style.transform = `translate(-50%, ${dist - 44}px) scale(${0.72 + progress * 0.28})`;
        const icon = ptrEl.querySelector('.ptr-icon');
        if (icon) {
          icon.style.transform = `rotate(${progress * 280}deg)`;
        }
      }

      document.addEventListener('touchstart', (e) => {
        if (isRefreshing || !e.touches || !e.touches[0]) return;
        // 嚴格判定：只有在最頂部時才允許判斷觸發下拉刷新
        if (getActiveScrollTop() > 2) {
          isTracking = false;
          return;
        }

        // 避免在開啟的側邊欄或彈窗內誤觸發全頁下拉刷新
        const target = e.target;
        if (target && target.closest && target.closest('.pokemon-filter-sidebar:not(.collapsed), .recipe-filter-sidebar:not(.collapsed), .ladder-fixed-sidebar:not(.collapsed), .modal-overlay.active, .subskill-sheet-modal.active, .appraisal-modal-overlay.active')) {
          isTracking = false;
          return;
        }

        isTracking = true;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        currentPull = 0;
        ptrEl.classList.remove('ptr-refreshing');
        ptrEl.style.transition = 'none';
      }, { passive: true });

      document.addEventListener('touchmove', (e) => {
        if (!isTracking || isRefreshing || !e.touches || !e.touches[0]) return;
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = currentY - touchStartY;
        const deltaX = currentX - touchStartX;

        // 若為向上滑動或橫向左右滑動，立即取消並還原
        if (deltaY <= 0 || Math.abs(deltaX) > deltaY) {
          if (currentPull > 0) {
            currentPull = 0;
            updatePtrUI(0);
          }
          return;
        }

        // 再次確認是否仍在最頂部
        if (getActiveScrollTop() > 2) {
          isTracking = false;
          currentPull = 0;
          updatePtrUI(0);
          return;
        }

        // 阻尼係數計算下拉位移
        currentPull = Math.min(MAX_PULL, Math.pow(deltaY, 0.8) * 1.8);
        updatePtrUI(currentPull);
      }, { passive: true });

      document.addEventListener('touchend', () => {
        if (!isTracking || isRefreshing) return;
        isTracking = false;

        if (currentPull >= PULL_THRESHOLD) {
          // 達到下拉刷新閥值：鎖定展示旋轉動畫並執行刷新
          isRefreshing = true;
          ptrEl.classList.add('ptr-refreshing');
          ptrEl.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
          ptrEl.style.transform = `translate(-50%, ${PULL_THRESHOLD - 36}px)`;

          setTimeout(() => {
            try {
              window.location.reload();
            } catch (err) {
              window.location.href = window.location.href;
            }
          }, 550);
        } else {
          // 未達閥值：平滑彈回頂部隱藏
          ptrEl.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
          updatePtrUI(0);
        }
        currentPull = 0;
      }, { passive: true });

      window.initPullToRefresh = initPullToRefresh;
      PokemonApp.initPullToRefresh = initPullToRefresh;
    }

    initSkillTooltips();
    initBackToTop();
    initPullToRefresh();
    PokemonApp.initBackToTop = initBackToTop;
    PokemonApp.initPullToRefresh = initPullToRefresh;
  });
}

/* ═════════════════════════════════════════════════════════════════════════
   圖鑑寶可夢懸浮窗：自訂副技能評測、六維強度評分與食材加成算法展示
   (Pokédex Detail & Appraisal Modal with Real-time Ingredient Breakdown)
   ═════════════════════════════════════════════════════════════════════════ */

const POKEDEX_MODAL_NATURES = [
  { name: '坦率', name_en: 'Hardy', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '孤僻', name_en: 'Lonely', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'speed', debuffType: 'energy' },
  { name: '勇敢', name_en: 'Brave', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'speed', debuffType: 'exp' },
  { name: '固執', name_en: 'Adamant', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'speed', debuffType: 'ingredient' },
  { name: '頑皮', name_en: 'Naughty', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'speed', debuffType: 'skill' },
  { name: '大膽', name_en: 'Bold', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'energy', debuffType: 'speed' },
  { name: '淘氣', name_en: 'Impish', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'energy', debuffType: 'ingredient' },
  { name: '樂天', name_en: 'Lax', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'energy', debuffType: 'skill' },
  { name: '內斂', name_en: 'Modest', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'ingredient', debuffType: 'speed' },
  { name: '慢吞吞', name_en: 'Mild', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'ingredient', debuffType: 'energy' },
  { name: '冷靜', name_en: 'Quiet', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'ingredient', debuffType: 'exp' },
  { name: '馬虎', name_en: 'Rash', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'ingredient', debuffType: 'skill' },
  { name: '溫和', name_en: 'Calm', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'skill', debuffType: 'speed' },
  { name: '溫燥', name_en: 'Gentle', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'skill', debuffType: 'energy' },
  { name: '慎重', name_en: 'Careful', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'skill', debuffType: 'ingredient' },
  { name: '浮躁', name_en: 'Sassy', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'skill', debuffType: 'exp' },
  { name: '膽小', name_en: 'Timid', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'exp', debuffType: 'speed' },
  { name: '爽朗', name_en: 'Jolly', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'exp', debuffType: 'ingredient' },
  { name: '急躁', name_en: 'Hasty', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'exp', debuffType: 'energy' },
  { name: '天真', name_en: 'Naive', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'exp', debuffType: 'skill' },
  { name: '害羞', name_en: 'Bashful', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '認真', name_en: 'Docile', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '勤奮', name_en: 'Serious', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '沉著', name_en: 'Quirky', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' }
];

const POKEDEX_MODAL_SUBSKILLS = [
  // 金色技能 (Tier 1 Gold)
  { name: '樹果數量S', name_en: 'Berry Finding S', tier: 'gold', desc: '幫忙時發現的樹果數量增加1個' },
  { name: '幫手獎勵', name_en: 'Helping Bonus', tier: 'gold', desc: '隊伍全員的幫忙時間縮短5%' },
  { name: '睡眠EXP獎勵', name_en: 'Sleep EXP Bonus', tier: 'gold', desc: '睡眠研究獲得的EXP提升14%' },
  { name: '活力回復獎勵', name_en: 'Energy Recovery Bonus', tier: 'gold', desc: '隊伍全員睡眠活力回復量提升14%' },
  { name: '夢之碎片獎勵', name_en: 'Dream Shard Bonus', tier: 'gold', desc: '睡眠研究獲得的夢之碎片增加6%' },
  { name: '研究EXP獎勵', name_en: 'Research EXP Bonus', tier: 'gold', desc: '睡眠研究獲得的研究EXP增加6%' },
  { name: '技能等級提升M', name_en: 'Skill Level Up M', tier: 'gold', desc: '主技能等級提升2級' },
  // 藍色技能 (Tier 2 Silver/Blue)
  { name: '幫忙速度M', name_en: 'Helping Speed M', tier: 'blue', desc: '幫忙時間縮短14%' },
  { name: '食材機率提升M', name_en: 'Ingredient Finder M', tier: 'blue', desc: '發現食材的機率大幅提升 (+36%)' },
  { name: '技能機率提升M', name_en: 'Skill Trigger M', tier: 'blue', desc: '發動主技能的機率大幅提升' },
  { name: '技能等級提升S', name_en: 'Skill Level Up S', tier: 'blue', desc: '主技能等級提升1級' },
  { name: '持有上限提升L', name_en: 'Inventory Up L', tier: 'blue', desc: '最大持有數量增加18' },
  { name: '持有上限提升M', name_en: 'Inventory Up M', tier: 'blue', desc: '最大持有數量增加12' },
  // 白色技能 (Tier 3 White)
  { name: '幫忙速度S', name_en: 'Helping Speed S', tier: 'white', desc: '幫忙時間縮短7%' },
  { name: '食材機率提升S', name_en: 'Ingredient Finder S', tier: 'white', desc: '發現食材的機率小幅提升 (+18%)' },
  { name: '技能機率提升S', name_en: 'Skill Trigger S', tier: 'white', desc: '發動主技能的機率小幅提升' },
  { name: '持有上限提升S', name_en: 'Inventory Up S', tier: 'white', desc: '最大持有數量增加6' },
  { name: '活力回復提升S', name_en: 'Energy Recovery Up S', tier: 'white', desc: '自身的活力回復量提升' }
];

let pokedexModalState = {
  pkmId: null,
  pkm: null,
  level: 30,
  nature: '坦率',
  subskills: ['', '', '', '', ''],
  skillLevel: 1,
  ribbon: 0,
  ingSlots: [0, 0, 0] // 0, 1, 2 indices in pkm.ingredients
};
let pokedexActiveSubskillSlot = 1;

function getPokedexMainSkillMaxLvl(skillName) {
  if (!skillName) return 6;
  if (skillName.includes('能量充填') || skillName.includes('Charge Strength')) return 7;
  if (skillName.includes('食材獲取') || skillName.includes('Ingredient Magnet')) return 7;
  if (skillName.includes('食材精選') || skillName.includes('Ingredient Draw')) return 7;
  if (skillName.includes('夢之碎片') || skillName.includes('Dream Shard')) return 7;
  if (skillName.includes('料理等級') || skillName.includes('Cooking Power')) return 7;
  return 6;
}

function parsePokedexIntervalToSec(intervalStr) {
  if (!intervalStr || intervalStr === '--') return 3600;
  const parts = intervalStr.split(':').map(n => parseInt(n, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseInt(intervalStr, 10) || 3600;
}

function formatPokedexIntervalSec(totalSec) {
  if (!totalSec || totalSec <= 0) return '00:00';
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function openPokemonDetailModal(pokemonId) {
  const pokemons = PokemonApp.allPokemons || window.allPokemons || [];
  const pkm = pokemons.find(p => String(p.id) === String(pokemonId) || p.formatted_no === pokemonId || p.name_cn === pokemonId || p.name_en === pokemonId);
  if (!pkm) return;

  pokedexModalState.pkmId = pkm.id;
  pokedexModalState.pkm = pkm;
  pokedexModalState.level = 30;
  pokedexModalState.skillLevel = 1;
  pokedexModalState.ribbon = 0;
  pokedexModalState.ingSlots = [0, 0, 0];

  // 根據專長給予智慧推薦預設值
  const spec = pkm.specialty || '';
  if (spec.includes('食材') || spec === 'Ingredients') {
    pokedexModalState.nature = '冷靜';
    pokedexModalState.subskills = ['食材機率提升M', '幫手獎勵', '食材機率提升S', '幫忙速度M', '持有上限提升L'];
  } else if (spec.includes('樹果') || spec === 'Berries') {
    pokedexModalState.nature = '固執';
    pokedexModalState.subskills = ['樹果數量S', '幫手獎勵', '幫忙速度M', '幫忙速度S', '持有上限提升L'];
  } else {
    pokedexModalState.nature = '自大';
    pokedexModalState.subskills = ['技能機率提升M', '幫手獎勵', '技能機率提升S', '幫忙速度M', '持有上限提升L'];
  }

  let modalEl = document.getElementById('pokedex-detail-modal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'pokedex-detail-modal';
    modalEl.className = 'pokedex-modal-backdrop';
    document.body.appendChild(modalEl);
  }

  modalEl.style.display = 'flex';
  try { document.body.style.overflow = 'hidden'; } catch (e) {}

  renderPokedexDetailModalContent();
}

function closePokemonDetailModal() {
  const modalEl = document.getElementById('pokedex-detail-modal');
  if (modalEl) {
    modalEl.style.display = 'none';
    try { document.body.style.overflow = ''; } catch (e) {}
  }
}

function applyPokedexGodPreset() {
  const pkm = pokedexModalState.pkm;
  if (!pkm) return;
  const spec = pkm.specialty || '';
  pokedexModalState.level = 60;
  pokedexModalState.ribbon = 4;
  pokedexModalState.skillLevel = getPokedexMainSkillMaxLvl(pkm.main_skill);
  pokedexModalState.ingSlots = [0, 0, 0];

  if (spec.includes('食材') || spec === 'Ingredients') {
    pokedexModalState.nature = '冷靜';
    pokedexModalState.subskills = ['食材機率提升M', '幫手獎勵', '食材機率提升S', '幫忙速度M', '持有上限提升L'];
  } else if (spec.includes('樹果') || spec === 'Berries') {
    pokedexModalState.nature = '固執';
    pokedexModalState.subskills = ['樹果數量S', '幫手獎勵', '幫忙速度M', '幫忙速度S', '持有上限提升L'];
  } else {
    pokedexModalState.nature = '自大';
    pokedexModalState.subskills = ['技能機率提升M', '幫手獎勵', '技能機率提升S', '幫忙速度M', '持有上限提升L'];
  }
  pokedexActiveSubskillSlot = 1;

  const slider = document.getElementById('pokedex-level-slider');
  const valText = document.getElementById('pokedex-level-val-text');
  if (slider) slider.value = pokedexModalState.level;
  if (valText) valText.textContent = pokedexModalState.level;

  const natureSelect = document.getElementById('pokedex-poke-nature');
  if (natureSelect) natureSelect.value = pokedexModalState.nature;

  const skillSelect = document.getElementById('pokedex-poke-skill-level');
  if (skillSelect) skillSelect.value = pokedexModalState.skillLevel;

  const ribbonSelect = document.getElementById('pokedex-poke-ribbon');
  if (ribbonSelect) ribbonSelect.value = pokedexModalState.ribbon;

  syncPokedexCustomSelects();
  renderPokedexIngredientStrip();
  updatePokedexSubskillUI();
  updatePokedexModalAppraisalLive();
}

function syncPokedexCustomSelects() {
  ['pokedex-poke-skill-level', 'pokedex-poke-nature', 'pokedex-poke-ribbon'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el._customized) {
      el.dispatchEvent(new Event('sync-ui'));
    }
  });
}

function applyPokedexResetPreset() {
  pokedexModalState.level = 30;
  pokedexModalState.nature = '坦率';
  pokedexModalState.subskills = ['', '', '', '', ''];
  pokedexModalState.skillLevel = 1;
  pokedexModalState.ribbon = 0;
  pokedexModalState.ingSlots = [0, 0, 0];
  pokedexActiveSubskillSlot = 1;

  const slider = document.getElementById('pokedex-level-slider');
  const valText = document.getElementById('pokedex-level-val-text');
  if (slider) slider.value = pokedexModalState.level;
  if (valText) valText.textContent = pokedexModalState.level;

  const natureSelect = document.getElementById('pokedex-poke-nature');
  if (natureSelect) natureSelect.value = pokedexModalState.nature;

  const skillSelect = document.getElementById('pokedex-poke-skill-level');
  if (skillSelect) skillSelect.value = pokedexModalState.skillLevel;

  const ribbonSelect = document.getElementById('pokedex-poke-ribbon');
  if (ribbonSelect) ribbonSelect.value = pokedexModalState.ribbon;

  syncPokedexCustomSelects();
  renderPokedexIngredientStrip();
  updatePokedexSubskillUI();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalLevel(val) {
  pokedexModalState.level = Math.max(1, Math.min(100, parseInt(val, 10) || 1));
  const slider = document.getElementById('pokedex-level-slider');
  const valText = document.getElementById('pokedex-level-val-text');
  if (slider && slider.value != pokedexModalState.level) slider.value = pokedexModalState.level;
  if (valText) valText.textContent = pokedexModalState.level;
  updatePokedexSubskillUI();
  renderPokedexIngredientStrip();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalNature(val) {
  pokedexModalState.nature = val || '坦率';
  const natureSelect = document.getElementById('pokedex-poke-nature');
  if (natureSelect && natureSelect.value !== pokedexModalState.nature) natureSelect.value = pokedexModalState.nature;
  syncPokedexCustomSelects();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalSubskill(idx, val) {
  pokedexModalState.subskills[idx] = val || '';
  updatePokedexSubskillUI();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalSkillLevel(val) {
  pokedexModalState.skillLevel = parseInt(val, 10) || 1;
  const skillSelect = document.getElementById('pokedex-poke-skill-level');
  if (skillSelect && skillSelect.value != pokedexModalState.skillLevel) skillSelect.value = pokedexModalState.skillLevel;
  syncPokedexCustomSelects();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalRibbon(val) {
  pokedexModalState.ribbon = parseInt(val, 10) || 0;
  const ribbonSelect = document.getElementById('pokedex-poke-ribbon');
  if (ribbonSelect && ribbonSelect.value != pokedexModalState.ribbon) ribbonSelect.value = pokedexModalState.ribbon;
  syncPokedexCustomSelects();
  updatePokedexModalAppraisalLive();
}

function setPokedexModalIng(slotIdx, val) {
  pokedexModalState.ingSlots[slotIdx] = parseInt(val, 10) || 0;
  renderPokedexIngredientStrip();
  updatePokedexModalAppraisalLive();
}

function selectPokedexSubskillSlot(slotNum) {
  pokedexActiveSubskillSlot = parseInt(slotNum, 10) || 1;
  updatePokedexSubskillUI();
}

function choosePokedexSubskill(skName) {
  if (!skName) return;
  if (pokedexModalState.subskills.includes(skName)) return;

  pokedexModalState.subskills[pokedexActiveSubskillSlot - 1] = skName;

  let nextEmpty = -1;
  for (let s = 1; s <= 5; s++) {
    if (!pokedexModalState.subskills[s - 1]) {
      nextEmpty = s;
      break;
    }
  }
  if (nextEmpty !== -1) {
    pokedexActiveSubskillSlot = nextEmpty;
  } else if (pokedexActiveSubskillSlot < 5) {
    pokedexActiveSubskillSlot += 1;
  } else {
    pokedexActiveSubskillSlot = 1;
  }

  updatePokedexSubskillUI();
  updatePokedexModalAppraisalLive();
}

function clearAllPokedexSubskills() {
  pokedexModalState.subskills = ['', '', '', '', ''];
  pokedexActiveSubskillSlot = 1;
  updatePokedexSubskillUI();
  updatePokedexModalAppraisalLive();
}

function renderPokedexIngredientStrip() {
  const container = document.getElementById('pokedex-ing-strip');
  if (!container) return;
  const pkm = pokedexModalState.pkm;
  if (!pkm) {
    container.innerHTML = '<span class="box-ing-placeholder-slot">--</span>';
    return;
  }

  const ingList = (pkm.ingredients && pkm.ingredients.length > 0)
    ? pkm.ingredients
    : [{ name: '特選蘋果' }, { name: '暖暖薑' }, { name: '美味尾巴' }];

  const ingA = ingList[0] || { name: '特選蘋果' };
  const ingB = ingList[1] || ingA;
  const ingC = ingList[2] || ingB || ingA;

  const rawLv30 = [ingA, ingB];
  const uniqueLv30 = Array.from(new Set(rawLv30.map(i => i.name))).map(n => rawLv30.find(i => i.name === n));

  const rawLv60 = [ingA, ingB, ingC];
  const uniqueLv60 = Array.from(new Set(rawLv60.map(i => i.name))).map(n => rawLv60.find(i => i.name === n));

  const slots = [
    { level: 1, allowed: [ingA], slotIdx: 0, tag: 'Lv.1' },
    { level: 30, allowed: uniqueLv30, slotIdx: 1, tag: 'Lv.30' },
    { level: 60, allowed: uniqueLv60, slotIdx: 2, tag: 'Lv.60' }
  ];

  container.innerHTML = slots.map((slot, sIdx) => {
    const isUnlocked = pokedexModalState.level >= slot.level;
    const currentOptIdx = pokedexModalState.ingSlots[slot.slotIdx] || 0;

    const optButtons = slot.allowed.map((ing, optIdx) => {
      const isSelected = currentOptIdx === optIdx;
      const ingDisplayName = window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
      const iconUrl = ing.icon || (window.I18N && window.I18N.getIngredientIcon(ing.name)) || '';
      return `
        <button type="button" class="box-ing-opt-btn ${isSelected ? 'active' : ''}" data-slot-idx="${slot.slotIdx}" data-opt-idx="${optIdx}" title="${escapeHtml(ingDisplayName)}" aria-label="${escapeHtml(ingDisplayName)}" onclick="window.PokemonApp.setPokedexModalIng(${slot.slotIdx}, ${optIdx})">
          <img src="${iconUrl}" class="box-ing-opt-icon" alt="${escapeHtml(ingDisplayName)}" loading="lazy">
        </button>
      `;
    }).join('');

    return `
      <div class="box-ing-slot-group ${isUnlocked ? '' : 'slot-locked'}" style="${isUnlocked ? '' : 'opacity:0.6;'}">
        <span class="box-ing-lvl-tag">${slot.tag}</span>
        <div class="box-ing-options-list">${optButtons}</div>
      </div>
      ${sIdx < 2 ? '<span class="box-ing-slot-sep">|</span>' : ''}
    `;
  }).join('');
}

function updatePokedexSubskillUI() {
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  const subskills = pokedexModalState.subskills;
  const currentLevel = pokedexModalState.level;
  const slotLevels = [10, 25, 50, 70, 80];

  // 1. 更新 5 個插槽按鈕
  const slotContainer = document.getElementById('pokedex-subskill-slots-row');
  if (slotContainer) {
    slotContainer.innerHTML = slotLevels.map((lvl, idx) => {
      const slotNum = idx + 1;
      const isActive = slotNum === pokedexActiveSubskillSlot;
      const skName = subskills[idx] || '';
      const isUnlocked = currentLevel >= lvl;

      let badgeHtml = '';
      if (!skName) {
        badgeHtml = `<span class="slot-val-badge slot-val-empty">${isEN ? '-- None --' : '-- 未解鎖 --'}</span>`;
      } else {
        const skObj = POKEDEX_MODAL_SUBSKILLS.find(s => s.name === skName);
        const tier = skObj ? skObj.tier : 'white';
        const skLabel = isEN ? (skObj ? skObj.name_en : skName) : skName;
        badgeHtml = `<span class="slot-val-badge box-subskill-pill subskill-${tier}">${escapeHtml(skLabel)}</span>`;
      }

      return `
        <button type="button" class="box-subskill-slot-btn ${isActive ? 'active' : ''} ${isUnlocked ? '' : 'slot-under-lvl'}" data-slot="${slotNum}" onclick="window.PokemonApp.selectPokedexSubskillSlot(${slotNum})" title="Lv.${lvl} ${isUnlocked ? '' : (isEN ? '(Level not reached)' : '(等級未達標)')}">
          <span class="slot-lvl-header">Lv.${lvl}</span>
          ${badgeHtml}
        </button>
      `;
    }).join('');
  }

  // 2. 獲取已被選取的副技能
  const usedSkills = new Set();
  subskills.forEach(s => { if (s) usedSkills.add(s); });

  // 3. 更新平鋪選擇盤
  ['gold', 'blue', 'white'].forEach(tier => {
    const chipContainer = document.getElementById(`pokedex-subskill-chips-${tier}`);
    if (!chipContainer) return;

    const skillsInTier = POKEDEX_MODAL_SUBSKILLS.filter(s => s.tier === tier);
    chipContainer.innerHTML = skillsInTier.map(sk => {
      const skDisplayName = isEN ? sk.name_en : sk.name;
      const isUsed = usedSkills.has(sk.name);
      return `
        <button type="button" class="box-subskill-chip subskill-${tier} ${isUsed ? 'in-use' : ''}" data-name="${escapeHtml(sk.name)}" ${isUsed ? 'disabled' : ''} onclick="window.PokemonApp.choosePokedexSubskill('${escapeHtml(sk.name)}')" title="${escapeHtml(skDisplayName)}${isUsed ? (isEN ? ' (Selected)' : '（已選用）') : ''}">
          <span>${escapeHtml(skDisplayName)}</span>
          ${isUsed ? '<span style="font-size:10px;opacity:0.8;margin-left:2px;">✓</span>' : ''}
        </button>
      `;
    }).join('');
  });
}

function calculatePokedexIngredientFormulas() {
  const pkm = pokedexModalState.pkm;
  if (!pkm) return null;

  const currentLevel = pokedexModalState.level;
  const currentNature = pokedexModalState.nature;
  const subskills = pokedexModalState.subskills;
  const ribbon = pokedexModalState.ribbon;
  const skillLevel = pokedexModalState.skillLevel;
  const ingSlots = pokedexModalState.ingSlots;

  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

  // 1. 基礎數值
  const baseIngRate = parseFloat(pkm.ingredient_rate || '0') || 20.0;
  const baseSkillRate = parseFloat(pkm.skill_rate || '0') || 2.0;
  const baseIntervalSec = parsePokedexIntervalToSec(pkm.interval);

  // 2. 副技能加成判定 (Lv.10, Lv.25, Lv.50, Lv.70, Lv.80)
  const slotLevels = [10, 25, 50, 70, 80];
  let subskillIngBonus = 0;
  let subskillSpeedBonus = 0;
  let subskillSkillBonus = 0;
  const activeSubskillNames = [];

  subskills.forEach((sName, idx) => {
    if (!sName) return;
    const isUnlocked = currentLevel >= slotLevels[idx];
    if (isUnlocked) {
      activeSubskillNames.push(sName);
      if (sName === '食材機率提升M') subskillIngBonus += 36;
      if (sName === '食材機率提升S') subskillIngBonus += 18;
      if (sName === '幫忙速度M') subskillSpeedBonus += 14;
      if (sName === '幫忙速度S') subskillSpeedBonus += 7;
      if (sName === '幫手獎勵') subskillSpeedBonus += 5;
      if (sName === '技能機率提升M') subskillSkillBonus += 36;
      if (sName === '技能機率提升S') subskillSkillBonus += 18;
    }
  });

  // 3. 性格修正
  const natureObj = POKEDEX_MODAL_NATURES.find(n => n.name === currentNature) || { buffType: 'none', debuffType: 'none' };
  let natureIngMult = 1.0;
  if (natureObj.buffType === 'ingredient') natureIngMult = 1.20;
  else if (natureObj.debuffType === 'ingredient') natureIngMult = 0.80;

  let natureSpeedMult = 1.0;
  if (natureObj.buffType === 'speed') natureSpeedMult = 0.9090909;
  else if (natureObj.debuffType === 'speed') natureSpeedMult = 1.10;

  let natureSkillMult = 1.0;
  if (natureObj.buffType === 'skill') natureSkillMult = 1.20;
  else if (natureObj.debuffType === 'skill') natureSkillMult = 0.80;

  // 4. 最終食材發動率
  const finalIngRate = baseIngRate * (1 + subskillIngBonus / 100) * natureIngMult;

  // 5. 幫忙速度與每日幫忙次數
  const levelSpeedDiscount = (currentLevel - 1) * 0.002;
  const speedReduction = Math.min(0.35, subskillSpeedBonus / 100);

  let ribbonDiscount = 0;
  if (ribbon > 0 && window.AppraisalLab && typeof window.AppraisalLab.getRibbonBonus === 'function') {
    const remEvos = window.AppraisalLab.getRemainingEvolutions(pkm);
    const rBonus = window.AppraisalLab.getRibbonBonus(ribbon, remEvos);
    ribbonDiscount = rBonus.speedDiscount || 0;
  }

  const effectiveIntervalSec = Math.max(600, Math.round(baseIntervalSec * (1 - levelSpeedDiscount) * (1 - speedReduction) * natureSpeedMult * (1 - ribbonDiscount)));
  const dailyHelps = 86400 / effectiveIntervalSec;
  const dailyIngDrops = dailyHelps * (finalIngRate / 100);

  // 6. 各槽位食材掉落計算
  const ingredientsList = pkm.ingredients || [];
  let unlockedSlotCount = 1;
  if (currentLevel >= 60) unlockedSlotCount = 3;
  else if (currentLevel >= 30) unlockedSlotCount = 2;

  const activeIngredientDetails = [];
  const summaryYieldMap = new Map();

  for (let s = 0; s < unlockedSlotCount; s++) {
    const ingChoiceIdx = ingSlots[s] || 0;
    const ingData = ingredientsList[ingChoiceIdx] || ingredientsList[0] || { name: '甜甜蜜', icon: '' };
    let count = 1;
    if (s === 0) count = parseInt(ingData.l1 || 1, 10);
    else if (s === 1) count = parseInt(ingData.l30 || ingData.l1 || 1, 10);
    else if (s === 2) count = parseInt(ingData.l60 || ingData.l30 || ingData.l1 || 1, 10);

    const ingName = isEN ? (window.I18N ? window.I18N.getIngredientName(ingData.name) : ingData.name) : ingData.name;
    const ingDailyCount = (dailyIngDrops * (count / unlockedSlotCount));

    activeIngredientDetails.push({
      slot: s + 1,
      name: ingName,
      rawName: ingData.name,
      icon: ingData.icon || '',
      count: count,
      dailyYield: ingDailyCount
    });

    const prev = summaryYieldMap.get(ingData.name) || { name: ingName, icon: ingData.icon || '', daily: 0 };
    prev.daily += ingDailyCount;
    summaryYieldMap.set(ingData.name, prev);
  }

  let totalDailyIngredients = 0;
  summaryYieldMap.forEach(item => {
    totalDailyIngredients += item.daily;
  });

  // 7. 主技能附加期望
  let mainSkillExtraDaily = 0;
  let mainSkillLabel = '';
  const finalSkillRate = baseSkillRate * (1 + subskillSkillBonus / 100) * natureSkillMult;
  const dailyTriggers = dailyHelps * (finalSkillRate / 100);

  if (pkm.main_skill && (pkm.main_skill.includes('食材獲取') || pkm.main_skill.includes('Ingredient Magnet'))) {
    const magnetTable = [6, 8, 11, 14, 17, 21, 24];
    const dropPerTrig = magnetTable[Math.min(skillLevel - 1, magnetTable.length - 1)] || 6;
    mainSkillExtraDaily = dailyTriggers * dropPerTrig;
    mainSkillLabel = `${isEN ? 'Magnet S' : '食材獲取S'} (Lv.${skillLevel})`;
  } else if (pkm.main_skill && (pkm.main_skill.includes('食材精選') || pkm.main_skill.includes('Ingredient Draw'))) {
    const drawTable = [4, 6, 8, 11, 14, 18, 18];
    const dropPerTrig = drawTable[Math.min(skillLevel - 1, drawTable.length - 1)] || 4;
    mainSkillExtraDaily = dailyTriggers * dropPerTrig;
    mainSkillLabel = `${isEN ? 'Draw S' : '食材精選S'} (Lv.${skillLevel})`;
  }

  return {
    baseIngRate,
    subskillIngBonus,
    natureIngMult,
    finalIngRate,
    baseIntervalSec,
    effectiveIntervalSec,
    dailyHelps,
    dailyIngDrops,
    unlockedSlotCount,
    activeIngredientDetails,
    summaryYieldList: Array.from(summaryYieldMap.values()),
    totalDailyIngredients,
    mainSkillExtraDaily,
    mainSkillLabel,
    dailyTriggers,
    baseSkillRate,
    subskillSkillBonus,
    natureSkillMult,
    finalSkillRate,
    levelSpeedDiscount,
    subskillSpeedBonus,
    natureSpeedMult,
    ribbonDiscount
  };
}

const STAGE3_INHERITED_MIN_LEVELS = {
  '大食花': 16, 'Victreebel': 16,
  '隆隆岩': 19, 'Golem': 19,
  '自爆磁怪': 23, 'Magnezone': 23,
  '耿鬼': 19, 'Gengar': 19,
  '艾路雷朵': 15, 'Gallade': 15,
  '鍬農炮蟲': 15, 'Vikavolt': 15,
  '巴布土撥': 14, 'Pawmot': 14
};

function getPokedexMinEvolutionLevel(pkm) {
  if (!pkm) return 1;
  const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || (pkm.name && pkm.name.en) || '';
  if (STAGE3_INHERITED_MIN_LEVELS[name]) {
    return STAGE3_INHERITED_MIN_LEVELS[name];
  }
  if (!pkm.evo_req) return 1;
  const match = pkm.evo_req.match(/Lv\.?\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10) || 1;
  }
  return 1;
}

function renderPokedexEvoGuardBadgeHTML(pkm, level) {
  const minLv = getPokedexMinEvolutionLevel(pkm);
  if (minLv <= 1) return '';
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
  const currentLevel = parseInt(level, 10) || 1;
  const isBelow = currentLevel < minLv;
  if (isBelow) {
    const tipTpl = t('pokedex.evo_guard_tip_below', '此形態最低進化等級為 Lv.{0}，點擊可快速調整至門檻等級');
    const tip = tipTpl.replace('{0}', minLv);
    const label = t('pokedex.evo_guard_below', '進化門檻 Lv.');
    return `<button type="button" class="pokedex-evo-guard-badge evo-warning" onclick="window.PokemonApp.setPokedexModalLevel(${minLv})" title="${tip}">[!] ${label}${minLv}</button>`;
  } else {
    const tipTpl = t('pokedex.evo_guard_tip_met', '已達此形態最低進化門檻 (Lv.{0}+)');
    const tip = tipTpl.replace('{0}', minLv);
    const label = t('pokedex.evo_guard_met', '已達門檻 Lv.');
    return `<span class="pokedex-evo-guard-badge evo-passed" title="${tip}">[✓] ${label}${minLv}+</span>`;
  }
}

function renderPokedexRibbonOptionsHTML(pkm, currentRibbon) {
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  let remainingEvos = 0;
  if (pkm) {
    if (typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRemainingEvolutions === 'function') {
      remainingEvos = window.AppraisalLab.getRemainingEvolutions(pkm);
    } else {
      const isFinal = pkm.is_final === '〇' || pkm.is_final === 'O' || pkm.is_final === 'o' || pkm.is_final === true || pkm.is_final === '1';
      remainingEvos = isFinal ? 0 : 1;
    }
  }

  const currentVal = parseInt(currentRibbon, 10) || 0;
  let opt2Text = '';
  let opt3Text = isEN ? '1000 hrs (+6 Carry Limit)' : '1000 小時 (+6 持有上限)';
  let opt4Text = '';

  if (!pkm) {
    opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed Boost)' : '500 小時 (+3 持有上限 · 幫速加成)';
    opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Max Speed Boost)' : '2000 小時 (+8 持有上限 · 幫速最大加成)';
  } else if (remainingEvos === 2) {
    opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed -11%)' : '500 小時 (+3 持有上限 · 幫速加成 -11%)';
    opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Speed -25%)' : '2000 小時 (+8 持有上限 · 幫速最大加成 -25%)';
  } else if (remainingEvos === 1) {
    opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed -5%)' : '500 小時 (+3 持有上限 · 幫速加成 -5%)';
    opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Speed -12%)' : '2000 小時 (+8 持有上限 · 幫速最大加成 -12%)';
  } else {
    opt2Text = isEN ? '500 hrs (+3 Carry Limit)' : '500 小時 (+3 持有上限)';
    opt4Text = isEN ? '2000 hrs (+8 Carry Limit)' : '2000 小時 (+8 持有上限)';
  }

  const optionsData = [
    { val: 0, text: isEN ? 'None (0h)' : '未佩戴 (0h)', icon: '' },
    { val: 1, text: isEN ? '200 hrs (+1 Carry Limit)' : '200 小時 (+1 持有上限)', icon: 'assets/ribbons/ribbon_lv1.png' },
    { val: 2, text: opt2Text, icon: 'assets/ribbons/ribbon_lv2.png' },
    { val: 3, text: opt3Text, icon: 'assets/ribbons/ribbon_lv3.png' },
    { val: 4, text: opt4Text, icon: 'assets/ribbons/ribbon_lv4.png' }
  ];

  return optionsData.map(o => `
    <option value="${o.val}" ${o.icon ? `data-icon="${o.icon}"` : ''} ${o.val === currentVal ? 'selected' : ''}>${escapeHtml(o.text)}</option>
  `).join('');
}

function renderPokedexStrategyCardHTML(pkm) {
  if (!pkm) return '';
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

  const specialty = pkm.specialty || '';
  let roleTitle = '';
  let roleDesc = '';
  let coreSkill = '';
  let coreSkillDesc = '';
  let recommendedSubs = [];
  let recommendedNatures = '';

  if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
    roleTitle = isEN ? 'Berry Specialist' : '樹果高速量產定位';
    roleDesc = isEN
      ? 'Primary scoring relies on high-speed berry output into Snorlax.'
      : '主要戰力仰賴高頻樹果產出累積能量，樹果數量與速度為絕對核心。';
    coreSkill = isEN ? 'Berry Finding S (BFS)' : '樹果數量S (BFS)';
    coreSkillDesc = isEN ? 'Mandatory god-tier skill (+1 berry per help)' : '核心必備神技 (每次幫忙樹果+1)';
    recommendedSubs = isEN
      ? ['Berry Finding S', 'Helping Bonus', 'Helping Speed M', 'Helping Speed S', 'Inventory Up L']
      : ['樹果數量S', '幫手獎勵', '幫忙速度M', '幫忙速度S', '持有上限提升L'];
    recommendedNatures = isEN ? 'Speed UP (Adamant / Brave / Naughty / Impish)' : '幫忙速度提升 (固執 / 勇敢 / 淘氣 / 慎重)';
  } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
    roleTitle = isEN ? 'Ingredient Supplier' : '料理食材專精供貨';
    roleDesc = isEN
      ? 'Supplies vital recipe ingredients consistently to sustain high-pot dishes.'
      : '專注於高階料理食譜所需食材之穩定產出，食材機率與背包上限至關重要。';
    coreSkill = isEN ? 'Ingredient Finder M' : '食材機率提升M';
    coreSkillDesc = isEN ? 'Directly boosts ingredient drop chance (+36%)' : '直接大幅提升食材掉落機率 (+36%)';
    recommendedSubs = isEN
      ? ['Ingredient Finder M', 'Ingredient Finder S', 'Helping Bonus', 'Helping Speed M', 'Inventory Up L']
      : ['食材機率提升M', '食材機率提升S', '幫手獎勵', '幫忙速度M', '持有上限提升L'];
    recommendedNatures = isEN ? 'Ingredient UP (Quiet / Modest / Mild / Rash)' : '食材發現率提升 (冷靜 / 內斂 / 慢吞吞 / 溫和)';
  } else {
    roleTitle = isEN ? 'Skill Trigger Specialist' : '高頻主技能輔助定位';
    roleDesc = isEN
      ? 'Relies on high skill trigger rate to activate decisive team support effects.'
      : '高頻觸發團隊充能、全員回復或強力戰術主技能，技能機率與等級為關鍵。';
    coreSkill = isEN ? 'Skill Trigger M' : '技能機率提升M';
    coreSkillDesc = isEN ? 'High-frequency activation (+36% trigger rate)' : '高頻發動核心 (+36% 技能機率)';
    recommendedSubs = isEN
      ? ['Skill Trigger M', 'Skill Trigger S', 'Helping Bonus', 'Helping Speed M', 'Inventory Up L']
      : ['技能機率提升M', '技能機率提升S', '幫手獎勵', '幫忙速度M', '持有上限提升L'];
    recommendedNatures = isEN ? 'Main Skill UP (Sassy / Calm / Careful / Gentle)' : '主技能機率提升 (自大 / 慎重 / 溫和 / 浮躁)';
  }

  return `
    <div class="pokedex-strategy-card">
      <div class="strategy-card-header">
        <span class="strategy-card-title font-bold">[★] ${roleTitle}</span>
        <span class="strategy-card-badge">${isEN ? 'Strategy Guide' : '最佳配置指南'}</span>
      </div>
      <div class="strategy-card-desc">${roleDesc}</div>
      <div class="strategy-details-grid">
        <div class="strategy-item">
          <span class="strategy-k">[★] ${isEN ? 'Core Skill' : '核心神技'}：</span>
          <span class="strategy-v font-bold text-gold">${coreSkill} <span class="strategy-hint">(${coreSkillDesc})</span></span>
        </div>
        <div class="strategy-item">
          <span class="strategy-k">[+] ${isEN ? 'Recommended' : '推薦副技'}：</span>
          <div class="strategy-chips-wrap">
            ${recommendedSubs.map(s => `<span class="strategy-chip">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
        <div class="strategy-item">
          <span class="strategy-k">[*] ${isEN ? 'Best Nature' : '契合性格'}：</span>
          <span class="strategy-v text-accent">${recommendedNatures}</span>
        </div>
      </div>
    </div>
  `;
}

function renderPokedexDetailModalContent() {
  const modalEl = document.getElementById('pokedex-detail-modal');
  if (!modalEl) return;
  const pkm = pokedexModalState.pkm;
  if (!pkm) return;

  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

  const pkmName = isEN ? (pkm.name_en || pkm.name_cn) : (pkm.name_cn || pkm.name_en);
  const specName = window.I18N ? window.I18N.getSpecialtyName(pkm.specialty) : pkm.specialty;
  const berry = (typeof getPokemonBerry === 'function') ? getPokemonBerry(pkm) : { name: '', icon: '' };
  const berryName = window.I18N ? window.I18N.getBerryName(berry.name) : berry.name;
  const iconUrl = (typeof getIconUrl === 'function') ? getIconUrl(pkm) : (pkm.icon_url || '');

  let specClass = 'spec-ingredient';
  if (pkm.specialty && (pkm.specialty.includes('樹果') || pkm.specialty === 'Berries')) {
    specClass = 'spec-berry';
  } else if (pkm.specialty && (pkm.specialty.includes('技能') || pkm.specialty === 'Skills')) {
    specClass = 'spec-skill';
  }

  // 6D 評估計算
  const chosenIngs = (pkm.ingredients || []).map((ing, i) => {
    const selIdx = pokedexModalState.ingSlots[i] || 0;
    return (pkm.ingredients && pkm.ingredients[selIdx]) ? pkm.ingredients[selIdx].name : (ing.name || '');
  });

  let evaluation = null;
  if (window.AppraisalLab && typeof window.AppraisalLab.evaluatePokemon === 'function') {
    evaluation = window.AppraisalLab.evaluatePokemon(pkm, pokedexModalState.level, pokedexModalState.nature, pokedexModalState.subskills, chosenIngs, pokedexModalState.ribbon, pokedexModalState.skillLevel);
  }

  if (!evaluation) {
    evaluation = {
      compositeScore: 75,
      grade: 'A',
      gradeTitle: isEN ? 'Solid Pick' : '實用良品 (Solid Pick)',
      gradeColor: '#10b981',
      scores: { berry: 60, ingredient: 70, skill: 65, speed: 65, growth: 60, roi: 65 }
    };
  }

  const radarSVG = (window.AppraisalLab && typeof window.AppraisalLab.renderRadarChartSVG === 'function')
    ? window.AppraisalLab.renderRadarChartSVG(evaluation.scores, 210, 185)
    : '';

  const formulaData = calculatePokedexIngredientFormulas();
  const maxSkillLvl = getPokedexMainSkillMaxLvl(pkm.main_skill);

  modalEl.innerHTML = `
    <div class="pokedex-modal-backdrop-dismiss" onclick="window.PokemonApp.closePokemonDetailModal()"></div>
    <div class="box-modal-dialog pokedex-modal-dialog" role="dialog" aria-modal="true">
      <!-- 頂部標題列 (樹果與類型上下展示、單行水平基礎數值、右上角重置預設) -->
      <div class="box-modal-header pokedex-modal-header">
        <div class="pokedex-modal-header-main">
          <div class="box-modal-title pokedex-modal-title">
            ${iconUrl ? `<img src="${iconUrl}" class="pokedex-header-avatar" alt="${escapeHtml(pkmName)}" loading="lazy">` : ''}
            <div class="pokedex-header-info">
              <div class="pokedex-header-no">No.${pkm.formatted_no || ''}</div>
              <div class="pokedex-header-name-row">
                <span class="pokedex-header-pkm-name font-bold">${escapeHtml(pkmName)}</span>
              </div>
            </div>
            <div class="pokedex-header-tags pokedex-header-berry-spec-group">
              <span class="pokedex-tag pokedex-tag-berry" title="${escapeHtml(berryName)}">
                ${berry.icon ? `<img src="${berry.icon}" class="pokedex-berry-icon-img" alt="${escapeHtml(berryName)}" title="${escapeHtml(berryName)}" loading="lazy">` : ''}
              </span>
              <span class="pokedex-tag pokedex-tag-spec ${specClass}">${escapeHtml(specName)}</span>
            </div>
          </div>

          <!-- 基礎數值橫向列 (幫忙間隔、食材機率、技能機率) -->
          <div class="pokedex-header-stats-row">
            <div class="pokedex-header-stat-item">
              <span class="header-stat-k">${t('th.interval', '幫忙間隔')}</span>
              <span class="header-stat-v font-bold" id="pokedex-stat-interval">${formatHelpInterval(formulaData ? formulaData.effectiveIntervalSec : pkm.interval)}</span>
            </div>
            <div class="pokedex-header-stat-item">
              <span class="header-stat-k">${t('th.ingredient_rate', '食材機率')}</span>
              <span class="header-stat-v font-bold" id="pokedex-stat-ingredient-rate">${formulaData && typeof formulaData.finalIngRate === 'number' ? formulaData.finalIngRate.toFixed(2) + '%' : (pkm.ingredient_rate || '--')}</span>
            </div>
            <div class="pokedex-header-stat-item">
              <span class="header-stat-k">${t('th.skill_rate', '技能機率')}</span>
              <span class="header-stat-v font-bold" id="pokedex-stat-skill-rate">${formulaData && typeof formulaData.finalSkillRate === 'number' ? formulaData.finalSkillRate.toFixed(2) + '%' : (pkm.skill_rate || '--')}</span>
            </div>
          </div>
        </div>

        <div class="pokedex-header-actions">
          <div class="pokedex-header-verdict-badge" id="pokedex-header-verdict-badge" style="border-color: ${evaluation.gradeColor};">
            <span class="verdict-grade pokedex-header-grade-text" style="color: ${evaluation.gradeColor};">${evaluation.grade}</span>
            <span class="pokedex-header-score-text"><span class="verdict-num font-bold">${evaluation.compositeScore}</span>/100</span>
          </div>
          <button type="button" class="box-modal-close pokedex-modal-close-btn" onclick="window.PokemonApp.closePokemonDetailModal()" aria-label="${isEN ? 'Close' : '關閉'}">✕</button>
        </div>
      </div>

      <!-- 彈窗內容主體 (雙欄/響應式) -->
      <div class="box-modal-body pokedex-modal-body">
        <!-- 左欄：食材產能算法拆解與最佳配置指南 (空間最大化) -->
        <div class="pokedex-modal-col pokedex-left-col">
          <!-- 食材產能算法拆解與策略指南 -->
          <div class="pokedex-calc-formula-card" id="pokedex-calc-formula-container">
            ${renderPokedexFormulaBreakdownHTML(formulaData, pkm)}
          </div>
        </div>

        <!-- 右欄：表單控制項 (等級軌道圖釘、食材平鋪、主技能一行展示、性格、睡飽飽獎章、副技能) -->
        <div class="pokedex-modal-col pokedex-right-col box-modal-form">
          <div class="box-form-grid pokedex-controls-container">
            <!-- 1. 等級軌道錨定滑桿 + 畢業神配置與重置預設快捷按鈕 -->
            <div class="box-form-group box-full-width pokedex-level-ctrl-group">
              <div class="pokedex-level-header-row">
                <div class="pokedex-level-header-left">
                  <label class="box-form-label" for="pokedex-level-slider" style="margin-bottom:0;">${t('pokedex.level_slider', '等級設定')} (<span class="pokedex-val-badge font-bold">Lv. <span id="pokedex-level-val-text">${pokedexModalState.level}</span></span>)</label>
                  <button type="button" class="pokedex-btn-preset preset-god" onclick="window.PokemonApp.applyPokedexGodPreset()" title="${t('pokedex.preset_god', '畢業神配置')}">[★] ${t('pokedex.preset_god', '畢業神配置')}</button>
                </div>
                <div class="pokedex-level-header-right">
                  <button type="button" class="pokedex-header-reset-btn pokedex-btn-preset preset-reset" onclick="window.PokemonApp.applyPokedexResetPreset()" title="${t('pokedex.preset_reset', '重置預設')}">[↺] ${t('pokedex.preset_reset', '重置預設')}</button>
                </div>
              </div>
              <div class="pokedex-anchored-slider-wrap">
                <input type="range" id="pokedex-level-slider" min="1" max="100" value="${pokedexModalState.level}" class="pokedex-slider" oninput="window.PokemonApp.setPokedexModalLevel(this.value)">
                <div class="pokedex-track-pins-bar" id="pokedex-track-pins-bar">
                  ${[10, 25, 30, 50, 60, 70, 80, 100].map(lv => {
                    const pct = ((lv - 1) / 99) * 100;
                    const isMilestone = [30, 50, 60, 80, 100].includes(lv);
                    const isActive = pokedexModalState.level === lv;
                    return `
                      <button type="button" class="pokedex-track-pin-btn ${isActive ? 'active' : ''} ${isMilestone ? 'pin-milestone' : ''}" data-pin-lv="${lv}" style="left: ${pct.toFixed(2)}%;" onclick="window.PokemonApp.setPokedexModalLevel(${lv})" title="Lv.${lv}">
                        <span class="track-pin-tick"></span>
                        <span class="track-pin-label">${lv}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- 2. 食材組合平鋪選擇器 -->
            <div class="box-form-group box-full-width box-form-row-inline">
              <label class="box-form-label box-form-inline-label">${t('box.modal_poke_ing', '食材組合')}</label>
              <div class="box-ing-strip" id="pokedex-ing-strip"></div>
            </div>

            <!-- 3. 主技能與睡飽飽獎章並列行 (主技能無外框、選單貼近標題、睡飽飽獎章移至主技能右側) -->
            <div class="box-form-group box-full-width box-form-row-inline box-mainskill-row pokedex-mainskill-ribbon-row">
              <div class="pokedex-inline-unit pokedex-mainskill-unit">
                <label class="box-form-label box-form-inline-label" for="pokedex-poke-skill-level">${t('box.modal_main_skill_short', '主技能')}</label>
                <span id="pokedex-poke-main-skill-name" class="box-mainskill-name-badge">${escapeHtml(pkm.main_skill || '--')}</span>
                <div class="box-mainskill-select-wrap">
                  <select id="pokedex-poke-skill-level" class="box-form-select box-mainskill-select pokedex-custom-select" onchange="window.PokemonApp.setPokedexModalSkillLevel(this.value)">
                    ${Array.from({ length: maxSkillLvl }, (_, i) => i + 1).map(lvl => `
                      <option value="${lvl}" ${pokedexModalState.skillLevel === lvl ? 'selected' : ''}>Lv. ${lvl}</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <div class="pokedex-inline-unit pokedex-ribbon-unit">
                <label class="box-form-label box-form-inline-label" for="pokedex-poke-ribbon">${t('box.modal_poke_ribbon', '睡飽飽獎章')}</label>
                <div class="box-form-inline-control">
                  <select id="pokedex-poke-ribbon" class="box-form-select pokedex-custom-select" onchange="window.PokemonApp.setPokedexModalRibbon(this.value)">
                    ${renderPokedexRibbonOptionsHTML(pkm, pokedexModalState.ribbon)}
                  </select>
                </div>
              </div>
            </div>

            <!-- 4. 性格選單 -->
            <div class="box-form-group box-full-width box-form-row-inline pokedex-nature-row">
              <label class="box-form-label box-form-inline-label" for="pokedex-poke-nature">${t('box.modal_poke_nature', '性格')}</label>
              <div class="box-form-inline-control">
                <select id="pokedex-poke-nature" class="box-form-select pokedex-custom-select" onchange="window.PokemonApp.setPokedexModalNature(this.value)">
                  ${POKEDEX_MODAL_NATURES.map(n => {
                    const natDisplayName = (window.I18N && typeof window.I18N.getNatureName === 'function') ? window.I18N.getNatureName(n.name) : n.name;
                    const buffLabel = isEN ? (n.buff_en || n.buff) : n.buff;
                    const debuffLabel = isEN ? (n.debuff_en || n.debuff) : n.debuff;
                    return `<option value="${n.name}" ${pokedexModalState.nature === n.name ? 'selected' : ''}>${natDisplayName} (${buffLabel}${debuffLabel ? ' / ' + debuffLabel : ' (Neutral)'})</option>`;
                  }).join('')}
                </select>
              </div>
            </div>

            <!-- 6. 副技能配置：單行 5 階插槽 + 平鋪副技能選擇盤 (清空全部按鈕) -->
            <div class="box-form-group box-full-width">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <label class="box-form-label">${t('box.modal_poke_subskills', '副技能配置')}</label>
                <button type="button" id="pokedex-subskill-clear-all-btn" class="box-subskill-clear-btn" onclick="window.PokemonApp.clearAllPokedexSubskills()" title="${t('box.modal_clear_all_subskills', '清空全部副技能')}">${t('box.modal_clear_all_subskills', '清空全部')}</button>
              </div>

              <!-- 單行 5 階插槽列 -->
              <div class="box-subskill-slots-row" id="pokedex-subskill-slots-row"></div>

              <!-- 平鋪副技能選擇盤 -->
              <div class="box-subskill-palette" id="pokedex-subskill-palette">
                <div class="subskill-tier-section">
                  <div class="subskill-tier-label gold-label">${t('box.modal_gold_skills', '金色頂級技能')}</div>
                  <div class="subskill-chips-row" id="pokedex-subskill-chips-gold"></div>
                </div>
                <div class="subskill-tier-section">
                  <div class="subskill-tier-label blue-label">${t('box.modal_blue_skills', '藍色高階技能')}</div>
                  <div class="subskill-chips-row" id="pokedex-subskill-chips-blue"></div>
                </div>
                <div class="subskill-tier-section">
                  <div class="subskill-tier-label white-label">${t('box.modal_white_skills', '白色基礎技能')}</div>
                  <div class="subskill-chips-row" id="pokedex-subskill-chips-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // 初始化食材平鋪選擇器與副技能插槽選擇盤
  renderPokedexIngredientStrip();
  updatePokedexSubskillUI();

  // 初始化自訂下拉選單 (主技能等級、性格、睡飽飽獎章)
  ['pokedex-poke-skill-level', 'pokedex-poke-nature', 'pokedex-poke-ribbon'].forEach(id => {
    const el = document.getElementById(id);
    if (el && typeof window.setupCustomSelect === 'function' && !el._customized) {
      window.setupCustomSelect(el);
    }
  });
}

function renderPokedexFormulaBreakdownHTML(f, pkm) {
  if (!f) return '';
  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

  const natureIngSign = f.natureIngMult > 1 ? `x${f.natureIngMult.toFixed(2)} (+20%)` : (f.natureIngMult < 1 ? `x${f.natureIngMult.toFixed(2)} (-20%)` : `x1.00`);
  const subskillIngSign = f.subskillIngBonus > 0 ? `+${f.subskillIngBonus}%` : `+0%`;

  const natureSkillSign = f.natureSkillMult > 1 ? `x${f.natureSkillMult.toFixed(2)} (+20%)` : (f.natureSkillMult < 1 ? `x${f.natureSkillMult.toFixed(2)} (-20%)` : `x1.00`);
  const subskillSkillSign = f.subskillSkillBonus > 0 ? `+${f.subskillSkillBonus}%` : `+0%`;

  return `
    <div class="pokedex-formula-inner">
      <div class="pokedex-formula-header">
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="pokedex-formula-badge font-bold">${t('pokedex.formula_title', '食材產能算法拆解')}</span>
        </div>
      </div>

      <!-- 單一整合精算卡片 (無 1 2 3 分步，白底大字體，流暢排版) -->
      <div class="pokedex-calc-unified-box">
        <!-- 第 1 列：最終食材發動率 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${t('pokedex.final_ing_rate', '最終食材發動率')}</span>
            <span class="calc-row-result font-bold text-success">${f.finalIngRate.toFixed(2)}%</span>
          </div>
          <div class="calc-row-formula">
            <span class="formula-var" title="${isEN ? 'Base Rate' : '基礎食材機率'}">${f.baseIngRate.toFixed(1)}%</span>
            <span class="formula-op">×</span>
            <span class="formula-text">(1+${subskillIngSign})</span>
            <span class="formula-op">×</span>
            <span class="formula-var" title="${isEN ? 'Nature' : '性格'}">${natureIngSign}</span>
            <span class="formula-op">=</span>
            <span class="formula-res font-bold text-success">${f.finalIngRate.toFixed(2)}%</span>
          </div>
        </div>

        <!-- 第 2 列：最終技能發動率 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${isEN ? 'Final Skill Trigger Rate' : '最終技能發動率'}</span>
            <span class="calc-row-result font-bold text-accent">${f.finalSkillRate.toFixed(2)}%</span>
          </div>
          <div class="calc-row-formula">
            <span class="formula-var" title="${isEN ? 'Base Skill Rate' : '基礎技能機率'}">${f.baseSkillRate.toFixed(1)}%</span>
            <span class="formula-op">×</span>
            <span class="formula-text">(1+${subskillSkillSign})</span>
            <span class="formula-op">×</span>
            <span class="formula-var" title="${isEN ? 'Nature' : '性格'}">${natureSkillSign}</span>
            <span class="formula-op">=</span>
            <span class="formula-res font-bold text-accent">${f.finalSkillRate.toFixed(2)}%</span>
          </div>
        </div>

        <!-- 第 3 列：有效幫忙頻率與技能發動期望 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${t('pokedex.daily_helps', '預估每日幫忙次數')}</span>
            <span class="calc-row-result font-bold text-accent">${f.dailyHelps.toFixed(1)} ${isEN ? 'helps/day' : '次/天'}</span>
          </div>
          <div class="calc-row-stats-line">
            <span class="calc-stat-sub">${isEN ? 'Interval: ' : '實質間隔：'}<strong class="text-primary">${formatPokedexIntervalSec(f.effectiveIntervalSec)}</strong> <span class="calc-stat-base">(${isEN ? 'Base' : '基礎'} ${formatPokedexIntervalSec(f.baseIntervalSec)}${f.levelSpeedDiscount > 0 ? ` · Lv-${(f.levelSpeedDiscount * 100).toFixed(0)}%` : ''}${f.subskillSpeedBonus > 0 ? ` · 副-${f.subskillSpeedBonus}%` : ''}${f.ribbonDiscount > 0 ? ` · 獎-${Math.round(f.ribbonDiscount * 100)}%` : ''})</span></span>
            <span class="calc-stat-sub">${isEN ? 'Daily Triggers: ' : '預估每日發動：'}<strong class="text-accent font-bold">${f.dailyTriggers.toFixed(2)} ${isEN ? 'times/day' : '次/天'}</strong></span>
          </div>
        </div>

        <!-- 第 4 列：食材單日產量與品項清單 -->
        <div class="unified-calc-row">
          <div class="calc-row-header">
            <span class="calc-row-label font-bold">${t('pokedex.daily_ing_yield', '食材單日產量')}</span>
            <span class="calc-row-result font-bold text-gold">${f.dailyIngDrops.toFixed(1)} ${isEN ? 'drops/day' : '次掉落/天'}</span>
          </div>
          <div class="pokedex-yield-items-grid">
            ${f.summaryYieldList.map(item => `
              <div class="pokedex-yield-pill">
                ${item.icon ? `<img src="${item.icon}" class="yield-pill-img" alt="${escapeHtml(item.name)}" loading="lazy">` : ''}
                <span class="yield-pill-name">${escapeHtml(item.name)}</span>
                <span class="yield-pill-count font-bold text-success">${item.daily.toFixed(1)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 寶可夢特性定位與最佳適配副技能指南 -->
      ${renderPokedexStrategyCardHTML(pkm || (pokedexModalState && pokedexModalState.pkm))}
    </div>
  `;
}

function updatePokedexModalAppraisalLive() {
  const pkm = pokedexModalState.pkm;
  if (!pkm) return;

  const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

  // 1. 重新計算評估
  const chosenIngs = (pkm.ingredients || []).map((ing, i) => {
    const selIdx = pokedexModalState.ingSlots[i] || 0;
    return (pkm.ingredients && pkm.ingredients[selIdx]) ? pkm.ingredients[selIdx].name : (ing.name || '');
  });

  let evaluation = null;
  if (window.AppraisalLab && typeof window.AppraisalLab.evaluatePokemon === 'function') {
    evaluation = window.AppraisalLab.evaluatePokemon(pkm, pokedexModalState.level, pokedexModalState.nature, pokedexModalState.subskills, chosenIngs, pokedexModalState.ribbon, pokedexModalState.skillLevel);
  }
  if (!evaluation) {
    evaluation = {
      compositeScore: 75,
      grade: 'A',
      gradeTitle: isEN ? 'Solid Pick' : '實用良品 (Solid Pick)',
      gradeColor: '#10b981',
      scores: { berry: 60, ingredient: 70, skill: 65, speed: 65, growth: 60, roi: 65 }
    };
  }

  // 2. 更新評估 UI (頂部右側徽章)
  const gradeEl = document.querySelector('.verdict-grade');
  const numEl = document.querySelector('.verdict-num');
  const verdictBadge = document.getElementById('pokedex-header-verdict-badge');
  if (gradeEl) {
    gradeEl.textContent = evaluation.grade;
    gradeEl.style.color = evaluation.gradeColor;
  }
  if (numEl) numEl.textContent = evaluation.compositeScore;
  if (verdictBadge) verdictBadge.style.borderColor = evaluation.gradeColor;

  // 3. 更新食材產能算法拆解卡片與動態數值 (幫忙間隔、食材機率、技能機率)
  const formulaData = calculatePokedexIngredientFormulas();
  const formulaContainer = document.getElementById('pokedex-calc-formula-container');
  if (formulaContainer && formulaData) {
    formulaContainer.innerHTML = renderPokedexFormulaBreakdownHTML(formulaData, pkm);
  }

  const intervalEl = document.getElementById('pokedex-stat-interval');
  if (intervalEl && formulaData) {
    intervalEl.textContent = formatHelpInterval(formulaData.effectiveIntervalSec);
  }

  const skillRateEl = document.getElementById('pokedex-stat-skill-rate');
  if (skillRateEl && formulaData && typeof formulaData.finalSkillRate === 'number') {
    skillRateEl.textContent = `${formulaData.finalSkillRate.toFixed(2)}%`;
  }

  const ingRateEl = document.getElementById('pokedex-stat-ingredient-rate');
  if (ingRateEl && formulaData && typeof formulaData.finalIngRate === 'number') {
    ingRateEl.textContent = `${formulaData.finalIngRate.toFixed(2)}%`;
  }

  // 5. 更新等級數值標籤與重點圖釘狀態
  const levelBadge = document.querySelector('.pokedex-val-badge');
  if (levelBadge) levelBadge.textContent = `Lv. ${pokedexModalState.level}`;

  const evoGuardContainer = document.getElementById('pokedex-evo-guard-container');
  if (evoGuardContainer) {
    evoGuardContainer.innerHTML = '';
  }

  const levelCtrlGroup = document.querySelector('.pokedex-level-ctrl-group');
  if (levelCtrlGroup) {
    levelCtrlGroup.classList.remove('has-evo-warning');
  }

  document.querySelectorAll('.pokedex-track-pin-btn').forEach(btn => {
    const pinLv = parseInt(btn.getAttribute('data-pin-lv') || btn.getAttribute('title').replace(/[^0-9]/g, ''), 10);
    btn.classList.toggle('active', pinLv === pokedexModalState.level);
  });
  document.querySelectorAll('.pokedex-level-pin-btn').forEach(btn => {
    const pinLv = parseInt(btn.textContent, 10);
    btn.classList.toggle('active', pinLv === pokedexModalState.level);
  });

  const slotLvs = [10, 25, 50, 70, 80];
  document.querySelectorAll('.pokedex-subskill-slot').forEach((slotEl, sIdx) => {
    const isUnlocked = pokedexModalState.level >= slotLvs[sIdx];
    slotEl.classList.toggle('subskill-unlocked', isUnlocked);
    slotEl.classList.toggle('subskill-locked', !isUnlocked);
    const statusText = slotEl.querySelector('.subskill-status-locked');
    if (statusText) {
      statusText.style.display = isUnlocked ? 'none' : 'inline-block';
    }
  });

  // 更新食材插槽解鎖標籤
  document.querySelectorAll('.pokedex-ing-slot-box').forEach((boxEl, sIdx) => {
    const reqLv = sIdx === 0 ? 1 : (sIdx === 1 ? 30 : 60);
    const isUnlocked = pokedexModalState.level >= reqLv;
    boxEl.classList.toggle('slot-active', isUnlocked);
    boxEl.classList.toggle('slot-locked', !isUnlocked);
  });
}

// 導出至 PokemonApp 與 全域 window
PokemonApp.openPokemonDetailModal = openPokemonDetailModal;
PokemonApp.closePokemonDetailModal = closePokemonDetailModal;
PokemonApp.applyPokedexGodPreset = applyPokedexGodPreset;
PokemonApp.applyPokedexResetPreset = applyPokedexResetPreset;
PokemonApp.setPokedexModalLevel = setPokedexModalLevel;
PokemonApp.setPokedexModalNature = setPokedexModalNature;
PokemonApp.setPokedexModalSubskill = setPokedexModalSubskill;
PokemonApp.setPokedexModalSkillLevel = setPokedexModalSkillLevel;
PokemonApp.setPokedexModalRibbon = setPokedexModalRibbon;
PokemonApp.setPokedexModalIng = setPokedexModalIng;
PokemonApp.selectPokedexSubskillSlot = selectPokedexSubskillSlot;
PokemonApp.choosePokedexSubskill = choosePokedexSubskill;
PokemonApp.clearAllPokedexSubskills = clearAllPokedexSubskills;
PokemonApp.renderPokedexIngredientStrip = renderPokedexIngredientStrip;
PokemonApp.updatePokedexSubskillUI = updatePokedexSubskillUI;
PokemonApp.calculatePokedexIngredientFormulas = calculatePokedexIngredientFormulas;
PokemonApp.getPokedexMinEvolutionLevel = getPokedexMinEvolutionLevel;
PokemonApp.renderPokedexEvoGuardBadgeHTML = renderPokedexEvoGuardBadgeHTML;
PokemonApp.renderPokedexRibbonOptionsHTML = renderPokedexRibbonOptionsHTML;
PokemonApp.renderPokedexStrategyCardHTML = renderPokedexStrategyCardHTML;
PokemonApp.getPokedexModalState = () => pokedexModalState;

if (typeof window !== 'undefined') {
  window.openPokemonDetailModal = openPokemonDetailModal;
  window.closePokemonDetailModal = closePokemonDetailModal;
  window.getPokedexMinEvolutionLevel = getPokedexMinEvolutionLevel;
  window.renderPokedexEvoGuardBadgeHTML = renderPokedexEvoGuardBadgeHTML;
  window.renderPokedexRibbonOptionsHTML = renderPokedexRibbonOptionsHTML;
  window.renderPokedexStrategyCardHTML = renderPokedexStrategyCardHTML;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getItemIcon: (p) => getIconUrl(p),
    getItemId: (p) => String(p.id || p.formatted_no || ''),
    getItemFormattedNo: (p) => p.formatted_no || '',
    getItemNameCN: (p) => (p.name && p.name.cn) || p.name_cn || '',
    getItemNameEN: (p) => (p.name && p.name.en) || p.name_en || '',
    getItemNameJP: (p) => (p.name && p.name.jp) || p.name_jp || '',
    getItemCarry: (p) => getItemCarry(p),
    getItemIngredientRate: (p) => getItemIngredientRate(p),
    getItemSkillRate: (p) => getItemSkillRate(p),
    getItemHelpInterval: (p) => getItemHelpInterval(p),
    DEFAULT_SVG_ICON,
    PokemonApp,
    getPokedexMinEvolutionLevel,
    renderPokedexEvoGuardBadgeHTML,
    BASE_SKILLS,
    COMPOSITE_SKILL_MAP,
    SPECIAL_SKILL_DETAILS,
    matchesSkill,
    renderSkillWithTooltip,
    initBackToTop: (typeof PokemonApp !== 'undefined' && PokemonApp.initBackToTop) ? PokemonApp.initBackToTop : undefined,
    updateBackToTopVisibility: (typeof PokemonApp !== 'undefined' && PokemonApp.updateBackToTopVisibility) ? PokemonApp.updateBackToTopVisibility : undefined,
    initPullToRefresh: (typeof PokemonApp !== 'undefined' && PokemonApp.initPullToRefresh) ? PokemonApp.initPullToRefresh : undefined,
    bindBackdropDismiss,
    bindSidebarSwipeRightToClose,
    toggleSidebar
  };
}
