'use client';

import WordmarkReveal from '@/registry/tweenui/wordmark-reveal';

export default function WordmarkRevealDemo() {
  return (
    <div
      data-wordmark-scroller
      // A set height, not h-full: on /preview/wordmark-reveal the parent takes its
      // height from this box, so a percentage one would grow to fit the content
      // and leave nothing to scroll — which plays the reveal before you can read
      // the cue.
      className="mx-auto h-[520px] w-full max-w-[1290px] overflow-y-auto overscroll-contain rounded-xl border border-[#18181b]/10 bg-white dark:border-white/10 dark:bg-[#0d1117]"
    >
      {/* Sticky and exactly one scroller tall, so the wordmark holds still for the whole ride */}
      <div className="sticky top-0 flex h-[520px] items-center justify-center px-6">
        <WordmarkReveal
          title={'Tween\nUI'}
          script="in motion"
          cue="Scroll down to reveal"
          className="font-serif text-4xl text-[#12161F] sm:text-6xl dark:text-white"
          scriptClassName="text-[#045f64] dark:text-[#c6f56f]"
          // Pinned to the stage rather than sitting under the wordmark, so the
          // lockup stays dead centre before and after the cue goes
          cueClassName="absolute bottom-10 left-1/2 mt-0 -translate-x-1/2 text-[#18181b]/50 dark:text-white/50"
        />
      </div>

      {/* Scroll room: what the cue is asking for */}
      <div className="h-[560px]" />
    </div>
  );
}
