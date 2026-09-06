'use client';

import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import { usePathname } from 'next/navigation';
import { Check, ChevronDown, Copy, FileText, Wand2 } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn, copyText } from '@/lib/utils';
import { ClaudeMark, CursorMark, GithubMark, OpenAIMark, T3Mark } from './brand-icons';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type OpenInProps = {
  /** Registry component name, e.g. "animated-sliding-button". */
  name: string;
  title: string;
  /** Link to the component's source folder on GitHub. */
  githubHref?: string;
};

/** Docora serves raw markdown at /raw/<slug>.md ( /raw/index.md for the home ). */
function rawUrlFor(origin: string, pathname: string) {
  const clean = pathname.replace(/\/$/, '');
  if (clean === '' || clean === '/') return `${origin}/raw/index.md`;
  return `${origin}/raw${clean}.md`;
}

function buildPrompt(rawUrl: string, title: string) {
  return (
    `I'm using Tween UI, a GSAP/CSS animated component library. ` +
    `Read ${rawUrl} — it documents the "${title}" component. ` +
    `Help me install it and customize it for my project.`
  );
}

export function OpenIn({ name, title, githubHref }: OpenInProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<'md' | 'prompt' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const origin = typeof window !== 'undefined' ? window.location.origin : siteConfig.url;
  const rawUrl = rawUrlFor(origin, pathname);
  const promptText = buildPrompt(rawUrl, title);
  const prompt = encodeURIComponent(promptText);

  const flag = (which: 'md' | 'prompt') => {
    setCopied(which);
    setTimeout(() => setCopied(null), 1600);
  };

  const copyMarkdown = async () => {
    try {
      const res = await fetch(rawUrl);
      await copyText(await res.text());
      flag('md');
    } catch {
      /* ignore */
    }
  };

  const copyPrompt = async () => {
    await copyText(promptText);
    flag('prompt');
  };

  const links: Array<{ label: string; href: string; icon: IconType }> = [
    { label: 'View as Markdown', href: rawUrl, icon: FileText },
    {
      label: 'GitHub',
      href: githubHref ?? `${siteConfig.repo}/tree/main/${siteConfig.registryPath}/${name}`,
      icon: GithubMark,
    },
    { label: 'Claude', href: `https://claude.ai/new?q=${prompt}`, icon: ClaudeMark },
    { label: 'ChatGPT', href: `https://chatgpt.com/?q=${prompt}`, icon: OpenAIMark },
    {
      label: 'Cursor',
      href: `cursor://anysphere.cursor-deeplink/prompt?text=${prompt}`,
      icon: CursorMark,
    },
    { label: 'T3 Chat', href: `https://t3.chat/new?q=${prompt}`, icon: T3Mark },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="text-muted-foreground hover:text-highlighted border-border inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors"
      >
        Open in
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="menu"
          className="border-border bg-background absolute right-0 z-30 mt-1.5 w-48 overflow-hidden rounded-lg border p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={copyMarkdown}
            className="text-muted-foreground hover:text-highlighted hover:bg-muted flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors"
          >
            {copied === 'md' ? (
              <Check className="size-4 shrink-0" />
            ) : (
              <Copy className="size-4 shrink-0" />
            )}
            {copied === 'md' ? 'Copied Markdown' : 'Copy Markdown'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={copyPrompt}
            className="text-muted-foreground hover:text-highlighted hover:bg-muted flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors"
          >
            {copied === 'prompt' ? (
              <Check className="size-4 shrink-0" />
            ) : (
              <Wand2 className="size-4 shrink-0" />
            )}
            {copied === 'prompt' ? 'Copied Prompt' : 'Copy Prompt'}
          </button>
          <div className="bg-border my-1 h-px" />
          {links.map((item) => (
            <a
              key={item.label}
              role="menuitem"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-highlighted hover:bg-muted flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors"
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default OpenIn;
