import { cn } from '@/lib/utils';
import { RevealGroup } from './reveal-group';

const STEPS = [
  {
    at: '0.0s',
    dateTime: 'PT0S',
    offset: 'lg:mr-24',
    title: 'One file per component',
    body: 'The CLI writes a single .tsx into your project. Rename it, restyle it, delete half of it — nothing upstream breaks.',
  },
  {
    at: '0.4s',
    dateTime: 'PT0.4S',
    offset: 'lg:mx-12',
    title: 'GSAP where it matters',
    body: 'Timelines, ScrollTrigger and SplitText drive the sequenced work. Anything simpler stays a plain CSS transition.',
  },
  {
    at: '0.8s',
    dateTime: 'PT0.8S',
    offset: 'lg:ml-24',
    title: 'Reduced motion, always',
    body: 'Every component checks prefers-reduced-motion and renders its finished state instead of animating.',
  },
] as const;

export function Why() {
  return (
    <section aria-labelledby="why-title" className="pb-24 md:pb-32">
      <div className="main-container">
        <RevealGroup className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-5 lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <p data-reveal className="eyebrow">
              Why Tween UI
            </p>
            <h2
              data-reveal-text
              id="why-title"
              className="text-highlighted text-4xl font-medium tracking-[-0.035em] text-balance md:text-5xl lg:text-[56px] lg:leading-[1.02]"
            >
              What you get
            </h2>
            <p
              data-reveal-text
              className="text-muted-foreground max-w-md text-[15px] leading-relaxed text-pretty sm:text-base md:text-[17px]"
            >
              Tween UI is not a dependency. It is source code with a good install story.
            </p>
          </div>

          <ol className="flex flex-col gap-5 lg:col-span-7">
            {STEPS.map((step) => (
              <li key={step.at} data-reveal className={cn('bezel-shell', step.offset)}>
                <div className="bezel-core grid gap-5 p-7 sm:grid-cols-[5rem_1fr] sm:gap-8 sm:p-9">
                  <time
                    dateTime={step.dateTime}
                    className="bg-tween-accent/[0.07] text-tween-accent ring-tween-accent/20 h-fit w-fit rounded-full px-3 py-1.5 font-mono text-xs leading-none ring-1 ring-inset"
                  >
                    {step.at}
                  </time>
                  <div>
                    <h3 className="text-highlighted text-xl font-medium tracking-[-0.02em] md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed text-pretty">
                      {step.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </RevealGroup>
      </div>
    </section>
  );
}
