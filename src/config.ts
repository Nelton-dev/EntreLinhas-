/** Caminho do ficheiro de música local (coloca-o em public/audio/). */
export const AUDIO_SRC = '/audio/musica.mp3';
export const AUDIO_DEFAULT_VOLUME = 0.5;

/**
 * Envio das respostas ao criador. Configura em .env (ver README):
 *   VITE_SUBMIT_URL  ex.: https://api.web3forms.com/submit  ou  https://formspree.io/f/xxxx
 *   VITE_SUBMIT_KEY  (só Web3Forms) a tua access key
 * Sem VITE_SUBMIT_URL, nada é enviado e a app não mostra o aviso de partilha.
 */
export const SUBMIT_URL: string | undefined = import.meta.env.VITE_SUBMIT_URL || undefined;
export const SUBMIT_KEY: string | undefined = import.meta.env.VITE_SUBMIT_KEY || undefined;

export const SIGNATURE = 'Uma experiência criada por Nelton';
export const STORAGE_KEY = 'entrelinhas:v1';
export const TOTAL_SECRETS = 10;
/** Número aproximado de cenas visitadas num percurso longo (para a barra de progresso). */
export const EXPECTED_SCENES = 18;
