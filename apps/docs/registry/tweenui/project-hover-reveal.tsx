'use client';

import {
  useRef,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const FULL = 'inset(0% 0% 0% 0%)';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isFocusVisible = (el: Element) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

export interface ProjectHoverRevealItem {
  title: string;
  role: string;
  timeline: string;
  year: string;
  team: string;
  image: string;
  href: string;
}

export interface ProjectHoverRevealProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title'
> {
  title?: ReactNode;
  items?: ProjectHoverRevealItem[];
}

const photo = (id: string) => `https://assets.lummi.ai/assets/${id}?auto=format&w=900`;

const DEFAULT_ITEMS: ProjectHoverRevealItem[] = [
  {
    title: 'Northwind',
    role: 'Brand · Product · Motion',
    timeline: '14 Months',
    year: '2025–2026',
    team: 'In-House Studio',
    image: photo('QmS81k18XzrbqKymEVtF63QNybDLVpQkWUY4CDfyYenQtj'),
    href: '#',
  },
  {
    title: 'Kairo Health',
    role: 'Web · Product',
    timeline: '8 Months',
    year: '2025',
    team: 'With the Kairo team',
    image: photo('Qmc4PdY6g9s62pRLzUzhFgfHgUbUvR2UgF71JEKv6iuMYL'),
    href: '#',
  },
  {
    title: 'Lumen',
    role: 'Motion & 3D',
    timeline: '5 Months',
    year: '2025',
    team: 'Studio + Freelance',
    image: photo('QmSRjZYNUygnRZVn8DpnWVdrmXLufPysL88797aebvF5Vv'),
    href: '#',
  },
  {
    title: 'Field Notes',
    role: 'Editorial · Brand',
    timeline: '6 Months',
    year: '2024',
    team: 'In-House Studio',
    image: photo('QmToeVFF7J32X1iakjeULc7rWqxyckLAJ1xvgx6BezrPxi'),
    href: '#',
  },
  {
    title: 'Orbit Analytics',
    role: 'Product · Marketing',
    timeline: '11 Months',
    year: '2024',
    team: 'Orbit Design Team',
    image: photo('QmZUMYMMU4bJYALDuoCLoVjN4hnufnGYJEUosBxvKLJ8mp'),
    href: '#',
  },
];

const FIELDS = [
  ['Role', 'role'],
  ['Timeline', 'timeline'],
  ['Year', 'year'],
  ['Team', 'team'],
] as const;

const ArrowIcon = () => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
};

