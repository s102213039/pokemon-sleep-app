  const SUPPORTED_LANGS = ['zh-TW', 'zh-CN', 'en-US'];

  function initLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && SUPPORTED_LANGS.includes(saved)) {
        currentLang = saved;
      }
    } catch (e) {}

    if (typeof document !== 'undefined' && document.documentElement) {
      const docLang = currentLang === 'zh-TW' ? 'zh-Hant' : (currentLang === 'zh-CN' ? 'zh-Hans' : 'en');
      const dataLang = currentLang === 'zh-TW' ? 'zh-TW' : (currentLang === 'zh-CN' ? 'zh-CN' : 'en');
      document.documentElement.setAttribute('lang', docLang);
      document.documentElement.setAttribute('data-lang', dataLang);
      const onReady = () => {
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
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {}

    if (typeof document !== 'undefined' && document.documentElement) {
      const docLang = lang === 'zh-TW' ? 'zh-Hant' : (lang === 'zh-CN' ? 'zh-Hans' : 'en');
      const dataLang = lang === 'zh-TW' ? 'zh-TW' : (lang === 'zh-CN' ? 'zh-CN' : 'en');
      document.documentElement.setAttribute('lang', docLang);
      document.documentElement.setAttribute('data-lang', dataLang);
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

  function lookupBilingualDict(dict, query, lang = currentLang) {
    if (!query || !dict) return null;
    const str = String(query).trim();
    if (!str) return '';

    function getResultFromVal(val) {
      if (typeof val === 'object') {
        if (lang === 'zh-CN') {
          return val['zh-CN'] || toSimplifiedChinese(val['zh-TW'] || val['en-US'] || str);
        }
        return val[lang] || val['en-US'] || str;
      }
      return lang === 'zh-CN' ? toSimplifiedChinese(val) : val;
    }

    // Level 1: 直接精確命中 (Direct Fast Match)
    if (dict[str] !== undefined) {
      return getResultFromVal(dict[str]);
    }

    // 建立或讀取 O(1) 預索引表 (Pre-indexed O(1) Lookup Maps)
    ensureDictIndex(dict);

    // Level 2: 標點符號與括號正規化比對 (O(1) Normalized Match)
    const normTarget = normalizeSearchKey(str);
    if (dict.__normIndex && dict.__normIndex[normTarget] !== undefined) {
      return getResultFromVal(dict.__normIndex[normTarget]);
    }

    // Level 3: 緊湊無視空格比對 (O(1) Compact Match without Whitespace)
    const compactTarget = compactSearchKey(str);
    if (dict.__compactIndex && dict.__compactIndex[compactTarget] !== undefined) {
      return getResultFromVal(dict.__compactIndex[compactTarget]);
    }

    if (lang === 'zh-CN') {
      return toSimplifiedChinese(str);
    }

    return null;
  }

  function t(key, fallback = '') {
    const dict = DICTIONARY[currentLang] || DICTIONARY[DEFAULT_LANG];
    if (dict && dict[key] !== undefined) return dict[key];
    if (currentLang === 'zh-CN') {
      const twVal = DICTIONARY['zh-TW'] && DICTIONARY['zh-TW'][key];
      if (twVal !== undefined) return toSimplifiedChinese(twVal);
      if (fallback) return toSimplifiedChinese(fallback);
    }
    return fallback || key;
  }

  function getTypeName(type) {
    if (!type) return '';
    return lookupBilingualDict(TYPE_NAMES, type) || type;
  }

  const TYPE_SVG_PATHS = {
    bug: '<path clip-rule="evenodd" d="m342.198.501279c.373-.5317158 1.105-.660937 1.637-.288625l36.354 25.455546c.532.3723.661 1.1051.289 1.6368l-50.599 72.2623c24.599 7.8587 41.358 16.3357 41.358 16.3357s-40.964 70.462-110.443 70.462-118.85-65.672-118.85-65.672 17.506-11.172 43.456-20.7539l-55.5-66.1415c-.417-.4973-.352-1.2386.145-1.6558l33.997-28.52715c.498-.41723 1.239-.35238 1.656.14487l70.272 83.74688c6.017-.6806 12.147-1.061 18.333-1.061 8.891 0 17.771.6759 26.44 1.8229zm13.746 189.200721c18.541-13.242 46.597-47.804 46.597-47.804s71.664 56.79 71.664 177.206c0 120.415-123.896 192.888-123.896 192.888s-59.195-59.781-73.727-135.562c-14.531-75.781 21.496-159.927 21.496-159.927s39.324-13.559 57.866-26.801zm-199.683 0c-18.541-13.242-46.597-47.804-46.597-47.804s-71.664 56.79-71.664 177.206c0 120.415 123.896 192.888 123.896 192.888s59.195-59.781 73.727-135.562c14.531-75.781-21.496-159.927-21.496-159.927s-39.324-13.559-57.866-26.801z" fill="currentColor" fill-rule="evenodd"/>',
    dark: '<path fill-rule="evenodd" clip-rule="evenodd" d="M229.379 452.85C239.106 454.339 249.068 455.111 259.212 455.111C367.214 455.111 454.767 367.558 454.767 259.556C454.767 151.553 367.214 64 259.212 64C251.966 64 244.811 64.3941 237.77 65.1621C291.345 105.751 326.767 176.062 326.767 256C326.767 340.04 287.616 413.44 229.379 452.85ZM255.656 512C397.041 512 511.656 397.385 511.656 256C511.656 114.615 397.041 0 255.656 0C114.271 0 -0.34375 114.615 -0.34375 256C-0.34375 397.385 114.271 512 255.656 512Z" fill="currentColor"/>',
    dragon: '<path fill-rule="evenodd" clip-rule="evenodd" d="M280.702 254.881C284.172 252.765 287.116 248.331 289.49 243.403C320.735 256.173 342.692 286.349 342.692 321.54C342.692 368.29 303.942 406.189 256.142 406.189C236.52 406.189 218.423 399.802 203.906 389.039C199.144 386.784 195.226 384.618 192.02 382.845C187.047 380.096 183.786 378.293 181.744 378.575C175.775 379.398 177.508 384.89 179.083 389.879C180.152 393.268 181.149 396.425 179.606 397.727C177.992 399.091 172.764 394.106 166.655 388.282C158.339 380.353 148.391 370.868 143.7 373.717C139.991 375.97 143.592 382.081 148 389.561L148.327 390.116C150.189 393.278 152.347 396.498 154.316 399.436C158.319 405.407 161.543 410.219 159.93 411.033C157.98 412.017 144.394 402.847 132.945 390.116C128.526 385.203 124.246 379.877 120.268 374.928L120.268 374.927C111.561 364.093 104.307 355.068 100.235 356.137C95.3365 357.423 99.0421 367.527 104.487 377.25C107.033 381.797 110.028 386.427 112.621 390.436L112.621 390.437C116.654 396.671 119.715 401.402 118.605 401.984C117.107 402.767 103.926 389.914 94.9734 373.717C89.6559 364.096 85.1909 353.464 81.5761 344.857C77.656 335.522 74.7359 328.569 72.8131 327.869C66.1325 325.438 66.1325 339.059 68.8119 358.718C69.1614 361.283 69.6819 363.973 70.3228 366.712C96.307 450.785 176.128 512 270.567 512C386.084 512 479.728 420.412 479.728 307.432C479.728 199.9 394.899 111.747 287.12 103.494C287.256 98.4284 289.9 88.383 289.9 88.383C289.9 88.383 308.927 42.3472 309.933 32.5099C309.999 31.857 310.078 31.1475 310.163 30.3919C311.348 19.7629 313.553 0 296.551 0C287.471 0 283.249 6.75464 278.42 14.4799L278.42 14.48C276.566 17.4457 274.622 20.5545 272.28 23.479C255.412 44.5436 227.048 70.8488 210.965 84.8631C176.971 114.484 143.619 138.828 124.167 153.026L124.167 153.026L124.166 153.027C115.319 159.484 109.348 163.843 107.5 165.644C93.574 179.22 43.6418 269.286 43.6418 269.286C43.6418 269.286 27.4943 298.182 33.2338 304.043C38.9733 309.903 52.8141 308.56 52.8141 308.56C52.8141 308.56 238.755 265.903 255.402 262.539C259.884 261.633 263.048 261.11 265.477 260.709C272.072 259.62 273.256 259.424 280.702 254.881ZM149.235 200.064C139.254 209.551 122.701 232.196 122.701 232.196C122.701 232.196 153.465 234.091 170.408 217.986C187.352 201.88 183.47 174.433 183.47 174.433C183.47 174.433 159.215 190.577 149.235 200.064Z" fill="currentColor"/>',
    electric: '<path fill-rule="evenodd" clip-rule="evenodd" d="M152.56 0.583659C152.461 0.29796 152.674 0 152.976 0H332.805C332.998 0 333.169 0.125587 333.226 0.309782L415.824 267.171C415.911 267.454 415.7 267.741 415.403 267.741H295.684C295.538 267.741 295.433 267.88 295.473 268.021L364.135 509.726C364.269 510.195 363.654 510.501 363.361 510.111L96.5295 155.267C96.3115 154.977 96.5184 154.563 96.881 154.563H205.536C205.687 154.563 205.793 154.414 205.743 154.271L152.56 0.583659Z" fill="currentColor"/>',
    fairy: '<path fill-rule="evenodd" clip-rule="evenodd" d="M102.726 405.978L184.848 382.166L255.778 511.857C255.871 512.025 256.112 512.025 256.204 511.857L327.134 382.166L409.257 405.978C409.441 406.031 409.612 405.86 409.557 405.676L385.741 325.179L511.856 256.204C512.025 256.112 512.025 255.871 511.857 255.779L384.702 186.235L409.557 102.225C409.612 102.041 409.441 101.87 409.257 101.923L325.208 126.294L256.204 0.126188C256.112 -0.0420597 255.871 -0.0420644 255.779 0.126184L186.775 126.294L102.726 101.923C102.542 101.87 102.371 102.041 102.426 102.225L127.281 186.235L0.126188 255.779C-0.0420597 255.871 -0.0420644 256.112 0.126184 256.204L126.241 325.179L102.426 405.676C102.371 405.86 102.542 406.031 102.726 405.978ZM166.452 256.876L224.631 288.695L256.45 346.873C256.542 347.042 256.784 347.042 256.876 346.873L288.695 288.695L346.873 256.876C347.041 256.784 347.041 256.542 346.873 256.45L288.695 224.631L256.876 166.453C256.784 166.284 256.542 166.284 256.45 166.453L224.631 224.631L166.452 256.45C166.284 256.542 166.284 256.784 166.452 256.876Z" fill="currentColor"/>',
    fighting: '<path fill-rule="evenodd" clip-rule="evenodd" d="M88.2336 42.5656C94.4299 18.1014 116.593 0 142.983 0C162.778 0 180.195 10.1847 190.279 25.6H206.792C217.051 15.0716 231.384 8.53333 247.245 8.53333C270.499 8.53333 290.471 22.5882 299.129 42.6667H312.954C321.617 37.2585 331.853 34.1333 342.818 34.1333C366.073 34.1333 386.044 48.1882 394.702 68.2667H432.297C432.618 68.2667 432.919 68.3532 433.178 68.5041C434.895 68.347 436.634 68.2667 438.391 68.2667C469.582 68.2667 494.866 93.5514 494.866 124.742V294.086L494.867 294.4L494.866 294.714V297.153C494.866 298.186 494.838 299.215 494.782 300.239C491.384 417.717 385.749 512 255.933 512C123.974 512 17 414.577 17 294.4C17 236.391 41.9249 183.683 82.5535 144.675C82.4522 201.228 83.4074 259.694 87.8107 258.691C99.6011 256.003 90.3891 80.8395 88.2336 42.5656Z" fill="currentColor"/>',
    fire: '<path fill-rule="evenodd" clip-rule="evenodd" d="M352.258 395.394C358.584 372.263 346.305 324.71 346.305 324.71C346.305 324.71 337.399 363.449 323.483 377.767C311.611 389.98 297.066 398.451 276.206 400.677C293.261 392.393 304.99 375.12 304.99 355.155C304.99 327.129 281.878 304.409 253.368 304.409C224.858 304.409 201.745 327.129 201.745 355.155C201.745 362.809 203.47 370.068 206.557 376.576C188.725 362.37 185.921 339.594 185.921 339.594C185.921 339.594 166.009 422.264 220.875 461.152C275.74 500.04 383.219 466.614 383.219 466.614C383.219 466.614 229.41 574.837 115.436 457.05C17.2568 355.584 89.8111 222.003 89.8111 222.003C89.8111 222.003 86.6777 234.395 86.6777 248.78C86.6777 263.165 94.477 274.11 94.477 274.11C94.477 274.11 117.742 225.071 135.848 205.128C152.984 186.254 174.465 170.946 193.019 157.724C207.301 147.546 219.849 138.604 227.343 130.223C268.62 84.0687 243.311 0 243.311 0C243.311 0 289.841 41.02 302.831 93.9978C307.783 114.192 304.597 137.169 301.749 157.716C297.125 191.072 293.388 218.025 326.793 216.276C380.775 213.449 333.866 130.223 333.866 130.223C333.866 130.223 456.318 194.583 447.17 307.145C438.021 419.707 313.324 445.297 313.324 445.297C313.324 445.297 345.931 418.525 352.258 395.394Z" fill="currentColor"/>',
    flying: '<path fill-rule="evenodd" clip-rule="evenodd" d="M178.712 477.733C253.715 477.733 317.927 436.048 344.436 376.956C344.76 376.235 238.007 404.699 241.411 394.637C242.931 390.144 308.371 366.238 356.048 338.354C383.451 322.327 396.07 288.4 396.07 288.4C396.07 288.4 349.903 310.815 326.564 316.501C279.532 327.961 238.131 326.727 238.131 325.533C238.131 322.951 306.876 309.889 402.424 251.664C447.367 224.277 459.574 177.103 459.574 177.103C459.574 177.103 410.163 206.535 380.293 216.252C309.457 239.295 244.815 246.239 244.815 243.121C244.815 236.445 301.702 220.802 362.016 191.577C393.376 176.382 420.535 156.53 452.008 134.453C503.506 98.332 511.999 34 511.999 34C511.999 34 461.207 66.7601 436.42 77.6394C334.141 122.531 243.829 146.079 178.712 151.177C80.416 158.873 0 227.456 0 316.501C0 405.547 80.0119 477.733 178.712 477.733Z" fill="currentColor"/>',
    ghost: '<path fill-rule="evenodd" clip-rule="evenodd" d="M368.952 510.227C322.769 512.591 269.896 512.591 251.928 510.227C111.77 491.788 0 389.313 0 250.8C0 112.287 114.615 0 256 0C397.385 0 512 112.287 512 250.8C512 315.221 487.207 373.969 446.46 418.387C435.395 430.448 450.577 438.908 466.002 447.504C481.13 455.935 496.492 464.496 487.564 476.712C477.726 490.173 424.392 507.389 368.952 510.227ZM220 219.45C220 241.092 202.091 258.637 180 258.637C157.909 258.637 140 241.092 140 219.45C140 204.935 148.055 192.264 160.024 185.491C160.713 204.362 176.229 219.449 195.269 219.449H220C220 219.449 220 219.45 220 219.45ZM343.976 185.491C343.287 204.362 327.771 219.449 308.731 219.449H284C284 219.449 284 219.45 284 219.45C284 241.092 301.909 258.637 324 258.637C346.091 258.637 364 241.092 364 219.45C364 204.935 355.945 192.264 343.976 185.491Z" fill="currentColor"/>',
    grass: '<path clip-rule="evenodd" d="m97.4121 440.649c-1.7574-1.653-3.4954-3.338-5.2132-5.056-90.68455-90.684-90.68453-237.713 0-328.397 90.6841-90.6849 379.6401-96.7516 379.6401-96.7516s39.442 334.4646-51.242 425.1486c-80.54 80.54-205.522 89.55-296.005 27.031l72.908-89.471 116.55-25.163-95.139-9.511 60.462-61.562 68.824-15.077-54.422-16.117 54.422-98.176-77.41 86.828-29.893-42.183 10.523 69.648-53.917 60.782-24.993-76.9v102.268z" fill="currentColor" fill-rule="evenodd"/>',
    ground: '<path fill-rule="evenodd" clip-rule="evenodd" d="M112.764 439.754C112.625 439.754 112.528 439.617 112.574 439.486L243.289 70.134C243.318 70.0537 243.394 70 243.479 70H383.021C383.106 70 383.183 70.0541 383.211 70.1349L511.987 439.487C512.032 439.618 511.935 439.754 511.797 439.754H116.692H112.764ZM0.201306 441.199C0.0609122 441.199 -0.0362852 441.059 0.0129607 440.928L97.3526 181.056C97.3821 180.977 97.4571 180.925 97.541 180.925H182.118C182.258 180.925 182.355 181.064 182.307 181.195L88.1823 441.067C88.1535 441.146 88.0779 441.199 87.9932 441.199H0.201306Z" fill="currentColor"/>',
    ice: '<path fill-rule="evenodd" clip-rule="evenodd" d="M384.304 39.0418L385.879 177.392L265.209 235.319L263.721 104.69L384.304 39.0418Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M505.269 257.047L385.814 325.374L266.288 256.939L385.752 194.187L505.269 257.047Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M245.04 257.047L125.585 325.374L6.05861 256.939L125.523 194.187L245.04 257.047Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M124.243 38.4753L248.229 99.881L245.059 233.697L127.993 175.719L124.243 38.4753Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M387.678 473.525L263.692 412.119L266.862 278.302L383.928 336.281L387.678 473.525Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M128.525 474.77L126.949 336.42L247.62 278.493L249.108 409.121L128.525 474.77Z" fill="currentColor"/>',
    normal: '<path fill-rule="evenodd" clip-rule="evenodd" d="M481 256C481 380.264 380.264 481 256 481C131.736 481 31 380.264 31 256C31 131.736 131.736 31 256 31C380.264 31 481 131.736 481 256ZM384.571 256C384.571 327.008 327.008 384.571 256 384.571C184.992 384.571 127.429 327.008 127.429 256C127.429 184.992 184.992 127.429 256 127.429C327.008 127.429 384.571 184.992 384.571 256Z" fill="currentColor"/>',
    poison: '<path fill-rule="evenodd" clip-rule="evenodd" d="M427.821 393.449C479.524 352.108 512 292.376 512 225.95C512 101.161 397.385 0 256 0C114.615 0 0 101.161 0 225.95C0 289.978 30.1737 347.786 78.6553 388.901C75.7171 399.046 74.1052 410.081 74.1052 421.62C74.1052 471.535 104.267 512 141.474 512C165.65 512 186.852 494.915 198.737 469.254C210.622 494.915 231.824 512 256 512C278.038 512 297.604 497.804 309.895 475.857C322.186 497.804 341.752 512 363.789 512C400.996 512 431.158 471.535 431.158 421.62C431.158 411.784 429.986 402.314 427.821 393.449ZM404.211 230.431C404.211 293.785 336.346 345.144 252.632 345.144C168.917 345.144 101.053 293.785 101.053 230.431C101.053 167.077 168.917 115.718 252.632 115.718C336.346 115.718 404.211 167.077 404.211 230.431Z" fill="currentColor"/>',
    psychic: '<path fill-rule="evenodd" clip-rule="evenodd" d="M455.925 425.184C455.925 425.184 391.365 476.963 262.893 455.536C165.423 439.279 113.437 331.833 113.437 274.079C113.437 137.149 214.783 105.988 283.3 105.988C351.816 105.988 396.513 172.788 396.513 224.508C396.513 276.228 359.933 321.466 303.006 321.466C246.08 321.466 229.22 281.501 229.22 244.758C229.22 208.016 258.947 195.071 286.058 195.071C313.169 195.071 322.452 218.217 322.452 238.11C322.452 258.004 307.017 265.128 294.143 265.128C281.269 265.128 279.996 258.633 275.069 251.807C270.141 244.982 281.353 219.146 262.893 219.146C244.433 219.146 240.992 248.847 240.992 248.847C240.992 248.847 247.722 306.18 303.006 305.191C358.291 304.201 384.518 261.461 376.896 219.146C369.274 176.83 328.207 131.865 256.133 140.951C184.059 150.037 154.632 222.861 167.603 300.685C180.574 378.51 273.807 423.602 347.112 407.379C420.418 391.156 493.429 338.086 493.429 203.533C493.429 68.9789 376.896 -11.9002 237.941 1.42913C98.9859 14.7584 12.729 136.242 18.2502 282.207C23.7714 428.172 162.275 507.669 279.394 511.766C396.513 515.864 468.312 448.067 468.312 448.067C468.312 448.067 484.459 433.668 478.128 422.424C471.798 411.18 455.925 425.184 455.925 425.184Z" fill="currentColor"/>',
    rock: '<path fill-rule="evenodd" clip-rule="evenodd" d="M395.138 244.757C395.109 244.717 395.097 244.667 395.105 244.618L427.769 54.1518C427.784 54.0641 427.861 54 427.949 54H438.287C438.367 54 438.437 54.0517 438.461 54.1277L512.051 287.131C512.074 287.203 512.049 287.283 511.989 287.33L457.73 329.693C457.649 329.756 457.532 329.74 457.471 329.657L395.138 244.757ZM-1 371.022C-1 371.101 -0.949204 371.171 -0.874109 371.196L110.975 407.767C111.029 407.785 111.089 407.776 111.136 407.744L361.145 235.144C361.187 235.115 361.215 235.07 361.222 235.02L388.032 55.1284C388.049 55.018 387.963 54.9188 387.852 54.9188H166.406C166.351 54.9188 166.3 54.943 166.265 54.9849L-0.957974 256.714C-0.98514 256.747 -1 256.788 -1 256.831V371.022ZM157.583 417.085L279.776 457.112C279.831 457.13 279.892 457.121 279.939 457.087L425.418 352.734C425.499 352.677 425.519 352.566 425.464 352.484L370.928 271.329C370.871 271.244 370.757 271.222 370.673 271.28L157.583 417.085Z" fill="currentColor"/>',
    steel: '<path fill-rule="evenodd" clip-rule="evenodd" d="M0.0511107 254.527C-0.0170046 254.411 -0.0170388 254.267 0.0510196 254.15L128.795 34.1843C128.862 34.0702 128.985 34 129.117 34H384.294C384.427 34 384.55 34.0708 384.617 34.1859L511.949 254.152C512.016 254.267 512.016 254.41 511.949 254.525L384.617 474.244C384.55 474.359 384.427 474.43 384.294 474.43H129.117C128.985 474.43 128.862 474.36 128.795 474.246L0.0511107 254.527ZM374.617 254.215C374.617 319.703 321.528 372.792 256.04 372.792C190.552 372.792 137.463 319.703 137.463 254.215C137.463 188.726 190.552 135.638 256.04 135.638C321.528 135.638 374.617 188.726 374.617 254.215Z" fill="currentColor"/>',
    water: '<path fill-rule="evenodd" clip-rule="evenodd" d="M422.172 346.515C422.172 437.897 347.813 511.977 256.086 511.977C164.359 511.977 90 437.897 90 346.515C90 257.639 247.102 13.5479 255.718 0.22781C255.915 -0.0759384 256.258 -0.0759358 256.454 0.227813C265.07 13.5479 422.172 257.639 422.172 346.515ZM228.4 458.931C144.12 440.49 158.542 347.13 158.542 347.13C158.542 347.13 181.556 403.488 237.405 421.744C293.253 439.999 360.745 413.225 360.745 413.225C360.745 413.225 312.68 477.371 228.4 458.931Z" fill="currentColor"/>'
  };

  const TYPE_CANONICAL_MAP = {
    '草': 'grass', 'grass': 'grass',
    '火': 'fire', 'fire': 'fire',
    '水': 'water', 'water': 'water',
    '電': 'electric', 'electric': 'electric',
    '冰': 'ice', 'ice': 'ice',
    '格鬥': 'fighting', '鬥': 'fighting', 'fighting': 'fighting',
    '毒': 'poison', 'poison': 'poison',
    '地面': 'ground', '地': 'ground', 'ground': 'ground',
    '飛行': 'flying', '飛': 'flying', 'flying': 'flying',
    '超能力': 'psychic', '超': 'psychic', '超能': 'psychic', 'psychic': 'psychic',
    '蟲': 'bug', 'bug': 'bug',
    '岩石': 'rock', '岩': 'rock', 'rock': 'rock',
    '幽靈': 'ghost', '鬼': 'ghost', 'ghost': 'ghost',
    '龍': 'dragon', 'dragon': 'dragon',
    '惡': 'dark', 'dark': 'dark',
    '鋼': 'steel', 'steel': 'steel',
    '妖精': 'fairy', '妖': 'fairy', 'fairy': 'fairy',
    '一般': 'normal', 'normal': 'normal'
  };

  function safeEscape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const TYPE_COLOR_HEX = {
    grass: '#4ad071',
    fire: '#fb6c6c',
    water: '#76befe',
    electric: '#ffd833',
    bug: '#92dc3d',
    normal: '#a8a878',
    poison: '#aa45a0',
    fighting: '#c03028',
    ground: '#e0c068',
    rock: '#b8a038',
    psychic: '#f85888',
    ice: '#7cd8c1',
    dragon: '#7038f8',
    ghost: '#70559b',
    dark: '#705848',
    steel: '#b8b8d0',
    fairy: '#f49ba8',
    flying: '#a890f0'
  };

  function getTypeIconSvg(type, size = 16) {
    if (!type) return '';
    const rawType = String(type).trim();
    const key = TYPE_CANONICAL_MAP[rawType] || TYPE_CANONICAL_MAP[rawType.toLowerCase()] || 'normal';
    const pathContent = TYPE_SVG_PATHS[key] || TYPE_SVG_PATHS['normal'];
    const typeDisplayName = getTypeName(rawType);
    const colorHex = TYPE_COLOR_HEX[key] || '#a8a878';
    return `<svg class="pkm-type-icon type-${key}" viewBox="0 0 512 512" width="${size}" height="${size}" aria-label="${safeEscape(typeDisplayName)}" title="${safeEscape(typeDisplayName)}" style="fill: var(--type-${rawType}, ${colorHex}); color: var(--type-${rawType}, ${colorHex});">${pathContent}</svg>`;
  }

  function getSpecialtyName(spec) {
    if (!spec) return '';
    return lookupBilingualDict(SPECIALTY_NAMES, spec) || spec;
  }

  function getSpecialtyKey(spec) {
    if (!spec) return 'berry';
    const str = String(spec).toLowerCase();
    if (str.includes('全能') || str.includes('全部') || str.includes('all') || str === 'all-rounder') return 'all';
    if (str.includes('樹果') || str.includes('berry') || str === 'berries') return 'berry';
    if (str.includes('食材') || str.includes('ingredient') || str === 'ingredients') return 'ingredient';
    if (str.includes('技能') || str.includes('skill') || str === 'skills') return 'skill';
    return 'berry';
  }

  function getSpecialtyIconHtml(spec, size = 20, extraClass = '') {
    const key = getSpecialtyKey(spec);
    const specClass = 'spec-' + key;
    const basePath = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : (typeof window !== 'undefined' && window.location && window.location.pathname.includes('/app/') ? '../' : '');
    const title = getSpecialtyName(spec) || spec || '';
    const s = size || 20;
    return `<span class="box-spec-tag ${specClass} specialty-icon-wrap ${extraClass}" title="${safeEscape(title)}" style="display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;padding:0;line-height:1;vertical-align:middle;"><img src="${basePath}assets/specialty/${key}.png" srcset="${basePath}assets/specialty/${key}@2x.png 2x" class="specialty-icon spec-${key}" width="${s}" height="${s}" alt="${safeEscape(title)}" loading="lazy" style="width:${s}px;height:${s}px;object-fit:contain;vertical-align:middle;display:inline-block;pointer-events:none;" /></span>`;
  }

  const INGREDIENT_ICONS = {
    '特選蘋果': 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png',
    'Fancy Apple': 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png',
    'apple': 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png',
    '哞哞鮮奶': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png',
    '窩心牛奶': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png',
    'Moomoo Milk': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png',
    'milk': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png',
    '萌綠大豆': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png',
    'Greengrass Soybeans': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png',
    'soybeans': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png',
    '甜甜蜜': 'https://www.serebii.net/pokemonsleep/ingredients/honey.png',
    'Honey': 'https://www.serebii.net/pokemonsleep/ingredients/honey.png',
    'honey': 'https://www.serebii.net/pokemonsleep/ingredients/honey.png',
    '豆製肉': 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png',
    'Bean Sausage': 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png',
    'sausage': 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png',
    '暖暖薑': 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png',
    'Warming Ginger': 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png',
    'ginger': 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png',
    '好眠番茄': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png',
    '熟透番茄': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png',
    'Snoozy Tomato': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png',
    'tomato': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png',
    '特選蛋': 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png',
    'Fancy Egg': 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png',
    'egg': 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png',
    '純粹油': 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png',
    'Pure Oil': 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png',
    'oil': 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png',
    '窩心洋芋': 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png',
    'Soft Potato': 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png',
    'potato': 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png',
    '火辣香草': 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png',
    'Fiery Herb': 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png',
    'herb': 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png',
    '萌綠玉米': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png',
    'Greengrass Corn': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png',
    'corn': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png',
    '放鬆可可': 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png',
    'Soothing Cacao': 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png',
    'cacao': 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png',
    '醒腦咖啡豆': 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png',
    'Rousing Coffee': 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png',
    'coffee': 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png',
    '嫩亮酪梨': 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png',
    'Glossy Avocado': 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png',
    'glossyavocado': 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png',
    '品鮮蘑菇': 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png',
    'Tasty Mushroom': 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png',
    'mushroom': 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png',
    '粗枝大蔥': 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png',
    'Large Leek': 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png',
    'leek': 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png',
    '沉甸甸南瓜': 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png',
    'Plump Pumpkin': 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png',
    'pumpkin': 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png',
    '美味尾巴': 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png',
    'Slowpoke Tail': 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png',
    'tail': 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png'
  };

  function getIngredientIcon(ing) {
    if (!ing) return '';
    return INGREDIENT_ICONS[ing] || '';
  }

  function getIngredientName(ing) {
    if (!ing) return '';
    const raw = typeof ing === 'string' ? ing : (ing.name || ing.name_cn || ing.name_tw || ing.name_en || '');
    if (!raw) return '';
    return lookupBilingualDict(INGREDIENT_NAMES, raw) || raw;
  }

  function getRecipeName(rec) {
    if (!rec) return '';
    const raw = typeof rec === 'string' ? rec : (rec.name_cn || rec.name_tw || rec.name || rec.name_en || '');
    if (!raw) return '';
    if (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__)) {
      const match = window.__RECIPES_CACHE__.find(r => r.name_cn === raw || r.name_tw === raw || r.name_en === raw || (r.name && r.name === raw));
      if (match) {
        return currentLang === 'en-US' ? (match.name_en || match.name_cn || raw) : (match.name_cn || match.name_tw || raw);
      }
    }
    return raw;
  }

  function getBerryName(berry) {
    if (!berry) return '';
    return lookupBilingualDict(BERRY_NAMES, berry) || berry;
  }

  function getNatureName(nat) {
    if (!nat) return '';
    return lookupBilingualDict(NATURE_NAMES, nat) || nat;
  }

  function getMainSkillName(skill) {
    if (!skill) return '';
    const res = lookupBilingualDict(MAIN_SKILL_NAMES, skill);
    if (res) return res;

    // 支援複合型括號變體 (例如：能量填充S (隨機))
    const trimmed = String(skill).trim();
    const parenMatch = trimmed.match(/^(.+?)\s*([(\[（【].+[)\]）】])$/);
    if (parenMatch) {
      const baseSkill = getMainSkillName(parenMatch[1]);
      const suffix = translateDynamicText(parenMatch[2]);
      return `${baseSkill} ${suffix}`;
    }
    return trimmed;
  }

  const POKEMON_NAMES = {"妙蛙種子":"Bulbasaur","妙蛙草":"Ivysaur","妙蛙花":"Venusaur","小火龍":"Charmander","火恐龍":"Charmeleon","噴火龍":"Charizard","傑尼龜":"Squirtle","卡咪龜":"Wartortle","水箭龜":"Blastoise","綠毛蟲":"Caterpie","鐵甲蛹":"Metapod","巴大蝶":"Butterfree","小拉達":"Rattata","拉達":"Raticate","阿柏蛇":"Ekans","阿柏怪":"Arbok","皮丘":"Pichu","皮卡丘":"Pikachu","皮卡丘（萬聖節）":"Pikachu (Halloween)","皮卡丘（佳節）":"Pikachu (Holiday)","皮卡丘（船長）":"Pikachu (Captain)","雷丘":"Raichu","穿山鼠":"Sandshrew","穿山王":"Sandslash","皮寶寶":"Cleffa","皮皮":"Clefairy","皮可西":"Clefable","六尾":"Vulpix","六尾（阿羅拉的樣子）":"Vulpix (Alolan Form)","九尾":"Ninetales","九尾（阿羅拉的樣子）":"Ninetales (Alolan Form)","寶寶丁":"Igglybuff","胖丁":"Jigglypuff","胖可丁":"Wigglytuff","地鼠":"Diglett","三地鼠":"Dugtrio","喵喵":"Meowth","貓老大":"Persian","可達鴨":"Psyduck","哥達鴨":"Golduck","猴怪":"Mankey","火爆猴":"Primeape","卡蒂狗":"Growlithe","風速狗":"Arcanine","喇叭芽":"Bellsprout","口呆花":"Weepinbell","大食花":"Victreebel","小拳石":"Geodude","隆隆石":"Graveler","隆隆岩":"Golem","呆呆獸":"Slowpoke","呆殼獸":"Slowbro","呆呆王":"Slowking","小磁怪":"Magnemite","三合一磁怪":"Magneton","自爆磁怪":"Magnezone","大蔥鴨":"Farfetch'd","嘟嘟":"Doduo","嘟嘟利":"Dodrio","鬼斯":"Gastly","鬼斯通":"Haunter","耿鬼":"Gengar","大岩蛇":"Onix","大鋼蛇":"Steelix","大綱蛇":"Steelix","卡拉卡拉":"Cubone","嘎啦嘎啦":"Marowak","小福蛋":"Happiny","吉利蛋":"Chansey","幸福蛋":"Blissey","袋獸":"Kangaskhan","魔尼尼":"Mime Jr.","魔牆人偶":"Mr. Mime","凱羅斯":"Pinsir","百變怪":"Ditto","伊布":"Eevee","伊布（佳節）":"Eevee (Holiday)","伊布（萬聖節）":"Eevee (Halloween)","伊布家族（8種進化）":"Eevee Evolutions (8 Forms)","伊布家族":"Eevee Evolutions","水伊布":"Vaporeon","雷伊布":"Jolteon","火伊布":"Flareon","太陽伊布":"Espeon","月亮伊布":"Umbreon","葉伊布":"Leafeon","冰伊布":"Glaceon","仙子伊布":"Sylveon","迷你龍":"Dratini","哈克龍":"Dragonair","快龍":"Dragonite","超夢":"Mewtwo","夢幻":"Mew","菊草葉":"Chikorita","月桂葉":"Bayleef","大竺葵":"Meganium","火球鼠":"Cyndaquil","火岩鼠":"Quilava","火爆獸":"Typhlosion","小鋸鱷":"Totodile","藍鱷":"Croconaw","大力鱷":"Feraligatr","波克比":"Togepi","波克基古":"Togetic","波克基斯":"Togekiss","天然雀":"Natu","天然鳥":"Xatu","咩利羊":"Mareep","茸茸羊":"Flaaffy","電龍":"Ampharos","盆才怪":"Bonsly","樹才怪":"Sudowoodo","烏波":"Wooper","烏波（阿羅拉的樣子）":"Wooper (Paldea Form)","烏波（帕底亞的樣子）":"Wooper (Paldea Form)","沼王":"Quagsire","土王":"Clodsire","黑暗鴉":"Murkrow","烏鴉頭頭":"Honchkrow","夢妖":"Misdreavus","夢妖魔":"Mismagius","小果然":"Wynaut","果然翁":"Wobbuffet","壺壺":"Shuckle","赫拉克羅斯":"Heracross","狃拉":"Sneasel","瑪狃拉":"Weavile","信使鳥":"Delibird","戴魯比":"Houndour","黑魯加":"Houndoom","雷公":"Raikou","炎帝":"Entei","水君":"Suicune","幼基拉斯":"Larvitar","沙基拉斯":"Pupitar","班基拉斯":"Tyranitar","木守宮":"Treecko","森林蜥蜴":"Grovyle","蜥蜴王":"Sceptile","火稚雞":"Torchic","力壯雞":"Combusken","火焰雞":"Blaziken","水躍魚":"Mudkip","沼躍魚":"Marshtomp","巨沼怪":"Swampert","拉魯拉絲":"Ralts","奇鲁莉安":"Kirlia","沙奈朵":"Gardevoir","艾路雷朵":"Gallade","懶人獺":"Slakoth","過動猿":"Vigoroth","請假王":"Slaking","勾魂眼":"Sableye","大嘴娃":"Mawile","可可多拉":"Aron","可多拉":"Lairon","波士可多拉":"Aggron","正電拍拍":"Plusle","負電拍拍":"Minun","溶食獸":"Gulpin","吞食獸":"Swalot","大顎蟻":"Trapinch","超音波幼蟲":"Vibrava","沙漠蜻蜓":"Flygon","青綿鳥":"Swablu","七夕青鳥":"Altaria","怨影娃娃":"Shuppet","詛咒娃娃":"Banette","阿勃梭魯":"Absol","海豹球":"Spheal","海豹球（佳節）":"Spheal (Holiday)","海魔獅":"Sealeo","帝牙海獅":"Walrein","寶貝龍":"Bagon","甲殼龍":"Shelgon","暴飛龍":"Salamence","拉帝亞斯":"Latias","拉帝歐斯":"Latios","草苗龜":"Turtwig","樹林龜":"Grotle","土台龜":"Torterra","小火焰猴":"Chimchar","猛火猴":"Monferno","烈焰猴":"Infernape","波加曼":"Piplup","波皇子":"Prinplup","帝王拿波":"Empoleon","小貓怪":"Shinx","勒克貓":"Luxio","倫琴貓":"Luxray","飄飄球":"Drifloon","隨風球":"Drifblim","花岩怪":"Spiritomb","利歐路":"Riolu","路卡利歐":"Lucario","不良蛙":"Croagunk","毒骷蛙":"Toxicroak","雪笠怪":"Snover","暴雪王":"Abomasnow","克雷色利亞":"Cresselia","達克萊伊":"Darkrai","食夢夢":"Munna","夢夢蝕":"Musharna","石居蟹":"Dwebble","岩殿居蟹":"Crustle","毛頭小鷹":"Rufflet","勇士雄鷹":"Braviary","寶寶暴龍":"Tyrunt","怪顎龍":"Tyrantrum","摔角鷹人":"Hawlucha","咚咚鼠":"Dedenne","南瓜精":"Pumpkaboo","南瓜怪人":"Gourgeist","南瓜精 (小顆種)":"Pumpkaboo (Small Variety)","南瓜精 (中顆種)":"Pumpkaboo (Medium Variety)","南瓜精 (大顆種)":"Pumpkaboo (Large Variety)","南瓜精 (巨顆種)":"Pumpkaboo (Jumbo Variety)","南瓜怪人 (小顆種)":"Gourgeist (Small Variety)","南瓜怪人 (中顆種)":"Gourgeist (Medium Variety)","南瓜怪人 (大顆種)":"Gourgeist (Large Variety)","南瓜怪人 (巨顆種)":"Gourgeist (Jumbo Variety)","嗡蝠":"Noibat","音波龍":"Noivern","強顎雞母蟲":"Grubbin","蟲電寶":"Charjabug","鍬農炮蟲":"Vikavolt","萌虻":"Cutiefly","蝶結萌虻":"Ribombee","童偶熊":"Stufful","穿著熊":"Bewear","花療環環":"Comfey","托戈德瑪爾":"Togedemaru","謎擬Q":"Mimikyu","老翁龍":"Drampa","古月鳥":"Cramorant","毒電嬰":"Toxel","顫弦蠑螈（高調的樣子）":"Toxtricity (Amped Form)","顫弦蠑螈（低調的樣子）":"Toxtricity (Low Key Form)","新葉喵":"Sprigatito","蒂蕾喵":"Floragato","魔幻假面喵":"Meowscarada","呆火鱷":"Fuecoco","炙燙鱷":"Crocalor","骨紋巨聲鱷":"Skeledirge","潤水鴨":"Quaxly","湧躍鴨":"Quaxwell","狂歡浪舞鴨":"Quaquaval","布撥":"Pawmi","布土撥":"Pawmo","巴布土撥":"Pawmot","小鍛匠":"Tinkatink","巧鍛匠":"Tinkatuff","巨鍛匠":"Tinkaton","哎呀球菇":"Foongus","敗露球菇":"Amoonguss","走鯨":"Cetoddle","浩大鯨":"Cetitan"};

  // 預排序與預建立英文對照快取，避免於每次呼叫時重複排序與建構陣列
  const SORTED_POKEMON_NAMES_KEYS = Object.keys(POKEMON_NAMES).sort((a, b) => b.length - a.length);
  const ITEM_NAMES_EN_ENTRIES = Object.entries(ITEM_NAMES).filter(([, item]) => item && item['en-US']);
  const INGREDIENT_NAMES_EN_ENTRIES = Object.entries(INGREDIENT_NAMES).filter(([, item]) => item && item['en-US']);
  const ISLAND_NAMES_EN_ENTRIES = Object.entries(ISLAND_NAMES).filter(([, item]) => item && item['en-US']);
  const TYPE_NAMES_EN_ENTRIES = Object.entries(TYPE_NAMES).filter(([, item]) => item && item['en-US']);
  let _allPkmEnMapRef = null;
  let _allPkmEnMapLen = 0;
  let _allPkmEnMap = null;

  function getPokemonName(name) {
    if (!name) return '';
    if (typeof name === 'object') {
      if (currentLang === 'en-US') return name.name_en || name.name_cn || name.name;
      if (currentLang === 'zh-CN') return toSimplifiedChinese(name.name_cn || name.name_en || name.name);
      return name.name_cn || name.name_en || name.name;
    }
    const str = String(name).trim();
    if (currentLang === 'zh-CN') return toSimplifiedChinese(str);
    if (currentLang !== 'en-US') return str;

    // Level 1 & 2 & 3 字典比對 (O(1))
    const direct = lookupBilingualDict(POKEMON_NAMES, str, 'en-US');
    if (direct) return direct;

    // Level 4: 支援括號後綴（如 毒骷蛙 (ABB)、皮卡丘（萬聖節）等）
    const parenMatch = str.match(/^(.+?)\s*([(\[（【].+[)\]）】])$/);
    if (parenMatch) {
      const baseName = getPokemonName(parenMatch[1]);
      const suffix = translateDynamicText(parenMatch[2]);
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

  function getSubSkillName(subskill) {
    if (!subskill) return '';
    const res = lookupBilingualDict(SUBSKILL_NAMES, subskill);
    return res || String(subskill).trim();
  }

  const _dynTextEnCache = Object.create(null);
  let _dynTextEnCacheCount = 0;

  function translateDynamicText(text) {
    if (!text || typeof text !== 'string') return text;
    if (currentLang === 'zh-CN') return toSimplifiedChinese(text);
    if (currentLang !== 'en-US') return text;
    if (text.length <= 500 && _dynTextEnCache[text] !== undefined) {
      return _dynTextEnCache[text];
    }

    let res = text;

    // 1. 基礎標點符號與排程標頭
    res = res
      .replace(/：/g, ': ')
      .replace(/、/g, ', ')
      .replace(/～/g, ' ~ ')
      .replace(/〜/g, ' ~ ')
      .replace(/！\s*[:：]?/g, ': ')
      .replace(/\s+/g, ' ');

    // 2. 整段公告與活動機制 (最高優先級，避免子詞先被替換)
    res = res
      .replace(/準備新活動[,，\s]*新企畫；[「"]?([^；]+?)[」"]?；追加新的EX營地；EX模式將於\s*([\d/:\s]+)\s*新增[「"]?([^」]+)[」"]?\s*。?/g, 'Preparing new event: "$1", EX Mode will add "$3" starting $2.')
      .replace(/(?:的)?長期開發計畫.+?能獲得包含.+?各種道具\s*。?\s*；?/g, 'Long-term development plan allowing players to obtain various items including Main Skill Seeds.；')
      .replace(/本企畫為期一週[，,]\s*在這特別的期間[，,]\s*給卡比獸吃的料理必定會是[「"]?([^」"]+)[」"]?[,，]\s*且(?:料理的最終能量[為會變成]*|Final Cooking Energy:\s*)(\d+(\.\d+)?)倍?\s*[！:]?/g, 'During this 1-week event, Snorlax requested dishes are guaranteed to be $1, and final Cooking Energy will be boosted to $2x!')
      .replace(/給卡比獸吃的料理必定會是[「"]?([^」"]+)[」"]?[,，]\s*且料理的最終能量[為會變成]*\s*(\d+(\.\d+)?)倍\s*[！:]?/g, 'Snorlax requested dishes are guaranteed to be $1, with Cooking Energy boosted to $2x!')
      .replace(/(?:在活動期間|在Event Period:)\s*[,，]?\s*不只是\s*(.+?)\s*會有特別亮眼的表現[,，]\s*幻之寶可夢\s*(.+?)\s*似乎也對\s*(.+?)\s*很感興趣[！:]?/g, 'During the event period, $1 will shine, and Mythical Pokémon $2 seems interested in $3!')
      .replace(/藉由精神擊破（樹果領域）展開「樹果領域」的期間，透過芒芒果（超能力屬性）獲得的能量會提升。/g, 'While Berry Field is active via Psystrike (Berry Field), energy gained from Mago Berries (Psychic Type) will increase.')
      .replace(/※「樹果領域」一旦展開，就會在移動營地前持續發揮效果。即使將超夢從幫手隊伍移除，「樹果領域」的效果也不會消失。/g, '※Once active, Berry Field remains effective until moving to a new camp, even if Mewtwo is removed from the team.')
      .replace(/※每次主技能發動時，「樹果領域」的效果都會疊加，直到達到上限為止。/g, '※Each time the Main Skill triggers, Berry Field effect stacks until reaching the maximum cap.')
      .replace(/變更部分幫手寶可夢的主技能\s*。?；\s*([^；]+)；（變更前）([^；]+)；（變更後）\s*([^；]+)/g, 'Adjusted Main Skill for $1: (Before) $2 -> (After) $3')
      .replace(/變更部分(?:幫手寶可夢|Helper Pokémon)的主技能\s*。?/g, 'Adjusted Main Skills for select Helper Pokémon.')
      .replace(/（變更前）/g, '(Before) ')
      .replace(/（變更後）/g, '(After) ')
      .replace(/【歡慶[:！]?\s*3週年紀念資訊[①➀]】關於特別合作企畫/g, '【3rd Anniversary Celebration Info ①】Special Collaboration Event')
      .replace(/《Pokémon Sleep》將在\s*2026年8月\s*舉辦特別合作企畫\s*。?/g, 'Pokémon Sleep will hold a Special Collaboration Event in August 2026.')
      .replace(/「?新月日限定包\s*vol\.?(\d+)」?/gi, '"New Moon Day Limited Bundle Vol.$1" ')
      .replace(/「?新月日限定包」?正適合本次活動.+?歡迎選購\s*。?\s*[:：]?/g, '"New Moon Day Limited Bundle" is filled with items to befriend Pokémon: ')
      .replace(/在新月日期間.+?變得友好吧！?/g, 'During New Moon Day, give biscuits to hungry Pokémon to become friends!')
      .replace(/本商品裡裝有\s*專門迎接\s*(.+?)\s*成為夥伴並且培育牠的道具\s*，?\s*歡迎選購\s*。?/g, 'Contains items tailored for befriending and raising $1.')
      .replace(/商品裡裝有\s*「?\s*(.+?)\s*」?\s*等\s*能夠培育\s*(.+?)\s*的道具\s*。?/g, 'Contains $1 and other items to raise $2.')
      .replace(/(?:本?商品裡裝有|內含)\s*(.+?)\s*等?\s*(?:能夠|專門)?(?:迎接|培育|強化)?.*?(?:成為夥伴並且培育牠的道具|的道具)?\s*[,，。]?\s*歡迎選購。?/g, 'Contains $1 and other helpful items to raise your Pokémon.')
      .replace(/在\s*⭐?\s*(.+?)\s*會出現的營地使用薰香\s*，?\s*與牠相遇吧！?/g, 'Use incenses at areas where $1 appears to encounter them!')
      .replace(/發放期間登入遊戲的玩家\s*。?/g, 'Applicable to all players who log in during the event period.')
      .replace(/(?:此外[,，]\s*在EX模式下[,，]\s*)?遇見寶可夢睡姿所需的(?:睡意之力|Drowsy Power)會大幅增加.+?(?:糖果|Candy)[」"]?\s*。?/g, 'In EX mode, required Drowsy Power increases significantly, but grants more Research EXP, Dream Shards, and Pokémon Candies.')
      .replace(/消耗[「"]?(?:夢之碎片|Dream Shards)[」"]?並放入\s*(\d+)個\s*持有的寶可夢的?(?:Candy|糖果)[,，]\s*就能隨機獲得\s*(\d+)種?[「"]?(?:屬性糖果|屬性Candy)M×1[」"]?\s*。?/g, 'Consume Dream Shards and $1 Pokémon Candies to randomly obtain $2x Type Candy M.')
      .replace(/※此道具與[「"]?(?:寶可夢的糖果|寶可夢 Candy)[」"]?相同.+?也可使用\s*。?/g, '※Similar to Pokémon Candy, this item can also be used on different forms and special costume Pokémon.')
      .replace(/各寶可夢專用的全新[「"]?(?:主技能種子|Main Skill Seed)[」"]?將自\s*([\d/:\s]+)\s*起登場\s*。?/g, 'New Pokémon-specific Main Skill Seeds will debut starting $1.')
      .replace(/各寶可夢專用的新[「"]?(?:主技能種子|Main Skill Seed)[」"]?/g, 'New Pokémon-specific Main Skill Seeds')
      .replace(/此外[，,]\s*自下週起全新的[「"]?(?:主技能種子|Main Skill Seed)[」"]?將會登場\s*。?/g, 'Brand new Main Skill Seeds will debut next week.');

    // 3. 排程與時間標籤
    res = res
      .replace(/舉辦期間\s*[:：]?\s*/gi, 'Event Period: ')
      .replace(/銷售期間\s*[:：]?\s*/gi, 'Sale Period: ')
      .replace(/活動期間\s*[:：]?\s*/gi, 'Event Period: ')
      .replace(/任務期間\s*[:：]?\s*/gi, 'Mission Period: ')
      .replace(/發放期間\s*[:：]?\s*/gi, 'Distribution Period: ')
      .replace(/維護期間\s*[:：]?\s*/gi, 'Maintenance Period: ')
      .replace(/實施時間\s*[:：]?\s*/gi, 'Implementation Time: ')
      .replace(/測量時間\s*[:：]?\s*/gi, 'Tracking Time: ')
      .replace(/開始出現的時間\s*[:：]?\s*/gi, 'Debut Time: ')
      .replace(/【適用營地】[・\s]*使用(?:薰香|Incense)[,，]\s*與牠相遇吧！?/gi, '【Applicable Areas】 Use incenses at applicable areas to encounter them!')
      .replace(/【適用營地】[・\s]*所有營地/gi, '【Applicable Areas】 All Areas')
      .replace(/【適用營地】[・\s]*/gi, '【Applicable Areas】 ')
      .replace(/【注意事項】[・\s]*/gi, '【Important Notes】 ')
      .replace(/\(週一\)/g, '(Mon)')
      .replace(/\(週二\)/g, '(Tue)')
      .replace(/\(週三\)/g, '(Wed)')
      .replace(/\(週四\)/g, '(Thu)')
      .replace(/\(週五\)/g, '(Fri)')
      .replace(/\(週六\)/g, '(Sat)')
      .replace(/\(週日\)/g, '(Sun)');

    // 4. 機率提升標籤與睡眠類型
    res = res
      .replace(/【機率大幅提升】/g, '【Major Rate-Up】 ')
      .replace(/【機率中幅提升】/g, '【Medium Rate-Up】 ')
      .replace(/【機率小幅提升】/g, '【Minor Rate-Up】 ')
      .replace(/登場寶可夢\s*[:：]?\s*/g, 'Debut Pokémon: ')
      .replace(/能新遇見的寶可夢\s*[:：]?\s*/g, 'New Debut Pokémon: ')
      .replace(/睡眠類型\s*[:：]?\s*/g, 'Sleep Type: ')
      .replace(/安然入睡/g, 'Dozing')
      .replace(/淺[淺灰]入睡/g, 'Snoozing')
      .replace(/深[深灰]入睡/g, 'Slumbering')
      .replace(/半夢半醒/g, 'Balanced');

    // 5. 好眠日、料理倍率、貪吃與活動機制
    res = res
      .replace(/睡意之力\s*[:：]?\s*(\d+(\.\d+)?)倍/gi, 'Drowsy Power: $1x')
      .replace(/睡意之力的倍率/g, 'Drowsy Power Multiplier')
      .replace(/睡意之力/g, 'Drowsy Power')
      .replace(/在好眠日的[「"]?[^」"]+[」"]?生效的[「"]?(?:Drowsy Power Multiplier|Drowsy Power的倍率|睡意之力的倍率)[」"]?[,，]?\s*將會根據\s*[^是]+是週幾而有所變化\s*。?/g, 'The Drowsy Power multiplier on Full Moon Day varies depending on the day of the week.')
      .replace(/■[「"]?[^」"]+[」"]?的[「"]?(?:Drowsy Power|睡意之力)[」"]?倍率/g, '■ Full Moon Day Drowsy Power Multiplier')
      .replace(/※不論.+?皆為\s*1\.5倍\s*。?/g, '※Regardless of the day of the week, the Drowsy Power multiplier on other event days is 1.5x.')
      .replace(/滿月之日/g, 'Full Moon Day')
      .replace(/滿月/g, 'Full Moon')
      .replace(/新月日/g, 'New Moon Day')
      .replace(/夏日嘉年華/g, 'Summer Festival')
      .replace(/（\s*漂亮成功時為\s*(\d+(\.\d+)?)倍[,，]\s*在週日漂亮成功時為\s*(\d+(\.\d+)?)倍\s*）/g, '($1x on Extra Tasty, $3x on Sunday Extra Tasty)')
      .replace(/漂亮成功時為\s*(\d+(\.\d+)?)倍/gi, '$1x on Extra Tasty')
      .replace(/在週日漂亮成功時為\s*(\d+(\.\d+)?)倍/gi, '$1x on Sunday Extra Tasty')
      .replace(/料理的最終能量[為會變成]*\s*(\d+(\.\d+)?)倍/gi, 'Final Cooking Energy: $1x')
      .replace(/(?:不僅如此[,，]?\s*)?在當天第1次的點心時間[,，]?\s*必定有\s*(\d+)\s*隻寶可夢會處於貪吃狀態\s*。?/g, 'At least $1 Pokémon is guaranteed to be Hungry during the first snack time each day.')
      .replace(/必定有\s*(\d+)\s*隻寶可夢會處於貪吃狀態/g, '$1 Pokémon is guaranteed to be Hungry')
      .replace(/處於貪吃狀態/g, 'Hungry')
      .replace(/幫手寶可夢的(?:睡眠EXP|Sleep EXP)\s*[:：]?\s*(\d+(\.\d+)?)倍/gi, 'Helper Pokémon Sleep EXP: $1x')
      .replace(/幫手寶可夢/g, 'Helper Pokémon')
      .replace(/睡眠EXP/g, 'Sleep EXP')
      .replace(/研究EXP/g, 'Research EXP');

    // 6. 商城禮包與道具名稱
    res = res
      .replace(/「好眠日限定包\s*vol\.?(\d+)」/gi, '"Good Sleep Day Bundle Vol.$1" ')
      .replace(/「新月日限定包\s*vol\.?(\d+)」/gi, '"New Moon Day Limited Bundle Vol.$1" ')
      .replace(/「寶可夢培育包\s*[（\(](.+?)[）\)]\s*vol\.?(\d+)」/gi, '"Pokémon Growth Bundle ($1) Vol.$2" ')
      .replace(/「合作紀念包\s*([SML])」/gi, '"Collaboration Commemorative Bundle $1" ')
      .replace(/「合作紀念包」/gi, '"Collaboration Commemorative Bundle\" ')
      .replace(/「夏日嘉年華2026同樂包\s*([SML])」/gi, '"Summer Festival 2026 Celebration Bundle $1" ')
      .replace(/「夏日嘉年華2026同樂包」/gi, '"Summer Festival 2026 Celebration Bundle" ')
      .replace(/「(.+?)限定包\s*([SML])」/gi, '"$1 Limited Bundle $2" ')
      .replace(/「(.+?)限定包」/g, '"$1 Limited Bundle" ')
      .replace(/「(.+?)同樂包\s*([SML])」/gi, '"$1 Celebration Bundle $2" ')
      .replace(/「(.+?)同樂包」/g, '"$1 Celebration Bundle" ')
      .replace(/「(.+?)紀念包\s*([SML])」/gi, '"$1 Commemorative Bundle $2" ')
      .replace(/[（\(](\d[\d,，\s]*)\s*(?:鑽石|Diamonds)[）\)]/gi, (match, p1) => ` (${p1.replace(/[，\s]/g, ',')} Diamonds)`)
      .replace(/（限購\s*(\d+)\s*次）/g, '(Limit: $1)')
      .replace(/介紹\s*[:：]\s*《Pokémon Sleep》將配合「好眠日」推出/g, 'Details: Special bundle available in Pokémon Sleep for Good Sleep Day')
      .replace(/介紹\s*[:：]/g, 'Details: ')
      .replace(/主技能種子\s*[（\(](.+?)[）\)]/g, 'Main Skill Seed ($1)');

    // 7. 官方公告、更新與異常通知
    res = res
      .replace(/關於\s*Ver\.?\s*([\d\.]+)\s*的更新內容/gi, 'Ver.$1 Update Details')
      .replace(/詳情請參閱官方公告內容與說明/g, 'Please check the official announcement for full details.')
      .replace(/異常問題修復通知/g, 'Bug Fix Notice')
      .replace(/異常問題通知/g, 'Issue Notice')
      .replace(/錯誤代碼\s*[「"]?(\d+)[」"]?/g, 'Error Code "$1"')
      .replace(/[\u{2728}\s]*新增功能/gu, 'New Features')
      .replace(/[\u{2696}\u{FE0F}\s]*平衡調整與技能變更/gu, 'Balance Adjustments & Skill Changes')
      .replace(/[\u{1F41B}\s]*異常問題修復/gu, 'Bug Fixes')
      .replace(/波導彈/g, 'Aura Sphere')
      .replace(/夢之碎片獲取/g, 'Dream Shard Magnet ');

    // 8. 替換道具名稱 (糖果, 薰香, 夢之塊, 沙布蕾)
    for (let i = 0; i < ITEM_NAMES_EN_ENTRIES.length; i++) {
      const [cn, item] = ITEM_NAMES_EN_ENTRIES[i];
      if (res.includes(cn)) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }

    // 9. 替換食材與島嶼名稱
    for (let i = 0; i < INGREDIENT_NAMES_EN_ENTRIES.length; i++) {
      const [cn, item] = INGREDIENT_NAMES_EN_ENTRIES[i];
      if (res.includes(cn)) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }
    for (let i = 0; i < ISLAND_NAMES_EN_ENTRIES.length; i++) {
      const [cn, item] = ISLAND_NAMES_EN_ENTRIES[i];
      if (res.includes(cn)) {
        res = res.replaceAll(cn, item['en-US']);
      }
    }

    // 10. 替換寶可夢名稱 (由長至短依序取代，避免前綴衝突)
    for (let i = 0; i < SORTED_POKEMON_NAMES_KEYS.length; i++) {
      const cn = SORTED_POKEMON_NAMES_KEYS[i];
      if (res.includes(cn)) {
        res = res.replaceAll(cn, POKEMON_NAMES[cn]);
      }
    }

    // 11. 消除 "Pokémon的Item" -> "Pokémon Item" 與屬性括號
    res = res
      .replace(/的\s*(Candy|Incense|Biscuit|Seed|Block|Shard|Cluster)/gi, ' $1')
      .replace(/（(.+?)屬性）/g, ' ($1 Type)')
      .replace(/\((.+?)屬性\)/g, ' ($1 Type)');

    for (let i = 0; i < TYPE_NAMES_EN_ENTRIES.length; i++) {
      const [cn, item] = TYPE_NAMES_EN_ENTRIES[i];
      if (res.includes(cn)) {
        res = res.replaceAll(cn + ' Type', item['en-US'] + ' Type');
        res = res.replaceAll(cn + '屬性', item['en-US'] + ' Type');
        res = res.replaceAll(cn + '屬性的幫手寶可夢', item['en-US'] + '-type Helper Pokémon');
        res = res.replaceAll(cn + '屬性的寶可夢', item['en-US'] + '-type Pokémon');
      }
    }
    res = res.replace(/([A-Za-z]+)\s*Type\s*的\s*(?:幫手寶可夢|Helper Pokémon)/gi, '$1-type Helper Pokémon');
    res = res.replace(/([A-Za-z]+)\s*Type\s*的\s*Pokémon/gi, '$1-type Pokémon');

    // 12. 天梯點評與剩餘常用片語
    res = res
      .replace(/([\u{1F451}]?\s*)TOP 1 AAA\s*(.+?)\s*產量之王/gu, '$1TOP 1 AAA $2 Production King')
      .replace(/([\u{1F451}]?\s*)TOP 1\s*(.+?)\s*產量之王/gu, '$1TOP 1 $2 Production King')
      .replace(/AAA\s*(.+?)\s*專精產出/g, 'AAA $1 Specialized Output')
      .replace(/ABB\s*(.+?)\s*主力產出/g, 'ABB $1 Main Output')
      .replace(/AAA\s*(.+?)\s*兼顧/g, 'AAA $1 Flex Output')
      .replace(/AAC\s*雙(.+?)\s*二階解鎖/g, 'AAC Dual $1 Lv.30 Unlock')
      .replace(/AAC\s*(.+?)\s*解鎖/g, 'AAC $1 Lv.30 Unlock')
      .replace(/ABB\s*單(.+?)\s*混產/g, 'ABB Single $1 Mixed Output')
      .replace(/產量之王/g, 'Production King')
      .replace(/專精產出/g, 'Specialized Output')
      .replace(/主力產出/g, 'Main Output')
      .replace(/兼顧/g, 'Flex Output')
      .replace(/二階解鎖/g, 'Lv.30 Unlock')
      .replace(/解鎖/g, 'Unlock')
      .replace(/混產/g, 'Mixed Output')
      .replace(/[（\(]體型日產\s*(\d+)~(\d+)\s*顆[）\)]/g, '(Sizes: $1~$2/day)')
      .replace(/[（\(]體型日產\s*(\d+)\s*顆[）\)]/g, '(Sizes: $1/day)')
      .replace(/[（\(]8種進化產量皆相同[）\)]/g, '(All 8 Evolutions Equal)')
      .replace(/顆\/天/g, '/day')
      .replace(/顆/g, 'items')
      .replace(/餐\/天/g, 'meals/day')
      .replace(/鑽石/g, 'Diamonds')
      .replace(/咖哩[,，\s]*濃湯/g, 'Curries/Stews')
      .replace(/沙拉/g, 'Salads')
      .replace(/甜點[,，\s]*飲料/g, 'Desserts/Drinks')
      .replace(/以及/g, 'and')
      .replace(/等\s*能夠培育/g, 'and other items to raise')
      .replace(/的道具\s*。?/g, 'items.')
      .replace(/「\s*/g, '"')
      .replace(/\s*」/g, '"');

    const out = res.trim();
    if (text.length <= 500) {
      if (_dynTextEnCacheCount > 3000) {
        for (const k in _dynTextEnCache) delete _dynTextEnCache[k];
        _dynTextEnCacheCount = 0;
      }
      _dynTextEnCache[text] = out;
      _dynTextEnCacheCount++;
    }
    return out;
  }

  function updatePageTranslations() {
    if (typeof document === 'undefined') return;

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

    if (typeof Event !== 'undefined') {
      document.querySelectorAll('select').forEach(sel => {
        try { sel.dispatchEvent(new Event('sync-ui')); } catch (e) {}
      });
    }
  }

  initLanguage();

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
    const full = getMainSkillName(skill);
    return currentLang === 'en-US' ? shortenSkillName(full) : full;
  }

  let _itemsDataRef = null;
  let _itemsDataIndex = null;

  function getItemName(item) {
    if (!item) return '';
    if (typeof item === 'object') {
      if (item.name) {
        return item.name[currentLang] || item.name['zh-TW'] || item.name['en-US'] || '';
      }
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
        return match.name[currentLang] || match.name['zh-TW'] || match.name['en-US'] || '';
      }
    }
    const res = lookupBilingualDict(ITEM_NAMES, item);
    if (res) return res;
    return currentLang === 'zh-CN' ? toSimplifiedChinese(item) : item;
  }

  function getIslandName(island) {
    if (!island) return '';
    const res = lookupBilingualDict(ISLAND_NAMES, island);
    if (res) return res;
    return currentLang === 'zh-CN' ? toSimplifiedChinese(island) : island;
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
        const isEN = getLanguage() === 'en-US';
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'search-filtering-badge';
          if (clearBtn && clearBtn.parentNode === container) {
            container.insertBefore(badge, clearBtn);
          } else {
            container.appendChild(badge);
          }
        }
        badge.innerHTML = `<span class="search-pulse-dot"></span><span>${isEN ? 'Filtered' : '條件篩選中'}</span>`;
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
    t,
    getLanguage,
    setLanguage,
    toSimplified: toSimplifiedChinese,
    updateSearchInputHighlight,
    getTypeName,
    getTypeIconSvg,
    TYPE_SVG_PATHS,
    TYPE_CANONICAL_MAP,
    getSpecialtyName,
    getSpecialtyKey,
    getSpecialtyIconHtml,
    getIngredientName,
    getIngredientIcon,
    getRecipeName,
    getBerryName,
    getNatureName,
    getPokemonName,
    getMainSkillName,
    getShortMainSkillName,
    shortenSkillName,
    getSubSkillName,
    translateDynamicText,
    getItemName,
    getIslandName,
    updatePageTranslations,
    DICTIONARY,
    POKEMON_NAMES,
    TYPE_NAMES,
    SPECIALTY_NAMES,
    INGREDIENT_NAMES,
    INGREDIENT_ICONS,
    BERRY_NAMES,
    NATURE_NAMES,
    MAIN_SKILL_NAMES,
    SUBSKILL_NAMES,
    ITEM_NAMES,
    ISLAND_NAMES
  };

  if (typeof window !== 'undefined') {
    window.I18N = I18NExport;
    window.getSpecialtyIconHtml = getSpecialtyIconHtml;
    window.getSpecialtyKey = getSpecialtyKey;
    window.updateSearchInputHighlight = updateSearchInputHighlight;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18NExport;
  }
})();
