import { HttpResponse, http, ws } from 'msw';
import { type Client, createClient, createConfig } from '$lib/client/client';
import * as gen from '$lib/client/msw.gen';
import type { ClientOptions } from '$lib/client/types.gen';

const client: Client = createClient(createConfig<ClientOptions>());

/**
 * No-op WebSocket mock for the updater channel. The app opens this socket on
 * every page (see `connectWebsocket`); without a handler the preview server
 * answers with `404`, which clutters the test output. Accept the connection and
 * do nothing (never forward to a real server) so no update events fire.
 */
const updaterWs = ws.link('*/api/ws/updater');

/**
 * No-op mock for the public-note update channel. The public-share page opens
 * this socket to learn when the owner revokes access; accept it and stay quiet
 * so the page renders without a dangling connection error.
 */
const publicUpdaterWs = ws.link('*/api/notes/update/*');

/**
 * App-login device channel. The login page opens this socket and renders a QR
 * code from the first message it receives, so emit a fake device code on
 * connection to drive the "App Login" flow.
 */
const appLoginWs = ws.link('*/api/auth/app/device_login');

/**
 * Reuses the generated `handle*` factories (the same mock api the unit
 * tests use). The factories build their URL from the client's `baseUrl`; in the
 * preview server every `/api/*` request is host-rewritten to the backend by
 * `handleFetch`, so we build the handlers with `baseUrl = '*'` to match any
 * origin, then restore the real config for the SDK's actual requests.
 */
const original = client.getConfig();
client.setConfig({ ...original, baseUrl: '*' });

export const handlers = [
  updaterWs.addEventListener('connection', () => {}),
  publicUpdaterWs.addEventListener('connection', () => {}),
  // oxlint-disable-next-line no-shadow
  appLoginWs.addEventListener('connection', ({ client }) => {
    client.send('device-login-code');
  }),

  gen.handleTestDummy(() => HttpResponse.text('Test')),

  // Catch-all: any other `/api/*` call resolves with an empty 200 so unmocked
  // Endpoints never crash a page render.
  http.all('*/api/*', () => HttpResponse.json({}))
];

client.setConfig(original);
