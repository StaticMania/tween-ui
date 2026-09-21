'use client';

import { useState } from 'react';
import { useDocsConfig } from 'docora';
import { Check, Copy } from 'lucide-react';
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
      <div className="bg-tween-ink bezel-on-ink relative isolate overflow-hidden rounded-[2rem] py-24 text-white sm:rounded-[2.5rem] sm:py-32 dark:ring-1 dark:ring-white/10">
        <span
          aria-hidden="true"
          className="stage-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_40%,black,transparent)]"
        />
        <span
          aria-hidden="true"
          className="stage-glow pointer-events-none absolute inset-0 -z-10 rotate-180"
        />

        <RevealGroup className="main-container flex flex-col items-center text-center">
          <p
            data-reveal
            className="text-tween-teal-soft mb-8 inline-flex rounded-full bg-white/[0.04] px-3.5 py-2 text-[10px] leading-none font-medium tracking-[0.2em] uppercase ring-1 ring-white/10"
          >
            Get started
          </p>
          <h2
            data-reveal-text
            id="cta-title"
            className="text-[40px] leading-[1] font-medium tracking-[-0.04em] text-balance text-white md:text-6xl lg:text-[72px]"
          >
            Start with one file.
          </h2>
          <p
            data-reveal-text
            className="mt-6 max-w-[32rem] text-[15px] leading-relaxed text-pretty text-white/60 sm:text-base md:text-lg"
          >
            Pick a component, run the command, keep the code.
          </p>

          <div data-reveal className="bezel-shell mt-12 w-full max-w-[40rem]">
            <div className="bezel-core flex items-center gap-3 py-2 pr-2 pl-5 text-left font-mono text-xs text-white/85 sm:text-[13px]">
              <span aria-hidden="true" className="text-tween-lime">
                $
              </span>
              <code className="min-w-0 flex-1 break-all sm:truncate">{installCommand}</code>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={isCopied ? 'Copied' : 'Copy install command'}
                className="text-tween-teal-soft hover:text-tween-ink hover:bg-tween-lime focus-visible:ring-tween-lime ease-tween grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.06] transition-[background-color,color,transform] duration-500 focus-visible:ring-2 focus-visible:outline-none active:scale-[0.96] motion-reduce:transition-none"
              >
                {isCopied ? (
                  <Check strokeWidth={1.5} className="size-4" aria-hidden="true" />
                ) : (
                  <Copy strokeWidth={1.5} className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div
            data-reveal
            className="mt-10 flex w-full max-w-72 flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4"
          >
            <IconTrailButton href="/components" className="w-full justify-center sm:w-auto">
              Browse components
            </IconTrailButton>
            <IconTrailButton
              href="/components#blocks"
              className="w-full justify-center bg-white/[0.06] text-white ring-1 ring-white/12 ring-inset sm:w-auto"
            >
              Browse blocks
            </IconTrailButton>
          </div>
        </RevealGroup>
      </div>
    </section>
  );
}
