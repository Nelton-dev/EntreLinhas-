import { PATH_INFO, SCENE_BY_ID } from './scenes';
import { derive, dominantTrait, donePaths, type State } from '../state/experience';
import { collectLetter } from './ending';
import { SUBMIT_KEY, SUBMIT_URL, TOTAL_SECRETS } from '../config';

export interface SubmitResult {
  ok: boolean;
  error?: string;
}

/** Texto legível (vai no corpo do email) com tudo o que a pessoa preencheu e escolheu. */
export function buildMessage(state: State): string {
  const d = derive(state);
  const lines: string[] = [];
  lines.push(`Nome: ${state.name || '(não indicou)'}`);
  lines.push(`Traço dominante: ${dominantTrait(d)}  |  ternura ${d.traits.ternura}, coragem ${d.traits.coragem}, mistério ${d.traits.misterio}, humor ${d.traits.humor}`);
  lines.push(`Caminhos percorridos até ao fim: ${donePaths(state.choices).map((p) => PATH_INFO[p].title).join(', ') || 'nenhum'}`);
  lines.push(`Segredos encontrados: ${state.secrets.length}/${TOTAL_SECRETS} (${state.secrets.join(', ') || '—'})`);
  lines.push('');
  lines.push('Escolhas:');
  for (const [sceneId, choiceId] of Object.entries(state.choices)) {
    const scene = SCENE_BY_ID[sceneId];
    const choice = scene?.choices.find((c) => c.id === choiceId);
    if (scene && choice) lines.push(`- ${scene.title}: ${choice.label}`);
  }
  lines.push('');
  lines.push('A carta final:');
  for (const l of collectLetter(d)) lines.push(`- ${l.line}  (${l.sub})`);
  return lines.join('\n');
}

export async function sendResponses(state: State, fetchFn: typeof fetch = fetch): Promise<SubmitResult> {
  if (!SUBMIT_URL) return { ok: false, error: 'sem destino configurado' };
  const d = derive(state);
  const payload: Record<string, unknown> = {
    ...(SUBMIT_KEY ? { access_key: SUBMIT_KEY } : {}),
    subject: `EntreLinhas — ${state.name || 'alguém'} chegou ao fim`,
    from_name: 'EntreLinhas',
    name: state.name || 'anónimo',
    message: buildMessage(state),
    tracos: d.traits,
    segredos: state.secrets,
    escolhas: state.choices,
    enviado_em: new Date().toISOString(),
  };
  try {
    const res = await fetchFn(SUBMIT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false, error: `o servidor respondeu ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'falha de rede' };
  }
}
