'use client';

import NumberCounter from '@/registry/tweenui/number-counter';

export default function NumberCounterViewportDemo() {
  return (
    <div
      data-counter-scroller
      className="h-full w-full overflow-y-auto overscroll-contain rounded-xl border border-[#18181b]/10 bg-white px-6 dark:border-white/10 dark:bg-[#0d1117]"
    >
      <p className="pt-10 text-center text-xs text-[#18181b]/50 dark:text-white/50">Scroll down</p>
      <div className="h-[calc(100%+1.5rem)]" />
      <div className="flex items-end justify-center gap-8 text-center text-[#12161F] dark:text-white">
        <div>
          <p className="text-3xl font-medium tracking-tight">
            <NumberCounter value={150} />+
          </p>
          <p className="mt-1 text-xs text-[#18181b]/60 dark:text-white/60">projects delivered</p>
        </div>
        <div>
          <p className="text-3xl font-medium tracking-tight">
            <NumberCounter value={98} />%
          </p>
          <p className="mt-1 text-xs text-[#18181b]/60 dark:text-white/60">client retention</p>
        </div>
        <div>
          <p className="text-3xl font-medium tracking-tight">
            <NumberCounter value={3} />X
          </p>
          <p className="mt-1 text-xs text-[#18181b]/60 dark:text-white/60">faster launch</p>
        </div>
      </div>
      <div className="h-28" />
    </div>
  );
}
