export type Trait = 'ternura' | 'coragem' | 'misterio' | 'humor';
export type PathId = 'prologo' | 'carta' | 'janela' | 'silencio' | 'jardim' | 'espelho';
export type Mood = 'intro' | 'hub' | 'carta' | 'janela' | 'silencio' | 'jardim' | 'espelho' | 'final';

export type SecretId =
  | 'estrela'
  | 'titulo'
  | 'vela'
  | 'lua'
  | 'eco'
  | 'assinatura'
  | 'fechadura'
  | 'flor'
  | 'reflexo'
  | 'primeira';

/** Estado derivado usado para condicionar texto e escolhas. */
export interface Derived {
  name: string;
  traits: Record<Trait, number>;
  choices: Record<string, string>; // sceneId -> choiceId
  flags: string[];
  secrets: SecretId[];
}

export interface Choice {
  id: string;
  label: string;
  to: string; // id de cena, 'hub' ou 'final'
  traits?: Partial<Record<Trait, number>>;
  flag?: string;
  /** Linha que passa a fazer parte da carta final. */
  line?: string;
  /** A "entrelinha" que se esconde por baixo da linha. */
  sub?: string;
  requires?: (d: Derived) => boolean;
  /** Texto curto mostrado quando a opção está bloqueada. */
  lockedHint?: string;
}

export interface Beat {
  text: string;
  when?: (d: Derived) => boolean;
}

export interface Scene {
  id: string;
  path: PathId;
  title: string;
  beats: Beat[];
  question: string;
  choices: Choice[];
  secret?: SecretId;
  /** Marca a última cena de um percurso. */
  endsPath?: boolean;
}
