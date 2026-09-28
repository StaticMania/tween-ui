import { fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TestimonialReelFocus, {
  type TestimonialReelItem,
} from '@/registry/tweenui/testimonial-reel-focus';

const ITEMS: TestimonialReelItem[] = [
  {
    name: 'Maya Rahman',
    role: 'CEO, Northwind',
    quote: 'They gave the whole company a spine.',
    tag: 'Brand identity',
    metric: 'Sales cycle −30%',
  },
  {
    name: 'Daniel Osei',
    role: 'VP Engineering, Halo Labs',
    initials: 'DX',
    hue: 214,
    quote: 'The design system paid for itself in a quarter.',
    tag: 'Design system',
    metric: 'Ships 2× faster',
  },
  {
    name: 'Priya Venkataraman',
    role: 'CMO, Kindred',
    quote: 'Three directions, all of them right.',
    tag: 'Campaign',
    metric: '+41% sign-ups',
  },
];

const setMedia = ({ reduce = false, hover = true } = {}) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce') ? reduce : query.includes('hover') ? hover : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

/**
 * jsdom lays nothing out, so every width is 0 and the reel would measure itself
 * as having nothing to travel. Stubbing the two widths it reads is what lets the
 * runway, the tick fitting and the lit window be exercised at all.
 */
const EDGE = 120;
const CARD_W = 420;
const GAP = 24;

const stubWidths = ({ track = 3768, viewport = 1440, strip = 948 } = {}) => {
  const spies = [
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (
      this: HTMLElement
    ) {
      if (this.hasAttribute('data-reel-viewport')) return viewport;
      if (this.getAttribute('role') === 'progressbar') return strip;
      return 0;
    }),
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (
      this: HTMLElement
    ) {
      return this.hasAttribute('data-reel-track') ? track : 0;
    }),
    // Where each card sits in the row — the wave is a function of exactly this.
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
      this: HTMLElement
    ) {
      return this.hasAttribute('data-reel-card') ? CARD_W : 0;
    }),
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (
      this: HTMLElement
    ) {
      if (!this.hasAttribute('data-reel-card')) return 0;
      const index = Array.prototype.indexOf.call(this.parentElement?.children ?? [], this);
      return EDGE + index * (CARD_W + GAP);
    }),
  ];
  return () => spies.forEach((spy) => spy.mockRestore());
};

/** GSAP writes the wave as an inline transform — translate(x, y) or translate3d(x, y, z). */
const yOf = (card: HTMLElement) => {
  const args = (card.style.transform.split('(')[1] ?? '').split(',');
  return args.length > 1 ? parseFloat(args[1]) : Number.NaN;
};

const cardsIn = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-reel-card]'));

const barsIn = (container: HTMLElement) =>
  Array.from(container.querySelector('[role="progressbar"]')?.children ?? []) as HTMLElement[];

const litIn = (container: HTMLElement) =>
  barsIn(container)
    .map((bar, i) => (bar.hasAttribute('data-on') ? i : -1))
    .filter((i) => i >= 0);

