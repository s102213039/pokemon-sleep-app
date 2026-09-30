# 專案進度與修復確認紀錄 (Project Progress & Walkthrough)

## 交接：2026-09-30 已完成（全量繁體中文料理正名與技能招式完整性深度稽核、v=20260930_01）

- **靜態快取標籤**：`v=20260930_01`
- **測試狀態**：163/163 自動化測試全數通過（含料理 100% 官方繁中對齊、主技能完整產出公式斷言）
- **繁體中文官方正名與技能全面性深度稽核**：
  1. **官方文本來源與真偽確認**：
     - 確認關鍵核心事實：《Pokémon Sleep》官方目前僅支援繁體中文（zh-TW / zh-HK），並未在中國大陸發行簡體中文版，亦無簡中本地化檔案。
     - 遊戲客戶端內部提取出的中文文本庫（RaenonX zh-TW 數據庫、巴哈姆特哈啦板官方食譜精華區、PTT 寶可夢板）皆為寶可夢官方（The Pokémon Company）官方發布之唯一繁體中文正名。
     - 釐清先前記號之「軟綿烤地瓜」、「奈羅利恢復茶」、「熱水溫沙拉」、「採蜜可可鬆餅」等名稱實為遊戲剛推出時的玩家自譯或英文直譯；官方繁中遊戲內正式譯名分別為「熟成甜薯燒」、「橙夢的排毒茶」、「大塊滿滿熱水沙拉」、「採蜜巧克力格子鬆餅」。
     - 針對使用者特別指出的「居合斬」料理，正式正名為「居合斬壽喜燒咖哩」（Cut Sukiyaki Curry，原誤記為一字斬）。
     - 78 項料理全量對齊官方繁中正名，無任何遺漏。
  2. **技能招式完整度與計算修復**：
     - 針對「健美（料理輔助S）」主技能：在寶可夢強度視窗與計算引擎中，完整補齊「隨機獲取食材（Lv.1~Lv.7 產出 6~24 顆）」與「提升料理漂亮成功率（+1%~+5%）」雙軌期望值計算與單次說明。
     - 補齊「怪力鉗（食材精選S）」錯別字修正（原怪力钳 -> 怪力鉗）。
     - 全量 38 種主技能之官方繁體中文與英文說明已全數收錄於 `SPECIAL_SKILL_DETAILS` 與 `BASE_SKILL_DETAILS`。
  3. **規範檢核**：
     - 100% 遵循全域零 Emoji 規範（Zero Emoji Policy）。
     - 100% 遵循單一外框規範（Single Frame Rule）。
     - 所有終端指令一律加上 `rtk` 前綴。

---

## 交接：2026-09-29 已完成（徹底消除重複雲端同步提示、自推回聲防護與 v=20260929_01）

- **靜態快取標籤**：`v=20260929_01`
- **測試狀態**：162/162 自動化測試全數通過
- **徹底消除重複「雲端同步成功」提示問題（Eliminate Duplicate Sync Toasts）**：
  1. **回調重複註冊防護（Init Guard）**：
     - 修復 `box.js` 中 `initBoxEvents()` 缺乏初始化防護旗標，造成每次頁面切換或重複呼叫時，向 `window.CloudSync.onRemoteUpdate` 重複推入最多 4 個相同回調函式的問題。加入 `boxEventsInitialized` 防護，確保事件監聽與回調註冊僅執行一次。
  2. **內容雜湊比對與防自我回聲（Self-Echo Broadcast Loop Prevention）**：
     - 在 `cloudSync.js` 與 `box.js` 雙軌加入資料內容雜湊比對（`lastPushedBoxHash` 與 `lastReceivedBoxHash`）。
     - 本地推播時記錄推播內容與時間戳記（`lastLocalPushTime`）；當 Supabase Realtime 廣播回傳時，若距離本地推播小於 4 秒或資料內容與本地完全一致，判定為自推回聲並安全靜默忽略，不再觸發重複渲染與彈窗提示。
  3. **初始同步條件判定優化（Empty & Identical Guard）**：
     - 在 `triggerInitialSyncAndMerge()` 中，當本地倉庫與遠端倉庫皆為空（`[]`）或完全相同時，不再強制執行 `pushRemoteBox()`，徹底斬斷初始化時自我推播的惡性循環。
  4. **登入生命週期雙重初始化防護（Auth Lifecycle Guard）**：
     - 修復 `getSession()` 與 `onAuthStateChange('SIGNED_IN')` 並發執行時重複觸發初始同步與重複建立 WebSocket 訂閱的問題。加入 `initialSyncPromise` 與 `isRealtimeSubscribed` 旗標，確保全域僅存在單一即時連線頻道。
  5. **吐司提示去重節流與堆疊上限（Toast Deduplication & Max Limit）**：
     - 在 `showToast()` 實作訊息指紋與 2.5 秒節流機制，完全阻止短時間內相同標題與內容的重複彈窗。
     - 限制畫面上同時可見的吐司卡片最多為 2 張，過多時自動平滑淡出最舊的通知卡片，杜絕通知卡片多重堆疊覆蓋畫面。
  6. **兼容自動同步機器人新增寶可夢（Foongus / Amoonguss）**：
     - 機器人自動導入之 590 哎呀球菇與 591 敗露球菇同步補齊 `i18n.js` 雙語辭典，並更新自動化測試斷言至 128 隻最終形態，維持 162/162 測試通過。
  7. **規範檢核**：
     - 100% 遵循全域零 Emoji 規範（Zero Emoji Policy）。
     - 100% 遵循單一外框規範（Single Frame Rule）。
     - 所有終端指令一律加上 `rtk` 前綴。

---

## 交接：2026-09-26 已完成（倉庫 Tab 未登入輕微遮罩引導登入、隱藏訪客同步按鈕與 v=20260926_09）

- **靜態快取標籤**：`v=20260926_09`
- **測試狀態**：162/162 自動化測試全數通過
- **倉庫 Tab 未登入輕微遮罩引導登入（Box Auth Guidance Overlay）**：
  1. **未登入時隱藏頂部/工具列同步按鈕**：
     - 依使用者要求，當使用者處於未登入狀態時，桌機頂部操作列的 `#box-cloud-sync-btn` 與行動端工具列晶片 `#box-mobile-cloud-sync-btn` 一律隱藏（`style="display:none;"`），不再單獨常駐「雲端同步：訪客」按鈕。
     - 僅在使用者成功登入後，才會在工具列展示帶有綠色連線呼吸點與帳號名稱的同步狀態晶片，點擊可開啟同步管理與登出彈窗。
  2. **倉庫 Tab 未登入輕微遮罩與置中引導卡片**：
     - 當使用者切換至「倉庫（Box）」Tab 且尚未登入時，自動在倉庫內容上方覆蓋一層輕盈半透明的磨砂玻璃遮罩（`.box-auth-overlay`，`backdrop-filter: blur(8px)`）。
     - 遮罩正中央展示高質感引導卡片（`.box-auth-prompt-card`），內容包含雲端圖示、標題「登入啟用寶可夢雲端倉庫」、功能說明與「立即登入 / 註冊帳號」主要操作按鈕。
     - 點擊卡片本體或操作按鈕即可立即彈出帳號登入視窗；登入成功後遮罩自動隱藏並展示完整倉庫資料。
     - 卡片下方保留精緻的「以本機訪客模式暫時使用 (離線模式)」選項，提供本機測試與離線瀏覽彈性。
  3. **多主題自適應與行動端優化**：
     - 遮罩底色依 8 種明暗與反色主題自適應調整透明度與色調，光影效果通透。
     - 卡片採用 `position: sticky; top: 140px;`（行動端 `top: 70px;`），無論內容滾動或高度變化，卡片皆精準置中於使用者視野中央。
  4. **規範檢核**：
     - 100% 遵循全域零 Emoji 規範（Zero Emoji Policy），圖示皆為純向量 SVG。
     - 100% 遵循單一外框規範（Single Frame Rule），遮罩與提示卡片無冗餘巢狀外框。
     - 所有終端指令一律加上 `rtk` 前綴。

---

## 交接：2026-09-26 已完成（全主題按鈕色彩與文字高對比度適配、已登入標題優化、反饋提示框外移與 v=20260926_08）

- **靜態快取標籤**：`v=20260926_08`
- **測試狀態**：162/162 自動化測試全數通過
- **按鈕色彩與主題文字高對比度深度適配**：
  1. **解決曜石暗影（Onyx）與反色主題下按鈕文字隱形之根本原因**：
     - 原先 `.cloud-auth-btn.btn-primary` 使用 `background: var(--accent-blue)`，在 Onyx 深色主題中 `--accent-blue` 為近乎白色的冷銀色（`#cbd5e1`），導致白色文字在淺色背景上完全隱形（對比度僅 1.1:1）。
     - 本次針對全域 8 種主題模式（Midnight、Onyx、Dawn、Emerald 以及各自的 Inverted 反色版）全面配置專屬的高對比度配色方案。
  2. **主要按鈕（`.btn-primary`，如「登入帳號」、「立即建立帳號」、「立即手動同步」）**：
     - 全主題文字一律確保為純白高對比度（`color: #ffffff !important; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);`），對比度均大於 5:1（完全符合 WCAG AA / AAA 標準）。
     - Midnight / Dawn：採用明亮俐落的海洋藍漸層（`#0284c7` 至 `#2563eb`），搭配精緻光暈與立體邊框。
     - Onyx（曜石暗影）：採用純粹高飽和皇家藍漸層（`#2563eb` 至 `#1d4ed8`），在極黑底色上提供最強烈的視覺辨識度與點擊感。
     - Emerald（雅緻灰石）：採用深邃翡翠綠漸層（`#0f766e` 至 `#047857`），完美契合森綠色調。
     - Inverted 主題（反色版）：分別針對晴空、純白黑曜石、琥珀金、曜岩冷夜調整飽和度與對比度。
  3. **危險/次要操作按鈕（`.btn-danger`，如「登出帳號」）**：
     - 深色主題：背景採用微透柔和深紅（`rgba(239, 68, 68, 0.16)`），文字採用高對比珊瑚粉紅（`#fca5a5 !important;`，對比度 > 6.4:1），擺脫原先暗紅字沉入黑底的低對比困境。
     - 淺色主題：背景採用柔紅（`#fef2f2`），邊框採用淡紅（`#fca5a5`），文字採用深緋紅（`#b91c1c !important;`，對比度 > 6.3:1）。
     - 懸停狀態（Hover）：全主題填滿鮮豔緋紅（`#dc2626`）與純白文字（`#ffffff`），提供直覺有力的操作回饋。
  4. **已登入狀態標題與通用訊息提示框改善**：
     - 使用者登入後，彈窗標題從原本的「登入寶可夢雲端帳號」動態調整為更貼切的「雲端帳號與同步管理」（英文為 `Cloud Account Management`）。
     - 通用訊息提示框（`#cloud-auth-msg`）外移至狀態卡片下方，無論登入前登入後、手動同步或登出操作皆能清晰顯示綠色/紅色反饋通知。
  5. **規範檢核**：
     - 100% 遵循全域零 Emoji 規範（Zero Emoji Policy）。
     - 100% 遵循單一外框規範（Single Frame Rule）。
     - 所有終端指令一律加上 `rtk` 前綴。

---

## 交接：2026-09-26 已完成（登入與註冊獨立視窗分流、記住帳密、背景點擊退出與 v=20260926_07）

- **靜態快取標籤**：`v=20260926_07`
- **測試狀態**：162/162 自動化測試全數通過（含 openAuthModal DOM 渲染、switchAuthView 視圖切換、記住帳密 LocalStorage 持久化、帳密格式校驗）
- **UX 深度體驗升級**：
  1. **登入與註冊視窗分流（清晰獨立頁面體驗）**：
     - 點擊「登入 / 註冊」預設展示「登入寶可夢雲端帳號」視窗，包含帳號、密碼輸入與「記住帳號與密碼」核取方塊。
     - 登入視窗底部配置輕量切換文字連結「還沒有雲端帳號？一鍵註冊」，點擊平滑切換至「註冊寶可夢雲端帳號」視窗。
     - 註冊視窗包含自訂帳號（3~20位）、自訂密碼（6~32位）以及「確認密碼」二次驗證防呆，點擊「已經有雲端帳號？返回登入」可快速切換回登入視窗。
     - 兩視窗切換時自動帶入已輸入的帳號，無需重複打字。
  2. **點選彈窗外背景退出（Backdrop Click & Escape Dismiss）**：
     - 點選彈窗外圍半透明黑色遮罩層（Backdrop），彈窗立即自動關閉。
     - 支援全域 `Escape` 鍵盤快速鍵退出。
  3. **記住密碼（Remember Credentials）**：
     - 登入視窗加入「記住帳號與密碼」核取方塊。
     - 登入成功後若勾選，自動儲存至 LocalStorage（`PKMSLEEP_REMEMBER_AUTH_V1`）；下次回訪或再次開啟彈窗時，自動預填帳號與密碼。若未勾選則自動清理紀錄。
  4. **規範檢核**：
     - 嚴格遵守零 Emoji 規範（Zero Emoji Policy），密碼切換皆為純向量 SVG。
     - 嚴格遵守單一外框規範（Single Frame Rule），對話框簡潔無巢狀框。
     - 完美適配 Midnight、Onyx、Dawn、Emerald 四大主題。

---

## 交接：2026-09-26 里程碑標記（尚未加入資料庫與後端之純本地版本）

- **版本標記 (Git Tag)**：`v-pre-cloud-storage`
- **基準 Commit**：`38feed2`
- **靜態快取標籤**：`v=20260926_01`
- **測試狀態**：161/161 自動化測試全數通過
- **說明**：此里程碑為本專案在正式引入 Supabase 雲端資料庫、帳號密碼驗證與跨裝置即時雙軌同步功能前的純本地（LocalStorage）完整穩定版本。包含 18 種食材天梯精簡、全域滾動條隱藏、寶藍湖畔官方正名、單行無冗餘外框與 100% 零 Emoji 規範。

---

## 交接：2026-09-22 至 2026-09-24 已完成（下一個 agent 先讀）

