'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import DotBloomButton from './dot-bloom-button';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export type NavbarGooeyBloomIcon =
  'bloom' | 'drop' | 'orbit' | 'spark' | 'layers' | 'wave' | 'bolt' | 'shield';

export interface NavbarGooeyBloomLink {
  label: string;
  href: string;
  description?: string;
  icon?: NavbarGooeyBloomIcon;
}

export interface NavbarGooeyBloomFeature {
  title: string;
  description: string;
  href: string;
  cta?: string;
  image?: string;
}

export interface NavbarGooeyBloomMenu {
  label: string;
  href?: string;
  columns?: NavbarGooeyBloomLink[][];
  feature?: NavbarGooeyBloomFeature;
}

export interface NavbarGooeyBloomProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'children'
> {
  brand?: string;
  logo?: ReactNode;
  homeHref?: string;
  menus?: NavbarGooeyBloomMenu[];
  currentHref?: string;
  actionLabel?: string;
  onActionClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}

const CLOSE_DELAY = 160;
const HOVER_INTENT = 70;
const HIDE_AFTER = 220;
const PANEL_GAP = 12;
const PANEL_RADIUS = 26;
const DROP_SIZE = 22;
const EDGE_LEAD = 520;
const EDGE_TRAIL = 170;
const TAIL_PULL = 110;
const PANEL_LEAD = 300;
const PANEL_TRAIL = 140;
const PANEL_PULL = 260;
const BUMP_RADIUS = 14;
const BUMP_RISE = 6;
const BUMP_PULL = 150;
const ICON_SIZE = 32;
const ICON_DROP = 14;
const SCROLL_TOLERANCE = 6;
const DESKTOP_QUERY = '(min-width: 1024px)';

const CONTAINER = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';
const EASE_OUT_EXPO = 'ease-[cubic-bezier(0.16,1,0.3,1)]';
const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c6f56f]';

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

const ICON_PATHS: Record<NavbarGooeyBloomIcon, ReactNode> = {
  bloom: (
    <>
      <circle cx="12" cy="9" r="3.6" />
      <circle cx="8.6" cy="15" r="3.6" />
      <circle cx="15.4" cy="15" r="3.6" />
    </>
  ),
  drop: <path d="M12 3.5c3.2 3.4 5.5 6 5.5 9a5.5 5.5 0 1 1-11 0c0-3 2.3-5.6 5.5-9Z" />,
  orbit: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <ellipse cx="12" cy="12" rx="9" ry="4.4" transform="rotate(-24 12 12)" />
    </>
  ),
  spark: <path d="M12 3.5l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5-6.5-2 6.5-2 2-6.5Z" />,
  layers: (
    <>
      <path d="M12 4 4 8.5l8 4.5 8-4.5L12 4Z" />
      <path d="m4 12.5 8 4.5 8-4.5" />
    </>
  ),
  wave: <path d="M3 13.5c2-3.6 4-3.6 6 0s4 3.6 6 0 4-3.6 6 0" />,
  bolt: <path d="M13.5 3 6 13.5h5l-1 7.5 8-11h-5l.5-7Z" />,
  shield: <path d="M12 3.5 19 6v6c0 4.2-3 7-7 8.5-4-1.5-7-4.3-7-8.5V6l7-2.5Z" />,
};

const DEFAULT_MENUS: NavbarGooeyBloomMenu[] = [
  {
    label: 'Work',
    columns: [
      [
        {
          label: 'Case studies',
          href: '#',
          description: 'Shipped products, start to finish.',
          icon: 'bloom',
        },
        {
          label: 'Experiments',
          href: '#',
          description: 'Small ideas, pushed too far.',
          icon: 'spark',
        },
        {
          label: 'Playground',
          href: '#',
          description: 'Live code you can poke at.',
          icon: 'orbit',
        },
        {
          label: 'Archive',
          href: '#',
          description: 'Everything since 2019.',
          icon: 'layers',
        },
      ],
      [
        {
          label: 'Motion kit',
          href: '#',
          description: 'Easing, springs and timing.',
          icon: 'wave',
        },
        {
          label: 'Interface kit',
          href: '#',
          description: 'Bars, panels and overlays.',
          icon: 'drop',
        },
        {
          label: 'Brand systems',
          href: '#',
          description: 'Marks that know how to move.',
          icon: 'shield',
        },
        {
          label: 'Performance',
          href: '#',
          description: 'Sixty frames, no excuses.',
          icon: 'bolt',
        },
      ],
    ],
    feature: {
      title: 'Bloom 2.0',
      description: 'The metaball engine under this bar, documented end to end.',
      href: '#',
      cta: 'Read the notes',
    },
  },
  {
    label: 'Components',
    columns: [
      [
        {
          label: 'Navbars',
          href: '/components',
          description: 'Eleven ways to hold a menu.',
          icon: 'layers',
        },
        {
          label: 'Buttons',
          href: '/components',
          description: 'Press, roll, bloom.',
          icon: 'drop',
        },
        {
          label: 'Carousels',
          href: '/components',
          description: 'Arcs, shutters and reels.',
          icon: 'orbit',
        },
        {
          label: 'Loaders',
          href: '/components',
          description: 'Waiting, but on purpose.',
          icon: 'spark',
        },
        {
          label: 'Type',
          href: '/components',
          description: 'Letters that misbehave.',
          icon: 'wave',
        },
      ],
    ],
  },
  {
    label: 'Studio',
    columns: [
      [
        { label: 'About', href: '#', description: 'Four people, one room.', icon: 'bloom' },
        { label: 'Team', href: '#', description: 'Who makes what.', icon: 'shield' },
        { label: 'Careers', href: '#', description: 'Two seats open.', icon: 'bolt' },
        { label: 'Press', href: '#', description: 'Logos and words.', icon: 'layers' },
      ],
      [
        { label: 'Contact', href: '#', description: 'Say hello properly.', icon: 'drop' },
        {
          label: 'Changelog',
          href: '#',
          description: 'What moved this week.',
          icon: 'wave',
        },
        { label: 'License', href: '#', description: 'What you may ship.', icon: 'orbit' },
        {
          label: 'Support',
          href: '#',
          description: 'We answer on weekdays.',
          icon: 'spark',
        },
      ],
    ],
  },
  { label: 'Journal', href: '#' },
];

