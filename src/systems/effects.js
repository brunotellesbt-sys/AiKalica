// Efeitos de status: definição, modificadores e resolução por turno.

export const STATUS = {
  // ------------------------------ negativos ------------------------------
  poison: {
    id: 'poison', name: 'Veneno', icon: '☠', kind: 'bad',
    desc: 'Perde 8% do HP máximo por turno.',
    tick: { dmgPctMax: .08 },
  },
  burn: {
    id: 'burn', name: 'Queimadura', icon: '🔥', kind: 'bad',
    desc: 'Perde 6% do HP máximo por turno e ataca 20% mais fraco.',
    tick: { dmgPctMax: .06 }, mods: { atk: -.2 },
  },
  para: {
    id: 'para', name: 'Paralisia', icon: '⚡', kind: 'bad',
    desc: '35% de chance de perder o turno; velocidade reduzida.',
    skipChance: .35, mods: { spd: -.4 },
  },
  bind: {
    id: 'bind', name: 'Imobilizado', icon: '⛓', kind: 'bad',
    desc: 'Não consegue agir.',
    skipChance: 1,
  },
  wet: {
    id: 'wet', name: 'Encharcado', icon: '💧', kind: 'bad',
    desc: 'Recebe +35% de dano de Raio e -25% de Fogo.',
    elemTaken: { lightning: 1.35, fire: .75 },
  },
  conf: {
    id: 'conf', name: 'Confuso', icon: '💫', kind: 'bad',
    desc: '40% de chance de atacar o próprio time.',
    confuseChance: .4,
  },
  blind: {
    id: 'blind', name: 'Cegueira', icon: '🌫', kind: 'bad',
    desc: '-30% de precisão.',
    accMod: -.3,
  },
  atkdn: {
    id: 'atkdn', name: 'Ataque abaixo', icon: '▼', kind: 'bad',
    desc: '-25% de Taijutsu e Ninjutsu.',
    mods: { atk: -.25, nin: -.25 },
  },
  defdn: {
    id: 'defdn', name: 'Defesa abaixo', icon: '▽', kind: 'bad',
    desc: '-30% de Defesa e Resistência.',
    mods: { def: -.3, res: -.3 },
  },

  // ------------------------------ positivos ------------------------------
  guard: {
    id: 'guard', name: 'Defendendo', icon: '🛡', kind: 'good',
    desc: 'Recebe metade do dano neste turno.',
    dmgTaken: .5,
  },
  subs: {
    id: 'subs', name: 'Substituição', icon: '🌲', kind: 'good',
    desc: 'Anula completamente o próximo ataque recebido.',
    negateNext: true,
  },
  clones: {
    id: 'clones', name: 'Clones', icon: '👥', kind: 'good',
    desc: '+50% de ataque e +25% de esquiva.',
    mods: { atk: .5 }, evade: .25,
  },
  focus: {
    id: 'focus', name: 'Foco', icon: '👁', kind: 'good',
    desc: '+35% de esquiva e +25% de crítico.',
    evade: .35, crit: .25,
  },
  rage: {
    id: 'rage', name: 'Manto', icon: '🟥', kind: 'good',
    desc: '+80% de ataque, mas -20% de defesa.',
    mods: { atk: .8, def: -.2 },
  },
  regen: {
    id: 'regen', name: 'Regeneração', icon: '💚', kind: 'good',
    desc: 'Recupera 9% do HP máximo por turno.',
    tick: { healPctMax: .09 },
  },
  atkup: {
    id: 'atkup', name: 'Ataque acima', icon: '▲', kind: 'good',
    desc: '+30% de Taijutsu e Ninjutsu.',
    mods: { atk: .3, nin: .3 },
  },
  defup: {
    id: 'defup', name: 'Defesa acima', icon: '△', kind: 'good',
    desc: '+45% de Defesa e Resistência.',
    mods: { def: .45, res: .45 },
  },
  haste: {
    id: 'haste', name: 'Ventania', icon: '💨', kind: 'good',
    desc: '+40% de velocidade e +25% de esquiva.',
    mods: { spd: .4 }, evade: .25,
  },
  thorns: {
    id: 'thorns', name: 'Estático', icon: '✨', kind: 'good',
    desc: 'Devolve 35% do dano físico recebido.',
    reflect: .35,
  },
  taunt: {
    id: 'taunt', name: 'Provocação', icon: '🎯', kind: 'good',
    desc: 'Atrai os ataques inimigos e recebe 40% menos dano.',
    taunt: true, dmgTaken: .6,
  },
};

