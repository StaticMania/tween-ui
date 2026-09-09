import { fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { describe, expect, it, vi } from 'vitest';
import LogoOrbit from '@/registry/tweenui/logo-orbit';

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

  it('renders a dark src when srcDark is set', () => {
    const { container } = render(
      <LogoOrbit logos={[{ src: '/a.svg', srcDark: '/a-dark.svg', alt: 'Alpha' }]} />
    );
    expect(screen.getByAltText('Alpha')).toHaveAttribute('src', '/a.svg');
    expect(container.querySelector('img[src="/a-dark.svg"]')).toBeInTheDocument();
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

  it('pauses rotation on pointer enter by default', () => {
    const pause = vi.spyOn(gsap.core.Timeline.prototype, 'pause');
    const resume = vi.spyOn(gsap.core.Timeline.prototype, 'resume');
    const { container } = render(<LogoOrbit logos={LOGOS} />);
    const ring = container.querySelector('[data-logo-orbit]')!;

    fireEvent.pointerEnter(ring);
    expect(pause).toHaveBeenCalled();

    fireEvent.pointerLeave(ring);
    expect(resume).toHaveBeenCalled();

    pause.mockRestore();
    resume.mockRestore();
  });

  it('does not pause on hover when pauseOnHover is false', () => {
    const pause = vi.spyOn(gsap.core.Timeline.prototype, 'pause');
    const { container } = render(<LogoOrbit logos={LOGOS} pauseOnHover={false} />);
    const ring = container.querySelector('[data-logo-orbit]')!;

    fireEvent.pointerEnter(ring);
    expect(pause).not.toHaveBeenCalled();

    pause.mockRestore();
  });
});
