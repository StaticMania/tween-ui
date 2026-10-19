'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TweenNavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { AnimatedIcon } from './animated-icon';

export const ROW = 'group relative z-[1] flex w-full items-center gap-1.5 px-2.5 py-1.5 text-sm';

/** Called when a row gains hover or focus, so the pill can glide to it. */
export type OnRowEnter = (href: string) => void;

/**
 * One link row. It owns its own hover flag, so entering a row re-renders that
 * row and the one just left, not all sixty. The pill is moved imperatively
 * through `onEnter` and never goes through React state.
 */
export const NavRow = ({
  item,
  isActive,
  onEnter,
  onNavigate,
}: Readonly<{
  item: TweenNavItem & { href: string };
  isActive: boolean;
  onEnter: OnRowEnter;
  onNavigate?: () => void;
}>) => {
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
};
