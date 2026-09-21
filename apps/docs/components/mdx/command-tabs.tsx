'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { siteConfig } from '@/config/site';
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

export const registryItemUrl = (name: string) =>
  `${siteConfig.url}/r/${name.replace(`${siteConfig.registryNamespace}/`, '')}.json`;

/** URL template users map to the namespace in their components.json. */
export const registryUrlTemplate = `${siteConfig.url}/r/{name}.json`;

/** The `registries` block a project needs once before installing by namespace. */
export const registriesSnippet = JSON.stringify(
  { registries: { [siteConfig.registryNamespace]: registryUrlTemplate } },
  null,
  2
);

/**
 * Namespaced item ref — `@tween-ui/shiny-button`. The CLI resolves it through
 * the `registries` map above; a full URL or another namespace passes through.
 */
export const registryItemRef = (name: string) =>
  /^(@|https?:)/.test(name) ? name : `${siteConfig.registryNamespace}/${name}`;

/**
 * Is the namespace listed at ui.shadcn.com/r/registries.json yet? Until it is,
 * the CLI cannot resolve `@tween-ui` on its own, so every install command
 * carries the one-time `registry add` line that maps it.
 *
 * Flip to true once the upstream directory PR merges — that drops the setup
 * line from the docs, the README snippet and the landing CTA at once.
 */
export const REGISTRY_LISTED = false;

/** `@tween-ui=https://…/r/{name}.json`, the pair `registry add` takes. */
export const registryMapping = `${siteConfig.registryNamespace}=${registryUrlTemplate}`;

const RUNNERS: Record<PmId, string> = {
  npm: 'npx shadcn@latest',
  pnpm: 'pnpm dlx shadcn@latest',
  yarn: 'yarn dlx shadcn@latest',
  bun: 'bunx shadcn@latest',
};

const byPm = (build: (runner: string) => string) =>
  Object.fromEntries(PMS.map(({ id }) => [id, build(RUNNERS[id])])) as Record<PmId, string>;

/**
 * The one-time `registry add`, which writes the namespace into the project's
 * components.json. Lives on the setup page rather than on every item page —
 * it is per project, not per component.
 */
export function shadcnRegistryAddCommands(): Record<PmId, string> {
  return byPm((runner) => `${runner} registry add "${registryMapping}"`);
}

/** Install command per package manager, by namespaced item name. */
export function shadcnAddCommands(names: string[]): Record<PmId, string> {
  const items = names.map(registryItemRef).join(' ');
  return byPm((runner) => `${runner} add ${items}`);
}

/**
 * Single line that works with no prior setup — for places with no room for the
 * mapping step, like the landing CTA. Falls back to the item URL, which the CLI
 * resolves without any `registries` entry.
 */
export function shadcnAddOneLiner(name: string): Record<PmId, string> {
  const item = REGISTRY_LISTED ? registryItemRef(name) : registryItemUrl(name);
  return byPm((runner) => `${runner} add ${item}`);
}

export function installCommands(deps: string): Record<PmId, string> {
  return {
    npm: `npm install ${deps}`,
    pnpm: `pnpm add ${deps}`,
    yarn: `yarn add ${deps}`,
    bun: `bun add ${deps}`,
  };
}
