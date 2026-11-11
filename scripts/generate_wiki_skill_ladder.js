/**
 * generate_wiki_skill_ladder.js
 * Generates modular skill ladder baseline dataset:
 * js/modules/wiki/wiki_skill_ladder_data.js from data/data.json
 * 
 * Ensures file is strictly <= 1000 lines.
 */

const fs = require('path');
const path = require('path');
const nodeFs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');
const dataJsonPath = path.join(ROOT_DIR, 'data', 'data.json');
const WIKI_DIR = path.join(ROOT_DIR, 'js', 'modules', 'wiki');

const rawData = JSON.parse(nodeFs.readFileSync(dataJsonPath, 'utf8'));

const cleanPokemonData = rawData.map(p => ({
  id: p.id,
  formatted_no: p.formatted_no,
  name_cn: p.name_cn,
  name_en: p.name_en,
  name_jp: p.name_jp,
  specialty: p.specialty,
  interval: p.interval,
  skill_rate: p.skill_rate,
  main_skill: p.main_skill,
  is_final: p.is_final || '',
  icon_url: p.icon_url
}));

const dataFileContent = `  // =========================================================================
  // 主技能天梯基礎數據 (Main Skill Ladder Data)
  // =========================================================================

  const POKEMON_SKILLS_BASELINE_DATA = [
${cleanPokemonData.map(p => '    ' + JSON.stringify(p)).join(',\n')}
  ];

  const EXCLUDED_SKILL_NAMES = [
    '揮指', '模仿', '變身', '十項全能', '技能複製',
    '挥指', '变身', '十项全能', '技能复制',
    'Metronome', 'Mimic', 'Transform', 'All-Rounder', 'Skill Copy', 'Finger Wag'
  ];

  function isExcludedSkill(skillName) {
    if (!skillName) return true;
    const s = String(skillName).trim();
    const sLower = s.toLowerCase();
    return EXCLUDED_SKILL_NAMES.some(ex => {
      const exLower = ex.toLowerCase();
      return s === ex || sLower === exLower ||
        s.startsWith(ex + '（') || s.startsWith(ex + '(') || s.startsWith(ex + ' ') ||
        sLower.startsWith(exLower + '(') || sLower.startsWith(exLower + ' ');
    });
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
      name: '全體療癒',
      name_en: 'Energy for Everyone',
      desc: '讓全體隊友回復活力',
      desc_en: 'Restores Energy to all teammates',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      svgPath: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'energy_single',
      name: '單體療癒',
      name_en: 'Single/Random Heal',
      desc: '回復自身或隊友活力',
      desc_en: 'Restores Energy to a specific or random ally',
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.15)',
      svgPath: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    },
    {
      id: 'cooking_pot',
      name: '料理強化',
      name_en: 'Cooking Power-up',
      desc: '擴大下一次料理的鍋子容量',
      desc_en: 'Expands pot capacity for next cooking',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.15)',
      svgPath: '<path d="M4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9H4v10zM12 2v4M8 6h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'cooking_chance',
      name: '料理成功',
      name_en: 'Tasty Chance',
      desc: '提升下一次料理大成功的機率',
      desc_en: 'Boosts extra tasty chance for next dish',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      svgPath: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'helper_boost',
      name: '幫手支援',
      name_en: 'Helper Boost',
      desc: '全隊或特定屬性立即完成幫忙',
      desc_en: 'Instant helps for team or matching types',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      svgPath: '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'dream_shards',
      name: '夢碎獲取',
      name_en: 'Dream Shards',
      desc: '直接獲得夢之碎片',
      desc_en: 'Obtains Dream Shards directly',
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.15)',
      svgPath: '<polygon points="12 2 2 7 12 12 22 7 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="2 17 12 22 22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="2 12 12 17 22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'ingredient',
      name: '食材獲取',
      name_en: 'Ingredients',
      desc: '隨機或精選獲得多個食材',
      desc_en: 'Gathers random or selected ingredients',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.15)',
      svgPath: '<path d="M12 2a5 5 0 0 1 5 5c0 2.3-1.5 4.3-3.6 4.9V19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-7.1C6.5 11.3 5 9.3 5 7a5 5 0 0 1 7-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    },
    {
      id: 'berry_burst',
      name: '樹果遽增',
      name_en: 'Berry Burst',
      desc: '直接獲得大量樹果',
      desc_en: 'Instantly obtains multiple berries',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      svgPath: '<circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
    }
  ];

  const COMPOSITE_SKILL_TRACKS = {
    // 官方複合主技能與專屬技能多軌道映射
    '正電': ['ingredient', 'helper_boost'],
    'Plus': ['ingredient', 'helper_boost'],
    '負電': ['cooking_pot', 'energy_single'],
    'Minus': ['cooking_pot', 'energy_single'],
    '禮物': ['ingredient', 'dream_shards'],
    'Present': ['ingredient', 'dream_shards'],
    '健美': ['ingredient', 'cooking_chance'],
    'Bulk Up': ['ingredient', 'cooking_chance'],
    '魔法火焰': ['cooking_pot', 'cooking_chance'],
    'Mystical Fire': ['cooking_pot', 'cooking_chance'],
    '蹭蹭臉頰': ['energy_single', 'helper_boost'],
    'Nuzzle': ['energy_single', 'helper_boost'],
    '治癒波動': ['energy_single', 'helper_boost'],
    'Heal Pulse': ['energy_single', 'helper_boost'],
    '樹果汁': ['energy_all', 'energy_single'],
    'Berry Juice': ['energy_all', 'energy_single'],
    '波導彈': ['charge_energy', 'dream_shards'],
    'Aura Sphere': ['charge_energy', 'dream_shards'],
    '新月祈禱': ['energy_all', 'berry_burst'],
    'Lunar Prayer': ['energy_all', 'berry_burst'],
    '精神擊破': ['charge_energy', 'berry_burst'],
    'Psystrike': ['charge_energy', 'berry_burst'],
    '超幸運': ['ingredient', 'dream_shards'],
    'Super Luck': ['ingredient', 'dream_shards'],
    '怪力鉗': ['ingredient', 'cooking_chance'],
    '怪力钳': ['ingredient', 'cooking_chance'],
    'Hyper Cutter': ['ingredient', 'cooking_chance'],
    '月光': ['energy_single'],
    'Moonlight': ['energy_single'],
    '流星群': ['berry_burst'],
    'Draco Meteor': ['berry_burst'],
    '畫皮': ['berry_burst', 'cooking_chance'],
    'Disguise': ['berry_burst', 'cooking_chance'],
    '蓄力': ['charge_energy'],
    'Stockpile': ['charge_energy'],
    '夢魘': ['charge_energy'],
    'Bad Dreams': ['charge_energy'],
    'Darkrai Nightmare': ['charge_energy']
  };

  function getSkillTracks(mainSkill) {
    if (!mainSkill) return [];
    if (isExcludedSkill(mainSkill)) return [];
    const s = String(mainSkill).trim();
    const sLower = s.toLowerCase();

    for (const [compName, tracks] of Object.entries(COMPOSITE_SKILL_TRACKS)) {
      const compLower = compName.toLowerCase();
      if (s === compName || sLower === compLower ||
          s.startsWith(compName + '（') || s.startsWith(compName + '(') || s.startsWith(compName + ' ') ||
          sLower.startsWith(compLower + '(') || sLower.startsWith(compLower + ' ')) {
        return tracks;
      }
    }

    if (sLower.includes('charge strength') || sLower.includes('darkrai nightmare') || s.includes('能量填充') || s.includes('能量充填') || s.includes('達克萊伊專屬')) return ['charge_energy'];
    if (sLower.includes('energy for everyone') || s.includes('活力全體') || s.includes('活力全体') || s.includes('活力療癒全體') || s.includes('活力疗愈全体') || ((s.includes('活力療癒') || s.includes('活力疗愈')) && (s.includes('全体') || s.includes('全體'))) || s.includes('全體療癒') || s.includes('全体疗愈') || s.includes('全體能量回復') || s.includes('全体能量回复')) return ['energy_all'];
    if (sLower.includes('energizing cheer') || sLower.includes('energy cheer') || sLower.includes('charge energy') || s.includes('活力療癒') || s.includes('活力疗愈') || s.includes('活力填充') || s.includes('活力充填') || s.includes('活力應援') || s.includes('活力应援') || s.includes('自體活力回復') || s.includes('自体活力回复') || s.includes('活力充沛')) return ['energy_single'];
    if (sLower.includes('cooking power-up') || sLower.includes('cooking power up') || s.includes('料理強化') || s.includes('料理擴大') || s.includes('料理扩大')) return ['cooking_pot'];
    if (sLower.includes('tasty chance') || s.includes('料理成功') || s.includes('美味機會') || s.includes('美味机会')) return ['cooking_chance'];
    if (sLower.includes('helper boost') || sLower.includes('extra helpful') || sLower.includes('helper speed') || s.includes('幫手支援') || s.includes('幫手加速') || s.includes('幫手獎勵') || s.includes('幫手') || s.includes('帮手') || s.includes('傳說降臨') || s.includes('传说降临')) return ['helper_boost'];
    if (sLower.includes('dream shard') || s.includes('夢之碎片') || s.includes('梦之碎片') || s.includes('碎片獲取') || s.includes('碎片获取')) return ['dream_shards'];
    if (sLower.includes('ingredient magnet') || sLower.includes('ingredient draw') || sLower.includes('ingredient selection') || sLower.includes('ingr. selection') || sLower.includes('random ingredients') || s.includes('食材獲取') || s.includes('食材精選') || s.includes('食材精选') || s.includes('食材隨機') || s.includes('食材随机')) return ['ingredient'];
    if (sLower.includes('berry burst') || sLower.includes('berry field') || s.includes('樹果遽增') || s.includes('树果遽增') || s.includes('樹果擴增') || s.includes('树果扩增') || s.includes('樹果領域') || s.includes('树果领域')) return ['berry_burst'];

    return [];
  }

  function getSkillSubCategoryInfo(mainSkill, trackId, isEN) {
    const s = String(mainSkill || '').trim();
    const sLower = s.toLowerCase();
    const skillDisplayName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getMainSkillName === 'function' && isEN)
      ? (window.I18N.getMainSkillName(mainSkill) || mainSkill)
      : s;

    let subKey = '';
    let subLabel = '';

    if (trackId === 'energy_single') {
      if (s.includes('活力填充') || s.includes('活力充填') || sLower.includes('charge energy')) {
        subKey = 'self';
        subLabel = isEN ? 'Self' : '自己';
      } else if (s.includes('月光') || sLower.includes('moonlight')) {
        subKey = 'self';
        subLabel = isEN ? 'Self (+Random Ally)' : '自己 (+隨機他人)';
      } else {
        subKey = 'ally';
        subLabel = isEN ? 'Random Ally' : '隨機他人';
      }
    } else if (trackId === 'ingredient') {
      if (s.includes('食材精選') || s.includes('食材精选') || s.includes('超幸運') || s.includes('超幸运') || s.includes('怪力鉗') || s.includes('怪力钳') || sLower.includes('ingredient draw') || sLower.includes('ingr. select') || sLower.includes('super luck') || sLower.includes('hyper cutter')) {
        subKey = 'select';
        subLabel = isEN ? 'Ingredient Draw' : '食材精選';
      } else {
        subKey = 'magnet';
        subLabel = isEN ? 'Ingredient Magnet' : '食材獲取';
      }
    } else if (trackId === 'charge_energy') {
      if (s.includes('隨機') || s.includes('随机') || sLower.includes('random')) {
        subKey = 'random';
        subLabel = isEN ? 'Random' : '隨機';
      } else if (s.includes('能量填充M') || s.includes('能量充填M') || sLower.includes('charge strength m')) {
        subKey = 'fixed_m';
        subLabel = isEN ? 'Fixed M' : '高倍固定';
      } else if (s.includes('蓄力') || sLower.includes('stockpile')) {
        subKey = 'stockpile';
        subLabel = isEN ? 'Stockpile' : '疊加爆發';
      } else if (s.includes('波導彈') || s.includes('波导弹') || sLower.includes('aura sphere')) {
        subKey = 'strength_shards';
        subLabel = isEN ? 'Strength+Shards' : '能量+夢碎';
      } else if (s.includes('精神擊破') || s.includes('精神击破') || sLower.includes('psystrike')) {
        subKey = 'strength_field';
        subLabel = isEN ? 'Strength+Berry Field' : '能量+樹果領域';
      } else if (s.includes('夢魘') || s.includes('梦魇') || sLower.includes('bad dreams') || sLower.includes('nightmare')) {
        subKey = 'nightmare';
        subLabel = isEN ? 'High Strength' : '高倍能量';
      } else {
        subKey = 'fixed_s';
        subLabel = isEN ? 'Fixed S' : '固定';
      }
    } else if (trackId === 'energy_all') {
      if (s.includes('樹果汁') || s.includes('树果汁') || sLower.includes('berry juice')) {
        subKey = 'berry_juice';
        subLabel = isEN ? 'Team+Berry Juice' : '全體+樹果汁';
      } else if (s.includes('新月祈禱') || s.includes('新月祈祷') || sLower.includes('lunar prayer')) {
        subKey = 'lunar_prayer';
        subLabel = isEN ? 'Team+Berry Burst' : '全體+樹果遽增';
      } else {
        subKey = 'team_heal';
        subLabel = isEN ? 'Team Heal' : '全體回復';
      }
    } else if (trackId === 'cooking_pot') {
      if (s.includes('魔法火焰') || sLower.includes('mystical fire')) {
        subKey = 'pot_tasty';
        subLabel = isEN ? 'Pot+Tasty' : '擴鍋+料理成功';
      } else if (s.includes('負電') || s.includes('负电') || sLower.includes('minus')) {
        subKey = 'pot_heal';
        subLabel = isEN ? 'Pot+Random Heal' : '擴鍋+隨機他人';
      } else {
        subKey = 'pot_expand';
        subLabel = isEN ? 'Pot Expand' : '擴鍋';
      }
    } else if (trackId === 'cooking_chance') {
      if (s.includes('魔法火焰') || sLower.includes('mystical fire')) {
        subKey = 'tasty_pot';
        subLabel = isEN ? 'Tasty+Pot' : '大成功+擴鍋';
      } else if (s.includes('健美') || sLower.includes('bulk up')) {
        subKey = 'tasty_magnet';
        subLabel = isEN ? 'Tasty+Ingr. Magnet' : '大成功+食材獲取';
      } else if (s.includes('怪力鉗') || s.includes('怪力钳') || sLower.includes('hyper cutter')) {
        subKey = 'tasty_draw';
        subLabel = isEN ? 'Tasty+Ingr. Draw' : '大成功+食材精選';
      } else if (s.includes('畫皮') || s.includes('画皮') || sLower.includes('disguise')) {
        subKey = 'tasty_burst';
        subLabel = isEN ? '3x Berry Burst' : '大成功3倍樹果';
      } else {
        subKey = 'tasty_chance';
        subLabel = isEN ? 'Tasty Chance' : '大成功機率';
      }
    } else if (trackId === 'helper_boost') {
      if (s.includes('幫手加速') || s.includes('帮手加速') || sLower.includes('helper speed')) {
        subKey = 'team_boost';
        subLabel = isEN ? 'Team Type Boost' : '同屬全隊加速';
      } else if (s.includes('正電') || s.includes('正电') || sLower.includes('plus')) {
        subKey = 'plus_synergy';
        subLabel = isEN ? 'Plus Synergy' : '連動食材獲取';
      } else if (s.includes('蹭蹭臉頰') || s.includes('蹭蹭脸颊') || sLower.includes('nuzzle')) {
        subKey = 'nuzzle_proc';
        subLabel = isEN ? 'Random Heal+Extra Proc' : '隨機他人+額外發動';
      } else if (s.includes('治癒波動') || s.includes('治愈波动') || sLower.includes('heal pulse')) {
        subKey = 'heal_help';
        subLabel = isEN ? 'Random Heal+Instant Help' : '隨機他人+立即幫忙';
      } else {
        subKey = 'single_boost';
        subLabel = isEN ? 'Single Boost' : '單體支援';
      }
    } else if (trackId === 'dream_shards') {
      if (s.includes('隨機') || s.includes('随机') || sLower.includes('random')) {
        subKey = 'random';
        subLabel = isEN ? 'Random' : '隨機';
      } else if (s.includes('波導彈') || s.includes('波导弹') || sLower.includes('aura sphere')) {
        subKey = 'shards_strength';
        subLabel = isEN ? 'Shards+Strength' : '固定夢碎+能量';
      } else if (s.includes('超幸運') || s.includes('超幸运') || sLower.includes('super luck')) {
        subKey = 'draw_crit';
        subLabel = isEN ? 'Ingr. Draw+Crit Shards' : '食材精選+暴擊夢碎';
      } else if (s.includes('禮物') || s.includes('礼物') || sLower.includes('present')) {
        subKey = 'magnet_candy';
        subLabel = isEN ? 'Ingr. Magnet+Candy' : '食材獲取+隨機糖果';
      } else {
        subKey = 'fixed';
        subLabel = isEN ? 'Fixed' : '固定';
      }
    } else if (trackId === 'berry_burst') {
      if (s.includes('畫皮') || s.includes('画皮') || sLower.includes('disguise')) {
        subKey = 'disguise_burst';
        subLabel = isEN ? 'Disguise 3x' : '大成功3倍樹果';
      } else if (s.includes('流星群') || sLower.includes('draco meteor')) {
        subKey = 'dragon_burst';
        subLabel = isEN ? 'Dragon Burst' : '龍屬樹果遽增';
      } else if (s.includes('新月祈禱') || s.includes('新月祈祷') || sLower.includes('lunar prayer')) {
        subKey = 'psychic_burst';
        subLabel = isEN ? 'Psychic Burst' : '超能樹果遽增';
      } else if (s.includes('精神擊破') || s.includes('精神击破') || sLower.includes('psystrike')) {
        subKey = 'psychic_field';
        subLabel = isEN ? 'Psychic Field' : '超能樹果領域';
      } else {
        subKey = 'standard_burst';
        subLabel = isEN ? 'Berry Burst' : '標準樹果遽增';
      }
    }

    const fullLabel = subLabel
      ? (isEN ? \`\${skillDisplayName} (\${subLabel})\` : \`\${skillDisplayName}（\${subLabel}）\`)
      : skillDisplayName;

    return {
      subKey,
      subLabel,
      fullLabel
    };
  }

  function getSkillLadderSpecialtyIcon(specKey, specDisplay, size) {
    const s = parseInt(size, 10) || 16;
    const key = (specKey || 'skill').toLowerCase();
    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (typeof escapeHtml === 'function' ? escapeHtml : (str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')));
    const disp = esc(specDisplay || '');
    let basePath = '';
    if (typeof window !== 'undefined') {
      if (typeof window.__DATA_BASE_PATH__ === 'string') {
        basePath = window.__DATA_BASE_PATH__;
      } else if (window.location && typeof window.location.pathname === 'string' && window.location.pathname.includes('/app/')) {
        basePath = '../';
      }
    }
    return \`<span class="box-spec-tag spec-\${key} specialty-icon-wrap node-specialty-tag specialty-\${key}" title="\${disp}" style="display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;padding:0;line-height:1;vertical-align:middle;"><img src="\${basePath}assets/specialty/\${key}.png" srcset="\${basePath}assets/specialty/\${key}@2x.png 2x" class="specialty-icon spec-\${key}" width="\${s}" height="\${s}" alt="\${disp}" loading="lazy" style="width:\${s}px;height:\${s}px;object-fit:contain;vertical-align:middle;display:inline-block;pointer-events:none;" /></span>\`;
  }
`;

nodeFs.writeFileSync(path.join(WIKI_DIR, 'wiki_skill_ladder_data.js'), dataFileContent, 'utf8');

console.log('Successfully generated modular skill ladder dataset:');
console.log('  - wiki_skill_ladder_data.js:', dataFileContent.split('\n').length, 'lines');
