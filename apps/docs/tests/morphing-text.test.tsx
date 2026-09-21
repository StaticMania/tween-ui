import { render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MorphingText from '@/registry/tweenui/morphing-text';

const WORDS = ['magic', 'water', 'silk'];

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

describe('Morphing Text', () => {
  // restoreAllMocks also resets the matchMedia stub, so rebuild it per test.
  beforeEach(() => setReducedMotion(false));
  afterEach(() => vi.restoreAllMocks());

  it('renders the prefix and first word as a heading', () => {
    render(<MorphingText prefix="Motion that feels like" words={WORDS} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent(/Motion that feels like/);
    expect(heading).toHaveAccessibleName(/magic/);
    expect(heading).not.toHaveAccessibleName(/water/);
  });

  it('renders an inline span without a prefix, and honors `as`', () => {
    const { container, rerender } = render(<MorphingText words={WORDS} />);
    expect(container.firstElementChild?.tagName).toBe('SPAN');

    rerender(<MorphingText as="h1" prefix="Hello" words={WORDS} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('keeps each prefix line and glues the last one to the word', () => {
    const { container } = render(<MorphingText prefix={'Line one\nline two'} words={WORDS} />);
    expect(container.querySelectorAll('br')).toHaveLength(1);
  });

  it('forwards className and native attributes', () => {
    const { container } = render(
      <MorphingText words={WORDS} className="text-6xl" id="headline" data-testid="morph" />
    );
    const root = container.firstElementChild!;
    expect(root).toHaveClass('text-6xl');
    expect(root).toHaveAttribute('id', 'headline');
  });

  it('ships the threshold filter the morph references', () => {
    const { container } = render(<MorphingText words={WORDS} />);
    const filter = container.querySelector('filter');
    expect(filter?.id).toMatch(/^morph-threshold-[\w-]+$/);
  });

  it('builds the morph loop when motion is allowed', () => {
    const timeline = vi.spyOn(gsap, 'timeline');
    render(<MorphingText words={WORDS} />);
    expect(timeline).toHaveBeenCalled();
  });

  it('does not loop with a single word', () => {
    const timeline = vi.spyOn(gsap, 'timeline');
    render(<MorphingText words={['only']} />);
    expect(timeline).not.toHaveBeenCalled();
  });

  it('shows the first word crisp and never loops under reduced motion', () => {
    setReducedMotion(true);
    const timeline = vi.spyOn(gsap, 'timeline');
    const { container } = render(<MorphingText words={WORDS} />);
    expect(timeline).not.toHaveBeenCalled();
    const layer = container.querySelector('[aria-hidden].absolute.inset-0') as HTMLElement;
    expect(layer.style.filter).toBe('');
    expect(layer.firstElementChild).toHaveTextContent('magic');
  });
});
