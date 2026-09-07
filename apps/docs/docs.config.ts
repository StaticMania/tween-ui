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
          { label: 'Animated Sliding Button', href: '/component/button/animated-sliding-button' },
          { label: 'Sliding Tab On Hover', href: '/component/navigation/sliding-tab-on-hover' },
          { label: 'Avatar Reveal', href: '/component/avatar/avatar-reveal' },
          { label: 'Auth Modal', href: '/component/modal/auth-modal' },
          {
            label: 'Counter Number On Scroll',
            href: '/component/scroll-based/counter-number-on-scroll',
          },
        ],
      },
    ],
  },
});
