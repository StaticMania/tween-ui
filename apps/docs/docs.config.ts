import { defineDocsConfig } from 'docora';

export default defineDocsConfig({
  site: {
    name: 'Tween UI',
    description: 'GSAP & CSS animated components for React. Copy the source, own the animation.',
    url: 'https://tweenui.dev',
    locale: 'en',
  },

  socials: {
    github: 'https://github.com/StaticMania/tween-ui',
  },

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
          { label: 'All components', href: '/' },
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
    ],
  },
});
