'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ComponentPropsWithoutRef,
} from 'react';
import type { Swiper as SwiperClass } from 'swiper';
import { cn } from '@/lib/utils';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface TestimonialCardItem {
  /** Stable id used as the React key. */
  id: string;
  /** Card heading above the quote. */
  title: string;
  /** Quote body. */
  quote: string;
  /** Person’s display name. */
  name: string;
  /** Role or title under the name. */
  role: string;
  /** Avatar URL. */
  avatar: string;
  /** Alt text for the avatar. */
  avatarAlt: string;
}

/** Any Swiper option or event. Merged on top of the carousel defaults. */
export type TestimonialSwiperProps = Omit<ComponentProps<typeof Swiper>, 'children'>;

export interface RatingCarouselProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Cards shown in the carousel. Defaults to a 4-card sample. */
  testimonials?: TestimonialCardItem[];
  /** How many cards are visible once the tray is at least 560px wide. Narrower views show 1. Default 2. */
  slidesPerView?: number;
  /**
   * Swiper options and events. Spread over the built-in defaults so speed, loop,
   * autoplay, breakpoints, modules, and the rest stay configurable.
   */
  swiper?: TestimonialSwiperProps;
}

const DEFAULT_TESTIMONIALS: TestimonialCardItem[] = [
  {
    id: 'cash-flow',
    title: 'Improved Cash Flow Management',
    quote:
      'The dashboards are clear, automation saves us hours each week, and our team finally has full visibility into every financial movement.',
    name: 'David K.',
    role: 'CFO',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=faces',
    avatarAlt: 'Portrait of David K.',
  },
  {
    id: 'reporting',
    title: 'Streamlined Financial Reporting',
    quote:
      'We can now generate comprehensive reports in minutes instead of days. Real-time analytics help us make data-driven decisions faster.',
    name: 'Sarah M.',
    role: 'Financial Controller',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&crop=faces',
    avatarAlt: 'Portrait of Sarah M.',
  },
  {
    id: 'budget',
    title: 'Enhanced Budget Planning',
    quote:
      'Budget planning used to live in spreadsheets. We create, track, and adjust budgets in real time, and the forecasting is accurate.',
    name: 'Michael R.',
    role: 'Finance Director',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=faces',
    avatarAlt: 'Portrait of Michael R.',
  },
  {
    id: 'invoices',
    title: 'Automated Invoice Processing',
    quote:
      'We reduced processing time by 80% and eliminated manual errors. The system fits the tools we already use.',
    name: 'Emily T.',
    role: 'Accounts Manager',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=faces',
    avatarAlt: 'Portrait of Emily T.',
  },
];

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 15"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7.25672 0.486272C7.53172 -0.162091 8.46832 -0.162091 8.74332 0.486274L10.3663 4.31303C10.4823 4.58637 10.7445 4.77313 11.0454 4.79678L15.2582 5.12799C15.9719 5.18411 16.2614 6.05763 15.7175 6.51446L12.5079 9.2107C12.2786 9.40331 12.1784 9.70552 12.2485 9.99343L13.2291 14.0249C13.3952 14.7079 12.6375 15.2478 12.0264 14.8818L8.41965 12.7214C8.16202 12.5671 7.83802 12.5671 7.5804 12.7214L3.9736 14.8818C3.3625 15.2478 2.60477 14.7079 2.77091 14.0249L3.75155 9.99343C3.82159 9.70552 3.72147 9.40331 3.49221 9.2107L0.28245 6.51446C-0.261375 6.05763 0.0280544 5.18411 0.741835 5.12799L4.9547 4.79678C5.25561 4.77313 5.51774 4.58637 5.63367 4.31303L7.25672 0.486272Z"
        fill="currentColor"
      />
    </svg>
  );
}

function updateSlideStyles(swiper: SwiperClass) {
  const reduced = prefersReducedMotion();
  const perView = typeof swiper.params.slidesPerView === 'number' ? swiper.params.slidesPerView : 2;
  const activeIndex = swiper.activeIndex;

  swiper.slides.forEach((slide, index) => {
    slide.style.transition = reduced ? 'none' : 'opacity 0.6s ease-out, filter 0.6s ease-out';

    let offset = index - activeIndex;
    if (offset < 0) offset += swiper.slides.length;

    const inView = offset >= 0 && offset < perView;
    slide.style.opacity = inView || reduced ? '1' : '0.3';
    slide.style.filter = inView || reduced ? 'blur(0px)' : 'blur(30px)';
  });
}

