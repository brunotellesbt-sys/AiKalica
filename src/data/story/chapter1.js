// Capítulo 1 — a formação do Time 7 e o teste dos sinos.

import {
  say, narr, hero, cast, go, choice, iff, flag, bond, karma, battle,
  chapter, bgm, sound, fx, give, decision, pause, rest, join, heal,
} from './dsl.js';

export const scenes = {
  ch1_start: {
    bg: 'academy', music: 'village',
    nodes: [
      chapter(1, 'Três Estranhos e Você', 'A distribuição dos times — e um sensei que não tem pressa nenhuma.'),
      cast(),
      narr('Sala 301. Iruka lê a lista de times em voz alta e cada nome muda a vida de alguém.'),
      cast('iruka'),
      say('iruka', 'Time 7: Uzumaki Naruto. Haruno Sakura. Uchiha Sasuke.', 'neutral'),
      say('iruka', 'E {hero}.', 'neutral'),
      narr('Quatro em um time de três. A sala inteira olha.'),
      say('iruka', 'Ordem direta do Hokage. Não me perguntem, eu também não entendi.', 'smirk'),

      cast('naruto', 'sakura', 'sasuke'),
      say('naruto', 'ISSO! Eu peguei a Sakura-chan!', 'laugh'),
      say('sakura', 'E eu peguei você. A vida é assim mesmo.', 'angry'),
      say('naruto', 'E o Sasuke...', 'sad'),
      say('sasuke', 'Não fala comigo.', 'neutral'),
      say('sakura', 'Ele acabou de falar com você.', 'smirk'),
      say('sasuke', 'Eu sei.', 'neutral'),

      narr('Você é o quarto. Ninguém sabe direito onde te encaixar — nem você.'),

      choice('Como você se apresenta ao time?', [
        {
          text: '"Sou o {hero}. Podem contar comigo."',
          tag: 'Aberto', tagKind: 'light',
          effects: { bonds: { naruto: 8, sakura: 5 }, karma: { light: 2 } },
          then: [
            say('naruto', 'HÁ! Gostei desse! Você é normal, diferente do gelado ali!', 'laugh'),
            say('sakura', 'Pelo menos um que responde quando perguntam.', 'happy'),
            say('sasuke', 'Falar é fácil.', 'smug'),
          ],
        },
        {
          text: '"Eu não atrapalho. É o que importa."',
          tag: 'Reservado', tagKind: 'risk',
          effects: { bonds: { sasuke: 8 }, karma: { light: 1 } },
          then: [
            say('sasuke', '...Boa resposta.', 'neutral'),
            say('sakura', 'Ótimo, agora são dois calados. Isso vai ser divertidíssimo.', 'angry'),
            say('naruto', 'EU FALO PELOS TRÊS!', 'laugh'),
            say('sakura', 'Esse é exatamente o problema.', 'angry'),
          ],
        },
        {
          text: 'Ficar em silêncio e observar os três.',
          tag: 'Frio', tagKind: 'dark',
          effects: { karma: { dark: 1 }, flags: { silentIntro: true } },
          then: [
            narr('Você não diz nada. Sakura desiste depois de dez segundos. Naruto, depois de quarenta. Sasuke te olha mais tempo do que os outros dois somados.'),
            say('sasuke', 'Você está medindo a gente.', 'smug'),
            say('sasuke', 'Eu também.', 'neutral'),
          ],
        },
      ]),

      narr('Os outros times saem com seus senseis. Uma hora. Duas horas. Três.'),
      say('naruto', 'ELE TÁ ATRASADO! TRÊS HORAS! Isso não é ninja, isso é falta de respeito!', 'angry'),
      narr('Naruto encaixa um apagador na fresta da porta.'),
      say('sakura', 'Naruto, ele é um jounin. Ele não vai cair numa arma...'),
      sound('poof'),
      narr('O apagador acerta em cheio a cabeça de cabelo prateado que atravessa a porta.'),
      cast('kakashi', 'naruto', 'sakura'),
      say('kakashi', 'Primeira impressão sobre vocês...', 'closed'),
      say('kakashi', 'Eu odeio vocês.', 'closed'),
      say('naruto', 'A CULPA NÃO FOI MINHA!', 'shock'),
      say('kakashi', 'Foi exatamente sua. Telhado. Cinco minutos.', 'smirk'),

      go('ch1_bells'),
    ],
  },

  ch1_bells: {
    bg: 'trainingField', music: 'tense',
    nodes: [
      cast('kakashi'),
      narr('Campo de Treino 3. Kakashi levanta dois sinos presos num barbante e os balança devagar, como quem oferece doce a criança.'),
      say('kakashi', 'Dois sinos. Quatro alunos. Quem não pegar um sino fica sem almoço e volta para a Academia.', 'closed'),
      say('sakura', 'Só dois? Mas somos quatro...', 'shock'),
      say('kakashi', 'Sim. A matemática é cruel. Venham com intenção de matar, ou não vão encostar em mim.', 'smirk'),

      cast('kakashi', 'naruto', 'sasuke'),
      say('naruto', 'Eu pego os dois sozinho!', 'determined'),
      say('sasuke', 'Você não pega nem um.', 'neutral'),

      narr('Você tem alguns segundos antes do sinal. E uma decisão para tomar.'),

      choice('Qual é a sua estratégia?', [
        {
          text: 'Propor que os quatro ataquem juntos.',
          tag: 'Trabalho em equipe', tagKind: 'light',
          note: 'Propôs cooperação no teste dos sinos',
          decision: 'O time vai junto.',
          effects: {
            karma: { light: 4 },
            bonds: { naruto: 12, sakura: 12, sasuke: 8 },
            flags: { bellTeamwork: true },
          },
          then: [
            hero('Ele quer que a gente se mate por dois sinos. Isso já devia dizer alguma coisa.', 'determined'),
            hero('Quatro contra um. Agora.', 'determined'),
            say('sasuke', 'Isso não vai funcionar.', 'neutral'),
            say('naruto', 'PARECE ÓTIMO! VAMO!', 'laugh'),
            say('sakura', '...Tá. Tá bom. Eu cubro os flancos.', 'determined'),
            say('sasuke', '...Tsc.', 'smug'),
            narr('Sasuke não concorda em voz alta. Mas quando o sinal soa, ele ataca pelo lado certo na hora certa — e isso é o mais perto de um "sim" que você vai conseguir hoje.'),
          ],
        },
        {
          text: 'Atacar sozinho. Sino é sino.',
          tag: 'Individual', tagKind: 'dark',
          note: 'Foi sozinho atrás do sino',
          decision: 'Você vai sozinho.',
          effects: { karma: { dark: 3 }, bonds: { naruto: -4, sakura: -4 }, flags: { bellSolo: true } },
          then: [
            hero('São dois sinos. Um deles é meu.', 'determined'),
            say('naruto', 'Ei! E a gente?!', 'shock'),
            narr('Você já está correndo. Atrás de você, três genins descobrem sozinhos que estão sozinhos.'),
          ],
        },
        {
          text: 'Deixar Naruto atacar primeiro e estudar as reações de Kakashi.',
          tag: 'Frio e eficaz', tagKind: 'risk',
          note: 'Usou Naruto como isca',
          effects: { karma: { dark: 1 }, bonds: { naruto: -6, sasuke: 6 }, flags: { usedNarutoBait: true } },
          then: [
            narr('Naruto ataca de frente, como sempre. Kakashi o derruba com uma mão, como sempre. Mas você viu: ele apoia o peso na perna esquerda antes de girar.'),
            say('sasuke', 'Você deixou ele levar pancada de propósito.', 'smug'),
            hero('Eu deixei ele fazer o que ele ia fazer de qualquer jeito.', 'neutral'),
            say('sasuke', 'Frio. Eu respeito.', 'smirk'),
            narr('Naruto se levanta cuspindo terra e não entende por que você não veio junto. Ele não pergunta. É pior.'),
          ],
        },
      ]),

      battle({
        foes: ['kakashiSpar'], level: 6, bg: 'trainingField',
        name: 'Teste dos Sinos', boss: true, noFlee: true,
        objective: { damageThreshold: .62 },
        intro: 'Objetivo: encostar nele. Reduza Kakashi a 62% do HP para pegar um sino.',
        onLose: 'continue',
        onLoseText: 'Vocês acordam amarrados em troncos. Kakashi está sentado numa pedra, lendo. "Vocês perderam", ele diz. "Vamos falar sobre por quê."',
      }),

      go('ch1_after_bells'),
    ],
  },

  ch1_after_bells: {
    bg: 'memorial', music: 'sad',
    nodes: [
      cast('kakashi'),
      narr('Kakashi os leva até uma pedra preta cravada no campo. Está coberta de nomes gravados em fileiras apertadas.'),
      say('kakashi', 'Sabem o que é isso?', 'neutral'),
      say('naruto', 'Um monumento! Eu quero meu nome aí um dia!', 'happy'),
      say('kakashi', 'Não quer.', 'sad'),
      say('kakashi', 'São os ninjas mortos em serviço. Alguns eram meus amigos.', 'sad'),
      narr('Ele fica um tempo em silêncio. Ninguém interrompe, nem Naruto.'),
      say('kakashi', 'No mundo ninja, quem quebra as regras é lixo. Mas quem abandona um companheiro é pior que lixo.', 'determined'),

      iff({ flag: 'bellTeamwork' }, [
        say('kakashi', 'Vocês entenderam isso sem eu precisar dizer. Isso me assusta um pouco, para ser sincero.', 'happy'),
        say('kakashi', 'Time 7... aprovado.', 'happy'),
        sound('victory'),
        bond('kakashi', 20), bond('naruto', 8), bond('sakura', 8), bond('sasuke', 8),
        karma({ light: 3 }),
        flag('kakashiRespect'),
      ], [
        say('kakashi', 'Vocês brigaram entre si por dois sinos que eu nunca pretendi dar a ninguém.', 'sad'),
        say('kakashi', 'Vou aprovar mesmo assim. Não porque vocês mereceram — porque a vila precisa de times, e vocês são o que eu tenho.', 'neutral'),
        say('kakashi', 'Provem que eu estou sendo burro.', 'determined'),
        bond('kakashi', 6),
        flag('kakashiDoubt'),
      ]),

      join('kakashi', { level: 8 }),
      join('naruto'), join('sakura'), join('sasuke'),
      bond('naruto', 10), bond('sakura', 10), bond('sasuke', 10),

      narr('O Time 7 existe oficialmente a partir de hoje. Kakashi acompanha vocês por enquanto — jounin não fica de babá para sempre, ele avisa três vezes no caminho de volta.'),
      rest('O time descansa e se prepara.'),
      go('ch1_missions'),
    ],
  },

  ch1_missions: {
    bg: 'village', music: 'village',
    nodes: [
      cast(),
      narr('As três semanas seguintes são: capinar hortas, achar gatos, pintar cercas, achar o mesmo gato de novo.'),
      cast('naruto'),
      say('naruto', 'MISSÕES RANK D SÃO TORTURA! EU QUERO UMA MISSÃO DE VERDADE!', 'angry'),
      narr('Pela primeira vez, o time inteiro concorda com Naruto — inclusive Sasuke, que demonstra concordância olhando para o lado com mais intensidade.'),

      cast('hokage'),
      say('hokage', 'Uma missão de verdade. Bom.', 'smirk'),
      say('hokage', 'Rank C: escoltar um carregamento de suprimentos até a costa do País das Ondas. Há relatos de salteadores na estrada.', 'neutral'),
      say('hokage', 'Salteadores. Não ninjas. Deve ser simples.', 'neutral'),
      narr('O Terceiro dá uma tragada no cachimbo e não sustenta o seu olhar por tempo suficiente. Você repara nisso.'),

      choice('Você pergunta alguma coisa?', [
        {
          text: '"Por que o senhor colocou quatro genins num time de três?"',
          tag: 'Direto', tagKind: 'light',
          note: 'Perguntou ao Hokage sobre o time de quatro',
          effects: { karma: { light: 2 }, flags: { askedHokage: true } },
          then: [
            narr('O Hokage demora a responder.'),
            say('hokage', 'Porque eu prefiro você onde eu possa te ver. E porque, se algum dia algo em você acordar...', 'sad'),
            say('hokage', '...eu quero que existam três pessoas por perto que se importem o bastante para te trazer de volta.', 'sad'),
            hero('O senhor sabe do selo.', 'shock'),
            say('hokage', 'Eu sei que ele existe. Não sei o que ele quer. Kakashi sabe mais do que eu — pergunte a ele quando você confiar nele.', 'neutral'),
            flag('hokageHint'),
            karma({ light: 2 }),
          ],
        },
        {
          text: '"Aceito." E nada mais.',
          tag: 'Silêncio', tagKind: 'risk',
          effects: {},
          then: [
            say('hokage', 'Bom. Um ninja que não faz perguntas é útil.', 'neutral'),
            say('hokage', 'E perigoso. Boa viagem.', 'sad'),
          ],
        },
      ]),

      give('ration', 2), give('soldierPill', 1),
      narr('Vocês partem ao amanhecer.'),
      go('ch2_road'),
    ],
  },
};
