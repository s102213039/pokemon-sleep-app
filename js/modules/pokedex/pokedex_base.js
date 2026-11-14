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
  '9007': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png',
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
  '顫弦蠑螈（低調）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png',
  '皮卡丘 (萬聖節)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png',
  '皮卡丘 (佳節)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png',
  '皮卡丘 (船長)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png',
  '六尾 (阿羅拉的樣子)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/037-alolanvulpix.png',
  '六尾 (阿羅拉)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/037-alolanvulpix.png',
  '九尾 (阿羅拉的樣子)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png',
  '九尾 (阿羅拉)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png',
  '伊布 (佳節)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png',
  '伊布 (萬聖節)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png',
  '烏波 (阿羅拉的樣子)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '烏波 (帕底亞的樣子)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '烏波 (帕底亞)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '海豹球 (佳節)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png',
  '顫弦蠑螈 (低調的樣子)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png',
  '顫弦蠑螈 (低調)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png',
  '顫弦蠑螈（高調的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849.png',
  '顫弦蠑螈 (高調的樣子)': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849.png',
  '南瓜精': 'https://www.serebii.net/pokemonsleep/pokemon/icon/710.png',
  '南瓜怪人': 'https://www.serebii.net/pokemonsleep/pokemon/icon/711.png',
  '200': 'https://www.serebii.net/pokemonsleep/pokemon/icon/200.png',
  '0200': 'https://www.serebii.net/pokemonsleep/pokemon/icon/200.png',
  '夢妖': 'https://www.serebii.net/pokemonsleep/pokemon/icon/200.png',
  'Misdreavus': 'https://www.serebii.net/pokemonsleep/pokemon/icon/200.png',
  '429': 'https://www.serebii.net/pokemonsleep/pokemon/icon/429.png',
  '0429': 'https://www.serebii.net/pokemonsleep/pokemon/icon/429.png',
  '夢妖魔': 'https://www.serebii.net/pokemonsleep/pokemon/icon/429.png',
  'Mismagius': 'https://www.serebii.net/pokemonsleep/pokemon/icon/429.png'
};

function getIconUrl(p) {
  if (!p) return DEFAULT_SVG_ICON;

  // 1. 若傳入直接為字串 (寶可夢名稱、編號或直接圖片網址)
  if (typeof p === 'string') {
    const trimmed = p.trim();
    if (!trimmed) return DEFAULT_SVG_ICON;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (SPECIAL_ICON_MAP[trimmed]) return SPECIAL_ICON_MAP[trimmed];
    const norm = trimmed.replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）');
    if (SPECIAL_ICON_MAP[norm]) return SPECIAL_ICON_MAP[norm];
    const half = trimmed.replace(/（/g, ' (').replace(/）/g, ')');
    if (SPECIAL_ICON_MAP[half]) return SPECIAL_ICON_MAP[half];

    const allPkm = (typeof window !== 'undefined' && Array.isArray(window.allPokemons) && window.allPokemons.length > 0)
      ? window.allPokemons
      : ((typeof PokemonApp !== 'undefined' && Array.isArray(PokemonApp.allPokemons)) ? PokemonApp.allPokemons : []);
    if (allPkm.length > 0) {
      const lower = trimmed.toLowerCase();
      const match = allPkm.find(x => x && (
        x.name_cn === trimmed ||
        x.name_cn === norm ||
        x.name_cn === half ||
        (x.name_en && x.name_en.toLowerCase() === lower) ||
        (x.formatted_no && x.formatted_no === trimmed) ||
        (x.id && String(x.id) === trimmed)
      ));
      if (match) return getIconUrl(match);
    }
    return DEFAULT_SVG_ICON;
  }

  // 2. 若傳入為物件 (寶可夢資料、倉庫物件或島嶼棲息資料)
  if (typeof p === 'object') {
    const idStr = String(p.id || p.pokemonId || p.formatted_no || '');
    if (idStr && SPECIAL_ICON_MAP[idStr]) return SPECIAL_ICON_MAP[idStr];

    const nameCn = p.name_cn || (typeof p.name === 'string' ? p.name : (p.name && p.name.cn ? p.name.cn : ''));
    if (nameCn) {
      if (SPECIAL_ICON_MAP[nameCn]) return SPECIAL_ICON_MAP[nameCn];
      const normCn = String(nameCn).replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）');
      if (SPECIAL_ICON_MAP[normCn]) return SPECIAL_ICON_MAP[normCn];
      const halfCn = String(nameCn).replace(/（/g, ' (').replace(/）/g, ')');
      if (SPECIAL_ICON_MAP[halfCn]) return SPECIAL_ICON_MAP[halfCn];
    }

    const nameEn = p.name_en || (p.name && p.name.en ? p.name.en : '');
    if (nameEn && SPECIAL_ICON_MAP[nameEn]) return SPECIAL_ICON_MAP[nameEn];

    if (p.icon && typeof p.icon === 'string' && p.icon.trim() !== '') return p.icon;
    if (p.icon_url && typeof p.icon_url === 'string' && p.icon_url.trim() !== '') return p.icon_url;

    if (p.formatted_no) {
      return `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png`;
    }

    // 若為島嶼棲息資料 (只有 name, name_en) 且無 formatted_no，在全域資料庫中尋找其本體資料
    if (nameCn || nameEn) {
      const allPkm = (typeof window !== 'undefined' && Array.isArray(window.allPokemons) && window.allPokemons.length > 0)
        ? window.allPokemons
        : ((typeof PokemonApp !== 'undefined' && Array.isArray(PokemonApp.allPokemons)) ? PokemonApp.allPokemons : []);
      if (allPkm.length > 0) {
        const lowerEn = (nameEn || '').toLowerCase();
        const normCn = String(nameCn).replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）');
        const match = allPkm.find(x => x && (
          (nameCn && x.name_cn === nameCn) ||
          (normCn && x.name_cn === normCn) ||
          (lowerEn && x.name_en && x.name_en.toLowerCase() === lowerEn)
        ));
        if (match && match !== p) return getIconUrl(match);
      }
    }
  }

  return DEFAULT_SVG_ICON;
}

