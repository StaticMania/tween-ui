import { act, fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ArcCarousel, { type ArcCarouselItem } from '@/registry/tweenui/arc-carousel';

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

const make = (title: string): ArcCarouselItem => ({
  title,
  tag: 'Project',
  image: `/${title}.jpg`,
  href: `/work/${title.toLowerCase()}`,
});

const ITEMS = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay', 'Gus', 'Hal'].map(make);

const announced = () => document.querySelector('[aria-live]')?.textContent;

describe('Arc Carousel', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('names the carousel after its title', () => {
    render(<ArcCarousel items={ITEMS} title="Selected work" />);

    expect(screen.getByRole('heading', { name: 'Selected work' })).toBeInTheDocument();
    const carousel = screen.getByRole('group', { name: 'Selected work' });
    expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('only exposes the centre card', () => {
    render(<ArcCarousel items={ITEMS} />);

    const links = screen.getAllByRole('link').filter((link) => link.closest('[data-active]'));
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/work/ana');
    expect(screen.getByRole('group', { name: '1 of 8: Ana' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: '2 of 8: Ben' })).not.toBeInTheDocument();
  });

  it('steps with the arrows and wraps round', () => {
    render(<ArcCarousel items={ITEMS} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next project' }));
    expect(announced()).toBe('2 of 8: Ben');

    fireEvent.click(screen.getByRole('button', { name: 'Previous project' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous project' }));
    expect(announced()).toBe('8 of 8: Hal');
  });

  it('steps with the arrow keys', () => {
    render(<ArcCarousel items={ITEMS} title="Work" />);
    const carousel = screen.getByRole('group', { name: 'Work' });

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(announced()).toBe('3 of 8: Cleo');

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    expect(announced()).toBe('2 of 8: Ben');
  });

  it('brings a clicked side card to the centre instead of following it', () => {
    const { container } = render(<ArcCarousel items={ITEMS} />);
    const side = container.querySelector<HTMLAnchorElement>('a[href="/work/ben"]')!;

    const click = new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 });
    act(() => {
      side.dispatchEvent(click);
    });

    expect(click.defaultPrevented).toBe(true);
    expect(announced()).toBe('2 of 8: Ben');
  });

  it('places the cards on the arc in the markup, before GSAP takes over', () => {
    // With motion on, GSAP's first frame is async, so this reads the server-rendered layout
    setReducedMotion(false);
    const { container } = render(<ArcCarousel items={ITEMS} />);
    const slides = container.querySelectorAll<HTMLElement>('[aria-roledescription="slide"]');

    expect(slides[0].style.transform).toBe('translate(0px, 0px) rotate(0deg) scale(1.05)');
    expect(slides[1].style.transform).toBe('translate(359px, 26px) rotate(8.77deg) scale(1)');
    expect(slides[7].style.transform).toBe('translate(-359px, 26px) rotate(-8.77deg) scale(1)');
    // Four out is past the last slot, so it waits off-screen
    expect(slides[4].style.opacity).toBe('0');
  });

  it('describes the section with its description, or drops it', () => {
    const { rerender } = render(<ArcCarousel items={ITEMS} description="Recent launches." />);
    expect(screen.getByRole('region')).toHaveAccessibleDescription('Recent launches.');

    rerender(<ArcCarousel items={ITEMS} description="" />);
    expect(screen.queryByText('Recent launches.')).not.toBeInTheDocument();
  });

  it('drops the badge and the button when asked', () => {
    render(<ArcCarousel items={ITEMS} badge="" cta={null} />);

    expect(screen.queryByText('Featured work')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View all projects' })).not.toBeInTheDocument();
  });

  describe('autoplay', () => {
    // GSAP keeps its own clock: unhook it from the ticker and step it by hand
    let now = 0;
    beforeEach(() => {
      setReducedMotion(false);
      gsap.ticker.remove(gsap.updateRoot);
      now = gsap.ticker.time;
    });
    afterEach(() => {
      gsap.ticker.add(gsap.updateRoot);
    });

    const wait = (ms: number) =>
      act(() => {
        now += ms / 1000;
        gsap.updateRoot(now);
      });

    it('is on by default', () => {
      render(<ArcCarousel items={ITEMS} />);

      expect(screen.getByRole('button', { name: 'Pause autoplay' })).toBeInTheDocument();
      wait(5100);
      expect(announced()).toBe('2 of 8: Ben');
    });

    it('turns off with autoplay={false}, dropping the pause button', () => {
      render(<ArcCarousel items={ITEMS} autoplay={false} />);

      expect(screen.queryByRole('button', { name: /autoplay/ })).not.toBeInTheDocument();
      wait(20000);
      expect(announced()).toBe('1 of 8: Ana');
    });

    it('steps on its own every interval', () => {
      render(<ArcCarousel items={ITEMS} autoplay interval={2000} />);

      wait(2100);
      expect(announced()).toBe('2 of 8: Ben');
      wait(2000);
      expect(announced()).toBe('3 of 8: Cleo');
    });

    it('fills the progress ring over the interval', () => {
      const { container } = render(<ArcCarousel items={ITEMS} autoplay interval={2000} />);
      const ring = container.querySelector('button[aria-label="Pause autoplay"] circle')!;
      const offset = () => Number(ring.getAttribute('stroke-dashoffset'));

      wait(10);
      expect(offset()).toBeGreaterThan(0.95);
      wait(1000);
      expect(offset()).toBeCloseTo(0.5, 1);
    });

    it('keeps the announcement quiet while it plays itself', () => {
      render(<ArcCarousel items={ITEMS} autoplay />);
      const live = () => document.querySelector('[aria-live]')!.getAttribute('aria-live');

      expect(live()).toBe('off');
      fireEvent.click(screen.getByRole('button', { name: 'Pause autoplay' }));
      expect(live()).toBe('polite');
    });

    it('stops and starts from the pause button', () => {
      render(<ArcCarousel items={ITEMS} autoplay interval={2000} />);

      fireEvent.click(screen.getByRole('button', { name: 'Pause autoplay' }));
      wait(6000);
      expect(announced()).toBe('1 of 8: Ana');

      fireEvent.click(screen.getByRole('button', { name: 'Start autoplay' }));
      wait(2100);
      expect(announced()).toBe('2 of 8: Ben');
    });

    it('holds while the mouse rests on the cards', () => {
      render(<ArcCarousel items={ITEMS} title="Work" autoplay interval={2000} />);
      const stage = screen.getByRole('group', { name: 'Work' }).parentElement!.parentElement!;

      fireEvent.pointerEnter(stage, { pointerType: 'mouse' });
      wait(6000);
      expect(announced()).toBe('1 of 8: Ana');

      fireEvent.pointerLeave(stage, { pointerType: 'mouse' });
      wait(2100);
      expect(announced()).toBe('2 of 8: Ben');
    });

    it('starts paused for viewers who prefer reduced motion', () => {
      setReducedMotion(true);
      render(<ArcCarousel items={ITEMS} autoplay interval={2000} />);

      expect(screen.getByRole('button', { name: 'Start autoplay' })).toBeInTheDocument();
      wait(6000);
      expect(announced()).toBe('1 of 8: Ana');
    });
  });
});
