import type { RegistryEntry } from './schema';

const BUTTON_DIR = 'registry/tweenui/button';
const NAV_DIR = 'registry/tweenui/navigation';
const AVATAR_DIR = 'registry/tweenui/avatar';
const MODAL_DIR = 'registry/tweenui/modal';
const SCROLL_DIR = 'registry/tweenui/scroll-based';
const MEDIA_DIR = 'registry/tweenui/media';
const CARD_DIR = 'registry/tweenui/card';
const ACCORDION_DIR = 'registry/tweenui/accordion';
const ORBIT_DIR = 'registry/tweenui/orbit';
const LOGO_DIR = 'registry/tweenui/logo';
const SLIDER_DIR = 'registry/tweenui/slider';

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
  {
    name: 'scroll-spin-image',
    type: 'component',
    group: 'scroll-based',
    title: 'Scroll Spin Image',
    description:
      'A decorative image that spins continuously and speeds up in the scroll direction. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${SCROLL_DIR}/scroll-spin-image.tsx`,
        target: 'components/tweenui/scroll-based/scroll-spin-image.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${SCROLL_DIR}/scroll-spin-image.tsx`,
      },
    ],
    usage: {
      react: `import ScrollSpinImage from '@/components/tweenui/scroll-based/scroll-spin-image';

export default function Example() {
  return (
    <ScrollSpinImage
      src="/images/ns-img-579.png"
      alt="Decorative illustration of financial management platform interface with credit cards"
      className="w-full max-w-[700px] lg:max-w-[897px]"
    />
  );
}`,
    },
  },
  {
    name: 'voice-sample-player',
    type: 'component',
    group: 'media',
    title: 'Voice Sample Player',
    description:
      'An audio player pill: on play the label slides away, a lime waveform equalizer slides in, and the icon morphs to pause. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${MEDIA_DIR}/voice-sample-player.tsx`,
        target: 'components/tweenui/media/voice-sample-player.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${MEDIA_DIR}/voice-sample-player.tsx`,
      },
    ],
    usage: {
      react: `import VoiceSamplePlayer from '@/components/tweenui/media/voice-sample-player';

export default function Example() {
  return (
    <VoiceSamplePlayer
      name="Ada Lovelace"
      description="British female · warm & precise"
      avatar="/avatars/ada.jpg"
      src="/audio/ada-sample.mp3"
    />
  );
}`,
    },
  },
  {
    name: 'flip-card-on-hover',
    type: 'component',
    group: 'card',
    title: 'Flip Card On Hover',
    description:
      'A card that flips in 3D on hover (or tap on touch) to reveal a description, feature list, and CTA, with the back content staggering in. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${CARD_DIR}/flip-card-on-hover.tsx`,
        target: 'components/tweenui/card/flip-card-on-hover.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${CARD_DIR}/flip-card-on-hover.tsx`,
      },
    ],
    usage: {
      react: `import FlipCardOnHover from '@/components/tweenui/card/flip-card-on-hover';

export default function Example() {
  return (
    <FlipCardOnHover
      eyebrow="(01)"
      title="Web Design"
      subtitle="Interfaces that convert"
      description="Research-led product and marketing design, from wireframe to polished UI."
      image="/services/web-design.jpg"
      features={['UX & UI design', 'Design systems', 'Prototyping']}
      href="/services/web-design"
      ctaText="Explore service"
    />
  );
}`,
    },
  },
  {
    name: 'faq-accordion',
    type: 'component',
    group: 'accordion',
    title: 'FAQ Accordion',
    description:
      'A single-open accordion that animates its height open and reveals the answer line by line with a SplitText mask; the icon morphs from plus to minus. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${ACCORDION_DIR}/faq-accordion.tsx`,
        target: 'components/tweenui/accordion/faq-accordion.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${ACCORDION_DIR}/faq-accordion.tsx`,
      },
    ],
    usage: {
      react: `import FaqAccordion from '@/components/tweenui/accordion/faq-accordion';

const items = [
  { question: 'What is Tween UI?', answer: 'GSAP & CSS animated components for React.' },
  { question: 'How do I install it?', answer: 'Copy the source, or add it with the CLI.' },
];

export default function Example() {
  return <FaqAccordion items={items} />;
}`,
    },
  },
  {
    name: 'shiny-button',
    type: 'component',
    group: 'button',
    title: 'Shiny Button',
    description:
      'A pill button with a diagonal light sweep that glides across on hover, plus a sparkle icon that twinkles. Pure CSS, keyboard accessible, and reduced-motion aware.',
    media: {},
    dependencies: [], // CSS-only — no gsap
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${BUTTON_DIR}/shiny-button.tsx`,
        target: 'components/tweenui/button/shiny-button.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${BUTTON_DIR}/shiny-button.tsx`,
      },
    ],
    usage: {
      react: `import ShinyButton from '@/components/tweenui/button/shiny-button';

export default function Example() {
  return <ShinyButton onClick={() => {}}>Get started</ShinyButton>;
}`,
    },
  },
  {
    name: 'text-roll-button',
    type: 'component',
    group: 'button',
    title: 'Text Roll Button',
    description:
      'A pill button whose label rolls up character by character on hover, swapping to a fresh copy via a SplitText stagger. GSAP-driven, keyboard accessible, and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${BUTTON_DIR}/text-roll-button.tsx`,
        target: 'components/tweenui/button/text-roll-button.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${BUTTON_DIR}/text-roll-button.tsx`,
      },
    ],
    usage: {
      react: `import TextRollButton from '@/components/tweenui/button/text-roll-button';

export default function Example() {
  return <TextRollButton onClick={() => {}}>Try now</TextRollButton>;
}`,
    },
  },
  {
    name: 'slide-arrow-button',
    type: 'component',
    group: 'button',
    title: 'Slide Arrow Button',
    description:
      'A pill button whose label rolls up on hover while a chevron slides out of its lime badge and a fresh one slides in. Pure CSS, keyboard accessible, and reduced-motion aware.',
    media: {},
    dependencies: [], // CSS-only — no gsap
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${BUTTON_DIR}/slide-arrow-button.tsx`,
        target: 'components/tweenui/button/slide-arrow-button.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${BUTTON_DIR}/slide-arrow-button.tsx`,
      },
    ],
    usage: {
      react: `import SlideArrowButton from '@/components/tweenui/button/slide-arrow-button';

export default function Example() {
  return <SlideArrowButton onClick={() => {}}>Get started</SlideArrowButton>;
}`,
    },
  },
  {
    name: 'glow-button',
    type: 'component',
    group: 'button',
    title: 'Glow Button',
    description:
      'A pill button floating over a soft, colorful glow that sharpens on hover while a chevron slides through. Pure CSS, keyboard accessible, and reduced-motion aware.',
    media: {},
    dependencies: [], // CSS-only — no gsap
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${BUTTON_DIR}/glow-button.tsx`,
        target: 'components/tweenui/button/glow-button.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${BUTTON_DIR}/glow-button.tsx`,
      },
    ],
    usage: {
      react: `import GlowButton from '@/components/tweenui/button/glow-button';

export default function Example() {
  return <GlowButton onClick={() => {}}>Get started</GlowButton>;
}`,
    },
  },
  {
    name: 'logo-orbit',
    type: 'component',
    group: 'orbit',
    title: 'Logo Orbit',
    description:
      'Logos spaced evenly around a ring that rotates continuously while each logo stays upright. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${ORBIT_DIR}/logo-orbit.tsx`,
        target: 'components/tweenui/orbit/logo-orbit.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${ORBIT_DIR}/logo-orbit.tsx`,
      },
    ],
    usage: {
      react: `import LogoOrbit from '@/components/tweenui/orbit/logo-orbit';

const logos = [
  { src: '/logos/slack.svg', alt: 'Slack' },
  { src: '/logos/figma.svg', alt: 'Figma' },
  { src: '/logos/github.svg', alt: 'GitHub' },
];

export default function Example() {
  return <LogoOrbit logos={logos} size={320} speed={1} />;
}`,
    },
  },
  {
    name: 'logo-cycle',
    type: 'component',
    group: 'logo',
    title: 'Logo Cycle',
    description:
      'A logo row that swaps groups with a staggered blur-slide. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${LOGO_DIR}/logo-cycle.tsx`,
        target: 'components/tweenui/logo/logo-cycle.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${LOGO_DIR}/logo-cycle.tsx`,
      },
    ],
    usage: {
      react: `import LogoCycle from '@/components/tweenui/logo/logo-cycle';

const logos = [
  { src: '/logos/slack.svg', alt: 'Slack' },
  { src: '/logos/figma.svg', alt: 'Figma' },
  { src: '/logos/github.svg', alt: 'GitHub' },
  { src: '/logos/linear.svg', alt: 'Linear' },
  { src: '/logos/notion.svg', alt: 'Notion' },
  { src: '/logos/vercel.svg', alt: 'Vercel' },
  { src: '/logos/react.svg', alt: 'React' },
  { src: '/logos/tailwind.svg', alt: 'Tailwind CSS' },
];

export default function Example() {
  return <LogoCycle logos={logos} visibleCount={6} />;
}`,
    },
  },
  {
    name: 'logo-wave',
    type: 'component',
    group: 'logo',
    title: 'Logo Wave',
    description:
      'An infinite logo strip whose center mark rises and scales, with neighbors forming a descending arc. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${LOGO_DIR}/logo-wave.tsx`,
        target: 'components/tweenui/logo/logo-wave.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${LOGO_DIR}/logo-wave.tsx`,
      },
    ],
    usage: {
      react: `import LogoWave from '@/components/tweenui/logo/logo-wave';

const logos = [
  { src: '/logos/slack.svg', alt: 'Slack' },
  { src: '/logos/figma.svg', alt: 'Figma' },
  { src: '/logos/github.svg', alt: 'GitHub' },
  { src: '/logos/linear.svg', alt: 'Linear' },
  { src: '/logos/notion.svg', alt: 'Notion' },
  { src: '/logos/vercel.svg', alt: 'Vercel' },
];

export default function Example() {
  return <LogoWave logos={logos} duration={30} />;
}`,
    },
  },
  {
    name: 'image-fan-slider',
    type: 'component',
    group: 'slider',
    title: 'Image Fan Slider',
    description:
      'A fanned stack of images that auto-advances: the center is sharp, neighbors sit rotated and blurred. CSS-driven and reduced-motion aware.',
    media: {},
    dependencies: [],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${SLIDER_DIR}/image-fan-slider.tsx`,
        target: 'components/tweenui/slider/image-fan-slider.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${SLIDER_DIR}/image-fan-slider.tsx`,
      },
    ],
    usage: {
      react: `import ImageFanSlider from '@/components/tweenui/slider/image-fan-slider';

const images = [
  { src: '/photos/one.jpg', alt: 'Portrait one' },
  { src: '/photos/two.jpg', alt: 'Portrait two' },
  { src: '/photos/three.jpg', alt: 'Portrait three' },
];

export default function Example() {
  return <ImageFanSlider images={images} />;
}`,
    },
  },
];
