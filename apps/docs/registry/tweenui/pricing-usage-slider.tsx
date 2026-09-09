'use client';

import { useId, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import SlideArrowButton from './slide-arrow-button';

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path
        d="M13 2 4.5 13.5H11l-.5 8.5L19.5 10.5H13V2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path d="m4 12 5.5 5.5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export interface PricingUsageSliderRange {
  /** Cheapest price on the track. */
  min: number;
  /** Most expensive price on the track. */
  max: number;
  /** Where the handle starts. */
  defaultValue: number;
  /** Caption under the slider, e.g. "minutes per month". */
  label?: string;
}

export interface PricingUsageSliderPlan {
  /** Plan name. */
  name: string;
  /** One line under the name. */
  description: string;
  /** Fixed monthly price. Omit it and pass `range` for a slider-driven plan. */
  price?: number;
  /** Small print under the price. */
  priceNote?: string;
  /** What the plan includes. */
  features: string[];
  /** Button label. */
  cta: string;
  /** Runs when the plan's button is pressed. */
  onClick?: () => void;
  /** Highlights the card and adds the badge. */
  popular?: boolean;
  /** Turns the price into a slider the visitor scrubs. */
  range?: PricingUsageSliderRange;
}

export interface PricingUsageSliderProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title'
> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Plans shown side by side. Two is the intended shape. */
  plans?: PricingUsageSliderPlan[];
  /** Badge on the popular card. */
  popularLabel?: string;
}

const DEFAULT_TITLE = 'Flexible pricing for every creator';

const DEFAULT_DESCRIPTION =
  'Start free and scale as you grow. No contracts, no surprises — just work that ships.';

const DEFAULT_PLANS: PricingUsageSliderPlan[] = [
  {
    name: 'Creator',
    description: 'Best for solo creators publishing every week',
    price: 79,
    priceNote: 'Cancel or pause any time',
    popular: true,
    features: ['600+ minutes monthly', 'One custom cloned voice', 'Commercial usage license'],
    cta: 'Upgrade now',
  },
  {
    name: 'Scale',
    description: 'Pay for the volume your team actually uses',
    priceNote: 'Billed monthly, adjust any time',
    range: { min: 399, max: 1200, defaultValue: 750, label: 'Drag to set your monthly volume' },
    features: ['Custom SLA and volume', 'Unlimited cloned voices', 'SSO, SAML and a dedicated CSM'],
    cta: 'Contact sales',
  },
];

function PlanCard({ plan, popularLabel }: { plan: PricingUsageSliderPlan; popularLabel: string }) {
  const sliderId = useId();
  const [value, setValue] = useState(plan.range?.defaultValue ?? 0);

  const range = plan.range;
  const fill = range
    ? Math.max(0, Math.min(100, ((value - range.min) / (range.max - range.min || 1)) * 100))
    : 0;

  return (
    <div
      data-pricing-card
      className={cn(
        'flex h-full flex-col justify-between rounded-2xl border p-6',
        'motion-reduce:transform-none motion-reduce:transition-none',
        plan.popular
          ? 'border-transparent bg-white shadow-sm dark:bg-white'
          : 'border-[#18181b]/10 bg-white dark:border-white/10 dark:bg-[#161b22]'
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center rounded-full border',
              plan.popular
                ? 'border-[#18181b]/15 text-[#12161f]'
                : 'border-[#18181b]/15 text-[#12161f] dark:border-white/15 dark:text-white'
            )}
          >
            <BoltIcon className="size-5" />
          </span>
          {plan.popular && (
            <span className="rounded-full bg-[#c6f56f] px-3 py-1 text-xs text-[#12161f]">
              {popularLabel}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3
            className={cn(
              'text-lg font-medium',
              plan.popular ? 'text-[#12161f]' : 'text-[#12161f] dark:text-white'
            )}
          >
            {plan.name}
          </h3>
          <p
            className={cn(
              'text-xs',
              plan.popular ? 'text-[#18181b]/60' : 'text-[#18181b]/60 dark:text-white/60'
            )}
          >
            {plan.description}
          </p>
        </div>

        <div className="space-y-1">
          <p
            className={cn(
              'text-3xl font-normal',
              plan.popular ? 'text-[#12161f]' : 'text-[#12161f] dark:text-white'
            )}
          >
            ${range ? <NumberFlow value={value} trend={0} /> : plan.price}
            <span
              className={cn(
                'text-sm',
                plan.popular ? 'text-[#18181b]/60' : 'text-[#18181b]/60 dark:text-white/60'
              )}
            >
              {' '}
              /mo
            </span>
          </p>
          {plan.priceNote && (
            <p
              className={cn(
                'text-xs',
                plan.popular ? 'text-[#18181b]/50' : 'text-[#18181b]/50 dark:text-white/50'
              )}
            >
              {plan.priceNote}
            </p>
          )}
        </div>

        {range && (
          <div className="space-y-2">
            <label htmlFor={sliderId} className="sr-only">
              {range.label ?? 'Adjust your monthly volume'}
            </label>
            <input
              id={sliderId}
              type="range"
              min={range.min}
              max={range.max}
              step={1}
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
              // The fill is painted straight onto the track, so the component
              // needs no stylesheet of its own.
              style={{
                background: `linear-gradient(to right, #045f64 0%, #045f64 ${fill}%, rgba(24,24,27,0.12) ${fill}%, rgba(24,24,27,0.12) 100%)`,
              }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#045f64] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#045f64]"
            />
            {range.label && <p className="text-xs text-[#18181b]/50">{range.label}</p>}
          </div>
        )}

        <ul className="space-y-2 pt-1">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className={cn(
                'flex items-start gap-x-2 text-xs',
                plan.popular ? 'text-[#18181b]/70' : 'text-[#18181b]/70 dark:text-white/70'
              )}
            >
              <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-[#045f64] dark:text-[#c6f56f]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex w-full justify-center">
        <SlideArrowButton onClick={plan.onClick}>{plan.cta}</SlideArrowButton>
      </div>
    </div>
  );
}

export default function PricingUsageSlider({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  plans = DEFAULT_PLANS,
  popularLabel = 'Most popular',
  className,
  ...props
}: PricingUsageSliderProps) {
  return (
    <section
      data-pricing-usage-slider
      className={cn('w-full px-5 py-14 md:py-16', className)}
      {...props}
    >
      <div className="mx-auto max-w-[1064px] space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-[#12161f] md:text-4xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto max-w-[450px] text-sm text-[#18181b]/60 md:text-base dark:text-white/60">
            {description}
          </p>
        </div>

        <div className="mx-auto grid max-w-[860px] items-stretch gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} popularLabel={popularLabel} />
          ))}
        </div>
      </div>
    </section>
  );
}
