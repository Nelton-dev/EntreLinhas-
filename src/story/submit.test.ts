import { describe, expect, it, vi } from 'vitest';
import { initialState, reducer } from '../state/experience';
import { buildMessage } from './submit';

describe('envio das respostas', () => {
  const played = () => {
    let s = reducer(initialState, { type: 'START' });
    s = reducer(s, { type: 'SET_NAME', name: 'Ana', share: true });
    s = reducer(s, { type: 'CHOOSE', sceneId: 'p1', choiceId: 'rir' });
    s = reducer(s, { type: 'GO', to: 'c1' });
    s = reducer(s, { type: 'CHOOSE', sceneId: 'c1', choiceId: 'cheirar' });
    s = reducer(s, { type: 'SECRET', id: 'estrela' });
    return s;
  };

  it('guarda o consentimento e a mensagem inclui nome, escolhas e segredos', () => {
    const s = played();
    expect(s.share).toBe(true);
    const msg = buildMessage(s);
    expect(msg).toContain('Nome: Ana');
    expect(msg).toContain('A gaveta: Cheiro o papel');
    expect(msg).toContain('estrela');
  });

  it('sem consentimento o estado fica share=false', () => {
    const s = reducer(initialState, { type: 'SET_NAME', name: 'Rui' });
    expect(s.share).toBe(false);
  });

  it('SENT marca como enviado e RESET limpa', () => {
    let s = reducer(played(), { type: 'SENT' });
    expect(s.sent).toBe(true);
    s = reducer(s, { type: 'RESET' });
    expect(s.sent).toBe(false);
    expect(s.share).toBe(false);
  });

  it('sendResponses faz POST JSON ao destino e trata falhas', async () => {
    vi.stubEnv('VITE_SUBMIT_URL', 'https://exemplo.test/submit');
    vi.stubEnv('VITE_SUBMIT_KEY', 'k123');
    vi.resetModules();
    const { sendResponses } = await import('./submit');
    const ok = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    expect((await sendResponses(played(), ok as never)).ok).toBe(true);
    const [url, init] = ok.mock.calls[0];
    expect(url).toBe('https://exemplo.test/submit');
    const body = JSON.parse(init.body);
    expect(body.access_key).toBe('k123');
    expect(body.name).toBe('Ana');
    expect(body.message).toContain('Cheiro o papel');

    const bad = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    expect((await sendResponses(played(), bad as never)).ok).toBe(false);
    const down = vi.fn().mockRejectedValue(new Error('offline'));
    expect(await sendResponses(played(), down as never)).toEqual({ ok: false, error: 'offline' });
    vi.unstubAllEnvs();
  });
});
