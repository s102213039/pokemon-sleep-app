# 技能型寶可夢與「樹果數量S（BFS）」適配深度研究與特殊戰略型技術規範

> [!NOTE]
> 本文檔為《Pokémon Sleep》所有技能型寶可夢（Skill Specialists）在副技能「樹果數量S（Berry Finding S, 簡稱 BFS）」適配性、特殊戰略型（Special Strategic Archetypes）、底層遊戲判定機制、數值期望精算與社群研究結論之權威技術參考標準。
> 用於指導圖鑑畢業神配置（God Preset）、寶可夢策略指南卡片（Strategy Card）以及深度診斷評測室（Appraisal Lab）的評估模型。

---

## 一、 核心底層遊戲機制：技能判定與庫存管理引擎

在《Pokémon Sleep》的幫忙判定與庫存管理引擎中，存在兩項決定技能型寶可夢產能的底層鐵律：

### 1. 滿包偷吃機制（Sneaky Snacking）對主技能判定的徹底阻斷
* **判定順序**：寶可夢每次幫忙時，先依據機率判定產出「樹果」或「食材」，接著判定是否「觸發主技能」。
* **庫存已滿的狀態轉變**：當寶可夢的背包達到持有上限（Carry Limit）時，系統會強制將後續產出的樹果轉化為「樹果偷吃（Sneaky Snacking）」直接加至卡比獸能量，且不再保留食材。
* **致命後果**：**一旦進入偷吃狀態，系統將徹底停止進行任何主技能發動檢定（Skill Trigger Checks = 0）！**
* **樹果數量S對傳統技能型的負面效應**：樹果數量S使每次幫忙的樹果產量從 1 顆增加至 2 顆（產量直接翻倍）。這使寶可夢背包塞滿的時間縮短一半以上。一旦無人清包，主技能檢定便立刻歸零。

### 2. 五個副技能槽位的極限機會成本（Opportunity Cost）
* 每隻寶可夢至 Lv.100 僅能解鎖 5 個副技能，前 3 格（Lv.10, Lv.25, Lv.50）更是前中期實際生效的命脈。
* 技能型寶可夢的立足之本為「主技能發動期望值」。
* 任何技能型寶可夢若配置了「樹果數量S」，就必定會排擠掉以下關鍵技能之一：
  1. **技能機率提升M/S（Skill Trigger M/S）**：+36% / +18% 技能發動率。
  2. **幫手獎勵（Helping Bonus）**：全隊 5 隻幫忙速度提升 5%（相當於全隊 25% 幫速增益，並具備疊加優勢）。
  3. **持有上限提升L/M（Inventory Up L/M）**：直接延後滿包時間，極大化離線與過夜睡眠期間的主技能累積次數。
  4. **幫忙速度M（Helping Speed M）**：+14% 幫忙速度，直接提高幫忙檢定總次數。

---

## 二、 全面盤點：十大戰略型技能定位深度分析

---

### 定位 1：樹果遽增型（Berry Burst Specialists）
* **代表寶可夢**：謎擬Q（Mimikyu）、蜥蜴王（Sceptile）、烈焰猴（Infernape）、勇士雄鷹（Braviary）、拉帝歐斯（Latios）。
* **核心機制**：
  - 主技能「樹果遽增」或專屬變體（如謎擬Q之「畫皮」、拉帝歐斯之「流星群」）會在觸發時直接產生大量樹果直送卡比獸，並複製隊友樹果。
  - **謎擬Q「漂亮成功（Great Success）」**：機率性觸發翻倍樹果爆發。
  - **樹果週（Berry Week）加成**：樹果遽增產出受活動 1.4 倍樹果能量倍率加成。
* **樹果數量S（BFS）適配性：[★] 極致神配（Mandatory / Core）**
  - 此類型本質為「以技能驅動的高階樹果砲台」。
  - 自身幫忙產出與主技能爆發緊密結合，樹果數量S為此類寶可夢的絕對畢業核心副技能。
  - **畢業神配置**：`慎重性格 + 樹果數量S + 技能機率提升M + 幫手獎勵 + 幫忙速度M + 持有上限提升L`。

---

### 定位 2：能量填充S/M 雙修直傷型（Charge Strength S/M Specialists）
* **代表寶可夢**：電龍（Ampharos）、太陽伊布（Espeon）、哥達鴨（Golduck）、樹才怪（Sudowoodo）、隨風球（Drifblim）、音波龍（Noivern）。
* **核心機制**：
  - 滿級能量填充M提供高額單體直傷能量（Lv.7 單次提供 6,409 點能量）。
  - 哥達鴨具備全遊戲最高頻發動率（每日可達 5~7 次）。
