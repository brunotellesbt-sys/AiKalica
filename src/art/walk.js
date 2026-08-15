// Sprites de caminhada para o mapa: 4 direções × 3 quadros (parado, passo
// esquerdo, passo direito). Visão 3/4 de cima, no estilo dos RPGs 2D clássicos.
//
// Usa os mesmos parâmetros de `art` dos retratos, então cada personagem anda
// pelo mapa com o próprio cabelo, roupa e bandana.

import { shade, alpha, nextId } from './palette.js';

const W = 32, H = 44;

export const DIRECTIONS = ['down', 'up', 'left', 'right'];
export const FRAMES = 3;

/** Cabelo visto de frente, por estilo. */
const HAIR_FRONT = {
  spiky: 'M 5 14 L 2 6 L 8 9 L 6 1 L 12 7 L 14 -1 L 18 6 L 22 -1 L 24 8 L 29 3 L 28 10 L 31 8 L 27 15 Q 16 9 5 14 Z',
  duck: 'M 5 14 Q 5 4 16 3 Q 27 4 27 14 L 31 5 L 30 12 Z',
  long: 'M 4 15 Q 4 3 16 2 Q 28 3 28 15 L 29 30 L 25 29 Q 27 11 16 10 Q 5 11 7 29 L 3 30 Z',
  messy: 'M 5 14 Q 4 5 11 2 L 10 6 L 15 1 L 16 6 L 21 2 L 22 6 L 27 4 Q 29 8 27 14 Q 16 9 5 14 Z',
  swept: 'M 4 14 Q 4 4 12 1 L 9 6 L 16 0 L 14 6 L 21 1 L 19 6 L 26 2 L 24 7 L 29 5 Q 30 9 27 14 Q 16 9 4 14 Z',
  ponytail: 'M 5 13 Q 5 3 16 2 Q 27 3 27 13 Q 16 8 5 13 Z M 25 8 Q 32 12 30 22 Q 28 27 25 25 Q 29 17 26 11 Z',
  buzz: 'M 6 13 Q 6 4 16 3 Q 26 4 26 13 Q 16 9 6 13 Z',
};

/** Cabelo visto de trás (mais cheio, sem franja). */
const HAIR_BACK = {
  spiky: 'M 4 16 L 1 6 L 8 10 L 6 0 L 12 8 L 15 -2 L 18 8 L 23 -1 L 25 9 L 30 3 L 29 16 Q 16 20 4 16 Z',
  duck: 'M 4 17 Q 4 3 16 2 Q 28 3 28 17 L 31 6 L 30 14 Q 16 20 4 17 Z',
  long: 'M 3 32 Q 2 3 16 2 Q 30 3 29 32 L 24 31 Q 26 12 16 11 Q 6 12 8 31 Z',
  messy: 'M 4 16 Q 4 4 16 2 Q 28 4 28 16 Q 16 20 4 16 Z',
  swept: 'M 4 16 Q 3 4 16 2 Q 29 4 28 16 Q 16 20 4 16 Z',
  ponytail: 'M 5 15 Q 5 3 16 2 Q 27 3 27 15 Q 16 19 5 15 Z M 13 14 Q 22 18 20 32 Q 18 38 14 36 Q 19 26 12 17 Z',
  buzz: 'M 6 15 Q 6 4 16 3 Q 26 4 26 15 Q 16 18 6 15 Z',
};

/** Cabelo de perfil (olhando para a direita). */
const HAIR_SIDE = {
  spiky: 'M 6 15 L 2 6 L 8 9 L 7 1 L 13 7 L 16 0 L 20 7 L 26 4 L 25 14 Q 16 10 6 15 Z',
  duck: 'M 6 15 Q 6 4 17 3 Q 26 5 25 15 L 30 6 L 29 13 Z',
  long: 'M 5 15 Q 5 3 17 2 Q 28 4 27 15 L 27 30 L 22 29 Q 25 11 16 10 Q 8 11 9 28 L 5 29 Z',
  messy: 'M 6 15 Q 5 5 12 2 L 11 6 L 16 1 L 18 6 L 24 3 Q 26 8 25 15 Q 16 10 6 15 Z',
  swept: 'M 5 15 Q 5 4 13 1 L 10 6 L 17 0 L 15 6 L 22 2 L 20 7 L 27 4 Q 28 9 25 15 Q 16 10 5 15 Z',
  ponytail: 'M 6 14 Q 6 3 17 2 Q 27 4 26 14 Q 16 9 6 14 Z M 8 9 Q 1 13 3 23 Q 5 28 8 26 Q 4 18 7 12 Z',
  buzz: 'M 7 14 Q 7 4 17 3 Q 26 5 25 14 Q 16 10 7 14 Z',
};

/** Deslocamento das pernas por quadro: 0 parado, 1 e 2 alternam o passo. */
function legs(frame, c2, dir) {
  const dark = shade(c2, -.25);
  if (dir === 'left' || dir === 'right') {
    // De perfil as pernas cruzam na horizontal.
    const off = frame === 0 ? 0 : frame === 1 ? 3 : -3;
    return `
      <rect x="${13 - off}" y="35" width="6" height="8" rx="2.5" fill="${dark}"/>
      <rect x="${13 + off}" y="35" width="6" height="8" rx="2.5" fill="${c2}"/>`;
  }
  const lift = frame === 1 ? 2 : 0;
  const lift2 = frame === 2 ? 2 : 0;
  return `
    <rect x="11" y="${35 - lift}" width="5.5" height="${8 + lift}" rx="2.5" fill="${c2}"/>
    <rect x="16" y="${35 - lift2}" width="5.5" height="${8 + lift2}" rx="2.5" fill="${dark}"/>`;
}

