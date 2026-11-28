// 1. 樹果遽增型 (Berry Burst Specialists): 主技能為樹果遽增/畫皮/流星群，天然以產果為核心
function isBerryBurstSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('樹果遽增') || skill.includes('Berry Burst') || skill.includes('畫皮') || skill.includes('流星群')) return true;
  const burstNames = ['木守宮', '森林蜥蜴', '蜥蜴王', '小火焰猴', '猛火猴', '烈焰猴', '毛頭小鷹', '勇士雄鷹', '謎擬Q', '拉帝歐斯',
                      'Treecko', 'Grovyle', 'Sceptile', 'Chimchar', 'Monferno', 'Infernape', 'Rufflet', 'Braviary', 'Mimikyu', 'Latios'];
  return burstNames.some(b => name.includes(b));
}

function isBfsSkillSpecialist(pkm) {
  return isBerryBurstSkillSpecialist(pkm);
}

function isHealerSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('活力全體療癒') || skill.includes('Energy for Everyone') || skill.includes('新月祈禱') || skill.includes('樹果汁') || skill.includes('治癒波動') || skill.includes('蹭蹭臉頰') || skill.includes('活力療癒') || skill.includes('活力氣場') || skill.includes('Energizing Cheer')) return true;
  const healerNames = ['沙奈朵', '仙子伊布', '胖可丁', '巴布土撥', '拉魯拉絲', '奇鲁莉安', '寶寶丁', '胖丁', '布撥', '布土撥', '克雷色利亞', '壺壺', '拉帝亞斯', '托戈德瑪爾', '帕奇利茲',
                       'Gardevoir', 'Sylveon', 'Wigglytuff', 'Pawmot', 'Ralts', 'Kirlia', 'Igglybuff', 'Jigglypuff', 'Pawmi', 'Pawmo', 'Cresselia', 'Shuckle', 'Latias', 'Togedemaru', 'Pachirisu'];
  return healerNames.some(h => name.includes(h));
}

function isHelperBoostSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('幫手加速') || skill.includes('幫手支援') || skill.includes('Helper Boost') || skill.includes('Extra Helpful')) return true;
  const beastNames = ['雷公', '炎帝', '水君', '風速狗', '卡蒂狗', '雷伊布', '艾路雷朵',
                      'Raikou', 'Entei', 'Suicune', 'Arcanine', 'Growlithe', 'Jolteon', 'Gallade'];
  return beastNames.some(b => name.includes(b));
}

function isChargeStrengthSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('能量填充') || skill.includes('Charge Strength') || skill.includes('蓄力') || skill.includes('夢魘')) return true;
  const chargeNames = ['電龍', '咩利羊', '茸茸羊', '太陽伊布', '可達鴨', '哥達鴨', '樹才怪', '盆才怪', '隨風球', '飄飄球', '音波龍', '嗡蝠', '達克萊伊',
                       'Ampharos', 'Mareep', 'Flaaffy', 'Espeon', 'Psyduck', 'Golduck', 'Sudowoodo', 'Bonsly', 'Drifblim', 'Drifloon', 'Noivern', 'Noibat', 'Darkrai'];
  return chargeNames.some(c => name.includes(c));
}

function isPotExpanderSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('料理強化') || skill.includes('Cooking Power') || skill.includes('負電') || skill.includes('魔法火焰') || skill.includes('Mystical Fire')) return true;
  const potNames = ['小磁怪', '三合一磁怪', '自爆磁怪', '火伊布', '冰伊布', '負電拍拍', '顫弦蠑螈', '夢妖魔',
                    'Magnemite', 'Magneton', 'Magnezone', 'Flareon', 'Glaceon', 'Minun', 'Toxtricity', 'Mismagius'];
  return potNames.some(p => name.includes(p));
}

function isExtraTastySkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('料理成功') || skill.includes('美味大成功') || skill.includes('Extra Tasty') || skill.includes('Tasty Chance') || skill.includes('魔法火焰') || skill.includes('Mystical Fire') || skill.includes('健美') || skill.includes('Bulk Up')) return true;
  const tastyNames = ['咚咚鼠', '海豹球（佳節）', '古月鳥', '夢妖魔', '赫拉克羅斯', 'Dedenne', 'Spheal (Holiday)', 'Cramorant', 'Mismagius', 'Heracross'];
  return tastyNames.some(t => name.includes(t));
}

function isDreamShardSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('夢之碎片') || skill.includes('Dream Shard') || skill.includes('波導彈')) return true;
  const shardNames = ['利歐路', '路卡利歐', '喵喵', '貓老大', '勾魂眼', '溶食獸', '吞食獸',
                      'Riolu', 'Lucario', 'Meowth', 'Persian', 'Sableye', 'Gulpin', 'Swalot'];
  return shardNames.some(s => name.includes(s));
}

function isIngredientSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('食材獲取') || skill.includes('食材精選') || skill.includes('正電') || skill.includes('怪力鉗') || skill.includes('超幸運') || skill.includes('健美') || skill.includes('禮物')) return true;
  const ingNames = ['水伊布', '伊布', '毒電嬰', '正電拍拍', '穿山鼠', '穿山王', '石居蟹', '岩殿居蟹', '摔角鷹人', '赫拉克羅斯', '黑暗鴉', '烏鴉頭頭',
                    'Vaporeon', 'Eevee', 'Toxel', 'Plusle', 'Sandshrew', 'Sandslash', 'Dwebble', 'Crustle', 'Hawlucha', 'Heracross', 'Murkrow', 'Honchkrow'];
  return ingNames.some(i => name.includes(i));
}

function isMetronomeSkillSpecialist(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('揮指') || skill.includes('十項全能') || skill.includes('Metronome')) return true;
  const metronomeNames = ['波克比', '波克基古', '波克基斯', '夢幻', '皮寶寶', 'Togepi', 'Togetic', 'Togekiss', 'Mew', 'Cleffa'];
  return metronomeNames.some(m => name.includes(m));
}

function isLegendaryPokemon(pkm) {
  if (!pkm) return false;
  const skill = pkm.main_skill || '';
  const name = pkm.name_cn || pkm.name_en || '';
  if (skill.includes('精神擊破') || skill.includes('十項全能') || skill.includes('新月祈禱') || skill.includes('流星群') || skill.includes('夢魘')) return true;
  const legendaryNames = ['雷公', '炎帝', '水君', '超夢', '夢幻', '克雷色利亞', '達克萊伊', '拉帝歐斯', '拉帝亞斯',
                          'Raikou', 'Entei', 'Suicune', 'Mewtwo', 'Mew', 'Cresselia', 'Darkrai', 'Latios', 'Latias'];
  return legendaryNames.some(l => name.includes(l));
}

function isSlowpokeFamily(pkm) {
  if (!pkm) return false;
  const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
  return ['呆呆獸', '呆殼獸', '呆呆王', 'Slowpoke', 'Slowbro', 'Slowking'].some(s => name.includes(s));
}

function isSlakingFamily(pkm) {
  if (!pkm) return false;
  const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
  return ['請假王', '過動猿', '懶人獺', 'Slaking', 'Vigoroth', 'Slakoth'].some(s => name.includes(s));
}

function formatPokemonEvoReq(evoReq) {
  if (!evoReq || typeof evoReq !== 'string') return '';
  const twText = evoReq.trim().replace(/，EXP\s*需求\s*([\d.]+)\s*倍/g, '').replace(/Lv(\d+)/g, 'Lv.$1');
  const itemMap = [
    ['雷之石', 'Thunder Stone'], ['火之石', 'Fire Stone'], ['水之石', 'Water Stone'],
    ['葉之石', 'Leaf Stone'], ['月之石', 'Moon Stone'], ['太陽之石', 'Sun Stone'], ['日之石', 'Sun Stone'],
    ['冰之石', 'Ice Stone'], ['光之石', 'Shiny Stone'], ['暗之石', 'Dusk Stone'],
    ['覺醒之石', 'Dawn Stone'], ['渾圓之石', 'Oval Stone'], ['聯繫繩', 'Linking Cord'],
    ['金屬膜', 'Metal Coat'], ['王者之證', "King's Rock"], ['銳利之爪', 'Razor Claw']
  ];
  let enText = evoReq.trim();
  itemMap.forEach(([zh, en]) => { enText = enText.split(zh).join(en); });
  enText = enText.replace(/睡\s*(\d+)\s*小時/g, 'Sleep $1h')
                 .replace(/(\d+)\s*糖/g, '$1 Candies')
                 .replace(/，EXP\s*需求\s*([\d.]+)\s*倍/g, '')
                 .replace(/雄性/g, 'Male')
                 .replace(/指定性格/g, 'Nature')
                 .replace(/Lv(\d+)/g, 'Lv.$1');
  return (typeof window !== 'undefined' && window.I18N && typeof window.I18N.pick === 'function')
    ? window.I18N.pick({ 'zh-TW': twText, 'en-US': enText })
    : twText;
}

