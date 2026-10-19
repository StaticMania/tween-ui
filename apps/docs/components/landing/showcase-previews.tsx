import type { ReactNode } from 'react';
import { AvatarRevealPreview } from './previews/avatar-reveal-preview';
import { FaqAccordionPreview } from './previews/faq-accordion-preview';
import { FlipCardPreview } from './previews/flip-card-preview';
import { IconTrailPreview } from './previews/icon-trail-preview';
import { ImageFanPreview } from './previews/image-fan-preview';
import { LogoOrbitPreview } from './previews/logo-orbit-preview';
import { NumberCounterPreview } from './previews/number-counter-preview';
import { SlidingTabsPreview } from './previews/sliding-tabs-preview';

export const SHOWCASE_NAMES = [
  'icon-trail-button',
  'sliding-tabs',
  'number-counter',
  'flip-card',
  'logo-orbit',
  'avatar-reveal',
  'faq-accordion',
  'image-fan-slider',
] as const;

export type ShowcaseName = (typeof SHOWCASE_NAMES)[number];

export const showcasePreviews: Record<ShowcaseName, () => ReactNode> = {
  'icon-trail-button': IconTrailPreview,
  'sliding-tabs': SlidingTabsPreview,
  'number-counter': NumberCounterPreview,
  'flip-card': FlipCardPreview,
  'logo-orbit': LogoOrbitPreview,
  'avatar-reveal': AvatarRevealPreview,
  'faq-accordion': FaqAccordionPreview,
  'image-fan-slider': ImageFanPreview,
};
