import type { Beat, Scene, PathId } from '../types';

const b = (text: string, when?: Beat['when']): Beat => ({ text, when });

export type DoorPath = Exclude<PathId, 'prologo'>;

export const PATH_INFO: Record<DoorPath, { title: string; subtitle: string; first: string; sceneIds: string[] }> = {
  carta: { title: 'A Carta', subtitle: 'O que ficou guardado', first: 'c1', sceneIds: ['c1', 'c2a', 'c2b', 'c3', 'c4a', 'c4b', 'c5'] },
  janela: { title: 'A Janela', subtitle: 'O que acontece à noite', first: 'j1', sceneIds: ['j1', 'j2a', 'j2b', 'j3', 'j4a', 'j4b', 'j5'] },
  silencio: { title: 'O Silêncio', subtitle: 'O que não se diz', first: 'k1', sceneIds: ['k1', 'k2a', 'k2b', 'k3', 'k4a', 'k4b', 'k5'] },
  jardim: { title: 'O Jardim', subtitle: 'O que cresce devagar', first: 'g1', sceneIds: ['g1', 'g2a', 'g2b', 'g3', 'g4a', 'g4b', 'g5'] },
  espelho: { title: 'O Espelho', subtitle: 'Como alguém te vê', first: 'e1', sceneIds: ['e1', 'e2a', 'e2b', 'e3', 'e4a', 'e4b', 'e5'] },
};

