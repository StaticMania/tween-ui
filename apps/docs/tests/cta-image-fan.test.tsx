import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CtaImageFan from '@/registry/tweenui/cta/cta-image-fan';

const IMAGES = [
  { src: '/a.jpg', alt: 'Alpha' },
  { src: '/b.jpg', alt: 'Beta' },
  { src: '/c.jpg', alt: 'Gamma' },
];

describe('CTA Image Fan', () => {
  it('renders the heading, description, and images', () => {
    render(
      <CtaImageFan title="Ready to accelerate" description="Take the first step." images={IMAGES} />
    );

    expect(screen.getByText('Ready to accelerate')).toBeInTheDocument();
    expect(screen.getByText('Take the first step.')).toBeInTheDocument();
    expect(screen.getByAltText('Alpha')).toBeInTheDocument();
    expect(screen.getByAltText('Beta')).toBeInTheDocument();
  });

  it('renders the CTA label', () => {
    render(<CtaImageFan images={IMAGES} ctaLabel="Get started" />);
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument();
  });

  it('calls onCtaClick when the button is pressed', () => {
    const onCtaClick = vi.fn();
    render(<CtaImageFan images={IMAGES} ctaLabel="Try for free" onCtaClick={onCtaClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Try for free' }));
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<CtaImageFan images={IMAGES} className="mt-10" />);
    expect(container.querySelector('[data-cta-image-fan]')).toHaveClass('mt-10');
  });
});
