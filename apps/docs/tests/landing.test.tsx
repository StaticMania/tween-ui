import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlockSpotlight } from '@/components/landing/block-spotlight';
import { Cta } from '@/components/landing/cta';
import { Hero } from '@/components/landing/hero';
import { LiveRow } from '@/components/landing/live-row';
import { Preloader } from '@/components/landing/preloader';
import { Showcase } from '@/components/landing/showcase';
import { SHOWCASE_NAMES } from '@/components/landing/showcase-previews';
import { Why } from '@/components/landing/why';
import { registry } from '@/lib/registry';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/',
}));

vi.mock('docora', () => ({
  useDocsConfig: () => ({
    site: { name: 'Tween UI', url: 'https://tweenui.dev' },
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
      screen.getByText(
        `${COMPONENT_COUNT} components · ${BLOCK_COUNT} blocks · React 19 + Tailwind v4`
      )
    ).toBeInTheDocument();
  });

  it('keeps the install command and GitHub out of the hero', () => {
    renderHero();
    expect(screen.queryByText(/npx shadcn/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument();
  });

  it('routes both registry buttons to the gallery', () => {
    renderHero();
    fireEvent.click(screen.getByRole('button', { name: /browse components/i }));
    expect(push).toHaveBeenCalledWith('/components');

    fireEvent.click(screen.getByRole('button', { name: /browse blocks/i }));
    expect(push).toHaveBeenCalledWith('/components#blocks');
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

  it('frames the real hero-tab-wipe block beside links to the others', () => {
    render(<BlockSpotlight />);
    expect(screen.getByRole('tablist', { name: /choose a screen/i })).toBeInTheDocument();

    const otherBlocks = registry.filter(
      (entry) => entry.type === 'block' && entry.name !== 'hero-tab-wipe'
    );
    const firstChip = otherBlocks[0];
    if (!firstChip) throw new Error('registry has no blocks besides the featured one');
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
    expect(
      screen.getByText('npx shadcn@latest add https://tweenui.dev/r/icon-trail-button.json')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /browse components/i }));
    expect(push).toHaveBeenCalledWith('/components');

    fireEvent.click(screen.getByRole('button', { name: /browse blocks/i }));
    expect(push).toHaveBeenCalledWith('/components#blocks');
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
