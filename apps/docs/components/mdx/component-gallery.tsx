import type { ReactNode } from 'react';
import { registry } from '@/lib/registry';
import type { RegistryEntry } from '@/registry/schema';
import { ComponentCard } from './component-card';

/**
 * Section heading for the gallery. `not-prose` opts the gallery out of docora's
 * typography, so the heading sets its own — matching the site's display style
 * (Outfit medium, tight tracking) rather than the small uppercase label it used
 * to be, which read as a form field next to the intro paragraph.
 */
function GallerySection({
  title,
  count,
  children,
  ...rest
}: {
  title: string;
  count: number;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section {...rest}>
      <div className="border-border mb-6 flex items-baseline gap-3 border-b pb-3">
        <h2 className="text-highlighted text-xl font-medium tracking-[-0.02em]">{title}</h2>
        <span className="text-dimmed font-mono text-xs tabular-nums">{count}</span>
      </div>
      {children}
    </section>
  );
}

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3';

/** Cards read in the same order as the sidebar, which sorts by its own label. */
const byTitle = (a: RegistryEntry, b: RegistryEntry) => a.title.localeCompare(b.title);

/**
 * Gallery page. Renders the registry as cards: all components, then all blocks.
 * The newest of each wear a "New" badge on their card and in the sidebar.
 */
export function ComponentGallery() {
  const components = registry.filter((e) => e.type === 'component').sort(byTitle);
  const blocks = registry.filter((e) => e.type === 'block').sort(byTitle);

  return (
    <div className="not-prose mt-10 flex flex-col gap-14">
      <GallerySection title="All components" count={components.length}>
        <div className={GRID}>
          {components.map((entry) => (
            <ComponentCard key={entry.name} entry={entry} />
          ))}
        </div>
      </GallerySection>

      <GallerySection title="All blocks" count={blocks.length} id="blocks" className="scroll-mt-24">
        <div className={GRID}>
          {blocks.map((entry) => (
            <ComponentCard key={entry.name} entry={entry} />
          ))}
        </div>
      </GallerySection>
    </div>
  );
}

export default ComponentGallery;
