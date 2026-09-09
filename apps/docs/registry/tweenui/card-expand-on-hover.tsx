'use client';

import { useState, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardExpandOnHoverItem {
  /** Large index shown in the corner, e.g. ".01". */
  step: string;
  /** Small eyebrow above the title. */
  label: string;
  /** Card heading. */
  title: string;
  /** Photo revealed on the expanded card. */
  image: string;
  /** Alt text for the photo. */
  imageAlt: string;
}

export interface CardExpandOnHoverProps extends ComponentPropsWithoutRef<'div'> {
  /** Cards in the row. Defaults to a 3-card sample. */
  cards?: CardExpandOnHoverItem[];
}

const DEFAULT_CARDS: CardExpandOnHoverItem[] = [
  {
    step: '.01',
    label: 'Motion first',
    title: 'Hover systems that feel native',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1000&fit=crop',
    imageAlt: 'Team reviewing hover interactions on a whiteboard',
  },
  {
    step: '.02',
    label: 'Copy and own',
    title: 'Drop in the source, keep the motion',
    image: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=1000&fit=crop',
    imageAlt: 'Developer working with component source in an editor',
  },
  {
    step: '.03',
    label: 'Ship ready',
    title: 'Reduced-motion built in from the start',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=1000&fit=crop',
    imageAlt: 'Team shipping a product together',
  },
];

export default function CardExpandOnHover({
  cards = DEFAULT_CARDS,
  className,
  ...props
}: CardExpandOnHoverProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div
      data-card-expand-on-hover
      data-active-card={activeIndex}
      className={cn(
        'grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:flex lg:items-stretch lg:justify-center',
        className
      )}
      {...props}
    >
      {cards.map((card, index) => {
        const active = activeIndex === index;

        return (
          <article
            key={card.step + card.title}
            data-expand-card
            data-active={active ? 'true' : undefined}
            tabIndex={0}
            onMouseEnter={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            className={cn(
              'relative h-[500px] w-full overflow-hidden rounded-2xl border border-[#045f64]/20 bg-white p-6 transition-all duration-700 ease-out outline-none motion-reduce:transition-none',
              'focus-visible:ring-2 focus-visible:ring-[#045f64] dark:border-[#045f64]/40 dark:bg-[#12161F] dark:ring-offset-[#12161F]',
              'lg:w-[28%]',
              active && 'lg:w-[40%]'
            )}
          >
            <figure
              className={cn(
                'absolute inset-0 size-full opacity-100 transition-opacity duration-700 ease-out motion-reduce:transition-none lg:opacity-0',
                active && 'lg:opacity-100'
              )}
            >
              <img src={card.image} alt={card.imageAlt} className="size-full object-cover" />
            </figure>
            <div
              className={cn(
                'absolute inset-0 bg-linear-to-t from-black to-transparent to-55% opacity-100 transition-opacity duration-700 ease-out motion-reduce:transition-none lg:opacity-0',
                active && 'lg:opacity-100'
              )}
            />
            <div
              className={cn(
                'absolute top-6 left-6 z-30 max-w-[15rem] translate-y-[calc(500px-100%-5rem)] space-y-3 transition-transform duration-700 ease-out motion-reduce:transition-none lg:translate-y-0',
                active && 'lg:translate-y-[calc(500px-100%-5rem)]'
              )}
            >
              <p
                className={cn(
                  'text-sm text-[#c6f56f] transition-colors duration-500 motion-reduce:transition-none lg:text-[#045f64] dark:lg:text-[#9fd4d6]',
                  active && 'lg:text-[#c6f56f] dark:lg:text-[#c6f56f]'
                )}
              >
                {card.label}
              </p>
              <h3
                className={cn(
                  'text-lg font-medium text-white transition-colors duration-500 motion-reduce:transition-none md:text-xl lg:text-[#12161F] dark:lg:text-white',
                  active && 'lg:text-white dark:lg:text-white'
                )}
              >
                {card.title}
              </h3>
            </div>
            <p
              className={cn(
                'absolute right-6 bottom-6 z-30 text-4xl font-medium text-white transition-colors duration-500 motion-reduce:transition-none md:text-5xl lg:text-[#12161F] dark:lg:text-white',
                active && 'lg:text-white dark:lg:text-white'
              )}
            >
              {card.step}
            </p>
          </article>
        );
      })}
    </div>
  );
}
