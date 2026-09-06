'use client';

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface AvatarRevealItem {
  src: string;
  alt: string;
}

const DEFAULT_AVATARS: AvatarRevealItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=88&h=88&fit=crop&crop=faces',
    alt: 'Team member 1',
  },
  {
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=88&h=88&fit=crop&crop=faces',
    alt: 'Team member 2',
  },
  {
    src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=88&h=88&fit=crop&crop=faces',
    alt: 'Team member 3',
  },
];

interface AvatarRevealProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  avatars?: AvatarRevealItem[];
  children?: ReactNode;
}

export default function AvatarReveal({
  avatars = DEFAULT_AVATARS,
  children = '2,000+ teams shipping faster this week.',
  className,
  ...props
}: AvatarRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const items = gsap.utils.toArray<HTMLElement>('[data-ns-avatar]', root);
      const caption = root.querySelector<HTMLElement>('[data-ns-animate]');

      if (prefersReducedMotion()) {
        gsap.set([items, caption], { opacity: 1, x: 0, scale: 1, filter: 'none' });
        return;
      }

      gsap.fromTo(
        items,
        { opacity: 0, scale: 0, x: -40, filter: 'blur(5px)' },
        {
          opacity: 1,
          scale: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 1.5,
          stagger: 0.1,
          delay: 0.1,
          ease: 'elastic.out(1, 0.7)',
        }
      );

      if (caption) {
        gsap.fromTo(
          caption,
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: 'power2.out' }
        );
      }
    },
    { scope: rootRef }
  );

  return (
    <div
      {...props}
      ref={rootRef}
      data-avatar-reveal
      className={cn('mx-auto flex max-w-[254px] items-center justify-center gap-x-3', className)}
    >
      <div className="flex items-center justify-center -space-x-3.5">
        {avatars.map((avatar) => (
          <figure
            key={avatar.src}
            data-ns-avatar
            className="size-11 overflow-hidden rounded-full opacity-0 outline outline-2 outline-white motion-reduce:opacity-100"
          >
            <img
              src={avatar.src}
              alt={avatar.alt}
              className="size-full rounded-full object-cover"
            />
          </figure>
        ))}
      </div>
      {children ? (
        <p
          data-ns-animate
          className="mx-auto max-w-[142px] text-left text-sm text-[#045f64]/80 opacity-0 motion-reduce:opacity-100"
        >
          {children}
        </p>
      ) : null}
    </div>
  );
}
