// Motor de batalha por turnos: ordem por velocidade, elementos, status,
// linha de frente/retaguarda, Vontade de Fogo e jutsus combinados.

import { rand, chance, pick, weighted, shuffle, variance, clamp } from '../core/rng.js';
import { JUTSU, TEAM_JUTSU } from '../data/jutsu.js';
import { ITEMS } from '../data/items.js';
import { ENEMIES } from '../data/enemies.js';
import { CHARACTERS, elementMultiplier } from '../data/characters.js';
import { scaleEnemy, statOf, maxHp, maxCk, equipPerk } from './progression.js';
import {
  STATUS, applyStatus, removeStatus, hasStatus, cleanse,
  statusMod, statusSum, damageTakenMult, elementTakenMult, tickStatuses, anyTaunt,
} from './effects.js';

export const WILL_MAX = 100;

const DIFFICULTY = {
  easy:   { foeDmg: .78, foeHp: .85, expMult: 1.15 },
  normal: { foeDmg: 1, foeHp: 1, expMult: 1 },
  hard:   { foeDmg: 1.3, foeHp: 1.25, expMult: 1.3 },
};

let uidSeq = 0;
const uid = () => `u${++uidSeq}`;

// --------------------------------------------------------------- unidades ---
function allyUnit(rec) {
  const def = CHARACTERS[rec.id];
  return {
    uid: uid(),
    side: 'ally',
    id: rec.id,
    rec,
    name: rec.name || def.name,
    level: rec.level,
    element: rec.element || def.element,
    hp: Math.max(0, rec.hp),
    maxHp: maxHp(rec),
    ck: Math.max(0, rec.ck),
    maxCk: maxCk(rec),
    stats: {
      atk: statOf(rec, 'atk'), nin: statOf(rec, 'nin'),
      def: statOf(rec, 'def'), res: statOf(rec, 'res'),
      spd: statOf(rec, 'spd'), luck: statOf(rec, 'luck'),
    },
    jutsu: rec.jutsu.filter((j) => (JUTSU[j]?.lv || 1) <= rec.level),
    status: [],
    row: rec.row || 'front',
    alive: rec.hp > 0,
    passive: def.passive?.id || null,
    art: def.art,
    usedOnce: {},
  };
}

function foeUnit(defId, level, hpMult = 1) {
  const def = ENEMIES[defId];
  if (!def) throw new Error(`Inimigo desconhecido: ${defId}`);
  const s = scaleEnemy(def, level);
  const hp = Math.round(s.hp * hpMult);
  return {
    uid: uid(),
    side: 'foe',
    id: defId,
    def,
    name: def.name,
    title: def.title,
    level,
    element: def.element,
    hp,
    maxHp: hp,
    ck: s.ck,
    maxCk: s.ck,
    stats: { atk: s.atk, nin: s.nin, def: s.def, res: s.res, spd: s.spd, luck: s.luck },
    jutsu: [...def.jutsu],
    status: [],
    row: 'front',
    alive: true,
    ai: def.ai || 'basic',
    boss: Boolean(def.boss),
    // Chefes agem mais de uma vez por rodada — é o que os separa de um saco de HP.
    actions: def.actions ?? (def.boss ? 2 : 1),
    art: def.art,
    immune: def.immuneTo || [],
    usedOnce: {},
  };
}

// ------------------------------------------------------------------ cálculo ---
function effStat(unit, key) {
  const base = unit.stats[key] || 0;
  return Math.max(1, base * (1 + statusMod(unit, key)));
}

function evadeOf(unit) {
  let e = statusSum(unit, 'evade');
  if (unit.passive === 'foresight') e += .12;
  return e;
}

function critOf(unit) {
  let c = .05 + (unit.stats.luck || 0) * .0035 + statusSum(unit, 'crit');
  if (unit.passive === 'foresight') c += .10;
  return clamp(c, 0, .75);
}

