import Link from 'next/link';
import { hrefFor } from '@/lib/registry';
import type { RegistryEntry } from '@/registry/schema';

/**
 * Gallery card without the preview slot — what ships until the poster/video
 * set is complete. `component-card.tsx` (v1) is the version with the hover
 * preview and is still wired for it; swap the import in `component-gallery.tsx`
 * back to it once the media is in.
 *
 * No media means no hover state, so this needs no client JS.
 */
export function ComponentCardV2({ entry }: { entry: RegistryEntry }) {
  return (
    <Link
      href={hrefFor(entry)}
      className="border-border bg-muted/30 hover:border-highlighted/30 hover:bg-muted/50 flex flex-col gap-2 overflow-hidden rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-highlighted text-sm font-semibold">{entry.title}</h3>
        {entry.isNew && (
          <span className="rounded-full border border-[#045f64]/30 bg-[#045f64]/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#045f64] uppercase">
            New
          </span>
        )}
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">{entry.description}</p>
    </Link>
  );
}

export default ComponentCardV2;
