/**
 * Handshake between the intro overlay and the reveals waiting behind it.
 *
 * The hero's text reveal would otherwise play while the Preloader still covers
 * the page, so it waits for this to settle. `Preloader` settles it on every
 * path it takes — played, skipped, or refused by reduced motion.
 */

let isSettled = false;
let release: (() => void) | undefined;

const settled = new Promise<void>((resolve) => {
  release = resolve;
});

export function markIntroSettled(): void {
  isSettled = true;
  release?.();
}

export function isIntroSettled(): boolean {
  return isSettled;
}

export function whenIntroSettled(): Promise<void> {
  return settled;
}