function accMod(unit) {
  let m = 0;
  for (const s of unit.status) {
    const v = STATUS[s.id]?.accMod;
    if (typeof v === 'number') m += v;
  }
  return m;
}

/**
 * Calcula o resultado de um golpe.
 * @returns {{hit:boolean, amount:number, crit:boolean, mult:number}}
 */
function computeHit(attacker, defender, j, battle, opts = {}) {
  // --- precisão ---
  if (j.acc < 1) {
    const spdGap = (effStat(defender, 'spd') - effStat(attacker, 'spd')) * .004;
    const chanceToHit = clamp(j.acc + accMod(attacker) - evadeOf(defender) - spdGap, .15, .99);
    if (!chance(chanceToHit)) return { hit: false, amount: 0, crit: false, mult: 1 };
  }

  const atkStat = effStat(attacker, j.stat === 'atk' ? 'atk' : 'nin');
  const defKey = j.stat === 'atk' ? 'def' : 'res';
  const defStat = effStat(defender, defKey) * (1 - (j.pierce || 0));

  let dmg = (j.power / 100) * (atkStat * 2.4 + attacker.level * 2);
  dmg *= 140 / (140 + defStat * 2.2);

  // --- elemento ---
  let mult = 1;
  if (!j.trueElement) {
    mult *= elementMultiplier(j.element, defender.element);
    mult *= elementTakenMult(defender, j.element);
    if (j.element === 'lightning' && hasStatus(defender, 'wet')) {
      const ally = battle.allies.find((u) => u.alive && u.passive === 'tide');
      if (ally && attacker.side === 'ally') mult *= 1.3;
    }
  }
  dmg *= mult;

  // --- posicionamento ---
  if (j.stat === 'atk') {
    if (attacker.row === 'back') dmg *= .78;
    if (defender.row === 'back') dmg *= .82;
  }
  // Passiva do Jin: protege a retaguarda enquanto estiver de pé na frente.
  if (defender.row === 'back' && defender.side === 'ally') {
    const wall = battle.allies.find((u) => u.alive && u.passive === 'bulwark' && u.row === 'front');
    if (wall && wall !== defender) dmg *= .8;
  }

  // --- crítico ---
  let crit = false;
  const critChance = critOf(attacker) + (j.critBoost || 0);
  if (j.critVs && hasStatus(defender, j.critVs)) crit = true;
  else if (chance(critChance)) crit = true;
  if (crit) dmg *= 1.75;

  dmg *= variance(.1);
  dmg *= damageTakenMult(defender);
  if (defender.side === 'foe') dmg *= battle.tuning.playerDmg;
  else dmg *= battle.tuning.foeDmg;
  if (opts.scale) dmg *= opts.scale;

  return { hit: true, amount: Math.max(1, Math.round(dmg)), crit, mult };
}

// ------------------------------------------------------------------ batalha ---
export function createBattle(config) {
  const {
    allies = [],
    foes = [],
    level = 5,
    bg = 'forest',
    name = 'Batalha',
    boss = false,
    noFlee = false,
    difficulty = 'normal',
    objective = null,
    music: track = null,
  } = config;

  const tuning = DIFFICULTY[difficulty] || DIFFICULTY.normal;

  const battle = {
    name, bg, boss, noFlee, objective, track,
    round: 0,
    will: 0,
    allies: allies.map(allyUnit),
    foes: foes.map((f) =>
      foeUnit(typeof f === 'string' ? f : f.id, (typeof f === 'string' ? level : f.level ?? level), tuning.foeHp)
    ),
    tuning: { foeDmg: tuning.foeDmg, playerDmg: 1, expMult: tuning.expMult },
    ended: false,
    result: null,
    turnLog: [],
  };

  battle.units = () => [...battle.allies, ...battle.foes];
  battle.livingAllies = () => battle.allies.filter((u) => u.alive);
  battle.livingFoes = () => battle.foes.filter((u) => u.alive);

  return battle;
}

