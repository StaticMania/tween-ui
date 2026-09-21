'use client';

import { CommandTabs, shadcnRegistryAddCommands } from './command-tabs';

/**
 * The optional `registry add` command, for the setup page. The mapping is per
 * project, not per component, so item pages never repeat it.
 */
export function RegistrySetup() {
  return (
    <div className="not-prose my-4">
      <CommandTabs commands={shadcnRegistryAddCommands()} />
    </div>
  );
}

export default RegistrySetup;
