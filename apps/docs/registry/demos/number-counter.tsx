'use client';

import NumberCounter from '@/registry/tweenui/number-counter';

export default function NumberCounterInstantDemo() {
  return (
    <div className="flex items-end justify-center gap-8 text-center text-[#12161F] dark:text-white">
      <div>
        <p className="text-3xl font-medium tracking-tight">
          <NumberCounter value={150} instant />+
        </p>
        <p className="mt-1 text-xs text-[#18181b]/60 dark:text-white/60">projects delivered</p>
      </div>
      <div>
        <p className="text-3xl font-medium tracking-tight">
          <NumberCounter value={98} instant />%
        </p>
        <p className="mt-1 text-xs text-[#18181b]/60 dark:text-white/60">client retention</p>
      </div>
      <div>
        <p className="text-3xl font-medium tracking-tight">
          <NumberCounter value={3} instant />X
        </p>
        <p className="mt-1 text-xs text-[#18181b]/60 dark:text-white/60">faster launch</p>
      </div>
    </div>
  );
}
