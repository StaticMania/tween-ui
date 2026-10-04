import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DotBloomButton from '@/registry/tweenui/dot-bloom-button';

describe('Dot Bloom Button', () => {
  it('renders a button with its label as the accessible name', () => {
    render(<DotBloomButton>Get started</DotBloomButton>);
    expect(screen.getByRole('button', { name: 'Get started' })).toHaveAttribute('type', 'button');
  });

  it('fires onClick and forwards native props', () => {
    const onClick = vi.fn();
    render(
      <DotBloomButton onClick={onClick} data-testid="bloom">
        Get started
      </DotBloomButton>
    );
    fireEvent.click(screen.getByTestId('bloom'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies the secondary variant', () => {
    render(<DotBloomButton variant="secondary">Book a call</DotBloomButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-[#c6f56f]');
  });

  it('forwards a ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<DotBloomButton ref={ref}>Get started</DotBloomButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
