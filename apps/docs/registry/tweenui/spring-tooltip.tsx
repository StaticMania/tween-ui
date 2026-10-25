'use client';

import {
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type MouseEventHandler,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const SLIDE_PULL = 320;
const WIDTH_PULL = 420;
const GAP = 10;
const EDGE = 8;
const NUB = 28;
const ARROW_INSET = 12;
const REVEALED = 112;
const DRIFT = 8;
const SWEEP_RIGHT = '105deg';
const SWEEP_LEFT = '285deg';

// --tip-reveal runs 0 to 112: the soft edge is 12% wide, so 112 clears it past
// the far side and the label shows in full. The 15° tilt off a flat sweep is
// the same lean as the glint's skew, so the light rides the edge.
const MASK =
  'linear-gradient(var(--tip-dir), #000 calc(var(--tip-reveal) * 1% - 12%), transparent calc(var(--tip-reveal) * 1%))';

const LABEL_STYLE = {
  '--tip-dir': SWEEP_RIGHT,
  '--tip-reveal': REVEALED,
  maskImage: MASK,
  WebkitMaskImage: MASK,
} as CSSProperties;

const TRIGGER_CLASS =
  'relative z-10 grid size-10 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-[#045f64] outline-none transition-colors duration-200 ease-out hover:bg-[#045f64]/10 data-[highlighted=true]:bg-[#045f64]/10 focus-visible:ring-2 focus-visible:ring-[#045f64] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none [&_svg]:size-[18px]';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isFocusVisible = (el: Element) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface Spring {
  x: number;
  v: number;
  t: number;
}

const spring = (): Spring => ({ x: 0, v: 0, t: 0 });

const snap = (target: Spring) => {
  target.x = target.t;
  target.v = 0;
};

const stepSpring = (target: Spring, stiffness: number, dt: number) => {
  const force = stiffness * (target.t - target.x) - 2 * Math.sqrt(stiffness) * target.v;
  target.v += force * dt;
  target.x += target.v * dt;
};

const atRest = (target: Spring, epsilon: number) =>
  Math.abs(target.t - target.x) < epsilon && Math.abs(target.v) < epsilon;

// The tooltip is absolutely positioned inside the group, so the viewport edges
// are clamped in viewport space and then converted to the group's coordinates.
const placeTooltip = (trigger: HTMLElement, group: HTMLElement, width: number, height: number) => {
  const box = trigger.getBoundingClientRect();
  const origin = group.getBoundingClientRect();
  const roomAbove = box.top - GAP - height >= EDGE;
  const roomBelow = box.bottom + GAP + height <= window.innerHeight - EDGE;
  const side: 'top' | 'bottom' = roomAbove || !roomBelow ? 'top' : 'bottom';
  const anchor = box.left + box.width / 2;
  const half = width / 2;
  const center = clamp(anchor, EDGE + half, Math.max(EDGE + half, window.innerWidth - EDGE - half));
  return {
    side,
    x: center - origin.left,
    anchor: anchor - origin.left,
    y: side === 'top' ? box.top - origin.top - GAP - height : box.bottom - origin.top + GAP,
  };
};

export interface SpringTooltipItem {
  label: string;
  icon: ReactNode;
  shortcut?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

interface SpringTooltipProps extends ComponentPropsWithoutRef<'div'> {
  items: SpringTooltipItem[];
  delay?: number;
  closeDelay?: number;
}

const SpringTooltip = ({
  items,
  delay = 150,
  closeDelay = 300,
  className,
  ...props
}: SpringTooltipProps) => {
  const tooltipId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const glintRef = useRef<HTMLSpanElement>(null);
  const motion = useRef({ x: spring(), anchor: spring(), width: spring(), y: 0, awake: false });
  const state = useRef({
    active: -1,
    pending: -1,
    dismissed: -1,
    open: false,
    shown: false,
    hovering: false,
    openTimer: 0,
    closeTimer: 0,
  });

  const triggers = () =>
    Array.from(groupRef.current?.querySelectorAll<HTMLElement>('[data-tip-trigger]') ?? []);

  const labels = () =>
    Array.from(tipRef.current?.querySelectorAll<HTMLElement>('[data-tip-label]') ?? []);

  const indexOf = (target: EventTarget | null) => {
    const trigger = (target as HTMLElement | null)?.closest?.('[data-tip-trigger]');
    return trigger instanceof HTMLElement ? Number(trigger.dataset.index) : -1;
  };

  const stopTimers = () => {
    const s = state.current;
    window.clearTimeout(s.openTimer);
    window.clearTimeout(s.closeTimer);
    s.openTimer = 0;
    s.closeTimer = 0;
    s.pending = -1;
  };

  const draw = () => {
    const tip = tipRef.current;
    const box = boxRef.current;
    const arrow = arrowRef.current;
    if (!tip || !box || !arrow) return;
    const m = motion.current;
    const width = Math.max(m.width.x, 0);
    const left = m.x.x - width / 2;
    tip.style.transform = `translate3d(${left}px,${m.y}px,0)`;
    box.style.width = `${width}px`;
    arrow.style.left = `${clamp(m.anchor.x - left, ARROW_INSET, Math.max(ARROW_INSET, width - ARROW_INSET))}px`;
  };

  const aim = (index: number, settle: boolean) => {
    const group = groupRef.current;
    const tip = tipRef.current;
    const box = boxRef.current;
    const trigger = triggers()[index];
    if (!group || !tip || !box || !trigger) return;
    const m = motion.current;
    const width = labels()[index]?.offsetWidth ?? 0;
    const next = placeTooltip(trigger, group, width, box.offsetHeight);
    tip.dataset.side = next.side;
    m.y = next.y;
    m.x.t = next.x;
    m.anchor.t = next.anchor;
    m.width.t = width;
    if (settle) {
      [m.x, m.anchor, m.width].forEach(snap);
      m.awake = false;
      draw();
      return;
    }
    m.awake = true;
  };

  const highlight = (index: number) => {
    triggers().forEach((trigger, i) => {
      trigger.dataset.highlighted = i === index ? 'true' : 'false';
    });
  };

  // Each button is already named by its aria-label, so the label text stays
  // hidden from assistive tech and only the shortcut reaches the description.
  const expose = (index: number) => {
    labels().forEach((label, i) => {
      if (i === index) label.removeAttribute('aria-hidden');
      else label.setAttribute('aria-hidden', 'true');
    });
  };

  // The label stays centred by its Tailwind translate, so the mask and drift
  // go on an inner span: tweening x on the label itself would take over its
  // transform and drop the centring.
  const inkOf = (label: HTMLElement) => label.firstElementChild as HTMLElement;

  const showLabel = (from: number, to: number, animate: boolean) => {
    const all = labels();
    const next = all[to];
    const prev = from === to ? undefined : all[from];
    const wiping = animate && prev && !gsap.isTweening(inkOf(prev));
    expose(to);

    all.forEach((label) => {
      if (animate && label === prev) return;
      gsap.killTweensOf([label, inkOf(label)]);
      gsap.set(label, { autoAlpha: label === next ? 1 : 0 });
      gsap.set(inkOf(label), { x: 0, '--tip-reveal': REVEALED });
    });
    if (!animate || !next) return;

    // One slanted edge sweeps the way the tooltip travels, with a glint riding
    // it: it erases the old label and draws the new one in behind it. A label
    // caught mid-wipe by a fast sweep just fades, since flipping its mask
    // would jump.
    const forward = from < 0 || to > from;
    const step = forward ? 1 : -1;
    const wipe = { duration: 0.42, ease: 'power2.inOut', overwrite: true };
    if (prev && wiping) {
      const ink = inkOf(prev);
      gsap.set(ink, { '--tip-dir': forward ? SWEEP_LEFT : SWEEP_RIGHT });
      gsap.to(ink, {
        '--tip-reveal': 0,
        x: DRIFT * step,
        ...wipe,
        onComplete: () => {
          gsap.set(prev, { autoAlpha: 0 });
          gsap.set(ink, { x: 0 });
        },
      });
    } else if (prev) {
      gsap.to(prev, { autoAlpha: 0, duration: 0.12, overwrite: true });
    }
    gsap.fromTo(
      inkOf(next),
      { '--tip-dir': forward ? SWEEP_RIGHT : SWEEP_LEFT, '--tip-reveal': 0, x: -DRIFT * step },
      { '--tip-reveal': REVEALED, x: 0, ...wipe }
    );

    const glint = glintRef.current;
    if (!glint) return;
    gsap.to(glint, {
      keyframes: { left: forward ? ['-8%', '108%'] : ['108%', '-8%'], opacity: [0, 1, 1, 0] },
      ...wipe,
    });
  };

  const { contextSafe } = useGSAP(
    () => {
      const body = bodyRef.current;
      if (!body) return;
      const s = state.current;
      const m = motion.current;
      Object.assign(s, { active: -1, dismissed: -1, open: false, shown: false });
      gsap.set(body, { autoAlpha: 0, scale: 0.96 });
      gsap.set(labels(), { autoAlpha: 0 });

      const tick = (_time: number, deltaTime: number) => {
        if (!m.awake) return;
        const elapsed = Math.min(deltaTime / 1000, 0.05);
        const steps = Math.max(1, Math.ceil(elapsed * 120));
        const dt = elapsed / steps;
        for (let step = 0; step < steps; step += 1) {
          stepSpring(m.x, SLIDE_PULL, dt);
          stepSpring(m.anchor, SLIDE_PULL, dt);
          stepSpring(m.width, WIDTH_PULL, dt);
        }
        if ([m.x, m.anchor, m.width].every((item) => atRest(item, 0.05))) {
          [m.x, m.anchor, m.width].forEach(snap);
          m.awake = false;
        }
        draw();
      };

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || (!s.open && s.pending < 0)) return;
        s.dismissed = s.open ? s.active : s.pending;
        conceal();
      };

      const onViewport = () => {
        if (s.open) aim(s.active, !m.awake);
      };

      gsap.ticker.add(tick);
      document.addEventListener('keydown', onKeyDown);
      window.addEventListener('resize', onViewport);
      window.addEventListener('scroll', onViewport, { capture: true, passive: true });
      return () => {
        stopTimers();
        gsap.ticker.remove(tick);
        document.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('resize', onViewport);
        window.removeEventListener('scroll', onViewport, { capture: true });
      };
    },
    { scope: groupRef, dependencies: [items] }
  );

  const reveal = contextSafe((index: number) => {
    const tip = tipRef.current;
    const body = bodyRef.current;
    if (!tip || !body) return;
    stopTimers();
    const s = state.current;
    const reduced = prefersReducedMotion();
    const from = s.active;
    const wasShown = s.shown;
    const sliding = wasShown && !reduced;
    s.open = true;
    s.shown = true;
    s.active = index;
    tip.dataset.state = 'open';
    highlight(index);
    aim(index, !sliding);
    showLabel(wasShown ? from : -1, index, !reduced);

    gsap.killTweensOf(body);
    if (reduced) {
      gsap.set(body, { autoAlpha: 1, scale: 1, y: 0, filter: 'blur(0px)' });
      return;
    }
    if (!wasShown) {
      const m = motion.current;
      m.width.x = Math.min(NUB, m.width.t);
      m.awake = true;
      draw();
      gsap.set(body, { y: tip.dataset.side === 'top' ? 6 : -6, filter: 'blur(4px)' });
    }
    gsap.to(body, {
      autoAlpha: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.24,
      ease: 'power3.out',
    });
  });

  const conceal = contextSafe(() => {
    const tip = tipRef.current;
    const body = bodyRef.current;
    stopTimers();
    const s = state.current;
    if (!tip || !body || !s.open) return;
    s.open = false;
    tip.dataset.state = 'closed';
    highlight(-1);

    const settle = () => {
      s.shown = false;
      motion.current.awake = false;
    };
    gsap.killTweensOf(body);
    if (prefersReducedMotion()) {
      gsap.set(body, { autoAlpha: 0 });
      settle();
      return;
    }
    const m = motion.current;
    m.width.t = Math.min(NUB, m.width.t);
    m.awake = true;
    gsap.to(body, {
      autoAlpha: 0,
      y: tip.dataset.side === 'top' ? 4 : -4,
      scale: 0.97,
      filter: 'blur(3px)',
      duration: 0.22,
      ease: 'power2.inOut',
      onComplete: settle,
    });
  });

  const request = (index: number) => {
    const s = state.current;
    window.clearTimeout(s.closeTimer);
    s.closeTimer = 0;
    if (index < 0 || index === s.dismissed) return;
    s.dismissed = -1;
    if (s.open) {
      if (index !== s.active) reveal(index);
      return;
    }
    s.pending = index;
    if (s.openTimer) return;
    s.openTimer = window.setTimeout(() => {
      s.openTimer = 0;
      if (s.pending >= 0) reveal(s.pending);
    }, delay);
  };

  const release = () => {
    const s = state.current;
    window.clearTimeout(s.openTimer);
    s.openTimer = 0;
    s.pending = -1;
    if (!s.open || s.closeTimer) return;
    s.closeTimer = window.setTimeout(conceal, closeDelay);
  };

  const onPointerOver = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    state.current.hovering = true;
    request(indexOf(event.target));
  };

  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const s = state.current;
    s.hovering = false;
    s.dismissed = -1;
    const focused = triggers().findIndex(
      (trigger) => trigger === document.activeElement && isFocusVisible(trigger)
    );
    if (focused >= 0) request(focused);
    else release();
  };

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const index = indexOf(event.target);
    if (index < 0 || !isFocusVisible(event.target)) return;
    if (!state.current.open) expose(index);
    request(index);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    if (!state.current.hovering) release();
  };

  return (
    <div
      {...props}
      ref={groupRef}
      role="group"
      aria-label={props['aria-label'] ?? 'Toolbar'}
      className={cn(
        'relative inline-flex items-center gap-1 rounded-xl border border-[#045f64]/15 bg-white p-1 shadow-[0_1px_2px_rgba(16,24,40,0.08)]',
        className
      )}
      onPointerOver={onPointerOver}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      {items.map((item, index) => (
        <button
          key={`${index}-${item.label}`}
          type="button"
          data-tip-trigger
          data-index={index}
          data-highlighted="false"
          aria-label={item.label}
          aria-describedby={tooltipId}
          disabled={item.disabled}
          onClick={item.onClick}
          className={TRIGGER_CLASS}
        >
          {item.icon}
        </button>
      ))}
      <div
        ref={tipRef}
        data-tip
        data-state="closed"
        data-side="top"
        className="group pointer-events-none absolute top-0 left-0 z-20 will-change-transform"
      >
        <div
          ref={bodyRef}
          id={tooltipId}
          role="tooltip"
          className="invisible relative origin-bottom opacity-0 group-data-[side=bottom]:origin-top"
        >
          <span
            ref={arrowRef}
            aria-hidden="true"
            className="absolute size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] bg-[#0b3b3e] group-data-[side=bottom]:-top-1 group-data-[side=top]:-bottom-1"
          />
          <div
            ref={boxRef}
            className="relative h-8 overflow-hidden rounded-lg bg-[#0b3b3e] text-white shadow-[0_8px_20px_-8px_rgba(4,47,50,0.55)]"
          >
            {items.map((item, index) => (
              <span
                key={`${index}-${item.label}`}
                data-tip-label={item.label}
                aria-hidden="true"
                className="invisible absolute top-0 left-1/2 h-full w-max -translate-x-1/2 opacity-0"
              >
                <span
                  style={LABEL_STYLE}
                  className="flex h-full items-center gap-2 px-2.5 font-[family-name:Outfit,sans-serif] text-[13px] whitespace-nowrap"
                >
                  <span aria-hidden="true">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="rounded bg-white/10 px-1.5 py-px font-sans text-[11px] text-[#c6f56f]">
                      {item.shortcut}
                    </kbd>
                  )}
                </span>
              </span>
            ))}
            <span
              ref={glintRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 h-full w-5 -translate-x-1/2 -skew-x-[15deg] bg-[linear-gradient(90deg,transparent,rgba(198,245,111,0.55),transparent)] opacity-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpringTooltip;