/**
 * 判定寶可夢是否為最終進化形態 (Final Evolution)
 * 具備上游資料防禦：即便上游 data.json is_final 暫時標記遺漏，亦能依據寶可夢 ID / 名稱 / 進化狀態精準判定
 */
function isFinalEvolution(p) {
  if (!p) return false;
  const raw = p.is_final !== undefined && p.is_final !== null ? p.is_final : p.isFinal;
  if (raw === '〇' || raw === 'O' || raw === 'o' || raw === true || raw === '1' || raw === 1) {
    return true;
  }
  const idStr = String(p.id || p.formatted_no || p.pokemonId || '');
  if (idStr === '429' || idStr === '0429') return true;
  const name = p.name_cn || (typeof p.name === 'string' ? p.name : (p.name && p.name.cn ? p.name.cn : ''));
  if (name === '夢妖魔') return true;
  const nameEn = (p.name_en || (p.name && p.name.en ? p.name.en : '')).toLowerCase();
  if (nameEn === 'mismagius') return true;

  // 1. window.POKEMON_DB / window.allPokemons / PokemonApp.allPokemons 查核
  const db = (typeof window !== 'undefined' && (window.POKEMON_DB || window.allPokemons))
    ? (window.POKEMON_DB || window.allPokemons)
    : ((typeof PokemonApp !== 'undefined' && PokemonApp.allPokemons) ? PokemonApp.allPokemons : null);
  if (db && Array.isArray(db)) {
    const match = db.find(item => item && (
      (idStr && (String(item.id) === idStr || String(item.formatted_no) === idStr)) ||
      (name && (item.name_cn === name || item.name === name)) ||
      (nameEn && item.name_en && item.name_en.toLowerCase() === nameEn)
    ));
    if (match && match !== p) {
      const dRaw = match.is_final !== undefined && match.is_final !== null ? match.is_final : match.isFinal;
      if (dRaw === '〇' || dRaw === 'O' || dRaw === 'o' || dRaw === true || dRaw === '1' || dRaw === 1) return true;
    }
  }

  // 2. window.POKEMON_SKILLS_BASELINE_DATA / POKEMON_SKILLS_BASELINE_DATA 查核 (當 POKEMON_DB 資料不完整或檢查 next-ID 進化時之防禦)
  const baseline = (typeof window !== 'undefined' && Array.isArray(window.POKEMON_SKILLS_BASELINE_DATA))
    ? window.POKEMON_SKILLS_BASELINE_DATA
    : ((typeof POKEMON_SKILLS_BASELINE_DATA !== 'undefined' && Array.isArray(POKEMON_SKILLS_BASELINE_DATA)) ? POKEMON_SKILLS_BASELINE_DATA : null);
  if (baseline) {
    const match = baseline.find(item => item && (
      (idStr && (String(item.id) === idStr || String(item.formatted_no) === idStr)) ||
      (name && (item.name_cn === name || item.name === name)) ||
      (nameEn && item.name_en && item.name_en.toLowerCase() === nameEn)
    ));
    if (match) {
      const bRaw = match.is_final !== undefined && match.is_final !== null ? match.is_final : match.isFinal;
      if (bRaw === '〇' || bRaw === 'O' || bRaw === 'o' || bRaw === true || bRaw === '1' || bRaw === 1) return true;
    }
  }

  // 3. 次一編號 (next-ID) 進化檢查防護 (如 #025 皮卡丘 -> #026 雷丘，若後續存在進化則非最終形態)
  if (p.evo_req && String(p.evo_req).trim() !== '') {
    return false;
  }

  return false;
}

