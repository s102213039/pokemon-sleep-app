# 篩選器側邊欄書籤標籤與移動端懸浮按鈕規範 (Sidebar Handle & Mobile FAB Rules)

## 一、 核心規則與設計意圖 (Core Ironclad Rules)

本專案在三處主要功能均具備抽屜式/滑動式側邊篩選器:
1. 寶可夢圖鑑: `#pokemon-filter-sidebar` 與 `#sidebar-bookmark-handle`
2. 料理食譜大全: `#recipe-filter-sidebar` 與 `#recipe-sidebar-bookmark-handle`
3. 數據百科食材天梯: `#ladder-filter-sidebar` 與 `#ladder-sidebar-bookmark-handle`

### 跨端 DOM 架構差異 (Critical Architectural Asymmetry)
- 桌面網頁版 (Desktop Surface - `index.html`):
  - 書籤標籤 (`.sidebar-bookmark-handle`) 位於 `<aside>` 篩選器元素內部 (Descendant).
  - 當側邊欄收合時 (`aside.collapsed`), 書籤標籤突出於側邊欄邊緣提供點擊.
  - 當側邊欄展開時 (`aside:not(.collapsed)`), 書籤標籤必須徹底隱藏 (`display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important;`), 避免與表格或側邊欄本身重疊.
- 移動端 H5 版 (Mobile H5 Surface - `app/index.html` / `.mobile-h5-app`):
  - 懸浮按鈕 (`.sidebar-fab-btn`) 位於 `<aside>` 篩選器外部 (Sibling), 屬於固定定位在右下角的懸浮按鈕 (FAB: `position: fixed !important; right: 16px; bottom: calc(...)`).
  - 當側邊欄收合時 (`aside.collapsed`), FAB 按鈕必須強制保持可見與可點擊 (`display: flex !important; opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;`).
  - 當側邊欄抽屜展開時 (`aside:not(.collapsed)` 或標記有 `.drawer-open`), FAB 按鈕必須強制隱藏 (`display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important;`), 避免遮擋抽屜內容或引發幽靈點擊.

---

## 二、 歷史回歸根因深度剖析 (Root Cause Analysis of Bug)

在先前的修復中, 為了根絕「桌面版展開時書籤標籤未隱藏」的問題, 誤將最高特異性的強制隱藏規則寫在全域基礎選擇器上:
```css
/* 致命錯誤寫法：直接將全域基礎 class 宣告為強制隱藏 */
.sidebar-bookmark-handle {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
}
```
隨後僅使用後代選擇器嘗試復原收合狀態:
```css
.pokemon-filter-sidebar.collapsed .sidebar-bookmark-handle {
  display: flex !important;
}
```

### 導致移動端 H5 篩選器全面消失的直接根因:
1. DOM 階層不對稱破壞:
   - 在移動端 H5, `#sidebar-bookmark-handle` 是 `<aside>` 的同層兄弟節點 (Sibling), 並非其內部子元素 (Descendant).
   - 因此, `.pokemon-filter-sidebar.collapsed .sidebar-bookmark-handle` 在移動端永遠無法匹配.
2. `!important` 壓制所有行內樣式與覆寫:
   - 全域 `.sidebar-bookmark-handle` 帶有 `visibility: hidden !important; opacity: 0 !important;`, 即使 `.mobile-h5-app .sidebar-fab-btn` 宣告了 `display: flex !important`, 也依然被 `visibility: hidden !important` 徹底隱形.
   - JavaScript 動態賦予的 `bookmarkHandle.style.display = 'flex'` 與 `visibility = 'visible'` 屬於無 `!important` 的行內樣式, 在 CSS `!important` 規則面前完全失效.
   - 結果導致移動端 H5 所有頁面的篩選器懸浮按鈕全面蒸發, 用戶完全無法開啟篩選抽屜.

---

## 三、 雙端防禦架構與永久防呆機制 (Ironclad Solution & Prevention)

### 1. CSS 特異性與作用域精確隔離 (`css/styles.css`)
- 基礎樣式嚴禁在全域 `.sidebar-bookmark-handle` 上施加 `!important` 的隱藏屬性.
- 桌面端嚴格限定於後代選擇器:
  ```css
  /* 桌面端展開：強制隱藏 */
  .pokemon-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle,
  .recipe-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle,
  .ladder-fixed-sidebar:not(.collapsed) .sidebar-bookmark-handle,
  .ladder-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
  }

  /* 桌面端收合：強制展示 */
  .pokemon-filter-sidebar.collapsed .sidebar-bookmark-handle,
  .recipe-filter-sidebar.collapsed .sidebar-bookmark-handle,
  .ladder-fixed-sidebar.collapsed .sidebar-bookmark-handle,
  .ladder-filter-sidebar.collapsed .sidebar-bookmark-handle {
    display: flex !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    visibility: visible !important;
  }
  ```
- 移動端 H5 獨立定義狀態規則 (支援 `:has` 與 `.drawer-open` 雙重保險):
  ```css
  /* 移動端 FAB 基礎展示態 (收合且分頁活躍) */
  .mobile-h5-app .sidebar-bookmark-handle,
  .mobile-h5-app .sidebar-fab-btn {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
  }

  /* 移動端抽屜展開時強制隱藏 */
  .mobile-h5-app .sidebar-fab-btn.drawer-open,
  .mobile-h5-app .sidebar-bookmark-handle.drawer-open,
  .mobile-h5-app #panel-pokemon:has(#pokemon-filter-sidebar:not(.collapsed)) #sidebar-bookmark-handle,
  .mobile-h5-app #panel-recipes:has(#recipe-filter-sidebar:not(.collapsed)) #recipe-sidebar-bookmark-handle,
  .mobile-h5-app #panel-wiki:has(#ladder-filter-sidebar:not(.collapsed)) #ladder-sidebar-bookmark-handle {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }
  ```

### 2. JavaScript 對稱狀態雙向切換 (`app.js`, `recipes.js`, `wiki.js`)
在所有側邊欄切換與分頁切換邏輯中, 同步維護 `.drawer-open` class 與行內樣式:
- 展開抽屜時:
  ```javascript
  bookmarkHandle.classList.add('drawer-open');
  bookmarkHandle.setAttribute('aria-expanded', 'true');
  bookmarkHandle.style.opacity = '0';
  bookmarkHandle.style.pointerEvents = 'none';
  bookmarkHandle.style.display = 'none';
  bookmarkHandle.style.visibility = 'hidden';
  ```
- 收合抽屜時:
  ```javascript
  bookmarkHandle.classList.remove('drawer-open');
  bookmarkHandle.setAttribute('aria-expanded', 'false');
  bookmarkHandle.style.opacity = '1';
  bookmarkHandle.style.pointerEvents = 'auto';
  bookmarkHandle.style.display = 'flex';
  bookmarkHandle.style.visibility = 'visible';
  ```

---

## 四、 自動化測試守門員 (`tests/run_tests.js`)

在 Tier 4 測試中嚴格納入雙端斷言:
1. 斷言桌面端展開時包含 `:not(.collapsed)` 且強制 `display: none !important`.
2. 斷言移動端 H5 `.sidebar-fab-btn` 具備 `display: flex !important`, `opacity: 1 !important`, `visibility: visible !important`.
3. 斷言移動端 H5 `.sidebar-fab-btn.drawer-open` 具備 `display: none !important`.
4. 斷言 `app.js`, `recipes.js`, `wiki.js` 均完整實作 `classList.add('drawer-open')` 與 `classList.remove('drawer-open')`.
