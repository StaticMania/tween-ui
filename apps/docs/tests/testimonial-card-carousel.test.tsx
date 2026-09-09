import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TestimonialCardCarousel from '@/registry/tweenui/testimonial-card-carousel';

const TESTIMONIALS = [
  {
    id: 'one',
    title: 'Clearer handoffs',
    quote: 'The first quote about faster handoffs.',
    name: 'Ada',
    role: 'Lead',
    avatar: '/ada.jpg',
    avatarAlt: 'Portrait of Ada',
  },
  {
    id: 'two',
    title: 'One pipeline',
    quote: 'The second quote about a clearer pipeline.',
    name: 'Lin',
    role: 'Founder',
    avatar: '/lin.jpg',
    avatarAlt: 'Portrait of Lin',
  },
];

describe('Testimonial Card Carousel', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
  });
  it('renders every quote, name, and avatar', () => {
    render(<TestimonialCardCarousel testimonials={TESTIMONIALS} />);

    expect(screen.getByText('Clearer handoffs')).toBeInTheDocument();
    expect(screen.getByText('One pipeline')).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Lin')).toBeInTheDocument();
    expect(screen.getByAltText('Portrait of Ada')).toBeInTheDocument();
    expect(screen.getByAltText('Portrait of Lin')).toBeInTheDocument();
  });

  it('marks the first slide active', () => {
    const { container } = render(<TestimonialCardCarousel testimonials={TESTIMONIALS} />);
    expect(container.querySelector('[data-testimonial-card-carousel]')).toHaveAttribute(
      'data-active-slide',
      '0'
    );
  });

  it('jumps to a card when its dot is clicked', () => {
    const { container } = render(<TestimonialCardCarousel testimonials={TESTIMONIALS} />);
    fireEvent.click(screen.getByRole('button', { name: /go to lin's testimonial/i }));

    expect(container.querySelector('[data-testimonial-card-carousel]')).toHaveAttribute(
      'data-active-slide',
      '1'
    );
  });

  it('uses the slidesPerView prop', () => {
    const { container } = render(
      <TestimonialCardCarousel testimonials={TESTIMONIALS} slidesPerView={2} />
    );
    expect(container.querySelector('[data-testimonial-card-carousel]')).toHaveAttribute(
      'data-slides-per-view',
      '2'
    );
  });

  it('merges a custom className onto the section', () => {
    const { container } = render(
      <TestimonialCardCarousel testimonials={TESTIMONIALS} className="mt-10" />
    );
    expect(container.querySelector('[data-testimonial-card-carousel]')).toHaveClass('mt-10');
  });

  it('forwards swiper className and onSwiper', () => {
    const onSwiper = vi.fn();
    const { container } = render(
      <TestimonialCardCarousel
        testimonials={TESTIMONIALS}
        swiper={{ className: 'custom-swiper', onSwiper, speed: 0 }}
      />
    );

    expect(container.querySelector('.custom-swiper')).toBeInTheDocument();
    expect(onSwiper).toHaveBeenCalled();
  });
});
