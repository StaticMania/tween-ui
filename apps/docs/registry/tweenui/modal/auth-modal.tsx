'use client';

import { useCallback, useEffect, useRef, type FormEvent } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { createPortal } from 'react-dom';

gsap.registerPlugin(useGSAP);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PROVIDERS = [
  {
    id: 'google',
    label: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M21.7541 12.2199C21.7541 11.4182 21.6878 10.8332 21.5441 10.2266H12.2031V13.8449H17.6861C17.5756 14.744 16.9786 16.0982 15.6521 17.0082L15.6335 17.1293L18.5869 19.3715L18.7915 19.3916C20.6708 17.6907 21.7541 15.1882 21.7541 12.2199Z"
        />
        <path
          fill="#34A853"
          d="M12.2002 21.7514C14.8864 21.7514 17.1415 20.8847 18.7886 19.3897L15.6492 17.0063C14.8091 17.5805 13.6815 17.9813 12.2002 17.9813C9.56932 17.9813 7.33635 16.2805 6.54036 13.9297L6.42369 13.9394L3.35266 16.2686L3.3125 16.378C4.94853 19.563 8.30907 21.7514 12.2002 21.7514Z"
        />
        <path
          fill="#FBBC05"
          d="M6.53907 13.9306C6.32904 13.3239 6.20749 12.6739 6.20749 12.0023C6.20749 11.3305 6.32904 10.6806 6.52802 10.0739L6.52246 9.94471L3.41294 7.57812L3.3112 7.62555C2.63691 8.94723 2.25 10.4314 2.25 12.0023C2.25 13.5731 2.63691 15.0572 3.3112 16.3789L6.53907 13.9306Z"
        />
        <path
          fill="#EB4335"
          d="M12.2003 6.01997C14.0685 6.01997 15.3286 6.8108 16.0472 7.47168L18.855 4.785C17.1306 3.21417 14.8865 2.25 12.2003 2.25C8.3091 2.25 4.94854 4.43832 3.3125 7.62329L6.52933 10.0717C7.33638 7.72083 9.56936 6.01997 12.2003 6.01997Z"
        />
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Apple',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          fill="#12161F"
          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
        />
      </svg>
    ),
  },
  {
    id: 'microsoft',
    label: 'Microsoft',
    icon: (
      <svg viewBox="0 0 88 88" className="size-4.5" aria-hidden="true">
        <path fill="#f35325" d="M0 0h42v42H0z" />
        <path fill="#81bc06" d="M46 0h42v42H46z" />
        <path fill="#05a6f0" d="M0 46h42v42H0z" />
        <path fill="#ffba08" d="M46 46h42v42H46z" />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path
          fill="#12161F"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    ),
  },
  {
    id: 'x',
    label: 'X',
    icon: (
      <svg viewBox="0 0 24 24" className="size-5 fill-none" aria-hidden="true">
        <path
          d="M19.2955 5 13.1929 11.2933M11.1136 13.4375 4.75 20M4.75 5 16.1136 20H19.75L8.38636 5H4.75Z"
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onProvider?: (id: string) => void;
  onEmail?: (email: string) => void;
}

export default function AuthModal({ open, onClose, onProvider, onEmail }: AuthModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const items = () =>
    panelRef.current
      ? [...panelRef.current.querySelectorAll<HTMLElement>('[data-auth-modal-item]')]
      : [];

  const close = useCallback(() => {
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    const nodes = items();

    if (!backdrop || !panel || prefersReducedMotion()) {
      onClose();
      return;
    }

    gsap.killTweensOf([backdrop, panel, ...nodes]);
    gsap
      .timeline({ onComplete: onClose })
      .to(nodes, { opacity: 0, y: 8, duration: 0.12, stagger: 0.02, ease: 'power1.in' })
      .to(panel, { opacity: 0, y: 16, scale: 0.96, duration: 0.18, ease: 'power2.in' }, '-=0.06')
      .to(backdrop, { opacity: 0, duration: 0.16, ease: 'power2.in' }, '-=0.1');
  }, [onClose]);

  useGSAP(
    () => {
      if (!open) return;
      const backdrop = backdropRef.current;
      const panel = panelRef.current;
      const nodes = items();
      if (!backdrop || !panel) return;

      if (prefersReducedMotion()) {
        gsap.set([backdrop, panel, ...nodes], { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.killTweensOf([backdrop, panel, ...nodes]);
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(panel, { opacity: 0, y: 28, scale: 0.94 });
      gsap.set(nodes, { opacity: 0, y: 16 });
      gsap
        .timeline()
        .to(backdrop, { opacity: 1, duration: 0.22, ease: 'power2.out' })
        .to(panel, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'power3.out' }, '-=0.08')
        .to(
          nodes,
          { opacity: 1, y: 0, duration: 0.28, stagger: 0.045, ease: 'power2.out' },
          '-=0.18'
        );
    },
    { dependencies: [open] }
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get('email');
    if (typeof email === 'string') onEmail?.(email.trim());
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-[#045f64]/35 backdrop-blur-[14px] motion-reduce:opacity-100"
        onClick={close}
      />
      <div
        ref={panelRef}
        data-auth-modal-panel
        className="relative z-10 w-full max-w-[360px] rounded-3xl border-2 border-[#045f64] bg-white p-6 motion-reduce:opacity-100"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          data-auth-modal-item
          onClick={close}
          aria-label="Close auth modal"
          className="absolute top-4 right-4 z-20 flex size-8 cursor-pointer items-center justify-center rounded-full bg-[#045f64]/10 text-[#045f64] transition-colors hover:text-[#045f64]/70 motion-reduce:transition-none"
        >
          <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div data-auth-modal-item className="mb-7 text-center">
          <h2 id="auth-modal-title" className="text-xl font-medium text-[#045f64]">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-[#045f64]/60">Sign in to your account to continue</p>
        </div>

        <div data-auth-modal-item className="mb-7 grid grid-cols-5 gap-2.5">
          {PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              type="button"
              aria-label={`Continue with ${provider.label}`}
              onClick={() => onProvider?.(provider.id)}
              className="flex h-10 w-full items-center justify-center rounded-2xl bg-[#045f64]/10 transition-transform hover:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              {provider.icon}
            </button>
          ))}
        </div>

        <div data-auth-modal-item className="mb-6 flex items-center gap-2">
          <span className="h-px w-full bg-[#045f64]/10" />
          <span className="shrink-0 text-xs text-[#045f64]/50">Or continue with email</span>
          <span className="h-px w-full bg-[#045f64]/10" />
        </div>

        <form data-auth-modal-item className="space-y-4" onSubmit={submit}>
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 fill-none stroke-[#045f64]/70"
              aria-hidden="true"
            >
              <path
                d="M3 7l9 6 9-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="h-11 w-full rounded-full border border-[#045f64]/10 bg-white pr-12 pl-10 text-sm text-[#045f64] outline-none placeholder:text-[#045f64]/50 focus-visible:ring-2 focus-visible:ring-[#045f64]"
            />
            <button
              type="submit"
              aria-label="Continue with email"
              className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#045f64] text-[#c6f56f] transition-transform hover:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5 fill-none stroke-current"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </form>

        <p data-auth-modal-item className="mt-6 text-center text-xs text-[#045f64]/40">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>,
    document.body
  );
}
