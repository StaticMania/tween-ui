'use client';

import LogoOrbit from '@/registry/tweenui/orbit/logo-orbit';

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
];

export default function LogoOrbitDemo() {
  return <LogoOrbit logos={LOGOS} size={280} speed={0.5} />;
}
