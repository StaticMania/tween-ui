import { act, fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ThemeToggleReveal from '@/registry/tweenui/theme-toggle-reveal';

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

const unfinished: (() => void)[] = [];

const mockViewTransitions = ({ deferred = false } = {}) => {
  const finishers: (() => void)[] = [];
  const queued: (() => void)[] = [];
  const start = vi.fn((update: () => void) => {
    const finished = new Promise<void>((resolve) => finishers.push(resolve));
    if (deferred) queued.push(update);
    else update();
    return { ready: Promise.resolve(), finished, updateCallbackDone: Promise.resolve() };
  });
  unfinished.push(() => finishers.forEach((resolve) => resolve()));
  const animate = vi.fn();
  Object.defineProperty(document, 'startViewTransition', { value: start, configurable: true });
  Object.defineProperty(document.documentElement, 'animate', {
    value: animate,
    configurable: true,
  });
  return {
    start,
    animate,
    finish: () => finishers.forEach((resolve) => resolve()),
    finishFirst: () => finishers[0]?.(),
    runUpdates: () => queued.splice(0).forEach((update) => update()),
  };
};

const toggle = () => screen.getByRole('button');

describe('Theme Toggle Reveal', () => {
  beforeEach(() => {
    document.head.querySelectorAll('style').forEach((style) => {
      if (style.textContent?.includes('{ clip-path')) style.remove();
    });
    setReducedMotion(false);
    document.documentElement.className = '';
  });
  afterEach(async () => {
    await act(async () => unfinished.splice(0).forEach((finish) => finish()));
    Reflect.deleteProperty(document, 'startViewTransition');
    Reflect.deleteProperty(document.documentElement, 'animate');
    vi.restoreAllMocks();
  });

  it('is a button labelled with what it will do', () => {
    render(<ThemeToggleReveal defaultTheme="light" />);
    expect(
      screen.getByRole('button', { name: 'Light mode, switch to dark theme' })
    ).toHaveAttribute('type', 'button');
  });

  it('switches instantly without the View Transitions API', () => {
    const onThemeChange = vi.fn();
    render(<ThemeToggleReveal defaultTheme="light" onThemeChange={onThemeChange} />);

    fireEvent.click(toggle());
    expect(onThemeChange).toHaveBeenCalledWith('dark');
    expect(document.documentElement).toHaveClass('dark');
    expect(toggle()).toHaveAccessibleName('Dark mode, switch to light theme');

    fireEvent.click(toggle());
    expect(document.documentElement).not.toHaveClass('dark');
    expect(toggle()).toHaveAccessibleName('Light mode, switch to dark theme');
  });

  it('follows a controlled theme', () => {
    const onThemeChange = vi.fn();
    const { rerender } = render(<ThemeToggleReveal theme="dark" onThemeChange={onThemeChange} />);
    expect(toggle()).toHaveAccessibleName('Dark mode, switch to light theme');

    fireEvent.click(toggle());
    expect(onThemeChange).toHaveBeenCalledWith('light');
    expect(toggle()).toHaveAccessibleName('Dark mode, switch to light theme');

    rerender(<ThemeToggleReveal theme="light" onThemeChange={onThemeChange} />);
    expect(toggle()).toHaveAccessibleName('Light mode, switch to dark theme');
  });

  it('writes the theme through applyTheme instead of the root', () => {
    const applyTheme = vi.fn();
    render(<ThemeToggleReveal defaultTheme="light" applyTheme={applyTheme} />);
    fireEvent.click(toggle());
    expect(applyTheme).toHaveBeenCalledWith('dark');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('draws a pixelated circle every frame from the icon to the farthest corner', async () => {
    const { start, animate, finish } = mockViewTransitions();
    const ticks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((tick) => ticks.push(tick));
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    render(<ThemeToggleReveal defaultTheme="light" duration={500} pixelSize={32} />);
    const icon = toggle().querySelector<HTMLElement>('[data-sun]')?.parentElement;
    if (!icon) throw new Error('icon missing');
    vi.spyOn(icon, 'getBoundingClientRect').mockReturnValue(
      DOMRect.fromRect({ x: 980, y: 20, width: 40, height: 40 })
    );
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(768);
    const clipRule = () =>
      Array.from(document.head.querySelectorAll('style'))
        .map((style) => style.textContent ?? '')
        .filter((css) => css.includes('::view-transition-new(root) { clip-path'))
        .at(-1);

    await act(async () => fireEvent.click(toggle()));

    expect(start).toHaveBeenCalledTimes(1);
    expect(document.documentElement).toHaveClass('dark');
    expect(clipRule()).not.toMatch(/v32h/);
    expect(clipRule()).toMatch(/M[\d.]+ [\d.]+h[\d.]+v/);
    expect(animate).toHaveBeenCalledWith(
      { opacity: [1, 1] },
      { duration: 500, pseudoElement: '::view-transition-new(root)' }
    );

    const farCorner = 'M0 736h';
    act(() => ticks.splice(0).forEach((tick) => tick(1250)));
    expect(clipRule()).toContain('M320 32h704v32h-704Z');
    expect(clipRule()).not.toContain(farCorner);

    act(() => ticks.splice(0).forEach((tick) => tick(1495)));
    expect(clipRule()).toContain(farCorner);

    act(() => ticks.splice(0).forEach((tick) => tick(1500)));
    expect(clipRule()).toContain('clip-path: inset(0)');

    await act(async () => finish());
    expect(clipRule()).toBeUndefined();
  });

  it.each([
    'circle',
    'diamond',
    'equalizer',
    'sweep',
    'zipper',
    'sparks',
    'sonar',
    'spiral',
  ] as const)('draws the %s reveal and ends on the whole screen', async (reveal) => {
    const { finish } = mockViewTransitions();
    const ticks: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((tick) => ticks.push(tick));
    vi.spyOn(performance, 'now').mockReturnValue(1000);
    render(<ThemeToggleReveal defaultTheme="light" duration={500} reveal={reveal} />);
    const clipRule = () =>
      Array.from(document.head.querySelectorAll('style'))
        .map((style) => style.textContent ?? '')
        .filter((css) => css.includes('::view-transition-new(root) { clip-path'))
        .at(-1);

    await act(async () => fireEvent.click(toggle()));
    act(() => ticks.splice(0).forEach((tick) => tick(1250)));
    expect(clipRule()).toMatch(
      /clip-path: path\('M0 0Z(M-?[\d.]+ -?[\d.]+h[\d.]+v[\d.]+h-?[\d.]+Z)+'\)/
    );
    act(() => ticks.splice(0).forEach((tick) => tick(1500)));
    expect(clipRule()).toContain('clip-path: inset(0)');
    await act(async () => finish());
  });

  it('switches off the cross-fade only while its own reveal runs', async () => {
    const { finish } = mockViewTransitions();
    render(<ThemeToggleReveal defaultTheme="light" />);

    await act(async () => fireEvent.click(toggle()));
    expect(document.documentElement).toHaveAttribute('data-theme-reveal');

    await act(async () => finish());
    expect(document.documentElement).not.toHaveAttribute('data-theme-reveal');
  });

  it('is disabled while a reveal runs and ignores clicks until it ends', async () => {
    const { start, finish } = mockViewTransitions();
    const onThemeChange = vi.fn();
    render(<ThemeToggleReveal defaultTheme="light" onThemeChange={onThemeChange} />);
    expect(toggle()).not.toHaveAttribute('aria-disabled');

    await act(async () => fireEvent.click(toggle()));
    expect(toggle()).toHaveAttribute('aria-disabled', 'true');
    expect(toggle()).not.toBeDisabled();
    const revealCss = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('');
    expect(revealCss).toMatch(
      /html\[data-theme-reveal\]::view-transition \{\s*cursor: not-allowed/
    );

    await act(async () => fireEvent.click(toggle()));
    await act(async () => fireEvent.click(toggle()));
    expect(start).toHaveBeenCalledTimes(1);
    expect(onThemeChange).toHaveBeenCalledTimes(1);

    await act(async () => finish());
    expect(toggle()).not.toHaveAttribute('aria-disabled');
    expect(document.documentElement).not.toHaveAttribute('data-theme-reveal');

    await act(async () => fireEvent.click(toggle()));
    expect(start).toHaveBeenCalledTimes(2);
    expect(onThemeChange).toHaveBeenLastCalledWith('light');
  });

  it('keeps focus on the toggle while it is disabled', async () => {
    mockViewTransitions();
    render(<ThemeToggleReveal defaultTheme="light" />);
    act(() => toggle().focus());
    await act(async () => fireEvent.click(toggle()));
    expect(toggle()).toHaveFocus();
  });

  it('morphs the icon and rolls the label when motion is allowed', () => {
    render(<ThemeToggleReveal defaultTheme="light" />);
    const moon = document.querySelector('[data-moon]');
    const darkLetters = document.querySelectorAll('[data-row=dark] [data-char]');
    expect(darkLetters).toHaveLength('Dark mode'.length);
    fireEvent.click(toggle());
    expect(gsap.getTweensOf(moon)).toHaveLength(1);
    expect(gsap.getTweensOf(darkLetters[0])).toHaveLength(1);
  });

  it('takes custom labels', () => {
    render(<ThemeToggleReveal defaultTheme="dark" labels={{ light: 'Day', dark: 'Night' }} />);
    expect(toggle()).toHaveAccessibleName('Night, switch to light theme');
  });

  it('switches instantly with no circle and no icon morph under reduced motion', () => {
    setReducedMotion(true);
    const { start } = mockViewTransitions();
    render(<ThemeToggleReveal defaultTheme="light" />);
    const sun = document.querySelector('[data-sun]');
    const moon = document.querySelector('[data-moon]');

    fireEvent.click(toggle());
    expect(start).not.toHaveBeenCalled();
    expect(document.documentElement).toHaveClass('dark');
    expect(gsap.getTweensOf(sun)).toHaveLength(0);
    expect(gsap.getTweensOf(moon)).toHaveLength(0);
  });

  it('picks up the dark class on <html> when uncontrolled with no default', () => {
    document.documentElement.classList.add('dark');
    render(<ThemeToggleReveal />);
    expect(toggle()).toHaveAccessibleName('Dark mode, switch to light theme');
  });
});
