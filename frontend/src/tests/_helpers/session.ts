import type { BrowserContext } from '@playwright/test';
import type { Scenario } from '../mocks/e2e/data';

const URL = 'http://localhost:4173';

/**
 * Mirrors a cookie into `document.cookie` for every page in the context. The
 * e2e MSW handlers read `mock_scenario` / `mock_setup` from the *client-side*
 * request cookies; WebKit does not reliably expose context cookies to those
 * intercepted fetches, so we also seed them through an init script to make the
 * scenario deterministic across every browser project.
 */
const seedDocumentCookie = async (context: BrowserContext, cookie: string) =>
  context.addInitScript((value) => {
    // oxlint-disable-next-line no-document-cookie
    document.cookie = `${value}; path=/`;
  }, cookie);

/**
 * Seeds the auth cookie (so protected routes don't redirect to /login) and the
 * `mock_scenario` cookie that the e2e MSW handlers read to vary their data.
 */
export const setupSession = async (
  context: BrowserContext,
  scenario: Scenario = 'default'
) => {
  await context.addCookies([
    { name: 'centaurus_jwt', url: URL, value: 'e2e-token' },
    { name: 'mock_scenario', url: URL, value: scenario }
  ]);
  await seedDocumentCookie(context, `mock_scenario=${scenario}`);
};

/**
 * Seeds an anonymous public-share visitor: no auth cookie (so `info` reports no
 * session and the page treats the visitor as anonymous) plus `mock_public` to
 * pick the view-only or editable public note. Used by the `/notes/share/[id]`
 * tests, which must render without a logged-in user.
 */
export const seedPublicShareVisitor = async (
  context: BrowserContext,
  access: 'view' | 'edit' = 'view'
) => {
  await context.addCookies([
    { name: 'mock_anon', url: URL, value: '1' },
    { name: 'mock_public', url: URL, value: access }
  ]);
  await seedDocumentCookie(context, 'mock_anon=1');
  await seedDocumentCookie(context, `mock_public=${access}`);
};

/**
 * Seeds the `special_valid` cookie that `AccessConfirm` polls for. With it set,
 * the account auth flows (password / email / passkey changes) treat the session
 * as already re-authenticated and skip the "Confirm Access" dialog.
 */
export const seedSpecialAccess = async (context: BrowserContext) => {
  await context.addCookies([{ name: 'special_valid', url: URL, value: '1' }]);
  await seedDocumentCookie(context, 'special_valid=1');
};

/**
 * Seeds only the `mock_setup=pending` cookie (and no auth cookie) so the
 * `isSetup` endpoint reports an un-provisioned instance. Used by the /setup
 * tests, where the first-run wizard must render instead of redirecting away.
 */
export const seedSetupPending = async (context: BrowserContext) => {
  await context.addCookies([
    { name: 'mock_setup', url: URL, value: 'pending' }
  ]);
  await seedDocumentCookie(context, 'mock_setup=pending');
};

/**
 * Seeds the `mock_mail=off` cookie so the `mailActive` endpoint reports mail as
 * unconfigured. Admin-managed user controls (reset password, change email,
 * reset avatar) only render when mail is off.
 */
export const seedMailInactive = async (context: BrowserContext) => {
  await context.addCookies([{ name: 'mock_mail', url: URL, value: 'off' }]);
  await seedDocumentCookie(context, 'mock_mail=off');
};
