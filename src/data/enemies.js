// Inimigos. `stats` é a ficha no `lv` de referência; encontros escalam a partir daí.

export const ENEMIES = {
  // ---------------- Treino ----------------
  dummy: {
    id: 'dummy', name: 'Boneco de Treino', element: 'none', lv: 1, ai: 'passive',
    stats: { hp: 90, ck: 0, atk: 8, nin: 0, def: 6, res: 4, spd: 4, luck: 0 },
    jutsu: ['attack'], exp: 14, ryo: 0,
    art: { type: 'dummy', outfit: '#8a6d4a', outfit2: '#5b4630' },
  },
  academyRival: {
    id: 'academyRival', name: 'Aluno Veterano', element: 'none', lv: 2, ai: 'basic',
    stats: { hp: 105, ck: 20, atk: 15, nin: 10, def: 10, res: 8, spd: 12, luck: 5 },
    jutsu: ['attack', 'attack', 'ironFistRush'], exp: 26, ryo: 40,
    art: { type: 'human', skin: '#e8bd96', hair: '#4a3b2c', hairStyle: 'buzz', outfit: '#5f6d7a', outfit2: '#2f3740', eye: '#4a4a58', band: true },
    drops: [{ id: 'ration', chance: .4 }],
  },

  // ---------------- Comuns ----------------
  banditThug: {
    id: 'banditThug', name: 'Bandido', element: 'none', lv: 3, ai: 'basic',
    stats: { hp: 118, ck: 10, atk: 18, nin: 6, def: 11, res: 6, spd: 10, luck: 4 },
    jutsu: ['attack', 'attack', 'banditSlash'], exp: 32, ryo: 55,
    art: { type: 'human', skin: '#d9a273', hair: '#3a2f26', hairStyle: 'messy', outfit: '#6b4a3a', outfit2: '#3a2b22', eye: '#6b4a2a', scarf: '#8a3a2a' },
    drops: [{ id: 'kunai', chance: .35 }, { id: 'ration', chance: .25 }],
  },
  banditArcher: {
    id: 'banditArcher', name: 'Bandido Arqueiro', element: 'none', lv: 4, ai: 'ranged',
    stats: { hp: 96, ck: 24, atk: 20, nin: 10, def: 8, res: 8, spd: 16, luck: 8 },
    jutsu: ['attack', 'poisonNeedle', 'banditSlash'], exp: 38, ryo: 70,
    art: { type: 'human', skin: '#c99a70', hair: '#5a4030', hairStyle: 'ponytail', outfit: '#4a5a3a', outfit2: '#2c3524', eye: '#7a5a2a' },
    drops: [{ id: 'antidote', chance: .35 }, { id: 'shuriken', chance: .3 }],
  },
  forestWolf: {
    id: 'forestWolf', name: 'Lobo da Floresta', element: 'none', lv: 4, ai: 'aggressive',
    stats: { hp: 104, ck: 14, atk: 23, nin: 4, def: 9, res: 5, spd: 21, luck: 6 },
    jutsu: ['attack', 'attack', 'howl'], exp: 36, ryo: 25,
    art: { type: 'wolf', fur: '#6b6257', fur2: '#3d382f', eye: '#e8c34a' },
    drops: [{ id: 'ration', chance: .3 }],
  },
  roguePupil: {
    id: 'roguePupil', name: 'Ninja Desertor', element: 'fire', lv: 6, ai: 'caster',
    stats: { hp: 128, ck: 52, atk: 17, nin: 22, def: 12, res: 14, spd: 15, luck: 7 },
    jutsu: ['attack', 'emberShot', 'emberShot', 'greatFireball'], exp: 56, ryo: 110,
    art: { type: 'human', skin: '#e2b58c', hair: '#2f2a35', hairStyle: 'swept', outfit: '#3a2f4a', outfit2: '#7a2a2a', eye: '#c04a3a', band: true, bandSlash: true },
    drops: [{ id: 'soldierPill', chance: .3 }, { id: 'steelKunai', chance: .08 }],
  },
  swampPuppet: {
    id: 'swampPuppet', name: 'Marionete de Combate', element: 'none', lv: 7, ai: 'basic',
    stats: { hp: 150, ck: 30, atk: 21, nin: 16, def: 20, res: 10, spd: 11, luck: 2 },
    jutsu: ['attack', 'puppetStrings', 'poisonNeedle'], exp: 64, ryo: 130,
    art: { type: 'puppet', wood: '#8a6a44', wood2: '#4f3c26', eye: '#d44a2a' },
    drops: [{ id: 'antidote', chance: .5 }, { id: 'explosiveTag', chance: .12 }],
    // Marionete de madeira: veneno não faz efeito nela.
    immuneTo: ['poison'],
  },
  soundGenin: {
    id: 'soundGenin', name: 'Genin do Som', element: 'none', lv: 9, ai: 'caster',
    stats: { hp: 142, ck: 60, atk: 20, nin: 25, def: 14, res: 17, spd: 20, luck: 9 },
    jutsu: ['attack', 'soundWave', 'soundWave', 'poisonNeedle'], exp: 82, ryo: 160,
    art: { type: 'human', skin: '#d9b48c', hair: '#7a6a5a', hairStyle: 'spiky', outfit: '#4a4256', outfit2: '#6b6a3a', eye: '#9a8a4a', band: true, bandSlash: true },
    drops: [{ id: 'soldierPill', chance: .4 }, { id: 'smokeBomb', chance: .25 }],
  },
  mistAssassin: {
    id: 'mistAssassin', name: 'Assassino da Névoa', element: 'water', lv: 12, ai: 'aggressive',
    stats: { hp: 166, ck: 66, atk: 29, nin: 24, def: 17, res: 18, spd: 27, luck: 12 },
    jutsu: ['attack', 'mercStrike', 'hidingMist', 'waterBullet'], exp: 118, ryo: 240,
    art: { type: 'human', skin: '#cbb49a', hair: '#3a4a5a', hairStyle: 'swept', outfit: '#2a3a4a', outfit2: '#5a6a7a', eye: '#7fd2f0', mask: true, band: true, bandSlash: true },
    drops: [{ id: 'bigRation', chance: .35 }, { id: 'mistCloak', chance: .07 }],
  },
  shadowAcolyte: {
    id: 'shadowAcolyte', name: 'Acólito das Sombras', element: 'none', lv: 15, ai: 'caster',
    stats: { hp: 178, ck: 88, atk: 24, nin: 32, def: 19, res: 24, spd: 22, luck: 10 },
    jutsu: ['attack', 'shadowLance', 'drainSeal', 'shadowBind'], exp: 152, ryo: 300,
    art: { type: 'human', skin: '#b9a494', hair: '#1f1a2a', hairStyle: 'long', outfit: '#241d2b', outfit2: '#6a4a9c', eye: '#b884e8', hood: true },
    drops: [{ id: 'reviveScroll', chance: .2 }, { id: 'soldierPill', chance: .5 }],
  },
  shadowBrute: {
    id: 'shadowBrute', name: 'Bruto das Sombras', element: 'earth', lv: 16, ai: 'aggressive',
    stats: { hp: 260, ck: 40, atk: 34, nin: 14, def: 28, res: 16, spd: 12, luck: 6 },
    jutsu: ['attack', 'mercStrike', 'rockFist', 'earthPrison'], exp: 168, ryo: 320,
    art: { type: 'human', skin: '#a88a6a', hair: '#2a2a2a', hairStyle: 'buzz', outfit: '#3a3140', outfit2: '#6a4a9c', eye: '#c47a4a', scar: true },
    drops: [{ id: 'stonePlate', chance: .08 }, { id: 'bigRation', chance: .4 }],
  },

  // ---------------- Chefes ----------------
  karasu: {
    id: 'karasu', name: 'Karasu, o Corvo', title: 'Chefe dos Salteadores',
    element: 'wind', lv: 8, ai: 'boss', boss: true,
    stats: { hp: 980, ck: 70, atk: 27, nin: 22, def: 19, res: 16, spd: 22, luck: 10 },
    jutsu: ['attack', 'mercStrike', 'cuttingGale', 'howl', 'poisonNeedle'], exp: 260, ryo: 600,
    art: { type: 'human', skin: '#c9a07a', hair: '#1f1a1a', hairStyle: 'long', outfit: '#2a2028', outfit2: '#7a2a3a', eye: '#d4462f', mask: true, cloak: '#1a1520' },
    drops: [{ id: 'steelKunai', chance: 1 }],
    intro: 'Um corvo pousa no ombro dele. Nenhum dos dois pisca.',
  },
  ryujin: {
    id: 'ryujin', name: 'Ryūjin dos Pântanos', title: 'Mercenário Rank-B',
    element: 'water', lv: 13, ai: 'boss', boss: true,
    stats: { hp: 1450, ck: 110, atk: 33, nin: 30, def: 24, res: 22, spd: 20, luck: 11 },
    jutsu: ['attack', 'mercStrike', 'waterBullet', 'venomFog', 'regenerate', 'hidingMist'], exp: 460, ryo: 1100,
    art: { type: 'human', skin: '#a8b49a', hair: '#2a3a2a', hairStyle: 'messy', outfit: '#3a4a3a', outfit2: '#6a7a4a', eye: '#8ae04a', mask: true, scar: true },
    drops: [{ id: 'chakraBeads', chance: 1 }],
    intro: 'A água do pântano se ergue com ele. Cheira a ferro velho e a coisa morta.',
  },
  jinRival: {
    id: 'jinRival', name: 'Jin', title: 'Genin de Ishigakure',
    element: 'earth', lv: 11, ai: 'boss', boss: true,
    stats: { hp: 1080, ck: 50, atk: 30, nin: 15, def: 30, res: 18, spd: 11, luck: 7 },
    jutsu: ['attack', 'rockFist', 'stoneWall', 'ironBodyStance', 'earthPrison'], exp: 320, ryo: 500,
    art: { type: 'human', skin: '#d9a273', hair: '#5a4632', hairStyle: 'buzz', outfit: '#6b5a44', outfit2: '#3a3128', eye: '#8a6a3a', band: true, scar: true },
    intro: 'Ele planta os pés. Não vai sair do lugar — e não pretende deixar você passar.',
    spareable: true,
  },
  kagemasaP1: {
    id: 'kagemasaP1', name: 'Yoru Kagemasa', title: 'Ex-ANBU',
    element: 'none', lv: 18, ai: 'boss', boss: true,
    stats: { hp: 1780, ck: 130, atk: 34, nin: 38, def: 26, res: 28, spd: 26, luck: 13 },
    jutsu: ['attack', 'shadowLance', 'shadowBind', 'drainSeal', 'eclipseRoar'], exp: 700, ryo: 1600,
    art: { type: 'human', skin: '#c4b0a0', hair: '#201a2c', hairStyle: 'long', outfit: '#1c1726', outfit2: '#6a4a9c', eye: '#c79bff', anbuMask: true, cloak: '#120e1a' },
    intro: 'A máscara não tem expressão. A voz atrás dela tem — e é pior.',
  },
  kagemasaP2: {
    id: 'kagemasaP2', name: 'Kagemasa Desperto', title: 'O Selo Aberto',
    element: 'none', lv: 22, ai: 'boss', boss: true, actions: 3,
    stats: { hp: 2900, ck: 200, atk: 44, nin: 50, def: 32, res: 34, spd: 32, luck: 16 },
    jutsu: ['attack', 'shadowLance', 'eclipseRoar', 'drainSeal', 'shadowBind', 'regenerate'], exp: 1400, ryo: 3000,
    art: { type: 'human', skin: '#9a8ea8', hair: '#120e1a', hairStyle: 'long', outfit: '#0f0c16', outfit2: '#b884e8', eye: '#ff4a7a', cloak: '#0a0810', aura: '#8a4ae8' },
    intro: 'O selo se abre como uma boca. O que sai não é mais só um homem.',
  },
};

// Kakashi aparece como "inimigo" no teste dos sinos — luta contida, sem morte.
ENEMIES.kakashiSpar = {
  id: 'kakashiSpar', name: 'Kakashi', title: 'Sensei (avaliando)',
  // Ele está avaliando, não tentando vencer: uma ação por rodada.
  element: 'lightning', lv: 10, ai: 'boss', boss: true, actions: 1,
  stats: { hp: 1150, ck: 120, atk: 26, nin: 28, def: 26, res: 26, spd: 30, luck: 14 },
  jutsu: ['attack', 'attack', 'earthHeadhunter', 'lightningHound', 'copyStance'],
  exp: 200, ryo: 0,
  art: { type: 'human', skin: '#f2d0b0', hair: '#c9cdd6', hairStyle: 'swept', outfit: '#2b3a67', outfit2: '#4b7a4b', eye: '#4a4a58', mask: true, band: true, bandTilt: true },
  intro: 'Ele guarda o livro no bolso. Isso, de algum jeito, é mais assustador do que sacar uma arma.',
};

export function enemyDef(id) {
  return ENEMIES[id];
}
