'use client';

import LogoCycle from '@/registry/tweenui/logo/logo-cycle';

// Brand marks from Iconify (`logos` for colour, `simple-icons` for Figma + GSAP wordmark).
const icon = (set: string, name: string) => `https://api.iconify.design/${set}:${name}.svg`;

const LOGOS = [
  { src: icon('simple-icons', 'figma'), alt: 'Figma' },
  { src: icon('simple-icons', 'gsap'), alt: 'GSAP' },
  { src: icon('logos', 'tailwindcss-icon'), alt: 'Tailwind CSS' },
  { src: icon('logos', 'react'), alt: 'React' },
  { src: icon('logos', 'typescript-icon'), alt: 'TypeScript' },
  { src: icon('logos', 'discord-icon'), alt: 'Discord' },
  { src: icon('logos', 'github-icon'), alt: 'GitHub' },
  { src: icon('logos', 'slack-icon'), alt: 'Slack' },
  { src: icon('simple-icons', 'linear'), alt: 'Linear' },
  { src: icon('logos', 'notion-icon'), alt: 'Notion' },
  { src: icon('logos', 'vercel-icon'), alt: 'Vercel' },
  { src: icon('logos', 'nextjs-icon'), alt: 'Next.js' },
];

export default function LogoCycleDemo() {
  return <LogoCycle logos={LOGOS} visibleCount={6} />;
}
