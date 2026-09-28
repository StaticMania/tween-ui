'use client';

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Pulling focus is a pointer affordance — skip it on touch. */
const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !prefersReducedMotion();

/**
 * The element `position: sticky` will actually stick to — the nearest scrollable
 * ancestor, or the window. ScrollTrigger has to watch the same one, or a reel dropped
 * into a scrolling panel (a docs preview, a drawer, a modal) would pin against a
 * scrollbar nobody is moving. `hidden` is left out on purpose: it captures sticky but
 * can never scroll, so a reel under one is better off on the window.
 */
const scrollportOf = (node: HTMLElement) => {
  let el = node.parentElement;
  while (el && el !== document.body && el !== document.documentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === 'auto' || overflowY === 'scroll') return el;
    el = el.parentElement;
  }
  return undefined;
};

/** Scrubber bars: 2px wide on a 3px gap, lifting from 8px at rest to 18px under the head. */
const TICK_WIDTH = 2;
const TICK_GAP = 3;
const TICK_MIN_HEIGHT = 8;
const TICK_MAX_HEIGHT = 18;
const TICK_MIN_ALPHA = 0.18;
/** Bars lit either side of the head. */
const TICK_RADIUS = 3;

/** How far below its resting line a card waits while it is still off to the right. */
const WAVE_RISE = 56;
/** Share of a card's width it spends rising, once its leading edge has crossed in. */
const WAVE_SPAN = 0.9;
/** How faint a card is before it has entered. */
const WAVE_MIN_ALPHA = 0.2;

/** Scroller speed, in px per second, turned into tilt per card away from centre. */
const TILT_PER_VELOCITY = 0.012;
/** Cap, so a flung scroll bows the row rather than folding it. */
const TILT_MAX = 26;
/** Milliseconds of stillness before the row falls flat again. */
const TILT_SETTLE = 140;

const DIM_OPACITY = 0.38;
const DIM_BLUR = 6;
const DIM_SCALE = 0.985;

const clamp = (n: number, min: number, max: number) => (n < min ? min : n > max ? max : n);

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Smoothstep, so a card eases out of the wave instead of arriving on a straight line. */
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Bars that fit a strip `width` wide. The last one needs no gap after it. */
const fitTicks = (width: number) =>
  width > 0 ? Math.max(0, Math.floor((width + TICK_GAP) / (TICK_WIDTH + TICK_GAP))) : 0;

/**
 * The index both the counter and the tick cursor sit on. Anchored at the ends rather
 * than tracking whatever is under a focus line, so the run starts on the first card and
 * finishes on the last — and the number can never disagree with the lit bar.
 */
const nearestIndex = (progress: number, count: number) =>
  count > 0 ? clamp(Math.round(clamp(progress, 0, 1) * (count - 1)), 0, count - 1) : 0;

/** Initials for the monogram when a voice brings no `initials` of its own. */
const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('') || '·';

/** Hues held in a teal-to-indigo band, so eight avatars read as a set and not a rainbow. */
const hueOf = (index: number) => 168 + ((index * 29) % 78);

/** Film grain over the monogram gradient, so the chip reads as printed. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)'/%3E%3C/svg%3E\")";

export interface TestimonialReelItem {
  /** Who is speaking. */
  name: string;
  /** Their role, shown under the name. */
  role: string;
  /** Monogram for the avatar. Derived from `name` when omitted. */
  initials?: string;
  /** Degree on the colour wheel the monogram gradient is built from. */
  hue?: number;
  /** The quote itself, plain text — the curly quotes are added for you. */
  quote: string;
  /** Pill on the card's footer, e.g. the kind of work. */
  tag: string;
  /** Outcome beside the pill, marked with an accent dot. */
  metric: string;
}

export interface TestimonialReelFocusProps extends ComponentPropsWithoutRef<'section'> {
  /** The voices, in the order they ride the reel. */
  items?: TestimonialReelItem[];
  /** Note at the end of the scrubber row. */
  hint?: string;
}

