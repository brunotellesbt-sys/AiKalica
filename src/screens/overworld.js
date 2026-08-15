// Overworld — o vilarejo em 2D, andável.
//
// Substitui a lista estática do Intervalo por um mapa: você caminha até o
// quadro de missões, até a loja, até cada companheiro. Os pontos de interesse
// e as conversas são exatamente os mesmos, só que alcançados com os pés.

import { el, clear, mount, modal, toast } from '../core/ui.js';
import { sfx, music } from '../core/audio.js';
import { autosave } from '../core/save.js';
import { preloadWalk } from '../art/assets.js';
import { TILE, TILES, mapDef, isSolid } from '../data/maps.js';
import { availableMissions, RANK_COLOR } from '../data/missions.js';
import { nextBondScene, lockedBondScene } from '../data/story/bonds.js';
import { ITEMS } from '../data/items.js';
import {
  state, partyLevel, partyRecords, rosterRecords, displayName,
  bond, bondHearts, addBond, addRyo, addItem, setFlag, restParty,
} from '../core/state.js';
import { maxHp, maxCk } from '../systems/progression.js';
import { runBattle } from './battle-ui.js';
import { openMenu, openShop } from './menu.js';

const STEP_MS = 190;        // duração de um passo entre tiles
const ZOOM = 1.75;          // tiles de 32px ficam pequenos demais sem isto
const FOLLOW_GAP = 5;       // quantos passos cada seguidor fica atrás
const DIRS = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
};

// ------------------------------------------------------------ desenho -------
/** Variação sutil e estável por tile — evita o xadrez de dois tons. */
function tileNoise(x, y) {
  const h = ((x * 73856093) ^ (y * 19349663)) >>> 0;
  return (h % 5) - 2; // -2..2
}

