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
    });
  }
});
