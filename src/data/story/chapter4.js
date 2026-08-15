// Capítulo 4 — a caçada às ruínas. A escolha que decide se a vila acorda.

import {
  say, narr, hero, cast, go, choice, iff, flag, bond, karma, battle,
  chapter, sound, fx, give, ryo, rest, heal, join, shop, decision, pause, set, hub,
} from './dsl.js';

export const scenes = {
  ch4_start: {
    bg: 'hokageOffice', music: 'tense',
    nodes: [
      chapter(4, 'O Selo Aberto', 'Três dias até o eclipse. Kagemasa precisa dos dois.'),
      cast('kakashi'),
      say('kakashi', 'Rastreamos o pergaminho até as ruínas do templo velho, ao norte. Território neutro, sem jurisdição, perfeito para quem não quer testemunha.', 'determined'),
      say('kakashi', 'O ritual do Eclipse precisa de duas coisas: o pergaminho — que ele já tem — e o recipiente.', 'sad'),
      say('kakashi', 'Ele vai vir buscar você. É só questão de quando.', 'sad'),
      hub({ tier: 4, title: 'Últimos preparativos. Depois disso não tem volta.' }),
      cast('hokage'),
      say('hokage', 'Duas opções, e ambas são ruins.', 'neutral'),
      say('hokage', 'Uma: fortificamos a vila e esperamos ele vir. Vantagem de terreno, todos os jounin disponíveis, e civis no meio do fogo cruzado.', 'neutral'),
      say('hokage', 'Duas: um time pequeno vai até as ruínas e ataca antes do eclipse. Sem reforço, sem resgate — mas longe de qualquer inocente.', 'neutral'),

      choice('A decisão é sua. O Hokage está esperando.', [
        {
          text: '"Vamos até ele. Ninguém arrisca a vila por minha causa."',
          tag: 'Ofensiva', tagKind: 'light',
          note: 'Levou a luta até Kagemasa',
          decision: 'O time vai às ruínas.',
          effects: { karma: { light: 6 }, bonds: { naruto: 10, sakura: 8, kakashi: 10 }, flags: { wentToRuins: true } },
          then: [
            say('hokage', 'É a opção que mais provavelmente te mata.', 'sad'),
            hero('É a que mais provavelmente salva o resto.', 'determined'),
            say('naruto', 'A GENTE VAI JUNTO! Não adianta discutir!', 'determined'),
            say('sakura', 'Eu já preparei os suprimentos médicos. Estava óbvio que ele ia escolher isso.', 'happy'),
          ],
        },
        {
          text: '"Ficamos. A vila defende melhor do que ataca."',
          tag: 'Defesa', tagKind: 'risk',
          note: 'Escolheu esperar Kagemasa em Konoha',
          decision: 'A vila se fortifica.',
          effects: { karma: { light: 2 }, flags: { defendedVillage: true } },
          then: [
            say('hokage', 'Compreendo. Vamos evacuar os distritos externos.', 'neutral'),
            say('kakashi', 'Ele vai atacar o ponto mais fraco. E vai fazer questão de que você veja.', 'sad'),
            narr('É uma decisão defensável. Todas as decisões defensáveis têm um custo que só aparece depois.'),
          ],
        },
        {
          text: '"Eu vou sozinho. Ele quer a mim."',
          tag: 'Isolamento', tagKind: 'dark',
          note: 'Tentou ir sozinho',
          effects: { karma: { dark: 5 }, bonds: { naruto: -10, sakura: -10, sasuke: -6 }, flags: { wentAlone: true, wentToRuins: true } },
          then: [
            say('naruto', 'DE JEITO NENHUM!', 'angry'),
            hero('Se eu for junto com vocês, ele tem alvos. Se eu for sozinho, ele só tem a mim.', 'determined'),
            say('sakura', 'Você acabou de descrever exatamente o cenário que ele quer!', 'angry'),
            narr('Você sai pela janela antes do amanhecer. Duas horas depois, quatro sombras aparecem na sua trilha, teimosas demais para respeitar sua decisão.'),
            say('kakashi', 'Nós conversamos sobre abandonar companheiros. Você lembra do que eu disse.', 'angry'),
            hero('...Lembro.', 'sad'),
            say('kakashi', 'Ótimo. Continua andando. Agora com o time.', 'neutral'),
            bond('kakashi', -8),
          ],
        },
      ]),

      iff({ flag: 'defendedVillage' }, [go('ch4_siege')], [go('ch4_ruins')]),
    ],
  },

  // ---------------------------------------------------------- rota: defesa ---
  ch4_siege: {
    bg: 'villageNight', music: 'boss',
    nodes: [
      cast(),
      narr('Ele vem na segunda noite, sem aviso e sem exército — só uma dúzia de figuras encapuzadas e um silêncio que apaga o som dos grilos quarteirão por quarteirão.'),

      battle({
        foes: ['shadowAcolyte', 'shadowBrute', 'shadowAcolyte'], level: 17, bg: 'villageNight',
        name: 'Ataque a Konoha',
        intro: 'Os acólitos se espalham pelos telhados. O distrito leste ainda não terminou de evacuar.',
        onLoseText: 'Vocês caem no meio da rua. Quando acordam, o distrito leste não existe mais.',
        onLose: 'goto', loseGoto: 'ch4_fell',
      }),

      narr('Vocês seguram a linha. Mas enquanto lutavam no leste, alguém entrou pelo norte.'),
      cast('anbu'),
      say('anbu', 'A muralha norte foi aberta! Ele levou seis reféns do orfanato!', 'shock'),
      say('kakashi', 'Reféns não são a moeda dele. São o convite.', 'angry'),
      hero('Ele quer que eu vá até as ruínas. Sozinho, se possível.', 'determined'),
      say('sakura', 'Então a gente vai junto. De novo. Pela última vez, espero.', 'determined'),
      karma({ dark: 1 }),
      flag('hostagesTaken'),
      heal(.7),
      go('ch4_ruins'),
    ],
  },

  ch4_fell: {
    bg: 'ruinsNight', music: 'sad',
    nodes: [
      cast(),
      narr('Vocês acordam na enfermaria de campanha dois dias depois. O eclipse já passou.'),
      narr('O que saiu do selo atravessou a muralha norte antes do amanhecer.'),
      flag('villageFell'),
      say('kakashi', 'A vila está de pé. Grande parte dela.', 'sad'),
      say('kakashi', 'Kagemasa desapareceu com o que abriu. Não sabemos para onde.', 'sad'),
      narr('Ninguém culpa você em voz alta. É pior assim.'),
      go('finale_aftermath'),
    ],
  },

  // -------------------------------------------------------- rota: ofensiva ---
  ch4_ruins: {
    bg: 'ruins', music: 'tense',
    nodes: [
      cast(),
      narr('O templo velho é uma coluna quebrada no meio do nada, cercada de pedra rachada e de um cheiro doce demais que não devia estar ali.'),
      narr('Guardas encapuzados patrulham o pátio em círculos precisos demais para gente viva.'),

      battle({
        foes: ['shadowAcolyte', 'shadowBrute'], level: 17, bg: 'ruins',
        name: 'Patrulha das Sombras',
        intro: 'Eles não perguntam quem vocês são. Já sabiam.',
      }),

      narr('Dentro do templo, o corredor central desce em espiral. Nas paredes, catorze nichos vazios — e catorze nomes gravados.'),
      cast('sakura'),
      say('sakura', '{hero}... o seu nome está aqui. O último.', 'scared'),
      say('sakura', 'Os outros treze estão riscados.', 'scared'),
      hero('Riscados quer dizer o quê?', 'shock'),
      say('kakashi', 'Quer dizer que não deu certo com eles.', 'sad'),

      iff({ flag: 'hokageHint' }, [
        say('kakashi', 'O Hokage disse que você me perguntaria quando confiasse em mim. Suponho que a hora chegou.', 'sad'),
        say('kakashi', 'O selo não é uma prisão, é uma ponte. Ele precisa de duas pontas: uma para guardar e outra para receber.', 'determined'),
        say('kakashi', 'Enquanto você não aceitar receber, ele não consegue atravessar. A escolha é literalmente sua. Sempre foi.', 'determined'),
        flag('knowsSealTruth'),
        bond('kakashi', 10),
      ]),

      go('ch4_gate'),
    ],
  },

  ch4_gate: {
    bg: 'ruins', music: 'boss',
    nodes: [
      cast(),
      narr('A câmara final está trancada por um portão de pedra com três guardiões parados diante dele. Eles não piscam. Não é figura de linguagem.'),

      battle({
        foes: ['shadowAcolyte', 'shadowAcolyte', 'shadowBrute'], level: 18, bg: 'ruins',
        name: 'Guardiões do Portão', boss: true,
        intro: 'O portão só abre quando os três caírem. Kagemasa fez questão de que fosse assim.',
      }),

      iff({ flag: 'hostagesTaken' }, [
        narr('Atrás do portão, seis crianças amarradas no chão, ilesas. Kaede — ou Sakura, se ela não estiver aqui — corta as cordas em segundos.'),
        say('sakura', 'Elas estão bem. Assustadas, mas bem.', 'happy'),
        karma({ light: 3 }),
        flag('hostagesSaved'),
      ]),

      narr('E no centro da câmara, sob uma abertura circular por onde entra a luz que ainda não é eclipse, ele está esperando.'),
      cast('kagemasaP1'),
      say('kagemasaP1', 'Catorze.', 'neutral'),
      say('kagemasaP1', 'Eu preparei catorze. Treze não sobreviveram à marca. Você sobreviveu sem nem perceber que estava sendo testado.', 'neutral'),
      say('kagemasaP1', 'Sabe o que isso faz de você? Não uma vítima. Um resultado.', 'smug'),
      hero('Eu sou uma pessoa.', 'angry'),
      say('kagemasaP1', 'Todos eram. Foi exatamente isso que os matou.', 'neutral'),

      say('kagemasaP1', 'Vou te oferecer uma coisa que não ofereci a nenhum dos treze: escolha.', 'neutral'),
      say('kagemasaP1', 'Abra o selo por vontade própria. Ninguém aqui precisa morrer — nem seus amigos, nem essas crianças, nem você.', 'smug'),
      say('kagemasaP1', 'Você só precisa parar de resistir.', 'smug'),

      choice('O eclipse começa em minutos. Ele estende a mão.', [
        {
          text: '"Não." Sacar o kunai.',
          tag: 'Recusar', tagKind: 'light',
          note: 'Recusou a oferta de Kagemasa',
          decision: 'Você recusa.',
          effects: { karma: { light: 6 }, bonds: { naruto: 8, sakura: 8, sasuke: 8 }, flags: { refusedOffer: true } },
          then: [
            hero('Você me deu escolha. Essa é a minha.', 'determined'),
            say('kagemasaP1', 'Previsível. Mas eu respeito.', 'neutral'),
          ],
        },
        {
          text: '"Deixa eles saírem primeiro. Depois conversamos."',
          tag: 'Ganhar tempo', tagKind: 'risk',
          note: 'Negociou pela segurança do time',
          effects: { karma: { light: 3 }, bonds: { sakura: 10, kaede: 8 }, flags: { negotiated: true } },
          then: [
            say('kagemasaP1', 'Você quer trocar a sua segurança pela deles. Interessante.', 'neutral'),
            say('kagemasaP1', 'Recusado. Eu preciso que eles assistam. É parte do processo — um recipiente que ainda tem a quem voltar resiste. Um que perdeu tudo, não.', 'smug'),
            say('naruto', 'A GENTE NÃO VAI A LUGAR NENHUM!', 'angry'),
            narr('Você tentou. E ao tentar, aprendeu exatamente do que ele precisa: que você fique sozinho.'),
            flag('knowsHisNeed'),
          ],
        },
        {
          text: 'Estender a mão. Aceitar.',
          tag: 'Aceitar o selo', tagKind: 'dark',
          note: 'Aceitou abrir o selo',
          decision: 'Você estende a mão.',
          effects: { karma: { dark: 12 }, bonds: { naruto: -15, sakura: -15, sasuke: -10 }, flags: { embracedSeal: true } },
          then: [
            narr('Você levanta a mão esquerda. A marca acende antes de você tocá-lo.'),
            say('sakura', 'NÃO—', 'scared'),
            fx('dark'),
            say('kagemasaP1', 'Finalmente. Um que entende que poder não é maldade. É só ferramenta.', 'happy'),
            narr('A dor não vem. Vem clareza — e é muito, muito pior.'),
            say('kagemasaP1', 'Agora lute comigo. Não contra. Vamos ver o que você faz com isso.', 'smug'),
            narr('Seus amigos gritam o seu nome. Por um instante longo demais, você não lembra por que isso deveria importar.'),
          ],
        },
      ]),

      battle({
        foes: ['kagemasaP1'], level: 19, bg: 'ruinsNight',
        name: 'Yoru Kagemasa', boss: true, noFlee: true,
        intro: 'A luz pela abertura começa a escurecer nas bordas. O eclipse chegou.',
        onLoseText: 'Vocês caem um a um. A última coisa que você vê é a mão dele descendo sobre a sua palma.',
        onLose: 'goto', loseGoto: 'ch4_fell',
      }),

      go('finale_start'),
    ],
  },
};
