import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import IntegrationHub from '@/registry/tweenui/integration-hub';

const LEFT = [
  { src: '/a.svg', alt: 'Alpha' },
  { src: '/b.svg', alt: 'Beta' },
  { src: '/c.svg', alt: 'Gamma' },
];

const RIGHT = [
  { src: '/d.svg', alt: 'Delta' },
  { src: '/e.svg', alt: 'Epsilon' },
  { src: '/f.svg', alt: 'Zeta' },
];

describe('Integration Hub', () => {
  it('renders the heading, description, and logos', () => {
    render(
      <IntegrationHub
        title="One hub for every integration"
        description="Connect your stack."
        left={LEFT}
        right={RIGHT}
      />
    );

    expect(screen.getByText('One hub for every integration')).toBeInTheDocument();
    expect(screen.getByText('Connect your stack.')).toBeInTheDocument();
    expect(screen.getByAltText('Alpha')).toBeInTheDocument();
    expect(screen.getByAltText('Zeta')).toBeInTheDocument();
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<IntegrationHub left={LEFT} right={RIGHT} className="mt-10" />);
    expect(container.querySelector('[data-integration-hub]')).toHaveClass('mt-10');
  });
});
