import { fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GyroGallery, { type GyroItem } from '@/registry/tweenui/gyro-gallery';

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

const make = (title: string, href?: string): GyroItem => ({
  title,
  kind: 'Project',
  image: `/${title}.jpg`,
  href,
});

const THREE = [make('Ana', '/work/ana'), make('Ben', '/work/ben'), make('Cleo')];

describe('Gyro Gallery', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('is a region named by its title', () => {
    render(<GyroGallery title="Selected work." />);

    expect(screen.getByRole('region', { name: 'Selected work.' })).toBeInTheDocument();
  });

  it('fills three orbits with 24 tiles, repeating the items in order', () => {
    const { container } = render(<GyroGallery items={THREE} />);

    const tiles = [...container.querySelectorAll('[data-gyro-tile] img')];
    expect(tiles).toHaveLength(24);
    expect(tiles.slice(0, 4).map((img) => img.getAttribute('src'))).toEqual([
      '/Ana.jpg',
      '/Ben.jpg',
      '/Cleo.jpg',
      '/Ana.jpg',
    ]);
  });

  it('keeps the moving rig out of the accessibility tree and the tab order', () => {
    const { container } = render(<GyroGallery items={THREE} />);

    const tile = container.querySelector('a[data-gyro-tile]');
    expect(tile?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(tile).toHaveAttribute('tabindex', '-1');
  });

  it('lists every piece once as a reachable link, outside the rig', () => {
    render(<GyroGallery items={THREE} />);

    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/work/ana',
      '/work/ben',
    ]);
    expect(screen.getByText('Cleo', { selector: 'li' })).toBeInTheDocument();
  });

  it('defaults to the Tween UI archive, linking each piece to its page', () => {
    render(<GyroGallery />);

    expect(screen.getByRole('link', { name: 'Shutter Slider' })).toHaveAttribute(
      'href',
      'https://tween-ui.vercel.app/block/shutter-slider'
    );
    expect(screen.getByText('pieces in orbit')).toBeInTheDocument();
  });

  // jsdom has no layout, so every tile sits at the centre and the first one is nearest
  const point = (stage: Element, type: string, pointerType = 'mouse', x = 20) => {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: 0 });
    Object.defineProperty(event, 'pointerType', { value: pointerType });
    fireEvent(stage, event);
    return event;
  };
  const stageOf = (container: HTMLElement) =>
    container.querySelector('[data-gyro-tile]')!.parentElement!;

  it('focuses the piece nearest the pointer, no exact hit needed, and lets it go', () => {
    const { container } = render(<GyroGallery items={THREE} />);
    const stage = stageOf(container);

    point(stage, 'pointermove');
    expect(container.querySelector('[data-focused]')).toBe(
      container.querySelector('[data-gyro-tile]')
    );
    expect(screen.getByText('Ana', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Click to open')).toBeInTheDocument();
    expect(screen.getByText('Ana, Project', { selector: 'p' })).toBeInTheDocument();

    point(stage, 'pointerleave');
    expect(container.querySelector('[data-focused]')).toBeNull();
  });

  it('ignores a pointer too far from every piece', () => {
    const { container } = render(<GyroGallery items={THREE} />);

    point(stageOf(container), 'pointermove', 'mouse', 400);
    expect(container.querySelector('[data-focused]')).toBeNull();
  });

  it('lifts the focused piece to the top and softens the rest, even with motion reduced', () => {
    const { container } = render(<GyroGallery items={THREE} />);
    const [first, second] = container.querySelectorAll<HTMLElement>('[data-gyro-tile]');

    point(stageOf(container), 'pointermove');
    expect(first!.style.zIndex).toBe('5000');
    expect(first!.style.opacity).toBe('1');
    expect(Number(second!.style.opacity)).toBeLessThan(0.46);
  });

  it('only brings a piece forward on the first tap of a finger, without opening it', () => {
    const { container } = render(<GyroGallery items={THREE} />);
    const stage = stageOf(container);

    point(stage, 'pointerdown', 'touch');
    expect(container.querySelector('[data-focused]')).not.toBeNull();

    const click = point(stage, 'click', 'touch');
    expect(click.defaultPrevented).toBe(true);
  });

  it('draws still orbits under reduced motion: no intro, no frame loop', () => {
    const timeline = vi.spyOn(gsap, 'timeline');
    const ticker = vi.spyOn(gsap.ticker, 'add');
    const { container } = render(<GyroGallery items={THREE} />);

    expect(timeline).not.toHaveBeenCalled();
    expect(ticker).not.toHaveBeenCalled();
    expect(container.querySelector<HTMLElement>('[data-gyro-tile]')?.style.transform).toContain(
      'scale('
    );
  });

  it('builds the spiral-out intro when motion is allowed', () => {
    setReducedMotion(false);
    const timeline = vi.spyOn(gsap, 'timeline');
    render(<GyroGallery items={THREE} />);

    expect(timeline).toHaveBeenCalledTimes(1);
  });
});
