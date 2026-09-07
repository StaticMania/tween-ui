/**
 * Tween UI registry types.
 * `registry.ts` is the hand-authored source of truth; `scripts/build-registry.ts`
 * reads it plus the files on disk to emit `public/r/<name>.json` (CLI format) and
 * `registry/__sources__.generated.ts` (code strings for the Code tab).
 */

export type RegistryType = 'component' | 'block';

export interface RegistryFile {
  /** Path relative to `apps/docs/` (where the source lives). */
  path: string;
  /** Where the CLI writes it in a consumer project. */
  target: string;
  /** react = .tsx/.ts source. */
  kind: 'react';
}

export interface RegistryVariant {
  /** Stable id, e.g. "green". Used as demo key `${name}:${id}`. */
  id: string;
  label: string;
  /** Source file (relative to apps/docs) shown in the React Code tab. */
  reactSource: string;
}

export interface RegistryMedia {
  /** Poster image shown at rest on the gallery card. */
  image?: string;
  /** Video played on hover (muted, looped). Added later per component. */
  video?: string;
}

export interface RegistryEntry {
  name: string;
  type: RegistryType;
  /** URL group segment, e.g. "button" → /component/button/<name>. */
  group: string;
  title: string;
  description: string;
  /** Show a "New" badge and list under the New section on the home gallery. */
  isNew?: boolean;
  /** Gallery card media slot (between title and description). */
  media?: RegistryMedia;
  /** npm deps a consumer needs (e.g. "gsap"). Empty for CSS-only. */
  dependencies: string[];
  /** Other registry items this depends on (blocks → components). */
  registryDependencies: string[];
  /** Tailwind v4 @theme tokens shipped with the component for portability. */
  cssVars: Record<string, string>;
  /** All files copied by the CLI. */
  files: RegistryFile[];
  /** Variants shown on the doc page (first is the default preview). */
  variants: RegistryVariant[];
  /** Short "how to use it" snippet shown in the Code tab and Usage section. */
  usage: {
    react: string;
  };
}
