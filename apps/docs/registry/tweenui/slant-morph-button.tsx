'use client';

import { useRef, type ComponentPropsWithRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, MorphSVGPlugin);

const SEAM_REST =
  'M0 0H5.63C13.438 0 19.166 7.337 17.272 14.91L11.182 39.269A11.527 11.527 0 0 1 0 48V0Z';
const SEAM_FLIPPED =
  'M0 48H5.63C13.438 48 19.166 40.663 17.272 33.09L11.182 8.731A11.527 11.527 0 0 0 0 0V48Z';
const TILE_REST =
  'M6.728 9.09A12 12 0 0 1 18.369 0H39C45.627 0 51 5.373 51 12V36C51 42.627 45.627 48 39 48H12.37C4.561 48 -1.167 40.663 0.727 33.09L6.728 9.09Z';
const TILE_FLIPPED =
  'M6.728 38.91A12 12 0 0 0 18.369 48H39C45.627 48 51 42.627 51 36V12C51 5.373 45.627 0 39 0H12.37C4.561 0 -1.167 7.337 0.727 14.91L6.728 38.91Z';
const ARROW = 'M7.703 5.8H.398V4.6h7.305l-3.36-3.36.855-.84 4.8 4.8-4.8 4.8-.855-.84 3.36-3.36Z';

const canMorph = () =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const swap = 'transition-[fill] duration-600 ease-(--settle) motion-reduce:transition-none';

const slide =
  'size-2.5 flex-none -translate-x-full transition-transform duration-600 ease-(--settle) group-hover:translate-x-0 group-focus-visible:translate-x-0 motion-reduce:transition-none';

export interface SlantMorphButtonProps extends ComponentPropsWithRef<'button'> {
  children: string;
}

export default function SlantMorphButton({
  children,
  className,
  type = 'button',
  disabled,
  ref,
  ...props
}: SlantMorphButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const seamRef = useRef<SVGPathElement>(null);
  const tileRef = useRef<SVGPathElement>(null);

  const setRef = (node: HTMLButtonElement | null) => {
    btnRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useGSAP(
    () => {
      const btn = btnRef.current;
      const seam = seamRef.current;
      const tile = tileRef.current;
      if (!btn || !seam || !tile || disabled || !canMorph()) return;

      const hinge = gsap
        .timeline({ paused: true, defaults: { duration: 0.6, ease: 'power3.inOut' } })
        .to(seam, { morphSVG: { shape: SEAM_FLIPPED, shapeIndex: 'auto' } }, 0)
        .to(tile, { morphSVG: { shape: TILE_FLIPPED, shapeIndex: 'auto' } }, 0);

      const open = () => hinge.play();
      const close = () => hinge.reverse();
      const onFocus = () => {
        if (btn.matches(':focus-visible')) open();
      };
      const onBlur = () => {
        if (!btn.matches(':hover')) close();
      };

      btn.addEventListener('pointerenter', open);
      btn.addEventListener('pointerleave', close);
      btn.addEventListener('focus', onFocus);
      btn.addEventListener('blur', onBlur);

      return () => {
        hinge.kill();
        btn.removeEventListener('pointerenter', open);
        btn.removeEventListener('pointerleave', close);
        btn.removeEventListener('focus', onFocus);
        btn.removeEventListener('blur', onBlur);
      };
    },
    { scope: btnRef, dependencies: [disabled], revertOnUpdate: true }
  );

  return (
    <button
      ref={setRef}
      type={type}
      disabled={disabled}
      className={cn(
        'group relative inline-flex h-12 cursor-pointer items-stretch font-mono text-sm whitespace-nowrap uppercase select-none [--settle:cubic-bezier(0.25,1,0.5,1)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60',
        className
      )}
      {...props}
    >
      <span className="relative mr-4 flex items-center rounded-l-xl bg-[#045f64] py-2 pr-2 pl-5 text-[#c6f56f] transition-colors duration-600 ease-(--settle) group-hover:bg-[#c6f56f] group-hover:text-[#045f64] group-focus-visible:bg-[#c6f56f] group-focus-visible:text-[#045f64] motion-reduce:transition-none">
        {children}
        <svg
          viewBox="0 0 18 48"
          aria-hidden="true"
          className="absolute top-0 -right-4 h-full w-[18px] overflow-visible"
        >
          <path
            ref={seamRef}
            d={SEAM_REST}
            className={cn(
              swap,
              'fill-[#045f64] group-hover:fill-[#c6f56f] group-focus-visible:fill-[#c6f56f]'
            )}
          />
        </svg>
      </span>
      <span aria-hidden="true" className="relative grid w-[51px] place-items-center">
        <svg viewBox="0 0 51 48" className="absolute inset-0 size-full overflow-visible">
          <path
            ref={tileRef}
            d={TILE_REST}
            className={cn(
              swap,
              'fill-[#c6f56f] group-hover:fill-[#045f64] group-focus-visible:fill-[#045f64]'
            )}
          />
        </svg>
        <span className="relative ml-px flex w-2.5 overflow-hidden">
          <svg viewBox="0 0 10 10" className={cn(slide, 'fill-[#c6f56f]')}>
            <path d={ARROW} />
          </svg>
          <svg viewBox="0 0 10 10" className={cn(slide, 'fill-[#045f64]')}>
            <path d={ARROW} />
          </svg>
        </span>
      </span>
    </button>
  );
}
