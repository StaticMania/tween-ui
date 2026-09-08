'use client';

import { useRef, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DEFAULT_IDLE_DURATION = 50;
const DEFAULT_SCROLL_DURATION = 12;
const IDLE_DEBOUNCE_MS = 150;

export interface ScrollSpinImageProps extends ComponentPropsWithoutRef<'figure'> {
  /** Image URL. */
  src: string;
  /** Accessible label; empty string marks the figure decorative (`aria-hidden`). */
  alt?: string;
  /** Slow continuous spin when the page is idle (seconds per turn). */
  idleDuration?: number;
  /** Faster spin while the user is scrolling (seconds per turn). */
  scrollDuration?: number;
}

export default function ScrollSpinImage({
  src,
  alt = '',
  idleDuration = DEFAULT_IDLE_DURATION,
  scrollDuration = DEFAULT_SCROLL_DURATION,
  className,
  ...props
}: ScrollSpinImageProps) {
  const figureRef = useRef<HTMLElement>(null);
  const lastScrollTopRef = useRef(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentTweenRef = useRef<gsap.core.Tween | null>(null);
  const lastDirectionRef = useRef<'up' | 'down'>('down');
  const isDecorative = alt === '';

  useGSAP(
    () => {
      const item = figureRef.current;
      if (!item) return;

      if (prefersReducedMotion()) return;

      const startRotation = (direction: 'up' | 'down', duration: number) => {
        currentTweenRef.current?.kill();
        currentTweenRef.current = gsap.to(item, {
          rotate: direction === 'up' ? '-=360' : '+=360',
          duration,
          ease: 'linear',
          transformOrigin: 'center center',
          repeat: -1,
        });
      };

      const scroller =
        (item.closest('[data-scroll-spin-scroller]') as HTMLElement | null) ?? window;

      const getScrollTop = () =>
        scroller === window
          ? window.pageYOffset || document.documentElement.scrollTop
          : (scroller as HTMLElement).scrollTop;

      const handleScroll = () => {
        const scrollTop = getScrollTop();

        let direction: 'up' | 'down' | null = null;
        if (scrollTop > lastScrollTopRef.current) {
          direction = 'down';
        } else if (scrollTop < lastScrollTopRef.current) {
          direction = 'up';
        }

        if (direction) {
          lastDirectionRef.current = direction;
          startRotation(direction, scrollDuration);
        }

        lastScrollTopRef.current = Math.max(scrollTop, 0);

        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          startRotation(lastDirectionRef.current, idleDuration);
        }, IDLE_DEBOUNCE_MS);
      };

      scroller.addEventListener('scroll', handleScroll, { passive: true });
      startRotation('down', idleDuration);

      return () => {
        scroller.removeEventListener('scroll', handleScroll);
        currentTweenRef.current?.kill();
        clearTimeout(scrollTimeoutRef.current);
      };
    },
    { scope: figureRef, dependencies: [src, idleDuration, scrollDuration] }
  );

  return (
    <figure
      ref={figureRef}
      data-scroll-spin
      aria-hidden={isDecorative ? true : undefined}
      className={cn('pointer-events-none motion-reduce:transition-none', className)}
      {...props}
    >
      <img src={src} alt={alt} className="size-full object-cover" />
    </figure>
  );
}
