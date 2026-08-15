// Interface e laço de batalha: desenha o campo, coleta comandos e anima eventos.

import { el, svgNode, clear, wait, mount, flash, shake, toast, modal } from '../core/ui.js';
import { sfx, music } from '../core/audio.js';
import { settings } from '../core/save.js';
import { sprite } from '../art/sprites.js';
import { background } from '../art/backgrounds.js';
import { JUTSU } from '../data/jutsu.js';
import { ITEMS } from '../data/items.js';
import { ELEMENTS } from '../data/characters.js';
import { STATUS } from '../systems/effects.js';
import {
  createBattle, resolveAction, aiAction, turnOrder, endRound, checkEnd,
  availableTeamJutsu, battleRewards, syncBackToRecords, validTargets, WILL_MAX,
} from '../systems/battle.js';
import {
  state, partyRecords, grantPartyExp, addRyo, addItem, itemCount, removeItem, displayName, bond,
} from '../core/state.js';

const ELEM_CLASS = {
  fire: 'elem-fire', wind: 'elem-wind', lightning: 'elem-lightning',
  earth: 'elem-earth', water: 'elem-water', none: 'elem-none',
};

const speed = () => (settings.battleAnim ? 1 : 0.35);

// ------------------------------------------------------------------ render ---
function unitNode(u) {
  const node = el('div.unit', { dataset: { uid: u.uid } });
  const spr = el('div.unit-sprite');
  spr.append(svgNode(sprite(u.art || {}, { flip: u.side === 'foe' })));

  const plate = el('div.unit-plate', {}, [
    el('div.nm', {}, [
      el('span', { text: u.name }),
      el('span.lv', { text: `Lv.${u.level}` }),
    ]),
    el('div.bar.hp', {}, [el('i')]),
    el('div.nums', {}, [el('span.hpv'), u.side === 'ally' ? el('span.ckv') : null]),
    u.side === 'ally' ? el('div.bar.ck', {}, [el('i')]) : null,
    el('div.status-icons'),
  ]);

  node.append(spr, plate);
  if (u.row === 'back') node.classList.add('back');
  return node;
}

function refreshUnit(node, u) {
  if (!node) return;
  const hpPct = Math.max(0, (u.hp / u.maxHp) * 100);
  const hpBar = node.querySelector('.bar.hp');
  hpBar.querySelector('i').style.width = hpPct + '%';
  hpBar.classList.toggle('low', hpPct <= 30);
  node.querySelector('.hpv').textContent = `${Math.max(0, u.hp)}/${u.maxHp}`;

  const ck = node.querySelector('.bar.ck');
  if (ck) {
    ck.querySelector('i').style.width = (u.maxCk ? (u.ck / u.maxCk) * 100 : 0) + '%';
    node.querySelector('.ckv').textContent = `CK ${u.ck}`;
  }

  const icons = node.querySelector('.status-icons');
  clear(icons);
  for (const s of u.status) {
    const d = STATUS[s.id];
    if (!d) continue;
    icons.append(el(`span.st-icon.${s.id}`, { text: `${d.icon}${s.turns}`, title: `${d.name}: ${d.desc}` }));
  }

  node.classList.toggle('back', u.row === 'back');
  node.classList.toggle('down', !u.alive);
}

// ------------------------------------------------------------------ efeitos ---
function floatNum(node, text, cls) {
  if (!node) return;
  const spr = node.querySelector('.unit-sprite') || node;
  const n = el(`div.float-num.${cls}`, { text });
  spr.append(n);
  setTimeout(() => n.remove(), 1000);
}

function pulse(node, cls, ms = 340) {
  if (!node) return;
  node.classList.remove(cls);
  void node.offsetWidth;
  node.classList.add(cls);
  setTimeout(() => node.classList.remove(cls), ms);
}

function jutsuBanner(field, j, element) {
  const wrap = el('div.jutsu-fx');
  wrap.append(el(`div.jutsu-name.${ELEM_CLASS[element] || 'elem-none'}`, { text: j }));
  wrap.append(el('div.fx-burst', { style: { color: ELEMENTS[element]?.color || '#fff' } }));
  field.append(wrap);
  setTimeout(() => wrap.remove(), 1200);
}

// ------------------------------------------------------------------- laço ----
/**
 * Executa uma batalha completa.
 * @param {object} config  { foes, level, bg, name, boss, objective, noFlee, onLoseText }
 * @returns {Promise<{result:string, rewards:object|null, reports:Array}>}
 */
