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
  '150':  'https://www.serebii.net/pokedex-sv/icon/150.png',
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
  '顫弦蠑螈（低調）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png',
  '超夢': 'https://www.serebii.net/pokedex-sv/icon/150.png'
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
  if (!qtys.length) return '';
  return `<span class="ing-qty-group" title="${ing.name || ''}">${qtys.map(q => `<span class="ing-qty">${q}</span>`).join('<span class="ing-arrow">→</span>')}</span>`;
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
  '怪力钳（食材精選S）': ['食材精選S'],
  
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
    'zh-TW': '隨機獲得該寶可夢專屬食材池中的 1 種食材。',
    'en-US': 'Randomly obtains 1 ingredient from this Pokémon\'s candidate pool.'
  },
  '超幸運（食材精選S）': {
    'zh-TW': '隨機獲得該寶可夢專屬食材，少數情況下獲得大量夢之碎片。',
    'en-US': 'Obtains own ingredient; rarely awards massive Dream Shards.'
  },
  '怪力钳（食材精選S）': {
    'zh-TW': '隨機獲得該寶可夢專屬食材，有時額外獲得更多食材。',
    'en-US': 'Obtains own ingredient; sometimes awards extra amounts.'
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
    'zh-TW': '隨機發動「蓄積」或「噴放」；連續蓄積次數越多，噴放時為卡比獸增加的能量就越多。',
    'en-US': 'Stockpiles or spits energy; more consecutive stockpiles result in greater Snorlax Strength gained.'
  },
  '夢魘（能量填充M）': {
    'zh-TW': '固定增加大量卡比獸能量；發動時會降低隊伍中「惡屬性以外」寶可夢的活力。',
    'en-US': 'Significantly increases Snorlax Strength, but reduces energy of non-Dark type teammates.'
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
  if (skillName && skillName.includes('食材精選') && pkm && pkm.ingredients && pkm.ingredients.length > 0) {
    const uniqueIngs = [];
    const seen = new Set();
    pkm.ingredients.forEach(ig => {
      if (ig.name && !seen.has(ig.name)) {
        seen.add(ig.name);
        uniqueIngs.push(ig);
      }
    });

    const separator = isEN ? '<span class="skill-tooltip-sep">, </span>' : '<span class="skill-tooltip-sep">、</span>';
    const ingIconsHtml = uniqueIngs.map(ig => {
      const ingName = (typeof window !== 'undefined' && window.I18N) ? (window.I18N.getIngredientName(ig.name) || ig.name) : ig.name;
      const icon = ig.icon || (typeof window !== 'undefined' && window.I18N && window.I18N.getIngredientIcon(ig.name)) || '';
      return icon ? `<img src="${icon}" class="skill-tooltip-inline-ing" alt="${ingName}" title="${ingName}">` : '';
    }).filter(Boolean).join(separator);

    const ingNamesPlain = uniqueIngs.map(ig => (typeof window !== 'undefined' && window.I18N) ? (window.I18N.getIngredientName(ig.name) || ig.name) : ig.name).join(isEN ? ', ' : '、');

    if (ingIconsHtml) {
      const prefix = isEN ? 'Draws: ' : '可精選食材：';
      if (skillName.includes('超幸運')) {
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span><span style="color:var(--text-muted);font-size:11px;margin-left:4px;">${isEN ? '(rarely gives Shards)' : '（少數獲取碎片）'}</span></span>`;
        plainTitle = isEN ? `Draws: ${ingNamesPlain} (rarely gives Shards)` : `可精選食材：${ingNamesPlain}（少數獲取碎片）`;
      } else if (skillName.includes('怪力')) {
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span><span style="color:var(--text-muted);font-size:11px;margin-left:4px;">${isEN ? '(extra ings)' : '（額外產出）'}</span></span>`;
        plainTitle = isEN ? `Draws: ${ingNamesPlain} (extra ings)` : `可精選食材：${ingNamesPlain}（額外產出）`;
      } else {
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span></span>`;
        plainTitle = isEN ? `Draws: ${ingNamesPlain}` : `可精選食材：${ingNamesPlain}`;
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
}
PokemonApp.renderSkillWithTooltip = renderSkillWithTooltip;
PokemonApp.formatHelpInterval = formatHelpInterval;

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
        const q = this.currentSearch.toLowerCase().trim();
        const idStr = String(p.id || p.formatted_no || '');
        const fNo = String(p.formatted_no || '');
        const nameCN = String((p.name && p.name.cn) || p.name_cn || '').toLowerCase();
        const nameEN = String((p.name && p.name.en) || p.name_en || '').toLowerCase();
        const nameJP = String((p.name && p.name.jp) || p.name_jp || '').toLowerCase();
        
        const qNum = q.replace(/^#/, '').replace(/^0+/, '');
        const matchesId = q === idStr || q === `#${fNo}` || q === fNo || (qNum && (idStr === qNum || fNo.replace(/^0+/, '') === qNum));
        const matchesText = nameCN.includes(q) || nameEN.includes(q) || nameJP.includes(q) || idStr.includes(q) || fNo.includes(q);
        if (!matchesId && !matchesText) return false;
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

    /* ─── 🎨 主題與外觀系統 (Theme System - 4 Themes: 2 Dark + 2 Light) ─── */
    const STORAGE_KEY_THEME = 'user_theme';
    let currentTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'midnight';
    
    function applyTheme(theme) {
      if (!['midnight', 'onyx', 'dawn', 'emerald'].includes(theme)) {
        theme = 'midnight';
      }
      currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem(STORAGE_KEY_THEME, theme);
      } catch (e) {}

      // 更新彈窗內的選中卡片
      document.querySelectorAll('.theme-card-btn').forEach(btn => {
        if (btn.getAttribute('data-theme-val') === theme) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // 初始化主題
    applyTheme(currentTheme);
    PokemonApp.applyTheme = applyTheme;
    PokemonApp.getCurrentTheme = () => currentTheme;

    // 綁定主題卡片點擊
    document.querySelectorAll('.theme-card-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const themeVal = btn.getAttribute('data-theme-val');
        if (themeVal) {
          applyTheme(themeVal);
        }
      });
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

      function switchMainTab(target) {
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
          if (isMobileH5) document.body.classList.remove('ladder-active');
          const curLadderHandle = document.getElementById('ladder-sidebar-bookmark-handle');
          if (curLadderHandle) curLadderHandle.style.display = 'none';
          if (ladderSidebar) ladderSidebar.style.display = 'none';
          if (ladderBackdrop) ladderBackdrop.classList.remove('active');
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
          if (window.PokemonBoxApp && typeof window.PokemonBoxApp.renderBox === 'function') {
            try { window.PokemonBoxApp.renderBox(); } catch (e) {}
          }
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#box');
          }
        } else if (target === 'wiki' && panelWiki && tabWiki) {
          tabWiki.classList.add('active');
          panelWiki.style.display = 'block';
          if (window.WikiDB && typeof window.WikiDB.init === 'function') {
            try { window.WikiDB.init(); } catch (e) { console.error('WikiDB.init error:', e); }
          }
          const isIng = window.WikiDB && window.WikiDB.getCurrentSubTab && window.WikiDB.getCurrentSubTab() === 'ingredients';
          if (isMobileH5) {
            if (isIng) {
              document.body.classList.add('ladder-active');
            } else {
              document.body.classList.remove('ladder-active');
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
            curLadderHandle.style.display = isIng ? 'flex' : 'none';
            curLadderHandle.style.opacity = isIng ? '1' : '0';
            curLadderHandle.style.pointerEvents = isIng ? 'auto' : 'none';
          }

          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#wiki');
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
          if (recipeBookmarkHandle) recipeBookmarkHandle.style.display = '';
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
          if (bookmarkHandle) bookmarkHandle.style.display = '';
          if (window.PokemonApp && typeof window.PokemonApp.render === 'function') {
            try { window.PokemonApp.render(); } catch (e) {}
          }
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#pokemon');
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
        const hash = window.location.hash.replace(/^#/, '');
        if (['pokemon', 'recipes', 'wiki', 'box', 'news'].includes(hash)) {
          switchMainTab(hash);
        }
      });

      // 依網址 hash 載入預設 tab
      if (window.location.hash === '#news') {
        switchMainTab('news');
      } else if (window.location.hash === '#box') {
        switchMainTab('box');
      } else if (window.location.hash === '#wiki') {
        switchMainTab('wiki');
      } else if (window.location.hash === '#recipes') {
        switchMainTab('recipes');
      } else {
        switchMainTab('pokemon');
      }
    }

    initSpaTabs();

    const fetchDataWithFallback = async (...customUrls) => {
      const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
      const t = Date.now();
      const defaultCandidates = [
        `${base}data/data.json?t=${t}`,
        `data/data.json?t=${t}`,
        `../data/data.json?t=${t}`,
        `${base}data.json?t=${t}`,
        `data.json?t=${t}`,
        `../data.json?t=${t}`
      ];
      const urls = customUrls.length > 0 ? customUrls : defaultCandidates;
      const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));

      let lastErr = null;
      for (const url of uniqueUrls) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (res && res.ok) {
            return await res.json();
          }
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error('Failed to load data.json from candidate paths: ' + uniqueUrls.join(', '));
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

      function toggleSidebar(forceState) {
        if (!sidebar) return;
        const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
        const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

        if (shouldCollapse) {
          sidebar.classList.add('collapsed');
          if (backdrop) backdrop.classList.remove('active');
          if (bookmarkHandle) {
            bookmarkHandle.setAttribute('aria-expanded', 'false');
            bookmarkHandle.title = '展開篩選側邊欄';
            if (isMobileH5) {
              bookmarkHandle.style.opacity = '1';
              bookmarkHandle.style.pointerEvents = 'auto';
            }
          }
          setSidebarSavedState('pksleep_dex_sidebar_open', false);
        } else {
          sidebar.classList.remove('collapsed');
          if (window.innerWidth <= 1024 && backdrop) {
            backdrop.classList.add('active');
          }
          if (bookmarkHandle) {
            bookmarkHandle.setAttribute('aria-expanded', 'true');
            bookmarkHandle.title = '收合篩選側邊欄';
            if (isMobileH5) {
              bookmarkHandle.style.opacity = '0';
              bookmarkHandle.style.pointerEvents = 'none';
            }
          }
          setSidebarSavedState('pksleep_dex_sidebar_open', true);
        }
      }

      // 依暫存狀態初始化側邊欄展開/收合
      const initialDexOpen = getSidebarSavedState('pksleep_dex_sidebar_open', true);
      if (sidebar) {
        if (initialDexOpen) {
          sidebar.classList.remove('collapsed');
        } else {
          sidebar.classList.add('collapsed');
        }
      }

      const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

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
      if (backdrop) {
        backdrop.addEventListener('click', () => toggleSidebar(false));
      }

      // 📱 手勢右滑收合控制 (Swipe Right to Close Sidebar Helper - 防滾動條誤觸與防縱向滾動誤判)
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
          // 若點擊在滑桿、輸入框、下拉選單、按鈕等互動元件上，不觸發側邊欄滑動收合
          if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'BUTTON' || target.closest('input, select, button, .custom-select-container, .rf-slider, .sidebar-icon-grid'))) {
            isIgnored = true;
            return;
          }

          // 若觸控點在右側邊緣滾動條區域（距右邊框 28px 內），視為滾動條操作，不觸發收合
          const sidebarRect = sidebarEl.getBoundingClientRect();
          if (touch.clientX > sidebarRect.right - 28) {
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

          // 若主要為縱向上下滑動瀏覽列表（縱向位移大於橫向），立即忽略本輪收合手勢
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

          // 嚴格判定：明確向右橫向滑動（位移 >= 60px、橫向位移至少為縱向位移的 2 倍、且縱向位移 < 45px）
          if (diffX >= 60 && diffX > Math.abs(diffY) * 2.0 && Math.abs(diffY) < 45 && elapsed < 700) {
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

      // 🌐 全域防護：點擊遮罩層 (sidebar-backdrop) 時優雅收合側邊欄
      document.addEventListener('touchend', (e) => {
        const target = e.target;
        if (target && target.classList && target.classList.contains('sidebar-backdrop')) {
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
        }
      }, { passive: true });

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
          const q = currentSearch;
          return (
            (p.name_cn && p.name_cn.toLowerCase().includes(q)) ||
            (p.name_en && p.name_en.toLowerCase().includes(q)) ||
            (p.name_jp && p.name_jp.toLowerCase().includes(q)) ||
            (p.formatted_no && p.formatted_no.includes(q)) ||
            (p.id && String(p.id).includes(q))
          );
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
                ${iconUrl ? `<img class="pokemon-icon" src="${iconUrl}" alt="${pkmName}" loading="lazy" onerror="this.style.display='none';">` : ''}
                <div class="card-title-group">
                  <div class="pokemon-no">No.${p.formatted_no}</div>
                  <div class="pokemon-name" style="white-space:nowrap;">${pkmName}</div>
                  ${!isEN && p.name_en ? `<div class="pokemon-name-en" style="white-space:nowrap;">${p.name_en}</div>` : ''}
                </div>
                <div class="card-header-ingredients">
                  ${p.ingredients ? p.ingredients.map((ing, i) => ing.name ? `
                    <div class="card-header-ing-row" title="${ing.name}">
                      ${ing.icon ? `<img class="card-header-ing-icon" src="${ing.icon}" alt="${ing.name}" loading="lazy" onerror="this.style.display='none';">` : ''}
                      ${ingQtyBadges(ing, i)}
                    </div>
                  ` : '').join('') : ''}
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
                    ${iconUrl ? `<img src="${iconUrl}" width="34" height="34" class="table-icon" alt="${pkmName}" title="${pkmName}" loading="lazy" onerror="this.style.display='none';">` : ''}
                  </td>
                  <td class="td-name pokemon-name-cell">${pkmName}</td>
                  <td class="td-berry">${berry.icon ? `<img src="${berry.icon}" width="22" height="22" class="table-berry-icon" alt="${berryName}" title="${berryName}" loading="lazy" onerror="this.style.display='none';">` : `<span class="berry-name-text">${berryName}</span>`}</td>
                  <td class="td-spec">${specName}</td>
                  <td class="td-carry">${p.carry || '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[0] ? `<div class="ing-cell">${p.ingredients[0].icon ? `<img class="ing-icon" src="${p.ingredients[0].icon}" alt="${p.ingredients[0].name}" loading="lazy" title="${p.ingredients[0].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[0],0)}</div>` : '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[1] ? `<div class="ing-cell">${p.ingredients[1].icon ? `<img class="ing-icon" src="${p.ingredients[1].icon}" alt="${p.ingredients[1].name}" loading="lazy" title="${p.ingredients[1].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[1],1)}</div>` : '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[2] ? `<div class="ing-cell">${p.ingredients[2].icon ? `<img class="ing-icon" src="${p.ingredients[2].icon}" alt="${p.ingredients[2].name}" loading="lazy" title="${p.ingredients[2].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[2],2)}</div>` : '--'}</td>
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
              <span class="tooltip-sparkle">✨</span>
              <strong class="tooltip-title">${titleName}</strong>
              <span class="tooltip-tag">${isEN ? 'Special Main Skill' : '特殊主技能'}</span>
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

    initSkillTooltips();
  });
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
    BASE_SKILLS,
    COMPOSITE_SKILL_MAP,
    SPECIAL_SKILL_DETAILS,
    matchesSkill,
    renderSkillWithTooltip
  };
}
