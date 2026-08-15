// Menu do jogo: time, jutsus, mochila, elos, registro de decisões, ajustes e saves.

import { el, svgNode, clear, modal, toast } from '../core/ui.js';
import { sfx, setAudioEnabled, setMusicEnabled } from '../core/audio.js';
import { settings, updateSettings, save, listSlots, formatPlaytime, currentPlaytime } from '../core/save.js';
import { faceIcon } from '../art/portraits.js';
import { faceNode } from '../art/assets.js';
import { CHARACTERS, ELEMENTS, STYLES, STAT_LABEL } from '../data/characters.js';
import { ITEMS, SLOTS, SHOP_STOCK } from '../data/items.js';
import { JUTSU } from '../data/jutsu.js';
import { ENDINGS } from '../data/story/endings.js';
import {
  state, partyRecords, rosterRecords, displayName, artOf, bond, bondHearts,
  karmaBalance, karmaLabel, itemCount, addItem, removeItem, addRyo, equip, unequip,
  joinParty, leaveParty, PARTY_MAX,
} from '../core/state.js';
import { allStats, maxHp, maxCk, expToNext, knownJutsu, upcomingJutsu, MAX_LEVEL } from '../systems/progression.js';

// --------------------------------------------------------------- helpers ----
function bar(kind, value, max) {
  const pct = max ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const b = el(`div.bar.${kind}`, {}, [el('i', { style: { width: pct + '%' } })]);
  if (kind === 'hp' && pct <= 30) b.classList.add('low');
  return b;
}

function elemBadge(elId) {
  const e = ELEMENTS[elId] || ELEMENTS.none;
  return el('span.elem-badge', { text: `${e.icon} ${e.name}`, style: { color: e.color } });
}

// ------------------------------------------------------------------ abas ----
function tabParty(body, rerender) {
  for (const rec of rosterRecords()) {
    const inParty = state.party.includes(rec.id);
    const def = CHARACTERS[rec.id];
    const stats = allStats(rec);
    const hpMax = maxHp(rec);
    const ckMax = maxCk(rec);
    const next = expToNext(rec.level);

    const card = el('div.char-card.panel', {}, [
      el('div.face', {}, [faceNode(rec.id, { art: artOf(rec.id), element: rec.element, emotion: rec.hp <= 0 ? 'sad' : 'neutral' })]),
      el('div.info', {}, [
        el('div.top', {}, [
          el('b', { text: displayName(rec.id) }),
          el('span.lv', { text: `Nível ${rec.level}` }),
          elemBadge(rec.element),
          rec.hp <= 0 ? el('span.elem-badge', { text: '✖ Fora de combate', style: { color: '#ff7a7a' } }) : null,
        ]),
        el('div.role', { text: `${def.title} · ${def.role}${rec.style ? ` · ${STYLES[rec.style].name}` : ''}` }),
        el('div.bars', {}, [
          el('div.barline', {}, [el('span.k', { text: 'HP' }), bar('hp', rec.hp, hpMax), el('span.v', { text: `${rec.hp}/${hpMax}` })]),
          el('div.barline', {}, [el('span.k', { text: 'CK' }), bar('ck', rec.ck, ckMax), el('span.v', { text: `${rec.ck}/${ckMax}` })]),
          el('div.barline', {}, [
            el('span.k', { text: 'EXP' }),
            bar('xp', rec.level >= MAX_LEVEL ? 1 : rec.exp, rec.level >= MAX_LEVEL ? 1 : next),
            el('span.v', { text: rec.level >= MAX_LEVEL ? 'MÁX' : `${rec.exp}/${next}` }),
          ]),
        ]),
        el('div.stat-grid', {}, ['atk', 'nin', 'def', 'res', 'spd', 'luck'].map((k) =>
          el('div.stat-box', {}, [el('span', { text: STAT_LABEL[k] }), el('b', { text: String(stats[k]) })])
        )),
        el('div.btn-row', { style: { marginTop: '8px' } }, [
          el('button.btn.small', {
            text: rec.row === 'front' ? '⚔️ Linha de frente' : '🛡️ Retaguarda',
            title: 'A retaguarda sofre e causa menos dano físico.',
            onClick: () => { sfx('select'); rec.row = rec.row === 'front' ? 'back' : 'front'; rerender(); },
          }),
          rec.id !== 'hero' ? el('button.btn.small', {
            text: inParty ? '➖ Sair do time' : '➕ Entrar no time',
            disabled: !inParty && state.party.length >= PARTY_MAX,
            onClick: () => {
              sfx('select');
              if (inParty) leaveParty(rec.id);
              else if (!joinParty(rec.id)) toast('O time já está cheio.', 'bad');
              rerender();
            },
          }) : null,
          el('button.btn.small.ghost', {
            text: '🎽 Equipar',
            onClick: () => equipDialog(rec, rerender),
          }),
        ]),
        el('div.tiny.muted', { style: { marginTop: '6px' }, text:
          Object.entries(rec.equip).map(([slot, id]) =>
            `${SLOTS[slot].icon} ${id ? ITEMS[id].name : '—'}`).join('   ') }),
        def.passive ? el('div.tiny', { style: { marginTop: '4px', color: '#e0a33c' }, text: `★ ${def.passive.desc}` }) : null,
      ]),
    ]);
    if (!inParty) card.style.opacity = '.62';
    body.append(card);
  }
  body.append(el('p.tiny.muted', { style: { textAlign: 'center' }, text: `Time ativo: ${state.party.length}/${PARTY_MAX} membros.` }));
}

