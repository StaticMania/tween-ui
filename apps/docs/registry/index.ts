import { discoveredMedia } from './__media__.generated';
import { blocks } from './registry-blocks';
import { ui } from './registry-ui';
import type { RegistryEntry } from './schema';

/**
 * All registry items (ui + blocks + lib as they land).
 *
 * Gallery preview media is merged in from `__media__.generated`, which
 * `registry:build` fills by scanning `public/media`. An entry that sets `media`
 * by hand keeps whatever it sets — the discovered paths only fill the gaps.
 */
export const registry: RegistryEntry[] = [...ui, ...blocks].map((entry) => {
  const found = discoveredMedia[entry.name];
  if (!found) return entry;
  return { ...entry, media: { ...found, ...entry.media } };
});

export function getEntry(name: string): RegistryEntry | undefined {
  return registry.find((item) => item.name === name);
}

/**
 * Doc URLs are flat — `/component/<name>` and `/block/<name>`. `group` still
 * organises the source tree on disk (and the GitHub links), just not the URL.
 */
export function hrefFor(entry: RegistryEntry): string {
  const base = entry.type === 'block' ? 'block' : 'component';
  return `/${base}/${entry.name}`;
}
