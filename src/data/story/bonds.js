// Cenas de elo: conversas opcionais liberadas conforme o elo com cada
// companheiro cresce. São jogadas a partir do Intervalo e cada uma roda
// uma única vez (controlada por flag).
//
// Diferente das cenas da história, aqui são só listas de nós — nada de `go`.
// O interpretador devolve ao Intervalo quando a lista acaba.

import { say, narr, hero, cast, bg, bgm, choice, karma, bond, flag, give, sound, pause } from './dsl.js';

export const BOND_SCENES = {
  naruto: [
    {
      id: 'naruto1', minBond: 30, title: 'Lámen às Duas da Manhã',
      bg: 'ichiraku', music: 'calm',
      nodes: [
        cast('naruto'),
        narr('O Ichiraku fecha à meia-noite. Naruto conhece o velho Teuchi bem o bastante para isso ser um detalhe negociável.'),
        say('naruto', 'Miso com carne extra. Dois. Um é seu, não discute.', 'happy'),
        hero('Você já jantou. Eu te vi jantar.', 'neutral'),
        say('naruto', 'Jantei. Isso aqui é outra coisa.', 'happy'),
        narr('Ele mexe o caldo sem comer por um tempo.'),
        say('naruto', 'Sabe por que eu venho aqui de madrugada?', 'neutral'),
        say('naruto', 'Porque de madrugada tá vazio. E vazio quer dizer que ninguém tá me olhando de lado.', 'sad'),
        say('naruto', 'Aí o velho Teuchi serve como se eu fosse um cliente normal. E por vinte minutos eu sou.', 'sad'),
        narr('Ele diz isso com a boca cheia, num tom completamente casual, o que de alguma forma é pior.'),
        choice('O que você responde?', [
          {
            text: '"Você é um cliente normal. E é meu companheiro de time."',
            tag: 'Elo', tagKind: 'bond',
            effects: { bonds: { naruto: 10 }, karma: { light: 3 } },
            then: [
              narr('Naruto para de mastigar. Fica encarando a tigela por uns três segundos longos.'),
              say('naruto', 'É. Sou.', 'happy'),
              say('naruto', 'PODE FALAR ISSO DE NOVO, EU NÃO OUVI DIREITO!', 'laugh'),
              hero('Ouviu sim.', 'smirk'),
              say('naruto', 'OUVI!', 'laugh'),
            ],
          },
          {
            text: 'Não dizer nada. Só pedir uma terceira tigela.',
            tag: 'Silêncio', tagKind: 'light',
            effects: { bonds: { naruto: 7 }, karma: { light: 2 } },
            then: [
              narr('Você chama o Teuchi e pede mais uma. Naruto olha para você de lado.'),
              say('naruto', 'Você não vai falar nada?', 'neutral'),
              hero('Não. Vou comer lámen com você às duas da manhã.', 'neutral'),
              narr('Ele sorri para dentro da tigela e não responde. É o suficiente.'),
            ],
          },
        ]),
      ],
    },
    {
      id: 'naruto2', minBond: 65, title: 'O Que Mora Dentro',
      bg: 'rooftopNight', music: 'sad',
      nodes: [
        cast('naruto'),
        narr('Ele te chama para o telhado sem explicar por quê. Fica um tempo enorme olhando a vila antes de falar.'),
        say('naruto', 'Você já se perguntou por que metade dessa vila me odeia sem eu ter feito nada?', 'sad'),
        hero('Já. Nunca perguntei porque achei que era problema seu contar ou não.', 'neutral'),
        say('naruto', 'Tem uma coisa selada dentro de mim. Desde que eu nasci.', 'sad'),
        say('naruto', 'Uma coisa grande. Que fez muita gente morrer antes de eu existir.', 'sad'),
        say('naruto', 'Eles não me odeiam. Odeiam ela. Só que ela não tem rosto e eu tenho.', 'sad'),
        narr('Você abre a mão esquerda. A marca em espiral está lá, quieta, como sempre.'),
        hero('Naruto. Eu também tenho um selo.', 'determined'),
        say('naruto', '...Sério?', 'shock'),
        hero('O meu tá vazio. Mas foi feito para guardar alguma coisa. E alguém quer preencher.', 'sad'),
        narr('Ele olha a sua palma por um tempo. Depois abre a própria mão e encosta na sua.'),
        say('naruto', 'Então a gente é dois potes.', 'happy'),
        hero('Essa é a pior metáfora que eu já ouvi.', 'smirk'),
        say('naruto', 'É A MELHOR! Escuta:', 'laugh'),
        say('naruto', 'Ninguém é o que botaram dentro dele. A gente é o que faz com isso.', 'determined'),
        narr('Ele tira do bolso um pingente gasto, em forma de raposa, e joga no seu colo.'),
        say('naruto', 'Ganhei do Terceiro quando eu era pequeno. Ele disse que era pra me lembrar disso.', 'happy'),
        say('naruto', 'Eu já lembro. Fica com ele.', 'determined'),
        give('foxPendant', 1),
        sound('bond'),
        bond('naruto', 15),
        karma({ light: 5 }),
        flag('narutoTruth'),
      ],
    },
  ],

  sakura: [
    {
      id: 'sakura1', minBond: 30, title: 'A Terceira Página',
      bg: 'village', music: 'calm',
      nodes: [
        cast('sakura'),
        narr('Sakura está sentada na escada da biblioteca com um caderno no colo, riscando a mesma linha pela quinta vez.'),
        say('sakura', 'Não olha.', 'angry'),
        hero('Já olhei.', 'smirk'),
        say('sakura', 'É um registro das missões. Quem levou dano, quanto, com o quê, quanto tempo levou pra fechar.', 'neutral'),
        say('sakura', 'Na missão da ponte o Naruto levou três golpes que eu podia ter bloqueado se estivesse dois passos à frente.', 'sad'),
        say('sakura', 'Anotei os três. Anotei os passos.', 'sad'),
        hero('Isso não é obsessão? Um pouco?', 'neutral'),
        say('sakura', 'É.', 'determined'),
        say('sakura', 'Eu não tenho o Sharingan, não tenho chakra infinito e não tenho um sensei lendário me treinando em particular.', 'determined'),
        say('sakura', 'O que eu tenho é que eu presto atenção. Então eu presto muita.', 'determined'),
        narr('Ela vira o caderno para você. A terceira página é um mapa da formação do time, com setas.'),
        say('sakura', 'Se a gente andar assim, eu alcanço qualquer um de vocês em um movimento. Testa comigo na próxima?', 'neutral'),
        choice('Ela está esperando uma resposta.', [
          {
            text: '"Vamos testar agora."',
            tag: 'Elo', tagKind: 'bond',
            effects: { bonds: { sakura: 12 }, karma: { light: 2 }, items: { ration: 2 } },
            then: [
              narr('Vocês passam a tarde inteira no campo de treino refazendo a mesma formação até ela funcionar sem ninguém pensar.'),
              say('sakura', 'De novo.', 'determined'),
              hero('É a décima quarta vez.', 'sad'),
              say('sakura', 'De novo.', 'happy'),
            ],
          },
          {
            text: '"Você devia confiar mais em você e menos no caderno."',
            tag: 'Franqueza', tagKind: 'risk',
            effects: { bonds: { sakura: 6 } },
            then: [
              say('sakura', 'O caderno é como eu confio em mim.', 'angry'),
              say('sakura', '...Mas eu entendi. Obrigada.', 'sad'),
              narr('Ela fecha o caderno. Reabre dois minutos depois.'),
            ],
          },
        ]),
      ],
    },
    {
      id: 'sakura2', minBond: 65, title: 'Mãos que Fecham Feridas',
      bg: 'memorial', music: 'sad',
      nodes: [
        cast('sakura'),
        narr('Ela te encontra na pedra memorial. Não pergunta o que você está fazendo ali.'),
        say('sakura', 'Eu decidi uma coisa.', 'determined'),
        say('sakura', 'Vou virar ninja médica. De verdade, com estudo formal, não só o que eu aprendi improvisando.', 'determined'),
        hero('Por quê?', 'neutral'),
        say('sakura', 'Porque toda vez que alguém do time cai, eu penso a mesma coisa antes de qualquer outra.', 'sad'),
        say('sakura', 'Não é "que horror". É "eu sei fechar isso".', 'sad'),
        say('sakura', 'E aí eu percebi que essa é a frase de alguém que já escolheu, só não tinha admitido.', 'neutral'),
        narr('Ela abre a mão. O chakra verde acende na palma, firme, sem tremer.'),
        say('sakura', 'Me deixa treinar em você. Você vive se machucando mesmo.', 'smirk'),
        hero('Que oferta encantadora.', 'smirk'),
        say('sakura', 'Eu sei.', 'happy'),
        narr('Ela te ensina, naquela tarde, a técnica de emergência que traz alguém de volta quando o coração já parou.'),
        say('sakura', 'Espero que você nunca precise usar isso em mim.', 'sad'),
        hero('Combinado.', 'determined'),
        sound('bond'),
        bond('sakura', 15),
        karma({ light: 4 }),
        flag('sakuraMedic'),
      ],
    },
  ],

  sasuke: [
    {
      id: 'sasuke1', minBond: 30, title: 'Duas Mil Repetições',
      bg: 'trainingField', music: 'tense',
      nodes: [
        cast('sasuke'),
        narr('Você o encontra no campo de treino às cinco da manhã. Pelas marcas no poste, ele já está ali há horas.'),
        say('sasuke', 'Você está atrapalhando.', 'neutral'),
        hero('Você errou o último. Girou o quadril cedo demais.', 'neutral'),
        narr('Sasuke para. Isso, vindo dele, é praticamente um grito.'),
        say('sasuke', '...Mostra.', 'neutral'),
        narr('Vocês treinam em silêncio por quarenta minutos. Ele acerta na terceira tentativa e continua repetindo mesmo depois.'),
        hero('Já saiu certo. Por que continuar?', 'neutral'),
        say('sasuke', 'Porque sair certo uma vez é sorte. Duas mil vezes é uma habilidade.', 'determined'),
        say('sasuke', 'E porque quando eu encontrar a pessoa que eu preciso encontrar, eu não vou ter direito à primeira tentativa.', 'angry'),
        hero('Quem?', 'neutral'),
        say('sasuke', 'Não é da sua conta.', 'angry'),
        narr('Uma pausa longa.'),
        say('sasuke', 'Ainda.', 'neutral'),
        sound('bond'),
        bond('sasuke', 12),
        give('trainingKunai', 1),
      ],
    },
    {
      id: 'sasuke2', minBond: 65, title: 'O Nome Que Ele Não Diz',
      bg: 'rooftopNight', music: 'dark',
      nodes: [
        cast('sasuke'),
        narr('Ele te chama. Sasuke nunca chama ninguém. Já é informação suficiente para você levar a sério.'),
        say('sasuke', 'Meu clã inteiro morreu numa noite.', 'neutral'),
        say('sasuke', 'Não foi guerra, não foi invasão. Foi uma pessoa. Uma só.', 'angry'),
        say('sasuke', 'E essa pessoa me deixou vivo de propósito, para eu ficar exatamente assim.', 'angry'),
        narr('Ele diz tudo isso olhando para a vila, num tom de relatório.'),
        say('sasuke', 'Eu sei o que você vai falar. O Naruto já falou, a Sakura já falou, o Kakashi já falou de um jeito mais elegante.', 'neutral'),
        say('sasuke', 'Que vingança não devolve ninguém.', 'sad'),
        choice('E você, o que fala?', [
          {
            text: '"Não vou falar isso. Vou falar que eu vou junto."',
            tag: 'Elo forte', tagKind: 'bond',
            effects: { bonds: { sasuke: 15 }, karma: { light: 4 }, flags: { sasukeAnchor: true } },
            then: [
              narr('Ele finalmente vira a cabeça.'),
              say('sasuke', 'Você não entende o que está oferecendo.', 'shock'),
              hero('Entendo. Estou oferecendo não te deixar ir sozinho. É o que eu tenho.', 'determined'),
              narr('Sasuke fica calado por um tempo desconfortável.'),
              say('sasuke', '...Tsc.', 'sad'),
              say('sasuke', 'Idiota.', 'sad'),
              narr('Ele diz "idiota" do mesmo jeito que outra pessoa diria "obrigado".'),
              sound('bond'),
            ],
          },
          {
            text: '"Vingança não devolve ninguém."',
            tag: 'Honesto', tagKind: 'light',
            effects: { bonds: { sasuke: 5 }, karma: { light: 2 } },
            then: [
              say('sasuke', 'Eu sei.', 'angry'),
              say('sasuke', 'Todo mundo sabe. Isso nunca foi o ponto.', 'angry'),
              narr('Ele desce do telhado sem se despedir. Você não sabe se ajudou ou se acabou de virar mais uma voz que ele já ouviu.'),
            ],
          },
          {
            text: '"Se for pra ir atrás dele, vá forte. Eu te ajudo a treinar."',
            tag: 'Sombra', tagKind: 'dark',
            effects: { bonds: { sasuke: 12 }, karma: { dark: 5 }, flags: { fedSasukeRevenge: true } },
            then: [
              say('sasuke', 'Você é a primeira pessoa que não tenta me convencer do contrário.', 'shock'),
              say('sasuke', 'Obrigado.', 'neutral'),
              narr('É a primeira vez que ele te agradece. Você deveria estar mais feliz do que está.'),
            ],
          },
        ]),
      ],
    },
  ],

  kakashi: [
    {
      id: 'kakashi1', minBond: 30, title: 'Por Que Ele Se Atrasa',
      bg: 'memorial', music: 'sad',
      nodes: [
        cast('kakashi'),
        narr('Você acorda cedo demais e descobre onde Kakashi passa as manhãs que ele deveria passar te treinando.'),
        say('kakashi', 'Ah. Você me achou.', 'closed'),
        hero('Todo dia? É por isso o atraso?', 'shock'),
        say('kakashi', 'Todo dia.', 'neutral'),
        narr('Ele aponta um nome na pedra, na altura do peito.'),
        say('kakashi', 'Esse aqui era meu companheiro de time. Ele morreu me salvando e me deu um olho de presente antes.', 'sad'),
        say('kakashi', 'Foi ele que me ensinou aquilo que eu falei para vocês. Sobre abandonar companheiros.', 'sad'),
        say('kakashi', 'Eu não inventei nada. Só repito o que um garoto de treze anos me disse enquanto morria debaixo de uma pedra.', 'sad'),
        narr('Kakashi não muda o tom em nenhum momento. É esse o detalhe que te desmonta.'),
        hero('Desculpa ter reclamado dos atrasos.', 'sad'),
        say('kakashi', 'Não. Reclama.', 'happy'),
        say('kakashi', 'Se vocês pararem de reclamar do meu atraso, quer dizer que vocês entenderam. E eu prefiro que vocês demorem a entender.', 'sad'),
        sound('bond'),
        bond('kakashi', 12),
        karma({ light: 3 }),
      ],
    },
    {
      id: 'kakashi2', minBond: 65, title: 'A Ponte nos Dois Sentidos',
      bg: 'hokageOffice', music: 'dark',
      nodes: [
        cast('kakashi'),
        narr('Ele te chama sozinho ao arquivo. Fecha a porta, o que ele nunca faz.'),
        say('kakashi', 'Vou te contar como o selo do Kagemasa funciona de verdade. O Hokage não autorizou, então presta atenção de primeira.', 'determined'),
        say('kakashi', 'Todo mundo trata selo como cofre: tranca uma coisa e pronto.', 'neutral'),
        say('kakashi', 'O do Kagemasa não é cofre. É ponte.', 'determined'),
        say('kakashi', 'Ponte tem duas cabeceiras. E ponte pode ser atravessada nos dois sentidos.', 'determined'),
        hero('Quer dizer que dá para entrar.', 'shock'),
        say('kakashi', 'Quer dizer que dá para entrar.', 'neutral'),
        say('kakashi', 'Ninguém nunca tentou porque ninguém nunca quis chegar até o que mora do outro lado. Queriam só matar.', 'sad'),
        narr('Ele te olha por um tempo longo.'),
        say('kakashi', 'Você é diferente nisso. Eu reparei desde a ponte no País das Ondas.', 'neutral'),
        say('kakashi', 'Guarda essa informação. Um dia ela vai ser a única saída que sobra — e vai parecer a mais burra de todas.', 'determined'),
        sound('bond'),
        bond('kakashi', 15),
        karma({ light: 4 }),
        flag('knowsSealTruth'),
      ],
    },
  ],

  kaede: [
    {
      id: 'kaede1', minBond: 30, title: 'Ler a Correnteza',
      bg: 'coast', music: 'calm',
      nodes: [
        cast('kaede'),
        narr('Kaede te leva até o rio e senta na margem sem dizer o que quer.'),
        say('kaede', 'Olha a água e me fala onde é fundo.', 'neutral'),
        hero('...No meio?', 'neutral'),
        say('kaede', 'Errado. Ali, perto da pedra. Onde a superfície está mais lisa.', 'smirk'),
        say('kaede', 'Água agitada é rasa. Água calma é funda. É contraintuitivo e é o primeiro erro que mata gente do continente.', 'neutral'),
        narr('Ela joga uma pedra e a correnteza a puxa exatamente para onde ela apontou.'),
        say('kaede', 'Meu pai me ensinou isso antes de eu saber ler. Depois ele afundou num trecho que ele conhecia bem.', 'sad'),
        say('kaede', 'Saber não basta. Você também tem que estar prestando atenção no dia.', 'sad'),
        hero('Por isso você reparou em tudo naquela noite do armazém.', 'neutral'),
        say('kaede', 'Eu reparo em tudo todo dia. É cansativo.', 'sad'),
        say('kaede', 'Mas é como eu mantenho as pessoas em cima da água.', 'determined'),
        sound('bond'),
        bond('kaede', 12),
        give('antidote', 2),
      ],
    },
    {
      id: 'kaede2', minBond: 65, title: 'Duas Famílias',
      bg: 'coast', music: 'sad',
      nodes: [
        cast('kaede'),
        narr('Ela te procura à noite, com o rosto de quem ensaiou a conversa e desistiu do roteiro no caminho.'),
        say('kaede', 'Eu preciso te falar uma coisa e não quero que você me console depois.', 'sad'),
        say('kaede', 'Naquele armazém tinham três famílias.', 'sad'),
        say('kaede', 'Eu conhecia as três. A do meio tinha uma menina de seis anos que me chamava de tia sem eu ser tia de ninguém.', 'sad'),
        narr('Ela respira fundo.'),
        say('kaede', 'Eu penso nisso toda noite. Não como culpa — eu sei que a decisão não foi minha.', 'sad'),
        say('kaede', 'Penso porque decidir custa. E eu quero lembrar quanto, para nunca decidir com leveza.', 'determined'),
        say('kaede', 'Você decide muita coisa agora. Eu queria que você carregasse isso comigo.', 'sad'),
        choice('Ela está te oferecendo o peso, não pedindo alívio.', [
          {
            text: 'Aceitar. "Carrego. Me lembra sempre que eu esquecer."',
            tag: 'Elo forte', tagKind: 'bond',
            effects: { bonds: { kaede: 15 }, karma: { light: 5 }, flags: { kaedeWeight: true } },
            then: [
              say('kaede', 'Combinado.', 'sad'),
              say('kaede', 'E obrigada por não ter dito "não foi sua culpa". Todo mundo diz. Nunca ajuda.', 'sad'),
              sound('bond'),
            ],
          },
          {
            text: '"Você não devia carregar isso sozinha."',
            tag: 'Consolo', tagKind: 'light',
            effects: { bonds: { kaede: 7 }, karma: { light: 2 } },
            then: [
              say('kaede', 'Eu pedi para você não me consolar.', 'sad'),
              say('kaede', '...Mas obrigada mesmo assim.', 'sad'),
            ],
          },
        ]),
      ],
    },
  ],

  jin: [
    {
      id: 'jin1', minBond: 30, title: 'O Peso da Pedra',
      bg: 'trainingField', music: 'calm',
      nodes: [
        cast('jin'),
        narr('Jin está segurando uma rocha acima da cabeça. Pela cor do rosto, há bastante tempo.'),
        hero('Isso é treino ou castigo?', 'neutral'),
        say('jin', 'Em Ishigakure é a mesma palavra.', 'neutral'),
        narr('Ele abaixa a pedra com cuidado, como quem já quebrou o pé fazendo isso errado.'),
        say('jin', 'Lá, genin que recua é rebaixado. Genin rebaixado não come na mesa comum.', 'sad'),
        say('jin', 'Então a gente aprende a não recuar. Não por coragem — por fome.', 'sad'),
        hero('E naquele dia na floresta? Você estava caído e ainda tentou pegar o pergaminho.', 'neutral'),
        say('jin', 'Eu não sabia fazer outra coisa.', 'sad'),
        say('jin', 'Você me estendeu a mão e eu não entendi o gesto. Precisei de dois dias para entender.', 'sad'),
        say('jin', 'Na minha vila, mão estendida é para puxar você para baixo.', 'sad'),
        narr('Ele volta a levantar a pedra. Dessa vez, encaixa nos ombros de um jeito que dá para respirar.'),
        say('jin', 'Aqui eu aprendi que dá para segurar peso sem ficar sozinho embaixo dele. Vou levar isso comigo.', 'determined'),
        sound('bond'),
        bond('jin', 12),
        give('meshShirt', 1),
      ],
    },
    {
      id: 'jin2', minBond: 65, title: 'Onde Ele Fica',
      bg: 'gate', music: 'hope',
      nodes: [
        cast('jin'),
        narr('Chega uma carta de Ishigakure com selo oficial. Jin lê de pé, no portão, e não muda de expressão.'),
        say('jin', 'Me mandaram voltar. É uma ordem, não um convite.', 'neutral'),
        hero('E você vai?', 'sad'),
        say('jin', 'Se eu não voltar, deixo de ser ninja de Ishigakure. Viro desertor. Bandana riscada.', 'sad'),
        narr('Ele olha para o portão da Folha por um tempo.'),
        say('jin', 'Sabe o que é engraçado? Eu passei a vida inteira aprendendo a não recuar.', 'neutral'),
        say('jin', 'E agora a coisa mais difícil que eu já fiz é não voltar.', 'determined'),
        narr('Ele rasga a carta. Não com raiva — devagar, no meio, como quem fecha uma conta.'),
        say('jin', 'Eu escolhi onde eu fico. É a primeira coisa que eu escolho na vida.', 'determined'),
        hero('A Folha vai te receber. Eu garanto.', 'determined'),
        say('jin', 'Você não tem autoridade nenhuma para garantir isso.', 'smirk'),
        hero('Não tenho mesmo.', 'smirk'),
        say('jin', 'Então garante de novo. Soa bem.', 'happy'),
        sound('bond'),
        bond('jin', 15),
        karma({ light: 4 }),
        flag('jinStays'),
      ],
    },
  ],
};

/** Cena de elo disponível agora para um personagem (ou null). */
export function nextBondScene(charId, bondValue, flags) {
  const list = BOND_SCENES[charId] || [];
  return list.find((s) => bondValue >= s.minBond && !flags[`bondScene_${s.id}`]) || null;
}

/** Próxima cena bloqueada, para mostrar o quanto falta. */
export function lockedBondScene(charId, bondValue, flags) {
  const list = BOND_SCENES[charId] || [];
  return list.find((s) => bondValue < s.minBond && !flags[`bondScene_${s.id}`]) || null;
}

/** Todas as cenas, achatadas (usado nos testes). */
export function allBondScenes() {
  return Object.entries(BOND_SCENES).flatMap(([charId, list]) =>
    list.map((s) => ({ ...s, charId })));
}
