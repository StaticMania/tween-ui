import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getEntry, hrefFor } from '@/lib/registry';
import { cn } from '@/lib/utils';
import IconTrailButton from '@/registry/tweenui/icon-trail-button';
import { RevealGroup } from './reveal-group';
import { SHOWCASE_NAMES, showcasePreviews, type ShowcaseName } from './showcase-previews';

const CARD_SPANS = {
  'icon-trail-button': 'lg:col-span-6',
  'sliding-tabs': 'lg:col-span-3',
  'number-counter': 'lg:col-span-3',
  'flip-card': 'lg:col-span-4',
  'logo-orbit': 'lg:col-span-8',
  'avatar-reveal': 'lg:col-span-3',
  'faq-accordion': 'lg:col-span-3',
  'image-fan-slider': 'lg:col-span-6',
} as const satisfies Record<ShowcaseName, string>;

export type ShowcaseProps = Readonly<{
  componentCount: number;
}>;

export function Showcase({ componentCount }: ShowcaseProps) {
  const entries = SHOWCASE_NAMES.flatMap((name) => {
    const entry = getEntry(name);
    return entry ? [{ entry, span: CARD_SPANS[name], Preview: showcasePreviews[name] }] : [];
  });

  return (
    <section id="components" aria-labelledby="showcase-title" className="pb-24 md:pb-32">
      <div className="main-container">
        <RevealGroup>
          <div className="mb-14 flex flex-col items-start justify-between gap-8 md:mb-16 md:flex-row md:items-end">
            <div className="flex flex-col gap-5">
              <p data-reveal className="eyebrow">
                Components
              </p>
              <h2
                data-reveal-text
                id="showcase-title"
                className="text-highlighted max-w-3xl text-4xl font-medium tracking-[-0.035em] text-balance md:text-5xl lg:text-[56px] lg:leading-[1.02]"
              >
                {componentCount} of them, buttons to scroll counters.
              </h2>
            </div>
            <div data-reveal className="shrink-0">
              <IconTrailButton href="/components">All components</IconTrailButton>
            </div>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
            {entries.map(({ entry, span, Preview }) => (
              <li key={entry.name} data-reveal className={cn('flex', span)}>
                <Link
                  href={hrefFor(entry)}
                  className="group bezel-shell bezel-lift flex w-full focus-visible:outline-none"
                >
                  <div className="bezel-core flex w-full flex-col overflow-hidden">
                    <div
                      aria-hidden="true"
                      className="border-border/60 bg-muted/30 relative grid h-52 place-items-center overflow-hidden border-b"
                    >
                      <span className="stage-dots text-border-accented/60 absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
                      <span className="relative">
                        <Preview />
                      </span>
                    </div>
                    <div className="flex flex-1 items-start justify-between gap-4 py-5 pr-4 pl-6">
                      <div>
                        <h3 className="text-highlighted text-base font-medium tracking-[-0.01em]">
                          {entry.title}
                        </h3>
                        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed text-pretty">
                          {entry.description}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className="bg-highlighted/[0.05] text-dimmed group-hover:text-tween-accent ease-tween grid size-8 shrink-0 place-items-center rounded-full transition-[transform,color] duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 motion-reduce:transition-none"
                      >
                        <ArrowUpRight strokeWidth={1.5} className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </RevealGroup>
      </div>
    </section>
  );
}
