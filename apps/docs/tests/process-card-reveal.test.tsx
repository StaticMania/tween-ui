import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProcessCardReveal from '@/registry/tweenui/process-card-reveal';

const STEPS = [
  {
    id: 'one',
    title: 'Connect apps',
    description: 'Link your tools.',
    image: '/one.jpg',
    imageAlt: 'Connect photo',
    details: [{ title: 'Integrations', description: 'One-click setup.' }],
  },
  {
    id: 'two',
    title: 'Build flows',
    description: 'Arrange the steps.',
    image: '/two.jpg',
    imageAlt: 'Build photo',
    details: [{ title: 'Builder', description: 'Drag and drop.' }],
  },
];

describe('Process Card Reveal', () => {
  it('renders every step image and title', () => {
    render(<ProcessCardReveal steps={STEPS} />);

    expect(screen.getAllByAltText('Connect photo').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText('Build photo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Connect apps').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Build flows').length).toBeGreaterThan(0);
  });

  it('marks the first step active', () => {
    const { container } = render(<ProcessCardReveal steps={STEPS} />);
    expect(container.querySelector('[data-process-card-reveal]')).toHaveAttribute(
      'data-active-step',
      '0'
    );
  });

  it('jumps to a step when its button is clicked', () => {
    const { container } = render(<ProcessCardReveal steps={STEPS} />);
    const next = screen.getAllByRole('button', { name: /go to step 2/i })[0];

    fireEvent.click(next);

    expect(container.querySelector('[data-process-card-reveal]')).toHaveAttribute(
      'data-active-step',
      '1'
    );
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<ProcessCardReveal steps={STEPS} className="mt-10" />);
    expect(container.querySelector('[data-process-card-reveal]')).toHaveClass('mt-10');
  });
});
