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
    // Blocks are capped at roughly 700px tall, so most are shorter than the
    // viewport. `justify-center` settles those in the middle; anything taller
    // overflows and scrolls as normal. A block owns the full width, but a
    // component is a single element that a column would otherwise stretch edge
    // to edge, so those get centred instead.
    <main
      className={cn(
        'flex min-h-svh flex-col justify-center',
        entry.type === 'component' && 'items-center px-6'
      )}
    >
      <BlockStage name={entry.name} variant={entry.variants[0]?.id ?? 'default'} />
    </main>
  );
}
