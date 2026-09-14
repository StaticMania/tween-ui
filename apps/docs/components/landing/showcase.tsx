import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getEntry, hrefFor } from '@/lib/registry';
import { RevealGroup } from './reveal-group';
import { SHOWCASE_NAMES, showcasePreviews } from './showcase-previews';

export type ShowcaseProps = Readonly<{
  componentCount: number;
}>;

export function Showcase({ componentCount }: ShowcaseProps) {
  const entries = SHOWCASE_NAMES.flatMap((name) => {
    const entry = getEntry(name);
    return entry ? [{ entry, Preview: showcasePreviews[name] }] : [];
  });

  return (
    <section id="components" aria-labelledby="showcase-title" className="pb-16 md:pb-24">
      <div className="main-container">
        <RevealGroup>
          <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="flex flex-col gap-3.5">
              <p
                data-reveal
                className="text-tween-accent font-mono text-xs tracking-[0.08em] uppercase"
              >
                Components
              </p>
              <h2
                data-reveal-text
                id="showcase-title"
                className="text-highlighted max-w-2xl text-3xl font-medium tracking-[-0.025em] text-balance md:text-[40px] md:leading-[1.1]"
              >
                {componentCount} of them, buttons to scroll counters.
              </h2>
            </div>
            <Link
              data-reveal
              href="/components"
              className="group text-tween-accent hover:text-highlighted inline-flex items-center gap-2 text-[15px] font-medium whitespace-nowrap transition-colors"
            >
              All components
              <ArrowRight
                className="ease-tween size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {entries.map(({ entry, Preview }) => (
              <li key={entry.name} data-reveal>
                <Link
                  href={hrefFor(entry)}
                  className="group border-border bg-muted/30 hover:border-tween-accent/40 hover:bg-muted/60 text-highlighted flex h-full flex-col rounded-2xl border p-4 transition-colors duration-300 motion-reduce:transition-none"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold">{entry.title}</h3>
                    <ArrowUpRight
                      className="text-dimmed group-hover:text-tween-accent ease-tween size-4 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="border-border/60 bg-background relative my-3 grid aspect-[16/10] place-items-center overflow-hidden rounded-xl border"
                  >
                    <span className="stage-dots text-border-accented/60 absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
                    <span className="relative">
                      <Preview />
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {entry.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </RevealGroup>
      </div>
    </section>
  );
}
