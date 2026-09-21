'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { isIntroSettled, whenIntroSettled } from '@/lib/intro';
import { prefersReducedMotion, tweenEase } from '@/lib/motion';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/** Never leave content waiting on a cue that failed to arrive. */
const CUE_TIMEOUT_MS = 3000;
/** Gap between one element starting and the next. */
const STEP = 0.09;

const withTimeout = (cue: Promise<unknown>) =>
  Promise.race([cue, new Promise((resolve) => window.setTimeout(resolve, CUE_TIMEOUT_MS))]);

export type RevealGroupProps = Readonly<{
  children: ReactNode;
  /** `load` plays on mount; `scroll` waits until the group enters the viewport. */
  trigger?: 'load' | 'scroll';
  delay?: number;
  className?: string;
}>;

/**
 * Reveals a whole section as one timeline. Mark any descendant with
 * `data-reveal` to rise and fade in, or `data-reveal-text` to have its lines
 * ride up from behind a mask. Everything animates in document order off a
 * single stagger, so copy, buttons and figures move together.
 *
 * Targets are hidden by the stylesheet from the first paint (see globals.css),
 * so the server HTML never shows them in their finished state before they
 * animate. Every path that skips the animation shows them explicitly, and the
 * intro cue is raced against a timeout, so nothing is left hidden. Splits are
 * reverted once the reveal lands, leaving the markup free to reflow.
 */
export function RevealGroup({
  children,
  trigger = 'scroll',
  delay = 0,
  className,
}: RevealGroupProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const targets = gsap.utils.toArray<HTMLElement>('[data-reveal], [data-reveal-text]', root);
      if (targets.length === 0) return;

      // The stylesheet hides targets before the first paint, so any path that
      // skips the animation has to show them itself.
      const fonts = document.fonts;
      if (!fonts || prefersReducedMotion()) {
        gsap.set(targets, { autoAlpha: 1 });
        return;
      }

      const splits: SplitText[] = [];
      let isCancelled = false;

      const build = () => {
        if (isCancelled || !rootRef.current) return;

        const timeline = gsap.timeline({
          delay,
          defaults: { ease: tweenEase() },
          onComplete: () => splits.forEach((split) => split.revert()),
          ...(trigger === 'scroll'
            ? { scrollTrigger: { trigger: rootRef.current, start: 'top 80%', once: true } }
            : {}),
        });

        targets.forEach((target, index) => {
          const at = index * STEP;

          if (target.dataset.revealText !== undefined) {
            const split = SplitText.create(target, { type: 'lines', mask: 'lines' });
            splits.push(split);
            // Lines start below their masks, so the element itself can be shown
            // now — in the same frame, before anything can paint.
            timeline.from(split.lines, { yPercent: 110, duration: 0.9, stagger: 0.07 }, at);
            gsap.set(target, { autoAlpha: 1 });
            return;
          }

          // `fromTo`, not `from`: the stylesheet already has the target hidden,
          // and `from` would read that hidden state as where to animate *to*.
          timeline.fromTo(
            target,
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.8 },
            at
          );
        });
      };

      // Splitting before the webfont lands measures the fallback's line breaks,
      // and `load` groups sit behind the intro overlay until it clears.
      const needsIntro = trigger === 'load' && !isIntroSettled();
      if (fonts.status === 'loaded' && !needsIntro) build();
      else {
        void withTimeout(Promise.all([fonts.ready, needsIntro ? whenIntroSettled() : null])).then(
          build
        );
      }

      return () => {
        isCancelled = true;
        splits.forEach((split) => split.revert());
      };
    },
    { scope: rootRef, dependencies: [trigger, delay] }
  );

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
