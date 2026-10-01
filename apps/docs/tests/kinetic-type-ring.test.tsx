import { fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import KineticTypeRing from '@/registry/tweenui/kinetic-type-ring';

// jsdom measures every glyph at zero width, so the ring cannot be laid out;
// reduced motion is the path that still has to render a complete DOM.
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

const ring = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-kinetic-type-ring]')!;

const stage = () => screen.getByRole('group', { name: /kinetic type ring/i });

/**
 * jsdom reports every box as zero. These stand-ins give the stage a size and
 * each glyph a width, which is all `layout()` needs to solve the ring.
 */
const measurable = (width = 960, height = 540, glyph = 40) => {
  for (const [prop, value] of [
    ['clientWidth', width],
    ['clientHeight', height],
  ] as const) {
    vi.spyOn(HTMLElement.prototype, prop, 'get').mockReturnValue(value);
  }
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(glyph);
};

describe('Kinetic Type Ring', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('gives screen readers the phrase once instead of letter by letter', () => {
    const { container } = render(<KineticTypeRing text="ORBIT · " />);

    // Queried by class, not by text: the trailing separator is significant here
    // and testing-library trims it away.
    expect(ring(container).querySelector('.sr-only')).toHaveTextContent('ORBIT ·');
    expect(ring(container).querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('builds one span per character of the phrase', () => {
    const { container } = render(<KineticTypeRing text="ABC" />);
    const glyphs = container.querySelectorAll('.inline-block');

    expect(glyphs).toHaveLength(3);
    expect([...glyphs].map((g) => g.textContent)).toEqual(['A', 'B', 'C']);
  });

  it('exposes a focusable stage that names its own controls', () => {
    render(<KineticTypeRing />);

    expect(stage()).toHaveAttribute('tabindex', '0');
    expect(stage()).toHaveAccessibleName(/arrow keys to spin/i);
  });

  it('never starts the intro, the ticker or the idle spin under reduced motion', () => {
    const timeline = vi.spyOn(gsap, 'timeline');
    const ticker = vi.spyOn(gsap.ticker, 'add');
    const { container } = render(<KineticTypeRing text="ABC" />);

    expect(timeline).not.toHaveBeenCalled();
    expect(ticker).not.toHaveBeenCalled();

    // Arrow keys are wired with the rest of the interaction, so they stay quiet too.
    fireEvent.keyDown(stage(), { key: 'ArrowLeft' });
    expect(container.querySelectorAll('.inline-block')).toHaveLength(3);
  });

  it('rebuilds the ring from scratch when the phrase changes', () => {
    const { container, rerender } = render(<KineticTypeRing text="ABC" />);
    rerender(<KineticTypeRing text="WXYZ" />);

    const glyphs = container.querySelectorAll('.inline-block');
    expect([...glyphs].map((g) => g.textContent)).toEqual(['W', 'X', 'Y', 'Z']);
  });

  it('waits for a stage it can measure before starting anything', () => {
    setReducedMotion(false);
    const ticker = vi.spyOn(gsap.ticker, 'add');
    // jsdom measures every box at zero, which is the same position as a first
    // paint before layout: there is no ring to spin yet, so nothing starts.
    render(<KineticTypeRing />);

    expect(ticker).not.toHaveBeenCalled();
  });

  it('solves the ring and runs the loop once the stage can be measured', () => {
    setReducedMotion(false);
    measurable();
    const ticker = vi.spyOn(gsap.ticker, 'add');
    const { container } = render(<KineticTypeRing text="ABCDEFGH" />);

    expect(ticker).toHaveBeenCalled();

    const [first] = [...container.querySelectorAll<HTMLElement>('[class*="whitespace-pre"]')];
    expect(first.style.fontSize).toMatch(/^\d+(\.\d+)?px$/);
    expect(first.style.transform).toMatch(/rotateY\([\d.]+deg\) translateZ\([\d.]+px\)/);
    expect(first.style.color).toMatch(/^rgb\(/);
  });

  it('swells the dot on a forward scroll and shrinks it on a backward one', () => {
    setReducedMotion(false);
    measurable();
    const { container } = render(<KineticTypeRing />);
    const dot = container.querySelector<HTMLElement>('.rounded-full')!;

    // Settle the intro, then push the ring and let one frame land.
    gsap.globalTimeline.time(6);
    const scaleAfter = (deltaY: number) => {
      fireEvent.wheel(stage(), { deltaY });
      gsap.ticker.tick();
      return Number(dot.style.transform.match(/scale\(([\d.]+)/)?.[1]);
    };

    const forward = scaleAfter(600);
    const back = scaleAfter(-1200);

    expect(forward).toBeGreaterThan(1);
    expect(back).toBeLessThan(1);
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<KineticTypeRing className="mt-10" />);
    expect(ring(container)).toHaveClass('mt-10');
  });
});