/**
 * 將外部 Serebii 圖床網址映射為本地 assets/ 相對路徑
 * 支援：pokemon/icon、items、itemdex/sprites、locations、berries、ingredients、meals、star.png
 */
function mapExternalToLocalAsset(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let cleanUrl = rawUrl.split('?')[0].split('#')[0];
  try {
    cleanUrl = decodeURIComponent(cleanUrl);
  } catch (e) {}
  const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__)
    ? window.__DATA_BASE_PATH__
    : ((typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.includes('/app/')) ? '../' : '');

  if (cleanUrl.includes('snackablenuts_placeholder.svg') || cleanUrl.includes('/pokemonsleep/ingredients/snackablenuts.png')) {
    return `${base}assets/ingredients/snackablenuts_placeholder.svg`;
  }
  if (
    cleanUrl.includes('meal_placeholder.svg') ||
    cleanUrl.includes('/pokemonsleep/meals/seedbombnaanandcurry.png') ||
    cleanUrl.includes('/pokemonsleep/meals/grassknotsaladwrap.png') ||
    cleanUrl.includes('/pokemonsleep/meals/slowpoketailrollcake.png')
  ) {
    return `${base}assets/meals/meal_placeholder.svg`;
  }
  if (cleanUrl.startsWith('assets/')) {
    return `${base}${cleanUrl}`;
  }

  if (cleanUrl.includes('/pokemonsleep/pokemon/icon/')) {
    const fn = cleanUrl.split('/pokemonsleep/pokemon/icon/')[1];
    if (fn) return `${base}assets/pokemon/icon/${fn}`;
  }
  if (cleanUrl.includes('/pokemonsleep/items/')) {
    const fn = cleanUrl.split('/pokemonsleep/items/')[1];
    if (fn) return `${base}assets/items/${fn.replace(/'/g, '')}`;
  }
  if (cleanUrl.includes('/itemdex/sprites/')) {
    const fn = cleanUrl.split('/itemdex/sprites/')[1];
    if (fn) return `${base}assets/items/${fn.replace(/'/g, '')}`;
  }
  if (cleanUrl.includes('/pokemonsleep/locations/')) {
    const fn = cleanUrl.split('/pokemonsleep/locations/')[1];
    if (fn) {
      const stem = fn.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      return `${base}assets/islands/original/${stem}-location.jpg`;
    }
  }
  if (cleanUrl.includes('/pokemonsleep/berries/')) {
    const fn = cleanUrl.split('/pokemonsleep/berries/')[1];
    if (fn) return `${base}assets/berries/${fn}`;
  }
  if (cleanUrl.includes('/pokemonsleep/ingredients/')) {
    const fn = cleanUrl.split('/pokemonsleep/ingredients/')[1];
    if (fn) return `${base}assets/ingredients/${fn}`;
  }
  if (cleanUrl.includes('/pokemonsleep/meals/')) {
    const fn = cleanUrl.split('/pokemonsleep/meals/')[1];
    if (fn) return `${base}assets/meals/${fn}`;
  }
  if (cleanUrl.endsWith('/pokemonsleep/star.png')) {
    return `${base}assets/star.png`;
  }
  return '';
}

