import type { RegistryEntry } from './schema';

const BUTTON_DIR = 'registry/tweenui/button';
const NAV_DIR = 'registry/tweenui/navigation';
const AVATAR_DIR = 'registry/tweenui/avatar';
const MODAL_DIR = 'registry/tweenui/modal';
const SCROLL_DIR = 'registry/tweenui/scroll-based';

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
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${BUTTON_DIR}/animated-sliding-button.tsx`,
      },
    ],
    usage: {
      react: `import AnimatedSlidingButton from '@/components/tweenui/button/animated-sliding-button';

export default function Example() {
  return <AnimatedSlidingButton>Get started</AnimatedSlidingButton>;
}`,
    },
  },
  {
    name: 'sliding-tab-on-hover',
    type: 'component',
    group: 'navigation',
    title: 'Sliding Tab On Hover',
    description:
      'A pill nav whose lime indicator scales in, then slides to the hovered or focused tab. GSAP-driven, keyboard accessible, and reduced-motion aware.',
    isNew: true,
    media: {
      // image: '/media/sliding-tab-on-hover/poster.png',
      // video: '/media/sliding-tab-on-hover/preview.mp4',
    },
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${NAV_DIR}/sliding-tab-on-hover.tsx`,
        target: 'components/tweenui/navigation/sliding-tab-on-hover.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${NAV_DIR}/sliding-tab-on-hover.tsx`,
      },
    ],
    usage: {
      react: `import SlidingTabOnHover from '@/components/tweenui/navigation/sliding-tab-on-hover';

const items = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'services', label: 'Service' },
];

export default function Example() {
  return <SlidingTabOnHover items={items} defaultValue="home" />;
}`,
    },
  },
  {
    name: 'avatar-reveal',
    type: 'component',
    group: 'avatar',
    title: 'Avatar Reveal',
    description:
      'Overlapping avatars that pop in with an elastic blur, then the caption slides in from the right. GSAP-driven and reduced-motion aware.',
    isNew: true,
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${AVATAR_DIR}/avatar-reveal.tsx`,
        target: 'components/tweenui/avatar/avatar-reveal.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${AVATAR_DIR}/avatar-reveal.tsx`,
      },
    ],
    usage: {
      react: `import AvatarReveal from '@/components/tweenui/avatar/avatar-reveal';

export default function Example() {
  return <AvatarReveal>2,000+ teams shipping faster this week.</AvatarReveal>;
}`,
    },
  },
  {
    name: 'auth-modal',
    type: 'component',
    group: 'modal',
    title: 'Auth Modal',
    description:
      'A sign-in dialog that fades the backdrop, then scales the panel in with staggered content. GSAP-driven and reduced-motion aware.',
    isNew: true,
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${MODAL_DIR}/auth-modal.tsx`,
        target: 'components/tweenui/modal/auth-modal.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${MODAL_DIR}/auth-modal.tsx`,
      },
    ],
    usage: {
      react: `import { useState } from 'react';
import AuthModal from '@/components/tweenui/modal/auth-modal';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Sign in
      </button>
      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}`,
    },
  },
  {
    name: 'counter-number-on-scroll',
    type: 'component',
    group: 'scroll-based',
    title: 'Counter Number On Scroll',
    description:
      'Digits that count up once when the number scrolls into view. GSAP ScrollTrigger plus Number Flow, and reduced-motion aware.',
    isNew: true,
    media: {},
    dependencies: ['gsap', '@gsap/react', '@number-flow/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${SCROLL_DIR}/counter-number-on-scroll.tsx`,
        target: 'components/tweenui/scroll-based/counter-number-on-scroll.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'instant',
        label: 'Instant',
        reactSource: `${SCROLL_DIR}/counter-number-on-scroll.tsx`,
      },
      {
        id: 'viewport',
        label: 'Viewport',
        reactSource: `${SCROLL_DIR}/counter-number-on-scroll.tsx`,
      },
    ],
    usage: {
      react: `import CounterNumberOnScroll from '@/components/tweenui/scroll-based/counter-number-on-scroll';

export default function Example() {
  return (
    <p>
      <CounterNumberOnScroll value={150} instant />+ projects delivered
    </p>
  );
}`,
    },
  },
];
