import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export interface ArrowTileButtonProps extends ComponentPropsWithRef<'button'> {
  children: string;
  variant?: 'tilt' | 'swap';
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      aria-hidden="true"
      className={cn('size-4 flex-none', className)}
    >
      <path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" />
    </svg>
  );
}

interface Wave {
  leadMs: number;
  spreadMs: number;
}

function waveDelay(index: number, count: number, { leadMs, spreadMs }: Wave): CSSProperties {
  const step = count > 1 ? spreadMs / (count - 1) : 0;
  const style: CSSProperties & { '--hop-delay': string } = {
    '--hop-delay': `${leadMs + Math.round((count - 1 - index) * step)}ms`,
  };
  return style;
}

const toppleChar =
  'inline-block whitespace-pre transition-none group-[:is(:hover,:focus-visible)]:[translate:0_45%] group-[:is(:hover,:focus-visible)]:[rotate:-14deg] group-[:is(:hover,:focus-visible)]:[scale:1_0.35] group-[:is(:hover,:focus-visible)]:[transform:scale(1,2.8571)_rotate(14deg)_translateY(-45%)] group-[:is(:hover,:focus-visible)]:[transition:translate_145ms_var(--dip)_var(--hop-delay),rotate_145ms_var(--dip)_var(--hop-delay),scale_145ms_var(--dip)_var(--hop-delay),transform_580ms_var(--spring)_calc(var(--hop-delay)+145ms)] motion-reduce:transition-none';

const liftChar =
  'inline-block whitespace-pre transition-none group-[:is(:hover,:focus-visible)]:[translate:0_-40%] group-[:is(:hover,:focus-visible)]:[rotate:9deg] group-[:is(:hover,:focus-visible)]:[transform:rotate(-9deg)_translateY(40%)] group-[:is(:hover,:focus-visible)]:[transition:translate_160ms_var(--lift)_var(--hop-delay),rotate_160ms_var(--lift)_var(--hop-delay),transform_560ms_var(--spring)_calc(var(--hop-delay)+160ms)] motion-reduce:transition-none';

function WaveLabel({
  children,
  charClassName,
  wave,
}: {
  children: string;
  charClassName: string;
  wave: Wave;
}) {
  const chars = Array.from(children);
  return (
    <>
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {chars.map((char, index) => (
          <span key={index} className={charClassName} style={waveDelay(index, chars.length, wave)}>
            {char}
          </span>
        ))}
      </span>
    </>
  );
}

const TOPPLE_WAVE: Wave = { leadMs: 140, spreadMs: 225 };
const LIFT_WAVE: Wave = { leadMs: 40, spreadMs: 340 };

const knockRelease =
  'grid [transition:translate_150ms_var(--soft),rotate_150ms_var(--soft),scale_150ms_var(--soft),transform_150ms_var(--soft)] motion-reduce:transition-none';

function TiltContent({ children }: { children: string }) {
  return (
    <>
      <span
        className={cn(
          knockRelease,
          'origin-left group-[:is(:hover,:focus-visible)]:[translate:-0.3em_0] group-[:is(:hover,:focus-visible)]:[scale:0.95_1.04] group-[:is(:hover,:focus-visible)]:[transform:scale(1.0526,0.9615)_translateX(0.3em)] group-[:is(:hover,:focus-visible)]:[transition:translate_110ms_var(--dip)_60ms,scale_110ms_var(--dip)_60ms,transform_420ms_170ms_var(--bounce)]'
        )}
      >
        <span aria-hidden="true" className="col-start-1 row-start-1 rounded-md bg-[#045f64]" />
        <span className="relative col-start-1 row-start-1 flex items-center px-5">
          <WaveLabel charClassName={toppleChar} wave={TOPPLE_WAVE}>
            {children}
          </WaveLabel>
        </span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          knockRelease,
          '-ml-px size-11 origin-bottom-left group-[:is(:hover,:focus-visible)]:[translate:-0.2em_0] group-[:is(:hover,:focus-visible)]:[rotate:-12deg] group-[:is(:hover,:focus-visible)]:[transform:rotate(12deg)_translateX(0.2em)] group-[:is(:hover,:focus-visible)]:[transition:translate_120ms_var(--dip),rotate_120ms_var(--dip),transform_400ms_120ms_var(--bounce)]'
        )}
      >
        <span className="col-start-1 row-start-1 rounded-md bg-[#045f64]" />
        <span className="relative col-start-1 row-start-1 grid place-items-center">
          <Arrow />
        </span>
      </span>
    </>
  );
}

function SwapContent({ children }: { children: string }) {
  return (
    <>
      <span className="flex items-center rounded-md bg-[#c6f56f] px-5 text-[#045f64] transition-[translate] duration-500 ease-(--circ) group-[:is(:hover,:focus-visible)]:translate-x-[2.875rem] motion-reduce:transition-none">
        <WaveLabel charClassName={liftChar} wave={LIFT_WAVE}>
          {children}
        </WaveLabel>
      </span>
      <span
        aria-hidden="true"
        className="absolute top-0 right-0 z-10 grid size-11 place-items-center rounded-md bg-[#045f64] text-[#c6f56f] transition-[right] duration-500 ease-(--circ) group-[:is(:hover,:focus-visible)]:right-[calc(100%-2.75rem)] motion-reduce:transition-none"
      >
        <Arrow className="transition-[rotate] duration-500 ease-(--circ) group-[:is(:hover,:focus-visible)]:-rotate-360 motion-reduce:transition-none" />
      </span>
    </>
  );
}

const variants = {
  tilt: 'text-[#c6f56f] [--bounce:cubic-bezier(0.34,2.27,0.64,1)] [--dip:cubic-bezier(0.55,0.085,0.68,0.53)] [--soft:cubic-bezier(0.59,1,0.88,1.01)]',
  swap: 'pr-[2.875rem] [--circ:cubic-bezier(0.785,0.135,0.15,0.86)] [--lift:cubic-bezier(0.33,1,0.68,1)]',
};

export default function ArrowTileButton({
  children,
  className,
  variant = 'tilt',
  type = 'button',
  ...props
}: ArrowTileButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'group relative inline-flex h-11 cursor-pointer items-stretch text-sm font-medium tracking-wide whitespace-nowrap uppercase transition-[scale] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] select-none [--spring:linear(0,0.406_4.2%,0.855_8.3%,1.161_12.5%,1.273_16.7%,1.234_20.8%,1.125_25%,1.017_29.2%,0.95_33.3%,0.931_37.5%,0.946_41.7%,0.975_45.8%,1_50%,1.014_54.2%,1.017_58.3%,1.012_62.5%,1.005_66.7%,0.999_70.8%,0.996_75%,0.997_83.3%,1_91.7%,1)] focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 focus-visible:outline-none active:[scale:0.955_0.925] disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none dark:ring-offset-[#12161F]',
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === 'swap' ? (
        <SwapContent>{children}</SwapContent>
      ) : (
        <TiltContent>{children}</TiltContent>
      )}
    </button>
  );
}
