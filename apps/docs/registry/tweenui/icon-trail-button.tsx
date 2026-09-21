'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type Ref,
  type SVGProps,
} from 'react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Icon — a custom "stacked chevron" glyph (diagonal climb of squares).       */
/* -------------------------------------------------------------------------- */
function StackedChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M8 5H10V7H8V5Z" />
      <path d="M11 8H13V10H11V8Z" />
      <path d="M14 11H16V13H14V11Z" />
      <path d="M11 14H13V16H11V14Z" />
      <path d="M8 17H10V19H8V17Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Interaction — a tiny state machine driving `data-icon-state`.              */
/*  CSS does the motion; this only decides idle → expand → park.               */
/* -------------------------------------------------------------------------- */
type IconSlideState = 'idle' | 'expand' | 'park';
type IconSlideDir = 'in' | 'out';

const EXPAND_MS = 340;
const PARK_MS = 260;

const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isButtonOn = (el: HTMLElement) =>
  !el.matches('[disabled]') &&
  (el.matches(':focus-visible') || (canHover() && el.matches(':hover')));

function useButtonIconSlide() {
  const [iconState, setIconState] = useState<IconSlideState>('idle');
  const dirRef = useRef<IconSlideDir | null>(null);
  const timerRef = useRef<number | null>(null);
  const stateRef = useRef<IconSlideState>('idle');
  const buttonRef = useRef<HTMLElement | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setState = useCallback((next: IconSlideState) => {
    stateRef.current = next;
    setIconState(next);
  }, []);

  const wait = useCallback(
    (ms: number, fn: () => void) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        fn();
      }, ms);
    },
    [clearTimer]
  );

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const step = () => {
      const on = isButtonOn(btn);

      if (prefersReducedMotion()) {
        clearTimer();
        setState(on ? 'park' : 'idle');
        return;
      }

      if (on) {
        if (stateRef.current === 'park') return;
        if (stateRef.current === 'idle') {
          setState('expand');
          dirRef.current = 'in';
          wait(EXPAND_MS, step);
          return;
        }
        if (dirRef.current === 'in' && timerRef.current) return;
        clearTimer();
        setState('park');
        dirRef.current = 'in';
        return;
      }

      if (stateRef.current === 'idle') return;
      if (stateRef.current === 'park') {
        setState('expand');
        dirRef.current = 'out';
        wait(PARK_MS, step);
        return;
      }
      if (dirRef.current === 'out' && timerRef.current) return;
      clearTimer();
      setState('idle');
      dirRef.current = 'out';
    };

    const sync = () => step();
    btn.addEventListener('pointerenter', sync);
    btn.addEventListener('pointerleave', sync);
    btn.addEventListener('focus', sync);
    btn.addEventListener('blur', sync);

    return () => {
      clearTimer();
      btn.removeEventListener('pointerenter', sync);
      btn.removeEventListener('pointerleave', sync);
      btn.removeEventListener('focus', sync);
      btn.removeEventListener('blur', sync);
    };
  }, [clearTimer, setState, wait]);

  return { iconState, buttonRef };
}

/* -------------------------------------------------------------------------- */
/*  The staggered chevron trail that plays while the pill expands.             */
/* -------------------------------------------------------------------------- */
const TRAIL_OPACITIES = [1, 0.8, 0.6, 0.4, 0.2] as const;