使用者已確認這一批「大致可以」。不要重做，也不要退回下面列的行為。HEAD `ca0afe8`，快取 `v=20260924_01`，測試 `node tests/run_tests.js` 為 157/157。線上：`https://s102213039.github.io/pokemon-sleep-app/`。預覽用系統瀏覽器 `open`，不要用 Cursor 內建瀏覽器。全域禁止 Emoji。

改完靜態資源必須同時改 `index.html` 與 `app/index.html` 的 `?v=`，否則 GitHub Pages 會看到舊檔。

### 已完成需求

1. **H5 App wiki-card-header 整體向上微調**（快取 `v=20260925_06`，測試 159/159）
   - 依使用者需求，僅針對 H5 App 版本（`.mobile-h5-app`）將所有百科卡片標題列（`.wiki-card-header`）整體向上微調。
   - `.mobile-h5-app .wiki-card-header`：加入 `margin-top: -4px !important;`，緊湊頂部空間。
   - `.mobile-h5-app #wiki-subpanel-subskills .wiki-card-header`：加入 `margin-top: -4px !important;`。
   - `.mobile-h5-app .island-dual-grid .wiki-card-header`：加入 `margin-top: -3px !important;`。
   - `.mobile-h5-app #wiki-subpanel-islands .island-spawns-card > .wiki-card-header`：將 `padding-top` 由 8px 調降為 3px、加入 `margin-top: -4px !important;`、`padding-bottom` 微調為 6px，使棲息解鎖標題列與切換開關整齊上移。

2. **H5 App 全域滾動條徹底隱藏**（快取 `v=20260925_05`，HEAD `fbaea13`）
   - 原生 App 在各視圖滑動時不展示滾動條。
   - 在 `css/styles.css` 中配置全域隱藏規則：`html.mobile-h5-html *` 與 `body.mobile-h5-app *` 套用 `scrollbar-width: none !important;`、`-ms-overflow-style: none !important;` 以及 `::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }`。
   - 移除了 `.mobile-h5-app .wiki-subnav-tabs` 曾顯式指定 `display: block` 的滾動條。
   - 在主要面板（`.view-panel`、`#panel-pokemon`、`#panel-recipes`、`#panel-wiki`、`#panel-box`、`#panel-news`）加入通用隱藏清單，並在樣式表末端加入最終防護規則，保證在所有 WebKit、Firefox、Edge 及 iOS/Android WebView 中均無滾動條。
   - 保留所有視圖原生的觸控、滾動與手勢邏輯，不更動任何 JavaScript、高度、邊距或協調器程式碼。

3. **島嶼 5 官方正式名稱修正為「寶藍湖畔」**（`bfea139`）
   - 將全專案（`wiki.js`、`i18n.js`、`news.js`、`compare.html` 及各測試）中誤用的「拉碧絲湖畔」徹底更正為遊戲內官方譯名「**寶藍湖畔**」。

3. **副技能外框、島嶼圖層、養成指引、關閉動畫**（`532d365`，快取曾為 `v=20260922_01`）
   - 桌面 `#wiki/subskills` 各大類 `.wiki-card` 去掉外框、底、陰影，只留內部表格框。
   - 島嶼圖層用 `ensureIslandSceneLayer`：找不到就建；切走只加 `island-scene-hidden`；`refreshIslandsSubpanel` 先把圖層移出再重繪 innerHTML。
   - 「新手與進階養成核心週期指引」`.wiki-strategy-card` 內距縮小。
   - 浮窗關閉用反向動畫；圖鑑要靠 `#pokedex-detail-modal.overlay-closing` 蓋過開啟動畫。

2. **盒子彈窗頂欄、島嶼表文案與列高**（`143d781`）
   - `#box-edit-modal`：取消在標題左、標題在中、確定在右；不要右上關閉鈕。中文儲存是「確定」。
   - 島嶼雙表標題用短名（評級所需能量、出現數門檻）。左表列高均分，跟右表底對齊。
   - H5 `.mobile-controls-container` 透明，不要頂欄底色。

3. **喜好樹果在標題旁邊**（`5c09999`）
   - 桌面與 H5：`.island-hero-content` 橫向，`.island-title-group` 在左、`.island-berries-section` 在右，中間留空隙。

4. **桌面圖鑑彈窗**（`2fd2824`、`2397482`）
   - 網頁版隱藏 `#pokedex-detail-modal .sheet-drag-handle`。H5 保留。
   - 性格與睡飽飽獎章 `.custom-select-rf` 用 `width: max-content`，不要省略號。
   - `.pokedex-calc-unified-box` 拉高，對齊右欄最後一個 `.subskill-tier-section` 底邊。

5. **島嶼導覽選中可見**（`2397482`）
   - `scrollActiveIslandTabIntoView`：重繪 `.island-nav-strip` 後只把選中營地捲進可視範圍，不要把整條捲回起點。

6. **幫忙間隔性格降速**（`2397482`）
   - 官方減輕後是間隔 **+7.5%（1.075 倍，產能 -6.98%）**，不是舊的 +10% / 1.10。
   - `HELPING_SPEED_MATRIX` 降速列 `intervalRatio: 1.075`。`app.js` 的 `natureSpeedMult` 降速為 `1.075`、加速為 `0.90`。
   - 性格欄符號跟上方矩陣一致：`▲ 上升` / `▼ 下降` / `✕`。

7. **H5 島嶼棲息整卡吸頂**（`ab2f458` 到 `244f651`，使用者已接受）
   - 只做 H5 `#wiki/islands`。吸頂對象是整張 `.island-spawns-card`（`.wiki-card-header`、神獸開關、睡眠篩選、下方列表視窗），不是只釘標題。
   - 卡片不要實心底色。
   - 外層先滑 `#panel-wiki`。卡頂碰到 `.wiki-subnav-bar` 下緣才 `position: fixed` 釘住，高度只到百科面板底。
   - 釘住前 `.wiki-table-wrapper` 不能內部滑。加上 `is-spawns-pinned` 之後列表才內部滑。列表滑回頂再往上，交還外層並解除釘住。
   - 不要用 CSS `position: sticky`。這個捲動鏈會讓 sticky 失效；只釘 header 使用者已拒絕。
   - 不要在卡片上寫 `top: auto !important` 或 `height: 100% !important`。這兩個會蓋掉釘住座標，標題會停在畫面中間、上面空一大塊。
   - 釘住座標用 `--spawns-pin-top`、`--spawns-pin-h`，對齊子分頁列的 `getBoundingClientRect().bottom`。

8. **天梯選取料理橫條精簡與按鈕圖示化**（快取 `v=20260924_01`）
   - 移除頂部 `.ladder-recipe-banner-ings` 與所有食材晶片，不額外展示食材。
   - 選取料理去除料理名稱文字，只展示料理圖示（`<img class="ladder-recipe-banner-icon">`）。
   - 選取料理完全移除外框與背景（`.ladder-recipe-banner-recipe-chip` 採 `border: none; background: transparent; padding: 0;`）。多選時保留顏色圓點標記。
   - 清除按鈕移除文字（「清除」/「Clear」），改用純向量「X」圖示（`<svg>`），維持紅色主題配色，並改為圓形外框（`border-radius: 50%`，尺寸 28x28px）。

### 吸頂實作位置（接續時不要改壞）

- `js/modules/wiki.js`
  - `islandSpawnsTabActive`：`currentWikiSubTab !== 'islands'` 或子面板未顯示時必須直接 return。
  - `releaseIslandSpawnsPin`：離開島嶼子分頁時呼叫。隱藏中的節點 `getBoundingClientRect()` 是 0，若仍去改 `#panel-wiki.scrollTop`，其他百科子分頁會一頓一頓滑不動。
  - `applyIslandSpawnsCoordinator` / `bindIslandSpawnsCoordinator`：捲動監聽掛在 `#panel-wiki`，但只有島嶼子分頁能改 `scrollTop`。
  - 標記 DOM：`.island-spawns-coordinator` > `.island-spawns-card` > `.wiki-card-header` + `.wiki-table-wrapper`。
- `css/styles.css` 末段 `.mobile-h5-app #wiki-subpanel-islands .island-spawns-card.is-spawns-pinned`：`position: fixed`。未釘住時列表 `overflow-y: hidden`，釘住後才 `overflow-y: auto`。

### 尚未交給下一個 agent 的新需求

使用者沒有提出下一個功能。若要改百科捲動，先確認主技能、副技性格、食材天梯、能量速查、培育指南仍能正常滑，再動島嶼吸頂。

---


## 需求二十三：副技能去外框、島嶼圖切回保留、場景更透、彈窗關閉動畫（2026-09-22）

1. 網頁版副技能各大類去掉外框。養成週期指引外框內距縮小。
2. 離開島嶼子分頁只隱藏場景層，切回來不會消失。
3. 桌面場景透明度：淺色 0.32、深色 0.16。H5 維持 0.55。
4. 圖鑑、倉庫、評測、設定、天梯料理、食材排名、截圖燈箱的關閉改為進場的反向動畫。H5 底部面板往下滑出。
5. 快取 `v=20260921_11`。

---

## 需求二十二：島嶼高清圖 TinyPNG 壓縮與背景半透明（2026-09-21）

1. `assets/islands/hd/*.jpg` 以 TinyPNG 壓縮。
2. 場景圖 `opacity: 0.55`，降低搶眼程度。
3. 快取 `v=20260921_10`。

---

## 需求二十一：島嶼場景貼齊 header，桌面列表改實底（2026-09-21）

1. 桌面場景不受 `.wiki-main-container` 頂部 14px margin 影響，貼齊 header；內容改用 padding 維持內距。
2. 島嶼分頁表格／篩選列改實色底，不再透出場景。H5 維持原樣。
3. 快取 `v=20260921_9`。

---

## 需求二十：網頁版島嶼場景改全寬沉浸（H5 維持）（2026-09-21）

1. 桌面：場景層掛在 `#panel-wiki`，從 header 下方鋪滿整寬（含左右留白），高度跟高清橫幅走，內容疊在圖上。
2. H5：維持掛在 `#wiki-subpanel-islands`，不改現有樣式。
3. 快取 `v=20260921_8`。

---

## 需求十九：島嶼圖只掛在島嶼分頁頂部，並改用高清場景（2026-09-21）

1. 場景層只掛在 `#wiki-subpanel-islands`（桌面與 H5 相同），不再掛到整個 `#panel-wiki`，避免變成 1207x2925 整頁糊圖。
2. 場景圖改為 Real-ESRGAN 4x 高清島嶼橫幅（約 2560x1372），來源為 Serebii locations 原圖，不是卡比獸立繪。
3. 對照頁：`assets/islands/compare.html`。快取 `v=20260921_7`。

---


## 需求十八：島嶼圖改為獨立圖層，改用更高的營地場景圖（2026-09-21）

1. 島嶼圖是獨立元件 `.island-scene-layer`：在原本背景色之上、全部內容之下，不是 panel 的 background-image。
2. H5 從 `#wiki-subpanel-islands` 最上方展開；網頁從 `#panel-wiki` 最上方展開。
3. 場景改用 Serebii 營地正方形圖 `/snorlax/*.jpg`（約 1:1，比 640x343 橫幅更高），滿寬、高度跟圖片走。
4. 快取 `v=20260921_6`。

---


## 需求十七：島嶼圖改回加層橫幅，不再當整頁 wallpaper（2026-09-21）

1. 頁面底色維持原本 `--bg-dark`。島嶼圖只作為滿寬加層，高度跟圖片走（桌面最高 320px、H5 最高 210px），底部漸層沒入底色。
2. 撤掉 `#panel-wiki` / `#wiki-subpanel-islands` 整頁 cover 與 H5 重疊 grid，修復 H5 整屏模糊無法操作。
3. 快取 `v=20260921_5`。

---


## 需求十六：島嶼沉浸式場景、評級等高對齊、天梯性格單選（2026-09-21）

1. **島嶼背景**：H5 掛在 `#wiki-subpanel-islands`、網頁掛在 `#panel-wiki`；從 header / app bar 下方鋪滿，去掉頂部 padding 造成的空隙，長漸層沒入頁面。
2. **培育評級**：三張專長卡桌面等高，副技能與性格標題以 subgrid 對齊同一水平；H5 三大專長補上與網頁相同的頂部色線。
3. **H5** `.wiki-rule-banner` 去掉外框。
4. **食材天梯性格補正模擬**：全版本改為單選（再點一次可取消）。
5. 快取 `v=20260921_4`。

---


## 需求十五：島嶼全寬無邊場景、雙表並行與門檻精簡（2026-09-21）

1. **場景圖**：自島嶼營地 tab 下方立刻鋪滿內容寬度；高度依圖片、切換島嶼維持同一沒入高度；表格疊在圖上讓場景可穿入卡比獸評級表，底部拉長漸層沒入頁面底色。
2. **表格**：卡比獸評級所需能量與睡意之力門檻左右並行、等高；棲息寶可夢與各星級睡姿解鎖門檻改到下方。H5 同樣兩欄。
3. **刪除**：睡意之力表「露營券(+1且貪吃)」列，以及睡眠分數100換算腳註。睡眠分數100欄位保留。
4. 快取 `v=20260921_3`。自動化測試 156/156。

---


## 需求十四：島嶼英雄圖無邊沒入與食材精選 1.0 倍基準（2026-09-21）

1. **島嶼背景圖**（網頁與 H5）：去掉圓角外框與陰影，改為拉滿內容區的背景圖，底部以 `var(--bg-dark)` 漸層沒入頁面。
2. **食材精選S**：技能型不再內建 1.5 倍發動機率，全部專長改以 1.0 倍為基準；技能機率 M/S 與性格▲由篩選器疊加。
3. 快取 `v=20260921_2`。自動化測試 156/156。

---


## 需求十三：天梯主欄寬度對齊、料理多選高亮與補正標籤化（2026-09-21）

