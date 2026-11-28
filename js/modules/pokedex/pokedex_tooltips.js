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
