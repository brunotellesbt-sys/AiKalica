// Ponte entre o jogo e os arquivos de arte em `assets/`.
//
// A regra: o jogo SEMPRE tenta carregar o arquivo público primeiro. Se ele
// existir, é ele que aparece — então dá para substituir qualquer personagem
// por arte feita à mão só sobrescrevendo o SVG. Se o arquivo faltar ou falhar
// ao carregar, o desenho procedural equivalente entra no lugar e o jogo
// continua rodando normalmente.

import { el, svgNode } from '../core/ui.js';
import { portrait, faceIcon } from './portraits.js';
import { sprite } from './sprites.js';
import { background } from './backgrounds.js';
import { walkSprite } from './walk.js';
import { CHARACTERS } from '../data/characters.js';
import { ENEMIES } from '../data/enemies.js';
import { EXTRA_CAST } from '../data/story/cast.js';
import { canonicalEmotion } from './emotions.js';

export const ASSET_ROOT = 'assets';

/** Cores de roupa do herói por elemento — espelha tools/build-assets.mjs. */
export const HERO_OUTFIT = {
  fire: '#8a3a2a', wind: '#2f6b52', lightning: '#7a6a2a',
  earth: '#6b5a3a', water: '#2f5a7a',
};

/** Pasta base de um personagem (o herói tem uma por elemento). */
function charBase(id, element) {
  if (id === 'hero') return `${ASSET_ROOT}/characters/hero/${element && HERO_OUTFIT[element] ? element : 'wind'}`;
  return `${ASSET_ROOT}/characters/${id}`;
}

const isChar = (id) => Boolean(CHARACTERS[id]);
const isExtra = (id) => Boolean(EXTRA_CAST[id]?.art);

// ------------------------------------------------------------------ URLs ---
export function portraitUrl(id, emotion = 'neutral', element = null) {
  const emo = canonicalEmotion(emotion);
  if (isChar(id)) return `${charBase(id, element)}/portrait/${emo}.svg`;
  if (isExtra(id)) return `${ASSET_ROOT}/cast/${id}/portrait/${emo}.svg`;
  return `${ASSET_ROOT}/enemies/${id}/portrait/${emo}.svg`;
}

export function faceUrl(id, element = null) {
  if (isChar(id)) return `${charBase(id, element)}/face.svg`;
  if (isExtra(id)) return `${ASSET_ROOT}/cast/${id}/face.svg`;
  return `${ASSET_ROOT}/enemies/${id}/battle.svg`;
}

export function battleUrl(id, element = null) {
  if (isChar(id)) return `${charBase(id, element)}/battle.svg`;
  return `${ASSET_ROOT}/enemies/${id}/battle.svg`;
}

export function walkUrl(id, dir = 'down', frame = 0, element = null) {
  if (isChar(id)) return `${charBase(id, element)}/walk/${dir}-${frame}.svg`;
  return `${ASSET_ROOT}/enemies/${id}/battle.svg`;
}

export function backgroundUrl(bgId) {
  return `${ASSET_ROOT}/backgrounds/${bgId}.svg`;
}

// --------------------------------------------------------------- elementos ---
/**
 * Cria um `<img>` apontando para o arquivo público, com queda para o SVG
 * desenhado em tempo real caso o arquivo não exista.
 * @param {string} url
 * @param {() => string} fallback  função que devolve o markup SVG reserva
 * @param {object} opts { alt, className }
 */
export function artImg(url, fallback, opts = {}) {
  const img = el('img.art', {
    src: url,
    alt: opts.alt || '',
    loading: opts.eager ? 'eager' : 'lazy',
    decoding: 'async',
    draggable: false,
  });
  if (opts.className) img.classList.add(...opts.className.split(/\s+/).filter(Boolean));

  img.addEventListener('error', () => {
    // Arquivo ausente ou corrompido: desenha o procedural no lugar.
    try {
      const node = svgNode(fallback());
      node.classList.add('art', 'art-fallback');
      if (opts.className) node.classList.add(...opts.className.split(/\s+/).filter(Boolean));
      img.replaceWith(node);
    } catch (err) {
      console.warn('Arte indisponível e sem reserva:', url, err);
    }
  }, { once: true });

  return img;
}

// --------------------------------------------------- atalhos por tipo de arte ---
function artOfAny(id) {
  return CHARACTERS[id]?.art || ENEMIES[id]?.art || EXTRA_CAST[id]?.art || {};
}

/** Retrato (busto) para a visual novel. */
export function portraitNode(id, emotion = 'neutral', { art = null, element = null, alt = '' } = {}) {
  const params = art || artOfAny(id);
  return artImg(
    portraitUrl(id, emotion, element),
    () => portrait(params, emotion),
    { alt, eager: true },
  );
}

/** Recorte do rosto, usado em listas e menus. */
export function faceNode(id, { art = null, element = null, emotion = 'neutral' } = {}) {
  const params = art || artOfAny(id);
  // O recorte do arquivo é sempre neutro; expressões vêm do procedural.
  if (emotion !== 'neutral') {
    const node = svgNode(faceIcon(params, emotion));
    node.classList.add('art');
    return node;
  }
  return artImg(faceUrl(id, element), () => faceIcon(params, 'neutral'), { eager: true });
}

/** Sprite de combate. */
export function battleNode(id, { art = null, element = null, flip = false } = {}) {
  const params = art || artOfAny(id);
  const node = artImg(battleUrl(id, element), () => sprite(params, { flip }), { eager: true });
  if (flip) node.classList.add('flip');
  return node;
}

/** Cenário 16:9. */
export function backgroundNode(bgId, opts = {}) {
  return artImg(backgroundUrl(bgId), () => background(bgId, opts), { className: 'bg-img', eager: true });
}

/** Quadro de caminhada, para o mapa. */
export function walkNode(id, dir = 'down', frame = 0, { art = null, element = null } = {}) {
  const params = art || artOfAny(id);
  return artImg(walkUrl(id, dir, frame, element), () => walkSprite(params, dir, frame), { eager: true });
}

/**
 * Pré-carrega os quadros de caminhada de um personagem como `Image`,
 * para o mapa poder desenhar em canvas sem piscar.
 * @returns {Promise<Record<string, HTMLImageElement>>}
 */
export function preloadWalk(id, element = null, art = null) {
  const params = art || artOfAny(id);
  const jobs = [];
  const out = {};

  for (const dir of ['down', 'up', 'left', 'right']) {
    for (let f = 0; f < 3; f++) {
      const key = `${dir}-${f}`;
      jobs.push(new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { out[key] = img; resolve(); };
        img.onerror = () => {
          // Reserva: rasteriza o procedural a partir de um data URI.
          const svg = walkSprite(params, dir, f);
          const fb = new Image();
          fb.onload = () => { out[key] = fb; resolve(); };
          fb.onerror = () => resolve();
          fb.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        };
        img.src = walkUrl(id, dir, f, element);
      }));
    }
  }

  return Promise.all(jobs).then(() => out);
}
