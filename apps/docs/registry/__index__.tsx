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
  'voice-sample-player:default': dynamic(() => import('./demos/media/voice-sample-player')),
  'flip-card-on-hover:default': dynamic(() => import('./demos/card/flip-card-on-hover')),
  'faq-accordion:default': dynamic(() => import('./demos/accordion/faq-accordion')),
  'shiny-button:default': dynamic(() => import('./demos/button/shiny-button')),
  'text-roll-button:default': dynamic(() => import('./demos/button/text-roll-button')),
  'slide-arrow-button:default': dynamic(() => import('./demos/button/slide-arrow-button')),
  'glow-button:default': dynamic(() => import('./demos/button/glow-button')),
};

export function getDemo(component: string, variant: string): ComponentType | undefined {
  return demos[`${component}:${variant}`];
}