function equipDialog(rec, rerender) {
  sfx('page');
  const wrap = el('div');
  for (const slot of Object.keys(SLOTS)) {
    wrap.append(el('div.section-title', { text: `${SLOTS[slot].icon} ${SLOTS[slot].name}` }));
    const current = rec.equip[slot];
    wrap.append(el('div.row-item', {}, [
      el('span.ico', { text: current ? ITEMS[current].icon : '—' }),
      el('span.txt', { html: current ? `<b>${ITEMS[current].name}</b><small>${ITEMS[current].desc}</small>` : '<b>Vazio</b>' }),
      current ? el('button.btn.small.ghost', {
        text: 'Retirar',
        onClick: (e) => { sfx('cancel'); unequip(rec.id, slot); e.target.closest('.modal-wrap')?.remove(); rerender(); equipDialog(rec, rerender); },
      }) : null,
    ]));

    const owned = Object.keys(state.inventory)
      .map((id) => ITEMS[id])
      .filter((it) => it?.kind === 'equip' && it.slot === slot && itemCount(it.id) > 0);

    if (!owned.length) wrap.append(el('p.tiny.muted', { style: { padding: '4px 8px' }, text: 'Nada disponível para este slot.' }));
    for (const it of owned) {
      wrap.append(el('div.row-item', {}, [
        el('span.ico', { text: it.icon }),
        el('span.txt', {
          html: `<b>${it.name}</b><small>${it.desc} — ${Object.entries(it.stats || {}).map(([k, v]) => `${STAT_LABEL[k]} ${v > 0 ? '+' : ''}${v}`).join(', ')}</small>`,
        }),
        el('span.qty', { text: `×${itemCount(it.id)}` }),
        el('button.btn.small', {
          text: 'Equipar',
          onClick: (e) => { sfx('confirm'); equip(rec.id, it.id); e.target.closest('.modal-wrap')?.remove(); rerender(); equipDialog(rec, rerender); },
        }),
      ]));
    }
  }
  modal({
    title: `Equipamento — ${displayName(rec.id)}`,
    body: el('div', { style: { maxHeight: '58vh', overflowY: 'auto' } }, [wrap]),
    buttons: [{ label: 'Fechar', value: null, primary: true }],
  });
}

