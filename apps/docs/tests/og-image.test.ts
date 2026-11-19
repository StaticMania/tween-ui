import { describe, expect, it } from 'vitest';
import { siteConfig } from '@/config/site';
import {
  buildOgImageUrl,
  isSiteTitle,
  ogImagePath,
  toOgImageParams,
} from '@/lib/og-image/og-image-params';

describe('toOgImageParams', () => {
  it('falls back to the site name and description', () => {
    const params = toOgImageParams({});
    expect(params).toEqual({
      title: siteConfig.name,
      description: siteConfig.description,
      kind: undefined,
    });
    expect(isSiteTitle(params.title)).toBe(true);
  });

  it('accepts only known kinds', () => {
    expect(toOgImageParams({ kind: 'block' }).kind).toBe('block');
    expect(toOgImageParams({ kind: 'component' }).kind).toBe('component');
    expect(toOgImageParams({ kind: '<script>' }).kind).toBeUndefined();
  });

  it('clamps long text at a word boundary', () => {
    const params = toOgImageParams({ title: 'word '.repeat(40), description: 'word '.repeat(80) });
    expect(params.title.length).toBeLessThanOrEqual(60);
    expect(params.description.length).toBeLessThanOrEqual(130);
    expect(params.description.endsWith('…')).toBe(true);
  });
});

describe('buildOgImageUrl', () => {
  it('maps a page path to its prebuilt PNG on the site origin', () => {
    expect(buildOgImageUrl('/block/grid-cascade')).toBe(
      new URL('/og/block/grid-cascade.png', siteConfig.url).toString()
    );
    expect(ogImagePath('/')).toBe('/og/index.png');
    expect(ogImagePath('/installation/setup-guide/')).toBe('/og/installation/setup-guide.png');
  });
});
