// Ponto de entrada: alterna entre a tela de título e a história.

import { showTitle } from './screens/title.js';
import { playFrom, resumeStory, disposeVN } from './screens/vn.js';
import { START_SCENE, validateScenes } from './data/story/index.js';
import { music, unlock } from './core/audio.js';
import { resetPlaytimeClock, autosave } from './core/save.js';
import { state } from './core/state.js';
import { toast } from './core/ui.js';

// Avisa no console se alguma cena aponta para um destino inexistente.
const problems = validateScenes();
if (problems.length) console.warn('Problemas de roteiro:\n' + problems.join('\n'));

// Destrava o áudio no primeiro gesto do usuário (política de autoplay).
const kick = () => { unlock(); window.removeEventListener('pointerdown', kick); };
window.addEventListener('pointerdown', kick, { once: true });

// Salva ao sair, para não perder a cena atual.
window.addEventListener('beforeunload', () => {
  if (state.scene) autosave();
});

async function main() {
  for (;;) {
    disposeVN();
    music(null);

    const action = await showTitle();
    resetPlaytimeClock();
    unlock();

    try {
      if (action.type === 'new') await playFrom(START_SCENE);
      else await resumeStory();
    } catch (err) {
      console.error('Erro fatal na história:', err);
      toast('Algo deu muito errado. Voltando ao título.', 'bad');
    }
  }
}

main();