function tabJutsu(body) {
  for (const rec of partyRecords()) {
    body.append(el('div.section-title', { text: `${displayName(rec.id)} — nível ${rec.level}` }));
    const known = knownJutsu(rec);
    if (!known.length) body.append(el('p.empty-note', { text: 'Nenhum jutsu ainda.' }));
    for (const j of known) {
      body.append(el('div.row-item', {}, [
        el('span.ico', { text: ELEMENTS[j.element]?.icon || '✴️' }),
        el('span.txt', { html: `<b>${j.name}</b><small>${j.desc}</small>` }),
        el('span.qty', { text: j.cost ? `${j.cost} CK` : '—' }),
      ]));
    }
    for (const j of upcomingJutsu(rec).slice(0, 3)) {
      body.append(el('div.row-item.locked', {}, [
        el('span.ico', { text: '🔒' }),
        el('span.txt', { html: `<b>${j.name}</b><small>Aprende no nível ${j.lv}.</small>` }),
      ]));
    }
  }
}

function tabBag(body, rerender) {
  const ids = Object.keys(state.inventory).filter((id) => itemCount(id) > 0);
  if (!ids.length) { body.append(el('p.empty-note', { text: 'A mochila está vazia.' })); return; }

  const groups = { consumable: 'Restauradores', tool: 'Ferramentas ninja', equip: 'Equipamentos' };
  for (const [kind, label] of Object.entries(groups)) {
    const list = ids.map((id) => ITEMS[id]).filter((it) => it?.kind === kind);
    if (!list.length) continue;
    body.append(el('div.section-title', { text: label }));
    for (const it of list) {
      body.append(el('div.row-item', {}, [
        el('span.ico', { text: it.icon }),
        el('span.txt', { html: `<b>${it.name}</b><small>${it.desc}</small>` }),
        el('span.qty', { text: `×${itemCount(it.id)}` }),
        it.field ? el('button.btn.small', {
          text: 'Usar',
          onClick: () => useFieldItem(it, rerender),
        }) : null,
      ]));
    }
  }
}

function useFieldItem(it, rerender) {
  sfx('select');
  const targets = it.target === 'allAllies' ? [null] : partyRecords();
  const wrap = el('div');

  const apply = (rec) => {
    const list = rec ? [rec] : partyRecords();
    let any = false;
    for (const r of list) {
      const e = it.effect || {};
      if (e.revive) {
        if (r.hp > 0) continue;
        r.hp = Math.round(maxHp(r) * e.revive); any = true;
      } else {
        if (r.hp <= 0 && !e.revive) continue;
        if (e.healHp) { const b = r.hp; r.hp = Math.min(maxHp(r), r.hp + e.healHp); any ||= r.hp > b; }
        if (e.healCk) { const b = r.ck; r.ck = Math.min(maxCk(r), r.ck + e.healCk); any ||= r.ck > b; }
        if (e.cure) any = true;
      }
    }
    if (!any) { toast('Não teve efeito.', 'bad'); return; }
    removeItem(it.id, 1);
    sfx('heal');
    toast(`${it.name} usado`, 'good');
    document.querySelector('.modal-wrap')?.remove();
    rerender();
  };

  if (it.target === 'allAllies') { apply(null); return; }

  for (const rec of targets) {
    wrap.append(el('div.row-item', {}, [
      el('span.ico', {}, []),
      el('span.txt', { html: `<b>${displayName(rec.id)}</b><small>${rec.hp}/${maxHp(rec)} HP · ${rec.ck}/${maxCk(rec)} CK</small>` }),
      el('button.btn.small', { text: 'Usar aqui', onClick: () => apply(rec) }),
    ]));
    wrap.lastChild.querySelector('.ico').append(svgNode(faceIcon(artOf(rec.id))));
    wrap.lastChild.querySelector('.ico').style.width = '34px';
  }
  modal({ title: `Usar ${it.name}`, body: wrap, buttons: [{ label: 'Cancelar', value: null }] });
}

