// Conjunto canônico de expressões faciais.
//
// O roteiro usa alguns apelidos ("smirk" no lugar de "smug", "calm" no lugar
// de "closed"). Sem normalizar isso, o jogo pediria arquivos que o gerador
// nunca criou e todo diálogo com esses apelidos cairia no desenho procedural.
// Este módulo é a única fonte da verdade, importada tanto pelo gerador de
// assets quanto pelo carregador em tempo de execução.

/** Expressões que viram arquivo em assets/. */
export const EMOTIONS = [
  'neutral', 'happy', 'laugh', 'angry', 'determined',
  'sad', 'shock', 'scared', 'smug', 'closed',
];

/** Apelidos aceitos no roteiro → expressão canônica. */
export const EMOTION_ALIASES = {
  smirk: 'smug',
  calm: 'closed',
};

/** Normaliza qualquer nome de expressão para um que exista em disco. */
export function canonicalEmotion(name) {
  if (!name) return 'neutral';
  if (EMOTIONS.includes(name)) return name;
  return EMOTION_ALIASES[name] || 'neutral';
}
