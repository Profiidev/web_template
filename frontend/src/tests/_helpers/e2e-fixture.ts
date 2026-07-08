import { handlers } from '../mocks/e2e/handlers';
import { test as testBase } from '@playwright/test';
import type { AnyHandler } from 'msw';
import { type NetworkFixture, defineNetworkFixture } from '@msw/playwright';

interface Fixtures {
  handlers: AnyHandler[];
  network: NetworkFixture;
}

export const test = testBase.extend<Fixtures>({
  // Initial list of the network handlers.
  handlers: [handlers, { option: true }],

  // A fixture you use to control the network in your tests.
  network: [
    // oxlint-disable-next-line no-shadow
    async ({ context, handlers }, use) => {
      const network = defineNetworkFixture({
        context,
        handlers
      });

      await network.enable();
      await use(network);
      await network.disable();
    },
    { auto: true }
  ]
});
