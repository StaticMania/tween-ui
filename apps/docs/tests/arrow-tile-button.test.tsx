import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ArrowTileButton from '@/registry/tweenui/arrow-tile-button';

describe('Arrow Tile Button', () => {
  it('renders a button with its label as the accessible name', () => {
    render(<ArrowTileButton>Get started</ArrowTileButton>);
    expect(screen.getByRole('button', { name: 'Get started' })).toHaveAttribute('type', 'button');
  });

  it('splits the swap label into a lift wave under one accessible name', () => {
    const { container } = render(<ArrowTileButton variant="swap">Book a call</ArrowTileButton>);
    expect(screen.getByRole('button', { name: 'Book a call' })).toHaveClass('pr-[2.875rem]');
    const chars = container.querySelectorAll<HTMLElement>('[aria-hidden="true"] > .inline-block');
    expect(chars).toHaveLength('Book a call'.length);
    expect(chars[chars.length - 1]?.style.getPropertyValue('--hop-delay')).toBe('40ms');
  });

  it('splits the tilt label into characters that hop away from the tile behind a single accessible name', () => {
    const { container } = render(<ArrowTileButton>Get started</ArrowTileButton>);
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument();
    const chars = container.querySelectorAll<HTMLElement>('[aria-hidden="true"] > .inline-block');
    expect(chars).toHaveLength('Get started'.length);
    expect(chars[0]?.style.getPropertyValue('--hop-delay')).toBe('365ms');
    expect(chars[chars.length - 1]?.style.getPropertyValue('--hop-delay')).toBe('140ms');
  });

  it('hides the arrow tiles from assistive tech', () => {
    const { container } = render(<ArrowTileButton variant="swap">Go</ArrowTileButton>);
    container.querySelectorAll('svg').forEach((svg) => {
      expect(svg.closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });

  it('squashes on press in both variants', () => {
    render(
      <>
        <ArrowTileButton>Get started</ArrowTileButton>
        <ArrowTileButton variant="swap">Book a call</ArrowTileButton>
      </>
    );
    screen.getAllByRole('button').forEach((button) => {
      expect(button).toHaveClass('active:[scale:0.955_0.925]');
    });
  });

  it('fires onClick and forwards native props', () => {
    const onClick = vi.fn();
    render(
      <ArrowTileButton onClick={onClick} data-testid="tile">
        Get started
      </ArrowTileButton>
    );
    fireEvent.click(screen.getByTestId('tile'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <ArrowTileButton disabled onClick={onClick}>
        Get started
      </ArrowTileButton>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards a ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ArrowTileButton ref={ref}>Get started</ArrowTileButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
