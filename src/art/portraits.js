// Gerador procedural de retratos (bustos) em SVG.
// Nenhum asset externo: tudo é desenhado a partir dos parâmetros em `art`.

import { shade, alpha, nextId } from './palette.js';

const VB = { w: 200, h: 280 };

// ---------------------------------------------------------------- cabelo ---
const HAIR_BACK = {
  spiky: 'M 40 116 Q 36 50 100 40 Q 164 50 160 116 Q 100 92 40 116 Z',
  duck: 'M 40 118 Q 38 48 100 40 Q 162 48 160 118 L 180 62 L 172 112 L 194 84 L 174 130 Z',
  long: 'M 32 236 Q 26 62 100 40 Q 174 62 168 236 L 144 226 Q 156 96 100 84 Q 44 96 56 226 Z',
  messy: 'M 40 114 Q 38 52 100 42 Q 162 52 160 114 Q 100 90 40 114 Z',
  swept: 'M 40 114 Q 36 52 100 42 Q 164 52 158 114 Q 100 90 40 114 Z',
  ponytail: 'M 44 110 Q 42 50 100 42 Q 158 50 156 110 Q 100 88 44 110 Z'
    + ' M 148 84 Q 196 106 186 176 Q 178 214 156 202 Q 180 156 158 104 Z',
  buzz: 'M 46 108 Q 46 54 100 46 Q 154 54 154 108 Q 100 90 46 108 Z',
};

const HAIR_FRONT = {
  // Espetos irregulares de propósito: simétricos demais viram coroa.
  spiky:
    'M 42 110 L 24 78 L 54 88 L 40 46 L 72 80 L 78 58 L 100 76 L 122 34 L 132 74 L 160 56 L 152 88 L 178 72 L 158 110 Q 100 80 42 110 Z',
  duck:
    'M 44 106 Q 46 58 100 50 Q 154 58 156 106 Q 100 78 44 106 Z'
    + ' M 48 78 L 34 158 L 56 104 Z'
    + ' M 152 78 L 166 158 L 144 104 Z',
  long:
    'M 44 100 Q 52 58 100 54 Q 148 58 156 100 Q 128 72 100 76 Q 72 72 44 100 Z'
    + ' M 42 96 L 32 168 L 54 104 Z'
    + ' M 158 96 L 168 168 L 146 104 Z',
  messy:
    'M 42 108 Q 40 60 76 46 L 72 66 L 96 44 L 100 66 L 124 46 L 128 68 L 152 54 Q 162 74 158 108 Q 100 82 42 108 Z',
  swept:
    'M 40 108 Q 38 58 72 42 L 60 68 L 92 38 L 82 66 L 118 40 L 106 68 L 144 48 L 130 74 L 162 60 Q 168 84 158 108 Q 100 82 40 108 Z',
  ponytail:
    'M 44 102 Q 52 56 100 50 Q 148 56 156 102 Q 126 74 100 78 Q 74 74 44 102 Z',
  buzz:
    'M 46 104 Q 48 58 100 52 Q 152 58 154 104 Q 100 84 46 104 Z',
};

