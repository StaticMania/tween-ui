import type { RegistryEntry } from './schema';

/**
 * UI components. One entry per component; the build script does the rest.
 * (Mirrors Magic UI's registry-ui.ts — blocks/lib get their own files later.)
 */
export const ui: RegistryEntry[] = [
  {
    name: 'icon-trail-button',
    type: 'component',
    title: 'Icon Trail Button',
    description:
      'A pill button whose icon slides open into a staggered chevron trail on hover and focus. CSS-driven, fully keyboard accessible, and reduced-motion aware.',
    media: {
      // image: '/media/icon-trail-button/poster.png',
      // video: '/media/icon-trail-button/preview.mp4',
    },
    dependencies: [], // CSS-only — no gsap
    registryDependencies: [],
    // Colors, easing and sizes are inline in the component — no @theme tokens
    // required, so nothing is added to the consumer's globals.css.
    cssVars: {},
    files: [
      // React — single self-contained file (icon + hook + trail + button)
      {
        path: 'registry/tweenui/icon-trail-button.tsx',
        target: 'components/tweenui/icon-trail-button.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/icon-trail-button.tsx',
      },
    ],
    usage: {
      react: `import IconTrailButton from '@/components/tweenui/icon-trail-button';

export default function Example() {
  return <IconTrailButton>Get started</IconTrailButton>;
}`,
    },
  },
  {
    name: 'sliding-tabs',
    type: 'component',
    title: 'Sliding Tabs',
    description:
      'A pill nav whose lime indicator scales in, then slides to the hovered or focused tab. GSAP-driven, keyboard accessible, and reduced-motion aware.',
    media: {
      // image: '/media/sliding-tabs/poster.png',
      // video: '/media/sliding-tabs/preview.mp4',
    },
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/sliding-tabs.tsx',
        target: 'components/tweenui/sliding-tabs.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/sliding-tabs.tsx',
      },
    ],
    usage: {
      react: `import SlidingTabs from '@/components/tweenui/sliding-tabs';

const items = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'services', label: 'Service' },
];

export default function Example() {
  return <SlidingTabs items={items} defaultValue="home" />;
}`,
    },
  },
  {
    name: 'avatar-reveal',
    type: 'component',
    title: 'Avatar Reveal',
    description:
      'Overlapping avatars that pop in with an elastic blur, then the caption slides in from the right. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/avatar-reveal.tsx',
        target: 'components/tweenui/avatar-reveal.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/avatar-reveal.tsx',
      },
    ],
    usage: {
      react: `import AvatarReveal from '@/components/tweenui/avatar-reveal';

export default function Example() {
  return <AvatarReveal>2,000+ teams shipping faster this week.</AvatarReveal>;
}`,
    },
  },
  {
    name: 'auth-modal',
    type: 'component',
    title: 'Auth Modal',
    description:
      'A sign-in dialog that fades the backdrop, then scales the panel in with staggered content. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/auth-modal.tsx',
        target: 'components/tweenui/auth-modal.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/auth-modal.tsx',
      },
    ],
    usage: {
      react: `import { useState } from 'react';
import AuthModal from '@/components/tweenui/auth-modal';

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
    name: 'number-counter',
    type: 'component',
    title: 'Number Counter',
    description:
      'Digits that count up once when the number scrolls into view. GSAP ScrollTrigger plus Number Flow, and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react', '@number-flow/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/number-counter.tsx',
        target: 'components/tweenui/number-counter.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'instant',
        label: 'Instant',
        reactSource: 'registry/tweenui/number-counter.tsx',
      },
      {
        id: 'viewport',
        label: 'Viewport',
        reactSource: 'registry/tweenui/number-counter.tsx',
      },
    ],
    usage: {
      react: `import NumberCounter from '@/components/tweenui/number-counter';

export default function Example() {
  return (
    <p>
      <NumberCounter value={150} instant />+ projects delivered
    </p>
  );
}`,
    },
  },
  {
    name: 'voice-sample-player',
    type: 'component',
    title: 'Voice Sample Player',
    description:
      'An audio player pill: on play the label slides away, a lime waveform equalizer slides in, and the icon morphs to pause. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/voice-sample-player.tsx',
        target: 'components/tweenui/voice-sample-player.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/voice-sample-player.tsx',
      },
    ],
    usage: {
      react: `import VoiceSamplePlayer from '@/components/tweenui/voice-sample-player';

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
    name: 'flip-card',
    type: 'component',
    title: 'Flip Card',
    description:
      'A card that flips in 3D on hover (or tap on touch) to reveal a description, feature list, and CTA, with the back content staggering in. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/flip-card.tsx',
        target: 'components/tweenui/flip-card.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/flip-card.tsx',
      },
    ],
    usage: {
      react: `import FlipCard from '@/components/tweenui/flip-card';

export default function Example() {
  return (
    <FlipCard
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
    title: 'FAQ Accordion',
    description:
      'A single-open accordion that animates its height open and reveals the answer line by line with a SplitText mask; the icon morphs from plus to minus. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/faq-accordion.tsx',
        target: 'components/tweenui/faq-accordion.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/faq-accordion.tsx',
      },
    ],
    usage: {
      react: `import FaqAccordion from '@/components/tweenui/faq-accordion';

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
    title: 'Shiny Button',
    description:
      'A pill button with a diagonal light sweep that glides across on hover, plus a sparkle icon that twinkles. Pure CSS, keyboard accessible, and reduced-motion aware.',
    media: {},
    dependencies: [], // CSS-only — no gsap
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/shiny-button.tsx',
        target: 'components/tweenui/shiny-button.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/shiny-button.tsx',
      },
    ],
    usage: {
      react: `import ShinyButton from '@/components/tweenui/shiny-button';

export default function Example() {
  return <ShinyButton onClick={() => {}}>Get started</ShinyButton>;
}`,
    },
  },
  {
    name: 'text-roll-button',
    type: 'component',
    title: 'Text Roll Button',
    description:
      'A pill button whose label rolls up character by character on hover, swapping to a fresh copy via a SplitText stagger. GSAP-driven, keyboard accessible, and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/text-roll-button.tsx',
        target: 'components/tweenui/text-roll-button.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/text-roll-button.tsx',
      },
    ],
    usage: {
      react: `import TextRollButton from '@/components/tweenui/text-roll-button';

export default function Example() {
  return <TextRollButton onClick={() => {}}>Try now</TextRollButton>;
}`,
    },
  },
  {
    name: 'slide-arrow-button',
    type: 'component',
    title: 'Slide Arrow Button',
    description:
      'A pill button whose label rolls up on hover while a chevron slides out of its lime badge and a fresh one slides in. Pure CSS, keyboard accessible, and reduced-motion aware.',
    media: {},
    dependencies: [], // CSS-only — no gsap
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/slide-arrow-button.tsx',
        target: 'components/tweenui/slide-arrow-button.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/slide-arrow-button.tsx',
      },
    ],
    usage: {
      react: `import SlideArrowButton from '@/components/tweenui/slide-arrow-button';

export default function Example() {
  return <SlideArrowButton onClick={() => {}}>Get started</SlideArrowButton>;
}`,
    },
  },
  {
    name: 'glow-button',
    type: 'component',
    title: 'Glow Button',
    description:
      'A pill button floating over a soft, colorful glow that sharpens on hover while a chevron slides through. Pure CSS, keyboard accessible, and reduced-motion aware.',
    media: {},
    dependencies: [], // CSS-only — no gsap
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/glow-button.tsx',
        target: 'components/tweenui/glow-button.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/glow-button.tsx',
      },
    ],
    usage: {
      react: `import GlowButton from '@/components/tweenui/glow-button';

export default function Example() {
  return <GlowButton onClick={() => {}}>Get started</GlowButton>;
}`,
    },
  },
  {
    name: 'logo-orbit',
    type: 'component',
    title: 'Logo Orbit',
    description:
      'Logos spaced evenly around a ring that rotates continuously while each logo stays upright. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/logo-orbit.tsx',
        target: 'components/tweenui/logo-orbit.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/logo-orbit.tsx',
      },
    ],
    usage: {
      react: `import LogoOrbit from '@/components/tweenui/logo-orbit';

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
    title: 'Logo Cycle',
    description:
      'A logo row that swaps groups with a staggered blur-slide. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/logo-cycle.tsx',
        target: 'components/tweenui/logo-cycle.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/logo-cycle.tsx',
      },
    ],
    usage: {
      react: `import LogoCycle from '@/components/tweenui/logo-cycle';

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
    title: 'Logo Wave',
    description:
      'An infinite logo strip whose center mark rises and scales, with neighbors forming a descending arc. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/logo-wave.tsx',
        target: 'components/tweenui/logo-wave.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/logo-wave.tsx',
      },
    ],
    usage: {
      react: `import LogoWave from '@/components/tweenui/logo-wave';

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
    title: 'Image Fan Slider',
    description:
      'A fanned stack of images that auto-advances: the center is sharp, neighbors sit rotated and blurred. CSS-driven and reduced-motion aware.',
    media: {},
    dependencies: [],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/image-fan-slider.tsx',
        target: 'components/tweenui/image-fan-slider.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/image-fan-slider.tsx',
      },
    ],
    usage: {
      react: `import ImageFanSlider from '@/components/tweenui/image-fan-slider';

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
