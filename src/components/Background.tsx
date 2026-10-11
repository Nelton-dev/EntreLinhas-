import { lazy, Suspense, useMemo } from 'react';
import type { Mood } from '../types';
import { ErrorBoundary } from './ErrorBoundary';
import { hasWebGL, usePrefs } from '../hooks/usePrefs';

// Componentes reais do React Bits (src/components/reactbits), carregados à parte
// para a história aparecer logo e o WebGL entrar a seguir.
export const loadParticles = () => import('./reactbits/Particles');
export const loadGalaxy = () => import('./reactbits/Galaxy');
const Particles = lazy(loadParticles);
const Galaxy = lazy(loadGalaxy);

const PALETTES: Record<Exclude<Mood, 'final'>, { colors: string[]; speed: number; count: number; size: number }> = {
  intro: { colors: ['#ffb3cb', '#c8a2ff', '#ffffff'], speed: 0.06, count: 110, size: 70 },
  hub: { colors: ['#ff9ebd', '#b58cff', '#ffd6a5'], speed: 0.07, count: 120, size: 80 },
  carta: { colors: ['#ffd6a5', '#ff9ebd', '#ffffff'], speed: 0.05, count: 90, size: 90 },
  janela: { colors: ['#7f9bff', '#ffb3cb', '#ffffff'], speed: 0.09, count: 110, size: 70 },
  silencio: { colors: ['#b58cff', '#ff9ebd', '#7a4fd1'], speed: 0.03, count: 70, size: 110 },
  jardim: { colors: ['#ff9ebd', '#ffd9e4', '#9fe3b5'], speed: 0.06, count: 100, size: 85 },
  espelho: { colors: ['#e6dcff', '#ffb3cb', '#ffffff'], speed: 0.04, count: 80, size: 95 },
};

/** Camada de fundo: um gradiente CSS estático está SEMPRE visível; o WebGL entra por cima. */
export function Background({ mood }: { mood: Mood }) {
  const { reducedMotion, coarse } = usePrefs();
  const webgl = useMemo(hasWebGL, []);

  return (
    <div className={`bg bg--${mood}`} aria-hidden="true">
      <div className="bg__base" />
      {webgl && (
        <ErrorBoundary>
          <Suspense fallback={null}>
            {mood === 'final' ? (
              <div className="bg__gl">
                <Galaxy
                  density={coarse ? 0.45 : 0.8}
                  hueShift={320}
                  saturation={0.6}
                  glowIntensity={0.25}
                  twinkleIntensity={0.4}
                  rotationSpeed={0.04}
                  starSpeed={0.25}
                  speed={0.6}
                  mouseInteraction={!coarse}
                  mouseRepulsion={!coarse}
                  disableAnimation={reducedMotion}
                />
              </div>
            ) : (
              <div className="bg__gl" key={mood}>
                <Particles
                  particleColors={PALETTES[mood].colors}
                  particleCount={coarse ? Math.round(PALETTES[mood].count * 0.55) : PALETTES[mood].count}
                  particleSpread={10}
                  speed={reducedMotion ? 0 : PALETTES[mood].speed}
                  particleBaseSize={PALETTES[mood].size}
                  moveParticlesOnHover={!coarse && !reducedMotion}
                  particleHoverFactor={0.6}
                  alphaParticles
                  disableRotation={reducedMotion}
                  pixelRatio={1}
                />
              </div>
            )}
          </Suspense>
        </ErrorBoundary>
      )}
      <div className="bg__vignette" />
    </div>
  );
}
