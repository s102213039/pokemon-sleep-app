import os
import sys
import json
import re
try:
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from google.auth.transport.requests import Request
    from google_auth_oauthlib.flow import InstalledAppFlow
except ImportError:
    Credentials = None
    build = None
    Request = None
    InstalledAppFlow = None

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly'
]

# 解決 Windows 主機 CP950/UTF-8 終端機編碼輸出問題
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ==============================================================================
# 1. 規則化配置與字典定義 (Rule-Based Configurations)
# ==============================================================================

# 亞種與特殊進化鏈自訂排版配置 (連續化排序與合併對應關係)
REGIONAL_FAMILIES_CONFIG = {
    "Vulpix_Standard": {
        "name": "六尾家族 (標準)",
        "members": ["37", "38"],  # 六尾, 九尾
        "base_no": "37",
        "is_evolution_chain": True
    },
    "Vulpix_Alolan": {
        "name": "六尾家族 (阿羅拉)",
        "members": ["7006", "7007"],  # 六尾(阿羅拉), 九尾(阿羅拉)
        "base_no": "7006",
        "is_evolution_chain": True
    },
    "Wooper_Standard": {
        "name": "烏波家族 (標準)",
        "members": ["194", "195"],  # 烏波, 沼王
        "base_no": "194",
        "is_evolution_chain": True
    },
    "Wooper_Paldean": {
        "name": "烏波家族 (帕底亞)",
        "members": ["7054", "980"],  # 烏波(帕底亞), 土王
        "base_no": "7054",
        "is_evolution_chain": True
    },
    "Pikachu_Standard": {
        "name": "皮卡丘家族 (標準)",
        "members": ["172", "25", "26"],  # 皮丘, 皮卡丘, 雷丘
        "base_no": "172",
        "is_evolution_chain": True
    },
    "Pikachu_Special": {
        "name": "皮卡丘家族 (特殊)",
        "members": ["9001", "9002"],  # 皮卡丘(萬聖節), 皮卡丘(佳節)
        "base_no": "9001",
        "is_evolution_chain": False
    },
    "Spheal_Standard": {
        "name": "海豹球家族 (標準)",
        "members": ["363", "364", "365"],  # 海豹球, 海魔獅, 帝牙海獅
        "base_no": "363",
        "is_evolution_chain": True
    },
    "Spheal_Special": {
        "name": "海豹球家族 (特殊)",
        "members": ["9006"],  # 海豹球(佳節)
        "base_no": "9006",
        "is_evolution_chain": False
    }
}

# 動態解析自訂排序與排除偵測字典，消除硬編碼 (Hardcoding Elimination)
CUSTOM_ORDER_MAP = {}
MANUAL_FAMILIES = []
EXCLUDED_NOS = set()

# prefix-based 漸進式排序權重，確保亞種與主系列連續排序且永不交錯
group_indices = {}
for fam_id, cfg in REGIONAL_FAMILIES_CONFIG.items():
    group_prefix = fam_id.split('_')[0]
    if group_prefix not in group_indices:
        group_indices[group_prefix] = 1
        
    if cfg.get("is_evolution_chain", False):
        MANUAL_FAMILIES.append(cfg["members"])
        
    EXCLUDED_NOS.update(cfg["members"])
    for no in cfg["members"]:
        CUSTOM_ORDER_MAP[no] = group_indices[group_prefix]
        group_indices[group_prefix] += 1

# 參考表欄位對應關係 (0-indexed based on Row 3)
REF_MAPPING = {
    'No.': 1,
    '圖示': 2,
    '寶可夢': 5,
    '屬性': 7,
    '得意': 9,
    '❤️': 10,
    '持有': 11,
    '食材1': 16,
    '1': 17,
    '30_1': 18,
    '60_1': 19,
    '食材2': 21,
    '30_2': 22,
    '60_2': 23,
    '食材3': 25,
    '60_3': 26,
    '食材率': 27,
    '技能率': 28,
    '間隔': 30,
    '主技能': 31,
    '進化需求': 32,
    '最終': 33
}

# 得意 (Column D) 與主技能 (Column S) 的垂直合併範圍對應
MERGE_COLUMNS = [
    (3, 4),   # 得意 (D)
    (18, 19)  # 主技能 (S)
]

# ==============================================================================
# 2. 核心文字處理與字型格式化函數 (Core Text & Formatting Helpers)
# ==============================================================================

def clean_no(val):
    if not val:
        return ""
    val_str = str(val).strip()
    if '.' in val_str:
        try:
            return str(int(float(val_str)))
        except ValueError:
            pass
    try:
        return str(int(val_str))
    except ValueError:
        return val_str

