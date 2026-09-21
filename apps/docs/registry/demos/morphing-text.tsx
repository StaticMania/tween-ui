'use client';

import MorphingText from '@/registry/tweenui/morphing-text';

export default function MorphingTextDemo() {
  return (
    <MorphingText
      prefix={'Motion that feels\nlike'}
      words={['magic', 'water', 'silk', 'gravity']}
      className="text-center text-4xl font-medium tracking-tight text-[#12161F] sm:text-6xl dark:text-white"
      wordClassName="text-[#045f64] dark:text-[#c6f56f]"
    />
  );
}
