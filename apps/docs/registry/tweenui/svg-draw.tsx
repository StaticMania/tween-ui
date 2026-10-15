'use client';

import { useEffect, useLayoutEffect, useRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export const SVG_DRAW_EASES = {
  'power1.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'power2.out': 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  'power3.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'expo.out': 'cubic-bezier(0.19, 1, 0.22, 1)',
  'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
  linear: 'linear',
} as const;

export type SvgDrawEase = keyof typeof SVG_DRAW_EASES;

const FADE_MS = 400;
const SHAPES = new Set(['path', 'line', 'polyline', 'polygon', 'circle', 'ellipse', 'rect']);
// Shapes inside these are never painted where they sit, so there is nothing to draw
const SKIP = new Set([
  'defs',
  'clippath',
  'mask',
  'pattern',
  'marker',
  'symbol',
  'lineargradient',
  'radialgradient',
  'filter',
  'foreignobject',
]);

const shapesIn = (node: Element): SVGGeometryElement[] =>
  Array.from(node.children).flatMap((child) => {
    const tag = child.tagName.toLowerCase();
    if (SKIP.has(tag)) return [];
    return SHAPES.has(tag) ? [child as SVGGeometryElement] : shapesIn(child);
  });

const isClear = (paint: string) =>
  paint === 'none' || paint === 'transparent' || paint === 'rgba(0, 0, 0, 0)';

interface Shape {
  el: SVGGeometryElement;
  len: number;
  pad: number;
  stroked: boolean;
  trace: string;
  traceWidth: string;
  fillOpacity: string;
  inline: string | null;
}

const measure = (el: SVGGeometryElement, width: number, color: string, ownColor: boolean) => {
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return null;

  let real = 0;
  try {
    real = el.getTotalLength();
  } catch {
    return null;
  }
  // A `pathLength` attribute changes the units the dash is measured in
  const own = parseFloat(el.getAttribute('pathLength') ?? '');
  const len = own > 0 ? own : real;
  if (!(real > 0)) return null;

  // Unset paint computes to the SVG defaults: a black fill and no stroke
  const fill = style.fill || 'rgb(0, 0, 0)';
  const stroke = style.stroke || 'none';
  const strokeWidth = parseFloat(style.strokeWidth || '1');
  const stroked = !isClear(stroke) && strokeWidth > 0;
  if (!stroked && isClear(fill)) return null;

  // `width` is in screen px, the stroke in the shape's own units
  const ctm = el.getScreenCTM?.();
  const scale = ctm ? Math.sqrt(Math.abs(ctm.a * ctm.d - ctm.b * ctm.c)) || 1 : 1;
  const traceWidth = stroked ? strokeWidth : width / scale;

  return {
    el,
    len,
    // Run the dash past the end, so a line cap never shows as a dot before it starts
    pad: (traceWidth + 1) * (len / real),
    stroked,
    trace: stroked ? stroke : ownColor ? fill : color,
    traceWidth: String(traceWidth),
    fillOpacity: style.fillOpacity || '1',
    inline: el.getAttribute('style'),
  } satisfies Shape;
};

const restore = ({ el, inline }: Shape) => {
  if (inline === null) el.removeAttribute('style');
  else el.setAttribute('style', inline);
};

export interface SvgDrawProps extends ComponentPropsWithoutRef<'div'> {
  /** Seconds each shape takes to draw. */
  duration?: number;
  /** Seconds before the first shape starts. */
  delay?: number;
  /** Seconds between one shape starting and the next. */
  stagger?: number;
  /** Trace width in screen px for fill-only shapes. Stroked shapes keep their own. */
  width?: number;
  ease?: SvgDrawEase | (string & {});
  order?: 'longest' | 'reverse' | 'document';
  /** Trace color for fill-only shapes. Stroked shapes keep their own. */
  color?: string;
  /** Trace fill-only shapes in their own fill color. */
  ownColor?: boolean;
  trigger?: 'view' | 'mount';
  /** With `trigger="view"`, how far down the viewport the SVG's top must rise, 0 to 1. */
  startAt?: number;
  onComplete?: () => void;
}

export default function SvgDraw({
  duration = 1.6,
  delay = 0,
  stagger = 0.18,
  width = 1.5,
  ease = 'power1.out',
  order = 'longest',
  color = 'currentColor',
  ownColor = false,
  trigger = 'view',
  startAt = 0.85,
  onComplete,
  className,
  children,
  ...props
}: SvgDrawProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Before paint, so the finished drawing never flashes up first
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reveal = () => {
      root.style.visibility = 'visible';
    };
    if (prefersReducedMotion() || root.getClientRects().length === 0) return reveal();

    const shapes = shapesIn(root)
      .map((el) => measure(el, width, color, ownColor))
      .filter((shape): shape is Shape => shape !== null);
    if (!shapes.length) return reveal();
    if (order === 'longest') shapes.sort((a, b) => b.len - a.len);
    else if (order === 'reverse') shapes.reverse();

    shapes.forEach(({ el, len, pad, stroked, trace, traceWidth }) => {
      Object.assign(el.style, {
        transition: 'none',
        fillOpacity: '0',
        stroke: trace,
        strokeWidth: traceWidth,
        strokeDasharray: `${len} ${len + pad * 2}`,
        strokeDashoffset: String(len + pad),
        ...(stroked ? {} : { strokeLinecap: 'round', strokeLinejoin: 'round' }),
      });
    });
    reveal();

    const ms = Math.max(0.01, duration) * 1000;
    const start = Math.max(0, delay) * 1000;
    const gap = Math.max(0, stagger) * 1000;
    const curve = SVG_DRAW_EASES[ease as SvgDrawEase] ?? ease;
    const timers: number[] = [];

    const play = () => {
      void root.getBoundingClientRect();
      shapes.forEach((shape, i) => {
        const wait = start + i * gap;
        shape.el.style.transition = `stroke-dashoffset ${ms}ms ${curve} ${wait}ms`;
        shape.el.style.strokeDashoffset = '0';

        timers.push(
          window.setTimeout(() => {
            shape.el.style.transition = `fill-opacity ${FADE_MS}ms ease, stroke-opacity ${FADE_MS}ms ease`;
            shape.el.style.fillOpacity = shape.fillOpacity;
            if (!shape.stroked) shape.el.style.strokeOpacity = '0';
          }, wait + ms),
          window.setTimeout(() => restore(shape), wait + ms + FADE_MS)
        );
      });
      const end = start + (shapes.length - 1) * gap + ms + FADE_MS;
      timers.push(window.setTimeout(() => onCompleteRef.current?.(), end));
    };

    let observer: IntersectionObserver | undefined;
    if (trigger === 'view' && typeof IntersectionObserver !== 'undefined') {
      const margin = Math.round((1 - Math.min(1, Math.max(0, startAt))) * 100);
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer?.disconnect();
          play();
        },
        { rootMargin: `0px 0px -${margin}% 0px` }
      );
      observer.observe(root);
    } else {
      play();
    }

    // Hand the SVG back as written, so a re-run measures the real thing
    return () => {
      observer?.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      shapes.forEach(restore);
    };
  }, [duration, delay, stagger, width, ease, order, color, ownColor, trigger, startAt]);

  return (
    <div
      ref={rootRef}
      data-svg-draw=""
      className={cn('motion-reduce:visible! [@media(scripting:enabled)]:invisible', className)}
      {...props}
    >
      {children}
    </div>
  );
}