// --------------------------------------------------------------- alvos ------
export function validTargets(battle, unit, j) {
  const enemies = unit.side === 'ally' ? battle.livingFoes() : battle.livingAllies();
  const friends = unit.side === 'ally' ? battle.livingAllies() : battle.livingFoes();
  const downed = (unit.side === 'ally' ? battle.allies : battle.foes).filter((u) => !u.alive);

  switch (j.target) {
    case 'foe': {
      const taunter = anyTaunt(enemies);
      return taunter ? [taunter] : enemies;
    }
    case 'allFoes': return enemies;
    case 'ally': return friends;
    case 'allAllies': return friends;
    case 'downAlly': return downed;
    case 'self': return [unit];
    default: return enemies;
  }
}

const isMulti = (j) => j.target === 'allFoes' || j.target === 'allAllies';

// ------------------------------------------------------------- resolução ----
function gainWill(battle, amount) {
  const before = battle.will;
  battle.will = clamp(battle.will + amount, 0, WILL_MAX);
  return battle.will - before;
}

function damageUnit(battle, target, amount, ev) {
  target.hp = Math.max(0, target.hp - amount);
  if (target.hp === 0 && target.alive) {
    target.alive = false;
    ev.push({ t: 'down', unit: target });
    if (target.side === 'foe') battle.tally = (battle.tally || 0) + 1;
  }
}

function healUnit(target, amount) {
  const before = target.hp;
  target.hp = Math.min(target.maxHp, target.hp + amount);
  return target.hp - before;
}

function applyEffectList(list, source, target, ev, bonusChance = 0) {
  for (const e of list || []) {
    if (!target.alive) continue;
    if (!chance(clamp((e.chance ?? 1) + bonusChance, 0, 1))) continue;
    const fresh = applyStatus(target, e.status, e.turns ?? 3);
    ev.push({ t: 'status', target, status: e.status, fresh, kind: STATUS[e.status]?.kind });
  }
}

/** Executa uma ação e devolve a lista de eventos para a UI animar. */
export function resolveAction(battle, actor, action) {
  const ev = [];
  if (!actor.alive) return ev;

  // --- impedimentos ---
  for (const s of actor.status) {
    const def = STATUS[s.id];
    if (def?.skipChance && chance(def.skipChance)) {
      ev.push({ t: 'blocked', unit: actor, status: s.id });
      return ev;
    }
  }

  // --- confusão: pode trocar de lado ---
  let confused = false;
  if (hasStatus(actor, 'conf') && chance(STATUS.conf.confuseChance)) confused = true;

  switch (action.kind) {
    case 'flee':      return resolveFlee(battle, actor, ev);
    case 'item':      return resolveItem(battle, actor, action, ev);
    case 'team':      return resolveTeam(battle, actor, action, ev);
    case 'row':
      actor.row = actor.row === 'front' ? 'back' : 'front';
      ev.push({ t: 'log', text: `${actor.name} muda para a ${actor.row === 'front' ? 'linha de frente' : 'retaguarda'}.` });
      return ev;
    default:
      return resolveJutsu(battle, actor, action, ev, confused);
  }
}

