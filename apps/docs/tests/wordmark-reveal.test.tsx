import { render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WordmarkReveal from '@/registry/tweenui/wordmark-reveal';

const setReducedMotion = (value: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: value,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

describe('Wordmark Reveal', () => {
  // restoreAllMocks also resets the matchMedia stub, so rebuild it per test.
  beforeEach(() => setReducedMotion(false));
  afterEach(() => vi.restoreAllMocks());

  it('renders the wordmark as a heading and keeps its line break', () => {
    const { container } = render(<WordmarkReveal title={'Tween\nUI'} script="in motion" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Tween/);
    expect(heading).toHaveTextContent(/UI/);
    expect(container.querySelectorAll('br')).toHaveLength(1);
    expect(container.querySelector('[data-wordmark-script]')).toHaveTextContent('in motion');
  });

  it('honors `as` and forwards className and native attributes', () => {
    const { container, rerender } = render(
      <WordmarkReveal title="Tween UI" className="font-serif" id="wordmark" />
    );
    const root = container.firstElementChild!;
    expect(root).toHaveClass('font-serif');
    expect(root).toHaveAttribute('id', 'wordmark');

    rerender(<WordmarkReveal title="Tween UI" as="h2" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('shows the cue while waiting, and drops it when playing instantly', () => {
    const { container, rerender } = render(<WordmarkReveal title="Tween UI" />);
    expect(container.querySelector('[data-wordmark-cue]')).toHaveTextContent(
      'Scroll down to reveal'
    );

    rerender(<WordmarkReveal title="Tween UI" instant />);
    expect(container.querySelector('[data-wordmark-cue]')).not.toBeInTheDocument();
  });

  it('builds the reveal when motion is allowed', () => {
    const timeline = vi.spyOn(gsap, 'timeline');
    render(<WordmarkReveal title="Tween UI" script="in motion" instant />);
    expect(timeline).toHaveBeenCalled();
  });

  it('never splits or animates under reduced motion', () => {
    setReducedMotion(true);
    const timeline = vi.spyOn(gsap, 'timeline');
    const { container } = render(<WordmarkReveal title="Tween UI" script="in motion" />);
    expect(timeline).not.toHaveBeenCalled();

    // The wordmark is left exactly as it rendered — no split spans, no inline transforms.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Tween UI');
    expect(heading.style.transform).toBe('');
    expect(container.querySelector('[data-wordmark-cue]')).toHaveClass('motion-reduce:hidden');
  });
});
