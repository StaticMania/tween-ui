'use client';

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Where each column starts before it settles. Outer columns swing in. */
const COLUMN_ENTRY = [
  { x: -90, y: 28, rotation: -5 },
  { x: 0, y: 56, rotation: 0 },
  { x: 90, y: 28, rotation: 5 },
];

/** How far each column drifts across the whole scroll — the parallax. */
const COLUMN_DRIFT = [48, -28, -48];

function StarIcon({ filled = true, className }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={filled ? 0 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface TestimonialColumnDriftItem {
  /** Reviewer name. */
  name: string;
  /** Role shown under the name. */
  jobTitle: string;
  /** Avatar URL. */
  image: string;
  /** Alt text for the avatar. */
  imageAlt?: string;
  /** Quote text before the highlighted clause. */
  quoteBefore: string;
  /** The clause that gets the underline wipe on hover. */
  quoteHighlight: string;
  /** Quote text after the highlighted clause. */
  quoteAfter: string;
  /** Filled stars, out of five. */
  stars?: number;
}

export interface TestimonialColumnDriftRating {
  /** Headline score, e.g. "4.8". */
  score: string;
  /** Denominator shown next to the score. */
  outOf?: string;
  /** Caption under the score. */
  label?: string;
  /** Caption beside the stars. */
  note?: string;
  /** Overlapping avatars in the summary card. */
  avatars?: { image: string; alt?: string }[];
  /** Badge shown ahead of the avatars, e.g. "+243". */
  extraCount?: string;
  /** Short lines under the summary. */
  quotes?: string[];
}

export interface TestimonialColumnDriftProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title'
> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** One array per column. Three columns is the intended shape. */
  columns?: TestimonialColumnDriftItem[][];
  /** Summary card dropped into the middle column. Pass `null` to hide it. */
  rating?: TestimonialColumnDriftRating | null;
}

const DEFAULT_TITLE = 'Latest creations and projects';

const DEFAULT_DESCRIPTION =
  'What teams say after shipping with us — pulled from reviews left over the last twelve months.';

const QUOTE = {
  quoteBefore: 'The photos were sharp, clean,',
  quoteHighlight: 'and made our website look premium.',
  quoteAfter: 'They truly captured the essence of our brand.',
};

const AVATAR = (id: string) => `https://images.unsplash.com/${id}?w=96&h=96&fit=crop&crop=faces`;

const DEFAULT_COLUMNS: TestimonialColumnDriftItem[][] = [
  [
    {
      name: 'Liam Harper',
      jobTitle: 'Dog Trainer',
      image: AVATAR('photo-1500648767791-00dcc994a43e'),
      ...QUOTE,
    },
    {
      name: 'Maya Collins',
      jobTitle: 'Nursing Assistant',
      image: AVATAR('photo-1494790108377-be9c29b29330'),
      ...QUOTE,
    },
  ],
  [
    {
      name: 'Ethan Brooks',
      jobTitle: 'President of Sales',
      image: AVATAR('photo-1519085360753-af0119f7cbe7'),
      ...QUOTE,
    },
    {
      name: 'Zoe Mitchell',
      jobTitle: 'Web Designer',
      image: AVATAR('photo-1438761681033-6461ffad8d80'),
      ...QUOTE,
    },
  ],
  [
    {
      name: 'Noah Bennett',
      jobTitle: 'Product Lead',
      image: AVATAR('photo-1507003211169-0a1dd7228f2d'),
      ...QUOTE,
    },
    {
      name: 'Ava Sinclair',
      jobTitle: 'Marketing Head',
      image: AVATAR('photo-1534528741775-53994a69daeb'),
      ...QUOTE,
    },
  ],
];

const DEFAULT_RATING: TestimonialColumnDriftRating = {
  score: '4.8',
  outOf: '/5',
  label: 'Real Rating',
  note: 'Happy by 20k+ clients',
  extraCount: '+243',
  avatars: [
    { image: AVATAR('photo-1500648767791-00dcc994a43e') },
    { image: AVATAR('photo-1494790108377-be9c29b29330') },
    { image: AVATAR('photo-1519085360753-af0119f7cbe7') },
  ],
  quotes: [
    'The photos were sharp, clean, and made our website look premium.',
    'They truly captured the essence of our brand.',
  ],
};

const CARD =
  'flex w-full flex-col items-start justify-between rounded-xl bg-white p-5 will-change-transform dark:bg-[#161b22] motion-reduce:transform-none motion-reduce:transition-none';

function TestimonialCard({ item }: { item: TestimonialColumnDriftItem }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const quoteRef = useRef<HTMLSpanElement>(null);
  const stars = item.stars ?? 4;

  const handleEnter = () => {
    if (prefersReducedMotion()) return;
    gsap.to(rootRef.current, { y: -10, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    gsap.fromTo(
      avatarRef.current,
      { rotationY: 0 },
      {
        rotationY: 18,
        duration: 0.35,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        overwrite: 'auto',
      }
    );
    gsap.to(quoteRef.current, {
      backgroundSize: '100% 2px',
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const handleLeave = () => {
    if (prefersReducedMotion()) return;
    gsap.to(rootRef.current, { y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
    gsap.to(quoteRef.current, {
      backgroundSize: '0% 2px',
      duration: 0.3,
      ease: 'power2.in',
      overwrite: 'auto',
    });
  };

  return (
    <div
      ref={rootRef}
      data-testimonial-card
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={cn(CARD, 'h-[400px]')}
    >
      <div className="flex w-full items-center gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-[#f1f3f4] p-1 dark:bg-white/5">
          <img
            ref={avatarRef}
            src={item.image}
            alt={item.imageAlt ?? item.name}
            loading="lazy"
            className="size-12 rounded object-cover [perspective:600px]"
          />
        </span>
        <span className="flex min-w-0 flex-col items-start">
          <span className="text-sm font-medium text-[#12161f] dark:text-white">{item.name}</span>
          <span className="text-xs text-[#18181b]/60 dark:text-white/60">{item.jobTitle}</span>
        </span>
      </div>

      <div className="flex w-full flex-col items-start gap-6">
        <div
          data-testimonial-stars
          className="flex items-center gap-1 text-[#12161f] dark:text-[#c6f56f]"
          aria-label={`${stars} out of 5 stars`}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <StarIcon key={i} filled={i < stars} className="size-3" />
          ))}
        </div>
        <p className="text-sm leading-relaxed text-[#18181b]/60 dark:text-white/60">
          {item.quoteBefore}{' '}
          <span
            ref={quoteRef}
            className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 text-[#12161f] dark:text-white"
          >
            {item.quoteHighlight}
          </span>{' '}
          {item.quoteAfter}
        </p>
      </div>
    </div>
  );
}

function RatingCard({ rating }: { rating: TestimonialColumnDriftRating }) {
  const avatars = rating.avatars ?? [];

  return (
    <div className={cn(CARD, 'h-[450px]')}>
      <div className="flex w-full flex-col items-start gap-2.5 rounded-md bg-[#f1f3f4] p-4 dark:bg-white/5">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="isolate flex min-w-0 items-center">
            {rating.extraCount && (
              <span className="z-[4] -mr-5 flex size-14 shrink-0 items-center justify-center rounded-lg bg-[#c6f56f] p-1 text-xs font-medium text-black">
                {rating.extraCount}
              </span>
            )}
            {avatars.map((avatar, index) => (
              <span
                key={avatar.image}
                style={{ zIndex: 3 - index }}
                className="-mr-5 flex shrink-0 items-center justify-center rounded-lg bg-white p-1 last:mr-0 dark:bg-[#21262d]"
              >
                <img
                  src={avatar.image}
                  alt={avatar.alt ?? 'Client avatar'}
                  loading="lazy"
                  className="size-10 rounded object-cover"
                />
              </span>
            ))}
          </div>
          <div className="flex shrink-0 flex-col items-start gap-1">
            <div
              className="flex items-center gap-0.5 text-[#12161f] dark:text-[#c6f56f]"
              aria-label="5 out of 5 stars"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon key={i} className="size-4" />
              ))}
            </div>
            {rating.note && (
              <p className="text-xs text-[#18181b]/60 dark:text-white/60">{rating.note}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start">
          <p className="text-[#12161f] dark:text-white">
            <span className="text-3xl font-normal">{rating.score}</span>
            <span className="text-xs text-[#18181b]/60 dark:text-white/60">{rating.outOf}</span>
          </p>
          {rating.label && (
            <p className="text-xs text-[#18181b]/60 dark:text-white/60">{rating.label}</p>
          )}
        </div>
      </div>

      <div className="w-full space-y-4">
        {(rating.quotes ?? []).map((quote) => (
          <p key={quote} className="text-sm leading-relaxed text-[#18181b]/60 dark:text-white/60">
            {quote}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function TestimonialColumnDrift({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  columns = DEFAULT_COLUMNS,
  rating = DEFAULT_RATING,
  className,
  ...props
}: TestimonialColumnDriftProps) {
  const rootRef = useRef<HTMLElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const cols = columnRefs.current.filter(Boolean) as HTMLDivElement[];
      if (cols.length === 0) return;

      // Park each column off its resting place, then settle the whole wall once
      // it scrolls into view.
      cols.forEach((col, index) => {
        const entry = COLUMN_ENTRY[index] ?? COLUMN_ENTRY[1];
        gsap.set(Array.from(col.children), { opacity: 0, ...entry });
      });

      const settle = gsap.timeline({
        scrollTrigger: { trigger: rootRef.current, start: 'top 78%', once: true },
      });

      cols.forEach((col, index) => {
        settle.to(
          Array.from(col.children),
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.75,
            ease: 'power3.out',
            stagger: 0.14,
          },
          // The middle column lands a beat later, so the wall closes inward.
          index === 1 ? 0.18 : index * 0.06
        );
      });

      settle.fromTo(
        '[data-testimonial-stars]',
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power2.out', stagger: 0.06 },
        '-=0.4'
      );

      // Columns then drift at different rates for the rest of the scroll.
      cols.forEach((col, index) => {
        gsap.to(col, {
          y: COLUMN_DRIFT[index] ?? 0,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      });
    },
    { scope: rootRef, dependencies: [columns, rating] }
  );

  return (
    <section
      ref={rootRef}
      data-testimonial-column-drift
      className={cn('w-full px-5 py-16 md:py-24', className)}
      {...props}
    >
      <div className="mx-auto max-w-[1290px] space-y-10 md:space-y-16">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-[#12161f] md:text-5xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto max-w-[600px] text-base text-[#18181b]/60 md:text-lg dark:text-white/60">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-12 items-center gap-6">
          {columns.map((column, columnIndex) => (
            <div
              key={columnIndex}
              ref={(node) => {
                columnRefs.current[columnIndex] = node;
              }}
              className="col-span-12 flex flex-col gap-6 md:col-span-6 lg:col-span-4"
            >
              {column[0] && <TestimonialCard item={column[0]} />}

              {columnIndex === 1 && rating && <RatingCard rating={rating} />}

              {column.slice(1).map((item) => (
                <TestimonialCard key={item.name} item={item} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