function ButtonIconSlideTrail({ iconClassName }: { iconClassName: string }) {
  return (
    <>
      <span
        className="absolute inset-0 grid place-items-center opacity-100 transition-opacity duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[icon-state=expand]:opacity-0 motion-reduce:transition-none"
        aria-hidden="true"
      >
        <StackedChevronIcon className={cn('size-6', iconClassName)} />
      </span>
      <span className="absolute inset-0 flex items-center justify-around px-3" aria-hidden="true">
        {TRAIL_OPACITIES.map((opacity, index) => (
          <span
            key={opacity}
            className={cn(
              'size-6 -translate-x-[6px] opacity-0 transition-[opacity,translate] delay-0 duration-[260ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[icon-state=expand]:translate-x-0 group-data-[icon-state=expand]:opacity-100 group-data-[icon-state=park]:translate-x-[6px] group-data-[icon-state=park]:opacity-0 motion-reduce:!-translate-x-[6px] motion-reduce:transition-none motion-reduce:!delay-0',
              index === 0 && 'group-data-[icon-state=expand]:delay-[40ms]',
              index === 1 && 'group-data-[icon-state=expand]:delay-[65ms]',
              index === 2 && 'group-data-[icon-state=expand]:delay-[90ms]',
              index === 3 && 'group-data-[icon-state=expand]:delay-[115ms]',
              index === 4 && 'group-data-[icon-state=expand]:delay-[140ms]'
            )}
          >
            <StackedChevronIcon className={cn('size-full', iconClassName)} style={{ opacity }} />
          </span>
        ))}
      </span>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Icon Trail Button — colors, easing and sizes are inline, so the      */
/*  component is self-contained and needs no Tailwind @theme tokens.           */
/* -------------------------------------------------------------------------- */
interface IconTrailButtonOwnProps {
  /** Extra classes for the label span. */
  labelClassName?: string;
}

/** Without `href` it is a button; with one it renders an anchor instead. */
export type IconTrailButtonProps =
  | (IconTrailButtonOwnProps & ComponentPropsWithoutRef<'button'> & { href?: never })
  | (IconTrailButtonOwnProps & ComponentPropsWithoutRef<'a'> & { href: string });

export default function IconTrailButton({
  children,
  labelClassName,
  className,
  ...props
}: IconTrailButtonProps) {
  const { iconState, buttonRef } = useButtonIconSlide();
  const isLink = typeof props.href === 'string';
  const Tag = isLink ? 'a' : 'button';
  const tagProps = isLink
    ? props
    : { type: 'button' as const, ...(props as ComponentPropsWithoutRef<'button'>) };

  return (
    <Tag
      {...(tagProps as ComponentPropsWithoutRef<'button'> & ComponentPropsWithoutRef<'a'>)}
      ref={buttonRef as Ref<HTMLButtonElement & HTMLAnchorElement>}
      data-btn-icon-slide
      data-icon-state={iconState}
      className={cn(
        'group relative inline-flex h-12 origin-center cursor-pointer items-center overflow-hidden rounded-full bg-[#045f64] p-1 text-[#c6f56f] shadow-[0_1px_1px_rgba(16,24,40,0.16)] transition-[scale] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] outline-none select-none focus-visible:ring-2 focus-visible:ring-[#c6f56f] not-disabled:active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100',
        className
      )}
    >
      <span className="absolute inset-y-1 left-1 z-10 w-13 overflow-hidden rounded-full bg-[#c6f56f] text-[#045f64] shadow-[0_53px_15px_0_rgba(0,1,15,0),0_34px_14px_0_rgba(0,1,15,0.03),0_19px_11px_0_rgba(0,1,15,0.09),0_8px_8px_0_rgba(0,1,15,0.15),0_2px_5px_0_rgba(0,1,15,0.18)] transition-[width,left] duration-[500ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[icon-state=expand]:w-[calc(100%-8px)] group-data-[icon-state=expand]:duration-[640ms] group-data-[icon-state=park]:left-[calc(100%-3.25rem-0.25rem)] motion-reduce:transition-none">
        <ButtonIconSlideTrail iconClassName="fill-[#045f64]" />
      </span>
      <span
        className={cn(
          'relative z-20 mr-3 ml-15 origin-center scale-100 font-[family-name:Outfit,sans-serif] text-base font-normal whitespace-nowrap transition-[scale,opacity,margin] duration-[500ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[icon-state=expand]:scale-90 group-data-[icon-state=expand]:opacity-0 group-data-[icon-state=expand]:duration-[640ms] group-data-[icon-state=park]:mr-15 group-data-[icon-state=park]:ml-3 motion-reduce:!scale-100 motion-reduce:transition-none',
          labelClassName
        )}
      >
        {children}
      </span>
    </Tag>
  );
}
