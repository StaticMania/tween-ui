'use client';

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, MotionPathPlugin);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface IntegrationHubLogo {
  src: string;
  /** Optional mark shown under `.dark`. */
  srcDark?: string;
  alt: string;
}

export interface IntegrationHubProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Three logos on the left (top, middle, bottom). */
  left?: IntegrationHubLogo[];
  /** Three logos on the right (top, middle, bottom). */
  right?: IntegrationHubLogo[];
}

const DEFAULT_LEFT: IntegrationHubLogo[] = [
  { src: 'https://cdn.simpleicons.org/telegram/26A5E4', alt: 'Telegram' },
  { src: 'https://cdn.simpleicons.org/google/4285F4', alt: 'Google' },
  {
    src: 'https://cdn.simpleicons.org/notion/000000',
    srcDark: 'https://cdn.simpleicons.org/notion/ffffff',
    alt: 'Notion',
  },
];

const DEFAULT_RIGHT: IntegrationHubLogo[] = [
  { src: 'https://cdn.simpleicons.org/reddit/FF4500', alt: 'Reddit' },
  { src: 'https://cdn.simpleicons.org/stripe/635BFF', alt: 'Stripe' },
  { src: 'https://cdn.simpleicons.org/zoom/2D8CFF', alt: 'Zoom' },
];

const PATHS = [
  {
    transform: 'translate(449,240) scale(1.5) translate(-227,-147.703)',
    d: 'M227 147.703H192.062C172.52 147.703 154.769 136.319 146.619 118.558L105.908 29.8482C97.7568 12.0876 80.006 0.703125 60.4644 0.703125H0',
  },
  {
    transform: 'translate(500,250) scale(1.7) translate(-227,0)',
    d: 'M227 0.703125H0',
  },
  {
    transform: 'translate(450,262) scale(1.5) translate(-227,0)',
    d: 'M227 0.703132H192.062C172.52 0.703132 154.769 12.0876 146.619 29.8482L105.908 118.558C97.7568 136.319 80.006 147.703 60.4644 147.703H0',
  },
  {
    transform: 'translate(555,238) scale(1.5) translate(0,-147.703)',
    d: 'M0 147.703H34.9383C54.4799 147.703 72.2306 136.319 80.3814 118.558L121.092 29.8482C129.243 12.0876 146.994 0.703125 166.536 0.703125H227',
  },
  {
    transform: 'translate(500,250) scale(1.7) translate(0,0)',
    d: 'M0 0.703125H227',
  },
  {
    transform: 'translate(566,263) scale(1.5) translate(0,0)',
    d: 'M0 0.703132H34.9383C54.4799 0.703132 72.2306 12.0876 80.3814 29.8482L121.092 118.558C129.243 136.319 146.994 147.703 166.536 147.703H227',
  },
] as const;

/** Path ends in the 1000×500 viewBox. Keep the diagram at aspect-[2/1]. */
const NODE_SLOTS = [
  { x: '10.9%', y: '3.9%', side: 'left' },
  { x: '11.4%', y: '50.2%', side: 'left' },
  { x: '11.0%', y: '96.7%', side: 'left' },
  { x: '89.6%', y: '3.5%', side: 'right' },
  { x: '88.6%', y: '50.2%', side: 'right' },
  { x: '90.7%', y: '96.9%', side: 'right' },
] as const;

function HubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-8 fill-white lg:size-10" aria-hidden="true">
      <path d="M8 5H10V7H8V5Z" />
      <path d="M11 8H13V10H11V8Z" />
      <path d="M14 11H16V13H14V11Z" />
      <path d="M11 14H13V16H11V14Z" />
      <path d="M8 17H10V19H8V17Z" />
    </svg>
  );
}

function LogoNode({ logo, slot }: { logo: IntegrationHubLogo; slot: (typeof NODE_SLOTS)[number] }) {
  return (
    <div
      className={cn(
        'absolute z-10 -translate-y-1/2',
        slot.side === 'left' ? '-translate-x-full' : null
      )}
      style={{ left: slot.x, top: slot.y }}
    >
      <div
        data-hub-node
        className="relative grid size-14 scale-0 place-items-center rounded-3xl border border-[#045f64]/10 bg-white motion-reduce:scale-100 sm:size-16 md:size-[4.5rem] dark:border-white/10 dark:bg-[#12161F]"
      >
        <div className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#045f64]/10 sm:size-12 md:size-14 dark:border-white/10" />
        <figure className="size-9 overflow-hidden rounded-xl bg-white sm:size-11 md:size-12 dark:bg-transparent">
          {logo.srcDark ? (
            <>
              <img
                src={logo.src}
                alt={logo.alt}
                className="size-full object-contain p-2 dark:hidden"
              />
              <img
                src={logo.srcDark}
                alt=""
                aria-hidden="true"
                className="hidden size-full object-contain p-2 dark:block"
              />
            </>
          ) : (
            <img src={logo.src} alt={logo.alt} className="size-full object-contain p-2" />
          )}
        </figure>
      </div>
    </div>
  );
}

