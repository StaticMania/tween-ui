import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const SHOWCASE_NAMES = [
  'icon-trail-button',
  'sliding-tabs',
  'number-counter',
  'flip-card',
  'logo-orbit',
  'avatar-reveal',
  'faq-accordion',
  'image-fan-slider',
] as const;

export type ShowcaseName = (typeof SHOWCASE_NAMES)[number];

const DIGITS = Array.from({ length: 10 }, (_, digit) => digit);
const COUNTER_DIGITS = [
  { digit: 1, roll: '[--roll-end:-40px]' },
  { digit: 2, roll: '[--roll-end:-80px]' },
  null,
  { digit: 4, roll: '[--roll-end:-160px]' },
  { digit: 8, roll: '[--roll-end:-320px]' },
  { digit: 0, roll: '[--roll-end:0px]' },
] as const;
const FAQ_ROWS = [
  { width: 'w-[70px]', isOpen: false },
  { width: 'w-[84px]', isOpen: true },
  { width: 'w-[60px]', isOpen: false },
] as const;
const ORBIT_DOTS = [
  'top-0 left-1/2',
  'top-1/2 left-full',
  'top-full left-1/2',
  'top-1/2 left-0',
] as const;
const AVATAR_TONES = [
  'bg-tween-teal',
  'bg-tween-teal-deep [animation-delay:120ms]',
  'bg-tween-teal-soft [animation-delay:240ms]',
  'bg-tween-lime [animation-delay:360ms]',
] as const;

function StackedChevron({ className }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8 5H10V7H8V5Z" />
      <path d="M11 8H13V10H11V8Z" />
      <path d="M14 11H16V13H14V11Z" />
      <path d="M11 14H13V16H11V14Z" />
      <path d="M8 17H10V19H8V17Z" />
    </svg>
  );
}

function IconTrailPreview() {
  return (
    <div className="bg-tween-teal text-tween-lime relative flex h-10 w-[150px] items-center rounded-full p-[3px]">
      <span className="bg-tween-lime animate-preview-pill absolute top-[3px] bottom-[3px] left-[3px] grid w-[34px] place-items-center rounded-full motion-reduce:animate-none">
        <StackedChevron className="fill-tween-teal size-[18px]" />
      </span>
      <span className="animate-preview-label relative z-10 ml-11 text-[13px] whitespace-nowrap motion-reduce:animate-none">
        Get started
      </span>
    </div>
  );
}

function SlidingTabsPreview() {
  return (
    <div className="bg-tween-ink relative flex gap-0.5 rounded-[10px] p-1">
      <span className="bg-tween-lime animate-preview-tabs absolute top-1 h-[calc(100%-8px)] w-14 rounded-md motion-reduce:animate-none" />
      {['Home', 'Docs', 'Blocks'].map((label) => (
        <span key={label} className="relative z-10 w-14 py-1.5 text-center text-xs text-white">
          {label}
        </span>
      ))}
    </div>
  );
}

function NumberCounterPreview() {
  return (
    <div className="text-highlighted flex items-center text-[34px] font-medium tracking-[-0.02em] tabular-nums">
      {COUNTER_DIGITS.map((column, index) =>
        column === null ? (
          <span key={`separator-${index}`}>,</span>
        ) : (
          <span key={`digit-${index}`} className="h-10 overflow-hidden">
            <span
              className={cn('animate-preview-roll block motion-reduce:animate-none', column.roll)}
            >
              {DIGITS.map((value) => (
                <span key={value} className="block h-10 leading-10">
                  {value}
                </span>
              ))}
            </span>
          </span>
        )
      )}
    </div>
  );
}

