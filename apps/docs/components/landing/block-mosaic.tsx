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
    <li className="flex">
      <Link
        href={hrefFor(entry)}
        onPointerEnter={(event) => {
          if (event.pointerType === 'touch') return;
          start();
        }}
        onPointerLeave={stop}
        onFocus={start}
        onBlur={stop}
        className="group bezel-shell bezel-lift flex w-full focus-visible:outline-none"
      >
        <span className="bezel-core flex w-full flex-col overflow-hidden">
          <span className="bg-muted/40 relative block aspect-[16/10] overflow-hidden">
            {image && (
              <Image
                src={image}
                alt=""
                fill
                sizes={TILE_SIZES}
                className="ease-tween object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            )}
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
                  'ease-tween absolute inset-0 h-full w-full object-cover transition-opacity duration-500 motion-reduce:transition-none',
                  active ? 'opacity-100' : 'opacity-0'
                )}
              />
            )}
          </span>
          <span className="flex items-center justify-between gap-2 py-2 pr-2 pl-4">
            <span className="text-muted-foreground group-hover:text-highlighted font-mono text-xs transition-colors duration-500 motion-reduce:transition-none">
              {entry.name}
            </span>
            <span
              aria-hidden="true"
              className="bg-highlighted/[0.05] text-dimmed group-hover:text-tween-accent ease-tween grid size-7 shrink-0 place-items-center rounded-full transition-[transform,color] duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 motion-reduce:transition-none"
            >
              <ArrowUpRight strokeWidth={1.5} className="size-3.5" />
            </span>
          </span>
        </span>
      </Link>
    </li>
  );
}

export function BlockMosaic({ entries }: { entries: RegistryEntry[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 sm:pb-12 sm:[&>li:nth-child(even)]:translate-y-12">
      {entries.map((entry) => (
        <BlockTile key={entry.name} entry={entry} />
      ))}
    </ul>
  );
}

export default BlockMosaic;
