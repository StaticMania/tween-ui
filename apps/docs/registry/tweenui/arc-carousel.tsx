'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, CustomEase, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface ArcCarouselItem {
  title: string;
  image: string;
  /** Chip on the top left of the card. */
  tag?: string;
  /** Line under the title, e.g. a client and year or a price. */
  meta?: string;
  href?: string;
}

export interface ArcCarouselProps extends ComponentPropsWithoutRef<'section'> {
  /** Eight or more keep the wrap seamless. */
  items?: ArcCarouselItem[];
  badge?: string;
  title?: string;
  description?: string;
  cta?: { label: string; href: string } | null;
  /** Step on its own; holds on hover, keyboard focus and while off-screen. */
  autoplay?: boolean;
  /** Time each card holds the centre while autoplaying, in ms. */
  interval?: number;
}

// Card position by distance from the centre: px across, px down, degrees of turn
const SLOTS = [
  { x: 0, y: 0, r: 0 },
  { x: 359, y: 26, r: 8.77 },
  { x: 711, y: 113, r: 18.83 },
  { x: 1033, y: 243, r: 25.05 },
];
const ACTIVE_SCALE = 1.05;
const MOVE_DURATION = 0.8;
const MOVE_EASE = CustomEase.create('arc-move', 'M0,0 C0.98,0.3 0.3,1 1,1');
const SWIPE = 50;

/** Where a card sits at a (fractional) distance from the centre. Past the last slot it fades out. */
const slot = (offset: number) => {
  const t = Math.abs(offset);
  const sign = Math.sign(offset);
  const i = Math.min(Math.floor(t), SLOTS.length - 2);
  const a = SLOTS[i];
  const b = SLOTS[i + 1];
  const f = t - i;
  return {
    x: (a.x + (b.x - a.x) * f) * sign,
    y: a.y + (b.y - a.y) * f,
    rotation: (a.r + (b.r - a.r) * f) * sign,
    scale: 1 + (ACTIVE_SCALE - 1) * gsap.utils.clamp(0, 1, 1 - t),
    opacity: gsap.utils.clamp(0, 1, SLOTS.length - t),
    zIndex: 100 - Math.round(t * 10),
  };
};

const pad2 = (n: number) => String(n).padStart(2, '0');

