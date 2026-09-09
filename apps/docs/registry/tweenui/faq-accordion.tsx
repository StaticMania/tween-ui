'use client';

import { useId, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { SplitText } from 'gsap/SplitText';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, CustomEase, SplitText);
if (!CustomEase.get('faq-ease')) {
  CustomEase.create('faq-ease', '0.625, 0.05, 0, 1');
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface FaqAccordionItem {
  question: ReactNode;
  answer: ReactNode;
}

export interface FaqAccordionProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  items: FaqAccordionItem[];
  /** Index open on first render when uncontrolled. `null` starts fully closed. */
  defaultOpen?: number | null;
  /** Controlled open index. `null` = all closed. */
  open?: number | null;
  /** Fires with the newly open index (or `null`). */
  onOpenChange?: (index: number | null) => void;
  /** Let the open item close when clicked again. Defaults to `true`. */
  collapsible?: boolean;
}

export default function FaqAccordion({
  items,
  defaultOpen = 0,
  open,
  onOpenChange,
  collapsible = true,
  className,
  ...props
}: FaqAccordionProps) {
  const isControlled = open !== undefined;
  const [internal, setInternal] = useState<number | null>(defaultOpen);
  const openIndex = isControlled ? open : internal;

  const rootRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const splitRefs = useRef<(SplitText | null)[]>([]);
  const firstRun = useRef(true);
  const uid = useId();

  const setOpen = (next: number | null) => {
    if (!isControlled) setInternal(next);
    onOpenChange?.(next);
  };

  const toggle = (index: number) =>
    setOpen(openIndex === index ? (collapsible ? null : index) : index);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const isFirst = firstRun.current;
      firstRun.current = false;

      const clearSplit = (index: number) => {
        splitRefs.current[index]?.revert();
        splitRefs.current[index] = null;
      };

      // Split into masked lines only while animating; revert after so text
      // reflows normally on resize.
      const splitLines = (index: number) => {
        const text = textRefs.current[index];
        if (!text) return null;
        clearSplit(index);
        const split = SplitText.create(text, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'faq-line',
        });
        splitRefs.current[index] = split;
        return split;
      };

      contentRefs.current.forEach((content, index) => {
        if (!content) return;
        const opened = index === openIndex;
        gsap.killTweensOf(content);

        if (opened) {
          if (isFirst || reduced) {
            content.style.height = 'auto';
            return;
          }
          gsap.set(content, { height: 'auto' });
          const target = content.offsetHeight;
          const split = splitLines(index);
          gsap.fromTo(
            content,
            { height: 0 },
            {
              height: target,
              duration: 0.6,
              ease: 'faq-ease',
              onComplete: () => {
                content.style.height = 'auto';
              },
            }
          );
          if (split) {
            gsap.fromTo(
              split.lines,
              { yPercent: 110 },
              {
                yPercent: 0,
                duration: 0.65,
                stagger: 0.06,
                ease: 'power3.out',
                onComplete: () => clearSplit(index),
              }
            );
          }
        } else {
          if (isFirst || reduced) {
            content.style.height = '0px';
            return;
          }
          const split = splitLines(index);
          if (split) {
            gsap.to(split.lines, {
              yPercent: 110,
              duration: 0.45,
              stagger: 0.04,
              ease: 'power3.out',
              onComplete: () => clearSplit(index),
            });
          }
          gsap.to(content, { height: 0, duration: 0.6, ease: 'faq-ease' });
        }
      });

      return () => {
        splitRefs.current.forEach((split) => split?.revert());
      };
    },
    { scope: rootRef, dependencies: [openIndex] }
  );

  return (
    <div
      ref={rootRef}
      data-faq-accordion
      className={cn('w-full max-w-[560px] space-y-3', className)}
      {...props}
    >
      {items.map((item, index) => {
        const opened = index === openIndex;
        const buttonId = `${uid}-trigger-${index}`;
        const panelId = `${uid}-panel-${index}`;

        return (
          <div
            key={index}
            data-faq-item
            data-expand={opened ? 'true' : 'false'}
            className="min-w-0 overflow-hidden rounded-2xl border border-[#045f64]/15 bg-white dark:border-[#045f64]/40 dark:bg-[#12161F]"
          >
            <h3 className="min-w-0">
              <button
                type="button"
                id={buttonId}
                aria-expanded={opened}
                aria-controls={panelId}
                onClick={() => toggle(index)}
                className="flex w-full min-w-0 cursor-pointer items-start justify-between gap-x-4 px-6 pt-5 pb-5 text-left text-base font-medium text-[#12161F] data-[expand=true]:pb-3 dark:text-white"
                data-expand={opened ? 'true' : 'false'}
              >
                <span className="min-w-0 flex-1 text-wrap">{item.question}</span>
                <span
                  data-expand={opened ? 'true' : 'false'}
                  className="group grid size-6 shrink-0 place-items-center text-[#045f64] dark:text-[#9fd4d6]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5 stroke-current"
                    fill="none"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  >
                    <path d="M4 12h16" strokeLinecap="round" />
                    <path
                      d="M12 4v16"
                      strokeLinecap="round"
                      className="origin-center transition-opacity duration-300 group-data-[expand=true]:opacity-0 motion-reduce:transition-none"
                    />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              data-faq-content
              ref={(node) => {
                contentRefs.current[index] = node;
              }}
              className="min-w-0 overflow-hidden"
            >
              <div
                data-faq-text
                ref={(node) => {
                  textRefs.current[index] = node;
                }}
                className="px-6 pb-6 text-sm wrap-break-word text-[#045f64]/70 dark:text-[#9fd4d6]/80"
              >
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
