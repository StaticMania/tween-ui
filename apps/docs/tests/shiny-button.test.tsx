import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ShinyButton from '@/registry/tweenui/shiny-button';

describe('Shiny Button', () => {
  it('renders a button with its label', () => {
    render(<ShinyButton>Get started</ShinyButton>);
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<ShinyButton>Go</ShinyButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('fires onClick and forwards native props', () => {
    const onClick = vi.fn();
    render(
      <ShinyButton onClick={onClick} disabled data-testid="shiny">
        Go
      </ShinyButton>
    );
    const btn = screen.getByTestId('shiny');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled(); // disabled swallows the click
  });

  it('forwards a ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ShinyButton ref={ref}>Go</ShinyButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('hides the icon when icon={null}', () => {
    const { container } = render(<ShinyButton icon={null}>Go</ShinyButton>);
    expect(container.querySelector('svg')).toBeNull();
  });
});
