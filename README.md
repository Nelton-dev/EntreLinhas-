# EntreLinhas

Experiência interativa romântica, misteriosa e emocional. *Uma experiência criada por Nelton.*

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # produção (tsc + vite)
npm test         # integridade da história + percurso completo na interface
```

## Música
Coloca o teu ficheiro em `public/audio/musica.mp3` (ou muda `AUDIO_SRC` em `src/config.ts`).
Sem ficheiro, os botões de música ficam desativados e mostram "sem música".

## Estrutura
- `src/story/scenes.ts` — todas as cenas, escolhas, traços e consequências (edita aqui o texto).
- `src/story/ending.ts` — final: aberturas por traço dominante, carta, surpresa.
- `src/state/` — estado (reducer), persistência em `sessionStorage`, segredos.
- `src/components/reactbits/` — componentes reais do React Bits (ver `ORIGEM.md`).
- `src/components/` — ecrãs e peças reutilizáveis.

## Como as escolhas contam
Cada escolha soma traços (ternura, coragem, mistério, humor), pode ligar marcas (flags) que mudam
texto em cenas futuras, e pode desbloquear opções. O final usa o traço dominante, as linhas das
escolhas (a "carta"), o nome e o número de segredos encontrados (10 no total).

## Receber as respostas de quem experimenta
Quando a pessoa chega à última linha, a app envia (uma vez) o nome, as escolhas, o traço dominante,
os segredos e a carta final — **só se ela aceitou** na caixa do ecrã do nome.

1. Cria uma chave gratuita em https://web3forms.com (com o teu email) ou um formulário em https://formspree.io.
2. Copia `.env.example` para `.env` e preenche `VITE_SUBMIT_URL` (e `VITE_SUBMIT_KEY` no Web3Forms).
3. `npm run dev` / `npm run build`. Na Vercel, define as mesmas variáveis em Settings → Environment Variables.

Sem `VITE_SUBMIT_URL`, nada é enviado e o aviso de partilha nem aparece.
Nota: as variáveis `VITE_*` ficam visíveis no código do site; é normal nestes serviços (a key só serve para enviar).
