'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type SubmitEvent,
} from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

const OPEN = 0.56;
const CLOSE = 0.34;
const RADIUS = 28;
const CLIP_SHUT = `inset(50% 50% 50% 50% round ${RADIUS}px)`;
const CLIP_OPEN = `inset(0% 0% 0% 0% round ${RADIUS}px)`;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPRING_EASE = 'ease-[cubic-bezier(0.34,1.56,0.64,1)]';

// Bright underline grows from the left on focus over a dim one.
const FIELD_CLASS =
  'ml-2 mr-0.5 inline-block min-w-[5ch] max-w-full bg-transparent bg-[linear-gradient(#c6f56f,#c6f56f),linear-gradient(#c6f56f73,#c6f56f73)] bg-[length:0%_2px,100%_2px] bg-[position:100%_100%,0_100%] bg-no-repeat px-0.5 pb-0.5 align-baseline [field-sizing:content] text-white outline-none transition-[background-size] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[#9fd4d6]/55 focus:bg-[length:100%_2px,100%_2px] focus:bg-[position:0_100%,0_100%] aria-invalid:bg-[linear-gradient(#ffb4a8,#ffb4a8),linear-gradient(#ffb4a8,#ffb4a8)] motion-reduce:transition-none';

// Leading edge pulls hard, trailing edge lags: the pill stretches as it travels.
const LEAD = 520;
const TRAIL = 170;

type Spring = { x: number; v: number; t: number };
type Pill = { left: Spring; right: Spring; top: Spring; bottom: Spring };

const spring = (): Spring => ({ x: 0, v: 0, t: 0 });
const pill = (): Pill => ({ left: spring(), right: spring(), top: spring(), bottom: spring() });
const edges = (p: Pill) => [p.left, p.right, p.top, p.bottom];

const stepSpring = (s: Spring, stiffness: number, dt: number) => {
  s.v += (stiffness * (s.t - s.x) - 2 * Math.sqrt(stiffness) * s.v) * dt;
  s.x += s.v * dt;
};

const pulls = (start: Spring, end: Spring) => {
  const heading = start.t + end.t - start.x - end.x;
  return [heading > 1 ? TRAIL : LEAD, heading < -1 ? TRAIL : LEAD] as const;
};

const stepPill = (p: Pill, dt: number) => {
  const [left, right] = pulls(p.left, p.right);
  const [top, bottom] = pulls(p.top, p.bottom);
  stepSpring(p.left, left, dt);
  stepSpring(p.right, right, dt);
  stepSpring(p.top, top, dt);
  stepSpring(p.bottom, bottom, dt);
};

const aim = (p: Pill, chip: HTMLElement, instant: boolean) => {
  p.left.t = chip.offsetLeft;
  p.right.t = chip.offsetLeft + chip.offsetWidth;
  p.top.t = chip.offsetTop;
  p.bottom.t = chip.offsetTop + chip.offsetHeight;
  if (!instant) return;
  for (const s of edges(p)) {
    s.x = s.t;
    s.v = 0;
  }
};

const atRest = (p: Pill) =>
  edges(p).every((s) => Math.abs(s.t - s.x) < 0.05 && Math.abs(s.v) < 0.05);

