'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { NavItem } from 'docora';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import type { OnRowEnter } from './nav-row';
import { NavTree } from './nav-tree';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
export const SidebarNav = ({ items, onNavigate, className }: SidebarNavProps) => {
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
};
