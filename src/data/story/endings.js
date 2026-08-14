// Desfechos possíveis. `pick()` escolhe qual final rodar com base no estado.

export const ENDINGS = {
  dawn: {
    id: 'dawn',
    title: 'Aurora sobre a Folha',
    kicker: 'Final Verdadeiro',
    bg: 'gate',
    music: 'hope',
    summary: 'Você quebrou o selo sem quebrar ninguém. Kagemasa foi enfrentado com a vila inteira às suas costas.',
    body: `O sol nasce por trás do portão e ninguém precisa dizer nada.

Kagemasa não foi apagado — foi alcançado. Você o encontrou dentro do próprio selo, no lugar onde ele ainda era um garoto esperando alguém voltar para buscá-lo. E dessa vez alguém voltou.

A vila leva semanas para consertar os telhados. Leva mais tempo para consertar a confiança. Mas Iruka volta a dar aula, o Hokage volta a reclamar do papelório, e o Time 7 volta a brigar por besteira no caminho para a missão seguinte.

Naruto diz que um dia vai ser Hokage. Ninguém ri.

Sakura anota tudo num caderno, porque alguém vai precisar contar essa história direito.

Sasuke não diz nada — mas fica.

E você, na frente deles, entende finalmente o que o selo na sua palma sempre significou: não uma arma herdada, mas uma corrente. Uma que liga, não uma que prende.`,
  },

  bonds: {
    id: 'bonds',
    title: 'O Elo Inquebrável',
    kicker: 'Final de Companheirismo',
    bg: 'village',
    music: 'hope',
    summary: 'A ameaça foi contida com o time inteiro de pé. Nem todos os segredos foram desvendados — mas ninguém ficou para trás.',
    body: `Kagemasa cai. O selo se fecha. E, pela primeira vez em semanas, o silêncio na vila é o tipo bom.

Vocês não descobriram tudo. Há perguntas sobre o selo na sua palma que nem o Hokage quis responder na frente dos outros, e páginas do relatório que foram arquivadas sem que você lesse.

Mas quando o time atravessa o portão de volta, todo mundo atravessa junto. Mancando, sujo, discutindo sobre quem levou mais pancada — e junto.

Kakashi olha para as quatro sombras compridas no chão e guarda o livro sem ler uma linha.

— Missão cumprida — ele diz. — Vão comer alguma coisa. Eu pago.

Naruto grita de alegria. Sakura desconfia. Sasuke já está andando na frente.

Você fica um segundo a mais no portão, olhando o selo na palma. Ele está quente. Mas hoje, só quente.`,
  },

  lone: {
    id: 'lone',
    title: 'O Punho Solitário',
    kicker: 'Final Solitário',
    bg: 'memorial',
    music: 'sad',
    summary: 'Você venceu sozinho. Funcionou — e é exatamente esse o problema.',
    body: `Você venceu.

Não há outra palavra honesta para isso. Kagemasa está no chão, o selo está fechado, a vila está de pé.

Mas quando você se vira, o campo atrás está vazio. Você mandou que ficassem para trás em cada bifurcação, e eles ficaram. Porque você pediu. Porque você sempre pareceu não precisar.

O Hokage escreve seu nome no relatório com a caneta boa. Chama de eficiência.

Kakashi não chama de nada. Ele só olha para você um instante a mais do que o normal, e você reconhece o olhar — é o mesmo que ele dirige à pedra memorial, todas as manhãs, para nomes que não podem mais responder.

Naruto tenta te chamar para comer lámen. Você diz que está cansado. É verdade.

O selo na sua palma esfriou completamente. Não queima mais.

Você não sabe dizer se isso é cura ou perda.`,
  },

  shadow: {
    id: 'shadow',
    title: 'Herdeiro das Sombras',
    kicker: 'Final Sombrio',
    bg: 'eclipse',
    music: 'dark',
    summary: 'Você usou o poder do selo até o fim. Kagemasa perdeu — e ainda assim conseguiu o que queria.',
    body: `O corpo de Kagemasa esfria e o selo na sua palma esquenta na mesma proporção, como se estivesse fazendo as contas.

— Você entendeu — ele diz, e nem parece derrotado. — Um selo não escolhe. Um selo aceita quem chega mais perto.

A vila comemora. Eles não sentiram o que passou de um corpo para o outro naquele instante. Só você sentiu.

Nos meses seguintes, as missões ficam mais fáceis. Estranhamente fáceis. Adversários que deveriam durar minutos duram segundos. Kakashi começa a marcar treinos que você não precisa fazer, só para ficar por perto e olhar.

Sakura pergunta uma vez, à meia-voz, se você está dormindo bem.

Você diz que sim.

À noite, sobre os telhados, a sua sombra às vezes se move um segundo antes de você. E você, cada vez mais, deixa que ela conduza.

Ninguém percebe. Ainda.`,
  },

  fallen: {
    id: 'fallen',
    title: 'A Vila que Não Acordou',
    kicker: 'Final Amargo',
    bg: 'ruinsNight',
    music: 'sad',
    summary: 'O selo foi aberto antes de vocês chegarem. O que sobrou foi o trabalho de recolher os cacos.',
    body: `Vocês chegaram tarde.

Não por muito. Foi questão de horas — talvez de uma decisão a menos, tomada num corredor qualquer semanas atrás. Mas tarde é tarde.

O selo abriu. O que saiu dele atravessou a muralha norte antes do amanhecer e a Folha passou três dias apagando incêndios com o que restou dos times de resgate.

A vila sobrevive. Vilas sempre sobrevivem — é o que os livros dizem, escritos por quem sobreviveu.

Você anda entre as barracas de emergência com uma lista de nomes na mão, e o mais difícil não é ler os que estão riscados. É reconhecer, em cada rosto que passa, a pergunta que ninguém faz em voz alta:

*E se vocês tivessem chegado antes?*

Kakashi para ao seu lado no fim da tarde, olhando para o norte.

— A gente aprende com isso — ele diz. — É a única coisa que dá para fazer com uma derrota. Aprender, e voltar amanhã.

Ele não diz "não foi culpa sua". Você repara nisso.

Você agradece por ele não ter mentido.`,
  },
};

/**
 * Decide qual final rodar.
 * @param {object} s estado do jogo
 * @param {object} ctx { bondAvg, karma, flags }
 */
export function pickEnding(s, { bondAvg = 0, karma = 0 } = {}) {
  if (s.flags.villageFell) return 'fallen';
  if (karma <= -.45 || s.flags.embracedSeal) return 'shadow';
  if (s.flags.trueSealPath && bondAvg >= 55 && karma >= .25) return 'dawn';
  if (bondAvg >= 45) return 'bonds';
  return 'lone';
}
