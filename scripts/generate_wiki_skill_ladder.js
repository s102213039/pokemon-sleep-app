/**
 * generate_wiki_skill_ladder.js
 * Generates modular skill ladder files:
 * 1. js/modules/wiki/wiki_skill_ladder_data.js
 * 2. js/modules/wiki/wiki_skill_ladder.js
 * 3. js/modules/wiki/wiki_skill_ladder_render.js
 * 
 * Ensures all files are strictly <= 1000 lines.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const dataJsonPath = path.join(ROOT_DIR, 'data', 'data.json');
const WIKI_DIR = path.join(ROOT_DIR, 'js', 'modules', 'wiki');

const rawData = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));

const cleanPokemonData = rawData.map(p => ({
  id: p.id,
  name_cn: p.name_cn,
  name_en: p.name_en,
  specialty: p.specialty,
  interval: p.interval,
  skill_rate: p.skill_rate,
  main_skill: p.main_skill,
  icon_url: p.icon_url
}));

// =========================================================================
// 1. DATA MODULE: wiki_skill_ladder_data.js
// =========================================================================
const dataFileContent = `  // =========================================================================
  // 主技能天梯基礎數據 (Main Skill Ladder Data)
  // =========================================================================

  const POKEMON_SKILLS_BASELINE_DATA = [
${cleanPokemonData.map(p => '    ' + JSON.stringify(p)).join(',\n')}
  ];

  const EXCLUDED_SKILL_NAMES = [
    '揮指', '模仿', '變身', '十項全能',
    'Metronome', 'Mimic', 'Transform', 'All-Rounder'
  ];

  function isExcludedSkill(skillName) {
    if (!skillName) return true;
    const s = String(skillName).trim();
    return EXCLUDED_SKILL_NAMES.some(ex => s === ex || s.startsWith(ex + '（') || s.startsWith(ex + '(') || s.startsWith(ex + ' '));
  }

  const SKILL_TRACK_DEFINITIONS = [
    {
      id: 'charge_energy',
      name: '能量填充',
      name_en: 'Charge Strength',
      desc: '增加卡比獸的能量',
      desc_en: 'Increases Snorlax Strength',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      svgPath: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'energy_all',
      name: '活力全體療癒',
      name_en: 'Energy for Everyone',
      desc: '讓全體隊友回復活力',
      desc_en: 'Restores Energy to all teammates',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      svgPath: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'energy_single',
      name: '活力單體/隨機療癒',
      name_en: 'Target/Random Energy Cheer',
      desc: '回復自身或隊友活力',
      desc_en: 'Restores Energy to a specific or random ally',
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.15)',
      svgPath: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: 'cooking_pot',
      name: '料理強化（擴鍋）',
      name_en: 'Cooking Power-up',
      desc: '擴大下一次料理的鍋子容量',
      desc_en: 'Expands pot capacity for next cooking',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.15)',
      svgPath: '<path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9H4v10zM12 2v4M8 6h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'cooking_chance',
      name: '料理大成功機率',
      name_en: 'Tasty Chance',
      desc: '提升下一次料理大成功的機率',
      desc_en: 'Boosts extra tasty chance for next dish',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      svgPath: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'helper_boost',
      name: '幫手支援/加速',
      name_en: 'Helper Boost / Speed',
      desc: '全隊或特定屬性立即完成幫忙',
      desc_en: 'Instant helps for team or matching types',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      svgPath: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'dream_shards',
      name: '夢之碎片獲取',
      name_en: 'Dream Shard Magnet',
      desc: '直接獲得夢之碎片',
      desc_en: 'Obtains Dream Shards directly',
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.15)',
      svgPath: '<polygon points="12 2 2 7 12 12 22 7 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="2 17 12 22 22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="2 12 12 17 22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'ingredient',
      name: '食材獲取/精選',
      name_en: 'Ingredient Magnet / Draw',
      desc: '隨機或精選獲得多個食材',
      desc_en: 'Gathers random or selected ingredients',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      svgPath: '<path d="M12 2a5 5 0 0 1 5 5c0 2.3-1.5 4.3-3.6 4.9V19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-7.1C6.5 11.3 5 9.3 5 7a5 5 0 0 1 7-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'berry_burst',
      name: '樹果遽增/發動',
      name_en: 'Berry Burst',
      desc: '直接獲得大量樹果',
      desc_en: 'Instantly obtains multiple berries',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      svgPath: '<circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    }
  ];

  const COMPOSITE_SKILL_TRACKS = {
    '正電': ['ingredient', 'helper_boost'],
    '負電': ['cooking_pot', 'energy_single'],
    '禮物': ['ingredient', 'dream_shards'],
    '健美': ['ingredient', 'cooking_chance'],
    '魔法火焰': ['cooking_pot', 'cooking_chance'],
    '蹭蹭臉頰': ['energy_single', 'helper_boost'],
    '治癒波動': ['energy_single', 'helper_boost'],
    '樹果汁': ['energy_all', 'energy_single'],
    '波導彈': ['charge_energy', 'dream_shards'],
    '新月祈禱': ['energy_all', 'berry_burst'],
    '精神擊破': ['charge_energy', 'berry_burst'],
    '超幸運': ['ingredient', 'dream_shards']
  };

  function getSkillTracks(mainSkill) {
    if (!mainSkill) return [];
    const s = String(mainSkill).trim();

    for (const [compName, tracks] of Object.entries(COMPOSITE_SKILL_TRACKS)) {
      if (s === compName || s.startsWith(compName + '（') || s.startsWith(compName + '(')) {
        return tracks;
      }
    }

    if (s.includes('能量填充') || s.includes('Charge Strength')) return ['charge_energy'];
    if (s.includes('活力療癒全體') || s.includes('活力全體') || s.includes('Energy for Everyone')) return ['energy_all'];
    if (s.includes('活力療癒S') || s.includes('活力填充') || s.includes('活力應援') || s.includes('Energy Cheer') || s.includes('Charge Energy')) return ['energy_single'];
    if (s.includes('料理強化') || s.includes('Cooking Power-up')) return ['cooking_pot'];
    if (s.includes('美味機會') || s.includes('料理成功') || s.includes('Tasty Chance')) return ['cooking_chance'];
    if (s.includes('幫手支援') || s.includes('幫手獎勵') || s.includes('幫手加速') || s.includes('Helper Boost') || s.includes('Extra Helpful')) return ['helper_boost'];
    if (s.includes('夢之碎片') || s.includes('Dream Shard')) return ['dream_shards'];
    if (s.includes('食材獲取') || s.includes('食材精選') || s.includes('Ingredient Magnet') || s.includes('Ingredient Draw')) return ['ingredient'];
    if (s.includes('樹果遽增') || s.includes('Berry Burst')) return ['berry_burst'];

    return ['charge_energy'];
  }
`;

// =========================================================================
// 2. CONTROLLER MODULE: wiki_skill_ladder.js
// =========================================================================
const logicFileContent = `  // =========================================================================
  // 主技能天梯邏輯與控制器 (Main Skill Ladder Controller)
  // =========================================================================

  let skillLadderSearchQuery = '';
  let skillLadderTop15Only = true;
  let skillLadderSortOrder = 'DEFAULT';
  let skillLadderSpecialtyFilter = 'ALL';
  let isSkillLadderSpeedM = false;
  let isSkillLadderSpeedS = false;
  let isSkillLadderSkillM = false;
  let isSkillLadderSkillS = false;
  let skillLadderNatureSpeed = false;
  let skillLadderNatureSkill = false;

  function parseIntervalToSec(intervalStr) {
    if (!intervalStr) return 3600;
    const parts = String(intervalStr).split(':').map(Number);
    if (parts.length === 3) {
      return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    } else if (parts.length === 2) {
      return (parts[0] * 60) + parts[1];
    }
    const num = parseFloat(intervalStr);
    return isNaN(num) ? 3600 : num;
  }

  function getPokemonSkillLadderProcs(pkm) {
    if (!pkm) return null;
    const baseIntervalSec = parseIntervalToSec(pkm.interval);
    const speedDiscount = 0.118;
    const speedReduction = Math.min(0.35, (isSkillLadderSpeedM ? 0.14 : 0) + (isSkillLadderSpeedS ? 0.07 : 0));
    const natureSpeedMult = skillLadderNatureSpeed ? 0.90 : 1.0;
    const effectiveIntervalSec = Math.max(600, Math.round(baseIntervalSec * (1 - speedDiscount) * (1 - speedReduction) * natureSpeedMult));
    const idealIntervalSec = effectiveIntervalSec * 0.45;

    let baseRate = 0.03;
    if (pkm.skill_rate) {
      const parsedRate = parseFloat(pkm.skill_rate) / 100;
      if (!isNaN(parsedRate) && parsedRate > 0) baseRate = parsedRate;
    }
    const subskillRateBonus = (isSkillLadderSkillM ? 0.36 : 0) + (isSkillLadderSkillS ? 0.18 : 0);
    const natureSkillMult = skillLadderNatureSkill ? 1.20 : 1.0;
    const finalSkillRate = baseRate * (1 + subskillRateBonus) * natureSkillMult;
    const procs = (43200 / idealIntervalSec) * finalSkillRate;

    return {
      procs,
      effectiveIntervalSec,
      idealIntervalSec,
      baseSkillRate: baseRate,
      finalSkillRate
    };
  }

  function getAllSkillPokemonList() {
    return POKEMON_SKILLS_BASELINE_DATA;
  }

  function handleSkillLadderSubTabSwitch(targetTab, isWikiMainActive, isMobileH5) {
    const sidebar = document.getElementById('skill-ladder-filter-sidebar');
    const handle = document.getElementById('skill-ladder-sidebar-bookmark-handle');
    const backdrop = document.getElementById('skill-ladder-sidebar-backdrop');

    if (sidebar) {
      if (isWikiMainActive && targetTab === 'skills_ladder') {
        sidebar.style.display = 'flex';
        const isOpen = typeof window.getSidebarSavedState === 'function' ? window.getSidebarSavedState('pksleep_skill_ladder_sidebar_open', true) : true;
        if (isOpen && !isMobileH5 && window.innerWidth > 1024) {
          sidebar.classList.remove('collapsed');
        } else {
          sidebar.classList.add('collapsed');
          if (backdrop) backdrop.classList.remove('active');
        }
      } else {
        sidebar.style.display = 'none';
        sidebar.classList.add('collapsed');
        if (backdrop) backdrop.classList.remove('active');
      }
    }

    if (handle) {
      if (isWikiMainActive && targetTab === 'skills_ladder') {
        const isCollapsed = sidebar ? sidebar.classList.contains('collapsed') : true;
        if (isCollapsed) {
          handle.classList.remove('drawer-open');
          handle.style.display = 'flex';
          handle.style.opacity = '1';
          handle.style.pointerEvents = 'auto';
          handle.style.visibility = 'visible';
        } else {
          handle.classList.add('drawer-open');
          handle.style.display = 'none';
          handle.style.opacity = '0';
          handle.style.pointerEvents = 'none';
          handle.style.visibility = 'hidden';
        }
        updateSkillLadderActiveFilterBadge();
      } else {
        handle.classList.add('drawer-open');
        handle.style.display = 'none';
        handle.style.opacity = '0';
        handle.style.pointerEvents = 'none';
      }
    }

    if (targetTab === 'skills_ladder') {
      try {
        if (typeof refreshSkillCoordinateLadder === 'function') {
          refreshSkillCoordinateLadder();
        }
      } catch (e) {}
    }
  }

  function getSkillLadderSearchQuery() {
    return skillLadderSearchQuery;
  }

  function setSkillLadderSearchQuery(val) {
    onSkillLadderSearch(val);
  }

  function onSkillLadderSearch(val) {
    skillLadderSearchQuery = (val || '').trim();
    const clearBtn = document.getElementById('skill-ladder-search-clear-btn');
    if (clearBtn) {
      clearBtn.style.display = skillLadderSearchQuery ? 'inline-block' : 'none';
    }
    refreshSkillCoordinateLadder();
  }

  function clearSkillLadderSearch() {
    skillLadderSearchQuery = '';
    const input = document.getElementById('skill-ladder-pkm-search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('skill-ladder-search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';
    refreshSkillCoordinateLadder();
  }

  function toggleSkillLadderTop15(enabled) {
    skillLadderTop15Only = enabled !== undefined ? !!enabled : !skillLadderTop15Only;
    const switchInput = document.getElementById('skill-ladder-top15-switch');
    if (switchInput) switchInput.checked = skillLadderTop15Only;
    refreshSkillCoordinateLadder();
  }

  function getSkillLadderTop15Only() {
    return skillLadderTop15Only;
  }

  function setSkillLadderSortOrder(order) {
    skillLadderSortOrder = order || 'DEFAULT';
    const sidebar = document.getElementById('skill-ladder-filter-sidebar') || document;
    const btns = sidebar.querySelectorAll('[data-skill-sort-order]');
    btns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-skill-sort-order') === skillLadderSortOrder);
    });
    refreshSkillCoordinateLadder();
  }

  function getSkillLadderSortOrder() {
    return skillLadderSortOrder;
  }

  function setSkillLadderSpecialtyFilter(spec) {
    skillLadderSpecialtyFilter = spec || 'ALL';
    const sidebar = document.getElementById('skill-ladder-filter-sidebar') || document;
    const btns = sidebar.querySelectorAll('[data-skill-specialty-filter]');
    btns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-skill-specialty-filter') === skillLadderSpecialtyFilter);
    });
    refreshSkillCoordinateLadder();
  }

  function getSkillLadderSpecialtyFilter() {
    return skillLadderSpecialtyFilter;
  }

  function toggleSkillLadderSubskill(key) {
    if (key === 'SPEED_M') isSkillLadderSpeedM = !isSkillLadderSpeedM;
    else if (key === 'SPEED_S') isSkillLadderSpeedS = !isSkillLadderSpeedS;
    else if (key === 'SKILL_M') isSkillLadderSkillM = !isSkillLadderSkillM;
    else if (key === 'SKILL_S') isSkillLadderSkillS = !isSkillLadderSkillS;
    syncSkillLadderSidebarButtons();
    refreshSkillCoordinateLadder();
  }

  function toggleSkillLadderNatureFilter(key) {
    if (key === 'SPEED') {
      skillLadderNatureSpeed = !skillLadderNatureSpeed;
      if (skillLadderNatureSpeed) skillLadderNatureSkill = false;
    } else if (key === 'SKILL') {
      skillLadderNatureSkill = !skillLadderNatureSkill;
      if (skillLadderNatureSkill) skillLadderNatureSpeed = false;
    }
    syncSkillLadderSidebarButtons();
    refreshSkillCoordinateLadder();
  }

  function getSkillLadderNature() {
    if (skillLadderNatureSpeed) return 'SPEED';
    if (skillLadderNatureSkill) return 'SKILL';
    return 'NONE';
  }

  function syncSkillLadderSidebarButtons() {
    const flags = {
      SPEED_M: isSkillLadderSpeedM,
      SPEED_S: isSkillLadderSpeedS,
      SKILL_M: isSkillLadderSkillM,
      SKILL_S: isSkillLadderSkillS
    };
    const sidebar = document.getElementById('skill-ladder-filter-sidebar') || document;
    const subBtns = sidebar.querySelectorAll('[data-skill-subskill-boost]');
    subBtns.forEach(btn => {
      const k = btn.getAttribute('data-skill-subskill-boost');
      btn.classList.toggle('active', !!flags[k]);
    });

    const natBtns = sidebar.querySelectorAll('[data-skill-nature-filter]');
    natBtns.forEach(btn => {
      const k = btn.getAttribute('data-skill-nature-filter');
      const active = (k === 'SPEED' && skillLadderNatureSpeed) || (k === 'SKILL' && skillLadderNatureSkill);
      btn.classList.toggle('active', !!active);
    });
  }

  function resetSkillLadderFilters() {
    skillLadderSearchQuery = '';
    skillLadderTop15Only = true;
    skillLadderSortOrder = 'DEFAULT';
    skillLadderSpecialtyFilter = 'ALL';
    isSkillLadderSpeedM = false;
    isSkillLadderSpeedS = false;
    isSkillLadderSkillM = false;
    isSkillLadderSkillS = false;
    skillLadderNatureSpeed = false;
    skillLadderNatureSkill = false;

    const input = document.getElementById('skill-ladder-pkm-search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('skill-ladder-search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    const switchInput = document.getElementById('skill-ladder-top15-switch');
    if (switchInput) switchInput.checked = true;

    const sidebar = document.getElementById('skill-ladder-filter-sidebar') || document;
    const sortBtns = sidebar.querySelectorAll('[data-skill-sort-order]');
    sortBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-skill-sort-order') === 'DEFAULT'));

    const specBtns = sidebar.querySelectorAll('[data-skill-specialty-filter]');
    specBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-skill-specialty-filter') === 'ALL'));

    syncSkillLadderSidebarButtons();
    updateSkillLadderActiveFilterBadge();
    refreshSkillCoordinateLadder();
  }

  function updateSkillLadderActiveFilterBadge() {
    const badge = document.getElementById('skill-ladder-sidebar-bookmark-badge');
    let count = 0;
    if (skillLadderSearchQuery && skillLadderSearchQuery.trim()) count++;
    if (skillLadderSpecialtyFilter && skillLadderSpecialtyFilter !== 'ALL') count++;
    if (skillLadderSortOrder && skillLadderSortOrder !== 'DEFAULT') count++;
    if (!skillLadderTop15Only) count++;
    if (isSkillLadderSpeedM || isSkillLadderSpeedS || isSkillLadderSkillM || isSkillLadderSkillS) count++;
    if (skillLadderNatureSpeed || skillLadderNatureSkill) count++;

    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  function openSkillLadderSidebar() {
    toggleSkillLadderSidebar(true);
  }

  function closeSkillLadderSidebar() {
    toggleSkillLadderSidebar(false);
  }

  function toggleSkillLadderSidebar(forceOpen) {
    const sidebar = document.getElementById('skill-ladder-filter-sidebar');
    const handle = document.getElementById('skill-ladder-sidebar-bookmark-handle');
    const backdrop = document.getElementById('skill-ladder-sidebar-backdrop');
    if (!sidebar) return;

    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    let open;
    if (typeof forceOpen === 'boolean') {
      open = forceOpen;
    } else {
      open = sidebar.classList.contains('collapsed');
    }

    if (open) {
      sidebar.classList.remove('collapsed');
      if (backdrop) backdrop.classList.add('active');
      if (handle) {
        if (isMobileH5) {
          handle.classList.add('drawer-open');
        } else {
          handle.classList.add('drawer-open');
          handle.style.display = 'none';
        }
      }
      if (typeof window.saveSidebarState === 'function') {
        window.saveSidebarState('pksleep_skill_ladder_sidebar_open', true);
      }
    } else {
      sidebar.classList.add('collapsed');
      if (backdrop) backdrop.classList.remove('active');
      if (handle) {
        handle.classList.remove('drawer-open');
        handle.style.display = 'flex';
        handle.style.opacity = '1';
        handle.style.pointerEvents = 'auto';
        handle.style.visibility = 'visible';
      }
      if (typeof window.saveSidebarState === 'function') {
        window.saveSidebarState('pksleep_skill_ladder_sidebar_open', false);
      }
    }
    updateSkillLadderActiveFilterBadge();
  }

  function toggleSkillLadderEnergyHelp(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const popover = document.getElementById('skill-ladder-energy-help-popover');
    if (!popover) return;
    const isVisible = popover.style.display !== 'none';
    popover.style.display = isVisible ? 'none' : 'block';
  }

  function closeSkillLadderEnergyHelp(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const popover = document.getElementById('skill-ladder-energy-help-popover');
    if (popover) popover.style.display = 'none';
  }
`;

// =========================================================================
// 3. RENDER MODULE: wiki_skill_ladder_render.js
// =========================================================================
const renderFileContent = `  // =========================================================================
  // 主技能天梯渲染與視圖 (Main Skill Ladder View & Renderers)
  // =========================================================================

  function renderSkillCoordinateLadder() {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const allPkm = getAllSkillPokemonList();

    let globalMaxProcs = 4.0;
    const processedTracks = SKILL_TRACK_DEFINITIONS.map(track => {
      const trackId = track.id;
      const trackName = isEN ? track.name_en : track.name;
      const trackDesc = isEN ? track.desc_en : track.desc;

      const matchingPokemon = allPkm.filter(p => {
        if (!p || isExcludedSkill(p.main_skill)) return false;
        const tracks = getSkillTracks(p.main_skill);
        if (!tracks.includes(trackId)) return false;

        const spec = p.specialty || '';
        if (skillLadderSpecialtyFilter === 'SKILL' && !spec.includes('技能') && spec !== 'Skills') return false;
        if (skillLadderSpecialtyFilter === 'BERRY' && !spec.includes('樹果') && spec !== 'Berries') return false;
        if (skillLadderSpecialtyFilter === 'INGREDIENT' && !spec.includes('食材') && spec !== 'Ingredients') return false;

        if (skillLadderSearchQuery) {
          if (typeof matchesLadderSearch === 'function') {
            if (!matchesLadderSearch(p.name_cn || p.name, p.name_en, skillLadderSearchQuery)) return false;
          } else {
            const q = skillLadderSearchQuery.toLowerCase();
            const nCn = (p.name_cn || p.name || '').toLowerCase();
            const nEn = (p.name_en || '').toLowerCase();
            if (!nCn.includes(q) && !nEn.includes(q)) return false;
          }
        }
        return true;
      });

      const nodes = matchingPokemon.map(p => {
        const calcRes = getPokemonSkillLadderProcs(p);
        if (!calcRes) return null;

        const specStr = p.specialty || '技能';
        const specKey = (specStr.includes('樹果') || specStr === 'Berries') ? 'berry'
          : (specStr.includes('食材') || specStr === 'Ingredients') ? 'ingredient'
          : 'skill';
        const specDisplay = isEN
          ? (specKey === 'berry' ? 'Berries' : specKey === 'ingredient' ? 'Ingredients' : 'Skills')
          : (specKey === 'berry' ? '樹果型' : specKey === 'ingredient' ? '食材型' : '技能型');

        const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(p.name_cn || p.name)) || p.name_en || p.name_cn) : (p.name_cn || p.name);
        const skillName = p.main_skill || '';
        const skillDisplayName = isEN ? ((window.I18N && window.I18N.getMainSkillName(skillName)) || skillName) : skillName;
        const iconUrl = p.icon_url || (p.formatted_no ? 'https://www.serebii.net/pokemonsleep/pokemon/icon/' + p.formatted_no + '.png' : '');

        return {
          p,
          procs: calcRes.procs,
          displayCount: calcRes.procs.toFixed(2),
          calcRes,
          pkmDisplayName,
          specialtyKey: specKey,
          specialtyDisplay: specDisplay,
          skillName,
          skillDisplayName,
          iconUrl,
          isTopNode: false
        };
      }).filter(Boolean);

      nodes.sort((a, b) => b.procs - a.procs);
      if (nodes.length > 0) nodes[0].isTopNode = true;

      let visibleNodes = nodes;
      if (skillLadderTop15Only && visibleNodes.length > 15) {
        visibleNodes = visibleNodes.slice(0, 15);
      }

      visibleNodes.forEach(n => {
        if (n.procs > globalMaxProcs) globalMaxProcs = n.procs;
      });

      const trackMaxProcs = visibleNodes.length > 0 ? visibleNodes[0].procs : 0;

      return {
        track,
        trackId,
        trackName,
        trackDesc,
        nodes: visibleNodes,
        totalCount: nodes.length,
        trackMaxProcs,
        isTrackEmpty: visibleNodes.length === 0
      };
    });

    if (skillLadderSortOrder === 'PROCS_DESC') {
      processedTracks.sort((a, b) => b.trackMaxProcs - a.trackMaxProcs);
    } else if (skillLadderSortOrder === 'COUNT_DESC') {
      processedTracks.sort((a, b) => b.nodes.length - a.nodes.length);
    }

    const minVal = 0;
    const maxVal = Math.max(4, Math.ceil(globalMaxProcs * 1.05));
    const step = maxVal > 14 ? 2 : 1;
    const ticks = [];
    for (let t = minVal; t <= maxVal; t += step) ticks.push(t);
    if (ticks[ticks.length - 1] < maxVal) ticks.push(maxVal);

    function getPosPct(val) {
      const clamped = Math.min(Math.max(val, minVal), maxVal);
      return (((clamped - minVal) / (maxVal - minVal)) * 100).toFixed(2);
    }

    return \`
      <div class="wiki-coordinate-ladder-wrapper">
        <div class="wiki-coordinate-ladder">
          <div class="ladder-ruler-header">
            <div class="ladder-ruler-spacer">
              <span class="text-secondary font-bold" style="font-size: 11px; letter-spacing: 0.5px;">\${isEN ? 'Procs/12h' : '發動次數/12h'}</span>
            </div>
            <div class="ladder-ruler-scale">
              \${ticks.map(t => \`
                <div class="ladder-ruler-tick" style="left: \${getPosPct(t)}%;">
                  <span class="tick-label">\${t}</span>
                  <div class="tick-line"></div>
                </div>
              \`).join('')}
            </div>
          </div>

          \${processedTracks.map(({ track, trackName, trackDesc, nodes, isTrackEmpty }, trackIdx) => {
            const isTopTrack = trackIdx < 4;
            const popupDirectionClass = isTopTrack ? 'popup-down' : 'popup-up';

            let minTrackCount = maxVal;
            nodes.forEach(n => {
              if (n.procs < minTrackCount) minTrackCount = n.procs;
            });
            if (minTrackCount > maxVal) minTrackCount = minVal;
            const leadPct = getPosPct(minTrackCount);

            const countGroups = {};
            nodes.forEach(n => {
              const k = n.procs.toFixed(1);
              if (!countGroups[k]) countGroups[k] = [];
              countGroups[k].push(n);
            });

            return \`
              <div class="ladder-track-row \${isTrackEmpty ? 'ladder-track-empty' : ''} \${isTopTrack ? 'ladder-track-top' : ''}" data-skill-track="\${track.id}">
                <div class="ladder-track-header" title="\${escapeHtml(trackName)} · \${escapeHtml(trackDesc)}">
                  <div class="ladder-track-ing-main skill-track-icon-main" style="display:flex;align-items:center;justify-content:center;">
                    <span class="skill-track-icon-wrapper" style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:\${track.bgColor};color:\${track.color};">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                        \${track.svgPath}
                      </svg>
                    </span>
                  </div>
                  <div class="skill-track-header-title-box" style="margin-left: 8px; overflow: hidden;">
                    <span class="font-bold text-primary" style="font-size: 13px; display: block; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">\${escapeHtml(trackName)}</span>
                    <span class="text-secondary" style="font-size: 11px; display: block; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">\${nodes.length} \${isEN ? 'species' : '種寶可夢'}</span>
                  </div>
                </div>

                <div class="ladder-track-canvas">
                  <div class="ladder-grid-lines">
                    \${ticks.map(t => \`<div class="ladder-grid-line" style="left: \${getPosPct(t)}%;"></div>\`).join('')}
                  </div>
                  <div class="ladder-track-lead-line" style="left: 0; width: \${leadPct}%;"></div>
                  <div class="ladder-track-line" style="left: \${leadPct}%; right: 0;"></div>

                  <div class="ladder-nodes-container">
                    \${nodes.map((node, nodeIdx) => {
                      const groupKey = node.procs.toFixed(1);
                      const group = countGroups[groupKey] || [node];
                      const groupSize = group.length;
                      const itemIdx = group.indexOf(node);

                      let offsetPx = 0;
                      if (groupSize > 1) {
                        const staggerStep = groupSize >= 6 ? 14 : 18;
                        offsetPx = Math.round((itemIdx - (groupSize - 1) / 2) * staggerStep);
                      }

                      const basePosPct = parseFloat(getPosPct(node.procs));
                      const alignClass = basePosPct > 60 ? 'align-right' : (basePosPct < 40 ? 'align-left' : 'align-center');
                      const leftStyle = offsetPx === 0 ? \`\${basePosPct}%\` : \`calc(\${basePosPct}% + \${offsetPx}px)\`;
                      const zIndex = node.isTopNode ? 50 : Math.max(40 - nodeIdx, 5);

                      const idealMin = Math.floor(node.calcRes.idealIntervalSec / 60);
                      const idealSec = Math.round(node.calcRes.idealIntervalSec % 60);

                      return \`
                        <div class="ladder-node \${node.isTopNode ? 'node-top1' : ''} \${alignClass} \${popupDirectionClass} \${groupSize > 1 ? 'node-in-cluster' : ''}"
                             data-pkm="\${escapeHtml(node.p.name_cn || node.p.name)}"
                             style="left: \${leftStyle}; z-index: \${zIndex};">
                          <div class="node-avatar-wrapper">
                            <img src="\${node.iconUrl}" class="node-avatar-img" alt="\${escapeHtml(node.pkmDisplayName)}" loading="lazy" decoding="async">
                          </div>
                          <div class="node-count-badge" title="\${isEN ? '12h Expected Triggers: ' : '日間 12h 預估發動次數：'}\${node.displayCount}">
                            \${node.displayCount}
                          </div>

                          <div class="ladder-node-tooltip">
                            <div class="tooltip-title">
                              \${node.isTopNode ? (isEN ? 'Top 1 ' : 'TOP 1 ') : ''}\${escapeHtml(node.pkmDisplayName)}
                              <span class="node-specialty-tag specialty-\${node.specialtyKey}" style="margin-left: 6px; font-size: 10px; padding: 1px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: var(--accent-color, #38bdf8);">\${node.specialtyDisplay}</span>
                            </div>
                            <div class="tooltip-detail">
                              \${isEN ? 'Est. 12h Triggers: ' : '預估 12h 發動：'}
                              <span class="text-success font-bold">\${node.displayCount} \${isEN ? 'procs/12h' : '次/12h'}</span>
                            </div>
                            <div class="tooltip-yield-breakdown">
                              <div class="breakdown-row">
                                <span class="breakdown-label">\${isEN ? 'Main Skill:' : '主技能：'}</span>
                                <span class="breakdown-val font-bold text-primary">\${escapeHtml(node.skillDisplayName)}</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">\${isEN ? 'Base Rate:' : '基礎機率：'}</span>
                                <span class="breakdown-val">\${(node.calcRes.baseSkillRate * 100).toFixed(2)}%</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">\${isEN ? 'Final Rate:' : '最終機率：'}</span>
                                <span class="breakdown-val text-accent font-bold">\${(node.calcRes.finalSkillRate * 100).toFixed(2)}%</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">\${isEN ? 'Ideal Interval (0.45x):' : '滿活力間隔 (0.45x)：'}</span>
                                <span class="breakdown-val">\${idealMin}\${isEN ? 'm ' : '分'}\${idealSec}\${isEN ? 's' : '秒'}</span>
                              </div>
                              <div class="breakdown-row">
                                <span class="breakdown-label">\${isEN ? 'Est. Helps (12h):' : '日間 12h 總幫忙次數：'}</span>
                                <span class="breakdown-val">\${(43200 / node.calcRes.idealIntervalSec).toFixed(1)} \${isEN ? 'helps' : '次'}</span>
                              </div>
                            </div>
                            <div class="tooltip-note" style="margin-top: 6px; font-size: 11px; line-height: 1.4; color: var(--text-secondary);">
                              \${isEN ? 'Formula: 43200 / (effectiveInterval * 0.45) * finalSkillRate' : '計算公式：43200 / (有效間隔 * 0.45) * 最終技能機率'}
                            </div>
                          </div>
                        </div>
                      \`;
                    }).join('')}
                  </div>
                </div>
              </div>
            \`;
          }).join('')}
        </div>
      </div>
    \`;
  }

  function refreshSkillCoordinateLadder() {
    const container = document.getElementById('wiki-skill-ladder-coordinate');
    if (container) {
      container.innerHTML = renderSkillCoordinateLadder();
    }
    updateSkillLadderActiveFilterBadge();
  }

  function renderSkillLadderMobileHandle(currentWikiSubTab, isEN) {
    return \`
      <!-- 右下懸浮技能天梯篩選按鈕 (Mobile FAB) -->
      <button type="button" id="skill-ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle sidebar-fab-btn" onclick="window.WikiDB.openSkillLadderSidebar()" title="\${isEN ? 'Filter' : '展開技能天梯篩選器'}" aria-label="\${isEN ? 'Filter' : '展開技能天梯篩選器'}" style="\${currentWikiSubTab === 'skills_ladder' ? 'display:flex;' : 'display:none;'}">
        <span class="bookmark-icon">
          <svg class="fab-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
        </span>
        <span id="skill-ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
      </button>
    \`;
  }

  function renderSkillLadderSidebar(initialSkillLadderCollapsed, isEN) {
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    return \`
      <aside id="skill-ladder-filter-sidebar" class="pokemon-filter-sidebar ladder-fixed-sidebar \${initialSkillLadderCollapsed}" style="\${currentWikiSubTab === 'skills_ladder' ? 'display:flex;' : 'display:none;'}" aria-label="\${isEN ? 'Skill Filters' : '技能天梯篩選器'}">
        \${!isMobileH5 ? \`
          <button type="button" id="skill-ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle" onclick="window.WikiDB.toggleSkillLadderSidebar(true)" title="\${isEN ? 'Expand Filter' : '展開技能天梯篩選側邊欄'}" aria-label="\${isEN ? 'Expand Filter' : '展開技能天梯篩選側邊欄'}">
            <span class="bookmark-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
            </span>
            <span class="bookmark-text">\${isEN ? 'Filter' : '篩選'}</span>
            <span class="bookmark-arrow">◀</span>
            <span id="skill-ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
          </button>
        \` : ''}

        <div class="sidebar-header">
          <button type="button" id="skill-ladder-sidebar-close-btn" class="sidebar-close-btn" onclick="window.WikiDB.toggleSkillLadderSidebar(false)" title="\${isEN ? 'Collapse Filter' : '收合側邊欄'}" aria-label="\${isEN ? 'Collapse Filter' : '收合側邊欄'}">◀</button>
          <div class="sidebar-title-group" style="display:flex;align-items:center;gap:6px;">
            <span class="sidebar-title">\${isEN ? 'Skill Filters' : '技能天梯篩選器'}</span>
            <button type="button" class="pokedex-formula-help-btn ladder-formula-help-btn" onclick="window.WikiDB.toggleSkillLadderEnergyHelp(event)" title="\${isEN ? 'Baseline: Lv.60 Ideal Energy (0.45x) 12h' : '基準：Lv.60 滿活力 (0.45x) 12小時'}" aria-label="Skill Ladder Energy Info">?</button>
          </div>
          <button type="button" id="skill-ladder-reset-all-btn" class="sidebar-reset-btn" onclick="window.WikiDB.resetSkillLadderFilters()" title="\${isEN ? 'Reset Filters' : '重設所有條件'}">\${isEN ? 'Reset' : '全部重設'}</button>

          <div id="skill-ladder-energy-help-popover" class="ladder-energy-help-popover" style="display:none;" role="tooltip">
            <div class="pokedex-energy-help-backdrop" onclick="window.WikiDB.closeSkillLadderEnergyHelp(event)"></div>
            <div class="pokedex-energy-help-bubble ladder-energy-help-bubble">
              <div class="energy-help-title font-bold">\${isEN ? 'Baseline: Lv.60 Ideal Energy (12h)' : '天梯基準：Lv.60 滿活力 (12h)'}</div>
              <div class="energy-help-body">
                \${isEN
                  ? 'Calculated at Lv.60 under ideal energy (≥80%, 0.45x interval) for daytime 12-hour procs: 43200 / (effectiveInterval * 0.45) * finalSkillRate.'
                  : '以 Lv.60 滿活力理想狀態 (活力 ≥ 80%，間隔 0.45x) 試算日間 12 小時主技能發動次數：43200 / (有效間隔 * 0.45) * 最終技能機率。'}
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-scrollable-content">
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">\${isEN ? 'Search Pokémon' : '搜尋寶可夢'}</span>
              <button type="button" id="skill-ladder-search-clear-btn" class="sidebar-section-clear-btn" style="\${(typeof getSkillLadderSearchQuery === 'function' && getSkillLadderSearchQuery()) ? 'display:inline-block;' : 'display:none;'}" onclick="window.WikiDB.clearSkillLadderSearch()">\${isEN ? 'Clear' : '清空'}</button>
            </div>
            <div class="sidebar-search-box" style="margin-top: 4px;">
              <span class="sidebar-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"></circle>
                  <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                </svg>
              </span>
              <input type="text" id="skill-ladder-pkm-search-input" class="sidebar-search-input" placeholder="\${isEN ? 'Search Pokémon...' : '搜尋寶可夢名稱...'}" value="\${(typeof getSkillLadderSearchQuery === 'function' ? getSkillLadderSearchQuery() : '')}" oninput="window.WikiDB.onSkillLadderSearch(this.value)">
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">\${isEN ? 'Track Sorting' : '天梯軌道排序'}</span>
              <label class="ladder-top15-switch-label" title="\${isEN ? 'Show Top 15 Only' : '預設開啟前15名排行'}">
                <input type="checkbox" id="skill-ladder-top15-switch" class="ladder-switch-input" \${(typeof getSkillLadderTop15Only === 'function' ? getSkillLadderTop15Only() : true) ? 'checked' : ''} onchange="window.WikiDB.toggleSkillLadderTop15(this.checked)">
                <span class="ladder-switch-slider"></span>
                <span class="ladder-switch-text">\${isEN ? 'Top 15' : '前15名'}</span>
              </label>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn \${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'DEFAULT') ? 'active' : ''}" data-skill-sort-order="DEFAULT" onclick="window.WikiDB.setSkillLadderSortOrder('DEFAULT')">\${isEN ? 'Default' : '預設分類'}</button>
              <button type="button" class="tag-btn \${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'PROCS_DESC') ? 'active' : ''}" data-skill-sort-order="PROCS_DESC" onclick="window.WikiDB.setSkillLadderSortOrder('PROCS_DESC')">\${isEN ? 'Procs: High-Low' : '次數：多到少'}</button>
              <button type="button" class="tag-btn \${(typeof getSkillLadderSortOrder === 'function' && getSkillLadderSortOrder() === 'COUNT_DESC') ? 'active' : ''}" data-skill-sort-order="COUNT_DESC" onclick="window.WikiDB.setSkillLadderSortOrder('COUNT_DESC')">\${isEN ? 'Species: High-Low' : '數量：多到少'}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">\${isEN ? 'Specialty Type' : '寶可夢專長'}</span>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn \${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'ALL') ? 'active' : ''}" data-skill-specialty-filter="ALL" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('ALL')">\${isEN ? 'All' : '全部'}</button>
              <button type="button" class="tag-btn \${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'SKILL') ? 'active' : ''}" data-skill-specialty-filter="SKILL" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('SKILL')">\${isEN ? 'Skill' : '技能型'}</button>
              <button type="button" class="tag-btn \${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'BERRY') ? 'active' : ''}" data-skill-specialty-filter="BERRY" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('BERRY')">\${isEN ? 'Berry' : '樹果型'}</button>
              <button type="button" class="tag-btn \${(typeof getSkillLadderSpecialtyFilter === 'function' && getSkillLadderSpecialtyFilter() === 'INGREDIENT') ? 'active' : ''}" data-skill-specialty-filter="INGREDIENT" onclick="window.WikiDB.setSkillLadderSpecialtyFilter('INGREDIENT')">\${isEN ? 'Ingredient' : '食材型'}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">\${isEN ? 'Sub-Skills' : '副技能補正模擬'}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn \${typeof isSkillLadderSpeedM !== 'undefined' && isSkillLadderSpeedM ? 'active' : ''}" id="skill-ladder-speed-m-toggle" data-skill-subskill-boost="SPEED_M" onclick="window.WikiDB.toggleSkillLadderSubskill('SPEED_M')">\${isEN ? 'Help Speed M' : '幫忙速度M'}</button>
              <button type="button" class="tag-btn \${typeof isSkillLadderSpeedS !== 'undefined' && isSkillLadderSpeedS ? 'active' : ''}" id="skill-ladder-speed-s-toggle" data-skill-subskill-boost="SPEED_S" onclick="window.WikiDB.toggleSkillLadderSubskill('SPEED_S')">\${isEN ? 'Help Speed S' : '幫忙速度S'}</button>
              <button type="button" class="tag-btn \${typeof isSkillLadderSkillM !== 'undefined' && isSkillLadderSkillM ? 'active' : ''}" id="skill-ladder-skill-m-toggle" data-skill-subskill-boost="SKILL_M" onclick="window.WikiDB.toggleSkillLadderSubskill('SKILL_M')">\${isEN ? 'Skill Trigger M' : '技能機率M'}</button>
              <button type="button" class="tag-btn \${typeof isSkillLadderSkillS !== 'undefined' && isSkillLadderSkillS ? 'active' : ''}" id="skill-ladder-skill-s-toggle" data-skill-subskill-boost="SKILL_S" onclick="window.WikiDB.toggleSkillLadderSubskill('SKILL_S')">\${isEN ? 'Skill Trigger S' : '技能機率S'}</button>
            </div>
          </div>

          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">\${isEN ? 'Nature Boost' : '性格補正模擬'}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn \${(typeof getSkillLadderNature === 'function' && getSkillLadderNature() === 'SPEED') ? 'active' : ''}" data-skill-nature-filter="SPEED" onclick="window.WikiDB.toggleSkillLadderNatureFilter('SPEED')">\${isEN ? 'Help Speed ▲' : '幫忙速度▲'}</button>
              <button type="button" class="tag-btn \${(typeof getSkillLadderNature === 'function' && getSkillLadderNature() === 'SKILL') ? 'active' : ''}" data-skill-nature-filter="SKILL" onclick="window.WikiDB.toggleSkillLadderNatureFilter('SKILL')">\${isEN ? 'Skill Chance ▲' : '技能機率▲'}</button>
            </div>
          </div>
        </div>
      </aside>
    \`;
  }

  function attachSkillLadderExports(wikiExport, targetWindow) {
    const methods = {
      toggleSkillLadderSidebar: toggleSkillLadderSidebar,
      openSkillLadderSidebar: openSkillLadderSidebar,
      closeSkillLadderSidebar: closeSkillLadderSidebar,
      toggleSkillLadderEnergyHelp: toggleSkillLadderEnergyHelp,
      closeSkillLadderEnergyHelp: closeSkillLadderEnergyHelp,
      resetSkillLadderFilters: resetSkillLadderFilters,
      onSkillLadderSearch: onSkillLadderSearch,
      setSkillLadderSearchQuery: setSkillLadderSearchQuery,
      getSkillLadderSearchQuery: getSkillLadderSearchQuery,
      clearSkillLadderSearch: clearSkillLadderSearch,
      toggleSkillLadderTop15: toggleSkillLadderTop15,
      getSkillLadderTop15Only: getSkillLadderTop15Only,
      setSkillLadderSortOrder: setSkillLadderSortOrder,
      getSkillLadderSortOrder: getSkillLadderSortOrder,
      setSkillLadderSpecialtyFilter: setSkillLadderSpecialtyFilter,
      getSkillLadderSpecialtyFilter: getSkillLadderSpecialtyFilter,
      toggleSkillLadderSubskill: toggleSkillLadderSubskill,
      toggleSkillLadderNatureFilter: toggleSkillLadderNatureFilter,
      getSkillLadderNature: getSkillLadderNature,
      refreshSkillCoordinateLadder: refreshSkillCoordinateLadder,
      renderSkillCoordinateLadder: renderSkillCoordinateLadder,
      updateSkillLadderActiveFilterBadge: updateSkillLadderActiveFilterBadge,
      POKEMON_SKILLS_BASELINE_DATA: typeof POKEMON_SKILLS_BASELINE_DATA !== 'undefined' ? POKEMON_SKILLS_BASELINE_DATA : [],
      SKILL_TRACK_DEFINITIONS: typeof SKILL_TRACK_DEFINITIONS !== 'undefined' ? SKILL_TRACK_DEFINITIONS : [],
      COMPOSITE_SKILL_TRACKS: typeof COMPOSITE_SKILL_TRACKS !== 'undefined' ? COMPOSITE_SKILL_TRACKS : {},
      getPokemonSkillLadderProcs: typeof getPokemonSkillLadderProcs === 'function' ? getPokemonSkillLadderProcs : null
    };

    if (wikiExport && typeof wikiExport === 'object') {
      Object.assign(wikiExport, methods);
    }
    if (targetWindow && typeof targetWindow === 'object') {
      Object.assign(targetWindow, methods);
    }
  }
`;

fs.writeFileSync(path.join(WIKI_DIR, 'wiki_skill_ladder_data.js'), dataFileContent, 'utf8');
fs.writeFileSync(path.join(WIKI_DIR, 'wiki_skill_ladder.js'), logicFileContent, 'utf8');
fs.writeFileSync(path.join(WIKI_DIR, 'wiki_skill_ladder_render.js'), renderFileContent, 'utf8');

console.log('Successfully generated modular skill ladder files:');
console.log('  - wiki_skill_ladder_data.js:', dataFileContent.split('\n').length, 'lines');
console.log('  - wiki_skill_ladder.js:', logicFileContent.split('\n').length, 'lines');
console.log('  - wiki_skill_ladder_render.js:', renderFileContent.split('\n').length, 'lines');
