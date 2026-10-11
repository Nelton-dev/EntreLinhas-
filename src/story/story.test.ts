import { describe, expect, it } from 'vitest';
import { PATH_INFO, SCENES, SCENE_BY_ID } from './scenes';
import { initialState, reducer, derive, donePaths } from '../state/experience';
import { buildFinalSteps, collectLetter } from './ending';

describe('integridade da história', () => {
  it('todas as escolhas apontam para cenas válidas', () => {
    for (const s of SCENES) {
      expect(s.choices.length).toBeGreaterThan(0);
      for (const c of s.choices) {
        expect(c.to === 'hub' || c.to === 'final' || Boolean(SCENE_BY_ID[c.to]), `${s.id}->${c.to}`).toBe(true);
      }
    }
  });

  it('cada cena de cada caminho é alcançável a partir da primeira e todos os caminhos chegam ao hub', () => {
    for (const [path, info] of Object.entries(PATH_INFO)) {
      const seen = new Set<string>();
      const stack = [info.first];
      let reachesHub = false;
      while (stack.length) {
        const id = stack.pop()!;
        if (seen.has(id)) continue;
        seen.add(id);
        for (const c of SCENE_BY_ID[id].choices) {
          if (c.to === 'hub') reachesHub = true;
          else if (SCENE_BY_ID[c.to]) stack.push(c.to);
        }
      }
      expect([...seen].sort(), path).toEqual([...info.sceneIds].sort());
      expect(reachesHub).toBe(true);
    }
  });

  it('opções com requisitos têm sempre alternativas livres', () => {
    for (const s of SCENES) expect(s.choices.some((c) => !c.requires)).toBe(true);
  });

  it('percorre os 3 caminhos, guarda o estado e constrói o final com nome', () => {
    let s = reducer(initialState, { type: 'START' });
    s = reducer(s, { type: 'SET_NAME', name: '  Ana ' });
    expect(s.location).toBe('p1');
    s = reducer(s, { type: 'CHOOSE', sceneId: 'p1', choiceId: 'rir' });
    expect(s.location).toBe('hub');
    for (const [, info] of Object.entries(PATH_INFO)) {
      let loc = info.first;
      while (loc !== 'hub') {
        const sc = SCENE_BY_ID[loc];
        const c = sc.choices.find((x) => !x.requires)!;
        s = reducer(s, { type: 'GO', to: loc });
        s = reducer(s, { type: 'CHOOSE', sceneId: sc.id, choiceId: c.id });
        loc = s.location;
      }
    }
    expect(donePaths(s.choices)).toHaveLength(5);
    const d = derive(s);
    expect(d.name).toBe('Ana');
    expect(d.traits.humor).toBeGreaterThan(0);
    const letter = collectLetter(d);
    expect(letter.length).toBeGreaterThan(3);
    expect(letter.length).toBeLessThanOrEqual(8);
    const steps = buildFinalSteps(d, 'humor');
    expect(steps.some((x) => x.kind === 'text' && x.text.includes('Ana'))).toBe(true);
    expect(steps.at(-1)).toBeDefined();
  });

  it('regressar e mudar uma escolha atualiza as consequências', () => {
    let s = reducer(initialState, { type: 'GO', to: 'c1' });
    s = reducer(s, { type: 'CHOOSE', sceneId: 'c1', choiceId: 'guardar' });
    expect(derive(s).flags).toContain('guardou');
    s = reducer(s, { type: 'GO', to: 'c1' });
    s = reducer(s, { type: 'CHOOSE', sceneId: 'c1', choiceId: 'cheirar' });
    expect(derive(s).flags).not.toContain('guardou');
    expect(s.visited).toContain('c2a'); // o novo ramo fica no mapa
  });
});

describe('cobertura da história', () => {
  it('há 5 caminhos e cada escolha com "line" tem "sub"', () => {
    expect(Object.keys(PATH_INFO)).toHaveLength(5);
    for (const s of SCENES) for (const c of s.choices) expect(Boolean(c.line), `${s.id}/${c.id}`).toBe(Boolean(c.sub));
  });

  it('o final termina com a pista do mapa e inclui a pista certa conforme o segredo', () => {
    const base = { name: '', traits: { ternura: 1, coragem: 0, misterio: 0, humor: 0 }, choices: {}, flags: [], secrets: [] as never[] };
    const sem = buildFinalSteps(base, 'ternura');
    expect(JSON.stringify(sem.at(-1))).toContain('Procura-a no mapa');
    const com = buildFinalSteps({ ...base, secrets: ['primeira'] }, 'ternura');
    expect(JSON.stringify(com.at(-1))).toContain('está completa');
  });
});

describe('mudar uma escolha invalida o ramo abandonado', () => {
  const play = (s: ReturnType<typeof reducer>, scene: string, choice: string) => {
    s = reducer(s, { type: 'GO', to: scene });
    return reducer(s, { type: 'CHOOSE', sceneId: scene, choiceId: choice });
  };

  it('remove escolhas, marcas e cenas do ramo antigo, mas mantém outros caminhos', () => {
    let s = play(initialState, 'j1', 'acender'); // outro caminho: deve ficar intacto
    s = play(s, 'c1', 'cheirar'); // -> c2a
    s = play(s, 'c2a', 'pessoa'); // flag "pessoa"
    expect(derive(s).flags).toContain('pessoa');
    expect(s.visited).toContain('c2a');

    s = play(s, 'c1', 'ler-tudo'); // muda de ramo -> c2b
    expect(s.choices['c2a']).toBeUndefined();
    expect(derive(s).flags).not.toContain('pessoa');
    expect(s.visited).not.toContain('c2a');
    expect(s.choices['j1']).toBe('acender');
    expect(derive(s).traits.ternura).toBe(0);
    expect(derive(s).traits.coragem).toBe(2); // acender (1) + ler-tudo (1)
  });

  it('a carta final não contém linhas de escolhas abandonadas', () => {
    let s = play(initialState, 'c1', 'cheirar');
    s = play(s, 'c2a', 'pao');
    s = play(s, 'c3', 'nome');
    s = play(s, 'c1', 'guardar'); // c1 -> c2b: o resto antigo cai
    const lines = collectLetter(derive(s)).map((l) => l.line).join(' ');
    expect(lines).not.toContain('Cheiraste');
    expect(lines).toContain('Guardaste a carta');
  });

  it('opções com requisito deixam de contar se o requisito deixa de se cumprir', () => {
    let s = play(initialState, 'j1', 'acender'); // coragem 1
    s = play(s, 'j2a', 'madrugada');
    s = play(s, 'j3', 'descer'); // coragem +2 = 3
    s = play(s, 'j4a', 'abrir'); // +1 = 4
    s = play(s, 'j5', 'arriscar'); // requer coragem >= 3 (sem contar consigo)
    expect(s.choices['j5']).toBe('arriscar');
    s = play(s, 'j1', 'careta'); // mesmo ramo (j2a), mas a coragem desce
    s = play(s, 'j3', 'janela-aberta'); // ramo muda para j4b -> j4a e j5 caem
    expect(s.choices['j4a']).toBeUndefined();
    expect(s.choices['j5']).toBeUndefined();
  });
});
