import { useRef, type ReactNode, type CSSProperties } from 'react';
import { useSecrets } from '../state/SecretsContext';
import type { SecretId } from '../types';

interface Props {
  id: SecretId;
  children: ReactNode;
  /** Quantos toques seguidos (em menos de 1,5 s) são precisos. */
  taps?: number;
  /** Se > 0, é preciso manter premido durante estes milissegundos. */
  holdMs?: number;
  className?: string;
  style?: CSSProperties;
  /** Etiqueta para leitores de ecrã (quando o segredo é um botão visível). */
  label?: string;
  /** Se verdadeiro, renderiza um botão visível; senão, apenas um invólucro discreto. */
  visible?: boolean;
}

export function SecretTrigger({ id, children, taps = 1, holdMs = 0, className = '', style, label, visible }: Props) {
  const { reveal, isFound } = useSecrets();
  const count = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const hold = useRef<number | undefined>(undefined);
  const found = isFound(id);

  const onActivate = () => {
    if (holdMs > 0) return;
    count.current += 1;
    window.clearTimeout(timer.current);
    if (count.current >= taps) {
      count.current = 0;
      reveal(id);
      return;
    }
    timer.current = window.setTimeout(() => (count.current = 0), 1500);
  };

  const startHold = () => {
    if (holdMs <= 0) return;
    window.clearTimeout(hold.current);
    hold.current = window.setTimeout(() => reveal(id), holdMs);
  };
  const endHold = () => window.clearTimeout(hold.current);

  const common = {
    className: `${visible ? 'secret' : 'secret-wrap'} ${found ? 'is-found' : ''} ${className}`,
    style,
    onClick: onActivate,
    onPointerDown: startHold,
    onPointerUp: endHold,
    onPointerLeave: endHold,
    onPointerCancel: endHold,
  };

  if (visible) {
    return (
      <button type="button" aria-label={label ?? 'Algo brilha aqui'} {...common}>
        {children}
      </button>
    );
  }
  return <span {...common}>{children}</span>;
}