export const SCENES: Scene[] = [
  /* ───────────── PRÓLOGO ───────────── */
  {
    id: 'p1',
    path: 'prologo',
    title: 'Antes',
    beats: [
      b('Há uma carta que ninguém acabou de escrever.'),
      b('Falta-lhe o essencial. De propósito.'),
      b('Dizem que o amor mora nas entrelinhas. Vamos ver se é verdade.'),
    ],
    question: 'Por onde queres começar?',
    choices: [
      { id: 'ler', label: 'Pelo que está escrito', to: 'hub', traits: { ternura: 1 }, line: 'Começaste pelo que estava à vista, com a confiança de quem sabe ler devagar.', sub: 'Obrigado por confiares.' },
      { id: 'nao-ler', label: 'Pelo que falta', to: 'hub', traits: { misterio: 1 }, line: 'Começaste pelo que faltava. Há quem nasça a ler nas sombras.', sub: 'Já sabias onde procurar.' },
      { id: 'rir', label: 'Por um sorriso', to: 'hub', traits: { humor: 1 }, line: 'Começaste por um sorriso, a melhor maneira de entrar num sítio novo.', sub: 'Fica-te bem.' },
    ],
  },

  /* ───────────── A CARTA ───────────── */
  {
    id: 'c1',
    path: 'carta',
    title: 'A gaveta',
    beats: [
      b('Na gaveta há uma carta sem destinatário.'),
      b('O papel está macio, de tanto ser dobrado por quem nunca teve coragem de a enviar.'),
      b('A primeira linha diz: «Se estás a ler isto, chegaste.»'),
    ],
    question: 'O que fazes primeiro?',
    choices: [
      { id: 'cheirar', label: 'Cheiro o papel', to: 'c2a', traits: { ternura: 1 }, line: 'Cheiraste o papel antes de o ler. Há quem leia com o corpo inteiro.', sub: 'Eu também leio assim.' },
      { id: 'ler-tudo', label: 'Leio até ao fim, sem parar', to: 'c2b', traits: { coragem: 1 }, line: 'Leste de uma vez, sem medo do fim.', sub: 'Eu tive mais medo do que tu.' },
      { id: 'guardar', label: 'Guardo-a para depois', to: 'c2b', traits: { misterio: 1 }, flag: 'guardou', line: 'Guardaste a carta para depois, como quem sabe que há horas certas.', sub: 'Esta é a hora.' },
    ],
  },
  {
    id: 'c2a',
    path: 'carta',
    title: 'O cheiro',
    beats: [
      b('Cheira a chuva, a madeira velha e a alguém que ficou à porta um instante a mais.'),
      b('Há casas onde já não vives, mas que ainda te sabem o nome.'),
    ],
    question: 'Que cheiro te leva de volta a casa?',
    choices: [
      { id: 'pao', label: 'Pão quente', to: 'c3', traits: { humor: 1, ternura: 1 } },
      { id: 'chuva', label: 'Chuva na terra', to: 'c3', traits: { misterio: 1 } },
      { id: 'pessoa', label: 'O de uma pessoa', to: 'c3', traits: { ternura: 2 }, flag: 'pessoa' },
    ],
  },
  {
    id: 'c2b',
    path: 'carta',
    title: 'A segunda página',
    beats: [
      b('A letra muda. Fica mais apressada, como um coração a subir escadas.'),
      b('«Tive medo de te escrever. Escrevi na mesma.»'),
      b('Foi bom esperares. A carta também esperou.', (d) => d.flags.includes('guardou')),
    ],
    question: 'Já escreveste algo que nunca enviaste?',
    choices: [
      { id: 'guardo', label: 'Sim, e ainda guardo', to: 'c3', traits: { ternura: 1 }, line: 'Guardas palavras que nunca enviaste.', sub: 'Algumas ainda esperam por ti.' },
      { id: 'ainda-bem', label: 'Sim, e ainda bem que não enviei', to: 'c3', traits: { humor: 2 }, line: 'Há mensagens que só prestam por não terem sido enviadas.', sub: 'Concordo, e rio-me.' },
      { id: 'nunca', label: 'Nunca. Digo tudo na hora', to: 'c3', traits: { coragem: 2 }, line: 'Dizes as coisas na hora, mesmo quando tremem.', sub: 'Isso é raro e bonito.' },
    ],
  },
  {
    id: 'c3',
    path: 'carta',
    title: 'A mancha',
    secret: 'vela',
    beats: [
      b('Há uma mancha de tinta sobre uma palavra.'),
      b('Alguma coisa foi sentida antes de ser riscada.'),
      b('Com a luz certa, talvez se leia.'),
    ],
    question: 'O que vês por baixo da mancha?',
    choices: [
      { id: 'nome', label: 'Um nome', to: 'c4a', traits: { misterio: 1 } },
      { id: 'desculpa', label: 'Um pedido de desculpa', to: 'c4b', traits: { ternura: 1 } },
      { id: 'piada', label: 'Uma piada escondida', to: 'c4b', traits: { humor: 1 } },
    ],
  },
  {
    id: 'c4a',
    path: 'carta',
    title: 'O nome',
    beats: [
      b('O nome não está completo. Só a primeira letra resiste.'),
      b('Quem o escreveu hesitou entre dizê-lo e deixá-lo respirar.'),
    ],
    question: 'Preferes saber o nome ou continuar a imaginá-lo?',
    choices: [
      { id: 'saber', label: 'Saber', to: 'c5', traits: { coragem: 1 }, line: 'Preferiste saber a imaginar.', sub: 'Mas às vezes o nome é o menos importante.' },
      { id: 'imaginar', label: 'Imaginar', to: 'c5', traits: { misterio: 1 }, line: 'Preferiste imaginar a saber.', sub: 'Há perguntas que valem mais do que as respostas.' },
    ],
  },
  {
    id: 'c4b',
    path: 'carta',
    title: 'O que se perdoa',
    beats: [
      b('Por baixo da tinta, uma palavra pequena: «desculpa».'),
      b('Ou talvez «desculpa o atraso». Ou «desculpa o riso». A mancha não ajuda, e agrada-me assim.'),
    ],
    question: 'Perdoar é fácil ou difícil para ti?',
    choices: [
      { id: 'facil', label: 'Fácil. Dura menos do que a raiva', to: 'c5', traits: { ternura: 1, humor: 1 }, line: 'Perdoas depressa, porque a raiva cansa.', sub: 'E nunca é por fraqueza.' },
      { id: 'dificil', label: 'Difícil, mas faço-o', to: 'c5', traits: { coragem: 1 }, line: 'Perdoar custa-te, e fazes na mesma.', sub: 'É aí que mora a coragem.' },
    ],
  },
  {
    id: 'c5',
    path: 'carta',
    title: 'O fecho',
    endsPath: true,
    beats: [
      b('A carta acaba sem despedida.'),
      b('Só um espaço em branco, do tamanho exato de uma assinatura.'),
      b('Guardaste-a para depois. Pois bem: o depois chegou.', (d) => d.flags.includes('guardou')),
    ],
    question: 'Como terminas a carta?',
    choices: [
      { id: 'nome', label: 'Com o meu nome', to: 'hub', traits: { coragem: 1 }, line: 'Assinaste com o teu nome.', sub: 'É assim que se começa a pertencer.' },
      { id: 'sem-assinar', label: 'Sem assinar', to: 'hub', traits: { misterio: 1 }, line: 'Deixaste a carta sem assinatura.', sub: 'Ficou mais tua.' },
      { id: 'pergunta', label: 'Com uma pergunta', to: 'hub', traits: { humor: 1, ternura: 1 }, line: 'Terminaste com uma pergunta, para a carta voltar.', sub: 'Ela volta. Sempre volta.' },
      {
        id: 'quem-cheirou',
        label: 'A pensar em quem me veio à cabeça',
        to: 'hub',
        traits: { ternura: 2 },
        requires: (d) => d.flags.includes('pessoa'),
        lockedHint: 'Só aparece se te lembraste de alguém.',
        line: 'Terminaste a carta a pensar em alguém.',
        sub: 'Essa pessoa, algures, espirrou.',
      },
    ],
  },

  /* ───────────── A JANELA ───────────── */
  {
    id: 'j1',
    path: 'janela',
    title: 'Duas e catorze',
    beats: [
      b('Uma janela acende-se do outro lado da rua.'),
      b('São 02:14. A cidade dorme. Duas janelas não.'),
      b('Alguém também não consegue dormir.'),
    ],
    question: 'O que fazes?',
    choices: [
      { id: 'acender', label: 'Acendo a minha luz', to: 'j2a', traits: { coragem: 1 }, line: 'Acendeste a tua luz para que o outro lado não ficasse sozinho.', sub: 'Foi visto. Foi agradecido.' },
      { id: 'observar', label: 'Fico às escuras a observar', to: 'j2b', traits: { misterio: 1 }, flag: 'escuro', line: 'Ficaste às escuras, só a olhar.', sub: 'Mas olhaste a sério.' },
      { id: 'careta', label: 'Faço uma careta', to: 'j2a', traits: { humor: 2 }, line: 'Fizeste uma careta a um desconhecido, às duas da manhã.', sub: 'E funcionou. Ele riu.' },
    ],
  },
  {
    id: 'j2a',
    path: 'janela',
    title: 'A resposta',
    beats: [
      b('A outra luz pisca duas vezes.'),
      b('Não é código. É só alguém a dizer: «vi-te».'),
    ],
    question: 'Qual é a tua hora favorita do dia?',
    choices: [
      { id: 'madrugada', label: 'A madrugada', to: 'j3', traits: { misterio: 1 } },
      { id: 'tarde', label: 'O fim de tarde', to: 'j3', traits: { ternura: 1 } },
      { id: 'cafe', label: 'A hora do café', to: 'j3', traits: { humor: 1 } },
    ],
  },
  {
    id: 'j2b',
    path: 'janela',
    title: 'A silhueta',
    beats: [
      b('Uma silhueta pousa uma chávena na mesa.'),
      b('Não te vê. Ou finge muito bem que não.'),
    ],
    question: 'Se pudesses perguntar uma coisa a um desconhecido, o que era?',
    choices: [
      { id: 'bem', label: '«Estás bem?»', to: 'j3', traits: { ternura: 2 } },
      { id: 'ouve', label: '«O que ouves agora?»', to: 'j3', traits: { misterio: 1 } },
      { id: 'pizza', label: '«Pizza ou massa?»', to: 'j3', traits: { humor: 2 } },
    ],
  },
  {
    id: 'j3',
    path: 'janela',
    title: 'A lua',
    secret: 'lua',
    beats: [
      b('A lua está tão baixa que parece pousada no telhado.'),
      b('No vidro, em letras de bafo, alguém escreveu: «Desce.»'),
    ],
    question: 'Desces?',
    choices: [
      { id: 'descer', label: 'Desço', to: 'j4a', traits: { coragem: 2 }, flag: 'desceu', line: 'Desceste quando te pediram para descer.', sub: 'Foi a parte mais difícil. E a mais bonita.' },
      { id: 'sobe-tu', label: 'Escrevo «sobe tu»', to: 'j4b', traits: { humor: 1 }, line: 'Respondeste «sobe tu» ao vidro embaciado.', sub: 'Foi a resposta certa.' },
      { id: 'janela-aberta', label: 'Fico, mas deixo a janela aberta', to: 'j4b', traits: { ternura: 1 }, line: 'Ficaste, mas deixaste a janela aberta.', sub: 'É quase o mesmo que descer.' },
    ],
  },
  {
    id: 'j4a',
    path: 'janela',
    title: 'A rua',
    beats: [
      b('A rua cheira a asfalto frio e a pão ainda por nascer.'),
      b('Ninguém. Só um bilhete preso ao candeeiro, com o teu nome mal escrito.'),
    ],
    question: 'Abres o bilhete aí mesmo ou levas contigo?',
    choices: [
      { id: 'abrir', label: 'Aí mesmo', to: 'j5', traits: { coragem: 1 } },
      { id: 'levar', label: 'Levo comigo', to: 'j5', traits: { ternura: 1, misterio: 1 } },
    ],
  },
  {
    id: 'j4b',
    path: 'janela',
    title: 'O avião',
    beats: [
      b('Entra uma brisa. E um bilhete dobrado em avião.'),
      b('Pousa-te no joelho, como se já soubesse o caminho.'),
    ],
    question: 'Quem achas que o dobrou?',
    choices: [
      { id: 'vizinho', label: 'O vizinho da janela', to: 'j5', traits: { humor: 1 } },
      { id: 'ninguem', label: 'Ninguém, foi o vento', to: 'j5', traits: { misterio: 1 } },
      { id: 'alguem', label: 'Alguém que queria falar comigo', to: 'j5', traits: { ternura: 1 } },
    ],
  },
  {
    id: 'j5',
    path: 'janela',
    title: 'O bilhete',
    endsPath: true,
    beats: [
      b('O bilhete tem uma frase só. Falta-lhe uma palavra.'),
      b('«Gosto de ______ contigo.»'),
      b('Desceste. Era isto que estavas a descer para ler.', (d) => d.flags.includes('desceu')),
    ],
    question: 'Que palavra a completa?',
    choices: [
      { id: 'estar', label: 'estar', to: 'hub', traits: { ternura: 1 }, line: 'Escreveste «estar» no espaço em branco.', sub: 'Só isso. Já é tudo.' },
      { id: 'rir', label: 'rir', to: 'hub', traits: { humor: 1 }, line: 'Escreveste «rir» no espaço em branco.', sub: 'E eu ri.' },
      { id: 'calar', label: 'calar', to: 'hub', traits: { misterio: 1 }, line: 'Escreveste «calar» no espaço em branco.', sub: 'Há quem saiba calar contigo.' },
      {
        id: 'arriscar',
        label: 'arriscar',
        to: 'hub',
        traits: { coragem: 2 },
        requires: (d) => d.traits.coragem >= 3,
        lockedHint: 'Só aparece a quem já foi corajoso o suficiente.',
        line: 'Escreveste «arriscar» no espaço em branco.',
        sub: 'E não estragaste nada.',
      },
    ],
  },

  /* ───────────── O SILÊNCIO ───────────── */
  {
    id: 'k1',
    path: 'silencio',
    title: 'Quando tudo se cala',
    beats: [
      b('De repente, não se ouve nada.'),
      b('Nem o frigorífico. Nem a cidade.'),
      b('Só o teu coração, mais alto do que esperavas.'),
    ],
    question: 'O que fazes ao silêncio?',
    choices: [
      { id: 'escutar', label: 'Escuto', to: 'k2a', traits: { misterio: 1 }, line: 'Escutaste o silêncio em vez de o encher.', sub: 'Ele agradece.' },
      { id: 'quebrar', label: 'Quebro-o com uma palavra', to: 'k2b', traits: { coragem: 1 }, line: 'Quebraste o silêncio com uma palavra.', sub: 'Alguém tinha de ser.' },
      { id: 'sentar', label: 'Sento-me dentro dele', to: 'k2a', traits: { ternura: 1 }, line: 'Sentaste-te dentro do silêncio, sem pressa.', sub: 'Aqui há sempre lugar.' },
    ],
  },
  {
    id: 'k2a',
    path: 'silencio',
    title: 'O que ele diz',
    beats: [
      b('Há silêncios que pesam. Outros abraçam.'),
      b('Raramente sabes qual é qual antes de o atravessar.'),
    ],
    question: 'O teu silêncio, hoje, é de que tipo?',
    choices: [
      { id: 'abraca', label: 'O que abraça', to: 'k3', traits: { ternura: 2 } },
      { id: 'pesa', label: 'O que pesa', to: 'k3', traits: { misterio: 2 } },
      { id: 'resposta', label: 'O de quem pensa numa resposta', to: 'k3', traits: { humor: 2 } },
    ],
  },
  {
    id: 'k2b',
    path: 'silencio',
    title: 'A palavra',
    beats: [
      b('Disseste uma palavra ao escuro.'),
      b('O escuro devolveu-a, mais pequena e mais perto.'),
    ],
    question: 'Que palavra foi?',
    choices: [
      { id: 'ola', label: '«Olá»', to: 'k3', traits: { humor: 1 } },
      { id: 'fica', label: '«Fica»', to: 'k3', traits: { ternura: 2 } },
      { id: 'porque', label: '«Porquê?»', to: 'k3', traits: { misterio: 1, coragem: 1 } },
    ],
  },
  {
    id: 'k3',
    path: 'silencio',
    title: 'O eco',
    secret: 'eco',
    beats: [
      b('O eco chega com um atraso estranho.'),
      b('Não repete o que disseste. Responde.'),
    ],
    question: 'O que gostavas que o eco respondesse?',
    choices: [
      { id: 'aqui', label: '«Estou aqui»', to: 'k4a', traits: { ternura: 2 } },
      { id: 'tambem', label: '«Também eu»', to: 'k4a', traits: { ternura: 1, coragem: 1 } },
      { id: 'ainda-nao', label: '«Ainda não»', to: 'k4b', traits: { misterio: 2 } },
      { id: 'riso', label: 'Uma gargalhada', to: 'k4b', traits: { humor: 2 } },
    ],
  },
  {
    id: 'k4a',
    path: 'silencio',
    title: 'A resposta',
    beats: [
      b('Alguém, em algum lugar, esperou por esta resposta antes de ti.'),
      b('E não se importou de esperar.'),
    ],
    question: 'Acreditas que há coisas que só chegam a quem espera?',
    choices: [
      { id: 'sim', label: 'Acredito', to: 'k5', traits: { ternura: 1 }, line: 'Acreditas que há coisas que só chegam a quem espera.', sub: 'Eu também.' },
      { id: 'nao', label: 'Prefiro ir buscar', to: 'k5', traits: { coragem: 1 }, line: 'Preferes ir buscar o que queres.', sub: 'Foi assim que chegaste cá.' },
    ],
  },
  {
    id: 'k4b',
    path: 'silencio',
    title: 'O adiamento',
    beats: [
      b('Há respostas que só chegam quando deixamos de as procurar.'),
      b('O silêncio sabe disto. Por isso é paciente.'),
    ],
    question: 'Tens pressa de ser compreendido?',
    choices: [
      { id: 'pressa', label: 'Alguma', to: 'k5', traits: { humor: 1 }, line: 'Tens alguma pressa de ser compreendido.', sub: 'És compreendido. Prometo.' },
      { id: 'sem-pressa', label: 'Nenhuma', to: 'k5', traits: { misterio: 1 }, line: 'Não tens pressa de ser compreendido.', sub: 'Isso torna-te difícil de esquecer.' },
    ],
  },
  {
    id: 'k5',
    path: 'silencio',
    title: 'O que fica',
    endsPath: true,
    beats: [
      b('Todo o silêncio guarda uma frase por dizer.'),
      b('A tua não tem de ser perfeita. Só tem de existir.'),
    ],
    question: 'O que fica por dizer?',
    choices: [
      { id: 'tudo', label: 'Quase tudo', to: 'hub', traits: { misterio: 1 }, line: 'Ficou quase tudo por dizer.', sub: 'Mas está aqui, nas entrelinhas.' },
      { id: 'pouco', label: 'Quase nada', to: 'hub', traits: { coragem: 1 }, line: 'Já disseste quase tudo o que havia a dizer.', sub: 'Sobra a parte que se sente.' },
      { id: 'importante', label: 'O mais importante', to: 'hub', traits: { ternura: 2 }, line: 'Ficou por dizer o mais importante.', sub: 'Diz-se por gestos, também.' },
    ],
  },

  /* ───────────── O JARDIM ───────────── */
  {
    id: 'g1',
    path: 'jardim',
    title: 'O portão',
    beats: [
      b('Há um jardim que ninguém regou, e mesmo assim floresceu.'),
      b('No portão, um bilhete: «Plantei isto a pensar em ti. Não me perguntes quando.»'),
      b('Cheira a terra molhada e a promessa.'),
    ],
    question: 'Entras?',
    choices: [
      { id: 'devagar', label: 'Entro devagar', to: 'g2a', traits: { ternura: 1 }, flag: 'devagar', line: 'Entraste no jardim devagar, para não assustar as flores.', sub: 'Elas repararam. Algumas coraram.' },
      { id: 'correr', label: 'Entro a correr', to: 'g2b', traits: { humor: 1, coragem: 1 }, line: 'Entraste a correr, como quem tem saudades de um sítio que nunca viu.', sub: 'Eu também corri uma vez.' },
      { id: 'esperar', label: 'Espero que o jardim me chame', to: 'g2a', traits: { misterio: 1 }, line: 'Esperaste que o jardim te chamasse. Chamou.', sub: 'Pelo nome, claro.' },
    ],
  },
  {
    id: 'g2a',
    path: 'jardim',
    title: 'O canteiro',
    beats: [
      b('Há um canteiro com uma só flor, de uma cor que não consegues nomear.'),
      b('Dizem que cada flor cresce para alguém. Esta parece ter-te esperado com muita paciência.'),
    ],
    question: 'Que flor gostavas que fosse?',
    choices: [
      { id: 'rosa', label: 'Uma rosa, claro', to: 'g3', traits: { ternura: 1, humor: 1 } },
      { id: 'sem-nome', label: 'Uma flor sem nome', to: 'g3', traits: { misterio: 2 } },
      { id: 'inverno', label: 'Uma que dure depois do inverno', to: 'g3', traits: { ternura: 2 } },
    ],
  },
  {
    id: 'g2b',
    path: 'jardim',
    title: 'A terra',
    beats: [
      b('Tropeças numa pá enterrada até meio. Alguém parou aqui a meio, talvez a olhar para ti.'),
      b('Debaixo da terra ouve-se um tique-taque pequenino.'),
    ],
    question: 'O que enterrarias neste jardim?',
    choices: [
      { id: 'saudade', label: 'Uma saudade', to: 'g3', traits: { ternura: 2 } },
      { id: 'segredo', label: 'Um segredo', to: 'g3', traits: { misterio: 2 } },
      { id: 'chinelos', label: 'Os chinelos do ano passado', to: 'g3', traits: { humor: 2 } },
    ],
  },
  {
    id: 'g3',
    path: 'jardim',
    title: 'A flor fechada',
    secret: 'flor',
    beats: [
      b('No centro do jardim, uma flor ainda fechada.'),
      b('Dizem que só abre quando alguém lhe diz a verdade.'),
    ],
    question: 'O que lhe dizes?',
    choices: [
      { id: 'saudades', label: '«Estava com saudades»', to: 'g4a', traits: { ternura: 2 }, line: 'Disseste à flor que estavas com saudades.', sub: 'Ela fingiu que não ouviu. Corou.' },
      { id: 'estou-aqui', label: '«Não sei o que sinto, mas estou aqui»', to: 'g4a', traits: { coragem: 1, misterio: 1 }, line: 'Disseste «não sei o que sinto, mas estou aqui».', sub: 'É a frase mais honesta que existe.' },
      { id: 'abre-la', label: '«Abre lá, que tenho pouco tempo»', to: 'g4b', traits: { humor: 2 }, line: 'Disseste à flor para abrir depressa, que tinhas pouco tempo.', sub: 'Ela ofendeu-se. Abriu.' },
    ],
  },
  {
    id: 'g4a',
    path: 'jardim',
    title: 'A pétala',
    beats: [
      b('A flor abre uma pétala de cada vez, como quem escolhe as palavras com cuidado.'),
      b('Lá dentro, uma data escrita à mão. Sem ano.'),
    ],
    question: 'Se fosse uma data tua, qual seria?',
    choices: [
      { id: 'chuva', label: 'Um dia de chuva', to: 'g5', traits: { misterio: 1 } },
      { id: 'riso', label: 'O dia em que ri até chorar', to: 'g5', traits: { humor: 1 } },
      { id: 'futuro', label: 'Um dia que ainda não aconteceu', to: 'g5', traits: { ternura: 1, coragem: 1 } },
    ],
  },
  {
    id: 'g4b',
    path: 'jardim',
    title: 'A pressa',
    beats: [
      b('A flor abre, ofendida, mas abre. Há flores com dignidade e flores com sentido de humor.'),
      b('Lá dentro, um papelinho: «Boa tentativa. Gosto de quem ri.»'),
    ],
    question: 'Preferes ser amado por quem ri contigo ou por quem te ouve calar?',
    choices: [
      { id: 'quem-ri', label: 'Por quem ri comigo', to: 'g5', traits: { humor: 2 } },
      { id: 'quem-ouve', label: 'Por quem me ouve calar', to: 'g5', traits: { ternura: 1, misterio: 1 } },
    ],
  },
  {
    id: 'g5',
    path: 'jardim',
    title: 'A semente',
    endsPath: true,
    beats: [
      b('No fundo da flor, uma semente pequenina.'),
      b('Quem a plantou deixou escrito: «Para quando alguém me quiser ficar.»'),
      b('Entraste devagar. Foi isso que a fez crescer.', (d) => d.flags.includes('devagar')),
    ],
    question: 'O que fazes com a semente?',
    choices: [
      { id: 'bolso', label: 'Guardo-a junto do coração', to: 'hub', traits: { ternura: 2 }, line: 'Guardaste a semente junto do coração.', sub: 'Cresce aí, mesmo que não vejas.' },
      { id: 'plantar', label: 'Planto-a e aceito esperar', to: 'hub', traits: { misterio: 1, coragem: 1 }, line: 'Plantaste a semente e aceitaste esperar.', sub: 'Quem espera assim merece florir.' },
      { id: 'oferecer', label: 'Ofereço-a a alguém', to: 'hub', traits: { coragem: 1, ternura: 1 }, line: 'Ofereceste a semente a alguém.', sub: 'Ficou a cheirar a ti.' },
      {
        id: 'quem-lembrou',
        label: 'Levo-a a quem se lembrou de mim',
        to: 'hub',
        traits: { ternura: 2 },
        requires: (d) => d.traits.ternura >= 4,
        lockedHint: 'Só aparece a quem já foi terno o suficiente.',
        line: 'Levaste a semente a quem se lembrou de ti.',
        sub: 'Essa pessoa já sabia.',
      },
    ],
  },

  /* ───────────── O ESPELHO ───────────── */
  {
    id: 'e1',
    path: 'espelho',
    title: 'O reflexo',
    beats: [
      b('Há um espelho encostado à parede, com um espaço onde devia estar o teu reflexo.'),
      b('Aos poucos, aparece alguém. Não és tu: és como alguém te vê.'),
      b('Está a sorrir. Num espelho, quem sorri primeiro, ganha.'),
    ],
    question: 'O que fazes?',
    choices: [
      { id: 'sorrir', label: 'Sorrio de volta', to: 'e2a', traits: { ternura: 1 }, flag: 'sorriu', line: 'Sorriste de volta ao reflexo, antes de saberes quem era.', sub: 'Foi um bom sinal.' },
      { id: 'pose', label: 'Faço uma pose ridícula', to: 'e2a', traits: { humor: 2 }, line: 'Fizeste uma pose ridícula a um espelho desconhecido.', sub: 'O reflexo copiou. Com estilo.' },
      { id: 'aproximar', label: 'Aproximo-me devagar', to: 'e2b', traits: { misterio: 1 }, line: 'Aproximaste-te devagar, para ver quem estava do outro lado.', sub: 'Do outro lado, estavam à espera.' },
    ],
  },
  {
    id: 'e2a',
    path: 'espelho',
    title: 'O elogio',
    beats: [
      b('O reflexo abre a boca e diz uma frase que nunca ouviste, na voz de quem te conhece bem.'),
      b('É um elogio. Dos que se dizem a meio de uma conversa banal, sem aviso.'),
    ],
    question: 'Qual preferias ouvir?',
    choices: [
      { id: 'riso', label: '«Tens um riso que se ouve de longe»', to: 'e3', traits: { humor: 1, ternura: 1 } },
      { id: 'conhecer', label: '«Foi bom ter-te conhecido»', to: 'e3', traits: { ternura: 2 } },
      { id: 'surpreender', label: '«Ainda me surpreendes»', to: 'e3', traits: { misterio: 2 } },
    ],
  },
  {
    id: 'e2b',
    path: 'espelho',
    title: 'De perto',
    beats: [
      b('De perto, o reflexo tem cansaço nos olhos e uma coragem pequenina que não se nota de longe.'),
      b('Parece alguém com muito para dizer e que escolhe bem as horas.'),
    ],
    question: 'Quando foi a última vez que alguém te viu de verdade?',
    choices: [
      { id: 'pouco', label: 'Há pouco tempo', to: 'e3', traits: { ternura: 1 } },
      { id: 'muito', label: 'Há muito', to: 'e3', traits: { misterio: 1 } },
      { id: 'espera', label: 'Ainda estou à espera', to: 'e3', traits: { coragem: 1, ternura: 1 } },
    ],
  },
  {
    id: 'e3',
    path: 'espelho',
    title: 'A fissura',
    secret: 'reflexo',
    beats: [
      b('No canto do espelho, uma fissura fina. Por ela passa um brilho.'),
      b('O reflexo encosta a mão ao vidro e espera.'),
    ],
    question: 'Encostas a tua?',
    choices: [
      { id: 'encostar', label: 'Encosto', to: 'e4a', traits: { ternura: 2, coragem: 1 }, line: 'Encostaste a mão ao vidro, sem pedir explicações.', sub: 'O vidro aqueceu.' },
      { id: 'cocegas', label: 'Faço-lhe cócegas na palma', to: 'e4b', traits: { humor: 2 }, line: 'Fizeste cócegas à palma da mão do reflexo.', sub: 'Ele riu-se. Disfarçou mal.' },
      { id: 'recuar', label: 'Espero que ele recue primeiro', to: 'e4b', traits: { misterio: 2 }, line: 'Esperaste que o reflexo recuasse primeiro.', sub: 'Não recuou. Também esperou.' },
    ],
  },
  {
    id: 'e4a',
    path: 'espelho',
    title: 'O calor',
    beats: [
      b('O vidro fica morno. Do outro lado, alguém respira fundo, e sentes isso em ti.'),
      b('Por um instante, a distância entre duas pessoas é só uma película fina.'),
    ],
    question: 'O que é mais difícil: dizer o que sentes ou ouvi-lo dizer-se?',
    choices: [
      { id: 'dizer', label: 'Dizer', to: 'e5', traits: { coragem: 1 }, line: 'Para ti, o mais difícil é dizer o que sentes.', sub: 'Já disseste mais do que pensas.' },
      { id: 'ouvir', label: 'Ouvir', to: 'e5', traits: { ternura: 1 }, line: 'Para ti, o mais difícil é ouvir o que os outros sentem.', sub: 'Mesmo assim, ouviste.' },
    ],
  },
  {
    id: 'e4b',
    path: 'espelho',
    title: 'O jogo',
    beats: [
      b('O reflexo propõe um jogo: cada um diz uma verdade e uma mentira, e o outro adivinha.'),
      b('Ele começa: «Detesto música. Adoro ver-te rir.»'),
    ],
    question: 'Qual é a mentira?',
    choices: [
      { id: 'primeira', label: 'A primeira', to: 'e5', traits: { humor: 1, ternura: 1 }, line: 'Adivinhaste: a mentira era a primeira.', sub: 'A segunda nunca foi mentira.' },
      { id: 'segunda', label: 'A segunda', to: 'e5', traits: { misterio: 1 }, line: 'Disseste que a segunda era a mentira, só para ver se eu me ofendia.', sub: 'Não me ofendi. Corei.' },
    ],
  },
  {
    id: 'e5',
    path: 'espelho',
    title: 'A frase',
    endsPath: true,
    beats: [
      b('O espelho escurece devagar e, no lugar do reflexo, fica uma frase.'),
      b('«Ninguém te vê como tu te vês. Ainda bem.»'),
      b('Sorriste primeiro. O espelho nunca esquece quem sorri primeiro.', (d) => d.flags.includes('sorriu')),
    ],
    question: 'Como queres ser lembrado?',
    choices: [
      { id: 'riso', label: 'Pelo riso', to: 'hub', traits: { humor: 2 }, line: 'Queres ser lembrado pelo riso.', sub: 'Já és.' },
      { id: 'calma', label: 'Pela calma', to: 'hub', traits: { ternura: 1, misterio: 1 }, line: 'Queres ser lembrado pela calma.', sub: 'É a coisa mais rara que existe.' },
      { id: 'futuro', label: 'Por algo que ainda não fiz', to: 'hub', traits: { coragem: 2 }, line: 'Queres ser lembrado por algo que ainda não fizeste.', sub: 'Então vai. Eu espero.' },
      {
        id: 'sem-ver',
        label: 'Pelo que fiz sem ninguém ver',
        to: 'hub',
        traits: { ternura: 1, misterio: 2 },
        requires: (d) => d.traits.misterio >= 3,
        lockedHint: 'Só aparece a quem guarda mistérios.',
        line: 'Queres ser lembrado pelo que fizeste sem ninguém ver.',
        sub: 'Eu vi. Prometo que vi.',
      },
    ],
  },
];

export const SCENE_BY_ID: Record<string, Scene> = Object.fromEntries(SCENES.map((s) => [s.id, s]));

export function pathFirstScene(path: DoorPath): string {
  return PATH_INFO[path].first;
}
