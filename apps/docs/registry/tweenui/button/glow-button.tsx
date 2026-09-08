'use client';

import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils';

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path d="M6.75 13.5 11.25 9 6.75 4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type GlowButtonProps = ComponentPropsWithRef<'button'>;

export default function GlowButton({
  children,
  className,
  type = 'button',
  ...props
}: GlowButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'group relative isolate inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:ring-offset-[#12161F]',
        className
      )}
      {...props}
    >
      {/* Gradient line peeking out along the bottom edge, its colors flowing
          left to right, then the dark pill surface over it. */}
      <style>{'@keyframes tween-glow-flow{to{background-position:-200% 0}}'}</style>
      <span
        className="absolute inset-x-0 top-[2px] -bottom-[2px] [animation:tween-glow-flow_4s_linear_infinite] rounded-full bg-[linear-gradient(90deg,#ff5a5a,#ffca3a,#8765ff,#30e3ff,#ff5a5a)] bg-[length:200%_100%] motion-reduce:[animation:none]"
        aria-hidden="true"
      />
      <span className="absolute inset-0 rounded-full bg-[#12161f]" aria-hidden="true" />

      <span className="relative z-10">{children}</span>
      <span className="relative z-10 flex size-[18px] overflow-hidden">
        <Chevron className="size-[18px] shrink-0 translate-x-0 stroke-white transition-transform duration-300 ease-in-out group-hover:translate-x-full motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
        <Chevron className="size-[18px] shrink-0 -translate-x-[200%] stroke-white transition-transform duration-300 ease-in-out group-hover:-translate-x-full motion-reduce:hidden" />
      </span>

      {/* Colorful glow that sharpens slightly on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-3 left-1/2 -z-10 flex -translate-x-1/2 items-center"
      >
        <span className="h-6 w-8 rounded-full bg-[#ff5a5a] blur-lg transition-all duration-500 group-hover:blur-md motion-reduce:transition-none" />
        <span className="h-6 w-8 rounded-full bg-[#ffca3a] blur-lg transition-all duration-500 group-hover:blur-md motion-reduce:transition-none" />
        <span className="h-8 w-10 rounded-full bg-[#8765ff] blur-lg transition-all duration-500 group-hover:blur-md motion-reduce:transition-none" />
        <span className="h-6 w-7 rounded-full bg-[#30e3ff] blur-lg transition-all duration-500 group-hover:blur-md motion-reduce:transition-none" />
      </span>
    </button>
  );
}
