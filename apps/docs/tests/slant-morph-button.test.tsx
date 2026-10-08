import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SlantMorphButton from '@/registry/tweenui/slant-morph-button';

describe('Slant Morph Button', () => {
  it('renders a button with its label as the accessible name', () => {
    render(<SlantMorphButton>Discover the library</SlantMorphButton>);
    expect(screen.getByRole('button', { name: 'Discover the library' })).toHaveAttribute(
      'type',
      'button'
    );
  });

  it('starts the seam and tile on their resting slant', () => {
    const { container } = render(<SlantMorphButton>Go</SlantMorphButton>);
    const [seam, tile] = Array.from(container.querySelectorAll('path'));
    expect(seam?.getAttribute('d')).toMatch(/^M0 0H5\.63/);
    expect(tile?.getAttribute('d')).toMatch(/^M6\.728 9\.09/);
  });

  it('hides every shape from assistive tech', () => {
    const { container } = render(<SlantMorphButton>Go</SlantMorphButton>);
    container.querySelectorAll('svg').forEach((svg) => {
      expect(svg.closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });

  it('survives hover and focus without a pointer that can morph', () => {
    render(<SlantMorphButton>Go</SlantMorphButton>);
    const button = screen.getByRole('button');
    fireEvent.pointerEnter(button);
    fireEvent.pointerLeave(button);
    fireEvent.focus(button);
    fireEvent.blur(button);
    expect(button).toBeInTheDocument();
  });

  it('fires onClick and forwards native props', () => {
    const onClick = vi.fn();
    render(
      <SlantMorphButton onClick={onClick} data-testid="slant">
        Go
      </SlantMorphButton>
    );
    fireEvent.click(screen.getByTestId('slant'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <SlantMorphButton disabled onClick={onClick}>
        Go
      </SlantMorphButton>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards a ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<SlantMorphButton ref={ref}>Go</SlantMorphButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
