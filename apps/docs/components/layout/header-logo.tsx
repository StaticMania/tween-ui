'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useDocsConfig } from 'docora';
import { cn } from '@/lib/utils';

/**
 * Docora's SiteHeader renders its own Logo only when no `logo` prop is passed,
 * and we pass one so the mobile trigger can sit in that slot. This mirrors the
 * upstream mark + title, including the light/dark logo pair.
 */
export function HeaderLogo() {
  const config = useDocsConfig();
  const logo = config.header?.logo;
  const title = config.header?.title ?? config.site.name;

  return (
    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70">
      {logo?.light && (
        <Image
          src={logo.light}
          alt={logo.alt || title}
          width={24}
          height={24}
          priority
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
          priority
          unoptimized={/\.svg(?:$|\?)/i.test(logo.dark)}
          className={cn('hidden h-6 w-auto dark:block', logo.className)}
        />
      )}
      <span className="font-semibold tracking-tight">{title}</span>
    </Link>
  );
}
