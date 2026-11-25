
function toPinyin(str) {
  if (!str) return '';
  let res = '';
  for (let i = 0; i < str.length; i++) {
    res += CHAR_TO_PINYIN[str[i]] || str[i];
  }
  return res;
}

function levenshteinDistance(s1, s2) {
  if (s1 === s2) return 0;
  if (!s1) return s2 ? s2.length : 0;
  if (!s2) return s1.length;
  if (s1.length > s2.length) {
    const tmp = s1; s1 = s2; s2 = tmp;
  }
  const m = s1.length, n = s2.length;
  const row = new Int32Array(m + 1);
  for (let i = 0; i <= m; i++) row[i] = i;
  for (let j = 1; j <= n; j++) {
    let prev = row[0];
    row[0] = j;
    const c2 = s2.charCodeAt(j - 1);
    for (let i = 1; i <= m; i++) {
      const temp = row[i];
      const cost = s1.charCodeAt(i - 1) === c2 ? 0 : 1;
      const del = row[i] + 1;
      const ins = row[i - 1] + 1;
      const sub = prev + cost;
      row[i] = del < ins ? (del < sub ? del : sub) : (ins < sub ? ins : sub);
      prev = temp;
    }
  }
  return row[m];
}

function isSubsequence(sub, str) {
  if (!sub || !str) return false;
  let i = 0, j = 0;
  while (i < sub.length && j < str.length) {
    if (sub[i] === str[j]) i++;
    j++;
  }
  return i === sub.length;
}

let _lastPokemonSearchRaw = null;
let _lastPokemonSearchParsed = null;

