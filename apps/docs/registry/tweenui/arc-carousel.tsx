'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { cn } from '@/lib/utils';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Layout effects warn on the server; there is nothing to lay out there anyway
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface ArcCarouselItem {
  title: string;
  image: string;
  /** Category chip on the top left of the card, e.g. "Brand identity". */
  tag?: string;
  /** A short line under the title, e.g. a client and year or a price. */
  meta?: string;
  href?: string;
}

export interface ArcCarouselProps extends ComponentPropsWithoutRef<'section'> {
  items?: ArcCarouselItem[];
  /** The pill above the title. Pass an empty string to drop it. */
  badge?: string;
  title?: string;
  /** A line under the title. Pass an empty string to drop it. */
  description?: string;
  cta?: { label: string; href: string } | null;
  /**
   * Step to the next card on its own. On by default; pass `false` to turn it off. It
   * pauses while the pointer is over the cards, while they have keyboard focus and
   * while the block is off-screen, and adds a pause / play button with a progress ring.
   */
  autoplay?: boolean;
  /** Time each card holds the centre while autoplaying, in ms. */
  interval?: number;
}

/**
 * Where a card sits by its distance from the centre: px across, px down and degrees of
 * turn. The steps grow as they go out, so the row bends down into an arc. Cards further
 * out than the last slot carry on along the same line, invisible, which is where a
 * wrapping card leaves to and comes back from.
 */
const SLOTS = [
  { x: 0, y: 0, r: 0 },
  { x: 359, y: 26, r: 8.77 },
  { x: 711, y: 113, r: 18.83 },
  { x: 1033, y: 243, r: 25.05 },
];
const ACTIVE_SCALE = 1.05;
const ART = 'transform 470ms cubic-bezier(0.42, 1, 0.46, 1)';
const MOVE = 'transform 800ms cubic-bezier(0.98, 0.30, 0.30, 1), opacity 400ms ease';
/** A swipe has to travel this far, mostly sideways, to count as one. */
const SWIPE = 50;
/** How long a wrapping card's off-screen copy lives: the move, plus a frame or two. */
const GHOST_LIFE = 850;
/** Autoplay never counts more than this per frame, so a backgrounded tab does not skip ahead. */
const MAX_FRAME = 100;

const slot = (offset: number) => {
  const t = Math.abs(offset);
  const sign = Math.sign(offset);
  const last = SLOTS.length - 1;
  let p = SLOTS[Math.min(t, last)];
  if (t > last) {
    const prev = SLOTS[last - 1];
    const n = t - last;
    p = { x: p.x + (p.x - prev.x) * n, y: p.y + (p.y - prev.y) * n, r: p.r + (p.r - prev.r) * n };
  }
  return {
    transform: `translate(${p.x * sign}px, ${p.y}px) rotate(${p.r * sign}deg)`,
    opacity: t <= last ? '1' : '0',
    zIndex: String(100 - t),
  };
};

/** Signed distance of card `index` from the centre, wrapped to the shortest way round. */
const offsetOf = (index: number, position: number, count: number) => {
  let r = (((index - position) % count) + count) % count;
  if (r > Math.floor(count / 2)) r -= count;
  return r;
};

const wrap = (position: number, count: number) => ((position % count) + count) % count;
const pad2 = (n: number) => String(n).padStart(2, '0');

