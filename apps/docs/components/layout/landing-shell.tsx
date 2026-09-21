import type { ReactNode } from 'react';
import { LandingHeader } from '@/components/layout/landing-header';
import { SiteFooter } from '@/components/layout/site-footer';

export type LandingShellProps = Readonly<{
  children: ReactNode;
  starCount: number | null;
}>;

export function LandingShell({ children, starCount }: LandingShellProps) {
  return (
    <div data-landing className="flex min-h-svh flex-col">
      <LandingHeader starCount={starCount} />
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
    </div>
  );
}