function matchesPokemonSearch(p, query) {
  if (!query) return true;
  let qInfo = _lastPokemonSearchParsed;
  if (query !== _lastPokemonSearchRaw || !qInfo) {
    const q = String(query).trim().toLowerCase();
    if (!q) return true;
    const qClean = q.replace(/[\s\-_（）\(\)\.\'’]/g, '');
    const isNumeric = /^#?\d+$/.test(qClean);
    qInfo = {
      q,
      qClean,
      isNumeric,
      qNum: isNumeric ? qClean.replace(/^#/, '').replace(/^0+/, '') : '',
      qPinyin: isNumeric ? '' : toPinyin(qClean),
      isAsciiAlpha: isNumeric ? false : /^[a-z\s\-_'\.]+$/i.test(q)
    };
    _lastPokemonSearchRaw = query;
    _lastPokemonSearchParsed = qInfo;
  }

  const { q, qClean, isNumeric, qNum, qPinyin, isAsciiAlpha } = qInfo;
  if (!q) return true;

  // 1. 純數字編號邏輯 (完全精確比對編號，嚴禁寬鬆模糊匹配)
  if (isNumeric) {
    const idStr = String(p.id || '');
    const fNo = String(p.formatted_no || '');
    const fNoNum = fNo.replace(/^0+/, '');
    return (
      qClean === idStr ||
      qClean === `#${fNo}` ||
      qClean === fNo ||
      (qNum !== '' && (idStr === qNum || fNoNum === qNum))
    );
  }

  // 2. 文字精確比對 (快取寶可夢名稱正規化、簡繁互通與拼音)
  const rawCN = String((p.name && p.name.cn) || p.name_cn || '');
  const rawEN = String((p.name && p.name.en) || p.name_en || '');
  const rawJP = String((p.name && p.name.jp) || p.name_jp || '');
  const toSimp = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.toSimplified === 'function')
    ? window.I18N.toSimplified
    : null;
  const rawSimp = toSimp ? toSimp(rawCN) : rawCN;
  const rawI18n = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getPokemonName === 'function')
    ? String(window.I18N.getPokemonName(p) || '')
    : '';
  let meta = p._searchMeta;
  if (!meta || meta.rawCN !== rawCN || meta.rawEN !== rawEN || meta.rawJP !== rawJP || meta.rawI18n !== rawI18n) {
    const nameCN = rawCN.toLowerCase();
    const nameSimp = rawSimp.toLowerCase();
    const nameEN = rawEN.toLowerCase();
    const nameJP = rawJP.toLowerCase();
    const nameI18n = rawI18n.toLowerCase();
    const nameCNClean = nameCN.replace(/[\s\-_（）\(\)\.\'’]/g, '');
    const nameSimpClean = nameSimp.replace(/[\s\-_（）\(\)\.\'’]/g, '');
    const nameENClean = nameEN.replace(/[\s\-_（）\(\)\.\'’]/g, '');
    const nameJPClean = nameJP.replace(/[\s\-_（）\(\)\.\'’]/g, '');
    const nameI18nClean = nameI18n.replace(/[\s\-_（）\(\)\.\'’]/g, '');
    const pinyin = p._pinyin || toPinyin(nameCNClean);
    p._pinyin = pinyin;
    meta = {
      rawCN, rawEN, rawJP, rawI18n,
      nameCN, nameSimp, nameEN, nameJP, nameI18n,
      nameCNClean, nameSimpClean, nameENClean, nameJPClean, nameI18nClean,
      pinyin,
      enWords: nameEN ? nameEN.split(/[\s\-_（）\(\)\.\'’]+/).filter(Boolean) : []
    };
    p._searchMeta = meta;
  }

  const { nameCN, nameSimp, nameEN, nameJP, nameI18n, nameCNClean, nameSimpClean, nameENClean, nameJPClean, nameI18nClean, pinyin, enWords } = meta;

  if (
    nameCN.includes(q) || nameSimp.includes(q) || nameEN.includes(q) || nameJP.includes(q) || nameI18n.includes(q) ||
    nameCNClean.includes(qClean) || nameSimpClean.includes(qClean) || nameENClean.includes(qClean) || nameJPClean.includes(qClean) || nameI18nClean.includes(qClean)
  ) {
    return true;
  }

  // 3. 中文拼音 / 同音字寬鬆比對 (解決「一步」、「依布」、「皮卡秋」免選字輸入)
  if (qPinyin && pinyin && pinyin.includes(qPinyin)) {
    return true;
  }

  // 4. 中文子序列匹配 (例如「妙花」匹配「妙蛙花」、「南瓜人」匹配「南瓜怪人」)
  if (qClean.length >= 2 && (isSubsequence(qClean, nameCNClean) || isSubsequence(qClean, nameSimpClean))) {
    return true;
  }

  // 5. 中文字元編輯距離 (單字打錯，長度 >= 3 容許 1 個錯字)
  if (qClean.length >= 3) {
    const zhTargets = nameSimpClean && nameSimpClean !== nameCNClean ? [nameCNClean, nameSimpClean] : [nameCNClean];
    for (let z = 0; z < zhTargets.length; z++) {
      const targetClean = zhTargets[z];
      if (Math.abs(qClean.length - targetClean.length) <= 1) {
        if (levenshteinDistance(qClean, targetClean) <= 1) return true;
      }
      if (targetClean.length > qClean.length) {
        for (let i = 0; i <= targetClean.length - qClean.length; i++) {
          const sub = targetClean.slice(i, i + qClean.length);
          if (levenshteinDistance(qClean, sub) <= 1) return true;
        }
      }
    }
  }

  // 6. 英文拼字錯誤 / 模糊比對 (例如 eeve, pikachuu, blastose, charzard)
  if (isAsciiAlpha) {
    if (qClean.length >= 4 && isSubsequence(qClean, nameENClean)) {
      return true;
    }
    if (qClean.length >= 4) {
      const maxDist = qClean.length >= 7 ? 2 : 1;
      if (Math.abs(qClean.length - nameENClean.length) <= maxDist) {
        if (levenshteinDistance(qClean, nameENClean) <= maxDist) return true;
      }
      for (let w = 0; w < enWords.length; w++) {
        const word = enWords[w];
        if (Math.abs(qClean.length - word.length) <= maxDist) {
          if (levenshteinDistance(qClean, word) <= maxDist) return true;
        }
      }
    }
  }

  return false;
}

let currentGlobalTooltipAnchor = null;
let lastGlobalTooltipShownTime = 0;
let isTooltipPinned = false;
let isTouchInteraction = false;
let hasAnyFloatingTooltipOpen = false;

function getHelpButtonData(btn) {
  if (!btn || !btn.classList) return null;
  if (btn.classList.contains('pot-expansion-help-btn')) {
    return {
      title: window.I18N?.t?.('recipe.slider_pot_expansion_help_title') ?? 'recipe.slider_pot_expansion_help_title',
      body: window.I18N?.t?.('recipe.slider_pot_expansion_help_body') ?? 'recipe.slider_pot_expansion_help_body'
    };
  }
  if (btn.classList.contains('ladder-formula-help-btn')) {
    return {
      title: window.I18N?.t?.('dex.ui_ladder_formula_help_title') ?? 'dex.ui_ladder_formula_help_title',
      body: window.I18N?.t?.('dex.ui_ladder_formula_help_body') ?? 'dex.ui_ladder_formula_help_body'
    };
  }
  if (btn.classList.contains('pokedex-formula-help-btn')) {
    return {
      title: window.I18N?.t?.('dex.ui_energy_help_title') ?? 'dex.ui_energy_help_title',
      body: window.I18N?.t?.('dex.ui_energy_help_body') ?? 'dex.ui_energy_help_body'
    };
  }
  if (btn.classList.contains('ladder-help-icon-btn')) {
    return {
      title: window.I18N?.t?.('dex.ui_ladder_trigger_help_title') ?? 'dex.ui_ladder_trigger_help_title',
      body: window.I18N?.t?.('dex.ui_ladder_trigger_help_body') ?? 'dex.ui_ladder_trigger_help_body'
    };
  }
  return null;
}

function showGlobalTooltip(anchorEl, title, body, tag) {
  if (typeof document === 'undefined' || !anchorEl || (!title && !body)) return;
  let tooltipEl = document.getElementById('global-skill-tooltip');
  if (!tooltipEl && document.body) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'global-skill-tooltip';
    tooltipEl.className = 'global-skill-tooltip';
    document.body.appendChild(tooltipEl);
  }
  if (!tooltipEl) return;

  if (currentGlobalTooltipAnchor && currentGlobalTooltipAnchor !== anchorEl) {
    if (currentGlobalTooltipAnchor.classList) {
      currentGlobalTooltipAnchor.classList.remove('active');
    }
    if (typeof currentGlobalTooltipAnchor.setAttribute === 'function') {
      currentGlobalTooltipAnchor.setAttribute('aria-expanded', 'false');
    }
    if (typeof currentGlobalTooltipAnchor.blur === 'function') {
      currentGlobalTooltipAnchor.blur();
    }
    if (currentGlobalTooltipAnchor.dataset && currentGlobalTooltipAnchor.dataset.nativeTitle) {
      currentGlobalTooltipAnchor.setAttribute('title', currentGlobalTooltipAnchor.dataset.nativeTitle);
      delete currentGlobalTooltipAnchor.dataset.nativeTitle;
    }
  }

  currentGlobalTooltipAnchor = anchorEl;
  lastGlobalTooltipShownTime = Date.now();

  if (anchorEl.classList) {
    anchorEl.classList.add('active');
  }
  if (typeof anchorEl.setAttribute === 'function') {
    anchorEl.setAttribute('aria-expanded', 'true');
  }

  if (anchorEl.getAttribute && anchorEl.getAttribute('title')) {
    anchorEl.dataset.nativeTitle = anchorEl.getAttribute('title');
    anchorEl.removeAttribute('title');
  }

  tooltipEl.innerHTML = `
    <div class="tooltip-header">
      <strong class="tooltip-title">${title || ''}</strong>
      ${tag ? `<span class="tooltip-tag">${tag}</span>` : ''}
    </div>
    <div class="tooltip-body">${body || ''}</div>
  `;
  tooltipEl.style.display = 'block';

  if (typeof anchorEl.getBoundingClientRect === 'function') {
    const rect = anchorEl.getBoundingClientRect();
    const tooltipRect = (typeof tooltipEl.getBoundingClientRect === 'function') ? tooltipEl.getBoundingClientRect() : { width: 300, height: 120 };

    let top = rect.top - tooltipRect.height - 10;
    let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

    if (top < 10) {
      top = rect.bottom + 8;
    }
    const winHeight = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 800;
    const winWidth = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 1200;
    if (top + tooltipRect.height > winHeight - 10) {
      top = winHeight - tooltipRect.height - 10;
    }
    if (left < 14) left = 14;
    if (left + tooltipRect.width > winWidth - 14) {
      left = winWidth - tooltipRect.width - 14;
    }

    tooltipEl.style.top = `${Math.max(10, top)}px`;
    tooltipEl.style.left = `${Math.max(14, left)}px`;
  }
  tooltipEl.classList.add('visible');
  hasAnyFloatingTooltipOpen = true;
  if (typeof window !== 'undefined') window._hasAnyFloatingTooltipOpen = true;
}

function hideGlobalTooltip() {
  isTooltipPinned = false;
  if (currentGlobalTooltipAnchor) {
    if (currentGlobalTooltipAnchor.classList) {
      currentGlobalTooltipAnchor.classList.remove('active');
    }
    if (typeof currentGlobalTooltipAnchor.setAttribute === 'function') {
      currentGlobalTooltipAnchor.setAttribute('aria-expanded', 'false');
    }
    if (typeof currentGlobalTooltipAnchor.blur === 'function') {
      currentGlobalTooltipAnchor.blur();
    }
    if (currentGlobalTooltipAnchor.dataset && currentGlobalTooltipAnchor.dataset.nativeTitle) {
      currentGlobalTooltipAnchor.setAttribute('title', currentGlobalTooltipAnchor.dataset.nativeTitle);
      delete currentGlobalTooltipAnchor.dataset.nativeTitle;
    }
  }
  currentGlobalTooltipAnchor = null;
  if (typeof document !== 'undefined') {
    const tooltipEl = document.getElementById('global-skill-tooltip');
    if (tooltipEl) {
      tooltipEl.classList.remove('visible');
      tooltipEl.style.display = 'none';
    }
  }
  hasAnyFloatingTooltipOpen = false;
  if (typeof window !== 'undefined') window._hasAnyFloatingTooltipOpen = false;
}

function toggleGlobalTooltip(anchorEl, title, body, tag) {
  if (!anchorEl || typeof document === 'undefined') return;
  const tooltipEl = document.getElementById('global-skill-tooltip');
  if (tooltipEl && tooltipEl.classList.contains('visible') && currentGlobalTooltipAnchor === anchorEl) {
    if (Date.now() - lastGlobalTooltipShownTime < 250) {
      isTooltipPinned = true;
      return;
    }
    if (isTooltipPinned) {
      hideGlobalTooltip();
      return;
    }
    isTooltipPinned = true;
    return;
  }
  isTooltipPinned = true;
  showGlobalTooltip(anchorEl, title, body, tag);
}

function isAnyFloatingTooltipVisible() {
  if (currentGlobalTooltipAnchor || hasAnyFloatingTooltipOpen || (typeof window !== 'undefined' && window._hasAnyFloatingTooltipOpen)) return true;
  if (typeof document === 'undefined') return false;
  const gTip = document.getElementById('global-skill-tooltip');
  if (gTip && (gTip.classList.contains('visible') || (gTip.style.display !== 'none' && gTip.style.display !== ''))) return true;
  const pPop = document.getElementById('pokedex-energy-help-popover');
  if (pPop && pPop.style.display !== 'none' && pPop.style.display !== '') return true;
  const lPop = document.getElementById('ladder-energy-help-popover');
  if (lPop && lPop.style.display !== 'none' && lPop.style.display !== '') return true;
  const sPop = document.getElementById('ladder-skill-help-modal');
  if (sPop && sPop.style.display !== 'none' && sPop.style.display !== '') return true;
  if (document.getElementById('island-sleep-popover')) return true;
  if (document.querySelector && document.querySelector('.ladder-node.tooltip-active')) return true;
  return false;
}

function markLadderGroupSelected(node) {
  const row = node.closest('.ladder-track-row, .ladder-tail-track-row');
  const group = node.getAttribute('data-pkm-group');
  if (!row || !group) return;
  row.querySelectorAll('[data-pkm-group]').forEach(el => {
    if (el.getAttribute('data-pkm-group') === group) el.classList.add('group-selected');
  });
}

function dismissAllFloatingTooltips() {
  hasAnyFloatingTooltipOpen = false;
  if (typeof window !== 'undefined') window._hasAnyFloatingTooltipOpen = false;
  if (typeof window !== 'undefined' && window.PopoverCoordinator && typeof window.PopoverCoordinator.dismissAll === 'function') {
    window.PopoverCoordinator.dismissAll();
    return;
  }
  hideGlobalTooltip();
  if (typeof closePokedexEnergyHelp === 'function') {
    closePokedexEnergyHelp();
  }
  if (typeof window !== 'undefined' && window.PokemonApp && typeof window.PokemonApp.closePokedexEnergyHelp === 'function') {
    window.PokemonApp.closePokedexEnergyHelp();
  }
  if (typeof window !== 'undefined' && window.WikiDB) {
    if (typeof window.WikiDB.closeLadderEnergyHelp === 'function') {
      window.WikiDB.closeLadderEnergyHelp();
    }
    if (typeof window.WikiDB.closeSkillDrawHelpModal === 'function') {
      window.WikiDB.closeSkillDrawHelpModal();
    }
    if (typeof window.WikiDB.closeSleepStylePopover === 'function') {
      window.WikiDB.closeSleepStylePopover();
    }
  }
  if (typeof closeLadderEnergyHelp === 'function') {
    closeLadderEnergyHelp();
  }
  if (typeof closeSkillDrawHelpModal === 'function') {
    closeSkillDrawHelpModal();
  }
  if (typeof closeSleepStylePopover === 'function') {
    closeSleepStylePopover();
  }

  if (typeof document !== 'undefined') {
    const pPop = document.getElementById('pokedex-energy-help-popover');
    if (pPop) pPop.style.display = 'none';
    const lPop = document.getElementById('ladder-energy-help-popover');
    if (lPop) lPop.style.display = 'none';
    const sPop = document.getElementById('ladder-skill-help-modal');
    if (sPop) sPop.style.display = 'none';
    const islandPop = document.getElementById('island-sleep-popover');
    if (islandPop && islandPop.parentNode) islandPop.parentNode.removeChild(islandPop);
    const islandBackdrop = document.getElementById('island-sleep-popover-backdrop');
    if (islandBackdrop && islandBackdrop.parentNode) islandBackdrop.parentNode.removeChild(islandBackdrop);

    if (typeof document.querySelectorAll === 'function') {
      const helpButtons = document.querySelectorAll(
        '.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn, .special-skill-badge, .pot-expansion-help-btn'
      );
      helpButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        if (typeof btn.blur === 'function') {
          btn.blur();
        }
      });
      const activeNodes = document.querySelectorAll('.ladder-node.tooltip-active');
      activeNodes.forEach(node => node.classList.remove('tooltip-active'));
      document.querySelectorAll('.group-selected').forEach(el => el.classList.remove('group-selected'));
      const activeTrackRows = document.querySelectorAll('.ladder-track-row.has-active-tooltip, .ladder-tail-track-row.has-active-tooltip');
      activeTrackRows.forEach(row => row.classList.remove('has-active-tooltip'));
    }

    if (document.activeElement && typeof document.activeElement.blur === 'function' && document.activeElement !== document.body) {
      const activeTag = (document.activeElement.tagName || '').toUpperCase();
      const isFormField = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT' || document.activeElement.isContentEditable;
      if (!isFormField) {
        document.activeElement.blur();
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.showGlobalTooltip = showGlobalTooltip;
  window.hideGlobalTooltip = hideGlobalTooltip;
  window.toggleGlobalTooltip = toggleGlobalTooltip;
  window.isAnyFloatingTooltipVisible = isAnyFloatingTooltipVisible;
  window.dismissAllFloatingTooltips = dismissAllFloatingTooltips;
}

const PokemonApp = {
  allPokemons: [],
  currentSearch: '',
  onlyFinal: true,
  onlyInitialIng: false,
  showNo: false,
  selectedTypes: new Set(),
  selectedSpecialties: new Set(),
  selectedBerries: new Set(),
  selectedIngredients: new Set(),
  selectedSkills: new Set(),
  currentSort: 'no-asc',
  viewMode: 'table',
  showGlobalTooltip,
  hideGlobalTooltip,
  toggleGlobalTooltip,

  init(data) {
    this.allPokemons = data || [];
    this.currentSearch = '';
    this.onlyFinal = true;
    this.onlyInitialIng = false;
    this.showNo = false;
    this.selectedTypes = new Set();
    this.selectedSpecialties = new Set();
    this.selectedBerries = new Set();
    this.selectedIngredients = new Set();
    this.selectedSkills = new Set();
    this.currentSort = 'no-asc';
    this.viewMode = 'table';
  },
};

if (typeof window !== 'undefined') {