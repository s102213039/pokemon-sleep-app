# 篩選器側邊欄書籤標籤規範與防呆機制 (Sidebar Bookmark Handle Rules)

## 一、 核心規則與設計意圖 (Core Ironclad Rules)

本專案在三處主要功能均具備抽屜式/滑動式側邊篩選器:
1. **寶可夢圖鑑**: `#pokemon-filter-sidebar` 與 `#sidebar-bookmark-handle`
2. **料理食譜大全**: `#recipe-filter-sidebar` 與 `#recipe-sidebar-bookmark-handle`
3. **數據百科食材天梯**: `#ladder-filter-sidebar` 與 `#ladder-sidebar-bookmark-handle`

### 狀態顯示規範
- **側邊欄展開狀態 (Expanded / 未帶 `.collapsed` class)**:
  - 書籤標籤 (`.sidebar-bookmark-handle`) **必須 100% 徹底隱藏** (`display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important;`).
  - **嚴禁**在展開狀態下將標籤懸浮於側邊欄邊緣、主要內容或表格上方. 展開時側邊欄頂部已有專屬關閉按鈕 (`◀`), 絕不可出現重疊冗餘的把手.
- **側邊欄收合狀態 (Collapsed / 帶有 `.collapsed` class)**:
  - 書籤標籤才允許出現在螢幕邊緣 (`display: flex !important; opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;`), 提供使用者點擊展開.
- **非當前主要分頁**:
  - 當切換至其他主要分頁時 (例如切到隊伍盒子或最新消息), 所有非當前分頁的側邊欄與書籤標籤均必須保持隱藏 (`display: none`).

---

## 二、 歷史回歸根因深度檢討 (Root Cause Analysis)

在過往改動中曾發生「側邊欄展開時, 書籤標籤依然突兀黏在邊緣」的嚴重回歸, 其根因如下:
1. **JavaScript 行內樣式汙染與非對稱邏輯**:
   - 在 `toggleRecipeSidebar` 與 `toggleSidebar` 關閉側邊欄時, 程式碼動態注入了行內樣式 `bookmarkHandle.style.display = 'flex'`.
   - 但在打開 (展開) 側邊欄的分支中, 原程式碼誤以為只有行動端需要隱藏標籤 (`if (bookmarkHandle && isMobileH5)`), 導致桌面端完全沒有將 `bookmarkHandle` 設為 `display = 'none'`, 也沒有清除行內樣式.
   - 因 HTML DOM 行內樣式優先權高於外部樣式表的一般 class, 導致 `style="display: flex;"` 永遠留在元素上.
2. **CSS 防禦缺乏最高特異性強制鎖定**:
   - 原 CSS 僅定義了 `.sidebar-bookmark-handle { display: none; }` 與 `.collapsed .sidebar-bookmark-handle { display: flex; }`.
   - 缺乏 `:not(.collapsed)` 否定偽類與 `!important` 宣告, 無法在行內樣式遭誤植時發揮最後一道防線的強制隱藏效果.

---

## 三、 雙重架構防禦規範 (Dual-Layer Safeguard Implementation)

### 1. CSS 最高特異性強制防禦 (`css/styles.css`)
```css
/* 預設狀態與展開狀態：絕對強制隱藏，覆蓋任何行內樣式干擾 */
.sidebar-bookmark-handle,
.pokemon-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle,
.recipe-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle,
.ladder-fixed-sidebar:not(.collapsed) .sidebar-bookmark-handle,
.ladder-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
}

/* 僅當帶有 .collapsed class 時展示 */
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

### 2. JavaScript 對稱狀態清理規範 (`app.js`, `recipes.js`, `wiki.js`)
- **展開時 (Expanding)**:
  ```javascript
  if (bookmarkHandle) {
    bookmarkHandle.setAttribute('aria-expanded', 'true');
    bookmarkHandle.style.display = 'none';
    bookmarkHandle.style.opacity = '0';
    bookmarkHandle.style.pointerEvents = 'none';
    bookmarkHandle.style.visibility = 'hidden';
  }
  ```
- **收合時 (Collapsing)**:
  ```javascript
  if (bookmarkHandle) {
    bookmarkHandle.setAttribute('aria-expanded', 'false');
    bookmarkHandle.style.display = 'flex';
    bookmarkHandle.style.opacity = '1';
    bookmarkHandle.style.pointerEvents = 'auto';
    bookmarkHandle.style.visibility = 'visible';
  }
  ```
- **初始化與分頁切換時**:
  必須依照側邊欄是否處於 `collapsed` 狀態同步更新標籤之 `display`, 絕不殘留錯誤狀態.

---

## 四、 自動化測試保護 (`tests/run_tests.js`)

在測試套件 Tier 4 中已加入專屬斷言:
- 檢驗 `styles.css` 包含 `:not(.collapsed)` 與 `display: none !important;`.
- 檢驗 `recipes.js`, `app.js`, `wiki.js` 在展開側邊欄時均明確將 `bookmarkHandle.style.display` 設為 `'none'` 與 `visibility` 設為 `'hidden'`.
- 任何違反本規則之改動均會導致測試失敗, 禁止提交與合併.
