# 專案進度與修復確認紀錄 (Project Progress & Walkthrough)

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
