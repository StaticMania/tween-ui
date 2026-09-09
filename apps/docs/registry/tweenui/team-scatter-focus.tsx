'use client';

import { useRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Blurring the rest is a pointer affordance — skip it on touch. */
const canHover = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !prefersReducedMotion();

const REVEAL_OFFSET = 80;

const DIRECTION_FROM: Record<string, { x?: number; y?: number }> = {
  left: { x: -REVEAL_OFFSET },
  right: { x: REVEAL_OFFSET },
  up: { y: -REVEAL_OFFSET },
  down: { y: REVEAL_OFFSET },
};

/**
 * Scatter slots, used in order for members that don't carry a `position` of
 * their own — so an arbitrary list still lands as a collage rather than a stack.
 */
const DEFAULT_POSITIONS = [
  'z-2 left-[3%] top-[84px] xl:left-0',
  'z-1 left-[20%] top-[50%] xl:left-[22%] xl:top-[31%]',
  'z-1 left-[35%] top-[0%] xl:left-[43%]',
  'z-1 left-[47%] bottom-[0%] xl:left-[56%]',
  'z-1 right-[3%] top-[40%] -translate-y-1/2 xl:right-0 xl:top-[50%]',
];

const DEFAULT_DIRECTIONS = ['left', 'down', 'up', 'down', 'right'];

function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M18.9 2.3h3.4l-7.4 8.5 8.7 11.5h-6.8l-5.4-7-6.1 7H1.9l7.9-9.1L1.5 2.3h7l4.9 6.4 5.5-6.4Zm-1.2 17.9h1.9L6.4 4.2H4.4l13.3 16Z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface TeamScatterFocusMember {
  /** Member name. */
  name: string;
  /** Role shown under the name. */
  role: string;
  /** Portrait URL. */
  image: string;
  /** Alt text for the portrait. */
  imageAlt?: string;
  /** Link to the member's page. */
  href?: string;
  /** Social profile opened from the corner button. */
  social?: string;
  /** Absolute placement classes for the desktop collage. Falls back by index. */
  position?: string;
  /** Where the card travels in from. Falls back by index. */
  direction?: 'left' | 'right' | 'up' | 'down';
}

export interface TeamScatterFocusProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Section heading. */
  title?: ReactNode;
  /** Supporting line under the heading. */
  description?: string;
  /** Members in the collage. Defaults to a five-person sample. */
  members?: TeamScatterFocusMember[];
}

const DEFAULT_TITLE = 'The people who make it happen';

const DEFAULT_DESCRIPTION =
  'Each member brings deep expertise and a shared focus — building solutions that are not only beautiful but built to perform.';

const PORTRAIT = (id: string) => `https://images.unsplash.com/${id}?w=660&h=612&fit=crop`;

const DEFAULT_MEMBERS: TeamScatterFocusMember[] = [
  {
    name: 'John Smith',
    role: 'CEO & Founder',
    image: PORTRAIT('photo-1507003211169-0a1dd7228f2d'),
    imageAlt: 'John Smith in the studio',
    social: 'https://x.com',
  },
  {
    name: 'John Lacker',
    role: 'Creative Director',
    image: PORTRAIT('photo-1519085360753-af0119f7cbe7'),
    imageAlt: 'John Lacker reviewing artwork',
    social: 'https://x.com',
  },
  {
    name: 'William Finley',
    role: 'Lead Designer',
    image: PORTRAIT('photo-1500648767791-00dcc994a43e'),
    imageAlt: 'William Finley at his desk',
    social: 'https://x.com',
  },
  {
    name: 'Micheal Jordan',
    role: 'Account Director',
    image: PORTRAIT('photo-1472099645785-5658abf4ff4e'),
    imageAlt: 'Micheal Jordan on a client call',
    social: 'https://x.com',
  },
  {
    name: 'Jack Lavis',
    role: 'Senior Developer',
    image: PORTRAIT('photo-1521119989659-a83eee488004'),
    imageAlt: 'Jack Lavis pairing on code',
    social: 'https://x.com',
  },
];

