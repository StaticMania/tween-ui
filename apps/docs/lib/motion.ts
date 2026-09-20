import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

// Registering is what wires CustomEase to gsap; creating an ease is not, so
// this stays at module scope while `tweenEase` is called from an effect.
gsap.registerPlugin(CustomEase);

/** The easing every Tween UI component ships with. */
export const TWEEN_EASE = '0.32, 0.72, 0, 1';

const EASE_ID = 'tween';

/**
 * Register (once) and return the brand ease. Call inside an effect — creating a
 * CustomEase at module scope would run it during server rendering too.
 */
export function tweenEase(): gsap.EaseFunction {
  return CustomEase.get(EASE_ID) ?? CustomEase.create(EASE_ID, TWEEN_EASE);
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
