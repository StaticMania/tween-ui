import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TextRollButton from '@/registry/tweenui/text-roll-button';

// SplitText needs real layout; force reduced motion so the GSAP path is skipped in jsdom.
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

describe('Text Roll Button', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => setReducedMotion(false));

  it('renders a button with its label as the accessible name', () => {
    render(<TextRollButton>Try now</TextRollButton>);
    expect(screen.getByRole('button', { name: 'Try now' })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<TextRollButton>Try now</TextRollButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('fires onClick and forwards native props', () => {
    const onClick = vi.fn();
    render(
      <TextRollButton onClick={onClick} data-testid="roll">
        Try now
      </TextRollButton>
    );
    fireEvent.click(screen.getByTestId('roll'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<TextRollButton ref={ref}>Try now</TextRollButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