/**
 * 全站通用圖片載入錯誤安全降級 (Universal Asset Fallback Loader)
 * 自動清除污染快取並優先切換至同源本地 assets/ 鏡像；若仍失敗則降級為乾淨 SVG 向量圖
 */
function handleAssetImageError(img) {
  if (!img) return;
  const currentSrc = img.getAttribute ? (img.getAttribute('src') || img.src || '') : (img.src || '');
  if (!currentSrc || currentSrc.startsWith('data:image/svg+xml')) return;

  if (typeof caches !== 'undefined' && img.src) {
    try {
      caches.keys().then(keys => {
        keys.forEach(k => {
          if (k.includes('pksleep-img-cache')) {
            caches.open(k).then(c => c.delete(img.src)).catch(() => {});
          }
        });
      }).catch(() => {});
    } catch (e) {}
  }

  if (!img.dataset) img.dataset = {};
  if (!img.dataset.fb) {
    img.dataset.fb = '1';
    if (img.style && img.style.opacity === '0.3') {
      img.style.opacity = '';
    }
    const mappedLocal = mapExternalToLocalAsset(currentSrc) || mapExternalToLocalAsset(img.src || '');
    if (mappedLocal) {
      img.src = mappedLocal;
      return;
    }
    const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
    const srcParts = (img.src || currentSrc || '').split('/');
    const rawFilename = srcParts[srcParts.length - 1] || '';
    const cleanFn = rawFilename.split('?')[0] || '';
    if (cleanFn) {
      img.src = `${base}assets/pokemon/icon/${cleanFn}`;
      return;
    }
  }
  img.dataset.fb = '2';
  img.src = DEFAULT_SVG_ICON;
  img.onerror = null;
}

/**
 * 寶可夢頭像載入錯誤安全降級 (Safe Fallback Loader)
 * 優先載入本地 assets/pokemon/icon/ 圖示；若仍失敗則降級為乾淨 SVG 向量圖，杜絕加載全身立繪大圖
 */
function handlePokemonIconError(img) {
  handleAssetImageError(img);
}