function FlipCardPreview() {
  return (
    <div className="h-[92px] w-[70px] [perspective:600px]">
      <div className="animate-preview-flip relative size-full [transform-style:preserve-3d] motion-reduce:animate-none">
        <div className="bg-tween-teal absolute inset-0 flex flex-col gap-1.5 rounded-lg p-2.5 [backface-visibility:hidden]">
          <span className="h-[5px] w-3/5 rounded-[3px] bg-white/55" />
          <span className="h-[5px] w-2/5 rounded-[3px] bg-white/55" />
        </div>
        <div className="bg-tween-lime absolute inset-0 flex [transform:rotateY(180deg)] flex-col gap-1.5 rounded-lg p-2.5 [backface-visibility:hidden]">
          <span className="bg-tween-teal/50 h-[5px] w-[70%] rounded-[3px]" />
          <span className="bg-tween-teal/50 h-[5px] w-1/2 rounded-[3px]" />
          <span className="bg-tween-teal/50 h-[5px] w-3/5 rounded-[3px]" />
        </div>
      </div>
    </div>
  );
}

function LogoOrbitPreview() {
  return (
    <div className="relative size-[110px]">
      <div className="border-tween-teal/35 animate-preview-spin absolute inset-0 rounded-full border border-dashed motion-reduce:animate-none">
        {ORBIT_DOTS.map((position) => (
          <span
            key={position}
            className={cn(
              'bg-tween-teal animate-preview-spin-reverse absolute -m-2 size-4 rounded motion-reduce:animate-none',
              position
            )}
          />
        ))}
      </div>
      <span className="bg-tween-lime absolute top-1/2 left-1/2 -m-3.5 size-7 rounded-full" />
    </div>
  );
}

function AvatarRevealPreview() {
  return (
    <div className="flex items-center">
      {AVATAR_TONES.map((tone) => (
        <span
          key={tone}
          className={cn(
            'border-background animate-preview-pop -ml-[9px] size-[30px] rounded-full border-2 first:ml-0 motion-reduce:animate-none',
            tone
          )}
        />
      ))}
      <span className="bg-highlighted/15 animate-preview-caption ml-3 h-2.5 w-16 rounded-[5px] motion-reduce:animate-none" />
    </div>
  );
}

function FaqAccordionPreview() {
  return (
    <div className="flex w-[170px] flex-col gap-2">
      {FAQ_ROWS.map(({ width, isOpen }) => {
        return (
          <div key={width} className="border-border bg-background rounded-lg border px-2.5 py-2">
            <div className="flex items-center justify-between">
              <span className={cn('bg-highlighted/50 h-1.5 rounded-[3px]', width)} />
              <span className="relative size-3">
                <span className="bg-tween-accent absolute top-[5px] right-0 left-0 h-0.5 rounded-[1px]" />
                <span
                  className={cn(
                    'bg-tween-accent absolute top-0 bottom-0 left-[5px] w-0.5 rounded-[1px]',
                    isOpen && 'animate-preview-morph motion-reduce:animate-none'
                  )}
                />
              </span>
            </div>
            {isOpen && (
              <div className="animate-preview-open grid motion-reduce:animate-none">
                <div className="overflow-hidden">
                  <span className="bg-highlighted/18 mt-2 block h-[5px] w-[90%] rounded-[3px]" />
                  <span className="bg-highlighted/18 mt-2 block h-[5px] w-[70%] rounded-[3px]" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ImageFanPreview() {
  return (
    <div className="relative h-[90px] w-[150px]">
      {[
        'bg-tween-teal-deep',
        'bg-tween-teal [animation-delay:-1.8s]',
        'bg-tween-teal-soft [animation-delay:-3.6s]',
      ].map((tone) => (
        <span
          key={tone}
          className={cn(
            'animate-preview-fan absolute top-1/2 left-1/2 -mt-[35px] -ml-[26px] h-[70px] w-[52px] rounded-md motion-reduce:animate-none',
            tone
          )}
        />
      ))}
    </div>
  );
}

export const showcasePreviews: Record<ShowcaseName, () => ReactNode> = {
  'icon-trail-button': IconTrailPreview,
  'sliding-tabs': SlidingTabsPreview,
  'number-counter': NumberCounterPreview,
  'flip-card': FlipCardPreview,
  'logo-orbit': LogoOrbitPreview,
  'avatar-reveal': AvatarRevealPreview,
  'faq-accordion': FaqAccordionPreview,
  'image-fan-slider': ImageFanPreview,
};