function tabBonds(body) {
  body.append(el('div.section-title', { text: 'Elos' }));
  const ids = rosterRecords().map((r) => r.id).filter((id) => id !== 'hero');
  if (!ids.length) body.append(el('p.empty-note', { text: 'Você ainda anda sozinho.' }));

  for (const id of ids) {
    const h = bondHearts(id);
    const level = ['Desconhecidos', 'Colegas', 'Companheiros', 'Amigos', 'Camaradas', 'Inquebrável'][h];
    body.append(el('div.bond-row', {}, [
      el('div.mini', {}, [faceNode(id, { art: artOf(id), emotion: h >= 3 ? 'happy' : 'neutral' })]),
      el('div.who', {}, [
        el('b', { text: displayName(id) }),
        el('small', { text: `${level} · ${bond(id)}/100` }),
      ]),
      el('div.hearts', {
        html: Array.from({ length: 5 }, (_, i) => `<span class="${i < h ? 'on' : 'off'}">❤</span>`).join(''),
      }),
    ]));
  }

  body.append(el('div.section-title', { text: 'Caminho' }));
  const b = karmaBalance();
  body.append(el('div.karma-meter.panel', {}, [
    el('b', { text: karmaLabel() }),
    el('div.karma-bar', {}, [el('div.needle', { style: { left: `${((b + 1) / 2) * 100}%` } })]),
    el('div.karma-ends', {}, [
      el('span.dark', { text: '◀ Sombra' }),
      el('span.light', { text: 'Vontade de Fogo ▶' }),
    ]),
    el('p.tiny.muted', {
      style: { marginTop: '6px', lineHeight: '1.55' },
      text: 'Suas decisões pendem a balança. O caminho influencia diálogos, aliados e o final que você alcança.',
    }),
  ]));
}

function tabRecord(body) {
  body.append(el('div.section-title', { text: 'Decisões tomadas' }));
  if (!state.choices.length) body.append(el('p.empty-note', { text: 'Nenhuma decisão registrada ainda.' }));
  for (const c of [...state.choices].reverse().slice(0, 40)) {
    body.append(el('div.row-item', {}, [
      el('span.ico', { text: '▸' }),
      el('span.txt', { html: `<b>${c.label}</b><small>${c.chapter === 0 ? 'Prólogo' : `Capítulo ${c.chapter}`}${c.note ? ` · ${c.note}` : ''}</small>` }),
    ]));
  }

  body.append(el('div.section-title', { text: 'Números' }));
  const t = state.tally;
  const rows = [
    ['Batalhas vencidas', t.battlesWon], ['Batalhas perdidas', t.battlesLost],
    ['Decisões', t.choices], ['Inimigos poupados', t.spared],
    ['Tempo de jogo', formatPlaytime(currentPlaytime())], ['Ryo', state.ryo],
  ];
  for (const [k, v] of rows) {
    body.append(el('div.stat-box', {}, [el('span', { text: k }), el('b', { text: String(v) })]));
  }

  body.append(el('div.section-title', { text: 'Finais descobertos' }));
  for (const e of Object.values(ENDINGS)) {
    const got = state.endings.includes(e.id);
    body.append(el(`div.ending-card.panel${got ? '' : '.locked'}`, {}, [
      el('h4', { text: got ? e.title : '??? — final não descoberto' }),
      el('p', { text: got ? e.summary : 'Continue jogando para descobrir este desfecho.' }),
    ]));
  }
}