// 全站統一掛載 window.getItemIcon 作為各分頁（圖鑑、倉庫、島嶼、深度研究室、道具百科）唯一寶可夢圖示來源
if (typeof window !== 'undefined') {
  window.getItemIcon = getIconUrl;
  window.isFinalEvolution = isFinalEvolution;
  window.handlePokemonIconError = handlePokemonIconError;
  window.handleAssetImageError = handleAssetImageError;
  window.mapExternalToLocalAsset = mapExternalToLocalAsset;
  if (!window.PokemonApp) window.PokemonApp = {};
  window.PokemonApp.getItemIcon = getIconUrl;
  window.PokemonApp.isFinalEvolution = isFinalEvolution;
  window.PokemonApp.handlePokemonIconError = handlePokemonIconError;
  window.PokemonApp.handleAssetImageError = handleAssetImageError;
  window.PokemonApp.mapExternalToLocalAsset = mapExternalToLocalAsset;

  // 全域 Capture-Phase 圖片錯誤攔截器：確保全站所有分頁 (含未手動綁定 onerror 之道具、島嶼、樹果、食材、食譜) 一律自動降級至本地 assets/
  if (typeof window.addEventListener === 'function' && !window.__PK_IMG_ERROR_GUARD__) {
    window.__PK_IMG_ERROR_GUARD__ = true;
    window.addEventListener('error', function (ev) {
      const target = ev && ev.target;
      if (target && target.tagName === 'IMG') {
        handleAssetImageError(target);
      }
    }, true);
  }

  // 啟動時主動清除所有舊版或曾遭 Opaque 回應污染的歷史圖片快取 (pksleep-img-cache)
  if (typeof caches !== 'undefined' && typeof caches.keys === 'function') {
    try {
      caches.keys().then(function (keys) {
        keys.forEach(function (k) {
          if ((k.startsWith('pksleep-img-cache') || k.startsWith('pksleep-static')) && !k.endsWith('20261106_04')) {
            caches.delete(k).catch(function () {});
          }
        });
      }).catch(function () {});
    } catch (e) {}
  }
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

function getItemNo(p) {
  if (!p) return 99999;
  const val = p.formatted_no || p.id || p.pokedex_id || '99999';
  const num = parseInt(val, 10);
  return isNaN(num) ? 99999 : num;
}

function getItemName(p) {
  if (!p) return '';
  const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
  return isEN ? (p.name_en || p.name_cn || '') : (p.name_cn || p.name_en || '');
}

function getItemSpecialty(p) {
  if (!p) return '';
  return p.specialty || '';
}

function getItemBerry(p) {
  if (!p) return '';
  const berry = (typeof getPokemonBerry === 'function') ? getPokemonBerry(p) : (p.berry || null);
  return (berry && berry.name) || '';
}

const SORT_GETTERS = {
  no: getItemNo,
  id: getItemNo,
  name: getItemName,
  specialty: getItemSpecialty,
  berry: getItemBerry,
  carry: getItemCarry,
  ingredientRate: getItemIngredientRate,
  skillRate: getItemSkillRate,
  interval: getItemHelpInterval
};
const SORT_DEFAULT_DIR = {
  no: 'asc',
  id: 'asc',
  name: 'asc',
  specialty: 'asc',
  berry: 'asc',
  carry: 'desc',
  ingredientRate: 'desc',
  skillRate: 'desc',
  interval: 'asc'
};

function parseTableSort(sortKey) {
  if (!sortKey) return { col: null, dir: null };
  const i = sortKey.lastIndexOf('-');
  if (i <= 0) return { col: null, dir: null };
  const col = sortKey.slice(0, i);
  const dir = sortKey.slice(i + 1);
  if (!SORT_GETTERS[col] || (dir !== 'asc' && dir !== 'desc' && dir !== 'newest')) return { col: null, dir: null };
  return { col, dir };
}

function nextColumnSort(currentSort, col) {
  const targetCol = (col === 'id') ? 'no' : col;
  if (!SORT_DEFAULT_DIR[targetCol]) return currentSort;
  const parsed = parseTableSort(currentSort);

  if (targetCol === 'no') {
    if (parsed.col === 'no') {
      if (parsed.dir === 'asc') return 'no-desc';
      if (parsed.dir === 'desc') return 'no-newest';
      return 'no-asc';
    }
    return 'no-asc';
  }

  if (parsed.col === targetCol) {
    const defDir = SORT_DEFAULT_DIR[targetCol];
    if (parsed.dir === defDir) {
      return `${targetCol}-${defDir === 'desc' ? 'asc' : 'desc'}`;
    }
    return 'no-asc';
  }
  return `${targetCol}-${SORT_DEFAULT_DIR[targetCol]}`;
}

function sortPokemonList(list, sortKey) {
  const out = [...(list || [])];
  const { col, dir } = parseTableSort(sortKey);
  if (col === 'no' && dir === 'newest') {
    out.sort((a, b) => {
      const dateA = a.release_date || '';
      const dateB = b.release_date || '';
      if (dateA !== dateB) {
        return dateB.localeCompare(dateA); // Newest release date first
      }
      return getItemNo(b) - getItemNo(a); // Newer/higher ID first
    });
    return out;
  }
  const getter = col && SORT_GETTERS[col];
  if (!getter) return out;
  const mul = dir === 'desc' ? -1 : 1;
  out.sort((a, b) => {
    const valA = getter(a);
    const valB = getter(b);
    if (typeof valA === 'string' && typeof valB === 'string') {
      const cmp = valA.localeCompare(valB, 'zh-Hant');
      if (cmp !== 0) return cmp * mul;
      return getItemNo(a) - getItemNo(b);
    }
    const numA = typeof valA === 'number' ? valA : 0;
    const numB = typeof valB === 'number' ? valB : 0;
    if (numA !== numB) return (numA - numB) * mul;
    return getItemNo(a) - getItemNo(b);
  });
  return out;
}

/* ─── 懸浮按鈕觸控 / 滑鼠平滑拖曳控制器 (Draggable FAB Controller) ─── */
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

/* ─── 樹果與屬性對應字典 (Berry & Type Mapping) ───────── */
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
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SPECIAL_ICON_MAP,
    getIconUrl,
    isFinalEvolution,
    mapExternalToLocalAsset,
    getPokemonBerry
  };
}