export async function runBattle(config) {
  const allies = partyRecords().filter((r) => r.hp > 0);
  if (!allies.length) return { result: 'lose', rewards: null, reports: [] };

  const battle = createBattle({
    ...config,
    allies,
    difficulty: settings.difficulty,
  });

  // ---- DOM ----
  const root = el('div.battle');
  const bg = el('div.battle-bg');
  bg.append(svgNode(background(config.bg || 'forest')));

  const willBar = el('div.bar.will', {}, [el('i', { style: { width: '0%' } })]);
  const willMeter = el('div.will-meter', {}, [
    el('span.lbl', { text: 'VONTADE DE FOGO' }), willBar,
  ]);
  const roundLabel = el('span.round', { text: 'Rodada 1' });
  const banner = el('div.battle-banner', {}, [
    el('span', { text: battle.name }), roundLabel, willMeter,
  ]);

  const allySide = el('div.side.allies');
  const foeSide = el('div.side.foes');
  const field = el('div.field', {}, [allySide, foeSide]);
  const logBox = el('div.battle-log');
  const cmd = el('div.cmd-panel');

  root.append(bg, banner, field, logBox, cmd);

  const nodes = new Map();
  for (const u of battle.allies) { const n = unitNode(u); nodes.set(u.uid, n); allySide.append(n); }
  for (const u of battle.foes) { const n = unitNode(u); nodes.set(u.uid, n); foeSide.append(n); }
  const refreshAll = () => battle.units().forEach((u) => refreshUnit(nodes.get(u.uid), u));
  refreshAll();

  await mount(root);
  music(config.boss ? 'boss' : 'battle');
  sfx('confirm');

  const log = (text, hi = false) => {
    const p = el('p', { text });
    if (hi) p.classList.add('hi');
    logBox.append(p);
    while (logBox.children.length > 4) logBox.firstChild.remove();
  };

  const setWill = () => {
    willBar.querySelector('i').style.width = (battle.will / WILL_MAX) * 100 + '%';
    willMeter.classList.toggle('ready', battle.will >= WILL_MAX);
  };

  log(config.intro || `${battle.name}!`, true);
  if (battle.foes[0]?.def?.intro) log(battle.foes[0].def.intro);

  // ---- animação de eventos ----
  async function play(events) {
    for (const e of events) {
      const tn = nodes.get(e.target?.uid);
      const un = nodes.get(e.unit?.uid);

      switch (e.t) {
        case 'announce': {
          if (e.jutsu) {
            if (e.jutsu.id !== 'attack') {
              jutsuBanner(field, e.jutsu.name, e.jutsu.element);
              sfx(e.jutsu.fx === 'ultimate' ? 'ultimate' : e.jutsu.fx === 'poof' ? 'poof' : 'jutsu');
              log(`${e.unit.name} usa ${e.jutsu.name}!`, true);
              await wait(560 * speed());
            } else {
              log(`${e.unit.name} ataca.`);
            }
            pulse(un, 'strike');
            await wait(180 * speed());
          } else if (e.item) {
            log(`${e.unit.name} usa ${e.item.name}.`, true);
            sfx('confirm');
            await wait(260 * speed());
          } else if (e.team) {
            log(`⚔ ${e.team.name}!`, true);
          }
          break;
        }
        case 'cinematic': {
          jutsuBanner(field, e.team.name, e.team.element);
          sfx('ultimate');
          flash('#ffd28a', 480);
          shake(520);
          await wait(1000 * speed());
          break;
        }
        case 'damage': {
          if (!e.self && !e.reflected) pulse(tn, 'hurt');
          const cls = e.crit ? 'crit' : 'dmg';
          floatNum(tn, `${e.crit ? '⚡' : ''}${e.amount}`, cls);
          if (e.mult > 1.2) floatNum(tn, 'PONTO FRACO!', 'weak');
          else if (e.mult && e.mult < .8) floatNum(tn, 'resistiu', 'resist');
          sfx(e.crit ? 'crit' : 'hit');
          if (e.crit) shake(260);
          refreshUnit(tn, e.target);
          await wait((e.of > 1 ? 150 : 300) * speed());
          break;
        }
        case 'miss':
          floatNum(tn, 'errou', 'miss');
          sfx('miss');
          await wait(220 * speed());
          break;
        case 'substitute':
          floatNum(tn, 'SUBSTITUIÇÃO!', 'miss');
          sfx('poof');
          log(`${e.target.name} troca de lugar com um tronco!`);
          await wait(400 * speed());
          break;
        case 'heal':
          floatNum(tn, `+${e.amount}`, 'heal');
          sfx('heal');
          refreshUnit(tn, e.target);
          await wait(300 * speed());
          break;
        case 'revive':
          tn?.classList.remove('down');
          floatNum(tn, 'DE PÉ!', 'heal');
          sfx('levelup');
          log(`${e.target.name} volta para a luta!`, true);
          refreshUnit(tn, e.target);
          await wait(500 * speed());
          break;
        case 'ck':
          if (!e.quiet) floatNum(tn, `+${e.amount} CK`, 'ck');
          refreshUnit(tn, e.target);
          if (!e.quiet) await wait(200 * speed());
          break;
        case 'status': {
          const d = STATUS[e.status];
          if (d && e.fresh) {
            floatNum(tn, `${d.icon} ${d.name}`, e.kind === 'bad' ? 'dmg' : 'heal');
            log(`${e.target.name}: ${d.name}.`);
          }
          refreshUnit(tn, e.target);
          await wait(180 * speed());
          break;
        }
        case 'cleanse':
          floatNum(tn, '✨ limpo', 'heal');
          refreshUnit(tn, e.target);
          await wait(200 * speed());
          break;
        case 'dot':
          floatNum(tn, `${STATUS[e.status]?.icon || ''}${e.amount}`, 'dmg');
          refreshUnit(tn, e.target);
          await wait(240 * speed());
          break;
        case 'hot':
          floatNum(tn, `+${e.amount}`, 'heal');
          refreshUnit(tn, e.target);
          await wait(220 * speed());
          break;
        case 'down':
          log(`${e.unit.name} caiu!`, true);
          refreshUnit(nodes.get(e.unit.uid), e.unit);
          nodes.get(e.unit.uid)?.classList.add('down');
          sfx('cancel');
          await wait(420 * speed());
          break;
        case 'blocked':
          floatNum(un, STATUS[e.status]?.icon || '✖', 'miss');
          log(`${e.unit.name} não consegue se mover (${STATUS[e.status]?.name}).`);
          await wait(320 * speed());
          break;
        case 'confused':
          log(`${e.unit.name} está confuso e se volta contra o próprio time!`, true);
          await wait(360 * speed());
          break;
        case 'flee':
          log(e.ok ? 'Vocês escapam!' : 'A fuga falhou!', true);
          sfx(e.ok ? 'poof' : 'cancel');
          await wait(420 * speed());
          break;
        case 'will':
          setWill();
          break;
        case 'log':
          log(e.text);
          await wait(240 * speed());
          break;
        default:
          break;
      }
    }
    refreshAll();
  }

  // ---- comandos do jogador ----
  function chooseAction(unit) {
    return new Promise((resolve) => {
      const back = [];

      const header = (extra) =>
        el('div.cmd-who', {}, [
          el('span', { text: `▶ ${unit.name}` }),
          el('span.chip', { text: `CK ${unit.ck}/${unit.maxCk}` }),
          el('span.chip', { text: unit.row === 'front' ? 'Frente' : 'Retaguarda' }),
          extra ? el('span.chip', { text: extra }) : null,
        ]);

      const hint = el('div.cmd-hint');

      const showMain = () => {
        clear(cmd);
        const combos = availableTeamJutsu(battle, bond);
        const grid = el('div.cmd-grid');

        const btn = (ico, label, onClick, meta, tip) =>
          el('button.btn.cmd-btn', {
            onClick: () => { sfx('select'); onClick(); },
            onMouseEnter: () => { hint.textContent = tip || ''; },
            onFocus: () => { hint.textContent = tip || ''; },
          }, [
            el('span.ico', { text: ico }),
            el('span', { text: label }),
            meta ? el('span.meta', { text: meta }) : null,
          ]);

        grid.append(
          btn('👊', 'Atacar', () => pickTarget(JUTSU.attack, (targets) =>
            resolve({ kind: 'jutsu', jutsuId: 'attack', targets })), null, 'Golpe físico, devolve chakra.'),
          btn('🌀', 'Jutsu', showJutsu, null, 'Técnicas que gastam chakra.'),
          btn('🎒', 'Ferramenta', showItems, null, 'Kunai, pílulas, rações...'),
          btn('🛡️', 'Defender', () => resolve({ kind: 'jutsu', jutsuId: 'guard' }), null, 'Metade do dano e recupera chakra.'),
          btn('🌲', 'Substituição', () => resolve({ kind: 'jutsu', jutsuId: 'substitution' }),
            '10 CK', 'Anula o próximo golpe recebido.'),
          btn('↔️', 'Formação', () => resolve({ kind: 'row' }),
            unit.row === 'front' ? '→ trás' : '→ frente', 'Retaguarda sofre menos dano físico.'),
        );

        if (combos.length) {
          for (const c of combos) {
            grid.append(el('button.btn.primary.cmd-btn', {
              onClick: () => { sfx('confirm'); resolve({ kind: 'team', teamId: c.id }); },
              onMouseEnter: () => { hint.textContent = c.desc; },
            }, [
              el('span.ico', { text: '⚔️' }),
              el('span', { html: `<b>${c.name}</b><small>${c.members.map(displayName).join(' + ')}</small>` }),
              el('span.meta', { text: 'VONTADE' }),
            ]));
          }
        }

        if (!battle.noFlee) {
          grid.append(btn('🏃', 'Fugir', () => resolve({ kind: 'flee' }), null, 'Nem toda luta precisa ser vencida.'));
        }

        cmd.append(header(), grid, hint);
      };

      const showJutsu = () => {
        clear(cmd);
        const grid = el('div.cmd-grid.list');
        const known = unit.jutsu.map((id) => JUTSU[id]).filter(Boolean);
        if (!known.length) grid.append(el('div.cmd-hint', { text: 'Nenhum jutsu disponível.' }));

        for (const j of known) {
          const can = j.cost <= unit.ck;
          grid.append(el('button.btn.cmd-btn', {
            disabled: !can,
            onClick: () => {
              sfx('select');
              if (j.target === 'self' || j.target === 'allFoes' || j.target === 'allAllies') {
                resolve({ kind: 'jutsu', jutsuId: j.id });
              } else {
                pickTarget(j, (targets) => resolve({ kind: 'jutsu', jutsuId: j.id, targets }));
              }
            },
            onMouseEnter: () => { hint.textContent = j.desc; },
            onFocus: () => { hint.textContent = j.desc; },
          }, [
            el('span.ico', { text: ELEMENTS[j.element]?.icon || '✴️' }),
            el('span', { html: `<b>${j.name}</b><small>${j.kind === 'heal' ? 'Cura' : j.power ? `Poder ${j.power}${j.hits > 1 ? ` ×${j.hits}` : ''}` : 'Suporte'}</small>` }),
            el('span.meta.ck', { text: j.cost ? `${j.cost} CK` : '—' }),
          ]));
        }
        cmd.append(header('Jutsu'), grid, hint, backBtn(showMain));
      };

      const showItems = () => {
        clear(cmd);
        const grid = el('div.cmd-grid.list');
        const usable = Object.keys(state.inventory)
          .map((id) => ITEMS[id])
          .filter((it) => it && it.battle && itemCount(it.id) > 0);

        if (!usable.length) grid.append(el('div.cmd-hint', { text: 'A mochila está vazia.' }));

        for (const it of usable) {
          grid.append(el('button.btn.cmd-btn', {
            onClick: () => {
              sfx('select');
              const fakeJ = { target: it.target || 'ally' };
              if (fakeJ.target === 'allFoes' || fakeJ.target === 'allAllies') {
                removeItem(it.id, 1);
                resolve({ kind: 'item', itemId: it.id });
              } else {
                pickTarget(fakeJ, (targets) => {
                  removeItem(it.id, 1);
                  resolve({ kind: 'item', itemId: it.id, targets });
                });
              }
            },
            onMouseEnter: () => { hint.textContent = it.desc; },
          }, [
            el('span.ico', { text: it.icon }),
            el('span', { html: `<b>${it.name}</b><small>${it.desc}</small>` }),
            el('span.meta', { text: `×${itemCount(it.id)}` }),
          ]));
        }
        cmd.append(header('Ferramentas'), grid, hint, backBtn(showMain));
      };

      const pickTarget = (j, done) => {
        const pool = validTargets(battle, unit, j);
        if (pool.length <= 1) { done(pool.map((u) => u.uid)); return; }

        clear(cmd);
        const grid = el('div.cmd-grid');
        const clearHighlights = () => {
          nodes.forEach((n) => n.classList.remove('selectable', 'targeted'));
          back.forEach((fn) => fn());
          back.length = 0;
        };

        for (const t of pool) {
          const n = nodes.get(t.uid);
          n?.classList.add('selectable');
          const onClick = () => { sfx('confirm'); clearHighlights(); done([t.uid]); };
          n?.addEventListener('click', onClick);
          back.push(() => n?.removeEventListener('click', onClick));

          grid.append(el('button.btn.cmd-btn', {
            onClick,
            onMouseEnter: () => { n?.classList.add('targeted'); hint.textContent = `${t.name} — ${t.hp}/${t.maxHp} HP`; },
            onMouseLeave: () => n?.classList.remove('targeted'),
          }, [
            el('span.ico', { text: t.side === 'foe' ? '🎯' : '💠' }),
            el('span', { html: `<b>${t.name}</b><small>${t.hp}/${t.maxHp} HP</small>` }),
          ]));
        }
        cmd.append(header('Escolha o alvo'), grid, hint, backBtn(() => { clearHighlights(); showMain(); }));
      };

      const backBtn = (fn) =>
        el('div.btn-row', { style: { marginTop: '6px' } }, [
          el('button.btn.ghost.small', { text: '← Voltar', onClick: () => { sfx('cancel'); fn(); } }),
        ]);

      showMain();
    });
  }

  // ---- loop principal ----
  let result = null;
  while (!result) {
    battle.round++;
    roundLabel.textContent = `Rodada ${battle.round}`;
    const order = turnOrder(battle);

    for (const unit of order) {
      if (!unit.alive) continue;
      result = checkEnd(battle);
      if (result) break;

      const node = nodes.get(unit.uid);
      node?.classList.add('active-turn');

      let action;
      if (unit.side === 'ally') {
        action = await chooseAction(unit);
        clear(cmd);
        cmd.append(el('div.cmd-who', { text: `▶ ${unit.name}` }), el('div.cmd-hint', { text: 'Executando...' }));
      } else {
        await wait(360 * speed());
        action = aiAction(battle, unit);
      }

      await play(resolveAction(battle, unit, action));
      node?.classList.remove('active-turn');

      result = checkEnd(battle);
      if (result) break;
    }

    if (result) break;
    await play(endRound(battle));
    result = checkEnd(battle);
  }

  // ---- desfecho ----
  syncBackToRecords(battle);
  clear(cmd);
  await wait(400);

  let rewards = null;
  let reports = [];

  if (result === 'win') {
    state.tally.battlesWon++;
    rewards = battleRewards(battle);
    addRyo(rewards.ryo);
    for (const d of rewards.drops) addItem(d, 1);
    reports = grantPartyExp(rewards.exp);
    sfx('victory');
    music('hope');
  } else if (result === 'lose') {
    state.tally.battlesLost++;
    sfx('defeat');
    music('sad');
  } else {
    music(null);
  }

  if (result !== 'flee') {
    await showResult(root, result, rewards, reports, config);
  }

  music(null);
  return { result, rewards, reports, battle };
}

