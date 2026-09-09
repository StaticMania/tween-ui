import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CardHoverExpand from '@/registry/tweenui/card-hover-expand';

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

describe('Card Hover Expand', () => {
  it('renders every card title, label, step, and image', () => {
    render(<CardHoverExpand cards={CARDS} />);

    expect(screen.getByText('First title')).toBeInTheDocument();
    expect(screen.getByText('Second title')).toBeInTheDocument();
    expect(screen.getByText('First label')).toBeInTheDocument();
    expect(screen.getByText('.01')).toBeInTheDocument();
    expect(screen.getByAltText('First photo')).toBeInTheDocument();
    expect(screen.getByAltText('Second photo')).toBeInTheDocument();
  });

  it('marks the first card active', () => {
    const { container } = render(<CardHoverExpand cards={CARDS} />);
    expect(container.querySelector('[data-card-hover-expand]')).toHaveAttribute(
      'data-active-card',
      '0'
    );
  });

  it('activates a card on hover', () => {
    const { container } = render(<CardHoverExpand cards={CARDS} />);
    const second = container.querySelectorAll('[data-expand-card]')[1];

    fireEvent.mouseEnter(second);

    expect(container.querySelector('[data-card-hover-expand]')).toHaveAttribute(
      'data-active-card',
      '1'
    );
  });

  it('activates a card on focus', () => {
    const { container } = render(<CardHoverExpand cards={CARDS} />);
    const second = container.querySelectorAll('[data-expand-card]')[1];

    fireEvent.focus(second);

    expect(container.querySelector('[data-card-hover-expand]')).toHaveAttribute(
      'data-active-card',
      '1'
    );
  });

  it('merges a custom className onto the root', () => {
    const { container } = render(<CardHoverExpand cards={CARDS} className="mt-10" />);
    expect(container.querySelector('[data-card-hover-expand]')).toHaveClass('mt-10');
  });
});
