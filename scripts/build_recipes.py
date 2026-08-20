import urllib.request
import re
import json
import time

URL_DISHES = 'https://www.serebii.net/pokemonsleep/dishes.shtml'

# Standard ingredient mapping
ING_MAP = {
    'fancyapple': {'name': '特選蘋果', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png'},
    'moomoomilk': {'name': '哞哞鮮奶', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png'},
    'greengrasssoybeans': {'name': '萌綠大豆', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png'},
    'honey': {'name': '甜甜蜜', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/honey.png'},
    'beansausage': {'name': '豆製肉', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png'},
    'warmingginger': {'name': '暖暖薑', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png'},
    'snoozytomato': {'name': '好眠番茄', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png'},
    'fancyegg': {'name': '特選蛋', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png'},
    'pureoil': {'name': '純粹油', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png'},
    'softpotato': {'name': '窩心洋芋', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png'},
    'fieryherb': {'name': '火辣香草', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png'},
    'soothingcacao': {'name': '放鬆可可', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png'},
    'tastymushroom': {'name': '品鮮蘑菇', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png'},
    'largeleek': {'name': '粗枝大蔥', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png'},
    'slowpoketail': {'name': '美味尾巴', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png'},
    'greengrasscorn': {'name': '萌綠玉米', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png'},
    'rousingcoffee': {'name': '醒腦咖啡豆', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png'},
    'glossyavocado': {'name': '嫩亮酪梨', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png'},
    'plumppumpkin': {'name': '沉甸甸南瓜', 'icon': 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png'}
}

# Standard Chinese Translation Mapping for Pokémon Sleep Dishes
NAME_CN_MAP = {
    # 咖哩 (Curry)
    'fancy apple curry': '特選蘋果咖哩',
    'grilled tail curry': '炙烤尾巴咖哩',
    'solar power tomato curry': '太陽之力番茄咖哩',
    'dream eater butter curry': '絕對睡眠奶油咖哩',
    'spicy leek curry': '辣味蔥勁十足咖哩',
    'spore mushroom curry': '蘑菇孢子咖哩',
    'egg bomb curry': '親子愛咖哩',
    'hearty cheeseburger curry': '健美起司堡咖哩',
    'soft potato chowder': '馬鈴薯蘑菇濃湯',
    'simple chowder': '樸實馬鈴薯濃湯',
    'beanburger curry': '豆腸咖哩堡',
    'mild honey curry': '溫和蜂蜜咖哩',
    'ninja curry': '忍者咖哩',
    'drought katsu curry': '酥脆炸豬排咖哩',
    'melty omelette curry': '熔岩蛋包咖哩',
    'bulk up bean curry': '吃飽飽起司肉醬咖哩',
    'limber corn stew': '柔嫩玉米濃湯',
    'inferno corn keema curry': '煉獄玉米乾咖哩',
    'dizzy punch spicy curry': '迷昏香味咖哩',
    'hidden power perk-up stew': '覺醒力量醒腦燉湯',
    'cut sukiyaki curry': '一字斬壽喜燒咖哩',
    'role play pumpkaboo stew': '扮演南瓜濃湯',
    'overgrow avocado gratin': '茂盛焗烤酪梨',
    'greengrass curry bun': '萌綠咖哩麵包',
    'bounce curry udon': '彈跳咖哩烏龍麵',

    # 沙拉 (Salad)
    'slowpoke tail pepper salad': '呆呆獸尾巴的胡椒沙拉',
    'spore mushroom salad': '蘑菇孢子沙拉',
    'snow cloak caesar salad': '雪隱凱薩沙拉',
    'gluttony potato salad': '貪吃鬼洋芋沙拉',
    'water veil tofu salad': '水幕豆腐沙拉',
    'superpower extreme salad': '超能力極限沙拉',
    'bean ham salad': '豆火腿沙拉',
    'snoozy tomato salad': '好眠番茄沙拉',
    'moomoo caprese salad': '莫札瑞拉起司沙拉',
    'contrary chocolate meat salad': '唱反調可可肉沙拉',
    'overheat ginger salad': '過熱沙拉',
    'fancy apple salad': '特選蘋果沙拉',
    'immunity leek salad': '免疫大蔥沙拉',
    'dazzling apple cheese salad': '蘋果起司沙拉',
    'ninja salad': '忍者沙拉',
    'heat wave tofu salad': '熱風豆腐沙拉',
    'greengrass salad': '萌綠沙拉',
    'calm mind fruit salad': '冥想香甜沙拉',
    'fury attack corn salad': '亂擊玉米沙拉',
    'cross chop salad': '十字切碎丁沙拉',
    'defiant coffee-dressed salad': '不服輸咖啡風味沙拉',
    'petal blizzard layered salad': '落英繽紛含羞草蛋沙拉',
    'apple acid yogurt-dressed salad': '蘋果酸優格風味沙拉',
    'luscious avocado salad': '碎裂酪梨沙拉',
    'bulldoze guacamole and chips': '重踏酪梨醬薯片',
    'scald chunky salad': '熱水溫沙拉',

    # 甜點 (Dessert)
    'fluffy sweet potatoes': '軟綿烤地瓜',
    'steadfast ginger cookies': '不屈生薑餅乾',
    'fancy apple juice': '特選蘋果汁',
    'craft soda pop': '手作勁爽汽水',
    'ember ginger tea': '火花生薑茶',
    "jigglypuff's fruity flan": '胖丁水果布丁',
    'lovelykisssmoothie': '迷人果昔',
    'lovely kiss smoothie': '迷人果昔',
    'lucky chant apple pie': '幸運祈願蘋果派',
    "neroli's restorative tea": '奈羅利恢復茶',
    'sweet scent chocolate cake': '甜香可可蛋糕',
    'warm moomoo milk': '溫熱哞哞鮮奶',
    'cloud nine soy cake': '無關天氣大豆蛋糕',
    'hustle protein smoothie': '活力蛋白質果昔',
    'stalwart vegetable juice': '堅毅蔬菜汁',
    'big malasada': '馬拉薩達',
    'huge power soy donuts': '大力士大豆甜甜圈',
    'explosion popcorn': '大爆炸爆米花',
    'teatime corn scones': '午茶玉米司康',
    'petal dance chocolate tart': '花瓣舞可可塔',
    'flower gift macarons': '花之禮馬卡龍',
    'early bird coffee jelly': '早起咖啡凍',
    'zing zap spiced cola': '麻麻刺刺香料可樂',
    'mold breaker corn tiramisu': '破格玉米提拉米蘇',
    'clodsire eclair': '土王閃電泡芙',
    'scary face pancakes': '心跳加速鬼面鬆餅',
    'leaf tornado smoothie': '青草攪拌器果昔',
    'honey gather chocolate waffles': '採蜜可可鬆餅'
}

def get_bonus_pct(pot_size):
    if pot_size <= 10:
        return 19
    elif pot_size <= 15:
        return 20
    elif pot_size <= 20:
        return 21
    elif pot_size <= 30:
        return 25
    elif pot_size <= 45:
        return 35
    elif pot_size <= 60:
        return 48
    elif pot_size <= 75:
        return 61
    else:
        return 78

def main():
    print('Fetching main dishes page from Serebii...')
    req = urllib.request.Request(URL_DISHES, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

    curry_part = html[html.find('<h2>List of Curry</h2>'):html.find('<h2>List of Salads</h2>')]
    salad_part = html[html.find('<h2>List of Salads</h2>'):html.find('<h2>List of Desserts</h2>')]
    dessert_part = html[html.find('<h2>List of Desserts</h2>'):]

    categories = [('咖哩', curry_part), ('沙拉', salad_part), ('甜點', dessert_part)]

    all_dishes = []

    for cat_name, part in categories:
        rows = re.findall(
            r'<tr>\s*<td class=\"cen\"><a href=\"(/pokemonsleep/dishes/[^\"]+)\"><img src=\"([^\"]+)\"[^>]*>(?:</a>)?\s*</td>\s*<td class=\"fooinfo\"><a href=\"[^\"]+\"><u>([^<]+)</u></a></td>\s*<td class=\"fooinfo\">([^<]*)</td>\s*<td class=\"fooinfo\">(.*?)</td>\s*</tr>',
            part,
            re.DOTALL
        )
        print(f'Category {cat_name}: {len(rows)} rows found')
        for link, icon, name_en, desc, ings_html in rows:
            if 'mixed' in link:
                continue
            
            name_en_clean = name_en.strip()
            norm_key = name_en_clean.lower()
            name_cn = NAME_CN_MAP.get(norm_key, name_en_clean)

            # Parse ingredients
            ings = []
            ing_matches = re.findall(r'/pokemonsleep/ingredients/([a-z0-9_]+)\.shtml[^>]*>[^<]+</a>\s*\*\s*(\d+)', ings_html)
            for ing_slug, count_str in ing_matches:
                count = int(count_str)
                info = ING_MAP.get(ing_slug, {'name': ing_slug, 'icon': f'https://www.serebii.net/pokemonsleep/ingredients/{ing_slug}.png'})
                ings.append({'name': info['name'], 'count': count, 'icon': info['icon']})

            pot_size = sum(i['count'] for i in ings)
            bonus_pct = get_bonus_pct(pot_size)

            # Fetch detail page for base energy
            detail_url = 'https://www.serebii.net' + link
            base_energy = 0
            try:
                dreq = urllib.request.Request(detail_url, headers={'User-Agent': 'Mozilla/5.0'})
                dhtml = urllib.request.urlopen(dreq).read().decode('utf-8', errors='ignore')
                m = re.search(r'<td class=\"fooinfo\">\s*Level 1\s*</td>\s*<td class=\"fooinfo\">\s*0\s*</td>\s*<td class=\"fooinfo\">\s*([0-9,]+)\s*</td>', dhtml)
                if m:
                    base_energy = int(m.group(1).replace(',', ''))
                else:
                    m2 = re.search(r'Separate Base Power\s*</td>\s*<td class=\"fooinfo\"[^>]*>\s*([0-9,]+)\s*</td>', dhtml)
                    if m2:
                        base_energy = int(m2.group(1).replace(',', ''))
            except Exception as e:
                print(f'Error fetching {name_en_clean}: {e}')

            icon_url = 'https://www.serebii.net' + icon if not icon.startswith('http') else icon

            all_dishes.append({
                'name_cn': name_cn,
                'name_en': name_en_clean,
                'category': cat_name,
                'pot_size': pot_size,
                'base_energy': base_energy,
                'bonus_pct': bonus_pct,
                'icon': icon_url,
                'ingredients': ings
            })

    print(f'Total dishes constructed: {len(all_dishes)}')

    out_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'recipes.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(all_dishes, f, ensure_ascii=False, indent=2)

    print('Successfully saved data/recipes.json!')

if __name__ == '__main__':
    main()
