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
  },

  footer: {
    credits: 'Tween UI',
    columns: [
      {
        title: 'Components',
        links: [
          { label: 'All components', href: '/' },
          { label: 'Animated Sliding Button', href: '/component/button/animated-sliding-button' },
        ],
      },
    ],
  },
});
