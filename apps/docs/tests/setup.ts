import '@testing-library/jest-dom/vitest';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { afterAll, afterEach, beforeEach, vi } from 'vitest';

// jsdom has no matchMedia; the button hook queries it on interaction, and
// registering ScrollTrigger below reads it too — so this has to come first.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom has no ResizeObserver; components that rebuild on resize construct one.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

gsap.registerPlugin(ScrollTrigger);

// GSAP keeps a global ticker, and ScrollTrigger keeps document-level scroll and
// resize listeners. Both outlive a test file: left attached, a listener fires a
// `setTimeout` that reaches for `requestAnimationFrame` after jsdom is torn
// down, failing the run intermittently even though every test passed.
//
// `disable(false, false)` is the part that matters — the second argument drops
// the listeners rather than keeping them alive. `enable()` before each test
// puts it back for components that register triggers on mount.
beforeEach(() => {
  ScrollTrigger.enable();
});

afterEach(() => {
  ScrollTrigger.killAll();
  ScrollTrigger.disable(false, false);
  gsap.globalTimeline.clear();
  gsap.ticker.sleep();
});

// Removing the listeners stops new work, but ScrollTrigger may already have a
// ~34ms `setTimeout` in flight. Give it room to land while jsdom is still up,
// once per file rather than once per test.
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
});
