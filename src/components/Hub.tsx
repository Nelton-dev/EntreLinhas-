import { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, Check } from 'lucide-react';
import { useExperience } from '../state/ExperienceContext';
import { donePaths, isPathDone, pathProgress } from '../state/experience';
import { PATH_INFO } from '../story/scenes';
import { BeatText } from './BeatText';
import { SecretTrigger } from './SecretTrigger';
import StarBorder from './reactbits/StarBorder';
import type { DoorPath } from '../story/scenes';

type Door = DoorPath;
const DOORS: Door[] = ['carta', 'janela', 'silencio', 'jardim', 'espelho'];

export function Hub() {
  const { state, dispatch } = useExperience();
  const [ready, setReady] = useState(false);
  const done = donePaths(state.choices);
  const canFinish = done.length >= 2;

  const phrase =
    done.length === 0
      ? `${state.name ? state.name + ', há' : 'Há'} cinco portas. Uma delas já sabe o teu nome.`
      : done.length === DOORS.length
        ? 'Abriste todas. Só falta a última linha.'
        : canFinish
          ? 'Podes ir já ao fim, ou deixar-te tentar mais uma porta.'
          : 'Boa. As outras portas já repararam em ti.';

  const open = (p: Door) => {
    // Se o caminho já foi começado, regressa onde estavas; senão, começa no início.
    const ids = PATH_INFO[p].sceneIds;
    const lastVisited = [...state.visited].reverse().find((v) => ids.includes(v));
    dispatch({ type: 'GO', to: isPathDone(p, state.choices) || !lastVisited ? PATH_INFO[p].first : lastVisited });
  };

  return (
    <section className="hub">
      <BeatText key={phrase} text={phrase} className="hub__phrase" delay={110} onDone={() => setReady(true)} />

      <motion.ul className="doors" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.9 }}>
        {DOORS.map((p) => {
          const info = PATH_INFO[p];
          const finished = isPathDone(p, state.choices);
          const progress = pathProgress(p, state.visited);
          return (
            <li key={p}>
              <button type="button" className={`door door--${p} ${finished ? 'is-done' : ''}`} onClick={() => open(p)} disabled={!ready}>
                <span className="door__name">{info.title}</span>
                <span className="door__sub">{info.subtitle}</span>
                <span className="door__meta">
                  {finished ? (
                    <>
                      <Check size={14} /> percorrida
                    </>
                  ) : progress > 0 ? (
                    `${progress} cenas visitadas`
                  ) : (
                    'por descobrir'
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </motion.ul>

      {canFinish && ready && (
        <motion.div className="hub__final" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <StarBorder
            as="button"
            type="button"
            color="#ffd6a5"
            backgroundColor="#1a0b1e"
            textColor="#fff3e4"
            duration={4}
            radius={999}
            onClick={() => dispatch({ type: 'GO', to: 'final' })}
          >
            A última linha
          </StarBorder>
        </motion.div>
      )}

      <SecretTrigger id="fechadura" visible className="secret--fechadura" label="Uma fechadura quase invisível" style={{ left: '50%', bottom: '14%' }}>
        <KeyRound size={16} />
      </SecretTrigger>
    </section>
  );
}
