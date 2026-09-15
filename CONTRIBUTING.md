# Contributing to Tween UI

Thanks for taking the time. Bug reports, new components and documentation fixes
are all welcome.

Before building something large, [open an issue](https://github.com/StaticMania/tween-ui/issues)
first — it saves you writing a component that does not fit the model.

## Setup

Requires Node 22+ and pnpm.

```bash
git clone https://github.com/StaticMania/tween-ui.git
cd tween-ui
pnpm install          # also installs the git hooks via lefthook
pnpm dev              # docs at http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Docs site in dev mode |
| `pnpm registry:build` | Regenerates `public/r/*.json` and the generated modules |
| `pnpm test` | Vitest — registry integrity plus a render test per component |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm build` | Production build |

## The model

Every component ships as **one self-contained file** that gets copied into a
user's project. They will read it, edit it and delete parts of it, so the source
is the product — write it to be read, not to be imported.

That rules a few things out: no shared internal helpers between components, no
context providers, no config file. If a component needs a token, it ships it via
`cssVars`. If two components need the same helper, each carries its own copy.

## Adding a component

One name at every layer — a component called `sliding-tabs` is
`registry/tweenui/sliding-tabs.tsx`, `registry/demos/sliding-tabs.tsx`,
`content/1.component/sliding-tabs.mdx`, and lives at `/component/sliding-tabs`.

1. **The source** — `apps/docs/registry/tweenui/<name>.tsx`. Self-contained,
   typed props, forwards native attributes where it makes sense.
2. **The demo** — `apps/docs/registry/demos/<name>.tsx`. What the docs preview
   renders. Keep it small and representative.
3. **The registry entry** — add to `registry/registry-ui.ts` (components) or
   `registry/registry-blocks.ts` (blocks). See `registry/schema.ts` for the
   shape: dependencies, `cssVars`, files, variants and the usage snippet.
4. **The docs page** — `apps/docs/content/1.component/<name>.mdx` (or
   `2.block/`). Intro, `::component-preview`, install, usage, props, and an
   **Accessibility** section.
5. **A test** — `apps/docs/tests/<name>.test.tsx`. It should render, and assert
   the reduced-motion path.
6. `pnpm registry:build && pnpm test`.

### Two requirements, not suggestions

**Reduced motion.** Every component checks
`prefers-reduced-motion: reduce` and renders its finished state rather than
animating. Most do it by returning early from the `useGSAP` callback. The docs
page must say what actually happens under reduce — "the pill snaps to the target
tab with no scale or slide" — not just that it is supported.

**Keyboard access.** Anything hover-driven needs the same behaviour on
`:focus-visible`. Buttons are real `<button>` elements so `onClick`, `disabled`,
`type` and refs work.

### Writing the description

The description on a registry entry is what appears on the gallery card. It
should say what *this* component does and what makes it different. Leave out
properties every component shares — reduced motion, keyboard access — because
repeated across 36 cards they carry no information. Dependencies that vary are
worth naming: "Pure CSS — no GSAP dependency", "ScrollTrigger", "Number Flow".

## Generated files are committed

`public/r/*.json`, `registry/__sources__.generated.ts`,
`registry/__index__.generated.tsx` and `registry/__media__.generated.ts` are all
generated **and committed**. CI runs `pnpm registry:build` and then
`git diff --exit-code`, so a change to the registry without a rebuild fails the
build. Run `pnpm registry:build` before you commit — the pre-commit hook does it
for you when registry files are touched.

## Gallery preview media

Card previews are discovered from `apps/docs/public/media/` at build time — drop
the files in, run `pnpm registry:build`, no registry edit needed. Naming rules
and the ffmpeg recipe are in `apps/docs/public/media/README.md`.

## Commits and pull requests

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org)
and are checked by commitlint on the `commit-msg` hook:

```
feat: add marquee logo wall
fix: stop sliding tabs indicator drifting on resize
docs: clarify the reduced-motion note on flip card
```

The pre-commit hook rebuilds the registry, typechecks and formats. If a hook
fails, fix the cause rather than passing `--no-verify`.

Before opening a PR:

- [ ] `pnpm registry:build` — generated files committed
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] Checked the component with reduced motion enabled
- [ ] Checked it with the keyboard
- [ ] Checked it at phone width

Screenshots or a short screen recording help a lot for anything visual.

## License

By contributing you agree that your contributions are licensed under the
[MIT License](LICENSE).
