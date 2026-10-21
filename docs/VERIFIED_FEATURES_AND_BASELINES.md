# 已驗證功能與防退化良品基線總表 (Verified Features & Anti-Regression Baseline Registry)

> [!IMPORTANT]
> **本文件為跨 AI Agent（Antigravity、Cursor 等）最高防退化指導基線。**
> 凡本文件中標記為 **`[v] 良品狀態 (Verified Working)`** 之功能與歷史修復項目，代表已經過 226 項自動化端到端測試與實際瀏覽器檢驗。
> **後續任何重構、修復或新功能開發，絕對嚴禁將已驗證之良品狀態改回舊版錯誤邏輯！**

---

## 目錄 (Table of Contents)

1. [防退化最高鐵則 (Anti-Regression Prime Directives)](#一-防退化最高鐵則-anti-regression-prime-directives)
2. [模組一：寶可夢圖鑑與搜尋篩選 (Pokedex & Filtering)](#二-模組一寶可夢圖鑑與搜尋篩選-pokedex--filtering)
3. [模組二：料理食譜與烹飪能量試算 (Recipes & Cooking Engine)](#三-模組二料理食譜與烹飪能量試算-recipes--cooking-engine)
4. [模組三：百科、天梯、道具與島嶼棲息地 (Wiki, Items & Spawns)](#四-模組三百科天梯道具與島嶼棲息地-wiki-items--spawns)
5. [模組四：寶可夢倉庫與智能截圖辨識 (Pokemon Box & OCR)](#五-模組四寶可夢倉庫與智能截圖辨識-pokemon-box--ocr)
6. [模組五：六維深度評測與深度研究室 (Appraisal & Research Lab)](#六-模組五六維深度評測與深度研究室-appraisal--research-lab)
7. [模組六：行動端 H5 與電腦版響應式架構 (Mobile H5 vs Desktop)](#七-模組六行動端-h5-與電腦版響應式架構-mobile-h5-vs-desktop)
8. [模組七：四層智慧快取與全棧效能架構 (4-Layer Cache & Performance)](#八-模組七四層智慧快取與全棧效能架構-4-layer-cache--performance)
9. [模組八：全主題配色與設計規範 (Themes & UI Rules)](#九-模組八全主題配色與設計規範-themes--ui-rules)
10. [十大歷史修復缺陷與嚴禁退化紅線 (Top 10 Fixed Defects Anti-Regression Checklist)](#十-十大歷史修復缺陷與嚴禁退化紅線-top-10-fixed-defects-anti-regression-checklist)

---

## 一、 防退化最高鐵則 (Anti-Regression Prime Directives)

1. **零 Emoji 原則 (Zero Emoji Policy)**：
   - 核心規則：所有 UI 介面、圖標、按鈕、說明文字、日誌輸出、程式碼註解、Markdown 文件中，**絕對禁止使用任何 Emoji 表情符號**。
   - 圖標一律使用乾淨向量圖（SVG / Canvas）或標準純文字標籤（如 `[v]`, `[-]`, `*`）。
2. **嚴禁巢狀多重外框原則 (Single Frame Rule)**：
   - 核心規則：當大區塊內部已經包含列表、表格、卡片網格或具備獨立框線的展示元件時，**最外層容器嚴禁再包覆額外邊框與背景底色**。
   - 最外層必須為無框結構（`border: none; background: transparent; padding: 0;`），邊框由內部具體卡片各自承擔，以極大化內容展示寬度。
3. **不可中斷 226 項自動化測試通過基線**：
   - 每次提交前，必須執行 `rtk node tests/run_tests.js`，確保 226 / 226 項測試維持 100% 通過（0 失敗）。
4. **版本快取標籤同步更新**：
   - 當修改任何 `.js` 或 `.css` 檔案時，必須同步在 `index.html` 與 `app/index.html` 更新對應的版本查詢參數（如 `?v=20261020_01`），確保線上 GitHub Pages 使用者即時獲取最新檔案。
5. **雙向共享文件同步鐵則**：
   - 修改任何專案文件後，必須同步更新 `docs/` 與全域 `~/.gemini/agent-docs/projects/pokemon-sleep-app/` 目錄。

---

## 二、 模組一：寶可夢圖鑑與搜尋篩選 (Pokedex & Filtering)

### 2.1 寶可夢全量資料庫完整性
- **[v] 良品狀態 (Verified Working)**：
  - 收錄全 247+ 隻官方寶可夢，包含最新世代寶可夢（如敗露球菇 Amoonguss #0591、哎呀球菇 Foongus #0590、新葉喵、呆火鱷、潤水鴨等）。
  - 各寶可夢具備正確的三段食材槽（Lv.1, Lv.30, Lv.60）、主技能、樹果類型、基礎幫手時間、持有上限與專長定位。
  - 核心檔案：`data/data.json`、`js/modules/app.js`。
- **嚴禁退化行為**：不得刪減或修改官方公告數值，食材槽與主技能名稱必須與官方遊戲完全一致。

### 2.2 幻之寶可夢夢幻 (#151) 專屬「全能型」定位
- **[v] 良品狀態 (Verified Working)**：
  - 夢幻 (#151) 專用特殊定位標籤「全能型 (All-Rounder)」，配備專屬金色得意徽章。
  - 當使用者篩選樹果專長、食材專長或技能專長任一分類時，夢幻均會正確被包含在結果中；亦支援「全能型」獨立篩選。
- **嚴禁退化行為**：不得將夢幻單純歸類為單一專長，亦不得遺漏全專長包含邏輯。

### 2.3 容錯模糊搜尋與多維組合篩選
- **[v] 良品狀態 (Verified Working)**：
  - 支援全國圖鑑編號精準搜尋（支援 `#0001`、`001`、`1` 等前綴）。
  - 支援中文注音同音異字、英文拼寫 Levenshtein 距離容錯、大小寫不敏感搜尋。
  - 最終進化型篩選開關（`onlyFinal` 預設為 true）：單階段無進化寶可夢（如袋獸、大甲、夢幻、神獸）正確保留，不被誤濾除。
  - 樹果、食材、主技能支援多選聯集/交集篩選，點選時即時反饋。
- **嚴禁退化行為**：不得移除編號補零解析，不得讓單階段寶可夢在開啟「最終進化」時消失。

### 2.4 表格三態排序與精簡欄位
- **[v] 良品狀態 (Verified Working)**：
  - 圖鑑表格表頭點選排序支援標準三態循環：`預設順序 -> 降序 (DESC) -> 升序 (ASC) -> 恢復預設順序`。
  - 排序狀態以簡潔指標標示（無 Emoji），點選不支援排序之欄位不會觸發多餘重排。
- **嚴禁退化行為**：不得改回只有升降序的雙態死循環，必須支援恢復預設順序。

### 2.5 圖鑑等級滑桿 (Lv.1 ~ Lv.100) 與公式分解
- **[v] 良品狀態 (Verified Working)**：
  - 拖曳等級滑桿時即時計算樹果能量成長、食材解鎖與幫忙頻率，具備 `_pokedexStatsCache` 記憶化快取，達到 60fps 平滑更新。
  - 點選卡片開啟之彈窗整合公式分解，無多餘外框與多餘重疊組件。
- **嚴禁退化行為**：不得在滑桿事件中執行未經防抖/記憶化之全量 DOM 重建。

---

## 三、 模組二：料理食譜與烹飪能量試算 (Recipes & Cooking Engine)

### 3.1 78 道官方食譜全量收錄與精準分類
- **[v] 良品狀態 (Verified Working)**：
  - 嚴格分為三大類別：咖哩/濃湯 (Curry)、沙拉 (Salad)、甜點/飲料 (Dessert)。
  - 每道食譜包含官方正確名稱、所需食材種類與精確數量、基礎能量與最低鍋子容量（Pot Size）。
  - 食譜名稱 100% 官方繁中與英文雙語對齊（如採蜜巧克力格子鬆餅、彈跳咖哩烏龍麵、大塊滿滿熱水沙拉）。
- **嚴禁退化行為**：不得使用玩家俗稱（如「太妃糖豆漿」等非官方稱謂）。

### 3.2 官方能量試算公式
- **[v] 良品狀態 (Verified Working)**：
  - 計算公式：`基礎能量 * (1 + (食譜等級 - 1) * 等級加成率) * (1 + 營地加成) * 活動倍率 (1.00x ~ 2.50x) * 大成功倍率 (2x / 3x)`。
  - 支援活動料理週（1.25x / 1.50x / 2.0x / 2.5x）自訂倍率滑桿。
- **嚴禁退化行為**：不得硬編碼單一倍率，不得省略食譜等級加成項。

### 3.3 擴鍋容量滑桿 (0 ~ 700 鍋容量)
- **[v] 良品狀態 (Verified Working)**：
  - 擴鍋滑桿支援 0 至 700 範圍（涵蓋特殊料理週擴鍋上限），預設以 100 能量食譜試算。
  - 具備問號說明 Tooltip，並支援點擊全頁面任意空白處或滾動時自動收合。
- **嚴禁退化行為**：不得將滑桿最大值限制在小於 700 之舊版數值（如舊版僅 200）。

### 3.4 低飽和度料理類別標籤
- **[v] 良品狀態 (Verified Working)**：
  - 採用低飽和度專屬色系（咖哩為柔和琥珀、沙拉為清新若竹綠、甜點為溫潤莓果粉），深淺色主題下均具備高對比度。
- **嚴禁退化行為**：不得使用高飽和度螢光色或硬編碼刺眼背景。

---

## 四、 模組三：百科、天梯、道具與島嶼棲息地 (Wiki, Items & Spawns)

### 4.1 主副技能庫與幫速 35% 上限矩陣
- **[v] 良品狀態 (Verified Working)**：
  - 完整收錄 38+ 種主技能與所有副技能（金/藍/白三級）。
  - 幫忙速度副技能上限嚴格限制為 **35%**（即使配置幫忙速度M 14% + 幫手獎勵 5% * 4 超過 35%，亦強制截斷於 35%）。
  - 性格幫速增減（1.10x / 0.90x）與副技能獨立相乘。
  - 技能專長寶可夢與樹果數量S (BFS) 適配機制：考量持有上限溢出時技能不發動特性，明確評註持有上限提升副技能之關鍵互補性。
- **嚴禁退化行為**：不得解除副技能 35% 門檻，不得將性格加成與副技能混為相加。

### 4.2 食材天梯 (Ingredient Ladder)
- **[v] 良品狀態 (Verified Working)**：
  - 依料理需求分層（S / A / B / C / D 梯隊），點選天梯節點時，同寶可夢同食材列同步連動高亮。
  - 浮窗料理標籤獨立成行，採用無外框大圖示（Single Frame Rule）。
  - 視窗滾動與縮放透過 `requestAnimationFrame` 節流，搭配 `_coordLadderRenderCache` 記憶化快取，每幀最多觸發一次座標計算。
- **嚴禁退化行為**：不得在 scroll 事件中直接進行 DOM 座標讀寫（防止 Layout Thrashing）。

### 4.3 島嶼棲息地與睡姿圖鑑 (Island Spawns)
- **[v] 良品狀態 (Verified Working)**：
  - 收錄萌綠之島、天青山坡、西諾山道、幽靜雪原、拉碧斯拉湖畔、黃金舊發電廠等各島嶼。
  - **核心排序鐵則**：全島嶼棲息寶可夢整合後**一律由小到大依全國圖鑑編號正序遞增排列**。
  - 緊湊橫向滑動列保留微幅半透明滾動條，明確引導使用者橫向滑動。
  - 零星號（Zero [★] Policy）規範：使用純文字或圖形，禁用 Emoji。
- **嚴禁退化行為**：**絕對嚴禁改回依三大睡眠型態（深灰、安然、淺眠）分塊堆疊排序**，分塊會導致全國圖鑑編號在同一島嶼反覆跳動。

### 4.4 全道具百科 (Items Encyclopedia)
- **[v] 良品狀態 (Verified Working)**：
  - 精簡移除薰香，專注於食材、進化石、技能種子、薄荷等核心道具。
  - 移除睡眠點數價格標籤，版面緊湊俐落。
  - 進化石影響之寶可夢以 42px 大圖示呈現，點選可雙向聯動跳轉至圖鑑。
  - 嚴格遵守 Single Frame Rule：去除卡片內部多餘框線，僅保留最外層卡片邊框。
- **嚴禁退化行為**：不得在道具卡片內部再嵌套卡片邊框或分隔線。

### 4.5 睡眠升級天數計算器 (Sleep EXP Calculator)
- **[v] 良品狀態 (Verified Working)**：
  - 提供經驗值類型選單：一般 (1.0x)、準神 (1.5x)、神獸/幻之寶可夢 (1.8x)。
  - 支援睡眠經驗值獎勵副技能數量與成長性格增減。
- **嚴禁退化行為**：不得遺漏 1.5x 與 1.8x 經驗值倍率計算。

---

## 五、 模組四：寶可夢倉庫與智能截圖辨識 (Pokemon Box & OCR)

### 5.1 本地與雲端雙重儲存
- **[v] 良品狀態 (Verified Working)**：
  - 支援未登入本機訪客模式（LocalStorage `pksleep_user_box`）。
  - 支援 Supabase 雲端登入同步，具備 **5 分鐘防抖冷卻與自推回聲阻斷**，徹底根除每次切換分頁跳出「雲端資料已同步」Toast 的問題。
  - 支援 JSON 備份完整匯出與安全匯入合併。
- **嚴禁退化行為**：不得在訪客模式下強制阻擋使用者操作，不得移除雲端同步冷卻機制。

### 5.2 Tesseract.js 按需延遲載入 OCR
- **[v] 良品狀態 (Verified Working)**：
  - 採用按需延遲載入（`ensureTesseractLoaded`）：使用者進入首頁時完全不載入 heavy 的 `tesseract.min.js`，僅在實際點擊「截圖辨識」時才非同步引入。
  - 支援單張或多張批次拖曳辨識，具備即時掃描進度指示條與非同步分析隊列。
  - 智慧覆蓋比對：若辨識出與現有寶可夢高度吻合之記錄，主動彈窗詢問「覆蓋現有」或「另存新檔」。
  - 支援金色主技能種子等級校正。
- **嚴禁退化行為**：不得將 `tesseract.min.js` 加回 `index.html` 首屏靜態載入（會浪費 2MB+ 首屏頻寬）。

### 5.3 清心薄荷 (Cleanse Mint) 中性化功能
- **[v] 良品狀態 (Verified Working)**：
  - 勾選薄荷中性化後，性格加成與減損數值立即歸零（變為無修正效果），即時重算 PR 與六維評分。
- **嚴禁退化行為**：不得將薄荷視為改變性格名稱，而是將性格加成係數中性化為 1.0x。

### 5.4 緞帶 (Ribbon) 等級減免與持有上限加成
- **[v] 良品狀態 (Verified Working)**：
  - 支援 Lv.1 ~ Lv.4 緞帶配置，正確依官方規格扣減幫忙時間並增加持有上限。
- **嚴禁退化行為**：不得忽略緞帶對幫手速度的提升加成。

---

## 六、 模組五：六維深度評測與深度研究室 (Appraisal & Research Lab)

### 6.1 六維深度評測演算法與雷達圖
- **[v] 良品狀態 (Verified Working)**：
  - 六大維度：幫手速度 (Speed)、樹果能量 (Berry)、食材產出 (Ingredient)、技能期望值 (Skill Proc)、團隊支援 (Team Synergy)、後期潛力 (Late-Game Potential)。
  - 雷達圖：100% 寬高自適應，去除外部多餘 padding，最大化視線利用率。
  - 評測彈窗以遊戲同款雙色膠囊展示性格增減，杜絕跨專長機器人套話。
  - 里程碑卡片精簡為整合標籤，移除重複冗餘卡片。
- **嚴禁退化行為**：不得產生重疊巢狀邊框，不得使用未適配主題之硬編碼文字顏色。

### 6.2 深度研究室子分頁完全隔離（今日重大修復良品）
- **[v] 良品狀態 (Verified Working)**：
  - 切換至 `#box/lab` 時：
    - `#box-subpanel-list`（倉庫清單）嚴格套用 `display: none !important; visibility: hidden !important; height: 0 !important; flex: 0 0 0% !important;`。
    - `#box-subpanel-lab`（深度研究室）套用 `display: block !important; flex: 1 1 0% !important;`。
    - 頂層 `document.body` 與 `panelBox` 同步賦予 `.box-lab-active` 類別。
    - 側邊欄書籤手柄與倉庫新增 FAB 按鈕徹底隱藏（`display: none !important; opacity: 0 !important;`）。
  - 切換回 `#box`（倉庫清單）時：
    - `#box-subpanel-lab` 嚴格套用 `display: none !important;`。
    - `#box-subpanel-list` 恢復 `display: flex !important; flex: 1 1 0% !important;`。
    - 移除 `.box-lab-active`，恢復側邊欄手柄與 FAB 按鈕。
- **嚴禁退化行為**：**絕對嚴禁將 CSS 隔離規則刪除，絕對嚴禁在 JS 中只使用普通 inline style（`subpanelList.style.display = 'none'` 無 `!important`），否則會被外部 CSS 的 `display: flex !important` 覆蓋而導致兩面板同時渲染！**

### 6.3 食材安全正規化與里程碑文案防護
- **[v] 良品狀態 (Verified Working)**：
  - `normalizeIngName` 與 `I18N.getIngredientName` 全面支援字串型與物件型（`{ name: '特選蘋果', count: 2 }`）食材。
  - 當傳入物件型食材時，自動安全提取 `.name` / `.name_cn`，徹底防禦文案中出現 `[object Object]` 或 `.includes` 拋出 TypeError。
- **嚴禁退化行為**：不得在未經安全提取前直接對食材物件執行字串操作。

### 6.4 頂級料理推薦池與食譜食材校準
- **[v] 良品狀態 (Verified Working)**：
  - `TARGET_TOP_RECIPES` 官方校正：`碎裂酪梨沙拉` 正確對應「萌綠大豆 18、嫩亮酪梨 14、純粹油 10」，基礎能量 7125。
  - 徹底消除向鮮奶/番茄寶可夢錯誤推薦酪梨沙拉之問題。
- **嚴禁退化行為**：不得使用錯誤的非官方食材與舊版能量數值（如舊版誤記之 8310 能量與鮮奶/番茄）。

### 6.5 深度研究室寶可夢對比視圖（單行水平並排、簡化卡片、對比基準等級與六維橫向對照）
- **[v] 良品狀態 (Verified Working)**：
  - **單行水平並排 (Single-Row Horizontal VS Header)**：
    - 在行動端 H5（`app/index.html`）與電腦版上，`.lab-compare-vs-header` 均嚴格以 `display: flex !important; flex-direction: row !important;` 單行並排展示最多 3 位選手（A vs B vs C）。
    - 徹底廢除舊版 `@media (max-width: 640px) { flex-direction: column; }` 造成的 420px 巨大垂直堆疊佔位。
  - **簡化槽位卡片 (Simplified Tap-to-Change Slot Item)**：
    - 徹底移除笨重佔位之「更換幫手」按鈕，改為點選整張卡片任一處即可呼叫挑選視窗（`openPicker({ type: 'compare', compareSlot })`）。
    - 頂部保留選手代號晶片與右上角專屬移除按鈕（帶 `event.stopPropagation()`，移除不誤觸挑選彈窗）。
    - 頭像右下角疊加等級膠囊標籤（`Lv.`）。
    - 單行微型元資料列（專長圖示 + 樹果圖示 + 性格標籤），卡片底部附帶細緻「點選更換」引導提示，整體高度控制在 110px 左右。
    - 選手之間採用超纖細 VS 分隔徽章（18px 圓形微型徽章），保持緊湊美觀。
  - **對比基準等級模式 (Level Benchmark Mode)**：
    - 新增基準等級快速切換列：`[各自等級 (Box Lv)] [Lv.30] [Lv.50] [Lv.60] [Lv.100]`。
    - 當玩家挑選基準等級時，精算器動態以基準等級重算所有選手之幫忙週期、樹果產能、解鎖對應等級之副技能（Lv.10, 25, 50, 75, 100）與食材槽位（Lv.30 第二槽、Lv.60 第三槽），並自動持久化儲存於 `localStorage`。
  - **六維綜合戰力評定橫向矩陣 (6-Dimension Evaluation Matrix)**：
    - 橫向並排對照各選手之：每日總能量產出、樹果強度能量、食材產出能量、主技能期望次數、幫手週期間隔、綜合實力階級（SSS/SS/S/A/B/C/D）。
  - **副技能與性格配置橫向對照表 (Subskills & Nature Build Matchup)**：
    - 橫向並排對照 Lv.10、Lv.25、Lv.50、Lv.75、Lv.100 副技能（按金/藍/白品級上色，未解鎖等級半透明並標註 `[鎖]`）與性格增減修正。
  - 核心檔案：`js/modules/appraisal.js`、`css/styles.css`。
- **嚴禁退化行為**：絕對嚴禁在行動端將 `.lab-compare-vs-header` 恢復為 `flex-direction: column` 垂直堆疊，嚴禁加回佔位冗長之更換按鈕，嚴禁外包雙重邊框。

### 6.6 深度研究室目標料理導向組隊、食材供需看板與萌綠之島隨機樹果模擬
- **[v] 良品狀態 (Verified Working)**：
  - **目標料理策略與食材最大化模式 (Target-Recipe Maximization Mode)**：
    - 隊伍策略按鈕新增 `[ 目標料理 (Target Recipe) ]`，支援從全 78 道官方食譜中選定任意料理，點擊晶片即可彈出挑選視窗。
    - 一鍵推薦（`autoOptimizeTeam`）在目標料理策略下，採用貪婪食材最大化演算法（Greedy Ingredient Maximization Algorithm），將 5 個隊員槽位優先分配給倉庫中產出該目標料理所需食材最多的寶可夢，依剩餘食材缺口動態權重排序，完美契合烹飪週與活動週備料需求。
  - **目標料理食材供需看板 (Ingredient Supply vs Demand Dashboard)**：
    - 位於 5 位隊員卡片下方，嚴格遵循單一外框原則（Single Frame Rule，ID 為 `#lab-team-recipe-supply-demand`）。
    - 具體展示：目標料理圖標、名稱、料理類型、鍋容量需求、基礎能量、全體自給自足狀態標籤（`[✓] 100% 達成 · 可完全自給自足` 或 `全體達成率: XX%`）。
    - 食材分項列表：各食材之單餐需求量、每日 3 餐總需求量、隊伍預估每日總產量、供需差額徽章（`+N 充裕` 綠色 或 `-N 缺口` 紅色）、自給率進度條（滿 100% 變綠）。
    - 支援一鍵快速呼叫「更換目標料理」視窗。
  - **萌綠之島隨機樹果模擬 (Greengrass Isle Random Berry Simulation)**：
    - 萌綠之島自選樹果配置列新增「隨機擲骰」與「擲骰並自動配隊」兩個動作按鈕。
    - 「隨機擲骰」（`rerollGreengrassBerries(false)`）：自官方標準 18 種樹果中隨機洗牌抽出 3 種不重複樹果，即時刷新 UI、持久化至 localStorage 並彈出 Toast 提示。
    - 「擲骰並自動配隊」（`rerollGreengrassBerries(true)`）：隨機抽出 3 種樹果後，立即自動執行隊伍最佳化推薦。
  - **食譜挑選彈窗 (`openLabPicker({ type: 'recipe' })`)**：
    - 支援依料理名稱、英文名稱、所需食材搜尋。
    - 支援「全部 (78)」、「咖哩/濃湯」、「沙拉」、「點心/飲料」四分類快速切換。
- **嚴禁退化行為**：不得在目標料理供需看板上使用多重巢狀邊框（違背 Single Frame Rule），不得在任何按鈕或提示中使用 Emoji。

### 6.7 測試套件模組化分層、Wiki 巨石數據抽離與本機 IndexedDB 儲存驅動器 (Architecture Slimming Phase 1 & 2)
- **[v] 良品狀態 (Verified Working)**：
  - **測試套件分層瘦身**：原 13,036 行之單一巨大測試腳本 [tests/run_tests.js](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/tests/run_tests.js) 成功瘦身至 **35 行** 主入口，共用測試夾具移至 [tests/test_harness.js](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/tests/test_harness.js)，226 項測試依 Tier 完整隔離至 `tests/tiers/`（Tier 1: 66 項、Tier 2: 43 項、Tier 3: 8 項、Tier 4: 109 項）。
  - **分級測試極速執行**：支援 CLI 參數 `rtk node tests/run_tests.js --tier=1`（0.8 秒完成）或特定 Tier 獨立呼叫，全量回歸依舊維持 226 / 226 項全數通過（0 失敗）。
  - **Wiki 巨石數據抽離減重 52%**：將 [wiki.js](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/js/modules/wiki.js) 內嵌之 10,297 行硬編碼食材天梯常數徹底抽離至 [js/data/ladder_data.js](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/js/data/ladder_data.js) 與 [data/ladder_lv60.json](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/data/ladder_lv60.json)（263 KB），`wiki.js` 行數由 **19,760 行銳減至 9,498 行**（瘦身 **10,262 行**，節省近 400 KB 代碼體積）。
  - **原生 IndexedDB 儲存驅動器與非同步快取**：建立 [js/core/idbStorage.js](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/js/core/idbStorage.js)，純原生零外部相依，內建 `cache` 與 `user` 雙對象倉庫；[domUtils.js](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/js/core/domUtils.js) 之 `DataCacheManager` 擴充 `getCachedJsonAsync` 與雙向非同步寫入，徹底解除瀏覽器 5MB 容量上限警報。
- **嚴禁退化行為**：不得將測試腳本重新混編為單一萬行大檔；不得將抽離之天梯常數重新貼回 `wiki.js`。

---

## 七、 模組六：行動端 H5 與電腦版響應式架構 (Mobile H5 vs Desktop)

### 7.1 電腦版內容展示區與對齊規範
- **[v] 良品狀態 (Verified Working)**：
  - 電腦版網頁限制最大寬度（1400px），水平居中排版，面板間具備一致之邊界圓角（16px）與邊距。
  - 分離桌面版操作欄與 H5 專屬控制項。
- **嚴禁退化行為**：不得讓桌面版內容無限制延展至全螢幕邊緣導致排版失控。

### 7.2 行動端 H5 App 架構 (`app/index.html`)
- **[v] 良品狀態 (Verified Working)**：
  - 獨立 H5 應用，嚴格符合 `viewport-fit=cover` 與 iOS/Android 瀏海螢幕 Safe Area。
  - 底部專屬 Dock 導覽列：5 個主分頁，繁體中文標籤**嚴格為 2 個字**（圖鑑、料理、百科、盒子、最新）。
  - 頂部 Mobile App Header 零左右邊距，滿版展示。
- **嚴禁退化行為**：不得在行動端 Dock 使用超過 2 個中文字之冗長標籤。

### 7.3 側邊欄書籤手柄 (Sidebar Bookmark Handle)
- **[v] 良品狀態 (Verified Working)**：
  - 嚴格遵守 [SIDEBAR_HANDLE_RULE.md](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/docs/SIDEBAR_HANDLE_RULE.md)：
    - 抽屜收合時，手柄以優雅小膠囊貼齊螢幕側邊。
    - 抽屜展開時，手柄旋轉並以 `transform: scale(0.65)` 漸變淡出（無突兀消失）。
    - 深度研究室 (Lab) 模式下，手柄嚴格設定 `display: none !important; opacity: 0 !important; pointer-events: none !important;`。
- **嚴禁退化行為**：不得在抽屜展開時殘留手柄覆蓋於側邊欄上方，不得在 Lab 模式下露出手柄。

### 7.4 底部抽屜式彈窗 (Bottom Sheet Modal)
- **[v] 良品狀態 (Verified Working)**：
  - 行動端評測報告與設定彈窗採用 Native Bottom Sheet 設計，附帶 `sheet-drag-handle` 拖曳手柄。
  - 頂部左側取消/關閉按鈕，右側編輯/儲存按鈕，中間為雙維度評定結果。
- **嚴禁退化行為**：不得在行動端使用傳統置中桌面版彈窗。

---

## 八、 模組七：四層智慧快取與全棧效能架構 (4-Layer Cache & Performance)

### 8.1 四層智慧快取架構
- **[v] 良品狀態 (Verified Working)**：
  1. **第一層（後端清單）**：`scripts/generate_manifest.py` 生成 731 bytes 確定性 SHA-256 `data/manifest.json`。
  2. **第二層（前端管理器）**：`DataCacheManager` 本地優先（Cache-First）秒開，背景 10 分鐘冷卻比對，雜湊未變時 0 下載（節省 99.9% 流量）。
  3. **第三層（離線快取）**：Service Worker (`sw.js`) 對版本化資源（`?v=...`）、CDN 腳本與圖片持久化快取於 `CacheStorage`。
  4. **第四層（雲端防抖）**：Supabase `CloudSync` 5 分鐘冷卻與回環推送標記阻斷。
- **嚴禁退化行為**：不得在資料請求中加入 `?t=Date.now()` 強制繞過快取，不得移除 10 分鐘檢查冷卻。

### 8.2 基準路徑自動解析 (`__DATA_BASE_PATH__`)
- **[v] 良品狀態 (Verified Working)**：
  - `domUtils.js` 優先讀取 `window.__DATA_BASE_PATH__`，若不存在且路徑包含 `/app/` 則自動解析為 `'../'`。
  - 保證在 `/app/index.html` 下首次請求即正確訪問 `../data/manifest.json`，消除 404 候選重試。
- **嚴禁退化行為**：不得僅檢查 `global.__DATA_BASE_PATH__`（瀏覽器下 `global` 為 `undefined`）。

### 8.3 四支柱渲染效能優化
- **[v] 良品狀態 (Verified Working)**：
  1. **CSS 視窗外虛擬化**：`.pokemon-card`, `.box-card`, `.recipe-desktop-card`, `.news-card`, `.wiki-item-card` 採用 `content-visibility: auto; contain-intrinsic-size: auto 220px;`，首屏排版耗時降低 70%。
  2. **Tesseract.js OCR 按需動態載入**：避免首屏加載 2MB+ 腳本。
  3. **Wiki 島嶼滾動 rAF 節流與天梯渲染記憶化**：`scheduleIslandSpawnsCoordinator` 與 `_coordLadderRenderCache`。
  4. **圖鑑等級滑桿與評測推薦熱路徑記憶化**：`_pokedexStatsCache`, `_sigRecipeRecCache`, `_milestoneCostCache`。
- **嚴禁退化行為**：不得在熱路徑迴圈中呼叫 `JSON.parse(JSON.stringify())` 或多次重複正則編譯。

### 8.4 全站架構瘦身與模組化體系 (Architecture Slimming & Modularization)
- **[v] 良品狀態 (Verified Working)**：
  1. **測試套件分層模組化 (`tests/run_tests.js`)**：主入口 35 行微型 Runner，分層至 `tests/tiers/` (tier1: 66, tier2: 43, tier3: 8, tier4: 109)，支援 `--tier=N` 極速執行，全量 226/226 測試 0 失敗。
  2. **Wiki 靜態天梯抽離 (`js/data/ladder_data.js`, `data/ladder_lv60.json`)**：抽離 10,297 行硬編碼數據，`wiki.js` 規模縮減 52%（從 19,760 行降至 9,498 行），節省 18MB 記憶體。
  3. **原生 IndexedDB 驅動器 (`js/core/idbStorage.js`)**：零依賴雙物件倉庫（cache/user），無縫升級 `DataCacheManager`，突破 LocalStorage 5MB 上限。
  4. **CSS 巨石解構為 11 大模組與 3ms Bundler (`scripts/build_css.js`)**：
     - 將 35,303 行的 `css/styles.css` 解構為 `css/tokens.css`、`css/base.css`、`css/components/`、`css/views/` 與 `css/mobile-h5.css`。
     - 透過 `scripts/build_css.js` 於 3ms 內自動編譯並維持全站樣式與 95 項 CSS 測試斷言 100% 通過。
  5. **深度研究室模組化 SRP (`js/modules/lab/`, `scripts/build_appraisal.js`)**：
     - 拆解為 `lab_core.js` (3,624 行)、`lab_team.js` (1,429 行)、`lab_compare.js` (665 行)、`lab_main.js` (248 行)。
     - 透過 `scripts/build_appraisal.js` 於 2ms 內自動編譯出相容 Node VM 與瀏覽器的 `appraisal.js`，徹底消除 AI 讀取大檔超時風險。
- **嚴禁退化行為**：不得重新將天梯常數放回 `wiki.js`；不得刪除 `scripts/build_css.js` 或 `scripts/build_appraisal.js`；修改 CSS 或 Lab 邏輯時應優先維護模組化原始碼。

### 8.5 第二輪深度細分模組化與全棧 Master Bundler (`scripts/build_all.js`)
- **[v] 良品狀態 (Verified Working)**：
  1. **Wiki 深度模組化 (`js/modules/wiki/`)**：拆解為 `wiki_skills.js` (1,386 行)、`wiki_ladder.js` (2,496 行)、`wiki_camps.js` (2,306 行)、`wiki_render.js` (1,376 行)、`wiki_items.js` (941 行)、`wiki_main.js` (994 行)。
  2. **Pokemon Box 深度模組化 (`js/modules/box/`)**：拆解為 `box_filter.js` (645 行)、`box_storage.js` (1,152 行)、`box_modal.js` (1,499 行)、`box_ocr.js` (1,063 行)、`box_main.js` (743 行)。
  3. **Pokedex 圖鑑模組化 (`js/modules/pokedex/`)**：拆解為 `pokedex_core.js` (1,875 行)、`pokedex_render.js` (2,745 行)、`pokedex_formulas.js` (1,670 行)、`pokedex_modal.js` (771 行)。
  4. **Tier 4 測試套件拆分 (`tests/tiers/tier4/`)**：原 8,993 行巨石縮減至 18 行微型協調器，4 個獨立子套件（`tier4_part1.js` 2,026 行、`tier4_part2.js` 2,873 行、`tier4_part3.js` 2,652 行、`tier4_part4.js` 1,559 行），109 項用例全部正常運作。
  5. **CSS 深度細化與 Master Bundler (`scripts/build_all.js`)**：全站 37 個模組於 10ms 內完成打包，所有 226 項測試 100% 通過。
- **嚴禁退化行為**：修改特定業務邏輯時應優先編輯 `js/modules/wiki/`、`js/modules/box/`、`js/modules/pokedex/`、`js/modules/lab/` 原始碼；不得移除 `scripts/build_all.js`。

---

## 九、 模組八：全主題配色與設計規範 (Themes & UI Rules)

### 9.1 四款核心主題雙向檢核
- **[v] 良品狀態 (Verified Working)**：
  - 支援 Midnight (深色)、Onyx (極黑)、Dawn (明亮淺色)、Emerald (自然淺色) 與反色模式。
  - 詳見 [THEME_COLOR_SPEC.md](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/docs/THEME_COLOR_SPEC.md)。
  - 所有文字、按鈕、晶片均具備 WCAG AA 級對比度。
- **嚴禁退化行為**：嚴禁硬編碼無適配之深色背景（`#0f172a`, `rgba(15,23,42,...)`）或淺色文字（`#38bdf8`, `#fca5a5`）。

### 9.2 下拉選單向下箭頭排版
- **[v] 良品狀態 (Verified Working)**：
  - 向下選單箭頭與右側邊框保留寬鬆間距（`background-position: right 18px center`，`padding-right: 36px`），文字不覆蓋箭頭。
  - 選單展開位置嚴格位於選擇框下方對齊，禁止覆蓋選擇框本體。
- **嚴禁退化行為**：不得將向下箭頭貼緊右側邊緣，不得讓選單向上反向覆蓋選擇框。

---

## 十、 十大歷史修復缺陷與嚴禁退化紅線 (Top 10 Fixed Defects Anti-Regression Checklist)

以下為歷來排除之重大系統缺陷。**任何後續開發均必須將此表作為最高防呆標準，嚴禁改回錯誤版本！**

| 序號 | 缺陷項目 (Defect Name) | 錯誤歷史現象 (Bug Scenario) | [v] 良品狀態標準 (Verified Good Baseline) | 嚴禁退化行為 (Forbidden Regressive Action) |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **倉庫子分頁與深度研究室雙面板疊加干擾** | 在 H5 點選「深度研究」時，倉庫清單未隱藏，兩面板在同頁重疊擠壓。 | 透過 `.mobile-h5-app #panel-box.box-lab-active #box-subpanel-list { display: none !important; }` 與 `setProperty('display', 'none', 'important')` 達到絕對隔離。 | **嚴禁**刪除 CSS 隔離宣告，**嚴禁**使用普通無 `!important` 之 inline style 設定 `display: none`。 |
| **2** | **行動端 `/app/` Manifest 404 重複請求** | 控制台頻繁報錯 `.../app/data/manifest.json 404`。 | `domUtils.js` 擴充支援 `window.__DATA_BASE_PATH__` 與 `/app/` 偵測，優先讀取 `../data/manifest.json`。 | **嚴禁**改回只依賴 `global.__DATA_BASE_PATH__`（瀏覽器下必錯）。 |
| **3** | **里程碑食材標籤 `[object Object]` 異常** | 食材解鎖文案出現 `解鎖 [object Object]` 或拋出 TypeError。 | `normalizeIngName` 與 `I18N.getIngredientName` 全面安全提取物件型食材之 `.name`。 | **嚴禁**未經型別防禦直接對食材物件執行字串運算。 |
| **4** | **碎裂酪梨沙拉食材與能量錯誤** | 食材誤標為鮮奶與番茄、能量誤標為 8310，誤向鮮奶寶可夢推薦沙拉。 | 官方數值：萌綠大豆 18、嫩亮酪梨 14、純粹油 10，基礎能量 7125。 | **嚴禁**改回含鮮奶/番茄之舊版錯誤配方與舊能量。 |
| **5** | **自爆磁怪擴鍋建議出現非官方俗稱** | 建議文案中出現「如煉獄咖哩/太妃糖豆漿」等非官方稱謂。 | 全面校正為官方正式食譜「如彈跳咖哩烏龍麵、採蜜巧克力格子鬆餅等大型食譜」。 | **嚴禁**在任何 AI 簡評或推薦中使用玩家社群俗稱。 |
| **6** | **島嶼棲息地寶可夢順序錯亂反覆跳動** | 依深灰/安然/淺眠三睡眠類型分塊，導致同一島嶼編號反覆跳動。 | 全島嶼棲息寶可夢整合後**一律依全國圖鑑編號由小到大正序遞增排列**。 | **嚴禁**改回依三大睡眠型態分塊排序。 |
| **7** | **全道具百科卡片多重巢狀框** | 道具卡片內部又嵌套小卡片框線與分割線，版面厚重擁擠。 | 嚴格執行 Single Frame Rule：僅保留最外層卡片邊界，內部採用純淨無框排版。 | **嚴禁**在卡片內部再度包覆雙重外框與多餘內距。 |
| **8** | **雲端同步提示洗版與自推回聲** | 每次切換分頁或自身推送後反覆跳出「雲端資料已同步」Toast。 | `CloudSync` 導入 5 分鐘冷卻與回環推送（Echo Loop）阻斷標記。 | **嚴禁**移除雲端同步冷卻機制或回環標記。 |
| **9** | **Tesseract.js OCR 首屏強制預載** | 首屏直接加載 2MB+ `tesseract.min.js`，拖慢首次載入時間。 | 改為按需延遲載入（`ensureTesseractLoaded`），首屏完全不下載。 | **嚴禁**在 `index.html` 首屏直接寫入 `<script src="...tesseract.min.js">`。 |
| **10** | **全域表情符號 (Emoji) 混入** | UI 介面、圖標、按鈕或說明文字中使用 Emoji 充當裝飾。 | 嚴格遵守零 Emoji 規範 (Zero Emoji Policy)，採用乾淨向量圖或純文字標籤。 | **嚴禁**在任何 UI、註解或回應中插入 Emoji。 |

---

## 結語與交接規範 (Handoff Instructions)

每位接續工作的 AI Agent 必須在開始任務前閱讀本檔案與 `docs/walkthrough.md`。
若本次工作有新增功能或修復問題：
1. 立即於本檔案第十節擴充良品標記與防退化紅線。
2. 於 `tests/run_tests.js` 補充對應之自動化測試。
3. 執行 `rtk node tests/run_tests.js` 確保測試維持 100% 通過。
4. 將更新之 `VERIFIED_FEATURES_AND_BASELINES.md` 同步至 `~/.gemini/agent-docs/projects/pokemon-sleep-app/`。
5. 執行 Git Commit 與 Push 至遠端儲存庫。
