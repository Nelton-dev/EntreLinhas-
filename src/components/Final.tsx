import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Copy, DoorOpen, RotateCcw } from 'lucide-react';
import { useExperience } from '../state/ExperienceContext';
import { dominantTrait } from '../state/experience';
import { buildFinalSteps, letterAsText } from '../story/ending';
import { BeatText } from './BeatText';
import ShinyText from './reactbits/ShinyText';
import DecryptedText from './reactbits/DecryptedText';
import { usePrefs } from '../hooks/usePrefs';
import { sendResponses } from '../story/submit';
import { SUBMIT_URL } from '../config';

export function Final() {
  const { state, derived, dispatch } = useExperience();
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'ok' | 'fail'>(state.sent ? 'ok' : 'idle');
  const { reducedMotion } = usePrefs();
  const steps = useMemo(() => buildFinalSteps(derived, dominantTrait(derived)), [derived]);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const send = async () => {
    setSendStatus('sending');
    const r = await sendResponses(state);
    if (r.ok) dispatch({ type: 'SENT' });
    setSendStatus(r.ok ? 'ok' : 'fail');
  };

  // Envia uma única vez, só se a pessoa aceitou partilhar e há destino configurado.
  useEffect(() => {
    if (SUBMIT_URL && state.share && !state.sent) void send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = steps[i];
  const last = i >= steps.length - 1;
  useEffect(() => {
    if (step.kind !== 'title' && step.kind !== 'reveal') return;
    const ms = reducedMotion ? 0 : step.kind === 'title' ? 2200 : 3400;
    const t = window.setTimeout(() => setDone(true), ms);
    return () => window.clearTimeout(t);
  }, [i, step.kind, reducedMotion]);

  const advance = () => {
    if (!last) {
      setI(i + 1);
      setDone(false);
    }
  };

  const copy = async () => {
    const text = letterAsText(derived);
    try {
      await navigator.clipboard.writeText(text);
      setCopied('ok');
    } catch {
      setCopied('fail');
    }
    window.setTimeout(() => setCopied(null), 2500);
  };

  return (
    <section className="final">
      <div className="final__stage" onClick={() => done && advance()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            className={`final__step final__step--${step.kind}`}
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.7 }}
          >
            {step.kind === 'title' && (
              <ShinyText text={step.text} className="final__title" color="#ffc2d4" shineColor="#ffffff" speed={4} delay={0.5} />
            )}

            {step.kind === 'text' && (
              <BeatText
                text={step.text}
                className={`final__text ${step.tone === 'strong' ? 'is-strong' : ''} ${step.tone === 'soft' ? 'is-soft' : ''}`}
                delay={step.tone === 'strong' ? 170 : 110}
                onDone={() => setDone(true)}
              />
            )}

            {step.kind === 'pair' && (
              <>
                <BeatText text={step.line} className="final__text" delay={80} onDone={() => setDone(true)} />
                <motion.p
                  className="final__sub"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: done ? 0.75 : 0 }}
                  transition={{ duration: 1.6, delay: reducedMotion ? 0 : 0.6 }}
                >
                  {step.sub}
                </motion.p>
              </>
            )}

            {step.kind === 'reveal' && (
              <>
                <p className="final__reveal">
                  {reducedMotion ? (
                    step.text
                  ) : (
                    <DecryptedText
                      text={step.text}
                      animateOn="view"
                      sequential
                      revealDirection="center"
                      speed={55}
                      maxIterations={14}
                      characters="·•∗+—_"
                      encryptedClassName="toast__enc"
                    />
                  )}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {!last && (
        <motion.button
          type="button"
          className="continue"
          onClick={advance}
          animate={{ opacity: done ? 1 : 0.3 }}
          aria-label="Continuar"
        >
          <ChevronDown size={22} />
        </motion.button>
      )}

      {last && (
        <motion.div className="final__end" initial={{ opacity: 0, y: 12 }} animate={{ opacity: done ? 1 : 0, y: done ? 0 : 12 }} transition={{ duration: 1.2 }}>
          {SUBMIT_URL && state.share && (
            <p className="send-status" role="status">
              {sendStatus === 'ok' && '✓ O Nelton recebeu a tua carta.'}
              {sendStatus === 'sending' && 'A enviar a tua carta ao Nelton…'}
              {sendStatus === 'fail' && (
                <>
                  Não foi possível enviar.{' '}
                  <button type="button" className="link-btn" onClick={() => void send()}>
                    Tentar de novo
                  </button>
                </>
              )}
            </p>
          )}
          <button type="button" className="choice" onClick={copy} disabled={!done}>
            {copied === 'ok' ? <Check size={16} /> : <Copy size={16} />}{' '}
            {copied === 'ok' ? 'Carta copiada' : copied === 'fail' ? 'Não foi possível copiar' : 'Copiar a minha carta'}
          </button>
          <button type="button" className="choice" onClick={() => dispatch({ type: 'GO', to: 'hub' })} disabled={!done}>
            <DoorOpen size={16} /> Voltar às portas
          </button>
          {confirmReset ? (
            <button type="button" className="choice choice--danger" onClick={() => dispatch({ type: 'RESET' })} disabled={!done}>
              <RotateCcw size={16} /> Confirmar: recomeçar do zero
            </button>
          ) : (
            <button type="button" className="choice" onClick={() => setConfirmReset(true)} disabled={!done}>
              <RotateCcw size={16} /> Recomeçar
            </button>
          )}
        </motion.div>
      )}
    </section>
  );
}