function resolveJutsu(battle, actor, action, ev, confused) {
  const j = JUTSU[action.jutsuId] || JUTSU.attack;

  // --- custos ---
  if (j.cost > actor.ck) {
    ev.push({ t: 'log', text: `${actor.name} não tem chakra suficiente!` });
    return ev;
  }
  actor.ck -= j.cost;
  if (j.hpCost) {
    const cost = Math.max(1, Math.round(actor.hp * j.hpCost));
    actor.hp = Math.max(1, actor.hp - cost);
    ev.push({ t: 'damage', target: actor, amount: cost, self: true });
  }

  ev.push({ t: 'announce', unit: actor, jutsu: j });

  // --- alvos ---
  let targets;
  if (confused && (j.target === 'foe' || j.target === 'allFoes')) {
    const friends = (actor.side === 'ally' ? battle.livingAllies() : battle.livingFoes()).filter((u) => u !== actor);
    targets = friends.length ? [pick(friends)] : [actor];
    ev.push({ t: 'confused', unit: actor });
  } else {
    const pool = validTargets(battle, actor, j);
    if (!pool.length) {
      ev.push({ t: 'log', text: 'Sem alvos válidos.' });
      return ev;
    }
    if (isMulti(j) || j.target === 'self') targets = pool;
    else {
      const chosen = action.targets?.map((id) => pool.find((u) => u.uid === id)).filter(Boolean);
      targets = chosen?.length ? chosen : [pick(pool)];
    }
  }

  // --- efeitos no próprio conjurador ---
  if (j.restoreCk) {
    const amt = Math.round(actor.maxCk * j.restoreCk);
    actor.ck = Math.min(actor.maxCk, actor.ck + amt);
    ev.push({ t: 'ck', target: actor, amount: amt });
  }
  if (j.guardCk) {
    const amt = Math.round(actor.maxCk * j.guardCk);
    actor.ck = Math.min(actor.maxCk, actor.ck + amt);
    ev.push({ t: 'ck', target: actor, amount: amt });
  }
  if (j.drainCk) {
    actor.ck = Math.min(actor.maxCk, actor.ck + j.drainCk);
  }
  applyEffectList(j.selfApply, actor, actor, ev);

  // --- cura / reanimação ---
  if (j.kind === 'heal' || j.heal || j.revive) {
    for (const target of targets) {
      if (j.revive) {
        if (target.alive) continue;
        target.alive = true;
        target.hp = Math.round(target.maxHp * j.revive);
        ev.push({ t: 'revive', target, amount: target.hp });
        continue;
      }
      if (!target.alive) continue;
      let power = effStat(actor, 'nin') * (j.heal?.pct ?? 1) * 1.9 + actor.level * 2;
      if (actor.passive === 'medic') power *= 1.25;
      power *= 1 + (actor.rec ? equipPerk(actor.rec, 'healBonus') : 0);
      const healed = healUnit(target, Math.round(power * variance(.08)));
      ev.push({ t: 'heal', target, amount: healed });
      if (j.cleanse || actor.passive === 'medic') {
        const n = j.cleanse ? cleanse(target) : (target.status.find((s) => STATUS[s.id]?.kind === 'bad')
          ? (removeStatus(target, target.status.find((s) => STATUS[s.id]?.kind === 'bad').id), 1) : 0);
        if (n) ev.push({ t: 'cleanse', target, count: n });
      }
    }
    return ev;
  }

  // --- dano ---
  if (j.power > 0) {
    let hits = j.hits || 1;
    if (j.bonusHitWith && hasStatus(actor, j.bonusHitWith)) hits += 1;

    for (const target of targets) {
      if (!target.alive) continue;

      // Substituição anula o golpe inteiro.
      if (hasStatus(target, 'subs')) {
        removeStatus(target, 'subs');
        ev.push({ t: 'substitute', target });
        continue;
      }

      let total = 0;
      let anyCrit = false;
      let mult = 1;
      let landed = 0;

      for (let h = 0; h < hits; h++) {
        const r = computeHit(actor, target, j, battle, { scale: hits > 1 ? 1 : 1 });
        if (!r.hit) {
          ev.push({ t: 'miss', target, index: h });
          continue;
        }
        landed++;
        total += r.amount;
        anyCrit = anyCrit || r.crit;
        mult = r.mult;
        damageUnit(battle, target, r.amount, ev);
        ev.push({
          t: 'damage', target, amount: r.amount, crit: r.crit, mult: r.mult,
          element: j.element, index: h, of: hits,
        });
        if (!target.alive) break;
      }

      if (landed) {
        applyEffectList(j.apply, actor, target, ev);

        // Roubo de vida
        if (j.lifesteal) {
          const healed = healUnit(actor, Math.round(total * j.lifesteal));
          if (healed) ev.push({ t: 'heal', target: actor, amount: healed });
        }
        // Contra-ataque estático
        if (hasStatus(target, 'thorns') && j.stat === 'atk' && actor.alive) {
          const back = Math.max(1, Math.round(total * STATUS.thorns.reflect));
          damageUnit(battle, actor, back, ev);
          ev.push({ t: 'damage', target: actor, amount: back, reflected: true });
        }
        // Vontade de Fogo
        if (actor.side === 'ally') gainWill(battle, Math.round(3 + total / 26));
        else {
          let gain = Math.round(4 + total / 20);
          if (target.passive === 'willFire') gain = Math.round(gain * 1.5);
          gainWill(battle, gain);
        }
      }
    }
    ev.push({ t: 'will', value: battle.will });
  } else {
    // Jutsu de suporte puro sobre os alvos
    for (const target of targets) {
      if (!target.alive) continue;
      applyEffectList(j.apply, actor, target, ev);
    }
  }

  return ev;
}

