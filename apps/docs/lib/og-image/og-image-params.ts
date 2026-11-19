import { siteConfig } from '@/config/site';

export type OgImageKind = 'component' | 'block';

export type OgImageParams = Readonly<{
  title: string;
  description: string;
  kind: OgImageKind | undefined;
}>;

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 130;
const OG_IMAGE_DIR = '/og';

export function toOgImageParams({
  title,
  description,
  kind,
}: {
  title?: string;
  description?: string;
  kind?: string;
}): OgImageParams {
  return {
    title: clampText(title ?? siteConfig.name, TITLE_LIMIT),
    description: clampText(description ?? siteConfig.description, DESCRIPTION_LIMIT),
    kind: kind === 'component' || kind === 'block' ? kind : undefined,
  };
}

export function ogImagePath(pagePath: string): string {
  const slug = pagePath.replace(/^\/+|\/+$/g, '') || 'index';
  return `${OG_IMAGE_DIR}/${slug}.png`;
}

export function buildOgImageUrl(pagePath: string): string {
  return new URL(ogImagePath(pagePath), siteConfig.url).toString();
}

export function isSiteTitle(title: string): boolean {
  return title === siteConfig.name;
}

function clampText(text: string, limit: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;

  const cut = clean.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\s—-]+$/, '')}…`;
}
