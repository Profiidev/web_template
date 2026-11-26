import { expect } from '@playwright/test';
import { test } from '#test_helpers/e2e-fixture.ts';
import { setupSession } from '#test_helpers/session.ts';
import { expectNoHorizontalOverflow, gotoReady } from '#test_helpers/layout.ts';

test.beforeEach(async ({ context }) => {
  await setupSession(context);
});

test('overview page renders inside the app shell', async ({ page }) => {
  await gotoReady(page, '/');

  await expect(page.getByRole('paragraph').getByText('Test')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
