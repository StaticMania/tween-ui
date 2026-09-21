'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { RotateCcw } from 'lucide-react';
import { isIntroSettled, whenIntroSettled } from '@/lib/intro';
import { prefersReducedMotion, TWEEN_EASE, tweenEase } from '@/lib/motion';
import { cn } from '@/lib/utils';
import IconTrailButton from '@/registry/tweenui/icon-trail-button';
import { RevealGroup } from './reveal-group';

gsap.registerPlugin(useGSAP, MotionPathPlugin);

const RULER_SECONDS = 2.4;
const INTRO_TIMEOUT_MS = 3000;
const CURVE_PATH = 'M0 400 C128 112 0 0 400 0';
const TICKS = Array.from({ length: 13 }, (_, index) => index * 0.2);
const KEYFRAMES = [
  { label: 'badge', at: 0.2 },
  { label: 'h1', at: 0.6 },
  { label: 'lede', at: 1.2 },
  { label: 'cta', at: 1.6 },
] as const;
const RIDERS = [
  { id: 'halo', radius: 13, delay: 0, className: 'fill-tween-lime/25' },
  { id: 'trail-b', radius: 4, delay: 0.26, className: 'fill-tween-lime/35' },
  { id: 'trail-a', radius: 4.5, delay: 0.14, className: 'fill-tween-lime/50' },
  { id: 'head', radius: 6.5, delay: 0, className: 'fill-tween-lime' },
] as const;

const rulerPosition = (seconds: number) => ({ left: `${(seconds / RULER_SECONDS) * 100}%` });

export type HeroProps = Readonly<{
  componentCount: number;
  blockCount: number;
}>;

