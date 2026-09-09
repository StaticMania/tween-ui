'use client';

import { useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PROCESS_ANIMATION = {
  STEP_WAIT: 1.2,
  LINE_DURATION: 1,
  OPEN_DUR: 1,
  CLOSE_DUR: 0.8,
  EASE: 'cubic-bezier(0.22, 1, 0.36, 1)',
  TEXT_STAGGER: 0.3,
  BLUR_IN: 'blur(3px)',
  BLUR_OUT: 'blur(0px)',
} as const;

const PROCESS_REVEAL_DUR = Math.max(
  PROCESS_ANIMATION.CLOSE_DUR,
  PROCESS_ANIMATION.OPEN_DUR + PROCESS_ANIMATION.TEXT_STAGGER
);

const overlayFigureStyle = { boxShadow: '0 1px 0 0 rgba(255, 255, 255, 0.4) inset' };

export interface ProcessStepDetail {
  title: string;
  description: string;
}

export interface ProcessStep {
  /** Stable id used as the React key. */
  id: string;
  /** Step heading shown in the card copy. */
  title: string;
  /** Supporting line under the title. */
  description: string;
  /** Photo URL for the card. */
  image: string;
  /** Alt text for the photo. */
  imageAlt: string;
  /** Optional overlay image sitting on the photo. */
  overlay?: string;
  /** Alt text for the overlay image. */
  overlayAlt?: string;
  /** Detail rows shown beside the photo on desktop. */
  details: ProcessStepDetail[];
}

export interface ProcessCardRevealProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Process steps shown in the stacked cards. Defaults to a 4-step sample. */
  steps?: ProcessStep[];
}

const DEFAULT_STEPS: ProcessStep[] = [
  {
    id: 'connect',
    title: 'Connect apps',
    description:
      'Link your favorite tools in seconds and start building workflows without any setup complexity.',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=960&h=720&fit=crop',
    imageAlt: 'Team connecting apps on a laptop',
    details: [
      {
        title: 'One-Click Integrations',
        description: 'Connect popular apps instantly — no technical setup required.',
      },
      {
        title: 'Secure Connections',
        description: 'Your data stays protected with enterprise-grade security.',
      },
    ],
  },
  {
    id: 'build',
    title: 'Build flows',
    description:
      'Combine your connected apps into clear, repeatable automation in a few simple steps.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=960&h=720&fit=crop',
    imageAlt: 'Building an automation flow on a dashboard',
    details: [
      {
        title: 'Drag And Drop Builder',
        description: 'Arrange triggers and actions visually with zero coding effort.',
      },
      {
        title: 'Reusable Templates',
        description: 'Start from prebuilt flows and customize them in minutes.',
      },
    ],
  },
  {
    id: 'test',
    title: 'Test and optimize',
    description:
      'Validate every step, monitor results, and improve your workflow performance over time.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=960&h=720&fit=crop',
    imageAlt: 'Analytics charts used to test and optimize a flow',
    details: [
      {
        title: 'Live Status Tracking',
        description: 'See exactly how each run performs and catch issues instantly.',
      },
      {
        title: 'Smart Insights',
        description: 'Use actionable analytics to refine every stage of your flow.',
      },
    ],
  },
  {
    id: 'scale',
    title: 'Scale with confidence',
    description:
      'Launch automation across your team while keeping speed, reliability, and security under control.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=960&h=720&fit=crop',
    imageAlt: 'Team collaborating as they scale automation',
    details: [
      {
        title: 'Team Collaboration',
        description: 'Share workflows and permissions with clear ownership.',
      },
      {
        title: 'Enterprise Ready',
        description: 'Keep every process compliant and secure as you grow.',
      },
    ],
  },
];

type StepState = 'active' | 'completed' | 'inactive';

type TimelineBundle = {
  lines: HTMLElement[];
};

function isLineHorizontal(el: HTMLElement) {
  const axis = el.dataset.lineAxis;
  if (axis === 'horizontal') return true;
  if (axis === 'vertical') return false;
  return el.offsetWidth > el.offsetHeight;
}

