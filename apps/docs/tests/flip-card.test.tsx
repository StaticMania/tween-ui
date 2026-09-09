import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FlipCard from '@/registry/tweenui/flip-card';

describe('Flip Card', () => {
  it('renders the title (on both faces)', () => {
    render(<FlipCard title="Web Design" />);
    expect(screen.getAllByText('Web Design').length).toBeGreaterThan(0);
  });

  it('renders back features and CTA', () => {
    render(<FlipCard title="Web Design" features={['UX', 'UI']} href="#" ctaText="Explore" />);
    expect(screen.getByText('UX')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute('href', '#');
  });

  it('toggles the flip on tap when hover is unavailable', () => {
    const { container } = render(<FlipCard title="Web Design" />);
    const card = container.querySelector('[data-flip-card]')!;
    expect(card).toHaveAttribute('data-flipped', 'false');
    fireEvent.click(card);
    expect(card).toHaveAttribute('data-flipped', 'true');
  });

  it('respects a controlled flipped prop', () => {
    const { container } = render(<FlipCard title="Web Design" flipped />);
    expect(container.querySelector('[data-flip-card]')).toHaveAttribute('data-flipped', 'true');
  });
});
