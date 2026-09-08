'use client';

import { useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import NumberFlow from '@number-flow/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface PricingPlan {
  /** Stable id used as the animation key. */
  id: string;
  /** Plan name, shown in the left selector and the morphing card badge. */
  name: string;
  /** Supporting line under the name in the selector. */
  subtitle: string;
  /** Body copy that crossfades in when the plan is selected. */
  description: string;
  /** Price billed monthly. */
  monthly: number;
  /** Price billed yearly. */
  yearly: number;
  /** How many of `features` are included (the rest render dimmed). */
  includedCount: number;
}

export interface PricingPlanSwitchProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Plans shown in the selector. Defaults to a 3-tier sample. */
  plans?: PricingPlan[];
  /** Feature checklist; each plan lights up its first `includedCount` rows. */
  features?: string[];
  /** Eyebrow badge above the heading. */
  eyebrow?: string;
  /** Section heading. */
  heading?: string;
  /** Section sub-heading. */
  description?: string;
  /** Currency symbol shown before the price. */
  currency?: string;
  /** Primary CTA label. */
  ctaText?: string;
  /** Primary CTA link. */
  ctaHref?: string;
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    subtitle: 'For early-stage teams',
    description:
      'Everything you need to get moving — core automation, a shared workspace, and email support to keep momentum.',
    monthly: 2500,
    yearly: 25000,
    includedCount: 5,
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'For growing teams',
    description:
      'Built for growing teams with advanced automation, priority workflows, and deeper analytics to keep everything moving.',
    monthly: 4190,
    yearly: 41900,
    includedCount: 7,
  },
  {
    id: 'business',
    name: 'Business',
    subtitle: 'For established businesses',
    description:
      'Enterprise-grade controls with custom workflows, team-wide governance, and dedicated support for large-scale operations.',
    monthly: 8290,
    yearly: 82900,
    includedCount: 9,
  },
];

const DEFAULT_FEATURES: string[] = [
  'Unlimited workflows',
  'Team workspace',
  'Email support',
  'Advanced automation',
  'Priority queue',
  'Usage analytics',
  'Role-based access',
  'Custom integrations',
  'Dedicated success manager',
];

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  );
}

function DotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="5" fill="#c6f56f" stroke="#045f64" strokeWidth={1} />
    </svg>
  );
}

