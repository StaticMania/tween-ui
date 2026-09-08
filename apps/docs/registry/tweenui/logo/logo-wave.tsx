'use client';

import {
  useLayoutEffect,
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

const ITEM_SIZE = 42;

export interface LogoWaveLogo {
  src: string;
  alt: string;
}

export interface LogoWaveStep {
  /** Scale of the mark at this distance from center. */
  scale: number;
  /** Vertical offset in pixels (negative = up). */
  y: number;
}

export const DEFAULT_LOGO_WAVE: LogoWaveStep[] = [
  { scale: 2.6, y: -110 },
  { scale: 1.8, y: -70 },
  { scale: 1.5, y: -50 },
  { scale: 1.3, y: -35 },
  { scale: 1.2, y: -20 },
];

export interface LogoWaveProps extends ComponentPropsWithoutRef<'div'> {
  /** Logos duplicated along the marquee. */
  logos: LogoWaveLogo[];
  /** Seconds for one set to travel its own width. */
  duration?: number;
  /** Space between items, in pixels. */
  gap?: number;
  /** Scroll direction. `left` is right-to-left; `right` is left-to-right. */
  direction?: 'left' | 'right';
  /** Pause the marquee while the pointer is over it. */
  pauseOnHover?: boolean;
  /** Extra classes for each logo chip. */
  itemClassName?: string;
  /** Custom logo markup. Receives the logo and its index in `logos`. */
  renderLogo?: (logo: LogoWaveLogo, index: number) => ReactNode;
  /** Wave steps from the center mark outward. Index 0 is the peak. */
  wave?: LogoWaveStep[];
}

function peakPadding(wave: LogoWaveStep[]) {
  const peak = wave[0] ?? DEFAULT_LOGO_WAVE[0];
  const extra = (ITEM_SIZE * peak.scale - ITEM_SIZE) / 2;
  return {
    paddingTop: Math.abs(peak.y) + extra,
    paddingBottom: extra,
  };
}

function applyWave(items: HTMLElement[], center: HTMLElement, steps: LogoWaveStep[]) {
  const centerIdx = items.indexOf(center);
  items.forEach((el, i) => {
    const dist = Math.abs(i - centerIdx);
    const step = steps[dist];
    if (step) {
      el.style.transform = `translateY(${step.y}px) scale(${step.scale})`;
      el.style.zIndex = String(steps.length - dist);
    } else {
      el.style.transform = '';
      el.style.zIndex = '';
    }
  });
}

function findCenterIcon(container: HTMLElement, track: HTMLElement): HTMLElement | null {
  const viewportCenterX = container.getBoundingClientRect().left + container.offsetWidth / 2;
  const icons = track.querySelectorAll<HTMLElement>('[data-logo-wave-item]');
  let centerIcon: HTMLElement | null = null;
  let closest = Infinity;

  for (const icon of icons) {
    const rect = icon.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - viewportCenterX);
    if (distance < closest) {
      closest = distance;
      centerIcon = icon;
    }
  }

  return centerIcon;
}

export default function LogoWave({
  logos,
  duration = 60,
  gap = 70,
  direction = 'left',
  pauseOnHover = true,
  itemClassName,
  renderLogo,
  wave = DEFAULT_LOGO_WAVE,
  className,
  style,
  ...props
}: LogoWaveProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = useState(2);
  const padding = peakPadding(wave);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const root = rootRef.current;
    if (!track || !root || logos.length === 0) return;

    const updateRepeatCount = () => {
      const cycleWidth = track.scrollWidth / repeatCount;
      if (!cycleWidth) return;

      const viewport = root.offsetWidth || window.innerWidth;
      let needed = 2;
      while (needed * cycleWidth < viewport + cycleWidth) {
        needed += 1;
      }

      setRepeatCount((prev) => (prev === needed ? prev : needed));
    };

    updateRepeatCount();
    window.addEventListener('resize', updateRepeatCount);
    return () => window.removeEventListener('resize', updateRepeatCount);
  }, [repeatCount, logos.length, gap]);

  useGSAP(
    () => {
      const container = rootRef.current;
      const track = trackRef.current;
      if (!container || !track || logos.length === 0) return;

      const items = Array.from(track.querySelectorAll<HTMLElement>('[data-logo-wave-item]'));
      if (items.length === 0) return;

      const syncActive = () => {
        const center = findCenterIcon(container, track);
        if (!center) return;
        applyWave(items, center, wave);
      };

      syncActive();

      if (prefersReducedMotion()) return;

      const cycleWidth = track.scrollWidth / repeatCount || 1;
      const toRight = direction === 'right';

      gsap.set(track, { x: toRight ? -cycleWidth : 0 });

      let lastCenter: HTMLElement | null = null;
      const tween = gsap.to(track, {
        x: toRight ? 0 : -cycleWidth,
        duration,
        ease: 'none',
        repeat: -1,
        onUpdate: () => {
          const center = findCenterIcon(container, track);
          if (!center || center === lastCenter) return;
          lastCenter = center;
          applyWave(items, center, wave);
        },
      });

      if (!pauseOnHover) return;

      const pause = () => tween.pause();
      const resume = () => tween.resume();
      container.addEventListener('pointerenter', pause);
      container.addEventListener('pointerleave', resume);
      return () => {
        container.removeEventListener('pointerenter', pause);
        container.removeEventListener('pointerleave', resume);
      };
    },
    {
      scope: rootRef,
      dependencies: [repeatCount, duration, direction, pauseOnHover, logos.length, gap, wave],
    }
  );

  return (
    <div
      ref={rootRef}
      data-logo-wave
      data-direction={direction}
      className={cn('relative w-full overflow-hidden motion-reduce:transition-none', className)}
      style={{ ...padding, ...style }}
      {...props}
    >
      <div
        ref={trackRef}
        data-logo-wave-track
        className="flex w-max shrink-0 items-end will-change-transform"
        style={{ columnGap: gap }}
      >
        {Array.from({ length: repeatCount }, (_, setIndex) =>
          logos.map((logo, index) => (
            <figure
              key={`${setIndex}-${logo.alt}-${index}`}
              data-logo-wave-item
              className={cn(
                'm-0 grid size-[42px] shrink-0 place-items-center rounded-full border border-[#045f64]/10 bg-white p-2 shadow-[0_1px_2px_rgba(16,24,40,0.12)] transition-transform duration-500 ease-in-out motion-reduce:transition-none',
                itemClassName
              )}
            >
              {renderLogo ? (
                renderLogo(logo, index)
              ) : (
                <img src={logo.src} alt={logo.alt} className="size-full object-contain" />
              )}
            </figure>
          ))
        )}
      </div>
    </div>
  );
}
