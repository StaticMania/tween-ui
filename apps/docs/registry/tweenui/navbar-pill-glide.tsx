'use client';

import {
  useCallback,
  useEffect,
  useId,
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

export interface NavbarPillGlideLink {
  label: string;
  href: string;
  image?: string;
}

export interface NavbarPillGlideAction {
  label: string;
  href: string;
}

export type NavbarPillGlideSocialIcon = 'github' | 'x' | 'linkedin' | 'dribbble';

export interface NavbarPillGlideSocial {
  label: string;
  href: string;
  icon: NavbarPillGlideSocialIcon;
}

export interface NavbarPillGlideProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'children'
> {
  brand?: string;
  logo?: ReactNode;
  homeHref?: string;
  links?: NavbarPillGlideLink[];
  currentHref?: string;
  primaryAction?: NavbarPillGlideAction;
  secondaryAction?: NavbarPillGlideAction;
  socials?: NavbarPillGlideSocial[];
  email?: string;
  children?: ReactNode;
}

const SITE = 'https://tween-ui.vercel.app';
const REPO = 'https://github.com/StaticMania/tween-ui';

const poster = (kind: 'block' | 'component', name: string) =>
  `${SITE}/media/${kind}s/${name}-poster.webp`;

const DEFAULT_LINKS: NavbarPillGlideLink[] = [
  { label: 'Home', href: '/', image: poster('block', 'gyro-gallery') },
  { label: 'Components', href: '/components', image: poster('component', 'sliding-tabs') },
  { label: 'Blocks', href: '/components#blocks', image: poster('block', 'shutter-slider') },
  { label: 'Setup', href: '/installation/setup-guide', image: poster('block', 'integration-hub') },
  { label: 'MCP', href: '/installation/mcp', image: poster('block', 'kinetic-type-ring') },
];

const DEFAULT_PRIMARY: NavbarPillGlideAction = {
  label: 'Get started',
  href: '/installation/setup-guide',
};

const DEFAULT_SECONDARY: NavbarPillGlideAction = { label: 'GitHub', href: REPO };

const DEFAULT_SOCIALS: NavbarPillGlideSocial[] = [{ label: 'GitHub', href: REPO, icon: 'github' }];

const TWEEN_MARK = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-7 shrink-0">
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

const CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

const HIDE_AFTER = 240;
const SCROLL_TOLERANCE = 6;
const DESKTOP_QUERY = '(min-width: 1024px)';

const EASE_OUT_EXPO = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6f56f]';

