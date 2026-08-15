// Interpretador de cenas (visual novel): desenha o palco, escreve diálogos,
// resolve escolhas e chama batalhas.

import {
  el, svgNode, clear, wait, mount, typewriter, onAdvance, modal, toast, flash, shake,
} from '../core/ui.js';
import { sfx, music, unlock } from '../core/audio.js';
import { settings, autosave } from '../core/save.js';
import { portraitNode, backgroundNode } from '../art/assets.js';
import { CHARACTERS } from '../data/characters.js';
import { ENEMIES } from '../data/enemies.js';
import { ITEMS } from '../data/items.js';
import { EXTRA_CAST } from '../data/story/cast.js';
import { SCENES } from '../data/story/index.js';
import {
  state, check, setFlag, addBond, addKarma, addItem, addRyo, recruit, joinParty,
  leaveParty, displayName, artOf, pushLog, recordChoice, unlockEnding, restParty, healParty,
  partyLevel,
} from '../core/state.js';
import { runBattle } from './battle-ui.js';
import { openMenu, openShop } from './menu.js';
import { openOverworld } from './overworld.js';
import { showEnding } from './ending.js';

let ui = null;
let stage = [];   // ids atualmente no palco

/** Substitui marcadores de texto ({hero}) pelos valores da partida. */
function interp(text) {
  return String(text ?? '').replace(/\{hero\}/g, () => displayName('hero'));
}

/** Uma janela (menu, modal, escolha) está aberta na frente da VN? */
function overlayOpen() {
  return Boolean(document.querySelector('.menu-screen, .modal-wrap, .vn-choices, .battle'));
}

// ------------------------------------------------------------------- palco ---
function speakerOf(who) {
  if (!who) return { name: '', art: null, id: null };
  if (typeof who === 'object') return { name: who.name || '', art: who.art || null, id: who.id || null };
  if (who === 'hero') return { name: displayName('hero'), art: artOf('hero'), id: 'hero' };
  if (CHARACTERS[who]) return { name: displayName(who), art: artOf(who), id: who };
  if (ENEMIES[who]) return { name: ENEMIES[who].name, art: ENEMIES[who].art, id: who };
  if (EXTRA_CAST[who]) return { name: EXTRA_CAST[who].name, art: EXTRA_CAST[who].art, id: who };
  return { name: String(who), art: null, id: null };
}

function buildUI() {
  const bgEl = el('div.vn-bg');
  const castEl = el('div.vn-cast');
  const nameEl = el('div.vn-name');
  const textEl = el('div.vn-text');
  const nextEl = el('div.vn-next', { text: '▼' });
  const box = el('div.vn-box', {}, [nameEl, textEl, nextEl]);

  const chapterEl = el('div.vn-chapter', { text: '' });
  const topbar = el('div.vn-topbar', {}, [
    chapterEl,
    el('div.spacer'),
    el('button.icon-btn', { text: '📖', title: 'Histórico (L)', onClick: showHistory }),
    el('button.icon-btn', { text: '☰', title: 'Menu (M)', onClick: () => openMenu() }),
  ]);

  const root = el('div.vn', {}, [bgEl, el('div.vn-vignette'), castEl, topbar, box]);

  // Atalhos globais: M abre o menu, L abre o histórico.
  document.addEventListener('keydown', (e) => {
    if (!root.isConnected || overlayOpen() || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'm') { e.preventDefault(); openMenu(); }
    else if (k === 'l') { e.preventDefault(); showHistory(); }
  });

  return { root, bgEl, castEl, box, nameEl, textEl, nextEl, chapterEl };
}

async function ensureMounted() {
  if (!ui) ui = buildUI();
  if (!ui.root.isConnected) await mount(ui.root);
  ui.chapterEl.textContent = state.chapterTitle || '';
  return ui;
}

function setBackground(id, tint) {
  const fresh = el('div.vn-bg');
  fresh.append(backgroundNode(id, tint ? { tint, tintOpacity: .35 } : {}));
  fresh.style.opacity = '0';
  ui.root.insertBefore(fresh, ui.bgEl.nextSibling);
  requestAnimationFrame(() => { fresh.style.opacity = '1'; });
  const old = ui.bgEl;
  ui.bgEl = fresh;
  setTimeout(() => old.remove(), 560);
  state.bg = id;
}

function syncCast(ids) {
  stage = ids.filter((id) => speakerOf(id).art).slice(0, 4);
  clear(ui.castEl);
  for (const id of stage) {
    const sp = speakerOf(id);
    const node = el('div.vn-actor', { dataset: { id } });
    node.append(portraitNode(id, 'neutral', { art: sp.art, element: state.hero?.element, alt: sp.name }));
    ui.castEl.append(node);
  }
}

