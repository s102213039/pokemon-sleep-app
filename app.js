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

  // Sync Button Logic
  const SYNC_SERVER = 'http://localhost:18765';

  async function checkSyncServer() {
    try {
      const res = await fetch(`${SYNC_SERVER}/status`, { method: 'GET' });
      if (res.ok) return true;
    } catch (e) {}
    return false;
  }

  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.textContent = '⏳ 檢查同步伺服器...';
      syncStatus.textContent = '';

      const serverUp = await checkSyncServer();

      if (!serverUp) {
        syncBtn.disabled = false;
        syncBtn.textContent = '🔄 同步資料';
        syncStatus.innerHTML = `
          <span style="color:#fbbf24;">⚠️ 本地同步伺服器未啟動。</span><br>
          請在終端機執行：<code style="background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px;">python sync_server.py</code>
        `;
        return;
      }

      syncBtn.textContent = '⏳ 同步中...';
      syncStatus.innerHTML = `<span style="color:#38bdf8;">⏳ 同步正在執行，約需 30-60 秒...</span>`;

      try {
        const res = await fetch(`${SYNC_SERVER}/sync`, { method: 'POST' });
        const data = await res.json();

        setTimeout(() => {
          syncStatus.innerHTML = `<span style="color:#4ade80;">✅ ${data.message} 頁面將在 60 秒後更新至 GitHub Pages！</span>`;
          syncBtn.disabled = false;
          syncBtn.textContent = '🔄 同步資料';

          // Reload data.json after sync
          setTimeout(() => {
            location.reload();
          }, 65000);
        }, 500);

      } catch (e) {
        syncStatus.innerHTML = `<span style="color:#ef4444;">❌ 同步失敗：${e.message}</span>`;
        syncBtn.disabled = false;
        syncBtn.textContent = '🔄 同步資料';
      }
    });
  }

  // Load data.json (use same-origin path)
  const dataPath = window.location.protocol === 'file:' ? 'data.json' : 'data.json';
  fetch(dataPath)
    .then(res => res.json())
    .then(data => {
      allPokemons = data;
      initFilters();
      render();
    })
    .catch(err => {
      console.error('Error loading data.json:', err);
      contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">Failed to load data.json. Make sure the file exists.</div>`;
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
        render();
      }
    });

    specialtyFilterContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('tag-btn')) {
        selectedSpecialty = e.target.getAttribute('data-specialty');
        document.querySelectorAll('#specialty-filter-tags .tag-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        render();
      }
    });

    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      render();
    });

    toggleGridBtn.addEventListener('click', () => {
      viewMode = 'grid';
      toggleGridBtn.classList.add('active');
      toggleTableBtn.classList.remove('active');
      render();
    });

    toggleTableBtn.addEventListener('click', () => {
      viewMode = 'table';
      toggleTableBtn.classList.add('active');
      toggleGridBtn.classList.remove('active');
      render();
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

  function render() {
    const filtered = filterData();
    countBadge.textContent = `共 ${filtered.length} 隻寶可夢`;

    if (filtered.length === 0) {
      contentArea.innerHTML = `<div style="text-align:center; padding: 60px; color: var(--text-muted); font-size: 16px;">查無符合條件的寶可夢</div>`;
      return;
    }

    if (viewMode === 'grid') renderGrid(filtered);
    else renderTable(filtered);
  }

  function getIconUrl(p) {
    return p.icon_url || `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png`;
  }

  // Build quantity chips for an ingredient (no level labels, just the numbers in order)
  function ingQtyBadges(ing, idx) {
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
    return `<span class="ing-qty-group">${qtys.map(q => `<span class="ing-qty">${q}</span>`).join('<span class="ing-arrow">→</span>')}</span>`;
  }

  function renderGrid(data) {
    contentArea.innerHTML = `
      <div class="pokemon-grid">
        ${data.map(p => `
          <div class="pokemon-card">
            <div class="card-header">
              <img class="pokemon-icon"
                src="${getIconUrl(p)}"
                alt="${p.name_cn}"
                loading="lazy"
                onerror="this.onerror=null;this.src='https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png';this.onerror=function(){this.style.display='none';};">
              <div class="card-title-group">
                <div class="pokemon-no">No.${p.formatted_no}</div>
                <div class="pokemon-name">${p.name_cn}</div>
                <div class="pokemon-name-en">${p.name_en || ''}</div>
                <span class="type-badge" style="background-color: var(--type-${p.type}, #64748b);">${p.type || '一般'}</span>
              </div>
            </div>
            <div class="card-stats">
              <div class="stat-item">
                <span class="stat-label">得意</span>
                <span class="stat-value">${p.specialty || '--'}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">持有</span>
                <span class="stat-value">${p.carry || '--'}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">食材率</span>
                <span class="stat-value">${p.ingredient_rate || '--'}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">技能率</span>
                <span class="stat-value">${p.skill_rate || '--'}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">間隔</span>
                <span class="stat-value">${p.interval || '--'}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">主技能</span>
                <span class="stat-value" style="font-size:10px;">${p.main_skill || '--'}</span>
              </div>
            </div>
            <div class="ingredient-list">
              ${p.ingredients.map((ing, i) => ing.name ? `
                <div class="ingredient-row">
                  ${ing.icon ? `<img class="ing-icon" src="${ing.icon}" alt="${ing.name}" loading="lazy" onerror="this.style.display='none';">` : ''}
                  <span class="ing-name">${ing.name}</span>
                  ${ingQtyBadges(ing, i)}
                </div>
              ` : '').join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderTable(data) {
    contentArea.innerHTML = `
      <div class="table-container">
        <table class="pokemon-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>圖示</th>
              <th>寶可夢</th>
              <th>屬性</th>
              <th>得意</th>
              <th>持有</th>
              <th>食材 ①</th>
              <th>食材 ②</th>
              <th>食材 ③</th>
              <th>食材率</th>
              <th>技能率</th>
              <th>幫忙間隔</th>
              <th>主技能</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(p => `
              <tr>
                <td style="font-weight:700;color:var(--accent-color);font-family:monospace;">${p.formatted_no}</td>
                <td>
                  <img src="${getIconUrl(p)}" width="40" height="40" alt="${p.name_cn}" loading="lazy"
                    onerror="this.style.display='none';">
                </td>
                <td style="font-weight:700;">${p.name_cn}<br><small style="color:var(--text-muted)">${p.name_en || ''}</small></td>
                <td><span class="type-badge" style="background-color:var(--type-${p.type}, #64748b);">${p.type || '一般'}</span></td>
                <td>${p.specialty || '--'}</td>
                <td>${p.carry || '--'}</td>
                <td>${p.ingredients[0] ? `<div class="ing-cell">${p.ingredients[0].icon ? `<img class="ing-icon" src="${p.ingredients[0].icon}" alt="${p.ingredients[0].name}" loading="lazy" onerror="this.style.display='none';">` : ''}<span class="ing-name">${p.ingredients[0].name}</span>${ingQtyBadges(p.ingredients[0],0)}</div>` : '--'}</td>
                <td>${p.ingredients[1] ? `<div class="ing-cell">${p.ingredients[1].icon ? `<img class="ing-icon" src="${p.ingredients[1].icon}" alt="${p.ingredients[1].name}" loading="lazy" onerror="this.style.display='none';">` : ''}<span class="ing-name">${p.ingredients[1].name}</span>${ingQtyBadges(p.ingredients[1],1)}</div>` : '--'}</td>
                <td>${p.ingredients[2] ? `<div class="ing-cell">${p.ingredients[2].icon ? `<img class="ing-icon" src="${p.ingredients[2].icon}" alt="${p.ingredients[2].name}" loading="lazy" onerror="this.style.display='none';">` : ''}<span class="ing-name">${p.ingredients[2].name}</span>${ingQtyBadges(p.ingredients[2],2)}</div>` : '--'}</td>
                <td style="font-weight:700;">${p.ingredient_rate || '--'}</td>
                <td>${p.skill_rate || '--'}</td>
                <td>${p.interval || '--'}</td>
                <td style="font-size:11px;">${p.main_skill || '--'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
});
