// Fichas dos personagens jogáveis.
// `base` = atributos no nível 1; `growth` = ganho por nível.
// `art` alimenta o gerador procedural de retratos (src/art/portraits.js).

export const STATS = ['hp', 'ck', 'atk', 'nin', 'def', 'res', 'spd', 'luck'];

export const STAT_LABEL = {
  hp: 'Vida',
  ck: 'Chakra',
  atk: 'Taijutsu',
  nin: 'Ninjutsu',
  def: 'Defesa',
  res: 'Resistência',
  spd: 'Velocidade',
  luck: 'Sorte',
};

export const ELEMENTS = {
  fire:      { id: 'fire',      name: 'Katon (Fogo)',      icon: '🔥', color: '#ff7a3d' },
  wind:      { id: 'wind',      name: 'Fūton (Vento)',     icon: '🌪️', color: '#96e8b0' },
  lightning: { id: 'lightning', name: 'Raiton (Raio)',     icon: '⚡', color: '#ffe066' },
  earth:     { id: 'earth',     name: 'Doton (Terra)',     icon: '🪨', color: '#c79a63' },
  water:     { id: 'water',     name: 'Suiton (Água)',     icon: '💧', color: '#6fc9f0' },
  none:      { id: 'none',      name: 'Sem afinidade',     icon: '✴️', color: '#dcd0f0' },
};

// Cadeia canônica: Fogo > Vento > Raio > Terra > Água > Fogo
export const ELEMENT_BEATS = {
  fire: 'wind',
  wind: 'lightning',
  lightning: 'earth',
  earth: 'water',
  water: 'fire',
};

/** Multiplicador elemental do atacante contra o defensor. */
export function elementMultiplier(atkEl, defEl) {
  if (!atkEl || !defEl || atkEl === 'none' || defEl === 'none') return 1;
  if (ELEMENT_BEATS[atkEl] === defEl) return 1.5;
  if (ELEMENT_BEATS[defEl] === atkEl) return 0.65;
  return 1;
}

// --- Estilos de luta do protagonista -------------------------------------
export const STYLES = {
  taijutsu: {
    id: 'taijutsu',
    name: 'Punho de Ferro',
    desc: 'Corpo a corpo. Muito ATK e HP, chakra modesto. Golpes físicos escalam mais rápido.',
    icon: '👊',
    mods: { hp: 18, atk: 5, def: 3, nin: -2, ck: -8, spd: 1 },
    growthMods: { hp: 4, atk: 1.1, def: .5, nin: -.4 },
  },
  ninjutsu: {
    id: 'ninjutsu',
    name: 'Sopro do Selo',
    desc: 'Jutsus elementais. Muito NIN e chakra, corpo frágil. Escala com o elemento escolhido.',
    icon: '🌀',
    mods: { ck: 22, nin: 6, res: 2, atk: -2, hp: -8 },
    growthMods: { ck: 5, nin: 1.2, res: .4, atk: -.3 },
  },
  genjutsu: {
    id: 'genjutsu',
    name: 'Véu da Ilusão',
    desc: 'Controle e debuffs. Alta SPD e sorte, dano médio, acesso a confusão e paralisia mental.',
    icon: '👁️',
    mods: { spd: 5, luck: 5, res: 4, nin: 2, hp: -4, def: -1 },
    growthMods: { spd: .9, luck: .8, nin: .5, res: .5 },
  },
};

