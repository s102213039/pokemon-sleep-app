  const SUPPORTED_LANGS = ['zh-TW', 'zh-CN', 'en-US'];

  function initLanguage() {
    let initialLang = DEFAULT_LANG;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && SUPPORTED_LANGS.includes(saved)) {
        initialLang = saved;
      }
    } catch (e) {}

    syncActiveLocale(initialLang);

    if (typeof hydrateAppShells === 'function') {
      hydrateAppShells();
    }

    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('lang', activeStrategy.docLang);
      document.documentElement.setAttribute('data-lang', activeStrategy.dataLang);
      const onReady = () => {
        if (typeof hydrateAppShells === 'function') {
          hydrateAppShells();
        }
        updatePageTranslations();
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
      } else {
        onReady();
      }
    }
  }

  function getLanguage() {
    return currentLang;
  }

  function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    syncActiveLocale(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, activeStrategy.lang);
    } catch (e) {}

    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('lang', activeStrategy.docLang);
      document.documentElement.setAttribute('data-lang', activeStrategy.dataLang);
      updatePageTranslations();
    }

    // 通知各模組刷新
    if (typeof window !== 'undefined') {
      if (window.PokemonApp && typeof window.PokemonApp.render === 'function') {
        window.PokemonApp.render();
      }
      if (window.RecipesApp && typeof window.RecipesApp.render === 'function') {
        window.RecipesApp.render();
      }
      if (window.WikiDB && typeof window.WikiDB.renderWikiLayout === 'function') {
        const wikiPanel = document.getElementById('panel-wiki');
        if (wikiPanel) {
          window.WikiDB.renderWikiLayout(wikiPanel);
          if (wikiPanel.style && wikiPanel.style.display !== 'none' && typeof window.WikiDB.switchSubTab === 'function' && typeof window.WikiDB.getCurrentSubTab === 'function') {
            try { window.WikiDB.switchSubTab(window.WikiDB.getCurrentSubTab()); } catch (e) {}
          }
          // 重新渲染後執行必要的計算（renderWikiLayout 已包含座標天梯渲染，無須重複 refreshCoordinateLadder）
          if (typeof window.WikiDB.recalcTriggerChance === 'function') window.WikiDB.recalcTriggerChance();
          if (typeof window.WikiDB.recalcSleepDays === 'function') window.WikiDB.recalcSleepDays();
        }
      } else if (window.WikiDB && typeof window.WikiDB.init === 'function') {
        window.WikiDB.init();
      }
      if (window.PokemonBoxApp && typeof window.PokemonBoxApp.renderBox === 'function') {
        window.PokemonBoxApp.renderBox();
      }
      if (window.NewsApp && typeof window.NewsApp.render === 'function') {
        window.NewsApp.render();
      }
      if (window.AppraisalLab && typeof window.AppraisalLab.renderLab === 'function') {
        const labCont = document.getElementById('appraisal-lab-container');
        if (labCont) window.AppraisalLab.renderLab(labCont);
      }
      if (typeof CustomEvent !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('appLanguageChanged', { detail: { lang: currentLang } }));
      }
    }
  }

  // ─── 全域正規化與多層級容錯查找引擎 (Universal Normalization Engine) ───
  function normalizeSearchKey(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .trim()
      .replace(/（/g, '(')
      .replace(/）/g, ')')
      .replace(/【/g, '[')
      .replace(/】/g, ']')
      .replace(/：/g, ':')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\[\s+/g, '[')
      .replace(/\s+\]/g, ']')
      .replace(/恢復/g, '回復')
      .replace(/恢/g, '回')
      .replace(/\s+/g, ' ');
  }

  function compactSearchKey(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\s+/g, '').replace(/（/g, '(').replace(/）/g, ')').replace(/恢/g, '回');
  }

  function ensureDictIndex(dict) {
    if (dict.__normIndex && dict.__compactIndex) return;
    const normIdx = Object.create(null);
    const compactIdx = Object.create(null);
    for (const key in dict) {
      if (!Object.prototype.hasOwnProperty.call(dict, key)) continue;
      const val = dict[key];
      const nKey = normalizeSearchKey(key);
      if (nKey && normIdx[nKey] === undefined) normIdx[nKey] = val;
      const cKey = compactSearchKey(key);
      if (cKey && compactIdx[cKey] === undefined) compactIdx[cKey] = val;
    }
    try {
      Object.defineProperty(dict, '__normIndex', { value: normIdx, enumerable: false, configurable: true });
      Object.defineProperty(dict, '__compactIndex', { value: compactIdx, enumerable: false, configurable: true });
    } catch (e) {}
  }

  function lookupBilingualDict(dict, query, lang) {
    if (!query || !dict) return null;
    const str = String(query).trim();
    if (!str) return '';
    const strategy = _getStrategy(lang);

    // Level 1: 直接精確命中 (Direct Fast Match)
    if (dict[str] !== undefined) {
      return strategy.resolveLookupVal(dict[str], str);
    }

    // 建立或讀取 O(1) 預索引表 (Pre-indexed O(1) Lookup Maps)
    ensureDictIndex(dict);

    // Level 2: 標點符號與括號正規化比對 (O(1) Normalized Match)
    const normTarget = normalizeSearchKey(str);
    if (dict.__normIndex && dict.__normIndex[normTarget] !== undefined) {
      return strategy.resolveLookupVal(dict.__normIndex[normTarget], str);
    }

    // Level 3: 緊湊無視空格比對 (O(1) Compact Match without Whitespace)
    const compactTarget = compactSearchKey(str);
    if (dict.__compactIndex && dict.__compactIndex[compactTarget] !== undefined) {
      return strategy.resolveLookupVal(dict.__compactIndex[compactTarget], str);
    }

    return strategy.fallbackLookup(str);
  }

  const _I18N_FALLBACK_CAPS = /* @GAME_CONFIG_FALLBACK_START */ {"POKEMON_LEVEL_CAP":70,"RECIPE_LEVEL_CAP":70,"THEORETICAL_MAX_LEVEL":100,"ISLAND_BONUS_CAP":95,"ISLAND_BONUS_STEP":5,"RECIPE_MAX_BONUS_PCT":258,"SUBSKILL_UNLOCK_LEVELS":[10,25,50,70,80]} /* @GAME_CONFIG_FALLBACK_END */;

  function _resolveDynamicCaps(str) {
    if (typeof str !== 'string') return str;
    if (!str.includes('{maxRecipe') && !str.includes('{maxIsland') && !str.includes('{islandStep}')) {
      return str;
    }
    const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
               (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
    const maxRecipeLv = (gc && typeof gc.getRecipeLevelCap === 'function')
      ? gc.getRecipeLevelCap()
      : ((gc && gc.CAPS && gc.CAPS.RECIPE_LEVEL_CAP) || _I18N_FALLBACK_CAPS.RECIPE_LEVEL_CAP || 70);
    const maxRecipeBonus = (gc && typeof gc.getRecipeMaxBonusPct === 'function')
      ? gc.getRecipeMaxBonusPct()
      : ((gc && gc.CAPS && gc.CAPS.RECIPE_MAX_BONUS_PCT) || _I18N_FALLBACK_CAPS.RECIPE_MAX_BONUS_PCT || 258);
    const maxIslandPct = (gc && typeof gc.getIslandBonusCap === 'function')
      ? gc.getIslandBonusCap()
      : ((gc && gc.CAPS && gc.CAPS.ISLAND_BONUS_CAP !== undefined) ? gc.CAPS.ISLAND_BONUS_CAP : _I18N_FALLBACK_CAPS.ISLAND_BONUS_CAP);
    const islandStep = (gc && typeof gc.getIslandBonusStep === 'function')
      ? gc.getIslandBonusStep()
      : ((gc && gc.CAPS && gc.CAPS.ISLAND_BONUS_STEP !== undefined) ? gc.CAPS.ISLAND_BONUS_STEP : (_I18N_FALLBACK_CAPS.ISLAND_BONUS_STEP || 5));
    const maxIslandMult = (1 + Number(maxIslandPct) / 100).toFixed(2);

    return str
      .replace(/\{maxRecipeLv\}/g, String(maxRecipeLv))
      .replace(/\{maxRecipeBonus\}/g, String(maxRecipeBonus))
      .replace(/\{maxIslandPct\}/g, String(maxIslandPct))
      .replace(/\{islandStep\}/g, String(islandStep))
      .replace(/\{maxIslandMult\}/g, String(maxIslandMult));
  }

  function t(key, paramsOrFallback, fallbackOrParams) {
    _ensureActiveLocale();
    let params = null;
    let fallback = '';
    if (paramsOrFallback && typeof paramsOrFallback === 'object') {
      params = paramsOrFallback;
      if (typeof fallbackOrParams === 'string') fallback = fallbackOrParams;
    } else {
      if (typeof paramsOrFallback === 'string') fallback = paramsOrFallback;
      if (fallbackOrParams && typeof fallbackOrParams === 'object') params = fallbackOrParams;
    }
    let res = activeDict[key];
    if (res === undefined) {
      res = fallback ? activeStrategy.text(fallback) : key;
    }
    if (params) res = _interpolateParams(res, params);
    return _resolveDynamicCaps(res);
  }

  function getTypeName(type, lang = currentLang) {
    if (!type) return '';
    return lookupBilingualDict(TYPE_NAMES, type, lang) || type;
  }


  function getIngredientName(ing, lang = currentLang) {
    if (!ing) return '';
    const raw = typeof ing === 'string' ? ing : (ing.name || ing.name_cn || ing.name_tw || ing.name_en || '');
    if (!raw) return '';
    return lookupBilingualDict(INGREDIENT_NAMES, raw, lang) || raw;
  }

  function getRecipeName(rec, lang) {
    if (!rec) return '';
    const strategy = _getStrategy(lang);
    let name_cn = '';
    let name_en = '';
    if (typeof rec === 'object') {
      name_cn = rec.name_cn || rec.name_tw || rec.name || '';
      name_en = rec.name_en || '';
    } else if (typeof rec === 'string') {
      name_cn = rec;
    }
    if (!name_cn && !name_en) return '';

    if (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__)) {
      const match = window.__RECIPES_CACHE__.find(r =>
        (name_cn && (r.name_cn === name_cn || r.name_tw === name_cn || r.name === name_cn || r.name_en === name_cn)) ||
        (name_en && (r.name_en === name_en || r.name_cn === name_en))
      );
      if (match) {
        name_cn = match.name_cn || match.name_tw || name_cn;
        name_en = match.name_en || name_en;
      }
    }

    return strategy.recipeFromNames(name_cn, name_en);
  }

  function getBerryName(berry, lang) {
    if (!berry) return '';
    return lookupBilingualDict(BERRY_NAMES, berry, lang) || berry;
  }

  function getNatureName(nat, lang) {
    if (!nat) return '';
    return lookupBilingualDict(NATURE_NAMES, nat, lang) || nat;
  }

  function getMainSkillName(skill, lang) {
    if (!skill) return '';
    const strategy = _getStrategy(lang);
    const res = lookupBilingualDict(MAIN_SKILL_NAMES, skill, strategy.lang);
    if (res) return res;

    // 支援整段括號包覆（如 "(幫手支援S)"）與複合型括號變體（如 "能量填充S (隨機)"）
    const trimmed = String(skill).trim();
    const outerParen = trimmed.match(/^([(\[（【])([^()\[\]（）【】]+)([)\]）】])$/);
    if (outerParen) {
      return `${outerParen[1]}${getMainSkillName(outerParen[2], strategy.lang)}${outerParen[3]}`;
    }
    const parenMatch = trimmed.match(/^(.+?)\s*([(\[（【].+[)\]）】])$/);
    if (parenMatch) {
      const baseSkill = getMainSkillName(parenMatch[1], strategy.lang);
      const suffix = strategy.text(parenMatch[2]);
      return `${baseSkill} ${suffix}`;
    }
    return strategy.fallbackLookup(trimmed) || trimmed;
  }


  function _resolvePokemonNameEn(str) {
    // Level 1 & 2 & 3 字典比對 (O(1))
    const direct = lookupBilingualDict(POKEMON_NAMES, str, 'en-US');
    if (direct) return direct;

    // Level 4: 支援括號後綴（如 毒骷蛙 (ABB)、皮卡丘（萬聖節）等）
    const parenMatch = str.match(/^(.+?)\s*([(\[（【].+[)\]）】])$/);
    if (parenMatch) {
      const baseName = _resolvePokemonNameEn(parenMatch[1]);
      const suffix = _translateDynamicToEn(parenMatch[2]);
      return `${baseName} ${suffix}`;
    }

    // Level 5: 搜尋全域陣列備援 (O(1) 預索引快取)
    if (typeof window !== 'undefined' && Array.isArray(window.allPokemons)) {
      if (_allPkmEnMapRef !== window.allPokemons || _allPkmEnMapLen !== window.allPokemons.length || !_allPkmEnMap) {
        _allPkmEnMapRef = window.allPokemons;
        _allPkmEnMapLen = window.allPokemons.length;
        _allPkmEnMap = Object.create(null);
        for (let i = 0; i < window.allPokemons.length; i++) {
          const p = window.allPokemons[i];
          if (!p || !p.name_en) continue;
          if (p.name_cn) {
            _allPkmEnMap[p.name_cn] = p.name_en;
            _allPkmEnMap[normalizeSearchKey(p.name_cn)] = p.name_en;
          }
          if (p.name && typeof p.name === 'string') {
            _allPkmEnMap[p.name] = p.name_en;
          }
        }
      }
      const mapped = _allPkmEnMap[str] || _allPkmEnMap[normalizeSearchKey(str)];
      if (mapped) return mapped;
    }

    return str;
  }

  function formatCompactRegionalName(displayName) {
    if (!displayName || typeof displayName !== 'string') return displayName || '';
    let out = displayName.replace(
      /([（(])\s*(阿羅拉|阿罗拉|伽勒爾|伽勒尔|洗翠|帕底亞|帕底亚)的(?:樣子|样子)\s*([）)])/g,
      '$1$2$3'
    );
    out = out.replace(
      /(\()\s*(Alola|Alolan|Galar|Galarian|Hisui|Hisuian|Paldea|Paldean)(?:\s+Form)?\s*(\))/gi,
      function (_m, open, region, close) {
        const lower = region.toLowerCase();
        if (lower.startsWith('alola')) return open + 'Alola' + close;
        if (lower.startsWith('galar')) return open + 'Galar' + close;
        if (lower.startsWith('hisui')) return open + 'Hisui' + close;
        if (lower.startsWith('paldea')) return open + 'Paldea' + close;
        return _m;
      }
    );
    return out;
  }

  function getPokemonName(name, lang) {
    if (!name) return '';
    const strategy = _getStrategy(lang);
    const resolved = (typeof name === 'object')
      ? strategy.pokemonFromObj(name)
      : strategy.pokemonFromStr(String(name).trim());
    return formatCompactRegionalName(resolved);
  }

  function getSubSkillName(subskill, lang) {
    if (!subskill) return '';
    const res = lookupBilingualDict(SUBSKILL_NAMES, subskill, lang);
    return res || String(subskill).trim();
  }


  function translateDynamicText(text) {
    if (!text || typeof text !== 'string') return text;
    _ensureActiveLocale();
    return activeStrategy.text(text);
  }


  function updatePageTranslations() {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key, el.textContent);
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        el.innerHTML = t(key, el.innerHTML);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', t(key, el.getAttribute('placeholder')));
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', t(key, el.getAttribute('title')));
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) {
        el.setAttribute('aria-label', t(key, el.getAttribute('aria-label')));
      }
    });

    document.querySelectorAll('.search-filtering-badge').forEach(badge => {
      const labelSpan = badge.querySelector('span:last-child');
      if (labelSpan) {
        labelSpan.textContent = t('common.filtered');
      }
    });

    if (typeof Event !== 'undefined') {
      document.querySelectorAll('select').forEach(sel => {
        try { sel.dispatchEvent(new Event('sync-ui')); } catch (e) {}
      });
    }
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

  function getShortMainSkillName(skill) {
    _ensureActiveLocale();
    return activeStrategy.shortenSkill(getMainSkillName(skill));
  }

  let _itemsDataRef = null;
  let _itemsDataIndex = null;

  function getItemName(item, lang) {
    if (!item) return '';
    const strategy = _getStrategy(lang);
    if (typeof item === 'object' && item.name) {
      return strategy.pick(item.name);
    }
    if (typeof window !== 'undefined' && Array.isArray(window.ITEMS_DATA)) {
      if (_itemsDataRef !== window.ITEMS_DATA || !_itemsDataIndex) {
        _itemsDataRef = window.ITEMS_DATA;
        _itemsDataIndex = Object.create(null);
        for (let i = 0; i < window.ITEMS_DATA.length; i++) {
          const x = window.ITEMS_DATA[i];
          if (!x) continue;
          if (x.id) _itemsDataIndex[x.id] = x;
          if (x.name) {
            if (x.name['zh-TW']) _itemsDataIndex[x.name['zh-TW']] = x;
            if (x.name['zh-CN']) _itemsDataIndex[x.name['zh-CN']] = x;
            if (x.name['en-US']) _itemsDataIndex[x.name['en-US']] = x;
          }
        }
      }
      const match = _itemsDataIndex[item];
      if (match && match.name) {
        return strategy.pick(match.name);
      }
    }
    const res = lookupBilingualDict(ITEM_NAMES, item, strategy.lang);
    if (res) return res;
    return strategy.fallbackLookup(item) || item;
  }

  function getIslandName(island, lang) {
    if (!island) return '';
    const strategy = _getStrategy(lang);
    const res = lookupBilingualDict(ISLAND_NAMES, island, strategy.lang);
    if (res) return res;
    return strategy.fallbackLookup(island) || island;
  }

  /**
   * 全站搜尋框醒目提示與條件過濾標籤同步器
   * 當搜尋框內有輸入文字時，自動為 input 與外層 container 加上 .has-value，
   * 並動態注入 / 更新「條件篩選中 (Filtered)」醒目標籤與清空按鈕
   */
  function updateSearchInputHighlight(input, clearBtn) {
    if (!input) return;
    const hasVal = Boolean(input.value && input.value.trim().length > 0);
    if (clearBtn) {
      clearBtn.style.display = hasVal ? 'flex' : 'none';
    }
    input.classList.toggle('has-value', hasVal);
    const container = input.closest('.search-box, .news-search-box, .sidebar-search-box, .search-container, .box-pkm-search-box, .search-filter-row');
    if (container) {
      container.classList.toggle('has-value', hasVal);
      let badge = container.querySelector('.search-filtering-badge');
      if (hasVal) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'search-filtering-badge';
          if (clearBtn && clearBtn.parentNode === container) {
            container.insertBefore(badge, clearBtn);
          } else {
            container.appendChild(badge);
          }
        }
        badge.innerHTML = `<span class="search-pulse-dot"></span><span>${t('common.filtered')}</span>`;
      } else if (badge) {
        badge.remove();
      }
    }
  }

  // 全域監聽所有搜尋框輸入事件，確保 100% 即時呈現醒目外觀與標籤
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('input', (e) => {
      const target = e.target;
      if (target && target.tagName === 'INPUT' && (
        target.classList.contains('search-input') ||
        target.classList.contains('news-search-input') ||
        target.classList.contains('sidebar-search-input') ||
        target.classList.contains('box-pkm-search-input') ||
        (target.id && target.id.toLowerCase().includes('search'))
      )) {
        const clearBtn = target.parentElement ? target.parentElement.querySelector('.search-clear-btn, [id*="clear"]') : null;
        updateSearchInputHighlight(target, clearBtn);
      }
    });
  }

  const I18NExport = {
    t, STR, field, pick, text, getDateLocale, registerResources,
    getLanguage, setLanguage, toSimplified: toSimplifiedChinese, updateSearchInputHighlight,
    getTypeName, getTypeIconSvg, TYPE_SVG_PATHS, TYPE_CANONICAL_MAP,
    getSpecialtyName, getSpecialtyKey, getSpecialtyIconHtml,
    getIngredientName, getIngredientIcon, getRecipeName, getBerryName, getNatureName,
    getPokemonName, getMainSkillName, getShortMainSkillName, shortenSkillName, getSubSkillName,
    translateDynamicText, getItemName, getIslandName, updatePageTranslations,
    hydrateAppShells: typeof hydrateAppShells === 'function' ? hydrateAppShells : undefined,
    DICTIONARY, POKEMON_NAMES, TYPE_NAMES, SPECIALTY_NAMES, INGREDIENT_NAMES,
    INGREDIENT_ICONS, BERRY_NAMES, NATURE_NAMES, MAIN_SKILL_NAMES, SUBSKILL_NAMES, ITEM_NAMES, ISLAND_NAMES
  };

  if (typeof window !== 'undefined') {
    window.I18N = I18NExport;
    window.STR = STR;
    window.$t = t;
    window.getSpecialtyIconHtml = getSpecialtyIconHtml;
    window.getSpecialtyKey = getSpecialtyKey;
    window.updateSearchInputHighlight = updateSearchInputHighlight;
  }

  initLanguage();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18NExport;
  }
})();
