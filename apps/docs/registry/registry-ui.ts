import type { RegistryEntry } from './schema';

const BUTTON_DIR = 'registry/tweenui/button';

/**
 * UI components. One entry per component; the build script does the rest.
 * (Mirrors Magic UI's registry-ui.ts — blocks/lib get their own files later.)
 */
export const ui: RegistryEntry[] = [
  {
    name: 'animated-sliding-button',
    type: 'component',
    group: 'button',
    title: 'Animated Sliding Button',
    description:
      'A pill button whose icon slides open into a staggered chevron trail on hover and focus. CSS-driven, fully keyboard accessible, and reduced-motion aware.',
    isNew: true,
    media: {
      // image: '/media/animated-sliding-button/poster.png',
      // video: '/media/animated-sliding-button/preview.mp4',
    },
    dependencies: [], // CSS-only — no gsap
    registryDependencies: [],
    // Colors, easing and sizes are inline in the component — no @theme tokens
    // required, so nothing is added to the consumer's globals.css.
    cssVars: {},
    files: [
      // React — single self-contained file (icon + hook + trail + button)
      {
        path: `${BUTTON_DIR}/animated-sliding-button.tsx`,
        target: 'components/tweenui/button/animated-sliding-button.tsx',
        kind: 'react',
      },
      // HTML
      {
        path: `${BUTTON_DIR}/html/animated-sliding-button.html`,
        target: 'tweenui/button/animated-sliding-button.html',
        kind: 'html',
      },
      {
        path: `${BUTTON_DIR}/html/button-icon-slide.js`,
        target: 'tweenui/button/button-icon-slide.js',
        kind: 'script',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${BUTTON_DIR}/animated-sliding-button.tsx`,
        htmlSource: `${BUTTON_DIR}/html/animated-sliding-button.html`,
      },
    ],
    usage: {
      react: `import AnimatedSlidingButton from '@/components/tweenui/button/animated-sliding-button';

export default function Example() {
  return <AnimatedSlidingButton>Get started</AnimatedSlidingButton>;
}`,
      html: `<!-- Drop the markup anywhere -->
<button data-btn-icon-slide data-icon-state="idle" class="group ...">
  <!-- ...icon + label... -->
  Get started
</button>

<!-- Load the controller once per page -->
<script src="/tweenui/button/button-icon-slide.js"></script>`,
    },
  },
];
