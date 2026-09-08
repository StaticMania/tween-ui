'use client';

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GROUP_LAYOUT = 'flex flex-wrap items-center justify-center gap-x-8 gap-y-4';

export interface LogoCycleLogo {
  src: string;
  alt: string;
}

export interface LogoCycleProps extends ComponentPropsWithoutRef<'div'> {
  /** Logos to cycle through in groups. */
  logos: LogoCycleLogo[];
  /** How many logos are visible in each group. */
  visibleCount?: number;
  /** Seconds between group swaps. */
  interval?: number;
  /** Duration of each swap tween, in seconds. */
  duration?: number;
  /** Stagger between items in a group, in seconds. */
  stagger?: number;
  /** Seconds to wait before the first swap. */
  delay?: number;
  /** Vertical travel of the stagger, in pixels. */
  yOffset?: number;
  /** Blur radius applied while swapping, in pixels. */
  blur?: number;
  /** GSAP ease for the swap. */
  ease?: string;
  /** Pause the cycle while the pointer is over the row. */
  pauseOnHover?: boolean;
  /** Extra classes for each logo slot. */
  itemClassName?: string;
  /** Custom logo markup. Receives the logo and its index in `logos`. */
  renderLogo?: (logo: LogoCycleLogo, index: number) => ReactNode;
}

function chunkLogos<T>(items: T[], size: number): T[][] {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
}

function LogoMark({
  logo,
  index,
  itemClassName,
  renderLogo,
  itemRef,
}: {
  logo: LogoCycleLogo;
  index: number;
  itemClassName?: string;
  renderLogo?: (logo: LogoCycleLogo, index: number) => ReactNode;
  itemRef?: (el: HTMLElement | null) => void;
}) {
  return (
    <figure
      ref={itemRef}
      data-logo-cycle-item
      className={cn('m-0 grid h-11 w-12 shrink-0 place-items-center', itemClassName)}
    >
      {renderLogo ? (
        renderLogo(logo, index)
      ) : (
        <img src={logo.src} alt={logo.alt} className="size-full object-contain" />
      )}
    </figure>
  );
}

export default function LogoCycle({
  logos,
  visibleCount = 6,
  interval = 2.5,
  duration = 0.6,
  stagger = 0.14,
  delay = 0.5,
  yOffset = 40,
  blur = 4,
  ease = 'power1.inOut',
  pauseOnHover = true,
  itemClassName,
  renderLogo,
  className,
  style,
  ...props
}: LogoCycleProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef<(HTMLElement | null)[][]>([]);

  const groupSize = Math.max(1, visibleCount);
  const groups = chunkLogos(logos, groupSize);
  const isCycling = groups.length > 1;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !isCycling) return;

      const groupEls = groupRefs.current.filter((el): el is HTMLDivElement => el !== null);
      const itemGroups = itemRefs.current.map((row) =>
        (row ?? []).filter((el): el is HTMLElement => el !== null)
      );
      const groupCount = Math.min(groupEls.length, itemGroups.length);
      if (groupCount <= 1) return;

      const blurHidden = `blur(${blur}px)`;
      const blurClear = 'none';

      for (let i = 0; i < groupCount; i++) {
        const groupEl = groupEls[i];
        const groupItems = itemGroups[i];
        if (!groupEl || !groupItems.length) continue;

        if (i === 0) {
          gsap.set(groupEl, { autoAlpha: 1, pointerEvents: 'auto' });
          gsap.set(groupItems, { autoAlpha: 1, y: 0, filter: blurClear });
        } else {
          gsap.set(groupEl, { autoAlpha: 0, pointerEvents: 'none' });
          gsap.set(groupItems, { autoAlpha: 0, y: yOffset, filter: blurHidden });
        }
      }

      if (prefersReducedMotion()) return;

      let currentIndex = 0;
      let loopCall: gsap.core.Tween | undefined;
      const swapTweens: gsap.core.Tween[] = [];

      const run = () => {
        const nextIndex = (currentIndex + 1) % groupCount;
        const current = groupEls[currentIndex];
        const next = groupEls[nextIndex];
        const currentItems = itemGroups[currentIndex];
        const nextItems = itemGroups[nextIndex];

        if (!current || !next || !currentItems?.length || !nextItems?.length) return;

        gsap.set(next, { autoAlpha: 1, pointerEvents: 'auto' });

        swapTweens.length = 0;
        swapTweens.push(
          gsap.to(currentItems, {
            y: -yOffset,
            autoAlpha: 0,
            filter: blurHidden,
            duration,
            stagger,
            ease,
          }),
          gsap.fromTo(
            nextItems,
            { y: yOffset, autoAlpha: 0, filter: blurHidden },
            {
              y: 0,
              autoAlpha: 1,
              filter: blurClear,
              duration,
              stagger,
              ease,
              onComplete: () => {
                gsap.set(current, { autoAlpha: 0, pointerEvents: 'none' });
              },
            }
          )
        );

        currentIndex = nextIndex;
      };

      const schedule = (wait: number) => {
        loopCall = gsap.delayedCall(wait, () => {
          run();
          schedule(interval);
        });
      };

      schedule(delay);

      if (!pauseOnHover) return;

      const pause = () => {
        loopCall?.pause();
        swapTweens.forEach((tween) => tween.pause());
      };
      const resume = () => {
        loopCall?.resume();
        swapTweens.forEach((tween) => tween.resume());
      };

      root.addEventListener('pointerenter', pause);
      root.addEventListener('pointerleave', resume);
      return () => {
        root.removeEventListener('pointerenter', pause);
        root.removeEventListener('pointerleave', resume);
      };
    },
    {
      scope: rootRef,
      dependencies: [
        isCycling,
        groupSize,
        interval,
        duration,
        stagger,
        delay,
        yOffset,
        blur,
        ease,
        pauseOnHover,
        logos.length,
      ],
    }
  );

  if (!isCycling) {
    return (
      <div
        data-logo-cycle
        className={cn(GROUP_LAYOUT, 'motion-reduce:transition-none', className)}
        style={style}
        {...props}
      >
        {logos.map((logo, index) => (
          <LogoMark
            key={`${logo.alt}-${index}`}
            logo={logo}
            index={index}
            itemClassName={itemClassName}
            renderLogo={renderLogo}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      data-logo-cycle
      className={cn('grid w-full place-items-center motion-reduce:transition-none', className)}
      style={{ paddingBlock: yOffset, ...style }}
      {...props}
    >
      {groups.map((group, groupIndex) => (
        <div
          key={group.map((logo) => logo.alt).join('-') || `logo-group-${groupIndex}`}
          ref={(el) => {
            groupRefs.current[groupIndex] = el;
          }}
          data-logo-cycle-group
          className={GROUP_LAYOUT}
          style={{
            gridArea: '1 / 1',
            ...(groupIndex === 0 ? undefined : { opacity: 0, pointerEvents: 'none' }),
          }}
        >
          {group.map((logo, itemIndex) => {
            const index = groupIndex * groupSize + itemIndex;
            return (
              <LogoMark
                key={`${logo.alt}-${index}`}
                logo={logo}
                index={index}
                itemClassName={itemClassName}
                renderLogo={renderLogo}
                itemRef={(el) => {
                  if (!itemRefs.current[groupIndex]) itemRefs.current[groupIndex] = [];
                  itemRefs.current[groupIndex][itemIndex] = el;
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
