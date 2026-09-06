const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const bindCounter = (counterTrigger) => {
  if (counterTrigger.dataset.counterReady) return;
  counterTrigger.dataset.counterReady = 'true';

  const counterFlow = counterTrigger.querySelector('[data-counter-number]');
  const counterValue = Number(counterTrigger.dataset.counterValue) || 0;
  const counterDuration = Number(counterTrigger.dataset.counterDuration) || 1.8;
  const counterFractionDigits = Number(counterTrigger.dataset.counterFractionDigits) || 0;
  const instant =
    counterTrigger.hasAttribute('data-instant') &&
    counterTrigger.getAttribute('data-instant') !== 'false';

  if (!counterFlow || typeof counterFlow.update !== 'function') return;

  counterFlow.trend = 0;
  counterFlow.format = {
    useGrouping: true,
    maximumFractionDigits: counterFractionDigits,
    minimumFractionDigits: counterFractionDigits,
  };
  counterFlow.update(0);

  const play = () => {
    if (prefersReducedMotion()) {
      counterFlow.update(counterValue);
      return;
    }

    counterFlow.transformTiming = {
      duration: counterDuration * 1000,
      easing: 'ease-out',
    };
    counterFlow.spinTiming = {
      duration: counterDuration * 1000,
      easing: 'ease-out',
    };
    counterFlow.opacityTiming = {
      duration: Math.max(250, counterDuration * 450),
      easing: 'ease-out',
    };
    counterFlow.update(counterValue);
  };

  if (prefersReducedMotion() || instant) {
    play();
    return;
  }

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    trigger: counterTrigger,
    scroller: counterTrigger.closest("[data-counter-scroller]") ?? undefined,
    start: "top 85%",
    once: true,
    onEnter: play,
  });
};

const counterNumberOnScroll = {
  init(root = document) {
    root.querySelectorAll('[data-counter-trigger]').forEach(bindCounter);
  },
};

const boot = () => {
  const run = () => counterNumberOnScroll.init();
  if (typeof customElements !== 'undefined' && !customElements.get('number-flow')) {
    customElements.whenDefined('number-flow').then(run);
    return;
  }
  run();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
