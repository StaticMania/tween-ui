/**
 * Reads registry/registry.ts + the files on disk and emits:
 *   public/r/<name>.json                 shadcn registry item (files inlined) for the CLI
 *   public/r/registry.json               index of all items
 *   registry/__sources__.generated.ts    usage snippets, single-file "manual" React code,
 *                                         and the @theme tokens block
 *
 * Run with: pnpm registry:build
 */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registryItemSchema, registrySchema } from 'shadcn/schema';
import { codeToHtml } from 'shiki';
import { siteConfig } from '../config/site';
import { registry } from '../registry/index';
import type { RegistryType } from '../registry/schema';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..'); // apps/docs
const publicR = join(appRoot, 'public', 'r');

const registryUrl = (process.env.REGISTRY_URL ?? siteConfig.url).replace(/\/+$/, '');
const registryNames = new Set(registry.map((entry) => entry.name));

const resolveRegistryDependency = (dep: string) =>
  registryNames.has(dep) ? `${registryUrl}/r/${dep}.json` : dep;

const read = (rel: string) => readFile(join(appRoot, rel), 'utf8');

/**
 * Gallery preview media is discovered on disk rather than listed by hand, so
 * adding a preview is "drop the file in and rebuild" — nothing to wire up.
 *
 * Files live under public/media/components or public/media/blocks, matching the
 * entry's type. Any of these layouts work, whichever is easiest to export into:
 *   <dir>/<name>-poster.webp   +  <name>-preview.mp4
 *   <dir>/<name>.webp          +  <name>.mp4
 *   <dir>/<name>/poster.webp   +  <name>/preview.mp4
 *
 * First extension listed wins, so a .webp beats a .png of the same entry.
 * A .gif is accepted in the clip slot and the card renders it as an image, but
 * it is last for a reason — see public/media/README.md.
 */
const IMAGE_EXTENSIONS = ['webp', 'avif', 'png', 'jpg', 'jpeg'];
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'gif'];

function findMedia(name: string, type: RegistryType): { image?: string; video?: string } {
  // Media is filed by entry type — media/components, media/blocks — with the
  // flat media/ kept as a fallback so a loose file still works.
  const bases = [`media/${type}s`, 'media'];

  const pick = (extensions: string[], stems: string[]) => {
    for (const ext of extensions) {
      const candidates = bases.flatMap((base) => [
        ...stems.map((stem) => `${base}/${name}-${stem}.${ext}`),
        `${base}/${name}.${ext}`,
        ...stems.map((stem) => `${base}/${name}/${stem}.${ext}`),
      ]);
      for (const rel of candidates) {
        if (existsSync(join(appRoot, 'public', rel))) return `/${rel}`;
      }
    }
    return undefined;
  };

  const image = pick(IMAGE_EXTENSIONS, ['poster', 'image', 'thumb']);
  const video = pick(VIDEO_EXTENSIONS, ['preview', 'video', 'clip']);

  return { ...(image ? { image } : {}), ...(video ? { video } : {}) };
}

type Lang = 'tsx' | 'ts' | 'css';

const highlight = (code: string, lang: Lang) =>
  codeToHtml(code, { lang, theme: 'github-dark', colorReplacements: { '#24292e': 'transparent' } });

const snippet = async (code: string, lang: Lang) => ({
  code,
  codeHtml: await highlight(code, lang),
});

/** Map a registry file to a shadcn registry-item file type. */
function shadcnFileType(path: string) {
  if (/(^|\/)use-[^/]+\.ts$/.test(path) || path.includes('/hooks/')) return 'registry:hook';
  return 'registry:component';
}

