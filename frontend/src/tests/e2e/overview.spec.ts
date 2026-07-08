import { expect } from '@playwright/test';
import { test } from '$test_helpers/e2e-fixture';
import { setupSession } from '$test_helpers/session';
import { expectNoHorizontalOverflow, gotoReady } from '$test_helpers/layout';

test.beforeEach(async ({ context }) => {
  await setupSession(context);
});

test('overview page renders inside the app shell', async ({ page }) => {
  await gotoReady(page, '/');

  await expect(page.getByRole('paragraph').getByText('Test')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
