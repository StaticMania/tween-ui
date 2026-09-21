'use client';

import { useId, useRef, type HTMLAttributes } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Alpha threshold: soft blurred edges snap to fully opaque or fully clear, so
// the two overlapping blurred words fuse into one liquid shape mid-morph.
const THRESHOLD_MATRIX = '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140';

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const;

type MorphingTextTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';

export interface MorphingTextProps extends HTMLAttributes<HTMLElement> {
  /** Words to cycle through. The first one is what renders on the server. */
  words: string[];
  /** Text before the morphing word. `\n` starts a new line. */
  prefix?: string;
  /** Element to render. Defaults to `h2` with a prefix, `span` without. */
  as?: MorphingTextTag;
  /** Length of each morph, in seconds. */
  morphDuration?: number;
  /** How long each word rests before morphing, in seconds. */
  pauseDuration?: number;
  /** Blur ceiling while a word is fully dissolved, in pixels. */
  maxBlur?: number;
  /**
   * Keep the slot at the first word's width so nearby text never moves; longer
   * words overflow it. Off, GSAP eases the slot between each word's width.
   */
  fixedWidth?: boolean;
  /** Alignment of the word inside its slot. */
  wordAlign?: keyof typeof ALIGN;
  /** Extra classes for the morphing word — color, weight, italics. */
  wordClassName?: string;
}

