  window.PokemonApp = PokemonApp;
  window.renderSkillWithTooltip = renderSkillWithTooltip;
  window.formatHelpInterval = formatHelpInterval;
  window.matchesPokemonSearch = matchesPokemonSearch;
  window.toPinyin = toPinyin;
  window.BERRY_DATA = BERRY_DATA;
  window.TYPE_TO_BERRY = TYPE_TO_BERRY;
  window.BASE_SKILLS = BASE_SKILLS;
  window.matchesSkill = matchesSkill;
}
PokemonApp.renderSkillWithTooltip = renderSkillWithTooltip;
PokemonApp.formatHelpInterval = formatHelpInterval;
PokemonApp.matchesPokemonSearch = matchesPokemonSearch;
PokemonApp.toPinyin = toPinyin;
PokemonApp.BERRY_DATA = BERRY_DATA;
PokemonApp.TYPE_TO_BERRY = TYPE_TO_BERRY;
PokemonApp.BASE_SKILLS = BASE_SKILLS;
PokemonApp.matchesSkill = matchesSkill;

const MOBILE_OVERLAY_IDS = [
  'pokemon-filter-sidebar', 'sidebar-backdrop',
  'recipe-filter-sidebar', 'recipe-sidebar-backdrop',
  'box-filter-sidebar', 'box-sidebar-backdrop',
  'ladder-filter-sidebar', 'ladder-sidebar-backdrop',
  'pokedex-detail-modal', 'box-edit-modal', 'box-guide-lightbox-modal',
  'settings-modal', 'ladder-recipe-modal', 'modal-appraisal-report',
  'wiki-item-detail-modal'
];

function isMobileH5Surface() {
  try {
    return !!(typeof document !== 'undefined' && document.body && document.body.classList && document.body.classList.contains('mobile-h5-app'));
  } catch (e) {
    return false;
  }
}

const SIDEBAR_BACKDROP_BY_ID = {
  'pokemon-filter-sidebar': 'sidebar-backdrop',
  'recipe-filter-sidebar': 'recipe-sidebar-backdrop',
  'box-filter-sidebar': 'box-sidebar-backdrop',
  'ladder-filter-sidebar': 'ladder-sidebar-backdrop'
};

function queryAllById(id) {
  if (!id || typeof document === 'undefined') return [];
  try {
    if (document.querySelectorAll) {
      return Array.prototype.slice.call(document.querySelectorAll('[id="' + id + '"]'));
    }
  } catch (e) {}
  const one = document.getElementById ? document.getElementById(id) : null;
  return one ? [one] : [];
}

function isOverlayShown(el) {
  if (!el) return false;
  const d = (el.style && el.style.display) || '';
  return d === 'flex' || d === 'block';
}

function resolveUniqueOverlay(id) {
  const nodes = queryAllById(id);
  if (!nodes.length) return null;
  if (nodes.length === 1) return nodes[0];
  let keep = null;
  for (let i = 0; i < nodes.length; i++) {
    if (isOverlayShown(nodes[i])) { keep = nodes[i]; break; }
  }
  if (!keep) {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n && typeof n.closest === 'function') {
        if (n.closest('#panel-wiki') || n.closest('#panel-pokemon') || n.closest('#panel-recipes') || n.closest('#panel-box')) {
          keep = n;
          break;
        }
      }
    }
  }
  if (!keep) keep = nodes[nodes.length - 1];
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i] !== keep && nodes[i].parentNode && typeof nodes[i].parentNode.removeChild === 'function') {
      try { nodes[i].parentNode.removeChild(nodes[i]); } catch (e) {}
    }
  }
  return keep;
}

function portalOverlayToBody(el) {
  if (!el || typeof document === 'undefined' || !document.body) return;
  if (!isMobileH5Surface()) return;
  try {
    if (el.parentElement !== document.body && typeof document.body.appendChild === 'function') {
      document.body.appendChild(el);
    }
  } catch (e) {}
}

function isInlineDisplayNone(el) {
  if (!el) return true;
  const d = (el.style && el.style.display) || '';
  if (d === 'none') return true;
  const attr = (typeof el.getAttribute === 'function') ? (el.getAttribute('style') || '') : '';
  if (/display\s*:\s*none/i.test(attr) && d !== 'flex' && d !== 'block') return true;
  return false;
}