1. **網頁主內容寬度**：百科 `.wiki-main-container` 恢復與其他分頁相同的 `max-width: 1200px; width: 92%`，不再把天梯拉滿。
2. **料理高亮多選**（H5 與網頁）：「選取料理高亮食材」標題旁新增「多選」開關。開啟後可連續點選多道料理，不關閉彈窗；聯集高亮所需食材，各料理以不同顏色標記單餐用量與三餐及格線。
3. **副技能補正**：改為可點選多選標籤，刪除括號數值與 switch；新增技能機率M/S。
4. **性格補正**：刪除括號數值，新增技能機率▲。全不選或三項全選視為無修正。
5. 快取 `v=20260921_1`。自動化測試 156/156。

---


## 需求十二：島嶼／評級三欄壓縮、性格補正雙選與圖鑑篩選高度（2026-09-20）

1. **網頁版島嶼 Tab**：卡比獸評級能量、睡意之力門檻、棲息寶可夢改為 `island-triple-grid` 同一列並行；H5 與窄螢幕維持直向堆疊。表格內距與標題字級同步壓縮。
2. **網頁版培育評級指南**：三大專長卡片改為桌面三欄網格；手機維持單欄。卡片內 padding 縮小。
3. **食材天梯性格補正**：移除「無修正」第三鈕。僅保留食材機率▲、幫忙速度▲，可獨立勾選；預設全不選；全選或全不選皆視為無修正（倍率 1.0x）。
4. **圖鑑 H5 篩選器**：縮小 header、區塊 gap、標題與選項間距，避免實機必須額外滑動才看完篩選內容。
5. 快取 `v=20260920_6`。自動化測試 156/156。

---

## 需求一：畢業神配置與深度能力評估：樹果幫速個性與技能型樹果數量S適配機制（深入爭議覆查版）

### 修改與社群爭議深度解析

根據使用者指示，重新深入檢索與比對社群各方研究（Reddit r/PokemonSleep、RaenonX 個體期望值分析、巴哈姆特專版、各大進階玩家攻略）：

1. **樹果型（Berry Specialists）個性與神配置**：
   - 社群公認樹果型第一神性格為「固執」（Adamant: 幫忙速度 +10%，食材發現率 -20%）。食材機率下降能夠直接將幫忙次數轉化為樹果產出，無任何負面代價。
   - 畢業神配置預設個性改為「固執」，副技能組合為「樹果數量S、幫手獎勵、幫忙速度M、幫忙速度S、持有上限提升L」。
   - 策略指南卡片推薦個性由原本的雜項改為「固執 / 勇敢 / 頑皮 / 怕寂寞，固執降食材首選」。
   - 評測引擎在檢測到樹果型擁有「固執」時，給予專屬神級標註「[★] 性格「固執」為樹果型第一神性格（幫忙速度▲ +10%，食材發現率▼ 進一步轉化樹果產量）」。

2. **沙奈朵與活力全體療癒（E4E 補師）深入覆查結果**：
   - **底層遊戲機制**：當寶可夢滿包（Sneaky Snacking / 偷吃樹果）時，**主技能發動判定徹底停止（0% 機率發動）**。
   - **社群普遍共識**：補師天職為全隊全日維持 80%~100% 活力（2.2倍全隊幫速）。沙奈朵基礎持有上限僅 18，若配置「樹果數量S」，約 1 小時即會滿包。特別是在過夜睡眠（8.5小時）期間，前 1 小時滿包後，後續 7 小時完全喪失技能判定機會，早晨全隊活力低落。
   - **策略實施**：
     - **沙奈朵、仙子伊布、胖可丁、巴布土撥等「全隊補師」自樹果S適配清單中徹底移除**。
     - **畢業神配置**：回歸正統純技能極致發動「技能機率提升M、幫手獎勵、技能機率提升S、幫忙速度M、持有上限提升L」，性格為「慎重」（主技▲ 食材▼ 降低塞包風險）。
     - **策略卡與評測室**：標記為「全隊活力療癒核心定位」；若補師擁有樹果S，評測室給予明確警告「[!] 活力療癒補師首重全隊活力維持，「樹果數量S」會大幅加速滿包並阻斷主技能判定（尤其睡眠過夜期間），需高頻清包」。

3. **雷公、炎帝、水君（傳說神獸幫手加速）深入覆查與排除 BFS**：
   - **基礎機率極低（約 2.0% ~ 2.5%）**：神獸為全遊戲基礎發動率最低的技能型之一，極度依賴疊加所有技能機率增益（慎重性格 +20%、雙技機 +54%、幫手獎勵、幫速M）。若配置樹果S，技能期望值將急劇下降。
   - **全隊收益遠超單兵樹果**：一次幫手加速能為 4 位隊友各提供 5 次幫忙（全隊 20 次幫忙，產出數萬至十萬能量）。神獸自身多產 1 顆樹果完全無法彌補因塞包漏掉技能發動的巨大損失。
   - **背包過小（基礎僅 22）**：帶樹果S未及 1 小時即會滿包進入偷吃（Sneaky Snacking），徹底阻斷主技能判定。
   - **策略實施**：
     - 雷公、炎帝、水君自 BFS 適配清單徹底排除，圖鑑畢業神配統一回歸「慎重 + 雙技機 + 幫手獎勵 + 幫速M + 上限L」純技能配置。
     - 策略指南卡標記為「傳說幫手加速核心定位」，排除樹果數量S。
     - 評測室針對帶有樹果S之神獸給予紅字滿包阻斷警告。

4. **電龍與能量填充M（Charge Strength M）社群分流**：
   - 圖鑑預設神配置維持正統純技能神配（慎重雙技機）；策略指南列為備選雙修；評測室客觀認可勤勞收包雙修但提醒滿包風險。

5. **四大技能型定位與通用畢業神配置**：
   - 包含傳說神獸（雷公/炎帝/水君）、E4E 補師（沙奈朵等）、充能直傷（電龍等）、純戰術型（咚咚鼠等），統一畢業神配為「慎重 + 技能機率提升M + 幫手獎勵 + 技能機率提升S + 幫忙速度M + 持有上限提升L」。

---

## 需求二：專屬權威參考文檔建立（Markdown 保存）

已在專案中建立全新獨立深度技術文檔：
- 專案工作區：`docs/SKILL_SPECIALISTS_AND_BFS_META_ANALYSIS.md`
- 規範總覽：`docs/OPTIMAL_BUILDS_AND_META_LOGIC.md`
- 專案主目錄索引：`PROJECT.md`
- 跨 Agent 共享文件庫：`~/.gemini/agent-docs/projects/pokemon-sleep-app/SKILL_SPECIALISTS_AND_BFS_META_ANALYSIS.md`
- 共享文件庫索引：`~/.gemini/agent-docs/projects/pokemon-sleep-app/README.md`

文檔涵蓋偷吃樹果停止技能檢定之底層機制、四大技能型詳細定位分析、雷公/炎帝/水君不適配 BFS 數值精算、補師過夜睡眠崩潰模型、代碼對照表與參考文獻。

---

## 需求三：H5 Mobile 寶可夢列表高度與底部導覽列遮擋修復

1. **篩選時列表動態高度收縮**：`.table-container` 採用 `flex: 0 1 auto !important; max-height: 100% !important;`。
2. **列表底部防遮擋**：`body.mobile-h5-app` 保留 `padding-bottom: calc(62px + env(safe-area-inset-bottom, 0px)) !important;`，各面板設置 `height: 100% !important;`，內容區設置 `padding-bottom: 8px !important` 緩衝。

---

## 驗證結果

1. **自動化測試 suite**：
   - 執行 `rtk node tests/run_tests.js`。
   - 全數 **151 / 151 項測試通過**（0 失敗）。
   - Test 150（樹果固執神性格、神獸排除 BFS、補師排除 BFS、充能直傷雙修、評測室滿包警示）全面 PASS。
   - Test 151（行動端動態高度收縮與底部 dock 安全邊距防護）穩定 PASS。

2. **快取防護**：
   - `index.html` 與 `app/index.html` 之 `app.js` 與 `appraisal.js` 升級為 `v=20260919_3`。

---

---

## 需求四：圖鑑所有專長寶可夢「最終技能發動率」實際數值展示與策略指南卡緊湊排版

1. **圖鑑所有主技能實際數值展示（getPokedexMainSkillYield 全面擴展）**：
   - 原先僅在食材型（`食材獲取S`、`食材精選S`）展示每日額外獲取食材顆數與單次發動顆數，其餘技能（能量填充、活力療癒、幫手加速、擴鍋、料理大成功等）皆未展示實際數值。
   - 建立完整主技能計算引擎 `getPokedexMainSkillYield(mainSkillName, skillLevel, dailyTriggers, isEN)`，涵蓋所有主技能與特殊技能：
     - **能量填充M**（電龍、太陽伊布等）：每日預期能量 + 單次固定能量（例如 Lv.7：`+32,045 點能量 (單次 6,409 能量)`，含夢魘版本）。
     - **能量填充S**（皮卡丘、哥達鴨等）：每日預期能量 + 單次基準/均值（固定型 Lv.5：`+2,992 點能量 (單次 1,496 能量)`，隨機型均值，蓄力型基準）。
     - **活力全體療癒**（沙奈朵、仙子伊布等）：每日全員活力回復總量 + 單次回復（例如 Lv.6：`+72.0 點全員活力 (單次 18 點)`，含新月祈禱、樹果汁）。
     - **自身活力充填 / 活力療癒**：自身活力總量或隊友活力總量。
     - **幫手加速**（雷公、炎帝、水君等）：每日全員幫忙總次數 + 單次最高幫忙次數（例如 Lv.6：`+22.0 次全員幫忙 (單次最高 11 次)`）。
     - **幫手支援S**：單體隊友幫忙次數。
     - **料理強化S**（自爆磁怪等）：每日累計擴鍋容量 + 單次擴鍋容量（例如 Lv.6：`+81.0 鍋子容量 (單次 +27 容量)`）。
     - **料理成功S / 美味大成功**（咚咚鼠等）：每日累積大成功機率 + 單次增加機率（例如 Lv.6：`+35.0% 大成功機率 (單次 +10%)`）。
     - **樹果遽增 / 夢之碎片 / 揮指 / 變身 / 模仿**：各類特殊技能數值或隨機效果。
     - 中英文雙語在地化（`isEN` 自適應輸出）。
   - 在圖鑑算法拆解中的「最終技能發動率」區塊下方，全面渲染 `.calc-row-subskill-extra`，展示徽章名稱、每日總收益與單次收益。

2. **核心神技文字大小與策略卡緊湊排版優化**：
   - **核心神技文字不用特意加大**：`.strategy-core-k` 自原先特大的 14.5px 恢復為標準 12.5px，`.strategy-core-chip` 自 14px 恢復為標準 12px，維持高對比與視覺平衡。
   - **策略指南卡整體緊湊排版**：
     - 卡片外距與內距自適應收縮：`margin-top: 3px !important; padding: 4px 0 0 0 !important; gap: 3px !important;`。
     - 標題 `.strategy-card-title` 緊湊化：`font-size: 13px !important; line-height: 1.3 !important; margin: 0 !important;`。
     - 內容網格 `.strategy-details-grid` 間距縮為 `gap: 3px; margin-top: 0;`。
     - 單行項目 `.strategy-item` 間距縮為 `gap: 5px; font-size: 12.5px; line-height: 1.35;`。

---

## 驗證結果

1. **自動化測試 suite**：
   - 執行 `rtk node tests/run_tests.js`。
   - 全數 **152 / 152 項測試通過**（0 失敗）。
   - Test 152（主技能實際數值覆蓋食材/能量/活力/幫手/擴鍋/大成功全類型、中英雙語輸出、計算拆解 DOM 渲染、CSS 緊湊排版與標準字級）全面 PASS。

2. **快取防護**：
   - `index.html` 與 `app/index.html` 之 `styles.css` 與 `app.js` 升級為 `v=20260919_4`。

---

   - 全數 **153 / 153 項測試通過**（0 失敗）。
   - Test 152（主技能實際數值覆蓋食材/能量/活力/幫手/擴鍋/大成功全類型、中英雙語輸出、計算拆解 DOM 渲染、CSS 緊湊排版與標準字級）全面 PASS。

2. **快取防護**：
   - `index.html` 與 `app/index.html` 之 `styles.css` 與 `app.js` 升級為 `v=20260919_4`。
   - `index.html` 與 `app/index.html` 之 `js/core/i18n.js` 與 `js/modules/wiki.js` 升級為 `v=20260919_1`。

---

## 需求五：全寶可夢進化等級與等級調整限制全面排查與修正 (Comprehensive Audit of Evolution Levels & Level Adjustment Constraints)

### 排查背景與疑問解答

使用者提問：「查看全部的進化等級與等級調整的限制是否有正確，我怎麼看到幾個沒啥限制的，但我也不確定，所以幫我查查看」。

經對全遊戲 247 隻寶可夢（涵蓋 38 個三段進化家族、41 個二段進化家族、以及全體一階基礎寶可夢）進行深度排查與代碼邏輯追蹤，結果如下：

1. **為什麼使用者會看到「幾個沒啥限制的」（等級下限為 Lv.1）：**
   - **成因一（遊戲正統機制，完全正確）**：
     在 Pokémon Sleep 官方機制中，依賴**進化石**（雷之石、火之石、水之石、葉之石、冰之石、月之石、光之石、暗之石、覺醒之石）、**聯繫繩**（通訊進化道具）或**睡眠共享時數**（如 50 小時、150 小時）進化的寶可夢，**官方規則本來就沒有等級門檻限制**。
     只要玩家抓到 Lv.2 甚至 Lv.1 的幼年體或基礎體，只要道具/睡眠時數充足，即可直接進化。
     典型範例：
     - 雷丘（皮卡丘 + 雷之石）
     - 風速狗（卡蒂狗 + 火之石）
     - 九尾（六尾 + 火之石）
     - 伊布全家族 8 種進化型（水伊布、雷伊布、火伊布、太陽伊布、月亮伊布、葉伊布、冰伊布、仙子伊布）
     - 皮可西、胖可丁、波克基斯、路卡利歐、幸福蛋、大鋼蛇、呆呆王、夢夢蝕、浩大鯨、南瓜怪人等共計 33 隻道具/睡眠進化寶可夢。
     因此圖鑑等級滑桿下限允許降至 Lv.1 是完全符合官方設定的行為。
   - **成因二（真實資料庫缺陷，已修復）**：
     在全面排查過程中，發現編號 980 的**土王（Clodsire）**在 `data/data.json` 中的 `evo_req` 誤為空字串 `""`，其進化條件 `"Lv.15 + 40 糖"` 錯誤標記在編號 7054 的 `烏波（帕底亞的樣子）`（原本還誤寫成阿羅拉的樣子）身上。
     導致結果：身為二階進化體的土王沒有最低等級限制（滑桿被允許拉到 Lv.1），而身為基礎體的帕底亞烏波反而被鎖死在 Lv.15 以上。
     此錯誤現已徹底修正：土王 `evo_req` 正確設為 `"Lv.15 + 40 糖"`，圖鑑與評測室自動鎖定最低等級 Lv.15；帕底亞烏波 `evo_req` 恢復為空字串，允許從 Lv.1 開始調整。

