// Prólogo — a formatura na Academia e o selo na palma.

import {
  say, narr, hero, cast, bg, go, choice, iff, flag, bond, karma, battle,
  chapter, bgm, sound, fx, give, decision, pause, rest, ending, set,
} from './dsl.js';

export const scenes = {
  prologue_start: {
    bg: 'academy', music: 'calm',
    nodes: [
      chapter(0, 'A Última Prova', 'Academia Ninja de Konoha — manhã do exame de formatura.'),
      cast(),
      narr('A sala cheira a giz, suor e nervosismo. Vinte e três alunos, vinte e três chances de virar genin hoje — e uma lista na parede que já decidiu quase tudo.'),
      cast('iruka'),
      say('iruka', 'Bom dia. Vocês passaram quatro anos aqui aprendendo a jogar shuriken e a decorar selos. Hoje eu descubro o que vocês aprenderam de verdade.', 'neutral'),
      say('iruka', 'A prova prática é simples: enfrentem o oponente designado sem desistir. Não precisa vencer. Precisa não desistir.', 'determined'),
      narr('Ele percorre a sala com os olhos e para em você.'),
      say('iruka', '{hero}. Você é o único aluno da turma que entrou dois anos atrasado e alcançou todo mundo. Quero ver o que você faz sob pressão.', 'neutral'),

      choice('Como você encara a prova?', [
        {
          text: '"Vou lutar como sempre lutei. Sem truque."',
          tag: 'Honesto', tagKind: 'light',
          note: 'Escolheu encarar de frente',
          effects: { karma: { light: 2 }, flags: { proloqueHonest: true }, bonds: { naruto: 5 } },
          then: [
            say('iruka', 'Nada de truque? Isso é coragem ou é falta de imaginação. Vou descobrir daqui a pouco.', 'smirk'),
            narr('Do fundo da sala vem uma risada alta demais para o tamanho do ambiente.'),
            cast('iruka', 'naruto'),
            say('naruto', 'ISSO! É assim que se fala! Nada de truque! Só punho!', 'laugh'),
            say('iruka', 'Naruto, senta.', 'angry'),
            say('naruto', 'Tô sentado!', 'happy'),
            say('iruka', 'Na cadeira.', 'angry'),
          ],
        },
        {
          text: '"Vou estudar o oponente antes de encostar nele."',
          tag: 'Calculista', tagKind: 'risk',
          note: 'Escolheu observar antes de agir',
          effects: { karma: { light: 1 }, flags: { prologueTactic: true }, bonds: { sasuke: 5 } },
          then: [
            say('iruka', 'Cauteloso. Genin cauteloso vira chunin. Genin apressado vira estatística.', 'neutral'),
            narr('Alguém encostado na janela ergue um pouco a cabeça, como se tivesse ouvido algo que valia a pena.'),
            cast('iruka', 'sasuke'),
            say('sasuke', '...', 'neutral'),
            say('sasuke', 'Pelo menos um aqui pensa antes.', 'smug'),
          ],
        },
        {
          text: '"Se eu tiver que trapacear para passar, eu trapaceio."',
          tag: 'Pragmático', tagKind: 'dark',
          note: 'Admitiu que o fim justifica o meio',
          effects: { karma: { dark: 2 }, flags: { pragmatic: true } },
          then: [
            narr('A sala inteira fica em silêncio. Iruka não parece bravo. Parece preocupado, que é pior.'),
            say('iruka', 'Sabe qual é o problema dessa resposta? Não é ela ser errada. É que um dia ela vai ser conveniente demais.', 'sad'),
            say('iruka', 'Vá. Prove que eu estou errado sobre você.', 'neutral'),
          ],
        },
      ]),

      go('prologue_exam'),
    ],
  },

  prologue_exam: {
    bg: 'trainingField', music: 'tense',
    nodes: [
      cast(),
      narr('O pátio de treino está marcado com dois círculos de cal. Você entra no seu. Do outro lado, um veterano que repetiu o ano — mais alto, mais pesado, e visivelmente irritado por isso.'),
      say('academyRival', 'Aluno atrasado contra aluno repetente. Que patético para nós dois.', 'angry'),
      hero('Então vamos acabar rápido.', 'determined'),

      battle({
        foes: ['academyRival'], level: 2, bg: 'trainingField',
        name: 'Prova Prática', intro: 'Iruka levanta a mão. E abaixa.',
        onLose: 'continue',
        onLoseText: 'Você cai de joelhos no círculo de cal. Iruka anota alguma coisa na prancheta — e não é nota zero. "Não desistiu", ele diz. "É o que eu pedi."',
      }),

      narr('Você respira fundo. Os dois círculos de cal estão borrados e ninguém saberia dizer quem pisou fora primeiro.'),
      cast('iruka'),
      say('iruka', 'Chega. Suficiente.', 'neutral'),
      say('iruka', 'Aprovado.', 'happy'),
      sound('levelup'),
      narr('Ele te entrega uma bandana com a placa da Folha. O metal está frio e mais pesado do que você imaginava.'),
      give('ration', 2),
      give('kunai', 2),

      choice('Você...', [
        {
          text: 'Amarra a bandana na testa na hora.',
          tag: 'Orgulho', tagKind: 'light',
          effects: { karma: { light: 1 }, bonds: { naruto: 5 } },
          then: [
            narr('Você amarra apertado. Talvez apertado demais. Não importa.'),
            hero('Genin. Finalmente.', 'happy'),
          ],
        },
        {
          text: 'Guarda no bolso. Ainda não sente que mereceu.',
          tag: 'Dúvida', tagKind: 'risk',
          effects: { flags: { humbleStart: true }, karma: { light: 1 } },
          then: [
            narr('O metal esquenta devagar no bolso, junto da sua perna. Você vai amarrá-la quando acreditar nela.'),
            say('iruka', 'Sem pressa. Ela não expira.', 'happy'),
          ],
        },
      ]),

      go('prologue_seal'),
    ],
  },

  prologue_seal: {
    bg: 'rooftopNight', music: 'dark',
    nodes: [
      cast(),
      narr('Naquela noite, sobre o telhado do prédio onde você mora, a vila inteira é só telha e lanterna e barulho de gente jantando.'),
      narr('E a sua mão esquerda começa a queimar.'),
      fx('dark'),
      sound('dark'),
      narr('Debaixo da pele da palma, uma marca em espiral acende — vermelha, depois roxa, depois nada. Dura três segundos. Você a conhece desde sempre. Nunca tinha reagido a nada.'),

      cast('voice'),
      say('voice', 'Ah. Você passou.', 'neutral'),
      hero('Quem está aí?!', 'shock'),
      say('voice', 'Ninguém que possa te alcançar hoje. Mas parabéns de qualquer forma. Um selo dorme enquanto o portador é irrelevante. Você acabou de deixar de ser.', 'neutral'),
      say('voice', 'Aproveite o time que vão te dar. Fique perto deles.', 'smug'),
      say('voice', 'Vai ser mais fácil depois, quando você tiver que escolher entre eles e você.', 'smug'),
      fx('flash', '#6a4a9c'),
      narr('A voz some. A marca esfria. Lá embaixo, alguém ri de uma piada que você não ouviu.'),

      choice('O que você faz com isso?', [
        {
          text: 'Contar para o Iruka amanhã cedo.',
          tag: 'Confiar', tagKind: 'light',
          note: 'Decidiu não carregar o selo sozinho',
          decision: 'Você decide pedir ajuda.',
          effects: { karma: { light: 3 }, flags: { toldAboutSeal: true } },
          then: [
            narr('Você decide contar. É a decisão mais assustadora e mais fácil que você toma essa semana.'),
          ],
        },
        {
          text: 'Guardar segredo. Ninguém precisa saber.',
          tag: 'Esconder', tagKind: 'dark',
          note: 'Decidiu esconder o selo',
          decision: 'O segredo fica com você.',
          effects: { karma: { dark: 2 }, flags: { hidSeal: true } },
          then: [
            narr('Você fecha a mão. Se ninguém sabe, ninguém se preocupa. Se ninguém se preocupa, ninguém te olha diferente.'),
            narr('É um raciocínio limpo. E é assim que quase todo erro começa.'),
          ],
        },
        {
          text: 'Tentar responder. Falar com a voz.',
          tag: 'Perigoso', tagKind: 'risk',
          note: 'Tentou falar com a voz no selo',
          decision: 'Você chama de volta — e algo escuta.',
          effects: { karma: { dark: 1 }, flags: { answeredVoice: true, sealCurious: true } },
          then: [
            hero('Se você quer alguma coisa de mim, diz agora.', 'angry'),
            narr('Silêncio. E então, tão baixo que pode ter sido vento:'),
            say('voice', 'Paciência. Eu gosto de você.', 'smug'),
            narr('Você não dorme direito. Mas alguma coisa em você anotou: o selo responde quando é chamado.'),
          ],
        },
      ]),

      go('ch1_start'),
    ],
  },
};
