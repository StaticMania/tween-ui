import { act, fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ElasticSlider, { MAX_STRETCH, rubberBand } from '@/registry/tweenui/elastic-slider';

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>,
}));

let reduceMotion = false;
const motionListeners = new Set<() => void>();

const setReducedMotion = (reduce: boolean) => {
  reduceMotion = reduce;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return query.includes('reduce') ? reduceMotion : false;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, listener: () => void) => motionListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => motionListeners.delete(listener),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

const switchReducedMotion = (reduce: boolean) =>
  act(() => {
    reduceMotion = reduce;
    motionListeners.forEach((listener) => listener());
  });

const Budget = (props: { onValueChange?: (value: number) => void; defaultValue?: number }) => (
  <ElasticSlider
    label="Monthly budget"
    min={0}
    max={20000}
    step={100}
    buttonStep={100}
    defaultValue={7500}
    prefix="$"
    {...props}
  />
);

const lastTickX = (container: HTMLElement) => {
  const ticks = container.querySelectorAll('[data-elastic-tick]');
  const last = ticks[ticks.length - 1];
  return last ? Number(gsap.getProperty(last, 'x')) : NaN;
};

describe('Elastic Slider', () => {
  beforeEach(() => {
    motionListeners.clear();
    setReducedMotion(false);
  });

  it('renders a labelled native range input', () => {
    render(<Budget />);
    const slider = screen.getByRole('slider', { name: 'Monthly budget' });
    expect(slider).toHaveValue('7500');
    expect(slider).toHaveAttribute('aria-valuetext', '$7,500');
  });

  it('steps up and down by 100 with the buttons', () => {
    const onValueChange = vi.fn();
    render(<Budget onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase Monthly budget by $100' }));
    expect(onValueChange).toHaveBeenLastCalledWith(7600);
    expect(screen.getByRole('slider')).toHaveValue('7600');
    fireEvent.click(screen.getByRole('button', { name: 'Decrease Monthly budget by $100' }));
    fireEvent.click(screen.getByRole('button', { name: 'Decrease Monthly budget by $100' }));
    expect(onValueChange).toHaveBeenLastCalledWith(7400);
  });

  it('stops at the limits', () => {
    const onValueChange = vi.fn();
    render(<Budget defaultValue={20000} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Increase/ }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('slider')).toHaveValue('20000');
  });

  it('snaps typed changes to the step', () => {
    const onValueChange = vi.fn();
    render(<Budget onValueChange={onValueChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1260' } });
    expect(onValueChange).toHaveBeenCalledWith(1300);
  });

  it('follows the controlled value', () => {
    const { rerender } = render(<ElasticSlider label="Volume" value={10} />);
    rerender(<ElasticSlider label="Volume" value={90} />);
    expect(screen.getByRole('slider')).toHaveValue('90');
  });

  it('hides the buttons without a buttonStep', () => {
    render(<ElasticSlider label="Volume" />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('works under reduced motion', () => {
    setReducedMotion(true);
    render(<Budget />);
    fireEvent.click(screen.getByRole('button', { name: /Increase/ }));
    expect(screen.getByRole('slider')).toHaveValue('7600');
  });

  describe('stretch past the ends', () => {
    let now = 0;
    beforeEach(() => {
      gsap.ticker.remove(gsap.updateRoot);
      now = gsap.ticker.time;
      Element.prototype.setPointerCapture = vi.fn();
      if (!('PointerEvent' in window)) {
        class PointerEventPolyfill extends MouseEvent {
          pointerId: number;
          pointerType: string;
          constructor(type: string, init: PointerEventInit = {}) {
            super(type, init);
            this.pointerId = init.pointerId ?? 1;
            this.pointerType = init.pointerType ?? 'mouse';
          }
        }
        Object.defineProperty(window, 'PointerEvent', {
          value: PointerEventPolyfill,
          configurable: true,
        });
      }
    });
    afterEach(() => {
      gsap.ticker.add(gsap.updateRoot);
    });

    const wait = (ms: number) =>
      act(() => {
        now += ms / 1000;
        gsap.updateRoot(now);
      });

    const pullPastEnd = (container: HTMLElement, clientX: number) => {
      const track = container.querySelector('[data-elastic-track]');
      if (!track) throw new Error('track not found');
      fireEvent.pointerDown(track, { clientX, pointerId: 1, button: 0, pointerType: 'mouse' });
      wait(1000);
    };

    it('stays small however far the pointer goes', () => {
      expect(MAX_STRETCH).toBeGreaterThanOrEqual(8);
      expect(MAX_STRETCH).toBeLessThanOrEqual(12);
      [1, 40, 200, 2000, 1e6].forEach((pull) => {
        expect(Math.abs(rubberBand(pull))).toBeLessThanOrEqual(MAX_STRETCH);
        expect(Math.abs(rubberBand(-pull))).toBeLessThanOrEqual(MAX_STRETCH);
      });
      expect(rubberBand(400) - rubberBand(200)).toBeLessThan(rubberBand(200) - rubberBand(0));
    });

    it('stretches the ruler within the cap when dragged past max', () => {
      const { container } = render(<Budget />);
      pullPastEnd(container, 5000);
      const stretch = lastTickX(container);
      expect(stretch).toBeGreaterThan(0);
      expect(stretch).toBeLessThanOrEqual(MAX_STRETCH);
      expect(screen.getByRole('slider')).toHaveValue('20000');
    });

    it('does not stretch under reduced motion', () => {
      setReducedMotion(true);
      const { container } = render(<Budget />);
      pullPastEnd(container, 5000);
      expect(lastTickX(container)).toBe(0);
      expect(screen.getByRole('slider')).toHaveValue('20000');
    });

    it('stops stretching as soon as reduced motion is switched on', () => {
      const { container } = render(<Budget />);
      switchReducedMotion(true);
      pullPastEnd(container, 5000);
      expect(lastTickX(container)).toBe(0);
    });
  });
});