describe('Testimonial Reel Focus', () => {
  beforeEach(() => setMedia());
  afterEach(() => vi.restoreAllMocks());

  it('is a named region even though the reel carries no heading of its own', () => {
    render(<TestimonialReelFocus items={ITEMS} />);
    expect(screen.getByRole('region', { name: 'Testimonials' })).toBeInTheDocument();
  });

  it('takes a name of its own', () => {
    render(<TestimonialReelFocus items={ITEMS} aria-label="What residents say" />);
    expect(screen.getByRole('region', { name: 'What residents say' })).toBeInTheDocument();
  });

  it('renders nothing above the reel', () => {
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);
    const section = container.querySelector('[data-testimonial-reel-focus]')!;

    expect(section.querySelector('header')).toBeNull();
    expect(section.querySelector('h2')).toBeNull();
    expect(section.querySelector('dl')).toBeNull();
    // the runway is the section's first and only child
    expect(section.children).toHaveLength(1);
    expect(section.firstElementChild).toHaveAttribute('data-reel-pin');
  });

  it('renders every voice as a list item with its quote, tag and metric', () => {
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);
    const cards = cardsIn(container);

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent('Maya Rahman');
    expect(cards[0]).toHaveTextContent('CEO, Northwind');
    expect(cards[0]).toHaveTextContent('Brand identity');
    expect(cards[0]).toHaveTextContent('Sales cycle −30%');
  });

  it('wraps each quote in curly quotes so the prop stays plain text', () => {
    render(<TestimonialReelFocus items={ITEMS} />);
    expect(screen.getByText('“They gave the whole company a spine.”')).toBeInTheDocument();
  });

  it('numbers the cards from their place in the reel', () => {
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);
    const cards = cardsIn(container);

    expect(cards[0]).toHaveTextContent('01/03');
    expect(cards[1]).toHaveTextContent('02/03');
    expect(cards[2]).toHaveTextContent('03/03');
  });

  it('derives the monogram from the name, and honours one that is given', () => {
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);
    const cards = cardsIn(container);

    expect(cards[0].textContent).toContain('MR');
    expect(cards[1].textContent).toContain('DX');
    expect(cards[2].textContent).toContain('PV');
  });

  it('gives every avatar its own hue, generated or supplied', () => {
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);
    const hues = cardsIn(container).map((card) =>
      card.querySelector<HTMLElement>('[style*="--reel-hue"]')?.style.getPropertyValue('--reel-hue')
    );

    expect(hues[1]).toBe('214');
    expect(new Set(hues).size).toBe(3);
    expect(hues.every(Boolean)).toBe(true);
  });

  it('counts the reel off and spells out how to move it', () => {
    render(<TestimonialReelFocus items={ITEMS} hint="Hover to focus" />);

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('/ 03')).toBeInTheDocument();
    expect(screen.getByText(/Hover to focus/)).toBeInTheDocument();
  });

  it('exposes the scrubber as a bounded progressbar', () => {
    render(<TestimonialReelFocus items={ITEMS} />);
    const bar = screen.getByRole('progressbar', { name: 'Testimonials progress' });

    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('hides every decorative layer from the accessibility tree', () => {
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);
    const [card] = cardsIn(container);

    // the quote glyph, the monogram chip, the accent dot
    const decorations = [
      ...card.querySelectorAll('svg'),
      card.querySelector('[style*="--reel-hue"]'),
      card.querySelector('[class*="size-1.5"]'),
    ];
    expect(decorations.filter(Boolean)).toHaveLength(3);
    for (const decoration of decorations) {
      expect(decoration).toHaveAttribute('aria-hidden', 'true');
    }

    // but the words on the card are not hidden along with them
    expect(card.querySelector('blockquote')).not.toHaveAttribute('aria-hidden');
    expect(screen.getByText('Brand identity')).not.toHaveAttribute('aria-hidden');
  });

  it('dresses the card with a border rather than a gradient wash', () => {
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);
    const shell = container.querySelector<HTMLElement>('[data-reel-shell]')!;

    // A masked gradient ring cannot survive here: the `mask` shorthand resets
    // `mask-composite`, so the ring un-punches and floods the card with accent.
    expect(shell.className).not.toContain('mask');
    expect(shell.className).toContain('border');
    expect(container.querySelector('[class*="linear-gradient"][class*="reel-accent"]')).toBeNull();
    expect(container.querySelector('[data-reel-glow]')).toBeNull();
  });

  it('measures the runway from the row it cannot show, and pins for exactly that far', () => {
    const restore = stubWidths({ track: 3768, viewport: 1440 });
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);

    // 3768 of row shown through 1440 leaves 2328 to travel
    const pin = container.querySelector<HTMLElement>('[data-reel-pin]')!;
    expect(pin.style.getPropertyValue('--reel-run')).toBe('2328px');
    expect(pin.className).toContain('h-[calc(var(--reel-view)+var(--reel-run,0px))]');
    restore();
  });

  it('sizes the stage to the window when nothing above it scrolls', () => {
    const restore = stubWidths();
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);

    const pin = container.querySelector<HTMLElement>('[data-reel-pin]')!;
    expect(pin.style.getPropertyValue('--reel-view')).toBe(`${window.innerHeight}px`);
    restore();
  });

  it('pins against a scrolling ancestor rather than the window when it has one', () => {
    const restore = stubWidths();
    // Whatever `position: sticky` sticks to is what the reel has to measure and watch,
    // or a reel inside a panel would run off a scrollbar nobody is moving.
    const height = vi
      .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        return this.hasAttribute('data-scrollport') ? 560 : 0;
      });

    const { container } = render(
      <div data-scrollport style={{ overflowY: 'auto' }}>
        <TestimonialReelFocus items={ITEMS} />
      </div>
    );

    const pin = container.querySelector<HTMLElement>('[data-reel-pin]')!;
    expect(pin.style.getPropertyValue('--reel-view')).toBe('560px');
    height.mockRestore();
    restore();
  });

  it('does not pin when the row already fits the stage', () => {
    const restore = stubWidths({ track: 1200, viewport: 1440 });
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);

    const pin = container.querySelector<HTMLElement>('[data-reel-pin]')!;
    expect(pin.style.getPropertyValue('--reel-run')).toBe('0px');
    expect(pin.className).not.toContain('h-[calc(');
    restore();
  });

  it('holds a card below its line until it has crossed into the stage', () => {
    const restore = stubWidths();
    const { container } = render(<TestimonialReelFocus />);
    const cards = cardsIn(container);

    // A 1440 stage with a 120 inset shows the first three of eight; the rest wait.
    expect(yOf(cards[0])).toBe(0);
    expect(cards[0].style.opacity).toBe('1');
    expect(yOf(cards[2])).toBe(0);

    expect(yOf(cards[4])).toBeGreaterThan(0);
    expect(yOf(cards[7])).toBeGreaterThan(0);
    expect(Number(cards[7].style.opacity)).toBeLessThan(1);
    restore();
  });

  it('sends the wave along the row as the reel runs, and back again', () => {
    const restore = stubWidths();
    const { container } = render(<TestimonialReelFocus />);
    const cards = cardsIn(container);
    const pin = container.querySelector<HTMLElement>('[data-reel-pin]')!;
    const rail = ScrollTrigger.getAll().find((t) => t.trigger === pin)!;
    // jsdom has no scroll to drive, and `progress` is read-only, so the trigger's own
    // callback is handed the one field it reads.
    const runTo = (progress: number, velocity = 0) =>
      rail.vars.onUpdate?.({
        progress,
        getVelocity: () => velocity,
      } as unknown as ScrollTrigger);

    const waiting = yOf(cards[5]);
    expect(waiting).toBeGreaterThan(0);

    // Run the reel far enough that card 5 has come in from the right
    runTo(0.6);
    expect(yOf(cards[5])).toBeLessThan(waiting);
    expect(yOf(cards[5])).toBe(0);
    expect(cards[5].style.opacity).toBe('1');

    // and lowers itself again on the way back, so the swell is scroll-linked both ways
    runTo(0);
    expect(yOf(cards[5])).toBe(waiting);
    restore();
  });

  it('leans the row while it travels and lets it fall flat again', () => {
    const restore = stubWidths();
    const { container } = render(<TestimonialReelFocus />);
    const cards = cardsIn(container);
    const pin = container.querySelector<HTMLElement>('[data-reel-pin]')!;
    const rail = ScrollTrigger.getAll().find((t) => t.trigger === pin)!;
    const runTo = (progress: number, velocity = 0) =>
      rail.vars.onUpdate?.({
        progress,
        getVelocity: () => velocity,
      } as unknown as ScrollTrigger);

    // Far enough in that every card has arrived, so the only y left is the lean
    runTo(1, 0);
    expect(cards.map(yOf)).toEqual(cards.map(() => 0));

    // Scrolling forward: cards ahead of centre swing low, the ones behind ride high
    runTo(1, 1500);
    const leaning = cards.map(yOf);
    expect(leaning[0]).toBeLessThan(0);
    expect(leaning[7]).toBeGreaterThan(0);
    // one straight ramp, pivoting on the middle of the row
    const step = leaning[1] - leaning[0];
    expect(step).toBeGreaterThan(0);
    for (let i = 1; i < leaning.length; i++) {
      expect(leaning[i] - leaning[i - 1]).toBeCloseTo(step, 6);
    }
    expect(leaning[0]).toBeCloseTo(-leaning[7], 6);

    // Scrolling back tips it the other way
    runTo(1, -1500);
    expect(yOf(cards[0])).toBeGreaterThan(0);
    expect(yOf(cards[7])).toBeLessThan(0);

    restore();
  });

  it('releases the lean once the scrolling stops', () => {
    vi.useFakeTimers();
    const restore = stubWidths();
    const { container } = render(<TestimonialReelFocus />);
    const pin = container.querySelector<HTMLElement>('[data-reel-pin]')!;
    const rail = ScrollTrigger.getAll().find((t) => t.trigger === pin)!;
    const tween = vi.spyOn(gsap, 'to');

    rail.vars.onUpdate?.({
      progress: 1,
      getVelocity: () => 1500,
    } as unknown as ScrollTrigger);

    // Still scrolling: nothing has been asked to flatten yet
    expect(tween).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    const released = tween.mock.calls.at(-1);
    expect(released?.[1]).toMatchObject({ tilt: 0 });

    restore();
    vi.useRealTimers();
  });

  it('caps the lean, so a flung scroll bows the row instead of folding it', () => {
    const restore = stubWidths();
    const { container } = render(<TestimonialReelFocus />);
    const cards = cardsIn(container);
    const pin = container.querySelector<HTMLElement>('[data-reel-pin]')!;
    const rail = ScrollTrigger.getAll().find((t) => t.trigger === pin)!;
    const runTo = (velocity: number) =>
      rail.vars.onUpdate?.({
        progress: 1,
        getVelocity: () => velocity,
      } as unknown as ScrollTrigger);

    runTo(40_000);
    const flung = yOf(cards[7]);
    runTo(400_000);
    expect(yOf(cards[7])).toBe(flung);
    restore();
  });

  it('leaves the cards flat under reduced motion', () => {
    setMedia({ reduce: true });
    const restore = stubWidths();
    const { container } = render(<TestimonialReelFocus />);

    for (const card of cardsIn(container)) {
      expect(card.style.transform).toBe('');
      expect(card.style.opacity).toBe('');
    }
    restore();
  });

  it('fits the scrubber to the strip and lights the window on the first card', () => {
    const restore = stubWidths({ strip: 948 });
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);

    // 2px bars on a 3px gap: floor((948 + 3) / 5)
    expect(barsIn(container)).toHaveLength(190);
    // At rest the head sits on bar 0, so only the tail of the window shows
    expect(litIn(container)).toEqual([0, 1, 2, 3]);
    restore();
  });

  it('tapers the lit window away from the head', () => {
    const restore = stubWidths({ strip: 948 });
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);
    const bars = barsIn(container);

    expect(bars[0].style.height).toBe('18px');
    expect(bars[0].style.opacity).toBe('1');
    expect(parseFloat(bars[1].style.height)).toBeLessThan(18);
    expect(parseFloat(bars[2].style.height)).toBeLessThan(parseFloat(bars[1].style.height));
    expect(parseFloat(bars[3].style.height)).toBeCloseTo(8, 5);
    expect(bars[4].hasAttribute('data-on')).toBe(false);
    expect(bars[4].style.height).toBe('');
    restore();
  });

  it('leaves the strip empty when there is no room to measure', () => {
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);
    expect(barsIn(container)).toHaveLength(0);
  });

  it('neither pins nor tweens under reduced motion', () => {
    setMedia({ reduce: true });
    const fromTo = vi.spyOn(gsap, 'fromTo');
    const restore = stubWidths({ track: 3768, viewport: 1440 });

    const { container } = render(<TestimonialReelFocus items={ITEMS} />);

    expect(fromTo).not.toHaveBeenCalled();
    expect(container.querySelector('[data-reel-pin]')!.className).not.toContain('h-[calc(');
    // The row stays reachable as a plain scroller instead
    expect(container.querySelector('[data-reel-viewport]')!.className).toContain('overflow-x-auto');
    restore();
  });

  it('pushes the other cards back when one is hovered, and restores them on leave', () => {
    const tween = vi.spyOn(gsap, 'to');
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);
    const cards = cardsIn(container);
    const shells = Array.from(container.querySelectorAll<HTMLElement>('[data-reel-shell]'));

    fireEvent.pointerEnter(cards[0]);
    const dimmed = tween.mock.calls.map(([target, vars]) => ({
      card: shells.indexOf(target as HTMLElement),
      opacity: (vars as { opacity: number }).opacity,
    }));
    expect(dimmed).toHaveLength(3);
    expect(dimmed.find((c) => c.card === 0)?.opacity).toBe(1);
    expect(dimmed.find((c) => c.card === 1)?.opacity).toBe(0.38);
    expect(dimmed.find((c) => c.card === 2)?.opacity).toBe(0.38);

    tween.mockClear();
    fireEvent.pointerLeave(cards[0]);
    expect(tween.mock.calls.every(([, vars]) => (vars as { opacity: number }).opacity === 1)).toBe(
      true
    );
  });

  it('does not pull focus on touch, where there is no pointer to follow', () => {
    setMedia({ hover: false });
    const tween = vi.spyOn(gsap, 'to');
    const { container } = render(<TestimonialReelFocus items={ITEMS} />);

    fireEvent.pointerEnter(cardsIn(container)[0]);
    expect(tween).not.toHaveBeenCalled();
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<TestimonialReelFocus items={ITEMS} className="mt-10" />);
    expect(container.querySelector('[data-testimonial-reel-focus]')).toHaveClass('mt-10');
  });

  it('renders its own sample reel when given no items', () => {
    const { container } = render(<TestimonialReelFocus />);
    expect(cardsIn(container)).toHaveLength(8);
    expect(cardsIn(container)[7]).toHaveTextContent('08/08');
  });
});
