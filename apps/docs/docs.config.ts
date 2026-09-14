import { defineDocsConfig } from 'docora';

export default defineDocsConfig({
  site: {
    name: 'Tween UI',
    description: 'GSAP & CSS animated components for React. Copy the source, own the animation.',
    url: 'https://tween-ui.vercel.app',
    locale: 'en',
  },

  header: {
    logo: { light: '/logo.svg', alt: 'Tween UI' },
  },

  // Paused for now: hides the "Ask AI" launcher, its panel and the TOC's
  // "Explain with AI" link, and turns off /api/assistant. The route files stay
  // in place — delete this block to bring the assistant back.
  assistant: { enabled: false },

  // No `socials` on purpose: docora renders those after the header's children
  // slot, which would put GitHub to the right of the theme toggle. `github.url`
  // below is the single source for the link, rendered by `HeaderActions`.

  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community',
      links: [
        {
          label: 'Report an issue',
          href: 'https://github.com/StaticMania/tween-ui/issues',
          icon: 'book-open',
        },
      ],
    },
  },

  github: {
    url: 'https://github.com/StaticMania/tween-ui',
    branch: 'main',
    rootDir: 'apps/docs',
  },

  footer: {
    credits: 'Tween UI',
    columns: [
      {
        title: 'Components',
        links: [
          { label: 'All components', href: '/components' },
          { label: 'Icon Trail Button', href: '/component/icon-trail-button' },
          { label: 'Sliding Tabs', href: '/component/sliding-tabs' },
          { label: 'Avatar Reveal', href: '/component/avatar-reveal' },
          { label: 'Auth Modal', href: '/component/auth-modal' },
          {
            label: 'Number Counter',
            href: '/component/number-counter',
          },
        ],
      },
      {
        title: 'Blocks',
        links: [
          { label: 'All blocks', href: '/components#blocks' },
          { label: 'Hero Tab Wipe', href: '/block/hero-tab-wipe' },
          { label: 'Pricing Plan Switch', href: '/block/pricing-plan-switch' },
          { label: 'Testimonial Strip Wipe', href: '/block/testimonial-strip-wipe' },
          { label: 'CTA Starfall', href: '/block/cta-starfall' },
        ],
      },
      {
        title: 'Community',
        links: [
          { label: 'GitHub', href: 'https://github.com/StaticMania/tween-ui' },
          { label: 'Report an issue', href: 'https://github.com/StaticMania/tween-ui/issues' },
          { label: 'llms.txt', href: '/llms.txt' },
          // { label: 'MCP server', href: '/mcp' }, // paused — /mcp still serves
        ],
      },
    ],
  },
});