function resolveItem(battle, actor, action, ev) {
  const item = ITEMS[action.itemId];
  if (!item) return ev;
  ev.push({ t: 'announce', unit: actor, item });

  const eff = item.effect || {};
  const pool = action.targets?.length
    ? action.targets.map((id) => battle.units().find((u) => u.uid === id)).filter(Boolean)
    : (item.target === 'allFoes' ? battle.livingFoes() : [actor]);

  for (const target of pool) {
    if (eff.damage) {
      if (!target.alive) continue;
      const amount = Math.max(1, Math.round(eff.damage * (1 + actor.level * .06) * variance(.12) * damageTakenMult(target)));
      damageUnit(battle, target, amount, ev);
      ev.push({ t: 'damage', target, amount, item: true });
    }
    if (eff.healHp && target.alive) {
      const healed = healUnit(target, eff.healHp);
      ev.push({ t: 'heal', target, amount: healed });
    }
    if (eff.healCk && target.alive) {
      const before = target.ck;
      target.ck = Math.min(target.maxCk, target.ck + eff.healCk);
      ev.push({ t: 'ck', target, amount: target.ck - before });
    }
    if (eff.cure) {
      let n = 0;
      for (const s of eff.cure) if (hasStatus(target, s)) { removeStatus(target, s); n++; }
      if (n) ev.push({ t: 'cleanse', target, count: n });
    }
    if (eff.revive && !target.alive) {
      target.alive = true;
      target.hp = Math.round(target.maxHp * eff.revive);
      ev.push({ t: 'revive', target, amount: target.hp });
    }
    applyEffectList(eff.apply, actor, target, ev);
  }
  if (eff.guaranteeFlee) battle.fleeGuaranteed = true;
  gainWill(battle, 3);
  ev.push({ t: 'will', value: battle.will });
  return ev;
}

function resolveTeam(battle, actor, action, ev) {
  const combo = TEAM_JUTSU[action.teamId];
  if (!combo || battle.will < WILL_MAX) return ev;
  battle.will = 0;

  ev.push({ t: 'announce', unit: actor, team: combo });
  ev.push({ t: 'cinematic', team: combo });

  const j = {
    ...combo, stat: 'nin', acc: 1, cost: 0,
    element: combo.element, hits: 1, pierce: combo.pierce || .3,
  };
  const targets = combo.target === 'allFoes' ? battle.livingFoes() : [battle.livingFoes()[0]].filter(Boolean);

  for (const target of targets) {
    if (!target?.alive) continue;
    const r = computeHit(actor, target, j, battle);
    damageUnit(battle, target, r.amount, ev);
    ev.push({ t: 'damage', target, amount: r.amount, crit: r.crit, mult: r.mult, element: j.element, team: true });
    applyEffectList(combo.apply, actor, target, ev);
  }

  if (combo.healAllies) {
    for (const a of battle.livingAllies()) {
      const healed = healUnit(a, Math.round(a.maxHp * combo.healAllies.pct));
      ev.push({ t: 'heal', target: a, amount: healed });
    }
  }
  ev.push({ t: 'will', value: battle.will });
  return ev;
}

