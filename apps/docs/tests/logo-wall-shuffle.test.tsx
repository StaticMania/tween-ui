import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LogoWallShuffle, { type LogoWallLogo } from '@/registry/tweenui/logo-wall-shuffle';

const LOGOS: LogoWallLogo[] = [
  { src: '/slack.svg', alt: 'Slack' },
  { src: '/figma.svg', alt: 'Figma' },
  { src: '/linear.svg', srcDark: '/linear-dark.svg', alt: 'Linear' },
  { src: '/stripe.svg', alt: 'Stripe' },
];

describe('Logo Wall Shuffle', () => {
  it('renders the heading and description', () => {
    render(
      <LogoWallShuffle
        title="Your entire tech stack"
        description="Bring every workflow together."
        logos={LOGOS}
      />
    );

    expect(screen.getByText('Your entire tech stack')).toBeInTheDocument();
    expect(screen.getByText('Bring every workflow together.')).toBeInTheDocument();
  });

  it('builds one tile per slot in the column pattern', () => {
    const { container } = render(<LogoWallShuffle logos={LOGOS} columns={[1, 2, 1]} />);
    expect(container.querySelectorAll('[data-logo-wall-tile]')).toHaveLength(4);
  });

  it('defaults to the 14-tile wall', () => {
    const { container } = render(<LogoWallShuffle logos={LOGOS} />);
    expect(container.querySelectorAll('[data-logo-wall-tile]')).toHaveLength(14);
  });

  it('renders a dark variant only for logos that provide one', () => {
    const { container } = render(<LogoWallShuffle logos={LOGOS} columns={[3]} />);
    const sources = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'));

    expect(sources).toContain('/linear.svg');
    expect(sources).toContain('/linear-dark.svg');
    expect(sources.filter((src) => src === '/slack.svg')).toHaveLength(1);
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<LogoWallShuffle logos={LOGOS} className="mt-10" />);
    expect(container.querySelector('[data-logo-wall-shuffle]')).toHaveClass('mt-10');
  });
});
