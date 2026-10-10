/**
 * DOMUtils — 專案共用安全 DOM 查詢與輔助工具
 * 提供跨環境（瀏覽器環境、JSDOM、單元測試 Mock 環境）之安全元素查找、事件綁定與批次處理
 */
(function (global) {
  'use strict';

  const DOMUtils = {
    /**
     * 安全單一元素查詢
     * @param {Element|Document|null} parent - 查找容器，若為空則預設為 global.document
     * @param {string} selector - CSS 選擇器
     * @returns {Element|null}
     */
    find: function (parent, selector) {
      if (!selector) return null;
      const root = parent || (typeof global.document !== 'undefined' ? global.document : null);
      if (!root) return null;
      if (typeof root.querySelector === 'function') {
        try {
          return root.querySelector(selector);
        } catch (e) {
          return null;
        }
      }
      return null;
    },

    /**
     * 安全多元素查詢，保證回傳陣列
     * @param {Element|Document|null} parent - 查找容器，若為空則預設為 global.document
     * @param {string} selector - CSS 選擇器
     * @returns {Array<Element>}
     */
    findAll: function (parent, selector) {
      if (!selector) return [];
      const root = parent || (typeof global.document !== 'undefined' ? global.document : null);
      if (!root) return [];
      if (typeof root.querySelectorAll === 'function') {
        try {
          const res = root.querySelectorAll(selector);
          return res ? Array.from(res) : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    },

    /**
     * 依據 ID 查找元素
     * @param {string} id - 元素 ID
     * @returns {Element|null}
     */
    byId: function (id) {
      if (!id || typeof global.document === 'undefined' || typeof global.document.getElementById !== 'function') {
        return null;
      }
      return global.document.getElementById(id);
    },

    /**
     * 安全切換 class
     * @param {Element|null} el
     * @param {string} className
     * @param {boolean} [force]
     */
    toggleClass: function (el, className, force) {
      if (!el || !el.classList || typeof el.classList.toggle !== 'function') return;
      el.classList.toggle(className, force);
    },

    /**
     * 批次設定樣式
     * @param {Element|null} el
     * @param {string} prop
     * @param {string} value
     */
    setStyle: function (el, prop, value) {
      if (!el || !el.style) return;
      el.style[prop] = value;
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMUtils;
  }
  if (typeof global !== 'undefined') {
    global.DOMUtils = DOMUtils;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