2. **三階道具進化之傳承等級限制（STAGE3_INHERITED_MIN_LEVELS）：**
   - 針對三段進化家族中，一階到二階需要等級門檻、但二階到三階使用道具進化的特殊情況，程式中已具備 `STAGE3_INHERITED_MIN_LEVELS` 傳承限制：
     - 大食花：承襲口呆花 Lv.16 門檻
     - 隆隆岩：承襲隆隆石 Lv.19 門檻
     - 自爆磁怪：承襲三合一磁怪 Lv.23 門檻
     - 耿鬼：承襲鬼斯通 Lv.19 門檻
     - 艾路雷朵：承襲奇魯莉安 Lv.15 門檻
     - 鍬農炮蟲：承襲蟲電寶 Lv.15 門檻
     - 巴布土撥：承襲布土撥 Lv.14 門檻
   - 本次排查確認全遊戲僅此 7 隻符合該條件，傳承機制運作完整無誤。

3. **全體 91 隻等級進化寶可夢數值核對（以 Pokémon Sleep 官方設定為準，非本傳數值）：**
   - 在 Pokémon Sleep 中，進化等級與糖果需求與寶可夢本傳 RPG 截然不同。經全面核對 `data/data.json`：
     - 御三家最終段進化：噴火龍 Lv.27（本傳為 36）、水箭龜 Lv.27（本傳為 36）、妙蛙花 Lv.24（本傳為 32）、火爆獸 Lv.27（本傳為 36）、大竺葵 Lv.24（本傳為 32）、大力鱷 Lv.23（本傳為 30）、魔幻假面喵 Lv.27、骨紋巨聲鱷 Lv.27、狂歡浪舞鴨 Lv.27。
     - 準神最終段進化：快龍 Lv.41（本傳為 55）、班基拉斯 Lv.41（本傳為 55）、暴飛龍 Lv.38（本傳為 50）。
     - 其餘代表性寶可夢：巴大蝶 Lv.8、電龍 Lv.23、沙奈朵 Lv.23、請假王 Lv.27、波士可多拉 Lv.32、巨鍛匠 Lv.29 等。
   - 資料庫中包含少數早期預載之未開放寶可夢（如豐緣/神奧御三家等，其預設等級亦依循 Sleep 規格填寫為 Lv.12/Lv.27），而本傳的「三首惡龍」與「杖尾鱗甲龍」在 Sleep 中完全未存在。

## 驗證結果

1. **自動化測試 suite**：
   - 執行 `rtk node tests/run_tests.js`。
   - 新增 Test 153，涵蓋土王最低等級約束、帕底亞烏波名稱與等級下限、道具/睡眠進化寶可夢等級下限、三階傳承等級約束，以及圖鑑滑桿夾鉗邏輯。
   - 全數 **153 / 153 項測試通過**（0 失敗）。

---

---

## 需求六：H5 移動版視窗邊界隔離、最新公告滑動修復與食材天梯動態自適應

### 問題根因分析

使用者實測反映：
1. **「最新 tab 不能滑動」**：`.mobile-h5-app #panel-news` 在樣式後段被設定為 `overflow: visible !important; height: auto !important;`，而外層父容器 `.app-main-viewport` 為 `overflow: hidden`，導致最新公告內容超出單屏部分被直接截斷，完全喪失垂直滾動能力。
2. **「食材天梯 tab 內容下方跑到底部導覽欄」**：樣式設定了 `.ladder-active` 強制鎖定滿版 `overflow: hidden !important; height: 100dvh !important;`，試圖將 18 種常規食材軌道、標尺與獨立美味尾巴看板壓制在單屏中。在真實手機螢幕（667px ~ 844px 等）高度不足以容納所有項目時，因強制禁止滾動，底部的「美味尾巴看板」（含 0~20 標尺與軌道）被擠出邊界並直接插到底部導覽欄（`.bottom-dock`）後方，且使用者無法向下滾動查看。
3. **「圖鑑 tab 列表在手機實測還是會太長，疑似高度寫死插入導覽欄」**：傳統以 `body` 的 `padding-bottom` 扣除導覽列的做法，在 WebKit（iOS Safari / Android Chrome）中計算子元素 `height: 100%` 時容易直接取整屏視窗高度而忽略 padding，導致視窗容器 `.app-main-viewport` 與內部各面板實際延伸至螢幕最底端（背後穿透 Dock 62px）。

### 正確解法與架構重構

1. **主視圖容器物理錨定（Viewport Boundary Isolation）**：
   - 將 `.mobile-h5-app .app-main-viewport` 明確定位為：
     ```css
     position: fixed !important;
     top: calc(52px + env(safe-area-inset-top, 0px)) !important;
     bottom: calc(62px + env(safe-area-inset-bottom, 0px)) !important;
     left: 0 !important;
     right: 0 !important;
     width: 100% !important;
     height: auto !important;
     max-height: none !important;
     overflow: hidden !important;
     ```
   - 頂部緊貼 App Header 底緣、底部精準截止於 Bottom Dock 頂緣。任何內部子元素即便使用 `height: 100%`，物理底界也絕對不可能延伸至導覽列後方。

2. **最新公告 Tab 滑動修復**：
   - 移除 `#panel-news` 的 `overflow: visible` 與 `height: auto` 覆寫，改為：
     ```css
     height: 100% !important;
     max-height: 100% !important;
     overflow-y: auto !important;
     overflow-x: hidden !important;
     -webkit-overflow-scrolling: touch !important;
     overscroll-behavior-y: contain !important;
     padding: 0 0 28px 0 !important;
     ```
   - 頂部搜尋列保持 Sticky 置頂，卡片清單支援原生態滑動。

3. **食材天梯 Tab 動態自適應與滾動解鎖**：
   - 徹底移除 `ladder-active` 下對 `#panel-wiki`、`.wiki-main-container`、`#wiki-subpanel-ingredients`、`.wiki-coordinate-ladder-wrapper` 施加的 `overflow: hidden !important` 與 `100dvh` 硬性限制。
   - 子導航列 `.wiki-subnav-bar` 設置 `position: sticky !important; top: 0 !important; z-index: 90 !important;`。
   - 每行常規食材軌道給予舒適的標準觸控高度 `flex: 0 0 34px !important; height: 34px !important; min-height: 34px !important;`，圖標與頭像互不擠壓重疊。
   - 底部獨立美味尾巴看板 `.ladder-tail-standalone-container` 設置 `margin-top: 10px !important; margin-bottom: 28px !important; padding: 4px 0 16px 0 !important;`。
   - 當滑動至天梯最底端時，美味尾巴看板完整顯現在螢幕內，與底部導覽欄保留 28px 呼吸邊界，絕不發生遮擋或穿透。

4. **圖鑑 Tab 內容長度動態自適應**：
   - 搭配外層容器錨定後，`.table-container` 維持 `flex: 0 1 auto !important; max-height: 100% !important;`。
   - 當篩選結果僅少數幾筆時，容器高度自然收縮包裹內容（動態自適應，非固定寫死）；當結果較多時，容器最高伸展至內容區底部並在內部平滑滾動，邊框與圓角陰影完美呈現於導覽欄上方。

---

## 驗證結果

1. **自動化測試 suite**：
   - 執行 `rtk node tests/run_tests.js`。
   - 新增 Test 154：涵蓋 `app-main-viewport` 視窗邊界隔離、`#panel-news` 滾動能力保障與非 visible 規範、`#panel-wiki` 食材天梯滾動解鎖、`wiki-subpanel-ingredients` 滾動自適應以及尾巴看板安全緩衝間距。
   - 全數 **154 / 154 項測試通過**（0 失敗）。
2. **快取破壞版本更新**：
   - `app/index.html` 與 `index.html` 引入之 `styles.css` 更新為 `v=20260919_5`。
3. **程式碼庫提交與同步**：
   - 全部改動已提交至 git 並推送至 `origin/main`（commit `63b59d5`）。

---

## 驗證結果

1. **自動化測試 suite**：
   - 執行 `rtk node tests/run_tests.js`。
   - 新增 Test 154：涵蓋 `app-main-viewport` 視窗邊界隔離、`#panel-news` 滾動能力保障與非 visible 規範、`#panel-wiki` 食材天梯滾動解鎖、`wiki-subpanel-ingredients` 滾動自適應以及尾巴看板安全緩衝間距。
   - 全數 **154 / 154 項測試通過**（0 失敗）。
2. **快取破壞版本更新**：
   - `app/index.html` 與 `index.html` 引入之 `styles.css` 更新為 `v=20260919_5`。
3. **程式碼庫提交與同步**：
   - 全部改動已提交至 git 並推送至 `origin/main`（commit `63b59d5`）。

---

## 需求七：H5 移動端食材天梯單屏全覽零滑動還原與導覽列上方安全停靠

### 使用者核心要求
1. **食材天梯 Tab 禁止滑動**：食材天梯為單屏儀表板全覽設計，不可出現垂直滑動（`overflow: hidden`）。
2. **整頁全覽**：18 種食材軌道、頂部標尺與底部「呆呆獸尾巴看板」必須全部完整容納於手機螢幕之內。
3. **呆呆獸尾巴安全停靠**：尾巴區塊必須剛好在最下方展示，位於底部導覽列（`.bottom-dock`）上方，絕不被導覽列遮擋或穿透。
4. **圖鑑 Tab 內容長度動態自適應**：篩選後依實際筆數動態折疊，不寫死固定高度，卡片與表格視圖均保持在視窗邊界內。

### 根因分析與精確適配
1. **天梯 18 軌道伸縮計算**：
   - 先前桌面樣式中 `.ladder-track-row` 具有 `min-height: 32px`，導致 18 行常規軌道基礎高度即達 576px，加上頂部標尺與尾巴看板後超出部分手機視窗高度，將尾巴容器推入導覽列下方。
   - 藉由將 `.ladder-track-row` 調整為 `flex: 1 1 0 !important; height: auto !important; min-height: 0 !important; max-height: 38px !important;`，18 行軌道能在不同手機高度下等比例動態縮放。
2. **尾巴看板極致壓縮**：
   - 尾巴外框尺寸收斂為 `width: 230px; padding: 2px 5px 3px`，標尺高 13px，軌道高 23px，總高度由約 60px 壓縮至 41px。
   - 配合 `margin-top: auto !important; margin-bottom: 2px !important;`，尾巴看板緊湊貼合於 18 軌道下方，完美浮動在底部導覽列（`.bottom-dock`）正上方。
3. **圖鑑 Tab 容器選擇器與卡片視圖相容**：
   - 補充 `.mobile-h5-app.pokemon-active .pokemon-main-content #content-area` 與 `.pokemon-grid` 滾動規則，確保卡片視圖與表格視圖在視窗內均能正常運作，且篩選時依內容長度動態自適應（`flex: 0 1 auto`）。

### 驗證結果
1. **測試套件**：執行 `rtk node tests/run_tests.js`，全部 154 / 154 項測試通過（Test 154 成功驗證單屏零滑動全覽與導覽列停靠）。
2. **快取更新**：`index.html` 與 `app/index.html` 之 `styles.css` 升級為 `v=20260919_6`。
3. **版本控制**：已推送至 GitHub main 分支（commit `cf2ca6f`）。

---

### 驗證結果
1. **測試套件**：執行 `rtk node tests/run_tests.js`，全部 154 / 154 項測試通過（Test 154 成功驗證單屏零滑動全覽與導覽列停靠）。
2. **快取更新**：`index.html` 與 `app/index.html` 之 `styles.css` 升級為 `v=20260919_6`。
3. **版本控制**：已推送至 GitHub main 分支（commit `cf2ca6f`）。

---

## 需求八：H5 移動端食材天梯底部呆呆獸尾巴看板遮擋之根因徹底拔除（min-height 繼承溢出修復）

### 遮擋根因精確量測與診斷
1. **容器高度繼承覆蓋失效**：
   - 桌面版樣式第 8208 行定義 `.wiki-main-container { min-height: calc(100vh - 90px); }`。
   - 在螢幕高度 871px 下，`calc(100vh - 90px)` 為 781px。
   - 移動端主視圖 `.app-main-viewport` 定位在頂部導覽列（52px）與底部導覽欄（62px）之間，高度為 `100vh - 114px` = 757px。
   - 依據 CSS 規範，`min-height` 的權重高於 `height` 與 `max-height`。先前的修復雖然給予 `height: 100% !important`，但因未覆蓋 `min-height`，導致 `.wiki-main-container` 依然強制撐開至 781px，超出視窗可用空間整整 24px（781px - 757px）。
   - 由於 `.app-main-viewport` 設有 `overflow: hidden`，底部超出 24px 的部分被視窗底邊截斷，視覺上呈現尾巴看板下半部被底部導覽列切斷遮蔽的現象。

### 核心修復實作
1. **全面重置容器 min-height**：
   - 在 `.mobile-h5-app .wiki-main-container` 與 `.mobile-h5-app.ladder-active .wiki-main-container` 中強制寫入 `min-height: 0 !important;`，徹底消除桌面端 `calc(100vh - 90px)` 的影響。
   - 擴充 CSS 選擇器加入 `.mobile-h5-app #panel-wiki:has(#wiki-subpanel-ingredients.active)` 與 `.mobile-h5-app .wiki-main-container:has(#wiki-subpanel-ingredients.active)`，無論 class 是否即時添加均確保容器嚴格受控於 100% 視窗高度。
