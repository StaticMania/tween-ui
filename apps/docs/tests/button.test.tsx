import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AnimatedSlidingButton from '@/registry/tweenui/button/animated-sliding-button';

describe('Animated Sliding Button', () => {
  it('renders its children and mounts without error', () => {
    render(<AnimatedSlidingButton>Get started</AnimatedSlidingButton>);
    const button = screen.getByRole('button', { name: /get started/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-btn-icon-slide');
    expect(button).toHaveAttribute('data-icon-state', 'idle');
  });

  it('forwards native button props', () => {
    render(<AnimatedSlidingButton disabled>Save</AnimatedSlidingButton>);
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });
});
