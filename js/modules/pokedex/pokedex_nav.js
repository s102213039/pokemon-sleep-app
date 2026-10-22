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

      /* ─── 側邊欄展開/收合狀態持久化管理 (僅限桌面版，H5/移動端一律預設收合且不套用暫時記憶) ─── */
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
      const VALID_WIKI_SUBTABS = ['skills', 'subskills', 'ingredients', 'values', 'ratings', 'islands', 'items'];
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

        if (typeof dismissAllFloatingTooltips === 'function') {
          dismissAllFloatingTooltips();
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
        const boxSidebar = document.getElementById('box-filter-sidebar');
        const boxBookmarkHandle = document.getElementById('box-sidebar-bookmark-handle');
        const boxBackdrop = document.getElementById('box-sidebar-backdrop');
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

        if (target !== 'box') {
          if (boxBookmarkHandle) boxBookmarkHandle.style.display = 'none';
          if (boxSidebar) boxSidebar.style.display = 'none';
          if (boxBackdrop) boxBackdrop.classList.remove('active');
          const boxFab = document.getElementById('box-fab-container');
          if (boxFab && boxFab.style) {
            boxFab.style.display = 'none';
            if (typeof boxFab.style.setProperty === 'function') boxFab.style.setProperty('display', 'none', 'important');
          }
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
          if (window.CloudSync && typeof window.CloudSync.updateBoxAuthOverlay === 'function') {
            window.CloudSync.updateBoxAuthOverlay(true);
          }
          let boxSubtab = 'list';
          try {
            const storage = getStorage();
            const curHash = (typeof window !== 'undefined' && window.location && window.location.hash) ? window.location.hash.replace(/^#/, '') : '';
            const hashParts = curHash.split(/[/_?]/);
            if (hashParts[0] === 'box' && hashParts[1] === 'lab') {
              boxSubtab = 'lab';
            } else if (hashParts[0] === 'box' && hashParts[1] === 'list') {
              boxSubtab = 'list';
            } else {
              const savedSub = storage ? (storage.getItem('pksleep_active_box_subtab') || storage.getItem('pksleep_box_subtab')) : null;
              boxSubtab = (savedSub === 'lab') ? 'lab' : 'list';
            }
            if (storage) {
              storage.setItem('pksleep_active_box_subtab', boxSubtab);
              storage.setItem('pksleep_box_subtab', boxSubtab);
            }
          } catch (e) {}
          if (boxSubtab === 'lab') {
            if (document.body) document.body.classList.add('box-lab-active');
            if (panelBox) panelBox.classList.add('box-lab-active');
          } else {
            if (document.body) document.body.classList.remove('box-lab-active');
            if (panelBox) panelBox.classList.remove('box-lab-active');
          }
          if (boxSidebar) {
            if (boxSubtab === 'list') {
              boxSidebar.style.display = 'flex';
              const isBoxOpen = getSidebarSavedState('pksleep_box_sidebar_open', false);
              if (isBoxOpen && !isMobileH5 && window.innerWidth > 1024) {
                boxSidebar.classList.remove('collapsed');
              } else {
                boxSidebar.classList.add('collapsed');
                if (boxBackdrop) boxBackdrop.classList.remove('active');
              }
            } else {
              boxSidebar.style.display = 'none';
              boxSidebar.classList.add('collapsed');
              if (boxBackdrop) boxBackdrop.classList.remove('active');
            }
          }
          if (boxBookmarkHandle) {
            const isCollapsed = boxSidebar ? boxSidebar.classList.contains('collapsed') : true;
            if (boxSubtab === 'list' && isCollapsed) {
              boxBookmarkHandle.classList.remove('drawer-open');
              boxBookmarkHandle.style.display = 'flex';
              boxBookmarkHandle.style.opacity = '1';
              boxBookmarkHandle.style.pointerEvents = 'auto';
              boxBookmarkHandle.style.visibility = 'visible';
            } else {
              if (boxSubtab === 'list' && !isCollapsed) boxBookmarkHandle.classList.add('drawer-open');
              boxBookmarkHandle.style.display = 'none';
              boxBookmarkHandle.style.opacity = '0';
              boxBookmarkHandle.style.pointerEvents = 'none';
              boxBookmarkHandle.style.visibility = 'hidden';
            }
          }
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
      // 1. 優先自本機快取瞬間載入 (Cache-First 0ms 秒開：IndexedDB / LocalStorage)，背景再由 manifest 檢查是否需更新
      try {
        if (typeof window !== 'undefined') {
          if (window.DataCacheManager && typeof window.DataCacheManager.getCachedJsonAsync === 'function') {
            const cachedData = await window.DataCacheManager.getCachedJsonAsync(CACHE_KEY_DATA_JSON);
            if (Array.isArray(cachedData) && cachedData.length > 0) {
              return cachedData;
            }
          } else if (window.localStorage) {
            const cachedText = window.localStorage.getItem(CACHE_KEY_DATA_JSON);
            if (cachedText) {
              const cachedData = JSON.parse(cachedText);
              if (Array.isArray(cachedData) && cachedData.length > 0) {
                return cachedData;
              }
            }
          }
        }
      } catch (cacheReadErr) {}

      const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
      const defaultCandidates = [
        `${base}data/data.json`,
        `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/data.json`,
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
        const uniqueUrls = attempt === 1 ? cleanUrls : cleanUrls.map(u => `${u}?t=${Date.now()}`);

        for (const url of uniqueUrls) {
          try {
            const res = await fetch(url, { cache: attempt === 1 ? 'default' : 'no-store' });
            if (res && res.ok) {
              const text = await res.text();
              const parsed = JSON.parse(text);
              try {
                if (typeof window !== 'undefined' && window.localStorage) {
                  try {
                    window.localStorage.setItem(CACHE_KEY_DATA_JSON, text);
                    window.localStorage.setItem(CACHE_KEY_DATA_JSON_TIME, String(Date.now()));
                  } catch (e) {}
                }
                if (typeof window !== 'undefined' && window.DataCacheManager) {
                  window.DataCacheManager.saveCachedJson(CACHE_KEY_DATA_JSON, 'data.json', parsed);
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

      // 若所有網路請求重試皆失敗，嘗試自本機快取 (IndexedDB / LocalStorage) 離線載入
      try {
        if (typeof window !== 'undefined') {
          if (window.DataCacheManager && typeof window.DataCacheManager.getCachedJsonAsync === 'function') {
            const cachedData = await window.DataCacheManager.getCachedJsonAsync(CACHE_KEY_DATA_JSON);
            if (Array.isArray(cachedData) && cachedData.length > 0) {
              console.warn('[Data Engine] 網路請求暫時失敗，已自動自本機離線快取載入 data.json (' + cachedData.length + ' 筆資料)');
              return cachedData;
            }
          } else if (window.localStorage) {
            const cachedText = window.localStorage.getItem(CACHE_KEY_DATA_JSON);
            if (cachedText) {
              const cachedData = JSON.parse(cachedText);
              if (Array.isArray(cachedData) && cachedData.length > 0) {
                console.warn('[Data Engine] 網路請求暫時失敗，已自動自本機離線快取載入 data.json (' + cachedData.length + ' 筆資料)');
                return cachedData;
              }
            }
          }
        }
      } catch (cacheErr) {
        console.warn('[Data Engine] 讀取離線快取失敗:', cacheErr);
      }

      throw lastErr || new Error('Failed to load data.json from candidate paths: ' + cleanUrls.join(', '));
    };

    function scheduleDynamicDataSync() {
      if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
      let isSyncing = false;

      async function runSyncCheck(forceManifest = false) {
        if (isSyncing) return;
        isSyncing = true;
        try {
          let remoteHash = '';
          if (window.DataCacheManager && typeof window.DataCacheManager.checkFileNeedsUpdate === 'function') {
            const check = await window.DataCacheManager.checkFileNeedsUpdate('data.json', CACHE_KEY_DATA_JSON, forceManifest);
            if (!check.needsUpdate && Array.isArray(allPokemons) && allPokemons.length > 0) {
              return;
            }
            remoteHash = check.remoteHash || '';
          }

          const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
          const liveUrl = `${base}data/data.json?v=${remoteHash || Date.now()}`;
          let res = await fetch(liveUrl, { cache: 'no-cache' }).catch(() => null);
          if (!res || !res.ok) {
            const fallbackRawUrl = `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/data.json?t=${Date.now()}`;
            res = await fetch(fallbackRawUrl, { cache: 'no-store' });
          }
          if (!res || !res.ok) return;
          const rawText = await res.text();
          const freshData = JSON.parse(rawText);
          if (!Array.isArray(freshData) || freshData.length === 0) return;

          if (window.DataCacheManager) {
            window.DataCacheManager.saveCachedJson(CACHE_KEY_DATA_JSON, 'data.json', rawText, remoteHash);
          } else if (window.localStorage) {
            try {
              window.localStorage.setItem(CACHE_KEY_DATA_JSON, rawText);
              window.localStorage.setItem(CACHE_KEY_DATA_JSON_TIME, String(Date.now()));
            } catch (e) {}
          }

          const currentLen = Array.isArray(allPokemons) ? allPokemons.length : 0;
          const isDifferent = currentLen !== freshData.length ||
            (freshData.length > 0 && allPokemons.length > 0 && (
              freshData[0].id !== allPokemons[0].id ||
              freshData[freshData.length - 1].id !== allPokemons[allPokemons.length - 1].id ||
              freshData[0].name_cn !== allPokemons[0].name_cn
            ));

          if (isDifferent || !currentLen) {
            console.log(`[Data Engine] 動態連線取得最新寶可夢資料庫 (${freshData.length} 筆)，正在原地更新...`);
            allPokemons = freshData;
            window.allPokemons = freshData;

            if (PokemonApp && typeof PokemonApp.init === 'function') {
              PokemonApp.init(freshData);
            }
            if (typeof initFilters === 'function') {
              initFilters();
            }
            if (typeof renderUI === 'function') {
              renderUI();
            }
            if (window.initUserBox) {
              window.initUserBox(freshData);
            }
            window.dispatchEvent(new CustomEvent('pokemon-data-updated', { detail: freshData }));
          }
        } catch (err) {
          // 靜默處理網路連線異常
        } finally {
          isSyncing = false;
        }
      }

      // 網頁執行後透過輕量級 manifest.json 檢查雜湊是否變更 (10分鐘內共享單一請求)
      setTimeout(() => runSyncCheck(false), 1500);
      // 每 30 分鐘定期背景檢查 manifest
      setInterval(() => runSyncCheck(false), 30 * 60 * 1000);
      // 使用者切回分頁時透過具備 10 分鐘冷卻節流的 manifest 檢查
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            runSyncCheck(false);
          }
        });
      }
    }

    fetchDataWithFallback(
      (typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '') + `data/data.json`,
      `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/data.json`,
      `data/data.json`,
      `../data/data.json`,
      `data.json`
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
        scheduleDynamicDataSync();
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

