import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  registriesSnippet,
  REGISTRY_LISTED,
  registryItemRef,
  registryItemUrl,
  registryMapping,
  shadcnAddCommands,
  shadcnAddOneLiner,
  shadcnRegistryAddCommands,
} from '@/components/mdx/command-tabs';
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
    expect(registryItemUrl('@tween-ui/shiny-button')).toBe(`${siteConfig.url}/r/shiny-button.json`);
  });

  it('namespaces an item name and passes URLs and other namespaces through', () => {
    expect(registryItemRef('shiny-button')).toBe('@tween-ui/shiny-button');
    expect(registryItemRef('@tween-ui/shiny-button')).toBe('@tween-ui/shiny-button');
    expect(registryItemRef('@shadcn/button')).toBe('@shadcn/button');
    expect(registryItemRef(`${siteConfig.url}/r/shiny-button.json`)).toBe(
      `${siteConfig.url}/r/shiny-button.json`
    );
  });

  it('maps the namespace to the item URL template the CLI expands', () => {
    expect(JSON.parse(registriesSnippet)).toEqual({
      registries: { '@tween-ui': `${siteConfig.url}/r/{name}.json` },
    });
  });

  it('pairs the namespace with the item URL template for `registry add`', () => {
    expect(registryMapping).toBe(`@tween-ui=${siteConfig.url}/r/{name}.json`);
  });

  it('adds every registry item in one command for each package manager', () => {
    const commands = shadcnAddCommands(['shiny-button', 'image-fan-slider']);
    const items = '@tween-ui/shiny-button @tween-ui/image-fan-slider';
    expect(commands).toEqual({
      npm: `npx shadcn@latest add ${items}`,
      pnpm: `pnpm dlx shadcn@latest add ${items}`,
      yarn: `yarn dlx shadcn@latest add ${items}`,
      bun: `bunx shadcn@latest add ${items}`,
    });
  });

  // The mapping is per project, so it lives on the setup guide — never
  // repeated on an item page, and never bundled into an install command.
  it('keeps the one-time registry add out of the install commands', () => {
    const setup = shadcnRegistryAddCommands();
    expect(setup).toEqual({
      npm: `npx shadcn@latest registry add "${registryMapping}"`,
      pnpm: `pnpm dlx shadcn@latest registry add "${registryMapping}"`,
      yarn: `yarn dlx shadcn@latest registry add "${registryMapping}"`,
      bun: `bunx shadcn@latest registry add "${registryMapping}"`,
    });
    for (const command of Object.values(shadcnAddCommands(['shiny-button']))) {
      expect(command).not.toContain('registry add');
      expect(command).not.toContain('\n');
    }
  });

  // The landing CTA is a single-line pill with no room to send people to
  // the setup guide first, so its command has to work on a first paste.
  it('keeps the one-liner installable without the namespace mapping', () => {
    const commands = shadcnAddOneLiner('icon-trail-button');
    for (const command of Object.values(commands)) {
      expect(command).not.toContain('\n');
      expect(command).not.toContain('registry add');
    }
    expect(commands.npm).toBe('npx shadcn@latest add @tween-ui/icon-trail-button');
  });

  // Listed at ui.shadcn.com/r/registries.json, so the CLI resolves @tween-ui
  // with no mapping and the setup pointers under each install tab drop away.
  it('treats the namespace as listed upstream', () => {
    expect(REGISTRY_LISTED).toBe(true);
  });

  it('documents the one-time setup on its own page', () => {
    const setupPage = readFileSync(
      join(appRoot, 'content', '0.installation', '1.setup-guide.mdx'),
      'utf8'
    );
    expect(setupPage).toContain('::registry-setup');
    expect(setupPage).toContain(registriesSnippet.split('\n')[2]?.trim());
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
