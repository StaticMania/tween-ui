'use client';

import LogoWave from '@/registry/tweenui/logo/logo-wave';

// Brand marks from Iconify (`logos` for colour, `simple-icons` for Figma + GSAP wordmark).
const icon = (set: string, name: string, color?: string) => {
  const url = `https://api.iconify.design/${set}:${name}.svg`;
  return color ? `${url}?color=${encodeURIComponent(color)}` : url;
};

const WHITE = '#ffffff';

const LOGOS = [
  {
    src: icon('simple-icons', 'figma'),
    srcDark: icon('simple-icons', 'figma', WHITE),
    alt: 'Figma',
  },
  { src: icon('simple-icons', 'gsap'), srcDark: icon('simple-icons', 'gsap', WHITE), alt: 'GSAP' },
  { src: icon('logos', 'tailwindcss-icon'), alt: 'Tailwind CSS' },
  { src: icon('logos', 'react'), alt: 'React' },
  { src: icon('logos', 'typescript-icon'), alt: 'TypeScript' },
  { src: icon('logos', 'discord-icon'), alt: 'Discord' },
  {
    src: icon('simple-icons', 'github'),
    srcDark: icon('simple-icons', 'github', WHITE),
    alt: 'GitHub',
  },
  { src: icon('logos', 'slack-icon'), alt: 'Slack' },
  { src: icon('simple-icons', 'linear'), alt: 'Linear' },
  { src: icon('logos', 'notion-icon'), alt: 'Notion' },
  { src: icon('logos', 'vercel-icon'), alt: 'Vercel' },
  { src: icon('logos', 'nextjs-icon'), alt: 'Next.js' },
];

export default function LogoWaveDemo() {
  return <LogoWave logos={LOGOS} duration={30} />;
}
