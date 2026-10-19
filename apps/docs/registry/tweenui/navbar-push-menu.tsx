'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, CustomEase);
if (!CustomEase.get('navbar-push')) CustomEase.create('navbar-push', '0.5,0,0,1');

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface NavbarPushMenuLink {
  label: string;
  href: string;
  image: string;
}

export interface NavbarPushMenuProps extends Omit<ComponentPropsWithoutRef<'section'>, 'children'> {
  brand?: string;
  logo?: ReactNode;
  homeHref?: string;
  links?: NavbarPushMenuLink[];
  currentHref?: string;
  children?: ReactNode;
}

const SITE = 'https://tween-ui.vercel.app';
const REPO = 'https://github.com/StaticMania/tween-ui';

const poster = (kind: 'block' | 'component', name: string) =>
  `${SITE}/media/${kind}s/${name}-poster.webp`;

const DEFAULT_LINKS: NavbarPushMenuLink[] = [
  { label: 'Home', href: '/', image: poster('block', 'gyro-gallery') },
  { label: 'Components', href: '/components', image: poster('component', 'sliding-tabs') },
  { label: 'Blocks', href: '/components#blocks', image: poster('block', 'shutter-slider') },
  {
    label: 'Changelog',
    href: `${REPO}/blob/main/CHANGELOG.md`,
    image: poster('block', 'kinetic-type-ring'),
  },
  {
    label: 'Contribute',
    href: `${REPO}/blob/main/CONTRIBUTING.md`,
    image: poster('block', 'integration-hub'),
  },
  { label: 'GitHub', href: REPO, image: poster('block', 'footer-wordmark-rise') },
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

const CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

const SHOW_BLUR_AFTER = 80;
const SCROLL_TOLERANCE = 6;
const CARD_RADIUS = 16;

const EASE_OUT = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

const focusRing =
  'rounded-xs focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6f56f]';

const blurLayers = [0, 1, 2, 3, 4, 5].map((layer): CSSProperties => {
  const reach = 100 - 14 * layer;
  const mask = `linear-gradient(to bottom, #000 0%, #000 ${Math.max(0, reach - 30)}%, transparent ${reach}%)`;
  const blur = `blur(${18 * 2 ** (layer - 5)}px)`;
  return {
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
    maskImage: mask,
    WebkitMaskImage: mask,
  };
});

const cleanHref = (href: string) => href.split(/[?#]/)[0]?.replace(/\/+$/, '') || '/';

const isExternal = (href: string) => /^https?:/.test(href);

const externalProps = (href: string) =>
  isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

const RollLabel = ({ label }: { label: string }) => {
  return (
    <span aria-hidden="true" className="block overflow-hidden leading-[1.25]">
      {Array.from(label).map((char, index) => (
        <span
          key={`${char}-${index}`}
          className={cn(
            'inline-block whitespace-pre [text-shadow:0_1.25em_currentColor]',
            'transition-transform duration-500 group-hover/toggle:-translate-y-full group-focus-visible/toggle:-translate-y-full',
            'ease-[cubic-bezier(0.25,0.1,0.25,1)]',
            'motion-reduce:transition-none motion-reduce:group-hover/toggle:translate-y-0 motion-reduce:group-focus-visible/toggle:translate-y-0'
          )}
          style={{ transitionDelay: `${index * 40}ms` }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

const ArrowIcon = () => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 11.5 11.5"
      fill="none"
      className={cn(
        'size-2.5 shrink-0 transition-transform duration-500 group-hover/card:rotate-45 group-focus-visible/card:rotate-45 motion-reduce:transition-none',
        EASE_OUT
      )}
    >
      <path
        d="M0.75 10.75L10.75 0.75M10.75 8.25V0.75H3.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const SamplePage = ({ linkCount }: { linkCount: number }) => {
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
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(38%_46%_at_88%_12%,rgb(198_245_111/0.13),transparent_70%),radial-gradient(55%_60%_at_8%_100%,rgb(4_95_100/0.6),transparent_72%),radial-gradient(40%_36%_at_45%_0%,rgb(159_212_214/0.1),transparent_70%)]"
      />
      <div className={cn(CONTAINER, 'flex flex-1 items-center')}>
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.04] py-2 pr-4 pl-2.5 text-[10px] leading-none font-medium tracking-[0.2em] text-[#9fd4d6] uppercase ring-1 ring-white/10">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full bg-[#c6f56f] shadow-[0_0_5px_#c6f56f,0_0_12px_#c6f56f]"
            />
            {linkCount} pages behind one button
          </p>
          <h2
            id={headingId}
            className="mt-8 text-[40px] leading-[0.98] font-medium tracking-[-0.045em] text-balance text-[#e8f3f2] sm:text-6xl md:text-7xl lg:text-[80px]"
          >
            The page steps back.
            <br />
            The <span className="text-[#c6f56f]">menu</span> was always there.
          </h2>
          <p className="mx-auto mt-6 max-w-[34rem] text-[15px] leading-relaxed text-pretty text-[#e8f3f2]/60 sm:mt-8 sm:text-base md:text-lg">
            Press Menu at the top right. This page drops into a card and the links behind it wipe up
            one after another. Click the card or press Escape to bring it back.
          </p>
        </div>
      </div>
    </section>
  );
};

const NavbarPushMenu = ({
  brand = 'Tween UI',
  logo = TWEEN_MARK,
  homeHref = '/',
  links = DEFAULT_LINKS,
  currentHref = '/',
  children,
  className,
  ...props
}: NavbarPushMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();

  const rootRef = useRef<HTMLElement>(null);
  const headroomRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  const barTopRef = useRef<HTMLSpanElement>(null);
  const barBottomRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isOpenRef = useRef(false);
  const syncHeadroomRef = useRef<() => void>(() => {});

  const current = links.findIndex((link) => cleanHref(link.href) === cleanHref(currentHref));

  const measureCard = useCallback(() => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return { y: 0, scale: 1, radius: 0 };
    const width = root.clientWidth;
    const gutter = width < 640 ? 12 : 24;
    const scale = 1 - (2 * gutter) / width;
    const y = Math.round(
      list.getBoundingClientRect().bottom - root.getBoundingClientRect().top + 32
    );
    return { y, scale, radius: CARD_RADIUS / scale };
  }, []);

  const { contextSafe } = useGSAP({ scope: rootRef });

  const animate = contextSafe((open: boolean) => {
    const menu = menuRef.current;
    const page = pageRef.current;
    if (!menu || !page) return;
    const media = [...menu.querySelectorAll<HTMLElement>('[data-menu-media]')];
    const images = [...menu.querySelectorAll<HTMLElement>('[data-menu-image]')];
    const labels = [...menu.querySelectorAll<HTMLElement>('[data-menu-label]')];
    const barTop = barTopRef.current;
    const barBottom = barBottomRef.current;
    timelineRef.current?.kill();

    if (open) {
      const card = measureCard();
      gsap.set(menu, { visibility: 'visible' });
      gsap.set(page, { transformOrigin: '50% 0%' });
      timelineRef.current = gsap
        .timeline({ defaults: { ease: 'navbar-push' } })
        .to(page, { y: card.y, scale: card.scale, borderRadius: card.radius, duration: 1.2 }, 0)
        .to(
          circleRef.current,
          {
            backgroundColor: '#c6f56f',
            borderColor: '#c6f56f',
            color: '#03110f',
            duration: 0.6,
            ease: 'power2.out',
          },
          0.1
        )
        .to(barTop, { y: 3, rotate: 45, duration: 0.8 }, 0.1)
        .to(barBottom, { y: -3, rotate: -45, duration: 0.8 }, 0.1)
        .set([...media, ...labels], { autoAlpha: 1 }, 0)
        .fromTo(
          media,
          { clipPath: 'inset(100% 0% 0% 0% round 8px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 8px)', duration: 1.1, stagger: 0.06 },
          0.3
        )
        .fromTo(images, { scale: 1.3 }, { scale: 1, duration: 1.3, stagger: 0.06 }, 0.3)
        .fromTo(labels, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.06 }, 0.45);
    } else {
      timelineRef.current = gsap
        .timeline({
          defaults: { ease: 'navbar-push' },
          onComplete: () => {
            gsap.set(menu, { clearProps: 'visibility' });
            gsap.set([...media, ...labels], { clearProps: 'opacity,visibility' });
            gsap.set(page, { clearProps: 'transform,transformOrigin,borderRadius' });
          },
        })
        .to([...media, ...labels], { autoAlpha: 0, duration: 0.35, ease: 'power1.out' }, 0)
        .to(page, { y: 0, scale: 1, borderRadius: 0, duration: 1 }, 0)
        .to(
          circleRef.current,
          {
            backgroundColor: 'rgba(198,245,111,0)',
            borderColor: 'rgba(232,243,242,0.24)',
            color: '#e8f3f2',
            duration: 0.5,
            ease: 'power2.out',
            clearProps: 'backgroundColor,borderColor,color',
          },
          0
        )
        .to([barTop, barBottom], { y: 0, rotate: 0, duration: 0.7 }, 0);
    }

    if (prefersReducedMotion()) timelineRef.current.progress(1);
  });

  const setOpen = useCallback(
    (open: boolean) => {
      if (open === isOpenRef.current) return;
      isOpenRef.current = open;
      setIsOpen(open);
      animate(open);
      syncHeadroomRef.current();
    },
    [animate]
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    const headroom = headroomRef.current;
    const blur = blurRef.current;
    if (!scroller || !headroom || !blur) return;
    let lastY = scroller.scrollTop;
    let isHidden = false;
    let isQueued = false;

    const sync = () => {
      isQueued = false;
      const y = scroller.scrollTop;
      const delta = y - lastY;
      const isNearTop = y <= SHOW_BLUR_AFTER;
      if (isOpenRef.current || isNearTop) isHidden = false;
      else if (Math.abs(delta) >= SCROLL_TOLERANCE) isHidden = delta > 0;
      if (isOpenRef.current || isNearTop || Math.abs(delta) >= SCROLL_TOLERANCE) lastY = y;
      headroom.style.transform = isHidden ? 'translateY(calc(-100% - 48px))' : '';
      blur.style.opacity = !isOpenRef.current && !isNearTop ? '1' : '0';
    };

    const queue = () => {
      if (isQueued) return;
      isQueued = true;
      requestAnimationFrame(sync);
    };

    syncHeadroomRef.current = queue;
    scroller.addEventListener('scroll', queue, { passive: true });
    sync();
    return () => {
      syncHeadroomRef.current = () => {};
      scroller.removeEventListener('scroll', queue);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const page = pageRef.current;
    if (!isOpen || !root || !page) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const observer = new ResizeObserver(() => {
      if (timelineRef.current?.isActive()) return;
      const card = measureCard();
      gsap.set(page, { y: card.y, scale: card.scale, borderRadius: card.radius });
    });

    document.addEventListener('keydown', handleKeyDown);
    observer.observe(root);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [isOpen, measureCard, setOpen]);

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
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30">
        <div
          ref={headroomRef}
          className={cn('relative transition-transform duration-700', EASE_OUT)}
        >
          <div
            ref={blurRef}
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-[calc(100%+40px)] opacity-0 transition-opacity duration-400"
          >
            {blurLayers.map((style, index) => (
              <div key={index} className="absolute inset-0" style={style} />
            ))}
          </div>
          <div className={cn(CONTAINER, 'flex items-center justify-between py-4 sm:py-6')}>
            <a
              href={homeHref}
              className={cn('pointer-events-auto flex items-center gap-2.5', focusRing)}
            >
              {logo}
              <span className="text-lg font-semibold tracking-tight text-[#e8f3f2]">{brand}</span>
            </a>
            <button
              ref={toggleRef}
              type="button"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls={menuId}
              onClick={() => setOpen(!isOpenRef.current)}
              className="group/toggle pointer-events-auto flex cursor-pointer items-center gap-3 rounded-full text-sm tracking-[0.14em] text-[#e8f3f2] uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6f56f] sm:gap-4"
            >
              <RollLabel label="Menu" />
              <span
                ref={circleRef}
                aria-hidden="true"
                className="relative block size-11 rounded-full border border-[#e8f3f2]/24"
              >
                <span
                  ref={barTopRef}
                  className="absolute top-[18px] left-1/2 h-px w-5 -translate-x-1/2 bg-current"
                />
                <span
                  ref={barBottomRef}
                  className="absolute top-[24px] left-1/2 h-px w-5 -translate-x-1/2 bg-current"
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
        className="invisible absolute inset-x-0 top-0 z-0"
      >
        <div aria-hidden="true" className="h-19 sm:h-23" />
        <nav aria-label="Main" className={cn(CONTAINER, 'pt-4 sm:pt-6')}>
          <ul
            ref={listRef}
            className="group/list grid grid-cols-3 gap-x-2 gap-y-5 sm:gap-x-4 lg:grid-cols-6"
          >
            {links.map((link, index) => (
              <li key={`${link.label}-${link.href}`}>
                <a
                  href={link.href}
                  {...externalProps(link.href)}
                  aria-current={index === current ? 'page' : undefined}
                  onClick={(event) => handleLinkClick(event, index)}
                  className="group/card block rounded-lg transition-opacity duration-500 group-has-[a:hover]/list:opacity-50 hover:opacity-100! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6f56f]"
                >
                  <span
                    data-menu-media=""
                    className="relative block aspect-[1.2] overflow-hidden rounded-lg bg-[#9fd4d6]/5"
                  >
                    <img
                      src={link.image}
                      alt=""
                      draggable={false}
                      loading="lazy"
                      data-menu-image=""
                      className={cn(
                        'block size-full object-cover object-top transition-transform duration-700 group-hover/card:scale-105 motion-reduce:transition-none',
                        EASE_OUT
                      )}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-lg border border-[#9fd4d6]/12"
                    />
                  </span>
                  <span className="mt-2.5 block overflow-hidden sm:mt-3">
                    <span
                      data-menu-label=""
                      className={cn(
                        'flex items-center justify-between gap-2 text-xs tracking-[0.14em] uppercase',
                        index === current
                          ? 'text-[#c6f56f]'
                          : 'text-[#9fd4d6]/60 transition-colors duration-300 group-hover/card:text-[#e8f3f2] group-focus-visible/card:text-[#e8f3f2]'
                      )}
                    >
                      <span className="truncate">
                        {String(index + 1).padStart(2, '0')} {'//'} {link.label}
                      </span>
                      <ArrowIcon />
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        ref={pageRef}
        className="absolute inset-0 z-10 overflow-hidden bg-[#071d1b] shadow-[0_-24px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-[#9fd4d6]/10 will-change-transform"
      >
        <div
          ref={scrollerRef}
          inert={isOpen}
          data-lenis-prevent=""
          className="h-full [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
        >
          {children ?? <SamplePage linkCount={links.length} />}
        </div>
        {isOpen ? (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-10 cursor-pointer"
          />
        ) : null}
      </div>
    </section>
  );
};

export default NavbarPushMenu;
