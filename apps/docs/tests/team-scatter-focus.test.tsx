import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TeamScatterFocus, {
  type TeamScatterFocusMember,
} from '@/registry/tweenui/team-scatter-focus';

const MEMBERS: TeamScatterFocusMember[] = [
  { name: 'John Smith', role: 'CEO & Founder', image: '/a.jpg', social: 'https://x.com/john' },
  { name: 'William Finley', role: 'Lead Designer', image: '/b.jpg' },
];

describe('Team Scatter Focus', () => {
  it('renders the heading, description, and every member', () => {
    render(
      <TeamScatterFocus
        title="The people who make it happen"
        description="Deep expertise, shared focus."
        members={MEMBERS}
      />
    );

    expect(screen.getByText('The people who make it happen')).toBeInTheDocument();
    expect(screen.getByText('Deep expertise, shared focus.')).toBeInTheDocument();
    // Each member renders twice — once in the collage, once in the stacked fallback.
    expect(screen.getAllByText('John Smith')).toHaveLength(2);
    expect(screen.getAllByText('Lead Designer')).toHaveLength(2);
  });

  it('shows a social button only for members that have one', () => {
    render(<TeamScatterFocus members={MEMBERS} />);

    expect(screen.getAllByLabelText('John Smith on X')).toHaveLength(2);
    expect(screen.queryByLabelText('William Finley on X')).not.toBeInTheDocument();
  });

  it('falls back to the built-in scatter slot when a member has no position', () => {
    const { container } = render(<TeamScatterFocus members={MEMBERS} />);
    const slots = container.querySelectorAll('.absolute');

    expect(slots[0]).toHaveClass('z-2');
    expect(slots[1]).toHaveClass('z-1');
  });

  it('honours a custom position over the fallback', () => {
    const { container } = render(
      <TeamScatterFocus members={[{ ...MEMBERS[0], position: 'left-[10%] top-[10%]' }]} />
    );

    expect(container.querySelector('.absolute')).toHaveClass('left-[10%]');
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<TeamScatterFocus members={MEMBERS} className="mt-10" />);
    expect(container.querySelector('[data-team-scatter-focus]')).toHaveClass('mt-10');
  });
});
