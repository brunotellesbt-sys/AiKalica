// Gera a arte do jogo como arquivos SVG reais em `assets/`.
//
// Por que existir: a arte é desenhada por código, mas ficar só em memória
// significa que ninguém consegue abrir, editar ou substituir um personagem sem
// mexer em JavaScript. Com os arquivos em disco, `assets/` vira um diretório
// público comum — dá para trocar qualquer imagem por uma feita à mão e o jogo
// passa a usar a nova, sem alterar uma linha de código.
//
// Uso: npm run build:assets

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CHARACTERS } from '../src/data/characters.js';
import { EXTRA_CAST } from '../src/data/story/cast.js';
import { EMOTIONS } from '../src/art/emotions.js';
import { ENEMIES } from '../src/data/enemies.js';
import { portrait, faceIcon } from '../src/art/portraits.js';
import { sprite } from '../src/art/sprites.js';
import { background, BACKGROUND_IDS } from '../src/art/backgrounds.js';
import { walkSprite, DIRECTIONS, FRAMES } from '../src/art/walk.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');

/** Cores de roupa do protagonista por afinidade elemental. */
export const HERO_OUTFIT = {
  fire: '#8a3a2a', wind: '#2f6b52', lightning: '#7a6a2a',
  earth: '#6b5a3a', water: '#2f5a7a',
};

let written = 0;

async function put(relPath, svg) {
  const full = join(OUT, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, svg.trim() + '\n', 'utf8');
  written++;
  return relPath;
}

/** Variantes visuais de um personagem (o herói muda de cor por elemento). */
function variantsOf(id) {
  const def = CHARACTERS[id];
  if (id !== 'hero') return [{ key: 'default', art: def.art }];
  return Object.keys(HERO_OUTFIT).map((el) => ({
    key: el,
    art: { ...def.art, outfit: HERO_OUTFIT[el] },
  }));
}

async function buildCharacters(manifest) {
  for (const id of Object.keys(CHARACTERS)) {
    manifest.characters[id] = {};
    for (const { key, art } of variantsOf(id)) {
      const base = id === 'hero' ? `characters/${id}/${key}` : `characters/${id}`;
      const entry = { portrait: {}, walk: {} };

      for (const emo of EMOTIONS) {
        entry.portrait[emo] = await put(`${base}/portrait/${emo}.svg`, portrait(art, emo));
      }
      entry.face = await put(`${base}/face.svg`, faceIcon(art, 'neutral'));
      entry.battle = await put(`${base}/battle.svg`, sprite(art, {}));

      for (const dir of DIRECTIONS) {
        for (let f = 0; f < FRAMES; f++) {
          entry.walk[`${dir}-${f}`] = await put(`${base}/walk/${dir}-${f}.svg`, walkSprite(art, dir, f));
        }
      }
      manifest.characters[id][key] = entry;
    }
  }
}

// Figurantes: só aparecem em diálogo, então precisam de retrato e rosto.
async function buildExtras(manifest) {
  for (const [id, def] of Object.entries(EXTRA_CAST)) {
    if (!def.art) continue;
    const entry = { portrait: {} };
    for (const emo of EMOTIONS) {
      entry.portrait[emo] = await put(`cast/${id}/portrait/${emo}.svg`, portrait(def.art, emo));
    }
    entry.face = await put(`cast/${id}/face.svg`, faceIcon(def.art, 'neutral'));
    manifest.cast[id] = entry;
  }
}

async function buildEnemies(manifest) {
  for (const [id, def] of Object.entries(ENEMIES)) {
    const entry = {
      battle: await put(`enemies/${id}/battle.svg`, sprite(def.art || {}, {})),
    };
    // Só inimigos humanoides têm retrato — os outros nunca falam em cena.
    if (!def.art?.type || def.art.type === 'human') {
      entry.portrait = {};
      for (const emo of ['neutral', 'angry', 'smug', 'sad', 'shock']) {
        entry.portrait[emo] = await put(`enemies/${id}/portrait/${emo}.svg`, portrait(def.art, emo));
      }
    }
    manifest.enemies[id] = entry;
  }
}

async function buildBackgrounds(manifest) {
  for (const id of BACKGROUND_IDS) {
    manifest.backgrounds[id] = await put(`backgrounds/${id}.svg`, background(id));
  }
}

async function main() {
  const fresh = process.argv.includes('--clean');
  if (fresh) await rm(OUT, { recursive: true, force: true });

  const manifest = {
    generatedAt: new Date().toISOString(),
    note: 'Gerado por tools/build-assets.mjs. Qualquer arquivo aqui pode ser '
      + 'substituído por arte feita à mão — o jogo carrega o arquivo e só volta '
      + 'a desenhar por código se ele faltar.',
    emotions: EMOTIONS,
    directions: DIRECTIONS,
    frames: FRAMES,
    characters: {},
    cast: {},
    enemies: {},
    backgrounds: {},
  };

  await buildCharacters(manifest);
  await buildExtras(manifest);
  await buildEnemies(manifest);
  await buildBackgrounds(manifest);

  await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  await writeFile(join(OUT, 'README.md'), `# assets/

Arte do jogo, gerada por \`npm run build:assets\` a partir dos módulos em
\`src/art/\`. **Não edite achando que some no próximo build** — edite sabendo:
rodar o build de novo sobrescreve o que estiver aqui.

## Substituir por arte própria

Cada arquivo é um SVG independente. Para trocar o retrato bravo do Naruto por
um desenho seu, sobrescreva:

    assets/characters/naruto/portrait/angry.svg

O jogo carrega o arquivo pela URL. Se ele existir, é ele que aparece; se
faltar ou falhar, o jogo desenha o procedural equivalente e continua rodando.
PNG também funciona: troque a extensão no \`manifest.json\`.

## Estrutura

    characters/<id>/portrait/<emoção>.svg   busto para a visual novel
    characters/<id>/face.svg                recorte do rosto, usado nos menus
    characters/<id>/battle.svg              sprite de combate
    characters/<id>/walk/<direção>-<n>.svg  caminhada, 4 direções × 3 quadros
    enemies/<id>/…                          o mesmo, para inimigos
    backgrounds/<id>.svg                    cenários 16:9

O protagonista tem uma pasta por afinidade elemental
(\`characters/hero/fire/\`, \`.../water/\`…), porque a cor da roupa acompanha
o elemento escolhido.

${written} arquivos na última geração.
`, 'utf8');

  console.log(`${written} arquivos gerados em assets/`);
  console.log(`  personagens: ${Object.keys(manifest.characters).length}`);
  console.log(`  figurantes:  ${Object.keys(manifest.cast).length}`);
  console.log(`  inimigos:    ${Object.keys(manifest.enemies).length}`);
  console.log(`  cenários:    ${Object.keys(manifest.backgrounds).length}`);
}

main().catch((err) => {
  console.error('Falha ao gerar assets:', err);
  process.exit(1);
});