function resolveFlee(battle, actor, ev) {
  if (battle.noFlee) {
    ev.push({ t: 'log', text: 'Não há para onde correr.' });
    return ev;
  }
  const avgFoeSpd = battle.livingFoes().reduce((a, u) => a + effStat(u, 'spd'), 0) / Math.max(1, battle.livingFoes().length);
  const p = battle.fleeGuaranteed ? 1 : clamp(.35 + (effStat(actor, 'spd') - avgFoeSpd) * .02, .15, .9);
  if (chance(p)) {
    battle.ended = true;
    battle.result = 'flee';
    ev.push({ t: 'flee', ok: true });
  } else {
    ev.push({ t: 'flee', ok: false });
  }
  return ev;
}

// ------------------------------------------------------------------- IA -----
export function aiAction(battle, unit) {
  const foes = battle.livingAllies();
  if (!foes.length) return { kind: 'jutsu', jutsuId: 'attack' };

  const affordable = unit.jutsu
    .map((id) => JUTSU[id])
    .filter((j) => j && j.cost <= unit.ck);
  const damaging = affordable.filter((j) => j.power > 0);
  const support = affordable.filter((j) => j.power === 0 && j.kind !== 'heal');
  const heals = affordable.filter((j) => j.kind === 'heal');
  const hpPct = unit.hp / unit.maxHp;

  const pickTarget = () => {
    const taunter = anyTaunt(foes);
    if (taunter) return [taunter.uid];
    if (unit.ai === 'aggressive' || unit.ai === 'boss') {
      const sorted = [...foes].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
      return [sorted[0].uid];
    }
    if (unit.ai === 'ranged') {
      const back = foes.filter((f) => f.row === 'back');
      return [pick(back.length ? back : foes).uid];
    }
    return [pick(foes).uid];
  };

  const strongest = () => damaging.slice().sort((a, b) => (b.power * (b.hits || 1)) - (a.power * (a.hits || 1)))[0];

  switch (unit.ai) {
    case 'passive':
      return chance(.5) ? { kind: 'jutsu', jutsuId: 'guard' } : { kind: 'jutsu', jutsuId: 'attack', targets: pickTarget() };

    case 'boss': {
      // Cura quando estiver mal.
      if (hpPct < .35 && heals.length && chance(.6)) {
        return { kind: 'jutsu', jutsuId: pick(heals).id, targets: [unit.uid] };
      }
      // Prepara o terreno no começo.
      if (battle.round <= 2 && support.length && chance(.55)) {
        return { kind: 'jutsu', jutsuId: pick(support).id, targets: pickTarget() };
      }
      // Fase agressiva abaixo de metade da vida.
      if (hpPct < .5 && damaging.length) {
        const best = strongest();
        if (best && chance(.7)) return { kind: 'jutsu', jutsuId: best.id, targets: pickTarget() };
      }
      if (damaging.length) {
        return {
          kind: 'jutsu',
          jutsuId: weighted(damaging.map((j) => [j.id, Math.max(1, j.power)])),
          targets: pickTarget(),
        };
      }
      return { kind: 'jutsu', jutsuId: 'attack', targets: pickTarget() };
    }

    case 'caster': {
      if (support.length && chance(.22)) {
        return { kind: 'jutsu', jutsuId: pick(support).id, targets: pickTarget() };
      }
      if (damaging.length && chance(.8)) {
        return { kind: 'jutsu', jutsuId: pick(damaging).id, targets: pickTarget() };
      }
      return { kind: 'jutsu', jutsuId: 'attack', targets: pickTarget() };
    }

    case 'aggressive': {
      if (damaging.length && chance(.55)) {
        return { kind: 'jutsu', jutsuId: pick(damaging).id, targets: pickTarget() };
      }
      return { kind: 'jutsu', jutsuId: 'attack', targets: pickTarget() };
    }

    default: {
      if (hpPct < .25 && chance(.25)) return { kind: 'jutsu', jutsuId: 'guard' };
      if (damaging.length && chance(.35)) {
        return { kind: 'jutsu', jutsuId: pick(damaging).id, targets: pickTarget() };
      }
      return { kind: 'jutsu', jutsuId: 'attack', targets: pickTarget() };
    }
  }
}

