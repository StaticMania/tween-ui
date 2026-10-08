import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FocusFrameButton from '@/registry/tweenui/focus-frame-button';

describe('Focus Frame Button', () => {
  it('renders a button with its label as the single accessible name', () => {
    render(<FocusFrameButton>Talk to the team</FocusFrameButton>);
    expect(screen.getByRole('button', { name: 'Talk to the team' })).toHaveAttribute(
      'type',
      'button'
    );
  });

  it('rolls the whole label to a hidden copy', () => {
    render(<FocusFrameButton>Talk to the team</FocusFrameButton>);
    const copies = screen.getAllByText('Talk to the team');
    expect(copies).toHaveLength(2);
    expect(copies[1]).toHaveAttribute('aria-hidden', 'true');
  });

  it('slides a fresh return arrow in behind the old one', () => {
    const { container } = render(<FocusFrameButton>Go</FocusFrameButton>);
    const arrows = container.querySelectorAll('svg');
    expect(arrows).toHaveLength(2);
    arrows.forEach((arrow) => expect(arrow).toHaveClass('-translate-x-full'));
  });

  it('fires onClick and forwards native props', () => {
    const onClick = vi.fn();
    render(
      <FocusFrameButton onClick={onClick} data-testid="frame">
        Talk to the team
      </FocusFrameButton>
    );
    fireEvent.click(screen.getByTestId('frame'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <FocusFrameButton disabled onClick={onClick}>
        Talk to the team
      </FocusFrameButton>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards a ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<FocusFrameButton ref={ref}>Talk to the team</FocusFrameButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
