'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface NavbarCornerPanelLink {
  label: string;
  href: string;
}

export interface NavbarCornerPanelProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'children'
> {
  brand?: string;
  logo?: ReactNode;
  homeHref?: string;
  links?: NavbarCornerPanelLink[];
  currentHref?: string;
  socials?: NavbarCornerPanelLink[];
  children?: ReactNode;
}

type PanelSize = {
  width: number;
  height: number;
};

const REPO = 'https://github.com/StaticMania/tween-ui';

const DEFAULT_LINKS: NavbarCornerPanelLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'Blocks', href: '/components#blocks' },
  { label: 'Setup', href: '/installation/setup-guide' },
];

const DEFAULT_SOCIALS: NavbarCornerPanelLink[] = [
  { label: 'GitHub', href: REPO },
  { label: 'Issues', href: `${REPO}/issues` },
  { label: 'Changelog', href: `${REPO}/blob/main/CHANGELOG.md` },
];

const TWEEN_MARK = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-8">
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
const TOGGLE_SIZE = 44;
const GAP = 16;
const LARGE = 1024;
const MEDIUM = 768;

const EASE = 'ease-[cubic-bezier(0,0,0,1)]';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c6f56f]';

const cleanHref = (href: string) => href.split(/[?#]/)[0]?.replace(/\/+$/, '') || '/';

const isExternal = (href: string) => /^https?:/.test(href);

const externalProps = (href: string) =>
  isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 14 15" fill="none" className={className}>
      <path
        d="M3.06978 1.94975L12.9693 1.94973L12.9693 11.8492M0.948451 13.9705L12.6157 2.3033"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
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
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_96%_4%,rgb(198_245_111/0.14),transparent_70%),radial-gradient(55%_60%_at_8%_100%,rgb(4_95_100/0.6),transparent_72%),radial-gradient(40%_36%_at_45%_0%,rgb(159_212_214/0.08),transparent_70%)]"
      />
      <div className={cn(CONTAINER, 'flex flex-1 items-center')}>
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 text-sm text-[#9fd4d6]/70">
            <span aria-hidden="true" className="text-[#c6f56f]">
              +
            </span>
            ({linkCount} pages, one corner)
          </p>
          <h2
            id={headingId}
            className="mt-5 text-[40px] leading-[0.98] font-medium tracking-[-0.045em] text-balance text-[#e8f3f2] sm:text-6xl md:text-7xl"
          >
            Everything waits in the <span className="text-[#c6f56f]">corner.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[34rem] text-[15px] leading-relaxed text-pretty text-[#e8f3f2]/60 sm:text-base md:text-lg">
            Open the square at the top right and it grows into the menu, straight out of its corner.
            Click anywhere outside to put it away.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function NavbarCornerPanel({
  brand = 'Tween UI',
  logo = TWEEN_MARK,
  homeHref = '/',
  links = DEFAULT_LINKS,
  currentHref = '/',
  socials = DEFAULT_SOCIALS,
  children,
  className,
  ...props
}: NavbarCornerPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState<PanelSize>({ width: 0, height: 0 });
  const menuId = useId();

  const rootRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLButtonElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const isOpenRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const current = links.findIndex((link) => cleanHref(link.href) === cleanHref(currentHref));

  const measure = useCallback((): PanelSize => {
    const root = rootRef.current;
    const anchor = anchorRef.current;
    if (!root || !anchor) return { width: 0, height: 0 };
    const rootBox = root.getBoundingClientRect();
    const anchorBox = anchor.getBoundingClientRect();
    const top = anchorBox.top - rootBox.top;
    const reach = anchorBox.right - rootBox.left - GAP;
    const rootWidth = rootBox.width;
    const height = Math.round(rootBox.height - top * 2);

    let width = reach;
    if (rootWidth >= LARGE) width = clamp(rootWidth * 0.32, 340, 440);
    else if (rootWidth >= MEDIUM) width = rootWidth * 0.48;
    width = Math.round(Math.min(width, reach));

    return { width, height };
  }, []);

  const { contextSafe } = useGSAP({ scope: rootRef });

  const animatePanel = contextSafe((open: boolean, next: PanelSize) => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay) return;
    const items = gsap.utils.toArray<HTMLElement>('[data-panel-item]', panel);
    const extras = gsap.utils.toArray<HTMLElement>('[data-panel-extra]', panel);
    const lines = gsap.utils.toArray<HTMLElement>('[data-panel-line]', panel);
    timelineRef.current?.kill();

    timelineRef.current = open
      ? gsap
          .timeline({ defaults: { duration: 0.5 } })
          .set(panel, { visibility: 'visible' }, 0)
          .set([...items, ...extras], { y: '-2rem', opacity: 0 }, 0)
          .set(lines, { scaleX: 0 }, 0)
          .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
          .to(panel, { width: next.width, height: next.height, ease: 'power1.out' }, 0)
          .to(items, { y: 0, opacity: 1, stagger: 0.05 }, 0)
          .to(lines, { scaleX: 1, stagger: 0.05, ease: 'power2.out' }, 0.15)
          .to(extras, { y: 0, opacity: 1, stagger: 0.05 }, 0.2)
      : gsap
          .timeline({ defaults: { duration: 0.5 } })
          .to([...items, ...extras], { y: '-2rem', opacity: 0, stagger: 0.03, duration: 0.3 }, 0)
          .to(overlay, { autoAlpha: 0 }, 0)
          .to(panel, { width: TOGGLE_SIZE, height: TOGGLE_SIZE, ease: 'power1.inOut' }, 0)
          .set(panel, { visibility: 'hidden' });

    if (prefersReducedMotion()) timelineRef.current.progress(1);
  });

  const setOpen = useCallback(
    (open: boolean) => {
      if (open === isOpenRef.current) return;
      isOpenRef.current = open;
      const next = measure();
      setSize(next);
      setIsOpen(open);
      animatePanel(open, next);
    },
    [animatePanel, measure]
  );

  const showCursor = contextSafe((isVisible: boolean) => {
    gsap.to(cursorRef.current, {
      autoAlpha: isVisible ? 1 : 0,
      scale: isVisible ? 1 : 0.5,
      duration: 0.25,
      ease: 'power2.out',
    });
  });

  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    if (!isOpen || !root || !cursor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.22, ease: 'power3.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.22, ease: 'power3.out' });
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        showCursor(false);
        return;
      }
      const box = root.getBoundingClientRect();
      moveX(event.clientX - box.left);
      moveY(event.clientY - box.top);
      const target = event.target instanceof Element ? event.target : null;
      showCursor(!target?.closest('[data-menu-keep]'));
    };
    const handlePointerLeave = () => showCursor(false);

    const observer = new ResizeObserver(() => {
      if (timelineRef.current?.isActive()) return;
      const next = measure();
      setSize(next);
      gsap.set(panelRef.current, { width: next.width, height: next.height });
    });

    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    document.addEventListener('keydown', handleKeyDown);
    root.addEventListener('pointermove', handlePointerMove);
    root.addEventListener('pointerleave', handlePointerLeave);
    observer.observe(root);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      root.removeEventListener('pointermove', handlePointerMove);
      root.removeEventListener('pointerleave', handlePointerLeave);
      observer.disconnect();
      showCursor(false);
    };
  }, [isOpen, measure, setOpen, showCursor]);

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (index !== current) return;
    event.preventDefault();
    setOpen(false);
  };

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
      <div
        inert={isOpen}
        data-lenis-prevent=""
        className="absolute inset-0 z-0 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
      >
        {children ?? <SamplePage linkCount={links.length} />}
      </div>

      <button
        ref={overlayRef}
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className="invisible absolute inset-0 z-10 bg-[#03110f]/55 opacity-0 backdrop-blur-[2px] [@media(pointer:fine)]:cursor-none"
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20">
        <div className={cn(CONTAINER, 'relative flex items-start justify-between pt-6 sm:pt-8')}>
          <a
            href={homeHref}
            aria-label={`${brand} home`}
            className={cn(
              'pointer-events-auto flex items-center gap-2.5 rounded-lg text-[#e8f3f2]',
              focusRing
            )}
          >
            {logo}
            <span className="text-lg font-semibold tracking-tight">{brand}</span>
          </a>

          <div ref={anchorRef} data-menu-keep="" className="pointer-events-auto relative size-11">
            <div
              ref={panelRef}
              id={menuId}
              inert={!isOpen}
              className="invisible absolute top-0 right-0 size-11 overflow-hidden rounded-lg bg-[#071d1b]/85 ring-1 ring-[#9fd4d6]/12 backdrop-blur-md"
            >
              <div
                style={{ width: size.width || undefined, height: size.height || undefined }}
                className="absolute top-0 right-0"
              >
                <nav
                  aria-label="Primary"
                  className="@container flex h-full flex-col justify-between pt-16 pr-6 pb-8 pl-6 sm:pt-18 sm:pr-12 sm:pb-10 sm:pl-10"
                >
                  <ul className="flex flex-col gap-4">
                    {links.map((link, index) => (
                      <li key={`${link.label}-${link.href}`} data-panel-item="">
                        <a
                          href={link.href}
                          {...externalProps(link.href)}
                          aria-current={index === current ? 'page' : undefined}
                          onClick={(event) => handleLinkClick(event, index)}
                          className={cn(
                            'group/link flex flex-col gap-3 rounded-sm text-4xl font-normal tracking-tight transition-colors duration-200 ease-out select-none hover:text-[#e8f3f2] sm:gap-4 @[22rem]:text-5xl',
                            focusRing,
                            index === current ? 'text-[#e8f3f2]' : 'text-[#9fd4d6]/45'
                          )}
                        >
                          <span className="flex items-center justify-between gap-4">
                            <span className="min-w-0 origin-left truncate transition-transform duration-200 ease-out group-hover/link:scale-105">
                              {link.label}
                            </span>
                            <span className="block w-3.5 shrink-0 transition-transform duration-200 ease-out group-hover/link:translate-x-1">
                              <ArrowIcon
                                className={cn(
                                  'w-full',
                                  index === current ? 'rotate-90 text-[#c6f56f]' : 'rotate-45'
                                )}
                              />
                            </span>
                          </span>
                          <span
                            aria-hidden="true"
                            data-panel-line=""
                            className="block h-px w-full origin-left bg-[#9fd4d6]/15"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                  {socials.length > 0 ? (
                    <div className="flex w-fit flex-col gap-1 tracking-tight">
                      <p data-panel-extra="" className="mb-4 text-[#9fd4d6]/70 select-none sm:mb-6">
                        Elsewhere
                      </p>
                      <ul className="flex flex-col gap-1">
                        {socials.map((social) => (
                          <li key={social.href} data-panel-extra="">
                            <a
                              href={social.href}
                              {...externalProps(social.href)}
                              className={cn(
                                'group/social relative flex items-center gap-2 overflow-hidden rounded-xs pr-4 text-[#e8f3f2] sm:gap-0',
                                focusRing
                              )}
                            >
                              <span className="block w-2.5 origin-left transition-transform duration-200 ease-out sm:scale-0 sm:group-hover/social:scale-100">
                                <ArrowIcon className="w-full text-[#c6f56f]" />
                              </span>
                              <span className="transition-transform duration-200 ease-out sm:-translate-x-2.5 sm:group-hover/social:translate-x-1">
                                {social.label}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </nav>
              </div>
            </div>

            <button
              ref={toggleRef}
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls={menuId}
              onClick={() => setOpen(!isOpenRef.current)}
              className={cn(
                'absolute inset-0 z-20 grid cursor-pointer place-items-center rounded-lg backdrop-blur-md transition-colors duration-300',
                isOpen ? 'bg-transparent' : 'bg-[#071d1b]/85 ring-1 ring-[#9fd4d6]/12',
                focusRing
              )}
            >
              <span aria-hidden="true" className="relative block h-2.5 w-5">
                <span
                  className={cn(
                    'absolute inset-x-0 top-0 h-0.5 bg-[#e8f3f2] transition-transform duration-400 motion-reduce:transition-none',
                    EASE,
                    isOpen && 'translate-y-1 rotate-45'
                  )}
                />
                <span
                  className={cn(
                    'absolute inset-x-0 bottom-0 h-0.5 bg-[#e8f3f2] transition-transform duration-400 motion-reduce:transition-none',
                    EASE,
                    isOpen && '-translate-y-1 -rotate-45'
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <span
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute top-0 left-0 z-30 grid size-14 place-items-center rounded-full bg-[#c6f56f] text-[#03110f] opacity-0"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-5"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </span>
    </section>
  );
}