function getPokemonEvolutionFamily(pkmOrId, allList) {
  const all = Array.isArray(allList) && allList.length > 0
    ? allList
    : ((typeof PokemonApp !== 'undefined' && Array.isArray(PokemonApp.allPokemons) && PokemonApp.allPokemons.length > 0)
      ? PokemonApp.allPokemons
      : ((typeof window !== 'undefined' && Array.isArray(window.allPokemons)) ? window.allPokemons : []));
  if (!pkmOrId) return [];
  const pkm = (typeof pkmOrId === 'object' && pkmOrId.id)
    ? pkmOrId
    : (all.find(p => p.name_cn === pkmOrId || p.name_en === pkmOrId) ||
       all.find(p => String(p.id) === String(pkmOrId) || p.formatted_no === pkmOrId));
  if (!pkm) return [];
  if (!all || all.length === 0) return [[pkm]];

  const byCn = (cn) => all.find(x => x && x.name_cn === cn);
  const byId = (id) => all.find(x => x && String(x.id) === String(id));
  const idStr = String(pkm.id || '');
  const cn = pkm.name_cn || '';

  if (['9001', '9002', '9004', '9005', '9006', '9007'].includes(idStr)) return [[pkm]];
  if (['37', '38'].includes(idStr)) return [[byId('37')], [byId('38')]].filter(s => s[0]);
  if (['7006', '7007'].includes(idStr)) return [[byId('7006')], [byId('7007')]].filter(s => s[0]);
  if (['58', '59'].includes(idStr)) return [[byId('58')], [byId('59')]].filter(s => s[0]);
  if (['7013', '7014'].includes(idStr)) return [[byId('7013')], [byId('7014')]].filter(s => s[0]);
  if (['194', '195'].includes(idStr)) return [[byId('194')], [byId('195')]].filter(s => s[0]);
  if (['7054', '980'].includes(idStr)) {
    const s1 = byId('7054');
    const s2Raw = byId('980');
    const s2 = s2Raw ? Object.assign({}, s2Raw, { evo_req: s2Raw.evo_req || 'Lv.15 + 40 糖' }) : null;
    return [s1 ? [s1] : [], s2 ? [s2] : []].filter(s => s.length > 0);
  }
  if (['133', '134', '135', '136', '196', '197', '470', '471', '700'].includes(idStr)) {
    const s1 = byId('133');
    const s2 = ['134', '135', '136', '196', '197', '470', '471', '700'].map(byId).filter(Boolean);
    return [s1 ? [s1] : [], s2].filter(s => s.length > 0);
  }
  if (['79', '80', '199'].includes(idStr)) {
    const s1 = byId('79');
    const s2 = ['80', '199'].map(byId).filter(Boolean);
    return [s1 ? [s1] : [], s2].filter(s => s.length > 0);
  }
  if (['280', '281', '282', '475'].includes(idStr)) {
    const s1 = byId('280');
    const s2 = byId('281');
    const s3 = ['282', '475'].map(byId).filter(Boolean);
    return [s1 ? [s1] : [], s2 ? [s2] : [], s3].filter(s => s.length > 0);
  }
  if (['848', '849', '8001'].includes(idStr)) {
    const s1 = byId('848');
    const s2 = ['849', '8001'].map(byId).filter(Boolean);
    return [s1 ? [s1] : [], s2].filter(s => s.length > 0);
  }
  if (cn.startsWith('南瓜精') || cn.startsWith('南瓜怪人')) {
    const m = cn.match(/\((.+?)\)/);
    const suffix = m ? ' (' + m[1] + ')' : '';
    const s1 = byCn('南瓜精' + suffix);
    const s2 = byCn('南瓜怪人' + suffix);
    return (s1 && s2) ? [[s1], [s2]] : [[pkm]];
  }

  const clean = all.filter(x => x && !['9001', '9002', '9004', '9005', '9006', '9007'].includes(String(x.id)));
  const idx = clean.findIndex(x => x.name_cn === pkm.name_cn && String(x.id) === idStr);
  if (idx === -1) return [[pkm]];
  if (!pkm.evo_req && pkm.is_final === '〇') return [[pkm]];

  let start = idx;
  while (start > 0 && clean[start].evo_req) start--;
  const stages = [[clean[start]]];
  let cur = start + 1;
  while (cur < clean.length && clean[cur].evo_req) {
    stages.push([clean[cur]]);
    if (clean[cur].is_final === '〇') break;
    cur++;
  }
  return stages;
}

