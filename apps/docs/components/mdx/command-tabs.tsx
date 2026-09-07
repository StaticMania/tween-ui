'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn, copyText } from '@/lib/utils';

export const PMS = [
  { id: 'pnpm', label: 'pnpm' },
  { id: 'bun', label: 'bun' },
  { id: 'yarn', label: 'yarn' },
  { id: 'npm', label: 'npm' },
] as const;

export type PmId = (typeof PMS)[number]['id'];

/** Dark panel with package-manager tabs and a copy button for a single command. */
export function CommandTabs({ commands }: { commands: Record<PmId, string> }) {
  const [pm, setPm] = useState<PmId>('pnpm');
  const [copied, setCopied] = useState(false);

  const command = commands[pm];

  const copy = async () => {
    await copyText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="border-border overflow-hidden rounded-lg border bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 pl-1">
        <div className="flex">
          {PMS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPm(m.id)}
              className={cn(
                '-mb-px border-b-2 px-3 py-2 text-xs font-medium transition-colors',
                pm === m.id
                  ? 'border-white text-white'
                  : 'border-transparent text-white/50 hover:text-white/80'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          title="Copy command"
          className="mr-1.5 inline-flex size-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-white/90">{command}</code>
      </pre>
    </div>
  );
}

export function shadcnAddCommands(item: string): Record<PmId, string> {
  return {
    npm: `npx shadcn@latest add ${item}`,
    pnpm: `pnpm dlx shadcn@latest add ${item}`,
    yarn: `yarn dlx shadcn@latest add ${item}`,
    bun: `bunx shadcn@latest add ${item}`,
  };
}

export function installCommands(deps: string): Record<PmId, string> {
  return {
    npm: `npm install ${deps}`,
    pnpm: `pnpm add ${deps}`,
    yarn: `yarn add ${deps}`,
    bun: `bun add ${deps}`,
  };
}
