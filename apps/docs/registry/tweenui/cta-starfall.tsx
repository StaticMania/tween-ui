'use client';

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import ShinyButton from './shiny-button';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Seconds for one star to cross the section, top to bottom. */
const FALL = [15, 25] as const;
/** How far a star slides sideways over that fall, in pixels. */
const DRIFT = 100;
/** Stars start and end this far outside the box so they never pop in view. */
const MARGIN = 40;

export interface CtaStarfallAction {
  /** Button label. */
  label: string;
  /** Runs when the button is pressed. */
  onClick?: () => void;
}

export interface CtaStarfallProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Button below the copy. Pass `null` to hide it. */
  action?: CtaStarfallAction | null;
  /** How many stars fill the field. */
  starCount?: number;
}

const DEFAULT_TITLE = 'Turn content into videos the smarter way';

const DEFAULT_DESCRIPTION = 'No video editing skills? No problem — we handle the hard part.';

export default function CtaStarfall({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  action = { label: 'Start creating' },
  starCount = 160,
  className,
  ...props
}: CtaStarfallProps) {
  const rootRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const field = fieldRef.current;
      if (!field) return;

      const stars = gsap.utils.toArray<HTMLElement>('[data-star]', field);
      if (stars.length === 0) return;

      const reduced = prefersReducedMotion();
      let tweens: gsap.core.Tween[] = [];

      const build = () => {
        tweens.forEach((tween) => tween.kill());
        const { width, height } = field.getBoundingClientRect();
        if (width === 0 || height === 0) return;

        tweens = stars.map((star) => {
          const startX = gsap.utils.random(0, width);
          gsap.set(star, {
            opacity: gsap.utils.random(0.3, 1),
            scale: gsap.utils.random(0.5, 1.2),
          });

          // Reduced motion still gets a sky — just a still one.
          if (reduced) {
            gsap.set(star, { x: startX, y: gsap.utils.random(0, height) });
            return gsap.to(star, { duration: 0, paused: true });
          }

          const tween = gsap.fromTo(
            star,
            { x: startX, y: -MARGIN },
            {
              x: startX + gsap.utils.random(-DRIFT, DRIFT),
              y: height + MARGIN,
              duration: gsap.utils.random(FALL[0], FALL[1]),
              ease: 'none',
              repeat: -1,
            }
          );
          // Seed each star part-way down so the field is full on the first
          // frame, instead of filling over the length of one fall.
          tween.progress(gsap.utils.random(0, 1));
          return tween;
        });
      };

      build();
      if (reduced) return;

      // Rebuild on resize so in-flight stars target the new height.
      let pending: gsap.core.Tween | undefined;
      const observer = new ResizeObserver(() => {
        pending?.kill();
        pending = gsap.delayedCall(0.2, build);
      });
      observer.observe(field);

      const setPaused = (paused: boolean) =>
        tweens.forEach((tween) => (paused ? tween.pause() : tween.play()));

      const trigger = ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => setPaused(false),
        onLeave: () => setPaused(true),
        onEnterBack: () => setPaused(false),
        onLeaveBack: () => setPaused(true),
      });

      // Don't burn frames in a background tab.
      const onVisibility = () => setPaused(document.hidden);
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        observer.disconnect();
        pending?.kill();
        trigger.kill();
        tweens.forEach((tween) => tween.kill());
        document.removeEventListener('visibilitychange', onVisibility);
      };
    },
    { scope: rootRef, dependencies: [starCount] }
  );

  return (
    <section
      ref={rootRef}
      data-cta-starfall
      className={cn(
        'relative grid min-h-[520px] w-full place-items-center overflow-hidden bg-[#0b0713] px-5 py-24 md:py-28',
        className
      )}
      {...props}
    >
      {/* Starfield. Stars are React children so nothing mutates this subtree
          behind React's back; GSAP only moves them. */}
      <div
        ref={fieldRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 motion-reduce:animate-none"
      >
        {Array.from({ length: starCount }, (_, index) => (
          <span
            key={index}
            data-star
            className="absolute top-0 left-0 size-px bg-white will-change-[transform,opacity]"
          />
        ))}
      </div>

      {/* Violet bloom at the top edge, plus the hairline it sits under. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-[420px] w-[90%] -translate-x-1/2 bg-[radial-gradient(45%_46%_at_50%_0%,#ff59fc47_0%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-px w-[70%] -translate-x-1/2 bg-[radial-gradient(circle_at_center,#ffffff_0%,transparent_100%)] blur-[0.5px]"
      />

      <div className="relative z-10 mx-auto max-w-[600px] space-y-10 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl font-medium tracking-tight text-balance text-white/90 md:text-5xl">
            {title}
          </h2>
          <p className="mx-auto max-w-[460px] text-sm text-white/50 md:text-base">{description}</p>
        </div>

        {action && (
          <div className="flex justify-center">
            <ShinyButton onClick={action.onClick}>{action.label}</ShinyButton>
          </div>
        )}
      </div>
    </section>
  );
}
