
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

  // 2. 文字精確比對 (快取寶可夢名稱正規化與拼音)
  const rawCN = String((p.name && p.name.cn) || p.name_cn || '');
  const rawEN = String((p.name && p.name.en) || p.name_en || '');
  const rawJP = String((p.name && p.name.jp) || p.name_jp || '');
  let meta = p._searchMeta;
  if (!meta || meta.rawCN !== rawCN || meta.rawEN !== rawEN || meta.rawJP !== rawJP) {
    const nameCN = rawCN.toLowerCase();
    const nameEN = rawEN.toLowerCase();
    const nameJP = rawJP.toLowerCase();
    const nameCNClean = nameCN.replace(/[\s\-_（）\(\)\.\'’]/g, '');
    const nameENClean = nameEN.replace(/[\s\-_（）\(\)\.\'’]/g, '');
    const nameJPClean = nameJP.replace(/[\s\-_（）\(\)\.\'’]/g, '');
    const pinyin = p._pinyin || toPinyin(nameCNClean);
    p._pinyin = pinyin;
    meta = {
      rawCN, rawEN, rawJP,
      nameCN, nameEN, nameJP,
      nameCNClean, nameENClean, nameJPClean,
      pinyin,
      enWords: nameEN ? nameEN.split(/[\s\-_（）\(\)\.\'’]+/).filter(Boolean) : []
    };
    p._searchMeta = meta;
  }

  const { nameCN, nameEN, nameJP, nameCNClean, nameENClean, nameJPClean, pinyin, enWords } = meta;

  if (
    nameCN.includes(q) || nameEN.includes(q) || nameJP.includes(q) ||
    nameCNClean.includes(qClean) || nameENClean.includes(qClean) || nameJPClean.includes(qClean)
  ) {
    return true;
  }

  // 3. 中文拼音 / 同音字寬鬆比對 (解決「一步」、「依布」、「皮卡秋」免選字輸入)
  if (qPinyin && pinyin && pinyin.includes(qPinyin)) {
    return true;
  }

  // 4. 中文子序列匹配 (例如「妙花」匹配「妙蛙花」、「南瓜人」匹配「南瓜怪人」)
  if (qClean.length >= 2 && isSubsequence(qClean, nameCNClean)) {
    return true;
  }

  // 5. 中文字元編輯距離 (單字打錯，長度 >= 3 容許 1 個錯字)
  if (qClean.length >= 3) {
    if (Math.abs(qClean.length - nameCNClean.length) <= 1) {
      if (levenshteinDistance(qClean, nameCNClean) <= 1) return true;
    }
    if (nameCNClean.length > qClean.length) {
      for (let i = 0; i <= nameCNClean.length - qClean.length; i++) {
        const sub = nameCNClean.slice(i, i + qClean.length);
        if (levenshteinDistance(qClean, sub) <= 1) return true;
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
  const lang = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function') ? window.I18N.getLanguage() : 'zh-TW';
  const isEN = lang === 'en-US';
  const isCN = lang === 'zh-CN';
  if (btn.classList.contains('pot-expansion-help-btn')) {
    const defaultTitle = isEN ? 'Pot Expansion Forecast' : (isCN ? '扩锅预测说明' : '擴鍋預測說明');
    const defaultBody = isEN
      ? 'Extra ingredients default to <span class="text-accent font-bold">100 base energy</span> each (standard average baseline for common fillers like Apple 90, Milk 98, Soybean 100, Honey 101, Sausage 103).<br>Pot Capacity Mechanics: Base pot maxes out at 81 slots in latest version; Good Camp Ticket multiplies base capacity by 1.5x (122 slots on weekdays, 243 on Sundays); Sunday cooking doubles base pot (2x; 81×2 = 162 slots). During "Cooking Week" events, Sunday pot capacity quadruples (4x), reaching 81×4×1.5 = 486 slots with Camp Ticket. Coupled with Cooking Power-Up S skill stacking (up to +200 ingredients), theoretical single-cook limit reaches 486 + 200 = 686 slots (slider supports up to 700).<br>Formula: (Recipe Lv. Energy + Extra Ingredients × 100) × Island Bonus × Event Bonus.<br>Extra ingredients do not receive recipe level bonus, but fully benefit from island bonus, event bonus, and extra tasty multipliers.'
      : (isCN
        ? '默认每个追加食材以 <span class="text-accent font-bold">100 基础能量</span> 计算（常用溢出填锅食材如苹果90、牛奶98、大豆100、蜂蜜101、香肠103之平均基准）。<br>锅子容量机制说明：常规扩锅上限最新为 81 格；好露营券加成×1.5倍（平日 122 格，周日 243 格）；周日料理×2倍（81×2 = 162 格）。在“料理周”活动时周日更享有4倍锅加成，搭配露营券锅子容量高达 81×4×1.5 = 486格！若再加上自爆磁怪等宝可梦的“料理强化S”技能（最高堆叠+200个食材），单次极限锅子容量可达 486 + 200 = 686 格（滑块支持至 700 格）。<br>计算公式：(食谱等级能量 + 追加食材数 × 100) × (1 + 岛屿加成) × 活动加成。<br>追加食材不享有食谱等级加成，但全额享有岛屿加成、活动加成与大成功倍率。'
        : '預設每個追加食材以 <span class="text-accent font-bold">100 基礎能量</span> 計算（常用溢出填鍋食材如蘋果90、牛奶98、大豆100、蜂蜜101、香腸103之平均基準）。<br>鍋子容量機制說明：常規擴鍋上限最新為 81 格；好露營券加成×1.5倍（平日 122 格，週日 243 格）；週日料理×2倍（81×2 = 162 格）。在「料理週」活動時週日更享有4倍鍋加成，搭配露營券鍋子容量高達 81×4×1.5 = 486格！若再加上自爆磁怪等寶可夢的「料理強化S」技能（最高堆疊+200個食材），單次極限鍋子容量可達 486 + 200 = 686 格（滑桿支援至 700 格）。<br>計算公式：(食譜等級能量 + 追加食材數 × 100) × (1 + 島嶼加成) × 活動加成。<br>追加食材不享有食譜等級加成，但全額享有島嶼加成、活動加成與大成功倍率。');
    return {
      title: (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('recipe.slider_pot_expansion_help_title', defaultTitle) : defaultTitle,
      body: (typeof window !== 'undefined' && window.I18N) ? window.I18N.t('recipe.slider_pot_expansion_help_body', defaultBody) : defaultBody
    };
  }
  if (btn.classList.contains('ladder-formula-help-btn')) {
    return {
      title: isEN ? 'Baseline: Lv.60 Ideal Energy' : (isCN ? '天梯基准：Lv.60 满活力' : '天梯基準：Lv.60 滿活力'),
      body: isEN
        ? 'Calculated at Lv.60 under ideal energy (≥80%, 0.45x interval) for daily yield.'
        : (isCN
          ? '以 Lv.60 满活力理想状态 (活力 ≥ 80%，间隔 0.45x) 试算单日产能。'
          : '以 Lv.60 滿活力理想狀態 (活力 ≥ 80%，間隔 0.45x) 試算單日產能。')
    };
  }
  if (btn.classList.contains('pokedex-formula-help-btn')) {
    return {
      title: isEN ? 'Ideal Energy (0.45x) & 12h Daytime Baseline' : (isCN ? '理想活力 0.45x 与 12 小时基准说明' : '理想活力 0.45x 與 12 小時基準說明'),
      body: isEN
        ? 'Under ideal energy (≥80%), helping interval is reduced to <span class="text-accent font-bold">0.45x</span> (~<span class="text-accent font-bold">2.22x yield</span>).<br>Calculation adopts a <span class="text-accent font-bold">12 hours (43200s)</span> daytime active baseline: general players have 12-16 hours waking time, and Pokémon sleep requires ~8.5h, so 12h represents realistic daytime active output without non-active sleep downtime.'
        : (isCN
          ? '活力 ≥ 80% 理想状态下，帮忙间隔缩短为 <span class="text-accent font-bold">0.45 倍</span>（产能约 <span class="text-accent font-bold">2.22 倍</span>）。<br>此处算法采用 <span class="text-accent font-bold">12 小时 (43200秒)</span> 日间活跃基准：一般用户非睡眠时间约 12-16 小时，且宝可梦睡饱需 8.5 小时，扣除夜间睡眠，以 12 小时试算最符合日间实际产能期望。'
          : '活力 ≥ 80% 理想狀態下，幫忙間隔縮短為 <span class="text-accent font-bold">0.45 倍</span>（產能約 <span class="text-accent font-bold">2.22 倍</span>）。<br>此處算法採用 <span class="text-accent font-bold">12 小時 (43200秒)</span> 日間活躍基準：一般用戶非睡眠時間約 12-16 小時，且寶可夢睡飽需 8.5 小時，扣除夜間睡眠，以 12 小時試算最符合日間實際產能期望。')
    };
  }
  if (btn.classList.contains('ladder-help-icon-btn')) {
    return {
      title: isEN ? 'Specialty Trigger Multipliers' : (isCN ? '专长发动几率加成' : '專長發動機率加成'),
      body: isEN
        ? 'All specialties use a 1.0x trigger baseline.<br>Use Skill Trigger M/S and Skill Chance ▲ to simulate boosts.'
        : (isCN
          ? '所有专长皆以 1.0 倍发动几率作为基准。<br>请用技能几率M/S与技能几率▲模拟补正。'
          : '所有專長皆以 1.0 倍發動機率為基準。<br>請用技能機率M/S與技能機率▲模擬補正。')
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