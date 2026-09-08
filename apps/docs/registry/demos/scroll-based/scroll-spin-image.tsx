'use client';

import ScrollSpinImage from '@/registry/tweenui/scroll-based/scroll-spin-image';

export default function ScrollSpinImageDemo() {
  return (
    <div
      data-scroll-spin-scroller
      className="relative h-full w-full overflow-y-auto overscroll-contain rounded-xl border border-[#18181b]/10 bg-white dark:border-white/10 dark:bg-[#0d1117]"
    >
      <div className="relative flex min-h-[160vh] flex-col items-center px-4 pt-8 pb-24">
        <p className="mb-8 text-center text-xs text-[#18181b]/50 dark:text-white/50">
          Scroll this panel — the image spins faster with you, then eases back to idle.
        </p>
        <ScrollSpinImage
          src="/images/ns-img-579.png"
          alt="Decorative illustration of financial management platform interface with credit cards"
          className="w-full max-w-[700px] lg:max-w-[897px]"
        />
        <p className="mt-16 text-center text-xs text-[#18181b]/50 dark:text-white/50">
          Keep scrolling past the image.
        </p>
      </div>
    </div>
  );
}
