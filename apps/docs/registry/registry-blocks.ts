import type { RegistryEntry } from './schema';

const PRICING_DIR = 'registry/tweenui/pricing';
const PROCESS_DIR = 'registry/tweenui/process';
const TESTIMONIAL_DIR = 'registry/tweenui/testimonial';

/**
 * Pre-composed sections built from primitives. Same registry shape as `ui`,
 * with `type: "block"`; `registryDependencies` points at any components a block
 * reuses (empty when the block is self-contained).
 */
export const blocks: RegistryEntry[] = [
  {
    name: 'pricing-plan-switch',
    type: 'block',
    group: 'pricing',
    title: 'Pricing Plan Switch',
    description:
      'A pricing section where picking a plan morphs the name badge, crossfades the description, and spins the price with Number Flow, plus a monthly/yearly toggle and an activating feature checklist. GSAP-driven and reduced-motion aware.',
    isNew: true,
    media: {},
    dependencies: ['gsap', '@gsap/react', '@number-flow/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${PRICING_DIR}/pricing-plan-switch.tsx`,
        target: 'components/tweenui/pricing/pricing-plan-switch.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${PRICING_DIR}/pricing-plan-switch.tsx`,
      },
    ],
    usage: {
      react: `import PricingPlanSwitch from '@/components/tweenui/pricing/pricing-plan-switch';

export default function Example() {
  return <PricingPlanSwitch />;
}`,
    },
  },
  {
    name: 'process-card-reveal',
    type: 'block',
    group: 'process',
    title: 'Process Card Reveal',
    description:
      'A process section where a numbered timeline fills, then the next stacked card slides and blurs into place. Hover pauses the loop; clicking a step jumps there. GSAP-driven and reduced-motion aware.',
    isNew: true,
    media: {},
    dependencies: ['gsap', '@gsap/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${PROCESS_DIR}/process-card-reveal.tsx`,
        target: 'components/tweenui/process/process-card-reveal.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${PROCESS_DIR}/process-card-reveal.tsx`,
      },
    ],
    usage: {
      react: `import ProcessCardReveal from '@/components/tweenui/process/process-card-reveal';

export default function Example() {
  return <ProcessCardReveal />;
}`,
    },
  },
  {
    name: 'testimonial-split-slide',
    type: 'block',
    group: 'testimonial',
    title: 'Testimonial Split Slide',
    description:
      'A testimonial slider whose photo wipes in as tiled strips beside the quote. Prev and next reverse the split direction. GSAP-driven and reduced-motion aware.',
    isNew: true,
    media: {},
    dependencies: ['gsap', '@gsap/react', '@number-flow/react'],
    registryDependencies: [],
    cssVars: {},
    files: [
      {
        path: `${TESTIMONIAL_DIR}/testimonial-split-slide.tsx`,
        target: 'components/tweenui/testimonial/testimonial-split-slide.tsx',
        kind: 'react',
      },
    ],
    variants: [
      {
        id: 'default',
        label: 'Preview',
        reactSource: `${TESTIMONIAL_DIR}/testimonial-split-slide.tsx`,
      },
    ],
    usage: {
      react: `import TestimonialSplitSlide from '@/components/tweenui/testimonial/testimonial-split-slide';

export default function Example() {
  return <TestimonialSplitSlide />;
}`,
    },
  },
];