const cleanHref = (href: string) => href.split(/[?#]/)[0]?.replace(/\/+$/, '') || '/';

const isExternal = (href: string) => /^https?:/.test(href);

const externalProps = (href: string) =>
  isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const panelWidth = (menu: NavbarGooeyBloomMenu) => {
  const columns = menu.columns?.length ?? 0;
  if (menu.feature) return columns > 1 ? 880 : 720;
  return columns > 1 ? 720 : 360;
};

const panelGrid = (menu: NavbarGooeyBloomMenu) => {
  const columns = menu.columns?.length ?? 0;
  if (menu.feature) return columns > 1 ? 'grid-cols-[1fr_1fr_15rem]' : 'grid-cols-[1fr_15rem]';
  return columns > 1 ? 'grid-cols-2' : 'grid-cols-1';
};

interface Spring {
  x: number;
  v: number;
  t: number;
}

interface GooMotion {
  left: Spring;
  right: Spring;
  tail: Spring;
  panelLeft: Spring;
  panelRight: Spring;
  panelHeight: Spring;
  bump: Spring;
  rowTop: Spring;
  rowBottom: Spring;
  rowLeft: Spring;
  rowWidth: Spring;
  iconTop: Spring;
  iconBottom: Spring;
  iconTail: Spring;
  iconOffset: number;
  look: { scale: number; alpha: number };
  hover: { alpha: number };
  pillShown: boolean;
  panelShown: boolean;
  hoverShown: boolean;
  barBottom: number;
  awake: boolean;
}

const spring = (): Spring => ({ x: 0, v: 0, t: 0 });

const place = (target: Spring, value: number) => {
  target.x = value;
  target.v = 0;
  target.t = value;
};

const snap = (target: Spring) => {
  target.x = target.t;
  target.v = 0;
};

const stepSpring = (target: Spring, stiffness: number, dt: number) => {
  const force = stiffness * (target.t - target.x) - 2 * Math.sqrt(stiffness) * target.v;
  target.v += force * dt;
  target.x += target.v * dt;
};

const atRest = (target: Spring, epsilon: number) =>
  Math.abs(target.t - target.x) < epsilon && Math.abs(target.v) < epsilon;

const createMotion = (): GooMotion => ({
  left: spring(),
  right: spring(),
  tail: spring(),
  panelLeft: spring(),
  panelRight: spring(),
  panelHeight: spring(),
  bump: spring(),
  rowTop: spring(),
  rowBottom: spring(),
  rowLeft: spring(),
  rowWidth: spring(),
  iconTop: spring(),
  iconBottom: spring(),
  iconTail: spring(),
  iconOffset: 0,
  look: { scale: 0.4, alpha: 0 },
  hover: { alpha: 0 },
  pillShown: false,
  panelShown: false,
  hoverShown: false,
  barBottom: 60,
  awake: false,
});

const springsOf = (motion: GooMotion) => [
  motion.left,
  motion.right,
  motion.tail,
  motion.panelLeft,
  motion.panelRight,
  motion.panelHeight,
  motion.bump,
  motion.rowTop,
  motion.rowBottom,
  motion.rowLeft,
  motion.rowWidth,
  motion.iconTop,
  motion.iconBottom,
  motion.iconTail,
];

const settleMotion = (motion: GooMotion) => {
  const center = (motion.left.t + motion.right.t) / 2;
  motion.tail.t = center;
  motion.bump.t = center;
  motion.iconTail.t = (motion.iconTop.t + motion.iconBottom.t) / 2;
  springsOf(motion).forEach(snap);
};

const motionAtRest = (motion: GooMotion) =>
  springsOf(motion).every((item) => atRest(item, 0.05)) &&
  !gsap.isTweening(motion.look) &&
  !gsap.isTweening(motion.hover);

const steer = (start: Spring, end: Spring) => {
  const heading = start.t + end.t - start.x - end.x;
  return {
    start: heading > 1 ? EDGE_TRAIL : EDGE_LEAD,
    end: heading < -1 ? EDGE_TRAIL : EDGE_LEAD,
  };
};

const px = (value: number) => Math.round(value * 100) / 100;

const roundedRect = (left: number, right: number, top: number, height: number) => {
  const radius = px(Math.max(0, Math.min(PANEL_RADIUS, (right - left) / 2, height / 2)));
  const bottom = px(top + height);
  const l = px(left);
  const r = px(right);
  return `M${px(l + radius)},${top}H${px(r - radius)}A${radius},${radius} 0 0 1 ${r},${px(top + radius)}V${px(bottom - radius)}A${radius},${radius} 0 0 1 ${px(r - radius)},${bottom}H${px(l + radius)}A${radius},${radius} 0 0 1 ${l},${px(bottom - radius)}V${px(top + radius)}A${radius},${radius} 0 0 1 ${px(l + radius)},${top}Z`;
};

const ArrowIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
};

const ChevronIcon = ({ className }: { className?: string }) => {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 6" fill="none" className={className}>
      <path
        d="M1 1l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const MenuGlyph = ({ icon, className }: { icon: NavbarGooeyBloomIcon; className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {ICON_PATHS[icon]}
    </svg>
  );
};