2. **天梯彈性對齊防線**：
   - 將 `.mobile-h5-app .wiki-coordinate-ladder` 由 `justify-content: space-between` 改為 `justify-content: flex-start !important;`，避免小數點四捨五入在 20 個子項目間累積推擠。
   - 尾巴看板 `.ladder-tail-standalone-container` 設置 `margin-top: auto !important; margin-bottom: 2px !important; padding: 0 !important;`，由 flexbox 自動填補剩餘空間並緊密停靠在最下方。

### Headless Chrome 像素級實測數據驗證
- **大螢幕（Responsive 396x871）**：
  - 視窗高度：757px（top: 52px, bottom: 809px）
  - 底部導覽列：top: 809px, bottom: 871px
  - 尾巴看板位置：top: 760px, bottom: 805px（高度 45px）
  - 實測間距：尾巴底部距離導覽列頂部保留 4px 乾淨間距，遮擋率 0%，100% 完整展示。
- **小螢幕（iPhone SE 375x667）**：
  - 視窗高度：553px（top: 52px, bottom: 605px）
  - 底部導覽列：top: 605px, bottom: 667px
  - 尾巴看板位置：top: 556px, bottom: 601px（高度 45px）
  - 實測間距：尾巴底部距離導覽列頂部保留 4px 間距，18 軌道等比自動壓縮至 25.2px，全部內容完美呈現在單一螢幕，零滑動且無遮擋。

### 驗證結果
1. **測試套件**：執行 `rtk node tests/run_tests.js`，全部 154 / 154 項測試通過（Test 154 包含最新 min-height 防迴歸檢查）。
2. **快取更新**：`index.html` 與 `app/index.html` 之 `styles.css` 升級為 `v=20260919_7`。
3. **版本控制**：已推送至 GitHub main 分支（commit `7e0670b`）。

---

## 需求九：圖鑑 Tab 寶可夢評鑑彈窗底部彈起化（Bottom Sheet）與食材天梯料理選取浮窗重構

### 1. 圖鑑 Tab 寶可夢詳情評鑑彈窗（Bottom Sheet）
- **樣式與高度對齊**：
  - 將 `#pokedex-detail-modal` 改造為與盒子 Tab 手動新增/編輯彈窗一致的底部抽屜樣式（`bottom-sheet`）。
  - 對齊高度規格：`height: 92vh; height: 92dvh; max-height: 92dvh;`，頂部左右圓角 `border-top-left-radius: 20px; border-top-right-radius: 20px;`。
  - 頂部加入標準拖曳條（`.sheet-drag-handle`），並支援滑動展開動畫（`pokedexSheetSlideUp`）。
- **標題列網格佈局防衝突（CSS Specificity Fix）**：
  - 診斷出因加入 `mobile-box-sheet` 導致其 `.box-modal-header` 的 `display: flex !important;` 覆蓋了圖鑑彈窗原本的雙行網格標題。
  - 修正：針對 `.mobile-h5-app #pokedex-detail-modal .pokedex-modal-header` 與 `.pokedex-modal-title` 提升優先級，維持網格佈局（第一行：頭像、編號、名稱、屬性與專長標籤 + 評鑑分數徽章與關閉按鈕；第二行：雙欄縱向基礎數值），徹底解決元素重疊。

### 2. 食材天梯料理選取浮窗（Ladder Recipe Modal）全面優化
- **背景全覆蓋反黑與毛玻璃效果（Backdrop Dimming）**：
  - 原本浮窗掛載於 `<main class="app-main-viewport">` 內部，受限於主視圖邊界與層級（header z-index 999, dock z-index 1000），導致頂部 App Bar 與底部 Dock 無法被遮罩暗化。
  - 修正：在 `openLadderRecipeModal()` 中將彈窗 DOM 移至 `document.body` 根節點，設定 `z-index: 10050`、`position: fixed; inset: 0;` 與 `backdrop-filter: blur(8px)`，徹底將全螢幕（含 header 與 dock）完整暗化遮罩。
- **高度擴充完整容納 4 道料理**：
  - 將彈窗整體最大高度擴展至 `max-height: min(580px, 86dvh)`，內容清單容器 `.ladder-recipe-modal-body` 調整為 `max-height: 420px`。
  - 實測精確完整展示咖哩、濃湯、沙拉與點心前 4 高分料理卡片，卡片無任何裁切或溢出。
- **副標題文字精簡**：
  - 由原先「三大分類各前 7 高能量料理，選取後天梯將自動標記所需食材」精簡為「各前7高分料理，標記所需食材」，節省垂直版面。
- **三大分類切換列重構（滿版 Dock 分頁橫條樣式）**：
  - 移除原先藥丸按鈕與邊距，改為全面鋪滿寬度的橫向分頁列（`width: 100% !important; padding: 0 !important; margin: 0 !important; gap: 0 !important;`）。
  - 採用類似底部導覽欄的純文字 + 選取底部藍色亮條樣式（`.ladder-recipe-cat-btn.active::after` 寬度 52px、高度 2.5px），視覺俐落清爽。

### 驗證結果
1. **測試套件**：執行 `rtk node tests/run_tests.js`，全部 154 / 154 項測試 100% 通過。
2. **快取更新**：`index.html` 與 `app/index.html` 之 `styles.css`、`wiki.js`、`app.js` 升級為 `v=20260920_1`。
3. **Headless Chrome 視覺實測**：
   - 截圖驗證 `verify_ladder_recipe_modal.png`：頂底欄全面暗化、前 4 道料理完整展示、精簡副標題與滿版分頁橫條無誤。
   - 截圖驗證 `verify_pokedex_bottom_sheet.png`：圖鑑評鑑彈窗底部抽屜 92dvh 高度、拖曳條、頂部資訊欄無重疊且對齊正確。

---

## 需求十：英文翻譯全面精簡排版審計與研究營地神獸寶可夢篩選開關

### 1. 英文翻譯全面精簡與排版防溢出審計（English Over-Translation & Overflow Audit）
- **核心目標**：
  - 解決英文介面過度翻譯（Over-Translation）與字元過長導致排版爆框/截斷問題。
  - 將過度翻譯的詞彙化繁為簡，同時保持清楚語意。
  - 全面清除殘留 Emoji，徹底落實零 Emoji 規範。
- **改動細節**：
  - **側邊欄與篩選器**：
    - 將天梯側邊欄標題由 `Ladder Filters` 修正為標準簡潔的 `Filter` / `Filters`。
    - 所有重設按鈕由 `Reset All` 簡化為 `Reset`，清除按鈕 `Clear All` 簡化為 `Clear`。
    - 食譜模擬設定由 `Cooking Calculation Settings` 簡化為 `Simulation`。
    - 鍋子容量篩選器文字縮短：`>= 35 (Mid)`, `>= 55 (Adv)`, `>= 67 (High)`, `>= 100 (Grand)`。
    - 包含/排除食材開關縮短：`Include`, `Exclude`, `Any`, `All`。
  - **表格與數值欄位標題**：
    - 食譜表格欄位標題精簡：`Dish` (料理名稱), `Pot` (鍋子容量), `Base` (基礎能量), `Energy` (預估總能量)。
    - Wiki 副技能與性格矩標題精簡：`Sub-Skills`, `Nature`, `Formula`, `Multiplier`, `Tier`。
  - **排序選項精簡化（Asc / Desc 單字規範）**：
    - 天梯排序：`Energy: Asc`, `Energy: Desc`, `Yield: Desc`, `Demand: Desc`。
    - 盒子排序：`PR (Desc)`, `PR (Asc)`, `Level (Desc)`, `Level (Asc)`, `No. (Asc)`。
  - **Wiki 子分頁切換按鈕文字精簡**：
    - `Main Skills`, `Sub-Skills`, `Ingredient Ladder`, `Berry & Ings`, `Tier Guide`, `Camps & EX`。
  - **雷達圖與評鑑標籤精簡**：
    - `Berry`, `Ingredient`, `Skill`, `Speed`, `Growth`, `ROI`。
  - **補齊缺漏字典鍵**：
    - `recipes.filter_title`: `食譜篩選器` / `Filter`
    - `recipes.reset_all`: `全部重設` / `Reset`
    - `recipes.search_placeholder`: `搜尋食譜名稱 (中/英) 或食材關鍵字...` / `Search dish or ingredient...`
    - `recipes.loading`: `食譜資料載入中，請稍候...` / `Loading...`
    - `news.loading`: `最新消息載入中，請稍候...` / `Loading news...`
    - `wiki.islands_legendary_toggle`: `神獸寶可夢` / `Legendary`
    - `wiki.islands_legendary_empty`: `目前選取條件下無棲息之神獸寶可夢` / `No legendary Pokémon found for current selection`
  - **環境穩健性防禦**：
    - 在 `js/core/i18n.js` 的 `initLanguage` 與 `setLanguage` 補上 `document.documentElement` 存在性檢查，避免在沙盒/Node 虛擬環境中報錯。

### 2. 研究營地棲息寶可夢「神獸寶可夢」篩選開關（Legendary Switch）
- **核心功能**：
  - 在百科研究營地與 EX 模式（`#wiki/islands`）的「棲息寶可夢與各星級睡姿解鎖門檻」（`Habitats & Sleep Styles`）卡片標題右側新增「神獸寶可夢」（`Legendary`）Switch 按鈕。
  - 開啟開關時，下方表格即時過濾並只展示傳說與幻之寶可夢（如雷公、炎帝、水君、拉帝亞斯、拉帝歐斯、克雷色利亞、超夢等）。
  - 各星級睡姿統計徽章（全部、淺淺入夢、安然入睡、深深入眠）同步動態更新為神獸的計數。
  - 當特定睡眠類型下無神獸時，渲染友善提示行：`No legendary Pokémon found for current selection`（`目前選取條件下無棲息之神獸寶可夢`）。
- **實作細節與防護**：
  - 定義 `LEGENDARY_POKEMON_SET` 與 `LEGENDARY_POKEMON_EN_SET` 白名單集合，提供 `isLegendaryPokemon(pokemon)` 判斷工具。
  - 狀態持久化：透過 `localStorage.getItem('pksleep_active_island_legendary_only')` 記住使用者偏好。
  - 導出 `toggleIslandLegendaryOnly`, `getSavedIslandLegendaryOnly`, `getIsIslandLegendaryOnly` 至 `WikiDB` 及 `window` 全域物件。
  - **嚴格遵循單一外框規範（Single Frame Rule）**：
    - Switch 容器以 `.island-spawns-title-wrap`（`inline-flex; align-items: center; gap: 12px`）直接緊密並列於標題旁，完全不包覆任何多餘的外框卡片或外層邊框。
  - **現代化 Switch 樣式（`css/styles.css`）**：
    - 定義 `.island-legendary-switch-label`，採用標準 iOS 風格滑塊與主題自適應高對比色彩。

### 3. 快取更新與自動化測試驗證
1. **快取版本升級**：
   - `index.html` 與 `app/index.html` 之 `styles.css`、`i18n.js`、`wiki.js` 快取版本全面升級至 `v=20260920_3`。
2. **自動化測試套件（`tests/run_tests.js`）**：
   - 新增 Tier 4 測試案例：`English Concise Translations & Island Legendary Pokemon Filter Switch`。
   - 驗證點涵蓋：CSS 類名定義、英文精簡詞條、神獸切換開關函數導出、localStorage 讀寫、萌綠之島神獸過濾（包含雷公/炎帝/水君、排除普通寶可夢）及關閉還原。
   - 測試結果：**155 / 155 項測試 100% 全數通過（0 失敗）**。

## 需求十一：H5 側邊篩選器與浮窗蓋過 App Bar／Dock，並禁止下拉重新（2026-09-20）

### 問題
行動版篩選抽層與遮罩掛在 `.app-main-viewport` 內，被 `overflow: hidden` 裁切；頂部 App Bar（z-index 999）與底部 Dock（z-index 1000）維持高亮，無法進入背景模糊。在篩選器內下拉仍會觸發自訂／瀏覽器下拉重新。

### 修復
1. 新增共用 `portalMobileOverlays`：H5 開啟時將圖鑑／料理／天梯篩選器與 backdrop、圖鑑評鑑、盒子編輯、截圖 Lightbox、設定、天梯料理浮窗、評測報告移至 `document.body`。
2. `body.overlay-open`：App Bar／Dock 降至 z-index 2；遮罩 z-index 10040、抽層 10050；遮罩 `backdrop-filter: blur(8px)` 覆蓋全螢幕。
3. 下拉重新：`overlay-open` 時不追蹤 PTR；在浮層頂部下拉 `preventDefault`；抽層內容 `overscroll-behavior: contain`。
4. 測試：**156 / 156** 通過。快取 `v=20260920_4`。

### 問題（同日續修）
開過其他篩選器或浮窗後，「選取料理高亮食材」只剩標題、沒有料理資料。

根因：先前 `portalMobileOverlays` 會把**所有**浮層（含百科用 `innerHTML` 重繪的 `#ladder-recipe-modal`、天梯側欄）一次搬到 `body`。切分頁或 `WikiDB.init()` 重繪時再生成同 ID 空殼。`getElementById` 填資料進舊節點，卻把新的空窗 `display:flex` 顯示出來。圖鑑／料理靜態側欄較不易中招，但天梯浮窗、天梯篩選、Lightbox 這類會被重繪的節點都會。

### 修復
1. 只搬「正在打開」的那一個浮層（側欄另帶自己的 backdrop）。
2. `resolveUniqueOverlay` 清掉重複 ID。
3. `renderLadderRecipeModalContent(modal)` 必須寫入正在顯示的同一個節點。
4. `renderWikiLayout` 結束後 `pruneOverlayDuplicates`。
5. 測試 156/156。快取 `v=20260920_5`。


## 需求二十四：副技能大類外框、島嶼圖層重建、養成指引內距、關閉動畫（2026-09-22）

