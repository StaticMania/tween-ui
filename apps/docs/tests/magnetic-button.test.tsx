import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MagneticButton from '@/registry/tweenui/magnetic-button';

// A fine pointer with motion allowed, unless a test says otherwise.
const setMedia = ({ reduced = false, fine = true } = {}) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce') ? reduced : fine,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

// jsdom lays nothing out, so give the button a 100×40 box at (100, 100).
const placeButton = (btn: HTMLElement) => {
  btn.getBoundingClientRect = () =>
    ({ left: 100, top: 100, right: 200, bottom: 140, width: 100, height: 40 }) as DOMRect;
};

const movePointer = (clientX: number, clientY: number) =>
  window.dispatchEvent(new MouseEvent('pointermove', { clientX, clientY }));

describe('Magnetic Button', () => {
  // restoreAllMocks also resets the matchMedia stub, so rebuild it per test.
  beforeEach(() => setMedia());
  afterEach(() => vi.restoreAllMocks());

  it('renders a button with its label', () => {
    render(<MagneticButton>Get started</MagneticButton>);
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<MagneticButton>Go</MagneticButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('fires onClick and forwards native props', () => {
    const onClick = vi.fn();
    render(
      <MagneticButton onClick={onClick} className="w-40" data-testid="magnet">
        Go
      </MagneticButton>
    );
    const btn = screen.getByTestId('magnet');
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(btn).toHaveClass('w-40');
  });

  it('forwards a ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<MagneticButton ref={ref}>Go</MagneticButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('activates inside the field and releases outside it', () => {
    render(<MagneticButton field={60}>Go</MagneticButton>);
    const btn = screen.getByRole('button');
    placeButton(btn);

    movePointer(230, 120); // 30px right of the edge
    expect(btn).toHaveAttribute('data-active');

    movePointer(400, 120); // 200px away
    expect(btn).not.toHaveAttribute('data-active');
  });

  it('pulls toward the cursor', () => {
    const quickTo = vi.spyOn(gsap, 'quickTo');
    render(<MagneticButton>Go</MagneticButton>);
    expect(quickTo).toHaveBeenCalledWith(screen.getByRole('button'), 'x', expect.any(Object));
  });

  it('stays still on touch devices', () => {
    setMedia({ fine: false });
    const quickTo = vi.spyOn(gsap, 'quickTo');
    render(<MagneticButton>Go</MagneticButton>);
    expect(quickTo).not.toHaveBeenCalled();
  });

  it('stays still under reduced motion', () => {
    setMedia({ reduced: true });
    render(<MagneticButton>Go</MagneticButton>);
    const btn = screen.getByRole('button');
    placeButton(btn);
    movePointer(150, 120);
    expect(btn).not.toHaveAttribute('data-active');
  });

  it('stays still while disabled', () => {
    render(<MagneticButton disabled>Go</MagneticButton>);
    const btn = screen.getByRole('button');
    placeButton(btn);
    movePointer(150, 120);
    expect(btn).not.toHaveAttribute('data-active');
  });
});