def format_no(val):
    if not val:
        return ""
    val_str = str(val).strip()
    try:
        val_int = int(val_str)
        if val_int < 1000:
            return f"{val_int:03d}"
        return str(val_int)
    except ValueError:
        return val_str

def format_pct(val):
    if not val:
        return ""
    val_raw_str = str(val).strip()
    val_str = val_raw_str.replace('%', '').strip()
    if val_str == '--' or not val_str:
        return ""
    try:
        float_val = float(val_str)
        if '%' not in val_raw_str and float_val <= 1.0:
            float_val = float_val * 100.0
        return f"{float_val:.2f}%"
    except ValueError:
        return val

def format_interval_str(seconds_val):
    if not seconds_val:
        return ""
    seconds_str = str(seconds_val).replace('=', '').strip()
    try:
        seconds = float(seconds_str)
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    except ValueError:
        return seconds_val

def clean_val(val):
    if not val:
        return ""
    val_str = str(val).strip()
    if val_str in ['--', '不可進化', '不可進化。']:
        return ""
    return val_str

def normalize_name(n):
    if not n:
        return ""
    return str(n).replace("的樣子", "").replace("（", "").replace("）", "").replace("(", "").replace(")", "").replace(" ", "").strip()

def to_half_width(text):
    if not text:
        return text
    text_str = str(text)
    # 手動映射特殊非 FF01-FF5E 範圍的全形符號 (如句號、智慧引號、全形空格)
    manual_map = {
        '\u3002': '.',  # 句號 。 -> .
        '\u201c': '"',  # 雙引號 “ -> "
        '\u201d': '"',  # 雙引號 ” -> "
        '\u2018': "'",  # 單引號 ‘ -> '
        '\u2019': "'",  # 單引號 ’ -> '
        '\u3000': ' ',  # 全形空格 　 -> 半形空格
    }
    for k, v in manual_map.items():
        text_str = text_str.replace(k, v)
        
    res = []
    for char in text_str:
        code = ord(char)
        # 全形字元 (除空格外) 的 Unicode 範圍是 0xFF01 到 0xFF5E
        if 0xFF01 <= code <= 0xFF5E:
            res.append(chr(code - 0xFEE0))
        else:
            res.append(char)
    return "".join(res)

def make_cell_data(val, bg_color, note=None):
    cell = {
        'userEnteredFormat': {
            'backgroundColor': bg_color,
            'horizontalAlignment': 'CENTER',
            'textFormat': {'fontFamily': 'Arial'}
        }
    }
    if note:
        cell['note'] = str(note)
        
    val_str = str(val).strip()
    if not val_str:
        cell['userEnteredValue'] = {'stringValue': ''}
    elif val_str.startswith('='):
        cell['userEnteredValue'] = {'formulaValue': val_str}
    else:
        try:
            if val_str.startswith('0') and len(val_str) > 1 and not val_str.startswith('0.'):
                cell['userEnteredValue'] = {'stringValue': val_str}
            else:
                float_val = float(val_str)
                cell['userEnteredValue'] = {'numberValue': float_val}
        except ValueError:
            cell['userEnteredValue'] = {'stringValue': val_str}
    return cell

# ==============================================================================
# 3. 主程序邏輯 (Main Program Logic)
# ==============================================================================

