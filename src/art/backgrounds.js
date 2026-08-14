// Cenários procedurais em SVG (16:9). Determinísticos: não consomem o RNG do jogo.

import { shade, alpha, nextId } from './palette.js';

const W = 1200, H = 675;

/** Ruído estável por índice — mesma cena desenha sempre igual. */
const noise = (i) => {
  const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

function sky(gid, top, bottom) {
  return `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${top}"/><stop offset="100%" stop-color="${bottom}"/>
  </linearGradient>`;
}

function stars(count = 70, maxY = 340) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = noise(i * 3.1) * W;
    const y = noise(i * 7.7) * maxY;
    const r = 0.7 + noise(i * 2.3) * 1.6;
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${(0.25 + noise(i * 5.5) * 0.7).toFixed(2)}"/>`;
  }
  return out;
}

function mountains(baseY, color, seedOff = 0, amp = 150, step = 150) {
  let d = `M -50 ${H} L -50 ${baseY}`;
  for (let x = -50, i = 0; x <= W + 100; x += step, i++) {
    const peak = baseY - amp * (0.45 + noise(i + seedOff) * 0.75);
    d += ` L ${x + step / 2} ${peak.toFixed(0)} L ${x + step} ${(baseY - amp * 0.12 * noise(i + seedOff + 9)).toFixed(0)}`;
  }
  d += ` L ${W + 100} ${H} Z`;
  return `<path d="${d}" fill="${color}"/>`;
}