const DEFAULT_HINT = 'Hover to focus';

const DEFAULT_ITEMS: TestimonialReelItem[] = [
  {
    name: 'Maya Rahman',
    role: 'CEO, Northwind',
    quote:
      'They did not just redesign our brand — they gave the whole company a spine. Our sales calls got shorter.',
    tag: 'Brand identity',
    metric: 'Sales cycle −30%',
  },
  {
    name: 'Daniel Osei',
    role: 'VP Engineering, Halo Labs',
    quote:
      'The design system paid for itself in a quarter. Engineers stopped asking what things should look like and started shipping.',
    tag: 'Design system',
    metric: 'Ships 2× faster',
  },
  {
    name: 'Priya Venkataraman',
    role: 'CMO, Kindred',
    quote:
      'Three directions, all of them right. I have never had a harder time choosing, or an easier time defending it to the board.',
    tag: 'Campaign',
    metric: '+41% sign-ups',
  },
  {
    name: 'Tomás Reyes',
    role: 'Founder, Lumen Health',
    quote:
      'They made a 2am telehealth flow feel like a conversation, not a form. Completion has not stopped climbing since launch.',
    tag: 'Product · App',
    metric: '+27% completion',
  },
  {
    name: 'Hana Kobayashi',
    role: 'Head of Brand, Atlas & Co.',
    quote:
      'A small senior team that actually listens. Every review ended with fewer open questions than it started with.',
    tag: 'Brand identity',
    metric: 'One round of edits',
  },
  {
    name: 'Marcus Hale',
    role: 'COO, Verge',
    quote:
      'The strategy work changed how our leadership talks about the company. The identity simply made it visible.',
    tag: 'Strategy',
    metric: 'Repositioned in 8 weeks',
  },
  {
    name: 'Elena Petrova',
    role: 'Design Director, Monolith',
    quote:
      'Rare to find a studio that cares about the system as much as the hero shot. We still build on their foundations.',
    tag: 'Design system',
    metric: '3 years on one base',
  },
  {
    name: 'Kenji Watanabe',
    role: 'CTO, Parallel',
    quote:
      'Clear process, honest timelines, and work we were proud to put in front of investors. We would hire them again tomorrow.',
    tag: 'Web · Motion',
    metric: 'Raised on the first deck',
  },
];

