  // ─── 預解析統一字串資源引擎 (Pre-Resolved Unified String Resource Engine) ───
  // 在初始化與切換語言時預先鎖定語系資源包與策略物件，業務與 UI 層無需重複判斷語言。

  const RESOLVED_BUNDLES = {
    'zh-TW': Object.create(null),
    'zh-CN': Object.create(null),
    'en-US': Object.create(null)
  };

  const LANG_ALIAS_MAP = {
    'zh-TW': 'zh-TW', 'zh-Hant': 'zh-TW', 'tw': 'zh-TW',
    'zh-CN': 'zh-CN', 'zh-Hans': 'zh-CN', 'cn': 'zh-CN',
    'en-US': 'en-US', 'en': 'en-US'
  };

  function _bootstrapResolvedBundles() {
    const tw = DICTIONARY['zh-TW'] || {};
    const cn = DICTIONARY['zh-CN'] || {};
    const en = DICTIONARY['en-US'] || {};
    const keys = Object.keys(tw);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      RESOLVED_BUNDLES['zh-TW'][k] = tw[k];
      RESOLVED_BUNDLES['zh-CN'][k] = cn[k] !== undefined ? cn[k] : toSimplifiedChinese(tw[k]);
      RESOLVED_BUNDLES['en-US'][k] = en[k] !== undefined ? en[k] : tw[k];
    }
    for (const k in cn) {
      if (Object.prototype.hasOwnProperty.call(cn, k) && RESOLVED_BUNDLES['zh-CN'][k] === undefined) {
        RESOLVED_BUNDLES['zh-CN'][k] = cn[k];
      }
    }
    for (const k in en) {
      if (Object.prototype.hasOwnProperty.call(en, k) && RESOLVED_BUNDLES['en-US'][k] === undefined) {
        RESOLVED_BUNDLES['en-US'][k] = en[k];
      }
    }
  }
  _bootstrapResolvedBundles();

  function registerResources(entries) {
    if (!entries || typeof entries !== 'object') return;
    const twDict = DICTIONARY['zh-TW'];
    const cnDict = DICTIONARY['zh-CN'];
    const enDict = DICTIONARY['en-US'];
    const twRes = RESOLVED_BUNDLES['zh-TW'];
    const cnRes = RESOLVED_BUNDLES['zh-CN'];
    const enRes = RESOLVED_BUNDLES['en-US'];

    const keys = Object.keys(entries);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const entry = entries[k];
      if (!entry) continue;
      let tw, en, cn;
      if (Array.isArray(entry)) {
        tw = entry[0];
        en = entry[1];
        cn = entry[2];
      } else if (typeof entry === 'object') {
        tw = entry['zh-TW'] !== undefined ? entry['zh-TW'] : entry.tw;
        en = entry['en-US'] !== undefined ? entry['en-US'] : entry.en;
        cn = entry['zh-CN'] !== undefined ? entry['zh-CN'] : entry.cn;
      } else {
        continue;
      }
      const resolvedTw = tw !== undefined ? String(tw) : '';
      const resolvedCn = cn !== undefined ? String(cn) : toSimplifiedChinese(resolvedTw);
      const resolvedEn = en !== undefined ? String(en) : resolvedTw;
      twDict[k] = resolvedTw;
      cnDict[k] = resolvedCn;
      enDict[k] = resolvedEn;
      twRes[k] = resolvedTw;
      cnRes[k] = resolvedCn;
      enRes[k] = resolvedEn;
    }
  }

  function _transformFieldVal(val, fn) {
    if (val === undefined || val === null) return '';
    if (Array.isArray(val)) return fn ? val.map(v => (typeof v === 'string' ? fn(v) : v)) : val;
    if (typeof val === 'string') return fn ? fn(val) : val;
    return val;
  }

  const LOCALE_STRATEGIES = {
    'zh-TW': {
      lang: 'zh-TW',
      docLang: 'zh-Hant',
      dataLang: 'zh-TW',
      dateLocale: 'zh-TW',
      dict: RESOLVED_BUNDLES['zh-TW'],
      pick(map) {
        if (map == null) return '';
        if (typeof map !== 'object') return String(map);
        if (map['zh-TW'] !== undefined) return map['zh-TW'];
        if (map.tw !== undefined) return map.tw;
        if (map['zh-CN'] !== undefined) return map['zh-CN'];
        if (map.cn !== undefined) return map.cn;
        if (map['en-US'] !== undefined) return map['en-US'];
        if (map.en !== undefined) return map.en;
        return '';
      },
      field(obj, baseKey) {
        if (!obj || typeof obj !== 'object') return '';
        const direct = obj[baseKey];
        if (direct && typeof direct === 'object' && !Array.isArray(direct)) {
          return this.pick(direct);
        }
        const twVal = obj[baseKey + '_tw'];
        if (twVal !== undefined && twVal !== null && twVal !== '') return twVal;
        if (direct !== undefined && direct !== null && direct !== '') return direct;
        const cnVal = obj[baseKey + '_cn'];
        if (cnVal !== undefined && cnVal !== null && cnVal !== '') return cnVal;
        return obj[baseKey + '_en'] ?? '';
      },
      text(str) {
        return str == null ? '' : String(str);
      },
      shortenSkill(name) {
        return name || '';
      },
      resolveLookupVal(val, rawStr) {
        if (typeof val === 'object') return val['zh-TW'] || val['en-US'] || rawStr;
        return val;
      },
      fallbackLookup() {
        return null;
      },
      pokemonFromObj(obj) {
        return obj.name_cn || obj.name_en || obj.name || '';
      },
      pokemonFromStr(str) {
        return str;
      },
      recipeFromNames(nameCn, nameEn) {
        return nameCn || nameEn || '';
      }
    },
    'zh-CN': {
      lang: 'zh-CN',
      docLang: 'zh-Hans',
      dataLang: 'zh-CN',
      dateLocale: 'zh-CN',
      dict: RESOLVED_BUNDLES['zh-CN'],
      pick(map) {
        if (map == null) return '';
        if (typeof map !== 'object') return toSimplifiedChinese(String(map));
        if (map['zh-CN'] !== undefined) return typeof map['zh-CN'] === 'string' ? toSimplifiedChinese(map['zh-CN']) : map['zh-CN'];
        if (map.cn !== undefined) return typeof map.cn === 'string' ? toSimplifiedChinese(map.cn) : map.cn;
        const tw = map['zh-TW'] !== undefined ? map['zh-TW'] : map.tw;
        if (tw !== undefined) return typeof tw === 'string' ? toSimplifiedChinese(tw) : tw;
        return map['en-US'] ?? map.en ?? '';
      },
      field(obj, baseKey) {
        if (!obj || typeof obj !== 'object') return '';
        const direct = obj[baseKey];
        if (direct && typeof direct === 'object' && !Array.isArray(direct)) {
          return this.pick(direct);
        }
        const cnVal = obj[baseKey + '_cn'];
        if (cnVal !== undefined && cnVal !== null && cnVal !== '') {
          return _transformFieldVal(cnVal, toSimplifiedChinese);
        }
        const twVal = obj[baseKey + '_tw'];
        if (twVal !== undefined && twVal !== null && twVal !== '') {
          return _transformFieldVal(twVal, toSimplifiedChinese);
        }
        if (direct !== undefined && direct !== null && direct !== '') {
          return _transformFieldVal(direct, toSimplifiedChinese);
        }
        return obj[baseKey + '_en'] ?? '';
      },
      text(str) {
        return str == null ? '' : toSimplifiedChinese(String(str));
      },
      shortenSkill(name) {
        return name || '';
      },
      resolveLookupVal(val, rawStr) {
        if (typeof val === 'object') {
          return val['zh-CN'] || toSimplifiedChinese(val['zh-TW'] || val['en-US'] || rawStr);
        }
        return toSimplifiedChinese(val);
      },
      fallbackLookup(rawStr) {
        return toSimplifiedChinese(rawStr);
      },
      pokemonFromObj(obj) {
        return toSimplifiedChinese(obj.name_cn || obj.name_en || obj.name || '');
      },
      pokemonFromStr(str) {
        return toSimplifiedChinese(str);
      },
      recipeFromNames(nameCn, nameEn) {
        return toSimplifiedChinese(nameCn || nameEn || '');
      }
    },
    'en-US': {
      lang: 'en-US',
      docLang: 'en',
      dataLang: 'en',
      dateLocale: 'en-US',
      dict: RESOLVED_BUNDLES['en-US'],
      pick(map) {
        if (map == null) return '';
        if (typeof map !== 'object') return _translateDynamicToEn(String(map));
        if (map['en-US'] !== undefined) return map['en-US'];
        if (map.en !== undefined) return map.en;
        const tw = map['zh-TW'] !== undefined ? map['zh-TW'] : map.tw;
        if (tw !== undefined) return typeof tw === 'string' ? _translateDynamicToEn(tw) : tw;
        return '';
      },
      field(obj, baseKey) {
        if (!obj || typeof obj !== 'object') return '';
        const direct = obj[baseKey];
        if (direct && typeof direct === 'object' && !Array.isArray(direct)) {
          return this.pick(direct);
        }
        const enVal = obj[baseKey + '_en'];
        if (enVal !== undefined && enVal !== null && enVal !== '') return enVal;
        const raw = (direct !== undefined && direct !== null && direct !== '')
          ? direct
          : (obj[baseKey + '_tw'] ?? obj[baseKey + '_cn'] ?? '');
        return _transformFieldVal(raw, _translateDynamicToEn);
      },
      text(str) {
        return str == null ? '' : _translateDynamicToEn(String(str));
      },
      shortenSkill(name) {
        return shortenSkillName(name || '');
      },
      resolveLookupVal(val, rawStr) {
        if (typeof val === 'object') return val['en-US'] || val['zh-TW'] || rawStr;
        return val;
      },
      fallbackLookup() {
        return null;
      },
      pokemonFromObj(obj) {
        return obj.name_en || obj.name_cn || obj.name || '';
      },
      pokemonFromStr(str) {
        return _resolvePokemonNameEn(str);
      },
      recipeFromNames(nameCn, nameEn) {
        return nameEn || nameCn || '';
      }
    }
  };

  let activeStrategy = LOCALE_STRATEGIES[DEFAULT_LANG];
  let activeDict = activeStrategy.dict;

  function syncActiveLocale(lang) {
    const canonical = (typeof lang === 'string' && LANG_ALIAS_MAP[lang.trim()]) || DEFAULT_LANG;
    const strat = LOCALE_STRATEGIES[canonical] || LOCALE_STRATEGIES[DEFAULT_LANG];
    currentLang = strat.lang;
    activeStrategy = strat;
    activeDict = strat.dict;
  }

  function _ensureActiveLocale() {
    if (typeof I18NExport !== 'undefined' && I18NExport.getLanguage !== getLanguage && typeof I18NExport.getLanguage === 'function') {
      const patched = I18NExport.getLanguage();
      if (patched && patched !== activeStrategy.lang) {
        const canonical = LANG_ALIAS_MAP[String(patched).trim()];
        if (canonical && LOCALE_STRATEGIES[canonical]) {
          syncActiveLocale(canonical);
        }
      }
    }
  }

  function _getStrategy(lang) {
    _ensureActiveLocale();
    if (!lang || lang === activeStrategy.lang) return activeStrategy;
    const canonical = typeof lang === 'string' ? LANG_ALIAS_MAP[lang.trim()] : null;
    return (canonical && LOCALE_STRATEGIES[canonical]) || activeStrategy;
  }

  function _interpolateParams(str, params) {
    if (!params || typeof params !== 'object' || typeof str !== 'string' || !str.includes('{')) {
      return str;
    }
    return str.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, token) => {
      return Object.prototype.hasOwnProperty.call(params, token) && params[token] !== undefined && params[token] !== null
        ? String(params[token])
        : match;
    });
  }

  function field(obj, baseKey) {
    _ensureActiveLocale();
    return activeStrategy.field(obj, baseKey);
  }

  function pick(map) {
    _ensureActiveLocale();
    return activeStrategy.pick(map);
  }

  function text(str) {
    _ensureActiveLocale();
    return activeStrategy.text(str);
  }

  function getDateLocale() {
    _ensureActiveLocale();
    return activeStrategy.dateLocale;
  }

  const STR = (typeof Proxy === 'function')
    ? new Proxy(Object.create(null), {
        get(_target, prop) {
          if (typeof prop !== 'string') return undefined;
          _ensureActiveLocale();
          const val = activeDict[prop];
          return val !== undefined ? _resolveDynamicCaps(val) : prop;
        },
        has(_target, prop) {
          _ensureActiveLocale();
          return typeof prop === 'string' && prop in activeDict;
        },
        ownKeys() {
          _ensureActiveLocale();
          return Object.keys(activeDict);
        },
        getOwnPropertyDescriptor(_target, prop) {
          _ensureActiveLocale();
          if (typeof prop === 'string' && prop in activeDict) {
            return { enumerable: true, configurable: true, value: _resolveDynamicCaps(activeDict[prop]) };
          }
          return undefined;
        }
      })
    : activeDict;

  // 核心共用資源（供 i18n_core 本身與全站共用，消除內聯語系判斷）
  registerResources({
    'common.filtered': ['條件篩選中', 'Filtered', '条件筛选中']
  });
