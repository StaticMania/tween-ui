import { fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ShutterSlider, { type ShutterSlide } from '@/registry/tweenui/shutter-slider';

const SLIDES: ShutterSlide[] = [
  {
    heading: 'Light first',
    image: 'https://example.com/a.jpg',
    imageAlt: 'A sunny house',
    description: 'Planned around the sun.',
    caption: 'Designed around daylight',
  },
  {
    heading: 'Room to breathe',
    image: 'https://example.com/b.jpg',
    description: 'Open plans and tall ceilings.',
    caption: 'Space that adapts',
  },
  {
    heading: 'Built to last',
    image: 'https://example.com/c.jpg',
    description: 'Stone, timber and lime.',
  },
];

// SplitText needs real layout; reduced motion skips splitting and all tweens in jsdom.
const setMedia = ({ reduce = true, hover = true } = {}) => {
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

const slidesOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-shutter-slide]'));

/** The last span is the settled number; an outgoing one may still be rolling away. */
const counter = (container: HTMLElement, which: 'current' | 'next') =>
  container.querySelector(`[data-shutter-count="${which}"]`)?.lastElementChild?.textContent;

describe('Shutter Slider', () => {
  beforeEach(() => setMedia());
  afterEach(() => vi.restoreAllMocks());

  it('renders a labelled carousel with one labelled group per slide', () => {
    render(<ShutterSlider slides={SLIDES} aria-label="Why us" />);

    expect(screen.getByRole('region', { name: 'Why us' })).toHaveAttribute(
      'aria-roledescription',
      'carousel'
    );
    const groups = screen.getAllByRole('group', { hidden: true });
    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveAccessibleName('1 of 3');
    // Inactive slides are hidden, so they have no accessible name until shown.
    expect(groups[2]).toHaveAttribute('aria-label', '3 of 3');
  });

  it('renders every slide’s heading, copy and optional caption', () => {
    const { container } = render(<ShutterSlider slides={SLIDES} />);
    const [first, , last] = slidesOf(container);

    expect(first).toHaveTextContent('Light first');
    expect(first).toHaveTextContent('Planned around the sun.');
    expect(first.querySelector('[data-shutter-caption]')).toHaveTextContent(
      'Designed around daylight'
    );
    expect(last.querySelector('[data-shutter-caption]')).toBeNull();
  });

  it('gives the base image its alt text and hides the shutter slats', () => {
    const { container } = render(<ShutterSlider slides={SLIDES} />);
    const [first] = slidesOf(container);

    expect(first.querySelector('[data-shutter-base]')).toHaveAttribute('alt', 'A sunny house');
    const shutter = first.querySelector('[data-shutter-slats]')!;
    expect(shutter).toHaveAttribute('aria-hidden', 'true');
    expect(shutter.querySelectorAll('[data-shutter-slat]')).toHaveLength(6);
  });

  it('shows only the first slide and numbers the pagination', () => {
    const { container } = render(<ShutterSlider slides={SLIDES} />);
    const [first, second, third] = slidesOf(container);

    expect(first.style.visibility).toBe('visible');
    expect(second.style.visibility).toBe('hidden');
    expect(third.style.visibility).toBe('hidden');
    expect(counter(container, 'current')).toBe('01');
    expect(counter(container, 'next')).toBe('02');
  });

  it('steps forward and back with the buttons, wrapping at the ends', () => {
    const { container } = render(<ShutterSlider slides={SLIDES} />);
    const slides = slidesOf(container);
    const root = container.querySelector('[data-shutter-slider]')!;

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(root).toHaveAttribute('data-index', '1');
    expect(slides[1].style.visibility).toBe('visible');
    expect(slides[0].style.visibility).toBe('hidden');
    expect(counter(container, 'current')).toBe('02');
    expect(counter(container, 'next')).toBe('03');

    fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(root).toHaveAttribute('data-index', '2');
    expect(slides[2].style.visibility).toBe('visible');
    expect(counter(container, 'current')).toBe('03');
    expect(counter(container, 'next')).toBe('01');
  });

  it('steps with the arrow keys', () => {
    const { container } = render(<ShutterSlider slides={SLIDES} />);
    const root = container.querySelector<HTMLElement>('[data-shutter-slider]')!;

    fireEvent.keyDown(root, { key: 'ArrowRight' });
    expect(root).toHaveAttribute('data-index', '1');
    fireEvent.keyDown(root, { key: 'ArrowLeft' });
    expect(root).toHaveAttribute('data-index', '0');
  });

  it('swaps instantly and never autoplays under reduced motion', () => {
    const timeline = vi.spyOn(gsap, 'timeline');
    const fromTo = vi.spyOn(gsap, 'fromTo');
    render(<ShutterSlider slides={SLIDES} autoplay={2} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(timeline).not.toHaveBeenCalled();
    expect(fromTo).not.toHaveBeenCalled();
  });

  it('hides the pagination for a single slide', () => {
    render(<ShutterSlider slides={SLIDES.slice(0, 1)} />);
    expect(
      screen.getByRole('button', { name: 'Next slide', hidden: true }).parentElement
    ).toHaveClass('hidden');
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<ShutterSlider slides={SLIDES} className="mt-10" />);
    expect(container.querySelector('[data-shutter-slider]')).toHaveClass('mt-10');
  });
});
