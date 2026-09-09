'use client';

import LogoWallShuffle from '@/registry/tweenui/logo-wall-shuffle';

// Brand marks from Iconify (`logos` for colour, `simple-icons` where a mono
// mark needs a dark-mode variant).
const icon = (set: string, name: string, color?: string) => {
  const url = `https://api.iconify.design/${set}:${name}.svg`;
  return color ? `${url}?color=${encodeURIComponent(color)}` : url;
};

const WHITE = '#ffffff';

const LOGOS = [
  { src: icon('logos', 'slack-icon'), alt: 'Slack' },
  { src: icon('logos', 'figma'), alt: 'Figma' },
  { src: icon('logos', 'notion-icon'), alt: 'Notion' },
  {
    src: icon('simple-icons', 'linear'),
    srcDark: icon('simple-icons', 'linear', WHITE),
    alt: 'Linear',
  },
  { src: icon('logos', 'google-drive'), alt: 'Google Drive' },
  { src: icon('logos', 'jira'), alt: 'Jira' },
  { src: icon('logos', 'stripe'), alt: 'Stripe' },
  {
    src: icon('simple-icons', 'github'),
    srcDark: icon('simple-icons', 'github', WHITE),
    alt: 'GitHub',
  },
  { src: icon('logos', 'discord-icon'), alt: 'Discord' },
  { src: icon('logos', 'zoom-icon'), alt: 'Zoom' },
  { src: icon('logos', 'hubspot'), alt: 'HubSpot' },
  { src: icon('logos', 'mailchimp-freddie'), alt: 'Mailchimp' },
  { src: icon('logos', 'asana-icon'), alt: 'Asana' },
  { src: icon('logos', 'airtable'), alt: 'Airtable' },
  { src: icon('logos', 'intercom-icon'), alt: 'Intercom' },
  { src: icon('logos', 'zapier-icon'), alt: 'Zapier' },
  { src: icon('logos', 'dropbox'), alt: 'Dropbox' },
  {
    src: icon('simple-icons', 'vercel'),
    srcDark: icon('simple-icons', 'vercel', WHITE),
    alt: 'Vercel',
  },
];

export default function LogoWallShuffleDemo() {
  return (
    <div className="w-full rounded-xl bg-[#f7f8f8] dark:bg-[#0d1117]">
      <LogoWallShuffle logos={LOGOS} />
    </div>
  );
}
