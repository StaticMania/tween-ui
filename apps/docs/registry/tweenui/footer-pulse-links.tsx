'use client';

import { useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export type FooterPulseSocialIcon = 'x' | 'instagram' | 'linkedin' | 'dribbble' | 'github';

export interface FooterPulseLink {
  label: string;
  href: string;
}

export interface FooterPulseColumn {
  heading: string;
  links: FooterPulseLink[];
}

export interface FooterPulseSocial {
  label: string;
  href: string;
  icon: FooterPulseSocialIcon;
}

export interface FooterPulseLinksProps extends ComponentPropsWithoutRef<'footer'> {
  brand?: string;
  logo?: ReactNode;
  description?: string;
  columns?: FooterPulseColumn[];
  socials?: FooterPulseSocial[];
  legal?: FooterPulseLink[];
  copyright?: string;
}

const REPO = 'https://github.com/StaticMania/tween-ui';

const DEFAULT_COLUMNS: FooterPulseColumn[] = [
  {
    heading: 'Components',
    links: [
      { label: 'All components', href: '/components' },
      { label: 'Icon Trail Button', href: '/component/icon-trail-button' },
      { label: 'Sliding Tabs', href: '/component/sliding-tabs' },
      { label: 'Number Counter', href: '/component/number-counter' },
    ],
  },
  {
    heading: 'Blocks',
    links: [
      { label: 'All blocks', href: '/components#blocks' },
      { label: 'Kinetic Type Ring', href: '/block/kinetic-type-ring' },
      { label: 'Pricing Plan Switch', href: '/block/pricing-plan-switch' },
      { label: 'Shutter Slider', href: '/block/shutter-slider' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'GitHub', href: REPO },
      { label: 'Report an issue', href: `${REPO}/issues` },
    ],
  },
];

const DEFAULT_SOCIALS: FooterPulseSocial[] = [{ label: 'GitHub', href: REPO, icon: 'github' }];

const DEFAULT_LEGAL: FooterPulseLink[] = [
  { label: 'MIT License', href: `${REPO}/blob/main/LICENSE` },
  { label: 'Changelog', href: `${REPO}/blob/main/CHANGELOG.md` },
  { label: 'Contributing', href: `${REPO}/blob/main/CONTRIBUTING.md` },
];

const TWEEN_MARK = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7">
    <rect width="24" height="24" rx="6" fill="#045f64" />
    <path
      d="M5 19 C 9.5 8.9, 5 5, 19 5"
      fill="none"
      stroke="#c6f56f"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="19" cy="5" r="1.8" fill="#c6f56f" />
  </svg>
);

const EASE_OUT = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

const EASE_ROLL = 'ease-[cubic-bezier(0.45,0,0.15,1)]';

const focusRing =
  'rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6f56f]';

const SOCIAL_PATHS: Record<FooterPulseSocialIcon, ReactNode> = {
  x: (
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  ),
  instagram: (
    <>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </>
  ),
  linkedin: (
    <>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </>
  ),
  dribbble: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
      <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
      <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
    </>
  ),
  github: (
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </>
  ),
};

const isExternal = (href: string) => /^https?:/.test(href);

const externalProps = (href: string) =>
  isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

const RollLabel = ({ label }: { label: string }) => {
  return (
    <>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="inline-flex h-[1.25em] overflow-hidden leading-[1.25em]">
        {Array.from(label).map((char, index) => (
          <span
            key={`${char}-${index}`}
            data-char={char}
            className={cn(
              'relative inline-block whitespace-pre transition-[translate] duration-700',
              EASE_ROLL,
              'after:absolute after:top-full after:left-0 after:text-[#c6f56f] after:content-[attr(data-char)]',
              'group-hover/link:-translate-y-full group-focus-visible/link:-translate-y-full',
              'motion-reduce:transition-none'
            )}
            style={{ transitionDelay: `${index * 22}ms` }}
          >
            {char}
          </span>
        ))}
      </span>
    </>
  );
};

const PulseUnderline = () => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 -bottom-1.5 h-2 w-full overflow-visible"
    >
      <path
        d="M0 5 H40 L45 1 L51 9 L56 5 H100"
        fill="none"
        stroke="#c6f56f"
        strokeWidth="1.4"
        strokeLinejoin="round"
        pathLength={1}
        className={cn(
          'transition-[stroke-dashoffset] duration-900 [stroke-dasharray:1_2] [stroke-dashoffset:1]',
          EASE_ROLL,
          'group-hover/link:[stroke-dashoffset:0] group-focus-visible/link:[stroke-dashoffset:0]',
          'motion-reduce:transition-none'
        )}
      />
    </svg>
  );
};

const PulseLink = ({ link, className }: { link: FooterPulseLink; className?: string }) => {
  return (
    <a
      href={link.href}
      {...externalProps(link.href)}
      className={cn('group/link relative inline-flex whitespace-nowrap', focusRing, className)}
    >
      <RollLabel label={link.label} />
      <PulseUnderline />
    </a>
  );
};

