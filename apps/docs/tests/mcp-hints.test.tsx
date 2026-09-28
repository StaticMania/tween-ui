import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InstallTabs } from '@/components/mdx/install-tabs';
import { OpenIn } from '@/components/mdx/open-in';

const copyText = vi.hoisted(() => vi.fn(async () => true));

vi.mock('next/navigation', () => ({
  usePathname: () => '/block/tab-wipe',
}));

vi.mock('@/lib/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/utils')>()),
  copyText,
}));

describe('MCP hints', () => {
  it('points every install command at the MCP setup page', () => {
    render(<InstallTabs item="tab-wipe" />);

    expect(screen.getByRole('link', { name: 'Set up MCP' })).toHaveAttribute(
      'href',
      '/installation/mcp'
    );
  });

  it('copies a prompt that asks the shadcn MCP for the item and its demo', async () => {
    render(<OpenIn name="tab-wipe" title="Tab Wipe" />);

    fireEvent.click(screen.getByRole('button', { name: /open in/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy MCP Prompt' }));

    await waitFor(() =>
      expect(copyText).toHaveBeenCalledWith(
        'Use the shadcn MCP to add @tween-ui/tab-wipe to my project. ' +
          'Check @tween-ui/tab-wipe-demo for usage and pass real props instead of guessing them.'
      )
    );
    expect(await screen.findByRole('menuitem', { name: 'Copied MCP Prompt' })).toBeInTheDocument();
  });
});
