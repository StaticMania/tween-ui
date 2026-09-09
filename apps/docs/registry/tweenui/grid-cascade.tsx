'use client';

import {
  useCallback,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ENTER = { y: -22, duration: 0.6, stagger: 0.08 };
const LEAVE = { y: 14, duration: 0.28, stagger: 0.05 };

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9L12 2.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M18.9 2.3h3.4l-7.4 8.5 8.7 11.5h-6.8l-5.4-7-6.1 7H1.9l7.9-9.1L1.5 2.3h7l4.9 6.4 5.5-6.4Zm-1.2 17.9h1.9L6.4 4.2H4.4l13.3 16Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronIcon({
  direction,
  className,
}: {
  direction: 'left' | 'right';
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path
        d={direction === 'left' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface GridCascadeItem {
  /** Reviewer name. */
  name: string;
  /** Role shown under the name. */
  position: string;
  /** The quote. Clamped to three lines so a page stays level. */
  review: string;
  /** Avatar URL. */
  image: string;
  /** Alt text for the avatar. Falls back to `name`. */
  imageAlt?: string;
  /** Profile the corner button opens. Omit it and no button renders. */
  link?: string;
}

export interface GridCascadeProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Quotes to page through. */
  items?: GridCascadeItem[];
  /** Cards shown at once. The grid is built for three. */
  perPage?: number;
  /** Wrap from the last page back to the first. */
  loop?: boolean;
}

const DEFAULT_TITLE = 'What our users say';

const AVATAR = (id: string) => `https://images.unsplash.com/${id}?w=96&h=96&fit=crop&crop=faces`;

const DEFAULT_ITEMS: GridCascadeItem[] = [
  {
    name: 'Maya Collins',
    position: 'Head of Operations',
    review:
      'We replaced four tools with one workflow, and the team shipped its first release two weeks early. Nobody has asked to go back.',
    image: AVATAR('photo-1494790108377-be9c29b29330'),
    link: '#',
  },
  {
    name: 'Ethan Brooks',
    position: 'President of Sales',
    review:
      'Reporting used to take a full day each month. Now it runs itself and lands in our inbox before standup.',
    image: AVATAR('photo-1519085360753-af0119f7cbe7'),
    link: '#',
  },
  {
    name: 'Liam Harper',
    position: 'Product Lead',
    review:
      'Onboarding took an afternoon, not a quarter. Every handoff is visible, so nothing slips between design and build.',
    image: AVATAR('photo-1507003211169-0a1dd7228f2d'),
    link: '#',
  },
  {
    name: 'Ava Sinclair',
    position: 'Marketing Head',
    review:
      'Support tickets dropped by a third in one month. Customers find their answers before they ever reach us.',
    image: AVATAR('photo-1534528741775-53994a69daeb'),
    link: '#',
  },
  {
    name: 'Noah Bennett',
    position: 'Engineering Manager',
    review:
      'The API paid for the whole plan in a week. We wired it into our release pipeline and stopped thinking about it.',
    image: AVATAR('photo-1500648767791-00dcc994a43e'),
    link: '#',
  },
  {
    name: 'Zoe Mitchell',
    position: 'Creative Director',
    review:
      'It looks like our brand out of the box, which never happens. The team stopped asking me to review every asset.',
    image: AVATAR('photo-1438761681033-6461ffad8d80'),
    link: '#',
  },
];

export default function GridCascade({
  title = DEFAULT_TITLE,
  description,
  items = DEFAULT_ITEMS,
  perPage = 3,
  loop = true,
  className,
  ...props
}: GridCascadeProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [page, setPage] = useState(0);
  const busy = useRef(false);

  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  const visible = items.slice(page * perPage, page * perPage + perPage);

  // Only the current page is rendered, so the incoming trio animates on mount
  // rather than being toggled with `display: none`.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '[data-testimonial-card]',
        { autoAlpha: 0, y: ENTER.y },
        {
          autoAlpha: 1,
          y: 0,
          duration: ENTER.duration,
          ease: 'power3.out',
          stagger: ENTER.stagger,
          clearProps: 'transform,opacity,visibility',
        }
      );
    },
    { scope: rootRef, dependencies: [page, items] }
  );

  const goTo = useCallback(
    (next: number) => {
      if (busy.current || next === page || pageCount < 2) return;

      if (prefersReducedMotion()) {
        setPage(next);
        return;
      }

      busy.current = true;
      // Drop the current trio away first, so the two sets never overlap.
      gsap.to(gsap.utils.toArray('[data-testimonial-card]', rootRef.current), {
        autoAlpha: 0,
        y: LEAVE.y,
        duration: LEAVE.duration,
        ease: 'power2.in',
        stagger: LEAVE.stagger,
        onComplete: () => {
          setPage(next);
          busy.current = false;
        },
      });
    },
    [page, pageCount]
  );

  const step = (delta: number) => {
    const next = page + delta;
    if (next < 0) return loop ? goTo(pageCount - 1) : undefined;
    if (next >= pageCount) return loop ? goTo(0) : undefined;
    return goTo(next);
  };

  return (
    <section
      ref={rootRef}
      data-grid-cascade
      className={cn('w-full px-5 py-14 md:py-16', className)}
      {...props}
    >
      <div className="mx-auto max-w-[1064px] space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-[#12161f] md:text-4xl dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mx-auto max-w-[520px] text-sm text-[#18181b]/60 md:text-base dark:text-white/60">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <article
              key={item.name}
              data-testimonial-card
              className={cn(
                'rounded-xl border border-[#18181b]/10 bg-white p-6 dark:border-white/10 dark:bg-[#161b22]',
                'motion-reduce:transform-none motion-reduce:transition-none'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-x-3">
                  <img
                    src={item.image}
                    alt={item.imageAlt ?? item.name}
                    loading="lazy"
                    className="size-12 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#12161f] dark:text-white">
                      {item.name}
                    </p>
                    <p className="truncate text-xs text-[#18181b]/60 dark:text-white/60">
                      {item.position}
                    </p>
                  </div>
                </div>

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${item.name} on X`}
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f1f3f4] text-[#12161f] transition-colors hover:bg-[#e6e9ea] motion-reduce:transition-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    <XMark className="size-3.5" />
                  </a>
                )}
              </div>

              <blockquote className="mt-5 line-clamp-3 text-sm leading-relaxed text-[#18181b]/70 dark:text-white/70">
                {item.review}
              </blockquote>

              <div
                className="mt-4 flex items-center gap-x-1 text-[#045f64] dark:text-[#c6f56f]"
                aria-label="5 out of 5 stars"
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <StarIcon key={index} className="size-3.5" />
                ))}
              </div>
            </article>
          ))}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-x-2">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous testimonials"
              className="grid size-11 place-items-center rounded-full bg-[#f1f3f4] text-[#12161f] transition-colors hover:bg-[#e6e9ea] motion-reduce:transition-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <ChevronIcon direction="left" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next testimonials"
              className="grid size-11 place-items-center rounded-full bg-[#f1f3f4] text-[#12161f] transition-colors hover:bg-[#e6e9ea] motion-reduce:transition-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <ChevronIcon direction="right" className="size-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