def main():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                print("嘗試自動更新過期的 Token...")
                creds.refresh(Request())
                with open('token.json', 'w', encoding='utf-8') as token_file:
                    token_file.write(creds.to_json())
                print("Token 更新成功。")
            except Exception as e:
                print(f"Token 更新失敗: {e}，將重新啟動身份驗證流程。")
                creds = None
        
        if not creds:
            print("開始啟動瀏覽器進行 Google 帳號授權驗證...")
            if not os.path.exists('credentials.json'):
                print("錯誤: 找不到 credentials.json 檔案。請確保此檔案存在於工作目錄中。")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
            with open('token.json', 'w', encoding='utf-8') as token_file:
                token_file.write(creds.to_json())
            print("身分驗證完成，新的 token 已儲存至 token.json。")

    service = build('sheets', 'v4', credentials=creds)
    
    target_spreadsheet_id = '1BD05wG8Gy3EUNzhg5mtErllr-Rkv20iFGsZ8kNsuUJ0'
    ref_spreadsheet_id = '1JkV2QxGGFDBzUfDxfOhTD3hrJJzu9qCS4A6c_HicIDc'
    
    # A. 載入 B 欄特殊自訂圖示設定檔
    special_icons = {}
    if os.path.exists('special_icons.json'):
        with open('special_icons.json', 'r', encoding='utf-8') as f:
            special_icons = json.load(f)
        print(f"成功自本地載入 {len(special_icons)} 個特殊圖示保護設定。")
    norm_special_icons = {normalize_name(k): v for k, v in special_icons.items()}
    
    # 0. 讀取工作表元數據 (獲得 sheetId)
    metadata = service.spreadsheets().get(spreadsheetId=target_spreadsheet_id).execute()
    sheet = metadata.get('sheets', [])[0]
    sheet_id = sheet.get('properties', {}).get('sheetId')
    
    # 1. 讀取 Reference 屬性對應與全部資料 (使用 FORMULA 模式以抓取食材 IMAGE 公式)
    print("正在讀取 機率參考一覽表 (FORMULA 模式)...")
    res_ref = service.spreadsheets().values().get(
        spreadsheetId=ref_spreadsheet_id,
        range="'機率表'!A4:CW260",
        valueRenderOption='FORMULA'
    ).execute()
    rows_ref = res_ref.get('values', [])
    
    ref_pokemons = []
    ref_by_no = {}
    ref_order_map = {}
    no_to_attr = {}
    
    for idx, r in enumerate(rows_ref):
        if not r or len(r) < 8:
            continue
        no_val = r[REF_MAPPING['No.']]
        name_val = r[REF_MAPPING['寶可夢']]
        attr_val = r[REF_MAPPING['屬性']]
        if not name_val:
            continue
        no = clean_no(no_val)
        name = name_val.strip()
        
        entry = {
            'no': no_val,
            'clean_no': no,
            'name': name,
            'attr': attr_val.strip() if attr_val else "",
            'original_row': r
        }
        ref_pokemons.append(entry)
        ref_by_no[no] = entry
        ref_order_map[no] = idx + 1
        if attr_val:
            no_to_attr[no] = attr_val.strip()

    # 1.5 萃取食材名稱 ➡️ 食材圖示公式
    print("正在從參考表中萃取所有食材的圖示 URL...")
    ing_name_to_icon = {}
    for r in rows_ref:
        if len(r) > 16:
            icon1 = r[15]
            name1 = r[16]
            if name1 and str(icon1).startswith('='):
                ing_name_to_icon[name1.strip()] = icon1.strip()
        if len(r) > 21:
            icon2 = r[20]
            name2 = r[21]
            if name2 and str(icon2).startswith('='):
                ing_name_to_icon[name2.strip()] = icon2.strip()
        if len(r) > 25:
            icon3 = r[24]
            name3 = r[25]
            if name3 and str(icon3).startswith('='):
                ing_name_to_icon[name3.strip()] = icon3.strip()
    print(f"成功萃取了 {len(ing_name_to_icon)} 種不同食材的圖示對照。")
 
    # 2. 讀取 Target (神奇寶貝Sleep) 格式與數值，建立 No. ➡️ 背景底色對照
    print("正在讀取 神奇寶貝Sleep 工作表格式與數據...")
    res_target = service.spreadsheets().get(
        spreadsheetId=target_spreadsheet_id,
        ranges=["'工作表1'!A2:U250"],
        includeGridData=True
    ).execute()
    
    rowData = res_target.get('sheets', [])[0].get('data', [])[0].get('rowData', [])
    
    # 靜態特製屬性配色調色盤保護機制 (確保工作表全空時，依然 100% 渲染完美的視覺背景色彩)
    attr_to_bg = {
        '草': {'red': 0.8509804, 'green': 0.91764706, 'blue': 0.827451},
        '火': {'red': 0.94509804, 'green': 0.81960785, 'blue': 0.81960785},
        '水': {'red': 0.8666667, 'green': 0.9098039, 'blue': 0.99215686},
        '蟲': {'red': 0.9019608, 'green': 0.91764706, 'blue': 0.827451},
        '一般': {'red': 0.9372549, 'green': 0.9372549, 'blue': 0.9372549},
        '毒': {'red': 0.9254902, 'green': 0.8980392, 'blue': 0.9843137},
        '電': {'red': 1, 'green': 0.9490196, 'blue': 0.8},
        '妖精': {'red': 0.99607843, 'green': 0.94509804, 'blue': 0.94509804},
        '冰': {'red': 0.8, 'green': 0.95686275, 'blue': 0.91764706},
        '地面': {'red': 0.9019608, 'green': 0.7764706, 'blue': 0.6862745},
        '格鬥': {'red': 1, 'green': 0.9411765, 'blue': 0.88235295},
        '岩石': {'red': 0.8117647, 'green': 0.78039217, 'blue': 0.7372549},
        '惡': {'red': 0.7176471, 'green': 0.7176471, 'blue': 0.7176471},
        '鋼': {'red': 0.70980394, 'green': 0.7764706, 'blue': 0.8117647},
        '飛行': {'red': 1, 'green': 1, 'blue': 1},
        '幽靈': {'red': 0.8862745, 'green': 0.7882353, 'blue': 0.88235295},
        '超能力': {'red': 1, 'green': 0.89411765, 'blue': 0.9647059},
        '龍': {'red': 0.7058824, 'green': 0.8, 'blue': 0.95686275}
    }
    
    no_to_bg = {}
    target_pokemons = []
    target_by_no = {}
    target_by_name = {}
    
    for idx, row in enumerate(rowData):
        cells = row.get('values', [])
        if not cells or len(cells) < 3:
            continue
            
        no_val = cells[0].get('formattedValue', "").strip()
        if not no_val:
            uev_col0 = cells[0].get('userEnteredValue', {})
            if 'stringValue' in uev_col0:
                no_val = uev_col0['stringValue']
            elif 'numberValue' in uev_col0:
                no_val = str(uev_col0['numberValue'])
                
        clean_n = clean_no(no_val)
        
        name = cells[2].get('formattedValue', "").strip()
        if not name:
            uev_col2 = cells[2].get('userEnteredValue', {})
            if 'stringValue' in uev_col2:
                name = uev_col2['stringValue'].strip()
                
        if not clean_n and not name:
            continue
            
        # 獲取背景底色
        cell_format = cells[2].get('userEnteredFormat', {})
        bg_color = cell_format.get('backgroundColor', {})
        
        if clean_n and bg_color and (bg_color.get('red') is not None or bg_color.get('green') is not None or bg_color.get('blue') is not None):
            no_to_bg[clean_n] = bg_color
                
        orig_row = []
        for cell in cells:
            val = cell.get('formattedValue', "")
            uev = cell.get('userEnteredValue', {})
            if 'formulaValue' in uev:
                val = uev['formulaValue']
            orig_row.append(val)
            
        while len(orig_row) < 21:
            orig_row.append("")
            
        entry = {
            'no': no_val,
            'clean_no': clean_n,
            'name': name,
            'original_row': orig_row,
            'row_num_target': idx + 2
        }
        target_pokemons.append(entry)
        if clean_n:
            target_by_no[clean_n] = entry
        norm_n = normalize_name(name)
        if norm_n:
            target_by_name[norm_n] = entry

    # 3. 本機行號優先排序與自適應比例尺演算法 (Scale-Adaptive Priority Sorting)
    prefixes = list(set(fam_id.split('_')[0] for fam_id in REGIONAL_FAMILIES_CONFIG.keys()))
    family_prefix_nos = {}
    for prefix in prefixes:
        family_prefix_nos[prefix] = []
        for fam_id, cfg in REGIONAL_FAMILIES_CONFIG.items():
            if fam_id.startswith(prefix + "_"):
                family_prefix_nos[prefix].extend(cfg["members"])
                
    min_rows = {}
    for prefix in prefixes:
        min_rows[prefix] = 999.0
        
    for entry in target_pokemons:
        no = entry['clean_no']
        row_num = float(entry['row_num_target'])
        for prefix, nos in family_prefix_nos.items():
            if no in nos:
                min_rows[prefix] = min(min_rows[prefix], row_num)
                break
                
    scales = {}
    for prefix in prefixes:
        if min_rows[prefix] >= 999.0:
            # 尋找 Standard 分組的 base_no 作為備用行號
            base_no = None
            for fam_id, cfg in REGIONAL_FAMILIES_CONFIG.items():
                if fam_id == prefix + "_Standard":
                    base_no = cfg["base_no"]
                    break
            ref_idx = ref_order_map.get(base_no, 10) if base_no else 10
            min_rows[prefix] = 0.001 * float(ref_idx)
            scales[prefix] = 0.0001
        else:
            scales[prefix] = 0.01
            
    target_keys = {}
    for entry in target_pokemons:
        no = entry['clean_no']
        found_prefix = None
        for prefix, nos in family_prefix_nos.items():
            if no in nos:
                found_prefix = prefix
                break
                
        if found_prefix:
            key = min_rows[found_prefix] + (scales[found_prefix] * CUSTOM_ORDER_MAP[no])
        else:
            key = float(entry['row_num_target'])
            
        target_keys[no] = key
        entry['sort_key'] = key

    # 4. 缺失寶可夢比對與排序定位分配
    missing_pokemons = []
    for no, ref_entry in ref_by_no.items():
        if no not in target_by_no:
            ref_idx = ref_order_map[no]
            
            # 在參考表中尋找最鄰近之前置寶可夢作為插入序號基準
            predecessor_row_key = 0.0
            offset = 0
            for prev_idx in range(ref_idx - 1, 0, -1):
                prev_no = None
                for k, v in ref_order_map.items():
                    if v == prev_idx:
                        prev_no = k
                        break
                if prev_no and prev_no in target_by_no:
                    predecessor_row_key = target_keys[prev_no]
                    offset = ref_idx - prev_idx
                    break
            
            found_prefix = None
            for prefix, nos in family_prefix_nos.items():
                if no in nos:
                    found_prefix = prefix
                    break
                    
            if found_prefix:
                key = min_rows[found_prefix] + (scales[found_prefix] * CUSTOM_ORDER_MAP[no])
            elif predecessor_row_key == 0.0:
                key = 0.001 * ref_idx
            else:
                key = predecessor_row_key + (0.001 * offset)
                
            entry = {
                'no': ref_entry['no'],
                'clean_no': no,
                'name': ref_entry['name'],
                'sort_key': key,
                'is_missing': True
            }
            missing_pokemons.append(entry)

    # 全局數據整合排序
    all_pokemons = []
    for entry in target_pokemons:
        entry['is_missing'] = False
        all_pokemons.append(entry)
    for entry in missing_pokemons:
        all_pokemons.append(entry)
        
    all_pokemons.sort(key=lambda x: x['sort_key'])

    # 5. 全自動「動態進化家族偵測與合併格分析」 (Dynamic Family & Evolved State Resolving)
    print("正在動態剖析進化鏈家族與進化形態關係...")
    detected_families = []
    current_family = []
    
    for entry in all_pokemons:
        no = entry['clean_no']
        ref_entry = ref_by_no.get(no)
        
        # 亞種手動/保障家族在動態偵測時進行獨立封鎖切割，避免混雜
        if not ref_entry or no in EXCLUDED_NOS:
            if current_family:
                detected_families.append(current_family)
            current_family = [entry]
            continue
            
        r = ref_entry['original_row']
        req = clean_val(r[REF_MAPPING['進化需求']])
        得意 = clean_val(r[REF_MAPPING['得意']])
        技能 = clean_val(r[REF_MAPPING['主技能']])
        
        # 如果是基礎形態（req 為空），直接做新進化家族的切割
        if req == "":
            if current_family:
                detected_families.append(current_family)
            current_family = [entry]
        else:
            if current_family:
                base_entry = current_family[0]
                base_ref = ref_by_no.get(base_entry['clean_no'])
                if base_ref:
                    base_r = base_ref['original_row']
                    base_得意 = clean_val(base_r[REF_MAPPING['得意']])
                    base_技能 = clean_val(base_r[REF_MAPPING['主技能']])
                    
                    if 得意 == base_得意 and 技能 == base_技能:
                        current_family.append(entry)
                    else:
                        detected_families.append(current_family)
                        current_family = [entry]
                else:
                    current_family.append(entry)
            else:
                current_family = [entry]
                
    if current_family:
        detected_families.append(current_family)

    # 規則化動態屬性派生與寫入標記 (Evolved Status Deriving)
    # 規則：在任意進化家族中，首個成員是基礎形態 (is_evolved = False)；其餘成員均是進化形態 (is_evolved = True)
    evolved_resolved_nos = set()
    
    for family in detected_families:
        # 單一成員家族無須合併
        if len(family) < 2:
            continue
        # 除了第一個成員以外，全部標記為 evolved (需要將得意與技能欄位留白，由 Sheets Merges 繼承)
        for p in family[1:]:
            evolved_resolved_nos.add(p['clean_no'])
            
    # 對於亞種及特殊定製家族，完全基於 base_no 規則與 is_evolution_chain 配置判定 evolved 屬性
    for fam_id, cfg in REGIONAL_FAMILIES_CONFIG.items():
        if cfg.get("is_evolution_chain", False):
            for no in cfg["members"]:
                if no != cfg["base_no"]:
                    evolved_resolved_nos.add(no)

    # 6. 生成 RowData 物件列表
    api_rows = []
    no_to_row = {}
    default_bg = attr_to_bg.get('一般', {'red': 0.9372549, 'green': 0.9372549, 'blue': 0.9372549})
    
    for idx, entry in enumerate(all_pokemons, 2): # Row 2 is index 2
        no = entry['clean_no']
        name = entry['name']
        is_evolved = no in evolved_resolved_nos
        no_to_row[no] = idx
            
        # 優先從靜態屬性配色庫獲取正確背景色，徹底打破空白/灰色覆寫循環
        attr = no_to_attr.get(no)
        bg_color = attr_to_bg.get(attr) if attr else None
        
        if bg_color is None:
            if no in no_to_bg:
                bg_color = no_to_bg[no]
            else:
                bg_color = default_bg

        # B 欄特殊圖示永久鎖定保護
        norm_name = normalize_name(name)
        if norm_name in norm_special_icons:
            icon_formula = norm_special_icons[norm_name]
        else:
            icon_formula = f'=IMAGE("https://www.serebii.net/pokemonsleep/pokemon/icon/"&A{idx}&".png")'
        
        row_cells = [("", None) for _ in range(21)]
        row_cells[0] = (format_no(entry['no']), None)
        row_cells[1] = (icon_formula, None)
        
        # Find matching row in target sheet
        target_row_entry = None
        if no and no in target_by_no:
            target_row_entry = target_by_no[no]
        else:
            norm_name = normalize_name(name)
            if norm_name in target_by_name:
                target_row_entry = target_by_name[norm_name]

        # 優先採用原表中的寶可夢名稱，尊重使用者命名習慣
        display_name = name
        if no == "9":
            display_name = "水箭龜"
        elif target_row_entry:
            display_name = target_row_entry['name']
        elif no in ref_by_no:
            display_name = ref_by_no[no]['name']
        row_cells[2] = (display_name, None)
            
        ref_entry = ref_by_no.get(no)
        if ref_entry:
            r = ref_entry['original_row']
            
            # 得意欄位 (D, index 3)：遵循留白繼承模式
            if not is_evolved:
                row_cells[3] = (clean_val(r[REF_MAPPING['得意']]), None)
            else:
                row_cells[3] = ("", None)
                
            # 主技能欄位 (S, index 18)：優先採用原表主技能，只有當原表主技能為空白時才自參考表填入，絕不更動原有數據
            main_skill = ""
            if target_row_entry:
                orig_row = target_row_entry['original_row']
                target_skill = orig_row[18].strip() if len(orig_row) > 18 else ""
                if target_skill and target_skill != '--':
                    main_skill = target_skill
            
            if not main_skill:
                if not is_evolved:
                    main_skill = clean_val(r[REF_MAPPING['主技能']])
                else:
                    main_skill = ""
            row_cells[18] = (main_skill, None)
                
            # 食材 1, 2, 3 與數量欄位 (G 到 O)：完全解除合併，每列完整填充與懸停註解 Note 設置
            # 食材1
            ing_name1 = clean_val(r[REF_MAPPING['食材1']])
            if ing_name1 in ing_name_to_icon:
                row_cells[6] = (ing_name_to_icon[ing_name1], None)
            else:
                row_cells[6] = (ing_name1, None)
            row_cells[7] = (clean_val(r[REF_MAPPING['1']]), None)
            row_cells[8] = (clean_val(r[REF_MAPPING['30_1']]), None)
            row_cells[9] = (clean_val(r[REF_MAPPING['60_1']]), None)
            
            # 食材2
            ing_name2 = clean_val(r[REF_MAPPING['食材2']])
            if ing_name2 in ing_name_to_icon:
                row_cells[10] = (ing_name_to_icon[ing_name2], None)
            else:
                row_cells[10] = (ing_name2, None)
            row_cells[11] = (clean_val(r[REF_MAPPING['30_2']]), None)
            row_cells[12] = (clean_val(r[REF_MAPPING['60_2']]), None)
            
            # 食材3
            ing_name3 = clean_val(r[REF_MAPPING['食材3']])
            if ing_name3 in ing_name_to_icon:
                row_cells[13] = (ing_name_to_icon[ing_name3], None)
            else:
                row_cells[13] = (ing_name3, None)
            row_cells[14] = (clean_val(r[REF_MAPPING['60_3']]), None)
            
            # 數值更新
            row_cells[4] = (clean_val(r[REF_MAPPING['❤️']]), None)
            row_cells[5] = (clean_val(r[REF_MAPPING['持有']]), None)
            row_cells[15] = (format_pct(r[REF_MAPPING['食材率']]), None)
            row_cells[16] = (format_pct(r[REF_MAPPING['技能率']]), None)
            
            # 間隔時間特殊處理：由 Column AD (幫忙間隔秒數) 實體轉換，解決跨工作表公式失效
            seconds_val = r[REF_MAPPING['間隔'] - 1] if len(r) > (REF_MAPPING['間隔'] - 1) else ""
            row_cells[17] = (format_interval_str(seconds_val), None)
            
            row_cells[19] = (clean_val(r[REF_MAPPING['進化需求']]), None)
            row_cells[20] = (clean_val(r[REF_MAPPING['最終']]), None)
        else:
            orig_row = entry['original_row']
            orig_row_padded = orig_row + [""] * (21 - len(orig_row))
            for i in range(2, 21):
                if i == 1:
                    continue
                val = orig_row_padded[i]
                if i == 19 and str(val).strip() in ["不可進化", "不可進化。"]:
                    val = ""
                if i in [6, 10, 13] and val in ing_name_to_icon:
                    row_cells[i] = (ing_name_to_icon[val], None)
                else:
                    row_cells[i] = (val, None)

        cell_data_list = []
        for cell_val, cell_note in row_cells:
            cell_data_list.append(make_cell_data(cell_val, bg_color, cell_note))
            
        entry['new_row'] = [val for val, _ in row_cells]
        api_rows.append({'values': cell_data_list})

    # 7. 全自動生成對齊的合併儲存格請求 (100% 精準無衝突)
    print("正在動態生成家族合併儲存格請求...")
    merge_requests = []
    
    # A. 動態家族合併處理
    for family in detected_families:
        if len(family) < 2:
            continue
            
        new_rows = []
        for p in family:
            no = p['clean_no']
            if no in no_to_row:
                new_rows.append(no_to_row[no])
                
        if len(new_rows) == len(family):
            new_rows.sort()
            is_contiguous = all(new_rows[i] == new_rows[i-1] + 1 for i in range(1, len(new_rows)))
            if is_contiguous:
                start_row_idx = new_rows[0] - 1
                end_row_idx = new_rows[-1]
                
                for col_start, col_end in MERGE_COLUMNS:
                    merge_requests.append({
                        'mergeCells': {
                            'range': {
                                'sheetId': sheet_id,
                                'startRowIndex': start_row_idx,
                                'endRowIndex': end_row_idx,
                                'startColumnIndex': col_start,
                                'endColumnIndex': col_end
                            },
                            'mergeType': 'MERGE_ALL'
                        }
                    })
                    
    # B. 亞種手動/保障家族合併處理 (雙重保障，絕無衝突)
    for member_nos in MANUAL_FAMILIES:
        new_rows = []
        for no in member_nos:
            if no in no_to_row:
                new_rows.append(no_to_row[no])
                    
        if len(new_rows) == len(member_nos):
            new_rows.sort()
            is_contiguous = all(new_rows[i] == new_rows[i-1] + 1 for i in range(1, len(new_rows)))
            if is_contiguous:
                start_row_idx = new_rows[0] - 1
                end_row_idx = new_rows[-1]
                
                for col_start, col_end in MERGE_COLUMNS:
                    exists = False
                    for req in merge_requests:
                        rng = req['mergeCells']['range']
                        if rng['startRowIndex'] == start_row_idx and rng['endRowIndex'] == end_row_idx and rng['startColumnIndex'] == col_start and rng['endColumnIndex'] == col_end:
                            exists = True
                            break
                    if not exists:
                        merge_requests.append({
                            'mergeCells': {
                                'range': {
                                    'sheetId': sheet_id,
                                    'startRowIndex': start_row_idx,
                                    'endRowIndex': end_row_idx,
                                    'startColumnIndex': col_start,
                                    'endColumnIndex': col_end
                                },
                                'mergeType': 'MERGE_ALL'
                            }
                        })

    print(f"成功動態生成了 {len(merge_requests)} 個合併儲存格請求。")

    # 7.5 全局全形符號半形化替代：將所有全形符號與全形空格轉換為半形符號
    # 依照使用者重要指示：在程式碼最後面以 replace/Unicode 替代方式處理，絕不動到任何底層數據！
    print("正在將所有產出的全形符號與全形空格轉換為半形符號...")
    for r in api_rows:
        for val_cell in r.get('values', []):
            if 'userEnteredValue' in val_cell:
                uev = val_cell['userEnteredValue']
                if 'stringValue' in uev:
                    uev['stringValue'] = to_half_width(uev['stringValue'])
                elif 'formulaValue' in uev:
                    uev['formulaValue'] = to_half_width(uev['formulaValue'])
            if 'note' in val_cell and val_cell['note']:
                val_cell['note'] = to_half_width(val_cell['note'])

    # 8. 比對同步前的變更項目
    print("=" * 80)
    print("正在比對同步前的變更項目...")
    
    column_names = {
        0: "No.",
        1: "圖示",
        2: "寶可夢",
        3: "得意",
        4: "❤️",
        5: "持有",
        6: "食材1",
        7: "1",
        8: "30_1",
        9: "60_1",
        10: "食材2",
        11: "30_2",
        12: "60_2",
        13: "食材3",
        14: "60_3",
        15: "食材率",
        16: "技能率",
        17: "間隔",
        18: "主技能",
        19: "進化需求",
        20: "最終"
    }
     
    added_list = []
    modified_list = []
    
    for entry in all_pokemons:
        no = entry['clean_no']
        name = entry['name']
        
        if entry.get('is_missing', False):
            added_list.append(f" - [新增] No.{format_no(no)} {name}")
        else:
            target_row_entry = target_by_no.get(no)
            if not target_row_entry:
                norm_name = normalize_name(name)
                target_row_entry = target_by_name.get(norm_name)
                
            if target_row_entry:
                old_row = target_row_entry['original_row']
                new_row = entry.get('new_row')
                
                if new_row:
                    diffs = []
                    for col_idx in range(21):
                        # 忽略圖示網址的微小差異比較
                        if col_idx in [1, 6, 10, 13]:
                            continue
                        
                        old_val = old_row[col_idx].strip() if col_idx < len(old_row) else ""
                        new_val = str(new_row[col_idx]).strip()
                        
                        if old_val != new_val:
                            col_name = column_names.get(col_idx, f"Col {col_idx}")
                            diffs.append(f"{col_name}: '{old_val}' -> '{new_val}'")
                    
                    if diffs:
                        modified_list.append(f" - [修改] No.{format_no(no)} {name}: {', '.join(diffs)}")
     
    if added_list:
        print(f"\n將新增 {len(added_list)} 隻寶可夢:")
        for item in added_list:
            print(item)
    else:
        print("\n無新增的寶可夢。")
        
    if modified_list:
        print(f"\n將修改 {len(modified_list)} 隻寶可夢的屬性/數值:")
        for item in modified_list:
            print(item)
    else:
        print("\n無修改的寶可夢數值。")
    print("=" * 80)

    # 8.5 執行批次寫入與排版
    print("準備發送全局 batchUpdate 請求...")
    
    # 清空 values
    print("正在清空舊數據的 values '工作表1'!A2:U350 ...")
    service.spreadsheets().values().clear(
        spreadsheetId=target_spreadsheet_id,
        range="'工作表1'!A2:U350"
    ).execute()
    
    requests = []
    
    # 解除所有舊合併 (完全清空，避免重疊衝突)
    requests.append({
        'unmergeCells': {
            'range': {
                'sheetId': sheet_id,
                'startRowIndex': 1,
                'endRowIndex': 350,
                'startColumnIndex': 0,
                'endColumnIndex': 21
            }
        }
    })
    
    # 寫入數據、公式、底色與註解 (排除邊框)
    requests.append({
        'updateCells': {
            'rows': api_rows,
            'fields': 'userEnteredValue,userEnteredFormat.backgroundColor,userEnteredFormat.textFormat,userEnteredFormat.horizontalAlignment,note',
            'range': {
                'sheetId': sheet_id,
                'startRowIndex': 1,
                'endRowIndex': 1 + len(api_rows),
                'startColumnIndex': 0,
                'endColumnIndex': 21
            }
        }
    })
    
    # 套用全新對齊的合併單元格
    requests.extend(merge_requests)
    
    print("正在發送全局 batchUpdate (Unmerge ➡️ Write ➡️ Re-merge)...")
    service.spreadsheets().batchUpdate(
        spreadsheetId=target_spreadsheet_id,
        body={'requests': requests}
    ).execute()
    
    print("=" * 80)
    print("【極致完美同步完成】您的 Google Sheets 已全自動對齊、底色著色，且合併單元格與自訂圖示完全配置！")
    print(f" - 處理寶可夢總數: {len(api_rows)} 隻")
    print(f" - 重新對齊合併單元格數: {len(merge_requests)} 個")
    print("=" * 80)

if __name__ == '__main__':
    main()
