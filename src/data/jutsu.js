// Catálogo de jutsus.
//
// Campos:
//   kind    'attack' | 'heal' | 'buff' | 'debuff' | 'support'
//   stat    atributo usado no cálculo ('atk' = taijutsu, 'nin' = ninjutsu)
//   power   0 = não causa dano
//   target  'foe' | 'allFoes' | 'ally' | 'allAllies' | 'self' | 'downAlly'
//   acc     precisão base (1 = nunca erra por si só)
//   hits    número de golpes (dano dividido e recalculado por golpe)
//   lv      nível necessário para usar
//   apply   [{ status, chance, turns, power }] efeitos aplicados no alvo
//   selfApply idem, mas no conjurador
//   heal    { pct } fração do NIN/MaxHP recuperada
//   drainCk chakra devolvido ao usuário

export const JUTSU = {
  // ======================= BÁSICOS / UNIVERSAIS =======================
  attack: {
    id: 'attack', name: 'Ataque', element: 'none', kind: 'attack', stat: 'atk',
    power: 52, cost: 0, target: 'foe', acc: .95, lv: 1, fx: 'slash',
    desc: 'Golpe físico simples. Não gasta chakra e devolve 4 de chakra.',
    drainCk: 4,
  },
  guard: {
    id: 'guard', name: 'Defender', element: 'none', kind: 'buff', stat: 'atk',
    power: 0, cost: 0, target: 'self', acc: 1, lv: 1, fx: 'shield',
    desc: 'Reduz o dano recebido pela metade e recupera 12% do chakra.',
    selfApply: [{ status: 'guard', chance: 1, turns: 1 }],
    drainCk: 0, guardCk: .12,
  },
  substitution: {
    id: 'substitution', name: 'Substituição', element: 'none', kind: 'buff', stat: 'atk',
    power: 0, cost: 10, target: 'self', acc: 1, lv: 1, fx: 'poof',
    desc: 'Troca de lugar com um tronco: anula completamente o próximo golpe recebido.',
    selfApply: [{ status: 'subs', chance: 1, turns: 2 }],
  },

  // ======================= FOGO =======================
  emberShot: {
    id: 'emberShot', name: 'Brasa Perfurante', element: 'fire', kind: 'attack', stat: 'nin',
    power: 62, cost: 8, target: 'foe', acc: .95, lv: 1, fx: 'burst',
    desc: 'Cuspe de brasa. 25% de chance de queimar.',
    apply: [{ status: 'burn', chance: .25, turns: 3 }],
  },
  greatFireball: {
    id: 'greatFireball', name: 'Grande Bola de Fogo', element: 'fire', kind: 'attack', stat: 'nin',
    power: 96, cost: 20, target: 'foe', acc: .92, lv: 6, fx: 'burst',
    desc: 'A técnica que marca a maioridade de um Uchiha. 35% de queimadura.',
    apply: [{ status: 'burn', chance: .35, turns: 3 }],
  },
  phoenixFlower: {
    id: 'phoenixFlower', name: 'Flor de Fênix', element: 'fire', kind: 'attack', stat: 'nin',
    power: 34, cost: 18, target: 'foe', acc: .88, hits: 4, lv: 9, fx: 'multi',
    desc: 'Quatro chamas independentes. Ignora metade da defesa.',
    pierce: .5,
  },
  flameWall: {
    id: 'flameWall', name: 'Muralha de Chamas', element: 'fire', kind: 'attack', stat: 'nin',
    power: 68, cost: 26, target: 'allFoes', acc: .9, lv: 13, fx: 'wall',
    desc: 'Parede de fogo que varre o campo inimigo e queima quem atravessar.',
    apply: [{ status: 'burn', chance: .4, turns: 3 }],
  },
  infernoFang: {
    id: 'infernoFang', name: 'Presa do Inferno', element: 'fire', kind: 'attack', stat: 'nin',
    power: 155, cost: 42, target: 'foe', acc: .9, lv: 20, fx: 'ultimate',
    desc: 'Concentra todo o chakra numa presa de fogo branco. Queimadura garantida.',
    apply: [{ status: 'burn', chance: 1, turns: 4 }],
  },

  // ======================= VENTO =======================
  windPalm: {
    id: 'windPalm', name: 'Palma de Vento', element: 'wind', kind: 'attack', stat: 'nin',
    power: 60, cost: 8, target: 'foe', acc: .97, lv: 1, fx: 'slash',
    desc: 'Rajada comprimida disparada da palma. Precisão alta.',
  },
  cuttingGale: {
    id: 'cuttingGale', name: 'Vendaval Cortante', element: 'wind', kind: 'attack', stat: 'nin',
    power: 88, cost: 19, target: 'foe', acc: .93, lv: 6, fx: 'slash',
    desc: 'Lâminas de ar que abrem a guarda. Reduz a defesa do alvo.',
    apply: [{ status: 'defdn', chance: .5, turns: 3 }],
  },
  vacuumSphere: {
    id: 'vacuumSphere', name: 'Esfera de Vácuo', element: 'wind', kind: 'attack', stat: 'nin',
    power: 40, cost: 22, target: 'allFoes', acc: .9, lv: 10, fx: 'burst',
    desc: 'Implosão de ar que atinge todos os inimigos.',
  },
  galeArmor: {
    id: 'galeArmor', name: 'Armadura de Ventania', element: 'wind', kind: 'buff', stat: 'nin',
    power: 0, cost: 16, target: 'self', acc: 1, lv: 12, fx: 'shield',
    desc: 'Vento em espiral ao redor do corpo: +40% de velocidade e +25% de esquiva por 4 turnos.',
    selfApply: [{ status: 'haste', chance: 1, turns: 4 }],
  },
  tempestFang: {
    id: 'tempestFang', name: 'Presa da Tempestade', element: 'wind', kind: 'attack', stat: 'nin',
    power: 150, cost: 40, target: 'foe', acc: .92, lv: 20, fx: 'ultimate',
    desc: 'Uma espiral que corta o ar até o alvo. Crítico garantido em inimigos molhados.',
    critVs: 'wet',
  },

  // ======================= RAIO =======================
  sparkPalm: {
    id: 'sparkPalm', name: 'Palma Faiscante', element: 'lightning', kind: 'attack', stat: 'nin',
    power: 58, cost: 8, target: 'foe', acc: 1, lv: 1, fx: 'bolt',
    desc: 'Descarga curta que nunca erra. 20% de paralisia.',
    apply: [{ status: 'para', chance: .2, turns: 2 }],
  },
  lightningSpear: {
    id: 'lightningSpear', name: 'Lança Relâmpago', element: 'lightning', kind: 'attack', stat: 'nin',
    power: 94, cost: 20, target: 'foe', acc: .96, lv: 7, fx: 'bolt',
    desc: 'Lança de raio que perfura armaduras. Ignora 40% da defesa.',
    pierce: .4,
  },
  chainThunder: {
    id: 'chainThunder', name: 'Trovão em Cadeia', element: 'lightning', kind: 'attack', stat: 'nin',
    power: 46, cost: 24, target: 'allFoes', acc: .94, lv: 11, fx: 'bolt',
    desc: 'Salta entre os inimigos. 30% de paralisia em cada alvo.',
    apply: [{ status: 'para', chance: .3, turns: 2 }],
  },
  staticVeil: {
    id: 'staticVeil', name: 'Véu Estático', element: 'lightning', kind: 'buff', stat: 'nin',
    power: 0, cost: 15, target: 'self', acc: 1, lv: 12, fx: 'shield',
    desc: 'Contra-ataca com 35% do dano recebido durante 3 turnos.',
    selfApply: [{ status: 'thorns', chance: 1, turns: 3 }],
  },
  thunderFang: {
    id: 'thunderFang', name: 'Presa Trovejante', element: 'lightning', kind: 'attack', stat: 'nin',
    power: 148, cost: 40, target: 'foe', acc: .95, lv: 20, fx: 'ultimate',
    desc: 'Concentração de raio na mão. Paralisia garantida se o alvo estiver molhado.',
    apply: [{ status: 'para', chance: .45, turns: 2 }], pierce: .3,
  },

  // ======================= TERRA =======================
  pebbleShot: {
    id: 'pebbleShot', name: 'Tiro de Seixos', element: 'earth', kind: 'attack', stat: 'nin',
    power: 30, cost: 8, target: 'foe', acc: .93, hits: 3, lv: 1, fx: 'multi',
    desc: 'Três pedras lançadas em sequência.',
  },
  rockFist: {
    id: 'rockFist', name: 'Punho de Rocha', element: 'earth', kind: 'attack', stat: 'atk',
    power: 92, cost: 16, target: 'foe', acc: .9, lv: 5, fx: 'slam',
    desc: 'Reveste o punho de pedra. Usa Taijutsu no cálculo.',
  },
  stoneWall: {
    id: 'stoneWall', name: 'Muro de Pedra', element: 'earth', kind: 'buff', stat: 'nin',
    power: 0, cost: 14, target: 'allAllies', acc: 1, lv: 8, fx: 'shield',
    desc: 'Ergue uma barreira: +45% de defesa para todo o time por 3 turnos.',
    apply: [{ status: 'defup', chance: 1, turns: 3 }],
  },
  earthPrison: {
    id: 'earthPrison', name: 'Prisão de Terra', element: 'earth', kind: 'debuff', stat: 'nin',
    power: 40, cost: 20, target: 'foe', acc: .85, lv: 11, fx: 'slam',
    desc: 'Prende o alvo no solo: 70% de chance de imobilizar por 2 turnos.',
    apply: [{ status: 'bind', chance: .7, turns: 2 }],
  },
  quakeFang: {
    id: 'quakeFang', name: 'Presa Sísmica', element: 'earth', kind: 'attack', stat: 'atk',
    power: 96, cost: 38, target: 'allFoes', acc: .9, lv: 20, fx: 'ultimate',
    desc: 'Fratura o terreno inteiro. Reduz a defesa de todos os inimigos.',
    apply: [{ status: 'defdn', chance: .8, turns: 3 }],
  },

  // ======================= ÁGUA =======================
  waterBullet: {
    id: 'waterBullet', name: 'Bala d\'Água', element: 'water', kind: 'attack', stat: 'nin',
    power: 61, cost: 9, target: 'foe', acc: .95, lv: 1, fx: 'burst',
    desc: 'Jato pressurizado. Deixa o alvo molhado (fraco contra Raio).',
    apply: [{ status: 'wet', chance: .6, turns: 3 }],
  },
  tideChain: {
    id: 'tideChain', name: 'Corrente da Maré', element: 'water', kind: 'attack', stat: 'nin',
    power: 44, cost: 21, target: 'allFoes', acc: .93, lv: 7, fx: 'wave',
    desc: 'Onda que encharca todos os inimigos.',
    apply: [{ status: 'wet', chance: .85, turns: 3 }],
  },
  hidingMist: {
    id: 'hidingMist', name: 'Névoa Oculta', element: 'water', kind: 'debuff', stat: 'nin',
    power: 0, cost: 14, target: 'allFoes', acc: 1, lv: 5, fx: 'mist',
    desc: 'Névoa densa: inimigos perdem 30% de precisão por 4 turnos.',
    apply: [{ status: 'blind', chance: 1, turns: 4 }],
  },
  healingTide: {
    id: 'healingTide', name: 'Maré Restauradora', element: 'water', kind: 'heal', stat: 'nin',
    power: 0, cost: 22, target: 'allAllies', acc: 1, lv: 10, fx: 'heal',
    desc: 'Água curativa que restaura todo o time.',
    heal: { pct: .9 },
  },
  serpentFang: {
    id: 'serpentFang', name: 'Presa da Serpente', element: 'water', kind: 'attack', stat: 'nin',
    power: 145, cost: 40, target: 'foe', acc: .93, lv: 20, fx: 'ultimate',
    desc: 'Dragão d\'água em miniatura. Encharca e afoga o alvo.',
    apply: [{ status: 'wet', chance: 1, turns: 4 }, { status: 'defdn', chance: .6, turns: 3 }],
  },
  greatWaterfall: {
    id: 'greatWaterfall', name: 'Grande Cachoeira', element: 'water', kind: 'attack', stat: 'nin',
    power: 82, cost: 30, target: 'allFoes', acc: .9, lv: 16, fx: 'wave',
    desc: 'Uma parede de água despenca sobre o campo inimigo.',
    apply: [{ status: 'wet', chance: 1, turns: 3 }],
  },

  // ======================= ESTILOS =======================
  ironFistRush: {
    id: 'ironFistRush', name: 'Investida do Punho de Ferro', element: 'none', kind: 'attack', stat: 'atk',
    power: 33, cost: 10, target: 'foe', acc: .9, hits: 3, lv: 3, fx: 'multi',
    desc: 'Três socos encadeados. O último tem chance dobrada de crítico.',
    critBoost: .12,
  },
  risingKnee: {
    id: 'risingKnee', name: 'Joelhada Ascendente', element: 'none', kind: 'attack', stat: 'atk',
    power: 104, cost: 18, target: 'foe', acc: .88, lv: 9, fx: 'slam',
    desc: 'Levanta o alvo do chão. 45% de chance de atordoar.',
    apply: [{ status: 'bind', chance: .45, turns: 1 }],
  },
  chakraSurge: {
    id: 'chakraSurge', name: 'Surto de Chakra', element: 'none', kind: 'buff', stat: 'nin',
    power: 0, cost: 0, target: 'self', acc: 1, lv: 3, fx: 'aura',
    desc: 'Recupera 30% do chakra máximo, mas você fica vulnerável (-25% defesa) por 2 turnos.',
    restoreCk: .3,
    selfApply: [{ status: 'defdn', chance: 1, turns: 2 }],
  },
  sealBurst: {
    id: 'sealBurst', name: 'Explosão de Selo', element: 'none', kind: 'attack', stat: 'nin',
    power: 74, cost: 17, target: 'foe', acc: .94, lv: 9, fx: 'burst',
    desc: 'Detona chakra puro no alvo. Ignora resistência elemental.',
    trueElement: true,
  },
  mirrorHaze: {
    id: 'mirrorHaze', name: 'Bruma Espelhada', element: 'none', kind: 'debuff', stat: 'nin',
    power: 0, cost: 15, target: 'foe', acc: .85, lv: 3, fx: 'genjutsu',
    desc: 'Ilusão que confunde o alvo — ele pode atacar o próprio time.',
    apply: [{ status: 'conf', chance: .8, turns: 3 }],
  },
  creepingDread: {
    id: 'creepingDread', name: 'Pavor Rastejante', element: 'none', kind: 'debuff', stat: 'nin',
    power: 36, cost: 24, target: 'allFoes', acc: .82, lv: 9, fx: 'genjutsu',
    desc: 'Medo induzido: reduz ataque e defesa de todos os inimigos.',
    apply: [{ status: 'atkdn', chance: .7, turns: 3 }, { status: 'defdn', chance: .7, turns: 3 }],
  },

  // ======================= NARUTO =======================
  kagebunshin: {
    id: 'kagebunshin', name: 'Jutsu Clone das Sombras', element: 'none', kind: 'buff', stat: 'atk',
    power: 0, cost: 18, target: 'self', acc: 1, lv: 1, fx: 'poof',
    desc: 'Cria clones sólidos: +50% de ataque e +25% de esquiva por 4 turnos.',
    selfApply: [{ status: 'clones', chance: 1, turns: 4 }],
  },
  uzumakiBarrage: {
    id: 'uzumakiBarrage', name: 'Combo Uzumaki', element: 'none', kind: 'attack', stat: 'atk',
    power: 28, cost: 12, target: 'foe', acc: .9, hits: 4, lv: 4, fx: 'multi',
    desc: 'Sequência caótica de chutes e socos. Ganha +1 golpe se houver clones ativos.',
    bonusHitWith: 'clones',
  },
  narutoRasenSpin: {
    id: 'narutoRasenSpin', name: 'Esfera Espiral', element: 'wind', kind: 'attack', stat: 'nin',
    power: 138, cost: 34, target: 'foe', acc: .93, lv: 14, fx: 'ultimate',
    desc: 'Chakra girando na palma da mão. Empurra o alvo para a retaguarda.',
    pierce: .35,
  },
  nineTailsFlare: {
    id: 'nineTailsFlare', name: 'Manto Escarlate', element: 'none', kind: 'buff', stat: 'atk',
    power: 0, cost: 0, target: 'self', acc: 1, lv: 10, fx: 'aura',
    desc: 'Custa 15% do HP atual. +80% de ataque e regeneração por 4 turnos — e algo mais escuro observa.',
    hpCost: .15,
    selfApply: [{ status: 'rage', chance: 1, turns: 4 }, { status: 'regen', chance: 1, turns: 4 }],
    karma: { dark: 1 },
  },

  // ======================= SASUKE =======================
  lionCombo: {
    id: 'lionCombo', name: 'Combo do Leão', element: 'none', kind: 'attack', stat: 'atk',
    power: 40, cost: 20, target: 'foe', acc: .89, hits: 3, lv: 8, fx: 'multi',
    desc: 'Suspende o alvo no ar e o esmaga contra o chão.',
    critBoost: .15,
  },
  sharinganRead: {
    id: 'sharinganRead', name: 'Leitura do Sharingan', element: 'none', kind: 'buff', stat: 'nin',
    power: 0, cost: 12, target: 'self', acc: 1, lv: 6, fx: 'aura',
    desc: 'Prevê os movimentos: +35% de esquiva e +25% de crítico por 4 turnos.',
    selfApply: [{ status: 'focus', chance: 1, turns: 4 }],
  },
  chidoriStream: {
    id: 'chidoriStream', name: 'Corrente Chidori', element: 'lightning', kind: 'attack', stat: 'nin',
    power: 128, cost: 32, target: 'foe', acc: .95, lv: 15, fx: 'ultimate',
    desc: 'Mil pássaros condensados. Perfura defesas e paralisa.',
    pierce: .5,
    apply: [{ status: 'para', chance: .35, turns: 2 }],
  },

  // ======================= SAKURA =======================
  mysticPalm: {
    id: 'mysticPalm', name: 'Palma Mística', element: 'none', kind: 'heal', stat: 'nin',
    power: 0, cost: 14, target: 'ally', acc: 1, lv: 1, fx: 'heal',
    desc: 'Cura um aliado com chakra médico concentrado.',
    heal: { pct: 1.25 },
  },
  antidoteTouch: {
    id: 'antidoteTouch', name: 'Toque Purificador', element: 'none', kind: 'heal', stat: 'nin',
    power: 0, cost: 10, target: 'ally', acc: 1, lv: 4, fx: 'heal',
    desc: 'Remove todos os efeitos negativos de um aliado e cura um pouco.',
    heal: { pct: .4 }, cleanse: true,
  },
  cherryStrike: {
    id: 'cherryStrike', name: 'Golpe Flor de Cerejeira', element: 'none', kind: 'attack', stat: 'atk',
    power: 86, cost: 12, target: 'foe', acc: .92, lv: 3, fx: 'slam',
    desc: 'Controle de chakra perfeito concentrado no punho.',
  },
  innerFocus: {
    id: 'innerFocus', name: 'Foco Interior', element: 'none', kind: 'buff', stat: 'nin',
    power: 0, cost: 16, target: 'allAllies', acc: 1, lv: 9, fx: 'aura',
    desc: 'Anima o time: +30% de ataque e ninjutsu por 3 turnos.',
    apply: [{ status: 'atkup', chance: 1, turns: 3 }],
  },
  shatterPunch: {
    id: 'shatterPunch', name: 'Punho Estilhaçador', element: 'earth', kind: 'attack', stat: 'atk',
    power: 142, cost: 30, target: 'foe', acc: .87, lv: 15, fx: 'ultimate',
    desc: 'Racha o chão sob os pés do inimigo. Ignora 60% da defesa.',
    pierce: .6,
  },
  reviveAlly: {
    id: 'reviveAlly', name: 'Ressuscitação de Emergência', element: 'none', kind: 'heal', stat: 'nin',
    power: 0, cost: 34, target: 'downAlly', acc: 1, lv: 12, fx: 'heal',
    desc: 'Traz um aliado caído de volta com 50% do HP.',
    revive: .5,
  },

  // ======================= KAKASHI =======================
  chidori: {
    id: 'chidori', name: 'Chidori', element: 'lightning', kind: 'attack', stat: 'nin',
    power: 150, cost: 36, target: 'foe', acc: .96, lv: 1, fx: 'ultimate',
    desc: 'A técnica original. Perfura praticamente qualquer defesa.',
    pierce: .65,
  },
  lightningHound: {
    id: 'lightningHound', name: 'Cão de Caça Relâmpago', element: 'lightning', kind: 'attack', stat: 'nin',
    power: 58, cost: 26, target: 'allFoes', acc: .94, lv: 1, fx: 'bolt',
    desc: 'Matilha de raio que persegue todos os inimigos.',
    apply: [{ status: 'para', chance: .25, turns: 2 }],
  },
  earthHeadhunter: {
    id: 'earthHeadhunter', name: 'Decapitação Subterrânea', element: 'earth', kind: 'attack', stat: 'atk',
    power: 88, cost: 18, target: 'foe', acc: .88, lv: 1, fx: 'slam',
    desc: 'Puxa o alvo para baixo da terra. Imobiliza.',
    apply: [{ status: 'bind', chance: .65, turns: 2 }],
  },
  copyStance: {
    id: 'copyStance', name: 'Postura do Copiador', element: 'none', kind: 'buff', stat: 'nin',
    power: 0, cost: 14, target: 'self', acc: 1, lv: 1, fx: 'aura',
    desc: 'Lê e antecipa: +40% de esquiva, +20% de crítico e contra-ataque por 3 turnos.',
    selfApply: [{ status: 'focus', chance: 1, turns: 3 }, { status: 'thorns', chance: 1, turns: 3 }],
  },
  waterVortex: {
    id: 'waterVortex', name: 'Vórtice Aquático', element: 'water', kind: 'attack', stat: 'nin',
    power: 96, cost: 28, target: 'allFoes', acc: .9, lv: 1, fx: 'wave',
    desc: 'Redemoinho copiado de um inimigo antigo.',
    apply: [{ status: 'wet', chance: .9, turns: 3 }],
  },

  // ======================= JIN =======================
  ironBodyStance: {
    id: 'ironBodyStance', name: 'Postura do Corpo de Ferro', element: 'earth', kind: 'buff', stat: 'atk',
    power: 0, cost: 12, target: 'self', acc: 1, lv: 4, fx: 'shield',
    desc: 'Atrai todos os ataques para si e reduz o dano recebido em 40% por 3 turnos.',
    selfApply: [{ status: 'taunt', chance: 1, turns: 3 }, { status: 'defup', chance: 1, turns: 3 }],
  },
  meteorSlam: {
    id: 'meteorSlam', name: 'Impacto Meteórico', element: 'earth', kind: 'attack', stat: 'atk',
    power: 158, cost: 36, target: 'foe', acc: .84, lv: 16, fx: 'ultimate',
    desc: 'Arranca um bloco do chão e o arremessa. Dano imenso, precisão baixa.',
  },

  // ======================= JUTSUS INIMIGOS =======================
  banditSlash:  { id: 'banditSlash', name: 'Corte Sujo', element: 'none', kind: 'attack', stat: 'atk', power: 58, cost: 0, target: 'foe', acc: .88, lv: 1, fx: 'slash', desc: 'Golpe de faca enferrujada.' },
  poisonNeedle: { id: 'poisonNeedle', name: 'Agulha Envenenada', element: 'none', kind: 'attack', stat: 'atk', power: 40, cost: 6, target: 'foe', acc: .9, lv: 1, fx: 'slash', desc: 'Envenena.', apply: [{ status: 'poison', chance: .65, turns: 4 }] },
  howl:         { id: 'howl', name: 'Uivo', element: 'none', kind: 'debuff', stat: 'atk', power: 0, cost: 5, target: 'allFoes', acc: 1, lv: 1, fx: 'aura', desc: 'Intimida o grupo.', apply: [{ status: 'atkdn', chance: .6, turns: 3 }] },
  puppetStrings:{ id: 'puppetStrings', name: 'Fios de Marionete', element: 'none', kind: 'attack', stat: 'nin', power: 52, cost: 8, target: 'foe', acc: .9, lv: 1, fx: 'slash', desc: 'Prende com fios de chakra.', apply: [{ status: 'bind', chance: .4, turns: 2 }] },
  soundWave:    { id: 'soundWave', name: 'Onda Sonora', element: 'none', kind: 'attack', stat: 'nin', power: 46, cost: 12, target: 'allFoes', acc: .92, lv: 1, fx: 'burst', desc: 'Desequilibra o time inteiro.', apply: [{ status: 'conf', chance: .3, turns: 2 }] },
  shadowLance:  { id: 'shadowLance', name: 'Lança de Sombra', element: 'none', kind: 'attack', stat: 'nin', power: 104, cost: 20, target: 'foe', acc: .93, lv: 1, fx: 'ultimate', desc: 'Sombra sólida que perfura.', pierce: .45 },
  shadowBind:   { id: 'shadowBind', name: 'Amarras de Sombra', element: 'none', kind: 'debuff', stat: 'nin', power: 0, cost: 16, target: 'allFoes', acc: .8, lv: 1, fx: 'genjutsu', desc: 'Prende o time nas próprias sombras.', apply: [{ status: 'bind', chance: .55, turns: 2 }] },
  drainSeal:    { id: 'drainSeal', name: 'Selo Sanguessuga', element: 'none', kind: 'attack', stat: 'nin', power: 70, cost: 18, target: 'foe', acc: .9, lv: 1, fx: 'genjutsu', desc: 'Rouba vida do alvo.', lifesteal: .6, karma: { dark: 0 } },
  venomFog:     { id: 'venomFog', name: 'Bruma Venenosa', element: 'water', kind: 'debuff', stat: 'nin', power: 30, cost: 20, target: 'allFoes', acc: .9, lv: 1, fx: 'mist', desc: 'Névoa tóxica.', apply: [{ status: 'poison', chance: .7, turns: 4 }] },
  mercStrike:   { id: 'mercStrike', name: 'Corte Mercenário', element: 'none', kind: 'attack', stat: 'atk', power: 96, cost: 8, target: 'foe', acc: .87, lv: 1, fx: 'slam', desc: 'Espadada larga.' },
  regenerate:   { id: 'regenerate', name: 'Regeneração', element: 'none', kind: 'heal', stat: 'nin', power: 0, cost: 22, target: 'self', acc: 1, lv: 1, fx: 'heal', desc: 'Fecha os próprios ferimentos.', heal: { pct: .8 } },
  eclipseRoar:  { id: 'eclipseRoar', name: 'Rugido do Eclipse', element: 'none', kind: 'attack', stat: 'nin', power: 92, cost: 30, target: 'allFoes', acc: .92, lv: 1, fx: 'ultimate', desc: 'Grito que rasga o chakra de todos.', apply: [{ status: 'defdn', chance: .6, turns: 3 }] },
};

