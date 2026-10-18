import { render } from '@testing-library/react';
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

// jsdom has no SVG geometry; DrawSVG only needs a length and a box
const svgProto = window.SVGElement.prototype as unknown as Record<string, unknown>;

const Drawing = () => (
  <svg viewBox="0 0 100 100">
    <defs>
      <clipPath id="clip">
        <rect id="clipped" width="10" height="10" />
      </clipPath>
    </defs>
    <path id="outline" d="M0 0L100 100" style={{ stroke: 'rgb(255, 0, 0)', fill: 'none' }} />
    <circle id="dot" cx="50" cy="50" r="8" style={{ fill: 'rgb(0, 128, 0)', stroke: 'none' }} />
  </svg>
);

const shape = (container: HTMLElement, id: string) =>
  container.querySelector<SVGElement>(`#${id}`)!;

describe('SVG Draw', () => {
  beforeEach(() => {
    setReducedMotion(false);
    svgProto.getTotalLength = () => 100;
    svgProto.getBBox = () => ({ x: 0, y: 0, width: 100, height: 100 });
  });
  afterEach(() => {
    delete svgProto.getTotalLength;
    delete svgProto.getBBox;
    vi.restoreAllMocks();
  });

  it('shows the SVG as written under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(
      <SvgDraw>
        <Drawing />
      </SvgDraw>
    );

    expect((container.firstChild as HTMLElement).style.visibility).toBe('visible');
    expect(shape(container, 'outline').style.strokeDasharray).toBe('');
  });

  it('starts every shape undrawn', () => {
    const { container } = render(
      <SvgDraw trigger="mount">
        <Drawing />
      </SvgDraw>
    );

    expect(shape(container, 'outline').style.strokeDasharray).not.toBe('');
    expect(shape(container, 'dot').style.strokeDasharray).not.toBe('');
  });

  it('traces a fill-only shape in the text color and leaves strokes alone', () => {
    const { container } = render(
      <SvgDraw trigger="mount">
        <Drawing />
      </SvgDraw>
    );

    expect(shape(container, 'dot').style.stroke).toBe('currentColor');
    expect(shape(container, 'outline').style.stroke).toBe('rgb(255, 0, 0)');
  });

  it('skips shapes that are never painted where they sit', () => {
    const { container } = render(
      <SvgDraw trigger="mount">
        <Drawing />
      </SvgDraw>
    );

    expect(shape(container, 'clipped').getAttribute('style')).toBeNull();
  });

  it('reverts every shape when it unmounts', () => {
    const { container, unmount } = render(
      <SvgDraw trigger="mount">
        <Drawing />
      </SvgDraw>
    );
    const dot = shape(container, 'dot');

    unmount();
    expect(dot.style.strokeDasharray).toBe('');
    expect(dot.style.stroke).toBe('none');
  });
});
