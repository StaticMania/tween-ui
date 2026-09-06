'use client';

import { useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import NumberFlow, { type Format } from '@number-flow/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DEFAULT_DURATION = 1.8;

export interface CounterNumberOnScrollProps extends ComponentPropsWithoutRef<'span'> {
  value: number;
  delay?: number;
  duration?: number;
  instant?: boolean;
  format?: Format;
}

export default function CounterNumberOnScroll({
  value,
  delay = 0,
  duration = DEFAULT_DURATION,
  instant = false,
  format,
  className,
  ...props
}: CounterNumberOnScrollProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      let startTween: gsap.core.Tween | null = null;
      const play = () => {
        startTween = gsap.delayedCall(delay, () => setDisplayValue(value));
      };

      if (prefersReducedMotion()) {
        setDisplayValue(value);
        return;
      }

      if (instant) {
        play();
        return () => startTween?.kill();
      }

      const trigger = ScrollTrigger.create({
        trigger: root,
        scroller: root.closest('[data-counter-scroller]') ?? undefined,
        start: 'top 85%',
        once: true,
        onEnter: play,
      });

      return () => {
        startTween?.kill();
        trigger.kill();
      };
    },
    { scope: rootRef, dependencies: [value, delay, instant] }
  );

  const durationMs = prefersReducedMotion() ? 0 : duration * 1000;

  return (
    <span
      ref={rootRef}
      data-counter-trigger
      className={cn('motion-reduce:transition-none', className)}
      {...props}
    >
      <NumberFlow
        value={displayValue}
        format={{ useGrouping: true, ...format }}
        trend={0}
        transformTiming={{ duration: durationMs, easing: 'ease-out' }}
        spinTiming={{ duration: durationMs, easing: 'ease-out' }}
        opacityTiming={{
          duration: prefersReducedMotion() ? 0 : Math.max(250, duration * 450),
          easing: 'ease-out',
        }}
      />
    </span>
  );
}
