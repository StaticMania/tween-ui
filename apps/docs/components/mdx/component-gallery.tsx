import { registry } from '@/lib/registry';
import { ComponentCard } from './component-card';

/**
 * Home gallery. Renders the registry as cards, with a "New" section first
 * (like the reference layout), then all components.
 */
export function ComponentGallery() {
  const components = registry.filter((e) => e.type === 'component');
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
    </div>
  );
}

export default ComponentGallery;
