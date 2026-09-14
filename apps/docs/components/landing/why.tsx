import { RevealGroup } from './reveal-group';

const STEPS = [
  {
    at: '0.0s',
    title: 'One file per component',
    body: 'The CLI writes a single .tsx into your project. Rename it, restyle it, delete half of it — nothing upstream breaks.',
  },
  {
    at: '0.4s',
    title: 'GSAP where it matters',
    body: 'Timelines, ScrollTrigger and SplitText drive the sequenced work. Anything simpler stays a plain CSS transition.',
  },
  {
    at: '0.8s',
    title: 'Reduced motion, always',
    body: 'Every component checks prefers-reduced-motion and renders its finished state instead of animating.',
  },
] as const;

export function Why() {
  return (
    <section aria-labelledby="why-title" className="pb-16 md:pb-24">
      <div className="main-container">
        <RevealGroup className="border-border grid gap-10 border-t pt-16 md:pt-24 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-3.5 lg:col-span-4">
            <h2
              data-reveal-text
              id="why-title"
              className="text-highlighted text-3xl font-medium tracking-[-0.025em] text-balance md:text-[40px] md:leading-[1.1]"
            >
              What you get
            </h2>
            <p
              data-reveal-text
              className="text-muted-foreground text-[15px] leading-relaxed text-pretty sm:text-base md:text-[17px]"
            >
              Tween UI is not a dependency. It is source code with a good install story.
            </p>
          </div>

          <ol className="grid gap-4 md:grid-cols-3 lg:col-span-8">
            {STEPS.map((step) => (
              <li
                key={step.at}
                data-reveal
                className="border-border bg-muted/30 hover:border-tween-accent/30 rounded-2xl border p-5 transition-colors duration-300 motion-reduce:transition-none"
              >
                <span className="text-tween-accent font-mono text-xs">{step.at}</span>
                <h3 className="text-highlighted mt-3 text-xl font-medium tracking-[-0.015em]">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mt-2.5 text-[15px] leading-relaxed text-pretty">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </RevealGroup>
      </div>
    </section>
  );
}
