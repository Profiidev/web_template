import { vi } from 'vitest';

// Global stubs for SvelteKit's `$app/*` modules so components built on
// Sveltekit-superforms (which call `beforeNavigate`, subscribe to the `page`
// Store, etc.) can render under jsdom. Individual tests may still override
// `$app/navigation` with their own `vi.mock` to assert navigation calls.

vi.mock('$app/navigation', () => ({
  afterNavigate: vi.fn(),
  beforeNavigate: vi.fn(),
  disableScrollHandling: vi.fn(),
  goto: vi.fn(async () => Promise.resolve()),
  invalidate: vi.fn(async () => Promise.resolve()),
  invalidateAll: vi.fn(async () => Promise.resolve()),
  onNavigate: vi.fn(),
  preloadCode: vi.fn(async () => Promise.resolve()),
  preloadData: vi.fn(async () => Promise.resolve()),
  pushState: vi.fn(),
  replaceState: vi.fn()
}));

vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  const page = readable({
    data: {},
    error: null,
    form: null,
    params: {},
    route: { id: null },
    status: 200,
    url: new URL('http://localhost/')
  });
  const navigating = readable(null);
  const updated = {
    check: async () => Promise.resolve(false),
    subscribe: readable(false).subscribe
  };
  return {
    getStores: () => ({ navigating, page, updated }),
    navigating,
    page,
    updated
  };
});

vi.mock('$app/state', () => ({
  navigating: { complete: Promise.resolve(), from: null, to: null, type: null },
  page: {
    data: {},
    error: null,
    form: null,
    params: {},
    route: { id: null },
    status: 200,
    url: new URL('http://localhost/')
  },
  updated: { current: false }
}));
