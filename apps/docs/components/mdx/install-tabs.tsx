'use client';

import { CommandTabs, shadcnAddCommands } from './command-tabs';

/** shadcn install command across package managers. `item` is the registry item name. */
export function InstallTabs({ item }: { item: string }) {
  return (
    <div className="not-prose my-4">
      <CommandTabs commands={shadcnAddCommands([item])} />
    </div>
  );
}

export default InstallTabs;