export default function PricingPlanSwitch({
  plans = DEFAULT_PLANS,
  features = DEFAULT_FEATURES,
  eyebrow = 'Pricing',
  heading = 'Simple pricing that scales with you',
  description = 'Upgrade anytime as your needs evolve, and stay focused on building and expanding your product with confidence.',
  currency = '$',
  ctaText = 'Get started',
  ctaHref = '#',
  className,
  ...props
}: PricingPlanSwitchProps) {
  const firstId = plans[0]?.id ?? '';
  const [selectedId, setSelectedId] = useState(firstId);
  const [isYearly, setIsYearly] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const badgeWrapperRef = useRef<HTMLSpanElement>(null);
  const prevIdRef = useRef(firstId);
  const badgeRefs = useRef<Record<string, HTMLSpanElement | undefined>>({});
  const descriptionRefs = useRef<Record<string, HTMLParagraphElement | undefined>>({});

  const currentPlan = plans.find((p) => p.id === selectedId) ?? plans[0];
  const price = isYearly ? (currentPlan?.yearly ?? 0) : (currentPlan?.monthly ?? 0);

  // Establish the starting state: only the first badge/description is visible,
  // and the wrapper is sized to that badge so its width can morph later.
  useGSAP(
    () => {
      const wrapper = badgeWrapperRef.current;
      if (!wrapper) return;

      plans.forEach((plan, index) => {
        const badge = badgeRefs.current[plan.id];
        if (badge) gsap.set(badge, { opacity: index === 0 ? 1 : 0, y: 0 });
      });

      const first = badgeRefs.current[firstId];
      if (first) wrapper.style.width = `${first.offsetWidth}px`;
    },
    { scope: cardRef }
  );

  // Crossfade the badge + description and morph the badge width on selection.
  useGSAP(
    () => {
      const prev = prevIdRef.current;
      const next = selectedId;
      if (prev === next) return;

      const fromBadge = badgeRefs.current[prev];
      const toBadge = badgeRefs.current[next];
      const fromDescription = descriptionRefs.current[prev];
      const toDescription = descriptionRefs.current[next];
      const wrapper = badgeWrapperRef.current;

      if (prefersReducedMotion()) {
        plans.forEach((plan) => {
          const badge = badgeRefs.current[plan.id];
          const desc = descriptionRefs.current[plan.id];
          if (badge) gsap.set(badge, { opacity: plan.id === next ? 1 : 0, y: 0 });
          if (desc) gsap.set(desc, { opacity: plan.id === next ? 1 : 0, y: 0 });
        });
        if (wrapper && toBadge) wrapper.style.width = `${toBadge.offsetWidth}px`;
        prevIdRef.current = next;
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (fromBadge && toBadge) {
        const fromWidth = wrapper?.offsetWidth ?? fromBadge.offsetWidth;
        const toWidth = toBadge.offsetWidth;

        tl.set(toBadge, { y: 12, opacity: 0 }, 0);
        tl.to(fromBadge, { y: -12, opacity: 0, duration: 0.22 }, 0);
        tl.to(toBadge, { y: 0, opacity: 1, duration: 0.28 }, 0.12);
        tl.set(fromBadge, { y: 0 }, 0.3);

        if (wrapper) {
          tl.to(wrapper, { width: toWidth, duration: 0.28 }, toWidth > fromWidth ? 0 : 0.12);
        }
      }

      if (fromDescription && toDescription) {
        tl.set(toDescription, { y: 12, opacity: 0 }, 0);
        tl.to(fromDescription, { y: -12, opacity: 0, duration: 0.22 }, 0);
        tl.to(toDescription, { y: 0, opacity: 1, duration: 0.28 }, 0.12);
        tl.set(fromDescription, { y: 0 }, 0.3);
      }

      prevIdRef.current = next;
    },
    { scope: cardRef, dependencies: [selectedId] }
  );

  return (
    <section className={cn('w-full', className)} {...props}>
      <div className="mx-auto max-w-[980px] space-y-10 px-4 lg:space-y-14">
        {/* Header */}
        <div className="space-y-6">
          <div className="space-y-4 text-center">
            <span className="inline-block rounded-full border border-[#045f64]/20 px-3 py-1 text-xs font-medium tracking-wide text-[#045f64] uppercase dark:border-[#045f64]/40 dark:text-[#9fd4d6]">
              {eyebrow}
            </span>
            <div className="space-y-2">
              <h2 className="mx-auto max-w-[520px] text-2xl font-semibold text-[#12161F] sm:text-3xl dark:text-white">
                {heading}
              </h2>
              <p className="mx-auto max-w-[560px] text-sm text-[#045f64]/70 dark:text-[#9fd4d6]/80">
                {description}
              </p>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center">
            <label className="inline-flex cursor-pointer items-center">
              <span className="me-2.5 text-sm font-medium text-[#12161F] select-none dark:text-white">
                Monthly
              </span>
              <input
                type="checkbox"
                checked={isYearly}
                onChange={(e) => setIsYearly(e.target.checked)}
                className="peer sr-only"
                aria-label="Toggle yearly billing"
              />
              <span className="relative h-6 w-11 rounded-full bg-[#12161F]/15 transition-colors peer-checked:bg-[#c6f56f] peer-focus-visible:ring-2 peer-focus-visible:ring-[#045f64] peer-focus-visible:ring-offset-2 after:absolute after:top-1/2 after:left-[3px] after:size-5 after:-translate-y-1/2 after:rounded-full after:bg-[#045f64] after:transition-transform after:content-[''] peer-checked:after:translate-x-5 dark:bg-white/15 dark:ring-offset-[#12161F]" />
              <span className="ms-2.5 text-sm font-medium text-[#12161F] select-none dark:text-white">
                Yearly
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* Plan selector */}
          <div className="space-y-6 md:col-span-5">
            <div className="space-y-2 rounded-[20px] bg-[#045f64]/[0.06] p-2 dark:bg-[#045f64]/20">
              {plans.map((plan) => {
                const isActive = selectedId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedId(plan.id)}
                    data-active={isActive ? 'true' : 'false'}
                    className="group flex w-full cursor-pointer items-center justify-between gap-x-6 rounded-xl px-5 py-3 text-left transition-colors hover:bg-white data-[active=true]:bg-white data-[active=true]:shadow-sm dark:hover:bg-white/10 dark:data-[active=true]:bg-white/10"
                  >
                    <span className="space-y-1">
                      <span className="block text-sm font-medium text-[#12161F] dark:text-white">
                        {plan.name}
                      </span>
                      <span className="block text-xs text-[#045f64]/60 dark:text-[#9fd4d6]/80">
                        {plan.subtitle}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full bg-[#045f64] transition-transform duration-500 ease-in-out',
                        isActive ? 'scale-100' : 'scale-0'
                      )}
                    >
                      <ArrowIcon className="size-4 stroke-white" />
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-x-6">
              <span className="flex items-center gap-x-1.5 text-sm text-[#045f64] italic dark:text-[#9fd4d6]">
                <DotIcon className="size-3" />
                Free trial
              </span>
              <span className="flex items-center gap-x-1.5 text-sm text-[#045f64] italic dark:text-[#9fd4d6]">
                <DotIcon className="size-3" />
                Cancel anytime
              </span>
            </div>
          </div>

          {/* Card */}
          <div
            ref={cardRef}
            className="space-y-10 rounded-2xl border border-[#045f64]/15 bg-white px-6 py-8 md:col-span-7 dark:border-[#045f64]/40 dark:bg-[#12161F]"
          >
            <div className="space-y-6">
              <span
                ref={badgeWrapperRef}
                className="relative inline-flex h-7 items-center overflow-hidden rounded-full border border-[#045f64]/20 dark:border-[#045f64]/40"
              >
                {plans.map((plan) => (
                  <span
                    key={plan.id}
                    ref={(el) => {
                      badgeRefs.current[plan.id] = el ?? undefined;
                    }}
                    className="absolute inset-y-0 left-0 flex w-max items-center px-3 text-xs font-medium whitespace-nowrap text-[#045f64] dark:text-[#9fd4d6]"
                  >
                    {plan.name}
                  </span>
                ))}
              </span>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-medium text-[#12161F] dark:text-white">
                    Subscription
                  </h3>
                  <p className="text-3xl font-medium text-[#12161F] dark:text-white">
                    {currency}
                    <NumberFlow
                      value={price}
                      format={{
                        useGrouping: true,
                        minimumIntegerDigits: 2,
                        maximumFractionDigits: 0,
                        minimumFractionDigits: 0,
                      }}
                      transformTiming={{ duration: 700, easing: 'ease-out' }}
                      spinTiming={{ duration: 700, easing: 'ease-out' }}
                      opacityTiming={{ duration: 315, easing: 'ease-out' }}
                    />
                    <span className="text-sm font-normal text-[#045f64]/60 dark:text-[#9fd4d6]/80">
                      {isYearly ? '/year' : '/month'}
                    </span>
                  </p>
                </div>

                <span className="relative grid overflow-hidden">
                  {plans.map((plan, index) => (
                    <p
                      key={plan.id}
                      ref={(el) => {
                        descriptionRefs.current[plan.id] = el ?? undefined;
                      }}
                      className={cn(
                        'col-start-1 row-start-1 text-sm text-[#045f64]/70 dark:text-[#9fd4d6]/80',
                        index !== 0 && 'opacity-0'
                      )}
                    >
                      {plan.description}
                    </p>
                  ))}
                </span>
              </div>

              <a
                href={ctaHref}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#045f64] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#12161F] motion-reduce:transition-none dark:hover:bg-[#0d1117]"
              >
                {ctaText}
                <ArrowIcon className="size-4 stroke-white" />
              </a>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-medium text-[#12161F] dark:text-white">
                What&apos;s included:
              </h4>
              <ul className="space-y-4">
                {features.map((feature, index) => {
                  const isActive = index < (currentPlan?.includedCount ?? 0);
                  return (
                    <li key={feature} className="flex items-center gap-x-2">
                      <span
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full border p-1 transition-colors duration-500 ease-in-out',
                          isActive
                            ? 'border-[#045f64]/30 dark:border-[#045f64]/50'
                            : 'border-[#045f64]/15 dark:border-[#045f64]/40'
                        )}
                      >
                        <CheckIcon
                          className={cn(
                            'size-4 transition-colors duration-500 ease-in-out',
                            isActive
                              ? 'stroke-[#045f64] dark:stroke-[#9fd4d6]'
                              : 'stroke-[#045f64]/30'
                          )}
                        />
                      </span>
                      <span
                        className={cn(
                          'text-sm transition-colors duration-500 ease-in-out',
                          isActive
                            ? 'text-[#12161F] dark:text-white'
                            : 'text-[#045f64]/30 dark:text-[#9fd4d6]/40'
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
