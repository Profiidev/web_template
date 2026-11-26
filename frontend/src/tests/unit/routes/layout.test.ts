import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeNavigate } from '$app/navigation';

const state = vi.hoisted(() => ({ updated: { current: false } }));
vi.mock('$app/state', () => state);

const Layout = (await import('#routes/+layout.svelte')).default;
const children = createRawSnippet(() => ({
  render: () => '<span data-testid="child">hi</span>'
}));

afterEach(() => {
  state.updated.current = false;
  vi.restoreAllMocks();
});

describe('+layout.svelte', () => {
  it('renders its children inside the full-size shell', () => {
    const { getByTestId, container } = render(Layout, {
      children
    } as never);

    expect(getByTestId('child')).toBeInTheDocument();
    expect(container.querySelector('.h-full.w-full')).not.toBeNull();
  });

  it('shows the update banner only when an update is pending and hides it on Later', async () => {
    const first = render(Layout, { children } as never);
    expect(first.queryByText('Update available')).toBeNull();
    first.unmount();

    state.updated.current = true;
    const { getByText, queryByText } = render(Layout, { children } as never);
    expect(getByText('Update available')).toBeInTheDocument();
    await fireEvent.click(getByText('Later'));
    expect(queryByText('Update available')).toBeNull();
  });

  it('turns client navigation into a full load only when an update is pending', () => {
    const hrefSet = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      set href(v: string) {
        hrefSet(v);
      }
    } as Location);
    render(Layout, { children } as never);
    const [guard] = vi.mocked(beforeNavigate).mock.calls.at(-1)!;
    const nav = (willUnload: boolean) =>
      guard({ to: { url: new URL('http://x/next') }, willUnload } as never);

    nav(false);
    expect(hrefSet).not.toHaveBeenCalled();
    state.updated.current = true;
    nav(true);
    expect(hrefSet).not.toHaveBeenCalled();
    nav(false);
    expect(hrefSet).toHaveBeenCalledWith('http://x/next');
  });
});
