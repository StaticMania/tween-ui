'use client';

import Link from 'next/link';
import { useDocsConfig } from 'docora';
import { GithubMark } from '@/components/icons/github-mark';
import { formatStarCount } from '@/lib/github';

export type HeaderActionsProps = Readonly<{
  /** Stargazers, or `null` when GitHub could not be reached at build time. */
  starCount: number | null;
}>;

/**
 * Header GitHub link, rendered into SiteHeader's children slot. Docora draws
 * its own theme toggle after this slot, which puts the two in the order we
 * want without any override.
 */
export function HeaderActions({ starCount }: HeaderActionsProps) {
  const config = useDocsConfig();
  const githubUrl = config.github?.url;
  if (!githubUrl) return null;

  return (
    <Link
      href={githubUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={
        starCount === null ? 'Tween UI on GitHub' : `Tween UI on GitHub, ${starCount} stars`
      }
      className="text-muted-foreground hover:bg-elevated hover:text-highlighted focus-visible:ring-ring inline-flex h-8 items-center gap-1.5 rounded-full px-2 transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
    >
      <GithubMark className="size-4 shrink-0" />
      {starCount !== null && (
        <span className="font-mono text-xs tabular-nums">{formatStarCount(starCount)}</span>
      )}
    </Link>
  );
}
