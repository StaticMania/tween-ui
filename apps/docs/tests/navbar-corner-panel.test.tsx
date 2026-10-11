import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavbarCornerPanel, {
  type NavbarCornerPanelLink,
} from '@/registry/tweenui/navbar-corner-panel';

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

const LINKS: NavbarCornerPanelLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Contact', href: '/contact' },
];

const toggle = () => screen.getByRole('button', { name: /^(open|close) menu$/i });

const panelOf = (button: HTMLElement) => {
  const id = button.getAttribute('aria-controls');
  return id ? document.getElementById(id) : null;
};

describe('Navbar Corner Panel', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('is a region named after the brand, with a header and a closed toggle', () => {
    render(<NavbarCornerPanel brand="Atelier" links={LINKS} />);

    expect(screen.getByRole('region', { name: 'Atelier site' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Atelier home' })).toHaveAttribute('href', '/');
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveAccessibleName('Open menu');
  });

  it('swaps which side is inert when the panel opens', () => {
    render(
      <NavbarCornerPanel links={LINKS}>
        <p>Page body</p>
      </NavbarCornerPanel>
    );

    const panel = panelOf(toggle());
    const page = screen.getByText('Page body').parentElement;
    expect(panel).toHaveAttribute('inert');
    expect(page).not.toHaveAttribute('inert');

    fireEvent.click(toggle());

    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(toggle()).toHaveAccessibleName('Close menu');
    expect(panel).not.toHaveAttribute('inert');
    expect(page).toHaveAttribute('inert');
  });

  it('lists the links and socials in the primary nav', () => {
    render(
      <NavbarCornerPanel
        links={LINKS}
        socials={[{ label: 'LinkedIn', href: 'https://linkedin.com/company/atelier' }]}
      />
    );
    fireEvent.click(toggle());

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
    ).toEqual(['/', '/work', '/contact', 'https://linkedin.com/company/atelier']);
    expect(within(nav).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('target', '_blank');
  });

  it('marks the current page and closes instead of navigating to it', () => {
    render(<NavbarCornerPanel links={LINKS} currentHref="/work/" />);
    fireEvent.click(toggle());

    const current = screen.getByRole('link', { name: 'Work' });
    expect(current).toHaveAttribute('aria-current', 'page');

    const allowed = fireEvent.click(current);

    expect(allowed).toBe(false);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape and hands focus back to the toggle', () => {
    render(<NavbarCornerPanel links={LINKS} />);
    fireEvent.click(toggle());

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveFocus();
  });

  it('renders the sample hero when no children are passed', () => {
    render(<NavbarCornerPanel links={LINKS} />);

    expect(
      screen.getByRole('heading', { level: 2, name: /everything waits in the corner/i })
    ).toBeInTheDocument();
  });
});
