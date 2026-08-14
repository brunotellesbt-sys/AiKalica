// Sprites "chibi" de batalha, desenhados proceduralmente em SVG.

import { shade, alpha, nextId } from './palette.js';

const W = 120, H = 170;

const CHIBI_HAIR = {
  spiky: 'M 26 46 L 14 18 L 34 30 L 30 2 L 48 24 L 54 -4 L 68 22 L 82 -2 L 88 26 L 106 8 L 104 34 L 118 20 L 96 48 Q 60 26 26 46 Z',
  duck: 'M 26 48 Q 24 8 60 4 Q 96 8 94 48 L 110 14 L 106 44 L 120 28 L 104 58 Z',
  long: 'M 22 118 Q 18 14 60 6 Q 102 14 98 118 L 84 112 Q 92 34 60 30 Q 28 34 36 112 Z',
  messy: 'M 24 46 Q 22 14 44 4 L 42 18 L 58 2 L 60 18 L 74 4 L 78 20 L 94 10 Q 100 26 96 46 Q 60 28 24 46 Z',
  swept: 'M 24 46 Q 22 14 44 2 L 34 20 L 56 -2 L 50 18 L 72 0 L 66 20 L 90 6 L 82 24 L 102 16 Q 106 32 96 46 Q 60 28 24 46 Z',
  ponytail: 'M 26 44 Q 26 8 60 4 Q 94 8 94 44 Q 60 26 26 44 Z M 90 24 Q 118 38 112 82 Q 106 106 94 98 Q 108 70 96 36 Z',
  buzz: 'M 28 44 Q 30 10 60 6 Q 90 10 92 44 Q 60 30 28 44 Z',
};

