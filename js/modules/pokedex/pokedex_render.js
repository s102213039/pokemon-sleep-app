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
      // 1. 優先自本機 LocalStorage 瞬間載入快取 (Cache-First 0ms 秒開)，背景再由 manifest 檢查是否需更新
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const cachedText = window.localStorage.getItem(CACHE_KEY_DATA_JSON);
          if (cachedText) {
            const cachedData = JSON.parse(cachedText);
            if (Array.isArray(cachedData) && cachedData.length > 0) {
              return cachedData;
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
                  window.localStorage.setItem(CACHE_KEY_DATA_JSON, text);
                  window.localStorage.setItem(CACHE_KEY_DATA_JSON_TIME, String(Date.now()));
                }
                if (typeof window !== 'undefined' && window.DataCacheManager) {
                  window.DataCacheManager.saveCachedJson(CACHE_KEY_DATA_JSON, 'data.json', text);
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
              return cachedData;
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
            ${b.icon ? `<img src="${b.icon}" class="subfilter-icon-img" alt="${berryName}" loading="lazy" onerror="this.style.display='none';">` : ''}
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
            ${ing.icon ? `<img src="${ing.icon}" class="subfilter-icon-img" alt="${ingName}" loading="lazy" onerror="this.style.display='none';">` : ''}
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
      PokemonApp.uniqueIngredients = uniqueIngredients;
      if (typeof window !== 'undefined') window.uniqueIngredients = uniqueIngredients;

      renderTypeButtons();
      renderSpecialtyButtons();
      renderBerryButtons();
      renderIngredientButtons();
      renderSkillButtons();
      updateSubfilterVisibility();

      if (PokemonApp._filtersEventsBound) return;
      PokemonApp._filtersEventsBound = true;

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

      //  左側抽屜式側邊欄展開與收合控制 (Left Sliding Sidebar Controller)
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
          if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(sidebar);
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
        if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
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
          if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(sidebar);
          if (window.innerWidth <= 1024 && backdrop) backdrop.classList.add('active');
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
      window.bindBackdropDismiss = bindBackdropDismiss;

      if (backdrop) {
        bindBackdropDismiss(backdrop, () => toggleSidebar(false));
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

      // 全域防護：點擊遮罩層 (sidebar-backdrop) 時優雅收合側邊欄並消費事件
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
          if (typeof window.toggleBoxSidebar === 'function') {
            window.toggleBoxSidebar(false);
          }
          document.querySelectorAll('.pokemon-filter-sidebar, .recipe-filter-sidebar, .box-filter-sidebar, .ladder-fixed-sidebar').forEach(sb => {
            sb.classList.add('collapsed');
          });
          document.querySelectorAll('.sidebar-backdrop').forEach(bd => bd.classList.remove('active'));
          const curMainTab = (typeof window !== 'undefined' && window.location && window.location.hash)
            ? window.location.hash.replace(/^#/, '').split(/[/_?]/)[0]
            : (typeof localStorage !== 'undefined' ? localStorage.getItem('pksleep_active_main_tab') || 'pokemon' : 'pokemon');
          const isPoke = curMainTab === 'pokemon' || curMainTab === '';
          const isRecipe = curMainTab === 'recipes';
          const isWiki = curMainTab === 'wiki';
          const isBox = curMainTab === 'box';

          const f1 = document.getElementById('sidebar-bookmark-handle');
          const f2 = document.getElementById('recipe-sidebar-bookmark-handle');
          const f3 = document.getElementById('ladder-sidebar-bookmark-handle');
          const f4 = document.getElementById('box-sidebar-bookmark-handle');

          if (f1) {
            f1.style.opacity = isPoke ? '1' : '0';
            f1.style.pointerEvents = isPoke ? 'auto' : 'none';
            f1.style.display = isPoke ? 'flex' : 'none';
            f1.style.visibility = isPoke ? 'visible' : 'hidden';
          }
          if (f2) {
            f2.style.opacity = isRecipe ? '1' : '0';
            f2.style.pointerEvents = isRecipe ? 'auto' : 'none';
            f2.style.display = isRecipe ? 'flex' : 'none';
            f2.style.visibility = isRecipe ? 'visible' : 'hidden';
          }
          if (f3) {
            const rawHash = (typeof window !== 'undefined' && window.location && window.location.hash) || '';
            const isIngSubtab = rawHash.includes('/ingredients') || (typeof localStorage !== 'undefined' && localStorage.getItem('pksleep_active_wiki_subtab') === 'ingredients');
            const showF3 = isWiki && isIngSubtab;
            f3.style.opacity = showF3 ? '1' : '0';
            f3.style.pointerEvents = showF3 ? 'auto' : 'none';
            f3.style.display = showF3 ? 'flex' : 'none';
            f3.style.visibility = showF3 ? 'visible' : 'hidden';
          }
          if (f4) {
            const rawHash = (typeof window !== 'undefined' && window.location && window.location.hash) || '';
            const isLabSubtab = rawHash.includes('/lab') || (typeof localStorage !== 'undefined' && localStorage.getItem('pksleep_active_box_subtab') === 'lab');
            const showF4 = isBox && !isLabSubtab;
            f4.style.opacity = showF4 ? '1' : '0';
            f4.style.pointerEvents = showF4 ? 'auto' : 'none';
            f4.style.display = showF4 ? 'flex' : 'none';
            f4.style.visibility = showF4 ? 'visible' : 'hidden';
          }
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

        // 僅最終進化篩選 (Only Final Evolution)
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
            let specClass = 'spec-ingredient';
            const rawSpec = p.specialty || '';
            if (rawSpec.includes('樹果') || rawSpec === 'Berries') {
              specClass = 'spec-berry';
            } else if (rawSpec.includes('技能') || rawSpec === 'Skills') {
              specClass = 'spec-skill';
            } else if (rawSpec.includes('全能') || rawSpec.includes('全部') || rawSpec === 'All-Rounder' || rawSpec.toLowerCase() === 'all') {
              specClass = 'spec-all';
            }
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
                  <span class="stat-value" style="white-space:nowrap;">${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(p.specialty, 20) : `<span class="box-spec-tag ${specClass}">${specName}</span>`}</span>
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
                <span class="card-skill-label">${t('th.main_skill', '主技能')}</span>
                <span class="card-skill-value">${renderSkillWithTooltip(p.main_skill, p)}</span>
              </div>
            </div>
          `}).join('')}
          <div class="table-bottom-spacer" aria-hidden="true"></div>
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
                ${isShowNo ? sortableTh('no', 'No.', 'th-no') : ''}
                ${sortableTh('no', t('th.icon', '圖示'), 'th-icon')}
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
                let specClass = 'spec-ingredient';
                const rawSpec = p.specialty || '';
                if (rawSpec.includes('樹果') || rawSpec === 'Berries') {
                  specClass = 'spec-berry';
                } else if (rawSpec.includes('技能') || rawSpec === 'Skills') {
                  specClass = 'spec-skill';
                } else if (rawSpec.includes('全能') || rawSpec.includes('全部') || rawSpec === 'All-Rounder' || rawSpec.toLowerCase() === 'all') {
                  specClass = 'spec-all';
                }
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
                  <td class="td-spec" style="text-align:center;">${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(p.specialty, 20) : `<span class="box-spec-tag ${specClass}">${specName}</span>`}</td>
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
          <div class="table-bottom-spacer" aria-hidden="true"></div>
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
      let isRecentTouch = false;
      let touchResetTimer = null;
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;
      let didHandleTouchTap = false;

      // 1. 觸控開始 (Capture 捕獲：若點選外部立即關閉浮窗，並記錄觸控起點)
      const onTouchStart = (e) => {
        isRecentTouch = true;
        didHandleTouchTap = false;
        if (touchResetTimer) clearTimeout(touchResetTimer);
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
        }

        // 若當前有任何浮窗顯示中，檢查觸控目標是否在浮窗或觸發按鈕內
        if (isAnyFloatingTooltipVisible()) {
          const target = e.target;
          const isInsideTooltip = target && target.closest && target.closest(
            '.global-skill-tooltip, .pokedex-energy-help-bubble, .ladder-energy-help-bubble, .ladder-skill-tooltip-bubble, .island-sleep-hover-tooltip, .ladder-node-tooltip'
          );
          const isTriggerBtn = target && target.closest && target.closest(
            '.pot-expansion-help-btn, .pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn, .special-skill-badge, .ladder-node'
          );
          // 若點選的是其他任何非浮窗且非觸發按鈕的區域，立即關閉浮窗
          if (!isInsideTooltip && !isTriggerBtn) {
            dismissAllFloatingTooltips();
          }
        }
      };

      let _lastTouchStartEvt = null;
      const origOnTouchStart = onTouchStart;
      const dedupTouchStart = (e) => {
        if (e && e === _lastTouchStartEvt) return;
        _lastTouchStartEvt = e;
        origOnTouchStart(e);
      };
      document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true });
      window.addEventListener('touchstart', dedupTouchStart, { capture: true, passive: true });

      // 2. 觸控釋放 (輕觸手勢開關浮窗)
      document.addEventListener('touchend', (e) => {
        if (touchResetTimer) clearTimeout(touchResetTimer);
        touchResetTimer = setTimeout(() => {
          isRecentTouch = false;
        }, 350);

        if (e.changedTouches && e.changedTouches[0]) {
          const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
          const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
          const dt = Date.now() - touchStartTime;

          // 輕觸手勢判定 (位移極小且釋放迅速，代表點選觸發)
          if (dx < 10 && dy < 10 && dt < 450) {
            const ladderNode = e.target.closest('.ladder-node');
            if (ladderNode) {
              if (e.target.closest('.ladder-node-tooltip')) {
                return;
              }
              didHandleTouchTap = true;
              if (e.cancelable) e.preventDefault();
              const wasActive = ladderNode.classList.contains('tooltip-active');
              dismissAllFloatingTooltips();
              if (!wasActive) {
                ladderNode.classList.add('tooltip-active');
                markLadderGroupSelected(ladderNode);
                const trackRow = ladderNode.closest('.ladder-track-row, .ladder-tail-track-row');
                if (trackRow) trackRow.classList.add('has-active-tooltip');
                hasAnyFloatingTooltipOpen = true;
                if (typeof window !== 'undefined') window._hasAnyFloatingTooltipOpen = true;
              }
              return;
            }

            const badge = e.target.closest('.special-skill-badge');
            if (badge) {
              didHandleTouchTap = true;
              if (e.cancelable) e.preventDefault();
              const skillName = badge.dataset.skill || '';
              const detail = badge.dataset.skillDetail || badge.getAttribute('title') || badge.dataset.nativeTitle || '';
              if (!detail) return;
              const titleName = (typeof window !== 'undefined' && window.I18N) ? window.I18N.getMainSkillName(skillName) : skillName;
              toggleGlobalTooltip(badge, titleName, detail);
              return;
            }

            const helpBtn = e.target.closest('.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn') || e.target.closest('.pot-expansion-help-btn');
            if (helpBtn) {
              didHandleTouchTap = true;
              if (e.cancelable) e.preventDefault();
              const help = getHelpButtonData(helpBtn);
              if (help) {
                toggleGlobalTooltip(helpBtn, help.title, help.body);
              }
              return;
            }
          }
        }
      }, { passive: false });

      document.addEventListener('touchcancel', () => {
        if (touchResetTimer) clearTimeout(touchResetTimer);
        touchResetTimer = setTimeout(() => {
          isRecentTouch = false;
        }, 350);
      }, { passive: true });

      // 3. 滑鼠懸停 (Desktop Web 瞬時響應，無任何動畫延遲)
      document.addEventListener('mouseover', (e) => {
        if (isRecentTouch) return;

        const badge = e.target.closest('.special-skill-badge');
        if (badge) {
          const skillName = badge.dataset.skill || '';
          const detail = badge.dataset.skillDetail || badge.getAttribute('title') || badge.dataset.nativeTitle || '';
          if (!detail) return;
          const titleName = (typeof window !== 'undefined' && window.I18N) ? window.I18N.getMainSkillName(skillName) : skillName;
          showGlobalTooltip(badge, titleName, detail);
          return;
        }

        const helpBtn = e.target.closest('.ladder-formula-help-btn, .ladder-help-icon-btn, .pokedex-formula-help-btn') || e.target.closest('.pot-expansion-help-btn');
        if (helpBtn) {
          const help = getHelpButtonData(helpBtn);
          if (help) {
            showGlobalTooltip(helpBtn, help.title, help.body);
          }
        }
      });

      document.addEventListener('mouseout', (e) => {
        if (isRecentTouch || isTooltipPinned) return;
        const badge = e.target.closest('.special-skill-badge');
        const helpBtn = e.target.closest('.pot-expansion-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn, .pokedex-formula-help-btn');
        if (badge || helpBtn) {
          hideGlobalTooltip();
        }
      });

      // 4. 點擊事件 (Desktop 點擊固定/切換與 Mobile 備援點選)
      document.addEventListener('click', (e) => {
        if (didHandleTouchTap) {
          didHandleTouchTap = false;
          return;
        }

        const ladderNode = e.target.closest('.ladder-node');
        if (ladderNode) {
          if (e.target.closest('.ladder-node-tooltip')) {
            return;
          }
          e.stopPropagation();
          const wasActive = ladderNode.classList.contains('tooltip-active');
          dismissAllFloatingTooltips();
          if (!wasActive) {
            ladderNode.classList.add('tooltip-active');
            markLadderGroupSelected(ladderNode);
            const trackRow = ladderNode.closest('.ladder-track-row, .ladder-tail-track-row');
            if (trackRow) trackRow.classList.add('has-active-tooltip');
            hasAnyFloatingTooltipOpen = true;
            if (typeof window !== 'undefined') window._hasAnyFloatingTooltipOpen = true;
          }
          return;
        }

        const badge = e.target.closest('.special-skill-badge');
        if (badge) {
          e.stopPropagation();
          const skillName = badge.dataset.skill || '';
          const detail = badge.dataset.skillDetail || badge.getAttribute('title') || badge.dataset.nativeTitle || '';
          if (!detail) return;
          const titleName = (typeof window !== 'undefined' && window.I18N) ? window.I18N.getMainSkillName(skillName) : skillName;
          toggleGlobalTooltip(badge, titleName, detail);
          return;
        }

        const helpBtn = e.target.closest('.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn') || e.target.closest('.pot-expansion-help-btn');
        if (helpBtn) {
          if (helpBtn.classList.contains('pot-expansion-help-btn')) {
            e.stopPropagation();
            const help = getHelpButtonData(helpBtn);
            if (help) {
              toggleGlobalTooltip(helpBtn, help.title, help.body);
            }
            return;
          }
          // 若有自帶 onclick，由自身控制，不執行外部關閉
          return;
        }

        // 點擊懸浮窗本體不關閉
        if (e.target.closest && e.target.closest('.global-skill-tooltip, .pokedex-energy-help-bubble, .ladder-energy-help-bubble, .ladder-skill-tooltip-bubble, .island-sleep-hover-tooltip, .ladder-node-tooltip')) {
          return;
        }

        // 點擊其他任何非浮窗區域一律關閉所有懸浮說明
        dismissAllFloatingTooltips();
      });

      // 5. 頁面或任何容器滾動時即時關閉所有浮窗 (若當前無開啟中的浮窗則極速跳過，避免滾動開銷與 Forced Reflow)
      let _lastScrollEvt = null;
      const onScrollDismiss = (e) => {
        if (e && e === _lastScrollEvt) return;
        _lastScrollEvt = e;
        if (!currentGlobalTooltipAnchor) {
          if (!hasAnyFloatingTooltipOpen && !(typeof window !== 'undefined' && window._hasAnyFloatingTooltipOpen) && !isAnyFloatingTooltipVisible()) return;
        }
        dismissAllFloatingTooltips();
      };

      document.addEventListener('scroll', onScrollDismiss, { capture: true, passive: true });
      window.addEventListener('scroll', onScrollDismiss, { capture: true, passive: true });
      window.addEventListener('wheel', onScrollDismiss, { capture: true, passive: true });

      // 6. 手指滑動位移時關閉所有浮窗 (H5 App 移動超過 3px 即判定為滑動瀏覽，立即關閉浮窗)
      let _lastTouchMoveEvt = null;
      const onTouchMove = (e) => {
        if (e && e === _lastTouchMoveEvt) return;
        _lastTouchMoveEvt = e;
        if (!currentGlobalTooltipAnchor) {
          if (!hasAnyFloatingTooltipOpen && !(typeof window !== 'undefined' && window._hasAnyFloatingTooltipOpen) && !isAnyFloatingTooltipVisible()) return;
        }
        if (e.touches && e.touches[0]) {
          const dx = Math.abs(e.touches[0].clientX - touchStartX);
          const dy = Math.abs(e.touches[0].clientY - touchStartY);
          if (dx > 3 || dy > 3 || (dx > 10 || dy > 10)) {
            dismissAllFloatingTooltips();
          }
        }
      };

      document.addEventListener('touchmove', onTouchMove, { capture: true, passive: true });
      window.addEventListener('touchmove', onTouchMove, { capture: true, passive: true });
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

      let backToTopRafId = null;
      function requestUpdateBackToTopVisibility() {
        if (backToTopRafId) return;
        backToTopRafId = (typeof requestAnimationFrame === 'function')
          ? requestAnimationFrame(() => {
              backToTopRafId = null;
              updateBackToTopVisibility();
            })
          : setTimeout(() => {
              backToTopRafId = null;
              updateBackToTopVisibility();
            }, 16);
      }

      window.addEventListener('scroll', requestUpdateBackToTopVisibility, { passive: true });
      window.addEventListener('resize', requestUpdateBackToTopVisibility, { passive: true });

      window.updateBackToTopVisibility = updateBackToTopVisibility;
      PokemonApp.updateBackToTopVisibility = updateBackToTopVisibility;
      updateBackToTopVisibility();
    }

    // 原生 App 風格下拉刷新指示器 (Native App Pull-to-Refresh Controller)
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

      function isModalOrDrawerActive() {
        if (typeof document === 'undefined') return false;
        if (document.body && document.body.classList) {
          if (document.body.classList.contains('overlay-open') || document.body.classList.contains('modal-open') || document.body.classList.contains('pokedex-modal-open')) {
            return true;
          }
        }
        if (typeof window.isAnyOverlayOpen === 'function' && window.isAnyOverlayOpen()) return true;
        const pokedexModal = document.getElementById('pokedex-detail-modal');
        if (pokedexModal && (pokedexModal.style.display === 'flex' || pokedexModal.style.display === 'block')) {
          return true;
        }
        const activeModal = document.querySelector('.sidebar-backdrop.active, .modal-overlay.active, .subskill-sheet-modal.active, .appraisal-modal-overlay.active, .appraisal-modal-backdrop, .pokedex-modal-backdrop:not([style*="display: none"]):not([style*="display:none"]), #settings-modal:not([style*="display: none"]):not([style*="display:none"]), #box-edit-modal:not([style*="display: none"]):not([style*="display:none"]), #ladder-recipe-modal:not([style*="display: none"]):not([style*="display:none"]), #box-guide-lightbox-modal:not([style*="display: none"]):not([style*="display:none"])');
        if (activeModal) return true;
        if (document.querySelector('#pokemon-filter-sidebar:not(.collapsed), #recipe-filter-sidebar:not(.collapsed), #ladder-filter-sidebar:not(.collapsed), .ladder-fixed-sidebar:not(.collapsed)')) return true;
        return false;
      }

      document.addEventListener('touchstart', (e) => {
        if (isRefreshing || !e.touches || !e.touches[0]) return;
        if (isModalOrDrawerActive()) {
          isTracking = false;
          touchStartY = e.touches[0].clientY;
          touchStartX = e.touches[0].clientX;
          return;
        }
        // 嚴格判定：只有在最頂部時才允許判斷觸發下拉刷新
        if (getActiveScrollTop() > 2) {
          isTracking = false;
          return;
        }

        // 避免在開啟的側邊欄、彈窗、懸浮按鈕或導覽列內誤觸發全頁下拉刷新
        const target = e.target;
        if (target && target.closest && target.closest(
          '.sidebar-bookmark-handle, .sidebar-fab-btn, .box-fab-container, .box-fab-btn, ' +
          '.bottom-dock, .mobile-bottom-dock, .bottom-dock-nav, .dock-item, ' +
          '.app-header, .mobile-app-header, ' +
          '#pokedex-detail-modal, .pokedex-modal-backdrop, .pokedex-modal-dialog, .pokedex-modal-body, ' +
          '.pokemon-filter-sidebar, .recipe-filter-sidebar, .box-filter-sidebar, .ladder-fixed-sidebar, ' +
          '.sidebar-backdrop, .modal-overlay, .subskill-sheet-modal, .appraisal-modal-overlay, .appraisal-modal-backdrop, ' +
          '#settings-modal, #box-edit-modal, #box-delete-confirm-modal, #ladder-recipe-modal, #box-guide-lightbox-modal, .box-guide-lightbox-backdrop'
        )) {
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
        const targetEl = e.target;
        if (targetEl && targetEl.closest && targetEl.closest(
          '.sidebar-bookmark-handle, .sidebar-fab-btn, .box-fab-container, .box-fab-btn, ' +
          '.bottom-dock, .mobile-bottom-dock, .bottom-dock-nav, .dock-item, ' +
          '.app-header, .mobile-app-header'
        )) {
          isTracking = false;
          if (currentPull > 0) {
            currentPull = 0;
            updatePtrUI(0);
          }
          return;
        }
        if (isModalOrDrawerActive()) {
          isTracking = false;
          if (currentPull > 0) {
            currentPull = 0;
            updatePtrUI(0);
          }
          const t = e.target;
          const scrollable = t && t.closest ? t.closest('.sidebar-scrollable-content, .pokedex-modal-body, .box-modal-body, .settings-modal-body, .ladder-recipe-modal-body, .appraisal-modal-body, .box-guide-lightbox-dialog') : null;
          if (!scrollable || scrollable.scrollTop <= 0) {
            if (e.touches[0].clientY > touchStartY && e.cancelable) {
              e.preventDefault();
            }
          }
          return;
        }
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
      }, { passive: false });

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
let pokedexSubskillPaletteExpanded = false;
