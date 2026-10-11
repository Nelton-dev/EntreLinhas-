import { PATH_INFO, SCENE_BY_ID } from '../story/scenes';
import type { Derived, PathId, SecretId, Trait } from '../types';
import { STORAGE_KEY } from '../config';

export interface State {
  /** 'intro' | 'name' | 'hub' | 'final' | id de cena */
  location: string;
  history: string[];
  name: string;
  choices: Record<string, string>;
  secrets: SecretId[];
  visited: string[];
  /** A pessoa aceitou partilhar as respostas com o criador. */
  share: boolean;
  /** As respostas já foram enviadas com sucesso. */
  sent: boolean;
}

export type Action =
  | { type: 'START' }
  | { type: 'SET_NAME'; name: string; share?: boolean }
  | { type: 'SENT' }
  | { type: 'CHOOSE'; sceneId: string; choiceId: string }
  | { type: 'GO'; to: string }
  | { type: 'BACK' }
  | { type: 'SECRET'; id: SecretId }
  | { type: 'RESET_PATH'; path: Exclude<PathId, 'prologo'> }
  | { type: 'RESET' };

export const initialState: State = {
  location: 'intro',
  history: [],
  name: '',
  choices: {},
  secrets: [],
  visited: [],
  share: false,
  sent: false,
};

const TRAITS: Trait[] = ['ternura', 'coragem', 'misterio', 'humor'];

export function derive(s: State): Derived {
  const traits: Record<Trait, number> = { ternura: 0, coragem: 0, misterio: 0, humor: 0 };
  const flags: string[] = [];
  for (const [sceneId, choiceId] of Object.entries(s.choices)) {
    const choice = SCENE_BY_ID[sceneId]?.choices.find((c) => c.id === choiceId);
    if (!choice) continue;
    for (const t of TRAITS) traits[t] += choice.traits?.[t] ?? 0;
    if (choice.flag) flags.push(choice.flag);
  }
  return { name: s.name, traits, choices: s.choices, flags, secrets: s.secrets };
}

export function dominantTrait(d: Derived): Trait {
  return TRAITS.reduce((best, t) => (d.traits[t] > d.traits[best] ? t : best), TRAITS[0]);
}

export function isPathDone(path: Exclude<PathId, 'prologo'>, choices: Record<string, string>) {
  return PATH_INFO[path].sceneIds.some((id) => SCENE_BY_ID[id]?.endsPath && choices[id]);
}

export function donePaths(choices: Record<string, string>) {
  return (Object.keys(PATH_INFO) as Array<Exclude<PathId, 'prologo'>>).filter((p) =>
    isPathDone(p, choices),
  );
}

export function pathProgress(path: Exclude<PathId, 'prologo'>, visited: string[]) {
  const ids = PATH_INFO[path].sceneIds;
  return visited.filter((v) => ids.includes(v)).length;
}

export function isValidLocation(loc: unknown): loc is string {
  return (
    typeof loc === 'string' &&
    (['intro', 'name', 'hub', 'final'].includes(loc) || Boolean(SCENE_BY_ID[loc]))
  );
}

function withVisit(visited: string[], loc: string) {
  return SCENE_BY_ID[loc] && !visited.includes(loc) ? [...visited, loc] : visited;
}

/**
 * Depois de mudar uma escolha, remove as escolhas (e cenas visitadas) de ramos que deixaram de
 * fazer parte do percurso atual, e as opções cujo requisito já não se cumpre.
 */
