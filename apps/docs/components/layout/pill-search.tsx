'use client';

import { useSyncExternalStore } from 'react';
import { useSearch } from 'docora';
import { Search } from 'lucide-react';

const subscribeToNothing = () => () => {};
const readIsMac = () => navigator.platform.toLowerCase().includes('mac');
const readIsMacOnServer = () => false;

export const PillSearch = () => {
  const { setOpen } = useSearch();
  const isMac = useSyncExternalStore(subscribeToNothing, readIsMac, readIsMacOnServer);

  return (
    <button
      type="button"
      aria-label="Open search"
      onClick={() => setOpen(true)}
      className="bg-highlighted/[0.05] text-muted-foreground ring-border hover:bg-highlighted/[0.08] hover:text-highlighted focus-visible:ring-tween-accent inline-flex h-9 items-center gap-2 rounded-full pr-1.5 pl-3 text-sm whitespace-nowrap ring-1 transition-colors duration-300 ring-inset focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
    >
      <Search strokeWidth={1.5} className="size-4 shrink-0" aria-hidden="true" />
      <span>Search</span>
      <kbd className="bg-background text-dimmed ring-border rounded-full px-2 py-0.5 font-sans text-[10px] font-medium ring-1 ring-inset">
        {isMac ? '⌘' : 'Ctrl'} K
      </kbd>
    </button>
  );
};
