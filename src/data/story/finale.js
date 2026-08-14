// Finale — o Eclipse aberto e os quatro desfechos possíveis.

import {
  say, narr, hero, cast, go, choice, iff, flag, bond, karma, battle,
  chapter, sound, fx, give, rest, heal, ending, decision, pause, set, bgm,
} from './dsl.js';

/** Média dos elos com os companheiros recrutados. */
function bondAvg(s) {
  const ids = Object.keys(s.roster).filter((id) => id !== 'hero');
  if (!ids.length) return 0;
  return ids.reduce((a, id) => a + (s.bonds[id] || 0), 0) / ids.length;
}

export const scenes = {
  finale_start: {
    bg: 'eclipse', music: 'dark',
    nodes: [
      cast(),
      narr('Kagemasa cai de joelhos. Por meio segundo, é só um homem de meia-idade cansado no meio de um templo em ruínas.'),
      narr('E então o pergaminho na mão dele se abre sozinho.'),
      fx('dark'),
      sound('dark'),
      cast('kagemasaP2'),
      say('kagemasaP2', 'Não... eu ainda não... o recipiente...', 'shock'),
      narr('O Eclipse não espera pelo recipiente. Nunca esperou. É essa a parte que ele nunca entendeu do próprio jutsu.'),
      say('kagemasaP2', 'Ah.', 'sad'),
      say('kagemasaP2', 'Então era isso.', 'sad'),
      fx('flash', '#8a4ae8'),
      narr('O selo se abre como uma boca. E a coisa que ele passou quinze anos guardando escolhe o recipiente mais próximo: ele mesmo.'),

      cast('kakashi'),
      say('kakashi', 'Formação! Agora! Ele não é mais ele!', 'angry'),
      say('naruto', 'A GENTE AINDA CONSEGUE! ELE TÁ AÍ DENTRO!', 'determined'),
      say('sasuke', 'Foco no que dá para acertar.', 'determined'),

      battle({
        foes: ['kagemasaP2'], level: 23, bg: 'eclipse',
        name: 'O Selo Aberto', boss: true, noFlee: true,
        intro: 'Última luta. Sem fuga, sem reforço, sem plano B.',
        onLoseText: 'A escuridão engole a câmara. Vocês despertam do lado de fora, com o eclipse já passado — e o norte da vila em chamas no horizonte.',
        onLose: 'goto', loseGoto: 'finale_failed',
      }),

      go('finale_choice'),
    ],
  },

  finale_choice: {
    bg: 'eclipse', music: 'sad',
    nodes: [
      cast(),
      narr('A coisa no corpo de Kagemasa cambaleia e recua. Está enfraquecida — e procurando saída.'),
      narr('E a única saída à vista é a marca em espiral na sua mão esquerda, que arde tanto que você não consegue fechar os dedos.'),
      cast('kakashi'),
      say('kakashi', 'Se você resistir, ela fica presa nele e os dois morrem juntos.', 'determined'),
      say('kakashi', 'Se você aceitar, ela atravessa. E aí a luta continua para sempre, dentro de você.', 'sad'),
      say('kakashi', 'É a sua mão. É a sua escolha. Eu não vou tomar essa por você.', 'sad'),

      choice('O eclipse está no ponto máximo. Decida.', [
        {
          text: 'Selar com o time. Quatro mãos na marca, ao mesmo tempo.',
          tag: 'Juntos', tagKind: 'light',
          note: 'Selou o Eclipse com o time',
          decision: 'Vocês selam juntos.',
          effects: { karma: { light: 8 }, flags: { sealedTogether: true } },
          goto: 'finale_bonds',
        },
        {
          text: 'Resistir sozinho. Segurar até acabar.',
          tag: 'Sozinho', tagKind: 'risk',
          note: 'Resistiu sozinho ao Eclipse',
          decision: 'Você segura sozinho.',
          effects: { karma: { light: 3 }, flags: { resistedAlone: true } },
          goto: 'finale_lone',
        },
        {
          text: 'Entrar no selo e alcançar o homem lá dentro.',
          tag: 'Alcançar', tagKind: 'light',
          note: 'Entrou no selo para alcançar Kagemasa',
          cond: (s) =>
            (s.flags.knowsSealTruth || s.flags.trueSealPath || s.flags.knowsHisNeed)
            && bondAvg(s) >= 45,
          lockedNote: 'Requer entender o selo e elos fortes',
          decision: 'Você atravessa para o outro lado.',
          effects: { karma: { light: 10 }, flags: { trueSealPath: true, reachedHim: true } },
          goto: 'finale_dawn',
        },
        {
          text: 'Aceitar. Absorver o Eclipse e acabar com isso agora.',
          tag: 'Absorver', tagKind: 'dark',
          note: 'Absorveu o Eclipse',
          decision: 'Você abre a mão.',
          effects: { karma: { dark: 14 }, flags: { embracedSeal: true } },
          goto: 'finale_shadow',
        },
      ]),
    ],
  },

  // ------------------------------------------------------------- desfechos ---
  finale_bonds: {
    bg: 'eclipse', music: 'hope',
    nodes: [
      cast(),
      narr('Você levanta a mão esquerda e não fecha os dedos. Estende para trás.'),
      hero('Não dá para segurar sozinho. Alguém segura comigo?', 'determined'),
      narr('Naruto chega primeiro, porque é claro que chega. Sakura põe a mão por cima. Sasuke resmunga alguma coisa sobre isso ser ridículo — e põe a dele também.'),
      say('naruto', 'A gente é um time, cabeça oca! Isso não é nem pergunta!', 'laugh'),
      fx('flash', '#ffd28a'),
      sound('victory'),
      narr('Quatro fluxos de chakra entram na marca ao mesmo tempo. O Eclipse não tem para onde ir — nenhum recipiente, quatro portas fechadas.'),
      narr('E ele se apaga como fogo sem ar.'),
      pause(600),
      narr('Kagemasa cai de lado. Está respirando. Não vai acordar tão cedo, mas está respirando.'),
      ending('bonds'),
    ],
  },

  finale_lone: {
    bg: 'eclipse', music: 'sad',
    nodes: [
      cast(),
      hero('Fiquem longe. Todo mundo. É comigo.', 'determined'),
      say('sakura', 'Não faz isso—', 'scared'),
      narr('Você fecha o punho esquerdo com tanta força que o sangue escorre entre os dedos, e resiste.'),
      narr('Resiste enquanto a marca queima. Resiste enquanto o Eclipse encontra cada rachadura da sua vontade e testa uma por uma.'),
      narr('Resiste porque, no fundo, você sempre achou que era isso que você era: alguém que aguenta sozinho para que ninguém mais precise.'),
      fx('flash', '#c9a0ff'),
      pause(700),
      narr('Funciona.'),
      narr('É o pior tipo de vitória: a que confirma exatamente aquilo que você deveria ter desaprendido.'),
      ending('lone'),
    ],
  },

  finale_dawn: {
    bg: 'eclipse', music: 'hope',
    nodes: [
      cast(),
      narr('Você não resiste e não aceita. Você faz a terceira coisa — a que Kakashi te explicou num corredor de pedra, e que Kagemasa nunca considerou porque ninguém nunca fez isso por ele.'),
      hero('Se o selo é uma ponte...', 'determined'),
      hero('...então dá para atravessar nos dois sentidos.', 'determined'),
      fx('flash', '#ffe6a8'),
      pause(500),

      bgm('calm'),
      narr('Do outro lado, não há monstro. Há um corredor de orfanato, à noite, e um garoto de uns nove anos sentado sozinho no fim dele, esperando alguém que disse que voltava.'),
      cast('kagemasaP1'),
      say('kagemasaP1', 'Você não devia estar aqui.', 'shock'),
      say('kagemasaP1', 'Ninguém devia. Foi por isso que eu construí assim.', 'sad'),
      hero('Quantos anos você ficou nesse corredor?', 'sad'),
      say('kagemasaP1', '...Todos.', 'sad'),
      narr('Ele olha as próprias mãos como se elas não fossem dele.'),
      say('kagemasaP1', 'Eu ia salvar todo mundo. Sério. Se ninguém precisasse ter medo de nada nunca mais, ninguém teria que esperar num corredor.', 'sad'),
      say('kagemasaP1', 'Em algum momento eu virei a coisa de que as pessoas têm medo, e eu não sei dizer quando.', 'sad'),

      choice('Você está dentro do selo. Ele está na sua frente.', [
        {
          text: 'Estender a mão. "Vamos embora daqui."',
          tag: 'Alcançar', tagKind: 'light',
          note: 'Tirou Kagemasa do corredor',
          effects: { karma: { light: 8 }, flags: { savedKagemasa: true } },
          then: [
            narr('Ele olha a sua mão por muito tempo. Depois pega.'),
            narr('É a primeira vez em quarenta anos que alguém volta para buscá-lo.'),
            fx('flash', '#ffe6a8'),
          ],
        },
        {
          text: '"Eu não te perdoo. Mas eu também não te deixo aqui."',
          tag: 'Justiça', tagKind: 'light',
          note: 'Não perdoou, mas não abandonou',
          effects: { karma: { light: 6 }, flags: { savedKagemasa: true } },
          then: [
            say('kagemasaP1', 'Isso é mais honesto do que perdão.', 'sad'),
            say('kagemasaP1', 'Eu aceito.', 'sad'),
            narr('Ele se levanta sozinho. Você anda ao lado, sem tocá-lo, até a saída.'),
          ],
        },
      ]),

      narr('O Eclipse não é destruído. É esvaziado — porque era feito da espera de um garoto, e a espera acabou.'),
      sound('victory'),
      ending('dawn'),
    ],
  },

  finale_shadow: {
    bg: 'eclipse', music: 'dark',
    nodes: [
      cast(),
      narr('Você abre a mão.'),
      fx('dark'),
      sound('dark'),
      narr('O Eclipse atravessa com uma gentileza obscena, como água encontrando o nível.'),
      narr('E fica quieto. É o pior detalhe: fica absolutamente quieto.'),
      cast('kagemasaP2'),
      say('kagemasaP2', 'Aí está.', 'happy'),
      say('kagemasaP2', 'Catorze tentativas. Precisou que a última quisesse.', 'happy'),
      hero('Eu não quis. Eu escolhi. Não é a mesma coisa.', 'neutral'),
      say('kagemasaP2', 'Não é mesmo. É melhor.', 'smug'),
      narr('Ele morre sorrindo, e o corpo esfria enquanto a sua mão esquenta.'),
      cast('naruto', 'sakura'),
      say('naruto', 'Ei... você tá aí, né? Fala alguma coisa.', 'scared'),
      narr('Você fala. Diz que está tudo bem. A voz sai perfeita, calma, tranquilizadora.'),
      narr('É a primeira vez que você mente sem sentir absolutamente nada.'),
      ending('shadow'),
    ],
  },

  finale_failed: {
    bg: 'ruinsNight', music: 'sad',
    nodes: [
      cast(),
      narr('Vocês acordam do lado de fora do templo. O eclipse já passou. O céu está com aquele azul indiferente de depois da tragédia.'),
      flag('villageFell'),
      go('finale_aftermath'),
    ],
  },

  finale_aftermath: {
    bg: 'ruinsNight', music: 'sad',
    nodes: [
      cast('kakashi'),
      say('kakashi', 'Konoha resistiu. Boa parte dela.', 'sad'),
      say('kakashi', 'Kagemasa sumiu com o que abriu. Não é um fim. É um adiamento.', 'sad'),
      narr('A marca na sua palma continua ali. Fria, agora. Esperando a próxima vez.'),
      ending('fallen'),
    ],
  },
};