function drawTile(ctx, t, px, py, x, y, time) {
  const def = TILES[t];
  if (!def) return;

  if (def.anim) {
    // Água com uma ondulação lenta.
    const wave = Math.sin(time / 600 + x * .6 + y * .4) * 10;
    ctx.fillStyle = (x + y) % 2 === 0 ? def.base : def.alt;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = `rgba(200,235,255,${(0.06 + wave / 400).toFixed(3)})`;
    ctx.fillRect(px, py, TILE, TILE);
    return;
  }

  ctx.fillStyle = def.base;
  ctx.fillRect(px, py, TILE, TILE);

  // Ruído de baixa intensidade no lugar do tabuleiro de xadrez: o chão fica
  // orgânico sem virar um padrão que o olho reconhece na hora.
  const v = tileNoise(x, y);
  if (v) {
    ctx.fillStyle = v > 0 ? `rgba(255,255,255,${(v * 0.014).toFixed(3)})`
      : `rgba(0,0,0,${(-v * 0.016).toFixed(3)})`;
    ctx.fillRect(px, py, TILE, TILE);
  }

  // Detalhe de telhado e parede: sem isso as casas viram blocos chapados.
  if (t === 'roof') {
    ctx.fillStyle = 'rgba(0,0,0,.16)';
    ctx.fillRect(px, py + TILE - 5, TILE, 5);
    ctx.fillStyle = 'rgba(255,255,255,.10)';
    ctx.fillRect(px, py, TILE, 4);
    ctx.strokeStyle = 'rgba(0,0,0,.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 16, py);
    ctx.lineTo(px + 16, py + TILE);
    ctx.stroke();
    return;
  }
  if (t === 'wall') {
    ctx.fillStyle = 'rgba(0,0,0,.10)';
    ctx.fillRect(px, py, TILE, 3);
    // Uma janela a cada dois tiles, uma porta a cada cinco.
    if ((x + y) % 5 === 0) {
      ctx.fillStyle = '#5a4030';
      ctx.fillRect(px + 9, py + 8, 14, 24);
      ctx.fillStyle = '#3f2d22';
      ctx.fillRect(px + 11, py + 10, 10, 22);
    } else if (x % 2 === 0) {
      ctx.fillStyle = '#7fa8c4';
      ctx.fillRect(px + 8, py + 10, 16, 12);
      ctx.strokeStyle = '#8a7a5a';
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 8, py + 10, 16, 12);
    }
    return;
  }

  switch (def.decor) {
    case 'tree':
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(px + 13, py + 18, 6, 12);
      ctx.fillStyle = '#2f5f34';
      ctx.beginPath();
      ctx.arc(px + 16, py + 14, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3d7340';
      ctx.beginPath();
      ctx.arc(px + 12, py + 11, 9, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'flower':
      ctx.fillStyle = ((x * 3 + y) % 3 === 0) ? '#f0d060' : '#e88ab0';
      ctx.beginPath();
      ctx.arc(px + 10, py + 20, 2.6, 0, Math.PI * 2);
      ctx.arc(px + 22, py + 12, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'fence':
      ctx.fillStyle = '#8a6a44';
      ctx.fillRect(px + 4, py + 12, 4, 18);
      ctx.fillRect(px + 24, py + 12, 4, 18);
      ctx.fillRect(px, py + 15, TILE, 4);
      break;
    case 'post':
      ctx.fillStyle = '#7a5a3a';
      ctx.fillRect(px + 12, py + 6, 8, 24);
      ctx.fillStyle = '#8a6a44';
      ctx.fillRect(px + 6, py + 2, 20, 8);
      break;
    case 'gate':
      ctx.fillStyle = '#7a3628';
      ctx.fillRect(px, py + 4, TILE, 10);
      ctx.fillStyle = '#c25f45';
      ctx.fillRect(px, py, TILE, 6);
      break;
    default:
      break;
  }
}

function drawMarker(ctx, px, py, icon, pulse) {
  const bob = Math.sin(pulse / 320) * 3;
  ctx.save();
  ctx.globalAlpha = .9;
  ctx.fillStyle = 'rgba(9,7,14,.75)';
  ctx.beginPath();
  ctx.roundRect(px + 2, py - 22 + bob, 28, 24, 6);
  ctx.fill();
  ctx.strokeStyle = '#e0a33c';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.font = '16px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, px + 16, py - 10 + bob);
}

// ------------------------------------------------------------- tela --------
/**
 * Abre o overworld.
 * @param {object} opts { tier, title }
 * @returns {Promise<{scene:object}|{action:'continue'}>}
 */
export function openOverworld(opts = {}) {
  const map = mapDef(opts.map || 'konoha');
  const tier = opts.tier ?? Math.max(1, state.chapter);

  return new Promise((resolve) => {
    let raf = null;
    let done = false;
    const keys = new Set();

    const finish = (value) => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      screen.remove();
      resolve(value);
    };

    // ---------------------------------------------------------- DOM ------
    const canvas = el('canvas.ow-canvas');
    const ctx = canvas.getContext('2d');

    const hint = el('div.ow-hint');
    const banner = el('div.ow-banner', {}, [
      el('span.ow-place', { text: map.name }),
      el('span.ow-info', { text: '' }),
    ]);

    const dpad = el('div.ow-dpad', {}, [
      el('button.ow-key.up', { text: '▲', dataset: { dir: 'up' } }),
      el('button.ow-key.left', { text: '◀', dataset: { dir: 'left' } }),
      el('button.ow-key.right', { text: '▶', dataset: { dir: 'right' } }),
      el('button.ow-key.down', { text: '▼', dataset: { dir: 'down' } }),
    ]);
    const actionBtn = el('button.ow-action', { text: 'Interagir' });

    const legend = el('div.ow-legend', {
      html: '<b>WASD</b> ou <b>setas</b> para andar · <b>Enter</b> para interagir · <b>M</b> menu',
    });

    const screen = el('div.overworld', {}, [
      canvas, banner, hint,
      el('div.ow-controls', {}, [dpad, actionBtn]),
      legend,
    ]);

    // ------------------------------------------------------- entidades ----
    const heroEl = state.hero?.element;
    const player = {
      id: 'hero', x: map.spawn.x, y: map.spawn.y,
      px: map.spawn.x, py: map.spawn.y,
      dir: 'down', frame: 0, moving: false, t: 0,
      sheets: null,
    };
    const trail = [{ x: player.x, y: player.y }];

    // Companheiros no time seguem o jogador; o resto fica parado no mapa.
    const partyIds = state.party.filter((id) => id !== 'hero');
    const followers = partyIds.map((id, i) => ({
      id, x: map.spawn.x, y: map.spawn.y, px: map.spawn.x, py: map.spawn.y,
      dir: 'down', frame: 0, gap: (i + 1) * FOLLOW_GAP, sheets: null,
    }));

    const standing = rosterRecords()
      .map((r) => r.id)
      .filter((id) => id !== 'hero' && !partyIds.includes(id) && map.npcSpots[id])
      .map((id) => ({ id, ...map.npcSpots[id], frame: 0, sheets: null }));

    // Quem está no time também aparece parado se tiver conversa disponível,
    // para o jogador não precisar adivinhar com quem dá para falar.
    const talkTargets = () => rosterRecords()
      .map((r) => r.id)
      .filter((id) => id !== 'hero' && map.npcSpots[id])
      .filter((id) => nextBondScene(id, bond(id), state.flags));

    // ---------------------------------------------------------- input ----
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'w'].includes(k)) { keys.add('up'); e.preventDefault(); }
      else if (['arrowdown', 's'].includes(k)) { keys.add('down'); e.preventDefault(); }
      else if (['arrowleft', 'a'].includes(k)) { keys.add('left'); e.preventDefault(); }
      else if (['arrowright', 'd'].includes(k)) { keys.add('right'); e.preventDefault(); }
      else if (k === 'enter' || k === ' ' || k === 'e') { e.preventDefault(); interact(); }
      else if (k === 'm') { e.preventDefault(); openMenu('party'); }
    };
    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (['arrowup', 'w'].includes(k)) keys.delete('up');
      if (['arrowdown', 's'].includes(k)) keys.delete('down');
      if (['arrowleft', 'a'].includes(k)) keys.delete('left');
      if (['arrowright', 'd'].includes(k)) keys.delete('right');
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    for (const btn of dpad.children) {
      const dir = btn.dataset.dir;
      const press = (e) => { e.preventDefault(); keys.add(dir); };
      const release = (e) => { e.preventDefault(); keys.delete(dir); };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointerleave', release);
      btn.addEventListener('pointercancel', release);
    }
    actionBtn.addEventListener('click', () => interact());

    // ------------------------------------------------------ interação ----
    /** O que está imediatamente à frente do jogador. */
    function facing() {
      const [dx, dy] = DIRS[player.dir];
      const tx = player.x + dx;
      const ty = player.y + dy;

      const poi = map.pois.find((p) => p.x === tx && p.y === ty);
      if (poi) return { kind: 'poi', poi };

      for (const id of Object.keys(map.npcSpots)) {
        const spot = map.npcSpots[id];
        if (spot.x === tx && spot.y === ty && state.roster[id]) {
          return { kind: 'npc', id };
        }
      }
      return null;
    }

    function currentHint() {
      const f = facing();
      if (!f) return '';
      if (f.kind === 'poi') return `⏎ ${f.poi.prompt}`;
      const ready = nextBondScene(f.id, bond(f.id), state.flags);
      if (ready) return `⏎ Conversar com ${displayName(f.id)} — “${ready.title}”`;
      const locked = lockedBondScene(f.id, bond(f.id), state.flags);
      return locked
        ? `${displayName(f.id)}: precisa de ${locked.minBond} de elo (você tem ${bond(f.id)})`
        : `${displayName(f.id)} não tem nada novo para contar.`;
    }

    async function interact() {
      const f = facing();
      if (!f) return;

      if (f.kind === 'npc') {
        const ready = nextBondScene(f.id, bond(f.id), state.flags);
        if (!ready) { sfx('cancel'); return; }
        sfx('confirm');
        setFlag(`bondScene_${ready.id}`, true);
        finish({ scene: ready });
        return;
      }

      const { poi } = f;
      sfx('confirm');
      switch (poi.action) {
        case 'continue': {
          const ok = await modal({
            title: 'Seguir a história?',
            body: 'Você pode voltar a explorar depois. Ainda há missões e conversas disponíveis.',
            buttons: [
              { label: 'Seguir', value: true, primary: true },
              { label: 'Ficar mais um pouco', value: false },
            ],
          });
          if (ok) { autosave(); finish({ action: 'continue' }); }
          break;
        }
        case 'shop':
          await openShop(tier);
          break;
        case 'rest':
          restParty();
          sfx('heal');
          toast('Time totalmente recuperado', 'good');
          break;
        case 'missions':
        case 'training':
          await openMissionBoard();
          break;
        case 'memorial':
          await modal({
            title: 'Pedra Memorial',
            body: 'Os nomes cobrem a pedra inteira, em fileiras apertadas. Você reconhece alguns '
              + 'sobrenomes de colegas da Academia. Kakashi vem aqui toda manhã — é por isso que ele se atrasa.',
            buttons: [{ label: 'Sair em silêncio', value: true, primary: true }],
          });
          break;
        default:
          break;
      }
      autosave();
    }

    // ---------------------------------------------------- quadro/missões ----
    function openMissionBoard() {
      return new Promise((closeBoard) => {
        const body = el('div.menu-body');
        const board = el('div.menu-screen', {}, [
          el('div.menu-head', {}, [
            el('h2', { text: '📋 Quadro de Missões' }),
            el('span.ryo', { text: `💰 ${state.ryo} ryo · Nv. médio ${partyLevel()}` }),
            el('button.icon-btn', { text: '✕', onClick: () => { sfx('cancel'); board.remove(); closeBoard(); } }),
          ]),
          body,
        ]);

        const fill = () => {
          clear(body);
          const list = availableMissions(state.chapter);
          if (!list.length) body.append(el('p.empty-note', { text: 'Nenhuma missão disponível ainda.' }));

          for (const m of list) {
            const cleared = Boolean(state.flags[`mission_${m.id}`]);
            const lvl = Math.max(1, partyLevel() + (m.levelOffset || 0));
            body.append(el('div.row-item.mission', {}, [
              el('span.rank', { text: m.rank, style: { color: RANK_COLOR[m.rank], borderColor: RANK_COLOR[m.rank] } }),
              el('span.txt', {
                html: `<b>${m.name}${cleared ? ' <span class="cleared">✓ concluída</span>' : ''}</b>`
                  + `<small>${m.desc}<br><i>${m.flavor}</i></small>`,
              }),
              el('span.qty', { text: `Nv. ~${lvl}` }),
              el('button.btn.small', {
                text: cleared ? 'Repetir' : 'Aceitar',
                onClick: async () => {
                  board.remove();
                  await runMission(m);
                  document.getElementById('app').append(board);
                  fill();
                },
              }),
            ]));
          }

          body.append(el('div.hub-party', {},
            partyRecords().map((rec) => el('div.hub-member', {}, [
              el('div', {}, [
                el('b', { text: `${displayName(rec.id)} · Nv.${rec.level}` }),
                el('small', { text: `${rec.hp}/${maxHp(rec)} HP · ${rec.ck}/${maxCk(rec)} CK` }),
              ]),
            ]))));

          body.append(el('button.btn.primary', {
            text: 'Fechar o quadro', style: { width: '100%' },
            onClick: () => { sfx('cancel'); board.remove(); closeBoard(); },
          }));
        };

        document.getElementById('app').append(board);
        fill();
      });
    }

    async function runMission(m) {
      const level = Math.max(1, partyLevel() + (m.levelOffset || 0));
      if (!partyRecords().some((r) => r.hp > 0)) {
        toast('Todo o time está fora de combate. Descanse no Ichiraku.', 'bad');
        return;
      }
      screen.remove();
      cancelAnimationFrame(raf);

      const { result } = await runBattle({
        foes: m.encounter.foes, level, bg: m.encounter.bg,
        name: m.encounter.name, boss: m.encounter.boss, intro: m.flavor,
        onLoseText: 'A missão falhou, mas era opcional — o time é levado de volta à vila e tratado.',
      });

      if (result === 'win') {
        for (const [id, n] of Object.entries(m.bonds || {})) if (state.roster[id]) addBond(id, n);
        if (!state.flags[`mission_${m.id}`]) {
          setFlag(`mission_${m.id}`, true);
          const fc = m.firstClear || {};
          if (fc.ryo) addRyo(fc.ryo);
          for (const it of fc.items || []) addItem(it, 1);
          const extras = [fc.ryo && `${fc.ryo} ryo`, ...(fc.items || []).map((i) => ITEMS[i]?.name || i)].filter(Boolean);
          if (extras.length) {
            await modal({
              title: 'Missão concluída pela primeira vez',
              body: `Recompensa extra: ${extras.join(', ')}.`,
              buttons: [{ label: 'Guardar', value: true, primary: true }],
            });
          }
        }
      } else {
        restParty();
      }

      autosave();
      document.getElementById('app').append(screen);
      resize();
      loop(performance.now());
    }

    // ------------------------------------------------------- movimento ----
    function tryStep(dir) {
      const [dx, dy] = DIRS[dir];
      player.dir = dir;
      const nx = player.x + dx;
      const ny = player.y + dy;
      if (isSolid(map, nx, ny)) return false;
      // POIs e companheiros parados ocupam o tile.
      if (map.pois.some((p) => p.x === nx && p.y === ny)) return false;
      if (Object.entries(map.npcSpots).some(([id, s]) => s.x === nx && s.y === ny && state.roster[id])) return false;

      player.x = nx;
      player.y = ny;
      player.moving = true;
      player.t = 0;
      trail.unshift({ x: nx, y: ny });
      if (trail.length > 60) trail.length = 60;
      return true;
    }

    // ------------------------------------------------------------ loop ----
    let lastTs = 0;
    let animClock = 0;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(screen.clientWidth * dpr);
      canvas.height = Math.floor(screen.clientHeight * dpr);
      canvas.style.width = screen.clientWidth + 'px';
      canvas.style.height = screen.clientHeight + 'px';
      ctx.setTransform(dpr * ZOOM, 0, 0, dpr * ZOOM, 0, 0);
      ctx.imageSmoothingEnabled = true;
    }

    function drawActor(a, camX, camY) {
      if (!a.sheets) return;
      const img = a.sheets[`${a.dir}-${a.frame}`] || a.sheets['down-0'];
      if (!img) return;
      const sx = a.px * TILE - camX;
      const sy = a.py * TILE - camY;
      // O sprite tem 44px de altura para 32 de tile: o excedente sobe.
      ctx.drawImage(img, sx, sy - 12, TILE, 44);
    }

    function loop(ts) {
      if (done) return;
      const dt = Math.min(64, ts - lastTs || 16);
      lastTs = ts;
      animClock += dt;

      // --- passo do jogador ---
      if (player.moving) {
        player.t += dt;
        const p = Math.min(1, player.t / STEP_MS);
        const from = trail[1] || { x: player.x, y: player.y };
        player.px = from.x + (player.x - from.x) * p;
        player.py = from.y + (player.y - from.y) * p;
        player.frame = p < .5 ? 1 : 2;
        if (p >= 1) { player.moving = false; player.px = player.x; player.py = player.y; player.frame = 0; }
      } else {
        const dir = ['up', 'down', 'left', 'right'].find((d) => keys.has(d));
        if (dir) tryStep(dir);
        else player.frame = 0;
      }

      // --- seguidores ---
      for (const f of followers) {
        const target = trail[Math.min(trail.length - 1, f.gap)];
        if (!target) continue;
        if (f.x !== target.x || f.y !== target.y) {
          const dx = Math.sign(target.x - f.x);
          const dy = Math.sign(target.y - f.y);
          f.dir = dx ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
          f.px += (target.x - f.px) * Math.min(1, dt / STEP_MS);
          f.py += (target.y - f.py) * Math.min(1, dt / STEP_MS);
          if (Math.abs(target.x - f.px) < .05 && Math.abs(target.y - f.py) < .05) {
            f.x = target.x; f.y = target.y; f.px = f.x; f.py = f.y;
          }
          f.frame = Math.floor(animClock / 160) % 2 + 1;
        } else {
          f.frame = 0;
        }
      }

      // --- câmera ---
      const viewW = screen.clientWidth / ZOOM;
      const viewH = screen.clientHeight / ZOOM;
      const worldW = map.w * TILE;
      const worldH = map.h * TILE;
      let camX = player.px * TILE + TILE / 2 - viewW / 2;
      let camY = player.py * TILE + TILE / 2 - viewH / 2;
      camX = Math.max(0, Math.min(worldW - viewW, camX));
      camY = Math.max(0, Math.min(worldH - viewH, camY));
      if (worldW < viewW) camX = (worldW - viewW) / 2;
      if (worldH < viewH) camY = (worldH - viewH) / 2;

      // --- tiles visíveis ---
      ctx.fillStyle = '#2b3a2b';
      ctx.fillRect(0, 0, viewW, viewH);
      const x0 = Math.max(0, Math.floor(camX / TILE));
      const y0 = Math.max(0, Math.floor(camY / TILE));
      const x1 = Math.min(map.w - 1, Math.ceil((camX + viewW) / TILE));
      const y1 = Math.min(map.h - 1, Math.ceil((camY + viewH) / TILE));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          drawTile(ctx, map.grid[y][x], x * TILE - camX, y * TILE - camY, x, y, animClock);
        }
      }

      // --- marcadores dos pontos de interesse ---
      for (const p of map.pois) {
        drawMarker(ctx, p.x * TILE - camX, p.y * TILE - camY, p.icon, animClock);
      }

      // --- atores, ordenados por Y para dar profundidade ---
      const actors = [...standing, ...followers, player]
        .filter((a) => a.sheets)
        .sort((a, b) => (a.py ?? a.y) - (b.py ?? b.y));
      for (const a of actors) {
        drawActor({ ...a, px: a.px ?? a.x, py: a.py ?? a.y }, camX, camY);
      }

      // --- balão de "quer conversar" ---
      for (const id of talkTargets()) {
        const s = map.npcSpots[id];
        if (!s) continue;
        drawMarker(ctx, s.x * TILE - camX, s.y * TILE - camY, '💬', animClock + 200);
      }

      hint.textContent = currentHint();
      hint.classList.toggle('on', Boolean(hint.textContent));

      raf = requestAnimationFrame(loop);
    }

    // -------------------------------------------------------- inicializa ----
    (async () => {
      document.getElementById('app').append(screen);
      resize();
      window.addEventListener('resize', resize);

      banner.querySelector('.ow-info').textContent = opts.title || '';
      music('village');

      // Carrega as folhas de caminhada de todo mundo que aparece no mapa.
      const ids = new Set(['hero', ...partyIds, ...standing.map((s) => s.id)]);
      const sheets = {};
      await Promise.all([...ids].map(async (id) => {
        sheets[id] = await preloadWalk(id, id === 'hero' ? heroEl : null);
      }));

      player.sheets = sheets.hero;
      for (const f of followers) f.sheets = sheets[f.id];
      for (const s of standing) s.sheets = sheets[s.id];

      loop(performance.now());
    })();
  });
}
