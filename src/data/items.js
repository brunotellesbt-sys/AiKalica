// Ferramentas ninja (consumíveis) e equipamentos.

export const ITEMS = {
  // ---------------- Consumíveis de batalha ----------------
  kunai: {
    id: 'kunai', name: 'Kunai', icon: '🗡️', kind: 'tool', price: 30,
    battle: true, field: false, target: 'foe',
    desc: 'Arremesso simples. Dano fixo, nunca erra.',
    effect: { damage: 45, fixed: true },
  },
  shuriken: {
    id: 'shuriken', name: 'Shuriken (x3)', icon: '✴️', kind: 'tool', price: 45,
    battle: true, field: false, target: 'allFoes',
    desc: 'Leque de estrelas que atinge todos os inimigos.',
    effect: { damage: 30, fixed: true },
  },
  explosiveTag: {
    id: 'explosiveTag', name: 'Selo Explosivo', icon: '💥', kind: 'tool', price: 120,
    battle: true, field: false, target: 'allFoes',
    desc: 'Papel-bomba. Dano pesado em área e reduz a defesa.',
    effect: { damage: 85, fixed: true, apply: [{ status: 'defdn', chance: .7, turns: 3 }] },
  },
  smokeBomb: {
    id: 'smokeBomb', name: 'Bomba de Fumaça', icon: '💨', kind: 'tool', price: 60,
    battle: true, field: false, target: 'allFoes',
    desc: 'Cega os inimigos e garante fuga de batalhas comuns.',
    effect: { apply: [{ status: 'blind', chance: 1, turns: 3 }], guaranteeFlee: true },
  },
  makibishi: {
    id: 'makibishi', name: 'Makibishi', icon: '🔻', kind: 'tool', price: 55,
    battle: true, field: false, target: 'allFoes',
    desc: 'Espinhos no chão: imobilizam quem tentar avançar.',
    effect: { damage: 18, fixed: true, apply: [{ status: 'bind', chance: .5, turns: 2 }] },
  },

  // ---------------- Restauradores ----------------
  ration: {
    id: 'ration', name: 'Ração Militar', icon: '🍙', kind: 'consumable', price: 50,
    battle: true, field: true, target: 'ally',
    desc: 'Recupera 90 de HP de um aliado.',
    effect: { healHp: 90 },
  },
  bigRation: {
    id: 'bigRation', name: 'Bentô Completo', icon: '🍱', kind: 'consumable', price: 140,
    battle: true, field: true, target: 'ally',
    desc: 'Recupera 260 de HP de um aliado.',
    effect: { healHp: 260 },
  },
  soldierPill: {
    id: 'soldierPill', name: 'Pílula do Soldado', icon: '💊', kind: 'consumable', price: 90,
    battle: true, field: true, target: 'ally',
    desc: 'Recupera 60 de chakra.',
    effect: { healCk: 60 },
  },
  antidote: {
    id: 'antidote', name: 'Antídoto', icon: '🧪', kind: 'consumable', price: 40,
    battle: true, field: true, target: 'ally',
    desc: 'Remove veneno, queimadura e paralisia.',
    effect: { cure: ['poison', 'burn', 'para'] },
  },
  reviveScroll: {
    id: 'reviveScroll', name: 'Pergaminho de Reanimação', icon: '📜', kind: 'consumable', price: 260,
    battle: true, field: true, target: 'downAlly',
    desc: 'Traz um aliado caído de volta com 60% do HP.',
    effect: { revive: .6 },
  },
  teamFeast: {
    id: 'teamFeast', name: 'Panela do Ichiraku', icon: '🍜', kind: 'consumable', price: 320,
    battle: true, field: true, target: 'allAllies',
    desc: 'Cura 180 de HP e 40 de chakra de todo o time. Vale cada ryo.',
    effect: { healHp: 180, healCk: 40 },
  },

  // ---------------- Equipamentos: arma ----------------
  trainingKunai: {
    id: 'trainingKunai', name: 'Kunai de Treino', icon: '🔪', kind: 'equip', slot: 'weapon', price: 80,
    desc: 'Sem fio, mas ensina a mira.', stats: { atk: 3 },
  },
  steelKunai: {
    id: 'steelKunai', name: 'Kunai de Aço Temperado', icon: '⚔️', kind: 'equip', slot: 'weapon', price: 260,
    desc: 'Equilíbrio perfeito na mão.', stats: { atk: 8, spd: 2 },
  },
  chakraBlade: {
    id: 'chakraBlade', name: 'Lâmina Condutora', icon: '🗡️', kind: 'equip', slot: 'weapon', price: 620,
    desc: 'Conduz chakra elemental pela lâmina.', stats: { atk: 12, nin: 8 },
  },
  sealedFan: {
    id: 'sealedFan', name: 'Leque Selado', icon: '🪭', kind: 'equip', slot: 'weapon', price: 580,
    desc: 'Amplifica jutsus à custa de defesa.', stats: { nin: 16, def: -3 },
  },
  brassKnuckles: {
    id: 'brassKnuckles', name: 'Manoplas de Bronze', icon: '🥊', kind: 'equip', slot: 'weapon', price: 540,
    desc: 'Para quem resolve tudo de perto.', stats: { atk: 16, hp: 20, spd: -2 },
  },

  // ---------------- Equipamentos: proteção ----------------
  meshShirt: {
    id: 'meshShirt', name: 'Malha de Aço', icon: '🎽', kind: 'equip', slot: 'armor', price: 110,
    desc: 'Camada básica sob a roupa.', stats: { def: 4, hp: 15 },
  },
  chunimVest: {
    id: 'chunimVest', name: 'Colete Tático', icon: '🦺', kind: 'equip', slot: 'armor', price: 420,
    desc: 'Bolsos, placas e um pouco de dignidade.', stats: { def: 10, res: 6, hp: 40 },
  },
  mistCloak: {
    id: 'mistCloak', name: 'Manto da Névoa', icon: '🧥', kind: 'equip', slot: 'armor', price: 500,
    desc: 'Difícil de acertar quem você não vê.', stats: { res: 12, spd: 5, def: 3 },
  },
  stonePlate: {
    id: 'stonePlate', name: 'Placa de Granito', icon: '🛡️', kind: 'equip', slot: 'armor', price: 660,
    desc: 'Pesada como uma promessa.', stats: { def: 20, hp: 70, spd: -4 },
  },

  // ---------------- Equipamentos: amuleto ----------------
  leafCharm: {
    id: 'leafCharm', name: 'Amuleto da Folha', icon: '🍃', kind: 'equip', slot: 'charm', price: 150,
    desc: 'Um pouco de sorte nunca atrapalhou ninguém.', stats: { luck: 6, res: 2 },
  },
  chakraBeads: {
    id: 'chakraBeads', name: 'Contas de Chakra', icon: '📿', kind: 'equip', slot: 'charm', price: 380,
    desc: 'Recupera 6 de chakra por turno em batalha.', stats: { ck: 25 }, regenCk: 6,
  },
  ironWeights: {
    id: 'ironWeights', name: 'Pesos de Treino', icon: '⛓️', kind: 'equip', slot: 'charm', price: 300,
    desc: 'Lento agora, monstruoso depois: +30% de EXP ganho.', stats: { atk: 6, spd: -3 }, expBonus: .3,
  },
  foxPendant: {
    id: 'foxPendant', name: 'Pingente da Raposa', icon: '🦊', kind: 'equip', slot: 'charm', price: 0,
    desc: 'Aquece quando você mente. +10 em tudo, e um sussurro no fundo da cabeça.',
    stats: { hp: 40, ck: 20, atk: 6, nin: 6, spd: 3 }, unique: true,
  },
  medicPouch: {
    id: 'medicPouch', name: 'Bolsa Médica', icon: '⚕️', kind: 'equip', slot: 'charm', price: 340,
    desc: 'Curas aplicadas por quem usa são 30% mais fortes.', stats: { res: 8, ck: 15 }, healBonus: .3,
  },
};

