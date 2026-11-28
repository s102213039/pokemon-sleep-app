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
          const f1 = document.getElementById('sidebar-bookmark-handle');
          const f2 = document.getElementById('recipe-sidebar-bookmark-handle');
          const f3 = document.getElementById('ladder-sidebar-bookmark-handle');
          const f4 = document.getElementById('box-sidebar-bookmark-handle');
          const f5 = document.getElementById('skill-ladder-sidebar-bookmark-handle');

          const isVis = (el) => {
            if (!el || el.style.display === 'none') return false;
            if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
              try {
                const s = window.getComputedStyle(el);
                return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
              } catch (e) { return true; }
            }
            return true;
          };

          if (isVis(f1) || isVis(f2) || isVis(f3) || isVis(f4) || isVis(f5)) {
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
      let activeTouchTarget = null;
      const PULL_THRESHOLD = 64;
      const MAX_PULL = 84;

      function isTargetVisible(el) {
        if (!el) return false;
        if (el.offsetParent === null) {
          if (typeof window.getComputedStyle === 'function') {
            const s = window.getComputedStyle(el);
            if (s && s.position === 'fixed' && s.display !== 'none') {
              // position: fixed element may have offsetParent === null while visible
            } else {
              return false;
            }
          } else {
            return false;
          }
        }
        let curr = el;
        while (curr && curr !== document.body && curr !== document.documentElement) {
          if (curr.style && curr.style.display === 'none') return false;
          if (typeof window.getComputedStyle === 'function') {
            const s = window.getComputedStyle(curr);
            if (s && s.display === 'none') return false;
          }
          curr = curr.parentElement;
        }
        return true;
      }

      let lastScrollTime = 0;
      let maxTouchY = 0;
      let ptrMoveAttached = false;

      function attachPtrTouchMove() {
        if (ptrMoveAttached || typeof document.addEventListener !== 'function') return;
        document.addEventListener('touchmove', onPtrTouchMove, { passive: false });
        ptrMoveAttached = true;
      }

      function detachPtrTouchMove() {
        if (!ptrMoveAttached || typeof document.removeEventListener !== 'function') return;
        document.removeEventListener('touchmove', onPtrTouchMove, { passive: false });
        ptrMoveAttached = false;
      }

      function cancelPullToRefresh() {
        isTracking = false;
        activeTouchTarget = null;
        currentPull = 0;
        detachPtrTouchMove();
        updatePtrUI(0);
      }
      PokemonApp.cancelPullToRefresh = cancelPullToRefresh;
      window.cancelPullToRefresh = cancelPullToRefresh;

      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('scroll', () => {
          lastScrollTime = Date.now();
          if (isTracking) {
            cancelPullToRefresh();
          }
        }, { capture: true, passive: true });
      }

      const PTR_EXCLUDE_SELECTORS =
        '.sidebar-bookmark-handle, .sidebar-fab-btn, .box-fab-container, .box-fab-btn, ' +
        '.bottom-dock, .mobile-bottom-dock, .bottom-dock-nav, .dock-item, ' +
        '.app-header, .mobile-app-header, ' +
        '#pokedex-detail-modal, .pokedex-modal-backdrop, .pokedex-modal-dialog, .pokedex-modal-body, ' +
        '.pokemon-filter-sidebar, .recipe-filter-sidebar, .box-filter-sidebar, .ladder-fixed-sidebar, ' +
        '.sidebar-backdrop, .modal-overlay, .subskill-sheet-modal, .appraisal-modal-overlay, .appraisal-modal-backdrop, ' +
        '#settings-modal, #box-edit-modal, #box-delete-confirm-modal, #ladder-recipe-modal, #box-guide-lightbox-modal, .box-guide-lightbox-backdrop, ' +
        '.box-subnav-bar, .box-subnav-item, #panel-box .controls-container, .controls-container, .mobile-controls-container, .box-top-banner, ' +
        '#box-dropzone, .box-dropzone, #box-screenshot-guide-card, .search-filter-row, ' +
        '.box-auth-overlay, #box-scanner-status, #box-toast-container';

      function getActiveScrollTop(target) {
        const winScroll = window.pageYOffset || (document.documentElement ? document.documentElement.scrollTop : 0) || (document.body ? document.body.scrollTop : 0) || 0;
        if (winScroll > 0) return winScroll;

        // 1. 深度搜尋 touch target 的所有祖先元素，只要任何容器有滾動即視為未在頂部
        const rawTarget = target;
        const targetEl = (rawTarget && rawTarget.nodeType === 3) ? rawTarget.parentElement : rawTarget;
        if (targetEl && targetEl.nodeType === 1) {
          let curr = targetEl;
          while (curr && curr !== document.body && curr !== document.documentElement) {
            if (curr.scrollTop && curr.scrollTop > 0) {
              return curr.scrollTop;
            }
            curr = curr.parentElement;
          }
        }

        const labEl = typeof document !== 'undefined' && document.getElementById ? document.getElementById('box-subpanel-lab') : null;
        if (labEl && labEl.scrollTop && labEl.scrollTop > 0 && (!labEl.style || labEl.style.display !== 'none')) {
          return labEl.scrollTop;
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
        const rawTarget = e.target;
        const target = (rawTarget && rawTarget.nodeType === 3) ? rawTarget.parentElement : rawTarget;

        if (isModalOrDrawerActive()) {
          cancelPullToRefresh();
          touchStartY = e.touches[0].clientY;
          touchStartX = e.touches[0].clientX;
          return;
        }
        // 嚴格判定：若剛發生容器滾動 (< 180ms 慣性期) 或未在最頂部，拒絕啟動下拉刷新
        if ((Date.now() - lastScrollTime) < 180 || getActiveScrollTop(target) > 0) {
          cancelPullToRefresh();
          return;
        }

        // 避免在開啟的側邊欄、彈窗、懸浮按鈕或導覽列內誤觸發全頁下拉刷新
        if (target && target.closest && target.closest(PTR_EXCLUDE_SELECTORS)) {
          cancelPullToRefresh();
          return;
        }

        isTracking = true;
        activeTouchTarget = target;
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        maxTouchY = touchStartY;
        currentPull = 0;
        updatePtrUI(0);
        if (ptrEl) {
          ptrEl.classList.remove('ptr-refreshing');
          ptrEl.style.transition = 'none';
        }
        attachPtrTouchMove();
      }, { passive: true });

      function onPtrTouchMove(e) {
        if (!isTracking || isRefreshing || !e.touches || !e.touches[0]) return;
        const rawTargetEl = e.target;
        const targetEl = (rawTargetEl && rawTargetEl.nodeType === 3) ? rawTargetEl.parentElement : rawTargetEl;
        if (targetEl && targetEl.closest && targetEl.closest(PTR_EXCLUDE_SELECTORS)) {
          cancelPullToRefresh();
          return;
        }
        if (isModalOrDrawerActive()) {
          cancelPullToRefresh();
          const t = targetEl;
          const scrollable = t && t.closest ? t.closest('.sidebar-scrollable-content, .pokedex-modal-body, .box-modal-body, .settings-modal-body, .ladder-recipe-modal-body, .appraisal-modal-body, .box-guide-lightbox-dialog') : null;
          if (!scrollable || scrollable.scrollTop <= 0) {
            if (e.touches[0].clientY > touchStartY && e.cancelable) {
              e.preventDefault();
            }
          }
          return;
        }

        // 任何時刻只要發生內部滾動或離開最頂部，立即斷開下拉刷新追蹤
        if ((Date.now() - lastScrollTime) < 180 || getActiveScrollTop(targetEl) > 0) {
          cancelPullToRefresh();
          return;
        }

        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const deltaY = currentY - touchStartY;
        const deltaX = currentX - touchStartX;

        if (currentY > maxTouchY) {
          maxTouchY = currentY;
        }

        // 若為向上滑動 (deltaY < -4)、單次手勢中折返上滑 (currentY - maxTouchY < -6)、或橫向左右滑動，永久終止本次觸控追蹤
        if (deltaY < -4 || (currentY - maxTouchY) < -6 || Math.abs(deltaX) > deltaY) {
          cancelPullToRefresh();
          return;
        }

        // 下拉未達 12px 防抖死區前，不啟動 UI 位移變換
        if (deltaY < 12) {
          if (currentPull > 0) {
            currentPull = 0;
            updatePtrUI(0);
          }
          return;
        }

        // 阻尼係數計算下拉位移
        currentPull = Math.min(MAX_PULL, Math.pow(deltaY, 0.8) * 1.8);
        updatePtrUI(currentPull);
      }

      document.addEventListener('touchcancel', () => {
        cancelPullToRefresh();
      }, { passive: true });

      document.addEventListener('touchend', () => {
        if (!isTracking || isRefreshing) return;
        isTracking = false;

        if (isModalOrDrawerActive() || !isTargetVisible(activeTouchTarget)) {
          cancelPullToRefresh();
          return;
        }

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
        activeTouchTarget = null;
        detachPtrTouchMove();
      }, { passive: true });

      window.cancelPullToRefresh = cancelPullToRefresh;
      PokemonApp.cancelPullToRefresh = cancelPullToRefresh;
      window.initPullToRefresh = initPullToRefresh;
      PokemonApp.initPullToRefresh = initPullToRefresh;
    }
