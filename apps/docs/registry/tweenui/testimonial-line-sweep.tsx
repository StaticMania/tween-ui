'use client';

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const CLIP_CLOSED = 'circle(0% at 50% 50%)';
const CLIP_OPEN = 'circle(80% at 50% 50%)';

function ArrowIcon({ direction, className }: { direction: 'left' | 'right'; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path
        d={direction === 'left' ? 'M19 12H5m0 0 6-6m-6 6 6 6' : 'M5 12h14m0 0-6-6m6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

export interface TestimonialLineSweepItem {
  /** Quote text before the highlighted clause. */
  quoteStart: string;
  /** The clause rendered in full contrast. */
  quoteHighlight: string;
  /** Quote text after the highlighted clause. */
  quoteEnd: string;
  /** Reviewer name. */
  name: string;
  /** Role shown under the name. */
  jobTitle: string;
  /** Portrait URL. */
  image: string;
  /** Alt text for the portrait. */
  imageAlt?: string;
}

export interface TestimonialLineSweepProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title'
> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Quotes to page through. Shown two at a time from `md` up. */
  items?: TestimonialLineSweepItem[];
}

const DEFAULT_TITLE = 'What our clients say about us';

const DEFAULT_DESCRIPTION =
  "Hear from the people who use our platform every day, and see how it's helping them achieve their goals.";

const PORTRAIT = (id: string) => `https://images.unsplash.com/${id}?w=420&h=340&fit=crop`;

const DEFAULT_ITEMS: TestimonialLineSweepItem[] = [
  {
    quoteStart: 'We replaced four tools with one workflow, and',
    quoteHighlight: 'the team shipped its first release two weeks early.',
    quoteEnd: 'Nobody has asked to go back.',
    name: 'Maya Collins',
    jobTitle: 'Head of Operations',
    image: PORTRAIT('photo-1494790108377-be9c29b29330'),
  },
  {
    quoteStart: 'Reporting used to take a full day each month.',
    quoteHighlight: 'Now it runs itself and lands in our inbox.',
    quoteEnd: 'That time went straight back into the roadmap.',
    name: 'Ethan Brooks',
    jobTitle: 'President of Sales',
    image: PORTRAIT('photo-1519085360753-af0119f7cbe7'),
  },
  {
    quoteStart: 'Onboarding took an afternoon, not a quarter.',
    quoteHighlight: 'Every handoff is visible to the whole team,',
    quoteEnd: 'so nothing slips between design and build.',
    name: 'Liam Harper',
    jobTitle: 'Product Lead',
    image: PORTRAIT('photo-1507003211169-0a1dd7228f2d'),
  },
  {
    quoteStart: 'Support tickets dropped by a third in one month.',
    quoteHighlight: 'Customers find answers before they ask us,',
    quoteEnd: 'and the team finally has room to think.',
    name: 'Ava Sinclair',
    jobTitle: 'Marketing Head',
    image: PORTRAIT('photo-1534528741775-53994a69daeb'),
  },
];

export default function TestimonialLineSweep({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  items = DEFAULT_ITEMS,
  className,
  ...props
}: TestimonialLineSweepProps) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const select = gsap.utils.selector(root);
      const cardEls = gsap.utils.toArray<HTMLElement>('[data-testimonial-item]', root);
      if (cardEls.length === 0) return;

      const prevBtn = select('[data-prev]')[0] as HTMLButtonElement | undefined;
      const nextBtn = select('[data-next]')[0] as HTMLButtonElement | undefined;
      const mdQuery = window.matchMedia('(min-width: 768px)');
      const reduceMotion = prefersReducedMotion();

      let perView = mdQuery.matches ? 2 : 1;
      let pageCount = Math.ceil(cardEls.length / perView);
      let activePage = 0;
      let isAnimating = false;
      let isInView = true;

      type Card = {
        el: HTMLElement;
        image: HTMLElement | null;
        splits: SplitText[];
        lines: () => Element[];
      };

      const cards: Card[] = cardEls.map((el) => {
        const within = gsap.utils.selector(el);
        const targets = [
          ...within('[data-testimonial-text]'),
          ...within('[data-testimonial-split]'),
        ] as HTMLElement[];

        let splits: SplitText[] = [];
        // SplitText needs real layout to find line breaks; if there is none
        // (SSR snapshot, jsdom) fall back to fading whole cards.
        try {
          splits = reduceMotion
            ? []
            : targets.map((target) => SplitText.create(target, { type: 'lines', mask: 'lines' }));
        } catch {
          splits = [];
        }

        return {
          el,
          image: (within('[data-testimonial-img]')[0] as HTMLElement | undefined) ?? null,
          splits,
          lines() {
            return this.splits.flatMap((split) => split.lines ?? []);
          },
        };
      });

      const onPage = (page: number) => cards.slice(page * perView, page * perView + perView);

      const setPageState = (page: number, active: boolean) => {
        onPage(page).forEach((card) => {
          card.el.setAttribute('aria-hidden', String(!active));
          gsap.set(card.el, {
            autoAlpha: active ? 1 : 0,
            pointerEvents: active ? 'auto' : 'none',
            zIndex: active ? 1 : 0,
          });
        });
      };

      const applyPages = () => {
        pageCount = Math.ceil(cards.length / perView);
        activePage = Math.min(activePage, pageCount - 1);
        for (let page = 0; page < pageCount; page++) setPageState(page, page === activePage);
      };

      applyPages();

      cards.forEach((card, index) => {
        const active = Math.floor(index / perView) === activePage;
        gsap.set(card.lines(), { yPercent: active ? 0 : 110, force3D: true });
        if (card.image) gsap.set(card.image, { clipPath: active ? CLIP_OPEN : CLIP_CLOSED });
      });

      const goTo = (nextPage: number) => {
        if (isAnimating || nextPage === activePage || pageCount < 2) return;
        isAnimating = true;

        const outgoing = onPage(activePage);
        const incoming = onPage(nextPage);
        const settle = () => {
          setPageState(activePage, false);
          setPageState(nextPage, true);
          activePage = nextPage;
          isAnimating = false;
        };

        const tl = gsap.timeline({ onComplete: settle });

        if (reduceMotion || cards.every((card) => card.splits.length === 0)) {
          tl.to(
            outgoing.map((card) => card.el),
            { autoAlpha: 0, duration: 0.4, ease: 'power2' },
            0
          ).fromTo(
            incoming.map((card) => card.el),
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.4, ease: 'power2' },
            0
          );
          return;
        }

        outgoing.forEach((card) => gsap.set(card.el, { zIndex: 1 }));
        incoming.forEach((card) =>
          gsap.set(card.el, { autoAlpha: 1, pointerEvents: 'auto', zIndex: 2 })
        );
        gsap.set(
          incoming.flatMap((card) => card.lines()),
          { yPercent: 110, force3D: true }
        );

        // Outgoing lines sweep up out of their masks while the portrait irises
        // shut; the incoming set arrives a beat later, so the two never collide.
        outgoing.forEach((card) => {
          tl.to(
            card.lines(),
            {
              yPercent: -110,
              duration: 0.6,
              ease: 'power4.inOut',
              stagger: { amount: 0.25 },
              force3D: true,
            },
            0
          );
          if (card.image) {
            tl.to(card.image, { clipPath: CLIP_CLOSED, duration: 0.9, ease: 'power4.inOut' }, 0);
          }
        });

        incoming.forEach((card) => {
          tl.to(
            card.lines(),
            {
              yPercent: 0,
              duration: 0.7,
              ease: 'power4.inOut',
              stagger: { amount: 0.4 },
              force3D: true,
            },
            0.3
          );
          if (card.image) {
            tl.fromTo(
              card.image,
              { clipPath: CLIP_CLOSED },
              { clipPath: CLIP_OPEN, duration: 1.1, ease: 'power4.inOut' },
              0.3
            );
          }
        });

        tl.set(
          outgoing.map((card) => card.el),
          { autoAlpha: 0 }
        );
      };

      const step = (delta: number) => goTo((activePage + delta + pageCount) % pageCount);

      const onBreakpoint = () => {
        const next = mdQuery.matches ? 2 : 1;
        if (next === perView) return;
        const firstCard = activePage * perView;
        perView = next;
        activePage = Math.floor(firstCard / perView);
        applyPages();
      };

      const onPrev = () => step(-1);
      const onNext = () => step(1);

      // Arrow keys only while the section is on screen, so they don't hijack
      // the page from somewhere else.
      const onKeyDown = (event: KeyboardEvent) => {
        if (!isInView) return;
        const target = event.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.isContentEditable)) return;
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          step(1);
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          step(-1);
        }
      };

      mdQuery.addEventListener('change', onBreakpoint);
      prevBtn?.addEventListener('click', onPrev);
      nextBtn?.addEventListener('click', onNext);
      window.addEventListener('keydown', onKeyDown);

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => (isInView = true),
        onEnterBack: () => (isInView = true),
        onLeave: () => (isInView = false),
        onLeaveBack: () => (isInView = false),
      });

      return () => {
        trigger.kill();
        cards.forEach((card) => card.splits.forEach((split) => split.revert()));
        mdQuery.removeEventListener('change', onBreakpoint);
        prevBtn?.removeEventListener('click', onPrev);
        nextBtn?.removeEventListener('click', onNext);
        window.removeEventListener('keydown', onKeyDown);
      };
    },
    { scope: rootRef, dependencies: [items] }
  );

  return (
    <section
      ref={rootRef}
      data-testimonial-line-sweep
      className={cn('w-full px-5 py-14 md:py-16', className)}
      {...props}
    >
      <div className="mx-auto max-w-[1064px] space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-[#12161f] md:text-5xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto max-w-[550px] text-base text-[#18181b]/60 md:text-lg dark:text-white/60">
            {description}
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 rounded-[20px] bg-white p-5 md:grid-cols-2 md:p-6 dark:bg-[#161b22]">
            {items.map((item, index) => (
              <div
                key={item.name}
                data-testimonial-item
                className={cn(
                  'col-start-1 row-start-1 space-y-5',
                  'motion-reduce:transform-none motion-reduce:transition-none',
                  index % 2 === 0
                    ? 'md:pr-10'
                    : 'md:col-start-2 md:border-l md:border-[#18181b]/10 md:pl-10 dark:md:border-white/10'
                )}
              >
                <div className="space-y-4">
                  <div
                    className="flex items-center gap-x-1.5 text-[#045f64] dark:text-[#c6f56f]"
                    aria-label="5 out of 5 stars"
                  >
                    {Array.from({ length: 5 }, (_, star) => (
                      <StarIcon key={star} className="size-4" />
                    ))}
                  </div>

                  <p
                    data-testimonial-text
                    className="text-base leading-relaxed text-[#18181b]/60 dark:text-white/60"
                  >
                    {item.quoteStart}{' '}
                    <span className="text-[#12161f] dark:text-white">{item.quoteHighlight}</span>{' '}
                    {item.quoteEnd}
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-4 text-center md:items-start md:text-left">
                  <figure className="h-[120px] w-[160px] overflow-hidden rounded-[20px]">
                    <img
                      data-testimonial-img
                      src={item.image}
                      alt={item.imageAlt ?? item.name}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </figure>
                  <div className="space-y-1">
                    <h3
                      data-testimonial-split
                      className="text-sm font-medium text-[#12161f] dark:text-white"
                    >
                      {item.name}
                    </h3>
                    <p
                      data-testimonial-split
                      className="text-xs text-[#18181b]/60 dark:text-white/60"
                    >
                      {item.jobTitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-x-2">
            <button
              type="button"
              data-prev
              aria-label="Previous testimonials"
              className="grid h-8 w-12 cursor-pointer place-items-center rounded-full border border-[#18181b]/10 bg-white text-[#12161f] transition-colors hover:bg-[#f1f3f4] motion-reduce:transition-none dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/10"
            >
              <ArrowIcon direction="left" className="size-4" />
            </button>
            <button
              type="button"
              data-next
              aria-label="Next testimonials"
              className="grid h-8 w-12 cursor-pointer place-items-center rounded-full border border-[#18181b]/10 bg-white text-[#12161f] transition-colors hover:bg-[#f1f3f4] motion-reduce:transition-none dark:border-white/10 dark:bg-[#161b22] dark:text-white dark:hover:bg-white/10"
            >
              <ArrowIcon direction="right" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
