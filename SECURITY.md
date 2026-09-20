# Security Policy

## What is in scope

Tween UI does not publish an npm package. It ships a documentation site and a
[shadcn-compatible registry](https://tween-ui.vercel.app/r/registry.json) that the CLI
reads to copy component source into a consumer's project.

| Surface                                                 | Supported      |
| ------------------------------------------------------- | -------------- |
| The deployed site and registry at `tween-ui.vercel.app` | Yes            |
| Component sources in `apps/docs/registry` on `main`     | Yes            |
| Source already copied into your own project             | Yours to patch |

Because the CLI copies files rather than installing a dependency, a fix here does
not reach code you have already copied. Re-run the `shadcn` command for the
affected component to pick up a corrected file.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security reports.

Report privately through one of these channels:

1. [GitHub private vulnerability reporting](https://github.com/StaticMania/tween-ui/security/advisories/new)
2. Email [hello@staticmania.com](mailto:hello@staticmania.com) with the subject `Tween UI security report`

Include as much detail as you can:

- A description of the issue and its impact
- Steps to reproduce, or a proof of concept
- The affected component or block name, and the commit you saw it on
- Any suggested fix, if you have one

## What to expect

- We will acknowledge the report as soon as we can.
- We will investigate and keep you informed of the status.
- If the report is confirmed, we will prepare a fix and coordinate disclosure.
- Please give us a reasonable window to ship a fix before discussing the issue publicly.

Thank you for helping keep Tween UI and its users safe.
