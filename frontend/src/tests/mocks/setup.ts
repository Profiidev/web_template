import { beforeAll } from 'vitest';
import { client as appClient } from '$lib/client/client.gen';

// In the browser the client uses relative `/api/...` URLs, but Node's `fetch`
// (used under jsdom) rejects relative URLs, so requests must be absolute. Pin a
// Test origin: the generated MSW handlers read this same `baseUrl`, so the
// Request URL and the handler pattern stay aligned.
const TEST_BASE_URL = 'http://localhost';

// Start the MSW server once for the whole run. `onUnhandledRequest: 'error'`
// Makes any un-mocked `/api/...` call fail the test loudly; non-API requests
// (e.g. assets) are let through.
beforeAll(() => {
  appClient.setConfig({ ...appClient.getConfig(), baseUrl: TEST_BASE_URL });
});
