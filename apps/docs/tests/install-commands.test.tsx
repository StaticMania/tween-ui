import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { registryItemUrl, shadcnAddCommands } from '@/components/mdx/command-tabs';
import { siteConfig } from '@/config/site';
import { registry } from '@/lib/registry';

const appRoot = process.cwd();

const installTabItems = ['1.component', '2.block'].flatMap((dir) =>
  readdirSync(join(appRoot, 'content', dir))
    .filter((file) => file.endsWith('.mdx'))
    .flatMap((file) =>
      [
        ...readFileSync(join(appRoot, 'content', dir, file), 'utf8').matchAll(
          /::install-tabs\{item="([^"]+)"\}/g
        ),
      ].map((match) => ({ file, item: match[1] }))
    )
);

describe('install commands', () => {
  it('builds an absolute registry item URL from a name', () => {
    expect(registryItemUrl('shiny-button')).toBe(`${siteConfig.url}/r/shiny-button.json`);
    expect(registryItemUrl('@tweenui/shiny-button')).toBe(`${siteConfig.url}/r/shiny-button.json`);
  });

  it('adds every registry item in one command for each package manager', () => {
    const commands = shadcnAddCommands(['shiny-button', 'image-fan-slider']);
    const items = `${siteConfig.url}/r/shiny-button.json ${siteConfig.url}/r/image-fan-slider.json`;
    expect(commands).toEqual({
      npm: `npx shadcn@latest add ${items}`,
      pnpm: `pnpm dlx shadcn@latest add ${items}`,
      yarn: `yarn dlx shadcn@latest add ${items}`,
      bun: `bunx shadcn@latest add ${items}`,
    });
  });

  it('gives every registry entry a docs page with an install command', () => {
    const names = installTabItems.map(({ item }) => item);
    for (const entry of registry) {
      expect(names, `no install-tabs for ${entry.name}`).toContain(entry.name);
    }
  });

  for (const { file, item } of installTabItems) {
    it(`${file} installs a registry item that is generated at public/r`, () => {
      expect(item).toMatch(/^[a-z0-9-]+$/);
      expect(existsSync(join(appRoot, 'public', 'r', `${item}.json`))).toBe(true);
    });
  }
});
