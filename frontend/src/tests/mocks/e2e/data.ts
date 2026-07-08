/** Scenario name read from the `mock_scenario` cookie (set by the e2e tests). */
export type Scenario =
  | 'default'
  | 'empty'
  | 'readonly'
  | 'at-limit'
  | 'transfer-at-limit';

/**
 * List data only varies between `default` and `empty`; the `readonly` scenario
 * reuses the default lists and only changes the note *detail* payload (see
 * `isReadonlyNote`), so a viewer can be exercised without new list fixtures.
 */
export const scenarioOf = (
  cookies: Record<string, string>
): 'default' | 'empty' =>
  cookies.mock_scenario === 'empty' ? 'empty' : 'default';

export const notesScenarioOf = (
  cookies: Record<string, string>
): 'default' | 'empty' | 'at-limit' => {
  if (cookies.mock_scenario === 'empty') {
    return 'empty';
  }
  if (cookies.mock_scenario === 'at-limit') {
    return 'at-limit';
  }
  return 'default';
};

/** True when the note detail should be served as a view-only (can_edit) note. */
export const isReadonlyNote = (cookies: Record<string, string>): boolean =>
  cookies.mock_scenario === 'readonly';

/**
 * The public-share page treats a user whose `info` falls back to the unknown
 * email as an anonymous visitor (and keeps them on the page); any other user is
 * redirected to the authenticated note view. The `mock_anon` cookie makes the
 * `info` endpoint report no session so the anonymous branch renders.
 */
export const isAnonymous = (cookies: Record<string, string>): boolean =>
  cookies.mock_anon === '1';
