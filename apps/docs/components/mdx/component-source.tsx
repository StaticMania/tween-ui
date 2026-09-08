'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { getEntry } from '@/lib/registry';
import { cn } from '@/lib/utils';
import { cssTokens, manual } from '@/registry/__sources__.generated';
import { CodeBlock } from './code-block';
import { CommandTabs, installCommands, shadcnAddCommands } from './command-tabs';
import { plainSnippet } from './snippet';

/**
 * Manual install — numbered steps: dependencies → registry dependencies →
 * copy the single-file source (React / tokens).
 */
export function ComponentSource({ name }: { name: string }) {
  const entry = getEntry(name);
  const generated = manual[name];
  const css = cssTokens[name];
  const [tab, setTab] = useState<'react' | 'css'>('react');
  const [fetched, setFetched] = useState<typeof generated>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (generated || !entry) return;

    let cancelled = false;
    fetch(`/r/${name}.json`)
      .then((response) => (response.ok ? response.json() : null))
      .then((item: { files?: Array<{ content?: string }> } | null) => {
        const code = item?.files?.[0]?.content;
        if (cancelled) return;
        if (!code) {
          setFailed(true);
          return;
        }
        setFetched({ react: plainSnippet(code) });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [generated, entry, name]);

  const m = generated ?? fetched;

  if (!entry) {
    return (
      <div className="border-border text-muted-foreground my-3 rounded-lg border border-dashed p-4 text-sm">
        Unknown component: <code>{name}</code>. Run <code>pnpm registry:build</code>.
      </div>
    );
  }

  if (!m) {
    return (
      <div className="border-border text-muted-foreground my-3 rounded-lg border border-dashed p-4 text-sm">
        {failed ? (
          <>
            Unknown component: <code>{name}</code>. Run <code>pnpm registry:build</code>.
          </>
        ) : (
          'Loading source…'
        )}
      </div>
    );
  }

  const codeTabs = [
    {
      id: 'react' as const,
      label: 'React',
      filename: `components/tweenui/${entry.group}/${name}.tsx`,
      snippet: m.react,
    },
    ...(css
      ? [{ id: 'css' as const, label: 'globals.css', filename: 'app/globals.css', snippet: css }]
      : []),
  ];
  const active = codeTabs.find((t) => t.id === tab) ?? codeTabs[0];

  const steps: Array<{ title: string; content: ReactNode }> = [];

  if (entry.dependencies.length > 0) {
    steps.push({
      title: 'Install the following dependencies:',
      content: <CommandTabs commands={installCommands(entry.dependencies.join(' '))} />,
    });
  }

  if (entry.registryDependencies.length > 0) {
    steps.push({
      title: 'Install the following registry dependencies:',
      content: <CommandTabs commands={shadcnAddCommands(entry.registryDependencies.join(' '))} />,
    });
  }

  steps.push({
    title: 'Copy and paste the following code into your project:',
    content: (
      <div>
        {codeTabs.length > 1 && (
          <div className="mb-2 flex items-center gap-1">
            {codeTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  tab === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-highlighted hover:bg-muted'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <CodeBlock
          code={active.snippet.code}
          codeHtml={active.snippet.codeHtml}
          filename={active.filename}
          collapsible
        />
      </div>
    ),
  });

  return (
    <ol className="not-prose my-4 list-none">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="border-border relative border-l pb-8 pl-8 last:border-transparent last:pb-0"
        >
          <span className="border-border bg-muted text-muted-foreground absolute top-0 -left-3.5 flex size-7 items-center justify-center rounded-full border text-xs font-medium">
            {i + 1}
          </span>
          <h4 className="text-highlighted mb-3 pt-0.5 text-sm font-medium">{step.title}</h4>
          {step.content}
        </li>
      ))}
    </ol>
  );
}

export default ComponentSource;
