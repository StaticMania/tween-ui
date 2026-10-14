import { act, fireEvent, render, screen } from '@testing-library/react';
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

const announced = () => document.querySelector('[aria-live="polite"]')?.textContent;

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

  it('places the cards on the arc before any interaction', () => {
    const { container } = render(<ArcCarousel items={ITEMS} />);
    const slides = container.querySelectorAll<HTMLElement>('[aria-roledescription="slide"]');

    expect(slides[0].style.transform).toBe('translate(0px, 0px) rotate(0deg)');
    expect(slides[1].style.transform).toBe('translate(359px, 26px) rotate(8.77deg)');
    expect(slides[7].style.transform).toBe('translate(-359px, 26px) rotate(-8.77deg)');
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
});
