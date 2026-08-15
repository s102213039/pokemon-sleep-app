/**
 * Pokemon Sleep - 最新更新與新聞 (News & Updates Module)
 * 載入官方繁體中文新聞、AI 智能總結、分類篩選與即時搜尋
 */

(function () {
  'use strict';

  let allNews = [];
  let currentCategory = 'ALL';
  let searchQuery = '';
  const expandedMap = new Set();

  // DOM 元素
  const newsCategoryContainer = document.getElementById('news-category-tags');
  const newsSearchInput       = document.getElementById('news-search-input');
  const newsCountBadge        = document.getElementById('news-count-badge');
  const newsListContainer     = document.getElementById('news-list-container');

  const CATEGORY_MAP = [
    { key: 'ALL', label: '全部消息', emoji: '📰' },
    { key: 'event', label: '活動企劃', emoji: '🏆' },
    { key: 'update', label: '版本更新', emoji: '⚙️' },
    { key: 'maintenance', label: '維護公告', emoji: '🔧' },
    { key: 'notice', label: '重要通知', emoji: '📢' }
  ];

  /* ─── 載入新聞資料 ───────────────────────────────────── */
  async function loadNews() {
    try {
      const res = await fetch('news.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      allNews = await res.json();
      initCategoryTags();
      initSearch();
      renderNews();
    } catch (err) {
      console.error('Failed to load news.json:', err);
      if (newsListContainer) {
        newsListContainer.innerHTML = `
          <div class="empty-state" style="padding: 40px 20px; text-align: center;">
            <div style="font-size: 36px; margin-bottom: 12px;">⚠️</div>
            <div style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">新聞資料載入中或暫時無法讀取</div>
            <div style="font-size: 13px; color: var(--text-muted);">請稍後重整頁面，或點擊頂部「同步資料」更新最新官方新聞。</div>
          </div>
        `;
      }
    }
  }

  /* ─── 初始化分類標籤 ─────────────────────────────────── */
  function initCategoryTags() {
    if (!newsCategoryContainer) return;

    // 計算各分類數量
    const counts = { ALL: allNews.length };
    CATEGORY_MAP.slice(1).forEach(cat => {
      counts[cat.key] = allNews.filter(n => n.badge_key === cat.key).length;
    });

    newsCategoryContainer.innerHTML = CATEGORY_MAP.map(cat => {
      const active = cat.key === currentCategory ? 'active' : '';
      const count = counts[cat.key] || 0;
      return `
        <button type="button" class="news-tag-btn ${active}" data-cat="${cat.key}">
          <span>${cat.emoji} ${cat.label}</span>
          <span class="news-tag-count">${count}</span>
        </button>
      `;
    }).join('');

    newsCategoryContainer.addEventListener('click', e => {
      const btn = e.target.closest('.news-tag-btn');
      if (btn) {
        currentCategory = btn.getAttribute('data-cat');
        newsCategoryContainer.querySelectorAll('.news-tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderNews();
      }
    });
  }

  /* ─── 初始化搜尋功能 ─────────────────────────────────── */
  function initSearch() {
    if (!newsSearchInput) return;
    newsSearchInput.addEventListener('input', e => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderNews();
    });
  }

  /* ─── 篩選新聞清單 ───────────────────────────────────── */
  function getFilteredNews() {
    return allNews.filter(item => {
      // 1. 分類過濾
      if (currentCategory !== 'ALL' && item.badge_key !== currentCategory) {
        return false;
      }
      // 2. 關鍵字搜尋（標題、簡述、重點項目、預覽）
      if (searchQuery) {
        const titleMatch = (item.title || '').toLowerCase().includes(searchQuery);
        const overviewMatch = (item.overview || '').toLowerCase().includes(searchQuery);
        const highlightsMatch = (item.highlights || []).some(h => h.toLowerCase().includes(searchQuery));
        const dateMatch = (item.date || '').includes(searchQuery);
        if (!titleMatch && !overviewMatch && !highlightsMatch && !dateMatch) {
          return false;
        }
      }
      return true;
    });
  }

  /* ─── 渲染新聞列表 ───────────────────────────────────── */
  function renderNews() {
    if (!newsListContainer) return;
    const filtered = getFilteredNews();

    // 更新統計數量徽章
    if (newsCountBadge) {
      newsCountBadge.innerHTML = `顯示 <strong>${filtered.length}</strong> / ${allNews.length} 則最新消息`;
    }

    if (filtered.length === 0) {
      newsListContainer.innerHTML = `
        <div class="empty-state" style="padding: 50px 20px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
          <div style="font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">找不到符合的新聞或公告</div>
          <div style="font-size: 13px; color: var(--text-muted);">請嘗試更換搜尋關鍵字，或切換至「全部消息」分類。</div>
        </div>
      `;
      return;
    }

    newsListContainer.innerHTML = filtered.map((item, index) => {
      const isExpanded = expandedMap.has(item.id);
      const isLatest = index === 0 && currentCategory === 'ALL' && !searchQuery;

      // 新登場寶可夢 / 焦點寶可夢頂部橫條
      let debutBannerHTML = '';
      if (item.debut_pokemon && item.debut_pokemon.length > 0) {
        debutBannerHTML = `
          <div class="news-debut-banner">
            <span class="news-debut-label">🦄 新登場寶可夢：</span>
            <div class="news-poke-pill-group">
              ${item.debut_pokemon.map(p => `<span class="news-poke-pill-new">✨ ${escapeHtml(p)}</span>`).join('')}
            </div>
          </div>
        `;
      } else if (item.featured_pokemon && item.featured_pokemon.length > 0 && item.badge_key === 'event') {
        debutBannerHTML = `
          <div class="news-featured-banner">
            <span class="news-featured-label">⭐ 焦點寶可夢：</span>
            <div class="news-poke-pill-group">
              ${item.featured_pokemon.map(p => `<span class="news-poke-pill-featured">🔥 ${escapeHtml(p)}</span>`).join('')}
            </div>
          </div>
        `;
      }

      // 渲染多維度 AI 智能摘要區塊 (Sections)
      let aiSectionsHTML = '';
      if (item.sections && item.sections.length > 0) {
        aiSectionsHTML = `
          <div class="news-ai-dashboard">
            <div class="news-ai-dashboard-header">
              <span class="news-ai-sparkle">🤖</span>
              <span class="news-ai-dashboard-title">AI 智能深度重點整理</span>
            </div>
            <div class="news-ai-sections-grid">
              ${item.sections.map(sec => `
                <div class="news-ai-section-box news-sec-${sec.key || 'general'}">
                  <div class="news-ai-section-title">
                    <span>${sec.icon || '📌'}</span>
                    <span>${sec.title}</span>
                  </div>
                  <ul class="news-ai-section-list">
                    ${sec.items.map(it => `<li>${formatAiListItem(it, item)}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (item.highlights && item.highlights.length > 0) {
        aiSectionsHTML = `
          <div class="news-ai-highlights">
            <div class="news-ai-title">
              <span class="news-ai-sparkle">🤖</span>
              <span>AI 智能重點萃取</span>
            </div>
            <ul class="news-ai-list">
              ${item.highlights.map(h => `<li>${formatAiListItem(h, item)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      const previewHTML = item.content_preview
        ? `
          <div id="preview-${item.id}" class="news-preview-collapse ${isExpanded ? 'expanded' : ''}">
            <div class="news-preview-content">${escapeHtml(item.content_preview).replace(/\n/g, '<br>')}</div>
          </div>
        `
        : '';

      return `
        <article class="news-card ${isLatest ? 'news-card-featured' : ''}" data-id="${item.id}">
          <div class="news-card-header">
            <div class="news-meta-left">
              <span class="news-date-badge">📅 ${item.date}</span>
              <span class="news-badge news-badge-${item.badge_key || 'notice'}" style="--badge-color:${item.badge_color || '#8b5cf6'};">
                ${item.badge_label || item.category || '📢 公告'}
              </span>
              ${isLatest ? '<span class="news-latest-tag">NEW 🔥</span>' : ''}
            </div>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-source-link" title="前往官方公告原文">
              <span>官方原文</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>

          <h3 class="news-card-title">
            <a href="${item.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>
          </h3>

          ${debutBannerHTML}

          <p class="news-overview-text">${escapeHtml(item.overview || '')}</p>

          ${aiSectionsHTML}

          ${previewHTML}

          <div class="news-card-footer">
            ${item.content_preview ? `
              <button type="button" class="news-expand-btn ${isExpanded ? 'expanded' : ''}" data-target="${item.id}">
                <span>${isExpanded ? '收起預覽' : '📖 查看原文預覽'}</span>
                <span class="news-expand-arrow">${isExpanded ? '▲' : '▼'}</span>
              </button>
            ` : '<span></span>'}
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-read-more-btn">
              <span>完整官方公告 ↗</span>
            </a>
          </div>
        </article>
      `;
    }).join('');

    // 綁定展開 / 收合按鈕事件
    newsListContainer.querySelectorAll('.news-expand-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-target');
        const previewEl = document.getElementById(`preview-${id}`);
        if (!previewEl) return;

        if (expandedMap.has(id)) {
          expandedMap.delete(id);
          previewEl.classList.remove('expanded');
          btn.classList.remove('expanded');
          btn.querySelector('span:first-child').textContent = '📖 查看原文預覽';
          btn.querySelector('.news-expand-arrow').textContent = '▼';
        } else {
          expandedMap.add(id);
          previewEl.classList.add('expanded');
          btn.classList.add('expanded');
          btn.querySelector('span:first-child').textContent = '收起預覽';
          btn.querySelector('.news-expand-arrow').textContent = '▲';
        }
      });
    });
  }

  /* ─── 關鍵字高亮格式化 ─────────────────────────────────── */
  function formatAiListItem(text, item) {
    if (!text) return '';
    let formatted = escapeHtml(text);

    // 1. 新登場寶可夢高亮（粉紅微光發光標籤）
    const debutList = item.debut_pokemon || [];
    debutList.forEach(name => {
      if (!name) return;
      const re = new RegExp(escapeRegExp(name), 'g');
      formatted = formatted.replace(re, `<span class="hl-poke-new">✨ ${name}</span>`);
    });

    // 2. 焦點 / 機率提升寶可夢高亮（金黃微光標籤）
    const featList = item.featured_pokemon || [];
    featList.forEach(name => {
      if (!name || debutList.includes(name)) return;
      const re = new RegExp(escapeRegExp(name), 'g');
      formatted = formatted.replace(re, `<span class="hl-poke-feat">⭐ ${name}</span>`);
    });

    // 3. 關鍵倍率與數值高亮 (如 1.25倍、2.5倍、3.75倍、2倍、3倍、+1,000pt、250鑽石)
    formatted = formatted.replace(/([1-4](?:\.\d+)?倍|\+\d{1,3}(?:,\d{3})*pt|\d+鑽石)/g, '<span class="hl-mult">$1</span>');

    // 4. 島嶼 / 營地名稱高亮
    formatted = formatted.replace(/(萌綠之島EX|天青沙灘EX|萌綠之島|天青沙灘|灰褐洞窟|白花雪原|寶藍湖畔|黃金舊發電廠|琥褐溪谷)/g, '<span class="hl-island">🏝️ $1</span>');

    return formatted;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* ─── XSS 防護 ───────────────────────────────────────── */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 初始化載入新聞
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews);
  } else {
    loadNews();
  }

  // 暴露全域刷新介面（如從同步完成後觸發）
  window.refreshNews = loadNews;
})();
