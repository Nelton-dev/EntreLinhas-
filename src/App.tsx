import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ExperienceProvider, useExperience } from './state/ExperienceContext';
import { SecretsProvider } from './state/SecretsContext';
import { SCENE_BY_ID } from './story/scenes';
import type { Mood } from './types';
import { Background, loadGalaxy, loadParticles } from './components/Background';
import { Hud } from './components/Hud';
import { Intro, NameStep } from './components/Intro';
import { Hub } from './components/Hub';
import { SceneView } from './components/SceneView';
import { Final } from './components/Final';
import { MapPanel } from './components/MapPanel';
import { Loading } from './components/Loading';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SecretTrigger } from './components/SecretTrigger';
import ClickSpark from './components/reactbits/ClickSpark';
import { SIGNATURE } from './config';
import { clearSavedState } from './state/experience';

function moodOf(location: string): Mood {
  if (location === 'intro' || location === 'name') return 'intro';
  if (location === 'hub') return 'hub';
  if (location === 'final') return 'final';
  const p = SCENE_BY_ID[location]?.path;
  return p && p !== 'prologo' ? p : 'intro';
}

function Screen({ location }: { location: string }) {
  if (location === 'intro') return null; // tratado em Experience (precisa do sinal de áudio)
  if (location === 'name') return <NameStep />;
  if (location === 'hub') return <Hub />;
  if (location === 'final') return <Final />;
  const scene = SCENE_BY_ID[location];
  return scene ? <SceneView scene={scene} /> : <Hub />;
}

function Experience() {
  const { state } = useExperience();
  const [mapOpen, setMapOpen] = useState(false);
  const [audioSignal, setAudioSignal] = useState(0);
  const mood = useMemo(() => moodOf(state.location), [state.location]);

  // Fecha o mapa com Escape
  useEffect(() => {
    if (!mapOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMapOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mapOpen]);

  const experience = (
      <div className="app">
        <Background mood={mood} />
        <Hud onOpenMap={() => setMapOpen(true)} audioSignal={audioSignal} />

        <main className="stage">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.location}
              className="stage__inner"
              initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              exit={{ opacity: 0, filter: 'blur(10px)', y: -8 }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
            >
              <ErrorBoundary
                fallback={(reset) => (
                  <div className="fatal">
                    <p>Esta cena não conseguiu abrir.</p>
                    <button type="button" className="choice" onClick={reset}>
                      Tentar de novo
                    </button>
                  </div>
                )}
              >
                {state.location === 'intro' ? <Intro onStart={() => setAudioSignal((n) => n + 1)} /> : <Screen location={state.location} />}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Véu de mudança de ambiente (transição entre caminhos) */}
        <AnimatePresence>
          <motion.div
            key={mood}
            className={`veil veil--${mood}`}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            aria-hidden="true"
          />
        </AnimatePresence>

        <footer className="signature">
          <SecretTrigger id="assinatura" taps={3}>
            {SIGNATURE}
          </SecretTrigger>
        </footer>

        <AnimatePresence>{mapOpen && <MapPanel onClose={() => setMapOpen(false)} />}</AnimatePresence>
      </div>
  );

  // As faíscas (React Bits · ClickSpark) são um extra: se falharem, a história continua sem elas.
  return (
    <ErrorBoundary fallback={experience}>
      <ClickSpark sparkColor="#ffb3cb" sparkSize={8} sparkRadius={16} sparkCount={7} duration={450}>
        {experience}
      </ClickSpark>
    </ErrorBoundary>
  );
}

function Boot({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  const prepare = useCallback(async () => {
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready ?? Promise.resolve();
    const assets = Promise.all([fonts, loadParticles(), loadGalaxy()]).catch(() => undefined);
    const timeout = new Promise((r) => window.setTimeout(r, 3500));
    await Promise.race([assets, timeout]);
    setReady(true);
  }, []);

  useEffect(() => {
    void prepare();
  }, [prepare]);

  if (!ready) {
    return (
      <div className="app">
        <div className="bg bg--intro" aria-hidden="true">
          <div className="bg__base" />
        </div>
        <Loading />
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary
      fallback={() => (
        <div className="app">
          <div className="bg bg--intro" aria-hidden="true">
            <div className="bg__base" />
          </div>
          <div className="fatal">
            <p>Algo correu mal ao abrir a história.</p>
            <button
              type="button"
              className="choice"
              onClick={() => {
                clearSavedState();
                window.location.reload();
              }}
            >
              Recomeçar
            </button>
          </div>
        </div>
      )}
    >
      <Boot>
        <ExperienceProvider>
          <SecretsProvider>
            <Experience />
          </SecretsProvider>
        </ExperienceProvider>
      </Boot>
    </ErrorBoundary>
  );
}
