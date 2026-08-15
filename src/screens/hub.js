// Intervalo — o respiro entre capítulos.
//
// É aqui que existe o conteúdo opcional: missões livres para treinar e juntar
// ryo, e conversas com o time que dão profundidade aos elos. Sem esta tela,
// quem chega mal preparado num chefe não tem nenhuma forma de se preparar.

import { el, svgNode, mount, modal, toast } from '../core/ui.js';
import { sfx } from '../core/audio.js';
import { autosave } from '../core/save.js';
import { faceIcon } from '../art/portraits.js';
import { background } from '../art/backgrounds.js';
import { availableMissions, RANK_COLOR } from '../data/missions.js';
import { nextBondScene, lockedBondScene } from '../data/story/bonds.js';
import { ITEMS } from '../data/items.js';
import {
  state, partyLevel, partyRecords, rosterRecords, displayName, artOf,
  bond, bondHearts, addBond, addRyo, addItem, setFlag, restParty,
} from '../core/state.js';
import { maxHp, maxCk } from '../systems/progression.js';
import { runBattle } from './battle-ui.js';
import { openMenu, openShop } from './menu.js';

/**
 * Abre o Intervalo.
 * @param {object} opts { tier, title }
 * @returns {Promise<{scene:object}|{action:'continue'}>}
 *   `scene` = cena de elo escolhida, que o interpretador deve tocar antes de
 *   voltar para cá. `action:'continue'` = seguir a história.
 */
