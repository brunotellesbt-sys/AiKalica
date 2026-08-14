// Mini-linguagem para escrever cenas. Cada função devolve um "nó" que o
// interpretador em src/screens/vn.js executa em ordem.

export const bg = (id, tint = null) => ({ t: 'bg', id, tint });
export const cast = (...ids) => ({ t: 'cast', ids: ids.flat() });
export const say = (who, text, emo = 'neutral') => ({ t: 'say', who, text, emo });
export const narr = (text) => ({ t: 'narr', text });
export const go = (scene) => ({ t: 'go', scene });
export const pause = (ms = 500) => ({ t: 'pause', ms });
export const bgm = (track) => ({ t: 'bgm', track });
export const sound = (name) => ({ t: 'sfx', name });
export const fx = (kind, color) => ({ t: 'fx', kind, color });
export const decision = (text) => ({ t: 'decision', text });

export const chapter = (n, title, subtitle = '') => ({ t: 'chapter', n, title, subtitle });

export const set = (fn) => ({ t: 'set', fn });
export const flag = (k, v = true) => ({ t: 'flag', k, v });
export const bond = (id, n) => ({ t: 'bond', id, n });
export const karma = (o) => ({ t: 'karma', o });
export const give = (item, qty = 1) => ({ t: 'give', item, qty });
export const ryo = (n) => ({ t: 'ryo', n });

export const join = (id, opts = {}) => ({ t: 'join', id, opts });
export const leave = (id) => ({ t: 'leave', id });

export const rest = (text) => ({ t: 'rest', text });
export const shop = (tier) => ({ t: 'shop', tier });
export const heal = (pct = 1) => ({ t: 'heal', pct });

export const ending = (id) => ({ t: 'ending', id });

/**
 * Bloco condicional.
 * @param {*} cond  função(state), nome de flag, ou objeto aceito por check()
 */
export const iff = (cond, then = [], otherwise = []) => ({ t: 'if', cond, then, else: otherwise });

/**
 * Escolha do jogador.
 * options: [{ text, tag, note, cond, hideIfLocked, effects, then, goto }]
 * effects: { flags, bonds, karma, items, ryo }
 */
export const choice = (prompt, options) => ({ t: 'choice', prompt, options });

/**
 * Batalha.
 * cfg: { foes, level, bg, name, boss, objective, noFlee, intro, onWin, onLose, loseGoto, onLoseText }
 * onLose: 'retry' (padrão) | 'continue' | 'goto'
 */
export const battle = (cfg) => ({ t: 'battle', ...cfg });

/** Atalho: fala do protagonista com o nome do jogador. */
export const hero = (text, emo) => say('hero', text, emo);

/** Cria uma cena. */
export const scene = (id, nodes, meta = {}) => ({ id, nodes, ...meta });
