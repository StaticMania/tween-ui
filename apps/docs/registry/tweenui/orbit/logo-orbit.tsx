'use client';

import { useRef, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface LogoOrbitLogo {
  src: string;
  alt: string;
}

export interface LogoOrbitProps extends ComponentPropsWithoutRef<'div'> {
  /** Logos placed evenly around the ring. */
  logos: LogoOrbitLogo[];
  /** Ring diameter in pixels. */
  size?: number;
  /** Rotation speed multiplier (1 = one turn every 20s). */
  speed?: number;
}

export default function LogoOrbit({
  logos,
  size = 320,
  speed = 1,
  className,
  ...props
}: LogoOrbitProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const pivotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const ring = ringRef.current;
      const hub = hubRef.current;
      if (!ring || !hub) return;

      ring.style.setProperty('--orbit-size', `${size}px`);

      const hubSize = hub.offsetWidth || 20;
      const hubOffset = (size - hubSize) / 2;
      gsap.set(hub, { x: hubOffset, y: hubOffset, rotation: 0 });

      const pivots = pivotRefs.current.filter((el): el is HTMLDivElement => el !== null);
      const items = itemRefs.current.filter((el): el is HTMLDivElement => el !== null);
      const count = pivots.length;
      if (count === 0) return;

      // Distribute the logos evenly around the ring and keep each one upright.
      const space = 360 / count;
      const pivotOriginY = size / 2 + 10;
      pivots.forEach((pivot, i) => {
        const pivotHalf = pivot.offsetWidth / 2 || 10;
        gsap.set(pivot, {
          rotation: i * space,
          transformOrigin: `${pivotHalf}px ${pivotOriginY}px`,
        });
      });
      items.forEach((item, i) => {
        gsap.set(item, { rotation: -i * space, transformOrigin: 'center center' });
      });

      if (prefersReducedMotion()) return;

      const timeScale = Math.min(20, Math.max(0.05, speed));
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(hub, { rotation: 360, duration: 20, ease: 'none' });
      tl.to(items, { rotation: '-=360', duration: 20, ease: 'none' }, 0);
      tl.timeScale(timeScale);
    },
    { scope: ringRef, dependencies: [size, speed, logos.length] }
  );

  return (
    <div
      ref={ringRef}
      data-logo-orbit
      className={cn(
        'relative mx-auto aspect-square rounded-full border-2 border-[#045f64]/15 motion-reduce:transition-none',
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <div ref={hubRef} className="absolute size-5">
        {logos.map((logo, i) => (
          <div
            key={`${logo.alt}-${i}`}
            ref={(el) => {
              pivotRefs.current[i] = el;
            }}
            data-orbit-pivot
            className="absolute top-[calc(var(--orbit-size)*-0.5)]"
          >
            <div
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="absolute top-[-20px] grid size-16 place-items-center overflow-hidden rounded-full border border-[#045f64]/10 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.12)]"
            >
              <img src={logo.src} alt={logo.alt} className="size-full object-contain" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
