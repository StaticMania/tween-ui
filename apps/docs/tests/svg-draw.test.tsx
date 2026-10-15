import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SvgDraw from '@/registry/tweenui/svg-draw';

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

// jsdom has no SVG geometry or layout: every shape is as long as its `data-len`, and on screen
const proto = window.SVGElement.prototype as unknown as { getTotalLength?: () => number };
const LEN = (el: Element) => Number(el.getAttribute('data-len') ?? 100);

/** An IntersectionObserver that only fires when the test says so. */
let enterView: () => void = () => {};
class ObserverStub {
  constructor(private callback: IntersectionObserverCallback) {
    enterView = () =>
      this.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
  }
  observe() {}
  disconnect() {}
}

const shape = (container: HTMLElement, id: string) =>
  container.querySelector<SVGElement>(`#${id}`)!;

const Drawing = () => (
  <svg viewBox="0 0 100 100">
    <defs>
      <clipPath id="clip">
        <rect id="clipped" width="10" height="10" />
      </clipPath>
    </defs>
    <g>
      <path
        id="outline"
        data-len="300"
        d="M0 0L100 100"
        style={{ stroke: 'rgb(255, 0, 0)', strokeWidth: '2px', fill: 'none' }}
      />
      <circle id="dot" data-len="50" cx="50" cy="50" r="8" style={{ fill: 'rgb(0, 128, 0)' }} />
    </g>
  </svg>
);

describe('SVG Draw', () => {
  beforeEach(() => {
    setReducedMotion(false);
    proto.getTotalLength = function (this: Element) {
      return LEN(this);
    };
    vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
  });
  afterEach(() => {
    delete proto.getTotalLength;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('leaves the SVG as written under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(
      <SvgDraw>
        <Drawing />
      </SvgDraw>
    );

    expect(shape(container, 'outline').style.strokeDasharray).toBe('');
    expect(container.querySelector<HTMLElement>('[data-svg-draw]')!.style.visibility).toBe(
      'visible'
    );
  });

  it('holds every shape undrawn until it scrolls into view', () => {
    vi.stubGlobal('IntersectionObserver', ObserverStub);
    const { container } = render(
      <SvgDraw>
        <Drawing />
      </SvgDraw>
    );

    const outline = shape(container, 'outline');
    expect(Number(outline.style.strokeDashoffset)).toBeGreaterThan(300);
    expect(outline.style.fillOpacity).toBe('0');
    expect(container.querySelector<HTMLElement>('[data-svg-draw]')!.style.visibility).toBe(
      'visible'
    );

    act(() => enterView());
    expect(outline.style.strokeDashoffset).toBe('0');
  });

  it('traces a stroked shape in its own stroke and a fill-only one in `color`', () => {
    vi.stubGlobal('IntersectionObserver', ObserverStub);
    const { container } = render(
      <SvgDraw color="rgb(0, 0, 255)">
        <Drawing />
      </SvgDraw>
    );

    expect(shape(container, 'outline').style.stroke).toBe('rgb(255, 0, 0)');
    expect(shape(container, 'outline').style.strokeWidth).toBe('2');
    expect(shape(container, 'dot').style.stroke).toBe('rgb(0, 0, 255)');
  });

  it('traces fill-only shapes in their own fill with ownColor', () => {
    vi.stubGlobal('IntersectionObserver', ObserverStub);
    const { container } = render(
      <SvgDraw ownColor>
        <Drawing />
      </SvgDraw>
    );

    expect(shape(container, 'dot').style.stroke).toBe('rgb(0, 128, 0)');
  });

  it('skips shapes that are never painted where they sit', () => {
    vi.stubGlobal('IntersectionObserver', ObserverStub);
    const { container } = render(
      <SvgDraw>
        <Drawing />
      </SvgDraw>
    );

    expect(shape(container, 'clipped').getAttribute('style')).toBeNull();
  });

  it('draws the longest shape first, the rest one stagger apart', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(
      <SvgDraw stagger={0.25}>
        <Drawing />
      </SvgDraw>
    );

    expect(shape(container, 'outline').style.transition).toMatch(/ 0ms$/);
    expect(shape(container, 'dot').style.transition).toMatch(/ 250ms$/);
  });

  it('hands every shape back as written once it settles', () => {
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', undefined);
    const onComplete = vi.fn();
    const { container } = render(
      <SvgDraw trigger="mount" duration={1} stagger={0.2} onComplete={onComplete}>
        <Drawing />
      </SvgDraw>
    );
    const outline = shape(container, 'outline');
    expect(outline.style.strokeDasharray).not.toBe('');

    act(() => {
      vi.advanceTimersByTime(1000 + 200 + 400 + 10);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    // Its own style is back, and nothing of the drawing is left on it
    expect(outline.style.stroke).toBe('rgb(255, 0, 0)');
    expect(outline.style.strokeDasharray).toBe('');
    expect(shape(container, 'dot').style.fillOpacity).toBe('');
  });

  it('restores the SVG when it unmounts mid-draw', () => {
    vi.stubGlobal('IntersectionObserver', ObserverStub);
    const { container, unmount } = render(
      <SvgDraw>
        <Drawing />
      </SvgDraw>
    );
    const outline = shape(container, 'outline');

    unmount();
    expect(outline.style.strokeDasharray).toBe('');
  });
});
