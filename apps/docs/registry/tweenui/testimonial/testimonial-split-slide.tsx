'use client';

import { useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import NumberFlow from '@number-flow/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TILE_COUNT = 10;
const AUTOPLAY_DELAY = 4.8;

export interface TestimonialSlide {
  /** Stable id used as the React key. */
  id: string;
  /** Photo URL for the tiled slide image. */
  image: string;
  /** Alt text for the photo. */
  imageAlt: string;
  /** Quote shown beside the photo. */
  quote: string;
}

export type TestimonialSplitFrom = 'left' | 'right';

export interface TestimonialSplitSlideProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title'
> {
  /** Quotes shown in the split slider. Defaults to a 4-slide sample. */
  testimonials?: TestimonialSlide[];
  /**
   * When true, prev wipes the photo right-to-left and next wipes left-to-right.
   * When false, every change uses the original right-to-left split.
   */
  directional?: boolean;
}

const DEFAULT_TESTIMONIALS: TestimonialSlide[] = [
  {
    id: 'handoffs',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1000&fit=crop',
    imageAlt: 'Team collaborating around a laptop',
    quote:
      'Before using this platform, our team was drowning in repetitive tasks across tools and spreadsheets. After setup, most daily updates now run automatically and our team finally has time for strategic work.',
  },
  {
    id: 'pipeline',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop',
    imageAlt: 'Operator reviewing a live workflow dashboard',
    quote:
      'Our automation turned scattered handoffs into one clear pipeline we can monitor end to end. Approvals, status updates, and owner changes now propagate automatically, so delivery stays on track.',
  },
  {
    id: 'stack',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1000&fit=crop',
    imageAlt: 'Founder speaking about connected tools',
    quote:
      'We plugged our CRM, billing, and support stack into the platform in a single afternoon. Triggers and webhooks keep customer records in sync, so ops and finance always see the same live health.',
  },
  {
    id: 'playbooks',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop',
    imageAlt: 'Product lead shipping a no-code playbook',
    quote:
      'No-code paths let success teams ship playbooks without waiting on engineering for every tweak. We still drop into advanced rules when we need them, but most lifecycle automation now ships in hours, not sprints.',
  },
];

function ArrowDotLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('fill-current', className)}
    >
      <path d="M16 5H14V7H16V5Z" />
      <path d="M13 8H11V10H13V8Z" />
      <path d="M10 11H8V13H10V11Z" />
      <path d="M13 14H11V16H13V14Z" />
      <path d="M16 17H14V19H16V17Z" />
    </svg>
  );
}

function ArrowDotRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('fill-current', className)}
    >
      <path d="M8 5H10V7H8V5Z" />
      <path d="M11 8H13V10H11V8Z" />
      <path d="M14 11H16V13H14V11Z" />
      <path d="M11 14H13V16H11V14Z" />
      <path d="M8 17H10V19H8V17Z" />
    </svg>
  );
}

function tileClipPath(index: number) {
  const overlap = 0.25;
  const left = index === 0 ? 0 : (index / TILE_COUNT) * 100 - overlap;
  const right = index === TILE_COUNT - 1 ? 0 : 100 - ((index + 1) / TILE_COUNT) * 100 - overlap;
  return `inset(0 ${right}% 0 ${left}%)`;
}

function splitFromFor(directional: boolean, direction: 'next' | 'prev'): TestimonialSplitFrom {
  return directional && direction === 'next' ? 'left' : 'right';
}

function playSlideVisual(slide: HTMLElement, instant: boolean, from: TestimonialSplitFrom) {
  const tiles = gsap.utils.toArray<HTMLElement>('[data-slide-tile]', slide);
  const content = slide.querySelector<HTMLElement>('[data-slide-content]');
  const fromX = from === 'left' ? -26 : 26;
  const contentX = from === 'left' ? -16 : 16;

  if (instant || prefersReducedMotion()) {
    gsap.set(tiles, { opacity: 1, x: 0 });
    if (content) gsap.set(content, { opacity: 1, x: 0 });
    return;
  }

  tiles.forEach((tile, i) => {
    gsap.fromTo(
      tile,
      { opacity: 0, x: fromX },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        delay: from === 'left' ? i * 0.08 : (tiles.length - 1 - i) * 0.08,
        ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    );
  });

  if (content) {
    gsap.fromTo(
      content,
      { opacity: 0, x: contentX },
      { opacity: 1, x: 0, duration: 0.55, delay: 0.15, ease: 'power2.out' }
    );
  }
}

