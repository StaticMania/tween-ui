# Governance

This document describes how Tween UI is maintained and how changes are accepted.

## Maintainers

Tween UI is maintained by [StaticMania](https://staticmania.com). Maintainers have write
access to the repository and control what ships to the deployed site and the registry
that the `shadcn` CLI reads.

## Decision process

- **Small, obvious fixes** (typos, docs, bug fixes with a clear cause) can go straight to
  a pull request.
- **New components and blocks** should start as a GitHub issue so maintainers can agree on
  scope, naming, and whether it earns its place before the work is done.
- **Breaking changes to a published component** deserve extra care: consumers have copied
  the file, so a rename or prop change does not reach them automatically. Prefer additive
  changes.
- Maintainers have the final say on whether a change lands. Disagreements are resolved by
  discussion on the issue or pull request.
- The [Code of Conduct](CODE_OF_CONDUCT.md) applies to all project spaces.

## Review and merge

1. A maintainer reviews the pull request for correctness, accessibility, reduced-motion
   handling, and fit with the project.
2. CI is expected to pass. Locally that means `pnpm typecheck`, `pnpm test`, and
   `pnpm build` from the repository root.
3. A component change must be accompanied by a `pnpm registry:build`, so the generated
   registry files and `public/r/*.json` stay in step with the source.
4. A maintainer merges to `main` when the review is complete. Squash merges are preferred
   so `main` stays readable.

## Releases

There is no npm package to publish. `main` is the release:

- Merging to `main` deploys the documentation site.
- The registry JSON under `public/r` is regenerated from the component sources, so the
  install command for every component reflects `main`.

Because consumers copy source rather than install a dependency, a merge does not change
any code already in their projects. Notable changes are recorded in
[CHANGELOG.md](CHANGELOG.md).

## Becoming a maintainer

Maintainer access is granted by StaticMania to people with a record of high-quality
contributions and reviews. If you are interested, start by contributing through issues and
pull requests as described in [CONTRIBUTING.md](CONTRIBUTING.md).
