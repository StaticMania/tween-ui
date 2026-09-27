'use client';

import WordmarkReveal from '@/registry/tweenui/wordmark-reveal';

export default function WordmarkRevealInstantDemo() {
  return (
    <WordmarkReveal
      instant
      title={'Tween\nUI'}
      script="in motion"
      className="font-serif text-4xl text-[#12161F] sm:text-6xl dark:text-white"
      scriptClassName="text-[#045f64] dark:text-[#c6f56f]"
    />
  );
}
