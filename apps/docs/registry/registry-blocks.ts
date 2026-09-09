import type { RegistryEntry } from './schema';

/**
 * Pre-composed sections built from primitives. Same registry shape as `ui`,
 * with `type: "block"`; `registryDependencies` points at any components a block
 * reuses (empty when the block is self-contained).
 */
export const blocks: RegistryEntry[] = [
  {
    name: 'pricing-plan-switch',
    type: 'block',
    title: 'Pricing Plan Switch',
    description:
      'A pricing section where picking a plan morphs the name badge, crossfades the description, and spins the price with Number Flow, plus a monthly/yearly toggle and an activating feature checklist. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react', '@number-flow/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/pricing-plan-switch.tsx',
        target: 'components/tweenui/pricing-plan-switch.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/pricing-plan-switch.tsx',
      },
    ],
    usage: {
      react: `import PricingPlanSwitch from '@/components/tweenui/pricing-plan-switch';

export default function Example() {
  return <PricingPlanSwitch />;
}`,
    },
  },
  {
    name: 'process-card-reveal',
    type: 'block',
    title: 'Process Card Reveal',
    description:
      'A process section where a numbered timeline fills, then the next stacked card slides and blurs into place. Hover pauses the loop; clicking a step jumps there. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/process-card-reveal.tsx',
        target: 'components/tweenui/process-card-reveal.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/process-card-reveal.tsx',
      },
    ],
    usage: {
      react: `import ProcessCardReveal from '@/components/tweenui/process-card-reveal';

export default function Example() {
  return <ProcessCardReveal />;
}`,
    },
  },
  {
    name: 'process-sticky-steps',
    type: 'block',
    title: 'Process Sticky Steps',
    description:
      'A process section where a sticky heading and numbered buttons track the card in view. Clicking a step jumps there. Reduced-motion aware.',
    media: {},
    dependencies: [],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/process-sticky-steps.tsx',
        target: 'components/tweenui/process-sticky-steps.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/process-sticky-steps.tsx',
      },
    ],
    usage: {
      react: `import ProcessStickySteps from '@/components/tweenui/process-sticky-steps';

export default function Example() {
  return <ProcessStickySteps />;
}`,
    },
  },
  {
    name: 'testimonial-split-slide',
    type: 'block',
    title: 'Testimonial Split Slide',
    description:
      'A testimonial slider whose photo wipes in as tiled strips beside the quote. Prev and next reverse the split direction. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react', '@number-flow/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/testimonial-split-slide.tsx',
        target: 'components/tweenui/testimonial-split-slide.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/testimonial-split-slide.tsx',
      },
    ],
    usage: {
      react: `import TestimonialSplitSlide from '@/components/tweenui/testimonial-split-slide';

export default function Example() {
  return <TestimonialSplitSlide />;
}`,
    },
  },
  {
    name: 'testimonial-card-carousel',
    type: 'block',
    title: 'Testimonial Card Carousel',
    description:
      'A Swiper testimonial row of rating cards that autoplay, blur off-window slides, and page with clickable dots.',
    media: {},
    dependencies: ['swiper'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/testimonial-card-carousel.tsx',
        target: 'components/tweenui/testimonial-card-carousel.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/testimonial-card-carousel.tsx',
      },
    ],
    usage: {
      react: `import TestimonialCardCarousel from '@/components/tweenui/testimonial-card-carousel';

export default function Example() {
  return <TestimonialCardCarousel />;
}`,
    },
  },
  {
    name: 'cta-image-fan',
    type: 'block',
    title: 'CTA Image Fan',
    description:
      'A call-to-action section with a fanned photo stack that auto-advances above a shiny button. Reduced-motion aware.',
    media: {},
    dependencies: [],
    registryDependencies: ['image-fan-slider', 'shiny-button'],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/cta-image-fan.tsx',
        target: 'components/tweenui/cta-image-fan.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/cta-image-fan.tsx',
      },
    ],
    usage: {
      react: `import CtaImageFan from '@/components/tweenui/cta-image-fan';

export default function Example() {
  return <CtaImageFan />;
}`,
    },
  },
  {
    name: 'cta-headline-photos',
    type: 'block',
    title: 'CTA Headline Photos',
    description:
      'A call-to-action with staggered avatars and photos tucked into the heading, then a slide-arrow button. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: ['slide-arrow-button'],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/cta-headline-photos.tsx',
        target: 'components/tweenui/cta-headline-photos.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/cta-headline-photos.tsx',
      },
    ],
    usage: {
      react: `import CtaHeadlinePhotos from '@/components/tweenui/cta-headline-photos';

export default function Example() {
  return <CtaHeadlinePhotos />;
}`,
    },
  },
  {
    name: 'blog-hover-expand',
    type: 'block',
    title: 'Blog Hover Expand',
    description:
      'A blog row where hovering a card widens it while the photo scales and tilts. Reduced-motion aware.',
    media: {},
    dependencies: [],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/blog-hover-expand.tsx',
        target: 'components/tweenui/blog-hover-expand.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/blog-hover-expand.tsx',
      },
    ],
    usage: {
      react: `import BlogHoverExpand from '@/components/tweenui/blog-hover-expand';

export default function Example() {
  return <BlogHoverExpand />;
}`,
    },
  },
  {
    name: 'integration-hub',
    type: 'block',
    title: 'Integration Hub',
    description:
      'A hub-and-spoke integrations diagram: the center pops in, paths draw to six logos, then dots travel the lines. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/integration-hub.tsx',
        target: 'components/tweenui/integration-hub.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/integration-hub.tsx',
      },
    ],
    usage: {
      react: `import IntegrationHub from '@/components/tweenui/integration-hub';

export default function Example() {
  return <IntegrationHub />;
}`,
    },
  },
  {
    name: 'hero-rotating-cards',
    type: 'block',
    title: 'Hero Rotating Cards',
    description:
      'A hero wheel of photo cards that slowly spins so the next idea always comes into view. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/hero-rotating-cards.tsx',
        target: 'components/tweenui/hero-rotating-cards.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/hero-rotating-cards.tsx',
      },
    ],
    usage: {
      react: `import HeroRotatingCards from '@/components/tweenui/hero-rotating-cards';

export default function Example() {
  return <HeroRotatingCards />;
}`,
    },
  },
  {
    name: 'scroll-spin-image',
    type: 'block',
    title: 'Scroll Spin Image',
    description:
      'A decorative image that spins continuously and speeds up in the scroll direction. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/scroll-spin-image.tsx',
        target: 'components/tweenui/scroll-spin-image.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/scroll-spin-image.tsx',
      },
    ],
    usage: {
      react: `import ScrollSpinImage from '@/components/tweenui/scroll-spin-image';

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
    name: 'card-expand-on-hover',
    type: 'block',
    title: 'Card Expand on Hover',
    description:
      'A card row where hovering one widens it, fades the photo in, and drops the copy to the bottom. CSS-driven and reduced-motion aware.',
    media: {},
    dependencies: [],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/card-expand-on-hover.tsx',
        target: 'components/tweenui/card-expand-on-hover.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/card-expand-on-hover.tsx',
      },
    ],
    usage: {
      react: `import CardExpandOnHover from '@/components/tweenui/card-expand-on-hover';

export default function Example() {
  return <CardExpandOnHover />;
}`,
    },
  },
];
