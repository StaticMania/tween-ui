'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from 'docora';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from './animated-icon';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ROW = 'group relative z-[1] flex w-full items-center gap-1.5 px-2.5 py-1.5 text-sm';

type RowState = {
  hovered: string | null;
  setHovered: (href: string | null) => void;
};

function NavTree({
  items,
  level,
  onNavigate,
  rows,
}: Readonly<{
  items: NavItem[];
  level: number;
  onNavigate?: () => void;
  rows: RowState;
}>) {
  const pathname = usePathname();
  const nested = level > 0;

  return (
    <ul className={cn('isolate', nested ? 'border-border ms-5 border-s' : '-mx-2.5 -mt-1.5')}>
      {items.map((item) => {
        const isActive = item.href !== undefined && item.href === pathname;
        const hasChildren = Boolean(item.children && item.children.length > 0);
        const isHovered = item.href !== undefined && item.href === rows.hovered;

        return (
          <li
            key={item.label + (item.href ?? '')}
            className={cn(nested && '-ms-px ps-1.5', hasChildren && 'mb-1.5 flex flex-col')}
          >
            {item.href ? (
              <Link
                href={item.href}
                data-nav-row={item.href}
                onClick={onNavigate}
                onMouseEnter={() => rows.setHovered(item.href!)}
                onFocus={() => rows.setHovered(item.href!)}
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
                    hovered={isHovered}
                    className={
                      isActive
                        ? 'text-primary'
                        : 'text-dimmed group-hover:text-foreground transition-colors'
                    }
                  />
                )}
                <span className="truncate">{item.label}</span>
              </Link>
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
                onNavigate={onNavigate}
                rows={rows}
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
 */
export function SidebarNav({ items, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const [hovered, setHovered] = useState<string | null>(null);

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

  // Hover wins; on mouse-out `hovered` clears and the pill returns to the
  // active row. Clicking navigates, `pathname` changes, and it stays put.
  useEffect(() => {
    move(hovered ?? pathname, placed.current);
    placed.current = true;
  }, [hovered, pathname, items, move]);

  useEffect(() => {
    const onResize = () => move(hovered ?? pathname, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [hovered, pathname, move]);

  if (items.length === 0) return null;

  return (
    <nav
      ref={navRef}
      aria-label="Documentation"
      onMouseLeave={() => setHovered(null)}
      onBlur={() => setHovered(null)}
      className={cn('relative', className)}
    >
      <span
        ref={pillRef}
        aria-hidden
        className="nav-pill pointer-events-none absolute top-0 left-0 z-0 rounded-md opacity-0"
      />
      <NavTree items={items} level={0} onNavigate={onNavigate} rows={{ hovered, setHovered }} />
    </nav>
  );
}
