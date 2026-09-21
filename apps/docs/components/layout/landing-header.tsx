'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { SearchButton, ThemeToggle, useDocsConfig, useSearch } from 'docora';
import { Search } from 'lucide-react';
import { HeaderActions } from '@/components/layout/header-actions';
import { HeaderLogo } from '@/components/layout/header-logo';
import { MobileNav } from '@/components/nav/mobile-nav';
import { cn } from '@/lib/utils';

const MORPH = 'ease-tween duration-700 motion-reduce:transition-none';
const FADE = 'ease-tween transition-opacity motion-reduce:transition-none';

const subscribeToNothing = () => () => {};
const readIsMac = () => navigator.platform.toLowerCase().includes('mac');
const readIsMacOnServer = () => false;

function PillSearch() {
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
}

export type LandingHeaderProps = Readonly<{
  starCount: number | null;
}>;

export function LandingHeader({ starCount }: LandingHeaderProps) {
  const config = useDocsConfig();
  const sentinelRef = useRef<HTMLSpanElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setIsScrolled(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
      />

      <header
        data-scrolled={isScrolled}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 sm:px-4"
      >
        <span
          aria-hidden="true"
          className={cn(
            'border-border bg-background/80 dark:bg-tween-ink-deep/80 absolute inset-x-0 top-0 h-16 border-b backdrop-blur-sm duration-500',
            FADE,
            isScrolled ? 'opacity-0' : 'opacity-100'
          )}
        />

        <div
          className={cn(
            'pointer-events-auto relative flex w-full items-center justify-between overflow-hidden transition-[max-width,height,padding,border-radius,background-color,box-shadow,transform]',
            MORPH,
            isScrolled
              ? 'dark:bg-tween-ink/80 bg-background/80 h-14 max-w-[28rem] translate-y-4 rounded-[1.75rem] pr-2.5 pl-5 shadow-[0_0_0_1px_var(--bezel-ring),0_2px_4px_-1px_rgba(0,0,0,0.06),0_12px_28px_-10px_rgba(0,0,0,0.18),0_36px_72px_-28px_var(--bezel-drop)] backdrop-blur-xl'
              : 'max-w-8xl h-16 translate-y-0 rounded-none px-1 shadow-none sm:px-2'
          )}
        >
          <div className="flex shrink-0 items-center">
            <div
              inert={isScrolled}
              className={cn(
                'grid transition-[grid-template-columns,opacity] lg:hidden',
                MORPH,
                isScrolled ? 'grid-cols-[0fr] opacity-0' : 'grid-cols-[1fr] opacity-100'
              )}
            >
              <div className="min-w-0 overflow-hidden pr-3">
                <MobileNav items={config.navigation ?? []} />
              </div>
            </div>
            <HeaderLogo />
          </div>

          <div
            inert={isScrolled}
            className={cn(
              'absolute top-1/2 left-1/2 hidden w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4 md:block',
              FADE,
              isScrolled ? 'opacity-0 duration-200' : 'opacity-100 delay-200 duration-500'
            )}
          >
            <SearchButton className="w-full" />
          </div>

          <div className="grid shrink-0 items-center justify-items-end">
            <div
              inert={isScrolled}
              className={cn(
                'col-start-1 row-start-1 flex items-center gap-1',
                FADE,
                isScrolled ? 'opacity-0 duration-200' : 'opacity-100 delay-200 duration-500'
              )}
            >
              <SearchButton className="md:hidden" iconOnly />
              <HeaderActions starCount={starCount} />
              <ThemeToggle />
            </div>
            <div
              inert={!isScrolled}
              className={cn(
                'col-start-1 row-start-1',
                FADE,
                isScrolled ? 'opacity-100 delay-200 duration-500' : 'opacity-0 duration-200'
              )}
            >
              <PillSearch />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
