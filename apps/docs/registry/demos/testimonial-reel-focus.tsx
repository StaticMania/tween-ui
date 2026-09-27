'use client';

import TestimonialReelFocus from '@/registry/tweenui/testimonial-reel-focus';

export default function TestimonialReelFocusDemo() {
  return (
    // The reel spends scroll rather than time, so the preview hands it a scrollport of
    // its own — one screen tall, the same as the page it is built for — instead of
    // three thousand pixels of the docs page. Dropped on a real page with no scrolling
    // ancestor, it pins against the window in exactly the same way.
    <div className="h-svh w-full overflow-y-auto">
      <TestimonialReelFocus />
    </div>
  );
}
