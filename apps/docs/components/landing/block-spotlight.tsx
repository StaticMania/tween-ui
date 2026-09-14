import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { registry } from '@/lib/registry';
import HeroTabWipe from '@/registry/tweenui/hero-tab-wipe';
import { RevealGroup } from './reveal-group';

const FEATURED = 'hero-tab-wipe';
const CHIP_LIMIT = 9;

export function BlockSpotlight() {
  const blocks = registry.filter((entry) => entry.type === 'block');
  const chips = blocks.filter((entry) => entry.name !== FEATURED).slice(0, CHIP_LIMIT);
  const remaining = blocks.length - chips.length - 1;

  return (
    <section id="blocks" aria-labelledby="blocks-title" className="pb-16 md:pb-24">
      <div className="main-container">
        <RevealGroup className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-3.5 lg:col-span-5">
            <p
              data-reveal
              className="text-tween-accent font-mono text-xs tracking-[0.08em] uppercase"
            >
              Blocks
            </p>
            <h2
              data-reveal-text
              id="blocks-title"
              className="text-highlighted text-3xl font-medium tracking-[-0.025em] text-balance md:text-[40px] md:leading-[1.1]"
            >
              {blocks.length} full page sections.
            </h2>
            <p
              data-reveal-text
              className="text-muted-foreground text-[15px] leading-relaxed text-pretty sm:text-base md:text-[17px]"
            >
              Heroes, pricing tables, testimonials, CTAs. Same rules as the components: one file,
              copy it, change it.
            </p>

            <ul data-reveal className="mt-3 flex flex-wrap gap-2">
              {chips.map((entry) => (
                <li key={entry.name}>
                  <Link
                    href={`/block/${entry.name}`}
                    className="border-border text-muted-foreground hover:border-tween-accent/40 hover:text-highlighted inline-flex rounded-full border px-3 py-1.5 font-mono text-xs transition-colors duration-300 motion-reduce:transition-none"
                  >
                    {entry.name}
                  </Link>
                </li>
              ))}
              {remaining > 0 && (
                <li>
                  <Link
                    href="/components#blocks"
                    className="group text-tween-accent hover:text-highlighted inline-flex items-center gap-1.5 px-2 py-1.5 font-mono text-xs transition-colors"
                  >
                    +{remaining} more
                    <ArrowRight
                      className="ease-tween size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <figure data-reveal className="lg:col-span-7">
            <div className="bg-tween-ink stage-grid overflow-hidden rounded-2xl p-2 sm:p-5 dark:ring-1 dark:ring-white/10">
              <div className="bg-background overflow-hidden rounded-xl">
                <div className="border-border flex items-center gap-2 border-b px-3 py-2.5">
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="bg-border-accented size-2.5 rounded-full" />
                    <span className="bg-border-accented size-2.5 rounded-full" />
                    <span className="bg-border-accented size-2.5 rounded-full" />
                  </span>
                  <span className="bg-muted text-dimmed ml-2 flex-1 truncate rounded-md px-2.5 py-1 text-center font-mono text-[11px]">
                    tweenui.dev/block/{FEATURED}
                  </span>
                </div>
                <HeroTabWipe className="px-2 py-4 sm:px-5 sm:py-6" />
              </div>
            </div>
            <figcaption className="text-muted-foreground mt-4 font-mono text-xs">
              {FEATURED} — wipes between slides on a clip-path edge; autoplays every 4s, and a click
              wipes toward the tab
            </figcaption>
          </figure>
        </RevealGroup>
      </div>
    </section>
  );
}
