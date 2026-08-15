// Capítulo 2 — a estrada, o vilarejo e a ponte. Onde se decide quem você salva.

import {
  say, narr, hero, cast, go, choice, iff, flag, bond, karma, battle,
  chapter, sound, fx, give, ryo, rest, heal, join, shop, decision, pause, set, hub,
} from './dsl.js';

export const scenes = {
  ch2_road: {
    bg: 'forest', music: 'calm',
    nodes: [
      chapter(2, 'A Ponte Inacabada', 'País das Ondas — escolta rank C. Nada é rank C.'),
      cast('naruto', 'sakura'),
      narr('A estrada para a costa atravessa três dias de floresta. No segundo, o silêncio dos pássaros muda de qualidade.'),
      say('kakashi', 'Parem.', 'determined'),
      say('sakura', 'O que foi?', 'scared'),
      say('kakashi', 'Poça d\'água. No meio da estrada. Não chove há seis dias.', 'determined'),
      sound('poof'),
      fx('shake'),

      battle({
        foes: ['banditThug', 'banditArcher', 'banditThug'], level: 5, bg: 'forest',
        name: 'Emboscada na Trilha',
        intro: 'Três figuras saem de trás das árvores. Não são ninjas — mas estão bem armados demais para salteadores comuns.',
      }),

      narr('Um deles ainda respira. Sakura amarra o braço dele com uma atadura antes de amarrar as mãos.'),
      cast('sakura'),
      say('sakura', 'Ele tem uma marca queimada no ombro. Um corvo.', 'shock'),
      say('kakashi', 'Karasu. O bando dele domina a costa há dois anos. Isso deixou de ser rank C três minutos atrás.', 'neutral'),
      say('naruto', 'ENTÃO A GENTE VOLTA?', 'shock'),
      say('kakashi', 'Essa é a pergunta certa. E não é minha para responder.', 'neutral'),
      narr('Ele olha para você. Os outros três também.'),

      choice('A missão continua?', [
        {
          text: '"Continuamos. Tem gente esperando esses suprimentos."',
          tag: 'Coragem', tagKind: 'light',
          note: 'Decidiu seguir para o País das Ondas',
          decision: 'A missão continua.',
          effects: { karma: { light: 4 }, bonds: { naruto: 10, sakura: 6 }, flags: { pushedOn: true } },
          then: [
            say('naruto', 'ISSO! É ASSIM QUE SE FALA!', 'laugh'),
            say('kakashi', 'Você entende que isso pode matar um de vocês.', 'neutral'),
            hero('Entendo. E voltar mata gente que eu nunca vou conhecer.', 'determined'),
            say('kakashi', '...Kakashi Hatake, aprovando decisões suicidas desde sempre. Vamos.', 'closed'),
          ],
        },
        {
          text: '"Voltamos e reportamos. Genin não enfrenta bando armado."',
          tag: 'Prudência', tagKind: 'risk',
          note: 'Quis abortar a missão',
          effects: { karma: { light: 1 }, bonds: { sakura: 8, naruto: -6 }, flags: { hesitated: true } },
          then: [
            say('sakura', 'Obrigada. Alguém tinha que dizer isso.', 'sad'),
            say('naruto', 'MAS E O POVO DE LÁ?!', 'angry'),
            say('kakashi', 'Ele tem razão nos dois lados. Vamos fazer o seguinte: seguimos, mas ao primeiro sinal de ninja rank B, recuamos. Todos. Sem discussão.', 'neutral'),
            narr('Você concordou com o recuo. Naruto anda dois passos atrás de você o resto do dia.'),
          ],
        },
      ]),

      go('ch2_village'),
    ],
  },

  ch2_village: {
    bg: 'coast', music: 'sad',
    nodes: [
      cast(),
      narr('O vilarejo da costa é menor do que o relatório dizia. Metade das casas está fechada com tábuas. A outra metade está aberta porque não sobrou nada para roubar.'),
      cast('oldMan'),
      say('oldMan', 'Konoha mandou crianças.', 'sad'),
      say('naruto', 'EI! Eu sou um ninja!', 'angry'),
      say('oldMan', 'Eu também fui, garoto. Um dia dessa vila ter um médico valeu mais que isso.', 'sad'),
      say('oldMan', 'A ponte é a única coisa que ainda pode nos salvar. Ligando a costa ao continente, o bando do Karasu perde o monopólio do transporte. É por isso que ele mata quem trabalha nela.', 'determined'),

      cast('oldMan', 'kaede'),
      narr('Uma garota mais ou menos da sua idade aparece na porta dos fundos, com um balde d\'água em cada mão e um olhar que já mediu você e já decidiu alguma coisa.'),
      say('kaede', 'Vô, para de assustar os visitantes.', 'neutral'),
      say('kaede', 'Kaede. Eu cuido dos feridos aqui. Vocês vão me dar mais trabalho, imagino.', 'smirk'),
      say('sakura', 'Você tem controle de chakra? Isso é chakra médico nas suas mãos.', 'shock'),
      say('kaede', 'É água. Aqui todo mundo aprende água antes de aprender a andar. Curar foi só o que sobrou de útil para fazer com ela.', 'neutral'),

      narr('Naquela noite, um garoto entra correndo na casa, sem fôlego.'),
      cast('villager'),
      say('villager', 'Eles estão no armazém! Levaram o carregamento e trancaram três famílias dentro! E tem gente indo pra ponte também, com tochas!', 'scared'),
      say('kakashi', 'Dois pontos ao mesmo tempo. Clássico. Eles querem que a gente se divida — ou que escolha.', 'determined'),
      say('kakashi', 'Eu seguro a estrada para eles não receberem reforço. Vocês decidem para onde vão.', 'neutral'),

      choice('Para onde o time vai?', [
        {
          text: 'Armazém. Tirar as famílias de lá primeiro.',
          tag: 'Salvar pessoas', tagKind: 'light',
          note: 'Salvou as famílias no armazém',
          decision: 'Vocês correm para o armazém.',
          effects: {
            karma: { light: 6 },
            bonds: { naruto: 12, sakura: 10, kaede: 25 },
            flags: { savedVillagers: true },
          },
          goto: 'ch2_warehouse',
        },
        {
          text: 'Ponte. Sem ela, a vila morre de qualquer jeito.',
          tag: 'Salvar o futuro', tagKind: 'risk',
          note: 'Escolheu proteger a ponte',
          decision: 'Vocês correm para a ponte.',
          effects: {
            karma: { dark: 2, light: 2 },
            bonds: { sasuke: 12, naruto: -4 },
            flags: { savedBridge: true },
          },
          goto: 'ch2_bridge_first',
        },
      ]),
    ],
  },

  ch2_warehouse: {
    bg: 'cave', music: 'tense',
    nodes: [
      cast(),
      narr('O armazém é escuro, cheio de caixas empilhadas até o teto e do cheiro de óleo de lamparina — que alguém espalhou pelo chão de propósito.'),
      say('naruto', 'Eles vão botar fogo com as pessoas dentro!', 'shock'),
      hero('Então a gente tem menos tempo do que eu esperava.', 'determined'),

      battle({
        foes: ['banditThug', 'banditArcher', 'banditThug', 'banditThug'], level: 6, bg: 'cave',
        name: 'Armazém em Chamas',
        intro: 'Quatro salteadores entre vocês e a porta trancada dos fundos.',
      }),

      narr('Naruto arranca a porta dos fundos com um chute e onze pessoas saem tossindo para a rua. Nenhuma delas morre esta noite.'),
      cast('kaede'),
      say('kaede', 'Você escolheu as pessoas.', 'neutral'),
      say('kaede', 'A ponte queimou dois vãos. Vamos levar meses para refazer.', 'sad'),
      say('kaede', 'E eu faria de novo. Do mesmo jeito.', 'happy'),
      say('kaede', 'Me leva junto. Eu conheço cada pedra dessa costa e eu curo melhor que qualquer um do meu tamanho.', 'determined'),

      choice('Kaede quer se juntar ao time.', [
        {
          text: '"Bem-vinda. A gente precisa de você."',
          tag: 'Recrutar Kaede', tagKind: 'bond',
          note: 'Recrutou Kaede',
          effects: { karma: { light: 3 }, bonds: { kaede: 20 }, flags: { kaedeJoined: true } },
          then: [
            join('kaede'),
            say('kaede', 'Não vou te dar motivo para se arrepender.', 'happy'),
            say('sakura', 'Finalmente outra pessoa razoável neste time.', 'happy'),
            say('naruto', 'EI!', 'angry'),
          ],
        },
        {
          text: '"Sua vila precisa mais de você do que a gente."',
          tag: 'Recusar', tagKind: 'risk',
          note: 'Recusou levar Kaede',
          effects: { karma: { light: 1 }, flags: { kaedeStayed: true } },
          then: [
            say('kaede', '...É. Provavelmente é verdade.', 'sad'),
            say('kaede', 'Se mudar de ideia, você sabe onde eu moro. Eu não vou a lugar nenhum. Nunca vou.', 'sad'),
            narr('Ela sorri de um jeito que não chega aos olhos, e volta para dentro com os baldes.'),
          ],
        },
      ]),

      rest('A vila oferece o que tem: comida quente e um telhado.'),
      ryo(400),
      go('ch2_bridge_boss'),
    ],
  },

  ch2_bridge_first: {
    bg: 'bridge', music: 'tense',
    nodes: [
      cast(),
      narr('A ponte inacabada se estende sobre a água escura, apoiada em pilares que ainda cheiram a madeira nova. Seis figuras com tochas caminham sobre ela.'),

      battle({
        foes: ['banditThug', 'banditArcher', 'roguePupil'], level: 7, bg: 'bridge',
        name: 'Fogo na Ponte',
        intro: 'Um deles usa bandana riscada. Não é mais só salteador.',
      }),

      narr('A ponte fica de pé. Vocês apagam o fogo antes que ele passe do terceiro vão.'),
      narr('No caminho de volta, o armazém no fim da rua ainda está queimando. Não sobrou nada dentro além do carregamento.'),
      cast('kaede'),
      say('kaede', 'Três famílias estavam lá.', 'sad'),
      narr('Ela não diz mais nada. Não acusa, não grita. Só olha para a fumaça por um tempo longo demais.'),
      say('kaede', 'Duas conseguiram sair pela janela do sótão.', 'sad'),
      say('kaede', 'Duas.', 'sad'),
      say('naruto', '...A gente devia ter ido lá.', 'sad'),
      hero('A ponte era a única chance da vila.', 'determined'),
      say('kaede', 'Eu sei. É por isso que eu não estou gritando com você.', 'sad'),
      say('kaede', 'Eu só queria que salvar alguma coisa não custasse exatamente outra.', 'sad'),
      flag('bridgeCost'),
      karma({ dark: 2 }),
      bond('naruto', -5),

      rest('Ninguém dorme bem. Mas o time descansa.'),
      ryo(300),
      go('ch2_bridge_boss'),
    ],
  },

  ch2_bridge_boss: {
    bg: 'bridge', music: 'boss',
    nodes: [
      cast(),
      narr('De manhã, a névoa sobre a água está espessa demais para ser natural. E no meio da ponte, sentado numa viga como se estivesse esperando o café, há um homem de máscara com um corvo no ombro.'),
      cast('karasu'),
      say('karasu', 'Konoha mandou quatro. Que consideração.', 'smug'),
      say('karasu', 'Eu não tenho nada contra vocês, crianças. Eu tenho contra a ponte. Ponte é fim de negócio.', 'neutral'),
      say('kakashi', 'Fiquem atrás de mim.', 'determined'),
      say('karasu', 'Não. Fiquem na frente. Eu quero ver do que essa geração é feita.', 'smug'),

      battle({
        foes: ['karasu', 'banditThug', 'banditThug'], level: 9, bg: 'bridge',
        name: 'Karasu, o Corvo', boss: true,
        intro: 'O corvo levanta voo. E a névoa fecha atrás de vocês.',
        onLoseText: 'Vocês acordam na areia, arrastados pela maré e por alguém que preferiu não deixar o nome. A ponte ainda está de pé — e Karasu ainda está nela.',
      }),

      narr('Karasu cai de joelhos no meio da ponte. A máscara racha e revela um rosto muito mais velho e muito mais cansado do que a voz sugeria.'),
      say('karasu', 'Nasci nesta costa. Vocês sabiam?', 'sad'),
      say('karasu', 'Quando o mar parou de dar peixe, sobrou roubar ou ver a família morrer devagar. Eu escolhi rápido.', 'sad'),
      say('karasu', 'Termina logo, garoto.', 'sad'),

      choice('O que você faz com Karasu?', [
        {
          text: 'Poupar. Entregá-lo às autoridades da vila.',
          tag: 'Misericórdia', tagKind: 'light',
          note: 'Poupou Karasu',
          decision: 'Você abaixa o kunai.',
          effects: {
            karma: { light: 8 },
            bonds: { naruto: 15, sakura: 10, kaede: 10, sasuke: -5 },
            flags: { sparedKarasu: true },
            run: (s) => { s.tally.spared++; },
          },
          then: [
            hero('Você vai responder pelo que fez. Vivo.', 'determined'),
            say('sasuke', 'Ele mandou queimar pessoas.', 'angry'),
            hero('Eu sei. E eu não sou ele.', 'determined'),
            say('naruto', '...É isso. É exatamente isso.', 'happy'),
            narr('Karasu é levado acorrentado. Meses depois, chega uma carta à Folha: ele passou a trabalhar na ponte que tentou queimar. Não como redenção. Como pena.'),
            give('leafCharm', 1),
          ],
        },
        {
          text: 'Executar. Bandidos não merecem segunda chance.',
          tag: 'Sentença', tagKind: 'dark',
          note: 'Executou Karasu',
          decision: 'Você não abaixa o kunai.',
          effects: {
            karma: { dark: 8 },
            bonds: { naruto: -12, sakura: -8, sasuke: 10 },
            flags: { killedKarasu: true },
            run: (s) => { s.tally.felled++; },
          },
          then: [
            narr('Você termina. É rápido e não é bonito e ninguém aplaude.'),
            say('naruto', 'Ele tinha se rendido.', 'shock'),
            hero('Ele tinha queimado um armazém com gente dentro.', 'neutral'),
            say('naruto', 'ISSO NÃO É A MESMA COISA!', 'angry'),
            say('sasuke', 'É a única coisa que garante que não acontece de novo.', 'neutral'),
            say('kakashi', 'Guardem isso. Os dois têm razão, e é exatamente por isso que o mundo ninja é como é.', 'sad'),
            narr('Naquela noite, o selo na sua palma esquenta sem que você tenha chamado.'),
            fx('dark'),
            give('steelKunai', 1),
          ],
        },
        {
          text: 'Deixar Kakashi decidir. Não é sua chamada.',
          tag: 'Delegar', tagKind: 'risk',
          note: 'Deixou a decisão com Kakashi',
          effects: { karma: { dark: 1 }, bonds: { kakashi: -5 }, flags: { deferredKarasu: true } },
          then: [
            say('kakashi', 'Não.', 'neutral'),
            say('kakashi', 'Um dia eu não vou estar aqui. E você vai ter que decidir com o time olhando exatamente assim.', 'sad'),
            say('kakashi', 'Prisão. Dessa vez eu resolvo. Da próxima, é você.', 'neutral'),
            narr('Karasu é preso. Você fica com a sensação incômoda de ter passado num teste sem ter feito a prova.'),
          ],
        },
      ]),

      go('ch2_end'),
    ],
  },

  ch2_end: {
    bg: 'coast', music: 'hope',
    nodes: [
      cast(),
      narr('A ponte é concluída três semanas depois. Não estão lá para ver — mas mandam uma carta com um nome pintado no arco de entrada.'),
      cast('oldMan'),
      say('oldMan', 'Chamamos de Ponte da Grande {hero}. Foi votado. Naruto votou três vezes.', 'happy'),
      say('naruto', 'A urna não tinha regra!', 'laugh'),

      iff({ flag: 'kaedeStayed' }, [
        cast('kaede'),
        say('kaede', 'Então é isso. Vocês voltam para uma vila grande e eu volto para os meus baldes.', 'sad'),
        choice('Última chance de convidar Kaede.', [
          {
            text: 'Estender a mão. "Vem com a gente."',
            tag: 'Recrutar Kaede', tagKind: 'bond',
            note: 'Convidou Kaede na despedida',
            effects: { bonds: { kaede: 15 }, karma: { light: 2 } },
            then: [
              join('kaede'),
              say('kaede', 'Você demorou.', 'happy'),
              say('kaede', 'Eu já tinha feito a mala.', 'laugh'),
            ],
          },
          {
            text: 'Se despedir. Cada um no seu lugar.',
            tag: 'Seguir', tagKind: 'risk',
            note: 'Seguiu sem Kaede',
            effects: { flags: { kaedeRefused: true } },
            then: [
              say('kaede', 'Boa sorte, ninja da Folha.', 'sad'),
              narr('Você olha para trás uma vez no caminho. Ela ainda está no cais.'),
            ],
          },
        ]),
      ]),

      narr('De volta a Konoha, Kakashi entrega o relatório e o Hokage lê duas vezes.'),
      cast('hokage'),
      say('hokage', 'Rank C que virou rank B. Sem baixas.', 'neutral'),
      say('hokage', 'Existe um Exame Chunin daqui a um mês.', 'smirk'),
      say('hokage', 'Kakashi acha que vocês não estão prontos.', 'neutral'),
      say('kakashi', 'Eu acho que ninguém nunca está pronto. Também acho que é exatamente por isso que existe exame.', 'closed'),
      rest('Um mês de treino. Descanso, comida e muita bandana suja.'),
      hub({ tier: 2, title: 'Um mês até o Exame Chunin. Dá para fazer muita coisa em um mês.' }),
      go('ch3_start'),
    ],
  },
};
