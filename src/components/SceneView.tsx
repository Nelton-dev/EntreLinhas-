import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Lock } from 'lucide-react';
import type { Scene } from '../types';
import { useExperience } from '../state/ExperienceContext';
import { BeatText } from './BeatText';
import { SecretTrigger } from './SecretTrigger';
import ShinyText from './reactbits/ShinyText';
import { Eye, Flame, Flower2, Moon, Waves } from 'lucide-react';

const SECRET_ICON = {
  vela: <Flame size={20} />,
  lua: <Moon size={20} />,
  eco: <Waves size={20} />,
  flor: <Flower2 size={20} />,
  reflexo: <Eye size={20} />,
} as const;

export function SceneView({ scene }: { scene: Scene }) {
  const { state, derived, dispatch } = useExperience();
  const beats = useMemo(
    () => scene.beats.filter((b) => !b.when || b.when(derived)).map((b) => b.text),
    [scene, derived],
  );
  const chosen = state.choices[scene.id];
  // Se a cena já foi vivida, mostra tudo de imediato (regressar não custa tempo).
  const [index, setIndex] = useState(chosen ? beats.length - 1 : 0);
  const [done, setDone] = useState(Boolean(chosen));
  const atEnd = index >= beats.length - 1;
  const showChoices = atEnd && done;

  const next = () => {
    if (!atEnd) {
      setIndex((i) => i + 1);
      setDone(false);
    }
  };

  const secretStyle =
    scene.secret === 'vela'
      ? { right: '8%', top: '22%' }
      : scene.secret === 'lua'
        ? { left: '9%', top: '20%' }
        : scene.secret === 'flor'
          ? { left: '12%', bottom: '28%' }
          : scene.secret === 'reflexo'
            ? { right: '9%', top: '30%' }
            : { right: '12%', bottom: '30%' };

  return (
    <section className="scene" aria-labelledby={`t-${scene.id}`}>
      <header className="scene__head">
        <ShinyText
          text={scene.title}
          className="scene__title"
          color="#c79ab0"
          shineColor="#ffffff"
          speed={4}
          delay={1.5}
        />
        <span id={`t-${scene.id}`} className="sr-only">
          {scene.title}
        </span>
      </header>

      {scene.secret && scene.secret !== 'estrela' && (
        <SecretTrigger
          id={scene.secret}
          visible
          holdMs={scene.secret === 'eco' ? 700 : 0}
          className={`secret--${scene.secret}`}
          style={secretStyle}
          label={scene.secret === 'eco' ? 'Um círculo ténue: mantém premido' : 'Algo brilha aqui'}
        >
          {scene.secret in SECRET_ICON ? SECRET_ICON[scene.secret as keyof typeof SECRET_ICON] : null}
        </SecretTrigger>
      )}

      <div className="scene__story">
        {beats.slice(0, index).map((t, i) => (
          <p key={i} className="beat beat--past">
            {t}
          </p>
        ))}
        <BeatText key={`${scene.id}-${index}-${beats[index]}`} text={beats[index] ?? ''} className="beat" onDone={() => setDone(true)} />
      </div>

      <div className="scene__actions">
        {!atEnd && (
          <motion.button
            type="button"
            className="continue"
            onClick={next}
            initial={{ opacity: 0 }}
            animate={{ opacity: done ? 1 : 0.35 }}
            aria-label="Continuar"
          >
            <ChevronDown size={22} />
          </motion.button>
        )}

        {showChoices && (
          <motion.div
            className="choices"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="question">{scene.question}</p>
            {scene.choices.map((c) => {
              const allowed = !c.requires || c.requires(derived);
              if (!allowed) {
                return (
                  <p key={c.id} className="choice choice--locked">
                    <Lock size={14} /> {c.lockedHint ?? 'Ainda não.'}
                  </p>
                );
              }
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`choice ${chosen === c.id ? 'is-chosen' : ''}`}
                  onClick={() => dispatch({ type: 'CHOOSE', sceneId: scene.id, choiceId: c.id })}
                >
                  {c.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