const SOCIAL_PATHS: Record<NavbarPillGlideSocialIcon, ReactNode> = {
  github: (
    <>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </>
  ),
  x: (
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
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
};

const cleanHref = (href: string) => href.split(/[?#]/)[0]?.replace(/\/+$/, '') || '/';

const isCurrentHref = (href: string, currentHref: string) => {
  const target = cleanHref(href);
  const current = cleanHref(currentHref);
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
};

const isExternal = (href: string) => /^https?:/.test(href);

const externalProps = (href: string) =>
  isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

function RollText({ text, className }: { text: string; className?: string }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn('inline-flex h-[1.2em] overflow-hidden leading-[1.2em]', className)}
      >
        {Array.from(text).map((char, index) => (
          <span
            key={`${char}-${index}`}
            className={cn(
              'inline-block whitespace-pre [text-shadow:0_1.2em_currentColor]',
              'transition-transform duration-[550ms] group-hover/roll:-translate-y-full group-focus-visible/roll:-translate-y-full',
              EASE_OUT_EXPO,
              'motion-reduce:transition-none motion-reduce:group-hover/roll:translate-y-0 motion-reduce:group-focus-visible/roll:translate-y-0'
            )}
            style={{ transitionDelay: `${index * 16}ms` }}
          >
            {char}
          </span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}

function ArrowSwap() {
  const arrowClass = cn(
    'col-start-1 row-start-1 size-4 transition-transform duration-[550ms] motion-reduce:transition-none',
    EASE_OUT_EXPO
  );
  const arrowPath = <path d="M7 17 17 7M7 7h10v10" />;

  return (
    <span aria-hidden="true" className="grid size-4 overflow-hidden">
      {[
        'group-hover/roll:translate-x-[110%] group-hover/roll:-translate-y-[110%]',
        '-translate-x-[110%] translate-y-[110%] group-hover/roll:translate-0',
      ].map((motion) => (
        <svg
          key={motion}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(arrowClass, motion)}
        >
          {arrowPath}
        </svg>
      ))}
    </span>
  );
}

function ActionLink({
  action,
  variant,
  className,
}: {
  action: NavbarPillGlideAction;
  variant: 'primary' | 'outline';
  className?: string;
}) {
  return (
    <a
      href={action.href}
      {...externalProps(action.href)}
      className={cn(
        'group/roll relative isolate inline-flex h-11 items-center justify-center gap-3 overflow-hidden rounded-full px-5 text-[15px] font-medium whitespace-nowrap',
        'transition-[scale,color,border-color] duration-500 active:scale-[0.96] motion-reduce:transition-none',
        EASE_OUT_EXPO,
        focusRing,
        variant === 'primary'
          ? 'bg-[#c6f56f] text-[#03110f]'
          : 'border border-[#9fd4d6]/25 text-[#e8f3f2] hover:border-[#e8f3f2] hover:text-[#03110f]',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-1/2 left-1/2 -z-10 aspect-square w-[260%] -translate-1/2 scale-0 rounded-full bg-[#e8f3f2] transition-transform duration-[650ms] group-hover/roll:scale-100 motion-reduce:transition-none',
          EASE_OUT_EXPO
        )}
      />
      <RollText text={action.label} />
      {variant === 'primary' ? <ArrowSwap /> : null}
    </a>
  );
}

function SamplePage({ linkCount }: { linkCount: number }) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="relative isolate flex h-full min-h-full flex-col overflow-hidden pt-24 pb-10 sm:pt-28 sm:pb-14"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[repeating-linear-gradient(90deg,rgb(159_212_214/0.06)_0_1px,transparent_1px_48px),repeating-linear-gradient(0deg,rgb(159_212_214/0.045)_0_1px,transparent_1px_48px)] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,black,transparent)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(38%_46%_at_50%_0%,rgb(198_245_111/0.12),transparent_70%),radial-gradient(55%_60%_at_92%_100%,rgb(4_95_100/0.6),transparent_72%),radial-gradient(45%_50%_at_6%_90%,rgb(4_95_100/0.35),transparent_70%)]"
      />
      <div className={cn(CONTAINER, 'flex flex-1 items-center')}>
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.04] py-2 pr-4 pl-2.5 text-[10px] leading-none font-medium tracking-[0.2em] text-[#9fd4d6] uppercase ring-1 ring-white/10">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full bg-[#c6f56f] shadow-[0_0_5px_#c6f56f,0_0_12px_#c6f56f]"
            />
            {linkCount} links in one pill
          </p>
          <h2
            id={headingId}
            className="mt-8 text-[40px] leading-[0.98] font-medium tracking-[-0.045em] text-balance text-[#e8f3f2] sm:text-6xl md:text-7xl lg:text-[80px]"
          >
            Point at a link.
            <br />
            The pill <span className="text-[#c6f56f]">follows.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[34rem] text-[15px] leading-relaxed text-pretty text-[#e8f3f2]/60 sm:mt-8 sm:text-base md:text-lg">
            Sweep across the links above and the highlight glides between them. On a narrower screen
            the round button opens the full menu from where it sits.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function NavbarPillGlide({
  brand = 'Tween UI',
  logo = TWEEN_MARK,
  homeHref = '/',
  links = DEFAULT_LINKS,
  currentHref = '/',
  primaryAction = DEFAULT_PRIMARY,
  secondaryAction = DEFAULT_SECONDARY,
  socials = DEFAULT_SOCIALS,
  email,
  children,
  className,
  ...props
}: NavbarPillGlideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewHref, setPreviewHref] = useState(links[0]?.href ?? '');
  const menuId = useId();

  const rootRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isOpenRef = useRef(false);

  const pillLinks = links.filter((link) => cleanHref(link.href) !== cleanHref(homeHref));
  const previews = links.filter((link): link is Required<NavbarPillGlideLink> =>
    Boolean(link.image)
  );

  const { contextSafe } = useGSAP(
    () => {
      const bar = barRef.current;
      if (!bar || prefersReducedMotion()) return;
      gsap.fromTo(
        bar.querySelectorAll('[data-nav-item]'),
        { autoAlpha: 0, y: -24 },
        { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, clearProps: 'all' }
      );
    },
    { scope: rootRef }
  );

  const glideTo = contextSafe((link: HTMLElement) => {
    const pill = pillRef.current;
    const highlight = highlightRef.current;
    if (!pill || !highlight) return;
    const box = link.getBoundingClientRect();
    const base = pill.getBoundingClientRect();
    const isHidden = Number(gsap.getProperty(highlight, 'opacity')) === 0;
    gsap.to(highlight, {
      x: box.left - base.left,
      width: box.width,
      opacity: 1,
      duration: isHidden || prefersReducedMotion() ? 0 : 0.55,
      ease: 'expo.out',
    });
  });

  const fadeHighlight = contextSafe(() => {
    gsap.to(highlightRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' });
  });

  const animateMenu = contextSafe((open: boolean) => {
    const root = rootRef.current;
    const menu = menuRef.current;
    const toggle = toggleRef.current;
    if (!root || !menu || !toggle) return;
    const rootBox = root.getBoundingClientRect();
    const toggleBox = toggle.getBoundingClientRect();
    const at = `${toggleBox.left - rootBox.left + toggleBox.width / 2}px ${toggleBox.top - rootBox.top + toggleBox.height / 2}px`;
    const items = menu.querySelectorAll('[data-menu-link]');
    const meta = menu.querySelector('[data-menu-meta]');
    timelineRef.current?.kill();

    if (prefersReducedMotion()) {
      gsap.set(menu, {
        visibility: open ? 'visible' : 'hidden',
        clipPath: open ? 'none' : `circle(0% at ${at})`,
      });
      gsap.set(items, { yPercent: 0 });
      gsap.set(meta, { opacity: 1, y: 0 });
      return;
    }

    timelineRef.current = open
      ? gsap
          .timeline()
          .set(menu, { visibility: 'visible' })
          .fromTo(
            menu,
            { clipPath: `circle(0% at ${at})` },
            { clipPath: `circle(150% at ${at})`, duration: 1, ease: 'expo.inOut' }
          )
          .fromTo(
            items,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 },
            0.35
          )
          .fromTo(
            meta,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
            0.6
          )
      : gsap
          .timeline()
          .to(items, { yPercent: -110, duration: 0.45, ease: 'power3.in', stagger: 0.03 })
          .to(menu, { clipPath: `circle(0% at ${at})`, duration: 0.8, ease: 'expo.inOut' }, 0.15)
          .set(menu, { visibility: 'hidden' });
  });

  const setOpen = useCallback(
    (open: boolean) => {
      if (open === isOpenRef.current) return;
      isOpenRef.current = open;
      setIsOpen(open);
      animateMenu(open);
      if (open) gsap.to(barRef.current, { yPercent: 0, duration: 0.8, ease: 'expo.out' });
    },
    [animateMenu]
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    const bar = barRef.current;
    const progress = progressRef.current;
    if (!scroller || !bar || !progress) return;
    let lastY = scroller.scrollTop;
    let isHidden = false;

    const handleScroll = () => {
      const y = scroller.scrollTop;
      const room = scroller.scrollHeight - scroller.clientHeight;
      const ratio = room > 0 ? y / room : 0;
      const isQuiet = prefersReducedMotion();
      gsap.to(progress, { scaleX: ratio, duration: isQuiet ? 0 : 0.4, ease: 'power2.out' });

      const delta = y - lastY;
      if (Math.abs(delta) < SCROLL_TOLERANCE) return;
      lastY = y;
      const shouldHide = delta > 0 && y > HIDE_AFTER && !isOpenRef.current;
      if (shouldHide === isHidden) return;
      isHidden = shouldHide;
      gsap.to(bar, {
        yPercent: isHidden ? -130 : 0,
        duration: isQuiet ? 0 : isHidden ? 0.5 : 0.8,
        ease: isHidden ? 'power3.in' : 'expo.out',
      });
    };

    scroller.addEventListener('scroll', handleScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const handleDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    desktop.addEventListener('change', handleDesktop);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      desktop.removeEventListener('change', handleDesktop);
    };
  }, [isOpen, setOpen]);

  return (
    <section
      ref={rootRef}
      aria-label={`${brand} site`}
      className={cn(
        'relative isolate h-svh min-h-[560px] w-full overflow-hidden bg-[#03110f] text-[#e8f3f2]',
        className
      )}
      {...props}
    >
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
        <div ref={barRef} className={cn(CONTAINER, 'flex h-20 items-center justify-between gap-6')}>
          <a
            href={homeHref}
            data-nav-item=""
            aria-label={`${brand} home`}
            className={cn(
              'group/roll pointer-events-auto inline-flex items-center gap-2.5 rounded-full text-[#e8f3f2]',
              focusRing
            )}
          >
            {logo}
            <RollText text={brand} className="text-lg font-semibold tracking-tight" />
          </a>

          {pillLinks.length > 0 ? (
            <nav
              aria-label="Primary"
              data-nav-item=""
              className="pointer-events-auto hidden lg:block"
            >
              <div
                ref={pillRef}
                onMouseLeave={fadeHighlight}
                className="relative rounded-full border border-[#9fd4d6]/15 bg-[#071d1b]/70 p-1 backdrop-blur-xl"
              >
                <span
                  ref={highlightRef}
                  aria-hidden="true"
                  className="absolute inset-y-1 left-0 rounded-full bg-[#e8f3f2]/10 opacity-0"
                />
                <ul className="relative flex items-center">
                  {pillLinks.map((link) => {
                    const isCurrent = isCurrentHref(link.href, currentHref);
                    return (
                      <li key={`${link.label}-${link.href}`}>
                        <a
                          href={link.href}
                          {...externalProps(link.href)}
                          aria-current={isCurrent ? 'page' : undefined}
                          onMouseEnter={(event) => glideTo(event.currentTarget)}
                          onFocus={(event) => glideTo(event.currentTarget)}
                          onBlur={fadeHighlight}
                          className={cn(
                            'group/roll flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors duration-300 hover:text-[#e8f3f2] focus-visible:outline-2 focus-visible:outline-[#c6f56f]',
                            isCurrent ? 'text-[#e8f3f2]' : 'text-[#9fd4d6]/70'
                          )}
                        >
                          <RollText text={link.label} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <span
                  ref={progressRef}
                  aria-hidden="true"
                  className="absolute inset-x-6 -bottom-px h-px origin-left scale-x-0 bg-[#c6f56f]"
                />
              </div>
            </nav>
          ) : null}

          <div data-nav-item="" className="pointer-events-auto flex items-center gap-2">
            <ActionLink
              action={secondaryAction}
              variant="outline"
              className="hidden xl:inline-flex"
            />
            <ActionLink action={primaryAction} variant="primary" className="max-[400px]:px-4" />
            <button
              ref={toggleRef}
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls={menuId}
              onClick={() => setOpen(!isOpenRef.current)}
              className={cn(
                'grid size-11 cursor-pointer place-items-center rounded-full border border-[#9fd4d6]/15 bg-[#071d1b]/70 backdrop-blur-xl lg:hidden',
                focusRing
              )}
            >
              <span aria-hidden="true" className="relative block h-3 w-5">
                <span
                  className={cn(
                    'absolute inset-x-0 top-0 h-px bg-[#e8f3f2] transition-transform duration-500 motion-reduce:transition-none',
                    EASE_OUT_EXPO,
                    isOpen && 'translate-y-[5.5px] rotate-45'
                  )}
                />
                <span
                  className={cn(
                    'absolute inset-x-0 bottom-0 h-px bg-[#e8f3f2] transition-transform duration-500 motion-reduce:transition-none',
                    EASE_OUT_EXPO,
                    isOpen && '-translate-y-[5.5px] -rotate-45'
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menuRef}
        id={menuId}
        inert={!isOpen}
        className="invisible absolute inset-0 z-20 bg-[#03110f] [clip-path:circle(0%_at_100%_0%)]"
      >
        <div className={cn(CONTAINER, 'grid h-full grid-cols-1 gap-10 pt-28 pb-8 md:grid-cols-12')}>
          <nav aria-label="Menu" className="flex min-h-0 flex-col justify-between md:col-span-7">
            <ul className="flex flex-col">
              {links.map((link) => (
                <li key={`${link.label}-${link.href}`} className="overflow-hidden">
                  <a
                    href={link.href}
                    {...externalProps(link.href)}
                    data-menu-link=""
                    aria-current={isCurrentHref(link.href, currentHref) ? 'page' : undefined}
                    onMouseEnter={() => setPreviewHref(link.href)}
                    onFocus={() => setPreviewHref(link.href)}
                    className={cn(
                      'group/roll flex items-baseline py-1 text-[clamp(2.5rem,11vw,5.5rem)] leading-none font-bold tracking-[-0.04em] text-[#e8f3f2] aria-[current=page]:text-[#c6f56f]',
                      focusRing
                    )}
                  >
                    <RollText text={link.label} />
                  </a>
                </li>
              ))}
            </ul>
            <div data-menu-meta="" className="flex flex-wrap items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${brand} on ${social.label}`}
                  className={cn(
                    'grid size-11 place-items-center rounded-full border border-[#9fd4d6]/15 text-[#9fd4d6]/70 transition-colors duration-300 hover:border-[#e8f3f2] hover:text-[#e8f3f2]',
                    focusRing
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
                    className="size-5"
                  >
                    {SOCIAL_PATHS[social.icon]}
                  </svg>
                </a>
              ))}
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className={cn(
                    'group/roll ml-auto rounded-xs text-sm text-[#9fd4d6]/70 transition-colors duration-300 hover:text-[#e8f3f2]',
                    focusRing
                  )}
                >
                  <RollText text={email} />
                </a>
              ) : null}
            </div>
          </nav>
          {previews.length > 0 ? (
            <div
              aria-hidden="true"
              className="relative hidden overflow-hidden rounded-2xl border border-[#9fd4d6]/12 bg-[#071d1b] md:col-span-5 md:block"
            >
              {previews.map((link) => (
                <img
                  key={link.href}
                  src={link.image}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  className={cn(
                    'absolute inset-0 size-full object-cover transition-[opacity,scale] duration-700 motion-reduce:transition-none',
                    EASE_OUT_EXPO,
                    link.href === previewHref ? 'scale-100 opacity-100' : 'scale-[1.06] opacity-0'
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={scrollerRef}
        inert={isOpen}
        data-lenis-prevent=""
        className="absolute inset-0 z-10 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
      >
        {children ?? <SamplePage linkCount={pillLinks.length} />}
      </div>
    </section>
  );
}
