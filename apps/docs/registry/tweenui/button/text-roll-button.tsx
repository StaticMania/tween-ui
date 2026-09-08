'use client';

import { useRef, type ComponentPropsWithRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, SplitText);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface TextRollButtonProps extends ComponentPropsWithRef<'button'> {
  /** Button label. Must be a string — it is duplicated and split per character. */
  children: string;
}

export default function TextRollButton({
  children,
  className,
  type = 'button',
  ref,
  ...props
}: TextRollButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  // Merge the internal ref (needed for GSAP) with any forwarded ref.
  const setRef = (node: HTMLButtonElement | null) => {
    btnRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const btn = btnRef.current;
      const upperEl = btn?.querySelector<HTMLElement>('[data-roll-upper]');
      const lowerEl = btn?.querySelector<HTMLElement>('[data-roll-lower]');
      if (!btn || !upperEl || !lowerEl) return;

      const upper = new SplitText(upperEl, { type: 'chars', tag: 'span' });
      const lower = new SplitText(lowerEl, { type: 'chars', tag: 'span' });
      // Both copies overlap; the lower one sits one line below (clipped) until
      // hover rolls it up while the upper rolls out the top. Reveal the lower
      // wrapper — CSS keeps it hidden until GSAP is ready.
      gsap.set(lowerEl, { opacity: 1 });
      gsap.set(upper.chars, { display: 'inline-block', yPercent: 0, opacity: 1 });
      gsap.set(lower.chars, { display: 'inline-block', yPercent: 100, opacity: 0 });

      const anim = {
        duration: 0.4,
        ease: 'power2.inOut',
        stagger: 0.0125,
        overwrite: 'auto' as const,
      };
      const roll = () => {
        gsap.to(upper.chars, { yPercent: -100, opacity: 0, ...anim });
        gsap.to(lower.chars, { yPercent: 0, opacity: 1, ...anim });
      };
      const reset = () => {
        gsap.to(upper.chars, { yPercent: 0, opacity: 1, ...anim });
        gsap.to(lower.chars, { yPercent: 100, opacity: 0, ...anim });
      };

      btn.addEventListener('mouseenter', roll);
      btn.addEventListener('mouseleave', reset);
      btn.addEventListener('focus', roll);
      btn.addEventListener('blur', reset);

      return () => {
        btn.removeEventListener('mouseenter', roll);
        btn.removeEventListener('mouseleave', reset);
        btn.removeEventListener('focus', roll);
        btn.removeEventListener('blur', reset);
        upper.revert();
        lower.revert();
      };
    },
    { scope: btnRef }
  );

  return (
    <button
      ref={setRef}
      type={type}
      className={cn(
        'inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-transparent bg-[#045f64] px-6 text-sm font-medium text-[#c6f56f] shadow-[0_1px_1px_rgba(16,24,40,0.16)] transition-colors duration-300 hover:bg-[#045f64]/95 focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:ring-offset-[#12161F]',
        className
      )}
      {...props}
    >
      <span className="relative inline-block overflow-hidden leading-[1.4]">
        <span data-roll-upper className="block will-change-transform">
          {children}
        </span>
        <span
          data-roll-lower
          aria-hidden="true"
          className="absolute top-0 left-0 block opacity-0 will-change-transform motion-reduce:hidden"
        >
          {children}
        </span>
      </span>
    </button>
  );
}