* **雙軌體系（Dual-Track Meta）**：
  1. **純技能極限砲台（Pure Skill Cannon）**：
     - 追求最高發動期望值，避免任何滿包阻礙。適合離線與過夜睡眠。
  2. **BFS 雙修島嶼砲台（BFS Hybrid Island Cannon）**：
     - 在喜好樹果島嶼（如電龍於黃金舊港發電廠、太陽伊布於青綠之島/拉碧絲湖畔），配置樹果數量S後，每小時樹果能量直接媲美主力樹果型。
     - **前提條件**：玩家必須勤於日間收包（每 45~60 分鐘清包一次），防止滿包偷吃阻斷主技能判定。

---

### 定位 3：傳說神獸與幫手加速型（Helper Boost / Legendaries）
* **代表寶可夢**：雷公（Raikou）、炎帝（Entei）、水君（Suicune）、風速狗（Arcanine）、雷伊布（Jolteon）、艾路雷朵（Gallade）。
* **傳說神獸專屬特殊機制**：
  - 超夢（Mewtwo - 精神擊破）、夢幻（Mew - 十項全能）、克雷色利亞（Cresselia - 月光療癒）、達克萊伊（Darkrai - 惡夢壓制）。
* **隊伍協同與樹果數量S精算鐵律**：
  - **神獸自身嚴禁 BFS**：傳說神獸基礎技能發動率極低（約 2.0%~2.5%），背包極小（基礎約 22）。帶 BFS 容易滿包阻斷技能判定。
  - **隊友全員必備 BFS**：幫手加速發動時，隊友全員進行 4~6 次幫忙。若 4 位同屬性主力隊友（如水君隊之大力鱷）均帶 BFS，單次技能即可瞬間產出 40~60 顆加成樹果，總收益達數萬能量。

---

### 定位 4：活力全體療癒補師（Energy for Everyone Healers）
* **代表寶可夢**：沙奈朵（Gardevoir）、仙子伊布（Sylveon）、胖可丁（Wigglytuff）、巴布土撥（Pawmot）。
* **核心機制**：全隊 5 隻寶可夢的「活力心臟」。維持全員活力 80%~100% 以上，常駐 2.2 倍最高幫忙速度。
* **樹果數量S適配性：[!] 嚴格排斥**
  - 過夜 8.5 小時睡眠期間，若帶 BFS 會在 1 小時內塞滿背包，導致後續 7 小時完全喪失技能判定，早晨全隊活力崩盤。

---

### 定位 5：料理大成功爆擊型（Extra Tasty / Dish Crit Specialists）
* **代表寶可夢**：咚咚鼠（Dedenne）、古月鳥（Cramorant）。
* **核心機制**：發動「料理成功S」，累積大成功機率直至觸發（週末大成功最高可達 3 倍能量）。
* **樹果數量S適配性：[!] 嚴格排斥**
  - 基礎持有上限極低（僅約 14），帶 BFS 會極速滿包，喪失戰術價值。

---

### 定位 6：料理擴鍋戰術型（Pot Expander Specialists）
* **代表寶可夢**：自爆磁怪（Magnezone）、火伊布（Flareon）、冰伊布（Glaceon）。
* **核心機制**：發動「料理強化S」，累計擴大下一餐鍋子容量，用於煮出高耗材大料理或週末突破極限。
* **配置原則**：極端追求技能發動次數與持有上限，確保連續技能累積。

---

### 定位 7：夢之碎片收割型（Dream Shard Magnet Specialists）
* **代表寶可夢**：路卡利歐（Lucario）、貓老大（Persian）、勾魂眼（Sableye）、吞食獸（Swalot）。
* **核心機制**：發動「夢之碎片獲取S」，提供大量夢之碎片。
* **戰略地位**：隨玩家研究等級提高，夢碎隨機產出急遽攀升，為解鎖等級上限、活動糖果強化（Candy Boost）不可或缺的經濟型支援。

---

### 定位 8：食材獲取 / 食材精選型（Ingredient Magnet / Draw Specialists）
* **代表寶可夢**：水伊布（Vaporeon）、請假王（Slaking）、袋獸（Kangaskhan）、赫拉克羅斯（Heracross）。
* **核心機制**：單次發動直接隨機獲得 6~21 個食材，迅速填滿背包與鍋子。
* **特殊案例**：請假王具備極高持有上限與極高技能觸發率，可兼職食材補充與樹果輸出。

