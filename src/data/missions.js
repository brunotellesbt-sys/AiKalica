// Missões livres — o conteúdo opcional entre capítulos.
//
// Existem por um motivo de design: sem elas, quem chega num chefe com nível
// baixo só pode repetir a mesma luta no mesmo nível. Aqui dá para treinar,
// juntar ryo e subir elos antes de seguir a história.
//
// `chapter` = capítulo mínimo para a missão aparecer no quadro.
// `firstClear` = recompensa única; depois disso a missão continua repetível,
// valendo só a EXP e o ryo da própria batalha.

export const MISSIONS = {
  // ------------------------------- Rank D -------------------------------
  strayCats: {
    id: 'strayCats', name: 'O Gato da Senhora Mikan (de novo)', rank: 'D', chapter: 1,
    desc: 'O mesmo gato. Pela quarta vez. Ele agora tem reforços.',
    flavor: 'Nenhum ninja da Folha escapa dessa missão. É praticamente um trote.',
    encounter: { foes: ['forestWolf', 'forestWolf'], bg: 'forest', name: 'Caçada ao Gato' },
    levelOffset: -1,
    firstClear: { ryo: 180, items: ['ration'] },
    bonds: { naruto: 4, sakura: 3 },
  },
  academySpar: {
    id: 'academySpar', name: 'Treino com os Veteranos', rank: 'D', chapter: 1,
    desc: 'Sessão de sparring no campo da Academia. Sem risco real, EXP honesta.',
    flavor: 'Iruka observa de longe e anota coisas na prancheta.',
    encounter: { foes: ['academyRival', 'academyRival'], bg: 'trainingField', name: 'Sparring' },
    levelOffset: 0,
    firstClear: { ryo: 120, items: ['trainingKunai'] },
    bonds: { sasuke: 4 },
  },
  roadPatrol: {
    id: 'roadPatrol', name: 'Patrulha da Estrada Sul', rank: 'D', chapter: 2,
    desc: 'Comerciantes andam sendo assaltados na estrada. Limpe o trecho.',
    flavor: 'Trabalho chato, útil e razoavelmente seguro. O tripé da vida genin.',
    encounter: { foes: ['banditThug', 'banditThug', 'banditArcher'], bg: 'forest', name: 'Patrulha' },
    levelOffset: 0,
    firstClear: { ryo: 280, items: ['smokeBomb', 'ration'] },
    bonds: { sakura: 4 },
  },

  // ------------------------------- Rank C -------------------------------
  wolfPack: {
    id: 'wolfPack', name: 'A Matilha da Encosta', rank: 'C', chapter: 2,
    desc: 'Uma matilha grande desceu a serra e cercou um vilarejo.',
    flavor: 'Lobos não negociam, mas também não guardam rancor. É quase um alívio.',
    encounter: { foes: ['forestWolf', 'forestWolf', 'forestWolf'], bg: 'deepForest', name: 'Matilha Faminta' },
    levelOffset: 1,
    firstClear: { ryo: 340, items: ['meshShirt'] },
    bonds: { kaede: 5 },
  },
  desertersCamp: {
    id: 'desertersCamp', name: 'Acampamento de Desertores', rank: 'C', chapter: 2,
    desc: 'Ninjas que abandonaram as próprias vilas montaram base perto da fronteira.',
    flavor: 'Bandana riscada é um aviso: essa pessoa já decidiu que nada a prende.',
    encounter: { foes: ['roguePupil', 'roguePupil', 'banditArcher'], bg: 'cave', name: 'Desertores' },
    levelOffset: 1,
    firstClear: { ryo: 460, items: ['soldierPill', 'steelKunai'] },
    bonds: { kakashi: 5 },
  },
  puppetWorkshop: {
    id: 'puppetWorkshop', name: 'A Oficina Abandonada', rank: 'C', chapter: 3,
    desc: 'As marionetes de um artesão morto continuam se movendo sozinhas.',
    flavor: 'Ninguém puxa os fios. Esse é exatamente o problema.',
    encounter: { foes: ['swampPuppet', 'swampPuppet', 'swampPuppet'], bg: 'cave', name: 'Oficina das Marionetes' },
    levelOffset: 1,
    firstClear: { ryo: 520, items: ['explosiveTag', 'antidote'] },
    bonds: { jin: 5 },
  },
  soundScouts: {
    id: 'soundScouts', name: 'Batedores do Som', rank: 'C', chapter: 3,
    desc: 'Genins do Som foram vistos mapeando as trilhas ao redor da vila.',
    flavor: 'Eles não estão aqui pelo exame. Estão medindo alguma coisa.',
    encounter: { foes: ['soundGenin', 'soundGenin', 'mistAssassin'], bg: 'deepForest', name: 'Batedores' },
    levelOffset: 2,
    firstClear: { ryo: 640, items: ['chunimVest'] },
    bonds: { sasuke: 5 },
  },

  // ------------------------------- Rank B -------------------------------
  mistContract: {
    id: 'mistContract', name: 'Contrato da Névoa', rank: 'B', chapter: 3,
    desc: 'Assassinos da Névoa aceitaram um contrato contra um mercador da Folha.',
    flavor: 'Eles não têm nada contra você. É trabalho. De certa forma, é pior.',
    encounter: { foes: ['mistAssassin', 'mistAssassin'], bg: 'swamp', name: 'Contrato da Névoa' },
    levelOffset: 2,
    firstClear: { ryo: 900, items: ['mistCloak', 'bigRation'] },
    bonds: { kaede: 6 },
  },
  swampMercenary: {
    id: 'swampMercenary', name: 'O Mercenário do Pântano', rank: 'B', chapter: 3,
    desc: 'Ryūjin voltou a aceitar trabalhos. Detenha-o antes que aceite o errado.',
    flavor: 'Rank B de verdade. Leve pergaminhos de reanimação.',
    encounter: { foes: ['ryujin', 'swampPuppet'], bg: 'swamp', name: 'Ryūjin dos Pântanos', boss: true },
    levelOffset: 0,
    firstClear: { ryo: 1400, items: ['chakraBeads', 'reviveScroll'] },
    bonds: { kakashi: 8, jin: 6 },
  },
  shadowScouts: {
    id: 'shadowScouts', name: 'Sombras na Fronteira', rank: 'B', chapter: 4,
    desc: 'Acólitos encapuzados foram vistos marcando árvores com selos.',
    flavor: 'Eles marcam rotas. Rotas levam a algum lugar.',
    encounter: { foes: ['shadowAcolyte', 'shadowBrute'], bg: 'ruins', name: 'Sombras na Fronteira' },
    levelOffset: 1,
    firstClear: { ryo: 1100, items: ['reviveScroll', 'soldierPill'] },
    bonds: { naruto: 6 },
  },
  bruteHunt: {
    id: 'bruteHunt', name: 'Caçada aos Brutos', rank: 'B', chapter: 4,
    desc: 'Três brutos das sombras bloqueiam a única estrada para o norte.',
    flavor: 'Muito HP, pouca conversa. Traga alguém que cure.',
    encounter: { foes: ['shadowBrute', 'shadowBrute', 'shadowAcolyte'], bg: 'ruinsNight', name: 'Caçada aos Brutos' },
    levelOffset: 2,
    firstClear: { ryo: 1600, items: ['stonePlate', 'teamFeast'] },
    bonds: { jin: 8 },
  },
};

/** Missões liberadas no capítulo atual. */
export function availableMissions(chapter) {
  return Object.values(MISSIONS).filter((m) => m.chapter <= chapter);
}

export const RANK_COLOR = { D: '#8ab469', C: '#e0a33c', B: '#e2543c', A: '#b884e8' };
