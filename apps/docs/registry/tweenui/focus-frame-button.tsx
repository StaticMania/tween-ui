import type { ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils';

export interface FocusFrameButtonProps extends ComponentPropsWithRef<'button'> {
  children: string;
}

const roll =
  'block transition-transform duration-600 ease-(--expo) group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none';

function RollLabel({ children }: { children: string }) {
  return (
    <span className="relative block h-5 overflow-hidden leading-5">
      <span className={roll}>{children}</span>
      <span aria-hidden="true" className={roll}>
        {children}
      </span>
    </span>
  );
}

function ReturnArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('size-4 flex-none', className)}
    >
      <path d="M3 3.5v4.57a4 4 0 0 0 4 4h10m-4.43-4.43L17 12.07l-4.43 4.43" />
    </svg>
  );
}

const slide =
  '-translate-x-full transition-transform duration-600 ease-(--expo) group-hover:translate-x-0 group-focus-visible:translate-x-0 motion-reduce:transition-none';

const rail =
  'pointer-events-none absolute bg-[#045f64]/35 transition-transform delay-200 duration-500 ease-(--expo) group-hover:delay-0 group-focus-visible:delay-0 motion-reduce:transition-none dark:bg-[#c6f56f]/35';

const rails = [
  'top-0 left-0 h-px w-1/2 origin-left group-hover:scale-x-0 group-focus-visible:scale-x-0',
  'top-0 right-0 h-px w-1/2 origin-right group-hover:scale-x-0 group-focus-visible:scale-x-0',
  'bottom-0 left-0 h-px w-1/2 origin-left group-hover:scale-x-0 group-focus-visible:scale-x-0',
  'right-0 bottom-0 h-px w-1/2 origin-right group-hover:scale-x-0 group-focus-visible:scale-x-0',
  'top-0 left-0 h-1/2 w-px origin-top group-hover:scale-y-0 group-focus-visible:scale-y-0',
  'bottom-0 left-0 h-1/2 w-px origin-bottom group-hover:scale-y-0 group-focus-visible:scale-y-0',
  'top-0 right-0 h-1/2 w-px origin-top group-hover:scale-y-0 group-focus-visible:scale-y-0',
  'right-0 bottom-0 h-1/2 w-px origin-bottom group-hover:scale-y-0 group-focus-visible:scale-y-0',
];

const corner =
  'pointer-events-none absolute size-2.5 border-[#045f64] transition-transform duration-500 ease-(--expo) group-hover:delay-200 group-hover:duration-700 group-hover:ease-(--snap) group-focus-visible:delay-200 group-focus-visible:duration-700 group-focus-visible:ease-(--snap) motion-reduce:transition-none dark:border-[#c6f56f]';

const corners = [
  'top-0 left-0 border-t-[1.5px] border-l-[1.5px] group-hover:translate-1 group-focus-visible:translate-1',
  'top-0 right-0 border-t-[1.5px] border-r-[1.5px] group-hover:-translate-x-1 group-hover:translate-y-1 group-focus-visible:-translate-x-1 group-focus-visible:translate-y-1',
  'bottom-0 left-0 border-b-[1.5px] border-l-[1.5px] group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1',
  'right-0 bottom-0 border-r-[1.5px] border-b-[1.5px] group-hover:-translate-1 group-focus-visible:-translate-1',
];

export default function FocusFrameButton({
  children,
  className,
  type = 'button',
  ...props
}: FocusFrameButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'group relative inline-flex cursor-pointer p-1 text-sm font-medium tracking-wide whitespace-nowrap text-[#045f64] uppercase select-none [--expo:cubic-bezier(0.16,1,0.3,1)] [--snap:cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60',
        className
      )}
      {...props}
    >
      {rails.map((placement) => (
        <span key={placement} aria-hidden="true" className={cn(rail, placement)} />
      ))}
      {corners.map((placement) => (
        <span key={placement} aria-hidden="true" className={cn(corner, placement)} />
      ))}
      <span className="relative flex h-11 items-center gap-2.5 overflow-hidden rounded-[2px] bg-[#c6f56f] px-5 transition-[scale] duration-200 ease-out group-active:scale-[0.97] motion-reduce:transition-none">
        <RollLabel>{children}</RollLabel>
        <span aria-hidden="true" className="relative flex size-4 overflow-hidden">
          <ReturnArrow className={slide} />
          <ReturnArrow className={slide} />
        </span>
      </span>
    </button>
  );
}
