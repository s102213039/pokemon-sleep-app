/**
 * CustomSelect — 獨立可複用自訂下拉選單組件
 * 
 * 核心規範遵循：
 * 1. 箭頭內縮間距：向下選單箭頭與右側邊框保留寬鬆精緻間距（padding-right: 36px），防止文字覆蓋箭頭。
 * 2. 正對下方展開：選單彈出時正對選擇框下方對齊展開，杜絕居中覆蓋選擇框本體。
 * 3. 零 Emoji 規範：所有圖示與選單項目採用純向量 SVG 或乾淨文字排版。
 */
(function (global) {
  'use strict';

  function closeAllDropdowns() {
    if (typeof global.document === 'undefined' || typeof global.document.querySelectorAll !== 'function') return;
    const openContainers = global.document.querySelectorAll('.custom-select-container.open');
    openContainers.forEach(function (c) {
      c.classList.remove('open');
      const btn = c.querySelector('.custom-select-trigger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function setupCustomSelect(selectElement) {
    if (!selectElement || selectElement._customized || !selectElement.parentNode) return;
    selectElement._customized = true;

    selectElement.style.display = 'none';

    const container = document.createElement('div');
    container.className = 'custom-select-container';
    if (selectElement.classList.contains('sort-select')) {
      container.classList.add('custom-select-sort');
    } else if (selectElement.classList.contains('calc-select')) {
      container.classList.add('custom-select-calc');
    } else {
      container.classList.add('custom-select-rf');
    }

    const triggerBtn = document.createElement('button');
    triggerBtn.type = 'button';
    triggerBtn.className = 'custom-select-trigger';
    triggerBtn.setAttribute('aria-haspopup', 'listbox');
    triggerBtn.setAttribute('aria-expanded', 'false');

    const labelSpan = document.createElement('span');
    labelSpan.className = 'custom-select-label';

    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'custom-select-arrow';
    arrowSpan.innerHTML = '<svg viewBox="0 0 12 8" width="7" height="4.5"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M1 1.5L6 6.5L11 1.5"/></svg>';

    triggerBtn.appendChild(labelSpan);
    triggerBtn.appendChild(arrowSpan);

    const menuDiv = document.createElement('div');
    menuDiv.className = 'custom-select-menu';
    menuDiv.setAttribute('role', 'listbox');

    function syncUI() {
      const options = selectElement.options ? Array.from(selectElement.options) : [];
      const selected = (selectElement.selectedIndex >= 0 && options[selectElement.selectedIndex]) || options[0] || null;
      const selectedIcon = selected ? selected.getAttribute('data-icon') : null;
      if (selectedIcon) {
        labelSpan.innerHTML = '<img src="' + selectedIcon + '" class="custom-select-icon" alt="" /><span>' + (selected ? selected.text : '') + '</span>';
      } else {
        labelSpan.textContent = selected ? selected.text : '';
      }

      menuDiv.innerHTML = '';
      options.forEach(function (opt) {
        const item = document.createElement('div');
        item.className = 'custom-select-item';
        if (opt.value === selectElement.value) {
          item.classList.add('active');
        }
        item.setAttribute('role', 'option');
        item.setAttribute('data-value', opt.value);
        const optIcon = opt.getAttribute('data-icon');
        item.innerHTML =
          '<div class="custom-select-item-content">' +
            (optIcon ? '<img src="' + optIcon + '" class="custom-select-icon" alt="" />' : '') +
            '<span class="custom-select-item-text">' + opt.text + '</span>' +
          '</div>' +
          (opt.value === selectElement.value ? '<span class="custom-select-check">✓</span>' : '');

        item.addEventListener('click', function (e) {
          e.stopPropagation();
          selectElement.value = opt.value;
          container.classList.remove('open');
          triggerBtn.setAttribute('aria-expanded', 'false');
          syncUI();
          selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        });

        menuDiv.appendChild(item);
      });
    }

    syncUI();

    triggerBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = container.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        container.classList.add('open');
        triggerBtn.setAttribute('aria-expanded', 'true');
      }
    });

    selectElement.addEventListener('sync-ui', syncUI);

    container.appendChild(triggerBtn);
    container.appendChild(menuDiv);
    if (selectElement.parentNode) {
      selectElement.parentNode.insertBefore(container, selectElement.nextSibling);
    }
  }

  // 註冊全域點擊與 ESC 關閉監聽（僅註冊一次）
  if (typeof global.document !== 'undefined' && !global.document._customSelectGlobalBound) {
    global.document._customSelectGlobalBound = true;
    global.document.addEventListener('click', function () {
      closeAllDropdowns();
    });
    global.document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAllDropdowns();
      }
    });
  }

  const CustomSelect = {
    setup: setupCustomSelect,
    closeAll: closeAllDropdowns
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomSelect;
  }
  if (typeof global !== 'undefined') {
    global.CustomSelect = CustomSelect;
    global.setupCustomSelect = setupCustomSelect;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
