import type { NavItem } from 'docora';

/** Collect every linkable leaf page beneath the given nav items, depth-first. */
function collectLeaves(items: NavItem[]): NavItem[] {
  return items.flatMap((item) =>
    item.children && item.children.length > 0
      ? collectLeaves(item.children)
      : item.href
        ? [item]
        : []
  );
}

/**
 * Flatten each top-level section (Components, Blocks, …) so its pages sit
 * directly under the section instead of being nested inside per-category
 * folders, and append the total page count to the section label.
 *
 * The on-disk folder structure (and therefore page URLs) is untouched — this
 * only reshapes what the sidebar renders.
 */
export function flattenSections(items: NavItem[]): NavItem[] {
  return items.map((item) => {
    // Only transform section groups: no link of their own, but with children.
    if (item.href !== undefined || !item.children || item.children.length === 0) {
      return item;
    }

    const leaves = collectLeaves(item.children);
    if (leaves.length === 0) return item;

    return {
      ...item,
      label: `${item.label} (${leaves.length})`,
      children: leaves,
    };
  });
}
