'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { CommandTabs, REGISTRY_LISTED, shadcnAddCommands } from './command-tabs';

const SETUP_PATH = '/installation/setup-guide';

/** shadcn install command across package managers. `item` is the registry item name. */
export function InstallTabs({ item }: { item: string }) {
  // The setup page uses this component too, and pointing it back at itself
  // would read as a loop.
  const onSetupPage = usePathname() === SETUP_PATH;

  return (
    <div className="not-prose my-4">
      <CommandTabs commands={shadcnAddCommands([item])} />
      {!REGISTRY_LISTED && !onSetupPage && (
        <p className="text-muted-foreground mt-2 text-sm">
          First component?{' '}
          <Link href={SETUP_PATH} className="text-highlighted underline underline-offset-4">
            Set up the {siteConfig.registryNamespace} registry
          </Link>{' '}
          once per project, then this command works anywhere in it.
        </p>
      )}
    </div>
  );
}

export default InstallTabs;
