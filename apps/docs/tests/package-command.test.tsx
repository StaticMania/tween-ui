import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PackageCommand from '@/registry/tweenui/package-command';

const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce') ? reduce : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

const writeText = vi.fn().mockResolvedValue(undefined);

const storage = new Map<string, string>();

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  },
});

const pick = (name: string) => fireEvent.click(screen.getAllByRole('tab', { name })[0]!);

describe('Package Command', () => {
  beforeEach(() => {
    setReducedMotion(true);
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<PackageCommand packages="seed" />).unmount();
  });

  it('renders a tab per manager and the npm command', () => {
    render(<PackageCommand packages={['gsap', '@gsap/react']} />);
    pick('npm');
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'npm',
      'pnpm',
      'yarn',
      'bun',
    ]);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('npm install gsap @gsap/react');
  });

  it('switches the command and remembers the choice', () => {
    render(<PackageCommand packages="gsap" dev />);
    pick('pnpm');
    expect(screen.getByRole('tab', { name: 'pnpm' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('pnpm add -D gsap');
    expect(window.localStorage.getItem('tweenui:package-manager')).toBe('pnpm');
  });

  it('keeps every instance on the same manager', () => {
    render(
      <>
        <PackageCommand packages="gsap" />
        <PackageCommand kind="execute" packages="shadcn@latest init" />
      </>
    );
    pick('bun');
    const panels = screen.getAllByRole('tabpanel');
    expect(panels[0]).toHaveTextContent('bun add gsap');
    expect(panels[1]).toHaveTextContent('bunx shadcn@latest init');
  });

  it('moves with the arrow keys, Home and End', () => {
    render(<PackageCommand packages="gsap" />);
    pick('npm');
    const npm = screen.getByRole('tab', { name: 'npm' });
    fireEvent.keyDown(npm, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: 'bun' })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole('tab', { name: 'bun' }), { key: 'Home' });
    expect(npm).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(npm, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'bun' })).toHaveAttribute('tabindex', '0');
    expect(npm).toHaveAttribute('tabindex', '-1');
  });

  it('copies the current command', async () => {
    const onCopy = vi.fn();
    render(<PackageCommand packages="gsap" onCopy={onCopy} />);
    pick('yarn');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy command' }));
    });
    expect(writeText).toHaveBeenCalledWith('yarn add gsap');
    expect(onCopy).toHaveBeenCalledWith('yarn add gsap');
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
  });

  it('falls back to the first listed manager', () => {
    render(<PackageCommand packages="gsap" managers={['pnpm', 'bun']} />);
    pick('bun');
    render(<PackageCommand packages="gsap" managers={['npm', 'yarn']} />);
    expect(screen.getAllByRole('tabpanel')[1]).toHaveTextContent('npm install gsap');
  });

  it('animates the flip without breaking the text', () => {
    setReducedMotion(false);
    render(<PackageCommand packages="gsap" />);
    pick('pnpm');
    pick('yarn');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('yarn add gsap');
  });
});