/** Unsplash, cropped to the card's 312 × 430 at 1x and 2x. */
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
/** The soft edges the arc runs out under. They sit above the cards, below the copy. */
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
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const artRefs = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef({ last: 0, offsets: [] as (number | undefined)[], ghosts: [] as number[] });
  const swipe = useRef({ tracking: false, swiped: false, x: 0, y: 0 });
  const titleId = useId();
  const descriptionId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const progress = useRef(0);
  // `playing` is the viewer's choice; `held` is a pause they did not ask for (hover, focus, off-screen)
  const [playing, setPlaying] = useState(autoplay);
  const holds = useRef({ hover: false, focus: false, offscreen: false });
  const [held, setHeld] = useState(false);
  const hold = (key: keyof typeof holds.current, on: boolean) => {
    holds.current[key] = on;
    setHeld(Object.values(holds.current).some(Boolean));
  };

  const place = (item: HTMLElement, offset: number) => {
    const s = slot(offset);
    item.style.transform = s.transform;
    item.style.opacity = s.opacity;
    item.style.zIndex = s.zIndex;
    item.style.pointerEvents = s.opacity === '1' ? '' : 'none';
  };

  // Lay the cards out on their slots whenever the position changes (animated after the first layout)
  useIsoLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !count) return;
    const reduced = prefersReducedMotion();
    const move = reduced ? 'opacity 0.3s ease' : MOVE;
    const art = reduced ? 'none' : ART;
    const st = state.current;
    const animate = st.offsets.length > 0;
    const delta = animate ? position - st.last : 0;
    st.last = position;

    itemRefs.current.forEach((item, i) => {
      if (!item) return;
      const next = offsetOf(i, position, count);
      const prev = st.offsets[i];

      const scaleEl = artRefs.current[i];
      if (scaleEl) {
        const scale = next === 0 && !reduced ? `scale(${ACTIVE_SCALE})` : 'scale(1)';
        scaleEl.style.transition = animate ? art : 'none';
        scaleEl.style.transform = scale;
        if (!animate) {
          void scaleEl.offsetWidth;
          scaleEl.style.transition = art;
        }
      }

      if (!animate || prev === undefined) {
        item.style.transition = 'none';
        place(item, next);
      } else if (prev - delta !== next) {
        // Wrapped round: a ghost keeps travelling off-screen, the card re-enters from the far side
        const last = SLOTS.length - 1;
        const entry = delta > 0 ? Math.max(next + 1, last + 1) : Math.min(next - 1, -(last + 1));
        const ghost = item.cloneNode(true) as HTMLElement;
        ghost.setAttribute('aria-hidden', 'true');
        ghost.inert = true;
        ghost.style.pointerEvents = 'none';
        ghost.style.transition = 'none';
        list.appendChild(ghost);
        const out = slot(prev - delta);
        void ghost.offsetWidth;
        ghost.style.transition = move;
        ghost.style.transform = out.transform;
        ghost.style.opacity = '0';
        st.ghosts.push(window.setTimeout(() => ghost.remove(), GHOST_LIFE));

        item.style.transition = 'none';
        place(item, entry);
        item.style.opacity = '0';
        void item.offsetWidth;
        item.style.transition = move;
        place(item, next);
      } else {
        item.style.transition = move;
        place(item, next);
      }
      st.offsets[i] = next;
    });
  }, [position, count]);

  useEffect(() => () => state.current.ghosts.forEach((id) => window.clearTimeout(id)), []);

  const step = useCallback((direction: number) => setPosition((p) => p + direction), []);

  // Autoplay starts off for viewers who asked the system for less motion; they can still press play
  useEffect(() => {
    setPlaying(autoplay && !prefersReducedMotion());
  }, [autoplay]);

  // Any step, by hand or on its own, gives the new card a full interval
  useEffect(() => {
    progress.current = 0;
    ringRef.current?.style.setProperty('stroke-dashoffset', '1');
  }, [position, playing]);

  // The clock: counts only while playing and not held, so a pause resumes where it left off
  useEffect(() => {
    if (!playing || held || count < 2) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      progress.current += Math.min(now - last, MAX_FRAME) / interval;
      last = now;
      if (progress.current >= 1) {
        progress.current = 0;
        step(1);
      }
      ringRef.current?.style.setProperty('stroke-dashoffset', String(1 - progress.current));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, held, interval, count, step]);

  // Off-screen, autoplay waits
  useEffect(() => {
    const section = sectionRef.current;
    if (!autoplay || !section || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) =>
      hold('offscreen', !entry.isIntersecting)
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [autoplay]);

  // Swipe / drag: the release can happen outside the list
  useEffect(() => {
    const onUp = (event: PointerEvent) => {
      const s = swipe.current;
      if (!s.tracking) return;
      s.tracking = false;
      const dx = event.clientX - s.x;
      const dy = event.clientY - s.y;
      if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) {
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
    const s = swipe.current;
    if (s.swiped) {
      s.swiped = false;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    // Keyboard activation (detail 0) keeps its normal behaviour
    if (event.detail === 0) return;
    const index = itemRefs.current.findIndex((item) => item?.contains(event.target as Node));
    if (index < 0) return;
    const offset = offsetOf(index, position, count);
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

  const current = count ? wrap(position, count) : 0;
  const active = items[current];

  return (
    <section
      ref={sectionRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'bg-tween-ink-deep @container relative isolate flex w-full flex-col items-center gap-4 overflow-hidden pt-28 pb-24 text-white',
        '@max-[64rem]:pt-24 @max-[64rem]:pb-18 @max-[48rem]:gap-8 @max-[48rem]:py-16',
        className
      )}
      {...props}
    >
      {/* The teal glow the arc hangs in */}
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

      {/* Its own stacking context, so the cards' z-indexes stay under the edge fades */}
      {/* A mouse or pen resting on the cards holds autoplay; a finger lifts at once, so it never does */}
      <div
        className="relative isolate z-1 h-150 w-78 @max-[64rem]:h-134 @max-[48rem]:h-72.5"
        onPointerEnter={(event) => event.pointerType !== 'touch' && hold('hover', true)}
        onPointerLeave={() => hold('hover', false)}
      >
        <div className="absolute inset-0 origin-[50%_0] @max-[64rem]:scale-80 @max-[48rem]:scale-62">
          <div
            ref={listRef}
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
            // Keyboard focus on the cards holds autoplay, so nothing moves while you read
            onFocus={(event) => {
              let visible = true;
              try {
                visible = event.target.matches(':focus-visible');
              } catch {
                // Older engines without :focus-visible: treat every focus as visible
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
              const offset = offsetOf(i, position, count);
              const isActive = offset === 0;
              const Card = item.href ? 'a' : 'div';
              // The first frame is set here too, so the arc is in place before hydration
              const first = slot(offsetOf(i, 0, count));
              return (
                <div
                  key={`${item.title}-${i}`}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}: ${item.title}`}
                  aria-hidden={isActive ? undefined : true}
                  data-active={isActive ? '' : undefined}
                  className="group/card absolute top-0 left-0 h-107.5 w-78 will-change-transform"
                  style={{
                    transform: first.transform,
                    opacity: first.opacity,
                    zIndex: first.zIndex,
                  }}
                >
                  <div
                    ref={(el) => {
                      artRefs.current[i] = el;
                    }}
                    className="size-full origin-center"
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
                        loading={Math.abs(offsetOf(i, 0, count)) <= 2 ? 'eager' : 'lazy'}
                        className="absolute inset-0 size-full object-cover"
                      />

                      {/* Side cards sit back in shade; the centre card steps out of it */}
                      <span
                        aria-hidden="true"
                        className="bg-tween-ink-deep/40 ease-tween absolute inset-0 transition-opacity duration-500 group-data-active/card:opacity-0 motion-reduce:transition-none"
                      />
                      {/* A scrim so the caption reads on any photo */}
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

                      {/* The outline, drawn over the photo so it never gets clipped */}
                      <span
                        aria-hidden="true"
                        className="ease-tween group-data-active/card:ring-tween-lime/80 pointer-events-none absolute inset-0 rounded-[8px] ring-1 ring-white/10 transition-shadow duration-500 ring-inset group-data-active/card:ring-2 motion-reduce:transition-none"
                      />
                    </Card>
                  </div>
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
            {/* Time left on the current card */}
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

      {/* Quiet while it plays itself, so a screen reader is not interrupted every few seconds */}
      <p aria-live={playing && !held ? 'off' : 'polite'} className="sr-only">
        {active ? `${current + 1} of ${count}: ${active.title}` : ''}
      </p>

      <div aria-hidden="true" className={cn(FADE, 'left-0 bg-linear-to-r')} />
      <div aria-hidden="true" className={cn(FADE, 'right-0 bg-linear-to-l')} />
    </section>
  );
}
