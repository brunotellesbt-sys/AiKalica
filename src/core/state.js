// Estado global da partida. O objeto `state` é sempre mutado no lugar
// (nunca reatribuído), então qualquer módulo que o importe enxerga a versão atual.

import { newRecord, maxHp, maxCk, grantExp, restore } from '../systems/progression.js';
import { CHARACTERS } from '../data/characters.js';
import { ITEMS } from '../data/items.js';

export const SAVE_VERSION = 1;
export const PARTY_MAX = 4;

export const state = {};

function blank() {
  return {
    version: SAVE_VERSION,
    createdAt: Date.now(),
    savedAt: null,
    playtime: 0,
    hero: { name: 'Ren', element: 'wind', style: 'ninjutsu' },
    roster: {},
    party: [],
    inventory: {},
    ryo: 300,
    flags: {},
    bonds: {},
    karma: { light: 0, dark: 0 },
    chapter: 0,
    chapterTitle: 'Prólogo',
    scene: null,
    log: [],
    choices: [],
    endings: [],
    tally: { battlesWon: 0, battlesLost: 0, choices: 0, jutsuUsed: 0, spared: 0, felled: 0 },
  };
}

/** Substitui o conteúdo de `state` sem trocar a referência. */
export function loadInto(data) {
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, data);
  return state;
}

/** Inicia uma partida nova. */
export function newGame({ name = 'Ren', element = 'wind', style = 'ninjutsu' } = {}) {
  const data = blank();
  data.hero = { name: name.trim().slice(0, 14) || 'Ren', element, style };
  loadInto(data);

  state.roster.hero = newRecord('hero', 1, { name: state.hero.name, element, style });
  state.party = ['hero'];
  state.inventory = { kunai: 3, ration: 3, antidote: 1 };
  return state;
}

// ------------------------------------------------------------------ flags ---
export const flag = (k) => state.flags?.[k];
export const hasFlag = (k) => Boolean(state.flags?.[k]);

export function setFlag(k, v = true) {
  state.flags[k] = v;
  return v;
}

/** Avalia uma condição: função, string de flag, ou objeto { flag, bond, karma, party, item }. */
export function check(cond) {
  if (cond == null) return true;
  if (typeof cond === 'function') return Boolean(cond(state));
  if (typeof cond === 'string') return hasFlag(cond);
  if (Array.isArray(cond)) return cond.every(check);

  if (cond.flag && !hasFlag(cond.flag)) return false;
  if (cond.notFlag && hasFlag(cond.notFlag)) return false;
  if (cond.party && !state.party.includes(cond.party)) return false;
  if (cond.recruited && !state.roster[cond.recruited]) return false;
  if (cond.item && itemCount(cond.item) <= 0) return false;
  if (cond.bond && bond(cond.bond.id) < cond.bond.min) return false;
  if (cond.minBondTotal && bondTotal() < cond.minBondTotal) return false;
  if (cond.karmaLight != null && karmaBalance() < cond.karmaLight) return false;
  if (cond.karmaDark != null && karmaBalance() > -cond.karmaDark) return false;
  if (cond.minLevel && partyLevel() < cond.minLevel) return false;
  return true;
}

// ------------------------------------------------------------------- elos ---
export const bond = (id) => state.bonds?.[id] || 0;

export function addBond(id, n) {
  if (!id || !n) return 0;
  state.bonds[id] = Math.max(0, Math.min(100, bond(id) + n));
  return state.bonds[id];
}

export function bondTotal() {
  return Object.values(state.bonds || {}).reduce((a, b) => a + b, 0);
}

/** Elos em "corações" de 0 a 5. */
export const bondHearts = (id) => Math.floor(bond(id) / 20);

// ------------------------------------------------------------------ karma ---
export function addKarma({ light = 0, dark = 0 } = {}) {
  state.karma.light += light;
  state.karma.dark += dark;
}

/** -1 (sombra) a +1 (luz). */
export function karmaBalance() {
  const { light, dark } = state.karma;
  const total = light + dark;
  if (!total) return 0;
  return (light - dark) / total;
}

export function karmaLabel() {
  const b = karmaBalance();
  if (b >= .55) return 'Vontade de Fogo';
  if (b >= .2) return 'Coração Reto';
  if (b > -.2) return 'Caminho Cinzento';
  if (b > -.55) return 'Sombra Crescente';
  return 'Abraçado pela Escuridão';
}

// ------------------------------------------------------------------ time ----
export function partyRecords() {
  return state.party.map((id) => state.roster[id]).filter(Boolean);
}

export function rosterRecords() {
  return Object.values(state.roster);
}

