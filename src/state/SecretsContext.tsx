import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useExperience } from './ExperienceContext';
import { SECRET_MESSAGES } from '../story/secrets';
import { TOTAL_SECRETS } from '../config';
import type { SecretId } from '../types';
import DecryptedText from '../components/reactbits/DecryptedText';
import { usePrefs } from '../hooks/usePrefs';

interface Ctx {
  reveal: (id: SecretId) => void;
  isFound: (id: SecretId) => boolean;
}

const SecretsContext = createContext<Ctx | null>(null);

export function SecretsProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useExperience();
  const { reducedMotion } = usePrefs();
  const [toast, setToast] = useState<{ id: SecretId; again: boolean; n: number } | null>(null);

  const reveal = useCallback(
    (id: SecretId) => {
      const again = state.secrets.includes(id);
      if (!again) dispatch({ type: 'SECRET', id });
      setToast({ id, again, n: again ? state.secrets.length : state.secrets.length + 1 });
    },
    [state.secrets, dispatch],
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const value = useMemo<Ctx>(
    () => ({ reveal, isFound: (id) => state.secrets.includes(id) }),
    [reveal, state.secrets],
  );

  return (
    <SecretsContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status" aria-live="polite" key={toast.id + toast.n}>
          <div className="toast__head">
            <Sparkles size={14} />
            <span>{toast.again ? 'Já tinhas encontrado este' : 'Segredo encontrado'} · {toast.n}/{TOTAL_SECRETS}</span>
            <button type="button" className="icon-btn icon-btn--sm" onClick={() => setToast(null)} aria-label="Fechar">
              <X size={14} />
            </button>
          </div>
          <p className="toast__body">
            {reducedMotion ? (
              SECRET_MESSAGES[toast.id]
            ) : (
              <DecryptedText
                text={SECRET_MESSAGES[toast.id]}
                animateOn="view"
                sequential
                revealDirection="start"
                speed={22}
                maxIterations={8}
                characters="·•∗+—_"
                encryptedClassName="toast__enc"
              />
            )}
          </p>
        </div>
      )}
    </SecretsContext.Provider>
  );
}

export function useSecrets() {
  const ctx = useContext(SecretsContext);
  if (!ctx) throw new Error('useSecrets tem de ser usado dentro de <SecretsProvider>');
  return ctx;
}
