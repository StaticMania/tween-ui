'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { Icon } from 'docora';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Every drawn element inside a Lucide glyph, for staggered motions. */
const strokes = (svg: SVGSVGElement) =>
  svg.querySelectorAll<SVGElement>('path, line, polyline, polygon, rect, circle, ellipse');

type Play = (svg: SVGSVGElement) => void;

const spin: Play = (svg) =>
  void gsap.fromTo(
    svg,
    { rotate: 0 },
    { rotate: 360, duration: 0.7, ease: 'power2.inOut', transformOrigin: '50% 50%' }
  );

const wave: Play = (svg) =>
  void gsap.fromTo(
    strokes(svg),
    { scaleY: 1 },
    {
      scaleY: 0.5,
      duration: 0.2,
      ease: 'power2.inOut',
      transformOrigin: '50% 50%',
      stagger: 0.05,
      repeat: 1,
      yoyo: true,
    }
  );

const nudge: Play = (svg) =>
  void gsap.fromTo(
    svg,
    { x: 0 },
    { x: 3, duration: 0.18, ease: 'power2.out', repeat: 1, yoyo: true }
  );

const pulse: Play = (svg) =>
  void gsap.fromTo(
    svg,
    { scale: 1 },
    {
      scale: 1.3,
      duration: 0.22,
      ease: 'power2.out',
      transformOrigin: '50% 50%',
      repeat: 1,
      yoyo: true,
    }
  );

const flip: Play = (svg) =>
  void gsap.fromTo(
    svg,
    { rotateY: 0 },
    { rotateY: 180, duration: 0.55, ease: 'power2.inOut', transformOrigin: '50% 50%' }
  );

const bounce: Play = (svg) =>
  void gsap.fromTo(
    svg,
    { y: 0 },
    { y: -3, duration: 0.16, ease: 'power2.out', repeat: 1, yoyo: true }
  );

/** Default: a small pop for glyphs without a motion of their own. */
const pop: Play = (svg) =>
  void gsap.fromTo(
    svg,
    { scale: 1, rotate: 0 },
    {
      scale: 1.18,
      rotate: -6,
      duration: 0.2,
      ease: 'power2.out',
      transformOrigin: '50% 50%',
      repeat: 1,
      yoyo: true,
    }
  );

/**
 * Icon name → hover motion. Grouped by what the glyph depicts, so a whole
 * family reads the same way; anything unlisted falls back to `pop`.
 */
const PLAY: Record<string, Play> = {
  'rotate-cw': spin,
  orbit: spin,
  rainbow: spin,
  'audio-lines': wave,
  waves: wave,
  'list-ordered': wave,
  'list-collapse': wave,
  layers: wave,
  'move-right': nudge,
  'unfold-horizontal': nudge,
  'circle-arrow-right': nudge,
  'log-in': nudge,
  'share-2': nudge,
  navigation: nudge,
  waypoints: nudge,
  sparkles: pulse,
  star: pulse,
  'badge-dollar-sign': pulse,
  megaphone: pulse,
  music: pulse,
  'flip-horizontal': flip,
  'gallery-horizontal': flip,
  images: flip,
  'image-plus': flip,
  'gallery-vertical-end': flip,
  'mouse-pointer-click': bounce,
  'square-mouse-pointer': bounce,
  hash: bounce,
  type: bounce,
  quote: bounce,
  users: bounce,
};

export function AnimatedIcon({
  name,
  hovered,
  className,
}: {
  name: string;
  /** Drives the motion — the row owns hover state so the whole row triggers it. */
  hovered: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!hovered || prefersReducedMotion()) return;
      // Lucide resolves unbundled names lazily, so the <svg> may land a tick late.
      const svg = ref.current?.querySelector('svg');
      if (svg) (PLAY[name] ?? pop)(svg);
    },
    { scope: ref, dependencies: [hovered, name] }
  );

  return (
    <span ref={ref} className="inline-flex shrink-0 [perspective:400px]">
      <Icon name={name} className={cn('size-4 shrink-0', className)} />
    </span>
  );
}
