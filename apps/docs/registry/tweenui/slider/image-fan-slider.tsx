'use client';

import { useEffect, useState, type ComponentPropsWithoutRef, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export interface ImageFanSliderImage {
  src: string;
  alt: string;
}

export interface ImageFanSliderProps extends ComponentPropsWithoutRef<'div'> {
  /** Images in the fan. Five looks best. */
  images: ImageFanSliderImage[];
  /** Seconds between advances. */
  interval?: number;
  /** Autoplay direction. `left` steps forward; `right` steps backward. */
  direction?: 'left' | 'right';
  /** Pause autoplay while the pointer is over the fan. */
  pauseOnHover?: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function slideStyle(slideIndex: number, activeIndex: number, total: number): CSSProperties {
  const offset = (slideIndex - activeIndex + total) % total;
  const base: CSSProperties = {
    zIndex: 0,
    border: '4px solid #fff',
    borderRadius: 8,
    filter: 'blur(4px)',
    width: 180,
    height: 180,
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%) scale(0.7)',
  };

  if (offset === 0) {
    return {
      ...base,
      zIndex: 10,
      filter: 'none',
      transform: 'translate(-50%, -50%) scale(1)',
      boxShadow: '0 0 15px rgba(0,0,0,0.25)',
      borderRadius: 11,
      width: 200,
      height: 200,
    };
  }

  if (offset === 1) {
    return {
      ...base,
      zIndex: 5,
      transform: 'translate(-50%, -50%) scale(1) translateX(185px) translateY(40px) rotate(20deg)',
    };
  }

  if (offset === total - 1) {
    return {
      ...base,
      zIndex: 5,
      transform:
        'translate(-50%, -50%) scale(1) translateX(-185px) translateY(40px) rotate(-20deg)',
    };
  }

  const sign = offset <= total / 2 ? 1 : -1;
  return {
    ...base,
    zIndex: 1,
    opacity: 0,
    transform: `translate(-50%, -50%) scale(0.87) translateX(${sign * 350}px) translateY(140px) rotate(${sign * 50}deg)`,
  };
}

export default function ImageFanSlider({
  images,
  interval = 2.5,
  direction = 'left',
  pauseOnHover = true,
  className,
  ...props
}: ImageFanSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = images.length;

  useEffect(() => {
    if (total <= 1 || prefersReducedMotion() || paused) return;

    const step = direction === 'right' ? -1 : 1;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + step + total) % total);
    }, interval * 1000);

    return () => window.clearInterval(id);
  }, [interval, paused, total, direction]);

  return (
    <div
      data-image-fan-slider
      data-direction={direction}
      className={cn(
        'relative flex h-[280px] w-full items-start justify-center overflow-visible motion-reduce:transition-none max-sm:scale-75',
        className
      )}
      {...props}
      onPointerEnter={pauseOnHover ? () => setPaused(true) : props.onPointerEnter}
      onPointerLeave={pauseOnHover ? () => setPaused(false) : props.onPointerLeave}
    >
      {images.map((image, i) => (
        <figure
          key={`${image.src}-${i}`}
          data-image-fan-slide
          data-active={i === activeIndex ? 'true' : undefined}
          className="absolute m-0 overflow-hidden transition-all duration-700 ease-in-out motion-reduce:transition-none"
          style={slideStyle(i, activeIndex, total)}
        >
          <img src={image.src} alt={image.alt} className="size-full rounded-lg object-cover" />
        </figure>
      ))}
    </div>
  );
}
