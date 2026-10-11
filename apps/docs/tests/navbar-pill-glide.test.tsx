import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavbarPillGlide, { type NavbarPillGlideLink } from '@/registry/tweenui/navbar-pill-glide';

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

const LINKS: NavbarPillGlideLink[] = [
  { label: 'Home', href: '/', image: '/home.jpg' },
  { label: 'Pricing', href: '/pricing', image: '/pricing.jpg' },
  { label: 'Journal', href: '/journal' },
];

const toggle = () => screen.getByRole('button', { name: /menu/i });

const menuOf = (button: HTMLElement) => {
  const id = button.getAttribute('aria-controls');
  return id ? document.getElementById(id) : null;
};

describe('Navbar Pill Glide', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('is a region named after the brand, with a header and a closed toggle', () => {
    render(<NavbarPillGlide brand="Kairo" links={LINKS} />);

    expect(screen.getByRole('region', { name: 'Kairo site' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveAccessibleName('Open menu');
  });

  it('keeps home out of the pill and marks nested paths as current', () => {
    render(<NavbarPillGlide links={LINKS} currentHref="/journal/first-post" />);

    const pill = screen.getByRole('navigation', { name: 'Primary' });
    const anchors = within(pill).getAllByRole('link');
    expect(anchors.map((anchor) => anchor.getAttribute('href'))).toEqual(['/pricing', '/journal']);
    expect(within(pill).getByRole('link', { name: 'Journal' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(pill).getByRole('link', { name: 'Pricing' })).not.toHaveAttribute('aria-current');
  });

  it('shows both actions, opening external ones in a new tab', () => {
    render(
      <NavbarPillGlide
        links={LINKS}
        primaryAction={{ label: 'Start free', href: '/signup' }}
        secondaryAction={{ label: 'Docs', href: 'https://example.com/docs' }}
      />
    );

    expect(screen.getByRole('link', { name: 'Start free' })).toHaveAttribute('href', '/signup');
    const docs = screen.getByRole('link', { name: 'Docs' });
    expect(docs).toHaveAttribute('target', '_blank');
    expect(docs).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('swaps which side is inert when the menu opens', () => {
    render(
      <NavbarPillGlide links={LINKS}>
        <p>Page body</p>
      </NavbarPillGlide>
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

  it('lists every link, home included, in the menu with socials and email', () => {
    render(
      <NavbarPillGlide
        brand="Kairo"
        links={LINKS}
        email="hello@kairo.studio"
        socials={[{ label: 'X', href: 'https://x.com/kairo', icon: 'x' }]}
      />
    );
    fireEvent.click(toggle());

    const menu = screen.getByRole('navigation', { name: 'Menu' });
    expect(within(menu).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(menu).getAllByRole('link', { name: /^(Home|Pricing|Journal)$/ })).toHaveLength(3);
    expect(within(menu).getByRole('link', { name: 'Kairo on X' })).toHaveAttribute(
      'href',
      'https://x.com/kairo'
    );
    expect(within(menu).getByRole('link', { name: 'hello@kairo.studio' })).toHaveAttribute(
      'href',
      'mailto:hello@kairo.studio'
    );
  });

  it('closes on Escape and hands focus back to the toggle', () => {
    render(<NavbarPillGlide links={LINKS} />);
    fireEvent.click(toggle());

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveFocus();
  });

  it('renders the sample hero when no children are passed', () => {
    render(<NavbarPillGlide links={LINKS} />);

    expect(screen.getByRole('heading', { level: 2, name: /point at a link/i })).toBeInTheDocument();
  });
});
