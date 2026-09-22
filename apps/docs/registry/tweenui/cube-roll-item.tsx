'use client';

import { useRef, type ComponentPropsWithoutRef, type FocusEvent, type MouseEvent } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The roll follows the pointer — skip it on touch, where there is no hover. */
const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Keyboard focus rolls the row; a mouse click that happens to focus it does not. */
const isFocusVisible = (el: HTMLElement) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

/** Settles a touch past the face, like a drum clicking into its detent. */
const ROLL_EASE = 'back.out(1.6)';

/**
 * Each row is a four-sided drum turning on its X axis. Front and back carry the
 * resting face, top and bottom the filled one — so every quarter turn lands on
 * the opposite state, and the drum can keep rolling the way the pointer moves.
 * `--depth` matches the row height, which makes the drum a true square prism.
 */
const FACE_TRANSFORM = {
  front: '[transform:translateZ(calc(var(--depth)/2))]',
  back: '[transform:rotateX(180deg)_translateZ(calc(var(--depth)/2))]',
  top: '[transform:rotateX(90deg)_translateZ(calc(var(--depth)/2))]',
  bottom: '[transform:rotateX(-90deg)_translateZ(calc(var(--depth)/2))]',
} as const;

type Side = keyof typeof FACE_TRANSFORM;

const SIDES: Side[] = ['front', 'back', 'top', 'bottom'];

export interface CubeRollItemEntry {
  /** Large title in the middle of the row. */
  title: string;
  /** Short line on the right. */
  label?: string;
  /** Link target for the row. */
  href: string;
}

export interface CubeRollItemProps extends ComponentPropsWithoutRef<'nav'> {
  /** Rows in the list, numbered in order. Defaults to a four-row sample. */
  items?: CubeRollItemEntry[];
}

const DEFAULT_ITEMS: CubeRollItemEntry[] = [
  { title: 'Components', label: 'Buttons, text & logos', href: '#components' },
  { title: 'Blocks', label: 'Ready-made sections', href: '#blocks' },
  { title: 'Installation', label: 'One command, no config', href: '#installation' },
  { title: 'Changelog', label: 'What shipped lately', href: '#changelog' },
];

