import '@testing-library/jest-dom/vitest';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { afterEach, vi } from 'vitest';

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

// GSAP keeps a global ticker and, with ScrollTrigger, scroll listeners that
// outlive a test file. Left running they fire after jsdom is torn down and
// crash the run with "requestAnimationFrame is not defined" — intermittently,
// which would make CI flaky. Stop them between tests; GSAP wakes the ticker
// again on its own when the next tween is created.
afterEach(() => {
  ScrollTrigger.killAll();
  gsap.globalTimeline.clear();
  gsap.ticker.sleep();
});
