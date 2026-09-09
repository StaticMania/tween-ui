'use client';

import { useRef, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Tilt and dimming are pointer affordances — skip them on touch. */
const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !prefersReducedMotion();

/** Degrees of tilt at the far edge of a card. */
const TILT_MAX = 9;
const DIM_SCALE = 0.96;
const DIM_OPACITY = 0.5;

/**
 * Card heights cycle every six tiles, so each row of three reads as a staggered
 * skyline instead of a flat band.
 */
const HEIGHTS = [
  'h-[370px] xl:h-[400px]',
  'h-[450px] xl:h-[550px]',
  'h-[280px] xl:h-[300px]',
  'h-[450px] xl:h-[550px]',
  'h-[280px] xl:h-[300px]',
  'h-[370px] xl:h-[400px]',
];

export interface ProjectSpotlightItem {
  /** Project name, shown over the image. */
  title: string;
  /** Short line beside the title. */
  excerpt: string;
  /** Cover image URL. */
  image: string;
  /** Alt text for the cover. */
  imageAlt: string;
  /** Link target for the tile. */
  href?: string;
}

export interface ProjectSpotlightGridProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title'
> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Tiles in the grid. Defaults to a six-project sample. */
  projects?: ProjectSpotlightItem[];
}

const DEFAULT_TITLE = 'Where ideas become experiences';

const DEFAULT_DESCRIPTION =
  'Every project here is built with one goal — performance. From concept to launch, we focus on solutions that drive engagement, conversions, and growth.';

const DEFAULT_PROJECTS: ProjectSpotlightItem[] = [
  {
    title: 'Northwind',
    excerpt: 'Brand & site',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1000&fit=crop',
    imageAlt: 'Abstract 3D brand shapes',
  },
  {
    title: 'Lumen',
    excerpt: 'Product UI',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=1000&fit=crop',
    imageAlt: 'Product interface on a laptop',
  },
  {
    title: 'Fieldnote',
    excerpt: 'Launch page',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1000&fit=crop',
    imageAlt: 'Team reviewing a launch page',
  },
  {
    title: 'Cadence',
    excerpt: 'Design system',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1000&fit=crop',
    imageAlt: 'Design team at a whiteboard',
  },
  {
    title: 'Halo',
    excerpt: 'Campaign film',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=1000&fit=crop',
    imageAlt: 'Analytics dashboard',
  },
  {
    title: 'Atlas',
    excerpt: 'Data platform',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=1000&fit=crop',
    imageAlt: 'Workshop session in progress',
  },
];

export default function ProjectSpotlightGrid({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  projects = DEFAULT_PROJECTS,
  className,
  ...props
}: ProjectSpotlightGridProps) {
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      gsap.set(cards, { transformPerspective: 900, transformStyle: 'preserve-3d' });

      if (prefersReducedMotion()) return;

      // `opacity` rather than `autoAlpha`: autoAlpha parks the element at
      // `visibility: hidden`, which drops it out of the accessibility tree for
      // as long as the intro is pending.
      gsap
        .timeline()
        .fromTo(
          '[data-spotlight-intro]',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.12 }
        )
        .fromTo(
          cards,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 },
          '-=0.3'
        );
    },
    { scope: rootRef, dependencies: [projects] }
  );

  /** Tilt the hovered card toward the cursor. */
  const handleMove = (index: number, event: MouseEvent<HTMLDivElement>) => {
    const card = cardRefs.current[index];
    if (!card || !canHover()) return;

    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    gsap.to(card, {
      rotateY: (x - 0.5) * TILT_MAX * 2,
      rotateX: (0.5 - y) * TILT_MAX * 2,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  /** Push every other card back so the hovered one reads as lit. */
  const handleEnter = (index: number) => {
    if (!canHover()) return;

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      gsap.to(card, {
        scale: idx === index ? 1 : DIM_SCALE,
        opacity: idx === index ? 1 : DIM_OPACITY,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };

  const handleLeave = (index: number) => {
    if (!canHover()) return;

    const card = cardRefs.current[index];
    if (card) {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    cardRefs.current.forEach((sibling) => {
      if (!sibling) return;
      gsap.to(sibling, {
        scale: 1,
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };

  return (
    <section
      ref={rootRef}
      data-project-spotlight-grid
      className={cn('w-full px-5 py-16 md:py-24', className)}
      {...props}
    >
      <div className="mx-auto max-w-[1290px] space-y-10 md:space-y-16">
        <div className="space-y-3 text-center">
          <h2
            data-spotlight-intro
            className="text-3xl font-medium tracking-tight text-[#12161f] md:text-5xl dark:text-white"
          >
            {title}
          </h2>
          <p
            data-spotlight-intro
            className="mx-auto max-w-[755px] text-base text-[#18181b]/60 md:text-lg dark:text-white/60"
          >
            {description}
          </p>
        </div>

        <div className="grid grid-cols-12 items-start gap-y-6 md:gap-6">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="col-span-12 md:col-span-6 lg:col-span-4"
              onMouseMove={(event) => handleMove(index, event)}
              onMouseEnter={() => handleEnter(index)}
              onMouseLeave={() => handleLeave(index)}
            >
              <div
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className={cn(
                  'relative w-full overflow-hidden rounded-xl will-change-transform',
                  'motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none',
                  HEIGHTS[index % HEIGHTS.length]
                )}
              >
                <a
                  href={project.href ?? '#'}
                  className="relative block size-full focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-[#c6f56f]"
                >
                  <img
                    src={project.image}
                    alt={project.imageAlt}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_50%,rgba(0,0,0,0.5)_75%,#000_100%)]" />
                  <span className="absolute bottom-6 left-6 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 pr-6">
                    <span className="text-lg font-medium text-white">{project.title}</span>
                    <span className="text-sm text-white/70">{project.excerpt}</span>
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
