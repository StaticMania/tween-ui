'use client';

import Link from 'next/link';
import { useDocsConfig } from 'docora';
import { cn } from '@/lib/utils';
import { FooterBrand } from './footer-brand';
import { FooterLink } from './footer-link';

const DOCORA_URL = 'https://docora-docs.vercel.app/';

export const SiteFooter = ({ className }: Readonly<{ className?: string }>) => {
  const config = useDocsConfig();
  const credits = config.footer?.credits;
  const links = config.footer?.links ?? [];
  const columns = config.footer?.columns ?? [];
  const year = new Date().getFullYear();

  const groups =
    columns.length > 0
      ? columns
      : links.length > 0
        ? [{ title: undefined as string | undefined, links }]
        : [];

  return (
    <footer className={cn('border-border bg-muted/40 mt-auto border-t', className)}>
      <div className="max-w-8xl mx-auto w-full px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <FooterBrand />
            {config.site.description && (
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                {config.site.description}
              </p>
            )}
          </div>

          {groups.length > 0 && (
            <nav
              aria-label="Footer"
              className={cn(
                'grid gap-8 sm:gap-12',
                groups.length >= 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'
              )}
            >
              {groups.map((group) => (
                <div key={group.title ?? 'links'} className="flex flex-col gap-3">
                  {group.title && (
                    <p className="text-dimmed text-xs font-medium tracking-wide uppercase">
                      {group.title}
                    </p>
                  )}
                  {group.links.map((link) => (
                    <FooterLink key={link.href} link={link} />
                  ))}
                </div>
              ))}
            </nav>
          )}
        </div>

        <div className="border-border text-dimmed mt-10 flex flex-col items-center gap-2 border-t pt-6 text-xs sm:flex-row sm:justify-between">
          <p suppressHydrationWarning>
            © {year} {config.site.name}. Built with{' '}
            <Link href={DOCORA_URL} target="_blank" rel="noreferrer" className="text-highlighted">
              Docora
            </Link>
            .
          </p>
          {credits && <p>{credits}</p>}
        </div>
      </div>
    </footer>
  );
};