function humanSprite(a, opts) {
  const gid = nextId('s');
  const skin = a.skin || '#e8bd96';
  const hair = a.hair || '#3a2f26';
  const c = a.outfit || '#31527a';
  const c2 = a.outfit2 || shade(c, -.3);
  const hairPath = CHIBI_HAIR[a.hairStyle] || CHIBI_HAIR.messy;
  const band = a.headband || a.band;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="lutador"
      ${opts.flip ? 'style="transform:scaleX(-1)"' : ''}>
    <defs>
      <radialGradient id="${gid}s" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stop-color="${shade(skin, .12)}"/><stop offset="100%" stop-color="${shade(skin, -.16)}"/>
      </radialGradient>
      ${a.aura ? `<radialGradient id="${gid}a" cx="50%" cy="42%" r="55%">
        <stop offset="55%" stop-color="${alpha(a.aura, 0)}"/><stop offset="100%" stop-color="${alpha(a.aura, .6)}"/>
      </radialGradient>` : ''}
    </defs>

    <ellipse cx="60" cy="163" rx="30" ry="6" fill="#000" opacity=".38"/>
    ${a.aura ? `<rect width="${W}" height="${H}" fill="url(#${gid}a)"/>` : ''}

    <g>
      <animateTransform attributeName="transform" type="translate"
        values="0 0; 0 -2.5; 0 0" dur="2.6s" repeatCount="indefinite"/>

      <!-- pernas -->
      <rect x="44" y="126" width="13" height="30" rx="6" fill="${c2}"/>
      <rect x="63" y="126" width="13" height="30" rx="6" fill="${c2}"/>
      <rect x="42" y="150" width="17" height="10" rx="4" fill="#2b2430"/>
      <rect x="61" y="150" width="17" height="10" rx="4" fill="#2b2430"/>

      <!-- tronco -->
      <path d="M 38 92 Q 60 84 82 92 L 86 132 Q 60 140 34 132 Z"
            fill="${c}" stroke="${shade(c, -.4)}" stroke-width="2"/>
      <path d="M 60 86 L 60 136" stroke="${shade(c, -.28)}" stroke-width="2.5"/>
      <path d="M 38 92 Q 60 84 82 92 L 83 102 Q 60 94 37 102 Z" fill="${c2}"/>
      ${a.cloak ? `<path d="M 34 92 Q 60 82 86 92 L 98 152 L 78 146 Q 60 152 42 146 L 22 152 Z" fill="${a.cloak}" opacity=".92"/>` : ''}

      <!-- braços -->
      <rect x="24" y="94" width="12" height="34" rx="6" fill="${skin}" transform="rotate(9 30 94)"/>
      <rect x="84" y="94" width="12" height="34" rx="6" fill="${skin}" transform="rotate(-9 90 94)"/>

      <!-- cabeça -->
      <g>
        <path d="${hairPath}" fill="${shade(hair, -.22)}" transform="translate(0 2)"/>
        <circle cx="60" cy="50" r="33" fill="url(#${gid}s)" stroke="${shade(skin, -.3)}" stroke-width="2"/>
        ${a.mask ? `<path d="M 30 56 Q 60 48 90 56 Q 92 82 60 86 Q 28 82 30 56 Z" fill="${a.maskColor || '#2f3038'}"/>` : ''}
        ${a.anbuMask ? `<path d="M 30 36 Q 60 26 90 36 Q 92 72 60 84 Q 28 72 30 36 Z" fill="#eae2d2" stroke="#8f8571" stroke-width="2"/>
            <path d="M 40 50 Q 50 44 58 50 Q 50 56 40 50 Z M 80 50 Q 70 44 62 50 Q 70 56 80 50 Z" fill="#2a2230"/>
            <path d="M 38 40 L 50 38 M 82 40 L 70 38" stroke="#a83a2a" stroke-width="2.5" stroke-linecap="round"/>` : ''}
        ${!a.mask && !a.anbuMask ? `
          <ellipse cx="47" cy="54" rx="5.5" ry="7" fill="#fff"/>
          <circle cx="48" cy="55" r="3.4" fill="${a.eye || '#3a3a48'}"/>
          <ellipse cx="73" cy="54" rx="5.5" ry="7" fill="#fff"/>
          <circle cx="72" cy="55" r="3.4" fill="${a.eye || '#3a3a48'}"/>
          <path d="M 54 70 Q 60 74 66 70" stroke="#3a2028" stroke-width="2.4" fill="none" stroke-linecap="round"/>` : ''}
        ${a.marks === 'whiskers' ? `<g stroke="${shade(skin, -.4)}" stroke-width="1.8" stroke-linecap="round" opacity=".8">
            <path d="M 30 58 L 40 57 M 30 64 L 40 62 M 90 58 L 80 57 M 90 64 L 80 62"/></g>` : ''}
        ${a.scar ? `<path d="M 76 36 L 82 60" stroke="${shade(skin, -.38)}" stroke-width="2.4" stroke-linecap="round"/>` : ''}
        <path d="${hairPath}" fill="${hair}" stroke="${shade(hair, -.5)}" stroke-width="1.4" stroke-linejoin="round"/>
        ${band ? `<g ${a.bandTilt ? 'transform="rotate(-10 60 34)"' : ''}>
            <rect x="24" y="24" width="72" height="15" rx="4" fill="${a.bandColor || '#2b3a67'}"/>
            <rect x="42" y="22" width="36" height="18" rx="3" fill="#b9c0c9" stroke="#7d848d" stroke-width="1.6"/>
            <g transform="translate(60 31) scale(.62)" fill="none" stroke="#5c636b" stroke-width="3" stroke-linecap="round">
              <path d="M 0 -7 C 7 -7 9 0 3 4 C -2 7 -7 4 -6 -1"/><path d="M -6 -1 L -11 8"/>
            </g>
            ${a.bandSlash ? `<path d="M 28 20 L 92 42" stroke="#4a4a52" stroke-width="3" stroke-linecap="round"/>` : ''}
          </g>` : ''}
        ${a.hood ? `<path d="M 16 96 Q 8 20 60 2 Q 112 20 104 96 L 88 92 Q 96 32 60 22 Q 24 32 32 92 Z" fill="${c}"/>
                    <path d="M 32 92 Q 24 44 60 34 Q 96 44 88 92 Z" fill="${alpha('#000', .6)}"/>` : ''}
      </g>
    </g>
  </svg>`;
}

function wolfSprite(a, opts) {
  const fur = a.fur || '#6b6257';
  const fur2 = a.fur2 || shade(fur, -.35);
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="besta"
      ${opts.flip ? 'style="transform:scaleX(-1)"' : ''}>
    <ellipse cx="60" cy="163" rx="34" ry="6" fill="#000" opacity=".38"/>
    <g>
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 -2; 0 0" dur="2.2s" repeatCount="indefinite"/>
      <path d="M 22 120 L 26 156 L 36 156 L 34 120 Z" fill="${fur2}"/>
      <path d="M 84 120 L 88 156 L 98 156 L 94 120 Z" fill="${fur2}"/>
      <path d="M 18 100 Q 60 78 102 100 Q 108 130 96 142 Q 60 152 24 142 Q 12 130 18 100 Z"
            fill="${fur}" stroke="${shade(fur, -.45)}" stroke-width="2"/>
      <path d="M 18 100 Q 60 82 102 100 Q 60 108 18 100 Z" fill="${shade(fur, .12)}"/>
      <path d="M 100 108 Q 128 96 132 74 Q 122 82 112 84" fill="${fur}" stroke="${shade(fur, -.4)}" stroke-width="2"/>
      <!-- cabeça -->
      <path d="M 6 92 Q 2 62 24 54 Q 46 46 58 62 Q 66 78 54 94 Q 30 104 6 92 Z"
            fill="${fur}" stroke="${shade(fur, -.45)}" stroke-width="2"/>
      <path d="M 20 56 L 14 32 L 34 48 Z" fill="${fur2}"/>
      <path d="M 44 52 L 46 28 L 58 50 Z" fill="${fur2}"/>
      <path d="M 6 92 Q 0 84 4 76 L 20 80 Z" fill="${fur2}"/>
      <circle cx="14" cy="80" r="3.4" fill="#1a1620"/>
      <ellipse cx="26" cy="70" rx="6" ry="4.6" fill="${a.eye || '#e8c34a'}"/>
      <ellipse cx="26" cy="70" rx="2" ry="4.4" fill="#1a1620"/>
      <ellipse cx="46" cy="72" rx="6" ry="4.6" fill="${a.eye || '#e8c34a'}"/>
      <ellipse cx="46" cy="72" rx="2" ry="4.4" fill="#1a1620"/>
      <path d="M 10 86 L 18 92 L 26 86 L 34 92" stroke="#fff" stroke-width="2.4" fill="none"/>
    </g>
  </svg>`;
}