const LinkGroup = ({ column }: { column: FooterPulseColumn }) => {
  const headingId = useId();

  return (
    <div className="grid content-start gap-4">
      <p id={headingId} className="text-xs tracking-[0.14em] text-[#9fd4d6]/60 uppercase">
        {column.heading}
      </p>
      <ul aria-labelledby={headingId} className="grid justify-items-start gap-3">
        {column.links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <PulseLink link={link} className="text-[15px] text-[#e8f3f2]/85" />
          </li>
        ))}
      </ul>
    </div>
  );
};

const LIFT_SETTLE_MS = 160;

const followPointer = (mark: HTMLElement, letters: HTMLElement[]) => {
  const lifts = letters.map(() => 0);
  const tilts = letters.map(() => 0);
  const pointer = { x: 0, y: 0, isInside: false };
  let centers: { x: number; y: number }[] = [];
  let frame = 0;
  let lastTime = 0;

  const measure = () => {
    centers = letters.map((letter) => ({
      x: letter.offsetLeft + letter.offsetWidth / 2,
      y: letter.offsetTop + letter.offsetHeight / 2,
    }));
  };

  const tick = (time: number) => {
    frame = 0;
    const elapsed = lastTime ? Math.min(64, time - lastTime) : 16;
    lastTime = time;
    const blend = 1 - Math.exp(-elapsed / LIFT_SETTLE_MS);
    if (centers.length !== letters.length) measure();

    const size = parseFloat(getComputedStyle(mark).fontSize) || 120;
    const maxLift = Math.min(70, size * 0.18);
    const radius = size * 1.9 + 170;
    const origin = mark.getBoundingClientRect();
    let isMoving = false;

    letters.forEach((letter, index) => {
      const center = centers[index] ?? { x: 0, y: 0 };
      const dx = pointer.x - (origin.left + center.x);
      const dy = pointer.y - (origin.top + center.y);
      const reach = pointer.isInside ? Math.max(0, 1 - Math.hypot(dx, dy) / radius) : 0;
      const eased = reach * reach * (3 - 2 * reach);
      const side = Math.max(-1, Math.min(1, dx / (radius * 0.35)));
      const lift = (lifts[index] ?? 0) + (eased * maxLift - (lifts[index] ?? 0)) * blend;
      const tilt = (tilts[index] ?? 0) + (-side * eased * 4.5 - (tilts[index] ?? 0)) * blend;
      if (Math.abs(eased * maxLift - lift) > 0.05 || Math.abs(-side * eased * 4.5 - tilt) > 0.01) {
        isMoving = true;
      }
      lifts[index] = lift;
      tilts[index] = tilt;
      letter.style.transform = `translate3d(0, ${(-lift).toFixed(3)}px, 0) rotate(${tilt.toFixed(3)}deg)`;
    });

    if (isMoving || pointer.isInside) {
      frame = requestAnimationFrame(tick);
    } else {
      lastTime = 0;
    }
  };

  const wake = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const handleMove = (event: PointerEvent) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.isInside = true;
    wake();
  };

  const handleLeave = () => {
    pointer.isInside = false;
    wake();
  };

  const observer = new ResizeObserver(measure);
  observer.observe(mark);
  mark.addEventListener('pointermove', handleMove);
  mark.addEventListener('pointerleave', handleLeave);

  return () => {
    observer.disconnect();
    mark.removeEventListener('pointermove', handleMove);
    mark.removeEventListener('pointerleave', handleLeave);
    cancelAnimationFrame(frame);
    letters.forEach((letter) => {
      letter.style.transform = '';
    });
  };
};

