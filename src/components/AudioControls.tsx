import { useCallback, useEffect, useRef, useState } from 'react';
import { Music2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { AUDIO_DEFAULT_VOLUME, AUDIO_SRC } from '../config';

type Status = 'checking' | 'ready' | 'missing';

export function AudioControls({ startSignal }: { startSignal: number }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<Status>('checking');
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(AUDIO_DEFAULT_VOLUME);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  const play = useCallback(async () => {
    const el = ref.current;
    if (!el || status === 'missing') return;
    try {
      await el.play();
      setNote(null);
    } catch {
      // Autoplay bloqueado ou ficheiro inválido: não é um erro fatal.
      setNote('Toca em ▶ para ouvir a música.');
    }
  }, [status]);

  // O botão "Começar" é um gesto do utilizador: tenta iniciar a música aí.
  useEffect(() => {
    if (startSignal > 0 && status === 'ready') void play();
  }, [startSignal, status, play]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) void play();
    else el.pause();
  };

  const missing = status === 'missing';
  const label = missing
    ? 'Música indisponível: falta o ficheiro public/audio/musica.mp3'
    : playing
      ? 'Pausar música'
      : 'Reproduzir música';

  return (
    <div className="audio" role="group" aria-label="Música">
      <audio
        ref={ref}
        src={AUDIO_SRC}
        loop
        preload="metadata"
        onLoadedMetadata={() => setStatus('ready')}
        onError={() => setStatus('missing')}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button type="button" className="icon-btn" onClick={toggle} disabled={missing} aria-label={label} title={label}>
        {missing ? <Music2 size={18} /> : playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <button
        type="button"
        className="icon-btn"
        onClick={() => {
          const el = ref.current;
          if (!el) return;
          el.muted = !muted;
          setMuted(!muted);
        }}
        disabled={missing}
        aria-label={muted ? 'Ativar som' : 'Silenciar'}
        title={muted ? 'Ativar som' : 'Silenciar'}
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      {!missing && status === 'ready' && (
        <input
          className="audio__volume"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Volume"
        />
      )}
      {missing && <span className="audio__note">sem música</span>}
      {note && !missing && <span className="audio__note">{note}</span>}
    </div>
  );
}