export function openHub(opts = {}) {
  const tier = opts.tier ?? Math.max(1, state.chapter);

  return new Promise((resolve) => {
    let screen;

    const finish = (value) => {
      screen?.remove();
      resolve(value);
    };

    const render = async (remount = false) => {
      screen = el('div.menu-screen.hub');

      const bg = el('div.hub-bg');
      bg.append(svgNode(background(state.chapter >= 4 ? 'villageNight' : 'village', {
        tint: '#0b0910', tintOpacity: .8,
      })));

      const body = el('div.menu-body');

      body.append(el('p.hub-intro', {
        text: opts.title
          || 'Um respiro antes do próximo passo. Treine, converse com o time, gaste o que ganhou — ou siga em frente.',
      }));

      // ------------------------------------------------------ missões ----
      body.append(el('div.section-title', { text: '📋 Quadro de missões' }));
      const missions = availableMissions(state.chapter);
      if (!missions.length) {
        body.append(el('p.empty-note', { text: 'Nenhuma missão disponível ainda.' }));
      }
      for (const m of missions) {
        const done = Boolean(state.flags[`mission_${m.id}`]);
        const lvl = Math.max(1, partyLevel() + (m.levelOffset || 0));
        body.append(el('div.row-item.mission', {}, [
          el('span.rank', { text: m.rank, style: { color: RANK_COLOR[m.rank] || '#fff', borderColor: RANK_COLOR[m.rank] } }),
          el('span.txt', {
            html: `<b>${m.name}${done ? ' <span class="cleared">✓ concluída</span>' : ''}</b>`
              + `<small>${m.desc}<br><i>${m.flavor}</i></small>`,
          }),
          el('span.qty', { text: `Nv. ~${lvl}` }),
          el('button.btn.small', {
            text: done ? 'Repetir' : 'Aceitar',
            onClick: () => runMission(m),
          }),
        ]));
      }

      // ----------------------------------------------------- conversas ----
      body.append(el('div.section-title', { text: '💬 Conversar com o time' }));
      const allies = rosterRecords().filter((r) => r.id !== 'hero');
      if (!allies.length) {
        body.append(el('p.empty-note', { text: 'Você ainda anda sozinho.' }));
      }
      let anyTalk = false;
      for (const rec of allies) {
        const b = bond(rec.id);
        const ready = nextBondScene(rec.id, b, state.flags);
        const locked = lockedBondScene(rec.id, b, state.flags);

        const row = el(`div.bond-row${ready ? '.ready' : ''}`, {}, [
          el('div.mini', {}, [svgNode(faceIcon(artOf(rec.id), ready ? 'happy' : 'neutral'))]),
          el('div.who', {}, [
            el('b', { text: displayName(rec.id) }),
            el('small', {
              text: ready ? `Quer falar com você: “${ready.title}”`
                : locked ? `Precisa de ${locked.minBond} de elo (você tem ${b})`
                  : 'Nada de novo por enquanto.',
            }),
          ]),
          el('div.hearts', {
            html: Array.from({ length: 5 }, (_, i) => `<span class="${i < bondHearts(rec.id) ? 'on' : 'off'}">❤</span>`).join(''),
          }),
          ready ? el('button.btn.small.primary', {
            text: 'Conversar',
            onClick: () => {
              sfx('confirm');
              setFlag(`bondScene_${ready.id}`, true);
              finish({ scene: ready });
            },
          }) : null,
        ]);
        if (ready) anyTalk = true;
        body.append(row);
      }
      if (allies.length && !anyTalk) {
        body.append(el('p.tiny.muted', {
          style: { textAlign: 'center' },
          text: 'Elos crescem com as escolhas da história e com missões concluídas.',
        }));
      }

      // -------------------------------------------------------- ações ----
      body.append(el('div.section-title', { text: '⚙ Preparativos' }));
      body.append(el('div.btn-row.hub-actions', {}, [
        el('button.btn', {
          text: '🏪 Loja',
          onClick: async () => { sfx('select'); await openShop(tier); render(true); },
        }),
        el('button.btn', {
          text: '🛌 Descansar',
          onClick: () => {
            sfx('heal');
            restParty();
            toast('Time totalmente recuperado', 'good');
            render(true);
          },
        }),
        el('button.btn', {
          text: '📜 Pergaminho (menu)',
          onClick: async () => { sfx('select'); await openMenu('party'); render(true); },
        }),
      ]));

      // ------------------------------------------------------- estado ----
      const partyBox = el('div.hub-party');
      body.append(partyBox);
      for (const rec of partyRecords()) {
        partyBox.append(el('div.hub-member', {}, [
          el('div.mini', {}, [svgNode(faceIcon(artOf(rec.id), rec.hp <= 0 ? 'sad' : 'neutral'))]),
          el('div', {}, [
            el('b', { text: `${displayName(rec.id)} · Nv.${rec.level}` }),
            el('small', { text: `${rec.hp}/${maxHp(rec)} HP · ${rec.ck}/${maxCk(rec)} CK` }),
          ]),
        ]));
      }

      body.append(el('button.btn.primary.hub-continue', {
        text: '▶ Continuar a história',
        onClick: () => { sfx('confirm'); autosave(); finish({ action: 'continue' }); },
      }));

      screen.append(
        bg,
        el('div.menu-head', {}, [
          el('h2', { text: '⛩ Intervalo' }),
          el('span.ryo', { text: `💰 ${state.ryo} ryo · Nv. médio ${partyLevel()}` }),
        ]),
        body,
      );

      if (remount) await mount(screen, { fade: false });
      else document.getElementById('app').append(screen);
    };

    // ------------------------------------------------------- missões ----
    const runMission = async (m) => {
      sfx('confirm');
      const level = Math.max(1, partyLevel() + (m.levelOffset || 0));
      const alive = partyRecords().filter((r) => r.hp > 0);
      if (!alive.length) {
        toast('Todo o time está fora de combate. Descanse primeiro.', 'bad');
        return;
      }

      screen.remove();
      const { result } = await runBattle({
        foes: m.encounter.foes,
        level,
        bg: m.encounter.bg,
        name: m.encounter.name,
        boss: m.encounter.boss,
        intro: m.flavor,
        onLoseText: 'A missão falhou, mas era opcional — o time é levado de volta à vila e tratado. Tente de novo quando estiver mais forte.',
      });

      if (result === 'win') {
        for (const [id, n] of Object.entries(m.bonds || {})) {
          if (state.roster[id]) addBond(id, n);
        }
        if (!state.flags[`mission_${m.id}`]) {
          setFlag(`mission_${m.id}`, true);
          const fc = m.firstClear || {};
          if (fc.ryo) addRyo(fc.ryo);
          for (const it of fc.items || []) addItem(it, 1);
          const extras = [
            fc.ryo ? `${fc.ryo} ryo` : null,
            ...(fc.items || []).map((i) => ITEMS[i]?.name || i),
          ].filter(Boolean);
          if (extras.length) {
            await modal({
              title: 'Missão concluída pela primeira vez',
              body: `Recompensa extra: ${extras.join(', ')}.`,
              buttons: [{ label: 'Guardar', value: true, primary: true }],
            });
          }
        }
      } else {
        // Missão opcional não deve travar o jogo: o time volta de pé.
        restParty();
      }

      autosave();
      await render(true);
    };

    render();
  });
}
