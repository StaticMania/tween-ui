'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { useGSAP } from '@gsap/react';
import NumberFlow, { type Format } from '@number-flow/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MAX_STRETCH = 28;
const WAVE_WIDTH = 30;
const LIFT = { idle: 0.6, hover: 1.1, drag: 1.7 };

const STEP_BUTTON =
  'grid size-9 cursor-pointer place-items-center transition-colors duration-200 hover:bg-current/10 focus-visible:bg-current/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:hover:bg-transparent';

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

const rubberBand = (overdrag: number) =>
  Math.sign(overdrag) * MAX_STRETCH * (1 - Math.exp(-Math.abs(overdrag) / (MAX_STRETCH * 2.5)));

const decimalsOf = (step: number) => {
  const [, fraction = ''] = String(step).split('.');
  return fraction.length;
};

const MinusIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export interface ElasticSliderProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'defaultValue' | 'onChange'
> {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  format?: Format;
  prefix?: string;
  suffix?: string;
  buttonStep?: number;
  ticks?: number;
  disabled?: boolean;
}

const ElasticSlider = ({
  label,
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue = 50,
  onValueChange,
  format,
  prefix,
  suffix,
  buttonStep,
  ticks = 41,
  disabled = false,
  className,
  ...props
}: ElasticSliderProps) => {
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const decreaseRef = useRef<HTMLSpanElement>(null);
  const increaseRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const motion = useRef({ progress: 0, stretch: 0, focus: 0, lift: LIFT.idle });
  const moveTo = useRef<((progress: number) => void) | null>(null);
  const focusTo = useRef<((x: number) => void) | null>(null);
  const liftTo = useRef<((lift: number) => void) | null>(null);
  const hoverX = useRef<number | null>(null);

  const [innerValue, setInnerValue] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  const [reduced, setReduced] = useState(false);

  const value = clamp(controlledValue ?? innerValue, min, max);
  const span = max - min || 1;
  const progress = (value - min) / span;
  const numberFormat = { useGrouping: true, ...format };
  const formatter = new Intl.NumberFormat(undefined, numberFormat);
  const formatText = (number: number) =>
    `${prefix ?? ''}${formatter.format(number)}${suffix ?? ''}`;

  const render = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const width = rail.offsetWidth;
    const { progress: current, stretch, focus, lift } = motion.current;
    const offset = (t: number) => (stretch > 0 ? stretch * t : stretch * (1 - t));
    const count = tickRefs.current.length;

    tickRefs.current.forEach((tick, index) => {
      if (!tick) return;
      const t = count > 1 ? index / (count - 1) : 0;
      const base = t * width;
      const wave = Math.exp(-(((base - focus) / WAVE_WIDTH) ** 2));
      gsap.set(tick, { x: base + offset(t), scaleY: 1 + lift * wave });
      tick.toggleAttribute('data-on', t <= current + 0.0001);
    });

    gsap.set(indicatorRef.current, {
      x: current * width + offset(current),
      scaleY: 1 + (lift - LIFT.idle) * 0.12,
    });
  }, []);

  useGSAP(
    () => {
      const isReduced = prefersReducedMotion();
      setReduced(isReduced);
      const width = railRef.current?.offsetWidth ?? 0;
      motion.current.progress = progress;
      motion.current.focus = progress * width;
      motion.current.lift = isReduced ? 0 : LIFT.idle;
      moveTo.current = gsap.quickTo(motion.current, 'progress', {
        duration: isReduced ? 0 : 0.4,
        ease: 'power3.out',
        onUpdate: render,
      });
      focusTo.current = gsap.quickTo(motion.current, 'focus', {
        duration: isReduced ? 0 : 0.5,
        ease: 'power3.out',
        onUpdate: render,
      });
      liftTo.current = gsap.quickTo(motion.current, 'lift', {
        duration: isReduced ? 0 : 0.45,
        ease: 'power2.out',
        onUpdate: render,
      });
      render();

      const rail = railRef.current;
      if (!rail || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(render);
      observer.observe(rail);
      return () => observer.disconnect();
    },
    { scope: rootRef, dependencies: [ticks] }
  );

  useEffect(() => {
    moveTo.current?.(progress);
    if (hoverX.current === null) focusTo.current?.(progress * (railRef.current?.offsetWidth ?? 0));
  }, [progress]);

  const setLift = (state: keyof typeof LIFT) => {
    if (!reduced) liftTo.current?.(LIFT[state]);
  };

  const commit = (next: number) => {
    const snapped = clamp(
      Number((Math.round((next - min) / step) * step + min).toFixed(decimalsOf(step))),
      min,
      max
    );
    if (snapped === value) return;
    if (controlledValue === undefined) setInnerValue(snapped);
    onValueChange?.(snapped);
  };

  const stretchTo = (amount: number, release = false) => {
    if (reduced) return;
    gsap.to(motion.current, {
      stretch: amount,
      duration: release ? 0.9 : 0.2,
      ease: release ? 'elastic.out(1, 0.32)' : 'power3.out',
      overwrite: 'auto',
      onUpdate: render,
    });
  };

  const bump = (direction: number) => {
    if (reduced) return;
    gsap.to(motion.current, {
      stretch: direction * 14,
      duration: 0.14,
      ease: 'power2.out',
      overwrite: 'auto',
      onUpdate: render,
      onComplete: () => stretchTo(0, true),
    });
  };

  const nudge = (direction: number) => {
    if (disabled || !buttonStep) return;
    if (!reduced) {
      gsap.fromTo(
        direction < 0 ? decreaseRef.current : increaseRef.current,
        { scale: 0.6 },
        { scale: 1, duration: 0.5, ease: 'back.out(3)', overwrite: true }
      );
    }
    const atEdge = direction < 0 ? value <= min : value >= max;
    if (atEdge) bump(direction);
    else commit(value + direction * buttonStep);
  };

  const track = (clientX: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const overdrag =
      clientX < rect.left ? clientX - rect.left : clientX > rect.right ? clientX - rect.right : 0;
    commit(min + clamp((clientX - rect.left) / (rect.width || 1), 0, 1) * span);
    stretchTo(rubberBand(overdrag));
    hoverX.current = clamp(clientX - rect.left, 0, rect.width);
    focusTo.current?.(hoverX.current);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    inputRef.current?.focus({ preventScroll: true });
    setDragging(true);
    setLift('drag');
    track(event.clientX);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging) {
      track(event.clientX);
      return;
    }
    if (disabled || event.pointerType !== 'mouse') return;
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return;
    hoverX.current = clamp(event.clientX - rect.left, 0, rect.width);
    focusTo.current?.(hoverX.current);
    setLift('hover');
  };

  const settle = () => {
    hoverX.current = null;
    focusTo.current?.(progress * (railRef.current?.offsetWidth ?? 0));
    setLift('idle');
  };

  const handlePointerEnd = () => {
    if (!dragging) return;
    setDragging(false);
    stretchTo(0, true);
    settle();
  };

  return (
    <div
      ref={rootRef}
      data-elastic-slider
      data-dragging={dragging || undefined}
      className={cn(
        'w-full max-w-md touch-none select-none [--elastic-accent:#045f64] motion-reduce:transition-none dark:[--elastic-accent:#c6f56f]',
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <label htmlFor={inputId} className="block text-xs tracking-wide uppercase opacity-60">
            {label}
          </label>
          <NumberFlow
            aria-hidden="true"
            value={value}
            format={numberFormat}
            prefix={prefix}
            suffix={suffix}
            animated={!reduced}
            willChange
            className="mt-1 block text-4xl font-medium tracking-tight tabular-nums"
          />
        </div>

        {buttonStep && (
          <div className="flex shrink-0 overflow-hidden rounded-full border border-current/15">
            <button
              type="button"
              disabled={disabled}
              aria-label={`Decrease ${label} by ${formatText(buttonStep)}`}
              onClick={() => nudge(-1)}
              className={STEP_BUTTON}
            >
              <span ref={decreaseRef} className="flex">
                <MinusIcon />
              </span>
            </button>
            <span aria-hidden="true" className="w-px bg-current/15" />
            <button
              type="button"
              disabled={disabled}
              aria-label={`Increase ${label} by ${formatText(buttonStep)}`}
              onClick={() => nudge(1)}
              className={STEP_BUTTON}
            >
              <span ref={increaseRef} className="flex">
                <PlusIcon />
              </span>
            </button>
          </div>
        )}
      </div>

      <div
        className={cn(
          'relative mt-5 h-14',
          disabled ? 'cursor-not-allowed' : dragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => !dragging && settle()}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={formatText(value)}
          onChange={(event) => commit(Number(event.target.value))}
          className="peer sr-only"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-3 -inset-y-1 rounded-xl outline-2 outline-transparent peer-focus-visible:outline-current"
        />
        <div ref={railRef} aria-hidden="true" className="absolute inset-0">
          {Array.from({ length: ticks }, (_, index) => (
            <span
              key={index}
              ref={(node) => {
                tickRefs.current[index] = node;
              }}
              className={cn(
                'absolute top-1/2 left-0 -ml-px w-0.5 rounded-full bg-current/20 transition-colors duration-200 will-change-transform data-on:bg-(--elastic-accent)',
                index % 5 === 0 ? '-mt-2.5 h-5' : '-mt-1.5 h-3'
              )}
            />
          ))}
          <span
            ref={indicatorRef}
            className="absolute top-1/2 left-0 -mt-6 -ml-[3px] h-12 w-1.5 rounded-full bg-(--elastic-accent) shadow-[0_0_0_3px_var(--color-white)] will-change-transform dark:shadow-[0_0_0_3px_#12161f]"
          />
        </div>
      </div>

      <div aria-hidden="true" className="mt-1 flex justify-between text-xs tabular-nums opacity-50">
        <span>{formatText(min)}</span>
        <span>{formatText(max)}</span>
      </div>
    </div>
  );
};

export default ElasticSlider;
