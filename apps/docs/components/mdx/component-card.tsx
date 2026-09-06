'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { hrefFor } from '@/lib/registry';
import { cn } from '@/lib/utils';
import type { RegistryEntry } from '@/registry/schema';

export function ComponentCard({ entry }: { entry: RegistryEntry }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const onEnter = () => {
    const v = videoRef.current;
    if (v) void v.play().catch(() => {});
  };
  const onLeave = () => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  const { image, video } = entry.media ?? {};

  return (
    <Link
      href={hrefFor(entry)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
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

      {/* media slot — image at rest, video on hover (added per component later) */}
      <div className="border-border/60 bg-background relative my-3 aspect-[16/10] overflow-hidden rounded-lg border">
        {video ? (
          <video
            ref={videoRef}
            src={video}
            poster={image}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={entry.title} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <div
              className={cn(
                'text-muted-foreground/50 text-[11px] font-medium tracking-wide uppercase',
                'transition-opacity group-hover:opacity-70'
              )}
            >
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
