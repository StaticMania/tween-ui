import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AvatarReveal from '@/registry/tweenui/avatar/avatar-reveal';

describe('Avatar Reveal', () => {
  it('renders default avatars and caption', () => {
    render(<AvatarReveal />);
    expect(screen.getByText(/2,000\+ teams shipping faster this week/i)).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('renders custom avatars and caption', () => {
    render(
      <AvatarReveal avatars={[{ src: '/a.jpg', alt: 'Ada' }]}>Shipped this week.</AvatarReveal>
    );
    expect(screen.getByRole('img', { name: /ada/i })).toHaveAttribute('src', '/a.jpg');
    expect(screen.getByText(/shipped this week/i)).toBeInTheDocument();
  });
});
