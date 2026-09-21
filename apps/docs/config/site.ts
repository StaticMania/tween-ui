export const siteConfig = {
  name: 'Tween UI',
  url: 'https://tween-ui.vercel.app',
  ogImage: 'https://tween-ui.vercel.app/og',
  description: 'GSAP & CSS animated components for React. Copy the source, own the animation.',
  links: {
    github: 'https://github.com/StaticMania/tween-ui',
  },
  /** GitHub repo used by the "Open in GitHub" links. */
  repo: 'https://github.com/StaticMania/tween-ui',
  /** Path prefix (relative to repo root) where registry sources live. */
  registryPath: 'apps/docs/registry/tweenui',
  /**
   * shadcn registry namespace. Users map it once in their components.json and
   * then install by name: `pnpm dlx shadcn@latest add @tween-ui/<item>`.
   */
  registryNamespace: '@tween-ui',
  keywords: ['React', 'Tailwind CSS', 'GSAP', 'Animated', 'Components', 'Next.js'],
} as const;

export type SiteConfig = typeof siteConfig;
