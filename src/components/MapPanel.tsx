import { useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, X } from 'lucide-react';
import { useExperience } from '../state/ExperienceContext';
import { isPathDone, pathProgress } from '../state/experience';
import { PATH_INFO, SCENE_BY_ID } from '../story/scenes';
import type { DoorPath } from '../story/scenes';
import { SecretTrigger } from './SecretTrigger';

type Door = DoorPath;

export function MapPanel({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useExperience();
  const [confirmAll, setConfirmAll] = useState(false);

  const go = (to: string) => {
    dispatch({ type: 'GO', to });
    onClose();
  };

  return (
    <motion.div className="sheet-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.aside
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Mapa da experiência"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sheet__head">
          <h2>
            <SecretTrigger id="primeira" taps={3}>
              O teu mapa
            </SecretTrigger>
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar mapa">
            <X size={18} />
          </button>
        </header>

        <p className="sheet__hint">Podes voltar a qualquer cena. As escolhas anteriores ficam guardadas.</p>

        <div className="sheet__body">
          <button type="button" className="map-chip map-chip--wide" onClick={() => go('hub')}>
            As portas
          </button>

          {(Object.keys(PATH_INFO) as Door[]).map((p) => {
            const ids = PATH_INFO[p].sceneIds;
            const visited = ids.filter((id) => state.visited.includes(id));
            return (
              <div key={p} className="map-path">
                <div className="map-path__head">
                  <strong>{PATH_INFO[p].title}</strong>
                  <span>
                    {isPathDone(p, state.choices) ? 'percorrida' : `${pathProgress(p, state.visited)} visitadas`}
                  </span>
                </div>
                <div className="map-path__chips">
                  {visited.length === 0 && <span className="map-empty">Ainda por descobrir</span>}
                  {visited.map((id) => (
                    <button key={id} type="button" className={`map-chip ${state.location === id ? 'is-current' : ''}`} onClick={() => go(id)}>
                      {SCENE_BY_ID[id].title}
                    </button>
                  ))}
                </div>
                {visited.length > 0 && (
                  <button type="button" className="link-btn" onClick={() => dispatch({ type: 'RESET_PATH', path: p })}>
                    <RotateCcw size={12} /> Refazer este caminho
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <footer className="sheet__foot">
          {confirmAll ? (
            <>
              <span>Apagar tudo e recomeçar?</span>
              <button type="button" className="link-btn link-btn--danger" onClick={() => { dispatch({ type: 'RESET' }); onClose(); }}>
                Sim, recomeçar
              </button>
              <button type="button" className="link-btn" onClick={() => setConfirmAll(false)}>
                Cancelar
              </button>
            </>
          ) : (
            <button type="button" className="link-btn" onClick={() => setConfirmAll(true)}>
              <RotateCcw size={12} /> Recomeçar tudo
            </button>
          )}
        </footer>
      </motion.aside>
    </motion.div>
  );
}