function isDrawerVisiblyOpen(el) {
  if (!el || !el.classList || el.classList.contains('collapsed')) return false;
  if (isInlineDisplayNone(el)) return false;
  return true;
}

function isAnyOverlayOpen() {
  if (typeof document === 'undefined') return false;
  try {
    if (document.body && document.body.classList) {
      if (document.body.classList.contains('pokedex-modal-open') || document.body.classList.contains('modal-open')) return true;
    }
    if (document.querySelector && document.querySelector('.sidebar-backdrop.active')) return true;
    if (isDrawerVisiblyOpen(resolveUniqueOverlay('pokemon-filter-sidebar'))) return true;
    if (isDrawerVisiblyOpen(resolveUniqueOverlay('recipe-filter-sidebar'))) return true;
    if (isDrawerVisiblyOpen(resolveUniqueOverlay('box-filter-sidebar'))) return true;
    if (isDrawerVisiblyOpen(resolveUniqueOverlay('ladder-filter-sidebar'))) return true;
    for (let i = 0; i < MOBILE_OVERLAY_IDS.length; i++) {
      const id = MOBILE_OVERLAY_IDS[i];
      if (id.indexOf('sidebar') !== -1 || id.indexOf('backdrop') !== -1) continue;
      const nodes = queryAllById(id);
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j] && !isInlineDisplayNone(nodes[j])) return true;
      }
    }
    if (document.querySelector) {
      const appraisal = document.querySelector('.appraisal-modal-backdrop');
      if (appraisal && !isInlineDisplayNone(appraisal)) return true;
    }
  } catch (e) {}
  return false;
}

function syncOverlayOpenState() {
  if (typeof document === 'undefined' || !document.body || !document.body.classList) return;
  try {
    if (isAnyOverlayOpen()) document.body.classList.add('overlay-open');
    else document.body.classList.remove('overlay-open');
  } catch (e) {}
}

function portalMobileOverlays(extraEl) {
  if (isMobileH5Surface() && extraEl) {
    portalOverlayToBody(extraEl);
    if (extraEl.id && SIDEBAR_BACKDROP_BY_ID[extraEl.id]) {
      const backdrop = resolveUniqueOverlay(SIDEBAR_BACKDROP_BY_ID[extraEl.id]);
      if (backdrop) portalOverlayToBody(backdrop);
    }
  }
  syncOverlayOpenState();
}

function pruneOverlayDuplicates(ids) {
  const list = (ids && ids.length) ? ids : MOBILE_OVERLAY_IDS;
  for (let i = 0; i < list.length; i++) resolveUniqueOverlay(list[i]);
}

if (typeof window !== 'undefined') {
  window.portalOverlayToBody = portalOverlayToBody;
  window.portalMobileOverlays = portalMobileOverlays;
  window.resolveUniqueOverlay = resolveUniqueOverlay;
  window.pruneOverlayDuplicates = pruneOverlayDuplicates;
  window.syncOverlayOpenState = syncOverlayOpenState;
  window.isAnyOverlayOpen = isAnyOverlayOpen;
}
PokemonApp.portalOverlayToBody = portalOverlayToBody;
PokemonApp.portalMobileOverlays = portalMobileOverlays;
PokemonApp.resolveUniqueOverlay = resolveUniqueOverlay;
PokemonApp.pruneOverlayDuplicates = pruneOverlayDuplicates;
PokemonApp.syncOverlayOpenState = syncOverlayOpenState;
PokemonApp.isAnyOverlayOpen = isAnyOverlayOpen;
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

      // 僅最終進化篩選 (Only Final Evolution)
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

// 遮罩層專屬事件消費器 (Backdrop Event Consumer - 徹底阻斷穿透至底層元件)
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

