'use client';

import LogoOrbit from '@/registry/tweenui/orbit/logo-orbit';

// Full-colour brand marks from Iconify's `logos` set.
const icon = (name: string) => `https://api.iconify.design/logos:${name}.svg`;

const LOGOS = [
  { src: icon('figma'), alt: 'Figma' },
  { src: icon('greensock'), alt: 'GSAP' },
  { src: icon('tailwindcss-icon'), alt: 'Tailwind CSS' },
  { src: icon('react'), alt: 'React' },
  { src: icon('typescript-icon'), alt: 'TypeScript' },
  { src: icon('discord-icon'), alt: 'Discord' },
  { src: icon('github-icon'), alt: 'GitHub' },
  { src: icon('slack-icon'), alt: 'Slack' },
];

export default function LogoOrbitDemo() {
  return <LogoOrbit logos={LOGOS} size={280} speed={0.5} />;
}
