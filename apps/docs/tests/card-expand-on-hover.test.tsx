import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CardExpandOnHover from '@/registry/tweenui/card-expand-on-hover';

const CARDS = [
  {
    step: '.01',
    label: 'First label',
    title: 'First title',
    image: '/one.jpg',
    imageAlt: 'First photo',
  },
  {
    step: '.02',
    label: 'Second label',
    title: 'Second title',
    image: '/two.jpg',
    imageAlt: 'Second photo',
  },
];

describe('Card Expand on Hover', () => {
  it('renders every card title, label, step, and image', () => {
    render(<CardExpandOnHover cards={CARDS} />);

    expect(screen.getByText('First title')).toBeInTheDocument();
    expect(screen.getByText('Second title')).toBeInTheDocument();
    expect(screen.getByText('First label')).toBeInTheDocument();
    expect(screen.getByText('.01')).toBeInTheDocument();
    expect(screen.getByAltText('First photo')).toBeInTheDocument();
    expect(screen.getByAltText('Second photo')).toBeInTheDocument();
  });

  it('marks the first card active', () => {
    const { container } = render(<CardExpandOnHover cards={CARDS} />);
    expect(container.querySelector('[data-card-expand-on-hover]')).toHaveAttribute(
      'data-active-card',
      '0'
    );
  });

  it('activates a card on hover', () => {
    const { container } = render(<CardExpandOnHover cards={CARDS} />);
    const second = container.querySelectorAll('[data-expand-card]')[1];

    fireEvent.mouseEnter(second);

    expect(container.querySelector('[data-card-expand-on-hover]')).toHaveAttribute(
      'data-active-card',
      '1'
    );
  });

  it('activates a card on focus', () => {
    const { container } = render(<CardExpandOnHover cards={CARDS} />);
    const second = container.querySelectorAll('[data-expand-card]')[1];

    fireEvent.focus(second);

    expect(container.querySelector('[data-card-expand-on-hover]')).toHaveAttribute(
      'data-active-card',
      '1'
    );
  });

  it('merges a custom className onto the root', () => {
    const { container } = render(<CardExpandOnHover cards={CARDS} className="mt-10" />);
    expect(container.querySelector('[data-card-expand-on-hover]')).toHaveClass('mt-10');
  });
});
