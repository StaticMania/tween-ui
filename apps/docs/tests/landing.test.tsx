import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlockSpotlight } from '@/components/landing/block-spotlight';
import { Cta } from '@/components/landing/cta';
import { Hero } from '@/components/landing/hero';
import { LiveRow } from '@/components/landing/live-row';
import { Preloader } from '@/components/landing/preloader';
import { Showcase } from '@/components/landing/showcase';
import { SHOWCASE_NAMES } from '@/components/landing/showcase-previews';
import { Why } from '@/components/landing/why';
import { LandingHeader } from '@/components/layout/landing-header';
import { registry } from '@/lib/registry';

const push = vi.fn();
const { setSearchOpen } = vi.hoisted(() => ({ setSearchOpen: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/',
}));

vi.mock('docora', () => ({
  SearchButton: ({ className }: { className?: string }) => (
    <button type="button" className={className}>
      Search
    </button>
  ),
  ThemeToggle: () => null,
  useSearch: () => ({ setOpen: setSearchOpen }),
  useDocsConfig: () => ({
    site: { name: 'Tween UI', url: 'https://tween-ui.vercel.app' },
    github: { url: 'https://github.com/StaticMania/tween-ui' },
  }),
}));

const COMPONENT_COUNT = registry.filter((entry) => entry.type === 'component').length;
const BLOCK_COUNT = registry.filter((entry) => entry.type === 'block').length;

const renderHero = () => render(<Hero componentCount={COMPONENT_COUNT} blockCount={BLOCK_COUNT} />);

describe('landing hero', () => {
  it('renders the page heading as readable text', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Copy the source.Own the animation.'
    );
  });

  it('states the live registry counts in the badge', () => {
    renderHero();
    expect(
      screen.getByText(`${COMPONENT_COUNT} components · ${BLOCK_COUNT} blocks`, { exact: false })
    ).toHaveTextContent(
      `${COMPONENT_COUNT} components · ${BLOCK_COUNT} blocks · React 19 + Tailwind v4`
    );
  });

  it('keeps the install command and GitHub out of the hero', () => {
    renderHero();
    expect(screen.queryByText(/npx shadcn/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument();
  });

  it('links both registry buttons to the gallery', () => {
    renderHero();
    expect(screen.getByRole('link', { name: /browse components/i })).toHaveAttribute(
      'href',
      '/components'
    );

    expect(screen.getByRole('link', { name: /browse blocks/i })).toHaveAttribute(
      'href',
      '/components#blocks'
    );
  });

  it('replays the timeline without throwing', () => {
    renderHero();
    expect(() => fireEvent.click(screen.getByRole('button', { name: /replay/i }))).not.toThrow();
  });
});

describe('landing sections', () => {
  it('links each live component to its own page', () => {
    render(<LiveRow />);
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items).toHaveLength(4);
    for (const name of ['icon-trail-button', 'text-roll-button', 'glow-button', 'shiny-button']) {
      expect(screen.getByRole('link', { name: new RegExp(name) })).toHaveAttribute(
        'href',
        `/component/${name}`
      );
    }
  });

  it('lists three reasons on the timeline', () => {
    render(<Why />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('0.8s')).toBeInTheDocument();
  });

  it('links every showcase card to its registry page', () => {
    render(<Showcase componentCount={COMPONENT_COUNT} />);
    for (const name of SHOWCASE_NAMES) {
      const entry = registry.find((item) => item.name === name);
      if (!entry) throw new Error(`missing registry entry: ${name}`);
      expect(screen.getByRole('link', { name: new RegExp(entry.title) })).toHaveAttribute(
        'href',
        `/component/${name}`
      );
    }
    expect(screen.getByRole('link', { name: /all components/i })).toHaveAttribute(
      'href',
      '/components'
    );
  });

  it('previews four blocks beside links to the others', () => {
    const featured = ['tab-wipe', 'pricing-plan-switch', 'rating-carousel', 'cta-starfall'];
    render(<BlockSpotlight />);

    for (const name of featured) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', `/block/${name}`);
    }

    const firstChip = registry.find(
      (entry) => entry.type === 'block' && !featured.includes(entry.name)
    );
    if (!firstChip) throw new Error('registry has no blocks besides the featured ones');
    expect(screen.getByRole('link', { name: firstChip.name })).toHaveAttribute(
      'href',
      `/block/${firstChip.name}`
    );
    expect(screen.getByRole('link', { name: /more/ })).toHaveAttribute(
      'href',
      '/components#blocks'
    );
  });

  it('carries the install command and routes to the gallery', () => {
    render(<Cta />);
    expect(screen.getByText('npx shadcn@latest add @tween-ui/tab-wipe')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse components/i })).toHaveAttribute(
      'href',
      '/components'
    );

    expect(screen.getByRole('link', { name: /browse blocks/i })).toHaveAttribute(
      'href',
      '/components#blocks'
    );
  });
});

describe('preloader', () => {
  afterEach(() => {
    window.sessionStorage.clear();
    document.body.style.overflow = '';
  });

  it('paints the overlay in the markup so it covers the first frame', () => {
    const { container } = render(<Preloader />);
    expect(container.querySelector('[data-preloader]')).not.toBeNull();
  });

  it('locks scrolling only while the intro is playing', () => {
    const { unmount } = render(<Preloader />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('skips straight past the intro once it has played this session', () => {
    render(<Preloader />).unmount();

    const { container } = render(<Preloader />);
    const overlay = container.querySelector<HTMLElement>('[data-preloader]');
    expect(overlay?.style.display).toBe('none');
    expect(document.body.style.overflow).toBe('');
  });
});

describe('landing header', () => {
  it('starts as the full header and keeps the pill search out of reach', () => {
    const { container } = render(<LandingHeader starCount={null} />);
    expect(container.querySelector('header')).toHaveAttribute('data-scrolled', 'false');
    expect(screen.getByRole('button', { name: 'Open search' }).closest('[inert]')).not.toBeNull();
    expect(screen.getByRole('link', { name: /github/i }).closest('[inert]')).toBeNull();
  });

  it('swaps to the logo and search pill once the page scrolls', () => {
    let notify: IntersectionObserverCallback = () => {};
    const observe = vi.fn();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          notify = callback;
        }
        observe = observe;
        disconnect = vi.fn();
      }
    );

    const { container } = render(<LandingHeader starCount={null} />);
    expect(observe).toHaveBeenCalledOnce();
    act(() =>
      notify([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver)
    );

    expect(container.querySelector('header')).toHaveAttribute('data-scrolled', 'true');
    const pillSearch = screen.getByRole('button', { name: 'Open search' });
    expect(pillSearch.closest('[inert]')).toBeNull();
    fireEvent.click(pillSearch);
    expect(setSearchOpen).toHaveBeenCalledWith(true);
    expect(screen.getByRole('link', { name: /github/i }).closest('[inert]')).not.toBeNull();
    vi.unstubAllGlobals();
  });
});
