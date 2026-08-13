const GH_OWNER    = 's102213039';
const GH_REPO     = 'pokemon-sleep-app';
const GH_WORKFLOW = 'sync.yml';
const GH_API_BASE = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`;
const GH_PAT_KEY  = 'pksleep_gh_pat';

const DEFAULT_SVG_ICON = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%2338bdf8"/></svg>';

function getIconUrl(p) {
  if (!p) return DEFAULT_SVG_ICON;
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
          syncStatus.innerHTML = `<span style="color:#4ade80;">✅ PAT Token 已儲存！現在可以點擊同步資料。</span>`;
        } else {
          syncStatus.innerHTML = `<span style="color:#fbbf24;">⚠️ 請輸入有效的 PAT Token</span>`;
        }
      });
      syncConfigModal.addEventListener('click', (e) => {
        if (e.target === syncConfigModal) syncConfigModal.style.display = 'none';
      });

      const tabRecipes = document.getElementById('tab-recipes');
      const panelPokemon = document.getElementById('panel-pokemon');
      const panelRecipes = document.getElementById('panel-recipes');

      function switchMainTab(target) {
        if (!panelPokemon || !panelRecipes) return;
        if (target === 'recipes') {
          tabPokemon && tabPokemon.classList.remove('active');
          tabRecipes && tabRecipes.classList.add('active');
          panelPokemon.style.display = 'none';
          panelRecipes.style.display = 'block';
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#recipes');
          }
        } else {
          tabRecipes && tabRecipes.classList.remove('active');
          tabPokemon && tabPokemon.classList.add('active');
          panelRecipes.style.display = 'none';
          panelPokemon.style.display = 'block';
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, '', '#pokemon');
          }
        }
      }

      tabPokemon && tabPokemon.addEventListener('click', () => switchMainTab('pokemon'));
      tabRecipes && tabRecipes.addEventListener('click', () => switchMainTab('recipes'));

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
        contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">載入 data.json 失敗：${err.message}</div>`;
      });

    function initFilters() {
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

      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        renderUI();
      });

      toggleGridBtn.addEventListener('click', () => {
        viewMode = 'grid';
        toggleGridBtn.classList.add('active');
        toggleTableBtn.classList.remove('active');
        renderUI();
      });

      toggleTableBtn.addEventListener('click', () => {
        viewMode = 'table';
        toggleTableBtn.classList.add('active');
        toggleGridBtn.classList.remove('active');
        renderUI();
      });
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
      const filtered = filterData();
      countBadge.textContent = `共 ${filtered.length} 隻寶可夢`;

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
                <th style="white-space:nowrap;">No.</th>
                <th style="white-space:nowrap;">圖示</th>
                <th style="white-space:nowrap;">寶可夢</th>
                <th style="white-space:nowrap;">屬性</th>
                <th style="white-space:nowrap;">得意</th>
                <th style="white-space:nowrap;">持有</th>
                <th style="white-space:nowrap;">食材 ①</th>
                <th style="white-space:nowrap;">食材 ②</th>
                <th style="white-space:nowrap;">食材 ③</th>
                <th style="white-space:nowrap;">食材率</th>
                <th style="white-space:nowrap;">技能率</th>
                <th style="white-space:nowrap;">幫忙間隔</th>
                <th style="white-space:nowrap;">主技能</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(p => {
                const iconUrl = getIconUrl(p);
                return `
                <tr>
                  <td style="font-weight:700;color:var(--accent-color);font-family:monospace;white-space:nowrap;">${p.formatted_no}</td>
                  <td>
                    ${iconUrl ? `<img src="${iconUrl}" width="40" height="40" alt="${p.name_cn}" loading="lazy" onerror="this.style.display='none';">` : ''}
                  </td>
                  <td style="font-weight:700;white-space:nowrap;">${p.name_cn}<br><small style="color:var(--text-muted);font-weight:400;">${p.name_en || ''}</small></td>
                  <td style="white-space:nowrap;"><span class="type-badge" style="background-color:var(--type-${p.type}, #64748b);">${p.type || '一般'}</span></td>
                  <td style="white-space:nowrap;">${p.specialty || '--'}</td>
                  <td style="white-space:nowrap;">${p.carry || '--'}</td>
                  <td style="white-space:nowrap;">${p.ingredients && p.ingredients[0] ? `<div class="ing-cell">${p.ingredients[0].icon ? `<img class="ing-icon" src="${p.ingredients[0].icon}" alt="${p.ingredients[0].name}" loading="lazy" title="${p.ingredients[0].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[0],0)}</div>` : '--'}</td>
                  <td style="white-space:nowrap;">${p.ingredients && p.ingredients[1] ? `<div class="ing-cell">${p.ingredients[1].icon ? `<img class="ing-icon" src="${p.ingredients[1].icon}" alt="${p.ingredients[1].name}" loading="lazy" title="${p.ingredients[1].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[1],1)}</div>` : '--'}</td>
                  <td style="white-space:nowrap;">${p.ingredients && p.ingredients[2] ? `<div class="ing-cell">${p.ingredients[2].icon ? `<img class="ing-icon" src="${p.ingredients[2].icon}" alt="${p.ingredients[2].name}" loading="lazy" title="${p.ingredients[2].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[2],2)}</div>` : '--'}</td>
                  <td style="font-weight:700;white-space:nowrap;">${p.ingredient_rate || '--'}</td>
                  <td style="white-space:nowrap;">${p.skill_rate || '--'}</td>
                  <td style="white-space:nowrap;">${p.interval || '--'}</td>
                  <td style="font-size:11px;white-space:nowrap;">${p.main_skill || '--'}</td>
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