export function Hero({ componentCount, blockCount }: HeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const ease = tweenEase();
      const riders = gsap.utils.toArray<SVGCircleElement>('[data-rider-delay]', root);
      const markers = gsap.utils.toArray<HTMLElement>('[data-marker-at]', root);
      const playhead = root.querySelector<HTMLElement>('[data-playhead]');
      const curve = root.querySelector<SVGPathElement>('[data-curve]');

      const timeline = gsap.timeline({ paused: true, defaults: { ease } });

      if (playhead) {
        timeline.fromTo(
          playhead,
          { left: '0%' },
          { left: '100%', duration: RULER_SECONDS, ease: 'none' },
          0
        );
      }

      markers.forEach((marker) => {
        timeline.to(
          marker,
          {
            backgroundColor: '#c6f56f',
            boxShadow: '0 0 10px #c6f56f',
            duration: 0.25,
            ease: 'none',
          },
          Number(marker.dataset.markerAt)
        );
      });

      if (curve) {
        timeline.fromTo(
          curve,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.3 },
          0.5
        );
      }

      timelineRef.current = timeline;

      if (prefersReducedMotion()) {
        timeline.progress(1);
        gsap.set(riders, { x: 400, y: 0 });
        return;
      }

      riders.forEach((rider) => {
        gsap.to(rider, {
          motionPath: { path: CURVE_PATH },
          duration: 1.7,
          repeat: -1,
          repeatDelay: 0.7,
          delay: Number(rider.dataset.riderDelay),
          ease: 'none',
        });
      });

      if (isIntroSettled()) timeline.play();
      else {
        void Promise.race([
          whenIntroSettled(),
          new Promise((resolve) => window.setTimeout(resolve, INTRO_TIMEOUT_MS)),
        ]).then(() => timeline.play());
      }
    },
    { scope: rootRef }
  );

  const handleReplay = () => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    if (prefersReducedMotion()) {
      timeline.progress(1);
      return;
    }
    timeline.restart();
  };

  return (
    <section aria-labelledby="hero-title" className="px-2 pt-2 sm:px-4 sm:pt-4">
      <div
        ref={rootRef}
        className="bg-tween-ink bezel-on-ink relative isolate flex min-h-[calc(100dvh-4.5rem)] flex-col overflow-hidden rounded-[2rem] pt-16 pb-6 text-white sm:rounded-[2.5rem] sm:pt-20 sm:pb-8 dark:ring-1 dark:ring-white/10"
      >
        <span
          aria-hidden="true"
          className="stage-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black,transparent)]"
        />
        <span
          aria-hidden="true"
          className="stage-glow pointer-events-none absolute inset-0 -z-10"
        />

        <RevealGroup trigger="load" delay={0.1} className="flex flex-1 flex-col">
          <div className="main-container flex flex-1 items-center">
            <div className="grid w-full items-center gap-14 lg:grid-cols-12 lg:gap-12">
              <div className="text-center lg:col-span-7 lg:text-left">
                <p
                  data-reveal
                  className="text-tween-teal-soft mb-8 inline-flex items-center gap-2.5 rounded-full bg-white/[0.04] py-2 pr-4 pl-2.5 text-[10px] leading-none font-medium tracking-[0.2em] uppercase ring-1 ring-white/10"
                >
                  <span className="relative flex size-2 shrink-0" aria-hidden="true">
                    <span className="bg-tween-lime/70 absolute -inset-1 animate-ping rounded-full [animation-duration:2.4s] motion-reduce:hidden" />
                    <span className="bg-tween-lime relative size-full rounded-full shadow-[0_0_5px_var(--color-tween-lime),0_0_12px_var(--color-tween-lime)]" />
                  </span>
                  {componentCount} components · {blockCount} blocks
                  <span className="hidden sm:inline"> · React 19 + Tailwind v4</span>
                </p>

                <h1
                  data-reveal-text
                  id="hero-title"
                  className="text-[44px] leading-[0.98] font-medium tracking-[-0.045em] text-balance text-white sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px]"
                >
                  Copy the source.
                  <br />
                  Own the <span className="text-tween-lime">animation.</span>
                </h1>

                <p
                  data-reveal-text
                  className="mx-auto mt-8 max-w-[34rem] text-[15px] leading-relaxed text-pretty text-white/60 sm:text-base md:text-lg lg:mx-0"
                >
                  Animated React components built with GSAP and Tailwind CSS. The CLI copies the
                  whole file into your project — there is no package to install and no API to learn.
                </p>

                <div
                  data-reveal
                  className="mx-auto mt-12 flex w-full max-w-72 flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:justify-start"
                >
                  <IconTrailButton href="/components" className="w-full justify-center sm:w-auto">
                    Browse components
                  </IconTrailButton>
                  <IconTrailButton
                    href="/components#blocks"
                    className="w-full justify-center bg-white/[0.06] text-white ring-1 ring-white/12 ring-inset sm:w-auto"
                  >
                    Browse blocks
                  </IconTrailButton>
                </div>
              </div>

              <figure
                data-reveal
                className="bezel-shell mx-auto w-full max-w-[22rem] sm:max-w-[26rem] lg:col-span-5 lg:max-w-none"
              >
                <div className="bezel-core flex flex-col gap-6 p-6 sm:p-8">
                  <div
                    aria-hidden="true"
                    className="text-tween-teal-soft/60 flex items-center justify-between text-[10px] font-medium tracking-[0.2em] uppercase"
                  >
                    <span>ease · tween</span>
                    <span className="flex gap-1.5">
                      <span className="size-1.5 rounded-full bg-white/15" />
                      <span className="size-1.5 rounded-full bg-white/15" />
                      <span className="bg-tween-lime size-1.5 rounded-full" />
                    </span>
                  </div>
                  <svg
                    viewBox="-24 -24 472 472"
                    role="img"
                    aria-labelledby="hero-curve-title"
                    className="mx-auto w-full max-w-[360px] overflow-visible"
                  >
                    <title id="hero-curve-title">
                      The easing curve Tween UI components share, with a dot riding it
                    </title>
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
                    <line
                      x1="0"
                      y1="400"
                      x2="128"
                      y2="112"
                      strokeDasharray="3 5"
                      className="stroke-tween-teal-soft/45"
                    />
                    <line
                      x1="400"
                      y1="0"
                      x2="0"
                      y2="0"
                      strokeDasharray="3 5"
                      className="stroke-tween-teal-soft/45"
                    />
                    <circle
                      cx="128"
                      cy="112"
                      r="5"
                      strokeWidth="1.5"
                      className="fill-tween-ink stroke-tween-teal-soft"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="5"
                      strokeWidth="1.5"
                      className="fill-tween-ink stroke-tween-teal-soft"
                    />
                    <path
                      data-curve
                      d={CURVE_PATH}
                      pathLength={1}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="stroke-tween-teal-soft fill-none [stroke-dasharray:1]"
                    />
                    {RIDERS.map((rider) => (
                      <circle
                        key={rider.id}
                        data-rider-delay={rider.delay}
                        r={rider.radius}
                        className={rider.className}
                      />
                    ))}
                    <text x="404" y="414" className="fill-tween-teal-soft/70 font-mono text-[11px]">
                      time
                    </text>
                    <text x="-6" y="-12" className="fill-tween-teal-soft/70 font-mono text-[11px]">
                      value
                    </text>
                  </svg>
                  <figcaption className="text-tween-teal-soft/80 border-t border-white/[0.06] pt-4 text-center font-mono text-xs">
                    cubic-bezier({TWEEN_EASE})
                  </figcaption>
                </div>
              </figure>
            </div>
          </div>

          <div data-reveal className="main-container">
            <div className="bezel-shell mt-14 sm:mt-20">
              <div className="bezel-core px-5 pt-4 pb-9 sm:px-7">
                <div className="text-tween-teal-soft/70 mb-4 flex items-center justify-between font-mono text-[11px]">
                  <span>timeline · {RULER_SECONDS}s · 4 tweens</span>
                  <button
                    type="button"
                    onClick={handleReplay}
                    className="group text-tween-teal-soft hover:text-tween-lime hover:ring-tween-lime/40 focus-visible:ring-tween-lime ease-tween inline-flex h-8 items-center gap-2 rounded-full bg-white/[0.04] py-1 pr-1 pl-3 ring-1 ring-white/10 transition-[color,box-shadow,transform] duration-500 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] motion-reduce:transition-none"
                  >
                    Replay
                    <span
                      aria-hidden="true"
                      className="ease-tween grid size-6 place-items-center rounded-full bg-white/[0.06] transition-transform duration-700 group-hover:-rotate-180 motion-reduce:transition-none"
                    >
                      <RotateCcw strokeWidth={1.5} className="size-3" />
                    </span>
                  </button>
                </div>

                <div
                  aria-hidden="true"
                  className="border-tween-teal-soft/25 relative h-6 border-t sm:h-7"
                >
                  {TICKS.map((seconds, index) => {
                    const isMajor = index % 2 === 0;
                    const isKey = index === 0 || index === 6 || index === 12;
                    return (
                      <span
                        key={seconds}
                        className={cn(
                          'bg-tween-teal-soft/45 absolute top-0 w-px',
                          isMajor ? 'h-3' : 'h-1.5'
                        )}
                        style={rulerPosition(seconds)}
                      >
                        {isMajor && (
                          <span
                            className={cn(
                              'text-tween-teal-soft/70 absolute top-4 left-0 font-mono text-[10px] whitespace-nowrap',
                              index === 0 && 'translate-x-0',
                              index === 12 && '-translate-x-full',
                              index !== 0 && index !== 12 && '-translate-x-1/2',
                              isKey ? 'block' : 'hidden md:block'
                            )}
                          >
                            {seconds.toFixed(1)}s
                          </span>
                        )}
                      </span>
                    );
                  })}
                  {KEYFRAMES.map(({ label, at }) => (
                    <span key={label} className="absolute top-0 size-0" style={rulerPosition(at)}>
                      <span
                        data-marker-at={at}
                        className="bg-tween-teal-soft/35 absolute -top-[4.5px] -left-[4.5px] size-[9px] rotate-45 rounded-[1px]"
                      />
                      <span className="text-tween-teal-soft/60 absolute top-4 left-0 hidden -translate-x-1/2 font-mono text-[10px] lg:block">
                        {label}
                      </span>
                    </span>
                  ))}
                  <span
                    data-playhead
                    className="bg-tween-lime before:border-b-tween-lime absolute -top-px bottom-0 left-0 z-[1] w-px shadow-[0_0_12px_#c6f56f] before:absolute before:-bottom-0.5 before:left-1/2 before:-translate-x-1/2 before:border-x-[5px] before:border-b-[7px] before:border-x-transparent before:content-['']"
                  />
                </div>
              </div>
            </div>
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
