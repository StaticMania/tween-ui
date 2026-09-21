'use client';

import { CommandTabs, shadcnRegistryAddCommands } from './command-tabs';

/**
 * The one-time `registry add` command, for the setup page. Item pages link here
 * instead of repeating it — the mapping is per project, not per component.
 */
export function RegistrySetup() {
  return (
    <div className="not-prose my-4">
      <CommandTabs commands={shadcnRegistryAddCommands()} />
    </div>
  );
}

export default RegistrySetup;
