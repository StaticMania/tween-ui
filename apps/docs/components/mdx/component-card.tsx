'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { prefersReducedMotion } from '@/lib/motion';
import { hrefFor } from '@/lib/registry';
import { cn } from '@/lib/utils';
import type { RegistryEntry } from '@/registry/schema';

/** Card grid is 1 / 2 / 3 columns — tells next/image which width to serve. */
const POSTER_SIZES = '(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw';

export function ComponentCard({ entry }: { entry: RegistryEntry }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  const { image, video } = entry.media ?? {};

  /**
   * Hover starts the clip; leaving rewinds it. `play()` returns a promise that
   * rejects if a `pause()` lands first, which a quick mouse-over across the
   * grid does constantly — so the result is always swallowed.
   */
  const start = useCallback(() => {
    if (!video || prefersReducedMotion()) return;
    setActive(true);
    const el = videoRef.current;
    if (el) void el.play().catch(() => {});
  }, [video]);

  const stop = useCallback(() => {
    setActive(false);
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  // A card can be scrolled or tabbed away from mid-play; don't leave it running.
  useEffect(() => stop, [stop]);

  return (
    <Link
      href={hrefFor(entry)}
      onPointerEnter={(event) => {
        // Touch fires pointerenter on tap, right before navigating away. Only
        // that case is excluded — pointerType is not always 'mouse' on desktop.
        if (event.pointerType === 'touch') return;
        start();
      }}
      onPointerLeave={stop}
      onFocus={start}
      onBlur={stop}
      className="group border-border bg-muted/30 hover:border-highlighted/30 hover:bg-muted/50 flex flex-col overflow-hidden rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-highlighted text-sm font-semibold">{entry.title}</h3>
        {entry.isNew && (
          <span className="rounded-full border border-[#045f64]/30 bg-[#045f64]/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#045f64] uppercase">
            New
          </span>
        )}
      </div>

      {/* Poster at rest, clip on hover. The poster stays mounted underneath so
          a slow or failed video never leaves an empty frame. */}
      <div className="border-border/60 bg-background relative my-3 aspect-[16/10] overflow-hidden rounded-lg border">
        {image && (
          <Image
            src={image}
            alt={`${entry.title} preview`}
            fill
            sizes={POSTER_SIZES}
            className="object-cover"
          />
        )}

        {video && (
          <video
            ref={videoRef}
            src={video}
            muted
            loop
            playsInline
            // 36 cards on the gallery page — nothing is fetched until hover.
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
            /* Visibility follows the hover alone. Waiting on `canplay` first
               deadlocks: a video with no frames yet paints through to the
               poster below anyway, and Chrome throttles media it considers
               offscreen — so an element held at opacity 0 may never reach
               `canplay` to become visible in the first place. */
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-200 motion-reduce:transition-none',
              active ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}

        {!image && !video && (
          <div className="grid h-full w-full place-items-center">
            <div className="text-muted-foreground/50 text-[11px] font-medium tracking-wide uppercase transition-opacity group-hover:opacity-70">
              Preview coming soon
            </div>
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">{entry.description}</p>
    </Link>
  );
}

export default ComponentCard;
