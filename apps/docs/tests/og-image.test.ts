import { describe, expect, it } from 'vitest';
import { siteConfig } from '@/config/site';
import { buildOgImageUrl, isSiteTitle, parseOgImageParams } from '@/lib/og-image/og-image-params';

describe('parseOgImageParams', () => {
  it('falls back to the site name and description', () => {
    const params = parseOgImageParams(new URLSearchParams());
    expect(params).toEqual({
      title: siteConfig.name,
      description: siteConfig.description,
      kind: undefined,
    });
    expect(isSiteTitle(params.title)).toBe(true);
  });

  it('accepts only known kinds', () => {
    expect(parseOgImageParams(new URLSearchParams('kind=block')).kind).toBe('block');
    expect(parseOgImageParams(new URLSearchParams('kind=component')).kind).toBe('component');
    expect(parseOgImageParams(new URLSearchParams('kind=<script>')).kind).toBeUndefined();
  });

  it('clamps long text at a word boundary', () => {
    const params = parseOgImageParams(
      new URLSearchParams({ title: 'word '.repeat(40), description: 'word '.repeat(80) })
    );
    expect(params.title.length).toBeLessThanOrEqual(60);
    expect(params.description.length).toBeLessThanOrEqual(130);
    expect(params.description.endsWith('…')).toBe(true);
  });
});

describe('buildOgImageUrl', () => {
  it('round-trips through the parser on the site origin', () => {
    const url = new URL(
      buildOgImageUrl({ title: 'Grid Cascade', description: 'Cards fall in.', kind: 'block' })
    );
    expect(url.origin).toBe(new URL(siteConfig.url).origin);
    expect(url.pathname).toBe('/og');
    expect(parseOgImageParams(url.searchParams)).toEqual({
      title: 'Grid Cascade',
      description: 'Cards fall in.',
      kind: 'block',
    });
  });
});
