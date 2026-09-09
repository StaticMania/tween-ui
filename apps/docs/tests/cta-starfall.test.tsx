import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CtaStarfall from '@/registry/tweenui/cta-starfall';

describe('CTA Starfall', () => {
  it('renders the heading, description, and action', () => {
    render(
      <CtaStarfall
        title="Turn content into videos"
        description="We handle the hard part."
        action={{ label: 'Start creating' }}
      />
    );

    expect(screen.getByText('Turn content into videos')).toBeInTheDocument();
    expect(screen.getByText('We handle the hard part.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start creating/ })).toBeInTheDocument();
  });

  it('renders one star per starCount, hidden from the a11y tree', () => {
    const { container } = render(<CtaStarfall starCount={12} />);

    expect(container.querySelectorAll('[data-star]')).toHaveLength(12);
    expect(container.querySelector('[data-star]')?.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('hides the action when passed null', () => {
    render(<CtaStarfall action={null} starCount={4} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<CtaStarfall className="mt-10" starCount={4} />);
    expect(container.querySelector('[data-cta-starfall]')).toHaveClass('mt-10');
  });
});
