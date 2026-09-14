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
    name: 'strip-wipe',
    type: 'block',
    title: 'Strip Wipe',
    description:
      'A testimonial slider whose photo wipes in as tiled strips beside the quote. Prev and next reverse the split direction. GSAP-driven and reduced-motion aware.',
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
      'A Swiper testimonial row of rating cards that autoplay, blur off-window slides, and page with clickable dots.',
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
    name: 'cta-photo-headline',
    type: 'block',
    title: 'CTA Photo Headline',
    description:
      'A call-to-action with staggered avatars and photos tucked into the heading, then a slide-arrow button. GSAP-driven and reduced-motion aware.',
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
    name: 'card-hover-expand',
    type: 'block',
    title: 'Card Hover Expand',
    description:
      'A card row where hovering one widens it, fades the photo in, and drops the copy to the bottom. CSS-driven and reduced-motion aware.',
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
    name: 'project-spotlight-grid',
    type: 'block',
    title: 'Project Spotlight Grid',
    description:
      'A staggered project grid where the hovered tile tilts toward the cursor in 3D while the rest scale back and dim. GSAP-driven, pointer-only, and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/project-spotlight-grid.tsx',
        target: 'components/tweenui/project-spotlight-grid.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/project-spotlight-grid.tsx',
      },
    ],
    usage: {
      react: `import ProjectSpotlightGrid from '@/components/tweenui/project-spotlight-grid';

export default function Example() {
  return <ProjectSpotlightGrid />;
}`,
    },
  },
  {
    name: 'column-drift',
    type: 'block',
    title: 'Column Drift',
    description:
      'Three columns of review cards that swing in from the sides as the section scrolls up, then drift past each other at different speeds. Cards lift on hover with an underline wipe. GSAP-driven and reduced-motion aware.',
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
      'A team collage whose cards fly in from their own directions, then blur and shrink away from whichever one you hover. Falls back to a stacked grid on small screens. GSAP-driven and reduced-motion aware.',
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
    name: 'hero-tab-wipe',
    type: 'block',
    title: 'Hero Tab Wipe',
    description:
      'A centered screenshot stage that wipes between slides on a clip-path edge while the incoming shot settles out of a slight scale and drift. A thumbnail tab strip picks a slide, and it autoplays between clicks. GSAP-driven and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/hero-tab-wipe.tsx',
        target: 'components/tweenui/hero-tab-wipe.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/hero-tab-wipe.tsx',
      },
    ],
    usage: {
      react: `import HeroTabWipe from '@/components/tweenui/hero-tab-wipe';

export default function Example() {
  return <HeroTabWipe />;
}`,
    },
  },
  {
    name: 'logo-wall-shuffle',
    type: 'block',
    title: 'Logo Wall Shuffle',
    description:
      'An integrations wall of staggered logo tiles where one mark at a time lifts away and the next rises in behind it. Pauses off-screen and in background tabs. GSAP-driven and reduced-motion aware.',
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
    name: 'line-sweep',
    type: 'block',
    title: 'Line Sweep',
    description:
      'A paged testimonial pair whose text sweeps out line by line behind masks while the portrait irises shut, then the next quote arrives the same way. Pages with buttons or arrow keys. GSAP + SplitText, and reduced-motion aware.',
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: 'registry/tweenui/line-sweep.tsx',
        target: 'components/tweenui/line-sweep.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: 'registry/tweenui/line-sweep.tsx',
      },
    ],
    usage: {
      react: `import LineSweep from '@/components/tweenui/line-sweep';

export default function Example() {
  return <LineSweep />;
}`,
    },
  },
  {
    name: 'cta-starfall',
    type: 'block',
    title: 'CTA Starfall',
    description:
      'A dark call-to-action under a slow field of drifting stars, lit by a violet bloom at the top edge. The field is full on the first frame and pauses off-screen. GSAP-driven and reduced-motion aware.',
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
      'A three-up testimonial grid that pages a whole set at a time — the current cards drop away on a stagger, then the next set cascades in from above. GSAP-driven and reduced-motion aware.',
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
