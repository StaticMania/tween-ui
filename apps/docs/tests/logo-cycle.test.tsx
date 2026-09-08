import { fireEvent, render, screen } from '@testing-library/react';
import gsap from 'gsap';
import { describe, expect, it, vi } from 'vitest';
import LogoCycle from '@/registry/tweenui/logo/logo-cycle';

const LOGOS = [
  { src: '/a.svg', alt: 'Alpha' },
  { src: '/b.svg', alt: 'Beta' },
  { src: '/c.svg', alt: 'Gamma' },
  { src: '/d.svg', alt: 'Delta' },
  { src: '/e.svg', alt: 'Epsilon' },
  { src: '/f.svg', alt: 'Zeta' },
  { src: '/g.svg', alt: 'Eta' },
  { src: '/h.svg', alt: 'Theta' },
];

describe('Logo Cycle', () => {
  it('renders every logo with its alt text', () => {
    render(<LogoCycle logos={LOGOS} visibleCount={4} />);
    for (const logo of LOGOS) {
      expect(screen.getByAltText(logo.alt)).toBeInTheDocument();
    }
  });

  it('stacks logos into groups of visibleCount', () => {
    const { container } = render(<LogoCycle logos={LOGOS} visibleCount={4} />);
    expect(container.querySelectorAll('[data-logo-cycle-group]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-logo-cycle-item]')).toHaveLength(LOGOS.length);
  });

  it('renders a static row when logos fit in one group', () => {
    const { container } = render(<LogoCycle logos={LOGOS.slice(0, 3)} visibleCount={6} />);
    expect(container.querySelectorAll('[data-logo-cycle-group]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-logo-cycle-item]')).toHaveLength(3);
    expect(container.querySelector('[data-logo-cycle]')).toBeTruthy();
  });

  it('pauses the cycle on pointer enter by default', () => {
    const pause = vi.spyOn(gsap.core.Tween.prototype, 'pause');
    const resume = vi.spyOn(gsap.core.Tween.prototype, 'resume');
    const { container } = render(<LogoCycle logos={LOGOS} visibleCount={4} />);
    const root = container.querySelector('[data-logo-cycle]')!;

    fireEvent.pointerEnter(root);
    expect(pause).toHaveBeenCalled();

    fireEvent.pointerLeave(root);
    expect(resume).toHaveBeenCalled();

    pause.mockRestore();
    resume.mockRestore();
  });

  it('does not pause on hover when pauseOnHover is false', () => {
    const pause = vi.spyOn(gsap.core.Tween.prototype, 'pause');
    const { container } = render(<LogoCycle logos={LOGOS} visibleCount={4} pauseOnHover={false} />);
    const root = container.querySelector('[data-logo-cycle]')!;

    fireEvent.pointerEnter(root);
    expect(pause).not.toHaveBeenCalled();

    pause.mockRestore();
  });

  it('uses renderLogo when provided', () => {
    render(
      <LogoCycle
        logos={LOGOS.slice(0, 2)}
        visibleCount={6}
        renderLogo={(logo) => <span>{logo.alt} mark</span>}
      />
    );
    expect(screen.getByText('Alpha mark')).toBeInTheDocument();
    expect(screen.getByText('Beta mark')).toBeInTheDocument();
  });
});
