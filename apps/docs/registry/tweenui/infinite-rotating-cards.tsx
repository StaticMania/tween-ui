'use client';

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DEG2RAD = Math.PI / 180;

function CardMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-7 shrink-0 text-[#045f64] dark:text-[#c6f56f]"
      aria-hidden="true"
    >
      <path
        d="M8 5h2v2H8V5Zm3 3h2v2h-2V8Zm3 3h2v2h-2v-2Zm-3 3h2v2h-2v-2Zm-3 3h2v2H8v-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface InfiniteRotatingCard {
  title: string;
  image: string;
  imageAlt: string;
  icon?: ReactNode;
}

export interface InfiniteRotatingCardsProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title'
> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Cards placed around the wheel. */
  cards?: InfiniteRotatingCard[];
}

const DEFAULT_CARDS: InfiniteRotatingCard[] = [
  {
    title: 'Brand motion',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=480&h=600&fit=crop',
    imageAlt: 'Abstract 3D brand shapes',
  },
  {
    title: 'Product UI',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=480&h=600&fit=crop',
    imageAlt: 'Product interface on a laptop',
  },
  {
    title: 'Launch pages',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=480&h=600&fit=crop',
    imageAlt: 'Team reviewing a launch page',
  },
  {
    title: 'Scroll stories',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=480&h=600&fit=crop',
    imageAlt: 'Analytics dashboard',
  },
  {
    title: 'Hover systems',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=480&h=600&fit=crop',
    imageAlt: 'Design team at a whiteboard',
  },
  {
    title: 'Type in motion',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=480&h=600&fit=crop',
    imageAlt: 'Abstract motion form',
  },
  {
    title: 'Photo reveals',
    image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=480&h=600&fit=crop',
    imageAlt: 'Code editor on a screen',
  },
  {
    title: 'Hub diagrams',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=480&h=600&fit=crop',
    imageAlt: 'Laptop with code on the screen',
  },
];

export default function InfiniteRotatingCards({
  title = 'Motion that actually ships',
  description = 'Cards ride a slow wheel so the next idea is always coming into view.',
  cards = DEFAULT_CARDS,
  className,
  ...props
}: InfiniteRotatingCardsProps) {
  const clipRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const clip = clipRef.current;
      const wheel = wheelRef.current;
      if (!clip || !wheel) return;

      const nodes = gsap.utils.toArray<HTMLElement>('[data-hero-card]', wheel);
      if (!nodes.length) return;

      const slice = 360 / nodes.length;

      const layout = () => {
        const size = clip.offsetWidth;
        if (!size) return;

        wheel.style.width = `${size}px`;
        wheel.style.height = `${size}px`;

        const radius = size / 2;
        const card = nodes[0];
        const inset = Math.max(card?.offsetWidth ?? 0, card?.offsetHeight ?? 0) / 2;
        const orbit = Math.max(radius - inset, 0);

        gsap.set(nodes, {
          x: (i) => radius + orbit * Math.sin(i * slice * DEG2RAD),
          y: (i) => radius - orbit * Math.cos(i * slice * DEG2RAD),
          rotation: (i) => i * slice,
          xPercent: -50,
          yPercent: -50,
        });
      };

      layout();
      const frame = requestAnimationFrame(layout);
      const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(layout) : null;
      observer?.observe(clip);

      if (prefersReducedMotion()) {
        return () => {
          cancelAnimationFrame(frame);
          observer?.disconnect();
        };
      }

      const spin = gsap.to(wheel, {
        rotation: -360,
        ease: 'none',
        duration: Math.max(nodes.length * 4, 16),
        repeat: -1,
      });

      return () => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
        spin.kill();
      };
    },
    { scope: clipRef, dependencies: [cards.length] }
  );

  return (
    <section
      {...props}
      data-infinite-rotating-cards
      className={cn('w-full py-16 motion-reduce:transition-none md:py-20', className)}
    >
      <div className="mx-auto w-full max-w-[960px] space-y-10 px-4">
        <div className="space-y-6 text-center">
          <h2 className="text-2xl leading-[1.15] font-medium tracking-tight text-[#12161F] md:text-3xl lg:text-4xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto max-w-[400px] text-sm leading-relaxed text-[#045f64]/70 dark:text-[#9fd4d6]/80">
            {description}
          </p>
        </div>

        <div ref={clipRef} data-hero-clip className="relative aspect-square w-full overflow-hidden">
          <div ref={wheelRef} data-hero-wheel className="absolute top-0 left-0">
            {cards.map((card, index) => (
              <article
                key={`${card.title}-${index}`}
                data-hero-card
                className="absolute top-0 left-0 w-32 space-y-2 bg-white p-2 sm:w-36 md:w-40 md:space-y-3 md:p-3 dark:bg-[#12161F]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm leading-snug font-medium text-[#12161F] dark:text-white">
                    {card.title}
                  </h3>
                  {card.icon ?? <CardMark />}
                </div>
                <figure className="aspect-[4/5] overflow-hidden rounded-md">
                  <img src={card.image} alt={card.imageAlt} className="size-full object-cover" />
                </figure>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
