import { describe, expect, it } from 'vitest';
import { isNewHref, isNewItem, NEW_LIMIT, newestNames, newestOfType } from '@/lib/new-items';
import { registry } from '@/lib/registry';
import type { RegistryEntry, RegistryType } from '@/registry/schema';

const item = (name: string, type: RegistryType, addedAt: string) =>
  ({ name, type, addedAt }) as RegistryEntry;

const names = (entries: RegistryEntry[]) => entries.map((entry) => entry.name);

describe('newestOfType', () => {
  it('keeps the newest four, newest first', () => {
    const entries = [
      item('a', 'component', '2026-01-01'),
      item('b', 'component', '2026-01-05'),
      item('c', 'component', '2026-01-03'),
      item('d', 'component', '2026-01-04'),
      item('e', 'component', '2026-01-02'),
    ];

    expect(names(newestOfType(entries, 'component'))).toEqual(['b', 'd', 'c', 'e']);
  });

  it('drops the oldest of the four when a fifth item is added', () => {
    const four = [
      item('one', 'block', '2026-02-01'),
      item('two', 'block', '2026-02-02'),
      item('three', 'block', '2026-02-03'),
      item('four', 'block', '2026-02-04'),
    ];
    expect(names(newestOfType(four, 'block'))).toContain('one');

    const five = [...four, item('five', 'block', '2026-02-05')];
    expect(names(newestOfType(five, 'block'))).toEqual(['five', 'four', 'three', 'two']);
  });

  it('breaks a same-day tie by registry order, the later entry being newer', () => {
    const entries = [
      item('old', 'block', '2026-03-01'),
      item('first-today', 'block', '2026-03-09'),
      item('second-today', 'block', '2026-03-09'),
    ];

    expect(names(newestOfType(entries, 'block', 2))).toEqual(['second-today', 'first-today']);
  });

  it('counts components and blocks separately', () => {
    const entries = [
      ...['a', 'b', 'c', 'd', 'e'].map((n, i) => item(`c-${n}`, 'component', `2026-04-0${i + 1}`)),
      item('b-old', 'block', '2025-01-01'),
    ];

    const picked = newestNames(entries);
    expect(picked.size).toBe(5);
    expect(picked.has('b-old')).toBe(true);
    expect(picked.has('c-a')).toBe(false);
  });
});

describe('the live registry', () => {
  for (const type of ['component', 'block'] as const) {
    it(`badges exactly ${NEW_LIMIT} ${type}s, the newest ones`, () => {
      const ofType = registry.filter((entry) => entry.type === type);
      const badged = ofType.filter((entry) => isNewItem(entry.name));
      expect(badged).toHaveLength(Math.min(NEW_LIMIT, ofType.length));

      const newestBadged = Math.min(...badged.map((entry) => Date.parse(entry.addedAt)));
      for (const entry of ofType.filter((e) => !isNewItem(e.name))) {
        expect(Date.parse(entry.addedAt)).toBeLessThanOrEqual(newestBadged);
      }
    });
  }

  it('answers by doc URL as well as by name', () => {
    const [entry] = newestOfType(registry, 'block', 1);
    expect(entry).toBeDefined();
    expect(isNewHref(`/block/${entry!.name}`)).toBe(true);
    expect(isNewHref(`/component/${entry!.name}`)).toBe(false);
  });
});
