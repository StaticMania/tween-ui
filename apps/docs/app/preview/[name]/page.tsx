import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlockStage } from '@/components/preview/block-stage';
import { previewMetadata } from '@/lib/metadata';
import { getEntry, registry } from '@/lib/registry';
import { cn } from '@/lib/utils';

type PreviewProps = Readonly<{
  params: Promise<{ name: string }>;
}>;

export function generateStaticParams() {
  return registry.map((entry) => ({ name: entry.name }));
}

export async function generateMetadata({ params }: PreviewProps): Promise<Metadata> {
  const entry = getEntry((await params).name);
  return entry ? previewMetadata(entry) : {};
}

/**
 * Full-page view of a single registry item. Blocks are built for a 1440px page
 * but the doc preview column is roughly 1064px wide, so this is where you see
 * one at its real width.
 */
export default async function PreviewPage({ params }: PreviewProps) {
  const { name } = await params;
  const entry = getEntry(name);
  if (!entry) notFound();

  return (
    // The single `1fr` row is the whole viewport, which offers a block the
    // screen height without imposing it: `items-center` leaves a block at the
    // height its content asks for, centred as before, while one that sizes
    // itself off its parent — the kinetic ring — resolves `h-full` against the
    // row and fills the screen. Anything taller than the row still overflows
    // and scrolls as normal. A component is a single element that a column
    // would stretch edge to edge, so those stay centred and padded instead.
    <main
      className={cn(
        'min-h-svh',
        entry.type === 'component'
          ? 'flex flex-col items-center justify-center px-6'
          : 'grid grid-rows-[1fr] items-center'
      )}
    >
      <BlockStage name={entry.name} variant={entry.variants[0]?.id ?? 'default'} />
    </main>
  );
}
