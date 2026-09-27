'use client';

import { useEffect, useRef, useState } from 'react';
import WordmarkReveal from '@/registry/tweenui/wordmark-reveal';

export default function WordmarkRevealInstantDemo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // `instant` plays the moment it mounts, so on a docs page it would be over
  // before you scrolled down to it. Holding the mount until the stage is on
  // screen is what the prop looks like in real use anyway — a component that
  // arrives with its route, its modal or its tab panel.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setMounted(true);
        observer.disconnect();
      },
      { threshold: 0.5 }
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={stageRef} className="flex min-h-[200px] w-full items-center justify-center">
      {mounted ? (
        <WordmarkReveal
          instant
          title={'Tween\nUI'}
          script="in motion"
          className="font-serif text-4xl text-[#12161F] sm:text-6xl dark:text-white"
          scriptClassName="text-[#045f64] dark:text-[#c6f56f]"
        />
      ) : null}
    </div>
  );
}
