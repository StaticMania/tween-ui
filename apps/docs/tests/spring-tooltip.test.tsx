import { act, fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SpringTooltip from '@/registry/tweenui/spring-tooltip';

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

const ITEMS = [
  { label: 'Bold', shortcut: 'Ctrl B', icon: <svg /> },
  { label: 'Italic', icon: <svg /> },
  { label: 'Insert link', icon: <svg /> },
];

const button = (name: string) => screen.getByRole('button', { name });
const tooltip = () => screen.getByRole('tooltip', { hidden: true });
const tip = () => tooltip().closest('[data-tip]') as HTMLElement;
const labelOf = (text: string) =>
  document.querySelector(`[data-tip-label="${text}"]`) as HTMLElement;

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('Spring Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setReducedMotion(true);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders real buttons that all describe one tooltip', () => {
    render(<SpringTooltip items={ITEMS} aria-label="Formatting" />);

    expect(screen.getByRole('group', { name: 'Formatting' })).toBeInTheDocument();
    const id = tooltip().id;
    for (const { label } of ITEMS) {
      expect(button(label).tagName).toBe('BUTTON');
      expect(button(label)).toHaveAttribute('aria-describedby', id);
    }
    expect(tip()).toHaveAttribute('data-state', 'closed');
  });

  it('opens after the delay, then moves to a neighbour with none', () => {
    render(<SpringTooltip items={ITEMS} />);

    fireEvent.pointerOver(button('Bold'));
    advance(149);
    expect(tip()).toHaveAttribute('data-state', 'closed');
    advance(1);
    expect(tip()).toHaveAttribute('data-state', 'open');
    expect(button('Bold')).toHaveAttribute('data-highlighted', 'true');

    fireEvent.pointerOver(button('Italic'));
    expect(button('Italic')).toHaveAttribute('data-highlighted', 'true');
    expect(labelOf('Italic')).not.toHaveAttribute('aria-hidden');
    expect(labelOf('Bold')).toHaveAttribute('aria-hidden', 'true');
  });

  it('waits out the grace period before closing', () => {
    render(<SpringTooltip items={ITEMS} />);
    const group = screen.getByRole('group');

    fireEvent.pointerOver(button('Bold'));
    advance(150);
    fireEvent.pointerLeave(group);
    advance(200);
    fireEvent.pointerOver(button('Italic'));
    advance(150);
    expect(tip()).toHaveAttribute('data-state', 'open');

    fireEvent.pointerLeave(group);
    advance(300);
    expect(tip()).toHaveAttribute('data-state', 'closed');
  });

  it('follows keyboard focus from button to button', () => {
    render(<SpringTooltip items={ITEMS} />);

    act(() => button('Bold').focus());
    advance(150);
    expect(tip()).toHaveAttribute('data-state', 'open');

    act(() => button('Italic').focus());
    expect(button('Italic')).toHaveAttribute('data-highlighted', 'true');
    expect(labelOf('Italic')).not.toHaveAttribute('aria-hidden');
  });

  it('closes on Escape', () => {
    render(<SpringTooltip items={ITEMS} />);

    fireEvent.pointerOver(button('Bold'));
    advance(150);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(tip()).toHaveAttribute('data-state', 'closed');
  });

  it('wipes the label without touching the transform that centres it', () => {
    setReducedMotion(false);
    render(<SpringTooltip items={ITEMS} />);

    fireEvent.pointerOver(button('Bold'));
    advance(150);
    fireEvent.pointerOver(button('Insert link'));

    for (const text of ['Bold', 'Insert link']) {
      const label = labelOf(text);
      expect(label.style.transform).toBe('');
      expect(label.style.translate).not.toBe('none');
    }
  });

  it('shows the label at the target straight away under reduced motion', () => {
    render(<SpringTooltip items={ITEMS} />);

    fireEvent.pointerOver(button('Bold'));
    advance(150);
    fireEvent.pointerOver(button('Insert link'));

    const label = labelOf('Insert link');
    expect(gsap.isTweening(label)).toBe(false);
    expect(gsap.isTweening(tooltip())).toBe(false);
    expect(label.style.opacity).toBe('1');
    expect(labelOf('Bold').style.visibility).toBe('hidden');
  });
});
