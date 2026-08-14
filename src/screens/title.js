// Tela de título, criação de personagem e carregamento de partidas.

import { el, svgNode, clear, mount, modal, toast, wait } from '../core/ui.js';
import { sfx, music, unlock } from '../core/audio.js';
import { background } from '../art/backgrounds.js';
import { portrait } from '../art/portraits.js';
import { ELEMENTS, STYLES, CHARACTERS } from '../data/characters.js';
import { ENDINGS } from '../data/story/endings.js';
import {
  listSlots, load, hasAutosave, AUTOSAVE_SLOT, formatPlaytime, galleryUnlocked, settings,
} from '../core/save.js';
import { newGame, state } from '../core/state.js';

const SWIRL = `<svg class="swirl" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="46" fill="none" stroke="#d4462f" stroke-width="6"/>
  <path d="M 50 14 C 74 14 84 40 66 54 C 50 66 32 54 36 38"
        fill="none" stroke="#d4462f" stroke-width="9" stroke-linecap="round"/>
  <path d="M 36 38 L 16 76" fill="none" stroke="#d4462f" stroke-width="9" stroke-linecap="round"/>
</svg>`;

function logo() {
  return el('div.game-logo', {}, [
    svgNode(SWIRL),
    el('h1', { text: 'Kalica no Sato' }),
    el('div.sub', { text: 'Crônicas do Ninja' }),
  ]);
}

function shell() {
  const screen = el('div.title-screen');
  const bg = el('div.bg-art');
  bg.append(svgNode(background('title')));
  screen.append(bg);
  return screen;
}

