import { browser } from '$app/env';
import type { CreateClientConfig } from '#lib/client/client.gen.ts';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  // Some random url that is just required so the request constructor in nodejs during ssr does not fail
  baseUrl: browser ? undefined : 'http://localhost:12356'
});
