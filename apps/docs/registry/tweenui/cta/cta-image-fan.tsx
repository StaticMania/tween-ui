'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import ShinyButton from '../button/shiny-button';
import ImageFanSlider, { type ImageFanSliderImage } from '../slider/image-fan-slider';

export type CtaImageFanImage = ImageFanSliderImage;

export interface CtaImageFanProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Photos in the fan. Five looks best. */
  images?: CtaImageFanImage[];
  /** Heading shown under the fan. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Label for the shiny CTA button. */
  ctaLabel?: string;
  /** Click handler for the CTA button. */
  onCtaClick?: () => void;
}

const DEFAULT_IMAGES: CtaImageFanImage[] = [
  {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
    alt: 'Team member one',
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    alt: 'Team member two',
  },
  {
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
    alt: 'Team member three',
  },
  {
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
    alt: 'Team member four',
  },
  {
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
    alt: 'Team member five',
  },
];

const DEFAULT_TITLE = (
  <>
    Ready to accelerate Your
    <span className="mt-1 block font-normal text-[#045f64]/60 italic dark:text-[#9fd4d6]/80">
      workflow with AI?
    </span>
  </>
);

export default function CtaImageFan({
  images = DEFAULT_IMAGES,
  title = DEFAULT_TITLE,
  description = 'Take the first step towards a more efficient and productive workflow.',
  ctaLabel = 'Try for free',
  onCtaClick,
  className,
  ...props
}: CtaImageFanProps) {
  return (
    <section data-cta-image-fan className={cn('w-full py-16 md:py-20', className)} {...props}>
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-8 px-4">
        <ImageFanSlider images={images} className="motion-reduce:scale-100" />

        <div className="space-y-3 text-center">
          <h2 className="m-0 text-2xl leading-[1.2] font-medium tracking-tight text-[#12161F] md:text-3xl lg:text-4xl dark:text-white">
            {title}
          </h2>
          <p className="m-0 mx-auto max-w-[320px] text-sm leading-relaxed text-[#045f64]/70 dark:text-[#9fd4d6]/80">
            {description}
          </p>
        </div>

        <ShinyButton onClick={onCtaClick}>{ctaLabel}</ShinyButton>
      </div>
    </section>
  );
}
