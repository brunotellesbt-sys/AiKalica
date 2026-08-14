// Níveis, atributos derivados e criação de fichas de combate.

import { CHARACTERS, STYLES, STATS, HERO_JUTSU, STYLE_JUTSU } from '../data/characters.js';
import { ITEMS } from '../data/items.js';
import { JUTSU } from '../data/jutsu.js';

export const MAX_LEVEL = 40;

/** EXP necessária para sair do nível `level`. */
export function expToNext(level) {
  if (level >= MAX_LEVEL) return Infinity;
  return Math.floor(26 * Math.pow(level, 1.58)) + 24;
}

/** Cria a ficha persistente de um personagem. */
export function newRecord(id, level = 1, extra = {}) {
  const def = CHARACTERS[id];
  if (!def) throw new Error(`Personagem desconhecido: ${id}`);

  const rec = {
    id,
    name: extra.name || def.name,
    level: 1,
    exp: 0,
    element: extra.element || def.element,
    style: extra.style || null,
    jutsu: [...(def.jutsu || [])],
    equip: { weapon: null, armor: null, charm: null },
    row: extra.row || 'front',
    hp: 0, ck: 0,
  };

  if (id === 'hero') {
    rec.jutsu = [
      ...(HERO_JUTSU[rec.element] || []),
      ...(STYLE_JUTSU[rec.style] || []),
    ];
  }

  // Sobe até o nível pedido para aplicar todos os ganhos.
  while (rec.level < level) rec.level++;
  rec.hp = maxHp(rec);
  rec.ck = maxCk(rec);
  return rec;
}

function styleMods(rec) {
  return rec.style ? STYLES[rec.style]?.mods || {} : {};
}
function styleGrowth(rec) {
  return rec.style ? STYLES[rec.style]?.growthMods || {} : {};
}

/** Bônus somado por todos os equipamentos. */
export function equipBonus(rec, key) {
  let sum = 0;
  for (const slot of Object.values(rec.equip || {})) {
    const it = ITEMS[slot];
    if (it?.stats?.[key]) sum += it.stats[key];
  }
  return sum;
}

/** Soma um campo especial dos equipamentos (expBonus, healBonus, regenCk). */
export function equipPerk(rec, key) {
  let sum = 0;
  for (const slot of Object.values(rec.equip || {})) {
    const it = ITEMS[slot];
    if (typeof it?.[key] === 'number') sum += it[key];
  }
  return sum;
}

/** Valor final de um atributo (base + crescimento + estilo + equipamento). */
export function statOf(rec, key) {
  const def = CHARACTERS[rec.id];
  if (!def) return 0;
  const lv = rec.level - 1;
  const base = def.base[key] || 0;
  const growth = (def.growth[key] || 0) + (styleGrowth(rec)[key] || 0);
  const style = styleMods(rec)[key] || 0;
  const value = base + growth * lv + style + equipBonus(rec, key);
  return Math.max(key === 'hp' ? 1 : 0, Math.round(value));
}

export const maxHp = (rec) => statOf(rec, 'hp');
export const maxCk = (rec) => statOf(rec, 'ck');

/** Todos os atributos de uma vez. */
export function allStats(rec) {
  const out = {};
  for (const k of STATS) out[k] = statOf(rec, k);
  return out;
}

/** Jutsus liberados no nível atual. */
export function knownJutsu(rec) {
  return (rec.jutsu || [])
    .map((id) => JUTSU[id])
    .filter(Boolean)
    .filter((j) => (j.lv || 1) <= rec.level);
}

/** Jutsus que ainda vão ser aprendidos. */
export function upcomingJutsu(rec) {
  return (rec.jutsu || [])
    .map((id) => JUTSU[id])
    .filter(Boolean)
    .filter((j) => (j.lv || 1) > rec.level)
    .sort((a, b) => (a.lv || 1) - (b.lv || 1));
}

/**
 * Concede EXP. Sobe de nível, cura a diferença de HP máximo e devolve o relatório.
 * @returns {{levels:number, learned:Array<object>, from:number, to:number}}
 */
export function grantExp(rec, amount) {
  const bonus = 1 + equipPerk(rec, 'expBonus');
  let exp = Math.max(0, Math.round(amount * bonus));
  const from = rec.level;
  const learned = [];

  rec.exp += exp;
  while (rec.level < MAX_LEVEL && rec.exp >= expToNext(rec.level)) {
    rec.exp -= expToNext(rec.level);
    const hpBefore = maxHp(rec);
    const ckBefore = maxCk(rec);
    rec.level++;
    // Ganho de nível já cura a diferença de máximos.
    rec.hp += maxHp(rec) - hpBefore;
    rec.ck += maxCk(rec) - ckBefore;
    for (const j of rec.jutsu) {
      if (JUTSU[j]?.lv === rec.level) learned.push(JUTSU[j]);
    }
  }
  if (rec.level >= MAX_LEVEL) rec.exp = 0;

  return { levels: rec.level - from, learned, from, to: rec.level, gained: exp };
}

/** Restaura HP/chakra de uma ficha. */
export function restore(rec, { hp = 1, ck = 1 } = {}) {
  rec.hp = Math.min(maxHp(rec), Math.round(rec.hp + maxHp(rec) * hp));
  rec.ck = Math.min(maxCk(rec), Math.round(rec.ck + maxCk(rec) * ck));
  if (rec.hp <= 0) rec.hp = 1;
}

/** Escala a ficha de um inimigo para o nível do encontro. */
export function scaleEnemy(def, level) {
  const delta = level - def.lv;
  const f = Math.pow(1.085, delta);
  const out = {};
  for (const k of STATS) {
    const v = def.stats[k] || 0;
    out[k] = Math.max(0, Math.round(k === 'luck' ? v + delta * 0.4 : v * f));
  }
  return out;
}

/** Nível sugerido para o inimigo com base no nível médio do time. */
export function encounterLevel(def, partyLevel, offset = 0) {
  const target = Math.round(partyLevel + offset);
  // Chefes nunca ficam abaixo do nível de projeto; comuns nunca muito acima.
  if (def.boss) return Math.max(def.lv, target);
  return Math.max(1, Math.min(def.lv + 6, Math.max(def.lv - 2, target)));
}
