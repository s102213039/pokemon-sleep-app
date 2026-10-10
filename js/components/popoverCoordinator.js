/**
 * PopoverCoordinator — 專案全域浮窗與懸浮氣泡協調器
 * 統一管理全站 Tooltip、Popover、能量說明氣泡之開啟互斥、滾動自動解綁與分頁切換時的安全銷毀
 */
(function (global) {
  'use strict';

  const PopoverCoordinator = {
    /**
     * 檢查當前是否有任何開啟中的浮動視窗
     * @returns {boolean}
     */
    hasAnyOpen: function () {
      if (typeof global.document === 'undefined') return false;
      const lPop = global.document.getElementById('ladder-energy-help-popover');
      if (lPop && lPop.style.display !== 'none' && lPop.style.display !== '') return true;
      const sPop = global.document.getElementById('ladder-skill-help-modal');
      if (sPop && sPop.style.display !== 'none' && sPop.style.display !== '') return true;
      if (global.document.getElementById('island-sleep-popover')) return true;
      if (typeof global.document.querySelector === 'function' && global.document.querySelector('.ladder-node.tooltip-active')) return true;
      return false;
    },

    /**
     * 一鍵安全關閉並清理所有浮窗與氣泡
     */
    dismissAll: function () {
      if (typeof global !== 'undefined') {
        global._hasAnyFloatingTooltipOpen = false;
      }

      // 1. 關閉全域基礎 Tooltip
      if (global.PokemonApp && typeof global.PokemonApp.hideGlobalTooltip === 'function') {
        global.PokemonApp.hideGlobalTooltip();
      } else if (typeof global.hideGlobalTooltip === 'function') {
        global.hideGlobalTooltip();
      }

      // 2. 關閉圖鑑彈窗能量說明
      if (global.PokemonApp && typeof global.PokemonApp.closePokedexEnergyHelp === 'function') {
        global.PokemonApp.closePokedexEnergyHelp();
      } else if (typeof global.closePokedexEnergyHelp === 'function') {
        global.closePokedexEnergyHelp();
      }

      // 3. 關閉天梯與百科各浮窗
      if (global.WikiDB) {
        if (typeof global.WikiDB.closeLadderEnergyHelp === 'function') global.WikiDB.closeLadderEnergyHelp();
        if (typeof global.WikiDB.closeSkillDrawHelpModal === 'function') global.WikiDB.closeSkillDrawHelpModal();
        if (typeof global.WikiDB.closeSleepStylePopover === 'function') global.WikiDB.closeSleepStylePopover();
      }
      if (typeof global.closeLadderEnergyHelp === 'function') global.closeLadderEnergyHelp();
      if (typeof global.closeSkillDrawHelpModal === 'function') global.closeSkillDrawHelpModal();
      if (typeof global.closeSleepStylePopover === 'function') global.closeSleepStylePopover();

      // 4. 清理 DOM 元素狀態
      if (typeof global.document !== 'undefined') {
        const pPop = global.document.getElementById('pokedex-energy-help-popover');
        if (pPop) pPop.style.display = 'none';
        const lPop = global.document.getElementById('ladder-energy-help-popover');
        if (lPop) lPop.style.display = 'none';
        const sPop = global.document.getElementById('ladder-skill-help-modal');
        if (sPop) sPop.style.display = 'none';

        const islandPop = global.document.getElementById('island-sleep-popover');
        if (islandPop && islandPop.parentNode) islandPop.parentNode.removeChild(islandPop);
        const islandBackdrop = global.document.getElementById('island-sleep-popover-backdrop');
        if (islandBackdrop && islandBackdrop.parentNode) islandBackdrop.parentNode.removeChild(islandBackdrop);

        if (typeof global.document.querySelectorAll === 'function') {
          const helpButtons = global.document.querySelectorAll(
            '.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn, .special-skill-badge, .pot-expansion-help-btn'
          );
          helpButtons.forEach(function (btn) {
            btn.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
            if (typeof btn.blur === 'function') btn.blur();
          });

          const activeNodes = global.document.querySelectorAll('.ladder-node.tooltip-active');
          activeNodes.forEach(function (node) {
            node.classList.remove('tooltip-active');
          });
        }

        if (global.document.activeElement && typeof global.document.activeElement.blur === 'function' && global.document.activeElement !== global.document.body) {
          const activeTag = (global.document.activeElement.tagName || '').toUpperCase();
          const isFormField = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT' || global.document.activeElement.isContentEditable;
          if (!isFormField) {
            global.document.activeElement.blur();
          }
        }
      }
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PopoverCoordinator;
  }
  if (typeof global !== 'undefined') {
    global.PopoverCoordinator = PopoverCoordinator;
    global.dismissAllFloatingTooltips = PopoverCoordinator.dismissAll;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
