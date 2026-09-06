import type { ComponentType } from 'react';
import { ComponentGallery } from './component-gallery';
import { ComponentPreview } from './component-preview';
import { ComponentSource } from './component-source';
import { InstallTabs } from './install-tabs';
import { OpenIn } from './open-in';

/**
 * Custom MDC components merged into Docora's default set via compileMdxFile.
 * Keys are kebab-case MDC tags: `::component-preview{name="button"}`.
 */
export const mdxComponents: Record<string, ComponentType<Record<string, unknown>>> = {
  'component-preview': ComponentPreview as ComponentType<Record<string, unknown>>,
  'component-source': ComponentSource as ComponentType<Record<string, unknown>>,
  'install-tabs': InstallTabs as ComponentType<Record<string, unknown>>,
  'component-gallery': ComponentGallery as ComponentType<Record<string, unknown>>,
  'open-in': OpenIn as ComponentType<Record<string, unknown>>,
};
