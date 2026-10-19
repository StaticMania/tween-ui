'use client';

import type { RegistryEntry } from '@/registry/schema';
import { BlockTile } from './block-tile';

export const BlockMosaic = ({ entries }: { entries: RegistryEntry[] }) => {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 sm:pb-12 sm:[&>li:nth-child(even)]:translate-y-12">
      {entries.map((entry) => (
        <BlockTile key={entry.name} entry={entry} />
      ))}
    </ul>
  );
};

export default BlockMosaic;
