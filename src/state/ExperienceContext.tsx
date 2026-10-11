import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Dispatch } from 'react';
import {
  clearSavedState,
  derive,
  loadState,
  reducer,
  saveState,
  type Action,
  type State,
} from './experience';
import type { Derived } from '../types';

interface Ctx {
  state: State;
  derived: Derived;
  dispatch: Dispatch<Action>;
}

const ExperienceContext = createContext<Ctx | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    if (state.location === 'intro' && state.visited.length === 0 && state.secrets.length === 0) {
      clearSavedState();
    } else {
      saveState(state);
    }
  }, [state]);

  const derived = useMemo(() => derive(state), [state]);
  const value = useMemo(() => ({ state, derived, dispatch }), [state, derived]);
  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error('useExperience tem de ser usado dentro de <ExperienceProvider>');
  return ctx;
}
