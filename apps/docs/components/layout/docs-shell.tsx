'use client';

import type { ReactNode } from 'react';
import { SiteFooter, SiteHeader, TableOfContents, useDocsConfig, type TocEntry } from 'docora';
import { MobileNav } from '@/components/nav/mobile-nav';
import { SidebarNav } from '@/components/nav/sidebar-nav';
import { cn } from '@/lib/utils';
import { HeaderActions } from './header-actions';
import { HeaderLogo } from './header-logo';

export type DocsShellProps = Readonly<{
  children: ReactNode;
  toc?: TocEntry[];
  page?: { relativePath?: string; title?: string };
  starCount: number | null;
  className?: string;
}>;

/**
 * Docora's `DocsLayout`, but rendering our own `SidebarNav` (the upstream
 * layout hardcodes its own and exposes no sidebar slot). Keep the shell's
 * widths in sync with docora/src/layouts/docs-layout.tsx on upgrades.
 */
export function DocsShell({ children, toc = [], page, starCount, className }: DocsShellProps) {
  const config = useDocsConfig();

  const navigation = config.navigation ?? [];
  const hasSidebar = navigation.length > 0;
  const hasToc = config.toc?.enabled !== false && toc.length > 0;

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        className="tween-header"
        logo={
          <>
            <MobileNav items={navigation} />
            <HeaderLogo />
          </>
        }
      >
        <HeaderActions starCount={starCount} />
      </SiteHeader>

      <div className="max-w-8xl mx-auto flex w-full flex-1 gap-8 px-4 sm:px-6">
        {hasSidebar && (
          <aside className="no-scrollbar sticky top-16 hidden h-[calc(100svh-4rem)] w-64 shrink-0 overflow-y-auto py-8 pr-4 lg:block">
            <SidebarNav items={navigation} />
          </aside>
        )}

        <main className={cn('min-w-0 flex-1 py-8', className)}>{children}</main>

        {hasToc && (
          <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-60 shrink-0 overflow-y-auto py-8 xl:block">
            <TableOfContents items={toc} relativePath={page?.relativePath} title={page?.title} />
          </aside>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
