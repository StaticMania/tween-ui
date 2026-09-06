'use client';

import { useState } from 'react';
import { Check, ChevronsDownUp, ChevronsUpDown, Copy } from 'lucide-react';
import { cn, copyText } from '@/lib/utils';

export function CodeBlock({
  code,
  codeHtml,
  filename,
  collapsible = false,
}: {
  code: string;
  codeHtml: string;
  filename?: string;
  collapsible?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const canCollapse = collapsible && code.trimEnd().split('\n').length > 16;

  const copy = async () => {
    await copyText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const CopyBtn = ({ className }: { className?: string }) => (
    <button
      type="button"
      onClick={copy}
      title="Copy code"
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white',
        className
      )}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg bg-[#0d1117]">
      {filename && (
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
          <span className="font-mono text-xs text-white/60">{filename}</span>
          <CopyBtn />
        </div>
      )}
      <div className="relative">
        {!filename && <CopyBtn className="absolute top-2 right-2 z-10 bg-white/5 backdrop-blur" />}
        <div
          className={cn(
            'tween-code overflow-auto p-4 text-[13px] leading-relaxed [&_pre]:!bg-transparent',
            canCollapse && !expanded ? 'max-h-[280px] overflow-hidden' : 'max-h-[600px]'
          )}
          dangerouslySetInnerHTML={{ __html: codeHtml }}
        />
        {canCollapse && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="absolute inset-x-0 bottom-0 flex h-24 items-end justify-center gap-1.5 bg-gradient-to-b from-transparent to-[#0d1117] pb-3 text-xs font-medium text-white/70 transition-colors hover:text-white"
          >
            <ChevronsUpDown className="size-3.5" /> Expand
          </button>
        )}
      </div>
      {canCollapse && expanded && (
        <div className="flex justify-center border-t border-white/10 py-1.5">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex items-center gap-1.5 text-xs font-medium text-white/60 transition-colors hover:text-white"
          >
            <ChevronsDownUp className="size-3.5" /> Collapse
          </button>
        </div>
      )}
    </div>
  );
}

export default CodeBlock;
