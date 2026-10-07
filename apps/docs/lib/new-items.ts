import { hrefFor, registry } from '@/registry/index';
import type { RegistryEntry, RegistryType } from '@/registry/schema';

/** How many items of each type wear the "New" badge at once. */
export const NEW_LIMIT = 4;

/**
 * The newest `limit` entries of one type, newest first. Ordered by `addedAt`;
 * items added the same day fall back to registry order, later entries first,
 * so the one appended last always counts as the newest. Adding a fifth item
 * therefore pushes the oldest of the four out.
 */
export function newestOfType(
  entries: readonly RegistryEntry[],
  type: RegistryType,
  limit = NEW_LIMIT
): RegistryEntry[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.type === type)
    .sort((a, b) => b.entry.addedAt.localeCompare(a.entry.addedAt) || b.index - a.index)
    .slice(0, limit)
    .map(({ entry }) => entry);
}

/** Names of the newest components and the newest blocks, `NEW_LIMIT` of each. */
export function newestNames(entries: readonly RegistryEntry[], limit = NEW_LIMIT): Set<string> {
  return new Set(
    (['component', 'block'] as const).flatMap((type) =>
      newestOfType(entries, type, limit).map((entry) => entry.name)
    )
  );
}

const NEW_NAMES = newestNames(registry);
const NEW_HREFS = new Set(registry.filter((e) => NEW_NAMES.has(e.name)).map(hrefFor));

export const isNewItem = (name: string) => NEW_NAMES.has(name);

/** Doc URL form, for the sidebar, which only knows each page by its href. */
export const isNewHref = (href: string) => NEW_HREFS.has(href);
