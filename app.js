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

const PokemonApp = {
  allPokemons: [],
  currentSearch: '',
  selectedTypes: new Set(),
  selectedSpecialties: new Set(),
  currentSort: 'no-asc',
  viewMode: 'table',

  init(data) {
    this.allPokemons = data || [];
    this.currentSearch = '';
    this.selectedTypes = new Set();
    this.selectedSpecialties = new Set();
    this.currentSort = 'no-asc';
    this.viewMode = 'table';
  },

  filterData() {
    return this.allPokemons.filter(p => {
      const pType = p.type || '';
      const pSpec = p.specialty || '';
      if (this.selectedTypes.size > 0 && !this.selectedTypes.has('ALL') && !this.selectedTypes.has(pType)) return false;
      if (this.selectedSpecialties.size > 0 && !this.selectedSpecialties.has('ALL') && !this.selectedSpecialties.has(pSpec)) return false;
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
    let selectedType = 'ALL';
    let selectedSpecialty = 'ALL';
    let viewMode = 'table';

    const searchInput = document.getElementById('search-input');
    const typeFilterContainer = document.getElementById('type-filter-tags');
    const specialtyFilterContainer = document.getElementById('specialty-filter-tags');
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

    function initSpaTabs() {
      const tabPokemon = document.getElementById('tab-pokemon');
      const tabRecipes = document.getElementById('tab-recipes');
      const panelPokemon = document.getElementById('panel-pokemon');
      const panelRecipes = document.getElementById('panel-recipes');

      if (!tabPokemon || !tabRecipes || !panelPokemon || !panelRecipes) return;

      function switchMainTab(target) {
        if (target === 'recipes') {
          tabPokemon.classList.remove('active');
          tabRecipes.classList.add('active');
          panelPokemon.style.display = 'none';
          panelRecipes.style.display = 'block';
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#recipes');
          }
        } else {
          tabRecipes.classList.remove('active');
          tabPokemon.classList.add('active');
          panelRecipes.style.display = 'none';
          panelPokemon.style.display = 'block';
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#pokemon');
          }
        }
      }

      tabPokemon.addEventListener('click', () => switchMainTab('pokemon'));
      tabRecipes.addEventListener('click', () => switchMainTab('recipes'));

      if (window.location.hash === '#recipes') {
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
      })
      .catch(err => {
        console.error('Error loading data.json:', err);
        if (contentArea) contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">載入 data.json 失敗：${err.message}</div>`;
      });

    function initFilters() {
      if (!typeFilterContainer || !specialtyFilterContainer) return;
      const types = ['ALL', ...new Set(allPokemons.map(p => p.type).filter(Boolean))];
      const specialties = ['ALL', ...new Set(allPokemons.map(p => p.specialty).filter(Boolean))];

      typeFilterContainer.innerHTML = types.map(t => `
        <button class="tag-btn ${t === selectedType ? 'active' : ''}" data-type="${t}">${t === 'ALL' ? '全部屬性' : t}</button>
      `).join('');

      specialtyFilterContainer.innerHTML = specialties.map(s => `
        <button class="tag-btn ${s === selectedSpecialty ? 'active' : ''}" data-specialty="${s}">${s === 'ALL' ? '全部得意' : s}</button>
      `).join('');

      typeFilterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-btn')) {
          selectedType = e.target.getAttribute('data-type');
          document.querySelectorAll('#type-filter-tags .tag-btn').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          renderUI();
        }
      });

      specialtyFilterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-btn')) {
          selectedSpecialty = e.target.getAttribute('data-specialty');
          document.querySelectorAll('#specialty-filter-tags .tag-btn').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          renderUI();
        }
      });

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          currentSearch = e.target.value.trim().toLowerCase();
          renderUI();
        });
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
    }

    function filterData() {
      return allPokemons.filter(p => {
        if (selectedType !== 'ALL' && p.type !== selectedType) return false;
        if (selectedSpecialty !== 'ALL' && p.specialty !== selectedSpecialty) return false;
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
    PokemonApp
  };
}