const ProjectHoverReveal = ({
  title = 'Selected Projects',
  items = DEFAULT_ITEMS,
  className,
  ...props
}: ProjectHoverRevealProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const state = useRef({ active: 0 });

  const rows = () =>
    Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[data-project-row]') ?? []);

  const images = () =>
    Array.from(frameRef.current?.querySelectorAll<HTMLElement>('[data-project-image]') ?? []);

  const fields = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[data-project-field]') ?? []);

  const indexOf = (target: EventTarget | null) => {
    const row = (target as HTMLElement | null)?.closest?.('[data-project-row]');
    return row instanceof HTMLElement ? Number(row.dataset.index) : -1;
  };

  const highlight = (index: number) => {
    rows().forEach((row, i) => {
      row.dataset.active = i === index ? 'true' : 'false';
    });
  };

  // Every project image is mounted and loaded up front, stacked in the one
  // frame. The new one opens as a circle from the edge nearest the row you
  // pointed at, while the old one stays underneath and dims, so the frame
  // never shows an empty gap between projects.
  const swap = (from: number, to: number, animate: boolean) => {
    const all = images();
    const next = all[to];
    const prev = from >= 0 && from !== to ? all[from] : undefined;

    all.forEach((image) => {
      if (image === next || image === prev) return;
      gsap.killTweensOf(image);
      gsap.set(image, { autoAlpha: 0, zIndex: 0 });
    });
    if (!next) return;

    const rest = { clipPath: FULL, scale: 1, filter: 'brightness(1)' };
    if (!animate || !prev) {
      gsap.killTweensOf([next, prev]);
      gsap.set(next, { autoAlpha: 1, zIndex: 2, ...rest });
      if (prev) gsap.set(prev, { autoAlpha: 0, zIndex: 0 });
      return;
    }

    const at = originOf(to);
    gsap.killTweensOf(prev);
    gsap.set(prev, { autoAlpha: 1, zIndex: 1, ...rest });
    gsap.to(prev, { filter: 'brightness(0.55)', duration: 0.8, ease: 'power2.out' });
    gsap.fromTo(
      next,
      { autoAlpha: 1, zIndex: 2, clipPath: `circle(0% at ${at})`, scale: 1.2 },
      {
        clipPath: `circle(150% at ${at})`,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        overwrite: true,
        onComplete: () => {
          gsap.set(next, { clipPath: FULL });
          gsap.set(prev, { autoAlpha: 0, zIndex: 0, filter: 'brightness(1)' });
        },
      }
    );
  };

  // The row's centre projected onto the frame and pinned to its edge: beside
  // the list that is the left edge at the row's height, and when the stage
  // stacks above the list it is the bottom edge.
  const originOf = (index: number) => {
    const frame = frameRef.current;
    const row = rows()[index];
    if (!frame || !row) return '0% 50%';
    const box = frame.getBoundingClientRect();
    const rect = row.getBoundingClientRect();
    if (!box.width || !box.height) return '0% 50%';
    const x = ((rect.left + rect.width / 2 - box.left) / box.width) * 100;
    const y = ((rect.top + rect.height / 2 - box.top) / box.height) * 100;
    const pin = (value: number) => Math.round(Math.min(Math.max(value, 0), 100));
    return `${pin(x)}% ${pin(y)}%`;
  };

  // Each detail rolls in its own masked line, a beat after the one before,
  // in the direction you moved through the list.
  const roll = (from: number, to: number, animate: boolean) => {
    const direction = to > from ? 1 : -1;
    fields().forEach((field, f) => {
      const lines = Array.from(field.querySelectorAll<HTMLElement>('[data-project-value]'));
      const next = lines[to];
      const prev = from >= 0 && from !== to ? lines[from] : undefined;

      lines.forEach((line) => {
        if (animate && line === prev) return;
        gsap.killTweensOf(line);
        gsap.set(line, { autoAlpha: line === next ? 1 : 0, yPercent: 0 });
      });
      if (!animate || !next) return;

      const delay = f * 0.05;
      if (prev) {
        gsap.to(prev, {
          yPercent: -100 * direction,
          autoAlpha: 0,
          duration: 0.4,
          ease: 'power3.inOut',
          delay,
          overwrite: true,
        });
      }
      gsap.fromTo(
        next,
        { yPercent: 100 * direction, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out', delay, overwrite: true }
      );
    });
  };

  const { contextSafe } = useGSAP(
    () => {
      if (!frameRef.current) return;
      state.current.active = 0;
      highlight(0);
      swap(-1, 0, false);
      roll(-1, 0, false);
    },
    { scope: rootRef, dependencies: [items] }
  );

  const activate = contextSafe((index: number) => {
    const s = state.current;
    if (index < 0 || index === s.active) return;
    const animate = !prefersReducedMotion();
    const from = s.active;
    s.active = index;
    highlight(index);
    swap(from, index, animate);
    roll(from, index, animate);
  });

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') activate(indexOf(event.target));
  };

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (isFocusVisible(event.target)) activate(indexOf(event.target));
  };

  return (
    <section
      data-project-hover-reveal
      className={cn('w-full py-12 md:py-16', className)}
      {...props}
    >
      <div className="@container mx-auto w-full max-w-[1100px] px-4">
        <div className="flex items-end justify-between gap-4 border-b border-[#12161F]/15 pb-6 md:pb-8 dark:border-white/15">
          <h2 className="text-4xl leading-[0.95] font-normal tracking-[-0.03em] text-[#12161F] @3xl:text-6xl dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-[#045f64]/70 tabular-nums dark:text-[#9fd4d6]/80">
            {String(items.length).padStart(2, '0')}
          </p>
        </div>

        <div
          ref={rootRef}
          className="grid gap-8 pt-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)] @3xl:gap-12 @3xl:pt-8 @5xl:grid-cols-[minmax(0,1fr)_440px] @5xl:gap-16"
          onPointerMove={onPointerMove}
          onFocus={onFocus}
        >
          <ul className="m-0 list-none self-center p-0">
            {items.map((item, index) => (
              <li
                key={item.href + item.title}
                data-project-row
                data-index={index}
                data-active={index === 0 ? 'true' : 'false'}
                className="group/row relative border-b border-[#12161F]/10 last:border-b-0 dark:border-white/10"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="mt-4 hidden aspect-[4/3] w-full rounded-lg object-cover pointer-coarse:block"
                />
                <a
                  href={item.href}
                  className="flex items-baseline gap-4 py-4 no-underline outline-none after:absolute after:inset-0 after:rounded-sm focus-visible:after:ring-2 focus-visible:after:ring-[#045f64] focus-visible:after:ring-inset @3xl:py-5 dark:focus-visible:after:ring-[#9fd4d6]"
                >
                  <span
                    aria-hidden="true"
                    className="w-7 shrink-0 text-xs text-[#12161F]/35 tabular-nums transition-colors duration-500 group-data-[active=true]/row:text-[#045f64] motion-reduce:transition-none dark:text-white/35 dark:group-data-[active=true]/row:text-[#c6f56f]"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-3xl leading-[1.05] font-normal tracking-[-0.02em] text-[#12161F]/30 transition-[color,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]/row:translate-x-2 group-data-[active=true]/row:text-[#12161F] motion-reduce:transition-none @3xl:text-[40px] @5xl:text-[44px] dark:text-white/30 dark:group-data-[active=true]/row:text-white pointer-coarse:text-[#12161F] dark:pointer-coarse:text-white">
                      {item.title}
                    </span>
                    <span className="sr-only text-sm text-[#12161F]/60 dark:text-white/60 pointer-coarse:not-sr-only">
                      {item.role}, {item.year}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="ml-auto -translate-x-2 self-center text-[#045f64] opacity-0 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[active=true]/row:translate-x-0 group-data-[active=true]/row:opacity-100 motion-reduce:transition-none dark:text-[#c6f56f] pointer-coarse:hidden"
                  >
                    <ArrowIcon />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div aria-hidden="true" className="order-first @3xl:order-none pointer-coarse:hidden">
            <div ref={panelRef}>
              <div
                ref={frameRef}
                className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#0b3b3e] shadow-[0_30px_60px_-30px_rgba(4,47,50,0.55)]"
              >
                {items.map((item) => (
                  <img
                    key={item.href + item.title}
                    data-project-image
                    src={item.image}
                    alt={item.title}
                    decoding="async"
                    className="invisible absolute inset-0 size-full object-cover opacity-0"
                  />
                ))}
              </div>
              <dl className="m-0 mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
                {FIELDS.map(([label, key]) => (
                  <div key={key} data-project-field>
                    <dt className="text-[11px] tracking-[0.14em] text-[#045f64]/70 uppercase dark:text-[#9fd4d6]/70">
                      {label}
                    </dt>
                    <dd className="m-0 mt-2 grid overflow-hidden text-[15px] text-[#12161F] dark:text-white">
                      {items.map((item) => (
                        <span
                          key={item.href + item.title}
                          data-project-value
                          className="invisible truncate opacity-0 [grid-area:1/1]"
                        >
                          {item[key]}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectHoverReveal;
