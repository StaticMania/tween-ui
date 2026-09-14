import { siteConfig } from '@/config/site';

export type OgImageKind = 'component' | 'block';

export type OgImageParams = Readonly<{
  title: string;
  description: string;
  kind: OgImageKind | undefined;
}>;

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 130;
const OG_IMAGE_PATH = '/og';

export function parseOgImageParams(searchParams: URLSearchParams): OgImageParams {
  const kind = searchParams.get('kind');

  return {
    title: clampText(searchParams.get('title') ?? siteConfig.name, TITLE_LIMIT),
    description: clampText(
      searchParams.get('description') ?? siteConfig.description,
      DESCRIPTION_LIMIT
    ),
    kind: kind === 'component' || kind === 'block' ? kind : undefined,
  };
}

export function buildOgImageUrl({ title, description, kind }: OgImageParams): string {
  const query = new URLSearchParams({ title, description });
  if (kind) query.set('kind', kind);
  return new URL(`${OG_IMAGE_PATH}?${query.toString()}`, siteConfig.url).toString();
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