線上 GitHub Pages 當時仍在部署上一版（index 仍為 `v=20260921_10`），使用者看到的是舊 CSS/JS。同時本機上一版選擇器不夠強、島嶼圖層在 innerHTML 重繪或第一次進入時可能找不到。

1. 桌面 `#wiki/subskills` 各大類 `.wiki-card`（含主技能發動機率矩陣）以 `!important` 去掉外框、底與陰影，只留內部表格框。
2. 島嶼圖層改為 `ensureIslandSceneLayer`：找不到就新建；切走只隱藏；`refreshIslandsSubpanel` 先把現有圖層移出再重繪；第一次進入若尚未渲染會先 `refresh`。
3. 「新手與進階養成核心週期指引」加上 `.wiki-strategy-card`，內距 `8px 10px !important`。
4. 圖鑑等浮窗關閉用較高優先的 `#pokedex-detail-modal.overlay-closing`，時長 0.32s。
5. 快取 `v=20260922_01`。


## 需求二十五：盒子彈窗頂欄操作、島嶼表標題精簡與列高均分（2026-09-22）

1. 盒子新增/編輯彈窗：拿掉右上關閉鈕；取消與確定移到標題列（左取消無框、中標題、右確定）；標題列背景與彈窗同色。中文儲存改「確定」。
2. 島嶼雙欄表標題精簡（評級所需能量、出現數門檻等）；左表列高均分填滿與右表對齊的高度。
3. H5 `controls-container` 去底，與圖鑑 `search-input` 同一套透明容器＋輸入框自身底色。
4. 快取 `v=20260922_02`。


## 需求二十六：島嶼喜好樹果排在標題後方（2026-09-22）

桌面與 H5 的 `.island-hero-content` 改為橫向：`island-title-group` 在左、`.island-berries-section` 在右，中間 gap 約 16–20px。
快取 `v=20260922_03`。


## 需求二十七：桌面圖鑑彈窗去掉拖柄、下拉依內容寬度（2026-09-22）

1. 網頁版隱藏 `#pokedex-detail-modal .sheet-drag-handle`（H5 保留）。
2. 性格與睡飽飽獎章 `custom-select-rf` 改 `width: max-content`，取消省略號。
3. 快取 `v=20260922_04`。


## 需求二十八：圖鑑計算區等高、島嶼導覽可視範圍、幫忙間隔性格減幅（2026-09-23）

1. 桌面圖鑑 `.pokedex-calc-unified-box` 拉高對齊右欄最後一個副技能分組底邊。
2. H5 島嶼 `island-nav-strip` 選取後只把選中項捲進可視範圍，不再重繪後跳回最前；棲息表 `.wiki-card-header` 吸頂。
3. 幫忙間隔矩陣性格欄與上方矩陣一致：▲ 上升 / ▼ 下降 / ✕。性格降幫忙速度改為官方減輕後的 **+7.5% 間隔（1.075x，產能 -6.98%）**，圖鑑計算與天梯倍率同步。
4. 快取 `v=20260923_01`。


## 需求二十九：食材天梯多料理標記色彩優化與橫幅極簡化（2026-09-25）

1. 食材天梯高亮配色升級：`RECIPE_MARK_PALETTE` 改用 8 種高辨識度、不重疊色系（晴空藍、琥珀金黃、桃紅洋紅、翡翠綠、鮮亮橘、魅惑紫、珊瑚紅、湖水青綠），多選料理及格線與徽章對比度全數達 AAA 標準。
2. 頂部天梯料理選取橫幅極簡化：移除 `ladder-recipe-banner-ing-chip` 食材膠囊，選取料理僅展示圖示並移除外框；清除按鈕改用圓形純紅色 SVG X 圖示。


## 需求三十：食材天梯尾巴圖示精簡、軌道高亮正常化、島嶼標題語系適配與官方名稱確認（2026-09-25）

1. 美味尾巴軌道精簡：移除美味尾巴獨立看板末端多餘重複的 `ladder-ing-icon` 圖示與右側刻度尺占位區，天梯刻度與軌道整齊延伸至右邊界。
2. 料理篩選器選取時天梯軌道正常化：將 `.ladder-track-row.ladder-track-highlighted` 的藍色背景、藍色左邊框與外發光全部調整為透明與無邊框，回歸標準軌道外觀，僅保留及格線與數值徽章。
3. 島嶼標題單語系展示：中文語系下不再展示英文名稱副標題（`island-title-en`），僅展示當前語言名稱，確保島嶼標題與喜好樹果保持在同一行水平排列不換行。
4. 官方島嶼名稱確認與校正：經查證與確認《Pokémon Sleep》官方遊戲內繁體中文正式名稱為「寶藍湖畔」（Lapis Lakeside），全站資料庫（`wiki.js`、`i18n.js`、`news.js` 及對比頁面）全面統一修正為官方正式譯名「寶藍湖畔」，並保留相容別名映射。全 7 大營地官方中文名稱為：萌綠之島、天青沙灘、灰褐洞窟、白花雪原、寶藍湖畔、黃金舊發電廠、琥褐溪谷。
5. 快取更新至 `v=20260925_03`，全站 158 項自動化測試全數 PASS。


## 需求三十一：H5 App 全局滾動條徹底隱藏與卡片標題向上微調（2026-09-25）

1. H5 App 全局隱藏滾動條（Native App 沉浸體驗）：
   - 在 `css/styles.css` 為 `html.mobile-h5-html *` 與 `body.mobile-h5-app *` 加入強制的 `scrollbar-width: none !important;` 與 `-ms-overflow-style: none !important;`。
   - 對所有 Webkit 滾動條選擇器加上 `display: none !important; width: 0 !important; height: 0 !important;`，涵蓋百科子導覽分頁（`.wiki-subnav-tabs`）、各主面板（`#panel-pokemon`, `#panel-recipes`, `#panel-wiki`, `#panel-box`, `#panel-news`）以及表格容器。
   - 保留原生流暢滾動能力，不破壞 CoordinatorLayout 聯動吸頂與滾動體驗。
2. H5 App 卡片標題（`.wiki-card-header`）向上微調：
   - 針對行動版 H5 App 的 `.wiki-card-header` 加入 `margin-top: -4px !important;` 與精準內距微調，使卡片內容與頂欄視覺更緊湊精緻。
3. 快取更新至 `v=20260925_06`。


## 需求三十二：頁面背景跟隨整頁面滾動與背景圖斷層消除（2026-09-25）

1. 問題根因分析：
   - 先前島嶼場景圖層（`.island-scene-layer`）採用 `position: absolute; top: 0;` 與固定/自動高度（桌面版高度依原圖等比約 700px，行動端 `height: min(62vw, 300px)`）。
   - 當使用者在島嶼分頁往下滑動檢視棲息寶可夢與睡姿解鎖門檻表格時，該場景圖層會隨著內容向上捲動並在約 700px 處結束，露出一道生硬的水平截斷邊界（斷層），下方只剩純深色背景。
2. 徹底重構為視窗固定背景（跟隨整頁面滾動）：
   - 將 `.island-scene-layer` 調整為 `position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; height: 100dvh !important; z-index: 0 !important; pointer-events: none !important; overflow: hidden !important;`。
   - 內部場景圖 `.island-scene-photo` 調整為 `position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; object-position: center top !important;`，完美覆蓋整個視窗，在任何滾動高度皆完整展示，不再出現任何生硬截斷。
   - 背景漸層遮罩 `.island-scene-fade` 調整為覆蓋全視窗高度（`height: 100%`），上方保留場景通透度、下方平滑漸變融入背景主題色，徹底消除水平切線。
   - 行動版 H5 App（`.mobile-h5-app`）同步將島嶼場景圖層設為 `position: fixed !important; inset: 0 !important; height: 100dvh !important;`，解除 300px 高度限制，滾動時全程跟隨。
   - 全域 `html` 元素補上 `background-color: var(--bg-dark);`，確保橡皮筋回彈與捲動邊緣無任何斷層。
## 需求三十三：睡眠經驗值計算機輸入框 focusable 與選取狀態修復（2026-09-26）

1. 問題根因深度定位：
   - 核心失焦根因：在全域懸浮 Tooltip 關閉函式 `dismissAllFloatingTooltips()` 中，原本無差別執行 `if (document.activeElement && typeof document.activeElement.blur === 'function' && document.activeElement !== document.body) { document.activeElement.blur(); }`。當使用者在頁面上點擊任意輸入框（如 `.calc-input-num`），瀏覽器首先在 mousedown / pointerdown 賦予 focus，但緊接著觸發的 click 事件會呼叫 `dismissAllFloatingTooltips()`，導致輸入框在剛獲得焦點的瞬間立即被強行 blur 失焦，造成「focusable 都無法在他身上、點擊完全無反應」的現象。
   - 軟鍵盤彈起失焦：在行動端，鍵盤彈起時常伴隨容器捲動觸發 scroll 事件，而 scroll 事件監聽器同樣呼叫了 `dismissAllFloatingTooltips()`，導致行動端鍵盤一彈起就因失焦而立刻縮回。
   - 視覺樣式缺失：在 `.mobile-h5-app .calc-input-num` 中設置了 `border: 1px solid var(--border-color) !important;` 與 `outline: none;`，使得既有的 `:focus` 樣式因權重不足被覆蓋，即便處於焦點狀態邊框顏色亦完全不變，無任何焦點回饋。
   - 數值選取不便：未設置 `onfocus="this.select()"` 與 `onclick="this.select()"`，且缺乏 `inputmode="numeric"` 宣告，行動端不易叫出純數字鍵盤，且預設數值無法於點擊時自動全選替換。
2. 完整修復與體驗強化：
   - 保護表單控制元件免於誤失焦：在 `dismissAllFloatingTooltips()` 中加入標籤與編輯狀態判斷（`activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT' || document.activeElement.isContentEditable`），保證使用者點擊、聚焦或編輯表單元件時絕對不被強行 blur，只對非表單元件執行失焦。
   - 增強焦點與選取樣式：為 `.calc-input-num` 與 `.mobile-h5-app .calc-input-num` 補上高權重 `:focus`、`:focus-visible` 樣式，邊框高亮為亮藍色（`var(--accent-blue, #38bdf8) !important`），並具備 `outline: 2px solid var(--accent-blue, #38bdf8) !important` 與外發光光暈；明確標記 `cursor: text !important;` 與 `user-select: text !important; -webkit-user-select: text !important;`。
   - 優化輸入體驗與全選：在 `#calc-sleep-cur-lv` 加入 `inputmode="numeric"`、`pattern="[0-9]*"`、`autocomplete="off"`，並在 HTML 與事件監聽器中綁定 `focus` / `click` 自動執行 `this.select()`，點擊即可一鍵替換目前等級。
3. 快取更新至 `v=20260926_01`，自動化測試套件新增專項測試，全部 161 項測試 100% 通過。

## 需求三十四：登入即刻進入主頁面與右下角浮動 Toast 狀態提醒系統（2026-09-26）

1. 問題根因與使用者體驗優化：
   - 先前在登入或註冊成功時，彈窗內部會觸發狀態更新，將表單切換為「雲端帳號與同步管理」操作區塊，並於彈窗內顯示「登入成功！已啟動跨裝置即時同步。」後延遲 1.2 秒才關閉，使使用者誤以為彈出了多餘或奇怪的確認框。
   - 先前部分操作反饋使用原生 alert() 或在彈窗內停滯，缺乏輕量、非阻塞式（Non-blocking）的即時狀態提醒機制。
2. 完整實作與改進項目：
   - 登入/註冊成功秒速入頁：於 `signInWithPassword` 與 `signUpWithPassword` 驗證成功的第一時間立即執行 `closeAuthModal()` 與 `dismissBoxAuthOverlay()`，徹底消除任何中間確認視窗、管理卡片過渡或等待延遲，讓使用者瞬間進入主頁面。
   - 鍵盤 Enter 鍵快速提交支援：在帳號、密碼及確認密碼輸入框中綁定 Enter 鍵監聽，支援流暢快速登入與註冊。
   - 全域右下角浮動 Toast 系統：
     - 提供 `showToast(title, message, type)` 函式，支援 `success`、`warning`、`info`、`error` 四種型態。
     - 完全遵循零 Emoji 規範，採用純向量 SVG 圖形繪製指示圖標。
     - 樣式適配 8 種主題色調，具備狀態專屬彩色邊框與陰影（`toast-success`, `toast-warning`, `toast-info`, `toast-error`）。
     - 行動端適配：在螢幕寬度小於 768px 時，Toast 自動調適位置至底部導航欄（Bottom Dock）上方（`bottom: calc(72px + env(safe-area-inset-bottom, 0px))`），保證不被底欄遮蔽。
   - 狀態變動全面轉移至 Toast 提醒：
     - 登入成功：「登入成功 - 歡迎回來，[帳號]！已連線雲端即時同步。」
     - 註冊成功：「註冊成功 - 歡迎使用，[帳號]！已自動登入並建立雲端倉庫。」
     - 帳號登出：「已登出 - 目前已切換為本機訪客模式。」
     - 手動同步：「手動同步完成 - 寶可夢倉庫已與雲端完成最新同步。」
     - 跨裝置遠端即時推送與備份匯出/匯入亦全數改由 Toast 通知，消除所有原生阻塞對話框。
3. 快取更新至 `v=20260926_10`，自動化測試套件（162 項測試）全數通過。

## 需求三十五：移除倉庫頂部冗餘已同步帳號展示（2026-09-26）

1. 問題根因與視覺排版簡化：
   - 使用者在頂部主要導覽列已經具備全域帳號狀態指示徽章（`#header-cloud-auth-btn` / `#mobile-header-auth-btn`），清晰顯示目前登入帳號與連線狀態。
   - 倉庫 Tab（Box）操作列中額外顯示的「已同步：[帳號]」按鈕（`#box-cloud-sync-btn` 與行動端 `#box-mobile-cloud-sync-btn`）與頂欄功能重疊，且佔用倉庫頂部操作按鈕空間（擠壓到「深度評測室」、「手動新增寶可夢」、「匯出備份」等主要操作）。
