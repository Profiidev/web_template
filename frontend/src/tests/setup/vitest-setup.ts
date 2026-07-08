import '@testing-library/jest-dom/vitest';

// Jsdom is missing a few browser APIs that the pleiades/bits-ui components
// Touch on mount. Stub them so component tests can render.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as never;

if (!globalThis.matchMedia) {
  globalThis.matchMedia = (query: string) => ({
    addEventListener: () => {},
    addListener: () => {},
    dispatchEvent: () => false,
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: () => {},
    removeListener: () => {}
  });
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Jsdom in this runner ships without localStorage; mode-watcher (theming) reads
// It at import time, so provide an in-memory implementation.
class MemoryStorage {
  readonly #map = new Map<string, string>();
  get length() {
    return this.#map.size;
  }
  clear() {
    this.#map.clear();
  }
  getItem(key: string) {
    return this.#map.get(key) ?? null;
  }
  key(index: number) {
    return [...this.#map.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.#map.delete(key);
  }
  setItem(key: string, value: string) {
    this.#map.set(key, value);
  }
}
if (!globalThis.localStorage) {
  globalThis.localStorage = new MemoryStorage();
}
if (!globalThis.sessionStorage) {
  globalThis.sessionStorage = new MemoryStorage();
}