function MemberCard({
  member,
  variant,
  cardRef,
}: {
  member: TeamScatterFocusMember;
  variant: 'collage' | 'stacked';
  cardRef?: (node: HTMLDivElement | null) => void;
}) {
  const href = member.href ?? '#';
  const isCollage = variant === 'collage';

  return (
    <div
      ref={cardRef}
      data-team-card
      className={cn(
        'rounded-xl bg-white px-2 pt-2 pb-4 will-change-transform dark:bg-[#161b22]',
        'motion-reduce:transform-none motion-reduce:blur-none motion-reduce:transition-none',
        isCollage ? 'h-[332px] w-[264px] space-y-4' : 'w-full max-w-[330px] space-y-5'
      )}
    >
      <figure
        className={cn(
          'relative overflow-hidden rounded-md',
          isCollage ? 'h-[246px] w-[248px]' : 'aspect-[315/306] w-full'
        )}
      >
        <a href={href}>
          <img
            src={member.image}
            alt={member.imageAlt ?? member.name}
            loading="lazy"
            className="size-full object-cover"
          />
        </a>
      </figure>

      <div className={cn('space-y-1', isCollage ? 'px-2' : 'px-3')}>
        <div className="flex items-center justify-between gap-2">
          <a href={href} className="min-w-0">
            <h3
              className={cn(
                'truncate font-medium text-[#12161f] dark:text-white',
                isCollage ? 'text-base' : 'text-lg'
              )}
            >
              {member.name}
            </h3>
          </a>
          {member.social && (
            <a
              href={member.social}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on X`}
              className={cn(
                'grid shrink-0 place-items-center rounded-full bg-[#f1f3f4] text-[#13193a] transition-colors hover:bg-[#e6e9ea] dark:bg-white/5 dark:text-white dark:hover:bg-white/10',
                isCollage ? 'size-8' : 'size-9'
              )}
            >
              <XMark className={isCollage ? 'size-3.5' : 'size-4'} />
            </a>
          )}
        </div>
        <a href={href}>
          <p
            className={cn(
              'text-[#18181b]/60 dark:text-white/60',
              isCollage ? 'text-xs' : 'text-sm'
            )}
          >
            {member.role}
          </p>
        </a>
      </div>
    </div>
  );
}

export default function TeamScatterFocus({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  members = DEFAULT_MEMBERS,
  className,
  ...props
}: TeamScatterFocusProps) {
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const slots = slotRefs.current.filter(Boolean) as HTMLDivElement[];
      slots.forEach((slot, index) => {
        const direction =
          members[index]?.direction ?? DEFAULT_DIRECTIONS[index % DEFAULT_DIRECTIONS.length];
        // `fromTo` with an explicit end state, and `opacity` rather than
        // `autoAlpha`: nothing is ever left at `visibility: hidden`, so the
        // cards stay in the accessibility tree while the reveal is pending.
        gsap.fromTo(
          slot,
          { ...DIRECTION_FROM[direction], opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            delay: 0.1 * (index + 1),
          }
        );
      });
    },
    { scope: rootRef, dependencies: [members] }
  );

  /** Hold the hovered card sharp and push the rest back. */
  const handleEnter = (index: number) => {
    if (!canHover()) return;

    const slot = slotRefs.current[index];
    if (slot) gsap.set(slot, { zIndex: 20 });

    cardRefs.current.forEach((card, idx) => {
      if (!card) return;
      gsap.to(card, {
        scale: idx === index ? 1 : 0.96,
        filter: idx === index ? 'blur(0px)' : 'blur(3px)',
        duration: 0.9,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  };

  const handleLeave = () => {
    if (!canHover()) return;

    slotRefs.current.forEach((slot) => {
      if (slot) gsap.set(slot, { clearProps: 'zIndex' });
    });

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    gsap.to(cards, {
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.55,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  return (
    <section
      ref={rootRef}
      data-team-scatter-focus
      className={cn('w-full px-5 py-16 md:py-24', className)}
      {...props}
    >
      <div className="mx-auto max-w-[1290px] space-y-10 md:space-y-16">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-[#12161f] md:text-5xl dark:text-white">
            {title}
          </h2>
          <p className="mx-auto max-w-[600px] text-base text-[#18181b]/60 md:text-lg dark:text-white/60">
            {description}
          </p>
        </div>

        {/* Collage — desktop only, cards placed by absolute slots. */}
        {/* Heights track the card: the lowest slot is `top-[50%]` (`top-[31%]`
            at xl), so the box needs roughly twice the card height below lg. */}
        <div className="relative hidden h-[680px] overflow-hidden lg:block xl:h-[540px]">
          {members.map((member, index) => (
            <div
              key={member.name}
              ref={(node) => {
                slotRefs.current[index] = node;
              }}
              className={cn(
                'absolute',
                member.position ?? DEFAULT_POSITIONS[index % DEFAULT_POSITIONS.length]
              )}
              onMouseEnter={() => handleEnter(index)}
              onMouseLeave={handleLeave}
            >
              <MemberCard
                member={member}
                variant="collage"
                cardRef={(node) => {
                  cardRefs.current[index] = node;
                }}
              />
            </div>
          ))}
        </div>

        {/* Below lg the collage would overlap, so the same cards stack. */}
        <div className="grid grid-cols-12 justify-items-center gap-y-6 md:gap-6 lg:hidden">
          {members.map((member, index) => (
            <div
              key={member.name}
              className={cn(
                'col-span-12 md:col-span-6',
                index === members.length - 1 && index % 2 === 0 && 'md:col-start-4'
              )}
            >
              <MemberCard member={member} variant="stacked" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
