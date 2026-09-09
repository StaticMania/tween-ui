import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ImageFanSlider from '@/registry/tweenui/image-fan-slider';

const IMAGES = [
  { src: '/a.jpg', alt: 'Alpha' },
  { src: '/b.jpg', alt: 'Beta' },
  { src: '/c.jpg', alt: 'Gamma' },
];

describe('Image Fan Slider', () => {
  it('renders every image with its alt text', () => {
    render(<ImageFanSlider images={IMAGES} />);
    for (const image of IMAGES) {
      expect(screen.getByAltText(image.alt)).toBeInTheDocument();
    }
  });

  it('marks the first slide active', () => {
    const { container } = render(<ImageFanSlider images={IMAGES} />);
    const active = container.querySelector('[data-active="true"] img');
    expect(active).toHaveAttribute('alt', 'Alpha');
  });

  it('advances after the interval', () => {
    vi.useFakeTimers();
    const { container } = render(<ImageFanSlider images={IMAGES} interval={1} />);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const active = container.querySelector('[data-active="true"] img');
    expect(active).toHaveAttribute('alt', 'Beta');

    vi.useRealTimers();
  });

  it('pauses autoplay on pointer enter by default', () => {
    vi.useFakeTimers();
    const { container } = render(<ImageFanSlider images={IMAGES} interval={1} />);
    const root = container.querySelector('[data-image-fan-slider]')!;

    fireEvent.pointerEnter(root);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const active = container.querySelector('[data-active="true"] img');
    expect(active).toHaveAttribute('alt', 'Alpha');

    vi.useRealTimers();
  });

  it('steps backward when direction is right', () => {
    vi.useFakeTimers();
    const { container } = render(<ImageFanSlider images={IMAGES} interval={1} direction="right" />);
    expect(container.querySelector('[data-image-fan-slider]')).toHaveAttribute(
      'data-direction',
      'right'
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const active = container.querySelector('[data-active="true"] img');
    expect(active).toHaveAttribute('alt', 'Gamma');

    vi.useRealTimers();
  });
});
