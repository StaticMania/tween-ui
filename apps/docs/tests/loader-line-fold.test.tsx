import { render, screen, waitFor } from '@testing-library/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LoaderLineFold from '@/registry/tweenui/loader-line-fold';

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

const never = () => new Promise(() => {});

describe('Loader Line Fold', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.style.overflow = '';
  });

  it('renders what it opens onto', () => {
    render(
      <LoaderLineFold>
        <h1>Welcome</h1>
      </LoaderLineFold>
    );

    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
  });

  it('falls back to a sample hero', () => {
    render(<LoaderLineFold />);

    expect(screen.getByRole('heading', { name: 'Your awesome hero here' })).toBeInTheDocument();
  });

  it('defaults to the Tween UI wordmark and credit', () => {
    setReducedMotion(false);
    const { container } = render(<LoaderLineFold ready={never} />);

    expect(container).toHaveTextContent(`Tween UI ©${new Date().getFullYear()}`);
  });

  it('keeps the overlay out of the accessibility tree and hidden by CSS under reduced motion', () => {
    setReducedMotion(false);
    const { container } = render(<LoaderLineFold wordmark="Northwind" ready={never} />);

    const overlay = container.querySelector('section > [aria-hidden="true"]');
    expect(overlay).toHaveTextContent('Northwind');
    expect(overlay).toHaveClass('motion-reduce:hidden');
  });

  it('writes the credit from the wordmark unless one is given', () => {
    setReducedMotion(false);
    const { container, rerender } = render(<LoaderLineFold wordmark="Northwind" ready={never} />);
    expect(container).toHaveTextContent(`Northwind ©${new Date().getFullYear()}`);

    rerender(<LoaderLineFold credit="Outdoor gear" ready={never} />);
    expect(container).toHaveTextContent('Outdoor gear');
  });

  it('fills its own section unless it is fullscreen', () => {
    const { container, rerender } = render(<LoaderLineFold />);
    expect(container.querySelector('section')).toHaveClass('min-h-[600px]');

    rerender(<LoaderLineFold fullscreen />);
    expect(container.querySelector('section')).not.toHaveClass('min-h-[600px]');
  });

  it('skips the loader under reduced motion: no split, no timeline, done at once', async () => {
    const timeline = vi.spyOn(gsap, 'timeline');
    const split = vi.spyOn(SplitText, 'create');
    const onComplete = vi.fn();
    const { container } = render(<LoaderLineFold onComplete={onComplete} />);

    expect(onComplete).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(container.querySelector('section')).toHaveAttribute('aria-busy', 'false')
    );
    expect(container.querySelector('section > [aria-hidden="true"]')).toBeNull();
    expect(timeline).not.toHaveBeenCalled();
    expect(split).not.toHaveBeenCalled();
  });

  it('splits the wordmark and plays the intro when motion is allowed', () => {
    setReducedMotion(false);
    const timeline = vi.spyOn(gsap, 'timeline');
    const split = vi.spyOn(SplitText, 'create');
    const onComplete = vi.fn();
    const { container } = render(<LoaderLineFold ready={never} onComplete={onComplete} />);

    expect(split).toHaveBeenCalledTimes(1);
    expect(timeline).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
    expect(container.querySelector('section')).toHaveAttribute('aria-busy', 'true');
  });

  it('locks page scroll only when fullscreen, and releases it on unmount', () => {
    setReducedMotion(false);
    const { unmount } = render(<LoaderLineFold fullscreen ready={never} />);
    expect(document.documentElement.style.overflow).toBe('hidden');

    unmount();
    expect(document.documentElement.style.overflow).toBe('');
  });
});
