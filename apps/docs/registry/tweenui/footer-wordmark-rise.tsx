'use client';

import { useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type FooterSocialIcon = 'x' | 'instagram' | 'linkedin' | 'dribbble' | 'github';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export interface FooterSocial {
  label: string;
  href: string;
  icon: FooterSocialIcon;
}

export interface FooterWordmarkRiseProps extends ComponentPropsWithoutRef<'footer'> {
  brand?: string;
  logo?: ReactNode;
  description?: string;
  columns?: FooterColumn[];
  socials?: FooterSocial[];
  legal?: FooterLink[];
  copyright?: string;
}

const REPO = 'https://github.com/StaticMania/tween-ui';

const DEFAULT_COLUMNS: FooterColumn[] = [
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

const DEFAULT_SOCIALS: FooterSocial[] = [{ label: 'GitHub', href: REPO, icon: 'github' }];

const DEFAULT_LEGAL: FooterLink[] = [
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

const underline = cn(
  "after:pointer-events-none after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:bg-current after:content-['']",
  'after:origin-right after:scale-x-0 after:transition-transform after:duration-500',
  'after:ease-[cubic-bezier(0.16,1,0.3,1)]',
  'hover:after:origin-left hover:after:scale-x-100 focus-visible:after:origin-left focus-visible:after:scale-x-100',
  'motion-reduce:after:transition-none'
);

const focusRing =
  'rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6f56f]';

const SOCIAL_PATHS: Record<FooterSocialIcon, ReactNode> = {
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

function RollLabel({ label }: { label: string }) {
  return (
    <>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="block overflow-hidden leading-[1.25]">
        {Array.from(label).map((char, index) => (
          <span
            key={`${char}-${index}`}
            className={cn(
              'inline-block whitespace-pre [text-shadow:0_1.25em_currentColor]',
              'transition-transform duration-500 group-hover/link:-translate-y-full group-focus-visible/link:-translate-y-full',
              EASE_OUT,
              'motion-reduce:transition-none motion-reduce:group-hover/link:translate-y-0 motion-reduce:group-focus-visible/link:translate-y-0'
            )}
            style={{ transitionDelay: `${index * 18}ms` }}
          >
            {char}
          </span>
        ))}
      </span>
    </>
  );
}

function LinkGroup({ column }: { column: FooterColumn }) {
  const headingId = useId();

  return (
    <div className="grid content-start gap-4">
      <p id={headingId} className="text-xs tracking-[0.14em] text-[#9fd4d6]/60 uppercase">
        {column.heading}
      </p>
      <ul aria-labelledby={headingId} className="grid gap-3">
        {column.links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <a
              href={link.href}
              {...externalProps(link.href)}
              className={cn(
                'group/link relative inline-block text-[15px] whitespace-nowrap text-[#e8f3f2]/85 transition-colors duration-300 hover:text-[#c6f56f] focus-visible:text-[#c6f56f] motion-reduce:transition-none',
                underline,
                focusRing
              )}
            >
              <RollLabel label={link.label} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FooterWordmarkRise({
  brand = 'Tween UI',
  logo = TWEEN_MARK,
  description = 'GSAP & CSS animated components for React. Copy the source, own the animation.',
  columns = DEFAULT_COLUMNS,
  socials = DEFAULT_SOCIALS,
  legal = DEFAULT_LEGAL,
  copyright,
  className,
  ...props
}: FooterWordmarkRiseProps) {
  const rootRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLParagraphElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const box = boxRef.current;
      const mark = markRef.current;
      const word = wordRef.current;
      if (!root || !box || !mark || !word) return;

      const reduce = prefersReducedMotion();

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

      const entrance = reduce
        ? null
        : gsap
            .timeline({
              scrollTrigger: {
                trigger: root,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            })
            .fromTo(
              root.querySelectorAll('[data-footer-glow]'),
              { autoAlpha: 0, scaleY: 0.35 },
              { autoAlpha: 1, scaleY: 1, duration: 1.6, ease: 'power2.out' },
              0
            )
            .fromTo(
              root.querySelectorAll('[data-footer-rise]'),
              { autoAlpha: 0, y: 48 },
              { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.18 },
              0.1
            );

      if (!reduce) gsap.set(word, { autoAlpha: 0 });

      let split: SplitText | null = null;
      let reveal: gsap.core.Tween | null = null;
      let isAlive = true;

      const revealWord = () => {
        split = SplitText.create(word, {
          type: 'chars',
          charsClass: 'fwr-char',
          mask: 'chars',
          aria: 'none',
        });
        mark.dataset.split = '';
        reveal = gsap.fromTo(
          split.chars,
          { yPercent: 105 },
          {
            yPercent: 0,
            duration: 1.6,
            ease: 'power3.out',
            stagger: 0.12,
            scrollTrigger: {
              trigger: box,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
        gsap.set(word, { autoAlpha: 1 });
      };

      const setup = () => {
        if (!isAlive) return;
        fittedFor = 0;
        fit();
        if (reduce) return;
        revealWord();
        fittedFor = 0;
        fit();
        ScrollTrigger.refresh();
      };

      const fonts = typeof document !== 'undefined' ? document.fonts?.ready : undefined;
      Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 1500))]).then(setup);

      return () => {
        isAlive = false;
        observer.disconnect();
        entrance?.scrollTrigger?.kill();
        entrance?.kill();
        reveal?.scrollTrigger?.kill();
        reveal?.kill();
        split?.revert();
        delete mark.dataset.split;
        mark.style.fontSize = '';
      };
    },
    { scope: rootRef, dependencies: [brand] }
  );

  const notice = copyright ?? `© ${new Date().getFullYear()} ${brand}`;

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
        data-footer-glow=""
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[420px] origin-bottom max-sm:h-[300px]"
      >
        <span className="absolute top-full left-1/2 h-[200%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(4_95_100/0.6)_0%,rgb(4_95_100/0.24)_45%,rgb(4_95_100/0)_100%)]" />
        <span className="absolute top-full left-1/2 h-[110%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(198_245_111/0.16)_0%,rgb(198_245_111/0.05)_55%,rgb(198_245_111/0)_100%)] mix-blend-plus-lighter" />
      </div>

      <div className="mx-auto grid w-full max-w-[1320px] gap-4 px-5 max-sm:gap-10 sm:px-8">
        <div
          data-footer-rise=""
          className="flex flex-wrap items-start justify-between gap-12 max-md:flex-col max-md:gap-10"
        >
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
            className={cn(
              'pointer-events-none pb-2 text-center text-[length:min(20vw,240px)] leading-none font-bold tracking-[0.02em] whitespace-nowrap text-transparent uppercase select-none',
              '[--fade:linear-gradient(to_top,rgb(159_212_214/0)_13%,rgb(159_212_214/0.7)_100%)] max-sm:[--fade:linear-gradient(to_bottom,rgb(159_212_214/0.7)_13%,rgb(159_212_214/0)_88%)]',
              'bg-(image:--fade) bg-clip-text data-split:bg-none',
              '[&_.fwr-char]:inline-block [&_.fwr-char]:bg-(image:--fade) [&_.fwr-char]:bg-clip-text',
              '[&_.fwr-char-mask]:inline-block [&_.fwr-char-mask]:align-top'
            )}
          >
            <span ref={wordRef} className="-mr-[0.02em] inline-block">
              {brand}
            </span>
          </p>
        </div>

        <div
          data-footer-rise=""
          className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-[#9fd4d6]/12 pt-6 max-sm:flex-col max-sm:items-start"
        >
          <p className="text-xs tracking-[0.14em] whitespace-nowrap text-[#9fd4d6]/65 uppercase">
            {notice}
          </p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 max-sm:gap-x-6">
            {legal.map((link) => (
              <li key={`${link.label}-${link.href}`}>
                <a
                  href={link.href}
                  {...externalProps(link.href)}
                  className={cn(
                    'relative inline-block text-xs tracking-[0.14em] whitespace-nowrap text-[#9fd4d6]/65 uppercase transition-colors duration-400 hover:text-[#e8f3f2]',
                    EASE_OUT,
                    underline,
                    focusRing
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
