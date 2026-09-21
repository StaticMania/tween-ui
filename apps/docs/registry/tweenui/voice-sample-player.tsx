'use client';

import { useCallback, useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Deterministic base heights so server and client render the same bars.
const BAR_COUNT = 40;
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const t = i / (BAR_COUNT - 1);
  const wave =
    Math.abs(Math.sin(t * Math.PI * 5)) * 0.6 + Math.abs(Math.sin(t * Math.PI * 13)) * 0.25;
  return Math.min(1, 0.22 + wave);
});

export interface VoiceSamplePlayerProps extends Omit<ComponentPropsWithoutRef<'div'>, 'onChange'> {
  /** Speaker / voice name. */
  name: string;
  /** Short line under the name (accent, tone, language…). */
  description?: string;
  /** Avatar image URL. */
  avatar?: string;
  /** Alt text for the avatar (defaults to the name). */
  avatarAlt?: string;
  /** Audio file to play. Omit to animate without sound (previews). */
  src?: string;
  /** Controlled playing state. */
  playing?: boolean;
  /** Uncontrolled initial state. */
  defaultPlaying?: boolean;
  /** Fires when playback starts or stops. */
  onPlayingChange?: (playing: boolean) => void;
}

export default function VoiceSamplePlayer({
  name,
  description,
  avatar,
  avatarAlt,
  src,
  playing,
  defaultPlaying = false,
  onPlayingChange,
  className,
  ...props
}: VoiceSamplePlayerProps) {
  const isControlled = playing !== undefined;
  const [internal, setInternal] = useState(defaultPlaying);
  const active = isControlled ? playing : internal;

  const contentRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const playIconRef = useRef<SVGSVGElement>(null);
  const pauseIconRef = useRef<SVGSVGElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firstRun = useRef(true);

  const setActive = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternal(next);
      onPlayingChange?.(next);
    },
    [isControlled, onPlayingChange]
  );

  // Keep the latest setter for the audio "ended" listener without re-creating audio.
  const endedRef = useRef<() => void>(() => {});
  useEffect(() => {
    endedRef.current = () => setActive(false);
  }, [setActive]);

  // Create the audio element once per source.
  useEffect(() => {
    if (!src) return;
    const audio = new Audio(src);
    audio.preload = 'metadata';
    audioRef.current = audio;
    const onEnded = () => endedRef.current();
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener('ended', onEnded);
      audio.src = '';
      audioRef.current = null;
    };
  }, [src]);

  // Sync playback with state.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (active) audio.play().catch(() => endedRef.current());
    else {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [active]);

  // Slide the label out / waveform in, and morph the play ↔ pause icon.
  useGSAP(
    () => {
      const immediate = firstRun.current || prefersReducedMotion();
      firstRun.current = false;
      const opts = immediate ? { duration: 0 } : { duration: 0.5, ease: 'power2.inOut' as const };

      gsap.to(contentRef.current, {
        yPercent: active ? -130 : 0,
        autoAlpha: active ? 0 : 1,
        ...opts,
      });
      gsap.to(waveRef.current, { yPercent: active ? 0 : 130, autoAlpha: active ? 1 : 0, ...opts });
      gsap.to(playIconRef.current, {
        yPercent: active ? -130 : 0,
        autoAlpha: active ? 0 : 1,
        ...opts,
      });
      gsap.to(pauseIconRef.current, {
        yPercent: active ? 0 : 130,
        autoAlpha: active ? 1 : 0,
        ...opts,
      });
    },
    { dependencies: [active] }
  );

  // Equalizer: oscillate the bars while playing.
  useGSAP(
    () => {
      const bars = gsap.utils.toArray<SVGRectElement>('rect', svgRef.current);
      if (!bars.length) return;
      gsap.set(bars, {
        transformBox: 'fill-box',
        transformOrigin: 'center center',
        scaleY: (i: number) => BARS[i % BARS.length],
      });
      if (!active || prefersReducedMotion()) return;

      bars.forEach((bar, i) => {
        gsap.to(bar, {
          scaleY: 0.25 + Math.random() * 0.75,
          duration: 0.45 + Math.random() * 0.4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.03,
        });
      });
    },
    { dependencies: [active] }
  );

  return (
    <div
      {...props}
      data-voice-sample-player
      data-playing={active ? 'true' : 'false'}
      className={cn(
        'flex w-full max-w-[420px] items-center gap-3 rounded-full p-2 transition-colors duration-500 ease-in-out motion-reduce:transition-none',
        active ? 'bg-[#045f64]' : 'bg-[#045f64]/10 dark:bg-[#045f64]/20',
        className
      )}
    >
      <figure className="size-14 shrink-0 overflow-hidden rounded-full bg-[#045f64]/15">
        {avatar ? (
          <img src={avatar} alt={avatarAlt ?? name} className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-sm font-medium text-[#045f64] dark:text-[#9fd4d6]">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </figure>

      <div className="relative h-14 flex-1 overflow-hidden">
        <div ref={contentRef} className="absolute inset-0 flex flex-col justify-center">
          <p className="truncate text-sm font-medium text-[#045f64] dark:text-[#9fd4d6]">{name}</p>
          {description ? (
            <p className="truncate text-xs text-[#045f64]/60 dark:text-[#9fd4d6]/80">
              {description}
            </p>
          ) : null}
        </div>

        <div
          ref={waveRef}
          className="absolute inset-0 flex items-center opacity-0 motion-reduce:opacity-100"
          aria-hidden="true"
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${BAR_COUNT * 6} 32`}
            className="h-8 w-full"
            fill="#c6f56f"
            preserveAspectRatio="none"
          >
            {BARS.map((_, i) => (
              <rect key={i} x={i * 6 + 1.5} y={4} width={3} height={24} rx={1.5} />
            ))}
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setActive(!active)}
        aria-pressed={active}
        aria-label={active ? `Pause ${name}` : `Play ${name}`}
        className="relative flex size-14 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#045f64] shadow-[0_1px_1px_rgba(16,24,40,0.16)] transition-transform hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 dark:bg-[#12161F] dark:text-[#9fd4d6]"
      >
        <span className="relative size-6 overflow-hidden">
          <svg
            ref={playIconRef}
            viewBox="0 0 24 24"
            className="absolute inset-0 size-6 fill-current"
            aria-hidden="true"
          >
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
          </svg>
          <svg
            ref={pauseIconRef}
            viewBox="0 0 24 24"
            className="absolute inset-0 size-6 fill-current opacity-0 motion-reduce:opacity-100"
            aria-hidden="true"
          >
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </span>
      </button>
    </div>
  );
}