const FooterPulseLinks = ({
  brand = 'Tween UI',
  logo = TWEEN_MARK,
  description = 'GSAP & CSS animated components for React. Copy the source, own the animation.',
  columns = DEFAULT_COLUMNS,
  socials = DEFAULT_SOCIALS,
  legal = DEFAULT_LEGAL,
  copyright,
  className,
  ...props
}: FooterPulseLinksProps) => {
  const rootRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLParagraphElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const box = boxRef.current;
      const mark = markRef.current;
      const word = wordRef.current;
      if (!box || !mark || !word) return;

      let fittedFor = 0;
      const fit = () => {
        const width = box.clientWidth;
        if (!width || width === fittedFor) return;
        fittedFor = width;
        mark.style.fontSize = '';
        const size = parseFloat(getComputedStyle(mark).fontSize);
        const trailing = parseFloat(getComputedStyle(word).letterSpacing) || 0;
        const ink = word.offsetWidth - trailing;
        if (ink > 0) mark.style.fontSize = `${(size * width) / ink}px`;
      };
      const observer = new ResizeObserver(fit);
      observer.observe(box);
      fit();

      const fonts = typeof document !== 'undefined' ? document.fonts?.ready : undefined;
      fonts?.then(() => {
        fittedFor = 0;
        fit();
      });

      const letters = Array.from(word.querySelectorAll<HTMLElement>('[data-letter]'));
      let stopFollowing: (() => void) | null = null;
      const startFollowing = () => {
        if (canHover()) stopFollowing = followPointer(mark, letters);
      };

      const reduce = prefersReducedMotion();
      const entrance = reduce
        ? null
        : gsap.fromTo(
            letters,
            { autoAlpha: 0, y: 46 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.62,
              ease: 'power3.out',
              stagger: 0.04,
              paused: true,
              onComplete: () => {
                gsap.set(letters, { clearProps: 'transform,opacity,visibility' });
                startFollowing();
              },
            }
          );

      const trigger = entrance
        ? ScrollTrigger.create({
            trigger: box,
            start: 'top 95%',
            once: true,
            onEnter: () => entrance.play(),
          })
        : null;

      if (reduce) startFollowing();

      return () => {
        observer.disconnect();
        trigger?.kill();
        entrance?.kill();
        stopFollowing?.();
        mark.style.fontSize = '';
      };
    },
    { scope: rootRef, dependencies: [brand] }
  );

  const notice = copyright ?? `© ${new Date().getFullYear()} ${brand}`;
  const lastWordStart = brand.lastIndexOf(' ') + 1;

  return (
    <footer
      ref={rootRef}
      className={cn(
        'relative isolate w-full overflow-hidden border-t border-[#9fd4d6]/12 bg-[#03110f] pt-16 pb-8 text-[#e8f3f2] max-sm:pt-12',
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[420px] max-sm:h-[300px]"
      >
        <span className="absolute top-full left-1/2 h-[200%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(4_95_100/0.6)_0%,rgb(4_95_100/0.24)_45%,rgb(4_95_100/0)_100%)]" />
        <span className="absolute top-full left-1/2 h-[110%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(198_245_111/0.16)_0%,rgb(198_245_111/0.05)_55%,rgb(198_245_111/0)_100%)] mix-blend-plus-lighter" />
      </div>

      <div className="mx-auto grid w-full max-w-[1320px] gap-4 px-5 max-sm:gap-10 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-12 max-md:flex-col max-md:gap-10">
          <div className="grid w-[300px] justify-items-start gap-6 max-md:w-full">
            <a href="/" className={cn('flex items-center gap-2.5', focusRing)}>
              {logo}
              <span className="text-lg font-semibold tracking-tight">{brand}</span>
            </a>
            <p className="text-[15px] leading-relaxed text-[#9fd4d6]/70">{description}</p>
            {socials.length > 0 ? (
              <ul aria-label="Social links" className="flex gap-3">
                {socials.map((social) => (
                  <li key={social.href}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${brand} on ${social.label}`}
                      className={cn(
                        'group/social relative flex size-11 items-center justify-center rounded-full opacity-70',
                        'bg-[linear-gradient(175deg,rgb(159_212_214/0.36)_0%,rgb(159_212_214/0)_19%,rgb(159_212_214/1)_41%,rgb(159_212_214/0)_77%,rgb(159_212_214/0.05)_100%)]',
                        "before:absolute before:inset-px before:rounded-full before:bg-[#03110f] before:transition-colors before:duration-300 before:content-['']",
                        'transition-[opacity,translate] duration-500 hover:-translate-y-0.5 hover:opacity-100 hover:before:bg-[#071d1b]',
                        EASE_OUT,
                        'focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6f56f]',
                        'motion-reduce:transition-none motion-reduce:hover:translate-y-0'
                      )}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="relative size-4 text-[#e8f3f2] transition-colors duration-300 group-hover/social:text-[#c6f56f] motion-reduce:transition-none"
                      >
                        {SOCIAL_PATHS[social.icon]}
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-20 gap-y-10 max-lg:gap-x-12">
            {columns.map((column) => (
              <LinkGroup key={column.heading} column={column} />
            ))}
          </nav>
        </div>

        <div ref={boxRef} className="min-w-0">
          <p
            ref={markRef}
            aria-hidden="true"
            className="relative pt-6 pb-2 text-center text-[length:min(20vw,240px)] leading-none font-bold tracking-[0.02em] whitespace-nowrap uppercase select-none"
          >
            <span ref={wordRef} className="-mr-[0.02em] inline-block">
              {Array.from(brand).map((char, index) => (
                <span
                  key={`${char}-${index}`}
                  data-letter=""
                  className={cn(
                    'inline-block bg-clip-text whitespace-pre text-transparent will-change-transform',
                    index >= lastWordStart
                      ? 'bg-[linear-gradient(to_top,rgb(198_245_111/0.15)_13%,rgb(198_245_111/0.95)_100%)]'
                      : 'bg-[linear-gradient(to_top,rgb(232_243_242/0.12)_4%,rgb(240_248_247/0.82)_38%,rgb(255_255_255/1)_100%)]'
                  )}
                >
                  {char}
                </span>
              ))}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-[#9fd4d6]/12 pt-6 max-sm:flex-col max-sm:items-start">
          <p className="text-xs tracking-[0.14em] whitespace-nowrap text-[#9fd4d6]/65 uppercase">
            {notice}
          </p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 max-sm:gap-x-6">
            {legal.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <PulseLink
                  link={link}
                  className="text-xs tracking-[0.14em] text-[#9fd4d6]/65 uppercase"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default FooterPulseLinks;
