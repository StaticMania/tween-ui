import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProcessStickySteps from '@/registry/tweenui/process/process-sticky-steps';

const STEPS = [
  {
    id: 'one',
    title: 'Write or paste script',
    description: 'Draft your message.',
    image: '/one.jpg',
    imageAlt: 'Write photo',
  },
  {
    id: 'two',
    title: 'Choose your voice style',
    description: 'Pick a voice.',
    image: '/two.jpg',
    imageAlt: 'Voice photo',
  },
];

describe('Process Sticky Steps', () => {
  it('renders every step image and title', () => {
    render(<ProcessStickySteps steps={STEPS} />);

    expect(screen.getByAltText('Write photo')).toBeInTheDocument();
    expect(screen.getByAltText('Voice photo')).toBeInTheDocument();
    expect(screen.getByText('Write or paste script')).toBeInTheDocument();
    expect(screen.getByText('Choose your voice style')).toBeInTheDocument();
  });

  it('marks the first step active', () => {
    const { container } = render(<ProcessStickySteps steps={STEPS} />);
    expect(container.querySelector('[data-process-sticky-steps]')).toHaveAttribute(
      'data-active-step',
      '0'
    );
  });

  it('jumps to a step when its button is clicked', () => {
    const { container } = render(<ProcessStickySteps steps={STEPS} />);
    const next = screen.getByRole('button', { name: /go to step 2/i });

    fireEvent.click(next);

    expect(container.querySelector('[data-process-sticky-steps]')).toHaveAttribute(
      'data-active-step',
      '1'
    );
    expect(container.querySelector('[data-active="true"]')).toHaveTextContent(
      'Choose your voice style'
    );
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(<ProcessStickySteps steps={STEPS} className="mt-10" />);
    expect(container.querySelector('[data-process-sticky-steps]')).toHaveClass('mt-10');
  });
});