export default function IntegrationHub({
  title = 'One hub for every integration',
  description = 'Connect Notion, Zoom, Stripe, and the rest of your stack without leaving your product.',
  left = DEFAULT_LEFT,
  right = DEFAULT_RIGHT,
  className,
  ...props
}: IntegrationHubProps) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const diagram = root.querySelector<HTMLElement>('[data-hub-diagram]');
      const rings = gsap.utils.toArray<HTMLElement>('[data-hub-ring]', root);
      const paths = gsap.utils.toArray<SVGPathElement>('[data-hub-path]', root);
      const dots = gsap.utils.toArray<SVGCircleElement>('[data-hub-dot]', root);
      const nodes = gsap.utils.toArray<HTMLElement>('[data-hub-node]', root);

      if (!diagram || rings.length < 1 || paths.length < 1) return;

      const canDraw = paths.every((path) => typeof path.getTotalLength === 'function');

      if (prefersReducedMotion() || !canDraw) {
        gsap.set([...rings, ...nodes], { scale: 1 });
        gsap.set(paths, { opacity: 1, strokeDashoffset: 0, strokeDasharray: 'none' });
        gsap.set(dots, { autoAlpha: 0 });
        return;
      }

      gsap.set(rings, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(nodes, { scale: 0, transformOrigin: '50% 50%' });
      paths.forEach((path) => {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 1 });
      });
      gsap.set(dots, { autoAlpha: 0 });

      const tl = gsap.timeline();
      tl.to(rings, { scale: 1, duration: 0.55, ease: 'back.out(1.15)' });
      tl.to(
        paths,
        { strokeDashoffset: 0, duration: 0.85, stagger: 0.06, ease: 'power2.inOut' },
        '-=0.1'
      );
      tl.to(nodes, { scale: 1, duration: 0.4, stagger: 0.07, ease: 'back.out(1.2)' }, '-=0.05');

      tl.add(() => {
        paths.forEach((path, index) => {
          const dot = dots[index];
          if (!dot) return;
          const tween = gsap.to(dot, {
            duration: 4,
            repeat: -1,
            ease: 'none',
            paused: true,
            motionPath: {
              path,
              align: path,
              alignOrigin: [0.5, 0.5],
              autoRotate: false,
              start: 0,
              end: 1,
            },
          });
          gsap.set(dot, { autoAlpha: 1 });
          tween.progress((0.45 + index * 0.08) % 1).play();
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      {...props}
      ref={rootRef}
      data-integration-hub
      className={cn('w-full py-16 md:py-20', className)}
    >
      <div className="mx-auto w-full max-w-[804px] space-y-16 px-4">
        <div className="space-y-6 text-center">
          <h2 className="text-2xl leading-[1.15] font-medium tracking-tight text-[#12161F] md:text-3xl lg:text-4xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto max-w-[400px] text-sm leading-relaxed text-[#045f64]/70 dark:text-[#9fd4d6]/80">
            {description}
          </p>
        </div>

        <div data-hub-diagram className="relative mx-auto aspect-[2/1] w-full max-w-full">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {PATHS.map((path) => (
              <g key={path.transform} transform={path.transform}>
                <path
                  data-hub-path
                  className="fill-none stroke-[#045f64]/15 stroke-1 opacity-0 motion-reduce:opacity-100 dark:stroke-white/15"
                  d={path.d}
                />
                <circle
                  data-hub-dot
                  className="fill-[#045f64] opacity-0 motion-reduce:hidden dark:fill-[#c6f56f]"
                  r={2}
                />
              </g>
            ))}
          </svg>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div
              data-hub-ring
              className="relative grid size-20 scale-0 place-items-center rounded-full border border-[#045f64]/10 bg-white/80 backdrop-blur-[20px] motion-reduce:scale-100 md:size-36 lg:size-40 dark:border-white/10 dark:bg-[#12161F]/80"
            >
              <div className="absolute inset-[14%] rounded-full border border-[#045f64]/10 dark:border-white/10" />
              <figure className="relative z-10 grid size-16 place-items-center rounded-full bg-[linear-gradient(90deg,#045f64_0%,#c6f56f_100%)] md:size-20">
                <HubMark />
              </figure>
            </div>
          </div>

          {left.map((logo, index) => (
            <LogoNode key={logo.alt} logo={logo} slot={NODE_SLOTS[index] ?? NODE_SLOTS[0]} />
          ))}
          {right.map((logo, index) => (
            <LogoNode key={logo.alt} logo={logo} slot={NODE_SLOTS[index + 3] ?? NODE_SLOTS[3]} />
          ))}
        </div>
      </div>
    </section>
  );
}
