'use client';

import { getDemo } from '@/registry/__index__.generated';

/**
 * Renders a registry demo on its own, with no docs chrome around it. The demo
 * map is a client module, so the bare `/preview/[name]` page reaches it through
 * this boundary rather than importing it into a server graph.
 */
export function BlockStage({ name, variant }: { name: string; variant: string }) {
  const Demo = getDemo(name, variant);

  if (!Demo) {
    return (
      <div className="text-muted-foreground grid min-h-svh place-items-center text-sm">
        No preview for <code className="ml-1">{name}</code>.
      </div>
    );
  }

  return <Demo />;
}
