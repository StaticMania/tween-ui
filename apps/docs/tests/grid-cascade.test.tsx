import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GridCascade, { type GridCascadeItem } from '@/registry/tweenui/grid-cascade';

const item = (name: string): GridCascadeItem => ({
  name,
  position: `${name} role`,
  review: `${name} shipped two weeks early.`,
  image: `/${name}.jpg`,
});

const SIX = ['Maya', 'Ethan', 'Liam', 'Ava', 'Noah', 'Zoe'].map(item);

describe('Grid Cascade', () => {
  it('renders the heading and only the first page of cards', () => {
    render(<GridCascade title="What our users say" items={SIX} perPage={3} />);

    expect(screen.getByText('What our users say')).toBeInTheDocument();
    expect(screen.getByText('Maya')).toBeInTheDocument();
    expect(screen.getByText('Liam')).toBeInTheDocument();
    expect(screen.queryByText('Ava')).not.toBeInTheDocument();
  });

  // Paging waits for the outgoing cards to drop away, so the swap is async.
  it('pages forward to the next set', async () => {
    render(<GridCascade items={SIX} perPage={3} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next testimonials' }));

    expect(await screen.findByText('Ava')).toBeInTheDocument();
    expect(screen.queryByText('Maya')).not.toBeInTheDocument();
  });

  it('wraps backwards from the first page when looping', async () => {
    render(<GridCascade items={SIX} perPage={3} />);

    fireEvent.click(screen.getByRole('button', { name: 'Previous testimonials' }));

    expect(await screen.findByText('Zoe')).toBeInTheDocument();
  });

  it('stays put at the first page when loop is off', () => {
    render(<GridCascade items={SIX} perPage={3} loop={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'Previous testimonials' }));

    expect(screen.getByText('Maya')).toBeInTheDocument();
    expect(screen.queryByText('Zoe')).not.toBeInTheDocument();
  });

  it('hides the controls when everything fits on one page', () => {
    render(<GridCascade items={SIX.slice(0, 3)} perPage={3} />);

    expect(screen.queryByRole('button', { name: 'Next testimonials' })).not.toBeInTheDocument();
  });

  it('shows a profile button only for items that carry a link', () => {
    render(<GridCascade items={[{ ...SIX[0], link: '#' }, SIX[1]]} perPage={3} />);

    expect(screen.getByLabelText('Maya on X')).toBeInTheDocument();
    expect(screen.queryByLabelText('Ethan on X')).not.toBeInTheDocument();
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<GridCascade items={SIX} className="mt-10" />);
    expect(container.querySelector('[data-grid-cascade]')).toHaveClass('mt-10');
  });
});
