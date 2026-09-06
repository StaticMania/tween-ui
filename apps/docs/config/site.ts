export const siteConfig = {
  name: 'Tween UI',
  url: 'https://tweenui.dev',
  ogImage: 'https://tweenui.dev/og',
  description:
    'GSAP & CSS animated components for React and plain HTML. Copy the source, own the animation.',
  links: {
    github: 'https://github.com/tween-ui/tween-ui',
  },
  /** GitHub repo used by the "Open in GitHub" links. */
  repo: 'https://github.com/tween-ui/tween-ui',
  /** Path prefix (relative to repo root) where registry sources live. */
  registryPath: 'apps/docs/registry/tweenui',
  keywords: ['React', 'HTML', 'Tailwind CSS', 'GSAP', 'Animated', 'Components', 'Next.js'],
} as const;

export type SiteConfig = typeof siteConfig;