const drawPill = (el: HTMLElement | null, p: Pill) => {
  if (!el) return;
  el.style.transform = `translate3d(${p.left.x}px,${p.top.x}px,0)`;
  el.style.width = `${Math.max(0, p.right.x - p.left.x)}px`;
  el.style.height = `${Math.max(0, p.bottom.x - p.top.x)}px`;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scale that shrinks the panel down to the button it grew from.
const tucked = (trigger: HTMLElement, panel: HTMLElement) => ({
  scaleX: trigger.offsetWidth / panel.offsetWidth,
  scaleY: trigger.offsetHeight / panel.offsetHeight,
});

// Counter-scales the radius so corners stay RADIUS while the panel scales.
const keepCorners = (panel: HTMLElement, surface: HTMLElement) => () => {
  const sx = Number(gsap.getProperty(panel, 'scaleX')) || 1;
  const sy = Number(gsap.getProperty(panel, 'scaleY')) || 1;
  surface.style.borderRadius = `${RADIUS / sx}px / ${RADIUS / sy}px`;
};

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

// `size` is the width fallback where `field-sizing: content` isn't supported.
const fieldSize = (value: string, placeholder: string) => (value || placeholder).length;

export interface CtaContactMessage {
  name: string;
  email: string;
  topic: string;
  details: string;
}

export interface CtaContactMorphProps extends ComponentPropsWithoutRef<'section'> {
  buttonLabel?: string;
  topics?: string[];
  replyTime?: string;
  onSend?: (message: CtaContactMessage) => void | Promise<void>;
}

type Status = 'idle' | 'sending' | 'sent';
type FieldError = { field?: 'name' | 'email'; text: string };

interface TopicPickerProps {
  name: string;
  topics: string[];
  value: string;
  onChange: (topic: string) => void;
}

const TopicPicker = ({ name, topics, value, onChange }: TopicPickerProps) => {
  const groupRef = useRef<HTMLSpanElement>(null);
  const selectedRef = useRef<HTMLSpanElement>(null);
  const hoverRef = useRef<HTMLSpanElement>(null);
  const chips = useRef<(HTMLSpanElement | null)[]>([]);
  const motion = useRef({ selected: pill(), hover: pill(), placed: false, hovering: -1 });
  const ticking = useRef(false);
  const selectedIndex = Math.max(0, topics.indexOf(value));
  const selectedNow = useRef(selectedIndex);
  selectedNow.current = selectedIndex;

  const draw = () => {
    drawPill(selectedRef.current, motion.current.selected);
    drawPill(hoverRef.current, motion.current.hover);
  };

  // The ticker only runs while a pill is moving.
  const tick = useRef((_time: number, deltaTime: number) => {
    const m = motion.current;
    const elapsed = Math.min(deltaTime / 1000, 0.05);
    const steps = Math.max(1, Math.ceil(elapsed * 120));
    for (let step = 0; step < steps; step += 1) {
      stepPill(m.selected, elapsed / steps);
      stepPill(m.hover, elapsed / steps);
    }
    draw();
    if (atRest(m.selected) && atRest(m.hover)) {
      gsap.ticker.remove(tick.current);
      ticking.current = false;
    }
  });

  const moveTo = (p: Pill, index: number, instant: boolean) => {
    const chip = chips.current[index];
    if (!chip) return;
    aim(p, chip, instant || prefersReducedMotion());
    draw();
    if (!ticking.current) {
      ticking.current = true;
      gsap.ticker.add(tick.current);
    }
  };

  useEffect(() => {
    const stop = tick.current;
    // Rewrapped chips jump the pills to their new spots.
    const group = groupRef.current;
    const resize =
      typeof ResizeObserver === 'undefined' || !group
        ? null
        : new ResizeObserver(() => {
            const m = motion.current;
            const chip = chips.current[selectedNow.current];
            if (chip) aim(m.selected, chip, true);
            const hovered = chips.current[m.hovering];
            if (hovered) aim(m.hover, hovered, true);
            draw();
          });
    if (group) resize?.observe(group);
    return () => {
      resize?.disconnect();
      gsap.ticker.remove(stop);
      ticking.current = false;
    };
  }, []);

  useEffect(() => {
    const m = motion.current;
    moveTo(m.selected, selectedIndex, !m.placed);
    m.placed = true;
  }, [selectedIndex]);

  const hoverOn = (index: number) => {
    const m = motion.current;
    // From outside the row it appears in place; across the row it slides.
    moveTo(m.hover, index, m.hovering < 0);
    m.hovering = index;
    if (hoverRef.current) hoverRef.current.style.opacity = '1';
  };

  const hoverOff = () => {
    motion.current.hovering = -1;
    if (hoverRef.current) hoverRef.current.style.opacity = '0';
  };

  return (
    <span
      ref={groupRef}
      role="radiogroup"
      aria-label="What you need help with"
      onPointerLeave={hoverOff}
      className="relative -mt-0.5 flex flex-wrap gap-1.5"
    >
      <span
        ref={hoverRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-200 motion-reduce:transition-none"
      />
      <span
        ref={selectedRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 rounded-full bg-[#c6f56f]"
      />
      {topics.map((topic, index) => (
        <label
          key={topic}
          className="cursor-pointer"
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') hoverOn(index);
          }}
        >
          <input
            type="radio"
            name={name}
            value={topic}
            checked={value === topic}
            onChange={() => onChange(topic)}
            className="peer sr-only"
          />
          <span
            ref={(el) => {
              chips.current[index] = el;
            }}
            className="relative inline-block rounded-full border border-[#9fd4d6]/30 px-3 py-0.5 text-base leading-7 text-[#e8f3f2] transition-[color,border-color] duration-200 peer-checked:border-transparent peer-checked:text-[#0b3b3e] peer-focus-visible:ring-2 peer-focus-visible:ring-[#c6f56f] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#0b3b3e] motion-reduce:transition-none"
          >
            {topic}
          </span>
        </label>
      ))}
    </span>
  );
};

const CtaContactMorph = ({
  buttonLabel = 'Write us a message',
  topics = ['a website', 'a brand', 'an app', 'something else'],
  replyTime = 'We reply within one working day.',
  onSend = () => wait(900),
  className,
  ...props
}: CtaContactMorphProps) => {
  const ids = useId();
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const live = useRef(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<FieldError | null>(null);
  const [message, setMessage] = useState<CtaContactMessage>({
    name: '',
    email: '',
    topic: '',
    details: '',
  });

  // Falls back to the first topic, and stays valid if `topics` changes.
  const topic = topics.includes(message.topic) ? message.topic : (topics[0] ?? '');
  const sent = status === 'sent';

  const close = (refocus = false) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  useGSAP(
    () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      const surface = surfaceRef.current;
      const form = formRef.current;
      const shadow = shadowRef.current;
      if (!trigger || !panel || !surface || !form || !shadow) return;
      timeline.current?.kill();

      if (prefersReducedMotion()) {
        live.current = open;
        gsap.set(trigger, { opacity: open ? 0 : 1 });
        gsap.set(panel, { autoAlpha: open ? 1 : 0, scaleX: 1, scaleY: 1 });
        gsap.set(surface, { scaleX: 1, scaleY: 1, borderRadius: RADIUS });
        gsap.set(form, { clipPath: 'none', opacity: 1 });
        gsap.set(shadow, { opacity: open ? 1 : 0 });
        return;
      }

      if (open) {
        // Reopening mid-close carries on from where the panel is.
        if (!live.current) {
          gsap.set(panel, tucked(trigger, panel));
          gsap.set(surface, { scaleX: 0.86, scaleY: 1.14 });
          gsap.set(form, { clipPath: CLIP_SHUT, opacity: 0 });
        }
        live.current = true;
        gsap.set(panel, { autoAlpha: 1 });
        const corners = keepCorners(panel, surface);
        corners();

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
                '45%': { scaleX: 1.05, scaleY: 0.95 },
                '70%': { scaleX: 0.985, scaleY: 1.015 },
                '100%': { scaleX: 1, scaleY: 1 },
                easeEach: 'back.out(1.7)',
              },
              duration: OPEN,
              ease: 'none',
            },
            0
          )
          .to(form, { clipPath: CLIP_OPEN, opacity: 1, duration: 0.4, ease: 'power1.out' }, 0.06)
          // The shadow waits for the panel to settle: painting a large blurred
          // shadow while the panel scales stalls the first open by ~100ms.
          .to(shadow, { opacity: 1, duration: 0.3, ease: 'power1.out' }, OPEN * 0.85);
        return;
      }

      if (!live.current) {
        gsap.set(panel, { autoAlpha: 0 });
        return;
      }

      const corners = keepCorners(panel, surface);
      timeline.current = gsap
        .timeline({
          onComplete: () => {
            live.current = false;
            gsap.set(panel, { autoAlpha: 0 });
          },
        })
        .to(form, { clipPath: CLIP_SHUT, opacity: 0, duration: 0.2, ease: 'power1.in' }, 0)
        .to(shadow, { opacity: 0, duration: 0.1 }, 0)
        .to(
          panel,
          { ...tucked(trigger, panel), duration: CLOSE, ease: 'back.in(1.7)', onUpdate: corners },
          0
        )
        .to(trigger, { opacity: 1, duration: 0.14 }, CLOSE * 0.7);
    },
    { scope: rootRef, dependencies: [open] }
  );

  useEffect(() => {
    if (!open) return;
    nameRef.current?.focus({ preventScroll: true });

    // Only Escape pressed inside the panel closes it.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && panelRef.current?.contains(document.activeElement)) {
        close(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const update = (field: keyof CtaContactMessage) => (value: string) => {
    setMessage((current) => ({ ...current, [field]: value }));
    if (error?.field === field) setError(null);
  };

  const submit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const name = message.name.trim();
    const email = message.email.trim();
    if (!name) {
      setError({ field: 'name', text: 'Add your name so we know who to reply to.' });
      nameRef.current?.focus();
      return;
    }
    if (!EMAIL.test(email)) {
      setError({ field: 'email', text: 'Add an email address we can reply to.' });
      emailRef.current?.focus();
      return;
    }
    setError(null);
    setStatus('sending');
    try {
      await onSend({ ...message, name, email, topic });
      setStatus('sent');
      close(true);
    } catch {
      setStatus('idle');
      setError({ text: 'Your message didn’t send. Check your connection and try again.' });
      // If the panel was closed while sending, bring it back to show the error.
      setOpen(true);
    }
  };

  // Points a field at the error line only when the error is about it.
  const describedBy = (field: 'name' | 'email') =>
    error && (!error.field || error.field === field) ? `${ids}-error` : undefined;

  return (
    <section
      {...props}
      ref={rootRef}
      data-cta-contact-morph
      className={cn('w-full px-4 py-16 md:py-24', className)}
    >
      {/* Button and panel share one grid cell, so the block always keeps the
          open panel's size and nothing around it moves. */}
      <div className="mx-auto grid w-full max-w-[30rem] place-items-center">
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup={sent ? undefined : 'dialog'}
          aria-expanded={sent ? undefined : open}
          aria-controls={sent ? undefined : `${ids}-panel`}
          aria-disabled={sent || undefined}
          onClick={() => {
            if (!sent) setOpen(true);
          }}
          className={cn(
            'group/trigger inline-flex h-14 items-center gap-4 rounded-full pr-2 pl-6 text-base font-medium transition-colors duration-200 outline-none [grid-area:1/1] focus-visible:ring-2 focus-visible:ring-[#045f64] focus-visible:ring-offset-2 motion-reduce:transition-none',
            sent
              ? 'cursor-default bg-[#c6f56f] text-[#0b3b3e]'
              : 'cursor-pointer bg-[#045f64] text-[#c6f56f] hover:bg-[#034e52]'
          )}
        >
          {sent ? 'Message sent' : buttonLabel}
          <span
            aria-hidden="true"
            className={cn(
              'grid size-10 place-items-center rounded-full transition-transform duration-500 motion-reduce:transition-none',
              SPRING_EASE,
              sent
                ? 'bg-[#0b3b3e] text-[#c6f56f]'
                : 'bg-[#c6f56f] text-[#045f64] group-hover/trigger:scale-110'
            )}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                'size-5 transition-transform duration-500 motion-reduce:transition-none',
                SPRING_EASE,
                !sent && 'group-hover/trigger:-translate-y-px group-hover/trigger:-rotate-12'
              )}
            >
              {sent ? (
                <path d="m5 12.5 4.5 4.5L19 7.5" strokeWidth="2.4" />
              ) : (
                <>
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="m3.5 7 7.4 5.3a1.9 1.9 0 0 0 2.2 0L20.5 7" />
                </>
              )}
            </svg>
          </span>
        </button>

        <div
          ref={panelRef}
          id={`${ids}-panel`}
          role="dialog"
          aria-labelledby={`${ids}-title`}
          className="invisible relative z-10 w-full opacity-0 will-change-transform [grid-area:1/1]"
        >
          <div
            ref={shadowRef}
            aria-hidden="true"
            className="absolute inset-0 rounded-[28px] opacity-0 shadow-[0_40px_70px_-40px_#03110f]"
          />
          <div
            ref={surfaceRef}
            aria-hidden="true"
            className="absolute inset-0 rounded-[28px] bg-[#0b3b3e] ring-1 ring-white/10 ring-inset"
          />
          <form
            ref={formRef}
            noValidate
            onSubmit={submit}
            className="relative p-6 text-[#e8f3f2] md:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <p id={`${ids}-title`} className="flex items-center gap-3 font-medium">
                <span aria-hidden="true" className="size-2 rounded-full bg-[#c6f56f]" />
                {buttonLabel}
              </p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => close(true)}
                className="group grid size-9 cursor-pointer place-items-center rounded-full text-[#9fd4d6] transition-colors duration-200 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c6f56f] motion-reduce:transition-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4.5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-360 motion-reduce:transition-none"
                >
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <p className="mt-7 flex flex-col gap-3 text-xl leading-snug md:text-2xl">
              <span>
                Hi, I’m
                <input
                  ref={nameRef}
                  value={message.name}
                  onChange={(event) => update('name')(event.target.value)}
                  aria-label="Your name"
                  aria-invalid={error?.field === 'name' || undefined}
                  aria-describedby={describedBy('name')}
                  autoComplete="name"
                  placeholder="your name"
                  size={fieldSize(message.name, 'your name')}
                  className={FIELD_CLASS}
                />
                .
              </span>
              {topics.length > 0 && (
                <>
                  <span>I need help with</span>
                  <TopicPicker
                    name={`${ids}-topic`}
                    topics={topics}
                    value={topic}
                    onChange={update('topic')}
                  />
                </>
              )}
              <span>
                Reach me at
                <input
                  ref={emailRef}
                  type="email"
                  value={message.email}
                  onChange={(event) => update('email')(event.target.value)}
                  aria-label="Your email"
                  aria-invalid={error?.field === 'email' || undefined}
                  aria-describedby={describedBy('email')}
                  autoComplete="email"
                  placeholder="you@company.com"
                  size={fieldSize(message.email, 'you@company.com')}
                  className={FIELD_CLASS}
                />
                .
              </span>
            </p>

            <label className="mt-6 block text-sm text-[#9fd4d6]">
              Anything we should know first? It’s optional.
              <textarea
                value={message.details}
                onChange={(event) => update('details')(event.target.value)}
                rows={2}
                placeholder="Timeline, budget, a link to what you have now"
                className="mt-2 block w-full resize-none rounded-2xl border border-[#9fd4d6]/20 bg-white/5 px-4 py-3 text-base text-white transition-colors duration-200 outline-none placeholder:text-[#9fd4d6]/45 focus:border-[#c6f56f]/70 motion-reduce:transition-none"
              />
            </label>

            <p id={`${ids}-error`} role="alert" className="mt-3 min-h-5 text-sm text-[#ffb4a8]">
              {error?.text}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-[#9fd4d6]">{replyTime}</p>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex h-12 cursor-pointer items-center rounded-full bg-[#c6f56f] px-6 font-medium text-[#0b3b3e] transition-transform duration-200 outline-none hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-70 motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <p role="status" className="sr-only">
        {sent ? `Message sent. ${replyTime}` : ''}
      </p>
    </section>
  );
};

export default CtaContactMorph;