function renderPokedexEvolutionTreeHTML(pkm) {
  if (!pkm) return '';
  const tr = (k, params) => (typeof window !== 'undefined' && window.I18N && typeof window.I18N.t === 'function') ? window.I18N.t(k, params) : k;
  const stages = getPokemonEvolutionFamily(pkm);
  if (!stages || stages.length === 0) return '';

  const totalMembers = stages.reduce((acc, s) => acc + s.length, 0);
  const hasBranch = stages.some(s => s.length > 1);
  let stageBadgeText = '';
  if (stages.length === 1 && totalMembers === 1) {
    stageBadgeText = tr('pokedex.evo_single_stage');
  } else if (hasBranch) {
    stageBadgeText = tr('dex.ui_evo_branch_stage', { count: stages.length });
  } else {
    stageBadgeText = tr('dex.ui_evo_chain_stage', { count: stages.length });
  }

  const stagesHtml = stages.map((stageNodes, sIdx) => {
    const nodesHtml = stageNodes.map(node => {
      const isCurrent = (node.name_cn && pkm.name_cn)
        ? (node.name_cn === pkm.name_cn && String(node.id) === String(pkm.id))
        : (String(node.id) === String(pkm.id));
      const nodeName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getPokemonName === 'function')
        ? window.I18N.getPokemonName(node)
        : (node.name_cn || node.name_en || '');
      const rawIcon = (typeof getIconUrl === 'function') ? getIconUrl(node) : (node.icon_url || node.icon || '');
      const iconSrc = (typeof window !== 'undefined' && typeof window.mapExternalToLocalAsset === 'function')
        ? (window.mapExternalToLocalAsset(rawIcon) || rawIcon)
        : rawIcon;
      const reqStr = sIdx > 0 ? formatPokemonEvoReq(node.evo_req) : '';
      const targetKey = (String(node.id) === '710' || String(node.id) === '711') ? (node.name_cn || node.id) : (node.id || node.name_cn);
      const safeKey = String(targetKey).replace(/'/g, "\\'");
      const clickAttr = isCurrent ? '' : `onclick="window.PokemonApp.openPokemonDetailModal('${safeKey}')"`;
      const tipText = isCurrent
        ? tr('dex.ui_evo_current_tip', { name: nodeName })
        : tr('dex.ui_evo_switch_tip', { name: nodeName });

      return `
        <button type="button" class="pokedex-evo-node-btn ${isCurrent ? 'is-current' : ''}" data-evo-pkm-id="${escapeHtml(String(node.id || ''))}" data-evo-pkm-name="${escapeHtml(node.name_cn || '')}" ${clickAttr} title="${escapeHtml(tipText)}">
          ${reqStr ? `<span class="pokedex-evo-req-pill">${escapeHtml(reqStr)}</span>` : ''}
          <div class="pokedex-evo-node-main">
            ${iconSrc ? `<img src="${iconSrc}" class="pokedex-evo-node-icon" width="30" height="30" alt="${escapeHtml(nodeName)}" loading="lazy" decoding="async" onerror="handlePokemonIconError(this)">` : ''}
            <div class="pokedex-evo-node-meta">
              <span class="pokedex-evo-node-no">#${escapeHtml(String(node.formatted_no || node.id || ''))}</span>
              <span class="pokedex-evo-node-name font-bold">${escapeHtml(nodeName)}</span>
            </div>
          </div>
        </button>
      `;
    }).join('');

    const arrowHtml = sIdx > 0
      ? `<div class="pokedex-evo-stage-arrow" aria-hidden="true">-&gt;</div>`
      : '';

    return `
      ${arrowHtml}
      <div class="pokedex-evo-stage-col ${stageNodes.length > 1 ? 'is-branch-col' : ''}" data-stage-idx="${sIdx + 1}">
        ${nodesHtml}
      </div>
    `;
  }).join('');

  return `
    <div class="pokedex-evo-tree-section" id="pokedex-evo-tree-section">
      <div class="pokedex-evo-tree-header">
        <span class="box-form-label" style="margin-bottom:0;">${tr('pokedex.evo_family_title')}</span>
        <span class="pokedex-evo-stage-badge">${escapeHtml(stageBadgeText)}</span>
      </div>
      <div class="pokedex-evo-tree-track ${hasBranch ? 'has-branch' : ''}">
        ${stagesHtml}
      </div>
    </div>
  `;
}

if (typeof window !== 'undefined') {
  window.getPokemonEvolutionFamily = getPokemonEvolutionFamily;
  window.formatPokemonEvoReq = formatPokemonEvoReq;
  window.renderPokedexEvolutionTreeHTML = renderPokedexEvolutionTreeHTML;
}
