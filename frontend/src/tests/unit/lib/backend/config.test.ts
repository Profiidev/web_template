import { describe, expect, it } from 'vitest';
import { createClientConfig } from '$lib/backend/config';

describe('createClientConfig', () => {
  it('preserves the incoming config and pins a baseUrl', () => {
    const result = createClientConfig({
      headers: { 'x-test': '1' }
    });

    expect(result.headers).toEqual({ 'x-test': '1' });
    // Browser -> undefined; SSR -> the localhost placeholder that keeps
    // Node's Request constructor happy.
    expect([undefined, 'http://localhost:12356']).toContain(result.baseUrl);
  });
});
