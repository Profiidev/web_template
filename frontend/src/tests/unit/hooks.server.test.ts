import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/static/private', () => ({ BACKEND_URL: 'http://backend:9000' }));

const { handle, handleFetch } = await import('../../hooks.server');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyArg = (v: unknown) => v as any;

describe('handleFetch', () => {
  it('rewrites /api/* requests to the backend and copies the cookie', async () => {
    const fetch = vi.fn(
      async (_req: Request) => new Response('ok', { status: 200 })
    );
    const request = new Request('http://frontend/api/user');
    const event = anyArg({
      request: new Request('http://frontend/api/user', {
        headers: { cookie: 'centaurus_jwt=1' }
      })
    });

    const res = await handleFetch(anyArg({ event, fetch, request }));

    const [[forwarded]] = fetch.mock.calls;
    expect(new URL(forwarded.url).host).toBe('backend:9000');
    expect(forwarded.headers.get('cookie')).toBe('centaurus_jwt=1');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('does not rewrite non-/api requests but still adds CORS', async () => {
    const fetch = vi.fn(
      async (_req: Request) => new Response('ok', { status: 200 })
    );
    const request = new Request('http://frontend/assets/logo.png');
    const event = anyArg({ request: new Request('http://frontend/assets') });

    const res = await handleFetch(anyArg({ event, fetch, request }));

    const [[forwarded]] = fetch.mock.calls;
    expect(new URL(forwarded.url).host).toBe('frontend');
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  it('preserves the upstream status', async () => {
    const fetch = vi.fn(
      async (_req: Request) => new Response(null, { status: 418 })
    );
    const res = await handleFetch(
      anyArg({
        event: { request: new Request('http://frontend/api/x') },
        fetch,
        request: new Request('http://frontend/api/x')
      })
    );
    expect(res.status).toBe(418);
  });
});

describe('handle', () => {
  it('resolves with a permissive header filter', async () => {
    const resolve = vi.fn(
      async (_event: unknown, _opts: unknown) => new Response('page')
    );
    const event = anyArg({});
    await handle(anyArg({ event, resolve }));
    expect(resolve).toHaveBeenCalledWith(event, {
      filterSerializedResponseHeaders: expect.any(Function)
    });
    const opts = resolve.mock.calls[0][1] as {
      filterSerializedResponseHeaders: () => boolean;
    };
    expect(opts.filterSerializedResponseHeaders()).toBe(true);
  });
});
