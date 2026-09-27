'use client';

import { useRef, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Head start for the cue, so it is gone before the first letter lands. */
const CUE_LEAD = 0.25;
/** Gap between the wordmark starting and the script line following it. */
const SCRIPT_OFFSET = 0.35;

type WordmarkRevealTag = 'h1' | 'h2' | 'h3' | 'p' | 'div';

export interface WordmarkRevealProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  /** The wordmark. `\n` starts a new line. */
  title: string;
  /** Script line that leans in under the wordmark, letter by letter. */
  script?: string;
  /** Held on screen until the reveal starts. Ignored when `instant`. */
  cue?: string;
  /** Play as soon as it mounts instead of waiting for a scroll. */
  instant?: boolean;
  /** Pixels the scroller must have travelled before it plays. */
  scrollOffset?: number;
  /** Seconds one letter takes to land. */
  duration?: number;
  /** Element rendered for the wordmark. */
  as?: WordmarkRevealTag;
  /** Extra classes for the script line. */
  scriptClassName?: string;
  /** Extra classes for the cue. */
  cueClassName?: string;
}

export default function WordmarkReveal({
  title,
  script,
  cue = 'Scroll down to reveal',
  instant = false,
  scrollOffset = 80,
  duration = 1.1,
  as,
  scriptClassName,
  cueClassName,
  className,
  ...props
}: WordmarkRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const select = gsap.utils.selector(root);
      const titleEl = select('[data-wordmark]')[0] as HTMLElement | undefined;
      if (!titleEl) return;

      const scriptEl = select('[data-wordmark-script]')[0] as HTMLElement | undefined;
      const cueEl = select('[data-wordmark-cue]')[0] as HTMLElement | undefined;
      const cueLine = select('[data-wordmark-cue-line]')[0] as HTMLElement | undefined;

      // Nothing is split or moved under reduce: the wordmark is already sitting
      // in its finished state, and the cue is hidden in CSS.
      if (prefersReducedMotion()) return;

      const splitOf = (el: HTMLElement) =>
        new SplitText(el, {
          type: 'words,chars',
          tag: 'span',
          // Keeps a word from breaking mid-air once its letters are separate spans
          smartWrap: true,
        });

      const splits = [splitOf(titleEl)];
      if (scriptEl) splits.push(splitOf(scriptEl));
      const [titleSplit, scriptSplit] = splits;
      gsap.set(
        splits.flatMap((split) => split.chars),
        { display: 'inline-block' }
      );

      // A slow pulse down the cue's line, so it reads as an instruction rather
      // than a label. Killed the moment the reveal takes over.
      const idle = cueLine
        ? gsap.fromTo(
            cueLine,
            { scaleY: 0.3, opacity: 0.35 },
            {
              scaleY: 1,
              opacity: 1,
              duration: 1.2,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
              transformOrigin: 'top',
            }
          )
        : null;

      const tl = gsap.timeline({ paused: true, onStart: () => idle?.kill() });

      if (cueEl) tl.to(cueEl, { autoAlpha: 0, y: -12, duration: 0.45, ease: 'power2.out' }, 0);

      // Each letter turns on its own vertical axis, so the wordmark assembles
      // face by face instead of fading in as one block.
      tl.fromTo(
        titleSplit.chars,
        { opacity: 0, yPercent: 50, rotateY: 90, transformPerspective: 800 },
        {
          opacity: 1,
          yPercent: 0,
          rotateY: 0,
          duration,
          ease: 'expo.out',
          stagger: 0.03,
          force3D: true,
        },
        CUE_LEAD
      );

      // The script line leans in from the left along its own baseline, so the
      // joins between letters close in reading order rather than all at once.
      if (scriptSplit) {
        tl.fromTo(
          scriptSplit.chars,
          { opacity: 0, x: '-0.3em', y: '0.22em', rotate: -7, transformOrigin: '50% 100%' },
          {
            opacity: 1,
            x: '0em',
            y: '0em',
            rotate: 0,
            duration,
            ease: 'expo.out',
            stagger: 0.036,
            force3D: true,
          },
          CUE_LEAD + SCRIPT_OFFSET
        );
      }

      // The server paints the wordmark before GSAP can prime it, so it ships
      // hidden (opacity-0) and is only shown here — by which point the fromTo
      // tweens above have already put every letter out of sight.
      gsap.set([titleEl, scriptEl].filter(Boolean) as HTMLElement[], { opacity: 1 });

      if (instant) {
        tl.play();
        return () => {
          idle?.kill();
          tl.kill();
          splits.forEach((split) => split.revert());
        };
      }

      // Scroll-driven: on screen is not enough. A wordmark that opens the page
      // is on screen the moment it loads, so it also waits for the scroller to
      // have travelled `scrollOffset` — that first nudge down the page is the
      // cue being answered.
      const scroller = root.closest('[data-wordmark-scroller]') as HTMLElement | null;
      const target: HTMLElement | Window = scroller ?? window;
      const readScroll = () => (scroller ? scroller.scrollTop : window.scrollY);
      // A page too short to scroll can never answer the cue, so it plays on sight.
      const canScroll = () => {
        const box = scroller ?? document.documentElement;
        const view = scroller ? scroller.clientHeight : window.innerHeight;
        return box.scrollHeight > view + 1;
      };

      let inView = false;
      let played = false;
      const play = () => {
        if (played || !inView) return;
        if (canScroll() && readScroll() < scrollOffset) return;
        played = true;
        target.removeEventListener('scroll', play);
        tl.play();
      };
      const enter = () => {
        inView = true;
        play();
      };

      const trigger = ScrollTrigger.create({
        trigger: root,
        scroller: scroller ?? undefined,
        start: 'top 90%',
        end: 'bottom top',
        onEnter: enter,
        onEnterBack: enter,
      });

      target.addEventListener('scroll', play, { passive: true });
      // Already in view when it mounted — ScrollTrigger has no state change to
      // report, so ask it directly.
      if (trigger.isActive) enter();

      return () => {
        idle?.kill();
        tl.kill();
        trigger.kill();
        target.removeEventListener('scroll', play);
        splits.forEach((split) => split.revert());
      };
    },
    { scope: rootRef, dependencies: [title, script, cue, instant, scrollOffset, duration] }
  );

  const Tag = as ?? 'h1';
  const lines = title.split('\n');

  return (
    <div
      ref={rootRef}
      data-wordmark-reveal
      className={cn('flex w-full flex-col items-center', className)}
      {...props}
    >
      <Tag
        data-wordmark
        className="m-0 text-center leading-[0.88] font-normal tracking-[-0.02em] uppercase opacity-0 motion-reduce:opacity-100"
      >
        {lines.map((line, index) => (
          <span key={index}>
            {line}
            {index < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </Tag>

      {script ? (
        <p
          data-wordmark-script
          // Sized and spaced in em, so it keeps its proportion at any type scale.
          // An actual script face can be pulled back up over the wordmark with
          // scriptClassName="-mt-[0.4em] translate-x-[3%]": its swash tail leaves the
          // room an upright italic does not, and carries the word optically left.
          className={cn(
            'm-0 mt-[0.1em] text-center text-[0.62em] leading-none italic',
            'opacity-0 motion-reduce:opacity-100',
            scriptClassName
          )}
        >
          {script}
        </p>
      ) : null}

      {cue && !instant ? (
        <div
          data-wordmark-cue
          aria-hidden="true"
          className={cn(
            'mt-10 flex flex-col items-center gap-3 text-xs tracking-[0.14em] uppercase opacity-70',
            // No reveal to wait for under reduce, so there is nothing to announce
            'motion-reduce:hidden',
            cueClassName
          )}
        >
          <span>{cue}</span>
          <span
            data-wordmark-cue-line
            className="h-10 w-px bg-[linear-gradient(to_bottom,currentColor,transparent)]"
          />
        </div>
      ) : null}
    </div>
  );
}
