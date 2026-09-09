import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LineSweep, { type LineSweepItem } from '@/registry/tweenui/line-sweep';

const item = (name: string, jobTitle: string): LineSweepItem => ({
  quoteStart: 'We replaced four tools with one workflow, and',
  quoteHighlight: 'the team shipped two weeks early.',
  quoteEnd: 'Nobody has asked to go back.',
  name,
  jobTitle,
  image: `/${name}.jpg`,
});

const ITEMS = [
  item('Maya Collins', 'Head of Operations'),
  item('Ethan Brooks', 'President of Sales'),
];

describe('Line Sweep', () => {
  it('renders the heading, description, and every quote', () => {
    render(
      <LineSweep
        title="What our clients say about us"
        description="Hear from the people who use it daily."
        items={ITEMS}
      />
    );

    expect(screen.getByText('What our clients say about us')).toBeInTheDocument();
    expect(screen.getByText('Hear from the people who use it daily.')).toBeInTheDocument();
    expect(screen.getByText('Maya Collins')).toBeInTheDocument();
    expect(screen.getByText('President of Sales')).toBeInTheDocument();
    expect(screen.getAllByText('the team shipped two weeks early.')).toHaveLength(2);
  });

  it('exposes labelled paging controls', () => {
    render(<LineSweep items={ITEMS} />);

    expect(screen.getByRole('button', { name: 'Previous testimonials' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next testimonials' })).toBeInTheDocument();
  });

  it('labels the star row and falls back to the name for alt text', () => {
    render(<LineSweep items={ITEMS} />);

    expect(screen.getAllByLabelText('5 out of 5 stars')).toHaveLength(2);
    expect(screen.getByAltText('Maya Collins')).toBeInTheDocument();
  });

  it('honours an explicit imageAlt', () => {
    render(<LineSweep items={[{ ...ITEMS[0], imageAlt: 'Maya at her desk' }]} />);
    expect(screen.getByAltText('Maya at her desk')).toBeInTheDocument();
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<LineSweep items={ITEMS} className="mt-10" />);
    expect(container.querySelector('[data-line-sweep]')).toHaveClass('mt-10');
  });
});