// ======================= JUTSUS COMBINADOS =======================
// Gastam a barra de Vontade de Fogo e exigem dois membros vivos no time.
export const TEAM_JUTSU = {
  fireWind: {
    id: 'fireWind', name: 'Chama Ampliada pelo Vento',
    members: ['sasuke', 'naruto'], element: 'fire', power: 210, target: 'allFoes',
    desc: 'Sasuke solta o fogo, Naruto sopra o vento. O campo inteiro vira uma fornalha.',
    apply: [{ status: 'burn', chance: .8, turns: 3 }],
  },
  heroSakura: {
    id: 'heroSakura', name: 'Corte e Cura',
    members: ['hero', 'sakura'], element: 'none', power: 165, target: 'foe',
    desc: 'Você abre a guarda, Sakura fecha o punho. E ainda sobra chakra para curar o time.',
    healAllies: { pct: .5 },
  },
  stoneTide: {
    id: 'stoneTide', name: 'Maré de Pedra',
    members: ['jin', 'kaede'], element: 'water', power: 195, target: 'allFoes',
    desc: 'Jin quebra o solo, Kaede traz a água. O que sobra é lama e silêncio.',
    apply: [{ status: 'wet', chance: 1, turns: 3 }, { status: 'bind', chance: .5, turns: 2 }],
  },
  masterLesson: {
    id: 'masterLesson', name: 'A Lição do Mestre',
    members: ['kakashi', 'hero'], element: 'lightning', power: 230, target: 'foe',
    desc: 'Kakashi guia sua mão. O raio faz o resto.',
    pierce: .6,
  },
  teamSeven: {
    id: 'teamSeven', name: 'Formação Time 7',
    members: ['naruto', 'sasuke', 'sakura'], element: 'none', power: 260, target: 'allFoes',
    desc: 'Três genins insuportáveis que, por um instante, se movem como um só.',
    requiresBond: 3,
  },
};

export function jutsuDef(id) {
  return JUTSU[id];
}

/** Jutsus que o personagem já pode usar no nível atual. */
export function availableJutsu(list, level) {
  return (list || [])
    .map((id) => JUTSU[id])
    .filter(Boolean)
    .filter((j) => (j.lv || 1) <= level);
}
