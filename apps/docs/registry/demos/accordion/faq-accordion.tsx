'use client';

import FaqAccordion from '@/registry/tweenui/accordion/faq-accordion';

const ITEMS = [
  {
    question: 'What is Tween UI?',
    answer:
      'A collection of GSAP and CSS animated components for React. Copy the source into your project and own every interaction — no black-box package to fight.',
  },
  {
    question: 'How do I install a component?',
    answer:
      'Use the CLI (pnpm dlx shadcn@latest add …) to drop the files straight into your project, or copy the single-file source from the Manual tab.',
  },
  {
    question: 'Does it respect reduced motion?',
    answer:
      'Yes. Every component checks prefers-reduced-motion and swaps to an instant, motion-free state so it stays comfortable and accessible.',
  },
  {
    question: 'Can I customize the animations?',
    answer:
      'Completely. The timings, easing, and colors live inline in the source you copy, so you can tune or rewrite any part of the motion.',
  },
];

export default function FaqAccordionDemo() {
  return <FaqAccordion items={ITEMS} />;
}
