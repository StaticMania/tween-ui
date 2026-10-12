import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FooterPulseLinks from '@/registry/tweenui/footer-pulse-links';

const setMedia = ({ reduce, hover }: { reduce: boolean; hover: boolean }) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce') ? reduce : query.includes('hover') ? hover : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

const wordmarkLetters = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-letter]'));

describe('Footer Pulse Links', () => {
  beforeEach(() => setMedia({ reduce: true, hover: false }));
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders a footer landmark with a labelled footer nav', () => {
    render(<FooterPulseLinks />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Footer' })).toBeInTheDocument();
  });

  it('labels each link column by its heading', () => {
    render(
      <FooterPulseLinks
        columns={[
          {
            heading: 'Shop',
            links: [
              { label: 'Jackets', href: '/jackets' },
              { label: 'Packs', href: '/packs' },
            ],
          },
        ]}
      />
    );

    const shop = screen.getByRole('list', { name: 'Shop' });
    expect(
      within(shop)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
    ).toEqual(['/jackets', '/packs']);
  });

  it('reads rolling labels as one word and keeps a copy of each letter', () => {
    render(<FooterPulseLinks />);

    const link = screen.getByRole('link', { name: 'Sliding Tabs' });
    const letters = link.querySelector('span[aria-hidden="true"]');
    expect(letters?.children).toHaveLength(12);
    expect(letters?.children[0]).toHaveAttribute('data-char', 'S');
  });

  it('draws a heartbeat underline under column and legal links', () => {
    render(<FooterPulseLinks />);

    for (const name of ['GitHub', 'MIT License']) {
      const link = screen.getByRole('link', { name });
      expect(link.querySelector('svg path')).toHaveAttribute('pathLength', '1');
      expect(link).toHaveAttribute('target', '_blank');
    }
  });

  it('names social links after the brand and drops the row when empty', () => {
    const { rerender } = render(<FooterPulseLinks brand="Northwind" />);
    expect(screen.getByRole('link', { name: 'Northwind on GitHub' })).toBeInTheDocument();

    rerender(<FooterPulseLinks brand="Northwind" socials={[]} />);
    expect(screen.queryByRole('list', { name: 'Social links' })).not.toBeInTheDocument();
  });

  it('hides the wordmark from assistive tech and tints the last word', () => {
    const { container } = render(<FooterPulseLinks brand="North Wind" />);

    const letters = wordmarkLetters(container);
    expect(letters.map((letter) => letter.textContent).join('')).toBe('North Wind');
    expect(letters[0]?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(letters.at(-1)?.className).toContain('198_245_111');
    expect(letters[0]?.className).not.toContain('198_245_111');
  });

  it('lifts the wordmark letters toward the pointer and lets them settle', () => {
    setMedia({ reduce: true, hover: true });
    let queued: FrameRequestCallback | null = null;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      queued = callback;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const { container } = render(<FooterPulseLinks />);
    const letters = wordmarkLetters(container);
    const mark = letters[0]?.closest('p');
    if (!mark) throw new Error('wordmark missing');

    mark.dispatchEvent(new MouseEvent('pointermove', { clientX: 0, clientY: 0 }));
    for (let step = 0; step < 30 && queued; step += 1) {
      const run: FrameRequestCallback = queued;
      queued = null;
      run(0);
    }
    expect(letters[0]?.style.transform).toMatch(/translate3d\(0, -\d/);

    mark.dispatchEvent(new MouseEvent('pointerleave'));
    for (let step = 0; step < 400 && queued; step += 1) {
      const run: FrameRequestCallback = queued;
      queued = null;
      run(0);
    }
    expect(letters[0]?.style.transform).toMatch(
      /translate3d\(0, -0\.0\dpx|translate3d\(0, 0\.00px/
    );
  });

  it('leaves the wordmark still on touch screens', () => {
    const { container } = render(<FooterPulseLinks />);
    const letters = wordmarkLetters(container);
    const mark = letters[0]?.closest('p');
    if (!mark) throw new Error('wordmark missing');

    mark.dispatchEvent(new MouseEvent('pointermove', { clientX: 0, clientY: 0 }));
    expect(letters[0]?.style.transform).toBe('');
  });
});
