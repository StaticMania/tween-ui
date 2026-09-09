# Tween UI — Build Workflow & Phases

A GSAP + CSS animated component library, documented with Docora, distributed
shadcn-style (copy-paste + CLI). React, Tailwind v4.

---

## Architecture (locked)

- **Monorepo:** Turborepo + pnpm workspaces. Everything currently lives in the
  single `apps/docs` package; `packages/` is reserved for the CLI (Phase 7).
- **Docs:** Docora (Next.js 16, MDC/MDX). Ships `/llms.txt`, `/mcp`, `/raw/[...slug]`.
- **Distribution:** registry model. `registry.json` + per-item JSON, `npx tween-ui add <name>`.
- **Components:** each ships a self-contained React file. Some CSS-only, some GSAP.
  (Plain-HTML variants were dropped — see Open items.)
- **Icons:** `lucide-react` is the default; custom SVG only where specified.
- **Theme:** Tailwind v4 `@theme` tokens; components ship their tokens via `cssVars`.

```
tween-ui/
├─ .github/workflows/ci.yml   # registry:build → generated-file drift → typecheck → test → build
├─ apps/docs/                 # Docora site AND the registry (source of truth)
│  ├─ content/
│  │  ├─ component/<name>.mdx  # flat — the URL is /component/<name>
│  │  └─ block/<name>.mdx      #        and /block/<name>
│  ├─ registry/
│  │  ├─ registry-ui.ts        # component entries
│  │  ├─ registry-blocks.ts    # block entries
│  │  ├─ schema.ts             # RegistryEntry — the authoring shape
│  │  ├─ index.ts              # registry, getEntry, hrefFor
│  │  ├─ tweenui/<name>.tsx    # flat — the shippable source
│  │  ├─ demos/<name>.tsx      # flat — what the doc preview renders
│  │  ├─ __sources__.generated.ts   # GENERATED — code strings for the Code tab
│  │  └─ __index__.generated.tsx    # GENERATED — the live demo map
│  ├─ components/
│  │  ├─ mdx/                  # ComponentPreview, ComponentSource, OpenIn, gallery
│  │  ├─ layout/docs-shell.tsx # our DocsLayout (docora's has no sidebar slot)
│  │  └─ nav/                  # SidebarNav + follow pill, AnimatedIcon, MobileNav
│  ├─ public/r/*.json          # GENERATED — shadcn registry items, read by the CLI
│  ├─ scripts/build-registry.ts
│  └─ tests/                   # vitest — registry integrity + per-component render
├─ packages/                   # empty until Phase 7
└─ turbo.json · pnpm-workspace.yaml · lefthook.yml · package.json
```

Nothing is nested by category. One component = one file at every layer, and the
name is the only key — `registry/tweenui/<name>.tsx`, `registry/demos/<name>.tsx`,
`content/<kind>/<name>.mdx`, `/component/<name>`.

---

## Phases

| Phase | Name | Output | Status |
|------:|------|--------|--------|
| 0 | Foundation | Monorepo + Docora + install + architecture | ✅ done |
| 1 | Registry package | Registry + `registry.ts` + build script → `public/r/*.json` | ✅ done |
| 2 | Theme | tokens + Outfit font wired into `apps/docs/app/globals.css` | ✅ done |
| 3 | Doc experience | `<ComponentPreview>` (Preview/Code + Replay + variant tabs) + `<OpenIn>` | ✅ done |
| 4 | Button pilot | Full Button page live: React, variants, install tabs, tests green | ✅ done |
| 5 | Scale | **16 components** through the per-component pipeline | ✅ done |
| 6 | Blocks | `type: block`, full-width preview, `registryDependencies` — **12 blocks** | ✅ done |
| 7 | CLI | `npx tween-ui add <name>` writes files + `cssVars` into a user project | ⬜ |
| 8 | Polish & ship | Search, dark mode, OG, `llms.txt`, deploy | ⬜ |