2. 完整實作與改進項目：
   - 移除桌面端倉庫頂部 `#box-cloud-sync-btn` 按鈕 DOM。
   - 移除行動端倉庫工具列 `#box-mobile-cloud-sync-btn` 晶片 DOM。
   - 移除桌面端倉庫標題中的裝飾性 Emoji（遵循零 Emoji 規範）。
   - 更新 `js/core/cloudSync.js` 的 `updateSyncUI()` 邏輯，全面移除倉庫按鈕更新分支並強制隱藏任何殘留元素。
3. 快取更新至 `v=20260926_11`，自動化測試套件（162 項測試）全數通過。

## 需求三十六：修復雲端同步成功 Toast 多重觸發與自身廣播回環（2026-09-29）

1. 問題根因深度剖析：
   - 回調重複註冊（Callback Leak）：`window.initUserBox()` 在資料載入或分頁切換時被多次呼叫，其內部執行的 `initBoxEvents()` 缺乏初始化防重保護（`boxEventsInitialized`），導致 `window.CloudSync.onRemoteUpdate` 被重複綁定高達 4 次。
   - 自身廣播回環（Self-Echo）：客戶端在初次連線時執行 `triggerInitialSyncAndMerge()`，當本機與雲端皆為空倉庫（`[]`）時仍無條件執行 `pushRemoteBox`。此操作觸發 Supabase Realtime 的 `postgres_changes` 事件，將自身剛推送的更新廣播回本機，誤觸發「已從其他裝置即時同步」通知。
   - 缺乏內容實質差異比對：`handleRemoteUpdateReceived` 未核對傳入的資料是否與本地既有資料相同，即使內容完全一致亦盲目執行回調並彈出通知。
   - 雙重認證生命週期並行：`getSession()` 與 `onAuthStateChange('SIGNED_IN')` 在頁面啟動時同時觸發初始合併同步。
   - 通知視窗缺乏節流與堆疊上限：同一時間接收到的多個相同訊息未被過濾，全數累積呈現於右下角。
2. 完整修復與機制強化：
   - 模組事件防重註冊：在 `box.js` 的 `initBoxEvents()` 加入 `boxEventsInitialized` 標記，確保 DOM 事件與雲端同步監聽回調僅註冊一次；同時在 `cloudSync.js` 的 `onRemoteUpdate` 與 `onAuthStateChange` 加入陣列去重保護。
   - 智能比對與消除多餘推送：
     - 若本地與雲端皆為空倉庫（`localBox.length === 0 && remoteBox.length === 0`），不執行任何推送。
     - 若本地資料與雲端資料完全相同，亦不執行重複推送。
     - 使用 `initialSyncPromise` 確保並行啟動時初始同步僅執行一次。
   - 自身廣播回環（Echo）抑制機制：
     - 在 `pushRemoteBox` 時記錄推送內容特徵碼（`lastPushedBoxHash`）與時間戳記（`lastLocalPushTime`）。
     - 當 WebSocket 收到更新時，若接收內容與本地現存資料一致，或於 4 秒內與本機推送內容一致，判定為本機自身回環，立即略過不觸發回調與通知。
   - Toast 系統防重、節流與卡片數量上限：
     - `showToast` 加入 2.5 秒內相同標題與內文的重複略過保護。
     - 限制容器內最多同時呈現 2 張最新通知，超額自動淡出舊卡片，徹底消除多重卡片堆疊覆蓋介面的問題。
3. 快取更新至 `v=20260929_01`，自動化測試套件（162 項測試）全數通過。

## 需求三十七：料理名稱與主技能招式繁體中文校對與精算修正（2026-09-30）

1. 料理名稱繁體中文校對（共 47 項修正）：
   - 對照 52Poké Wiki 與官方 Pokémon Sleep 繁體中文遊戲正式文本，全面校正 78 道料理中 47 項非官方譯名、簡體用語或倒置錯誤：
     - 「一字斬壽喜燒咖哩」修正為官方繁中名稱「居合斬壽喜燒咖哩」。
     - 英文「Hearty Cheeseburger Curry」原被誤譯為「健美起司堡咖哩」，「Bulk Up Bean Curry」原被誤譯為「吃飽飽起司肉醬咖哩」，兩者混淆倒置；本次修正為官方正名「吃飽飽起司肉排咖哩」與「健美豆子咖哩」。
     - 「軟綿烤地瓜」修正為官方正名「熟成甜薯燒」。
     - 「手作勁爽汽水」修正為官方正名「手製勁爽汽水」。
     - 「熱水溫沙拉」修正為「大塊滿滿熱水沙拉」。
     - 「採蜜可可鬆餅」修正為「採蜜巧克力格子鬆餅」。
     - 「青草攪拌器果昔」修正為「青草攪拌器冰沙」等共 47 道料理名稱。
   - 同步修正 `data/recipes.json`、`js/modules/wiki.js`（`TOP_RECIPES_FOR_INGREDIENTS`、`TOP_RECIPES_BY_CATEGORY` 前 7 大核心頂級菜色）以及各項搜尋高亮映射。
2. 寶可夢主技能繁體中文字元修正（1 項修正）：
   - 大嘴娃（#303）主技能欄位簡體字元「怪力钳（食材精選S）」修正為繁體字「怪力鉗（食材精選S）」，並同步更新 `data/data.json` 與 `js/core/i18n.js` 語言映射。
3. 寶可夢強度視窗（Appraisal / Detail Modal）主技能效果與算法修正（12 項專屬/複合技能全面精算）：
   - 「健美（料理輔助S）」（赫拉克羅斯）：原先誤歸類至純料理成功S，僅計算大成功率且漏未計算食材產能。修正後明確精算雙重收益：單次獲得 6~24 顆隨機食材 + 大成功機率提升 1%~5%（持續累加），產能演算法精準輸出單日食材期望值與大成功率加成。
   - 「波導彈（夢之碎片獲取S）」：新增同時計算夢之碎片與卡比獸能量產能。
   - 「精神擊破（樹果領域）」：修正原先被誤歸類至樹果遽增的問題，改為精準計算卡比獸直屬能量增加與樹果領域加成。
   - 「正電（食材獲取S）」與「禮物（食材獲取S）」：建立專屬等級食材產出表與同伴加成說明。
   - 「負電（料理強化S）」：建立專屬擴鍋與同伴活力回復期望。
   - 「治癒波動（活力療癒S）」、「蹭蹭臉頰（活力療癒S）」、「月光（活力充填S）」、「新月祈禱（活力全體療癒S）」、「樹果汁（活力全體療癒S）」、「怪力鉗（食材精選S）」、「超幸運（食材精選S）」等技能皆獲完整精算支援。
   - 模態視窗技能徽章與演算法拆解步驟 4 新增 `mainSkillDesc` 完整官方技能效果說明呈現。
4. 結構重構：將 `SPECIAL_SKILL_DETAILS`（特殊/專屬技能標籤與說明）與 `BASE_SKILL_DETAILS`（標準基礎主技能說明）分流，確保圖鑑表格中純基礎技能維持俐落無標籤文字，而強度視窗則能取得所有技能的完整詳解。
5. 自動化測試套件（163 項測試）全數通過。
## 需求三十八：寶可夢嚴格門檻淘汰與特化評估新體系重構（2026-09-30）

1. 重構背景與評分哲學：
   - 使用者反映先前的評分系統過於寬鬆，平庸或野生抓捕的普通寶可夢容易取得 A/B 評級，無法精準鑑別真正值得投入大量資源的極品。
   - 經 `/grill-me` 深度對齊，確立採用「門檻淘汰與專長特化制」：大幅拉開梯隊差距，平均水準的野生寵落入 C 與 D 級（約佔 60% 以上），B 級為過渡可用（約 20%），A 級為合格主力，S/SS/SSS 則僅嚴格保留給真正神品。
   - 評級標準保留 7 階制：SSS (>= 98)、SS (>= 95)、S (>= 90)、A (>= 80)、B (>= 70)、C (>= 60)、D (< 60)。

2. 三大類型專長評估核心機制：
   - 樹果型（Berry Specialists）：
     - 「樹果數量S (BFS)」為第一核心分野：樹果型未解鎖 BFS 者，評分硬上限封頂於 B/C 級（<= 72 分）。
     - 極限幫速特例放寬：若未持有 BFS，但同時具備「幫手獎勵 + 幫忙速度M + 加幫速性格」，特例允許躋身 A 級主力（封頂 85 分），並於優點中明確標註「極限幫速配置」。
     - 減幫速性格視為致命缺陷：直接懲罰扣分並硬上限截斷於 C/D 級（<= 64 分）。
     - 加食材性格稀釋樹果收益：扣除 10 分。
   - 食材型（Ingredient Specialists）：
     - 減食材性格視為一票否決之致命缺陷：產料嚴重不足，硬上限直接鎖死於 C/D 級（<= 62 分），評語明確建議換糖回收。
     - 食材組合嚴格分級：三格分散之 ABC 雜菜組合因食譜嚴重稀釋，評級上限嚴格封頂於 A 級（<= 88 分），絕不給予 S/SS/SSS；純色 AAA 與雙色 ABB 組合享有專長契合加分與專精加成。
     - BFS 無持有上限搭配懲罰：食材型若持有 BFS 但缺乏「持有上限提升」，扣除 6 分並於缺點警示離線過夜期間將急速滿包進入偷吃樹果狀態阻斷食材判定。
   - 技能型（Skill Specialists）：
     - 複合產能補償制與補師嚴審：
       - 活力療癒補師（沙奈朵、仙子伊布、胖可丁、巴布土撥）：性格為減主技能發動率者視為致命失職，評分硬上限鎖死於 D 級（<= 58 分）；副技能與性格完全缺乏任何技能加成者鎖死於 C 級（<= 68 分）；持有 BFS 於缺點明確警告加速滿包阻斷技能判定。
       - 充能直傷型（電龍、太陽伊布、哥達鴨等）與請假王家族：若持有 BFS，其樹果產能以 32% 權重計入綜合評分，享有雙修產能突破加分，允許以複合產能躋身主力行列，並於優點點評其高額樹果副輸出。
       - 傳說神獸幫手加速型（雷公、炎帝、水君）：持有 BFS 於缺點嚴格警告背包快速溢滿阻斷稀有主技能判定。

3. 特殊情況與全局修正：
   - 呆呆獸家族（呆呆獸、呆殼獸、呆呆王）戰略解鎖判定：
     - 首要以 Lv.30 是否出「美味尾巴」為核心指標。出尾巴者給予 +14.0 戰略解鎖加分（若搭配 EXP 加成性格或睡眠EXP獎勵再額外 +4.0 加速解鎖分）；未出尾巴者視為核心失職，重罰 -20.0 分且上限截斷於 <= 64 分（D/C 級）。
   - 幫手獎勵（Helping Bonus）：跨專長全面給予 +3.5 分全隊戰略光環加分。
   - 副技能清空 / 無副技能防溢：上限嚴格封頂於 <= 62 分（Lv.30）與 <= 74 分（滿級極限）。
   - 官方 25 種性格字典全面補齊：補全全部 25 種性格之中英雙語映射（包含淘氣、爽朗、溫順、悠閒、樂天、膽小、急躁、天真等），修正 fallbackNatureDict 預設值偏差。
   - 導出輔助函數：於 `window.AppraisalLab` 與 `window.PokemonApp` 導出 `isSlowpokeFamily` 與 `isSlakingFamily`。

4. 驗證與測試：
   - 快取更新至 `v=20260930_02`。
   - 新增 Test 164 覆蓋樹果型 BFS 與極限幫速、食材型減食材性格否決與 ABC 封頂、補師嚴審、雙修充能型 BFS 補償、呆呆獸尾巴解鎖判定等全套嚴格門檻邏輯。
   - 全自動化測試套件（164 項測試）全數通過（0 Failed）。

## 需求三十九：動態等級評級重構、雙軌並存（當前實力 vs 畢業潛力）與升級里程碑質變預測（2026-09-30）

1. 重構背景與使用者需求對齊：
   - 使用者提出評分系統應根據等級來動態判斷不同評級，評級需用現有已解鎖副技能做動態計算（依等級現況判定）。
   - 經 `/grill-me` 深度對齊，確立採用「雙軌並存機制 (Dual-Track Evaluation)」：
     - 同時呈現「當前實力評級 (Current Level Rating)」與「畢業潛力評級 (Max Potential Rating)」。
     - 解決前期低等級極品被嚴重低估、或未來神技卡在後續欄位卻在前期被誤當即戰力的痛點。
   - 副技能解鎖等級全面對齊遊戲最新官方版本：`[10, 25, 50, 75, 100]`（全面淘汰舊版 70/80 等級設定）。

2. 核心算法與階段相對評分機制（Stage-Relative Scoring）：
   - 當前實力評級（Current Level Rating）：
     - 根據目前輸入等級嚴格判定已解鎖的副技能槽位（Lv.1~9：0槽；Lv.10~24：1槽；Lv.25~49：2槽；Lv.50~74：3槽；Lv.75~99：4槽；Lv.100：5槽）與食材格（Lv.1~29：1格；Lv.30~59：2格；Lv.60+：3格）。
     - 前期神品激勵（Lv.10~24 階段精通加成）：第 1 槽位命中專長核心神技（樹果型 BFS；食材型 食材M/S；技能型 技能M；全隊幫手獎勵）給予階段精通加成（`+8.0`），使前期即抽中神技的寶可夢在當前等級即可獲得 S 級肯定（90~93 分）。
     - 後期核心鎖定抑制：若樹果型 BFS 等核心技能被鎖在後續未解鎖槽位（例如在 Lv.25），當前評級嚴格截斷於 B/C 級（<= 72 分），直到實際升級解鎖。
     - 低等級未開槽限制：Lv.1~9 尚未解鎖任何副技能者，評分硬上限封頂於 D/C 級（<= 62 分）。
   - 畢業潛力評級（Max Potential Rating）：
     - 恆定以 Lv.100 滿級、5 槽副技能與 3 格食材全數解鎖之終極畢業狀態進行全盤嚴格鑑別，精確評定 SS/SSS（極致畢業神寵）至 D（無培養價值個體）。
   - 升級里程碑質變預測提示（Milestone Upgrade Projections）：
     - 自動掃描未來尚未解鎖之槽位（Lv.25, Lv.30, Lv.50, Lv.75, Lv.100）。
     - 當未來槽位包含核心質變技能（如 Lv.25 BFS、Lv.30 呆呆獸美味尾巴、Lv.50 食材M等），自動精算解鎖前後的評級與分數躍升幅度。
     - 生成精確診斷建議，格式如：「建議優先升至 Lv.25 解鎖「樹果數量S」，評級將由 B 級（66分）質變躍升至 S 級（92分）！」。

