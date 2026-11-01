import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PixelFillButton from '@/registry/tweenui/pixel-fill-button';

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

const sizeButtons = () => {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(160);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(48);
};

const rolls = () => Array.from(document.querySelectorAll<HTMLElement>('[data-roll]'));

describe('Pixel Fill Button', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a button named by its label', () => {
    render(<PixelFillButton>Learn more</PixelFillButton>);
    const button = screen.getByRole('button', { name: 'Learn more' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('forwards the ref and native attributes', () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(
      <PixelFillButton ref={ref} onClick={onClick} disabled>
        Learn more
      </PixelFillButton>
    );
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(ref.current).toBeDisabled();
  });

  it('builds a pixel grid that covers the button', () => {
    sizeButtons();
    render(<PixelFillButton>Learn more</PixelFillButton>);
    expect(document.querySelectorAll('[data-pixel]')).toHaveLength(20 * 6);
  });

  it('fills on hover and on keyboard focus, and empties on leave', () => {
    render(<PixelFillButton>Learn more</PixelFillButton>);
    const button = screen.getByRole('button');

    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    expect(button).toHaveAttribute('data-active', 'true');
    fireEvent.pointerLeave(button, { pointerType: 'mouse' });
    expect(button).toHaveAttribute('data-active', 'false');

    act(() => button.focus());
    expect(button).toHaveAttribute('data-active', 'true');
    act(() => button.blur());
    expect(button).toHaveAttribute('data-active', 'false');
  });

  it('ignores touch', () => {
    render(<PixelFillButton>Learn more</PixelFillButton>);
    const button = screen.getByRole('button');
    const touch = new Event('pointerenter');
    Object.defineProperty(touch, 'pointerType', { value: 'touch' });
    fireEvent(button, touch);
    expect(button).toHaveAttribute('data-active', 'false');
  });

  it('switches to the filled state with no roll or slide under reduced motion', () => {
    sizeButtons();
    render(<PixelFillButton>Learn more</PixelFillButton>);
    const button = screen.getByRole('button');

    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    expect(button).toHaveAttribute('data-active', 'true');
    for (const el of rolls()) expect(gsap.isTweening(el)).toBe(false);
    expect(rolls()[0].style.transform).toBe('');
  });

  it('rolls the label and dissolves the pixels in when motion is allowed', () => {
    setReducedMotion(false);
    sizeButtons();
    render(<PixelFillButton>Learn more</PixelFillButton>);
    const button = screen.getByRole('button');
    const pixels = Array.from(document.querySelectorAll<HTMLElement>('[data-pixel]'));

    fireEvent.pointerEnter(button, { pointerType: 'mouse' });
    for (const el of rolls()) expect(gsap.getTweensOf(el)).toHaveLength(1);
    expect(pixels.every((pixel) => gsap.getTweensOf(pixel).length === 1)).toBe(true);

    fireEvent.pointerLeave(button, { pointerType: 'mouse' });
    expect(gsap.getTweensOf(button)).toHaveLength(1);
  });
});
