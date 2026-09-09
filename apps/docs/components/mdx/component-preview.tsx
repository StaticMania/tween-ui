'use client';

import { useState, type ReactNode } from 'react';
import { Check, Code2, Copy, Eye, RotateCw } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { getEntry } from '@/lib/registry';
import { cn, copyText } from '@/lib/utils';
import { getDemo } from '@/registry/__index__.generated';
import { usage } from '@/registry/__sources__.generated';
import { ReactMark } from './brand-icons';
import { OpenIn } from './open-in';
import { plainSnippet } from './snippet';

type Tab = 'preview' | 'code';

export function ComponentPreview({
  name,
  variant: variantProp,
  size = 'default',
}: {
  name: string;
  variant?: string;
  size?: 'default' | 'lg' | 'xl';
}) {
  const entry = getEntry(name);
  const locked = entry?.variants.some((v) => v.id === variantProp) ? variantProp : undefined;
  const [variant, setVariant] = useState(locked ?? entry?.variants[0]?.id ?? '');
  const [tab, setTab] = useState<Tab>('preview');
  const [replay, setReplay] = useState(0);
  const [copied, setCopied] = useState(false);

  const Demo = getDemo(name, variant);

  if (!entry) {
    return (
      <div className="border-border text-muted-foreground my-5 rounded-lg border border-dashed p-4 text-sm">
        Unknown component: <code>{name}</code>. Run <code>pnpm registry:build</code>.
      </div>
    );
  }

  const isBlock = entry.type === 'block';
  const use =
    usage[name]?.react ?? (entry.usage.react ? plainSnippet(entry.usage.react) : undefined);

  const copy = async () => {
    if (!use) return;
    await copyText(use.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="border-border my-6 overflow-hidden rounded-xl border">
      {/* toolbar: variants + open-in */}
      <div className="border-border flex flex-wrap items-center gap-2 border-b px-3 py-2">
        {!locked && entry.variants.length > 1 && (
          <div className="flex flex-wrap items-center gap-1">
            {entry.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  variant === v.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-highlighted hover:bg-muted'
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
        <div className="ml-auto">
          <OpenIn
            name={name}
            title={entry.title}
            githubHref={`${siteConfig.repo}/blob/main/${siteConfig.registryPath}/${name}.tsx`}
          />
        </div>
      </div>

      {/* tabs */}
      <div className="border-border flex items-center gap-1 border-b px-3">
        <TabButton
          active={tab === 'preview'}
          onClick={() => setTab('preview')}
          icon={<Eye className="size-4" />}
        >
          Preview
        </TabButton>
        <TabButton
          active={tab === 'code'}
          onClick={() => setTab('code')}
          icon={<Code2 className="size-4" />}
        >
          Code
        </TabButton>
      </div>

      {tab === 'preview' ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setReplay((n) => n + 1)}
            title="Replay"
            className="text-muted-foreground hover:text-highlighted border-border bg-background/70 absolute top-2 right-2 z-10 inline-flex size-8 items-center justify-center rounded-md border backdrop-blur transition-colors"
          >
            <RotateCw className="size-4" />
          </button>
          <div
            className={cn(
              'overflow-hidden bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]',
              isBlock
                ? 'h-auto'
                : size === 'xl'
                  ? 'h-[560px]'
                  : size === 'lg'
                    ? 'h-[400px]'
                    : 'h-[320px]'
            )}
          >
            {Demo ? (
              <div
                key={replay}
                className={cn(
                  isBlock ? 'block h-auto w-full min-w-0' : 'grid h-full w-full place-items-center',
                  !isBlock && (size === 'xl' ? 'p-2' : size === 'lg' ? 'p-5' : 'p-10')
                )}
              >
                <Demo />
              </div>
            ) : (
              <div className="grid h-full w-full place-items-center">
                <span className="text-muted-foreground text-sm">No preview.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3">
          <div className="overflow-hidden rounded-lg bg-[#0d1117]">
            {/* framework label + copy */}
            <div className="flex items-center justify-end gap-1 border-b border-white/10 px-2 py-1.5">
              <span className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-white/80">
                <ReactMark className="size-4" />
                React
              </span>
              <button
                type="button"
                onClick={copy}
                title="Copy code"
                className="inline-flex size-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </div>
            {use ? (
              <div
                className="tween-code overflow-auto p-4 text-[13px] leading-relaxed [&_pre]:!bg-transparent"
                dangerouslySetInnerHTML={{ __html: use.codeHtml }}
              />
            ) : (
              <div className="text-muted-foreground p-4 text-sm">No usage snippet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px flex items-center gap-1.5 border-b-2 px-2.5 py-2 text-sm transition-colors',
        active
          ? 'border-primary text-primary'
          : 'text-muted-foreground hover:text-highlighted border-transparent'
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export default ComponentPreview;
