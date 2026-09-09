import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { compileMdxFile, createPageMetadata, DocsPage, DocsPager, LandingLayout } from 'docora';
import { DocsShell } from '../../components/layout/docs-shell';
import { mdxComponents } from '../../components/mdx/registry-components';
import docsConfig from '../../docs.config';
import { source } from '../../lib/source';

type PageProps = Readonly<{
  params: Promise<{ slug?: string[] }>;
}>;

export async function generateStaticParams() {
  return source.getStaticParams();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await source.getPage((await params).slug);
  if (!page) return {};

  return createPageMetadata({ config: docsConfig, page });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
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

  return (
    <DocsShell
      toc={isBlock ? [] : toc}
      page={{ relativePath: page.relativePath, title: page.title }}
    >
      <DocsPage title={frontmatter.title} description={frontmatter.description} section={section}>
        {content}
      </DocsPage>
      <DocsPager prev={prev} next={next} />
    </DocsShell>
  );
}
