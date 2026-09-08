'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

function Sparkles() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

export interface ShinyButtonProps extends ComponentPropsWithRef<'button'> {
  /** Leading icon. Defaults to a sparkles glyph; pass `null` to hide it. */
  icon?: ReactNode;
}

export default function ShinyButton({
  children,
  className,
  icon,
  type = 'button',
  ...props
}: ShinyButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'group relative inline-flex h-12 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg border border-transparent bg-[#045f64] px-6 text-sm font-medium text-[#c6f56f] shadow-[0_1px_1px_rgba(16,24,40,0.16)] transition-colors duration-300 hover:bg-[#045f64]/95 focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none dark:ring-offset-[#12161F]',
        className
      )}
      {...props}
    >
      {/* Diagonal shine sweep on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-[-67%] size-full -translate-y-1/2 rotate-[75deg] bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.35)_50%,transparent)] transition-none will-change-[left] group-hover:left-[70%] group-hover:transition-[left] group-hover:duration-700 group-hover:ease-in-out motion-reduce:hidden"
      />

      {icon !== null ? (
        <span className="relative inline-flex transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
          {icon ?? <Sparkles />}
        </span>
      ) : null}
      <span className="relative">{children}</span>
    </button>
  );
}
