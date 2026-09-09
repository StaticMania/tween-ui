import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CtaPhotoHeadline from '@/registry/tweenui/cta-photo-headline';

const AVATARS = [
  { src: '/a.jpg', alt: 'Ada' },
  { src: '/b.jpg', alt: 'Ben' },
];

describe('CTA Photo Headline', () => {
  it('renders the heading, description, and avatars', () => {
    render(
      <CtaPhotoHeadline
        lead="Turn static"
        mid="into motion"
        end="with Tween UI"
        description="Copy-paste GSAP blocks for React."
        avatars={AVATARS}
      />
    );

    expect(screen.getByText('Turn static')).toBeInTheDocument();
    expect(screen.getByText('into motion')).toBeInTheDocument();
    expect(screen.getByText('with Tween UI')).toBeInTheDocument();
    expect(screen.getByText('Copy-paste GSAP blocks for React.')).toBeInTheDocument();
    expect(screen.getByAltText('Ada')).toBeInTheDocument();
    expect(screen.getByAltText('Ben')).toBeInTheDocument();
  });

  it('renders the CTA label', () => {
    render(<CtaPhotoHeadline avatars={AVATARS} ctaLabel="Browse the blocks" />);
    expect(screen.getByRole('button', { name: 'Browse the blocks' })).toBeInTheDocument();
  });

  it('calls onCtaClick when the button is pressed', () => {
    const onCtaClick = vi.fn();
    render(
      <CtaPhotoHeadline avatars={AVATARS} ctaLabel="Browse the blocks" onCtaClick={onCtaClick} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Browse the blocks' }));
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<CtaPhotoHeadline avatars={AVATARS} className="mt-10" />);
    expect(container.querySelector('[data-cta-photo-headline]')).toHaveClass('mt-10');
  });
});
