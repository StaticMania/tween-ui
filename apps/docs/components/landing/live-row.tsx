import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import GlowButton from '@/registry/tweenui/glow-button';
import IconTrailButton from '@/registry/tweenui/icon-trail-button';
import ShinyButton from '@/registry/tweenui/shiny-button';
import TextRollButton from '@/registry/tweenui/text-roll-button';
import { RevealGroup } from './reveal-group';

type LiveItem = Readonly<{
  name: string;
  engine: 'CSS' | 'GSAP';
  element: ReactNode;
}>;

const LIVE_ITEMS: readonly LiveItem[] = [
  {
    name: 'icon-trail-button',
    engine: 'CSS',
    element: <IconTrailButton>Icon trail</IconTrailButton>,
  },
  { name: 'text-roll-button', engine: 'GSAP', element: <TextRollButton>Text roll</TextRollButton> },
  { name: 'glow-button', engine: 'CSS', element: <GlowButton>Glow</GlowButton> },
  { name: 'shiny-button', engine: 'CSS', element: <ShinyButton>Shiny</ShinyButton> },
];

export function LiveRow() {
  return (
    <section aria-labelledby="live-title" className="py-16 md:py-24">
      <div className="main-container">
        <RevealGroup>
          <div className="mb-10 flex flex-col gap-3.5">
            <p
              data-reveal
              className="text-tween-accent font-mono text-xs tracking-[0.08em] uppercase"
            >
              Live
            </p>
            <h2
              data-reveal-text
              id="live-title"
              className="text-highlighted max-w-2xl text-3xl font-medium tracking-[-0.025em] text-balance md:text-[40px] md:leading-[1.1]"
            >
              Every preview is the real component.
            </h2>
            <p
              data-reveal-text
              className="text-muted-foreground max-w-2xl text-[15px] leading-relaxed text-pretty sm:text-base md:text-[17px]"
            >
              Hover any of these. It is the same file the CLI writes into your project.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LIVE_ITEMS.map((item) => (
              <li key={item.name} data-reveal>
                <Link
                  href={`/component/${item.name}`}
                  className="group border-border hover:border-tween-accent/40 relative flex h-full flex-col overflow-hidden rounded-2xl border transition-colors duration-300 motion-reduce:transition-none"
                >
                  <div className="bg-muted/30 relative grid h-44 place-items-center overflow-hidden">
                    <span
                      aria-hidden="true"
                      className="stage-dots text-border-accented/70 absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
                    />
                    <span className="relative">{item.element}</span>
                  </div>
                  <div className="border-border group-hover:border-tween-accent/40 flex items-center justify-between gap-2 border-t px-4 py-3 transition-colors duration-300 motion-reduce:transition-none">
                    <span className="text-muted-foreground font-mono text-xs">{item.name}</span>
                    <span className="flex items-center gap-2">
                      <span className="border-tween-accent/30 bg-tween-accent/10 text-tween-accent rounded-full border px-[7px] py-0.5 font-mono text-[10px] tracking-[0.06em] uppercase">
                        {item.engine}
                      </span>
                      <ArrowUpRight
                        className="text-dimmed group-hover:text-tween-accent ease-tween size-4 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                        aria-hidden="true"
                      />
                    </span>
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
