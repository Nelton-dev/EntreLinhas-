import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';

const user = userEvent.setup();

async function clickContinueUntilChoices() {
  for (let i = 0; i < 12; i++) {
    const cont = screen.queryByRole('button', { name: 'Continuar' });
    if (!cont) break;
    await user.click(cont);
  }
}

async function playScene() {
  await clickContinueUntilChoices();
  const q = await waitFor(
    () => {
      const el = document.querySelector('.choices');
      if (!el) throw new Error('sem escolhas: ' + (document.querySelector('.stage')?.textContent ?? '').slice(0, 300));
      return el as HTMLElement;
    },
    { timeout: 4000 },
  );
  const sceneBefore = document.querySelector('.scene__title')?.textContent;
  await user.click(within(q).getAllByRole('button')[0]);
  // espera pela transição: ou chegámos ao hub, ou a cena mudou
  await waitFor(
    () => {
      const hub = document.querySelector('.doors');
      const now = document.querySelector('.scene__title')?.textContent;
      if (!hub && (!now || now === sceneBefore)) throw new Error('a transição ainda não acabou');
    },
    { timeout: 4000 },
  );
}

async function playPath(doorName: RegExp) {
  await user.click(await screen.findByRole('button', { name: doorName }, { timeout: 4000 }));
  for (let i = 0; i < 10; i++) {
    await waitFor(() => expect(document.querySelector('.scene')).not.toBeNull(), { timeout: 4000 });
    await playScene();
    if (document.querySelector('.doors')) return;
  }
  throw new Error('o caminho não terminou no hub');
}

beforeEach(() => sessionStorage.clear());

describe('experiência completa', () => {
  it('mostra a introdução e percorre dois caminhos até ao final', { timeout: 90000 }, async () => {
    render(<App />);
    // nunca fica vazio: ou carregamento ou introdução
    expect(document.body.textContent?.length).toBeGreaterThan(5);

    const start = await screen.findByRole('button', { name: 'Começar' }, { timeout: 6000 });
    await waitFor(() => expect(start).toBeEnabled());
    expect(screen.getByText('Uma experiência criada por Nelton')).toBeInTheDocument();
    await user.click(start);

    await user.type(await screen.findByLabelText('O teu nome'), 'Ana');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await screen.findByText(/Há uma carta que ninguém acabou/, {}, { timeout: 4000 });
    await playScene(); // prólogo
    await screen.findByText(/Ana, há cinco portas/, {}, { timeout: 4000 });

    await playPath(/A Carta/);
    await playPath(/A Janela/);

    const last = await screen.findByRole('button', { name: 'A última linha' }, { timeout: 4000 });
    await user.click(last);

    for (let i = 0; i < 60; i++) {
      if (screen.queryByRole('button', { name: /Copiar a minha carta/ })) break;
      const c = screen.queryByRole('button', { name: 'Continuar' });
      if (c) await user.click(c);
      else await new Promise((r) => setTimeout(r, 60));
    }
    await waitFor(() => expect(screen.getByRole('button', { name: /Copiar a minha carta/ })).toBeEnabled(), { timeout: 6000 });
    // o último passo (a revelação) aparece quando a transição de saída termina
    await waitFor(() => expect(document.body.textContent).toContain('Procura-a no mapa'), { timeout: 5000 });
    // a progressão ficou guardada
    expect(sessionStorage.getItem('entrelinhas:v1')).toContain('"location":"final"');
  });

  it('descobre um segredo escondido (5 toques no título) e o contador sobe', { timeout: 30000 }, async () => {
    render(<App />);
    const title = await screen.findByText('EntreLinhas', {}, { timeout: 6000 });
    for (let i = 0; i < 5; i++) await user.click(title);
    expect(await screen.findByRole('status')).toHaveTextContent(/Segredo encontrado/);
    expect(screen.getByLabelText(/Segredos encontrados: 1 de 10/)).toBeInTheDocument();
  });

  it('retoma a sessão guardada ao recarregar', { timeout: 30000 }, async () => {
    sessionStorage.setItem(
      'entrelinhas:v1',
      JSON.stringify({ location: 'hub', history: ['p1'], name: 'Rui', choices: { p1: 'rir' }, secrets: ['vela'], visited: ['p1'] }),
    );
    render(<App />);
    await screen.findByText(/Rui, há cinco portas/, {}, { timeout: 6000 });
    expect(screen.getByLabelText(/Segredos encontrados: 1 de 10/)).toBeInTheDocument();
  });

  it('dados guardados corrompidos não deixam o ecrã vazio', { timeout: 30000 }, async () => {
    sessionStorage.setItem('entrelinhas:v1', '{isto não é json');
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Começar' }, { timeout: 6000 })).toBeInTheDocument();
  });
});