export default function TestimonialSplitSlide({
  testimonials = DEFAULT_TESTIMONIALS,
  directional = true,
  className,
  ...props
}: TestimonialSplitSlideProps) {
  const rootRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const loopDelayRef = useRef<gsap.core.Tween | null>(null);
  const pausedRef = useRef(false);
  const restartLoopRef = useRef<() => void>(() => {});
  const isFirstSlideRef = useRef(true);
  const navDirectionRef = useRef<'next' | 'prev'>('next');

  const slideCount = testimonials.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [navDirection, setNavDirection] = useState<'next' | 'prev'>('next');
  const splitFrom = splitFromFor(directional, navDirection);
  const flowMs = prefersReducedMotion() ? 0 : 650;

  useGSAP(
    () => {
      const slide = slideRefs.current[activeIndex];
      if (!slide) return;
      playSlideVisual(
        slide,
        isFirstSlideRef.current,
        splitFromFor(directional, navDirectionRef.current)
      );
      isFirstSlideRef.current = false;
    },
    { scope: rootRef, dependencies: [activeIndex, slideCount, directional] }
  );

  useGSAP(
    (_, contextSafe) => {
      if (!contextSafe) return;

      if (prefersReducedMotion() || slideCount < 2) {
        restartLoopRef.current = () => {};
        return;
      }

      const schedule = () => {
        loopDelayRef.current?.kill();
        loopDelayRef.current = gsap.delayedCall(AUTOPLAY_DELAY, () => {
          if (!pausedRef.current) {
            navDirectionRef.current = 'next';
            setNavDirection('next');
            setActiveIndex((index) => (index + 1) % slideCount);
          }
          schedule();
        });
      };

      restartLoopRef.current = contextSafe(() => {
        if (pausedRef.current) return;
        schedule();
      });

      schedule();

      return () => {
        loopDelayRef.current?.kill();
      };
    },
    { scope: rootRef, dependencies: [slideCount] }
  );

  const goTo = (index: number, direction: 'next' | 'prev') => {
    if (slideCount < 1) return;
    navDirectionRef.current = direction;
    setNavDirection(direction);
    setActiveIndex(((index % slideCount) + slideCount) % slideCount);
    restartLoopRef.current();
  };

  const pause = () => {
    pausedRef.current = true;
    loopDelayRef.current?.pause();
  };

  const resume = () => {
    pausedRef.current = false;
    restartLoopRef.current();
  };

  const navButtonClass =
    'inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#045f64]/20 text-[#045f64] transition-colors hover:border-transparent hover:bg-[#045f64] hover:text-[#c6f56f] focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none dark:border-[#045f64]/40 dark:text-[#9fd4d6] dark:ring-offset-[#12161F]';

  const nav = (
    <div className="relative flex w-full items-center justify-center">
      <div className="flex items-center gap-x-3">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => goTo(activeIndex - 1, 'prev')}
          className={navButtonClass}
        >
          <ArrowDotLeftIcon className="block size-6" />
        </button>
        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => goTo(activeIndex + 1, 'next')}
          className={navButtonClass}
        >
          <ArrowDotRightIcon className="block size-6" />
        </button>
      </div>
      <p className="absolute right-0 text-[#045f64] dark:text-[#9fd4d6]">
        <NumberFlow
          value={activeIndex + 1}
          format={{ useGrouping: false, maximumFractionDigits: 0 }}
          transformTiming={{ duration: flowMs, easing: 'ease-out' }}
          spinTiming={{ duration: flowMs, easing: 'ease-out' }}
          opacityTiming={{ duration: prefersReducedMotion() ? 0 : 300, easing: 'ease-out' }}
        />
        <span className="text-[#045f64]/40 dark:text-[#9fd4d6]/40">/{slideCount}</span>
      </p>
    </div>
  );

  return (
    <section
      ref={rootRef}
      data-testimonial-split-slide
      data-active-slide={activeIndex}
      data-split-from={splitFrom}
      className={cn('w-full', className)}
      {...props}
    >
      <div
        className="relative mx-auto w-full max-w-[860px] px-3"
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        <div className="relative md:h-[357px]">
          {testimonials.map((item, index) => (
            <article
              key={item.id}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className={cn(
                'flex flex-col overflow-hidden rounded-[20px] border border-[#045f64]/15 bg-white p-1 md:absolute md:inset-0 md:flex-row dark:border-[#045f64]/40 dark:bg-[#12161F]',
                index === activeIndex ? 'relative z-10' : 'hidden'
              )}
              aria-hidden={index !== activeIndex}
            >
              <figure className="relative h-[280px] w-full shrink-0 overflow-hidden rounded-2xl md:h-full md:w-[42%]">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="size-full object-cover opacity-0"
                />
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {Array.from({ length: TILE_COUNT }, (_, tileIndex) => (
                    <span
                      key={tileIndex}
                      data-slide-tile
                      className="absolute inset-0 opacity-0 will-change-transform backface-hidden motion-reduce:opacity-100"
                      style={{ clipPath: tileClipPath(tileIndex) }}
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url("${item.image}")` }}
                      />
                    </span>
                  ))}
                </div>
              </figure>

              <div
                data-slide-content
                className="flex w-full flex-col justify-center p-6 opacity-0 motion-reduce:opacity-100 md:w-[58%] md:pb-16"
              >
                <p className="text-[#045f64] dark:text-[#9fd4d6]">&ldquo;{item.quote}&rdquo;</p>
              </div>
            </article>
          ))}

          <div className="mt-6 px-1 md:absolute md:right-1 md:bottom-6 md:left-[42%] md:z-20 md:mt-0 md:px-6">
            {nav}
          </div>
        </div>
      </div>
    </section>
  );
}
