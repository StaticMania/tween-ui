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
      'A pricing section where picking a plan morphs the name badge, crossfades the description and spins the price with Number Flow, while the checklist lights up its included rows. A monthly/yearly toggle re-spins the price.',
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
      'Numbered steps on a timeline whose connector fills before the next card slides and blurs into place — image one way, copy the other. Hover pauses the loop; clicking a step jumps there.',
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
      'A process block whose heading, divider and step numbers stay sticky inside the section while the cards scroll past them. No GSAP — just Intersection Observer.',
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
    name: 'strip-wipe',
    type: 'block',
    title: 'Strip Wipe',
    description:
      'A split testimonial slider whose photo wipes in as tiled strips beside the quote, the index ticking over on Number Flow. Prev and next reverse the wipe direction.',
    media: {},
    dependencies: ['gsap', '@gsap/react', '@number-flow/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/strip-wipe.tsx',
        target: 'components/tweenui/strip-wipe.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/strip-wipe.tsx',
      },
    ],
    usage: {
      react: `import StripWipe from '@/components/tweenui/strip-wipe';

export default function Example() {
  return <StripWipe />;
}`,
    },
  },
  {
    name: 'rating-carousel',
    type: 'block',
    title: 'Rating Carousel',
    description:
      'A Swiper testimonial row of rating cards: drag or swipe it, and off-window cards fade and blur as they leave. Autoplay pauses on hover, and dots jump to a card.',
    media: {},
    dependencies: ['swiper'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/rating-carousel.tsx',
        target: 'components/tweenui/rating-carousel.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/rating-carousel.tsx',
      },
    ],
    usage: {
      react: `import RatingCarousel from '@/components/tweenui/rating-carousel';

export default function Example() {
  return <RatingCarousel />;
}`,
    },
  },
  {
    name: 'cta-image-fan',
    type: 'block',
    title: 'CTA Image Fan',
    description:
      'A call-to-action with a fanned photo stack auto-advancing above the headline and a shiny button below. Built from Image Fan Slider and Shiny Button.',
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
    name: 'cta-photo-headline',
    type: 'block',
    title: 'CTA Photo Headline',
    description:
      'A call-to-action where avatars pop in above a heading with two photos tucked into the copy — a pill that grows from the left, then a tilted square that drops into place.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: ['slide-arrow-button'],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/cta-photo-headline.tsx',
        target: 'components/tweenui/cta-photo-headline.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/cta-photo-headline.tsx',
      },
    ],
    usage: {
      react: `import CtaPhotoHeadline from '@/components/tweenui/cta-photo-headline';

export default function Example() {
  return <CtaPhotoHeadline />;
}`,
    },
  },
  {
    name: 'blog-hover-expand',
    type: 'block',
    title: 'Blog Hover Expand',
    description:
      'A three-post blog row where the hovered card grows wider, its photo scales and tilts, and the title draws an underline. Pure CSS.',
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
      'A hub-and-spoke integrations diagram: the center pops in, paths draw out to six logos, then a dot travels each line. Uses MotionPathPlugin.',
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
    name: 'infinite-rotating-cards',
    type: 'block',
    title: 'Infinite Rotating Cards',
    description:
      'A hero wheel of photo cards set on a large circle so only the top arc shows, spinning slowly so the next idea always comes into view.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/infinite-rotating-cards.tsx',
        target: 'components/tweenui/infinite-rotating-cards.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/infinite-rotating-cards.tsx',
      },
    ],
    usage: {
      react: `import InfiniteRotatingCards from '@/components/tweenui/infinite-rotating-cards';

export default function Example() {
  return <InfiniteRotatingCards />;
}`,
    },
  },
  {
    name: 'card-hover-expand',
    type: 'block',
    title: 'Card Hover Expand',
    description:
      'A card row where the hovered card grows wider, its photo fades in and the title drops to the bottom over a gradient. Every card stays expanded on small screens. Pure CSS.',
    media: {},
    dependencies: [],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/card-hover-expand.tsx',
        target: 'components/tweenui/card-hover-expand.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/card-hover-expand.tsx',
      },
    ],
    usage: {
      react: `import CardHoverExpand from '@/components/tweenui/card-hover-expand';

export default function Example() {
  return <CardHoverExpand />;
}`,
    },
  },
  {
    name: 'card-spotlight-grid',
    type: 'block',
    title: 'Card Spotlight Grid',
    description:
      'A staggered project grid — tile heights cycle every six cards — where the hovered tile tilts toward the cursor in 3D while its siblings scale back and dim. Pointer-only.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/card-spotlight-grid.tsx',
        target: 'components/tweenui/card-spotlight-grid.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/card-spotlight-grid.tsx',
      },
    ],
    usage: {
      react: `import CardSpotlightGrid from '@/components/tweenui/card-spotlight-grid';

export default function Example() {
  return <CardSpotlightGrid />;
}`,
    },
  },
  {
    name: 'column-drift',
    type: 'block',
    title: 'Column Drift',
    description:
      'Three columns of review cards that swing in from the sides as the section scrolls, then drift past each other at different speeds. Cards lift on hover with an underline wipe. GSAP + ScrollTrigger.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/column-drift.tsx',
        target: 'components/tweenui/column-drift.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/column-drift.tsx',
      },
    ],
    usage: {
      react: `import ColumnDrift from '@/components/tweenui/column-drift';

export default function Example() {
  return <ColumnDrift />;
}`,
    },
  },
  {
    name: 'team-scatter-focus',
    type: 'block',
    title: 'Team Scatter Focus',
    description:
      'A scattered team collage whose cards each fly in from their own direction, then blur and shrink back from whichever one you hover. Falls back to a stacked grid below lg.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/team-scatter-focus.tsx',
        target: 'components/tweenui/team-scatter-focus.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/team-scatter-focus.tsx',
      },
    ],
    usage: {
      react: `import TeamScatterFocus from '@/components/tweenui/team-scatter-focus';

export default function Example() {
  return <TeamScatterFocus />;
}`,
    },
  },
  {
    name: 'tab-wipe',
    type: 'block',
    title: 'Tab Wipe',
    description:
      'A centered screenshot stage that wipes between slides on a clip-path edge while the incoming shot settles out of a slight scale and drift. The thumbnail strip is a real tablist, and the stage autoplays between clicks.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/tab-wipe.tsx',
        target: 'components/tweenui/tab-wipe.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/tab-wipe.tsx',
      },
    ],
    usage: {
      react: `import TabWipe from '@/components/tweenui/tab-wipe';

export default function Example() {
  return <TabWipe />;
}`,
    },
  },
  {
    name: 'logo-wall-shuffle',
    type: 'block',
    title: 'Logo Wall Shuffle',
    description:
      'An integrations wall of staggered logo tiles where one mark at a time lifts away and the next rises in behind it. Every tile is visited before any repeats, and the loop pauses off-screen and in background tabs.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/logo-wall-shuffle.tsx',
        target: 'components/tweenui/logo-wall-shuffle.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/logo-wall-shuffle.tsx',
      },
    ],
    usage: {
      react: `import LogoWallShuffle from '@/components/tweenui/logo-wall-shuffle';

const LOGOS = [
  { src: '/logos/slack.svg', alt: 'Slack' },
  { src: '/logos/figma.svg', alt: 'Figma' },
  { src: '/logos/linear.svg', srcDark: '/logos/linear-dark.svg', alt: 'Linear' },
];

export default function Example() {
  return <LogoWallShuffle logos={LOGOS} />;
}`,
    },
  },
  {
    name: 'testimonial-line-sweep',
    type: 'block',
    title: 'Testimonial Line Sweep',
    description:
      'A paged testimonial pair whose text sweeps out line by line behind masks while the portrait irises shut, then the next quote arrives the same way. Pages with buttons or arrow keys. GSAP + SplitText.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/testimonial-line-sweep.tsx',
        target: 'components/tweenui/testimonial-line-sweep.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/testimonial-line-sweep.tsx',
      },
    ],
    usage: {
      react: `import TestimonialLineSweep from '@/components/tweenui/testimonial-line-sweep';

export default function Example() {
  return <TestimonialLineSweep />;
}`,
    },
  },
  {
    name: 'cta-starfall',
    type: 'block',
    title: 'CTA Starfall',
    description:
      'A dark closing section under a slow field of drifting stars lit by a violet bloom. The field is full on the first frame rather than spawning over time, and pauses off-screen and in background tabs.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: ['shiny-button'],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/cta-starfall.tsx',
        target: 'components/tweenui/cta-starfall.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/cta-starfall.tsx',
      },
    ],
    usage: {
      react: `import CtaStarfall from '@/components/tweenui/cta-starfall';

export default function Example() {
  return <CtaStarfall />;
}`,
    },
  },
  {
    name: 'pricing-usage-slider',
    type: 'block',
    title: 'Pricing Usage Slider',
    description:
      'A two-plan pricing section where the second card prices itself from a volume slider, the figure spinning with Number Flow as you drag while the track fills behind the handle.',
    media: {},
    dependencies: ['@number-flow/react'],
    registryDependencies: ['slide-arrow-button'],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/pricing-usage-slider.tsx',
        target: 'components/tweenui/pricing-usage-slider.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/pricing-usage-slider.tsx',
      },
    ],
    usage: {
      react: `import PricingUsageSlider from '@/components/tweenui/pricing-usage-slider';

export default function Example() {
  return <PricingUsageSlider />;
}`,
    },
  },
  {
    name: 'grid-cascade',
    type: 'block',
    title: 'Grid Cascade',
    description:
      'A three-up testimonial grid that pages a whole set at a time — the current cards drop away on a stagger, then the next set cascades in from above, so the two never overlap mid-flight.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/grid-cascade.tsx',
        target: 'components/tweenui/grid-cascade.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/grid-cascade.tsx',
      },
    ],
    usage: {
      react: `import GridCascade from '@/components/tweenui/grid-cascade';

export default function Example() {
  return <GridCascade />;
}`,
    },
  },
];
