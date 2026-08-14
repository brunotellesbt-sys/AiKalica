// RNG determinístico (mulberry32) — permite replays e testes reproduzíveis.

let _seed = (Date.now() ^ 0x9e3779b9) >>> 0;

function mulberry32() {
  _seed = (_seed + 0x6d2b79f5) >>> 0;
  let t = _seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Define a semente do gerador (útil para testes). */
export function setSeed(n) {
  _seed = (n >>> 0) || 1;
}

/** Float em [0, 1). */
export const rand = () => mulberry32();

/** Inteiro em [min, max] inclusivo. */
export function int(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

/** Float em [min, max). */
export function float(min, max) {
  return rand() * (max - min) + min;
}

/** true com probabilidade p (0..1). */
export function chance(p) {
  return rand() < p;
}

/** Elemento aleatório de um array. */
export function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

/** Escolha ponderada: entries = [[valor, peso], ...]. */
export function weighted(entries) {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  if (total <= 0) return entries[0]?.[0];
  let roll = rand() * total;
  for (const [value, w] of entries) {
    roll -= w;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

/** Embaralha uma cópia do array (Fisher-Yates). */
export function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Variação percentual: 1 ± spread. */
export function variance(spread = 0.1) {
  return 1 + float(-spread, spread);
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
