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
};

export function getDemo(component: string, variant: string): ComponentType | undefined {
  return demos[`${component}:${variant}`];
}
