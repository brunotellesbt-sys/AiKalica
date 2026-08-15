// Mapas do overworld.
//
// O grid é construído por operações de pintura em vez de arte ASCII: assim as
// dimensões nunca saem de sincronia e cada elemento do vilarejo fica legível
// no código.

export const TILE = 32;

/**
 * Tipos de tile. `solid` bloqueia a passagem.
 * `alt` só é usado por tiles animados (água); o restante do chão recebe uma
 * variação por ruído no desenho, para não formar padrão de xadrez.
 */
export const TILES = {
  grass:  { id: 'grass',  solid: false, base: '#5f8f4e', alt: '#6b9a58' },
  flower: { id: 'flower', solid: false, base: '#5f8f4e', alt: '#6b9a58', decor: 'flower' },
  path:   { id: 'path',   solid: false, base: '#c2a878', alt: '#b89e6e' },
  stone:  { id: 'stone',  solid: false, base: '#9a9488', alt: '#8f897d' },
  water:  { id: 'water',  solid: true,  base: '#3f7f9a', alt: '#356f8a', anim: true },
  tree:   { id: 'tree',   solid: true,  base: '#5f8f4e', decor: 'tree' },
  wall:   { id: 'wall',   solid: true,  base: '#e0d2b4', alt: '#d4c4a2' },
  roof:   { id: 'roof',   solid: true,  base: '#a8503a', alt: '#94452f' },
  fence:  { id: 'fence',  solid: true,  base: '#5f8f4e', decor: 'fence' },
  post:   { id: 'post',   solid: true,  base: '#c2a878', decor: 'post' },
  gate:   { id: 'gate',   solid: true,  base: '#a8503a', decor: 'gate' },
  bridge: { id: 'bridge', solid: false, base: '#9a7a52', alt: '#8a6a44' },
};

// ------------------------------------------------------------- pintura -----
function blank(w, h, fill) {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => fill));
}

function rect(g, x, y, w, h, t) {
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      if (g[j] && g[j][i] !== undefined) g[j][i] = t;
    }
  }
}

function scatter(g, x, y, w, h, t, everyN) {
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) {
      if (g[j] && g[j][i] !== undefined && ((i * 7 + j * 13) % everyN === 0)) g[j][i] = t;
    }
  }
}

/** Casa: telhado em cima, parede embaixo. */
function house(g, x, y, w, h) {
  rect(g, x, y, w, Math.max(1, h - 1), 'roof');
  rect(g, x, y + h - 1, w, 1, 'wall');
}

// --------------------------------------------------------------- Konoha ----
function buildKonoha() {
  const W = 44, H = 32;
  const g = blank(W, H, 'grass');

  // Borda de árvores.
  rect(g, 0, 0, W, 2, 'tree');
  rect(g, 0, H - 2, W, 2, 'tree');
  rect(g, 0, 0, 2, H, 'tree');
  rect(g, W - 2, 0, 2, H, 'tree');

  // Rio a leste, com ponte.
  rect(g, 36, 2, 4, H - 4, 'water');
  rect(g, 36, 15, 4, 2, 'bridge');

  // Avenida principal (norte-sul) e travessa (leste-oeste).
  rect(g, 20, 2, 4, H - 4, 'path');
  rect(g, 2, 15, 38, 2, 'path');

  // Portão ao norte.
  rect(g, 18, 2, 8, 1, 'gate');
  rect(g, 19, 3, 6, 1, 'stone');

  // Quarteirão noroeste: casas.
  house(g, 5, 6, 6, 4);
  house(g, 13, 6, 5, 4);
  house(g, 5, 11, 5, 3);

  // Quarteirão nordeste.
  house(g, 27, 6, 6, 4);
  house(g, 27, 11, 5, 3);

  // Praça central, ao sul da travessa.
  rect(g, 17, 18, 10, 6, 'stone');

  // Ichiraku (sudoeste) e Armazém Shuriken (sudeste).
  house(g, 6, 19, 6, 4);
  house(g, 30, 19, 6, 4);

  // Campo de treino ao sul, com os postes.
  rect(g, 5, 25, 12, 4, 'grass');
  g[26][7] = 'post';
  g[26][11] = 'post';
  g[27][9] = 'post';
  rect(g, 4, 24, 14, 1, 'fence');

  // Vegetação avulsa.
  scatter(g, 3, 4, 14, 10, 'flower', 11);
  scatter(g, 26, 24, 12, 6, 'flower', 9);
  scatter(g, 25, 3, 10, 10, 'tree', 23);

  // Caminhos de acesso às portas.
  rect(g, 8, 10, 1, 5, 'path');   // casa noroeste → travessa
  rect(g, 29, 10, 1, 5, 'path');  // casa nordeste → travessa
  rect(g, 9, 17, 1, 2, 'path');   // Ichiraku
  rect(g, 32, 17, 1, 2, 'path');  // loja
  rect(g, 10, 23, 1, 2, 'path');  // campo de treino

  return { w: W, h: H, grid: g };
}

const konoha = buildKonoha();

/**
 * Pontos de interesse. `action` é resolvido pela tela do overworld.
 * `tile` é onde fica o marcador; o jogador interage de um tile adjacente.
 */
export const MAPS = {
  konoha: {
    id: 'konoha',
    name: 'Konoha — Vila Oculta da Folha',
    ...konoha,
    spawn: { x: 22, y: 20 },
    music: 'village',
    pois: [
      {
        id: 'missions', x: 21, y: 17, icon: '📋', label: 'Quadro de missões',
        action: 'missions',
        prompt: 'Ler o quadro de missões',
      },
      {
        id: 'shop', x: 32, y: 22, icon: '🏪', label: 'Armazém Shuriken',
        action: 'shop',
        prompt: 'Entrar na loja',
      },
      {
        id: 'ramen', x: 9, y: 22, icon: '🍜', label: 'Ichiraku Lámen',
        action: 'rest',
        prompt: 'Comer e descansar',
      },
      {
        id: 'training', x: 9, y: 27, icon: '🎯', label: 'Campo de Treino 3',
        action: 'training',
        prompt: 'Treinar com o time',
      },
      {
        id: 'gate', x: 21, y: 4, icon: '⛩️', label: 'Portão da Folha',
        action: 'continue',
        prompt: 'Seguir a história',
      },
      {
        id: 'memorial', x: 34, y: 12, icon: '🪦', label: 'Pedra Memorial',
        action: 'memorial',
        prompt: 'Ler os nomes',
      },
    ],
    // Onde cada companheiro fica parado, esperando conversa.
    npcSpots: {
      naruto: { x: 11, y: 21, dir: 'down' },
      sakura: { x: 19, y: 20, dir: 'right' },
      sasuke: { x: 25, y: 21, dir: 'left' },
      kakashi: { x: 33, y: 13, dir: 'down' },
      kaede: { x: 34, y: 17, dir: 'left' },
      jin: { x: 15, y: 12, dir: 'down' },
    },
  },
};

export function mapDef(id) {
  return MAPS[id] || MAPS.konoha;
}

/** O tile bloqueia a passagem? Fora do mapa também bloqueia. */
export function isSolid(map, x, y) {
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return true;
  return Boolean(TILES[map.grid[y][x]]?.solid);
}

export function tileAt(map, x, y) {
  if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
  return TILES[map.grid[y][x]] || null;
}