export const statusDef = (id) => STATUS[id];

/** Adiciona (ou renova) um status na unidade. */
export function applyStatus(unit, id, turns = 3) {
  const def = STATUS[id];
  if (!def) return false;
  if (unit.immune?.includes(id)) return false;
  const existing = unit.status.find((s) => s.id === id);
  if (existing) {
    existing.turns = Math.max(existing.turns, turns);
    return false; // renovado, não é "novo"
  }
  unit.status.push({ id, turns });
  return true;
}

export function removeStatus(unit, id) {
  const i = unit.status.findIndex((s) => s.id === id);
  if (i >= 0) unit.status.splice(i, 1);
}

export function hasStatus(unit, id) {
  return unit.status.some((s) => s.id === id);
}

/** Remove todos os status negativos. Retorna quantos foram removidos. */
export function cleanse(unit) {
  const before = unit.status.length;
  unit.status = unit.status.filter((s) => STATUS[s.id]?.kind !== 'bad');
  return before - unit.status.length;
}

/** Soma os modificadores multiplicativos de um atributo (ex.: 'atk'). */
export function statusMod(unit, key) {
  let m = 0;
  for (const s of unit.status) {
    const v = STATUS[s.id]?.mods?.[key];
    if (v) m += v;
  }
  return m;
}

/** Soma um campo escalar dos status ativos (evade, crit, reflect...). */
export function statusSum(unit, key) {
  let m = 0;
  for (const s of unit.status) {
    const v = STATUS[s.id]?.[key];
    if (typeof v === 'number') m += v;
  }
  return m;
}

/** Produto dos multiplicadores de dano recebido. */
export function damageTakenMult(unit) {
  let m = 1;
  for (const s of unit.status) {
    const v = STATUS[s.id]?.dmgTaken;
    if (typeof v === 'number') m *= v;
  }
  return m;
}

/** Multiplicador extra por elemento recebido (ex.: molhado x raio). */
export function elementTakenMult(unit, element) {
  let m = 1;
  for (const s of unit.status) {
    const v = STATUS[s.id]?.elemTaken?.[element];
    if (typeof v === 'number') m *= v;
  }
  return m;
}

export function anyTaunt(units) {
  return units.find((u) => u.alive && hasStatus(u, 'taunt'));
}

/**
 * Processa o fim de turno de uma unidade: dano/cura contínuos e contagem.
 * @returns {{events: Array, expired: Array}}
 */
export function tickStatuses(unit) {
  const events = [];
  const expired = [];

  for (const s of [...unit.status]) {
    const def = STATUS[s.id];
    if (!def) continue;

    if (def.tick?.dmgPctMax) {
      const dmg = Math.max(1, Math.round(unit.maxHp * def.tick.dmgPctMax));
      unit.hp = Math.max(0, unit.hp - dmg);
      events.push({ type: 'dot', unit, status: s.id, amount: dmg, icon: def.icon });
      if (unit.hp === 0) unit.alive = false;
    }
    if (def.tick?.healPctMax && unit.alive) {
      const heal = Math.round(unit.maxHp * def.tick.healPctMax);
      const before = unit.hp;
      unit.hp = Math.min(unit.maxHp, unit.hp + heal);
      if (unit.hp > before) {
        events.push({ type: 'hot', unit, status: s.id, amount: unit.hp - before, icon: def.icon });
      }
    }

    s.turns -= 1;
    if (s.turns <= 0) {
      removeStatus(unit, s.id);
      expired.push(s.id);
    }
  }

  return { events, expired };
}
