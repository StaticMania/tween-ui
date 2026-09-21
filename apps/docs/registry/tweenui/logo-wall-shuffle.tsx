'use client';

import {
  useCallback,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Seconds between swaps. */
const LOOP_DELAY = 1.65;
const DURATION = 0.6;
const TRAVEL = 40;
const BLUR = 'blur(4px)';

const CARD =
  'flex items-center justify-center rounded-xl bg-white size-[76px] lg:size-[88px] dark:bg-[#161b22] [filter:drop-shadow(0_2px_5px_rgba(0,1,15,0.08))_drop-shadow(0_8px_8px_rgba(0,1,15,0.06))_drop-shadow(0_19px_11px_rgba(0,1,15,0.04))] dark:[filter:none]';

const shuffled = <T,>(input: T[]) => {
  const copy = input.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export interface LogoWallLogo {
  /** Logo URL. */
  src: string;
  /** Swapped in under `.dark`. Falls back to `src`. */
  srcDark?: string;
  /** Alt text. */
  alt: string;
}

export interface LogoWallShuffleProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Marks cycled through the wall. Needs more logos than tiles to keep moving. */
  logos: LogoWallLogo[];
  /** Tiles per column, left to right. Every other column drops down. */
  columns?: number[];
}

const DEFAULT_COLUMNS = [1, 2, 3, 2, 3, 2, 1];

const DEFAULT_TITLE = 'Your entire tech stack, perfectly connected';

const DEFAULT_DESCRIPTION =
  'Seamlessly integrate with your favorite tools and bring all your workflows into one unified platform.';

function LogoMark({ logo, className }: { logo: LogoWallLogo; className?: string }) {
  return (
    <>
      <img
        src={logo.src}
        alt={logo.alt}
        loading="lazy"
        className={cn('size-full object-contain', logo.srcDark && 'dark:hidden', className)}
      />
      {logo.srcDark && (
        <img
          src={logo.srcDark}
          alt={logo.alt}
          loading="lazy"
          className={cn('hidden size-full object-contain dark:block', className)}
        />
      )}
    </>
  );
}

export default function LogoWallShuffle({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  logos,
  columns = DEFAULT_COLUMNS,
  className,
  ...props
}: LogoWallShuffleProps) {
  const rootRef = useRef<HTMLElement>(null);
  const tileCount = columns.reduce((total, size) => total + size, 0);

  /**
   * One logo index per tile, plus the mark being animated out. Swapping through
   * state — rather than cloning DOM nodes as the original did — keeps React the
   * only thing mutating this subtree.
   */
  const [tiles, setTiles] = useState<{ logo: number; leaving: number | null }[]>(() =>
    Array.from({ length: tileCount }, (_, index) => ({
      logo: index % Math.max(logos.length, 1),
      leaving: null,
    }))
  );

  const orderRef = useRef<number[]>([]);
  const cursorRef = useRef(0);
  const nextLogoRef = useRef(tileCount);

  const settle = useCallback((tile: number) => {
    setTiles((current) =>
      current.map((entry, index) => (index === tile ? { ...entry, leaving: null } : entry))
    );
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion() || logos.length <= 1) return;

      // Visit every tile once before repeating, so no card sits stale.
      orderRef.current = shuffled(Array.from({ length: tileCount }, (_, i) => i));
      cursorRef.current = 0;

      const swap = () => {
        const order = orderRef.current;
        if (order.length === 0) return;

        if (cursorRef.current >= order.length) {
          orderRef.current = shuffled(order);
          cursorRef.current = 0;
        }
        const tile = orderRef.current[cursorRef.current];
        cursorRef.current += 1;

        setTiles((current) => {
          const incoming = nextLogoRef.current % logos.length;
          nextLogoRef.current += 1;
          if (current[tile]?.logo === incoming) return current;
          return current.map((entry, index) =>
            index === tile ? { logo: incoming, leaving: entry.logo } : entry
          );
        });
      };

      const loop = gsap.timeline({ repeat: -1, repeatDelay: LOOP_DELAY });
      loop.call(swap).to({}, { duration: DURATION });

      const trigger = ScrollTrigger.create({
        trigger: rootRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => loop.play(),
        onLeave: () => loop.pause(),
        onEnterBack: () => loop.play(),
        onLeaveBack: () => loop.pause(),
      });

      // Don't burn frames in a background tab.
      const onVisibility = () => (document.hidden ? loop.pause() : loop.play());
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        trigger.kill();
        loop.kill();
        document.removeEventListener('visibilitychange', onVisibility);
      };
    },
    { scope: rootRef, dependencies: [tileCount, logos.length] }
  );

  const columnStarts = columns.map((_, columnIndex) =>
    columns.slice(0, columnIndex).reduce((total, size) => total + size, 0)
  );

  return (
    <section
      ref={rootRef}
      data-logo-wall-shuffle
      className={cn('w-full px-5 py-16 md:py-20', className)}
      {...props}
    >
      <div className="mx-auto max-w-[1064px] space-y-10 md:space-y-14">
        <div className="mx-auto max-w-[600px] space-y-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-[#12161f] md:text-5xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto max-w-[450px] text-base text-[#18181b]/60 md:text-lg dark:text-white/60">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-3 justify-items-center gap-4 md:grid-cols-5 lg:flex lg:flex-wrap lg:items-center lg:justify-center">
          {columns.map((size, columnIndex) => (
            <div
              key={columnIndex}
              className={cn(
                'contents lg:flex lg:flex-col lg:items-center lg:gap-4',
                columnIndex % 2 === 1 && 'lg:translate-y-10'
              )}
            >
              {Array.from({ length: size }, (_, row) => {
                const tileIndex = columnStarts[columnIndex] + row;
                const tile = tiles[tileIndex];
                const logo = logos[tile?.logo ?? 0];
                const leaving = tile?.leaving != null ? logos[tile.leaving] : undefined;

                return (
                  <div key={tileIndex} className={CARD}>
                    <figure
                      data-logo-wall-tile
                      className="relative isolate size-10 motion-reduce:transform-none md:size-12"
                    >
                      {leaving && (
                        <SwapLayer
                          role="leaving"
                          onDone={() => settle(tileIndex)}
                          className="absolute inset-0"
                        >
                          <LogoMark logo={leaving} />
                        </SwapLayer>
                      )}
                      <SwapLayer role={leaving ? 'entering' : 'idle'} className="absolute inset-0">
                        <LogoMark logo={logo} />
                      </SwapLayer>
                    </figure>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * A single mark layer. `entering` rises into place from below, `leaving` lifts
 * away and blurs out, `idle` just sits there.
 */
function SwapLayer({
  role,
  onDone,
  className,
  children,
}: {
  role: 'idle' | 'entering' | 'leaving';
  onDone?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (role === 'idle' || prefersReducedMotion()) return;

      if (role === 'entering') {
        gsap.fromTo(
          ref.current,
          { y: TRAVEL, opacity: 0, filter: BLUR },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: DURATION, ease: 'power1.inOut' }
        );
        return;
      }

      gsap.to(ref.current, {
        y: -TRAVEL,
        opacity: 0,
        filter: BLUR,
        duration: DURATION,
        ease: 'power1.inOut',
        onComplete: onDone,
      });
    },
    { dependencies: [role] }
  );

  return (
    <span ref={ref} className={cn('block', className)}>
      {children}
    </span>
  );
}