---

### 定位 9：隨機揮指戰術型（Metronome Specialists）
* **代表寶可夢**：波克基斯（Togekiss）、皮可西（Clefable）。
* **核心機制**：隨機發動遊戲中任何一項主技能。
* **娛樂與變數**：高頻發動、不可預測之戰略彈性。

---

### 定位 10：尾巴解鎖戰術型（Tail Opener Specialists）
* **代表寶可夢**：呆呆獸家族（Slowpoke, Slowbro, Slowking）。
* **核心機制**：Lv.30 解鎖稀有食材「美味尾巴（Slowpoke Tail）」。
* **輪替戰術**：一旦解鎖尾巴進入全域掉落池後，即可透過食材獲取或隨機掉落持續取得，呆呆獸平時可作為替補輪替。

---

## 三、 程式碼架構與模組實裝對照清單

| 模組路徑 | 函數 / 屬性 | 功能職責與實裝規範 |
| :--- | :--- | :--- |
| `js/modules/app.js` | `isBerryBurstSkillSpecialist(pkm)` | 識別樹果遽增定位（謎擬Q、蜥蜴王、烈焰猴、勇士雄鷹、拉帝歐斯），BFS 為神配。 |
| `js/modules/app.js` | `isChargeStrengthSkillSpecialist(pkm)` | 識別電龍、太陽伊布、哥達鴨等充能直傷定位，支援純技能與 BFS 雙修體系。 |
| `js/modules/app.js` | `isHelperBoostSkillSpecialist(pkm)` | 識別雷公、炎帝、水君、風速狗等幫手加速定位，自身排除 BFS。 |
| `js/modules/app.js` | `isLegendaryPokemon(pkm)` | 識別傳說神獸（三神獸、超夢、夢幻、克雷色利亞、達克萊伊），分析隊伍增益與特殊技能機制。 |
| `js/modules/app.js` | `isPotExpanderSkillSpecialist(pkm)` | 識別自爆磁怪、火伊布、冰伊布等擴鍋定位。 |
| `js/modules/app.js` | `isExtraTastySkillSpecialist(pkm)` | 識別咚咚鼠、古月鳥等大成功爆擊定位。 |
| `js/modules/app.js` | `isDreamShardSkillSpecialist(pkm)` | 識別路卡利歐、貓老大等夢之碎片收割定位。 |
| `js/modules/app.js` | `isIngredientSkillSpecialist(pkm)` | 識別水伊布、請假王等食材獲取/精選定位。 |
| `js/modules/app.js` | `isMetronomeSkillSpecialist(pkm)` | 識別波克基斯、皮可西等揮指定位。 |
| `js/modules/app.js` | `applyPokedexGodPreset()` | 對樹果遽增型套用包含 BFS 的神配置；其餘技能型套用慎重純技能極限神配。 |
| `js/modules/app.js` | `renderPokedexStrategyCardHTML(pkm)` | 動態渲染樹果遽增爆發、單體充能直傷、傳說幫手加速、全隊活力療癒等客製化戰略指南卡片。 |
| `js/modules/appraisal.js` | `evaluatePokemon()` | 針對樹果遽增型給予 BFS 高額協同加分（+5.0）；針對充能型認可雙修產能（+4.5）；針對補師、神獸與純戰術型給予滿包警示。 |
| `js/modules/appraisal.js` | `generateIntelligentSummary()` | 針對全部 10+ 種戰略型產出細緻入微的專屬診斷解析，徹底杜絕千篇一律的填充文字。 |
| `tests/run_tests.js` | `Test 171` | 全面覆蓋樹果遽增、充能雙修、傳說神獸機制、戰術型專精與圖鑑預設神配之全套自動化斷言。 |

---

## 四、 參考社群數據與文獻來源
1. **RaenonX Pokémon Sleep Analysis Tool**: Main Skill Trigger Expectation, Berry Burst Mechanics & Sneaky Snacking Simulations.
2. **Reddit r/PokemonSleep**: *"Special Skill Specialists: Berry Burst, Charge Strength BFS Hybrids and Helper Boost Mono-Teams"* (2024-2026).
3. **巴哈姆特電玩資訊站 Pokémon Sleep 哈啦板**: 《全技能型寶可夢戰略定位精析》、《樹果遽增機制與樹果S協同解析》、《三神獸隊友樹果S乘數效應》。
4. **Game8 Japan**: ポケモンスリープ「スキルとくい別最適サブスキル・せいかく徹底考察」.
