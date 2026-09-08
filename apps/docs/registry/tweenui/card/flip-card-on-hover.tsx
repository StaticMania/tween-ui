'use client';

import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type FocusEvent } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface FlipCardOnHoverProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  /** Card heading, shown on both faces. */
  title: string;
  /** Small eyebrow / index above the title, e.g. "(01)". */
  eyebrow?: string;
  /** Front-face supporting line under the title. */
  subtitle?: string;
  /** Back-face body text revealed on flip. */
  description?: string;
  /** Front-face image URL. */
  image?: string;
  /** Alt text for the image (defaults to the title). */
  imageAlt?: string;
  /** Bulleted points revealed on the back, staggered in. */
  features?: string[];
  /** CTA link on the back. Omit to hide the CTA. */
  href?: string;
  /** CTA label. */
  ctaText?: string;
  /** Controlled flip state. When set, hover/tap no longer flips it. */
  flipped?: boolean;
  /** Fires when the card flips (interaction-driven). */
  onFlippedChange?: (flipped: boolean) => void;
}

export default function FlipCardOnHover({
  title,
  eyebrow,
  subtitle,
  description,
  image,
  imageAlt,
  features = [],
  href,
  ctaText = 'Learn more',
  flipped: flippedProp,
  onFlippedChange,
  className,
  ...props
}: FlipCardOnHoverProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const isControlled = flippedProp !== undefined;
  const [internal, setInternal] = useState(false);
  const flipped = isControlled ? flippedProp : internal;

  // Only hover-capable, fine-pointer devices flip on hover; touch falls back to tap.
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const setFlipped = (next: boolean) => {
    if (!isControlled) setInternal(next);
    onFlippedChange?.(next);
  };

  const items = () =>
    backRef.current ? gsap.utils.toArray<HTMLElement>('[data-flip-item]', backRef.current) : [];

  // Establish the 3D faces once.
  useGSAP(() => {
    const front = frontRef.current;
    const back = backRef.current;
    if (!front || !back) return;
    gsap.set(innerRef.current, { transformStyle: 'preserve-3d' });
    gsap.set([front, back], { backfaceVisibility: 'hidden' });
    gsap.set(front, { rotateY: 0 });
    gsap.set(back, { rotateY: 180 });
    gsap.set(items(), { opacity: 0, x: -24 });
  }, []);

  // Flip + stagger the back content.
  useGSAP(
    () => {
      const front = frontRef.current;
      const back = backRef.current;
      if (!front || !back) return;
      const its = items();

      if (prefersReducedMotion()) {
        gsap.set(front, { rotateY: flipped ? 180 : 0 });
        gsap.set(back, { rotateY: flipped ? 0 : 180 });
        gsap.set(its, flipped ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 });
        return;
      }

      gsap.to(front, {
        rotateY: flipped ? 180 : 0,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true,
      });
      gsap.to(back, {
        rotateY: flipped ? 0 : 180,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: true,
      });

      if (!its.length) return;
      if (flipped) {
        gsap.fromTo(
          its,
          { opacity: 0, x: -24 },
          {
            opacity: 1,
            x: 0,
            duration: 0.45,
            stagger: 0.08,
            delay: 0.18,
            ease: 'power2.out',
            overwrite: true,
          }
        );
      } else {
        gsap.to(its, {
          opacity: 0,
          x: -16,
          duration: 0.2,
          stagger: 0.03,
          ease: 'power2.in',
          overwrite: true,
        });
      }
    },
    { dependencies: [flipped] }
  );

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (canHover && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFlipped(false);
    }
  };

  return (
    <div
      {...props}
      data-flip-card
      data-flipped={flipped ? 'true' : 'false'}
      tabIndex={0}
      onMouseEnter={() => canHover && setFlipped(true)}
      onMouseLeave={() => canHover && setFlipped(false)}
      onFocus={() => canHover && setFlipped(true)}
      onBlur={onBlur}
      onClick={() => !canHover && setFlipped(!flipped)}
      style={{ perspective: 1000 }}
      className={cn(
        'relative h-[360px] w-full max-w-[320px] cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#045f64]',
        className
      )}
    >
      <div ref={innerRef} className="relative h-full w-full">
        {/* Front */}
        <div
          ref={frontRef}
          data-flip-front
          className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-[#045f64]/20 bg-white dark:border-[#045f64]/40 dark:bg-[#12161F]"
        >
          <div className="space-y-4 p-5">
            {eyebrow ? (
              <span className="text-xs text-[#045f64]/60 dark:text-[#9fd4d6]/80">{eyebrow}</span>
            ) : null}
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-[#12161F] dark:text-white">{title}</h3>
              {subtitle ? (
                <p className="text-sm text-[#045f64]/70 dark:text-[#9fd4d6]/80">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {image ? (
            <figure className="relative min-h-0 flex-1 overflow-hidden">
              <img src={image} alt={imageAlt ?? title} className="size-full object-cover" />
            </figure>
          ) : null}
        </div>

        {/* Back */}
        <div
          ref={backRef}
          data-flip-back
          className="absolute inset-0 flex flex-col rounded-2xl border border-[#045f64]/20 bg-white p-5 dark:border-[#045f64]/40 dark:bg-[#12161F]"
        >
          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              {eyebrow ? (
                <span
                  data-flip-item
                  className="block text-xs text-[#045f64]/60 dark:text-[#9fd4d6]/80"
                >
                  {eyebrow}
                </span>
              ) : null}
              <div className="space-y-1">
                <h3 data-flip-item className="text-lg font-medium text-[#12161F] dark:text-white">
                  {title}
                </h3>
                {description ? (
                  <p data-flip-item className="text-sm text-[#045f64]/70 dark:text-[#9fd4d6]/80">
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
            {features.length > 0 ? (
              <ul className="space-y-2.5">
                {features.map((feature) => (
                  <li
                    key={feature}
                    data-flip-item
                    className="flex items-center gap-2 text-sm text-[#045f64] dark:text-[#9fd4d6]"
                  >
                    <Arrow className="size-3.5 shrink-0 stroke-[#045f64] dark:stroke-[#9fd4d6]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {href ? (
            <a
              data-flip-item
              href={href}
              className="group/link mt-5 flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-[#045f64]/10 motion-reduce:transition-none"
            >
              <span className="text-sm font-medium text-[#12161F] dark:text-white">{ctaText}</span>
              <Arrow className="size-4 stroke-[#045f64] transition-transform duration-300 group-hover/link:translate-x-1 motion-reduce:transition-none dark:stroke-[#9fd4d6]" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
