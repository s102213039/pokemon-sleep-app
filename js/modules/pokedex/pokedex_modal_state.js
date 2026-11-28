/* ═════════════════════════════════════════════════════════════════════════
   圖鑑寶可夢懸浮窗：自訂副技能評測、六維強度評分與食材加成算法展示
   (Pokédex Detail & Appraisal Modal with Real-time Ingredient Breakdown)
   ═════════════════════════════════════════════════════════════════════════ */

const POKEDEX_MODAL_NATURES = [
  { name: '坦率', name_en: 'Hardy', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '孤僻', name_en: 'Lonely', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'speed', debuffType: 'energy' },
  { name: '勇敢', name_en: 'Brave', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'speed', debuffType: 'exp' },
  { name: '固執', name_en: 'Adamant', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'speed', debuffType: 'ingredient' },
  { name: '頑皮', name_en: 'Naughty', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'speed', debuffType: 'skill' },
  { name: '大膽', name_en: 'Bold', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'energy', debuffType: 'speed' },
  { name: '淘氣', name_en: 'Impish', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'energy', debuffType: 'ingredient' },
  { name: '樂天', name_en: 'Lax', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'energy', debuffType: 'skill' },
  { name: '內斂', name_en: 'Modest', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'ingredient', debuffType: 'speed' },
  { name: '慢吞吞', name_en: 'Mild', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'ingredient', debuffType: 'energy' },
  { name: '冷靜', name_en: 'Quiet', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'ingredient', debuffType: 'exp' },
  { name: '馬虎', name_en: 'Rash', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'ingredient', debuffType: 'skill' },
  { name: '溫和', name_en: 'Calm', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'skill', debuffType: 'speed' },
  { name: '溫燥', name_en: 'Gentle', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'skill', debuffType: 'energy' },
  { name: '慎重', name_en: 'Careful', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'skill', debuffType: 'ingredient' },
  { name: '浮躁', name_en: 'Sassy', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'skill', debuffType: 'exp' },
  { name: '膽小', name_en: 'Timid', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'exp', debuffType: 'speed' },
  { name: '爽朗', name_en: 'Jolly', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'exp', debuffType: 'ingredient' },
  { name: '急躁', name_en: 'Hasty', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'exp', debuffType: 'energy' },
  { name: '天真', name_en: 'Naive', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'exp', debuffType: 'skill' },
  { name: '害羞', name_en: 'Bashful', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '認真', name_en: 'Docile', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '勤奮', name_en: 'Serious', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
  { name: '沉著', name_en: 'Quirky', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' }
];

const POKEDEX_MODAL_SUBSKILLS = [
  // 金色技能 (Tier 1 Gold)
  { name: '樹果數量S', name_en: 'Berry Finding S', tier: 'gold', desc: '幫忙時發現的樹果數量增加1個' },
  { name: '幫手獎勵', name_en: 'Helping Bonus', tier: 'gold', desc: '隊伍全員的幫忙時間縮短5%' },
  { name: '睡眠EXP獎勵', name_en: 'Sleep EXP Bonus', tier: 'gold', desc: '睡眠研究獲得的EXP提升14%' },
  { name: '活力回復獎勵', name_en: 'Energy Recovery Bonus', tier: 'gold', desc: '隊伍全員睡眠活力回復量提升14%' },
  { name: '夢之碎片獎勵', name_en: 'Dream Shard Bonus', tier: 'gold', desc: '睡眠研究獲得的夢之碎片增加6%' },
  { name: '研究EXP獎勵', name_en: 'Research EXP Bonus', tier: 'gold', desc: '睡眠研究獲得的研究EXP增加6%' },
  { name: '技能等級提升M', name_en: 'Skill Level Up M', tier: 'gold', desc: '主技能等級提升2級' },
  // 藍色技能 (Tier 2 Silver/Blue)
  { name: '幫忙速度M', name_en: 'Helping Speed M', tier: 'blue', desc: '幫忙時間縮短14%' },
  { name: '食材機率提升M', name_en: 'Ingredient Finder M', tier: 'blue', desc: '發現食材的機率大幅提升 (+36%)' },
  { name: '技能機率提升M', name_en: 'Skill Trigger M', tier: 'blue', desc: '發動主技能的機率大幅提升' },
  { name: '技能等級提升S', name_en: 'Skill Level Up S', tier: 'blue', desc: '主技能等級提升1級' },
  { name: '持有上限提升L', name_en: 'Inventory Up L', tier: 'blue', desc: '最大持有數量增加18' },
  { name: '持有上限提升M', name_en: 'Inventory Up M', tier: 'blue', desc: '最大持有數量增加12' },
  // 白色技能 (Tier 3 White)
  { name: '幫忙速度S', name_en: 'Helping Speed S', tier: 'white', desc: '幫忙時間縮短7%' },
  { name: '食材機率提升S', name_en: 'Ingredient Finder S', tier: 'white', desc: '發現食材的機率小幅提升 (+18%)' },
  { name: '技能機率提升S', name_en: 'Skill Trigger S', tier: 'white', desc: '發動主技能的機率小幅提升' },
  { name: '持有上限提升S', name_en: 'Inventory Up S', tier: 'white', desc: '最大持有數量增加6' },
  { name: '活力回復提升S', name_en: 'Energy Recovery Up S', tier: 'white', desc: '自身的活力回復量提升' }
];

let pokedexModalState = {
  pkmId: null,
  pkm: null,
  level: 30,
  nature: '坦率',
  subskills: ['', '', '', '', ''],
  skillLevel: 1,
  ribbon: 0,
  ingSlots: [0, 0, 0] // 0, 1, 2 indices in pkm.ingredients
};
let pokedexActiveSubskillSlot = 1;
let pokedexSubskillPaletteExpanded = false;
