import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TestimonialColumnDrift, {
  type TestimonialColumnDriftItem,
} from '@/registry/tweenui/testimonial-column-drift';

const item = (name: string, jobTitle: string): TestimonialColumnDriftItem => ({
  name,
  jobTitle,
  image: `/${name}.jpg`,
  quoteBefore: 'The photos were sharp,',
  quoteHighlight: 'and made our site look premium.',
  quoteAfter: 'They captured the brand.',
});

const COLUMNS = [
  [item('Liam Harper', 'Dog Trainer')],
  [item('Ethan Brooks', 'President of Sales')],
  [item('Ava Sinclair', 'Marketing Head')],
];

describe('Testimonial Column Drift', () => {
  it('renders the heading, description, and every column', () => {
    render(
      <TestimonialColumnDrift
        title="Latest creations and projects"
        description="What teams say after shipping."
        columns={COLUMNS}
      />
    );

    expect(screen.getByText('Latest creations and projects')).toBeInTheDocument();
    expect(screen.getByText('What teams say after shipping.')).toBeInTheDocument();
    expect(screen.getByText('Liam Harper')).toBeInTheDocument();
    expect(screen.getByText('President of Sales')).toBeInTheDocument();
    expect(screen.getByAltText('Ava Sinclair')).toBeInTheDocument();
  });

  it('drops the rating card into the middle column, and hides it when null', () => {
    const { rerender } = render(
      <TestimonialColumnDrift columns={COLUMNS} rating={{ score: '4.8', label: 'Real Rating' }} />
    );
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('Real Rating')).toBeInTheDocument();

    rerender(<TestimonialColumnDrift columns={COLUMNS} rating={null} />);
    expect(screen.queryByText('4.8')).not.toBeInTheDocument();
  });

  it('labels the star row with the filled count', () => {
    render(
      <TestimonialColumnDrift
        columns={[[{ ...item('Zoe', 'Designer'), stars: 5 }]]}
        rating={null}
      />
    );
    expect(screen.getByLabelText('5 out of 5 stars')).toBeInTheDocument();
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<TestimonialColumnDrift columns={COLUMNS} className="mt-10" />);
    expect(container.querySelector('[data-testimonial-column-drift]')).toHaveClass('mt-10');
  });
});
