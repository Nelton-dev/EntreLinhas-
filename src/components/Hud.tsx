import { ArrowLeft, Map as MapIcon, Sparkles } from 'lucide-react';
import { useExperience } from '../state/ExperienceContext';
import { AudioControls } from './AudioControls';
import { EXPECTED_SCENES, TOTAL_SECRETS } from '../config';

interface Props {
  onOpenMap: () => void;
  audioSignal: number;
}

export function Hud({ onOpenMap, audioSignal }: Props) {
  const { state, dispatch } = useExperience();
  const progress = Math.min(1, state.visited.length / EXPECTED_SCENES);
  const canBack = state.history.length > 0 && state.location !== 'intro';

  return (
    <header className="hud">
      <div className="hud__bar" aria-hidden="true">
        <div className="hud__fill" style={{ transform: `scaleX(${state.location === 'final' ? 1 : progress})` }} />
      </div>
      <div className="hud__row">
        <div className="hud__left">
          <button type="button" className="icon-btn" onClick={() => dispatch({ type: 'BACK' })} disabled={!canBack} aria-label="Voltar atrás" title="Voltar atrás">
            <ArrowLeft size={18} />
          </button>
          <button type="button" className="icon-btn" onClick={onOpenMap} aria-label="Abrir mapa" title="Mapa">
            <MapIcon size={18} />
          </button>
        </div>
        <div className="hud__right">
          <span className="hud__secrets" title="Segredos encontrados" aria-label={`Segredos encontrados: ${state.secrets.length} de ${TOTAL_SECRETS}`}>
            <Sparkles size={14} /> {state.secrets.length}/{TOTAL_SECRETS}
          </span>
          <AudioControls startSignal={audioSignal} />
        </div>
      </div>
    </header>
  );
}
