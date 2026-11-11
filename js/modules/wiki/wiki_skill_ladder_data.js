  // =========================================================================
  // 主技能天梯基礎數據 (Main Skill Ladder Data)
  // =========================================================================

  const POKEMON_SKILLS_BASELINE_DATA = [
    {"id":"1","formatted_no":"001","name_cn":"妙蛙種子","name_en":"Bulbasaur","name_jp":"フシギダネ","specialty":"食材","interval":"01:13:20","skill_rate":"1.90%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/001.png"},
    {"id":"2","formatted_no":"002","name_cn":"妙蛙草","name_en":"Ivysaur","name_jp":"フシギソウ","specialty":"食材","interval":"00:55:00","skill_rate":"1.90%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/002.png"},
    {"id":"3","formatted_no":"003","name_cn":"妙蛙花","name_en":"Venusaur","name_jp":"フシギバナ","specialty":"食材","interval":"00:46:40","skill_rate":"2.10%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/003.png"},
    {"id":"4","formatted_no":"004","name_cn":"小火龍","name_en":"Charmander","name_jp":"ヒトカゲ","specialty":"食材","interval":"00:58:20","skill_rate":"1.10%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/004.png"},
    {"id":"5","formatted_no":"005","name_cn":"火恐龍","name_en":"Charmeleon","name_jp":"リザード","specialty":"食材","interval":"00:50:00","skill_rate":"1.60%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/005.png"},
    {"id":"6","formatted_no":"006","name_cn":"噴火龍","name_en":"Charizard","name_jp":"リザードン","specialty":"食材","interval":"00:40:00","skill_rate":"1.60%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/006.png"},
    {"id":"7","formatted_no":"007","name_cn":"傑尼龜","name_en":"Squirtle","name_jp":"ゼニガメ","specialty":"食材","interval":"01:15:00","skill_rate":"2.00%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/007.png"},
    {"id":"8","formatted_no":"008","name_cn":"卡咪龜","name_en":"Wartortle","name_jp":"カメール","specialty":"食材","interval":"00:56:40","skill_rate":"2.00%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/008.png"},
    {"id":"9","formatted_no":"009","name_cn":"水箭龜","name_en":"Blastoise","name_jp":"カメックス","specialty":"食材","interval":"00:46:40","skill_rate":"2.10%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/009.png"},
    {"id":"10","formatted_no":"010","name_cn":"綠毛蟲","name_en":"Caterpie","name_jp":"キャタピー","specialty":"樹果","interval":"01:13:20","skill_rate":"0.80%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/010.png"},
    {"id":"11","formatted_no":"011","name_cn":"鐵甲蛹","name_en":"Metapod","name_jp":"トランセル","specialty":"樹果","interval":"01:10:00","skill_rate":"1.80%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/011.png"},
    {"id":"12","formatted_no":"012","name_cn":"巴大蝶","name_en":"Butterfree","name_jp":"バタフリー","specialty":"樹果","interval":"00:41:40","skill_rate":"1.40%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/012.png"},
    {"id":"19","formatted_no":"019","name_cn":"小拉達","name_en":"Rattata","name_jp":"コラッタ","specialty":"樹果","interval":"01:21:40","skill_rate":"3.00%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/019.png"},
    {"id":"20","formatted_no":"020","name_cn":"拉達","name_en":"Raticate","name_jp":"ラッタ","specialty":"樹果","interval":"00:49:10","skill_rate":"3.00%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/020.png"},
    {"id":"23","formatted_no":"023","name_cn":"阿柏蛇","name_en":"Ekans","name_jp":"アーボ","specialty":"樹果","interval":"01:23:20","skill_rate":"3.30%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/023.png"},
    {"id":"24","formatted_no":"024","name_cn":"阿柏怪","name_en":"Arbok","name_jp":"アーボック","specialty":"樹果","interval":"00:56:40","skill_rate":"5.70%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/024.png"},
    {"id":"172","formatted_no":"172","name_cn":"皮丘","name_en":"Pichu","name_jp":"ピチュー","specialty":"樹果","interval":"01:11:40","skill_rate":"2.30%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/172.png"},
    {"id":"25","formatted_no":"025","name_cn":"皮卡丘","name_en":"Pikachu","name_jp":"ピカチュウ","specialty":"樹果","interval":"00:45:00","skill_rate":"2.10%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/025.png"},
    {"id":"9001","formatted_no":"9001","name_cn":"皮卡丘（萬聖節）","name_en":"Pikachu (Halloween)","name_jp":"ピカチュウ (ハロウィン)","specialty":"樹果","interval":"00:41:40","skill_rate":"2.80%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png"},
    {"id":"9002","formatted_no":"9002","name_cn":"皮卡丘（佳節）","name_en":"Pikachu (Holiday)","name_jp":"ピカチュウ (ホリデー)","specialty":"技能","interval":"00:41:40","skill_rate":"4.20%","main_skill":"夢之碎片獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png"},
    {"id":"9007","formatted_no":"9007","name_cn":"皮卡丘（船長）","name_en":"Pikachu (Captain)","name_jp":"ピカチュウ (キャプテン)","specialty":"樹果","interval":"00:41:40","skill_rate":"1.80%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png"},
    {"id":"26","formatted_no":"026","name_cn":"雷丘","name_en":"Raichu","name_jp":"ライチュウ","specialty":"樹果","interval":"00:36:40","skill_rate":"3.20%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/026.png"},
    {"id":"27","formatted_no":"027","name_cn":"穿山鼠","name_en":"Sandshrew","name_jp":"サンド","specialty":"技能","interval":"01:28:20","skill_rate":"4.60%","main_skill":"食材精選S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/027.png"},
    {"id":"28","formatted_no":"028","name_cn":"穿山王","name_en":"Sandslash","name_jp":"サンドパン","specialty":"技能","interval":"00:46:40","skill_rate":"4.30%","main_skill":"食材精選S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/028.png"},
    {"id":"173","formatted_no":"173","name_cn":"皮寶寶","name_en":"Cleffa","name_jp":"ピィ","specialty":"樹果","interval":"01:33:20","skill_rate":"3.40%","main_skill":"揮指","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/173.png"},
    {"id":"35","formatted_no":"035","name_cn":"皮皮","name_en":"Clefairy","name_jp":"ピッピ","specialty":"樹果","interval":"01:06:40","skill_rate":"4.00%","main_skill":"揮指","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/035.png"},
    {"id":"36","formatted_no":"036","name_cn":"皮可西","name_en":"Clefable","name_jp":"ピクシー","specialty":"樹果","interval":"00:46:40","skill_rate":"3.60%","main_skill":"揮指","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/036.png"},
    {"id":"37","formatted_no":"037","name_cn":"六尾","name_en":"Vulpix","name_jp":"ロコン","specialty":"樹果","interval":"01:18:20","skill_rate":"3.20%","main_skill":"活力療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/037.png"},
    {"id":"7006","formatted_no":"7006","name_cn":"六尾（阿羅拉的樣子）","name_en":"Vulpix (Alolan Form)","name_jp":"ロコン (アローラのすがた)","specialty":"樹果","interval":"01:33:20","skill_rate":"2.80%","main_skill":"幫手支援S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/037-alolanvulpix.png"},
    {"id":"38","formatted_no":"038","name_cn":"九尾","name_en":"Ninetales","name_jp":"キュウコン","specialty":"樹果","interval":"00:43:20","skill_rate":"2.90%","main_skill":"活力療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/038.png"},
    {"id":"7007","formatted_no":"7007","name_cn":"九尾（阿羅拉的樣子）","name_en":"Ninetales (Alolan Form)","name_jp":"キュウコン (アローラのすがた)","specialty":"樹果","interval":"00:48:20","skill_rate":"2.80%","main_skill":"幫手支援S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png"},
    {"id":"174","formatted_no":"174","name_cn":"寶寶丁","name_en":"Igglybuff","name_jp":"ププリン","specialty":"技能","interval":"01:26:40","skill_rate":"3.80%","main_skill":"活力全體療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/174.png"},
    {"id":"39","formatted_no":"039","name_cn":"胖丁","name_en":"Jigglypuff","name_jp":"プリン","specialty":"技能","interval":"01:05:00","skill_rate":"4.30%","main_skill":"活力全體療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/039.png"},
    {"id":"40","formatted_no":"040","name_cn":"胖可丁","name_en":"Wigglytuff","name_jp":"プクリン","specialty":"技能","interval":"00:48:20","skill_rate":"4.00%","main_skill":"活力全體療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/040.png"},
    {"id":"50","formatted_no":"050","name_cn":"地鼠","name_en":"Diglett","name_jp":"ディグダ","specialty":"食材","interval":"01:11:40","skill_rate":"2.10%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/050.png"},
    {"id":"51","formatted_no":"051","name_cn":"三地鼠","name_en":"Dugtrio","name_jp":"ダグトリオ","specialty":"食材","interval":"00:44:10","skill_rate":"2.00%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/051.png"},
    {"id":"52","formatted_no":"052","name_cn":"喵喵","name_en":"Meowth","name_jp":"ニャース","specialty":"技能","interval":"01:13:20","skill_rate":"4.20%","main_skill":"夢之碎片獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/052.png"},
    {"id":"53","formatted_no":"053","name_cn":"貓老大","name_en":"Persian","name_jp":"ペルシアン","specialty":"技能","interval":"00:46:40","skill_rate":"4.40%","main_skill":"夢之碎片獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/053.png"},
    {"id":"54","formatted_no":"054","name_cn":"可達鴨","name_en":"Psyduck","name_jp":"コダック","specialty":"技能","interval":"01:30:00","skill_rate":"12.60%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/054.png"},
    {"id":"55","formatted_no":"055","name_cn":"哥達鴨","name_en":"Golduck","name_jp":"ゴルダック","specialty":"技能","interval":"00:56:40","skill_rate":"12.50%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/055.png"},
    {"id":"56","formatted_no":"056","name_cn":"猴怪","name_en":"Mankey","name_jp":"マンキー","specialty":"樹果","interval":"01:10:00","skill_rate":"2.20%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/056.png"},
    {"id":"57","formatted_no":"057","name_cn":"火爆猴","name_en":"Primeape","name_jp":"オコリザル","specialty":"樹果","interval":"00:46:40","skill_rate":"2.40%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/057.png"},
    {"id":"58","formatted_no":"058","name_cn":"卡蒂狗","name_en":"Growlithe","name_jp":"ガーディ","specialty":"技能","interval":"01:11:40","skill_rate":"5.00%","main_skill":"幫手支援S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/058.png"},
    {"id":"59","formatted_no":"059","name_cn":"風速狗","name_en":"Arcanine","name_jp":"ウインディ","specialty":"技能","interval":"00:41:40","skill_rate":"4.90%","main_skill":"幫手支援S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/059.png"},
    {"id":"69","formatted_no":"069","name_cn":"喇叭芽","name_en":"Bellsprout","name_jp":"マダツボミ","specialty":"食材","interval":"01:26:40","skill_rate":"3.90%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/069.png"},
    {"id":"70","formatted_no":"070","name_cn":"口呆花","name_en":"Weepinbell","name_jp":"ウツドン","specialty":"食材","interval":"01:03:20","skill_rate":"4.00%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/070.png"},
    {"id":"71","formatted_no":"071","name_cn":"大食花","name_en":"Victreebel","name_jp":"ウツボット","specialty":"食材","interval":"00:46:40","skill_rate":"3.90%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/071.png"},
    {"id":"74","formatted_no":"074","name_cn":"小拳石","name_en":"Geodude","name_jp":"イシツブテ","specialty":"食材","interval":"01:35:00","skill_rate":"5.20%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/074.png"},
    {"id":"75","formatted_no":"075","name_cn":"隆隆石","name_en":"Graveler","name_jp":"ゴローン","specialty":"食材","interval":"01:06:40","skill_rate":"4.80%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/075.png"},
    {"id":"76","formatted_no":"076","name_cn":"隆隆岩","name_en":"Golem","name_jp":"ゴローニャ","specialty":"食材","interval":"00:51:40","skill_rate":"5.20%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/076.png"},
    {"id":"79","formatted_no":"079","name_cn":"呆呆獸","name_en":"Slowpoke","name_jp":"ヤドン","specialty":"技能","interval":"01:35:00","skill_rate":"7.80%","main_skill":"活力療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/079.png"},
    {"id":"80","formatted_no":"080","name_cn":"呆殼獸","name_en":"Slowbro","name_jp":"ヤドラン","specialty":"技能","interval":"01:03:20","skill_rate":"8.00%","main_skill":"活力療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/080.png"},
    {"id":"199","formatted_no":"199","name_cn":"呆呆王","name_en":"Slowking","name_jp":"ヤドキング","specialty":"技能","interval":"00:56:40","skill_rate":"8.70%","main_skill":"活力療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/199.png"},
    {"id":"81","formatted_no":"081","name_cn":"小磁怪","name_en":"Magnemite","name_jp":"コイル","specialty":"技能","interval":"01:36:40","skill_rate":"6.40%","main_skill":"料理強化S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/081.png"},
    {"id":"82","formatted_no":"082","name_cn":"三合一磁怪","name_en":"Magneton","name_jp":"レアコイル","specialty":"技能","interval":"01:06:40","skill_rate":"6.30%","main_skill":"料理強化S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/082.png"},
    {"id":"462","formatted_no":"462","name_cn":"自爆磁怪","name_en":"Magnezone","name_jp":"ジバコイル","specialty":"技能","interval":"00:51:40","skill_rate":"6.20%","main_skill":"料理強化S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/462.png"},
    {"id":"83","formatted_no":"083","name_cn":"大蔥鴨","name_en":"Farfetch'd","name_jp":"カモネギ","specialty":"食材","interval":"00:50:00","skill_rate":"4.30%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/083.png"},
    {"id":"84","formatted_no":"084","name_cn":"嘟嘟","name_en":"Doduo","name_jp":"ドードー","specialty":"樹果","interval":"01:03:20","skill_rate":"2.00%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/084.png"},
    {"id":"85","formatted_no":"085","name_cn":"嘟嘟利","name_en":"Dodrio","name_jp":"ドードリオ","specialty":"樹果","interval":"00:38:20","skill_rate":"2.00%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/085.png"},
    {"id":"92","formatted_no":"092","name_cn":"鬼斯","name_en":"Gastly","name_jp":"ゴース","specialty":"食材","interval":"01:03:20","skill_rate":"1.50%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/092.png"},
    {"id":"93","formatted_no":"093","name_cn":"鬼斯通","name_en":"Haunter","name_jp":"ゴースト","specialty":"食材","interval":"00:50:00","skill_rate":"2.20%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/093.png"},
    {"id":"94","formatted_no":"094","name_cn":"耿鬼","name_en":"Gengar","name_jp":"ゲンガー","specialty":"食材","interval":"00:36:40","skill_rate":"2.40%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/094.png"},
    {"id":"95","formatted_no":"095","name_cn":"大岩蛇","name_en":"Onix","name_jp":"イワーク","specialty":"樹果","interval":"00:51:40","skill_rate":"2.30%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/095.png"},
    {"id":"208","formatted_no":"208","name_cn":"大綱蛇","name_en":"Steelix","name_jp":"ハガネール","specialty":"樹果","interval":"00:50:00","skill_rate":"3.20%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/208.png"},
    {"id":"104","formatted_no":"104","name_cn":"卡拉卡拉","name_en":"Cubone","name_jp":"カラカラ","specialty":"樹果","interval":"01:20:00","skill_rate":"4.40%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/104.png"},
    {"id":"105","formatted_no":"105","name_cn":"嘎啦嘎啦","name_en":"Marowak","name_jp":"ガラガラ","specialty":"樹果","interval":"00:55:00","skill_rate":"4.50%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/105.png"},
    {"id":"440","formatted_no":"440","name_cn":"小福蛋","name_en":"Happiny","name_jp":"ピンプク","specialty":"食材","interval":"01:30:00","skill_rate":"1.30%","main_skill":"活力全體療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/440.png"},
    {"id":"113","formatted_no":"113","name_cn":"吉利蛋","name_en":"Chansey","name_jp":"ラッキー","specialty":"食材","interval":"00:55:00","skill_rate":"2.30%","main_skill":"活力全體療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/113.png"},
    {"id":"242","formatted_no":"242","name_cn":"幸福蛋","name_en":"Blissey","name_jp":"ハピナス","specialty":"食材","interval":"00:51:40","skill_rate":"2.30%","main_skill":"活力全體療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/242.png"},
    {"id":"115","formatted_no":"115","name_cn":"袋獸","name_en":"Kangaskhan","name_jp":"ガルーラ","specialty":"食材","interval":"00:44:10","skill_rate":"3.20%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/115.png"},
    {"id":"439","formatted_no":"439","name_cn":"魔尼尼","name_en":"Mime Jr.","name_jp":"マネネ","specialty":"食材","interval":"01:11:40","skill_rate":"3.20%","main_skill":"模仿","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/439.png"},
    {"id":"122","formatted_no":"122","name_cn":"魔牆人偶","name_en":"Mr. Mime","name_jp":"バリヤード","specialty":"食材","interval":"00:46:40","skill_rate":"3.90%","main_skill":"模仿","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/122.png"},
    {"id":"127","formatted_no":"127","name_cn":"凱羅斯","name_en":"Pinsir","name_jp":"カイロス","specialty":"食材","interval":"00:40:00","skill_rate":"3.10%","main_skill":"能量填充M","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/127.png"},
    {"id":"132","formatted_no":"132","name_cn":"百變怪","name_en":"Ditto","name_jp":"メタモン","specialty":"食材","interval":"00:58:20","skill_rate":"3.60%","main_skill":"變身","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/132.png"},
    {"id":"133","formatted_no":"133","name_cn":"伊布","name_en":"Eevee","name_jp":"イーブイ","specialty":"技能","interval":"01:01:40","skill_rate":"5.50%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/133.png"},
    {"id":"9004","formatted_no":"9004","name_cn":"伊布（佳節）","name_en":"Eevee (Holiday)","name_jp":"イーブイ (ホリデー)","specialty":"樹果","interval":"00:51:40","skill_rate":"3.20%","main_skill":"夢之碎片獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png"},
    {"id":"9005","formatted_no":"9005","name_cn":"伊布（萬聖節）","name_en":"Eevee (Halloween)","name_jp":"イーブイ (ハロウィン)","specialty":"技能","interval":"00:53:20","skill_rate":"4.60%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png"},
    {"id":"134","formatted_no":"134","name_cn":"水伊布","name_en":"Vaporeon","name_jp":"シャワーズ","specialty":"技能","interval":"00:51:40","skill_rate":"6.10%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/134.png"},
    {"id":"135","formatted_no":"135","name_cn":"雷伊布","name_en":"Jolteon","name_jp":"サンダース","specialty":"技能","interval":"00:36:40","skill_rate":"3.90%","main_skill":"幫手支援S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/135.png"},
    {"id":"136","formatted_no":"136","name_cn":"火伊布","name_en":"Flareon","name_jp":"ブースター","specialty":"技能","interval":"00:45:00","skill_rate":"5.20%","main_skill":"料理強化S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/136.png"},
    {"id":"196","formatted_no":"196","name_cn":"太陽伊布","name_en":"Espeon","name_jp":"エーフィ","specialty":"技能","interval":"00:40:00","skill_rate":"4.40%","main_skill":"能量填充M","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/196.png"},
    {"id":"197","formatted_no":"197","name_cn":"月亮伊布","name_en":"Umbreon","name_jp":"ブラッキー","specialty":"技能","interval":"00:53:20","skill_rate":"10.10%","main_skill":"月光","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/197.png"},
    {"id":"470","formatted_no":"470","name_cn":"葉伊布","name_en":"Leafeon","name_jp":"リーフィア","specialty":"技能","interval":"00:50:00","skill_rate":"6.90%","main_skill":"活力療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/470.png"},
    {"id":"471","formatted_no":"471","name_cn":"冰伊布","name_en":"Glaceon","name_jp":"グレイシア","specialty":"技能","interval":"00:53:20","skill_rate":"6.30%","main_skill":"料理強化S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/471.png"},
    {"id":"700","formatted_no":"700","name_cn":"仙子伊布","name_en":"Sylveon","name_jp":"ニンフィア","specialty":"技能","interval":"00:43:20","skill_rate":"4.00%","main_skill":"活力全體療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/700.png"},
    {"id":"147","formatted_no":"147","name_cn":"迷你龍","name_en":"Dratini","name_jp":"ミニリュウ","specialty":"食材","interval":"01:23:20","skill_rate":"2.00%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/147.png"},
    {"id":"148","formatted_no":"148","name_cn":"哈克龍","name_en":"Dragonair","name_jp":"ハクリュー","specialty":"食材","interval":"01:03:20","skill_rate":"2.50%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/148.png"},
    {"id":"149","formatted_no":"149","name_cn":"快龍","name_en":"Dragonite","name_jp":"カイリュー","specialty":"食材","interval":"00:43:20","skill_rate":"2.60%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/149.png"},
    {"id":"150","formatted_no":"150","name_cn":"超夢","name_en":"Mewtwo","name_jp":"ミュウツー","specialty":"技能","interval":"00:38:20","skill_rate":"2.90%","main_skill":"精神擊破","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/150.png"},
    {"id":"151","formatted_no":"151","name_cn":"夢幻","name_en":"Mew","name_jp":"ミュウ","specialty":"全部","interval":"00:48:20","skill_rate":"4.00%","main_skill":"十項全能","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/151.png"},
    {"id":"152","formatted_no":"152","name_cn":"菊草葉","name_en":"Chikorita","name_jp":"チコリータ","specialty":"樹果","interval":"01:13:20","skill_rate":"3.90%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/152.png"},
    {"id":"153","formatted_no":"153","name_cn":"月桂葉","name_en":"Bayleef","name_jp":"ベイリーフ","specialty":"樹果","interval":"00:55:00","skill_rate":"3.80%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/153.png"},
    {"id":"154","formatted_no":"154","name_cn":"大竺葵","name_en":"Meganium","name_jp":"メガニウム","specialty":"樹果","interval":"00:46:40","skill_rate":"4.60%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/154.png"},
    {"id":"155","formatted_no":"155","name_cn":"火球鼠","name_en":"Cyndaquil","name_jp":"ヒノアラシ","specialty":"樹果","interval":"00:58:20","skill_rate":"2.10%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/155.png"},
    {"id":"156","formatted_no":"156","name_cn":"火岩鼠","name_en":"Quilava","name_jp":"マグマラシ","specialty":"樹果","interval":"00:50:00","skill_rate":"4.10%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/156.png"},
    {"id":"157","formatted_no":"157","name_cn":"火爆獸","name_en":"Typhlosion","name_jp":"バクフーン","specialty":"樹果","interval":"00:40:00","skill_rate":"3.90%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/157.png"},
    {"id":"158","formatted_no":"158","name_cn":"小鋸鱷","name_en":"Totodile","name_jp":"ワニノコ","specialty":"樹果","interval":"01:15:00","skill_rate":"2.20%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/158.png"},
    {"id":"159","formatted_no":"159","name_cn":"藍鱷","name_en":"Croconaw","name_jp":"アリゲイツ","specialty":"樹果","interval":"00:56:40","skill_rate":"5.20%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/159.png"},
    {"id":"160","formatted_no":"160","name_cn":"大力鱷","name_en":"Feraligatr","name_jp":"オーダイル","specialty":"樹果","interval":"00:46:40","skill_rate":"5.50%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/160.png"},
    {"id":"175","formatted_no":"175","name_cn":"波克比","name_en":"Togepi","name_jp":"トゲピー","specialty":"技能","interval":"01:20:00","skill_rate":"4.90%","main_skill":"揮指","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/175.png"},
    {"id":"176","formatted_no":"176","name_cn":"波克基古","name_en":"Togetic","name_jp":"トゲチック","specialty":"技能","interval":"01:03:20","skill_rate":"5.60%","main_skill":"揮指","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/176.png"},
    {"id":"468","formatted_no":"468","name_cn":"波克基斯","name_en":"Togekiss","name_jp":"トゲキッス","specialty":"技能","interval":"00:43:20","skill_rate":"5.30%","main_skill":"揮指","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/468.png"},
    {"id":"177","formatted_no":"177","name_cn":"天然雀","name_en":"Natu","name_jp":"ネイティ","specialty":"樹果","interval":"01:15:00","skill_rate":"1.60%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/177.png"},
    {"id":"178","formatted_no":"178","name_cn":"天然鳥","name_en":"Xatu","name_jp":"ネイティオ","specialty":"樹果","interval":"00:41:40","skill_rate":"2.50%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/178.png"},
    {"id":"179","formatted_no":"179","name_cn":"咩利羊","name_en":"Mareep","name_jp":"メリープ","specialty":"技能","interval":"01:16:40","skill_rate":"4.70%","main_skill":"能量填充M","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/179.png"},
    {"id":"180","formatted_no":"180","name_cn":"茸茸羊","name_en":"Flaaffy","name_jp":"モココ","specialty":"技能","interval":"00:55:00","skill_rate":"4.60%","main_skill":"能量填充M","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/180.png"},
    {"id":"181","formatted_no":"181","name_cn":"電龍","name_en":"Ampharos","name_jp":"デンリュウ","specialty":"技能","interval":"00:41:40","skill_rate":"4.70%","main_skill":"能量填充M","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/181.png"},
    {"id":"438","formatted_no":"438","name_cn":"盆才怪","name_en":"Bonsly","name_jp":"ウソハチ","specialty":"技能","interval":"01:45:00","skill_rate":"6.10%","main_skill":"能量填充M","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/438.png"},
    {"id":"185","formatted_no":"185","name_cn":"樹才怪","name_en":"Sudowoodo","name_jp":"ウソッキー","specialty":"技能","interval":"01:06:40","skill_rate":"7.20%","main_skill":"能量填充M","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/185.png"},
    {"id":"194","formatted_no":"194","name_cn":"烏波","name_en":"Wooper","name_jp":"ウパー","specialty":"食材","interval":"01:38:20","skill_rate":"3.80%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/194.png"},
    {"id":"7054","formatted_no":"7054","name_cn":"烏波（帕底亞的樣子）","name_en":"Wooper (Paldea Form)","name_jp":"ウパー  (パルデアのすがた)","specialty":"食材","interval":"01:46:40","skill_rate":"5.60%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png"},
    {"id":"195","formatted_no":"195","name_cn":"沼王","name_en":"Quagsire","name_jp":"ヌオー","specialty":"食材","interval":"00:56:40","skill_rate":"3.20%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/195.png"},
    {"id":"980","formatted_no":"980","name_cn":"土王","name_en":"Clodsire","name_jp":"ドオー","specialty":"食材","interval":"00:58:20","skill_rate":"5.50%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/980.png"},
    {"id":"198","formatted_no":"198","name_cn":"黑暗鴉","name_en":"Murkrow","name_jp":"ヤミカラス","specialty":"技能","interval":"01:00:00","skill_rate":"6.20%","main_skill":"超幸運","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/198.png"},
    {"id":"430","formatted_no":"430","name_cn":"烏鴉頭頭","name_en":"Honchkrow","name_jp":"ドンカラス","specialty":"技能","interval":"00:53:20","skill_rate":"6.70%","main_skill":"超幸運","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/430.png"},
    {"id":"360","formatted_no":"360","name_cn":"小果然","name_en":"Wynaut","name_jp":"ソーナノ","specialty":"技能","interval":"01:36:40","skill_rate":"7.40%","main_skill":"活力療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/360.png"},
    {"id":"202","formatted_no":"202","name_cn":"果然翁","name_en":"Wobbuffet","name_jp":"ソーナンス","specialty":"技能","interval":"00:58:20","skill_rate":"8.20%","main_skill":"活力療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/202.png"},
    {"id":"200","formatted_no":"200","name_cn":"夢妖","name_en":"Misdreavus","name_jp":"ムウマ","specialty":"技能","interval":"00:46:40","skill_rate":"4.70%","main_skill":"料理強化S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/200.png"},
    {"id":"429","formatted_no":"429","name_cn":"夢妖魔","name_en":"Mismagius","name_jp":"ムウマージ","specialty":"技能","interval":"00:40:00","skill_rate":"3.60%","main_skill":"魔法火焰","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/429.png"},
    {"id":"213","formatted_no":"213","name_cn":"壺壺","name_en":"Shuckle","name_jp":"ツボツボ","specialty":"技能","interval":"01:00:00","skill_rate":"5.90%","main_skill":"樹果汁","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/213.png"},
    {"id":"214","formatted_no":"214","name_cn":"赫拉克羅斯","name_en":"Heracross","name_jp":"ヘラクロス","specialty":"技能","interval":"00:38:20","skill_rate":"4.70%","main_skill":"健美","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/214.png"},
    {"id":"215","formatted_no":"215","name_cn":"狃拉","name_en":"Sneasel","name_jp":"ニューラ","specialty":"樹果","interval":"00:53:20","skill_rate":"1.90%","main_skill":"料理成功S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/215.png"},
    {"id":"461","formatted_no":"461","name_cn":"瑪狃拉","name_en":"Weavile","name_jp":"マニューラ","specialty":"樹果","interval":"00:45:00","skill_rate":"1.80%","main_skill":"料理成功S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/461.png"},
    {"id":"225","formatted_no":"225","name_cn":"信使鳥","name_en":"Delibird","name_jp":"デリバード","specialty":"食材","interval":"00:41:40","skill_rate":"3.00%","main_skill":"禮物","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/225.png"},
    {"id":"228","formatted_no":"228","name_cn":"戴魯比","name_en":"Houndour","name_jp":"デルビル","specialty":"樹果","interval":"01:21:40","skill_rate":"3.70%","main_skill":"能量填充M","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/228.png"},
    {"id":"229","formatted_no":"229","name_cn":"黑魯加","name_en":"Houndoom","name_jp":"ヘルガー","specialty":"樹果","interval":"00:55:00","skill_rate":"4.00%","main_skill":"能量填充M","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/229.png"},
    {"id":"243","formatted_no":"243","name_cn":"雷公","name_en":"Raikou","name_jp":"ライコウ","specialty":"技能","interval":"00:35:00","skill_rate":"1.90%","main_skill":"幫手加速（電）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/243.png"},
    {"id":"244","formatted_no":"244","name_cn":"炎帝","name_en":"Entei","name_jp":"エンテイ","specialty":"技能","interval":"00:40:00","skill_rate":"2.30%","main_skill":"幫手加速（火）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/244.png"},
    {"id":"245","formatted_no":"245","name_cn":"水君","name_en":"Suicune","name_jp":"スイクン","specialty":"技能","interval":"00:45:00","skill_rate":"2.60%","main_skill":"幫手加速（水）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/245.png"},
    {"id":"246","formatted_no":"246","name_cn":"幼基拉斯","name_en":"Larvitar","name_jp":"ヨーギラス","specialty":"食材","interval":"01:20:00","skill_rate":"4.10%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/246.png"},
    {"id":"247","formatted_no":"247","name_cn":"沙基拉斯","name_en":"Pupitar","name_jp":"サナギラス","specialty":"食材","interval":"01:00:00","skill_rate":"4.50%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/247.png"},
    {"id":"248","formatted_no":"248","name_cn":"班基拉斯","name_en":"Tyranitar","name_jp":"バンギラス","specialty":"食材","interval":"00:45:00","skill_rate":"5.20%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/248.png"},
    {"id":"252","formatted_no":"252","name_cn":"木守宮","name_en":"Treecko","name_jp":"キモリ","specialty":"技能","interval":"01:15:00","skill_rate":"3.50%","main_skill":"樹果遽增","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/252.png"},
    {"id":"253","formatted_no":"253","name_cn":"森林蜥蜴","name_en":"Grovyle","name_jp":"ジュプトル","specialty":"技能","interval":"00:55:00","skill_rate":"3.50%","main_skill":"樹果遽增","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/253.png"},
    {"id":"254","formatted_no":"254","name_cn":"蜥蜴王","name_en":"Sceptile","name_jp":"ジュカイン","specialty":"技能","interval":"00:38:20","skill_rate":"3.00%","main_skill":"樹果遽增","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/254.png"},
    {"id":"255","formatted_no":"255","name_cn":"火稚雞","name_en":"Torchic","name_jp":"アチャモ","specialty":"樹果","interval":"01:11:40","skill_rate":"4.40%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/255.png"},
    {"id":"256","formatted_no":"256","name_cn":"力壯雞","name_en":"Combusken","name_jp":"ワカシャモ","specialty":"樹果","interval":"00:56:40","skill_rate":"5.20%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/256.png"},
    {"id":"257","formatted_no":"257","name_cn":"火焰雞","name_en":"Blaziken","name_jp":"バシャーモ","specialty":"樹果","interval":"00:43:20","skill_rate":"4.90%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/257.png"},
    {"id":"258","formatted_no":"258","name_cn":"水躍魚","name_en":"Mudkip","name_jp":"ミズゴロウ","specialty":"樹果","interval":"01:18:20","skill_rate":"2.40%","main_skill":"料理成功S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/258.png"},
    {"id":"259","formatted_no":"259","name_cn":"沼躍魚","name_en":"Marshtomp","name_jp":"ヌマクロー","specialty":"樹果","interval":"00:58:20","skill_rate":"2.70%","main_skill":"料理成功S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/259.png"},
    {"id":"260","formatted_no":"260","name_cn":"巨沼怪","name_en":"Swampert","name_jp":"ラグラージ","specialty":"樹果","interval":"00:46:40","skill_rate":"3.40%","main_skill":"料理成功S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/260.png"},
    {"id":"280","formatted_no":"280","name_cn":"拉魯拉絲","name_en":"Ralts","name_jp":"ラルトス","specialty":"技能","interval":"01:20:00","skill_rate":"4.30%","main_skill":"活力全體療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/280.png"},
    {"id":"281","formatted_no":"281","name_cn":"奇鲁莉安","name_en":"Kirlia","name_jp":"キルリア","specialty":"技能","interval":"00:58:20","skill_rate":"4.30%","main_skill":"活力全體療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/281.png"},
    {"id":"282","formatted_no":"282","name_cn":"沙奈朵","name_en":"Gardevoir","name_jp":"サーナイト","specialty":"技能","interval":"00:40:00","skill_rate":"4.20%","main_skill":"活力全體療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/282.png"},
    {"id":"475","formatted_no":"475","name_cn":"艾路雷朵","name_en":"Gallade","name_jp":"エルレイド","specialty":"技能","interval":"00:40:00","skill_rate":"5.40%","main_skill":"幫手支援S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/475.png"},
    {"id":"287","formatted_no":"287","name_cn":"懶人獺","name_en":"Slakoth","name_jp":"ナマケロ","specialty":"樹果","interval":"01:21:40","skill_rate":"1.90%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/287.png"},
    {"id":"288","formatted_no":"288","name_cn":"過動猿","name_en":"Vigoroth","name_jp":"ヤルキモノ","specialty":"樹果","interval":"00:53:20","skill_rate":"1.50%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/288.png"},
    {"id":"289","formatted_no":"289","name_cn":"請假王","name_en":"Slaking","name_jp":"ケッキング","specialty":"樹果","interval":"01:00:00","skill_rate":"6.70%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/289.png"},
    {"id":"302","formatted_no":"302","name_cn":"勾魂眼","name_en":"Sableye","name_jp":"ヤミラミ","specialty":"技能","interval":"01:00:00","skill_rate":"6.80%","main_skill":"夢之碎片獲取S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/302.png"},
    {"id":"303","formatted_no":"303","name_cn":"大嘴娃","name_en":"Mawile","name_jp":"クチート","specialty":"食材","interval":"00:53:20","skill_rate":"3.80%","main_skill":"怪力鉗","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/303.png"},
    {"id":"304","formatted_no":"304","name_cn":"可可多拉","name_en":"Aron","name_jp":"ココドラ","specialty":"食材","interval":"01:35:00","skill_rate":"4.60%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/304.png"},
    {"id":"305","formatted_no":"305","name_cn":"可多拉","name_en":"Lairon","name_jp":"コドラ","specialty":"食材","interval":"01:10:00","skill_rate":"4.80%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/305.png"},
    {"id":"306","formatted_no":"306","name_cn":"波士可多拉","name_en":"Aggron","name_jp":"ボスゴドラ","specialty":"食材","interval":"00:50:00","skill_rate":"5.20%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/306.png"},
    {"id":"311","formatted_no":"311","name_cn":"正電拍拍","name_en":"Plusle","name_jp":"プラスル","specialty":"技能","interval":"00:40:00","skill_rate":"4.90%","main_skill":"正電","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/311.png"},
    {"id":"312","formatted_no":"312","name_cn":"負電拍拍","name_en":"Minun","name_jp":"マイナン","specialty":"技能","interval":"00:40:00","skill_rate":"4.90%","main_skill":"負電","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/312.png"},
    {"id":"316","formatted_no":"316","name_cn":"溶食獸","name_en":"Gulpin","name_jp":"ゴクリン","specialty":"技能","interval":"01:38:20","skill_rate":"6.30%","main_skill":"夢之碎片獲取S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/316.png"},
    {"id":"317","formatted_no":"317","name_cn":"吞食獸","name_en":"Swalot","name_jp":"マルノーム","specialty":"技能","interval":"00:58:20","skill_rate":"7.00%","main_skill":"夢之碎片獲取S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/317.png"},
    {"id":"328","formatted_no":"328","name_cn":"大顎蟻","name_en":"Trapinch","name_jp":"ナックラー","specialty":"食材","interval":"01:23:20","skill_rate":"3.10%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/328.png"},
    {"id":"329","formatted_no":"329","name_cn":"超音波幼蟲","name_en":"Vibrava","name_jp":"ビブラーバ","specialty":"食材","interval":"01:01:40","skill_rate":"3.40%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/329.png"},
    {"id":"330","formatted_no":"330","name_cn":"沙漠蜻蜓","name_en":"Flygon","name_jp":"フライゴン","specialty":"食材","interval":"00:45:00","skill_rate":"3.90%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/330.png"},
    {"id":"333","formatted_no":"333","name_cn":"青綿鳥","name_en":"Swablu","name_jp":"チルット","specialty":"樹果","interval":"01:10:00","skill_rate":"3.20%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/333.png"},
    {"id":"334","formatted_no":"334","name_cn":"七夕青鳥","name_en":"Altaria","name_jp":"チルタリス","specialty":"樹果","interval":"00:58:20","skill_rate":"6.10%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/334.png"},
    {"id":"353","formatted_no":"353","name_cn":"怨影娃娃","name_en":"Shuppet","name_jp":"カゲボウズ","specialty":"樹果","interval":"01:05:00","skill_rate":"2.60%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/353.png"},
    {"id":"354","formatted_no":"354","name_cn":"詛咒娃娃","name_en":"Banette","name_jp":"ジュペッタ","specialty":"樹果","interval":"00:43:20","skill_rate":"3.30%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/354.png"},
    {"id":"359","formatted_no":"359","name_cn":"阿勃梭魯","name_en":"Absol","name_jp":"アブソル","specialty":"食材","interval":"00:49:10","skill_rate":"3.80%","main_skill":"能量填充M","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/359.png"},
    {"id":"363","formatted_no":"363","name_cn":"海豹球","name_en":"Spheal","name_jp":"タマザラシ","specialty":"樹果","interval":"01:33:20","skill_rate":"2.30%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/363.png"},
    {"id":"9006","formatted_no":"9006","name_cn":"海豹球（佳節）","name_en":"Spheal (Holiday)","name_jp":"タマザラシ (ホリデー)","specialty":"技能","interval":"00:55:00","skill_rate":"5.00%","main_skill":"料理成功S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png"},
    {"id":"364","formatted_no":"364","name_cn":"海魔獅","name_en":"Sealeo","name_jp":"トドグラー","specialty":"樹果","interval":"01:06:40","skill_rate":"2.10%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/364.png"},
    {"id":"365","formatted_no":"365","name_cn":"帝牙海獅","name_en":"Walrein","name_jp":"トドゼルガ","specialty":"樹果","interval":"00:50:00","skill_rate":"2.20%","main_skill":"食材獲取S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/365.png"},
    {"id":"371","formatted_no":"371","name_cn":"寶貝龍","name_en":"Bagon","name_jp":"タツベイ","specialty":"樹果","interval":"01:28:20","skill_rate":"2.70%","main_skill":"料理強化S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/371.png"},
    {"id":"372","formatted_no":"372","name_cn":"甲殼龍","name_en":"Shelgon","name_jp":"コモルー","specialty":"樹果","interval":"01:03:20","skill_rate":"2.70%","main_skill":"料理強化S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/372.png"},
    {"id":"373","formatted_no":"373","name_cn":"暴飛龍","name_en":"Salamence","name_jp":"ボーマンダ","specialty":"樹果","interval":"00:46:40","skill_rate":"3.40%","main_skill":"料理強化S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/373.png"},
    {"id":"380","formatted_no":"380","name_cn":"拉帝亞斯","name_en":"Latias","name_jp":"ラティアス","specialty":"技能","interval":"00:46:40","skill_rate":"4.90%","main_skill":"治癒波動","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/380.png"},
    {"id":"381","formatted_no":"381","name_cn":"拉帝歐斯","name_en":"Latios","name_jp":"ラティオス","specialty":"技能","interval":"00:46:40","skill_rate":"3.00%","main_skill":"流星群","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/381.png"},
    {"id":"387","formatted_no":"387","name_cn":"草苗龜","name_en":"Turtwig","name_jp":"ナエトル","specialty":"技能","interval":"01:15:00","skill_rate":"4.10%","main_skill":"活力全體療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/387.png"},
    {"id":"388","formatted_no":"388","name_cn":"樹林龜","name_en":"Grotle","name_jp":"ハヤシガメ","specialty":"技能","interval":"01:01:40","skill_rate":"4.60%","main_skill":"活力全體療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/388.png"},
    {"id":"389","formatted_no":"389","name_cn":"土台龜","name_en":"Torterra","name_jp":"ドダイトス","specialty":"技能","interval":"00:48:20","skill_rate":"4.80%","main_skill":"活力全體療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/389.png"},
    {"id":"390","formatted_no":"390","name_cn":"小火焰猴","name_en":"Chimchar","name_jp":"ヒコザル","specialty":"技能","interval":"01:08:20","skill_rate":"3.30%","main_skill":"樹果遽增","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/390.png"},
    {"id":"391","formatted_no":"391","name_cn":"猛火猴","name_en":"Monferno","name_jp":"モウカザル","specialty":"技能","interval":"00:51:40","skill_rate":"3.30%","main_skill":"樹果遽增","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/391.png"},
    {"id":"392","formatted_no":"392","name_cn":"烈焰猴","name_en":"Infernape","name_jp":"ゴウカザル","specialty":"技能","interval":"00:40:00","skill_rate":"3.30%","main_skill":"樹果遽增","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/392.png"},
    {"id":"393","formatted_no":"393","name_cn":"波加曼","name_en":"Piplup","name_jp":"ポッチャマ","specialty":"樹果","interval":"01:15:00","skill_rate":"2.60%","main_skill":"幫手支援S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/393.png"},
    {"id":"394","formatted_no":"394","name_cn":"波皇子","name_en":"Prinplup","name_jp":"ポッタイシ","specialty":"樹果","interval":"01:01:40","skill_rate":"3.50%","main_skill":"幫手支援S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/394.png"},
    {"id":"395","formatted_no":"395","name_cn":"帝王拿波","name_en":"Empoleon","name_jp":"エンペルト","specialty":"樹果","interval":"00:53:20","skill_rate":"3.80%","main_skill":"幫手支援S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/395.png"},
    {"id":"403","formatted_no":"403","name_cn":"小貓怪","name_en":"Shinx","name_jp":"コリンク","specialty":"食材","interval":"01:13:20","skill_rate":"1.80%","main_skill":"料理強化S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/403.png"},
    {"id":"404","formatted_no":"404","name_cn":"勒克貓","name_en":"Luxio","name_jp":"ルクシオ","specialty":"食材","interval":"00:53:20","skill_rate":"1.80%","main_skill":"料理強化S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/404.png"},
    {"id":"405","formatted_no":"405","name_cn":"倫琴貓","name_en":"Luxray","name_jp":"レントラー","specialty":"食材","interval":"00:40:00","skill_rate":"2.30%","main_skill":"料理強化S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/405.png"},
    {"id":"425","formatted_no":"425","name_cn":"飄飄球","name_en":"Drifloon","name_jp":"フワンテ","specialty":"技能","interval":"01:20:00","skill_rate":"7.10%","main_skill":"蓄力","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/425.png"},
    {"id":"426","formatted_no":"426","name_cn":"隨風球","name_en":"Drifblim","name_jp":"フワライド","specialty":"技能","interval":"00:41:40","skill_rate":"6.30%","main_skill":"蓄力","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/426.png"},
    {"id":"442","formatted_no":"442","name_cn":"花岩怪","name_en":"Spiritomb","name_jp":"ミカルゲ","specialty":"食材","interval":"00:58:20","skill_rate":"3.60%","main_skill":"幫手支援S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/442.png"},
    {"id":"447","formatted_no":"447","name_cn":"利歐路","name_en":"Riolu","name_jp":"リオル","specialty":"技能","interval":"01:10:00","skill_rate":"3.80%","main_skill":"夢之碎片獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/447.png"},
    {"id":"448","formatted_no":"448","name_cn":"路卡利歐","name_en":"Lucario","name_jp":"ルカリオ","specialty":"技能","interval":"00:43:20","skill_rate":"5.10%","main_skill":"波導彈","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/448.png"},
    {"id":"453","formatted_no":"453","name_cn":"不良蛙","name_en":"Croagunk","name_jp":"グレッグル","specialty":"食材","interval":"01:33:20","skill_rate":"4.20%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/453.png"},
    {"id":"454","formatted_no":"454","name_cn":"毒骷蛙","name_en":"Toxicroak","name_jp":"ドクロッグ","specialty":"食材","interval":"00:56:40","skill_rate":"4.30%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/454.png"},
    {"id":"459","formatted_no":"459","name_cn":"雪笠怪","name_en":"Snover","name_jp":"ユキカブリ","specialty":"食材","interval":"01:33:20","skill_rate":"4.40%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/459.png"},
    {"id":"460","formatted_no":"460","name_cn":"暴雪王","name_en":"Abomasnow","name_jp":"ユキノオー","specialty":"食材","interval":"00:50:00","skill_rate":"4.40%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/460.png"},
    {"id":"488","formatted_no":"488","name_cn":"克雷色利亞","name_en":"Cresselia","name_jp":"クレセリア","specialty":"技能","interval":"00:38:20","skill_rate":"4.10%","main_skill":"新月祈禱","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/488.png"},
    {"id":"491","formatted_no":"491","name_cn":"達克萊伊","name_en":"Darkrai","name_jp":"ダークライ","specialty":"全部","interval":"00:48:20","skill_rate":"2.30%","main_skill":"夢魘","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/491.png"},
    {"id":"517","formatted_no":"517","name_cn":"食夢夢","name_en":"Munna","name_jp":"ムンナ","specialty":"樹果","interval":"01:35:00","skill_rate":"4.30%","main_skill":"夢之碎片獲取S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/517.png"},
    {"id":"518","formatted_no":"518","name_cn":"夢夢蝕","name_en":"Musharna","name_jp":"ムシャーナ","specialty":"樹果","interval":"00:46:40","skill_rate":"4.10%","main_skill":"夢之碎片獲取S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/518.png"},
    {"id":"546","formatted_no":"546","name_cn":"木棉球","name_en":"Cottonee","name_jp":"モンメン","specialty":"食材","interval":"","skill_rate":"","main_skill":"","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/546.png"},
    {"id":"547","formatted_no":"547","name_cn":"風妖精","name_en":"Whimsicott","name_jp":"エルフーン","specialty":"食材","interval":"","skill_rate":"","main_skill":"","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/547.png"},
    {"id":"557","formatted_no":"557","name_cn":"石居蟹","name_en":"Dwebble","name_jp":"イシズマイ","specialty":"技能","interval":"01:11:40","skill_rate":"5.40%","main_skill":"食材精選S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/557.png"},
    {"id":"558","formatted_no":"558","name_cn":"岩殿居蟹","name_en":"Crustle","name_jp":"イワパレス","specialty":"技能","interval":"00:53:20","skill_rate":"6.40%","main_skill":"食材精選S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/558.png"},
    {"id":"590","formatted_no":"590","name_cn":"哎呀球菇","name_en":"Foongus","name_jp":"タマゲタケ","specialty":"食材","interval":"01:35:00","skill_rate":"3.50%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/590.png"},
    {"id":"591","formatted_no":"591","name_cn":"敗露球菇","name_en":"Amoonguss","name_jp":"モロバレル","specialty":"食材","interval":"00:58:20","skill_rate":"4.70%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/591.png"},
    {"id":"627","formatted_no":"627","name_cn":"毛頭小鷹","name_en":"Rufflet","name_jp":"ワシボン","specialty":"技能","interval":"01:03:20","skill_rate":"3.10%","main_skill":"樹果遽增","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/627.png"},
    {"id":"628","formatted_no":"628","name_cn":"勇士雄鷹","name_en":"Braviary","name_jp":"ウォーグル","specialty":"技能","interval":"00:40:00","skill_rate":"3.50%","main_skill":"樹果遽增","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/628.png"},
    {"id":"696","formatted_no":"696","name_cn":"寶寶暴龍","name_en":"Tyrunt","name_jp":"チゴラス","specialty":"樹果","interval":"01:26:40","skill_rate":"2.40%","main_skill":"料理強化S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/696.png"},
    {"id":"697","formatted_no":"697","name_cn":"怪顎龍","name_en":"Tyrantrum","name_jp":"ガチゴラス","specialty":"樹果","interval":"00:46:40","skill_rate":"2.90%","main_skill":"料理強化S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/697.png"},
    {"id":"701","formatted_no":"701","name_cn":"摔角鷹人","name_en":"Hawlucha","name_jp":"ルチャブル","specialty":"技能","interval":"00:40:00","skill_rate":"5.20%","main_skill":"食材精選S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/701.png"},
    {"id":"702","formatted_no":"702","name_cn":"咚咚鼠","name_en":"Dedenne","name_jp":"デデンネ","specialty":"技能","interval":"00:41:40","skill_rate":"4.50%","main_skill":"料理成功S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/702.png"},
    {"id":"710","formatted_no":"710","name_cn":"南瓜精 (小顆種)","name_en":"Pumpkaboo (Small Variety)","name_jp":"バケッチャ (こだましゅ)","specialty":"食材","interval":"01:28:20","skill_rate":"4.90%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/710.png"},
    {"id":"710","formatted_no":"710","name_cn":"南瓜精 (中顆種)","name_en":"Pumpkaboo (Medium Variety)","name_jp":"バケッチャ (ちゅうだましゅ)","specialty":"食材","interval":"01:30:00","skill_rate":"4.90%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/710.png"},
    {"id":"710","formatted_no":"710","name_cn":"南瓜精 (大顆種)","name_en":"Pumpkaboo (Large Variety)","name_jp":"バケッチャ (おおだましゅ)","specialty":"食材","interval":"01:31:40","skill_rate":"4.90%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/710.png"},
    {"id":"710","formatted_no":"710","name_cn":"南瓜精 (巨顆種)","name_en":"Pumpkaboo (Jumbo Variety)","name_jp":"バケッチャ (ギガだましゅ)","specialty":"食材","interval":"01:33:20","skill_rate":"4.90%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/710.png"},
    {"id":"711","formatted_no":"711","name_cn":"南瓜怪人 (小顆種)","name_en":"Gourgeist (Small Variety)","name_jp":"パンプジン (こだましゅ)","specialty":"食材","interval":"00:51:40","skill_rate":"4.90%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/711.png"},
    {"id":"711","formatted_no":"711","name_cn":"南瓜怪人 (中顆種)","name_en":"Gourgeist (Medium Variety)","name_jp":"パンプジン (ちゅうだましゅ)","specialty":"食材","interval":"00:53:20","skill_rate":"4.90%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/711.png"},
    {"id":"711","formatted_no":"711","name_cn":"南瓜怪人 (大顆種)","name_en":"Gourgeist (Large Variety)","name_jp":"パンプジン (おおだましゅ)","specialty":"食材","interval":"00:55:00","skill_rate":"4.90%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/711.png"},
    {"id":"711","formatted_no":"711","name_cn":"南瓜怪人 (巨顆種)","name_en":"Gourgeist (Jumbo Variety)","name_jp":"パンプジン (ギガだましゅ)","specialty":"食材","interval":"00:56:40","skill_rate":"4.90%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/711.png"},
    {"id":"714","formatted_no":"714","name_cn":"嗡蝠","name_en":"Noibat","name_jp":"オンバット","specialty":"技能","interval":"01:25:00","skill_rate":"4.80%","main_skill":"能量填充M","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/714.png"},
    {"id":"715","formatted_no":"715","name_cn":"音波龍","name_en":"Noivern","name_jp":"オンバーン","specialty":"技能","interval":"00:45:00","skill_rate":"4.80%","main_skill":"能量填充M","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/715.png"},
    {"id":"736","formatted_no":"736","name_cn":"強顎雞母蟲","name_en":"Grubbin","name_jp":"アゴジムシ","specialty":"食材","interval":"01:16:40","skill_rate":"2.90%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/736.png"},
    {"id":"737","formatted_no":"737","name_cn":"蟲電寶","name_en":"Charjabug","name_jp":"デンヂムシ","specialty":"食材","interval":"00:55:00","skill_rate":"2.80%","main_skill":"能量填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/737.png"},
    {"id":"738","formatted_no":"738","name_cn":"鍬農炮蟲","name_en":"Vikavolt","name_jp":"クワガノン","specialty":"食材","interval":"00:46:40","skill_rate":"5.10%","main_skill":"能量填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/738.png"},
    {"id":"742","formatted_no":"742","name_cn":"萌虻","name_en":"Cutiefly","name_jp":"アブリー","specialty":"食材","interval":"01:15:00","skill_rate":"1.90%","main_skill":"食材精選S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/742.png"},
    {"id":"743","formatted_no":"743","name_cn":"蝶結萌虻","name_en":"Ribombee","name_jp":"アブリボン","specialty":"食材","interval":"00:38:20","skill_rate":"2.50%","main_skill":"食材精選S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/743.png"},
    {"id":"759","formatted_no":"759","name_cn":"童偶熊","name_en":"Stufful","name_jp":"ヌイコグマ","specialty":"食材","interval":"01:08:20","skill_rate":"1.10%","main_skill":"能量填充S（隨機）","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/759.png"},
    {"id":"760","formatted_no":"760","name_cn":"穿著熊","name_en":"Bewear","name_jp":"キテルグマ","specialty":"食材","interval":"00:46:40","skill_rate":"1.30%","main_skill":"能量填充S（隨機）","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/760.png"},
    {"id":"764","formatted_no":"764","name_cn":"花療環環","name_en":"Comfey","name_jp":"キュワワー","specialty":"食材","interval":"00:41:40","skill_rate":"3.50%","main_skill":"活力療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/764.png"},
    {"id":"777","formatted_no":"777","name_cn":"托戈德瑪爾","name_en":"Togedemaru","name_jp":"トゲデマル","specialty":"技能","interval":"00:45:00","skill_rate":"5.40%","main_skill":"蹭蹭臉頰","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/777.png"},
    {"id":"778","formatted_no":"778","name_cn":"謎擬Q","name_en":"Mimikyu","name_jp":"ミミッキュ","specialty":"技能","interval":"00:41:40","skill_rate":"3.50%","main_skill":"畫皮","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/778.png"},
    {"id":"780","formatted_no":"780","name_cn":"老翁龍","name_en":"Drampa","name_jp":"ジジーロン","specialty":"食材","interval":"00:58:20","skill_rate":"4.60%","main_skill":"料理成功S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/780.png"},
    {"id":"845","formatted_no":"845","name_cn":"古月鳥","name_en":"Cramorant","name_jp":"ウッウ","specialty":"食材","interval":"00:45:00","skill_rate":"3.90%","main_skill":"料理成功S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/845.png"},
    {"id":"848","formatted_no":"848","name_cn":"毒電嬰","name_en":"Toxel","name_jp":"エレズン","specialty":"技能","interval":"01:33:20","skill_rate":"4.80%","main_skill":"食材獲取S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/848.png"},
    {"id":"849","formatted_no":"849","name_cn":"顫弦蠑螈（高調的樣子）","name_en":"Toxtricity (Amped Form)","name_jp":"ストリンダー (ハイなすがた)","specialty":"技能","interval":"00:51:40","skill_rate":"6.40%","main_skill":"正電","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/849.png"},
    {"id":"8001","formatted_no":"8001","name_cn":"顫弦蠑螈（低調的樣子）","name_en":"Toxtricity (Low Key Form)","name_jp":"ストリンダー (ローなすがた)","specialty":"技能","interval":"00:51:40","skill_rate":"6.40%","main_skill":"負電","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png"},
    {"id":"906","formatted_no":"906","name_cn":"新葉喵","name_en":"Sprigatito","name_jp":"ニャオハ","specialty":"食材","interval":"01:16:40","skill_rate":"2.30%","main_skill":"料理強化S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/906.png"},
    {"id":"907","formatted_no":"907","name_cn":"蒂蕾喵","name_en":"Floragato","name_jp":"ニャローテ","specialty":"食材","interval":"00:58:20","skill_rate":"2.30%","main_skill":"料理強化S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/907.png"},
    {"id":"908","formatted_no":"908","name_cn":"魔幻假面喵","name_en":"Meowscarada","name_jp":"マスカーニャ","specialty":"食材","interval":"00:43:20","skill_rate":"2.20%","main_skill":"料理強化S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/908.png"},
    {"id":"909","formatted_no":"909","name_cn":"呆火鱷","name_en":"Fuecoco","name_jp":"ホゲータ","specialty":"食材","interval":"01:10:00","skill_rate":"5.30%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/909.png"},
    {"id":"910","formatted_no":"910","name_cn":"炙燙鱷","name_en":"Crocalor","name_jp":"アチゲータ","specialty":"食材","interval":"00:51:40","skill_rate":"5.00%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/910.png"},
    {"id":"911","formatted_no":"911","name_cn":"骨紋巨聲鱷","name_en":"Skeledirge","name_jp":"ラウドボーン","specialty":"食材","interval":"00:45:00","skill_rate":"6.20%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/911.png"},
    {"id":"912","formatted_no":"912","name_cn":"潤水鴨","name_en":"Quaxly","name_jp":"クワッス","specialty":"食材","interval":"01:20:00","skill_rate":"2.80%","main_skill":"能量填充M","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/912.png"},
    {"id":"913","formatted_no":"913","name_cn":"湧躍鴨","name_en":"Quaxwell","name_jp":"ウェルカモ","specialty":"食材","interval":"01:00:00","skill_rate":"2.70%","main_skill":"能量填充M","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/913.png"},
    {"id":"914","formatted_no":"914","name_cn":"狂歡浪舞鴨","name_en":"Quaquaval","name_jp":"ウェーニバル","specialty":"食材","interval":"00:43:20","skill_rate":"2.40%","main_skill":"能量填充M","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/914.png"},
    {"id":"921","formatted_no":"921","name_cn":"布撥","name_en":"Pawmi","name_jp":"パモ","specialty":"技能","interval":"01:16:40","skill_rate":"3.60%","main_skill":"活力全體療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/921.png"},
    {"id":"922","formatted_no":"922","name_cn":"布土撥","name_en":"Pawmo","name_jp":"パモット","specialty":"技能","interval":"00:55:00","skill_rate":"3.60%","main_skill":"活力全體療癒S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/922.png"},
    {"id":"923","formatted_no":"923","name_cn":"巴布土撥","name_en":"Pawmot","name_jp":"パーモット","specialty":"技能","interval":"00:40:00","skill_rate":"3.90%","main_skill":"活力全體療癒S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/923.png"},
    {"id":"957","formatted_no":"957","name_cn":"小鍛匠","name_en":"Tinkatink","name_jp":"カヌチャン","specialty":"樹果","interval":"01:15:00","skill_rate":"1.60%","main_skill":"能量填充M","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/957.png"},
    {"id":"958","formatted_no":"958","name_cn":"巧鍛匠","name_en":"Tinkatuff","name_jp":"ナカヌチャン","specialty":"樹果","interval":"00:55:00","skill_rate":"1.80%","main_skill":"能量填充M","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/958.png"},
    {"id":"959","formatted_no":"959","name_cn":"巨鍛匠","name_en":"Tinkaton","name_jp":"デカヌチャン","specialty":"樹果","interval":"00:40:00","skill_rate":"2.00%","main_skill":"能量填充M","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/959.png"},
    {"id":"974","formatted_no":"974","name_cn":"走鯨","name_en":"Cetoddle","name_jp":"アルクジラ","specialty":"食材","interval":"01:25:00","skill_rate":"4.20%","main_skill":"活力填充S","is_final":"","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/974.png"},
    {"id":"975","formatted_no":"975","name_cn":"浩大鯨","name_en":"Cetitan","name_jp":"ハルクジラ","specialty":"食材","interval":"00:46:40","skill_rate":"4.20%","main_skill":"活力填充S","is_final":"〇","icon_url":"https://www.serebii.net/pokemonsleep/pokemon/icon/975.png"}
  ];

  const EXCLUDED_SKILL_NAMES = [
    '揮指', '模仿', '變身', '十項全能', '技能複製',
    '挥指', '变身', '十项全能', '技能复制',
    'Metronome', 'Mimic', 'Transform', 'All-Rounder', 'Skill Copy', 'Finger Wag'
  ];

  function isExcludedSkill(skillName) {
    if (!skillName) return true;
    const s = String(skillName).trim();
    const sLower = s.toLowerCase();
    return EXCLUDED_SKILL_NAMES.some(ex => {
      const exLower = ex.toLowerCase();
      return s === ex || sLower === exLower ||
        s.startsWith(ex + '（') || s.startsWith(ex + '(') || s.startsWith(ex + ' ') ||
        sLower.startsWith(exLower + '(') || sLower.startsWith(exLower + ' ');
    });
  }

  const SKILL_TRACK_DEFINITIONS = [
    {
      id: 'charge_energy',
      name: '能量填充',
      name_en: 'Charge Strength',
      desc: '增加卡比獸的能量',
      desc_en: 'Increases Snorlax Strength',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      svgPath: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'energy_all',
      name: '全體療癒',
      name_en: 'Energy for Everyone',
      desc: '讓全體隊友回復活力',
      desc_en: 'Restores Energy to all teammates',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      svgPath: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'energy_single',
      name: '單體療癒',
      name_en: 'Single/Random Heal',
      desc: '回復自身或隊友活力',
      desc_en: 'Restores Energy to a specific or random ally',
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.15)',
      svgPath: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: 'cooking_pot',
      name: '料理強化',
      name_en: 'Cooking Power-up',
      desc: '擴大下一次料理的鍋子容量',
      desc_en: 'Expands pot capacity for next cooking',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.15)',
      svgPath: '<path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9H4v10zM12 2v4M8 6h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'cooking_chance',
      name: '料理成功',
      name_en: 'Tasty Chance',
      desc: '提升下一次料理大成功的機率',
      desc_en: 'Boosts extra tasty chance for next dish',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      svgPath: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'helper_boost',
      name: '幫手支援',
      name_en: 'Helper Boost',
      desc: '全隊或特定屬性立即完成幫忙',
      desc_en: 'Instant helps for team or matching types',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      svgPath: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'dream_shards',
      name: '夢碎獲取',
      name_en: 'Dream Shards',
      desc: '直接獲得夢之碎片',
      desc_en: 'Obtains Dream Shards directly',
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.15)',
      svgPath: '<polygon points="12 2 2 7 12 12 22 7 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="2 17 12 22 22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="2 12 12 17 22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'ingredient',
      name: '食材獲取',
      name_en: 'Ingredients',
      desc: '隨機或精選獲得多個食材',
      desc_en: 'Gathers random or selected ingredients',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      svgPath: '<path d="M12 2a5 5 0 0 1 5 5c0 2.3-1.5 4.3-3.6 4.9V19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-7.1C6.5 11.3 5 9.3 5 7a5 5 0 0 1 7-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'berry_burst',
      name: '樹果遽增',
      name_en: 'Berry Burst',
      desc: '直接獲得大量樹果',
      desc_en: 'Instantly obtains multiple berries',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      svgPath: '<circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    }
  ];

  const COMPOSITE_SKILL_TRACKS = {
    // 官方複合主技能與專屬技能多軌道映射
    '正電': ['ingredient', 'helper_boost'],
    'Plus': ['ingredient', 'helper_boost'],
    '負電': ['cooking_pot', 'energy_single'],
    'Minus': ['cooking_pot', 'energy_single'],
    '禮物': ['ingredient', 'dream_shards'],
    'Present': ['ingredient', 'dream_shards'],
    '健美': ['ingredient', 'cooking_chance'],
    'Bulk Up': ['ingredient', 'cooking_chance'],
    '魔法火焰': ['cooking_pot', 'cooking_chance'],
    'Mystical Fire': ['cooking_pot', 'cooking_chance'],
    '蹭蹭臉頰': ['energy_single', 'helper_boost'],
    'Nuzzle': ['energy_single', 'helper_boost'],
    '治癒波動': ['energy_single', 'helper_boost'],
    'Heal Pulse': ['energy_single', 'helper_boost'],
    '樹果汁': ['energy_all', 'energy_single'],
    'Berry Juice': ['energy_all', 'energy_single'],
    '波導彈': ['charge_energy', 'dream_shards'],
    'Aura Sphere': ['charge_energy', 'dream_shards'],
    '新月祈禱': ['energy_all', 'berry_burst'],
    'Lunar Prayer': ['energy_all', 'berry_burst'],
    '精神擊破': ['charge_energy', 'berry_burst'],
    'Psystrike': ['charge_energy', 'berry_burst'],
    '超幸運': ['ingredient', 'dream_shards'],
    'Super Luck': ['ingredient', 'dream_shards'],
    '怪力鉗': ['ingredient', 'cooking_chance'],
    '怪力钳': ['ingredient', 'cooking_chance'],
    'Hyper Cutter': ['ingredient', 'cooking_chance'],
    '月光': ['energy_single'],
    'Moonlight': ['energy_single'],
    '流星群': ['berry_burst'],
    'Draco Meteor': ['berry_burst'],
    '畫皮': ['berry_burst', 'cooking_chance'],
    'Disguise': ['berry_burst', 'cooking_chance'],
    '蓄力': ['charge_energy'],
    'Stockpile': ['charge_energy'],
    '夢魘': ['charge_energy'],
    'Bad Dreams': ['charge_energy'],
    'Darkrai Nightmare': ['charge_energy']
  };

  function getSkillTracks(mainSkill) {
    if (!mainSkill) return [];
    if (isExcludedSkill(mainSkill)) return [];
    const s = String(mainSkill).trim();
    const sLower = s.toLowerCase();

    for (const [compName, tracks] of Object.entries(COMPOSITE_SKILL_TRACKS)) {
      const compLower = compName.toLowerCase();
      if (s === compName || sLower === compLower ||
          s.startsWith(compName + '（') || s.startsWith(compName + '(') || s.startsWith(compName + ' ') ||
          sLower.startsWith(compLower + '(') || sLower.startsWith(compLower + ' ')) {
        return tracks;
      }
    }

    if (sLower.includes('charge strength') || sLower.includes('darkrai nightmare') || s.includes('能量填充') || s.includes('能量充填') || s.includes('達克萊伊專屬')) return ['charge_energy'];
    if (sLower.includes('energy for everyone') || s.includes('活力全體') || s.includes('活力全体') || s.includes('活力療癒全體') || s.includes('活力疗愈全体') || ((s.includes('活力療癒') || s.includes('活力疗愈')) && (s.includes('全体') || s.includes('全體'))) || s.includes('全體療癒') || s.includes('全体疗愈') || s.includes('全體能量回復') || s.includes('全体能量回复')) return ['energy_all'];
    if (sLower.includes('energizing cheer') || sLower.includes('energy cheer') || sLower.includes('charge energy') || s.includes('活力療癒') || s.includes('活力疗愈') || s.includes('活力填充') || s.includes('活力充填') || s.includes('活力應援') || s.includes('活力应援') || s.includes('自體活力回復') || s.includes('自体活力回复') || s.includes('活力充沛')) return ['energy_single'];
    if (sLower.includes('cooking power-up') || sLower.includes('cooking power up') || s.includes('料理強化') || s.includes('料理擴大') || s.includes('料理扩大')) return ['cooking_pot'];
    if (sLower.includes('tasty chance') || s.includes('料理成功') || s.includes('美味機會') || s.includes('美味机会')) return ['cooking_chance'];
    if (sLower.includes('helper boost') || sLower.includes('extra helpful') || sLower.includes('helper speed') || s.includes('幫手支援') || s.includes('幫手加速') || s.includes('幫手獎勵') || s.includes('幫手') || s.includes('帮手') || s.includes('傳說降臨') || s.includes('传说降临')) return ['helper_boost'];
    if (sLower.includes('dream shard') || s.includes('夢之碎片') || s.includes('梦之碎片') || s.includes('碎片獲取') || s.includes('碎片获取')) return ['dream_shards'];
    if (sLower.includes('ingredient magnet') || sLower.includes('ingredient draw') || sLower.includes('ingredient selection') || sLower.includes('ingr. selection') || sLower.includes('random ingredients') || s.includes('食材獲取') || s.includes('食材精選') || s.includes('食材精选') || s.includes('食材隨機') || s.includes('食材随机')) return ['ingredient'];
    if (sLower.includes('berry burst') || sLower.includes('berry field') || s.includes('樹果遽增') || s.includes('树果遽增') || s.includes('樹果擴增') || s.includes('树果扩增') || s.includes('樹果領域') || s.includes('树果领域')) return ['berry_burst'];

    return [];
  }

  function getSkillSubCategoryInfo(mainSkill, trackId, isEN) {
    const s = String(mainSkill || '').trim();
    const sLower = s.toLowerCase();
    const skillDisplayName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getMainSkillName === 'function' && isEN)
      ? (window.I18N.getMainSkillName(mainSkill) || mainSkill)
      : s;

    let subKey = '';
    let subLabel = '';

    if (trackId === 'energy_single') {
      if (s.includes('活力填充') || s.includes('活力充填') || sLower.includes('charge energy')) {
        subKey = 'self';
        subLabel = isEN ? 'Self' : '自己';
      } else if (s.includes('月光') || sLower.includes('moonlight')) {
        subKey = 'self';
        subLabel = isEN ? 'Self (+Random Ally)' : '自己 (+隨機他人)';
      } else {
        subKey = 'ally';
        subLabel = isEN ? 'Random Ally' : '隨機他人';
      }
    } else if (trackId === 'ingredient') {
      if (s.includes('食材精選') || s.includes('食材精选') || s.includes('超幸運') || s.includes('超幸运') || s.includes('怪力鉗') || s.includes('怪力钳') || sLower.includes('ingredient draw') || sLower.includes('ingr. select') || sLower.includes('super luck') || sLower.includes('hyper cutter')) {
        subKey = 'select';
        subLabel = isEN ? 'Ingredient Draw' : '食材精選';
      } else {
        subKey = 'magnet';
        subLabel = isEN ? 'Ingredient Magnet' : '食材獲取';
      }
    } else if (trackId === 'charge_energy') {
      if (s.includes('隨機') || s.includes('随机') || sLower.includes('random')) {
        subKey = 'random';
        subLabel = isEN ? 'Random' : '隨機';
      } else if (s.includes('能量填充M') || s.includes('能量充填M') || sLower.includes('charge strength m')) {
        subKey = 'fixed_m';
        subLabel = isEN ? 'Fixed M' : '高倍固定';
      } else if (s.includes('蓄力') || sLower.includes('stockpile')) {
        subKey = 'stockpile';
        subLabel = isEN ? 'Stockpile' : '疊加爆發';
      } else if (s.includes('波導彈') || s.includes('波导弹') || sLower.includes('aura sphere')) {
        subKey = 'strength_shards';
        subLabel = isEN ? 'Strength+Shards' : '能量+夢碎';
      } else if (s.includes('精神擊破') || s.includes('精神击破') || sLower.includes('psystrike')) {
        subKey = 'strength_field';
        subLabel = isEN ? 'Strength+Berry Field' : '能量+樹果領域';
      } else if (s.includes('夢魘') || s.includes('梦魇') || sLower.includes('bad dreams') || sLower.includes('nightmare')) {
        subKey = 'nightmare';
        subLabel = isEN ? 'High Strength' : '高倍能量';
      } else {
        subKey = 'fixed_s';
        subLabel = isEN ? 'Fixed S' : '固定';
      }
    } else if (trackId === 'energy_all') {
      if (s.includes('樹果汁') || s.includes('树果汁') || sLower.includes('berry juice')) {
        subKey = 'berry_juice';
        subLabel = isEN ? 'Team+Berry Juice' : '全體+樹果汁';
      } else if (s.includes('新月祈禱') || s.includes('新月祈祷') || sLower.includes('lunar prayer')) {
        subKey = 'lunar_prayer';
        subLabel = isEN ? 'Team+Berry Burst' : '全體+樹果遽增';
      } else {
        subKey = 'team_heal';
        subLabel = isEN ? 'Team Heal' : '全體回復';
      }
    } else if (trackId === 'cooking_pot') {
      if (s.includes('魔法火焰') || sLower.includes('mystical fire')) {
        subKey = 'pot_tasty';
        subLabel = isEN ? 'Pot+Tasty' : '擴鍋+料理成功';
      } else if (s.includes('負電') || s.includes('负电') || sLower.includes('minus')) {
        subKey = 'pot_heal';
        subLabel = isEN ? 'Pot+Random Heal' : '擴鍋+隨機他人';
      } else {
        subKey = 'pot_expand';
        subLabel = isEN ? 'Pot Expand' : '擴鍋';
      }
    } else if (trackId === 'cooking_chance') {
      if (s.includes('魔法火焰') || sLower.includes('mystical fire')) {
        subKey = 'tasty_pot';
        subLabel = isEN ? 'Tasty+Pot' : '大成功+擴鍋';
      } else if (s.includes('健美') || sLower.includes('bulk up')) {
        subKey = 'tasty_magnet';
        subLabel = isEN ? 'Tasty+Ingr. Magnet' : '大成功+食材獲取';
      } else if (s.includes('怪力鉗') || s.includes('怪力钳') || sLower.includes('hyper cutter')) {
        subKey = 'tasty_draw';
        subLabel = isEN ? 'Tasty+Ingr. Draw' : '大成功+食材精選';
      } else if (s.includes('畫皮') || s.includes('画皮') || sLower.includes('disguise')) {
        subKey = 'tasty_burst';
        subLabel = isEN ? '3x Berry Burst' : '大成功3倍樹果';
      } else {
        subKey = 'tasty_chance';
        subLabel = isEN ? 'Tasty Chance' : '大成功機率';
      }
    } else if (trackId === 'helper_boost') {
      if (s.includes('幫手加速') || s.includes('帮手加速') || sLower.includes('helper speed')) {
        subKey = 'team_boost';
        subLabel = isEN ? 'Team Type Boost' : '同屬全隊加速';
      } else if (s.includes('正電') || s.includes('正电') || sLower.includes('plus')) {
        subKey = 'plus_synergy';
        subLabel = isEN ? 'Plus Synergy' : '連動食材獲取';
      } else if (s.includes('蹭蹭臉頰') || s.includes('蹭蹭脸颊') || sLower.includes('nuzzle')) {
        subKey = 'nuzzle_proc';
        subLabel = isEN ? 'Random Heal+Extra Proc' : '隨機他人+額外發動';
      } else if (s.includes('治癒波動') || s.includes('治愈波动') || sLower.includes('heal pulse')) {
        subKey = 'heal_help';
        subLabel = isEN ? 'Random Heal+Instant Help' : '隨機他人+立即幫忙';
      } else {
        subKey = 'single_boost';
        subLabel = isEN ? 'Single Boost' : '單體支援';
      }
    } else if (trackId === 'dream_shards') {
      if (s.includes('隨機') || s.includes('随机') || sLower.includes('random')) {
        subKey = 'random';
        subLabel = isEN ? 'Random' : '隨機';
      } else if (s.includes('波導彈') || s.includes('波导弹') || sLower.includes('aura sphere')) {
        subKey = 'shards_strength';
        subLabel = isEN ? 'Shards+Strength' : '固定夢碎+能量';
      } else if (s.includes('超幸運') || s.includes('超幸运') || sLower.includes('super luck')) {
        subKey = 'draw_crit';
        subLabel = isEN ? 'Ingr. Draw+Crit Shards' : '食材精選+暴擊夢碎';
      } else if (s.includes('禮物') || s.includes('礼物') || sLower.includes('present')) {
        subKey = 'magnet_candy';
        subLabel = isEN ? 'Ingr. Magnet+Candy' : '食材獲取+隨機糖果';
      } else {
        subKey = 'fixed';
        subLabel = isEN ? 'Fixed' : '固定';
      }
    } else if (trackId === 'berry_burst') {
      if (s.includes('畫皮') || s.includes('画皮') || sLower.includes('disguise')) {
        subKey = 'disguise_burst';
        subLabel = isEN ? 'Disguise 3x' : '大成功3倍樹果';
      } else if (s.includes('流星群') || sLower.includes('draco meteor')) {
        subKey = 'dragon_burst';
        subLabel = isEN ? 'Dragon Burst' : '龍屬樹果遽增';
      } else if (s.includes('新月祈禱') || s.includes('新月祈祷') || sLower.includes('lunar prayer')) {
        subKey = 'psychic_burst';
        subLabel = isEN ? 'Psychic Burst' : '超能樹果遽增';
      } else if (s.includes('精神擊破') || s.includes('精神击破') || sLower.includes('psystrike')) {
        subKey = 'psychic_field';
        subLabel = isEN ? 'Psychic Field' : '超能樹果領域';
      } else {
        subKey = 'standard_burst';
        subLabel = isEN ? 'Berry Burst' : '標準樹果遽增';
      }
    }

    let fullLabel = skillDisplayName;
    if (subLabel) {
      const alreadyHasZh = skillDisplayName.includes('（' + subLabel + '）') || skillDisplayName.includes('(' + subLabel + ')');
      const alreadyHasEn = isEN && (skillDisplayName.includes('(' + subLabel + ')') || skillDisplayName.includes('（' + subLabel + '）'));
      const alreadyHasRandom = (subKey === 'random') && (
        /（隨機）|\(隨機\)|\(Random\)|\(random\)|（Random）/i.test(skillDisplayName)
      );
      const alreadyHasFixed = (subKey === 'fixed' || subKey === 'fixed_s') && (
        /（固定）|\(固定\)|\(Fixed\)|\(fixed\)|（Fixed）/i.test(skillDisplayName)
      );

      if (!alreadyHasZh && !alreadyHasEn && !alreadyHasRandom && !alreadyHasFixed) {
        fullLabel = isEN ? `${skillDisplayName} (${subLabel})` : `${skillDisplayName}（${subLabel}）`;
      }
    }

    fullLabel = fullLabel
      .replace(/（([^）]+)）\s*（\1）/g, '（$1）')
      .replace(/\(([^)]+)\)\s*\(\1\)/gi, '($1)')
      .replace(/（([^）]+)）\s*\(\1\)/gi, '（$1）')
      .replace(/\(([^)]+)\)\s*（\1）/gi, '（$1）')
      .replace(/（隨機）\s*（隨機）/g, '（隨機）')
      .replace(/\(隨機\)\s*\(隨機\)/g, '(隨機)')
      .replace(/\(Random\)\s*\(Random\)/gi, '(Random)')
      .replace(/（Random）\s*（Random）/gi, '（Random）');

    return {
      subKey,
      subLabel,
      fullLabel
    };
  }

  function getSkillLadderSpecialtyIcon(specKey, specDisplay, size) {
    const s = parseInt(size, 10) || 16;
    const key = (specKey || 'skill').toLowerCase();
    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (typeof escapeHtml === 'function' ? escapeHtml : (str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')));
    const disp = esc(specDisplay || '');
    let basePath = '';
    if (typeof window !== 'undefined') {
      if (typeof window.__DATA_BASE_PATH__ === 'string') {
        basePath = window.__DATA_BASE_PATH__;
      } else if (window.location && typeof window.location.pathname === 'string' && window.location.pathname.includes('/app/')) {
        basePath = '../';
      }
    }
    return `<span class="box-spec-tag spec-${key} specialty-icon-wrap node-specialty-tag specialty-${key}" title="${disp}" style="display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;padding:0;line-height:1;vertical-align:middle;"><img src="${basePath}assets/specialty/${key}.png" srcset="${basePath}assets/specialty/${key}@2x.png 2x" class="specialty-icon spec-${key}" width="${s}" height="${s}" alt="${disp}" loading="lazy" style="width:${s}px;height:${s}px;object-fit:contain;vertical-align:middle;display:inline-block;pointer-events:none;" /></span>`;
  }
