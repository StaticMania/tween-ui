'use client';

import type { ReactNode } from 'react';
import { SiteHeader, useDocsConfig } from 'docora';
import { HeaderActions } from '@/components/layout/header-actions';
import { HeaderLogo } from '@/components/layout/header-logo';
import { SiteFooter } from '@/components/layout/site-footer';
import { MobileNav } from '@/components/nav/mobile-nav';

export type LandingShellProps = Readonly<{
  children: ReactNode;
  starCount: number | null;
}>;

export function LandingShell({ children, starCount }: LandingShellProps) {
  const config = useDocsConfig();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        className="tween-header"
        logo={
          <>
            <MobileNav items={config.navigation ?? []} />
            <HeaderLogo />
          </>
        }
      >
        <HeaderActions starCount={starCount} />
      </SiteHeader>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
