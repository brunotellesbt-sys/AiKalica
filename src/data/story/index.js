// Registro central de cenas. Cada capítulo exporta um objeto id → cena.

import { scenes as prologue } from './prologue.js';
import { scenes as chapter1 } from './chapter1.js';
import { scenes as chapter2 } from './chapter2.js';
import { scenes as chapter3 } from './chapter3.js';
import { scenes as chapter4 } from './chapter4.js';
import { scenes as finale } from './finale.js';

export const SCENES = {
  ...prologue,
  ...chapter1,
  ...chapter2,
  ...chapter3,
  ...chapter4,
  ...finale,
};

export const START_SCENE = 'prologue_start';

/** Checagem de integridade: todos os `go`/`goto` apontam para cenas existentes? */
export function validateScenes() {
  const problems = [];
  const walk = (nodes, sceneId) => {
    for (const n of nodes || []) {
      if (!n || typeof n !== 'object') continue;
      if (n.t === 'go' && !SCENES[n.scene]) problems.push(`${sceneId}: go("${n.scene}") não existe`);
      if (n.t === 'battle' && n.loseGoto && !SCENES[n.loseGoto]) problems.push(`${sceneId}: loseGoto("${n.loseGoto}") não existe`);
      if (n.t === 'choice') {
        for (const o of n.options || []) {
          if (o.goto && !SCENES[o.goto]) problems.push(`${sceneId}: escolha "${o.text}" → "${o.goto}" não existe`);
          walk(o.then, sceneId);
        }
      }
      if (n.t === 'if') { walk(n.then, sceneId); walk(n.else, sceneId); }
      if (n.then && n.t === 'battle') walk(n.then, sceneId);
    }
  };
  for (const [id, sc] of Object.entries(SCENES)) walk(sc.nodes, id);
  return problems;
}
