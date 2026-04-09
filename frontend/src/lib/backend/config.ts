import { browser } from '$app/environment';
import type { CreateClientConfig } from '$lib/client/client.gen';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  // some random url that is just required so the request constructor in nodejs during ssr does not fail
  baseUrl: browser ? undefined : 'http://localhost:12356'
});
