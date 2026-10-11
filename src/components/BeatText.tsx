import { useEffect } from 'react';
import BlurText from './reactbits/BlurText';
import { usePrefs } from '../hooks/usePrefs';

interface Props {
  text: string;
  className?: string;
  delay?: number;
  onDone?: () => void;
  animateBy?: 'words' | 'letters';
}

/** Revelação suave de texto (React Bits · BlurText), com alternativa estática para movimento reduzido. */
export function BeatText({ text, className = '', delay = 85, onDone, animateBy = 'words' }: Props) {
  const { reducedMotion } = usePrefs();
  useEffect(() => {
    if (reducedMotion) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, text]);
  if (reducedMotion) return <p className={className}>{text}</p>;
  return (
    <BlurText
      text={text}
      className={className}
      delay={delay}
      stepDuration={0.35}
      animateBy={animateBy}
      direction="bottom"
      onAnimationComplete={onDone}
    />
  );
}
