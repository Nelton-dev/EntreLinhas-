import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** O que mostrar se algo falhar. Por omissão, nada (útil para efeitos opcionais). */
  fallback?: ReactNode | ((reset: () => void) => ReactNode);
  onError?: (error: Error) => void;
}

export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[EntreLinhas] erro isolado:', error, info.componentStack);
    this.props.onError?.(error);
  }

  reset = () => this.setState({ failed: false });

  render() {
    if (!this.state.failed) return this.props.children;
    const { fallback } = this.props;
    if (typeof fallback === 'function') return fallback(this.reset);
    return fallback ?? null;
  }
}
