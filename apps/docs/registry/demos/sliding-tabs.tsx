'use client';

import SlidingTabs from '@/registry/tweenui/sliding-tabs';

const items = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'services', label: 'Service' },
  { value: 'projects', label: 'Projects' },
  { value: 'team', label: 'Team' },
  { value: 'blog', label: 'Blog' },
];

const SlidingTabsDemo = () => {
  return <SlidingTabs items={items} defaultValue="home" />;
};

export default SlidingTabsDemo;
