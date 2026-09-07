# Tween UI — Build Workflow & Phases

A GSAP + CSS animated component library, documented with Docora, distributed
shadcn-style (copy-paste + CLI). React, Tailwind v4.

---

## Architecture (locked)

- **Monorepo:** Turborepo + pnpm workspaces.
- **Docs:** Docora (Next.js 16, MDC/MDX). Ships `/llms.txt`, `/mcp`, `/raw/[...slug]`.
- **Distribution:** registry model. `registry.json` + per-item JSON, `npx tween-ui add <name>`.
- **Components:** each ships a self-contained React file. Some CSS-only, some GSAP.
  (Plain-HTML variants were dropped — see Open items.)
- **Icons:** `lucide-react` is the default; custom SVG only where specified.
- **Theme:** Tailwind v4 `@theme` tokens; components ship their tokens via `cssVars`.

```
tween-ui/
├─ apps/docs/              # Docora site
│  ├─ content/docs/        # MDX pages (components, blocks)
│  ├─ components/preview/   # ComponentPreview, OpenIn, demo registry
│  └─ public/r/            # generated per-component JSON (CLI reads these)
├─ packages/
│  ├─ registry/            # SOURCE OF TRUTH: component files + registry.ts + build script
│  ├─ hooks/               # shared hooks (use-button-icon-slide, gsap helpers)
│  ├─ cli/                 # npx tween-ui add
│  └─ tests/               # vitest + playwright + registry-integrity
├─ turbo.json · pnpm-workspace.yaml · package.json
```

---

## Phases

| Phase | Name | Output | Status |
|------:|------|--------|--------|
| 0 | Foundation | Monorepo + Docora + install + architecture | ✅ done |
| 1 | Registry package | `apps/docs/registry` with Button source (self-contained) + `registry.ts` + build script → `public/r/*.json` + `registry.json` + generated sources | ✅ done |
| 2 | Theme | tokens + Outfit font wired into `apps/docs/app/globals.css`; `cssVars` on Button entry | ✅ done |
| 3 | Doc experience | `<ComponentPreview>` (Preview/Code + Replay + variant tabs) + `<OpenIn>` menu, registered into Docora's MDX pipeline | ✅ done |
| 4 | **Button pilot** | Full Button page live: React, 4 variants, install tabs, 13 tests green, production build passes. **Pilot gate — review now.** | ✅ done |
| 5 | Scale | Remaining 14 components through the per-component pipeline | ⬜ |
| 6 | Blocks | `type: block` support, resizable/full-width preview, `registryDependencies` | ⬜ |
| 7 | CLI | `npx tween-ui add <name>` writes files + `cssVars` into a user project | ⬜ |
| 8 | Polish & ship | Search, dark mode, OG, `llms.txt`, deploy | ⬜ |

**Gate:** nothing in Phase 5 starts until you approve the Phase 4 Button pilot.

---

## Per-component workflow (the repeatable loop)

Once the machinery (Phases 1–3) exists, every one of the 15 — and every block — is
the same four steps. No per-component wiring of previews/toggles/menus.

```
1. DROP     → put the React source file into the component's registry folder
2. REGISTER → add one entry to registry.ts (title, deps, cssVars, variants, files)
3. DOCUMENT → write content/docs/components/<name>.mdx  (frontmatter + <ComponentPreview name="…"/>)
4. VERIFY   → pnpm registry:build && pnpm test   (integrity + render + reduced-motion + visual)
```

### Variant convention
One component = one page. Variants (green, primary, white, …) are examples on that
page, selectable in the preview — not separate registry entries.

### GSAP vs CSS
The entry's `dependencies` lists `gsap` only for GSAP components. CSS-only
components (like Button) list none. Structure is identical either way.

---

## Testing layers

| Layer | Tool | Catches |
|-------|------|---------|
| Registry integrity | Vitest | every entry's files exist; React file present; deps declared |
| Component render | Vitest + RTL | mounts, props apply, hook cleanup on unmount |
| Reduced motion | Vitest/Playwright | `prefers-reduced-motion` honored (a11y + quality gate) |
| Visual regression | Playwright screenshots | snapshot AFTER animation completes (deterministic) |

---

## Definition of Done (per component)

- [ ] React component in registry, self-contained imports
- [ ] `registry.ts` entry with `cssVars` (portable tokens)
- [ ] `public/r/<name>.json` generated
- [ ] MDX page: description, live preview, variants, install (CLI + manual), props, usage
- [ ] Open-in menu works (GitHub / Claude / ChatGPT / T3)
- [ ] `prefers-reduced-motion` respected
- [ ] Tests green (integrity + render + visual)

---

## Open items / notes

- **Plain-HTML variants: dropped** — React-only. In the AI era the framework-agnostic
  HTML build was a maintenance tax with little moat; non-React users take the React
  source through the Open-in-AI conversion path instead.
- `secondary` variant: **dropped** (per decision).
- Font: token stays `font-inter-tight`, value set to **Outfit** (loaded from Google Fonts).
- Button trail icon: **custom diagonal-dots SVG** (not lucide).