export const SLOTS = {
  weapon: { id: 'weapon', name: 'Arma', icon: '⚔️' },
  armor: { id: 'armor', name: 'Proteção', icon: '🦺' },
  charm: { id: 'charm', name: 'Amuleto', icon: '📿' },
};

export function itemDef(id) {
  return ITEMS[id];
}

/** Catálogo da loja por capítulo (o estoque cresce conforme a história avança). */
export const SHOP_STOCK = {
  1: ['kunai', 'shuriken', 'ration', 'antidote', 'trainingKunai', 'meshShirt', 'leafCharm'],
  2: ['kunai', 'shuriken', 'smokeBomb', 'ration', 'soldierPill', 'antidote', 'steelKunai', 'meshShirt', 'leafCharm', 'ironWeights'],
  3: ['kunai', 'shuriken', 'smokeBomb', 'makibishi', 'ration', 'bigRation', 'soldierPill', 'antidote', 'reviveScroll', 'steelKunai', 'chunimVest', 'chakraBeads', 'ironWeights'],
  4: ['shuriken', 'explosiveTag', 'smokeBomb', 'makibishi', 'bigRation', 'soldierPill', 'antidote', 'reviveScroll', 'teamFeast', 'chakraBlade', 'sealedFan', 'brassKnuckles', 'chunimVest', 'mistCloak', 'stonePlate', 'chakraBeads', 'medicPouch'],
};
