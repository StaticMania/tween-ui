import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MediaScrollSpin from '@/registry/tweenui/media-scroll-spin';

describe('Media Scroll Spin', () => {
  it('renders a figure with data-scroll-spin', () => {
    const { container } = render(<MediaScrollSpin src="/spin.png" />);
    expect(container.querySelector('[data-scroll-spin]')).toBeInTheDocument();
  });

  it('renders the image with the given src', () => {
    render(<MediaScrollSpin src="/spin.png" alt="Spinning ring" />);
    const img = screen.getByAltText('Spinning ring');
    expect(img).toHaveAttribute('src', '/spin.png');
  });

  it('marks empty alt as decorative', () => {
    const { container } = render(<MediaScrollSpin src="/spin.png" alt="" />);
    const figure = container.querySelector('[data-scroll-spin]');
    expect(figure).toHaveAttribute('aria-hidden', 'true');
  });

  it('merges a custom className onto the figure', () => {
    const { container } = render(<MediaScrollSpin src="/spin.png" className="max-w-sm" />);
    const figure = container.querySelector('[data-scroll-spin]');
    expect(figure).toHaveClass('max-w-sm');
  });
});
