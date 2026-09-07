import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import GlowButton from '@/registry/tweenui/button/glow-button';

describe('Glow Button', () => {
  it('renders a button with its label', () => {
    render(<GlowButton>Get started</GlowButton>);
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<GlowButton>Go</GlowButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('fires onClick and forwards native props', () => {
    const onClick = vi.fn();
    render(
      <GlowButton onClick={onClick} data-testid="glow">
        Go
      </GlowButton>
    );
    fireEvent.click(screen.getByTestId('glow'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<GlowButton ref={ref}>Go</GlowButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
