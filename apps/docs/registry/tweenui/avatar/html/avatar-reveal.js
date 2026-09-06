const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const bindAvatarReveal = (root) => {
  if (root.dataset.avatarRevealReady) return;
  root.dataset.avatarRevealReady = "true";

  const items = [...root.querySelectorAll("[data-ns-avatar]")];
  const caption = root.querySelector("[data-ns-animate]");

  if (prefersReducedMotion()) {
    gsap.set([items, caption].filter(Boolean), { opacity: 1, x: 0, scale: 1, filter: "none" });
    return;
  }

  if (items.length) {
    gsap.fromTo(
      items,
      { opacity: 0, scale: 0, x: -40, filter: "blur(5px)" },
      {
        opacity: 1,
        scale: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 1.5,
        stagger: 0.1,
        delay: 0.1,
        ease: "elastic.out(1, 0.7)",
      },
    );
  }

  if (caption) {
    gsap.fromTo(
      caption,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.8, delay: 0.2, ease: "power2.out" },
    );
  }
};

const avatarReveal = {
  init(root = document) {
    if (typeof gsap === "undefined") return;
    root.querySelectorAll("[data-avatar-reveal]").forEach(bindAvatarReveal);
  },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => avatarReveal.init());
} else {
  avatarReveal.init();
}
