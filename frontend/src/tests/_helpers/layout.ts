import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Navigates and waits for the network to settle. SvelteKit only attaches its
 * client-side form `enhance` / event handlers once hydration finishes; clicking
 * a submit button before then triggers a native form POST (which the dev server
 * answers with `405`). Waiting for `networkidle` ensures the JS bundle has
 * loaded and the page is hydrated before the test interacts with it.
 */
export const gotoReady = async (page: Page, path: string) => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
};

/**
 * Asserts the document does not scroll horizontally. Playwright runs every test
 * across the desktop and mobile viewports defined in `playwright.config.ts`, so
 * this catches layout overflow that only shows up on small screens. Internal
 * scroll containers (tables, scroll areas) clip their own overflow, so a
 * horizontally scrollable *document* is a real layout bug.
 */
export const expectNoHorizontalOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => {
    const el = document.documentElement;
    return { clientWidth: el.clientWidth, scrollWidth: el.scrollWidth };
  });

  expect(
    overflow.scrollWidth,
    `document overflows horizontally (scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth})`
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
};

/**
 * Navigates to `path`, waits for `ready` to confirm the page rendered its
 * content (data is loaded asynchronously through MSW), then asserts there is no
 * horizontal overflow.
 */
export const expectPageFits = async (
  page: Page,
  path: string,
  ready: Locator
) => {
  await page.goto(path);
  await expect(ready).toBeVisible();
  await expectNoHorizontalOverflow(page);
};