function collect(items: Array<HTMLElement | null>) {
  return items.filter((item): item is HTMLElement => item !== null);
}

function initTimelineLines(timelines: TimelineBundle[]) {
  timelines.forEach(({ lines }) => {
    lines.forEach((line) => {
      if (isLineHorizontal(line)) gsap.set(line, { transformOrigin: 'left center', scaleX: 0 });
      else gsap.set(line, { transformOrigin: 'top center', scaleY: 0 });
    });
  });
}

function setTimelineLineProgress(timelines: TimelineBundle[], index: number) {
  timelines.forEach(({ lines }) => {
    lines.forEach((line, i) => {
      if (isLineHorizontal(line)) gsap.set(line, { scaleX: i < index ? 1 : 0 });
      else gsap.set(line, { scaleY: i < index ? 1 : 0 });
    });
  });
}

function animateTimelineLine(
  timelines: TimelineBundle[],
  lineIndex: number,
  timeline: gsap.core.Timeline
) {
  timelines.forEach(({ lines }) => {
    const line = lines[lineIndex];
    if (!line) return;

    if (isLineHorizontal(line))
      timeline.to(
        line,
        { scaleX: 1, duration: PROCESS_ANIMATION.LINE_DURATION, ease: 'sine.inOut' },
        0
      );
    else
      timeline.to(
        line,
        { scaleY: 1, duration: PROCESS_ANIMATION.LINE_DURATION, ease: 'sine.inOut' },
        0
      );
  });
}

function snapToCard({
  nextIndex,
  cards,
  images,
  contents,
}: {
  nextIndex: number;
  cards: HTMLElement[];
  images: HTMLElement[];
  contents: HTMLElement[];
}) {
  cards.forEach((card, i) => {
    gsap.set(card, {
      pointerEvents: i === nextIndex ? 'auto' : 'none',
      zIndex: i === nextIndex ? 2 : 0,
      overflow: 'hidden',
    });
  });
  images.forEach((image, i) => {
    gsap.set(image, {
      yPercent: 0,
      opacity: i === nextIndex ? 1 : 0,
      filter: PROCESS_ANIMATION.BLUR_OUT,
    });
  });
  contents.forEach((content, i) => {
    gsap.set(content, {
      yPercent: 0,
      opacity: i === nextIndex ? 1 : 0,
      filter: PROCESS_ANIMATION.BLUR_OUT,
    });
  });
}

function playCardSlide({
  current,
  next,
  currentImage,
  currentText,
  nextImage,
  nextText,
  reverse,
  onComplete,
}: {
  current: HTMLElement;
  next: HTMLElement;
  currentImage?: HTMLElement;
  currentText?: HTMLElement;
  nextImage?: HTMLElement;
  nextText?: HTMLElement;
  reverse: boolean;
  onComplete: () => void;
}) {
  const { CLOSE_DUR, OPEN_DUR, EASE, TEXT_STAGGER, BLUR_IN, BLUR_OUT } = PROCESS_ANIMATION;
  const tl = gsap.timeline({ onComplete });

  tl.set(next, { pointerEvents: 'auto', zIndex: 2, backgroundColor: 'transparent' }, 0);
  tl.set(current, { zIndex: 3, backgroundColor: 'transparent' }, 0);

  if (nextImage)
    tl.set(nextImage, { yPercent: reverse ? -100 : 100, opacity: 0, filter: BLUR_IN }, 0);
  if (nextText)
    tl.set(nextText, { yPercent: reverse ? 100 : -100, opacity: 0, filter: BLUR_IN }, 0);

  if (currentImage)
    tl.to(
      currentImage,
      {
        yPercent: reverse ? 100 : -100,
        opacity: 0,
        filter: BLUR_IN,
        duration: CLOSE_DUR,
        force3D: true,
        ease: EASE,
      },
      0
    );
  if (nextImage)
    tl.to(
      nextImage,
      { yPercent: 0, opacity: 1, filter: BLUR_OUT, duration: OPEN_DUR, force3D: true, ease: EASE },
      0
    );
  if (currentText)
    tl.to(
      currentText,
      {
        yPercent: reverse ? -100 : 100,
        opacity: 0,
        filter: BLUR_IN,
        duration: CLOSE_DUR,
        force3D: true,
        ease: EASE,
      },
      0
    );
  if (nextText)
    tl.to(
      nextText,
      { yPercent: 0, opacity: 1, filter: BLUR_OUT, duration: OPEN_DUR, force3D: true, ease: EASE },
      TEXT_STAGGER
    );

  tl.set(current, { pointerEvents: 'none', zIndex: 0, backgroundColor: '' }, PROCESS_REVEAL_DUR);
  tl.set(next, { backgroundColor: '' }, PROCESS_REVEAL_DUR);
  if (currentImage)
    tl.set(currentImage, { yPercent: 0, opacity: 0, filter: BLUR_OUT }, PROCESS_REVEAL_DUR);
  if (currentText)
    tl.set(currentText, { yPercent: 0, opacity: 0, filter: BLUR_OUT }, PROCESS_REVEAL_DUR);

  return tl;
}

