'use client';

import { useRef, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, CustomEase, SplitText);
if (!CustomEase.get('shutter-out')) CustomEase.create('shutter-out', '0.16,1,0.3,1');
if (!CustomEase.get('shutter-in')) CustomEase.create('shutter-in', '0.6,0,0.9,0.35');
if (!CustomEase.get('shutter-in-out')) CustomEase.create('shutter-in-out', '0.72,0,0.18,1');

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Hover pauses autoplay — only where there is a real hover. */
const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Vertical slats the incoming image opens through. */
const SLATS = 6;

const pad = (n: number) => String(n).padStart(2, '0');

export interface ShutterSlide {
  /** Large serif title above the image. */
  heading: string;
  /** Image URL. Any aspect works — it is cropped to a 2:1 frame. */
  image: string;
  /** Alt text for the image. Empty marks it decorative. */
  imageAlt?: string;
  /** Paragraph under the pagination. */
  description: string;
  /** Short uppercase line at the bottom. */
  caption?: string;
}

export interface ShutterSliderProps extends ComponentPropsWithoutRef<'section'> {
  /** Slides, in order. Defaults to a three-slide sample. */
  slides?: ShutterSlide[];
  /** Seconds each slide holds before advancing. `0` turns autoplay off. */
  autoplay?: number;
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?w=1600&h=800&fit=crop&auto=format&q=80`;

const DEFAULT_SLIDES: ShutterSlide[] = [
  {
    heading: 'Light first',
    image: unsplash('photo-1512917774080-9991f1c4c750'),
    imageAlt: 'A white modern house with floor-to-ceiling glass, a palm and a pool in the sun',
    description:
      'Every room is planned around the path of the sun, so mornings start bright and evenings stay warm without reaching for a switch.',
    caption: 'Designed around daylight',
  },
  {
    heading: 'Room to breathe',
    image: unsplash('photo-1600607687939-ce8a6c25118c'),
    imageAlt: 'An open-plan living room flowing into a kitchen under a high white ceiling',
    description:
      'Open plans, tall ceilings and quiet corners give every home the space to gather, to work and to slow down.',
    caption: 'Space that adapts',
  },
  {
    heading: 'Built to last',
    image: unsplash('photo-1600585154340-be6161a56a0c'),
    imageAlt: 'A timber-clad house lit warmly from inside at dusk, under a large tree',
    description:
      'Stone, timber and lime plaster, chosen to age gracefully and hold their character for decades.',
    caption: 'Honest materials',
  },
];

interface SlideParts {
  slide: HTMLElement;
  heading: HTMLElement;
  copy: HTMLElement;
  caption: HTMLElement | null;
  base: HTMLElement;
  shutter: HTMLElement;
  slats: HTMLElement[];
  slatImgs: HTMLElement[];
  chars: Element[];
  lines: Element[];
  capChars: Element[];
  lineSplit: SplitText | null;
}

const LINE_SPLIT = { type: 'lines', linesClass: 'ss-line', mask: 'lines' } as const;
const CHAR_SPLIT = { type: 'words,chars', wordsClass: 'ss-word', charsClass: 'ss-char' } as const;

/** Resting pose: everything in place, base image showing, shutter parked. */
function settle(p: SlideParts) {
  gsap.set(p.chars, { rotationX: 0, opacity: 1 });
  gsap.set(p.lines, { yPercent: 0, rotation: 0 });
  gsap.set(p.capChars, { opacity: 1, yPercent: 0 });
  if (p.caption) gsap.set(p.caption, { filter: 'none' });
  gsap.set(p.base, { autoAlpha: 1, scale: 1, filter: 'none' });
  gsap.set(p.shutter, { autoAlpha: 0 });
}

/** "About to enter" pose, mirrored for `dir` (1 = next, -1 = previous). */
function prime(p: SlideParts, dir: number) {
  // Letters turn around an axis behind them, like faces on a drum.
  const depth = parseFloat(getComputedStyle(p.heading).fontSize || '16') * -0.4;
  gsap.set(p.chars, { rotationX: -95 * dir, opacity: 0, transformOrigin: `50% 50% ${depth}px` });
  gsap.set(p.lines, { yPercent: 105 * dir, rotation: 2.5 * dir, transformOrigin: '0% 100%' });
  gsap.set(p.capChars, { opacity: 0, yPercent: 40 * dir });
  if (p.caption) gsap.set(p.caption, { filter: 'blur(6px)' });
  gsap.set(p.base, { autoAlpha: 0, scale: 1, filter: 'brightness(1)' });
  gsap.set(p.shutter, { autoAlpha: 1 });
  // Alternate slats open from opposite ends — swapped when travelling back.
  gsap.set(p.slats, {
    clipPath: (i: number) =>
      (i % 2 === 0) === dir > 0 ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
  });
  gsap.set(p.slatImgs, { scale: 1.25, yPercent: (i: number) => (i % 2 ? -6 : 6) * dir });
}

function enter(p: SlideParts, dir: number) {
  const from = dir > 0 ? 'start' : 'end';
  return (
    gsap
      .timeline()
      // Slats open in a wave from the side we're travelling toward.
      .to(
        p.slats,
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.1,
          ease: 'shutter-in-out',
          stagger: { each: 0.07, from },
        },
        0
      )
      .to(
        p.slatImgs,
        {
          scale: 1,
          yPercent: 0,
          duration: 1.5,
          ease: 'shutter-out',
          stagger: { each: 0.07, from },
        },
        0
      )
      // Hand over to the single base image so no slat seams remain at rest.
      .set(p.base, { autoAlpha: 1 })
      .set(p.shutter, { autoAlpha: 0 })
      .to(
        p.chars,
        {
          rotationX: 0,
          opacity: 1,
          duration: 1,
          ease: 'shutter-out',
          stagger: { each: 0.03, from },
        },
        0.3
      )
      .to(
        p.lines,
        { yPercent: 0, rotation: 0, duration: 1, ease: 'shutter-out', stagger: 0.08 },
        0.45
      )
      // Caption pulls focus from the centre outward.
      .to(
        p.capChars,
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.8,
          ease: 'shutter-out',
          stagger: { each: 0.012, from: 'center' },
        },
        0.65
      )
      .to(p.caption, { filter: 'blur(0px)', duration: 0.9, ease: 'shutter-out' }, 0.65)
  );
}

function exit(p: SlideParts, dir: number) {
  const from = dir > 0 ? 'start' : 'end';
  return (
    gsap
      .timeline()
      .to(
        p.chars,
        {
          rotationX: 95 * dir,
          opacity: 0,
          duration: 0.55,
          ease: 'shutter-in',
          stagger: { each: 0.02, from },
        },
        0
      )
      .to(
        p.lines,
        {
          yPercent: -105 * dir,
          rotation: -1.5 * dir,
          duration: 0.5,
          ease: 'shutter-in',
          stagger: 0.05,
        },
        0
      )
      .to(
        p.capChars,
        { opacity: 0, duration: 0.3, ease: 'none', stagger: { each: 0.008, from: 'edges' } },
        0
      )
      // The old picture sinks back and dims under the incoming slats.
      .to(
        p.base,
        { scale: 1.12, filter: 'brightness(0.55)', duration: 1.3, ease: 'shutter-in-out' },
        0
      )
  );
}

function Chevron({ back }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn('size-4', back && 'rotate-180')}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m6 3.5 4.5 4.5L6 12.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ShutterSlider({
  slides = DEFAULT_SLIDES,
  autoplay = 6,
  className,
  'aria-label': ariaLabel = 'Highlights',
  ...props
}: ShutterSliderProps) {
  const rootRef = useRef<HTMLElement>(null);
  const total = slides.length;

  useGSAP(
    (_context, contextSafe) => {
      const root = rootRef.current;
      if (!root || !total) return;

      const reduced = prefersReducedMotion();
      const disposers: (() => void)[] = [];
      let cancelled = false;

      const init = contextSafe!(() => {
        if (cancelled) return;

        const q = <T extends HTMLElement>(sel: string, scope: ParentNode = root) =>
          scope.querySelector<T>(sel)!;
        const currentEl = q('[data-shutter-count="current"]');
        const nextEl = q('[data-shutter-count="next"]');
        const fill = q('[data-shutter-progress]');

        const parts: SlideParts[] = gsap.utils
          .toArray<HTMLElement>('[data-shutter-slide]', root)
          .map((slide) => {
            const heading = q('[data-shutter-heading]', slide);
            const copy = q('[data-shutter-copy]', slide);
            const caption = slide.querySelector<HTMLElement>('[data-shutter-caption]');
            // Nothing animates under reduced motion, so the text is left unsplit.
            const lineSplit = reduced ? null : SplitText.create(copy, LINE_SPLIT);
            return {
              slide,
              heading,
              copy,
              caption,
              base: q('[data-shutter-base]', slide),
              shutter: q('[data-shutter-slats]', slide),
              slats: gsap.utils.toArray<HTMLElement>('[data-shutter-slat]', slide),
              slatImgs: gsap.utils.toArray<HTMLElement>('[data-shutter-slat] > img', slide),
              chars: reduced ? [] : SplitText.create(heading, CHAR_SPLIT).chars,
              lines: lineSplit?.lines ?? [],
              capChars: caption && !reduced ? SplitText.create(caption, CHAR_SPLIT).chars : [],
              lineSplit,
            };
          });

        let index = 0;
        let busy = false;
        let revealed = false;
        let inView = typeof IntersectionObserver === 'undefined';
        let hovering = false;
        let clock: gsap.core.Tween | null = null;

        // All slides share one grid cell, so switching is only visibility —
        // the section keeps the tallest slide's height and never jumps.
        const show = (p: SlideParts, on: boolean) =>
          gsap.set(p.slide, { visibility: on ? 'visible' : 'hidden', zIndex: on ? 1 : 'auto' });
        parts.forEach((p, i) => show(p, i === 0));

        // Odometer: the old number rolls out as the new one rolls in.
        const roll = (el: HTMLElement, value: number, dir: number, instant?: boolean) => {
          const old = el.lastElementChild as HTMLElement | null;
          const next = document.createElement('span');
          next.textContent = pad(value);
          el.appendChild(next);
          if (instant || !old || reduced) return old?.remove();
          gsap.fromTo(
            next,
            { yPercent: 100 * dir },
            { yPercent: 0, duration: 0.7, ease: 'shutter-out' }
          );
          gsap.to(old, {
            yPercent: -100 * dir,
            duration: 0.7,
            ease: 'shutter-out',
            onComplete: () => old.remove(),
          });
        };
        const counters = (dir: number, instant?: boolean) => {
          roll(currentEl, index + 1, dir, instant);
          roll(nextEl, ((index + 1) % total) + 1, dir, instant);
        };
        currentEl.textContent = '';
        nextEl.textContent = '';
        counters(1, true);

        const go = (dir: number) => {
          if (busy || total < 2) return;
          busy = true;
          const out = parts[index];
          index = (index + dir + total) % total;
          const inn = parts[index];
          counters(dir);
          root.setAttribute('data-index', String(index));

          show(inn, true);
          gsap.set(out.slide, { zIndex: 0 });

          if (reduced) {
            settle(inn);
            show(out, false);
            busy = false;
            return;
          }

          prime(inn, dir);
          gsap
            .timeline({
              onComplete: () => {
                show(out, false);
                gsap.set(inn.slide, { zIndex: 1 });
                busy = false;
              },
            })
            .add(exit(out, dir), 0)
            .add(enter(inn, dir), 0.15);
        };

        // Autoplay: the progress line is the clock.
        const stop = () => {
          clock?.kill();
          clock = null;
          gsap.set(fill, { scaleX: 0 });
        };
        const start = () => {
          stop();
          if (reduced || autoplay <= 0 || total < 2 || !inView || document.hidden) return;
          clock = gsap.fromTo(
            fill,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: autoplay,
              ease: 'none',
              paused: hovering,
              onComplete: () => {
                go(1);
                start();
              },
            }
          );
        };
        const step = (dir: number) => {
          if (busy) return;
          go(dir);
          start();
        };

        const listen = <K extends keyof HTMLElementEventMap>(
          target: HTMLElement,
          type: K,
          fn: (event: HTMLElementEventMap[K]) => void
        ) => {
          const handler = contextSafe!(fn as (event: Event) => void);
          target.addEventListener(type, handler as EventListener);
          disposers.push(() => target.removeEventListener(type, handler as EventListener));
        };

        listen(q('[data-shutter-prev]'), 'click', () => step(-1));
        listen(q('[data-shutter-next]'), 'click', () => step(1));
        listen(root, 'keydown', (event) => {
          if (event.key === 'ArrowLeft') step(-1);
          if (event.key === 'ArrowRight') step(1);
        });

        // Horizontal swipe on touch and pen.
        let sx = 0;
        let sy = 0;
        listen(root, 'pointerdown', (event) => {
          sx = event.clientX;
          sy = event.clientY;
        });
        listen(root, 'pointerup', (event) => {
          if (event.pointerType === 'mouse') return;
          const dx = event.clientX - sx;
          const dy = event.clientY - sy;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
        });

        if (canHover()) {
          listen(root, 'pointerenter', () => {
            hovering = true;
            clock?.pause();
          });
          listen(root, 'pointerleave', () => {
            hovering = false;
            clock?.resume();
          });
        }

        const onVisibility = contextSafe!(() => (document.hidden ? stop() : start()));
        document.addEventListener('visibilitychange', onVisibility);
        disposers.push(() => document.removeEventListener('visibilitychange', onVisibility));

        // Copy lines depend on the width they were split at: re-split after a
        // resize so each line mask matches the real wrapping again.
        let splitWidth = root.offsetWidth;
        let resizeTimer: ReturnType<typeof setTimeout> | undefined;
        const resplit = contextSafe!(() => {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(
            contextSafe!(() => {
              if (reduced || root.offsetWidth === splitWidth) return;
              if (busy) return resplit();
              splitWidth = root.offsetWidth;
              parts.forEach((p, i) => {
                p.lineSplit?.revert();
                p.lineSplit = SplitText.create(p.copy, LINE_SPLIT);
                p.lines = p.lineSplit.lines;
                const shown = i === index && revealed;
                gsap.set(
                  p.lines,
                  shown
                    ? { yPercent: 0 }
                    : { yPercent: 105, rotation: 2.5, transformOrigin: '0% 100%' }
                );
              });
            }),
            150
          );
        });
        const resizeObserver = new ResizeObserver(resplit);
        resizeObserver.observe(root);
        disposers.push(() => {
          resizeObserver.disconnect();
          clearTimeout(resizeTimer);
        });

        // First slide plays in the first time the slider is on screen.
        const first = parts[0];
        const reveal = () => {
          if (revealed) return;
          revealed = true;
          if (reduced) settle(first);
          else enter(first, 1).delay(0.2);
        };

        if (reduced) settle(first);
        else prime(first, 1);
        parts.slice(1).forEach((p) => (reduced ? settle(p) : prime(p, 1)));
        root.setAttribute('data-ready', '');

        if (typeof IntersectionObserver === 'undefined') {
          reveal();
          start();
        } else {
          const io = new IntersectionObserver(
            contextSafe!(([entry]: IntersectionObserverEntry[]) => {
              inView = entry.isIntersecting;
              if (!inView) return stop();
              reveal();
              start();
            }),
            { threshold: 0.25 }
          );
          io.observe(root);
          disposers.push(() => io.disconnect());
        }

        disposers.push(() => clock?.kill());
      });

      // Split only once web fonts are in, so line breaks match the final text;
      // give up after a beat so a slow font can't hold the slider hidden.
      const fonts = typeof document !== 'undefined' ? document.fonts?.ready : undefined;
      if (fonts) Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(init);
      else init();

      return () => {
        cancelled = true;
        disposers.forEach((dispose) => dispose());
        root.removeAttribute('data-ready');
      };
    },
    { scope: rootRef, dependencies: [slides, autoplay] }
  );

  return (
    <section
      ref={rootRef}
      data-shutter-slider
      data-index="0"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={cn(
        'group/shutter relative overflow-hidden bg-[#eef1f4] px-6 py-20 text-[#1b2a41] md:px-10 md:py-28 dark:bg-[#15130f] dark:text-[#efe6d8]',
        className
      )}
      {...props}
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-10 gap-x-4">
        <div className="relative col-span-10 flex flex-col justify-center md:col-span-8 md:col-start-2">
          {/* Mirrors a slide's middle row so the pagination lands just under the image. */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center">
            <div className="h-16 shrink-0" />
            <div aria-hidden="true" className="aspect-[2/1] w-[min(100%,50rem)] shrink-0" />
            <div className="h-4 shrink-0" />
            <div
              className={cn(
                'pointer-events-auto flex h-12 items-center justify-center gap-8 text-xs text-[#a9532f] dark:text-[#e39468]',
                total < 2 && 'hidden'
              )}
            >
              <button
                type="button"
                data-shutter-prev
                aria-label="Previous slide"
                className="flex h-12 items-center gap-4 pl-2 transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none"
              >
                <Chevron back />
                <span
                  data-shutter-count="current"
                  aria-hidden="true"
                  className="grid h-[1em] w-6 overflow-clip text-center leading-none tabular-nums [&>span]:[grid-area:1/1]"
                >
                  {pad(1)}
                </span>
              </button>
              <div className="h-px w-40 bg-[#1b2a41]/15 dark:bg-[#efe6d8]/15">
                <div
                  data-shutter-progress
                  className="h-full w-full origin-left scale-x-0 bg-current"
                />
              </div>
              <button
                type="button"
                data-shutter-next
                aria-label="Next slide"
                className="flex h-12 items-center gap-4 pr-2 transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current motion-reduce:transition-none"
              >
                <span
                  data-shutter-count="next"
                  aria-hidden="true"
                  className="grid h-[1em] w-6 overflow-clip text-center leading-none tabular-nums [&>span]:[grid-area:1/1]"
                >
                  {pad(Math.min(2, total))}
                </span>
                <Chevron />
              </button>
            </div>
          </div>

          {/* Hidden until GSAP has posed the first slide, so nothing flashes in place. */}
          <div className="grid opacity-0 group-data-[ready]/shutter:opacity-100">
            {slides.map((slide, i) => (
              <div
                key={`${slide.heading}-${i}`}
                data-shutter-slide
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${total}`}
                className={cn(
                  'grid min-w-0 grid-rows-[1fr_auto_1fr] [grid-area:1/1]',
                  i > 0 && 'invisible'
                )}
              >
                <div className="flex flex-col justify-end pb-8">
                  <h3
                    data-shutter-heading
                    className="text-center font-serif text-[clamp(2.5rem,6.25vw,6rem)] leading-[0.9] font-normal tracking-tight uppercase [&_.ss-char]:inline-block [&_.ss-char]:will-change-transform [&_.ss-char]:backface-hidden motion-reduce:[&_.ss-char]:will-change-auto [&_.ss-word]:inline-block [&_.ss-word]:perspective-[700px]"
                  >
                    {slide.heading}
                  </h3>
                </div>

                <div className="flex flex-col items-center py-4">
                  {/* clip-path as well as overflow: WebKit can let composited
                      (scaled, will-change) children escape overflow clipping. */}
                  <div className="relative aspect-[2/1] w-[min(100%,50rem)] shrink-0 overflow-clip [clip-path:inset(0)]">
                    <img
                      data-shutter-base
                      src={slide.image}
                      alt={slide.imageAlt ?? ''}
                      className="absolute inset-0 size-full max-w-none object-cover"
                      draggable={false}
                    />
                    <div
                      data-shutter-slats
                      aria-hidden="true"
                      className="pointer-events-none invisible absolute inset-0"
                    >
                      {Array.from({ length: SLATS }, (_, s) => (
                        <div
                          key={s}
                          data-shutter-slat
                          className="absolute inset-y-0 overflow-clip"
                          style={{ left: `${(s * 100) / SLATS}%`, width: `${100 / SLATS}%` }}
                        >
                          {/* A full-frame copy shifted into place, so the slats read as one picture. */}
                          <img
                            src={slide.image}
                            alt=""
                            className="absolute top-0 h-full max-w-none object-cover will-change-transform motion-reduce:will-change-auto"
                            style={{ width: `${SLATS * 100}%`, left: `${-s * 100}%` }}
                            draggable={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* pt-16 = pagination (h-12) + the gap under it. */}
                <div className="flex flex-col pt-16">
                  <p
                    data-shutter-copy
                    className="mx-auto max-w-[36rem] text-center text-base leading-normal [&_.ss-line]:will-change-transform [&_.ss-line]:backface-hidden motion-reduce:[&_.ss-line]:will-change-auto"
                  >
                    {slide.description}
                  </p>
                  {slide.caption && (
                    <p
                      data-shutter-caption
                      className="mx-auto mt-6 max-w-[18rem] text-center text-xs leading-snug font-semibold tracking-[0.08em] uppercase [&_.ss-char]:inline-block [&_.ss-word]:inline-block"
                    >
                      {slide.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