async function main() {
  await mkdir(publicR, { recursive: true });

  const index: Array<Record<string, unknown>> = [];
  const cssTokens: Record<string, { code: string; codeHtml: string }> = {};
  const usage: Record<string, { react: unknown }> = {};
  const manual: Record<string, { react: unknown }> = {};

  for (const entry of registry) {
    const shadcnFiles = [];
    let reactCode = '';

    for (const f of entry.files) {
      const content = await read(f.path);
      shadcnFiles.push({
        path: f.target,
        type: shadcnFileType(f.path),
        target: f.target,
        content,
      });
      reactCode ||= content;
    }

    // Single-file "manual" copy: React file as-is.
    manual[entry.name] = {
      react: await snippet(reactCode, 'tsx'),
    };

    usage[entry.name] = {
      react: await snippet(entry.usage.react, 'tsx'),
    };

    if (Object.keys(entry.cssVars).length > 0) {
      const cssCode = `@theme {\n${Object.entries(entry.cssVars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n')}\n}`;
      cssTokens[entry.name] = { code: cssCode, codeHtml: await highlight(cssCode, 'css') };
    }

    const item = {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name: entry.name,
      type: entry.type === 'block' ? 'registry:block' : 'registry:ui',
      title: entry.title,
      description: entry.description,
      dependencies: entry.dependencies,
      registryDependencies: entry.registryDependencies.map(resolveRegistryDependency),
      cssVars: {
        theme: Object.fromEntries(
          Object.entries(entry.cssVars).map(([k, v]) => [k.replace(/^--/, ''), v])
        ),
      },
      files: shadcnFiles,
    };

    // Our RegistryEntry is the authoring shape; this is the shadcn wire shape.
    // Parsing here means a bad translation fails the build instead of the CLI.
    const parsed = registryItemSchema.safeParse(item);
    if (!parsed.success) {
      throw new Error(
        `${entry.name} — emitted JSON is not a valid shadcn registry item:\n` +
          JSON.stringify(parsed.error.issues, null, 2)
      );
    }

    await writeFile(join(publicR, `${entry.name}.json`), JSON.stringify(item, null, 2));
    index.push({
      name: entry.name,
      type: item.type,
      title: entry.title,
      description: entry.description,
      files: shadcnFiles.map((f) => ({ path: f.path, type: f.type })),
    });
  }

  // `$schema` and a flat `/r` layout are what the shadcn registry directory
  // validates when listing a namespace — see docs/registry-directory.md.
  const registryIndex = {
    $schema: 'https://ui.shadcn.com/schema/registry.json',
    name: 'tween-ui',
    homepage: registryUrl,
    items: index,
  };
  const parsedIndex = registrySchema.safeParse(registryIndex);
  if (!parsedIndex.success) {
    throw new Error(
      `public/r/registry.json is not a valid shadcn registry:\n` +
        JSON.stringify(parsedIndex.error.issues, null, 2)
    );
  }

  await writeFile(join(publicR, 'registry.json'), JSON.stringify(registryIndex, null, 2));

  const generated =
    `// AUTO-GENERATED by scripts/build-registry.ts — do not edit by hand.\n` +
    `export interface Snippet {\n  code: string;\n  codeHtml: string;\n}\n\n` +
    `export const cssTokens: Record<string, Snippet> = ${JSON.stringify(cssTokens, null, 2)};\n\n` +
    `export const usage: Record<string, { react: Snippet }> = ${JSON.stringify(usage, null, 2)};\n\n` +
    `export const manual: Record<string, { react: Snippet }> = ${JSON.stringify(manual, null, 2)};\n`;
  await writeFile(join(appRoot, 'registry', '__sources__.generated.ts'), generated);

  // Demo map for <ComponentPreview>, keyed `${name}:${variant}`. Generated so a
  // new demo can never be silently missing from it — an absent file is a build
  // error here rather than an empty preview in the browser.
  const demoLines: string[] = [];
  for (const entry of registry) {
    entry.variants.forEach((variant, index) => {
      const mod = variant.demo ?? (index === 0 ? entry.name : `${entry.name}-${variant.id}`);
      if (!existsSync(join(appRoot, 'registry', 'demos', `${mod}.tsx`))) {
        throw new Error(
          `${entry.name}:${variant.id} — missing demo registry/demos/${mod}.tsx. ` +
            `Create it, or set \`demo\` on the variant.`
        );
      }
      demoLines.push(`  '${entry.name}:${variant.id}': dynamic(() => import('./demos/${mod}')),`);
    });
  }

  const demoIndex =
    `// AUTO-GENERATED by scripts/build-registry.ts — do not edit by hand.\n` +
    `'use client';\n\n` +
    `import type { ComponentType } from 'react';\n` +
    `import dynamic from 'next/dynamic';\n\n` +
    `/**\n` +
    ` * Live demo map for <ComponentPreview>. Demos are client-only (hover, focus\n` +
    ` * and timers), so each is loaded through next/dynamic.\n` +
    ` */\n` +
    `export const demos: Record<string, ComponentType> = {\n${demoLines.join('\n')}\n};\n\n` +
    `export function getDemo(component: string, variant: string): ComponentType | undefined {\n` +
    `  return demos[\`\${component}:\${variant}\`];\n}\n`;
  await writeFile(join(appRoot, 'registry', '__index__.generated.tsx'), demoIndex);

  // Gallery card media, discovered on disk (see findMedia).
  const mediaLines: string[] = [];
  let withMedia = 0;
  for (const entry of registry) {
    const found = findMedia(entry.name, entry.type);
    if (!found.image && !found.video) continue;
    withMedia += 1;
    mediaLines.push(`  '${entry.name}': ${JSON.stringify(found)},`);
  }

  const mediaIndex =
    `// AUTO-GENERATED by scripts/build-registry.ts — do not edit by hand.\n` +
    `import type { RegistryMedia } from './schema';\n\n` +
    `/**\n` +
    ` * Preview media found under public/media. Drop a file in, run\n` +
    ` * \`pnpm registry:build\`, and the gallery card picks it up — an entry's own\n` +
    ` * \`media\` field still wins if it sets one explicitly.\n` +
    ` */\n` +
    `export const discoveredMedia: Record<string, RegistryMedia> = {\n` +
    `${mediaLines.join('\n')}${mediaLines.length ? '\n' : ''}};\n`;
  await writeFile(join(appRoot, 'registry', '__media__.generated.ts'), mediaIndex);

  console.log(
    `✓ registry built: ${registry.length} item(s), ${demoLines.length} demo(s), ` +
      `${withMedia} with preview media`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