// ------------------------------------------------------------ ordem/turnos ---
export function turnOrder(battle) {
  const slots = [];
  for (const u of battle.units()) {
    if (!u.alive) continue;
    for (let i = 0; i < (u.actions || 1); i++) slots.push(u);
  }
  return shuffle(slots)
    .map((u) => ({ u, key: effStat(u, 'spd') * (0.9 + rand() * 0.2) }))
    .sort((a, b) => b.key - a.key)
    .map((x) => x.u);
}

/** Fim de rodada: status, regeneração de equipamento, contagem. */
export function endRound(battle) {
  const ev = [];
  for (const u of battle.units()) {
    if (!u.alive) continue;
    const { events } = tickStatuses(u);
    for (const e of events) {
      ev.push({
        t: e.type === 'dot' ? 'dot' : 'hot',
        target: e.unit, amount: e.amount, status: e.status,
      });
      if (!e.unit.alive) ev.push({ t: 'down', unit: e.unit });
    }
    if (u.rec) {
      const regen = equipPerk(u.rec, 'regenCk');
      if (regen && u.alive) {
        const before = u.ck;
        u.ck = Math.min(u.maxCk, u.ck + regen);
        if (u.ck > before) ev.push({ t: 'ck', target: u, amount: u.ck - before, quiet: true });
      }
    }
  }
  return ev;
}

/** Verifica fim de batalha e objetivos alternativos. */
export function checkEnd(battle) {
  if (battle.ended) return battle.result;

  const obj = battle.objective;
  if (obj) {
    if (obj.damageThreshold) {
      const boss = battle.foes[0];
      if (boss && boss.hp / boss.maxHp <= obj.damageThreshold) {
        battle.ended = true;
        return (battle.result = 'win');
      }
    }
    if (obj.survive && battle.round > obj.survive) {
      battle.ended = true;
      return (battle.result = 'win');
    }
  }

  if (!battle.livingFoes().length) {
    battle.ended = true;
    return (battle.result = 'win');
  }
  if (!battle.livingAllies().length) {
    battle.ended = true;
    return (battle.result = 'lose');
  }
  return null;
}

/** Combos disponíveis agora. */
export function availableTeamJutsu(battle) {
  if (battle.will < WILL_MAX) return [];
  const alive = battle.livingAllies().map((u) => u.id);
  return Object.values(TEAM_JUTSU).filter((c) => c.members.every((m) => alive.includes(m)));
}

/** Recompensas ao vencer. */
export function battleRewards(battle) {
  let exp = 0;
  let ryo = 0;
  const drops = [];
  for (const f of battle.foes) {
    exp += Math.round((f.def.exp || 10) * Math.pow(1.05, f.level - f.def.lv));
    ryo += f.def.ryo || 0;
    for (const d of f.def.drops || []) {
      if (chance(d.chance)) drops.push(d.id);
    }
  }
  return {
    exp: Math.round(exp * battle.tuning.expMult),
    ryo: Math.round(ryo * (0.9 + rand() * 0.3)),
    drops,
  };
}

/** Escreve HP/chakra finais de volta nas fichas persistentes. */
export function syncBackToRecords(battle) {
  for (const u of battle.allies) {
    if (!u.rec) continue;
    u.rec.hp = u.alive ? Math.max(1, u.hp) : 0;
    u.rec.ck = u.ck;
    u.rec.row = u.row;
  }
}
