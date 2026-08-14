// Tela de desfecho: texto do final, resumo da partida e créditos.

import { el, svgNode, mount, wait, clear } from '../core/ui.js';
import { sfx, music } from '../core/audio.js';
import { background } from '../art/backgrounds.js';
import { formatPlaytime, currentPlaytime, unlockInGallery } from '../core/save.js';
import { ENDINGS } from '../data/story/endings.js';
import {
  state, displayName, bondHearts, karmaLabel, rosterRecords, bond,
} from '../core/state.js';
import { ELEMENTS, STYLES } from '../data/characters.js';

function statsPanel() {
  const t = state.tally;
  const allies = rosterRecords().filter((r) => r.id !== 'hero');
  const closest = allies.sort((a, b) => bond(b.id) - bond(a.id))[0];

  const rows = [
    ['Protagonista', `${displayName('hero')} · ${ELEMENTS[state.hero.element]?.name} · ${STYLES[state.hero.style]?.name}`],
    ['Caminho seguido', karmaLabel()],
    ['Companheiro mais próximo', closest ? `${displayName(closest.id)} (${bondHearts(closest.id)}/5 ❤)` : '—'],
    ['Decisões tomadas', String(t.choices)],
    ['Batalhas vencidas', String(t.battlesWon)],
    ['Inimigos poupados', String(t.spared)],
    ['Tempo de jogo', formatPlaytime(currentPlaytime())],
  ];

  return el('div.reward-list.panel', { style: { width: 'min(520px, 92vw)' } },
    rows.map(([k, v]) => el('div.reward-row', {}, [el('span', { text: k }), el('b', { text: v })])));
}

/** Mostra o final. Resolve quando o jogador confirma a volta ao título. */
export async function showEnding(id) {
  const e = ENDINGS[id] || ENDINGS.bonds;
  unlockInGallery(e.id);

  const bgEl = el('div.vn-bg');
  bgEl.append(svgNode(background(e.bg || 'village', { tint: '#0a0714', tintOpacity: .5 })));

  const screen = el('div.ending-screen');
  const content = el('div.col', {
    style: { alignItems: 'center', gap: '14px', position: 'relative', zIndex: '2', width: '100%' },
  });
  screen.append(bgEl, content);

  await mount(screen);
  music(e.music || 'hope');
  sfx('victory');

  // --- título do final ---
  content.append(
    el('div.kicker', { text: e.kicker }),
    el('h1', { text: e.title }),
  );
  await wait(1400);

  // --- corpo, parágrafo por parágrafo ---
  const bodyEl = el('div.body');
  content.append(bodyEl);

  const paragraphs = e.body.split('\n\n');
  for (const p of paragraphs) {
    const node = el('p', { text: p.replace(/\*(.+?)\*/g, '$1'), style: { opacity: '0', transition: 'opacity 700ms ease', marginBottom: '12px' } });
    bodyEl.append(node);
    requestAnimationFrame(() => { node.style.opacity = '1'; });
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await wait(Math.min(4200, 900 + p.length * 22));
  }

  await wait(600);

  // --- resumo + créditos ---
  content.append(
    el('div.rule', { style: { width: 'min(320px, 70vw)', height: '2px', background: 'linear-gradient(90deg,transparent,#e0a33c,transparent)' } }),
    statsPanel(),
    el('p.stats-line', {
      text: 'Kalica no Sato — Crônicas do Ninja · fangame não-comercial · arte e áudio gerados proceduralmente',
    }),
  );

  return new Promise((resolve) => {
    content.append(el('div.btn-row', { style: { marginTop: '8px' } }, [
      el('button.btn.primary', {
        text: 'Voltar ao título',
        onClick: () => { sfx('confirm'); music(null); resolve('title'); },
      }),
    ]));
    content.querySelector('.btn').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
