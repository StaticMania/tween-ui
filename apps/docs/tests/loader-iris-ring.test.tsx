import { render, screen, waitFor } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoaderIrisRing, { IrisRingMark } from '@/registry/tweenui/loader-iris-ring';

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>,
}));

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

describe('Loader Iris Ring', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.style.overflow = '';
  });

  it('renders what it opens onto, with a sample page by default', () => {
    const { rerender } = render(<LoaderIrisRing />);
    expect(screen.getByRole('heading', { name: 'Your awesome hero here' })).toBeInTheDocument();

    rerender(
      <LoaderIrisRing>
        <h1>Welcome</h1>
      </LoaderIrisRing>
    );
    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
  });

  it('draws one corner counter per module, waiting at zero', () => {
    setReducedMotion(false);
    const { container } = render(
      <LoaderIrisRing
        modules={[
          { label: 'Orders', count: 862 },
          { label: 'Returns', count: 41 },
        ]}
      />
    );

    const modules = container.querySelectorAll('[data-loader-module]');
    expect(modules).toHaveLength(2);
    expect(modules[0]).toHaveTextContent('Orders0Queued');
    expect(modules[1]).toHaveClass('text-right');
  });

  it('flashes every frame through the lens', () => {
    setReducedMotion(false);
    const { container } = render(<LoaderIrisRing frames={['/a.jpg', '/b.jpg', '/c.jpg']} />);

    expect(
      [...container.querySelectorAll('[data-loader-frame]')].map((img) => img.getAttribute('src'))
    ).toEqual(['/a.jpg', '/b.jpg', '/c.jpg']);
  });

  it('keeps the overlay out of the accessibility tree and hidden by CSS under reduced motion', () => {
    setReducedMotion(false);
    const { container } = render(<LoaderIrisRing />);

    const overlay = container.querySelector('[data-loader]');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(overlay).toHaveClass('motion-reduce:hidden');
  });

  it('ships a landing mark the ring can find', () => {
    const { container } = render(<IrisRingMark className="size-8" />);

    const mark = container.querySelector('svg');
    expect(mark).toHaveAttribute('data-loader-target');
    expect(mark).toHaveAttribute('aria-hidden', 'true');
    expect(mark).toHaveClass('size-8');
  });

  it('skips the loader under reduced motion and reports done at once', async () => {
    const timeline = vi.spyOn(gsap, 'timeline');
    const onComplete = vi.fn();
    const { container } = render(<LoaderIrisRing onComplete={onComplete} />);

    expect(onComplete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(container.querySelector('[data-loader]')).toBeNull());
    expect(container.querySelector('section')).toHaveAttribute('aria-busy', 'false');
    expect(timeline).not.toHaveBeenCalled();
  });

  it('builds one timeline and hides the target mark until the ring lands', () => {
    setReducedMotion(false);
    const timeline = vi.spyOn(gsap, 'timeline');
    const { container } = render(<LoaderIrisRing />);

    expect(timeline).toHaveBeenCalledTimes(1);
    const mark = container.querySelector<SVGElement>('[data-loader-target]');
    expect(mark?.style.opacity).toBe('0');
  });

  it('locks page scroll only when fullscreen, and releases it on unmount', () => {
    setReducedMotion(false);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const { unmount } = render(<LoaderIrisRing fullscreen />);
    expect(document.documentElement.style.overflow).toBe('hidden');

    unmount();
    expect(document.documentElement.style.overflow).toBe('');
  });
});
