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

  // ─── GitHub Actions Sync Button ───────────────────────────
  // Repo info
  const GH_OWNER    = 's102213039';
  const GH_REPO     = 'pokemon-sleep-app';
  const GH_WORKFLOW = 'update-data.yml';
  const GH_API_BASE = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`;
  const GH_PAT_KEY  = 'pksleep_gh_pat';

  // Load PAT from localStorage
  let ghPat = localStorage.getItem(GH_PAT_KEY) || '';

  // ── PAT Config Modal ──
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
    // Close on backdrop click
    syncConfigModal.addEventListener('click', (e) => {
      if (e.target === syncConfigModal) syncConfigModal.style.display = 'none';
    });
  }

  // ── Sync Button (trigger GitHub Actions workflow_dispatch) ──
  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      if (!ghPat) {
        syncStatus.innerHTML = `
          <span style="color:#fbbf24;">⚠️ 尚未設定 GitHub PAT Token。</span><br>
          請先點擊 <strong>⚙️ 設定</strong> 並填入你的 GitHub PAT。
        `;
        return;
      }

      syncBtn.disabled = true;
      syncBtn.textContent = '⏳ 觸發同步中...';
      syncStatus.textContent = '';

      try {
        // Trigger GitHub Actions workflow_dispatch
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
            body: JSON.stringify({ ref: 'main', inputs: { sync_type: 'full' } })
          }
        );

        if (res.status === 204) {
          // 204 = success (no content)
          syncStatus.innerHTML = `
            <span style="color:#4ade80;">✅ GitHub Actions 同步已觸發！</span><br>
            <span style="font-size:12px;color:#94a3b8;">約 60-120 秒後資料更新至 GitHub Pages。
              <a href="https://github.com/${GH_OWNER}/${GH_REPO}/actions" target="_blank"
                style="color:#38bdf8;">查看進度 ↗</a>
            </span>
          `;
          // Auto-reload page after 90 seconds
          setTimeout(() => location.reload(), 90000);
        } else if (res.status === 401 || res.status === 403) {
          syncStatus.innerHTML = `<span style="color:#ef4444;">❌ PAT Token 無效或權限不足，請重新設定。</span>`;
        } else {
          const body = await res.text();
          syncStatus.innerHTML = `<span style="color:#fbbf24;">⚠️ 回應 ${res.status}：${body.slice(0, 120)}</span>`;
        }
      } catch (e) {
        syncStatus.innerHTML = `<span style="color:#ef4444;">❌ 網路錯誤：${e.message}</span>`;
      } finally {
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


                <td style="font-weight:700;">${p.name_cn}<br><small style="color:var(--text-muted)">${p.name_en || ''}</small></td>
                <td><span class="type-badge" style="background-color:var(--type-${p.type}, #64748b);">${p.type || '一般'}</span></td>
                <td>${p.specialty || '--'}</td>
                <td>${p.carry || '--'}</td>
                <td>${p.ingredients[0] ? `<div class="ing-cell">${p.ingredients[0].icon ? `<img class="ing-icon" src="${p.ingredients[0].icon}" alt="${p.ingredients[0].name}" loading="lazy" title="${p.ingredients[0].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[0],0)}</div>` : '--'}</td>
                <td>${p.ingredients[1] ? `<div class="ing-cell">${p.ingredients[1].icon ? `<img class="ing-icon" src="${p.ingredients[1].icon}" alt="${p.ingredients[1].name}" loading="lazy" title="${p.ingredients[1].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[1],1)}</div>` : '--'}</td>
                <td>${p.ingredients[2] ? `<div class="ing-cell">${p.ingredients[2].icon ? `<img class="ing-icon" src="${p.ingredients[2].icon}" alt="${p.ingredients[2].name}" loading="lazy" title="${p.ingredients[2].name}" onerror="this.style.display='none';">` : ''}${ingQtyBadges(p.ingredients[2],2)}</div>` : '--'}</td>
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
