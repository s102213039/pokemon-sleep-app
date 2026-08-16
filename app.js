const GH_OWNER    = 's102213039';
const GH_REPO     = 'pokemon-sleep-app';
const GH_WORKFLOW = 'sync.yml';
const GH_API_BASE = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`;
const GH_PAT_KEY  = 'pksleep_gh_pat';

const DEFAULT_SVG_ICON = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%2338bdf8"/></svg>';

const SPECIAL_ICON_MAP = {
  '9001': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png',
  '9002': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png',
  '9003': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png',
  '9004': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png',
  '9005': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png',
  '9006': 'https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png',
  '7006': 'https://www.serebii.net/pokemonsleep/pokemon/icon/037-alolanvulpix.png',
  '7007': 'https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png',
  '7054': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '8001': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png',
  '150':  'https://www.serebii.net/pokedex-sv/icon/150.png',
  '皮卡丘（萬聖節）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png',
  '皮卡丘（佳節）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png',
  '皮卡丘（船長）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png',
  '六尾（阿羅拉的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/037-alolanvulpix.png',
  '六尾（阿羅拉）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/037-alolanvulpix.png',
  '九尾（阿羅拉的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png',
  '九尾（阿羅拉）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png',
  '伊布（佳節）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png',
  '伊布（萬聖節）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png',
  '烏波（阿羅拉的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '烏波（帕底亞的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '烏波（帕底亞）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png',
  '海豹球（佳節）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png',
  '顫弦蠑螈（低調的樣子）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png',
  '顫弦蠑螈（低調）': 'https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png',
  '超夢': 'https://www.serebii.net/pokedex-sv/icon/150.png'
};

function getIconUrl(p) {
  if (!p) return DEFAULT_SVG_ICON;
  const idStr = String(p.id || p.formatted_no || '');
  if (SPECIAL_ICON_MAP[idStr]) return SPECIAL_ICON_MAP[idStr];
  if (p.name_cn && SPECIAL_ICON_MAP[p.name_cn]) return SPECIAL_ICON_MAP[p.name_cn];
  if (p.icon && typeof p.icon === 'string' && p.icon.trim() !== '') return p.icon;
  if (p.icon_url && typeof p.icon_url === 'string' && p.icon_url.trim() !== '') return p.icon_url;
  if (p.formatted_no) return `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png`;
  return DEFAULT_SVG_ICON;
}

function getItemHelpInterval(p) {
  if (!p) return 0;
  if (typeof p.helpInterval === 'number') return p.helpInterval;
  if (typeof p.interval === 'number') return p.interval;
  const val = p.interval || p.helpInterval;
  if (typeof val === 'string') {
    const parts = val.split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function getItemIngredientRate(p) {
  if (!p) return 0;
  if (typeof p.ingredientRate === 'number') return p.ingredientRate;
  if (typeof p.ingredient_rate === 'number') return p.ingredient_rate;
  const parsed = parseFloat(p.ingredient_rate || p.ingredientRate || '0');
  return isNaN(parsed) ? 0 : parsed;
}

function getItemCarry(p) {
  if (!p) return 0;
  if (typeof p.carryCapacity === 'number') return p.carryCapacity;
  if (typeof p.carry === 'number') return p.carry;
  const parsed = parseInt(p.carry || p.carryCapacity || '0', 10);
  return isNaN(parsed) ? 0 : parsed;
}

function ingQtyBadges(ing, idx) {
  if (!ing) return '';
  const qtys = [];
  if (idx === 0) {
    if (ing.l1)  qtys.push(ing.l1);
    if (ing.l30) qtys.push(ing.l30);
    if (ing.l60) qtys.push(ing.l60);
  } else if (idx === 1) {
    if (ing.l30) qtys.push(ing.l30);
    if (ing.l60) qtys.push(ing.l60);
  } else {
    if (ing.l60) qtys.push(ing.l60);
  }
  if (!qtys.length) return '';
  return `<span class="ing-qty-group" title="${ing.name || ''}">${qtys.map(q => `<span class="ing-qty">${q}</span>`).join('<span class="ing-arrow">→</span>')}</span>`;
}

/* ─── 🫐 樹果與屬性對應字典 (Berry & Type Mapping) ───────── */
const BERRY_DATA = [
  { name: '柿仔果', type: '一般', icon: 'https://www.serebii.net/pokemonsleep/berries/persimberry.png' },
  { name: '蘋野果', type: '火',   icon: 'https://www.serebii.net/pokemonsleep/berries/leppaberry.png' },
  { name: '橙橙果', type: '水',   icon: 'https://www.serebii.net/pokemonsleep/berries/oranberry.png' },
  { name: '異奇果', type: '電',   icon: 'https://www.serebii.net/pokemonsleep/berries/grepaberry.png' },
  { name: '墨莓果', type: '草',   icon: 'https://www.serebii.net/pokemonsleep/berries/durinberry.png' },
  { name: '生薑果', type: '冰',   icon: 'https://www.serebii.net/pokemonsleep/berries/rawstberry.png' },
  { name: '櫻子果', type: '格鬥', icon: 'https://www.serebii.net/pokemonsleep/berries/cheriberry.png' },
  { name: '桃桃果', type: '毒',   icon: 'https://www.serebii.net/pokemonsleep/berries/pechaberry.png' },
  { name: '零餘果', type: '地面', icon: 'https://www.serebii.net/pokemonsleep/berries/figyberry.png' },
  { name: '椰木果', type: '飛行', icon: 'https://www.serebii.net/pokemonsleep/berries/pamtreberry.png' },
  { name: '芒念果', type: '超能力', icon: 'https://www.serebii.net/pokemonsleep/berries/magoberry.png' },
  { name: '芭亞果', type: '蟲',   icon: 'https://www.serebii.net/pokemonsleep/berries/lumberry.png' },
  { name: '萄葡果', type: '岩石', icon: 'https://www.serebii.net/pokemonsleep/berries/sitrusberry.png' },
  { name: '檬果',   type: '幽靈', icon: 'https://www.serebii.net/pokemonsleep/berries/blukberry.png' },
  { name: '巧可果', type: '龍',   icon: 'https://www.serebii.net/pokemonsleep/berries/yacheberry.png' },
  { name: '芭拉果', type: '惡',   icon: 'https://www.serebii.net/pokemonsleep/berries/wikiberry.png' },
  { name: '霹靂果', type: '鋼',   icon: 'https://www.serebii.net/pokemonsleep/berries/belueberry.png' },
  { name: '佩卡果', type: '妖精', icon: 'https://www.serebii.net/pokemonsleep/berries/magostberry.png' }
];

const TYPE_TO_BERRY = {};
BERRY_DATA.forEach(b => {
  TYPE_TO_BERRY[b.type] = b.name;
});

/* ─── ⚡ 基礎主技能與複合/專屬技能映射系統 ─────────── */
const BASE_SKILLS = [
  { key: '食材獲取S', label: '食材獲取S', icon: '🍎' },
  { key: '食材精選S', label: '食材精選S', icon: '🥗' },
  { key: '活力全體療癒S', label: '活力全體療癒S', icon: '💚' },
  { key: '活力療癒S', label: '活力療癒S', icon: '💖' },
  { key: '活力填充S', label: '活力填充S', icon: '🔋' },
  { key: '能量填充M', label: '能量填充M', icon: '⚡' },
  { key: '能量填充S', label: '能量填充S', icon: '⚡' },
  { key: '料理強化S', label: '料理強化S', icon: '🍲' },
  { key: '料理成功S', label: '料理成功S', icon: '✨' },
  { key: '幫手支援S', label: '幫手支援S', icon: '🤝' },
  { key: '幫手加速', label: '幫手加速', icon: '🚀' },
  { key: '樹果遽增', label: '樹果遽增', icon: '🫐' },
  { key: '夢之碎片獲取S', label: '夢之碎片獲取S', icon: '💎' },
  { key: '揮指', label: '揮指', icon: '🎲' },
  { key: '技能複製', label: '技能複製', icon: '🎭' }
];

const COMPOSITE_SKILL_MAP = {
  // === 真正複合主技能 (True Composite Skills) ===
  // 健美：料理成功S (大成功機率提升) + 食材獲取S (隨機獲得食材) (赫拉克羅斯)
  '健美（料理輔助S）': ['料理成功S', '食材獲取S'],
  
  // 月光：活力填充S (自身活力) + 大成功時活力療癒S (隊友活力) (月亮伊布)
  '月光（活力填充S）': ['活力填充S', '活力療癒S'],
  
  // 樹果汁：活力全體療癒S (全員活力) + 樹果汁道具活力療癒S (單隻活力) (壺壺)
  '樹果汁（活力全體療癒S）': ['活力全體療癒S', '活力療癒S'],
  
  // === 專屬命名與變體主技能 (Named Variant Skills) ===
  // 食材獲取系列
  '正電（食材獲取S）': ['食材獲取S'],
  '禮物（食材獲取S）': ['食材獲取S'],
  
  // 料理強化系列
  '負電（料理強化S）': ['料理強化S'],
  
  // 食材精選系列
  '超幸運（食材精選S）': ['食材精選S'],
  '怪力钳（食材精選S）': ['食材精選S'],
  
  // 活力療癒系列
  '新月祈禱（活力全體療癒S）': ['活力全體療癒S'],
  '治癒波動（活力療癒S）': ['活力療癒S'],
  '蹭蹭臉頰（活力療癒S）': ['活力療癒S'],
  
  // 能量填充系列
  '蓄力（能量填充S）': ['能量填充S'],
  '能量填充S（隨機）': ['能量填充S'],
  '夢魘（能量填充M）': ['能量填充M'],
  
  // 樹果遽增系列
  '精神擊破（樹果領域）': ['樹果遽增'],
  '流星群（樹果遽增）': ['樹果遽增'],
  '畫皮（樹果遽增）': ['樹果遽增'],
  '樹果遽增?': ['樹果遽增'],
  
  // 夢之碎片系列
  '波導彈（夢之碎片獲取S）': ['夢之碎片獲取S'],
  '夢之碎片獲取S（隨機）': ['夢之碎片獲取S'],
  
  // 幫手加速系列
  '幫手加速（電）': ['幫手加速'],
  '幫手加速（火）': ['幫手加速'],
  '幫手加速（水）': ['幫手加速'],
  
  // 揮指 / 技能複製系列
  '十項全能（揮指）[可替換]': ['揮指'],
  '模仿（技能複製）': ['技能複製'],
  '變身（技能複製）': ['技能複製']
};

function matchesSkill(pokemonSkill, targetBaseSkill) {
  if (!pokemonSkill) return false;
  if (pokemonSkill === targetBaseSkill) return true;
  const mapped = COMPOSITE_SKILL_MAP[pokemonSkill];
  if (mapped && mapped.includes(targetBaseSkill)) return true;
  return false;
}

const PokemonApp = {
  allPokemons: [],
  currentSearch: '',
  onlyFinal: false,
  selectedTypes: new Set(),
  selectedSpecialties: new Set(),
  selectedBerries: new Set(),
  selectedIngredients: new Set(),
  selectedSkills: new Set(),
  currentSort: 'no-asc',
  viewMode: 'table',

  init(data) {
    this.allPokemons = data || [];
    this.currentSearch = '';
    this.onlyFinal = false;
    this.selectedTypes = new Set();
    this.selectedSpecialties = new Set();
    this.selectedBerries = new Set();
    this.selectedIngredients = new Set();
    this.selectedSkills = new Set();
    this.currentSort = 'no-asc';
    this.viewMode = 'table';
  },

  filterData() {
    return this.allPokemons.filter(p => {
      const pType = p.type || '';
      const pSpec = p.specialty || '';
      if (this.selectedTypes.size > 0 && !this.selectedTypes.has('ALL') && !this.selectedTypes.has(pType)) return false;
      if (this.selectedSpecialties.size > 0 && !this.selectedSpecialties.has('ALL') && !this.selectedSpecialties.has(pSpec)) return false;

      // 👑 僅最終進化篩選 (Only Final Evolution)
      if (this.onlyFinal) {
        const isFinal = p.is_final === '〇' || p.is_final === 'O' || p.is_final === 'o' || p.is_final === true || p.is_final === '1';
        if (!isFinal) return false;
      }

      // 樹果細節篩選
      if (this.selectedBerries && this.selectedBerries.size > 0) {
        const berryName = TYPE_TO_BERRY[pType];
        if (!berryName || !this.selectedBerries.has(berryName)) return false;
      }

      // 食材細節篩選
      if (this.selectedIngredients && this.selectedIngredients.size > 0) {
        const hasIng = p.ingredients && p.ingredients.some(ing => ing.name && this.selectedIngredients.has(ing.name));
        if (!hasIng) return false;
      }

      // 技能細節篩選 (支援基礎技能與複合技能自動關聯)
      if (this.selectedSkills && this.selectedSkills.size > 0) {
        let hasMatchedSkill = false;
        for (const targetSkill of this.selectedSkills) {
          if (matchesSkill(p.main_skill, targetSkill)) {
            hasMatchedSkill = true;
            break;
          }
        }
        if (!hasMatchedSkill) return false;
      }

      if (this.currentSearch) {
        const q = this.currentSearch.toLowerCase().trim();
        const idStr = String(p.id || p.formatted_no || '');
        const fNo = String(p.formatted_no || '');
        const nameCN = String((p.name && p.name.cn) || p.name_cn || '').toLowerCase();
        const nameEN = String((p.name && p.name.en) || p.name_en || '').toLowerCase();
        const nameJP = String((p.name && p.name.jp) || p.name_jp || '').toLowerCase();
        
        const qNum = q.replace(/^#/, '').replace(/^0+/, '');
        const matchesId = q === idStr || q === `#${fNo}` || q === fNo || (qNum && (idStr === qNum || fNo.replace(/^0+/, '') === qNum));
        const matchesText = nameCN.includes(q) || nameEN.includes(q) || nameJP.includes(q) || idStr.includes(q) || fNo.includes(q);
        if (!matchesId && !matchesText) return false;
      }
      return true;
    });
  },

  sortData(data) {
    const list = [...(data || this.filterData())];
    if (this.currentSort === 'ingredientRate-desc') {
      list.sort((a, b) => getItemIngredientRate(b) - getItemIngredientRate(a));
    }
    return list;
  },

  render() {
    const filtered = this.filterData();
    return this.sortData(filtered);
  }
};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    let allPokemons = [];
    let currentSearch = '';
    let onlyFinal = false;
    const selectedTypes = new Set();
    const selectedSpecialties = new Set();
    const selectedBerries = new Set();
    const selectedIngredients = new Set();
    const selectedSkills = new Set();
    let viewMode = 'table';

    const searchInput = document.getElementById('search-input');
    const finalEvoToggle = document.getElementById('final-evo-toggle');
    const typeFilterContainer = document.getElementById('type-filter-tags');
    const specialtyFilterContainer = document.getElementById('specialty-filter-tags');

    const subfilterBerryGroup = document.getElementById('subfilter-berry-group');
    const subfilterIngredientGroup = document.getElementById('subfilter-ingredient-group');
    const subfilterSkillGroup = document.getElementById('subfilter-skill-group');

    const berryFilterContainer = document.getElementById('berry-filter-tags');
    const ingredientFilterContainer = document.getElementById('ingredient-pkm-filter-tags');
    const skillFilterContainer = document.getElementById('skill-filter-tags');

    const clearBerriesBtn = document.getElementById('clear-berries-btn');
    const clearIngredientsBtn = document.getElementById('clear-ingredients-pkm-btn');
    const clearSkillsBtn = document.getElementById('clear-skills-btn');

    const countBadge = document.getElementById('count-badge');
    const contentArea = document.getElementById('content-area');
    const toggleGridBtn = document.getElementById('toggle-grid');
    const toggleTableBtn = document.getElementById('toggle-table');
    const syncBtn = document.getElementById('sync-btn');
    const syncStatus = document.getElementById('sync-status');

    let ghPat = localStorage.getItem(GH_PAT_KEY) || '';

    const syncConfigBtn  = document.getElementById('sync-config-btn');
    const syncConfigModal = document.getElementById('sync-config-modal');
    const ghPatInput     = document.getElementById('gh-pat-input');
    const savePatBtn     = document.getElementById('save-pat-btn');
    const closeConfigBtn = document.getElementById('close-config-btn');

    if (syncConfigBtn && syncConfigModal) {
      syncConfigBtn.addEventListener('click', () => {
        if (ghPatInput) ghPatInput.value = ghPat || '';
        syncConfigModal.style.display = 'flex';
      });
      closeConfigBtn && closeConfigBtn.addEventListener('click', () => {
        syncConfigModal.style.display = 'none';
      });
      savePatBtn && savePatBtn.addEventListener('click', () => {
        const val = ghPatInput ? ghPatInput.value.trim() : '';
        if (val) {
          ghPat = val;
          localStorage.setItem(GH_PAT_KEY, val);
          syncConfigModal.style.display = 'none';
          if (syncStatus) syncStatus.innerHTML = `<span style="color:#4ade80;">✅ PAT Token 已儲存！現在可以點擊同步資料。</span>`;
        } else {
          if (syncStatus) syncStatus.innerHTML = `<span style="color:#fbbf24;">⚠️ 請輸入有效的 PAT Token</span>`;
        }
      });
      syncConfigModal.addEventListener('click', (e) => {
        if (e.target === syncConfigModal) syncConfigModal.style.display = 'none';
      });
    }

    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        if (!ghPat) {
          if (syncStatus) {
            syncStatus.innerHTML = `
              <span style="color:#fbbf24;">⚠️ 尚未設定 GitHub PAT Token。</span><br>
              請先點擊 <strong>⚙️ 設定</strong> 並填入你的 GitHub PAT。
            `;
          }
          return;
        }

        syncBtn.disabled = true;
        syncBtn.textContent = '⏳ 觸發同步中...';
        if (syncStatus) syncStatus.textContent = '';

        try {
          const res = await fetch(
            `${GH_API_BASE}/actions/workflows/${GH_WORKFLOW}/dispatches`,
            {
              method: 'POST',
              headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${ghPat}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ref: 'main' })
            }
          );

          if (res.status === 204) {
            if (syncStatus) {
              syncStatus.innerHTML = `
                <span style="color:#4ade80;">✅ GitHub Actions 同步已觸發！</span><br>
                <span style="font-size:12px;color:#94a3b8;">約 60-120 秒後資料更新至 GitHub Pages。
                  <a href="https://github.com/${GH_OWNER}/${GH_REPO}/actions" target="_blank"
                    style="color:#38bdf8;">查看進度 ↗</a>
                </span>
              `;
            }
            setTimeout(() => location.reload(), 90000);
          } else if (res.status === 401 || res.status === 403) {
            if (syncStatus) syncStatus.innerHTML = `<span style="color:#ef4444;">❌ PAT Token 無效或權限不足，請重新設定。</span>`;
          } else {
            const body = await res.text();
            if (syncStatus) syncStatus.innerHTML = `<span style="color:#fbbf24;">⚠️ 回應 ${res.status}：${body.slice(0, 120)}</span>`;
          }
        } catch (e) {
          if (syncStatus) syncStatus.innerHTML = `<span style="color:#ef4444;">❌ 網路錯誤：${e.message}</span>`;
        } finally {
          syncBtn.disabled = false;
          syncBtn.textContent = '🔄 同步資料';
        }
      });
    }

    window.getItemIcon = getIconUrl;

    function initSpaTabs() {
      const tabPokemon = document.getElementById('tab-pokemon');
      const tabRecipes = document.getElementById('tab-recipes');
      const tabBox     = document.getElementById('tab-box');
      const tabNews    = document.getElementById('tab-news');
      const panelPokemon = document.getElementById('panel-pokemon');
      const panelRecipes = document.getElementById('panel-recipes');
      const panelBox     = document.getElementById('panel-box');
      const panelNews    = document.getElementById('panel-news');

      if (!tabPokemon || !tabRecipes || !panelPokemon || !panelRecipes) return;

      function switchMainTab(target) {
        // 移除所有 tab active 狀態
        [tabPokemon, tabRecipes, tabBox, tabNews].forEach(t => t && t.classList.remove('active'));
        // 隱藏所有 panels
        [panelPokemon, panelRecipes, panelBox, panelNews].forEach(p => p && (p.style.display = 'none'));

        if (target === 'news' && panelNews && tabNews) {
          tabNews.classList.add('active');
          panelNews.style.display = 'block';
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#news');
          }
        } else if (target === 'box' && panelBox && tabBox) {
          tabBox.classList.add('active');
          panelBox.style.display = 'block';
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#box');
          }
        } else if (target === 'recipes') {
          tabRecipes.classList.add('active');
          panelRecipes.style.display = 'block';
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#recipes');
          }
        } else {
          tabPokemon.classList.add('active');
          panelPokemon.style.display = 'block';
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#pokemon');
          }
        }
      }

      tabPokemon.addEventListener('click', () => switchMainTab('pokemon'));
      tabRecipes.addEventListener('click', () => switchMainTab('recipes'));
      if (tabBox) tabBox.addEventListener('click', () => switchMainTab('box'));
      if (tabNews) tabNews.addEventListener('click', () => switchMainTab('news'));

      // 依網址 hash 載入預設 tab
      if (window.location.hash === '#news') {
        switchMainTab('news');
      } else if (window.location.hash === '#box') {
        switchMainTab('box');
      } else if (window.location.hash === '#recipes') {
        switchMainTab('recipes');
      }
    }

    initSpaTabs();

    fetch('data.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        allPokemons = data;
        PokemonApp.init(data);
        initFilters();
        renderUI();
        if (window.initUserBox) {
          window.initUserBox(data);
        }
      })
      .catch(err => {
        console.error('Error loading data.json:', err);
        if (contentArea) contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">載入 data.json 失敗：${err.message}</div>`;
      });

    function initFilters() {
      if (!specialtyFilterContainer) return;
      const types = ['ALL', ...new Set(allPokemons.map(p => p.type).filter(Boolean))];
      const specialties = ['ALL', ...new Set(allPokemons.map(p => p.specialty).filter(Boolean))];

      // 從資料庫動態收集所有食材與其圖示
      const uniqueIngredientsMap = new Map();
      allPokemons.forEach(p => {
        if (p.ingredients) {
          p.ingredients.forEach(ing => {
            if (ing.name && !uniqueIngredientsMap.has(ing.name)) {
              uniqueIngredientsMap.set(ing.name, ing.icon || '');
            }
          });
        }
      });
      const uniqueIngredients = Array.from(uniqueIngredientsMap.entries()).map(([name, icon]) => ({ name, icon }));

      // 計算 15 種基礎主技能對應的寶可夢數量（含複合技能與專屬變體技能）
      const baseSkillCounts = {};
      BASE_SKILLS.forEach(b => {
        baseSkillCounts[b.key] = allPokemons.filter(p => matchesSkill(p.main_skill, b.key)).length;
      });

      function renderTypeButtons() {
        if (!typeFilterContainer) return;
        typeFilterContainer.innerHTML = types.map(t => {
          const isActive = t === 'ALL' ? selectedTypes.size === 0 : selectedTypes.has(t);
          return `<button type="button" class="tag-btn ${isActive ? 'active' : ''}" data-type="${t}">${t === 'ALL' ? '全部屬性' : t}</button>`;
        }).join('');
      }

      function renderSpecialtyButtons() {
        specialtyFilterContainer.innerHTML = specialties.map(s => {
          const isActive = s === 'ALL' ? selectedSpecialties.size === 0 : selectedSpecialties.has(s);
          return `<button type="button" class="tag-btn ${isActive ? 'active' : ''}" data-specialty="${s}">${s === 'ALL' ? '全部得意' : s}</button>`;
        }).join('');
      }

      function renderBerryButtons() {
        if (!berryFilterContainer) return;
        berryFilterContainer.innerHTML = BERRY_DATA.map(b => {
          const isActive = selectedBerries.has(b.name);
          return `
            <button type="button" class="subfilter-tag-btn ${isActive ? 'active' : ''}" data-berry="${b.name}" title="${b.name} (${b.type}屬性)">
              ${b.icon ? `<img src="${b.icon}" class="subfilter-btn-icon" alt="${b.name}" loading="lazy" onerror="this.style.display='none';">` : '🫐'}
              <span class="subfilter-btn-text">${b.name} <small style="opacity:0.75;">(${b.type})</small></span>
            </button>
          `;
        }).join('');

        if (clearBerriesBtn) {
          clearBerriesBtn.style.display = selectedBerries.size > 0 ? 'inline-block' : 'none';
        }
      }

      function renderIngredientButtons() {
        if (!ingredientFilterContainer) return;
        ingredientFilterContainer.innerHTML = uniqueIngredients.map(ing => {
          const isActive = selectedIngredients.has(ing.name);
          return `
            <button type="button" class="subfilter-tag-btn ${isActive ? 'active' : ''}" data-ing="${ing.name}" title="包含 ${ing.name}">
              ${ing.icon ? `<img src="${ing.icon}" class="subfilter-btn-icon" alt="${ing.name}" loading="lazy" onerror="this.style.display='none';">` : '🥗'}
              <span class="subfilter-btn-text">${ing.name}</span>
            </button>
          `;
        }).join('');

        if (clearIngredientsBtn) {
          clearIngredientsBtn.style.display = selectedIngredients.size > 0 ? 'inline-block' : 'none';
        }
      }

      function renderSkillButtons() {
        if (!skillFilterContainer) return;
        skillFilterContainer.innerHTML = BASE_SKILLS.map(skillItem => {
          const isActive = selectedSkills.has(skillItem.key);
          const count = baseSkillCounts[skillItem.key] || 0;
          return `
            <button type="button" class="subfilter-tag-btn subfilter-skill-btn ${isActive ? 'active' : ''}" data-skill="${skillItem.key}" title="${skillItem.label} (${count}隻)">
              <span class="subfilter-skill-dot">${skillItem.icon || '⚡'}</span>
              <span class="subfilter-btn-text">${skillItem.label}</span>
              <span class="subfilter-skill-count">${count}</span>
            </button>
          `;
        }).join('');

        if (clearSkillsBtn) {
          clearSkillsBtn.style.display = selectedSkills.size > 0 ? 'inline-block' : 'none';
        }
      }

      function updateSubfilterVisibility() {
        // 若未選取特定得意（即全部得意），則全部展示以便直接檢索細節
        // 若選取特定得意，則僅展示與該得意相關之細節篩選器（若有細節被選取則持續展示）
        const showAll = selectedSpecialties.size === 0;

        const showBerry = showAll || selectedSpecialties.has('樹果') || selectedBerries.size > 0;
        const showIngredient = showAll || selectedSpecialties.has('食材') || selectedIngredients.size > 0;
        const showSkill = showAll || selectedSpecialties.has('技能') || selectedSkills.size > 0;

        if (subfilterBerryGroup) subfilterBerryGroup.style.display = showBerry ? 'block' : 'none';
        if (subfilterIngredientGroup) subfilterIngredientGroup.style.display = showIngredient ? 'block' : 'none';
        if (subfilterSkillGroup) subfilterSkillGroup.style.display = showSkill ? 'block' : 'none';
      }

      renderTypeButtons();
      renderSpecialtyButtons();
      renderBerryButtons();
      renderIngredientButtons();
      renderSkillButtons();
      updateSubfilterVisibility();

      if (typeFilterContainer) {
        typeFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.tag-btn');
          if (!btn) return;
          const type = btn.getAttribute('data-type');
          if (type === 'ALL') {
            selectedTypes.clear();
          } else {
            if (selectedTypes.has(type)) {
              selectedTypes.delete(type);
            } else {
              selectedTypes.add(type);
            }
          }
          renderTypeButtons();
          renderUI();
        });
      }

      specialtyFilterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-btn');
        if (!btn) return;
        const specialty = btn.getAttribute('data-specialty');
        if (specialty === 'ALL') {
          selectedSpecialties.clear();
        } else {
          if (selectedSpecialties.has(specialty)) {
            selectedSpecialties.delete(specialty);
          } else {
            selectedSpecialties.add(specialty);
          }
        }
        renderSpecialtyButtons();
        updateSubfilterVisibility();
        renderUI();
      });

      // 樹果細節點擊
      if (berryFilterContainer) {
        berryFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.subfilter-tag-btn');
          if (!btn) return;
          const berry = btn.getAttribute('data-berry');
          if (!berry) return;
          if (selectedBerries.has(berry)) {
            selectedBerries.delete(berry);
          } else {
            selectedBerries.add(berry);
          }
          renderBerryButtons();
          renderUI();
        });
      }

      // 食材細節點擊
      if (ingredientFilterContainer) {
        ingredientFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.subfilter-tag-btn');
          if (!btn) return;
          const ing = btn.getAttribute('data-ing');
          if (!ing) return;
          if (selectedIngredients.has(ing)) {
            selectedIngredients.delete(ing);
          } else {
            selectedIngredients.add(ing);
          }
          renderIngredientButtons();
          renderUI();
        });
      }

      // 技能細節點擊
      if (skillFilterContainer) {
        skillFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.subfilter-tag-btn');
          if (!btn) return;
          const skill = btn.getAttribute('data-skill');
          if (!skill) return;
          if (selectedSkills.has(skill)) {
            selectedSkills.delete(skill);
          } else {
            selectedSkills.add(skill);
          }
          renderSkillButtons();
          renderUI();
        });
      }

      // 清空按鈕
      if (clearBerriesBtn) {
        clearBerriesBtn.addEventListener('click', () => {
          selectedBerries.clear();
          renderBerryButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      if (clearIngredientsBtn) {
        clearIngredientsBtn.addEventListener('click', () => {
          selectedIngredients.clear();
          renderIngredientButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      if (clearSkillsBtn) {
        clearSkillsBtn.addEventListener('click', () => {
          selectedSkills.clear();
          renderSkillButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      const pokemonSearchClear = document.getElementById('pokemon-search-clear');
      if (searchInput) {
        const updatePkmClear = () => {
          if (pokemonSearchClear) {
            pokemonSearchClear.style.display = searchInput.value.trim() ? 'flex' : 'none';
          }
        };

        searchInput.addEventListener('input', (e) => {
          currentSearch = e.target.value.trim().toLowerCase();
          updatePkmClear();
          renderUI();
        });

        if (pokemonSearchClear) {
          pokemonSearchClear.addEventListener('click', () => {
            searchInput.value = '';
            currentSearch = '';
            updatePkmClear();
            searchInput.focus();
            renderUI();
          });
        }
      }

      if (toggleGridBtn) {
        toggleGridBtn.addEventListener('click', () => {
          viewMode = 'grid';
          toggleGridBtn.classList.add('active');
          if (toggleTableBtn) toggleTableBtn.classList.remove('active');
          renderUI();
        });
      }

      if (toggleTableBtn) {
        toggleTableBtn.addEventListener('click', () => {
          viewMode = 'table';
          toggleTableBtn.classList.add('active');
          if (toggleGridBtn) toggleGridBtn.classList.remove('active');
          renderUI();
        });
      }

      if (finalEvoToggle) {
        finalEvoToggle.addEventListener('change', (e) => {
          onlyFinal = e.target.checked;
          PokemonApp.onlyFinal = onlyFinal;
          renderUI();
        });
      }
    }

    function filterData() {
      return allPokemons.filter(p => {
        if (selectedTypes.size > 0 && !selectedTypes.has(p.type)) return false;
        if (selectedSpecialties.size > 0 && !selectedSpecialties.has(p.specialty)) return false;

        // 👑 僅最終進化篩選 (Only Final Evolution)
        if (onlyFinal) {
          const isFinal = p.is_final === '〇' || p.is_final === 'O' || p.is_final === 'o' || p.is_final === true || p.is_final === '1';
          if (!isFinal) return false;
        }

        // 樹果細節篩選 (多選)
        if (selectedBerries.size > 0) {
          const berryName = TYPE_TO_BERRY[p.type];
          if (!berryName || !selectedBerries.has(berryName)) return false;
        }

        // 食材細節篩選 (多選)
        if (selectedIngredients.size > 0) {
          const hasIng = p.ingredients && p.ingredients.some(ing => ing.name && selectedIngredients.has(ing.name));
          if (!hasIng) return false;
        }

        // 技能細節篩選 (多選，支援基礎技能與複合技能自動關聯)
        if (selectedSkills.size > 0) {
          let hasMatchedSkill = false;
          for (const targetSkill of selectedSkills) {
            if (matchesSkill(p.main_skill, targetSkill)) {
              hasMatchedSkill = true;
              break;
            }
          }
          if (!hasMatchedSkill) return false;
        }

        if (currentSearch) {
          const q = currentSearch;
          return (
            (p.name_cn && p.name_cn.toLowerCase().includes(q)) ||
            (p.name_en && p.name_en.toLowerCase().includes(q)) ||
            (p.name_jp && p.name_jp.toLowerCase().includes(q)) ||
            (p.formatted_no && p.formatted_no.includes(q)) ||
            (p.id && String(p.id).includes(q))
          );
        }
        return true;
      });
    }

    function renderUI() {
      if (!contentArea) return;
      const filtered = filterData();
      if (countBadge) countBadge.textContent = `共 ${filtered.length} 隻寶可夢`;

      if (filtered.length === 0) {
        contentArea.innerHTML = `<div style="text-align:center; padding: 60px; color: var(--text-muted); font-size: 16px;">查無符合條件的寶可夢</div>`;
        return;
      }

      if (viewMode === 'grid') renderGrid(filtered);
      else renderTable(filtered);
    }

    function renderGrid(data) {
      contentArea.innerHTML = `
        <div class="pokemon-grid">
          ${data.map(p => {
            const iconUrl = getIconUrl(p);
            return `
            <div class="pokemon-card">
              <div class="card-header">
                ${iconUrl ? `<img class="pokemon-icon" src="${iconUrl}" alt="${p.name_cn}" loading="lazy" onerror="this.style.display='none';">` : ''}
                <div class="card-title-group">
                  <div class="pokemon-no">No.${p.formatted_no}</div>
                  <div class="pokemon-name" style="white-space:nowrap;">${p.name_cn}</div>
                  <div class="pokemon-name-en" style="white-space:nowrap;">${p.name_en || ''}</div>
                  <span class="type-badge" style="background-color: var(--type-${p.type}, #64748b);white-space:nowrap;">${p.type || '一般'}</span>
                </div>
              </div>
              <div class="card-stats">
                <div class="stat-item">
                  <span class="stat-label">得意</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.specialty || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">持有</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.carry || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">食材率</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.ingredient_rate || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">技能率</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.skill_rate || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">間隔</span>
                  <span class="stat-value" style="white-space:nowrap;">${p.interval || '--'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">主技能</span>
                  <span class="stat-value" style="font-size:10px;white-space:nowrap;">${p.main_skill || '--'}</span>
                </div>
              </div>
              <div class="ingredient-list">
                ${p.ingredients ? p.ingredients.map((ing, i) => ing.name ? `
                  <div class="ingredient-row" style="white-space:nowrap;">
                    ${ing.icon ? `<img class="ing-icon" src="${ing.icon}" alt="${ing.name}" loading="lazy" title="${ing.name}" onerror="this.style.display='none';">` : ''}
                    ${ingQtyBadges(ing, i)}
                  </div>
                ` : '').join('') : ''}
              </div>
            </div>
          `}).join('')}
        </div>
      `;
    }

    function renderTable(data) {
      contentArea.innerHTML = `
        <div class="table-container">
          <table class="pokemon-table">
            <thead>
              <tr>
                <th class="th-no">No.</th>
                <th class="th-icon">圖示</th>
                <th class="th-name">寶可夢</th>
                <th class="th-type">屬性</th>
                <th class="th-spec">得意</th>
                <th class="th-carry">持有</th>
                <th class="th-ing">食材 ①</th>
                <th class="th-ing">食材 ②</th>
                <th class="th-ing">食材 ③</th>
                <th class="th-rate">食材率</th>
                <th class="th-rate">技能率</th>
                <th class="th-interval">幫忙間隔</th>
                <th class="th-skill">主技能</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(p => {
                const iconUrl = getIconUrl(p);
                return `
                <tr>
                  <td class="td-no">${p.formatted_no}</td>
                  <td class="td-icon">
                    ${iconUrl ? `<img src="${iconUrl}" width="34" height="34" class="table-icon" alt="${p.name_cn}" loading="lazy" onerror="this.style.display='none';">` : ''}
                  </td>
                  <td class="td-name pokemon-name-cell">${p.name_cn}</td>
                  <td class="td-type"><span class="type-badge" style="background-color:var(--type-${p.type}, #64748b);">${p.type || '一般'}</span></td>
                  <td class="td-spec">${p.specialty || '--'}</td>
                  <td class="td-carry">${p.carry || '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[0] ? `<div class="ing-cell">${p.ingredients[0].icon ? `<img class="ing-icon" src="${p.ingredients[0].icon}" alt="${p.ingredients[0].name}" loading="lazy" title="${p.ingredients[0].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[0],0)}</div>` : '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[1] ? `<div class="ing-cell">${p.ingredients[1].icon ? `<img class="ing-icon" src="${p.ingredients[1].icon}" alt="${p.ingredients[1].name}" loading="lazy" title="${p.ingredients[1].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[1],1)}</div>` : '--'}</td>
                  <td class="td-ing">${p.ingredients && p.ingredients[2] ? `<div class="ing-cell">${p.ingredients[2].icon ? `<img class="ing-icon" src="${p.ingredients[2].icon}" alt="${p.ingredients[2].name}" loading="lazy" title="${p.ingredients[2].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[2],2)}</div>` : '--'}</td>
                  <td class="td-rate">${p.ingredient_rate || '--'}</td>
                  <td class="td-rate">${p.skill_rate || '--'}</td>
                  <td class="td-interval">${p.interval || '--'}</td>
                  <td class="td-skill">${p.main_skill || '--'}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getItemIcon: (p) => getIconUrl(p),
    getItemId: (p) => String(p.id || p.formatted_no || ''),
    getItemFormattedNo: (p) => p.formatted_no || '',
    getItemNameCN: (p) => (p.name && p.name.cn) || p.name_cn || '',
    getItemNameEN: (p) => (p.name && p.name.en) || p.name_en || '',
    getItemNameJP: (p) => (p.name && p.name.jp) || p.name_jp || '',
    getItemCarry: (p) => getItemCarry(p),
    getItemIngredientRate: (p) => getItemIngredientRate(p),
    getItemHelpInterval: (p) => getItemHelpInterval(p),
    DEFAULT_SVG_ICON,
    PokemonApp,
    BASE_SKILLS,
    COMPOSITE_SKILL_MAP,
    matchesSkill
  };
}
