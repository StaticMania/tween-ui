'use client';

import {
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type PointerEvent,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, CustomEase);

const ITEM_CLASS =
  'relative z-10 cursor-pointer rounded-md border-0 bg-transparent px-4 py-2 font-[family-name:Outfit,sans-serif] text-sm font-normal text-white no-underline outline-none transition-colors duration-500 ease-out hover:text-[#045f64] data-[highlighted=true]:text-[#045f64] focus-visible:text-[#045f64] focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Bounds are measured against the item's offsetParent, which must be the
// positioned <nav>. Don't wrap the items in another positioned element or the
// indicator will be offset relative to the wrong ancestor.
const getItemBounds = (item: HTMLElement) => {
  const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = item;
  return { left, top, width, height };
};

export interface SlidingTabsItem {
  value: string;
  label: string;
  href?: string;
}

interface SlidingTabsProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'> {
  items: SlidingTabsItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export default function SlidingTabs({
  items,
  defaultValue,
  value: valueProp,
  onValueChange,
  className,
  ...props
}: SlidingTabsProps) {
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const activeValue = isControlled ? valueProp : uncontrolled;

  const highlightItem = (item: HTMLElement | null) => {
    navRef.current?.querySelectorAll<HTMLElement>('[data-nav-item]').forEach((el) => {
      el.dataset.highlighted = el === item ? 'true' : 'false';
    });
  };

  const moveToItem = (item: HTMLElement) => {
    const indicator = indicatorRef.current;
    if (!indicator) return;

    highlightItem(item);
    const bounds = getItemBounds(item);
    const reduced = prefersReducedMotion();

    if (!visibleRef.current) {
      gsap.set(indicator, { ...bounds, opacity: 1, scale: reduced ? 1 : 0 });
      if (!reduced) {
        gsap.to(indicator, { scale: 1, duration: 0.6, ease: 'bouncy-ease', overwrite: 'auto' });
      }
      visibleRef.current = true;
      return;
    }

    if (reduced) {
      gsap.set(indicator, { ...bounds, opacity: 1, scale: 1 });
      return;
    }

    gsap.to(indicator, {
      ...bounds,
      opacity: 1,
      scale: 1,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const hideIndicator = () => {
    const active = navRef.current?.querySelector<HTMLElement>(
      '[data-nav-item][data-active="true"]'
    );
    if (active) {
      moveToItem(active);
      return;
    }

    const indicator = indicatorRef.current;
    if (!indicator) return;

    highlightItem(null);
    if (prefersReducedMotion()) {
      gsap.set(indicator, { opacity: 0, scale: 0 });
      visibleRef.current = false;
      return;
    }

    gsap.to(indicator, {
      opacity: 0,
      scale: 0,
      duration: 0.25,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        visibleRef.current = false;
      },
    });
  };

  useGSAP(
    () => {
      CustomEase.create('bouncy-ease', '0.34, 1.42, 0.64, 1');
      const nav = navRef.current;
      const indicator = indicatorRef.current;
      if (!nav || !indicator) return;

      gsap.set(indicator, { opacity: 0, scale: 0, transformOrigin: 'center center' });

      const active = nav.querySelector<HTMLElement>('[data-nav-item][data-active="true"]');
      if (active) requestAnimationFrame(() => moveToItem(active));

      const onResize = () => {
        const current = nav.querySelector<HTMLElement>('[data-nav-item][data-active="true"]');
        if (current) {
          highlightItem(current);
          gsap.set(indicator, { ...getItemBounds(current), opacity: 1, scale: 1 });
          visibleRef.current = true;
          return;
        }
        highlightItem(null);
        gsap.set(indicator, { opacity: 0, scale: 0 });
        visibleRef.current = false;
      };

      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    },
    { scope: navRef }
  );

  const onEnter = (event: FocusEvent<HTMLElement> | PointerEvent<HTMLElement>) => {
    const item = (event.target as HTMLElement | null)?.closest('[data-nav-item]');
    if (item instanceof HTMLElement) moveToItem(item);
  };

  return (
    <nav
      {...props}
      ref={navRef}
      data-nav-tabs
      aria-label={props['aria-label'] ?? 'Sliding tabs'}
      className={cn(
        'relative inline-flex items-center rounded-xl bg-[#045f64] p-1 text-white shadow-[0_1px_1px_rgba(16,24,40,0.16)] select-none',
        className
      )}
      onPointerOver={onEnter}
      onPointerLeave={hideIndicator}
      onFocus={onEnter}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) hideIndicator();
      }}
    >
      <div
        ref={indicatorRef}
        data-nav-indicator
        className="pointer-events-none absolute origin-center rounded-md bg-[#c6f56f] motion-reduce:transition-none"
        aria-hidden="true"
      />
      {items.map((item) => {
        const isActive = item.value === activeValue;
        const shared = {
          'data-nav-item': true,
          'data-active': isActive ? 'true' : 'false',
          'data-highlighted': isActive ? 'true' : 'false',
          className: ITEM_CLASS,
        } as const;

        if (item.href) {
          return (
            <a
              key={item.value}
              href={item.href}
              {...shared}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                if (!isControlled) setUncontrolled(item.value);
                onValueChange?.(item.value);
              }}
            >
              {item.label}
            </a>
          );
        }

        return (
          <button
            key={item.value}
            type="button"
            {...shared}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => {
              if (!isControlled) setUncontrolled(item.value);
              onValueChange?.(item.value);
            }}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