function puppetSprite(a, opts) {
  const w = a.wood || '#8a6a44';
  const w2 = a.wood2 || shade(w, -.35);
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="marionete"
      ${opts.flip ? 'style="transform:scaleX(-1)"' : ''}>
    <ellipse cx="60" cy="163" rx="28" ry="6" fill="#000" opacity=".38"/>
    <g stroke="${shade(w, -.5)}" stroke-width="1.8">
      <animateTransform attributeName="transform" type="translate" values="0 0; 0 -3; 0 0" dur="3.4s" repeatCount="indefinite"/>
      <path d="M 60 6 L 60 24" stroke="#cfc6b0" stroke-width="1"/>
      <rect x="46" y="124" width="12" height="18" rx="3" fill="${w2}"/>
      <rect x="62" y="124" width="12" height="18" rx="3" fill="${w2}"/>
      <rect x="44" y="146" width="16" height="12" rx="3" fill="${w2}"/>
      <rect x="60" y="146" width="16" height="12" rx="3" fill="${w2}"/>
      <rect x="38" y="88" width="44" height="36" rx="7" fill="${w}"/>
      <rect x="44" y="96" width="32" height="8" rx="3" fill="${w2}"/>
      <rect x="44" y="108" width="32" height="8" rx="3" fill="${w2}"/>
      <rect x="22" y="90" width="12" height="32" rx="5" fill="${w}"/>
      <rect x="86" y="90" width="12" height="32" rx="5" fill="${w}"/>
      <circle cx="28" cy="90" r="6" fill="${w2}"/>
      <circle cx="92" cy="90" r="6" fill="${w2}"/>
      <path d="M 34 52 Q 34 26 60 26 Q 86 26 86 52 Q 86 82 60 84 Q 34 82 34 52 Z" fill="${w}"/>
      <path d="M 34 62 L 86 62" stroke="${shade(w, -.45)}"/>
      <ellipse cx="48" cy="52" rx="6" ry="7" fill="#1a1620" stroke="none"/>
      <ellipse cx="72" cy="52" rx="6" ry="7" fill="#1a1620" stroke="none"/>
      <circle cx="48" cy="52" r="2.6" fill="${a.eye || '#d44a2a'}" stroke="none"/>
      <circle cx="72" cy="52" r="2.6" fill="${a.eye || '#d44a2a'}" stroke="none"/>
      <path d="M 46 72 L 74 72" stroke="${shade(w, -.5)}" stroke-width="2.6"/>
      <path d="M 52 68 L 52 76 M 60 68 L 60 76 M 68 68 L 68 76" stroke="${shade(w, -.5)}" stroke-width="1.6"/>
    </g>
  </svg>`;
}

function dummySprite(a, opts) {
  const c = a.outfit || '#8a6d4a';
  const c2 = a.outfit2 || shade(c, -.35);
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="boneco"
      ${opts.flip ? 'style="transform:scaleX(-1)"' : ''}>
    <ellipse cx="60" cy="163" rx="26" ry="6" fill="#000" opacity=".38"/>
    <rect x="52" y="120" width="16" height="40" fill="${c2}"/>
    <rect x="40" y="152" width="40" height="9" rx="3" fill="${shade(c2, -.2)}"/>
    <rect x="18" y="86" width="84" height="12" rx="5" fill="${c2}"/>
    <ellipse cx="60" cy="98" rx="30" ry="30" fill="${c}" stroke="${shade(c, -.4)}" stroke-width="2"/>
    <path d="M 34 84 Q 60 76 86 84 M 32 98 Q 60 92 88 98 M 34 112 Q 60 118 86 112"
          stroke="${shade(c, -.3)}" stroke-width="2.5" fill="none"/>
    <circle cx="60" cy="98" r="12" fill="none" stroke="#d4462f" stroke-width="3"/>
    <circle cx="60" cy="98" r="4" fill="#d4462f"/>
    <ellipse cx="60" cy="52" rx="20" ry="22" fill="${c}" stroke="${shade(c, -.4)}" stroke-width="2"/>
    <path d="M 50 48 L 58 48 M 62 48 L 70 48" stroke="#2a2230" stroke-width="3" stroke-linecap="round"/>
    <path d="M 52 62 Q 60 58 68 62" stroke="#2a2230" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </svg>`;
}

/**
 * Sprite de batalha.
 * @param {object} art  parâmetros visuais (aceita `type`: human|wolf|puppet|dummy)
 * @param {object} opts { flip }
 */
export function sprite(art = {}, opts = {}) {
  switch (art.type) {
    case 'wolf': return wolfSprite(art, opts);
    case 'puppet': return puppetSprite(art, opts);
    case 'dummy': return dummySprite(art, opts);
    default: return humanSprite(art, opts);
  }
}
