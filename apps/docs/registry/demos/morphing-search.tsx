'use client';

import MorphingSearch from '@/registry/tweenui/morphing-search';

const components = [
  'Pixel Fill Button',
  'Glow Button',
  'Magnetic Button',
  'Shiny Button',
  'Slant Morph Button',
  'Sliding Tabs',
  'Spring Tooltip',
  'Morphing Text',
  'Number Counter',
  'Logo Orbit',
  'Navbar Gooey Bloom',
  'Pricing Plan Switch',
  'FAQ Accordion',
  'Flip Card',
];

const MorphingSearchDemo = () => {
  return (
    <div className="flex h-full w-full items-center justify-center px-4">
      <MorphingSearch
        placeholder="Search Tween UI"
        label="Search Tween UI components"
        defaultChips={['Buttons']}
        defaultRecents={['Spring Tooltip', 'Navbar Gooey Bloom', 'Pricing Plan Switch']}
        maxRecents={4}
        maxSuggestions={3}
        maxChips={4}
        suggestions={components}
      />
    </div>
  );
};

export default MorphingSearchDemo;
