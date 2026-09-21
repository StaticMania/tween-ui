# Listing `@tween-ui` in the shadcn registry directory

Installing by namespace — `pnpm dlx shadcn@latest add @tween-ui/icon-trail-button` —
works today, but only after the user maps the namespace in their own
`components.json`:

```json
{
  "registries": {
    "@tween-ui": "https://tween-ui.vercel.app/r/{name}.json"
  }
}
```

The shadcn CLI also fetches <https://ui.shadcn.com/r/registries.json> and, for a
namespace it does not know, resolves it from there and writes the entry into the
user's `components.json` automatically. Getting listed there removes the manual
step entirely — that list is generated from one file in `shadcn-ui/ui`, so
getting on it means opening a pull request there.

## The entry

Validated against the upstream `registryDirectoryEntrySchema`
([`apps/v4/lib/registry-directory.ts`](https://github.com/shadcn-ui/ui/blob/main/apps/v4/lib/registry-directory.ts)):
namespace pattern, both URLs, the `{name}` placeholder, the required `logo`, no
extra keys (the schema is `.strict()`), and no namespace collision with the 372
entries already listed.

```json
{
  "name": "@tween-ui",
  "homepage": "https://tween-ui.vercel.app",
  "url": "https://tween-ui.vercel.app/r/{name}.json",
  "description": "GSAP & CSS animated React components and blocks. One file each, no shared runtime, reduced-motion handled.",
  "logo": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='6' fill='#045f64'/><path d='M5 19 C 9.5 8.9, 5 5, 19 5' fill='none' stroke='#c6f56f' stroke-width='2' stroke-linecap='round'/><circle cx='19' cy='5' r='1.8' fill='#c6f56f'/></svg>"
}
```

## Submitting

Deploy this repo first, so what the directory points at matches what the docs
say. Then, in a fork of [`shadcn-ui/ui`](https://github.com/shadcn-ui/ui):

1. Append the entry above to
   [`apps/v4/registry/directory.json`](https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/directory.json).
   The file is only loosely alphabetical — newer entries are appended — so the
   end of the array is fine.
2. Run `pnpm validate:registries` (it parses `directory.json` and the derived
   `/r/registries.json` payload).
3. Open the pull request.

Upstream uses `category(scope): message` commit messages, so:

```
feat(registry): add @tween-ui to the registry directory
```

PR body:

> Adds `@tween-ui` to the registry directory.
>
> **Registry:** https://tween-ui.vercel.app · **Source:** https://github.com/StaticMania/tween-ui (MIT)
>
> 36 GSAP & CSS animated React components and blocks. Each item is a single
> `.tsx` file with no shared runtime, and every component handles
> `prefers-reduced-motion`.
>
> - `https://tween-ui.vercel.app/r/registry.json` — flat index, 36 items, no
>   `content` in its `files` entries
> - `https://tween-ui.vercel.app/r/{name}.json` — item files, schema-validated
>   at build time
> - `pnpm validate:registries` passes with the entry added

Once merged, the namespace is published immediately. Registry Health starts
monitoring afterwards; it does not gate publication.

## After it merges

Flip `REGISTRY_LISTED` to `true` in
[`components/mdx/command-tabs.tsx`](../apps/docs/components/mdx/command-tabs.tsx).
That is the whole switch-over: the "set up the registry first" line under every
install tab disappears, and the landing CTA moves from the item URL to
`@tween-ui/icon-trail-button`. The setup page stays useful — the mapping is
still valid, just no longer required — so reword it rather than delete it, and
update the README quick start to match. `pnpm test` will tell you what else
still assumes the unlisted state.

## Requirements, and how this registry meets them

| Requirement                                                          | Status                                                         |
| -------------------------------------------------------------------- | -------------------------------------------------------------- |
| Open source and publicly accessible                                  | MIT, deployed at `tween-ui.vercel.app`                         |
| Valid registry JSON conforming to the schema                         | `registrySchema` is enforced in `scripts/build-registry.ts`    |
| Flat registry — `/registry.json` and `/<name>.json` at the same root | emitted to `apps/docs/public/r`                                |
| No `content` in the index's `files` entries                          | the index lists `path` and `type` only; `content` is per-item  |
| Every item resolves and installs                                     | all 36 item URLs fetch, parse and carry non-empty file content |

`pnpm registry:build` fails the build if any of the emitted JSON stops matching
the schema, so these hold as long as the build passes.
