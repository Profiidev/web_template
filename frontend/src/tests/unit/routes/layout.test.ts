import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Layout from '$routes/+layout.svelte';

describe('+layout.svelte', () => {
  it('renders its children inside the full-size shell', () => {
    const children = createRawSnippet(() => ({
      render: () => '<span data-testid="child">hi</span>'
    }));

    const { getByTestId, container } = render(Layout, {
      children
    } as never);

    expect(getByTestId('child')).toBeInTheDocument();
    expect(container.querySelector('.h-full.w-full')).not.toBeNull();
  });
});