function tree(x, y, s, trunk, leaf) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-9" y="-40" width="18" height="60" rx="4" fill="${trunk}"/>
    <ellipse cx="0" cy="-70" rx="62" ry="46" fill="${leaf}"/>
    <ellipse cx="-34" cy="-46" rx="42" ry="32" fill="${shade(leaf, -.1)}"/>
    <ellipse cx="34" cy="-48" rx="40" ry="30" fill="${shade(leaf, .08)}"/>
    <ellipse cx="0" cy="-96" rx="44" ry="32" fill="${shade(leaf, .12)}"/>
  </g>`;
}

function treeRow(y, s, count, trunk, leaf, seedOff = 0) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = (i / (count - 1)) * (W + 200) - 100 + (noise(i + seedOff) - .5) * 90;
    out += tree(x, y + (noise(i + seedOff + 3) - .5) * 22, s * (0.85 + noise(i + seedOff + 6) * 0.35), trunk, leaf);
  }
  return out;
}

function pines(y, s, count, color, seedOff = 0) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = (i / count) * (W + 160) - 80 + noise(i + seedOff) * 60;
    const sc = s * (0.8 + noise(i + seedOff + 2) * 0.5);
    out += `<g transform="translate(${x.toFixed(0)} ${y}) scale(${sc.toFixed(2)})">
      <rect x="-6" y="-20" width="12" height="40" fill="${shade(color, -.5)}"/>
      <path d="M 0 -160 L 46 -60 L -46 -60 Z" fill="${color}"/>
      <path d="M 0 -110 L 56 -20 L -56 -20 Z" fill="${shade(color, -.12)}"/>
    </g>`;
  }
  return out;
}

function lanterns(y, count, seedOff = 0) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = (i / count) * W + 40 + noise(i + seedOff) * 30;
    out += `<g transform="translate(${x.toFixed(0)} ${y})">
      <path d="M 0 -30 L 0 -12" stroke="#4a3a2a" stroke-width="2"/>
      <ellipse cx="0" cy="0" rx="13" ry="17" fill="#e8873a" opacity=".92"/>
      <ellipse cx="0" cy="0" rx="13" ry="17" fill="none" stroke="#7a3a1a" stroke-width="2"/>
      <circle cx="0" cy="0" r="30" fill="#ffb45c" opacity=".16"/>
    </g>`;
  }
  return out;
}

function roof(x, y, w, h, color) {
  return `<path d="M ${x - w / 2 - 18} ${y} L ${x - w / 2 + 14} ${y - h} L ${x + w / 2 - 14} ${y - h} L ${x + w / 2 + 18} ${y} Z"
    fill="${color}" stroke="${shade(color, -.35)}" stroke-width="2"/>`;
}

function house(x, y, w, h, wall, roofC) {
  return `<g>
    <rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="${wall}" stroke="${shade(wall, -.3)}" stroke-width="2"/>
    ${roof(x, y - h, w * 1.16, h * 0.42, roofC)}
    <rect x="${x - w * .22}" y="${y - h * .55}" width="${w * .2}" height="${h * .3}" fill="#f0d9a0" opacity=".8"/>
    <rect x="${x + w * .05}" y="${y - h * .55}" width="${w * .2}" height="${h * .3}" fill="#f0d9a0" opacity=".8"/>
  </g>`;
}

function fog(y, color, op = .3) {
  return `<ellipse cx="${W * .3}" cy="${y}" rx="520" ry="70" fill="${color}" opacity="${op}"/>
          <ellipse cx="${W * .75}" cy="${y + 40}" rx="470" ry="60" fill="${color}" opacity="${op * .8}"/>`;
}

// ---------------------------------------------------------------- cenários ---
const SCENES = {
  village(gid) {
    return `<defs>${sky(gid, '#7fc2e8', '#ffd9a0')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      <circle cx="960" cy="150" r="62" fill="#fff3c4" opacity=".9"/>
      <circle cx="960" cy="150" r="110" fill="#fff3c4" opacity=".18"/>
      ${mountains(400, '#7d94b8', 1, 190, 240)}
      ${mountains(440, '#5d7398', 5, 130, 180)}
      <path d="M 300 440 L 300 300 L 360 300 L 360 440 Z" fill="#8a6a4a"/>
      <path d="M 250 300 L 410 300 L 410 282 L 250 282 Z" fill="#c9a05a"/>
      <rect x="0" y="440" width="${W}" height="${H - 440}" fill="#6f9a58"/>
      <rect x="0" y="440" width="${W}" height="26" fill="#8ab469"/>
      ${house(150, 470, 150, 100, '#e6d8bc', '#b1543c')}
      ${house(400, 480, 180, 118, '#dfd0b2', '#a8503a')}
      ${house(700, 470, 160, 104, '#e6d8bc', '#9c4a36')}
      ${house(980, 484, 200, 128, '#dfd0b2', '#b1543c')}
      <path d="M 0 560 Q 300 530 600 560 Q 900 590 1200 556 L 1200 675 L 0 675 Z" fill="#c9a97a"/>
      <path d="M 0 560 Q 300 530 600 560 Q 900 590 1200 556" stroke="#a88a5f" stroke-width="4" fill="none"/>
      ${treeRow(600, .55, 7, '#6b4a2a', '#4f7f45', 11)}`;
  },

  villageNight(gid) {
    return `<defs>${sky(gid, '#0d1330', '#3a2b4a')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${stars(90, 400)}
      <circle cx="240" cy="130" r="52" fill="#f4efd8"/>
      <circle cx="222" cy="120" r="46" fill="#0d1330"/>
      <circle cx="240" cy="130" r="100" fill="#f4efd8" opacity=".12"/>
      ${mountains(410, '#2a3350', 1, 190, 240)}
      <rect x="0" y="440" width="${W}" height="${H - 440}" fill="#233020"/>
      ${house(150, 470, 150, 100, '#3a3446', '#5a2f2a')}
      ${house(400, 480, 180, 118, '#332e40', '#4f2b28')}
      ${house(700, 470, 160, 104, '#3a3446', '#4a2926')}
      ${house(980, 484, 200, 128, '#332e40', '#5a2f2a')}
      ${lanterns(430, 8, 4)}
      <path d="M 0 560 Q 300 534 600 560 Q 900 588 1200 556 L 1200 675 L 0 675 Z" fill="#2e2a36"/>`;
  },

  academy(gid) {
    return `<defs>${sky(gid, '#9ed4f0', '#e8f2d8')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${mountains(380, '#93a9c4', 3, 130, 220)}
      <rect x="0" y="410" width="${W}" height="${H - 410}" fill="#c2a878"/>
      <rect x="120" y="150" width="960" height="270" rx="8" fill="#e8d9b8" stroke="#b09a72" stroke-width="3"/>
      ${roof(600, 150, 1040, 90, '#a8503a')}
      <rect x="180" y="230" width="120" height="120" fill="#7fa8c4" stroke="#8a7a5a" stroke-width="4"/>
      <rect x="360" y="230" width="120" height="120" fill="#7fa8c4" stroke="#8a7a5a" stroke-width="4"/>
      <rect x="720" y="230" width="120" height="120" fill="#7fa8c4" stroke="#8a7a5a" stroke-width="4"/>
      <rect x="900" y="230" width="120" height="120" fill="#7fa8c4" stroke="#8a7a5a" stroke-width="4"/>
      <rect x="540" y="250" width="120" height="170" fill="#8a6a4a"/>
      <circle cx="600" cy="120" r="46" fill="#e8d9b8" stroke="#b09a72" stroke-width="3"/>
      <g transform="translate(600 120) scale(2.2)" fill="none" stroke="#a8503a" stroke-width="3" stroke-linecap="round">
        <path d="M 0 -7 C 7 -7 9 0 3 4 C -2 7 -7 4 -6 -1"/><path d="M -6 -1 L -11 8"/>
      </g>
      ${treeRow(470, .5, 5, '#6b4a2a', '#5a8f4c', 21)}`;
  },

  trainingField(gid) {
    return `<defs>${sky(gid, '#8fd0ea', '#f2e6c0')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      <circle cx="200" cy="120" r="118" fill="#fff6d0" opacity=".16"/>
      <circle cx="200" cy="120" r="52" fill="#fff8dc" opacity=".88"/>
      ${mountains(400, '#8aa0be', 7, 160, 260)}
      ${pines(430, .8, 9, '#3f6b3f', 13)}
      <rect x="0" y="430" width="${W}" height="${H - 430}" fill="#7ba55f"/>
      <rect x="0" y="430" width="${W}" height="20" fill="#96bd72"/>
      <ellipse cx="600" cy="620" rx="700" ry="120" fill="#c0a878"/>
      <g>
        <rect x="270" y="360" width="26" height="120" fill="#7a5a3a"/>
        <rect x="240" y="330" width="86" height="40" rx="6" fill="#8a6a44"/>
        <rect x="880" y="370" width="26" height="110" fill="#7a5a3a"/>
        <rect x="850" y="342" width="86" height="40" rx="6" fill="#8a6a44"/>
      </g>
      ${treeRow(500, .45, 6, '#6b4a2a', '#4f7f45', 31)}`;
  },

  forest(gid) {
    return `<defs>${sky(gid, '#a8d8ea', '#d8eec0')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${pines(340, .95, 8, '#3a5f3a', 41)}
      ${treeRow(420, .85, 6, '#5a3f26', '#43713c', 45)}
      <rect x="0" y="440" width="${W}" height="${H - 440}" fill="#4a6b3a"/>
      <ellipse cx="600" cy="600" rx="680" ry="130" fill="#6e8c4e"/>
      <path d="M 300 675 Q 500 520 700 675 Z" fill="#3c5a30" opacity=".5"/>
      ${treeRow(660, 1.5, 4, '#4a3320', '#355c2e', 51)}`;
  },

  deepForest(gid) {
    return `<defs>${sky(gid, '#1e3326', '#3f5a35')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${pines(300, 1.2, 7, '#20361f', 61)}
      ${pines(400, 1.0, 8, '#182b18', 67)}
      <rect x="0" y="450" width="${W}" height="${H - 450}" fill="#1d2c19"/>
      ${fog(470, '#7fa87f', .18)}
      <g>
        <rect x="60" y="120" width="46" height="560" fill="#2a2118"/>
        <rect x="1080" y="80" width="58" height="600" fill="#241c14"/>
        <rect x="420" y="180" width="34" height="500" fill="#2a2118"/>
      </g>
      ${treeRow(680, 1.7, 3, '#241a10', '#22401f', 71)}
      <circle cx="880" cy="220" r="6" fill="#c8f07a" opacity=".8"/>
      <circle cx="300" cy="320" r="5" fill="#c8f07a" opacity=".7"/>
      <circle cx="740" cy="380" r="4" fill="#c8f07a" opacity=".6"/>`;
  },

  bridge(gid) {
    return `<defs>${sky(gid, '#b8d8e8', '#e8dcc0')}${sky(gid + 'w', '#6fa8c4', '#3f6f8a')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${fog(300, '#dfe8ee', .55)}
      ${mountains(330, '#94a8b8', 81, 140, 260)}
      <rect x="0" y="400" width="${W}" height="${H - 400}" fill="url(#${gid}w)"/>
      <g opacity=".35" stroke="#cfe4ef" stroke-width="3" fill="none">
        <path d="M 0 470 Q 150 460 300 470 Q 450 480 600 470"/>
        <path d="M 400 540 Q 550 530 700 540 Q 850 550 1000 540"/>
        <path d="M 100 610 Q 250 600 400 610 Q 550 620 700 610"/>
      </g>
      <rect x="0" y="380" width="${W}" height="46" fill="#9a7a52"/>
      <rect x="0" y="374" width="${W}" height="10" fill="#b89a6a"/>
      <g fill="#7a5a3a">
        <rect x="120" y="426" width="24" height="250"/>
        <rect x="480" y="426" width="24" height="250"/>
        <rect x="840" y="426" width="24" height="250"/>
      </g>
      <g stroke="#8a6a44" stroke-width="9" fill="none">
        <path d="M 0 320 L ${W} 320"/>
      </g>
      <g fill="#8a6a44">
        <rect x="60" y="320" width="14" height="60"/><rect x="300" y="320" width="14" height="60"/>
        <rect x="620" y="320" width="14" height="60"/><rect x="940" y="320" width="14" height="60"/>
      </g>`;
  },

  coast(gid) {
    return `<defs>${sky(gid, '#f0a86a', '#f6d9a0')}${sky(gid + 'w', '#4a7f9a', '#28546b')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      <circle cx="880" cy="330" r="70" fill="#ffefc0"/>
      <circle cx="880" cy="330" r="140" fill="#ffd9a0" opacity=".3"/>
      <rect x="0" y="360" width="${W}" height="200" fill="url(#${gid}w)"/>
      <path d="M 700 360 Q 880 340 1060 360 L 1060 400 Q 880 380 700 400 Z" fill="#ffce8a" opacity=".55"/>
      <path d="M 0 545 Q 300 520 600 548 Q 900 576 1200 542 L 1200 675 L 0 675 Z" fill="#e0c48f"/>
      <path d="M 0 545 Q 300 520 600 548 Q 900 576 1200 542" stroke="#f2ddb0" stroke-width="8" fill="none"/>
      <g fill="#3a5a3a">
        <path d="M 120 560 L 128 470 L 136 560 Z"/>
        <ellipse cx="130" cy="464" rx="52" ry="16"/>
        <ellipse cx="112" cy="450" rx="40" ry="13" transform="rotate(-24 112 450)"/>
        <ellipse cx="150" cy="450" rx="40" ry="13" transform="rotate(24 150 450)"/>
      </g>`;
  },

  cave(gid) {
    return `<defs>${sky(gid, '#20181f', '#0c0910')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      <path d="M 0 0 L 0 180 Q 200 300 420 250 Q 600 210 800 268 Q 1000 320 1200 200 L 1200 0 Z" fill="#241c26"/>
      <g fill="#2c2330">
        <path d="M 140 180 L 178 320 L 216 180 Z"/><path d="M 420 240 L 452 380 L 486 240 Z"/>
        <path d="M 760 262 L 792 400 L 826 262 Z"/><path d="M 1020 210 L 1046 330 L 1076 210 Z"/>
      </g>
      <rect x="0" y="500" width="${W}" height="${H - 500}" fill="#1a1420"/>
      <path d="M 0 500 Q 300 470 600 502 Q 900 534 1200 496 L 1200 560 L 0 560 Z" fill="#2a2130"/>
      <g fill="#2c2330">
        <path d="M 220 500 L 250 400 L 280 500 Z"/><path d="M 640 502 L 672 392 L 704 502 Z"/>
        <path d="M 980 498 L 1006 420 L 1034 498 Z"/>
      </g>
      <circle cx="300" cy="330" r="7" fill="#6fd8e8" opacity=".9"/>
      <circle cx="300" cy="330" r="34" fill="#6fd8e8" opacity=".12"/>
      <circle cx="880" cy="420" r="6" fill="#6fd8e8" opacity=".8"/>
      <circle cx="880" cy="420" r="30" fill="#6fd8e8" opacity=".1"/>`;
  },

  swamp(gid) {
    return `<defs>${sky(gid, '#4a5340', '#8a8a5a')}${sky(gid + 'w', '#4a5a3a', '#2a3524')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${fog(360, '#9aa87a', .35)}
      ${pines(360, .9, 7, '#2f4030', 91)}
      <rect x="0" y="430" width="${W}" height="${H - 430}" fill="url(#${gid}w)"/>
      <g fill="#3a4a2c" opacity=".85">
        <ellipse cx="180" cy="520" rx="90" ry="22"/><ellipse cx="520" cy="580" rx="120" ry="26"/>
        <ellipse cx="900" cy="540" rx="100" ry="24"/><ellipse cx="1100" cy="620" rx="110" ry="26"/>
      </g>
      <g stroke="#5a4a30" stroke-width="10" fill="none" opacity=".9">
        <path d="M 260 430 L 250 620"/><path d="M 700 420 L 716 620"/><path d="M 1040 440 L 1028 600"/>
      </g>
      ${fog(560, '#a8b48a', .22)}
      <g fill="#6a7a4a" opacity=".7">
        <ellipse cx="380" cy="500" rx="34" ry="9"/><ellipse cx="820" cy="470" rx="28" ry="8"/>
      </g>`;
  },

  arena(gid) {
    return `<defs>${sky(gid, '#8fc8e8', '#e8dcb8')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      <path d="M -100 420 Q 600 250 1300 420 L 1300 675 L -100 675 Z" fill="#8a7a5a"/>
      <path d="M -100 420 Q 600 250 1300 420 L 1300 470 Q 600 310 -100 470 Z" fill="#a89a76"/>
      <g fill="#6a5a44" opacity=".8">
        ${Array.from({ length: 26 }, (_, i) => {
          const x = -60 + i * 50;
          const y = 300 + Math.abs(i - 13) * 9;
          return `<circle cx="${x}" cy="${y}" r="9"/><circle cx="${x + 25}" cy="${y + 22}" r="9"/>`;
        }).join('')}
      </g>
      <rect x="0" y="470" width="${W}" height="${H - 470}" fill="#c4b088"/>
      <ellipse cx="600" cy="600" rx="560" ry="110" fill="#d4c096"/>
      <ellipse cx="600" cy="600" rx="560" ry="110" fill="none" stroke="#a08c68" stroke-width="5"/>
      <g stroke="#8a7a5a" stroke-width="4" fill="none" opacity=".6">
        <path d="M 320 560 L 880 640"/><path d="M 320 640 L 880 560"/>
      </g>`;
  },

  ruins(gid) {
    return `<defs>${sky(gid, '#6a5a70', '#c08a6a')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${mountains(400, '#4f4458', 101, 170, 240)}
      <rect x="0" y="450" width="${W}" height="${H - 450}" fill="#5a5048"/>
      <g fill="#6e6458" stroke="#4a4238" stroke-width="3">
        <rect x="90" y="250" width="60" height="220"/>
        <rect x="70" y="230" width="100" height="26"/>
        <rect x="330" y="310" width="54" height="160"/>
        <rect x="850" y="270" width="60" height="200"/>
        <rect x="830" y="250" width="100" height="26"/>
        <rect x="1080" y="330" width="50" height="140"/>
      </g>
      <path d="M 430 470 L 470 350 L 640 350 L 680 470 Z" fill="#655b50" stroke="#463e36" stroke-width="3"/>
      <path d="M 470 350 L 500 300 L 610 300 L 640 350 Z" fill="#77695c"/>
      <g fill="#4f4740">
        <rect x="200" y="440" width="80" height="30"/><rect x="720" y="450" width="110" height="22"/>
      </g>
      <ellipse cx="600" cy="620" rx="640" ry="110" fill="#6a6058"/>
      ${fog(500, '#9a8a7a', .18)}`;
  },

  ruinsNight(gid) {
    return `<defs>${sky(gid, '#0e0c1a', '#2a1a30')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${stars(80, 380)}
      <circle cx="980" cy="140" r="58" fill="#e8e0f0"/>
      <circle cx="980" cy="140" r="120" fill="#e8e0f0" opacity=".1"/>
      ${mountains(410, '#1a1626', 101, 170, 240)}
      <rect x="0" y="450" width="${W}" height="${H - 450}" fill="#221d28"/>
      <g fill="#2c2634" stroke="#171320" stroke-width="3">
        <rect x="90" y="250" width="60" height="220"/><rect x="70" y="230" width="100" height="26"/>
        <rect x="330" y="310" width="54" height="160"/>
        <rect x="850" y="270" width="60" height="200"/><rect x="830" y="250" width="100" height="26"/>
      </g>
      <path d="M 430 470 L 470 350 L 640 350 L 680 470 Z" fill="#282230" stroke="#151020" stroke-width="3"/>
      <ellipse cx="600" cy="620" rx="640" ry="110" fill="#2a2432"/>
      ${fog(500, '#6a5a8a', .16)}
      <circle cx="555" cy="410" r="8" fill="#b884e8" opacity=".9"/>
      <circle cx="555" cy="410" r="40" fill="#b884e8" opacity=".14"/>`;
  },

  eclipse(gid) {
    return `<defs>
        <radialGradient id="${gid}" cx="50%" cy="34%" r="80%">
          <stop offset="0%" stop-color="#3a1a4a"/><stop offset="55%" stop-color="#14091e"/><stop offset="100%" stop-color="#05030a"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${stars(110, 460)}
      <circle cx="600" cy="230" r="120" fill="#0a0610"/>
      <circle cx="600" cy="230" r="124" fill="none" stroke="#e8a84a" stroke-width="7" opacity=".95"/>
      <circle cx="600" cy="230" r="160" fill="#e8a84a" opacity=".1"/>
      <circle cx="600" cy="230" r="230" fill="#b884e8" opacity=".06"/>
      <rect x="0" y="500" width="${W}" height="${H - 500}" fill="#120d1a"/>
      <path d="M 0 500 Q 300 468 600 502 Q 900 536 1200 494 L 1200 560 L 0 560 Z" fill="#1c1528"/>
      <g fill="#221a30" stroke="#0d0916" stroke-width="3">
        <path d="M 120 500 L 150 360 L 180 500 Z"/><path d="M 980 500 L 1014 340 L 1046 500 Z"/>
        <path d="M 430 502 L 470 400 L 640 400 L 680 502 Z"/>
      </g>
      ${fog(560, '#7a4ab8', .16)}`;
  },

  hokageOffice(gid) {
    return `<defs>${sky(gid, '#3a2f28', '#241d18')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      <rect x="0" y="0" width="${W}" height="140" fill="#4a3a2c"/>
      <rect x="0" y="130" width="${W}" height="14" fill="#6a5440"/>
      <rect x="120" y="170" width="420" height="300" rx="6" fill="#9fd0e8"/>
      <rect x="120" y="170" width="420" height="300" rx="6" fill="none" stroke="#6a5440" stroke-width="12"/>
      <path d="M 330 170 L 330 470 M 120 320 L 540 320" stroke="#6a5440" stroke-width="10"/>
      <rect x="700" y="150" width="360" height="260" fill="#c9a05a" stroke="#7a5a34" stroke-width="6"/>
      <text x="880" y="300" font-size="120" text-anchor="middle" fill="#7a3a2a" font-family="Georgia,serif">火</text>
      <rect x="0" y="470" width="${W}" height="${H - 470}" fill="#6a5440"/>
      <rect x="0" y="470" width="${W}" height="16" fill="#856a50"/>
      <rect x="380" y="520" width="440" height="120" rx="8" fill="#4a3a2c" stroke="#2f2419" stroke-width="4"/>
      <rect x="420" y="500" width="120" height="26" rx="4" fill="#e6dcc0"/>
      <rect x="640" y="504" width="90" height="22" rx="4" fill="#e6dcc0"/>`;
  },

  ichiraku(gid) {
    return `<defs>${sky(gid, '#2a1d24', '#4a2f28')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      <rect x="0" y="0" width="${W}" height="120" fill="#7a2f28"/>
      <g fill="#f0e0c0">
        <rect x="100" y="24" width="1000" height="72" rx="6"/>
      </g>
      <text x="600" y="82" font-size="56" text-anchor="middle" fill="#7a2f28" font-family="Georgia,serif">一 楽 ら ぁ め ん</text>
      <rect x="0" y="120" width="${W}" height="24" fill="#5a3a2a"/>
      <g fill="#8a5a3a">
        <rect x="60" y="144" width="26" height="240"/><rect x="1114" y="144" width="26" height="240"/>
      </g>
      ${lanterns(200, 5, 3)}
      <rect x="0" y="400" width="${W}" height="60" fill="#9a6a44"/>
      <rect x="0" y="392" width="${W}" height="14" fill="#b9855a"/>
      <rect x="0" y="460" width="${W}" height="${H - 460}" fill="#3a2a20"/>
      <g>
        <ellipse cx="300" cy="400" rx="60" ry="18" fill="#e8e0d0"/>
        <ellipse cx="300" cy="392" rx="54" ry="15" fill="#d8b878"/>
        <ellipse cx="820" cy="404" rx="60" ry="18" fill="#e8e0d0"/>
        <ellipse cx="820" cy="396" rx="54" ry="15" fill="#d8b878"/>
      </g>`;
  },

  rooftopNight(gid) {
    return `<defs>${sky(gid, '#0a0f28', '#4a2f52')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${stars(100, 420)}
      <circle cx="880" cy="120" r="60" fill="#f4efd8"/>
      <circle cx="880" cy="120" r="130" fill="#f4efd8" opacity=".1"/>
      ${mountains(430, '#141a34', 111, 150, 250)}
      <g>
        ${house(180, 520, 200, 130, '#2a2438', '#3f2430')}
        ${house(520, 540, 240, 150, '#241f33', '#3a2129')}
        ${house(900, 520, 220, 140, '#2a2438', '#3f2430')}
      </g>
      <path d="M -50 560 L 1250 560 L 1250 675 L -50 675 Z" fill="#3a3348"/>
      <path d="M -50 560 L 1250 560 L 1250 578 L -50 578 Z" fill="#4e4560"/>
      ${lanterns(470, 6, 8)}`;
  },

  gate(gid) {
    return `<defs>${sky(gid, '#8fc4e8', '#f0dcb0')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${mountains(390, '#8095b4', 121, 160, 240)}
      ${pines(430, .7, 8, '#3f6b3f', 125)}
      <rect x="0" y="450" width="${W}" height="${H - 450}" fill="#6f9a58"/>
      <ellipse cx="600" cy="640" rx="700" ry="130" fill="#c2a878"/>
      <g fill="#7a5a3a" stroke="#5a4028" stroke-width="4">
        <rect x="150" y="180" width="70" height="300"/>
        <rect x="980" y="180" width="70" height="300"/>
      </g>
      <path d="M 100 190 L 1100 190 L 1100 150 L 100 150 Z" fill="#a8503a" stroke="#7a3628" stroke-width="4"/>
      <path d="M 70 150 L 1130 150 L 1090 118 L 110 118 Z" fill="#c25f45"/>
      <rect x="480" y="200" width="240" height="70" rx="5" fill="#e6d8bc" stroke="#8a7a5a" stroke-width="4"/>
      <text x="600" y="252" font-size="52" text-anchor="middle" fill="#7a3a2a" font-family="Georgia,serif">木ノ葉</text>
      <g fill="#4a5a6a" opacity=".9">
        <rect x="220" y="290" width="180" height="190"/><rect x="800" y="290" width="180" height="190"/>
      </g>`;
  },

  memorial(gid) {
    return `<defs>${sky(gid, '#b8a8c4', '#e8c8a0')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${mountains(400, '#8a90a8', 131, 140, 250)}
      ${treeRow(430, .6, 6, '#5a4030', '#4a6f44', 135)}
      <rect x="0" y="450" width="${W}" height="${H - 450}" fill="#7a8a5e"/>
      <ellipse cx="600" cy="620" rx="680" ry="120" fill="#96a074"/>
      <path d="M 520 560 L 540 380 L 660 380 L 680 560 Z" fill="#5a5f68" stroke="#3f434a" stroke-width="4"/>
      <path d="M 540 380 L 600 330 L 660 380 Z" fill="#6e747e"/>
      <g stroke="#3f434a" stroke-width="3" opacity=".7">
        <path d="M 556 420 L 644 420 M 556 448 L 644 448 M 556 476 L 620 476 M 556 504 L 640 504"/>
      </g>
      <g fill="#d8e0d0" opacity=".9">
        <ellipse cx="500" cy="566" rx="26" ry="10"/><ellipse cx="700" cy="570" rx="24" ry="9"/>
      </g>`;
  },

  title(gid) {
    return `<defs>${sky(gid, '#160e22', '#4a2338')}</defs>
      <rect width="${W}" height="${H}" fill="url(#${gid})"/>
      ${stars(120, 500)}
      <circle cx="240" cy="150" r="70" fill="#f0d8a0" opacity=".92"/>
      <circle cx="240" cy="150" r="150" fill="#f0d8a0" opacity=".09"/>
      ${mountains(430, '#211a2e', 141, 190, 250)}
      ${pines(470, 1.1, 8, '#141020', 145)}
      <rect x="0" y="500" width="${W}" height="${H - 500}" fill="#100c18"/>
      ${lanterns(420, 7, 9)}
      <g opacity=".5">
        ${Array.from({ length: 14 }, (_, i) =>
          `<ellipse cx="${(noise(i * 4.4) * W).toFixed(0)}" cy="${(180 + noise(i * 9.1) * 380).toFixed(0)}" rx="9" ry="5"
             fill="#f0a86a" transform="rotate(${(noise(i * 2.2) * 360).toFixed(0)} 0 0)" opacity=".8"/>`).join('')}
      </g>`;
  },
};

// Aliases usados pela história.
SCENES.konoha = SCENES.village;
SCENES.forestNight = SCENES.deepForest;
SCENES.wave = SCENES.coast;

/**
 * Retorna o markup SVG de um cenário.
 * @param {string} id  chave em SCENES
 * @param {object} opts { tint, tintOpacity }
 */
export function background(id, opts = {}) {
  const gid = nextId('bg');
  const draw = SCENES[id] || SCENES.village;
  const tint = opts.tint
    ? `<rect width="${W}" height="${H}" fill="${opts.tint}" opacity="${opts.tintOpacity ?? .3}"/>`
    : '';
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    ${draw(gid)}
    ${tint}
  </svg>`;
}

export const BACKGROUND_IDS = Object.keys(SCENES);
