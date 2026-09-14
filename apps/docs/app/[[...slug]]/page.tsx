import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { compileMdxFile, createPageMetadata, DocsPage, DocsPager, LandingLayout } from 'docora';
import { LandingPage } from '@/components/landing/landing-page';
import { DocsShell } from '@/components/layout/docs-shell';
import { mdxComponents } from '@/components/mdx/registry-components';
import docsConfig from '@/docs.config';
import { fetchStarCount } from '@/lib/github';
import {
  registryEntryForSlug,
  registryJsonLd,
  registryPageMetadata,
  serializeJsonLd,
} from '@/lib/metadata';
import { source } from '@/lib/source';

type PageProps = Readonly<{
  params: Promise<{ slug?: string[] }>;
}>;

const isLanding = (slug: string[] | undefined): boolean => slug === undefined || slug.length === 0;

export async function generateStaticParams() {
  return [{ slug: [] }, ...(await source.getStaticParams())];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (isLanding(slug)) {
    return {
      title: { absolute: `${docsConfig.site.name} — ${docsConfig.site.description}` },
      description: docsConfig.site.description,
    };
  }

  const page = await source.getPage(slug);
  if (!page) return {};

  const entry = registryEntryForSlug(slug);
  return entry
    ? registryPageMetadata(entry, page)
    : createPageMetadata({ config: docsConfig, page });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const starCount = await fetchStarCount(docsConfig.github?.url);
  if (isLanding(slug)) return <LandingPage starCount={starCount} />;

  const page = await source.getPage(slug);
  if (!page) notFound();

  const { content, frontmatter, toc } = await compileMdxFile(page.filePath, {
    components: mdxComponents,
  });

  if (frontmatter.layout === 'landing') {
    return (
      <LandingLayout>
        <DocsPage>{content}</DocsPage>
      </LandingLayout>
    );
  }

  const { prev, next } = await source.getSurround(page.path);
  const section = await source.getSection(page.path);

  // Block pages are single-preview showcases — their headings are boilerplate
  // (Installation / Usage / Props). An empty toc drops the right rail, so the
  // preview column reclaims its 240px + gap.
  const isBlock = slug?.[0] === 'block';
  const entry = registryEntryForSlug(slug);

  return (
    <DocsShell
      toc={isBlock ? [] : toc}
      page={{ relativePath: page.relativePath, title: page.title }}
      starCount={starCount}
    >
      {entry && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(registryJsonLd(entry)) }}
        />
      )}
      <DocsPage title={frontmatter.title} description={frontmatter.description} section={section}>
        {content}
      </DocsPage>
      <DocsPager prev={prev} next={next} />
    </DocsShell>
  );
}
