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
};

export function getDemo(component: string, variant: string): ComponentType | undefined {
  return demos[`${component}:${variant}`];
}
