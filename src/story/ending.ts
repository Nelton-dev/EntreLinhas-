import { SCENE_BY_ID } from './scenes';
import type { Derived, Trait } from '../types';
import { TOTAL_SECRETS } from '../config';

export const OPENINGS: Record<Trait, string[]> = {
  ternura: [
    'Escreveste devagar, como quem sabe que o que é frágil se trata com as mãos.',
    'Nada do que deixaste na carta pede desculpa por ser terno.',
  ],
  coragem: [
    'Escreveste de frente, sem pedir licença ao medo.',
    'A carta agradece: algumas só se escrevem a quem não desvia o olhar.',
  ],
  misterio: [
    'Escreveste pelo meio das sombras e deixaste mais perguntas do que respostas.',
    'É a melhor forma de ficar na memória de alguém.',
  ],
  humor: [
    'Escreveste a rir, e é por isso que dói menos e fica mais.',
    'Quem ri enquanto escreve deixa a carta mais leve de ler. E mais difícil de largar.',
  ],
};

/** A despedida deixa um sorriso e uma pontinha de curiosidade, conforme o traço dominante. */
export const SMILES: Record<Trait, string[]> = {
  ternura: ['Se ficaste com o coração um bocadinho mais quente, era essa a ideia.', 'Se não ficaste, pergunta a alguém que gostes se não precisa de um abraço. Normalmente precisa.'],
  coragem: ['Se há uma coisa por dizer na tua vida, esta foi a prova de que consegues.', 'Quem diria uma só frase hoje? Já pensaste em quem?'],
  misterio: ['Se ficaste com perguntas, ótimo: era para ficares.', 'Há uma que me interessa mais do que as outras: o que escreverias tu, se ninguém fosse ler?'],
  humor: ['Se estás a sorrir, não faz mal. Eu também estou.', 'E se alguém te perguntar de que te estás a rir, diz que foi de uma carta. Verdade pela metade, que é a melhor.'],
};

export interface LetterLine {
  line: string;
  sub: string;
}

/** Recolhe as linhas da carta pela ordem em que as escolhas foram feitas (máx. 8, bem distribuídas). */
export function collectLetter(d: Derived): LetterLine[] {
  const all: LetterLine[] = [];
  for (const [sceneId, choiceId] of Object.entries(d.choices)) {
    const c = SCENE_BY_ID[sceneId]?.choices.find((x) => x.id === choiceId);
    if (c?.line && c.sub) all.push({ line: c.line, sub: c.sub });
  }
  const MAX = 8;
  if (all.length <= MAX) return all;
  const out: LetterLine[] = [];
  for (let i = 0; i < MAX; i++) out.push(all[Math.round((i * (all.length - 1)) / (MAX - 1))]);
  return out;
}

export type FinalStep =
  | { kind: 'title'; text: string }
  | { kind: 'text'; text: string; tone?: 'soft' | 'strong' }
  | { kind: 'pair'; line: string; sub: string }
  | { kind: 'reveal'; text: string };

export function buildFinalSteps(d: Derived, dominant: Trait): FinalStep[] {
  const name = d.name.trim();
  const letter = collectLetter(d);
  const steps: FinalStep[] = [{ kind: 'title', text: 'A última linha' }];

  OPENINGS[dominant].forEach((text) => steps.push({ kind: 'text', text, tone: 'soft' }));

  steps.push({ kind: 'text', text: 'Esta é a carta que escreveste sem saberes:' });
  letter.forEach((l) => steps.push({ kind: 'pair', ...l }));

  steps.push({ kind: 'text', text: 'Posso dizer-te uma coisa?', tone: 'strong' });
  steps.push({ kind: 'text', text: 'Nunca houve ninguém à espera no fim desta carta.' });
  steps.push({ kind: 'text', text: 'Havia só um espaço em branco.' });
  steps.push({ kind: 'text', text: name ? `Do tamanho exato de ${name}.` : 'Do tamanho exato de ti.', tone: 'strong' });
  steps.push({ kind: 'reveal', text: 'Entre as linhas, estiveste sempre tu.' });

  SMILES[dominant].forEach((text) => steps.push({ kind: 'text', text, tone: 'soft' }));

  if (d.secrets.length >= TOTAL_SECRETS) {
    steps.push({ kind: 'text', text: 'E encontraste todos os segredos. Quase ninguém repara no que está escondido.', tone: 'soft' });
  }
  steps.push({
    kind: 'text',
    text: d.secrets.includes('primeira')
      ? 'Encontraste até a linha escondida. A carta, agora sim, está completa.'
      : 'Ainda há uma linha por ler. Procura-a no mapa.',
    tone: 'strong',
  });
  return steps;
}

export function letterAsText(d: Derived): string {
  const name = d.name.trim();
  const lines = collectLetter(d);
  const head = name ? `Carta de ${name} — EntreLinhas` : 'Carta — EntreLinhas';
  const body = lines.map((l) => `${l.line}\n   (entre as linhas: ${l.sub})`).join('\n\n');
  return `${head}\n\n${body}\n\nEntre as linhas, estiveste sempre tu.\n\nUma experiência criada por Nelton`;
}