export function pruneAbandoned(s: State): State {
  let choices = { ...s.choices };
  let onPath = new Set<string>();
  for (let pass = 0; pass < 5; pass++) {
    const keep = new Set<string>();
    onPath = new Set<string>(['p1']);
    if (choices['p1']) keep.add('p1');
    for (const info of Object.values(PATH_INFO)) {
      let id: string | undefined = info.first;
      const seen = new Set<string>();
      while (id && !seen.has(id)) {
        seen.add(id);
        onPath.add(id);
        const choiceId: string | undefined = choices[id];
        if (!choiceId) break;
        keep.add(id);
        const to: string | undefined = SCENE_BY_ID[id]?.choices.find((c) => c.id === choiceId)?.to;
        id = to && SCENE_BY_ID[to] ? to : undefined;
      }
    }
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(choices)) {
      if (!keep.has(k)) continue;
      const c = SCENE_BY_ID[k]?.choices.find((x) => x.id === v);
      // o requisito avalia-se sem contar com a própria escolha
      const others = Object.fromEntries(Object.entries(choices).filter(([kk]) => kk !== k));
      if (c?.requires && !c.requires(derive({ ...s, choices: others }))) continue;
      next[k] = v;
    }
    const stable = Object.keys(next).length === Object.keys(choices).length;
    choices = next;
    if (stable) break;
  }
  const visited = s.visited.filter((v) => onPath.has(v) || s.location === v);
  return { ...s, choices, visited };
}

function push(s: State, to: string): State {
  if (to === s.location) return s;
  return {
    ...s,
    history: [...s.history, s.location].slice(-60),
    location: to,
    visited: withVisit(s.visited, to),
  };
}

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'START':
      return push(s, 'name');
    case 'SET_NAME':
      return { ...push(s, s.visited.includes('p1') ? 'hub' : 'p1'), name: a.name.trim().slice(0, 24), share: Boolean(a.share) };
    case 'SENT':
      return { ...s, sent: true };
    case 'CHOOSE': {
      const scene = SCENE_BY_ID[a.sceneId];
      const choice = scene?.choices.find((c) => c.id === a.choiceId);
      if (!scene || !choice) return s;
      const changed = Boolean(s.choices[a.sceneId]) && s.choices[a.sceneId] !== a.choiceId;
      let next: State = { ...s, choices: { ...s.choices, [a.sceneId]: a.choiceId } };
      if (changed) next = pruneAbandoned(next);
      return push(next, choice.to);
    }
    case 'GO':
      return isValidLocation(a.to) ? push(s, a.to) : s;
    case 'BACK': {
      const prev = s.history[s.history.length - 1];
      if (!prev) return s;
      return { ...s, location: prev, history: s.history.slice(0, -1) };
    }
    case 'SECRET':
      return s.secrets.includes(a.id) ? s : { ...s, secrets: [...s.secrets, a.id] };
    case 'RESET_PATH': {
      const ids = PATH_INFO[a.path].sceneIds;
      const choices = Object.fromEntries(Object.entries(s.choices).filter(([k]) => !ids.includes(k)));
      return { ...s, choices, visited: s.visited.filter((v) => !ids.includes(v)) };
    }
    case 'RESET':
      return initialState;
    default:
      return s;
  }
}

/* ── Persistência (sessionStorage; falha em silêncio) ── */
export function loadState(): State {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const p = JSON.parse(raw) as Partial<State>;
    if (!isValidLocation(p.location)) return initialState;
    return {
      location: p.location,
      history: Array.isArray(p.history) ? p.history.filter(isValidLocation) : [],
      name: typeof p.name === 'string' ? p.name.slice(0, 24) : '',
      choices:
        p.choices && typeof p.choices === 'object'
          ? Object.fromEntries(
              Object.entries(p.choices).filter(
                ([k, v]) => SCENE_BY_ID[k]?.choices.some((c) => c.id === v),
              ),
            )
          : {},
      secrets: Array.isArray(p.secrets) ? (p.secrets as SecretId[]) : [],
      visited: Array.isArray(p.visited) ? p.visited.filter((v) => Boolean(SCENE_BY_ID[v])) : [],
      share: p.share === true,
      sent: p.sent === true,
    };
  } catch {
    return initialState;
  }
}

export function saveState(s: State) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* modo privado / armazenamento cheio: a experiência continua em memória */
  }
}

export function clearSavedState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignorar */
  }
}
