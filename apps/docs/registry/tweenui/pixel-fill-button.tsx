'use client';

import { useRef, useState, type ComponentPropsWithRef, type CSSProperties } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, CustomEase);

const CELL = 8;
const SPREAD = 0.42;
const SCATTER = 0.08;
const STEP = 0.09;
const EDGE = 0.07;
const TEAL = '#045f64';
const LIME = '#c6f56f';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isFocusVisible = (el: Element) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

const Arrow = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-5">
    <path
      d="M11.875 14.375 16.25 10l-4.375-4.375M16.25 10H2.5"
      stroke="currentColor"
      strokeWidth={1.5}
    />
  </svg>
);

export interface PixelFillButtonProps extends ComponentPropsWithRef<'button'> {
  children: string;
}

const PixelFillButton = ({
  children,
  className,
  type = 'button',
  ref,
  ...props
}: PixelFillButtonProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });

  const setRef = (node: HTMLButtonElement | null) => {
    btnRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useGSAP(
    () => {
      const btn = btnRef.current;
      if (!btn) return;

      const measure = () => {
        const cols = Math.ceil(btn.offsetWidth / CELL);
        const rows = Math.ceil(btn.offsetHeight / CELL);
        setGrid((prev) => (prev.cols === cols && prev.rows === rows ? prev : { cols, rows }));
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(btn);
      return () => observer.disconnect();
    },
    { scope: btnRef }
  );

  useGSAP(
    () => {
      CustomEase.create('pixel-roll', '0.625, 0.05, 0, 1');
      const btn = btnRef.current;
      if (!btn) return;
      const cells = gsap.utils.toArray<HTMLElement>('[data-pixel]', btn);
      const rolls = gsap.utils.toArray<HTMLElement>('[data-roll]', btn);
      const slides = gsap.utils.toArray<HTMLElement>('[data-slide]', btn);
      const label = btn.querySelector<HTMLElement>('[data-label]');
      const roll = { duration: 0.48, ease: 'pixel-roll', overwrite: true };

      // The wave is timed by each cell's distance from a point: where the
      // pointer came in when filling, where it went out when draining. Filling
      // runs nearest first, so the teal blooms out of the cursor; draining runs
      // farthest first, so the last pixels leave through the exit. Every cell
      // lights lime for a beat before it settles, which gives the wave its edge.
      const wave = (x: number, y: number, filling: boolean) => {
        const width = btn.offsetWidth;
        const height = btn.offsetHeight;
        const far = Math.max(Math.hypot(Math.max(x, width - x), Math.max(y, height - y)), 1);
        const reachOf = (px: number, py: number) => Math.hypot(px - x, py - y) / far;
        const timing = (reach: number) => (filling ? reach : 1 - reach) * SPREAD;

        cells.forEach((cell, index) => {
          const reach = reachOf(
            ((index % grid.cols) + 0.5) * CELL,
            (Math.floor(index / grid.cols) + 0.5) * CELL
          );
          const delay = timing(reach) + Math.random() * SCATTER;
          const lit = Number(gsap.getProperty(cell, 'opacity')) > 0;
          if (filling && lit) {
            gsap.to(cell, {
              opacity: 1,
              backgroundColor: TEAL,
              duration: STEP,
              ease: 'steps(2)',
              delay,
              overwrite: true,
            });
          } else if (filling) {
            gsap.to(cell, {
              keyframes: [
                { backgroundColor: LIME, duration: 0 },
                { opacity: 1, duration: STEP, ease: 'steps(2)' },
                { backgroundColor: TEAL, duration: 0, delay: EDGE },
              ],
              delay,
              overwrite: true,
            });
          } else if (lit) {
            gsap.to(cell, {
              keyframes: [
                { backgroundColor: LIME, duration: 0 },
                { opacity: 0, duration: STEP, ease: 'steps(2)', delay: EDGE },
              ],
              delay,
              overwrite: true,
            });
          }
        });

        // The label flips colour once the wave is over its middle, so the
        // text never reads lime on white or teal on teal for long.
        const middle = label ? reachOf(label.offsetLeft + label.offsetWidth / 2, height / 2) : 0.5;
        gsap.to(btn, {
          color: filling ? LIME : TEAL,
          duration: 0.16,
          delay: timing(middle) + STEP,
          overwrite: true,
        });
      };

      const enter = (x: number, y: number) => {
        btn.dataset.active = 'true';
        if (prefersReducedMotion()) return;
        wave(x, y, true);
        gsap.to(rolls, { yPercent: -100, ...roll });
        gsap.to(slides, { xPercent: 100, ...roll });
      };

      const leave = (x: number, y: number) => {
        btn.dataset.active = 'false';
        if (prefersReducedMotion()) return;
        wave(x, y, false);
        gsap.to(rolls, { yPercent: 0, ...roll });
        gsap.to(slides, { xPercent: 0, ...roll });
      };

      const pointOf = (event: PointerEvent) => {
        const box = btn.getBoundingClientRect();
        return [event.clientX - box.left, event.clientY - box.top] as const;
      };

      const onPointerEnter = (event: PointerEvent) => {
        if (event.pointerType !== 'touch') enter(...pointOf(event));
      };
      const onPointerLeave = (event: PointerEvent) => {
        if (event.pointerType !== 'touch' && document.activeElement !== btn) {
          leave(...pointOf(event));
        }
      };
      const onFocus = () => {
        if (isFocusVisible(btn)) enter(0, btn.offsetHeight / 2);
      };
      const onBlur = () => {
        if (!btn.matches(':hover')) leave(0, btn.offsetHeight / 2);
      };

      if (btn.dataset.active === 'true' && !prefersReducedMotion()) {
        gsap.set(cells, { opacity: 1, backgroundColor: TEAL });
        gsap.set(btn, { color: LIME });
        gsap.set(rolls, { yPercent: -100 });
        gsap.set(slides, { xPercent: 100 });
      }
      btn.addEventListener('pointerenter', onPointerEnter);
      btn.addEventListener('pointerleave', onPointerLeave);
      btn.addEventListener('focus', onFocus);
      btn.addEventListener('blur', onBlur);
      return () => {
        btn.removeEventListener('pointerenter', onPointerEnter);
        btn.removeEventListener('pointerleave', onPointerLeave);
        btn.removeEventListener('focus', onFocus);
        btn.removeEventListener('blur', onBlur);
      };
    },
    { scope: btnRef, dependencies: [grid.cols, grid.rows], revertOnUpdate: true }
  );

  return (
    <button
      ref={setRef}
      type={type}
      data-active="false"
      className={cn(
        'group relative inline-flex cursor-pointer items-stretch overflow-hidden border border-[#045f64]/25 bg-white p-0 font-mono text-sm tracking-[0.04em] text-[#045f64] uppercase transition-[border-color,scale] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] outline-none select-none hover:border-[#045f64] focus-visible:border-[#045f64] focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 not-disabled:active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:data-[active=true]:bg-[#045f64] motion-reduce:data-[active=true]:text-[#c6f56f]',
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 grid motion-reduce:hidden"
        style={
          {
            gridTemplateColumns: `repeat(${grid.cols}, ${CELL}px)`,
            gridAutoRows: `${CELL}px`,
          } as CSSProperties
        }
      >
        {Array.from({ length: grid.cols * grid.rows }, (_, index) => (
          <span key={index} data-pixel className="size-[9px] bg-[#045f64] opacity-0" />
        ))}
      </span>
      <span data-label className="relative flex items-center px-6 py-4">
        <span className="relative block overflow-hidden leading-5">
          <span data-roll className="block">
            {children}
          </span>
          <span data-roll aria-hidden="true" className="absolute top-full left-0 block">
            {children}
          </span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className="relative my-2 w-px bg-[repeating-linear-gradient(to_bottom,currentColor_0_4px,transparent_4px_8px)] opacity-35"
      />
      <span aria-hidden="true" className="relative flex overflow-hidden">
        <span data-slide className="flex items-center px-4">
          <Arrow />
        </span>
        <span data-slide className="absolute inset-y-0 right-full flex items-center px-4">
          <Arrow />
        </span>
      </span>
    </button>
  );
};

export default PixelFillButton;
