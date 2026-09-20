'use client';

import { useRef, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import CustomEase from 'gsap/CustomEase';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, CustomEase);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DURATION = 1.15;
const AUTO_DELAY = 4;
const FROM_SCALE = 1.1;
const EMPTY_CLIP = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';

/** The wipe edge, travelling down from the top or up from the bottom. */
const clipPolygon = (progress: number, fromTop: boolean) => {
  const edge = progress * 100;
  return fromTop
    ? `polygon(0% 0%, 100% 0%, 100% ${edge}%, 0% ${edge}%)`
    : `polygon(0% ${100 - edge}%, 100% ${100 - edge}%, 100% 100%, 0% 100%)`;
};

export interface TabWipeSlide {
  /** Full-bleed image for the stage. */
  image: string;
  /** Alt text, also the slide key and the tab's label. */
  alt: string;
  /** Thumbnail for the tab strip. Falls back to `image`. */
  tabImage?: string;
}

export interface TabWipeProps extends ComponentPropsWithoutRef<'section'> {
  /** Slides in the stage. The tab strip mirrors this list. */
  slides?: TabWipeSlide[];
}

const SHOT = (id: string) => `https://images.unsplash.com/${id}?w=1200&h=750&fit=crop`;

const DEFAULT_SLIDES: TabWipeSlide[] = [
  { image: SHOT('photo-1551650975-87deedd944c3'), alt: 'Workflow board' },
  { image: SHOT('photo-1460925895917-afdab827c52f'), alt: 'Performance dashboard' },
  { image: SHOT('photo-1552664730-d307ca884978'), alt: 'Team planning session' },
];

export default function TabWipe({ slides = DEFAULT_SLIDES, className, ...props }: TabWipeProps) {
  const rootRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLImageElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useGSAP(
    () => {
      const slideEls = slideRefs.current.filter(Boolean) as HTMLDivElement[];
      const mediaEls = mediaRefs.current.filter(Boolean) as HTMLImageElement[];
      const tabEls = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
      if (slideEls.length === 0) return;

      const ease = CustomEase.get('tab-wipe') || CustomEase.create('tab-wipe', '0.625, 0.05, 0, 1');

      let current = 0;
      let isAnimating = false;
      let autoCall: gsap.core.Tween | undefined;

      const setTabState = (index: number) => {
        tabEls.forEach((tab, i) => {
          const selected = i === index;
          tab.dataset.state = selected ? 'selected' : '';
          tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
      };

      const resetSlide = (index: number, visible: boolean) => {
        gsap.set(slideEls[index], {
          zIndex: visible ? 1 : 0,
          clipPath: visible ? 'none' : EMPTY_CLIP,
        });
        gsap.set(mediaEls[index], { scale: 1, yPercent: 0, force3D: true });
      };

      const applyInstant = (next: number) => {
        slideEls.forEach((_, i) => resetSlide(i, i === next));
        current = next;
        setTabState(current);
      };

      const restartAuto = () => {
        autoCall?.kill();
        autoCall = gsap.delayedCall(AUTO_DELAY, () => goTo((current + 1) % slideEls.length, true));
      };

      const goTo = (next: number, fromAuto = false) => {
        if (isAnimating || next === current || next < 0 || next >= slideEls.length) return;

        autoCall?.kill();

        if (prefersReducedMotion()) {
          applyInstant(next);
          restartAuto();
          return;
        }

        const incoming = slideEls[next];
        const outgoing = slideEls[current];
        const incomingMedia = mediaEls[next];
        const outgoingMedia = mediaEls[current];
        // Auto-advance always wipes downward; a tab click wipes toward the tab.
        const fromTop = fromAuto || next > current;
        const drift = fromTop ? -8 : 8;

        isAnimating = true;
        const outgoingIndex = current;
        current = next;
        setTabState(current);

        gsap.set(outgoing, { zIndex: 1, clipPath: 'none' });
        gsap.set(incoming, { zIndex: 2, clipPath: clipPolygon(0, fromTop) });
        gsap.set(incomingMedia, { scale: FROM_SCALE, yPercent: drift, force3D: true });
        gsap.set(outgoingMedia, { scale: 1, yPercent: 0, force3D: true });

        const proxy = { p: 0 };
        gsap
          .timeline({
            defaults: { duration: DURATION, ease },
            onComplete: () => {
              resetSlide(next, true);
              resetSlide(outgoingIndex, false);
              isAnimating = false;
              restartAuto();
            },
          })
          .to(
            proxy,
            {
              p: 1,
              onUpdate: () => gsap.set(incoming, { clipPath: clipPolygon(proxy.p, fromTop) }),
            },
            0
          )
          .to(incomingMedia, { scale: 1, yPercent: 0 }, 0)
          .to(outgoingMedia, { scale: FROM_SCALE, yPercent: -drift * 0.4 }, 0);
      };

      slideEls.forEach((_, i) => resetSlide(i, i === 0));
      setTabState(0);

      const handlers = tabEls.map((tab, index) => {
        const onClick = () => goTo(index);
        tab.addEventListener('click', onClick);
        return { tab, onClick };
      });

      restartAuto();

      return () => {
        autoCall?.kill();
        handlers.forEach(({ tab, onClick }) => tab.removeEventListener('click', onClick));
      };
    },
    { scope: rootRef, dependencies: [slides.length] }
  );

  return (
    <section
      ref={rootRef}
      data-tab-wipe
      className={cn('w-full px-5 py-14 md:py-16', className)}
      {...props}
    >
      <div className="mx-auto w-full max-w-[720px] space-y-4">
        <div className="rounded-[20px] border border-white/60 bg-white/40 p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] backdrop-blur-[34px] dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <figure className="relative aspect-16/10 w-full overflow-hidden rounded-2xl">
            {slides.map((slide, index) => (
              <div
                key={slide.alt}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                data-tab-wipe-slide
                className={cn('absolute inset-0 overflow-hidden', index === 0 && 'z-[1]')}
                style={index === 0 ? undefined : { clipPath: EMPTY_CLIP }}
              >
                <img
                  ref={(node) => {
                    mediaRefs.current[index] = node;
                  }}
                  src={slide.image}
                  alt={slide.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="size-full object-cover"
                />
              </div>
            ))}
          </figure>
        </div>

        <div
          role="tablist"
          aria-label="Choose a screen"
          className="flex h-[110px] w-full items-center gap-x-1.5 rounded-xl border border-white/60 p-2 dark:border-white/10"
        >
          {slides.map((slide, index) => (
            <button
              key={`${slide.alt}-tab`}
              type="button"
              role="tab"
              aria-label={slide.alt}
              aria-selected={index === 0}
              data-state={index === 0 ? 'selected' : ''}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              className="relative size-full flex-1 cursor-pointer overflow-hidden rounded-md after:absolute after:inset-0 after:bg-white/60 after:opacity-100 after:transition-opacity after:duration-300 after:content-[''] data-[state=selected]:after:opacity-0 motion-reduce:after:transition-none dark:after:bg-black/50"
            >
              <img
                src={slide.tabImage ?? slide.image}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
