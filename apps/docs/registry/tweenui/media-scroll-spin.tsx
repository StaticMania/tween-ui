'use client';

import { useRef, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DEFAULT_IDLE_DURATION = 50;
const DEFAULT_SCROLL_DURATION = 3;
const IDLE_DEBOUNCE_MS = 150;
const MAX_TIMESCALE = 40;
const VELOCITY_PX = 16;
const SETTLE_DURATION = 0.6;

export interface MediaScrollSpinProps extends ComponentPropsWithoutRef<'figure'> {
  /** Image URL. */
  src: string;
  /** Accessible label; empty string marks the figure decorative (`aria-hidden`). */
  alt?: string;
  /** Slow continuous spin when the page is idle (seconds per turn). */
  idleDuration?: number;
  /** Faster spin while the user is scrolling (seconds per turn). */
  scrollDuration?: number;
}

export default function MediaScrollSpin({
  src,
  alt = '',
  idleDuration = DEFAULT_IDLE_DURATION,
  scrollDuration = DEFAULT_SCROLL_DURATION,
  className,
  ...props
}: MediaScrollSpinProps) {
  const figureRef = useRef<HTMLElement>(null);
  const lastScrollTopRef = useRef(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastDirectionRef = useRef<1 | -1>(1);
  const isDecorative = alt === '';

  useGSAP(
    () => {
      const item = figureRef.current;
      if (!item) return;

      if (prefersReducedMotion()) return;

      const tween = gsap.to(item, {
        rotation: 360,
        duration: idleDuration,
        ease: 'none',
        transformOrigin: 'center center',
        repeat: -1,
      });
      // Negative timeScale rewinds to t=0 and pauses; wrap so reverse can loop.
      tween.eventCallback('onReverseComplete', () => {
        tween.totalTime(tween.rawTime() + tween.duration() * 1000);
        tween.resume();
      });
      tween.totalTime(tween.duration() * 1000);

      const scrollScale = idleDuration / Math.max(scrollDuration, 0.01);

      const scroller =
        (item.closest('[data-scroll-spin-scroller]') as HTMLElement | null) ?? window;

      const getScrollTop = () =>
        scroller === window
          ? window.pageYOffset || document.documentElement.scrollTop
          : (scroller as HTMLElement).scrollTop;

      lastScrollTopRef.current = getScrollTop();

      const handleScroll = () => {
        const scrollTop = getScrollTop();
        const delta = scrollTop - lastScrollTopRef.current;
        lastScrollTopRef.current = Math.max(scrollTop, 0);
        if (!delta) return;

        const direction = delta > 0 ? 1 : -1;
        lastDirectionRef.current = direction;

        const velocityScale = Math.abs(delta) / VELOCITY_PX;
        const scale = Math.max(scrollScale, Math.min(MAX_TIMESCALE, velocityScale));

        gsap.killTweensOf(tween);
        const signedScale = direction * scale;
        if (signedScale < 0 && tween.time() < 0.001) {
          tween.totalTime(tween.duration() * 1000);
        }
        tween.timeScale(signedScale);
        tween.resume();

        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
          tween.resume();
          gsap.to(tween, {
            timeScale: lastDirectionRef.current,
            duration: SETTLE_DURATION,
            ease: 'power2.out',
            overwrite: true,
          });
        }, IDLE_DEBOUNCE_MS);
      };

      scroller.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        scroller.removeEventListener('scroll', handleScroll);
        gsap.killTweensOf(tween);
        tween.kill();
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