function Face({ side, item, number }: { side: Side; item: CubeRollItemEntry; number: string }) {
  const filled = side === 'top' || side === 'bottom';

  return (
    <div
      data-roll-face={side}
      aria-hidden={side === 'front' ? undefined : true}
      className={cn(
        'absolute inset-0 backface-hidden',
        FACE_TRANSFORM[side],
        filled
          ? 'bg-[#045f64] text-white dark:bg-[#c6f56f] dark:text-[#071d1b]'
          : 'bg-white text-[#12161F] dark:bg-[#0d1117] dark:text-white'
      )}
    >
      {/* Equal side columns keep the title on the row's true center line. */}
      <div className="flex h-full flex-wrap items-start px-3 pt-3.5 md:grid md:grid-cols-[1fr_2fr_1fr] md:items-center md:gap-6 md:px-4 md:pt-0">
        <span
          className={cn(
            'order-1 flex items-center gap-1.5 text-xs tabular-nums',
            filled ? 'text-[#c6f56f] dark:text-[#045f64]' : 'text-[#045f64] dark:text-[#9fd4d6]'
          )}
        >
          {number}
          {filled && (
            <svg viewBox="0 0 12 12" className="size-3" fill="none" aria-hidden="true">
              <path d="M1 6h9.5M6.5 2 10.5 6l-4 4" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          )}
        </span>
        {/* Leading above 1 keeps descenders (g, y, p) inside the overflow box. */}
        <span className="order-3 mt-2.5 w-full min-w-0 overflow-hidden text-center text-3xl leading-[1.3] font-normal tracking-tight text-ellipsis whitespace-nowrap md:order-2 md:mt-0 md:w-auto md:text-4xl">
          {item.title}
        </span>
        {item.label && (
          <span
            className={cn(
              'order-2 ml-auto text-right text-[13px] tracking-wide md:order-3 md:ml-0',
              filled
                ? 'text-white/80 dark:text-[#071d1b]/75'
                : 'text-[#045f64]/75 dark:text-[#9fd4d6]/80'
            )}
          >
            {item.label}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CubeRollItem({
  items = DEFAULT_ITEMS,
  className,
  'aria-label': ariaLabel = 'Sections',
  ...props
}: CubeRollItemProps) {
  const rootRef = useRef<HTMLElement>(null);
  /** Accumulated drum angle per row, in quarter turns of ±90°. */
  const anglesRef = useRef<number[]>([]);
  const activeRef = useRef<boolean[]>([]);

  const { contextSafe } = useGSAP(
    (_context, contextSafe) => {
      anglesRef.current = items.map(() => 0);
      activeRef.current = items.map(() => false);

      if (prefersReducedMotion()) return;

      // Park every drum half a turn over with its back face blanked, so each row
      // starts as an empty slab and nothing shows in the fallback font.
      const backContent = '[data-roll-face="back"] > *';
      gsap.set('[data-roll-rule]', { scaleX: 0 });
      gsap.set('[data-roll-drum]', { rotationX: 180 });
      gsap.set(backContent, { opacity: 0 });

      let cancelled = false;

      // Rules draw in while the drums flip over one after another, flashing
      // their filled face on the way past.
      const play = contextSafe!(() => {
        if (cancelled) return;
        gsap
          .timeline({ onComplete: () => gsap.set(backContent, { opacity: 1 }) })
          .to(
            '[data-roll-rule]',
            { scaleX: 1, duration: 0.9, ease: 'expo.inOut', stagger: 0.15 },
            0
          )
          .to(
            '[data-roll-drum]',
            { rotationX: 0, duration: 0.9, ease: 'power4.inOut', stagger: 0.15 },
            0.15
          );
      });

      // Wait for web fonts so the text never swaps mid-reveal; give up after a
      // beat so a slow or failed font can't hold the block hidden.
      const fonts = typeof document !== 'undefined' ? document.fonts?.ready : undefined;
      Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 1500))]).then(play);

      return () => {
        cancelled = true;
      };
    },
    { scope: rootRef, dependencies: [items] }
  );

  /** Turn a row a quarter — downward when `down`, upward otherwise. */
  const turn = contextSafe((link: HTMLElement, index: number, active: boolean, down: boolean) => {
    if (activeRef.current[index] === active) return;
    activeRef.current[index] = active;
    link.closest('li')?.setAttribute('data-active', String(active));

    const drum = link.querySelector('[data-roll-drum]');
    if (!drum) return;
    // Hovered before the intro finished: the back face may still be blank.
    gsap.set(link.querySelectorAll('[data-roll-face="back"] > *'), { opacity: 1 });

    if (prefersReducedMotion()) {
      anglesRef.current[index] = active ? -90 : 0;
      gsap.set(drum, { rotationX: anglesRef.current[index], opacity: 1 });
      return;
    }

    anglesRef.current[index] = (anglesRef.current[index] ?? 0) + (down ? -90 : 90);
    // `auto` takes rotationX from this drum's intro flip only, so hovering
    // mid-reveal leaves the other rows' flips running.
    gsap.to(drum, {
      rotationX: anglesRef.current[index],
      duration: active ? 0.6 : 0.7,
      ease: ROLL_EASE,
      overwrite: 'auto',
    });
  });

  /** Did the pointer cross the top half of the row? */
  const fromTop = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2;
  };

  return (
    <nav
      ref={rootRef}
      data-cube-roll-item
      aria-label={ariaLabel}
      className={cn('mx-auto w-full max-w-[1100px] px-4 py-14 md:py-20', className)}
      {...props}
    >
      {/* No gap between rows, so the filled face covers the whole row edge to edge. */}
      <ul className="flex flex-col">
        {items.map((item, index) => {
          const number = String(index + 1).padStart(3, '0');

          return (
            <li
              key={item.href + item.title}
              data-roll-row
              data-active="false"
              className="relative h-[5.75rem] overflow-y-clip [--depth:5.75rem] md:h-[4.5rem] md:[--depth:4.5rem]"
            >
              <span
                data-roll-rule
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px origin-left bg-[#045f64] dark:bg-[#9fd4d6]/60"
              />
              <a
                href={item.href}
                className="block size-full outline-none perspective-[1200px]"
                // Enter from the top and the drum rolls down; leave through the
                // bottom and it keeps rolling down rather than reversing.
                onMouseEnter={(event) =>
                  canHover() && turn(event.currentTarget, index, true, fromTop(event))
                }
                onMouseLeave={(event) =>
                  canHover() && turn(event.currentTarget, index, false, !fromTop(event))
                }
                onFocus={(event: FocusEvent<HTMLAnchorElement>) =>
                  isFocusVisible(event.currentTarget) &&
                  turn(event.currentTarget, index, true, true)
                }
                onBlur={(event: FocusEvent<HTMLAnchorElement>) =>
                  turn(event.currentTarget, index, false, true)
                }
              >
                <div className="relative size-full [transform:translateZ(calc(var(--depth)/-2))] transform-3d">
                  {/* Under reduced motion the drum only snaps, so skip the layer promotion. */}
                  <div
                    data-roll-drum
                    className="absolute inset-0 will-change-transform transform-3d motion-reduce:will-change-auto"
                  >
                    {SIDES.map((side) => (
                      <Face key={side} side={side} item={item} number={number} />
                    ))}
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
      {/* Closing rule under the last row. */}
      <span
        data-roll-rule
        aria-hidden="true"
        className="block h-px origin-left bg-[#045f64] dark:bg-[#9fd4d6]/60"
      />
    </nav>
  );
}
