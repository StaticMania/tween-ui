import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import InfiniteRotatingCards from '@/registry/tweenui/infinite-rotating-cards';

const CARDS = [
  { title: 'Brand motion', image: '/a.jpg', imageAlt: 'Brand frames' },
  { title: 'Product UI', image: '/b.jpg', imageAlt: 'Product UI' },
];

describe('Infinite Rotating Cards', () => {
  it('renders the heading, description, and cards', () => {
    render(
      <InfiniteRotatingCards
        title="Motion that actually ships"
        description="Cards ride a slow wheel."
        cards={CARDS}
      />
    );

    expect(screen.getByText('Motion that actually ships')).toBeInTheDocument();
    expect(screen.getByText('Cards ride a slow wheel.')).toBeInTheDocument();
    expect(screen.getByText('Brand motion')).toBeInTheDocument();
    expect(screen.getByAltText('Product UI')).toBeInTheDocument();
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<InfiniteRotatingCards cards={CARDS} className="mt-10" />);
    expect(container.querySelector('[data-infinite-rotating-cards]')).toHaveClass('mt-10');
  });
});
