'use client';

import { useEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SHAPES = 'path, line, polyline, polygon, circle, ellipse, rect';
// Shapes inside these are never painted where they sit
const UNPAINTED = 'defs, clipPath, mask, pattern, marker, symbol';
const NO_PAINT = new Set(['none', 'transparent', 'rgba(0, 0, 0, 0)']);
const FILL_FADE = 0.5;

export interface SvgDrawProps extends ComponentPropsWithoutRef<'div'> {
  /** Seconds each shape takes to draw. */
  duration?: number;
  delay?: number;
  /** Seconds between one shape starting and the next. */
  stagger?: number;
  /** Any GSAP ease. */
  ease?: string;
  /** Width in screen px of the line that traces a fill-only shape. */
  width?: number;
  trigger?: 'view' | 'mount';
  /** ScrollTrigger start, with `trigger="view"`. */
  start?: string;
  onComplete?: () => void;
}

const SvgDraw = ({
  duration = 1.4,
  delay = 0,
  stagger = 0.12,
  ease = 'power2.inOut',
  width = 1.5,
  trigger = 'view',
  start = 'top 85%',
  onComplete,
  className,
  children,
  ...props
}: SvgDrawProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      gsap.set(root, { visibility: 'visible' });
      if (prefersReducedMotion()) return;

      const shapes = gsap.utils
        .toArray<SVGGeometryElement>(root.querySelectorAll(SHAPES))
        .filter((shape) => !shape.closest(UNPAINTED));
      if (!shapes.length) return;

      const painted = (shape: Element, paint: 'fill' | 'stroke') =>
        !NO_PAINT.has(getComputedStyle(shape)[paint]);
      const filled = shapes.filter((shape) => painted(shape, 'fill'));
      // Fill-only shapes get a thin line to draw with, which fades once they fill
      const traced = filled.filter((shape) => !painted(shape, 'stroke'));
      gsap.set(traced, {
        stroke: 'currentColor',
        strokeWidth: width,
        vectorEffect: 'non-scaling-stroke',
      });

      gsap
        .timeline({
          delay,
          scrollTrigger: trigger === 'view' ? { trigger: root, start, once: true } : undefined,
          onComplete: () => onCompleteRef.current?.(),
        })
        .from(shapes, { drawSVG: 0, duration, ease, stagger })
        .from(filled, { fillOpacity: 0, duration: FILL_FADE, stagger }, duration * 0.6)
        .to(traced, { strokeOpacity: 0, duration: FILL_FADE, stagger }, '<');
    },
    {
      scope: rootRef,
      dependencies: [duration, delay, stagger, ease, width, trigger, start],
      revertOnUpdate: true,
    }
  );

  return (
    <div
      ref={rootRef}
      className={cn('motion-reduce:visible! [@media(scripting:enabled)]:invisible', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export default SvgDraw;
