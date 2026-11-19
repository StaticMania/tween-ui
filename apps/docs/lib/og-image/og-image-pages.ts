import docsConfig from '@/docs.config';
import { clampDescription, registryEntryForSlug } from '@/lib/metadata';
import { toOgImageParams, type OgImageParams } from '@/lib/og-image/og-image-params';
import { source } from '@/lib/source';
import { hrefFor } from '@/registry/index';

export type OgImagePage = Readonly<{
  path: string;
  params: OgImageParams;
}>;

export async function listOgImagePages(): Promise<OgImagePage[]> {
  const pages: OgImagePage[] = [{ path: '/', params: toOgImageParams({}) }];

  for (const { slug } of await source.getStaticParams()) {
    const entry = registryEntryForSlug(slug);
    if (entry) {
      pages.push({
        path: hrefFor(entry),
        params: toOgImageParams({
          title: entry.title,
          description: clampDescription(entry.description),
          kind: entry.type,
        }),
      });
      continue;
    }

    const page = await source.getPage(slug);
    if (!page) continue;
    pages.push({
      path: page.path,
      params: toOgImageParams({
        title: page.title,
        description:
          page.frontmatter?.description ??
          docsConfig.seo?.description ??
          docsConfig.site.description,
      }),
    });
  }

  return pages;
}
