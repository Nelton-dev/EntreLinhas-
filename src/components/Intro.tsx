import { useState, type FormEvent } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useExperience } from '../state/ExperienceContext';
import { SUBMIT_URL } from '../config';
import { BeatText } from './BeatText';
import { SecretTrigger } from './SecretTrigger';
import ShinyText from './reactbits/ShinyText';
import StarBorder from './reactbits/StarBorder';

export function Intro({ onStart }: { onStart: () => void }) {
  const { dispatch } = useExperience();
  const [ready, setReady] = useState(false);

  return (
    <section className="intro">
      <SecretTrigger id="estrela" visible className="secret--estrela" label="Uma estrela minúscula" style={{ right: '14%', top: '24%' }}>
        <span className="dot" />
      </SecretTrigger>

      <motion.h1
        className="intro__title"
        initial={{ opacity: 0, letterSpacing: '0.5em', filter: 'blur(12px)' }}
        animate={{ opacity: 1, letterSpacing: '0.08em', filter: 'blur(0px)' }}
        transition={{ duration: 2.2, ease: 'easeOut' }}
      >
        <SecretTrigger id="titulo" taps={5}>
          <ShinyText text="EntreLinhas" color="#ffc2d4" shineColor="#ffffff" speed={5} delay={1} />
        </SecretTrigger>
      </motion.h1>

      <Heart className="intro__heart" size={18} aria-hidden="true" />

      <BeatText
        text="Há coisas que só se leem entre as linhas. E há quem as escreva a pensar em ti."
        className="intro__phrase"
        delay={140}
        onDone={() => setReady(true)}
      />

      <motion.div className="intro__cta" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1 }}>
        <StarBorder
          as="button"
          type="button"
          color="#ff9ebd"
          backgroundColor="#1a0b1e"
          textColor="#fff0f5"
          duration={5}
          radius={999}
          disabled={!ready}
          onClick={() => {
            onStart();
            dispatch({ type: 'START' });
          }}
        >
          Começar
        </StarBorder>
        <p className="intro__hint">Toca em ▾ para continuar · escolhe com o coração · procura o que brilha ✦</p>
        <p className="intro__hint intro__hint--soft">10 a 15 minutos · há 10 segredos escondidos · melhor com som</p>
      </motion.div>
    </section>
  );
}

export function NameStep() {
  const { dispatch } = useExperience();
  const [name, setName] = useState('');
  const [share, setShare] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_NAME', name, share: Boolean(SUBMIT_URL) && share });
  };

  return (
    <section className="intro">
      <BeatText text="Como te chamam as pessoas que gostam de ti?" className="intro__phrase" delay={120} />
      <form className="name" onSubmit={submit}>
        <input
          className="name__input"
          type="text"
          maxLength={24}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="O teu nome, ou o carinhoso"
          aria-label="O teu nome"
          autoComplete="given-name"
          autoFocus
        />
        {SUBMIT_URL && (
          <label className="consent">
            <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} />
            <span>Quero que o Nelton receba, no fim, o meu nome, as minhas escolhas e os segredos que encontrei. Se não marcares, fica tudo só comigo.</span>
          </label>
        )}
        <button type="submit" className="choice choice--primary">
          {name.trim() ? 'Continuar' : 'Continuar sem nome'}
        </button>
      </form>
      {!SUBMIT_URL && <p className="intro__hint">O nome fica apenas nesta sessão, neste dispositivo.</p>}
    </section>
  );
}