// ------------------------------------------------------- criação de ficha ---
function createCharacter() {
  return new Promise((resolve) => {
    const draft = { name: '', element: 'wind', style: 'ninjutsu' };

    const screen = shell();
    const preview = el('div', { style: { width: 'clamp(110px, 26vw, 168px)', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,.6))' } });
    const elemDesc = el('p.tiny.muted', { style: { textAlign: 'center', minHeight: '2.6em', maxWidth: '440px', lineHeight: '1.6' } });
    const styleDesc = el('p.tiny.muted', { style: { textAlign: 'center', minHeight: '3.4em', maxWidth: '440px', lineHeight: '1.6' } });

    const heroArt = () => {
      const outfit = {
        fire: '#8a3a2a', wind: '#2f6b52', lightning: '#7a6a2a', earth: '#6b5a3a', water: '#2f5a7a',
      }[draft.element];
      return { ...CHARACTERS.hero.art, outfit };
    };

    const redrawPreview = () => {
      clear(preview);
      preview.append(svgNode(portrait(heroArt(), 'determined')));
    };

    const nameInput = el('input.btn', {
      type: 'text', maxLength: 14, placeholder: 'Nome do seu ninja',
      value: '',
      style: { width: 'min(320px, 80vw)', textAlign: 'center', background: 'rgba(9,7,14,.85)' },
      onInput: (e) => { draft.name = e.target.value; },
    });

    const elemRow = el('div.btn-row', { style: { justifyContent: 'center' } });
    const styleRow = el('div.btn-row', { style: { justifyContent: 'center' } });

    const syncElem = () => {
      for (const b of elemRow.children) {
        const on = b.dataset.el === draft.element;
        b.classList.toggle('primary', on);
        b.style.opacity = on ? '1' : '.62';
      }
      const e = ELEMENTS[draft.element];
      elemDesc.innerHTML = `<b style="color:${e.color}">${e.name}</b> — forte contra ${ELEMENTS[{
        fire: 'wind', wind: 'lightning', lightning: 'earth', earth: 'water', water: 'fire',
      }[draft.element]].name}, fraco contra ${ELEMENTS[{
        fire: 'water', wind: 'fire', lightning: 'wind', earth: 'lightning', water: 'earth',
      }[draft.element]].name}.`;
      redrawPreview();
    };

    const syncStyle = () => {
      for (const b of styleRow.children) {
        const on = b.dataset.st === draft.style;
        b.classList.toggle('primary', on);
        b.style.opacity = on ? '1' : '.62';
      }
      styleDesc.textContent = STYLES[draft.style].desc;
    };

    for (const e of Object.values(ELEMENTS)) {
      if (e.id === 'none') continue;
      elemRow.append(el('button.btn.small', {
        text: `${e.icon} ${e.name.split(' ')[0]}`, dataset: { el: e.id },
        onClick: () => { sfx('select'); draft.element = e.id; syncElem(); },
      }));
    }
    for (const s of Object.values(STYLES)) {
      styleRow.append(el('button.btn.small', {
        text: `${s.icon} ${s.name}`, dataset: { st: s.id },
        onClick: () => { sfx('select'); draft.style = s.id; syncStyle(); },
      }));
    }

    screen.append(
      el('div.game-logo', {}, [el('h1', { text: 'Novo Ninja', style: { fontSize: 'clamp(22px,6vw,40px)' } })]),
      preview,
      el('div.section-title', { style: { color: '#e0a33c', letterSpacing: '2px' }, text: 'NOME' }),
      nameInput,
      el('div.section-title', { style: { color: '#e0a33c', letterSpacing: '2px' }, text: 'AFINIDADE ELEMENTAL' }),
      elemRow, elemDesc,
      el('div.section-title', { style: { color: '#e0a33c', letterSpacing: '2px' }, text: 'ESTILO DE LUTA' }),
      styleRow, styleDesc,
      el('div.btn-row', { style: { marginTop: '4px' } }, [
        el('button.btn.primary', {
          text: '▶ Começar a jornada',
          onClick: () => {
            const name = (draft.name || '').trim();
            if (!name) { toast('Escolha um nome para o seu ninja.', 'bad'); nameInput.focus(); return; }
            sfx('confirm');
            newGame({ name, element: draft.element, style: draft.style });
            resolve({ type: 'new' });
          },
        }),
        el('button.btn.ghost', { text: '← Voltar', onClick: () => { sfx('cancel'); resolve(null); } }),
      ]),
    );

    mount(screen).then(() => {
      syncElem();
      syncStyle();
      nameInput.focus();
    });
  });
}

// ------------------------------------------------------------- carregar ----
function loadScreen() {
  return new Promise((resolve) => {
    const screen = shell();
    const list = el('div.col', { style: { gap: '8px', width: 'min(520px, 92vw)' } });

    const slots = [{ slot: AUTOSAVE_SLOT, meta: hasAutosave() ? peekAuto() : null, auto: true }, ...listSlots()];

    for (const { slot, meta, auto } of slots) {
      list.append(el(`button.btn.slot.panel${meta ? '' : '.empty'}`, {
        disabled: !meta,
        onClick: () => {
          const r = load(slot);
          if (!r.ok) {
            sfx('cancel');
            toast(r.reason === 'version' ? 'Save de uma versão antiga.' : 'Não foi possível carregar.', 'bad');
            return;
          }
          sfx('confirm');
          resolve({ type: 'continue' });
        },
      }, [
        el('span.n', { text: auto ? '⟳' : String(slot) }),
        el('span.d', {
          html: meta
            ? `<b>${meta.heroName} — ${meta.chapterTitle}</b><small>${auto ? 'Automático · ' : ''}Nível ${meta.level} · ${formatPlaytime(meta.playtime)} · ${new Date(meta.savedAt).toLocaleString('pt-BR')}</small>`
            : `<b>${auto ? 'Sem autosave' : 'Slot vazio'}</b><small>—</small>`,
        }),
      ]));
    }

    screen.append(
      el('div.game-logo', {}, [el('h1', { text: 'Continuar', style: { fontSize: 'clamp(22px,6vw,40px)' } })]),
      list,
      el('button.btn.ghost', { text: '← Voltar', onClick: () => { sfx('cancel'); resolve(null); } }),
    );
    mount(screen);
  });
}

function peekAuto() {
  // `listSlots` só cobre os slots manuais; o autosave é lido sob demanda.
  try {
    const raw = localStorage.getItem('kalica.save.auto');
    return raw ? JSON.parse(raw).meta : null;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------- galeria ----
function galleryScreen() {
  return new Promise((resolve) => {
    const screen = shell();
    const unlocked = galleryUnlocked();
    const list = el('div.col', { style: { gap: '8px', width: 'min(560px, 92vw)', maxHeight: '58vh', overflowY: 'auto' } });

    for (const e of Object.values(ENDINGS)) {
      const got = unlocked.includes(e.id);
      list.append(el(`div.ending-card.panel${got ? '' : '.locked'}`, {}, [
        el('h4', { text: got ? `${e.kicker} — ${e.title}` : '??? — final não descoberto' }),
        el('p', { text: got ? e.summary : 'Jogue de novo tomando outras decisões para descobrir este desfecho.' }),
      ]));
    }

    screen.append(
      el('div.game-logo', {}, [el('h1', { text: 'Finais', style: { fontSize: 'clamp(22px,6vw,40px)' } })]),
      el('p.tiny.muted', { text: `${unlocked.length} de ${Object.keys(ENDINGS).length} descobertos.` }),
      list,
      el('button.btn.ghost', { text: '← Voltar', onClick: () => { sfx('cancel'); resolve(null); } }),
    );
    mount(screen);
  });
}

function howToPlay() {
  return modal({
    title: 'Como jogar',
    body: el('div', { style: { fontSize: 'clamp(11px,2.9vw,13px)', lineHeight: '1.7' } }, [
      el('p', { html: '<b>História:</b> clique (ou Espaço/Enter) para avançar o diálogo. Escolhas mudam elos, karma, aliados recrutáveis e o final.' }),
      el('p', { html: '<b>Batalha:</b> turnos ordenados por velocidade. Cada ação gasta chakra. A cadeia elemental é <i>Fogo ▸ Vento ▸ Raio ▸ Terra ▸ Água ▸ Fogo</i> — atacar o elemento certo causa 50% a mais de dano.' }),
      el('p', { html: '<b>Formação:</b> personagens na retaguarda causam e sofrem menos dano físico. Use para proteger curandeiros.' }),
      el('p', { html: '<b>Vontade de Fogo:</b> a barra enche conforme o time apanha e revida. Cheia, libera jutsus combinados devastadores.' }),
      el('p', { html: '<b>Substituição:</b> gasta 10 de chakra e anula por completo o próximo golpe recebido — vale ouro contra chefes.' }),
      el('p', { html: '<b>Atalhos:</b> <i>M</i> abre o menu, <i>L</i> o histórico, <i>Esc</i> fecha janelas.' }),
    ]),
    buttons: [{ label: 'Entendi', value: true, primary: true }],
  });
}

// --------------------------------------------------------------- título ----
/** Mostra o título e resolve com a ação escolhida. */
export async function showTitle() {
  for (;;) {
    const action = await titleMenu();
    if (action === 'new') {
      const r = await createCharacter();
      if (r) return r;
    } else if (action === 'load') {
      const r = await loadScreen();
      if (r) return r;
    } else if (action === 'continue') {
      const res = load(AUTOSAVE_SLOT);
      if (res.ok) return { type: 'continue' };
      toast('Nenhum autosave encontrado.', 'bad');
    } else if (action === 'gallery') {
      await galleryScreen();
    } else if (action === 'help') {
      await howToPlay();
    }
  }
}

function titleMenu() {
  return new Promise((resolve) => {
    const screen = shell();
    const menu = el('div.title-menu');

    const auto = hasAutosave() ? peekAuto() : null;

    const add = (label, action, primary = false, sub = null) =>
      menu.append(el(`button.btn${primary ? '.primary' : ''}`, {
        html: sub ? `${label}<br><small style="opacity:.75;font-weight:400">${sub}</small>` : label,
        onClick: () => { unlock(); sfx('confirm'); resolve(action); },
      }));

    if (auto) add('▶ Continuar', 'continue', true, `${auto.heroName} · ${auto.chapterTitle}`);
    add(auto ? 'Nova partida' : '▶ Nova partida', 'new', !auto);
    add('Carregar partida', 'load');
    add('Galeria de finais', 'gallery');
    add('Como jogar', 'help');

    screen.append(
      logo(),
      menu,
      el('p.title-foot', {
        html: 'Fangame não-comercial, feito por diversão. RPG de turnos + visual novel com escolhas ramificadas.<br>'
          + 'Toda a arte e o áudio são gerados proceduralmente em tempo real — nenhum asset de terceiros é usado.',
      }),
    );

    mount(screen).then(() => {
      music('title');
      menu.querySelector('.btn')?.focus();
    });
  });
}
