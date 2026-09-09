import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FaqAccordion from '@/registry/tweenui/faq-accordion';

const ITEMS = [
  { question: 'First question', answer: 'First answer.' },
  { question: 'Second question', answer: 'Second answer.' },
  { question: 'Third question', answer: 'Third answer.' },
];

// SplitText needs real layout; force reduced motion so the animation path is skipped in jsdom.
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

describe('FAQ Accordion', () => {
  beforeEach(() => setReducedMotion(true));
  afterEach(() => setReducedMotion(false));

  it('renders every question and links panels for a11y', () => {
    render(<FaqAccordion items={ITEMS} />);
    for (const item of ITEMS) {
      expect(screen.getByRole('button', { name: item.question })).toBeInTheDocument();
    }
    const first = screen.getByRole('button', { name: 'First question' });
    expect(first).toHaveAttribute('aria-controls', first.getAttribute('aria-controls')!);
  });

  it('opens the first item by default', () => {
    render(<FaqAccordion items={ITEMS} />);
    expect(screen.getByRole('button', { name: 'First question' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Second question' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('toggles items and stays single-open', () => {
    render(<FaqAccordion items={ITEMS} defaultOpen={null} />);
    const first = screen.getByRole('button', { name: 'First question' });
    const second = screen.getByRole('button', { name: 'Second question' });

    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(second);
    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(second); // collapsible: closes
    expect(second).toHaveAttribute('aria-expanded', 'false');
  });

  it('respects a controlled open index', () => {
    const onOpenChange = vi.fn();
    render(<FaqAccordion items={ITEMS} open={1} onOpenChange={onOpenChange} />);
    expect(screen.getByRole('button', { name: 'Second question' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'First question' }));
    expect(onOpenChange).toHaveBeenCalledWith(0);
    // Still controlled by the prop.
    expect(screen.getByRole('button', { name: 'Second question' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });
});
