import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CardSpotlightGrid from '@/registry/tweenui/card-spotlight-grid';

const PROJECTS = [
  { title: 'Northwind', excerpt: 'Brand & site', image: '/a.jpg', imageAlt: 'Brand shapes' },
  { title: 'Lumen', excerpt: 'Product UI', image: '/b.jpg', imageAlt: 'Product interface' },
];

describe('Card Spotlight Grid', () => {
  it('renders the heading, description, and every tile', () => {
    render(
      <CardSpotlightGrid
        title="Where ideas become experiences"
        description="Built with one goal."
        projects={PROJECTS}
      />
    );

    expect(screen.getByText('Where ideas become experiences')).toBeInTheDocument();
    expect(screen.getByText('Built with one goal.')).toBeInTheDocument();
    expect(screen.getByText('Northwind')).toBeInTheDocument();
    expect(screen.getByAltText('Product interface')).toBeInTheDocument();
  });

  it('links each tile, falling back to # when no href is given', () => {
    render(
      <CardSpotlightGrid projects={[{ ...PROJECTS[0], href: '/work/northwind' }, PROJECTS[1]]} />
    );

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/work/northwind');
    expect(links[1]).toHaveAttribute('href', '#');
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<CardSpotlightGrid projects={PROJECTS} className="mt-10" />);
    expect(container.querySelector('[data-card-spotlight-grid]')).toHaveClass('mt-10');
  });
});