function tabSettings(body, rerender) {
  const row = (label, control, hint) =>
    el('div.row-item', {}, [
      el('span.txt', { html: `<b>${label}</b>${hint ? `<small>${hint}</small>` : ''}` }),
      control,
    ]);

  body.append(el('div.section-title', { text: 'Ajustes' }));

  const speedSel = el('select.btn.small', {
    onChange: (e) => { updateSettings({ textSpeed: Number(e.target.value) }); sfx('select'); },
  });
  for (const [label, val] of [['Lenta', 42], ['Normal', 22], ['Rápida', 10], ['Instantânea', 0]]) {
    speedSel.append(el('option', { value: String(val), text: label, selected: settings.textSpeed === val }));
  }
  body.append(row('Velocidade do texto', speedSel));

  const diffSel = el('select.btn.small', {
    onChange: (e) => { updateSettings({ difficulty: e.target.value }); sfx('select'); },
  });
  for (const [label, val] of [['Fácil', 'easy'], ['Normal', 'normal'], ['Difícil', 'hard']]) {
    diffSel.append(el('option', { value: val, text: label, selected: settings.difficulty === val }));
  }
  body.append(row('Dificuldade', diffSel, 'Afeta o dano e o HP dos inimigos.'));

  const toggle = (label, key, onToggle, hint) =>
    row(label, el('button.btn.small', {
      text: settings[key] ? 'Ligado' : 'Desligado',
      onClick: (e) => {
        const v = !settings[key];
        updateSettings({ [key]: v });
        onToggle?.(v);
        e.target.textContent = v ? 'Ligado' : 'Desligado';
        sfx('select');
      },
    }), hint);

  body.append(toggle('Efeitos sonoros', 'audio', setAudioEnabled));
  body.append(toggle('Música', 'music', setMusicEnabled));
  body.append(toggle('Avanço automático', 'autoAdvance', null, 'Avança o diálogo sozinho.'));
  body.append(toggle('Animações de batalha', 'battleAnim', null, 'Desligue para lutas mais rápidas.'));
}

function tabSaves(body, rerender, close) {
  body.append(el('div.section-title', { text: 'Salvar partida' }));
  for (const { slot, meta } of listSlots()) {
    body.append(el(`button.btn.slot.panel${meta ? '' : '.empty'}`, {
      onClick: async () => {
        if (meta) {
          const ok = await modal({
            title: `Sobrescrever slot ${slot}?`,
            body: `Isso apaga a partida de ${meta.heroName} (${meta.chapterTitle}).`,
            buttons: [{ label: 'Sobrescrever', value: true, primary: true }, { label: 'Cancelar', value: false }],
          });
          if (!ok) return;
        }
        const r = save(slot);
        sfx(r.ok ? 'confirm' : 'cancel');
        toast(r.ok ? `Salvo no slot ${slot}` : 'Não foi possível salvar', r.ok ? 'good' : 'bad');
        rerender();
      },
    }, [
      el('span.n', { text: String(slot) }),
      el('span.d', {
        html: meta
          ? `<b>${meta.heroName} — ${meta.chapterTitle}</b><small>Nível ${meta.level} · ${formatPlaytime(meta.playtime)} · ${new Date(meta.savedAt).toLocaleString('pt-BR')}</small>`
          : '<b>Slot vazio</b><small>Clique para salvar aqui</small>',
      }),
    ]));
  }
  body.append(el('p.tiny.muted', { style: { textAlign: 'center' }, text: 'O jogo também salva sozinho a cada cena e batalha.' }));

  body.append(el('div.section-title', { text: 'Sair' }));
  body.append(el('button.btn.ghost', {
    text: '↩ Voltar ao título',
    style: { width: '100%' },
    onClick: async () => {
      const ok = await modal({
        title: 'Voltar ao título?',
        body: 'O progresso não salvo manualmente permanece no autosave.',
        buttons: [{ label: 'Voltar ao título', value: true, primary: true }, { label: 'Cancelar', value: false }],
      });
      if (ok) { close('title'); }
    },
  }));
}

// ------------------------------------------------------------------ menu ----
const TABS = [
  { id: 'party', label: '👥 Time', render: tabParty },
  { id: 'jutsu', label: '🌀 Jutsus', render: tabJutsu },
  { id: 'bag', label: '🎒 Mochila', render: tabBag },
  { id: 'bonds', label: '❤ Elos', render: tabBonds },
  { id: 'record', label: '📜 Registro', render: tabRecord },
  { id: 'settings', label: '⚙ Ajustes', render: tabSettings },
  { id: 'saves', label: '💾 Salvar', render: tabSaves },
];

let activeTab = 'party';

