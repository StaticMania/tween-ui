import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TestimonialRing, { type RingTestimonial } from '@/registry/tweenui/testimonial-ring';

vi.mock('@number-flow/react', () => ({
  default: ({
    value,
    prefix = '',
    suffix = '',
  }: {
    value: number;
    prefix?: string;
    suffix?: string;
  }) => <span data-testid="metric">{`${prefix}${value}${suffix}`}</span>,
}));

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

const make = (name: string, value: number): RingTestimonial => ({
  quote: `${name} says it works.`,
  name,
  role: 'Lead',
  company: `${name} Co`,
  image: `/${name}.jpg`,
  metric: { value, suffix: '%', label: `${name} metric` },
});

const THREE = [make('Ana', 10), make('Ben', 20), make('Cleo', 30)];

const setMedia = ({ reduce, fine }: { reduce: boolean; fine: boolean }) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce') ? reduce : query.includes('pointer: fine') ? fine : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

const chipOf = (container: HTMLElement) =>
  container.querySelector('[data-chip-word]')?.closest<HTMLElement>('[aria-hidden="true"]');

describe('Testimonial Ring drag chip', () => {
  afterEach(() => vi.restoreAllMocks());

  it('comes up over a card but not over the floor around it', () => {
    setMedia({ reduce: false, fine: true });
    const { container } = render(<TestimonialRing testimonials={THREE} />);
    const stage = container.querySelector('[data-chip-on]') as HTMLElement;
    const card = container.querySelector('[data-ring-card] img') as HTMLElement;
    const floor = stage.firstElementChild as HTMLElement;
    let under: Element = floor;
    document.elementFromPoint = vi.fn(() => under);

    const pointer = (type: string) => {
      const event = new MouseEvent(type, { bubbles: true, clientX: 50, clientY: 50 });
      Object.defineProperty(event, 'pointerType', { value: 'mouse' });
      fireEvent(stage, event);
    };
    const move = () => pointer('pointermove');

    pointer('pointerenter');
    move();
    expect(stage).not.toHaveAttribute('data-chip-over');

    under = card;
    move();
    expect(stage).toHaveAttribute('data-chip-over');

    under = floor;
    move();
    expect(stage).not.toHaveAttribute('data-chip-over');
  });

  it('switches on for a mouse', () => {
    setMedia({ reduce: false, fine: true });
    const { container } = render(<TestimonialRing testimonials={THREE} />);

    expect(chipOf(container)).toHaveAttribute('data-on');
    const stage = container.querySelector('[data-ring-card]')?.closest('[data-chip-on]');
    expect(stage).not.toBeNull();
  });

  it('stays off on touch screens, keeping the grab cursor', () => {
    setMedia({ reduce: false, fine: false });
    const { container } = render(<TestimonialRing testimonials={THREE} />);

    expect(chipOf(container)).not.toHaveAttribute('data-on');
    expect(container.querySelector('[data-chip-on]')).toBeNull();
  });

  it('stays off under reduced motion', () => {
    setMedia({ reduce: true, fine: true });
    const { container } = render(<TestimonialRing testimonials={THREE} />);

    expect(chipOf(container)).not.toHaveAttribute('data-on');
  });

  it('reads "Spin" while the ring is held and "Drag" again once let go', () => {
    setMedia({ reduce: false, fine: true });
    const { container } = render(<TestimonialRing testimonials={THREE} />);
    const stage = container.querySelector('[data-chip-on]') as HTMLElement;
    const word = container.querySelector('[data-chip-word]');

    // jsdom's pointer events carry no pointerType, and the chip only answers a mouse
    const mouse = (type: string) => {
      const event = new MouseEvent(type, { bubbles: true, clientX: 10, clientY: 10 });
      Object.defineProperty(event, 'pointerType', { value: 'mouse' });
      fireEvent(stage, event);
    };

    mouse('pointerdown');
    expect(word).toHaveTextContent('Spin');

    mouse('pointerup');
    expect(word).toHaveTextContent('Drag');
  });
});

describe('Testimonial Ring', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => vi.restoreAllMocks());

  it('is a carousel labelled by its title', () => {
    render(<TestimonialRing title="What teams say." />);

    const section = screen.getByRole('region', { name: 'What teams say.' });
    expect(section).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('shows the front testimonial as real text below the ring', () => {
    render(<TestimonialRing testimonials={THREE} />);

    expect(screen.getByText('“Ana says it works.”')).toBeInTheDocument();
    expect(screen.getByText('Lead, Ana Co')).toBeInTheDocument();
    expect(screen.getByTestId('metric')).toHaveTextContent('10%');
  });

  it('repeats the testimonials until the ring has at least ten cards', () => {
    const { container, rerender } = render(<TestimonialRing testimonials={THREE} />);
    expect(container.querySelectorAll('[data-ring-card]')).toHaveLength(12);

    rerender(<TestimonialRing />);
    expect(container.querySelectorAll('[data-ring-card]')).toHaveLength(12);

    rerender(<TestimonialRing testimonials={[make('Solo', 1)]} />);
    expect(container.querySelectorAll('[data-ring-card]')).toHaveLength(10);
  });

  it('keeps the 3D ring out of the accessibility tree', () => {
    const { container } = render(<TestimonialRing testimonials={THREE} />);

    const stage = container.querySelector('[data-ring-card]')?.closest('[aria-hidden="true"]');
    expect(stage).not.toBeNull();
    expect(screen.getAllByText('Ana says it works.', { exact: false })).toHaveLength(1);
  });

  it('steps to the next and previous testimonial from the arrow buttons', async () => {
    render(<TestimonialRing testimonials={THREE} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next testimonial' }));
    await waitFor(() => expect(screen.getByText('“Ben says it works.”')).toBeInTheDocument());
    expect(screen.getByTestId('metric')).toHaveTextContent('20%');

    fireEvent.click(screen.getByRole('button', { name: 'Previous testimonial' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous testimonial' }));
    await waitFor(() => expect(screen.getByText('“Cleo says it works.”')).toBeInTheDocument());
  });

  it('steps with the arrow keys anywhere inside the section', async () => {
    render(<TestimonialRing testimonials={THREE} />);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Next testimonial' }), {
      key: 'ArrowRight',
    });
    await waitFor(() => expect(screen.getByText('“Ben says it works.”')).toBeInTheDocument());
  });

  it('spins towards the next card instead of jumping when motion is allowed', () => {
    setReducedMotion(false);
    render(<TestimonialRing testimonials={THREE} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next testimonial' }));

    expect(screen.getByText('“Ana says it works.”')).toBeInTheDocument();
  });
});
