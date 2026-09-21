'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { markIntroSettled } from '@/lib/intro';
import { prefersReducedMotion, TWEEN_EASE, tweenEase } from '@/lib/motion';

gsap.registerPlugin(useGSAP, DrawSVGPlugin, MotionPathPlugin);

const SEEN_KEY = 'tween-ui:intro-seen';
/** Points sampled along the wiping edge. Enough to read as a curve, cheap to rebuild each frame. */
const EDGE_SAMPLES = 28;
/** How far the edge bows, in viewport-height percent. */
const EDGE_BOW = 14;
/** How long the plot takes to draw. Time is linear here — the curve is the easing. */
const SCRUB = 1.15;
const CURVE_PATH = 'M0 400 C128 112 0 0 400 0';
const RAIL_TICKS = Array.from({ length: 9 }, (_, index) => index / 8);

const hasSeenIntro = () => {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) !== null;
  } catch {
    return false;
  }
};

const rememberIntro = () => {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Private-mode storage refusal only costs a replay on the next page load.
  }
};

/**
 * Intro overlay. The brand's easing curve plots itself in real time — a dot
 * rides the drawn tip while the counter, the rail playhead and its ticks all
 * advance linearly off the same scrub, so the graph reads as what it is: time
 * on the bottom, eased value up the side. The panel then lifts away behind an
 * edge shaped by that same cubic-bezier.
 *
 * Runs once per session, never under reduced motion, and the page underneath is
 * fully rendered the whole time.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const dismiss = () => {
        root.style.display = 'none';
        document.body.style.overflow = '';
        markIntroSettled();
      };

      if (prefersReducedMotion() || hasSeenIntro()) {
        dismiss();
        return;
      }
      rememberIntro();
      document.body.style.overflow = 'hidden';

      const ease = tweenEase();
      const counter = root.querySelector<HTMLElement>('[data-intro-count]');
      const progress = { value: 0 };

      const edgeAt = (offset: number) => {
        const points: string[] = [];
        for (let index = EDGE_SAMPLES; index >= 0; index -= 1) {
          const x = index / EDGE_SAMPLES;
          const y = offset + (0.5 - ease(x)) * EDGE_BOW;
          points.push(`${(x * 100).toFixed(2)}% ${y.toFixed(2)}%`);
        }
        return `polygon(0% 0%, 100% 0%, ${points.join(', ')})`;
      };

      const wipe = { offset: 100 + EDGE_BOW };
      gsap.set(root, { clipPath: edgeAt(wipe.offset) });

      const timeline = gsap.timeline({ onComplete: dismiss });
      const ridePath = { motionPath: { path: CURVE_PATH }, duration: SCRUB, ease: 'none' } as const;

      // These three are hidden by the stylesheet from the first paint, so each
      // tween states its end explicitly rather than reading it off the element.
      timeline
        .fromTo(
          '[data-intro-brand]',
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease },
          0
        )
        .fromTo(
          '[data-intro-plot]',
          { autoAlpha: 0, scale: 0.94 },
          { autoAlpha: 1, scale: 1, duration: 0.5, ease },
          0.15
        )
        .fromTo('[data-intro-rail]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease }, 0.3)
        .from('[data-intro-curve]', { drawSVG: '0%', duration: SCRUB, ease: 'none' }, 0.35)
        .to('[data-intro-dot]', ridePath, 0.35)
        .to('[data-intro-halo]', ridePath, 0.35)
        .to(
          progress,
          {
            value: 100,
            duration: SCRUB,
            ease: 'none',
            onUpdate: () => {
              if (counter)
                counter.textContent = String(Math.round(progress.value)).padStart(3, '0');
            },
          },
          0.35
        )
        .to('[data-intro-playhead]', { left: '100%', duration: SCRUB, ease: 'none' }, 0.35)
        .to(
          '[data-intro-tick]',
          {
            backgroundColor: '#c6f56f',
            duration: 0.2,
            ease: 'none',
            stagger: { each: SCRUB / RAIL_TICKS.length },
          },
          0.35
        )
        .to('[data-intro-panel]', { autoAlpha: 0, y: -10, duration: 0.35, ease }, 1.6)
        // Release the hero as the wipe begins rather than when it ends, so its
        // reveal plays while the page is being uncovered instead of after.
        .call(markIntroSettled, undefined, 1.65)
        .to(
          wipe,
          {
            offset: -EDGE_BOW,
            duration: 0.9,
            ease,
            onUpdate: () => gsap.set(root, { clipPath: edgeAt(wipe.offset) }),
          },
          1.65
        );

      return () => {
        document.body.style.overflow = '';
        markIntroSettled();
      };
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-preloader
      aria-hidden="true"
      className="bg-tween-ink stage-grid grid place-items-center"
    >
      <noscript>
        <style>{'[data-preloader]{display:none}'}</style>
      </noscript>

      <div data-intro-panel className="flex flex-col items-center gap-7 px-6">
        <div data-intro-brand className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
            <rect width="24" height="24" rx="6" className="fill-tween-teal" />
            <path
              d="M5 19 C 9.5 8.9, 5 5, 19 5"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-tween-lime"
            />
            <circle cx="19" cy="5" r="1.8" className="fill-tween-lime" />
          </svg>
          <span className="text-sm font-semibold tracking-tight text-white">Tween UI</span>
        </div>

        <svg
          data-intro-plot
          viewBox="-18 -18 436 436"
          className="w-[168px] overflow-visible sm:w-[200px]"
          aria-hidden="true"
        >
          <line x1="0" y1="400" x2="400" y2="400" className="stroke-tween-teal-soft/30" />
          <line x1="0" y1="400" x2="0" y2="0" className="stroke-tween-teal-soft/30" />
          <line
            x1="0"
            y1="400"
            x2="400"
            y2="0"
            strokeDasharray="4 6"
            className="stroke-tween-teal-soft/20"
          />
          <path
            data-intro-curve
            d={CURVE_PATH}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-tween-teal-soft"
          />
          <circle data-intro-halo r="14" className="fill-tween-lime/25" />
          <circle data-intro-dot r="7" className="fill-tween-lime" />
        </svg>

        <div data-intro-rail className="w-[168px] sm:w-[200px]">
          <div className="text-tween-teal-soft/70 mb-2 flex items-baseline justify-between font-mono text-[11px]">
            <span data-intro-count className="text-tween-teal-soft tabular-nums">
              000
            </span>
            <span>{TWEEN_EASE}</span>
          </div>
          <div className="border-tween-teal-soft/25 relative h-3 border-t">
            {RAIL_TICKS.map((position) => (
              <span
                key={position}
                data-intro-tick
                className="bg-tween-teal-soft/35 absolute top-0 h-1.5 w-px"
                style={{ left: `${position * 100}%` }}
              />
            ))}
            <span
              data-intro-playhead
              className="bg-tween-lime absolute -top-px bottom-0 left-0 w-px shadow-[0_0_10px_#c6f56f]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