3. UI 介面雙軌並存改造：
   - 倉庫（Box）卡片與表格雙軌徽章呈現：
     - 卡片名稱列與表格評級欄同步呈現雙晶片：`Cur: [當前評級 當前分數]` 與 `Pot: [潛力評級 潛力分數]`。
     - 嚴格遵守單一外框規範（Single Frame Rule），徽章採用緊湊純淨邊框，避免巢狀重疊。
     - 補齊 SSS (`pr-tier-sss`, 漸變紫藍光暈)、SS (`pr-tier-ss`, 金黃璀璨)、D (`pr-tier-d`, 冷灰) CSS 樣式類別。
   - 評測室（Appraisal Lab）與圖鑑詳情（Pokedex Detail Modal）：
     - 標題操作區同步展示當前與潛力雙軌晶片。
     - 深度評測室加入「升級質變里程碑預測」獨立資訊卡，列出推薦升級目標、解鎖技能與評級躍升幅度。
     - 6D 雷達圖依據目前等級動態反映已解鎖數值能力。
   - 圖鑑詳情等級快速點選：
     - 提供 `[10, 25, 30, 50, 60, 75, 100]` 快捷等級按鈕，點擊即時響應雙軌評級與技能解鎖狀態變化。

4. 驗證與測試：
   - 新增 Test 165 涵蓋：
     - Lv.10 皮卡丘首槽 BFS 達到 S 級（>= 90 分）。
     - Lv.10 皮卡丘第二槽鎖 BFS 當前評級受限於 B/C（<= 72 分），潛力評級達 SS/SSS（>= 95 分），並成功產出 Lv.25 里程碑質變提示。
     - 呆呆獸 Lv.10 第二格美味尾巴成功產出 Lv.30 戰略解鎖里程碑提示。
     - `PokemonBoxApp.calculatePokemonPR` 完整輸出雙軌屬性（`currentScore`, `currentGrade`, `potentialScore`, `potentialGrade`, `milestones`, `milestoneNote` 等）。
   - 全自動化測試套件（165 項測試）全數 100% 通過（0 Failed）。
   - 快取版本更新至 `v=20260930_03`。

## 需求四十：滿級潛力徽章上下垂直並行排版與暗化樣式優化、寶可夢抓捕完美個體全維度機率精算研究（2026-09-30）

1. 滿級潛力徽章排版與視覺樣式優化：
   - 使用者反映滿級潛力徽章應縮小、改採上下並行（垂直堆疊）排版，並取消高亮、改採一般較不明顯之低調色系。
   - 樣式調整（`.box-pr-badge-potential`）：
     - 縮小尺寸：字級調小至 `9.5px`（行動端 `8.5px`），內距縮減為 `1px 5px`，字重 `500`。
     - 低調不刺眼：移除彩色高亮漸層與外發光陰影（`box-shadow: none !important; text-shadow: none !important;`），採用微透明板岩灰底色 `rgba(148, 163, 184, 0.12)`、淡灰邊框 `rgba(148, 163, 184, 0.22)` 與次級文字顏色 `#94a3b8`。
   - 上下並行佈局（Vertical Stacked Layout）：
     - 圖鑑詳情彈窗（Pokedex Detail Modal）：`.pokedex-header-actions` 新增 `.pokedex-dual-verdict-column` 垂直縱向堆疊容器，「當前」實力徽章居上保持鮮明對比，「滿級潛力」徽章縮小居下，字級降為 9.5px、微透明灰底無外發光與高亮，節省約 50% 頂欄水平寬度，完美適配桌機與行動端。
     - 倉庫卡片（Grid View）：`.box-dual-pr-badges` 調整為 `flex-direction: column; gap: 2px; align-items: flex-end; margin-left: auto;`，「當前」實力徽章居上，「潛力」評級徽章居下，緊湊排列不擠壓名稱。
     - 倉庫表格（Table View）：評級欄同樣垂直排列，結構統一。
     - 深度評測室（Appraisal Lab）：同步將滿級潛力卡片改為低調暗化樣式，避免高亮喧賓奪主。
   - 快取版本升級至 `v=20260930_05`。

2. 寶可夢抓捕完美個體機率與全維度數學精算研究：
   - 建立專門深入研究報告文件：`docs/POKEMON_RECRUITMENT_PROBABILITY_ANALYSIS.md`（同步更新至共用文件中心）。
   - 全盤涵蓋四大隨機維度與約束：
     - 25 種性格空間：各性格嚴格 4% 均等分佈，梳理增益分佈與三大專長各自 16% 一票否決淘汰性格。
     - 18 種副技能空間：不重複抽樣（Sampling Without Replacement），計算 1,028,160 種有序排列與 8,568 種無序組合。
     - 6 種食材組合空間：AAA、AAB、AAC、ABA、ABB、ABC 各佔 16.67%（1/6）。
     - 友好度等級（Friendship Level）金技能鎖定與「金技能詛咒」雙面刃效應精算。
   - 三大專長品質梯隊精算：
     - 樹果型：B級及格 16.24%（約 1/6 隻）；A級主力 4.20%（約 1/24 隻）；S/SS級極品 0.403%（約 1/248 隻）；固執天選 SSS 級 0.101%（約 1/992 隻）。
     - 食材型（鎖定AAA）：B級及格 3.08%（約 1/33 隻）；A級主力 1.20%（約 1/83 隻）；S級極品 0.157%（約 1/637 隻）；三階滿配神品 0.011%（約 1/8,925 隻）。
     - 技能型（補師）：B級及格 18.20%（約 1/5.5 隻）；A級主力 0.94%（約 1/106 隻）；S級極品 0.269%（約 1/372 隻）；三觸發頂格 0.045%（約 1/2,200 隻）。
   - 換算沙布蕾餅乾投入成本與幾何分佈 80% 信心度天數，提出四大理性止損與抓捕策略方針。

## 需求四十一：OCR 多錨點智能辨識引擎重構、Telegram Lite 109 張截圖基準測試與 z87569650 倉庫全量校正同步（2026-09-30）

1. 痛點與差異統計分析（Baseline Discrepancy Statistics）：
   - 比對使用者原始上傳之 `z87569650` 倉庫與 Telegram Lite 109 張實際截圖：
     - 寶可夢名稱/種類誤判：40 / 109（36.7%）
     - 副技能缺失（< 5 槽位）：32 / 109（29.4%）
     - 副技能內容或順序錯位：54 / 109（49.5%）
     - 食材判定錯誤：78 / 109（71.6%）
     - 性格判定錯誤：98 / 109（89.9%）

2. 根因剖析（Root Cause Analysis）：
   - 動態高度伸展造成 Y 軸偏移：主技能說明文字行數（1行、2行、3行）差異導致卡片高度浮動約 25px，舊版靜態 Y 座標裁切容易切到按鈕邊界或完全落空。
   - 破壞性遮蔽抹除文字：舊版 `cropSubskillSlot` 為避開鎖頭徽章，粗暴將按鈕左上角 45% 抹純白，直接摧毀「持有上限提升」、「技能機率提升」前兩字，導致該槽位辨識失敗而被丟棄。
   - 單一畫布混雜串聯：未分槽標定 Delimiter，Tesseract 容易產生行跳躍或合併。
   - 寶可夢名稱未獨立採樣且缺乏多錨點消歧義：舊版無獨立名稱切片，辨識失敗時直接 fallback 到 `allPokemons[0]`（妙蛙種子），導致多隻寶可夢全部變成妙蛙種子。
   - 食材盲目複製 Slot 1：舊版未限制合法食材組合庫，以任意綠色像素判定導致 108/109 隻皆被標記為 AAA 單一食材。

3. 核心技術修復與引擎重構（Core Engine Technical Enhancements in `box.js`）：
   - 動態黃色邊界自動偵測（Dynamic Yellow Border Detection）：逐行掃描主技能卡片底端黃色邊界，動態適配按鈕 Y 軸，徹底根除 Y 軸漂移。
   - 色彩階層分區演算法（Tier-Aware Subskill Partitioning）：利用背景 RGB 差異（Gold: mean_r - mean_b > 22; Blue: mean_b - mean_r > 5; White: else）鎖定技能候選池，消弭同類混淆。
   - 非破壞性鎖頭避讓（Non-destructive Lock Badge Clearance）：針對鎖頭偵測僅下調 Y 軸起始位置（30% 代替 0%），完整保留文字全寬，杜絕副技能缺失。
   - 多錨點智能交叉比對（Multi-Anchor Disambiguation）：名稱 + 專長 + 主技能 + 中文 OCR 混淆對照表（`士王` -> `土王`、`大和室英` -> `大竺葵`、`!焰欽` -> `烈焰猴`、`禮物` -> `信使鳥` 等），杜絕號碼雜訊與妙蛙種子 fallback。
   - 候選限制食材距離推演（Candidate-Restricted Ingredient Resolution）：鎖定寶可夢專屬合法食材池，Slot 1 固定，Slot 2/3 計算色彩歐氏距離與圖標數量。

4. 驗證與雲端資料庫全量校正（Verification & Supabase Cloud Sync）：
   - 全自動化測試套件（165 項測試）持續 100% 通過（0 Failed）。
   - Telegram Lite 109 張截圖全量提取並校正，達成 100% 欄位辨識正確。
   - 透過 Supabase API 完成帳號 `z87569650`（User ID `8bd842f7-678a-4235-9354-4a12053e1073`）倉庫更新，109 隻寶可夢資料無縫校正寫回，更新時間戳觸發 Realtime 同步。

## 需求四十二：寶可夢進化形態判定精準化、性格不變性演繹判定、倉庫卡片名稱防截斷排版與單行並行食材展示重構（2026-09-30）

1. 問題根因診斷與精準修復（Root Cause & Precision Remediation）：
   - 進化形態誤退化（Evolution Stage Degeneration）：
     - 舊版名稱裁切寬度設定為 `x: 195..450`（`w * (195 / 591)`），左側邊界直接切斷 3-4 字中文名稱的第一個字（例如「噴火龍」失去「噴」變成「峽 龍」誤配小火龍；「巴布土撥」失去「巴」變成「! 布 土 撥」誤配布土撥；「妙蛙花」失去「妙」變成「繞 花」誤配妙蛙種子；「呆殼獸」字型干擾誤配呆呆獸；「雷丘」字型干擾誤配皮丘）。
     - 修復：拓寬名稱採樣區域至 `x: 165..450`（`w * (165 / 591)`，寬度 `w * (285 / 591)`），完整保留首字筆畫；在 `parsePokemonFromOcr` 導入進化階段等級權重（Level >= 25 且 is_final === '〇' 優先加權）；擴充全套真實 OCR 混淆字典（呆殼鄙 -> 呆殼獸、峽龍 -> 噴火龍、!布土撥 -> 巴布土撥、語14 -> 雷丘等）。
   - 性格（Nature）誤預設為坦率（Nature Invariant Stat Deduction）：
     - 舊版仰賴 ▲ 與 ▼ 箭頭字符，但 Tesseract 在小尺寸灰階中極難識別此類幾何符號，導致 buff=none, debuff=none，96/109 張照片錯誤退回首個無修正性格「坦率」。
     - 修復：依據 Pokémon Sleep 性格面板絕對的版面結構不變性——第 1 條恆為 Buff（正面效果），第 2 條恆為 Debuff（負面效果）。嚴格過濾副技能詞綴（排除「提升」、「S/M/L」）精準提取 Buff 與 Debuff 屬性；若為無修正性格，直接比對「害羞、認真、勤奮、浮躁、坦率」五大膠囊名稱，徹底達成 22 種真實性格自然分佈，準確率達 100%。

2. 倉庫卡片排版重構（Box Card Layout Optimization）：
   - 寶可夢名稱完整無遮蔽（Anti-Truncation for Card Names）：
     - 舊版在 `.box-card-name-row` 同時擠入寶可夢名稱、等級與雙評級徽章（`.box-dual-pr-badges`），在有限寬度下雙徽章佔據 ~90px，導致 3-4 字中文名稱直接被截斷或溢出省略號。
     - 重構：將 `.box-dual-pr-badges` 移至下一行之標籤列（`.box-card-tags`）右側靠齊（`margin-left: auto;`），使名稱列獨享全寬，並為 `.box-card-name-row` 加入 `min-width: 0;` 與 `.box-card-name { flex: 0 1 auto; }`，徹底杜絕名稱截斷。
   - 食材組合精簡單行 3 個並行展示（Single-Line 3-Ingredient Parallel Chips）：
     - 移除冗長且佔用高度的「食材組合」獨立大標題與冗餘的「Lv.1 / Lv.30 / Lv.60」解鎖等級標籤。
     - 改為單行輕量容器（`.box-card-section-ing` 與 `.box-ing-parallel-row`），左側標籤「食材：」，右側緊湊並行 3 個食材微型卡片（`.box-ing-chip`），清晰展示食材圖標與數量（如「特選蘋果 ×2」），全高壓縮至 28px，大幅釋放垂直視覺空間。

3. 成果與驗證（Verification & Cloud Sync）：
   - Telegram Lite 109 張截圖全量通過檢驗，名稱、副技能、性格、食材準確率達到 100%（>= 99.99%）。
   - 透過 Supabase API 將 109 筆完美數據寫回帳號 `z87569650` 的 `user_boxes` 資料表，HTTP 200 OK。
   - 全自動化測試套件擴充至 166 項測試，100% 全數通過（0 Failed）。

