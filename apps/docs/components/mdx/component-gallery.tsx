import { registry } from '@/lib/registry';
import { ComponentCard } from './component-card';

/**
 * Gallery page. Renders the registry as cards, with a "New" section first
 * (like the reference layout), then all components, then all blocks.
 */
export function ComponentGallery() {
  const components = registry.filter((e) => e.type === 'component');
  const blocks = registry.filter((e) => e.type === 'block');
  const newest = components.filter((e) => e.isNew);

  return (
    <div className="not-prose flex flex-col gap-10">
      {newest.length > 0 && (
        <section>
          <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
            New
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {newest.map((entry) => (
              <ComponentCard key={entry.name} entry={entry} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          All components
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {components.map((entry) => (
            <ComponentCard key={entry.name} entry={entry} />
          ))}
        </div>
      </section>

      <section id="blocks" className="scroll-mt-24">
        <h2 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          All blocks
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {blocks.map((entry) => (
            <ComponentCard key={entry.name} entry={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ComponentGallery;