export function partyLevel() {
  const recs = partyRecords();
  if (!recs.length) return 1;
  return Math.round(recs.reduce((a, r) => a + r.level, 0) / recs.length);
}

/** Adiciona ao elenco (e ao time ativo, se houver espaço). */
export function recruit(id, level = null, extra = {}) {
  if (state.roster[id]) return state.roster[id];
  const lv = level ?? Math.max(1, partyLevel());
  const rec = newRecord(id, lv, extra);
  state.roster[id] = rec;
  if (state.party.length < PARTY_MAX) state.party.push(id);
  if (!(id in state.bonds)) state.bonds[id] = 10;
  return rec;
}

export function joinParty(id) {
  if (!state.roster[id]) return false;
  if (state.party.includes(id)) return true;
  if (state.party.length >= PARTY_MAX) return false;
  state.party.push(id);
  return true;
}

export function leaveParty(id) {
  if (id === 'hero') return false;
  const i = state.party.indexOf(id);
  if (i >= 0) state.party.splice(i, 1);
  return i >= 0;
}

export function setParty(ids) {
  state.party = ['hero', ...ids.filter((i) => i !== 'hero' && state.roster[i])].slice(0, PARTY_MAX);
}

// ------------------------------------------------------------- inventário ---
export const itemCount = (id) => state.inventory?.[id] || 0;

export function addItem(id, n = 1) {
  if (!ITEMS[id]) return 0;
  state.inventory[id] = itemCount(id) + n;
  return state.inventory[id];
}

export function removeItem(id, n = 1) {
  const left = itemCount(id) - n;
  if (left <= 0) delete state.inventory[id];
  else state.inventory[id] = left;
  return Math.max(0, left);
}

export function addRyo(n) {
  state.ryo = Math.max(0, state.ryo + n);
  return state.ryo;
}

/** Equipa um item (devolve o que estava no slot para o inventário). */
export function equip(charId, itemId) {
  const rec = state.roster[charId];
  const it = ITEMS[itemId];
  if (!rec || !it || it.kind !== 'equip') return false;
  const prev = rec.equip[it.slot];
  rec.equip[it.slot] = itemId;
  removeItem(itemId, 1);
  if (prev) addItem(prev, 1);
  // Reajusta HP/chakra atuais aos novos máximos.
  rec.hp = Math.min(rec.hp, maxHp(rec));
  rec.ck = Math.min(rec.ck, maxCk(rec));
  return true;
}

export function unequip(charId, slot) {
  const rec = state.roster[charId];
  if (!rec?.equip?.[slot]) return false;
  addItem(rec.equip[slot], 1);
  rec.equip[slot] = null;
  rec.hp = Math.min(rec.hp, maxHp(rec));
  rec.ck = Math.min(rec.ck, maxCk(rec));
  return true;
}

// ------------------------------------------------------------ progressão ---
/** Distribui EXP para o time ativo. Retorna [{ rec, report }]. */
export function grantPartyExp(amount) {
  return partyRecords().map((rec) => ({ rec, report: grantExp(rec, amount) }));
}

/** Cura completa (descanso). */
export function restParty() {
  for (const rec of rosterRecords()) restore(rec, { hp: 1, ck: 1 });
}

export function healParty(pct = .5) {
  for (const rec of partyRecords()) restore(rec, { hp: pct, ck: pct });
}

// --------------------------------------------------------------- história ---
export function pushLog(entry) {
  state.log.push(entry);
  if (state.log.length > 260) state.log.splice(0, state.log.length - 260);
}

export function recordChoice(sceneId, label, note) {
  state.choices.push({ scene: sceneId, label, note, chapter: state.chapter, at: Date.now() });
  state.tally.choices++;
}

export function unlockEnding(id) {
  if (!state.endings.includes(id)) {
    state.endings.push(id);
    return true;
  }
  return false;
}

/** Nome de exibição de um personagem (o herói usa o nome escolhido). */
export function displayName(id) {
  if (id === 'hero') return state.hero?.name || 'Ren';
  return state.roster[id]?.name || CHARACTERS[id]?.name || id;
}

/** Parâmetros de arte, já com ajustes do herói. */
export function artOf(id) {
  const def = CHARACTERS[id];
  if (!def) return {};
  if (id === 'hero') {
    const elementColor = {
      fire: '#8a3a2a', wind: '#2f6b52', lightning: '#7a6a2a', earth: '#6b5a3a', water: '#2f5a7a',
    }[state.hero?.element] || def.art.outfit;
    return { ...def.art, outfit: elementColor };
  }
  return def.art;
}
