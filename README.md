# Pokémon Sleep 資料庫與策略分析工具箱 (pokemon-sleep-app)

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://s102213039.github.io/pokemon-sleep-app/)
[![Tests](https://img.shields.io/badge/Tests-284%2F284%20PASS-brightgreen?style=for-the-badge&logo=node.js)](https://github.com/s102213039/pokemon-sleep-app)
[![Bilingual](https://img.shields.io/badge/Language-繁體中文%20%7C%20简体中文%20%7C%20English-orange?style=for-the-badge)](https://s102213039.github.io/pokemon-sleep-app/)
[![Themes](https://img.shields.io/badge/Themes-4%20Themes%20(Dark%2FLight)-purple?style=for-the-badge)](https://s102213039.github.io/pokemon-sleep-app/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**專為《Pokémon Sleep》玩家打造的一站式現代化 Web 應用程式**  
整合官方最新拆包數據、即時雙語切換、食譜能量模擬、數據百科天梯、OCR 截圖辨識入庫、六維雷達評測與 AI 新聞情報分析。

[立即體驗線上版 (Live Demo)](https://s102213039.github.io/pokemon-sleep-app/) | [問題回報 (Issues)](https://github.com/s102213039/pokemon-sleep-app/issues)

</div>

---

## 核心特色功能 (Key Features)

### 1. 寶可夢全圖鑑 (Pokédex & Advanced Dex)
- **完整收錄 247+ 隻寶可夢**：包含神獸（雷公、炎帝、水君、拉帝亞斯、拉帝歐斯、達克萊伊、克雷色利亞、帕路奇亞）與最新特殊型態。
- **多語言 & ID 即時搜尋**：支援中文 (CN)、英文 (EN)、日文 (JP) 與全國圖鑑編號（`#0001`、`1`、`01`），並具備注音與同音字容錯檢索。
- **雙檢視模式**：直觀卡片檢視（Card Grid）與高密度資料表格檢視（Data Table）無縫切換。
- **側邊欄複合篩選**：支援 18 種屬性向量圖示、3 大專長、樹果種類、可產食材、僅初始食材、僅最終進化與主技能篩選。
- **特殊主技能專屬提示**：如「食材精選S」會動態鎖定並顯示該寶可夢專屬的 3 種候選食材池。

---

### 2. 料理食譜計算與模擬器 (Recipes & Pot Simulator)
- **78 道官方食譜全收錄與動態同步**：涵蓋咖哩/濃湯、沙拉、甜點/飲料三大料理類別，具備 Serebii 動態爬取與雙向同步機制，保證 100% 官方資料對齊。
- **嚴格資料健全性守門 (isRecipesHealthy)**：具備深度防禦檢查，抵禦空洞陣列 (Sparse Array)、非有限數值 (Infinity/NaN)、原型污染 (Prototype Pollution) 與異常食材名稱，確保快取資料永遠健康可靠。
- **全域跨模組一致呈現**：食譜分頁、食材天梯榜、研究室目標推薦、倉庫智慧評價與多語系字典 (繁中/簡中/英文) 全面即時聯動。
- **雙向食材篩選器**：
  - **包含食材**：指定料理必須含有的食材（支援「含任一」或「全部符合」）。
  - **排除食材**：隱藏含有特定不需要食材的食譜。
- **即時能量試算引擎**：
  - 食譜等級加成（Lv.1 ~ Lv.70，最高達 +258%）
  - 島嶼營地加成（0% ~ 85%）
  - 活動限定倍率（1.00x ~ 2.50x）
  - 好極了 / 超大成功（2x / 3x）最終能量精算
- **網頁版專屬視覺優化**：預估能量欄位設有 32px 舒適右邊距與放大字體排版，數字清晰易讀。

---

### 3. 數據百科與策略指南 (Wiki & Knowledge Base)
- **主技能數值資料庫**：
  - Lv.1 ~ Lv.8 完整數值一覽。
  - **能量填充S (蓄力)**：0~10 次蓄積動態切換與對照矩陣。
  - **幫手加速 (神獸專屬)**：0~5 種類同屬隊友動態互動試算。
  - **食材精選S 專屬食材池**：6 家族 7 種寶可夢候選食材矩陣。
- **副技能與性格指南**：
  - **主技能發動機率矩陣**：基於官方底層公式精算 24 種組合發動倍率與評級。
  - **副技能階級與數值總覽**：已開放副技能分類與數值。
  - **性格五維屬性倍率表**：官方最新補正增減效果。
- **幫忙速度極限與計算機制指南**：解析全隊幫手獎勵、單體極限速度、35% 副技能上限與性格獨立乘算公式。
- **培育與評級指南**：樹果型、食材型、技能型各專長評級標準與睡眠天數基線計算器。
- **食材產量天梯榜**：
  - 支援六大通用簡化配方形態（XXC, AAX, ABX, ABA, ABB, AAA），簡明易懂。
  - 多維度天梯排序軌道：預設能量升序、能量降序、日產量降序、核心食譜需求量降序。
  - 支援副技能（食材M、幫速M）與性格（食材▲、幫速▲）多重即時試算。
- **主技能天梯榜 (`skills_ladder`)**：
  - 9 大純文字主技能分類軌道（動態 min/max 刻度最大化橫向空間），支援 38px 寶可夢頭像與並行錯落排布。
  - **複合主技能雙軌同步高亮**：懸停複合型主技能寶可夢（如正電/負電拍拍、夢妖魔、克雷色利亞、謎擬Q、路卡利歐等）時跨軌道雙向聯動發光標示。
  - **點擊軌道名稱開啟排行榜**：與食材天梯一致的密集排名浮窗，支援三語 `title`/`alt` 懸停辨識與「僅顯示最終進化」Switch 開關、副技能及性格補正試算。
- **樹果與食材基礎能量庫**：樹果能量等級滑桿（Lv.1~70）、島嶼加成（0~85%）、順果 2x 試算與 19 種食材基礎分。

---

### 4. 寶可夢倉庫與智慧 OCR 辨識 (User Box & Smart OCR)

- **Tesseract.js OCR 截圖辨識**：支援單張與批次上傳/拖曳遊戲截圖，自動辨識寶可夢物種、性格、等級與副技能；批次辨識完成後自動統計匯入/升級/略過筆數與失敗檔名清單。
- **統一特徵指紋防重複與自動升級 (`upsertImportedPokemonToBox`)**：
  - 統一套用於 JSON 匯入與批次 OCR 入庫：完全一致指紋自動略過；同個體若帶來更高寶可夢等級或主技能等級則原地升級更新，同時保留自訂暱稱、獎章與異色狀態。
- **非阻塞式確認視窗與三語支援**：全面消除原生 `alert()` / `confirm()` 阻塞彈窗，改為非阻塞主題確認視窗與 Toast，完整支援繁中 / 簡中 / 英文三語切換與 39 種主技能等級上限校正。
- **手動編輯與備份**：支援自訂暱稱、等級調整 (Lv.1~Lv.80)、食材組合配置與 JSON 備份匯出入。

---

### 5. 評測實驗室與六維量化雷達 (Appraisal Lab & 6D Radar)
- **六維量化戰力指標**：基於 RaenonX PR 算法評測樹果力、食材力、技能力、速度力、自給力、極限爆發力。
- **協同評價與神級組合**：自動分析 BFS 樹果數量S、幫手獎勵、雙食機率與性格契合度。
- **關鍵里程碑培育成本精算**：
  - **Lv. 30**（解鎖第 2 食材）所需專屬糖果、萬能糖果與夢之碎片。
  - **Lv. 50**（解鎖第 3 副技能）所需培育資源。
  - **Lv. 60**（解鎖第 3 食材完全體）所需培育資源。

---

### 6. 最新官方公告與 AI 情報分析 (News & AI Intelligence)
- **AI 重點快報儀表板**：自動提煉活動時間與營地、核心獎勵倍率、特惠禮包清單、機率提升寶可夢與營地出沒清單。
- **橫向甘特圖日程排程 (Gantt Timeline)**：視覺化活動期程與禮包販售區間。
- **乾淨簡約版面**：移除冗餘橫幅，以狀態標籤精確呈現活動與禮包之進行/已結束狀態。
- **全文即時翻譯引擎**：支援中英雙語公告 100% 零遺漏切換。

---

### 7. 行動端專屬介面 (Mobile H5 App)
- 專屬入口網址 `app/index.html`，具備 5 大導航 Dock（圖鑑、食譜、百科、倉庫、消息）。
- 底部抽屜式篩選（Bottom Sheet）、自適應安全區域（Safe Area Insets）與智慧防回彈滾動。
- **高韌性下拉刷新狀態機 (Hardened Pull-to-Refresh Engine)**：
  - **反向滑動即刻取消**：向上滑動（`deltaY < -4`）立即終止手勢追蹤，徹底杜絕快速上下捲動後的幽靈下拉刷新。
  - **12px 拖曳死區與容器捲動精準判定**：手勢未達 12px 保持靜止；嚴格要求容器 `scrollTop === 0`，非最頂部時全面阻斷。
  - **控制項與文字節點排除**：盒子工具列（`.controls-container`）、上傳拖放區（`#box-dropzone`）與引導卡（含內部 TextNode 節點）全面排除觸發。
  - **中斷安全與導航聯動**：監聽系統 `touchcancel` 事件，並在 Dock 分頁切換、盒子子分頁切換或彈窗開啟時自動調用 `cancelPullToRefresh()`，徹底杜絕 UI 殘留與異常刷新。

---

### 8. 4 款高對比外觀主題 (Multi-Theme System)
| 主題名稱 | 風格特點 | 適用環境 |
|---|---|---|
| 深邃夜空 (Midnight Navy) | 科技深藍黑 · 霓虹青紫點綴 | 夜間與深色愛好者（預設） |
| 曜石暗影 (Onyx Black) | OLED 純粹黑 · 琥珀流金點綴 | OLED 螢幕極致省電 |
| 晨曦暖陽 (Dawn Amber) | 溫潤奶油白 · 蔚藍高對比點綴 | 明亮日光環境 |
| 萌綠森林 (Emerald Forest) | 清新薄荷白 · 翠綠草木點綴 | 護眼清新日光風格 |

---

### 9. 智能回到頂部導航 (Smart Back to Top Navigation)
- **動態長內容偵測**：當頁面具有充足長度且使用者向下滾動超過閾值（280px）時，自動淡入右下懸浮回到頂部按鈕。
- **平滑滾動與適時隱藏**：點擊後平滑滾動回頁面最頂端，並自動淡出隱藏；再次向下滑動時自動判斷重新展示。
- **雙端適配與行動端避讓**：
  - **桌面版**：右下角舒適懸浮（`right: 28px; bottom: 32px`）。
  - **行動端 (H5 App)**：自適應安全區域（Safe Area Insets），並自動偵測當前頁面之懸浮篩選按鈕（FAB），採垂直堆疊避讓（`bottom: 138px`），杜絕互相覆蓋；無篩選按鈕時平滑落至 Dock 頂部（`bottom: 76px`）。

---

## 系統架構 (System Architecture)

```mermaid
graph TD
    User["使用者 (Browser / Mobile)"] --> SPA["SPA 單頁核心 (index.html / app/index.html)"]
    
    subgraph ModularSource ["領域模組化原始碼 (Sub-25ms Bundler)"]
        DexSrc["圖鑑模組 (js/modules/pokedex/)"] --> Dex["app.js"]
        BoxSrc["倉庫模組 (js/modules/box/)"] --> Box["box.js"]
        WikiSrc["百科模組 (js/modules/wiki/)"] --> Wiki["wiki.js"]
        LabSrc["研究室模組 (js/modules/lab/)"] --> Lab["appraisal.js"]
        CssSrc["樣式模組 (css/)"] --> Css["styles.css"]
    end
    
    subgraph CoreEngine ["核心引擎與驅動器"]
        I18N["i18n 雙語引擎 (i18n.js)"]
        IDB["原生 IndexedDB 驅動器 (idbStorage.js)"]
        DCM["快取與版本管理器 (domUtils.js)"]
        Cloud["Supabase 雲端備份 (cloudSync.js)"]
    end
    
    subgraph DataServices ["二進位快取與生產資料層"]
        Manifest[("manifest.json (SHA-256 差分清單)")]
        MinifiedData[("壓縮靜態資料 (data/*.json -35% 瘦身)")]
        IDBCache[("IndexedDB 本地物件快取 (0ms 秒開)")]
        SW["Service Worker (sw.js 圖片與字體快取)"]
    end

    SPA --> ModularSource
    SPA --> CoreEngine
    CoreEngine --> DataServices
```

---

## 本地開發與自動化測試 (Testing)

本專案內建一套獨立的 **284 項全自動化測試套件**與多組專項測試，涵蓋資料庫完整性、公式精確度、OCR 多錨點辨識與去重升級、主技能天梯、i18n 三語翻譯、雙端路徑跳轉、評測演算法、樹果遽增 BFS 協同、生產環境資料壓縮、原生 IndexedDB 快取驗證、食譜健康防禦、下拉刷新狀態機與各島嶼營地。詳細測試架構與反饋原則請參考 [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md)。

### 常用命令 (Commands)
```bash
# 確保已安裝 Node.js (v18+)

# 1. 日常開發推薦：極速執行 Tier 1~3 (161 項，僅 < 0.4 秒)
npm run test:fast

# 2. 完整回歸驗證：全量 284 項測試 (約 2.2 秒)
npm test

# 3. 專項領域、手勢與健康度測試
node tests/test_wiki_skill_ladder.js          # 783 項主技能天梯測試
node tests/test_cross_module_consistency.js   # 跨模組資料與規則一致性測試
node tests/test_box_import_dedup.js           # 倉庫去重升級與非阻塞視窗測試
node tests/adversarial_ptr_stress.js          # 19 項 PTR 對抗手勢測試
node tests/stress_ptr_concurrency.js          # 10 項 PTR 並行與跨模組中斷測試
node tests/stress_ptr_gestures.js             # 7 項 PTR 基礎手勢合成測試
node tests/stress_recipe_health.js            # 57 項食譜健康度與原型污染測試
node tests/stress_i18n_consumer.js            # 19 項 i18n 跨語系簽名測試

# 4. 指定單一或組合 Tier
npm run test:tier1    # Tier 1 基礎覆蓋
npm run test:tier4    # Tier 4 真實情境整合
node tests/run_tests.js --tier=2,3

# 5. 一鍵打包所有 CSS 與 JS 子模組 (約 25ms)
npm run build:all

# 6. 資料庫維護雙模式
npm run data:format   # 展開為 2 格縮排（編輯資料或審查 git diff）
npm run data:minify   # 壓回生產極致壓縮格式並自動更新 manifest.json
```

### 測試覆蓋階層
- **Tier 1 - Feature Coverage (73 項)**：資料集結構、公式計算、食譜加成、主技能矩陣、主題色系、H5 入口完整性、回到頂部按鈕結構。
- **Tier 2 - Boundary Cases (70 項)**：空搜尋、大小寫不敏感、多選交集、等級邊界 (Lv.1~80)、鍋子容量上下限、副技能防重複選擇、進化等級防禦、19 項 PTR 嚴苛手勢與死區邊界、12 項食譜健康邊界。
- **Tier 3 - Cross-Feature (18 項)**：多維度複合篩選、主題語言聯動切換、Dock 導航持久化、睡飽飽獎章抵扣結算、10 項 PTR 跨模組導航切換與並行中斷。
- **Tier 4 - Real-World Scenarios (123 項)**：雙端真實工作流、OCR 全量解析校準（102x 提速）、嚴格評測雙軌定級、樹果遽增 BFS 爆發、傳說神獸團隊協同、目標料理導向組隊、生產資料壓縮、原生 IndexedDB 0ms 秒開與琥褐溪谷營地驗證。

> 完整開發、擴充資料庫與模組化建構流程，請參閱 **[docs/MAINTENANCE_AND_DEVELOPMENT_GUIDE.md](docs/MAINTENANCE_AND_DEVELOPMENT_GUIDE.md)**。

---

## 部署與同步指南 (Deployment)

1. **GitHub Pages 部署**：
   - 專案原生支援 GitHub Pages，只需將分支設為 `main` 或透過 GitHub Actions 自動發布。
2. **資料自動更新**：
   - 在設定彈窗中輸入具有 `workflow` 權限的 GitHub PAT Token，即可一鍵遠端觸發 GitHub Actions 執行最新資料爬取與公告同步。

---

## 版權與免責聲明 (Disclaimer)

- 本專案採用 [MIT License](LICENSE) 開源授權。
- **Pokémon** 及 **Pokémon Sleep** 均為 Nintendo、Creatures Inc. 及 GAME FREAK inc. 之註冊商標。
- 本工具僅供玩家社群交流與遊戲數值研究使用，非官方附屬應用。
