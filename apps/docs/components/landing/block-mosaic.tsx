'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { prefersReducedMotion } from '@/lib/motion';
import { hrefFor } from '@/lib/registry';
import { cn } from '@/lib/utils';
import type { RegistryEntry } from '@/registry/schema';

const TILE_SIZES = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw';

function BlockTile({ entry }: { entry: RegistryEntry }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const { image, video } = entry.media ?? {};

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

  useEffect(() => stop, [stop]);

  return (
    <li>
      <Link
        href={hrefFor(entry)}
        onPointerEnter={(event) => {
          if (event.pointerType === 'touch') return;
          start();
        }}
        onPointerLeave={stop}
        onFocus={start}
        onBlur={stop}
        className="group border-border bg-muted/30 hover:border-tween-accent/40 hover:bg-muted/60 flex flex-col overflow-hidden rounded-xl border transition-colors duration-300 motion-reduce:transition-none"
      >
        <span className="border-border/60 bg-background relative block aspect-[16/10] overflow-hidden border-b">
          {image && <Image src={image} alt="" fill sizes={TILE_SIZES} className="object-cover" />}
          {video && (
            <video
              ref={videoRef}
              src={video}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              tabIndex={-1}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-200 motion-reduce:transition-none',
                active ? 'opacity-100' : 'opacity-0'
              )}
            />
          )}
        </span>
        <span className="flex items-center justify-between gap-2 px-3 py-2.5">
          <span className="text-muted-foreground group-hover:text-highlighted font-mono text-xs transition-colors motion-reduce:transition-none">
            {entry.name}
          </span>
          <ArrowUpRight
            className="text-dimmed group-hover:text-tween-accent ease-tween size-3.5 shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </span>
      </Link>
    </li>
  );
}

export function BlockMosaic({ entries }: { entries: RegistryEntry[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {entries.map((entry) => (
        <BlockTile key={entry.name} entry={entry} />
      ))}
    </ul>
  );
}

export default BlockMosaic;
