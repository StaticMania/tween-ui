import type { Metadata, Viewport } from 'next';
import { createPageMetadata, createRootMetadata } from 'docora';
import { siteConfig } from '@/config/site';
import docsConfig from '@/docs.config';
import { buildOgImageUrl } from '@/lib/og-image/og-image-params';
import { getEntry, hrefFor } from '@/registry/index';
import type { RegistryEntry } from '@/registry/schema';

/** Search engines cut meta descriptions around here. */
const DESCRIPTION_LIMIT = 160;

/** Human names for the npm packages a registry item can depend on. */
const DEPENDENCY_KEYWORDS: Record<string, string> = {
  gsap: 'GSAP',
  '@gsap/react': 'GSAP',
  '@number-flow/react': 'Number Flow',
  swiper: 'Swiper',
};

const absolute = (path: string) => new URL(path, siteConfig.url).toString();

/** Trim to the last whole word under the limit, so a snippet never ends mid-word. */
export function clampDescription(text: string, limit = DESCRIPTION_LIMIT): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;

  const cut = clean.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\s—-]+$/, '')}…`;
}

const kindLabel = (entry: RegistryEntry) => (entry.type === 'block' ? 'Block' : 'Component');

/**
 * The registry item a doc URL is about, if any. `/component/<name>` and
 * `/block/<name>` resolve; anything else (the landing page, future guides)
 * does not, and falls back to plain page metadata.
 */
export function registryEntryForSlug(slug: string[] | undefined): RegistryEntry | undefined {
  if (!slug || slug.length !== 2) return undefined;
  const [section, name] = slug;
  const entry = name ? getEntry(name) : undefined;
  if (!entry) return undefined;
  return (section === 'block') === (entry.type === 'block') ? entry : undefined;
}

/**
 * Keywords for one item: the site-wide set plus what makes this item findable —
 * its name, whether it is a component or a block, and the libraries it animates
 * with.
 */
export function registryKeywords(entry: RegistryEntry): string[] {
  const fromDependencies = entry.dependencies
    .map((dependency) => DEPENDENCY_KEYWORDS[dependency])
    .filter((keyword): keyword is string => Boolean(keyword));

  return [
    ...new Set([
      entry.title,
      `React ${kindLabel(entry).toLowerCase()}`,
      `${entry.title} React`,
      `animated ${kindLabel(entry).toLowerCase()}`,
      ...fromDependencies,
      ...siteConfig.keywords,
    ]),
  ];
}

/** Site-wide defaults for the root layout: docora's base plus icons and crawl rules. */
export function rootMetadata(): Metadata {
  return {
    ...createRootMetadata(docsConfig),
    applicationName: siteConfig.name,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.name, url: siteConfig.links.github }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: 'technology',
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

/** Browser chrome colour, matching the brand tile in the icon. */
export const rootViewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
};

/**
 * Metadata for a component or block doc page — the link people share. Builds on
 * docora's page metadata (canonical, Open Graph, Twitter card, generated OG
 * image) and swaps in the registry's fuller description and item keywords, so
 * a pasted link previews what the thing actually does.
 */
export function registryPageMetadata(
  entry: RegistryEntry,
  page: Parameters<typeof createPageMetadata>[0]['page']
): Metadata {
  const base = createPageMetadata({ config: docsConfig, page });
  const description = clampDescription(entry.description);
  const title = `${entry.title} — Animated React ${kindLabel(entry)}`;
  const ogImage = buildOgImageUrl({ title: entry.title, description, kind: entry.type });

  return {
    ...base,
    title: entry.title,
    description,
    keywords: registryKeywords(entry),
    category: 'technology',
    openGraph: {
      ...base.openGraph,
      title,
      description,
      url: absolute(hrefFor(entry)),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      ...base.twitter,
      title,
      description,
      images: [ogImage],
    },
  };
}

/**
 * The bare full-screen preview. It renders the same block as the doc page, so
 * point search engines at the doc page and keep this one out of the index.
 */
export function previewMetadata(entry: RegistryEntry): Metadata {
  return {
    title: `${entry.title} preview`,
    description: clampDescription(entry.description),
    alternates: { canonical: absolute(hrefFor(entry)) },
    robots: { index: false, follow: true },
  };
}

/**
 * schema.org structured data for a doc page: the item as source code, plus the
 * breadcrumb trail. Lets search results show the trail instead of a raw URL.
 */
export function registryJsonLd(entry: RegistryEntry) {
  const url = absolute(hrefFor(entry));
  const section = entry.type === 'block' ? 'Blocks' : 'Components';

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: entry.title,
      description: entry.description,
      url,
      codeRepository: siteConfig.repo,
      programmingLanguage: ['TypeScript', 'React'],
      runtimePlatform: 'React',
      keywords: registryKeywords(entry).join(', '),
      isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: siteConfig.url },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: siteConfig.name, item: siteConfig.url },
        { '@type': 'ListItem', position: 2, name: section },
        { '@type': 'ListItem', position: 3, name: entry.title, item: url },
      ],
    },
  ];
}

/**
 * Serialises JSON-LD for a `<script>` tag. `<` is escaped so a description can
 * never close the tag early.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