export default function TestimonialReelFocus({
  items = DEFAULT_ITEMS,
  hint = DEFAULT_HINT,
  className,
  // The reel is all there is, so the section carries its own name rather than
  // borrowing one from a heading. Pass your own to say what these voices are about.
  'aria-label': ariaLabel = 'Testimonials',
  ...props
}: TestimonialReelFocusProps) {
  const rootRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  /** The <li>: carries the wave, and the geometry the wave is measured from. */
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  /** The face inside it: carries hover focus, so the two never write the same property. */
  const shellRefs = useRef<(HTMLDivElement | null)[]>([]);

  /** Bars are rendered by React but painted by hand — 60 state updates a second is not a plan. */
  const [tickCount, setTickCount] = useState(0);
  /** The reel only earns a pinned runway when the row is wider than the stage. */
  const [pinned, setPinned] = useState(false);
  const headRef = useRef(-1);
  const drawRef = useRef<() => void>(() => {});

  const total = items.length;

  useGSAP(
    () => {
      const pin = pinRef.current;
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const strip = stripRef.current;
      if (!pin || !viewport || !track || total === 0) return;

      const reduce = prefersReducedMotion();
      const scrollport = scrollportOf(pin);
      const cards = cardRefs.current.filter(Boolean) as HTMLLIElement[];
      const setX = gsap.quickSetter(track, 'x', 'px');
      const setY = cards.map((card) => gsap.quickSetter(card, 'y', 'px'));
      const setAlpha = cards.map((card) => gsap.quickSetter(card, 'opacity'));

      let rail: ScrollTrigger | null = null;
      let run = 0;
      let shown = -1;
      /** Each card's resting left edge in the stage, before the row is moved. */
      let offsets: number[] = [];
      let cardWidth = 0;
      /** How far the row has been carried left, and how hard it is leaning on it. */
      let shift = 0;
      const flex = { tilt: 0 };
      const middle = (cards.length - 1) / 2;
      let settle: ReturnType<typeof setTimeout> | null = null;

      // How far the row has to travel: its full width less the window it shows through.
      // The runway height is built from this, so it is the one number worth getting right.
      const measure = () => {
        run = Math.max(0, track.scrollWidth - viewport.clientWidth);
        offsets = cards.map((card) => card.offsetLeft - viewport.offsetLeft);
        cardWidth = cards[0]?.offsetWidth ?? 0;
        pin.style.setProperty('--reel-run', `${run}px`);
        // The stage fills its scrollport, whatever that turns out to be — one viewport
        // on a page, the panel's own height when the reel is embedded in one.
        pin.style.setProperty(
          '--reel-view',
          `${scrollport ? scrollport.clientHeight : window.innerHeight}px`
        );
        setPinned(!reduce && run > 0);
      };

      /**
       * The wave, which is two things at once.
       *
       * A card waits a little below its line while it is still off to the right and
       * rises as its leading edge crosses in, so every card arrives rather than only
       * the two that happened to be on stage when the section came into view.
       *
       * On top of that the row *flexes while it travels*: cards ahead of centre swing
       * low and the ones behind ride high, by an amount set by how fast the reel is
       * moving. That is what makes eight cards read as one strip of film being drawn
       * past, and it is why the row is flat again the moment you stop scrolling.
       */
      const paintCards = () => {
        if (reduce || cardWidth === 0) return;
        const edge = viewport.clientWidth;
        const span = cardWidth * WAVE_SPAN;
        for (let i = 0; i < cards.length; i++) {
          const entered = smooth(clamp((edge - (offsets[i] + shift)) / span, 0, 1));
          setY[i]((1 - entered) * WAVE_RISE + (i - middle) * flex.tilt);
          setAlpha[i](WAVE_MIN_ALPHA + (1 - WAVE_MIN_ALPHA) * entered);
        }
      };

      /**
       * Lean the row by however fast the scroller is going, then let it fall flat a
       * beat after the scrolling stops. The lean tracks the scroll directly — smoothing
       * it would put the row behind the cards it belongs to — so only the release is a
       * tween, and it is the same tween whichever direction you came to rest from.
       */
      const lean = (velocity: number) => {
        gsap.killTweensOf(flex);
        flex.tilt = clamp(velocity * TILT_PER_VELOCITY, -TILT_MAX, TILT_MAX);
        paintCards();
        if (settle) clearTimeout(settle);
        settle = setTimeout(() => {
          gsap.to(flex, {
            tilt: 0,
            duration: 0.55,
            ease: 'power2.out',
            onUpdate: paintCards,
          });
        }, TILT_SETTLE);
      };

      const paintMeter = (progress: number) => {
        const index = nearestIndex(progress, total);
        if (index !== shown) {
          shown = index;
          if (counterRef.current) counterRef.current.textContent = pad2(index + 1);
        }
        if (!strip) return;

        strip.setAttribute('aria-valuenow', String(Math.round(clamp(progress, 0, 1) * 100)));
        strip.setAttribute('aria-valuetext', `${index + 1} of ${total}`);

        const bars = Array.from(strip.children) as HTMLElement[];
        const head = nearestIndex(progress, bars.length);
        if (head === headRef.current) return;
        headRef.current = head;

        // A triangular falloff that peaks on the head and tapers to the resting bar.
        bars.forEach((bar, i) => {
          const distance = Math.abs(i - head);
          if (distance > TICK_RADIUS) {
            delete bar.dataset.on;
            bar.style.height = '';
            bar.style.opacity = '';
            return;
          }
          const falloff = 1 - distance / TICK_RADIUS;
          bar.dataset.on = '';
          bar.style.height = `${TICK_MIN_HEIGHT + (TICK_MAX_HEIGHT - TICK_MIN_HEIGHT) * falloff}px`;
          bar.style.opacity = String(TICK_MIN_ALPHA + (1 - TICK_MIN_ALPHA) * falloff);
        });
      };

      // One place that decides where everything sits, so load, resize and refresh agree.
      // A refresh only fires onUpdate when progress has moved, and React rebuilds the bars
      // on resize — either way the reel has to be told to paint itself again.
      const draw = () => {
        const progress = run > 0 && rail ? rail.progress : 0;
        shift = run > 0 ? -run * progress : 0;
        setX(shift);
        paintCards();
        paintMeter(progress);
      };
      drawRef.current = draw;

      const nativeProgress = () => {
        const max = viewport.scrollWidth - viewport.clientWidth;
        return max > 0 ? clamp(viewport.scrollLeft / max, 0, 1) : 0;
      };

      const fit = () => setTickCount(fitTicks(strip?.clientWidth ?? 0));

      measure();
      fit();

      if (reduce) {
        // Motion turned down: the row stays a native horizontal scroller and the meter
        // reads that scroller. Nothing is pinned, nothing waves and nothing is tweened,
        // but the section still counts itself off properly.
        paintMeter(nativeProgress());
        viewport.addEventListener('scroll', () => paintMeter(nativeProgress()), { passive: true });
      } else {
        rail = ScrollTrigger.create({
          trigger: pin,
          scroller: scrollport,
          start: 'top top',
          // Re-read on every refresh: a resize changes how far the row must travel.
          end: () => `+=${run}`,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          onUpdate: (self) => {
            if (run <= 0) return;
            shift = -run * self.progress;
            setX(shift);
            paintMeter(self.progress);
            lean(self.getVelocity());
          },
        });
        draw();
      }

      // Width is the only thing that changes the reel's maths — the runway growing as
      // --reel-run is set must not send us round again.
      let seenStage = viewport.clientWidth;
      let seenStrip = strip?.clientWidth ?? 0;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const observer = new ResizeObserver(() => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          const stripWidth = strip?.clientWidth ?? 0;
          if (viewport.clientWidth === seenStage && stripWidth === seenStrip) return;
          seenStage = viewport.clientWidth;
          seenStrip = stripWidth;
          measure();
          fit();
          if (reduce) return paintMeter(nativeProgress());
          ScrollTrigger.refresh();
          draw();
        }, 150);
      });
      observer.observe(stageRef.current ?? pin);

      return () => {
        if (timer) clearTimeout(timer);
        if (settle) clearTimeout(settle);
        gsap.killTweensOf(flex);
        observer.disconnect();
      };
    },
    { scope: rootRef, dependencies: [items] }
  );

  // React owns how many bars exist, so repaint whenever it has rebuilt them.
  useEffect(() => {
    headRef.current = -1;
    drawRef.current();
  }, [tickCount]);

  /** Pull one card forward by pushing the rest back. */
  const focus = (index: number | null) => {
    if (!canHover()) return;
    shellRefs.current.forEach((shell, i) => {
      if (!shell) return;
      const dim = index !== null && i !== index;
      gsap.to(shell, {
        opacity: dim ? DIM_OPACITY : 1,
        filter: dim ? `blur(${DIM_BLUR}px)` : 'blur(0px)',
        scale: dim ? DIM_SCALE : 1,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };

  return (
    <section
      ref={rootRef}
      data-testimonial-reel-focus
      aria-label={ariaLabel}
      className={cn(
        // clip, not hidden: `hidden` would make this a scroll container and the stage
        // inside would stick to it, which is to say never stick at all.
        'relative w-full overflow-clip bg-white text-[#12161F]',
        'dark:bg-[#0d1117] dark:text-white',
        '[--reel-accent:#045f64] dark:[--reel-accent:#c6f56f]',
        className
      )}
      {...props}
    >
      {/* The runway: one scrollport of stage plus however far the row has to travel. */}
      <div
        ref={pinRef}
        data-reel-pin
        className={cn(
          '[--reel-card-h:400px] [--reel-card-w:min(78vw,420px)] [--reel-gap:12px]',
          'md:[--reel-card-h:min(460px,66svh)] md:[--reel-card-w:420px] md:[--reel-gap:24px]',
          '[--reel-view:100svh]',
          pinned && 'h-[calc(var(--reel-view)+var(--reel-run,0px))]'
        )}
      >
        <div
          ref={stageRef}
          className={cn(
            // cqw in here is the stage's own width, which is what --reel-edge measures
            // against — vw would be off by the scrollbar.
            '@container flex flex-col justify-center gap-8',
            '[--reel-edge:max(1.25rem,calc((100cqw-1290px)/2))]',
            pinned && 'sticky top-0 h-(--reel-view)'
          )}
        >
          <div
            ref={viewportRef}
            data-reel-viewport
            className={cn(
              // Before the reel is measured — and whenever motion is turned down — the
              // same row is a plain horizontal scroller, so every card stays reachable.
              '[scrollbar-width:none] overscroll-x-contain [&::-webkit-scrollbar]:hidden',
              pinned
                ? // Clip sideways but leave the vertical alone, so a card riding the
                  // wave is not sheared off at the stage edge.
                  'overflow-x-clip overflow-y-visible'
                : 'snap-x snap-proximity overflow-x-auto'
            )}
          >
            <ul
              ref={trackRef}
              data-reel-track
              className="flex w-max items-start gap-(--reel-gap) px-(--reel-edge) py-5 will-change-transform motion-reduce:transform-none motion-reduce:will-change-auto"
            >
              {items.map((item, index) => {
                const hue = item.hue ?? hueOf(index);
                return (
                  <li
                    key={`${item.name}-${index}`}
                    ref={(node) => {
                      cardRefs.current[index] = node;
                    }}
                    data-reel-card
                    className="w-(--reel-card-w) flex-none snap-center will-change-transform motion-reduce:transform-none motion-reduce:opacity-100"
                    onPointerEnter={() => focus(index)}
                    onPointerLeave={() => focus(null)}
                  >
                    {/* A plain hairline that warms to the accent under the pointer.
                        Deliberately not a masked gradient ring: the `mask` shorthand
                        resets `mask-composite`, whichever order the two are authored
                        in, so the ring un-punches and floods the card with accent. */}
                    <div
                      ref={(node) => {
                        shellRefs.current[index] = node;
                      }}
                      data-reel-shell
                      className={cn(
                        'relative h-(--reel-card-h) w-full overflow-hidden rounded-xl border will-change-transform',
                        'border-[#12161F]/10 bg-white shadow-[0_1px_2px_rgba(18,22,31,0.05),0_18px_40px_-28px_rgba(18,22,31,0.35)]',
                        'dark:border-white/10 dark:bg-[#161b22] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]',
                        'transition-colors duration-500 ease-out hover:border-[#045f64]/45 dark:hover:border-[#c6f56f]/40',
                        'motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:blur-none motion-reduce:transition-none'
                      )}
                    >
                      <article className="relative flex h-full flex-col p-6 md:p-8">
                        <div className="flex items-center gap-4">
                          <span
                            aria-hidden="true"
                            style={{ '--reel-hue': hue } as CSSProperties}
                            className={cn(
                              'relative grid size-10 flex-none place-items-center overflow-hidden rounded-full md:size-12',
                              'text-xs font-semibold tracking-[0.06em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.25)] md:text-[13px]',
                              'shadow-[0_0_0_1px_rgba(18,22,31,0.12)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.14)]',
                              'bg-[linear-gradient(150deg,oklch(0.6_0.09_var(--reel-hue))_0%,oklch(0.36_0.07_calc(var(--reel-hue)+40))_100%)]'
                            )}
                          >
                            {item.initials ?? initialsOf(item.name)}
                            <span
                              className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
                              style={{ backgroundImage: GRAIN, backgroundSize: '50px 50px' }}
                            />
                          </span>
                          <span className="grid min-w-0 flex-1 gap-0.5">
                            <span className="text-[15px] leading-tight font-medium tracking-tight">
                              {item.name}
                            </span>
                            <span className="text-[13px] leading-tight text-[#18181b]/50 dark:text-white/50">
                              {item.role}
                            </span>
                          </span>
                          <span className="flex-none text-xs whitespace-nowrap text-(--reel-accent) tabular-nums">
                            {pad2(index + 1)}/{pad2(total)}
                          </span>
                        </div>

                        {/* The quote sits on the floor of every card, so the reel reads
                            as one baseline rather than eight ragged ones. */}
                        <div className="mt-auto grid gap-4 md:gap-5">
                          <svg
                            viewBox="0 0 24 19"
                            fill="none"
                            aria-hidden="true"
                            className="h-auto w-6 text-(--reel-accent)"
                          >
                            <path
                              d="M3 0h5a3 3 0 0 1 3 3v4c0 6.2-3.1 10.4-8.4 12l-.7-2.4c3.1-1.2 4.9-2.9 5.5-5.6H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3z"
                              fill="currentColor"
                            />
                            <path
                              d="M16 0h5a3 3 0 0 1 3 3v4c0 6.2-3.1 10.4-8.4 12l-.7-2.4c3.1-1.2 4.9-2.9 5.5-5.6h-4.4a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3z"
                              fill="currentColor"
                            />
                          </svg>
                          <blockquote className="text-[17px] leading-relaxed tracking-tight text-pretty">
                            {`“${item.quote}”`}
                          </blockquote>
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#12161F]/10 pt-4 dark:border-white/10">
                          <span className="inline-flex items-center rounded-full border border-[#12161F]/12 px-3 py-1.5 text-xs tracking-[0.04em] whitespace-nowrap text-[#18181b]/55 uppercase dark:border-white/15 dark:text-white/55">
                            {item.tag}
                          </span>
                          <span className="inline-flex items-center gap-2 text-xs tracking-[0.04em] whitespace-nowrap uppercase">
                            <span
                              aria-hidden="true"
                              className="size-1.5 flex-none rounded-full bg-(--reel-accent)"
                            />
                            {item.metric}
                          </span>
                        </div>
                      </article>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center gap-4 px-(--reel-edge) md:gap-6">
            <p className="text-xs whitespace-nowrap tabular-nums">
              <span ref={counterRef}>{pad2(1)}</span>
              <span className="text-[#18181b]/45 dark:text-white/45"> / {pad2(total)}</span>
            </p>
            <div
              ref={stripRef}
              role="progressbar"
              aria-label="Testimonials progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              className="flex h-[18px] min-w-0 flex-1 items-end gap-[3px] overflow-hidden"
            >
              {/* Bars are painted by hand from the scroll position; React only sizes the strip. */}
              {Array.from({ length: tickCount }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className={cn(
                    'h-2 w-0.5 flex-none bg-[#12161F]/10 transition-[height,opacity] duration-300 ease-out dark:bg-white/12',
                    'data-[on]:bg-[linear-gradient(180deg,#12161F_0%,var(--reel-accent)_100%)]',
                    'dark:data-[on]:bg-[linear-gradient(180deg,#ffffff_0%,var(--reel-accent)_100%)]',
                    'motion-reduce:transition-none'
                  )}
                />
              ))}
            </div>
            <p className="text-xs tracking-[0.04em] whitespace-nowrap text-[#18181b]/45 uppercase dark:text-white/45">
              Scroll<span className="hidden sm:inline"> · {hint}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
