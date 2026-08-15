// Capítulo 3 — Exame Chunin. A floresta, o rival de pedra e a primeira sombra.

import {
  say, narr, hero, cast, go, choice, iff, flag, bond, karma, battle,
  chapter, sound, fx, give, ryo, rest, heal, join, shop, decision, pause, leave, hub,
} from './dsl.js';

export const scenes = {
  ch3_start: {
    bg: 'academy', music: 'village',
    nodes: [
      chapter(3, 'A Floresta e o Muro', 'Exame Chunin — segunda fase. Cinco dias, dois pergaminhos, sem regras.'),
      cast('proctor'),
      say('proctor', 'Segunda fase. Cada time recebe um pergaminho: Céu ou Terra. Vocês precisam dos dois para chegar à torre no centro.', 'neutral'),
      say('proctor', 'Vinte e seis times entram. Se mais de dez chegarem, eu terei feito um trabalho ruim.', 'smug'),
      say('proctor', 'Ah — e assinem isto. É o termo que isenta a vila caso vocês morram lá dentro.', 'smirk'),
      say('sakura', 'Caso a gente o quê?', 'shock'),

      cast('naruto', 'sakura', 'sasuke'),
      say('naruto', 'CINCO DIAS! EU AGUENTO CINCO ANOS!', 'laugh'),
      say('sakura', 'Você não aguenta cinco horas sem lámen.', 'angry'),
      say('sasuke', 'Foco. Vamos precisar de um plano antes de entrar.', 'determined'),

      choice('Qual é o plano do Time 7 na floresta?', [
        {
          text: 'Andar juntos, devagar, sem chamar atenção.',
          tag: 'Coeso', tagKind: 'light',
          note: 'Escolheu manter o time unido na floresta',
          effects: { karma: { light: 2 }, bonds: { sakura: 8, naruto: 6 }, flags: { forestTogether: true } },
          then: [
            say('sakura', 'Obrigada. É o único plano que não termina com alguém sozinho gritando.', 'happy'),
            say('sasuke', 'Lento. Mas eu não vou discutir.', 'neutral'),
          ],
        },
        {
          text: 'Emboscar outro time logo de cara e roubar o pergaminho.',
          tag: 'Predador', tagKind: 'dark',
          note: 'Escolheu caçar outros times',
          effects: { karma: { dark: 4 }, bonds: { sasuke: 10, naruto: -5 }, flags: { forestHunt: true } },
          then: [
            say('sasuke', 'Agora sim.', 'smirk'),
            say('naruto', 'A gente vai atacar outros genins? Eles são só... gente igual a gente.', 'sad'),
            hero('E eles estão pensando exatamente a mesma coisa sobre nós agora.', 'neutral'),
          ],
        },
        {
          text: 'Dividir em duplas e cobrir mais terreno.',
          tag: 'Arriscado', tagKind: 'risk',
          note: 'Dividiu o time em duplas',
          effects: { karma: { dark: 1 }, flags: { forestSplit: true } },
          then: [
            say('kakashi', 'Lembra do que eu falei na pedra?', 'neutral'),
            hero('Lembro. Duplas ainda são duas pessoas.', 'determined'),
            say('kakashi', '...Justo. Boa sorte.', 'closed'),
          ],
        },
      ]),

      go('ch3_forest'),
    ],
  },

  ch3_forest: {
    bg: 'deepForest', music: 'tense',
    nodes: [
      cast(),
      narr('A Floresta da Morte tem árvores de sessenta metros e insetos que não deviam ter esse tamanho. No segundo dia, o pergaminho de Terra já é de vocês.'),
      narr('No terceiro, alguém está esperando.'),

      battle({
        foes: ['soundGenin', 'soundGenin'], level: 11, bg: 'deepForest',
        name: 'Time do Som',
        intro: 'Dois genins com protetores de som e sorrisos que ensaiaram demais.',
      }),

      narr('Um deles derruba o pergaminho de Céu ao cair. Está feito: os dois pergaminhos são seus.'),
      narr('Só que o outro, antes de desmaiar, cospe uma frase que não faz sentido nenhum:'),
      say('soundGenin', 'Vocês... não são o alvo. Era só... para tirar os ANBU do cofre.', 'sad'),
      cast('sakura'),
      say('sakura', 'Que cofre? Do que ele está falando?', 'shock'),
      say('kakashi', 'O arquivo de jutsus proibidos fica sob a torre do Hokage. Está sem guarda pesada esta semana. Porque metade dos ANBU está aqui, cobrindo o exame.', 'shock'),
      say('kakashi', 'O exame não é o alvo. O exame é a distração.', 'determined'),
      flag('learnedDistraction'),
      go('ch3_jin'),
    ],
  },

  ch3_jin: {
    bg: 'deepForest', music: 'boss',
    nodes: [
      cast(),
      narr('A torre está a seis horas de caminhada. Na clareira antes dela, um garoto largo de ombros está parado no meio do único caminho, com os pés plantados como se tivessem raiz.'),
      cast('jinRival'),
      say('jinRival', 'Time da Folha. Bom.', 'determined'),
      say('jinRival', 'Meu nome é Jin, de Ishigakure. Meu time inteiro foi eliminado no primeiro dia. Eu sou o que sobrou.', 'sad'),
      say('jinRival', 'E eu preciso do seu pergaminho para não voltar de mãos vazias.', 'determined'),
      say('naruto', 'Sozinho contra quatro? Cara, isso é burrice!', 'shock'),
      say('jinRival', 'É. Provavelmente é.', 'determined'),
      say('jinRival', 'Mas na minha vila, quem volta sem nada não volta.', 'sad'),

      battle({
        foes: ['jinRival'], level: 12, bg: 'deepForest',
        name: 'Jin de Ishigakure', boss: true,
        intro: 'Ele planta os pés. Não vai sair do lugar.',
        onLoseText: 'Jin fica de pé sobre vocês, arfando, sem desferir o último golpe. Pega o pergaminho e vai embora sem olhar para trás.',
      }),

      narr('Jin cai de quatro e não consegue mais levantar. Ainda assim, estende o braço na direção do pergaminho.'),
      say('jinRival', 'Não... acabou...', 'determined'),
      say('sakura', 'Ele vai se machucar de verdade se continuar.', 'scared'),

      choice('Jin está no chão, sem time e sem pergaminho.', [
        {
          text: 'Dar a ele o pergaminho extra e levá-lo à torre com vocês.',
          tag: 'Aliado', tagKind: 'light',
          note: 'Poupou e ajudou Jin',
          decision: 'Você estende a mão para Jin.',
          effects: {
            karma: { light: 8 },
            bonds: { naruto: 12, sakura: 8, jin: 30 },
            flags: { sparedJin: true },
            run: (s) => { s.tally.spared++; },
          },
          then: [
            hero('A gente pegou dois pergaminhos de Céu no caminho. Não precisamos dos dois.', 'determined'),
            say('jinRival', 'Por que você faria isso?', 'shock'),
            hero('Porque a única regra da prova é chegar. Não é chegar sozinho.', 'determined'),
            narr('Jin olha para o pergaminho na mão dele por um tempo desconfortavelmente longo.'),
            say('jinRival', 'Ishigakure não teria feito isso.', 'sad'),
            say('jinRival', 'Eu vou lembrar disso.', 'determined'),
            join('jin'),
            say('naruto', 'BOA! Agora somos cinco! Isso é praticamente um exército!', 'laugh'),
          ],
        },
        {
          text: 'Levar o pergaminho dele e seguir. Exame é exame.',
          tag: 'Competição', tagKind: 'dark',
          note: 'Eliminou Jin do exame',
          effects: {
            karma: { dark: 5 },
            bonds: { sasuke: 8, naruto: -10 },
            flags: { crushedJin: true },
            run: (s) => { s.tally.felled++; },
          },
          then: [
            narr('Você pega o pergaminho da mão dele. Jin não resiste. Não tem mais com o quê.'),
            say('jinRival', 'Tudo bem.', 'sad'),
            say('jinRival', 'Era o que eu teria feito.', 'sad'),
            narr('É a coisa mais assustadora que alguém te disse esse ano.'),
            say('naruto', 'Ele estava caído.', 'sad'),
            hero('E acordado o bastante para tentar pegar o nosso.', 'neutral'),
            say('naruto', '...É.', 'sad'),
            narr('Naruto não fala mais nada até a torre.'),
          ],
        },
      ]),

      go('ch3_tower'),
    ],
  },

  ch3_tower: {
    bg: 'arena', music: 'tense',
    nodes: [
      cast(),
      narr('Nove times chegam à torre. O examinador parece genuinamente decepcionado com o número.'),
      cast('proctor'),
      say('proctor', 'Muitos sobreviventes. Fase final: torneio individual. Uma luta cada, na arena, com a vila assistindo.', 'neutral'),
      say('proctor', 'Chamem os nomes.', 'neutral'),

      narr('Você é o terceiro a ser chamado. Do outro lado da arena, dois adversários já estão de pé — porque o seu combate, por sorteio, é dois contra um.'),
      cast('naruto', 'sakura'),
      say('naruto', 'DOIS?! ISSO É TRAPAÇA!', 'angry'),
      say('kakashi', 'Não é. Chunin lidera. Líder decide em desvantagem numérica o tempo todo.', 'neutral'),
      say('kakashi', 'Mostra para eles.', 'determined'),

      battle({
        foes: ['soundGenin', 'mistAssassin'], level: 14, bg: 'arena',
        name: 'Rodada Final',
        intro: 'A arquibancada silencia. O examinador solta o braço.',
        onLoseText: 'Você cai antes do fim. A arquibancada aplaude o adversário — e aplaude você também, o que de alguma forma é pior.',
      }),

      narr('Você vence. Ou pelo menos ainda está de pé quando o examinador levanta a mão.'),
      fx('shake'),
      sound('dark'),
      narr('E então as luzes da arena morrem todas ao mesmo tempo.'),

      cast('anbu'),
      say('anbu', 'Quebra de perímetro na torre do Hokage! O arquivo proibido foi aberto!', 'shock'),
      say('anbu', 'Um pergaminho foi levado. Selo de contenção classe S — "Eclipse".', 'shock'),
      say('kakashi', 'Eclipse...', 'shock'),
      say('kakashi', 'Não pode ser. Aquilo foi selado há quinze anos junto com o homem que o criou.', 'angry'),
      hero('Kakashi. Quem criou?', 'determined'),
      narr('Ele demora a responder. Quando responde, olha para a sua mão esquerda enquanto fala.'),
      say('kakashi', 'Yoru Kagemasa. Ex-ANBU. Especialista em selos de transferência.', 'sad'),
      say('kakashi', 'E o homem que colocou essa marca na sua palma quando você era bebê.', 'sad'),
      fx('flash', '#b884e8'),
      flag('learnedKagemasa'),
      go('ch3_reveal'),
    ],
  },

  ch3_reveal: {
    bg: 'hokageOffice', music: 'dark',
    nodes: [
      cast('hokage'),
      narr('A sala do Hokage às três da manhã tem uma qualidade diferente de silêncio.'),
      say('hokage', 'Sentem-se. Isso vai levar um tempo.', 'sad'),
      say('hokage', 'Kagemasa era um dos melhores que já tivemos. Selou nove ameaças rank S sem perder um único subordinado.', 'neutral'),
      say('hokage', 'O problema é que ele descobriu que selos não destroem. Só guardam.', 'sad'),
      say('hokage', 'E que aquilo que é guardado pode ser transferido para um recipiente vivo.', 'sad'),
      say('sakura', 'Recipiente vivo...', 'scared'),
      say('hokage', 'Ele preparou catorze crianças órfãs como recipientes. Nós o detivemos antes que usasse treze delas.', 'sad'),
      narr('O Hokage olha para você.'),
      say('hokage', 'A décima quarta recebeu a marca. Só a marca — o selo vazio, sem carga.', 'sad'),
      hero('Eu sou um recipiente vazio.', 'shock'),
      say('hokage', 'Você é uma pessoa. Com uma fechadura na mão que nunca teve chave.', 'determined'),
      say('hokage', 'E Kagemasa acabou de roubar a chave.', 'sad'),

      cast('kakashi'),
      say('kakashi', 'Eu estava na equipe que o selou. Fui eu que te tirei de lá.', 'sad'),
      say('kakashi', 'Você tinha oito meses e não chorou nenhuma vez. Isso me assustou mais do que a missão inteira.', 'sad'),

      choice('O que você sente agora?', [
        {
          text: '"Então eu sou a arma dele. Eu vou usar isso contra ele."',
          tag: 'Encarar', tagKind: 'light',
          note: 'Decidiu usar o selo contra Kagemasa',
          effects: { karma: { light: 5 }, flags: { faceSeal: true }, bonds: { kakashi: 12 } },
          then: [
            say('kakashi', 'É exatamente isso que ele quer que você pense.', 'sad'),
            hero('Eu sei. Mas se ele precisa de mim para terminar, então enquanto eu estiver de pé, ele não termina.', 'determined'),
            say('kakashi', '...Você é insuportavelmente parecido com alguém que eu conheci.', 'happy'),
          ],
        },
        {
          text: '"Selem a minha mão. Agora. Antes que ele chegue perto."',
          tag: 'Sacrifício', tagKind: 'light',
          note: 'Pediu para ser selado',
          effects: { karma: { light: 6 }, flags: { askedToBeSealed: true }, bonds: { sakura: 12, naruto: 10 } },
          then: [
            say('sakura', 'Isso podia te matar!', 'shock'),
            hero('E não fazer nada mata mais gente.', 'determined'),
            say('hokage', 'Recusado. Não porque não funcionaria — porque eu não mando crianças morrerem por conveniência administrativa.', 'angry'),
            say('hokage', 'Nós enfrentamos isso juntos. Essa é a ordem.', 'determined'),
            flag('trueSealPath'),
          ],
        },
        {
          text: '"Se o selo tem poder, eu quero saber usar."',
          tag: 'Tentação', tagKind: 'dark',
          note: 'Quis aprender a usar o selo',
          effects: { karma: { dark: 6 }, flags: { sealCurious: true, wantsPower: true } },
          then: [
            narr('A sala esfria uns três graus.'),
            say('kakashi', 'Não.', 'angry'),
            hero('Ele vai vir atrás de mim de qualquer jeito. Prefiro chegar preparado.', 'determined'),
            say('hokage', 'Todo mundo que abriu esse tipo de porta disse exatamente essa frase.', 'sad'),
            narr('Naquela noite, a marca na sua palma pulsa devagar, e você jura ter sentido alguma coisa do outro lado pulsar de volta.'),
            fx('dark'),
          ],
        },
      ]),

      iff({ flag: 'sparedJin' }, [
        cast('jin'),
        say('jin', 'Ishigakure me mandou voltar.', 'neutral'),
        say('jin', 'Eu disse que estava ocupado.', 'determined'),
        say('jin', 'Se esse cara constrói selos que engolem pessoas, eu quero estar entre ele e vocês. É literalmente para isso que eu sirvo.', 'determined'),
        bond('jin', 12),
      ]),

      rest('Três dias de preparação. A vila inteira em alerta.'),
      hub({ tier: 3, title: 'Três dias. A vila em alerta, e ninguém conseguindo dormir direito.' }),
      go('ch4_start'),
    ],
  },
};