const FeatureArt = () => {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gooId = `feature-goo-${rawId}`;
  const limeId = `feature-lime-${rawId}`;

  return (
    <span aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#081f1a]">
      <span className="absolute inset-0 bg-[radial-gradient(120%_130%_at_50%_-10%,#17493c,#081f1a_70%)]" />
      <span className="absolute inset-0 [background-image:radial-gradient(rgb(159_212_214/0.16)_1px,transparent_1px)] [mask-image:radial-gradient(72%_72%_at_50%_50%,#000,transparent)] [background-size:10px_10px] opacity-60" />
      <span className="absolute top-1/2 left-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c6f56f]/15 blur-2xl" />
      <svg viewBox="0 0 240 112" className="absolute inset-0 size-full">
        <defs>
          <filter id={gooId} x="-25%" y="-80%" width="150%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
          <linearGradient id={limeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9ffc2" />
            <stop offset="0.45" stopColor="#c6f56f" />
            <stop offset="1" stopColor="#a6df58" />
          </linearGradient>
        </defs>
        <g stroke="#9fd4d6" fill="none">
          <ellipse cx="120" cy="56" rx="88" ry="30" strokeOpacity="0.14" />
          <ellipse cx="120" cy="56" rx="62" ry="42" strokeOpacity="0.07" />
        </g>
        <g filter={`url(#${gooId})`} fill={`url(#${limeId})`}>
          <rect x="74" y="42" width="84" height="30" rx="15" />
          <circle cx="66" cy="60" r="8.5" />
          <circle cx="162" cy="52" r="7" />
          <circle cx="168" cy="63" r="4.5" />
        </g>
      </svg>
    </span>
  );
};

const SamplePage = () => {
  return (
    <div id="top" className="[container-type:size] relative h-full overflow-hidden bg-[#03110f]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(46%_60%_at_50%_-10%,rgb(198_245_111/0.12),transparent_70%),radial-gradient(50%_60%_at_90%_20%,rgb(4_95_100/0.55),transparent_72%),radial-gradient(45%_55%_at_4%_60%,rgb(4_95_100/0.3),transparent_70%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgb(159_212_214/0.05)_0_1px,transparent_1px_56px),repeating-linear-gradient(0deg,rgb(159_212_214/0.04)_0_1px,transparent_1px_56px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
      />

      <section className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pt-[clamp(5rem,16cqh,8rem)] pb-[clamp(1.5rem,5cqh,3.5rem)] sm:px-6 lg:px-8">
        <p className="inline-flex w-fit items-center gap-2.5 rounded-full bg-white/[0.04] py-[clamp(0.4rem,1.1cqh,0.55rem)] pr-4 pl-2.5 text-[10px] leading-none font-medium tracking-[0.22em] text-[#9fd4d6] uppercase ring-1 ring-white/10">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-[#c6f56f] shadow-[0_0_6px_#c6f56f,0_0_16px_#c6f56f]"
          />
          Metaball navigation
        </p>
        <h2 className="mt-[clamp(1.1rem,3.4cqh,1.75rem)] max-w-[36rem] text-[clamp(2.35rem,7.8cqh,4.75rem)] leading-[0.95] font-medium tracking-[-0.045em] text-balance text-[#e8f3f2]">
          The menu that <span className="text-[#c6f56f]">melts</span> between links.
        </h2>
        <p className="mt-[clamp(0.9rem,2.4cqh,1.5rem)] max-w-[36rem] text-[clamp(0.84rem,1.9cqh,1rem)] leading-relaxed text-pretty text-[#9fd4d6]/70">
          Point at a link. A pool of lime stretches across the bar, sheds a few droplets on the way,
          and settles under the label. Open a menu and the card below re-forms around it.
        </p>
        <div className="mt-[clamp(1.4rem,4cqh,2.25rem)] flex flex-wrap items-center gap-3">
          <a
            href="#top"
            className={cn(
              'inline-flex h-[clamp(2.5rem,6.2cqh,2.75rem)] items-center gap-2 rounded-full bg-[#c6f56f] px-[clamp(1rem,2.4cqh,1.25rem)] text-[clamp(0.82rem,1.8cqh,0.875rem)] font-medium text-[#03110f] transition-transform duration-300 active:scale-[0.97]',
              EASE_OUT_EXPO,
              focusRing
            )}
          >
            See it again
            <ArrowIcon className="size-4" />
          </a>
          <a
            href="#top"
            className={cn(
              'inline-flex h-[clamp(2.5rem,6.2cqh,2.75rem)] items-center rounded-full border border-[#9fd4d6]/20 px-[clamp(1rem,2.4cqh,1.25rem)] text-[clamp(0.82rem,1.8cqh,0.875rem)] text-[#e8f3f2]/80 transition-colors duration-300 hover:border-[#9fd4d6]/45 hover:text-[#e8f3f2]',
              focusRing
            )}
          >
            Read the props
          </a>
        </div>
      </section>
    </div>
  );
};

const NavbarGooeyBloom = ({
  brand = 'Tween UI',
  logo = TWEEN_MARK,
  homeHref = '/',
  menus = DEFAULT_MENUS,
  currentHref = '/',
  actionLabel = 'Get started',
  onActionClick,
  children,
  className,
  ...props
}: NavbarGooeyBloomProps) => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accordion, setAccordion] = useState<string | null>(null);

  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gooId = `goo-${rawId}`;
  const linkGooId = `link-goo-${rawId}`;
  const panelGooId = `panel-goo-${rawId}`;
  const panelId = `panel-${rawId}`;
  const mobileId = `mobile-${rawId}`;

  const rootRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<SVGPathElement>(null);
  const bumpRef = useRef<SVGCircleElement>(null);
  const hoverRef = useRef<{ row: HTMLElement; blob: HTMLElement; drop: HTMLElement } | null>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const coreRef = useRef<HTMLSpanElement>(null);
  const dropRef = useRef<HTMLSpanElement>(null);
  const inkRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const inkBoxes = useRef<Array<{ left: number; width: number } | null>>([]);
  const motion = useRef<GooMotion>(createMotion());
  const activeRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimer = useRef<number | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const pendingHover = useRef<{ menu: NavbarGooeyBloomMenu; el: HTMLElement } | null>(null);
  const pointerPos = useRef({ x: 0, y: 0 });
  const mobileRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<string | null>(null);
  const skipFocusOpen = useRef(false);

  const current = (href: string) => {
    if (href.startsWith('#')) return false;
    const link = cleanHref(href);
    const page = cleanHref(currentHref);
    return link === page || (link !== '/' && page.startsWith(`${link}/`));
  };

  const { contextSafe } = useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const bar = barRef.current;
      if (!bar) return;
      const intro = bar.querySelectorAll('[data-intro]');
      gsap.fromTo(
        bar,
        { y: -28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: 'expo.out',
          clearProps: 'transform,opacity,visibility',
        }
      );
      gsap.fromTo(
        intro,
        { y: -8, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.06,
          delay: 0.12,
          clearProps: 'transform,opacity,visibility',
        }
      );
    },
    { scope: rootRef }
  );

  const measureInk = useCallback(() => {
    const bar = barRef.current;
    if (!bar) return;
    const barRect = bar.getBoundingClientRect();
    inkRefs.current.forEach((ink, index) => {
      const host = ink?.parentElement;
      if (!host) return;
      const box = host.getBoundingClientRect();
      inkBoxes.current[index] = { left: box.left - barRect.left, width: box.width };
    });
  }, []);

  const draw = useCallback(() => {
    const m = motion.current;
    const left = m.left.x;
    const right = m.right.x;
    const width = Math.max(right - left, 0);
    const stretch = width - (m.right.t - m.left.t);
    const thin = 1 - clamp(stretch / 320, 0, 0.18);
    const { scale, alpha } = m.look;
    const pill = pillRef.current;
    const core = coreRef.current;
    const drop = dropRef.current;

    if (pill && core && drop) {
      pill.style.width = `${width}px`;
      pill.style.transform = `translate3d(${left}px,0,0)`;
      pill.style.opacity = `${alpha}`;
      core.style.transform = `scale(${scale},${scale * thin})`;
      drop.style.transform = `translate3d(${m.tail.x - DROP_SIZE / 2}px,0,0) scale(${scale})`;
      drop.style.opacity = `${alpha}`;
    }

    inkRefs.current.forEach((ink, index) => {
      const box = inkBoxes.current[index];
      if (!ink || !box) return;
      const start = clamp(left - box.left, 0, box.width);
      const end = clamp(right - box.left, 0, box.width);
      ink.style.clipPath = `inset(-4px ${box.width - end}px -4px ${start}px)`;
      ink.style.opacity = `${alpha}`;
    });

    const hover = hoverRef.current;
    if (hover) {
      const alpha = m.hover.alpha;
      const iconHeight = Math.max(m.iconBottom.x - m.iconTop.x, 0);
      const iconStretch = iconHeight - (m.iconBottom.t - m.iconTop.t);
      const iconWidth = ICON_SIZE * (1 - clamp(iconStretch / 160, 0, 0.3));
      const iconX = m.rowLeft.x + m.iconOffset;
      hover.row.style.transform = `translate3d(${m.rowLeft.x}px,${m.rowTop.x}px,0)`;
      hover.row.style.width = `${Math.max(m.rowWidth.x, 0)}px`;
      hover.row.style.height = `${Math.max(m.rowBottom.x - m.rowTop.x, 0)}px`;
      hover.row.style.opacity = `${alpha}`;
      hover.blob.style.transform = `translate3d(${iconX + (ICON_SIZE - iconWidth) / 2}px,${m.iconTop.x}px,0)`;
      hover.blob.style.width = `${iconWidth}px`;
      hover.blob.style.height = `${iconHeight}px`;
      hover.blob.style.opacity = `${alpha}`;
      hover.drop.style.transform = `translate3d(${iconX + (ICON_SIZE - ICON_DROP) / 2}px,${m.iconTail.x - ICON_DROP / 2}px,0)`;
      hover.drop.style.opacity = `${alpha}`;
    }

    const shape = shapeRef.current;
    const bump = bumpRef.current;
    const body = bodyRef.current;
    if (!m.panelShown || !shape || !bump || !body) return;
    const top = m.barBottom + PANEL_GAP;
    const height = Math.max(m.panelHeight.x, 0);
    const panelWidth = Math.max(m.panelRight.x - m.panelLeft.x, 0);
    const bumpRadius = Math.max(0, Math.min(BUMP_RADIUS, panelWidth / 4, height / 3));
    shape.setAttribute('d', roundedRect(m.panelLeft.x, m.panelRight.x, top, height));
    const edge = Math.min(PANEL_RADIUS, panelWidth / 2) + bumpRadius;
    const bumpX =
      panelWidth > edge * 2
        ? clamp(m.bump.x, m.panelLeft.x + edge, m.panelRight.x - edge)
        : m.panelLeft.x + panelWidth / 2;
    bump.setAttribute('cx', `${px(bumpX)}`);
    bump.setAttribute('cy', `${px(top + bumpRadius - BUMP_RISE * (bumpRadius / BUMP_RADIUS))}`);
    bump.setAttribute('r', `${px(bumpRadius)}`);
    body.style.top = `${top}px`;
    body.style.clipPath = `path('${roundedRect(m.panelLeft.x, m.panelRight.x, 0, height)}')`;
  }, []);

  useEffect(() => {
    const tick = (_time: number, deltaTime: number) => {
      const m = motion.current;
      if (!m.awake) return;
      const elapsed = Math.min(deltaTime / 1000, 0.05);
      const steps = Math.max(1, Math.ceil(elapsed * 120));
      const dt = elapsed / steps;
      const pill = steer(m.left, m.right);
      const row = steer(m.rowTop, m.rowBottom);
      const icon = steer(m.iconTop, m.iconBottom);
      const panelHeading = m.panelLeft.t + m.panelRight.t - m.panelLeft.x - m.panelRight.x;
      const panelLeftPull = panelHeading > 1 ? PANEL_TRAIL : PANEL_LEAD;
      const panelRightPull = panelHeading < -1 ? PANEL_TRAIL : PANEL_LEAD;

      for (let step = 0; step < steps; step += 1) {
        stepSpring(m.left, pill.start, dt);
        stepSpring(m.right, pill.end, dt);
        const center = (m.left.x + m.right.x) / 2;
        m.tail.t = center;
        stepSpring(m.tail, TAIL_PULL, dt);
        if (m.panelShown) {
          m.bump.t = center;
          stepSpring(m.panelLeft, panelLeftPull, dt);
          stepSpring(m.panelRight, panelRightPull, dt);
          stepSpring(m.panelHeight, PANEL_PULL, dt);
          stepSpring(m.bump, BUMP_PULL, dt);
        }
        stepSpring(m.rowTop, row.start, dt);
        stepSpring(m.rowBottom, row.end, dt);
        stepSpring(m.rowLeft, EDGE_LEAD, dt);
        stepSpring(m.rowWidth, EDGE_LEAD, dt);
        stepSpring(m.iconTop, icon.start, dt);
        stepSpring(m.iconBottom, icon.end, dt);
        m.iconTail.t = (m.iconTop.x + m.iconBottom.x) / 2;
        stepSpring(m.iconTail, TAIL_PULL, dt);
      }

      const center = (m.left.x + m.right.x) / 2;
      m.tail.x = m.right.x - m.left.x > 4 ? clamp(m.tail.x, m.left.x + 2, m.right.x - 2) : center;
      m.iconTail.x = clamp(m.iconTail.x, m.iconTop.x - 2, m.iconBottom.x + 2);

      if (motionAtRest(m)) {
        settleMotion(m);
        m.awake = false;
      }
      draw();
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [draw]);

  const hideBlob = contextSafe(() => {
    const m = motion.current;
    if (!m.pillShown) return;
    m.pillShown = false;
    const center = (m.left.t + m.right.t) / 2;
    m.left.t = center - 20;
    m.right.t = center + 20;
    gsap.killTweensOf(m.look);
    if (prefersReducedMotion()) {
      m.look.scale = 0.4;
      m.look.alpha = 0;
      settleMotion(m);
      draw();
      return;
    }
    gsap.to(m.look, { scale: 0.4, alpha: 0, duration: 0.32, ease: 'power2.inOut' });
    m.awake = true;
  });

  const moveBlob = contextSafe((el: HTMLElement) => {
    const bar = barRef.current;
    if (!bar) return;
    const m = motion.current;
    const base = bar.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const left = box.left - base.left;
    const center = left + box.width / 2;
    activeRef.current = el;
    measureInk();
    gsap.killTweensOf(m.look);

    if (!m.pillShown && m.look.alpha < 0.05) {
      place(m.left, center - 20);
      place(m.right, center + 20);
      place(m.tail, center);
      m.look.scale = 0.4;
    }
    m.pillShown = true;
    m.left.t = left;
    m.right.t = left + box.width;

    if (prefersReducedMotion()) {
      m.look.scale = 1;
      m.look.alpha = 1;
      settleMotion(m);
      draw();
      return;
    }
    gsap.to(m.look, { scale: 1, alpha: 1, duration: 0.45, ease: 'power3.out' });
    m.awake = true;
  });

  const resetHover = () => {
    const m = motion.current;
    const hover = hoverRef.current;
    gsap.killTweensOf(m.hover);
    m.hover.alpha = 0;
    m.hoverShown = false;
    hoverRef.current = null;
    if (hover) gsap.set([hover.row, hover.blob, hover.drop], { opacity: 0 });
  };

  const moveHover = contextSafe((link: HTMLElement) => {
    const section = link.closest<HTMLElement>('[data-section]');
    const icon = link.querySelector<HTMLElement>('[data-icon]');
    const row = section?.querySelector<HTMLElement>('[data-hover-row]');
    const blob = section?.querySelector<HTMLElement>('[data-hover-blob]');
    const drop = section?.querySelector<HTMLElement>('[data-hover-drop]');
    if (!section || !icon || !row || !blob || !drop) return;

    const m = motion.current;
    if (hoverRef.current && hoverRef.current.row !== row) resetHover();
    const fresh = !hoverRef.current || (!m.hoverShown && m.hover.alpha < 0.05);
    hoverRef.current = { row, blob, drop };

    const base = section.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    const tile = icon.getBoundingClientRect();
    const top = box.top - base.top;
    const left = box.left - base.left;
    const iconTop = tile.top - base.top;
    const iconCenter = iconTop + tile.height / 2;
    m.iconOffset = tile.left - box.left;
    gsap.killTweensOf(m.hover);

    if (fresh) {
      place(m.rowTop, top);
      place(m.rowBottom, top + box.height);
      place(m.rowLeft, left);
      place(m.rowWidth, box.width);
      place(m.iconTop, iconCenter - 4);
      place(m.iconBottom, iconCenter + 4);
      place(m.iconTail, iconCenter);
    }
    m.hoverShown = true;
    m.rowTop.t = top;
    m.rowBottom.t = top + box.height;
    m.rowLeft.t = left;
    m.rowWidth.t = box.width;
    m.iconTop.t = iconTop;
    m.iconBottom.t = iconTop + tile.height;

    if (prefersReducedMotion()) {
      m.hover.alpha = 1;
      settleMotion(m);
      draw();
      return;
    }
    gsap.to(m.hover, { alpha: 1, duration: 0.3, ease: 'power2.out' });
    m.awake = true;
  });

  const hideHover = contextSafe(() => {
    const m = motion.current;
    if (!m.hoverShown) return;
    m.hoverShown = false;
    const center = (m.iconTop.t + m.iconBottom.t) / 2;
    m.iconTop.t = center - 4;
    m.iconBottom.t = center + 4;
    gsap.killTweensOf(m.hover);
    if (prefersReducedMotion()) {
      m.hover.alpha = 0;
      settleMotion(m);
      draw();
      return;
    }
    gsap.to(m.hover, { alpha: 0, duration: 0.28, ease: 'power2.out' });
    m.awake = true;
  });

  const getLayout = useCallback((trigger: HTMLElement, section: HTMLElement) => {
    const bar = barRef.current;
    const width = section.offsetWidth;
    const height = section.offsetHeight;
    if (!bar) return { left: 0, width, height, center: width / 2 };
    const barRect = bar.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const center = triggerRect.left - barRect.left + triggerRect.width / 2;
    const min = 8 - barRect.left;
    const max = window.innerWidth - 8 - width - barRect.left;
    return { left: clamp(center - width / 2, Math.min(min, max), max), width, height, center };
  }, []);

  const sectionNodes = () =>
    Object.values(sectionRefs.current).filter((node): node is HTMLDivElement => Boolean(node));

  const openMenu = contextSafe((menu: NavbarGooeyBloomMenu, trigger: HTMLElement) => {
    const section = sectionRefs.current[menu.label];
    const panel = panelRef.current;
    const shell = shellRef.current;
    if (!section || !panel || !shell) return;
    if (openRef.current === menu.label) return;

    const previous = openRef.current;
    const previousSection = previous ? sectionRefs.current[previous] : null;
    openRef.current = menu.label;
    setOpenKey(menu.label);

    const m = motion.current;
    const layout = getLayout(trigger, section);
    const reduced = prefersReducedMotion();
    const items = section.querySelectorAll('[data-item]');
    m.barBottom = shell.offsetHeight;
    resetHover();

    gsap.killTweensOf([panel, ...sectionNodes()]);
    sectionNodes().forEach((node) => {
      if (node !== section && node !== previousSection) gsap.set(node, { opacity: 0 });
    });
    gsap.set(section, { left: layout.left, opacity: 1 });
    gsap.set(panel, { opacity: 1 });

    if (!m.panelShown) {
      place(m.panelLeft, layout.center - 12);
      place(m.panelRight, layout.center + 12);
      place(m.panelHeight, 24);
      place(m.bump, layout.center);
      m.panelShown = true;
    }
    m.panelLeft.t = layout.left;
    m.panelRight.t = layout.left + layout.width;
    m.panelHeight.t = layout.height;

    if (reduced) {
      if (previousSection && previousSection !== section) {
        gsap.set(previousSection, { opacity: 0 });
      }
      gsap.set(items, { y: 0, opacity: 1 });
      settleMotion(m);
      draw();
      return;
    }

    m.awake = true;
    if (previousSection && previousSection !== section) {
      gsap.to(previousSection, { opacity: 0, duration: 0.14, ease: 'power2.out' });
    }
    if (items.length) {
      gsap.fromTo(
        items,
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.42,
          ease: 'power3.out',
          stagger: 0.02,
          delay: previous ? 0.05 : 0.12,
          overwrite: 'auto',
        }
      );
    }
  });

  const closeMenu = contextSafe((options?: { clearHighlight?: boolean }) => {
    cancelHover();
    if (options?.clearHighlight) {
      hideBlob();
    }
    if (!openRef.current) return;
    openRef.current = null;
    setOpenKey(null);
    setAccordion(null);

    const panel = panelRef.current;
    if (!panel) return;
    const m = motion.current;
    const sections = sectionNodes();
    const center = (m.left.t + m.right.t) / 2;
    gsap.killTweensOf([panel, ...sections]);
    m.panelLeft.t = center - 12;
    m.panelRight.t = center + 12;
    m.panelHeight.t = 24;

    const finish = () => {
      m.panelShown = false;
      resetHover();
      gsap.set(sections, { opacity: 0 });
      gsap.set(panel, { opacity: 0 });
    };

    if (prefersReducedMotion()) {
      finish();
      return;
    }
    m.awake = true;
    gsap.to(sections, { opacity: 0, duration: 0.12, ease: 'power2.out' });
    gsap.to(panel, {
      opacity: 0,
      duration: 0.24,
      delay: 0.08,
      ease: 'power2.in',
      onComplete: finish,
    });
  });

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = contextSafe(() => {
    cancelHover();
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      const bar = barRef.current;
      if (bar) {
        const rect = bar.getBoundingClientRect();
        const { x, y } = pointerPos.current;
        if (
          x >= rect.left - 2 &&
          x <= rect.right + 2 &&
          y >= rect.top - 2 &&
          y <= rect.bottom + 2
        ) {
          return;
        }
      }
      closeMenu({ clearHighlight: true });
    }, CLOSE_DELAY);
  });

  const cancelHover = () => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    pendingHover.current = null;
  };

  const handleTriggerEnter = (menu: NavbarGooeyBloomMenu, el: HTMLElement) => {
    cancelClose();
    moveBlob(el);
    pendingHover.current = { menu, el };
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      hoverTimer.current = null;
      const next = pendingHover.current;
      pendingHover.current = null;
      if (!next) return;
      if (next.menu.columns?.length) openMenu(next.menu, next.el);
      else closeMenu();
    }, HOVER_INTENT);
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    const bar = barRef.current;
    if (!scroller || !bar) return;
    let last = scroller.scrollTop;
    let hidden = false;

    const onScroll = () => {
      const y = scroller.scrollTop;
      const delta = y - last;
      if (Math.abs(delta) < SCROLL_TOLERANCE) return;
      last = y;
      const next = delta > 0 && y > HIDE_AFTER && !openRef.current;
      if (next === hidden) return;
      hidden = next;
      gsap.to(bar, {
        yPercent: next ? -170 : 0,
        duration: prefersReducedMotion() ? 0 : next ? 0.5 : 0.7,
        ease: next ? 'power3.in' : 'expo.out',
        overwrite: 'auto',
      });
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const bar = barRef.current;
      const shell = shellRef.current;
      if (!bar || !shell) return;
      const m = motion.current;
      measureInk();
      const active = activeRef.current;
      if (active && m.pillShown) {
        const base = bar.getBoundingClientRect();
        const box = active.getBoundingClientRect();
        m.left.t = box.left - base.left;
        m.right.t = m.left.t + box.width;
      }
      const key = openRef.current;
      const section = key ? sectionRefs.current[key] : null;
      const trigger = key ? triggerRefs.current[key] : null;
      if (section && trigger) {
        const layout = getLayout(trigger, section);
        m.barBottom = shell.offsetHeight;
        m.panelLeft.t = layout.left;
        m.panelRight.t = layout.left + layout.width;
        m.panelHeight.t = layout.height;
        gsap.set(section, { left: layout.left });
      }
      settleMotion(m);
      draw();
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw, getLayout, measureInk]);

  useEffect(() => {
    if (!openKey) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const key = openRef.current;
      closeMenu({ clearHighlight: true });
      if (key) {
        skipFocusOpen.current = true;
        triggerRefs.current[key]?.focus();
        skipFocusOpen.current = false;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) {
        closeMenu({ clearHighlight: true });
      }
    };

    const onDesktopChange = (event: MediaQueryListEvent) => {
      if (!event.matches) closeMenu({ clearHighlight: true });
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    desktop.addEventListener('change', onDesktopChange);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      desktop.removeEventListener('change', onDesktopChange);
    };
  }, [openKey, closeMenu]);

  useEffect(() => {
    const menu = mobileRef.current;
    if (!menu) return;
    const reduced = prefersReducedMotion();
    const items = menu.querySelectorAll('[data-mobile-item]');

    if (mobileOpen) {
      gsap.set(menu, { visibility: 'visible' });
      gsap.fromTo(
        menu,
        { opacity: 0 },
        { opacity: 1, duration: reduced ? 0 : 0.28, ease: 'power2.out' }
      );
      gsap.fromTo(
        items,
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: reduced ? 0 : 0.45,
          ease: 'power3.out',
          stagger: reduced ? 0 : 0.035,
          delay: reduced ? 0 : 0.08,
        }
      );
      mobileCloseRef.current?.focus();
    } else {
      gsap.to(menu, {
        opacity: 0,
        duration: reduced ? 0 : 0.22,
        ease: 'power2.out',
        onComplete: () => gsap.set(menu, { visibility: 'hidden' }),
      });
    }
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileOpen(false);
      toggleRef.current?.focus();
    };
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onChange);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onChange);
    };
  }, [mobileOpen]);

  useEffect(() => {
    return () => {
      cancelClose();
      if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
      pendingHover.current = null;
    };
  }, []);

  return (
    <section
      ref={rootRef}
      aria-label={`${brand} site`}
      className={cn(
        'relative isolate h-svh w-full overflow-hidden bg-[#03110f] text-[#e8f3f2]',
        className
      )}
      {...props}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute size-0">
        <defs>
          <filter
            id={gooId}
            x="-40%"
            y="-250%"
            width="180%"
            height="600%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
          <filter
            id={linkGooId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
          <filter
            id={panelGooId}
            x="-15%"
            y="-15%"
            width="130%"
            height="130%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            />
          </filter>
        </defs>
      </svg>

      <header
        className={cn(CONTAINER, 'pointer-events-none absolute inset-x-0 top-0 z-30 pt-5')}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            closeMenu({ clearHighlight: true });
          }
        }}
      >
        <div
          ref={barRef}
          className="pointer-events-auto relative mx-auto w-full max-w-[26rem] md:max-w-[40rem] lg:max-w-[61.25rem] xl:max-w-[73.75rem]"
        >
          <div
            ref={shellRef}
            onPointerEnter={cancelClose}
            onPointerLeave={(event) => {
              pointerPos.current = { x: event.clientX, y: event.clientY };
              scheduleClose();
              if (!openRef.current) hideBlob();
            }}
            className="relative flex h-15 items-center justify-between gap-3 rounded-full border border-[#9fd4d6]/12 bg-[#071d1b]/70 px-3 shadow-[0_24px_60px_-32px_rgb(0_0_0/0.95)] backdrop-blur-xl"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
            >
              <span
                className="absolute inset-0"
                style={{
                  filter: `url(#${gooId}) drop-shadow(0 0 14px rgb(198 245 111 / 0.2))`,
                }}
              >
                <span
                  ref={pillRef}
                  className="absolute top-1/2 left-0 h-10 w-0 -translate-y-1/2 opacity-0"
                >
                  <span
                    ref={coreRef}
                    className="block size-full rounded-full bg-[radial-gradient(120%_160%_at_30%_0%,#eaffc4,#c6f56f_48%,#a8e35a)]"
                  />
                </span>
                <span
                  ref={dropRef}
                  style={{ width: DROP_SIZE, height: DROP_SIZE }}
                  className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full bg-[#c6f56f] opacity-0"
                />
              </span>
            </span>

            <a
              href={homeHref}
              data-intro=""
              aria-label={`${brand} home`}
              className={cn(
                'relative z-10 flex shrink-0 items-center gap-2.5 rounded-full pr-1',
                focusRing
              )}
            >
              {logo}
              <span className="hidden text-[17px] font-medium tracking-tight sm:block">
                {brand}
              </span>
            </a>

            <nav aria-label="Primary" className="pointer-events-auto relative hidden lg:block">
              <ul className="relative z-10 flex items-center">
                {menus.map((menu, index) => {
                  const panelMenu = Boolean(menu.columns?.length);
                  const isOpen = openKey === menu.label;
                  const labelClass = cn(
                    'relative flex h-10 items-center rounded-full px-3.5 text-[13.5px] font-medium tracking-[-0.01em] transition-colors duration-200 text-[#e8f3f2]/75 hover:text-[#e8f3f2]'
                  );
                  const chevronClass = cn(
                    'w-[9px] transition-transform duration-400',
                    EASE_OUT_EXPO,
                    isOpen && 'rotate-180'
                  );

                  return (
                    <li key={menu.label} className="relative">
                      {panelMenu ? (
                        <button
                          ref={(node) => {
                            triggerRefs.current[menu.label] = node;
                          }}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          aria-haspopup="true"
                          onPointerEnter={(event) => handleTriggerEnter(menu, event.currentTarget)}
                          onFocus={(event) => {
                            cancelHover();
                            moveBlob(event.currentTarget);
                            if (skipFocusOpen.current) {
                              skipFocusOpen.current = false;
                              return;
                            }
                            openMenu(menu, event.currentTarget);
                          }}
                          onClick={() => {
                            const trigger = triggerRefs.current[menu.label];
                            if (!trigger) return;
                            if (isOpen) closeMenu();
                            else openMenu(menu, trigger);
                          }}
                          className={cn(labelClass, 'cursor-pointer', focusRing)}
                        >
                          <span className="relative flex items-center gap-1.5">
                            <span>{menu.label}</span>
                            <ChevronIcon className={chevronClass} />
                            <span
                              aria-hidden="true"
                              ref={(node) => {
                                inkRefs.current[index] = node;
                              }}
                              style={{ clipPath: 'inset(0 100% 0 0)' }}
                              className="pointer-events-none absolute inset-0 flex items-center gap-1.5 text-[#03110f] opacity-0"
                            >
                              {menu.label}
                              <ChevronIcon className={chevronClass} />
                            </span>
                          </span>
                        </button>
                      ) : (
                        <a
                          href={menu.href ?? '#'}
                          {...externalProps(menu.href ?? '')}
                          aria-current={menu.href && current(menu.href) ? 'page' : undefined}
                          onPointerEnter={(event) => handleTriggerEnter(menu, event.currentTarget)}
                          onFocus={(event) => {
                            cancelHover();
                            moveBlob(event.currentTarget);
                            closeMenu();
                          }}
                          className={cn(labelClass, focusRing)}
                        >
                          <span className="relative block">
                            {menu.label}
                            <span
                              aria-hidden="true"
                              ref={(node) => {
                                inkRefs.current[index] = node;
                              }}
                              style={{ clipPath: 'inset(0 100% 0 0)' }}
                              className="pointer-events-none absolute inset-0 block text-[#03110f] opacity-0"
                            >
                              {menu.label}
                            </span>
                          </span>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div data-intro="" className="relative z-10 flex shrink-0 items-center gap-2">
              <DotBloomButton
                variant="secondary"
                onClick={onActionClick}
                className="hidden h-10 rounded-full px-4 text-[12.5px] focus-visible:ring-[#c6f56f] focus-visible:ring-offset-[#071d1b] sm:inline-flex"
              >
                {actionLabel}
              </DotBloomButton>

              <button
                ref={toggleRef}
                type="button"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls={mobileId}
                onClick={() => setMobileOpen((value) => !value)}
                className={cn(
                  'grid size-10 cursor-pointer place-items-center rounded-full border border-[#9fd4d6]/15 bg-white/[0.03] lg:hidden',
                  focusRing
                )}
              >
                <span aria-hidden="true" className="relative block h-2.5 w-5">
                  <span
                    className={cn(
                      'absolute inset-x-0 top-0 h-px bg-[#e8f3f2] transition-transform duration-500 motion-reduce:transition-none',
                      EASE_OUT_EXPO,
                      mobileOpen && 'translate-y-[4.5px] rotate-45'
                    )}
                  />
                  <span
                    className={cn(
                      'absolute inset-x-0 bottom-0 h-px bg-[#e8f3f2] transition-transform duration-500 motion-reduce:transition-none',
                      EASE_OUT_EXPO,
                      mobileOpen && '-translate-y-[4.5px] -rotate-45'
                    )}
                  />
                </span>
              </button>
            </div>
          </div>

          <div
            ref={panelRef}
            id={panelId}
            inert={!openKey}
            onPointerEnter={cancelClose}
            onPointerLeave={scheduleClose}
            className="pointer-events-none absolute inset-x-0 top-0 z-40 h-0 opacity-0"
          >
            <svg
              aria-hidden="true"
              className="absolute top-0 left-0 h-[44rem] w-full overflow-visible"
              style={{
                filter:
                  'drop-shadow(0 0 0.6px rgb(159 212 214 / 0.45)) drop-shadow(0 32px 40px rgb(0 0 0 / 0.55))',
              }}
            >
              <g
                filter={`url(#${panelGooId})`}
                fill="#071d1b"
                className={openKey ? 'pointer-events-auto' : 'pointer-events-none'}
              >
                <path ref={shapeRef} />
                <circle ref={bumpRef} r="0" />
              </g>
            </svg>
            <div
              ref={bodyRef}
              className={cn(
                'absolute top-0 left-0',
                openKey ? 'pointer-events-auto' : 'pointer-events-none'
              )}
            >
              {menus.map((menu) => {
                if (!menu.columns?.length) return null;
                const width = panelWidth(menu);

                return (
                  <div
                    key={menu.label}
                    ref={(node) => {
                      sectionRefs.current[menu.label] = node;
                    }}
                    data-section=""
                    inert={openKey !== menu.label}
                    onPointerLeave={hideHover}
                    style={{ width }}
                    className={cn(
                      'absolute top-0 left-0 p-2.5 opacity-0',
                      openKey === menu.label ? 'pointer-events-auto' : 'pointer-events-none'
                    )}
                  >
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
                      <span
                        data-hover-row=""
                        className="absolute top-0 left-0 rounded-2xl bg-[radial-gradient(140%_120%_at_0%_50%,rgb(198_245_111/0.12),transparent_60%),linear-gradient(#0c2924,#0c2924)] opacity-0 shadow-[inset_0_1px_0_rgb(232_243_242/0.06)]"
                      />
                      <span className="absolute inset-0" style={{ filter: `url(#${linkGooId})` }}>
                        <span
                          data-hover-blob=""
                          className="absolute top-0 left-0 rounded-[11px] bg-[#c6f56f] opacity-0"
                        />
                        <span
                          data-hover-drop=""
                          style={{ width: ICON_DROP, height: ICON_DROP }}
                          className="absolute top-0 left-0 rounded-full bg-[#c6f56f] opacity-0"
                        />
                      </span>
                    </span>
                    <div className={cn('relative grid gap-2.5', panelGrid(menu))}>
                      {menu.columns.map((column, columnIndex) => (
                        <ul key={columnIndex} className="flex flex-col">
                          {column.map((link) => (
                            <li key={`${link.label}-${link.href}`} data-item="">
                              <a
                                href={link.href}
                                {...externalProps(link.href)}
                                aria-current={current(link.href) ? 'page' : undefined}
                                onClick={() => closeMenu()}
                                onPointerEnter={(event) => moveHover(event.currentTarget)}
                                onFocus={(event) => moveHover(event.currentTarget)}
                                className={cn(
                                  'group/link relative flex items-start gap-3 rounded-2xl p-2.5',
                                  focusRing
                                )}
                              >
                                <span
                                  data-icon=""
                                  className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[11px] border border-[#9fd4d6]/12 bg-[#0a2420]/45 text-[#c6f56f] transition-[color,background-color,border-color] duration-300 group-hover/link:border-transparent group-hover/link:bg-transparent group-hover/link:text-[#03110f] group-hover/link:delay-75 group-focus-visible/link:border-transparent group-focus-visible/link:bg-transparent group-focus-visible/link:text-[#03110f]"
                                >
                                  <MenuGlyph icon={link.icon ?? 'bloom'} className="size-4" />
                                </span>
                                <span
                                  className={cn(
                                    'min-w-0 transition-transform duration-500 group-hover/link:translate-x-1',
                                    EASE_OUT_EXPO
                                  )}
                                >
                                  <span className="flex items-center gap-1.5 text-[13.5px] leading-tight font-medium text-[#e8f3f2]">
                                    {link.label}
                                    <ArrowIcon
                                      className={cn(
                                        'size-3 -translate-x-1 text-[#c6f56f] opacity-0 transition-[opacity,translate] duration-500 group-hover/link:translate-x-0 group-hover/link:opacity-100',
                                        EASE_OUT_EXPO
                                      )}
                                    />
                                  </span>
                                  {link.description ? (
                                    <span className="mt-1 block text-[12.5px] leading-snug text-[#9fd4d6]/60 transition-colors duration-300 group-hover/link:text-[#9fd4d6]/85">
                                      {link.description}
                                    </span>
                                  ) : null}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      ))}

                      {menu.feature ? (
                        <div
                          data-item=""
                          onPointerEnter={hideHover}
                          className="flex flex-col overflow-hidden rounded-2xl border border-[#9fd4d6]/12 bg-[#0a2420]"
                        >
                          <div className="relative h-28 shrink-0 overflow-hidden">
                            {menu.feature.image ? (
                              <img
                                src={menu.feature.image}
                                alt=""
                                className="size-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <FeatureArt />
                            )}
                          </div>
                          <div className="flex flex-1 flex-col p-3">
                            <p className="text-[13px] font-medium">{menu.feature.title}</p>
                            <p className="mt-1 text-[12px] leading-snug text-[#9fd4d6]/60">
                              {menu.feature.description}
                            </p>
                            <a
                              href={menu.feature.href}
                              {...externalProps(menu.feature.href)}
                              onClick={() => closeMenu()}
                              className={cn(
                                'group/feature mt-auto inline-flex items-center gap-1.5 pt-3 text-[12px] font-medium text-[#c6f56f]',
                                focusRing
                              )}
                            >
                              {menu.feature.cta ?? 'Explore'}
                              <ArrowIcon className="size-3.5 transition-transform duration-300 group-hover/feature:translate-x-0.5" />
                            </a>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <div
        ref={scrollerRef}
        inert={mobileOpen}
        data-lenis-prevent=""
        className="absolute inset-0 z-10 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
      >
        {children ?? <SamplePage />}
      </div>

      <div
        ref={mobileRef}
        id={mobileId}
        inert={!mobileOpen}
        className="invisible fixed inset-0 z-50 flex flex-col bg-[#04140f] lg:hidden"
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-4 sm:px-6">
          <a href={homeHref} className={cn('flex items-center gap-2.5 rounded-full', focusRing)}>
            {logo}
            <span className="text-[17px] font-medium tracking-tight">{brand}</span>
          </a>
          <button
            ref={mobileCloseRef}
            type="button"
            aria-label="Close menu"
            onClick={() => {
              setMobileOpen(false);
              toggleRef.current?.focus();
            }}
            className={cn(
              'grid size-10 cursor-pointer place-items-center rounded-full border border-[#9fd4d6]/15 bg-white/[0.04]',
              focusRing
            )}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 sm:px-6">
          <ul className="flex flex-col">
            {menus.map((menu) => {
              const panelMenu = Boolean(menu.columns?.length);
              const isOpen = accordion === menu.label;
              const links = menu.columns?.flat() ?? [];
              const contentId = `${mobileId}-${menu.label.replace(/[^a-zA-Z0-9]/g, '')}`;

              return (
                <li
                  key={menu.label}
                  data-mobile-item=""
                  className="border-b border-[#9fd4d6]/10 last:border-b-0"
                >
                  {panelMenu ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        onClick={() => setAccordion(isOpen ? null : menu.label)}
                        className={cn(
                          'flex w-full cursor-pointer items-center justify-between py-4 text-left',
                          focusRing
                        )}
                      >
                        <span className="text-[26px] leading-none font-medium tracking-[-0.03em]">
                          {menu.label}
                        </span>
                        <ChevronIcon
                          className={cn(
                            'w-3 text-[#c6f56f] transition-transform duration-300',
                            isOpen && 'rotate-180'
                          )}
                        />
                      </button>
                      <div
                        id={contentId}
                        inert={!isOpen}
                        className={cn(
                          'grid transition-[grid-template-rows] duration-400 motion-reduce:transition-none',
                          EASE_OUT_EXPO,
                          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                        )}
                      >
                        <div className="overflow-hidden">
                          <ul className="flex flex-col gap-1 pb-3">
                            {links.map((link) => (
                              <li key={`${link.label}-${link.href}`}>
                                <a
                                  href={link.href}
                                  {...externalProps(link.href)}
                                  onClick={() => setMobileOpen(false)}
                                  className={cn(
                                    'flex items-center gap-3 rounded-xl px-2 py-2.5 text-[15px] text-[#e8f3f2]/75',
                                    focusRing
                                  )}
                                >
                                  <MenuGlyph
                                    icon={link.icon ?? 'bloom'}
                                    className="size-4 text-[#c6f56f]"
                                  />
                                  {link.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : (
                    <a
                      href={menu.href ?? '#'}
                      {...externalProps(menu.href ?? '')}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'block py-4 text-[26px] leading-none font-medium tracking-[-0.03em]',
                        focusRing
                      )}
                    >
                      {menu.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          <div data-mobile-item="" className="mt-6">
            <DotBloomButton
              variant="secondary"
              onClick={(event) => {
                setMobileOpen(false);
                onActionClick?.(event);
              }}
              className="h-12 w-full rounded-full focus-visible:ring-[#c6f56f] focus-visible:ring-offset-[#04140f]"
            >
              {actionLabel}
            </DotBloomButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NavbarGooeyBloom;