const photo = (id: string, width = 640) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&h=${Math.round(width * (430 / 312))}&fit=crop&q=80&auto=format`;
const srcSetOf = (src: string) =>
  src.includes('images.unsplash.com')
    ? `${src.replace(/([?&])w=\d+&h=\d+/, '$1w=320&h=441')} 1x, ${src} 2x`
    : undefined;

const DEFAULT_ITEMS: ArcCarouselItem[] = [
  {
    title: 'Nightfall',
    tag: 'Astronomy app',
    meta: 'Stellar Co. · 2026',
    image: photo('1519681393784-d120267933ba'),
  },
  {
    title: 'Chroma Identity',
    tag: 'Brand identity',
    meta: 'Chroma Studio · 2026',
    image: photo('1541701494587-cb58502866ab'),
  },
  {
    title: 'Alpine Lodge',
    tag: 'Hospitality',
    meta: 'Moraine Hotels · 2026',
    image: photo('1493246507139-91e8fad9978e'),
  },
  {
    title: 'Metro Pulse',
    tag: 'Data visualisation',
    meta: 'City of Lakes · 2025',
    image: photo('1477959858617-67f85cf4f1df'),
  },
  {
    title: 'Orbit Motion',
    tag: '3D & motion',
    meta: 'Orbit Labs · 2025',
    image: photo('1618005198919-d3d4b5a92ead'),
  },
  {
    title: 'Open Road',
    tag: 'Campaign film',
    meta: 'Westward · 2025',
    image: photo('1500530855697-b586d89ba3ee'),
  },
  {
    title: 'Still Water',
    tag: 'Wellness app',
    meta: 'Calm Harbor · 2024',
    image: photo('1534447677768-be436bb09401'),
  },
  {
    title: 'Lago Retreats',
    tag: 'Travel platform',
    meta: 'Lago Travel · 2024',
    image: photo('1501785888041-af3ef285b470'),
  },
];

const STEP = cn(
  'grid size-11 place-items-center rounded-full border border-tween-teal-soft/25 text-white',
  'transition-[background-color,border-color,color] duration-300 ease-tween hover:border-tween-lime hover:bg-tween-lime hover:text-tween-ink-deep',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tween-lime motion-reduce:transition-none'
);
const FADE =
  'pointer-events-none absolute inset-y-0 z-2 w-[clamp(2.5rem,14cqw,12rem)] from-tween-ink-deep via-tween-ink-deep/70 to-transparent';

const Caret = ({ flip }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 9 16"
    aria-hidden="true"
    className={cn('h-4 w-[8.5px]', flip && 'rotate-180')}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7.5 1.5 1.5 8l6 6.5" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5" fill="currentColor">
    <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
    <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5" fill="currentColor">
    <path d="M4.5 2.9v10.2a1 1 0 0 0 1.53.85l8.1-5.1a1 1 0 0 0 0-1.7l-8.1-5.1A1 1 0 0 0 4.5 2.9Z" />
  </svg>
);

const ArrowUpRight = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 16 16"
    aria-hidden="true"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
  </svg>
);

export default function ArcCarousel({
  items = DEFAULT_ITEMS,
  badge = 'Featured work',
  title = 'Projects we shipped this season.',
  description = 'A rotating look at recent launches across brand, product and research. Swipe, drag or use the arrows to browse.',
  cta = { label: 'View all projects', href: '#' },
  autoplay = true,
  interval = 5000,
  className,
  ...props
}: ArcCarouselProps) {
  const count = items.length;
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [held, setHeld] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const track = useRef({ pos: 0 });
  const clockRef = useRef<gsap.core.Tween | null>(null);
  const swipe = useRef({ tracking: false, swiped: false, x: 0, y: 0 });
  const holds = useRef({ hover: false, focus: false, offscreen: false });
  const titleId = useId();
  const descriptionId = useId();

  const current = count ? gsap.utils.wrap(0, count, position) : 0;
  const active = items[current];
  const offsetOf = (index: number, pos: number) =>
    gsap.utils.wrap(-count / 2, count / 2, index - pos);

  const step = useCallback((direction: number) => setPosition((p) => p + direction), []);

  // `playing` is the viewer's choice; a hold is a pause they did not ask for
  const hold = useCallback((key: keyof typeof holds.current, on: boolean) => {
    holds.current[key] = on;
    setHeld(Object.values(holds.current).some(Boolean));
  }, []);

  // Every card is placed from one number, so a step is a single tween and the wrap needs no copies
  useGSAP(
    () => {
      const cards = cardRefs.current.filter((card): card is HTMLDivElement => card !== null);
      const render = () =>
        cards.forEach((card, i) => {
          const s = slot(offsetOf(i, track.current.pos));
          gsap.set(card, { ...s, pointerEvents: s.opacity > 0.5 ? 'auto' : 'none' });
        });

      gsap.to(track.current, {
        pos: position,
        duration: prefersReducedMotion() ? 0 : MOVE_DURATION,
        ease: MOVE_EASE,
        overwrite: true,
        onUpdate: render,
      });
    },
    { scope: rootRef, dependencies: [position, count] }
  );

  // The media query is client-only, so reduced motion applies after hydration
  useEffect(() => {
    setPlaying(autoplay && !prefersReducedMotion());
  }, [autoplay]);

  // The clock is the progress ring: it fills over `interval`, then steps. Any step restarts it
  useGSAP(
    () => {
      const ring = ringRef.current;
      if (!ring || !playing || count < 2) return;
      clockRef.current = gsap.fromTo(
        ring,
        // The attribute, not the CSS property, so the dash stays in `pathLength` units
        { attr: { 'stroke-dashoffset': 1 } },
        {
          attr: { 'stroke-dashoffset': 0 },
          duration: interval / 1000,
          ease: 'none',
          onComplete: () => step(1),
        }
      );
    },
    { scope: rootRef, dependencies: [playing, position, interval, count], revertOnUpdate: true }
  );

  useEffect(() => {
    if (held) clockRef.current?.pause();
    else clockRef.current?.resume();
  }, [held, position, playing]);

  useGSAP(
    () => {
      if (!autoplay) return;
      ScrollTrigger.create({
        trigger: rootRef.current,
        onToggle: (self) => hold('offscreen', !self.isActive),
      });
    },
    { scope: rootRef, dependencies: [autoplay, hold] }
  );

  // A swipe can end outside the list
  useEffect(() => {
    const onUp = (event: PointerEvent) => {
      const s = swipe.current;
      if (!s.tracking) return;
      s.tracking = false;
      const dx = event.clientX - s.x;
      if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(event.clientY - s.y)) {
        s.swiped = true;
        step(dx < 0 ? 1 : -1);
      }
    };
    const onCancel = () => {
      swipe.current.tracking = false;
    };
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [step]);

  // After a swipe, or on a side card, a click steps the arc instead of following the card's link
  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (swipe.current.swiped) {
      swipe.current.swiped = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (event.detail === 0) return;
    const index = cardRefs.current.findIndex((card) => card?.contains(event.target as Node));
    const offset = index < 0 ? 0 : Math.round(offsetOf(index, position));
    if (offset !== 0) {
      event.preventDefault();
      event.stopPropagation();
      step(Math.sign(offset));
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1);
  };

  return (
    <section
      ref={rootRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'bg-tween-ink-deep @container relative isolate flex w-full flex-col items-center gap-4 overflow-hidden pt-28 pb-24 text-white',
        '@max-[64rem]:pt-24 @max-[64rem]:pb-18 @max-[48rem]:gap-8 @max-[48rem]:py-16',
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[62%] left-1/2 -z-10 size-[min(120cqw,70rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--color-tween-teal)_45%,transparent),color-mix(in_oklch,var(--color-tween-teal)_10%,transparent)_55%,transparent)]"
      />

      <header className="relative z-3 flex w-full max-w-2xl flex-col items-center gap-5 px-6 text-center @max-[48rem]:gap-3">
        {badge && (
          <span className="border-tween-lime/30 bg-tween-lime/10 text-tween-lime inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-[0.14em] uppercase">
            <span aria-hidden="true" className="bg-tween-lime size-1.5 rounded-full" />
            {badge}
          </span>
        )}
        <h2
          id={titleId}
          className="text-[clamp(2.25rem,5.5cqw,4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance"
        >
          {title}
        </h2>
        {description && (
          <p
            id={descriptionId}
            className="text-tween-teal-soft/75 max-w-lg text-[15px] leading-relaxed text-pretty @max-[48rem]:text-sm"
          >
            {description}
          </p>
        )}
      </header>

      {/* Isolated, so the cards' z-indexes stay under the edge fades */}
      <div
        className="relative isolate z-1 h-150 w-78 @max-[64rem]:h-134 @max-[48rem]:h-72.5"
        onPointerEnter={(event) => event.pointerType !== 'touch' && hold('hover', true)}
        onPointerLeave={() => hold('hover', false)}
      >
        <div className="absolute inset-0 origin-[50%_0] @max-[64rem]:scale-80 @max-[48rem]:scale-62">
          <div
            role="group"
            tabIndex={0}
            aria-roledescription="carousel"
            aria-label={title}
            className="focus-visible:ring-tween-lime focus-visible:ring-offset-tween-ink-deep absolute top-16 left-0 h-107.5 w-78 touch-pan-y rounded-[8px] outline-none select-none focus-visible:ring-2 focus-visible:ring-offset-8 @max-[48rem]:top-2"
            onPointerDown={(event) => {
              swipe.current = { tracking: true, swiped: false, x: event.clientX, y: event.clientY };
            }}
            onDragStart={(event) => event.preventDefault()}
            onClickCapture={onClickCapture}
            onKeyDown={onKeyDown}
            onFocus={(event) => {
              let visible = true;
              try {
                visible = event.target.matches(':focus-visible');
              } catch {
                // No :focus-visible support: treat every focus as visible
              }
              if (visible) hold('focus', true);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                hold('focus', false);
              }
            }}
          >
            {items.map((item, i) => {
              const isActive = i === current;
              const Card = item.href ? 'a' : 'div';
              // Also set in markup, so the arc is in place before hydration
              const first = slot(offsetOf(i, 0));
              return (
                <div
                  key={`${item.title}-${i}`}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}: ${item.title}`}
                  aria-hidden={isActive ? undefined : true}
                  data-active={isActive ? '' : undefined}
                  className="group/card absolute top-0 left-0 h-107.5 w-78 will-change-transform"
                  style={{
                    transform: `translate(${first.x}px, ${first.y}px) rotate(${first.rotation}deg) scale(${first.scale})`,
                    opacity: first.opacity,
                    zIndex: first.zIndex,
                  }}
                >
                  <Card
                    {...(item.href ? { href: item.href } : {})}
                    tabIndex={item.href && isActive ? 0 : -1}
                    draggable={false}
                    className={cn(
                      'bg-tween-ink relative block size-full overflow-hidden rounded-[8px]',
                      'shadow-[0_30px_60px_-24px_rgb(0_0_0/0.75)]',
                      'focus-visible:outline-tween-lime focus-visible:outline-2 focus-visible:outline-offset-4'
                    )}
                  >
                    <img
                      src={item.image}
                      srcSet={srcSetOf(item.image)}
                      alt=""
                      width={312}
                      height={430}
                      draggable={false}
                      decoding="async"
                      loading={Math.abs(offsetOf(i, 0)) <= 2 ? 'eager' : 'lazy'}
                      className="absolute inset-0 size-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="bg-tween-ink-deep/40 ease-tween absolute inset-0 transition-opacity duration-500 group-data-active/card:opacity-0 motion-reduce:transition-none"
                    />
                    <span
                      aria-hidden="true"
                      className="from-tween-ink-deep via-tween-ink-deep/60 absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t to-transparent"
                    />

                    <span className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                      {item.tag ? (
                        <span className="bg-tween-ink-deep/70 truncate rounded-full px-3 py-1.5 text-[11px] leading-none font-medium tracking-[0.12em] text-white uppercase ring-1 ring-white/10">
                          {item.tag}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="shrink-0 text-xs font-medium text-white/70 tabular-nums">
                        {pad2(i + 1)}
                        <span className="text-white/35"> / {pad2(count)}</span>
                      </span>
                    </span>

                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                      <span className="grid min-w-0 gap-1.5">
                        <span className="truncate text-[22px] leading-tight font-semibold tracking-[-0.025em] text-white">
                          {item.title}
                        </span>
                        {item.meta && (
                          <span className="text-tween-teal-soft/80 truncate text-sm">
                            {item.meta}
                          </span>
                        )}
                      </span>
                      {item.href && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            'grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20',
                            'ease-tween transition-[background-color,color,box-shadow] duration-500 motion-reduce:transition-none',
                            'group-data-active/card:bg-tween-lime group-data-active/card:text-tween-ink-deep group-data-active/card:ring-transparent'
                          )}
                        >
                          <ArrowUpRight className="ease-tween size-4 transition-transform duration-300 group-hover/card:rotate-45 motion-reduce:transition-none" />
                        </span>
                      )}
                    </span>

                    <span
                      aria-hidden="true"
                      className="ease-tween group-data-active/card:ring-tween-lime/80 pointer-events-none absolute inset-0 rounded-[8px] ring-1 ring-white/10 transition-shadow duration-500 ring-inset group-data-active/card:ring-2 motion-reduce:transition-none"
                    />
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-3 flex items-center gap-2">
        <button
          className={STEP}
          type="button"
          aria-label="Previous project"
          onClick={() => step(-1)}
        >
          <Caret />
        </button>
        {cta && (
          <a
            href={cta.href}
            className={cn(
              'bg-tween-lime text-tween-ink-deep inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold',
              'ease-tween transition-[filter,transform] duration-300 hover:brightness-110 active:scale-[0.97]',
              'focus-visible:outline-tween-lime focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none'
            )}
          >
            {cta.label}
            <ArrowUpRight className="size-3.5" />
          </a>
        )}
        <button className={STEP} type="button" aria-label="Next project" onClick={() => step(1)}>
          <Caret flip />
        </button>
        {autoplay && (
          <button
            className={cn(STEP, 'relative ml-2')}
            type="button"
            aria-label={playing ? 'Pause autoplay' : 'Start autoplay'}
            onClick={() => setPlaying((on) => !on)}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
            <svg
              aria-hidden="true"
              viewBox="0 0 44 44"
              className={cn(
                'pointer-events-none absolute -inset-px -rotate-90 transition-opacity duration-300',
                playing ? 'opacity-100' : 'opacity-0'
              )}
            >
              <circle
                ref={ringRef}
                cx="22"
                cy="22"
                r="21"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="1"
                className="text-tween-lime"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Quiet while autoplaying, so a screen reader is not interrupted every few seconds */}
      <p aria-live={playing && !held ? 'off' : 'polite'} className="sr-only">
        {active ? `${current + 1} of ${count}: ${active.title}` : ''}
      </p>

      <div aria-hidden="true" className={cn(FADE, 'left-0 bg-linear-to-r')} />
      <div aria-hidden="true" className={cn(FADE, 'right-0 bg-linear-to-l')} />
    </section>
  );
}
