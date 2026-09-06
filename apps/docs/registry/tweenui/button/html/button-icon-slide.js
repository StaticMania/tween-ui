const EXPAND_MS = 340;
const PARK_MS = 260;

const canHover = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const timers = new WeakMap();
const dirs = new WeakMap();

const clearTimer = (btn) => {
  const id = timers.get(btn);
  if (id) window.clearTimeout(id);
  timers.delete(btn);
};

const wait = (btn, ms, fn) => {
  clearTimer(btn);
  timers.set(
    btn,
    window.setTimeout(() => {
      timers.delete(btn);
      fn();
    }, ms),
  );
};

const isOn = (btn) => {
  if (btn.disabled) return false;
  return btn.matches(":focus-visible") || (canHover() && btn.matches(":hover"));
};

const step = (btn) => {
  const on = isOn(btn);
  const state = btn.dataset.iconState || "idle";
  const dir = dirs.get(btn);

  if (prefersReducedMotion()) {
    clearTimer(btn);
    btn.dataset.iconState = on ? "park" : "idle";
    return;
  }

  if (on) {
    if (state === "park") return;
    if (state === "idle") {
      btn.dataset.iconState = "expand";
      dirs.set(btn, "in");
      wait(btn, EXPAND_MS, () => step(btn));
      return;
    }
    if (dir === "in" && timers.has(btn)) return;
    clearTimer(btn);
    btn.dataset.iconState = "park";
    dirs.set(btn, "in");
    return;
  }

  if (state === "idle") return;
  if (state === "park") {
    btn.dataset.iconState = "expand";
    dirs.set(btn, "out");
    wait(btn, PARK_MS, () => step(btn));
    return;
  }
  if (dir === "out" && timers.has(btn)) return;
  clearTimer(btn);
  btn.dataset.iconState = "idle";
  dirs.set(btn, "out");
};

const bind = (btn) => {
  const sync = () => step(btn);
  btn.addEventListener("pointerenter", sync);
  btn.addEventListener("pointerleave", sync);
  btn.addEventListener("focus", sync);
  btn.addEventListener("blur", sync);
};

const buttonIconSlide = {
  init() {
    document.querySelectorAll("[data-btn-icon-slide]").forEach(bind);
  },
};

document.addEventListener("DOMContentLoaded", () => {
  buttonIconSlide.init();
});
