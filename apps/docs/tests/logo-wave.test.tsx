import { fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { describe, expect, it, vi } from 'vitest';
import LogoWave from '@/registry/tweenui/logo-wave';

const LOGOS = [
  { src: '/a.svg', alt: 'Alpha' },
  { src: '/b.svg', alt: 'Beta' },
  { src: '/c.svg', alt: 'Gamma' },
];

describe('Logo Wave', () => {
  it('renders every logo with its alt text', () => {
    render(<LogoWave logos={LOGOS} />);
    for (const logo of LOGOS) {
      expect(screen.getAllByAltText(logo.alt).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('duplicates logos along the track', () => {
    const { container } = render(<LogoWave logos={LOGOS} />);
    expect(container.querySelector('[data-logo-wave-track]')).toBeTruthy();
    expect(container.querySelectorAll('[data-logo-wave-item]').length).toBeGreaterThanOrEqual(
      LOGOS.length * 2
    );
  });

  it('pauses the marquee on pointer enter by default', () => {
    const pause = vi.spyOn(gsap.core.Tween.prototype, 'pause');
    const resume = vi.spyOn(gsap.core.Tween.prototype, 'resume');
    const { container } = render(<LogoWave logos={LOGOS} />);
    const root = container.querySelector('[data-logo-wave]')!;

    fireEvent.pointerEnter(root);
    expect(pause).toHaveBeenCalled();

    fireEvent.pointerLeave(root);
    expect(resume).toHaveBeenCalled();

    pause.mockRestore();
    resume.mockRestore();
  });

  it('does not pause on hover when pauseOnHover is false', () => {
    const pause = vi.spyOn(gsap.core.Tween.prototype, 'pause');
    const { container } = render(<LogoWave logos={LOGOS} pauseOnHover={false} />);
    const root = container.querySelector('[data-logo-wave]')!;

    fireEvent.pointerEnter(root);
    expect(pause).not.toHaveBeenCalled();

    pause.mockRestore();
  });

  it('uses renderLogo when provided', () => {
    render(<LogoWave logos={LOGOS} renderLogo={(logo) => <span>{logo.alt} mark</span>} />);
    expect(screen.getAllByText('Alpha mark').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Beta mark').length).toBeGreaterThanOrEqual(1);
  });

  it('defaults to scrolling left and accepts direction="right"', () => {
    const { container, rerender } = render(<LogoWave logos={LOGOS} />);
    expect(container.querySelector('[data-logo-wave]')).toHaveAttribute('data-direction', 'left');

    rerender(<LogoWave logos={LOGOS} direction="right" />);
    expect(container.querySelector('[data-logo-wave]')).toHaveAttribute('data-direction', 'right');
  });
});
