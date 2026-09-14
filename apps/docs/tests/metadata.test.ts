import { describe, expect, it } from 'vitest';
import {
  clampDescription,
  previewMetadata,
  registryEntryForSlug,
  registryJsonLd,
  registryKeywords,
  registryPageMetadata,
  rootMetadata,
  serializeJsonLd,
} from '@/lib/metadata';
import { getEntry } from '@/lib/registry';

const block = getEntry('grid-cascade')!;
const component = getEntry('glow-button')!;
const page = { path: '/block/grid-cascade', title: 'Grid Cascade' };

describe('clampDescription', () => {
  it('leaves short text alone', () => {
    expect(clampDescription('A short line.')).toBe('A short line.');
  });

  it('cuts at a word boundary and never exceeds the limit', () => {
    const text = 'word '.repeat(60);
    const clamped = clampDescription(text, 40);
    expect(clamped.length).toBeLessThanOrEqual(40);
    expect(clamped.endsWith('…')).toBe(true);
    expect(clamped).not.toMatch(/wor…$/);
  });
});

describe('registryEntryForSlug', () => {
  it('resolves component and block URLs', () => {
    expect(registryEntryForSlug(['block', 'grid-cascade'])?.name).toBe('grid-cascade');
    expect(registryEntryForSlug(['component', 'glow-button'])?.name).toBe('glow-button');
  });

  it('rejects a block name under the component section, and non-registry paths', () => {
    expect(registryEntryForSlug(['component', 'grid-cascade'])).toBeUndefined();
    expect(registryEntryForSlug(['block', 'missing'])).toBeUndefined();
    expect(registryEntryForSlug([])).toBeUndefined();
    expect(registryEntryForSlug(undefined)).toBeUndefined();
  });
});

describe('registryKeywords', () => {
  it('names the item, its kind, and the libraries it animates with', () => {
    const keywords = registryKeywords(block);
    expect(keywords).toContain('Grid Cascade');
    expect(keywords).toContain('React block');
    expect(keywords).toContain('GSAP');
  });

  it('has no duplicates', () => {
    const keywords = registryKeywords(block);
    expect(new Set(keywords).size).toBe(keywords.length);
  });
});

describe('registryPageMetadata', () => {
  it('fills the share preview with the registry description and an absolute URL', () => {
    const metadata = registryPageMetadata(block, page);

    expect(metadata.title).toBe('Grid Cascade');
    expect(String(metadata.description).length).toBeLessThanOrEqual(160);
    expect(metadata.openGraph).toMatchObject({
      title: 'Grid Cascade — Animated React Block',
      url: 'https://tweenui.dev/block/grid-cascade',
    });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
    expect(metadata.alternates?.canonical).toBe('https://tweenui.dev/block/grid-cascade');
  });

  it('labels components as components', () => {
    const metadata = registryPageMetadata(component, {
      path: '/component/glow-button',
      title: 'Glow Button',
    });
    expect(metadata.openGraph).toMatchObject({ title: 'Glow Button — Animated React Component' });
  });
});

describe('previewMetadata', () => {
  it('keeps the preview out of the index and canonicalises to the doc page', () => {
    const metadata = previewMetadata(block);
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates?.canonical).toBe('https://tweenui.dev/block/grid-cascade');
  });
});

describe('rootMetadata', () => {
  it('declares the icon set and manifest', () => {
    const metadata = rootMetadata();
    expect(metadata.manifest).toBe('/site.webmanifest');
    expect(JSON.stringify(metadata.icons)).toContain('/favicon.ico');
    expect(JSON.stringify(metadata.icons)).toContain('/apple-touch-icon.png');
  });
});

describe('registryJsonLd', () => {
  it('describes the item as source code with a breadcrumb trail', () => {
    const [code, breadcrumb] = registryJsonLd(block);
    expect(code).toMatchObject({ '@type': 'SoftwareSourceCode', name: 'Grid Cascade' });
    expect(breadcrumb).toMatchObject({ '@type': 'BreadcrumbList' });
  });

  it('escapes < so the payload cannot close its script tag', () => {
    expect(serializeJsonLd({ text: '</script><b>' })).not.toContain('</script>');
  });
});