function ensureOnStage(id) {
  if (!id || stage.includes(id)) return;
  if (!speakerOf(id).art) return;
  if (stage.length >= 3) stage.shift();
  syncCast([...stage, id]);
}

function highlight(id, emo) {
  for (const node of ui.castEl.children) {
    const on = node.dataset.id === id;
    node.classList.toggle('speaking', on);
    if (on) {
      const sp = speakerOf(id);
      clear(node);
      node.append(portraitNode(id, emo || 'neutral', { art: sp.art, element: state.hero?.element, alt: sp.name }));
    }
  }
}

// --------------------------------------------------------------- histórico ---
function showHistory() {
  sfx('page');
  const list = el('div.log-list');
  const items = state.log.slice(-70);
  if (!items.length) list.append(el('p.muted', { text: 'Nada registrado ainda.' }));
  for (const e of items) {
    if (e.k === 'say') list.append(el('div.log-item', { html: `<b>${e.who}:</b> ${escapeHtml(e.text)}` }));
    else if (e.k === 'choice') list.append(el('div.log-item.pick', { text: `▸ ${e.text}` }));
    else list.append(el('div.log-item.narr', { text: e.text }));
  }
  const wrap = el('div', { style: { maxHeight: '52vh', overflowY: 'auto' } }, [list]);
  modal({ title: 'Histórico', body: wrap, buttons: [{ label: 'Fechar', value: null, primary: true }] });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ------------------------------------------------------------------ falas ---
function showLine({ name, text, emo, narration }) {
  return new Promise((resolve) => {
    ui.box.classList.toggle('narration', Boolean(narration));
    ui.nameEl.style.display = name ? '' : 'none';
    ui.nameEl.textContent = name || '';
    ui.nextEl.style.visibility = 'hidden';

    // Atenção: 0 é um valor válido ("instantânea"), então não dá para usar `||`.
    const raw = Number(settings.textSpeed);
    const tw = typewriter(ui.textEl, text, Number.isFinite(raw) ? raw : 22);
    let blipTimer = setInterval(() => sfx('blip'), 70);

    const finish = () => {
      clearInterval(blipTimer);
      ui.nextEl.style.visibility = 'visible';
    };

    let done = false;
    const off = onAdvance(ui.box, () => {
      if (!done && !tw.finished) {
        tw.skip();
        finish();
        done = true;
        return;
      }
      off();
      clearInterval(blipTimer);
      sfx('page');
      resolve();
    });

    tw.done.then(() => {
      done = true;
      finish();
      if (settings.autoAdvance) {
        setTimeout(() => {
          if (ui.textEl.textContent === text) { off(); resolve(); }
        }, 900 + text.length * 18);
      }
    });
  });
}

// --------------------------------------------------------------- escolhas ---
function applyEffects(fx) {
  if (!fx) return;
  for (const [k, v] of Object.entries(fx.flags || {})) setFlag(k, v);
  for (const [id, n] of Object.entries(fx.bonds || {})) {
    addBond(id, n);
    if (n > 0) sfx('bond');
  }
  if (fx.karma) addKarma(fx.karma);
  for (const [id, n] of Object.entries(fx.items || {})) addItem(id, n);
  if (fx.ryo) addRyo(fx.ryo);
  if (typeof fx.run === 'function') fx.run(state);
}

function showChoice(node) {
  return new Promise((resolve) => {
    sfx('choice');
    const wrap = el('div.vn-choices');
    if (node.prompt) wrap.append(el('div.prompt', { text: interp(node.prompt) }));

    const options = node.options.filter((o) => !(o.hideIfLocked && !check(o.cond)));

    for (const opt of options) {
      const ok = check(opt.cond);
      const btn = el(`button.btn.choice-btn${ok ? '' : '.locked'}`, {
        disabled: !ok,
        onClick: () => {
          if (!ok) return;
          sfx('confirm');
          wrap.remove();
          resolve(opt);
        },
      }, [
        el('span', { text: interp(opt.text) }),
        opt.tag ? el('span.tag.' + (opt.tagKind || 'bond'), { text: opt.tag }) : null,
        !ok && opt.lockedNote ? el('span.tag.locked', { text: opt.lockedNote }) : null,
      ]);
      wrap.append(btn);
    }

    ui.root.append(wrap);
    wrap.querySelector('.choice-btn:not(.locked)')?.focus();
  });
}

function decisionFlash(text) {
  const d = el('div.decision-flash', { text });
  ui.root.append(d);
  setTimeout(() => d.remove(), 1800);
}

// ------------------------------------------------------------ cartão de cap ---
async function chapterCard(n, title, subtitle) {
  const card = el('div.chapter-card', {}, [
    el('div.kicker', { text: n === 0 ? 'Prólogo' : `Capítulo ${n}` }),
    el('h2', { text: title }),
    el('div.rule'),
    subtitle ? el('p.muted', { style: { maxWidth: '520px', lineHeight: '1.6' }, text: subtitle }) : null,
  ]);
  ui.root.append(card);
  sfx('page');
  await wait(2100);
  card.style.transition = 'opacity 500ms ease';
  card.style.opacity = '0';
  await wait(520);
  card.remove();
}

// ------------------------------------------------------------- interpretador ---
let queue = [];

function loadScene(id) {
  const sc = SCENES[id];
  if (!sc) {
    console.error('Cena inexistente:', id);
    return false;
  }
  state.scene = id;
  queue = [...sc.nodes];
  if (sc.bg) queue.unshift({ t: 'bg', id: sc.bg, tint: sc.tint });
  if (sc.music) queue.unshift({ t: 'bgm', track: sc.music });
  autosave();
  return true;
}

async function runBattleNode(node) {
  const cfg = {
    foes: node.foes,
    level: node.level ?? Math.max(1, partyLevel()),
    bg: node.bg || state.bg || 'forest',
    name: node.name || 'Batalha',
    boss: node.boss,
    noFlee: node.noFlee,
    objective: node.objective,
    intro: node.intro,
    onLoseText: node.onLoseText,
  };

  for (;;) {
    const { result } = await runBattle(cfg);
    await ensureMounted();
    music(node.afterMusic || SCENES[state.scene]?.music || null);

    if (result === 'win' || result === 'flee') {
      if (result === 'flee' && node.onFleeGoto) return node.onFleeGoto;
      return null;
    }

    // derrota
    if (node.onLose === 'continue') return null;
    if (node.onLose === 'goto' && node.loseGoto) return node.loseGoto;

    const again = await modal({
      title: 'O time caiu',
      body: node.onLoseText
        || 'Vocês perderam a consciência. Alguém arrastou o time para fora do campo a tempo. Quer tentar de novo?',
      dismissable: false,
      buttons: [
        { label: 'Tentar de novo', value: 'retry', primary: true },
        { label: 'Voltar ao título', value: 'title' },
      ],
    });
    if (again === 'title') return '@title';
    // Repetir a luta só é justo com o time inteiro de pé.
    restParty();
  }
}

async function exec(node) {
  switch (node.t) {
    case 'bg':
      setBackground(node.id, node.tint);
      await wait(220);
      return null;

    case 'bgm':
      music(node.track);
      return null;

    case 'sfx':
      sfx(node.name);
      return null;

    case 'fx':
      if (node.kind === 'flash') flash(node.color || '#fff');
      else if (node.kind === 'shake') shake();
      else if (node.kind === 'dark') { sfx('dark'); flash('#3a1050', 700); }
      await wait(320);
      return null;

    case 'pause':
      await wait(node.ms);
      return null;

    case 'cast':
      syncCast(node.ids);
      return null;

    case 'chapter':
      state.chapter = node.n;
      state.chapterTitle = node.n === 0 ? node.title : `Cap. ${node.n} — ${node.title}`;
      ui.chapterEl.textContent = state.chapterTitle;
      autosave();
      await chapterCard(node.n, node.title, node.subtitle);
      return null;

    case 'say': {
      const sp = speakerOf(node.who);
      const text = interp(node.text);
      ensureOnStage(sp.id);
      highlight(sp.id, node.emo);
      pushLog({ k: 'say', who: sp.name, text });
      await showLine({ name: sp.name, text, emo: node.emo });
      return null;
    }

    case 'narr': {
      const text = interp(node.text);
      highlight(null);
      pushLog({ k: 'narr', text });
      await showLine({ text, narration: true });
      return null;
    }

    case 'decision':
      decisionFlash(node.text);
      sfx('choice');
      await wait(1200);
      return null;

    case 'set':
      node.fn?.(state);
      return null;

    case 'flag':
      setFlag(node.k, node.v);
      return null;

    case 'bond':
      addBond(node.id, node.n);
      if (node.n > 0) toast(`Elo com ${displayName(node.id)} fortalecido`, 'good');
      else if (node.n < 0) toast(`Elo com ${displayName(node.id)} abalado`, 'bad');
      return null;

    case 'karma':
      addKarma(node.o);
      return null;

    case 'give':
      addItem(node.item, node.qty);
      toast(`${ITEMS[node.item]?.icon || '•'} ${ITEMS[node.item]?.name || node.item} ×${node.qty}`, 'good');
      return null;

    case 'ryo':
      addRyo(node.n);
      toast(`${node.n >= 0 ? '+' : ''}${node.n} ryo`, node.n >= 0 ? 'good' : 'bad');
      return null;

    case 'join': {
      const fresh = !state.roster[node.id];
      recruit(node.id, node.opts?.level ?? null, node.opts || {});
      const active = joinParty(node.id);
      if (fresh) {
        sfx('bond');
        // Com o grupo cheio o recruta fica de reserva — avisar evita a
        // confusão de "entrou no time mas não aparece na batalha".
        toast(
          active
            ? `${displayName(node.id)} entrou para o time!`
            : `${displayName(node.id)} está disponível — troque o grupo no menu (M)`,
          active ? 'good' : 'info',
        );
        await wait(400);
      }
      return null;
    }

    case 'leave':
      leaveParty(node.id);
      return null;

    case 'rest':
      restParty();
      sfx('heal');
      toast(node.text || 'Time totalmente recuperado', 'good');
      await wait(500);
      return null;

    case 'heal':
      healParty(node.pct);
      sfx('heal');
      toast('Ferimentos tratados', 'good');
      return null;

    case 'shop':
      await openShop(node.tier ?? Math.max(1, state.chapter));
      await ensureMounted();
      return null;

    case 'hub': {
      const chosen = await openOverworld({ tier: node.tier, title: node.title });
      await ensureMounted();

      if (chosen?.scene) {
        // Toca a cena de elo e reabre o Intervalo logo depois, para o jogador
        // poder conversar com mais de um companheiro na mesma parada.
        const s = chosen.scene;
        queue.unshift(
          ...(s.music ? [{ t: 'bgm', track: s.music }] : []),
          ...(s.bg ? [{ t: 'bg', id: s.bg }] : []),
          ...s.nodes,
          { t: 'hub', tier: node.tier, title: node.title },
        );
        return null;
      }

      // Volta o cenário e a trilha da cena atual, que a conversa pode ter trocado.
      const sc = SCENES[state.scene];
      if (sc?.bg) setBackground(sc.bg, sc.tint);
      music(sc?.music || null);
      autosave();
      return null;
    }

    case 'if': {
      const branch = check(node.cond) ? node.then : node.else;
      queue.unshift(...(branch || []));
      return null;
    }

    case 'choice': {
      const opt = await showChoice(node);
      recordChoice(state.scene, opt.text, opt.note);
      pushLog({ k: 'choice', text: opt.text });
      applyEffects(opt.effects);
      if (opt.decision) decisionFlash(opt.decision);
      if (opt.then?.length) queue.unshift(...opt.then);
      if (opt.goto) return opt.goto;
      return null;
    }

    case 'battle': {
      const jump = await runBattleNode(node);
      autosave();
      if (jump) return jump;
      if (node.then?.length) queue.unshift(...node.then);
      return null;
    }

    case 'ending':
      unlockEnding(node.id);
      await showEnding(node.id);
      return '@title';

    case 'go':
      return node.scene;

    default:
      console.warn('Nó desconhecido:', node);
      return null;
  }
}

/**
 * Executa a história a partir de uma cena.
 * @returns {Promise<'title'>} quando a história termina ou o jogador sai.
 */
export async function playFrom(sceneId) {
  unlock();
  await ensureMounted();
  if (!loadScene(sceneId)) return 'title';

  for (;;) {
    if (!queue.length) {
      // Cena sem `go` explícito: encerra a sessão de história.
      console.warn(`Cena "${state.scene}" terminou sem destino.`);
      return 'title';
    }
    const node = queue.shift();
    let jump = null;
    try {
      jump = await exec(node);
    } catch (err) {
      console.error('Erro executando nó', node, err);
      toast('Algo quebrou nessa cena — pulando.', 'bad');
    }
    if (jump === '@title') return 'title';
    if (jump) {
      if (!loadScene(jump)) return 'title';
    }
  }
}

/** Retoma de onde o save parou. */
export function resumeStory() {
  return playFrom(state.scene || 'prologue_start');
}

/** Descarta a UI (usado ao voltar para o título). */
export function disposeVN() {
  ui = null;
  stage = [];
  queue = [];
}