function arms(frame, skin, dir) {
  if (dir === 'left' || dir === 'right') {
    const sw = frame === 1 ? -2 : frame === 2 ? 2 : 0;
    return `<rect x="${15 + sw}" y="25" width="4.5" height="9" rx="2.2" fill="${skin}"/>`;
  }
  const sw = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  return `
    <rect x="${6 + sw}" y="25" width="4.5" height="9" rx="2.2" fill="${skin}"/>
    <rect x="${21 - sw}" y="25" width="4.5" height="9" rx="2.2" fill="${skin}"/>`;
}

function band(a, dir) {
  if (!a.headband && !a.band) return '';
  const c = a.bandColor || '#2b3a67';
  if (dir === 'up') return `<rect x="5" y="10" width="22" height="5" rx="1.5" fill="${c}"/>`;
  const plate = dir === 'left' || dir === 'right'
    ? '<rect x="15" y="9" width="10" height="6" rx="1" fill="#b9c0c9" stroke="#7d848d" stroke-width=".7"/>'
    : '<rect x="11" y="9" width="10" height="6" rx="1" fill="#b9c0c9" stroke="#7d848d" stroke-width=".7"/>';
  return `<rect x="5" y="10" width="22" height="5" rx="1.5" fill="${c}"/>${plate}`;
}

function face(a, dir, frame) {
  if (dir === 'up') return '';
  const eye = a.eye || '#3a3a48';
  const blink = frame === 2 ? 1 : 0; // pisca sutil no passo direito
  if (dir === 'left' || dir === 'right') {
    return `<ellipse cx="21" cy="18" rx="1.8" ry="${2.4 - blink}" fill="${eye}"/>
            ${a.mask ? `<path d="M 10 19 Q 20 17 27 20 Q 26 25 18 26 Q 11 24 10 19 Z" fill="${a.maskColor || '#2f3038'}"/>` : ''}`;
  }
  return `
    <ellipse cx="12" cy="18" rx="1.9" ry="${2.5 - blink}" fill="${eye}"/>
    <ellipse cx="20" cy="18" rx="1.9" ry="${2.5 - blink}" fill="${eye}"/>
    ${a.marks === 'whiskers' ? `<g stroke="${shade(a.skin || '#e8bd96', -.35)}" stroke-width=".7" opacity=".8">
        <path d="M 5 19 L 9 18.6 M 5 21 L 9 20.4 M 27 19 L 23 18.6 M 27 21 L 23 20.4"/></g>` : ''}
    ${a.mask ? `<path d="M 6 19 Q 16 17 26 19 Q 25 25 16 26 Q 7 25 6 19 Z" fill="${a.maskColor || '#2f3038'}"/>` : ''}`;
}

/**
 * Sprite de caminhada.
 * @param {object} art  parâmetros visuais do personagem
 * @param {'down'|'up'|'left'|'right'} dir
 * @param {0|1|2} frame
 */
export function walkSprite(art = {}, dir = 'down', frame = 0) {
  const a = {
    skin: '#e8bd96', hair: '#3a2f26', hairStyle: 'messy',
    outfit: '#31527a', eye: '#3a3a48', ...art,
  };
  const c = a.outfit;
  const c2 = a.outfit2 || shade(c, -.3);
  const gid = nextId('w');
  const flip = dir === 'left';

  const hairPath = dir === 'up' ? HAIR_BACK[a.hairStyle] || HAIR_BACK.messy
    : (dir === 'left' || dir === 'right') ? HAIR_SIDE[a.hairStyle] || HAIR_SIDE.messy
      : HAIR_FRONT[a.hairStyle] || HAIR_FRONT.messy;

  const bob = frame === 0 ? 0 : -1;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"
      shape-rendering="geometricPrecision" role="img" aria-label="personagem">
    <ellipse cx="16" cy="42" rx="9" ry="2.6" fill="#000" opacity=".3"/>
    <g ${flip ? 'transform="scale(-1,1) translate(-32,0)"' : ''}>
      <g transform="translate(0 ${bob})">
        ${legs(frame, c2, dir)}
        <!-- tronco -->
        <path d="M 9 24 Q 16 22 23 24 L 24 36 Q 16 38 8 36 Z"
              fill="${c}" stroke="${shade(c, -.4)}" stroke-width=".8"/>
        <path d="M 9 24 Q 16 22 23 24 L 23 27 Q 16 25 9 27 Z" fill="${c2}"/>
        ${a.cloak ? `<path d="M 8 24 Q 16 21 24 24 L 27 40 L 20 38 Q 16 40 12 38 L 5 40 Z" fill="${a.cloak}" opacity=".9"/>` : ''}
        ${arms(frame, a.skin, dir)}
        <!-- cabeça -->
        <circle cx="16" cy="16" r="11.5" fill="${a.skin}" stroke="${shade(a.skin, -.3)}" stroke-width=".8"/>
        ${face(a, dir, frame)}
        <path d="${hairPath}" fill="${a.hair}" stroke="${shade(a.hair, -.45)}" stroke-width=".6" stroke-linejoin="round"/>
        ${band(a, dir)}
      </g>
    </g>
  </svg>`;
}

/** Todos os quadros de um personagem, como { 'down-0': '<svg…>', … }. */
export function walkSheet(art) {
  const out = {};
  for (const dir of DIRECTIONS) {
    for (let f = 0; f < FRAMES; f++) {
      out[`${dir}-${f}`] = walkSprite(art, dir, f);
    }
  }
  return out;
}
