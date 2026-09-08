import { blocks } from './registry-blocks';
import { ui } from './registry-ui';
import type { RegistryEntry } from './schema';

/** All registry items (ui + blocks + lib as they land). */
export const registry: RegistryEntry[] = [...ui, ...blocks];

export function getEntry(name: string): RegistryEntry | undefined {
  return registry.find((item) => item.name === name);
}

export function hrefFor(entry: RegistryEntry): string {
  const base = entry.type === 'block' ? 'block' : 'component';
  return `/${base}/${entry.group}/${entry.name}`;
}