// ------------------------------------------------------------- tela final ---
function showResult(root, result, rewards, reports, config) {
  return new Promise((resolve) => {
    const win = result === 'win';
    const box = el('div.battle-result');

    box.append(el(`h2${win ? '' : '.lose'}`, {
      text: win ? (config.objective ? 'OBJETIVO CUMPRIDO' : 'VITÓRIA') : 'DERROTA',
    }));

    if (win && rewards) {
      const list = el('div.reward-list.panel');
      list.append(el('div.reward-row', {}, [el('span', { text: 'Experiência' }), el('b', { text: `+${rewards.exp}` })]));
      list.append(el('div.reward-row', {}, [el('span', { text: 'Ryo' }), el('b', { text: `+${rewards.ryo}` })]));
      for (const d of rewards.drops) {
        list.append(el('div.reward-row', {}, [
          el('span', { text: `${ITEMS[d]?.icon || '•'} ${ITEMS[d]?.name || d}` }), el('b', { text: '×1' }),
        ]));
      }
      let leveled = false;
      for (const { rec, report } of reports) {
        if (report.levels > 0) {
          leveled = true;
          list.append(el('div.reward-row', {}, [
            el('span.levelup', { text: `${rec.name} subiu para o nível ${report.to}!` }), el('b', { text: `+${report.levels}` }),
          ]));
          for (const j of report.learned) {
            list.append(el('div.reward-row', {}, [
              el('span', { text: `  ↳ aprendeu ${j.name}` }), el('b', { text: '★' }),
            ]));
          }
        }
      }
      if (leveled) sfx('levelup');
      box.append(list);
    } else if (!win) {
      box.append(el('p.muted', {
        style: { maxWidth: '420px', textAlign: 'center', lineHeight: '1.6' },
        text: config.onLoseText || 'O time caiu. A história continua — mas nem toda derrota é o fim.',
      }));
    }

    box.append(el('div.btn-row', { style: { marginTop: '6px' } }, [
      el('button.btn.primary', {
        text: 'Continuar',
        onClick: () => { sfx('confirm'); box.remove(); resolve(); },
      }),
    ]));

    root.append(box);
    box.querySelector('.btn').focus();
  });
}
