const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const getBouncyEase = () => {
  if (typeof CustomEase === 'undefined') return 'power2.out';
  gsap.registerPlugin(CustomEase);
  CustomEase.create('bouncy-ease', '0.34, 1.42, 0.64, 1');
  return 'bouncy-ease';
};

// Bounds are measured against the item's offsetParent, which must be the
// positioned <nav>. Don't wrap the items in another positioned element or the
// indicator will be offset relative to the wrong ancestor.
const getItemBounds = (item) => {
  const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = item;
  return { left, top, width, height };
};

const bindNavTabs = (nav) => {
  if (nav.dataset.navTabsReady) return;
  nav.dataset.navTabsReady = 'true';

  const indicator = nav.querySelector('[data-nav-indicator]');
  const items = [...nav.querySelectorAll('[data-nav-item]')];
  if (!indicator || !items.length) return;

  const bouncyEase = getBouncyEase();
  let isVisible = false;

  gsap.set(indicator, { opacity: 0, scale: 0, transformOrigin: 'center center' });

  const getActiveItem = () => items.find((item) => item.dataset.active === 'true') ?? null;

  const highlightItem = (item) => {
    items.forEach((el) => {
      el.dataset.highlighted = el === item ? 'true' : 'false';
    });
  };

  const revealAtItem = (item) => {
    highlightItem(item);
    const bounds = getItemBounds(item);
    if (prefersReducedMotion()) {
      gsap.set(indicator, { ...bounds, opacity: 1, scale: 1 });
      isVisible = true;
      return;
    }
    gsap.set(indicator, { ...bounds, opacity: 1, scale: 0 });
    gsap.to(indicator, { scale: 1, duration: 0.6, ease: bouncyEase, overwrite: 'auto' });
    isVisible = true;
  };

  const moveToItem = (item) => {
    highlightItem(item);
    if (!isVisible) {
      revealAtItem(item);
      return;
    }
    if (prefersReducedMotion()) {
      gsap.set(indicator, { ...getItemBounds(item), opacity: 1, scale: 1 });
      return;
    }
    gsap.to(indicator, {
      ...getItemBounds(item),
      opacity: 1,
      scale: 1,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const hideIndicator = () => {
    const activeItem = getActiveItem();
    if (activeItem) {
      moveToItem(activeItem);
      return;
    }
    highlightItem(null);
    if (prefersReducedMotion()) {
      gsap.set(indicator, { opacity: 0, scale: 0 });
      isVisible = false;
      return;
    }
    gsap.to(indicator, {
      opacity: 0,
      scale: 0,
      duration: 0.25,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        isVisible = false;
      },
    });
  };

  const resetIndicator = () => {
    const activeItem = getActiveItem();
    if (activeItem) {
      highlightItem(activeItem);
      gsap.set(indicator, { ...getItemBounds(activeItem), opacity: 1, scale: 1 });
      isVisible = true;
      return;
    }
    highlightItem(null);
    gsap.set(indicator, { opacity: 0, scale: 0 });
    isVisible = false;
  };

  const activeItem = getActiveItem();
  if (activeItem) {
    requestAnimationFrame(() => revealAtItem(activeItem));
  }

  nav.addEventListener('pointerover', (event) => {
    const item = event.target.closest('[data-nav-item]');
    if (item && nav.contains(item)) moveToItem(item);
  });

  nav.addEventListener('pointerleave', hideIndicator);

  nav.addEventListener('focusin', (event) => {
    const item = event.target.closest('[data-nav-item]');
    if (item && nav.contains(item)) moveToItem(item);
  });

  nav.addEventListener('focusout', (event) => {
    if (!nav.contains(event.relatedTarget)) hideIndicator();
  });

  items.forEach((item) => {
    item.addEventListener('click', () => {
      items.forEach((el) => {
        const isActive = el === item;
        el.dataset.active = isActive ? 'true' : 'false';
        if (isActive) el.setAttribute('aria-current', el.tagName === 'A' ? 'page' : 'true');
        else el.removeAttribute('aria-current');
      });
    });
  });

  window.addEventListener('resize', resetIndicator);
};

const slidingTabOnHover = {
  init(root = document) {
    if (typeof gsap === 'undefined') return;
    root.querySelectorAll('[data-nav-tabs]').forEach(bindNavTabs);
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => slidingTabOnHover.init());
} else {
  slidingTabOnHover.init();
}
