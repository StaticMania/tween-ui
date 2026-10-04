import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils';

export interface DotBloomButtonProps extends ComponentPropsWithRef<'button'> {
  children: string;
  variant?: 'primary' | 'secondary';
}

const variants = {
  primary:
    'bg-[#045f64] text-[#c6f56f] [--bloom:#c6f56f] hover:text-[#045f64] focus-visible:text-[#045f64]',
  secondary:
    'bg-[#c6f56f] text-[#045f64] [--bloom:#045f64] hover:text-[#c6f56f] focus-visible:text-[#c6f56f]',
};

const roll =
  'block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-focus-visible:translate-y-0';

export default function DotBloomButton({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: DotBloomButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'group relative isolate inline-flex h-11 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md px-5 text-sm font-medium tracking-wide whitespace-nowrap uppercase transition-colors duration-400 ease-[cubic-bezier(0.65,0,0.35,1)] focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none dark:ring-offset-[#12161F]',
        variants[variant],
        className
      )}
      {...props}
    >
      <span aria-hidden="true" className="size-1.5 flex-none rounded-full bg-current text-left">
        <span className="pointer-events-none absolute -z-10 aspect-square w-[calc(200%+100px)] -translate-x-[calc(50%-3px)] -translate-y-[calc(50%-3px)] scale-0 rounded-full bg-(--bloom) transition-transform duration-650 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-100 group-focus-visible:scale-100 motion-reduce:transition-none" />
      </span>
      <span className="relative block overflow-hidden leading-5">
        <span className={roll}>{children}</span>
        <span
          aria-hidden="true"
          className={cn(roll, 'absolute top-full left-0 motion-reduce:hidden')}
        >
          {children}
        </span>
      </span>
    </button>
  );
}
