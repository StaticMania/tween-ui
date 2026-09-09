import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HeroRotatingCards from '@/registry/tweenui/hero-rotating-cards';

const CARDS = [
  { title: 'Brand motion', image: '/a.jpg', imageAlt: 'Brand frames' },
  { title: 'Product UI', image: '/b.jpg', imageAlt: 'Product UI' },
];

describe('Hero Rotating Cards', () => {
  it('renders the heading, description, and cards', () => {
    render(
      <HeroRotatingCards
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
    const { container } = render(<HeroRotatingCards cards={CARDS} className="mt-10" />);
    expect(container.querySelector('[data-hero-rotating-cards]')).toHaveClass('mt-10');
  });
});