export default function RatingCarousel({
  testimonials = DEFAULT_TESTIMONIALS,
  slidesPerView = 2,
  swiper: swiperProps,
  className,
  ...props
}: RatingCarouselProps) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = prefersReducedMotion();
  const count = testimonials.length;
  const perView = Math.max(1, slidesPerView);
  const loop = count > perView;
  const instanceId = useId().replace(/:/g, '');

  const {
    className: swiperClassName,
    modules: extraModules,
    onSwiper,
    autoplay: autoplayOverride,
    speed: speedOverride,
    ...restSwiper
  } = swiperProps ?? {};

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    const onChange = () => {
      updateSlideStyles(swiper);
      setActiveIndex(swiper.realIndex);
    };

    swiper.on('init', onChange);
    swiper.on('slideChangeTransitionStart', onChange);
    swiper.on('slideChange', onChange);
    swiper.on('breakpoint', onChange);
    onChange();

    return () => {
      swiper.off('init', onChange);
      swiper.off('slideChangeTransitionStart', onChange);
      swiper.off('slideChange', onChange);
      swiper.off('breakpoint', onChange);
    };
  }, [perView, count]);

  /**
   * Swiper 14's `slideToLoop` is a no-op once the loop has rearranged its
   * slides, and `slideTo` clamps rather than wrapping — neither can reach the
   * last slide. Stepping is what actually moves a looped carousel, because each
   * step runs `loopFix` first, so the hops before the final one are taken at
   * zero duration and only the last one animates.
   */
  const goTo = (index: number) => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    if (!swiper.params.loop) {
      setActiveIndex(index);
      swiper.slideTo(index);
      return;
    }

    let delta = (((index - swiper.realIndex) % count) + count) % count;
    if (delta * 2 > count) delta -= count;
    if (delta === 0) return;

    const step = (speed?: number) =>
      delta > 0 ? swiper.slideNext(speed) : swiper.slidePrev(speed);
    for (let remaining = Math.abs(delta); remaining > 1; remaining -= 1) step(0);
    step();
  };

  return (
    <section
      data-rating-carousel
      data-active-slide={activeIndex}
      data-slides-per-view={perView}
      className={cn('w-full', className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-[1290px] min-w-0 space-y-8">
        <div
          className="overflow-hidden rounded-3xl bg-[#045f64]/5 p-1 dark:bg-[#045f64]/20"
          onMouseEnter={() => swiperRef.current?.autoplay?.pause()}
          onMouseLeave={() => swiperRef.current?.autoplay?.resume()}
        >
          <Swiper
            grabCursor
            allowTouchMove
            observer
            observeParents
            watchOverflow
            spaceBetween={4}
            loop={loop}
            slidesPerView={1}
            breakpointsBase="container"
            breakpoints={{ 560: { slidesPerView: perView } }}
            {...restSwiper}
            className={cn(
              'w-full min-w-0 cursor-grab select-none active:cursor-grabbing',
              swiperClassName
            )}
            modules={[Autoplay, ...(extraModules ?? [])]}
            speed={reduced ? 0 : (speedOverride ?? 1100)}
            autoplay={
              reduced || count < 2
                ? false
                : (autoplayOverride ?? { delay: 2500, disableOnInteraction: false })
            }
            onSwiper={(instance) => {
              swiperRef.current = instance;
              updateSlideStyles(instance);
              setActiveIndex(instance.realIndex);
              onSwiper?.(instance);
            }}
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.id} className="!h-auto">
                <article
                  data-testimonial-card
                  className="flex h-[260px] flex-col items-start justify-between rounded-[20px] bg-white px-6 py-6 motion-reduce:blur-none md:h-[280px] md:px-7 md:py-7 dark:bg-[#12161F]"
                >
                  <div className="space-y-3">
                    <div className="flex w-[104px] items-center justify-center gap-x-0.5 rounded-[30px] bg-[#045f64]/10 px-2 py-1.5 text-[#045f64] dark:bg-[#045f64]/20 dark:text-[#9fd4d6]">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <StarIcon key={starIndex} className="size-4" />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-medium text-[#12161F] md:text-lg dark:text-white">
                        {item.title}
                      </h3>
                      <p className="line-clamp-3 text-sm leading-relaxed text-[#045f64]/80 dark:text-[#9fd4d6]/80">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex w-full max-w-[240px] items-center gap-x-3 rounded-full bg-[#045f64]/10 py-1.5 pr-5 pl-1.5 dark:bg-[#045f64]/20">
                    <figure className="size-10 overflow-hidden rounded-full md:size-11">
                      <img
                        src={item.avatar}
                        alt={item.avatarAlt}
                        className="size-full object-cover"
                        draggable={false}
                      />
                    </figure>
                    <div>
                      <p className="text-sm font-semibold text-[#045f64] dark:text-[#9fd4d6]">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#045f64]/60 dark:text-[#9fd4d6]/80">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div
          id={`${instanceId}-pagination`}
          className="mx-auto flex h-6 w-fit items-center justify-center gap-2 rounded-[56px] bg-[#045f64] px-3"
        >
          {testimonials.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Go to ${item.name}'s testimonial`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => goTo(index)}
              className={cn(
                'size-2 cursor-pointer rounded-full transition-colors motion-reduce:transition-none',
                'focus-visible:ring-2 focus-visible:ring-[#c6f56f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#045f64] focus-visible:outline-none',
                index === activeIndex ? 'bg-[#c6f56f]' : 'bg-white/35 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
