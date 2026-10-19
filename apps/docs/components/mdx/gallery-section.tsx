import type { ReactNode } from 'react';

/**
 * Section heading for the gallery. `not-prose` opts the gallery out of docora's
 * typography, so the heading sets its own — matching the site's display style
 * (Outfit medium, tight tracking) rather than the small uppercase label it used
 * to be, which read as a form field next to the intro paragraph.
 */
export const GallerySection = ({
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
}) => {
  return (
    <section {...rest}>
      <div className="border-border mb-6 flex items-baseline gap-3 border-b pb-3">
        <h2 className="text-highlighted text-xl font-medium tracking-[-0.02em]">{title}</h2>
        <span className="text-dimmed font-mono text-xs tabular-nums">{count}</span>
      </div>
      {children}
    </section>
  );
};