// --- Roster ---------------------------------------------------------------
export const CHARACTERS = {
  hero: {
    id: 'hero',
    name: 'Ren',                     // sobrescrito pelo nome escolhido
    title: 'Genin do Time 7',
    element: 'wind',                 // sobrescrito pela escolha
    role: 'Coringa',
    playable: true,
    base: { hp: 118, ck: 60, atk: 20, nin: 20, def: 14, res: 13, spd: 15, luck: 8 },
    growth: { hp: 15, ck: 8, atk: 2.6, nin: 2.6, def: 1.7, res: 1.6, spd: 1.6, luck: .7 },
    jutsu: [],                       // preenchido no início conforme elemento/estilo
    bio: 'Órfão da Vila da Folha. Entrou na Academia tarde e compensou com teimosia. Ninguém sabe de onde veio o selo em sua palma.',
    art: {
      skin: '#f0c49a', hair: '#3b2f4a', hairStyle: 'messy', eye: '#5ec8d8',
      outfit: '#31527a', outfit2: '#c9a23f', headband: true, bandColor: '#2b3a67',
      marks: 'seal',
    },
  },

  naruto: {
    id: 'naruto',
    name: 'Naruto',
    title: 'O Ninja Imprevisível',
    element: 'wind',
    role: 'Vanguarda',
    playable: true,
    base: { hp: 155, ck: 78, atk: 22, nin: 17, def: 15, res: 11, spd: 14, luck: 12 },
    growth: { hp: 20, ck: 11, atk: 2.8, nin: 2.1, def: 1.8, res: 1.3, spd: 1.5, luck: 1.1 },
    jutsu: ['kagebunshin', 'narutoRasenSpin', 'uzumakiBarrage', 'windPalm', 'nineTailsFlare'],
    bio: 'Barulhento, teimoso e incapaz de desistir. Quanto mais apanha, mais forte fica — literalmente: sua Vontade de Fogo enche mais rápido.',
    art: {
      skin: '#f4c99b', hair: '#f2c53d', hairStyle: 'spiky', eye: '#49a7e0',
      outfit: '#e07a2a', outfit2: '#2b3a67', headband: true, bandColor: '#2b3a67',
      marks: 'whiskers',
    },
    passive: { id: 'willFire', desc: 'A Vontade de Fogo enche 50% mais rápido quando ele leva dano.' },
  },

  sasuke: {
    id: 'sasuke',
    name: 'Sasuke',
    title: 'O Último dos Uchiha',
    element: 'fire',
    role: 'Atacante',
    playable: true,
    base: { hp: 122, ck: 70, atk: 24, nin: 24, def: 14, res: 15, spd: 21, luck: 10 },
    growth: { hp: 14, ck: 9, atk: 2.9, nin: 3.0, def: 1.5, res: 1.7, spd: 2.4, luck: .9 },
    jutsu: ['greatFireball', 'phoenixFlower', 'lionCombo', 'sharinganRead', 'chidoriStream'],
    bio: 'Frio, cirúrgico e movido por uma promessa que ele não conta a ninguém. Enxerga o ataque antes de ele acontecer.',
    art: {
      skin: '#f2d0b0', hair: '#2a2735', hairStyle: 'duck', eye: '#2c2a38',
      outfit: '#2f3f56', outfit2: '#d8d2c4', headband: true, bandColor: '#2b3a67',
      marks: 'none',
    },
    passive: { id: 'foresight', desc: 'Sharingan: +12% de esquiva e +10% de acerto crítico.' },
  },

  sakura: {
    id: 'sakura',
    name: 'Sakura',
    title: 'Punho Médico',
    element: 'none',
    role: 'Suporte',
    playable: true,
    base: { hp: 112, ck: 82, atk: 19, nin: 21, def: 13, res: 18, spd: 16, luck: 11 },
    growth: { hp: 13, ck: 12, atk: 2.4, nin: 2.7, def: 1.4, res: 2.2, spd: 1.7, luck: 1.0 },
    jutsu: ['mysticPalm', 'cherryStrike', 'antidoteTouch', 'innerFocus', 'shatterPunch'],
    bio: 'Controle de chakra impecável. Cura o time entre um golpe e outro — e o golpe dela abre o chão.',
    art: {
      skin: '#fbd3b4', hair: '#f09ab8', hairStyle: 'long', eye: '#5eb06a',
      outfit: '#d4462f', outfit2: '#f7e6d2', headband: true, bandColor: '#d4462f', bandOnHead: true,
      marks: 'none',
    },
    passive: { id: 'medic', desc: 'Curas que ela aplica são 25% mais fortes e removem 1 status negativo.' },
  },

  kakashi: {
    id: 'kakashi',
    name: 'Kakashi',
    title: 'Ninja Copiador',
    element: 'lightning',
    role: 'Instrutor',
    playable: true,
    guest: true,
    base: { hp: 168, ck: 96, atk: 27, nin: 29, def: 21, res: 22, spd: 24, luck: 14 },
    growth: { hp: 16, ck: 10, atk: 2.5, nin: 2.8, def: 2.0, res: 2.0, spd: 2.1, luck: .8 },
    jutsu: ['chidori', 'lightningHound', 'earthHeadhunter', 'copyStance', 'waterVortex'],
    bio: 'Chega atrasado, lê um livro suspeito e ainda assim resolve a luta em dois movimentos.',
    art: {
      skin: '#f2d0b0', hair: '#c9cdd6', hairStyle: 'swept', eye: '#4a4a58',
      outfit: '#2b3a67', outfit2: '#4b7a4b', headband: true, bandColor: '#2b3a67', bandTilt: true,
      marks: 'mask',
    },
    passive: { id: 'copy', desc: 'Uma vez por batalha, copia e devolve o último jutsu inimigo.' },
  },

  kaede: {
    id: 'kaede',
    name: 'Kaede',
    title: 'A Maré Silenciosa',
    element: 'water',
    role: 'Controle',
    playable: true,
    recruitable: true,
    base: { hp: 116, ck: 88, atk: 17, nin: 25, def: 13, res: 19, spd: 18, luck: 13 },
    growth: { hp: 13, ck: 11, atk: 2.2, nin: 3.0, def: 1.4, res: 2.1, spd: 1.9, luck: 1.2 },
    jutsu: ['waterBullet', 'hidingMist', 'tideChain', 'healingTide', 'greatWaterfall'],
    bio: 'Filha de pescadores do País das Ondas. Aprendeu a ler correntes antes de ler palavras — e agora lê pessoas do mesmo jeito.',
    art: {
      skin: '#e8bd96', hair: '#4d6f8f', hairStyle: 'ponytail', eye: '#7fd2f0',
      outfit: '#3d6b8a', outfit2: '#cfe7f2', headband: false,
      marks: 'none',
    },
    passive: { id: 'tide', desc: 'Inimigos molhados recebem +30% de dano de Raio.' },
  },

  jin: {
    id: 'jin',
    name: 'Jin',
    title: 'Muralha de Pedra',
    element: 'earth',
    role: 'Guardião',
    playable: true,
    recruitable: true,
    base: { hp: 178, ck: 54, atk: 25, nin: 15, def: 26, res: 16, spd: 9, luck: 7 },
    growth: { hp: 23, ck: 6, atk: 2.7, nin: 1.6, def: 2.6, res: 1.6, spd: .9, luck: .6 },
    jutsu: ['stoneWall', 'rockFist', 'earthPrison', 'ironBodyStance', 'meteorSlam'],
    bio: 'Genin de uma vila menor, treinado para aguentar. Não sabe recuar — e isso já custou caro a ele uma vez.',
    art: {
      skin: '#d9a273', hair: '#5a4632', hairStyle: 'buzz', eye: '#8a6a3a',
      outfit: '#6b5a44', outfit2: '#3a3128', headband: true, bandColor: '#5a4632',
      marks: 'scar',
    },
    passive: { id: 'bulwark', desc: 'Enquanto está na linha de frente, aliados na retaguarda recebem -20% de dano.' },
  },
};

/** Jutsus iniciais do protagonista por elemento + estilo. */
export const HERO_JUTSU = {
  fire:      ['emberShot', 'greatFireball', 'phoenixFlower', 'flameWall', 'infernoFang'],
  wind:      ['windPalm', 'cuttingGale', 'vacuumSphere', 'galeArmor', 'tempestFang'],
  lightning: ['sparkPalm', 'lightningSpear', 'chainThunder', 'staticVeil', 'thunderFang'],
  earth:     ['pebbleShot', 'rockFist', 'stoneWall', 'earthPrison', 'quakeFang'],
  water:     ['waterBullet', 'tideChain', 'hidingMist', 'healingTide', 'serpentFang'],
};

export const STYLE_JUTSU = {
  taijutsu: ['ironFistRush', 'risingKnee'],
  ninjutsu: ['chakraSurge', 'sealBurst'],
  genjutsu: ['mirrorHaze', 'creepingDread'],
};

export function charDef(id) {
  return CHARACTERS[id];
}
