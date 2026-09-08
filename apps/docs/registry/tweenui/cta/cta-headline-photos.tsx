'use client';

import { useRef, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import SlideArrowButton from '../button/slide-arrow-button';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface CtaHeadlinePhotosAvatar {
  src: string;
  alt: string;
}

export interface CtaHeadlinePhotosImage {
  src: string;
  alt?: string;
}

export interface CtaHeadlinePhotosProps extends ComponentPropsWithoutRef<'section'> {
  /** Faces in the row above the heading. */
  avatars?: CtaHeadlinePhotosAvatar[];
  /** Landscape photo tucked into the first headline line. */
  inlineImage?: CtaHeadlinePhotosImage;
  /** Tilted photo on the second headline line. */
  accentImage?: CtaHeadlinePhotosImage;
  /** First headline fragment, before the pill photo. */
  lead?: string;
  /** Headline fragment after the pill photo. */
  mid?: string;
  /** Second-line headline, after the tilted photo. */
  end?: string;
  /** Supporting line under the heading. */
  description?: string;
  /** Label for the slide-arrow CTA. */
  ctaLabel?: string;
  /** Click handler for the CTA button. */
  onCtaClick?: () => void;
}

const DEFAULT_AVATARS: CtaHeadlinePhotosAvatar[] = [
  {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=112&h=112&fit=crop&crop=faces',
    alt: 'Motion designer',
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=112&h=112&fit=crop&crop=faces',
    alt: 'Frontend engineer',
  },
  {
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=112&h=112&fit=crop&crop=faces',
    alt: 'Product designer',
  },
  {
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=112&h=112&fit=crop&crop=faces',
    alt: 'AI engineer',
  },
];

const DEFAULT_INLINE_IMAGE: CtaHeadlinePhotosImage = {
  src: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=264&h=156&fit=crop',
  alt: 'AI interface collage',
};

const DEFAULT_ACCENT_IMAGE: CtaHeadlinePhotosImage = {
  src: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=144&h=144&fit=crop',
  alt: 'Abstract 3D motion form',
};

export default function CtaHeadlinePhotos({
  avatars = DEFAULT_AVATARS,
  inlineImage = DEFAULT_INLINE_IMAGE,
  accentImage = DEFAULT_ACCENT_IMAGE,
  lead = 'Turn static',
  mid = 'into motion',
  end = 'with Tween UI',
  description = 'Copy-paste GSAP blocks for React. Themed, reduced-motion ready, and built to drop into any stack.',
  ctaLabel = 'Browse the blocks',
  onCtaClick,
  className,
  ...props
}: CtaHeadlinePhotosProps) {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const faces = gsap.utils.toArray<HTMLElement>('[data-cta-avatar]', root);
      const inlineEl = root.querySelector<HTMLElement>('[data-cta-inline-image]');
      const accentEl = root.querySelector<HTMLElement>('[data-cta-accent-image]');
      const targets = [...faces, inlineEl, accentEl].filter(Boolean);

      if (prefersReducedMotion()) {
        gsap.set(targets, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          scaleX: 1,
          rotation: 0,
          filter: 'none',
        });
        if (accentEl) gsap.set(accentEl, { rotation: -20 });
        return;
      }

      gsap.fromTo(
        faces,
        { opacity: 0, scale: 0, x: -40, filter: 'blur(5px)' },
        {
          opacity: 1,
          scale: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 1.5,
          stagger: 0.1,
          ease: 'elastic.out(1, 0.7)',
        }
      );

      if (inlineEl) {
        gsap.fromTo(
          inlineEl,
          { scaleX: 0, autoAlpha: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            autoAlpha: 1,
            duration: 1.7,
            delay: 0.3,
            ease: 'power3.out',
          }
        );
      }

      if (accentEl) {
        gsap.fromTo(
          accentEl,
          { y: 80, scale: 0, autoAlpha: 0, rotation: 40, transformOrigin: 'center center' },
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            rotation: -20,
            duration: 1.3,
            delay: 0.2,
            ease: 'power2.out',
          }
        );
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      {...props}
      ref={rootRef}
      data-cta-headline-photos
      className={cn('w-full overflow-hidden py-16 md:py-20', className)}
    >
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-10 px-4">
        <div className="flex items-center justify-center gap-2">
          {avatars.map((avatar) => (
            <figure
              key={avatar.src}
              data-cta-avatar
              className="size-14 shrink-0 overflow-hidden rounded-full opacity-0 motion-reduce:opacity-100"
            >
              <img src={avatar.src} alt={avatar.alt} className="size-full object-cover" />
            </figure>
          ))}
        </div>

        <div className="space-y-6 text-center">
          <h2 className="m-0 text-2xl leading-[1.15] font-medium tracking-tight text-[#12161F] md:text-3xl lg:text-4xl dark:text-white">
            <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
              <span>{lead}</span>
              <span
                data-cta-inline-image
                className="inline-block h-[52px] w-[88px] origin-left overflow-hidden rounded-full align-middle opacity-0 motion-reduce:opacity-100"
              >
                <img
                  src={inlineImage.src}
                  alt={inlineImage.alt ?? ''}
                  aria-hidden={!inlineImage.alt}
                  className="size-full object-cover"
                />
              </span>
              <span>{mid}</span>
            </span>
            <span className="mt-2 flex items-center justify-center gap-x-4">
              <span
                data-cta-accent-image
                className="inline-block size-12 overflow-hidden rounded-lg align-middle opacity-0 motion-reduce:-rotate-[20deg] motion-reduce:opacity-100"
              >
                <img
                  src={accentImage.src}
                  alt={accentImage.alt ?? ''}
                  aria-hidden={!accentImage.alt}
                  className="size-full object-cover"
                />
              </span>
              <span>{end}</span>
            </span>
          </h2>
          <p className="m-0 mx-auto max-w-[320px] text-sm leading-relaxed text-[#045f64]/70 dark:text-[#9fd4d6]/80">
            {description}
          </p>
        </div>

        <SlideArrowButton onClick={onCtaClick}>{ctaLabel}</SlideArrowButton>
      </div>
    </section>
  );
}
