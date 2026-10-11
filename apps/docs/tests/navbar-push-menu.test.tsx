import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavbarPushMenu, { type NavbarPushMenuLink } from '@/registry/tweenui/navbar-push-menu';

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

const LINKS: NavbarPushMenuLink[] = [
  { label: 'Home', href: '/', image: '/home.jpg' },
  { label: 'Work', href: '/work', image: '/work.jpg' },
  { label: 'Journal', href: 'https://example.com/journal', image: '/journal.jpg' },
];

const toggle = () => screen.getByRole('button', { name: /menu/i });

const menuOf = (button: HTMLElement) => {
  const id = button.getAttribute('aria-controls');
  return id ? document.getElementById(id) : null;
};

describe('Navbar Push Menu', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('is a region named after the brand with a header and a closed toggle', () => {
    render(<NavbarPushMenu brand="Northwind" links={LINKS} />);

    expect(screen.getByRole('region', { name: 'Northwind site' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveAccessibleName('Open menu');
  });

  it('keeps the menu inert until it opens, then makes the page inert', () => {
    render(
      <NavbarPushMenu links={LINKS}>
        <p>Page body</p>
      </NavbarPushMenu>
    );

    const menu = menuOf(toggle());
    const page = screen.getByText('Page body').parentElement;
    expect(menu).toHaveAttribute('inert');
    expect(page).not.toHaveAttribute('inert');

    fireEvent.click(toggle());

    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(toggle()).toHaveAccessibleName('Close menu');
    expect(menu).not.toHaveAttribute('inert');
    expect(page).toHaveAttribute('inert');
  });

  it('lists every link in order inside the main nav', () => {
    render(<NavbarPushMenu links={LINKS} />);
    fireEvent.click(toggle());

    const nav = screen.getByRole('navigation', { name: 'Main' });
    const anchors = [...nav.querySelectorAll('a')];
    expect(anchors.map((anchor) => anchor.getAttribute('href'))).toEqual([
      '/',
      '/work',
      'https://example.com/journal',
    ]);
    expect(anchors[2]).toHaveAttribute('target', '_blank');
    expect(anchors[2]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('marks the current page and closes instead of navigating to it', () => {
    render(<NavbarPushMenu links={LINKS} currentHref="/work/" />);
    fireEvent.click(toggle());

    const current = screen.getByRole('link', { name: /work/i });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /home/i })).not.toHaveAttribute('aria-current');

    const allowed = fireEvent.click(current);

    expect(allowed).toBe(false);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and hands focus back to the toggle', () => {
    render(<NavbarPushMenu links={LINKS} />);
    fireEvent.click(toggle());

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveFocus();
  });

  it('renders the sample page when no children are passed', () => {
    render(<NavbarPushMenu links={LINKS} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /the page steps back/i })
    ).toBeInTheDocument();
  });
});
