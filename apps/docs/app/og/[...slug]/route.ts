import { listOgImagePages } from '@/lib/og-image/og-image-pages';
import { ogImagePath } from '@/lib/og-image/og-image-params';
import { renderOgImage } from '@/lib/og-image/render-og-image';

type OgImageContext = Readonly<{
  params: Promise<{ slug: string[] }>;
}>;

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await listOgImagePages();
  return pages.map((page) => ({ slug: ogImagePath(page.path).split('/').slice(2) }));
}

export async function GET(_request: Request, { params }: OgImageContext) {
  const imagePath = `/og/${(await params).slug.join('/')}`;
  const pages = await listOgImagePages();
  const page = pages.find((candidate) => ogImagePath(candidate.path) === imagePath);
  if (!page) return new Response('Not found', { status: 404 });
  return renderOgImage(page.params);
}
