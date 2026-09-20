'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDocsConfig } from 'docora';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { copyText } from '@/lib/utils';
import IconTrailButton from '@/registry/tweenui/icon-trail-button';
import { RevealGroup } from './reveal-group';

const COPIED_MS = 1600;

export function Cta() {
  const config = useDocsConfig();
  const [isCopied, setIsCopied] = useState(false);

  const siteUrl = config.site.url ?? '';
  const installCommand = `npx shadcn@latest add ${siteUrl}/r/icon-trail-button.json`;

  const handleCopy = async () => {
    if (!(await copyText(installCommand))) return;
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), COPIED_MS);
  };

  return (
    <section aria-labelledby="cta-title" className="px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="bg-tween-ink stage-grid relative overflow-hidden rounded-2xl py-20 text-white sm:rounded-3xl sm:py-28 dark:ring-1 dark:ring-white/10">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(159,212,214,0.22),transparent)]"
        />

        <RevealGroup className="main-container relative flex flex-col items-center text-center">
          <h2
            data-reveal-text
            id="cta-title"
            className="text-[36px] leading-[1.05] font-medium tracking-[-0.03em] text-balance text-white md:text-5xl lg:text-[56px]"
          >
            Start with one file.
          </h2>
          <p
            data-reveal-text
            className="mt-5 max-w-[520px] text-[15px] leading-relaxed text-pretty text-white/70 sm:text-base md:text-[17px]"
          >
            Pick a component, run the command, keep the code.
          </p>

          <div
            data-reveal
            className="border-tween-teal-soft/20 mt-9 flex w-full max-w-[620px] items-center gap-3 rounded-xl border bg-white/[0.04] py-2 pr-2 pl-4 text-left font-mono text-xs text-white/85 sm:h-12 sm:py-0 sm:text-[13px]"
          >
            <span aria-hidden="true" className="text-tween-lime">
              $
            </span>
            <code className="min-w-0 flex-1 break-all sm:truncate">{installCommand}</code>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={isCopied ? 'Copied' : 'Copy install command'}
              className="text-tween-teal-soft focus-visible:ring-tween-lime grid size-8 shrink-0 place-items-center rounded-lg transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              {isCopied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <div
            data-reveal
            className="mt-10 flex w-full max-w-72 flex-col gap-3 sm:mt-9 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4"
          >
            <IconTrailButton href="/components" className="w-full justify-center sm:w-auto">
              Browse components
            </IconTrailButton>
            <Link
              href="/components#blocks"
              className="group text-tween-lime focus-visible:ring-tween-lime inline-flex h-12 items-center justify-center gap-2 rounded-full px-2 text-base font-medium transition-colors hover:text-white focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              Browse blocks
              <ArrowRight
                className="ease-tween size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
