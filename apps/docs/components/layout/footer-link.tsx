import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export type FooterLinkItem = { label: string; href: string; external?: boolean };

export const FooterLink = ({ link }: Readonly<{ link: FooterLinkItem }>) => {
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
};