// ------------------------------------------------------------------ olhos ---
function eyes(emotion, color) {
  const L = 76, R = 124, y = 118;
  const iris = color || '#4a4a58';
  const dark = shade(iris, -0.45);

  const eyeball = (cx, flip = 1) => `
    <ellipse cx="${cx}" cy="${y}" rx="13" ry="15" fill="#fdfdfd"/>
    <ellipse cx="${cx + flip * 1.5}" cy="${y + 1}" rx="8.5" ry="11" fill="${iris}"/>
    <ellipse cx="${cx + flip * 1.5}" cy="${y + 1}" rx="4" ry="6" fill="${dark}"/>
    <circle cx="${cx + flip * 4}" cy="${y - 5}" r="3.2" fill="#fff" opacity=".95"/>`;

  switch (emotion) {
    case 'happy':
    case 'laugh':
      return `<path d="M ${L - 13} ${y + 3} Q ${L} ${y - 15} ${L + 13} ${y + 3}" stroke="#231d2b" stroke-width="4.5" fill="none" stroke-linecap="round"/>
              <path d="M ${R - 13} ${y + 3} Q ${R} ${y - 15} ${R + 13} ${y + 3}" stroke="#231d2b" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    case 'closed':
    case 'calm':
      return `<path d="M ${L - 12} ${y} Q ${L} ${y + 9} ${L + 12} ${y}" stroke="#231d2b" stroke-width="4" fill="none" stroke-linecap="round"/>
              <path d="M ${R - 12} ${y} Q ${R} ${y + 9} ${R + 12} ${y}" stroke="#231d2b" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case 'angry':
    case 'determined':
      return `${eyeball(L)}${eyeball(R, -1)}
              <path d="M ${L - 15} ${y - 12} L ${L + 15} ${y - 4} L ${L + 15} ${y - 14} Z" fill="#231d2b"/>
              <path d="M ${R + 15} ${y - 12} L ${R - 15} ${y - 4} L ${R - 15} ${y - 14} Z" fill="#231d2b"/>`;
    case 'sad':
      return `${eyeball(L)}${eyeball(R, -1)}
              <path d="M ${L - 15} ${y - 6} L ${L + 15} ${y - 13}" stroke="#231d2b" stroke-width="3.5" fill="none" stroke-linecap="round"/>
              <path d="M ${R + 15} ${y - 6} L ${R - 15} ${y - 13}" stroke="#231d2b" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    case 'shock':
    case 'scared':
      return `<ellipse cx="${L}" cy="${y}" rx="14" ry="17" fill="#fdfdfd"/>
              <circle cx="${L}" cy="${y}" r="5" fill="${dark}"/>
              <ellipse cx="${R}" cy="${y}" rx="14" ry="17" fill="#fdfdfd"/>
              <circle cx="${R}" cy="${y}" r="5" fill="${dark}"/>`;
    case 'smug':
    case 'smirk':
      return `${eyeball(L)}${eyeball(R, -1)}
              <rect x="${L - 15}" y="${y - 17}" width="30" height="12" fill="#f0c49a" opacity="0"/>
              <path d="M ${L - 14} ${y - 5} L ${L + 14} ${y - 5}" stroke="#231d2b" stroke-width="5" stroke-linecap="round"/>
              <path d="M ${R - 14} ${y - 5} L ${R + 14} ${y - 5}" stroke="#231d2b" stroke-width="5" stroke-linecap="round"/>`;
    default:
      return `${eyeball(L)}${eyeball(R, -1)}`;
  }
}

function brows(emotion) {
  const L = 76, R = 124, y = 96;
  const s = '#2a2230';
  switch (emotion) {
    case 'angry':
    case 'determined':
      return `<path d="M ${L - 15} ${y - 3} L ${L + 14} ${y + 6}" stroke="${s}" stroke-width="5" stroke-linecap="round"/>
              <path d="M ${R + 15} ${y - 3} L ${R - 14} ${y + 6}" stroke="${s}" stroke-width="5" stroke-linecap="round"/>`;
    case 'sad':
    case 'scared':
      return `<path d="M ${L - 15} ${y + 5} L ${L + 14} ${y - 4}" stroke="${s}" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M ${R + 15} ${y + 5} L ${R - 14} ${y - 4}" stroke="${s}" stroke-width="4.5" stroke-linecap="round"/>`;
    case 'shock':
      return `<path d="M ${L - 14} ${y - 6} Q ${L} ${y - 12} ${L + 14} ${y - 6}" stroke="${s}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
              <path d="M ${R - 14} ${y - 6} Q ${R} ${y - 12} ${R + 14} ${y - 6}" stroke="${s}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    default:
      return `<path d="M ${L - 14} ${y} Q ${L} ${y - 6} ${L + 13} ${y + 1}" stroke="${s}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
              <path d="M ${R + 14} ${y} Q ${R} ${y - 6} ${R - 13} ${y + 1}" stroke="${s}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  }
}

function mouth(emotion) {
  const x = 100, y = 152;
  const s = '#3a2028';
  switch (emotion) {
    case 'happy':
      return `<path d="M ${x - 13} ${y - 2} Q ${x} ${y + 12} ${x + 13} ${y - 2}" stroke="${s}" stroke-width="3.5" fill="#8a2f3a" stroke-linejoin="round"/>`;
    case 'laugh':
      return `<path d="M ${x - 17} ${y - 4} Q ${x} ${y + 20} ${x + 17} ${y - 4} Z" fill="#7a2530" stroke="${s}" stroke-width="3"/>
              <path d="M ${x - 12} ${y - 3} Q ${x} ${y + 1} ${x + 12} ${y - 3}" fill="#fff" opacity=".9"/>`;
    case 'angry':
      return `<path d="M ${x - 15} ${y + 6} Q ${x} ${y - 10} ${x + 15} ${y + 6} Q ${x} ${y + 2} ${x - 15} ${y + 6} Z" fill="#7a2530" stroke="${s}" stroke-width="3"/>`;
    case 'determined':
      return `<path d="M ${x - 12} ${y + 2} L ${x + 12} ${y - 1}" stroke="${s}" stroke-width="4" stroke-linecap="round"/>`;
    case 'sad':
      return `<path d="M ${x - 11} ${y + 5} Q ${x} ${y - 4} ${x + 11} ${y + 5}" stroke="${s}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    case 'shock':
    case 'scared':
      return `<ellipse cx="${x}" cy="${y + 2}" rx="8" ry="11" fill="#6e2028" stroke="${s}" stroke-width="2.5"/>`;
    case 'smug':
    case 'smirk':
      return `<path d="M ${x - 12} ${y + 1} Q ${x + 2} ${y + 8} ${x + 14} ${y - 5}" stroke="${s}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    default:
      return `<path d="M ${x - 9} ${y} Q ${x} ${y + 5} ${x + 9} ${y}" stroke="${s}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  }
}

// -------------------------------------------------------------- acessórios ---
function headband(art) {
  if (!art.headband && !art.band) return '';
  const c = art.bandColor || '#2b3a67';
  const tilt = art.bandTilt ? 'transform="rotate(-9 100 84)"' : '';
  const y = art.bandOnHead ? 52 : 82;
  const metal = shade('#b9c0c9', 0);
  return `<g ${tilt}>
    <rect x="38" y="${y - 12}" width="124" height="24" rx="5" fill="${c}"/>
    <rect x="38" y="${y - 12}" width="124" height="7" rx="3" fill="${shade(c, .18)}"/>
    <rect x="66" y="${y - 14}" width="68" height="28" rx="4" fill="${metal}" stroke="${shade(metal, -.4)}" stroke-width="2"/>
    <rect x="66" y="${y - 14}" width="68" height="9" rx="4" fill="#e6ebf0" opacity=".55"/>
    <g transform="translate(100 ${y}) scale(.9)" fill="none" stroke="${shade(metal, -.55)}" stroke-width="2.6" stroke-linecap="round">
      <path d="M 0 -7 C 7 -7 9 0 3 4 C -2 7 -7 4 -6 -1"/>
      <path d="M -6 -1 L -11 8"/>
    </g>
    ${art.bandSlash ? `<path d="M 44 ${y - 16} L 156 ${y + 14}" stroke="#4a4a52" stroke-width="4" stroke-linecap="round"/>` : ''}
  </g>`;
}

function marks(art) {
  switch (art.marks) {
    case 'whiskers':
      return `<g stroke="${shade(art.skin, -.42)}" stroke-width="3" stroke-linecap="round" opacity=".85">
        <path d="M 44 124 L 62 122"/><path d="M 44 134 L 62 131"/><path d="M 46 144 L 63 140"/>
        <path d="M 156 124 L 138 122"/><path d="M 156 134 L 138 131"/><path d="M 154 144 L 137 140"/>
      </g>`;
    case 'mask':
      return `<path d="M 50 128 Q 100 116 150 128 Q 152 176 100 186 Q 48 176 50 128 Z"
                    fill="${art.maskColor || '#2f3038'}" stroke="${shade(art.maskColor || '#2f3038', -.3)}" stroke-width="2"/>
              <path d="M 50 128 Q 100 116 150 128 L 150 136 Q 100 124 50 136 Z" fill="${shade(art.maskColor || '#2f3038', .12)}"/>`;
    case 'scar':
      return `<path d="M 128 96 L 140 140" stroke="${shade(art.skin, -.35)}" stroke-width="3.5" stroke-linecap="round"/>
              <path d="M 128 104 L 136 102 M 131 118 L 139 116" stroke="${shade(art.skin, -.35)}" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'seal':
      return `<g transform="translate(100 74)" fill="none" stroke="${art.sealColor || '#d4462f'}" stroke-width="2.6" opacity=".9">
        <path d="M 0 -8 C 9 -8 12 2 3 6 C -5 9 -11 3 -9 -3"/>
        <circle cx="0" cy="0" r="13" stroke-dasharray="4 5"/>
      </g>`;
    default:
      return '';
  }
}

function extras(art) {
  let out = '';
  if (art.hood) {
    out += `<path d="M 22 200 Q 10 70 100 26 Q 190 70 178 200 L 154 194 Q 168 84 100 62 Q 32 84 46 194 Z"
              fill="${art.outfit}" stroke="${shade(art.outfit, -.35)}" stroke-width="2.5"/>
            <path d="M 46 194 Q 32 110 100 84 Q 168 110 154 194 Z" fill="${alpha('#000', .55)}"/>`;
  }
  if (art.anbuMask) {
    out += `<path d="M 46 92 Q 100 74 154 92 Q 158 152 100 178 Q 42 152 46 92 Z"
              fill="#eae2d2" stroke="#8f8571" stroke-width="2.5"/>
            <path d="M 62 116 Q 78 106 92 116 Q 78 126 62 116 Z" fill="#2a2230"/>
            <path d="M 138 116 Q 122 106 108 116 Q 122 126 138 116 Z" fill="#2a2230"/>
            <path d="M 76 146 Q 100 140 124 146 Q 100 156 76 146 Z" fill="#a83a2a" opacity=".8"/>
            <path d="M 100 88 L 100 172" stroke="#c9bfa8" stroke-width="2"/>
            <path d="M 58 100 L 76 96 M 142 100 L 124 96" stroke="#a83a2a" stroke-width="3" stroke-linecap="round"/>`;
  }
  return out;
}

// ------------------------------------------------------------------ tronco ---
function torso(art) {
  const c = art.outfit || '#31527a';
  const c2 = art.outfit2 || shade(c, -.25);
  return `
    <path d="M 100 176 L 100 208" stroke="${shade(art.skin, -.12)}" stroke-width="30"/>
    <path d="M 100 200 C 46 206 18 232 8 280 L 192 280 C 182 232 154 206 100 200 Z"
          fill="${c}" stroke="${shade(c, -.35)}" stroke-width="2.5"/>
    <path d="M 100 200 L 74 280 L 100 272 L 126 280 Z" fill="${c2}"/>
    <path d="M 100 200 C 76 204 62 214 52 232" stroke="${shade(c, -.28)}" stroke-width="3" fill="none"/>
    <path d="M 100 200 C 124 204 138 214 148 232" stroke="${shade(c, -.28)}" stroke-width="3" fill="none"/>
    ${art.scarf ? `<path d="M 62 206 Q 100 226 138 206 Q 132 232 100 238 Q 68 232 62 206 Z" fill="${art.scarf}"/>` : ''}
    ${art.cloak ? `<path d="M 100 196 C 40 202 12 236 2 280 L 30 280 C 40 240 66 216 100 210 C 134 216 160 240 170 280 L 198 280 C 188 236 160 202 100 196 Z" fill="${art.cloak}"/>` : ''}`;
}

// ------------------------------------------------------------------ público ---
/**
 * Retorna o markup SVG de um retrato.
 * @param {object} art parâmetros visuais do personagem
 * @param {string} emotion neutral|happy|laugh|angry|determined|sad|shock|scared|smug|closed
 * @param {object} opts { w, glow, flip }
 */
export function portrait(art = {}, emotion = 'neutral', opts = {}) {
  const a = {
    skin: '#f0c49a', hair: '#3b2f4a', hairStyle: 'messy', eye: '#4a4a58',
    outfit: '#31527a', ...art,
  };
  const gid = nextId('p');
  const back = HAIR_BACK[a.hairStyle] || HAIR_BACK.messy;
  const front = HAIR_FRONT[a.hairStyle] || HAIR_FRONT.messy;
  const hairDark = shade(a.hair, -0.3);
  const skinDark = shade(a.skin, -0.18);

  return `<svg viewBox="0 0 ${VB.w} ${VB.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="retrato"
      ${opts.flip ? 'style="transform:scaleX(-1)"' : ''}>
    <defs>
      <radialGradient id="${gid}f" cx="42%" cy="34%" r="72%">
        <stop offset="0%" stop-color="${shade(a.skin, .12)}"/>
        <stop offset="100%" stop-color="${skinDark}"/>
      </radialGradient>
      <linearGradient id="${gid}h" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${shade(a.hair, .16)}"/>
        <stop offset="100%" stop-color="${hairDark}"/>
      </linearGradient>
      ${a.aura ? `<radialGradient id="${gid}a" cx="50%" cy="45%" r="60%">
        <stop offset="60%" stop-color="${alpha(a.aura, 0)}"/>
        <stop offset="100%" stop-color="${alpha(a.aura, .55)}"/>
      </radialGradient>` : ''}
    </defs>

    ${a.aura ? `<rect width="${VB.w}" height="${VB.h}" fill="url(#${gid}a)"/>` : ''}

    <g>
      <path d="${back}" fill="url(#${gid}h)"/>
      ${torso(a)}

      <!-- orelhas -->
      <ellipse cx="47" cy="124" rx="8" ry="12" fill="${skinDark}"/>
      <ellipse cx="153" cy="124" rx="8" ry="12" fill="${skinDark}"/>

      <!-- rosto -->
      <path d="M 100 46 C 60 46 48 78 48 112 C 48 148 72 176 100 176 C 128 176 152 148 152 112 C 152 78 140 46 100 46 Z"
            fill="url(#${gid}f)" stroke="${shade(a.skin, -.32)}" stroke-width="2"/>

      ${brows(emotion)}
      ${eyes(emotion, a.eye)}
      <path d="M 100 128 L 96 138 L 103 138" stroke="${shade(a.skin, -.28)}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      ${a.marks === 'mask' ? '' : mouth(emotion)}
      ${marks(a)}

      <path d="${front}" fill="url(#${gid}h)" stroke="${shade(a.hair, -.45)}" stroke-width="1.6" stroke-linejoin="round"/>
      ${headband(a)}
      ${extras(a)}

      ${emotion === 'angry'
        ? `<g stroke="#d4462f" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9">
             <path d="M 150 66 L 168 60 M 152 74 L 170 72 M 154 82 L 170 84"/>
           </g>` : ''}
      ${emotion === 'sad' || emotion === 'scared'
        ? `<path d="M 66 132 Q 62 148 68 156 Q 74 148 70 132 Z" fill="#8fd8f0" opacity=".8"/>` : ''}
      ${emotion === 'shock'
        ? `<g stroke="#4a6fa8" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".85">
             <path d="M 40 62 L 34 46 M 52 54 L 50 38 M 28 76 L 14 68"/>
           </g>` : ''}
    </g>
  </svg>`;
}

/** Versão recortada só do rosto (para listas e menus). */
export function faceIcon(art, emotion = 'neutral') {
  const full = portrait(art, emotion);
  return full.replace(`viewBox="0 0 ${VB.w} ${VB.h}"`, 'viewBox="34 32 132 156"');
}
