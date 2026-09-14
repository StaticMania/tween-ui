'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { RotateCcw } from 'lucide-react';
import { prefersReducedMotion, TWEEN_EASE, tweenEase } from '@/lib/motion';
import { cn } from '@/lib/utils';
import IconTrailButton from '@/registry/tweenui/icon-trail-button';
import { RevealGroup } from './reveal-group';

gsap.registerPlugin(useGSAP, MotionPathPlugin);

const RULER_SECONDS = 2.4;
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
  const router = useRouter();
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

      timeline.play();
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
        className="bg-tween-ink stage-grid relative flex min-h-[calc(100svh-4.5rem)] flex-col overflow-hidden rounded-2xl py-10 text-white sm:rounded-3xl sm:py-14 dark:ring-1 dark:ring-white/10"
      >
        <RevealGroup trigger="load" delay={0.1} className="flex flex-1 flex-col">
          <div className="main-container flex flex-1 items-center">
            <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <p
                  data-reveal
                  className="border-tween-teal-soft/25 text-tween-teal-soft mb-6 inline-flex items-center gap-2.5 rounded-full border bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] sm:text-xs"
                >
                  <span
                    className="bg-tween-lime size-1.5 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  {componentCount} components · {blockCount} blocks · React 19 + Tailwind v4
                </p>

                <h1
                  data-reveal-text
                  id="hero-title"
                  className="text-[40px] leading-[1.05] font-medium tracking-[-0.035em] text-balance text-white sm:text-[52px] md:text-6xl lg:text-[76px]"
                >
                  Copy the source.
                  <br />
                  Own the <span className="text-tween-lime">animation.</span>
                </h1>

                <p
                  data-reveal-text
                  className="mt-6 max-w-[560px] text-[15px] leading-relaxed text-pretty text-white/70 sm:text-base md:text-lg"
                >
                  Animated React components built with GSAP and Tailwind CSS. The CLI copies the
                  whole file into your project — there is no package to install and no API to learn.
                </p>

                <div data-reveal className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
                  <IconTrailButton onClick={() => router.push('/components')}>
                    Browse components
                  </IconTrailButton>
                  <IconTrailButton onClick={() => router.push('/components#blocks')}>
                    Browse blocks
                  </IconTrailButton>
                </div>
              </div>

              <figure data-reveal className="flex flex-col items-center gap-3 lg:col-span-5">
                <svg
                  viewBox="-24 -24 472 472"
                  role="img"
                  aria-labelledby="hero-curve-title"
                  className="w-full max-w-[230px] overflow-visible sm:max-w-[300px] lg:max-w-[420px]"
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
                <figcaption className="text-tween-teal-soft/80 font-mono text-xs">
                  cubic-bezier({TWEEN_EASE})
                </figcaption>
              </figure>
            </div>
          </div>

          <div data-reveal className="main-container mt-10 sm:mt-14">
            <div className="text-tween-teal-soft/70 mb-3 flex items-center justify-between font-mono text-[11px]">
              <span>timeline · {RULER_SECONDS}s · 4 tweens</span>
              <button
                type="button"
                onClick={handleReplay}
                className="border-tween-teal-soft/30 text-tween-teal-soft hover:border-tween-lime hover:text-tween-lime focus-visible:ring-tween-lime inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
              >
                <RotateCcw className="size-3" aria-hidden="true" />
                Replay
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
        </RevealGroup>
      </div>
    </section>
  );
}