/** Abre o menu. Resolve com 'close' ou 'title'. */
export function openMenu(initial = null) {
  sfx('page');
  if (initial) activeTab = initial;

  return new Promise((resolve) => {
    const screen = el('div.menu-screen');
    const body = el('div.menu-body');
    const tabsEl = el('div.menu-tabs');

    const close = (reason = 'close') => {
      document.removeEventListener('keydown', onKey);
      screen.remove();
      resolve(reason);
    };
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'm') { e.preventDefault(); sfx('cancel'); close(); }
    };

    const rerender = () => {
      clear(body);
      TABS.find((t) => t.id === activeTab)?.render(body, rerender, close);
      for (const b of tabsEl.children) b.classList.toggle('on', b.dataset.tab === activeTab);
    };

    for (const t of TABS) {
      tabsEl.append(el('button.tab', {
        text: t.label, dataset: { tab: t.id },
        onClick: () => { sfx('select'); activeTab = t.id; rerender(); body.scrollTop = 0; },
      }));
    }

    screen.append(
      el('div.menu-head', {}, [
        el('h2', { text: 'Pergaminho do Ninja' }),
        el('span.ryo', { text: `💰 ${state.ryo} ryo` }),
        el('button.icon-btn', { text: '✕', title: 'Fechar (Esc)', onClick: () => { sfx('cancel'); close(); } }),
      ]),
      tabsEl,
      body,
    );

    document.addEventListener('keydown', onKey);
    document.getElementById('app').append(screen);
    rerender();
  });
}

// ------------------------------------------------------------------ loja ----
/** Abre a loja de ferramentas ninja. */
export function openShop(tier = 1) {
  sfx('page');
  const stock = SHOP_STOCK[Math.min(4, Math.max(1, tier))] || SHOP_STOCK[1];

  return new Promise((resolve) => {
    const screen = el('div.menu-screen');
    const body = el('div.menu-body');
    const ryoEl = el('span.ryo', { text: `💰 ${state.ryo} ryo` });

    const close = () => { screen.remove(); resolve(); };
    const refresh = () => {
      ryoEl.textContent = `💰 ${state.ryo} ryo`;
      clear(body);
      render();
    };

    const render = () => {
      body.append(el('p.tiny.muted', {
        style: { textAlign: 'center', lineHeight: '1.6' },
        text: 'Loja de ferramentas ninja. Vender devolve 60% do valor.',
      }));

      body.append(el('div.section-title', { text: 'Comprar' }));
      for (const id of stock) {
        const it = ITEMS[id];
        if (!it) continue;
        const afford = state.ryo >= it.price;
        body.append(el(`div.row-item${afford ? '' : '.locked'}`, {}, [
          el('span.ico', { text: it.icon }),
          el('span.txt', { html: `<b>${it.name}</b><small>${it.desc}</small>` }),
          el('span.qty', { text: `${it.price} ryo` }),
          el('button.btn.small', {
            text: 'Comprar', disabled: !afford,
            onClick: () => { addRyo(-it.price); addItem(id, 1); sfx('confirm'); toast(`${it.name} comprado`, 'good'); refresh(); },
          }),
        ]));
      }

      const owned = Object.keys(state.inventory).filter((id) => itemCount(id) > 0);
      if (owned.length) {
        body.append(el('div.section-title', { text: 'Vender' }));
        for (const id of owned) {
          const it = ITEMS[id];
          if (!it || it.unique) continue;
          const value = Math.round((it.price || 10) * .6);
          body.append(el('div.row-item', {}, [
            el('span.ico', { text: it.icon }),
            el('span.txt', { html: `<b>${it.name}</b><small>Você tem ${itemCount(id)}</small>` }),
            el('span.qty', { text: `${value} ryo` }),
            el('button.btn.small.ghost', {
              text: 'Vender',
              onClick: () => { removeItem(id, 1); addRyo(value); sfx('select'); refresh(); },
            }),
          ]));
        }
      }

      body.append(el('button.btn.primary', {
        text: 'Sair da loja', style: { width: '100%', marginTop: '10px' },
        onClick: () => { sfx('cancel'); close(); },
      }));
    };

    screen.append(
      el('div.menu-head', {}, [el('h2', { text: '🏪 Armazém Shuriken' }), ryoEl]),
      body,
    );
    document.getElementById('app').append(screen);
    render();
  });
}
