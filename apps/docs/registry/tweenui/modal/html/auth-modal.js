const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function createAuthModal(root) {
  if (root.dataset.authModalReady) return null;
  root.dataset.authModalReady = "true";

  const openBtn = root.querySelector("[data-auth-modal-open]");
  const overlay = root.querySelector("[data-auth-modal-overlay]");
  const panel = overlay?.querySelector("[data-auth-modal-panel]");
  const backdrop = overlay?.querySelector("[data-auth-modal-backdrop]");
  const items = overlay ? [...overlay.querySelectorAll("[data-auth-modal-item]")] : [];
  const closeBtns = overlay ? [...overlay.querySelectorAll("[data-auth-modal-close]")] : [];
  const providerBtns = overlay ? [...overlay.querySelectorAll("[data-auth-provider]")] : [];
  const emailForm = overlay?.querySelector("[data-auth-email-form]");

  if (!openBtn || !overlay || !panel) return null;

  if (overlay.parentElement !== document.body) {
    document.body.appendChild(overlay);
  }

  let isOpen = false;
  let previouslyFocused = null;

  const focusableSelector =
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const getFocusable = () =>
    [...panel.querySelectorAll(focusableSelector)].filter((el) => el.offsetParent !== null);

  const onKeydown = (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (event.key !== "Tab") return;

    // Trap focus within the panel.
    const items = getFocusable();
    if (!items.length) {
      event.preventDefault();
      panel.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || active === panel || !panel.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !panel.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  };

  const finishClose = () => {
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    // Restore focus to whatever opened the dialog.
    if (previouslyFocused && typeof previouslyFocused.focus === "function") {
      previouslyFocused.focus();
    }
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    previouslyFocused = document.activeElement;
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeydown);
    // Move focus into the dialog so keyboard/AT users start inside it.
    panel.focus();

    if (typeof gsap === "undefined" || prefersReducedMotion()) {
      if (typeof gsap !== "undefined") {
        gsap.set([backdrop, panel, ...items], { opacity: 1, y: 0, scale: 1 });
      }
      return;
    }

    gsap.killTweensOf([backdrop, panel, ...items]);
    gsap.set(backdrop, { opacity: 0 });
    gsap.set(panel, { opacity: 0, y: 28, scale: 0.94 });
    gsap.set(items, { opacity: 0, y: 16 });
    gsap
      .timeline()
      .to(backdrop, { opacity: 1, duration: 0.22, ease: "power2.out" })
      .to(panel, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: "power3.out" }, "-=0.08")
      .to(items, { opacity: 1, y: 0, duration: 0.28, stagger: 0.045, ease: "power2.out" }, "-=0.18");
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;

    if (typeof gsap === "undefined" || prefersReducedMotion()) {
      finishClose();
      return;
    }

    gsap.killTweensOf([backdrop, panel, ...items]);
    gsap
      .timeline({ onComplete: finishClose })
      .to(items, { opacity: 0, y: 8, duration: 0.12, stagger: 0.02, ease: "power1.in" })
      .to(panel, { opacity: 0, y: 16, scale: 0.96, duration: 0.18, ease: "power2.in" }, "-=0.06")
      .to(backdrop, { opacity: 0, duration: 0.16, ease: "power2.in" }, "-=0.1");
  };

  openBtn.addEventListener("click", open);
  closeBtns.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      close();
    });
  });
  backdrop?.addEventListener("click", close);
  panel.addEventListener("click", (event) => event.stopPropagation());

  // Consumers subscribe to these on the global object:
  //   window.addEventListener("auth:provider", (e) => e.detail.provider)
  //   window.addEventListener("auth:email", (e) => e.detail.email)
  providerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      globalThis.dispatchEvent(
        new CustomEvent("auth:provider", { detail: { provider: btn.dataset.authProvider } }),
      );
    });
  });

  emailForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = emailForm.querySelector('input[type="email"]');
    globalThis.dispatchEvent(
      new CustomEvent("auth:email", { detail: { email: emailInput?.value?.trim() || "" } }),
    );
  });

  return { open, close };
}

const authModal = {
  init(root = document) {
    root.querySelectorAll("[data-auth-modal-root]").forEach(createAuthModal);
  },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => authModal.init());
} else {
  authModal.init();
}
