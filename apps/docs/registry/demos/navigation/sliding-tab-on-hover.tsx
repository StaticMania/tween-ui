'use client';

import SlidingTabOnHover from '@/registry/tweenui/navigation/sliding-tab-on-hover';

const items = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'services', label: 'Service' },
  { value: 'projects', label: 'Projects' },
  { value: 'team', label: 'Team' },
  { value: 'blog', label: 'Blog' },
];

export default function SlidingTabOnHoverDemo() {
  return <SlidingTabOnHover items={items} defaultValue="home" />;
}
