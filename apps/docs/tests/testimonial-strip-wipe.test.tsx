import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TestimonialStripWipe from '@/registry/tweenui/testimonial-strip-wipe';

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>,
}));

const TESTIMONIALS = [
  {
    id: 'one',
    image: '/one.jpg',
    imageAlt: 'First customer',
    quote: 'The first quote about faster handoffs.',
  },
  {
    id: 'two',
    image: '/two.jpg',
    imageAlt: 'Second customer',
    quote: 'The second quote about a clearer pipeline.',
  },
];

describe('Testimonial Strip Wipe', () => {
  it('renders every quote and image', () => {
    render(<TestimonialStripWipe testimonials={TESTIMONIALS} />);

    expect(screen.getByAltText('First customer')).toBeInTheDocument();
    expect(screen.getByAltText('Second customer')).toBeInTheDocument();
    expect(screen.getByText(/first quote about faster handoffs/i)).toBeInTheDocument();
    expect(screen.getByText(/second quote about a clearer pipeline/i)).toBeInTheDocument();
  });

  it('marks the first slide active', () => {
    const { container } = render(<TestimonialStripWipe testimonials={TESTIMONIALS} />);
    expect(container.querySelector('[data-testimonial-strip-wipe]')).toHaveAttribute(
      'data-active-slide',
      '0'
    );
  });

  it('wipes left-to-right on next and right-to-left on prev', () => {
    const { container } = render(<TestimonialStripWipe testimonials={TESTIMONIALS} />);
    const root = () => container.querySelector('[data-testimonial-strip-wipe]');

    fireEvent.click(screen.getByRole('button', { name: /next testimonial/i }));
    expect(root()).toHaveAttribute('data-active-slide', '1');
    expect(root()).toHaveAttribute('data-split-from', 'left');

    fireEvent.click(screen.getByRole('button', { name: /previous testimonial/i }));
    expect(root()).toHaveAttribute('data-split-from', 'right');
  });

  it('keeps the original right-to-left split when directional is false', () => {
    const { container } = render(
      <TestimonialStripWipe testimonials={TESTIMONIALS} directional={false} />
    );

    fireEvent.click(screen.getByRole('button', { name: /next testimonial/i }));

    expect(container.querySelector('[data-testimonial-strip-wipe]')).toHaveAttribute(
      'data-split-from',
      'right'
    );
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(
      <TestimonialStripWipe testimonials={TESTIMONIALS} className="mt-10" />
    );
    expect(container.querySelector('[data-testimonial-strip-wipe]')).toHaveClass('mt-10');
  });
});
