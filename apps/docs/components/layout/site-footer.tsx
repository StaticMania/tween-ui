'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDocsConfig } from 'docora';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const DOCORA_URL = 'https://docora-docs.vercel.app/';

type FooterLinkItem = { label: string; href: string; external?: boolean };

function FooterLink({ link }: Readonly<{ link: FooterLinkItem }>) {
  const external = link.external ?? link.href.startsWith('http');

  return (
    <Link
      href={link.href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="text-muted-foreground hover:text-highlighted inline-flex items-center gap-1 text-sm transition-colors"
    >
      {link.label}
      {external && <ArrowUpRight className="text-dimmed size-3.5" aria-hidden />}
    </Link>
  );
}

function Brand() {
  const config = useDocsConfig();
  const logo = config.header?.logo;
  const title = config.header?.title ?? config.site.name;

  return (
    <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-70">
      {logo?.light && (
        <Image
          src={logo.light}
          alt={logo.alt || title}
          width={24}
          height={24}
          unoptimized={/\.svg(?:$|\?)/i.test(logo.light)}
          className={cn('h-6 w-auto', logo.dark && 'dark:hidden', logo.className)}
        />
      )}
      {logo?.dark && (
        <Image
          src={logo.dark}
          alt={logo.alt || title}
          width={24}
          height={24}
          unoptimized={/\.svg(?:$|\?)/i.test(logo.dark)}
          className={cn('hidden h-6 w-auto dark:block', logo.className)}
        />
      )}
      <span className="text-highlighted font-semibold tracking-tight">{title}</span>
    </Link>
  );
}

export function SiteFooter({ className }: Readonly<{ className?: string }>) {
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
            <Brand />
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
}
