import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavbarGooeyBloom, { type NavbarGooeyBloomMenu } from '@/registry/tweenui/navbar-gooey-bloom';

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

const MENUS: NavbarGooeyBloomMenu[] = [
  {
    label: 'Work',
    columns: [
      [
        {
          label: 'Case studies',
          href: '/work/case-studies',
          description: 'Shipped products, start to finish.',
        },
      ],
    ],
  },
  {
    label: 'Components',
    columns: [[{ label: 'Navbars', href: '/components/navbars' }]],
  },
  {
    label: 'Studio',
    columns: [[{ label: 'About', href: '/studio/about' }]],
  },
  { label: 'Journal', href: '/journal' },
];

const toggle = () =>
  screen
    .getAllByRole('button', { name: /menu/i })
    .find((node) => node.hasAttribute('aria-controls'))!;
const trigger = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}$`) });

const panelOf = (button: HTMLElement) => {
  const id = button.getAttribute('aria-controls');
  return id ? document.getElementById(id) : null;
};

const sectionFor = (panel: HTMLElement, label: string) =>
  within(panel)
    .getByRole('link', { name: new RegExp(`^${label}`) })
    .closest('[inert]');

describe('Navbar Gooey Bloom', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('is a region named after the brand, with a header and a closed toggle', () => {
    render(<NavbarGooeyBloom brand="Kairo" menus={MENUS} />);

    expect(screen.getByRole('region', { name: 'Kairo site' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveAccessibleName('Open menu');
  });

  it('shares one panel between every menu and leaves plain links alone', () => {
    render(<NavbarGooeyBloom menus={MENUS} />);

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    const panel = panelOf(trigger('Work'));

    expect(panel).not.toBeNull();
    for (const label of ['Work', 'Components', 'Studio']) {
      expect(panelOf(trigger(label))).toBe(panel);
      expect(trigger(label)).toHaveAttribute('aria-expanded', 'false');
    }
    expect(within(nav).getByRole('link', { name: 'Journal' })).toHaveAttribute('href', '/journal');
    expect(panel).toHaveAttribute('inert');
  });

  it('opens a menu on focus and keeps the other sections inert', () => {
    render(<NavbarGooeyBloom menus={MENUS} />);

    fireEvent.focus(trigger('Work'));
    const panel = panelOf(trigger('Work'))!;

    expect(trigger('Work')).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveAttribute('inert');
    expect(sectionFor(panel, 'Case studies')).toBeNull();
    expect(sectionFor(panel, 'Navbars')).not.toBeNull();
    expect(sectionFor(panel, 'About')).not.toBeNull();
  });

  it('hands the panel to the next menu without remounting it', () => {
    render(<NavbarGooeyBloom menus={MENUS} />);

    fireEvent.focus(trigger('Work'));
    const panel = panelOf(trigger('Work'))!;

    fireEvent.focus(trigger('Components'));

    expect(trigger('Work')).toHaveAttribute('aria-expanded', 'false');
    expect(trigger('Components')).toHaveAttribute('aria-expanded', 'true');
    expect(panelOf(trigger('Components'))).toBe(panel);
    expect(sectionFor(panel, 'Case studies')).not.toBeNull();
    expect(sectionFor(panel, 'Navbars')).toBeNull();
  });

  it('closes on Escape and hands focus back to the trigger', () => {
    render(<NavbarGooeyBloom menus={MENUS} />);

    fireEvent.focus(trigger('Work'));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(trigger('Work')).toHaveAttribute('aria-expanded', 'false');
    expect(trigger('Work')).toHaveFocus();
    expect(panelOf(trigger('Work'))).toHaveAttribute('inert');
  });

  it('closes an open menu when a plain link takes the highlight', () => {
    render(<NavbarGooeyBloom menus={MENUS} />);

    fireEvent.focus(trigger('Work'));
    fireEvent.focus(screen.getByRole('link', { name: 'Journal' }));

    expect(trigger('Work')).toHaveAttribute('aria-expanded', 'false');
    expect(panelOf(trigger('Work'))).toHaveAttribute('inert');
  });

  it('keeps the ink copy of each label out of the accessible name', () => {
    render(<NavbarGooeyBloom menus={MENUS} />);

    const work = trigger('Work');
    expect(work).toHaveAccessibleName('Work');
    const ink = [...work.querySelectorAll('[aria-hidden="true"]')].find(
      (node) => node.textContent === 'Work'
    );
    expect(ink).toBeDefined();
  });

  it('marks the current page, including nested paths', () => {
    render(<NavbarGooeyBloom menus={MENUS} currentHref="/journal/first-post" />);

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'Journal' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('folds into a sheet with an accordion under the mobile toggle', () => {
    render(<NavbarGooeyBloom menus={MENUS} />);

    fireEvent.click(toggle());
    const sheet = document.getElementById(toggle().getAttribute('aria-controls')!);

    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(sheet).not.toHaveAttribute('inert');

    const accordion = within(sheet!).getByRole('button', { name: 'Work' });
    expect(accordion).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(accordion);
    const content = document.getElementById(accordion.getAttribute('aria-controls')!);

    expect(accordion).toHaveAttribute('aria-expanded', 'true');
    expect(content).not.toHaveAttribute('inert');
    expect(within(content!).getByRole('link', { name: 'Case studies' })).toHaveAttribute(
      'href',
      '/work/case-studies'
    );
  });

  it('closes the mobile sheet on Escape and returns to the toggle', () => {
    render(<NavbarGooeyBloom menus={MENUS} />);

    fireEvent.click(toggle());
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveFocus();
  });

  it('renders the sample page when no children are passed', () => {
    render(<NavbarGooeyBloom />);

    expect(
      screen.getByRole('heading', { level: 2, name: /menu that melts between links/i })
    ).toBeInTheDocument();
  });
});
