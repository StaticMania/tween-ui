import { defineDocsConfig } from 'docora';

export default defineDocsConfig({
  site: {
    name: 'Tween UI',
    description:
      'GSAP & CSS animated components for React and plain HTML. Copy the source, own the animation.',
    url: 'https://tweenui.dev',
    locale: 'en',
  },

  header: {
    links: [{ label: 'Components', href: '/' }],
  },

  socials: {
    github: 'https://github.com/tween-ui/tween-ui',
  },

  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community',
      links: [
        {
          label: 'Report an issue',
          href: 'https://github.com/tween-ui/tween-ui/issues',
          icon: 'book-open',
        },
      ],
    },
  },

  github: {
    url: 'https://github.com/tween-ui/tween-ui',
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
        ],
      },
    ],
  },
});
