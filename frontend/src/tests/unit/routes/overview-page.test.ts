import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import * as client from '$lib/client';

vi.mock('$lib/client', () => ({
  testDummy: vi.fn(async () => ({ data: 'Test' }))
}));

const Page = (await import('$routes/+page.svelte')).default;

describe('overview page', () => {
  it('shows the loading state while the dummy request is pending', () => {
    vi.mocked(client.testDummy).mockReturnValueOnce(
      new Promise(() => {}) as never
    );
    render(Page);
    expect(screen.getByText('Loading ...')).toBeInTheDocument();
  });

  it('renders the resolved dummy text', async () => {
    vi.mocked(client.testDummy).mockResolvedValueOnce({
      data: 'Test'
    } as never);
    render(Page);
    expect(await screen.findByText('Test')).toBeInTheDocument();
  });

  it('requests the dummy endpoint as text', () => {
    vi.mocked(client.testDummy).mockClear();
    render(Page);
    expect(client.testDummy).toHaveBeenCalledWith(
      expect.objectContaining({ parseAs: 'text' })
    );
  });
});
