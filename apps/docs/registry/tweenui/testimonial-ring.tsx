'use client';

import { useId, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent } from 'react';
import { useGSAP } from '@gsap/react';
import NumberFlow from '@number-flow/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface RingMetric {
  value: number;
  prefix?: string;
  suffix?: string;
  /** What the number measures, shown beside it. */
  label: string;
}

export interface RingTestimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  image: string;
  imageAlt?: string;
  metric: RingMetric;
}

export interface TestimonialRingProps extends ComponentPropsWithoutRef<'section'> {
  title?: string;
  testimonials?: RingTestimonial[];
}

/** The ring repeats the testimonials until it has at least this many cards. */
const MIN_CARDS = 10;
/** Degrees of spin for each pixel dragged. */
const DRAG = 0.12;

const portrait = (id: string) =>
  `https://images.unsplash.com/${id}?w=700&h=525&fit=crop&crop=faces&auto=format&q=80`;

const DEFAULT_TESTIMONIALS: RingTestimonial[] = [
  {
    quote:
      'We used to hear about churn in the quarterly review. Now it gets flagged in week two, while the account is still saveable.',
    name: 'Ines Okafor',
    role: 'VP Customer Success',
    company: 'Ledgerly',
    image: portrait('photo-1494790108377-be9c29b29330'),
    metric: { value: 12, prefix: '+', suffix: ' pts', label: 'net revenue retention' },
  },
  {
    quote:
      'It caught a pricing bug on a Sunday night that would have cost us the whole month. Nobody was even looking at that chart.',
    name: 'Tobi Mensah',
    role: 'Head of Revenue Operations',
    company: 'Halden Freight',
    image: portrait('photo-1500648767791-00dcc994a43e'),
    metric: { value: 34, suffix: '%', label: 'fewer stockouts' },
  },
  {
    quote:
      'My Monday starts with one brief instead of nine dashboards. It reads like a sharp analyst wrote it overnight.',
    name: 'Maren Holt',
    role: 'Chief Operating Officer',
    company: 'Mirelab',
    image: portrait('photo-1438761681033-6461ffad8d80'),
    metric: { value: 19, suffix: '%', label: 'faster sample turnaround' },
  },
  {
    quote:
      'Our crews used to drive to sites that were fine. Now every visit starts with a reason and a part number.',
    name: 'Elif Arslan',
    role: 'Director of Field Operations',
    company: 'Solvane Energy',
    image: portrait('photo-1534528741775-53994a69daeb'),
    metric: { value: 28, suffix: '%', label: 'fewer wasted truck rolls' },
  },
  {
    quote: 'We see the bad afternoon coming at breakfast now. That is the whole difference.',
    name: 'Callum Reyes',
    role: 'Head of Ground Operations',
    company: 'Aerowin',
    image: portrait('photo-1507003211169-0a1dd7228f2d'),
    metric: { value: 3, suffix: ' hrs', label: 'earlier view of staffing gaps' },
  },
  {
    quote: 'Finance and engineering finally look at the same story, written once for both of us.',
    name: 'Noor Haddad',
    role: 'VP Finance',
    company: 'Corvid Cloud',
    image: portrait('photo-1573496359142-b8d87734a5a2'),
    metric: { value: 17, suffix: '%', label: 'lower spend per customer' },
  },
];

const metricText = ({ prefix = '', value, suffix = '' }: RingMetric) =>
  `${prefix}${value}${suffix}`;

const arrowButton = cn(
  'grid size-12 place-items-center rounded-full border border-[#9fd4d6]/24 text-[#e8f3f2]',
  'transition-colors duration-300 hover:border-[#e8f3f2] hover:bg-[#e8f3f2] hover:text-[#03110f]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6f56f]',
  'motion-reduce:transition-none'
);

function Arrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5', flip && 'rotate-180')}
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export default function TestimonialRing({
  title = 'In their own words.',
  testimonials = DEFAULT_TESTIMONIALS,
  className,
  onKeyDown,
  ...props
}: TestimonialRingProps) {
  const count = testimonials.length;
  const repeat = Math.max(2, Math.ceil(MIN_CARDS / Math.max(1, count)));
  const slots = Array.from({ length: count * repeat }, (_, i) => testimonials[i % count]);

  // `active` is the card in front (the metric rolls to it at once); `shown` is the text on
  // screen, which only changes while it is faded out.
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const floorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const goRef = useRef<(direction: number) => void>(() => {});
  const chipRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleId = useId();

  useGSAP(
    () => {
      const section = rootRef.current;
      const stage = stageRef.current;
      const ring = ringRef.current;
      const floor = floorRef.current;
      if (!section || !stage || !ring || !count) return;

      const cards = Array.from(ring.querySelectorAll<HTMLElement>('[data-ring-card]'));
      const shades = cards.map((card) => card.querySelector<HTMLElement>('[data-ring-shade]'));
      const texts = Array.from(
        textRef.current?.querySelectorAll<HTMLElement>('[data-ring-text]') ?? []
      );
      const animate = !prefersReducedMotion();
      const total = cards.length;
      const step = 360 / total;
      const state = { drag: 0, scroll: 0, current: 0 };
      let radius = 0;
      let front = 0;
      let swap: gsap.core.Timeline | null = null;

      const layout = () => {
        const width = cards[0]?.offsetWidth ?? 0;
        radius = (width / 2 / Math.tan(((step / 2) * Math.PI) / 180)) * 1.1;
        cards.forEach((card, i) => {
          card.style.transform = `translate(-50%, -50%) rotateY(${-i * step}deg) translateZ(${-radius}px)`;
        });
      };

      /** Where a slot sits on the ring right now, -180..180 with 0 facing the viewer. */
      const angleOf = (slot: number) =>
        ((((-slot * step + state.current) % 360) + 540) % 360) - 180;

      const bringForward = (index: number) => {
        setActive(index);
        swap?.kill();
        if (!animate) {
          setShown(index);
          return;
        }
        swap = gsap
          .timeline()
          .to(texts, {
            autoAlpha: 0,
            y: -14,
            filter: 'blur(6px)',
            duration: 0.25,
            ease: 'power2.in',
            stagger: 0.04,
          })
          .call(() => setShown(index))
          .fromTo(
            texts,
            { autoAlpha: 0, y: 18, filter: 'blur(6px)' },
            {
              autoAlpha: 1,
              y: 0,
              filter: 'blur(0px)',
              duration: 0.7,
              ease: 'expo.out',
              stagger: 0.04,
              clearProps: 'filter',
            }
          );
      };

      const render = () => {
        const target = state.drag + state.scroll;
        state.current += (target - state.current) * (animate ? 0.09 : 1);
        ring.style.transform = `translateZ(${radius - 180}px) rotateY(${state.current}deg)`;
        if (floor) floor.style.backgroundPosition = `${state.current * 7}px 0`;

        cards.forEach((card, i) => {
          const angle = angleOf(i);
          const shade = shades[i];
          if (shade) shade.style.opacity = String(Math.min(1, Math.abs(angle) / 80) * 0.7);
          card.style.visibility = Math.abs(angle) > 100 ? 'hidden' : 'visible';
        });

        const next = (((Math.round(state.current / step) % total) + total) % total) % count;
        if (next !== front) {
          front = next;
          bringForward(front);
        }
      };

      const spinTo = (drag: number, duration = 1) => {
        gsap.to(state, {
          drag,
          duration: animate ? duration : 0,
          ease: 'expo.out',
          overwrite: true,
        });
        if (!animate) render();
      };

      const snap = (velocity = 0) => {
        const projected = state.drag + state.scroll + velocity;
        spinTo(Math.round(projected / step) * step - state.scroll);
      };

      goRef.current = (direction) =>
        spinTo(Math.round((state.drag + direction * step) / step) * step);

      let pointerX = 0;
      let startDrag = 0;
      let lastX = 0;
      let lastT = 0;
      let velocity = 0;
      let dragging = false;
      let moved = false;

      const onDown = (event: PointerEvent) => {
        dragging = true;
        moved = false;
        pointerX = lastX = event.clientX;
        lastT = performance.now();
        startDrag = state.drag;
        velocity = 0;
        gsap.killTweensOf(state);
        stage.setPointerCapture?.(event.pointerId);
      };

      const onMove = (event: PointerEvent) => {
        if (!dragging) return;
        const dx = event.clientX - pointerX;
        if (Math.abs(dx) > 4) moved = true;
        state.drag = startDrag - dx * DRAG;
        const now = performance.now();
        velocity = ((event.clientX - lastX) / Math.max(1, now - lastT)) * 16;
        lastX = event.clientX;
        lastT = now;
        if (!animate) render();
      };

      const onUp = (event: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        stage.releasePointerCapture?.(event.pointerId);
        if (!moved) {
          // Pointer capture retargets the release to the stage, so find the card under it
          const hit = document.elementFromPoint?.(event.clientX, event.clientY);
          const card = hit?.closest<HTMLElement>('[data-ring-card]');
          if (card) spinTo(state.drag - angleOf(Number(card.dataset.slot)), 1.1);
          return;
        }
        snap(-velocity * DRAG * 8);
      };

      stage.addEventListener('pointerdown', onDown);
      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerup', onUp);
      stage.addEventListener('pointercancel', onUp);

      const observer = new ResizeObserver(layout);
      observer.observe(stage);
      layout();
      render();

      let ticking = false;
      let settle = 0;
      const startTicking = (on: boolean) => {
        if (on === ticking) return;
        ticking = on;
        if (on) gsap.ticker.add(render);
        else gsap.ticker.remove(render);
      };

      // Scrolling the section through the viewport turns the ring by three cards. The turn
      // is counted from where the page sat on load, so the first card always starts in
      // front, even when the section loads already halfway up the screen.
      let base = 0;
      let scrolled = false;
      const onScroll = () => {
        scrolled = true;
      };
      window.addEventListener('scroll', onScroll, { once: true, passive: true });
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onRefresh: (self) => {
          if (!scrolled) base = self.progress;
        },
        onUpdate: (self) => {
          if (!animate || !scrolled) return;
          state.scroll = (self.progress - base) * step * 3;
          window.clearTimeout(settle);
          settle = window.setTimeout(() => {
            if (!dragging) snap();
          }, 260);
        },
        onToggle: (self) => startTicking(self.isActive),
      });
      base = trigger.progress;
      if (animate) startTicking(trigger.isActive);

      return () => {
        window.removeEventListener('scroll', onScroll);
        window.clearTimeout(settle);
        startTicking(false);
        trigger.kill();
        observer.disconnect();
        swap?.kill();
        gsap.killTweensOf(state);
        stage.removeEventListener('pointerdown', onDown);
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerup', onUp);
        stage.removeEventListener('pointercancel', onUp);
        goRef.current = () => {};
      };
    },
    { scope: rootRef, dependencies: [testimonials, slots.length] }
  );

  // The drag chip: a lime plate that trails a mouse over the cards, squeezes when you grab,
  // and leans like jelly into the way it is moving. Mouse only, never under reduced motion.
  useGSAP(
    () => {
      const section = rootRef.current;
      const stage = stageRef.current;
      const chip = chipRef.current;
      const pop = popRef.current;
      const blob = blobRef.current;
      const label = labelRef.current;
      if (!section || !stage || !chip || !pop || !blob || !label) return;
      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (!fine || prefersReducedMotion()) return;

      const arrows = Array.from(label.querySelectorAll<SVGElement>('[data-chip-arrow]'));
      const word = label.querySelector<HTMLElement>('[data-chip-word]');
      chip.dataset.on = '';
      stage.dataset.chipOn = '';
      gsap.set(pop, { xPercent: -50, yPercent: -50, scale: 0, rotate: -12 });

      const xTo = gsap.quickTo(chip, 'x', { duration: 0.45, ease: 'power3.out' });
      const yTo = gsap.quickTo(chip, 'y', { duration: 0.45, ease: 'power3.out' });
      const client = { x: 0, y: 0 };
      const press = { v: 1 };
      let inside = false;
      let pressed = false;
      let breathe: gsap.core.Tween | null = null;

      const local = () => {
        const box = section.getBoundingClientRect();
        return [client.x - box.left, client.y - box.top] as const;
      };
      const follow = () => {
        const [x, y] = local();
        xTo(x);
        yTo(y);
      };

      // While hovering, the arrows breathe outward as a hint that the ring can be dragged
      const setBreathing = (on: boolean) => {
        breathe?.kill();
        breathe = on
          ? gsap.fromTo(
              arrows,
              { x: 0 },
              {
                x: (i) => (i === 0 ? -4 : 4),
                duration: 0.7,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                delay: 0.4,
              }
            )
          : null;
        if (!on && !pressed) gsap.to(arrows, { x: 0, duration: 0.3, overwrite: true });
      };

      let visible = false;
      const show = (on: boolean) => {
        if (on === visible) return;
        visible = on;
        if (on) {
          stage.dataset.chipOver = '';
          // Appear right at the pointer, rather than flying over from where it last hid
          const [x, y] = local();
          gsap.set(chip, { x, y });
          xTo(x);
          yTo(y);
        } else {
          delete stage.dataset.chipOver;
        }
        gsap.to(
          pop,
          on
            ? { scale: 1, rotate: 0, duration: 0.8, ease: 'elastic.out(1, 0.55)', overwrite: true }
            : { scale: 0, rotate: 12, duration: 0.3, ease: 'power3.in', overwrite: true }
        );
        setBreathing(on && !pressed);
      };

      // Only a card calls the chip up: the floor, the gaps and the reflections keep the
      // grab cursor. Once you are holding the ring it stays, wherever the pointer drifts.
      const overCard = () =>
        !!document.elementFromPoint?.(client.x, client.y)?.closest('[data-ring-card]');
      const check = () => show(pressed || (inside && overCard()));

      const isMouse = (event: PointerEvent) => event.pointerType === 'mouse';

      const onEnter = (event: PointerEvent) => {
        if (!isMouse(event)) return;
        inside = true;
        client.x = event.clientX;
        client.y = event.clientY;
        check();
      };

      const onLeave = (event: PointerEvent) => {
        if (!isMouse(event) || pressed) return;
        inside = false;
        check();
      };

      const onMove = (event: PointerEvent) => {
        if (!isMouse(event)) return;
        client.x = event.clientX;
        client.y = event.clientY;
        follow();
        check();
      };

      const onDown = (event: PointerEvent) => {
        if (!isMouse(event)) return;
        pressed = true;
        check();
        setBreathing(false);
        gsap.to(press, { v: 0.82, duration: 0.25, ease: 'power3.out', overwrite: true });
        gsap.to(arrows, {
          x: (i) => (i === 0 ? -7 : 7),
          duration: 0.35,
          ease: 'back.out(3)',
          overwrite: true,
        });
        if (word) word.textContent = 'Spin';
      };

      const onUp = (event: PointerEvent) => {
        if (!pressed) return;
        pressed = false;
        gsap.to(press, { v: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)', overwrite: true });
        if (word) word.textContent = 'Drag';
        // The drag may have ended outside the stage; the capture kept the leave from firing
        client.x = event.clientX;
        client.y = event.clientY;
        const hit = document.elementFromPoint?.(event.clientX, event.clientY);
        inside = !!hit && stage.contains(hit);
        check();
      };

      const onScroll = () => {
        if (inside) follow();
      };

      // Jelly: the plate leans into the way it is moving and stretches with its speed,
      // while the label stays upright on top
      let lastX = 0;
      let lastY = 0;
      let lean = 0;
      let stretchX = 0;
      let stretchY = 0;
      const jelly = () => {
        // The ring can turn under a still pointer (scroll, inertia), so re-check every frame
        if (inside && !pressed) check();
        const x = Number(gsap.getProperty(chip, 'x'));
        const y = Number(gsap.getProperty(chip, 'y'));
        const dx = x - lastX;
        const dy = y - lastY;
        lastX = x;
        lastY = y;
        if (!visible && Math.abs(lean) < 0.05 && stretchX < 0.005 && stretchY < 0.005) return;
        lean += (gsap.utils.clamp(-14, 14, -dx * 0.6) - lean) * 0.25;
        stretchX += (Math.min(Math.abs(dx) / 50, 0.3) - stretchX) * 0.25;
        stretchY += (Math.min(Math.abs(dy) / 60, 0.2) - stretchY) * 0.25;
        gsap.set(blob, {
          skewX: lean,
          scaleX: (1 + stretchX - stretchY * 0.5) * press.v,
          scaleY: (1 + stretchY - stretchX * 0.4) * press.v,
        });
      };
      gsap.ticker.add(jelly);

      stage.addEventListener('pointerenter', onEnter);
      stage.addEventListener('pointerleave', onLeave);
      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerdown', onDown);
      stage.addEventListener('pointerup', onUp);
      stage.addEventListener('pointercancel', onUp);
      window.addEventListener('scroll', onScroll, { passive: true });

      return () => {
        gsap.ticker.remove(jelly);
        breathe?.kill();
        gsap.killTweensOf([pop, press, ...arrows]);
        stage.removeEventListener('pointerenter', onEnter);
        stage.removeEventListener('pointerleave', onLeave);
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerdown', onDown);
        stage.removeEventListener('pointerup', onUp);
        stage.removeEventListener('pointercancel', onUp);
        window.removeEventListener('scroll', onScroll);
        delete chip.dataset.on;
        delete stage.dataset.chipOn;
        delete stage.dataset.chipOver;
      };
    },
    { scope: rootRef }
  );

  const onKeys = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      goRef.current(event.key === 'ArrowLeft' ? -1 : 1);
    }
  };

  const current = testimonials[shown % Math.max(1, count)];
  const metric = testimonials[active % Math.max(1, count)]?.metric;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-labelledby={titleId}
      onKeyDown={onKeys}
      className={cn(
        '@container relative isolate w-full overflow-hidden bg-[#03110f] py-16 text-[#e8f3f2] md:py-24',
        '[--card:clamp(13rem,27cqw,26rem)]',
        className
      )}
      {...props}
    >
      <div className="mx-auto flex w-full max-w-[1320px] items-end justify-between gap-8 px-5 sm:px-8">
        <h2
          id={titleId}
          className="max-w-[12ch] text-[clamp(2.25rem,5cqw,4rem)] leading-[0.95] font-bold tracking-[-0.04em] text-[#e8f3f2]"
        >
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label="Previous testimonial"
            className={arrowButton}
            onClick={() => goRef.current(-1)}
          >
            <Arrow />
          </button>
          <button
            type="button"
            aria-label="Next testimonial"
            className={arrowButton}
            onClick={() => goRef.current(1)}
          >
            <Arrow flip />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        aria-hidden="true"
        className="relative mt-6 h-[clamp(22rem,46cqw,38rem)] cursor-grab touch-pan-y select-none [perspective:900px] active:cursor-grabbing data-chip-over:cursor-none data-chip-over:active:cursor-none @3xl:[perspective:1150px]"
      >
        <div
          ref={floorRef}
          className="pointer-events-none absolute top-[72%] left-1/2 h-[150%] w-[300%] origin-top [transform:translateX(-50%)_rotateX(78deg)] [background-image:linear-gradient(rgb(159_212_214/0.18)_1px,transparent_1px),linear-gradient(90deg,rgb(159_212_214/0.18)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,#000_0%,transparent_55%)] [background-size:96px_96px]"
        />
        <div ref={ringRef} className="absolute top-[42%] left-1/2 [transform-style:preserve-3d]">
          {slots.map((item, i) => (
            <figure
              key={`${item.name}-${i}`}
              data-ring-card=""
              data-slot={i}
              className="group absolute top-0 left-0 w-(--card) [backface-visibility:hidden]"
            >
              <div className="relative overflow-hidden border border-[#9fd4d6]/12 bg-[#071d1b] [-webkit-box-reflect:below_14px_linear-gradient(transparent_62%,rgb(0_0_0/0.28))]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.imageAlt ?? ''}
                    draggable={false}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-[scale] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 motion-reduce:transition-none"
                  />
                </div>
                <figcaption className="flex items-end justify-between gap-4 p-4 @3xl:p-5">
                  <div className="min-w-0">
                    <p className="truncate text-lg leading-tight font-bold text-[#e8f3f2]">
                      {item.company}
                    </p>
                    <p className="truncate text-xs text-[#9fd4d6]/70">{item.name}</p>
                  </div>
                  <p className="shrink-0 text-2xl font-bold tracking-[-0.03em] text-[#c6f56f]">
                    {metricText(item.metric)}
                  </p>
                </figcaption>
                <span
                  data-ring-shade=""
                  className="pointer-events-none absolute inset-0 bg-[#03110f]"
                  style={{ opacity: 0 }}
                />
              </div>
            </figure>
          ))}
        </div>
      </div>

      <div
        ref={chipRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-20 hidden data-on:block motion-reduce:hidden"
      >
        <div ref={popRef} className="relative grid h-14 w-28 place-items-center">
          <span
            ref={blobRef}
            className="absolute inset-0 rounded-2xl bg-[#c6f56f] shadow-[0_0_40px_rgb(198_245_111/0.35)]"
          />
          <span
            ref={labelRef}
            className="relative flex items-center gap-1 text-[13px] font-semibold tracking-tight text-[#03110f]"
          >
            <svg
              data-chip-arrow=""
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span data-chip-word="">Drag</span>
            <svg
              data-chip-arrow=""
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </div>
      </div>

      {current && (
        <div
          ref={textRef}
          className="relative mx-auto mt-4 grid w-full max-w-[1320px] grid-cols-1 gap-10 px-5 sm:px-8 @3xl:grid-cols-12 @3xl:items-end"
        >
          <blockquote className="@3xl:col-span-8">
            <p
              aria-live="polite"
              data-ring-text=""
              className="max-w-[30ch] text-[clamp(1.5rem,2.6cqw,2.75rem)] leading-[1.1] font-medium tracking-[-0.025em] text-[#e8f3f2]"
            >
              &ldquo;{current.quote}&rdquo;
            </p>
          </blockquote>
          <div className="flex flex-col gap-6 @3xl:col-span-4 @3xl:items-end @3xl:text-right">
            <div data-ring-text="">
              <p className="font-medium text-[#e8f3f2]">{current.name}</p>
              <p className="text-sm text-[#9fd4d6]/70">
                {current.role}, {current.company}
              </p>
            </div>
            {metric && (
              <div className="flex items-center gap-3 @3xl:flex-row-reverse">
                <NumberFlow
                  value={metric.value}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                  className="text-[clamp(2.5rem,4.5cqw,4.5rem)] leading-none font-extrabold tracking-[-0.04em] text-[#c6f56f]"
                  transformTiming={{ duration: 1200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  spinTiming={{ duration: 1200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  animated={!prefersReducedMotion()}
                />
                <span data-ring-text="" className="max-w-[16ch] text-sm text-[#9fd4d6]/70">
                  {current.metric.label}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
