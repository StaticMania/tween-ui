'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const OPEN = 0.52;
const CLOSE = 0.32;
const RADIUS = 24;
const CLIP_SHUT = `inset(50% 50% 50% 50% round ${RADIUS}px)`;
const CLIP_OPEN = `inset(0% 0% 0% 0% round ${RADIUS}px)`;

const STROKE_STYLE = {
  background:
    'linear-gradient(90deg, var(--color-tween-teal), var(--color-tween-lime) 30%, var(--color-tween-teal-soft) 65%, var(--color-tween-teal))',
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
  padding: 1,
} as CSSProperties;

const ROW_CLASS =
  'flex w-full cursor-pointer items-center gap-2.5 rounded-2xl px-2.5 py-2 text-left text-sm text-white outline-none transition-colors duration-150 hover:bg-white/10 focus-visible:bg-white/10 motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isFocusVisible = (el: Element | null) => {
  try {
    return !!el?.matches(':focus-visible');
  } catch {
    return true;
  }
};

// The panel is pinned to the trigger's corner, so shrinking it to the
// trigger's size is all it takes to fold it back into the button.
const tucked = (trigger: HTMLElement, panel: HTMLElement) => ({
  scaleX: trigger.offsetWidth / panel.offsetWidth,
  scaleY: trigger.offsetHeight / panel.offsetHeight,
});

// The panel scales from the trigger's size, which would squash its corners
// too, so the radius is divided by the live scale to stay RADIUS on screen.
const keepCorners = (panel: HTMLElement, surface: HTMLElement) => () => {
  const sx = Number(gsap.getProperty(panel, 'scaleX')) || 1;
  const sy = Number(gsap.getProperty(panel, 'scaleY')) || 1;
  surface.style.borderRadius = `${RADIUS / sx}px / ${RADIUS / sy}px`;
};

const GearIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="ease-tween size-4 transition-transform duration-500 group-hover:rotate-60 motion-reduce:transition-none"
  >
    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export interface SettingsPopupToggle {
  label: string;
  icon: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export interface SettingsPopupChoice {
  label: string;
  options: { value: string; label: string; icon?: ReactNode; hint?: string }[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface SettingsPopupProps extends ComponentPropsWithoutRef<'div'> {
  toggles: SettingsPopupToggle[];
  choice?: SettingsPopupChoice;
  label?: string;
  title?: string;
  icon?: ReactNode;
  align?: 'start' | 'end';
  closeDelay?: number;
}

const SettingsPopup = ({
  toggles,
  choice,
  label = 'Settings',
  title = 'Settings',
  icon = <GearIcon />,
  align = 'start',
  closeDelay = 150,
  className,
  onPointerEnter,
  onPointerLeave,
  onBlur,
  ...props
}: SettingsPopupProps) => {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const live = useRef(false);
  const focusFirst = useRef(false);
  const closeTimer = useRef(0);
  const [open, setOpen] = useState(false);
  const [ownChecked, setOwnChecked] = useState(() => toggles.map((t) => !!t.defaultChecked));
  const [ownValue, setOwnValue] = useState(choice?.defaultValue ?? choice?.options[0]?.value);
  const isOn = (index: number) => toggles[index]?.checked ?? !!ownChecked[index];
  const value = choice?.value ?? ownValue;

  const menuItems = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []);

  const cancelClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = 0;
  };

  const close = (refocus = false) => {
    cancelClose();
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useGSAP(
    () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      const surface = surfaceRef.current;
      const list = listRef.current;
      if (!trigger || !panel || !surface || !list) return;
      timeline.current?.kill();

      if (prefersReducedMotion()) {
        live.current = open;
        gsap.set(trigger, { opacity: open ? 0 : 1 });
        gsap.set(panel, { autoAlpha: open ? 1 : 0, scaleX: 1, scaleY: 1 });
        gsap.set(surface, {
          autoAlpha: 1,
          scaleX: 1,
          scaleY: 1,
          borderRadius: RADIUS,
          filter: 'none',
        });
        gsap.set(list, { clipPath: 'none', filter: 'none' });
      } else if (open) {
        if (!live.current) {
          gsap.set(panel, tucked(trigger, panel));
          gsap.set(surface, {
            autoAlpha: 0,
            scaleX: 0.82,
            scaleY: 1.18,
            filter: 'blur(8px)',
          });
          gsap.set(list, { clipPath: CLIP_SHUT, filter: 'blur(10px)' });
        }
        live.current = true;
        gsap.set(panel, { autoAlpha: 1 });
        const corners = keepCorners(panel, surface);
        corners();

        // The panel springs out of the trigger while the glass under it
        // squashes and stretches like a drop settling, then the rows unblur
        // out of a rounded clip from the middle.
        timeline.current = gsap
          .timeline()
          .to(trigger, { opacity: 0, duration: 0.15 }, 0)
          .to(
            panel,
            { scaleX: 1, scaleY: 1, duration: OPEN, ease: 'back.out(1.3)', onUpdate: corners },
            0
          )
          .to(
            surface,
            {
              keyframes: {
                '45%': { scaleX: 1.06, scaleY: 0.94 },
                '70%': { scaleX: 0.98, scaleY: 1.02 },
                '100%': { scaleX: 1, scaleY: 1 },
                easeEach: 'back.out(1.7)',
              },
              duration: OPEN,
              ease: 'none',
            },
            0
          )
          .to(surface, { autoAlpha: 1, duration: OPEN * 0.35 }, 0)
          .to(surface, { filter: 'blur(0px)', duration: OPEN, ease: 'power2.out' }, 0)
          .to(
            list,
            { clipPath: CLIP_OPEN, filter: 'blur(0px)', duration: 0.36, ease: 'power1.out' },
            0
          );
      } else if (live.current) {
        // Closing anticipates: back.in pulls the panel out a touch before it
        // folds into the trigger, and the trigger only returns once it's gone.
        timeline.current = gsap
          .timeline({
            onComplete: () => {
              live.current = false;
              gsap.set(panel, { autoAlpha: 0 });
            },
          })
          .to(
            list,
            { clipPath: CLIP_SHUT, filter: 'blur(10px)', duration: 0.2, ease: 'power1.in' },
            0
          )
          .to(surface, { autoAlpha: 0, filter: 'blur(8px)', duration: 0.3, ease: 'power2.in' }, 0)
          .to(
            panel,
            {
              ...tucked(trigger, panel),
              duration: CLOSE,
              ease: 'back.in(1.7)',
              onUpdate: keepCorners(panel, surface),
            },
            0
          )
          .to(trigger, { opacity: 1, duration: 0.13 }, 0.2);
      } else {
        gsap.set(panel, { autoAlpha: 0 });
      }

      if (open && focusFirst.current) menuItems()[0]?.focus();
      focusFirst.current = false;
    },
    { scope: rootRef, dependencies: [open] }
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close(!!rootRef.current?.contains(document.activeElement));
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => cancelClose, []);

  const onRootPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    onPointerEnter?.(event);
    if (event.pointerType === 'touch') return;
    cancelClose();
    setOpen(true);
  };

  const onRootPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    const focused = document.activeElement;
    if (event.pointerType === 'touch') return;
    if (event.currentTarget.contains(focused) && isFocusVisible(focused)) return;
    cancelClose();
    closeTimer.current = window.setTimeout(close, closeDelay);
  };

  const onRootBlur = (event: FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    const next = event.relatedTarget as Node | null;
    if (next && !event.currentTarget.contains(next)) close();
  };

  const onTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    focusFirst.current = event.detail === 0;
    setOpen(true);
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = menuItems();
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = {
      ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    items[next]?.focus();
  };

  const flip = (index: number) => {
    const next = !isOn(index);
    setOwnChecked(toggles.map((_, i) => (i === index ? next : !!ownChecked[i])));
    toggles[index]?.onCheckedChange?.(next);
  };

  const pick = (next: string) => {
    setOwnValue(next);
    choice?.onValueChange?.(next);
  };

  return (
    <div
      {...props}
      ref={rootRef}
      className={cn('relative inline-flex items-start self-start', className)}
      onPointerEnter={onRootPointerEnter}
      onPointerLeave={onRootPointerLeave}
      onBlur={onRootBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={onTriggerClick}
        className="group flex min-h-7 cursor-pointer items-center gap-1.5 rounded-full px-1 py-2 text-sm font-medium tracking-wide uppercase outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        {icon}
        {label}
      </button>
      <div
        ref={panelRef}
        id={menuId}
        role="menu"
        aria-label={title}
        onKeyDown={onMenuKeyDown}
        className={cn(
          'invisible absolute top-0 z-20 w-64 px-1.5 py-2 opacity-0 will-change-transform',
          align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
        )}
      >
        <div
          ref={surfaceRef}
          aria-hidden="true"
          className="from-tween-ink-deep/85 to-tween-teal-deep/85 pointer-events-none absolute inset-0 rounded-3xl bg-linear-to-r shadow-[0_18px_40px_-18px_var(--color-tween-ink-deep)] backdrop-blur-md"
        >
          <span style={STROKE_STYLE} className="absolute inset-0 rounded-[inherit] opacity-60" />
        </div>
        <div ref={listRef} className="relative flex flex-col">
          <p
            aria-hidden="true"
            className="px-2.5 py-1.5 text-xs tracking-wide text-white/45 uppercase"
          >
            {title}
          </p>
          {toggles.map((toggle, index) => (
            <button
              key={toggle.label}
              type="button"
              role="menuitemcheckbox"
              aria-checked={isOn(index)}
              tabIndex={-1}
              onClick={() => flip(index)}
              className={ROW_CLASS}
            >
              {toggle.icon}
              <span className="flex-1">{toggle.label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 motion-reduce:transition-none',
                  isOn(index) ? 'bg-tween-lime' : 'bg-white/20'
                )}
              >
                <span
                  className={cn(
                    'ease-tween-spring absolute top-0.5 left-0.5 size-4 rounded-full transition-transform duration-300 motion-reduce:transition-none',
                    isOn(index) ? 'bg-tween-ink translate-x-4' : 'bg-white'
                  )}
                />
              </span>
            </button>
          ))}
          {choice && (
            <>
              <div role="separator" className="mx-2.5 my-1 h-px bg-white/15" />
              <div role="group" aria-label={choice.label}>
                <p
                  aria-hidden="true"
                  className="px-2.5 py-1.5 text-xs tracking-wide text-white/45 uppercase"
                >
                  {choice.label}
                </p>
                {choice.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={value === option.value}
                    tabIndex={-1}
                    onClick={() => pick(option.value)}
                    className={ROW_CLASS}
                  >
                    {option.icon}
                    <span className="flex-1">{option.label}</span>
                    {option.hint && (
                      <span className="text-tween-lime/80 text-[10px] tracking-wide uppercase">
                        {option.hint}
                      </span>
                    )}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'bg-tween-lime size-1.5 shrink-0 rounded-full transition-transform duration-200 motion-reduce:transition-none',
                        value === option.value ? 'scale-100' : 'scale-0'
                      )}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPopup;
