import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { registry } from '@/lib/registry';
import { BlockMosaic } from './block-mosaic';
import { RevealGroup } from './reveal-group';

const FEATURED = ['tab-wipe', 'pricing-plan-switch', 'rating-carousel', 'cta-starfall'];
const CHIP_LIMIT = 8;

export function BlockSpotlight() {
  const blocks = registry.filter((entry) => entry.type === 'block');
  const featured = FEATURED.flatMap((name) => blocks.filter((entry) => entry.name === name));
  const chips = blocks.filter((entry) => !FEATURED.includes(entry.name)).slice(0, CHIP_LIMIT);
  const remaining = blocks.length - chips.length - featured.length;

  return (
    <section id="blocks" aria-labelledby="blocks-title" className="pb-24 md:pb-32">
      <div className="main-container">
        <RevealGroup className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-5 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <p data-reveal className="eyebrow">
              Blocks
            </p>
            <h2
              data-reveal-text
              id="blocks-title"
              className="text-highlighted text-4xl font-medium tracking-[-0.035em] text-balance md:text-5xl lg:text-[56px] lg:leading-[1.02]"
            >
              {blocks.length} full page sections.
            </h2>
            <p
              data-reveal-text
              className="text-muted-foreground max-w-md text-[15px] leading-relaxed text-pretty sm:text-base md:text-[17px]"
            >
              Heroes, pricing tables, testimonials, CTAs. Same rules as the components: one file,
              copy it, change it.
            </p>

            <ul data-reveal className="mt-4 flex flex-wrap gap-2">
              {chips.map((entry) => (
                <li key={entry.name}>
                  <Link
                    href={`/block/${entry.name}`}
                    className="bg-highlighted/[0.03] text-muted-foreground ring-border hover:text-highlighted hover:ring-tween-accent/40 focus-visible:ring-tween-accent ease-tween inline-flex rounded-full px-3.5 py-1.5 font-mono text-xs ring-1 transition-[color,box-shadow] duration-500 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
                  >
                    {entry.name}
                  </Link>
                </li>
              ))}
              {remaining > 0 && (
                <li>
                  <Link
                    href="/components#blocks"
                    className="group text-tween-accent hover:text-highlighted inline-flex items-center gap-1.5 px-2 py-1.5 font-mono text-xs transition-colors duration-500"
                  >
                    +{remaining} more
                    <ArrowRight
                      strokeWidth={1.5}
                      className="ease-tween size-3.5 transition-transform duration-500 group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div data-reveal className="lg:col-span-7">
            <BlockMosaic entries={featured} />
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
