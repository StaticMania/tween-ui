import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { registry } from '@/lib/registry';

// vitest runs with cwd = apps/docs
const appRoot = process.cwd();
const abs = (rel: string) => join(appRoot, rel);

describe('registry integrity', () => {
  it('has at least one entry', () => {
    expect(registry.length).toBeGreaterThan(0);
  });

  for (const entry of registry) {
    describe(entry.name, () => {
      it('declares a title and description', () => {
        expect(entry.title).toBeTruthy();
        expect(entry.description).toBeTruthy();
      });

      it('declares a cssVars object (may be empty when values are inline)', () => {
        expect(typeof entry.cssVars).toBe('object');
      });

      it('has a React file', () => {
        expect(entry.files.some((f) => f.kind === 'react')).toBe(true);
      });

      it('every declared file exists on disk', () => {
        for (const f of entry.files) {
          expect(existsSync(abs(f.path)), `missing file: ${f.path}`).toBe(true);
        }
      });

      it('every variant maps to a real react source', () => {
        expect(entry.variants.length).toBeGreaterThan(0);
        for (const v of entry.variants) {
          expect(existsSync(abs(v.reactSource)), `missing: ${v.reactSource}`).toBe(true);
        }
      });

      it('respects prefers-reduced-motion in every variant', () => {
        for (const v of entry.variants) {
          const react = readFileSync(abs(v.reactSource), 'utf8');
          expect(react, `${v.id} react`).toContain('motion-reduce:');
        }
      });

      it('has a generated CLI item at public/r', () => {
        expect(existsSync(abs(`public/r/${entry.name}.json`)), 'run pnpm registry:build').toBe(
          true
        );
      });

      it('depends only on items that exist in this registry', () => {
        for (const dep of entry.registryDependencies) {
          expect(
            registry.some((other) => other.name === dep),
            `unknown dependency: ${dep}`
          ).toBe(true);
        }
      });

      it('imports itself on its docs page from the path the CLI installs it to', () => {
        const folder = entry.type === 'block' ? '2.block' : '1.component';
        const page = readFileSync(abs(`content/${folder}/${entry.name}.mdx`), 'utf8');
        const installPath = `@/${entry.files[0]?.target.replace(/\.tsx?$/, '')}`;
        const imports = [...page.matchAll(/from '(@\/components\/tweenui\/[^']+)'/g)]
          .map((match) => match[1])
          .filter((path) => path?.endsWith(`/${entry.name}`));
        expect(imports.length).toBeGreaterThan(0);
        for (const path of imports) expect(path).toBe(installPath);
      });

      it('has a generated usage example that installs the item', () => {
        const example = JSON.parse(readFileSync(abs(`public/r/${entry.name}-demo.json`), 'utf8'));
        expect(example.type).toBe('registry:example');
        expect(example.files.length).toBeGreaterThan(0);
        expect(example.registryDependencies[0]).toMatch(new RegExp(`/r/${entry.name}\\.json$`));
      });

      it('ships registry dependencies as absolute URLs the shadcn CLI can fetch', () => {
        const item = JSON.parse(readFileSync(abs(`public/r/${entry.name}.json`), 'utf8'));
        for (const dep of item.registryDependencies) {
          expect(dep).toMatch(/^https?:\/\/.+\/r\/[a-z0-9-]+\.json$/);
        }
      });
    });
  }
});
