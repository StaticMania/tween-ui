import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SlideArrowButton from '@/registry/tweenui/slide-arrow-button';

describe('Slide Arrow Button', () => {
  it('renders a button with its label as the accessible name', () => {
    render(<SlideArrowButton>Get started</SlideArrowButton>);
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument();
  });

  it('defaults to type="button"', () => {
    render(<SlideArrowButton>Go</SlideArrowButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('fires onClick and forwards native props', () => {
    const onClick = vi.fn();
    render(
      <SlideArrowButton onClick={onClick} data-testid="slide">
        Go
      </SlideArrowButton>
    );
    fireEvent.click(screen.getByTestId('slide'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards a ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<SlideArrowButton ref={ref}>Go</SlideArrowButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