// 手勢右滑收合控制 (Swipe Right to Close Sidebar Helper - 支援全組件區域右滑且不干擾點選與滑桿)
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
      bookmarkHandle.style.removeProperty('display');
      bookmarkHandle.style.removeProperty('opacity');
      bookmarkHandle.style.removeProperty('visibility');
      bookmarkHandle.style.removeProperty('pointer-events');
    }
    if (typeof setSidebarSavedState === 'function') {
      setSidebarSavedState('pksleep_dex_sidebar_open', false);
    }
  } else {
    if (typeof portalMobileOverlays === 'function') portalMobileOverlays(sidebar);
    sidebar.classList.remove('collapsed');
    if (typeof window !== 'undefined' && window.innerWidth <= 1024 && backdrop) {
      backdrop.classList.add('active');
    }
    if (bookmarkHandle) {
      bookmarkHandle.classList.add('drawer-open');
      bookmarkHandle.setAttribute('aria-expanded', 'true');
      bookmarkHandle.title = '收合篩選側邊欄';
      bookmarkHandle.style.removeProperty('display');
      bookmarkHandle.style.removeProperty('opacity');
      bookmarkHandle.style.removeProperty('visibility');
      bookmarkHandle.style.removeProperty('pointer-events');
    }
    if (typeof setSidebarSavedState === 'function') {
      setSidebarSavedState('pksleep_dex_sidebar_open', true);
    }
  }
  if (typeof syncOverlayOpenState === 'function') syncOverlayOpenState();
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

    /* ─── 主題與外觀系統 (Theme System - 4 Themes × 2 Normal/Inverted = 8 Themes) ─── */
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

    /* ─── 語言系統 (Language System) ─── */
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

    /* ───  設定彈窗控制 ─── */
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
        prepareOverlayOpen(settingsModal);
        settingsModal.style.display = 'flex';
        if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(settingsModal);
      });

      if (settingsCloseBtn) {
        settingsCloseBtn.addEventListener('click', () => {
          animateOverlayClose(settingsModal, () => { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); });
        });
      }

      if (savePatBtn) {
        savePatBtn.addEventListener('click', () => {
          const val = ghPatInput ? ghPatInput.value.trim() : '';
          if (val) {
            ghPat = val;
            localStorage.setItem(GH_PAT_KEY, val);
            animateOverlayClose(settingsModal, () => { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); });
            if (syncStatus) syncStatus.innerHTML = `<span style="color:#4ade80;">[✓] PAT Token 已儲存！現在可以點擊同步資料。</span>`;
          } else {
            animateOverlayClose(settingsModal, () => { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); });
          }
        });
      }

      settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) animateOverlayClose(settingsModal, () => { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); });
      });
    }

    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        if (!ghPat) {
          if (syncStatus) {
            syncStatus.innerHTML = `
              <span style="color:#fbbf24;">[!] 尚未設定 GitHub PAT Token。</span><br>
              請先點擊 <strong>設定</strong> 並填入你的 GitHub PAT。
            `;
          }
          return;
        }

        syncBtn.disabled = true;
        syncBtn.textContent = '觸發同步中...';
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
                <span style="color:#4ade80;">[✓] GitHub Actions 同步已觸發！</span><br>
                <span style="font-size:12px;color:#94a3b8;">約 60-120 秒後資料更新至 GitHub Pages。
                  <a href="https://github.com/${GH_OWNER}/${GH_REPO}/actions" target="_blank"
                    style="color:#38bdf8;">查看進度 ↗</a>
                </span>
              `;
            }
            setTimeout(() => location.reload(), 90000);
          } else if (res.status === 401 || res.status === 403) {
            if (syncStatus) syncStatus.innerHTML = `<span style="color:#ef4444;">[X] PAT Token 無效或權限不足，請重新設定。</span>`;
          } else {
            const body = await res.text();
            if (syncStatus) syncStatus.innerHTML = `<span style="color:#fbbf24;">[!] 回應 ${res.status}：${body.slice(0, 120)}</span>`;
          }
        } catch (e) {
          if (syncStatus) syncStatus.innerHTML = `<span style="color:#ef4444;">[X] 網路錯誤：${e.message}</span>`;
        } finally {
          syncBtn.disabled = false;
          syncBtn.textContent = '同步資料';
        }
      });
    }

    window.getItemIcon = getIconUrl;

