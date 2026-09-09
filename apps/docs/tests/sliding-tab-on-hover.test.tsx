import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import SlidingTabOnHover from '@/registry/tweenui/sliding-tab-on-hover';

const items = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'services', label: 'Service' },
];

describe('Sliding Tab On Hover', () => {
  it('renders its items and mounts without error', () => {
    render(<SlidingTabOnHover items={items} defaultValue="home" />);
    const nav = screen.getByRole('navigation', { name: /sliding tabs/i });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('data-nav-tabs');
    expect(screen.getByRole('button', { name: /home/i })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('button', { name: /home/i })).toHaveAttribute(
      'data-highlighted',
      'true'
    );
    expect(screen.getByRole('button', { name: /about/i })).toHaveAttribute('data-active', 'false');
    expect(screen.getByRole('button', { name: /service/i })).toBeInTheDocument();
  });

  it('renders links when items provide href', () => {
    render(
      <SlidingTabOnHover
        items={[
          { value: 'home', label: 'Home', href: '/home' },
          { value: 'about', label: 'About', href: '/about' },
        ]}
        defaultValue="home"
      />
    );
    const home = screen.getByRole('link', { name: /home/i });
    expect(home).toHaveAttribute('href', '/home');
    expect(home).toHaveAttribute('aria-current', 'page');
  });
});
