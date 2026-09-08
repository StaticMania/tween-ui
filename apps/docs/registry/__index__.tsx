'use client';

import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

/**
 * Live demo map for <ComponentPreview>. Keyed by `${component}:${variant}`.
 * Demos are loaded on the client only (they use hover/focus + timers).
 */
export const demos: Record<string, ComponentType> = {
  'animated-sliding-button:default': dynamic(
    () => import('./demos/button/animated-sliding-button')
  ),
  'sliding-tab-on-hover:default': dynamic(() => import('./demos/navigation/sliding-tab-on-hover')),
  'avatar-reveal:default': dynamic(() => import('./demos/avatar/avatar-reveal')),
  'auth-modal:default': dynamic(() => import('./demos/modal/auth-modal')),
  'counter-number-on-scroll:instant': dynamic(
    () => import('./demos/scroll-based/counter-number-on-scroll')
  ),
  'counter-number-on-scroll:viewport': dynamic(
    () => import('./demos/scroll-based/counter-number-on-scroll-viewport')
  ),
  'scroll-spin-image:default': dynamic(() => import('./demos/scroll-based/scroll-spin-image')),
  'voice-sample-player:default': dynamic(() => import('./demos/media/voice-sample-player')),
  'flip-card-on-hover:default': dynamic(() => import('./demos/card/flip-card-on-hover')),
  'faq-accordion:default': dynamic(() => import('./demos/accordion/faq-accordion')),
  'shiny-button:default': dynamic(() => import('./demos/button/shiny-button')),
  'text-roll-button:default': dynamic(() => import('./demos/button/text-roll-button')),
  'slide-arrow-button:default': dynamic(() => import('./demos/button/slide-arrow-button')),
  'glow-button:default': dynamic(() => import('./demos/button/glow-button')),
  'logo-orbit:default': dynamic(() => import('./demos/orbit/logo-orbit')),
  'logo-cycle:default': dynamic(() => import('./demos/logo/logo-cycle')),
  'logo-wave:default': dynamic(() => import('./demos/logo/logo-wave')),
  'image-fan-slider:default': dynamic(() => import('./demos/slider/image-fan-slider')),
  'pricing-plan-switch:default': dynamic(() => import('./demos/pricing/pricing-plan-switch')),
  'process-card-reveal:default': dynamic(() => import('./demos/process/process-card-reveal')),
  'process-sticky-steps:default': dynamic(() => import('./demos/process/process-sticky-steps')),
  'cta-image-fan:default': dynamic(() => import('./demos/cta/cta-image-fan')),
  'cta-headline-photos:default': dynamic(() => import('./demos/cta/cta-headline-photos')),
  'blog-hover-expand:default': dynamic(() => import('./demos/blog/blog-hover-expand')),
  'integration-hub:default': dynamic(() => import('./demos/integration/integration-hub')),
  'testimonial-split-slide:default': dynamic(
    () => import('./demos/testimonial/testimonial-split-slide')
  ),
  'testimonial-card-carousel:default': dynamic(
    () => import('./demos/testimonial/testimonial-card-carousel')
  ),
};

export function getDemo(component: string, variant: string): ComponentType | undefined {
  return demos[`${component}:${variant}`];
}
