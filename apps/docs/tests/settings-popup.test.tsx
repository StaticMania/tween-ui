import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsPopup from '@/registry/tweenui/settings-popup';

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

const TOGGLES = [
  { label: 'Sound', icon: <svg />, defaultChecked: true },
  { label: 'Dark mode', icon: <svg /> },
];

const CHOICE = {
  label: 'Quality',
  defaultValue: 'high',
  options: [
    { value: 'high', label: 'High', hint: 'Recommended' },
    { value: 'low', label: 'Low' },
  ],
};

const trigger = () => screen.getByRole('button', { name: 'Settings' });
const menu = () => screen.getByRole('menu', { hidden: true });
const item = (name: string) =>
  screen.queryByRole('menuitemcheckbox', { name, hidden: true }) ??
  screen.getByRole('menuitemradio', { name, hidden: true });
const hover = (type: 'pointerEnter' | 'pointerLeave') =>
  fireEvent[type](trigger().parentElement as HTMLElement, { pointerType: 'mouse' });
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('Settings Popup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setReducedMotion(true);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders a menu button pointing at a hidden menu', () => {
    render(<SettingsPopup toggles={TOGGLES} choice={CHOICE} />);

    expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveAttribute('aria-controls', menu().id);
    expect(menu()).toHaveAttribute('aria-label', 'Settings');
  });

  it('opens on hover and closes after the grace period', () => {
    render(<SettingsPopup toggles={TOGGLES} />);

    hover('pointerEnter');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(menu().style.visibility).toBe('inherit');

    hover('pointerLeave');
    advance(100);
    hover('pointerEnter');
    advance(150);
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');

    hover('pointerLeave');
    advance(150);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(menu().style.visibility).toBe('hidden');
  });

  it('flips toggles and picks one option', () => {
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <SettingsPopup
        toggles={[TOGGLES[0]!, { ...TOGGLES[1]!, onCheckedChange }]}
        choice={{ ...CHOICE, onValueChange }}
      />
    );

    hover('pointerEnter');
    expect(item('Sound')).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(item('Dark mode'));
    expect(item('Dark mode')).toHaveAttribute('aria-checked', 'true');
    expect(onCheckedChange).toHaveBeenCalledWith(true);

    fireEvent.click(item('Low'));
    expect(item('Low')).toHaveAttribute('aria-checked', 'true');
    expect(item('High Recommended')).toHaveAttribute('aria-checked', 'false');
    expect(onValueChange).toHaveBeenCalledWith('low');
  });

  it('opens from the keyboard, moves with arrows and closes on Escape', () => {
    render(<SettingsPopup toggles={TOGGLES} choice={CHOICE} />);

    act(() => trigger().focus());
    fireEvent.click(trigger(), { detail: 0 });
    expect(item('Sound')).toHaveFocus();

    fireEvent.keyDown(menu(), { key: 'ArrowDown' });
    expect(item('Dark mode')).toHaveFocus();
    fireEvent.keyDown(menu(), { key: 'End' });
    expect(item('Low')).toHaveFocus();
    fireEvent.keyDown(menu(), { key: 'ArrowDown' });
    expect(item('Sound')).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveFocus();
  });

  it('follows controlled checked and value props', () => {
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <SettingsPopup
        toggles={[{ ...TOGGLES[1]!, checked: false, onCheckedChange }]}
        choice={{ ...CHOICE, value: 'high' }}
      />
    );
    hover('pointerEnter');

    fireEvent.click(item('Dark mode'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(item('Dark mode')).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(item('Low'));
    expect(item('Low')).toHaveAttribute('aria-checked', 'false');

    rerender(
      <SettingsPopup
        toggles={[{ ...TOGGLES[1]!, checked: true, onCheckedChange }]}
        choice={{ ...CHOICE, value: 'low' }}
      />
    );
    expect(item('Dark mode')).toHaveAttribute('aria-checked', 'true');
    expect(item('Low')).toHaveAttribute('aria-checked', 'true');
  });

  it('still calls the pointer and blur handlers passed in', () => {
    const onPointerEnter = vi.fn();
    const onPointerLeave = vi.fn();
    render(
      <SettingsPopup
        toggles={TOGGLES}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
    );

    hover('pointerEnter');
    hover('pointerLeave');
    expect(onPointerEnter).toHaveBeenCalledOnce();
    expect(onPointerLeave).toHaveBeenCalledOnce();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on a press outside', () => {
    render(<SettingsPopup toggles={TOGGLES} />);

    hover('pointerEnter');
    fireEvent.pointerDown(document.body);
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('springs the panel out of the trigger when motion is allowed', () => {
    setReducedMotion(false);
    render(<SettingsPopup toggles={TOGGLES} />);

    hover('pointerEnter');
    expect(menu().style.visibility).toBe('inherit');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
  });
});