export default function ProcessCardReveal({
  steps = DEFAULT_STEPS,
  className,
  ...props
}: ProcessCardRevealProps) {
  const cardCount = steps.length;
  const lineCount = Math.max(cardCount - 1, 0);

  const rootRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<Array<HTMLElement | null>>([]);
  const imagesRef = useRef<Array<HTMLElement | null>>([]);
  const contentsRef = useRef<Array<HTMLElement | null>>([]);
  const horizontalLinesRef = useRef<Array<HTMLElement | null>>([]);
  const verticalLinesRef = useRef<Array<HTMLElement | null>>([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const busyRef = useRef(false);
  const pausedRef = useRef(false);
  const lineTlRef = useRef<gsap.core.Timeline | undefined>(undefined);
  const slideTlRef = useRef<gsap.core.Timeline | undefined>(undefined);
  const loopDelayRef = useRef<gsap.core.Tween | undefined>(undefined);

  const goToStepRef = useRef<(index: number) => void>(() => {});
  const pauseRef = useRef<() => void>(() => {});
  const resumeRef = useRef<() => void>(() => {});

  const getStepState = (index: number): StepState => {
    if (index === activeIndex) return 'active';
    if (index < activeIndex) return 'completed';
    return 'inactive';
  };

  useGSAP(
    (_context, contextSafe) => {
      if (!contextSafe) return;

      const cards = collect(cardsRef.current);
      const images = collect(imagesRef.current);
      const contents = collect(contentsRef.current);
      const timelines: TimelineBundle[] = [
        { lines: collect(horizontalLinesRef.current) },
        { lines: collect(verticalLinesRef.current) },
      ];

      if (
        cards.length !== cardCount ||
        images.length !== cardCount ||
        contents.length !== cardCount
      )
        return;

      const reduced = prefersReducedMotion();

      cards.forEach((card, index) => {
        gsap.set(card, {
          pointerEvents: index === 0 ? 'auto' : 'none',
          zIndex: index === 0 ? 2 : 0,
          overflow: 'hidden',
        });
      });
      images.forEach((image, index) => {
        gsap.set(image, {
          yPercent: 0,
          opacity: index === 0 ? 1 : 0,
          filter: PROCESS_ANIMATION.BLUR_OUT,
          willChange: 'transform, opacity, filter',
        });
      });
      contents.forEach((content, index) => {
        gsap.set(content, {
          yPercent: 0,
          opacity: index === 0 ? 1 : 0,
          filter: PROCESS_ANIMATION.BLUR_OUT,
          willChange: 'transform, opacity, filter',
        });
      });
      initTimelineLines(timelines);
      setTimelineLineProgress(timelines, 0);
      activeIndexRef.current = 0;
      setActiveIndex(0);
      busyRef.current = false;
      pausedRef.current = false;

      const slideTo = contextSafe((nextIndex: number, reverse = false) => {
        if (busyRef.current || nextIndex === activeIndexRef.current) return;

        const current = cards[activeIndexRef.current];
        const next = cards[nextIndex];
        if (!current || !next) return;

        const currentImage = images[activeIndexRef.current];
        const currentText = contents[activeIndexRef.current];
        const nextImage = images[nextIndex];
        const nextText = contents[nextIndex];

        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
        setTimelineLineProgress(timelines, nextIndex);

        if (reduced) {
          snapToCard({ nextIndex, cards, images, contents });
          return;
        }

        busyRef.current = true;
        slideTlRef.current?.kill();
        slideTlRef.current = playCardSlide({
          current,
          next,
          currentImage,
          currentText,
          nextImage,
          nextText,
          reverse,
          onComplete: () => {
            busyRef.current = false;
          },
        });
      });

      const scheduleLoop = contextSafe(() => {
        if (reduced || pausedRef.current || cardCount < 2) return;
        loopDelayRef.current?.kill();
        loopDelayRef.current = gsap.delayedCall(PROCESS_ANIMATION.STEP_WAIT, () =>
          runLoopRef.current()
        );
      });

      const runLoop = contextSafe(() => {
        if (reduced || pausedRef.current || cardCount < 2) return;
        if (busyRef.current) {
          scheduleLoop();
          return;
        }

        const currentIndex = activeIndexRef.current;
        const nextIndex = (currentIndex + 1) % cardCount;
        const lineIndex = currentIndex % Math.max(cardCount - 1, 1);

        lineTlRef.current?.kill();
        lineTlRef.current = gsap.timeline({
          onComplete: () => {
            slideTo(nextIndex);
            scheduleLoop();
          },
        });
        animateTimelineLine(timelines, lineIndex, lineTlRef.current);
      });

      const runLoopRef = { current: runLoop };

      goToStepRef.current = contextSafe((index: number) => {
        if (index === activeIndexRef.current || busyRef.current) return;
        lineTlRef.current?.kill();
        loopDelayRef.current?.kill();
        slideTo(index, index < activeIndexRef.current);
        scheduleLoop();
      });

      pauseRef.current = contextSafe(() => {
        pausedRef.current = true;
        lineTlRef.current?.pause();
        loopDelayRef.current?.pause();
      });

      resumeRef.current = contextSafe(() => {
        pausedRef.current = false;
        loopDelayRef.current?.kill();
        if (lineTlRef.current?.paused()) {
          lineTlRef.current.resume();
          return;
        }
        if (!busyRef.current) runLoop();
        else scheduleLoop();
      });

      if (!reduced && cardCount > 1) scheduleLoop();

      return () => {
        loopDelayRef.current?.kill();
        lineTlRef.current?.kill();
        slideTlRef.current?.kill();
      };
    },
    { scope: rootRef, dependencies: [cardCount], revertOnUpdate: true }
  );

  const renderTimeline = (axis: 'horizontal' | 'vertical') => {
    const isHorizontal = axis === 'horizontal';
    const linesRef = isHorizontal ? horizontalLinesRef : verticalLinesRef;

    return (
      <div
        data-process-timeline={axis}
        className={cn(
          'flex items-center justify-center',
          isHorizontal
            ? 'w-full flex-row md:hidden'
            : 'hidden shrink-0 flex-col self-stretch md:flex'
        )}
      >
        {steps.map((step, index) => (
          <div
            key={`${axis}-${step.id}`}
            className={cn(
              'flex items-center',
              isHorizontal ? 'flex-row' : 'flex-col',
              index < lineCount && 'flex-1'
            )}
          >
            <button
              type="button"
              data-item={getStepState(index)}
              aria-label={`Go to step ${index + 1}: ${step.title}`}
              aria-current={getStepState(index) === 'active' ? 'step' : undefined}
              onClick={() => goToStepRef.current(index)}
              className={cn(
                'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border text-xs font-medium transition-all duration-400 ease-in-out motion-reduce:transition-none',
                'border-[#045f64]/20 text-[#045f64]/50 dark:border-[#045f64]/40 dark:text-[#9fd4d6]/80',
                'data-[item=active]:border-transparent data-[item=active]:bg-[#045f64] data-[item=active]:text-white',
                'data-[item=completed]:border-transparent data-[item=completed]:bg-[#045f64] data-[item=completed]:text-white',
                'focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 focus-visible:outline-none dark:ring-offset-[#12161F]'
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </button>
            {index < lineCount && (
              <div
                className={cn(
                  'relative bg-[#045f64]/15 dark:bg-[#045f64]/30',
                  isHorizontal ? 'mx-1 h-px min-w-8 flex-1' : 'mx-auto min-h-8 w-px flex-1'
                )}
              >
                <div
                  ref={(el) => {
                    linesRef.current[index] = el;
                  }}
                  data-line-axis={axis}
                  className={cn(
                    'absolute inset-0',
                    isHorizontal
                      ? 'rounded-r-full bg-linear-to-r from-transparent to-[#c6f56f]'
                      : 'rounded-b-full bg-linear-to-b from-transparent to-[#c6f56f]'
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <section
      ref={rootRef}
      data-process-card-reveal
      data-active-step={activeIndex}
      className={cn('w-full', className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-[720px] px-3">
        <div
          className="relative flex flex-col items-stretch justify-center gap-y-4 md:flex-row md:items-stretch md:gap-x-5"
          onMouseEnter={() => pauseRef.current()}
          onMouseLeave={() => resumeRef.current()}
        >
          {renderTimeline('horizontal')}

          <div className="relative min-h-[340px] w-full overflow-hidden md:h-[280px] md:min-h-0 md:flex-1">
            {steps.map((step, index) => (
              <div
                key={step.id}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                data-process-card
                data-step-id={step.id}
                className="absolute inset-0 rounded-2xl bg-white p-1 dark:bg-[#12161F]"
              >
                <div className="flex h-full w-full flex-col items-stretch gap-y-3 md:flex-row md:gap-x-5">
                  <div className="w-full shrink-0 overflow-hidden rounded-xl md:w-[46%]">
                    <figure
                      ref={(el) => {
                        imagesRef.current[index] = el;
                      }}
                      className="relative h-48 w-full overflow-hidden rounded-xl md:h-full"
                    >
                      <img
                        src={step.image}
                        alt={step.imageAlt}
                        className="size-full rounded-xl object-cover"
                      />
                      <figure
                        className="absolute bottom-3 left-1/2 z-20 w-[calc(100%-24px)] -translate-x-1/2 overflow-hidden rounded-xl bg-white/15 backdrop-blur-[20px]"
                        style={overlayFigureStyle}
                      >
                        {step.overlay ? (
                          <img src={step.overlay} alt={step.overlayAlt ?? ''} />
                        ) : (
                          <div className="px-3 py-2">
                            <p className="text-xs font-medium text-white drop-shadow">
                              {step.title}
                            </p>
                          </div>
                        )}
                      </figure>
                    </figure>
                  </div>

                  <div className="relative min-w-0 flex-1 overflow-hidden py-2 md:py-3">
                    <div
                      ref={(el) => {
                        contentsRef.current[index] = el;
                      }}
                      className="h-fit w-full space-y-4 max-md:px-3 md:h-full md:justify-center"
                    >
                      <div className="space-y-1">
                        <h3 className="text-base font-medium text-[#12161F] md:text-lg dark:text-white">
                          {step.title}
                        </h3>
                        <p className="text-left text-sm text-[#045f64]/70 dark:text-[#9fd4d6]/80">
                          {step.description}
                        </p>
                      </div>
                      <div className="hidden space-y-3 md:block">
                        {step.details.map((detail) => (
                          <div key={detail.title} className="space-y-0.5">
                            <h4 className="text-sm font-medium text-[#12161F] dark:text-white">
                              {detail.title}
                            </h4>
                            <p className="text-left text-sm text-[#045f64]/70 dark:text-[#9fd4d6]/80">
                              {detail.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {renderTimeline('vertical')}
        </div>
      </div>
    </section>
  );
}