Phase 7 is the remaining gap: `packages/cli` does not exist yet, though the
JSON it will consume is already generated and schema-validated.

---

## Per-component workflow (the repeatable loop)

Every component and every block is the same five steps. No per-component wiring
of previews, toggles or menus.

```
1. DROP     → registry/tweenui/<name>.tsx        (self-contained React source)
2. DEMO     → registry/demos/<name>.tsx          (what the preview renders)
3. REGISTER → one entry in registry-ui.ts or registry-blocks.ts
4. DOCUMENT → content/component/<name>.mdx or content/block/<name>.mdx
5. VERIFY   → pnpm registry:build && pnpm test
```

Step 2 needs no wiring: `registry:build` generates the demo map from the
registry, and **fails** if a demo file is missing.

### Variant convention

One component = one page. Variants (instant, viewport, …) are examples on that
page, selectable in the preview — not separate registry entries.

The demo module is derived: the first variant uses `demos/<name>.tsx`, any later
variant uses `demos/<name>-<variantId>.tsx`. Set `demo` on the variant to
override.

### Icons

Every page's frontmatter `icon` must be unique across the site — the sidebar is
one flat list, so a repeat reads as a duplicate entry. `components/nav/animated-icon.tsx`
maps icon names to hover motions; unlisted names fall back to a generic pop.

### GSAP vs CSS

The entry's `dependencies` lists `gsap` only for GSAP components. CSS-only
components list none. Structure is identical either way.

---

## Testing layers

| Layer | Tool | Catches |
|-------|------|---------|
| Registry integrity | Vitest | every entry's files exist; React file present; variants resolve |
| Reduced motion | Vitest | every variant source contains `motion-reduce:` |
| Component render | Vitest + RTL | mounts, props apply, hook cleanup on unmount |
| Missing demo | `registry:build` | a variant with no demo file fails the build |
| shadcn conformance | `registry:build` | emitted `public/r/*.json` parsed against `shadcn/schema` |
| Generated-file drift | CI | registry edited without rebuilding |

CI (`.github/workflows/ci.yml`) runs all of it on every push to `main` and every
PR. The lefthook pre-commit hook runs `registry:build`, `typecheck` and `format`
but **not** the tests, and `--no-verify` skips it entirely — CI is the real gate.

Visual regression (Playwright) is not set up.

---

## Definition of Done (per component)

- [ ] React component in `registry/tweenui/`, self-contained imports
- [ ] Demo in `registry/demos/` under the derived name
- [ ] Registry entry with `cssVars` (portable tokens) and a unique icon
- [ ] MDX page: description, live preview, variants, install (CLI + manual), props, usage
- [ ] Open-in menu works (GitHub / Claude / ChatGPT / T3)
- [ ] `prefers-reduced-motion` respected, and the source contains `motion-reduce:`
- [ ] `pnpm registry:build && pnpm test` green

---

## Open items / notes

- **Plain-HTML variants: dropped** — React-only. In the AI era the framework-agnostic
  HTML build was a maintenance tax with little moat; non-React users take the React
  source through the Open-in-AI conversion path instead.
- `secondary` variant: **dropped** (per decision).
- **`group`: dropped.** Categories were nearly all one item apiece, and neither the
  URL nor the sidebar showed them — so the field cost bookkeeping and bought nothing.
  If a gallery filter is ever wanted, reintroduce it as UI first.
- `isNew` is kept as an opt-in flag, set per entry when something ships. It is
  currently set on none.
- **Docora is vendored in two places** — `components/layout/docs-shell.tsx` mirrors
  its `DocsLayout`, and `components/nav/mobile-nav.tsx` replaces the drawer that
  its `SiteHeader` hardcodes. Re-check both on a docora upgrade; `globals.css`
  also hides docora's built-in mobile trigger by structural selector.
- Font: token stays `font-inter-tight`, value set to **Outfit** (loaded from Google Fonts).
- Button trail icon: **custom diagonal-dots SVG** (not lucide).
