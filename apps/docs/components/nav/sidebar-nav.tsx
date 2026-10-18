'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from 'docora';
import gsap from 'gsap';
import type { TweenNavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from './animated-icon';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ROW = 'group relative z-[1] flex w-full items-center gap-1.5 px-2.5 py-1.5 text-sm';

/** Called when a row gains hover or focus, so the pill can glide to it. */
type OnRowEnter = (href: string) => void;

/**
 * One link row. It owns its own hover flag, so entering a row re-renders that
 * row and the one just left, not all sixty. The pill is moved imperatively
 * through `onEnter` and never goes through React state.
 */
function NavRow({
  item,
  isActive,
  onEnter,
  onNavigate,
}: Readonly<{
  item: TweenNavItem & { href: string };
  isActive: boolean;
  onEnter: OnRowEnter;
  onNavigate?: () => void;
}>) {
  const [hovered, setHovered] = useState(false);

  const enter = () => {
    setHovered(true);
    onEnter(item.href);
  };

  return (
    <Link
      href={item.href}
      data-nav-row={item.href}
      onClick={onNavigate}
      onMouseEnter={enter}
      onMouseLeave={() => setHovered(false)}
      onFocus={enter}
      onBlur={() => setHovered(false)}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        ROW,
        'rounded-md',
        isActive
          ? 'text-primary font-medium'
          : 'text-muted-foreground hover:text-highlighted transition-colors'
      )}
    >
      {item.icon && (
        <AnimatedIcon
          name={item.icon}
          hovered={hovered}
          className={
            isActive ? 'text-primary' : 'text-dimmed group-hover:text-foreground transition-colors'
          }
        />
      )}
      <span className="truncate">{item.label}</span>
      {item.isNew && (
        <span className="border-tween-accent/30 bg-tween-accent/10 text-tween-accent ms-auto shrink-0 rounded-full border px-1.5 py-px text-[9px] leading-[14px] font-semibold tracking-wide uppercase">
          New
        </span>
      )}
    </Link>
  );
}

function NavTree({
  items,
  level,
  pathname,
  onEnter,
  onNavigate,
}: Readonly<{
  items: TweenNavItem[];
  level: number;
  pathname: string;
  onEnter: OnRowEnter;
  onNavigate?: () => void;
}>) {
  const nested = level > 0;

  return (
    <ul className={cn('isolate', nested ? 'border-border ms-5 border-s' : '-mx-2.5 -mt-1.5')}>
      {items.map((item) => {
        const hasChildren = Boolean(item.children && item.children.length > 0);

        return (
          <li
            key={item.label + (item.href ?? '')}
            className={cn(nested && '-ms-px ps-1.5', hasChildren && 'mb-1.5 flex flex-col')}
          >
            {item.href ? (
              <NavRow
                item={item as TweenNavItem & { href: string }}
                isActive={item.href === pathname}
                onEnter={onEnter}
                onNavigate={onNavigate}
              />
            ) : (
              <span className={cn(ROW, 'text-highlighted font-semibold')}>
                {item.icon && (
                  <AnimatedIcon name={item.icon} hovered={false} className="text-highlighted" />
                )}
                <span className="truncate">{item.label}</span>
              </span>
            )}

            {hasChildren && (
              <NavTree
                items={item.children!}
                level={level + 1}
                pathname={pathname}
                onEnter={onEnter}
                onNavigate={onNavigate}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export type SidebarNavProps = Readonly<{
  items: NavItem[];
  onNavigate?: () => void;
  className?: string;
}>;

/**
 * Docora's SidebarNav plus a single highlight pill that follows the pointer and
 * settles back on the active row. `DocsLayout` has no sidebar slot, so this
 * ships alongside `DocsShell` rather than as a prop.
 *
 * The hovered row lives in a ref, not state: the pill is moved with GSAP, so
 * nothing on screen needs React to re-render when the pointer changes rows.
 */
export function SidebarNav({ items, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const hoveredRef = useRef<string | null>(null);

  /** Park the pill on `href`, or fade it out when that row isn't rendered. */
  const move = useCallback((href: string | null, animate: boolean) => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;

    const row = href
      ? nav.querySelector<HTMLElement>(`[data-nav-row="${CSS.escape(href)}"]`)
      : null;
    if (!row) {
      gsap.to(pill, { autoAlpha: 0, duration: animate ? 0.15 : 0, overwrite: true });
      return;
    }

    const navBox = nav.getBoundingClientRect();
    const rowBox = row.getBoundingClientRect();
    const vars = {
      x: rowBox.left - navBox.left,
      y: rowBox.top - navBox.top,
      width: rowBox.width,
      height: rowBox.height,
      autoAlpha: 1,
    };

    if (animate && !prefersReducedMotion()) {
      gsap.to(pill, { ...vars, duration: 0.28, ease: 'power3.out', overwrite: true });
    } else {
      gsap.set(pill, vars);
    }
  }, []);

  const onEnter = useCallback<OnRowEnter>(
    (href) => {
      hoveredRef.current = href;
      move(href, true);
    },
    [move]
  );

  // Hover wins; on mouse-out the pill returns to the active row. Clicking
  // navigates, `pathname` changes, and it stays put.
  const release = () => {
    hoveredRef.current = null;
    move(pathname, true);
  };

  useEffect(() => {
    move(hoveredRef.current ?? pathname, placed.current);
    placed.current = true;
  }, [pathname, items, move]);

  useEffect(() => {
    const onResize = () => move(hoveredRef.current ?? pathname, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pathname, move]);

  if (items.length === 0) return null;

  return (
    <nav
      ref={navRef}
      aria-label="Documentation"
      onMouseLeave={release}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) release();
      }}
      className={cn('relative', className)}
    >
      <span
        ref={pillRef}
        aria-hidden
        className="nav-pill pointer-events-none absolute top-0 left-0 z-0 rounded-md opacity-0"
      />
      <NavTree
        items={items}
        level={0}
        pathname={pathname}
        onEnter={onEnter}
        onNavigate={onNavigate}
      />
    </nav>
  );
}
