import type { RegistryEntry } from './schema';

const PRICING_DIR = 'registry/tweenui/pricing';

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
];
