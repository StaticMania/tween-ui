import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LogoOrbit from '@/registry/tweenui/orbit/logo-orbit';

const LOGOS = [
  { src: '/a.svg', alt: 'Alpha' },
  { src: '/b.svg', alt: 'Beta' },
  { src: '/c.svg', alt: 'Gamma' },
];

describe('Logo Orbit', () => {
  it('renders every logo with its alt text', () => {
    render(<LogoOrbit logos={LOGOS} />);
    for (const logo of LOGOS) {
      expect(screen.getByAltText(logo.alt)).toBeInTheDocument();
    }
  });

  it('applies the size to the ring', () => {
    const { container } = render(<LogoOrbit logos={LOGOS} size={400} />);
    const ring = container.querySelector('[data-logo-orbit]') as HTMLElement;
    expect(ring).toBeTruthy();
    expect(ring.style.width).toBe('400px');
    expect(ring.style.height).toBe('400px');
  });

  it('renders one pivot per logo', () => {
    const { container } = render(<LogoOrbit logos={LOGOS} />);
    expect(container.querySelectorAll('[data-orbit-pivot]')).toHaveLength(LOGOS.length);
  });
});
