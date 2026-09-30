'use client';

import { useRef, type ComponentPropsWithRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

// Touch has no hover to pull toward, and reduced motion asks for stillness.
const canMagnetize = () =>
  typeof window !== 'undefined' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export interface MagneticButtonProps extends ComponentPropsWithRef<'button'> {
  /** How strongly the button follows the cursor, as a share of its offset from center. */
  strength?: number;
  /** Distance around the button, in pixels, where the pull begins. */
  field?: number;
  /** Extra drift of the label on top of the button's own, for depth. */
  parallax?: number;
  /** Scale while the cursor is inside the field. */
  hoverScale?: number;
  /** How long the button takes to catch up with the cursor, in seconds. */
  duration?: number;
}

export default function MagneticButton({
  children,
  className,
  type = 'button',
  strength = 0.35,
  field = 60,
  parallax = 0.35,
  hoverScale = 1.05,
  duration = 0.6,
  disabled,
  ref,
  ...props
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Merge the internal ref (needed for GSAP) with any forwarded ref.
  const setRef = (node: HTMLButtonElement | null) => {
    btnRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useGSAP(
    () => {
      const btn = btnRef.current;
      const label = labelRef.current;
      if (!btn || !label || disabled || !canMagnetize()) return;

      const tween = { duration: Math.max(0.05, duration), ease: 'power3.out' };
      const btnX = gsap.quickTo(btn, 'x', tween);
      const btnY = gsap.quickTo(btn, 'y', tween);
      const btnScale = gsap.quickTo(btn, 'scale', tween);
      const labelX = gsap.quickTo(label, 'x', tween);
      const labelY = gsap.quickTo(label, 'y', tween);

      const pull = (x: number, y: number, scale: number) => {
        btnX(x);
        btnY(y);
        btnScale(scale);
        labelX(x * parallax);
        labelY(y * parallax);
      };

      const setActive = (active: boolean) => {
        if (active) btn.setAttribute('data-active', '');
        else btn.removeAttribute('data-active');
      };

      const release = () => {
        setActive(false);
        pull(0, 0, 1);
      };

      const onMove = (e: PointerEvent) => {
        // The button is the thing moving, so undo its current transform to
        // find where it rests — measuring the moved box would chase itself.
        const r = btn.getBoundingClientRect();
        const scale = Number(gsap.getProperty(btn, 'scale')) || 1;
        const cx = r.left + r.width / 2 - Number(gsap.getProperty(btn, 'x'));
        const cy = r.top + r.height / 2 - Number(gsap.getProperty(btn, 'y'));
        const halfW = r.width / scale / 2;
        const halfH = r.height / scale / 2;

        // Distance from the pointer to the resting edge — 0 when inside.
        const dx = Math.max(Math.abs(e.clientX - cx) - halfW, 0);
        const dy = Math.max(Math.abs(e.clientY - cy) - halfH, 0);
        if (Math.hypot(dx, dy) > Math.max(0, field)) return release();

        setActive(true);
        pull((e.clientX - cx) * strength, (e.clientY - cy) * strength, hoverScale);
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', release);
      window.addEventListener('blur', release);

      return () => {
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', release);
        window.removeEventListener('blur', release);
        setActive(false);
      };
    },
    {
      scope: btnRef,
      dependencies: [strength, field, parallax, hoverScale, duration, disabled],
      revertOnUpdate: true,
    }
  );

  return (
    <button
      ref={setRef}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-transparent bg-[#045f64] px-6 text-sm font-medium whitespace-nowrap text-[#c6f56f] shadow-[0_1px_1px_rgba(16,24,40,0.16)] transition-colors duration-300 will-change-transform select-none focus-visible:bg-[#c6f56f] focus-visible:text-[#045f64] focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 data-[active]:bg-[#c6f56f] data-[active]:text-[#045f64] motion-reduce:transition-none dark:ring-offset-[#12161F]',
        className
      )}
      {...props}
    >
      <span ref={labelRef} className="inline-block will-change-transform">
        {children}
      </span>
    </button>
  );
}
