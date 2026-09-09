import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BlogHoverExpand from '@/registry/tweenui/blog-hover-expand';

const POSTS = [
  {
    title: 'First post',
    date: 'March 1, 2026',
    tags: ['Ads'],
    image: '/one.jpg',
    imageAlt: 'First cover',
    href: '/one',
  },
  {
    title: 'Second post',
    date: 'March 2, 2026',
    tags: ['SEO'],
    image: '/two.jpg',
    imageAlt: 'Second cover',
    href: '/two',
  },
];

describe('Blog Hover Expand', () => {
  it('renders every post title and image', () => {
    render(<BlogHoverExpand posts={POSTS} />);

    expect(screen.getByText('First post')).toBeInTheDocument();
    expect(screen.getByText('Second post')).toBeInTheDocument();
    expect(screen.getByAltText('First cover')).toBeInTheDocument();
    expect(screen.getByAltText('Second cover')).toBeInTheDocument();
  });

  it('marks the first post active', () => {
    const { container } = render(<BlogHoverExpand posts={POSTS} />);
    expect(container.querySelector('[data-blog-hover-expand]')).toHaveAttribute(
      'data-active-post',
      '0'
    );
  });

  it('activates a post on hover', () => {
    const { container } = render(<BlogHoverExpand posts={POSTS} />);
    const second = container.querySelectorAll('[data-blog-card]')[1];

    fireEvent.mouseEnter(second);

    expect(container.querySelector('[data-blog-hover-expand]')).toHaveAttribute(
      'data-active-post',
      '1'
    );
  });
});