export default function MorphingText({
  words,
  prefix,
  as,
  morphDuration = 1.2,
  pauseDuration = 1.8,
  maxBlur = 16,
  fixedWidth = false,
  wordAlign = 'left',
  wordClassName,
  className,
  ...props
}: MorphingTextProps) {
  const slotRef = useRef<HTMLSpanElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const aRef = useRef<HTMLSpanElement>(null);
  const bRef = useRef<HTMLSpanElement>(null);
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // useId can contain characters that are not valid inside `url(#…)`.
  const filterId = `morph-threshold-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const wordsKey = words.join('|');

  useGSAP(
    () => {
      const slot = slotRef.current;
      const layer = layerRef.current;
      const a = aRef.current;
      const b = bRef.current;
      if (!slot || !layer || !a || !b || !words.length) return;

      const count = words.length;
      let widths: number[] = [];
      let current = 0;
      let disposed = false;

      const widthFor = (i: number) => widths[fixedWidth ? 0 : i] ?? 0;

      // Measure every word so the slot can ease between their widths. Only
      // touch the slot when a width really changed — a zero width means the
      // text is not laid out yet (display: none), so leave it on auto.
      const fit = () => {
        const next = measureRefs.current
          .slice(0, count)
          .map((el) => (el ? el.getBoundingClientRect().width : 0));
        const same =
          next.length === widths.length && next.every((w, i) => Math.abs(w - widths[i]) < 0.5);
        if (same) return;
        widths = next;
        const w = widthFor(current);
        if (w) gsap.set(slot, { width: w });
      };

      fit();
      document.fonts?.ready.then(() => {
        if (!disposed) fit();
      });
      const ro = new ResizeObserver(fit);
      ro.observe(slot.closest('[data-morphing-text]') ?? slot);

      const rest = (word: string) => {
        a.textContent = word;
        a.style.filter = '';
        a.style.opacity = '';
        b.textContent = '';
        b.style.filter = '';
        b.style.opacity = '0';
        // Crisp text at rest; the threshold only runs during the morph.
        layer.style.filter = '';
        // Promote only while morphing — a permanent compositing layer under an
        // SVG filter can rasterise blank on some Windows GPUs.
        a.style.willChange = '';
        b.style.willChange = '';
      };

      const cleanup = () => {
        disposed = true;
        ro.disconnect();
        rest(words[0]);
      };

      if (count < 2 || prefersReducedMotion()) return cleanup;

      const blurFor = (f: number) => (f <= 0 ? maxBlur : Math.min(8 / f - 8, maxBlur));
      const morph = { f: 0 };
      const setFrame = () => {
        const f = morph.f;
        a.style.filter = `blur(${blurFor(1 - f)}px)`;
        a.style.opacity = String(Math.pow(1 - f, 0.4));
        b.style.filter = `blur(${blurFor(f)}px)`;
        b.style.opacity = String(Math.pow(f, 0.4));
      };

      const tl = gsap.timeline({ paused: true, repeat: -1 });

      for (let i = 0; i < count; i++) {
        const next = (i + 1) % count;

        tl.call(
          () => {
            a.textContent = words[i];
            b.textContent = words[next];
            a.style.willChange = 'filter, opacity';
            b.style.willChange = 'filter, opacity';
            layer.style.filter = `url(#${filterId}) blur(0.6px)`;
            current = next;
            // Read the width when the morph starts, not when the timeline was
            // built, so a resize or late font load is always picked up.
            const w = widthFor(next);
            if (!fixedWidth && w) {
              gsap.to(slot, {
                width: w,
                duration: morphDuration,
                ease: 'power2.inOut',
                overwrite: true,
              });
            }
          },
          undefined,
          `+=${Math.max(0, pauseDuration)}`
        );
        tl.fromTo(
          morph,
          { f: 0 },
          {
            f: 1,
            duration: Math.max(0.1, morphDuration),
            ease: 'none',
            immediateRender: false,
            onUpdate: setFrame,
          }
        );
        tl.call(() => rest(words[next]));
      }

      // Only cycle while the headline is on screen.
      ScrollTrigger.create({
        trigger: slot,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });

      return cleanup;
    },
    {
      scope: slotRef,
      dependencies: [wordsKey, morphDuration, pauseDuration, maxBlur, fixedWidth, filterId],
      revertOnUpdate: true,
    }
  );

  const Tag = as ?? (prefix ? 'h2' : 'span');

  // Earlier prefix lines wrap freely; the last line stays glued to the word so
  // a wider word never drops onto a line of its own mid-cycle.
  const lines = (prefix ?? '').trim().split('\n');
  const lastLine = lines.pop() ?? '';

  const wordStyle = cn('absolute top-0 left-0 w-full whitespace-nowrap', ALIGN[wordAlign]);

  const slot = (
    <span
      ref={slotRef}
      className={cn('relative inline-block align-bottom whitespace-nowrap', wordClassName)}
    >
      {/* Screen readers get the first word once, not a changing headline. */}
      <span className="sr-only">{words[0]}</span>

      {/* Invisible copy in normal flow gives the slot its height and baseline. */}
      <span aria-hidden="true" className="invisible">
        {words[0]}
      </span>

      <span
        ref={layerRef}
        aria-hidden="true"
        className="absolute inset-0 motion-reduce:filter-none"
      >
        {/* Keyed so a new word list remounts the spans the loop has been writing to. */}
        <span key={`a-${wordsKey}`} ref={aRef} className={wordStyle}>
          {words[0]}
        </span>
        <span key={`b-${wordsKey}`} ref={bRef} className={wordStyle} style={{ opacity: 0 }} />
      </span>

      {/* Hidden measuring copies, one per word. */}
      <span aria-hidden="true" className="pointer-events-none invisible absolute top-0 left-0">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            ref={(el) => {
              measureRefs.current[i] = el;
            }}
            className="absolute whitespace-nowrap"
          >
            {word}
          </span>
        ))}
      </span>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 size-px overflow-hidden opacity-0"
      >
        <defs>
          <filter id={filterId}>
            <feColorMatrix in="SourceGraphic" type="matrix" values={THRESHOLD_MATRIX} />
          </filter>
        </defs>
      </svg>
    </span>
  );

  return (
    <Tag
      data-morphing-text
      className={cn('relative m-0', prefix ? 'block' : 'inline-block', className)}
      {...props}
    >
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          <br />
        </span>
      ))}
      {prefix ? (
        <span className="whitespace-nowrap">
          {lastLine} {slot}
        </span>
      ) : (
        slot
      )}
    </Tag>
  );
}
