import type { RegistryEntry } from './schema';

const BUTTON_DIR = 'registry/tweenui/button';
const NAV_DIR = 'registry/tweenui/navigation';
const AVATAR_DIR = 'registry/tweenui/avatar';
const MODAL_DIR = 'registry/tweenui/modal';

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
      {
        path: `${NAV_DIR}/html/sliding-tab-on-hover.html`,
        target: 'tweenui/navigation/sliding-tab-on-hover.html',
        kind: 'html',
      },
      {
        path: `${NAV_DIR}/html/sliding-tab-on-hover.js`,
        target: 'tweenui/navigation/sliding-tab-on-hover.js',
        kind: 'script',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${NAV_DIR}/sliding-tab-on-hover.tsx`,
        htmlSource: `${NAV_DIR}/html/sliding-tab-on-hover.html`,
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
      html: `<!-- GSAP (required) + CustomEase (optional, for the bouncy reveal) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/CustomEase.min.js"></script>

<nav data-nav-tabs aria-label="Sliding tabs" class="relative inline-flex ...">
  <div data-nav-indicator class="pointer-events-none absolute ..." aria-hidden="true"></div>
  <a href="#home" data-nav-item data-active="true">Home</a>
  <a href="#about" data-nav-item data-active="false">About</a>
</nav>

<script src="/tweenui/navigation/sliding-tab-on-hover.js"></script>`,
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
      {
        path: `${AVATAR_DIR}/html/avatar-reveal.html`,
        target: 'tweenui/avatar/avatar-reveal.html',
        kind: 'html',
      },
      {
        path: `${AVATAR_DIR}/html/avatar-reveal.js`,
        target: 'tweenui/avatar/avatar-reveal.js',
        kind: 'script',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${AVATAR_DIR}/avatar-reveal.tsx`,
        htmlSource: `${AVATAR_DIR}/html/avatar-reveal.html`,
      },
    ],
    usage: {
      react: `import AvatarReveal from '@/components/tweenui/avatar/avatar-reveal';

export default function Example() {
  return <AvatarReveal>2,000+ teams shipping faster this week.</AvatarReveal>;
}`,
      html: `<!-- GSAP is required -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>

<div data-avatar-reveal class="mx-auto flex max-w-[254px] items-center gap-x-3">
  <div class="flex -space-x-3.5">
    <figure data-ns-avatar class="size-11 overflow-hidden rounded-full outline-2 outline-white">
      <img src="..." alt="Team member 1" class="size-full rounded-full object-cover" />
    </figure>
  </div>
  <p data-ns-animate class="max-w-[142px] text-sm text-[#045f64]/80">
    2,000+ teams shipping faster this week.
  </p>
</div>

<script src="/tweenui/avatar/avatar-reveal.js"></script>`,
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
      {
        path: `${MODAL_DIR}/html/auth-modal.html`,
        target: 'tweenui/modal/auth-modal.html',
        kind: 'html',
      },
      {
        path: `${MODAL_DIR}/html/auth-modal.js`,
        target: 'tweenui/modal/auth-modal.js',
        kind: 'script',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${MODAL_DIR}/auth-modal.tsx`,
        htmlSource: `${MODAL_DIR}/html/auth-modal.html`,
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
      html: `<!-- GSAP is required -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>

<div data-auth-modal-root>
  <button type="button" data-auth-modal-open>Sign in</button>
  <!-- overlay + panel markup -->
</div>

<script src="/tweenui/modal/auth-modal.js"></script>`,
    },
  },
];
