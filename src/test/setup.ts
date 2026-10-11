import '@testing-library/jest-dom/vitest';

// jsdom não tem IntersectionObserver nem matchMedia nem scrollTo
class IO {
  cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe(el: Element) {
    this.cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  unobserve() {}
  disconnect() {}
}
globalThis.IntersectionObserver = IO as unknown as typeof IntersectionObserver;
window.matchMedia = ((q: string) => ({
  matches: q.includes('reduce'), // testes com movimento reduzido: texto estático e sem WebGL
  media: q,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  onchange: null,
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;
HTMLMediaElement.prototype.play = () => Promise.reject(new Error('sem áudio no jsdom'));
HTMLCanvasElement.prototype.getContext = (() => null) as never;

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = RO as unknown as typeof ResizeObserver;
