'use client';

import { CounterStats } from './counter-stats';

export default function CounterNumberOnScrollViewportDemo() {
  return (
    <div
      data-counter-scroller
      className="h-full w-full overflow-y-auto overscroll-contain rounded-xl border border-[#18181b]/10 bg-white px-6 dark:border-white/10 dark:bg-[#0d1117]"
    >
      <p className="pt-10 text-center text-xs text-[#18181b]/50 dark:text-white/50">Scroll down</p>
      <div className="h-[calc(100%+1.5rem)]" />
      <CounterStats />
      <div className="h-28" />
    </div>
  );
}
