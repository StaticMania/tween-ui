import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlowButton from '@/registry/tweenui/glow-button';
import IconTrailButton from '@/registry/tweenui/icon-trail-button';
import ShinyButton from '@/registry/tweenui/shiny-button';
import TextRollButton from '@/registry/tweenui/text-roll-button';
import { RevealGroup } from './reveal-group';

type LiveItem = Readonly<{
  name: string;
  engine: 'CSS' | 'GSAP';
  span: string;
  element: ReactNode;
}>;

const LIVE_ITEMS: readonly LiveItem[] = [
  {
    name: 'icon-trail-button',
    engine: 'CSS',
    span: 'sm:col-span-2 lg:col-span-6 lg:row-span-2',
    element: <IconTrailButton>Icon trail</IconTrailButton>,
  },
  {
    name: 'text-roll-button',
    engine: 'GSAP',
    span: 'sm:col-span-2 lg:col-span-6',
    element: <TextRollButton>Text roll</TextRollButton>,
  },
  {
    name: 'glow-button',
    engine: 'CSS',
    span: 'lg:col-span-3',
    element: <GlowButton>Glow</GlowButton>,
  },
  {
    name: 'shiny-button',
    engine: 'CSS',
    span: 'lg:col-span-3',
    element: <ShinyButton>Shiny</ShinyButton>,
  },
];

export function LiveRow() {
  return (
    <section aria-labelledby="live-title" className="py-24 md:py-32">
      <div className="main-container">
        <RevealGroup>
          <div className="mb-14 grid gap-6 md:mb-16 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="flex flex-col gap-5 lg:col-span-7">
              <p data-reveal className="eyebrow">
                Live
              </p>
              <h2
                data-reveal-text
                id="live-title"
                className="text-highlighted text-4xl font-medium tracking-[-0.035em] text-balance md:text-5xl lg:text-[56px] lg:leading-[1.02]"
              >
                Every preview is the real component.
              </h2>
            </div>
            <p
              data-reveal-text
              className="text-muted-foreground text-[15px] leading-relaxed text-pretty sm:text-base md:text-[17px] lg:col-span-5"
            >
              Hover any of these. It is the same file the CLI writes into your project.
            </p>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[repeat(2,minmax(15rem,auto))]">
            {LIVE_ITEMS.map((item) => (
              <li key={item.name} data-reveal className={cn('flex', item.span)}>
                <Link
                  href={`/component/${item.name}`}
                  className="group bezel-shell bezel-lift flex w-full focus-visible:outline-none"
                >
                  <div className="bezel-core flex w-full flex-col overflow-hidden">
                    <div className="relative grid min-h-48 flex-1 place-items-center">
                      <span
                        aria-hidden="true"
                        className="stage-dots text-border-accented/70 absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
                      />
                      <span className="relative">{item.element}</span>
                    </div>
                    <div className="border-border/60 flex items-center justify-between gap-3 border-t py-2.5 pr-2.5 pl-5">
                      <span className="text-muted-foreground font-mono text-xs">{item.name}</span>
                      <span className="flex items-center gap-2.5">
                        <span className="bg-tween-accent/[0.07] text-tween-accent ring-tween-accent/20 rounded-full px-2 py-1 font-mono text-[10px] leading-none tracking-[0.12em] ring-1 ring-inset">
                          {item.engine}
                        </span>
                        <span
                          aria-hidden="true"
                          className="bg-highlighted/[0.05] text-dimmed group-hover:text-tween-accent ease-tween grid size-8 place-items-center rounded-full transition-[transform,color] duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 motion-reduce:transition-none"
                        >
                          <ArrowUpRight strokeWidth={1.5} className="size-3.5" />
                        </span>
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
