# pokemon-sleep-app

> **工作區路徑:** `/Users/yanli/AndroidStudioProjects/pokemon-sleep-app`  
> **類型:** web | **群組:** android-studio  
> **最後更新:** 2026-10-20（寶可夢倉庫子分頁與深度研究室切換隔離修復、CSS !important 特異度阻斷排除、manifest.json 基準路徑自動解析，224/224 測試全數通過，v=20261020_01）

---

## 防退化最高基線索引 (Anti-Regression Ground Truth)

> [!IMPORTANT]
> **接續開發的 AI Agent 必讀：**  
> 所有已驗證為良品的功能、演算法與歷史重大缺陷修復，已完整收錄於 **[VERIFIED_FEATURES_AND_BASELINES.md](VERIFIED_FEATURES_AND_BASELINES.md)**。  
> 進行任何重構或新功能開發時，**絕對禁止將標記為 `[v] 良品狀態` 的項目改回錯誤版本！**

---

## 簡介

Pokémon Sleep 資料庫與策略分析工具箱（**224/224 項自動化端到端測試全數通過**）：
- **今日重大修復良品**：倉庫清單與深度研究室（Research Lab）子分頁雙向隔離防護，透過 `.box-lab-active` 與 CSS `display: none !important;` 徹底阻斷雙面板同時渲染干擾；修正 `domUtils.js` 自動解析 `window.__DATA_BASE_PATH__`，消除 `/app/` 下 `manifest.json` 404 報錯。
- **四大效能支柱優化**：CSS `content-visibility: auto` 視窗外渲染跳過、Service Worker 版本化快取、Tesseract.js OCR 按需動態延遲載入、Wiki 天梯/島嶼滾動 rAF 節流與圖鑑滑桿熱路徑記憶化。
- **四層智慧快取架構**：後端 `manifest.json` 731B 確定性 SHA-256 差分版本清單、前端 `DataCacheManager` LocalStorage 本地優先瞬時載入與 10 分鐘冷卻比對、Service Worker `sw.js` 圖片持久化快取、Supabase `user_boxes` 雲端同步回環推送阻斷與 5 分鐘冷卻去重。
- **全站規範合規**：Single Frame Rule（嚴禁巢狀多重外框）與 Zero Emoji Policy（全域嚴格零表情符號）全面合規。

---

## 技術棧

純前端靜態單頁應用 (SPA): 原生 Vanilla HTML5 / ES6 JavaScript / CSS3 + Service Worker (PWA) + Supabase 雲端備份 + Tesseract.js OCR。

---

## 啟動方式

本專案為純前端靜態單頁應用 (SPA)，可使用本機 HTTP 伺服器啟動：

```bash
# 使用 Python 內建 HTTP 伺服器 (Port 8000)
python3 -m http.server 8000

# 或使用 npx serve
npx serve .
```

開啟瀏覽器造訪：`http://localhost:8000/`

---

## 部署與發布規範 (Deployment & GitHub Pages Delivery Rule)

- **GitHub Pages 自動更新鐵則 (Mandatory Push & Verification)**:
  - 本專案已配置 GitHub Pages 線上服務（`https://s102213039.github.io/pokemon-sleep-app/`）。
  - 任何程式碼修改與測試驗證通過後，**必須**自動執行 Git Commit 並推送至遠端 `git push origin main`，嚴禁僅留在本機工作區。
  - 推送後必須主動確認 GitHub Actions 部署流程順利觸發，確保線上使用者即時獲取最新修正。

---

## UI 與排版設計原則 (UI Design Standards)

- **零 Emoji 規範 (Zero Emoji Policy)**: 全域嚴格禁止在 UI、文字、註解、終端機與訊息中使用 Emoji。
- **嚴禁巢狀多重外框規範 (No Redundant Nested Outer Borders)**:
  - 當區塊內部已包含表格、清單或卡片網格時，最外層容器絕對不得包覆多餘外框 (`border: none; background: transparent; padding: 0;`)。
  - 邊界一律由內部元件各自承擔，避免雙重外框 (Double Borders) 造成視覺厚重並壓縮可用寬度。
- **主題配色深淺雙向檢核規範 (Theme Color Spec & Pre/Post Execution Check)**:
  - 詳見 [THEME_COLOR_SPEC.md](THEME_COLOR_SPEC.md)。
  - 支援 4 款核心主題: Midnight (深色)、Onyx (極黑)、Dawn (明亮淺色)、Emerald (自然淺色) 與反色模式。
  - 嚴禁硬編碼無適配之深色背景 (`#0f172a`, `rgba(15,23,42,...)`) 或淺色/低對比文字 (`#38bdf8`, `#fca5a5`)。
- **子分頁緊湊邊距與可視化橫向滑動**: 百科子分頁群組採用緊湊內外邊距，保留細微半透明滾動條，確保島嶼分頁可見且能明確辨識橫向滑動。
- **島嶼棲息睡姿依全國圖鑑編號正序**: 全島嶼棲息寶可夢整合後一律由小到大依圖鑑編號遞增排序，避免三大睡眠狀態分塊堆疊造成編號反覆跳動。
- **下拉選單向下箭頭規範**: 向下箭頭向左內縮調整（`background-position: right 18px center`，`padding-right: 36px`），展開時選單正對下方展開，禁止覆蓋本體。

---

## 相關文件

- [VERIFIED_FEATURES_AND_BASELINES.md](VERIFIED_FEATURES_AND_BASELINES.md) — **已驗證良品功能與防退化基線註冊表（全功能清單、歷史缺陷良品標準與嚴禁退化紅線）**
- [walkthrough.md](walkthrough.md) — 專案完整功能歷史演進與 75+ 歷程紀錄。
- [SKILL_SPECIALISTS_AND_BFS_META_ANALYSIS.md](SKILL_SPECIALISTS_AND_BFS_META_ANALYSIS.md) — 技能型寶可夢與樹果數量S（BFS）適配深度研究與戰術定位技術規範。
- [OPTIMAL_BUILDS_AND_META_LOGIC.md](OPTIMAL_BUILDS_AND_META_LOGIC.md) — 寶可夢畢業神配置、樹果性格與技能型樹果數量S適配機制技術規範。
- [THEME_COLOR_SPEC.md](THEME_COLOR_SPEC.md) — 主題配色與深淺色雙向檢核規範。
- [SIDEBAR_HANDLE_RULE.md](SIDEBAR_HANDLE_RULE.md) — 側邊欄書籤手柄規則。
